import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class CloudStorageService {
  private readonly logger = new Logger(CloudStorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    const accountId = config.get<string>('R2_ACCOUNT_ID', '');
    this.bucket = config.get<string>('R2_BUCKET', 'infast-chat');
    this.publicUrl = config.get<string>('R2_PUBLIC_URL', '');

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.get<string>('R2_ACCESS_KEY_ID', ''),
        secretAccessKey: config.get<string>('R2_SECRET_ACCESS_KEY', ''),
      },
    });

    this.logger.log(`Cloudflare R2 initialized: bucket=${this.bucket}`);
  }

  /**
   * Upload a file buffer to Cloudflare R2.
   * Returns the public URL of the uploaded file.
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    mimetype: string,
    folder: string = 'chat',
  ): Promise<string> {
    const ext = extname(originalName) || this.mimeToExt(mimetype);
    const key = `${folder}/${randomUUID()}${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      }),
    );

    const url = `${this.publicUrl}/${key}`;
    this.logger.log(`Uploaded to R2: ${key} (${mimetype}, ${buffer.length} bytes)`);
    return url;
  }

  private mimeToExt(mime: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'audio/mp4': '.m4a',
      'audio/mpeg': '.mp3',
      'audio/webm': '.webm',
      'audio/ogg': '.ogg',
      'audio/x-m4a': '.m4a',
      'audio/aac': '.aac',
    };
    return map[mime] || '.bin';
  }
}
