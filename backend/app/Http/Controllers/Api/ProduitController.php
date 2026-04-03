<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produit;
use Illuminate\Http\Request;

class ProduitController extends Controller
{
    /** GET /api/produits */
    public function index()
    {
        return response()->json(Produit::where('actif', true)->orderBy('nom')->get());
    }

    /** POST /api/produits */
    public function store(Request $request)
    {
        $data = $request->validate([
            'nom'          => 'required|string|max:255',
            'type'         => 'required|string|max:100',
            'unite'        => 'required|string|max:20',
            'prix_unitaire'=> 'required|numeric|min:0',
            'description'  => 'nullable|string',
        ]);
        return response()->json(Produit::create($data), 201);
    }

    /** GET /api/produits/{id} */
    public function show(Produit $produit)
    {
        return response()->json($produit);
    }

    /** PUT /api/produits/{id} */
    public function update(Request $request, Produit $produit)
    {
        $data = $request->validate([
            'nom'          => 'sometimes|string|max:255',
            'type'         => 'sometimes|string|max:100',
            'unite'        => 'sometimes|string|max:20',
            'prix_unitaire'=> 'sometimes|numeric|min:0',
            'description'  => 'nullable|string',
            'actif'        => 'boolean',
        ]);
        $produit->update($data);
        return response()->json($produit);
    }

    /** DELETE /api/produits/{id} */
    public function destroy(Produit $produit)
    {
        $produit->update(['actif' => false]);
        return response()->json(['message' => 'Produit désactivé.']);
    }
}
