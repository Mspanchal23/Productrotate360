const BASE = "/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data as T;
}

// Auth
export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    request("/users/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request("/users/login", { method: "POST", body: JSON.stringify(body) }),
  getProfile: () => request("/users/profile"),
};

// Products
export const productApi = {
  getAll: (params?: string) =>
    request<{
      products: Product[];
      page: number;
      pages: number;
      total: number;
    }>(`/products${params ? `?${params}` : ""}`),
  getOne: (id: string) => request<Product>(`/products/${id}`),
  create: (formData: FormData) =>
    request<{ message: string; product: Product }>("/products", {
      method: "POST",
      body: formData,
    }),
  update: (id: string, body: Partial<Product>) =>
    request<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: (id: string) =>
    request(`/products/${id}`, { method: "DELETE" }),
  getStatus: (id: string) =>
    request<{ status: string; frameCount: number }>(`/products/${id}/status`),
};

// Reviews
export const reviewApi = {
  getForProduct: (productId: string, params?: string) =>
    request<{
      reviews: Review[];
      page: number;
      pages: number;
      total: number;
      ratingDistribution: Record<number, number>;
    }>(`/reviews/${productId}${params ? `?${params}` : ""}`),
  create: (
    productId: string,
    body: { rating: number; title: string; comment: string }
  ) =>
    request<Review>(`/reviews/${productId}`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  delete: (id: string) =>
    request(`/reviews/${id}`, { method: "DELETE" }),
  markHelpful: (id: string) =>
    request(`/reviews/${id}/helpful`, { method: "PATCH" }),
};

// Types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  videoPath: string;
  frames: { index: number; path: string; width: number; height: number }[];
  frameCount: number;
  thumbnail: string;
  processingStatus: "pending" | "processing" | "completed" | "failed";
  hotspots: {
    frameIndex: number;
    x: number;
    y: number;
    label: string;
    description: string;
  }[];
  averageRating: number;
  reviewCount: number;
  user: { _id: string; name: string; avatar: string };
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  product: string;
  user: { _id: string; name: string; avatar: string };
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}
