import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import * as requestIp from '@supercharge/request-ip';
import * as jwt from 'jsonwebtoken';
import { IUserAuth, IUserSession } from 'src/components/users/users.interfaces';
import { PrismaService } from "src/components/prisma.service";

export const Auth = createParamDecorator(
  async (data: { user?: string | string[], token?: string | string[] }, ctx: ExecutionContext) => {
    const prisma = new PrismaService();
    const userFlags: string[] = data.user ? (typeof data.user === 'string' ? [data.user] : data.user) : [];
    const tokenFlags: string[] = data.token ? (typeof data.token === 'string' ? [data.token] : data.token) : [];
  
    const req = ctx.switchToHttp().getRequest();
    const ip = requestIp.getClientIp(req);

    let verified = false;
    jwt.verify(req.headers['authorization'], process.env.PRIVATE_KEY, (err) => { if (!err) verified = true })
    if (!verified) return {
      user_id: undefined,
      token: undefined,
      verified_ip: false,
      verified_flags: false
    }

    const token_payload = jwt.decode(req.headers['authorization']) as IUserSession;
  
    const out: IUserAuth = {
      user_id: undefined,
      token: undefined,
      verified_ip: false,
      verified_flags: true
    };

    if (ip === token_payload.client_ip) out.verified_ip = true;
  
    const user = await prisma.user.findUnique({ where: { id: token_payload.user_id } })
    if (user) {
      out.user_id = user.id; out.token = req.headers['authorization'];
      for (const flag of userFlags) if (!user.flags.includes(flag)) out.verified_flags = false;
      for (const flag of tokenFlags) if (!token_payload.flags.includes(flag)) out.verified_flags = false;
    } else out.verified_flags = false;
  
    return out;
  }
);