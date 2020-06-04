export enum UserRole {
  client = 0,
  professional = 1
}

export class User {
  email: string;
  role: UserRole;
  profilePic: string;
  name: string;
  token: string;
  hasProfilePic: boolean;
  profileCompleted: boolean;
  companyName: string;
  about: string;
}