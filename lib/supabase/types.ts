export type UserRole = 'customer' | 'staff' | 'admin';

export type User = {
  id: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  role: UserRole;
  created_at: string;
};

export type Room = {
  id: string;
  name: string;
  slug: string;
  min_pax: number;
  max_pax: number;
  price_per_hour: number;
  description: string | null;
  image_url?: string | null;
  created_at: string;
};

export type MenuCategoryType = 'food' | 'drink';

export type MenuCategory = {
  id: string;
  name: string;
  type: MenuCategoryType;
  display_order: number;
};

export type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_seasonal: boolean;
  only_for_rooms: boolean;
  created_at: string;
};

export type BookingStatus = 'pending_payment' | 'confirmed';

export type Booking = {
  id: string;
  user_id: string;
  room_id: string;
  date: string;
  start_time: string;
  duration_hours: number;
  guest_count: number;
  total_price: number;
  status: BookingStatus;
  razorpay_order_id: string | null;
  created_at: string;
};

export type BookingFoodItem = {
  id: string;
  booking_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
};

export type OrderType = 'takeaway' | 'delivery';
export type OrderStatus = 'placed' | 'preparing' | 'ready' | 'dispatched' | 'collected';

export type Order = {
  id: string;
  user_id: string;
  type: OrderType;
  status: OrderStatus;
  total_price: number;
  delivery_address: string | null;
  razorpay_order_id: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
};

export type SlotLock = {
  id: string;
  room_id: string;
  date: string;
  start_time: string;
  duration_hours: number;
  locked_at: string;
  expires_at: string;
  locked_by: string | null;
};

export type BlockedSlot = {
  id: string;
  room_id: string;
  date: string;
  start_time: string;
  duration_hours: number;
  reason: string | null;
  created_by: string | null;
  created_at: string;
};
