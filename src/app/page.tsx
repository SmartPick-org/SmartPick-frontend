"use client";

import { useRouter } from "next/navigation";
import { useAppState } from "@/state/appState";

export default function Home() {
  const router = useRouter();
  const { dispatch } = useAppState();

  const onCompare = () => {
    dispatch({ type: "SET_COMPARISON_MODE", payload: "COMPARE" });
    router.push("/select-card");
  };

  const onNew = () => {
    dispatch({ type: "SET_COMPARISON_MODE", payload: "NEW" });
    router.push("/categories");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-8 py-16 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-[28rem] w-[28rem] rounded-full bg-emerald-400/20 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-sky-400/20 blur-[120px]" />
      </div>

      <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 rounded-[32px] border border-white/10 bg-white/5 p-12 shadow-[0_20px_80px_rgba(15,23,42,0.45)] backdrop-blur">
        <header className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <span className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              Card Advisor
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/40">
              Desktop First
            </span>
          </div>
          <div>
            <h1 className="text-[40px] font-semibold leading-tight text-white md:text-5xl">
              선호하시는 서비스를 선택해주세요
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/70">
              비교 모드와 신규 추천 모드 중 하나를 선택하면 다음 단계로 이동합니다.
              핵심 수치와 혜택 흐름이 한눈에 보이도록 설계했습니다.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <button
            type="button"
            onClick={onCompare}
            className="group relative flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-white/10 p-8 text-left transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/15"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
                Compare
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-white">
                사용 중인 카드와 비교해서 추천받기
              </h2>
              <p className="mt-3 text-base text-white/70">
                현재 혜택을 기준으로 손해 없이 갈아탈 수 있는 카드를 찾아드립니다.
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between text-sm text-white/60">
              <span>기존 카드 요약 + 차액 표시</span>
              <span className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80">
                시작하기
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={onNew}
            className="group relative flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-br from-white/20 via-white/10 to-white/5 p-8 text-left transition hover:-translate-y-1 hover:border-white/40"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
                New
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-white">
                새로운 카드 중에서 추천받기
              </h2>
              <p className="mt-3 text-base text-white/70">
                소비 패턴을 분석해 가장 유리한 신규 카드를 추천합니다.
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between text-sm text-white/60">
              <span>카테고리 기반 맞춤 추천</span>
              <span className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80">
                바로 시작
              </span>
            </div>
          </button>
        </div>
      </section>
    </main>
  );
}
