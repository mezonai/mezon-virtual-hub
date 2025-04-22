import { USER_TOKEN } from '@constant';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { InventoryService } from './inventory.service';

@ApiBearerAuth()
@Controller('inventory')
@ApiTags('Inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly cls: ClsService,
  ) {}

  @Post('buy/:item_id')
  @ApiParam({
    name: 'item_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  async buyItem(@Param('item_id', ParseUUIDPipe) item_id: string) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.inventoryService.buyItem(user, item_id);
  }
}
