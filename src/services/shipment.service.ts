import { BaseService } from './base.service';
import { Shipment } from '../entities/Shipment';
import { ShipmentRepository } from '../repositories/shipment.repository';
import { DeepPartial } from 'typeorm';

export class ShipmentService extends BaseService<Shipment> {
  private shipmentRepository: ShipmentRepository;

  constructor() {
    const shipmentRepository = new ShipmentRepository();
    super(shipmentRepository);
    this.shipmentRepository = shipmentRepository;
  }

  async findByOrderId(orderId: string): Promise<Shipment[]> {
    return this.shipmentRepository.findByOrderId(orderId);
  }

  async findByOrderIdActive(orderId: string): Promise<Shipment | null> {
    return this.shipmentRepository.findByOrderIdActive(orderId);
  }

  async findByTrackingNumber(trackingNumber: string): Promise<Shipment | null> {
    return this.shipmentRepository.findByTrackingNumber(trackingNumber);
  }

  async findByCarrier(carrier: string): Promise<Shipment[]> {
    return this.shipmentRepository.findByCarrier(carrier);
  }

  async findPendingPickup(): Promise<Shipment[]> {
    return this.shipmentRepository.findPendingPickup();
  }

  async createShipment(data: DeepPartial<Shipment>): Promise<Shipment> {
    return this.create(data);
  }

  async updateShipment(id: string, data: DeepPartial<Shipment>): Promise<Shipment | null> {
    return this.update(id, data);
  }

  async updateTrackingHistory(id: string, event: any): Promise<Shipment | null> {
    const shipment = await this.findById(id);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    const history = shipment.tracking_history ? JSON.parse(shipment.tracking_history) : [];
    history.push({
      ...event,
      timestamp: new Date().toISOString(),
    });

    return this.update(id, {
      tracking_history: JSON.stringify(history),
    } as any);
  }
}
