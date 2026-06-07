/**
 * Value Object: Status de Entrega
 * Representa o estado atual de um pedido dentro do fluxo de entregas.
 * Implementado como uma classe para encapsular as transições válidas de estado.
 */
export enum DeliveryStatusEnum {
  PENDING = 'PENDING',           // Aguardando coleta
  COLLECTED = 'COLLECTED',       // Coletado pelo entregador
  IN_TRANSIT = 'IN_TRANSIT',     // Em rota de entrega
  DELIVERED = 'DELIVERED',       // Entregue com sucesso
  FAILED = 'FAILED',             // Tentativa de entrega falhou
  RETURNED = 'RETURNED',         // Devolvido ao remetente
  CANCELLED = 'CANCELLED',       // Cancelado
}

export class DeliveryStatus {
  private readonly _value: DeliveryStatusEnum;

  private constructor(value: DeliveryStatusEnum) {
    this._value = value;
  }

  public static pending(): DeliveryStatus {
    return new DeliveryStatus(DeliveryStatusEnum.PENDING);
  }

  public static collected(): DeliveryStatus {
    return new DeliveryStatus(DeliveryStatusEnum.COLLECTED);
  }

  public static inTransit(): DeliveryStatus {
    return new DeliveryStatus(DeliveryStatusEnum.IN_TRANSIT);
  }

  public static delivered(): DeliveryStatus {
    return new DeliveryStatus(DeliveryStatusEnum.DELIVERED);
  }

  public static failed(): DeliveryStatus {
    return new DeliveryStatus(DeliveryStatusEnum.FAILED);
  }

  public static returned(): DeliveryStatus {
    return new DeliveryStatus(DeliveryStatusEnum.RETURNED);
  }

  public static cancelled(): DeliveryStatus {
    return new DeliveryStatus(DeliveryStatusEnum.CANCELLED);
  }

  get value(): DeliveryStatusEnum {
    return this._value;
  }

  public isPending(): boolean { return this._value === DeliveryStatusEnum.PENDING; }
  public isCollected(): boolean { return this._value === DeliveryStatusEnum.COLLECTED; }
  public isInTransit(): boolean { return this._value === DeliveryStatusEnum.IN_TRANSIT; }
  public isDelivered(): boolean { return this._value === DeliveryStatusEnum.DELIVERED; }
  public isFailed(): boolean { return this._value === DeliveryStatusEnum.FAILED; }
  public isReturned(): boolean { return this._value === DeliveryStatusEnum.RETURNED; }
  public isCancelled(): boolean { return this._value === DeliveryStatusEnum.CANCELLED; }

  public isTerminal(): boolean {
    return (
      this._value === DeliveryStatusEnum.DELIVERED ||
      this._value === DeliveryStatusEnum.RETURNED ||
      this._value === DeliveryStatusEnum.CANCELLED
    );
  }

  /**
   * Valida se a transição de estado é permitida pelas regras de negócio.
   * PENDING → COLLECTED → IN_TRANSIT → DELIVERED
   *                     ↘ FAILED → RETURNED
   * Qualquer estado não-terminal → CANCELLED
   */
  public canTransitionTo(next: DeliveryStatus): boolean {
    if (this.isTerminal()) return false;

    const transitions: Record<DeliveryStatusEnum, DeliveryStatusEnum[]> = {
      [DeliveryStatusEnum.PENDING]: [
        DeliveryStatusEnum.COLLECTED,
        DeliveryStatusEnum.CANCELLED,
      ],
      [DeliveryStatusEnum.COLLECTED]: [
        DeliveryStatusEnum.IN_TRANSIT,
        DeliveryStatusEnum.CANCELLED,
      ],
      [DeliveryStatusEnum.IN_TRANSIT]: [
        DeliveryStatusEnum.DELIVERED,
        DeliveryStatusEnum.FAILED,
        DeliveryStatusEnum.CANCELLED,
      ],
      [DeliveryStatusEnum.FAILED]: [
        DeliveryStatusEnum.IN_TRANSIT,
        DeliveryStatusEnum.RETURNED,
        DeliveryStatusEnum.CANCELLED,
      ],
      [DeliveryStatusEnum.DELIVERED]: [],
      [DeliveryStatusEnum.RETURNED]: [],
      [DeliveryStatusEnum.CANCELLED]: [],
    };

    return transitions[this._value].includes(next._value);
  }

  public equals(other: DeliveryStatus): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    const labels: Record<DeliveryStatusEnum, string> = {
      [DeliveryStatusEnum.PENDING]: 'Aguardando Coleta',
      [DeliveryStatusEnum.COLLECTED]: 'Coletado',
      [DeliveryStatusEnum.IN_TRANSIT]: 'Em Trânsito',
      [DeliveryStatusEnum.DELIVERED]: 'Entregue',
      [DeliveryStatusEnum.FAILED]: 'Falha na Entrega',
      [DeliveryStatusEnum.RETURNED]: 'Devolvido',
      [DeliveryStatusEnum.CANCELLED]: 'Cancelado',
    };
    return labels[this._value];
  }
}
