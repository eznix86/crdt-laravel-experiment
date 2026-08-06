<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Document;
use App\Queries\GetDocumentState;
use Illuminate\Http\JsonResponse;

final class GetDocumentStateController extends Controller
{
    public function __invoke(Document $document, GetDocumentState $getDocumentState): JsonResponse
    {
        return response()->json(['state' => $getDocumentState->get($document)]);
    }
}
