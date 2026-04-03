<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chauffeur;
use Illuminate\Http\Request;

class ChauffeurController extends Controller
{
    public function index(Request $request)
    {
        $user  = $request->user();
        $query = Chauffeur::with('societeTransport');

        if ($user->hasRole('transport') && $user->entity_id) {
            $query->where('societe_transport_id', $user->entity_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'societe_transport_id' => 'required|exists:societes_transport,id',
            'nom'                  => 'required|string|max:100',
            'prenom'               => 'required|string|max:100',
            'telephone'            => 'nullable|string',
            'permis'               => 'nullable|string',
        ]);
        return response()->json(Chauffeur::create($data), 201);
    }

    public function update(Request $request, Chauffeur $chauffeur)
    {
        $data = $request->validate([
            'nom'       => 'sometimes|string|max:100',
            'prenom'    => 'sometimes|string|max:100',
            'telephone' => 'nullable|string',
            'permis'    => 'nullable|string',
            'statut'    => 'sometimes|in:disponible,en_mission',
        ]);
        $chauffeur->update($data);
        return response()->json($chauffeur);
    }

    public function destroy(Chauffeur $chauffeur)
    {
        $chauffeur->delete();
        return response()->json(['message' => 'Chauffeur supprimé.']);
    }
}
