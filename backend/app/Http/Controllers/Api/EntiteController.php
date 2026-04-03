<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SocieteAliment;
use App\Models\SocieteElevage;
use App\Models\CentreElevage;
use App\Models\SocieteTransport;
use Illuminate\Http\Request;

/**
 * Gestion des entités (sociétés) – accessible Admin
 */
class EntiteController extends Controller
{
    // ── Sociétés Aliment ────────────────────────────────────────

    public function societeAlimentIndex()
    {
        return response()->json(SocieteAliment::all());
    }

    public function societeAlimentStore(Request $request)
    {
        $data = $request->validate([
            'nom'          => 'required|string',
            'adresse'      => 'nullable|string',
            'telephone'    => 'nullable|string',
            'email'        => 'nullable|email',
            'capacite_prod'=> 'nullable|integer',
        ]);
        return response()->json(SocieteAliment::create($data), 201);
    }

    public function societeAlimentUpdate(Request $request, SocieteAliment $societeAliment)
    {
        $data = $request->validate([
            'nom'          => 'sometimes|string',
            'adresse'      => 'nullable|string',
            'telephone'    => 'nullable|string',
            'email'        => 'nullable|email',
            'capacite_prod'=> 'nullable|integer',
            'actif'        => 'boolean',
        ]);
        $societeAliment->update($data);
        return response()->json($societeAliment);
    }

    // ── Sociétés Élevage ────────────────────────────────────────

    public function societeElevageIndex()
    {
        return response()->json(SocieteElevage::with('centres')->get());
    }

    public function societeElevageStore(Request $request)
    {
        $data = $request->validate([
            'nom'      => 'required|string',
            'adresse'  => 'nullable|string',
            'telephone'=> 'nullable|string',
            'email'    => 'nullable|email',
        ]);
        return response()->json(SocieteElevage::create($data), 201);
    }

    // ── Centres Élevage ─────────────────────────────────────────

    public function centreIndex()
    {
        return response()->json(CentreElevage::with('societeElevage')->get());
    }

    public function centreStore(Request $request)
    {
        $data = $request->validate([
            'societe_elevage_id' => 'required|exists:societes_elevage,id',
            'nom'                => 'required|string',
            'localisation'       => 'nullable|string',
            'capacite'           => 'nullable|integer',
        ]);
        return response()->json(CentreElevage::create($data), 201);
    }

    // ── Sociétés Transport ──────────────────────────────────────

    public function societeTransportIndex()
    {
        return response()->json(SocieteTransport::with(['camions', 'chauffeurs'])->get());
    }

    public function societeTransportStore(Request $request)
    {
        $data = $request->validate([
            'nom'      => 'required|string',
            'adresse'  => 'nullable|string',
            'telephone'=> 'nullable|string',
            'email'    => 'nullable|email',
        ]);
        return response()->json(SocieteTransport::create($data), 201);
    }
}
