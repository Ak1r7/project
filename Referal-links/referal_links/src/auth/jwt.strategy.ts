import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../app/user/user.service'; 
import { UserEntity } from '../app/user/user.entity'; 

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'reflink', 
    });
  }

  async validate(payload: any): Promise<UserEntity> {
    return this.usersService.findById(payload.sub);
  }
}