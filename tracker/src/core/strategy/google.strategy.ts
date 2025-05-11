import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigType } from '@nestjs/config';
import { AuthService } from '../auth/auth.service';
import googleOauthConfig from '../type/auth/config/google-oauth.config';
import { GoogleAuthGuardDto } from '../type/google/google.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleOauthConfig.KEY)
    private googleConfiguration: ConfigType<typeof googleOauthConfig>,
    private authService: AuthService,
  ) {
    super({
      clientID: googleConfiguration.clinetID,
      clientSecret: googleConfiguration.clientSecret,
      callbackURL: googleConfiguration.callbackURL,
      scope: ['email', 'profile'],
    });
  }

  validate(
    access_token: string,
    refresh_token: string,
    profile: GoogleAuthGuardDto,
    done: VerifyCallback,
  ) {
    return this.authService
      .validateGoogleUser({
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
      })
      .subscribe(
        (user) => {
          done(null, user);
        },
        (error) => {
          done(error, false);
        },
      );
  }
}
