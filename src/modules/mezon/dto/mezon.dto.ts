import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export class RefundTokenDto {
  @ApiProperty({
    description: 'Username of the target user',
    example: 'an.nguyenvan',
  })
  @IsString()
  target_username: string;

  @ApiProperty({
    description: 'Mezon token to be refund',
    example: 100,
    default: 0,
  })
  @Type(() => Number)
  @IsNumber()
  token: number;
}
