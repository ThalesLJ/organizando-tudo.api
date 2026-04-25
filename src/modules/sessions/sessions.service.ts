import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HashService } from '../../infrastructure/crypto/hash.service';
import type { JwtPayload } from '../../common/interfaces/authenticated-request.interface';
import { User, type UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly hashService: HashService,
  ) {}

  async createSession(user: UserDocument, sessionId: string, token: string, expiresAt: Date): Promise<void> {
    const tokenHash = await this.hashService.hash(token);
    user.session = {
      sessionId,
      tokenHash,
      expiresAt,
      isValid: true,
    };
    user.lastLoginAt = new Date();
    await user.save();
  }

  async invalidateSession(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $set: {
        'session.isValid': false,
      },
      $unset: {
        'session.sessionId': '',
        'session.tokenHash': '',
        'session.expiresAt': '',
      },
    });
  }

  async validateActiveSession(payload: JwtPayload, token: string): Promise<void> {
    const user = await this.userModel.findById(payload.sub);
    if (!user || user.isActive === false) {
      throw new UnauthorizedException('Invalid session');
    }

    if (!user.session?.isValid || !user.session.sessionId || !user.session.tokenHash || !user.session.expiresAt) {
      throw new UnauthorizedException('Invalid session');
    }

    if (user.session.sessionId !== payload.sessionId) {
      throw new UnauthorizedException('Invalid session');
    }

    if (user.session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Session expired');
    }

    const isTokenValid = await this.hashService.verify(user.session.tokenHash, token);
    if (!isTokenValid) {
      throw new UnauthorizedException('Invalid session');
    }
  }
}
