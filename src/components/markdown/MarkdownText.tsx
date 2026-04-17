"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// react-markdown + remark-gfm 기반 렌더러.
// GFM 테이블 / 취소선 / task list / autolink 까지 지원.
// HTML 원시 태그(<small> 등)는 기본적으로 이스케이프됨(XSS 방지). 필요 시 rehype-raw 추가 검토.
const MARKDOWN_COMPONENTS: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  h1: ({ children }) => <p className="font-semibold mt-3 mb-1">{children}</p>,
  h2: ({ children }) => <p className="font-semibold mt-3 mb-1">{children}</p>,
  h3: ({ children }) => <p className="font-semibold mt-3 mb-1">{children}</p>,
  h4: ({ children }) => <p className="font-semibold mt-3 mb-1">{children}</p>,
  h5: ({ children }) => <p className="font-semibold mt-3 mb-1">{children}</p>,
  h6: ({ children }) => <p className="font-semibold mt-3 mb-1">{children}</p>,
  p: ({ children }) => <p className="my-0.5">{children}</p>,
  ul: ({ children }) => (
    <ul className="my-0.5 ml-4 list-disc space-y-0.5 marker:text-slate-400">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-0.5 ml-4 list-decimal space-y-0.5 marker:text-slate-400">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-1 border-l-2 border-slate-200 pl-3 text-slate-600">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline break-all"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  hr: () => <hr className="my-3 border-slate-200" />,
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-xl bg-slate-900 px-4 py-3 text-[12px] leading-relaxed text-slate-100">
      {children}
    </pre>
  ),
  code: ({ className: cls, children, ...props }) => {
    // inline code 는 language 클래스가 없고, 블록 code 는 pre 안에서 language-xxx 를 받음.
    const isBlock = typeof cls === "string" && cls.startsWith("language-");
    if (isBlock) {
      return (
        <code className={cls} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded bg-slate-200/60 px-1 py-0.5 font-mono text-[0.95em] text-slate-700"
        {...props}
      >
        {children}
      </code>
    );
  },
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-100">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-slate-200">{children}</tr>,
  th: ({ children }) => (
    <th className="px-3 py-2 text-left font-semibold text-slate-700">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 text-slate-600 align-top">{children}</td>
  ),
};

export function MarkdownText({
  children,
  className,
}: {
  children?: string;
  className?: string;
}) {
  if (!children) return null;
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownText;
