import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const createThrottlerConfig = (ttl: number, limit: number): ThrottlerModuleOptions => ({
  throttlers: [
    {
      ttl,
      limit,
    },
  ],
});
