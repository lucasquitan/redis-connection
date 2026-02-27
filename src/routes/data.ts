import type { FastifyPluginAsync } from 'fastify';

export const dataRoutes: FastifyPluginAsync = async (app) => {
  app.post<{
    Querystring: { key: string };
    Body: unknown;
  }>('/data', {
    schema: {
      querystring: {
        type: 'object',
        required: ['key'],
        properties: {
          key: { type: 'string', minLength: 1 },
        },
      },
      body: {
        type: 'object',
        properties: {
          ttlSeconds: { type: 'integer', minimum: 1 },
        },
      },
    },
    handler: async (req, reply) => {
      const { key } = req.query;

      if (
        req.body === null ||
        typeof req.body !== 'object' ||
        Array.isArray(req.body)
      ) {
        return reply.code(400).send({
          success: false,
          message: 'Body must be a JSON object (ex: {"foo":"bar"}).',
        });
      }

      const body = req.body as Record<string, unknown>;
      const ttlSeconds =
        typeof body.ttlSeconds === 'number' ? body.ttlSeconds : undefined;
      const { ttlSeconds: _, ...newProps } = body;
      const newBody = newProps as Record<string, unknown>;

      try {
        const raw = await app.redis.get(key);
        let data: Record<string, unknown>;

        if (raw === null) {
          data = newBody;
        } else {
          try {
            const existing = JSON.parse(raw) as unknown;
            if (
              existing !== null &&
              typeof existing === 'object' &&
              !Array.isArray(existing)
            ) {
              data = { ...(existing as Record<string, unknown>), ...newBody };
            } else {
              data = newBody;
            }
          } catch {
            data = newBody;
          }
        }

        const payload = JSON.stringify(data);
        if (typeof ttlSeconds === 'number') {
          await app.redis.set(key, payload, { EX: ttlSeconds });
        } else {
          await app.redis.set(key, payload);
        }
      } catch (err: unknown) {
        const msg =
          err && typeof err === 'object' && 'message' in err
            ? String((err as Error).message)
            : '';
        if (msg.includes('wrong Redis type') || msg.includes('WRONGTYPE')) {
          return reply.code(409).send({
            success: false,
            message:
              'Key exists with a different format (e.g. RedisJSON). Delete this key or run FLUSHDB in Redis and try again.',
            key,
          });
        }
        throw err;
      }

      return reply.code(201).send({ success: true, key });
    },
  });

  app.get<{
    Querystring: { key: string };
  }>('/data', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          key: { type: 'string', minLength: 1 },
        },
        required: ['key'],
      },
    },
    handler: async (req, reply) => {
      const key = (req.query as { key: string }).key;
      if (key === undefined || key === null || key === '') {
        return reply
          .code(400)
          .send({ success: false, message: 'Key is required.' });
      }
      try {
        const raw = await app.redis.get(key);
        if (raw === null) {
          return reply
            .code(404)
            .send({ success: false, message: 'Key not found.', key });
        }
        try {
          const data = JSON.parse(raw) as unknown;
          return { success: true, key, data };
        } catch {
          return { success: true, key, data: raw };
        }
      } catch (err: unknown) {
        const msg =
          err && typeof err === 'object' && 'message' in err
            ? String((err as Error).message)
            : '';
        if (msg.includes('wrong Redis type') || msg.includes('WRONGTYPE')) {
          return reply.code(409).send({
            success: false,
            message:
              'Key was created with a different format (e.g. RedisJSON). Delete this key or run FLUSHDB in Redis and try again.',
            key,
          });
        }
        throw err;
      }
    },
  });

  app.post<{
    Querystring: { key: string };
  }>('/flushkey', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          key: { type: 'string', minLength: 1 },
        },
        required: ['key'],
      },
    },
    handler: async (req, reply) => {
      const key = (req.query as { key: string }).key;
      if (key === undefined || key === null || key === '') {
        return reply
          .code(400)
          .send({ success: false, message: 'Key is required.' });
      }
      try {
        const deleted = await app.redis.del(key);
        return reply.code(200).send({ success: true, key, deleted });
      } catch (err: unknown) {
        const msg =
          err && typeof err === 'object' && 'message' in err
            ? String((err as Error).message)
            : '';
        if (msg.includes('wrong Redis type') || msg.includes('WRONGTYPE')) {
          return reply.code(409).send({
            success: false,
            message:
              'Key has a different format (e.g. RedisJSON). Use Redis CLI: DEL key or FLUSHDB.',
            key,
          });
        }
        throw err;
      }
    },
  });
};
