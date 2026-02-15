import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse, ApiResponseOptions, getSchemaPath } from '@nestjs/swagger';

export const ApiStandardResponse = <TModel extends Type<any>>(model: TModel, options?: ApiResponseOptions) => {
  return applyDecorators(
    ApiResponse({
      ...options,
      schema: {
        allOf: [
          {
            properties: {
              statusCode: {
                type: 'number',
                example: 200,
              },
              data: {
                $ref: getSchemaPath(model),
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
              },
              path: {
                type: 'string',
              },
            },
          },
        ],
      },
    }),
  );
};

export const ApiErrorResponse = (statusCode: number, errorCode: string, description: string) => {
  return ApiResponse({
    status: statusCode,
    description,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: statusCode,
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
        },
        path: {
          type: 'string',
        },
        method: {
          type: 'string',
        },
        errorCode: {
          type: 'string',
          example: errorCode,
        },
        message: {
          type: 'string',
        },
        requestId: {
          type: 'string',
        },
      },
    },
  });
};

export const ApiStandardResponses = () => {
  return applyDecorators(
    ApiErrorResponse(400, 'BAD_REQUEST', 'Bad Request'),
    ApiErrorResponse(401, 'UNAUTHORIZED', 'Unauthorized'),
    ApiErrorResponse(403, 'FORBIDDEN', 'Forbidden'),
    ApiErrorResponse(404, 'NOT_FOUND', 'Not Found'),
    ApiErrorResponse(429, 'TOO_MANY_REQUESTS', 'Too Many Requests'),
    ApiErrorResponse(500, 'INTERNAL_SERVER_ERROR', 'Internal Server Error'),
  );
};

export const ApiPaginatedResponse = <TModel extends Type<any>>(model: TModel, options?: ApiResponseOptions) => {
  return applyDecorators(
    ApiResponse({
      ...options,
      schema: {
        allOf: [
          {
            properties: {
              statusCode: {
                type: 'number',
                example: 200,
              },
              data: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: { $ref: getSchemaPath(model) },
                  },
                  meta: {
                    type: 'object',
                    properties: {
                      total: { type: 'number', example: 100 },
                      limit: { type: 'number', example: 100 },
                      offset: { type: 'number', example: 0 },
                      hasNext: { type: 'boolean', example: false },
                      hasPrev: { type: 'boolean', example: false },
                    },
                  },
                },
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
              },
              path: {
                type: 'string',
              },
            },
          },
        ],
      },
    }),
  );
};
