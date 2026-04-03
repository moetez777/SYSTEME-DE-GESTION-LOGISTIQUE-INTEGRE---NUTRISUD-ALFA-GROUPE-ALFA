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
        $stats = [
            'commandes' => [
                'total'     => Commande::count(),
                'nouvelle'  => Commande::where('statut', 'nouvelle')->count(),
                'en_cours'  => Commande::where('statut', 'en_cours')->count(),
                'confirmee' => Commande::where('statut', 'confirmee')->count(),
                'refusee'   => Commande::where('statut', 'refusee')->count(),
                'annulee'   => Commande::where('statut', 'annulee')->count(),
            ],
            'livraisons' => [
                'total'     => Livraison::count(),
                'planifiee' => Livraison::where('statut', 'planifiee')->count(),
                'en_cours'  => Livraison::where('statut', 'en_cours')->count(),
                'livree'    => Livraison::where('statut', 'livree')->count(),
            ],
            'utilisateurs' => User::count(),
            'societes_aliment' => SocieteAliment::count(),
            'centres_elevage'  => CentreElevage::count(),

            // Commandes des 6 derniers mois (pour graphique)
            'commandes_par_mois' => Commande::select(
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
