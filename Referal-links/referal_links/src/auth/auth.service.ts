import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../app/user/user.service';
import {compare} from 'bcrypt'
import { UserEntity } from '@app/app/user/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UserService, private readonly jwtService: JwtService) {}

async validateUser(username: string, password: string): Promise<Omit<UserEntity, 'password' | 'hashPassword'> | null> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await compare(password, user.password))) {
        const { password, hashPassword, ...result } = user; 
        return result; 
    }
    return null;
}


  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
