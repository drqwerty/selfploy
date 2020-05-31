export enum UserRole {
  client = 0,
  profesional = 1
}

export class User {
  email: string;
  role: UserRole;
  profilePic: string;
  name: string;
  token: string;
}