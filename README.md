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

## Types of deployments

There are 3 types of deployments possible for GitHub/GitLab Pages. Check the necessary configurations in the repository provider before running the pipeline files.

The default deployment is forking the repository and workflows in **.github/workflows** will run. The other configuration files for other types of deployment are in folder **ci-cd**.


### Instructions

For each type of deployment and repository provider there is a pipeline/workflow available. Here are the instructions and the names of the file to be used.


1. With a backend server (`SERVER_AVAILABLE`).
     - Case GitHub: Ensure the variable `SERVER_AVAILABLE` on **.github/workflows/deploy.yml** is set to true.
     - Case GitLab: Copy the **ci-cd/.gitlab-ci.yml** file to the root folder of the project and ensure the variable `SERVER_AVAILABLE` is set to true.

            SERVER_AVAILABLE: true
            CATALOG_URL: ""

     - If you wish to change the location of the server, set environment variables according to [Connection to a backend server](#connection-to-a-back-end-server).



2. The user clones the TMC-UI repository and configures it to point to the repository where the catalog lives. (`TYPE_TMC-UI-CATALOG`).
     - See the list of mandatory [requirements](#requirements) for this case.
     - Case GitHub: On **.github/workflows/deploy.yml** you need to edit the env variables to:

         SERVER_AVAILABLE: false
         CATALOG_URL: <owner>/<repo>

     - `CATALOG_URL` value must be in the format `<owner>/<repo>`, no commas are necessary, where:
         - `<owner>` is the GitHub account/organization name that owns the repository (e.g. your GitHub username)
         - `<repo>` is the repository name (e.g. `example-catalog`)

     - Case GitLab: Copy file in **ci-cd/.gitlab-ci.yml** to the root folder and edit the env variables to:
         SERVER_AVAILABLE: "false"
         CATALOG_URL: "<owner>/<repo>"

3. The user has a repository with a catalog and wants to deploy TMC-UI in this catalog. (`TYPE_CATALOG-TMC-UI`).
     - See the list of mandatory [requirements](#requirements) for this case.
     - Case GitHub: Copy the file in **ci-cd/catalog-tmc-ui/.github/workflows/deploy-tmc-ui.yml** to your catalog repository, and place it inside the folder structure: **.github/workflows/**. Next, edit the env variables to:

            SERVER_AVAILABLE: false
            TMC-UI: wot-oss/tmc-ui

     - Ensure GitHub Pages are configured. Check the [configuration](#github-pages-configuration).
     - Case GitLab: Copy file in **ci-cd/gitlab-tmc-ui/.gitlab-ci.yml** to the root folder. Next, edit the env variables to:

            SERVER_AVAILABLE: "false"
            FRONTEND_URL: ""



### GitHub Pages configuration

- Set up GitHub Pages in the Settings section of the account, under **Settings** -> **Environments** -> **github-pages**

- Under **Deployment branches**, change from **Selected branches** to the branch you wish.

Detailed documentation can be found [here](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

The GitHub Pages workflow is defined in `.github/workflows/deploy.yml`.

### Requirements

The repository where the catalog lives must have the following requirements at the repository root:

- A folder named `.tmc`
- Inside the `.tmc` folder, the following files are required:
  - tm-catalog.toc.json
  - tmauthors.txt
  - tmmanufactures.txt
  - tmprotocols.txt

## Connection to a backend server

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
