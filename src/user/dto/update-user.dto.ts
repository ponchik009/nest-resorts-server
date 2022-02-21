export class UpdateUserDto {
  username?: string;
  password?: string;
  verificationCode?: string;
  email?: string;
  isVerif?: boolean;
}

export default UpdateUserDto;
