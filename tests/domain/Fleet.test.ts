import { Fleet } from '../../src/domain/aggregates/Fleet';
import { Deliverer } from '../../src/domain/entities/Deliverer';
import { Vehicle, VehicleType } from '../../src/domain/entities/Vehicle';
import { VehicleCapacity } from '../../src/domain/valueobjects/VehicleCapacity';

function makeDeliverer(): Deliverer {
  const d = Deliverer.create('Carlos Motorista', '111.222.333-44', '(11) 99999-0000');
  d.goOnline();
  return d;
}

function makeVehicle(): Vehicle {
  const capacity = VehicleCapacity.create(500, 2);
  return Vehicle.create('ABC-1234', VehicleType.MOTORCYCLE, capacity, 'Honda CB 300', 2022);
}

describe('Fleet - Aggregate Root', () => {
  describe('create()', () => {
    it('deve criar uma frota válida', () => {
      const fleet = Fleet.create('LogisBr Transportes');
      expect(fleet.companyName).toBe('LogisBr Transportes');
      expect(fleet.getTotalDeliverers()).toBe(0);
      expect(fleet.getTotalVehicles()).toBe(0);
    });

    it('deve lançar erro para nome de empresa muito curto', () => {
      expect(() => Fleet.create('X')).toThrow('Nome da empresa');
    });
  });

  describe('registerDeliverer()', () => {
    it('deve registrar um entregador', () => {
      const fleet = Fleet.create('LogisBr');
      const deliverer = makeDeliverer();
      fleet.registerDeliverer(deliverer);
      expect(fleet.getTotalDeliverers()).toBe(1);
    });

    it('não deve registrar o mesmo entregador duas vezes', () => {
      const fleet = Fleet.create('LogisBr');
      const deliverer = makeDeliverer();
      fleet.registerDeliverer(deliverer);
      expect(() => fleet.registerDeliverer(deliverer)).toThrow('já está registrado');
    });
  });

  describe('registerVehicle()', () => {
    it('deve registrar um veículo', () => {
      const fleet = Fleet.create('LogisBr');
      fleet.registerVehicle(makeVehicle());
      expect(fleet.getTotalVehicles()).toBe(1);
    });

    it('não deve registrar o mesmo veículo duas vezes', () => {
      const fleet = Fleet.create('LogisBr');
      const vehicle = makeVehicle();
      fleet.registerVehicle(vehicle);
      expect(() => fleet.registerVehicle(vehicle)).toThrow('já está registrado');
    });
  });

  describe('assignVehicleToDeliverer()', () => {
    it('deve atribuir veículo disponível a entregador disponível', () => {
      const fleet = Fleet.create('LogisBr');
      const deliverer = makeDeliverer();
      const vehicle = makeVehicle();
      fleet.registerDeliverer(deliverer);
      fleet.registerVehicle(vehicle);

      fleet.assignVehicleToDeliverer(vehicle.id, deliverer.id);
      expect(vehicle.assignedDelivererId).toBe(deliverer.id);
    });

    it('não deve atribuir veículo já atribuído', () => {
      const fleet = Fleet.create('LogisBr');
      const d1 = makeDeliverer();
      const d2 = makeDeliverer();
      const vehicle = makeVehicle();
      fleet.registerDeliverer(d1);
      fleet.registerDeliverer(d2);
      fleet.registerVehicle(vehicle);

      fleet.assignVehicleToDeliverer(vehicle.id, d1.id);
      expect(() => fleet.assignVehicleToDeliverer(vehicle.id, d2.id))
        .toThrow('não está disponível');
    });

    it('deve lançar erro se entregador não for encontrado', () => {
      const fleet = Fleet.create('LogisBr');
      const vehicle = makeVehicle();
      fleet.registerVehicle(vehicle);
      expect(() => fleet.assignVehicleToDeliverer(vehicle.id, 'nao-existe'))
        .toThrow('não encontrado na frota');
    });
  });

  describe('getAvailableDeliverers()', () => {
    it('deve retornar apenas entregadores disponíveis', () => {
      const fleet = Fleet.create('LogisBr');
      const available = makeDeliverer();
      const offline = Deliverer.create('Offline Cara', '222.333.444-55', '(11) 98888-0000');
      fleet.registerDeliverer(available);
      fleet.registerDeliverer(offline);

      expect(fleet.getAvailableDeliverers()).toHaveLength(1);
      expect(fleet.getAvailableDeliverers()[0].id).toBe(available.id);
    });
  });
});
