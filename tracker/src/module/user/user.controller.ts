import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { catchError, from, map, Observable, of } from 'rxjs';
import { UserResponsInterface } from '../../core/type/user/interface/user.interface';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/core/type/user/decorators/user.decorator';
import { UpdateUserDto } from 'src/core/type/user/dto/update-user.dto';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
// import { S3Service } from 'src/common/s3/s3.service';
import { MinioService } from 'src/common/minio/minio.service';
import { UpdateAvatarDto } from 'src/core/type/user/dto/update-avatar.dto';
import { UserEntity } from './user.entity';

@ApiBearerAuth()
@Controller()
@ApiTags('User')
export class UserController {
  constructor(
    private readonly userService: UserService,
    // private readonly mediaService: S3Service,
    private readonly mediaService: MinioService,
  ) {}

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  currentUser(@User() user: UserEntity): Observable<UserResponsInterface> {
    const users = this.userService.buildUserResponse(user);
    return of(users);
  }

  @Put('user')
  @UseGuards(AuthGuard('jwt'))
  @ApiBody({ type: UpdateUserDto })
  updateCurrentUser(
    @User('userId')
    currentUserId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Observable<UserResponsInterface> {
    return from(this.userService.updateUser(currentUserId, updateUserDto)).pipe(
      map((userEntity: UserEntity) =>
        this.userService.buildUserResponse(userEntity),
      ),
      catchError(() => {
        throw new BadRequestException('Unable to update user');
      }),
    );
  }

  @Put('avatar')
  @UseGuards(AuthGuard('jwt'))
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    description: 'Input image',
    type: UpdateAvatarDto,
  })
  updatePhoto(
    @User('userId') currentUserId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({
            maxSize: 1000000,
            message: 'File is too large. Max file size is 10MB',
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ): Observable<UserEntity> {
    return from(this.mediaService.updateAvatar(currentUserId, file));
  }
}
