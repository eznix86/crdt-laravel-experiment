<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\SaveDocumentState;
use App\Http\Requests\SaveDocumentStateRequest;
use App\Models\Document;
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\Response;

final class SaveDocumentStateController extends Controller
{
    public function __invoke(
        SaveDocumentStateRequest $request,
        Document $document,
        #[CurrentUser] User $user,
        SaveDocumentState $saveDocumentState,
    ): Response {
        $saveDocumentState->handle($document, $request->validated('state'), $user);

        return response()->noContent();
    }
}
