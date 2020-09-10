### Note: Breaddit is WIP 🚧

## What is breaddit

Breaddit is a reddit-inspired online platform.

## How to run

Web server:

```
$ cd web/
$ yarn dev
```

Backend API:

```
$ cd server/
$ yarn dev
```

Install latest version of Docker

Postgres:

```
docker-compose up db
```

Redis:

```
docker-compose up redis
```

If you want to directly edit the Postgres db:

```
docker-compose up pgadmin
```

Accessible on: http://localhost:5433

- Email: postgres@pgadmin.com
- Password: postgres
