import { Server } from "socket.io";

declare global {
  namespace NodeJS {
    interface Global {
      io?: Server;
    }
  }
}

export {};

export const asyncHandler =
  (fn: Function) =>
  (req: Request, res: Response, next: Function) =>
    Promise.resolve(fn(req, res, next)).catch(next);