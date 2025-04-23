import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { TransactionEntity } from './entity/transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    private manager: EntityManager,
  ) {}

  async getAllTransaction() {
    return await this.transactionRepository.find();
  }
}
