import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '@libs/base/base.service';
import { FragmentEntity } from '@modules/fragment/entity/fragment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { InventoryService } from '@modules/inventory/inventory.service';
import { PetPlayersService } from '@modules/pet-players/pet-players.service';
import { CreateFragmentDto, UpdateFragmentDto } from '@modules/fragment/dto/fragment.dto';

@Injectable()
export class FragmentService extends BaseService<FragmentEntity> {

  constructor(
    @InjectRepository(FragmentEntity)
    private readonly fragmentRepo: Repository<FragmentEntity>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    private readonly inventoryService: InventoryService,
    private readonly petPlayersService: PetPlayersService,
  ) {
    super(fragmentRepo, FragmentEntity.name);
  }

  async getAllFragments() {
    return this.fragmentRepo.find({
      relations: ['fragmentItems', 'fragmentItems.item', 'pet'],
    });
  }

  async getFragmentById(id: string) {
    const fragment = await this.fragmentRepo.findOne({
      where: { id },
      relations: ['fragmentItems', 'fragmentItems.item', 'pet'],
    });

    if (!fragment) {
      throw new NotFoundException('Fragment not found');
    }

    return fragment;
  }

  async createFragment(dto: CreateFragmentDto) {
    const fragment = this.fragmentRepo.create({
      pet_id: dto.pet_id,
    });

    return this.fragmentRepo.save(fragment);
  }

  async assembleFragment(user: UserEntity, fragmentId: string) {
    const fragment = await this.getFragmentById(fragmentId);

    for (const fi of fragment.fragmentItems) {
      const inventory = await this.inventoryRepo.findOne({
        where: {
          user: { id: user.id },
          item: { id: fi.item.id },
        },
      });

      if (!inventory || inventory.quantity < fi.required_quantity) {
        throw new Error('Not enough fragment items to assemble fragment');
      }
    }

    for (const fi of fragment.fragmentItems) {
      const fragmentItem = await this.inventoryRepo.findOne({
        where: {
          user: { id: user.id },
          item: { id: fi.item.id },
        },
      });

      if (!fragmentItem) {
        throw new Error(`Missing fragment item: ${fi.item.name}`);
      }

      fragmentItem.quantity -= fi.required_quantity;

      if (fragmentItem.quantity <= 0) {
        await this.inventoryRepo.remove(fragmentItem);
      } else {
        await this.inventoryRepo.save(fragmentItem);
      }
    }

    await this.petPlayersService.createPetPlayers({
      room_code: '',
      user_id: user.id,
      pet_id: fragment.pet.id,
      current_rarity: fragment.pet.rarity,
    });

    return {
      success: true,
      pet: fragment.pet,
    };
  }

  async updateFragment(id: string, dto: UpdateFragmentDto) {
    const fragment = await this.getFragmentById(id);

    Object.assign(fragment, dto);

    return this.fragmentRepo.save(fragment);
  }

  async deleteFragment(id: string) {
    const fragment = await this.getFragmentById(id);

    if (fragment.fragmentItems?.length) {
      throw new BadRequestException(
        'Cannot delete fragment with fragment items',
      );
    }

    await this.fragmentRepo.remove(fragment);

    return { success: true };
  }
}
