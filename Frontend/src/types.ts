export type LoadStatus = "POSTED" | "OPEN_FOR_BIDS" | "BOOKED" | "CANCELLED" | string;
export type BidStatus = "PENDING" | "ACCEPTED" | "REJECTED" | string;

export interface Load {
  id: string;
  shipperId?: string;
  origin?: string;
  pickupLocation?: string;
  destination?: string;
  deliveryLocation?: string;
  cargoType?: string;
  cargo?: string;
  weight?: number;
  weightUnit?: string;
  price?: number;
  pickupDate?: string;
  deliveryDate?: string;
  trucksRequired?: number;
  remainingTrucks?: number;
  truckType?: string;
  status?: LoadStatus;
  datePosted?: string;
  [key: string]: unknown;
}
export interface Bid {
  id: string;
  loadId?: string;
  transporterId?: string;
  transporterName?: string;
  proposedRate?: number;
  trucksOffered?: number;
  truckType?: string;
  status?: BidStatus;
  rating?: number;
  score?: number;
  submittedAt?: string;
  [key: string]: unknown;
}
export interface Booking {
  id: string;
  loadId?: string;
  bidId?: string;
  transporterId?: string;
  allocatedTrucks?: number;
  finalRate?: number;
  status?: string;
  bookedAt?: string;
  [key: string]: unknown;
}
export interface Truck {
  id?: string;
  truckType: string;
  count: number;
  [key: string]: unknown;
}
export interface Transporter {
  id: string;
  companyName?: string;
  rating?: number;
  trucks?: Truck[];
  [key: string]: unknown;
}