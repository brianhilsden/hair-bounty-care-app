import { api, ApiResponse } from '../api';

export interface ProductCategory {
  id: string;
  name: string;
  iconUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // KES
  imageUrls: string[];
  productType: 'DIY_INGREDIENT' | 'READY_MADE' | 'HAIR_BOUNTY_OWN';
  priceRange: 'BUDGET' | 'MID_RANGE' | 'PREMIUM';
  categoryId: string;
  category: ProductCategory;
  isEcoCertified: boolean;
  isZeroWaste: boolean;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  affiliateUrl?: string;
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  paymentRef?: string;
  paymentMethod?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: Product;
  }[];
}

export const productsApi = {
  async getCategories(): Promise<ApiResponse<ProductCategory[]>> {
    const response = await api.get('/products/categories');
    return response.data;
  },

  async getProducts(params?: {
    categoryId?: string; productType?: string; priceRange?: string;
    isEcoCertified?: boolean; isZeroWaste?: boolean;
    search?: string; page?: number; limit?: number;
  }): Promise<ApiResponse<Product[]>> {
    const response = await api.get('/products', { params });
    return response.data;
  },

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async createOrder(data: {
    items: { productId: string; quantity: number }[];
    deliveryAddress: string;
    deliveryNotes?: string;
    paymentMethod: string;
    paymentRef?: string;
  }): Promise<ApiResponse<Order>> {
    const response = await api.post('/products/orders', data);
    return response.data;
  },

  async getOrders(): Promise<ApiResponse<Order[]>> {
    const response = await api.get('/products/orders');
    return response.data;
  },

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    const response = await api.get(`/products/orders/${id}`);
    return response.data;
  },
};
