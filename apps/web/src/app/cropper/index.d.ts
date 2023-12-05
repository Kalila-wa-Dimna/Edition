/* tslint:disable */
/* eslint-disable */
/**
*/
export class FacsimileCropper {
  free(): void;
/**
* @param {string} encoded_file
* @returns {FacsimileCropper}
*/
  static new(encoded_file: string): FacsimileCropper;
/**
* @returns {string}
*/
  get_url(): string;
/**
* @param {Uint32Array} p
* @param {number} r
* @param {Uint32Array} frame_color
* @param {number | undefined} padding_percentage
* @returns {string}
*/
  get_region(p: Uint32Array, r: number, frame_color: Uint32Array, padding_percentage?: number): string;
}
