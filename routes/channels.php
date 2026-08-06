<?php

use App\Models\User;
use App\Support\PresenceColor;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('document.{documentId}', function (User $user): array {
    return [
        'id' => $user->id,
        'name' => $user->name,
        'color' => PresenceColor::for($user),
    ];
});
