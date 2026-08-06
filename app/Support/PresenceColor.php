<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\User;

final class PresenceColor
{
    private const PALETTE = [
        '#ef4444',
        '#f97316',
        '#f59e0b',
        '#10b981',
        '#06b6d4',
        '#3b82f6',
        '#8b5cf6',
        '#ec4899',
    ];

    public static function for(User $user): string
    {
        return self::PALETTE[$user->id % count(self::PALETTE)];
    }
}
