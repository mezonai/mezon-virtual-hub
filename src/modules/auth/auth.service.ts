import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { configEnv } from '@config/env.config';
import { NEW_USER_GOLD_REWARD } from '@constant';
import { GenericRepository } from '@libs/repository/genericRepository';
import { generateMezonHash } from '@libs/utils/hash';
import { PlayerQuestService } from '@modules/player-quest/player-quest.service';
import { UserEntity } from '@modules/user/entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { isEmail } from 'class-validator';
import crypto from 'crypto';
import moment from 'moment';
import {
  LoginMezonDto,
  OAuth2Request,
  UserInfoWebAppData,
  WebAppData,
} from './dtos/request';
import { JwtPayload } from './dtos/response';
import { OAuth2Service } from './oauth2.service';
import { QuestEventEmitter } from '@modules/player-quest/events/quest.events';
import { QuestType } from '@enum';
import { Logger } from '@libs/logger';

@Injectable()
export class AuthService {
  private readonly userRepository: GenericRepository<UserEntity>;
  constructor(
    private manager: EntityManager,
    private readonly jwtService: JwtService,
    private readonly oauth2Service: OAuth2Service,
    private readonly playerQuestService: PlayerQuestService,
    private readonly logger: Logger,
  ) {
    this.userRepository = new GenericRepository(UserEntity, manager);
  }

  async verifyOAuth2(payload: OAuth2Request) {
    try {
      const data = await this.oauth2Service.getOAuth2Token(payload);

      const oryInfo = await this.oauth2Service.decodeORYTokenOAuth2(
        data.access_token,
      );

      if (!isEmail(oryInfo.sub)) {
        throw new BadRequestException(`${oryInfo.sub} is not an email!`);
      }

      const user = await this.findUserByEmail(oryInfo.sub);

      if (user) {
        const tokens = await this.generateAccessAndRefreshTokens(user);
        return tokens;
      }

      const newUser = await this.userRepository.create({
        email: oryInfo.sub,
        username: oryInfo.sub,
      });
      const tokens = await this.generateAccessAndRefreshTokens(newUser);
      return tokens;
    } catch (error) {
      throw error;
    }
  }

  async findUserByEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          email: email,
        },
      });
      return user;
    } catch {
      return;
    }
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

      const user = await this.userRepository.findOne({
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

  async loginWithMezonHash(payload: LoginMezonDto) {
    const { web_app_data } = payload;

    const decodedData = decodeURIComponent(web_app_data);

    const {
      MEZON_AUTH_EXPIRES_TIME_OFFSET_IN_SECONDS: expiresTimeOffset,
      ADMIN_BYPASS_USERS,
    } = configEnv();

    const adminBypassUsers = ADMIN_BYPASS_USERS?.split(',') || [];

    const params = Object.fromEntries(
      new URLSearchParams(decodedData),
    ) as WebAppData;

    const { hash, user: mezonUserInfo, auth_date } = params;

    const { avatar_url, id, mezon_id, username }: UserInfoWebAppData =
      JSON.parse(mezonUserInfo);

    const hashGenerate = generateMezonHash(decodedData);

    const now = Math.floor(Date.now() / 1000);
    const timeOffset = Number(expiresTimeOffset);
    const authDate = Number(auth_date);

    const isAdminBypass = adminBypassUsers.includes(username);

    if (!isAdminBypass && hashGenerate !== hash) {
       this.logger.log(`[MEZON HASH FAIL] username=${username}`);
      throw new BadRequestException('Invalid login hash');
    }

    if (
      !isAdminBypass &&
      (isNaN(authDate) ||
        authDate < now - timeOffset ||
        authDate > now + 5)
    ) {
      this.logger.log(`[MEZON AUTH DATE FAIL] username=${username} authDate=${authDate}`);
      throw new BadRequestException('Login data expired');
    }

    const user = await this.userRepository.findOne({
      where: [{ username }, { mezon_id: id }],
    });

    if (user) {
      const tokens = await this.generateAccessAndRefreshTokens(user);
      await this.playerQuestService.renewQuests(user.id, {
        timezone: 'Asia/Ho_Chi_Minh',
      });
      QuestEventEmitter.emitEventLoginReward(user.id);
      QuestEventEmitter.emitNewbieLogin(user.id);
      QuestEventEmitter.emitProgress(user.id, QuestType.LOGIN_DAYS, 1);
      return tokens;
    }

    const newUser = await this.userRepository.create({
      username,
      mezon_id: id,
      avatar_url,
      email: mezon_id,
      gold: NEW_USER_GOLD_REWARD,
    });

    await this.playerQuestService.initQuests(newUser.id, {
      timezone: 'Asia/Ho_Chi_Minh',
    });
    QuestEventEmitter.emitEventLoginReward(newUser.id);
    QuestEventEmitter.emitNewbieLogin(newUser.id);
    QuestEventEmitter.emitProgress(newUser.id, QuestType.LOGIN_DAYS, 1);
    const tokens = await this.generateAccessAndRefreshTokens(newUser);
    return tokens;
  }
}
