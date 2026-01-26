import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PetClanService } from './pet-clan.service';
import {
  CreatePetClanDto,
  getListPetClansDto,
  UpdatePetClanDto,
} from '@modules/pet-clan/dto/pet-clan.dto';
import { RequireAdmin } from '@libs/decorator';

@ApiBearerAuth()
@ApiTags('Pet Clan')
@Controller('pet-clans')
export class PetClanController {
  constructor(private readonly petClanService: PetClanService) {}

  @Post()
  @ApiOperation({ summary: 'Create pet clan' })
  @RequireAdmin()
  createPetClan(@Body() dto: CreatePetClanDto) {
    return this.petClanService.createPetClan(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all pet clans' })
  listPetClans(@Query() query: getListPetClansDto) {
    return this.petClanService.getlistPetClans(query);
  }

  @Get(':petClanId')
  @ApiOperation({ summary: 'Get pet clan detail' })
  @ApiParam({ name: 'petClanId', example: '91bea29f-0e87-42a5-b851-d9d0386ac32f' })
  getPetClanDetail(@Param('petClanId') petClanId: string) {
    return this.petClanService.getPetClanDetail(petClanId);
  }

  @Patch(':petClanId')
  @ApiOperation({ summary: 'Update pet clan' })
  @ApiParam({ name: 'petClanId', example: '91bea29f-0e87-42a5-b851-d9d0386ac32f' })
  @RequireAdmin()
  updatePetClan(
    @Param('petClanId') petClanId: string,
    @Body() dto: UpdatePetClanDto,
  ) {
    return this.petClanService.updatePetClan(petClanId, dto);
  }

  @Delete(':petClanId')
  @ApiOperation({ summary: 'Delete pet clan' })
  @ApiParam({ name: 'petClanId', example: '91bea29f-0e87-42a5-b851-d9d0386ac32f' })
  @RequireAdmin()
  deletePetClan(@Param('petClanId') petClanId: string) {
    return this.petClanService.deletePetClan(petClanId);
  }
}
