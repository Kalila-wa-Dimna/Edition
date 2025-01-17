/* tslint:disable */
/* eslint-disable */
/**
* @param {number | undefined} w
* @param {number | undefined} h
* @param {Uint8Array | undefined} bg_color
* @param {Uint8Array | undefined} grid_color
* @returns {string}
*/
export function generate_facsimile(w?: number, h?: number, bg_color?: Uint8Array, grid_color?: Uint8Array): string;
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
/**
*/
export class LineDetector {
  free(): void;
/**
* @param {string} encoded_file
* @returns {LineDetector}
*/
  static new(encoded_file: string): LineDetector;
/**
* @param {Uint32Array} region
* @param {number} thresh
* @param {number} density
* @returns {Uint32Array}
*/
  detect_lines_in_region(region: Uint32Array, thresh: number, density: number): Uint32Array;
}
