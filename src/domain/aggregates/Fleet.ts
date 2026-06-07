import { uuidv4 } from '../../shared/uuid';
import { Deliverer } from '../entities/Deliverer';
import { Vehicle } from '../entities/Vehicle';

/**
 * Aggregate Root: Frota
 * Gerencia a consistência entre entregadores e veículos.
 * Garante que um veículo não seja atribuído a dois entregadores simultaneamente.
 */
export class Fleet {
  private readonly _id: string;
  private readonly _companyName: string;
  private _deliverers: Map<string, Deliverer>;
  private _vehicles: Map<string, Vehicle>;

  private constructor(id: string, companyName: string) {
    this._id = id;
    this._companyName = companyName;
    this._deliverers = new Map();
    this._vehicles = new Map();
  }

  public static create(companyName: string): Fleet {
    if (!companyName || companyName.trim().length < 2) {
      throw new Error('Nome da empresa deve ter pelo menos 2 caracteres.');
    }
    return new Fleet(uuidv4(), companyName.trim());
  }

  get id(): string { return this._id; }
  get companyName(): string { return this._companyName; }

  public registerDeliverer(deliverer: Deliverer): void {
    if (this._deliverers.has(deliverer.id)) {
      throw new Error(`Entregador ${deliverer.id} já está registrado na frota.`);
    }
    this._deliverers.set(deliverer.id, deliverer);
  }

  public registerVehicle(vehicle: Vehicle): void {
    if (this._vehicles.has(vehicle.id)) {
      throw new Error(`Veículo ${vehicle.id} já está registrado na frota.`);
    }
    this._vehicles.set(vehicle.id, vehicle);
  }

  public assignVehicleToDeliverer(vehicleId: string, delivererId: string): void {
    const vehicle = this.getVehicleOrThrow(vehicleId);
    const deliverer = this.getDelivererOrThrow(delivererId);

    if (!vehicle.isAvailable()) {
      throw new Error(`Veículo ${vehicle.licensePlate} não está disponível.`);
    }
    if (!deliverer.isAvailable()) {
      throw new Error(`Entregador ${deliverer.name} não está disponível.`);
    }

    vehicle.assignToDeliverer(delivererId);
  }

  public unassignVehicle(vehicleId: string): void {
    const vehicle = this.getVehicleOrThrow(vehicleId);
    vehicle.unassign();
  }

  public getAvailableDeliverers(): Deliverer[] {
    return Array.from(this._deliverers.values()).filter(d => d.isAvailable());
  }

  public getAvailableVehicles(): Vehicle[] {
    return Array.from(this._vehicles.values()).filter(v => v.isAvailable());
  }

  public getDeliverer(delivererId: string): Deliverer | undefined {
    return this._deliverers.get(delivererId);
  }

  public getVehicle(vehicleId: string): Vehicle | undefined {
    return this._vehicles.get(vehicleId);
  }

  public getAllDeliverers(): Deliverer[] {
    return Array.from(this._deliverers.values());
  }

  public getAllVehicles(): Vehicle[] {
    return Array.from(this._vehicles.values());
  }

  public getTotalDeliverers(): number {
    return this._deliverers.size;
  }

  public getTotalVehicles(): number {
    return this._vehicles.size;
  }

  private getVehicleOrThrow(vehicleId: string): Vehicle {
    const vehicle = this._vehicles.get(vehicleId);
    if (!vehicle) throw new Error(`Veículo ${vehicleId} não encontrado na frota.`);
    return vehicle;
  }

  private getDelivererOrThrow(delivererId: string): Deliverer {
    const deliverer = this._deliverers.get(delivererId);
    if (!deliverer) throw new Error(`Entregador ${delivererId} não encontrado na frota.`);
    return deliverer;
  }
}
