import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';

@Injectable()
export class AwsS3Service {
  s3Client: S3Client;
  region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.getOrThrow('AWS_S3_REGION');

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_S3_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow(
          'AWS_S3_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  async uploadImageToS3(file: Express.Multer.File) {
    if (!file) return;
    const bucketName = this.configService.getOrThrow('AWS_S3_BUCKET_NAME');
    const fileName = nanoid(this.configService.getOrThrow('NANOID_LENGTH'));

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    return `https://${bucketName}.s3.${this.region}.amazonaws.com/${fileName}`;
  }
}
