import { DeliveryOrder } from '../../domain/aggregates/DeliveryOrder';
import { Route } from '../../domain/aggregates/Route';
import { Fleet } from '../../domain/aggregates/Fleet';
import { Deliverer } from '../../domain/entities/Deliverer';
import { Vehicle } from '../../domain/entities/Vehicle';
import {
  IDeliveryOrderRepository,
  IRouteRepository,
  IFleetRepository,
  IDelivererRepository,
  IVehicleRepository,
} from '../../domain/repositories/IRepositories';

/**
 * Repositório em memória para DeliveryOrder.
 * Implementa a interface do domínio sem vazar detalhes de infraestrutura.
 */
export class InMemoryDeliveryOrderRepository implements IDeliveryOrderRepository {
  private store = new Map<string, DeliveryOrder>();

  save(order: DeliveryOrder): void {
    this.store.set(order.id, order);
  }

  findById(id: string): DeliveryOrder | undefined {
    return this.store.get(id);
  }

  findByTrackingCode(trackingCode: string): DeliveryOrder | undefined {
    return Array.from(this.store.values()).find(o => o.trackingCode === trackingCode);
  }

  findAll(): DeliveryOrder[] {
    return Array.from(this.store.values());
  }

  findByDelivererId(delivererId: string): DeliveryOrder[] {
    return Array.from(this.store.values()).filter(o => o.assignedDelivererId === delivererId);
  }

  delete(id: string): void {
    this.store.delete(id);
  }

  clear(): void {
    this.store.clear();
  }
}

/**
 * Repositório em memória para Route.
 */
export class InMemoryRouteRepository implements IRouteRepository {
  private store = new Map<string, Route>();

  save(route: Route): void {
    this.store.set(route.id, route);
  }

  findById(id: string): Route | undefined {
    return this.store.get(id);
  }

  findByDelivererId(delivererId: string): Route[] {
    return Array.from(this.store.values()).filter(r => r.delivererId === delivererId);
  }

  findAll(): Route[] {
    return Array.from(this.store.values());
  }

  delete(id: string): void {
    this.store.delete(id);
  }

  clear(): void {
    this.store.clear();
  }
}

/**
 * Repositório em memória para Fleet.
 */
export class InMemoryFleetRepository implements IFleetRepository {
  private store = new Map<string, Fleet>();

  save(fleet: Fleet): void {
    this.store.set(fleet.id, fleet);
  }

  findById(id: string): Fleet | undefined {
    return this.store.get(id);
  }

  findAll(): Fleet[] {
    return Array.from(this.store.values());
  }

  clear(): void {
    this.store.clear();
  }
}

/**
 * Repositório em memória para Deliverer.
 */
export class InMemoryDelivererRepository implements IDelivererRepository {
  private store = new Map<string, Deliverer>();

  save(deliverer: Deliverer): void {
    this.store.set(deliverer.id, deliverer);
  }

  findById(id: string): Deliverer | undefined {
    return this.store.get(id);
  }

  findAll(): Deliverer[] {
    return Array.from(this.store.values());
  }

  delete(id: string): void {
    this.store.delete(id);
  }

  clear(): void {
    this.store.clear();
  }
}

/**
 * Repositório em memória para Vehicle.
 */
export class InMemoryVehicleRepository implements IVehicleRepository {
  private store = new Map<string, Vehicle>();

  save(vehicle: Vehicle): void {
    this.store.set(vehicle.id, vehicle);
  }

  findById(id: string): Vehicle | undefined {
    return this.store.get(id);
  }

  findAll(): Vehicle[] {
    return Array.from(this.store.values());
  }

  delete(id: string): void {
    this.store.delete(id);
  }

  clear(): void {
    this.store.clear();
  }
}
