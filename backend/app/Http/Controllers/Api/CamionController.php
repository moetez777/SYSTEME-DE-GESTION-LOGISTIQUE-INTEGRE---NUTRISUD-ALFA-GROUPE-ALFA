<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Camion;
use App\Models\SocieteTransport;
use Illuminate\Http\Request;

class CamionController extends Controller
{
    public function index(Request $request)
    {
        $user  = $request->user();
        $query = Camion::with('societeTransport');

        if ($user->hasRole('transport') && $user->entity_id) {
            $query->where('societe_transport_id', $user->entity_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'societe_transport_id' => 'required|exists:societes_transport,id',
            'immatriculation'      => 'required|string|unique:camions,immatriculation',
            'capacite'             => 'required|numeric|min:0',
            'type'                 => 'sometimes|string',
        ]);
        return response()->json(Camion::create($data), 201);
    }

    public function update(Request $request, Camion $camion)
    {
        $data = $request->validate([
            'immatriculation' => 'sometimes|string|unique:camions,immatriculation,' . $camion->id,
            'capacite'        => 'sometimes|numeric|min:0',
            'type'            => 'sometimes|string',
            'statut'          => 'sometimes|in:disponible,en_mission,maintenance',
        ]);
        $camion->update($data);
        return response()->json($camion);
    }

    public function destroy(Camion $camion)
    {
        $camion->delete();
        return response()->json(['message' => 'Camion supprimé.']);
    }
}
