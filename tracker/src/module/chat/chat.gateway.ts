import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { WebsocketsExceptionFilter } from './interface/ws-excepton.filter';
import { ChatDto } from './dto/chat.dto';
import { ChatService } from './chat.service';
import { ChatFileShareDto } from './dto/chat.file-share.dto';
import { UserService } from '../user/user.service';
import { jwtDecode } from 'jwt-decode';
import { UpdateDto } from './dto/update-message.dto';
import { DeleteDto } from './dto/delete.dto';
import { RoomDto } from './dto/room.dto';
import { AcceptDto } from './dto/accept.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseFilters(new WebsocketsExceptionFilter())
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
  ) {}
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.server = server;
  }

  handleConnection(client: Socket) {
    this.logger.log('Client connected:', client.id);
    this.server.emit('client-connected', client.id);

    const decoded = jwtDecode(client.handshake.headers.authorization);
    const id = decoded['sub'];

    this.userService.connectUser(id, client.id).subscribe({
      next: (user) => this.logger.log('User connected:', user.email),
      error: (err) => console.error('Connection error:', err),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Client disconnected:', client.id);
    this.server.emit('client-disconnected', client.id);
    const decoded = jwtDecode(client.handshake.headers.authorization);
    const id = decoded['sub'];
    this.userService.disconnectUser(id).subscribe({
      next: (user) => this.logger.log('User disconnect:', user.email),
      error: (err) => console.error('Connection error:', err),
    });
  }

  @SubscribeMessage('create-message')
  @UsePipes(new ValidationPipe())
  handleMessage(
    @MessageBody() message: ChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const dec = jwtDecode(client.handshake.headers.authorization);
      const id = dec['sub'];
      this.logger.log(
        `User ${id} sending message to ${message.to}: ${message.message}`,
      );

      const toUser = this.chatService.getUserSocketId(message.to);
      toUser.subscribe({
        next: (recipientSocketId) => {
          if (recipientSocketId) {
            this.chatService.checkAccepted(id, message.to).subscribe({
              next: (isAccepted) => {
                if (isAccepted) {
                  this.chatService.sendMessage(id, message, true);
                  this.server
                    .to(recipientSocketId)
                    .emit('create-message', message);
                  client.emit('notification-sent', true);
                  client.emit('message-created', {
                    message: `${message.message}`,
                  });
                } else {
                  this.chatService.sendMessage(id, message, false);
                  this.server
                    .to(recipientSocketId)
                    .emit('create-message', message);
                  this.server.to(recipientSocketId).emit('send-request', {
                    from: id,
                    to: message.to,
                    message: 'You have a chat request.',
                  });
                  client.emit('notification-sent', true);
                  client.emit('message-created', {
                    message: `${message.message}`,
                  });
                }
              },
              error: (error) => {
                this.logger.error('Error checking acceptance:', error.stack);
                client.emit('notification-sent', false);
                client.emit('message-error', { error: error.message });
              },
            });
          } else {
            client.emit('message-error', {
              error: 'Recipient is offline.',
            });
            client.emit('notification-sent', false);
            this.server.emit('message-error', {
              error: 'Recipient is offline.',
            });
          }
        },
        error: (error) => {
          this.logger.error('Error handling create-message', error.stack);
          client.emit('notification-sent', false);
          client.emit('message-error', { error: error.message });
          this.server
            .to(client.id)
            .emit('message-error', { error: error.message });
        },
      });
    } catch (error) {
      this.server.emit('message-error', { error: error.message });
      client.emit('message-error', { error: error.message });
      client.emit('notification-sent', false);
      this.logger.error('Error handling create-message:', error);
    }
  }

  @SubscribeMessage('share-post')
  handleFile(
    @MessageBody() message: ChatFileShareDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const dec = jwtDecode(client.handshake.headers.authorization);
      const id = dec['sub'];

      this.chatService.getUserSocketId(message.to).subscribe({
        next: (recipientSocketId) => {
          if (recipientSocketId) {
            this.chatService.sendFile(id, message).subscribe({
              next: (result) => {
                this.server.to(recipientSocketId).emit('share-post', message);
                client.emit('notification-sent', true);
                client.emit('post-shared', {
                  message: result,
                });
              },
              error: (error) => {
                console.error('Error sending file:', error);
                client.emit('notification-sent', false);
                client.emit('share-post-error', {
                  error: error.message || 'Failed to send file.',
                });
              },
            });
          } else {
            client.emit('share-post-error', {
              error: 'Recipient is offline.',
            });
            client.emit('notification-sent', false);
          }
        },
        error: (error) => {
          console.error('Error getting recipient socket ID:', error);
          client.emit('share-post-error', {
            error: 'Could not determine recipient.',
          });
          client.emit('notification-sent', false);
        },
      });
    } catch (error) {
      console.error('Error handling share-post:', error);
      client.emit('share-post-error', { error: error.message });
      client.emit('notification-sent', false);
    }
  }

  @SubscribeMessage('update-message')
  @UsePipes(new ValidationPipe())
  handleUpdateMessage(
    @MessageBody() message: UpdateDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const dec = jwtDecode(client.handshake.headers.authorization);
      const id = dec['sub'];

      this.chatService.getUserSocketId([id]).subscribe({
        next: (recipientSocketId) => {
          if (recipientSocketId) {
            this.chatService.updateMessage(id, message).subscribe({
              next: (result) => {
                this.server
                  .to(recipientSocketId)
                  .emit('update-message', message);
                client.emit('message-updated', {
                  message: result,
                });
              },
              error: (error) => {
                console.error('Error update message:', error);
                client.emit('update-error', {
                  error: error.message || 'Failed to update message.',
                });
              },
            });
          } else {
            client.emit('update-error', {
              error: 'Recipient is offline.',
            });
          }
        },
        error: (error) => {
          console.error('Error getting recipient socket ID:', error);
          client.emit('update-error', {
            error: 'Could not determine recipient.',
          });
        },
      });
    } catch (error) {
      console.error('Error handling update-message:', error);
      client.emit('update-error', { error: error.message });
    }
  }

  @SubscribeMessage('delete-message')
  handleDeleteMessage(
    @MessageBody() id: DeleteDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const dec = jwtDecode(client.handshake.headers.authorization);
      const userId = dec['sub'];

      this.chatService.getUserSocketId([userId]).subscribe({
        next: (recipientSocketId) => {
          if (recipientSocketId) {
            this.chatService.deletedMessage(userId, id.id).subscribe({
              next: (result) => {
                this.server.to(recipientSocketId).emit('delete-message', id.id);
                client.emit('message-delete', {
                  message: result,
                });
              },
              error: (error) => {
                console.error('Error delete message:', error);
                client.emit('delete-error', {
                  error: error.message || 'Failed to update message.',
                });
              },
            });
          } else {
            client.emit('delete-error', {
              error: 'Recipient is offline.',
            });
          }
        },
        error: (error) => {
          console.error('Error getting recipient socket ID:', error);
          client.emit('delete-error', {
            error: 'Could not determine recipient.',
          });
        },
      });
    } catch (error) {
      console.error('Error handling delete-message:', error);
      client.emit('delete-error', { error: error.message });
    }
  }

  @SubscribeMessage('room-joined')
  handleRoomJoined(
    @MessageBody() room: RoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.server.on('connection', (socket) => {
      socket.join('some room');
    });
    client.join(room.room);
    client.emit('room-joined', { room: room.room });
    this.logger.log(`Client ${client.id} joined room ${room.room}`);
  }

  @SubscribeMessage('room-leave')
  handleRoomLeave(
    @MessageBody() room: RoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.server.on('connection', (socket) => {
      socket.join('some room');
    });
    client.leave(room.room);
    client.emit('room-leave', { room: room.room });
    this.logger.log(`Client ${client.id} leave room ${room.room}`);
  }
  @SubscribeMessage('accept-request')
  handleAcceptRequest(
    @MessageBody() data: AcceptDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const dec = jwtDecode(client.handshake.headers.authorization);
      const userId = dec['sub'];
      this.chatService.acceptedMessage(userId, data.user).subscribe({
        next: (result) => {
          client.emit('request-accepted', {
            userId: data.user,
            accepted: result,
          });
        },
        error: (error) => {
          console.error('Error accepting request:', error);
          client.emit('accept-request-error', {
            userId: data.user,
            error: error.message || 'Failed to accept request.',
          });
        },
      });
    } catch (error) {
      console.error('Error handling accept-request:', error);
      client.emit('accept-request-error', {
        userId: data.user,
        error: error.message,
      });
    }
  }
}
