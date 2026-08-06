<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

final class SaveDocumentStateRequest extends FormRequest
{
    /**
     * @return array<string, string>
     */
    public function rules(): array
    {
        return [
            'state' => ['required', 'string'],
        ];
    }

    protected function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $state = $validator->getData()['state'] ?? null;

            if (is_string($state) && base64_decode($state, true) === false) {
                $validator->errors()->add('state', __('The state must be valid base64.'));
            }
        });
    }
}
