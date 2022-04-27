import { HttpException, HttpStatus } from "@nestjs/common";

export class ServiceError {
  readonly status: number
  readonly id: string
  readonly message: string | undefined

  constructor (status: number, id: string, message?: string) {
    this.status = status;
    this.id = id;
    this.message = message;
  }
}

namespace Errors {
  export function BadRequest (id: string, message?: string) {
    return new HttpException({ status: HttpStatus.BAD_REQUEST, id, message }, HttpStatus.BAD_REQUEST)
  }

  export function Unauthorized (id: string, message?: string) {
    return new HttpException({ status: HttpStatus.UNAUTHORIZED, id, message }, HttpStatus.UNAUTHORIZED)
  }
  
  export function Forbidden (id: string, message?: string) {
    return new HttpException({ status: HttpStatus.FORBIDDEN, id, message }, HttpStatus.FORBIDDEN)
  }
  
  export function UnsupportedMedia (id: string, message?: string) {
    return new HttpException({ status: HttpStatus.UNSUPPORTED_MEDIA_TYPE, id, message }, HttpStatus.UNSUPPORTED_MEDIA_TYPE)
  }
}

export default Errors;