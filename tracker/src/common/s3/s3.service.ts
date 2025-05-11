import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { catchError, forkJoin, from, map, Observable } from 'rxjs';
import { UserService } from 'src/module/user/user.service';
import { UserEntity } from 'src/module/user/user.entity';

@Injectable()
export class S3Service {
  private client: S3Client;
  private bucketName = this.configService.get('AWS_S3_BUCKET_NAME');

  constructor(
    private readonly configService: ConfigService,
    private userService: UserService,
  ) {
    const s3_region = this.configService.get('AWS_S3_REGION');

    if (!s3_region) {
      throw new Error('AWS_S3_REGION not found in environment variables');
    }

    this.client = new S3Client({
      region: s3_region,
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true,
    });
  }
  updateAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Observable<UserEntity> {
    const key = `${uuidv4()}`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
      },
    });

    const avatarUrl = `https://${this.bucketName}.s3.amazonaws.com/${key}`;

    const uploadResult$ = from(this.client.send(command)).pipe(
      catchError((error) => {
        throw new InternalServerErrorException(error);
      }),
    );

    const updateUser$ = from(this.userService.updateAvatars(userId, avatarUrl));

    return forkJoin([uploadResult$, updateUser$]).pipe(
      map(([_, users]) => users),
      catchError((error) => {
        throw new InternalServerErrorException(error);
      }),
    );
  }
}
