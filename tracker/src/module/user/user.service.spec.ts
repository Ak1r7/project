import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { of } from 'rxjs';
import { UserService } from './user.service';
import { HttpException } from '@nestjs/common';
import { AuthRegisterDto } from 'src/core/type/auth/dto/auth-register.dto';
import { CreateUserGmailDto } from 'src/core/type/google/createUserGmail.dto';
import { UserEntity } from '../code/entity/user.entity';

jest.setTimeout(10000);
describe('UserService', () => {
  let service: UserService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('findByEmail', () => {
    it('should return a user entity by email', (done) => {
      const email = 'test@example.com';
      const user = { email } as UserEntity;

      mockUserRepository.findOne.mockReturnValue(of(user));

      service.findByEmail(email).subscribe((result) => {
        expect(result).toEqual(user);
        expect(mockUserRepository.findOne).toHaveBeenCalledWith({
          where: { email },
        });
        done();
      });
    });
  });

  describe('createUser', () => {
    it('should throw an exception if email is already taken', (done) => {
      const createUserDto: AuthRegisterDto = {
        email: 'test@example.com',
        password: '123456',
        firstName: 'John',
        lastName: 'Doe',
      };
      mockUserRepository.findOne.mockReturnValue(
        of({ email: 'test@example.com' }),
      );

      service.createUser(createUserDto).subscribe({
        error: (error) => {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.message).toBe('Email is already taken');
        },
      });
      done();
    });

    it('should save a new user if email is not taken', (done) => {
      const createUserDto: AuthRegisterDto = {
        email: 'test@example.com',
        password: '123456',
        firstName: 'John',
        lastName: 'Doe',
      };
      const newUser = { ...createUserDto, id: 1 } as UserEntity;

      mockUserRepository.findOne.mockReturnValue(of(null));
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockReturnValue(of(newUser));

      service.createUser(createUserDto).subscribe((result) => {
        expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
        expect(mockUserRepository.save).toHaveBeenCalledWith(newUser);
        expect(result).toEqual(newUser);
      });
      done();
    });
  });

  describe('createUserGmail', () => {
    it('should throw an exception if Gmail email is already taken', (done) => {
      const createUserGmailDto: CreateUserGmailDto = {
        email: 'test@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
      };
      mockUserRepository.findOne.mockReturnValue(
        of({ email: 'test@gmail.com' }),
      );

      service.createUserGmail(createUserGmailDto).subscribe({
        error: (error) => {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.message).toBe('Email is already taken');
        },
      });
      done();
    });

    it('should save a new user from Gmail if email is not taken', (done) => {
      const createUserGmailDto: CreateUserGmailDto = {
        email: 'test@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
      };
      const newUser = { ...createUserGmailDto, id: 1 } as UserEntity;

      mockUserRepository.findOne.mockReturnValue(of(null));
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockReturnValue(of(newUser));

      service.createUserGmail(createUserGmailDto).subscribe((result) => {
        expect(mockUserRepository.create).toHaveBeenCalledWith(
          createUserGmailDto,
        );
        expect(mockUserRepository.save).toHaveBeenCalledWith(newUser);
        expect(result).toEqual(newUser);
      });
      done();
    });
  });

  describe('findById', () => {
    it('should return a user entity by id', (done) => {
      const id = 1;
      const user = { id } as UserEntity;
      mockUserRepository.findOne.mockReturnValue(of(user));
      service.findById(id).subscribe((result) => {
        expect(result).toEqual(user);
        expect(mockUserRepository.findOne).toHaveBeenCalledWith({ id });
        done();
      });
      done();
    });

    describe('updateUser', () => {
      it('should update a user entity by id', (done) => {
        const userId = 1;
        const updateUserDto = {
          firstName: 'Jane',
          lastName: 'Doe',
        };
        const updatedUser = { ...updateUserDto, id: userId } as UserEntity;
        mockUserRepository.save.mockReturnValue(of(updatedUser));
        service.updateUser(userId, updateUserDto).subscribe((result) => {
          expect(result).toEqual(updatedUser);
          expect(mockUserRepository.save).toHaveBeenCalledWith(updatedUser);
          done();
        });
      });
    });

    describe('generateToken', () => {
      it('should generate an access token', () => {
        const user: UserEntity = {
          id: 1,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        } as UserEntity;
        process.env.ACCESS_TOKEN_SECRET = 'access-secret';

        const token = service.generateToken(user, 'access');

        expect(token).toBeDefined();
      });

      it('should generate a refresh token', () => {
        const user: UserEntity = {
          id: 1,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        } as UserEntity;
        process.env.REFRESH_TOKEN_SECRET = 'refresh-secret';

        const token = service.generateToken(user, 'refresh');

        expect(token).toBeDefined();
      });
    });

    describe('buildUserResponse', () => {
      it('should return a user response with tokens', () => {
        const user: UserEntity = {
          id: 1,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        } as UserEntity;
        jest.spyOn(service, 'generateToken').mockReturnValue('test-token');

        const response = service.buildUserResponse(user);

        expect(response.user.token).toBe('test-token');
        expect(response.user.refreshToken).toBe('test-token');
      });
    });
  });
});
