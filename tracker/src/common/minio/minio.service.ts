import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';
import { catchError, forkJoin, from, map, Observable } from 'rxjs';
import { UserService } from 'src/module/user/user.service';
import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from 'src/module/user/user.entity';
import { TaskEntity } from 'src/module/task/task.entity';
import { TaskService } from 'src/module/task/task.service';

@Injectable()
export class MinioService {
  private readonly minioClient: Client;
  private bucketName = this.configService.get<string>('MINIO_DEFAULT_BUCKETS');

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly taskService: TaskService,
  ) {
    this.minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT,
      port: Number(process.env.MINIO_PORT),
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
      useSSL: false,
    });
  }

  updateAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Observable<UserEntity> {
    const key = `${uuidv4()}`;
    const avatarUrl = `https://${this.bucketName}.com/${key}`;

    const uploadResult$ = from(
      this.minioClient.putObject(this.bucketName, key, file.buffer),
    ).pipe(
      catchError((error) => {
        throw new InternalServerErrorException(
          `Failed to upload avatar: ${error.message}`,
        );
      }),
    );

    const updateUser$ = from(this.userService.updateAvatars(userId, avatarUrl));

    return forkJoin([uploadResult$, updateUser$]).pipe(
      map(([_, users]) => users),
      catchError((error) => {
        throw new InternalServerErrorException(
          `Failed to update user avatar: ${error.message}`,
        );
      }),
    );
  }

  addImageTask(
    userId: string,
    id: string,
    file: Express.Multer.File,
  ): Observable<TaskEntity> {
    const key = `${uuidv4()}`;
    const avatarUrl = `https://${this.bucketName}.com/${key}`;

    const uploadResult$ = from(
      this.minioClient.putObject(this.bucketName, key, file.buffer),
    ).pipe(
      catchError((error) => {
        throw new InternalServerErrorException(
          `Failed to save image: ${error.message}`,
        );
      }),
    );

    const updateUser$ = from(
      this.taskService.updateTask(userId, id, avatarUrl),
    );

    return forkJoin([uploadResult$, updateUser$]).pipe(
      map(([_, users]) => users),
      catchError((error) => {
        throw new InternalServerErrorException(
          `Failed to save image: ${error.message}`,
        );
      }),
    );
  }
}
