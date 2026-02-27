# Redis-connection

Aplicação **TypeScript + Fastify** que se conecta a um **Redis** para armazenar e obter dados em **JSON**.

## Variáveis de ambiente

| Variável    | Descrição               | Exemplo                       |
| ----------- | ----------------------- | ----------------------------- |
| `NODE_ENV`  | Modo de desenvolvimento | `development` or `production` |
| `PORT`      | Porta HTTP da API       | `3000`                        |
| `HOST`      | Host de escuta          | `0.0.0.0`                     |
| `REDIS_URL` | URL do Redis            | `redis://localhost:1234`      |

## Desenvolvimento local

App no host, Redis no Docker:

```bash
docker compose up -d redis
npm install
npm run dev
# não esquece de verificar o seu arquivo .env
```

API em `http://localhost:3000`.

## Produção (Docker: app + Redis)

```bash
docker compose up -d --build
```

- A API fica em `http://localhost:3000` (ou a porta definida em `PORT`).
- O Redis fica na rede interna; a app usa `REDIS_URL`.

Parar e remover volumes:

```bash
docker compose down -v
```

## Endpoints

- `GET /health`
- `POST /data?key=<key>` — body: JSON object (novas chaves são mescladas ao valor existente)
- `GET /data?key=<key>`
- `POST /flushdb?key=<key>`

## Exemplo rápido (curl)

```bash
curl -sS -X POST "http://localhost:3000/data?key=user:1" \
  -H "content-type: application/json" \
  -d '{"name":"Ana","age":30}'

curl -sS "http://localhost:3000/data?key=user:1"
```
