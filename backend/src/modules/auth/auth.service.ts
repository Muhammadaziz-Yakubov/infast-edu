import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { StudentsService } from '../students/students.service';
import { RegisterStudentDto } from './dto/register-student.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../../common/enums/roles.enum';
import { UserStatus } from '../../common/enums/status.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly studentsService: StudentsService,
    private readonly jwtService: JwtService
  ) {}

  async registerStudent(dto: RegisterStudentDto): Promise<any> {
    // Check if phone or email already registered
    const emailExists = await this.usersService.findByEmail(dto.email);
    if (emailExists) {
      throw new BadRequestException('Email already registered');
    }
    const phoneExists = await this.usersService.findByPhone(dto.phone);
    if (phoneExists) {
      throw new BadRequestException('Phone number already registered');
    }

    // Create user
    const user = await this.usersService.create({
      ...dto,
      role: Role.STUDENT,
      status: UserStatus.ACTIVE, // Mark active upon self-registration
    });

    // Create student profile
    await this.studentsService.createProfile(user._id.toString());

    // Generate tokens
    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      user,
      ...tokens,
    };
  }

  async login(dto: LoginDto): Promise<any> {
    const { identifier, password } = dto;
    console.log('[Auth Debug] Login payload:', { identifier, password });

    // Retrieve user by email or phone
    let user = null;
    if (identifier.includes('@')) {
      user = await this.usersService.findByEmail(identifier);
    } else {
      user = await this.usersService.findByPhone(identifier);
    }

    console.log('[Auth Debug] User found:', user ? `YES - id=${user._id} status=${user.status} hasPassword=${!!user.password}` : 'NO - user not found in DB');

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.BLOCKED) {
      console.log('[Auth Debug] User is BLOCKED');
      throw new UnauthorizedException('Your account is blocked. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    console.log('[Auth Debug] Password check:', { isPasswordValid, storedHashPreview: (user.password || '').substring(0, 20) + '...' });
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    // Remove password from response
    const userObj = user.toObject();
    delete (userObj as any).password;
    delete (userObj as any).refreshToken;

    return {
      user: userObj,
      ...tokens,
    };
  }

  async refresh(refreshToken: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'infast_academy_os_jwt_refresh_secret_key_2026',
      });

      const user = await this.usersService.findOne(payload.userId);
      const dbUser = await this.userModelWithSecrets(user._id.toString());

      if (!dbUser || !dbUser.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isTokenMatching = await bcrypt.compare(refreshToken, dbUser.refreshToken || '');
      if (!isTokenMatching) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(dbUser);
      await this.usersService.updateRefreshToken(dbUser._id.toString(), tokens.refreshToken);

      return tokens;
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(userId: string, newPassword: string): Promise<any> {
    await this.studentsService.updateStudent(userId, {
      password: newPassword,
      mustChangePassword: false,
    });
    return {
      success: true,
      message: 'Password successfully changed',
    };
  }

  // Helper to fetch user with refresh token secret
  private async userModelWithSecrets(userId: string) {
    return this.usersService.findByIdWithSecrets(userId);
  }

  private async generateTokens(user: any) {
    const payload = { userId: user._id.toString(), email: user.email || '', role: user.role };
    
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'infast_academy_os_jwt_secret_key_2026',
      expiresIn: (process.env.JWT_EXPIRES_IN || '3600s') as any,
    });

    const refreshToken = this.jwtService.sign(
      { userId: user._id.toString() },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'infast_academy_os_jwt_refresh_secret_key_2026',
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
      }
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
