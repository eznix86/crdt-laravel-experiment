<?php

use App\Models\Document;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get('/')->assertRedirect(route('login'));
});

test('authenticated users can open the collaborative page', function () {
    $user = User::factory()->create();
    Document::forceCreate(['id' => 1]);

    $this->actingAs($user)
        ->get('/')
        ->assertOk()
        ->assertSee('id="editor"', false)
        ->assertSee($user->name);
});

test('the collaborative page requires a seeded document', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/')->assertNotFound();
});
