<?php

namespace App\Features\Organizer\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Service for handling event image uploads.
 * Stores images in storage/app/public/events/{organization_id}/
 */
class EventImageService
{
    /**
     * Store an uploaded image file.
     *
     * @param  UploadedFile  $file  The uploaded file
     * @param  int  $organizationId  The organization ID for namespacing
     * @param  string  $field  The field name (logo, featured_image, responsive_image)
     * @return string The public URL path to the stored image
     */
    public function storeImage(UploadedFile $file, int $organizationId, string $field): string
    {
        $extension = $file->guessExtension() ?? $file->getClientOriginalExtension();
        $filename = $field.'_'.time().'_'.uniqid().'.'.$extension;
        $path = $file->storeAs("events/{$organizationId}", $filename, 'public');

        Log::info('Event image stored', [
            'organization_id' => $organizationId,
            'field' => $field,
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
        ]);

        return '/storage/'.$path;
    }

    /**
     * Delete an image from storage.
     *
     * @param  string  $imagePath  The full storage path (e.g., /storage/events/1/logo_123.jpg)
     * @return bool True if deleted, false otherwise
     */
    public function deleteImage(string $imagePath): bool
    {
        // Extract the relative path from the full URL
        $relativePath = str_replace('/storage/', '', $imagePath);

        if (Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);

            Log::info('Event image deleted', [
                'path' => $relativePath,
            ]);

            return true;
        }

        return false;
    }

    /**
     * Process image uploads from request data.
     * Returns an array with the URL fields to be merged into event data.
     *
     * @param  array  $data  The request data containing potential file uploads
     * @param  int  $organizationId  The organization ID
     * @param  array|null  $existingImages  Existing image URLs to delete when replacing
     * @return array Array of image URL fields to merge into event data
     */
    public function processUploads(array $data, int $organizationId, ?array $existingImages = null): array
    {
        $imageUrls = [];
        $fileFields = [
            'logo_file' => 'logo_url',
            'featured_image_file' => 'featured_image',
            'responsive_image_file' => 'responsive_image_url',
        ];

        foreach ($fileFields as $fileField => $urlField) {
            if (isset($data[$fileField]) && $data[$fileField] instanceof UploadedFile) {
                // Delete existing image if present and it's a local file
                if (
                    $existingImages &&
                    isset($existingImages[$urlField]) &&
                    str_starts_with($existingImages[$urlField], '/storage/')
                ) {
                    $this->deleteImage($existingImages[$urlField]);
                }

                // Store the new image
                $imageUrls[$urlField] = $this->storeImage(
                    $data[$fileField],
                    $organizationId,
                    str_replace('_file', '', $fileField),
                );
            }
        }

        return $imageUrls;
    }
}
