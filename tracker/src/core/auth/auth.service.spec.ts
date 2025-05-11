import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { of, throwError } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/module/entity/user.entity';
import { UserService } from 'src/module/user/user.service';
import { AuthRegisterDto } from '../type/auth/dto/auth-register.dto';
import { CreateUserDto } from '../type/user/dto/create-user.dto';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
            findByEmail: jest.fn(),
            createUserGmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('login', () => {
    it('should return an access token', (done) => {
      const user: UserEntity = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'hashedPassword',
        hashPassword: jest.fn(),
      };
      const token = 'jwt_token';

      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      authService.login(user).subscribe({
        next: (result) => {
          expect(result.access_token).toBe(token);
          expect(jwtService.sign).toHaveBeenCalledWith(
            { sub: user.id, email: user.email },
            expect.anything(),
          );
          done();
        },
        error: () => done.fail(),
      });
    });
  });

  describe('validateGoogleUser', () => {
    it('should return existing user if found by email', (done) => {
      const googleUser: CreateUserDto = {
        email: 'newgoogle@example.com',
        firstName: 'NewGoogle',
        lastName: 'User',
        password: 'password123',
      };

      const user: UserEntity = {
        id: 1,
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        password: 'hashedPassword',
        hashPassword: jest.fn(),
      };

      jest.spyOn(userService, 'findByEmail').mockReturnValue(of(user));

      authService.validateGoogleUser(googleUser).subscribe((result) => {
        expect(result).toEqual(user);
        expect(userService.findByEmail).toHaveBeenCalledWith(googleUser.email);
        expect(userService.createUserGmail).not.toHaveBeenCalled();
        done();
      });
    });

    it('should create a new user if Google user not found', (done) => {
      const googleUser: CreateUserDto = {
        email: 'newgoogle@example.com',
        firstName: 'NewGoogle',
        lastName: 'User',
        password: 'password123',
      };

      const createdUser: UserEntity = {
        id: 1,
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        password: 'hashedPassword',
        hashPassword: jest.fn(),
      };

      jest.spyOn(userService, 'findByEmail').mockReturnValue(of(null));
      jest
        .spyOn(userService, 'createUserGmail')
        .mockReturnValue(of(createdUser));

      authService.validateGoogleUser(googleUser).subscribe({
        next: (result) => {
          expect(result).toEqual(createdUser);
          expect(userService.createUserGmail).toHaveBeenCalledWith(googleUser);
          done();
        },
        error: () => done.fail(),
      });
    });
  });

  describe('register', () => {
    it('should create a new user', (done) => {
      const user: AuthRegisterDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      const createdUser: UserEntity = {
        id: 1,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: 'hashedPassword',
        hashPassword: jest.fn(),
      };

      jest.spyOn(userService, 'createUser').mockReturnValue(of(createdUser));

      authService.register(user).subscribe({
        next: (result) => {
          expect(result).toEqual(createdUser);
          expect(userService.createUser).toHaveBeenCalledWith(user);
          done();
        },
        error: (err) => done(err),
      });
    });

    it('should handle registration errors', (done) => {
      const user: AuthRegisterDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      const err = new Error('Registration failed');
      jest.spyOn(userService, 'createUser').mockReturnValue(throwError(err));

      authService.register(user).subscribe({
        next: () => {
          done.fail('Expected an error but received a success response');
        },
        error: (error) => {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toBe('Registration failed');
          done();
        },
      });
    });
  });

  describe('validateUser', () => {
    it('should return user details if credentials are valid', (done) => {
      const user: UserEntity = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'hashedPassword',
        hashPassword: jest.fn(),
      };

      jest.spyOn(userService, 'findByEmail').mockReturnValue(of(user));
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      authService.validateUser(user.email, 'password').subscribe({
        next: (result) => {
          expect(result).toEqual({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            hashPassword: user.hashPassword,
            password: 'hashedPassword',
          });
          done();
        },
        error: () => done.fail('Expected valid user'),
      });
    });

    it('should return an error if user is invalid', (done) => {
      const user: UserEntity = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'hashedPassword',
        hashPassword: jest.fn(),
      };

      jest.spyOn(userService, 'findByEmail').mockReturnValue(of(user));
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      authService.validateUser(user.email, 'wrongPassword').subscribe({
        next: () => done.fail('Expected an error but got a success response'),
        error: () => done(),
      });
    });
  });
});
