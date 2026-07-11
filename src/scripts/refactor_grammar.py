import sys
import re

file_path = 'src/pages/GrammarPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Replace the top level wrapper
text = text.replace(
    '<div className="space-y-6 animate-in fade-in duration-300">',
    '<div className="flex h-full flex-col animate-in fade-in duration-300">'
)

# 2. Find PageHeader end to insert `<main>`
ph_end = text.find('</PageHeader>') + len('</PageHeader>')

before_ph = text[:ph_end]
after_ph = text[ph_end:]

# 3. Find the Main Flowing Content
main_content_marker = '{/* Main Flowing Content */}'
main_content_start = after_ph.find(main_content_marker)

# 4. Extract the visibleRules map logic from the horizontal bar
# We will just rewrite the Left Panel to be a vertical list instead of horizontal snap-x
left_panel = """
      <main className="flex-1 min-h-0">
        <div className="grid h-full lg:grid-cols-[300px_1fr] xl:grid-cols-[350px_1fr]">
          {/* LEFT PANEL: Topic List */}
          <div className="flex flex-col border-r border-border-soft bg-surface/50">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {visibleRules.length === 0 ? (
                <div className="w-full text-center text-sm font-medium text-muted-copy py-3">
                  No rules found for the current search/tab.
                </div>
              ) : (
                visibleRules.map((rule) => {
                  const lessonNumber = rules.findIndex((item) => item.id === rule.id) + 1;
                  const isSelected = selectedRule?.id === rule.id;
                  return (
                    <button
                      key={rule.id}
                      id={`grammar-topic-${rule.id}`}
                      type="button"
                      onClick={() => setSelectedId(rule.id)}
                      className={`w-full flex flex-col rounded-xl border p-3 text-left transition-colors ${
                        isSelected 
                          ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20' 
                          : 'border-border-soft bg-surface hover:border-primary/30 hover:bg-primary/5'
                      }`}
                    >
                      <div className="min-w-0 mb-1.5">
                        <p className="text-[10px] font-bold tracking-wider text-primary">
                          LESSON {lessonNumber}
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-foreground truncate">
                          {rule.title}
                        </p>
                      </div>
                      <p className="text-[11px] font-medium text-muted-copy truncate">
                        {rule.grammarCategory}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Rule Detail */}
          <div className="flex flex-col bg-surface">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 lg:p-8">
"""

# Extract the SectionCard area
right_panel_content = after_ph[main_content_start + len(main_content_marker):]
# It currently has:
#       {selectedRule && (
#         <div className="max-w-5xl mx-auto space-y-6 mt-6 pb-20">
#           <SectionCard ...
# We want to remove the wrapper `<div className="max-w-5xl mx-auto space-y-6 mt-6 pb-20">` and just let it be.
right_panel_content = right_panel_content.replace(
    '<div className="max-w-5xl mx-auto space-y-6 mt-6 pb-20">',
    '<div className="max-w-4xl mx-auto space-y-6 pb-20">'
)

# And close the tags at the end of the file
# Currently it ends with:
#         </div>
#       )}
#     </div>
#   );
# };
right_panel_content = right_panel_content.replace(
    '        </div>\n      )}\n    </div>\n  );\n};\n',
    '        </div>\n      )}\n            </div>\n          </div>\n        </div>\n      </main>\n    </div>\n  );\n};\n'
)

new_text = before_ph + left_panel + right_panel_content

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_text)

print('GrammarPage refactored with Python!')
