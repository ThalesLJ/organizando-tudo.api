import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

    const errorMessage =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as { message?: string | string[] }).message ?? 'Internal server error';

    this.logger.error(
      `Request failed: ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      success: false,
      error: {
        code: status,
        message: errorMessage,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
