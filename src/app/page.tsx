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
    <main className="min-h-screen bg-slate-50 px-10 py-12">
      <section className="mx-auto max-w-5xl rounded-[32px] border border-slate-100 bg-white p-10 shadow-sm">
        <header className="flex flex-col gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            <span className="rounded-full border border-slate-200 px-3 py-1">Step 1</span>
            <span>서비스 선택</span>
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">선호하시는 서비스를 선택해주세요</h1>
            <p className="mt-2 text-slate-500">
              비교 모드와 신규 추천 모드 중 하나를 선택하면 다음 단계로 이동합니다.
            </p>
          </div>
        </header>

        <div className="mt-8 grid grid-cols-2 gap-6">
          {/* 기존 카드와 비교 */}
          <button
            type="button"
            onClick={onCompare}
            className="group flex flex-col items-start justify-between rounded-3xl border border-slate-200 bg-white p-8 text-left transition-all hover:border-slate-400 hover:shadow-md"
          >
            <div className="flex w-full flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
                Compare
              </span>
              <h2 className="text-xl font-semibold text-slate-900">
                사용 중인 카드와 비교해서 추천받기
              </h2>
              <p className="text-sm leading-relaxed text-slate-500">
                현재 혜택을 기준으로 손해 없이 갈아탈 수 있는 카드를 찾아드립니다.
              </p>
            </div>
            <div className="mt-8 flex w-full items-center justify-between text-sm text-slate-400">
              <span className="text-xs">기존 카드 요약 + 차액 표시</span>
              <span className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 group-hover:border-slate-400 transition-colors">
                시작하기 →
              </span>
            </div>
          </button>

          {/* 새로운 카드 추천 */}
          <button
            type="button"
            onClick={onNew}
            className="group flex flex-col items-start justify-between rounded-3xl border border-slate-200 bg-white p-8 text-left transition-all hover:border-slate-400 hover:shadow-md"
          >
            <div className="flex w-full flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
                New
              </span>
              <h2 className="text-xl font-semibold text-slate-900">
                새로운 카드 중에서 추천받기
              </h2>
              <p className="text-sm leading-relaxed text-slate-500">
                소비 패턴을 분석해 가장 유리한 신규 카드를 추천합니다.
              </p>
            </div>
            <div className="mt-8 flex w-full items-center justify-between text-sm text-slate-400">
              <span className="text-xs">카테고리 기반 맞춤 추천</span>
              <span className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 group-hover:border-slate-400 transition-colors">
                바로 시작 →
              </span>
            </div>
          </button>
        </div>
      </section>
    </main>
  );
}
