import {
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
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

import { SkillCode } from '@enum';
import { RequireAdmin } from '@libs/decorator';
import { ClsService } from 'nestjs-cls';
import { UserService } from '../user/user.service';
import { CreatePetSkillsDto, UpdatePetSkillsDto } from './dto/pet-skills.dto';
import { PetSkillsService } from './pet-skills.service';

@ApiBearerAuth()
@Controller('pet-skills')
@ApiTags('Pet Skills')
@RequireAdmin()
export class PetSkillsController {
  constructor(
    private readonly cls: ClsService,
    private readonly petSkillsService: PetSkillsService,
    private readonly userService: UserService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PetSkillsController.name);
  }

  @Get()
  @ApiOperation({
    summary: 'Get list all pet-skills',
  })
  async getAll() {
    return await this.petSkillsService.getAll();
  }

  @Post()
  @ApiOperation({
    summary: 'Create a pet-skills',
  })
  async createPetSkills(@Query() skill: CreatePetSkillsDto) {
    return await this.petSkillsService.createPetSkills(skill);
  }

  @Put(':skill_code')
  @ApiParam({
    name: 'skill_code',
    enum: SkillCode,
    example: SkillCode.GROWL,
  })
  @ApiOperation({
    summary: 'Update a pet-skills with skills',
  })
  async updatePetSkills(
    @Param('skill_code', new ParseEnumPipe(SkillCode)) skill_code: SkillCode,
    @Query() skill: UpdatePetSkillsDto,
  ) {
    return await this.petSkillsService.updatePetSkills(skill_code, skill);
  }

  @Delete(':skill_code')
  @ApiParam({
    name: 'skill_code',
    example: 'NOR00',
  })
  @ApiOperation({
    summary: 'Soft delete a specific pet-skills',
  })
  async deletePetSkills(@Param('skill_code') skill_code: string) {
    return await this.petSkillsService.deletePetSkills(skill_code);
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
  //   return await this.petSkillsService.bringPets(user, payload);
  // }

  // @Get('find/:pet_skills_id')
  // @RequireAdmin()
  // @ApiParam({
  //   name: 'pet_skills_id',
  //   example: 'NOR00',
  // })
  // @ApiOperation({
  //   summary: 'Get a specific pet-skills',
  // })
  // async getOnePetSkills(
  //   @Param('pet_skills_id', ParseUUIDPipe) pet_skills_id: string,
  // ) {
  //   return await this.petSkillsService.getPetSkillsById(pet_skills_id);
  // }
}
