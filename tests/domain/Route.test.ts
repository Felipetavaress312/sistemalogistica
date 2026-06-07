import { Route } from '../../src/domain/aggregates/Route';
import { RouteStop, StopType } from '../../src/domain/entities/RouteStop';
import { Address } from '../../src/domain/valueobjects/Address';
import { Coordinate } from '../../src/domain/valueobjects/Coordinate';

function makeStop(orderId: string, type: StopType, seq: number): RouteStop {
  const address = Address.create(
    'Rua Teste',
    '10',
    'Bairro',
    'São Paulo',
    'SP',
    '01310-100',
    Coordinate.create(-23.55, -46.63)
  );
  return RouteStop.create(orderId, address, type, seq);
}

describe('Route - Aggregate Root', () => {
  describe('create()', () => {
    it('deve criar uma rota válida com status PLANNED', () => {
      const route = Route.create('deliverer-01', 'vehicle-01', 15.5);
      expect(route.delivererId).toBe('deliverer-01');
      expect(route.vehicleId).toBe('vehicle-01');
      expect(route.estimatedDistanceKm).toBe(15.5);
      expect(route.getTotalStopsCount()).toBe(0);
    });

    it('deve lançar erro sem delivererId', () => {
      expect(() => Route.create('', 'vehicle-01')).toThrow('ID do entregador');
    });

    it('deve lançar erro com distância negativa', () => {
      expect(() => Route.create('d1', 'v1', -5)).toThrow('Distância estimada');
    });
  });

  describe('addStop()', () => {
    it('deve adicionar paradas corretamente', () => {
      const route = Route.create('d1', 'v1');
      route.addStop(makeStop('order-01', StopType.PICKUP, 0));
      route.addStop(makeStop('order-01', StopType.DELIVERY, 1));
      expect(route.getTotalStopsCount()).toBe(2);
    });

    it('não deve adicionar parada duplicada para o mesmo pedido e tipo', () => {
      const route = Route.create('d1', 'v1');
      route.addStop(makeStop('order-01', StopType.PICKUP, 0));
      expect(() => route.addStop(makeStop('order-01', StopType.PICKUP, 1)))
        .toThrow('já existe na rota');
    });

    it('não deve adicionar parada em rota já iniciada', () => {
      const route = Route.create('d1', 'v1');
      route.addStop(makeStop('order-01', StopType.PICKUP, 0));
      route.start();
      expect(() => route.addStop(makeStop('order-02', StopType.PICKUP, 1)))
        .toThrow('PLANEJADO');
    });
  });

  describe('start()', () => {
    it('deve iniciar rota com paradas', () => {
      const route = Route.create('d1', 'v1');
      route.addStop(makeStop('order-01', StopType.PICKUP, 0));
      route.start();
      expect(route.isActive()).toBe(true);
      expect(route.startedAt).not.toBeNull();
    });

    it('não deve iniciar rota sem paradas', () => {
      const route = Route.create('d1', 'v1');
      expect(() => route.start()).toThrow('sem paradas');
    });

    it('não deve iniciar rota já iniciada', () => {
      const route = Route.create('d1', 'v1');
      route.addStop(makeStop('order-01', StopType.PICKUP, 0));
      route.start();
      expect(() => route.start()).toThrow('já foi iniciada');
    });
  });

  describe('completeStop()', () => {
    it('deve completar uma parada e contar corretamente', () => {
      const route = Route.create('d1', 'v1');
      const stop = makeStop('order-01', StopType.PICKUP, 0);
      route.addStop(stop);
      route.start();

      route.completeStop(stop.id);
      expect(route.getCompletedStopsCount()).toBe(1);
      expect(route.getPendingStopsCount()).toBe(0);
    });

    it('deve completar a rota automaticamente quando todas as paradas forem concluídas', () => {
      const route = Route.create('d1', 'v1');
      const stop = makeStop('order-01', StopType.DELIVERY, 0);
      route.addStop(stop);
      route.start();
      route.completeStop(stop.id);

      expect(route.isCompleted()).toBe(true);
      expect(route.completedAt).not.toBeNull();
    });

    it('deve lançar erro ao completar parada não existente', () => {
      const route = Route.create('d1', 'v1');
      route.addStop(makeStop('order-01', StopType.PICKUP, 0));
      route.start();
      expect(() => route.completeStop('inexistente')).toThrow('não encontrada');
    });
  });

  describe('getNextPendingStop()', () => {
    it('deve retornar a parada de menor sequência pendente', () => {
      const route = Route.create('d1', 'v1');
      const stop1 = makeStop('order-01', StopType.PICKUP, 0);
      const stop2 = makeStop('order-01', StopType.DELIVERY, 1);
      route.addStop(stop1);
      route.addStop(stop2);
      route.start();

      expect(route.getNextPendingStop()?.id).toBe(stop1.id);

      route.completeStop(stop1.id);
      expect(route.getNextPendingStop()?.id).toBe(stop2.id);
    });
  });

  describe('cancel()', () => {
    it('deve cancelar uma rota planejada', () => {
      const route = Route.create('d1', 'v1');
      route.cancel();
      expect(route.status).toBe('CANCELLED');
    });

    it('não deve cancelar uma rota já concluída', () => {
      const route = Route.create('d1', 'v1');
      const stop = makeStop('order-01', StopType.DELIVERY, 0);
      route.addStop(stop);
      route.start();
      route.completeStop(stop.id);
      expect(() => route.cancel()).toThrow('já concluída');
    });
  });
});
