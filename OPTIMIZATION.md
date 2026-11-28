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

The renderer itself is mostly Excalidraw. Splitting the existing renderer file
alone offers little transfer savings if the blank board still requests the same
code. Supabase is a separate dependency with a clear condition for loading it.

## Load Supabase only for shared boards

Standalone boards skip the Supabase SDK. Opening a configured shared board starts the SDK
download alongside the renderer, and attaches the connection after the SDK is ready. Leaving
while it loads cancels the pending attachment. A failed SDK load leaves the canvas available
for local drawing and PNG export.

### Instruments and reproduction

- Build the baseline at `1c533b8` and the split variant with Node.js 22.19.0 and Vite 5.3.4.
  Serve both builds with loopback HTTP and `node:zlib` gzip. Reuse the same fixture lesson,
  and include a test board server in `/api/health` for shared runs. Use Supabase JS 2.118.0.
- Use Chrome 158.0.8127.89 driven by Playwright Core 1.48.2 at 1280 × 900, English, and
  light theme. Start from a fresh context with the HTTP cache disabled. After Lesson space
  settles, set CDP network shaping to 1.6 Mbps down, 0.75 Mbps up, and 150 ms latency.
  Open the board in five pairs per configuration, alternating build order. Count
  first-party `/assets/` bodies from Resource Timing `encodedBodySize`, excluding HTTP
  headers, the HTML document, API responses, and external fonts. Mark the next animation
  frame after the canvas has a nonzero size. For shared runs also mark when the peer
  status shows the fixture peer.
- Playwright intercepts the Supabase WebSocket locally. The fixture acknowledges the channel
  join, supplies local and remote presence, and records outbound drawing messages. This
  verifies the browser client handshake and measures fixture presence. Real server latency,
  two-device sync across production infrastructure, and external fonts are outside the capture.

### Results

| Open action | Baseline JavaScript (gzip bytes) | Split JavaScript (gzip bytes) |       Difference |
| ----------- | -------------------------------: | ----------------------------: | ---------------: |
| Standalone  |                          436,885 |                       377,766 | −59,119 (−13.5%) |
| Shared      |                          436,885 |                       438,252 |   +1,367 (+0.3%) |

The full first-party asset totals were 520,835 → 461,716 bytes for a standalone open
and 520,835 → 522,202 bytes for a shared open. The board wrapper shrank from 60,792
to 1,681 gzip bytes. The new 60,486-byte Supabase chunk (`index-BbFRdJz9.js`) appeared
only after opening a configured shared board. The renderer changed by 8 gzip bytes
(373,388 → 373,380). Starting Lesson space increased the entry from 150,484 to 150,989
gzip bytes (+505), with the same CSS and English catalog. Combining the entry
difference and the open action, the standalone path still saved 58,614 bytes.

| Slower-network metric          | Baseline median (ms) | Split median (ms) | Median paired change (ms) |
| ------------------------------ | -------------------: | ----------------: | ------------------------: |
| Standalone, first canvas frame |                2,523 |             2,228 |                      −295 |
| Shared, first canvas frame     |                2,530 |             2,542 |                       +12 |
| Shared, fixture peer shown     |                2,529 |             2,544 |                       +15 |

The Supabase request began 1 ms after the click in each timed shared trial. Changes
in shared timings are small relative to the 2.5 s open. These timings cover the
observed local fixture only.

<details>
<summary>All paired timing samples (milliseconds after click)</summary>

| Configuration | Pair | Baseline canvas | Split canvas | Baseline peer | Split peer |
| ------------- | ---: | --------------: | -----------: | ------------: | ---------: |
| Standalone    |    1 |            2516 |         2228 |             — |          — |
| Standalone    |    2 |            2522 |         2228 |             — |          — |
| Standalone    |    3 |            2523 |         2228 |             — |          — |
| Standalone    |    4 |            2529 |         2231 |             — |          — |
| Standalone    |    5 |            2528 |         2228 |             — |          — |
| Shared        |    1 |            2531 |         2550 |          2530 |       2552 |
| Shared        |    2 |            2529 |         2518 |          2527 |       2520 |
| Shared        |    3 |            2530 |         2542 |          2529 |       2544 |
| Shared        |    4 |            2529 |         2546 |          2527 |       2548 |
| Shared        |    5 |            2531 |         2539 |          2530 |       2541 |

</details>

Browser checks verified local drawing and PNG export, the shared channel join and
drawing broadcast, local operation after blocking the SDK, and no channel join when
leaving Lesson space during the SDK download. Two tabs under Vite dev discovered
each other through `BroadcastChannel`, reflected one tab leaving, and skipped the
Supabase download. At 390 px, axe-core reported the same missing accessible name on
Excalidraw's menu in both builds and both themes.

## Saved-board preview profile

The **My notes** tab reads the editable board scene from browser storage. Its `BoardPicture`
component loads only if the lesson has a saved drawing. That component calls Excalidraw's
`exportToSvg`, and the production chunk statically imports the same renderer as the editor.
An empty **My notes** tab requested zero preview assets.

### Export-only build and local snapshot prototype

A temporary Vite build with `exportToSvg` as the sole entry export and React externalized
still needed **371,236 gzip bytes** across two statically loaded files. The public export
path retains nearly all of the renderer even when the interactive board is absent from the
entry. Excalidraw 0.18.1 exposes this function from the package root.

The snapshot prototype replaced only the preview component in a temporary build. It reads a
pre-rendered SVG `Blob` from IndexedDB, renders it through a blob URL in an `<img>` with the
existing accessible name, then revokes the URL when the preview closes. It uses separate
light and dark snapshots. Chrome opened both sample drawings without downloading Excalidraw
or the font-subsetting modules. The snapshot prototype is a cache-hit measurement, and
snapshot generation was outside the timed interval.

### Instruments and reproduction

- Start from `0c8ab1b` using Node.js 22.19.0, Vite 5.3.4, and Excalidraw 0.18.1. For the
  export-only build, use an in-memory Vite entry that re-exports `exportToSvg` from
  `@excalidraw/excalidraw`. Preserve the entry signature, keep React and React DOM external,
  and sum `node:zlib` gzip bytes along the entry's static Rollup imports.
- Draw a rectangle, then add `Bonjour!` in the current editor. Take the shape-only and text
  scenes from the editor's actual saved data. Open their matching lesson's **My notes** tab
  in the current build to generate the theme-specific SVG fixtures. Preseed the temporary
  variant's IndexedDB with those SVG bytes before each timed run.
- Serve each build over loopback HTTP with gzip and the repository's API fixtures. Use
  Chrome 158.0.8127.89 via Playwright Core 1.48.2. Use a fresh context, disable the HTTP
  cache, and fulfill the versioned Excalifont URL with its installed bytes. Block other
  third-party URLs. Measure five alternating pairs per scene at 1280 × 900, in light theme.
  Apply CDP shaping only after the lesson settles (5 Mbps down, 1 Mbps up, 100 ms latency).
- Mark the notes-tab click and the animation frame after the SVG has dimensions or the
  snapshot image has decoded. Count first-party `/assets/` response bodies through
  Resource Timing, including repeated worker requests. Check the image and its accessible
  name at 390 px in light and dark theme, with no network throttling for that check.

### Results

| Scene              | Current first-party body bytes | Snapshot first-party body bytes | Current median frame (ms) | Snapshot median frame (ms) | Median paired change (ms) |
| ------------------ | -----------------------------: | ------------------------------: | ------------------------: | -------------------------: | ------------------------: |
| Rectangle          |                        375,370 |                             442 |                       761 |                        142 |                      −618 |
| Rectangle and text |                      1,263,865 |                             442 |                     3,218 |                        143 |                    −3,078 |

These transfer figures count bodies completed through 650 ms after the rendered frame in
the shaped runs. The 442-byte preview chunk is the only first-party transfer after opening
a cached preview. The SVG bytes are read from disk. The rectangle snapshot sizes were
1,110 bytes in light theme and 1,150 in dark. Adding text made them 3,722 and 3,762 bytes.
At 390 px, the current SVG's screenshot measured 170 × 215 px and the prototype image
measured 172 × 217 px in both themes. The image kept the existing accessible name.
Production preview sizing still needs to match the original.

<details>
<summary>All paired preview timings (milliseconds after clicking My notes)</summary>

| Scene              | Pair | Current | Snapshot | Snapshot minus current |
| ------------------ | ---: | ------: | -------: | ---------------------: |
| Rectangle          |    1 |     761 |      130 |                   -631 |
| Rectangle          |    2 |     747 |      129 |                   -618 |
| Rectangle          |    3 |     761 |      143 |                   -618 |
| Rectangle          |    4 |     760 |      144 |                   -616 |
| Rectangle          |    5 |     776 |      142 |                   -634 |
| Rectangle and text |    1 |    3193 |      143 |                  -3050 |
| Rectangle and text |    2 |    3221 |      143 |                  -3078 |
| Rectangle and text |    3 |    3217 |      144 |                  -3073 |
| Rectangle and text |    4 |    3218 |      131 |                  -3087 |
| Rectangle and text |    5 |    3223 |      143 |                  -3080 |

</details>

The current rectangle preview fetched 368 bytes for `BoardPicture-DQ7KJ6GR.js`, 373,380
for `percentages-BXMCSKIN-2OkU4Ix5.js`, and 1,622 across the file-open, directory-open, and
file-save helpers (333, 789, and 500 bytes). The text preview also requested the
Excalifont fixture separately (24,956 bytes), the 736,870-byte shared subsetter, the
318-byte worker glue, and repeat requests from the worker dependency graph.
Unthrottled phone-width runs completed **2,374,115 first-party bytes** for the text
preview. These include two transfers each of the shared subsetter, worker glue, and
renderer, plus a 150,989-byte app entry in the worker dependency graph. A separate
shaped text run with a 5 s post-frame capture still recorded 1,263,865 bytes. The
totals depend on which worker responses complete and browser cache reuse.

### Follow-up

Use a derived snapshot alongside the editable scene, with a cache key that includes
the document, date, scene revision, and theme. Keep the current SVG renderer as the
fallback for existing scenes, stale entries, or unavailable storage. A read-through
cache can seed existing previews. For newly edited boards, compare generating a
snapshot while the editor is open. In one loopback check, the editor's existing PNG
export took 60 ms from the test's click attempt to the completed download, produced
a 9,181-byte 225 × 256 PNG, and requested zero new first-party assets. Keeping the
snapshot in IndexedDB also avoids adding image bytes to the editable scene stored in
localStorage. Snapshot creation, invalidation, and legacy fallback need their own
functional and timing checks before deployment.

## Production saved-board snapshots

The editor saves the editable scene as before and schedules PNG previews after idle time.
It generates light and dark variants from the exact persisted scene. The IndexedDB cache
keeps one entry per board and theme, and the scene's SHA-256 revision prevents an older
picture from being used after an edit. A completed export checks the current stored scene
before writing. Clearing a board removes its cached previews.

**My notes** loads the cached image by blob URL when available. Cache misses, stale or
unreadable entries, and unavailable IndexedDB use the existing SVG renderer. A successful
legacy render seeds the cache for the matching theme. Editable scenes keep their existing
storage format.

### Production measurements

The browser run used Chrome 158.0.8127.89 and Playwright Core 1.48.2 with the same loopback
server, gzip, API fixtures, cache-disabled contexts, and 5 Mbps down / 1 Mbps up / 100 ms
profile as the prototype. The actual production editor created the stored PNGs. Each timed
context was seeded with its corresponding editable scene and those IndexedDB entries before
navigation, so the timing measures a cold page with a preview cache hit.

| Fixture            | Light PNG bytes | Dark PNG bytes | All cache-hit frame times (ms) | Median (ms) |
| ------------------ | --------------: | -------------: | ------------------------------ | ----------: |
| Rectangle          |           5,675 |          5,739 | 147, 147, 129, 141, 131        |         141 |
| Rectangle and text |           8,406 |          8,400 | 145, 144, 145, 145, 144        |         145 |

All ten cache hits fetched **1,476 gzip bytes** after clicking **My notes**. This was
731 bytes for `BoardPicture-B2macAXD.js` and 745 for `boardPreview-CG3HXR5Q.js`.
No renderer or font-subsetting chunk was requested. The earlier uncached live-SVG
benchmarks were 761 ms and 3,218 ms for their rectangle and text fixtures, respectively.
Those older runs used separately drawn scenes and provide context for the cache-hit
measurements.

Chrome verified both PNG themes at 390 px, unchanged image labelling, and SVG fallback
for an older board, a stale revision, a corrupt image, and unavailable IndexedDB. An older
board's second open used its cached SVG image. Editing replaced both PNGs under a new
revision, and clearing deleted both entries. For the mobile text fixture the cached PNG
box was 227 × 258 px and the fallback SVG box was 225 × 257 px.
Axe-core reported the same existing heading-order finding in both builds and themes.

## November 28 optimization pass

### Secondary routes

Photo parsing, Text analysis, and Stats load when opened. Direct links start the route
download alongside the selected language catalog. The catalog keeps validated dictionaries
available to modules that register after it finishes loading.

Three alternating cold-cache pairs per route used Chrome with the loopback fixture and
5 Mbps down, 1 Mbps up, and 100 ms latency. Timings are medians to the heading's first
frame. Sizes are compressed JavaScript response bodies and exclude CSS and the English
catalog.

| Route        | Baseline JS bytes | Split JS bytes | Baseline frame (ms) | Split frame (ms) |
| ------------ | ----------------: | -------------: | ------------------: | ---------------: |
| Home         |           151,010 |        144,224 |                 804 |              783 |
| Lessons      |           151,010 |        144,224 |                 790 |              791 |
| Lesson space |           151,010 |        144,224 |                 683 |              670 |
| Photo        |           151,010 |        148,385 |                 669 |              671 |
| Text         |           151,010 |        148,491 |                 660 |              666 |
| Stats        |           151,010 |        146,349 |                 785 |              769 |

The startup route trial saved 6,786 JavaScript bytes and 967 CSS bytes. The timings
varied between pairs and support a transfer-size improvement.

### Lesson analysis and large histories

Opening Grammar, choosing **Read the lesson again**, then opening Words and returning
to Grammar produced three requests in the baseline (one ordinary and two forced).
The same sequence produced two requests after the fix (one ordinary and one forced).
Tab changes can share the in-flight reading, and completed readings use the existing
cache key.

Stats now counts vocabulary and builds lesson totals in one pass. With 500 synthetic
lessons and 15,000 words, median aggregation fell from 40.20 ms to 9.04 ms. The results
matched on three fixtures. The shell, star buttons and per-word streak indicators now
subscribe to the progress value each one displays.

In the same large-history fixture, the Downloaded lessons list took 1.13 s to display
and 530 ms to toggle a checkbox. The list still renders all rows. Pagination is a
follow-up for this scale because search, selection, export, and exercises need access
to the full result set.

### Photo uploads and PDFs

Both PDF entry points reject selected content larger than 3,000,000 bytes before Base64
encoding. In an isolated before-and-after comparison of an oversized scan, rejection
took 924 ms before the change and 225 ms after it. The baseline allocated about 70 million
Base64 characters. Both runs made zero upload requests. Chrome exercised both import
entry points at 390 px in both themes, and the exact byte boundary was checked separately.

In the four-photo fixture, a browser downscaling prototype reduced sampled peak memory
growth from 419 MiB to 128 MiB and increased preparation time from 193 ms to 455 ms.
It remains experimental. The PDF library still parses the source during page selection
and again during extraction.

### Live-board broadcasts and SVG export

Board image broadcasts now group files by their encoded byte size. The per-picture cap
still applies. The 200,000-byte payload budget leaves room for the transport envelope.
In a two-peer Chrome fixture, a pair of pictures would have exceeded 347 kB in one
message. The receiver saved both pictures from separate 173,850-byte messages and
received both again after a simulated connection drop and rejoin. The fixture
exercised the transport locally. Durable deletion markers and delivery acknowledgements
remain follow-ups.

The SVG export worker previously pulled in the app entry and failed when it accessed
`document`. Vite now emits the helpers shared by the worker and renderer in a separate
chunk. Chrome exported the same 1,944-byte embedded font on both attempts, at 390 px in
both themes. With a normal HTTP cache the second export made no first-party asset
requests. With the cache disabled, the second export fetched a further 738,379 gzipped
bytes for the worker and its dependencies. That cache-disabled run measures the
dependency graph without HTTP cache reuse.

### Zoom and performance metrics

The fixture benchmark above covers the SDK and signature. Live cold and warm joins,
including media startup, still need a hosted Zoom test meeting. The current parallel
signature and SDK loading stays in place.

`yarn perf:budget` checks first-load assets in the production bundle graph. It sums the
static entry dependencies and the largest of the seven language catalogs, plus a
separate CSS total. The final build measured 162,198 gzip bytes for JavaScript and the
catalog against a 176,000-byte limit, and 11,078 CSS bytes against a 13,000-byte limit.
This command can run as a CI gate. Timing samples remain browser lab measurements.

With `CLAUDE_METRICS=1`, the server logs request duration and outcome, with HTTP status
and token counts when available. The mock provider recorded one cache hit across three
calls and two upstream requests. Requests with different output-token limits use
different cache entries. Logs omit prompts, provider response content, and credentials.

### Large-board snapshots

A fixture with 400 shapes, 80 text elements and two images serialized to 569 kB.
Across three runs per CPU profile, the two PNG previews used about 2.26 MB in total.
The largest main-thread task took 3.29–3.48 s at normal speed and 13.72–13.92 s at
4× CPU throttling. These stalls occurred during background preview generation.

The editor now skips background exports above 150 elements, 400,000 serialized bytes,
or a 2,000,000-pixel export footprint. The same size class of board saved an additional
edit and scheduled zero background preview jobs in Chrome at 390 px in both themes.
Its preview rendered when **My notes** opened. These thresholds bound the work the
editor attempts in the background. On-demand previews can still take time on large drawings.

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
