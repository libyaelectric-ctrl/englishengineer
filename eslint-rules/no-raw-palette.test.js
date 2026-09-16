/**
 * Tests for `local/no-raw-palette`.
 *
 * Two of these pin defects found by auditing the first version of the rule:
 *
 *  - "does not bleed onto the next line": an exemption used to be honoured for
 *    both the reported line *and* the line above it, so a justified comment on
 *    one line silently laundered a raw class on the following line.
 *  - "flags a colour function": only `[#rrggbb]` was matched, so
 *    `bg-[rgba(0,0,0,.5)]` slipped through.
 *
 * The valid cases at the end deliberately assert that the rule stays quiet where
 * it does not claim coverage (accent families, inline styles, runtime-composed
 * names), so the boundary in the rule's docs cannot drift from its behaviour.
 */
import { RuleTester } from 'eslint';

import rule from './no-raw-palette.js';

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

ruleTester.run('no-raw-palette', rule, {
  valid: [
    // Semantic tokens only.
    { code: "const a = 'bg-surface-solid text-foreground border-border-soft';" },

    // A deliberate exception annotating the exact offending line.
    {
      code: "const a = 'to-stone-800'; // palette-exempt: discipline identity gradient",
    },

    // The exemption is on the line the class is actually on, even when the
    // literal spans several lines.
    {
      code: 'const a = `bg-primary/10\nbg-slate-900`; // palette-exempt: discipline identity gradient',
    },

    // Arbitrary values that are not colours.
    { code: "const a = 'w-[300px] h-[calc(100%-1rem)] bg-[url(/x.png)]';" },

    // Non-palette utilities.
    { code: "const a = 'bg-primary/10 shadow-lg divide-border-soft';" },

    // --- Stated boundary: these are NOT covered, and must stay quiet. ---

    // 1. Chromatic accent families (success/warning/error roles) are out of scope.
    { code: "const a = 'bg-emerald-500 text-amber-500 hover:bg-red-600 border-blue-400';" },
    // 2. Inline style colours are not classes.
    { code: "const s = { color: '#ffffff', background: 'rgba(0,0,0,.5)' };" },
    // 3. Names composed at runtime cannot be seen statically.
    { code: "const a = 'bg-' + 'slate-900';" },
  ],

  invalid: [
    {
      code: "const a = 'bg-slate-900';",
      errors: [{ messageId: 'raw', line: 1, data: { token: 'bg-slate-900' } }],
    },
    {
      code: "const a = 'text-white bg-slate-900';",
      errors: [
        { messageId: 'raw', line: 1, data: { token: 'text-white' } },
        { messageId: 'raw', line: 1, data: { token: 'bg-slate-900' } },
      ],
    },
    {
      // Opacity form.
      code: "const a = 'bg-black/50';",
      errors: [{ messageId: 'raw', line: 1, data: { token: 'bg-black/50' } }],
    },
    {
      // The same class twice on one line is one problem, not two.
      code: "const a = 'bg-slate-900 bg-slate-900';",
      errors: [{ messageId: 'raw', line: 1, data: { token: 'bg-slate-900' } }],
    },
    {
      // Hardcoded hex.
      code: "const a = 'bg-[#d9d9e3]';",
      errors: [{ messageId: 'raw', line: 1, data: { token: 'bg-[#d9d9e3]' } }],
    },
    {
      // Colour function — the second defect this suite pins.
      code: "const a = 'bg-[rgba(0,0,0,0.5)]';",
      errors: [{ messageId: 'raw', line: 1, data: { token: 'bg-[rgba(0,0,0,0.5)]' } }],
    },
    {
      // Class strings passed to helpers / held in arrays are plain literals.
      code: "const list = ['bg-slate-900', 'from-slate-300'];",
      errors: [
        { messageId: 'raw', line: 1, data: { token: 'bg-slate-900' } },
        { messageId: 'raw', line: 1, data: { token: 'from-slate-300' } },
      ],
    },
    {
      // THE REGRESSION: an exemption must not reach the next line.
      code: "const ok = 'to-stone-800'; // palette-exempt: discipline identity gradient\nconst bad = 'bg-slate-950';",
      errors: [{ messageId: 'raw', line: 2, data: { token: 'bg-slate-950' } }],
    },
    {
      // Exact line scope inside a multi-line literal: the directive is on line
      // one and the offending class on line two of the same literal, so the old
      // "line or the line above" lookup would have exempted it. It must not.
      code: '/* palette-exempt: discipline identity gradient */ const a = `bg-primary/10\nbg-slate-900`;',
      errors: [
        { messageId: 'unused', line: 1 },
        { messageId: 'raw', line: 2, data: { token: 'bg-slate-900' } },
      ],
    },
    {
      // A reason that is too short does not buy silence, and is itself reported.
      code: "const a = 'bg-slate-900'; // palette-exempt: too short",
      errors: [
        { messageId: 'raw', line: 1, data: { token: 'bg-slate-900' } },
        { messageId: 'reasonless', line: 1 },
      ],
    },
    {
      // A directive on its own line annotates nothing.
      code: "// palette-exempt: discipline identity gradient\nconst a = 'bg-surface-solid';",
      errors: [{ messageId: 'unused', line: 1 }],
    },
    {
      // A directive left behind after the class was migrated is reported, so an
      // exemption cannot rot into a silent no-op.
      code: "const a = 'bg-surface-solid'; // palette-exempt: no longer needed here",
      errors: [{ messageId: 'unused', line: 1 }],
    },
  ],
});
