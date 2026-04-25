import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { HashService } from '../../infrastructure/crypto/hash.service';
import { EmailService } from '../../infrastructure/email/email.service';
import { SessionsService } from '../sessions/sessions.service';
import { User, type UserDocument } from '../users/schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SendCodeDto } from './dto/send-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { Code, type CodeDocument } from './schemas/code.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Code.name) private readonly codeModel: Model<CodeDocument>,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly sessionsService: SessionsService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{ success: boolean }> {
    const existingUser = await this.userModel.findOne({
      $or: [{ email: dto.email.toLowerCase() }, { username: dto.username }],
    });

    if (existingUser) {
      throw new ConflictException('Username or email already in use');
    }

    const passwordHash = await this.hashService.hash(dto.password);
    await this.userModel.create({
      username: dto.username,
      email: dto.email.toLowerCase(),
      password: passwordHash,
      preferences: {
        language: 'en',
        colors: null,
      },
      session: {
        isValid: false,
      },
    });

    return { success: true };
  }

  async login(dto: LoginDto): Promise<{ token: string; user: { username: string } }> {
    const identifier = dto.email?.toLowerCase() ?? dto.username;
    if (!identifier) {
      throw new BadRequestException('Email or username is required');
    }

    const user = await this.userModel.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
    });

    if (!user || user.isActive === false) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.hashService.verify(this.getUserPasswordValue(user), dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const sessionId = uuid();
    const expiresIn = dto.keepLoggedIn ? '30d' : '8h';
    const payload = {
      sub: String(user._id),
      username: user.username,
      sessionId,
    };

    const token = await this.jwtService.signAsync(payload, {
      issuer: this.configService.getOrThrow<string>('JWT_ISSUER'),
      expiresIn,
    });

    const decoded = this.jwtService.decode(token) as { exp: number } | null;
    if (!decoded?.exp) {
      throw new UnauthorizedException('Could not create session');
    }

    await this.sessionsService.createSession(user, sessionId, token, new Date(decoded.exp * 1000));

    return {
      token,
      user: {
        username: user.username,
      },
    };
  }

  async logout(userId: string): Promise<{ success: boolean }> {
    await this.sessionsService.invalidateSession(userId);
    return { success: true };
  }

  async sendRecoveryCode(dto: SendCodeDto): Promise<{ success: boolean }> {
    const normalizedEmail = dto.email.toLowerCase();
    const user = await this.userModel.findOne({ email: normalizedEmail });
    if (!user) {
      return { success: true };
    }

    const code = this.generateRecoveryCode();
    const codeHash = await this.hashService.hash(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.codeModel.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          codeHash,
          expiresAt,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    try {
      await this.emailService.sendPasswordRecoveryCode(user.email, code);
    } catch (error) {
      this.logger.error('Failed to send password recovery email', error instanceof Error ? error.stack : undefined);
    }

    return { success: true };
  }

  async verifyRecoveryCode(dto: VerifyCodeDto): Promise<{ success: boolean }> {
    const activeCodes = await this.codeModel.find({ expiresAt: { $gt: new Date() } });
    let matchedCode: CodeDocument | null = null;

    for (const activeCode of activeCodes) {
      const matches = await this.hashService.verify(activeCode.codeHash, dto.code);
      if (matches) {
        matchedCode = activeCode;
        break;
      }
    }

    if (!matchedCode) {
      throw new BadRequestException('Invalid or expired recovery code');
    }

    const matchedUser = await this.userModel.findOne({ email: matchedCode.email });
    if (!matchedUser) {
      throw new BadRequestException('Invalid or expired recovery code');
    }

    matchedUser.password = await this.hashService.hash(dto.password);
    matchedUser.session = {
      isValid: false,
    };
    await matchedUser.save();
    await this.codeModel.deleteOne({ _id: matchedCode._id });

    return { success: true };
  }

  async getUserById(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private generateRecoveryCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getUserPasswordValue(user: UserDocument): string {
    const passwordHashField = user.get('passwordHash') as string | undefined;
    return user.password ?? passwordHashField ?? '';
  }
}
