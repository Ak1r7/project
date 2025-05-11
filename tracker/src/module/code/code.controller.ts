import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { User } from 'src/core/type/user/decorators/user.decorator';
import { CodeService } from './code.service';
import { from, Observable } from 'rxjs';
import { CreateCodeDto } from 'src/core/type/code/create-code.dto';
import { CommentDto } from 'src/core/type/code/comment.dto';
import { CodeEntity } from './entity/code.entity';
import { FileEntity } from './entity/file.entity';

@ApiBearerAuth()
@ApiTags('Code')
@Controller()
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @Post('code')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Input code',
    type: CreateCodeDto,
  })
  saveCoodes(
    @User('userId') currentUserId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: 'text/.*|application/.*|video/vnd.dlna.mpeg-*',
          }),
          new MaxFileSizeValidator({
            maxSize: 1000000,
            message: 'File is too large. Max file size is 10MB',
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ): Observable<FileEntity> {
    return from(this.codeService.saveCode(currentUserId, file));
  }

  @Put('comment/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBody({ type: CommentDto })
  giveComment(
    @User('userId') currentUserId: string,
    @Param('id') id: string,
    @Body() commentDto: CommentDto,
  ): Observable<Partial<CodeEntity>> {
    return this.codeService.postComment(currentUserId, id, commentDto);
  }
}
