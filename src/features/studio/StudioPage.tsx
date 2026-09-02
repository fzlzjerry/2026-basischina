import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as TextareaKeyboardEvent,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  Article,
  Check,
  Copy,
  Eye,
  PencilSimple,
  WarningCircle,
} from "@phosphor-icons/react";
import referencesRaw from "@/content/references/references.yaml?raw";
import fixtureSource from "@/content/fixtures/scientific-authoring.md?raw";
import { PageHead } from "@/shared/components/PageHead";
import { PageLoading } from "@/shared/components/PageLoading";
import { Icon } from "@/shared/components/Icon";
import { Button } from "@/shared/components/Button";
import { stickerStyle, stickerStyleRaw } from "@/shared/styles/heal";
import { loadMarkdown } from "@/features/content/markdownLoader";
import {
  processMarkdown,
  type ProcessedMarkdown,
} from "@/features/content/markdownService";
import { MarkdownArticle } from "@/features/content/MarkdownArticle";
import {
  findLevel1HeadingLine,
  lintMarkdownSource,
  type MarkdownLintIssue,
} from "@/features/content/lintMarkdown";
import { parseReferenceLibrary } from "@/features/content/scientificCitations";
import { pageData } from "@/config/pageData";
import {
  DEFAULT_DRAFT,
  DEFAULT_PREVIEW_PATH,
  STUDIO_FIXTURE_ID,
  STUDIO_SNIPPETS,
  indentSelection,
  insertAtCursor,
  markdownStudioPages,
  normalizeStudioPageParam,
  readStoredDraft,
  studioPageGroups,
  writeStoredDraft,
} from "./studioDraft";
import "@/styles/markdown.css";
import "katex/dist/katex.min.css";
import "prismjs/themes/prism-tomorrow.css";

const PREVIEW_DELAY_MS = 160;
const STORE_DELAY_MS = 400;
const knownPagePaths = new Set(pageData.map((page) => page.path));
const referenceLibrary = parseReferenceLibrary(referencesRaw).library;
const pageGroups = studioPageGroups();

const studioSeo = {
  title: "Write · BASIS-China wiki preview",
  description:
    "Local authoring preview that uses the live wiki Markdown renderer.",
  keywords: ["authoring", "preview", "markdown"],
  robots: "noindex, nofollow",
};

type MobilePane = "write" | "preview";
type Notice = "copied" | "loaded" | "reset" | "copy-failed" | null;

/**
 * Unlisted writing studio. The preview is the same MarkdownArticle used on
 * live routes. The page is reachable at /studio but is kept off the registry
 * so nav, footer, sitemap, and 404 exits never link here.
 */
export default function StudioPage() {
  const [searchParams] = useSearchParams();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [source, setSource] = useState(DEFAULT_DRAFT);
  const [previewSource, setPreviewSource] = useState(DEFAULT_DRAFT);
  const [previewPath, setPreviewPath] = useState(DEFAULT_PREVIEW_PATH);
  const [mobilePane, setMobilePane] = useState<MobilePane>("write");
  const [fullPreview, setFullPreview] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const loadIntoEditor = useCallback(
    async (target: string, options?: { announce?: boolean }) => {
      setLoading(true);
      try {
        if (target === STUDIO_FIXTURE_ID) {
          setSource(fixtureSource);
          setPreviewSource(fixtureSource);
          setPreviewPath(DEFAULT_PREVIEW_PATH);
        } else {
          const page = markdownStudioPages().find(
            (item) => item.path === target,
          );
          if (!page) return;
          const raw = await loadMarkdown(page.contentPath);
          setSource(raw);
          setPreviewSource(raw);
          setPreviewPath(page.path);
        }
        if (options?.announce !== false) setNotice("loaded");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const requested = normalizeStudioPageParam(searchParams.get("page"));
    const stored = readStoredDraft();
    if (requested) {
      void loadIntoEditor(requested, { announce: false }).finally(() =>
        setReady(true),
      );
      return;
    }
    if (stored) {
      setSource(stored.source);
      setPreviewSource(stored.source);
      setPreviewPath(stored.previewPath);
    }
    setReady(true);
    // Hydrate once. A later ?page= change must not wipe an in-progress draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount hydrate
  }, [loadIntoEditor]);

  useEffect(() => {
    const handle = window.setTimeout(
      () => setPreviewSource(source),
      PREVIEW_DELAY_MS,
    );
    return () => window.clearTimeout(handle);
  }, [source]);

  useEffect(() => {
    if (!ready) return;
    const handle = window.setTimeout(() => {
      writeStoredDraft({
        source,
        previewPath,
        updatedAt: new Date().toISOString(),
      });
    }, STORE_DELAY_MS);
    return () => window.clearTimeout(handle);
  }, [source, previewPath, ready]);

  useEffect(() => {
    if (!notice) return;
    const handle = window.setTimeout(() => setNotice(null), 2200);
    return () => window.clearTimeout(handle);
  }, [notice]);

  const copySource = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(source);
      setNotice("copied");
    } catch {
      setNotice("copy-failed");
    }
  }, [source]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== "s"
      ) {
        return;
      }
      event.preventDefault();
      void copySource();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [copySource]);

  const processed = useMemo(() => safeProcess(previewSource), [previewSource]);
  const issues = useMemo(() => collectIssues(previewSource), [previewSource]);
  const previewPage =
    markdownStudioPages().find((page) => page.path === previewPath) ??
    markdownStudioPages()[0];

  if (!ready || !previewPage) {
    return (
      <>
        <PageHead path="/studio" title="Write" seo={studioSeo} />
        <PageLoading />
      </>
    );
  }

  function applySource(next: string, cursor?: number, end?: number) {
    setSource(next);
    window.requestAnimationFrame(() => {
      const editor = editorRef.current;
      if (!editor || cursor == null) return;
      editor.focus();
      editor.setSelectionRange(cursor, end ?? cursor);
    });
  }

  function onEditorKeyDown(event: TextareaKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Tab") return;
    event.preventDefault();
    const editor = event.currentTarget;
    const next = indentSelection(
      source,
      editor.selectionStart,
      editor.selectionEnd,
      event.shiftKey ? -1 : 1,
    );
    applySource(next.source, next.start, next.end);
  }

  function insertSnippet(id: string) {
    const snippet = STUDIO_SNIPPETS.find((item) => item.id === id);
    const editor = editorRef.current;
    if (!snippet || !editor) return;
    const start = editor.selectionStart;
    const prefix =
      start > 0 && source[start - 1] !== "\n" && !snippet.body.startsWith("[")
        ? "\n\n"
        : "";
    const inserted = insertAtCursor(
      source,
      start,
      editor.selectionEnd,
      prefix + snippet.body,
    );
    applySource(inserted.source, inserted.cursor);
  }

  function resetDraft() {
    const confirmed = window.confirm(
      "Replace the current draft with a blank template? The browser backup will update too.",
    );
    if (!confirmed) return;
    setSource(DEFAULT_DRAFT);
    setPreviewSource(DEFAULT_DRAFT);
    setNotice("reset");
  }

  function jumpToIssue(issue: MarkdownLintIssue) {
    if (issue.line == null) {
      setMobilePane("write");
      editorRef.current?.focus();
      return;
    }
    const lines = source.split(/\r?\n/);
    const before = lines.slice(0, issue.line - 1).join("\n");
    const start = before.length + (issue.line > 1 ? 1 : 0);
    const end = start + (lines[issue.line - 1]?.length ?? 0);
    setMobilePane("write");
    setFullPreview(false);
    applySource(source, start, end);
  }

  const showEditor = !fullPreview;
  const contentKey =
    "studio:" + previewPage.path + ":" + draftKey(previewSource);

  return (
    <>
      <PageHead path="/studio" title="Write" seo={studioSeo} />
      <div className="bg-page xl:grid xl:grid-cols-[26rem_minmax(0,1fr)]">
        {showEditor ? (
          <aside
            className={[
              "flex min-h-[calc(100dvh-4.25rem)] flex-col border-sticker-ink bg-page xl:sticky xl:top-[4.25rem] xl:h-[calc(100dvh-4.25rem)] xl:border-r-[3px]",
              mobilePane === "preview" ? "hidden xl:flex" : "flex",
            ].join(" ")}
          >
            <header className="shrink-0 border-b-2 border-sticker-ink/20 px-4 pb-3 pt-4">
              <p className="font-script text-[2rem] leading-none text-ink">
                Write
              </p>
              <p className="mt-2 text-sm leading-snug text-ink-soft">
                左边写 Markdown，右边就是 wiki
                上的实际渲染。这里不会改仓库里的文件，写好后复制回去。
              </p>
            </header>

            <div className="shrink-0 space-y-2 border-b-2 border-sticker-ink/20 px-4 py-3">
              <label className="block">
                <span className="font-hand text-sm text-sticker-ink">
                  Preview as
                </span>
                <select
                  className="mt-1 min-h-11 w-full rounded-[12px] border-2 border-sticker-ink bg-surface-2 px-3 font-hand text-sticker-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                  value={previewPath}
                  onChange={(event) => setPreviewPath(event.target.value)}
                >
                  {pageGroups.map((group) => (
                    <optgroup key={group.key} label={group.label}>
                      {group.pages.map((page) => (
                        <option key={page.path} value={page.path}>
                          {page.title}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={loading}
                  onClick={() => void loadIntoEditor(previewPath)}
                >
                  <Icon as={Article} size="xs" />
                  Load this page
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={loading}
                  onClick={() => void loadIntoEditor(STUDIO_FIXTURE_ID)}
                >
                  Load all-cards fixture
                </Button>
              </div>
              <label className="block">
                <span className="font-hand text-sm text-sticker-ink">
                  Insert
                </span>
                <select
                  className="mt-1 min-h-11 w-full rounded-[12px] border-2 border-sticker-ink bg-surface-2 px-3 font-hand text-sticker-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                  defaultValue=""
                  onChange={(event) => {
                    const id = event.target.value;
                    event.target.value = "";
                    if (id) insertSnippet(id);
                  }}
                >
                  <option value="" disabled>
                    Choose a block
                  </option>
                  {STUDIO_SNIPPETS.map((snippet) => (
                    <option key={snippet.id} value={snippet.id}>
                      {snippet.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => void copySource()}>
                  <Icon as={Copy} size="xs" />
                  Copy Markdown
                </Button>
                <Button size="sm" variant="ghost" onClick={resetDraft}>
                  New draft
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="hidden xl:inline-flex"
                  onClick={() => setFullPreview(true)}
                >
                  <Icon as={Eye} size="xs" />
                  Full preview
                </Button>
              </div>
              <p className="text-xs text-ink-soft" aria-live="polite">
                {noticeLabel(notice) ??
                  "Ctrl or Cmd + S copies. Tab indents YAML fields."}
              </p>
            </div>

            <label className="flex min-h-0 flex-1 flex-col px-3 pb-2 pt-3">
              <span className="sr-only">Markdown source</span>
              <textarea
                ref={editorRef}
                value={source}
                onChange={(event) => setSource(event.target.value)}
                onKeyDown={onEditorKeyDown}
                spellCheck={false}
                className="min-h-52 flex-1 resize-none rounded-[14px] border-2 border-sticker-ink bg-surface p-3 font-mono text-[13px] leading-relaxed text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                style={stickerStyleRaw(
                  "0deg",
                  "16px 12px 16px 12px / 12px 16px 12px 16px",
                )}
              />
            </label>

            <section
              className="max-h-44 shrink-0 overflow-y-auto border-t-2 border-sticker-ink/20 px-4 py-3"
              aria-label="Content checks"
            >
              <p className="flex items-center gap-2 font-hand text-sm text-sticker-ink">
                <Icon
                  as={issues.length > 0 ? WarningCircle : Check}
                  size="xs"
                />
                {issues.length > 0
                  ? issues.length + " check(s) to fix"
                  : "Checks match validate:content"}
              </p>
              {issues.length > 0 ? (
                <ul className="mt-2 space-y-1.5">
                  {issues.map((issue, index) => (
                    <li key={index}>
                      <button
                        type="button"
                        onClick={() => jumpToIssue(issue)}
                        className="w-full rounded-[10px] bg-error-soft px-2.5 py-2 text-left text-xs leading-snug text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                      >
                        {issue.line != null ? "L" + issue.line + " " : ""}
                        {issue.scope ? "[" + issue.scope + "] " : ""}
                        {issue.message}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>

            <div className="flex shrink-0 gap-2 border-t-2 border-sticker-ink/20 p-3 xl:hidden">
              <PaneButton
                active={mobilePane === "write"}
                onClick={() => setMobilePane("write")}
              >
                <Icon as={PencilSimple} size="xs" />
                Write
              </PaneButton>
              <PaneButton
                active={mobilePane === "preview"}
                onClick={() => setMobilePane("preview")}
              >
                <Icon as={Eye} size="xs" />
                Preview
              </PaneButton>
            </div>
          </aside>
        ) : null}

        <div
          className={
            mobilePane === "write" && showEditor ? "hidden xl:block" : "block"
          }
        >
          {processed.ok ? (
            <MarkdownArticle
              title={previewPage.title}
              summary={previewPage.summary}
              category={previewPage.category}
              processed={processed.value}
              contentKey={contentKey}
              pagePath={previewPage.path}
            />
          ) : (
            <div className="min-h-screen bg-page px-6 py-16">
              <div
                className="heal-cutout mx-auto max-w-xl bg-error-soft p-6 text-error"
                style={stickerStyle(0)}
                role="alert"
              >
                <p className="font-hand text-lg">
                  Renderer could not parse this draft.
                </p>
                <p className="mt-2 text-sm">{processed.message}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {fullPreview ? (
        <button
          type="button"
          onClick={() => setFullPreview(false)}
          className="heal-sticker fixed bottom-5 left-4 z-30 inline-flex min-h-11 items-center gap-2 bg-app-orange-soft px-4 py-2 font-hand text-sticker-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          style={stickerStyle(2)}
        >
          <Icon as={PencilSimple} weight="bold" />
          Back to editor
        </button>
      ) : null}

      <div className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 gap-2 xl:hidden">
        {mobilePane === "preview" ? (
          <PaneButton active={false} onClick={() => setMobilePane("write")}>
            <Icon as={PencilSimple} size="xs" />
            Write
          </PaneButton>
        ) : null}
      </div>
    </>
  );
}

function PaneButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "heal-sticker inline-flex min-h-11 items-center gap-2 px-4 py-2 font-hand text-sticker-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
        active ? "bg-app-orange" : "bg-surface-2",
      ].join(" ")}
      style={stickerStyle(active ? 1 : 3)}
    >
      {children}
    </button>
  );
}

function noticeLabel(notice: Notice): string | null {
  if (notice === "copied") return "Copied. Paste it back into the .md file.";
  if (notice === "loaded") return "Loaded the current wiki source.";
  if (notice === "reset") return "Draft reset to the starter template.";
  if (notice === "copy-failed")
    return "Could not copy. Select the text and copy it manually.";
  return null;
}

function collectIssues(raw: string): MarkdownLintIssue[] {
  const result = lintMarkdownSource(raw, {
    knownPagePaths,
    referenceLibrary,
  });
  const heading = findLevel1HeadingLine(raw);
  if (heading == null) return result.issues;
  return [
    ...result.issues,
    {
      message:
        'level-1 heading. Article bodies must start at "##" — the page title is the h1.',
      line: heading,
    },
  ];
}

function draftKey(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (Math.imul(31, hash) + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function safeProcess(
  raw: string,
): { ok: true; value: ProcessedMarkdown } | { ok: false; message: string } {
  try {
    return { ok: true, value: processMarkdown(raw) };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
