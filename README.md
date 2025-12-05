# TMC User Interface

Open-source Web UI for TMs managed by a TMC instance. The TMC instance URL is defined in the Settings page.
The initial goal is to support only GET requests in the UI, i.e. this will not be a CLI replicated in the Web.

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

## Formating

Run to check the code sytle in errors:

    yarn format:check

To format and fix the erros:

    yarn format

## Custom theme

Customize the colors of the UI by editing CSS variables in `theme.css`. The light theme is defined under calss `:root`, and the dark theme under `.dark`. If you delete any of the defined variables, the default values will be useds. All color values must be specified in hexadecimal format.

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
