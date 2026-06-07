import { DeliveryOrder } from '../../domain/aggregates/DeliveryOrder';
import { IDeliveryOrderRepository } from '../../domain/repositories/IRepositories';
import { Address } from '../../domain/valueobjects/Address';
import { Coordinate } from '../../domain/valueobjects/Coordinate';
import { PackageDimensions } from '../../domain/valueobjects/VehicleCapacity';

export interface CreateDeliveryOrderInput {
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  pickup: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  };
  delivery: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  };
  package: {
    weightKg: number;
    widthCm: number;
    heightCm: number;
    depthCm: number;
  };
  notes?: string;
}

export interface CreateDeliveryOrderOutput {
  orderId: string;
  trackingCode: string;
  status: string;
  estimatedDistanceKm: number;
}

export class CreateDeliveryOrderUseCase {
  constructor(private readonly orderRepository: IDeliveryOrderRepository) {}

  execute(input: CreateDeliveryOrderInput): CreateDeliveryOrderOutput {
    const pickupCoord = Coordinate.create(input.pickup.latitude, input.pickup.longitude);
    const deliveryCoord = Coordinate.create(input.delivery.latitude, input.delivery.longitude);

    const pickupAddress = Address.create(
      input.pickup.street,
      input.pickup.number,
      input.pickup.neighborhood,
      input.pickup.city,
      input.pickup.state,
      input.pickup.zipCode,
      pickupCoord
    );

    const deliveryAddress = Address.create(
      input.delivery.street,
      input.delivery.number,
      input.delivery.neighborhood,
      input.delivery.city,
      input.delivery.state,
      input.delivery.zipCode,
      deliveryCoord
    );

    const dimensions = PackageDimensions.create(
      input.package.weightKg,
      input.package.widthCm,
      input.package.heightCm,
      input.package.depthCm
    );

    const order = DeliveryOrder.create(
      input.senderName,
      input.senderPhone,
      input.recipientName,
      input.recipientPhone,
      pickupAddress,
      deliveryAddress,
      dimensions,
      input.notes ?? ''
    );

    const estimatedDistance = pickupCoord.distanceTo(deliveryCoord);
    this.orderRepository.save(order);

    return {
      orderId: order.id,
      trackingCode: order.trackingCode,
      status: order.status.toString(),
      estimatedDistanceKm: parseFloat(estimatedDistance.kilometers.toFixed(2)),
    };
  }
}
