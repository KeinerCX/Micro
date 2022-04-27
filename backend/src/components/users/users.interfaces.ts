export interface INewUser {
  username: string
  displayname: string | undefined
  email: string
  id: string
  joined: Date
}

export interface IUserSession {
  user_id: string,
  token: string,
  expires: Date
}