import 'fastify';
import type { RedisClientType } from 'redis';

declare module 'fastify' {
  interface FastifyInstance {
    redis: RedisClientType;
  }
}
