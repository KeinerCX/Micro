export class CreateUserDTO {
  username: string
  email: string
  password: string
}

export class LoginDTO {
  login_id: string
  password: string
  remember_session?: boolean
}