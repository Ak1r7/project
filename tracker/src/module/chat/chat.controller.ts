import {
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { User } from 'src/core/type/user/decorators/user.decorator';
import { ChatService } from './chat.service';
import { PaginationDTO } from 'src/core/type/pagination/pagination.dto';
import { ChatEntity } from './chat.entity';
import { from, Observable } from 'rxjs';
import { TotalDto } from './dto/total.dto';

@ApiBearerAuth()
@Controller()
@ApiTags('Message')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('checkAllMessage')
  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({ name: 'skip', type: 'number' })
  @ApiQuery({ name: 'limit', type: 'number' })
  @ApiQuery({ name: 'user', type: 'string' })
  @ApiQuery({ name: 'sort', type: 'string', enum: ['ASC', 'DESC'] })
  getMessage(
    @User('userId') id: string,
    @Query() paginationDTO: PaginationDTO,
    @Query('user') user: string,
    @Query('sort') sort: string,
  ): Observable<{ results: ChatEntity[]; meta: TotalDto }> {
    const message = {
      user: user,
      limit: paginationDTO.limit.toString(),
      skip: paginationDTO.skip.toString(),
      sort: sort,
    };
    return this.chatService.getMessage(id, message);
  }

  @Delete('deleteMessage')
  @UseGuards(AuthGuard('jwt'))
  deleteMessage(
    @User('userId') userId: string,
    @Query('id') id: string,
  ): Observable<any> {
    return this.chatService.deletedMessage(userId, id);
  }

  @Post('acceptedMessage')
  @UseGuards(AuthGuard('jwt'))
  accepted(
    @User('userId') userId: string,
    @Query('id') id: string,
  ): Observable<ChatEntity[]> {
    return from(this.chatService.acceptedMessage(userId, id));
  }
}
