# Frontend optimization

These changes reduce the JavaScript downloaded before the first page renders. Sizes are for the
production build. The browser timings below are lab measurements and do not represent production
traffic.

## Changes and measured sizes

| Step                                                                         | What changed                                                                                | Startup JavaScript (gzip) |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------: |
| Before the large stylesheet move                                             | Pages and interface catalogs loaded eagerly                                                 |                   ~360 kB |
| [`dc2a508`](https://github.com/callbackKid/languageswithvlad/commit/dc2a508) | Moved component CSS next to its owners. The central stylesheet went from 3,732 to 657 lines |                   ~363 kB |
| [`428e66c`](https://github.com/callbackKid/languageswithvlad/commit/428e66c) | Deferred Tutorial and its localized guide until the route opens                             |                   ~306 kB |
| [`62bedcc`](https://github.com/callbackKid/languageswithvlad/commit/62bedcc) | Deferred the News page and archive. The unread date and storage check stay at startup       |             248,095 bytes |
| Locale prototype                                                             | Loaded the selected language in its own JS chunk before the first render                    |     163,581–167,617 bytes |

The Tutorial chunk was about 58 kB gzipped. Chrome verified help links, cold direct links with an
anchor, Back navigation, and recovery after a blocked chunk. The News chunk was also about 58 kB
gzipped. Chrome verified that no News chunk was requested at startup, the badge stayed unread
during loading and after a blocked chunk, and the read status persisted after a successful open.

### Large-chunk warnings

Before the language split, six chunks exceeded Vite's 500 kB warning threshold. The same six were
already present before the component stylesheet migration. These are Vite's rounded minified sizes
from the first investigation:

| Chunk or owner                      | Minified size | Gzip size | When needed                               |
| ----------------------------------- | ------------: | --------: | ----------------------------------------- |
| App entry                           |      1,049 kB |    363 kB | Startup                                   |
| Zoom Meeting SDK                    |      3,268 kB |    992 kB | Joining an embedded Zoom call             |
| Excalidraw shared font subset chunk |      1,824 kB |    737 kB | On demand in the board dependency graph   |
| Excalidraw shared renderer          |      1,144 kB |    373 kB | Board and saved drawing previews          |
| Mermaid renderer and converter      |        732 kB |    183 kB | On demand in the board dependency graph   |
| Mermaid Cynefin parser              |        691 kB |    155 kB | On demand in the Mermaid dependency graph |

The dependency graph comes from Rollup's emitted chunk metadata. These sizes should not be added
together as a cost for opening the board: some of its modules have further lazy imports. The
PDF chunk was already loaded on demand and was below the warning threshold.

## Locale prototype

The virtual Vite prototype moved 16 eager dictionaries from 15 source files into seven language
chunks. It left the route-local News and Tutorial catalogs on their existing lazy routes. The
prototype entry alone was 149,930 bytes gzipped. Each total below includes the app entry and the
selected language chunk, compressed separately as the browser would receive them.

| Interface language | Language chunk (gzip bytes) | Startup total (gzip bytes) | Saved vs. 248,095 bytes |
| ------------------ | --------------------------: | -------------------------: | ----------------------: |
| English            |                      13,651 |                    163,581 |                   34.1% |
| Russian            |                      17,687 |                    167,617 |                   32.4% |
| French             |                      15,135 |                    165,065 |                   33.5% |
| German             |                      15,267 |                    165,197 |                   33.4% |
| Spanish            |                      14,840 |                    164,770 |                   33.6% |
| Portuguese         |                      14,742 |                    164,672 |                   33.6% |
| Italian            |                      14,662 |                    164,592 |                   33.7% |

### Cold-cache Chrome timing

The comparison opened the built Settings page in French on a 390 × 844 viewport. The first-render
metric is the first animation frame with the localized Settings heading. First Contentful Paint
(FCP) is recorded independently via the browser Performance API. Each cell below has the values
from all seven paired runs, in run order and in milliseconds.

| Profile and metric                                           | Current build                            | Prototype                                | Median, current → prototype |
| ------------------------------------------------------------ | ---------------------------------------- | ---------------------------------------- | --------------------------- |
| 1.6 Mbps down, 0.75 Mbps up, 150 ms latency, localized frame | 1653, 1652, 1650, 1651, 1633, 1651, 1651 | 1416, 1400, 1413, 1399, 1410, 1401, 1409 | 1651 → 1409                 |
| Same profile, FCP                                            | 1696, 1688, 1688, 1688, 1668, 1704, 1688 | 1460, 1444, 1460, 1452, 1448, 1440, 1448 | 1688 → 1448                 |
| 15 Mbps down, 5 Mbps up, 40 ms latency, localized frame      | 250, 253, 237, 249, 254, 254, 252        | 253, 253, 253, 238, 252, 251, 251        | 252 → 252                   |
| Same profile, FCP                                            | 288, 284, 280, 284, 292, 292, 288        | 284, 288, 292, 280, 288, 288, 288        | 288 → 288                   |

The median paired localized-frame change was −242 ms on the slower connection and −1 ms on the
faster connection. All seven slower-connection runs improved. The fast results varied by a few
milliseconds around zero. The extra request therefore has a real latency cost to account for,
even though the slower connection gained substantially from the smaller transfer.

## Production locale split

The production build extracts the eager dictionaries into seven hashed JSON assets. It loads the
saved or detected interface language before mounting the app. Switching keeps the current
language until the requested catalog loads. A failed download can be retried without reloading
the page, and the app saves the new language only after a successful switch. News and Tutorial
keep their route-local translations.

The production entry is 450,238 bytes minified and 150,484 bytes gzipped. The entry now falls
below Vite's warning threshold. Five deferred Zoom, Excalidraw and Mermaid chunks still exceed it.
The totals below include the JavaScript entry and one JSON catalog.

| Interface language | Catalog (bytes) | Catalog (gzip bytes) | Startup total (gzip bytes) | Saved vs. 248,095 bytes |
| ------------------ | --------------: | -------------------: | -------------------------: | ----------------------: |
| English            |          41,652 |               13,677 |                    164,161 |                   33.8% |
| Russian            |          69,367 |               17,753 |                    168,237 |                   32.2% |
| French             |          46,622 |               15,122 |                    165,606 |                   33.2% |
| German             |          46,752 |               15,285 |                    165,769 |                   33.2% |
| Spanish            |          45,969 |               14,809 |                    165,293 |                   33.4% |
| Portuguese         |          45,901 |               14,726 |                    165,210 |                   33.4% |
| Italian            |          45,017 |               14,651 |                    165,135 |                   33.4% |

### Production cold-cache Chrome timing

The same procedure was repeated against the production implementation and the build from
`62bedcc`. Samples are milliseconds. The last column is the median of the seven paired
differences (production minus baseline).

| Profile and metric                                           | Baseline runs                            | Production runs                          | Baseline → production median | Median paired change |
| ------------------------------------------------------------ | ---------------------------------------- | ---------------------------------------- | ---------------------------: | -------------------: |
| 1.6 Mbps down, 0.75 Mbps up, 150 ms latency, localized frame | 1644, 1652, 1651, 1666, 1650, 1652, 1649 | 1417, 1415, 1419, 1417, 1435, 1417, 1418 |                  1651 → 1417 |                 −232 |
| Same profile, FCP                                            | 1708, 1692, 1696, 1704, 1692, 1676, 1692 | 1476, 1460, 1476, 1468, 1484, 1480, 1476 |                  1692 → 1476 |                 −220 |
| 15 Mbps down, 5 Mbps up, 40 ms latency, localized frame      | 247, 254, 251, 252, 240, 251, 251        | 251, 252, 253, 252, 265, 251, 252        |                    251 → 252 |                   +1 |
| Same profile, FCP                                            | 284, 292, 288, 296, 284, 288, 288        | 288, 288, 288, 288, 292, 288, 288        |                    288 → 288 |                    0 |

## Instruments and reproduction

- **Build and bundle graph:** Node.js 22.19.0, Vite 5.3.4 and Rollup. Run `yarn build` to get Vite's
  warning and asset sizes. To trace what is eagerly loaded, use the Vite JavaScript API with
  `build: { write: false }`, find the chunk with `isEntry`, and walk its static `imports`
  recursively. Classify the other chunks with `dynamicImports`, `facadeModuleId` and `modules`.
  Compute gzip bytes using `gzipSync` from `node:zlib` on each emitted asset separately, then sum
  the assets required to render. Vite's displayed minified size and gzip byte counts use different
  conventions, so use the same measure when comparing builds.
- **Browser lab:** Headless Google Chrome driven by Playwright Core 1.48.2, the project's fixture
  responses in `.agents/skills/run-languageswithvlad/fixtures.mjs`, and local loopback servers
  serving gzip-compressed production assets. Each load uses a new browser context and CDP
  `Network.setCacheDisabled`. Apply `Network.emulateNetworkConditions` with the table's throughputs
  and latency. Set the locale to French and open
  `/settings?doc=testdocument_run_skill_0001`. In an init script, poll via animation frame until
  `main h1` reads `Réglages`, then record that frame's timestamp. Read
  `performance.getEntriesByName('first-contentful-paint')` for FCP. Do one untimed warm-up for
  each build, alternate build order across seven pairs, and report medians. The lab used local
  fixtures, browser network shaping and no CPU throttling. Numbers will vary by hardware and
  browser version.
- **Checks:** `CHOKIDAR_USEPOLLING=true yarn verify`, `yarn test`, and `yarn build` cover lint,
  formatting, types, layer rules, the existing Vitest suite, and the production build. Browser
  checks cover startup requests, navigation and failure recovery. The route checks also use
  axe-core for accessibility at 390 and 1280 px in both themes.
