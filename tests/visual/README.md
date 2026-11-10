# Visual review

The pull request workflow builds the exact base and head commits and uploads a `visual-review-<head SHA>` artifact containing `index.html`, screenshots, and pixel diffs. Download and unpack the artifact to open the report. The browser image and JavaScript dependencies are pinned; the viewport, timezone, clock, calendar response, reduced motion, and network access are fixed. Screenshots use locally available fonts only.

The original base predates the current build configuration but already contains incompatible changes. For that revision only, the build changes `pagination.pagerSize` to `paginate`, supplies empty `data/events.json`, and replaces `lang.FormatNumberCustom` with `printf` for Hugo 0.84.4. These are build-only compatibility changes, not changes to the repository. Later revisions use Hugo 0.169.0. These differences can affect the comparison and are identified in the report.

To compare already-built sites locally, run `npm ci` here, then `node capture.mjs /path/to/base/public /path/to/head/public /path/to/report` using Playwright Chromium 1.56.1. For consistent rendering, run it in `mcr.microsoft.com/playwright:v1.56.1-noble`.
