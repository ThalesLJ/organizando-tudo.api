import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthenticatedRequest, JwtPayload } from '../interfaces/authenticated-request.interface';
import { SessionsService } from '../../modules/sessions/sessions.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly sessionsService: SessionsService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = await super.canActivate(context);
    if (!canActivate) {
      throw new UnauthorizedException('Unauthorized');
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user as JwtPayload | undefined;
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const authorizationHeader = request.headers.authorization;
    const token = authorizationHeader?.replace('Bearer ', '').trim();
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    await this.sessionsService.validateActiveSession(user, token);
    return true;
  }
}
