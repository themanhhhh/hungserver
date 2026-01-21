import { BaseService } from './base.service';
import { User } from '../entities/User';
import { UserRepository } from '../repositories/user.repository';
import { DeepPartial } from 'typeorm';

export class UserService extends BaseService<User> {
  private userRepository: UserRepository;

  constructor() {
    const userRepository = new UserRepository();
    super(userRepository);
    this.userRepository = userRepository;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findActiveUsers(): Promise<User[]> {
    return this.userRepository.findActiveUsers();
  }

  async createUser(data: DeepPartial<User>): Promise<User> {
    // Check if email already exists
    if (data.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new Error('Email already exists');
      }
    }
    return this.create(data);
  }
}
