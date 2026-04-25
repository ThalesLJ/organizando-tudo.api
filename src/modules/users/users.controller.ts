import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../../common/interfaces/authenticated-request.interface';
import { UpdateColorsDto } from './dto/update-colors.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: JwtPayload): Promise<Record<string, unknown>> {
    return this.usersService.getMe(user.sub);
  }

  @Patch('profile')
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto): Promise<{ success: boolean }> {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Patch('settings/colors')
  updateColors(@CurrentUser() user: JwtPayload, @Body() dto: UpdateColorsDto): Promise<Record<string, unknown>> {
    return this.usersService.updateColors(user.sub, dto);
  }

  @Patch('settings/language')
  updateLanguage(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateLanguageDto,
  ): Promise<Record<string, unknown>> {
    return this.usersService.updateLanguage(user.sub, dto);
  }
}
