/**
 * Mermaid diagrams in the right Sidebar.
 *
 * This plugin owns one right-Sidebar page type and nothing else. The type
 * reaches the Sidebar through its public path: the definition into
 * `ctx.sidebarRightTabs`, the body into the keyed `sidebar.right.pane.tab`
 * seat under the definition's `id`, and a guide capsule so the empty Sidebar
 * offers the page as a door.
 *
 * The page reads the conversation it is showing without touching it: it scans
 * the rendered Markdown code cards for sources that start with a Mermaid
 * keyword, and renders them as diagrams inside its own React tree. The chat's
 * code block stays exactly as authored, so copying the source, quoting it, or
 * letting the model read it back still works; a change to the chat's DOM costs
 * this page its input, never the transcript.
 *
 * The engine is a separate loader chunk requested on first diagram, so a page
 * opened on a transcript without diagrams never downloads it.
 */
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

const TAB_ID = 'dsh-mermaid/mermaid'
const TAB_KIND = 'mermaid'
const NS = 'mermaid'

const DARK_ATTRIBUTE = 'data-ds-dark-theme'
const STYLE_ID = 'dsh-mermaid-style'
const SCROLL_SELECTOR = '[data-conversation-scroll]'
const CARD_SELECTOR = '.md-code-block'
const CONTENT_SELECTOR = '[data-code-block-content]'
const OWNER_SELECTOR = '[data-chat-node-key]'

/** Scan debounce: long enough to fold one streaming frame into a single pass. */
const SCAN_DELAY = 240

const en = {
  title: 'Mermaid',
  description: 'Diagrams from this conversation',
  idle: 'This conversation has no Mermaid diagrams',
  absent: 'Open a conversation to see its diagrams',
  failed: 'This diagram could not be rendered',
  source: 'Source',
  diagram: 'Diagram',
  copy: 'Copy',
  copied: 'Copied',
  count: '{count} diagrams',
  zoom: 'Enlarge',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  fit: 'Fit',
  close: 'Close',
}

const zh = {
  title: 'Mermaid',
  description: '本对话中的图表',
  idle: '这个对话里还没有 Mermaid 图表',
  absent: '打开一个对话以查看其中的图表',
  failed: '此图表无法渲染',
  source: '源码',
  diagram: '图表',
  copy: '复制',
  copied: '复制成功',
  count: '{count} 个图表',
  zoom: '放大',
  zoomIn: '放大',
  zoomOut: '缩小',
  fit: '适应',
  close: '关闭',
}

const CSS = `
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
  overscroll-behavior: contain;
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
  /* Cards are flex items of a scrolling column: without this they shrink to
     share the pane's height, clipping each diagram and leaving the pane with
     nothing to scroll. */
  flex: none;
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
/* The card shows the diagram fitted and whole; zooming and panning belong to
   the full-screen viewer, one click away. */
.dsh-mermaid-static {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  border-radius: var(--dsw-radius-sm);
  background: none;
  color: inherit;
  cursor: zoom-in;
  text-align: left;
}
.dsh-mermaid-static svg { display: block; max-width: 100%; height: auto; }
.dsh-mermaid-static text { user-select: none; -webkit-user-select: none; }
.dsh-mermaid-static:focus-visible {
  outline: 1px solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: 2px;
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
`

/** Diagram-start keywords whose first line is unambiguous on its own. */
const LOOSE_START = /^(?:sequenceDiagram|classDiagram(?:-v2)?|stateDiagram(?:-v2)?|erDiagram|journey|gantt|pie|quadrantChart|requirementDiagram|gitGraph|C4Context|C4Container|C4Component|C4Dynamic|C4Deployment|mindmap|timeline|xychart-beta|block-beta|packet-beta|kanban|architecture-beta|sankey-beta|radar-beta|treemap-beta|zenuml)\b/

/**
 * Flow directions are the part of `graph`/`flowchart` that makes the keyword a
 * diagram and not a variable name, so they are required.
 */
const FLOW_START = /^(?:graph|flowchart)\s+(?:TB|TD|BT|RL|LR)\b/

/**
 * The first line that carries the diagram declaration, skipping blank lines,
 * `%%` comments, and a leading YAML front-matter block.
 * @param source - the code block's text.
 * @returns the declaration line, or an empty string when there is none.
 */
function declarationLine(source) {
  const lines = source.split('\n')
  let index = 0
  if (lines[0]?.trim() === '---') {
    const close = lines.findIndex((line, at) => at > 0 && line.trim() === '---')
    if (close > 0) index = close + 1
  }
  for (; index < lines.length; index++) {
    const line = lines[index].trim()
    if (line === '' || line.startsWith('%%')) continue
    return line
  }
  return ''
}

/**
 * Whether an untagged code block is worth handing to the engine. The chat's
 * code card carries no language attribute for unknown languages, so the
 * declaration line is the only signal available; the engine's own parser is
 * the final word when the render is attempted.
 * @param source - the code block's text.
 * @returns whether the source looks like a Mermaid diagram.
 */
function isDiagramSource(source) {
  const line = declarationLine(source)
  return line !== '' && (FLOW_START.test(line) || LOOSE_START.test(line))
}

/**
 * Read the Mermaid sources out of the rendered conversation.
 * @returns the sources in document order, and whether a conversation is mounted.
 */
function collectSources() {
  const scroll = document.querySelector(SCROLL_SELECTOR)
  if (scroll === null) return { blocks: [], mounted: false }
  const blocks = []
  for (const card of scroll.querySelectorAll(CARD_SELECTOR)) {
    const source = card.querySelector(CONTENT_SELECTOR)?.querySelector('pre')?.textContent ?? ''
    if (!isDiagramSource(source)) continue
    const owner = card.closest(OWNER_SELECTOR)?.getAttribute('data-chat-node-key') ?? String(blocks.length)
    blocks.push({ key: `${owner}#${blocks.length}`, source })
  }
  return { blocks, mounted: true }
}

/** Stable signature of a scan, so a no-op mutation does not re-render the page. */
function signatureOf({ blocks, mounted }) {
  return `${mounted ? 1 : 0}|${blocks.map(block => `${block.key}:${block.source.length}`).join(',')}`
}

/**
 * Keep the page's sources in step with the conversation while it is on screen.
 *
 * The observer watches the document rather than the scroll container it finds
 * first: the conversation unmounts when another view takes the frame and comes
 * back as a new element, and a page that kept the old node would stop updating.
 * A scan re-resolves the container each time, and the debounce folds a
 * streaming frame into one pass.
 * @param active - whether this page is currently visible; an inactive page neither scans nor observes.
 * @returns the current sources and whether a conversation is mounted.
 */
function useDiagramSources(active) {
  const [state, setState] = useState({ blocks: [], mounted: false })
  useEffect(() => {
    if (!active) return undefined
    let timer = 0
    let signature = ''
    const scan = () => {
      const next = collectSources()
      const nextSignature = signatureOf(next)
      if (nextSignature === signature) return
      signature = nextSignature
      setState(next)
    }
    const observer = new MutationObserver(() => {
      window.clearTimeout(timer)
      timer = window.setTimeout(scan, SCAN_DELAY)
    })
    observer.observe(document.body, { childList: true, characterData: true, subtree: true })
    scan()
    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
    }
  }, [active])
  return state
}

function subscribeDark(onChange) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.body, { attributes: true, attributeFilter: [DARK_ATTRIBUTE] })
  return () => { observer.disconnect() }
}

function isDark() {
  return document.body.hasAttribute(DARK_ATTRIBUTE)
}

let renderSequence = 0

/**
 * Render one diagram under the active palette. The strict security level is
 * the documented setting for source the model produced: mermaid sanitizes its
 * own output and refuses interactive handlers.
 * @param mermaid - the engine module.
 * @param source - the diagram's text.
 * @param dark - whether the page is in the dark palette.
 * @returns the rendered SVG markup.
 */
async function renderSvg(mermaid, source, dark) {
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    suppressErrorRendering: true,
    theme: dark ? 'dark' : 'default',
    fontFamily: getComputedStyle(document.body).fontFamily,
  })
  renderSequence += 1
  const { svg } = await mermaid.render(`dsh-mermaid-${renderSequence}`, source)
  return svg
}

function copyText(text) {
  const clipboard = navigator.clipboard
  if (clipboard !== undefined && typeof clipboard.writeText === 'function') {
    return clipboard.writeText(text).then(() => true, () => legacyCopy(text))
  }
  return Promise.resolve(legacyCopy(text))
}

/** Clipboard fallback for a document the Clipboard API does not serve. */
function legacyCopy(text) {
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.append(area)
  area.select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    // The document refused the copy command; the button reports nothing copied.
    ok = false
  }
  area.remove()
  return ok
}

const MIN_SCALE = 0.2
const MAX_SCALE = 12
const VIEWER_PAD = 32
const VIEWER_TOP = 52
const VIEWER_BOTTOM = 24

/**
 * Multiplicative zoom that keeps one screen point fixed. The transform is
 * `translate(x, y) scale(k)` on a top-left origin, so the content point under
 * (x, y) keeps its place exactly when the offset is scaled by the same ratio.
 * @param view - the current scale and offset.
 * @param factor - the multiplier to apply.
 * @param x - the fixed point's horizontal position in the viewport.
 * @param y - the fixed point's vertical position in the viewport.
 * @param min - the smallest allowed scale.
 * @param max - the largest allowed scale.
 * @returns the next view, or the current one when the scale is already at a limit.
 */
function zoomAround(view, factor, x, y, min, max) {
  const scale = Math.min(max, Math.max(min, view.scale * factor))
  if (scale === view.scale) return view
  const ratio = scale / view.scale
  return { scale, x: x - (x - view.x) * ratio, y: y - (y - view.y) * ratio }
}

/**
 * Wheel zoom over one element. The listener is registered by hand because
 * React attaches wheel handlers as passive, where `preventDefault` does
 * nothing and the page would scroll behind the zoom.
 * @param ref - the element that receives the wheel.
 * @param onZoom - called with a scale factor and the pointer's position in the element.
 */
function useWheelZoom(ref, onZoom) {
  useEffect(() => {
    const element = ref.current
    if (element === null) return undefined
    const onWheel = (event) => {
      event.preventDefault()
      const box = element.getBoundingClientRect()
      // Trackpads and mice differ by two orders of magnitude in deltaY; the
      // exponential keeps one notch of either a similar change in scale.
      const factor = Math.exp(-event.deltaY * 0.0016)
      onZoom(Math.min(2, Math.max(0.5, factor)), event.clientX - box.left, event.clientY - box.top)
    }
    element.addEventListener('wheel', onWheel, { passive: false })
    return () => { element.removeEventListener('wheel', onWheel) }
  }, [ref, onZoom])
}

/**
 * Drag-to-pan over one element. Canceling the pointer press suppresses the
 * compatibility mouse events that anchor a text selection, so a drag never
 * selects the labels it passes over.
 * @param onPan - called with the pointer's movement since the last event.
 * @returns whether a drag is in progress, and the handlers that drive it.
 */
function useDragPan(onPan) {
  const drag = useRef(null)
  const [dragging, setDragging] = useState(false)
  return {
    dragging,
    handlers: {
      onPointerDown(event) {
        if (event.button !== 0) return
        event.preventDefault()
        event.currentTarget.setPointerCapture?.(event.pointerId)
        drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
        setDragging(true)
      },
      onPointerMove(event) {
        const state = drag.current
        if (state === null || state.id !== event.pointerId) return
        const dx = event.clientX - state.x
        const dy = event.clientY - state.y
        state.x = event.clientX
        state.y = event.clientY
        onPan(dx, dy)
      },
      onPointerUp(event) {
        if (drag.current?.id !== event.pointerId) return
        drag.current = null
        setDragging(false)
      },
    },
  }
}

/**
 * The size the diagram draws itself at. Mermaid writes a viewBox on every
 * diagram, so it is the authority; the measured box is the fallback for markup
 * without one.
 * @param svg - the rendered diagram element.
 * @returns its natural width and height in CSS pixels.
 */
function naturalSize(svg) {
  const box = svg.viewBox?.baseVal
  if (box !== undefined && box.width > 0 && box.height > 0) return { width: box.width, height: box.height }
  const rect = svg.getBoundingClientRect()
  return { width: rect.width > 0 ? rect.width : 640, height: rect.height > 0 ? rect.height : 480 }
}

/**
 * Full-screen view of one diagram: wheel or buttons to zoom around the pointer,
 * drag to pan, and the keyboard's own ways out. The stage is a portal on
 * `document.body` so the pane's scroll container cannot clip it, and the
 * transform is applied to a wrapper whose origin is the diagram's top-left
 * corner, which keeps pointer-anchored zoom to one multiplication.
 * @param props - the rendered SVG markup, localized copy, and the close handler.
 * @returns the overlay.
 */
function DiagramViewer({ svg, t, onClose }) {
  const rootRef = useRef(null)
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const closeRef = useRef(null)
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 })

  const fit = useCallback(() => {
    const stage = stageRef.current
    const canvas = canvasRef.current
    if (stage === null || canvas === null) return
    const inner = canvas.querySelector('svg')
    if (inner === null) return
    const size = naturalSize(inner)
    inner.setAttribute('width', String(size.width))
    inner.setAttribute('height', String(size.height))
    const box = stage.getBoundingClientRect()
    const width = Math.max(80, box.width - VIEWER_PAD * 2)
    const height = Math.max(80, box.height - VIEWER_TOP - VIEWER_BOTTOM)
    const scale = Math.max(MIN_SCALE, Math.min(1, width / size.width, height / size.height))
    setView({
      scale,
      x: (box.width - size.width * scale) / 2,
      y: VIEWER_TOP + (height - size.height * scale) / 2,
    })
  }, [])

  const zoomAt = useCallback((factor, x, y) => {
    setView(current => zoomAround(current, factor, x, y, MIN_SCALE, MAX_SCALE))
  }, [])

  const zoomFromCenter = useCallback((factor) => {
    const stage = stageRef.current
    if (stage === null) return
    const box = stage.getBoundingClientRect()
    zoomAt(factor, box.width / 2, box.height / 2)
  }, [zoomAt])

  useEffect(() => { fit() }, [fit])

  useWheelZoom(rootRef, zoomAt)

  const { dragging, handlers } = useDragPan((dx, dy) => {
    setView(current => ({ scale: current.scale, x: current.x + dx, y: current.y + dy }))
  })

  useEffect(() => {
    const previous = document.activeElement
    closeRef.current?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        zoomFromCenter(1.25)
        return
      }
      if (event.key === '-' || event.key === '_') {
        event.preventDefault()
        zoomFromCenter(0.8)
        return
      }
      if (event.key === '0') {
        event.preventDefault()
        fit()
        return
      }
      if (event.key !== 'Tab') return
      const buttons = rootRef.current?.querySelectorAll('button')
      if (buttons === undefined || buttons.length === 0) return
      const edge = event.shiftKey ? buttons[0] : buttons[buttons.length - 1]
      if (document.activeElement !== edge) return
      event.preventDefault()
      ;(event.shiftKey ? buttons[buttons.length - 1] : buttons[0]).focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previous?.focus?.()
    }
  }, [fit, onClose, zoomFromCenter])

  return createPortal(
    <div className="dsh-mermaid-viewer" ref={rootRef} role="dialog" aria-modal="true" aria-label={t('diagram')} data-mermaid-viewer="">
      <div className="dsh-mermaid-viewer-bar">
        <span className="dsh-mermaid-viewer-pct">{Math.round(view.scale * 100)}%</span>
        <div className="dsh-mermaid-viewer-actions">
          <button type="button" className="dsh-mermaid-button" title={t('zoomOut')} aria-label={t('zoomOut')} onClick={() => { zoomFromCenter(0.8) }}>−</button>
          <button type="button" className="dsh-mermaid-button" title={t('zoomIn')} aria-label={t('zoomIn')} onClick={() => { zoomFromCenter(1.25) }}>+</button>
          <button type="button" className="dsh-mermaid-button" onClick={fit}>{t('fit')}</button>
          <button type="button" className="dsh-mermaid-button" ref={closeRef} onClick={onClose}>{t('close')}</button>
        </div>
      </div>
      <div
        className="dsh-mermaid-viewer-stage"
        ref={stageRef}
        data-dragging={dragging ? '' : undefined}
        {...handlers}
        onPointerCancel={handlers.onPointerUp}
      >
        <div
          className="dsh-mermaid-viewer-canvas"
          ref={canvasRef}
          style={{ transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})` }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>,
    document.body,
  )
}

/**
 * The card's view of one diagram: fitted to the card, whole and static. Zoom
 * and pan live in the full-screen viewer instead — a preview that swallowed
 * the wheel fought the page it sits in, and a fitted diagram has nothing to
 * pan to until the reader asks for more room.
 * @param props - the rendered SVG markup, localized copy, and the open handler.
 * @returns the diagram, as a button that enlarges it.
 */
function DiagramPreview({ svg, t, onOpen }) {
  return (
    <button
      type="button"
      className="dsh-mermaid-static"
      title={t('zoom')}
      aria-label={t('zoom')}
      onClick={onOpen}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

/**
 * One diagram card: the rendered SVG, its authored source on demand, and copy.
 * A source that fails to parse keeps the last diagram on screen only while it
 * is a strict prefix of the new source, which is what streaming looks like;
 * any other failure shows the notice and the source instead.
 * @param props - the source, localized copy, and the lazy engine loader.
 * @returns the card.
 */
function DiagramCard({ source, loadMermaid, t }) {
  const dark = useSyncExternalStore(subscribeDark, isDark, isDark)
  const [drawn, setDrawn] = useState(undefined)
  const [failed, setFailed] = useState(false)
  const [showSource, setShowSource] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const mermaid = await loadMermaid()
        const svg = await renderSvg(mermaid, source, dark)
        if (cancelled) return
        setDrawn({ svg, source })
        setFailed(false)
      } catch {
        // A cancelled effect never reports; a streaming extension keeps the
        // diagram it grew from, and anything else drops it for the notice.
        if (cancelled) return
        setDrawn(previous => (previous !== undefined && source.startsWith(previous.source) ? previous : undefined))
        setFailed(true)
      }
    })()
    return () => { cancelled = true }
  }, [dark, source, loadMermaid])

  const onCopy = useCallback(() => {
    void copyText(source).then((ok) => {
      if (!ok) return
      setCopied(true)
      window.setTimeout(() => { setCopied(false) }, 1000)
    })
  }, [source])

  const text = source.endsWith('\n') ? source.slice(0, -1) : source
  const showDiagram = drawn !== undefined && !showSource
  return (
    <div className="dsh-mermaid-card" data-mermaid-card="">
      <div className="dsh-mermaid-card-head">
        <span className="dsh-mermaid-label">{t('title')}</span>
        <div className="dsh-mermaid-actions">
          {drawn !== undefined && (
            <button type="button" className="dsh-mermaid-button" onClick={() => { setExpanded(true) }}>{t('zoom')}</button>
          )}
          {drawn !== undefined && (
            <button type="button" className="dsh-mermaid-button" onClick={() => { setShowSource(value => !value) }}>
              {showSource ? t('diagram') : t('source')}
            </button>
          )}
          <button type="button" className="dsh-mermaid-button" onClick={onCopy}>
            {copied ? t('copied') : t('copy')}
          </button>
        </div>
      </div>
      <div className="dsh-mermaid-body">
        {showDiagram
          ? <DiagramPreview svg={drawn.svg} t={t} onOpen={() => { setExpanded(true) }} />
          : (
            <>
              {failed && <p className="dsh-mermaid-note">{t('failed')}</p>}
              <pre className="dsh-mermaid-source"><code>{text}</code></pre>
            </>
          )}
      </div>
      {expanded && showDiagram && <DiagramViewer svg={drawn.svg} t={t} onClose={() => { setExpanded(false) }} />}
    </div>
  )
}

/**
 * The page body: every diagram in the conversation it is showing.
 * @param props - the tab information hook, localized copy, and the engine loader.
 * @returns the diagram list, or the page's empty state.
 */
function MermaidPane({ t, useTabInfo, loadMermaid }) {
  const info = useTabInfo()
  const { blocks, mounted } = useDiagramSources(info.tab.visible)
  return (
    <div className="dsh-mermaid-pane" data-mermaid-pane="">
      {blocks.length === 0
        ? <p className="dsh-mermaid-empty" data-mermaid-empty={mounted ? 'idle' : 'absent'}>{mounted ? t('idle') : t('absent')}</p>
        : (
          <>
            {blocks.length > 1 && <div className="dsh-mermaid-count">{t('count', { count: blocks.length })}</div>}
            {blocks.map(block => <DiagramCard key={block.key} source={block.source} loadMermaid={loadMermaid} t={t} />)}
          </>
        )}
    </div>
  )
}

/**
 * The plugin's mark: one node above two, joined in a flow. It draws on the
 * 36-unit grid the plugin artwork uses and carries its own gradients, so the
 * guide capsule and the plugin list frame it rather than the drawing framing
 * itself. Gradient ids are per-instance because the mark repeats across rows.
 * @param props - the drawn size and an optional class from the framing surface.
 */
function MermaidGlyph({ size = 36, className }) {
  const id = useId().replace(/[^A-Za-z0-9]/g, '')
  const top = `dsh-mermaid-${id}-top`
  const bottom = `dsh-mermaid-${id}-bottom`
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={top} x1="18" y1="6.5" x2="18" y2="13.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#69B9FF" />
          <stop offset="1" stopColor="#324DE2" />
        </linearGradient>
        <linearGradient id={bottom} x1="18" y1="22.5" x2="18" y2="29.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C9BCFF" />
          <stop offset="1" stopColor="#7A5CF2" />
        </linearGradient>
      </defs>
      {/* Edges first: the nodes cover where a line meets their fill. */}
      <path d="M18 13.5V18M18 18H11V22.5M18 18H25V22.5"
        stroke="#658EFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="13" y="6.5" width="10" height="7" rx="2.4" fill={`url(#${top})`} fillOpacity="0.9" />
      <rect x="6" y="22.5" width="10" height="7" rx="2.4" fill={`url(#${bottom})`} fillOpacity="0.85" />
      <rect x="20" y="22.5" width="10" height="7" rx="2.4" fill={`url(#${bottom})`} fillOpacity="0.85" />
    </svg>
  )
}

function installStyles() {
  if (document.getElementById(STYLE_ID) !== null) return () => {}
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = CSS
  document.head.append(style)
  return () => { style.remove() }
}

/** Services this page uses; the Sidebar package owns the tab registry. */
export const inject = ['slots', 'locale', 'sidebarRightTabs']

/**
 * Register the Mermaid page type, its body, and its guide capsule.
 * @param ctx - the client plugin context.
 * @param require - the module-loader require, used for the lazy engine chunk.
 */
export function apply(ctx, require) {
  const t = ctx.locale.bind(NS)
  let engine
  const loadMermaid = () => {
    engine ??= require.async('./client.mermaid.js')
      .then(module => module.default)
      .catch((error) => {
        // A rejected promise must not poison later attempts.
        engine = undefined
        throw error
      })
    return engine
  }
  ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'dsh-mermaid: dictionaries')
  ctx.effect(installStyles, 'dsh-mermaid: styles')
  ctx.effect(() => ctx.sidebarRightTabs.register({
    id: TAB_ID,
    kind: TAB_KIND,
    priority: 'extension',
    title: () => t('title'),
    guide: [{ id: 'mermaid', order: 20, title: () => t('title'), description: () => t('description'), icon: MermaidGlyph }],
  }), 'dsh-mermaid: page type')
  ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({
    name: 'sidebar.right.pane.tab',
    key: TAB_ID,
    locale: NS,
    inject: () => ({ loadMermaid }),
  }, MermaidPane)), 'dsh-mermaid: page body')
}
