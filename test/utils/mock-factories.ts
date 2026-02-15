import { Request, Response } from 'express';
import { ExecutionContext } from '@nestjs/common';

export const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => {
  return {
    id: 'test-request-id',
    method: 'GET',
    url: '/test',
    headers: {
      'x-request-id': 'test-request-id',
    },
    body: {},
    query: {},
    params: {},
    ...overrides,
  } as Partial<Request>;
};

export const createMockResponse = (overrides: Partial<Response> = {}): Partial<Response> => {
  const res = {
    statusCode: 200,
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    ...overrides,
  } as Partial<Response>;

  return res;
};

export const createMockExecutionContext = (
  request: Partial<Request> = {},
  response: Partial<Response> = {},
): ExecutionContext => {
  const mockRequest = createMockRequest(request);
  const mockResponse = createMockResponse(response);

  return {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn().mockReturnValue(mockResponse),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getType: jest.fn(),
  } as any;
};

export const createMockCallHandler = (data: any = {}) => ({
  handle: jest.fn().mockReturnValue({
    pipe: jest.fn().mockReturnThis(),
    subscribe: jest.fn(),
  }),
});
