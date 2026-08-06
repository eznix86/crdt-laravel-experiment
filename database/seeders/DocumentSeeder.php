<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Document;
use Illuminate\Database\Seeder;

final class DocumentSeeder extends Seeder
{
    public function run(): void
    {
        if (Document::query()->whereKey(1)->doesntExist()) {
            Document::forceCreate(['id' => 1]);
        }
    }
}
