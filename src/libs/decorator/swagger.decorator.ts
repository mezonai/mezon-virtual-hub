import { UpdateUserDto } from '@modules/user/dto/user.dto';
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


export function ApiUpdateUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update user position and map',
      description: 'This API allows updating the position (position_x, position_y) and the map (mapId) of a user.',
    }),
    ApiBody({
      type: UpdateUserDto,
      examples: {
        example1: {
          summary: 'Update both map and position',
          description: 'Updates the mapId and the user\'s position.',
          value: {
            mapId: 'b3f5eabc-8c45-4e6b-a1d6-5c748e6b6a1f',
            position_x: 100,
            position_y: 200,
          },
        },
        example2: {
          summary: 'Update only position',
          description: 'Keeps the current mapId and only updates the position.',
          value: {
            position_x: 150,
            position_y: 250,
          },
        },
        example3: {
          summary: 'Update only mapId',
          description: 'Updates the map but keeps the current position.',
          value: {
            mapId: 'a1d6b3f5-8c45-4e6b-5c74-8e6b6a1fa1d6',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully updated',
      schema: {
        example: {
          id: '1234',
          username: 'user123',
          mapId: 'a1d6b3f5-8c45-4e6b-5c74-8e6b6a1fa1d6',
          position_x: 150,
          position_y: 250,
          updatedAt: '2025-03-05T12:34:56.000Z',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'User or map not found',
    }),
  );
}

