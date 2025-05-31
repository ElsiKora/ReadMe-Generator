# Test Directory

This directory contains all test files for the ReadMe Generator project, following clean architecture principles.

## Structure

```
test/
├── unit/              # Unit tests
│   ├── domain/        # Domain layer tests
│   ├── application/   # Application layer tests
│   └── infrastructure/ # Infrastructure layer tests
├── e2e/               # End-to-end tests
├── mocks/             # Test mocks and stubs
└── helpers/           # Test utilities and helpers
```

## Running Tests

### Unit Tests

```bash
npm run test:unit          # Run unit tests once
npm run test:unit:watch    # Run unit tests in watch mode
npm run test:unit:coverage # Run unit tests with coverage
```

### E2E Tests

```bash
npm run test:e2e          # Run end-to-end tests
```

### All Tests

```bash
npm run test:all          # Run all tests
```

## Test Configuration

- Unit tests: `vitest.unit.config.js`
- E2E tests: `vitest.e2e.config.js`

## Writing Tests

1. **Unit Tests**: Focus on testing individual units in isolation
2. **E2E Tests**: Test complete user scenarios
3. **Mocks**: Create reusable mocks in the `mocks/` directory
4. **Helpers**: Add test utilities in the `helpers/` directory
