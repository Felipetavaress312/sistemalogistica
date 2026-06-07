/**
 * Utilitário para geração de UUID v4.
 * Implementação local para evitar dependência externa em ambientes sem npm.
 * Em produção, substitua por: import { v4 as uuidv4 } from 'uuid';
 */
export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
