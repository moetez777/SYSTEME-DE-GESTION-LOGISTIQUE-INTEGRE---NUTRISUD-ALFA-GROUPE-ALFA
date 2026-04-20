<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Models\Livraison;
use App\Models\SocieteAliment;
use App\Models\CentreElevage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\RapportExport;
use Barryvdh\DomPDF\Facade\Pdf;

class DashboardController extends Controller
{
    /** GET /api/dashboard/stats */
    public function stats(Request $request)
    {
        $user = $request->user();

        $commandesQuery = Commande::query();
        $livraisonsQuery = Livraison::query();

        if ($user->hasRole('centre')) {
            if (!$user->entity_id) {
                $commandesQuery->whereRaw('1 = 0');
                $livraisonsQuery->whereRaw('1 = 0');
            } else {
                $commandesQuery->where('centre_elevage_id', $user->entity_id);
                $livraisonsQuery->whereHas('commande', function ($q) use ($user) {
                    $q->where('centre_elevage_id', $user->entity_id);
                });
            }
        } elseif ($user->hasRole('usine')) {
            if (!$user->entity_id) {
                $commandesQuery->whereRaw('1 = 0');
                $livraisonsQuery->whereRaw('1 = 0');
            } else {
                $commandesQuery->where('societe_aliment_id', $user->entity_id);
                $livraisonsQuery->whereHas('commande', function ($q) use ($user) {
                    $q->where('societe_aliment_id', $user->entity_id);
                });
            }
        }

        $totalCommandes    = (clone $commandesQuery)->count();
        $commandesNouvelle = (clone $commandesQuery)->where('statut', 'nouvelle')->count();
        $commandesEnCours  = (clone $commandesQuery)->where('statut', 'en_cours')->count();
        $commandesConf     = (clone $commandesQuery)->where('statut', 'confirmee')->count();
        $commandesRef      = (clone $commandesQuery)->where('statut', 'refusee')->count();
        $commandesAnn      = (clone $commandesQuery)->where('statut', 'annulee')->count();

        $totalLivraisons   = (clone $livraisonsQuery)->count();
        $livPlanifiee      = (clone $livraisonsQuery)->where('statut', 'planifiee')->count();
        $livEnCours        = (clone $livraisonsQuery)->where('statut', 'en_cours')->count();
        $livLivree         = (clone $livraisonsQuery)->where('statut', 'livree')->count();

        $stats = [
            'commandes' => [
                'total'     => $totalCommandes,
                'nouvelle'  => $commandesNouvelle,
                'en_cours'  => $commandesEnCours,
                'confirmee' => $commandesConf,
                'refusee'   => $commandesRef,
                'annulee'   => $commandesAnn,
            ],
            'livraisons' => [
                'total'     => $totalLivraisons,
                'planifiee' => $livPlanifiee,
                'en_cours'  => $livEnCours,
                'livree'    => $livLivree,
            ],
            'utilisateurs' => $user->hasRole('admin') ? User::count() : 0,
            'societes_aliment' => $user->hasRole('admin') ? SocieteAliment::count() : 0,
            'centres_elevage'  => $user->hasRole('admin') ? CentreElevage::count() : 0,

            // Clés attendues par les pages Centre/Usine
            'mes_commandes'         => $totalCommandes,
            'total_commandes'       => $totalCommandes,
            'commandes_nouvelles'   => $commandesNouvelle,
            'commandes_en_cours'    => $commandesEnCours,
            'commandes_confirmees'  => $commandesConf,
            'livraisons_en_cours'   => $livEnCours,
            'livraisons_livrees'    => $livLivree,
            'dernieres_commandes'   => (clone $commandesQuery)
                ->with(['produit'])
                ->latest()
                ->limit(5)
                ->get(),

            // Commandes des 6 derniers mois (pour graphique)
            'commandes_par_mois' => (clone $commandesQuery)
                ->select(
                    DB::raw('YEAR(created_at) as annee'),
                    DB::raw('MONTH(created_at) as mois'),
                    DB::raw('COUNT(*) as total')
                )
                ->where('created_at', '>=', now()->subMonths(6))
                ->groupBy('annee', 'mois')
                ->orderBy('annee')
                ->orderBy('mois')
                ->get(),
        ];

        return response()->json($stats);
    }

    /** GET /api/reports/export?format=pdf|excel */
    public function export(Request $request)
    {
        $format = $request->query('format', 'excel');

        $commandes = Commande::with(['centreElevage', 'produit', 'societeAliment', 'livraison'])
            ->orderByDesc('created_at')
            ->get();

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('reports.commandes', compact('commandes'));
            return $pdf->download('rapport_commandes_' . date('Y-m-d') . '.pdf');
        }

        return Excel::download(new RapportExport($commandes), 'rapport_' . date('Y-m-d') . '.xlsx');
    }
}
