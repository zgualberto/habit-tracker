import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import argon2 from 'argon2';
import { randomUUID } from 'node:crypto';

import {
  ERROR_CODES,
  ERROR_MESSAGES,
  type AuthenticationResponse,
  type LoginRequest,
  type RegistrationRequest,
  type UpdateProfileRequest,
  type UserProfile,
} from '@habit-tracker/contracts';

import {
  ARGON2_HASHING_OPTIONS,
  AUTHENTICATION_SESSION_DURATION_IN_MILLISECONDS,
  AUTHENTICATION_USER_AGENT_MAXIMUM_LENGTH,
} from '../common/constants/authentication.constants';
import { AuthenticationSessionRepository } from './authentication-session.repository';
import { UserRepository } from './user.repository';

export type IssuedAuthentication = {
  user: UserProfile;
  token: string;
};

@Injectable()
export class AuthenticationService {
  private readonly dummyPasswordHash: Promise<string>;

  public constructor(
    private readonly userRepository: UserRepository,
    private readonly authenticationSessionRepository: AuthenticationSessionRepository,
    private readonly jwtService: JwtService,
  ) {
    // Verifying against a real hash when the email is unknown keeps the response
    // time similar and avoids revealing which accounts exist.
    this.dummyPasswordHash = argon2.hash(randomUUID(), ARGON2_HASHING_OPTIONS);
  }

  public async register(
    request: RegistrationRequest,
    userAgent: string | undefined,
  ): Promise<IssuedAuthentication> {
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser !== null) {
      throw new ConflictException({
        errorCode: ERROR_CODES.EMAIL_ALREADY_REGISTERED,
        message: ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED,
      });
    }

    const passwordHash = await argon2.hash(request.password, ARGON2_HASHING_OPTIONS);
    const user = await this.userRepository.create({
      email: request.email,
      passwordHash,
      displayName: request.displayName,
      timeZone: request.timeZone,
    });

    const token = await this.issueToken(user, userAgent);
    return { user: this.toUserProfile(user), token };
  }

  public async login(
    request: LoginRequest,
    userAgent: string | undefined,
  ): Promise<IssuedAuthentication> {
    const user = await this.userRepository.findByEmail(request.email);
    const passwordHash = user?.passwordHash ?? (await this.dummyPasswordHash);
    const isPasswordValid = await argon2.verify(passwordHash, request.password);

    if (user === null || !isPasswordValid) {
      throw new UnauthorizedException({
        errorCode: ERROR_CODES.INVALID_CREDENTIALS,
        message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      });
    }

    const token = await this.issueToken(user, userAgent);
    return { user: this.toUserProfile(user), token };
  }

  public async logout(sessionIdentifier: string): Promise<void> {
    await this.authenticationSessionRepository.revoke(sessionIdentifier);
  }

  public async getProfile(userIdentifier: string): Promise<UserProfile> {
    const user = await this.userRepository.findByIdentifier(userIdentifier);
    if (user === null) {
      throw new UnauthorizedException({
        errorCode: ERROR_CODES.UNAUTHENTICATED,
        message: ERROR_MESSAGES.UNAUTHENTICATED,
      });
    }
    return this.toUserProfile(user);
  }

  public async updateProfile(
    userIdentifier: string,
    request: UpdateProfileRequest,
  ): Promise<UserProfile> {
    const user = await this.userRepository.updateProfile(userIdentifier, {
      displayName: request.displayName,
      timeZone: request.timeZone,
    });
    return this.toUserProfile(user);
  }

  public async getAuthenticationResponse(userIdentifier: string): Promise<AuthenticationResponse> {
    return { user: await this.getProfile(userIdentifier) };
  }

  private async issueToken(user: User, userAgent: string | undefined): Promise<string> {
    const expiresAt = new Date(Date.now() + AUTHENTICATION_SESSION_DURATION_IN_MILLISECONDS);
    const session = await this.authenticationSessionRepository.create({
      userIdentifier: user.identifier,
      userAgent: this.normaliseUserAgent(userAgent),
      expiresAt,
    });

    return this.jwtService.signAsync({
      sub: user.identifier,
      sessionIdentifier: session.identifier,
    });
  }

  private normaliseUserAgent(userAgent: string | undefined): string | null {
    if (userAgent === undefined || userAgent.length === 0) {
      return null;
    }
    return userAgent.slice(0, AUTHENTICATION_USER_AGENT_MAXIMUM_LENGTH);
  }

  private toUserProfile(user: User): UserProfile {
    return {
      identifier: user.identifier,
      email: user.email,
      displayName: user.displayName,
      timeZone: user.timeZone,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
