<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Camion;
use Illuminate\Http\Request;

class CamionController extends Controller
{
    public function index(Request $request)
    {
        $user  = $request->user();
        $query = Camion::with('societeTransport');

        if ($user->hasRole('transport')) {
            if (!$user->entity_id) {
                return response()->json([]);
            }
            $query->where('societe_transport_id', $user->entity_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user->hasRole('transport')) {
            return response()->json(['message' => 'Non autorise.'], 403);
        }

        $data = $request->validate([
            'immatriculation'      => 'required|string|unique:camions,immatriculation',
            'capacite'             => 'required|numeric|min:0',
            'type'                 => 'sometimes|string',
            'societe_transport_id' => 'nullable|exists:societes_transport,id',
        ]);

        $societeTransportId = $user->entity_id ?: ($data['societe_transport_id'] ?? null);

        if (!$societeTransportId) {
            return response()->json([
                'message' => 'Selectionnez une societe de transport pour activer votre compte.',
                'errors'  => ['societe_transport_id' => ['Champ obligatoire pour un compte non rattache.']],
            ], 422);
        }

        if (!$user->entity_id) {
            $user->entity_id = $societeTransportId;
            $user->entity_type = 'societe_transport';
            $user->save();
        }

        $data['societe_transport_id'] = $societeTransportId;

        return response()->json(Camion::create($data), 201);
    }

    public function update(Request $request, Camion $camion)
    {
        $user = $request->user();

        if (!$user->hasRole('transport')) {
            return response()->json(['message' => 'Non autorise.'], 403);
        }

        if ((int) $camion->societe_transport_id !== (int) $user->entity_id) {
            return response()->json(['message' => 'Ce camion ne vous appartient pas.'], 403);
        }

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
        $user = request()->user();

        if (!$user->hasRole('transport')) {
            return response()->json(['message' => 'Non autorise.'], 403);
        }

        if ((int) $camion->societe_transport_id !== (int) $user->entity_id) {
            return response()->json(['message' => 'Ce camion ne vous appartient pas.'], 403);
        }

        $camion->delete();
        return response()->json(['message' => 'Camion supprimé.']);
    }
}
