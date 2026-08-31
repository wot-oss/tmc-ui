# TMC User Interface

TMC UI is an open-source web interface for browsing Thing Models (TMs) managed by a [Thing Model Catalog (TMC)](https://github.com/wot-oss/tmc). It supports read-only catalog operations; it is not a browser replacement for the TMC CLI.

This guide is organized for three types of users:

1. [Application user](#1-application-user): run TMC UI locally against a TMC backend.
2. [DevOps user](#2-devops-user): deploy TMC UI without changing its source code.
3. [Developer](#3-developer): change, test, or extend the application.

## 1. Application user

Use this path when you want to run the UI against an existing TMC backend, with or without authentication.

### Prerequisites

- Git
- Node.js 22.20.0 or later
- Yarn 1.22.22
- A running [TMC instance](https://github.com/wot-oss/tmc) with at least one configured [Thing Model catalog](https://github.com/wot-oss/example-catalog)

### Clone and start

Clone this repository:

```sh
git clone https://github.com/wot-oss/tmc-ui.git
cd tmc-ui
```

Rename a `example.env` file in the repository root to `.env` or create a new `.env` file with your TMC deployment values.

#### Backend without authentication

```dotenv
SERVER_AVAILABLE=true
VITE_SERVER_URL=https://example.com:8080
LOCAL=true
```

#### Backend with authentication

TMC UI uses the OAuth 2.0 client credentials flow when `VITE_TOKEN_URL` is configured.

```dotenv
SERVER_AVAILABLE=true
VITE_SERVER_URL=http://localhost:8080
VITE_TOKEN_URL=https://auth.example.local/oauth/token
LOCAL=true
```

Install the dependencies, prepare the deployment, and start the development server:

```sh
yarn install
sh deploy.sh
yarn dev
```

Open the URL printed by Vite. When authentication is enabled, enter the client ID and client secret on the setup screen. Credentials are stored only for the current browser tab, and the access token is kept in memory.

`LOCAL=true` enables the Vite development proxy. Omit it when the deployed UI can contact `VITE_SERVER_URL` directly and the backend allows requests from the UI origin.

## 2. DevOps user

Use this path to deploy TMC UI by configuration only. The same scripts support a backend deployment and two static deployment layouts.

### Deployment patterns

| Pattern | Configuration | TM source |
| --- | --- | --- |
| Backend | `SERVER_AVAILABLE=true` | A running TMC API at `VITE_SERVER_URL` |
| Static, separate repositories | `SERVER_AVAILABLE=false`, with `APP_REPO_URL` and `CATALOG_REPO_URL` | Catalog cloned into `public/` during deployment |
| Static, combined repository | `SERVER_AVAILABLE=false`, with catalog files already under `public/` | Catalog shipped with the UI repository |

Static deployments do not support backend-only features such as server-side filtering or free text search.

### Environment variables

Create `.env` in the deployment working directory. Values are read by `deploy.sh` and Vite.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `SERVER_AVAILABLE` | Yes | `false` | Selects backend (`true`) or static (`false`) mode. Only these two values are supported. |
| `VITE_SERVER_URL` | Backend mode | `http://localhost:8080` for API requests | TMC API base URL. |
| `VITE_TOKEN_URL` | Authenticated backend only | None | OAuth 2.0 token endpoint. Its presence enables the client credentials screen. |
| `APP_REPO_URL` | When the working directory has no UI source | `https://github.com/wot-oss/tmc-ui.git` | Repository containing `package.json` and `src/`. |
| `CATALOG_REPO_URL` | Separate static catalog | `https://github.com/wot-oss/example-catalog.git` | Repository containing the static catalog. |
| `LOCAL` | Local development only | `false` | Uses the Vite API proxy when set to `true`. |
| `VITE_EDITDOR_URL` | No | `https://eclipse-editdor.github.io/editdor/` | Target for the **Open with EdiTDor** action. |
| `VITE_PLAYGROUND_URL` | No | `https://playground.thingweb.io/` | Target for the **Open with TD Playground** action. |
| `VITE_SETUP_CREDENTIALS_MESSAGE` | No | Empty | Operator guidance shown on the credentials screen. |

Example backend deployment:

```dotenv
SERVER_AVAILABLE=true
VITE_SERVER_URL=https://tmc.example.com
VITE_TOKEN_URL=https://auth.example.com/oauth/token
VITE_SETUP_CREDENTIALS_MESSAGE=Contact the platform team to request access.
```

Example static deployment with separate repositories:

```dotenv
APP_REPO_URL=https://github.com/wot-oss/tmc-ui.git
CATALOG_REPO_URL=https://github.com/your-org/your-catalog.git
SERVER_AVAILABLE=false
```

### Deployment scripts

Run the complete preparation flow with:

```sh
sh deploy.sh
```

The script:

1. Loads `.env`, or applies the defaults listed above.
2. Fetches `APP_REPO_URL` when `package.json` or `src/` is missing from the working directory.
3. Verifies that `public/` exists.
4. In static mode, fetches `CATALOG_REPO_URL` unless `public/.tmc/` already exists.
5. Validates the required static catalog files.

The scripts under `ci-cd/` can also be used independently:

- `ci-cd/fetchRepository.sh <repository-url> <destination>` performs a shallow clone and removes repository metadata before the files are copied into the deployment workspace.
- `ci-cd/validateRequiredFiles.sh <catalog-directory>` validates the static catalog contract.

For a complete local setup that checks Node.js and Yarn, prepares the deployment, installs dependencies, builds, and starts Vite preview, run:

```sh
sh setup-local.sh
```

### Static catalog contract

A static catalog repository must contain `.tmc/` at its root with these files:

```text
.tmc/
|-- manufacturers.txt
|-- mpns.txt
|-- protocols.txt
|-- tm-catalog.toc.json
`-- tmnames.txt
```

The catalog may also contain the Thing Model JSON files referenced by `tm-catalog.toc.json`. The deployment fails when any required file is missing.

### CI/CD

The repository provides these GitHub Actions workflows:

- `.github/workflows/fetch-files.yml` prepares and publishes the application for GitHub Pages.
- `.github/workflows/integration-tests.yml` runs deployment-mode integration tests.
- `.github/workflows/code-format.yml` checks source formatting.

For GitHub Pages, configure the `github-pages` environment under **Settings > Environments > github-pages** and select the branch that may deploy. See the [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

For GitLab Pages, call `deploy.sh` from `.gitlab-ci.yml`. Keep `ci-cd/fetchRepository.sh` and `ci-cd/validateRequiredFiles.sh` available at the paths expected by the deployment script.

## 3. Developer

Use this section when changing application behavior or contributing to the codebase.

### Development commands

```sh
yarn install          # Install dependencies
yarn dev              # Start the Vite development server
yarn build            # Create a production build
yarn test             # Run Vitest in watch mode
yarn test:coverage    # Run all tests with coverage
yarn format           # Format the repository
yarn format:check     # Check formatting without modifying files
```

The test suite is under `src/__tests__/`. Deployment tests cover the three supported patterns:

- `deployments/backend-no-auth/`
- `deployments/backend-with-auth/`
- `deployments/static/`

Tests use Vitest, jsdom, and React Testing Library. Shared test setup is in `src/__tests__/setup.ts`, and deployment helpers are in `src/__tests__/deployments/helpers.tsx`.

### Deployment selection

Vite reads the environment and defines the deployment mode consumed by the React application:

- `SERVER_AVAILABLE`: load inventory, filters, and Thing Models from the TMC API.
- `TYPE_TMC-UI-CATALOG`: load a static catalog fetched from a separate repository.
- `TYPE_CATALOG-TMC-UI`: load static catalog files already included with the UI.

Keep changes compatible with all three modes. Backend behavior lives in `src/services/apiData.ts`; static-file behavior lives in `src/services/localData.ts`.

### Authentication flow

Authentication is enabled only when backend mode, `VITE_SERVER_URL`, and `VITE_TOKEN_URL` are all configured.

1. `src/App.tsx` decides whether credentials are required and blocks catalog routes until validation succeeds.
2. `src/services/auth.ts` requests a token with the OAuth 2.0 client credentials grant.
3. `src/hooks/useClientCredentialsToken.ts` owns in-memory token state and expiry handling.
4. `src/context/AuthContext.tsx` exposes the authorization header and authentication state to the application.
5. Credentials use `sessionStorage`; the access token is never persisted in browser storage.

The Settings page allows credentials to be reviewed and replaced during the session. Stored credentials are revalidated at startup, and failed validation returns the user to the setup form.

### `postMessage` integration

The **Open with** action in `src/components/DialogAction.tsx` opens EdiTDor or TD Playground and waits for the target application to announce that it is ready.

The receiving application sends this message to its opener:

```js
window.opener?.postMessage({ type: 'APPLICATION_READY' }, '<tmc-ui-origin>');
```

TMC UI validates both `event.origin` and `event.source`, then sends:

```js
{
  type: 'LOAD_TD',
  description: '<thing-title-or-id>',
  payload: '<formatted-thing-description-json>'
}
```

The receiving application must parse `payload` as JSON. TMC UI uses the configured application's origin as the `postMessage` target and marks the action as failed if the ready message is not received within 10 seconds.

### Codebase structure

```text
src/
├── alerts/       Success and error feedback
├── components/   Reusable application and base UI components
├── context/      Authentication and filter providers
├── hooks/        Context access, token lifecycle, filters, and image loading
├── pages/        Route-level screens and data-loading layouts
├── services/     Backend API, static catalog, and authentication clients
├── utils/        Constants, string helpers, theme state, and shared utilities
└── __tests__/    Unit and deployment-mode tests
```

Service responsibilities:

- `apiData.ts` builds backend inventory queries and fetches inventory and Thing Models.
- `localData.ts` loads inventory, filters, and Thing Models from static files.
- `auth.ts` performs token requests and normalizes token expiry.

Context responsibilities:

- `AuthContext` exposes token state, the authorization header, and the active API base URL. Components access it through `useAuth`.
- `FilterContext` loads filter values from either the backend or static files and exposes them through `useFilters`.
- Shared context types and context objects are declared in `src/context/index.ts`.

### Theme architecture

Theme colors are defined as hexadecimal CSS custom properties in `src/theme.css`:

- Shared values are declared in `:root`.
- Dark defaults are declared in `:root, html.dark`.
- Light overrides are declared in `html.light`.

`tailwind.config.cjs` maps semantic Tailwind tokens directly to those variables. For example, `bg-surface-panel`, `text-text-primary`, and `border-border-default` resolve to `--color-surface-panel`, `--color-text-primary`, and `--color-border-default`. Add or change colors in `src/theme.css`, and update the Tailwind mapping only when introducing a new semantic token.

Runtime theme state is managed by `src/utils/theme.ts` and initialized from `src/main.jsx`.

## License

See [LICENSE](LICENSE).
