<?php

use App\Http\Controllers\CollabController;
use App\Http\Controllers\GetDocumentStateController;
use App\Http\Controllers\SaveDocumentStateController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/', CollabController::class)->name('home');
    Route::get('api/documents/{document}/state', GetDocumentStateController::class)->name('documents.state.show');
    Route::put('api/documents/{document}/state', SaveDocumentStateController::class)->name('documents.state.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
