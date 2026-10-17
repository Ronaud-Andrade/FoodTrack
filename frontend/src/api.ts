export type User = {
  id: number;
  username: string;
  nome: string;
  email: string;
  perfil: string;
  restaurante: number | null;
  is_superuser: boolean;
};

export type Restaurant = {
  id: number;
  nome: string;
  cnpj: string;
};

export type FoodItem = {
  id: number;
  nome: string;
  categoria: string;
  medida: string;
  restaurante: number;
};

export type StockItem = {
  id: number;
  alimento: number;
  qntd_atual: string;
  entrada: string;
  saida: string | null;
  localizacao: string;
  validade: string | null;
};

export type WasteRecord = {
  id: number;
  descricao: string;
  quantidade: string;
  data: string;
  estoque: number;
  usuario: number;
};

const configuredApiUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");
const API_URL = configuredApiUrl.startsWith("/")
  ? configuredApiUrl
  : configuredApiUrl.endsWith("/api")
    ? configuredApiUrl
    : `${configuredApiUrl}/api`;

export function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function localDateOffset(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return localDateString(date);
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, token?: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/${path.replace(/^\/+/, "")}`, {
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Token ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(`Não foi possível acessar a API em ${API_URL}. Confira se o servidor de desenvolvimento e o backend estão ativos.`, 0);
  }

  if (response.status === 204) return undefined as T;

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof body === "object" && body !== null
      ? Object.entries(body).map(([field, value]) => {
        const text = Array.isArray(value) ? value.join(" ") : String(value);
        return field === "detail" ? text : `${field}: ${text}`;
      }).join(" ")
      : `A API respondeu com o status ${response.status}.`;
    throw new ApiError(message || `A API respondeu com o status ${response.status}.`, response.status);
  }

  return body as T;
}

export function login(username: string, password: string) {
  return request<{ token: string }>("token/", undefined, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function getResources(token: string) {
  return Promise.all([
    request<User[]>("usuarios/", token),
    request<Restaurant[]>("restaurantes/", token),
    request<FoodItem[]>("alimentos/", token),
    request<StockItem[]>("estoques/", token),
    request<WasteRecord[]>("desperdicios/", token),
  ]).then(([users, restaurants, foods, stocks, waste]) => ({
    users,
    restaurants,
    foods,
    stocks,
    waste,
  }));
}

export function createFood(token: string, data: Pick<FoodItem, "nome" | "categoria" | "medida"> & { restaurante?: number }) {
  return request<FoodItem>("alimentos/", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function createStock(token: string, data: Omit<StockItem, "id" | "saida">) {
  return request<StockItem>("estoques/", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateStock(token: string, id: number, data: Partial<Omit<StockItem, "id">>) {
  return request<StockItem>(`estoques/${id}/`, token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function createWaste(token: string, data: Pick<WasteRecord, "descricao" | "quantidade" | "data" | "estoque">) {
  return request<WasteRecord>("desperdicios/", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function createUser(token: string, data: Pick<User, "username" | "nome" | "email" | "perfil"> & { password: string; restaurante?: number }) {
  return request<User>("usuarios/", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateRestaurant(token: string, id: number, data: Pick<Restaurant, "nome" | "cnpj">) {
  return request<Restaurant>(`restaurantes/${id}/`, token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
