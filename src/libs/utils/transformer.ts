import { plainToInstance, instanceToPlain } from 'class-transformer';

export function serializeDto<T, V>(
  cls: new (...args: any[]) => T,
  data: V[],
): T[];
export function serializeDto<T, V>(cls: new (...args: any[]) => T, data: V): T;
export function serializeDto<T, V>(
  cls: new (...args: any[]) => T,
  data: V | V[],
): T | T[] {
  const instance = plainToInstance(cls, data, {
    excludeExtraneousValues: true,
  });
  return instanceToPlain(instance, { exposeUnsetFields: false }) as T | T[];
}
