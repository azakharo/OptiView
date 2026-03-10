# Minimal backend starter which uses Nest, TypeORM, Postgres

Postgres runs in Docker container.
The backend runs locally for development.

## Install deps

```bash
$ npm install
```

## Run Postgres

```bash
$ docker-compose up -d
```

## Start dev server

```bash
# watch mode
$ npm run start:dev
```

API is available on:
`http://localhost:3000`

API documentation is available on:
`http://localhost:3000/api/docs`

## Shuting down

First stop the dev server.

```bash
$ docker-compose down
```

## Other useful npm scripts

* working with migrations: create, generate, show, run, revert
* ts - run type-checking
* lint - run eslint + prettier
* db seed and reset (truncate all tables)
