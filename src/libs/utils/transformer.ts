import { plainToInstance, instanceToPlain } from 'class-transformer';

export function serializeDto<T, V>(
  cls: new (...args: any[]) => T,
  data: V[],
): T[];
export function serializeDto<T, V>(cls: new (...args: any[]) => T, data: V): T;
export function serializeDto<T, V>(
  cls: new (...args: any[]) => T,
  data: V,
): T | T[] {
  return instanceToPlain(plainToInstance(cls, data), {
    exposeUnsetFields: false,
  }) as T | T[];
}
