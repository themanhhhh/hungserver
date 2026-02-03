import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserService } from './user.service';
import { User } from '../entities/User';
import { DeepPartial } from 'typeorm';

// JWT Secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export class AuthService {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token
   */
  generateToken(payload: AuthPayload): string {
    const options: jwt.SignOptions = { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] };
    return jwt.sign(payload, JWT_SECRET, options);
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): AuthPayload {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<LoginResponse> {
    // Check if email already exists
    const existingUser = await this.userService.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Hash password
    const password_hash = await this.hashPassword(data.password);

    // Create user
    const userData: DeepPartial<User> = {
      email: data.email,
      password_hash,
      name: data.name,
      phone: data.phone,
    };

    const user = await this.userService.create(userData);

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password_hash from response
    const { password_hash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as Omit<User, 'password_hash'>,
      token,
    };
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    // Find user by email
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isValidPassword = await this.comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password_hash from response
    const { password_hash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as Omit<User, 'password_hash'>,
      token,
    };
  }

  /**
   * Get user by ID (for token verification)
   */
  async getUserById(userId: string): Promise<Omit<User, 'password_hash'> | null> {
    const user = await this.userService.findById(userId);
    if (!user) return null;

    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password_hash'>;
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Get user with password hash
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await this.comparePassword(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }

    // Hash new password and update
    const newPasswordHash = await this.hashPassword(newPassword);
    await this.userService.update(userId, { password_hash: newPasswordHash });
  }
}
