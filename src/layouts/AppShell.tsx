import {
  Avatar,
  Breadcrumb,
  Button,
  Drawer,
  Input,
  Layout,
  Menu,
  Space,
  Tabs,
  Tooltip,
  message,
  type MenuProps,
} from "antd";
import { Bell, BookOpenText, ChevronLeft, ChevronRight, Copy, LogOut } from "lucide-react";
import { Children, cloneElement, isValidElement, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { Outlet, useLocation, useNavigate, type NavigateFunction } from "react-router-dom";
import remarkGfm from "remark-gfm";
import { appConfig } from "../app/appConfig";
import {
  flattenNavigationItems,
  isNavigationGroupItem,
  navigationItems,
  type NavigationItem,
} from "../app/navigation";
import { productMenuDocs, type ProductMenuDoc } from "../data/productDocs";
import { useShellStore } from "../store/useShellStore";
import "./AppShell.css";

const { Header, Sider, Content } = Layout;
const { Search } = Input;
const documentModules = import.meta.glob("../../docs/**/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

type MenuItem = NonNullable<MenuProps["items"]>[number];
type HeadingItem = {
  id: string;
  level: number;
  text: string;
};

function getSelectedKey(pathname: string) {
  const matchedItem = flattenNavigationItems()
    .sort((a, b) => b.path.length - a.path.length)
    .find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`));

  return matchedItem?.key ?? "home";
}

function findNavigationTrail(pathname: string, items: NavigationItem[], parents: string[] = []): string[] {
  for (const item of items) {
    const trail = [...parents, item.label];

    if (isNavigationGroupItem(item)) {
      const childTrail = findNavigationTrail(pathname, item.children, trail);

      if (childTrail.length > 0) {
        return childTrail;
      }
    } else if (pathname === item.path || pathname.startsWith(`${item.path}/`)) {
      return trail;
    }
  }

  return [];
}

function getBreadcrumbItems(pathname: string) {
  const labels = findNavigationTrail(pathname, navigationItems);
  return (labels.length > 0 ? labels : ["开始使用"]).map((label) => ({ title: label }));
}

function getCurrentPageDoc(pathname: string): ProductMenuDoc | undefined {
  return (
    [...productMenuDocs]
      .sort((a, b) => b.route.length - a.route.length)
      .find((item) => pathname === item.route || pathname.startsWith(`${item.route}/`)) ??
    productMenuDocs.find((item) => item.route === "/home")
  );
}

function getDocumentContent(documentPath: string) {
  return documentModules[`../../${documentPath}`] ?? "暂未读取到文档内容，请按文档路径查看文件。";
}

function getDocumentPaths(pageDoc?: ProductMenuDoc) {
  if (!pageDoc) {
    return [];
  }

  return Array.from(new Set([pageDoc.documentPath, ...(pageDoc.relatedDocumentPaths ?? [])]));
}

function getDocumentLabel(documentPath: string) {
  return documentPath.split("/").at(-1) ?? documentPath;
}

function stripMarkdownSyntax(text: string) {
  return text
    .replace(/!\[([^\]]*)]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[`*_~>#-]/g, "")
    .trim();
}

function getPlainText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getPlainText).join("");
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getPlainText(node.props.children);
  }

  return "";
}

function createHeadingId(text: string) {
  return (
    stripMarkdownSyntax(text)
      .toLowerCase()
      .replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~，。！？、：；（）【】《》]/g, "")
      .replace(/\s+/g, "-") || "section"
  );
}

function extractHeadings(content: string): HeadingItem[] {
  const headings: HeadingItem[] = [];
  let inCodeBlock = false;

  content.split(/\r?\n/).forEach((line) => {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      return;
    }

    if (inCodeBlock) {
      return;
    }

    const match = /^(#{1,4})\s+(.+?)\s*#*\s*$/.exec(line);

    if (!match) {
      return;
    }

    const text = stripMarkdownSyntax(match[2]);

    if (text) {
      headings.push({
        id: createHeadingId(text),
        level: match[1].length,
        text,
      });
    }
  });

  return headings;
}

function getSearchableMarkdownText(content: string) {
  return content
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("```"))
    .map(stripMarkdownSyntax)
    .join("\n");
}

function countSearchMatches(content: string, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return 0;
  }

  let count = 0;
  let index = 0;
  const searchableText = getSearchableMarkdownText(content).toLowerCase();

  while (index < searchableText.length) {
    const foundIndex = searchableText.indexOf(normalizedQuery, index);

    if (foundIndex === -1) {
      break;
    }

    count += 1;
    index = foundIndex + normalizedQuery.length;
  }

  return count;
}

function highlightText(text: string, query: string, state: { currentIndex: number; selectedIndex: number }) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return text;
  }

  const parts: ReactNode[] = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = normalizedQuery.toLowerCase();
  let cursor = 0;

  while (cursor < text.length) {
    const matchIndex = lowerText.indexOf(lowerQuery, cursor);

    if (matchIndex === -1) {
      parts.push(text.slice(cursor));
      break;
    }

    if (matchIndex > cursor) {
      parts.push(text.slice(cursor, matchIndex));
    }

    const searchIndex = state.currentIndex;

    parts.push(
      <mark
        className={`app-shell-markdown-search-hit${
          searchIndex === state.selectedIndex ? " app-shell-markdown-search-hit--active" : ""
        }`}
        data-search-index={searchIndex}
        key={`search-hit-${searchIndex}`}
      >
        {text.slice(matchIndex, matchIndex + normalizedQuery.length)}
      </mark>,
    );
    state.currentIndex += 1;
    cursor = matchIndex + normalizedQuery.length;
  }

  return parts;
}

function highlightChildren(
  children: ReactNode,
  query: string,
  state: { currentIndex: number; selectedIndex: number },
): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === "string") {
      return highlightText(child, query, state);
    }

    if (Array.isArray(child)) {
      return highlightChildren(child, query, state);
    }

    if (isValidElement<{ children?: ReactNode }>(child) && child.props.children) {
      return cloneElement(child, undefined, highlightChildren(child.props.children, query, state));
    }

    return child;
  });
}

async function copyText(text: string) {
  await navigator.clipboard?.writeText(text);
}

function buildMenuItems(items: NavigationItem[], navigate: NavigateFunction): MenuItem[] {
  return items.map((item) => {
    if (isNavigationGroupItem(item)) {
      return {
        key: item.key,
        icon: item.icon,
        label: item.label,
        children: buildMenuItems(item.children, navigate),
      };
    }

    return {
      key: item.key,
      icon: item.icon,
      label: item.label,
      onClick: () => navigate(item.path),
    };
  });
}

function MarkdownReader({
  content,
  documentPath,
  searchText,
  selectedSearchIndex,
}: {
  content: string;
  documentPath: string;
  searchText: string;
  selectedSearchIndex: number;
}) {
  const readerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headings = useMemo(() => extractHeadings(content), [content]);
  const searchMatchCount = useMemo(() => countSearchMatches(content, searchText), [content, searchText]);
  const activeSearchIndex = searchMatchCount > 0 ? Math.min(selectedSearchIndex, searchMatchCount - 1) : -1;
  const highlightState = { currentIndex: 0, selectedIndex: activeSearchIndex };

  useEffect(() => {
    if (activeSearchIndex < 0) {
      return;
    }

    contentRef.current
      ?.querySelector(`[data-search-index="${activeSearchIndex}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeSearchIndex, searchText]);

  const jumpToHeading = (id: string) => {
    const contentElement = contentRef.current;
    const readerElement = readerRef.current;

    if (!contentElement || !readerElement) {
      return;
    }

    const heading = Array.from(readerElement.querySelectorAll<HTMLElement>("[data-heading-id]")).find(
      (element) => element.dataset.headingId === id,
    );

    if (!heading) {
      return;
    }

    const contentTop = contentElement.getBoundingClientRect().top;
    const headingTop = heading.getBoundingClientRect().top;
    const nextScrollTop = headingTop - contentTop + contentElement.scrollTop - 58;

    contentElement.scrollTo({
      top: Math.max(nextScrollTop, 0),
      behavior: "smooth",
    });
  };

  const renderHighlightedChildren = (children: ReactNode) => highlightChildren(children, searchText, highlightState);
  const renderHeading = (level: 1 | 2 | 3 | 4, children: ReactNode) => {
    const text = getPlainText(children);
    const id = createHeadingId(text);
    const HeadingTag = `h${level}` as const;

    return (
      <HeadingTag data-heading-id={id} id={id}>
        <a href={`#${id}`}>{renderHighlightedChildren(children)}</a>
      </HeadingTag>
    );
  };

  return (
    <div className="app-shell-doc-reader" ref={readerRef}>
      <aside className="app-shell-doc-reader__aside" aria-label="文档目录">
        <section className="app-shell-doc-reader__panel">
          <div className="app-shell-doc-reader__panel-title">目录</div>
          {headings.length > 0 ? (
            <nav className="app-shell-doc-reader__toc">
              {headings.map((heading) => (
                <button
                  type="button"
                  className={`app-shell-doc-reader__toc-item app-shell-doc-reader__toc-item--h${heading.level}`}
                  data-heading-target={heading.id}
                  key={heading.id}
                  onClick={() => jumpToHeading(heading.id)}
                >
                  {heading.text}
                </button>
              ))}
            </nav>
          ) : (
            <div className="app-shell-doc-reader__empty">当前文档暂无标题</div>
          )}
        </section>
      </aside>
      <div className="app-shell-doc-modal__preview" aria-label="当前页面文档内容" ref={contentRef}>
        <div className="app-shell-doc-modal__meta">
          <strong>{getDocumentLabel(documentPath)}</strong>
          <span>{documentPath}</span>
        </div>
        <article className="app-shell-markdown">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => renderHeading(1, children),
              h2: ({ children }) => renderHeading(2, children),
              h3: ({ children }) => renderHeading(3, children),
              h4: ({ children }) => renderHeading(4, children),
              p: ({ children }) => <p>{renderHighlightedChildren(children)}</p>,
              li: ({ children }) => <li>{renderHighlightedChildren(children)}</li>,
              blockquote: ({ children }) => <blockquote>{renderHighlightedChildren(children)}</blockquote>,
              td: ({ children }) => <td>{renderHighlightedChildren(children)}</td>,
              th: ({ children }) => <th>{renderHighlightedChildren(children)}</th>,
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [docDrawerOpen, setDocDrawerOpen] = useState(false);
  const collapsed = useShellStore((state) => state.collapsed);
  const setCollapsed = useShellStore((state) => state.setCollapsed);
  const menuItems = buildMenuItems(navigationItems, navigate);
  const currentPageDoc = getCurrentPageDoc(location.pathname);
  const currentDocumentPaths = getDocumentPaths(currentPageDoc);
  const [activeDocumentPath, setActiveDocumentPath] = useState<string>();
  const [documentSearchText, setDocumentSearchText] = useState("");
  const [documentSearchIndex, setDocumentSearchIndex] = useState(0);
  const selectedDocumentPath =
    activeDocumentPath && currentDocumentPaths.includes(activeDocumentPath)
      ? activeDocumentPath
      : currentDocumentPaths[0];
  const selectedDocumentContent = selectedDocumentPath ? getDocumentContent(selectedDocumentPath) : "";
  const documentSearchMatchCount = useMemo(
    () => countSearchMatches(selectedDocumentContent, documentSearchText),
    [selectedDocumentContent, documentSearchText],
  );
  const activeDocumentSearchIndex =
    documentSearchMatchCount > 0 ? Math.min(documentSearchIndex, documentSearchMatchCount - 1) : -1;

  useEffect(() => {
    setDocumentSearchIndex(0);
  }, [selectedDocumentPath, documentSearchText]);

  const jumpDocumentSearchMatch = (offset: number) => {
    if (documentSearchMatchCount === 0) {
      return;
    }

    setDocumentSearchIndex((current) => (current + offset + documentSearchMatchCount) % documentSearchMatchCount);
  };

  const copyCurrentDocument = async () => {
    if (!selectedDocumentPath) {
      return;
    }

    await copyText(getDocumentContent(selectedDocumentPath));
    message.success("已复制当前文档");
  };

  const copyAllDocuments = async () => {
    const allDocumentContent = currentDocumentPaths
      .map((documentPath) => `# ${getDocumentLabel(documentPath)}\n\n${getDocumentContent(documentPath)}`)
      .join("\n\n---\n\n");

    await copyText(allDocumentContent);
    message.success("已复制全部文档");
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      message.success("已退出登录");
    } catch {
      message.warning("退出请求未完成，正在返回验证页");
    } finally {
      window.location.assign("/access");
    }
  };

  const docDrawerTitle = (
    <div className="app-shell-doc-drawer__title">
      <div className="app-shell-doc-drawer__title-main">{currentPageDoc?.menu ?? "文档"}</div>
      <div className="app-shell-doc-drawer__title-search">
        <Search
          allowClear
          onChange={(event) => setDocumentSearchText(event.target.value)}
          placeholder="搜索当前文档"
          size="middle"
          value={documentSearchText}
        />
        {documentSearchText.trim() ? (
          <span className="app-shell-doc-drawer__search-count">
            {documentSearchMatchCount > 0 ? `${activeDocumentSearchIndex + 1} / ${documentSearchMatchCount}` : "无匹配"}
          </span>
        ) : null}
        {documentSearchText.trim() ? (
          <Space className="app-shell-doc-drawer__search-actions" size={4}>
            <Button size="small" onClick={() => jumpDocumentSearchMatch(-1)} disabled={documentSearchMatchCount === 0}>
              上一个
            </Button>
            <Button size="small" onClick={() => jumpDocumentSearchMatch(1)} disabled={documentSearchMatchCount === 0}>
              下一个
            </Button>
          </Space>
        ) : null}
      </div>
    </div>
  );

  return (
    <Layout className="app-shell">
      <Sider
        className="app-shell__sider"
        width={248}
        collapsedWidth={72}
        collapsible
        collapsed={collapsed}
        trigger={null}
      >
        <div className="app-shell__brand" aria-label={appConfig.appName}>
          <div className="app-shell__brand-mark">{appConfig.brandMark}</div>
          {!collapsed ? <span>{appConfig.appName}</span> : null}
        </div>
        <Menu mode="inline" selectedKeys={[getSelectedKey(location.pathname)]} items={menuItems} />
      </Sider>
      <Layout>
        <Header className="app-shell__header">
          <div className="app-shell__header-left">
            <Tooltip title={collapsed ? "展开导航" : "收起导航"}>
              <Button
                aria-label={collapsed ? "展开导航" : "收起导航"}
                icon={collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                onClick={() => setCollapsed(!collapsed)}
                type="text"
              />
            </Tooltip>
            <Breadcrumb className="app-shell__breadcrumb" items={getBreadcrumbItems(location.pathname)} />
          </div>
          <div className="app-shell__header-right">
            <Tooltip title="查看当前页面文档">
              <Button
                aria-label="查看当前页面文档"
                icon={<BookOpenText size={18} />}
                onClick={() => setDocDrawerOpen(true)}
                type="text"
              >
                文档
              </Button>
            </Tooltip>
            <Tooltip title="通知">
              <Button aria-label="通知" icon={<Bell size={18} />} type="text" />
            </Tooltip>
            <Tooltip title="退出登录">
              <Button aria-label="退出登录" icon={<LogOut size={18} />} onClick={logout} type="text" />
            </Tooltip>
            <Avatar className="app-shell__avatar">陈</Avatar>
          </div>
        </Header>
        <Content className="app-shell__content">
          <Outlet />
        </Content>
        <Drawer
          title={docDrawerTitle}
          open={docDrawerOpen}
          width="min(1180px, 92vw)"
          className="app-shell-doc-drawer"
          footer={
            <Space>
              <Button icon={<Copy size={14} />} onClick={copyCurrentDocument}>
                复制当前文档
              </Button>
              {currentDocumentPaths.length > 1 ? (
                <Button icon={<Copy size={14} />} onClick={copyAllDocuments}>
                  复制全部文档
                </Button>
              ) : null}
              <Button onClick={() => setDocDrawerOpen(false)}>关闭</Button>
            </Space>
          }
          onClose={() => setDocDrawerOpen(false)}
        >
          {currentDocumentPaths.length ? (
            <Tabs
              activeKey={selectedDocumentPath}
              className="app-shell-doc-tabs"
              items={currentDocumentPaths.map((documentPath) => ({
                key: documentPath,
                label: getDocumentLabel(documentPath),
                children: (
                  <MarkdownReader
                    content={getDocumentContent(documentPath)}
                    documentPath={documentPath}
                    searchText={documentSearchText}
                    selectedSearchIndex={activeDocumentSearchIndex}
                  />
                ),
              }))}
              onChange={setActiveDocumentPath}
            />
          ) : null}
        </Drawer>
      </Layout>
    </Layout>
  );
}
