# Games on a map

Game ideas that use a map, beyond the activities in the curriculum. Each one is a draft: the idea, how it might work, and the questions still open. Add new games as their own section.

## Junction Control (trail network game)

**The idea.** Teams race to visit every checkpoint, but they can only travel on trails, and whoever has the most players at an intersection blocks it. Players who arrive outnumbered get held there until the blocking team lets them go. So a team has to decide when to spread out to cover checkpoints and when to travel together to win intersections.

**What it teaches.** The introductory level of map navigation: knowing where you are on a trail network, choosing a route, and following it. Every intersection is a decision point, and the game makes players stop at intersections, count, and decide which way to go next. That's concepts 17 to 20 in the [Navigation Games Progression](/reference/frameworks/skill-concept-sequence/) (following trails as handrails, decisions at junctions, tracking progress along a route, route choice), and the OUSA Basic skills of thumbing the map and choosing the right direction at intersections ([OUSA skill levels](/reference/frameworks/ousa-skill-levels/)). Being held, or a closed intersection, forces a new route on the spot.

**Where.** Any area with a network of trails or paths and lots of intersections: a park, a campus, a conservation area. The map shows the trails, the intersections (numbered), the checkpoints, and the pickup points at bus stops around the edge.

**Teams.** Three teams, Red, Green and Blue, with the same number of players (maybe 4 to 8 each). Teams can also face off head to head: two teams at a time, as heats of a tournament, or Red vs Green on one network while Blue plays the winner later.

### Rules (draft)

**Stay on trails.** Players travel only on trails shown on the map. Leaving a trail (cutting a corner, crossing a field) is a penalty.

**Being at an intersection.** A player is "at" an intersection when they are within a set distance of its center (5 steps?) or touching its marker.

**Blocking.** The team with the most players at an intersection blocks it. (We say "block" because "control" is the orienteering word for a checkpoint.) A tie goes to the team already blocking: the block changes hands only when another team has more players. So players only need to know who blocks an intersection now, not the order everyone arrived in.

**Moving through (decided November 11, 2026).** If your team has the most players at an intersection, you can pass through it or leave it in any direction, and teammates who are leaving go together, at the same moment. The rest can stay. (Barb: if they left one by one, there'd be a moment when they no longer had the most and could still leave.) A tie for the most freezes everyone there until the count changes. Every departure changes the count, so leaving can hand the block to another team. The other two versions tried in the simulator are adaptations in the activity: tied teams can leave too (rock-paper-scissors if two teams reach an empty intersection at the same moment), or only the blocking team can leave.

**Held players.** If you arrive at an intersection where another team has more players, you're held. You leave when enough teammates arrive to give your team the most, or after one minute (the hold limit), by the trail the blocking team chooses. A tie also ends after one minute. Example: 2 Red and 1 Green are at intersection 12. Red blocks it. The Green player stays until Red releases them, and Red decides whether Green goes north toward the checkpoint or back south the way they came. If 1 more Green arrives, it's a tie, and nobody can leave. If 2 more arrive, Green has 3 to Red's 2: Green now blocks the intersection, the Greens can leave together, and the Reds are held.

**Herding (variation, November 2026).** Blocking happens on the trails too. When two teams meet coming toward each other and one has more players, the smaller group turns around and is herded along in front of the bigger one, at a steady pace, until the next intersection. There the usual rules apply: they're outnumbered, so they're held. Same size: both step aside and pass. In the simulator as a checkbox. Over 40 games it happened 3 to 5 times a game and cost players 5 to 15 seconds each, a bit more for teams that spread out, but "everyone alone" still won most games.

**No contact.** Blocking is a rule, not a body block. Nobody touches, grabs or stands in another player's way. Held players step to the side of the trail.

**Goal.** A team wins by having someone on the team visit every checkpoint, and getting everyone onto a bus first. A team's finish time is when its last player's bus leaves. If two teams finish on buses leaving at the same moment, the team whose last player reached a bus stop first wins. Proof of a visit: a code at the checkpoint, a photo, or an electronic punch.

**Pickup.** Each bus stop on the edge of the map has pickup times. Once the team has every checkpoint, each player can take any bus from any stop. The team finishes when its last player's bus leaves, so one player who gets held can cost the team.

### Communication

Every player wears an earpiece or carries a phone for texting. A game operator runs the game from a base and sets the channels:

- **Team channel.** Each team talks among itself the whole game.
- **Operator to all.** The operator announces rule changes, closes an intersection, adds a bonus checkpoint, or rules on disputes.
- **Between teams.** Only during windows the operator opens (the first 5 minutes, or one window mid-game). This is where deals happen: "Let our runner through 7 and we'll release yours at 12." Whether deals are binding is up to the players.

The operator can also decide who gets which channel when: for example, giving a team that's behind a few minutes of the other teams' channel.

### Decided (November 2026)

- **Any lead blocks** (3 vs 2+2 is a block).
- **A lone player at an intersection blocks it**, and can leave at any time in any direction.
- **Ties go to the team already blocking.** Nobody has to track arrival order.
- **The most can leave, a tie freezes everyone, and a hold lasts at most 1 minute** (November 11). This is the default in the simulator and the rule in the activity.
- **Teammates leaving with the most go together.** Otherwise one player leaves an intersection at a time, so each departure changes the count.
- **An intersection has at least 3 ways to leave it.** A bend in a trail (2 ways) or a dead end (1) isn't an intersection: no blocking or holding there, and it gets no number on the map.

### Levels

**Level 1: school path network.** The schoolyard or school and park paths, with cones or numbered markers at the intersections. No radios: teams talk only when they meet. A short game in one class period, with the teacher as the game operator. The finish can be the start instead of bus stops, or a few "pickup" cones around the edge with times on a whiteboard. Written up as an activity page: [Junction Control](https://curriculum.navigationgames.org/activities/core/junction-control/) (`content/activities/junction-control.md`).

**Level 2: forest trails, or anywhere out of sight.** A trail network in the woods, a large campus, or even a building with hallways, where players can't see each other. This is where the earpieces or texting, the game operator's channels, the talk windows between teams, and the bus stops come in.

### What the simulator shows

[Simulator](https://curriculum.navigationgames.org/games/junction-control.html) (November 2026; the file is `site/static/games/junction-control.html`, not linked from the site menus). Its [help page](https://curriculum.navigationgames.org/games/junction-control-help.html) explains every setting and how the players decide. `site/static/games/README.md` covers how it's built, and has a script for running test games.

**Read this first.** These are simulated players following simple rules, not kids, and results shift with the other teams' ways of playing and with the settings. The help page section "What the simulator has shown" is the tempered summary (November 11, 2026, all on the same 150 maps): matchups at the default settings first, then Two blockers together / Everyone alone / Pairs with one setting changed at a time. In short: at the defaults spreading out did best, blocking paid only against teams traveling in groups, the rule for who can leave mattered most, fewer bus stops and fewer checkpoints helped blocking a little, and distance, network size, loops, sight and wrong turns changed little besides game length. The sections below are the working record, and some of their numbers come from earlier versions of the simulator.

**How these were measured.** Batches of 100 to 150 random games, run in Node. Unless it says otherwise: three teams of 5, 10 checkpoints at intersections, a 6 × 5 network with 150 m between points and some loops, hold up to 1 minute, the team with the most and tied teams can leave (the default until November 11; the planning findings use the new default, a lead frees all), players always know every block, rescue on, 4 bus stops with a bus somewhere every 75 seconds. Wins for three teams are listed in team order, for example "Two blockers together / Everyone alone / Pairs: 20 / 100 / 30". With 150 games, a difference of 10 wins or so can be chance. The simulator changed during November 2026 (bends stopped counting as intersections, rescue became a swap, blockers started timing their exit), so older numbers are rough.

**Ways of playing**

- **Spreading out wins.** "Everyone alone" wins most games against pairs, packs and blockers. Covering checkpoints in parallel matters more than winning intersections. "Whole team together" never won.
- **Holding rarely happens by accident.** Without blockers, players lose a second or two each to holds.
- **One blocker per intersection doesn't pay.** A lone blocker is outnumbered by any pair, and the team is a runner short.
- **Two blockers together at the busiest intersection is the play that makes blocking matter.** Other teams' players lose 40 seconds to a minute each to holds. It still wins less often than "everyone alone": 20 / 100 / 30 against Everyone alone and Pairs. Back when the whole team had to take the same bus, it won 27 of 60 against Everyone alone.

**Who goes for which checkpoint**

- Each group heads for the nearest checkpoint no teammate is going for, decided as they go. When none is left, it backs up a teammate by heading for the nearest one anyway. Backing up is worth about a minute, because the split isn't planned and a backup is often closer than the teammate who claimed it.
- **Spare players blocking doesn't pay** (November 11). Sending players with nothing left to claim to block instead (at the busiest intersection or next to a bus stop, leaving early for the bus or not) cost their team about a minute, and held other teams only about 5 seconds a player. Sending them to wait at a bus stop was a little better than blocking, still worse than backing up. Open: would a team that plans its split at the start, as in the activity's planning time, have real spare players? Not tested yet.

**Rescue**

- Before November 11, a rescue sent one teammate to tie the count. Over 100 games: with tied teams able to leave, the two left one at a time and the second was outnumbered again, so a rescue was really a swap, and with no hold limit the rescuer walked off first about two times in three. With "only the blocking team can leave", both players were stuck in about half the rescues.
- Now a rescue is a deliberate swap: the held player leaves first and the rescuer stays. Barb: switching off could let players rest. Under "a lead frees all", the rescuer gives the team the most players, so both leave.
- **Rescue from the bus stop** (Barb, November 11). Once a team has every checkpoint, it sends as many players as it takes to free a held teammate, from anywhere, even from a bus stop before their bus leaves, if they'd get there before the hold limit lets the held player go. Not under "the most and tied teams", where a rescue is only a swap. Before this, with "a lead frees all" and no hold limit, a team with every checkpoint never got everyone onto a bus in 60 of 150 games, and nobody won 8. Now none.
- Rescues matter most with no hold limit: with "a lead frees all", they cut time held from 7 to 8 minutes a player to about 1.5, and games where nobody won from 24 of 150 to none. With "only the blocking team", rescue helped the other teams against Two blockers together (50 / 60 / 40 with rescue, 19 / 94 / 37 without). With "the most and tied teams", rescue on or off changes little.

**Who can leave an intersection** (Two blockers together / Everyone alone / Pairs, seeds 1 to 150 for each row)

| Who can leave | Hold limit | Wins | Held, per player (other teams) |
|---|---|---|---|
| The most, and tied teams | 1 minute | 20 / 100 / 30 | about 40 s |
| The most, and tied teams | Until not outnumbered | 23 / 102 / 25 | about 1 min |
| Only the blocking team | 1 minute | 42 / 86 / 22 | about 50 s |
| Only the blocking team | Until not outnumbered | 40 / 67 / 43 | about 1.5 min |
| A lead frees all, a tie freezes all | 1 minute | 22 / 78 / 50 | about 50 s |
| A lead frees all, a tie freezes all | Until not outnumbered | 19 / 76 / 55 | about 1.5 min |

The rule for leaving changes the game more than anything else tried. The "lead" rows are with the leading team's players leaving together, and players able to leave a bus stop to rescue (both since November 11). Before that, when they left one by one and stayed free, Two blockers together won 35 (1 minute) and 29 (no limit), and other teams were held about a minute each, so leaving together made blocking weaker. With no hold limit and rescue off, players were held 7 to 8 minutes each and nobody won 24 of the 150 games within the hour.

**Seeing blocks**

- Seeing blocks only up close changed little: Everyone alone won 95 of 150 with "from 40 m away" or "only when they get there", against 100 when players always know (100 m and the last third of the trail were similar in a 100-game run). Players who see a block up close turn back about once every three games, or about twice a game when ties freeze everyone and there's no hold limit.

**Blockers and the bus**

- Blockers leave once each remaining checkpoint (two at most) has a teammate headed for it, timed to catch a bus no later than the last of those teammates (Barb's rule). A first version that assumed the nearest teammate would get each checkpoint sent them almost 2 minutes early. Now they leave about a minute before the last checkpoint, and finish times change by about 10 seconds compared with waiting until the team has every checkpoint. Blockers were the team's last ones onto a bus in about 1 game in 8 either way.

**Making blocking pay at the end**

- Why late blocking is weak: by the end, the other teams are spread out, heading for different checkpoints and stops; detours around a visible block are cheap on a network with loops; and a one-minute hold often costs less than the wait for a bus.
- **Guarding helps only a little** (November 11). With guarding on, a held player doesn't get the checkpoint at that intersection; once some team has 5 or fewer left, blockers guard a checkpoint other teams still need; and attackers who know about a guard gather enough players to take it. Two blockers together won 33 of 150 with guarding against 20 without, when tied teams can leave. With the other two rules the difference was within chance (40 vs 42, 37 vs 35). "Everyone alone, spares guard" did no better than Everyone alone, and worse when tied teams can leave, because one player arriving ties a single guard. Guarding moves blockers off the busiest intersection, so other teams were held less overall. The first version guarded too late and without checking where other players were: in one traced game, Blue took the guarded checkpoint 20 seconds after Red's guards set out. Choosing only checkpoints the guards can reach at least 15 seconds first fixed most of that.
- **Fewer bus stops makes blocking pay; fewer buses doesn't** (November 11). With one or two stops, the busiest intersections are on everyone's way to the bus. Two blockers together / Everyone alone / Pairs, 150 games:

| Buses | The most, and tied teams | Only the blocking team | A lead frees all (leaving together, bus stop rescues) |
|---|---|---|---|
| 4 stops, every 5:00 each (the default) | 20 / 100 / 30 | 42 / 86 / 22 | 22 / 78 / 50 |
| 4 stops, every 10:00 each | 31 / 79 / 40 | 39 / 78 / 33 | 28 / 72 / 50 |
| 2 stops, every 2:30 each | 42 / 76 / 32 | 40 / 79 / 31 | 31 / 75 / 44 |
| 2 stops, every 5:00 each | 37 / 84 / 29 | 45 / 83 / 22 | 29 / 71 / 50 |
| 2 stops, every 10:00 each | 30 / 77 / 43 | 38 / 72 / 40 | 30 / 81 / 39 |
| 1 stop, every 1:15 | 40 / 76 / 34 | 47 / 68 / 35 | 36 / 74 / 40 |

- Sparser buses mostly add waiting (1 to 3 minutes a game) and ties: with 2 stops and a bus every 10 minutes, 108 of 150 games were won on the tiebreak. Players were held on the way to the bus only about 10 seconds each in every version, so a costlier missed bus didn't make end-game holds more common.
- With one stop, how often buses leave can't change the finish order: arriving sooner never means a later bus, and ties go to the team whose last player arrived first. A one-stop game is really "first team with everyone at the finish", like Level 1. With one stop and a bus only every 5 minutes, the winner's bus carried another team in 102 to 116 of 150 games.

**One at a time, and routing around blocks** (November 11)

- **Leaving one at a time matters most when tied teams can leave.** Turned off, a rescuer who ties the count leaves together with the held player, so a rescue frees them instead of swapping: Pairs won 52 of 150 instead of 29 and were held 12 seconds a player instead of 40. Under "a lead frees all" it changes little, since the leading team leaves together anyway. Under "only the blocking team", other teams were held about 10 seconds less.
- **Routing around blocks** (players plan routes with a penalty for intersections they know they'd be held at) saved Everyone alone about 20 seconds a game when players always know every block. With sight of 40 m or less it made no difference: players rarely know about a block before they're on the trail to it.

**Planning the split** (November 11)

- With "Planned at the start", each team divides the checkpoints among its groups before the start, balancing route times (slices by direction from the start, then moving or swapping checkpoints out of the slowest route). Groups take the nearest checkpoint left on their own list, and help out when it's done.
- **Planning helps.** Three teams of Everyone alone, only Red planning: Red won 64 of 150 (77 when tied teams can leave), where an even share is 50. Pairs that plan won 35 against two teams of Everyone alone, against 21 without planning. Planning teams finish 20 seconds to a minute sooner.
- **Planning doesn't make blocking pay on its own.** With every team planning, Two blockers together (and 3 runners) won 27 of 150 against two teams of Everyone alone, 31 when tied teams can leave. Other teams were held about 50 s each. It came close to an even share only when the team had players to spare: 6 checkpoints for 5 players, 41; one bus stop, 42 (33 without planning). With 8 players a team, it won 24.

**Other**

- **Herding** happens 3 to 5 times a game and costs players 5 to 15 seconds each, a bit more for teams that spread out. Everyone alone still wins most games.
- **Intersections.** Since November 11, only places with 3 or more ways out count. A 6 × 5 network has about 16 intersections among its 30 points with some loops (12 with few loops, 22 with many). A 4 × 3 network has 4 to 7, so some checkpoints go at bends and dead ends.
- **Game length** (November 11, defaults): Everyone alone finished in about 5 minutes on schoolyard paths 40 m apart, 9 at 80 m, 13 at 150 m and 20 on forest trails 250 m apart.

### Open questions

- **Who can leave, and how long a hold lasts:** decided November 11 (see "Moving through" and "Held players" above). Still to watch: a lone player passing an intersection where two other teams are tied is stuck too, for up to a minute. Holding "until they're no longer outnumbered" makes for interesting play (Barb, in the simulator), and is an adaptation in the activity.
- **How does everyone see who's blocking?** Arrival order no longer matters (ties go to the team already blocking), but players still need to see the block at a glance. Low-tech, for Level 1: a team-colored clip or flag that the blocking team puts on the intersection marker. Fancier: team-colored light sticks like the ones at K-pop concerts, which glow the team's color, and maybe blink when a player is held. Concert light sticks are switched centrally by the venue's system; whether a game operator could do that is worth looking into. An electronic timing box at each intersection would also log every arrival, but that takes a lot of boxes.
- **Checkpoints at intersections or on the trails between them?** At intersections makes them worth fighting over (and lets them be guarded); on trails makes route choice matter more.
- **How many bus stops, and how often?** Fewer stops makes blocking matter. With one stop, buses add nothing but waiting. Two stops keeps the choice of which bus to run for.
- **Scoring if no team gets every checkpoint.** Most checkpoints by the last pickup time, with ties broken by arrival time at pickup?
- **How to make blocking matter more,** since spreading out wins. Tried: guarding (a little), fewer bus stops (yes). Not tried: bus stops behind a single "gate" intersection, a last checkpoint every team must visit, the whole team on one bus, more checkpoints than players, fewer loops, a bonus for holding an intersection.
- **The name.** Still "Junction Control". Alternatives offered: Roadblock, Gridlock, Junction Block. A rename touches the activity file name and slug, `activitiesData.ts`, `site/docs/activities/core/index.md`, these notes, the simulator and help file names and titles, the games README, and the roadmap link.

### Where things stand (November 11, 2026)

- The simulator, its help page and the games README are up to date. The latest simulator work: "a lead frees all, a tie freezes all" with a 1-minute hold is the default, the leading team's leavers go together, and teams can plan the checkpoint split at the start.
- The Level 1 activity page (`content/activities/junction-control.md`) has the leaving rule, the 1-minute hold, the other two rules and no hold limit as adaptations, and intersections with at least 3 ways out.
- Simulator ideas not built yet: players texting teammates (which checkpoints they have, which intersections are blocked and by whom) instead of knowing everything; the untried end-game ideas above. Open: should "Planned at the start" be the simulator's default, since the activity has planning time? On the roadmap: the online multiplayer version ("Junction Control online" in `site/docs/editors/roadmap.md`).
