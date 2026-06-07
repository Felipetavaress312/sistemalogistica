import { DeliveryOrder } from '../../src/domain/aggregates/DeliveryOrder';
import { Address } from '../../src/domain/valueobjects/Address';
import { Coordinate } from '../../src/domain/valueobjects/Coordinate';
import { PackageDimensions } from '../../src/domain/valueobjects/VehicleCapacity';

// Helpers de fábrica para evitar duplicação nos testes
function makeAddress(lat: number, lng: number): Address {
  return Address.create(
    'Rua das Flores',
    '100',
    'Centro',
    'São Paulo',
    'SP',
    '01310-100',
    Coordinate.create(lat, lng)
  );
}

function makePackage(): PackageDimensions {
  return PackageDimensions.create(2.5, 30, 20, 15);
}

function makeOrder(overrides?: {
  pickupLat?: number;
  pickupLng?: number;
  deliveryLat?: number;
  deliveryLng?: number;
}): DeliveryOrder {
  return DeliveryOrder.create(
    'Maria Expedidora',
    '(11) 91111-1111',
    'Carlos Destinatário',
    '(11) 92222-2222',
    makeAddress(overrides?.pickupLat ?? -23.55, overrides?.pickupLng ?? -46.63),
    makeAddress(overrides?.deliveryLat ?? -23.56, overrides?.deliveryLng ?? -46.64),
    makePackage()
  );
}

describe('DeliveryOrder - Aggregate Root', () => {
  describe('create()', () => {
    it('deve criar um pedido válido com status PENDING', () => {
      const order = makeOrder();
      expect(order.status.isPending()).toBe(true);
      expect(order.trackingCode).toMatch(/^[A-Z]{2}\d{9}BR$/);
      expect(order.id).toBeDefined();
    });

    it('deve gerar códigos de rastreamento únicos', () => {
      const a = makeOrder();
      const b = makeOrder();
      expect(a.trackingCode).not.toBe(b.trackingCode);
    });

    it('deve lançar erro quando endereços de coleta e entrega são iguais', () => {
      const sameAddress = makeAddress(-23.55, -46.63);
      expect(() =>
        DeliveryOrder.create(
          'Remetente Teste',
          '(11) 99999-9999',
          'Destinatário Teste',
          '(11) 88888-8888',
          sameAddress,
          sameAddress,
          makePackage()
        )
      ).toThrow('Endereço de coleta e entrega não podem ser iguais');
    });

    it('deve lançar erro para nome de remetente muito curto', () => {
      expect(() =>
        DeliveryOrder.create(
          'Jo',
          '(11) 99999-9999',
          'Destinatário',
          '(11) 88888-8888',
          makeAddress(-23.55, -46.63),
          makeAddress(-23.56, -46.64),
          makePackage()
        )
      ).toThrow('Remetente');
    });

    it('deve lançar erro para telefone do destinatário inválido', () => {
      expect(() =>
        DeliveryOrder.create(
          'Remetente Válido',
          '(11) 99999-9999',
          'Destinatário Válido',
          '123',
          makeAddress(-23.55, -46.63),
          makeAddress(-23.56, -46.64),
          makePackage()
        )
      ).toThrow('Destinatário');
    });
  });

  describe('Fluxo de Status: Ciclo Feliz', () => {
    it('PENDING → COLLECTED → IN_TRANSIT → DELIVERED', () => {
      const order = makeOrder();

      order.collect('deliverer-01');
      expect(order.status.isCollected()).toBe(true);
      expect(order.assignedDelivererId).toBe('deliverer-01');

      order.startTransit('route-01');
      expect(order.status.isInTransit()).toBe(true);
      expect(order.assignedRouteId).toBe('route-01');

      order.confirmDelivery();
      expect(order.status.isDelivered()).toBe(true);
      expect(order.deliveredAt).not.toBeNull();
    });
  });

  describe('Fluxo de Status: Falha e Reentrega', () => {
    it('deve registrar falha e permitir nova tentativa', () => {
      const order = makeOrder();
      order.collect('deliverer-01');
      order.startTransit('route-01');

      order.registerFailure('Destinatário ausente');
      expect(order.status.isFailed()).toBe(true);
      expect(order.failureReason).toBe('Destinatário ausente');

      order.retry();
      expect(order.status.isInTransit()).toBe(true);
      expect(order.failureReason).toBeNull();
    });

    it('deve devolver ao remetente após falha', () => {
      const order = makeOrder();
      order.collect('deliverer-01');
      order.startTransit('route-01');
      order.registerFailure('Endereço não encontrado');
      order.returnToSender();
      expect(order.status.isReturned()).toBe(true);
    });
  });

  describe('Fluxo de Status: Cancelamento', () => {
    it('deve cancelar um pedido pendente', () => {
      const order = makeOrder();
      order.cancel();
      expect(order.status.isCancelled()).toBe(true);
    });

    it('não deve cancelar um pedido já entregue', () => {
      const order = makeOrder();
      order.collect('deliverer-01');
      order.startTransit('route-01');
      order.confirmDelivery();
      expect(() => order.cancel()).toThrow('Transição de status inválida');
    });
  });

  describe('Regras de Negócio - Transições Inválidas', () => {
    it('não deve ir de PENDING direto para IN_TRANSIT', () => {
      const order = makeOrder();
      expect(() => order.startTransit('route-01')).toThrow('Transição de status inválida');
    });

    it('não deve registrar falha com motivo vazio', () => {
      const order = makeOrder();
      order.collect('deliverer-01');
      order.startTransit('route-01');
      expect(() => order.registerFailure('')).toThrow('Motivo da falha');
    });

    it('não deve tentar nova entrega quando status não é FAILED', () => {
      const order = makeOrder();
      expect(() => order.retry()).toThrow('Só é possível tentar nova entrega');
    });
  });
});
