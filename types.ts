export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}
