import { Body, Controller, Get, Post, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/createUser.dto";
import { UserEntity } from "./user.entity";
import { User } from "./decorators/user.decorator";
import { UserResponsInterface } from "./types/userResponse.interface";
import { LoginUserDto } from "./dto/login.dto";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";

@ApiBearerAuth()
@Controller()
export class UserController{
    constructor(private readonly userService: UserService) {}
  @Post('users')
  @UsePipes(new ValidationPipe())
  async createUser(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<any> {
    const user = await this.userService.createUser(createUserDto);

    return this.userService.buildUserResponse(user);
}

    @Get('user')
    @ApiOperation({ description: 'Get user profile' })
    @UseGuards(AuthGuard('jwt'))
    async currentUser(@User() user: UserEntity): Promise<UserResponsInterface> {
      console.log(user)
    return this.userService.buildUserResponse(user);
    }

    @Post('users/login')
    @UsePipes(new ValidationPipe())
    async login(
      @Body('user') loginUserDto: LoginUserDto,
    ): Promise<UserResponsInterface> {
      const user = await this.userService.login(loginUserDto);
      return this.userService.buildUserResponse(user);
    }
  

}