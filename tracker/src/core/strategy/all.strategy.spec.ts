import googleOauthConfig from '../type/auth/config/google-oauth.config';
import { GoogleStrategy } from './google.strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { JwtStrategy } from './jwt.strategy';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { GoogleAuthGuardDto } from '../type/google/google.dto';
import { ValidDto } from '../type/auth/dto/valid.dto';
import { of } from 'rxjs';
import { AuthService } from '../auth/auth.service';

describe('Auth Strategies', () => {
  const mockAuthService = {
    validateGoogleUser: jest.fn().mockReturnValue(
      of({
        userId: 123,
        email: 'test-email',
      }),
    ),
  };

  const mockGoogleConfig = {
    clinetID: 'test-client-id',
    clientSecret: 'test-client-secret',
    callbackURL: 'http://localhost/callback',
  } as ConfigType<typeof googleOauthConfig>;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'ACCESS_TOKEN_SECRET') return 'test-access-token-secret';
      if (key === 'REFRESH_TOKEN_SECRET') return 'test-refresh-token-secret';
      return null;
    }),
  };

  let googleStrategy: GoogleStrategy;
  let jwtStrategy: JwtStrategy;
  let jwtRefreshStrategy: JwtRefreshStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ envFilePath: '.test.env' })],
      controllers: [],
      providers: [
        GoogleStrategy,
        JwtStrategy,
        JwtRefreshStrategy,
        { provide: AuthService, useValue: mockAuthService },
        { provide: googleOauthConfig.KEY, useValue: mockGoogleConfig },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    googleStrategy = module.get<GoogleStrategy>(GoogleStrategy);
    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    jwtRefreshStrategy = module.get<JwtRefreshStrategy>(JwtRefreshStrategy);
  });

  describe('GoogleStrategy', () => {
    it('should validate the Google user and return the user object', (done) => {
      const users: GoogleAuthGuardDto = {
        emails: [{ value: 'test-email' }],
        name: { givenName: 'John', familyName: 'Doe' },
      };

      const mockUser = { userId: 123, email: 'test-email' };
      jest
        .spyOn(mockAuthService, 'validateGoogleUser')
        .mockReturnValue(of(mockUser));

      googleStrategy.validate(
        'access_token',
        'refresh_token',
        users,
        (err, user) => {
          expect(user).toEqual(mockUser);
          done();
        },
      );
    });
  });

  describe('JwtStrategy', () => {
    it('should validate the JWT token and return the user object', () => {
      const valid: ValidDto = {
        sub: 123,
        email: 'test-email',
      };
      jest
        .spyOn(jwtStrategy, 'validate')
        .mockReturnValue({ userId: valid.sub, email: valid.email });
      const result = jwtStrategy.validate(valid);
      expect(result).toEqual({ userId: valid.sub, email: valid.email });
    });
  });

  describe('JwtRefreshStrategy', () => {
    it('should validate the refresh JWT token and return the user object', () => {
      const valid: ValidDto = {
        sub: 123,
        email: 'test-email',
      };
      jest
        .spyOn(jwtRefreshStrategy, 'validate')
        .mockReturnValue({ userId: valid.sub, email: valid.email });
      const result = jwtRefreshStrategy.validate(valid);
      expect(result).toEqual({ userId: valid.sub, email: valid.email });
    });
  });
});
