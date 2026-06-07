import { Deliverer, DelivererStatus } from '../../src/domain/entities/Deliverer';
import { Coordinate } from '../../src/domain/valueobjects/Coordinate';

describe('Deliverer - Entidade', () => {
  const validName = 'João da Silva';
  const validCpf = '123.456.789-09';
  const validPhone = '(11) 98765-4321';

  describe('create()', () => {
    it('deve criar um entregador válido', () => {
      const d = Deliverer.create(validName, validCpf, validPhone);
      expect(d.name).toBe(validName);
      expect(d.status).toBe(DelivererStatus.OFFLINE);
      expect(d.id).toBeDefined();
      expect(d.activeDeliveryIds).toHaveLength(0);
    });

    it('deve lançar erro para nome com menos de 3 caracteres', () => {
      expect(() => Deliverer.create('Jo', validCpf, validPhone)).toThrow('Nome');
    });

    it('deve lançar erro para CPF com dígitos insuficientes', () => {
      expect(() => Deliverer.create(validName, '123456', validPhone)).toThrow('CPF');
    });

    it('deve lançar erro para telefone inválido', () => {
      expect(() => Deliverer.create(validName, validCpf, '123')).toThrow('Telefone');
    });

    it('cada entregador criado deve ter id único', () => {
      const a = Deliverer.create(validName, validCpf, validPhone);
      const b = Deliverer.create(validName, validCpf, validPhone);
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('goOnline() / goOffline()', () => {
    it('deve mudar status para AVAILABLE ao ir online', () => {
      const d = Deliverer.create(validName, validCpf, validPhone);
      d.goOnline();
      expect(d.status).toBe(DelivererStatus.AVAILABLE);
    });

    it('deve mudar status para OFFLINE ao ir offline', () => {
      const d = Deliverer.create(validName, validCpf, validPhone);
      d.goOnline();
      d.goOffline();
      expect(d.status).toBe(DelivererStatus.OFFLINE);
    });

    it('não deve ir offline enquanto está em entrega', () => {
      const d = Deliverer.create(validName, validCpf, validPhone);
      d.goOnline();
      d.assignDelivery('delivery-001');
      expect(() => d.goOffline()).toThrow('em entrega ativa');
    });
  });

  describe('assignDelivery()', () => {
    it('deve atribuir uma entrega quando disponível', () => {
      const d = Deliverer.create(validName, validCpf, validPhone);
      d.goOnline();
      d.assignDelivery('delivery-001');
      expect(d.status).toBe(DelivererStatus.ON_DELIVERY);
      expect(d.activeDeliveryIds).toContain('delivery-001');
    });

    it('não deve atribuir entrega quando offline', () => {
      const d = Deliverer.create(validName, validCpf, validPhone);
      expect(() => d.assignDelivery('delivery-001')).toThrow('não está disponível');
    });
  });

  describe('completeDelivery()', () => {
    it('deve concluir entrega e volcar ao status AVAILABLE', () => {
      const d = Deliverer.create(validName, validCpf, validPhone);
      d.goOnline();
      d.assignDelivery('delivery-001');
      d.completeDelivery('delivery-001');
      expect(d.status).toBe(DelivererStatus.AVAILABLE);
      expect(d.activeDeliveryIds).not.toContain('delivery-001');
    });

    it('deve lançar erro ao tentar concluir entrega não atribuída', () => {
      const d = Deliverer.create(validName, validCpf, validPhone);
      d.goOnline();
      expect(() => d.completeDelivery('inexistente')).toThrow('não está atribuída');
    });
  });

  describe('updateLocation()', () => {
    it('deve atualizar a localização atual', () => {
      const d = Deliverer.create(validName, validCpf, validPhone);
      const location = Coordinate.create(-23.5505, -46.6333);
      d.updateLocation(location);
      expect(d.currentLocation).not.toBeNull();
      expect(d.currentLocation?.latitude).toBe(-23.5505);
    });
  });

  describe('isAvailable()', () => {
    it('deve retornar false quando offline', () => {
      const d = Deliverer.create(validName, validCpf, validPhone);
      expect(d.isAvailable()).toBe(false);
    });

    it('deve retornar true quando online e sem entregas', () => {
      const d = Deliverer.create(validName, validCpf, validPhone);
      d.goOnline();
      expect(d.isAvailable()).toBe(true);
    });
  });
});
