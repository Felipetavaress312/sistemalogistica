import { Fleet } from '../../domain/aggregates/Fleet';
import { Route } from '../../domain/aggregates/Route';
import { Deliverer } from '../../domain/entities/Deliverer';
import { Vehicle, VehicleType } from '../../domain/entities/Vehicle';
import { RouteStop, StopType } from '../../domain/entities/RouteStop';
import {
  IFleetRepository,
  IDeliveryOrderRepository,
  IRouteRepository,
} from '../../domain/repositories/IRepositories';
import { VehicleCapacity } from '../../domain/valueobjects/VehicleCapacity';

// ─── Fleet Use Cases ───────────────────────────────────────────────────────

export interface RegisterDelivererInput {
  fleetId: string;
  name: string;
  cpf: string;
  phone: string;
}

export class RegisterDelivererUseCase {
  constructor(private readonly fleetRepository: IFleetRepository) {}

  execute(input: RegisterDelivererInput): { delivererId: string } {
    const fleet = this.fleetRepository.findById(input.fleetId);
    if (!fleet) throw new Error(`Frota ${input.fleetId} não encontrada.`);

    const deliverer = Deliverer.create(input.name, input.cpf, input.phone);
    fleet.registerDeliverer(deliverer);
    this.fleetRepository.save(fleet);

    return { delivererId: deliverer.id };
  }
}

export interface RegisterVehicleInput {
  fleetId: string;
  licensePlate: string;
  type: VehicleType;
  model: string;
  year: number;
  maxWeightKg: number;
  maxVolumeM3: number;
}

export class RegisterVehicleUseCase {
  constructor(private readonly fleetRepository: IFleetRepository) {}

  execute(input: RegisterVehicleInput): { vehicleId: string } {
    const fleet = this.fleetRepository.findById(input.fleetId);
    if (!fleet) throw new Error(`Frota ${input.fleetId} não encontrada.`);

    const capacity = VehicleCapacity.create(input.maxWeightKg, input.maxVolumeM3);
    const vehicle = Vehicle.create(input.licensePlate, input.type, capacity, input.model, input.year);
    fleet.registerVehicle(vehicle);
    this.fleetRepository.save(fleet);

    return { vehicleId: vehicle.id };
  }
}

// ─── Route Use Cases ───────────────────────────────────────────────────────

export interface CreateRouteInput {
  delivererId: string;
  vehicleId: string;
  orderIds: string[];
}

export interface CreateRouteOutput {
  routeId: string;
  stopsCount: number;
  estimatedDistanceKm: number;
}

export class CreateRouteUseCase {
  constructor(
    private readonly routeRepository: IRouteRepository,
    private readonly orderRepository: IDeliveryOrderRepository
  ) {}

  execute(input: CreateRouteInput): CreateRouteOutput {
    if (input.orderIds.length === 0) {
      throw new Error('A rota precisa ter pelo menos um pedido.');
    }

    // Busca e valida todos os pedidos
    const orders = input.orderIds.map(id => {
      const order = this.orderRepository.findById(id);
      if (!order) throw new Error(`Pedido ${id} não encontrado.`);
      if (!order.status.isPending() && !order.status.isCollected()) {
        throw new Error(`Pedido ${id} não está disponível para roteamento (status: ${order.status.toString()}).`);
      }
      return order;
    });

    // Calcula distância estimada usando as coordenadas dos endereços
    let totalDistanceKm = 0;
    for (let i = 0; i < orders.length - 1; i++) {
      const from = orders[i].deliveryAddress.coordinate;
      const to = orders[i + 1].pickupAddress.coordinate;
      totalDistanceKm += from.distanceTo(to).kilometers;
    }

    const route = Route.create(input.delivererId, input.vehicleId, totalDistanceKm);

    // Adiciona paradas de coleta e entrega para cada pedido
    orders.forEach((order, index) => {
      const pickupStop = RouteStop.create(
        order.id,
        order.pickupAddress,
        StopType.PICKUP,
        index * 2
      );
      const deliveryStop = RouteStop.create(
        order.id,
        order.deliveryAddress,
        StopType.DELIVERY,
        index * 2 + 1
      );
      route.addStop(pickupStop);
      route.addStop(deliveryStop);
    });

    this.routeRepository.save(route);
    return {
      routeId: route.id,
      stopsCount: route.getTotalStopsCount(),
      estimatedDistanceKm: parseFloat(totalDistanceKm.toFixed(2)),
    };
  }
}

export interface StartRouteInput {
  routeId: string;
}

export class StartRouteUseCase {
  constructor(private readonly routeRepository: IRouteRepository) {}

  execute(input: StartRouteInput): void {
    const route = this.routeRepository.findById(input.routeId);
    if (!route) throw new Error(`Rota ${input.routeId} não encontrada.`);
    route.start();
    this.routeRepository.save(route);
  }
}
