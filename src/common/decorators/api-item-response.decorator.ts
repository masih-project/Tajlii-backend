import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { applyDecorators, Type } from '@nestjs/common';

export const ApiItemResponse = <T extends Type<any>>(dto: T) => {
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
                  item: {
                    type: 'object',
                    $ref: getSchemaPath(dto),
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
