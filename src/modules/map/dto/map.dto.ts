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