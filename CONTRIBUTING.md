# Contributing to Nova Rift

Thanks for helping improve Nova Rift. Issues and pull requests are welcome.

## Local setup

1. Fork the repository and create a focused branch.
2. Install dependencies with `npm ci`.
3. Run the game with `npm start` and open <http://127.0.0.1:8000>.
4. Run the browser test suite with `npm test`.

## Pull requests

- Keep each pull request focused on one behavior or improvement.
- Add or update Playwright coverage when changing gameplay, controls, or layout.
- Check both desktop and mobile layouts when changing CSS.
- Preserve the project's zero-runtime-dependency approach unless a dependency has a clear, documented benefit.
- Do not include generated test output, local captures, credentials, or machine-specific files.

The CI workflow runs the complete test suite on every pull request.

## Reporting issues

Include the browser and version, whether the issue occurs on desktop or mobile, reproduction steps, and the expected behavior. Screenshots and console errors are especially useful for rendering or input problems.
