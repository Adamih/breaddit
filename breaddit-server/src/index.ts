import "reflect-metadata";
import { createConnection } from "typeorm";
import { __prod__, COOKIE_NAME } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyExpressContext, MyApolloContext } from "./types";
import cors from "cors";
import { User } from "./enteties/User";
import { Post } from "./enteties/Post";

const main = async () => {
  await createConnection({
    type: "postgres",
    database: "postgres",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: true,
    entities: [User, Post],
  });

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redis }),
      secret: "snek",
      resave: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 14, // 2 weeks
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: __prod__, // Break if production is not https
      },
      saveUninitialized: false,
    })
  );

  const apolloServerContext = ({
    req,
    res,
  }: MyExpressContext): MyApolloContext => {
    return { req, res, redis };
  };

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: apolloServerContext,
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => {
    console.log("Server started on http://localhost:4000");
  });
};

main();
