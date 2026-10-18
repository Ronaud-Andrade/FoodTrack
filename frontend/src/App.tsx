import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import WorkspacePage from "./Pages";
import foodTrackLogo from "./assets/foodtrack-logo.png";
import {
  ApiError,
  createUser,
  createFood,
  createStock,
  createWaste,
  formatQuantity,
  getResources,
  login,
  localDateOffset,
  localDateString,
  updateStock,
  type FoodItem,
  type Restaurant,
  type StockItem,
  type User,
  type WasteRecord,
  updateRestaurant,
} from "./api";

type IconName =
  | "alert" | "bell" | "box" | "calendar" | "chart" | "check"
  | "chevron" | "close" | "dashboard" | "help" | "menu" | "plus"
  | "search" | "settings" | "sparkle" | "trash" | "trend";

const paths: Record<IconName, ReactNode> = {
  alert: <><path d="M10.3 3.8 2.4 18a2 2 0 0 0 1.8 3h15.6a2 2 0 0 0 1.8-3L13.7 3.8a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  box: <><path d="m21 8-9 5-9-5 9-5z" /><path d="m3 8 9 5 9-5v9l-9 5-9-5zM12 13v9" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  chart: <><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  dashboard: <><path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 9h8V3h-8z" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.7 9a2.4 2.4 0 1 1 3.2 2.3c-.9.4-.9 1-.9 1.7M12 17h.01" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1A8 8 0 0 0 15 6l-.3-2.6h-4L10.4 6A8 8 0 0 0 9 7L6.6 6 4.5 9.5l2 1.5a7 7 0 0 0 0 2l-2 1.5L6.6 18 9 17a8 8 0 0 0 1.4 1l.3 2.6h4L15 18a8 8 0 0 0 1.5-1l2.4 1 2-3.5-2-1.5a7 7 0 0 0 .1-1Z" /></>,
  sparkle: <><path d="m12 3 1.4 4.1L17 9l-3.6 1.9L12 15l-1.4-4.1L7 9l3.6-1.9Z" /><path d="M19 15v6M16 18h6" /></>,
  trash: <><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7M14 10v7" /></>,
  trend: <><path d="m3 17 6-6 4 4 8-9" /><path d="M15 6h6v6" /></>,
};

function Icon({ name, size = 20, className = "" }: { name: IconName; size?: number; className?: string }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const navigation: { label: string; icon: IconName }[] = [
  { label: "Dashboard", icon: "dashboard" },
  { label: "Estoque", icon: "box" },
  { label: "Cadastrar Alimento", icon: "plus" },
  { label: "Desperdícios", icon: "trash" },
  { label: "Relatórios", icon: "chart" },
  { label: "Configurações", icon: "settings" },
];

export default function App() {
  const [active, setActive] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [wasteModal, setWasteModal] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [wasteForm, setWasteForm] = useState({ estoque: "", quantidade: "", descricao: "" });
  const [wasteError, setWasteError] = useState("");
  const [token, setToken] = useState(() => window.localStorage.getItem("foodtrack-token") || "");
  const [username, setUsername] = useState(() => window.localStorage.getItem("foodtrack-username") || "");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([]);

  const refreshResources = async (sessionToken = token, currentUsername = username) => {
    const resources = await getResources(sessionToken);
    setRestaurants(resources.restaurants);
    setUsers(resources.users);
    setFoodItems(resources.foods);
    setStockItems(resources.stocks);
    setWasteRecords(resources.waste);
    setUser(resources.users.find((item) => item.username === currentUsername) || resources.users[0] || null);
  };

  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoading(true);
    setLoadError("");
    getResources(token)
      .then((resources) => {
        if (!active) return;
        setRestaurants(resources.restaurants);
        setUsers(resources.users);
        setFoodItems(resources.foods);
        setStockItems(resources.stocks);
        setWasteRecords(resources.waste);
        const currentUser = resources.users.find((item) => item.username === username) || resources.users[0] || null;
        setUser(currentUser);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) {
          window.localStorage.removeItem("foodtrack-token");
          window.localStorage.removeItem("foodtrack-username");
          setToken("");
          setLoadError("Sua sessão expirou. Entre novamente.");
          return;
        }
        setLoadError(error instanceof Error ? error.message : "Não foi possível carregar os dados.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [token, username]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  };

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");
    try {
      const result = await login(username, password);
      window.localStorage.setItem("foodtrack-token", result.token);
      window.localStorage.setItem("foodtrack-username", username);
      setPassword("");
      setActive("Dashboard");
      setToken(result.token);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Não foi possível entrar.");
    }
  };

  const logout = () => {
    window.localStorage.removeItem("foodtrack-token");
    window.localStorage.removeItem("foodtrack-username");
    setToken("");
    setUser(null);
    setStockItems([]);
    setFoodItems([]);
    setWasteRecords([]);
    setRestaurants([]);
    setUsers([]);
    setActive("Dashboard");
  };

  const submitFood = async (data: { nome: string; categoria: string; medida: string; quantidade: string; validade: string; localizacao: string; restaurante?: number }) => {
    const food = await createFood(token, {
      nome: data.nome,
      categoria: data.categoria,
      medida: data.medida,
      ...(data.restaurante ? { restaurante: data.restaurante } : {}),
    });
    try {
      await createStock(token, {
        alimento: food.id,
        quantidade_atual: data.quantidade,
        entrada: localDateString(),
        localizacao: data.localizacao,
        validade: data.validade || null,
      });
    } catch (error) {
      let refreshMessage = "";
      try {
        await refreshResources();
      } catch (refreshError) {
        refreshMessage = ` A lista também não pôde ser atualizada: ${refreshError instanceof Error ? refreshError.message : "falha da API"}`;
      }
      throw new Error(`O alimento foi criado com ID ${food.id}, mas o estoque não foi salvo. Não repita o cadastro do alimento. Erro: ${error instanceof Error ? error.message : "falha da API"}.${refreshMessage}`);
    }
    try {
      await refreshResources();
    } catch (error) {
      throw new Error(`Alimento e estoque foram salvos, mas a atualização da tela falhou. Não repita o cadastro; recarregue os dados. Erro: ${error instanceof Error ? error.message : "falha da API"}`);
    }
  };

  const submitWaste = async (data: { descricao: string; quantidade: string; data: string; estoque: number }) => {
    await createWaste(token, data);
    try {
      await refreshResources();
    } catch (error) {
      throw new Error(`O desperdício foi salvo, mas a atualização da tela falhou. Não repita o registro; recarregue os dados. Erro: ${error instanceof Error ? error.message : "falha da API"}`);
    }
  };

  const saveStock = async (id: number, data: Partial<Omit<StockItem, "id">>) => {
    await updateStock(token, id, data);
    try {
      await refreshResources();
    } catch (error) {
      throw new Error(`O estoque foi salvo, mas a atualização da tela falhou. Recarregue os dados. Erro: ${error instanceof Error ? error.message : "falha da API"}`);
    }
  };

  const saveUser = async (data: { username: string; nome: string; email: string; perfil: string; password: string; restaurante?: number }) => {
    await createUser(token, data);
    try {
      await refreshResources();
    } catch (error) {
      throw new Error(`O usuário foi criado, mas a atualização da tela falhou. Não repita o cadastro. Erro: ${error instanceof Error ? error.message : "falha da API"}`);
    }
  };

  const saveRestaurant = async (id: number, data: { nome: string; cnpj: string }) => {
    await updateRestaurant(token, id, data);
    try {
      await refreshResources();
    } catch (error) {
      throw new Error(`O restaurante foi atualizado, mas a tela não pôde recarregar os dados. Erro: ${error instanceof Error ? error.message : "falha da API"}`);
    }
  };

  if (!token) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--canvas)] px-4">
        <form onSubmit={submitLogin} className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-white p-8 shadow-[var(--shadow)]">
          <img src={foodTrackLogo} alt="FoodTrack" className="mx-auto mb-6 h-24 w-48 object-contain" />
          <h1 className="text-2xl font-bold">Entrar no FoodTrack</h1>
          <p className="mt-2 text-sm text-[var(--muted-strong)]">Use suas credenciais do sistema para acessar os dados do restaurante.</p>
          <label className="mt-6 block"><span className="field-label">Usuário</span><input autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} className="field" /></label>
          <label className="mt-4 block"><span className="field-label">Senha</span><input autoComplete="current-password" required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="field" /></label>
          {(loginError || loadError) && <p role="alert" className="mt-4 rounded-lg bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">{loginError || loadError}</p>}
          <button type="submit" className="mt-6 min-h-11 w-full rounded-xl bg-[var(--brand)] font-bold text-white">Entrar</button>
        </form>
      </main>
    );
  }

  if (loading || !user) {
    return <main className="grid min-h-screen place-items-center bg-[var(--canvas)] p-6"><section className="max-w-xl rounded-2xl border border-[var(--line)] bg-white p-8 text-center"><h1 className="text-xl font-bold">{loading ? "Carregando dados do restaurante…" : "Não foi possível abrir sua conta"}</h1>{loadError && <p role="alert" className="mt-3 text-sm text-[var(--danger)]">{loadError}</p>}{!loading && <button onClick={logout} className="mt-5 min-h-11 rounded-xl bg-[var(--brand)] px-5 font-bold text-white">Voltar ao login</button>}</section></main>;
  }

  const foodById = new Map(foodItems.map((food) => [food.id, food]));
  const today = localDateString();
  const threeDaysFromToday = localDateOffset(3);
  const foodsExpiringToday = stockItems
    .filter((stock) => stock.validade && stock.validade <= threeDaysFromToday)
    .map((stock) => {
      const food = foodById.get(stock.alimento);
      if (!food) return null;
      const days = Math.ceil((new Date(`${stock.validade}T00:00:00`).getTime() - new Date(new Date().toDateString()).getTime()) / 86400000);
      const categoryClass = food.categoria.toLowerCase().includes("carne") ? "cat-red" : food.categoria.toLowerCase().includes("pesc") ? "cat-blue" : food.categoria.toLowerCase().includes("hort") ? "cat-green" : "cat-indigo";
      return {
        id: stock.id,
        name: food.nome,
        category: food.categoria.toUpperCase(),
        categoryClass,
        expiry: days < 0 ? "Vencido" : days === 0 ? "Vence hoje" : `Vence em ${days} dia(s)`,
        critical: days <= 1,
        location: stock.localizacao,
        amount: `${formatQuantity(stock.quantidade_atual)} ${food.medida}`,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .filter((item) => `${item.name} ${item.location}`.toLowerCase().includes(search.toLowerCase()))
    .sort((left, right) => left.expiry.localeCompare(right.expiry));
  const expiringSoonCount = stockItems.filter((stock) => stock.validade && stock.validade >= today && stock.validade <= threeDaysFromToday).length;
  const expiredCount = stockItems.filter((stock) => stock.validade && stock.validade < today).length;
  const wasteThisMonth = wasteRecords.filter((record) => record.data.startsWith(today.slice(0, 7))).length;
  const notifications = foodsExpiringToday.slice(0, 5);

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      {mobileMenu && <button className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden" aria-label="Fechar menu" onClick={() => setMobileMenu(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[268px] flex-col border-r border-[var(--line)] bg-white transition-[width,transform] duration-200 lg:translate-x-0 ${sidebarCollapsed ? "lg:w-[84px]" : "lg:w-[268px]"} ${mobileMenu ? "translate-x-0" : "-translate-x-full"}`}>
        <div className={`flex items-center justify-between px-4 ${sidebarCollapsed ? "h-[82px] lg:justify-center" : "h-[104px]"}`}>
          <div className={sidebarCollapsed ? "lg:hidden" : ""}>
            <img src={foodTrackLogo} alt="FoodTrack — Controle hoje, menos desperdício amanhã" className="h-[92px] w-[176px] object-contain" />
          </div>
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="hidden size-11 place-items-center rounded-xl bg-[var(--brand)] text-white shadow-[0_5px_16px_rgba(7,150,105,0.22)] transition hover:bg-[var(--brand-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] lg:grid"
              aria-label="Abrir menu lateral"
              aria-expanded="false"
              title="Abrir menu"
            >
              <Icon name="menu" size={21} />
            </button>
          )}
          <button onClick={() => setMobileMenu(false)} className="grid size-11 place-items-center text-[var(--muted)] lg:hidden" aria-label="Fechar navegação"><Icon name="close" /></button>
        </div>
        <div className={`group absolute -right-4 top-8 z-10 ${sidebarCollapsed ? "hidden" : "hidden lg:block"}`}>
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="grid size-8 place-items-center rounded-full border border-[var(--line)] bg-white text-[var(--brand-dark)] shadow-[0_4px_14px_rgba(15,23,42,0.12)] transition hover:scale-105 hover:border-[var(--brand-border)] hover:bg-[var(--brand-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
            aria-label="Recolher menu lateral"
            aria-expanded="true"
          >
            <Icon name="chevron" size={16} className="rotate-180 transition-transform duration-200" />
          </button>
          <span className="pointer-events-none absolute left-10 top-1/2 w-max -translate-y-1/2 translate-x-1 rounded-lg bg-[var(--ink)] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:translate-x-0 group-hover:opacity-100">
            Recolher menu
          </span>
        </div>

        <nav className="mt-4 flex-1 px-4" aria-label="Navegação principal">
          <div className="space-y-1.5">
            {navigation.map((item) => (
              <button key={item.label} title={sidebarCollapsed ? item.label : undefined} onClick={() => { setActive(item.label); setMobileMenu(false); }} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-4 text-left text-[0.95rem] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] ${sidebarCollapsed ? "lg:justify-center lg:gap-0 lg:px-0" : ""} ${active === item.label ? "bg-[var(--brand-soft)] text-[var(--brand-dark)]" : "text-[var(--muted-strong)] hover:bg-[var(--surface-soft)]"}`}>
                <Icon name={item.icon} size={18} className={active === item.label ? "text-[var(--brand)]" : "text-[var(--icon)]"} />
                <span className={sidebarCollapsed ? "lg:hidden" : ""}>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className={`mx-4 mb-4 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-soft)]/60 p-4 ${sidebarCollapsed ? "lg:hidden" : ""}`}>
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--brand-dark)]"><span>Economia no Mês</span><Icon name="trend" size={16} /></div>
          <p className="mt-3 text-2xl font-bold tracking-tight">{wasteThisMonth}</p>
          <p className="mt-1 text-xs text-[var(--brand)]">Registros de desperdício no mês</p>
        </div>
        <button onClick={() => notify("Central de suporte aberta")} title="Suporte & Documentação" className={`mx-5 mb-5 flex min-h-11 items-center gap-3 text-sm text-[var(--muted-strong)] ${sidebarCollapsed ? "lg:justify-center lg:gap-0" : ""}`}><Icon name="help" size={18} /> <span className={sidebarCollapsed ? "lg:hidden" : ""}>Suporte & Documentação</span></button>
      </aside>

      <div className={`transition-[padding] duration-200 ${sidebarCollapsed ? "lg:pl-[84px]" : "lg:pl-[268px]"}`}>
        <header className="sticky top-0 z-30 flex min-h-[74px] items-center gap-3 border-b border-[var(--line)] bg-white/95 px-4 backdrop-blur-md sm:px-6 xl:px-10">
          <button onClick={() => setMobileMenu(true)} className="grid size-11 shrink-0 place-items-center rounded-xl border border-[var(--line)] lg:hidden" aria-label="Abrir navegação"><Icon name="menu" /></button>
          <div className="relative min-w-0 flex-1 md:max-w-2xl">
            <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--icon)]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] pl-11 pr-4 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]" placeholder="Buscar insumo ou local..." aria-label="Buscar insumo ou local de armazenamento" />
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-3">
          <div className="relative">
            <button onClick={() => setNotificationsOpen((current) => !current)} className={`relative grid size-11 shrink-0 place-items-center rounded-full text-[var(--muted-strong)] transition ${notificationsOpen ? "bg-[var(--brand-soft)] text-[var(--brand-dark)]" : ""}`} aria-label="Notificações de validade" aria-expanded={notificationsOpen}>
              <Icon name="bell" size={20} />
              {expiringSoonCount > 0 && <span className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-full bg-[var(--danger)] text-[0.65rem] font-bold text-white">{expiringSoonCount}</span>}
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-14 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
                  <div><h2 className="font-bold">Notificações</h2><p className="mt-0.5 text-xs text-[var(--muted)]">Alertas de validade do estoque</p></div>
                  <span className="text-xs text-[var(--muted)]">{expiringSoonCount} itens em até 3 dias</span>
                </div>
                <div className="max-h-[26rem] overflow-y-auto">
                  {notifications.map((food) => (
                    <button key={food.id} onClick={() => { setActive("Estoque"); setNotificationsOpen(false); }} className="flex min-h-[88px] w-full gap-3 border-b border-[var(--line)] px-5 py-4 text-left last:border-0 hover:bg-[var(--surface-soft)]">
                      <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl ${food.critical ? "bg-[var(--danger-soft)] text-[var(--danger)]" : "bg-[var(--warning-soft)] text-[var(--warning)]"}`}><Icon name={food.critical ? "alert" : "calendar"} size={17} /></span>
                      <span className="min-w-0 flex-1"><strong className="block truncate text-sm">{food.name}</strong><span className={`mt-0.5 block text-xs font-bold ${food.critical ? "text-[var(--danger)]" : "text-[var(--warning)]"}`}>{food.expiry}</span><span className="mt-1 block text-xs text-[var(--muted)]">{food.amount} · {food.location}</span></span>
                    </button>
                  ))}
                  {notifications.length === 0 && <p className="p-5 text-sm text-[var(--muted-strong)]">Nenhum item com validade próxima.</p>}
                </div>
                <button onClick={() => { setActive("Prioridades"); setNotificationsOpen(false); }} className="min-h-11 w-full border-t border-[var(--line)] bg-[var(--surface-soft)] text-sm font-bold text-[var(--brand-dark)]">Ver todos os itens prioritários</button>
              </div>
            )}
          </div>
          <button onClick={logout} className="flex min-h-11 items-center gap-3 text-left" aria-label="Sair da conta">
            <span className="grid size-10 place-items-center rounded-full border border-[var(--line)] bg-slate-100 text-xs font-bold">{user.nome.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span>
            <span className="hidden sm:block"><strong className="block text-sm font-semibold">{user.nome}</strong><span className="block text-xs leading-tight text-[var(--muted)]">{user.perfil} · Sair</span></span>
          </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 xl:px-10 xl:py-9">
          {active === "Dashboard" ? <>
          <section>
            <div>
              <p className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--brand)]"><span className="size-2 rounded-full bg-[var(--success)]" /> Estoque do restaurante <span className="text-[var(--line-strong)]">•</span><span className="text-[var(--muted-strong)]">{new Date().toLocaleDateString("pt-BR")}</span></p>
              <h1 className="text-3xl font-bold tracking-[-0.04em] sm:text-[2rem]">Painel Operacional da Cozinha</h1>
            </div>
          </section>

          {expiringSoonCount > 0 && <section className="mt-7 flex flex-col gap-4 rounded-2xl border border-[var(--warning-border)] bg-[var(--warning-soft)] p-4 text-sm lg:flex-row lg:items-center">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--warning-border)] bg-white/50 text-[var(--warning)]"><Icon name="alert" size={20} /></span>
            <p className="flex-1 leading-relaxed text-[var(--warning-ink)]"><strong>Atenção: {expiringSoonCount} estoques vencem nos próximos 3 dias.</strong> Consulte a validade e priorize esses itens.</p>
            <button onClick={() => setActive("Prioridades")} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--warning-button)] px-5 font-bold text-[var(--warning-ink)]">Ver itens prioritários <Icon name="chevron" size={16} /></button>
          </section>}

          <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Alimentos cadastrados" value={String(foodItems.length)} suffix="itens" icon="box" footer={`${stockItems.length} registros no estoque`} />
            <StatCard label="Vencem em até 3 dias" value={String(expiringSoonCount)} suffix="registros de estoque" badge={expiringSoonCount ? "Atenção" : undefined} warning={expiringSoonCount > 0} footer="Calculado pelas datas de validade" />
            <StatCard label="Validades vencidas" value={String(expiredCount)} suffix="registros de estoque" badge={expiredCount ? "Verificar" : undefined} danger={expiredCount > 0} footer="A API não oferece baixa automática" />
            <StatCard label="Desperdícios no mês" value={String(wasteThisMonth)} suffix="registros" icon="trash" footer="Custo não disponível na API" />
          </section>

          <section className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(310px,0.96fr)]">
            <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)]">
              <div className="flex flex-col gap-5 border-b border-[var(--line)] p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold leading-tight">Estoques com validade próxima</h2>
                  <p className="mt-1 text-sm text-[var(--muted-strong)]">{foodsExpiringToday.length} registros vencidos ou com vencimento em até 3 dias.</p>
                </div>
                <span className="w-fit rounded-full bg-[var(--danger-soft)] px-3 py-1.5 text-xs font-bold text-[var(--danger)]">Ação imediata</span>
              </div>
              <div>
                {foodsExpiringToday.map((food) => (
                  <article key={food.name} className="grid gap-4 border-b border-[var(--line)] p-5 last:border-b-0 sm:grid-cols-[60px_minmax(0,1fr)] lg:grid-cols-[60px_minmax(0,1fr)_165px] lg:items-center">
                    <div className={`grid h-[60px] place-items-center rounded-xl border text-xs font-bold ${food.categoryClass}`}>{food.category}</div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold">{food.name}</h3>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${food.critical ? "border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]" : "border-[var(--warning-border)] bg-[var(--warning-soft)] text-[var(--warning-ink)]"}`}>{food.critical && "• "}{food.expiry}</span>
                      </div>
                      <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[var(--muted-strong)]"><span>{food.location}</span><span className="text-[var(--line-strong)]">•</span><span>{food.amount}</span></p>
                    </div>
                    <div className="flex flex-row items-center gap-3 sm:col-start-2 lg:col-start-auto lg:flex-col lg:items-stretch">
                      <button onClick={() => { setWasteForm({ estoque: String(food.id), quantidade: "", descricao: "" }); setWasteError(""); setWasteModal(true); }} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--danger)] px-3 text-sm font-bold text-white">Registrar baixa</button>
                    </div>
                  </article>
                ))}
                {foodsExpiringToday.length === 0 && <div className="p-12 text-center"><p className="font-semibold">Nenhum alimento encontrado</p><p className="mt-1 text-sm text-[var(--muted)]">Tente alterar o texto pesquisado.</p></div>}
              </div>
              <div className="flex flex-col gap-3 bg-[var(--surface-soft)] px-5 py-4 text-sm text-[var(--muted-strong)] sm:flex-row sm:items-center sm:justify-between">
                <span>Lista de estoques vencidos ou com vencimento em até 3 dias.</span>
                <button onClick={() => setActive("Prioridades")} className="flex min-h-10 items-center gap-1 font-bold text-[var(--brand-dark)]">Ver próximas validades <Icon name="chevron" size={16} /></button>
              </div>
            </div>

            <aside className="space-y-5">
              <Panel>
                <div className="flex items-center justify-between"><h2 className="panel-title">Resumo do Estoque</h2><strong className="text-sm">{stockItems.length} registros</strong></div>
                <p className="mt-4 text-sm text-[var(--muted-strong)]">{foodItems.length} alimentos em {new Set(foodItems.map((food) => food.categoria)).size} categorias.</p>
                <p className="mt-3 text-sm text-[var(--muted-strong)]">{stockItems.filter((item) => !item.validade).length} registros sem validade informada.</p>
              </Panel>

              <Panel>
                <div className="flex items-center justify-between"><h2 className="panel-title">Desperdícios</h2><span className="text-xs text-[var(--muted)]">Este mês</span></div>
                <p className="mt-5 text-3xl font-bold">{wasteThisMonth}</p>
                <p className="mt-1 text-sm text-[var(--muted-strong)]">registros; custo e baixa automática não são oferecidos pela API.</p>
              </Panel>

            </aside>
          </section>
          </> : <WorkspacePage
            page={active}
            navigate={setActive}
            notify={notify}
            openWaste={(stockId) => { setWasteForm({ estoque: stockId ? String(stockId) : "", quantidade: "", descricao: "" }); setWasteError(""); setWasteModal(true); }}
            user={user}
            users={users}
            token={token}
            restaurants={restaurants}
            foods={foodItems}
            stocks={stockItems}
            waste={wasteRecords}
            saveFood={submitFood}
            saveStock={saveStock}
            saveWaste={submitWaste}
            saveUser={saveUser}
            saveRestaurant={saveRestaurant}
          />}
        </main>
      </div>

      {wasteModal && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="waste-title">
          <form onSubmit={async (event) => {
            event.preventDefault();
            setWasteError("");
            try {
              await submitWaste({ descricao: wasteForm.descricao, quantidade: wasteForm.quantidade, data: localDateString(), estoque: Number(wasteForm.estoque) });
              setWasteModal(false);
              notify("Desperdício registrado.");
            } catch (error) {
              setWasteError(error instanceof Error ? error.message : "Não foi possível registrar o desperdício.");
            }
          }} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div><h2 id="waste-title" className="text-2xl font-bold tracking-tight">Registrar desperdício</h2><p className="mt-1 text-sm text-[var(--muted-strong)]">O registro não reduz automaticamente a quantidade em estoque.</p></div>
              <button type="button" onClick={() => setWasteModal(false)} className="grid size-11 place-items-center rounded-xl bg-[var(--surface-soft)]" aria-label="Fechar modal"><Icon name="close" /></button>
            </div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label className="sm:col-span-2"><span className="field-label">Estoque *</span><select required value={wasteForm.estoque} onChange={(event) => setWasteForm((current) => ({ ...current, estoque: event.target.value }))} className="field"><option value="">Selecione um alimento e local</option>{stockItems.map((stock) => { const food = foodById.get(stock.alimento); return <option key={stock.id} value={stock.id}>{food?.nome || `Alimento ${stock.alimento}`} · {stock.localizacao} ({formatQuantity(stock.quantidade_atual)} {food?.medida || ""})</option>; })}</select></label>
              <label><span className="field-label">Quantidade *</span><input required value={wasteForm.quantidade} onChange={(event) => setWasteForm((current) => ({ ...current, quantidade: event.target.value }))} type="number" min="0.001" step="0.001" className="field" placeholder="0,0" /></label>
              <label><span className="field-label">Descrição *</span><input required maxLength={300} value={wasteForm.descricao} onChange={(event) => setWasteForm((current) => ({ ...current, descricao: event.target.value }))} className="field" placeholder="Motivo ou detalhe da baixa" /></label>
            </div>
            {wasteError && <p role="alert" className="mt-4 rounded-lg bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">{wasteError}</p>}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setWasteModal(false)} className="min-h-11 rounded-xl border border-[var(--line)] px-5 text-sm font-bold">Cancelar</button>
              <button type="submit" className="min-h-11 rounded-xl bg-[var(--danger)] px-5 text-sm font-bold text-white">Confirmar registro</button>
            </div>
          </form>
        </div>
      )}

      {toast && <div aria-live="polite" className="fixed bottom-5 left-1/2 z-[80] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl bg-[var(--ink)] px-5 py-3.5 text-center text-sm font-semibold text-white shadow-xl">{toast}</div>}
    </div>
  );
}

function StatCard({ label, value, suffix, icon, badge, footer, warning, danger }: { label: string; value: string; suffix: string; icon?: IconName; badge?: string; footer: ReactNode; warning?: boolean; danger?: boolean }) {
  return (
    <div className={`min-h-[158px] rounded-2xl border bg-white p-5 shadow-[var(--shadow)] ${warning ? "border-[var(--warning-border)]" : danger ? "border-[var(--danger-border)]" : "border-[var(--line)]"}`}>
      <div className="flex min-h-9 items-start justify-between gap-2"><p className="text-sm font-medium leading-snug text-[var(--muted-strong)]">{label}</p>{icon && <Icon name={icon} size={18} className="text-[var(--icon)]" />}{badge && <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${danger ? "border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]" : "border-[var(--warning-border)] bg-[var(--warning-soft)] text-[var(--warning-ink)]"}`}>{badge}</span>}</div>
      <p className={`mt-1 text-3xl font-bold tracking-tight ${danger ? "text-[var(--danger)]" : warning ? "text-[var(--warning-strong)]" : ""}`}>{value} <span className="text-sm font-normal text-[var(--muted-strong)]">{suffix}</span></p>
      <p className={`mt-3 text-xs font-medium ${danger ? "text-[var(--danger)]" : "text-[var(--brand)]"}`}>{footer}</p>
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)]">{children}</div>;
}

function StatusDot({ color, label, value, detail }: { color: string; label: string; value: string; detail: string }) {
  return <div><div className="flex items-center justify-center gap-1.5"><span className={`size-2.5 rounded-full ${color}`} />{label}</div><p className="mt-1 font-bold text-[var(--ink)]">{value} <span className="font-normal text-[var(--muted)]">{detail}</span></p></div>;
}

function LossBar({ label, value, note, width, color }: { label: string; value: string; note: string; width: string; color: string }) {
  return <div><div className="flex justify-between gap-3 text-sm"><span>{label}</span><strong>{value}</strong></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width }} /></div><p className="mt-1.5 text-[0.68rem] text-[var(--muted)]">{note}</p></div>;
}
