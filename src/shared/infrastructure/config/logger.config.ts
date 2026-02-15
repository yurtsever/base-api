import { Params } from 'nestjs-pino';
import { randomUUID } from 'crypto';

export const createLoggerConfig = (nodeEnv: string, logLevel: string): Params => ({
  pinoHttp: {
    level: logLevel,
    transport:
      nodeEnv !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    customProps: () => ({
      context: 'HTTP',
    }),
    genReqId: (req) => (req.headers['x-request-id'] as string) || randomUUID(),
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return 'warn';
      } else if (res.statusCode >= 500 || err) {
        return 'error';
      }
      return 'info';
    },
    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        // Redact sensitive headers
        headers: {
          ...req.headers,
          authorization: req.headers.authorization ? '[REDACTED]' : undefined,
          cookie: req.headers.cookie ? '[REDACTED]' : undefined,
        },
        remoteAddress: req.remoteAddress,
        remotePort: req.remotePort,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.password',
        'req.body.token',
        'req.body.apiKey',
      ],
      censor: '[REDACTED]',
    },
    autoLogging: {
      ignore: (req) => {
        // Don't log health check requests
        return req.url?.includes('/health') ?? false;
      },
    },
  },
});
