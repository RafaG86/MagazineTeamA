<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PostController;
use App\Http\Controllers\StandingsController;
use App\Http\Controllers\MatchController;
use App\Http\Controllers\SportBotController;

Route::get('/posts', [PostController::class, 'index']);
Route::post('/posts', [PostController::class, 'store']);
Route::delete('/posts/{id}', [PostController::class, 'destroy']);

Route::get('/standings', [StandingsController::class, 'index']);
Route::post('/standings', [StandingsController::class, 'store']);

Route::get('/matches', [MatchController::class, 'index']);
Route::post('/matches', [MatchController::class, 'store']);

Route::get('/bot/standings', [SportBotController::class, 'getStandings']);
Route::get('/bot/results', [SportBotController::class, 'getResults']);
Route::get('/bot/ucl/standings', [SportBotController::class, 'getUclStandings']);
Route::get('/bot/ucl/results', [SportBotController::class, 'getUclResults']);
Route::post('/bot/vision', [SportBotController::class, 'processVision']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
