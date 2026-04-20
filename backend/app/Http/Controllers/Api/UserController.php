<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\CentreElevage;
use App\Models\SocieteAliment;
use App\Models\SocieteTransport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    private const MANAGEABLE_ROLE_NAMES = ['usine', 'centre', 'transport'];

    private function isTransportCompanyAlreadyAssigned(int $societeTransportId, ?int $ignoreUserId = null): bool
    {
        $transportRoleId = Role::where('name', 'transport')->value('id');
        if (!$transportRoleId) {
            return false;
        }

        return User::query()
            ->where('role_id', $transportRoleId)
            ->where('entity_id', $societeTransportId)
            ->where('entity_type', 'societe_transport')
            ->when($ignoreUserId, fn ($q) => $q->where('id', '!=', $ignoreUserId))
            ->exists();
    }

    private function isAlimentCompanyAlreadyAssigned(int $societeAlimentId, ?int $ignoreUserId = null): bool
    {
        $usineRoleId = Role::where('name', 'usine')->value('id');
        if (!$usineRoleId) {
            return false;
        }

        return User::query()
            ->where('role_id', $usineRoleId)
            ->where('entity_id', $societeAlimentId)
            ->where('entity_type', 'societe_aliment')
            ->when($ignoreUserId, fn ($q) => $q->where('id', '!=', $ignoreUserId))
            ->exists();
    }

    /** GET /api/users */
    public function index()
    {
        $users = User::with('role')->orderBy('name')->get();
        return response()->json($users);
    }

    /** POST /api/users */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|unique:users,email',
            'password'    => 'required|string|min:6',
            'role_id'     => 'required|exists:roles,id',
            'entity_id'   => 'nullable|integer',
            'entity_type' => 'nullable|string',
            'actif'       => 'boolean',
        ]);

        $role = Role::find($data['role_id']);

        if (!$role || !in_array($role->name, self::MANAGEABLE_ROLE_NAMES, true)) {
            return response()->json([
                'message' => 'Role non autorise. Roles autorises: Responsable Usine, Responsable Centre, Responsable Transport.',
                'errors'  => ['role_id' => ['Selectionnez un role autorise.']],
            ], 422);
        }

        if ($role && $role->name === 'usine') {
            if (empty($data['entity_id']) || !SocieteAliment::whereKey($data['entity_id'])->exists()) {
                return response()->json([
                    'message' => 'Le responsable usine doit etre rattache a une societe aliment valide.',
                    'errors'  => ['entity_id' => ['Selectionnez une societe aliment valide.']],
                ], 422);
            }

            if ($this->isAlimentCompanyAlreadyAssigned((int) $data['entity_id'])) {
                return response()->json([
                    'message' => 'Cette societe aliment a deja un responsable usine.',
                    'errors'  => ['entity_id' => ['Cette societe est deja affectee a un responsable usine.']],
                ], 422);
            }

            $data['entity_type'] = 'societe_aliment';
        } elseif ($role && $role->name === 'centre') {
            if (empty($data['entity_id']) || !CentreElevage::whereKey($data['entity_id'])->exists()) {
                return response()->json([
                    'message' => 'Le responsable centre doit etre rattache a un centre elevage valide.',
                    'errors'  => ['entity_id' => ['Selectionnez un centre elevage valide.']],
                ], 422);
            }
            $data['entity_type'] = 'centre_elevage';
        } elseif ($role && $role->name === 'transport') {
            if (empty($data['entity_id']) || !SocieteTransport::whereKey($data['entity_id'])->exists()) {
                return response()->json([
                    'message' => 'Le responsable transport doit etre rattache a une societe de transport valide.',
                    'errors'  => ['entity_id' => ['Selectionnez une societe de transport valide.']],
                ], 422);
            }

            if ($this->isTransportCompanyAlreadyAssigned((int) $data['entity_id'])) {
                return response()->json([
                    'message' => 'Cette societe de transport a deja un responsable.',
                    'errors'  => ['entity_id' => ['Cette societe est deja affectee a un responsable transport.']],
                ], 422);
            }

            $data['entity_type'] = 'societe_transport';
        }

        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);

        return response()->json($user->load('role'), 201);
    }

    /** GET /api/users/{id} */
    public function show(User $user)
    {
        return response()->json($user->load('role'));
    }

    /** PUT /api/users/{id} */
    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'email'       => 'sometimes|email|unique:users,email,' . $user->id,
            'password'    => 'sometimes|string|min:6',
            'role_id'     => 'sometimes|exists:roles,id',
            'entity_id'   => 'nullable|integer',
            'entity_type' => 'nullable|string',
            'actif'       => 'boolean',
        ]);

        $targetRoleId = $data['role_id'] ?? $user->role_id;
        $targetRole   = Role::find($targetRoleId);

        if (!$targetRole || !in_array($targetRole->name, self::MANAGEABLE_ROLE_NAMES, true)) {
            return response()->json([
                'message' => 'Role non autorise. Roles autorises: Responsable Usine, Responsable Centre, Responsable Transport.',
                'errors'  => ['role_id' => ['Selectionnez un role autorise.']],
            ], 422);
        }

        if ($targetRole && $targetRole->name === 'usine') {
            $entityId = $data['entity_id'] ?? $user->entity_id;
            if (empty($entityId) || !SocieteAliment::whereKey($entityId)->exists()) {
                return response()->json([
                    'message' => 'Le responsable usine doit etre rattache a une societe aliment valide.',
                    'errors'  => ['entity_id' => ['Selectionnez une societe aliment valide.']],
                ], 422);
            }

            if ($this->isAlimentCompanyAlreadyAssigned((int) $entityId, $user->id)) {
                return response()->json([
                    'message' => 'Cette societe aliment a deja un responsable usine.',
                    'errors'  => ['entity_id' => ['Cette societe est deja affectee a un responsable usine.']],
                ], 422);
            }

            $data['entity_type'] = 'societe_aliment';
        } elseif ($targetRole && $targetRole->name === 'centre') {
            $entityId = $data['entity_id'] ?? $user->entity_id;
            if (empty($entityId) || !CentreElevage::whereKey($entityId)->exists()) {
                return response()->json([
                    'message' => 'Le responsable centre doit etre rattache a un centre elevage valide.',
                    'errors'  => ['entity_id' => ['Selectionnez un centre elevage valide.']],
                ], 422);
            }
            $data['entity_type'] = 'centre_elevage';
        } elseif ($targetRole && $targetRole->name === 'transport') {
            $entityId = $data['entity_id'] ?? $user->entity_id;
            if (empty($entityId) || !SocieteTransport::whereKey($entityId)->exists()) {
                return response()->json([
                    'message' => 'Le responsable transport doit etre rattache a une societe de transport valide.',
                    'errors'  => ['entity_id' => ['Selectionnez une societe de transport valide.']],
                ], 422);
            }

            if ($this->isTransportCompanyAlreadyAssigned((int) $entityId, $user->id)) {
                return response()->json([
                    'message' => 'Cette societe de transport a deja un responsable.',
                    'errors'  => ['entity_id' => ['Cette societe est deja affectee a un responsable transport.']],
                ], 422);
            }

            $data['entity_type'] = 'societe_transport';
        }

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return response()->json($user->load('role'));
    }

    /** DELETE /api/users/{id} */
    public function destroy(User $user)
    {
        $user->tokens()->delete();
        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé.']);
    }
}
