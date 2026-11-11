# Games

Map games and their simulators. Each game is a single self-contained HTML file, served as-is from the site (`/games/...`), with `noindex` and no links from the site menus. Nothing here goes through the content build.

## Junction Control

A team game on a trail network: teams race to visit every checkpoint, traveling only on trails, and the team with the most players at an intersection blocks it.

| File | What it is |
|---|---|
| `junction-control.html` | The simulator: <https://curriculum.navigationgames.org/games/junction-control.html> |
| `junction-control-help.html` | Help page for the simulator: every setting, each way of playing, how the players decide, and what the simulator has shown |
| `../../../notes/map-games.md` | The game's rules, decisions, levels and open questions |
| `../../../content/activities/junction-control.md` | The Level 1 school activity (live at `/activities/core/junction-control/`) |

The online multiplayer version is on the roadmap ("Junction Control online" in `site/docs/editors/roadmap.md`).

### Rules decided (November 2026)

- The team with the most players at an intersection **blocks** it. ("Block", because "control" means checkpoint in orienteering.) Any lead blocks. A lone player blocks and can leave any way.
- Ties go to the team already blocking, so nobody tracks arrival order.
- An intersection has at least 3 ways to leave it. Bends and dead ends aren't intersections.
- One player leaves an intersection at a time. No contact.
- Once a team has every checkpoint, each player can take any bus from any stop. The team finishes when its last player's bus leaves. Tiebreak: the team whose last player reached a stop first.
- Herding (variation): a smaller group meeting a bigger one head-on on a trail is herded back to the last intersection and held there.

Still being tried in the simulator: how long a team can hold someone, and who can leave an intersection (three versions; see the help page).

### How the simulator is built

All game logic sits between the `/* SIM START */` and `/* SIM END */` markers, with no DOM access, so it can run in Node. The page code after it draws the map and handles the settings.

- `makeMap(seed, S)` builds the network: a grid of points joined by a random spanning tree plus extra trails. `M.isX[node]` is true for intersections (3 or more trails), and `M.label[node]` is the number shown on the map. It also places the start, the four bus stops (`M.stops`), the checkpoints (`M.cps`), and ranks the busiest intersections (`M.hubs`).
- `makeGame(M, S, seed)` sets up the teams and players. `step(G)` advances one second: herding, movement and arrivals, `computeControl` (who blocks what), `updateFree` (for the "lead" rule), `look` (what players see), `planExits` (blockers heading for the bus), `planRescues`, then `decide` for every player at a point.
- Key rule functions: `canLeave` (can this player leave?), `wouldHold` (would arriving players be held?), `route` (shortest path with penalties for known blocks), `approach` (a player seeing the intersection ahead decides whether to turn back).
- Buses: `PERIOD` is 300 s; stop `i` has `offset` `i * 75`. The bus animation is drawing only (`BUS_COME`, `BUS_WAIT`, `BUS_GO`).

The settings object `S`: `nTeams`, `perTeam`, `nCp`, `cpMode` (`node`/`trail`), `holdLimit` (seconds, `0` for no blocking, `Infinity`), `release` (`controller`/`back`/`held`), `tie` (`pass`/`first`/`lead`), `control: 'most'`, `sight` (`'all'`, meters, or `'third'`), `rescue`, `avoid`, `herd`, `wrong` (0 to 1), `limit` (seconds), `oneAtATime`, `cols`, `rows`, `spacing`, `density` (`sparse`/`medium`/`dense`), `strats` (one per team: `scatter`, `pairs`, `packs`, `team`, `blockers`, `wall`).

### Testing headlessly

Read the HTML in Node, take the text between the SIM markers and `eval` it, then:

```js
const M = makeMap(seed, S), G = makeGame(M, S, seed);
G.quiet = true;            // skip the event log
while (!G.over) step(G);
// G.result: {order, winner, finished}; each team in G.teams has heldSec, finishAt, doneAt, visited
```

`const` names inside the eval (like `STRATS`) aren't visible outside it; functions are. To syntax-check the whole page script, extract the `<script>` contents to a file and run `node --check` on it. Keep scratch test scripts out of the repo.

### Conventions

- Plain language, no em dashes, "checkpoints", "block" for what a team does to an intersection.
- When the simulator's behavior or findings change, update the help page and the "What the simulator shows" section of `notes/map-games.md`.
