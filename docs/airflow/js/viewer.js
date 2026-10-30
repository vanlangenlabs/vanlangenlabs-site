'use strict';

const byId = (id) => document.getElementById(id);
const viewport = byId('viewport');
const diagram = byId('diagram');
const themeSwitch = byId('theme');
const zoomButtons = ['zoom-in', 'zoom-out', 'reset'].map(byId);
const aiCopyButtons = ['copy-ai', 'copy-ai-dialog'].map(byId);
const gettingStarted = byId('get-started-dialog');
const validName = /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/;
let navigationEntries = new Map();
let source = '';
let instructionTemplate = '';
let flowName = 'project';
let requestId = 0;
let controller;
let renderQueue = Promise.resolve();
let renderId = 0;
let width = 0;
let height = 0;
let scale = 1;
let fitScale = 1;
let offsetX = 0;
let offsetY = 0;
let drag = null;

let theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
try {
  const savedTheme = localStorage.getItem('airflow-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') theme = savedTheme;
} catch {}
document.documentElement.dataset.theme = theme;
themeSwitch.checked = theme === 'dark';

function showError(message) {
  byId('message').textContent = message;
  byId('message').hidden = false;
  byId('status').textContent = 'Unable to display';
  viewport.setAttribute('aria-busy', 'false');
}

function applyTransform() {
  diagram.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  byId('zoom-level').textContent = `${Math.round(scale / fitScale * 100)}%`;
}

function fit() {
  if (!width || !height) return;
  fitScale = Math.min((viewport.clientWidth - 48) / width, (viewport.clientHeight - 100) / height, 1.5);
  scale = fitScale;
  offsetX = (viewport.clientWidth - width * scale) / 2;
  offsetY = (viewport.clientHeight - 60 - height * scale) / 2;
  applyTransform();
}

function zoom(factor, centerX = viewport.clientWidth / 2, centerY = viewport.clientHeight / 2) {
  if (!width) return;
  const next = Math.min(fitScale * 12, Math.max(fitScale * .25, scale * factor));
  offsetX = centerX - (centerX - offsetX) * next / scale;
  offsetY = centerY - (centerY - offsetY) * next / scale;
  scale = next;
  applyTransform();
}

function ancestorPath() {
  const path = new URLSearchParams(location.search).get('path');
  if (!path) return navigationEntries.get(flowName)?.ancestors ?? [];
  const names = path.split(',');
  return names.length <= 32 && names.every((name) => validName.test(name)) && new Set(names).size === names.length && !names.includes(flowName) ? names : [];
}

function flowUrl(name, ancestors = []) {
  const url = new URL(location.href);
  url.searchParams.set('flow', name);
  url.searchParams.delete('path');
  if (ancestors.length) url.searchParams.set('path', ancestors.join(','));
  return url;
}

function updateTreeSelection() {
  byId('workflow-tree').querySelectorAll('a[data-flow]').forEach((link) => {
    const current = link.dataset.flow === flowName;
    if (current) {
      link.setAttribute('aria-current', 'page');
      let branch = link.closest('details');
      while (branch && branch.id !== 'workflow-navigation') {
        branch.open = true;
        branch = branch.parentElement.closest('details');
      }
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

async function loadNavigation() {
  try {
    const response = await fetch(new URL('index.json', location.href), { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const entries = new Map();
    function buildTree(nodes, ancestors = []) {
      if (!Array.isArray(nodes) || ancestors.length > 32) throw new Error('Invalid workflow tree.');
      const list = document.createElement('ul');
      nodes.forEach((node) => {
        if (!node || typeof node.flow !== 'string' || !validName.test(node.flow) || typeof node.title !== 'string' || !node.title.trim() || node.title.length > 120 || entries.has(node.flow) || entries.size >= 500) {
          throw new Error('Invalid or duplicate workflow entry.');
        }
        entries.set(node.flow, { title: node.title, ancestors });
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.textContent = node.title;
        link.dataset.flow = node.flow;
        link.href = flowUrl(node.flow, ancestors).href;
        if (node.children !== undefined) {
          const children = buildTree(node.children, [...ancestors, node.flow]);
          const branch = document.createElement('details');
          branch.open = true;
          const summary = document.createElement('summary');
          summary.append(link);
          branch.append(summary, children);
          item.append(branch);
        } else {
          item.append(link);
        }
        list.append(item);
      });
      return list;
    }
    const tree = buildTree(data);
    navigationEntries = entries;
    byId('workflow-tree').replaceChildren(...tree.children);
    byId('navigation-status').hidden = entries.size > 0;
    if (!entries.size) byId('navigation-status').textContent = 'No workflows listed in index.json.';
    updateTreeSelection();
    updateBreadcrumbs();
  } catch (error) {
    byId('navigation-status').textContent = `Could not load workflow navigation from index.json. ${error.message}`;
  }
}

function updateBreadcrumbs() {
  const names = [...ancestorPath(), flowName];
  const list = byId('breadcrumbs');
  list.replaceChildren();
  names.forEach((name, index) => {
    const item = document.createElement('li');
    if (index === names.length - 1) {
      item.textContent = navigationEntries.get(name)?.title ?? name;
      item.setAttribute('aria-current', 'page');
    } else {
      const link = document.createElement('a');
      link.href = flowUrl(name, names.slice(0, index)).href;
      link.textContent = navigationEntries.get(name)?.title ?? name;
      item.append(link);
    }
    list.append(item);
  });
}

function linkWorkflows(svg) {
  svg.querySelectorAll('g.node').forEach((node) => {
    const label = node.querySelector('.label')?.textContent.trim();
    const reference = label?.match(/(?:^|:\s*)([A-Za-z0-9][A-Za-z0-9_-]{0,79})\.air\.mmd$/);
    if (!reference || node.closest('a')) return;
    const target = reference[1];
    const trail = [...ancestorPath(), flowName];
    const existing = trail.indexOf(target);
    const ancestors = existing < 0 ? trail.slice(-32) : trail.slice(0, existing);
    const link = document.createElementNS('http://www.w3.org/2000/svg', 'a');
    link.setAttribute('href', flowUrl(target, ancestors).href);
    link.setAttribute('class', 'flow-link');
    link.setAttribute('aria-label', `Open ${target} workflow`);
    link.setAttribute('tabindex', '0');
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `Open ${target} workflow`;
    node.before(link);
    link.append(title, node);
  });
}

function followWorkflowLink(event) {
  const link = event.target.closest('a.flow-link, #breadcrumbs a, #workflow-tree a');
  if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const href = link.getAttribute('href');
  history.pushState(null, '', href);
  loadFlow(new URL(href).searchParams.get('flow'));
}

function renderSource(id) {
  renderQueue = renderQueue.then(async () => {
    if (id !== requestId || !source) return;
    diagram.replaceChildren();
    width = 0;
    height = 0;
    zoomButtons.forEach((button) => { button.disabled = true; });
    viewport.setAttribute('aria-busy', 'true');
    byId('message').hidden = true;
    byId('status').textContent = 'Rendering...';
    try {
      if (!window.mermaid) throw new Error('Mermaid could not load. Check your connection to the CDN and reload the page.');
      window.mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: theme === 'dark' ? 'dark' : 'base',
        fontFamily: 'DM Sans, sans-serif',
        themeVariables: theme === 'light' ? {
          primaryColor: '#e4f2eb', primaryTextColor: '#202b29', primaryBorderColor: '#43816b',
          lineColor: '#64736d', secondaryColor: '#fff0e8', tertiaryColor: '#f1f4f2'
        } : {},
        flowchart: { htmlLabels: false, useMaxWidth: false, curve: 'basis' },
        suppressErrorRendering: true
      });
      const result = await window.mermaid.render(`airflow-diagram-${++renderId}`, source);
      if (id !== requestId) return;
      diagram.innerHTML = result.svg;
      const svg = diagram.querySelector('svg');
      const bounds = svg.viewBox.baseVal;
      width = bounds.width;
      height = bounds.height;
      if (!width || !height) throw new Error('The diagram has no visible content.');
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);
      svg.setAttribute('role', 'group');
      svg.setAttribute('aria-label', `${flowName} workflow`);
      linkWorkflows(svg);
      fit();
      zoomButtons.forEach((button) => { button.disabled = false; });
      byId('status').textContent = 'Ready';
      viewport.setAttribute('aria-busy', 'false');
    } catch (error) {
      if (id !== requestId) return;
      diagram.replaceChildren();
      showError(`Could not render the workflow. ${error.message}`);
    }
  });
  return renderQueue;
}

async function loadInstructions() {
  try {
    const response = await fetch(new URL('copilot-instructions.md', location.href), { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    if (!text.trim()) throw new Error('The instructions file is empty.');
    instructionTemplate = text;
    byId('instructions-status').hidden = true;
  } catch (error) {
    byId('instructions-status').textContent = `Could not load standard Copilot instructions. ${error.message}`;
  }
}

async function loadFlow(name) {
  const id = ++requestId;
  if (controller) controller.abort();
  source = '';
  width = 0;
  height = 0;
  diagram.replaceChildren();
  byId('source').textContent = '';
  byId('message').hidden = true;
  byId('download').disabled = true;
  byId('copy').disabled = true;
  byId('copy').textContent = 'Copy source';
  aiCopyButtons.forEach((button) => { button.disabled = true; button.textContent = 'Copy AI reference'; });
  byId('ai-reference').textContent = '';
  byId('ai-copy-status').textContent = '';
  byId('ai-source-link').hidden = true;
  zoomButtons.forEach((button) => { button.disabled = true; });
  byId('raw-link').hidden = true;
  viewport.setAttribute('aria-busy', 'true');
  if (!validName.test(name)) {
    flowName = '';
    byId('breadcrumbs').replaceChildren();
    updateTreeSelection();
    showError('Invalid workflow name. Use 1-80 letters, numbers, hyphens or underscores, starting with a letter or number.');
    return;
  }
  flowName = name;
  updateBreadcrumbs();
  updateTreeSelection();
  const filename = `${name}.air.mmd`;
  const url = new URL(`flows/${filename}`, location.href);
  byId('raw-link').href = url.href;
  byId('raw-link').hidden = false;
  byId('flow-title').replaceChildren(document.createTextNode(name));
  const extension = document.createElement('span');
  extension.textContent = '.air.mmd';
  byId('flow-title').append(extension);
  byId('source-name').textContent = filename;
  byId('status').textContent = 'Loading workflow...';
  controller = new AbortController();
  try {
    const response = await fetch(url, { signal: controller.signal, cache: 'no-cache' });
    if (!response.ok) throw new Error(response.status === 404 ? `${filename} was not found in flows/.` : `The server returned HTTP ${response.status}.`);
    const text = await response.text();
    if (id !== requestId) return;
    if (!text.trim()) throw new Error(`${filename} is empty.`);
    source = text;
    byId('source').textContent = source;
    byId('download').disabled = false;
    byId('copy').disabled = false;
    byId('ai-source-link').href = url.href;
    byId('ai-source-link').textContent = url.href;
    byId('ai-source-link').hidden = false;
    if (instructionTemplate) {
      byId('ai-reference').textContent = `${instructionTemplate.trimEnd()}\n\n## Selected Diagram (Context Only)\n\n${url.href}\n\nThe entry point remains Project; this reference does not authorize skipping subflows.\n`;
      aiCopyButtons.forEach((button) => { button.disabled = false; });
    }
    await renderSource(id);
  } catch (error) {
    if (id !== requestId || error.name === 'AbortError') return;
    showError(`Could not load the workflow. ${error.message} Check the workflow name and your connection.`);
  }
}

diagram.addEventListener('click', followWorkflowLink);
byId('breadcrumbs').addEventListener('click', followWorkflowLink);
byId('workflow-tree').addEventListener('click', followWorkflowLink);
window.addEventListener('popstate', () => loadFlow(new URLSearchParams(location.search).get('flow') ?? 'project'));
themeSwitch.addEventListener('change', () => {
  theme = themeSwitch.checked ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('airflow-theme', theme); } catch {}
  if (source) renderSource(requestId);
});
byId('zoom-in').addEventListener('click', () => zoom(1.25));
byId('zoom-out').addEventListener('click', () => zoom(.8));
byId('reset').addEventListener('click', fit);
viewport.addEventListener('wheel', (event) => {
  if (!width) return;
  event.preventDefault();
  const bounds = viewport.getBoundingClientRect();
  zoom(event.deltaY < 0 ? 1.1 : 1 / 1.1, event.clientX - bounds.left, event.clientY - bounds.top);
}, { passive: false });
viewport.addEventListener('pointerdown', (event) => {
  if (!width || event.button !== 0 || event.target.closest('.zoom-controls, a')) return;
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY, offsetX, offsetY };
  viewport.setPointerCapture(event.pointerId);
  viewport.classList.add('dragging');
});
viewport.addEventListener('pointermove', (event) => {
  if (!drag || drag.id !== event.pointerId) return;
  offsetX = drag.offsetX + event.clientX - drag.x;
  offsetY = drag.offsetY + event.clientY - drag.y;
  applyTransform();
});
function endDrag() { drag = null; viewport.classList.remove('dragging'); }
viewport.addEventListener('lostpointercapture', endDrag);
viewport.addEventListener('pointerup', endDrag);
viewport.addEventListener('pointercancel', endDrag);
viewport.addEventListener('keydown', (event) => {
  if (event.target !== viewport) return;
  if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(1.25); }
  if (event.key === '-') { event.preventDefault(); zoom(.8); }
  if (event.key === '0') { event.preventDefault(); fit(); }
  const movement = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] }[event.key];
  if (movement && width) { event.preventDefault(); offsetX += movement[0]; offsetY += movement[1]; applyTransform(); }
});
new ResizeObserver(fit).observe(viewport);

byId('download').addEventListener('click', () => {
  if (!source) return;
  const url = URL.createObjectURL(new Blob([source], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${flowName}.air.mmd`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
byId('copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(source);
    byId('copy').textContent = 'Copied';
  } catch {
    byId('copy').textContent = 'Select source to copy';
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(byId('source'));
    selection.removeAllRanges();
    selection.addRange(range);
  }
});

async function copyAIReference() {
  const reference = byId('ai-reference').textContent;
  if (!reference) return;
  try {
    await navigator.clipboard.writeText(reference);
    aiCopyButtons.forEach((button) => { button.textContent = 'Copied'; });
    byId('ai-copy-status').textContent = 'AI reference copied.';
  } catch {
    aiCopyButtons.forEach((button) => { button.textContent = 'Copy AI reference'; });
    if (!gettingStarted.open) gettingStarted.showModal();
    byId('ai-copy-status').textContent = 'Clipboard unavailable. The instruction fragment is selected for manual copying.';
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(byId('ai-reference'));
    selection.removeAllRanges();
    selection.addRange(range);
    byId('ai-reference').scrollIntoView({ block: 'nearest' });
  }
}

aiCopyButtons.forEach((button) => button.addEventListener('click', copyAIReference));
byId('get-started').addEventListener('click', () => gettingStarted.showModal());
byId('close-get-started').addEventListener('click', () => gettingStarted.close());
gettingStarted.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    gettingStarted.close();
  }
});
gettingStarted.addEventListener('click', (event) => {
  if (event.target === gettingStarted) gettingStarted.close();
});

Promise.all([loadNavigation(), loadInstructions()]).then(() => loadFlow(new URLSearchParams(location.search).get('flow') ?? 'project'));