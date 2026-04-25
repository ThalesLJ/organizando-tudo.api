import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SendCodeDto } from './dto/send-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto): Promise<{ success: boolean }> {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto): Promise<{ token: string; user: { username: string } }> {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() request: AuthenticatedRequest): Promise<{ success: boolean }> {
    return this.authService.logout(request.user.sub);
  }

  @Post('send-code')
  sendCode(@Body() dto: SendCodeDto): Promise<{ success: boolean }> {
    return this.authService.sendRecoveryCode(dto);
  }

  @Post('verify-code')
  verifyCode(@Body() dto: VerifyCodeDto): Promise<{ success: boolean }> {
    return this.authService.verifyRecoveryCode(dto);
  }
}
