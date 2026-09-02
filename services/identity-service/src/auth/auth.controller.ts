import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { GuestSessionDto } from './dto/guest-session.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ValidateDto } from './dto/validate.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('guest')
  async createGuestSession(@Body() guestDto: GuestSessionDto) {
    return this.authService.createGuestSession(guestDto);
  }

  @Post('refresh')
  async refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.refreshToken(refreshDto.token);
  }

  @Post('validate')
  async validate(@Body() validateDto: ValidateDto) {
    return this.authService.validateToken(validateDto.token);
  }
}
