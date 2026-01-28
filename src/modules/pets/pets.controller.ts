import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { Logger } from '@libs/logger';

import { RequireAdmin } from '@libs/decorator';
import { ClsService } from 'nestjs-cls';
import { UserService } from '../user/user.service';
import { PetsDtoRequest, UpdatePetSkillIndexDto } from './dto/pets.dto';
import { PetsService } from './pets.service';

@ApiBearerAuth()
@Controller('pets')
@ApiTags('Pets')
@RequireAdmin()
export class PetsController {
  constructor(
    private readonly cls: ClsService,
    private readonly petsService: PetsService,
    private readonly userService: UserService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PetsController.name);
  }

  @Get()
  @ApiOperation({
    summary: 'Get list all pets',
  })
  async getAll() {
    return await this.petsService.getAll();
  }

  @Post()
  @ApiOperation({
    summary: 'Create a pets',
  })
  async createPets(@Query() pet: PetsDtoRequest) {
    return await this.petsService.createPets(pet);
  }

  @Put(':pet_id')
  @ApiParam({
    name: 'pet_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Update a pets with species',
  })
  async updatePets(
    @Query() pet: PetsDtoRequest,
    @Param('pet_id', ParseUUIDPipe) pet_id: string,
  ) {
    return await this.petsService.updatePets(pet_id, pet);
  }

  @Delete(':pet_id')
  @ApiParam({
    name: 'pet_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Soft delete a specific pets',
  })
  async deletePets(
    @Param('pet_id', ParseUUIDPipe) pet_id: string,
  ) {
    return await this.petsService.deletePets(pet_id);
  }

  @Patch(':pet_id/skills/indexes')
  @ApiParam({
    name: 'pet_id',
    example: '61bfc137-82ed-4be0-a227-318261545972',
  })
  @ApiOperation({
    summary: 'Update skill indexes of a pet',
  })
  async updatePetSkillIndexes(
    @Param('pet_id', ParseUUIDPipe) petId: string,
    @Body() body: UpdatePetSkillIndexDto,
  ) {
    await this.petsService.updateSkillIndexes(petId, body.skills);
    return {
      success: true,
      message: 'Update pet skill indexes successfully',
    };
  }
}
