import './style.css';
import { decryptState, encryptState } from './crypto';
import { dateInputToIso, dueReason, effectiveDueAt, formatDate, isDue, localDateValue, scheduleReview } from './scheduler';
import { clearState, emptyState, loadState, saveState, validateState } from './storage';
import type { StorageScope } from './storage';
import type { AppState, Confidence, Objective, Prompt } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;
if (!app) throw new Error('App root is missing.');

const slug = 'learning-objective-loop';
const billingBase = import.meta.env.VITE_BILLING_API_BASE || 'https://api.sociobot.in/api/v1';
const licenseKey = `sb_license:${slug}`;
const verdictKey = `${licenseKey}:verdict`;
const storageScope: StorageScope = new URLSearchParams(location.search).get('demo') === '1' ? 'demo' : 'real';
const demoMode = storageScope === 'demo';

let state: AppState = emptyState();
let loading = true;
let loadError = '';
let activeReviewId: string | null = null;
let answerRevealed = false;
let toast = '';
let toastTimer: number | undefined;
let updateReady = false;
let isPremium = false;
let licenseNotice = '';
let reviewReturnFocus: { promptId: string; index: number } | null = null;

class FormValidationError extends Error {
  constructor(message: string, readonly fieldName: string) {
    super(message);
  }
}

const esc = (value: unknown): string => String(value ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;');

const uid = (): string => crypto.randomUUID();
const now = (): string => new Date().toISOString();
const route = (): string => location.hash.replace(/^#\/?/, '') || 'today';
const selectedObjectiveId = (): string | null => route().startsWith('objective/') ? route().split('/')[1] || null : null;

function sampleState(): AppState {
  const timestamp = now();
  const fourDaysAgo = new Date(Date.now() - 4 * 86_400_000).toISOString();
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString();
  return {
    version: 1,
    updatedAt: timestamp,
    objectives: [
      { id: 'demo-seasons', title: 'Explain why seasons differ by hemisphere', description: 'Explain axial tilt with a diagram and compare June in both hemispheres.', parentId: null, evidence: [{ id: 'demo-seasons-source', label: 'Axial tilt notes', url: 'https://en.wikipedia.org/wiki/Season', createdAt: timestamp }], archived: false, createdAt: timestamp, updatedAt: timestamp },
      { id: 'demo-cells', title: 'Compare mitosis and meiosis', description: 'Name the purpose, cell divisions, and resulting chromosome count without notes.', parentId: null, evidence: [], archived: false, createdAt: timestamp, updatedAt: timestamp },
      { id: 'demo-escape', title: 'Derive escape velocity', description: 'Start from energy conservation and explain each term in the result.', parentId: null, evidence: [], archived: false, createdAt: timestamp, updatedAt: timestamp },
    ],
    prompts: [
      { id: 'demo-seasons-prompt', objectiveId: 'demo-seasons', question: 'Why is it summer in Australia when it is winter in Europe?', answer: 'Earth’s tilt points the southern hemisphere toward the Sun while the northern hemisphere points away, changing light angle and day length.', notes: 'Sketch the tilted axis.', stage: 0, dueAt: timestamp, manualDueAt: null, reviews: [], createdAt: timestamp, updatedAt: timestamp },
      { id: 'demo-cells-prompt', objectiveId: 'demo-cells', question: 'What two outcomes distinguish meiosis from mitosis?', answer: 'Meiosis creates four genetically varied haploid cells; mitosis creates two genetically similar cells with the original chromosome count.', notes: '', stage: 0, dueAt: timestamp, manualDueAt: null, reviews: [], createdAt: timestamp, updatedAt: timestamp },
      { id: 'demo-escape-prompt', objectiveId: 'demo-escape', question: 'Why does escape velocity not depend on the mass of the launched object?', answer: 'The object’s mass appears in both kinetic and gravitational potential energy, so it cancels when the energies are equated.', notes: '', stage: 1, dueAt: tomorrow, manualDueAt: null, reviews: [{ id: 'demo-escape-review', at: fourDaysAgo, correct: true, confidence: 4, priorStage: 0, newStage: 1, intervalDays: 3 }], createdAt: fourDaysAgo, updatedAt: fourDaysAgo },
    ],
  };
}

function objectiveFor(prompt: Prompt): Objective | undefined {
  return state.objectives.find((objective) => objective.id === prompt.objectiveId);
}

function sortedPrompts(): Prompt[] {
  return [...state.prompts].sort((a, b) => new Date(effectiveDueAt(a)).getTime() - new Date(effectiveDueAt(b)).getTime());
}

function duePrompts(): Prompt[] {
  return sortedPrompts().filter((prompt) => isDue(prompt));
}

function navItem(target: string, label: string, count?: number): string {
  const active = route() === target || (target === 'objectives' && route().startsWith('objective/'));
  return `<a class="nav-item${active ? ' is-active' : ''}" href="#/${target}" ${active ? 'aria-current="page"' : ''}>
    <span>${label}</span>${count === undefined ? '' : `<span class="nav-count" aria-label="${count} due">${count}</span>`}
  </a>`;
}

function shell(content: string): string {
  const offline = !navigator.onLine;
  return `
    <header class="masthead">
      <a class="wordmark" href="#/today" aria-label="Objective Loop home">
        <svg aria-hidden="true" viewBox="0 0 48 48"><circle cx="24" cy="24" r="18"/><path d="M24 6v7m0 22v7M6 24h7m22 0h7"/><circle cx="24" cy="24" r="5"/></svg>
        <h1>Objective <span>Loop</span></h1>
      </a>
      <div class="mast-actions">
        <span class="connection ${offline ? 'is-offline' : ''}" role="status">${offline ? 'Offline · saved here' : 'Local · private'}</span>
        <button class="icon-button" data-action="theme" aria-label="Switch color theme" title="Switch color theme"><span aria-hidden="true">◐</span></button>
      </div>
    </header>
    ${demoMode ? `<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved to your notebook.</strong><span><button class="text-button" type="button" data-action="reset-demo">Reset demo</button><button class="text-button" type="button" data-action="start-real">Start for real</button></span></aside>` : ''}
    <div class="app-grid">
      <nav class="side-nav" aria-label="Main navigation">
        <div class="nav-primary">
          ${navItem('today', 'Review', duePrompts().length)}
          ${navItem('objectives', 'Objective map')}
          ${navItem('data', 'Data & access')}
        </div>
        <a class="button button-primary new-objective" href="#/new-objective"><span aria-hidden="true">＋</span> New objective</a>
        <p class="nav-note">Nothing leaves this device unless you choose to export it.</p>
      </nav>
      <main id="main" tabindex="-1">${content}</main>
    </div>
    <footer>
      <span>Made for deliberate learners. Original AI-generated field-guide artwork.</span>
      <span><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></span>
    </footer>
    <div class="toast-region" aria-live="polite" aria-atomic="true">${toastMarkup()}</div>
    ${reviewDialog()}`;
}

function toastMarkup(): string {
  return `${toast ? `<div class="toast">${esc(toast)}</div>` : ''}${updateReady ? `<div class="toast update-toast"><span>An update is ready. Reload to use it.</span><button class="button button-update" type="button" data-action="reload-update">Reload update</button></div>` : ''}`;
}

function renderToastRegion(): void {
  const region = app.querySelector<HTMLElement>('.toast-region');
  if (region) region.innerHTML = toastMarkup();
}

function pageHeader(kicker: string, title: string, copy: string, action = ''): string {
  return `<section class="page-head"><div><p class="kicker">${esc(kicker)}</p><h2>${esc(title)}</h2><p>${esc(copy)}</p></div>${action}</section>`;
}

function emptyToday(): string {
  return `<section class="onboarding sheet">
    <div class="onboarding-copy">
      <p class="kicker">Your first loop</p>
      <h2>Turn an intention into a review you can explain.</h2>
      <p>Start with one outcome you want to be able to demonstrate. Add your own short-answer prompt, then let each answer set the next review date.</p>
      <div class="onboarding-actions"><a class="button button-primary" href="/?demo=1#/today">Try it with sample data</a><a class="button button-quiet" href="#/new-objective">Create your first objective</a></div>
      <ul class="fact-lines"><li>Works offline after the first visit.</li><li>Study content stays in this browser.</li><li>Core notebook free; Study archive $19 once.</li></ul>
      <ol class="steps"><li><span>01</span>State an objective</li><li><span>02</span>Write a recall prompt</li><li><span>03</span>Review with evidence</li></ol>
    </div>
    <picture><source media="(max-width: 720px)" srcset="/assets/objective-field-map-720.427b472e8f53.webp"><img src="/assets/objective-field-map.e409d0f7909f.webp" width="1200" height="800" alt="A screen-printed notebook diagram linking an objective tree to prompt slips and a review calendar." fetchpriority="high" decoding="async"></picture>
  </section>`;
}

function todayView(): string {
  if (!state.objectives.length) return emptyToday();
  const due = duePrompts();
  const upcoming = sortedPrompts().filter((prompt) => !isDue(prompt)).slice(0, 5);
  const reviewed = state.prompts.reduce((sum, prompt) => sum + prompt.reviews.length, 0);
  return `${pageHeader('Review desk', due.length ? `${due.length} ${due.length === 1 ? 'prompt is' : 'prompts are'} due` : 'You are clear for today', due.length ? 'Each item below shows exactly why it entered the queue.' : 'No review is due. Add a prompt or inspect what is coming next.', due.length ? `<button class="button button-primary" data-review="${esc(due[0].id)}">Start review</button>` : '')}
    <section class="metric-strip" aria-label="Learning summary">
      <div><strong>${state.objectives.filter((item) => !item.archived).length}</strong><span>active objectives</span></div>
      <div><strong>${state.prompts.length}</strong><span>recall prompts</span></div>
      <div><strong>${reviewed}</strong><span>reviews logged</span></div>
    </section>
    <section aria-labelledby="due-heading"><div class="section-title"><h3 id="due-heading">Due now</h3><span class="stamp">${due.length} due</span></div>
      ${due.length ? `<ul class="prompt-list">${due.map(promptRow).join('')}</ul>` : `<div class="empty-inline"><span aria-hidden="true">✓</span><div><strong>The queue is empty.</strong><p>Your upcoming reviews stay visible below—no hidden recommendation model.</p></div></div>`}
    </section>
    <section aria-labelledby="upcoming-heading"><div class="section-title"><h3 id="upcoming-heading">Coming up</h3><span>${upcoming.length ? 'Next five' : 'No scheduled prompts'}</span></div>
      ${upcoming.length ? `<ul class="prompt-list is-upcoming">${upcoming.map(promptRow).join('')}</ul>` : `<p class="muted">Add a prompt to an objective to begin its review loop.</p>`}
    </section>`;
}

function promptRow(prompt: Prompt): string {
  const objective = objectiveFor(prompt);
  const due = effectiveDueAt(prompt);
  return `<li class="prompt-row">
    <div class="date-block"><span>${isDue(prompt) ? 'DUE' : new Date(due).toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}</span><strong>${isDue(prompt) ? 'NOW' : new Date(due).getDate()}</strong></div>
    <div class="prompt-main"><a href="#/objective/${esc(prompt.objectiveId)}" class="objective-label">${esc(objective?.title || 'Missing objective')}</a><h4>${esc(prompt.question)}</h4><p><strong>Why now?</strong> ${esc(dueReason(prompt))}</p>
      <details><summary>Show calculation</summary><p>${prompt.reviews.length ? `Stage ${prompt.stage + 1} of ${7}; base interval ${[1, 3, 7, 14, 30, 60, 120][prompt.stage]} days.${prompt.manualDueAt ? ' A manual date currently replaces that calculated date.' : ''}` : 'New prompts enter the queue immediately at stage 1. Your answer determines the first interval.'}</p></details></div>
    <button class="button ${isDue(prompt) ? 'button-primary' : 'button-quiet'}" data-review="${esc(prompt.id)}">Review<span class="sr-only"> ${esc(prompt.question)}</span></button>
  </li>`;
}

function objectiveTree(): string {
  const active = state.objectives.filter((item) => !item.archived);
  const roots = active.filter((item) => !item.parentId || !active.some((candidate) => candidate.id === item.parentId));
  const branch = (objective: Objective): string => {
    const prompts = state.prompts.filter((prompt) => prompt.objectiveId === objective.id);
    const due = prompts.filter((prompt) => isDue(prompt)).length;
    const children = active.filter((item) => item.parentId === objective.id);
    return `<li><a class="objective-node" href="#/objective/${esc(objective.id)}"><span class="node-mark" aria-hidden="true"></span><span><strong>${esc(objective.title)}</strong><small>${prompts.length} prompts · ${due} due</small></span><span aria-hidden="true">→</span></a>${children.length ? `<ul>${children.map((child) => branch(child)).join('')}</ul>` : ''}</li>`;
  };
  return `<ul class="objective-tree">${roots.map((root) => branch(root)).join('')}</ul>`;
}

function objectivesView(): string {
  const active = state.objectives.filter((item) => !item.archived);
  return `${pageHeader('Objective map', active.length ? 'Your learning has a visible structure' : 'Map what you want to know', 'Objectives hold the evidence and recall prompts. Nest them when one outcome depends on another.', '<a class="button button-primary" href="#/new-objective">New objective</a>')}
    ${active.length ? `<section class="map-sheet sheet"><div class="map-legend"><span><i class="dot cobalt"></i>Objective</span><span><i class="dot red"></i>Due work</span></div>${objectiveTree()}</section>` : `<section class="blank-state"><div class="loop-glyph" aria-hidden="true">↻</div><h3>No objectives yet</h3><p>Begin with something observable: “Explain…”, “Solve…”, or “Compare…”.</p><a class="button button-primary" href="#/new-objective">Create an objective</a></section>`}`;
}

function newObjectiveView(): string {
  const parents = state.objectives.filter((item) => !item.archived);
  return `${pageHeader('New field note', 'State the learning objective', 'Describe what you want to be able to demonstrate. You can refine it later.')}
    <form class="editor sheet" data-form="objective">
      <div class="field"><label for="objective-title">Objective <span aria-hidden="true">*</span></label><p class="hint" id="title-hint">Use an observable verb and keep it specific.</p><input id="objective-title" name="title" required maxlength="120" aria-describedby="title-hint" placeholder="Explain why seasons change"></div>
      <div class="field"><label for="objective-description">What counts as evidence?</label><textarea id="objective-description" name="description" rows="4" maxlength="500" placeholder="I can explain the axial tilt with a diagram, without notes."></textarea></div>
      <div class="field"><label for="objective-parent">Parent objective</label><select id="objective-parent" name="parentId"><option value="">None — top level</option>${parents.map((item) => `<option value="${esc(item.id)}">${esc(item.title)}</option>`).join('')}</select></div>
      <div class="form-actions"><a class="button button-quiet" href="#/objectives">Cancel</a><button class="button button-primary" type="submit">Save objective</button></div>
      <p class="form-error" role="alert"></p>
    </form>`;
}

function objectiveDetail(id: string): string {
  const objective = state.objectives.find((item) => item.id === id);
  if (!objective) return notFound();
  const prompts = state.prompts.filter((prompt) => prompt.objectiveId === id);
  const children = state.objectives.filter((item) => item.parentId === id && !item.archived);
  return `<a class="back-link" href="#/objectives">← Objective map</a>
    <section class="objective-head"><div><p class="kicker">Learning objective</p><h2>${esc(objective.title)}</h2><p>${esc(objective.description || 'No evidence statement yet.')}</p></div><span class="progress-seal">${prompts.filter((prompt) => prompt.reviews.length).length}<small>tested</small></span></section>
    <div class="objective-grid"><div>
      <section aria-labelledby="prompts-heading"><div class="section-title"><h3 id="prompts-heading">Recall prompts</h3><span>${prompts.length} total</span></div>
        ${prompts.length ? `<ul class="prompt-stack">${prompts.map(editablePrompt).join('')}</ul>` : `<div class="empty-inline"><span aria-hidden="true">?</span><div><strong>No prompt tests this objective yet.</strong><p>Write one question you can answer without looking.</p></div></div>`}
        <details class="composer" ${prompts.length ? '' : 'open'}><summary>Add a recall prompt</summary><form data-form="prompt" data-objective-id="${esc(id)}">
          <div class="field"><label for="prompt-question">Question <span aria-hidden="true">*</span></label><textarea id="prompt-question" name="question" rows="3" required maxlength="400" placeholder="Why does axial tilt create seasons?"></textarea></div>
          <div class="field"><label for="prompt-answer">Expected answer <span aria-hidden="true">*</span></label><textarea id="prompt-answer" name="answer" rows="4" required maxlength="1200" placeholder="A concise answer you can compare against."></textarea></div>
          <div class="field"><label for="prompt-notes">Review note (optional)</label><input id="prompt-notes" name="notes" maxlength="200" placeholder="Include a sketch"></div>
          <button class="button button-primary" type="submit">Add to review queue</button><p class="form-error" role="alert"></p>
        </form></details>
      </section>
    </div><aside class="evidence-column">
      <section aria-labelledby="evidence-heading"><div class="section-title"><h3 id="evidence-heading">Evidence shelf</h3><span>${objective.evidence.length} links</span></div>
        ${objective.evidence.length ? `<ul class="evidence-list">${objective.evidence.map((item) => `<li><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${esc(item.label)}</a><button class="text-button danger" data-delete-evidence="${esc(item.id)}" data-objective-id="${esc(id)}" aria-label="Remove evidence ${esc(item.label)}">Remove</button></li>`).join('')}</ul>` : '<p class="muted">Attach the source or work sample this objective comes from.</p>'}
        <form class="mini-form" data-form="evidence" data-objective-id="${esc(id)}"><div class="field"><label for="evidence-label">Link label</label><input id="evidence-label" name="label" required maxlength="100" placeholder="Chapter 4 notes"></div><div class="field"><label for="evidence-url">Web address</label><input id="evidence-url" name="url" type="url" inputmode="url" required placeholder="https://…"></div><button class="button button-quiet" type="submit">Attach evidence</button><p class="form-error" role="alert"></p></form>
      </section>
      ${children.length ? `<section><h3>Sub-objectives</h3><ul class="link-list">${children.map((child) => `<li><a href="#/objective/${esc(child.id)}">${esc(child.title)} →</a></li>`).join('')}</ul></section>` : ''}
      <details class="settings-box"><summary>Edit objective</summary><form data-form="edit-objective" data-objective-id="${esc(id)}"><div class="field"><label for="edit-title">Title</label><input id="edit-title" name="title" required maxlength="120" value="${esc(objective.title)}" aria-describedby="edit-objective-error"></div><div class="field"><label for="edit-description">Evidence statement</label><textarea id="edit-description" name="description" rows="4" maxlength="500" aria-describedby="edit-objective-error">${esc(objective.description)}</textarea></div><button class="button button-quiet" type="submit">Save changes</button><p class="form-error" id="edit-objective-error" role="alert"></p></form><button class="text-button danger" data-delete-objective="${esc(id)}">Delete this objective</button></details>
    </aside></div>`;
}

function editablePrompt(prompt: Prompt): string {
  return `<li class="prompt-card"><div class="prompt-card-head"><div><p class="kicker">${prompt.manualDueAt ? 'Manual date' : `Stage ${prompt.stage + 1}`}</p><h4>${esc(prompt.question)}</h4><p>Due ${esc(formatDate(effectiveDueAt(prompt)))} · ${prompt.reviews.length} reviews</p></div><button class="button ${isDue(prompt) ? 'button-primary' : 'button-quiet'}" data-review="${esc(prompt.id)}">Review</button></div>
    <details><summary>Answer, schedule & editing</summary><div class="answer-note"><strong>Expected answer</strong><p>${esc(prompt.answer)}</p></div>
      <form class="inline-schedule" data-form="schedule" data-prompt-id="${esc(prompt.id)}"><div class="field"><label for="date-${esc(prompt.id)}">Override next review</label><input id="date-${esc(prompt.id)}" type="date" name="dueDate" value="${esc(localDateValue(effectiveDueAt(prompt)))}"></div><button class="button button-quiet" type="submit">Set date</button>${prompt.manualDueAt ? `<button class="text-button" type="button" data-clear-override="${esc(prompt.id)}">Use calculated date</button>` : ''}</form>
      ${prompt.reviews.length ? `<div class="review-history"><strong>Recent evidence</strong><ul>${[...prompt.reviews].reverse().slice(0, 5).map((review) => `<li><span>${esc(formatDate(review.at))}</span><span>${review.correct ? 'Correct' : 'Not yet'} · confidence ${review.confidence}/5</span><span>${review.intervalDays}-day next step</span></li>`).join('')}</ul></div>` : ''}
      <form class="edit-prompt" data-form="edit-prompt" data-prompt-id="${esc(prompt.id)}"><div class="field"><label for="question-${esc(prompt.id)}">Question</label><textarea id="question-${esc(prompt.id)}" name="question" rows="2" required maxlength="400" aria-describedby="prompt-error-${esc(prompt.id)}">${esc(prompt.question)}</textarea></div><div class="field"><label for="answer-${esc(prompt.id)}">Expected answer</label><textarea id="answer-${esc(prompt.id)}" name="answer" rows="3" required maxlength="1200" aria-describedby="prompt-error-${esc(prompt.id)}">${esc(prompt.answer)}</textarea></div><button class="button button-quiet" type="submit">Save prompt</button><button class="text-button danger" type="button" data-delete-prompt="${esc(prompt.id)}">Delete prompt</button><p class="form-error" id="prompt-error-${esc(prompt.id)}" role="alert"></p></form>
    </details></li>`;
}

function premiumInsights(): string {
  if (!isPremium) return `<section class="premium-panel"><div><p class="kicker">Study archive · paid unlock</p><h3>See patterns across your review history</h3><p>Unlock objective-level recall rates and printable weekly summaries for a one-time $19 purchase. All core objectives, prompts, reviews, manual dates, and encrypted exports remain free.</p><a class="button button-primary" href="${billingBase}/products/${slug}/checkout">Buy once · $19</a></div><div class="halftone-seal" aria-hidden="true">19</div></section>`;
  const reviews = state.prompts.flatMap((prompt) => prompt.reviews);
  const correct = reviews.filter((review) => review.correct).length;
  const rate = reviews.length ? Math.round((correct / reviews.length) * 100) : 0;
  return `<section class="premium-panel is-unlocked"><div><p class="kicker">Study archive · unlocked</p><h3>${rate}% recall across ${reviews.length} reviews</h3><p>${reviews.length ? 'Your full review history is available on this device.' : 'Complete a review to begin your history summary.'}</p><button class="button button-quiet" data-action="print">Print weekly summary</button></div><div class="halftone-seal" aria-hidden="true">✓</div></section>`;
}

function dataView(): string {
  return `${pageHeader('Data & access', 'Your learning record belongs to you', 'Exports happen entirely in this browser. Encrypted backups use your passphrase; we never receive it.')}
    ${premiumInsights()}
    <div class="data-grid"><section class="sheet"><h3>Encrypted backup</h3><p>Download objectives, evidence links, prompts, schedules, and review history protected with AES-256-GCM.</p><form data-form="export"><div class="field"><label for="export-passphrase">Backup passphrase</label><input id="export-passphrase" name="passphrase" type="password" minlength="8" required autocomplete="new-password" aria-describedby="export-hint"><p class="hint" id="export-hint">At least 8 characters. It cannot be recovered.</p></div><button class="button button-primary" type="submit">Download encrypted backup</button><button class="button button-quiet" type="button" data-action="csv">Export readable CSV</button><p class="form-error" role="alert"></p></form></section>
      <section class="sheet"><h3>Restore a backup</h3><p>Import replaces the current record after confirmation. Make a backup first if needed.</p><form data-form="import"><div class="field"><label for="import-file">Encrypted backup file</label><input id="import-file" name="file" type="file" accept=".loop,.json,application/json" required></div><div class="field"><label for="import-passphrase">Backup passphrase</label><input id="import-passphrase" name="passphrase" type="password" required autocomplete="current-password"></div><button class="button button-quiet" type="submit">Decrypt and restore</button><p class="form-error" role="alert"></p></form></section>
    </div>
    <section class="license-box"><div><p class="kicker">Purchase access</p><h3>${isPremium ? 'Study archive is active' : 'Restore a Study archive license'}</h3><p>${esc(licenseNotice || (isPremium ? 'This device has a verified license.' : 'Paste the license token from your receipt to unlock this device.'))}</p></div><form data-form="license"><label for="license-token">License token</label><div class="joined"><input id="license-token" name="token" required autocomplete="off" spellcheck="false"><button class="button button-quiet" type="submit">Verify license</button></div><p class="form-error" role="alert"></p></form></section>`;
}

function legalView(kind: 'privacy' | 'terms'): string {
  if (kind === 'privacy') return `<article class="legal"><p class="kicker">Effective August 27, 2026</p><h2>Privacy</h2><p><strong>Your study data stays in your browser.</strong> Objective Loop stores objectives, prompts, evidence links, review history, and preferences in IndexedDB and local storage on this device.</p><h3>What is sent over the network</h3><p>The core app sends no study data, analytics, or tracking events. If you buy or verify a Study archive license, your browser contacts Sociobot’s billing API with the license token. Checkout is hosted by Sociobot/Dodo, the merchant of record, and their policies apply there.</p><h3>Exports and deletion</h3><p>Encrypted backups are created locally with the passphrase you choose. We cannot recover it. You may remove individual records in the app or clear this site’s storage in your browser.</p><h3>Contact</h3><p>Questions can be sent to <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a>.</p><p><a href="/#/today">← Return to Objective Loop</a></p></article>`;
  return `<article class="legal"><p class="kicker">Effective August 27, 2026</p><h2>Terms</h2><p>Objective Loop is a local-first study utility provided as-is. You are responsible for your learning content, backup passphrase, and exported files.</p><h3>Study archive purchase</h3><p>Study archive is a one-time $19 license that unlocks history insights and printable summaries. Core objectives, prompts, review scheduling, manual overrides, and data export remain available without purchase. Sociobot/Dodo is the merchant of record. Refunds are handled by the merchant and revoke the related license.</p><h3>Acceptable use</h3><p>Do not misuse the service or billing endpoints, interfere with their operation, or use the product in violation of applicable law.</p><h3>Warranty</h3><p>The scheduling tool is an aid, not a guarantee of learning outcomes. To the extent permitted by law, it is provided without warranties.</p><p><a href="/#/today">← Return to Objective Loop</a></p></article>`;
}

function notFound(): string {
  return `<section class="blank-state"><div class="loop-glyph" aria-hidden="true">?</div><h2>That page is not in this notebook</h2><p>The objective may have been removed.</p><a class="button button-primary" href="#/today">Go to review desk</a></section>`;
}

function reviewDialog(): string {
  if (!activeReviewId) return '';
  const prompt = state.prompts.find((item) => item.id === activeReviewId);
  if (!prompt) return '';
  const objective = objectiveFor(prompt);
  return `<dialog class="review-dialog" id="review-dialog" aria-labelledby="review-title"><button class="dialog-close" data-action="close-review" aria-label="Close review">×</button><p class="kicker">${esc(objective?.title || 'Objective')}</p><h2 id="review-title">${esc(prompt.question)}</h2>${prompt.notes ? `<p class="review-note">Review note: ${esc(prompt.notes)}</p>` : ''}
    ${answerRevealed ? `<div class="answer-reveal"><p class="kicker">Expected answer</p><p>${esc(prompt.answer)}</p></div><form data-form="review" data-prompt-id="${esc(prompt.id)}"><fieldset><legend>Was your answer correct?</legend><div class="choice-row"><label><input type="radio" name="correct" value="true" required><span>Yes, correct</span></label><label><input type="radio" name="correct" value="false" required><span>Not yet</span></label></div></fieldset><fieldset><legend>How confident were you?</legend><p class="hint">1 = guessed · 5 = effortless</p><div class="confidence-row">${[1, 2, 3, 4, 5].map((value) => `<label><input type="radio" name="confidence" value="${value}" required><span>${value}</span></label>`).join('')}</div></fieldset><button class="button button-primary full" type="submit">Log answer & schedule next</button><p class="form-error" role="alert"></p></form>` : `<div class="review-front"><p>Recall your answer before turning the sheet.</p><button class="button button-primary full" data-action="reveal">Reveal expected answer</button></div>`}
  </dialog>`;
}

function render(): void {
  const path = location.pathname.replace(/\/$/, '');
  let content: string;
  if (loading) content = `<section class="loading-state" aria-live="polite"><span class="loader" aria-hidden="true"></span><h2>Opening your notebook…</h2></section>`;
  else if (loadError) content = `<section class="blank-state"><div class="loop-glyph" aria-hidden="true">!</div><h2>Your local notebook could not open</h2><p>${esc(loadError)}</p><button class="button button-primary" data-action="retry">Try again</button></section>`;
  else if (path === '/privacy') content = legalView('privacy');
  else if (path === '/terms') content = legalView('terms');
  else if (route() === 'today') content = todayView();
  else if (route() === 'objectives') content = objectivesView();
  else if (route() === 'new-objective') content = newObjectiveView();
  else if (route() === 'data') content = dataView();
  else if (selectedObjectiveId()) content = objectiveDetail(selectedObjectiveId()!);
  else content = notFound();
  app.innerHTML = shell(content);
  const dialog = document.querySelector<HTMLDialogElement>('#review-dialog');
  if (dialog && !dialog.open) {
    dialog.addEventListener('cancel', () => {
      activeReviewId = null;
      answerRevealed = false;
    }, { once: true });
    dialog.addEventListener('close', closeReview, { once: true });
    dialog.showModal();
  }
}

function restoreReviewFocus(): void {
  const returnTarget = reviewReturnFocus;
  reviewReturnFocus = null;
  if (!returnTarget) return;
  queueMicrotask(() => {
    const triggers = [...app.querySelectorAll<HTMLElement>('[data-review]')]
      .filter((item) => item.dataset.review === returnTarget.promptId);
    triggers[returnTarget.index]?.focus();
  });
}

function closeReview(): void {
  activeReviewId = null;
  answerRevealed = false;
  render();
  restoreReviewFocus();
}

async function persist(message?: string): Promise<void> {
  await saveState(state, storageScope);
  if (message) showToast(message);
  render();
}

async function resetDemo(): Promise<void> {
  if (!demoMode) return;
  state = sampleState();
  await saveState(state, storageScope);
  activeReviewId = null;
  answerRevealed = false;
  location.hash = '/today';
  showToast('Demo sample restored.');
  render();
}

async function startForReal(): Promise<void> {
  if (!demoMode) return;
  try {
    await clearState('demo');
    location.assign('/#/today');
  } catch (error) {
    showToast(error instanceof Error ? error.message : 'The demo could not be cleared. Try again.');
  }
}

function showToast(message: string): void {
  if (toastTimer !== undefined) window.clearTimeout(toastTimer);
  toast = message;
  renderToastRegion();
  toastTimer = window.setTimeout(() => {
    if (toast === message) toast = '';
    toastTimer = undefined;
    renderToastRegion();
  }, 3500);
}

function showUpdateReady(): void {
  updateReady = true;
  renderToastRegion();
}

function clearFormError(form: HTMLFormElement): void {
  const node = form.querySelector<HTMLElement>('.form-error');
  if (node) node.textContent = '';
  form.querySelectorAll<HTMLElement>('[aria-invalid="true"]').forEach((field) => field.removeAttribute('aria-invalid'));
}

function formError(form: HTMLFormElement, message: string, fieldName?: string): void {
  const node = form.querySelector<HTMLElement>('.form-error');
  if (node) node.textContent = message;
  if (fieldName) {
    const field = form.elements.namedItem(fieldName);
    if (field instanceof HTMLElement) {
      field.setAttribute('aria-invalid', 'true');
      field.focus();
    }
  }
}

function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = Object.assign(document.createElement('a'), { href: url, download: name });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvExport(): string {
  const quote = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const rows = [['objective', 'question', 'expected_answer', 'due_at', 'manual_override', 'review_count']];
  state.prompts.forEach((prompt) => rows.push([objectiveFor(prompt)?.title || '', prompt.question, prompt.answer, effectiveDueAt(prompt), prompt.manualDueAt ? 'yes' : 'no', String(prompt.reviews.length)]));
  return rows.map((row) => row.map(quote).join(',')).join('\n');
}

async function verifyLicense(token: string, force = false): Promise<void> {
  const cached = JSON.parse(localStorage.getItem(verdictKey) || 'null') as { valid: boolean; checkedAt: number } | null;
  if (!force && cached && Date.now() - cached.checkedAt < 86_400_000) {
    isPremium = cached.valid;
    render();
    return;
  }
  try {
    const response = await fetch(`${billingBase}/products/${slug}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error();
    const verdict = await response.json() as { valid: boolean; reason: string };
    localStorage.setItem(verdictKey, JSON.stringify({ valid: verdict.valid, checkedAt: Date.now() }));
    isPremium = verdict.valid;
    licenseNotice = verdict.valid ? 'License verified. Study archive is unlocked.' : 'This license is no longer active. Check the token or purchase access.';
  } catch {
    licenseNotice = 'License verification is unavailable. Your core notebook still works offline.';
  }
  render();
}

async function handleSubmit(form: HTMLFormElement): Promise<void> {
  const data = new FormData(form);
  const type = form.dataset.form;
  clearFormError(form);
  try {
    if (type === 'objective') {
      const timestamp = now();
      const objective: Objective = { id: uid(), title: String(data.get('title')).trim(), description: String(data.get('description')).trim(), parentId: String(data.get('parentId') || '') || null, evidence: [], archived: false, createdAt: timestamp, updatedAt: timestamp };
      if (!objective.title) throw new FormValidationError('Write an objective before saving.', 'title');
      if (objective.title.length > 120) throw new FormValidationError('Keep the objective to 120 characters or fewer.', 'title');
      if (objective.description.length > 500) throw new FormValidationError('Keep the evidence statement to 500 characters or fewer.', 'description');
      state.objectives.push(objective); await persist('Objective added to your map.'); location.hash = `/objective/${objective.id}`;
    } else if (type === 'edit-objective') {
      const item = state.objectives.find((objective) => objective.id === form.dataset.objectiveId); if (!item) return;
      const title = String(data.get('title')).trim();
      const description = String(data.get('description')).trim();
      if (!title) throw new FormValidationError('Write an objective before saving.', 'title');
      if (title.length > 120) throw new FormValidationError('Keep the objective to 120 characters or fewer.', 'title');
      if (description.length > 500) throw new FormValidationError('Keep the evidence statement to 500 characters or fewer.', 'description');
      item.title = title; item.description = description; item.updatedAt = now(); await persist('Objective updated.');
    } else if (type === 'prompt') {
      const timestamp = now();
      const prompt: Prompt = { id: uid(), objectiveId: form.dataset.objectiveId!, question: String(data.get('question')).trim(), answer: String(data.get('answer')).trim(), notes: String(data.get('notes')).trim(), stage: 0, dueAt: timestamp, manualDueAt: null, reviews: [], createdAt: timestamp, updatedAt: timestamp };
      if (!prompt.question || !prompt.answer) throw new FormValidationError('Add both a question and expected answer.', !prompt.question ? 'question' : 'answer');
      if (prompt.question.length > 400) throw new FormValidationError('Keep the question to 400 characters or fewer.', 'question');
      if (prompt.answer.length > 1_200) throw new FormValidationError('Keep the expected answer to 1,200 characters or fewer.', 'answer');
      if (prompt.notes.length > 200) throw new FormValidationError('Keep the review note to 200 characters or fewer.', 'notes');
      state.prompts.push(prompt); await persist('Prompt added. It is due now.');
    } else if (type === 'edit-prompt') {
      const prompt = state.prompts.find((item) => item.id === form.dataset.promptId); if (!prompt) return;
      const question = String(data.get('question')).trim();
      const answer = String(data.get('answer')).trim();
      if (!question || !answer) throw new FormValidationError('Add both a question and expected answer.', !question ? 'question' : 'answer');
      if (question.length > 400) throw new FormValidationError('Keep the question to 400 characters or fewer.', 'question');
      if (answer.length > 1_200) throw new FormValidationError('Keep the expected answer to 1,200 characters or fewer.', 'answer');
      prompt.question = question; prompt.answer = answer; prompt.updatedAt = now(); await persist('Prompt updated.');
    } else if (type === 'evidence') {
      const item = state.objectives.find((objective) => objective.id === form.dataset.objectiveId); if (!item) return;
      item.evidence.push({ id: uid(), label: String(data.get('label')).trim(), url: String(data.get('url')).trim(), createdAt: now() }); item.updatedAt = now(); await persist('Evidence attached.');
    } else if (type === 'schedule') {
      const prompt = state.prompts.find((item) => item.id === form.dataset.promptId); if (!prompt) return;
      const value = String(data.get('dueDate')); if (!value) throw new Error('Choose a review date.'); prompt.manualDueAt = dateInputToIso(value); prompt.updatedAt = now(); await persist('Manual review date set.');
    } else if (type === 'review') {
      const prompt = state.prompts.find((item) => item.id === form.dataset.promptId); if (!prompt) return;
      const correctValue = data.get('correct'); const confidenceValue = Number(data.get('confidence')) as Confidence;
      if (correctValue === null || !confidenceValue) throw new Error('Choose correctness and confidence.');
      const at = new Date(); const result = scheduleReview(prompt.stage, correctValue === 'true', confidenceValue, at);
      prompt.reviews.push({ id: uid(), at: at.toISOString(), correct: correctValue === 'true', confidence: confidenceValue, priorStage: prompt.stage, newStage: result.stage, intervalDays: result.intervalDays });
      prompt.stage = result.stage; prompt.dueAt = result.dueAt; prompt.manualDueAt = null; prompt.updatedAt = now(); activeReviewId = null; answerRevealed = false; await persist(result.explanation); restoreReviewFocus();
    } else if (type === 'export') {
      const encrypted = await encryptState(state, String(data.get('passphrase'))); download(`objective-loop-${new Date().toISOString().slice(0, 10)}.loop`, encrypted, 'application/json'); showToast('Encrypted backup downloaded.'); render();
    } else if (type === 'import') {
      const file = data.get('file'); if (!(file instanceof File) || !file.size) throw new Error('Choose an Objective Loop backup.');
      const imported = await decryptState(await file.text(), String(data.get('passphrase')));
      if (!confirm(`Replace this device's ${state.objectives.length} objectives with ${imported.objectives.length} from the backup?`)) return;
      state = validateState(imported); await persist('Backup restored on this device.'); location.hash = '/today';
    } else if (type === 'license') {
      const token = String(data.get('token')).trim(); localStorage.setItem(licenseKey, token); licenseNotice = 'Checking this license…'; render(); await verifyLicense(token, true);
    }
  } catch (error) {
    formError(form, error instanceof Error ? error.message : 'That action could not be completed.', error instanceof FormValidationError ? error.fieldName : undefined);
  }
}

app.addEventListener('submit', (event) => { const form = (event.target as HTMLElement).closest<HTMLFormElement>('form[data-form]'); if (!form) return; event.preventDefault(); void handleSubmit(form); });

document.querySelector<HTMLAnchorElement>('.skip-link')?.addEventListener('click', (event) => {
  event.preventDefault();
  app.querySelector<HTMLElement>('main')?.focus();
});

app.addEventListener('click', (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>('button, a'); if (!target) return;
  const reviewId = target.dataset.review;
  if (reviewId) {
    const triggers = [...app.querySelectorAll<HTMLElement>('[data-review]')].filter((item) => item.dataset.review === reviewId);
    reviewReturnFocus = { promptId: reviewId, index: triggers.indexOf(target) };
    activeReviewId = reviewId; answerRevealed = false; render(); return;
  }
  if (target.dataset.action === 'close-review') { target.closest<HTMLDialogElement>('dialog')?.close(); return; }
  if (target.dataset.action === 'reveal') { answerRevealed = true; render(); }
  if (target.dataset.action === 'theme') { const dark = document.documentElement.dataset.theme === 'dark'; document.documentElement.dataset.theme = dark ? 'light' : 'dark'; localStorage.setItem('objective-loop:theme', dark ? 'light' : 'dark'); }
  if (target.dataset.action === 'retry') void boot();
  if (target.dataset.action === 'reset-demo') { void resetDemo(); return; }
  if (target.dataset.action === 'start-real') { void startForReal(); return; }
  if (target.dataset.action === 'csv') { download(`objective-loop-${new Date().toISOString().slice(0, 10)}.csv`, csvExport(), 'text/csv'); showToast('Readable CSV downloaded.'); render(); }
  if (target.dataset.action === 'print') window.print();
  if (target.dataset.action === 'reload-update') location.reload();
  if (target.dataset.clearOverride) { const prompt = state.prompts.find((item) => item.id === target.dataset.clearOverride); if (prompt) { prompt.manualDueAt = null; void persist('Calculated review date restored.'); } }
  if (target.dataset.deleteEvidence) {
    const objective = state.objectives.find((item) => item.id === target.dataset.objectiveId);
    const evidence = objective?.evidence.find((item) => item.id === target.dataset.deleteEvidence);
    if (objective && evidence && confirm(`Remove evidence “${evidence.label}” from “${objective.title}”?\n\nThis removes the saved link: ${evidence.url}`)) {
      objective.evidence = objective.evidence.filter((item) => item.id !== evidence.id);
      void persist('Evidence link removed.');
    }
  }
  if (target.dataset.deletePrompt) { const prompt = state.prompts.find((item) => item.id === target.dataset.deletePrompt); if (prompt && confirm(`Delete “${prompt.question}” and its ${prompt.reviews.length} review records?`)) { state.prompts = state.prompts.filter((item) => item.id !== prompt.id); void persist('Prompt deleted.'); } }
  if (target.dataset.deleteObjective) { const objective = state.objectives.find((item) => item.id === target.dataset.deleteObjective); if (objective) { const promptCount = state.prompts.filter((item) => item.objectiveId === objective.id).length; if (confirm(`Delete “${objective.title}” and its ${promptCount} prompts? Sub-objectives will become top-level.`)) { state.prompts = state.prompts.filter((item) => item.objectiveId !== objective.id); state.objectives.forEach((item) => { if (item.parentId === objective.id) item.parentId = null; }); state.objectives = state.objectives.filter((item) => item.id !== objective.id); void persist('Objective and its prompts deleted.'); location.hash = '/objectives'; } } }
});

window.addEventListener('hashchange', render);
window.addEventListener('online', render);
window.addEventListener('offline', render);

function setupLicense(): void {
  const params = new URLSearchParams(location.search); const incoming = params.get('license');
  if (incoming) { localStorage.setItem(licenseKey, incoming); params.delete('license'); const search = params.toString(); history.replaceState({}, '', `${location.pathname}${search ? `?${search}` : ''}${location.hash}`); }
  const token = incoming || localStorage.getItem(licenseKey); const cached = JSON.parse(localStorage.getItem(verdictKey) || 'null') as { valid: boolean } | null;
  isPremium = Boolean(cached?.valid); if (token) void verifyLicense(token);
}

function setupPwa(): void {
  if (!('serviceWorker' in navigator)) return;
  let hadController = Boolean(navigator.serviceWorker.controller);
  let updatePending = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    const completedUpdate = hadController && updatePending;
    hadController = true;
    updatePending = false;
    if (completedUpdate) showUpdateReady();
  });
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').then((registration) => {
    registration.addEventListener('updatefound', () => {
      if (navigator.serviceWorker.controller) updatePending = true;
    });
  }).catch(() => { /* Core app remains available if SW registration is blocked. */ }));
}

async function boot(): Promise<void> {
  loading = true; loadError = ''; render();
  try {
    state = await loadState(storageScope);
    if (demoMode && !state.objectives.length) {
      state = sampleState();
      await saveState(state, storageScope);
    }
    loading = false; render();
  }
  catch (error) { loading = false; loadError = error instanceof Error ? error.message : 'Browser storage is unavailable.'; render(); }
}

document.documentElement.dataset.theme = localStorage.getItem('objective-loop:theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
setupLicense(); setupPwa(); void boot();
