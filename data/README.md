# Data Directory

This directory is used by the import/verify scripts for vocabulary and grammar databases.

## Setup

1. Copy the Excel files from the project root `database/` folder:
   - `EngineerOS_Vocabulary_Database.xlsx` → rename to `data/import/EngineerOS_Vocabulary_Database_Final.xlsx`
   - `EngineerOS_Grammar_Database.xlsx` → rename to `data/import/EngineerOS_Grammar_Database_Final.xlsx`

2. Run the import scripts:
   ```bash
   npm run import:vocabulary
   npm run import:grammar
   ```

3. Verify the data:
   ```bash
   npm run verify:vocabulary
   npm run verify:grammar
   npm run verify:learning-data
   ```

## Directory Structure

```
data/
├── import/                          # Place Excel source files here
│   ├── EngineerOS_Vocabulary_Database_Final.xlsx
│   └── EngineerOS_Grammar_Database_Final.xlsx
├── canonical/                       # Generated normalized JSON output
│   ├── vocabulary/
│   │   ├── vocabulary.normalized.json
│   │   ├── vocabulary-validation-report.json
│   │   └── vocabulary-taxonomy.json
│   └── grammar/
│       ├── grammar-rules.normalized.json
│       ├── grammar-validation-report.json
│       └── grammar-taxonomy.json
└── README.md
```
