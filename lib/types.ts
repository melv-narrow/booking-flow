export type PlasterboardOption = 'bag_it' | 'mixed_load' | 'separate_collection';

export interface Address {
  id: string;
  line1: string;
  city: string;
}

export interface WasteTypePayload {
  heavyWaste: boolean;
  plasterboard: boolean;
  plasterboardOption: PlasterboardOption | null;
}

export interface Skip {
  size: string;
  price: number;
  disabled: boolean;
}

export interface BookingPayload {
  postcode: string;
  addressId?: string;
  manualAddress?: string;
  heavyWaste: boolean;
  plasterboard: boolean;
  plasterboardOption?: PlasterboardOption | null;
  skipSize: string;
  price: number;
}

export interface BookingConfirmation {
  status: 'success' | 'error';
  bookingId?: string;
  message?: string;
}

export type PostcodeFixture = 'SW1A 1AA' | 'EC1A 1BB' | 'M1 1AE' | 'BS1 4DJ' | string;

export enum Step {
  POSTCODE = 'POSTCODE',
  WASTE_TYPE = 'WASTE_TYPE',
  SKIP_SELECTION = 'SKIP_SELECTION',
  REVIEW = 'REVIEW',
}
