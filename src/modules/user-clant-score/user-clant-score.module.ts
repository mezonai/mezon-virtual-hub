import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { UserClantScoreEntity } from './entity/user-clant-score.entity';
import { UserClantScoreController } from './user-clant-score.controller';
import { UserClantScoreService } from './user-clant-score.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserClantScoreEntity]), ClsModule],
  providers: [UserClantScoreService],
  controllers: [UserClantScoreController],
})
export class UserClantScoreModule {}
