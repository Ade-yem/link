export type Tuple<T, MaxLength extends number = 10, Current extends T[] = []> = Current["length"] extends MaxLength
  ? Current
  : Current | Tuple<T, MaxLength, [T, ...Current]>;

export interface Vendor {
  ipfsDetails: string;
  account: string;
  totalMoney: bigint;
  flagged: boolean;
}
export interface Customer {
  ipfsDetails: string;
  account: string;
}

export interface Details {
  name: string;
  walletAddress: string;
  picture: string;
  service: string;
}

export interface Profile {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: "customer" | "vendor" | undefined;
  picture: string;
  service?: string;
  file1?: string;
  file2?: string;
  file3?: string;
  walletAddress: string;
}

export interface Preview {
  user1: string;
  user2: string;
  room: string;
  room_hash: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  receiver: string;
  message: string;
  imageURI?: string;
  timestamp?: Date;
  room?: string;
}

export const DIVISOR = 10n ** 18n;
