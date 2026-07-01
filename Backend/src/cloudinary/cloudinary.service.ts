import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export interface CloudinaryUploadResult {
  /** Optimized delivery URL (auto format + auto quality) served from the CDN. */
  url: string;
  /** Cloudinary public id, useful for future deletes/transforms. */
  publicId: string;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly enabled: boolean;
  private readonly folder?: string;

  constructor(private readonly config: ConfigService) {
    const cloudName = config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = config.get<string>('CLOUDINARY_API_SECRET');
    this.folder = config.get<string>('CLOUDINARY_FOLDER') || undefined;

    this.enabled = Boolean(cloudName && apiKey && apiSecret);

    if (this.enabled) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      this.logger.log(
        `Cloudinary CDN enabled (cloud_name=${cloudName}${
          this.folder ? `, folder=${this.folder}` : ''
        })`,
      );
    } else {
      this.logger.warn(
        'Cloudinary not configured (set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET). Falling back to local disk storage for uploads.',
      );
    }
  }

  /** Whether Cloudinary credentials are present and the CDN should be used. */
  isEnabled(): boolean {
    return this.enabled;
  }

  /** Upload an in-memory image buffer to Cloudinary and return an optimized CDN URL. */
  async uploadImage(
    buffer: Buffer,
    filename?: string,
  ): Promise<CloudinaryUploadResult> {
    const result = await new Promise<{ public_id: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: this.folder,
            resource_type: 'image',
            public_id: filename ? stripExtension(filename) : undefined,
            unique_filename: true,
            overwrite: false,
          },
          (error, uploaded) => {
            if (error || !uploaded) {
              reject(error ?? new Error('Cloudinary upload failed'));
              return;
            }
            resolve(uploaded);
          },
        );
        stream.end(buffer);
      },
    );

    return {
      url: this.optimizedUrl(result.public_id),
      publicId: result.public_id,
    };
  }

  /** Build an optimized delivery URL: auto-format + auto-quality, served from CDN. */
  optimizedUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      secure: true,
      fetch_format: 'auto',
      quality: 'auto',
    });
  }
}

function stripExtension(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot > 0 ? filename.slice(0, dot) : filename;
}
