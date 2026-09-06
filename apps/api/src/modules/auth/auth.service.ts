import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomInt } from 'crypto';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  RegisterDto,
  LoginDto,
  ActivateAccountDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { NotificationsService } from '../../infrastructure/notifications/notifications.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  private generateSixDigitCode(): string {
    return randomInt(100000, 999999).toString();
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const activationCode = this.generateSixDigitCode();
    const activationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiration

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        isActivated: false,
        activationCode,
        activationCodeExpiresAt,
      },
    });

    // Send Activation Email via Mailpit Queue
    await this.notificationsService.sendActivationEmail(
      user.email,
      activationCode,
    );

    return {
      message: 'Registration successful. Please check your email for the activation code.',
    };
  }

  async activateAccount(dto: ActivateAccountDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isActivated) {
      throw new BadRequestException('Account is already activated');
    }

    if (
      user.activationCode !== dto.code ||
      !user.activationCodeExpiresAt ||
      user.activationCodeExpiresAt < new Date()
    ) {
      throw new BadRequestException('Invalid or expired activation code');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isActivated: true,
        activationCode: null,
        activationCodeExpiresAt: null,
      },
    });

    return { message: 'Account activated successfully. You can now log in.' };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActivated) {
      throw new UnauthorizedException(
        'Account is not activated. Please activate your account first.',
      );
    }

    return this.generateTokens(user.id, user.email);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Always return success message to prevent email enumeration attacks
    if (!user) {
      return {
        message: 'If the email exists, a password reset code has been sent.',
      };
    }

    const resetCode = this.generateSixDigitCode();
    const resetCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiration

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordCode: resetCode,
        resetPasswordCodeExpiresAt: resetCodeExpiresAt,
      },
    });

    // Dispatch email notification job
    await this.notificationsService.sendPasswordResetEmail(
      user.email,
      resetCode,
    );

    return {
      message: 'If the email exists, a password reset code has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('Invalid request or code');
    }

    if (
      user.resetPasswordCode !== dto.code ||
      !user.resetPasswordCodeExpiresAt ||
      user.resetPasswordCodeExpiresAt < new Date()
    ) {
      throw new BadRequestException('Invalid or expired password reset code');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordCode: null,
        resetPasswordCodeExpiresAt: null,
      },
    });

    // Revoke all active refresh tokens for security
    await this.prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    return {
      message: 'Password reset successfully. Please log in with your new password.',
    };
  }

  async refreshToken(refreshToken: string) {
    const refreshTokenHash = createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshTokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });

    return this.generateTokens(storedToken.user.id, storedToken.user.email);
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'super-secret-key-change-in-prod',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'super-refresh-secret-key',
      expiresIn: '7d',
    });

    const refreshTokenHash = createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenHash,
        userId,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}