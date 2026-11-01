// Centralized API Client with token management

const TOKEN_KEY = 'artvault_jwt_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.error('Failed to update localStorage token', e);
  }
}

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const targetUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const response = await fetch(targetUrl, {
    ...options,
    credentials: 'include',
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data: any;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = data && typeof data === 'object' && data.error ? data.error : `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (payload: { email: string; password: string; fullName: string; role?: string }) =>
    apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => apiRequest('/api/auth/me'),
  demoSwitch: (targetRole: 'admin' | 'buyer') =>
    apiRequest('/api/auth/demo-switch', { method: 'POST', body: JSON.stringify({ targetRole }) }),

  // Artworks
  getArtworks: (params: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        query.append(key, String(val));
      }
    });
    return apiRequest(`/api/artworks?${query.toString()}`);
  },
  getArtwork: (idOrSlug: string | number) => apiRequest(`/api/artworks/${idOrSlug}`),
  createArtwork: (data: any) => apiRequest('/api/artworks', { method: 'POST', body: JSON.stringify(data) }),
  updateArtwork: (id: number, data: any) => apiRequest(`/api/artworks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteArtwork: (id: number) => apiRequest(`/api/artworks/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => apiRequest('/api/categories'),
  createCategory: (data: any) => apiRequest('/api/categories', { method: 'POST', body: JSON.stringify(data) }),

  // Cart
  getCart: () => apiRequest('/api/cart'),
  addToCart: (artworkId: number, licenseTier: 'personal' | 'commercial') =>
    apiRequest('/api/cart', { method: 'POST', body: JSON.stringify({ artworkId, licenseTier }) }),
  updateCartLicense: (artworkId: number, licenseTier: 'personal' | 'commercial') =>
    apiRequest(`/api/cart/${artworkId}`, { method: 'PATCH', body: JSON.stringify({ licenseTier }) }),
  removeFromCart: (artworkId: number) => apiRequest(`/api/cart/${artworkId}`, { method: 'DELETE' }),
  clearCart: () => apiRequest('/api/cart', { method: 'DELETE' }),

  // Wishlist
  getWishlist: () => apiRequest('/api/wishlist'),
  toggleWishlist: (artworkId: number) =>
    apiRequest('/api/wishlist/toggle', { method: 'POST', body: JSON.stringify({ artworkId }) }),

  // Orders & Library
  checkout: (billingInfo: { billingName: string; billingEmail: string; paymentMethod?: string }) =>
    apiRequest('/api/orders/checkout', { method: 'POST', body: JSON.stringify(billingInfo) }),
  getMyLibrary: () => apiRequest('/api/orders/my-library'),
  getCertificate: (orderItemId: number) => apiRequest(`/api/orders/certificate/${orderItemId}`),

  // Reviews
  getReviews: (artworkId: number) => apiRequest(`/api/reviews/${artworkId}`),
  addReview: (artworkId: number, rating: number, comment: string) =>
    apiRequest('/api/reviews', { method: 'POST', body: JSON.stringify({ artworkId, rating, comment }) }),

  // Admin
  getAdminStats: () => apiRequest('/api/admin/stats'),
  getAdminOrders: () => apiRequest('/api/admin/orders'),
};
