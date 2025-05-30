import { configEnv } from '@config/env-config/env.config';
import { JwtPayload } from '@modules/auth/dtos/response';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  BadRequestException,
  Injectable
} from '@nestjs/common';
import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuth2Request } from '@types';
import { isEmail } from 'class-validator';
import crypto from 'crypto';
import moment from 'moment';
import { Repository } from 'typeorm';
import { OAuth2Service } from './oauth2.service';
import { UserService } from '@modules/user/user.service';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly oauth2Service: OAuth2Service,
    @InjectRepository(UserEntity)
    private readonly userService: UserService,
  ) {
  }

  async generateAccessAndRefreshTokens(
    user: UserEntity,
    providedSessionToken?: string,
  ) {
    const { email, username } = user;
    const {
      JWT_ACCESS_TOKEN_SECRET: secret,
      JWT_REFRESH_TOKEN_SECRET: refreshSecret,
      JWT_ACCESS_TOKEN_EXPIRES_IN_MINUTES: accessTokenExpiration,
      JWT_REFRESH_TOKEN_EXPIRES_IN_MINUTES: refreshTokenExpiration,
    } = configEnv();

    const sessionToken =
      providedSessionToken ?? crypto.randomBytes(5).toString('hex');

    const expireTime = moment().add(accessTokenExpiration, 'minutes').toDate();
    const refreshTokenExpireTime = moment()
      .add(refreshTokenExpiration, 'minutes')
      .toDate();

    const accessToken = this.jwtService.sign(
      { email, username, sessionToken, expireTime },
      {
        secret: secret,
      },
    );

    const refreshToken = this.jwtService.sign(
      { email, username, sessionToken, expireTime: refreshTokenExpireTime },
      {
        secret: refreshSecret,
      },
    );
    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(refreshToken: string) {
    try {
      const payload: JwtPayload = this.jwtService.verify(refreshToken, {
        secret: configEnv().JWT_REFRESH_TOKEN_SECRET,
      });

      const { sessionToken, email, expireTime, username } = payload;

      const user = await this.userService.findOne({
        where: [{ username }, { email }],
      });

      if (!user) {
        throw new UnauthorizedException();
      }

      const expireDate = new Date(expireTime);
      const now = new Date().getTime();

      if (
        !expireTime ||
        isNaN(expireDate.getTime()) ||
        now > expireDate.getTime()
      ) {
        throw new ForbiddenException(
          'Your session has expired. Please log in again to continue.',
        );
      }

      const tokens = await this.generateAccessAndRefreshTokens(
        user,
        sessionToken,
      );

      return tokens;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new UnauthorizedException();
    }
  }

  // async logout(email: string) {
  //   Promise.all([
  //     this.cacherService.set({
  //       key: email,
  //       value: USER_HAS_BEEN_LOGGED_OUT,
  //       ttl: 0,
  //     }),
  //     this.cacherService.del({
  //       key: email,
  //       collection: CACHER_COLLECTION.CURRENT_USER,
  //     }),
  //     this.cacherService.del({
  //       key: email,
  //       collection: CACHER_COLLECTION.USER_PROFILE,
  //     }),
  //   ]);

  //   return {
  //     message: 'User has been logged out',
  //   };
  // }

  async verifyOAuth2(payload: OAuth2Request) {
    const data = await this.oauth2Service.getOAuth2Token(payload);

    const oryInfo = await this.oauth2Service.decodeORYTokenOAuth2(
      data.access_token,
    );

    if (!isEmail(oryInfo.sub)) {
      throw new BadRequestException(`${oryInfo.sub} is not an email!`);
    }

    const userEmail = oryInfo.sub;

    const user = await this.findUserByEmail(userEmail);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { accessToken, refreshToken } = await this.generateAccessAndRefreshTokens(user);

    return { accessToken, refreshToken };
  }

  async findUserByEmail(email: string) {
    try {
      const user = await this.userService.findOne({
        where: {
          email: email,
        },
      });
      return user;
    } catch {
      return;
    }
  }
}
