import sys

file_path = 'src/pages/VocabularyPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

parts = text.split('      </PageHeader>')
if len(parts) != 2:
    print('Failed to split at PageHeader')
    sys.exit(1)

before = parts[0] + '      </PageHeader>\n\n      <main className="flex-1 min-h-0">\n        <div className="grid h-full lg:grid-cols-[380px_1fr] xl:grid-cols-[450px_1fr]">\n          <div className="flex flex-col border-r border-border-soft bg-surface/50">\n            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 lg:p-6 space-y-6">'

after = parts[1]

search_results_start = after.find('{hasSearched && searchResults.length > 0 && (')
if search_results_start == -1:
    print('Could not find search results start')
    sys.exit(1)

left_panel_content = after[:search_results_start]
right_panel_content = after[search_results_start:]

right_panel_content = right_panel_content.replace('    </div>\n  );\n};\n', '            </div>\n          </div>\n        </div>\n      </main>\n    </div>\n  );\n};\n')

new_text = before + left_panel_content + '            </div>\n          </div>\n\n          <div className="flex flex-col bg-surface">\n            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 lg:p-8 space-y-6">\n' + right_panel_content

new_text = new_text.replace('<div className="space-y-7 animate-in fade-in duration-300 relative pb-20">', '<div className="flex h-full flex-col animate-in fade-in duration-300">')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_text)

print('VocabularyPage refactored with Python!')
