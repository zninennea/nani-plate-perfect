export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked-up' | 'on-the-way' | 'delivered';
  customerInfo: {
    name: string;
    phone: string;
    address: string;
  };
  driverId?: string;
  createdAt: Date;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  rating: number;
  isAvailable: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
  };
}

export interface Review {
  id: string;
  orderId: string;
  driverRating: number;
  foodRating: number;
  comment: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
  type: 'user' | 'driver';
}

export type UserRole = 'owner' | 'customer' | 'driver';