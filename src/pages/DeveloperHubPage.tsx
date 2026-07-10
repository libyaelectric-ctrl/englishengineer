/**
 * DeveloperHubPage Component
 *
 * Provides a unified control panel for B2B managers and developers:
 * 1. No-Code AI Builder - Visual workflow node designer for scenario customization.
 * 2. Template Marketplace - Catalog of pre-packaged industry-specific communication templates.
 * 3. Plugin SDK - JSON manifest validator for custom vocabulary and grammar pack distribution.
 */
import { useState } from 'react';
import {
  Code,
  Download,
  Info,
  Layers,
  Play,
  Plus,
  Save,
  Search,
  ShoppingBag,
  Sliders,
  Trash2,
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { StatusBadge } from '@/shared/components/StatusBadge';

// Mock templates data
const MARKETPLACE_TEMPLATES = [
  {
    id: 'mep-handover',
    title: 'MEP Site Handover Pro',
    category: 'Mechanical / Electrical',
    description:
      'Pre-packaged communication guides, checklists, and evaluation scenarios for building handover witnessing.',
    author: 'EngVox Core',
    level: 'B1 - C1',
    rating: 4.9,
    reviews: 142,
    installed: true,
  },
  {
    id: 'hse-safety',
    title: 'HSE Safety Standard Pack',
    category: 'Health & Safety',
    description:
      'Critical warning statements, emergency response coordination, and hazard logging drills.',
    author: 'SafetyFirst Org',
    level: 'A2 - B2',
    rating: 4.8,
    reviews: 89,
    installed: false,
  },
  {
    id: 'civil-qaqc',
    title: 'Civil Concrete QA/QC List',
    category: 'Quality Control',
    description:
      'Inspection commenting formats, non-conformance reports, and concrete testing vocabulary alignments.',
    author: 'BuildTrust QA',
    level: 'B1 - B2',
    rating: 4.7,
    reviews: 64,
    installed: false,
  },
  {
    id: 'comm-coord',
    title: 'Commissioning Coordination',
    category: 'Systems Testing',
    description:
      'Clarifying sequence, witness points, constraints, and handover issues during system startup.',
    author: 'EngVox Core',
    level: 'B2 - C2',
    rating: 5.0,
    reviews: 310,
    installed: true,
  },
];

// Workflow Node interface
interface WorkflowNode {
  id: string;
  label: string;
  type: 'trigger' | 'evaluator' | 'filter' | 'action';
  x: number;
  y: number;
  config: Record<string, string | number>;
}

const INITIAL_NODES: WorkflowNode[] = [
  {
    id: 'node-1',
    label: 'MEP Document Upload',
    type: 'trigger',
    x: 50,
    y: 120,
    config: { fileType: 'pdf', maxMB: 10 },
  },
  {
    id: 'node-2',
    label: 'Safety Policy Validator',
    type: 'filter',
    x: 240,
    y: 120,
    config: { ruleSubset: 'HSE-2026', strictness: 80 },
  },
  {
    id: 'node-3',
    label: 'AI Technical QA/QC Review',
    type: 'evaluator',
    x: 430,
    y: 120,
    config: {
      model: 'gpt-4.1-mini',
      temperature: 0.2,
      prompt: 'Review constraints and sequence.',
    },
  },
  {
    id: 'node-4',
    label: 'Scoring & Ledger Reward',
    type: 'action',
    x: 620,
    y: 120,
    config: { coinReward: 15, xpReward: 50 },
  },
];

const DeveloperHubPage = () => {
  const [activeTab, setActiveTab] = useState<'builder' | 'market' | 'sdk'>(
    'builder'
  );
  const [nodes, setNodes] = useState<WorkflowNode[]>(INITIAL_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-3');
  const [templates, setTemplates] = useState(MARKETPLACE_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');

  // SDK validation states
  const [jsonInput, setJsonInput] = useState(`{
  "id": "custom-vocab-1",
  "term": "witness point",
  "turkishMeaning": "şahitlik noktası",
  "cefrLevel": "B2",
  "domain": "electrical",
  "definition": "A critical point in the testing cycle that requires client review."
}`);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Workflow builder actions
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const handleUpdateConfig = (key: string, value: string | number) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === selectedNodeId) {
          return {
            ...node,
            config: {
              ...node.config,
              [key]: value,
            },
          };
        }
        return node;
      })
    );
  };

  const handleAddNode = () => {
    const newId = `node-${Date.now()}`;
    const newNode: WorkflowNode = {
      id: newId,
      label: 'New AI Evaluator',
      type: 'evaluator',
      x: 300,
      y: 200,
      config: { model: 'gpt-4.1-mini', prompt: 'New custom prompt template.' },
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newId);
  };

  const handleDeleteNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  // Marketplace install toggle
  const handleToggleTemplate = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return { ...t, installed: !t.installed };
        }
        return t;
      })
    );
  };

  // SDK validator
  const handleValidateJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (
        !parsed.id ||
        !parsed.term ||
        !parsed.turkishMeaning ||
        !parsed.cefrLevel
      ) {
        setValidationResult({
          success: false,
          message:
            'Validation Failed: Missing required fields (id, term, turkishMeaning, cefrLevel).',
        });
      } else {
        setValidationResult({
          success: true,
          message:
            'Validation Success: JSON complies with vocabulary term schema specifications.',
        });
      }
    } catch (err) {
      setValidationResult({
        success: false,
        message: `Parse Error: ${err instanceof Error ? err.message : 'Invalid JSON format.'}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs */}
      <div className="flex border-b border-border-soft">
        {[
          { id: 'builder', label: 'No-Code AI Builder', icon: Sliders },
          { id: 'market', label: 'Template Marketplace', icon: ShoppingBag },
          { id: 'sdk', label: 'Plugin SDK Validator', icon: Code },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-copy hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Builder Tab */}
      {activeTab === 'builder' && (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="rounded-xl border border-border-soft bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  AI Scenario Workflow Designer
                </h3>
                <p className="text-xs text-muted-copy">
                  Visually connect data nodes to configure the AI Coach
                  evaluation filters.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={handleAddNode}
                  className="gap-1 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Node
                </Button>
                <Button className="gap-1 text-xs bg-foreground text-background">
                  <Save className="h-3.5 w-3.5" /> Save Changes
                </Button>
              </div>
            </div>

            {/* Simulated Node Editor Canvas */}
            <div
              className="relative aspect-video w-full rounded-xl border border-border-soft bg-surface-hover overflow-hidden select-none"
              style={{
                backgroundImage:
                  'radial-gradient(#e2e8f0 1.2px, transparent 1.2px)',
                backgroundSize: '20px 20px',
              }}
            >
              <svg className="absolute inset-0 h-full w-full pointer-events-none">
                {/* SVG Connecting Links */}
                {nodes.map((node, index) => {
                  if (index === nodes.length - 1) return null;
                  const nextNode = nodes[index + 1];
                  return (
                    <g key={`link-${node.id}`}>
                      <path
                        d={`M ${node.x + 130} ${node.y + 25} C ${node.x + 200} ${node.y + 25}, ${nextNode.x - 70} ${nextNode.y + 25}, ${nextNode.x} ${nextNode.y + 25}`}
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        markerEnd="url(#arrow)"
                      />
                    </g>
                  );
                })}
                <defs>
                  <marker
                    id="arrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 2 L 8 5 L 0 8 z" fill="#94a3b8" />
                  </marker>
                </defs>
              </svg>

              {/* Node Cards */}
              {nodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{ left: `${node.x}px`, top: `${node.y}px` }}
                    className={`absolute w-36 rounded-lg border bg-surface p-3 shadow-sm cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 shadow-md scale-105'
                        : 'border-border-soft hover:border-border-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[8px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${
                          node.type === 'trigger'
                            ? 'bg-green-100 text-green-800'
                            : node.type === 'filter'
                              ? 'bg-amber-100 text-amber-800'
                              : node.type === 'evaluator'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {node.type}
                      </span>
                      {nodes.length > 2 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNode(node.id);
                          }}
                          className="text-muted-copy hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-xs font-semibold text-foreground line-clamp-1">
                      {node.label}
                    </p>
                    <p className="mt-1 text-[9px] text-muted-copy line-clamp-1">
                      {node.type === 'evaluator'
                        ? node.config.model
                        : Object.keys(node.config)[0]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side Configuration Panel */}
          <div className="rounded-xl border border-border-soft bg-surface p-5">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="border-b border-border-soft pb-3">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Node Configuration
                  </h4>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {selectedNode.label}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-copy">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={selectedNode.label}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNodes((prev) =>
                          prev.map((n) =>
                            n.id === selectedNode.id ? { ...n, label: val } : n
                          )
                        );
                      }}
                      className="mt-1.5 h-9 w-full rounded-lg border border-border-soft bg-surface px-3 text-xs outline-none"
                    />
                  </div>

                  {Object.entries(selectedNode.config).map(([key, val]) => (
                    <div key={key}>
                      <label className="text-xs font-medium text-muted-copy capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </label>
                      {key === 'prompt' ? (
                        <textarea
                          value={val as string}
                          onChange={(e) =>
                            handleUpdateConfig(key, e.target.value)
                          }
                          rows={4}
                          className="mt-1.5 w-full rounded-lg border border-border-soft bg-surface p-3 text-xs outline-none"
                        />
                      ) : key === 'model' ? (
                        <select
                          value={val as string}
                          onChange={(e) =>
                            handleUpdateConfig(key, e.target.value)
                          }
                          className="mt-1.5 h-9 w-full rounded-lg border border-border-soft bg-surface px-3 text-xs outline-none"
                        >
                          <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                          <option value="gpt-4">gpt-4</option>
                          <option value="mock">mock-provider</option>
                        </select>
                      ) : (
                        <input
                          type={typeof val === 'number' ? 'number' : 'text'}
                          value={val}
                          onChange={(e) =>
                            handleUpdateConfig(
                              key,
                              typeof val === 'number'
                                ? Number(e.target.value)
                                : e.target.value
                            )
                          }
                          className="mt-1.5 h-9 w-full rounded-lg border border-border-soft bg-surface px-3 text-xs outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t border-border-soft pt-3 flex gap-2">
                  <Button
                    variant="ghost"
                    className="flex-1 text-xs border border-border-soft"
                  >
                    <Play className="h-3.5 w-3.5 mr-1" /> Dry Run Node
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Sliders className="mx-auto h-8 w-8 text-muted-copy" />
                <p className="mt-3 text-sm font-medium text-foreground">
                  Select a node
                </p>
                <p className="mt-1.5 text-xs text-muted-copy">
                  Click any node on the designer canvas to configure its
                  properties and rules.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Marketplace Tab */}
      {activeTab === 'market' && (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-copy" />
              <input
                type="text"
                placeholder="Search communication packs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-border-soft bg-surface pl-10 pr-4 text-sm outline-none focus:border-border-hover"
              />
            </div>
            <div className="flex gap-2">
              <StatusBadge label="MEP Curated" tone="info" />
              <StatusBadge label="B2B Verified" tone="success" />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {templates
              .filter((t) =>
                t.title.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((template) => (
                <article
                  key={template.id}
                  className="rounded-xl border border-border-soft bg-surface p-5 flex flex-col justify-between min-h-56"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                        {template.category}
                      </span>
                      <StatusBadge
                        label={template.installed ? 'Installed' : 'Available'}
                        tone={template.installed ? 'success' : 'neutral'}
                      />
                    </div>
                    <h4 className="mt-2 text-base font-semibold text-foreground">
                      {template.title}
                    </h4>
                    <p className="mt-2 text-xs leading-5 text-muted-copy">
                      {template.description}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-border-soft pt-4 flex items-center justify-between gap-3">
                    <div className="text-xs text-muted-copy">
                      <span>By {template.author}</span>
                      <span className="mx-2">•</span>
                      <span>Target: {template.level}</span>
                    </div>

                    <Button
                      variant={template.installed ? 'ghost' : 'primary'}
                      onClick={() => handleToggleTemplate(template.id)}
                      className={`text-xs h-9 ${template.installed ? 'text-rose-600 hover:bg-rose-50' : 'bg-foreground text-background'}`}
                    >
                      {template.installed ? 'Remove Pack' : 'Install Pack'}
                    </Button>
                  </div>
                </article>
              ))}
          </div>
        </div>
      )}

      {/* SDK Tab */}
      {activeTab === 'sdk' && (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-xl border border-border-soft bg-surface p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Vocabulary Plugin SDK
              </h3>
              <p className="mt-1 text-xs text-muted-copy leading-5">
                Pack custom vocabulary lists to distribute inside your
                organization. Paste your plugin manifest details below to
                validate the integrity structure.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-foreground">
                JSON Manifest Code
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  rows={10}
                  className="mt-2 w-full rounded-lg border border-border-soft bg-surface-hover p-4 text-xs font-mono outline-none"
                />
              </label>

              <div className="flex gap-2">
                <Button
                  onClick={handleValidateJson}
                  className="bg-foreground text-background text-xs"
                >
                  <Layers className="h-3.5 w-3.5 mr-1" /> Validate JSON Syntax
                </Button>
                <a
                  href="data:text/json;charset=utf-8,%7B%22manifestVersion%22%3A1%2C%22terms%22%3A%5B%5D%7D"
                  download="vocabulary-plugin-template.json"
                  className="inline-flex items-center gap-1.5 border border-border-soft bg-surface px-4 rounded-lg text-xs font-medium hover:bg-surface-hover"
                >
                  <Download className="h-3.5 w-3.5" /> Download SDK Template
                </a>
              </div>

              {validationResult && (
                <div
                  className={`rounded-lg border p-4 text-xs leading-5 ${
                    validationResult.success
                      ? 'border-green-200 bg-green-50 text-green-800'
                      : 'border-rose-200 bg-rose-50 text-rose-800'
                  }`}
                >
                  <div className="flex gap-2 items-start">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>{validationResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SDK Documentation */}
          <div className="rounded-xl border border-border-soft bg-surface p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Plugin Packaging Guidelines
            </h3>
            <p className="text-xs text-muted-copy leading-5">
              Follow these structural rules when bundling your custom vocabulary
              files for EngVox integration:
            </p>

            <div className="space-y-3.5">
              {[
                {
                  title: 'Strict Unique Identifiers',
                  desc: 'Each term id must prefix with your corporate namespace (e.g. corp_elec_001).',
                },
                {
                  title: 'Turkish Alignment translation',
                  desc: 'Ensure turkishMeaning provides correct technical context alignment rather than simple dictionary mapping.',
                },
                {
                  title: 'Metadata tags and domain keys',
                  desc: 'Declare correct discipline keys (e.g. MEP, QA-QC, HSE) so the recommendation engine prioritizes correctly.',
                },
              ].map((rule, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      {rule.title}
                    </h4>
                    <p className="mt-0.5 text-xs text-muted-copy leading-4">
                      {rule.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperHubPage;
