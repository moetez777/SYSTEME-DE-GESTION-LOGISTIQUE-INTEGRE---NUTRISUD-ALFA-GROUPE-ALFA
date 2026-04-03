<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    /** GET /api/roles */
    public function index()
    {
        return response()->json(Role::all());
    }

    /** POST /api/roles */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'  => 'required|string|unique:roles,name',
            'label' => 'required|string',
        ]);
        return response()->json(Role::create($data), 201);
    }

    /** PUT /api/roles/{id} */
    public function update(Request $request, Role $role)
    {
        $data = $request->validate([
            'name'  => 'sometimes|string|unique:roles,name,' . $role->id,
            'label' => 'sometimes|string',
        ]);
        $role->update($data);
        return response()->json($role);
    }

    /** DELETE /api/roles/{id} */
    public function destroy(Role $role)
    {
        $role->delete();
        return response()->json(['message' => 'Rôle supprimé.']);
    }
}
