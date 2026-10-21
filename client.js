window.__ModuleLoader__.load({
  id: "dsh-mermaid",
  factory(require) {
    const module = { exports: {} };
    (function (module, exports, require) {
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.jsx
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);
var import_react = require("react");
var import_react_dom = require("react-dom");
var import_jsx_runtime = require("react/jsx-runtime");
var TAB_ID = "dsh-mermaid/mermaid";
var TAB_KIND = "mermaid";
var NS = "mermaid";
var DARK_ATTRIBUTE = "data-ds-dark-theme";
var STYLE_ID = "dsh-mermaid-style";
var SCROLL_SELECTOR = "[data-conversation-scroll]";
var CARD_SELECTOR = ".md-code-block";
var CONTENT_SELECTOR = "[data-code-block-content]";
var OWNER_SELECTOR = "[data-chat-node-key]";
var SCAN_DELAY = 240;
var en = {
  title: "Mermaid",
  description: "Diagrams from this conversation",
  idle: "This conversation has no Mermaid diagrams",
  absent: "Open a conversation to see its diagrams",
  failed: "This diagram could not be rendered",
  source: "Source",
  diagram: "Diagram",
  copy: "Copy",
  copied: "Copied",
  count: "{count} diagrams",
  zoom: "Enlarge",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  fit: "Fit",
  close: "Close"
};
var zh = {
  title: "Mermaid",
  description: "\u672C\u5BF9\u8BDD\u4E2D\u7684\u56FE\u8868",
  idle: "\u8FD9\u4E2A\u5BF9\u8BDD\u91CC\u8FD8\u6CA1\u6709 Mermaid \u56FE\u8868",
  absent: "\u6253\u5F00\u4E00\u4E2A\u5BF9\u8BDD\u4EE5\u67E5\u770B\u5176\u4E2D\u7684\u56FE\u8868",
  failed: "\u6B64\u56FE\u8868\u65E0\u6CD5\u6E32\u67D3",
  source: "\u6E90\u7801",
  diagram: "\u56FE\u8868",
  copy: "\u590D\u5236",
  copied: "\u590D\u5236\u6210\u529F",
  count: "{count} \u4E2A\u56FE\u8868",
  zoom: "\u653E\u5927",
  zoomIn: "\u653E\u5927",
  zoomOut: "\u7F29\u5C0F",
  fit: "\u9002\u5E94",
  close: "\u5173\u95ED"
};
var CSS = `
.dsh-mermaid-pane {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 12px 14px 20px;
  overflow: auto;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-base);
  font: var(--dsw-font-markdown-base);
}
.dsh-mermaid-count {
  padding: 0 2px;
  color: var(--dsw-alias-label-tertiary);
  font: 11px/18px var(--dsw-font-family);
}
.dsh-mermaid-empty {
  margin: 24px 6px;
  color: var(--dsw-alias-label-tertiary);
  font: 12px/20px var(--dsw-font-family);
  text-align: center;
}
.dsh-mermaid-card {
  border-radius: var(--dsw-radius-lg);
  background: var(--dsw-alias-markdown-code-block);
  overflow: hidden;
}
.dsh-mermaid-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 32px;
  padding: 0 6px 0 12px;
}
.dsh-mermaid-label {
  min-width: 0;
  overflow: hidden;
  color: var(--dsw-alias-label-tertiary);
  font: 11px/18px var(--ds-font-family-code);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsh-mermaid-actions { display: flex; align-items: center; gap: 2px; flex: none; }
.dsh-mermaid-button {
  height: 24px;
  padding: 0 8px;
  border: 0;
  border-radius: var(--dsw-radius-sm);
  color: var(--dsw-alias-label-secondary);
  background: transparent;
  font: 11px/18px var(--dsw-font-family);
  cursor: pointer;
}
.dsh-mermaid-button:hover { background: var(--dsw-alias-interactive-bg-hover); }
.dsh-mermaid-button:focus-visible {
  outline: 1px solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: 1px;
}
.dsh-mermaid-body { padding: 2px 12px 14px; }
.dsh-mermaid-viewport {
  position: relative;
  overflow: hidden;
  border-radius: var(--dsw-radius-sm);
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
.dsh-mermaid-viewport[data-zoomed] { cursor: grab; }
.dsh-mermaid-viewport[data-dragging] { cursor: grabbing; }
.dsh-mermaid-canvas { transform-origin: 0 0; will-change: transform; }
.dsh-mermaid-canvas svg { display: block; max-width: 100%; height: auto; }
.dsh-mermaid-canvas text { user-select: none; -webkit-user-select: none; }
.dsh-mermaid-zoom {
  position: absolute;
  right: 6px;
  bottom: 6px;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  border-radius: var(--dsw-radius-sm);
  background: var(--dsw-alias-bg-base);
  box-shadow: var(--dsw-shadow-lv1);
  opacity: 0;
  transition: opacity 0.12s ease;
}
.dsh-mermaid-viewport:hover .dsh-mermaid-zoom,
.dsh-mermaid-viewport:focus-within .dsh-mermaid-zoom,
.dsh-mermaid-viewport[data-zoomed] .dsh-mermaid-zoom { opacity: 1; }
.dsh-mermaid-zoom-pct {
  min-width: 34px;
  color: var(--dsw-alias-label-tertiary);
  font: 11px/18px var(--dsw-font-family);
  font-variant-numeric: tabular-nums;
  text-align: center;
}
.dsh-mermaid-note {
  margin: 0 0 10px;
  color: var(--dsw-alias-label-tertiary);
  font: 11px/18px var(--dsw-font-family);
}
.dsh-mermaid-card pre.dsh-mermaid-source {
  margin: 0;
  color: var(--dsw-alias-label-primary);
  background: none;
  font: var(--dsw-font-markdown-code-block);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.dsh-mermaid-card pre.dsh-mermaid-source code {
  padding: 0;
  background: none;
  font: inherit;
}
.dsh-mermaid-viewer {
  position: fixed;
  z-index: 1100;
  inset: 0;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-base);
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 92%, transparent);
}
.dsh-mermaid-viewer-bar {
  position: absolute;
  z-index: 1;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  color: var(--dsw-alias-label-secondary);
  font: 11px/18px var(--dsw-font-family);
}
.dsh-mermaid-viewer-pct { font-variant-numeric: tabular-nums; }
.dsh-mermaid-viewer-actions { display: flex; align-items: center; gap: 2px; }
.dsh-mermaid-viewer .dsh-mermaid-button { height: 28px; padding: 0 10px; font-size: 12px; }
.dsh-mermaid-viewer-stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
  cursor: grab;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
.dsh-mermaid-viewer-stage[data-dragging] { cursor: grabbing; }
.dsh-mermaid-viewer-canvas { position: absolute; top: 0; left: 0; transform-origin: 0 0; will-change: transform; }
.dsh-mermaid-viewer-canvas svg { display: block; max-width: none !important; height: auto; }
.dsh-mermaid-viewer-canvas text { user-select: none; -webkit-user-select: none; }
`;
var LOOSE_START = /^(?:sequenceDiagram|classDiagram(?:-v2)?|stateDiagram(?:-v2)?|erDiagram|journey|gantt|pie|quadrantChart|requirementDiagram|gitGraph|C4Context|C4Container|C4Component|C4Dynamic|C4Deployment|mindmap|timeline|xychart-beta|block-beta|packet-beta|kanban|architecture-beta|sankey-beta|radar-beta|treemap-beta|zenuml)\b/;
var FLOW_START = /^(?:graph|flowchart)\s+(?:TB|TD|BT|RL|LR)\b/;
function declarationLine(source) {
  const lines = source.split("\n");
  let index = 0;
  if (lines[0]?.trim() === "---") {
    const close = lines.findIndex((line, at) => at > 0 && line.trim() === "---");
    if (close > 0) index = close + 1;
  }
  for (; index < lines.length; index++) {
    const line = lines[index].trim();
    if (line === "" || line.startsWith("%%")) continue;
    return line;
  }
  return "";
}
function isDiagramSource(source) {
  const line = declarationLine(source);
  return line !== "" && (FLOW_START.test(line) || LOOSE_START.test(line));
}
function collectSources() {
  const scroll = document.querySelector(SCROLL_SELECTOR);
  if (scroll === null) return { blocks: [], mounted: false };
  const blocks = [];
  for (const card of scroll.querySelectorAll(CARD_SELECTOR)) {
    const source = card.querySelector(CONTENT_SELECTOR)?.querySelector("pre")?.textContent ?? "";
    if (!isDiagramSource(source)) continue;
    const owner = card.closest(OWNER_SELECTOR)?.getAttribute("data-chat-node-key") ?? String(blocks.length);
    blocks.push({ key: `${owner}#${blocks.length}`, source });
  }
  return { blocks, mounted: true };
}
function signatureOf({ blocks, mounted }) {
  return `${mounted ? 1 : 0}|${blocks.map((block) => `${block.key}:${block.source.length}`).join(",")}`;
}
function useDiagramSources(active) {
  const [state, setState] = (0, import_react.useState)({ blocks: [], mounted: false });
  (0, import_react.useEffect)(() => {
    if (!active) return void 0;
    let timer = 0;
    let signature = "";
    const scan = () => {
      const next = collectSources();
      const nextSignature = signatureOf(next);
      if (nextSignature === signature) return;
      signature = nextSignature;
      setState(next);
    };
    const observer = new MutationObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(scan, SCAN_DELAY);
    });
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    scan();
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [active]);
  return state;
}
function subscribeDark(onChange) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.body, { attributes: true, attributeFilter: [DARK_ATTRIBUTE] });
  return () => {
    observer.disconnect();
  };
}
function isDark() {
  return document.body.hasAttribute(DARK_ATTRIBUTE);
}
var renderSequence = 0;
async function renderSvg(mermaid, source, dark) {
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    suppressErrorRendering: true,
    theme: dark ? "dark" : "default",
    fontFamily: getComputedStyle(document.body).fontFamily
  });
  renderSequence += 1;
  const { svg } = await mermaid.render(`dsh-mermaid-${renderSequence}`, source);
  return svg;
}
function copyText(text) {
  const clipboard = navigator.clipboard;
  if (clipboard !== void 0 && typeof clipboard.writeText === "function") {
    return clipboard.writeText(text).then(() => true, () => legacyCopy(text));
  }
  return Promise.resolve(legacyCopy(text));
}
function legacyCopy(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.append(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}
var MIN_SCALE = 0.2;
var MAX_SCALE = 12;
var VIEWER_PAD = 32;
var VIEWER_TOP = 52;
var VIEWER_BOTTOM = 24;
function zoomAround(view, factor, x, y, min, max) {
  const scale = Math.min(max, Math.max(min, view.scale * factor));
  if (scale === view.scale) return view;
  const ratio = scale / view.scale;
  return { scale, x: x - (x - view.x) * ratio, y: y - (y - view.y) * ratio };
}
function clampToContent(view, width, height) {
  if (width <= 0 || height <= 0) return view;
  const maxX = Math.max(0, width * (view.scale - 1));
  const maxY = Math.max(0, height * (view.scale - 1));
  return { scale: view.scale, x: Math.min(0, Math.max(-maxX, view.x)), y: Math.min(0, Math.max(-maxY, view.y)) };
}
function useWheelZoom(ref, onZoom) {
  (0, import_react.useEffect)(() => {
    const element = ref.current;
    if (element === null) return void 0;
    const onWheel = (event) => {
      event.preventDefault();
      const box = element.getBoundingClientRect();
      const factor = Math.exp(-event.deltaY * 16e-4);
      onZoom(Math.min(2, Math.max(0.5, factor)), event.clientX - box.left, event.clientY - box.top);
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", onWheel);
    };
  }, [ref, onZoom]);
}
function useDragPan(onPan) {
  const drag = (0, import_react.useRef)(null);
  const [dragging, setDragging] = (0, import_react.useState)(false);
  return {
    dragging,
    handlers: {
      onPointerDown(event) {
        if (event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
        setDragging(true);
      },
      onPointerMove(event) {
        const state = drag.current;
        if (state === null || state.id !== event.pointerId) return;
        const dx = event.clientX - state.x;
        const dy = event.clientY - state.y;
        state.x = event.clientX;
        state.y = event.clientY;
        onPan(dx, dy);
      },
      onPointerUp(event) {
        if (drag.current?.id !== event.pointerId) return;
        drag.current = null;
        setDragging(false);
      }
    }
  };
}
function naturalSize(svg) {
  const box = svg.viewBox?.baseVal;
  if (box !== void 0 && box.width > 0 && box.height > 0) return { width: box.width, height: box.height };
  const rect = svg.getBoundingClientRect();
  return { width: rect.width > 0 ? rect.width : 640, height: rect.height > 0 ? rect.height : 480 };
}
function DiagramViewer({ svg, t, onClose }) {
  const rootRef = (0, import_react.useRef)(null);
  const stageRef = (0, import_react.useRef)(null);
  const canvasRef = (0, import_react.useRef)(null);
  const closeRef = (0, import_react.useRef)(null);
  const [view, setView] = (0, import_react.useState)({ scale: 1, x: 0, y: 0 });
  const fit = (0, import_react.useCallback)(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (stage === null || canvas === null) return;
    const inner = canvas.querySelector("svg");
    if (inner === null) return;
    const size = naturalSize(inner);
    inner.setAttribute("width", String(size.width));
    inner.setAttribute("height", String(size.height));
    const box = stage.getBoundingClientRect();
    const width = Math.max(80, box.width - VIEWER_PAD * 2);
    const height = Math.max(80, box.height - VIEWER_TOP - VIEWER_BOTTOM);
    const scale = Math.max(MIN_SCALE, Math.min(1, width / size.width, height / size.height));
    setView({
      scale,
      x: (box.width - size.width * scale) / 2,
      y: VIEWER_TOP + (height - size.height * scale) / 2
    });
  }, []);
  const zoomAt = (0, import_react.useCallback)((factor, x, y) => {
    setView((current) => zoomAround(current, factor, x, y, MIN_SCALE, MAX_SCALE));
  }, []);
  const zoomFromCenter = (0, import_react.useCallback)((factor) => {
    const stage = stageRef.current;
    if (stage === null) return;
    const box = stage.getBoundingClientRect();
    zoomAt(factor, box.width / 2, box.height / 2);
  }, [zoomAt]);
  (0, import_react.useEffect)(() => {
    fit();
  }, [fit]);
  useWheelZoom(rootRef, zoomAt);
  const { dragging, handlers } = useDragPan((dx, dy) => {
    setView((current) => ({ scale: current.scale, x: current.x + dx, y: current.y + dy }));
  });
  (0, import_react.useEffect)(() => {
    const previous = document.activeElement;
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoomFromCenter(1.25);
        return;
      }
      if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        zoomFromCenter(0.8);
        return;
      }
      if (event.key === "0") {
        event.preventDefault();
        fit();
        return;
      }
      if (event.key !== "Tab") return;
      const buttons = rootRef.current?.querySelectorAll("button");
      if (buttons === void 0 || buttons.length === 0) return;
      const edge = event.shiftKey ? buttons[0] : buttons[buttons.length - 1];
      if (document.activeElement !== edge) return;
      event.preventDefault();
      (event.shiftKey ? buttons[buttons.length - 1] : buttons[0]).focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus?.();
    };
  }, [fit, onClose, zoomFromCenter]);
  return (0, import_react_dom.createPortal)(
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-mermaid-viewer", ref: rootRef, role: "dialog", "aria-modal": "true", "aria-label": t("diagram"), "data-mermaid-viewer": "", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-mermaid-viewer-bar", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsh-mermaid-viewer-pct", children: [
          Math.round(view.scale * 100),
          "%"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-mermaid-viewer-actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsh-mermaid-button", title: t("zoomOut"), "aria-label": t("zoomOut"), onClick: () => {
            zoomFromCenter(0.8);
          }, children: "\u2212" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsh-mermaid-button", title: t("zoomIn"), "aria-label": t("zoomIn"), onClick: () => {
            zoomFromCenter(1.25);
          }, children: "+" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsh-mermaid-button", onClick: fit, children: t("fit") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsh-mermaid-button", ref: closeRef, onClick: onClose, children: t("close") })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          className: "dsh-mermaid-viewer-stage",
          ref: stageRef,
          "data-dragging": dragging ? "" : void 0,
          ...handlers,
          onPointerCancel: handlers.onPointerUp,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "div",
            {
              className: "dsh-mermaid-viewer-canvas",
              ref: canvasRef,
              style: { transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})` },
              dangerouslySetInnerHTML: { __html: svg }
            }
          )
        }
      )
    ] }),
    document.body
  );
}
var INLINE_MAX_SCALE = 8;
function DiagramPreview({ svg, t }) {
  const viewportRef = (0, import_react.useRef)(null);
  const canvasRef = (0, import_react.useRef)(null);
  const [view, setView] = (0, import_react.useState)({ scale: 1, x: 0, y: 0 });
  const measure = (0, import_react.useCallback)(() => {
    const canvas = canvasRef.current;
    return canvas === null ? { width: 0, height: 0 } : { width: canvas.offsetWidth, height: canvas.offsetHeight };
  }, []);
  const zoomAt = (0, import_react.useCallback)((factor, x, y) => {
    setView((current) => {
      const next = zoomAround(current, factor, x, y, 1, INLINE_MAX_SCALE);
      const { width, height } = measure();
      return clampToContent(next, width, height);
    });
  }, [measure]);
  const reset = (0, import_react.useCallback)(() => {
    setView({ scale: 1, x: 0, y: 0 });
  }, []);
  const zoomFromCenter = (0, import_react.useCallback)((factor) => {
    const viewport = viewportRef.current;
    if (viewport === null) return;
    zoomAt(factor, viewport.clientWidth / 2, viewport.clientHeight / 2);
  }, [zoomAt]);
  useWheelZoom(viewportRef, zoomAt);
  const { dragging, handlers } = useDragPan((dx, dy) => {
    setView((current) => {
      const { width, height } = measure();
      return clampToContent({ scale: current.scale, x: current.x + dx, y: current.y + dy }, width, height);
    });
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      className: "dsh-mermaid-viewport",
      ref: viewportRef,
      "data-zoomed": view.scale > 1 ? "" : void 0,
      "data-dragging": dragging ? "" : void 0,
      onDoubleClick: reset,
      ...handlers,
      onPointerCancel: handlers.onPointerUp,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "div",
          {
            className: "dsh-mermaid-canvas",
            ref: canvasRef,
            style: { transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})` },
            dangerouslySetInnerHTML: { __html: svg }
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-mermaid-zoom", onPointerDown: (event) => {
          event.stopPropagation();
        }, onDoubleClick: (event) => {
          event.stopPropagation();
        }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsh-mermaid-button", title: t("zoomOut"), "aria-label": t("zoomOut"), onClick: () => {
            zoomFromCenter(0.8);
          }, children: "\u2212" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsh-mermaid-zoom-pct", children: [
            Math.round(view.scale * 100),
            "%"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsh-mermaid-button", title: t("zoomIn"), "aria-label": t("zoomIn"), onClick: () => {
            zoomFromCenter(1.25);
          }, children: "+" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsh-mermaid-button", onClick: reset, children: t("fit") })
        ] })
      ]
    }
  );
}
function DiagramCard({ source, loadMermaid, t }) {
  const dark = (0, import_react.useSyncExternalStore)(subscribeDark, isDark, isDark);
  const [drawn, setDrawn] = (0, import_react.useState)(void 0);
  const [failed, setFailed] = (0, import_react.useState)(false);
  const [showSource, setShowSource] = (0, import_react.useState)(false);
  const [copied, setCopied] = (0, import_react.useState)(false);
  const [expanded, setExpanded] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    let cancelled = false;
    void (async () => {
      try {
        const mermaid = await loadMermaid();
        const svg = await renderSvg(mermaid, source, dark);
        if (cancelled) return;
        setDrawn({ svg, source });
        setFailed(false);
      } catch {
        if (cancelled) return;
        setDrawn((previous) => previous !== void 0 && source.startsWith(previous.source) ? previous : void 0);
        setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dark, source, loadMermaid]);
  const onCopy = (0, import_react.useCallback)(() => {
    void copyText(source).then((ok) => {
      if (!ok) return;
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 1e3);
    });
  }, [source]);
  const text = source.endsWith("\n") ? source.slice(0, -1) : source;
  const showDiagram = drawn !== void 0 && !showSource;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-mermaid-card", "data-mermaid-card": "", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-mermaid-card-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-mermaid-label", children: t("title") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-mermaid-actions", children: [
        drawn !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsh-mermaid-button", onClick: () => {
          setExpanded(true);
        }, children: t("zoom") }),
        drawn !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsh-mermaid-button", onClick: () => {
          setShowSource((value) => !value);
        }, children: showSource ? t("diagram") : t("source") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsh-mermaid-button", onClick: onCopy, children: copied ? t("copied") : t("copy") })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-mermaid-body", children: showDiagram ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiagramPreview, { svg: drawn.svg, t }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      failed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsh-mermaid-note", children: t("failed") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "dsh-mermaid-source", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: text }) })
    ] }) }),
    expanded && showDiagram && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiagramViewer, { svg: drawn.svg, t, onClose: () => {
      setExpanded(false);
    } })
  ] });
}
function MermaidPane({ t, useTabInfo, loadMermaid }) {
  const info = useTabInfo();
  const { blocks, mounted } = useDiagramSources(info.tab.visible);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-mermaid-pane", "data-mermaid-pane": "", children: blocks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsh-mermaid-empty", "data-mermaid-empty": mounted ? "idle" : "absent", children: mounted ? t("idle") : t("absent") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    blocks.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-mermaid-count", children: t("count", { count: blocks.length }) }),
    blocks.map((block) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiagramCard, { source: block.source, loadMermaid, t }, block.key))
  ] }) });
}
function MermaidGlyph({ size = 36, className }) {
  const id = (0, import_react.useId)().replace(/[^A-Za-z0-9]/g, "");
  const top = `dsh-mermaid-${id}-top`;
  const bottom = `dsh-mermaid-${id}-bottom`;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: size, height: size, className, viewBox: "0 0 36 36", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", { id: top, x1: "18", y1: "6.5", x2: "18", y2: "13.5", gradientUnits: "userSpaceOnUse", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { stopColor: "#69B9FF" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { offset: "1", stopColor: "#324DE2" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", { id: bottom, x1: "18", y1: "22.5", x2: "18", y2: "29.5", gradientUnits: "userSpaceOnUse", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { stopColor: "#C9BCFF" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { offset: "1", stopColor: "#7A5CF2" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "path",
      {
        d: "M18 13.5V18M18 18H11V22.5M18 18H25V22.5",
        stroke: "#658EFF",
        strokeWidth: "2.4",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "13", y: "6.5", width: "10", height: "7", rx: "2.4", fill: `url(#${top})`, fillOpacity: "0.9" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "6", y: "22.5", width: "10", height: "7", rx: "2.4", fill: `url(#${bottom})`, fillOpacity: "0.85" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "20", y: "22.5", width: "10", height: "7", rx: "2.4", fill: `url(#${bottom})`, fillOpacity: "0.85" })
  ] });
}
function installStyles() {
  if (document.getElementById(STYLE_ID) !== null) return () => {
  };
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.append(style);
  return () => {
    style.remove();
  };
}
var inject = ["slots", "locale", "sidebarRightTabs"];
function apply(ctx, require2) {
  const t = ctx.locale.bind(NS);
  let engine;
  const loadMermaid = () => {
    engine ??= require2.async("./client.mermaid.js").then((module2) => module2.default).catch((error) => {
      engine = void 0;
      throw error;
    });
    return engine;
  };
  ctx.effect(() => ctx.locale.register(NS, { en, zh }), "dsh-mermaid: dictionaries");
  ctx.effect(installStyles, "dsh-mermaid: styles");
  ctx.effect(() => ctx.sidebarRightTabs.register({
    id: TAB_ID,
    kind: TAB_KIND,
    priority: "extension",
    title: () => t("title"),
    guide: [{ id: "mermaid", order: 20, title: () => t("title"), description: () => t("description"), icon: MermaidGlyph }]
  }), "dsh-mermaid: page type");
  ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
    name: "sidebar.right.pane.tab",
    key: TAB_ID,
    locale: NS,
    inject: () => ({ loadMermaid })
  }, MermaidPane)), "dsh-mermaid: page body");
}

    })(module, module.exports, require);
    const plugin = module.exports;
    return { inject: plugin.inject, apply: (ctx) => plugin.apply(ctx, require) };
  },
});
