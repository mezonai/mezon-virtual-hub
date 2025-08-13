import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
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
