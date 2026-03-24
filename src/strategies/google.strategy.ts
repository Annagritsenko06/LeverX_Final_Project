import { Injectable, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { VerifyCallback, Profile } from 'passport-google-oauth20';
import { Strategy, StrategyOptions } from 'passport-google-oauth20';
import googleOauthConfig from '../auth/google-oauth.config';
import { UserService } from '../users/users.service';
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleOauthConfig.KEY)
    private googleConfiguration: ConfigType<typeof googleOauthConfig>,
    private userService: UserService,
  ) {
    const clientID = googleConfiguration.clientId;
    const clientSecret = googleConfiguration.clientSecret;
    const callbackURL = googleConfiguration.callbackUrl;

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    try {
      console.log(profile);
      const googleUser = {
        name: profile.name?.givenName || '',
        lastname: profile.name?.familyName || '',
        email: profile.emails?.[0]?.value || '',
        googleSub: profile.id,
        avatar: profile.photos?.[0]?.value || '',
      };

      const user = await this.userService.validateGoogleUser(googleUser);

      if (!user) {
        console.log('error:');
        return done(null, false);
      }
      console.log('user:', user);
      done(null, user);
    } catch (error) {
      done(error, undefined);
    }
  }
}
