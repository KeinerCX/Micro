export interface INewUser {
  username: string
  displayname: string | undefined
  email: string
  id: string
  joined: Date
}

export interface IUserSession {
  user_id: string
  client_ip: string
  flags: string[]
  expires: Date
  token: string
}

export interface IUserAuth {
  user_id?: string
  token?: string
  verified_ip: boolean
  verified_flags: boolean
}