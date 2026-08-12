import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import * as fs from 'fs';

@Injectable()
export class CloudStorageService {
  private readonly logger = new Logger(CloudStorageService.name);
  private readonly s3?: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    const accountId = config.get<string>('R2_ACCOUNT_ID', '').trim();
    this.bucket = config.get<string>('R2_BUCKET', 'infast-chat').trim();
    const rawPublicUrl = config.get<string>('R2_PUBLIC_URL', '').trim();
    const baseUrl = rawPublicUrl 
      ? rawPublicUrl.replace(/\/$/, '') 
      : accountId ? `https://pub-${accountId}.r2.dev` : '';
    this.publicUrl = baseUrl;

    if (accountId && accountId.length > 5) {
      try {
        this.s3 = new S3Client({
          region: 'auto',
          endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: config.get<string>('R2_ACCESS_KEY_ID', ''),
            secretAccessKey: config.get<string>('R2_SECRET_ACCESS_KEY', ''),
          },
        });
        this.logger.log(`Cloudflare R2 initialized: bucket=${this.bucket}`);
      } catch (err: any) {
        this.logger.error(`Failed to initialize S3Client: ${err.message}`);
      }
    } else {
      this.logger.warn(`Cloudflare R2_ACCOUNT_ID is empty or invalid. Using local disk fallback for uploads.`);
    }
  }

  /**
   * Upload a file buffer to Cloudflare R2 or fallback to local disk.
   * Returns the URL of the uploaded file.
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    mimetype: string,
    folder: string = 'avatars',
  ): Promise<string> {
    const ext = extname(originalName) || this.mimeToExt(mimetype);
    const filename = `${randomUUID()}${ext}`;
    const key = `${folder}/${filename}`;

    // Try Cloudflare R2 if configured properly
    if (this.s3 && this.publicUrl) {
      try {
        await this.s3.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ContentType: mimetype,
          }),
        );
        const url = `${this.publicUrl}/${key}`;
        this.logger.log(`Uploaded to R2: ${key} -> ${url}`);
        return url;
      } catch (err: any) {
        this.logger.error(`R2 Upload failed: ${err?.message || err}. Falling back to local disk storage.`);
      }
    }

    // Local disk storage fallback
    try {
      const uploadDir = join(process.cwd(), 'uploads', folder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);

      const localUrl = `/uploads/${folder}/${filename}`;
      this.logger.log(`Saved to local disk: ${filePath} -> ${localUrl}`);
      return localUrl;
    } catch (localErr: any) {
      this.logger.error(`Local disk save failed: ${localErr?.message || localErr}`);
      // Return base64 data URI as absolute last resort
      return `data:${mimetype};base64,${buffer.toString('base64')}`;
    }
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
    };
    return map[mime] || '.jpg';
  }
}
