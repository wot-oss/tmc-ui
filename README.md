# TMC User Interface

Open-source Web UI for TMs managed by a TMC instance. The TMC instance URL is defined in the Settings page.
The initial goal is to support only GET requests in the UI, i.e. this is not a CLI replicated in the browser.

# Development

## Prerequisites

- Node.js >= 22.20.0
- Yarn

## Setup

Install dependencies:

    yarn install

Start the development server:

    yarn dev

The app will be available at http://localhost:5173 by default.

# Deploy

This UI can be deployed as a static site or with a backend server using GitHub Pages (and/or GitLab Pages).

### Instructions - Deploy

The deployment preparation flow is handled by `deploy.sh`. It reads the deployment settings, ensures the application source is available, fetches the catalog when needed, validates the required files, and updates `vite.config.mjs` according to the selected deployment mode.

Create a `.env` file at the repository root before running the script:

    APP_REPO_URL=https://github.com/<user_or_org>/<tmc-ui-repository>.git
    CATALOG_REPO_URL=https://github.com/<user_or_org>/<catalog-repository>.git
    SERVER_AVAILABLE=false

Variables:

- `APP_REPO_URL`: repository that contains the TMC UI source code. This is only used when the current workspace does not already contain `package.json` and `src`.
- `CATALOG_REPO_URL`: repository that contains the catalog content to be copied into `public`.
- `SERVER_AVAILABLE`: must be either `true` or `false`.
  - `false`: the UI is prepared as a static deployment and reads catalog files from the contents copied into `public`
  - `true`: the UI is prepared to work with a backend server, and the build configuration is updated accordingly

Run the deployment preparation step with:

    sh deploy.sh

The script performs the following steps:

1. Loads variables from `.env` if the file exists.
2. Checks whether the current workspace already contains the UI source.
3. If the UI source is missing, clones the repository defined in `APP_REPO_URL` into a temporary folder and copies its contents into the working directory.
4. Verifies that the `public` directory exists.
5. If `public/.tmc` already exists, skips the catalog download.
6. Otherwise, clones the repository defined in `CATALOG_REPO_URL` into a temporary folder and copies its contents into `public`.
7. Validates that the catalog contains all required files under `.tmc`.
8. Updates `vite.config.mjs` so `SERVER_AVAILABLE` matches the selected deployment mode.

If `.env` is not present, `deploy.sh` falls back to these defaults:

    APP_REPO_URL=https://github.com/TejInaco/test-tmc-ui.git
    CATALOG_REPO_URL=https://github.com/TejInaco/example-catalog.git
    SERVER_AVAILABLE=false

#### GitHub Pages configuration

- Set up GitHub Pages under **Settings** -> **Environments** -> **github-pages**
- Under **Deployment branches**, select the branch that should publish the site

Detailed documentation is available [here](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

The GitHub Pages workflow for this repository is defined in `.github/workflows/fetch-files.yml`.

#### Catalog repository requirements

The catalog repository must contain a `.tmc` directory at its root.

Inside `.tmc`, the following files are required:

- `tm-catalog.toc.json`
- `tmnames.txt`
- `mpns.txt`
- `manufacturers.txt`
- `protocols.txt`

Notes:

- The catalog validation step fails if any of the required files are missing.
- The helper script removes `.git`, `.gitignore`, `.github`, and `README.md` from downloaded repositories before copying them into the workspace.
- `SERVER_AVAILABLE` only accepts the values `true` or `false`.
### Connection to a backend server

The connection to a backend server that provides the catalog can be made by creating a `.env` file with the following variables:

    VITE_API_HOST=
    VITE_API_PORT=
    VITE_API_PROTOCOL=

Or you can use the **export** command before running the application:

    export VITE_API_HOST=some_value

If no `.env` file is defined, the default value will be:

    http://localhost:8080

## Formatting

Run to check the code style for errors:
                                                                                                                                                
    yarn format:check

To format and fix the errors:

    yarn format

## Custom theme

Customize the colors of the UI by editing CSS variables in `src/theme.css`. The light theme is defined under class `:root`, and the dark theme under `.dark`. If you delete any of the defined variables, the default values will be used. All color values must be specified in hexadecimal format.

Variables (edit in `src/theme.css`):

1. Background

- `--background-primary-navbar`: navbar background (logo + page title area)
- `--background-secondary-navbar`: navbar shadow/accent
- `--background-body-primary`: page background of the page body shared by all the pages
- `--background-body-secondary`: panels/cards background

2. Inputs are all areas that can receive user inputs such as text.

- `--input-background`: input field background
- `--input-main`: input main color
- `--input-on-hover`: input background on hover
- `--input-text`: input text color
- `--input-on-focus`: input ring/background on focus

3. Buttons are all areas that have an action

- `--button-primary`: primary button background
- `--button-on-hover`: button background on hover
- `--button-on-click`: button background on click
- `--button-border`: button border color
- `--button-focus`: focus outline color

4. Border of elements

- `--border-on-hover`: generic border on hover
- `--border`: generic border

5. Color to give to the letters

- `--text-on-hover`: text color on hover
- `--text-white`: white text
- `--text-gray`: gray text
- `--text-label`: label text
- `--text-value`: value text
- `--text-highlight`: highlight background (e.g., badges)
- `--success`: success color
- `--error`: error color
