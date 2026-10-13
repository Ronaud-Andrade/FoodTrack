import { useMemo, useState, type FormEvent, type ReactNode } from "react";

type PageProps = {
  page: string;
  navigate: (page: string) => void;
  notify: (message: string) => void;
  openWaste: () => void;
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

const inventory = [
  { name: "Filé Mignon Bovino", category: "Carnes", stock: "8,5 kg", location: "Câmara Fria 1", batch: "#FM2408", expiry: "24/10/2024", status: "Crítico" },
  { name: "Salmão Fresco em Postas", category: "Pescados", stock: "4,2 kg", location: "Câmara Fria 2", batch: "#SF1390", expiry: "25/10/2024", status: "Atenção" },
  { name: "Rúcula Hidropônica", category: "Hortifruti", stock: "14 maços", location: "Gaveta 3", batch: "#RH4412", expiry: "24/10/2024", status: "Crítico" },
  { name: "Queijo Muçarela Fatiado", category: "Laticínios", stock: "12 kg", location: "Geladeira 1", batch: "#QM9822", expiry: "26/10/2024", status: "Atenção" },
  { name: "Creme de Leite Fresco", category: "Laticínios", stock: "10 L", location: "Geladeira 1", batch: "#CL9901", expiry: "27/10/2024", status: "Atenção" },
  { name: "Arroz Arbóreo", category: "Mercearia", stock: "18 kg", location: "Despensa", batch: "#AA1028", expiry: "18/05/2025", status: "Em dia" },
  { name: "Azeite Extravirgem", category: "Mercearia", stock: "8 un.", location: "Despensa", batch: "#AZ7721", expiry: "03/08/2025", status: "Em dia" },
];

export default function WorkspacePage(props: PageProps) {
  if (props.page === "Prioridades") return <PriorityPage {...props} />;
  if (props.page === "Estoque") return <InventoryPage {...props} />;
  if (props.page === "Cadastrar Alimento") return <CreateFoodPage {...props} />;
  if (props.page === "Desperdícios") return <WastePage {...props} />;
  if (props.page === "Relatórios") return <ReportsPage {...props} />;
  if (props.page === "Configurações") return <SettingsPage {...props} />;
  return null;
}

function PriorityPage({ navigate, notify, openWaste }: PageProps) {
  const [filter, setFilter] = useState("Todos");
  const [resolved, setResolved] = useState<string[]>([]);
  const priorities = [
    { name: "Filé Mignon Bovino", category: "Carnes", amount: "8,5 kg", expiry: "Vence hoje", loss: "R$ 380,00", suggestion: "Usar no estrogonofe do menu executivo", critical: true },
    { name: "Rúcula Hidropônica", category: "Hortifruti", amount: "14 maços", expiry: "Vence hoje", loss: "R$ 84,00", suggestion: "Preparar pesto ou salada Caesar", critical: true },
    { name: "Salmão Fresco em Postas", category: "Pescados", amount: "4,2 kg", expiry: "Vence amanhã", loss: "R$ 290,00", suggestion: "Usar no jantar como prato especial", critical: false },
    { name: "Queijo Muçarela Fatiado", category: "Laticínios", amount: "12 kg", expiry: "Vence em 2 dias", loss: "R$ 216,00", suggestion: "Priorizar gratinados, massas e pizzas", critical: false },
    { name: "Creme de Leite Fresco", category: "Laticínios", amount: "10 L", expiry: "Vence em 3 dias", loss: "R$ 180,00", suggestion: "Usar em molhos e sobremesas", critical: false },
    { name: "Tomate Italiano", category: "Hortifruti", amount: "6 kg", expiry: "Vence em 3 dias", loss: "R$ 72,00", suggestion: "Preparar molho fresco para massas", critical: false },
  ];
  const visible = priorities.filter((item) => filter === "Todos" || (filter === "Vencem hoje" ? item.critical : item.category === filter));
  const markForPrep = (name: string) => {
    setResolved((current) => [...current, name]);
    notify(`${name} foi enviado para o preparo`);
  };
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
          <div className="flex gap-2 overflow-x-auto">{["Todos", "Vencem hoje", "Carnes", "Pescados", "Hortifruti", "Laticínios"].map((item) => <button key={item} onClick={() => setFilter(item)} className={`min-h-10 whitespace-nowrap rounded-lg px-3 text-sm font-semibold ${filter === item ? "bg-[var(--ink)] text-white" : "bg-[var(--surface-soft)] text-[var(--muted-strong)]"}`}>{item}</button>)}</div>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {visible.map((item, index) => {
            const done = resolved.includes(item.name);
            return <article key={item.name} className={`grid gap-4 p-5 transition sm:p-6 lg:grid-cols-[44px_minmax(0,1fr)_auto] lg:items-center ${done ? "bg-[var(--brand-soft)]/50 opacity-70" : ""}`}>
              <span className={`grid size-10 place-items-center rounded-full text-sm font-bold ${item.critical ? "bg-[var(--danger-soft)] text-[var(--danger)]" : "bg-[var(--warning-soft)] text-[var(--warning)]"}`}>{done ? <MiniIcon name="check" /> : index + 1}</span>
              <div>
                <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{item.name}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.critical ? "bg-[var(--danger-soft)] text-[var(--danger)]" : "bg-[var(--warning-soft)] text-[var(--warning-ink)]"}`}>{item.expiry}</span></div>
                <p className="mt-1.5 text-sm text-[var(--muted-strong)]">{item.category} · {item.amount} · Perda estimada: <strong className="text-[var(--danger)]">{item.loss}</strong></p>
                <p className="mt-2 text-sm"><strong>Sugestão:</strong> {item.suggestion}</p>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button disabled={done} onClick={() => markForPrep(item.name)} className="min-h-11 rounded-xl bg-[var(--brand)] px-4 text-sm font-bold text-white disabled:cursor-default disabled:bg-[var(--muted)]">{done ? "Enviado ao preparo" : "Usar no preparo"}</button>
                {!done && <button onClick={openWaste} className="min-h-11 rounded-xl border border-[var(--line)] px-4 text-sm font-semibold text-[var(--muted-strong)]">Registrar baixa</button>}
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

function InventoryPage({ navigate, notify }: PageProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [status, setStatus] = useState("Todos");
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<(typeof inventory)[number] | null>(null);

  const rows = useMemo(() => inventory.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()) &&
    (category === "Todas" || item.category === category) &&
    (status === "Todos" || item.status === status)
  ), [query, category, status]);

  const exportInventory = () => {
    const csv = ["Produto,Categoria,Estoque,Local,Lote,Validade,Status", ...rows.map((item) => Object.values(item).join(","))].join("\n");
    downloadFile("estoque-foodtrack.csv", csv, "text/csv");
    notify("Estoque exportado em CSV");
  };
  const printLabels = () => {
    if (selected.length === 0) {
      notify("Selecione um ou mais alimentos para imprimir as etiquetas");
      return;
    }
    notify(`${selected.length} etiqueta(s) enviada(s) para impressão`);
    setSelected([]);
  };

  return (
    <>
      <PageHeader eyebrow="Gestão de inventário" title="Estoque de Alimentos" description="Acompanhe quantidades, lotes, locais de armazenamento e validades em tempo real." actions={<><SecondaryButton onClick={printLabels} icon="printer">Imprimir etiquetas</SecondaryButton><SecondaryButton onClick={exportInventory} icon="download">Exportar estoque</SecondaryButton><PrimaryButton onClick={() => navigate("Cadastrar Alimento")} icon="plus">Cadastrar alimento</PrimaryButton></>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Summary label="Total de itens" value="348" detail="Em 6 categorias" icon="box" />
        <Summary label="Valor em estoque" value="R$ 18.740" detail="+4,8% este mês" icon="chart" />
        <Summary label="Estoque baixo" value="12" detail="Precisam de reposição" icon="filter" tone="warning" />
        <Summary label="Próximos do vencimento" value="8" detail="Ação recomendada" icon="calendar" tone="danger" />
      </div>
      <section className="mt-6 overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)]">
        <div className="flex flex-col gap-4 border-b border-[var(--line)] p-5 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--icon)]"><MiniIcon name="search" /></span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="field pl-10" placeholder="Buscar por nome do alimento..." aria-label="Buscar no estoque" />
          </div>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="field lg:w-44" aria-label="Filtrar categoria"><option>Todas</option><option>Carnes</option><option>Pescados</option><option>Hortifruti</option><option>Laticínios</option><option>Mercearia</option></select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="field lg:w-40" aria-label="Filtrar status"><option>Todos</option><option>Em dia</option><option>Atenção</option><option>Crítico</option></select>
        </div>
        {selected.length > 0 && <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--brand-border)] bg-[var(--brand-soft)] px-5 py-3 text-sm"><strong>{selected.length} item(ns) selecionado(s)</strong><div className="flex gap-2"><button onClick={printLabels} className="min-h-10 rounded-lg border border-[var(--brand-border)] bg-white px-3 font-semibold">Imprimir etiquetas</button><button onClick={() => { notify("Movimentação em lote iniciada"); setSelected([]); }} className="min-h-10 rounded-lg bg-[var(--brand)] px-3 font-semibold text-white">Movimentar</button></div></div>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead><tr className="border-b border-[var(--line)] bg-[var(--surface-soft)] text-xs uppercase tracking-wide text-[var(--muted-strong)]"><th className="w-12 px-5 py-4"><input type="checkbox" aria-label="Selecionar todos" checked={selected.length === rows.length && rows.length > 0} onChange={(event) => setSelected(event.target.checked ? rows.map((row) => row.name) : [])} /></th><th>Alimento</th><th>Estoque</th><th>Localização</th><th>Lote</th><th>Validade</th><th>Status</th><th className="pr-5 text-right">Ação</th></tr></thead>
            <tbody>{rows.map((item) => <tr key={item.name} className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--surface-soft)]"><td className="px-5 py-4"><input type="checkbox" aria-label={`Selecionar ${item.name}`} checked={selected.includes(item.name)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, item.name] : current.filter((name) => name !== item.name))} /></td><td className="py-4"><strong className="block">{item.name}</strong><span className="text-xs text-[var(--muted)]">{item.category}</span></td><td>{item.stock}</td><td>{item.location}</td><td className="text-[var(--muted-strong)]">{item.batch}</td><td>{item.expiry}</td><td><StatusBadge status={item.status} /></td><td className="pr-5 text-right"><button onClick={() => setDetail(item)} className="min-h-10 rounded-lg px-3 font-bold text-[var(--brand-dark)] hover:bg-[var(--brand-soft)]">Ver detalhes</button></td></tr>)}</tbody>
          </table>
          {rows.length === 0 && <EmptyState title="Nenhum alimento encontrado" description="Altere os filtros ou cadastre um novo alimento." action={() => { setQuery(""); setCategory("Todas"); setStatus("Todos"); }} actionLabel="Limpar filtros" />}
        </div>
        <div className="flex items-center justify-between bg-[var(--surface-soft)] px-5 py-4 text-sm text-[var(--muted-strong)]"><span>Exibindo {rows.length} de 348 itens</span><div className="flex gap-2"><button disabled className="min-h-10 rounded-lg border border-[var(--line)] px-3 disabled:cursor-not-allowed disabled:opacity-40">Anterior</button><button onClick={() => notify("Próxima página carregada")} className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3">Próxima</button></div></div>
      </section>
      {detail && <Modal title="Detalhes do alimento" close={() => setDetail(null)}><div className="grid gap-4 sm:grid-cols-2">{Object.entries(detail).map(([key, value]) => <div key={key} className="rounded-xl bg-[var(--surface-soft)] p-3"><p className="text-xs font-bold uppercase text-[var(--muted)]">{labelFor(key)}</p><p className="mt-1 font-semibold">{value}</p></div>)}</div><div className="mt-6 flex justify-end gap-3"><SecondaryButton onClick={() => { setDetail(null); notify("Editor de alimento aberto"); }}>Editar</SecondaryButton><PrimaryButton onClick={() => { setDetail(null); notify("Movimentação registrada"); }}>Registrar movimentação</PrimaryButton></div></Modal>}
    </>
  );
}

function CreateFoodPage({ navigate, notify }: PageProps) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", quantity: "", unit: "kg", batch: "", expiry: "", location: "", minStock: "", supplier: "", cost: "" });

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    notify("Alimento cadastrado no estoque");
  };

  if (submitted) return <div className="mx-auto max-w-xl py-16 text-center"><span className="mx-auto grid size-16 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]"><MiniIcon name="check" size={30} /></span><h1 className="mt-5 text-3xl font-bold">Alimento cadastrado</h1><p className="mt-2 text-[var(--muted-strong)]">{form.name} já está disponível no inventário da unidade.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><SecondaryButton onClick={() => { setSubmitted(false); setForm({ name: "", category: "", quantity: "", unit: "kg", batch: "", expiry: "", location: "", minStock: "", supplier: "", cost: "" }); }}>Cadastrar outro</SecondaryButton><PrimaryButton onClick={() => navigate("Estoque")}>Ver no estoque</PrimaryButton></div></div>;

  return (
    <>
      <PageHeader eyebrow="Entrada de inventário" title="Cadastrar Alimento" description="Registre um novo item com informações de lote, validade e armazenamento." />
      <form onSubmit={submit} className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-6">
          <FormSection title="Informações do alimento" description="Dados de identificação e classificação.">
            <Field label="Nome do alimento" required><input required value={form.name} onChange={(e) => update("name", e.target.value)} className="field" placeholder="Ex.: Filé de peito de frango" /></Field>
            <Field label="Categoria" required><select required value={form.category} onChange={(e) => update("category", e.target.value)} className="field"><option value="">Selecione</option><option>Carnes</option><option>Pescados</option><option>Hortifruti</option><option>Laticínios</option><option>Mercearia</option><option>Bebidas</option></select></Field>
            <Field label="Fornecedor"><input value={form.supplier} onChange={(e) => update("supplier", e.target.value)} className="field" placeholder="Nome do fornecedor" /></Field>
            <Field label="Custo unitário"><input value={form.cost} onChange={(e) => update("cost", e.target.value)} className="field" type="number" min="0" step="0.01" placeholder="R$ 0,00" /></Field>
          </FormSection>
          <FormSection title="Estoque e validade" description="Controle de quantidade e rastreabilidade.">
            <Field label="Quantidade inicial" required><input required value={form.quantity} onChange={(e) => update("quantity", e.target.value)} className="field" type="number" min="0.1" step="0.1" placeholder="0,0" /></Field>
            <Field label="Unidade" required><select value={form.unit} onChange={(e) => update("unit", e.target.value)} className="field"><option>kg</option><option>litros</option><option>unidades</option><option>maços</option><option>caixas</option></select></Field>
            <Field label="Número do lote" required><input required value={form.batch} onChange={(e) => update("batch", e.target.value)} className="field" placeholder="Ex.: LT-2024-001" /></Field>
            <Field label="Data de validade" required><input required value={form.expiry} onChange={(e) => update("expiry", e.target.value)} className="field" type="date" /></Field>
            <Field label="Local de armazenamento" required><select required value={form.location} onChange={(e) => update("location", e.target.value)} className="field"><option value="">Selecione</option><option>Câmara Fria 1</option><option>Câmara Fria 2</option><option>Geladeira 1</option><option>Freezer</option><option>Despensa</option></select></Field>
            <Field label="Estoque mínimo"><input value={form.minStock} onChange={(e) => update("minStock", e.target.value)} className="field" type="number" min="0" placeholder="Alerta de reposição" /></Field>
          </FormSection>
        </div>
        <aside className="sticky top-24 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)]">
          <h2 className="font-bold">Resumo do cadastro</h2>
          <div className="mt-5 space-y-4 text-sm"><Review label="Alimento" value={form.name || "Não informado"} /><Review label="Categoria" value={form.category || "Não informada"} /><Review label="Quantidade" value={form.quantity ? `${form.quantity} ${form.unit}` : "Não informada"} /><Review label="Validade" value={form.expiry ? new Date(`${form.expiry}T12:00`).toLocaleDateString("pt-BR") : "Não informada"} /><Review label="Local" value={form.location || "Não informado"} /></div>
          <p className="mt-5 rounded-xl bg-[var(--brand-soft)] p-3 text-xs leading-relaxed text-[var(--brand-dark)]">Os alertas de validade serão calculados automaticamente após o cadastro.</p>
          <button type="submit" className="mt-5 min-h-11 w-full rounded-xl bg-[var(--brand)] font-bold text-white">Cadastrar alimento</button>
          <button type="button" onClick={() => navigate("Estoque")} className="mt-2 min-h-11 w-full rounded-xl text-sm font-semibold text-[var(--muted-strong)]">Cancelar</button>
        </aside>
      </form>
    </>
  );
}

function WastePage({ openWaste, notify }: PageProps) {
  const [period, setPeriod] = useState("Este mês");
  const [reason, setReason] = useState("Todos os motivos");
  const records = [
    { date: "24/10/2024, 10:42", food: "Tomate Italiano", amount: "2,4 kg", reason: "Vencimento", cost: "R$ 28,80", user: "Marina Rocha" },
    { date: "23/10/2024, 18:16", food: "Arroz Branco Cozido", amount: "3,1 kg", reason: "Excesso de produção", cost: "R$ 18,60", user: "Carlos Mendes" },
    { date: "22/10/2024, 14:05", food: "Leite Integral", amount: "6 L", reason: "Armazenamento inadequado", cost: "R$ 31,20", user: "Bruno Silveira" },
    { date: "21/10/2024, 22:10", food: "Salmão Fresco", amount: "1,2 kg", reason: "Erro de preparo", cost: "R$ 82,00", user: "Lucas Lima" },
  ].filter((row) => reason === "Todos os motivos" || row.reason === reason);
  return (
    <>
      <PageHeader eyebrow="Controle de perdas" title="Desperdícios" description="Registre baixas, identifique causas recorrentes e acompanhe a economia gerada." actions={<PrimaryButton onClick={openWaste} icon="plus">Registrar desperdício</PrimaryButton>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Summary label="Desperdício no mês" value="18,4 kg" detail="-28% vs. mês anterior" icon="trash" /><Summary label="Custo das perdas" value="R$ 460" detail="Meta: até R$ 600" icon="chart" /><Summary label="Principal motivo" value="45%" detail="Armazenamento inadequado" icon="filter" tone="warning" /><Summary label="Economia gerada" value="R$ 3.420" detail="Com ações preventivas" icon="check" /></div>
      <section className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)] sm:p-6">
        <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-lg font-bold">Histórico de registros</h2><p className="mt-1 text-sm text-[var(--muted-strong)]">Baixas registradas pela equipe da cozinha.</p></div><div className="flex flex-wrap gap-3"><select value={period} onChange={(e) => setPeriod(e.target.value)} className="field w-auto"><option>Hoje</option><option>Esta semana</option><option>Este mês</option></select><select value={reason} onChange={(e) => setReason(e.target.value)} className="field w-auto"><option>Todos os motivos</option><option>Vencimento</option><option>Excesso de produção</option><option>Armazenamento inadequado</option><option>Erro de preparo</option></select><SecondaryButton onClick={() => { downloadFile("desperdicios.csv", "Data,Alimento,Quantidade,Motivo,Custo,Responsável\n" + records.map((r) => Object.values(r).join(",")).join("\n"), "text/csv"); notify("Histórico exportado"); }} icon="download">Exportar</SecondaryButton></div></div>
        <div className="overflow-x-auto"><table className="mt-2 w-full min-w-[820px] text-left text-sm"><thead><tr className="text-xs uppercase text-[var(--muted)]"><th className="py-4">Data e hora</th><th>Alimento</th><th>Quantidade</th><th>Motivo</th><th>Custo estimado</th><th>Responsável</th></tr></thead><tbody>{records.map((row) => <tr key={row.date} className="border-t border-[var(--line)]"><td className="py-4 text-[var(--muted-strong)]">{row.date}</td><td className="font-semibold">{row.food}</td><td>{row.amount}</td><td><span className="rounded-full bg-[var(--danger-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--danger)]">{row.reason}</span></td><td>{row.cost}</td><td>{row.user}</td></tr>)}</tbody></table></div>
      </section>
    </>
  );
}

function ReportsPage({ notify }: PageProps) {
  const [report, setReport] = useState("Visão geral");
  const [period, setPeriod] = useState("Este mês");
  const reports = {
    "Visão geral": {
      question: "Como está o desempenho geral da cozinha?",
      answer: "A operação melhorou: o desperdício caiu 28% e R$ 3.420 foram preservados neste mês.",
      metrics: [
        ["Economia gerada", "R$ 3.420", "Valor de alimentos que deixaram de ser descartados", "chart"],
        ["Desperdício evitado", "72,8 kg", "Equivale a aproximadamente 146 refeições", "check"],
        ["Itens aproveitados", "186", "Produtos utilizados antes do vencimento", "box"],
        ["Acurácia do estoque", "96,4%", "Diferença entre sistema e estoque físico", "chart"],
      ],
      chartTitle: "Desperdício por semana",
      chartDescription: "Quanto menor a barra, melhor o resultado.",
      bars: [["Semana 1", 31, "31 kg"], ["Semana 2", 26, "26 kg"], ["Semana 3", 22, "22 kg"], ["Semana 4", 18, "18 kg"]],
      breakdownTitle: "Onde mais economizamos",
      breakdown: [["Carnes e pescados", "R$ 1.420", "88%"], ["Hortifruti", "R$ 870", "62%"], ["Laticínios", "R$ 690", "47%"], ["Mercearia", "R$ 440", "31%"]],
      action: "Continuar priorizando os 8 alimentos próximos do vencimento.",
    },
    "Validades": {
      question: "Estamos usando os alimentos antes de vencer?",
      answer: "Sim. 94% dos itens em risco foram utilizados a tempo, mas 8 produtos ainda precisam de atenção.",
      metrics: [
        ["Aproveitados a tempo", "186", "Itens utilizados antes do vencimento", "check"],
        ["Vencidos no período", "11", "Itens que precisaram ser descartados", "trash"],
        ["Taxa de aproveitamento", "94%", "Meta mensal definida em 90%", "chart"],
        ["Risco atual", "R$ 1.150", "Valor dos 8 itens que vencem em breve", "calendar"],
      ],
      chartTitle: "Itens que venceram por semana",
      chartDescription: "A quantidade caiu durante o mês.",
      bars: [["Semana 1", 8, "8 itens"], ["Semana 2", 6, "6 itens"], ["Semana 3", 4, "4 itens"], ["Semana 4", 2, "2 itens"]],
      breakdownTitle: "Itens em risco por categoria",
      breakdown: [["Carnes e pescados", "3 itens", "75%"], ["Laticínios", "2 itens", "50%"], ["Hortifruti", "2 itens", "50%"], ["Mercearia", "1 item", "25%"]],
      action: "Usar carnes e pescados prioritários no menu de hoje.",
    },
    "Desperdícios": {
      question: "O que está causando mais desperdício?",
      answer: "O armazenamento inadequado representa 45% das perdas e deve ser o primeiro ponto de correção.",
      metrics: [
        ["Total desperdiçado", "18,4 kg", "28% menos que no mês anterior", "trash"],
        ["Custo das perdas", "R$ 460", "Abaixo da meta máxima de R$ 600", "chart"],
        ["Principal causa", "45%", "Armazenamento inadequado", "filter"],
        ["Registros realizados", "14", "Baixas informadas pela equipe", "box"],
      ],
      chartTitle: "Quilos desperdiçados por semana",
      chartDescription: "Os registros diminuíram após a revisão da câmara fria.",
      bars: [["Semana 1", 7.2, "7,2 kg"], ["Semana 2", 5.1, "5,1 kg"], ["Semana 3", 3.8, "3,8 kg"], ["Semana 4", 2.3, "2,3 kg"]],
      breakdownTitle: "Motivos das perdas",
      breakdown: [["Armazenamento inadequado", "45%", "90%"], ["Vencimento", "35%", "70%"], ["Excesso de compra", "12%", "24%"], ["Erro de preparo", "8%", "16%"]],
      action: "Revisar a temperatura e vedação da Câmara Fria 2.",
    },
    "Compras": {
      question: "Estamos comprando na quantidade correta?",
      answer: "A maior parte das compras está adequada, mas há excesso recorrente em hortifrúti.",
      metrics: [
        ["Total comprado", "R$ 12.840", "Valor adquirido neste mês", "chart"],
        ["Compras planejadas", "94%", "Pedidos dentro da previsão de consumo", "check"],
        ["Valor em excesso", "R$ 1.120", "Compras acima da demanda estimada", "box"],
        ["Sugestões de ajuste", "8", "Recomendações para o próximo pedido", "filter"],
      ],
      chartTitle: "Comprado além do consumo",
      chartDescription: "Valor estimado de excesso por semana.",
      bars: [["Semana 1", 420, "R$ 420"], ["Semana 2", 330, "R$ 330"], ["Semana 3", 240, "R$ 240"], ["Semana 4", 130, "R$ 130"]],
      breakdownTitle: "Excesso por categoria",
      breakdown: [["Hortifruti", "R$ 480", "86%"], ["Laticínios", "R$ 310", "55%"], ["Carnes", "R$ 210", "38%"], ["Mercearia", "R$ 120", "22%"]],
      action: "Reduzir em 15% o próximo pedido de hortifrúti.",
    },
  } as const;
  const current = reports[report as keyof typeof reports];
  const maxBar = Math.max(...current.bars.map((item) => Number(item[1])));
  const exportReport = () => { downloadFile("relatorio-foodtrack.txt", `FoodTrack — ${report}\nPeríodo: ${period}\n\n${current.question}\n${current.answer}\n\nAção recomendada: ${current.action}`, "text/plain"); notify("Relatório baixado com sucesso"); };
  return (
    <>
      <PageHeader eyebrow="Resultados da operação" title="Relatórios" description="Escolha um assunto para entender o resultado e saber qual ação tomar." actions={<><label><span className="sr-only">Período do relatório</span><select value={period} onChange={(e) => setPeriod(e.target.value)} className="field w-auto"><option>Esta semana</option><option>Este mês</option><option>Últimos 3 meses</option><option>Este ano</option></select></label><PrimaryButton onClick={exportReport} icon="download">Baixar relatório</PrimaryButton></>} />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[["Visão geral", "Resumo da operação"], ["Validades", "Uso antes de vencer"], ["Desperdícios", "Perdas e suas causas"], ["Compras", "Pedidos e excessos"]].map(([tab, description]) => <button key={tab} onClick={() => setReport(tab)} className={`min-h-[76px] rounded-xl border p-4 text-left transition ${report === tab ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-dark)]" : "border-[var(--line)] bg-white hover:border-[var(--brand-border)]"}`}><strong className="block text-sm">{tab}</strong><span className={`mt-1 block text-xs ${report === tab ? "text-[var(--brand)]" : "text-[var(--muted)]"}`}>{description}</span></button>)}
      </div>
      <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 sm:flex-row sm:items-center">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-[var(--brand)]"><MiniIcon name="check" size={22} /></span>
        <div className="flex-1"><p className="text-sm font-bold text-[var(--brand-dark)]">{current.question}</p><p className="mt-1 text-sm leading-relaxed text-[var(--muted-strong)]">{current.answer}</p></div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{current.metrics.map(([label, value, detail, icon]) => <Summary key={label} label={label} value={value} detail={detail} icon={icon as MiniIconName} />)}</div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)] sm:p-6">
          <h2 className="text-lg font-bold">{current.chartTitle}</h2><p className="mt-1 text-sm text-[var(--muted-strong)]">{current.chartDescription}</p>
          <div className="mt-7 grid h-64 grid-cols-4 items-end gap-3 border-b border-[var(--line)] px-2 sm:gap-6">{current.bars.map(([name, value, display]) => <div key={name} className="flex h-full flex-col items-center justify-end"><strong className="mb-2 text-xs">{display}</strong><div className="w-full max-w-14 rounded-t-lg bg-[var(--brand)] transition-all" style={{ height: `${Math.max(12, Number(value) / maxBar * 78)}%` }} /></div>)}</div>
          <div className="grid grid-cols-4 gap-3 px-2 pt-3 text-center text-xs text-[var(--muted)]">{current.bars.map(([name]) => <span key={name}>{name}</span>)}</div>
        </section>
        <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)] sm:p-6">
          <h2 className="text-lg font-bold">{current.breakdownTitle}</h2><p className="mt-1 text-sm text-[var(--muted-strong)]">Detalhamento do período selecionado</p>
          <div className="mt-7 space-y-6">{current.breakdown.map(([label, value, percent]) => <Rank key={label} label={label} value={value} percent={percent} />)}</div>
        </section>
      </div>
      <section className="mt-6 flex flex-col justify-between gap-4 rounded-2xl bg-[var(--ink)] p-5 text-white sm:flex-row sm:items-center sm:p-6"><div><p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--brand-soft)]">Próxima ação recomendada</p><p className="mt-2 font-semibold">{current.action}</p></div><button onClick={() => notify("Ação adicionada à lista de tarefas da equipe")} className="min-h-11 shrink-0 rounded-xl bg-white px-5 text-sm font-bold text-[var(--ink)]">Adicionar como tarefa</button></section>
    </>
  );
}

function SettingsPage({ notify }: PageProps) {
  const [tab, setTab] = useState("Restaurante");
  const [notifications, setNotifications] = useState({ expiry: true, stock: true, waste: true, email: false, browser: true });
  const [memberModal, setMemberModal] = useState(false);
  const save = (event: FormEvent) => { event.preventDefault(); notify("Configurações salvas"); };
  const tabs = [
    ["Restaurante", "Dados e regras gerais"],
    ["Alertas", "Validade e notificações"],
    ["Equipe", "Usuários e permissões"],
  ];
  return (
    <>
      <PageHeader eyebrow="Administração" title="Configurações" description="Gerencie os dados do restaurante, os alertas do sistema e o acesso da equipe." />
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-soft)] p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[var(--brand)]"><MiniIcon name="check" /></span>
        <div className="flex-1"><p className="text-sm font-bold text-[var(--brand-dark)]">Sistema configurado e funcionando</p><p className="mt-0.5 text-xs text-[var(--muted-strong)]">Última alteração salva hoje, às 18:42.</p></div>
        <span className="hidden rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--brand-dark)] sm:block">Tudo certo</span>
      </div>
      <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-[var(--line)] bg-white p-2 shadow-[var(--shadow)]">
          <p className="px-3 pb-2 pt-3 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Preferências</p>
          {tabs.map(([item, description]) => <button key={item} onClick={() => setTab(item)} className={`mb-1 min-h-[62px] w-full rounded-xl px-3 text-left transition ${tab === item ? "bg-[var(--brand-soft)] text-[var(--brand-dark)]" : "text-[var(--muted-strong)] hover:bg-[var(--surface-soft)]"}`}><strong className="block text-sm">{item}</strong><span className={`mt-0.5 block text-xs font-normal ${tab === item ? "text-[var(--brand)]" : "text-[var(--muted)]"}`}>{description}</span></button>)}
          <div className="mx-2 mt-3 border-t border-[var(--line)] px-1 py-4">
            <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-[var(--ink)] text-xs font-bold text-white">BS</span><div><strong className="block text-xs">Bruno Silveira</strong><span className="text-[0.68rem] text-[var(--muted)]">Administrador</span></div></div>
          </div>
        </aside>

        <form onSubmit={save} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)]">
          {tab === "Restaurante" && <>
            <div className="border-b border-[var(--line)] p-5 sm:p-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[var(--brand)] text-xl font-bold text-white">FT</span><div className="flex-1"><h2 className="text-lg font-bold">FoodTrack Bistrô & Restaurante</h2><p className="mt-1 text-sm text-[var(--muted-strong)]">Informações utilizadas em relatórios, registros e exportações.</p></div><button type="button" onClick={() => notify("Seletor de imagem aberto")} className="min-h-10 rounded-xl border border-[var(--line)] px-4 text-sm font-bold text-[var(--muted-strong)]">Alterar imagem</button></div></div>
            <div className="p-5 sm:p-7">
              <SettingsHeading title="Dados do restaurante" description="Mantenha as informações de contato atualizadas." />
              <div className="mt-6 grid gap-5 sm:grid-cols-2"><Field label="Nome do restaurante"><input className="field" defaultValue="FoodTrack Bistrô & Restaurante" /></Field><Field label="CNPJ"><input className="field" defaultValue="12.345.678/0001-90" /></Field><Field label="Telefone"><input className="field" type="tel" defaultValue="(11) 3022-1840" /></Field><Field label="E-mail operacional"><input className="field" type="email" defaultValue="operacao@foodtrack.com.br" /></Field><Field label="Cidade"><input className="field" defaultValue="São Paulo — SP" /></Field><Field label="Fuso horário"><select className="field"><option>Brasília (GMT-3)</option></select></Field></div>
              <div className="my-8 border-t border-[var(--line)]" />
              <SettingsHeading title="Regras do estoque" description="Defina o comportamento padrão dos alertas e valores." />
              <div className="mt-6 grid gap-5 sm:grid-cols-2"><Field label="Avisar antes do vencimento"><select className="field" defaultValue="3"><option value="1">1 dia antes</option><option value="3">3 dias antes</option><option value="5">5 dias antes</option><option value="7">7 dias antes</option></select></Field><Field label="Moeda utilizada"><select className="field"><option>Real brasileiro (R$)</option></select></Field></div>
            </div>
          </>}

          {tab === "Alertas" && <div className="p-5 sm:p-7">
            <SettingsHeading title="Alertas e notificações" description="Escolha quais acontecimentos precisam chamar a atenção da equipe." />
            <div className="mt-6 rounded-2xl border border-[var(--line)] px-5">{Object.entries({ expiry: ["Alimentos próximos do vencimento", "Avisar quando um produto entrar no período crítico de validade."], stock: ["Estoque abaixo do mínimo", "Avisar quando a quantidade disponível exigir reposição."], waste: ["Novo desperdício registrado", "Informar gestores sempre que uma baixa por perda for criada."], browser: ["Notificações no navegador", "Exibir os alertas mesmo quando outra tela estiver aberta."], email: ["Resumo diário por e-mail", "Enviar um resumo da operação todos os dias às 18h."] }).map(([key, values]) => <Toggle key={key} title={values[0]} description={values[1]} checked={notifications[key as keyof typeof notifications]} onChange={() => setNotifications((current) => ({ ...current, [key]: !current[key as keyof typeof notifications] }))} />)}</div>
            <div className="mt-6 grid gap-5 rounded-2xl bg-[var(--surface-soft)] p-5 sm:grid-cols-2"><Field label="Horário do resumo diário"><input type="time" className="field bg-white" defaultValue="18:00" /></Field><Field label="E-mail para receber alertas"><input type="email" className="field bg-white" defaultValue="operacao@foodtrack.com.br" /></Field></div>
          </div>}

          {tab === "Equipe" && <div className="p-5 sm:p-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><SettingsHeading title="Equipe e acessos" description="3 membros ativos com acesso ao FoodTrack." /><PrimaryButton type="button" onClick={() => setMemberModal(true)} icon="plus">Adicionar membro</PrimaryButton></div>
            <div className="mt-6 space-y-3">{[["BS", "Bruno Silveira", "Gerente de Operações", "Administrador", "Agora"], ["MR", "Marina Rocha", "Nutricionista", "Gestora", "Há 24 min"], ["CM", "Carlos Mendes", "Estoquista", "Operador", "Ontem, 17:40"]].map((member) => <div key={member[1]} className="flex flex-col gap-4 rounded-2xl border border-[var(--line)] p-4 sm:flex-row sm:items-center"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--surface-soft)] text-xs font-bold">{member[0]}</span><div className="min-w-[170px] flex-1"><strong className="block text-sm">{member[1]}</strong><span className="text-xs text-[var(--muted)]">{member[2]}</span></div><div className="text-left sm:text-right"><span className="block text-xs font-semibold text-[var(--brand-dark)]">{member[3]}</span><span className="mt-0.5 block text-[0.68rem] text-[var(--muted)]">Último acesso: {member[4]}</span></div><button type="button" onClick={() => notify(`Permissões de ${member[1]} abertas`)} className="min-h-10 rounded-xl border border-[var(--line)] px-3 text-sm font-bold text-[var(--muted-strong)]">Gerenciar</button></div>)}</div>
            <p className="mt-5 rounded-xl bg-[var(--surface-soft)] p-4 text-xs leading-relaxed text-[var(--muted-strong)]"><strong className="text-[var(--ink)]">Sobre permissões:</strong> administradores controlam todas as configurações; gestores acessam relatórios e cadastros; operadores registram movimentações e desperdícios.</p>
          </div>}

          <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-[var(--line)] bg-[var(--surface-soft)] px-5 py-4 sm:flex-row sm:items-center sm:px-7"><span className="text-xs text-[var(--muted)]">As alterações serão aplicadas imediatamente.</span><button type="submit" className="min-h-11 rounded-xl bg-[var(--brand)] px-6 text-sm font-bold text-white">Salvar alterações</button></div>
        </form>
      </div>
      {memberModal && <Modal title="Adicionar membro" close={() => setMemberModal(false)}><form onSubmit={(e) => { e.preventDefault(); setMemberModal(false); notify("Convite enviado para o novo membro"); }} className="grid gap-5"><Field label="Nome completo" required><input required className="field" /></Field><Field label="E-mail" required><input required type="email" className="field" /></Field><Field label="Perfil de acesso" required><select className="field"><option>Operador</option><option>Gestor</option><option>Administrador</option></select></Field><div className="flex justify-end gap-3"><SecondaryButton type="button" onClick={() => setMemberModal(false)}>Cancelar</SecondaryButton><PrimaryButton type="submit">Enviar convite</PrimaryButton></div></form></Modal>}
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
  const color = status === "Crítico" ? "bg-[var(--danger-soft)] text-[var(--danger)]" : status === "Atenção" ? "bg-[var(--warning-soft)] text-[var(--warning-ink)]" : "bg-[var(--brand-soft)] text-[var(--brand-dark)]";
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
  return ({ name: "Alimento", category: "Categoria", stock: "Estoque", location: "Local", batch: "Lote", expiry: "Validade", status: "Status" } as Record<string, string>)[key] || key;
}

function downloadFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
