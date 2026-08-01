import { Layers3 } from 'lucide-react';
import { PanelShell } from './shared';

const FIELD_PACKS = [
  {
    title: 'Tender passive voice',
    formula: '[Object] + shall be + V3 + by/with + standard',
    example: 'The concrete shall be poured in accordance with ASTM C94.',
  },
  {
    title: 'Binding modals',
    formula:
      'shall = requirement | must = internal rule | should = recommendation | may = permission',
    example: 'The contractor shall submit test reports before commissioning.',
  },
  {
    title: 'Risk conditionals',
    formula: 'If + present, will + base verb',
    example: 'If the load exceeds 500 kN, the beam will deflect beyond tolerance.',
  },
  {
    title: 'Root-cause past',
    formula: 'If + had + V3, would have + V3',
    example: 'If the valve had been isolated, the leak would have been prevented.',
  },
  {
    title: 'Compound adjectives',
    formula: 'number-unit noun before a noun, plural unit after be',
    example: 'Install a 50-meter cable. The cable is 50 meters long.',
  },
];

export const FieldMode = ({ setQuery }: { setQuery: (query: string) => void }) => (
  <PanelShell
    title="Engineering Grammar Field Packs"
    subtitle="Specification, risk, root-cause, and compound-adjective patterns for technical work."
    icon={Layers3}
  >
    <div className="grid gap-3 md:grid-cols-2">
      {FIELD_PACKS.map((pack) => (
        <button
          key={pack.title}
          type="button"
          onClick={() => setQuery(pack.title.split(' ')[0])}
          className="rounded-[4px] border border-border-soft bg-background p-3 text-left hover:border-primary/40"
        >
          <p className="text-xs font-black uppercase tracking-wide text-foreground">
            {pack.title}
          </p>
          <p className="mt-1 font-mono text-[11px] font-bold text-primary">{pack.formula}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-copy">{pack.example}</p>
        </button>
      ))}
    </div>
  </PanelShell>
);
