import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpException,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTaskDto } from './dto/createtask.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from 'src/core/type/user/decorators/user.decorator';
import { TaskEntity } from './task.entity';
import { concatMap, from, Observable, throwError } from 'rxjs';
import { TaskService } from './task.service';
import { PaginationDTO } from 'src/core/type/pagination/pagination.dto';
import { TotalDto } from '../chat/dto/total.dto';
import { ModifyDto } from './dto/modify.dto';
import { MinioService } from 'src/common/minio/minio.service';

@ApiBearerAuth()
@ApiTags('Task')
@Controller('task')
export class TaskController {
  constructor(
    private taskService: TaskService,
    private readonly mediaService: MinioService,
  ) {}
  @Post('create')
  @ApiOperation({ summary: 'Create task' })
  @ApiCreatedResponse({
    description: 'Created Succesfully',
    type: TaskEntity,
    isArray: false,
  })
  @UseGuards(AuthGuard('jwt'))
  createTask(
    @User('userId')
    currentUserId: string,
    @Body()
    tasks: CreateTaskDto,
  ): Observable<TaskEntity> {
    return from(this.taskService.createTask(currentUserId, tasks));
  }

  @Get('current-task')
  @ApiOperation({ summary: 'Displays all the tasks you have created.' })
  @ApiCreatedResponse({
    description: 'Created Succesfully',
    type: TaskEntity,
    isArray: false,
  })
  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({ name: 'skip', type: 'number' })
  @ApiQuery({ name: 'limit', type: 'number' })
  @ApiQuery({ name: 'time', type: 'string', enum: ['ASC', 'DESC'] })
  @ApiQuery({
    name: 'sort',
    type: 'string',
    enum: ['Closed', 'NotClosed', 'All'],
  })
  currentTask(
    @Query('sort') sort: string,
    @Query('time') sortTime: string,
    @Query() paginationDTO: PaginationDTO,
    @User('userId')
    currentUserId: string,
  ): Observable<{ results: TaskEntity[]; meta: TotalDto }> {
    return from(
      this.taskService.currentTask(
        currentUserId,
        sort,
        paginationDTO,
        sortTime,
      ),
    );
  }

  @Get('assigned-task')
  @ApiOperation({ summary: 'Displays the tasks that are assigned to you' })
  @ApiCreatedResponse({
    description: 'Created Succesfully',
    type: TaskEntity,
    isArray: false,
  })
  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({ name: 'skip', type: 'number' })
  @ApiQuery({ name: 'limit', type: 'number' })
  @ApiQuery({ name: 'time', type: 'string', enum: ['ASC', 'DESC'] })
  @ApiQuery({
    name: 'sort',
    type: 'string',
    enum: ['Closed', 'NotClosed', 'All'],
  })
  assignedTask(
    @Query('sort') sort: string,
    @Query('time') sortTime: string,
    @Query() paginationDTO: PaginationDTO,
    @User('userId')
    currentUserId: string,
  ): Observable<{ results: TaskEntity[]; meta: TotalDto }> {
    return from(
      this.taskService.assignedTask(
        currentUserId,
        sort,
        paginationDTO,
        sortTime,
      ),
    );
  }

  @Patch('modify/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({ type: ModifyDto })
  @ApiOperation({
    summary: 'Modify name, description, assigned user, or add comment',
  })
  modifyTask(
    @User('userId') userId: string,
    @Param('id') id: string,
    @Body() message: ModifyDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: 'image/.*|text/.*|application/.*|video/vnd.dlna.mpeg-*',
          }),
          new MaxFileSizeValidator({
            maxSize: 10000000,
            message: 'File is too large. Max file size is 10MB',
          }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File | null,
  ): Observable<TaskEntity> {
    if (!file) {
      return this.taskService.modify(userId, id, message, null);
    }

    const fileType = file.mimetype.split('/')[0];

    if (fileType === 'image') {
      return this.mediaService.addImageTask(userId, id, file).pipe(
        concatMap(() => {
          return this.taskService.modify(userId, id, message, file);
        }),
      );
    } else if (
      fileType === 'text' ||
      fileType === 'application' ||
      fileType === 'video'
    ) {
      return this.taskService.modify(userId, id, message, file);
    } else {
      return throwError(
        () =>
          new HttpException('Unsupported file type', HttpStatus.BAD_REQUEST),
      );
    }
  }

  @Delete('delete')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete Task ' })
  @ApiQuery({ name: 'id', type: 'string' })
  deleteTask(
    @User('userId')
    currentUserId: string,
    @Query('id') id: string,
  ): Observable<TaskEntity> {
    return from(this.taskService.deleteTask(currentUserId, id));
  }
}
