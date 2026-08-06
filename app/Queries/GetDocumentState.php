<?php

declare(strict_types=1);

namespace App\Queries;

use App\Models\Document;

final readonly class GetDocumentState
{
    public function get(Document $document): ?string
    {
        return $document->state === null
            ? null
            : base64_encode($document->state);
    }
}
