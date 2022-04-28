import { Express, NextFunction } from "express"

export function rAsync (route: (req: Express.Request, res: Express.Response, next: NextFunction) => Promise<any>) {
  return async (req: Express.Request, res: Express.Response, next: NextFunction) => {
    try { await route(req, res, next) } catch (err: any) { next(err) }
  }
}