/**
 * Shiprocket Logistics Integration Service for ZIMOR
 * Official API Integration for Sandbox & Production Environments
 */

import dotenv from 'dotenv';
import path from 'path';

// Ensure backend .env is loaded
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config();

export interface ShiprocketCredentials {
  email: string;
  password: string;
  baseUrl: string;
  env: 'sandbox' | 'production';
}

export interface ServiceabilityParams {
  pickupPostcode: string;
  deliveryPostcode: string;
  weight: number; // in kg
  cod: boolean;
  declaredValue?: number;
}

export interface AvailableCourier {
  courierCompanyId: number;
  courierName: string;
  rate: number;
  etd: string;
  estimatedDeliveryDays: number;
  codAvailable: boolean;
  rating?: number;
}

export interface ServiceabilityResult {
  serviceable: boolean;
  availableCouriers: AvailableCourier[];
  recommendedCourier?: AvailableCourier;
  pickupPostcode: string;
  deliveryPostcode: string;
  message?: string;
  raw?: any;
}

export interface CreateShipmentItem {
  name: string;
  sku: string;
  units: number;
  sellingPrice: number;
  discount?: number;
  tax?: number;
  hsn?: number | string;
}

export interface CreateShipmentParams {
  orderNumber: string;
  orderDate: string; // YYYY-MM-DD HH:mm:ss or ISO
  pickupLocation: string; // Nickname configured in Shiprocket
  customerName: string;
  customerLastName?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  items: CreateShipmentItem[];
  paymentMethod: 'Prepaid' | 'COD';
  subtotal: number;
  shippingCharges?: number;
  discount?: number;
  total: number;
  length?: number; // cm
  breadth?: number; // cm
  height?: number; // cm
  weight?: number; // kg
  isTestOrder?: boolean;
  comment?: string;
}

export interface TrackingScanItem {
  date: string;
  status: string;
  activity: string;
  location: string;
}

export interface TrackingResult {
  awb: string;
  currentStatus: string;
  currentStatusCode?: number;
  courierName: string;
  pickupDate?: string;
  deliveredDate?: string;
  etd?: string;
  scans: TrackingScanItem[];
  raw?: any;
}

class ShiprocketService {
  private token: string | null = null;
  private tokenExpiresAt: number = 0; // timestamp ms
  private primaryPickupLocation: string | null = null;

  /**
   * Order creation permission in Shiprocket
   * Allows automatic order creation in New Orders for manual Ship Now processing
   */
  public isOrderCreationEnabled(): boolean {
    return process.env.SHIPROCKET_ORDER_CREATION_ENABLED !== 'false';
  }

  /**
   * Shipment mutation lock: Courier booking, AWB assignment, pickup scheduling, cancellation
   * Kept strictly disabled until manually approved
   */
  public isShipmentBookingEnabled(orderNumber?: string): boolean {
    if (process.env.SHIPROCKET_MUTATIONS_ENABLED === 'true') {
      return true;
    }
    const authorizedOrder = (process.env.SHIPROCKET_AUTHORIZED_TEST_ORDER || '').trim().toUpperCase();
    if (authorizedOrder && orderNumber && orderNumber.trim().toUpperCase() === authorizedOrder) {
      return true;
    }
    return false;
  }

  /**
   * Backwards-compatible alias for shipment booking mutations
   */
  public isMutationsEnabled(orderNumber?: string): boolean {
    return this.isShipmentBookingEnabled(orderNumber);
  }

  public get config(): ShiprocketCredentials {
    return {
      email: (process.env.SHIPROCKET_API_EMAIL || '').trim(),
      password: (process.env.SHIPROCKET_API_PASSWORD || '').trim(),
      baseUrl: (process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in/v1/external').replace(/\/$/, ''),
      env: (process.env.SHIPROCKET_ENV as any) === 'production' ? 'production' : 'sandbox',
    };
  }

  /**
   * Authenticate and obtain JWT Bearer Token
   * Tokens are valid for 10 days; we cache and automatically refresh at 9 days
   */
  public async getAuthToken(forceRefresh = false): Promise<string> {
    const { email, password, baseUrl } = this.config;

    if (!email || !password) {
      throw new Error(
        'Shiprocket API credentials are not configured. Please verify SHIPROCKET_API_EMAIL and SHIPROCKET_API_PASSWORD in backend/.env'
      );
    }

    const now = Date.now();
    // Return cached token if valid for at least 1 more hour
    if (!forceRefresh && this.token && this.tokenExpiresAt > now + 3600 * 1000) {
      return this.token;
    }

    try {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as any;

      if (!response.ok || !data.token) {
        const errorMsg = data.message || (data.errors ? JSON.stringify(data.errors) : `HTTP ${response.status}`);
        throw new Error(`Shiprocket API authentication failed (${response.status}): ${errorMsg}`);
      }

      this.token = data.token;
      // Shiprocket tokens expire in 10 days (240 hours). Refresh at 9 days.
      this.tokenExpiresAt = now + 9 * 24 * 60 * 60 * 1000;
      return this.token as string;
    } catch (err: any) {
      this.token = null;
      this.tokenExpiresAt = 0;
      throw err;
    }
  }

  /**
   * Helper to make authenticated requests with automatic retry on 401
   */
  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAuthToken();
    const url = endpoint.startsWith('http') ? endpoint : `${this.config.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    let response = await fetch(url, { ...options, headers });

    // Handle token expiration / 401
    if (response.status === 401) {
      const freshToken = await this.getAuthToken(true);
      headers['Authorization'] = `Bearer ${freshToken}`;
      response = await fetch(url, { ...options, headers });
    }

    const data: any = await response.json().catch(() => ({}));

    if (!response.ok) {
      const msg = data.message || (data.errors ? JSON.stringify(data.errors) : `HTTP Error ${response.status}`);
      const error: any = new Error(msg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data as T;
  }

  /**
   * Test connection and retrieve account/session health
   */
  public async checkConnection(): Promise<{
    connected: boolean;
    environment: string;
    baseUrl: string;
    accountEmail: string;
    orderCreationEnabled: boolean;
    shipmentBookingEnabled: boolean;
    mutationsEnabled: boolean;
    pickupLocationsCount?: number;
    primaryPickupLocation?: string;
    error?: string;
  }> {
    try {
      await this.getAuthToken();
      const pickupData = await this.getPickupLocations().catch(() => ({ data: { shipping_address: [] } }));
      const addresses = pickupData?.data?.shipping_address || [];
      const primary = addresses[0]?.pickup_location || 'warehouse';
      this.primaryPickupLocation = primary;

      return {
        connected: true,
        environment: this.config.env,
        baseUrl: this.config.baseUrl,
        accountEmail: this.config.email,
        orderCreationEnabled: this.isOrderCreationEnabled(),
        shipmentBookingEnabled: this.isShipmentBookingEnabled(),
        mutationsEnabled: this.isShipmentBookingEnabled(),
        pickupLocationsCount: addresses.length,
        primaryPickupLocation: primary,
      };
    } catch (err: any) {
      return {
        connected: false,
        environment: this.config.env,
        baseUrl: this.config.baseUrl,
        accountEmail: this.config.email,
        orderCreationEnabled: this.isOrderCreationEnabled(),
        shipmentBookingEnabled: this.isShipmentBookingEnabled(),
        mutationsEnabled: this.isShipmentBookingEnabled(),
        error: err.message,
      };
    }
  }

  /**
   * Fetch registered pickup addresses from Shiprocket panel
   */
  public async getPickupLocations(): Promise<any> {
    return this.request('/settings/company/pickup');
  }

  /**
   * Determine primary pickup location nickname and pincode
   */
  public async getPrimaryPickupDetails(): Promise<{ nickname: string; pincode: string }> {
    if (this.primaryPickupLocation) {
      return { nickname: this.primaryPickupLocation, pincode: '221103' };
    }

    try {
      const res = await this.getPickupLocations();
      const addresses = res?.data?.shipping_address || [];
      if (addresses.length > 0) {
        const addr = addresses[0];
        const nickname = addr.pickup_location || addr.address_name || 'Primary';
        const pincode = String(addr.pin_code || addr.pincode || '221103');
        this.primaryPickupLocation = nickname;
        return { nickname, pincode };
      }
    } catch {
      // Fallback to default
    }

    return { nickname: 'Primary', pincode: '221103' };
  }

  /**
   * Check Courier Serviceability & Shipping Rates
   */
  public async checkServiceability(params: ServiceabilityParams): Promise<ServiceabilityResult> {
    const { pickupPostcode, deliveryPostcode, weight, cod, declaredValue } = params;

    const query = new URLSearchParams({
      pickup_postcode: pickupPostcode.trim(),
      delivery_postcode: deliveryPostcode.trim(),
      weight: String(Math.max(0.1, Number(weight) || 0.7)),
      cod: cod ? '1' : '0',
    });

    if (declaredValue) {
      query.append('declared_value', String(declaredValue));
    }

    const endpoint = `/courier/serviceability/?${query.toString()}`;
    const data = await this.request(endpoint);

    const companies = data?.data?.available_courier_companies || [];
    const availableCouriers: AvailableCourier[] = companies.map((c: any) => ({
      courierCompanyId: c.courier_company_id,
      courierName: c.courier_name,
      rate: Number(c.rate) || 0,
      etd: c.etd || '2-4 Days',
      estimatedDeliveryDays: Number(c.estimated_delivery_days) || 3,
      codAvailable: Boolean(c.cod),
      rating: Number(c.rating) || 4.5,
    }));

    // Find recommended courier (lowest rate among top-rated, or recommended flag)
    let recommended: AvailableCourier | undefined = availableCouriers[0];
    if (data?.data?.recommended_courier_company_id) {
      const recId = data.data.recommended_courier_company_id;
      recommended = availableCouriers.find((c) => c.courierCompanyId === recId) || recommended;
    }

    return {
      serviceable: availableCouriers.length > 0,
      availableCouriers,
      recommendedCourier: recommended,
      pickupPostcode,
      deliveryPostcode,
      message: availableCouriers.length > 0 ? 'Serviceable' : 'Pincode not serviceable with standard couriers',
      raw: data,
    };
  }

  /**
   * Create an adhoc order/shipment in Shiprocket
   */
  public async createShipment(params: CreateShipmentParams): Promise<{
    orderId: string | number;
    shipmentId: number;
    status: string;
    statusCode: number;
    raw: any;
  }> {
    if (!this.isOrderCreationEnabled()) {
      throw new Error(
        'Shiprocket order creation is currently disabled (SHIPROCKET_ORDER_CREATION_ENABLED=false).'
      );
    }
    const {
      orderNumber,
      orderDate,
      pickupLocation,
      customerName,
      customerLastName = '',
      addressLine1,
      addressLine2 = '',
      city,
      state,
      pincode,
      phone,
      email,
      items,
      paymentMethod,
      subtotal,
      shippingCharges = 0,
      discount = 0,
      total,
      length = 35,
      breadth = 28,
      height = 12,
      weight = 0.7,
      isTestOrder = false,
      comment,
    } = params;

    // Format order date to "YYYY-MM-DD HH:mm:ss"
    let formattedDate: string;
    try {
      const d = new Date(orderDate);
      if (isNaN(d.getTime())) throw new Error();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      formattedDate = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    } catch {
      formattedDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
    }

    const shiprocketOrderId =
      isTestOrder && !orderNumber.startsWith('TEST-') ? `TEST-${orderNumber}` : orderNumber;

    const defaultComment = isTestOrder
      ? '[TEST ORDER - DO NOT DISPATCH] Verified via Razorpay Test Mode. Real money not collected.'
      : 'ZIMOR Luxury Order';

    const payload = {
      order_id: shiprocketOrderId,
      order_date: formattedDate,
      pickup_location: pickupLocation || this.primaryPickupLocation || 'warehouse',
      channel_id: '',
      comment: comment || defaultComment,
      billing_customer_name: customerName,
      billing_last_name: customerLastName,
      billing_address: addressLine1,
      billing_address_2: addressLine2,
      billing_city: city,
      billing_pincode: pincode,
      billing_state: state,
      billing_country: 'India',
      billing_email: email,
      billing_phone: phone.replace(/\D/g, '').slice(-10) || '9876543210',
      shipping_is_billing: true,
      order_items: items.map((it) => ({
        name: it.name,
        sku: it.sku || `SKU-${it.name.replace(/\s+/g, '-').toUpperCase()}`,
        units: it.units,
        selling_price: it.sellingPrice,
        discount: it.discount || 0,
        tax: it.tax || 0,
        hsn: it.hsn || 4202, // 4202 = Handbags, leather cases
      })),
      payment_method: paymentMethod, // 'Prepaid' or 'COD'
      shipping_charges: shippingCharges,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: discount,
      sub_total: subtotal,
      length: Math.max(10, Math.round(length)),
      breadth: Math.max(10, Math.round(breadth)),
      height: Math.max(5, Math.round(height)),
      weight: Math.max(0.1, Number(weight.toFixed(2))),
    };

    const data = await this.request('/orders/create/adhoc', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      orderId: data.order_id,
      shipmentId: data.shipment_id,
      status: data.status || 'NEW',
      statusCode: data.status_code || 1,
      raw: data,
    };
  }

  /**
   * Assign courier and generate Air Waybill (AWB) code
   */
  public async assignAwb(params: {
    shipmentId: number;
    courierId?: number;
    orderNumber?: string;
  }): Promise<{
    awbCode: string;
    courierName: string;
    courierCompanyId: number;
    shipmentId: number;
    raw: any;
  }> {
    if (!this.isShipmentBookingEnabled(params.orderNumber)) {
      throw new Error(
        `Courier booking and AWB assignment are locked for safety (SHIPROCKET_MUTATIONS_ENABLED=false). Real shipment dispatch must be manually authorized via the Shiprocket Dashboard.`
      );
    }
    const payload: Record<string, any> = {
      shipment_id: params.shipmentId,
    };
    if (params.courierId) {
      payload.courier_id = params.courierId;
    }

    const data = await this.request('/courier/assign/awb', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const responseData = data?.response?.data || data;
    const awbCode = responseData?.awb_code || data?.awb_code;
    const courierName = responseData?.courier_name || data?.courier_name || 'Courier Partner';
    const courierCompanyId = responseData?.courier_company_id || params.courierId || 0;

    if (!awbCode) {
      const message = data?.message || responseData?.message || 'Failed to assign AWB from Shiprocket';
      throw new Error(message);
    }

    return {
      awbCode,
      courierName,
      courierCompanyId,
      shipmentId: params.shipmentId,
      raw: data,
    };
  }

  /**
   * Generate downloadable / printable shipping label URL
   */
  public async generateLabel(shipmentId: number): Promise<{
    labelUrl: string;
    labelCreated: boolean;
    raw: any;
  }> {
    const data = await this.request('/courier/generate/label', {
      method: 'POST',
      body: JSON.stringify({
        shipment_id: [shipmentId],
      }),
    });

    const labelUrl = data?.label_url || data?.response?.label_url || '';
    return {
      labelUrl,
      labelCreated: Boolean(data?.label_created ?? labelUrl),
      raw: data,
    };
  }

  /**
   * Track shipment by AWB code
   */
  public async trackByAwb(awbCode: string): Promise<TrackingResult> {
    const cleanAwb = awbCode.trim();
    const data = await this.request(`/courier/track/awb/${cleanAwb}`);

    const trackData = data?.tracking_data || data;
    const shipmentTrack = trackData?.shipment_track?.[0] || trackData;
    const activities = trackData?.shipment_track_activities || trackData?.scans || [];

    const scans: TrackingScanItem[] = activities.map((act: any) => ({
      date: act.date || act['activity-date'] || new Date().toISOString(),
      status: act.status || act['current-status'] || 'UPDATE',
      activity: act.activity || act['activity-details'] || act.location || 'Package in transit',
      location: act.location || act.city || '',
    }));

    return {
      awb: cleanAwb,
      currentStatus: shipmentTrack?.current_status || trackData?.current_status || 'IN TRANSIT',
      currentStatusCode: Number(shipmentTrack?.current_status_id || trackData?.current_status_id) || undefined,
      courierName: shipmentTrack?.courier_name || trackData?.courier_name || '',
      pickupDate: shipmentTrack?.pickup_date,
      deliveredDate: shipmentTrack?.delivered_date,
      etd: shipmentTrack?.etd || trackData?.etd,
      scans,
      raw: data,
    };
  }

  /**
   * Track shipment by Shiprocket shipment ID
   */
  public async trackByShipmentId(shipmentId: number): Promise<TrackingResult> {
    const data = await this.request(`/courier/track/shipment/${shipmentId}`);
    const trackData = data?.tracking_data || data;
    const shipmentTrack = trackData?.shipment_track?.[0] || trackData;
    const activities = trackData?.shipment_track_activities || trackData?.scans || [];

    const scans: TrackingScanItem[] = activities.map((act: any) => ({
      date: act.date || act['activity-date'] || new Date().toISOString(),
      status: act.status || act['current-status'] || 'UPDATE',
      activity: act.activity || act['activity-details'] || act.location || 'Package in transit',
      location: act.location || act.city || '',
    }));

    return {
      awb: shipmentTrack?.awb_code || trackData?.awb || '',
      currentStatus: shipmentTrack?.current_status || trackData?.current_status || 'IN TRANSIT',
      currentStatusCode: Number(shipmentTrack?.current_status_id || trackData?.current_status_id) || undefined,
      courierName: shipmentTrack?.courier_name || trackData?.courier_name || '',
      pickupDate: shipmentTrack?.pickup_date,
      deliveredDate: shipmentTrack?.delivered_date,
      etd: shipmentTrack?.etd || trackData?.etd,
      scans,
      raw: data,
    };
  }

  /**
   * Cancel shipment in Shiprocket
   */
  public async cancelOrders(shiprocketOrderIds: number[]): Promise<any> {
    if (!this.isMutationsEnabled()) {
      throw new Error(
        'Shiprocket real-account mutations (order cancellation) are locked for safety. Set SHIPROCKET_MUTATIONS_ENABLED=true in backend/.env only when authorized.'
      );
    }
    return this.request('/orders/cancel', {
      method: 'POST',
      body: JSON.stringify({ ids: shiprocketOrderIds }),
    });
  }

  /**
   * Utility to parse physical dimensions & weight from product data
   */
  public parseProductDimensions(dimensions?: any): {
    length: number;
    breadth: number;
    height: number;
    weight: number;
  } {
    // Default luxury handbag packaging size (cm & kg)
    const defaults = { length: 35, breadth: 28, height: 12, weight: 0.7 };

    if (!dimensions) return defaults;

    const extractNumber = (val: any, fallback: number): number => {
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const match = val.match(/([\d.]+)/);
        if (match && !isNaN(parseFloat(match[1]))) {
          return parseFloat(match[1]);
        }
      }
      return fallback;
    };

    return {
      length: extractNumber(dimensions.length, defaults.length),
      breadth: extractNumber(dimensions.width || dimensions.breadth, defaults.breadth),
      height: extractNumber(dimensions.height, defaults.height),
      weight: extractNumber(dimensions.weight, defaults.weight),
    };
  }
}

export const shiprocket = new ShiprocketService();
