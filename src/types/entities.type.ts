import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export abstract class TimestampColumns {
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  @Exclude()
  deleted_at: Date | null;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

@Entity()
export class AuditEntity extends TimestampColumns {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'UUID of the entity',
    example: 'a3c91e45-df21-4c45-bc1e-2c90d4b15cc7',
  })
  id: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  @Exclude()
  deleted_at: Date | null;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
