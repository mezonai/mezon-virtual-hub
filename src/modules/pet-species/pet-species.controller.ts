import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { Logger } from '@libs/logger';

import { AdminBypassGuard } from '@libs/guard/admin.guard';
import { Body } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { UserService } from '../user/user.service';
import { PetSpeciesDtoRequest } from './dto/pet-species.dto';
import { PetSpeciesService } from './pet-species.service';

@ApiBearerAuth()
@Controller('pet-species')
@ApiTags('Pet Species')
@UseGuards(AdminBypassGuard)
export class PetSpeciesController {
  constructor(
    private readonly cls: ClsService,
    private readonly petSpeciesService: PetSpeciesService,
    private readonly userService: UserService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PetSpeciesController.name);
  }

  @Get()
  @ApiOperation({
    summary: 'Get list all pet-species',
  })
  async getAll() {
    return await this.petSpeciesService.getAll();
  }

  @Post()
  @ApiOperation({
    summary: 'Create a pet-species',
  })
  async createPetSpecies(@Query() pet: PetSpeciesDtoRequest) {
    return await this.petSpeciesService.createPetSpecies(pet);
  }

  @Put(':pet_species_id')
  @ApiParam({
    name: 'pet_species_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Update a pet-species with species',
  })
  async updatePetSpecies(
    @Query() pet: PetSpeciesDtoRequest,
    @Param('pet_species_id', ParseUUIDPipe) pet_species_id: string,
  ) {
    return await this.petSpeciesService.updatePetSpecies(pet_species_id, pet);
  }

  @Delete(':pet_species_id')
  @ApiParam({
    name: 'pet_species_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Soft delete a specific pet-species',
  })
  async deletePetSpecies(
    @Param('pet_species_id', ParseUUIDPipe) pet_species_id: string,
  ) {
    return await this.petSpeciesService.deletePetSpecies(pet_species_id);
  }

  // @Post('bring-pets')
  // @ApiOperation({
  //   summary: 'Bring multiple pets with the player',
  //   description:
  //     'Allows the player to bring a list of pets by specifying their IDs.',
  // })
  // @ApiBody({ type: BringPetsDtoList })
  // async bringPets(@Body() payload: BringPetsDtoList) {
  //   const user = this.cls.get<UserEntity>(USER_TOKEN);
  //   return await this.petSpeciesService.bringPets(user, payload);
  // }

  // @Get('find/:pet_species_id')
  // @UseGuards(AdminBypassGuard)
  // @ApiParam({
  //   name: 'pet_species_id',
  //   example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  // })
  // @ApiOperation({
  //   summary: 'Get a specific pet-species',
  // })
  // async getOnePetSpecies(
  //   @Param('pet_species_id', ParseUUIDPipe) pet_species_id: string,
  // ) {
  //   return await this.petSpeciesService.getPetSpeciesById(pet_species_id);
  // }
}
