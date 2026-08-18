import { useMemo, useState } from "react";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRight, Check, CircleAlert, Copy, GitBranch, LockKeyhole, Network, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

const criteria = [
  { id: "backend", label: "Backend", note: "APIs, datos y resiliencia" },
  { id: "frontend", label: "Frontend", note: "UX, accesibilidad y claridad" },
  { id: "utility", label: "Utilidad", note: "Valor real y flujo completo" },
  { id: "relevance", label: "Relevancia", note: "Problema actual y verificable" },
  { id: "potential", label: "Potencial", note: "Escala, adopción y evolución" },
  { id: "identity", label: "Identidad", note: "Coherencia y diferenciación" },
] as const;

type CriterionId = (typeof criteria)[number]["id"];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [selected, setSelected] = useState<CriterionId[]>(criteria.map(item => item.id));
  const [selectedAudit, setSelectedAudit] = useState<number | null>(null);
  const audits = trpc.audits.list.useQuery(undefined, { enabled: isAuthenticated });
  const createAudit = trpc.audits.create.useMutation({
    onSuccess: result => {
      toast.success(result.report.status === "approved" ? "Cambio aprobado con gate 10/10" : "Cambio rechazado: evidencia insuficiente");
      setSelectedAudit(result.id);
      audits.refetch();
    },
    onError: error => toast.error(error.message),
  });

  const detail = useMemo(() => audits.data?.find(item => item.id === selectedAudit), [audits.data, selectedAudit]);
  const detailReport = detail ? JSON.parse(detail.reportJson) : null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isAuthenticated) {
      startLogin();
      return;
    }
    createAudit.mutate({ name, description, code, selectedCriteria: selected as CriterionId[] });
  };

  const exportReport = () => {
    if (!detailReport) return;
    const blob = new Blob([JSON.stringify(detailReport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `proofmesh-${detail?.id ?? "audit"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f2] text-[#10201e]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <a className="flex items-center gap-3" href="#top" aria-label="ProofMesh inicio">
          <span className="brand-mark"><Network size={18} strokeWidth={2.5} /></span>
          <span className="text-lg font-semibold tracking-[-0.03em]">Proof<span className="text-[#da684a]">Mesh</span></span>
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#56706c] md:flex">
          <a href="#method" className="transition-colors hover:text-[#10201e]">Método</a>
          <a href="#audit" className="transition-colors hover:text-[#10201e]">Auditar</a>
          <a href="#history" className="transition-colors hover:text-[#10201e]">Historial</a>
        </nav>
        <Button variant="outline" className="rounded-full border-[#c9d6d0] bg-transparent px-5" onClick={() => isAuthenticated ? document.getElementById("audit")?.scrollIntoView({ behavior: "smooth" }) : startLogin()}>
          {isAuthenticated ? "Abrir auditoría" : "Entrar"}<ArrowUpRight size={16} />
        </Button>
      </header>

      <main id="top" className="mx-auto max-w-7xl px-6 pb-20 lg:px-10">
        <section className="relative overflow-hidden rounded-[2rem] bg-[#123b37] px-7 py-16 text-[#f7f7f2] shadow-[0_24px_80px_rgba(18,59,55,0.18)] lg:px-16 lg:py-24">
          <div className="hero-grid absolute inset-0 opacity-30" />
          <div className="relative max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#b5d6c9]/30 bg-[#b5d6c9]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#cde9dc]"><Sparkles size={13} /> Inteligencia de cambios con evidencia</div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-8xl">No publiques cambios que no puedas <span className="text-[#f29b7c]">probar.</span></h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#c6ddd5]">ProofMesh convierte cada cambio de código en una decisión auditable. Seis criterios, tres nodos, tres niveles y un gate que no negocia con la evidencia.</p>
            <div className="mt-10 flex flex-wrap gap-3"><Button onClick={() => document.getElementById("audit")?.scrollIntoView({ behavior: "smooth" })} className="rounded-full bg-[#f29b7c] px-6 text-[#193833] hover:bg-[#ffaf94]">Auditar un cambio <ArrowUpRight size={17} /></Button><Button variant="ghost" onClick={() => document.getElementById("method")?.scrollIntoView({ behavior: "smooth" })} className="rounded-full text-[#d7eee4] hover:bg-white/10 hover:text-white">Ver el método</Button></div>
          </div>
          <div className="relative mt-16 grid max-w-2xl grid-cols-3 gap-3 lg:absolute lg:bottom-14 lg:right-14 lg:mt-0 lg:w-[35%]">
            {["06 criterios", "03 nodos", "10/10 gate"].map((item, index) => <div key={item} className="rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur"><div className="mb-2 text-2xl font-semibold tracking-[-0.05em]">{index === 0 ? "6" : index === 1 ? "3×3" : "10"}</div><div className="text-xs uppercase tracking-[0.12em] text-[#b8d6cc]">{item}</div></div>)}
          </div>
        </section>

        <section id="method" className="grid gap-8 py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div><p className="eyebrow">El protocolo</p><h2 className="mt-4 max-w-md text-4xl font-semibold leading-tight tracking-[-0.05em]">La confianza se diseña. La evidencia se conserva.</h2><p className="mt-6 max-w-md leading-7 text-[#607773]">ProofMesh aplica una malla de validación sobre cada cambio: el contenido se sella con un hash, se revisa desde tres perspectivas y solo avanza cuando toda la superficie alcanza el estándar.</p></div>
          <div className="grid gap-4 sm:grid-cols-3">{[{ icon: ShieldCheck, title: "Integridad", text: "El payload y su hash son inseparables.", stamp: "HASH · SELLADO" }, { icon: LockKeyhole, title: "Política", text: "Las reglas se explicitan antes de evaluar.", stamp: "REGLAS · VERSIONADAS" }, { icon: GitBranch, title: "Riesgo", text: "El impacto se confronta antes de publicar.", stamp: "NODOS · 2 DE 3" }].map(({ icon: Icon, title, text, stamp }) => <Card key={title} className="border-[#d8e3dc] bg-[#fbfcf8] shadow-none"><CardContent className="p-6"><div className="mb-12 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e3f0e9] text-[#24645b]"><Icon size={19} /></div><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#6a7f7b]">{text}</p><div className="mt-6 font-mono text-[9px] tracking-[0.12em] text-[#c06a52]">{stamp}</div></CardContent></Card>)}</div>
        </section>

        <section id="audit" className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-[#d8e3dc] bg-white shadow-[0_18px_50px_rgba(21,55,50,0.06)]"><CardHeader className="border-b border-[#edf1ed] p-7"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Nueva auditoría</p><CardTitle className="mt-2 text-2xl tracking-[-0.04em]">Pon el cambio bajo la lupa</CardTitle></div><Badge className="rounded-full bg-[#e6f3eb] text-[#286b5f] hover:bg-[#e6f3eb]">Gate estricto</Badge></div></CardHeader><CardContent className="p-7"><form className="space-y-5" onSubmit={submit}><div><label className="field-label" htmlFor="name">Nombre del cambio</label><Input id="name" value={name} onChange={event => setName(event.target.value)} placeholder="Ej. Release 0.4.0" className="mt-2 h-12 rounded-xl border-[#d5e1db]" required /></div><div><label className="field-label" htmlFor="description">Descripción</label><Textarea id="description" value={description} onChange={event => setDescription(event.target.value)} placeholder="Qué cambia, por qué y qué riesgo introduce..." className="mt-2 min-h-28 rounded-xl border-[#d5e1db]" required /></div><div><label className="field-label" htmlFor="code">Diff o fragmento de código</label><Textarea id="code" value={code} onChange={event => setCode(event.target.value)} placeholder="Pega aquí el diff o código que quieres auditar" className="mt-2 min-h-44 rounded-xl border-[#d5e1db] font-mono text-xs" required /></div><div><div className="field-label mb-3">Criterios a evaluar</div><div className="grid gap-2 sm:grid-cols-2">{criteria.map(item => <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e0e9e3] p-3 transition-colors hover:border-[#a9c8bc]"><Checkbox checked={selected.includes(item.id)} onCheckedChange={checked => setSelected(current => checked ? Array.from(new Set([...current, item.id])) : current.filter(value => value !== item.id))} /><span><span className="block text-sm font-medium">{item.label}</span><span className="block text-xs text-[#7c8d89]">{item.note}</span></span></label>)}</div><p className="mt-3 text-xs text-[#a15b49]">Para aprobar, los seis criterios deben alcanzar 10/10. Desmarcar uno hará que el gate rechace el cambio.</p></div><Button type="submit" disabled={createAudit.isPending} className="h-12 w-full rounded-xl bg-[#123b37] text-[#f7f7f2] hover:bg-[#1b514a]">{createAudit.isPending ? "Evaluando evidencia..." : isAuthenticated ? "Ejecutar auditoría" : "Entrar para auditar"}<ArrowUpRight size={17} /></Button></form></CardContent></Card>

          <div id="history" className="space-y-5"><div className="flex items-end justify-between"><div><p className="eyebrow">Registro</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Historial de auditorías</h2></div>{isAuthenticated && <span className="text-xs text-[#718580]">{audits.data?.length ?? 0} cambios</span>}</div>{!isAuthenticated ? <Card className="border-[#d8e3dc] bg-[#edf5ef] shadow-none"><CardContent className="p-7"><CircleAlert className="text-[#c06a52]" size={22} /><h3 className="mt-5 font-semibold">Tu historial vive contigo</h3><p className="mt-2 text-sm leading-6 text-[#607773]">Inicia sesión para guardar auditorías, consultar evidencia y exportar informes para tus pipelines.</p><Button onClick={startLogin} variant="outline" className="mt-5 rounded-full border-[#b7d0c4] bg-transparent">Entrar en ProofMesh</Button></CardContent></Card> : audits.isLoading ? <Card className="border-[#d8e3dc] shadow-none"><CardContent className="p-7 text-sm text-[#718580]">Cargando historial...</CardContent></Card> : audits.data?.length === 0 ? <Card className="border-[#d8e3dc] shadow-none"><CardContent className="p-7 text-sm text-[#718580]">Todavía no hay auditorías. El primer cambio empieza aquí.</CardContent></Card> : <div className="space-y-3">{audits.data?.map(audit => <button key={audit.id} onClick={() => setSelectedAudit(audit.id)} className={`w-full rounded-2xl border p-5 text-left transition-all ${selectedAudit === audit.id ? "border-[#7db09f] bg-[#edf6f0]" : "border-[#d8e3dc] bg-white hover:border-[#afc9bc]"}`}><div className="flex items-start justify-between gap-4"><div><div className="font-semibold">{audit.name}</div><div className="mt-1 line-clamp-1 text-sm text-[#718580]">{audit.description}</div></div><Badge className={`rounded-full ${audit.status === "approved" ? "bg-[#dff2e6] text-[#28745d]" : "bg-[#f9e5df] text-[#a4513e]"}`}>{audit.status === "approved" ? "Aprobado" : "Rechazado"}</Badge></div><div className="mt-5 flex items-center justify-between text-xs text-[#718580]"><span>{new Date(audit.createdAt).toLocaleString()}</span><span className="font-semibold text-[#123b37]">{audit.globalScore}/10</span></div></button>)}</div>}{detailReport && <Card className="border-[#123b37] bg-[#123b37] text-[#f7f7f2] shadow-none"><CardContent className="p-6"><div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-[0.16em] text-[#a9d1c0]">Informe seleccionado</p><h3 className="mt-2 font-semibold">{detail?.name}</h3></div><Button size="icon" variant="ghost" onClick={exportReport} className="text-[#d9efe5] hover:bg-white/10 hover:text-white" aria-label="Exportar JSON"><Copy size={17} /></Button></div><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-xl bg-white/10 p-4"><div className="text-2xl font-semibold">{detailReport.globalScore}/10</div><div className="mt-1 text-xs text-[#b6d5ca]">Puntuación global</div></div><div className="rounded-xl bg-white/10 p-4"><div className="text-2xl font-semibold">{detailReport.approverNodes.length}/3</div><div className="mt-1 text-xs text-[#b6d5ca]">Nodos aprobadores</div></div></div><Separator className="my-5 bg-white/15" /><div className="space-y-4">{detailReport.criteria.map((criterion: { criterion: string; score: number; passed: boolean; nodes: Record<string, { level: string; score: number; passed: boolean; evidence: string }[]> }) => <div key={criterion.criterion} className="rounded-xl border border-white/10 p-3"><div className="flex items-center justify-between text-sm"><span className="capitalize font-medium text-[#c5ddd4]">{criterion.criterion}</span><span className={criterion.passed ? "text-[#9fe0bd]" : "text-[#f3a38a]"}>{criterion.score}/10 {criterion.passed && <Check className="ml-1 inline" size={14} />}</span></div><div className="mt-3 grid grid-cols-3 gap-2">{Object.entries(criterion.nodes).map(([node, levels]) => <div key={node} className="rounded-lg bg-white/5 p-2"><div className="mb-2 font-mono text-[9px] uppercase tracking-[0.1em] text-[#a9d1c0]">{node}</div>{levels.map(level => <div key={level.level} className="flex items-center justify-between text-[10px] text-[#b6d5ca]"><span>{level.level}</span><span className={level.passed ? "text-[#9fe0bd]" : "text-[#f3a38a]"}>{level.score}</span></div>)}</div>)}</div></div>)}</div>{detailReport.rejectionReason && <div className="mt-4 rounded-xl bg-[#7b3d32]/30 p-3 text-xs leading-5 text-[#f5b5a2]">{detailReport.rejectionReason}</div>}<div className="mt-5 flex items-center gap-2 text-xs text-[#b6d5ca]"><span className="font-mono">{detailReport.payloadHash.slice(0, 20)}…</span><span>·</span><span>JSON listo</span></div></CardContent></Card>}</div>
        </section>
      </main>
      <footer className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-[#d8e3dc] px-6 py-8 text-xs text-[#718580] sm:flex-row sm:items-center sm:justify-between lg:px-10"><span>© 2026 ProofMesh. Evidencia antes que velocidad.</span><span>Estricto por diseño · JSON nativo · Listo para CI</span></footer>
    </div>
  );
}
