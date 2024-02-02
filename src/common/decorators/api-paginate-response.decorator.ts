import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { applyDecorators, Type } from '@nestjs/common';

export const ApiPaginateResponse = <T extends Type<any>>(dto: T) => {
  return applyDecorators(
    ApiExtraModels(dto),
    ApiResponse({
      status: 200,
      schema: {
        allOf: [
          {
            properties: {
              data: {
                type: 'object',
                properties: {
                  count: {
                    type: 'number',
                  },
                  items: {
                    type: 'array',
                    items: { $ref: getSchemaPath(dto) },
                  },
                },
              },
            },
          },
        ],
      },
    }),
  );
};
