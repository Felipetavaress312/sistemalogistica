import { DeliveryStatus, DeliveryStatusEnum } from '../../src/domain/valueobjects/DeliveryStatus';

describe('DeliveryStatus - Value Object', () => {
  describe('Criação de status', () => {
    it('deve criar status PENDING', () => {
      const s = DeliveryStatus.pending();
      expect(s.isPending()).toBe(true);
      expect(s.value).toBe(DeliveryStatusEnum.PENDING);
    });

    it('deve criar status DELIVERED', () => {
      expect(DeliveryStatus.delivered().isDelivered()).toBe(true);
    });

    it('deve criar status FAILED', () => {
      expect(DeliveryStatus.failed().isFailed()).toBe(true);
    });
  });

  describe('isTerminal()', () => {
    it('DELIVERED deve ser terminal', () => {
      expect(DeliveryStatus.delivered().isTerminal()).toBe(true);
    });

    it('RETURNED deve ser terminal', () => {
      expect(DeliveryStatus.returned().isTerminal()).toBe(true);
    });

    it('CANCELLED deve ser terminal', () => {
      expect(DeliveryStatus.cancelled().isTerminal()).toBe(true);
    });

    it('PENDING não deve ser terminal', () => {
      expect(DeliveryStatus.pending().isTerminal()).toBe(false);
    });

    it('IN_TRANSIT não deve ser terminal', () => {
      expect(DeliveryStatus.inTransit().isTerminal()).toBe(false);
    });
  });

  describe('canTransitionTo() - Transições Válidas', () => {
    it('PENDING → COLLECTED deve ser válido', () => {
      expect(DeliveryStatus.pending().canTransitionTo(DeliveryStatus.collected())).toBe(true);
    });

    it('COLLECTED → IN_TRANSIT deve ser válido', () => {
      expect(DeliveryStatus.collected().canTransitionTo(DeliveryStatus.inTransit())).toBe(true);
    });

    it('IN_TRANSIT → DELIVERED deve ser válido', () => {
      expect(DeliveryStatus.inTransit().canTransitionTo(DeliveryStatus.delivered())).toBe(true);
    });

    it('IN_TRANSIT → FAILED deve ser válido', () => {
      expect(DeliveryStatus.inTransit().canTransitionTo(DeliveryStatus.failed())).toBe(true);
    });

    it('FAILED → IN_TRANSIT deve ser válido (nova tentativa)', () => {
      expect(DeliveryStatus.failed().canTransitionTo(DeliveryStatus.inTransit())).toBe(true);
    });

    it('FAILED → RETURNED deve ser válido', () => {
      expect(DeliveryStatus.failed().canTransitionTo(DeliveryStatus.returned())).toBe(true);
    });

    it('qualquer status não-terminal → CANCELLED deve ser válido', () => {
      expect(DeliveryStatus.pending().canTransitionTo(DeliveryStatus.cancelled())).toBe(true);
      expect(DeliveryStatus.collected().canTransitionTo(DeliveryStatus.cancelled())).toBe(true);
      expect(DeliveryStatus.inTransit().canTransitionTo(DeliveryStatus.cancelled())).toBe(true);
    });
  });

  describe('canTransitionTo() - Transições Inválidas', () => {
    it('DELIVERED → qualquer coisa não deve ser válido (terminal)', () => {
      expect(DeliveryStatus.delivered().canTransitionTo(DeliveryStatus.pending())).toBe(false);
      expect(DeliveryStatus.delivered().canTransitionTo(DeliveryStatus.cancelled())).toBe(false);
    });

    it('CANCELLED → qualquer coisa não deve ser válido (terminal)', () => {
      expect(DeliveryStatus.cancelled().canTransitionTo(DeliveryStatus.pending())).toBe(false);
    });

    it('PENDING → DELIVERED não deve ser válido (pula etapas)', () => {
      expect(DeliveryStatus.pending().canTransitionTo(DeliveryStatus.delivered())).toBe(false);
    });

    it('PENDING → IN_TRANSIT não deve ser válido (pula etapa de coleta)', () => {
      expect(DeliveryStatus.pending().canTransitionTo(DeliveryStatus.inTransit())).toBe(false);
    });
  });

  describe('equals()', () => {
    it('dois status iguais devem ser iguais', () => {
      expect(DeliveryStatus.pending().equals(DeliveryStatus.pending())).toBe(true);
    });

    it('dois status diferentes não devem ser iguais', () => {
      expect(DeliveryStatus.pending().equals(DeliveryStatus.delivered())).toBe(false);
    });
  });

  describe('toString()', () => {
    it('deve retornar label legível em português', () => {
      expect(DeliveryStatus.pending().toString()).toBe('Aguardando Coleta');
      expect(DeliveryStatus.delivered().toString()).toBe('Entregue');
      expect(DeliveryStatus.failed().toString()).toBe('Falha na Entrega');
    });
  });
});
