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

## Board and Zoom request audit

The production build at `dbcfe44` has five chunks above Vite's 500 kB threshold. None downloaded
on cold Settings or on entry to Lesson space with the board closed and the Zoom call idle.
Opening a blank board downloaded **520,835 bytes** in first-party asset bodies. The shared
Excalidraw renderer accounted for 373,388 of those bytes. Zoom downloaded its **992,470-byte**
SDK even when the signature endpoint immediately rejected the join. The board's Mermaid and
SVG export tools triggered the other three warnings.

### Incremental requests by action

Each row counts only the `/assets/` response bodies first observed at that step. JavaScript,
CSS, and JSON were served with gzip. WOFF2 fonts were served as-is. Table totals exclude HTTP
headers, fixture API responses, the HTML document, and third-party URLs. The SVG row counts
duplicate responses because Chrome's cache was disabled and the worker fell back to the main thread.

| Action                                          | JavaScript (bytes) | CSS (bytes) | Fonts (bytes) | JSON (bytes) | Total (bytes) |
| ----------------------------------------------- | -----------------: | ----------: | ------------: | -----------: | ------------: |
| Cold Settings                                   |            150,484 |      12,039 |             0 |       13,677 |       176,200 |
| Settings → Lesson space                         |                  0 |           0 |             0 |            0 |             0 |
| Open the blank board                            |            436,885 |      23,018 |        60,932 |            0 |       520,835 |
| Type on the board                               |                  0 |           0 |             0 |            0 |             0 |
| Save as picture (PNG)                           |                  0 |           0 |             0 |            0 |             0 |
| Open the image export dialog                    |                  0 |           0 |        20,212 |            0 |        20,212 |
| Export SVG with text                            |          1,474,372 |           0 |             0 |            0 |     1,474,372 |
| Open Mermaid with its default flowchart         |            222,088 |           0 |        20,212 |            0 |       242,300 |
| Replace the example with `cynefin-beta`         |            158,914 |           0 |             0 |            0 |       158,914 |
| Open Lesson space directly with Zoom configured |            150,484 |      12,039 |             0 |       13,677 |       176,200 |
| Select Join here (two separate 403 runs)        |            992,470 |           0 |             0 |            0 |       992,470 |

### Request details

The cold Settings and direct Lesson space loads downloaded the same three assets. Counts below
apply to a single run of the relevant action. The five warnings correspond to
`percentages-BXMCSKIN-DhuJzVQ2.js`, `index-CPJvOm0A.js`, `cynefin-OW5HDTMX-CiEMV8hc.js`,
`subset-shared.chunk-CRaCKmd1.js`, and `component-view.es.min-DW5V_es0.js`.

<details>
<summary>All measured first-party asset bodies</summary>

| Action                                   | Asset                                 | Responses | Decoded bytes each | Encoded bytes each |
| ---------------------------------------- | ------------------------------------- | --------: | -----------------: | -----------------: |
| Cold Settings                            | `index-jekREKsd.js`                   |         1 |            450,238 |            150,484 |
| Cold Settings                            | `index-DPKbO9Ab.css`                  |         1 |             59,282 |             12,039 |
| Cold Settings                            | `interface-en-Cti-5RRj.json`          |         1 |             41,652 |             13,677 |
| Open the blank board                     | `BoardCanvas-B_xr-9-n.js`             |         1 |            231,274 |             60,792 |
| Open the blank board                     | `percentages-BXMCSKIN-DhuJzVQ2.js`    |         1 |          1,144,534 |            373,388 |
| Open the blank board                     | `BoardCanvas-Bnx8hZwR.css`            |         1 |            145,618 |             23,018 |
| Open the blank board                     | `file-open-002ab408-DIuFHtCF.js`      |         1 |                539 |                333 |
| Open the blank board                     | `directory-open-4ed118d0-BzWybGaI.js` |         1 |              1,551 |                789 |
| Open the blank board                     | `file-save-745eba88-Bb9F9Kg7.js`      |         1 |                867 |                500 |
| Open the blank board                     | `roundRect-0PYZxl1G.js`               |         1 |              3,050 |              1,083 |
| Open the blank board                     | `Assistant-Regular-DVxZuzxb.woff2`    |         1 |             20,232 |             20,232 |
| Open the blank board                     | `Assistant-Bold-gm-uSS1B.woff2`       |         1 |             20,380 |             20,380 |
| Open the blank board                     | `Assistant-Medium-DrcxCXg3.woff2`     |         1 |             20,320 |             20,320 |
| Open the image export dialog             | `Assistant-SemiBold-SCI4bEL9.woff2`   |         1 |             20,212 |             20,212 |
| Open Mermaid with its default flowchart  | `Assistant-SemiBold-SCI4bEL9.woff2`   |         1 |             20,212 |             20,212 |
| Open Mermaid with its default flowchart  | `index-CPJvOm0A.js`                   |         1 |            731,637 |            183,368 |
| Open Mermaid with its default flowchart  | `flowDiagram-HODETNUW-B7ijEpV0.js`    |         1 |             62,601 |             20,042 |
| Open Mermaid with its default flowchart  | `chunk-5VM5RSS4-CpbK-lA2.js`          |         1 |                359 |                267 |
| Open Mermaid with its default flowchart  | `chunk-XXDRQBXY-zB8ksTHP.js`          |         1 |                223 |                202 |
| Open Mermaid with its default flowchart  | `chunk-POPQ4Y6H-BNAAuYTz.js`          |         1 |                525 |                370 |
| Open Mermaid with its default flowchart  | `chunk-F27PBJKO-Bb1dXJUI.js`          |         1 |              1,847 |                813 |
| Open Mermaid with its default flowchart  | `channel-ushPnYbq.js`                 |         1 |                106 |                119 |
| Open Mermaid with its default flowchart  | `dagre-GXQ25YYZ-B6rttbHf.js`          |         1 |             11,128 |              4,169 |
| Open Mermaid with its default flowchart  | `layout-i5rgfdlN.js`                  |         1 |             35,427 |             12,738 |
| Replace the example with `cynefin-beta`  | `cynefinDiagram-5FMLGOSQ-DjHote3i.js` |         1 |             10,090 |              3,626 |
| Replace the example with `cynefin-beta`  | `chunk-JWPE2WC7-B5O7DUTD.js`          |         1 |                290 |                198 |
| Replace the example with `cynefin-beta`  | `cynefin-OW5HDTMX-CiEMV8hc.js`        |         1 |            690,652 |            155,090 |
| Select Join here (two separate 403 runs) | `component-view.es.min-DW5V_es0.js`   |         1 |          3,363,628 |            992,470 |
| Export SVG with text                     | `subset-shared.chunk-CRaCKmd1.js`     |         2 |          1,823,541 |            736,870 |
| Export SVG with text                     | `subset-worker.chunk-47JUgvpG.js`     |         2 |                425 |                316 |

</details>

### Instruments and reproduction

- Build `dbcfe44` using Node.js 22.19.0 and Vite 5.3.4 with `yarn build`. Serve `dist`
  from a loopback HTTP server with `node:zlib` gzip and the project browser skill's
  `fixtures.mjs` for `/api/`. This build uses Excalidraw 0.18.1 and Zoom Meeting SDK 6.10.0.
- Drive Chrome 158.0.8127.89 using Playwright Core 1.48.2 at 1280 × 900, in English and light
  theme. Use a fresh browser context per scenario and disable its cache with CDP
  `Network.setCacheDisabled`. Take a Resource Timing snapshot after each action, waiting
  for network idle and another 750 ms. Use `encodedBodySize` and `decodedBodySize` for
  response body bytes. Cross-check subsetting requests against the loopback server log to
  include worker requests and repeated responses.
- Open the fixture's Settings, follow Lesson space, and select **Open the board**. Open
  **More tools → Mermaid to Excalidraw**, wait for its default flowchart, then replace its
  source with the `cynefin-beta` header to trigger that parser. This checks parser loading.
- In a separate board run, type `Benchmark`, select the app's **Save as picture**, then
  use Excalidraw's **Export image → Export to SVG**. Ordinary PNG export needed no new
  first-party asset. For the SVG run, Playwright fulfilled the versioned `esm.sh` font URL
  with the installed Excalifont bytes (24,956 bytes per response) and used a test save picker.
  The subsetting library served two copies during its worker-to-main-thread fallback.
  The 1,474,372-byte total describes that cache-disabled run. With the font URL blocked,
  the subsetting assets were absent from the capture window.
- For Zoom, replace the fixture's Meet link with a Zoom link and set `zoom: true` in health
  with Jitsi off. Open Lesson space, fill in the call name, and select **Join here**. Run once
  with an immediate HTTP 403 from `/api/call-token` and once with a 1.5 s delayed 403. The app
  showed its join error in both runs. Both fetched the same SDK chunk. A successful call's
  media and other vendor requests are outside the fixture measurement.

The largest board renderer accounts for about 85% of the JavaScript fetched on blank-board
open. Profile that path first when investigating board startup.

## Zoom signature ordering benchmark

This comparison uses two local variants of the production build. The parallel variant starts
the SDK download and signature request together. The gated variant waits for a successful
signature response before importing the SDK. Both variants stop at the point just before
creating the Zoom client. The measurement covers readiness to initialize the SDK. A live
meeting, provider media requests, and warm-cache joins are outside this benchmark.

### Instruments and reproduction

- Serve the production assets from `2f65c81` using Node.js 22.19.0 and `node:zlib` gzip.
  In memory, replace the compiled join expression in the app entry for each variant. Keep
  the same SDK chunk, and mark readiness immediately after the signature and dynamic import
  have both resolved. Return before `createClient()` so the fixture makes no Zoom requests.
- Use Chrome 158.0.8127.89 and Playwright Core 1.48.2 at 1280 × 900, English, and light theme.
  Reuse the browser skill's lesson fixture with a fake Zoom link and Zoom enabled. Use a fresh
  context for every trial and disable caching via CDP. Wait for Lesson space to settle before
  applying network shaping with `Network.emulateNetworkConditions`. Leave CPU throttling off.
- Mark the **Join here** click with `performance.mark()` and report the elapsed milliseconds
  to readiness. Use Resource Timing to check when the signature response finished and when
  the SDK request started. Count SDK response-body bytes with `encodedBodySize`. The local API
  waits 400 ms before returning an accepted placeholder signature, and returns an immediate
  HTTP 403 in the rejection case. Run one unthrottled warm-up per variant, then seven pairs
  per network profile with alternating order.

### Results

Waiting for the signature saved **992,470 gzip bytes** in the rejected trial and added
**409–414 ms** to the median paired time to SDK readiness when the 400 ms fixture
signature was accepted. In every accepted trial, both variants downloaded 992,470 SDK bytes.

| Network profile                                       | Parallel median (ms) | Wait for signature median (ms) | Median of paired changes (ms) |
| ----------------------------------------------------- | -------------------: | -----------------------------: | ----------------------------: |
| Slower, 1.6 Mbps down / 0.75 Mbps up / 150 ms latency |                5,237 |                          5,651 |                          +414 |
| Faster, 15 Mbps down / 5 Mbps up / 40 ms latency      |                  691 |                          1,100 |                          +409 |

The faster-profile 403 reached the browser 58 ms after the click in the parallel run and
54 ms in the gated run. Both displayed the join error. The parallel variant began the SDK
request at 5 ms and that transfer completed despite the rejection. The gated variant sent
zero SDK requests.

<details>
<summary>All accepted-signature timing samples (milliseconds after click)</summary>

| Profile | Pair | Parallel ready | Gated ready | Gated minus parallel | Parallel SDK start / signature end | Gated SDK start / signature end |
| ------- | ---: | -------------: | ----------: | -------------------: | ---------------------------------: | ------------------------------: |
| slower  |    1 |           5237 |        5651 |                  414 |                            3 / 419 |                       423 / 421 |
| slower  |    2 |           5235 |        5654 |                  419 |                            4 / 419 |                       427 / 425 |
| slower  |    3 |           5239 |        5651 |                  412 |                            4 / 422 |                       419 / 418 |
| slower  |    4 |           5236 |        5644 |                  408 |                            4 / 423 |                       430 / 429 |
| slower  |    5 |           5237 |        5661 |                  424 |                            3 / 420 |                       433 / 431 |
| slower  |    6 |           5240 |        5656 |                  416 |                            4 / 425 |                       429 / 427 |
| slower  |    7 |           5237 |        5649 |                  412 |                            2 / 438 |                       423 / 421 |
| faster  |    1 |            695 |        1099 |                  404 |                            4 / 413 |                       412 / 410 |
| faster  |    2 |            691 |        1100 |                  409 |                            4 / 414 |                       416 / 414 |
| faster  |    3 |            695 |        1085 |                  390 |                            5 / 414 |                       411 / 409 |
| faster  |    4 |            682 |        1092 |                  410 |                            4 / 413 |                       413 / 411 |
| faster  |    5 |            689 |        1102 |                  413 |                            4 / 413 |                       413 / 411 |
| faster  |    6 |            686 |        1102 |                  416 |                            3 / 410 |                       415 / 413 |
| faster  |    7 |            694 |        1102 |                  408 |                            4 / 413 |                       414 / 412 |

</details>

Keep parallel loading for now. Waiting trades a delay on every cold join with an accepted
signature for a bandwidth saving on rejected joins. The measured delay depends on signature
latency. The next benchmark target is the board renderer, which accounted for 373,388 gzip
bytes when opening a blank board.

## Blank-board renderer profile

The blank board took **2,511 ms** to reach its first rendered frame on the slower
network. The renderer's last byte arrived at **2,461 ms**, and the median per-run
gap from that byte to the frame was **58 ms**. On loopback, the same action took
**78 ms** at normal CPU speed and **167 ms** with 4× Chrome CPU throttling.

### Bundle composition

The renderer (`percentages-BXMCSKIN-DhuJzVQ2.js`) weighs 1,144,534 decoded bytes and
373,388 gzip bytes. It accounts for **85.5%** of the 436,885 JavaScript bytes
transferred when the blank board opens. The saved-board preview also imports this
renderer. Rollup lists 66 dynamic imports from the renderer. The request audit
above shows which were actually used on this path.

| Source in the renderer | Attributed minified bytes | Share of decoded chunk |
| ---------------------- | ------------------------: | ---------------------: |
| Excalidraw             |                   954,628 |                  83.4% |
| pako                   |                    46,204 |                   4.0% |
| Radix UI               |                    37,891 |                   3.3% |
| Floating UI            |                    22,477 |                   2.0% |
| roughjs                |                    18,782 |                   1.6% |
| Jotai                  |                     7,974 |                   0.7% |
| Other and unmapped     |                    56,578 |                   4.9% |

The board wrapper (`BoardCanvas-B_xr-9-n.js`) weighs a separate 231,274 decoded
bytes and 60,792 gzip bytes. Supabase packages account for about 220,908 decoded bytes
of that wrapper. The local-board fixture supplied no live-sharing server, yet Chrome
still downloaded the wrapper with Supabase. `boardSync.ts` statically imports
`createClient`, while its connection function checks whether sharing is configured.

### Network and rendering timeline

Values in the table are medians of five cache-disabled trials, in milliseconds
after clicking **Open the board**. The last column takes the difference within
each run before calculating the median.

| Profile                                       | Renderer request start | Renderer first byte | Renderer last byte | Board frame | Last byte → frame |
| --------------------------------------------- | ---------------------: | ------------------: | -----------------: | ----------: | ----------------: |
| Loopback                                      |                      2 |                   7 |                 11 |          78 |                67 |
| 1.6 Mbps down / 0.75 Mbps up / 150 ms latency |                      2 |                 156 |              2,461 |       2,511 |                58 |
| Loopback, 4× CPU throttle                     |                      3 |                   9 |                 11 |         167 |               156 |

<details>
<summary>All timing samples (milliseconds after click)</summary>

| Profile      | Trial | Renderer request start | Renderer first byte | Renderer last byte | Wrapper last byte | Board frame |
| ------------ | ----: | ---------------------: | ------------------: | -----------------: | ----------------: | ----------: |
| loopback     |     1 |                      2 |                   7 |                 10 |                 7 |          78 |
| loopback     |     2 |                      2 |                   7 |                 11 |                 7 |          79 |
| loopback     |     3 |                      2 |                   7 |                 11 |                 8 |          64 |
| loopback     |     4 |                      2 |                   7 |                 10 |                 7 |          64 |
| loopback     |     5 |                      2 |                   7 |                 11 |                 7 |          78 |
| slow-network |     1 |                      2 |                 156 |               2460 |               884 |        2510 |
| slow-network |     2 |                      2 |                 156 |               2462 |               888 |        2510 |
| slow-network |     3 |                      2 |                 156 |               2461 |               884 |        2524 |
| slow-network |     4 |                      2 |                 157 |               2464 |               888 |        2527 |
| slow-network |     5 |                      2 |                 155 |               2453 |               878 |        2511 |
| cpu-4x       |     1 |                      3 |                   8 |                 11 |                 9 |         166 |
| cpu-4x       |     2 |                      4 |                   9 |                 11 |                 9 |         167 |
| cpu-4x       |     3 |                      3 |                   8 |                 11 |                 9 |         168 |
| cpu-4x       |     4 |                      4 |                   9 |                 11 |                 9 |         166 |
| cpu-4x       |     5 |                      3 |                   9 |                 11 |                 9 |         181 |

</details>

### CPU and JavaScript coverage

Three separate V8 profiles per setting measured time with a renderer frame at
the top of the sampled stack (self) or anywhere on it (inclusive). Inclusive time
can include browser work such as layout. These samples do not measure all browser
work or isolate parsing and compilation.

| Profile                   | Renderer self samples (ms) | Renderer inclusive samples (ms) |
| ------------------------- | -------------------------- | ------------------------------- |
| Loopback                  | 12.5, 16.3, 17.1           | 12.8, 17.5, 17.1                |
| Loopback, 4× CPU throttle | 51.5, 58.6, 65.1           | 64.3, 65.1, 72.5                |

Two recurring renderer self-time hotspots map to Excalidraw's
`chunk-K2UTITRG.js`. Walking scrollable ancestors and reading computed styles
sampled 3.8 ms in each unthrottled run and 11.9, 13.0 and 13.9 ms at 4×.
Creating browser `FontFace` objects sampled 1.3, 2.5 and 3.5 ms unthrottled and
7.8, 9.9 and 9.6 ms at 4×.

In a separate precise-coverage run, Chrome marked **344,541 of 1,144,534 bytes**
(30.1%) active in the renderer and **8,256 of 231,274 bytes** (3.6%) in the board
wrapper. This is coverage of one blank-board open. The unexecuted ranges also
contain code used by drawing, exports, saved boards, localization, and live sharing.

### Instruments and reproduction

- Use the production assets from `3e79531`, Node.js 22.19.0, Vite 5.3.4, and the
  repository's Excalidraw 0.18.1. Read the Rollup chunk's static and dynamic imports
  from a `build({ build: { write: false } })` run.
- Rebuild in memory with hidden source maps and confirm the emitted chunks are
  byte-identical to the profiled assets. Use `@jridgewell/trace-mapping` to assign
  each span between generated mapping columns to its source package. This gives
  an approximate attribution of decoded bytes. Gzip is measured on each whole
  chunk using `node:zlib`. The profiling maps are kept out of production.
- Serve `dist` over loopback with gzip and the project browser skill's API fixture
  without a sharing server. Run Chrome 158.0.8127.89 through Playwright Core 1.48.2
  at 1280 × 900 in English and light theme. Block third-party URLs, including
  external fonts, and use a fresh context for every run. Let Lesson space settle
  before applying CDP network or CPU throttling. Warm up once.
- Mark the open click and wait for a nonzero interactive canvas and the toolbar's
  **More tools** button. Mark readiness on the following animation frame. Use
  Resource Timing for request timestamps and exclude the setup before the click.
  In separate runs use CDP `Profiler` (1 ms sampling interval) and Playwright
  `page.coverage`. Use the innermost V8 range counts to classify coverage and
  convert the generated script spans to UTF-8 bytes.

The first follow-up is to try importing Supabase on demand when the board has a
sharing server, then compare both standalone and live-board opens. The renderer
itself is mostly Excalidraw. Splitting the existing renderer file alone offers
little transfer savings if the blank board still requests the same code.

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
