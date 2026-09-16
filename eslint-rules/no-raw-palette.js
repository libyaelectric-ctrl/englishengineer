/**
 * no-raw-palette — keep one palette authority.
 *
 * The UI paints from semantic tokens (`surface`, `surface-hover`,
 * `surface-solid`, `border-soft`, `border-hover`, `foreground`, `muted-copy`,
 * `primary`, `on-solid`, `on-bright`, `scrim`, `track`). Raw Tailwind palette
 * utilities re-introduce a second authority: a theme change then has to land in
 * two places, and dark/light drift stops being detectable.
 *
 * Scope: raw neutral/accent/achromatic families wherever they are used as a
 * colour role, plus hardcoded hex colours in those same utilities. The families
 * below are the ones the token migration replaced.
 *
 * Deliberate exceptions are per line and must carry a reason:
 *
 *   className="bg-gradient-to-br from-slate-300" // palette-exempt: <why>
 *
 * A directive without a reason is itself reported, so an exemption can never be
 * silent. There is no file-level switch, by design.
 */

const DEFAULT_FAMILIES = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'cyan', 'white', 'black'];

const DEFAULT_UTILITIES = [
  'bg',
  'text',
  'border',
  'ring',
  'divide',
  'from',
  'to',
  'via',
  'fill',
  'stroke',
  'placeholder',
  'decoration',
  'outline',
  'accent',
  'caret',
  'shadow',
];

const buildPatterns = (families, utilities) => {
  const fam = families.join('|');
  const util = utilities.join('|');
  return [
    // utility-family-shade/opacity, e.g. text-slate-400, hover:bg-white/20
    new RegExp(`(?<![\\w-])((?:${util})-(?:${fam})(?:-\\d{2,3})?(?:/\\d{1,3})?)(?![\\w-])`, 'g'),
    // hardcoded hex inside a colour utility, e.g. bg-[#d9d9e3]
    new RegExp(
      `(?<![\\w-])((?:${util})-\\[#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\\])`,
      'g'
    ),
  ];
};

const EXEMPT = /palette-exempt\s*:/;
const MIN_REASON = 12;

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow raw Tailwind palette classes; use the semantic colour tokens instead',
    },
    schema: [
      {
        type: 'object',
        properties: {
          families: { type: 'array', items: { type: 'string' } },
          utilities: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      raw: 'Raw palette class "{{token}}" bypasses the colour tokens. Use the semantic token for this role (see docs/DESIGN_SYSTEM.md); for a genuine identity gradient add a trailing "// palette-exempt: <reason>".',
      reasonless:
        'A "palette-exempt" directive must state a reason: "// palette-exempt: <why this raw class is correct>".',
    },
  },

  create(context) {
    const options = context.options[0] ?? {};
    const patterns = buildPatterns(
      options.families ?? DEFAULT_FAMILIES,
      options.utilities ?? DEFAULT_UTILITIES
    );
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const lines = sourceCode.lines;

    const lineOf = (node) => node.loc?.start.line ?? 0;

    /** the reported line, plus the one above it (comment may sit on either) */
    const exemption = (line) =>
      [lines[line - 1] ?? '', lines[line - 2] ?? ''].find((l) => EXEMPT.test(l));

    const reasonIsPresent = (lineText) => {
      const idx = lineText.search(EXEMPT);
      const reason = lineText.slice(idx).replace(EXEMPT, '').trim();
      return reason.length >= MIN_REASON;
    };

    const check = (node, value) => {
      if (typeof value !== 'string' || value.length === 0) return;
      const seen = new Set();
      for (const pattern of patterns) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(value)) !== null) {
          const token = match[1];
          if (seen.has(token)) continue;
          seen.add(token);

          const line = lineOf(node);
          const exemptLine = exemption(line);
          if (exemptLine) {
            if (!reasonIsPresent(exemptLine)) {
              context.report({ node, messageId: 'reasonless' });
            }
            continue;
          }
          context.report({ node, messageId: 'raw', data: { token } });
        }
      }
    };

    return {
      Literal(node) {
        check(node, node.value);
      },
      TemplateElement(node) {
        check(node, node.value?.cooked ?? node.value?.raw);
      },
    };
  },
};

export default rule;
