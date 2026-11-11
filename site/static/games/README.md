# Games

Map games and their simulators. Each game is a single self-contained HTML file, served as-is from the site (`/games/...`), with `noindex` and no links from the site menus. Nothing here goes through the content build.

`index.html` is the landing page at `/games/`: a card for each of our games, cards for orienteering games from elsewhere (Catching Features, MapRun, rogaining), each tagged by where it's played (real life, simulator, computer, phone app), and an invitation to send ideas. Add a card when a game is added.

## Road Block

A team game on a trail network: teams race to visit every checkpoint, traveling only on trails, and the team with the most players at an intersection blocks it.

| File | What it is |
|---|---|
| `road-block.html` | The simulator: <https://curriculum.navigationgames.org/games/road-block.html> |
| `road-block-help.html` | Help page for the simulator: every setting, each way of playing, how the players decide, and what the simulator has shown |
| `../../../notes/map-games.md` | The game's rules, decisions, levels and open questions |
| `../../../content/activities/road-block.md` | The Level 1 school activity (live at `/activities/core/road-block/`) |
| `junction-control.html`, `junction-control-help.html`, `../activities/core/junction-control/index.html` | Forwarding pages: the game was called Junction Control until November 11, 2026, and those links were shared |

The online multiplayer version is on the roadmap ("Road Block online" in `site/docs/editors/roadmap.md`).

### Rules decided (November 2026)

- The team with the most players at an intersection **blocks** it. ("Block", because "control" means checkpoint in orienteering.) Any lead blocks. A lone player blocks and can leave any way.
- Ties go to the team already blocking, so nobody tracks arrival order.
- An intersection has at least 3 ways to leave it. Bends and dead ends aren't intersections.
- Who can leave (November 11): a team with the most players at an intersection can leave, and its players who are leaving go together. A tie for the most freezes everyone, except when the blocking team leaves a tie behind: then it picks which tied team blocks. A hold lasts at most 1 minute. The simulator's other two versions ("the most, and teams tied with it"; "only the blocking team") and no hold limit are adaptations in the activity.
- Otherwise one player leaves an intersection at a time. No contact.
- Once a team has every checkpoint, each player can take any bus from any stop. The team finishes when its last player's bus leaves. Tiebreak: the team whose last player reached a stop first.
- Herding (variation): a smaller group meeting a bigger one head-on on a trail is herded back to the last intersection and held there.

Still being tried in the simulator: how many bus stops, planning the checkpoint split at the start, and ways to make blocking pay. Findings, open questions and next steps are in `notes/map-games.md`, under "What the simulator shows", "Open questions" and "Where things stand".

### How the simulator is built

All game logic sits between the `/* SIM START */` and `/* SIM END */` markers, with no DOM access, so it can run in Node. The page code after it draws the map and handles the settings.

- `makeMap(seed, S)` builds the network: a grid of points joined by a random spanning tree plus extra trails. `M.isX[node]` is true for intersections (3 or more trails), and `M.label[node]` is the number shown on the map. It also places the start, the four bus stops (`M.stops`), the checkpoints (`M.cps`), and ranks the busiest intersections (`M.hubs`).
- `makeGame(M, S, seed)` sets up the teams and players. `step(G)` advances one second: herding, movement and arrivals, `computeControl` (who blocks what), `updateFree` (for the "lead" rule), `look` (what players see), `planGuards` (blockers moving to guard a checkpoint), `planExits` (blockers heading for the bus), `planRescues`, then `decide` for every player at a point.
- Planning: with `S.plan` set, `makeGame` calls `planSplit`, which gives each runner group a `plan` (a list of checkpoint indexes) using `tour` (nearest-next route from the start, ending at the nearest bus stop). `assignCp` takes the nearest checkpoint left on the group's plan, then falls back to deciding as it goes.
- Key rule functions: `canLeave` (can this player leave? under `lead`, `hasLead`), `go` (departs; under `lead`, teammates of the leading team can leave in the same second), `wouldHold` (would arriving players be held?), `route` (shortest path with penalties for known blocks), `approach` (a player seeing the intersection ahead decides whether to turn back), `guardCp` (which checkpoint to guard), `stageFor` (gathering next to a guarded checkpoint).
- Buses: each stop in `M.stops` has a `period` (seconds between its buses) and an `offset` (its first bus); `nextBus(s, t)` gives the next bus at or after `t`. `S.nStops` (1 to 4) picks the stops and `S.busEvery` sets the period (`'spread'` = a bus somewhere every 75 s). Checkpoints are kept off all four possible stops, so they don't move when the number of stops changes. The bus animation is drawing only (`BUS_COME`, `BUS_WAIT`, `BUS_GO`).

The settings object `S`: `nTeams`, `perTeam`, `nCp`, `cpMode` (`node`/`trail`), `holdLimit` (seconds, `0` for no blocking, `Infinity`), `release` (`controller`/`back`/`held`), `tie` (`pass`/`first`/`lead`), `control: 'most'`, `sight` (`'all'`, meters, or `'third'`), `rescue`, `avoid`, `herd`, `guard`, `nStops` (1 to 4), `busEvery` (`'spread'` or seconds), `wrong` (0 to 1), `limit` (seconds), `oneAtATime`, `cols`, `rows`, `spacing`, `density` (`sparse`/`medium`/`dense`), `plan` (`go`/`start`/`red`, or an array with `'start'` or `'go'` per team), `strats` (one per team: `scatter`, `pairs`, `packs`, `team`, `blockers`, `wall`, `guards`).

### Test games

The findings in `notes/map-games.md` ("What the simulator shows") come from batches of games run in Node. The page's "Run 100 games" button does the same for one setup at a time.

To run batches, copy this script to a file outside the repo (scratch test scripts don't get committed), and run it from the repo root with `node <file>`. Each `batch` line plays the same 150 maps (seeds 1 to 150) with the default settings plus your changes, and prints wins per team (and games nobody won), seconds held per player, seconds held on the way to the bus once the team had every checkpoint, average finish, and how many wins came down to the tiebreak.

```js
const fs = require('fs');
const html = fs.readFileSync('site/static/games/road-block.html', 'utf8');
eval(html.split('/* SIM START */')[1].split('/* SIM END */')[0]); // makeMap, makeGame, step, fmt...

// the page's default settings
const DEFAULTS = {nTeams: 3, perTeam: 5, nCp: 10, cpMode: 'node', holdLimit: 60, release: 'controller',
  tie: 'lead', control: 'most', sight: 'all', rescue: true, avoid: true, herd: false, guard: false,
  nStops: 4, busEvery: 'spread', wrong: 0.05, limit: 3600, oneAtATime: true,
  cols: 6, rows: 5, spacing: 150, density: 'medium', plan: 'go', strats: ['pairs', 'scatter', 'blockers']};

function batch(label, changes, n = 150) {
  const S = Object.assign({}, DEFAULTS, changes), T = S.nTeams;
  const wins = new Array(T).fill(0), held = new Array(T).fill(0), late = new Array(T).fill(0);
  const fin = new Array(T).fill(0), finN = new Array(T).fill(0);
  let none = 0, tiebreak = 0;
  for (let seed = 1; seed <= n; seed++) {
    const M = makeMap(seed, S), G = makeGame(M, S, seed);
    G.quiet = true; // skip the event log (leave it on to read G.log)
    while (!G.over) {
      step(G);
      for (const p of G.players) if (p.heldSince != null && p.state === 'node' && G.teams[p.team].done) late[p.team]++;
    }
    const w = G.result.winner;
    if (w < 0) none++; else wins[w]++;
    if (w >= 0 && G.teams.some(t => t.i !== w && t.finishAt === G.teams[w].finishAt)) tiebreak++;
    G.teams.forEach((t, i) => { held[i] += t.heldSec / t.size; if (t.finishAt != null) { fin[i] += t.finishAt; finN[i]++; } });
  }
  const per = a => a.map(x => fmt(x / n)).join(' / ');
  console.log(`${label}\n  wins ${wins.join(' / ')} (none ${none}) | held ${per(held)} | held on the way to the bus ${per(late.map((x, i) => x / S.perTeam))}`
    + ` | finish ${fin.map((x, i) => finN[i] ? fmt(x / finN[i]) : '-').join(' / ')} | won on tiebreak ${tiebreak}`);
}

batch('Two blockers together / Everyone alone / Pairs', {strats: ['wall', 'scatter', 'pairs']});
batch('Same, one bus stop', {strats: ['wall', 'scatter', 'pairs'], nStops: 1});
batch('Same, the most and teams tied with it', {strats: ['wall', 'scatter', 'pairs'], tie: 'pass'});
batch('Same, every team plans the split', {strats: ['wall', 'scatter', 'pairs'], plan: 'start'});
```

Other things worth knowing:

- Games are deterministic: the same seed and settings give the same game, so two setups compared on seeds 1 to 150 differ only by the change. The page's "Run 100 games" uses random seeds instead.
- Each player has `team`, `role` (`runner` or `blocker`), `state` (`node`, `edge` or `done`), `node`, `heldSince`, `busAt`. Each team has `visited` (a Set of checkpoint indexes), `done`, `doneAt`, `finishAt`, `heldSec`. With `G.quiet = false`, `G.log` holds the event lines the page shows ("Red is held at intersection 4..."), which is the easiest way to count events or trace one game.
- To try a change without editing the page, patch the extracted text before `eval` (for example, `src.replace('const GUARD_WHEN=5;', 'const GUARD_WHEN=3;')`). `const` names inside the eval (like `STRATS`) aren't visible outside it; functions are.
- After editing the page, syntax-check its script: extract everything between `<script>` and `</script>` to a file and run `node --check` on it. Then run a quick sweep of every setting combination (a few seeds each) to catch errors.
- Batches of 150 games take a few seconds each on a 6 × 5 network. With 150 games, a difference of 10 wins or so can be chance.

### Conventions

- Plain language, no em dashes, "checkpoints", "block" for what a team does to an intersection.
- When the simulator's behavior or findings change, update the help page and the "What the simulator shows" section of `notes/map-games.md`.
