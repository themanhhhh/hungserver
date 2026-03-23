import { Shipment } from '../entities/Shipment';
import { Order } from '../entities/Order';
import { ShipmentService } from './shipment.service';
import { OrderService } from './order.service';
import { ShipmentStatus, OrderStatus, ShippingMethod, CarrierService } from '../enums';
import { AppDataSource } from '../data-source';
import { DeepPartial } from 'typeorm';

export class FulfillmentService {
  private shipmentService: ShipmentService;
  private orderService: OrderService;

  constructor() {
    this.shipmentService = new ShipmentService();
    this.orderService = new OrderService();
  }

  async createShipmentForOrder(orderId: string, shipmentData: {
    carrier?: string;
    carrier_service?: CarrierService;
    shipping_method?: ShippingMethod;
    pickup_address?: string;
    pickup_name?: string;
    pickup_phone?: string;
    pickup_note?: string;
    delivery_address?: string;
    delivery_name?: string;
    delivery_phone?: string;
    estimated_delivery?: Date;
    shipping_fee?: number;
    weight?: number;
    package_dimension?: string;
  }): Promise<{ success: boolean; message: string; shipment?: Shipment }> {
    const orderRepo = AppDataSource.getRepository(Order);
    const order = await orderRepo.findOne({
      where: { id: orderId },
      relations: ['order_items'],
    });

    if (!order) {
      return { success: false, message: 'Đơn hàng không tồn tại' };
    }

    if (order.payment_status !== 'paid') {
      return { success: false, message: 'Đơn hàng chưa thanh toán' };
    }

    if (order.status === OrderStatus.CANCELLED) {
      return { success: false, message: 'Đơn hàng đã bị hủy' };
    }

    const existingShipment = await this.shipmentService.findByOrderIdActive(orderId);
    if (existingShipment) {
      return { success: false, message: 'Đơn hàng đã có shipment' };
    }

    const shipment = await this.shipmentService.createShipment({
      order_id: orderId,
      carrier: shipmentData.carrier,
      carrier_service: shipmentData.carrier_service || CarrierService.STANDARD,
      shipping_method: shipmentData.shipping_method || ShippingMethod.SELLER_FULFILLMENT,
      pickup_address: shipmentData.pickup_address,
      pickup_name: shipmentData.pickup_name,
      pickup_phone: shipmentData.pickup_phone,
      pickup_note: shipmentData.pickup_note,
      delivery_address: shipmentData.delivery_address,
      delivery_name: shipmentData.delivery_name,
      delivery_phone: shipmentData.delivery_phone,
      estimated_delivery: shipmentData.estimated_delivery,
      shipping_fee: shipmentData.shipping_fee,
      weight: shipmentData.weight,
      package_dimension: shipmentData.package_dimension,
      status: ShipmentStatus.PENDING,
    });

    await this.orderService.update(orderId, {
      status: OrderStatus.AWAITING_SHIPMENT,
    } as any);

    return {
      success: true,
      message: 'Tạo shipment thành công',
      shipment,
    };
  }

  async startPicking(orderId: string): Promise<{ success: boolean; message: string }> {
    const shipment = await this.shipmentService.findByOrderIdActive(orderId);
    if (!shipment) {
      return { success: false, message: 'Không tìm thấy shipment' };
    }

    if (shipment.status !== ShipmentStatus.PENDING) {
      return { success: false, message: 'Trạng thái shipment không hợp lệ' };
    }

    await this.shipmentService.updateShipment(shipment.id, {
      status: ShipmentStatus.PICKING,
    });

    return { success: true, message: 'Bắt đầu lấy hàng' };
  }

  async startPacking(orderId: string): Promise<{ success: boolean; message: string }> {
    const shipment = await this.shipmentService.findByOrderIdActive(orderId);
    if (!shipment) {
      return { success: false, message: 'Không tìm thấy shipment' };
    }

    if (shipment.status !== ShipmentStatus.PICKING) {
      return { success: false, message: 'Trạng thái shipment không hợp lệ' };
    }

    await this.shipmentService.updateShipment(shipment.id, {
      status: ShipmentStatus.PACKING,
    });

    return { success: true, message: 'Bắt đầu đóng gói' };
  }

  async markReadyForPickup(orderId: string): Promise<{ success: boolean; message: string }> {
    const shipment = await this.shipmentService.findByOrderIdActive(orderId);
    if (!shipment) {
      return { success: false, message: 'Không tìm thấy shipment' };
    }

    if (shipment.status !== ShipmentStatus.PACKING) {
      return { success: false, message: 'Trạng thái shipment không hợp lệ' };
    }

    await this.shipmentService.updateShipment(shipment.id, {
      status: ShipmentStatus.READY_FOR_PICKUP,
    });

    return { success: true, message: 'Đơn hàng đã sẵn sàng để lấy' };
  }

  async inputTrackingNumber(orderId: string, trackingNumber: string, carrier: string): Promise<{ success: boolean; message: string }> {
    const shipment = await this.shipmentService.findByOrderIdActive(orderId);
    if (!shipment) {
      return { success: false, message: 'Không tìm thấy shipment' };
    }

    await this.shipmentService.updateShipment(shipment.id, {
      tracking_number: trackingNumber,
      carrier: carrier,
    });

    return {
      success: true,
      message: 'Cập nhật tracking thành công',
    };
  }

  async handoverToCarrier(orderId: string, trackingNumber?: string, carrier?: string): Promise<{ success: boolean; message: string }> {
    const shipment = await this.shipmentService.findByOrderIdActive(orderId);
    if (!shipment) {
      return { success: false, message: 'Không tìm thấy shipment' };
    }

    if (![ShipmentStatus.READY_FOR_PICKUP, ShipmentStatus.PENDING].includes(shipment.status)) {
      return { success: false, message: 'Trạng thái shipment không hợp lệ để bàn giao' };
    }

    const updateData: any = {
      status: ShipmentStatus.PICKED_UP,
      shipped_at: new Date(),
    };

    if (trackingNumber) updateData.tracking_number = trackingNumber;
    if (carrier) updateData.carrier = carrier;

    await this.shipmentService.updateShipment(shipment.id, updateData);

    await this.orderService.update(orderId, {
      status: OrderStatus.AWAITING_COLLECTION,
    } as any);

    return {
      success: true,
      message: 'Đã bàn giao cho hãng vận chuyển',
    };
  }

  async markPickedUp(orderId: string): Promise<{ success: boolean; message: string }> {
    const shipment = await this.shipmentService.findByOrderIdActive(orderId);
    if (!shipment) {
      return { success: false, message: 'Không tìm thấy shipment' };
    }

    await this.shipmentService.updateShipment(shipment.id, {
      status: ShipmentStatus.IN_TRANSIT,
      picked_up_at: new Date(),
    });

    await this.orderService.update(orderId, {
      status: OrderStatus.IN_TRANSIT,
    } as any);

    return { success: true, message: 'Đơn hàng đang trên đường' };
  }

  async updateShipmentStatus(
    orderId: string,
    status: ShipmentStatus,
    additionalData?: {
      tracking_number?: string;
      carrier?: string;
      actual_delivery?: Date;
      tracking_event?: any;
    }
  ): Promise<{ success: boolean; message: string }> {
    const shipment = await this.shipmentService.findByOrderIdActive(orderId);
    if (!shipment) {
      return { success: false, message: 'Không tìm thấy shipment' };
    }

    const updateData: any = {
      status,
    };

    if (additionalData?.tracking_number) {
      updateData.tracking_number = additionalData.tracking_number;
    }
    if (additionalData?.carrier) {
      updateData.carrier = additionalData.carrier;
    }
    if (additionalData?.actual_delivery) {
      updateData.actual_delivery = additionalData.actual_delivery;
    }
    if (additionalData?.tracking_event) {
      await this.shipmentService.updateTrackingHistory(shipment.id, additionalData.tracking_event);
    }

    await this.shipmentService.updateShipment(shipment.id, updateData);

    if (status === ShipmentStatus.DELIVERED) {
      await this.orderService.update(orderId, {
        status: OrderStatus.DELIVERED,
      } as any);
    }

    return { success: true, message: 'Cập nhật trạng thái thành công' };
  }

  async confirmDelivery(orderId: string): Promise<{ success: boolean; message: string }> {
    const shipment = await this.shipmentService.findByOrderIdActive(orderId);
    if (!shipment) {
      return { success: false, message: 'Không tìm thấy shipment' };
    }

    if (shipment.status !== ShipmentStatus.IN_TRANSIT && 
        shipment.status !== ShipmentStatus.OUT_FOR_DELIVERY) {
      return { success: false, message: 'Trạng thái shipment không hợp lệ để xác nhận giao hàng' };
    }

    await this.shipmentService.updateShipment(shipment.id, {
      status: ShipmentStatus.DELIVERED,
      actual_delivery: new Date(),
    });

    await this.orderService.update(orderId, {
      status: OrderStatus.COMPLETED,
    } as any);

    return { success: true, message: 'Xác nhận giao hàng thành công' };
  }

  async getShipmentByOrderId(orderId: string): Promise<Shipment | null> {
    return this.shipmentService.findByOrderIdActive(orderId);
  }

  async getShipmentByTracking(trackingNumber: string): Promise<Shipment | null> {
    return this.shipmentService.findByTrackingNumber(trackingNumber);
  }

  async getAllShipmentsByOrder(orderId: string): Promise<Shipment[]> {
    return this.shipmentService.findByOrderId(orderId);
  }

  async cancelShipment(orderId: string): Promise<{ success: boolean; message: string }> {
    const shipment = await this.shipmentService.findByOrderIdActive(orderId);
    if (!shipment) {
      return { success: false, message: 'Không tìm thấy shipment' };
    }

    if ([ShipmentStatus.DELIVERED, ShipmentStatus.RETURNED].includes(shipment.status)) {
      return { success: false, message: 'Không thể hủy shipment đã giao hoặc trả lại' };
    }

    await this.shipmentService.updateShipment(shipment.id, {
      status: ShipmentStatus.RETURNED,
    } as any);

    await this.orderService.update(orderId, {
      status: OrderStatus.CANCELLED,
    } as any);

    return { success: true, message: 'Hủy shipment thành công' };
  }

  async syncCarrierStatus(trackingNumber: string, carrierStatus: any): Promise<{ success: boolean; message: string }> {
    const shipment = await this.shipmentService.findByTrackingNumber(trackingNumber);
    if (!shipment) {
      return { success: false, message: 'Không tìm thấy shipment' };
    }

    const statusMap: Record<string, ShipmentStatus> = {
      'picked_up': ShipmentStatus.PICKED_UP,
      'in_transit': ShipmentStatus.IN_TRANSIT,
      'out_for_delivery': ShipmentStatus.OUT_FOR_DELIVERY,
      'delivered': ShipmentStatus.DELIVERED,
      'failed': ShipmentStatus.FAILED_DELIVERY,
      'returned': ShipmentStatus.RETURNED,
    };

    const newStatus = statusMap[carrierStatus.status] || shipment.status;

    const updateData: any = {
      status: newStatus,
    };

    if (carrierStatus.tracking_number) {
      updateData.tracking_number = carrierStatus.tracking_number;
    }
    if (carrierStatus.carrier) {
      updateData.carrier = carrierStatus.carrier;
    }
    if (carrierStatus.timestamp) {
      updateData.actual_delivery = new Date(carrierStatus.timestamp);
    }

    await this.shipmentService.updateShipment(shipment.id, updateData);
    await this.shipmentService.updateTrackingHistory(shipment.id, carrierStatus);

    if (newStatus === ShipmentStatus.DELIVERED) {
      await this.orderService.update(shipment.order_id, {
        status: OrderStatus.DELIVERED,
      } as any);
    } else if (newStatus === ShipmentStatus.IN_TRANSIT) {
      await this.orderService.update(shipment.order_id, {
        status: OrderStatus.IN_TRANSIT,
      } as any);
    }

    return { success: true, message: 'Đồng bộ trạng thái thành công' };
  }
}
