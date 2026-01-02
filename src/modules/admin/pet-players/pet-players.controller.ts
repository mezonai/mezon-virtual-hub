import { Body, Controller, Get, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { Logger } from '@libs/logger';

import { RequireAdmin } from '@libs/decorator';
import { Delete, Param, Put } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { CompensateUpdateRarityPetPlayersDto, PetPlayersQueryDto, SpawnPetPlayersDto, UpdatePetPlayersDto } from './dto/pet-players.dto';
import { AdminPetPlayersService } from './pet-players.service';

@ApiBearerAuth()
@RequireAdmin()
@Controller('pet-players')
@ApiTags('Admin - Pet Players')
export class AdminPetPlayersController {
  constructor(
    private readonly cls: ClsService,
    private readonly adminPetPlayersService: AdminPetPlayersService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(AdminPetPlayersController.name);
  }

  @Get()
  @ApiOperation({
    summary: 'Get list all Pet Players',
  })
  async getPetPlayerList(@Query() query: PetPlayersQueryDto) {
    return await this.adminPetPlayersService.getPetPlayerList(query);
  }

  @Post()
  @RequireAdmin()
  @ApiOperation({
    summary: 'Create (spawn) a pet',
  })
  async createPetPlayers(@Body() { quantity, ...pet }: SpawnPetPlayersDto) {
    return await this.adminPetPlayersService.createPetPlayers(pet, quantity);
  }

  @Post('compensate-update-rarity')
  @RequireAdmin()
  @ApiOperation({
    summary: 'Compensate update rarity pet players to user',
  })
  async compensateUpdateRarityPetPlayersToUser(@Body() { pet_id, rarity }: CompensateUpdateRarityPetPlayersDto) {
    return await this.adminPetPlayersService.compensateUpdateRarityPetPlayersToUser(pet_id, rarity);
  }

  @Post('fill-missing/:room_code')
  @RequireAdmin()
  @ApiParam({
    name: 'room_code',
    example: 'sg',
  })
  @ApiOperation({
    summary: 'Fill missing pets in a room',
  })
  async fillMissingPetsByRoom(
    @Param('room_code') room_code: string,
  ) {
    return await this.adminPetPlayersService.fillMissingPetsByRoom(room_code);
  }

  @Get(':pet_player_id')
  @ApiParam({
    name: 'pet_player_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Get one PetPlayer detail',
  })
  async getPetPlayersWithRoom(
    @Param('pet_player_id', ParseUUIDPipe) pet_player_id: string,
  ) {
    return await this.adminPetPlayersService.getOnePetPlayer(pet_player_id);
  }

  @Put(':pet_player_id')
  @ApiParam({
    name: 'pet_player_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Update a specific item',
  })
  async updatePetPlayers(
    @Body() pet: UpdatePetPlayersDto,
    @Param('pet_player_id', ParseUUIDPipe) pet_player_id: string,
  ) {
    return await this.adminPetPlayersService.updatePetPlayers(
      pet,
      pet_player_id,
    );
  }

  @Delete(':pet_player_id')
  @RequireAdmin()
  @ApiParam({
    name: 'pet_player_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Soft delete a specific pet',
  })
  async deletePetPlayers(
    @Param('pet_player_id', ParseUUIDPipe) pet_player_id: string,
  ) {
    return await this.adminPetPlayersService.deletePetPlayers(pet_player_id);
  }
}
