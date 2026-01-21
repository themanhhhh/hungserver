import { BaseRepository } from './base.repository';
import { Address } from '../entities/Address';

export class AddressRepository extends BaseRepository<Address> {
  constructor() {
    super(Address);
  }

  async findByUser(userId: string): Promise<Address[]> {
    return this.repository.find({
      where: { user_id: userId, is_delete: false },
    });
  }

  async findDefaultAddress(userId: string): Promise<Address | null> {
    return this.repository.findOne({
      where: { user_id: userId, is_default: true, is_delete: false },
    });
  }
}
