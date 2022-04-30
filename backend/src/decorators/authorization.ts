import { applyDecorators, createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common";
import { IUserAuth } from "src/components/users/users.interfaces";

export type AuthFlags = 'user' | 'admin' | 'bot';
export type ThrowCon = "user_id" | "token" | "ip" | "flags";

export interface IAuthData { 
  user?: AuthFlags | AuthFlags[], 
  token?: AuthFlags | AuthFlags[], 
  throw?: ThrowCon | ThrowCon[] 
}

/**
 * @description Scope route method to certain flags
 * @param data Authorization Parameters
 */
export function Auth (data: IAuthData) {
  return applyDecorators(
    SetMetadata('auth', data)
  )
}

/**
 * @description Get parsed authorization data
 */
export const Token = createParamDecorator(
  (data: unknown, context: ExecutionContext): IUserAuth => {
    return Reflect.getMetadata('token', context.getHandler());
  },
);