import { ValidDto } from '@core/auth/dto/valid.dto';
import { AuthGuard } from '@core/auth/guard/auth.guard';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequestWithUser } from '../user/decorator/user.decorator';

import { NotificationLinkDto } from './dto/norification-link.dto';
import { LinkService } from './link.service';

@ApiBearerAuth()
@ApiTags('Link')
@Controller()
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

  @Get('link')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Send Link for save date' })
  async saveDate(
    @Query('link') link: string,
    @RequestWithUser() req: ValidDto,
  ): Promise<NotificationLinkDto> {
    const result = await this.linkService.saveDateApi(link, req);
    return result;
  }
}
