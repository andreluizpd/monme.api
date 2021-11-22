import { Redis } from 'ioredis';
import { Request, Response } from 'express';
import session from 'express-session';
import { createUserLoader } from './utils/createUserLoader';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

export type MyContext = {
  req: Request & { session: session.SessionData };
  res: Response;
  redis: Redis;
  userLoader: ReturnType<typeof createUserLoader>;
};
