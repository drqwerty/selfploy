export enum UserRole {
  client,
  professional,
}

export enum WorkingHours {
  morning = 'mañana',
  afternoon = 'tarde',
  evening = 'noche',
  flexible = 'flexible'
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
  services: any;
  workingHours: WorkingHours[];
}