<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Document;
use App\Models\User;

final readonly class SaveDocumentState
{
    public function handle(Document $document, string $state, User $user): void
    {
        $decoded = base64_decode($state, true);

        if ($decoded === false) {
            throw new \InvalidArgumentException('State must be valid base64.');
        }

        $document->update([
            'state' => $decoded,
            'updated_by' => $user->id,
        ]);
    }
}
