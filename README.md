# Idea to Merge with the Copilot App

<img src="https://octodex.github.com/images/Professortocat_v2.png" align="right" height="200px" />

Hey petrovpe123!

Mona here. I'm done preparing your exercise. Hope you enjoy! 💚

Remember, it's self-paced so feel free to take a break! ☕️

[![](https://img.shields.io/badge/Go%20to%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/petrovpe123/GitHubCopilotApp/issues/1)

## Bookmark manager

Enter a web URL with or without `https://`. The app normalizes it, assigns a
unique four-character base62 `mona-` slug, and displays `<url> :: <slug>`.
Slugs are local labels, not hosted redirect links. Copy a slug with **Copy**;
**Clear all** removes saved bookmarks after confirmation.

Bookmarks stay in this browser under the `mona-bookmarks` localStorage key.
The browser-only Astro script validates saved records, skips malformed or legacy
entries, and reports corrupted or inaccessible storage. Failed saves keep the
entered URL so you can retry. JavaScript is required; the static build does not
read browser storage. The UI uses the existing self-hosted Monaspace fonts.

Run `npm test` for the browser-free helper tests and `npm run build` for the
production static build.
