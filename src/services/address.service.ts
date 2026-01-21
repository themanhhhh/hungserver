import { BaseService } from './base.service';
import { Address } from '../entities/Address';
import { AddressRepository } from '../repositories/address.repository';

export class AddressService extends BaseService<Address> {
  private addressRepository: AddressRepository;

  constructor() {
    const addressRepository = new AddressRepository();
    super(addressRepository);
    this.addressRepository = addressRepository;
  }

  async findByUser(userId: string): Promise<Address[]> {
    return this.addressRepository.findByUser(userId);
  }

  async findDefaultAddress(userId: string): Promise<Address | null> {
    return this.addressRepository.findDefaultAddress(userId);
  }
}
