# Code Style and Project Guidelines

This file describes the coding standards and project structure for the Noriture repository to help AI agents and developers maintain consistency.

## Tech Stack

- **Framework**: [Lit](https://lit.dev/) for web components.
- **Package manager:** **pnpm only** (v10+, pinned via `packageManager`). NEVER use `npm` or `yarn` commands.
- **Language:** TypeScript, ESM, `strict: true`, `verbatimModuleSyntax: true`.
- **Build Tool**: Vite.
- **Formatter**: `dprint` (not prettier) (see [dprint.json](dprint.json)).
- **Linter**: `oxlint` (not ESlint) (see [.oxlintrc.json](.oxlintrc.json)).
- **Testing**: `vitest`.
- **Backend/Platform**: Cloudflare Workers/Wrangler.

## Formatting Standards

These rules are enforced by `dprint`:

- **Indentation**: Tabs (4 characters wide).
- **Line Length**: Soft limit of 180 characters.
- **Semicolons**: Always used.
- **Quotes**: Single quotes (`'`) preferred.
- **Trailing Commas**: Never.
- **Braces**: Always required on the same line as the control flow statement.

## TypeScript Patterns

- **Branded Types**: Use the `Brand<T, Name>` pattern for IDs to ensure type safety.
- **Mime Types**: Relative imports for TypeScript files should include the `.ts` extension.
- **Verbatin Mode**: Type-only imports **must** use `import type`. A regular `import` of a type-only symbol is an error.
- **Erasable Syntax only**: No `enum`, no parameter properties (`constructor(public x)`), no namespaces. Use `const` objects + union types instead.
- **No Unchecked Access**: `arr[0]` and `record[key]` are typed `T | undefined`. Narrow before use.
- **No unused variables**: Don't leave placeholder vars. Prefix intentional unused params with `_`.

## Component Structure

- **Naming**: Custom elements use the `n-` prefix (e.g., `<n-feed-card>`).
- **Styles**: Inline CSS is usually imported with `with { type: 'css' }` and used via `unsafeCSS`.
- **Decorators**: Use standard Lit decorators (`@customElement`, `@property`, `@state`).

## File Organization

- `src/components/`: Lit components.
- `src/js/`: Business logic, utilities, and core application state.
- `src/views/`: Main page-level components linked to the router.
- `src/locales/`: I18n JSON files.

## Coding preferences

- Default to **no comments** — well-named identifiers explain _what_. Add a comment only when _why_ is non-obvious (a workaround, a constraint, a bug reference).
- Comments that add extra context to the code should be prefixed with `INFO:`
- Don't add speculative abstractions or backwards-compat shims.
- Keep changes small and concise.
- If validation or parsing is needed, it should be abstracted to self contained functions.
- First try and reuse existing parsing functions (chaining and composition is preffered). Then only if there is no equivalent parsing function add a new one.
- Prever type assertions and type guard functions. E.g.: `asserts value is T` and `value is T`.
- Match the existing file's style (tabs vs. spaces, import order) — `dprint` will normalize on save.
- Use type inference when possible. Do not add return type annotations, unless strictly requred (In `.d.ts` files, in function overloads, in type guards, and in type assertions).
- Prefer `satisfies` instead of `as` for type casting.
- Prefer interfaces over types.
- It and only if the type needed is extremally broad, such as, in a validation fucntion, use `unknown`.
- Never use the `any` type, that is forbidden by linting rules. Always try to provide a type.
- IMPORTANT: try to preserve the coding structure as much as possible.

## When in doubt

- Architecture questions: ask for confirmation.
- Out-of-scope side work: ask before expanding a task. A bug fix stays a bug fix.
