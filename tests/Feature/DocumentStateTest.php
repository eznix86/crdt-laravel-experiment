<?php

use App\Models\Document;
use App\Models\User;

test('guests cannot read the document state', function () {
    Document::forceCreate(['id' => 1]);

    $this->getJson('/api/documents/1/state')->assertUnauthorized();
});

test('guests cannot save the document state', function () {
    Document::forceCreate(['id' => 1]);

    $this->putJson('/api/documents/1/state', ['state' => base64_encode('content')])->assertUnauthorized();
});

test('the state is null for a document without content', function () {
    $user = User::factory()->create();
    Document::forceCreate(['id' => 1]);

    $this->actingAs($user)
        ->getJson('/api/documents/1/state')
        ->assertOk()
        ->assertJson(['state' => null]);
});

test('saved state can be read back', function () {
    $user = User::factory()->create();
    $document = Document::forceCreate(['id' => 1]);
    $state = base64_encode('saved-content');

    $this->actingAs($user)
        ->putJson('/api/documents/1/state', ['state' => $state])
        ->assertNoContent();

    expect($document->fresh())
        ->state->toBe('saved-content')
        ->updated_by->toBe($user->id);

    $this->actingAs($user)
        ->getJson('/api/documents/1/state')
        ->assertOk()
        ->assertJson(['state' => $state]);
});

test('state that is not valid base64 is rejected', function () {
    $user = User::factory()->create();
    Document::forceCreate(['id' => 1]);

    $this->actingAs($user)
        ->putJson('/api/documents/1/state', ['state' => 'not-base64!!'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('state');
});

test('state is required', function () {
    $user = User::factory()->create();
    Document::forceCreate(['id' => 1]);

    $this->actingAs($user)
        ->putJson('/api/documents/1/state', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('state');
});
