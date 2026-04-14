"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/state/appState";
import { API_V1, buildDefaultHeaders } from "@/state/config";

type CardOption = {
  card_id: string;
  card_name: string;
  card_company: string;
  annual_fee: number;
  minimum_performance: number;
  categories: string[];
  digest_summary?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractCardsResponse(data: unknown): CardOption[] | null {
  if (Array.isArray(data)) return data as CardOption[];
  if (!isRecord(data)) return null;
  const cards = data["cards"];
  if (Array.isArray(cards)) return cards as CardOption[];
  return null;
}


export default function SelectCardPage() {
  const router = useRouter();
  const { dispatch } = useAppState();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cards, setCards] = useState<CardOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const loadCards = async () => {
      setIsLoading(true);
      setLoadError(false);
      try {
        const response = await fetch(`${API_V1}/cards`, {
          signal: controller.signal,
          headers: buildDefaultHeaders(API_V1)
        });
        if (!response.ok) {
          setLoadError(true);
          return;
        }
        const data = (await response.json()) as unknown;
        const normalized = extractCardsResponse(data);
        if (normalized && normalized.length > 0) {
          setCards(normalized);
        } else {
          setLoadError(true);
        }
      } catch (e: any) {
        if (e?.name !== "AbortError") setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadCards();
    return () => controller.abort();
  }, []);

  const selected = cards.find((card) => card.card_id === selectedId) ?? null;

  const selectedLabel = selected
    ? `${selected.card_company} - ${selected.card_name}`
    : "카드를 선택해주세요";

  const handleNext = () => {
    if (!selected) return;
    dispatch({
      type: "SET_CURRENT_CARD",
      payload: {
        id: selected.card_id,
        name: selected.card_name,
        company: selected.card_company,
        annualFee: selected.annual_fee,
        minimumPerformance: selected.minimum_performance,
        categories: selected.categories,
        digestSummary: selected.digest_summary
      }
    });
    router.push("/categories");
  };

  return (
    <main className="min-h-screen bg-slate-50 px-10 py-12">
      <section className="mx-auto max-w-5xl rounded-[32px] border border-slate-100 bg-white p-10 shadow-sm">
        <header className="flex flex-col gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            <span className="rounded-full border border-slate-200 px-3 py-1">Step 2</span>
            <span>Current Card</span>
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">기존 카드 선택</h1>
            <p className="mt-2 text-slate-500">
              보유 중인 카드 중 하나를 선택해 주세요. 검색으로 빠르게 찾을 수 있습니다.
            </p>
          </div>
        </header>

        <div className="mt-8 grid gap-4">
          {isLoading && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-500">
              카드 목록을 불러오는 중입니다.
            </div>
          )}
          {loadError && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-500">
              카드 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
            </div>
          )}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-slate-900 shadow-sm">
            <label
              htmlFor="card-select"
              className="mb-3 block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
            >
              카드 선택
            </label>
            <div className="relative">
              <select
                id="card-select"
                value={selectedId ?? ""}
                onChange={(event) => setSelectedId(event.target.value || null)}
                className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-5 pr-12 text-base font-semibold text-slate-900 outline-none transition focus:border-slate-900"
              >
                <option value="" disabled>
                  {selectedLabel}
                </option>
                {cards.map((card) => (
                  <option key={card.card_id} value={card.card_id}>
                    {card.card_company} - {card.card_name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                ▾
              </span>
            </div>
            {selected ? (
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold">
                  {selected.card_company}
                </span>
                <span>연회비 {selected.annual_fee.toLocaleString()}원</span>
                <span>전월실적 {selected.minimum_performance.toLocaleString()}원</span>
              </div>
            ) : null}
            {selected?.digest_summary ? (
              <p className="mt-3 text-sm text-slate-500">{selected.digest_summary}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-10 flex justify-between border-t border-slate-100 pt-6">
          <div className="text-sm text-slate-500">
            선택된 카드:{" "}
            <span className="font-semibold text-slate-900">
              {selected?.card_name ?? "없음"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleNext}
            disabled={!selected || isLoading || loadError}
            className="rounded-full bg-slate-900 px-8 py-3 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            다음
          </button>
        </div>
      </section>
    </main>
  );
}
