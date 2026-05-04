# MCP Demo Issues - For Testing & Verification

This document lists all intentional code issues (commented out by default) that can be uncommented for testing, verification, and MCP (Model Context Protocol) demonstrations.

## How to Use

1. Locate the issue in the code by searching for the `MCP_DEMO_*` marker.
2. Uncomment the specified lines.
3. Restart the API server.
4. Trigger the affected endpoint to observe the behavior.
5. Monitor `logs/` directory for error/performance logs.

---

## Security Issues

### 1. **MCP_DEMO_SECURITY_EVAL** — Code Injection via eval()
- **File**: `api/src/index.ts` (PUT `/api/products/:id`)
- **Risk**: Arbitrary code execution
- **Location**: Search for `MCP_DEMO_SECURITY_EVAL`
- **How to trigger**: Send a PUT request to update a product with any password
- **Expected result**: Logs output showing eval injection; potential crash or arbitrary execution
- **Log file**: `logs/{YYYY-MM-DD}/error.log` or `application.log`

```typescript
// Uncomment this:
// eval(`console.log('MCP_DEMO_EVAL_INJECTION: Password is ' + ${JSON.stringify(password)})`)
```

### 2. **MCP_DEMO_SECURITY_PASSWORD_LOGGING** — Credentials Exposed in Logs
- **File**: `api/src/index.ts` (PUT `/api/products/:id`)
- **Risk**: Password leakage in audit logs
- **Location**: Search for `MCP_DEMO_SECURITY_PASSWORD_LOGGING`
- **How to trigger**: Update a product with admin password
- **Expected result**: Admin password visible in `logs/{YYYY-MM-DD}/audit.log`
- **Log file**: `logs/{YYYY-MM-DD}/audit.log`

```typescript
// Uncomment this:
// logger.audit("Product update attempt", "admin", { password, productId: req.params.id }); // Exposes password!
```

### 3. **MCP_DEMO_SECURITY_NO_INPUT_VALIDATION** — Missing Input Validation
- **File**: `api/src/index.ts` (PUT `/api/products/:id`)
- **Risk**: Invalid/malicious data accepted without validation
- **Location**: Search for `MCP_DEMO_SECURITY_NO_INPUT_VALIDATION`
- **How to trigger**: Send negative price or non-numeric values
- **Expected result**: Accepts invalid data (e.g., negative price: -999, null inventory)
- **Log file**: `logs/{YYYY-MM-DD}/application.log`

```typescript
// Uncomment this:
// db.update(productsTable).set(update as any).where(eq(productsTable.id, parseInt(req.params.id))).run();
// return res.json({ product: update, message: "Updated (no validation)" });
```

### 4. **MCP_DEMO_SECURITY_UNSANITIZED_INPUT** — XSS via User Input
- **File**: `api/src/index.ts` (POST `/api/orders`)
- **Risk**: Cross-Site Scripting (XSS) if order data is rendered in HTML
- **Location**: Search for `MCP_DEMO_SECURITY_UNSANITIZED_INPUT`
- **How to trigger**: Place an order with name: `<script>alert('XSS')</script>`
- **Expected result**: Unsanitized HTML/JS accepted in user.name
- **Log file**: `logs/{YYYY-MM-DD}/application.log`

```typescript
// Uncomment this:
// const maliciousName = user?.name; // No sanitization, could inject HTML/JS
```

### 5. **MCP_DEMO_SECURITY_HARDCODED_PASSWORD** — Backdoor Password
- **File**: `api/src/index.ts` (POST `/api/reset-demo`)
- **Risk**: Unauthorized access via hardcoded backdoor
- **Location**: Search for `MCP_DEMO_SECURITY_HARDCODED_PASSWORD`
- **How to trigger**: Call `/api/reset-demo` with password `backdoor123`
- **Expected result**: Data reset successful without proper authorization
- **Log file**: `logs/{YYYY-MM-DD}/audit.log`

```typescript
// Uncomment this:
// const BACKDOOR_PASSWORD = "backdoor123"; // Hardcoded backdoor!
// if (password === BACKDOOR_PASSWORD) { ... }
```

---

## Performance Issues

### 6. **MCP_DEMO_PERFORMANCE_NO_PAGINATION** — Unbounded Data Retrieval
- **File**: `api/src/index.ts` (GET `/api/products`)
- **Risk**: Large payload, slow response, client memory issues
- **Location**: Search for `MCP_DEMO_PERFORMANCE_NO_PAGINATION`
- **How to trigger**: Add 1000s of products to database, then fetch `/api/products`
- **Expected result**: Full product list returned; large JSON payload; slow response
- **Monitor**: `logs/{YYYY-MM-DD}/performance.log` for slow queries
- **Measurement**: Check response time in `logs/{YYYY-MM-DD}/access.log`

```typescript
// Uncomment this:
// const allProducts = db.select().from(productsTable).all(); // Returns all without limit
```

### 7. **MCP_DEMO_PERFORMANCE_N_PLUS_ONE** — N+1 Query Problem
- **File**: `api/src/index.ts` (POST `/api/orders`)
- **Risk**: Exponential database queries
- **Location**: Search for `MCP_DEMO_PERFORMANCE_N_PLUS_ONE`
- **How to trigger**: Place order with quantity > 1
- **Expected result**: Makes `quantity` separate queries instead of 1
- **Monitor**: `logs/{YYYY-MM-DD}/performance.log` for slow operations

```typescript
// Uncomment this:
// for (let i = 0; i < quantity; i++) {
//   const [p] = db.select().from(productsTable).where(eq(productsTable.id, productId)).all();
// } // Makes separate query per quantity
```

### 8. **MCP_DEMO_PERFORMANCE_MULTIPLE_QUERIES** — Redundant Queries
- **File**: `api/src/index.ts` (PUT `/api/products/:id`)
- **Risk**: 3x database queries for 1 operation
- **Location**: Search for `MCP_DEMO_PERFORMANCE_MULTIPLE_QUERIES`
- **How to trigger**: Update a product
- **Expected result**: Multiple identical queries to fetch the same product
- **Monitor**: `logs/{YYYY-MM-DD}/performance.log`

```typescript
// Uncomment this:
// const [old] = db.select().from(productsTable).where(eq(productsTable.id, productId)).all(); // Query 1
// const [prev] = db.select().from(productsTable).where(eq(productsTable.id, productId)).all(); // Query 2
```

---

## Memory Issues

### 9. **MCP_DEMO_MEMORY_LEAK** — Unbounded Global Array
- **File**: `api/src/index.ts` (POST `/api/orders`)
- **Risk**: Memory grows unbounded; eventual heap exhaustion
- **Location**: Search for `MCP_DEMO_MEMORY_LEAK`
- **How to trigger**: Place many orders rapidly
- **Expected result**: Each order adds ~1MB to global memory; process crashes after ~100-200 orders
- **Monitor**: Check process memory usage; look for growing `logs/{YYYY-MM-DD}/performance.log` entries with high duration
- **Tool**: Monitor with `node --inspect` or `htop`

```typescript
// Uncomment this:
// (global as any).leakArray = (global as any).leakArray || [];
// (global as any).leakArray.push(new Array(1000000).fill('leak')); // Grows by 1MB per order
```

### 10. **MCP_DEMO_MEMORY_UNBOUNDED_CACHE** — Cache with No TTL/Limit
- **File**: `api/src/index.ts` (POST `/api/reset-demo`)
- **Risk**: Unbounded cache accumulation
- **Location**: Search for `MCP_DEMO_MEMORY_UNBOUNDED_CACHE`
- **How to trigger**: Call `/api/reset-demo` multiple times
- **Expected result**: Cache accumulates indefinitely; never cleared
- **Monitor**: `logs/{YYYY-MM-DD}/application.log`

```typescript
// Uncomment this:
// (global as any).dataCache = (global as any).dataCache || [];
// (global as any).dataCache.push({ timestamp: Date.now(), data: "never cleared" }); // Grows forever
```

### 11. **MCP_DEMO_NULL_POINTER** — Null Dereference
- **File**: `api/src/index.ts` (POST `/api/orders`)
- **Risk**: Application crash
- **Location**: Search for `MCP_DEMO_NULL_POINTER`
- **How to trigger**: Place any order
- **Expected result**: TypeError: Cannot read property 'foo' of null; process crash
- **Monitor**: `logs/{YYYY-MM-DD}/error.log` for stack trace

```typescript
// Uncomment this:
// let x: any = null; x.foo = 1; // Crashes when triggered
```

---

## Logging Output

### Example Log Files

**logs/{YYYY-MM-DD}/access.log**
```json
{"timestamp":"2026-04-19T14:25:00.000Z","level":"INFO","message":"GET /api/products - 200","meta":{"duration":42,"ip":"127.0.0.1"}}
{"timestamp":"2026-04-19T14:25:15.000Z","level":"INFO","message":"POST /api/orders - 200","meta":{"duration":156,"ip":"127.0.0.1"}}
```

**logs/{YYYY-MM-DD}/error.log**
```json
{"timestamp":"2026-04-19T14:26:00.000Z","level":"WARN","message":"Order failed: Product not found (id=999)","meta":{"productId":999}}
{"timestamp":"2026-04-19T14:26:15.000Z","level":"ERROR","message":"TypeError: Cannot read property 'foo' of null"}
```

**logs/{YYYY-MM-DD}/audit.log**
```json
{"timestamp":"2026-04-19T14:27:00.000Z","level":"INFO","message":"AUDIT: FAILED product update attempt by unauthorized","meta":{"productId":"5"}}
{"timestamp":"2026-04-19T14:27:15.000Z","level":"INFO","message":"AUDIT: Product update by admin","meta":{"productId":"3","fieldsUpdated":["price","inventory"]}}
```

**logs/{YYYY-MM-DD}/performance.log**
```json
{"timestamp":"2026-04-19T14:28:00.000Z","level":"WARN","message":"PERF: POST /api/orders took 256ms","meta":{"orderId":5}}
{"timestamp":"2026-04-19T14:28:15.000Z","level":"WARN","message":"PERF: GET /api/products took 512ms"}
```

---

## Testing Checklist

- [ ] All logs created in `logs/{YYYY-MM-DD}/` directory on API startup
- [ ] GET `/api/products` appears in `logs/{YYYY-MM-DD}/access.log`
- [ ] Unauthorized admin attempt appears in `logs/{YYYY-MM-DD}/audit.log` with status 401
- [ ] Slow endpoint (>100ms) appears in `logs/{YYYY-MM-DD}/performance.log`
- [ ] Frontend logs POST to `/api/logs` endpoint and write to `logs/{YYYY-MM-DD}/frontend.log`
- [ ] All 11 intentional issues are present and commented with `// MCP_DEMO_*` markers
- [ ] Uncommenting one security issue (e.g., eval) causes expected failure
- [ ] Uncommenting one performance issue shows degraded response times
- [ ] Uncommenting one memory issue causes memory growth or crash

---

## Notes

- Issues are **commented out by default** to prevent accidental enablement in production.
- Each issue is marked with a unique `MCP_DEMO_*` identifier for easy searching.
- Logs are created in `logs/{YYYY-MM-DD}/` with daily rotation.
- The `logs/` directory is gitignored to prevent committing generated log files.
- All sensitive fields (password, email, token) are masked in logs for security.
