import { Controller, Post, Param, ParseIntPipe } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ClsService } from 'nestjs-cls';
import { USER_TOKEN } from '@constant';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('inventory')
@ApiTags('Inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly cls: ClsService,
  ) {}

  @Post('buy/:itemId')
  async buyItem(@Param('itemId') itemId: string) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.inventoryService.buyItem(user, itemId);
  }
}
