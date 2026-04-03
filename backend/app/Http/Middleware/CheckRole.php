<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    /**
     * Handle an incoming request.
     * Usage: ->middleware('role:admin,usine')
     */
    public function handle(Request $request, Closure $next, string ...$roles): mixed
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        if (!$user->actif) {
            return response()->json(['message' => 'Compte désactivé.'], 403);
        }

        if (!empty($roles) && !$user->hasAnyRole($roles)) {
            return response()->json([
                'message' => 'Accès refusé. Rôle requis : ' . implode(' ou ', $roles),
            ], 403);
        }

        return $next($request);
    }
}
