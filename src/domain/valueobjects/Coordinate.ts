/**
 * Value Object: Coordenada Geográfica
 * Representa um par latitude/longitude de forma imutável e validada.
 * Dois objetos com mesmas coordenadas são considerados iguais (sem identidade própria).
 */
export class Coordinate {
  private readonly _latitude: number;
  private readonly _longitude: number;

  private constructor(latitude: number, longitude: number) {
    this._latitude = latitude;
    this._longitude = longitude;
  }

  public static create(latitude: number, longitude: number): Coordinate {
    if (latitude < -90 || latitude > 90) {
      throw new Error(`Latitude inválida: ${latitude}. Deve estar entre -90 e 90.`);
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error(`Longitude inválida: ${longitude}. Deve estar entre -180 e 180.`);
    }
    return new Coordinate(latitude, longitude);
  }

  get latitude(): number {
    return this._latitude;
  }

  get longitude(): number {
    return this._longitude;
  }

  /**
   * Calcula a distância em quilômetros usando a fórmula de Haversine.
   */
  public distanceTo(other: Coordinate): Distance {
    const R = 6371; // raio médio da Terra em km
    const dLat = this.toRad(other.latitude - this._latitude);
    const dLon = this.toRad(other.longitude - this._longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(this._latitude)) *
        Math.cos(this.toRad(other.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Distance.ofKilometers(R * c);
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  public equals(other: Coordinate): boolean {
    return (
      Math.abs(this._latitude - other._latitude) < 1e-9 &&
      Math.abs(this._longitude - other._longitude) < 1e-9
    );
  }

  public toString(): string {
    return `(${this._latitude.toFixed(6)}, ${this._longitude.toFixed(6)})`;
  }
}

/**
 * Value Object: Distância
 * Representa uma medida de distância física de forma imutável.
 */
export class Distance {
  private readonly _kilometers: number;

  private constructor(kilometers: number) {
    if (kilometers < 0) {
      throw new Error(`Distância inválida: ${kilometers}. Não pode ser negativa.`);
    }
    this._kilometers = kilometers;
  }

  public static ofKilometers(km: number): Distance {
    return new Distance(km);
  }

  public static ofMeters(meters: number): Distance {
    return new Distance(meters / 1000);
  }

  get kilometers(): number {
    return this._kilometers;
  }

  get meters(): number {
    return this._kilometers * 1000;
  }

  public add(other: Distance): Distance {
    return new Distance(this._kilometers + other._kilometers);
  }

  public isGreaterThan(other: Distance): boolean {
    return this._kilometers > other._kilometers;
  }

  public equals(other: Distance): boolean {
    return Math.abs(this._kilometers - other._kilometers) < 1e-9;
  }

  public toString(): string {
    if (this._kilometers >= 1) {
      return `${this._kilometers.toFixed(2)} km`;
    }
    return `${this.meters.toFixed(0)} m`;
  }
}
