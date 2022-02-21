import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dto/register.dto';
const bcrypt = require('bcrypt');
import TokenPayload from './interface/tokenPayload.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import RegisterEmail from './dto/register-email.dto';
import VerifyEmail from './dto/verify-email.dto';
import { sendEmail } from 'src/sendEmail';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async registerEmail(dto: RegisterEmail) {
    try {
      const { email } = dto;
      const user = await this.userService.getByEmail(email);
      if (user) {
        if (user.isVerif) {
          // бросаем исключение - пользователь зарегестрирован
          throw new HttpException(
            'Пользователь с таким адресом уже зарегистрирован!',
            HttpStatus.BAD_REQUEST,
          );
        } else {
          // генерируем код и обновляем его
          const verificationCode = this.generateVerificationCode();
          const updatedUser = await this.userService.update(user.id, {
            verificationCode,
          });
          // отправляем код на почту
          try {
            await sendEmail(
              email,
              'VERIFY YOUR EMAIL ✔',
              `<b>Hello world!</b><p>${verificationCode} - your code to verify Email on our Hotel site!</p>`,
            );
          } catch (e) {
            console.log(e);
          }
          return updatedUser;
        }
      } else {
        // генерируем код
        const verificationCode = this.generateVerificationCode();
        const createdUser = await this.userService.create({
          email,
          verificationCode,
        });
        // отправляем код на почту
        try {
          await sendEmail(
            email,
            'VERIFY YOUR EMAIL ✔',
            `<b>Hello world!</b><p>${verificationCode} - your code to verify Email on our Hotel site!</p>`,
          );
        } catch (e) {
          console.log(e);
        }
        return createdUser;
      }
    } catch (error) {
      console.log(error);
    }
  }

  private generateVerificationCode() {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += Math.round(Math.random() * 10);
    }
    return code;
  }

  public async verifyEmail(dto: VerifyEmail) {
    try {
      const { email, verificationCode } = dto;
      const user = await this.userService.getByEmail(email);
      if (!user) {
        // бросаем исключение - пользователь не найден
        throw new HttpException(
          'Пользователя не существует!',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        if (user.verificationCode === verificationCode) {
          await this.userService.update(user.id, {
            verificationCode,
            isVerif: true,
          });
          return {
            status: 'ok',
          };
        } else {
          // бросаем исключение - код не совпадает
          throw new HttpException('Неверный код!', HttpStatus.BAD_REQUEST);
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  public async register(registrationData: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    try {
      const user = await this.userService.getByEmail(registrationData.email);
      const createdUser = await this.userService.update(user.id, {
        ...registrationData,
        password: hashedPassword,
      });
      createdUser.password = undefined;

      return createdUser;
    } catch (error) {
      console.log(error);
    }
  }

  public async getAuthenticatedUser(
    username: string,
    plainTextPassword: string,
  ) {
    try {
      const user = await this.userService.getByUsername(username);
      await this.verifyPassword(plainTextPassword, user.password);
      user.password = undefined;
      return user;
    } catch (error) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public getCookieWithJwtToken(userId: number) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload);
    // return {
    //   key: 'Authentication',
    //   value: token,
    //   options: {
    //     paht: '/',
    //     maxAge: this.configService.get('JWT_EXPIRATION_TIME'),
    //   },
    // };
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_EXPIRATION_TIME',
    )}`;
  }

  public getCookieForLogOut() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
