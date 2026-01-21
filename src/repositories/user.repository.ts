import { BaseRepository } from './base.repository';
import { User } from '../entities/User';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email, is_delete: false },
    });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.repository.find({
      where: { is_active: true, is_delete: false },
    });
  }
}
