import { MiddlewareFn } from "type-graphql/dist/interfaces/Middleware";
import { MyApolloContext } from "../types";
import { AuthenticationError } from "apollo-server-express";

export const isAuth: MiddlewareFn<MyApolloContext> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new AuthenticationError("Not authenticated");
  }
  return next();
};
