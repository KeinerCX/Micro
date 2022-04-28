import { Express, NextFunction } from "express"
import { PrismaService } from "src/components/prisma.service"

export function rAsync (route: (req: Express.Request, res: Express.Response, next: NextFunction) => Promise<any>) {
  return async (req: Express.Request, res: Express.Response, next: NextFunction) => {
    try { await route(req, res, next) } catch (err: any) { next(err) }
  }
}

export async function GenerateAccessCode () {
  const prisma = new PrismaService();
  const characters = "abcdefghijklmnopqrstuvwxyz"
  let out = "";

  let loops = 0;
  for (let i = 0; i < 5; i++) {
    out += characters[Math.floor(Math.random() * characters.length) || 0]
    if (i === 4) {
      if (loops !== 2) { i = -1; out += "-" }
      loops++;
    }
  }

  if (await prisma.accessCode.findUnique({ where: { code: out } })) out = await GenerateAccessCode();

  return out;
}