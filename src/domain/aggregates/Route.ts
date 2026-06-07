import { uuidv4 } from '../../shared/uuid';
import { RouteStop, StopType } from '../entities/RouteStop';
import { Distance } from '../valueobjects/Coordinate';

export enum RouteStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Aggregate Root: Rota
 * Garante a consistência do conjunto de paradas de entrega/coleta.
 * Controla a otimização da sequência e o progresso da rota.
 */
export class Route {
  private readonly _id: string;
  private readonly _delivererId: string;
  private readonly _vehicleId: string;
  private _status: RouteStatus;
  private _stops: RouteStop[];
  private readonly _createdAt: Date;
  private _startedAt: Date | null;
  private _completedAt: Date | null;
  private _estimatedDistanceKm: number;

  private constructor(
    id: string,
    delivererId: string,
    vehicleId: string,
    estimatedDistanceKm: number
  ) {
    this._id = id;
    this._delivererId = delivererId;
    this._vehicleId = vehicleId;
    this._status = RouteStatus.PLANNED;
    this._stops = [];
    this._createdAt = new Date();
    this._startedAt = null;
    this._completedAt = null;
    this._estimatedDistanceKm = estimatedDistanceKm;
  }

  public static create(
    delivererId: string,
    vehicleId: string,
    estimatedDistanceKm: number = 0
  ): Route {
    if (!delivererId) throw new Error('ID do entregador é obrigatório.');
    if (!vehicleId) throw new Error('ID do veículo é obrigatório.');
    if (estimatedDistanceKm < 0) throw new Error('Distância estimada não pode ser negativa.');
    return new Route(uuidv4(), delivererId, vehicleId, estimatedDistanceKm);
  }

  get id(): string { return this._id; }
  get delivererId(): string { return this._delivererId; }
  get vehicleId(): string { return this._vehicleId; }
  get status(): RouteStatus { return this._status; }
  get stops(): ReadonlyArray<RouteStop> { return [...this._stops]; }
  get createdAt(): Date { return this._createdAt; }
  get startedAt(): Date | null { return this._startedAt; }
  get completedAt(): Date | null { return this._completedAt; }
  get estimatedDistanceKm(): number { return this._estimatedDistanceKm; }

  public addStop(stop: RouteStop): void {
    if (this._status !== RouteStatus.PLANNED) {
      throw new Error('Só é possível adicionar paradas em rotas com status PLANEJADO.');
    }
    const duplicate = this._stops.find(s => s.orderId === stop.orderId && s.type === stop.type);
    if (duplicate) {
      throw new Error(`Parada para o pedido ${stop.orderId} já existe na rota.`);
    }
    this._stops.push(stop);
  }

  public removeStop(stopId: string): void {
    if (this._status !== RouteStatus.PLANNED) {
      throw new Error('Só é possível remover paradas de rotas com status PLANEJADO.');
    }
    const index = this._stops.findIndex(s => s.id === stopId);
    if (index === -1) {
      throw new Error(`Parada ${stopId} não encontrada na rota.`);
    }
    this._stops.splice(index, 1);
  }

  public start(): void {
    if (this._status !== RouteStatus.PLANNED) {
      throw new Error('Rota já foi iniciada ou está cancelada.');
    }
    if (this._stops.length === 0) {
      throw new Error('Não é possível iniciar uma rota sem paradas.');
    }
    this._status = RouteStatus.ACTIVE;
    this._startedAt = new Date();
  }

  public completeStop(stopId: string): void {
    if (this._status !== RouteStatus.ACTIVE) {
      throw new Error('Rota não está ativa.');
    }
    const stop = this._stops.find(s => s.id === stopId);
    if (!stop) {
      throw new Error(`Parada ${stopId} não encontrada.`);
    }
    stop.complete();

    // Se todas as paradas foram concluídas, a rota é concluída automaticamente
    if (this.allStopsCompleted()) {
      this._status = RouteStatus.COMPLETED;
      this._completedAt = new Date();
    }
  }

  public cancel(): void {
    if (this._status === RouteStatus.COMPLETED) {
      throw new Error('Rota já concluída não pode ser cancelada.');
    }
    this._status = RouteStatus.CANCELLED;
  }

  public updateEstimatedDistance(distanceKm: number): void {
    if (distanceKm < 0) throw new Error('Distância não pode ser negativa.');
    this._estimatedDistanceKm = distanceKm;
  }

  public getNextPendingStop(): RouteStop | undefined {
    return this._stops
      .filter(s => !s.isCompleted())
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder)[0];
  }

  public getCompletedStopsCount(): number {
    return this._stops.filter(s => s.isCompleted()).length;
  }

  public getPendingStopsCount(): number {
    return this._stops.filter(s => !s.isCompleted()).length;
  }

  public getTotalStopsCount(): number {
    return this._stops.length;
  }

  public getDeliveryOrPickupIds(type: StopType): string[] {
    return this._stops
      .filter(s => s.type === type)
      .map(s => s.orderId);
  }

  private allStopsCompleted(): boolean {
    return this._stops.length > 0 && this._stops.every(s => s.isCompleted());
  }

  public isActive(): boolean {
    return this._status === RouteStatus.ACTIVE;
  }

  public isCompleted(): boolean {
    return this._status === RouteStatus.COMPLETED;
  }
}
