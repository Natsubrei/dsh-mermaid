# dsh-mermaid-panel

A DeepSeek Harness client plugin: one right-Sidebar page type that renders the
Mermaid diagrams in the conversation on screen. The chat's own code block is
never touched, so copying, quoting, or letting the model read the source back
still works.

The package is `dsh-mermaid-panel`, not `dsh-mermaid`: that name belongs to
[MrmoLabs/dsh-mermaid](https://github.com/MrmoLabs/dsh-mermaid), which renders
inside the chat messages instead. The two do different things and can be
installed side by side.

## Where things are

- `src/client.jsx` — the whole browser half: the page type, the DOM scan, the
  cards, the zoom/pan viewer. **Edit this, not `client.js`.**
- `build.mjs` — esbuild → `client.js` (the module) and `client.mermaid.js` (the
  3.5 MB engine, requested on the first diagram). The registration id is read
  from `package.json`, so the name drives both ids.
- `index.js` — host half. Empty on purpose: rendering is browser-only.
- `cordis.patch.yml` — inserts the entry into the profile. `id` and `name` must
  equal the package name.
- `locale/{en,zh}.json` — the inventory title and description.
- `index.json` — the market index this repository publishes. Generated; never
  edited by hand.
- `scripts/market-index.mjs` — writes `index.json` from `package.json` and
  `HEAD`, and refuses to run when `client.js`'s module id disagrees with the
  package name.
- `client.js`, `client.mermaid.js` — committed build artifacts, so a Git install
  needs no build step.

## Verify

```bash
npm run build            # regenerates both artifacts
node --check client.js   # a broken bundle is otherwise only visible in the GUI
npm run market           # also proves the module id matches the package name
```

There is no test suite. A rendering change is verified by looking: install the
directory (or the tarball) into a scratch profile and open the page in the GUI.
Mermaid's own parser is the final word on a source, so a diagram that fails to
render shows the failure notice and the source rather than a broken SVG.

## Try it in a profile

```text
plugin_manager install_bundle <this directory or the release tarball>
```

Then hard-refresh the Web GUI. Client plugins reach the page at load, so a
refresh — not a host restart — is what applies them. DSH also needs Discover's
**Custom plugin markets** switch on if the install comes from an index.

## Release

The market entry pins a commit, so the artifacts, the tag, the tarball, and the
index all have to describe the same code.

1. Bump `version` in `package.json`, run `npm run build`, and commit the bump
   together with both artifacts (`Release 0.2.0` style subject).
2. `git tag v0.2.0 && git push origin main --tags`.
3. Build the release asset **outside the tree**, under a name without a version:

   ```bash
   npm pack --pack-destination /tmp/dsh-rel
   cp /tmp/dsh-rel/dsh-mermaid-panel-0.2.0.tgz /tmp/dsh-rel/dsh-mermaid-panel.tgz
   gh release create v0.2.0 /tmp/dsh-rel/dsh-mermaid-panel.tgz --title v0.2.0 --notes '…'
   ```

   `releases/latest/download/dsh-mermaid-panel.tgz` is what the market index and
   the awesome-list entry point at, so that asset name is a stable URL: keep it
   unversioned and let `latest` move.
4. `npm run market` on the tagged commit, then commit `index.json` on its own
   (`Publish the 0.2.0 market index`) and push.
5. `npm publish` (the account needs an OTP or a token that bypasses 2FA). The
   registry copy is what a reader behind a slow GitHub connection installs from,
   and `probe-npm.mjs` in awesome-dsh-plugin upgrades the list card to a registry
   install by itself once the package exists and its `repository` points back
   here — no entry change, no pull request. `dist-tags.latest` must end up on the
   tagged version: a publish that fails after the tag is retried as a publish,
   never as a new tag.

`index.json` pins the commit that carries the built artifacts — the tagged one,
not the index commit. Never hand-edit it: the commit, the timestamp, and
`dist-tags` are derived. `MARKET_COMMIT=<sha> MARKET_TIMESTAMP=<unix>` exists for
the case where the index has to be generated before the commit does.

## Distribution

- npm: `dsh-mermaid-panel` — `install_bundle dsh-mermaid-panel@0.1.4` takes the
  same tarball from the registry.
- This repository's own index:
  `https://raw.githubusercontent.com/Natsubrei/dsh-mermaid-panel/main/index.json`
- The awesome-dsh-plugin entry lives in that repository as
  `data/plugins/Natsubrei__dsh-mermaid-panel.yml`. Its `url`, `name`, and
  `tarball` must agree with the repository name and the release asset, so a
  rename — of the package, the repository, or the asset — is an update to that
  file in the same pull request.

## Gotchas

- The package name is the client module id, and `require.async('./client.mermaid.js')`
  resolves against it. A rename that skips `npm run build` ships a module whose
  id no longer matches `package.json`; `npm run market` catches it, the GUI does
  not.
- Internal ids are keys, not names: the tab id `dsh-mermaid/mermaid`, the locale
  namespace `mermaid`, and the `dsh-mermaid-*` class names stay as they are when
  the package is renamed. Changing the tab id only resets an open Sidebar tab.
- The page reads the DOM the chat has mounted. If the chat's code-card markup
  changes, the page shows its empty state until the selectors in
  `src/client.jsx` are updated. That is the first thing to check when "no
  diagrams" is reported, before any plugin code.
- Mermaid's engine is a classic script. `build.mjs` deliberately does not wrap
  it in the module factory, because doing so drops the global it installs.
- Do not create a repository at the old name `Natsubrei/dsh-mermaid`: GitHub's
  redirects for the old URLs survive only while that name stays unclaimed.
