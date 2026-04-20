<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chauffeur;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ChauffeurController extends Controller
{
    public function index(Request $request)
    {
        $user  = $request->user();
        $query = Chauffeur::with('societeTransport');

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
            'nom'                  => 'required|string|max:100',
            'prenom'               => 'required|string|max:100',
            'email'                => 'required|email|unique:chauffeurs,email|unique:users,email',
            'password'             => 'required|string|min:6',
            'telephone'            => 'nullable|string',
            'permis'               => 'nullable|string',
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

        $chauffeurRole = Role::where('name', 'chauffeur')->first();
        if (!$chauffeurRole) {
            return response()->json(['message' => 'Role chauffeur introuvable.'], 500);
        }

        $created = DB::transaction(function () use ($data, $chauffeurRole) {
            $chauffeur = Chauffeur::create([
                'societe_transport_id' => $data['societe_transport_id'],
                'nom'                  => $data['nom'],
                'prenom'               => $data['prenom'],
                'email'                => $data['email'],
                'telephone'            => $data['telephone'] ?? null,
                'permis'               => $data['permis'] ?? null,
            ]);

            $driverUser = User::create([
                'name'        => trim(($data['prenom'] ?? '') . ' ' . ($data['nom'] ?? '')),
                'email'       => $data['email'],
                'password'    => Hash::make($data['password']),
                'role_id'     => $chauffeurRole->id,
                'entity_id'   => $chauffeur->id,
                'entity_type' => 'chauffeur',
                'actif'       => true,
            ]);

            $chauffeur->update(['user_id' => $driverUser->id]);

            return $chauffeur;
        });

        return response()->json($created->load('user'), 201);
    }

    public function update(Request $request, Chauffeur $chauffeur)
    {
        $user = $request->user();

        if (!$user->hasRole('transport')) {
            return response()->json(['message' => 'Non autorise.'], 403);
        }

        if ((int) $chauffeur->societe_transport_id !== (int) $user->entity_id) {
            return response()->json(['message' => 'Ce chauffeur ne vous appartient pas.'], 403);
        }

        $data = $request->validate([
            'nom'       => 'sometimes|string|max:100',
            'prenom'    => 'sometimes|string|max:100',
            'email'     => 'nullable|email|unique:chauffeurs,email,' . $chauffeur->id . '|unique:users,email,' . ($chauffeur->user_id ?? 0),
            'password'  => 'sometimes|string|min:6',
            'telephone' => 'nullable|string',
            'permis'    => 'nullable|string',
            'statut'    => 'sometimes|in:disponible,en_mission',
        ]);

        DB::transaction(function () use ($chauffeur, $data) {
            $updateData = $data;
            unset($updateData['password']);
            $chauffeur->update($updateData);

            if ($chauffeur->user_id) {
                $driverUser = User::find($chauffeur->user_id);
                if ($driverUser) {
                    if (array_key_exists('email', $data) && !empty($data['email'])) {
                        $driverUser->email = $data['email'];
                    }
                    if (array_key_exists('password', $data) && !empty($data['password'])) {
                        $driverUser->password = Hash::make($data['password']);
                    }
                    if (array_key_exists('prenom', $data) || array_key_exists('nom', $data)) {
                        $driverUser->name = trim(($chauffeur->prenom ?? '') . ' ' . ($chauffeur->nom ?? ''));
                    }
                    $driverUser->save();
                }
            } elseif (!empty($data['email']) && !empty($data['password'])) {
                $chauffeurRole = Role::where('name', 'chauffeur')->first();
                if ($chauffeurRole) {
                    $driverUser = User::create([
                        'name'        => trim(($chauffeur->prenom ?? '') . ' ' . ($chauffeur->nom ?? '')),
                        'email'       => $data['email'],
                        'password'    => Hash::make($data['password']),
                        'role_id'     => $chauffeurRole->id,
                        'entity_id'   => $chauffeur->id,
                        'entity_type' => 'chauffeur',
                        'actif'       => true,
                    ]);
                    $chauffeur->update(['user_id' => $driverUser->id]);
                }
            }
        });

        return response()->json($chauffeur);
    }

    public function destroy(Chauffeur $chauffeur)
    {
        $user = request()->user();

        if (!$user->hasRole('transport')) {
            return response()->json(['message' => 'Non autorise.'], 403);
        }

        if ((int) $chauffeur->societe_transport_id !== (int) $user->entity_id) {
            return response()->json(['message' => 'Ce chauffeur ne vous appartient pas.'], 403);
        }

        $chauffeur->delete();
        return response()->json(['message' => 'Chauffeur supprimé.']);
    }
}
