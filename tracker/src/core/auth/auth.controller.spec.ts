import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { of, throwError } from 'rxjs';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { mockRequest, mockResponse } from 'jest-mock-req-res';
import { UserEntity } from 'src/module/entity/user.entity';
import { UserService } from 'src/module/user/user.service';
import { AuthLoginDto } from '../type/auth/dto/auth-login.dto';
import { AuthRegisterDto } from '../type/auth/dto/auth-register.dto';
import { UserResponsInterface } from '../type/user/interface/user.interface';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            validateUser: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            buildUserResponse: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a user and return the user response', (done) => {
      const authRegisterDto: AuthRegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };
      const userEntity: UserEntity & { token: string; refreshToken: string } = {
        ...new UserEntity(),
        token: 'jwt_token',
        refreshToken: 'refresh_token',
        hashPassword: jest.fn(),
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };
      jest.spyOn(authService, 'register').mockReturnValue(of(userEntity));
      jest.spyOn(userService, 'buildUserResponse').mockReturnValue({
        user: {
          ...userEntity,
          token: 'jwt_token',
          refreshToken: 'refresh_token',
        },
      });

      controller.register(authRegisterDto).subscribe({
        next: (result) => {
          expect(result).toEqual({
            user: {
              ...userEntity,
              token: 'jwt_token',
              refreshToken: 'refresh_token',
            },
          });
          done();
        },
      });
    });

    it('should throw BadRequestException if registration fails', (done) => {
      const authRegisterDto: AuthRegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };
      const error = new Error('Registration failed');
      jest
        .spyOn(authService, 'register')
        .mockReturnValue(throwError(() => error));

      controller.register(authRegisterDto).subscribe({
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.message).toBe('Registration failed');
          done();
        },
      });
    });
  });

  describe('login', () => {
    it('should login a user and return access token', (done) => {
      const authLoginDto: AuthLoginDto = {
        id: 1,
        email: 'test@example.com',
        password: 'password123',
      };
      const userEntity = new UserEntity();
      const Token = {
        access_token: 'jwt_token',
        refresh_token: 'refresh_token',
      };
      jest.spyOn(authService, 'validateUser').mockReturnValue(of(userEntity));
      jest.spyOn(authService, 'login').mockReturnValue(of(Token));

      controller.login(authLoginDto).subscribe({
        next: (result) => {
          expect(result).toEqual(Token);
          done();
        },
      });
    });

    it('should throw UnauthorizedException if validation fails', (done) => {
      const authLoginDto: AuthLoginDto = {
        id: 1,
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      jest.spyOn(authService, 'validateUser').mockReturnValue(of(null));

      controller.login(authLoginDto).subscribe({
        error: (err) => {
          expect(err).toBeInstanceOf(UnauthorizedException);
          done();
        },
      });
    });
  });
  describe('currentUser', () => {
    it('should current user ', (done) => {
      const userEntity: UserEntity = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
        hashPassword: jest.fn(),
      };
      const userRespons: UserResponsInterface = {
        user: {
          id: 1,
          email: 'tes@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'password123',
          token: 'jwt_token',
          refreshToken: 'refresh_token',
        },
      };
      jest.spyOn(userService, 'buildUserResponse').mockReturnValue(userRespons);
      controller.currentUser(userEntity).subscribe({
        next: (result) => {
          expect(result).toEqual(userRespons);
          done();
        },
        error: (err) => {
          done(err);
        },
      });
    });
  });
  describe('googleCallback', () => {
    it('should call googleCallback for redirect', (done) => {
      const loginResponse = {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
      };
      const req = mockRequest({
        user: {
          id: 1,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'password123',
          hashPassword: jest.fn(),
        },
      });
      const res = mockResponse({
        redirect: jest.fn(),
      });
      jest.spyOn(authService, 'login').mockReturnValue(of(loginResponse));
      controller.googleCallback(req, res).subscribe({
        complete: () => {
          expect(authService.login).toHaveBeenCalledWith(req.user);
          expect(res.redirect).toHaveBeenCalledWith(
            'http://localhost:5173?token=test_access_token&refreshtoken=test_refresh_token',
          );
          done();
        },
      });
    });
    it('should send 500 Internal Server Error on login failure', (done) => {
      const mockRes = mockResponse();
      const mockReq = mockRequest({
        user: { id: 1, name: 'John Doe' },
      });
      jest
        .spyOn(authService, 'login')
        .mockReturnValue(throwError(() => new Error('Login failed')));
      controller.googleCallback(mockReq, mockRes).subscribe({
        error: () => {
          expect(mockRes.status).toHaveBeenCalledWith(500);
          expect(mockRes.send).toHaveBeenCalledWith('Internal Server Error');
        },
      });
      done();
    });
  });
  describe('googleLogin', () => {
    it('should call googleLogin', () => {
      controller.googleLogin();
      expect(controller.googleLogin);
    });
  });
});
