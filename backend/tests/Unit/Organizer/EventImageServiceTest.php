<?php

namespace Tests\Unit\Organizer;

use App\Features\Organizer\Services\EventImageService;
use Cloudinary\Api\ApiResponse;
use Illuminate\Http\UploadedFile;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * EventImageService Unit Tests
 *
 * Testing strategy:
 * - Methods that return early (non-http URLs, no files) are tested directly.
 * - Methods that invoke Cloudinary are tested by setting fake config values so
 *   the SDK is satisfied, then using Mockery overload to intercept all `new Cloudinary()`.
 *
 * Note: Mockery overload tests run in separate processes (runInSeparateProcess) to
 * avoid contaminating other tests with the class alias mock.
 */
class EventImageServiceTest extends TestCase
{
    private EventImageService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new EventImageService;
    }

    // ================================================================
    // deleteImage() — early-return branches (no Cloudinary needed)
    // ================================================================

    #[Test]
    public function test_delete_image_returns_false_for_non_http_url(): void
    {
        $result = $this->service->deleteImage('/storage/images/logo.png');

        $this->assertFalse($result);
    }

    #[Test]
    public function test_delete_image_returns_false_for_relative_path(): void
    {
        $result = $this->service->deleteImage('images/logo.png');

        $this->assertFalse($result);
    }

    #[Test]
    public function test_delete_image_returns_false_for_empty_string(): void
    {
        $result = $this->service->deleteImage('');

        $this->assertFalse($result);
    }

    #[Test]
    public function test_delete_image_returns_false_when_public_id_cannot_be_extracted(): void
    {
        // URL that starts with http but doesn't match Cloudinary pattern (no extension)
        $result = $this->service->deleteImage('https://example.com/path/no-extension-here');

        $this->assertFalse($result);
    }

    // ================================================================
    // processUploads() — no-file branches (no Cloudinary needed)
    // ================================================================

    #[Test]
    public function test_process_uploads_returns_empty_array_when_no_files(): void
    {
        $result = $this->service->processUploads(['title' => 'Test Event'], 1);

        $this->assertIsArray($result);
        $this->assertEmpty($result);
    }

    #[Test]
    public function test_process_uploads_returns_empty_array_for_empty_data(): void
    {
        $result = $this->service->processUploads([], 42);

        $this->assertIsArray($result);
        $this->assertEmpty($result);
    }

    #[Test]
    public function test_process_uploads_ignores_string_value_for_file_field(): void
    {
        // When a file field contains a URL string instead of UploadedFile, it should be ignored
        $result = $this->service->processUploads([
            'logo_file' => 'https://res.cloudinary.com/existing.jpg',
        ], 1);

        $this->assertEmpty($result);
    }

    #[Test]
    public function test_process_uploads_ignores_null_value_for_file_field(): void
    {
        $result = $this->service->processUploads([
            'logo_file' => null,
        ], 1);

        $this->assertEmpty($result);
    }

    #[Test]
    public function test_process_uploads_ignores_unknown_fields(): void
    {
        $result = $this->service->processUploads([
            'title' => 'My Event',
            'description' => 'A description',
            'start_date' => '2026-01-01',
        ], 1);

        $this->assertEmpty($result);
    }

    #[Test]
    public function test_process_uploads_with_no_existing_images_and_no_files_returns_empty(): void
    {
        $result = $this->service->processUploads([], 1, [
            'logo_url' => 'https://res.cloudinary.com/mycloud/image/upload/old.jpg',
        ]);

        $this->assertIsArray($result);
        $this->assertEmpty($result);
    }

    // ================================================================
    // deleteImage() — extractPublicId() logic verified via early returns
    // ================================================================

    #[Test]
    public function test_delete_image_returns_false_for_url_without_image_upload_path(): void
    {
        // URL starts with http but lacks /image/upload/ segment
        $result = $this->service->deleteImage('https://res.cloudinary.com/mycloud/raw/upload/file.pdf');

        $this->assertFalse($result);
    }

    #[Test]
    public function test_delete_image_returns_false_for_url_without_extension(): void
    {
        // Matches /image/upload/ but no extension in filename
        $result = $this->service->deleteImage('https://res.cloudinary.com/mycloud/image/upload/events/logo_no_extension');

        $this->assertFalse($result);
    }

    // ================================================================
    // processUploads() — map field names correctly (no Cloudinary)
    // ================================================================

    #[Test]
    public function test_process_uploads_only_maps_known_file_fields(): void
    {
        // Only logo_file, featured_image_file, responsive_image_file are known fields
        $result = $this->service->processUploads([
            'profile_photo_file' => UploadedFile::fake()->image('photo.jpg'), // unknown field
        ], 1);

        $this->assertEmpty($result);
    }

    // ================================================================
    // processUploads() — skips deleteImage when existing URL is non-http
    // ================================================================

    #[Test]
    public function test_process_uploads_does_not_delete_when_existing_url_is_non_http(): void
    {
        // existing image is a legacy local path — deleteImage would immediately return false
        // we verify processUploads does NOT call deleteImage for non-http existing URLs
        // (by not having Cloudinary set up — if it tried to call the API it would throw)
        $result = $this->service->processUploads([], 1, [
            'logo_url' => '/storage/images/old_logo.png',
        ]);

        $this->assertEmpty($result);
    }

    // ================================================================
    // storeImage() — Cloudinary mocked via overload
    // ================================================================

    /**
     * @runInSeparateProcess
     *
     * @preserveGlobalState disabled
     */
    #[Test]
    public function test_store_image_returns_secure_url_from_cloudinary(): void
    {
        config([
            'cloudinary.cloud_name' => 'testcloud',
            'cloudinary.api_key' => 'testapikey',
            'cloudinary.api_secret' => 'testapisecret',
        ]);

        $uploadApiMock = \Mockery::mock('Cloudinary\Api\Upload\UploadApi');
        $uploadApiMock->shouldReceive('upload')
            ->once()
            ->andReturn(new ApiResponse([
                'secure_url' => 'https://res.cloudinary.com/testcloud/image/upload/events/1/logo_abc123.jpg',
                'public_id' => 'events/1/logo_abc123',
            ], []));

        $cloudinaryMock = \Mockery::mock('overload:Cloudinary\Cloudinary');
        $cloudinaryMock->shouldReceive('uploadApi')->andReturn($uploadApiMock);

        $service = new EventImageService;
        $file = UploadedFile::fake()->image('logo.jpg', 800, 600);

        $url = $service->storeImage($file, 1, 'logo');

        $this->assertEquals(
            'https://res.cloudinary.com/testcloud/image/upload/events/1/logo_abc123.jpg',
            $url,
        );
    }

    /**
     * @runInSeparateProcess
     *
     * @preserveGlobalState disabled
     */
    #[Test]
    public function test_store_image_uses_correct_folder_and_resource_type(): void
    {
        config([
            'cloudinary.cloud_name' => 'testcloud',
            'cloudinary.api_key' => 'testapikey',
            'cloudinary.api_secret' => 'testapisecret',
        ]);

        $organizationId = 42;

        $uploadApiMock = \Mockery::mock('Cloudinary\Api\Upload\UploadApi');
        $uploadApiMock->shouldReceive('upload')
            ->once()
            ->with(
                \Mockery::type('string'),
                \Mockery::on(function ($options) use ($organizationId) {
                    return $options['folder'] === "events/{$organizationId}"
                        && $options['resource_type'] === 'image'
                        && $options['overwrite'] === true
                        && str_starts_with($options['public_id'], 'logo_');
                }),
            )
            ->andReturn(new ApiResponse([
                'secure_url' => 'https://res.cloudinary.com/testcloud/image/upload/events/42/logo_xyz.jpg',
                'public_id' => 'events/42/logo_xyz',
            ], []));

        $cloudinaryMock = \Mockery::mock('overload:Cloudinary\Cloudinary');
        $cloudinaryMock->shouldReceive('uploadApi')->andReturn($uploadApiMock);

        $service = new EventImageService;
        $file = UploadedFile::fake()->image('featured.jpg');

        $url = $service->storeImage($file, $organizationId, 'logo');

        $this->assertStringContainsString('cloudinary.com', $url);
    }

    /**
     * @runInSeparateProcess
     *
     * @preserveGlobalState disabled
     */
    #[Test]
    public function test_store_image_strips_file_suffix_from_public_id_prefix(): void
    {
        // When field is 'logo_file', the public_id should start with 'logo_', not 'logo_file_'
        // This is handled by: str_replace('_file', '', $fileField)
        // We test processUploads triggers storeImage with the correct field name.
        config([
            'cloudinary.cloud_name' => 'testcloud',
            'cloudinary.api_key' => 'testapikey',
            'cloudinary.api_secret' => 'testapisecret',
        ]);

        $uploadApiMock = \Mockery::mock('Cloudinary\Api\Upload\UploadApi');
        $uploadApiMock->shouldReceive('upload')
            ->once()
            ->with(
                \Mockery::type('string'),
                \Mockery::on(function ($options) {
                    // public_id should start with 'logo_', not 'logo_file_'
                    return str_starts_with($options['public_id'], 'logo_')
                        && ! str_starts_with($options['public_id'], 'logo_file_');
                }),
            )
            ->andReturn(new ApiResponse([
                'secure_url' => 'https://res.cloudinary.com/testcloud/image/upload/events/1/logo_abc.jpg',
                'public_id' => 'events/1/logo_abc',
            ], []));

        $cloudinaryMock = \Mockery::mock('overload:Cloudinary\Cloudinary');
        $cloudinaryMock->shouldReceive('uploadApi')->andReturn($uploadApiMock);

        $service = new EventImageService;
        $file = UploadedFile::fake()->image('logo.jpg');
        $data = ['logo_file' => $file];

        $result = $service->processUploads($data, 1);

        $this->assertArrayHasKey('logo_url', $result);
        $this->assertStringContainsString('cloudinary.com', $result['logo_url']);
    }

    // ================================================================
    // deleteImage() — Cloudinary mocked via overload (success/failure)
    // ================================================================

    /**
     * @runInSeparateProcess
     *
     * @preserveGlobalState disabled
     */
    #[Test]
    public function test_delete_image_returns_true_when_cloudinary_confirms_deletion(): void
    {
        config([
            'cloudinary.cloud_name' => 'testcloud',
            'cloudinary.api_key' => 'testapikey',
            'cloudinary.api_secret' => 'testapisecret',
        ]);

        $uploadApiMock = \Mockery::mock('Cloudinary\Api\Upload\UploadApi');
        $uploadApiMock->shouldReceive('destroy')
            ->once()
            ->with('events/1/logo_abc123')
            ->andReturn(new ApiResponse(['result' => 'ok'], []));

        $cloudinaryMock = \Mockery::mock('overload:Cloudinary\Cloudinary');
        $cloudinaryMock->shouldReceive('uploadApi')->andReturn($uploadApiMock);

        $service = new EventImageService;

        $result = $service->deleteImage(
            'https://res.cloudinary.com/testcloud/image/upload/events/1/logo_abc123.jpg',
        );

        $this->assertTrue($result);
    }

    /**
     * @runInSeparateProcess
     *
     * @preserveGlobalState disabled
     */
    #[Test]
    public function test_delete_image_returns_false_when_cloudinary_reports_not_found(): void
    {
        config([
            'cloudinary.cloud_name' => 'testcloud',
            'cloudinary.api_key' => 'testapikey',
            'cloudinary.api_secret' => 'testapisecret',
        ]);

        $uploadApiMock = \Mockery::mock('Cloudinary\Api\Upload\UploadApi');
        $uploadApiMock->shouldReceive('destroy')
            ->once()
            ->andReturn(new ApiResponse(['result' => 'not found'], []));

        $cloudinaryMock = \Mockery::mock('overload:Cloudinary\Cloudinary');
        $cloudinaryMock->shouldReceive('uploadApi')->andReturn($uploadApiMock);

        $service = new EventImageService;

        $result = $service->deleteImage(
            'https://res.cloudinary.com/testcloud/image/upload/events/1/logo_missing.jpg',
        );

        $this->assertFalse($result);
    }

    /**
     * @runInSeparateProcess
     *
     * @preserveGlobalState disabled
     */
    #[Test]
    public function test_delete_image_extracts_public_id_from_versioned_url(): void
    {
        config([
            'cloudinary.cloud_name' => 'testcloud',
            'cloudinary.api_key' => 'testapikey',
            'cloudinary.api_secret' => 'testapisecret',
        ]);

        $uploadApiMock = \Mockery::mock('Cloudinary\Api\Upload\UploadApi');
        $uploadApiMock->shouldReceive('destroy')
            ->once()
            ->with('events/1/logo_versioned')
            ->andReturn(new ApiResponse(['result' => 'ok'], []));

        $cloudinaryMock = \Mockery::mock('overload:Cloudinary\Cloudinary');
        $cloudinaryMock->shouldReceive('uploadApi')->andReturn($uploadApiMock);

        $service = new EventImageService;

        // Versioned URL: /image/upload/v1234567890/...
        $result = $service->deleteImage(
            'https://res.cloudinary.com/testcloud/image/upload/v1234567890/events/1/logo_versioned.jpg',
        );

        $this->assertTrue($result);
    }

    // ================================================================
    // processUploads() — with actual files (Cloudinary mocked)
    // ================================================================

    /**
     * @runInSeparateProcess
     *
     * @preserveGlobalState disabled
     */
    #[Test]
    public function test_process_uploads_returns_all_three_image_urls_when_all_files_present(): void
    {
        config([
            'cloudinary.cloud_name' => 'testcloud',
            'cloudinary.api_key' => 'testapikey',
            'cloudinary.api_secret' => 'testapisecret',
        ]);

        $uploadApiMock = \Mockery::mock('Cloudinary\Api\Upload\UploadApi');
        $uploadApiMock->shouldReceive('upload')
            ->times(3)
            ->andReturnValues([
                new ApiResponse([
                    'secure_url' => 'https://res.cloudinary.com/testcloud/image/upload/events/5/logo_a.jpg',
                    'public_id' => 'events/5/logo_a',
                ], []),
                new ApiResponse([
                    'secure_url' => 'https://res.cloudinary.com/testcloud/image/upload/events/5/featured_b.jpg',
                    'public_id' => 'events/5/featured_b',
                ], []),
                new ApiResponse([
                    'secure_url' => 'https://res.cloudinary.com/testcloud/image/upload/events/5/responsive_c.jpg',
                    'public_id' => 'events/5/responsive_c',
                ], []),
            ]);

        $cloudinaryMock = \Mockery::mock('overload:Cloudinary\Cloudinary');
        $cloudinaryMock->shouldReceive('uploadApi')->andReturn($uploadApiMock);

        $service = new EventImageService;

        $data = [
            'logo_file' => UploadedFile::fake()->image('logo.jpg'),
            'featured_image_file' => UploadedFile::fake()->image('featured.jpg'),
            'responsive_image_file' => UploadedFile::fake()->image('responsive.jpg'),
        ];

        $result = $service->processUploads($data, 5);

        $this->assertArrayHasKey('logo_url', $result);
        $this->assertArrayHasKey('featured_image', $result);
        $this->assertArrayHasKey('responsive_image_url', $result);
        $this->assertStringContainsString('logo_a', $result['logo_url']);
        $this->assertStringContainsString('featured_b', $result['featured_image']);
        $this->assertStringContainsString('responsive_c', $result['responsive_image_url']);
    }

    /**
     * @runInSeparateProcess
     *
     * @preserveGlobalState disabled
     */
    #[Test]
    public function test_process_uploads_deletes_existing_image_before_uploading_new_one(): void
    {
        config([
            'cloudinary.cloud_name' => 'testcloud',
            'cloudinary.api_key' => 'testapikey',
            'cloudinary.api_secret' => 'testapisecret',
        ]);

        $uploadApiMock = \Mockery::mock('Cloudinary\Api\Upload\UploadApi');

        // destroy called once for the existing logo
        $uploadApiMock->shouldReceive('destroy')
            ->once()
            ->with('events/1/old_logo')
            ->andReturn(new ApiResponse(['result' => 'ok'], []));

        // upload called once for the new logo
        $uploadApiMock->shouldReceive('upload')
            ->once()
            ->andReturn(new ApiResponse([
                'secure_url' => 'https://res.cloudinary.com/testcloud/image/upload/events/1/logo_new.jpg',
                'public_id' => 'events/1/logo_new',
            ], []));

        $cloudinaryMock = \Mockery::mock('overload:Cloudinary\Cloudinary');
        $cloudinaryMock->shouldReceive('uploadApi')->andReturn($uploadApiMock);

        $service = new EventImageService;

        $data = [
            'logo_file' => UploadedFile::fake()->image('new_logo.jpg'),
        ];

        $existingImages = [
            'logo_url' => 'https://res.cloudinary.com/testcloud/image/upload/events/1/old_logo.jpg',
        ];

        $result = $service->processUploads($data, 1, $existingImages);

        $this->assertArrayHasKey('logo_url', $result);
        $this->assertStringContainsString('logo_new', $result['logo_url']);
    }

    /**
     * @runInSeparateProcess
     *
     * @preserveGlobalState disabled
     */
    #[Test]
    public function test_process_uploads_skips_delete_when_existing_image_is_non_http(): void
    {
        config([
            'cloudinary.cloud_name' => 'testcloud',
            'cloudinary.api_key' => 'testapikey',
            'cloudinary.api_secret' => 'testapisecret',
        ]);

        $uploadApiMock = \Mockery::mock('Cloudinary\Api\Upload\UploadApi');

        // destroy should NOT be called — existing URL is a legacy local path
        $uploadApiMock->shouldNotReceive('destroy');

        // upload IS called once
        $uploadApiMock->shouldReceive('upload')
            ->once()
            ->andReturn(new ApiResponse([
                'secure_url' => 'https://res.cloudinary.com/testcloud/image/upload/events/1/logo_new.jpg',
                'public_id' => 'events/1/logo_new',
            ], []));

        $cloudinaryMock = \Mockery::mock('overload:Cloudinary\Cloudinary');
        $cloudinaryMock->shouldReceive('uploadApi')->andReturn($uploadApiMock);

        $service = new EventImageService;

        $data = [
            'logo_file' => UploadedFile::fake()->image('new_logo.jpg'),
        ];

        $existingImages = [
            'logo_url' => '/storage/old_logo.png', // non-http legacy path
        ];

        $result = $service->processUploads($data, 1, $existingImages);

        $this->assertArrayHasKey('logo_url', $result);
    }

    /**
     * @runInSeparateProcess
     *
     * @preserveGlobalState disabled
     */
    #[Test]
    public function test_process_uploads_only_uploads_files_that_are_present(): void
    {
        config([
            'cloudinary.cloud_name' => 'testcloud',
            'cloudinary.api_key' => 'testapikey',
            'cloudinary.api_secret' => 'testapisecret',
        ]);

        $uploadApiMock = \Mockery::mock('Cloudinary\Api\Upload\UploadApi');

        // Only one file — only one upload call
        $uploadApiMock->shouldReceive('upload')
            ->once()
            ->andReturn(new ApiResponse([
                'secure_url' => 'https://res.cloudinary.com/testcloud/image/upload/events/3/featured_x.jpg',
                'public_id' => 'events/3/featured_x',
            ], []));

        $cloudinaryMock = \Mockery::mock('overload:Cloudinary\Cloudinary');
        $cloudinaryMock->shouldReceive('uploadApi')->andReturn($uploadApiMock);

        $service = new EventImageService;

        $data = [
            'featured_image_file' => UploadedFile::fake()->image('feature.jpg'),
            // logo_file and responsive_image_file intentionally absent
        ];

        $result = $service->processUploads($data, 3);

        $this->assertCount(1, $result);
        $this->assertArrayHasKey('featured_image', $result);
        $this->assertArrayNotHasKey('logo_url', $result);
        $this->assertArrayNotHasKey('responsive_image_url', $result);
    }
}
