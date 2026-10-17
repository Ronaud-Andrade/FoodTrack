import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { localDateOffset, localDateString, type FoodItem, type Restaurant, type StockItem, type User, type WasteRecord } from "./api";

type PageProps = {
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
  saveWaste: (data: { descricao: string; quantidade: string; data: string; estoque: number }) => Promise<void>;
  saveUser: (data: { username: string; nome: string; email: string; perfil: string; password: string; restaurante?: number }) => Promise<void>;
  saveRestaurant: (id: number, data: { nome: string; cnpj: string }) => Promise<void>;
};

type MiniIconName = "box" | "calendar" | "chart" | "check" | "download" | "filter" | "plus" | "printer" | "search" | "trash" | "users";

function MiniIcon({ name, size = 18 }: { name: MiniIconName; size?: number }) {
  const content: Record<MiniIconName, ReactNode> = {
    box: <><path d="m21 8-9 5-9-5 9-5z" /><path d="m3 8 9 5 9-5v9l-9 5-9-5zM12 13v9" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    chart: <><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    download: <><path d="M12 3v12M7 10l5 5 5-5M4 20h16" /></>,
    filter: <path d="M4 5h16M7 12h10M10 19h4" />,
    plus: <path d="M12 5v14M5 12h14" />,
    printer: <><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v7H6z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    trash: <><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{content[name]}</svg>;
}

type InventoryRow = {
  id: number;
  name: string;
  category: string;
  stock: string;
  quantity: string;
  location: string;
  validity: string;
  status: string;
  entry: string;
};

export default function WorkspacePage(props: PageProps) {
  if (props.page === "Prioridades") return <PriorityPage {...props} />;
  if (props.page === "Estoque") return <InventoryPage {...props} />;
  if (props.page === "Cadastrar Alimento") return <CreateFoodPage {...props} />;
  if (props.page === "Desperdícios") return <WastePage {...props} />;
  if (props.page === "Relatórios") return <ReportsPage {...props} />;
  if (props.page === "Configurações") return <SettingsPage {...props} />;
  return null;
}

function PriorityPage({ navigate, openWaste, foods, stocks }: PageProps) {
  const [filter, setFilter] = useState("Todos");
  const priorities = stocks.filter((stock) => stock.validade && stock.validade <= localDateOffset(3)).map((stock) => {
    const food = foods.find((item) => item.id === stock.alimento);
    if (!food) return null;
    const days = Math.ceil((new Date(`${stock.validade}T00:00:00`).getTime() - new Date(new Date().toDateString()).getTime()) / 86400000);
    return {
      id: stock.id,
      name: food.nome,
      category: food.categoria,
      amount: `${stock.qntd_atual} ${food.medida}`,
      expiry: days < 0 ? "Vencido" : days === 0 ? "Vence hoje" : `Vence em ${days} dia(s)`,
      critical: days <= 1,
    };
  }).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const visible = priorities.filter((item) => filter === "Todos" || (filter === "Até amanhã" ? item.critical : item.category === filter));
  return (
    <>
      <PageHeader eyebrow="Ação preventiva" title="Itens Prioritários" description="Alimentos que devem ser utilizados primeiro para evitar vencimentos e reduzir perdas." actions={<SecondaryButton onClick={() => navigate("Dashboard")}>Voltar ao dashboard</SecondaryButton>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Summary label="Exigem atenção" value="8 itens" detail="Vencem nos próximos 3 dias" icon="calendar" tone="warning" />
        <Summary label="Vencem hoje" value="2 itens" detail="Ação imediata recomendada" icon="trash" tone="danger" />
        <Summary label="Perda em risco" value="R$ 1.150" detail="Valor que ainda pode ser preservado" icon="chart" tone="warning" />
      </div>
      <section className="mt-6 overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)]">
        <div className="flex flex-col gap-4 border-b border-[var(--line)] p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="text-lg font-bold">Ordem recomendada de uso</h2><p className="mt-1 text-sm text-[var(--muted-strong)]">A lista está organizada pela validade mais próxima.</p></div>
          <div className="flex gap-2 overflow-x-auto">{["Todos", "Até amanhã", ...new Set(priorities.map((item) => item.category))].map((item) => <button key={item} onClick={() => setFilter(item)} className={`min-h-10 whitespace-nowrap rounded-lg px-3 text-sm font-semibold ${filter === item ? "bg-[var(--ink)] text-white" : "bg-[var(--surface-soft)] text-[var(--muted-strong)]"}`}>{item}</button>)}</div>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {visible.map((item, index) => {
            return <article key={item.id} className="grid gap-4 p-5 transition sm:p-6 lg:grid-cols-[44px_minmax(0,1fr)_auto] lg:items-center">
              <span className={`grid size-10 place-items-center rounded-full text-sm font-bold ${item.critical ? "bg-[var(--danger-soft)] text-[var(--danger)]" : "bg-[var(--warning-soft)] text-[var(--warning)]"}`}>{index + 1}</span>
              <div>
                <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{item.name}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.critical ? "bg-[var(--danger-soft)] text-[var(--danger)]" : "bg-[var(--warning-soft)] text-[var(--warning-ink)]"}`}>{item.expiry}</span></div>
                <p className="mt-1.5 text-sm text-[var(--muted-strong)]">{item.category} · {item.amount}</p>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button onClick={() => openWaste(item.id)} className="min-h-11 rounded-xl border border-[var(--line)] px-4 text-sm font-semibold text-[var(--muted-strong)]">Registrar baixa</button>
              </div>
            </article>;
          })}
        </div>
      </section>
    </>
  );
}

function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.09em] text-[var(--brand)]">{eyebrow}</p>
        <h1 className="text-3xl font-bold tracking-[-0.04em]">{title}</h1>
        <p className="mt-1.5 max-w-3xl text-sm text-[var(--muted-strong)] sm:text-base">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

function InventoryPage({ navigate, notify, foods, stocks, saveStock, openWaste }: PageProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [status, setStatus] = useState("Todos");
  const [detail, setDetail] = useState<InventoryRow | null>(null);
  const [editForm, setEditForm] = useState({ qntd_atual: "", localizacao: "", validade: "", entrada: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const today = localDateString();
  const rows = useMemo(() => stocks.flatMap((stock) => {
    const food = foods.find((item) => item.id === stock.alimento);
    if (!food) return [];
    const stockStatus = !stock.validade ? "Sem validade" : stock.validade < today ? "Vencido" : stock.validade <= localDateOffset(3) ? "Atenção" : "Em dia";
    return [{
      id: stock.id,
      name: food.nome,
      category: food.categoria,
      stock: `${stock.qntd_atual} ${food.medida}`,
      quantity: stock.qntd_atual,
      location: stock.localizacao,
      validity: stock.validade ? new Date(`${stock.validade}T00:00:00`).toLocaleDateString("pt-BR") : "Não informada",
      status: stockStatus,
      entry: stock.entrada,
    }];
  }).filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()) &&
    (category === "Todas" || item.category === category) &&
    (status === "Todos" || item.status === status)
  ), [stocks, foods, today, query, category, status]);

  const exportInventory = () => {
    const csv = ["Produto,Categoria,Estoque,Local,Validade,Status", ...rows.map((item) => [item.name, item.category, item.stock, item.location, item.validity, item.status].map((value) => `"${value.replace(/"/g, '""')}"`).join(","))].join("\n");
    downloadFile("estoque-foodtrack.csv", csv, "text/csv");
    notify("Estoque exportado em CSV");
  };
  const openDetails = (item: InventoryRow) => {
    setDetail(item);
    setEditForm({ qntd_atual: item.quantity, localizacao: item.location, validade: stocks.find((stock) => stock.id === item.id)?.validade || "", entrada: item.entry });
    setError("");
  };
  const updateDetails = async (event: FormEvent) => {
    event.preventDefault();
    if (!detail) return;
    setSaving(true);
    setError("");
    try {
      await saveStock(detail.id, {
        qntd_atual: editForm.qntd_atual,
        localizacao: editForm.localizacao,
        validade: editForm.validade || null,
        entrada: editForm.entrada,
      });
      setDetail(null);
      notify("Estoque atualizado.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível atualizar o estoque.");
    } finally {
      setSaving(false);
    }
  };
  const categories = [...new Set(foods.map((food) => food.categoria))];

  return (
    <>
      <PageHeader eyebrow="Gestão de inventário" title="Estoque de Alimentos" description="Dados carregados do estoque do restaurante na API." actions={<><SecondaryButton onClick={exportInventory} icon="download">Exportar estoque</SecondaryButton><PrimaryButton onClick={() => navigate("Cadastrar Alimento")} icon="plus">Cadastrar alimento</PrimaryButton></>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Summary label="Registros de estoque" value={String(stocks.length)} detail="Itens retornados pela API" icon="box" />
        <Summary label="Alimentos cadastrados" value={String(foods.length)} detail="No restaurante atual" icon="filter" />
        <Summary label="Categorias monitoradas" value={String(categories.length)} detail="Categorias encontradas" icon="chart" />
        <Summary label="Sem validade" value={String(stocks.filter((stock) => !stock.validade).length)} detail="Validade não informada" icon="calendar" tone="warning" />
      </div>
      <section className="mt-6 overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)]">
        <div className="flex flex-col gap-4 border-b border-[var(--line)] p-5 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--icon)]"><MiniIcon name="search" /></span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="field pl-10" placeholder="Buscar por nome do alimento..." aria-label="Buscar no estoque" />
          </div>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="field lg:w-44" aria-label="Filtrar categoria"><option>Todas</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="field lg:w-40" aria-label="Filtrar status"><option>Todos</option><option>Em dia</option><option>Atenção</option><option>Vencido</option><option>Sem validade</option></select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead><tr className="border-b border-[var(--line)] bg-[var(--surface-soft)] text-xs uppercase tracking-wide text-[var(--muted-strong)]"><th className="px-5 py-4">Alimento</th><th>Estoque</th><th>Localização</th><th>Validade</th><th>Status</th><th className="pr-5 text-right">Ação</th></tr></thead>
            <tbody>{rows.map((item) => <tr key={item.id} className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--surface-soft)]"><td className="py-4 pl-5"><strong className="block">{item.name}</strong><span className="text-xs text-[var(--muted)]">{item.category}</span></td><td>{item.stock}</td><td>{item.location}</td><td className="font-semibold">{item.validity}</td><td><StatusBadge status={item.status} /></td><td className="pr-5 text-right"><button onClick={() => openDetails(item)} className="min-h-10 rounded-lg px-3 font-bold text-[var(--brand-dark)] hover:bg-[var(--brand-soft)]">Editar</button><button onClick={() => openWaste(item.id)} className="min-h-10 rounded-lg px-3 font-semibold text-[var(--danger)]">Baixa</button></td></tr>)}</tbody>
          </table>
          {rows.length === 0 && <EmptyState title="Nenhum alimento encontrado" description="Altere os filtros ou cadastre um novo alimento." action={() => { setQuery(""); setCategory("Todas"); setStatus("Todos"); }} actionLabel="Limpar filtros" />}
        </div>
        <div className="bg-[var(--surface-soft)] px-5 py-4 text-sm text-[var(--muted-strong)]">Exibindo {rows.length} registros de estoque.</div>
      </section>
      {detail && <Modal title={`Editar estoque: ${detail.name}`} close={() => setDetail(null)}><form onSubmit={updateDetails} className="grid gap-4 sm:grid-cols-2">
        <Field label={`Quantidade (${foods.find((food) => food.nome === detail.name)?.medida || ""})`} required><input required min="0" step="0.001" type="number" value={editForm.qntd_atual} onChange={(event) => setEditForm((current) => ({ ...current, qntd_atual: event.target.value }))} className="field" /></Field>
        <Field label="Localização" required><input required maxLength={150} value={editForm.localizacao} onChange={(event) => setEditForm((current) => ({ ...current, localizacao: event.target.value }))} className="field" /></Field>
        <Field label="Validade"><input type="date" value={editForm.validade} onChange={(event) => setEditForm((current) => ({ ...current, validade: event.target.value }))} className="field" /></Field>
        <Field label="Data de entrada" required><input required type="date" value={editForm.entrada} onChange={(event) => setEditForm((current) => ({ ...current, entrada: event.target.value }))} className="field" /></Field>
        {error && <p role="alert" className="sm:col-span-2 text-sm text-[var(--danger)]">{error}</p>}
        <div className="flex justify-end gap-3 sm:col-span-2"><SecondaryButton onClick={() => setDetail(null)}>Cancelar</SecondaryButton><PrimaryButton type="submit">{saving ? "Salvando…" : "Salvar"}</PrimaryButton></div>
      </form></Modal>}
    </>
  );
}

function CreateFoodPage({ navigate, notify, saveFood, user, restaurants }: PageProps) {
  const [submitted, setSubmitted] = useState(false);
  const initialForm = { name: "", category: "", quantity: "", unit: "Kg", validity: "", location: "", restaurant: "" };
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await saveFood({
        nome: form.name,
        categoria: form.category,
        medida: form.unit,
        quantidade: form.quantity,
        validade: form.validity,
        localizacao: form.location,
        ...(user.is_superuser ? { restaurante: Number(form.restaurant) } : {}),
      });
      setSubmitted(true);
      notify("Alimento e estoque cadastrados.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível cadastrar o alimento.");
    } finally {
      setSaving(false);
    }
  };

  if (submitted) return <div className="mx-auto max-w-xl py-16 text-center"><span className="mx-auto grid size-16 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]"><MiniIcon name="check" size={30} /></span><h1 className="mt-5 text-3xl font-bold">Alimento cadastrado</h1><p className="mt-2 text-[var(--muted-strong)]">{form.name} já está disponível no inventário da unidade.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><SecondaryButton onClick={() => { setSubmitted(false); setForm(initialForm); }}>Cadastrar outro</SecondaryButton><PrimaryButton onClick={() => navigate("Estoque")}>Ver no estoque</PrimaryButton></div></div>;

  return (
    <>
      <PageHeader eyebrow="Entrada de inventário" title="Cadastrar Alimento" description="Registre um novo item com quantidade, validade do estoque e local de armazenamento." />
      <form onSubmit={submit} className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-6">
          <FormSection title="Informações do alimento" description="Dados de identificação e classificação.">
            <Field label="Nome do alimento" required><input required value={form.name} onChange={(e) => update("name", e.target.value)} className="field" placeholder="Ex.: Filé de peito de frango" /></Field>
            <Field label="Categoria" required><input required maxLength={60} value={form.category} onChange={(e) => update("category", e.target.value)} className="field" placeholder="Ex.: Hortifruti" /></Field>
            {user.is_superuser && <Field label="Restaurante" required><select required value={form.restaurant} onChange={(e) => update("restaurant", e.target.value)} className="field"><option value="">Selecione</option>{restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.nome}</option>)}</select></Field>}
          </FormSection>
          <FormSection title="Dados do estoque" description="Controle de quantidade, validade e armazenamento.">
            <Field label="Quantidade inicial" required><input required value={form.quantity} onChange={(e) => update("quantity", e.target.value)} className="field" type="number" min="0" step="0.001" placeholder="0,0" /></Field>
            <Field label="Unidade" required><select value={form.unit} onChange={(e) => update("unit", e.target.value)} className="field"><option>Kg</option><option>g</option><option>L</option><option>ml</option><option value="un">Unidade</option><option value="maço">Maço</option><option value="caixa">Caixa</option></select></Field>
            <Field label="Validade do estoque"><input value={form.validity} onChange={(e) => update("validity", e.target.value)} className="field" type="date" /></Field>
            <Field label="Local de armazenamento" required><input required maxLength={150} value={form.location} onChange={(e) => update("location", e.target.value)} className="field" placeholder="Ex.: Câmara fria" /></Field>
          </FormSection>
          {error && <p role="alert" className="rounded-lg bg-[var(--danger-soft)] p-4 text-sm text-[var(--danger)]">{error}</p>}
        </div>
        <aside className="sticky top-24 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)]">
          <h2 className="font-bold">Resumo do cadastro</h2>
          <div className="mt-5 space-y-4 text-sm"><Review label="Alimento" value={form.name || "Não informado"} /><Review label="Categoria" value={form.category || "Não informada"} /><Review label="Quantidade" value={form.quantity ? `${form.quantity} ${form.unit}` : "Não informada"} /><Review label="Validade do estoque" value={form.validity ? new Date(`${form.validity}T12:00`).toLocaleDateString("pt-BR") : "Não informada"} /><Review label="Local" value={form.location || "Não informado"} /></div>
          <p className="mt-5 rounded-xl bg-[var(--brand-soft)] p-3 text-xs leading-relaxed text-[var(--brand-dark)]">Os alertas de validade serão calculados automaticamente após o cadastro.</p>
          <button disabled={saving} type="submit" className="mt-5 min-h-11 w-full rounded-xl bg-[var(--brand)] font-bold text-white disabled:opacity-60">{saving ? "Salvando…" : "Cadastrar alimento e estoque"}</button>
          <button type="button" onClick={() => navigate("Estoque")} className="mt-2 min-h-11 w-full rounded-xl text-sm font-semibold text-[var(--muted-strong)]">Cancelar</button>
        </aside>
      </form>
    </>
  );
}

function WastePage({ openWaste, waste, stocks, foods, users }: PageProps) {
  const [period, setPeriod] = useState("Este mês");
  const now = new Date();
  const visibleRecords = waste.filter((record) => {
    const date = new Date(`${record.data}T00:00:00`);
    if (period === "Hoje") return record.data === localDateString(now);
    if (period === "Esta semana") return date >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    if (period === "Este mês") return record.data.startsWith(localDateString(now).slice(0, 7));
    return true;
  });
  const userById = new Map(users.map((item) => [item.id, item]));
  const resolveUser = (id: number) => userById.get(id)?.nome || `Usuário ${id}`;
  const resolveStock = (id: number) => stocks.find((stock) => stock.id === id);
  const resolveFood = (id: number) => {
    const stock = resolveStock(id);
    return stock ? foods.find((food) => food.id === stock.alimento) : undefined;
  };
  const csv = ["Data,Alimento,Quantidade,Descrição,Responsável", ...visibleRecords.map((record) => {
    const food = resolveFood(record.estoque);
    return [record.data, food?.nome || "Alimento não encontrado", `${record.quantidade} ${food?.medida || ""}`, record.descricao, resolveUser(record.usuario)]
      .map((value) => `"${value.replace(/"/g, '""')}"`).join(",");
  })].join("\n");
  return (
    <>
      <PageHeader eyebrow="Controle de perdas" title="Desperdícios" description="Registros carregados da API. A criação de uma baixa não altera automaticamente a quantidade do estoque." actions={<PrimaryButton onClick={openWaste} icon="plus">Registrar desperdício</PrimaryButton>} />
      <div className="grid gap-4 sm:grid-cols-2"><Summary label="Registros no período" value={String(visibleRecords.length)} detail="Baixas registradas na API" icon="trash" /><Summary label="Registros totais" value={String(waste.length)} detail="Histórico disponível" icon="filter" /></div>
      <section className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)] sm:p-6">
        <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-lg font-bold">Histórico de registros</h2><p className="mt-1 text-sm text-[var(--muted-strong)]">Descrição e responsável vêm dos registros reais.</p></div><div className="flex flex-wrap gap-3"><select value={period} onChange={(e) => setPeriod(e.target.value)} className="field w-auto" aria-label="Filtrar período"><option>Hoje</option><option>Esta semana</option><option>Este mês</option><option>Todo o período</option></select><SecondaryButton onClick={() => downloadFile("desperdicios.csv", csv, "text/csv")} icon="download">Exportar</SecondaryButton></div></div>
        <div className="overflow-x-auto"><table className="mt-2 w-full min-w-[700px] text-left text-sm"><thead><tr className="text-xs uppercase text-[var(--muted)]"><th className="py-4">Data</th><th>Alimento</th><th>Quantidade</th><th>Descrição</th><th>Responsável</th></tr></thead><tbody>{visibleRecords.map((record) => { const stock = resolveStock(record.estoque); const food = resolveFood(record.estoque); return <tr key={record.id} className="border-t border-[var(--line)]"><td className="py-4 text-[var(--muted-strong)]">{new Date(`${record.data}T00:00:00`).toLocaleDateString("pt-BR")}</td><td className="font-semibold">{food?.nome || `Alimento ${stock?.alimento ?? "não encontrado"}`}</td><td>{record.quantidade} {food?.medida}</td><td>{record.descricao}</td><td>{resolveUser(record.usuario)}</td></tr>; })}</tbody></table>{visibleRecords.length === 0 && <p className="py-10 text-center text-sm text-[var(--muted-strong)]">Nenhum registro nesse período.</p>}</div>
      </section>
    </>
  );
}

function ReportsPage({ foods, stocks, waste }: PageProps) {
  const now = new Date();
  const soon = stocks.filter((stock) => stock.validade && stock.validade >= localDateString(now) && stock.validade <= localDateOffset(3)).length;
  const monthWaste = waste.filter((record) => record.data.startsWith(localDateString(now).slice(0, 7)));
  const categoryCounts = foods.reduce<Record<string, number>>((totals, food) => {
    totals[food.categoria] = (totals[food.categoria] || 0) + 1;
    return totals;
  }, {});
  const categories = Object.entries(categoryCounts).sort((left, right) => right[1] - left[1]);
  const maxCategoryCount = Math.max(1, ...categories.map(([, count]) => count));
  const recentWeeks = Array.from({ length: 4 }, (_, index) => {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (3 - index) * 7 - 6);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (3 - index) * 7 + 1);
    const count = waste.filter((record) => {
      const date = new Date(`${record.data}T00:00:00`);
      return date >= start && date < end;
    }).length;
    return { label: `Semana ${index + 1}`, count };
  });
  const maxWeekCount = Math.max(1, ...recentWeeks.map((week) => week.count));
  return (
    <>
      <PageHeader eyebrow="Resultados da operação" title="Relatórios" description="Indicadores calculados a partir de estoques, alimentos e desperdícios retornados pela API." actions={<SecondaryButton onClick={() => downloadFile("relatorio-foodtrack.csv", ["Tipo,ID,Data,Quantidade,Descricao", ...waste.map((record) => `Desperdício,${record.id},${record.data},${record.quantidade},"${record.descricao.replace(/"/g, '""')}"`)].join("\n"), "text/csv")} icon="download">Exportar desperdícios</SecondaryButton>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Summary label="Alimentos cadastrados" value={String(foods.length)} detail="Registros no restaurante" icon="box" />
        <Summary label="Estoques próximos da validade" value={String(soon)} detail="Até 3 dias" icon="calendar" tone="warning" />
        <Summary label="Desperdícios este mês" value={String(monthWaste.length)} detail="Registros da API" icon="trash" />
        <Summary label="Estoques sem validade" value={String(stocks.filter((stock) => !stock.validade).length)} detail="Sem data cadastrada" icon="filter" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)] sm:p-6">
          <h2 className="text-lg font-bold">Registros de desperdício por semana</h2><p className="mt-1 text-sm text-[var(--muted-strong)]">Contagem das últimas quatro semanas; volumes entre unidades diferentes não são somados.</p>
          <div className="mt-7 grid h-64 grid-cols-4 items-end gap-3 border-b border-[var(--line)] px-2 sm:gap-6">{recentWeeks.map((week) => <div key={week.label} className="flex h-full flex-col items-center justify-end"><strong className="mb-2 text-xs">{week.count}</strong><div className="w-full max-w-14 rounded-t-lg bg-[var(--brand)]" style={{ height: `${Math.max(4, week.count / maxWeekCount * 78)}%` }} /></div>)}</div>
          <div className="grid grid-cols-4 gap-3 px-2 pt-3 text-center text-xs text-[var(--muted)]">{recentWeeks.map((week) => <span key={week.label}>{week.label}</span>)}</div>
        </section>
        <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)] sm:p-6">
          <h2 className="text-lg font-bold">Alimentos por categoria</h2><p className="mt-1 text-sm text-[var(--muted-strong)]">Contagem dos alimentos cadastrados.</p>
          <div className="mt-7 space-y-5">{categories.map(([name, count]) => <Rank key={name} label={name} value={String(count)} percent={`${count / maxCategoryCount * 100}%`} />)}</div>
          {categories.length === 0 && <p className="mt-5 text-sm text-[var(--muted-strong)]">Não há alimentos cadastrados.</p>}
        </section>
      </div>
      <p className="mt-6 rounded-xl bg-[var(--warning-soft)] p-4 text-sm text-[var(--warning-ink)]">A API não fornece custos, metas, economia, métricas de compra ou conversão de unidades; esses indicadores não são calculados aqui.</p>
    </>
  );
}

function SettingsPage({ notify, user, users, restaurants, saveUser, saveRestaurant }: PageProps) {
  const [tab, setTab] = useState("Restaurante");
  const [memberModal, setMemberModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [restaurantId, setRestaurantId] = useState(user.restaurante || restaurants[0]?.id || 0);
  const restaurant = restaurants.find((item) => item.id === restaurantId);
  const [restaurantForm, setRestaurantForm] = useState({ nome: restaurant?.nome || "", cnpj: restaurant?.cnpj || "" });
  const [memberForm, setMemberForm] = useState({ nome: "", username: "", email: "", perfil: "", password: "", restaurante: String(user.restaurante || "") });
  const tabs = [["Restaurante", "Dados disponíveis na API"], ["Equipe", "Contas do restaurante"]];

  const submitRestaurant = async (event: FormEvent) => {
    event.preventDefault();
    if (!restaurant || !user.is_superuser) return;
    setSaving(true);
    setError("");
    try {
      await saveRestaurant(restaurant.id, restaurantForm);
      notify("Dados do restaurante atualizados.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível atualizar o restaurante.");
    } finally {
      setSaving(false);
    }
  };

  const submitMember = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await saveUser({
        nome: memberForm.nome,
        username: memberForm.username,
        email: memberForm.email,
        perfil: memberForm.perfil,
        password: memberForm.password,
        ...(user.is_superuser ? { restaurante: Number(memberForm.restaurante) } : {}),
      });
      setMemberModal(false);
      setMemberForm({ nome: "", username: "", email: "", perfil: "", password: "", restaurante: String(user.restaurante || "") });
      notify("Conta criada.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível criar a conta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Administração" title="Configurações" description="Dados de restaurante e equipe disponibilizados pelo backend." />
      <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-[var(--line)] bg-white p-2 shadow-[var(--shadow)]">
          <p className="px-3 pb-2 pt-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Dados da conta</p>
          {tabs.map(([item, description]) => <button key={item} onClick={() => setTab(item)} className={`mb-1 min-h-[62px] w-full rounded-xl px-3 text-left transition ${tab === item ? "bg-[var(--brand-soft)] text-[var(--brand-dark)]" : "text-[var(--muted-strong)] hover:bg-[var(--surface-soft)]"}`}><strong className="block text-sm">{item}</strong><span className="mt-0.5 block text-xs font-normal text-[var(--muted)]">{description}</span></button>)}
          <div className="mx-2 mt-3 border-t border-[var(--line)] px-1 py-4"><strong className="block text-sm">{user.nome}</strong><span className="text-xs text-[var(--muted)]">{user.perfil}</span></div>
        </aside>

        <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)] sm:p-7">
          {tab === "Restaurante" && <>
            <SettingsHeading title="Restaurante" description="Campos de nome e CNPJ lidos do registro associado à sua conta." />
            {user.is_superuser && <Field label="Selecionar restaurante" required><select required value={restaurantId} onChange={(event) => { const id = Number(event.target.value); setRestaurantId(id); const selectedRestaurant = restaurants.find((item) => item.id === id); if (selectedRestaurant) setRestaurantForm({ nome: selectedRestaurant.nome, cnpj: selectedRestaurant.cnpj }); }} className="field mt-5">{restaurants.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></Field>}
            {restaurant ? <form onSubmit={submitRestaurant} className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Nome" required><input required maxLength={150} readOnly={!user.is_superuser} value={restaurantForm.nome} onChange={(event) => setRestaurantForm((current) => ({ ...current, nome: event.target.value }))} className="field read-only:opacity-70" /></Field>
              <Field label="CNPJ" required><input required maxLength={18} readOnly={!user.is_superuser} value={restaurantForm.cnpj} onChange={(event) => setRestaurantForm((current) => ({ ...current, cnpj: event.target.value }))} className="field read-only:opacity-70" /></Field>
              {user.is_superuser && <div className="sm:col-span-2"><PrimaryButton type="submit">{saving ? "Salvando…" : "Salvar restaurante"}</PrimaryButton></div>}
            </form> : <p className="mt-6 text-sm text-[var(--muted-strong)]">Esta conta de superusuário não está vinculada a um restaurante específico.</p>}
            {!user.is_superuser && <p className="mt-4 text-sm text-[var(--muted-strong)]">Somente superusuários podem alterar os dados do restaurante.</p>}
            <p className="mt-6 rounded-xl bg-[var(--warning-soft)] p-4 text-sm text-[var(--warning-ink)]">Telefone, endereço, moeda e configurações de alertas não existem no modelo/API.</p>
          </>}
          {tab === "Equipe" && <>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><SettingsHeading title="Usuários" description={`${users.length} contas retornadas pela API.`} /><PrimaryButton onClick={() => { setError(""); setMemberModal(true); }} icon="plus">Criar usuário</PrimaryButton></div>
            <div className="mt-6 space-y-3">{users.map((member) => <div key={member.id} className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] p-4 sm:flex-row sm:items-center"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--surface-soft)] text-xs font-bold">{member.nome.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span><div className="min-w-0 flex-1"><strong className="block text-sm">{member.nome}</strong><span className="text-xs text-[var(--muted)]">{member.username} · {member.email}</span></div><span className="text-sm font-semibold text-[var(--brand-dark)]">{member.perfil}</span></div>)}</div>
            <p className="mt-5 rounded-xl bg-[var(--warning-soft)] p-4 text-sm text-[var(--warning-ink)]">A API permite criar contas, mas não oferece convites por e-mail nem edição/exclusão de usuários pelo fluxo desta tela.</p>
          </>}
          {error && <p role="alert" className="mt-5 rounded-lg bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">{error}</p>}
        </section>
      </div>
      {memberModal && <Modal title="Criar usuário" close={() => setMemberModal(false)}><form onSubmit={submitMember} className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome" required><input required maxLength={150} value={memberForm.nome} onChange={(event) => setMemberForm((current) => ({ ...current, nome: event.target.value }))} className="field" /></Field>
        <Field label="Usuário" required><input required maxLength={150} value={memberForm.username} onChange={(event) => setMemberForm((current) => ({ ...current, username: event.target.value }))} className="field" /></Field>
        <Field label="E-mail" required><input required type="email" value={memberForm.email} onChange={(event) => setMemberForm((current) => ({ ...current, email: event.target.value }))} className="field" /></Field>
        <Field label="Perfil" required><input required maxLength={50} value={memberForm.perfil} onChange={(event) => setMemberForm((current) => ({ ...current, perfil: event.target.value }))} className="field" /></Field>
        <Field label="Senha inicial" required><input required minLength={8} type="password" value={memberForm.password} onChange={(event) => setMemberForm((current) => ({ ...current, password: event.target.value }))} className="field" /></Field>
        {user.is_superuser && <Field label="Restaurante" required><select required value={memberForm.restaurante} onChange={(event) => setMemberForm((current) => ({ ...current, restaurante: event.target.value }))} className="field"><option value="">Selecione</option>{restaurants.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></Field>}
        {error && <p role="alert" className="sm:col-span-2 text-sm text-[var(--danger)]">{error}</p>}
        <div className="flex justify-end gap-3 sm:col-span-2"><SecondaryButton onClick={() => setMemberModal(false)}>Cancelar</SecondaryButton><PrimaryButton type="submit">{saving ? "Criando…" : "Criar usuário"}</PrimaryButton></div>
      </form></Modal>}
    </>
  );
}

function Summary({ label, value, detail, icon, tone = "brand" }: { label: string; value: string; detail: string; icon: MiniIconName; tone?: "brand" | "warning" | "danger" }) {
  const colors = tone === "danger" ? "bg-[var(--danger-soft)] text-[var(--danger)]" : tone === "warning" ? "bg-[var(--warning-soft)] text-[var(--warning)]" : "bg-[var(--brand-soft)] text-[var(--brand)]";
  return <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)]"><div className={`grid size-10 place-items-center rounded-xl ${colors}`}><MiniIcon name={icon} /></div><p className="mt-4 text-sm text-[var(--muted-strong)]">{label}</p><p className="mt-1 text-2xl font-bold tracking-tight">{value}</p><p className="mt-1 text-xs font-medium text-[var(--muted)]">{detail}</p></div>;
}

function PrimaryButton({ children, onClick, icon, type = "button" }: { children: ReactNode; onClick?: () => void; icon?: MiniIconName; type?: "button" | "submit" }) {
  return <button type={type} onClick={onClick} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 text-sm font-bold text-white hover:bg-[var(--brand-dark)]">{icon && <MiniIcon name={icon} />}{children}</button>;
}

function SecondaryButton({ children, onClick, icon, type = "button" }: { children: ReactNode; onClick?: () => void; icon?: MiniIconName; type?: "button" | "submit" }) {
  return <button type={type} onClick={onClick} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-white px-5 text-sm font-bold text-[var(--muted-strong)] hover:border-[var(--brand)] hover:text-[var(--brand-dark)]">{icon && <MiniIcon name={icon} />}{children}</button>;
}

function StatusBadge({ status }: { status: string }) {
  const color = status === "Vencido" ? "bg-[var(--danger-soft)] text-[var(--danger)]" : status === "Atenção" || status === "Sem validade" ? "bg-[var(--warning-soft)] text-[var(--warning-ink)]" : "bg-[var(--brand-soft)] text-[var(--brand-dark)]";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${color}`}>{status}</span>;
}

function EmptyState({ title, description, action, actionLabel }: { title: string; description: string; action: () => void; actionLabel: string }) {
  return <div className="p-12 text-center"><span className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--surface-soft)] text-[var(--muted)]"><MiniIcon name="search" /></span><p className="mt-4 font-bold">{title}</p><p className="mt-1 text-sm text-[var(--muted)]">{description}</p><button onClick={action} className="mt-4 min-h-10 font-bold text-[var(--brand-dark)]">{actionLabel}</button></div>;
}

function Modal({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-[75] grid place-items-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true"><div className="my-6 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl sm:p-7"><div className="mb-6 flex items-center justify-between gap-4"><h2 className="text-xl font-bold">{title}</h2><button onClick={close} className="grid size-11 place-items-center rounded-xl bg-[var(--surface-soft)]" aria-label="Fechar">×</button></div>{children}</div></div>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return <label><span className="field-label">{label}{required && <span className="text-[var(--danger)]"> *</span>}</span>{children}</label>;
}

function FormSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)] sm:p-7"><h2 className="text-lg font-bold">{title}</h2><p className="mt-1 text-sm text-[var(--muted-strong)]">{description}</p><div className="mt-6 grid gap-5 sm:grid-cols-2">{children}</div></section>;
}

function Review({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-3 border-b border-[var(--line)] pb-3"><span className="text-[var(--muted)]">{label}</span><strong className="max-w-[170px] text-right">{value}</strong></div>;
}

function Rank({ label, value, percent }: { label: string; value: string; percent: string }) {
  return <div><div className="flex justify-between text-sm"><span>{label}</span><strong>{value}</strong></div><div className="mt-2 h-2 rounded-full bg-[var(--surface-soft)]"><div className="h-full rounded-full bg-[var(--brand)]" style={{ width: percent }} /></div></div>;
}

function SettingsHeading({ title, description, className = "" }: { title: string; description: string; className?: string }) {
  return <div className={className}><h2 className="text-lg font-bold">{title}</h2><p className="mt-1 text-sm text-[var(--muted-strong)]">{description}</p></div>;
}

function Toggle({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: () => void }) {
  return <div className="flex items-center justify-between gap-5 py-5"><div><strong className="block text-sm">{title}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{description}</span></div><button type="button" role="switch" aria-checked={checked} onClick={onChange} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? "bg-[var(--brand)]" : "bg-slate-300"}`}><span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-transform ${checked ? "left-6" : "left-1"}`} /></button></div>;
}

function labelFor(key: string) {
  return ({ name: "Alimento", category: "Categoria", stock: "Estoque", location: "Local", validity: "Validade do estoque", status: "Status" } as Record<string, string>)[key] || key;
}

function downloadFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
