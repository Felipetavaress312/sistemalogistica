import { Coordinate } from './Coordinate';

/**
 * Value Object: Endereço
 * Representa um endereço físico completo de forma imutável.
 */
export class Address {
  private readonly _street: string;
  private readonly _number: string;
  private readonly _neighborhood: string;
  private readonly _city: string;
  private readonly _state: string;
  private readonly _zipCode: string;
  private readonly _coordinate: Coordinate;

  private constructor(
    street: string,
    number: string,
    neighborhood: string,
    city: string,
    state: string,
    zipCode: string,
    coordinate: Coordinate
  ) {
    this._street = street;
    this._number = number;
    this._neighborhood = neighborhood;
    this._city = city;
    this._state = state;
    this._zipCode = zipCode;
    this._coordinate = coordinate;
  }

  public static create(
    street: string,
    number: string,
    neighborhood: string,
    city: string,
    state: string,
    zipCode: string,
    coordinate: Coordinate
  ): Address {
    if (!street || street.trim().length === 0) {
      throw new Error('Rua não pode ser vazia.');
    }
    if (!city || city.trim().length === 0) {
      throw new Error('Cidade não pode ser vazia.');
    }
    const zipPattern = /^\d{5}-?\d{3}$/;
    if (!zipPattern.test(zipCode)) {
      throw new Error(`CEP inválido: ${zipCode}. Use o formato XXXXX-XXX.`);
    }
    return new Address(
      street.trim(),
      number.trim(),
      neighborhood.trim(),
      city.trim(),
      state.trim().toUpperCase(),
      zipCode,
      coordinate
    );
  }

  get street(): string { return this._street; }
  get number(): string { return this._number; }
  get neighborhood(): string { return this._neighborhood; }
  get city(): string { return this._city; }
  get state(): string { return this._state; }
  get zipCode(): string { return this._zipCode; }
  get coordinate(): Coordinate { return this._coordinate; }

  public equals(other: Address): boolean {
    return (
      this._street === other._street &&
      this._number === other._number &&
      this._zipCode === other._zipCode
    );
  }

  public toString(): string {
    return `${this._street}, ${this._number} - ${this._neighborhood}, ${this._city}/${this._state} - CEP: ${this._zipCode}`;
  }
}
