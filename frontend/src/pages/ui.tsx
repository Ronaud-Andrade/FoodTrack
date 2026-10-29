import type { ReactNode } from "react";

export type IconName =
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

export function Icon({ name, size = 20, className = "" }: { name: IconName; size?: number; className?: string }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export type MiniIconName = "box" | "calendar" | "chart" | "check" | "download" | "filter" | "plus" | "printer" | "search" | "trash" | "users";

export function MiniIcon({ name, size = 18 }: { name: MiniIconName; size?: number }) {
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

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
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

export function Summary({ label, value, detail, icon, tone = "brand" }: { label: string; value: string; detail: string; icon: MiniIconName; tone?: "brand" | "warning" | "danger" }) {
  const colors = tone === "danger" ? "bg-[var(--danger-soft)] text-[var(--danger)]" : tone === "warning" ? "bg-[var(--warning-soft)] text-[var(--warning)]" : "bg-[var(--brand-soft)] text-[var(--brand)]";
  return <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)]"><div className={`grid size-10 place-items-center rounded-xl ${colors}`}><MiniIcon name={icon} /></div><p className="mt-4 text-sm text-[var(--muted-strong)]">{label}</p><p className="mt-1 text-2xl font-bold tracking-tight">{value}</p><p className="mt-1 text-xs font-medium text-[var(--muted)]">{detail}</p></div>;
}

export function PrimaryButton({ children, onClick, icon, type = "button" }: { children: ReactNode; onClick?: () => void; icon?: MiniIconName; type?: "button" | "submit" }) {
  return <button type={type} onClick={onClick} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 text-sm font-bold text-white hover:bg-[var(--brand-dark)]">{icon && <MiniIcon name={icon} />}{children}</button>;
}

export function SecondaryButton({ children, onClick, icon, type = "button" }: { children: ReactNode; onClick?: () => void; icon?: MiniIconName; type?: "button" | "submit" }) {
  return <button type={type} onClick={onClick} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-white px-5 text-sm font-bold text-[var(--muted-strong)] hover:border-[var(--brand)] hover:text-[var(--brand-dark)]">{icon && <MiniIcon name={icon} />}{children}</button>;
}

export function StatusBadge({ status }: { status: string }) {
  const color = status === "Vencido" ? "bg-[var(--danger-soft)] text-[var(--danger)]" : status === "Atenção" || status === "Sem validade" ? "bg-[var(--warning-soft)] text-[var(--warning-ink)]" : "bg-[var(--brand-soft)] text-[var(--brand-dark)]";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${color}`}>{status}</span>;
}

export function EmptyState({ title, description, action, actionLabel }: { title: string; description: string; action: () => void; actionLabel: string }) {
  return <div className="p-12 text-center"><span className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--surface-soft)] text-[var(--muted)]"><MiniIcon name="search" /></span><p className="mt-4 font-bold">{title}</p><p className="mt-1 text-sm text-[var(--muted)]">{description}</p><button onClick={action} className="mt-4 min-h-10 font-bold text-[var(--brand-dark)]">{actionLabel}</button></div>;
}

export function Modal({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-[75] grid place-items-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true"><div className="my-6 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl sm:p-7"><div className="mb-6 flex items-center justify-between gap-4"><h2 className="text-xl font-bold">{title}</h2><button onClick={close} className="grid size-11 place-items-center rounded-xl bg-[var(--surface-soft)]" aria-label="Fechar">×</button></div>{children}</div></div>;
}

export function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return <label><span className="field-label">{label}{required && <span className="text-[var(--danger)]"> *</span>}</span>{children}</label>;
}

export function FormSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)] sm:p-7"><h2 className="text-lg font-bold">{title}</h2><p className="mt-1 text-sm text-[var(--muted-strong)]">{description}</p><div className="mt-6 grid gap-5 sm:grid-cols-2">{children}</div></section>;
}

export function Review({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-3 border-b border-[var(--line)] pb-3"><span className="text-[var(--muted)]">{label}</span><strong className="max-w-[170px] text-right">{value}</strong></div>;
}

export function Rank({ label, value, percent }: { label: string; value: string; percent: string }) {
  return <div><div className="flex justify-between text-sm"><span>{label}</span><strong>{value}</strong></div><div className="mt-2 h-2 rounded-full bg-[var(--surface-soft)]"><div className="h-full rounded-full bg-[var(--brand)]" style={{ width: percent }} /></div></div>;
}

export function SettingsHeading({ title, description, className = "" }: { title: string; description: string; className?: string }) {
  return <div className={className}><h2 className="text-lg font-bold">{title}</h2><p className="mt-1 text-sm text-[var(--muted-strong)]">{description}</p></div>;
}

export function downloadFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
