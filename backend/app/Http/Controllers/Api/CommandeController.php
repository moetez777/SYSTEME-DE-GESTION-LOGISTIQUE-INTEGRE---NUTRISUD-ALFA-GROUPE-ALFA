<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Models\StockAliment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommandeController extends Controller
{
    /**
     * GET /api/commandes
     * Filtré selon le rôle de l'utilisateur connecté
     */
    public function index(Request $request)
    {
        $user  = $request->user();
        $query = Commande::with(['centreElevage.societeElevage', 'produit', 'societeAliment', 'livraison']);

        if ($user->hasRole('centre')) {
            // Le responsable centre ne voit que les commandes de son centre.
            // Si le compte n'est pas rattaché, on renvoie une liste vide pour éviter toute fuite.
            if (!$user->entity_id) {
                $query->whereRaw('1 = 0');
            } else {
                $query->where('centre_elevage_id', $user->entity_id);
            }
        } elseif ($user->hasRole('usine')) {
            // L'usine voit strictement les commandes de sa société aliment.
            if (!$user->entity_id) {
                $query->whereRaw('1 = 0');
            } else {
                $query->where('societe_aliment_id', $user->entity_id);
            }
        }

        return response()->json($query->orderByDesc('created_at')->get());
    }

    /**
     * POST /api/commandes
     * Le Centre crée une commande
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->hasRole('centre') && !$user->entity_id) {
            return response()->json([
                'message' => 'Votre compte centre n\'est pas encore rattaché à un centre d\'élevage. Contactez l\'administrateur.',
            ], 422);
        }

        $data = $request->validate([
            'produit_id'         => 'required|exists:produits,id',
            'quantite'           => 'required|integer|min:1',
            'unite'              => 'sometimes|string',
            'societe_aliment_id' => 'required|exists:societes_aliment,id',
            'notes'              => 'nullable|string',
        ]);

        $data['centre_elevage_id'] = $user->entity_id;
        $data['statut']            = Commande::STATUT_NOUVELLE;
        $data['date_commande']     = now();

        $commande = Commande::create($data);

        return response()->json($commande->load(['produit', 'centreElevage']), 201);
    }

    /**
     * PUT /api/commandes/{id}/status
     * L'usine met à jour le statut de la commande
     */
    public function updateStatus(Request $request, Commande $commande)
    {
        $user = $request->user();

        $data = $request->validate([
            'statut' => 'required|in:en_cours,confirmee,refusee',
            'notes'  => 'nullable|string',
        ]);

        // Seule l'usine peut modifier le statut
        if (!$user->hasRole('usine') && !$user->hasRole('admin')) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        DB::transaction(function () use ($commande, $data, $user) {
            $commande->societe_aliment_id = $commande->societe_aliment_id ?? $user->entity_id;
            $commande->statut             = $data['statut'];
            $commande->notes              = $data['notes'] ?? $commande->notes;
            $commande->date_traitement    = now();

            if ($data['statut'] === Commande::STATUT_CONFIRMEE) {
                $commande->date_confirmation = now();

                // Retirer du stock de l'usine si stock disponible
                if ($commande->societe_aliment_id) {
                    $stock = StockAliment::where('societe_aliment_id', $commande->societe_aliment_id)
                        ->where('produit_id', $commande->produit_id)
                        ->first();

                    if ($stock) {
                        $stock->retirerStock($commande->quantite);
                    }
                }
            }

            $commande->save();
        });

        return response()->json([
            'message'  => 'Statut mis à jour.',
            'commande' => $commande->load(['centreElevage', 'produit', 'societeAliment']),
        ]);
    }

    /**
     * PUT /api/commandes/{id}/annuler
     * Le Centre annule sa commande (si encore possible)
     */
    public function annuler(Request $request, Commande $commande)
    {
        $user = $request->user();

        if ($user->hasRole('centre') && !$user->entity_id) {
            return response()->json(['message' => 'Compte centre non rattaché. Contactez l\'administrateur.'], 422);
        }

        // Vérifier que le centre est propriétaire de cette commande
        if ($user->hasRole('centre') && $commande->centre_elevage_id !== $user->entity_id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        if (!$commande->peutEtreAnnulee()) {
            return response()->json([
                'message' => 'Cette commande ne peut plus être annulée (statut: ' . $commande->statut . ').',
            ], 422);
        }

        $commande->update(['statut' => Commande::STATUT_ANNULEE]);

        return response()->json(['message' => 'Commande annulée.', 'commande' => $commande]);
    }

    /** GET /api/commandes/{id} */
    public function show(Commande $commande)
    {
        return response()->json($commande->load(['centreElevage.societeElevage', 'produit', 'societeAliment', 'livraison.chauffeur', 'livraison.camion']));
    }
}
