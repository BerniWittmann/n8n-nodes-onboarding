// Checks the deck against the goal facts. Usage: N8N_REPO=/path/to/n8n node scripts/verify.mjs
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { load } from '@slidev/parser/fs';

const root = resolve(import.meta.dirname, '..');
const n8nRepo = process.env.N8N_REPO;
const { slides } = await load(root, join(root, 'slides.md'));
const failures = [];
const fail = (msg) => failures.push(msg);

// Slide count
if (slides.length < 35 || slides.length > 40) fail(`slide count ${slides.length} not in 35–40`);

const layoutsWithoutNotes = new Set(['cover', 'section', 'end']);
slides.forEach((slide, i) => {
	const n = i + 1;
	const content = slide.source.content;
	const layout = slide.frontmatter.layout ?? 'default';

	// Code blocks (not diagrams) stay short
	for (const [, lang, body] of content.matchAll(/```(\w*)[^\n]*\n([\s\S]*?)```/g)) {
		if (lang === 'mermaid') continue;
		const lines = body.trimEnd().split('\n').length;
		if (lines > 15) fail(`slide ${n}: ${lang} block has ${lines} lines (max 15)`);
	}

	// Speaker notes on every content slide
	if (!layoutsWithoutNotes.has(layout) && !slide.note?.trim()) fail(`slide ${n}: missing speaker notes`);
});

// SCRIPT.md has one "## N. Title" section per slide, in order
const script = readFileSync(join(root, 'SCRIPT.md'), 'utf8');
const headings = [...script.matchAll(/^## (\d+)\. /gm)].map((m) => Number(m[1]));
if (headings.length !== slides.length) fail(`SCRIPT.md has ${headings.length} sections, deck has ${slides.length}`);
headings.forEach((h, i) => h !== i + 1 && fail(`SCRIPT.md section ${i + 1} is numbered ${h}`));

// Code references resolve against the n8n repo
if (n8nRepo) {
	const text = slides.map((s) => `${s.source.content}\n${s.note ?? ''}`).join('\n');
	const refs = new Set(text.match(/(?:packages\/[\w@./-]+|(?:nodes|credentials)\/[\w./-]+\.ts)/g));
	const bases = ['', 'packages/nodes-base', 'packages/@n8n/nodes-langchain'];
	for (const ref of refs) {
		const clean = ref.replace(/[.,)]+$/, '');
		if (!bases.some((b) => existsSync(join(n8nRepo, b, clean)))) fail(`code ref not found: ${clean}`);
	}
	console.log(`checked ${refs.size} code refs`);
} else {
	console.log('N8N_REPO not set: skipped code-ref check');
}

console.log(`${slides.length} slides`);
if (failures.length) {
	console.error(failures.map((f) => `✗ ${f}`).join('\n'));
	process.exit(1);
}
console.log('✓ all checks passed');
