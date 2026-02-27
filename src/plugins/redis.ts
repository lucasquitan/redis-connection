import fp from 'fastify-plugin';
import { createClient, type RedisClientType } from 'redis';

export const redisPlugin = fp(async (app) => {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error('REDIS_URL is not set');
  }

  const client: RedisClientType = createClient({ url });

  client.on('error', (err) => {
    app.log.error({ err }, 'Redis client error');
  });

  await client.connect();
  app.log.info({ url }, 'Redis connected');

  app.decorate('redis', client);

  app.addHook('onClose', async () => {
    try {
      await client.quit();
    } catch (err) {
      app.log.warn({ err }, 'Failed to quit Redis client');
    }
  });
});
