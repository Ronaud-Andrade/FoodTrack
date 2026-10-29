import type { FoodItem, Restaurant, StockItem, User, WasteRecord } from "../api";

export type ExpiringFood = {
  id: number;
  name: string;
  category: string;
  categoryClass: string;
  expiry: string;
  critical: boolean;
  location: string;
  amount: string;
};

export type PageProps = {
  page: string;
  navigate: (page: string) => void;
  notify: (message: string) => void;
  openWaste: (stockId?: number) => void;
  user: User;
  restaurants: Restaurant[];
  users: User[];
  token: string;
  foods: FoodItem[];
  stocks: StockItem[];
  waste: WasteRecord[];
  saveFood: (data: { nome: string; categoria: string; medida: string; quantidade: string; validade: string; localizacao: string; restaurante?: number }) => Promise<void>;
  saveStock: (id: number, data: Partial<Omit<StockItem, "id">>) => Promise<void>;
  saveWaste: (data: { motivo: string; descricao: string; quantidade: string; data: string; estoque: number }) => Promise<void>;
  saveUser: (data: { username: string; nome: string; email: string; perfil: string; password: string; restaurante?: number }) => Promise<void>;
  saveRestaurant: (id: number, data: { nome: string; cnpj: string; dias_alerta_validade: number }) => Promise<void>;
};
