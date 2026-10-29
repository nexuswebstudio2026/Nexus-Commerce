export type UserRole = 'superadmin' | 'business_owner' | 'employee' | 'customer' | 'supplier';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  // Multi-tenancy association IDs
  businessIds: string[]; // Businesses this user is connected to
  activeBusinessId: string; // Currently active selected business context
  password?: string; // Optional user password for authentication
  permissions?: EmployeePermission[]; // Granular permissions if employee
  phone?: string;
  bio?: string;
  twoFactorEnabled?: boolean;
}

export type EmployeePermission = 
  | 'view_analytics'
  | 'manage_catalog'
  | 'manage_orders'
  | 'manage_inventory'
  | 'manage_employees'
  | 'customer_support';

export interface Business {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  logo: string;
  logoUrl?: string;
  city?: string;
  status: 'active' | 'pending' | 'suspended';
  commissionRate: number; // e.g., 5% platform fee
  createdDate: string;
  currency: string;
  rating: number;
}

export interface ProductService {
  id: string;
  businessId: string;
  title: string;
  type: 'product' | 'service';
  category: string;
  sku: string;
  description: string;
  retailPrice: number; // Set by Business Owner
  promoPrice?: number; // Optional promotion price
  isPromo?: boolean;
  stockQuantity: number; // Restocked by Supplier or Business Owner
  supplierCost: number; // Cost price set by Supplier
  supplierId?: string; // ID of supplier providing this item
  supplierName?: string;
  image: string;
  status: 'active' | 'out_of_stock' | 'archived';
  unit: string;
}

export interface SupplierRestockRecord {
  id: string;
  supplierId: string;
  supplierName: string;
  businessId: string;
  businessName: string;
  productId: string;
  productTitle: string;
  unitsAdded: number;
  costPrice: number;
  totalCost: number;
  date: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  image: string;
  businessId: string;
}

export interface Order {
  id: string;
  businessId: string;
  businessName: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  paymentMethod: 'credit_card' | 'bank_transfer' | 'crypto' | 'apple_pay';
  createdAt: string;
  assignedEmployeeId?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetTenant: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface AppNotification {
  id: string;
  type: 'order' | 'inventory' | 'tenant' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: 'info' | 'warning' | 'success' | 'alert';
  linkTo?: string;
  businessId?: string;
}

