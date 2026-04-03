<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StockAliment;
use App\Models\SocieteAliment;
use Illuminate\Http\Request;

class StockAlimentController extends Controller
{
    /**
     * GET /api/stocks/aliment
     * - Admin: tous les stocks
     * - Usine: stocks de sa societe uniquement
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = StockAliment::with(['produit', 'societeAliment']);

        if ($user->hasRole('usine') && $user->entity_id) {
            $query->where('societe_aliment_id', $user->entity_id);
        }

        return response()->json($query->get());
    }

    /**
     * POST /api/stocks/aliment/ajouter
     */
    public function ajouter(Request $request)
    {
        $data = $request->validate([
            'societe_aliment_id' => 'required|exists:societes_aliment,id',
            'produit_id'         => 'required|exists:produits,id',
            'quantite'           => 'required|integer|min:1',
        ]);

        $stock = StockAliment::firstOrCreate(
            ['societe_aliment_id' => $data['societe_aliment_id'], 'produit_id' => $data['produit_id']],
            ['quantite_dispo' => 0]
        );

        $stock->ajouterStock($data['quantite']);

        return response()->json([
            'message' => 'Stock ajouté avec succès.',
            'stock'   => $stock->load('produit'),
        ]);
    }

    /**
     * POST /api/stocks/aliment/retirer
     */
    public function retirer(Request $request)
    {
        $data = $request->validate([
            'societe_aliment_id' => 'required|exists:societes_aliment,id',
            'produit_id'         => 'required|exists:produits,id',
            'quantite'           => 'required|integer|min:1',
        ]);

        $stock = StockAliment::where('societe_aliment_id', $data['societe_aliment_id'])
            ->where('produit_id', $data['produit_id'])
            ->firstOrFail();

        if (!$stock->retirerStock($data['quantite'])) {
            return response()->json(['message' => 'Stock insuffisant.'], 422);
        }

        return response()->json([
            'message' => 'Stock retiré avec succès.',
            'stock'   => $stock->load('produit'),
        ]);
    }
}
