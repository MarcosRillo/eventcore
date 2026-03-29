<?php

namespace App\Features\Organizer\Services;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

/**
 * Service for handling event image uploads.
 * Stores images in Cloudinary under events/{organization_id}/
 */
class EventImageService
{
    private function cloudinary(): Cloudinary
    {
        return new Cloudinary([
            'cloud' => [
                'cloud_name' => config('cloudinary.cloud_name'),
                'api_key' => config('cloudinary.api_key'),
                'api_secret' => config('cloudinary.api_secret'),
            ],
            'url' => ['secure' => true],
        ]);
    }

    /**
     * Store an uploaded image file in Cloudinary.
     *
     * @param  UploadedFile  $file  The uploaded file
     * @param  int  $organizationId  The organization ID for namespacing
     * @param  string  $field  The field name (logo, featured_image, responsive_image)
     * @return string The secure Cloudinary URL
     */
    public function storeImage(UploadedFile $file, int $organizationId, string $field): string
    {
        $result = $this->cloudinary()->uploadApi()->upload($file->getRealPath(), [
            'folder' => "events/{$organizationId}",
            'public_id' => $field.'_'.bin2hex(random_bytes(8)),
            'resource_type' => 'image',
            'overwrite' => true,
        ]);

        $url = $result['secure_url'];

        Log::info('Event image uploaded to Cloudinary', [
            'organization_id' => $organizationId,
            'field' => $field,
            'url' => $url,
            'public_id' => $result['public_id'],
            'original_name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
        ]);

        return $url;
    }

    /**
     * Delete an image from Cloudinary.
     *
     * @param  string  $imageUrl  The full Cloudinary URL or legacy /storage/ path
     * @return bool True if deleted, false otherwise
     */
    public function deleteImage(string $imageUrl): bool
    {
        // Legacy local storage paths are skipped — files no longer exist on ephemeral disk
        if (! str_starts_with($imageUrl, 'http')) {
            return false;
        }

        // Extract public_id from Cloudinary URL
        // Format: https://res.cloudinary.com/{cloud}/image/upload/{version}/{public_id}.{ext}
        // or:     https://res.cloudinary.com/{cloud}/image/upload/{public_id}.{ext}
        $publicId = $this->extractPublicId($imageUrl);

        if ($publicId === null) {
            Log::warning('Could not extract public_id from Cloudinary URL', ['url' => $imageUrl]);

            return false;
        }

        $result = $this->cloudinary()->uploadApi()->destroy($publicId);

        $deleted = ($result['result'] === 'ok');

        Log::info('Event image deleted from Cloudinary', [
            'url' => $imageUrl,
            'public_id' => $publicId,
            'result' => $result['result'],
        ]);

        return $deleted;
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
                // Delete existing image if it is a Cloudinary URL
                if (
                    $existingImages &&
                    isset($existingImages[$urlField]) &&
                    str_starts_with($existingImages[$urlField], 'http')
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

    /**
     * Extract the Cloudinary public_id from a secure URL.
     * Handles both versioned and non-versioned URLs.
     */
    private function extractPublicId(string $url): ?string
    {
        // Match: /image/upload/ optionally followed by v\d+/ then capture public_id (no ext)
        if (preg_match('#/image/upload/(?:v\d+/)?(.+)\.[^.]+$#', $url, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
