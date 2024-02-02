import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { applyDecorators, Type } from '@nestjs/common';

export const ApiMessageResponse = (status: number) => {
  return applyDecorators(
    ApiExtraModels(),
    ApiResponse({
      status,
      schema: {
        allOf: [
          {
            properties: {
              status: {
                type: 'number',
                default: status,
              },
              message: {
                type: 'string',
              },
            },
          },
        ],
      },
    }),
  );
};
