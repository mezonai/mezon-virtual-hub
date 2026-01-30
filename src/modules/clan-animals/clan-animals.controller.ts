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
import { ClanAnimalsService } from './clan-animals.service';
import { ClsService } from 'nestjs-cls';
import { USER_TOKEN } from '@constant';
import { UserEntity } from '@modules/user/entity/user.entity';
import { GetListClanAnimalsDto } from '@modules/clan-animals/dto/clan-animals.dto';

@ApiBearerAuth()
@ApiTags('Clan Animals')
@Controller('clan-animals')
export class ClanAnimalsController {
  constructor(
    private readonly clanAnimalsService: ClanAnimalsService,
    private readonly cls: ClsService,
  ) {}
  
  @Get('')
  @ApiOperation({
    summary: 'List clan animals',
  })
  getListClanAnimals(@Query() query: GetListClanAnimalsDto) {
    return this.clanAnimalsService.getListClanAnimalsByClanId(query);
  }

  @Post('buy-animal/:recipe_id')
  @ApiOperation({
    summary: 'Buy animal for clan',
  })
  @ApiParam({ name: 'recipe_id', example: '91bea29f-0e87-42a5-b851-d9d0386ac32f' })
  buyAnimalForClan(@Param('recipe_id') recipe_id: string) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.clanAnimalsService.buyAnimalForClan(user, recipe_id);
  }

  @Post('buy-slot-clan-pet/:recipe_id')
  @ApiOperation({
    summary: 'Buy slot for clan pet',
  })
  @ApiParam({ name: 'recipe_id', example: '91bea29f-0e87-42a5-b851-d9d0386ac32f' })
  buySlotForClanPet(@Param('recipe_id') recipe_id: string) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.clanAnimalsService.buyPetClanSlot(user, recipe_id);
  }

  @Patch(':clanAnimalId/activate')
  @ApiOperation({
    summary: 'Activate clan animal',
  })
  @ApiParam({ name: 'clanAnimalId', example: '91bea29f-0e87-42a5-b851-d9d0386ac32f' })
  activateClanAnimal(@Param('clanAnimalId') clanAnimalId: string) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.clanAnimalsService.activateClanAnimal(user, clanAnimalId);
  }

  @Patch(':clanAnimalId/deactivate')
  @ApiOperation({
    summary: 'Deactivate clan animal',
  })
  @ApiParam({ name: 'clanAnimalId', example: '91bea29f-0e87-42a5-b851-d9d0386ac32f' })
  deactivateClanAnimal(@Param('clanAnimalId') clanAnimalId: string) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.clanAnimalsService.deactivateClanAnimal(user, clanAnimalId);
  }

  @Delete(':clanAnimalId')
  @ApiOperation({
    summary: 'Delete clan animal',
  })
  @ApiParam({ name: 'clanAnimalId', example: '91bea29f-0e87-42a5-b851-d9d0386ac32f' })
  deleteClanAnimal(@Param('clanAnimalId') clanAnimalId: string) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.clanAnimalsService.deleteClanAnimal(user, clanAnimalId);
  }
}
