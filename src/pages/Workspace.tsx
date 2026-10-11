import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowDownToLine,
  ArrowRight,
  Bot,
  Check,
  Cloud,
  Code2,
  Globe,
  LoaderCircle,
  MessageSquare,
  Rocket,
  Send,
  Sparkles,
  Terminal,
  WandSparkles,
} from "lucide-react";

type Mode = "chat" | "code" | "builder" | "cloud";
type Message = { role: "user" | "assistant"; content: string };

const MODES: { id: Mode; label: string; detail: string; icon: typeof Bot }[] = [
  { id: "chat", label: "AI Chat", detail: "Ngobrol dan brainstorming", icon: MessageSquare },
  { id: "code", label: "AI Coding", detail: "Bantu tulis dan debug kode", icon: Code2 },
  { id: "builder", label: "Web Builder", detail: "Buat halaman web siap preview", icon: WandSparkles },
  { id: "cloud", label: "Cloud & Deploy", detail: "Kelola layanan dan deployment", icon: Cloud },
];

const STARTERS = [
  "Bantu gua bikin landing page SaaS modern",
  "Jelasin error TypeScript dan cara memperbaikinya",
  "Buat contoh API REST pakai Node.js",
];

function starterHtml(name: string, description: string, color: string) {
  const safeName = name.trim().replace(/[<>]/g, "") || "Project Baru";
  const safeDescription = description.trim().replace(/[<>]/g, "") || "Ide lo, diwujudkan jadi web.";
  const palette: Record<string, { bg: string; accent: string }> = {
    violet: { bg: "#100f1c", accent: "#b8a5ff" },
    blue: { bg: "#0b1524", accent: "#82c4ff" },
    green: { bg: "#0d1915", accent: "#85e0b3" },
    orange: { bg: "#1d120e", accent: "#ffb28c" },
  };
  const p = palette[color] ?? palette.violet;
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${safeName}</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;background:${p.bg};color:#f5f3ff;font:16px/1.6 Inter,system-ui,sans-serif;display:grid;place-items:center;padding:24px}
main{width:min(900px,100%);text-align:center;padding:clamp(28px,8vw,88px) 24px;border:1px solid #ffffff20;border-radius:28px;background:linear-gradient(145deg,#ffffff0d,#ffffff03);box-shadow:0 30px 100px #0005}
.tag{display:inline-block;border:1px solid ${p.accent}66;color:${p.accent};padding:7px 13px;border-radius:999px;font-size:12px;letter-spacing:.12em;text-transform:uppercase}
h1{font-size:clamp(40px,8vw,76px);line-height:1.03;letter-spacing:-.06em;margin:24px 0}p{max-width:620px;margin:0 auto;color:#c5c2d4;font-size:clamp(16px,2vw,20px)}a{display:inline-block;margin-top:30px;padding:12px 20px;background:${p.accent};color:#171320;text-decoration:none;border-radius:12px;font-weight:700}
footer{margin-top:56px;color:#8f8aa4;font-size:12px}
</style></head><body><main><span class="tag">Built with Codelolo</span><h1>${safeName}</h1><p>${safeDescription}</p><a href="#mulai">Mulai sekarang ↗</a><footer>Ide besar dimulai dari satu halaman.</footer></main></body></html>`;
}

export default function Workspace() {
  const [mode, setMode] = useState<Mode>("chat");
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Halo! Gua Codelolo. Mau brainstorming, nulis kode, atau mulai bikin website? Pilih mode di atas lalu ceritain kebutuhan lo." },
  ]);
  const [error, setError] = useState("");
  const [siteName, setSiteName] = useState("Studio Kreatif");
  const [siteDescription, setSiteDescription] = useState("Kami mengubah ide menjadi pengalaman digital yang terasa berbeda.");
  const [siteColor, setSiteColor] = useState("violet");
  const [generatedHtml, setGeneratedHtml] = useState(() => starterHtml("Studio Kreatif", "Kami mengubah ide menjadi pengalaman digital yang terasa berbeda.", "violet"));

  async function sendPrompt(value = prompt) {
    const text = value.trim();
    if (!text || busy) return;
    setMessages((old) => [...old, { role: "user", content: text }]);
    setPrompt("");
    setError("");
    setBusy(true);
    try {
      const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "");
      if (!apiBase) {
        throw new Error("Backend AI belum tersambung. UI ini bisa dibuka di GitHub Pages, tapi AI sungguhan perlu server Codelolo. Isi VITE_API_URL dengan URL backend lalu build ulang.");
      }
      const response = await fetch(`${apiBase}/llm/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: mode === "code"
              ? "Kamu adalah Codelolo AI Coding. Bantu user menulis, menjelaskan, dan debug kode. Berikan solusi konkret, sebutkan nama file bila relevan, dan jangan mengaku sudah mengubah repo."
              : "Kamu adalah Codelolo, asisten AI berbahasa Indonesia yang praktis dan ramah. Bantu user berpikir dan menyelesaikan pekerjaan secara konkret." },
            ...messages.slice(-10).map((message) => ({ role: message.role === "assistant" ? "assistant" : "user", content: message.content })),
            { role: "user", content: text },
          ],
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message ?? `Backend merespons ${response.status}`);
      const answer = payload?.choices?.[0]?.message?.content?.trim();
      if (!answer) throw new Error("Backend tersambung, tetapi tidak mengirim jawaban.");
      setMessages((old) => [...old, { role: "assistant", content: answer }]);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Gagal menghubungi backend.";
      setError(message);
      setMessages((old) => [...old, { role: "assistant", content: "Gua belum bisa menjawab lewat model AI karena backend belum tersedia atau belum merespons. Cek pesan error di bawah; gua nggak akan pura-pura AI sudah jalan." }]);
    } finally {
      setBusy(false);
    }
  }

  function makeWebsite() {
    setGeneratedHtml(starterHtml(siteName, siteDescription, siteColor));
  }

  function downloadWebsite() {
    const blob = new Blob([generatedHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${siteName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "codelolo-site"}.html`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <main className="mx-auto max-w-[1440px] px-4 pb-12 pt-6 sm:px-7 sm:pt-9">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">CODELOLO / WORKSPACE</p>
              <h1 className="display mt-3 text-[clamp(32px,5vw,54px)] text-ink-1">Satu ruang. Semua ide.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-3 sm:text-base">Ngobrol dengan AI, minta bantuan coding, bangun halaman web, lalu lanjut ke pengaturan cloud—dari workspace yang sama.</p>
            </div>
            <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-2 font-mono text-[10px] text-ink-3"><span className="size-1.5 rounded-full bg-emerald-400" /> WORKSPACE MVP</span>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {MODES.map((item) => {
              const Icon = item.icon;
              const active = mode === item.id;
              return <button key={item.id} type="button" onClick={() => setMode(item.id)} className={`glass rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 ${active ? "border-ember/50 bg-ember-soft/50" : "hover:border-line-strong"}`}>
                <span className="flex items-center justify-between"><Icon className={`size-5 ${active ? "text-ember" : "text-ink-3"}`} />{active && <Check className="size-4 text-ember" />}</span>
                <span className="mt-4 block text-sm font-medium text-ink-1">{item.label}</span>
                <span className="mt-1 block text-xs text-ink-4">{item.detail}</span>
              </button>;
            })}
          </div>

          {mode === "chat" || mode === "code" ? (
            <section className="glass mt-5 overflow-hidden rounded-2xl">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-3"><span className="rounded-xl bg-ember-soft p-2"><Sparkles className="size-4 text-ember" /></span><div><h2 className="text-sm font-medium text-ink-1">{mode === "code" ? "AI Coding" : "AI Chat"}</h2><p className="mt-0.5 text-xs text-ink-4">Percakapan workspace</p></div></div>
                <button type="button" onClick={() => setMessages([{ role: "assistant", content: "Percakapan baru dimulai. Apa yang mau lo kerjakan?" }])} className="text-xs text-ink-3 hover:text-ink-1">Chat baru</button>
              </div>
              <div className="flex min-h-[300px] max-h-[52vh] flex-col gap-4 overflow-y-auto p-4 sm:p-6">
                {messages.map((message, index) => <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" && <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2"><Bot className="size-4 text-ember" /></span>}
                  <div className={`max-w-[min(85%,760px)] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-7 ${message.role === "user" ? "bg-surface-3 text-ink-1" : "border border-border bg-background/60 text-ink-2"}`}>{message.content}</div>
                </div>)}
                {busy && <div className="flex items-center gap-2 text-xs text-ink-4"><LoaderCircle className="size-4 animate-spin" /> Codelolo sedang berpikir…</div>}
              </div>
              {error && <div role="alert" className="mx-4 mb-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-6 text-amber-200 sm:mx-6">{error}</div>}
              <div className="border-t border-border p-3 sm:p-4">
                <div className="mb-3 flex flex-wrap gap-2">{STARTERS.map((starter) => <button key={starter} type="button" onClick={() => void sendPrompt(starter)} disabled={busy} className="rounded-full border border-border px-3 py-1.5 text-left text-[11px] text-ink-3 transition-colors hover:border-line-strong hover:text-ink-1 disabled:opacity-50">{starter}</button>)}</div>
                <form onSubmit={(event) => { event.preventDefault(); void sendPrompt(); }} className="flex items-end gap-2 rounded-xl border border-line-strong bg-background/60 p-2">
                  <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendPrompt(); } }} rows={2} placeholder={mode === "code" ? "Tempel kode atau jelaskan bug yang mau diperbaiki…" : "Tulis apa yang mau lo kerjakan…"} className="max-h-40 min-h-12 flex-1 resize-y bg-transparent px-2 py-2 text-sm text-ink-1 outline-none placeholder:text-ink-4" />
                  <button type="submit" disabled={busy || !prompt.trim()} className="mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-ember text-background transition-opacity hover:opacity-80 disabled:opacity-40" aria-label="Kirim pesan">{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}</button>
                </form>
                <p className="mt-2 px-1 text-[10px] text-ink-4">Enter untuk kirim · Shift+Enter untuk baris baru. Jangan masukkan API key atau password.</p>
              </div>
            </section>
          ) : null}

          {mode === "builder" && <section className="mt-5 grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="glass rounded-2xl p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-ember-soft"><Globe className="size-5 text-ember" /></span>
              <h2 className="mt-4 text-base font-medium text-ink-1">Bikin halaman pertama</h2>
              <p className="mt-1 text-xs leading-5 text-ink-4">Isi brief sederhana, lalu preview dan unduh file HTML-nya.</p>
              <label className="mt-5 block text-xs text-ink-3">Nama website</label><input value={siteName} onChange={(e) => setSiteName(e.target.value)} maxLength={80} className="mt-2 w-full rounded-xl border border-line-strong bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-ember/60" />
              <label className="mt-4 block text-xs text-ink-3">Deskripsi</label><textarea value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} maxLength={400} rows={4} className="mt-2 w-full resize-y rounded-xl border border-line-strong bg-background/60 px-3 py-2.5 text-sm leading-6 outline-none focus:border-ember/60" />
              <label className="mt-4 block text-xs text-ink-3">Warna tema</label><select value={siteColor} onChange={(e) => setSiteColor(e.target.value)} className="mt-2 w-full rounded-xl border border-line-strong bg-background/60 px-3 py-2.5 text-sm outline-none"><option value="violet">Violet</option><option value="blue">Biru</option><option value="green">Hijau</option><option value="orange">Oranye</option></select>
              <button type="button" onClick={makeWebsite} className="btn-primary mt-5 w-full"><WandSparkles className="size-4" /> Generate preview</button>
              <button type="button" onClick={downloadWebsite} className="btn-ghost mt-2 w-full"><ArrowDownToLine className="size-4" /> Download HTML</button>
              <p className="mt-4 text-[11px] leading-5 text-ink-4">Ini builder awal berbasis template di browser, belum deploy otomatis ke hosting publik.</p>
            </div>
            <div className="glass min-h-[480px] overflow-hidden rounded-2xl">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3"><span className="size-2 rounded-full bg-red-400/70" /><span className="size-2 rounded-full bg-yellow-400/70" /><span className="size-2 rounded-full bg-green-400/70" /><span className="ml-2 text-xs text-ink-4">Preview website</span></div>
              <iframe title="Preview website yang dibuat" sandbox="" srcDoc={generatedHtml} className="h-[520px] w-full bg-white" />
            </div>
          </section>}

          {mode === "cloud" && <section className="glass mt-5 rounded-2xl p-5 sm:p-7">
            <div className="flex items-start gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ember-soft"><Cloud className="size-5 text-ember" /></span><div><h2 className="text-lg font-medium text-ink-1">Cloud & deployment</h2><p className="mt-2 max-w-2xl text-sm leading-7 text-ink-3">Panel cloud disiapkan sebagai bagian dari workspace. Saat ini website builder bisa membuat file HTML untuk diunduh, tetapi pengelolaan VPS, domain, database, dan deploy otomatis butuh backend serta kredensial provider yang aman.</p></div></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {[{title:"Infrastructure",desc:"Rencana VPS, DNS, TLS, dan deployment",icon:Terminal,to:"/infrastructure"},{title:"Server & model",desc:"Status server dan konfigurasi model",icon:Cloud,to:"/server"},{title:"Projects",desc:"Lanjutkan workspace proyek",icon:Code2,to:"/projects"}].map((item) => { const Icon = item.icon; return <Link key={item.title} to={item.to} className="rounded-xl border border-border bg-background/50 p-4 transition-colors hover:border-line-strong"><Icon className="size-4 text-ember" /><p className="mt-3 text-sm text-ink-1">{item.title}</p><p className="mt-1 text-xs leading-5 text-ink-4">{item.desc}</p><span className="mt-4 inline-flex items-center gap-1 text-xs text-ink-3">Buka panel <ArrowRight className="size-3" /></span></Link>; })}
            </div>
            <div className="mt-5 rounded-xl border border-border bg-background/40 p-4"><p className="text-xs font-medium text-ink-1">Status koneksi</p><p className="mt-1 text-xs leading-5 text-ink-4">Frontend: aktif · Backend AI: tergantung konfigurasi · Hosting/deploy: belum tersambung otomatis</p></div>
          </section>}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/30 px-4 py-3">
            <p className="text-xs text-ink-4">Workspace terpadu Codelolo · MVP awal</p>
            <Link to="/studio/" className="inline-flex items-center gap-1.5 text-xs text-ink-3 hover:text-ink-1">Studio lama <ArrowRight className="size-3" /></Link>
          </div>
        </main>
      </div>
    </AppShell>
  );
}
