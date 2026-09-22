import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Dice5,
  Layers3,
  Map,
  Menu,
  Search,
  Shield,
  Smartphone,
  Sparkles,
  Swords,
  Users,
} from "lucide-react";
import GdsEmblem from "@/components/home/GdsEmblem";

const gold = "#d4a055";
const cream = "#f0e2c8";

function ProductPreview() {
  const stats = [
    ["STR", "4"],
    ["DEX", "6"],
    ["CON", "5"],
    ["INT", "6"],
    ["WIS", "3"],
  ];

  return (
    <div className="relative mx-auto w-full max-w-[760px]">
      <div className="absolute -inset-12 -z-10 rounded-full bg-[radial-gradient(circle,rgba(132,23,34,0.22),transparent_64%)] blur-2xl" />
      <div className="overflow-hidden rounded-[28px] border border-[#6f5430]/70 bg-[#0c0b0b] shadow-[0_36px_90px_rgba(0,0,0,0.58)]">
        <div className="flex items-center justify-between border-b border-[#3d3020] bg-[#15110e] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <GdsEmblem size={30} />
            <div>
              <div className="font-display text-[10px] font-bold tracking-[0.13em] text-[#e4bd78]">CRAWLER COMPANION</div>
              <div className="mt-0.5 text-[9px] text-[#8f8172]">Live product interface preview</div>
            </div>
          </div>
          <div className="hidden items-center gap-1.5 sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#63212a]" />
            <span className="h-2 w-2 rounded-full bg-[#8f5c2e]" />
            <span className="h-2 w-2 rounded-full bg-[#47715c]" />
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_250px]">
          <div className="relative overflow-hidden bg-[#d5bb91] p-4 sm:p-6">
            <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,rgba(65,41,22,.24),transparent_24%),radial-gradient(circle_at_85%_70%,rgba(78,45,20,.18),transparent_28%)]" />
            <div className="relative">
              <div className="flex flex-col gap-4 border-b border-[#7b6549] pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="font-fell-sc text-[10px] tracking-[0.18em] text-[#725d43]">CHARACTER SHEET</div>
                  <div className="mt-1 font-fell text-2xl text-[#2d2118] sm:text-3xl">Sample Crawler</div>
                  <div className="mt-1 font-garamond text-sm text-[#6b5741]">Level 1 · Character preview</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded border border-[#8b6a3d] bg-[#a11222] px-3 py-1 font-display text-[10px] font-bold text-[#f6e7c8]">HP 20 / 20</span>
                  <span className="rounded border border-[#8b6a3d] bg-[#294f78] px-3 py-1 font-display text-[10px] font-bold text-[#edf4ff]">MANA 6 / 6</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-5 gap-2">
                {stats.map(([label, value]) => (
                  <div key={label} className="border border-[#836c50] bg-[rgba(255,247,220,.22)] p-2 text-center shadow-[inset_0_0_0_1px_rgba(255,248,220,.2)]">
                    <div className="font-fell-sc text-[9px] tracking-[0.1em] text-[#6f5942]">{label}</div>
                    <div className="mt-1 font-display text-lg font-bold text-[#31251c]">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-[1.15fr_.85fr]">
                <div className="border border-[#80684c] bg-[rgba(255,247,220,.18)] p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-[10px] font-bold tracking-[0.12em] text-[#443428]">HEALTH</span>
                    <span className="font-garamond text-xs text-[#6f5942]">tap to manage</span>
                  </div>
                  <div className="mt-2 grid grid-cols-10 gap-1">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <span key={index} className="h-5 rounded-sm border border-[#614637] bg-[linear-gradient(180deg,#b44b45,#79070a)]" />
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="border-t border-[#9c8566] pt-2">
                      <div className="font-fell-sc text-[9px] tracking-[0.12em] text-[#6f5942]">DEFENSE</div>
                      <div className="mt-1 font-garamond text-lg font-semibold text-[#34271e]">DR 2</div>
                    </div>
                    <div className="border-t border-[#9c8566] pt-2">
                      <div className="font-fell-sc text-[9px] tracking-[0.12em] text-[#6f5942]">AI FAVOR</div>
                      <div className="mt-1 font-garamond text-lg font-semibold text-[#34271e]">1</div>
                    </div>
                  </div>
                </div>

                <div className="border border-[#80684c] bg-[rgba(255,247,220,.18)] p-3">
                  <div className="font-display text-[10px] font-bold tracking-[0.12em] text-[#443428]">SKILLS</div>
                  {["Tactics", "Pistol", "Investigation"].map((skill, index) => (
                    <div key={skill} className="mt-2 flex items-center justify-between border-b border-[#ad9675] pb-2 last:border-0">
                      <span className="font-garamond text-sm text-[#34271e]">{skill}</span>
                      <span className="font-display text-[10px] font-bold text-[#7a151b]">{index === 1 ? "+2" : "+1"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 bg-[#111010] p-4 sm:p-5">
            <div className="rounded-xl border border-[#513c27] bg-[#17130f] p-4">
              <div className="flex items-center gap-2 text-[#e0b66f]">
                <Search size={15} />
                <span className="font-display text-[10px] font-bold tracking-[0.12em]">RULES SEARCH</span>
              </div>
              <div className="mt-3 rounded-lg border border-[#3d352c] bg-[#0c0c0d] px-3 py-2 text-[11px] text-[#90877f]">
                Search your private rules library…
              </div>
              <div className="mt-3 space-y-2">
                <div className="rounded-lg border border-[#392f24] bg-[#12100e] p-3">
                  <div className="text-[11px] font-semibold text-[#e6d2ad]">Context without leaving play</div>
                  <div className="mt-1 text-[10px] leading-relaxed text-[#8f8378]">Short explanations stay close to the character sheet.</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#513c27] bg-[#17130f] p-4">
              <div className="font-display text-[10px] font-bold tracking-[0.12em] text-[#e0b66f]">TABLE-READY</div>
              <div className="mt-3 space-y-2 text-[11px] text-[#c4b5a4]">
                <div className="flex items-center gap-2"><CheckCircle2 size={13} className="text-[#69a57d]" /> Persistent character records</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={13} className="text-[#69a57d]" /> Touch-first controls</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={13} className="text-[#69a57d]" /> Rules beside the action</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto h-3 w-[86%] rounded-b-[24px] bg-[linear-gradient(180deg,#2b2928,#111)] shadow-[0_10px_24px_rgba(0,0,0,.38)]" />
    </div>
  );
}

const available = [
  {
    icon: Users,
    title: "Guided Character Creation",
    text: "Build a crawler step by step with clearer choices, skill descriptions, history, combat options, and persistent records.",
    to: "/character?action=create",
  },
  {
    icon: Shield,
    title: "Live Character Sheet",
    text: "Use the sheet at the table: resources, skills, gear, conditions, AI Favor, and play-time controls stay in one place.",
    to: "/character?action=load",
  },
  {
    icon: BookOpen,
    title: "Private Rules Search",
    text: "Search rules you provide and keep fast explanations close to the moment you need them.",
    to: "/rules",
  },
  {
    icon: Layers3,
    title: "Campaign & GM Tools",
    text: "Create a campaign, invite players, make guest crawlers without requiring an account first, and edit assigned character sheets from the GM view.",
    to: "/campaign",
  },
];

const roadmap = [
  { icon: Map, title: "Maps", text: "Table-ready maps, markers, placement, and encounter context." },
  { icon: Swords, title: "Combat", text: "Faster damage, DR, initiative, conditions, and action flow." },
  { icon: Users, title: "Expanded Party Play", text: "More shared table state, session tools, and connected player experiences." },
];

export default function NewUserHome() {
  return (
    <div className="min-h-[100svh] bg-[#080707] text-white">
      <header className="sticky top-0 z-50 border-b border-[#4c3824]/70 bg-[rgba(8,7,7,.88)] backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <GdsEmblem size={42} />
            <div className="min-w-0">
              <div className="truncate font-display text-[12px] font-bold tracking-[0.14em] text-[#e2b36a] sm:text-[13px]">GINGER DRAGON STUDIOS</div>
              <div className="mt-0.5 hidden text-[9px] tracking-[0.16em] text-[#81766d] sm:block">TABLETOP SOFTWARE</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-[12px] text-[#b3aaa2] lg:flex">
            <a href="#product" className="transition-colors hover:text-white">Product</a>
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#roadmap" className="transition-colors hover:text-white">Roadmap</a>
            <Link to="/rules" className="transition-colors hover:text-white">Rules</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden px-3 py-2 text-[12px] font-semibold text-[#c6bbb1] hover:text-white sm:block">Log in</Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg border border-[#d4a055]/80 bg-[linear-gradient(180deg,#8d1b28,#5f1018)] px-3.5 py-2.5 font-display text-[10px] font-bold tracking-[0.08em] text-[#f5e7ce] shadow-[0_8px_30px_rgba(115,20,30,.22)] transition hover:brightness-110 sm:px-4"
            >
              GET STARTED <ArrowRight size={13} />
            </Link>
            <button aria-label="Open navigation" className="flex h-9 w-9 items-center justify-center text-[#b8ada4] lg:hidden"><Menu size={18} /></button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-[#3e2d20]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(126,25,37,.2),transparent_33%),radial-gradient(circle_at_20%_30%,rgba(213,150,69,.08),transparent_28%),linear-gradient(180deg,#0d0909_0%,#080707_70%)]" />
          <div className="relative mx-auto grid max-w-[1240px] gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[.82fr_1.18fr] lg:items-center lg:px-8 lg:py-24">
            <div className="max-w-[590px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#6d4b2b]/70 bg-[#17100d] px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#d9a55d]">
                <Sparkles size={12} /> DESIGNED FOR REAL TABLE PLAY
              </div>
              <h1 className="mt-6 font-display text-[clamp(42px,6vw,78px)] font-semibold leading-[.96] tracking-[-0.035em] text-[#f2dfbd]">
                Crawler Companion
              </h1>
              <p className="mt-6 max-w-[560px] font-garamond text-[clamp(20px,2.2vw,28px)] leading-snug text-[#d7c8b6]">
                A polished digital companion for character creation, live play, and rules at the table.
              </p>
              <p className="mt-5 max-w-[540px] text-[15px] leading-7 text-[#9f948b]">
                Designed to feel like part of the game instead of another admin screen. Fast controls, persistent characters, contextual rules, and a character sheet you actually want open during play.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-[#d5a254] px-5 py-3 text-[12px] font-bold text-[#1b1209] shadow-[0_12px_34px_rgba(212,160,85,.18)] transition hover:bg-[#e2b46a]">
                  Create an account <ArrowRight size={15} />
                </Link>
                <Link to="/character?action=load" className="inline-flex items-center gap-2 rounded-lg border border-[#5a4736] bg-[#11100f] px-5 py-3 text-[12px] font-semibold text-[#d8cec4] transition hover:border-[#8f6b42] hover:text-white">
                  Open character tools
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-[#887c72]">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#9c6]" /> Mobile-first</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#9c6]" /> Persistent records</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#9c6]" /> Clear product status</span>
              </div>
            </div>

            <div id="product" className="lg:pl-4">
              <ProductPreview />
            </div>
          </div>
        </section>

        <section className="border-b border-[#30251d] bg-[#0b0909]">
          <div className="mx-auto grid max-w-[1240px] grid-cols-2 divide-x divide-y divide-[#2b211a] px-4 sm:px-6 md:grid-cols-4 md:divide-y-0 lg:px-8">
            {[
              [Smartphone, "Phone & tablet ready"],
              [Dice5, "Built for tabletop play"],
              [Search, "Rules close to the action"],
              [Shield, "Designed around live characters"],
            ].map(([Icon, label]) => (
              <div key={label} className="flex items-center justify-center gap-2.5 px-3 py-5 text-center text-[11px] font-semibold text-[#a99d92]">
                <Icon size={15} className="text-[#d2a057]" /> {label}
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="bg-[#0a0909] py-20 sm:py-24">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[720px] text-center">
              <div className="font-display text-[10px] font-bold tracking-[0.2em] text-[#bc8848]">AVAILABLE NOW</div>
              <h2 className="mt-4 font-display text-3xl font-semibold text-[#f0dfc0] sm:text-4xl">The core experience is already useful at the table.</h2>
              <p className="mt-4 text-[14px] leading-7 text-[#93887f]">Focused on the workflows players use every session, with a clear line between what is ready now and what is still being built.</p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {available.map(({ icon: Icon, title, text, to }) => (
                <Link key={title} to={to} className="group rounded-2xl border border-[#392d25] bg-[linear-gradient(180deg,#12100f,#0d0c0c)] p-6 transition hover:-translate-y-0.5 hover:border-[#765431]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#6b4a2c] bg-[#1b120d] text-[#e0a65d]"><Icon size={19} /></div>
                  <h3 className="mt-5 font-display text-[16px] font-semibold text-[#ead7b7]">{title}</h3>
                  <p className="mt-3 text-[13px] leading-6 text-[#8f857c]">{text}</p>
                  <div className="mt-6 flex items-center gap-2 text-[11px] font-bold text-[#cb9550]">OPEN <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" /></div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="roadmap" className="border-y border-[#30251d] bg-[#0d0a0a] py-20 sm:py-24">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
              <div>
                <div className="font-display text-[10px] font-bold tracking-[0.2em] text-[#bc8848]">BUILT TO GROW</div>
                <h2 className="mt-4 font-display text-3xl font-semibold text-[#f0dfc0] sm:text-4xl">One companion, not a pile of disconnected tools.</h2>
                <p className="mt-4 text-[14px] leading-7 text-[#93887f]">Campaigns and GM character tools are now part of the live product; maps, deeper combat, and expanded party play are the next connected layers.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {roadmap.map(({ icon: Icon, title, text }) => (
                  <div key={title} className="rounded-2xl border border-[#3b2d23] bg-[#100e0d] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <Icon size={18} className="text-[#d29c52]" />
                      <span className="rounded-full border border-[#4b3828] px-2 py-1 text-[8px] font-bold tracking-[0.12em] text-[#8e7e70]">ROADMAP</span>
                    </div>
                    <h3 className="mt-5 font-display text-[14px] font-semibold text-[#e1cfb1]">{title}</h3>
                    <p className="mt-2 text-[12px] leading-5 text-[#887e76]">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#090808] py-20 sm:py-24">
          <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[28px] border border-[#5c422b] bg-[linear-gradient(135deg,#1a0d10,#110e0c_55%,#17100c)] p-8 sm:p-12">
              <div className="pointer-events-none absolute right-[-80px] top-[-110px] h-72 w-72 rounded-full bg-[rgba(135,32,44,.18)] blur-3xl" />
              <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="font-display text-[10px] font-bold tracking-[0.18em] text-[#c18b48]">GINGER DRAGON STUDIOS</div>
                  <h2 className="mt-4 max-w-[700px] font-display text-3xl font-semibold leading-tight text-[#f1dfbf] sm:text-4xl">Less friction at the table. More attention on the game.</h2>
                  <p className="mt-4 max-w-[650px] text-[14px] leading-7 text-[#a19489]">Crawler Companion is being built as a real product: consistent UI, clear state, mobile ergonomics, and features that earn their place.</p>
                </div>
                <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d5a254] px-5 py-3 text-[12px] font-bold text-[#1b1209] hover:bg-[#e2b46a]">
                  Get started <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#30251d] bg-[#070606]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <GdsEmblem size={34} />
            <div>
              <div className="font-display text-[10px] font-bold tracking-[0.14em] text-[#d5a254]">GINGER DRAGON STUDIOS</div>
              <div className="mt-1 text-[10px] text-[#756a61]">Crawler Companion</div>
            </div>
          </div>
          <div className="max-w-[620px] text-[10px] leading-5 text-[#665e58] md:text-right">
            Independent tabletop companion software. Game and product trademarks belong to their respective owners. No affiliation or endorsement is implied.
          </div>
        </div>
      </footer>
    </div>
  );
}
