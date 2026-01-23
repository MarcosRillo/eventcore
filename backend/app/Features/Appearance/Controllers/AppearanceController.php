<?php

namespace App\Features\Appearance\Controllers;

use App\Features\Appearance\Requests\UpdateAppearanceRequest;
use App\Http\Controllers\Controller;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppearanceController extends Controller
{
    /**
     * Get the current appearance settings for the authenticated user's organization.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get the user's organization
        $organization = $user->organization;

        if (! $organization) {
            return response()->json([
                'message' => 'No se encontró la organización del usuario.',
            ], 404);
        }

        // Return appearance settings
        $appearanceSettings = [
            'logo_url' => $organization->logo_url,
            'banner_url' => $organization->banner_url,
            'color_primary' => $organization->color_primary ?? '#2563eb', // Default blue
            'color_secondary' => $organization->color_secondary ?? '#64748b', // Default slate
            'color_background' => $organization->color_background ?? '#ffffff', // Default white
            'color_text' => $organization->color_text ?? '#1e293b', // Default slate-800
        ];

        return response()->json([
            'data' => $appearanceSettings,
            'message' => 'Configuración de apariencia obtenida exitosamente.',
        ]);
    }

    /**
     * Update the appearance settings for the authenticated user's organization.
     */
    public function update(UpdateAppearanceRequest $request): JsonResponse
    {
        $user = $request->user();

        // Get the user's organization
        $organization = $user->organization;

        if (! $organization) {
            return response()->json([
                'message' => 'No se encontró la organización del usuario.',
            ], 404);
        }

        // Update only the provided fields
        $validatedData = $request->validated();

        $organization->update(array_filter($validatedData, function ($value) {
            return $value !== null;
        }));

        // Return updated appearance settings
        $appearanceSettings = [
            'logo_url' => $organization->logo_url,
            'banner_url' => $organization->banner_url,
            'color_primary' => $organization->color_primary,
            'color_secondary' => $organization->color_secondary,
            'color_background' => $organization->color_background,
            'color_text' => $organization->color_text,
        ];

        return response()->json([
            'data' => $appearanceSettings,
            'message' => 'Configuración de apariencia actualizada exitosamente.',
        ]);
    }
}
