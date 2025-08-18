import { USER_TOKEN } from '@constant/meta-key.constant';
import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { isEmail } from 'class-validator';
import { ClsService } from 'nestjs-cls';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { ValidateJwtRequest } from '../dtos/request';
import { JwtPayload } from '../dtos/response';

import { configEnv } from '@config/env.config';
import { Injectable } from '@nestjs/common/decorators/core';
import { GenericRepository } from '@libs/repository/genericRepository';
import { UserEntity } from '@modules/user/entity/user.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly userRepository: GenericRepository<UserEntity>;
  constructor(
    private readonly authService: AuthService,
    private readonly cls: ClsService,
    private manager: EntityManager,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configEnv().JWT_ACCESS_TOKEN_SECRET,
      passReqToCallback: true,
    });
    this.userRepository = new GenericRepository(UserEntity, manager);
  }

  async validate(request: ValidateJwtRequest, payload: JwtPayload) {
    console.log('JwtStrategy');
    
    const { email, expireTime, sessionToken, username } = payload;

    const user = await this.userRepository.findOne({
      where: [
        ...(username ? [{ username }] : []),
        ...(email ? [{ email }] : []),
      ],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const now = new Date().getTime();
    const expireDate = new Date(expireTime);

    if (isNaN(expireDate.getTime()) || now > expireDate.getTime()) {
      throw new UnauthorizedException('JWT token is expired');
    }

    this.cls.set(USER_TOKEN, user);
    request.sessionToken = sessionToken;
    return user;
  }
}
