import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiException extends HttpException {
  constructor(message: string, code: string, statusCode: HttpStatus) {
    super(
      {
        message,
        code,
      },
      statusCode,
    );
  }
}
