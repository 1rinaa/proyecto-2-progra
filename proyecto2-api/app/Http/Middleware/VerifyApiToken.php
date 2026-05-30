<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyApiToken
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();
        $expectedToken = env('API_TOKEN');
        
        if (!$token || $token !== $expectedToken) {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado. Token inválido o faltante.'
            ], 401);
        }
        
        return $next($request);
    }
}
