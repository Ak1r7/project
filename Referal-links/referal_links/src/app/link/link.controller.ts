import { Body, Controller, Get, Param, Post, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { LinkService } from "./link.service";
import { CreateLinkDto } from "./dto/link.dto";


@Controller()

export class LinkController{
    
    constructor(private readonly linkService: LinkService) {}
  
    @Post('users/link')
    @UsePipes(new ValidationPipe())
    async createLink(
      @Body('link') linkdto: CreateLinkDto,
    ): Promise<any> {
      const link = await this.linkService.createLink(linkdto);
      return this.linkService.buildLinkResponse(link); 
    }
    @Get('/links')
    async getAllLinks(): Promise<any> {
      const links = await this.linkService.getAllLinks();
      console.log(links)
      return this.linkService.buildLinksResponse(links);
    }


    
  }
 