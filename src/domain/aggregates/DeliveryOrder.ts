import { uuidv4 } from '../../shared/uuid';
import { Address } from '../valueobjects/Address';
import { DeliveryStatus } from '../valueobjects/DeliveryStatus';
import { PackageDimensions } from '../valueobjects/VehicleCapacity';

/**
 * Aggregate Root: Pedido de Entrega
 * É o ponto central de consistência para o fluxo de um pedido.
 * Toda alteração de estado do pedido deve ser feita por aqui.
 */
export class DeliveryOrder {
  private readonly _id: string;
  private readonly _trackingCode: string;
  private readonly _senderName: string;
  private readonly _senderPhone: string;
  private readonly _recipientName: string;
  private readonly _recipientPhone: string;
  private readonly _pickupAddress: Address;
  private readonly _deliveryAddress: Address;
  private readonly _packageDimensions: PackageDimensions;
  private _status: DeliveryStatus;
  private _assignedDelivererId: string | null;
  private _assignedRouteId: string | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _deliveredAt: Date | null;
  private _failureReason: string | null;
  private readonly _notes: string;

  private constructor(
    id: string,
    trackingCode: string,
    senderName: string,
    senderPhone: string,
    recipientName: string,
    recipientPhone: string,
    pickupAddress: Address,
    deliveryAddress: Address,
    packageDimensions: PackageDimensions,
    notes: string
  ) {
    this._id = id;
    this._trackingCode = trackingCode;
    this._senderName = senderName;
    this._senderPhone = senderPhone;
    this._recipientName = recipientName;
    this._recipientPhone = recipientPhone;
    this._pickupAddress = pickupAddress;
    this._deliveryAddress = deliveryAddress;
    this._packageDimensions = packageDimensions;
    this._status = DeliveryStatus.pending();
    this._assignedDelivererId = null;
    this._assignedRouteId = null;
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this._deliveredAt = null;
    this._failureReason = null;
    this._notes = notes;
  }

  public static create(
    senderName: string,
    senderPhone: string,
    recipientName: string,
    recipientPhone: string,
    pickupAddress: Address,
    deliveryAddress: Address,
    packageDimensions: PackageDimensions,
    notes: string = ''
  ): DeliveryOrder {
    DeliveryOrder.validateParticipant('Remetente', senderName, senderPhone);
    DeliveryOrder.validateParticipant('Destinatário', recipientName, recipientPhone);

    if (pickupAddress.equals(deliveryAddress)) {
      throw new Error('Endereço de coleta e entrega não podem ser iguais.');
    }

    const trackingCode = DeliveryOrder.generateTrackingCode();
    return new DeliveryOrder(
      uuidv4(),
      trackingCode,
      senderName.trim(),
      senderPhone,
      recipientName.trim(),
      recipientPhone,
      pickupAddress,
      deliveryAddress,
      packageDimensions,
      notes
    );
  }

  private static validateParticipant(role: string, name: string, phone: string): void {
    if (!name || name.trim().length < 3) {
      throw new Error(`${role}: nome deve ter pelo menos 3 caracteres.`);
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      throw new Error(`${role}: telefone inválido.`);
    }
  }

  private static generateTrackingCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const prefix = Array.from({ length: 2 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const numbers = Math.floor(Math.random() * 1_000_000_000).toString().padStart(9, '0');
    return `${prefix}${numbers}BR`;
  }

  // Getters
  get id(): string { return this._id; }
  get trackingCode(): string { return this._trackingCode; }
  get senderName(): string { return this._senderName; }
  get senderPhone(): string { return this._senderPhone; }
  get recipientName(): string { return this._recipientName; }
  get recipientPhone(): string { return this._recipientPhone; }
  get pickupAddress(): Address { return this._pickupAddress; }
  get deliveryAddress(): Address { return this._deliveryAddress; }
  get packageDimensions(): PackageDimensions { return this._packageDimensions; }
  get status(): DeliveryStatus { return this._status; }
  get assignedDelivererId(): string | null { return this._assignedDelivererId; }
  get assignedRouteId(): string | null { return this._assignedRouteId; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get deliveredAt(): Date | null { return this._deliveredAt; }
  get failureReason(): string | null { return this._failureReason; }
  get notes(): string { return this._notes; }

  // ===== Regras de Negócio (Rich Domain Model) =====

  public collect(delivererId: string): void {
    const nextStatus = DeliveryStatus.collected();
    this.ensureValidTransition(nextStatus);
    this._assignedDelivererId = delivererId;
    this._status = nextStatus;
    this._updatedAt = new Date();
  }

  public startTransit(routeId: string): void {
    const nextStatus = DeliveryStatus.inTransit();
    this.ensureValidTransition(nextStatus);
    this._assignedRouteId = routeId;
    this._status = nextStatus;
    this._updatedAt = new Date();
  }

  public confirmDelivery(): void {
    const nextStatus = DeliveryStatus.delivered();
    this.ensureValidTransition(nextStatus);
    this._status = nextStatus;
    this._deliveredAt = new Date();
    this._updatedAt = new Date();
  }

  public registerFailure(reason: string): void {
    if (!reason || reason.trim().length === 0) {
      throw new Error('Motivo da falha não pode ser vazio.');
    }
    const nextStatus = DeliveryStatus.failed();
    this.ensureValidTransition(nextStatus);
    this._failureReason = reason.trim();
    this._status = nextStatus;
    this._updatedAt = new Date();
  }

  public returnToSender(): void {
    const nextStatus = DeliveryStatus.returned();
    this.ensureValidTransition(nextStatus);
    this._status = nextStatus;
    this._updatedAt = new Date();
  }

  public cancel(): void {
    const nextStatus = DeliveryStatus.cancelled();
    this.ensureValidTransition(nextStatus);
    this._status = nextStatus;
    this._updatedAt = new Date();
  }

  public retry(): void {
    if (!this._status.isFailed()) {
      throw new Error('Só é possível tentar nova entrega quando o status é FALHA.');
    }
    this._status = DeliveryStatus.inTransit();
    this._failureReason = null;
    this._updatedAt = new Date();
  }

  private ensureValidTransition(nextStatus: DeliveryStatus): void {
    if (!this._status.canTransitionTo(nextStatus)) {
      throw new Error(
        `Transição de status inválida: ${this._status.toString()} → ${nextStatus.toString()}.`
      );
    }
  }

  public isAssigned(): boolean {
    return this._assignedDelivererId !== null;
  }
}
