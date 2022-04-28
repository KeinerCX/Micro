import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import * as requestIp from '@supercharge/request-ip';
import * as jwt from 'jsonwebtoken';
import { IUserAuth, IUserSession } from 'src/components/users/users.interfaces';
import { PrismaService } from "src/components/prisma.service";

export const Auth = createParamDecorator(
  async (data: string | string[], ctx: ExecutionContext) => {
    const prisma = new PrismaService();
    const flags: string[] = typeof data === 'string' ? [data] : data;
  
    const req = ctx.switchToHttp().getRequest();
    const ip = requestIp.getClientIp(req);
    const token_payload = jwt.decode(req.headers['authorization']) as IUserSession;
  
    const out: IUserAuth = {
      user_id: undefined,
      token: undefined,
      verified_ip: false,
      verified_flags: true
    };

    for (const flag of flags) if (!token_payload.flags.includes(flag)) out.verified_flags = false;
  
    if (ip === token_payload.client_ip) out.verified_ip = true;
  
    const user = await prisma.user.findUnique({ where: { id: token_payload.user_id } })
    if (user) { out.user_id = user.id; out.token = req.headers['authorization']; }
  
    return out;
  }
);