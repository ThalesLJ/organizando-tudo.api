import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HashService } from '../../infrastructure/crypto/hash.service';
import { EmailService } from '../../infrastructure/email/email.service';
import { SessionsService } from '../sessions/sessions.service';
import { UpdateColorsDto } from './dto/update-colors.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User, type UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly hashService: HashService,
    private readonly sessionsService: SessionsService,
    private readonly emailService: EmailService,
  ) {}

  async findById(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user || user.isActive === false) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getMe(userId: string): Promise<Record<string, unknown>> {
    const user = await this.findById(userId);
    return {
      id: String(user._id),
      username: user.username,
      email: user.email,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<{ success: boolean }> {
    const user = await this.findById(userId);

    const passwordHashField = user.get('passwordHash') as string | undefined;
    const storedPassword = user.password ?? passwordHashField ?? '';
    const isPasswordValid = await this.hashService.verify(storedPassword, dto.currentPassword);
    if (!isPasswordValid) {
      throw new ConflictException('Invalid current password');
    }

    const oldEmail = user.email;
    const newEmail = dto.email?.toLowerCase() ?? user.email;
    const newUsername = dto.username ?? user.username;

    if (newEmail !== user.email) {
      const emailExists = await this.userModel.exists({ email: newEmail, _id: { $ne: user._id } });
      if (emailExists) {
        throw new ConflictException('Email already in use');
      }
    }

    if (newUsername !== user.username) {
      const usernameExists = await this.userModel.exists({ username: newUsername, _id: { $ne: user._id } });
      if (usernameExists) {
        throw new ConflictException('Username already in use');
      }
    }

    user.email = newEmail;
    user.username = newUsername;
    user.session = {
      isValid: false,
    };
    await user.save();

    await this.sessionsService.invalidateSession(String(user._id));
    await this.emailService.sendProfileChangedEmail(oldEmail, user.email);
    return { success: true };
  }

  async updateColors(userId: string, dto: UpdateColorsDto): Promise<Record<string, unknown>> {
    const user = await this.findById(userId);

    user.preferences = {
      ...user.preferences,
      colors: {
        backgroundPrimary: dto.backgroundPrimary,
        backgroundSecondary: dto.backgroundSecondary,
        textPrimary: dto.textPrimary,
        textSecondary: dto.textSecondary,
      },
    };

    await user.save();
    return {
      colors: user.preferences.colors,
    };
  }

  async updateLanguage(userId: string, dto: UpdateLanguageDto): Promise<Record<string, unknown>> {
    const user = await this.findById(userId);
    user.preferences = {
      ...user.preferences,
      language: dto.language,
    };
    await user.save();
    return {
      language: user.preferences.language,
    };
  }
}
