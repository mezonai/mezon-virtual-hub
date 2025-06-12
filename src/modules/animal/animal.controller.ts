import {
  Controller,
  Get,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags
} from '@nestjs/swagger';

import { Logger } from '@libs/logger';

import { USER_TOKEN } from '@constant';
import { AdminBypassGuard } from '@libs/guard/admin.guard';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Body, Delete, Param, Put } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { UserService } from '../user/user.service';
import { AnimalService } from './animal.service';
import { AnimalDtoRequest, BringPetsDtoList } from './dto/animal.dto';

@ApiBearerAuth()
@Controller('animal')
@ApiTags('Animal')
export class AnimalController {
  constructor(
    private readonly cls: ClsService,
    private readonly animalService: AnimalService,
    private readonly userService: UserService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(AnimalController.name);
  }

  @Get()
  @ApiOperation({
    summary: 'Get list all Animals of user',
  })
  async getAnimals() {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return await this.animalService.getAnimals(user.id);
  }

  @Post()
  @UseGuards(AdminBypassGuard)
  @ApiOperation({
    summary: 'Create an animal',
  })
  async createAnimal(@Body() item: AnimalDtoRequest) {
    return await this.animalService.createAnimal(item);
  }

  @Get(':room_code')
  @ApiParam({
    name: 'room_code',
    example: 'sg-office',
  })
  @ApiOperation({
    summary: 'Get list available Animals of a specific room',
  })
  async getAnimalsWithRoom(@Param('room_code') room_code: string) {
    return await this.animalService.getAvailableAnimalsWithRoom(room_code);
  }

  @Put(':animal_id')
  @UseGuards(AdminBypassGuard)
  @ApiParam({
    name: 'animal_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Update a specific item',
  })
  async updateAnimal(
    @Query() animal: AnimalDtoRequest,
    @Param('animal_id', ParseUUIDPipe) animal_id: string,
  ) {
    return await this.animalService.updateAnimal(animal, animal_id);
  }

  @Delete(':animal_id')
  @UseGuards(AdminBypassGuard)
  @ApiParam({
    name: 'animal_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Soft delete a specific animal',
  })
  async deleteAnimal(@Param('animal_id', ParseUUIDPipe) animal_id: string) {
    return await this.animalService.deleteAnimal(animal_id);
  }

  @Post('bring-pets')
  @ApiOperation({
    summary: 'Bring multiple pets with the player',
    description: 'Allows the player to bring a list of pets by specifying their IDs.',
  })
  @ApiBody({ type: BringPetsDtoList })
  async bringPets(@Body() payload: BringPetsDtoList) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return await this.animalService.bringPets(user, payload);
  }

  @Get('find/:animal_id')
  @UseGuards(AdminBypassGuard)
  @ApiParam({
    name: 'animal_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Get a specific animal',
  })
  async getOneAnimal(
    @Param('animal_id', ParseUUIDPipe) animal_id: string,
  ) {
    return await this.animalService.getAnimalById(animal_id);
  }
}
