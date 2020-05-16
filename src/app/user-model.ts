export enum UserType {
  client = 0,
  profesional = 1
}

export class User {
  email: string;
  type: UserType;
  profilePictureUrl: string;
  name: string;
}