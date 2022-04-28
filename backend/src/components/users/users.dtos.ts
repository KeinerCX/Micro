export class CreateUserDTO {
  username: string
  email: string
  password: string
  access_code: string
}

export class LoginDTO {
  login_id: string
  password: string
  remember_session?: boolean
}