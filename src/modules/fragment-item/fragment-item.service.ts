import { BaseService } from '@libs/base/base.service';
import { CreateFragmentItemDto, UpdateFragmentItemDto } from '@modules/fragment-item/dto/fragment-item.dto';
import { FragmentItemEntity } from '@modules/fragment-item/entity/fragment-item.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FragmentItemService extends BaseService<FragmentItemEntity> {

  constructor(
    @InjectRepository(FragmentItemEntity)
    private readonly fragmentItemRepo: Repository<FragmentItemEntity>,
  ) {
    super(fragmentItemRepo, FragmentItemEntity.name);
  }

  async getAllFragmentItems(fragmentId: string) {
    return this.fragmentItemRepo.find({
      where: { fragment_id: fragmentId },
      relations: ['item'],
      order: { part: 'ASC' },
    });
  }

  async getFragmentItemById(id: string) {
    const fragmentItem = await this.fragmentItemRepo.findOne({
      where: { id },
      relations: ['fragment', 'item'],
    });

    if (!fragmentItem) {
      throw new NotFoundException('Fragment item not found');
    }

    return fragmentItem;
  }

  async createFragmentItem(dto: CreateFragmentItemDto) {
    const fragmentItem = this.fragmentItemRepo.create({
      fragment_id: dto.fragment_id,
      item_id: dto.item_id,
      part: dto.part,
      required_quantity: dto.required_quantity,
    });

    return this.fragmentItemRepo.save(fragmentItem);
  }

  async updateFragmentItem(id: string, dto: UpdateFragmentItemDto) {
    const fragmentItem = await this.getFragmentItemById(id);

    Object.assign(fragmentItem, dto);

    return this.fragmentItemRepo.save(fragmentItem);
  }

  async deleteFragmentItem(id: string) {
    const fragmentItem = await this.getFragmentItemById(id);

    await this.fragmentItemRepo.remove(fragmentItem);

    return { success: true };
  }
}
