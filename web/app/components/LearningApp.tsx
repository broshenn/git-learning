"use client";

import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Copy,
  ExternalLink,
  GitBranch,
  Menu,
  Moon,
  Search,
  Sun,
  TerminalSquare,
  X,
} from "lucide-react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  courseDocuments,
  type CourseDocument,
} from "../../content/courses.generated";

const progressKey = "git-course-progress-v1";
const themeKey = "git-course-theme-v1";

type Heading = {
  depth: number;
  id: string;
  label: string;
};

function plainText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(plainText).join("");
  }
  if (value && typeof value === "object" && "props" in value) {
    return plainText((value as { props?: { children?: unknown } }).props?.children);
  }
  return "";
}

function headingId(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[`*_~]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function getHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  let insideFence = false;

  for (const line of markdown.split("\n")) {
    if (line.trimStart().startsWith("```")) {
      insideFence = !insideFence;
      continue;
    }
    if (insideFence) continue;
    const match = /^(#{2,3})\s+(.+)$/.exec(line);
    if (!match) continue;
    const label = match[2].replace(/[`*_~]/g, "").trim();
    headings.push({ depth: match[1].length, id: headingId(label), label });
  }
  return headings;
}

function MermaidDiagram({ source }: { source: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const render = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: document.documentElement.dataset.theme === "dark" ? "dark" : "neutral",
          fontFamily: "Inter, Microsoft YaHei, sans-serif",
        });
        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, source);
        if (active && host.current) {
          host.current.innerHTML = svg;
        }
      } catch {
        if (active) setFailed(true);
      }
    };
    void render();
    return () => {
      active = false;
    };
  }, [source]);

  if (failed) {
    return <pre className="mermaid-fallback">{source}</pre>;
  }
  return <div ref={host} className="mermaid-diagram" aria-label="课程流程图" />;
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  if (language === "mermaid") {
    return <MermaidDiagram source={code} />;
  }

  return (
    <div className="code-shell">
      <div className="code-toolbar">
        <span>{language || "text"}</span>
        <button type="button" onClick={copy} aria-label="复制这段代码">
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "已复制" : "复制"}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MarkdownArticle({ markdown }: { markdown: string }) {
  const components: Components = {
    h2: ({ children }) => {
      const label = plainText(children);
      return <h2 id={headingId(label)}>{children}</h2>;
    },
    h3: ({ children }) => {
      const label = plainText(children);
      return <h3 id={headingId(label)}>{children}</h3>;
    },
    a: ({ href, children }) => (
      <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
        {children}
      </a>
    ),
    code: ({ className, children }) => {
      const match = /language-([\w-]+)/.exec(className ?? "");
      const code = plainText(children).replace(/\n$/, "");
      if (!className) return <code className="inline-code">{children}</code>;
      return <CodeBlock language={match?.[1] ?? "text"} code={code} />;
    },
    pre: ({ children }) => <>{children}</>,
  };

  return (
    <article className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </article>
  );
}

export function LearningApp() {
  const [activeId, setActiveId] = useState("course-1");
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  const activeIndex = courseDocuments.findIndex((item) => item.id === activeId);
  const activeDocument = courseDocuments[activeIndex] ?? courseDocuments[0];
  const courses = courseDocuments.filter((item) => item.kind === "course");
  const references = courseDocuments.filter((item) => item.kind === "reference");
  const headings = useMemo(
    () => getHeadings(activeDocument.content),
    [activeDocument.content],
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const savedProgress = JSON.parse(
        localStorage.getItem(progressKey) ?? "[]",
      ) as string[];
      const savedTheme = localStorage.getItem(themeKey);
      const initialDark = savedTheme
        ? savedTheme === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
      setCompleted(new Set(savedProgress));
      setDark(initialDark);
      document.documentElement.dataset.theme = initialDark ? "dark" : "light";
      setReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem(themeKey, dark ? "dark" : "light");
  }, [dark, ready]);

  const openDocument = (id: string) => {
    setActiveId(id);
    setMenuOpen(false);
    setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleComplete = () => {
    if (activeDocument.kind !== "course") return;
    const next = new Set(completed);
    if (next.has(activeDocument.id)) next.delete(activeDocument.id);
    else next.add(activeDocument.id);
    setCompleted(next);
    localStorage.setItem(progressKey, JSON.stringify([...next]));
  };

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (normalized.length < 2) return [];
    return courseDocuments
      .flatMap((document) => {
        const lines = document.content.split("\n").filter((line) => line.trim());
        const matches = lines
          .filter((line) => line.toLowerCase().includes(normalized))
          .slice(0, 2)
          .map((line) => ({ document, line: line.replace(/^#+\s*/, "").slice(0, 100) }));
        if (document.title.toLowerCase().includes(normalized)) {
          matches.unshift({ document, line: document.description });
        }
        return matches;
      })
      .slice(0, 8);
  }, [query]);

  const completedCount = courses.filter((course) => completed.has(course.id)).length;
  const previous = activeIndex > 0 ? courseDocuments[activeIndex - 1] : null;
  const next = activeIndex < courseDocuments.length - 1 ? courseDocuments[activeIndex + 1] : null;

  const navGroup = (label: string, documents: CourseDocument[]) => (
    <div className="nav-group">
      <p className="nav-label">{label}</p>
      {documents.map((document) => {
        const isActive = activeId === document.id;
        const isDone = completed.has(document.id);
        return (
          <button
            key={document.id}
            type="button"
            className={`course-nav-item ${isActive ? "active" : ""}`}
            onClick={() => openDocument(document.id)}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="course-state">
              {document.kind === "reference" ? (
                <BookOpen size={17} />
              ) : isDone ? (
                <CheckCircle2 size={18} />
              ) : (
                <Circle size={18} />
              )}
            </span>
            <span>
              <strong>{document.shortTitle}</strong>
              <small>{document.duration}</small>
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="learning-app">
      <header className="topbar">
        <button
          type="button"
          className="icon-button mobile-menu-button"
          onClick={() => setMenuOpen(true)}
          aria-label="打开课程目录"
        >
          <Menu size={20} />
        </button>
        <div className="brand">
          <span className="brand-mark"><TerminalSquare size={20} /></span>
          <span><strong>Git 实战课</strong><small>从零到企业协作</small></span>
        </div>
        <div className="search-area">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索命令、报错或概念"
            aria-label="搜索全部课程"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="清空搜索">
              <X size={16} />
            </button>
          )}
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((result, index) => (
                <button
                  key={`${result.document.id}-${index}`}
                  type="button"
                  onClick={() => openDocument(result.document.id)}
                >
                  <strong>{result.document.shortTitle}</strong>
                  <span>{result.line}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <a
          className="icon-button"
          href="https://github.com/broshenn/git-learning"
          target="_blank"
          rel="noreferrer"
          aria-label="打开 GitHub 仓库"
        >
                <GitBranch size={19} />
        </a>
        <button
          type="button"
          className="icon-button"
          onClick={() => setDark((value) => !value)}
          aria-label={dark ? "切换到浅色模式" : "切换到深色模式"}
        >
          {dark ? <Sun size={19} /> : <Moon size={19} />}
        </button>
      </header>

      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="mobile-sidebar-head">
          <strong>课程目录</strong>
          <button type="button" onClick={() => setMenuOpen(false)} aria-label="关闭课程目录">
            <X size={20} />
          </button>
        </div>
        <div className="progress-card">
          <div><span>学习进度</span><strong>{completedCount} / 5</strong></div>
          <div className="progress-track"><span style={{ width: `${completedCount * 20}%` }} /></div>
          <small>{completedCount === 5 ? "五课完成，可以挑战毕业任务了" : "一次只学一课，完成后再继续"}</small>
        </div>
        <nav aria-label="课程导航">
          {navGroup("五课主线", courses)}
          {navGroup("随查资料", references)}
        </nav>
        <div className="sidebar-note">
          <span>安全习惯</span>
          每次操作前先执行 <code>git status</code>
        </div>
      </aside>
      {menuOpen && <button className="sidebar-backdrop" onClick={() => setMenuOpen(false)} aria-label="关闭目录" />}

      <main className="content-area">
        <div className="document-header">
          <div className="document-kicker">
            <span>{activeDocument.kind === "course" ? `课程 ${activeDocument.order} / 5` : "参考资料"}</span>
            <span><Clock3 size={14} /> {activeDocument.duration}</span>
          </div>
          <h1>{activeDocument.title}</h1>
          <p>{activeDocument.description}</p>
          <div className="document-actions">
            {activeDocument.kind === "course" && (
              <button
                type="button"
                className={`complete-button ${completed.has(activeDocument.id) ? "done" : ""}`}
                onClick={toggleComplete}
              >
                {completed.has(activeDocument.id) ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                {completed.has(activeDocument.id) ? "已完成本课" : "标记本课完成"}
              </button>
            )}
            <a
              className="source-link"
              href={`https://github.com/broshenn/git-learning/blob/main/${activeDocument.sourcePath}`}
              target="_blank"
              rel="noreferrer"
            >
              查看 Markdown 源文档 <ExternalLink size={15} />
            </a>
          </div>
        </div>

        <MarkdownArticle markdown={activeDocument.content} />

        <div className="page-navigation">
          {previous ? (
            <button type="button" onClick={() => openDocument(previous.id)}>
              <ChevronLeft size={18} /><span><small>上一篇</small>{previous.shortTitle}</span>
            </button>
          ) : <span />}
          {next && (
            <button type="button" className="next" onClick={() => openDocument(next.id)}>
              <span><small>下一篇</small>{next.shortTitle}</span><ChevronRight size={18} />
            </button>
          )}
        </div>
      </main>

      <aside className="toc-panel">
        <p>本页目录</p>
        <nav>
          {headings.map((heading) => (
            <a key={`${heading.id}-${heading.label}`} className={`depth-${heading.depth}`} href={`#${heading.id}`}>
              {heading.label}
            </a>
          ))}
        </nav>
        <div className="toc-tip">
          <TerminalSquare size={18} />
          <div><strong>亲手输入命令</strong><span>复制能减少拼写错误，亲手输入更容易形成记忆。</span></div>
        </div>
      </aside>
    </div>
  );
}
