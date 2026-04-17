import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MarkdownText } from "./MarkdownText";

describe("MarkdownText", () => {
  describe("빈/누락 입력", () => {
    it("children이 없으면 아무것도 렌더링하지 않는다", () => {
      const { container } = render(<MarkdownText />);
      expect(container.firstChild).toBeNull();
    });

    it("빈 문자열이면 아무것도 렌더링하지 않는다", () => {
      const { container } = render(<MarkdownText>{""}</MarkdownText>);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("기본 인라인 서식", () => {
    it("bold/italic을 렌더링한다", () => {
      render(<MarkdownText>{"**볼드** 그리고 *이탤릭*"}</MarkdownText>);
      expect(screen.getByText("볼드").tagName).toBe("STRONG");
      expect(screen.getByText("이탤릭").tagName).toBe("EM");
    });

    it("인라인 코드는 <code>로 스타일 클래스와 함께 렌더링된다", () => {
      render(<MarkdownText>{"값을 `foo`로 설정"}</MarkdownText>);
      const code = screen.getByText("foo");
      expect(code.tagName).toBe("CODE");
      expect(code.className).toContain("bg-slate-200/60");
    });

    it("링크는 새 탭 + rel=noopener noreferrer로 렌더링된다", () => {
      render(<MarkdownText>{"[공식문서](https://example.com)"}</MarkdownText>);
      const link = screen.getByRole("link", { name: "공식문서" });
      expect(link).toHaveAttribute("href", "https://example.com");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  describe("블록 요소", () => {
    it("헤딩 #~######은 모두 굵은 <p>로 렌더링된다", () => {
      render(
        <MarkdownText>{"# 제목1\n## 제목2\n### 제목3"}</MarkdownText>
      );
      ["제목1", "제목2", "제목3"].forEach((t) => {
        const el = screen.getByText(t);
        expect(el.tagName).toBe("P");
        expect(el.className).toContain("font-semibold");
      });
    });

    it("비순서 리스트(-)는 ul/li로 렌더링된다", () => {
      render(<MarkdownText>{"- 항목1\n- 항목2\n- 항목3"}</MarkdownText>);
      const lists = screen.getAllByRole("list");
      expect(lists).toHaveLength(1);
      const items = within(lists[0]).getAllByRole("listitem");
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveTextContent("항목1");
      expect(lists[0].tagName).toBe("UL");
    });

    it("순서 리스트는 ol로 렌더링된다", () => {
      render(<MarkdownText>{"1. 첫째\n2. 둘째"}</MarkdownText>);
      const list = screen.getByRole("list");
      expect(list.tagName).toBe("OL");
      const items = within(list).getAllByRole("listitem");
      expect(items).toHaveLength(2);
    });

    it("블록인용(>)은 <blockquote>에 border 스타일이 붙는다", () => {
      render(<MarkdownText>{"> 참고: 중요한 내용"}</MarkdownText>);
      const quote = screen.getByText(/참고: 중요한 내용/).closest("blockquote");
      expect(quote).not.toBeNull();
      expect(quote!.className).toContain("border-l-2");
    });

    it("수평선(---)은 <hr>로 렌더링된다", () => {
      const { container } = render(<MarkdownText>{"앞\n\n---\n\n뒤"}</MarkdownText>);
      expect(container.querySelector("hr")).not.toBeNull();
    });
  });

  describe("코드 블록", () => {
    it("펜스 코드 블록은 pre>code 구조로 렌더링된다", () => {
      const src = "```ts\nconst x = 1;\n```";
      const { container } = render(<MarkdownText>{src}</MarkdownText>);
      const pre = container.querySelector("pre");
      expect(pre).not.toBeNull();
      const code = pre!.querySelector("code");
      expect(code).not.toBeNull();
      expect(code!.textContent).toContain("const x = 1;");
      // language 클래스 적용 확인
      expect(code!.className).toContain("language-ts");
    });

    it("펜스 코드 블록의 pre에는 다크 배경 스타일이 적용된다", () => {
      const { container } = render(
        <MarkdownText>{"```\nhello\n```"}</MarkdownText>
      );
      const pre = container.querySelector("pre")!;
      expect(pre.className).toContain("bg-slate-900");
    });
  });

  describe("GFM — 테이블 (신규 지원)", () => {
    const tableMd = [
      "| 항목 | 금액 |",
      "|---|---|",
      "| 연회비 | 15,000원 |",
      "| 월 예상 혜택 | 99,000원 |",
    ].join("\n");

    it("마크다운 파이프 테이블이 <table>로 렌더링된다", () => {
      render(<MarkdownText>{tableMd}</MarkdownText>);
      const table = screen.getByRole("table");
      expect(table.tagName).toBe("TABLE");
    });

    it("헤더 셀(th)과 본문 셀(td)이 구분되어 렌더링된다", () => {
      render(<MarkdownText>{tableMd}</MarkdownText>);
      expect(screen.getByRole("columnheader", { name: "항목" })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: "금액" })).toBeInTheDocument();
      expect(screen.getByRole("cell", { name: "연회비" })).toBeInTheDocument();
      expect(screen.getByRole("cell", { name: "99,000원" })).toBeInTheDocument();
    });

    it("테이블은 가로 스크롤 가능한 래퍼로 감싼다", () => {
      const { container } = render(<MarkdownText>{tableMd}</MarkdownText>);
      const wrapper = container.querySelector("div.overflow-x-auto");
      expect(wrapper).not.toBeNull();
      expect(wrapper!.querySelector("table")).not.toBeNull();
    });
  });

  describe("GFM — autolink (신규 지원)", () => {
    it("벌거벗은 URL은 자동으로 <a> 링크가 된다", () => {
      render(<MarkdownText>{"자세한 건 https://example.com 에서 확인"}</MarkdownText>);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "https://example.com");
    });
  });

  describe("GFM — 취소선 (신규 지원)", () => {
    it("~~취소선~~ 문법이 <del>로 렌더링된다", () => {
      const { container } = render(<MarkdownText>{"이건 ~~취소~~됩니다"}</MarkdownText>);
      const del = container.querySelector("del");
      expect(del).not.toBeNull();
      expect(del!.textContent).toBe("취소");
    });
  });

  describe("보안 — HTML 원시 태그 이스케이프", () => {
    it("<small> 태그는 실제 DOM 요소로 렌더링되지 않고 텍스트로 이스케이프된다", () => {
      const { container } = render(
        <MarkdownText>{"참고 <small>주의사항입니다</small>"}</MarkdownText>
      );
      // <small>이 실제 DOM 노드로 존재하면 안 됨
      expect(container.querySelector("small")).toBeNull();
    });

    it("<script> 태그도 실행/렌더링되지 않는다", () => {
      const { container } = render(
        <MarkdownText>{"텍스트 <script>alert(1)</script> 끝"}</MarkdownText>
      );
      expect(container.querySelector("script")).toBeNull();
    });
  });

  describe("외부 className 전달", () => {
    it("루트 <div>에 전달된 className이 붙는다", () => {
      const { container } = render(
        <MarkdownText className="custom-wrapper">{"hi"}</MarkdownText>
      );
      const root = container.firstChild as HTMLElement;
      expect(root.className).toBe("custom-wrapper");
    });
  });
});
