import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BenefitReceipt from "./BenefitReceipt";
import type { RecommendCard } from "@/state/api";

const mockCard: RecommendCard = {
    card_name: "홈플러스 KB국민카드",
    card_company: "KB",
    card_id: "kb-homeplus-001",
    annual_fee: 0,
    minimum_performance: 0,
    expected_monthly_benefit: 30000,
    expected_yearly_benefit: 360000,
    category_breakdown: [],
    applied_benefits_trace: [
        {
            benefit_id: "b1",
            content: "아웃백, VIPS, TGIF 청구할인",
            category: "Food",
            sub_category: null,
            applied_budget: 200000,
            yielded_discount: 20000,
            user_choice: true,
            warnings: null,
        },
        {
            benefit_id: "b2",
            content: "온라인 5% 적립",
            category: "Shopping",
            sub_category: null,
            applied_budget: 100000,
            yielded_discount: 5000,
            user_choice: true,
            warnings: null,
        },
    ],
};

const mockCardNoTrace: RecommendCard = {
    ...mockCard,
    card_id: "no-trace",
    applied_benefits_trace: [],
};

const noop = () => {};

describe("BenefitReceipt", () => {
    describe("P8-1: 상단 레이블 텍스트", () => {
        it('"예상 최대 혜택 영수증" 텍스트가 표시된다', () => {
            render(<BenefitReceipt card={mockCard} onClose={noop} onReRecommend={noop} />);
            expect(screen.getByText("예상 최대 혜택 영수증")).toBeInTheDocument();
        });

        it('"SMARTPICK RECEIPT" 텍스트가 표시되지 않는다', () => {
            render(<BenefitReceipt card={mockCard} onClose={noop} onReRecommend={noop} />);
            expect(screen.queryByText(/smartpick receipt/i)).toBeNull();
        });
    });

    describe("P8-2: 안내 문구 2줄", () => {
        it("예산 기반 안내 문구가 표시된다", () => {
            render(<BenefitReceipt card={mockCard} onClose={noop} onReRecommend={noop} />);
            expect(screen.getByText(/입력하신 소비 예산 기반으로 계산된 최대 혜택입니다/)).toBeInTheDocument();
        });

        it("실제 소비액 안내 문구가 표시된다", () => {
            render(<BenefitReceipt card={mockCard} onClose={noop} onReRecommend={noop} />);
            expect(screen.getByText(/실제 소비액에 따라 달라질 수 있습니다/)).toBeInTheDocument();
        });

        it("날짜/번호 형식 텍스트(#0042)가 표시되지 않는다", () => {
            render(<BenefitReceipt card={mockCard} onClose={noop} onReRecommend={noop} />);
            expect(screen.queryByText(/#0042/)).toBeNull();
        });
    });

    describe("P8-3: 구분선 위 안내 문구", () => {
        it('"원하는 혜택만 선택하여 다시 추천받을 수 있어요" 텍스트가 표시된다', () => {
            render(<BenefitReceipt card={mockCard} onClose={noop} onReRecommend={noop} />);
            expect(screen.getByText("원하는 혜택만 선택하여 다시 추천받을 수 있어요")).toBeInTheDocument();
        });
    });

    describe("P8-4: 재추천 버튼 텍스트", () => {
        it('"선택한 혜택으로 다시 추천받기" 버튼이 존재한다', () => {
            render(<BenefitReceipt card={mockCard} onClose={noop} onReRecommend={noop} />);
            expect(screen.getByRole("button", { name: "선택한 혜택으로 다시 추천받기" })).toBeInTheDocument();
        });

        it('"선택한 혜택 기반 재추천" 텍스트가 사라졌다', () => {
            render(<BenefitReceipt card={mockCard} onClose={noop} onReRecommend={noop} />);
            expect(screen.queryByText("선택한 혜택 기반 재추천")).toBeNull();
        });
    });

    describe("P8-5: 재추천 버튼 높이", () => {
        it("재추천 버튼이 h-11 클래스를 가진다", () => {
            render(<BenefitReceipt card={mockCard} onClose={noop} onReRecommend={noop} />);
            const btn = screen.getByRole("button", { name: "선택한 혜택으로 다시 추천받기" });
            expect(btn.className).toContain("h-11");
        });
    });

    describe("P8-6: 닫기 버튼 위치", () => {
        it("하단 닫기 텍스트 버튼이 없다", () => {
            render(<BenefitReceipt card={mockCard} onClose={noop} onReRecommend={noop} />);
            // visible text "닫기" 버튼은 없어야 함 (X 버튼의 aria-label은 제외)
            const buttons = screen.getAllByRole("button");
            const textCloseBtn = buttons.find(b => b.textContent === "닫기");
            expect(textCloseBtn).toBeUndefined();
        });

        it("우상단 X 닫기 버튼이 존재한다", () => {
            render(<BenefitReceipt card={mockCard} onClose={noop} onReRecommend={noop} />);
            // aria-label="닫기" 또는 텍스트 ✕로 확인
            const closeBtn = screen.getByLabelText("닫기");
            expect(closeBtn).toBeInTheDocument();
        });

        it("X 버튼 클릭 시 onClose가 호출된다", () => {
            const onClose = vi.fn();
            render(<BenefitReceipt card={mockCard} onClose={onClose} onReRecommend={noop} />);
            fireEvent.click(screen.getByLabelText("닫기"));
            expect(onClose).toHaveBeenCalledOnce();
        });

        it("dim 영역 클릭 시 onClose가 호출된다", () => {
            const onClose = vi.fn();
            render(<BenefitReceipt card={mockCard} onClose={onClose} onReRecommend={noop} />);
            // backdrop div가 onClick={onClose}를 가지고 있음
            const backdrop = document.querySelector(".absolute.inset-0");
            expect(backdrop).not.toBeNull();
            fireEvent.click(backdrop!);
            expect(onClose).toHaveBeenCalledOnce();
        });
    });

    describe("기존 동작 유지 — 회귀 방지", () => {
        it("카드명이 표시된다", () => {
            render(<BenefitReceipt card={mockCard} onClose={noop} onReRecommend={noop} />);
            expect(screen.getByText("홈플러스 KB국민카드")).toBeInTheDocument();
        });

        it("혜택 항목이 렌더링된다", () => {
            render(<BenefitReceipt card={mockCard} onClose={noop} onReRecommend={noop} />);
            expect(screen.getByText("아웃백, VIPS, TGIF 청구할인")).toBeInTheDocument();
        });

        it("applied_benefits_trace가 비어있으면 안내 문구가 표시된다", () => {
            render(<BenefitReceipt card={mockCardNoTrace} onClose={noop} onReRecommend={noop} />);
            expect(screen.getByText("확인 가능한 상세 데이터가 없습니다.")).toBeInTheDocument();
        });

        it("혜택 체크 해제 후 재추천 버튼 클릭 시 excludedIds가 전달된다", () => {
            const onReRecommend = vi.fn();
            render(<BenefitReceipt card={mockCard} onClose={noop} onReRecommend={onReRecommend} />);
            // b1 체크 해제
            const rows = screen.getAllByText(/식비|쇼핑/);
            fireEvent.click(rows[0].closest("[class*='cursor-pointer']")!);
            fireEvent.click(screen.getByRole("button", { name: "선택한 혜택으로 다시 추천받기" }));
            expect(onReRecommend).toHaveBeenCalledWith(expect.arrayContaining(["b1"]));
        });
    });
});
