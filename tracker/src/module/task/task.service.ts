import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from './task.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/createtask.dto';
import {
  catchError,
  forkJoin,
  from,
  map,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { CodeService } from '../code/code.service';
import { RelationTaskEntity } from './relation.entity';
import { PaginationDTO } from 'src/core/type/pagination/pagination.dto';
import { TotalDto } from '../chat/dto/total.dto';
import { UserService } from '../user/user.service';
import { ModifyDto } from './dto/modify.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(RelationTaskEntity)
    private readonly relationRepositry: Repository<RelationTaskEntity>,
    private readonly userService: UserService,
    private readonly codeService: CodeService,
  ) {}

  createTask(
    currentUserId: string,
    tasks: CreateTaskDto,
  ): Observable<TaskEntity> {
    try {
      const task = new TaskEntity();
      task.taskName = tasks.taskName;
      task.taskDescription = tasks.taskDescription;
      task.createdTaskUser = currentUserId;
      task.createdAt = new Date();
      task.updatedAt = new Date();
      task.taskStatus = false;

      return from(this.taskRepository.save(task));
    } catch (error) {
      console.error('Error in createTask method:', error);
      throw new Error('An unexpected error occurred');
    }
  }

  verifyTask(
    currentUserId: string,
    taskId: string,
    verify: boolean,
  ): Observable<TaskEntity> {
    const isVerified = typeof verify === 'string' ? verify === 'true' : verify;
    return from(this.taskRepository.findOne({ where: { id: taskId } })).pipe(
      switchMap((task) => {
        if (!task) {
          throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
        }

        if (
          task.assignedUsers !== currentUserId ||
          task.createdTaskUser !== currentUserId
        ) {
          throw new HttpException(
            'You are not assigned to this task',
            HttpStatus.BAD_REQUEST,
          );
        }

        return from(
          this.taskRepository.update(taskId, {
            closedAt: new Date(),
            updatedAt: new Date(),
            taskStatus: isVerified,
            closedTaskUser: currentUserId,
          }),
        ).pipe(
          switchMap(() => {
            return from(this.taskRepository.findOne({ where: { id: taskId } }));
          }),
        );
      }),
      catchError((error) => {
        console.error('Error in verifyTask method:', error);
        return throwError(
          () =>
            new HttpException(
              'An unexpected error occurred',
              HttpStatus.NON_AUTHORITATIVE_INFORMATION,
            ),
        );
      }),
    );
  }

  sendComment(
    currentUserId: string,
    taskId: string,
    comment: string,
  ): Observable<TaskEntity> {
    return from(this.taskRepository.findOne({ where: { id: taskId } })).pipe(
      switchMap((task) => {
        if (!task) {
          throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
        }

        if (task.assignedUsers !== currentUserId) {
          throw new HttpException(
            'You are not assigned to this task',
            HttpStatus.BAD_REQUEST,
          );
        }

        const updatedComments = task.comments
          ? [...task.comments, comment]
          : [comment];

        return from(
          this.taskRepository
            .update(taskId, {
              comments: updatedComments,
              updatedAt: new Date(),
            })
            .then(() => this.taskRepository.findOne({ where: { id: taskId } })),
        );
      }),
    );
  }

  currentTask(
    userId: string,
    sort: string,
    pagination: PaginationDTO,
    sortTime: string,
  ): Observable<{ results: TaskEntity[]; meta: TotalDto }> {
    const taskStatusMap = {
      Closed: true,
      NotClosed: false,
      All: undefined,
    };

    const taskStatus = taskStatusMap[sort];

    return from(
      this.taskRepository.find({
        where: {
          createdTaskUser: userId,
          ...(taskStatus !== undefined ? { taskStatus } : {}),
          deletedAt: null,
        },
      }),
    ).pipe(
      switchMap((tasks) => {
        if (tasks.length === 0) {
          throw new HttpException(
            'You do not have any tasks',
            HttpStatus.NOT_FOUND,
          );
        }

        const sortedTask = tasks.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortTime === 'ASC' ? dateA - dateB : dateB - dateA;
        });

        const itemCount = tasks.length;
        const pageCount = Math.ceil(itemCount / pagination.limit);
        const page = Math.floor(pagination.skip / pagination.limit) + 1;
        const hasPreviousPage = page > 1;
        const hasNextPage = page < pageCount;

        const meta: TotalDto = {
          page,
          take: pagination.limit,
          itemCount,
          pageCount,
          hasPreviousPage,
          hasNextPage,
        };

        return of({ results: sortedTask, meta });
      }),
    );
  }

  assignedTask(
    userId: string,
    sort: string,
    pagination: PaginationDTO,
    sortTime: string,
  ): Observable<{ results: TaskEntity[]; meta: TotalDto }> {
    const taskStatusMap = {
      Closed: true,
      NotClosed: false,
      All: undefined,
    };

    const taskStatus = taskStatusMap[sort];

    return from(
      this.taskRepository.find({
        where: {
          createdTaskUser: userId,
          ...(taskStatus !== undefined ? { taskStatus } : {}),
          deletedAt: null,
        },
      }),
    ).pipe(
      switchMap((tasks) => {
        if (tasks.length === 0) {
          throw new HttpException(
            'You do not have any assigned tasks',
            HttpStatus.NOT_FOUND,
          );
        }

        const sortedTask = tasks.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortTime === 'ASC' ? dateA - dateB : dateB - dateA;
        });

        const itemCount = tasks.length;
        const pageCount = Math.ceil(itemCount / pagination.limit);
        const page = Math.floor(pagination.skip / pagination.limit) + 1;
        const hasPreviousPage = page > 1;
        const hasNextPage = page < pageCount;

        const meta: TotalDto = {
          page,
          take: pagination.limit,
          itemCount,
          pageCount,
          hasPreviousPage,
          hasNextPage,
        };

        return of({ results: sortedTask, meta });
      }),
    );
  }

  modifyAssigned(
    currentUserId: string,
    id: string,
    assignedUsers: string,
  ): Observable<TaskEntity> {
    return from(
      this.taskRepository.findOne({
        where: { id: id, createdTaskUser: currentUserId },
      }),
    ).pipe(
      switchMap((task) => {
        if (task) {
          if (task.assignedUsers === assignedUsers) {
            return from(
              this.taskRepository.update(id, {
                assignedUsers: null,
                updatedAt: new Date(),
              }),
            ).pipe(map(() => task));
          } else {
            return from(
              this.taskRepository.update(id, {
                assignedUsers: assignedUsers,
                updatedAt: new Date(),
              }),
            ).pipe(map(() => task));
          }
        } else {
          throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
        }
      }),
    );
  }

  modifyFile(currentUserId: string, taskId: string, file: Express.Multer.File) {
    return from(
      this.taskRepository.findOne({
        where: { id: taskId, createdTaskUser: currentUserId },
      }),
    ).pipe(
      switchMap(() => {
        const code =
          file && file.buffer.length > 0
            ? this.codeService.saveCode(currentUserId, file)
            : of(null);
        return code.pipe(
          switchMap((code) => {
            const contentIds = code.id;
            const newRelation = this.relationRepositry.create({
              file: [contentIds],
            });
            return from(this.relationRepositry.save(newRelation)).pipe(
              switchMap(() => {
                return from(
                  this.taskRepository.update(taskId, {
                    taskFile: newRelation,
                    updatedAt: new Date(),
                  }),
                );
              }),
            );
          }),
        );
      }),
    );
  }

  modifyTaskName(
    currentUserId: string,
    taskId: string,
    name: string,
  ): Observable<TaskEntity> {
    return from(this.taskRepository.findOne({ where: { id: taskId } })).pipe(
      switchMap((task) => {
        if (
          task.assignedUsers === currentUserId ||
          task.createdTaskUser === currentUserId
        ) {
          return from(
            this.taskRepository.update(taskId, {
              taskName: name,
              updatedAt: new Date(),
            }),
          ).pipe(map(() => task));
        } else {
          throw new HttpException(
            'You are not authorized to modify name this task',
            HttpStatus.FORBIDDEN,
          );
        }
      }),
    );
  }
  modifyDescription(
    currentUserId: string,
    taskId: string,
    name: string,
  ): Observable<TaskEntity> {
    return from(this.taskRepository.findOne({ where: { id: taskId } })).pipe(
      switchMap((task) => {
        if (
          task.assignedUsers === currentUserId ||
          task.createdTaskUser === currentUserId
        ) {
          return from(
            this.taskRepository.update(taskId, {
              taskDescription: name,
              updatedAt: new Date(),
            }),
          ).pipe(map(() => task));
        } else {
          throw new HttpException(
            'You are not authorized to modify description this task',
            HttpStatus.FORBIDDEN,
          );
        }
      }),
    );
  }

  updateTask(userId: string, taskId: string, image: string) {
    return from(this.taskRepository.findOne({ where: { id: taskId } })).pipe(
      switchMap((task) => {
        if (task.assignedUsers === userId || task.createdTaskUser === userId) {
          return from(
            this.taskRepository.update(taskId, {
              imageUrl: image,
            }),
          ).pipe(map(() => task));
        } else {
          throw new HttpException(
            'You are not authorized to update this task',
            HttpStatus.FORBIDDEN,
          );
        }
      }),
    );
  }

  modify(
    currentUserId: string,
    taskId: string,
    text: ModifyDto,
    file: Express.Multer.File | null,
  ): Observable<any> {
    const modifyFunctions = {
      name: (name: string) => this.modifyTaskName(currentUserId, taskId, name),
      description: (description: string) =>
        this.modifyDescription(currentUserId, taskId, description),
      userId: (userId: string) =>
        this.modifyAssigned(currentUserId, taskId, userId),
      comment: (comment: string) =>
        this.sendComment(currentUserId, taskId, comment),
      file: (file: Express.Multer.File) =>
        this.modifyFile(currentUserId, taskId, file),
      verify: (verify: boolean) =>
        this.verifyTask(currentUserId, taskId, verify),
    };

    const modificationObservables = Object.keys(text)
      .map((key) => {
        if (modifyFunctions[key]) {
          return modifyFunctions[key](text[key]);
        }
        return null;
      })
      .filter((fn) => fn !== null);
    if (file) {
      modificationObservables.push(modifyFunctions.file(file));
    }

    if (modificationObservables.length === 0) {
      return throwError(
        () =>
          new HttpException(
            'No valid fields provided for modification',
            HttpStatus.BAD_REQUEST,
          ),
      );
    }
    return forkJoin(modificationObservables).pipe(
      map(() => {
        return { message: 'Modification successful' };
      }),
    );
  }

  deleteTask(currentUserId: string, taskId: string): Observable<TaskEntity> {
    return from(this.taskRepository.findOne({ where: { id: taskId } })).pipe(
      switchMap((task) => {
        if (task.createdTaskUser === currentUserId) {
          return from(
            this.taskRepository.update(taskId, { deletedAt: new Date() }),
          ).pipe(map(() => task));
        } else {
          throw new HttpException(
            'You are not authorized to delete this task',
            HttpStatus.FORBIDDEN,
          );
        }
      }),
    );
  }
}
