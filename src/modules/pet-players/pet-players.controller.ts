import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseBoolPipe,
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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { Logger } from '@libs/logger';

import { USER_TOKEN } from '@constant';
import { AdminBypassGuard } from '@libs/guard/admin.guard';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Body, Delete, Param, Put } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { UserService } from '../user/user.service';
import { PetPlayersService } from './pet-players.service';
import {
  SpawnPetPlayersDto,
  BringPetPlayersDtoList,
  SelectPetPlayersListDto,
  UpdateBattleSkillsDto,
} from './dto/pet-players.dto';

@ApiBearerAuth()
@Controller('pet-players')
@ApiTags('Pet Players')
export class PetPlayersController {
  constructor(
    private readonly cls: ClsService,
    private readonly petPlayersService: PetPlayersService,
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
    return await this.petPlayersService.findPetPlayersByUserId(user.id);
  }

  @Post()
  @UseGuards(AdminBypassGuard)
  @ApiOperation({
    summary: 'Create (spawn) a pet',
  })
  async createPetPlayers(@Body() pet: SpawnPetPlayersDto) {
    return await this.petPlayersService.createPetPlayers(pet);
  }

  @Get('battle')
  @ApiOperation({
    summary: 'Get all pets and their skills is chosen for battle',
  })
  async getPetsForBattle() {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return await this.petPlayersService.getPetsForBattle(user.id);
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
    return await this.petPlayersService.getAvailablePetPlayersWithRoom(
      room_code,
    );
  }

  @Put('select-pets')
  @ApiOperation({
    summary: 'Select multiple pets for battle',
    description:
      'Allows the player to select a list of pets by specifying their IDs.',
  })
  @ApiBody({ type: SelectPetPlayersListDto })
  async selectPetPlayers(@Body() payload: SelectPetPlayersListDto) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return await this.petPlayersService.selectPetPlayers(user, payload);
  }

  @Put(':pet_player_id')
  @UseGuards(AdminBypassGuard)
  @ApiParam({
    name: 'pet_player_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Update a specific item',
  })
  async updatePetPlayers(
    @Query() pet: SpawnPetPlayersDto,
    @Param('pet_player_id', ParseUUIDPipe) pet_player_id: string,
  ) {
    return await this.petPlayersService.updatePetPlayers(pet, pet_player_id);
  }

  @Delete(':pet_player_id')
  @UseGuards(AdminBypassGuard)
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
    return await this.petPlayersService.deletePetPlayers(pet_player_id);
  }

  @Put(':pet_player_id/battle-skills')
  @ApiParam({
    name: 'pet_player_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiBody({ type: UpdateBattleSkillsDto })
  @ApiOperation({
    summary: 'Select skills for battle',
    description: 'Allows the player to select skills by array skill_code.',
  })
  async updateSelectedBattleSkills(
    @Body() payload: UpdateBattleSkillsDto,
    @Param('pet_player_id', ParseUUIDPipe) pet_player_id: string,
  ) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return await this.petPlayersService.updateSelectedBattleSkills(
      user,
      payload,
      pet_player_id,
    );
  }

  @Put(':pet_player_id/select-pets')
  @ApiParam({
    name: 'pet_player_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiQuery({
    type: Boolean,
    name: 'is_selected',
    required: false,
    description: 'Selected status',
    default: true,
  })
  @ApiOperation({
    summary: 'Select a pet for battle',
    description: 'Allows the player to select a pet by a specifying ID.',
  })
  async selectOnePetPlayer(
    @Query('is_selected', new DefaultValuePipe(false), ParseBoolPipe)
    isSelected: boolean = true,
    @Param('pet_player_id', ParseUUIDPipe)
    petId: string,
  ) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return await this.petPlayersService.selectOnePetPlayer(
      user,
      petId,
      isSelected,
    );
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
    return await this.petPlayersService.bringPetPlayers(user, payload);
  }

  // @Put(':pet_player_id/unlock-skills')
  // @ApiParam({
  //   name: 'pet_player_id',
  //   example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  // })
  // @ApiOperation({
  //   summary: 'Select skills for pets',
  //   description: 'Allows the player to select a list of skills by skill_codes',
  // })
  // @ApiBody({ type: PetPlayerSkillsDto })
  // async unlockSkills(
  //   @Param('pet_player_id', ParseUUIDPipe) pet_player_id: string,
  //   @Body() payload: PetPlayerSkillsDto,
  // ) {
  //   const user = this.cls.get<UserEntity>(USER_TOKEN);
  //   return await this.petPlayersService.unlockSkills(
  //     user,
  //     pet_player_id,
  //     payload,
  //   );
  // }

  @Get('find/:pet_player_id')
  @UseGuards(AdminBypassGuard)
  @ApiParam({
    name: 'pet_player_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Get a specific pet',
  })
  async getOnePetPlayers(
    @Param('pet_player_id', ParseUUIDPipe) pet_player_id: string,
  ) {
    return await this.petPlayersService.getPetPlayersById(pet_player_id);
  }
}
