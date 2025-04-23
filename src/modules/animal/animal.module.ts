import { UserModule } from '@modules/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { AnimalEntity } from './entity/animal.entity';
import { AnimalController } from './animal.controller';
import { AnimalService } from './animal.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnimalEntity]),
    ClsModule,
    forwardRef(() => UserModule),
  ],
  providers: [AnimalService],
  controllers: [AnimalController],
  exports: [AnimalService],
})
export class AnimalModule {}
