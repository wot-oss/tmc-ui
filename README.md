# TMC User Interface

Open-source web UI for TMs managed by a TMC instance. The TMC instance URL is defined in the Settings page.
The initial goal is to support only GET requests in the UI; this is not a CLI replicated in the browser.

# Development

## Prerequisites

- Node.js >= 22.20.0
- Yarn

## Local Setup

If you wish to have a local setup, you only need to have the `setup-local.sh` file, `deploy.sh` file, a `.env` file and the `ci-cd` folder in the current folder.

Edit the `.env` file, and then run:

    sh setup-local.sh

It will automatically install, build and give a preview of the current application.

The `setup-local.sh` script does the following:

1. Checks that Node.js `>= 22.20.0` is installed.
2. Checks whether Yarn is available.
3. Runs `deploy.sh` only when the project files or catalog files still need to be prepared.
4. Runs `yarn install && yarn build && yarn preview`.

# Deploy

This UI can be deployed as a static site or with a backend server using GitHub Pages or GitLab Pages.

The deployment preparation flow is handled by `deploy.sh`. It reads the deployment settings defined in a `.env` file, ensures the application source is available, fetches the catalog when needed, validates the required files, and updates `vite.config.mjs` according to the selected deployment mode.

Inside the `ci-cd` folder are the files used by `deploy.sh`.
 - `editConfig.sh`
 - `fetchRepository.sh`
 - `validateRequiredFiles.sh`

### Workflow of deploy.sh
<img src="ci-cd/deploy_doc.drawio.png" alt="Deploy workflow" width="800" />


### Instructions


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

    APP_REPO_URL=https://github.com/wot-oss/tmc-ui.git
    CATALOG_REPO_URL=https://github.com/wot-oss/example-catalog.git
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

Notes:

- The catalog validation step fails if any of the required files are missing.
- The helper script removes `.git`, `.gitignore`, `.github`, and `README.md` from downloaded repositories before copying them into the workspace.
- `SERVER_AVAILABLE` only accepts the values `true` or `false`.


### Connection to a backend server

The connection to a backend server that provides the catalog can be configured by adding the following variables to the `.env` file:

    VITE_API_HOST=
    VITE_API_PORT=
    VITE_API_PROTOCOL=

Or you can use the **export** command before running the application:

    export VITE_API_HOST=some_value

If no `.env` file is defined, the default value will be:

    http://localhost:8080

### Other variables supported in the `.env` file

Based on the previous sections, the .env file can have the following structure:

    VITE_API_HOST=
    VITE_API_PORT=
    VITE_API_PROTOCOL=
    APP_REPO_URL=
    CATALOG_REPO_URL=
    SERVER_AVAILABLE
    VITE_EDITDOR_URL=https://eclipse-editdor.github.io/editdor/
    VITE_PLAYGROUND_URL=https://playground.thingweb.io/

`VITE_EDITDOR_URL` and `VITE_PLAYGROUND_URL` are used to configure the application behavior when the user wants to open the Thing Description in another application for editing and validation. The value of each variable defaults to the value shown above when the variable is not present in the `.env` file.


These two options are displayed in the Details page. 

The `Open with` action can integrate with an external application by using `window.postMessage`.

#### `postMessage` integration for external applications

When the user clicks **Open with** and chooses the application configured through `VITE_EDITDOR_URL`, the UI opens that application in a new window and waits for a ready message from it.

To support this flow, the receiving application must implement the following handshake:

1. After the external application finishes loading, it must send a message to the opener window:

    window.opener?.postMessage({ type: 'EDITDOR_READY' }, '<tmc-ui-origin>');

2. After that message is received, this UI sends a second message back to the external application window with the Thing Description content:

    {
      type: 'LOAD_TD',
      description: '<thing-title-or-id>',
      payload: '<thing-description-json>'
    }

Message fields:

- `type`: message identifier.
- `description`: Thing Description title when available, otherwise the Thing Description `id`.
- `payload`: the full Thing Description serialized as formatted JSON.

The receiving application must listen for the `LOAD_TD` message and parse `payload` as JSON before loading it into its editor.

Security recommendations:

- Validate `event.origin` before accepting messages.
- Reply only to the opener window that created the external application window.
- Use the origin part of the configured URLs when calling `postMessage`, not the full URL including the path.

The UI waits up to 10 seconds for the `EDITDOR_READY` message. If no ready message is received within that time, the action is marked as failed.




### Support Authentication 0AUTH2

This UI supports OAuth2 client-credentials authentication for protected catalog backends.

Use this mode when the backend requires an access token before serving catalog or Thing Model data.

#### Security warning

This authentication mode uses OAuth2 client credentials from a browser-based application.
If `VITE_CLIENT_ID` and `VITE_CLIENT_SECRET` are configured in this UI, those values are delivered to the browser at runtime and must be treated as exposed to any user who can load the application.

For that reason, this mode should only be used when the UI is deployed behind restricted access and the operational risk is explicitly accepted, for example inside a trusted internal environment, VPN, or authenticated enterprise portal with additional network and access controls.

Do not use this mode for a publicly reachable deployment or any environment where the client secret must remain confidential.

#### When authentication is used

Authentication is enabled automatically when all of the following variables are defined:

- `VITE_TOKEN_URL`
- `VITE_CLIENT_ID`
- `VITE_CLIENT_SECRET`

If these variables are not provided, the UI runs without requesting an access token.

#### How it works

When authentication is enabled, the UI sends a client-credentials token request to the configured OAuth token endpoint.
The returned access token is kept in memory and attached to backend requests as a `Bearer` authorization header.

#### Required environment variables

- `VITE_TOKEN_URL`: OAuth token endpoint used to request an access token.
- `VITE_CLIENT_ID`: OAuth client identifier used for the client-credentials flow.
- `VITE_CLIENT_SECRET`: OAuth client secret used to authenticate the client.
- `VITE_SERVER_URL`: Base URL of the protected backend server.

#### Example local configuration

Create a local `.env` file with the following keys:

    VITE_TOKEN_URL=https://auth.example.local/oauth/token
    VITE_CLIENT_ID=example-client-id
    VITE_CLIENT_SECRET=example-client-secret
    VITE_SERVER_URL=https://api.example.local


## Formatting

Run to check the code style for errors:
                                                                                                                                                
    yarn format:check

To format and fix the errors:

    yarn format

## Custom theme

Customize the colors of the UI by editing CSS variables in `src/theme.css`. The light theme is defined under selector `:root`, and the dark theme under `.dark`. If you delete any of the defined variables, the default values will be used. All color values must be specified in hexadecimal format.

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

5. Text colors

- `--text-on-hover`: text color on hover
- `--text-white`: white text
- `--text-gray`: gray text
- `--text-label`: label text
- `--text-value`: value text
- `--text-highlight`: highlight background (e.g., badges)
- `--success`: success color
- `--error`: error color
