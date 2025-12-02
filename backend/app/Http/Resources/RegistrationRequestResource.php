<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RegistrationRequestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'dni' => $this->dni,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'whatsapp' => $this->whatsapp,
            'organization_name' => $this->organization_name,
            'organization_sector' => $this->organization_sector,
            'website' => $this->website,
            'motivation' => $this->motivation,
            'status' => $this->status,
            'reviewed_by' => $this->reviewer?->name,
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'rejection_reason' => $this->rejection_reason,
            'created_at' => $this->created_at->toIso8601String(),
            'user_id' => $this->user_id,
            'organization_id' => $this->organization_id,
            'user_status' => $this->user?->status,
            'organization_status' => $this->organization?->status?->status_code ?? null,
            'is_deleted' => $this->user?->trashed() ?? false,
        ];
    }
}
