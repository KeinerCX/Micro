import { HttpException, HttpStatus } from "@nestjs/common";

export class ServiceError {
  readonly status: number
  readonly id: string
  readonly message: string | undefined

  constructor(status: number, id: string, message?: string) {
    this.status = status;
    this.id = id;
    this.message = message;
  }

  handle () {
    return new HttpException({ status: this.status, id: this.id, message: this.message }, this.status)
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

  export function InternalServerError () {
    return new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, id: 'internal_server_error' }, HttpStatus.INTERNAL_SERVER_ERROR)
  }
}

export default Errors;

export function HandleServiceError (error: any) {
  if (error instanceof ServiceError) {
    return error.handle();
  } else {
    console.error(error.message);
    return Errors.InternalServerError();
  }
}