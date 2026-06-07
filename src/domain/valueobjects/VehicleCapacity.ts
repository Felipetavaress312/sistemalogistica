/**
 * Value Object: Capacidade do Veículo
 * Representa a capacidade de carga de um veículo em kg e volume em m³.
 */
export class VehicleCapacity {
  private readonly _maxWeightKg: number;
  private readonly _maxVolumeM3: number;

  private constructor(maxWeightKg: number, maxVolumeM3: number) {
    this._maxWeightKg = maxWeightKg;
    this._maxVolumeM3 = maxVolumeM3;
  }

  public static create(maxWeightKg: number, maxVolumeM3: number): VehicleCapacity {
    if (maxWeightKg <= 0) {
      throw new Error(`Capacidade de peso inválida: ${maxWeightKg}. Deve ser maior que zero.`);
    }
    if (maxVolumeM3 <= 0) {
      throw new Error(`Capacidade de volume inválida: ${maxVolumeM3}. Deve ser maior que zero.`);
    }
    return new VehicleCapacity(maxWeightKg, maxVolumeM3);
  }

  get maxWeightKg(): number { return this._maxWeightKg; }
  get maxVolumeM3(): number { return this._maxVolumeM3; }

  public canFit(packageDimensions: PackageDimensions): boolean {
    return (
      packageDimensions.weightKg <= this._maxWeightKg &&
      packageDimensions.volumeM3 <= this._maxVolumeM3
    );
  }

  public equals(other: VehicleCapacity): boolean {
    return (
      this._maxWeightKg === other._maxWeightKg &&
      this._maxVolumeM3 === other._maxVolumeM3
    );
  }

  public toString(): string {
    return `Peso máx: ${this._maxWeightKg}kg | Volume máx: ${this._maxVolumeM3}m³`;
  }
}

/**
 * Value Object: Dimensões do Pacote
 * Representa o peso e volume de uma encomenda de forma imutável.
 */
export class PackageDimensions {
  private readonly _weightKg: number;
  private readonly _widthCm: number;
  private readonly _heightCm: number;
  private readonly _depthCm: number;

  private constructor(
    weightKg: number,
    widthCm: number,
    heightCm: number,
    depthCm: number
  ) {
    this._weightKg = weightKg;
    this._widthCm = widthCm;
    this._heightCm = heightCm;
    this._depthCm = depthCm;
  }

  public static create(
    weightKg: number,
    widthCm: number,
    heightCm: number,
    depthCm: number
  ): PackageDimensions {
    if (weightKg <= 0) throw new Error('Peso deve ser maior que zero.');
    if (widthCm <= 0 || heightCm <= 0 || depthCm <= 0) {
      throw new Error('Dimensões (largura, altura, profundidade) devem ser maiores que zero.');
    }
    return new PackageDimensions(weightKg, widthCm, heightCm, depthCm);
  }

  get weightKg(): number { return this._weightKg; }
  get widthCm(): number { return this._widthCm; }
  get heightCm(): number { return this._heightCm; }
  get depthCm(): number { return this._depthCm; }

  get volumeM3(): number {
    return (this._widthCm / 100) * (this._heightCm / 100) * (this._depthCm / 100);
  }

  public equals(other: PackageDimensions): boolean {
    return (
      this._weightKg === other._weightKg &&
      this._widthCm === other._widthCm &&
      this._heightCm === other._heightCm &&
      this._depthCm === other._depthCm
    );
  }

  public toString(): string {
    return `${this._weightKg}kg | ${this._widthCm}x${this._heightCm}x${this._depthCm}cm (${(this.volumeM3 * 1000).toFixed(2)}L)`;
  }
}
