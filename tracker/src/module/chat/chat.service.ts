import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ChatEntity } from './chat.entity';
import { UserService } from '../user/user.service';
import { CodeService } from '../code/code.service';
import { ChatDto } from './dto/chat.dto';
import { WebSocketServer } from '@nestjs/websockets';
import {
  catchError,
  defaultIfEmpty,
  filter,
  forkJoin,
  from,
  map,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { Server } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatFileShareDto } from './dto/chat.file-share.dto';
import { UpdateDto } from './dto/update-message.dto';
import { TotalDto } from './dto/total.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,

    private readonly userService: UserService,

    private readonly codeService: CodeService,
  ) {}
  @WebSocketServer()
  server: Server;

  sendMessage(userId: string, message: ChatDto, accept: boolean) {
    const chat = new ChatEntity();
    chat.from_user_id = userId;
    chat.to_user_id = message.to;
    chat.content = message.message;
    chat.accepted = accept;
    chat.createdAt = new Date();
    chat.updatedAt = new Date();
    return this.chatRepository.save(chat);
  }

  sendFile(userId: string, message: ChatFileShareDto): Observable<any> {
    const chat = new ChatEntity();
    const files = message.fileId.map((fileId) =>
      this.codeService.findFileById(fileId),
    );
    return forkJoin(files).pipe(
      switchMap((file) => {
        chat.from_user_id = userId;
        chat.to_user_id = message.to;
        chat.content = message.message;
        chat.accepted = false;
        chat.createdAt = new Date();
        chat.updatedAt = new Date();
        chat.file_id = file.map((files) => files.id);
        return of(this.chatRepository.save(chat));
      }),
    );
  }

  findByFrom(id: string) {
    return from(
      this.chatRepository.find({
        where: { from_user_id: id },
      }),
    );
  }

  getMessage(
    id: string,
    message: { user: string; limit: string; skip: string; sort: string },
  ): Observable<{ results: ChatEntity[]; meta: TotalDto }> {
    const userId = message.user;
    const limit = parseInt(message.limit, 10) || 10;
    const skip = parseInt(message.skip, 10) || 0;

    const userFrom = this.findByFrom(id);
    const userTo = this.findByFrom(userId);

    return forkJoin([userFrom, userTo]).pipe(
      switchMap(([userFrom, userTo]) => {
        const users = [...userFrom, ...userTo];

        const filteredUsers = users.filter(
          (user) =>
            (user.to_user_id.includes(userId) && user.deletedAt === null) ||
            (user.to_user_id.includes(id) && user.deletedAt === null),
        );

        const sortedUsers = filteredUsers.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();

          const dateB = new Date(b.createdAt).getTime();

          return message.sort === 'ASC' ? dateA - dateB : dateB - dateA;
        });

        this.readChat(filteredUsers);

        const itemCount = filteredUsers.length;
        const pageCount = Math.ceil(itemCount / limit);
        const page = Math.floor(skip / limit) + 1;
        const hasPreviousPage = page > 1;
        const hasNextPage = page < pageCount;

        const meta: TotalDto = {
          page,
          take: limit,
          itemCount,
          pageCount,
          hasPreviousPage,
          hasNextPage,
        };

        const paginatedUsers = sortedUsers.slice(skip, skip + limit);

        return of({ results: paginatedUsers, meta });
      }),
    );
  }

  readChat(chatId: object) {
    return from(
      this.chatRepository.update(chatId, {
        seenAt: new Date(),
        updatedAt: new Date(),
      }),
    ).pipe(switchMap(() => of(this.server.emit('read', chatId))));
  }

  deletedMessage(userId: string, chatId: string) {
    return this.findByFrom(userId).pipe(
      switchMap((messages) => {
        if (!messages || messages.length === 0) {
          return throwError(
            () => new HttpException('Message not found', HttpStatus.NOT_FOUND),
          );
        }
        return from(messages).pipe(
          filter((message) => message.id === chatId),
          defaultIfEmpty(null),
          switchMap((message) => {
            if (!message) {
              return throwError(
                () => new HttpException('Id not found', HttpStatus.NOT_FOUND),
              );
            }
            return from(
              this.chatRepository.update(chatId, { deletedAt: new Date() }),
            );
          }),
        );
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  acceptedMessage(currentUserId: string, userId: string): Observable<any> {
    return from(
      this.chatRepository.find({
        where: { from_user_id: userId, accepted: false },
      }),
    ).pipe(
      map((messages) => {
        const messagesToUpdate = messages.filter((message) =>
          message.to_user_id.includes(currentUserId),
        );

        messagesToUpdate.forEach((message) => {
          message.accepted = true;
          this.chatRepository.update(message.id, { accepted: true });
        });

        return this.chatRepository.save(messagesToUpdate);
      }),
      catchError((error) => {
        console.error('Error updating messages', error);
        throw error;
      }),
    );
  }

  updateMessage(id: string, content: UpdateDto) {
    const user = from(
      this.chatRepository.find({
        where: { id: content.id, from_user_id: id },
      }),
    );
    if (!user) {
      return throwError(
        () => new HttpException('Message not found', HttpStatus.NOT_FOUND),
      );
    } else {
      return from(
        this.chatRepository.update(content.id, {
          content: content.content,
          updatedAt: new Date(),
        }),
      );
    }
  }

  getUserSocketId(userIds: string[]) {
    const userObservables = userIds.map((userId) =>
      from(this.userService.findById(userId)).pipe(
        map((user) => user.socketId),
        catchError((error) => of(error.message)),
      ),
    );
    return forkJoin(userObservables);
  }

  checkAccepted(currentUserId: string, toUser: string[]) {
    const user = this.chatRepository.find({
      where: {
        from_user_id: currentUserId,
        accepted: true,
      },
    });
    return from(user).pipe(
      map((chats) => {
        const isAccepted = chats.some((chat) => {
          return chat.to_user_id.some((id) => toUser.includes(id));
        });
        return isAccepted;
      }),
      catchError((error) => {
        console.error('Error in checkAccepted:', error);
        return of(false);
      }),
    );
  }
}
