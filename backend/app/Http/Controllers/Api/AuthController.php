<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    private function resolveRoleLabel(User $user): string
    {
        if ($user->role && $user->role->name === 'transport') {
            return 'Societe Transport';
        }

        return $user->role?->label ?? '';
    }

    /**
     * POST /api/login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::with('role')->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Identifiants incorrects.',
            ], 401);
        }

        if (!$user->actif) {
            return response()->json([
                'message' => 'Compte désactivé. Contactez l\'administrateur.',
            ], 403);
        }

        $verificationCode = (string) random_int(100000, 999999);
        $challengeToken   = Str::random(64);
        $expiresAt        = now()->addMinutes(10);

        Cache::put('login_challenge:' . $challengeToken, [
            'user_id'    => $user->id,
            'code'       => $verificationCode,
            'attempts'   => 0,
            'expires_at' => $expiresAt->timestamp,
        ], $expiresAt);

        $verificationChannel = env('LOGIN_VERIFICATION_CHANNEL', 'site');
        $responseMessage = 'Code de verification genere par la plateforme.';

        Log::info('Generation code verification login', [
            'user_id' => $user->id,
            'email'   => $user->email,
            'channel' => $verificationChannel,
        ]);

        if ($verificationChannel === 'email') {
            try {
                Mail::send(
                    'emails.login-verification-code',
                    [
                        'name' => $user->name,
                        'code' => $verificationCode,
                    ],
                    function ($message) use ($user) {
                        $message->to($user->email)
                            ->subject('Code de verification - Nutrisud Alfa');
                    }
                );

                Log::info('Code verification login envoye avec succes', [
                    'user_id' => $user->id,
                    'email'   => $user->email,
                ]);

                $responseMessage = 'Un code de verification a ete envoye a votre adresse email.';
            } catch (\Throwable $e) {
                Cache::forget('login_challenge:' . $challengeToken);
                Log::error('Erreur envoi code verification login', [
                    'user_id'         => $user->id,
                    'email'           => $user->email,
                    'exception_class' => get_class($e),
                    'error'           => $e->getMessage(),
                ]);

                return response()->json([
                    'message' => 'Impossible d\'envoyer le code de verification par email.',
                ], 500);
            }
        }

        $response = [
            'requires_verification' => true,
            'challenge_token'       => $challengeToken,
            'verification_channel'  => $verificationChannel,
            'message'               => $responseMessage,
        ];

        if ($verificationChannel === 'site') {
            $response['verification_code'] = $verificationCode;
        }

        return response()->json($response, 202);
    }

    /**
     * POST /api/login/verify
     */
    public function verifyLoginCode(Request $request)
    {
        $request->validate([
            'challenge_token' => 'required|string',
            'code'            => 'required|string|size:6',
        ]);

        $cacheKey   = 'login_challenge:' . $request->challenge_token;
        $challenge  = Cache::get($cacheKey);

        if (!$challenge) {
            return response()->json([
                'message' => 'Code expire ou invalide. Veuillez vous reconnecter.',
            ], 422);
        }

        if (now()->timestamp > ($challenge['expires_at'] ?? 0)) {
            Cache::forget($cacheKey);

            return response()->json([
                'message' => 'Code expire. Veuillez vous reconnecter.',
            ], 422);
        }

        if (($challenge['attempts'] ?? 0) >= 5) {
            Cache::forget($cacheKey);

            return response()->json([
                'message' => 'Trop de tentatives. Veuillez vous reconnecter.',
            ], 429);
        }

        if (($challenge['code'] ?? '') !== $request->code) {
            $challenge['attempts'] = ($challenge['attempts'] ?? 0) + 1;

            $secondsRemaining = max(1, ($challenge['expires_at'] ?? now()->timestamp) - now()->timestamp);
            Cache::put($cacheKey, $challenge, now()->addSeconds($secondsRemaining));

            return response()->json([
                'message' => 'Code de verification incorrect.',
            ], 422);
        }

        $user = User::with('role')->find($challenge['user_id']);
        Cache::forget($cacheKey);

        if (!$user || !$user->actif) {
            return response()->json([
                'message' => 'Compte invalide ou desactive.',
            ], 403);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'          => $user->id,
                'name'        => $user->name,
                'email'       => $user->email,
                'role'        => $user->role->name,
                'role_label'  => $this->resolveRoleLabel($user),
                'entity_id'   => $user->entity_id,
                'entity_type' => $user->entity_type,
            ],
        ]);
    }

    /**
     * POST /api/logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    /**
     * GET /api/me
     */
    public function me(Request $request)
    {
        $user = $request->user()->load('role');

        return response()->json([
            'id'          => $user->id,
            'name'        => $user->name,
            'email'       => $user->email,
            'role'        => $user->role->name,
            'role_label'  => $this->resolveRoleLabel($user),
            'entity_id'   => $user->entity_id,
            'entity_type' => $user->entity_type,
        ]);
    }
}
