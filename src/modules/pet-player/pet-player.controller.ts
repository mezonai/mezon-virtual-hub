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
import { PetPlayerService } from './pet-player.service';
import {
  SpawnPetPlayerDto,
  BringPetPlayersDtoList,
} from './dto/pet-player.dto';

@ApiBearerAuth()
@Controller('pet-player')
@ApiTags('Pet Player')
export class PetPlayerController {
  constructor(
    private readonly cls: ClsService,
    private readonly petService: PetPlayerService,
    private readonly userService: UserService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PetPlayerController.name);
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
  async createPetPlayer(@Body() pet: SpawnPetPlayerDto) {
    return await this.petService.createPetPlayer(pet);
  }

  @Get(':room_code')
  @ApiParam({
    name: 'room_code',
    example: 'sg-office',
  })
  @ApiOperation({
    summary: 'Get list available PetPlayers of a specific room',
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
  async updatePetPlayer(
    @Query() pet: SpawnPetPlayerDto,
    @Param('pet_id', ParseUUIDPipe) pet_id: string,
  ) {
    return await this.petService.updatePetPlayer(pet, pet_id);
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
  async deletePetPlayer(@Param('pet_id', ParseUUIDPipe) pet_id: string) {
    return await this.petService.deletePetPlayer(pet_id);
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
  async getOnePetPlayer(@Param('pet_id', ParseUUIDPipe) pet_id: string) {
    return await this.petService.getPetPlayerById(pet_id);
  }
}
