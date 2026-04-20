<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProduitController;
use App\Http\Controllers\Api\StockAlimentController;
use App\Http\Controllers\Api\StockCentreController;
use App\Http\Controllers\Api\CommandeController;
use App\Http\Controllers\Api\LivraisonController;
use App\Http\Controllers\Api\CamionController;
use App\Http\Controllers\Api\ChauffeurController;
use App\Http\Controllers\Api\EntiteController;

// ── Authentification (public) ────────────────────────────────────
Route::post('/login',  [AuthController::class, 'login']);
Route::post('/login/verify', [AuthController::class, 'verifyLoginCode']);

// ── Routes protégées ─────────────────────────────────────────────
Route::middleware(['auth:sanctum'])->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // ── Admin ────────────────────────────────────────────────────
    Route::middleware(['role:admin'])->group(function () {
        Route::apiResource('users', UserController::class);
        Route::apiResource('roles', RoleController::class)->except(['show']);

        // Entités
        Route::post('/societes-aliment',    [EntiteController::class, 'societeAlimentStore']);
        Route::put('/societes-aliment/{societeAliment}', [EntiteController::class, 'societeAlimentUpdate']);

        Route::get('/societes-elevage',     [EntiteController::class, 'societeElevageIndex']);
        Route::post('/societes-elevage',    [EntiteController::class, 'societeElevageStore']);

        Route::get('/centres-elevage',      [EntiteController::class, 'centreIndex']);
        Route::post('/centres-elevage',     [EntiteController::class, 'centreStore']);

        Route::post('/societes-transport',  [EntiteController::class, 'societeTransportStore']);

        // Rapport
        Route::get('/reports/export',       [DashboardController::class, 'export']);
    });

    // ── Societes Aliment (lecture admin + usine + centre) ──────
    Route::middleware(['role:admin,usine,centre'])->group(function () {
        Route::get('/societes-aliment', [EntiteController::class, 'societeAlimentIndex']);
    });

    // ── Dashboard (Admin + tous les rôles connectés) ─────────────
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // ── Societes Transport (lecture admin + transport) ───────────
    Route::middleware(['role:admin,transport'])->group(function () {
        Route::get('/societes-transport',   [EntiteController::class, 'societeTransportIndex']);
    });

    // ── Produits (usine + admin) ─────────────────────────────────
    Route::get('/produits',         [ProduitController::class, 'index']);
    Route::get('/produits/{produit}',[ProduitController::class, 'show']);

    Route::middleware(['role:admin,usine'])->group(function () {
        Route::post('/produits',           [ProduitController::class, 'store']);
        Route::put('/produits/{produit}',  [ProduitController::class, 'update']);
        Route::delete('/produits/{produit}',[ProduitController::class, 'destroy']);
    });

    // ── Stock Usine (usine + admin) ──────────────────────────────
    Route::get('/stocks/aliment',              [StockAlimentController::class, 'index']);
    Route::middleware(['role:admin,usine'])->group(function () {
        Route::post('/stocks/aliment/ajouter', [StockAlimentController::class, 'ajouter']);
        Route::post('/stocks/aliment/retirer', [StockAlimentController::class, 'retirer']);
    });

    // ── Stock Centre ─────────────────────────────────────────────
    Route::get('/stocks/centre',               [StockCentreController::class, 'index']);
    Route::put('/stocks/centre/{stockCentre}', [StockCentreController::class, 'update']);

    // ── Commandes ────────────────────────────────────────────────
    Route::get('/commandes',          [CommandeController::class, 'index']);
    Route::get('/commandes/{commande}',[CommandeController::class, 'show']);

    Route::middleware(['role:centre'])->group(function () {
        Route::post('/commandes',              [CommandeController::class, 'store']);
        Route::put('/commandes/{commande}/annuler', [CommandeController::class, 'annuler']);
    });

    Route::middleware(['role:admin,usine'])->group(function () {
        Route::put('/commandes/{commande}/status', [CommandeController::class, 'updateStatus']);
    });

    // ── Livraisons ───────────────────────────────────────────────
    Route::get('/livraisons',           [LivraisonController::class, 'index']);
    Route::get('/livraisons/{livraison}',[LivraisonController::class, 'show']);

    Route::middleware(['role:admin,transport'])->group(function () {
        Route::post('/livraisons',              [LivraisonController::class, 'store']);
        Route::put('/livraisons/{livraison}/assign', [LivraisonController::class, 'assign']);
    });

    Route::middleware(['role:admin,transport,chauffeur'])->group(function () {
        Route::put('/livraisons/{livraison}/status', [LivraisonController::class, 'updateStatus']);
    });

    // ── Camions ──────────────────────────────────────────────────
    Route::get('/camions',         [CamionController::class, 'index']);
    Route::middleware(['role:transport'])->group(function () {
        Route::post('/camions',             [CamionController::class, 'store']);
        Route::put('/camions/{camion}',     [CamionController::class, 'update']);
        Route::delete('/camions/{camion}',  [CamionController::class, 'destroy']);
    });

    // ── Chauffeurs ───────────────────────────────────────────────
    Route::get('/chauffeurs',      [ChauffeurController::class, 'index']);
    Route::middleware(['role:transport'])->group(function () {
        Route::post('/chauffeurs',             [ChauffeurController::class, 'store']);
        Route::put('/chauffeurs/{chauffeur}',  [ChauffeurController::class, 'update']);
        Route::delete('/chauffeurs/{chauffeur}',[ChauffeurController::class, 'destroy']);
    });
});
