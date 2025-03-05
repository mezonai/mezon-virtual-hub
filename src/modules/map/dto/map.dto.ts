import { Expose } from "class-transformer";

export class CreateMapDto {
    readonly name: string;
    readonly map_key?: string;
    readonly width: number;
    readonly height: number;
}

export class UpdateMapDto {
    readonly id: string;
    readonly name?: string|null;
    readonly map_key?: string|null;
    readonly width?: number|null;
    readonly height?: number|null;
}
export class MapDtoRequest {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  map_key: string;

  @Expose()
  width: number;

  @Expose()
  height: number;
}

export class MapDetailDto {
    readonly id: string;
    readonly name?: string|null;
    readonly map_key?: string|null;
    readonly width?: number|null;
    readonly height?: number|null;
}
