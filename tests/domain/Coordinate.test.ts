import { Coordinate, Distance } from '../../src/domain/valueobjects/Coordinate';

describe('Coordinate - Value Object', () => {
  describe('create()', () => {
    it('deve criar uma coordenada válida', () => {
      const coord = Coordinate.create(-23.5505, -46.6333);
      expect(coord.latitude).toBe(-23.5505);
      expect(coord.longitude).toBe(-46.6333);
    });

    it('deve lançar erro para latitude menor que -90', () => {
      expect(() => Coordinate.create(-91, 0)).toThrow('Latitude inválida');
    });

    it('deve lançar erro para latitude maior que 90', () => {
      expect(() => Coordinate.create(91, 0)).toThrow('Latitude inválida');
    });

    it('deve lançar erro para longitude menor que -180', () => {
      expect(() => Coordinate.create(0, -181)).toThrow('Longitude inválida');
    });

    it('deve lançar erro para longitude maior que 180', () => {
      expect(() => Coordinate.create(0, 181)).toThrow('Longitude inválida');
    });

    it('deve aceitar valores nos limites exatos (latitude = 90)', () => {
      expect(() => Coordinate.create(90, 0)).not.toThrow();
    });

    it('deve aceitar valores nos limites exatos (longitude = -180)', () => {
      expect(() => Coordinate.create(0, -180)).not.toThrow();
    });
  });

  describe('distanceTo()', () => {
    it('deve calcular distância zero entre pontos idênticos', () => {
      const a = Coordinate.create(-23.5505, -46.6333);
      const b = Coordinate.create(-23.5505, -46.6333);
      expect(a.distanceTo(b).kilometers).toBeCloseTo(0, 5);
    });

    it('deve calcular distância aproximada entre São Paulo e Rio de Janeiro (~357 km)', () => {
      const saoPaulo = Coordinate.create(-23.5505, -46.6333);
      const rio = Coordinate.create(-22.9068, -43.1729);
      const dist = saoPaulo.distanceTo(rio);
      expect(dist.kilometers).toBeGreaterThan(340);
      expect(dist.kilometers).toBeLessThan(380);
    });

    it('deve retornar a mesma distância em ambas as direções (simetria)', () => {
      const a = Coordinate.create(-23.5505, -46.6333);
      const b = Coordinate.create(-22.9068, -43.1729);
      expect(a.distanceTo(b).kilometers).toBeCloseTo(b.distanceTo(a).kilometers, 5);
    });
  });

  describe('equals()', () => {
    it('deve ser igual para mesmas coordenadas', () => {
      const a = Coordinate.create(-23.5505, -46.6333);
      const b = Coordinate.create(-23.5505, -46.6333);
      expect(a.equals(b)).toBe(true);
    });

    it('não deve ser igual para coordenadas diferentes', () => {
      const a = Coordinate.create(-23.5505, -46.6333);
      const b = Coordinate.create(-22.9068, -43.1729);
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('toString()', () => {
    it('deve formatar corretamente', () => {
      const coord = Coordinate.create(-23.5505, -46.6333);
      expect(coord.toString()).toBe('(-23.550500, -46.633300)');
    });
  });
});

describe('Distance - Value Object', () => {
  describe('ofKilometers()', () => {
    it('deve criar distância em quilômetros', () => {
      const d = Distance.ofKilometers(10);
      expect(d.kilometers).toBe(10);
      expect(d.meters).toBe(10000);
    });

    it('deve lançar erro para distância negativa', () => {
      expect(() => Distance.ofKilometers(-1)).toThrow('Distância inválida');
    });

    it('deve aceitar distância zero', () => {
      expect(() => Distance.ofKilometers(0)).not.toThrow();
    });
  });

  describe('ofMeters()', () => {
    it('deve converter metros para quilômetros corretamente', () => {
      const d = Distance.ofMeters(500);
      expect(d.kilometers).toBe(0.5);
    });
  });

  describe('add()', () => {
    it('deve somar distâncias corretamente', () => {
      const a = Distance.ofKilometers(5);
      const b = Distance.ofKilometers(3);
      expect(a.add(b).kilometers).toBe(8);
    });
  });

  describe('isGreaterThan()', () => {
    it('deve retornar true quando a distância é maior', () => {
      const a = Distance.ofKilometers(10);
      const b = Distance.ofKilometers(5);
      expect(a.isGreaterThan(b)).toBe(true);
    });

    it('deve retornar false quando a distância é menor', () => {
      const a = Distance.ofKilometers(3);
      const b = Distance.ofKilometers(5);
      expect(a.isGreaterThan(b)).toBe(false);
    });
  });

  describe('toString()', () => {
    it('deve exibir em km para distâncias >= 1km', () => {
      expect(Distance.ofKilometers(5.5).toString()).toBe('5.50 km');
    });

    it('deve exibir em metros para distâncias < 1km', () => {
      expect(Distance.ofMeters(250).toString()).toBe('250 m');
    });
  });
});
