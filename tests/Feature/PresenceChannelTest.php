<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;
use Mockery;
use Pusher\Pusher;

test('the presence channel returns id, name and color for a member', function () {
    $user = User::factory()->create();

    $pusher = Mockery::mock(Pusher::class);
    $pusher->shouldReceive('authorizePresenceChannel')
        ->andReturnUsing(
            fn (string $channelName, string $socketId, string $identifier, array $result): string => json_encode([
                'auth' => 'app-key:signature',
                'channel_data' => json_encode($result),
            ]),
        );

    Broadcast::connection('reverb')->setPusher($pusher);

    $response = $this->actingAs($user)
        ->post('/broadcasting/auth', [
            'channel_name' => 'presence-document.1',
            'socket_id' => '1234.5678',
        ])
        ->assertOk();

    expect($response->json('auth'))->toBe('app-key:signature');

    $channelData = json_decode($response->json('channel_data'), true);

    expect($channelData)
        ->toMatchArray(['id' => $user->id, 'name' => $user->name])
        ->and($channelData['color'])->toMatch('/^#[0-9a-f]{6}$/i');
});
