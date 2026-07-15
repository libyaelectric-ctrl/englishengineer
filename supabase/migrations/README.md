# Database Migration Strategy

## Directory Structure

```
supabase/
├── migrations/
│   ├── 20240101000000_initial_schema.sql
│   ├── 20240115000000_add_vocabulary_tables.sql
│   ├── 20240201000000_add_billing_tables.sql
│   └── README.md
├── seed.sql
└── config.toml
```

## Migration Naming Convention

Format: `YYYYMMDDHHMMSS_description.sql`

Examples:
- `20240101000000_initial_schema.sql`
- `20240115000000_add_vocabulary_progress_index.sql`

## Creating New Migrations

### Option 1: Supabase CLI (Recommended)
```bash
supabase migration new add_feature_name
# Edit the generated file in supabase/migrations/
supabase db push
```

### Option 2: Manual
1. Create new file in `supabase/migrations/`
2. Follow naming convention
3. Write forward SQL only (no rollback)
4. Test locally with `supabase start`

## Migration Rules

### DO:
- Use `IF NOT EXISTS` for idempotency
- Add indexes for frequently queried columns
- Use `created_at` and `updated_at` timestamps
- Add RLS policies for new tables
- Test migrations locally before pushing

### DON'T:
- Drop columns without checking dependencies
- Rename columns (add new, migrate data, drop old)
- Use `DROP TABLE` in production migrations
- Skip RLS policies

## RLS Policy Template

```sql
-- Enable RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY "Users can read own data"
  ON your_table FOR SELECT
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert
CREATE POLICY "Users can insert own data"
  ON your_table FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update own data
CREATE POLICY "Users can update own data"
  ON your_table FOR UPDATE
  USING (auth.uid() = user_id);
```

## Rollback Strategy

Since Supabase doesn't support rollback migrations:
1. Always backup before major migrations
2. Write reversible SQL when possible
3. Keep migration history in git
4. Test on staging environment first

## Verification

After running migrations:
```bash
# Verify schema
supabase db dump --schema-only > schema.sql

# Check for RLS
psql -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT IN (SELECT tablename FROM pg_policies WHERE schemaname = 'public');"
```
