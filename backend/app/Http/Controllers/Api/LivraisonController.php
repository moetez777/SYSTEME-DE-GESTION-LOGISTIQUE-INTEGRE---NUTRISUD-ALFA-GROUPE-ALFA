<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Livraison;
use App\Models\Commande;
use App\Models\Camion;
use App\Models\Chauffeur;
use App\Models\StockCentre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LivraisonController extends Controller
{
    /**
     * GET /api/livraisons
     * - Transport: toutes ses livraisons
     * - Chauffeur: ses livraisons seulement
     * - Admin: tout
     */
    public function index(Request $request)
    {
        $user  = $request->user();
        $query = Livraison::with(['commande.produit', 'commande.centreElevage', 'camion', 'chauffeur', 'societeTransport']);

        if ($user->hasRole('transport') && $user->entity_id) {
            $query->where('societe_transport_id', $user->entity_id);
        } elseif ($user->hasRole('chauffeur') && $user->entity_id) {
            // entity_id = chauffeur_id pour ce rôle
            $query->where('chauffeur_id', $user->entity_id);
        }

        return response()->json($query->orderByDesc('created_at')->get());
    }

    /**
     * POST /api/livraisons
     * Transport crée une livraison depuis une commande confirmée
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'commande_id'        => 'required|exists:commandes,id',
            'destination'        => 'nullable|string',
            'date_depart_prevue' => 'nullable|date',
            'date_arrivee_prevue'=> 'nullable|date',
            'notes'              => 'nullable|string',
        ]);

        $commande = Commande::findOrFail($data['commande_id']);

        if ($commande->statut !== Commande::STATUT_CONFIRMEE) {
            return response()->json([
                'message' => 'Seules les commandes confirmées peuvent être livrées.',
            ], 422);
        }

        if ($commande->livraison()->exists()) {
            return response()->json([
                'message' => 'Une livraison existe déjà pour cette commande.',
            ], 422);
        }

        $livraison = DB::transaction(function () use ($data, $commande, $user) {
            return Livraison::create([
                'commande_id'         => $commande->id,
                'societe_transport_id'=> $user->entity_id,
                'destination'         => $data['destination'] ?? $commande->centreElevage->localisation,
                'quantite_livree'     => $commande->quantite,
                'date_depart_prevue'  => $data['date_depart_prevue'] ?? null,
                'date_arrivee_prevue' => $data['date_arrivee_prevue'] ?? null,
                'notes'               => $data['notes'] ?? null,
                'statut'              => Livraison::STATUT_PLANIFIEE,
            ]);
        });

        return response()->json($livraison->load(['commande.produit', 'commande.centreElevage']), 201);
    }

    /**
     * PUT /api/livraisons/{id}/assign
     * Affecter camion et chauffeur
     */
    public function assign(Request $request, Livraison $livraison)
    {
        $data = $request->validate([
            'camion_id'   => 'nullable|exists:camions,id',
            'chauffeur_id'=> 'nullable|exists:chauffeurs,id',
        ]);

        DB::transaction(function () use ($livraison, $data) {
            // Libérer l'ancien camion si changement
            if (isset($data['camion_id']) && $livraison->camion_id !== $data['camion_id']) {
                if ($livraison->camion_id) {
                    Camion::where('id', $livraison->camion_id)->update(['statut' => 'disponible']);
                }
                Camion::where('id', $data['camion_id'])->update(['statut' => 'en_mission']);
            }

            // Libérer l'ancien chauffeur
            if (isset($data['chauffeur_id']) && $livraison->chauffeur_id !== $data['chauffeur_id']) {
                if ($livraison->chauffeur_id) {
                    Chauffeur::where('id', $livraison->chauffeur_id)->update(['statut' => 'disponible']);
                }
                Chauffeur::where('id', $data['chauffeur_id'])->update(['statut' => 'en_mission']);
            }

            $livraison->update($data);
        });

        return response()->json([
            'message'  => 'Affectation mise à jour.',
            'livraison'=> $livraison->load(['camion', 'chauffeur']),
        ]);
    }

    /**
     * PUT /api/livraisons/{id}/status
     * Chauffeur met à jour le statut (en_cours → livree)
     */
    public function updateStatus(Request $request, Livraison $livraison)
    {
        $user = $request->user();

        $data = $request->validate([
            'statut' => 'required|in:en_cours,livree',
        ]);

        // Seul le chauffeur affecté (ou transport/admin) peut modifier
        if ($user->hasRole('chauffeur') && $livraison->chauffeur_id !== $user->entity_id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        DB::transaction(function () use ($livraison, $data) {
            if ($data['statut'] === Livraison::STATUT_EN_COURS) {
                $livraison->date_depart_reel = now();
            } elseif ($data['statut'] === Livraison::STATUT_LIVREE) {
                $livraison->date_arrivee_reel = now();

                // Libérer camion et chauffeur
                if ($livraison->camion_id) {
                    Camion::where('id', $livraison->camion_id)->update(['statut' => 'disponible']);
                }
                if ($livraison->chauffeur_id) {
                    Chauffeur::where('id', $livraison->chauffeur_id)->update(['statut' => 'disponible']);
                }

                // Mettre à jour le stock du centre (ajout)
                $commande = $livraison->commande;
                if ($commande) {
                    $stockCentre = StockCentre::firstOrCreate(
                        [
                            'centre_elevage_id' => $commande->centre_elevage_id,
                            'produit_id'        => $commande->produit_id,
                        ],
                        ['quantite' => 0]
                    );
                    $stockCentre->increment('quantite', $livraison->quantite_livree ?? $commande->quantite);
                    $stockCentre->date_maj = now();
                    $stockCentre->save();
                }
            }

            $livraison->statut = $data['statut'];
            $livraison->save();
        });

        return response()->json([
            'message'  => 'Statut livraison mis à jour.',
            'livraison'=> $livraison->load(['commande.produit', 'camion', 'chauffeur']),
        ]);
    }

    /** GET /api/livraisons/{id} */
    public function show(Livraison $livraison)
    {
        return response()->json($livraison->load([
            'commande.produit',
            'commande.centreElevage.societeElevage',
            'commande.societeAliment',
            'camion',
            'chauffeur',
            'societeTransport',
        ]));
    }
}
