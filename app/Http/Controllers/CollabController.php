<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\User;
use App\Support\PresenceColor;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\View\View;

final class CollabController extends Controller
{
    public function __invoke(#[CurrentUser] User $user): View
    {
        $document = Document::query()->firstOrFail();

        return view('collab', [
            'user' => $user,
            'document' => $document,
            'collab' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'color' => PresenceColor::for($user),
                ],
                'documentId' => $document->id,
                'csrfToken' => csrf_token(),
                'reverb' => [
                    'key' => config('reverb.apps.apps.0.key'),
                    'host' => config('reverb.apps.apps.0.options.host'),
                    'port' => (int) config('reverb.apps.apps.0.options.port'),
                    'scheme' => config('reverb.apps.apps.0.options.scheme'),
                ],
            ],
        ]);
    }
}
