-- ─── SEED DATA ──────────────────────────────────────────────
-- Replace 'YOUR_USER_ID' with your actual Supabase auth user UUID before running.
-- This assumes you have already created an account via the app (which auto-creates a profile).

-- ─── SAMPLE PROJECTS ────────────────────────────────────────

insert into projects (id, name, description, color, created_by) values
  ('11111111-1111-1111-1111-111111111111', 'Mobile App v2.0', 'Complete redesign of the iOS and Android apps with a fresh UI, improved performance, and new onboarding flow.', 'violet', 'YOUR_USER_ID'),
  ('22222222-2222-2222-2222-222222222222', 'API Gateway', 'Unified API gateway for all microservices — rate limiting, auth middleware, request routing, and observability.', 'sky', 'YOUR_USER_ID'),
  ('33333333-3333-3333-3333-333333333333', 'Design System', 'Component library and design tokens shared across all products. Built with React and Storybook.', 'emerald', 'YOUR_USER_ID');

-- ─── ADD CREATOR AS OWNER ───────────────────────────────────

insert into project_members (project_id, user_id, role) values
  ('11111111-1111-1111-1111-111111111111', 'YOUR_USER_ID', 'owner'),
  ('22222222-2222-2222-2222-222222222222', 'YOUR_USER_ID', 'owner'),
  ('33333333-3333-3333-3333-333333333333', 'YOUR_USER_ID', 'owner');

-- ─── MOBILE APP v2.0 TASKS ──────────────────────────────────

insert into tasks (project_id, title, description, column, tag, priority, position, created_by) values
  ('11111111-1111-1111-1111-111111111111', 'Design new onboarding screens', 'Create Figma designs for 5-step onboarding flow with animations and progress indicators.', 'done', 'design', 'high', 1, 'YOUR_USER_ID'),
  ('11111111-1111-1111-1111-111111111111', 'Implement push notification service', 'Integrate Firebase Cloud Messaging for both iOS and Android. Handle permission flows.', 'done', 'feature', 'high', 2, 'YOUR_USER_ID'),
  ('11111111-1111-1111-1111-111111111111', 'Fix crash on deep link navigation', 'App crashes when opened via deep link when already in background. Reproducible on Android 13.', 'review', 'bug', 'urgent', 1, 'YOUR_USER_ID'),
  ('11111111-1111-1111-1111-111111111111', 'Add biometric authentication', 'Support Face ID and fingerprint login as an alternative to password. Use device secure storage.', 'review', 'feature', 'high', 2, 'YOUR_USER_ID'),
  ('11111111-1111-1111-1111-111111111111', 'Migrate to new API endpoints', 'Update all API calls to use the new v2 endpoints from the API Gateway project.', 'progress', 'devops', 'high', 1, 'YOUR_USER_ID'),
  ('11111111-1111-1111-1111-111111111111', 'Implement offline mode', 'Cache critical data locally using SQLite. Show stale indicator when offline.', 'progress', 'feature', 'medium', 2, 'YOUR_USER_ID'),
  ('11111111-1111-1111-1111-111111111111', 'Write E2E tests for checkout flow', 'Cover happy path and edge cases using Detox. Run in CI on every PR.', 'todo', 'feature', 'medium', 1, 'YOUR_USER_ID'),
  ('11111111-1111-1111-1111-111111111111', 'App Store metadata and screenshots', 'Update all store listings with new screenshots, feature graphic, and updated description copy.', 'todo', 'other', 'low', 2, 'YOUR_USER_ID');

-- ─── MOBILE APP DOCS ────────────────────────────────────────

insert into docs (project_id, title, content, created_by) values
  ('11111111-1111-1111-1111-111111111111', 'v2.0 Release Plan', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Mobile App v2.0 Release Plan"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Goals"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Reduce onboarding drop-off by 30%"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Improve app store rating from 3.8 to 4.5+"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Achieve 99.9% crash-free session rate"}]}]}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Timeline"}]},{"type":"paragraph","content":[{"type":"text","text":"Alpha: Week 1-2 | Beta: Week 3-4 | Production: Week 6"}]}]}', 'YOUR_USER_ID'),
  ('11111111-1111-1111-1111-111111111111', 'Deep Link Specification', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Deep Link Specification"}]},{"type":"paragraph","content":[{"type":"text","text":"All deep links follow the pattern: essence://[route]?[params]"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Supported Routes"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"essence://home — Main tab"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"essence://product/:id — Product detail"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"essence://checkout — Checkout flow"}]}]}]}]}', 'YOUR_USER_ID');

-- ─── API GATEWAY TASKS ──────────────────────────────────────

insert into tasks (project_id, title, description, column, tag, priority, position, created_by) values
  ('22222222-2222-2222-2222-222222222222', 'Design rate limiting strategy', 'Define per-user and per-IP rate limits. Document the token bucket algorithm parameters.', 'done', 'research', 'high', 1, 'YOUR_USER_ID'),
  ('22222222-2222-2222-2222-222222222222', 'Set up Kong Gateway instance', 'Deploy Kong on Kubernetes. Configure admin API and expose declarative config via Git.', 'done', 'devops', 'urgent', 2, 'YOUR_USER_ID'),
  ('22222222-2222-2222-2222-222222222222', 'Implement JWT validation plugin', 'Custom Kong plugin to validate JWTs against our auth service. Support RS256 and ES256.', 'review', 'feature', 'urgent', 1, 'YOUR_USER_ID'),
  ('22222222-2222-2222-2222-222222222222', 'Add request/response logging', 'Log all requests to DataDog with correlation IDs. Mask PII fields before logging.', 'progress', 'devops', 'high', 1, 'YOUR_USER_ID'),
  ('22222222-2222-2222-2222-222222222222', 'Configure circuit breakers', 'Add circuit breaker pattern for all upstream services. Define thresholds and fallback responses.', 'progress', 'feature', 'high', 2, 'YOUR_USER_ID'),
  ('22222222-2222-2222-2222-222222222222', 'Load test gateway at 10k RPS', 'Use k6 to simulate 10k requests/second. Identify bottlenecks and optimize worker configuration.', 'todo', 'research', 'medium', 1, 'YOUR_USER_ID'),
  ('22222222-2222-2222-2222-222222222222', 'Write runbook for incident response', 'Document escalation paths, common failure modes, and recovery procedures for on-call team.', 'todo', 'other', 'medium', 2, 'YOUR_USER_ID');

-- ─── API GATEWAY DOCS ───────────────────────────────────────

insert into docs (project_id, title, content, created_by) values
  ('22222222-2222-2222-2222-222222222222', 'Architecture Overview', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"API Gateway Architecture"}]},{"type":"paragraph","content":[{"type":"text","text":"The API Gateway acts as the single entry point for all client requests. It handles authentication, rate limiting, routing, and observability before forwarding to upstream microservices."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Components"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Kong Gateway (request routing)"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Redis (rate limit counters)"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"DataDog (observability)"}]}]}]}]}', 'YOUR_USER_ID'),
  ('22222222-2222-2222-2222-222222222222', 'Rate Limiting Policy', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Rate Limiting Policy"}]},{"type":"paragraph","content":[{"type":"text","text":"Rate limits are applied per authenticated user and per IP address for unauthenticated requests."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Limits"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Free tier: 100 req/min"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Pro tier: 1000 req/min"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Enterprise: unlimited"}]}]}]}]}', 'YOUR_USER_ID');

-- ─── DESIGN SYSTEM TASKS ────────────────────────────────────

insert into tasks (project_id, title, description, column, tag, priority, position, created_by) values
  ('33333333-3333-3333-3333-333333333333', 'Define design token structure', 'Create JSON token files for color, spacing, typography, and shadows. Follow W3C Design Token spec.', 'done', 'design', 'high', 1, 'YOUR_USER_ID'),
  ('33333333-3333-3333-3333-333333333333', 'Build Button component variants', 'Primary, secondary, ghost, danger variants. All sizes. Loading state. Full a11y support.', 'done', 'feature', 'high', 2, 'YOUR_USER_ID'),
  ('33333333-3333-3333-3333-333333333333', 'Set up Storybook with Chromatic', 'Configure Storybook 7 with auto-generated stories. Connect Chromatic for visual regression testing.', 'review', 'devops', 'medium', 1, 'YOUR_USER_ID'),
  ('33333333-3333-3333-3333-333333333333', 'Build Form components (Input, Select, Checkbox)', 'Controlled components with react-hook-form integration. Validation states and error messages.', 'progress', 'feature', 'high', 1, 'YOUR_USER_ID'),
  ('33333333-3333-3333-3333-333333333333', 'Write accessibility audit report', 'Test all components with screen reader and keyboard navigation. Document WCAG 2.1 AA compliance.', 'progress', 'research', 'medium', 2, 'YOUR_USER_ID'),
  ('33333333-3333-3333-3333-333333333333', 'Build Modal and Dialog components', 'Focus trapping, escape key, backdrop click. Animated enter/exit. Portal rendering.', 'todo', 'feature', 'medium', 1, 'YOUR_USER_ID'),
  ('33333333-3333-3333-3333-333333333333', 'Create icon library', 'Wrap Lucide icons as typed React components. Generate sprite sheet for performance.', 'todo', 'design', 'low', 2, 'YOUR_USER_ID'),
  ('33333333-3333-3333-3333-333333333333', 'Publish to npm as @company/ui', 'Set up Rollup build, generate .d.ts files, configure package.json exports map.', 'todo', 'devops', 'low', 3, 'YOUR_USER_ID');

-- ─── DESIGN SYSTEM DOCS ─────────────────────────────────────

insert into docs (project_id, title, content, created_by) values
  ('33333333-3333-3333-3333-333333333333', 'Contributing Guide', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Contributing to the Design System"}]},{"type":"paragraph","content":[{"type":"text","text":"All contributions must go through PR review. New components need Storybook stories, unit tests, and accessibility checks before merge."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Checklist"}]},{"type":"taskList","content":[{"type":"taskItem","attrs":{"checked":false},"content":[{"type":"paragraph","content":[{"type":"text","text":"Component has all required variants"}]}]},{"type":"taskItem","attrs":{"checked":false},"content":[{"type":"paragraph","content":[{"type":"text","text":"Stories cover all states"}]}]},{"type":"taskItem","attrs":{"checked":false},"content":[{"type":"paragraph","content":[{"type":"text","text":"Passes axe accessibility audit"}]}]}]}]}', 'YOUR_USER_ID'),
  ('33333333-3333-3333-3333-333333333333', 'Token Reference', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Design Token Reference"}]},{"type":"paragraph","content":[{"type":"text","text":"Tokens are the single source of truth for all visual decisions. Always use tokens — never hardcode hex values or pixel values."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Color Tokens"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"color.brand.primary — Main brand color"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"color.brand.secondary — Supporting accent"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"color.neutral.* — Gray scale"}]}]}]}]}', 'YOUR_USER_ID');
