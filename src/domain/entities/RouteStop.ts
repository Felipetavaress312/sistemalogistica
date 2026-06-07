import { uuidv4 } from '../../shared/uuid';
import { Address } from '../valueobjects/Address';

export enum StopType {
  PICKUP = 'PICKUP',   // Coleta
  DELIVERY = 'DELIVERY', // Entrega
}

/**
 * Entidade: Parada de Rota
 * Representa um ponto de parada dentro de uma rota de entrega.
 * Pertence ao Agregado de Rota.
 */
export class RouteStop {
  private readonly _id: string;
  private readonly _orderId: string;
  private readonly _address: Address;
  private readonly _type: StopType;
  private _sequenceOrder: number;
  private _completedAt: Date | null;
  private _notes: string;

  private constructor(
    id: string,
    orderId: string,
    address: Address,
    type: StopType,
    sequenceOrder: number,
    notes: string
  ) {
    this._id = id;
    this._orderId = orderId;
    this._address = address;
    this._type = type;
    this._sequenceOrder = sequenceOrder;
    this._completedAt = null;
    this._notes = notes;
  }

  public static create(
    orderId: string,
    address: Address,
    type: StopType,
    sequenceOrder: number,
    notes: string = ''
  ): RouteStop {
    if (sequenceOrder < 0) {
      throw new Error('Ordem de sequência não pode ser negativa.');
    }
    return new RouteStop(uuidv4(), orderId, address, type, sequenceOrder, notes);
  }

  get id(): string { return this._id; }
  get orderId(): string { return this._orderId; }
  get address(): Address { return this._address; }
  get type(): StopType { return this._type; }
  get sequenceOrder(): number { return this._sequenceOrder; }
  get completedAt(): Date | null { return this._completedAt; }
  get notes(): string { return this._notes; }

  public isCompleted(): boolean {
    return this._completedAt !== null;
  }

  public complete(): void {
    if (this.isCompleted()) {
      throw new Error('Parada já foi concluída.');
    }
    this._completedAt = new Date();
  }

  public reorder(newSequence: number): void {
    if (newSequence < 0) throw new Error('Ordem de sequência não pode ser negativa.');
    this._sequenceOrder = newSequence;
  }

  public updateNotes(notes: string): void {
    this._notes = notes;
  }
}
