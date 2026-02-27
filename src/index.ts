import 'dotenv/config';
import Fastify from 'fastify';
import { redisPlugin } from './plugins/redis';
import { dataRoutes } from './routes/data';

async function main() {
  const app = Fastify({
    logger: true,
  });

  await app.register(redisPlugin);
  await app.register(dataRoutes);

  app.get('/health', async () => {
    const pong = await app.redis.ping();
    return { status: 'ok', redis: pong };
  });

  const port = Number(process.env.PORT);
  const host = '0.0.0.0';

  if (!port) {
    throw new Error('PORT is not set');
  }

  await app.listen({ port, host });
  app.log.info({ port, host }, 'Server is running');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
