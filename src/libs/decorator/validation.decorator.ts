import { MapKey, SubMap } from '@enum';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export function IsNullableEnumArray(
  enumType: object,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNullableEnumArray',
      target: object.constructor,
      propertyName,
      constraints: [enumType],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [enumObj] = args.constraints;

          if (!Array.isArray(value)) return false;

          return value.every(
            (v) => v === null || Object.values(enumObj).includes(v),
          );
        },
        defaultMessage(args: ValidationArguments) {
          const [enumObj] = args.constraints;
          return `${args.property} must be an array of values from [${Object.values(enumObj).join(', ')}] or null`;
        },
      },
    });
  };
}

@ValidatorConstraint({ async: false })
export class IsValidRoomCodeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    if (!value) return true;

    if (typeof value !== 'string') return false;

    const parts = value.split('-');

    if (parts.length === 1) {
      return Object.values(MapKey).includes(parts[0] as MapKey);
    }

    if (parts.length === 2) {
      const [map, submap] = parts;
      return (
        Object.values(MapKey).includes(map as MapKey) &&
        Object.values(SubMap).includes(submap as SubMap)
      );
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return `room_code must be "{map}" or "{map}-{submap}" where map ∈ MapKey and submap ∈ SubMap`;
  }
}

export function IsValidRoomCode(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsValidRoomCodeConstraint,
    });
  };
}
