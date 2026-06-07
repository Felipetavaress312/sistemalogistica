import { uuidv4 } from '../../shared/uuid';
import { Coordinate } from '../valueobjects/Coordinate';

export enum DelivererStatus {
  AVAILABLE = 'AVAILABLE',
  ON_DELIVERY = 'ON_DELIVERY',
  OFFLINE = 'OFFLINE',
}

/**
 * Entidade: Entregador
 * Possui identidade própria (id). Representa um membro da frota de entregas.
 */
export class Deliverer {
  private readonly _id: string;
  private _name: string;
  private _cpf: string;
  private _phone: string;
  private _status: DelivererStatus;
  private _currentLocation: Coordinate | null;
  private _activeDeliveryIds: string[];

  private constructor(
    id: string,
    name: string,
    cpf: string,
    phone: string
  ) {
    this._id = id;
    this._name = name;
    this._cpf = cpf;
    this._phone = phone;
    this._status = DelivererStatus.OFFLINE;
    this._currentLocation = null;
    this._activeDeliveryIds = [];
  }

  public static create(name: string, cpf: string, phone: string): Deliverer {
    Deliverer.validateName(name);
    Deliverer.validateCpf(cpf);
    Deliverer.validatePhone(phone);
    return new Deliverer(uuidv4(), name.trim(), cpf, phone);
  }

  public static reconstitute(
    id: string,
    name: string,
    cpf: string,
    phone: string,
    status: DelivererStatus,
    currentLocation: Coordinate | null,
    activeDeliveryIds: string[]
  ): Deliverer {
    const deliverer = new Deliverer(id, name, cpf, phone);
    deliverer._status = status;
    deliverer._currentLocation = currentLocation;
    deliverer._activeDeliveryIds = [...activeDeliveryIds];
    return deliverer;
  }

  private static validateName(name: string): void {
    if (!name || name.trim().length < 3) {
      throw new Error('Nome do entregador deve ter pelo menos 3 caracteres.');
    }
  }

  private static validateCpf(cpf: string): void {
    const clean = cpf.replace(/\D/g, '');
    if (clean.length !== 11) {
      throw new Error('CPF inválido: deve conter 11 dígitos.');
    }
  }

  private static validatePhone(phone: string): void {
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10 || clean.length > 11) {
      throw new Error('Telefone inválido: deve conter 10 ou 11 dígitos.');
    }
  }

  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get cpf(): string { return this._cpf; }
  get phone(): string { return this._phone; }
  get status(): DelivererStatus { return this._status; }
  get currentLocation(): Coordinate | null { return this._currentLocation; }
  get activeDeliveryIds(): ReadonlyArray<string> { return [...this._activeDeliveryIds]; }

  public goOnline(): void {
    if (this._status === DelivererStatus.ON_DELIVERY) {
      throw new Error('Entregador está em entrega ativa e não pode ser colocado offline diretamente.');
    }
    this._status = DelivererStatus.AVAILABLE;
  }

  public goOffline(): void {
    if (this._status === DelivererStatus.ON_DELIVERY) {
      throw new Error('Entregador está em entrega ativa e não pode ficar offline.');
    }
    this._status = DelivererStatus.OFFLINE;
  }

  public isAvailable(): boolean {
    return this._status === DelivererStatus.AVAILABLE;
  }

  public assignDelivery(deliveryId: string): void {
    if (!this.isAvailable()) {
      throw new Error(`Entregador ${this._name} não está disponível para novas entregas.`);
    }
    this._activeDeliveryIds.push(deliveryId);
    this._status = DelivererStatus.ON_DELIVERY;
  }

  public completeDelivery(deliveryId: string): void {
    const index = this._activeDeliveryIds.indexOf(deliveryId);
    if (index === -1) {
      throw new Error(`Entrega ${deliveryId} não está atribuída ao entregador ${this._name}.`);
    }
    this._activeDeliveryIds.splice(index, 1);
    if (this._activeDeliveryIds.length === 0) {
      this._status = DelivererStatus.AVAILABLE;
    }
  }

  public updateLocation(coordinate: Coordinate): void {
    this._currentLocation = coordinate;
  }

  public updatePhone(phone: string): void {
    Deliverer.validatePhone(phone);
    this._phone = phone;
  }
}
