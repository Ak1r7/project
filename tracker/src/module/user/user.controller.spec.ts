import { UserController } from './user.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from '../code/entity/user.entity';
import { of, throwError } from 'rxjs';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UpdateUserDto } from 'src/core/type/user/dto/update-user.dto';
import { UserResponsInterface } from 'src/core/type/user/interface/user.interface';
import { UserService } from './user.service';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  const mockUserEntity: UserEntity = {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'password123',
    hashPassword: jest.fn(),
  };

  const mockUserResponse: UserResponsInterface = {
    user: {
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123',
      token: 'jwt_token',
      refreshToken: 'refresh_token',
    },
  };

  const mockUpdateUserDto: UpdateUserDto = {
    firstName: 'John',
    lastName: 'Doe Updated',
  };

  beforeEach(async () => {
    const mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    const mockUserService = {
      buildUserResponse: jest.fn(),
      updateUser: jest.fn(),
      currentUser: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
      ],
    }).compile();
    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('currentUser', () => {
    it('should return current user details', (done) => {
      jest
        .spyOn(userService, 'buildUserResponse')
        .mockReturnValue(mockUserResponse);

      userController.currentUser(mockUserEntity).subscribe({
        next: (result) => {
          expect(result).toEqual(mockUserResponse);
          done();
        },
        error: (err) => {
          done(err);
        },
      });
    });
  });

  describe('updateCurrentUser', () => {
    it('should successfully update current user', (done) => {
      const updatedUserResponse: UserResponsInterface = {
        user: {
          ...mockUserResponse.user,
          lastName: 'Doe Updated',
        },
      };
      jest.spyOn(userService, 'updateUser').mockReturnValue(
        of({
          ...mockUserEntity,
          lastName: 'Doe Updated',
        } as UserEntity),
      );
      jest
        .spyOn(userService, 'buildUserResponse')
        .mockReturnValue(updatedUserResponse);

      userController
        .updateCurrentUser(mockUserEntity.id, mockUpdateUserDto)
        .subscribe({
          next: (response) => {
            expect(response).toEqual(updatedUserResponse);
            done();
          },
          error: (err) => {
            done(err);
          },
        });
    });

    it('should throw BadRequestException when update fails', (done) => {
      jest
        .spyOn(userService, 'updateUser')
        .mockReturnValue(throwError(() => new Error()));

      userController
        .updateCurrentUser(mockUserEntity.id, mockUpdateUserDto)
        .subscribe({
          error: (error) => {
            expect(error).toBeInstanceOf(BadRequestException);
            expect(error.message).toBe('Unable to update user');
            done();
          },
        });
    });
  });
});
