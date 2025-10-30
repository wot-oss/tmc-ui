# TMC User Interface

Open-source Web UI for TMs managed by a TMC instance.
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

## Code Quality

### Linting:

Run ESLint to check code style and errors:

    yarn lint

Formatting:
Prettier is configured to format code on save (see .prettierrc).
