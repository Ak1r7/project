import { ValidDto } from '@core/auth/dto/valid.dto';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { UserService } from '../user/user.service';

import { LinkDto } from './dto/link.dto';
import { NotificationLinkDto } from './dto/norification-link.dto';
import { LinkInfoEntity } from './entity/link-info.entity';
import { LinkEntity } from './entity/link.entity';

@Injectable()
export class LinkService {
  constructor(
    @InjectRepository(LinkEntity)
    private readonly linkRepository: Repository<LinkEntity>,
    @InjectRepository(LinkInfoEntity)
    private readonly linkInfoRepository: Repository<LinkInfoEntity>,
    private readonly userService: UserService,
  ) {}

  async saveDateApi(
    linkInfo: string,
    req: ValidDto,
  ): Promise<NotificationLinkDto> {
    const existLink = await this.findById(linkInfo);
    if (existLink) {
      const result: NotificationLinkDto = {
        message: 'In process...',
        link: linkInfo,
      };
      return result;
    }

    const linkContent = await this.extracInfo(linkInfo);
    if (!linkContent) {
      const result: NotificationLinkDto = {
        message: 'Faild to get info on link',
        link: linkInfo,
      };
      return result;
    }
    await this.saveInfo(linkInfo, req, linkContent);

    const result: NotificationLinkDto = {
      message: 'In process...',
      link: linkInfo,
    };
    return result;
  }

  async extracInfo(linkUrl: string, retries = 3): Promise<string[] | null> {
    try {
      const response = await axios.get<string[]>(linkUrl, { timeout: 10000 });
      return response.data;
    } catch (err: unknown) {
      Logger.error('Invalid link. Error: ', err);
      if (retries < 0) {
        Logger.error(
          `Failed to fetch data from ${linkUrl} after multiple attempts.`,
        );
        return null;
      }
      return this.extracInfo(linkUrl, retries - 1);
    }
  }

  async saveInfo(
    linkInfo: string,
    req: ValidDto,
    dateLink: string[],
  ): Promise<boolean> {
    const userRequere = await this.userService.findByEmail(req.email);
    if (!userRequere) {
      Logger.error('Invalide user');
      throw new HttpException('Invalide user', HttpStatus.BAD_REQUEST);
    }

    const savelink = this.linkRepository.create({
      userId: userRequere.id,
      link: linkInfo,
    });
    await this.linkRepository.save(savelink);

    const saveLinkContent = this.linkInfoRepository.create({
      record: dateLink.map((info) => {
        return info;
      }),
      linkId: savelink.id,
    });
    await this.linkInfoRepository.save(saveLinkContent);
    return true;
  }

  async findById(url: string): Promise<LinkDto | null> {
    const link = await this.linkRepository.findOne({
      where: { link: url },
    });
    return plainToInstance(LinkDto, link);
  }
}
