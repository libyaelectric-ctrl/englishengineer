const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../pages/VocabularyPage.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

const returnStatement = '<div className="space-y-7 animate-in fade-in duration-300 relative pb-20">';
if (!content.includes(returnStatement)) {
    console.error('Could not find the return statement!');
    process.exit(1);
}

const before = content.split(returnStatement)[0];
const after = content.split(returnStatement)[1];

const endMarker = '    </div>\n  );\n};\n\nexport default VocabularyPage;';
if (!after.includes(endMarker)) {
    console.error('Could not find the end marker!');
    process.exit(1);
}

const middle = after.split(endMarker)[0];
const rest = after.split(endMarker)[1]; // Should be empty

const pageHeaderStart = middle.indexOf('<PageHeader title="Vocabulary">');
const pageHeaderEnd = middle.indexOf('</PageHeader>') + '</PageHeader>'.length;
const pageHeader = middle.substring(pageHeaderStart, pageHeaderEnd);

const searchResultsStart = middle.indexOf('{hasSearched && searchResults.length > 0 && (');
let searchResultsEnd = middle.indexOf('</SectionCard>\n      )}', searchResultsStart);
if (searchResultsEnd !== -1) searchResultsEnd += '</SectionCard>\n      )}'.length;
const searchResults = searchResultsStart !== -1 ? middle.substring(searchResultsStart, searchResultsEnd) : '';

const noMatchStart = middle.indexOf('{hasSearched && searchResults.length === 0 && !isSearchLoading && (');
let noMatchEnd = middle.indexOf('</SectionCard>\n      )}', noMatchStart);
if (noMatchEnd !== -1) noMatchEnd += '</SectionCard>\n      )}'.length;
const noMatch = noMatchStart !== -1 ? middle.substring(noMatchStart, noMatchEnd) : '';

const wordSetStart = middle.indexOf('<SectionCard\n        title={`${TAB_LABELS[activeTab]} 9-word set`}');
const wordSet = middle.substring(wordSetStart);

const newLayout = `<div className="flex h-full flex-col animate-in fade-in duration-300">
      \${pageHeader}

      <main className="flex-1 min-h-0">
        <div className="grid h-full lg:grid-cols-[380px_1fr] xl:grid-cols-[450px_1fr]">
          {/* LEFT PANEL */}
          <div className="flex flex-col border-r border-border-soft bg-surface/50">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 lg:p-6 space-y-6">
              \${noMatch}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="flex flex-col bg-surface">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 lg:p-8 space-y-6">
              \${searchResults}
              
              \${wordSet}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VocabularyPage;`;

fs.writeFileSync(filePath, before + newLayout, 'utf-8');
console.log('VocabularyPage layout updated!');
