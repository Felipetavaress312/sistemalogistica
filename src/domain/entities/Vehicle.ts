import { uuidv4 } from '../../shared/uuid';
import { VehicleCapacity } from '../valueobjects/VehicleCapacity';

export enum VehicleType {
  BICYCLE = 'BICYCLE',
  MOTORCYCLE = 'MOTORCYCLE',
  CAR = 'CAR',
  VAN = 'VAN',
  TRUCK = 'TRUCK',
}

export enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
}

/**
 * Entidade: Veículo
 * Pertence à frota e possui identidade própria. Pode ser atribuído a um entregador.
 */
export class Vehicle {
  private readonly _id: string;
  private readonly _licensePlate: string;
  private readonly _type: VehicleType;
  private readonly _capacity: VehicleCapacity;
  private _status: VehicleStatus;
  private _assignedDelivererId: string | null;
  private _model: string;
  private _year: number;

  private constructor(
    id: string,
    licensePlate: string,
    type: VehicleType,
    capacity: VehicleCapacity,
    model: string,
    year: number
  ) {
    this._id = id;
    this._licensePlate = licensePlate;
    this._type = type;
    this._capacity = capacity;
    this._model = model;
    this._year = year;
    this._status = VehicleStatus.ACTIVE;
    this._assignedDelivererId = null;
  }

  public static create(
    licensePlate: string,
    type: VehicleType,
    capacity: VehicleCapacity,
    model: string,
    year: number
  ): Vehicle {
    Vehicle.validateLicensePlate(licensePlate);
    Vehicle.validateYear(year);
    return new Vehicle(uuidv4(), licensePlate.toUpperCase(), type, capacity, model, year);
  }

  public static reconstitute(
    id: string,
    licensePlate: string,
    type: VehicleType,
    capacity: VehicleCapacity,
    model: string,
    year: number,
    status: VehicleStatus,
    assignedDelivererId: string | null
  ): Vehicle {
    const vehicle = new Vehicle(id, licensePlate, type, capacity, model, year);
    vehicle._status = status;
    vehicle._assignedDelivererId = assignedDelivererId;
    return vehicle;
  }

  private static validateLicensePlate(plate: string): void {
    // Aceita placas no formato antigo (AAA-9999) ou Mercosul (AAA9A99)
    const oldFormat = /^[A-Z]{3}-?\d{4}$/;
    const mercosulFormat = /^[A-Z]{3}\d[A-Z]\d{2}$/;
    const clean = plate.toUpperCase().replace('-', '');
    if (!oldFormat.test(plate.toUpperCase()) && !mercosulFormat.test(clean)) {
      throw new Error(`Placa inválida: ${plate}.`);
    }
  }

  private static validateYear(year: number): void {
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear + 1) {
      throw new Error(`Ano inválido: ${year}.`);
    }
  }

  get id(): string { return this._id; }
  get licensePlate(): string { return this._licensePlate; }
  get type(): VehicleType { return this._type; }
  get capacity(): VehicleCapacity { return this._capacity; }
  get status(): VehicleStatus { return this._status; }
  get assignedDelivererId(): string | null { return this._assignedDelivererId; }
  get model(): string { return this._model; }
  get year(): number { return this._year; }

  public isActive(): boolean {
    return this._status === VehicleStatus.ACTIVE;
  }

  public isAvailable(): boolean {
    return this._status === VehicleStatus.ACTIVE && this._assignedDelivererId === null;
  }

  public assignToDeliverer(delivererId: string): void {
    if (!this.isAvailable()) {
      throw new Error(`Veículo ${this._licensePlate} não está disponível para atribuição.`);
    }
    this._assignedDelivererId = delivererId;
  }

  public unassign(): void {
    this._assignedDelivererId = null;
  }

  public sendToMaintenance(): void {
    if (this._assignedDelivererId !== null) {
      throw new Error('Não é possível enviar veículo para manutenção enquanto estiver atribuído a um entregador.');
    }
    this._status = VehicleStatus.MAINTENANCE;
  }

  public returnFromMaintenance(): void {
    if (this._status !== VehicleStatus.MAINTENANCE) {
      throw new Error('Veículo não está em manutenção.');
    }
    this._status = VehicleStatus.ACTIVE;
  }

  public deactivate(): void {
    if (this._assignedDelivererId !== null) {
      throw new Error('Não é possível inativar um veículo atribuído a um entregador.');
    }
    this._status = VehicleStatus.INACTIVE;
  }
}
