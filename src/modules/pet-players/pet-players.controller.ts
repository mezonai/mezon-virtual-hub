import {
  Controller,
  Get,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { Logger } from '@libs/logger';

import { USER_TOKEN } from '@constant';
import { AdminBypassGuard } from '@libs/guard/admin.guard';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Body, Delete, Param, Put } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { UserService } from '../user/user.service';
import { PetPlayerservice } from './pet-players.service';
import {
  SpawnPetPlayersDto,
  BringPetPlayersDtoList,
} from './dto/pet-players.dto';

@ApiBearerAuth()
@Controller('pet-players')
@ApiTags('Pet Players')
export class PetPlayersController {
  constructor(
    private readonly cls: ClsService,
    private readonly petService: PetPlayerservice,
    private readonly userService: UserService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PetPlayersController.name);
  }

  @Get()
  @ApiOperation({
    summary: 'Get list all Pet Players of user',
  })
  async getPetPlayers() {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return await this.petService.getPetPlayers(user.id);
  }

  @Post()
  @UseGuards(AdminBypassGuard)
  @ApiOperation({
    summary: 'Create (spawn) a pet',
  })
  async createPetPlayers(@Body() pet: SpawnPetPlayersDto) {
    return await this.petService.createPetPlayers(pet);
  }

  @Get(':room_code')
  @ApiParam({
    name: 'room_code',
    example: 'sg-office',
  })
  @ApiOperation({
    summary: 'Get list available PetPlayer of a specific room',
  })
  async getPetPlayersWithRoom(@Param('room_code') room_code: string) {
    return await this.petService.getAvailablePetPlayersWithRoom(room_code);
  }

  @Put(':pet_id')
  @UseGuards(AdminBypassGuard)
  @ApiParam({
    name: 'pet_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Update a specific item',
  })
  async updatePetPlayers(
    @Query() pet: SpawnPetPlayersDto,
    @Param('pet_id', ParseUUIDPipe) pet_id: string,
  ) {
    return await this.petService.updatePetPlayers(pet, pet_id);
  }

  @Delete(':pet_id')
  @UseGuards(AdminBypassGuard)
  @ApiParam({
    name: 'pet_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Soft delete a specific pet',
  })
  async deletePetPlayers(@Param('pet_id', ParseUUIDPipe) pet_id: string) {
    return await this.petService.deletePetPlayers(pet_id);
  }

  @Post('bring-pets')
  @ApiOperation({
    summary: 'Bring multiple pets with the player',
    description:
      'Allows the player to bring a list of pets by specifying their IDs.',
  })
  @ApiBody({ type: BringPetPlayersDtoList })
  async bringPetPlayers(@Body() payload: BringPetPlayersDtoList) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return await this.petService.bringPetPlayers(user, payload);
  }

  @Get('find/:pet_id')
  @UseGuards(AdminBypassGuard)
  @ApiParam({
    name: 'pet_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Get a specific pet',
  })
  async getOnePetPlayers(@Param('pet_id', ParseUUIDPipe) pet_id: string) {
    return await this.petService.getPetPlayersById(pet_id);
  }
}
