import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: exception.message || 'Internal server error' };

    let messageString = '';
    if (typeof exceptionResponse === 'string') {
      messageString = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const msg = (exceptionResponse as any).message;
      if (Array.isArray(msg)) {
        messageString = msg.join(', ');
      } else {
        messageString = msg || 'Internal server error';
      }
    } else {
      messageString = 'Internal server error';
    }

    // Never leak raw internal stack traces/database errors to the public client in production
    const isProduction = process.env.NODE_ENV === 'production';
    if (status === HttpStatus.INTERNAL_SERVER_ERROR && !isProduction) {
      console.error('Unhandled internal exception:', exception);
    }

    response.status(status).json({
      success: false,
      message: messageString,
      statusCode: status,
    });
  }
}

