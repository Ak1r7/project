import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { LinkEntity } from "./link.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateLinkDto } from "./dto/link.dto";
import { UserEntity } from "@app/app/user/user.entity";


@Injectable()
export class LinkService{
    constructor( @InjectRepository(LinkEntity)
    private readonly linkRepository: Repository<LinkEntity>,
    @InjectRepository(UserEntity)  
    private readonly userRepository: Repository<UserEntity>,) {}
    
    async findAll(): Promise<LinkEntity[]> {
        return await this.linkRepository.find();
      }
      
      async createLink(linkDto: CreateLinkDto): Promise<LinkEntity> {
        
        const user = await this.userRepository.findOne({ where: { id: linkDto.userId } });
    
        if (!user) {
            throw new Error('User not found');
        }
    
        const newLink = this.linkRepository.create({
            ...linkDto,
            user: user, 
        });
    
        await this.linkRepository.save(newLink);
        return newLink; 
    }
    
async getLink(
 Username: string,
  ): Promise<any> {
    const link = await this.linkRepository.findOne({
      where: { link : Username },
    });
    if (!link) {
      throw new HttpException('Link does not exist', HttpStatus.NOT_FOUND);
    }
    
    return {...link};
  }

  async getAllLinks(): Promise<LinkEntity[]> {
    const link =await this.linkRepository.find()
    return link;
  }

  buildLinkResponse(link: LinkEntity): any {
    return {
      link: {
        ...link
      },
    };
  }
  buildLinksResponse(links: LinkEntity[]): any {
    return {
      links: links.map(link => ({
        ...link
      }))
    };
  }
  
}