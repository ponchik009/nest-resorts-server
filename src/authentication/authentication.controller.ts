import {
  Body,
  Req,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  Res,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthenticationService } from './authentication.service';
import RegisterDto from './dto/register.dto';
import RequestWithUser from './interface/requestWithUser.interface';
import { LocalAuthenticationGuard } from './guard/localAuthentication.guard';
import JwtAuthenticationGuard from './guard/jwt-authentication.guard';
import RegisterEmail from './dto/register-email.dto';
import VerifyEmail from './dto/verify-email.dto';
import User from 'src/user/entities/user.entity';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('registerEmail')
  async registerEmail(@Body() dto: RegisterEmail) {
    const newAccount = await this.authenticationService.registerEmail(dto);
    if (newAccount) {
      return newAccount;
    }
    throw new HttpException(
      'Пользователь с таким адресом уже зарегистрирован!',
      HttpStatus.BAD_REQUEST,
    );
  }

  @Post('verifyEmail')
  async verifyEmail(@Body() dto: VerifyEmail) {
    const response = await this.authenticationService.verifyEmail(dto);
    if (response) {
      return response;
    }

    throw new HttpException('Код верификации неверен!', HttpStatus.BAD_REQUEST);
  }

  @Post('register')
  async register(@Body() registrationData: RegisterDto) {
    const newUser = await this.authenticationService.register(registrationData);
    if (!newUser) {
      throw new HttpException(
        'Имя пользователя занято!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = new User();
    user.id = newUser.id;
    user.email = newUser.email;
    user.username = newUser.username;
    user.likes = newUser.likes;
    user.isAdmin = newUser.isAdmin;
    return user;
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('log-in')
  async logIn(@Req() request: RequestWithUser, @Res() response: Response) {
    const { user } = request;
    const cookie = this.authenticationService.getCookieWithJwtToken(user.id);
    response.setHeader('Set-Cookie', cookie);
    // response.cookie(cookie.key, cookie.value, cookie.options);
    user.password = undefined;
    user.verificationCode = undefined;
    user.isVerif = undefined;
    return response.send(user);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('log-out')
  async logOut(@Req() request: RequestWithUser, @Res() response: Response) {
    response.setHeader(
      'Set-Cookie',
      this.authenticationService.getCookieForLogOut(),
    );
    return response.sendStatus(200);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get()
  authenticate(@Req() request: RequestWithUser) {
    const { username, email, id, likes, isAdmin } = request.user;
    const user = new User();
    user.id = id;
    user.email = email;
    user.username = username;
    user.likes = likes;
    user.isAdmin = isAdmin;
    return user;
  }
}
