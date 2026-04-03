<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
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
