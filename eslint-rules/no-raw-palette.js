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
 * Stated plainly, because overstating the boundary is worse than a narrow rule.
 * In particular: **this rule is not a ban on the whole Tailwind palette.**
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
 * ## Where a class is reported
 *
 * Every class is reported on **its own source line**, for both shapes:
 *
 * - a template literal is split on its raw text, and
 * - a plain string literal — including a JSX `className="…"` spanning several
 *   lines — is split the same way when its raw text contains a real line break.
 *
 * An escape like `\n` inside a single-line string does not create a source line
 * and so does not split anything. A class written with escapes (say
 * `bg-slate-9\u00300`) is still detected: when the source text contains a
 * backslash, the resolved value is scanned too — on the class's own line while
 * the line counts still align, and otherwise anywhere in the resolved value.
 * That fallback can only add findings, never remove one. It is triggered by a
 * backslash rather than by "source differs from resolved", because a template's
 * resolved value normalises CRLF to LF and would otherwise re-report every
 * class in a CRLF file a second time on the literal's first line.
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
        'Disallow raw neutral/achromatic palette classes (slate, gray, zinc, neutral, stone, cyan, white, black) and colour literals; chromatic accent families are out of scope — see docs/DESIGN_SYSTEM.md',
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

    /** Report-level dedupe: one message per (line, token). */
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

    /**
     * Both literal shapes are handled identically so that "reported on its own
     * source line" means the same thing for `className="…"` and for
     * `` className={`…`} ``. `source` must be the literal's text *without* its
     * delimiters — a `Literal`'s `raw` carries its quotes, a `TemplateElement`'s
     * does not, and comparing delimited text against the value would make every
     * string look escaped.
     */
    const scanLiteral = (node, source, cooked) => {
      const { line: base, column } = node.loc.start;
      if (!source.includes('\n')) {
        // One source line: `\n` inside the text is an escape, not a line break,
        // so it stays attributed here and the resolved value is the right thing
        // to match against (it resolves any escapes).
        scan(cooked, base, column);
        return;
      }
      const sourceLines = source.split('\n');
      sourceLines.forEach((text, index) => {
        scan(text, base + index, index === 0 ? column : 0);
      });
      // A backslash escapes something, so the source text is not the class it
      // spells (`bg-slate-9\u00300`) and no source line matches it. Scan the
      // resolved value line by line as well, which keeps the class on its own
      // line. Triggering on a backslash rather than on `cooked !== source`
      // matters: a template's resolved value normalises CRLF to LF, so the two
      // differ for every CRLF file, and the fallback would then re-report every
      // class a second time on the literal's first line.
      if (source.includes('\\')) {
        const cookedLines = cooked.split('\n');
        if (cookedLines.length === sourceLines.length) {
          cookedLines.forEach((text, index) => {
            scan(text, base + index, index === 0 ? column : 0);
          });
        } else {
          // Escapes expanded into extra lines, so line alignment is gone: fall
          // back to finding the class anywhere in the resolved value.
          scan(cooked, base, column);
        }
      }
    };

    /** A string literal's text with its surrounding quotes removed. */
    const quotedContent = (raw) =>
      typeof raw === 'string' && raw.length >= 2 && /^['"]/.test(raw) ? raw.slice(1, -1) : raw;

    return {
      Literal(node) {
        if (typeof node.value !== 'string') return;
        scanLiteral(
          node,
          quotedContent(typeof node.raw === 'string' ? node.raw : '') ?? '',
          node.value
        );
      },
      TemplateElement(node) {
        const raw = node.value?.raw ?? '';
        scanLiteral(node, raw, node.value?.cooked ?? raw);
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
