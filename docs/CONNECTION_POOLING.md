# Connection Pooling Configuration

## Overview

EngineerOS uses Supabase's built-in connection pooling (PgBouncer) for efficient database connection management.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Application   │     │   PgBouncer     │
│   (Express)     │────▶│   (Supabase)    │
│                 │     │                 │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   PostgreSQL    │
                        │   (Supabase)    │
                        └─────────────────┘
```

## Supabase Pooler Configuration

### Connection Modes

| Mode | Port | Use Case |
|------|------|----------|
| Transaction | 6543 | Serverless functions, short-lived connections |
| Session | 5432 | Long-lived connections, interactive sessions |

### Current Configuration

- **Host:** `aws-0-[region].pooler.supabase.com`
- **Port:** 6543 (transaction mode)
- **Pool Mode:** Transaction
- **Max Connections:** Plan-dependent

### Backend Configuration

```javascript
// supabase-billing-repository.js
const supabase = createClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
    },
    global: {
      fetch: wrappedFetch,
    },
  }
);
```

## Best Practices

### Do's

1. **Use Transaction Mode** for serverless/short-lived connections
2. **Enable Connection Pooling** in Supabase Dashboard
3. **Monitor Connection Usage** via Supabase Dashboard → Database → Connection Pool
4. **Use Service Role** for backend operations (bypasses RLS)
5. **Set Appropriate Timeouts** for queries

### Don'ts

1. **Don't Create New Clients Per Request** - Reuse client instances
2. **Don't Use Long-Running Transactions** - Transaction mode kills idle connections
3. **Don't Bypass Pooler** in production (port 5432 requires direct connection)
4. **Don't Store Sensitive Data** in connection strings

## Monitoring

### Check Connection Usage

```sql
-- Current connections
SELECT count(*) FROM pg_stat_activity;

-- Connections by state
SELECT state, count(*) 
FROM pg_stat_activity 
GROUP BY state;

-- Connections by application
SELECT application_name, count(*) 
FROM pg_stat_activity 
GROUP BY application_name;
```

### Supabase Dashboard

- Navigate to: Database → Connection Pool
- Monitor: Active connections, idle connections, waiting queries
- Alerts: Set up alerts for high connection usage

## Troubleshooting

### Issue: Connection Exhaustion

**Symptoms:**
- `FATAL: too many connections`
- Application timeouts

**Solutions:**
1. Check for connection leaks in code
2. Increase pool size (if plan allows)
3. Optimize queries to reduce connection hold time
4. Use connection pooling mode (transaction)

### Issue: Idle Connection Timeout

**Symptoms:**
- `FATAL: connection terminated due to timeout`
- Occasional 503 errors

**Solutions:**
1. Use connection keepalive
2. Implement retry logic
3. Check PgBouncer configuration

### Issue: Transaction Conflicts

**Symptoms:**
- `FATAL: duplicate key value violates unique constraint`
- Occasional 409 errors

**Solutions:**
1. Use `ON CONFLICT` (already implemented)
2. Implement idempotent operations
3. Use optimistic locking for concurrent updates

## Performance Tuning

### Query Optimization

1. **Use Indexes:** Ensure critical queries use indexes
2. **Avoid N+1 Queries:** Use joins or batch queries
3. **Limit Result Sets:** Use `LIMIT` for large queries
4. **Use EXPLAIN ANALYZE:** Identify slow queries

### Connection Pool Tuning

| Setting | Recommended Value | Notes |
|---------|-------------------|-------|
| Pool Size | 10-20 | Depends on plan |
| Connection Timeout | 10-30 seconds | Balance between waiting and failing |
| Idle Timeout | 300-600 seconds | Free up unused connections |
| Max Client Connections | Plan-dependent | Check Supabase limits |

## Security Considerations

1. **RLS Bypass:** Service role bypasses RLS - use with caution
2. **Connection Encryption:** TLS enforced for all connections
3. **Secret Management:** Use environment variables, never hardcode
4. **Access Control:** Restrict pooler access to application servers

## Backup and Recovery

- Connection pooling is managed by Supabase
- No manual backup needed for PgBouncer config
- Recovery is automatic on Supabase infrastructure issues
