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

This UI can be deployed as a static site (no UI backend server) using GitHub Pages (and/or GitLab Pages).

## Requirements

For all deployment types, the repository where the catalog lives must have the following requirements at the repository root:

- A folder named `.tmc`
- Inside the `.tmc` folder, the following files are required:
    - tm-catalog.toc.json
    - tmauthors.txt
    - tmmanufactures.txt
    - tmprotocols.txt


## Types of deployments

1) The user has a repository with a catalog and wants to deploy TMC-UI in this catalog. (`TYPE_CATALOG-TMC-UI`)


2) The user clones the TMC-UI repository and configures it to point to the repository where the catalog lives. (`TYPE_TMC-UI-CATALOG`)

In this case, the requirements are:

In this case the mandatory requirements are:
    - Setup GitHub Pages in the Settings section of the account, under **Settings** -> **Enviroments** -> **github-pages**
    - Under **Deployment branches**, change from **Selected branches** to the branch you wish.

Detail documentation can be found [here](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

The GitHub Pages workflow is defined in `.github/workflows/deploy.yml`.
Next, you need to edit the enviroment variable **REPO_URL** in deploy.yml file.

`REPO_URL` must be in the format `<owner>/<repo>`, where:

- `<owner>` is the GitHub account/organization name that owns the repository (e.g. your GitHub username)
- `<repo>` is the repository name (e.g. `example-catalog`)


## Connection to a back end server

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
