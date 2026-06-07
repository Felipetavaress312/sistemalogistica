import { DeliveryOrder } from '../aggregates/DeliveryOrder';
import { Route } from '../aggregates/Route';
import { Fleet } from '../aggregates/Fleet';
import { Deliverer } from '../entities/Deliverer';
import { Vehicle } from '../entities/Vehicle';

/**
 * Interface de Repositório: DeliveryOrder
 * Define o contrato sem expor detalhes de infraestrutura.
 */
export interface IDeliveryOrderRepository {
  save(order: DeliveryOrder): void;
  findById(id: string): DeliveryOrder | undefined;
  findByTrackingCode(trackingCode: string): DeliveryOrder | undefined;
  findAll(): DeliveryOrder[];
  findByDelivererId(delivererId: string): DeliveryOrder[];
  delete(id: string): void;
}

/**
 * Interface de Repositório: Route
 */
export interface IRouteRepository {
  save(route: Route): void;
  findById(id: string): Route | undefined;
  findByDelivererId(delivererId: string): Route[];
  findAll(): Route[];
  delete(id: string): void;
}

/**
 * Interface de Repositório: Fleet
 */
export interface IFleetRepository {
  save(fleet: Fleet): void;
  findById(id: string): Fleet | undefined;
  findAll(): Fleet[];
}

/**
 * Interface de Repositório: Deliverer
 */
export interface IDelivererRepository {
  save(deliverer: Deliverer): void;
  findById(id: string): Deliverer | undefined;
  findAll(): Deliverer[];
  delete(id: string): void;
}

/**
 * Interface de Repositório: Vehicle
 */
export interface IVehicleRepository {
  save(vehicle: Vehicle): void;
  findById(id: string): Vehicle | undefined;
  findAll(): Vehicle[];
  delete(id: string): void;
}
