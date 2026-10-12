# CI/CD Pipeline Guide

## 🔄 GitHub Actions CI/CD Pipeline

### Pipeline Stages

#### 1. **Lint and Test**
- Runs on every push and pull request
- ESLint code quality checks
- Prettier formatting checks
- Jest unit tests
- Code coverage reporting

#### 2. **E2E Tests**
- Runs after lint/test passes
- Cypress end-to-end tests
- Tests real user flows
- Uploads screenshots/videos on failure

#### 3. **Build**
- Runs after all tests pass
- Builds application
- Uploads build artifacts

#### 4. **Deploy**
- Runs only on main branch
- Deploys to Render
- Automated deployment

---

## 🧪 Testing

### Jest (Unit Tests)

#### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

#### Write Tests
```javascript
// __tests__/server.test.js
const request = require('supertest');
const app = require('../server');

describe('Server API Tests', () => {
  test('GET / should return HTML', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });
});
```

### Cypress (E2E Tests)

#### Run E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Open Cypress GUI
npm run test:e2e:open
```

#### Write E2E Tests
```javascript
// cypress/e2e/portfolio.cy.js
describe('Portfolio E2E Tests', () => {
  it('should load the homepage', () => {
    cy.visit('/');
    cy.contains('S K Ismail');
  });
});
```

---

## 🔍 Code Quality

### ESLint

#### Run ESLint
```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

#### ESLint Rules
- Enforces code quality
- Catches common errors
- Ensures consistent style

### Prettier

#### Run Prettier
```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

#### Prettier Config
- Single quotes
- Semicolons
- 2-space indentation
- 100 character line width

---

## 🚀 Local Development

### Before Committing
```bash
# 1. Run linting
npm run lint

# 2. Format code
npm run format

# 3. Run tests
npm test

# 4. Run E2E tests (optional)
npm run test:e2e
```

### Pre-commit Hook (Optional)
Add to package.json:
```json
"husky": {
  "hooks": {
    "pre-commit": "npm run lint && npm run format:check && npm test"
  }
}
```

---

## 📊 GitHub Actions Secrets

### Required Secrets
Set these in GitHub repository settings:

1. **RENDER_API_KEY**
   - Your Render API key
   - Get from: https://dashboard.render.com/settings

2. **RENDER_SERVICE_ID**
   - Your Render service ID
   - Get from: https://dashboard.render.com

### Adding Secrets
1. Go to repository Settings
2. Click "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add each secret

---

## 🎯 Pipeline Triggers

### Automatic Triggers
- Push to `main` branch
- Push to `develop` branch
- Pull request to `main` or `develop`

### Manual Triggers
- Go to Actions tab
- Select workflow
- Click "Run workflow"

---

## 📈 Coverage Reports

### View Coverage
- Automatic upload to Codecov
- Available at: https://codecov.io/gh/your-username/repo

### Coverage Thresholds
Set in jest.config.js:
```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

---

## 🐛 Debugging Failed Workflows

### View Logs
1. Go to Actions tab
2. Click on failed workflow
3. Click on failed job
4. Expand logs

### Common Issues

#### ESLint Failures
```bash
# Fix locally
npm run lint:fix
```

#### Test Failures
```bash
# Run tests locally
npm test

# Run specific test
npm test -- server.test.js
```

#### E2E Failures
```bash
# Run Cypress locally
npm run test:e2e:open
```

---

## 📝 Best Practices

### Commit Messages
- Use conventional commits
- Examples: `feat: add CI/CD pipeline`, `fix: resolve styling issue`

### Branch Strategy
- `main` - Production
- `develop` - Development
- `feature/*` - Feature branches

### Pull Requests
- Always run tests before merging
- Ensure all checks pass
- Request code review

---

## 🔧 Customization

### Add More Tests
```bash
# Create new test file
touch __tests__/new-feature.test.js

# Create new E2E test
touch cypress/e2e/new-feature.cy.js
```

### Add More Lint Rules
Edit `.eslintrc.json`:
```json
{
  "rules": {
    "no-console": "error",
    "prefer-const": "error"
  }
}
```

### Add More Prettier Rules
Edit `.prettierrc.json`:
```json
{
  "printWidth": 80,
  "tabWidth": 4
}
```

---

## 📚 Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [Cypress Docs](https://docs.cypress.io/guides/overview/why-cypress)
- [ESLint Docs](https://eslint.org/docs/latest/)
- [Prettier Docs](https://prettier.io/docs/en/)
