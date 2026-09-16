/**
 * no-raw-palette — keep one palette authority.
 *
 * The UI paints from semantic tokens (`surface`, `surface-hover`,
 * `surface-solid`, `border-soft`, `border-hover`, `foreground`, `muted-copy`,
 * `primary`, `on-solid`, `on-bright`, `scrim`, `track`). Raw Tailwind palette
 * utilities re-introduce a second authority: a theme change then has to land in
 * two places, and dark/light drift stops being detectable.
 *
 * ## What this rule polices
 *
 * Raw **neutral / achromatic** families — `slate`, `gray`, `zinc`, `neutral`,
 * `stone` — plus `cyan`, `white` and `black`, wherever they are used as a colour
 * role, across the utilities in `UTILITIES`. It also rejects hardcoded colour
 * literals inside those utilities, whether written as hex (`bg-[#d9d9e3]`) or as
 * a colour function (`bg-[rgba(0,0,0,.5)]`).
 *
 * ## What this rule deliberately does NOT police
 *
 * Stated plainly, because overstating the boundary is worse than a narrow rule:
 *
 * 1. **Chromatic accent families.** `emerald`, `amber`, `green`, `red`, `blue`,
 *    `teal`, `violet`, `orange`, `sky`, `indigo`, `pink`, `purple`, `rose`,
 *    `lime`, `yellow` and `fuchsia` are out of scope. They do have semantic
 *    equivalents (`success`, `warning`, `error`, `primary`), and the codebase
 *    still paints ~200 raw usages of them, so policing them today would need a
 *    mass migration or a wall of exemptions. This rule does not claim to cover
 *    them; moving those sites is a separate change.
 * 2. **Inline styles.** `style={{ color: '#fff' }}` is not a class and is not
 *    statically resolvable by this rule.
 * 3. **Runtime-composed class names.** `'bg-' + shade`, or a class assembled
 *    from a variable, cannot be seen statically. Only string and template
 *    literals are inspected.
 * 4. **CSS.** `src/index.css` is where the tokens are *defined*; hex values
 *    there are the palette, not a bypass of it.
 *
 * ## Exceptions
 *
 * A deliberate exception annotates exactly the line it sits on and must carry a
 * reason:
 *
 *   className="bg-gradient-to-br from-slate-300" // palette-exempt: <why>
 *
 * The comment must be on the same line as the offending class; a comment on a
 * neighbouring line exempts nothing. A directive whose reason is missing or too
 * short is reported and does not suppress the violation. A directive that
 * suppresses nothing is reported as unused, so an exemption cannot rot into a
 * silent no-op. There is no file-level switch, by design.
 */

const FAMILIES = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'cyan', 'white', 'black'];

const UTILITIES = [
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

const util = UTILITIES.join('|');
const fam = FAMILIES.join('|');

const PATTERNS = [
  // utility-family-shade/opacity, e.g. text-slate-400, hover:bg-white/20
  new RegExp(`(?<![\\w-])((?:${util})-(?:${fam})(?:-\\d{2,3})?(?:/\\d{1,3})?)(?![\\w-])`, 'g'),
  // hardcoded hex inside a colour utility, e.g. bg-[#d9d9e3]
  new RegExp(
    `(?<![\\w-])((?:${util})-\\[#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\\])`,
    'g'
  ),
  // any other colour literal in a colour utility, e.g. bg-[rgba(0,0,0,.5)], text-[oklch(0.6_0.1_250)]
  new RegExp(
    `(?<![\\w-])((?:${util})-\\[(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch|color)\\([^\\]]*\\])`,
    'g'
  ),
];

const DIRECTIVE = /palette-exempt\s*:/;
const MIN_REASON = 12;

/** The reason text after the directive's colon, with a closing block comment dropped. */
const reasonOf = (lineText) =>
  lineText
    .slice(lineText.search(DIRECTIVE))
    .replace(DIRECTIVE, '')
    .replace(/\*\/\s*$/, '')
    .trim();

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow raw Tailwind palette classes and colour literals; use the semantic colour tokens instead',
    },
    messages: {
      raw: 'Raw palette class "{{token}}" bypasses the colour tokens. Use the semantic token for this role (see docs/DESIGN_SYSTEM.md); for a genuine identity gradient annotate this exact line with a trailing "// palette-exempt: <reason>".',
      reasonless:
        'A "palette-exempt" directive must state a reason of at least {{min}} characters on the same line: "// palette-exempt: <why this raw class is correct>".',
      unused:
        'This "palette-exempt" directive exempts nothing: no raw palette class on this line. Remove it, or move it onto the line it is meant to annotate.',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const lines = sourceCode.lines;

    /** line -> the directive comment that annotates it, with its reason validity */
    const directives = new Map();
    for (const comment of sourceCode.getAllComments()) {
      if (!DIRECTIVE.test(comment.value)) continue;
      const line = comment.loc.start.line;
      const reason = reasonOf(lines[line - 1] ?? '');
      directives.set(line, { valid: reason.length >= MIN_REASON, used: false, comment });
    }

    /**
     * Report-level dedupe: one message per (line, token).
     */
    const seen = new Set();

    /**
     * Scan one line's worth of text. Reporting *per line* — rather than per
     * literal — is what makes the exemption exact: the class, the report and the
     * `palette-exempt` directive all refer to the same source line, so they can
     * never disagree. (Offset arithmetic over the cooked value is not usable
     * here: a TemplateElement's `range` starts at the backtick, so an index into
     * the value lands one character early — enough to shift a multi-line
     * template onto the wrong line.)
     */
    const scan = (text, line, column) => {
      if (typeof text !== 'string' || text.length === 0) return;
      for (const pattern of PATTERNS) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(text)) !== null) {
          const token = match[1];
          const key = `${line}:${token}`;
          if (seen.has(key)) continue;
          seen.add(key);

          const directive = directives.get(line);
          // Only a valid, same-line directive suppresses. An unusable one is
          // reported separately so the violation is still surfaced.
          if (directive?.valid) {
            directive.used = true;
            continue;
          }
          context.report({ loc: { line, column }, messageId: 'raw', data: { token } });
        }
      }
    };

    return {
      Literal(node) {
        // A plain string cannot span source lines, so every match belongs to the
        // literal's own line (escapes like `\n` do not create source lines).
        scan(node.value, node.loc.start.line, node.loc.start.column);
      },
      TemplateElement(node) {
        const raw = node.value?.raw ?? '';
        const base = node.loc.start.line;
        if (!raw.includes('\n')) {
          // Single-line element: the cooked value is the same shape as the raw
          // one and resolves any escapes.
          scan(node.value?.cooked ?? raw, base, node.loc.start.column);
          return;
        }
        // Multi-line element: split the raw text so each source line is scanned
        // (and reported) on its own.
        raw.split('\n').forEach((text, index) => {
          scan(text, base + index, index === 0 ? node.loc.start.column : 0);
        });
      },
      'Program:exit'() {
        for (const directive of directives.values()) {
          if (!directive.valid) {
            context.report({
              loc: directive.comment.loc.start,
              messageId: 'reasonless',
              data: { min: String(MIN_REASON) },
            });
          } else if (!directive.used) {
            context.report({ loc: directive.comment.loc.start, messageId: 'unused' });
          }
        }
      },
    };
  },
};

export default rule;
