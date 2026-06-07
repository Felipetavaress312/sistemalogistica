import { IDeliveryOrderRepository } from '../../domain/repositories/IRepositories';

export interface AssignDeliveryInput {
  orderId: string;
  delivererId: string;
}

export class AssignDeliveryToDelivererUseCase {
  constructor(private readonly orderRepository: IDeliveryOrderRepository) {}

  execute(input: AssignDeliveryInput): void {
    const order = this.orderRepository.findById(input.orderId);
    if (!order) throw new Error(`Pedido ${input.orderId} não encontrado.`);

    order.collect(input.delivererId);
    this.orderRepository.save(order);
  }
}

// ─────────────────────────────────────────────

export interface UpdateDeliveryStatusInput {
  orderId: string;
  action: 'START_TRANSIT' | 'CONFIRM_DELIVERY' | 'REGISTER_FAILURE' | 'RETURN' | 'CANCEL' | 'RETRY';
  routeId?: string;
  failureReason?: string;
}

export class UpdateDeliveryStatusUseCase {
  constructor(private readonly orderRepository: IDeliveryOrderRepository) {}

  execute(input: UpdateDeliveryStatusInput): { newStatus: string } {
    const order = this.orderRepository.findById(input.orderId);
    if (!order) throw new Error(`Pedido ${input.orderId} não encontrado.`);

    switch (input.action) {
      case 'START_TRANSIT':
        if (!input.routeId) throw new Error('routeId é obrigatório para START_TRANSIT.');
        order.startTransit(input.routeId);
        break;
      case 'CONFIRM_DELIVERY':
        order.confirmDelivery();
        break;
      case 'REGISTER_FAILURE':
        if (!input.failureReason) throw new Error('failureReason é obrigatório para REGISTER_FAILURE.');
        order.registerFailure(input.failureReason);
        break;
      case 'RETURN':
        order.returnToSender();
        break;
      case 'CANCEL':
        order.cancel();
        break;
      case 'RETRY':
        order.retry();
        break;
      default:
        throw new Error(`Ação desconhecida: ${input.action}`);
    }

    this.orderRepository.save(order);
    return { newStatus: order.status.toString() };
  }
}

// ─────────────────────────────────────────────

export interface TrackOrderInput {
  trackingCode: string;
}

export interface TrackOrderOutput {
  trackingCode: string;
  status: string;
  recipientName: string;
  deliveryAddress: string;
  assignedDelivererId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deliveredAt: Date | null;
  failureReason: string | null;
}

export class TrackDeliveryOrderUseCase {
  constructor(private readonly orderRepository: IDeliveryOrderRepository) {}

  execute(input: TrackOrderInput): TrackOrderOutput {
    const order = this.orderRepository.findByTrackingCode(input.trackingCode);
    if (!order) throw new Error(`Pedido com código ${input.trackingCode} não encontrado.`);

    return {
      trackingCode: order.trackingCode,
      status: order.status.toString(),
      recipientName: order.recipientName,
      deliveryAddress: order.deliveryAddress.toString(),
      assignedDelivererId: order.assignedDelivererId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      deliveredAt: order.deliveredAt,
      failureReason: order.failureReason,
    };
  }
}
