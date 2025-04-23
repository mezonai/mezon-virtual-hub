import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiResponseWithAuthToken() {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    ApiResponse({
      status: 200,
      description: 'Successful login with authentication token',
      schema: {
        example: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    })(target, key, descriptor);

    return descriptor;
  };
}
