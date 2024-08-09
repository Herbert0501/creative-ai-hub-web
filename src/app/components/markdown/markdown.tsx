import ReactMarkdown from "react-markdown";
import RemarkMath from "remark-math";
import RemarkBreaks from "remark-breaks";
import RehypeKatex from "rehype-katex";
import RemarkGfm from "remark-gfm";
import RehypeHighlight from "rehype-highlight";
import { useRef, useState, RefObject, useEffect } from "react";
import mermaid from "mermaid";
import React from "react";
import { useDebouncedCallback } from "use-debounce";
import LoadingIcon from "@/app/static/icons/loading.svg";

export function Mermaid(props: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (props.code && ref.current) {
      mermaid
        .run({
          nodes: [ref.current],
          suppressErrors: true,
        })
        .catch((e) => {
          setHasError(true);
          console.error("[Mermaid] ", e.message);
        });
    }
  }, [props.code]);

  function viewSvgInNewWindow() {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    const text = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([text], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url);
    if (win) {
      win.onload = () => URL.revokeObjectURL(url);
    }
  }

  if (hasError) {
    return null;
  }

  return (
    <div
      className="no-dark mermaid"
      style={{
        cursor: "pointer",
        overflow: "auto",
      }}
      ref={ref}
      onClick={() => viewSvgInNewWindow()}
    >
      {props.code}
    </div>
  );
}

export function PreCode(props: { isUser: boolean } & React.HTMLAttributes<HTMLPreElement>) {
  const ref = useRef<HTMLPreElement>(null);
  const refText = ref.current?.innerText;
  const [mermaidCode, setMermaidCode] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const renderMermaid = useDebouncedCallback(() => {
    if (!ref.current) return;
    const mermaidDom = ref.current.querySelector("code.language-mermaid");
    if (mermaidDom) {
      setMermaidCode((mermaidDom as HTMLElement).innerText);
    }
  }, 600);

  useEffect(() => {
    setTimeout(renderMermaid, 1);
  }, [refText, renderMermaid]);

  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  const copyCodeToClipboard = () => {
    if (ref.current) {
      const codeText = ref.current.innerText;
      navigator.clipboard.writeText(codeText).then(() => {
        setCopySuccess(true);
      });
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {mermaidCode.length > 0 && (
        <Mermaid code={mermaidCode} key={mermaidCode} />
      )}
      {!props.isUser && (
        <div className="copy-head">
          <div className="copy-flag">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="copy-code-button" onClick={copyCodeToClipboard}></span>
        </div>
      )}
      <pre ref={ref} {...props}>
        {props.children}
      </pre>
      {copySuccess && <div className="copy-success">Copied!</div>}
    </div>
  );
}

function _MarkDownContent(props: { content: string; isUser: boolean }) {
  return (
    <ReactMarkdown
      remarkPlugins={[RemarkMath, RemarkGfm, RemarkBreaks]}
      rehypePlugins={[
        RehypeKatex,
        [
          RehypeHighlight,
          {
            detect: false,
            ignoreMissing: true,
          },
        ],
      ]}
      components={{
        pre: (preProps) => <PreCode {...preProps} isUser={props.isUser} />,
        code: (codeProps) => {
          const { className = "language-markdown", children } = codeProps;
          return (
            <code className={`hljs ${className}`}>
              {children}
            </code>
          );
        },
        a: (aProps) => {
          const href = aProps.href || "";
          const isInternal = /^\/#/i.test(href);
          const target = isInternal ? "_self" : aProps.target ?? "_blank";
          return <a {...aProps} target={target} />;
        },
      }}
    >
      {props.content}
    </ReactMarkdown>
  );
}

export const MarkDownContent = React.memo(_MarkDownContent);

export function Markdown(
  props: {
    content: string;
    loading?: boolean;
    fontSize?: number;
    parentRef?: RefObject<HTMLDivElement>;
    defaultShow?: boolean;
    isUser: boolean;
  } & React.DOMAttributes<HTMLDivElement>
) {
  return (
    <div
      className="markdown-body"
      style={{
        fontSize: `${props.fontSize ?? 14}px`,
        direction: /[\u0600-\u06FF]/.test(props.content) ? "rtl" : "ltr",
      }}
    >
      {props.loading ? (
        <LoadingIcon />
      ) : (
        <MarkDownContent content={props.content} isUser={props.isUser} />
      )}
    </div>
  );
}
