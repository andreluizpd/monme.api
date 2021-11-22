import 'reflect-metadata';
import { User } from './entities/User';
import { Service } from './entities/Service';
import { UserResolver } from './resolvers/user';
import { __prod__, COOKIE_NAME } from './constants';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { ServiceResolver } from './resolvers/service';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';
import { createConnection } from 'typeorm';

const main = async () => {
  createConnection({
    type: 'postgres',
    database: 'monme',
    username: 'postgres',
    password: 'postgres',
    logging: true,
    synchronize: true,
    entities: [Service, User],
  });

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      saveUninitialized: false,
      secret: 'alksdjlasjdlkjasdkiasoiqwknqwoijqwdoih',
      resave: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        secure: __prod__, // only works on HTTPS
        sameSite: 'lax',
      },
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, ServiceResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res, redis }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () =>
    console.log('server started on http://localhost:4000')
  );
};

main().catch(err => console.error(err));
