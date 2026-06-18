# Standard: Testing v1.2 (EN)

> ID: STD-TEST-001
> Version: 1.2
> Level: **[C] Critical**
> Last Updated: 2026-06
> Related: STD-FE-001 (frontend), STD-ERR-001 (error handling), STD-DOC-002 (markdown), STD-META-001 (ID system)

---

## 1. Testing Pyramid

### 1.1 Layer Distribution

```text
        /\
       /  \        E2E Tests (10%)
      /    \       - Critical user flows
     /------\      - Full system integration
    /        \
   /----------\    Integration Tests (20%)
  /            \   - API endpoints
 /              \  - Database operations
/----------------\ - External services

  Unit Tests (70%)
  - Pure functions
  - Components
  - Business logic
```

### 1.2 Coverage Requirements

| Layer | Minimum Coverage | Target Coverage |
|-------|------------------|-----------------|
| Unit | 80% | 90% |
| Integration | 60% | 75% |
| E2E | Critical paths | All user flows |

---

## 2. Unit Testing

### 2.1 What to Test

**[OK] DO Test:**
- Pure functions (deterministic output)
- Business logic and calculations
- Data transformations
- Component rendering (UI)
- State management
- Edge cases and boundary conditions

**[FAIL] DON'T Test:**
- Third-party libraries (they test themselves)
- Framework internals
- Trivial getters/setters
- Generated code

### 2.2 Test Structure (AAA Pattern)

```javascript
describe('calculateDiscount', () => {
  it('should apply 10% discount for premium users', () => {
    // Arrange
    const user = { tier: 'premium', orders: 15 };
    const price = 100;

    // Act
    const result = calculateDiscount(price, user);

    // Assert
    expect(result).toBe(90);
  });

  it('should return original price for non-premium users', () => {
    // Arrange
    const user = { tier: 'regular', orders: 5 };
    const price = 100;

    // Act
    const result = calculateDiscount(price, user);

    // Assert
    expect(result).toBe(100);
  });
});
```

### 2.3 Naming Convention

```text
<unit>_<scenario>_<expectedResult>

Examples:
- calculateDiscount_premiumUser_applies10Percent
- validateEmail_emptyString_returnsFalse
- handleSubmit_validData_callsOnSuccess
- render_loadingState_showsSpinner
```

### 2.4 Mocking Guidelines

```javascript
// [OK] Good: Mock at boundaries
jest.mock('@/lib/api', () => ({
  fetchUser: jest.fn().mockResolvedValue({ id: 1, name: 'Test' })
}));

// [OK] Good: Use factory functions
const createMockUser = (overrides = {}) => ({
  id: 1,
  name: 'Test User',
  ...overrides
});

// [FAIL] Bad: Over-mocking internals
jest.mock('./utils', () => ({
  // Testing implementation details
  helper: jest.fn().mockReturnValue('mocked')
}));
```

---

## 3. Integration Testing

### 3.1 API Testing

```typescript
// tests/integration/api/users.test.ts
import { createTestServer, createTestUser } from '@/test/helpers';

describe('POST /api/users', () => {
  let server: TestServer;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(async () => {
    await server.db.clear();
  });

  it('should create user with valid data', async () => {
    const response = await server
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test' });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      email: 'test@example.com',
      name: 'Test'
    });
  });

  it('should reject duplicate email', async () => {
    await createTestUser({ email: 'existing@example.com' });

    const response = await server
      .post('/api/users')
      .send({ email: 'existing@example.com', name: 'Test' });

    expect(response.status).toBe(409);
  });
});
```

### 3.2 Database Testing

```typescript
// Use transactions for isolation
describe('UserRepository', () => {
  let tx: Transaction;

  beforeEach(async () => {
    tx = await db.beginTx();
  });

  afterEach(async () => {
    await tx.rollback();
  });

  it('should create and find user', async () => {
    const user = await tx.users.create({ email: 'test@example.com' });
    const found = await tx.users.findByEmail('test@example.com');

    expect(found).toEqual(user);
  });
});
```

### 3.3 External Services

```typescript
// Use contract testing for external APIs
describe('PaymentService', () => {
  it('should process payment', async () => {
    // Mock external service
    nock('https://api.stripe.com')
      .post('/v1/charges')
      .reply(200, { id: 'ch_123', status: 'succeeded' });

    const result = await paymentService.charge({
      amount: 1000,
      token: 'tok_test'
    });

    expect(result.status).toBe('succeeded');
  });
});
```

---

## 4. E2E Testing

### 4.1 Critical Flows (Must Test)

```text
+-----------------------------------------+
|           E2E Test Scenarios            |
+-----------------------------------------+
| 1. User Registration -> Login -> Logout   |
| 2. Product Browse -> Cart -> Checkout     |
| 3. Search -> Filter -> Results            |
| 4. Profile Update -> Save -> Verify       |
| 5. Error States -> Recovery              |
+-----------------------------------------+
```

### 4.2 Playwright Example

```typescript
// tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await login(page, 'user@test.com', 'password');
  });

  test('complete purchase flow', async ({ page }) => {
    // Add item to cart
    await page.click('[data-testid="add-to-cart"]');
    await expect(page.locator('.cart-count')).toHaveText('1');

    // Go to checkout
    await page.click('[data-testid="checkout-btn"]');
    await expect(page).toHaveURL(/\/checkout/);

    // Fill payment
    await page.fill('[name="card-number"]', '4242424242424242');
    await page.fill('[name="expiry"]', '12/25');
    await page.fill('[name="cvc"]', '123');

    // Submit
    await page.click('[data-testid="place-order"]');

    // Verify success
    await expect(page).toHaveURL(/\/order-confirmation/);
    await expect(page.locator('.order-number')).toBeVisible();
  });

  test('shows error for declined card', async ({ page }) => {
    // ... test error handling
  });
});
```

### 4.3 E2E Best Practices

| Practice | Description |
|----------|-------------|
| Use data-testid | `data-testid="submit-btn"` for stable selectors |
| Wait for state | `await expect(locator).toBeVisible()` not `waitForTimeout` |
| Isolate tests | Each test should be independent |
| Clean state | Reset DB or use test fixtures |
| Parallel runs | Configure workers for speed |

---

## 5. Test Data Management

### 5.1 Factories

```typescript
// test/factories/user.factory.ts
import { faker } from '@faker-js/faker';

export const userFactory = {
  build: (overrides = {}) => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    createdAt: new Date(),
    ...overrides
  }),

  buildMany: (count: number, overrides = {}) =>
    Array.from({ length: count }, () => userFactory.build(overrides)),

  create: async (overrides = {}) => {
    const data = userFactory.build(overrides);
    return db.users.create(data);
  }
};
```

### 5.2 Fixtures

```typescript
// test/fixtures/index.ts
export const fixtures = {
  admin: () => userFactory.create({ role: 'admin' }),
  customer: () => userFactory.create({ role: 'customer' }),

  product: () => productFactory.create(),
  order: (user, products) => orderFactory.create({ userId: user.id, products }),

  // Complex setup
  completedOrder: async () => {
    const user = await fixtures.customer();
    const product = await fixtures.product();
    return fixtures.order(user, [product]);
  }
};
```

---

## 6. CI/CD Integration

### 6.1 Pipeline Stages

```yaml
# .github/workflows/test.yml
jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3

  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:integration
    needs: unit

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
    needs: integration
```

### 6.2 Quality Gates

| Gate | Requirement | Action |
|------|-------------|--------|
| Unit Coverage | >= 80% (standard); >= 60% (Z.ai sandbox — see §11.2) | Block merge |
| New Code Coverage | >= 90% | Block merge |
| E2E Critical Paths | 100% pass | Block merge |
| Performance Tests | No regression > 10% | Warning |

**Sandbox exception:** For projects running in the Z.ai sandbox environment, the Unit Coverage gate is relaxed to 60% minimum (per §11.2). The 80% gate applies to non-sandbox (production) projects. The `DATABASE_URL` in CI must match the environment: `file:./test.db` for sandbox, full PostgreSQL for production.

---

## 7. Snapshot Testing

### 7.1 When to Use

**[OK] Good for:**
- UI component rendering
- API response structure
- Generated output

**[FAIL] Bad for:**
- Dynamic data (timestamps, UUIDs)
- Large objects (maintenance burden)

### 7.2 Example

```typescript
// React component snapshot
expect(container).toMatchSnapshot();

// API response snapshot with dynamic fields
expect(response.body).toMatchInlineSnapshot({
  id: expect.any(String),
  createdAt: expect.any(String),
  // ... static fields
});
```

---

## 8. Performance Testing

### 8.1 Load Testing

```typescript
// tests/performance/api.load.test.ts
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up
    { duration: '1m', target: 20 },   // Steady
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% under 500ms
    http_req_failed: ['rate<0.01'],   // <1% errors
  },
};

export default function () {
  const res = http.get('https://api.example.com/users');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

---

## 9. Test Quality Checklist

### Before Merging

- [ ] All existing tests pass
- [ ] New code has tests
- [ ] Coverage meets threshold
- [ ] No skipped tests without reason
- [ ] Mocks are at boundaries
- [ ] Tests are deterministic
- [ ] No hardcoded credentials
- [ ] E2E tests cover critical paths

### Code Review

- [ ] Tests are readable
- [ ] Edge cases covered
- [ ] Error paths tested
- [ ] No test interdependencies
- [ ] Descriptive test names

---

## 10. Testing Stack Recommendations

### Frontend

```text
+-- Vitest / Jest        # Unit tests
+-- React Testing Library # Component tests
+-- Playwright / Cypress  # E2E tests
+-- MSW                   # API mocking
+-- @faker-js/faker       # Test data
```

### Backend

```text
+-- Vitest / Jest        # Unit tests
+-- Supertest            # API tests
+-- Playwright           # E2E tests
+-- Nock / MSW           # External API mocking
+-- K6 / Artillery       # Load tests
```

---

## 11. Testing in Z.ai Sandbox

The Z.ai sandbox environment has specific constraints that affect testing strategy. This section provides realistic guidelines for projects developed within the sandbox.

### 11.1. Sandbox Testing Constraints

| Constraint | Impact | Mitigation |
|-----------|--------|------------|
| Dev server dies after ~5 min | E2E tests cannot rely on long-running server | Restart server before each E2E suite |
| Shared filesystem | Test databases may conflict across sessions | Use unique temp directories per session |
| No persistent processes | Watch mode unreliable | Run tests in single-run mode |
| Limited resources | Heavy test suites may timeout | Prioritize unit tests, minimize E2E |
| No headless browser by default | Playwright may need setup | Use `npx playwright install --with-deps` |

### 11.2. Adjusted Coverage Targets for Sandbox

| Layer | Standard Target | Sandbox Target | Reason |
|-------|----------------|----------------|--------|
| Unit | 80-90% | 60% minimum | Prototype/MVP stage, focus on critical paths |
| Integration | 60-75% | 40% minimum | API route testing with in-memory SQLite |
| E2E | Critical paths | Optional | Setup overhead high, manual testing acceptable |

### 11.3. Recommended Testing Workflow in Sandbox

```bash
# 1. Unit tests (fast, no server needed)
bunx vitest run --reporter=verbose

# 2. Integration tests (use test database)
DATABASE_URL="file:./test.db" bunx vitest run --config vitest.integration.ts

# 3. E2E tests (if Playwright installed)
npx playwright install --with-deps 2>/dev/null
npx playwright test
```

### 11.4. Test Database Strategy

For integration tests in sandbox, use a temporary SQLite database:

```typescript
// test/helpers/test-db.ts
import { execSync } from 'child_process'
import { existsSync, unlinkSync } from 'fs'

const TEST_DB_PATH = '/tmp/test-' + Date.now() + '.db'

export function setupTestDB() {
  process.env.DATABASE_URL = `file:${TEST_DB_PATH}`
  execSync('bunx prisma db push --skip-generate', { stdio: 'inherit' })
}

export function teardownTestDB() {
  if (existsSync(TEST_DB_PATH)) unlinkSync(TEST_DB_PATH)
  if (existsSync(TEST_DB_PATH + '-journal')) unlinkSync(TEST_DB_PATH + '-journal')
}
```

### 11.5. Pre-commit Test Check

Run unit tests before every commit (not after — to avoid committing broken code):

```bash
# Recommended git hook pattern
bunx vitest run --related src/ && git add -A && git commit -m "..."
```

### 11.6. When to Skip E2E in Sandbox

E2E tests are acceptable to skip in sandbox when:
- Project is in prototype/MVP stage
- Manual testing via browser is sufficient
- Playwright installation fails due to dependencies
- Dev server stability is insufficient for reliable test runs

Document skipped E2E with a comment in the test configuration:

```typescript
// E2E tests temporarily disabled for sandbox environment
// Re-enable when deploying to CI/CD with stable server
```

---

## 12. References

- Jest Documentation: https://jestjs.io/
- Vitest Documentation: https://vitest.dev/
- Playwright Documentation: https://playwright.dev/
- Testing Library: https://testing-library.com/
- K6 Documentation: https://k6.io/

---

## 13. Cross-References

| Standard | Relationship |
|----------|-------------|
| STD-ERR-001 | Error handling patterns to test: error boundaries, API error responses |
| STD-ERR-002 | Recovery testing: retry logic, circuit breaker, fallback mechanisms |
| STD-SEC-001 | Security testing: input validation, XSS prevention, secrets handling |
| STD-ENV-001 | Reproducibility testing: .env.example, path validation |
| STD-ENV-002 | Sandbox testing constraints (Section 11 of this standard) |
| STD-META-001 | Standard ID System: registry entry for STD-TEST-001 must be kept in sync with the version in this document's header |

---

## 13A. Known Issues and Proposed Solutions

This section documents discovered inconsistencies, missing content, and proposed corrections. Each issue has an ID, status, and proposed action. Issues resolved in the current version are marked `[RESOLVED]`; outstanding issues are marked `[OPEN]`.

### TST-001 `[RESOLVED in v1.2]` — §6.2 Quality Gates did not mention sandbox exception

**Problem:** Prior to v1.2, §6.2 (Quality Gates) listed "Unit Coverage | >= 80% | Block merge" without any reference to the sandbox exception defined in §11.2 (Adjusted Coverage Targets for Sandbox: 60% minimum). A reader landing on §6.2 would apply the 80% gate to sandbox projects, blocking merges that should pass under the sandbox policy. The two sections contradicted each other in effect, even though both were internally correct.

**Resolution:** §6.2 Quality Gates table updated:
- "Unit Coverage" row now reads ">= 80% (standard); >= 60% (Z.ai sandbox — see §11.2)".
- Added an explicit "Sandbox exception" paragraph below the table referencing §11.2 and clarifying the `DATABASE_URL` distinction.

### TST-002 `[OPEN]` — §11.2 sandbox targets are stated as policy, not derived from constraints

**Problem:** §11.2 says "Unit | 80-90% | 60% minimum | Prototype/MVP stage, focus on critical paths". The 60% figure is presented as a target, but the rationale ("Prototype/MVP stage, focus on critical paths") does not derive 60% from any concrete constraint (resource limit, time budget, code stability). A reader cannot tell whether 60% is an empirically-derived floor or an arbitrary number.

**Proposed solution:** Either (a) add a derivation: "60% is the minimum coverage at which the critical-path suite (registration, login, primary CRUD) is fully covered in a typical Z.ai sandbox Next.js project with ~30 API routes and ~15 React components. Below 60%, critical paths have visible gaps.", or (b) explicitly mark 60% as a heuristic pending empirical validation: "60% is a heuristic; teams should track their actual critical-path coverage and propose a floor based on data."

### TST-003 `[OPEN]` — §1.2 Coverage Requirements table does not include sandbox column

**Problem:** §1.2 (Coverage Requirements) lists "Minimum Coverage" and "Target Coverage" columns for Unit, Integration, and E2E layers. §11.2 (Adjusted Coverage Targets for Sandbox) adds a third column "Sandbox Target" with different values. The two tables are not unified — a reader comparing them has to mentally merge.

**Proposed solution:** Add a "Sandbox Minimum" column to the §1.2 table, populated with the §11.2 values (60% Unit, 40% Integration, "Optional" E2E). Add a note: "Sandbox minimums apply only to Z.ai sandbox projects (see §11.2 for rationale and mitigation)."

### TST-004 `[OPEN]` — §6.1 CI Pipeline example uses PostgreSQL service, but §11.4 recommends SQLite for sandbox

**Problem:** §6.1 (Pipeline Stages) shows a GitHub Actions workflow with a `postgres:15` service container for integration tests. §11.4 (Test Database Strategy) recommends a temporary SQLite database for sandbox integration tests. A team building CI for a sandbox project has two conflicting references.

**Proposed solution:** Add a note in §6.1: "The PostgreSQL service container applies to production CI. For Z.ai sandbox CI, replace the `services: postgres:` block with a `DATABASE_URL="file:./test.db"` environment variable and run `bunx prisma db push --skip-generate` before the integration tests (see §11.4)." Alternatively, split §6.1 into two examples: §6.1.1 Production CI, §6.1.2 Sandbox CI.

---

## 14. Version History

| Version | Date | Changes |
|--------|------|---------|
| 1.0 | 2025-05 | Initial version |
| 1.1 | 2026-05 | Added §11 "Testing in Z.ai Sandbox" with sandbox-specific constraints, adjusted coverage targets, test database strategy, pre-commit test check, and E2E skip guidance |
| 1.2 | 2026-06 | Fixed §6.2 Quality Gates to reference the §11.2 sandbox exception (Unit Coverage gate now reads ">= 80% (standard); >= 60% (Z.ai sandbox — see §11.2)"). Added §13A Known Issues documenting TST-001 through TST-004. Added STD-META-001 row to §13 Cross-References. |
