<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StockCentre;
use Illuminate\Http\Request;

class StockCentreController extends Controller
{
    /**
     * GET /api/stocks/centre
     * - Admin/Usine: tous; Centre: son centre uniquement
     */
    public function index(Request $request)
    {
        $user  = $request->user();
        $query = StockCentre::with(['produit', 'centreElevage.societeElevage']);

        if ($user->hasRole('centre') && $user->entity_id) {
            $query->where('centre_elevage_id', $user->entity_id);
        }

        return response()->json($query->get());
    }

    /**
     * PUT /api/stocks/centre/{id}
     */
    public function update(Request $request, StockCentre $stockCentre)
    {
        $data = $request->validate([
            'quantite'      => 'required|integer|min:0',
            'seuil_alerte'  => 'sometimes|integer|min:0',
        ]);

        $stockCentre->update(array_merge($data, ['date_maj' => now()]));

        return response()->json([
            'message'     => 'Stock centre mis à jour.',
            'stock_centre'=> $stockCentre->load('produit'),
        ]);
    }
}
