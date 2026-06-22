# Claude Code Guidelines

## Git & Commit Workflow
- Before committing a fix, always investigate and confirm the root cause of the failure first. Do not commit prematurely.

## Testing / Locators
- Prefer accessibility-first locators (getByRole, getByLabel, getByText) over CSS/structural selectors. Don't replace a working locator with a structural one without a stated reason.
- Never wait for `networkidle` or other discouraged/deprecated APIs.

## Page Object Model
- Page objects live in `pages/`, extend `BasePage`, and expose a `path` plus behaviour methods - no assertions inside page objects.
- Shared multi-element widgets (nav bars, modals, repeated form groups) live in `components/` and are composed into page objects via their constructor.
- Wire page objects into tests through `fixtures/fixtures.ts` (extend `test` with a fixture per page object) rather than constructing them ad hoc in each test.

## Agents
- `playwright-test-planner`, `playwright-test-generator`, `playwright-test-healer` are configured under `.claude/agents/`. Use the planner to turn a target URL into a markdown plan under `specs/`, the generator to turn a plan into spec files under `tests/`, and the healer to repair failing tests.
