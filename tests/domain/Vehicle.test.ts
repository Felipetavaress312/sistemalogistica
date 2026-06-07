import { Vehicle, VehicleType, VehicleStatus } from '../../src/domain/entities/Vehicle';
import { VehicleCapacity, PackageDimensions } from '../../src/domain/valueobjects/VehicleCapacity';

function makeCapacity(): VehicleCapacity {
  return VehicleCapacity.create(100, 0.5);
}

describe('VehicleCapacity - Value Object', () => {
  it('deve criar capacidade válida', () => {
    const cap = VehicleCapacity.create(200, 1.5);
    expect(cap.maxWeightKg).toBe(200);
    expect(cap.maxVolumeM3).toBe(1.5);
  });

  it('deve lançar erro para peso zero', () => {
    expect(() => VehicleCapacity.create(0, 1)).toThrow('Capacidade de peso');
  });

  it('deve lançar erro para volume negativo', () => {
    expect(() => VehicleCapacity.create(100, -1)).toThrow('Capacidade de volume');
  });

  describe('canFit()', () => {
    it('deve retornar true para pacote que cabe', () => {
      const cap = VehicleCapacity.create(100, 1);
      const pkg = PackageDimensions.create(5, 50, 50, 40); // 0.1 m³, 5kg
      expect(cap.canFit(pkg)).toBe(true);
    });

    it('deve retornar false para pacote muito pesado', () => {
      const cap = VehicleCapacity.create(10, 1);
      const pkg = PackageDimensions.create(50, 10, 10, 10);
      expect(cap.canFit(pkg)).toBe(false);
    });
  });
});

describe('PackageDimensions - Value Object', () => {
  it('deve criar dimensões válidas', () => {
    const pkg = PackageDimensions.create(2, 30, 20, 15);
    expect(pkg.weightKg).toBe(2);
    expect(pkg.volumeM3).toBeCloseTo(0.009, 5);
  });

  it('deve lançar erro para peso zero', () => {
    expect(() => PackageDimensions.create(0, 10, 10, 10)).toThrow('Peso deve ser maior que zero');
  });

  it('deve lançar erro para dimensão zero', () => {
    expect(() => PackageDimensions.create(1, 0, 10, 10)).toThrow('Dimensões');
  });
});

describe('Vehicle - Entidade', () => {
  describe('create()', () => {
    it('deve criar veículo com placa no formato antigo', () => {
      const v = Vehicle.create('ABC-1234', VehicleType.CAR, makeCapacity(), 'Gol', 2020);
      expect(v.licensePlate).toBe('ABC-1234');
      expect(v.status).toBe(VehicleStatus.ACTIVE);
    });

    it('deve criar veículo com placa Mercosul', () => {
      expect(() =>
        Vehicle.create('ABC1D23', VehicleType.CAR, makeCapacity(), 'HB20', 2022)
      ).not.toThrow();
    });

    it('deve lançar erro para placa inválida', () => {
      expect(() =>
        Vehicle.create('INVALIDA', VehicleType.CAR, makeCapacity(), 'Carro', 2020)
      ).toThrow('Placa inválida');
    });

    it('deve lançar erro para ano inválido', () => {
      expect(() =>
        Vehicle.create('ABC-1234', VehicleType.CAR, makeCapacity(), 'Carro', 1800)
      ).toThrow('Ano inválido');
    });
  });

  describe('assignToDeliverer() / unassign()', () => {
    it('deve atribuir e desatribuir entregador', () => {
      const v = Vehicle.create('ABC-1234', VehicleType.MOTORCYCLE, makeCapacity(), 'CG 160', 2021);
      v.assignToDeliverer('deliverer-01');
      expect(v.assignedDelivererId).toBe('deliverer-01');
      expect(v.isAvailable()).toBe(false);

      v.unassign();
      expect(v.assignedDelivererId).toBeNull();
      expect(v.isAvailable()).toBe(true);
    });

    it('não deve atribuir veículo já atribuído', () => {
      const v = Vehicle.create('ABC-1234', VehicleType.CAR, makeCapacity(), 'Uno', 2018);
      v.assignToDeliverer('deliverer-01');
      expect(() => v.assignToDeliverer('deliverer-02')).toThrow('não está disponível');
    });
  });

  describe('sendToMaintenance()', () => {
    it('deve enviar veículo para manutenção', () => {
      const v = Vehicle.create('ABC-1234', VehicleType.VAN, makeCapacity(), 'Sprinter', 2019);
      v.sendToMaintenance();
      expect(v.status).toBe(VehicleStatus.MAINTENANCE);
      expect(v.isAvailable()).toBe(false);
    });

    it('não deve enviar veículo atribuído para manutenção', () => {
      const v = Vehicle.create('ABC-1234', VehicleType.CAR, makeCapacity(), 'Palio', 2017);
      v.assignToDeliverer('d1');
      expect(() => v.sendToMaintenance()).toThrow('atribuído');
    });

    it('deve retornar da manutenção', () => {
      const v = Vehicle.create('ABC-1234', VehicleType.CAR, makeCapacity(), 'Kwid', 2023);
      v.sendToMaintenance();
      v.returnFromMaintenance();
      expect(v.status).toBe(VehicleStatus.ACTIVE);
    });
  });
});
