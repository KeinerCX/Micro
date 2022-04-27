import { HttpException, HttpStatus } from "@nestjs/common";

export function BadRequest (id: string, message?: string) {
  return new HttpException({ status: HttpStatus.BAD_REQUEST, id, message }, HttpStatus.BAD_REQUEST)
}

export function UnsupportedMedia (id: string, message?: string) {
  return new HttpException({ status: HttpStatus.BAD_REQUEST, id, message }, HttpStatus.BAD_REQUEST)
}