import type { Rule } from './types';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const ExportPanel = ({ selectedRule }: { selectedRule: Rule }) => {
  const exportAnki = async () => {
    const header = 'Front,Back,Tags\n';
    const lines = selectedRule.examples.map((ex) => {
      const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
      return `${escape(ex.english)},${escape(ex.turkish)},grammar ${selectedRule.cefrLevel} ${selectedRule.grammarCategory.replace(/\s+/g, '_')}`;
    });
    if (selectedRule.badExampleEnglish) {
      lines.push(
        `"${selectedRule.badExampleEnglish.replace(/"/g, '""')}","${(selectedRule.badExampleTurkishExplanation || selectedRule.commonMistakes).replace(/"/g, '""')}",grammar ${selectedRule.cefrLevel} mistakes`
      );
    }
    const { downloadFile } = await import('@/shared/utils/capacitor');
    await downloadFile(
      header + lines.join('\n'),
      `grammar-${selectedRule.id}-anki.csv`,
      'text/csv'
    );
  };

  const exportPDF = async () => {
    const h = escapeHtml;
    const html = `
      <!DOCTYPE html><html lang="en"><head>
      <meta charset="UTF-8"/><title>${h(selectedRule.title)} – Grammar Cheat Sheet</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 32px; max-width: 720px; margin: auto; color: #111; }
        h1 { font-size: 22px; border-bottom: 3px solid #6366f1; padding-bottom: 8px; color: #4f46e5; }
        .badge { display: inline-block; background: #e0e7ff; color: #4338ca; font-weight: 700; font-size: 11px; border-radius: 4px; padding: 2px 8px; margin-left: 8px; }
        .formula { background: #f1f5f9; border: 1px solid #6366f1; border-radius: 6px; padding: 10px 14px; font-family: monospace; font-weight: 700; font-size: 14px; color: #4f46e5; margin: 12px 0; }
        h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-top: 20px; }
        .ex { border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px 12px; margin: 6px 0; }
        .en { font-weight: 700; font-size: 13px; }
        .tr { font-size: 11px; color: #6b7280; margin-top: 2px; }
        .mistake { border-color: #fca5a5; background: #fff1f2; }
        .correct { border-color: #86efac; background: #f0fdf4; }
        @media print { body { padding: 16px; } }
      </style>
      </head><body>
      <h1>${h(selectedRule.ruleTitle || selectedRule.title)} <span class="badge">${h(selectedRule.cefrLevel)}</span></h1>
      <div class="formula">${h(selectedRule.structure)}</div>
      <p style="font-size:13px">${h(selectedRule.turkishExplanation)}</p>
      <h3>Examples</h3>
      ${selectedRule.examples.map((ex) => `<div class="ex"><div class="en">${h(ex.english)}</div><div class="tr">${h(ex.turkish)}</div></div>`).join('')}
      ${
        selectedRule.badExampleEnglish
          ? `
      <h3>Common Mistake</h3>
      <div class="ex mistake"><div class="en">✗ ${h(selectedRule.badExampleEnglish)}</div><div class="tr">${h(selectedRule.badExampleTurkishExplanation || selectedRule.commonMistakes)}</div></div>
      <div class="ex correct"><div class="en">✓ ${h(selectedRule.correctedExampleEnglish)}</div></div>`
          : ''
      }
      </body></html>`;
    const { openExternalUrl } = await import('@/shared/utils/capacitor');
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    await openExternalUrl(url);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[4px] border border-border-soft bg-surface p-3">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
        Export:
      </span>
      <button
        type="button"
        onClick={exportAnki}
        className="inline-flex items-center gap-1.5 rounded-[4px] border border-border-soft bg-background px-3 py-1.5 text-[10px] font-bold text-muted-copy hover:border-primary/40 hover:text-primary transition-all cursor-pointer"
      >
        📥 Anki CSV
      </button>
      <button
        type="button"
        onClick={exportPDF}
        className="inline-flex items-center gap-1.5 rounded-[4px] border border-border-soft bg-background px-3 py-1.5 text-[10px] font-bold text-muted-copy hover:border-primary/40 hover:text-primary transition-all cursor-pointer"
      >
        📄 PDF Sheet
      </button>
    </div>
  );
};
