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

**Blocking.** The team with the most players at an intersection blocks it. (We say "block" because "control" is the orienteering word for a checkpoint.) A tie goes to the team already blocking: the block changes hands only when another team has more players. So players only need to know who blocks an intersection now, not the order everyone arrived in. If two teams reach an empty intersection at the same moment, rock-paper-scissors.

**Moving through.** If your team blocks an intersection, or is tied for most players there, you can pass through it or leave it in any direction. Every player who leaves changes the count, so leaving can hand the block to another team.

**Held players.** If you arrive at an intersection where another team has more players, you're held. You leave only when the blocking team says you can, by the trail they choose. Example: 2 Red and 1 Green are at intersection 12. Red blocks it. The Green player stays until Red releases them, and Red decides whether Green goes north toward the checkpoint or back south the way they came. If 2 more Greens arrive, Green has 3 to Red's 2: Green now blocks the intersection, and the Reds are held.

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
- **One player leaves an intersection at a time.** So a group that's holding someone can't all walk off at once, and each departure changes the count.
- **An intersection has at least 3 ways to leave it.** A bend in a trail (2 ways) or a dead end (1) isn't an intersection: no blocking or holding there, and it gets no number on the map.

### Levels

**Level 1: school path network.** The schoolyard or school and park paths, with cones or numbered markers at the intersections. No radios: teams talk only when they meet. A short game in one class period, with the teacher as the game operator. The finish can be the start instead of bus stops, or a few "pickup" cones around the edge with times on a whiteboard. Written up as an activity page: [Junction Control](https://curriculum.navigationgames.org/activities/core/junction-control/) (`content/activities/junction-control.md`).

**Level 2: forest trails, or anywhere out of sight.** A trail network in the woods, a large campus, or even a building with hallways, where players can't see each other. This is where the earpieces or texting, the game operator's channels, the talk windows between teams, and the bus stops come in.

### What the simulator shows

[Simulator](https://curriculum.navigationgames.org/games/junction-control.html) (November 2026; the file is `site/static/games/junction-control.html`, not linked from the site menus). Its [help page](https://curriculum.navigationgames.org/games/junction-control-help.html) explains every setting and how the players decide, and `site/static/games/README.md` covers how it's built and tested. Over 60 random games with the default rules (hold up to 1 minute, 5 players a team, 10 checkpoints):

- **Spreading out wins.** "Everyone alone" beats pairs and packs about three games in four, because covering checkpoints in parallel matters more than winning intersections. Whole-team-together never won.
- **Holding rarely happens by accident.** Teams lose only a second or two per player to holds, unless someone blocks on purpose.
- **One blocker per intersection doesn't pay.** A lone blocker is outnumbered by any pair, and the team is one runner short. Its team won 1 game in 60.
- **Two blockers together at the busiest intersection do work.** Other teams' players lose over a minute each to holds, and and the blocking team won 27 of 60 games against "everyone alone" when the whole team had to take the same bus. Once each player can take any bus, it won 15 to "everyone alone"'s 39, because players who are already spread out can each catch the nearest bus. This is still the play that makes blocking matter.
- **Spare players blocking doesn't pay either** (tested November 11, 2026). When a player has no checkpoint left that a teammate isn't already going for, the simulator normally sends them toward one anyway, as a backup. Sending them to block instead (at the busiest intersection, or next to a bus stop, with or without leaving early for the bus) cost their team about a minute: the backups get the last checkpoints sooner, because the team's split of checkpoints isn't perfect. The blocks held other teams only about 5 seconds a player, since the blocking starts late and one intersection catches few players by then. Sending spares to wait at a bus stop did a little better than blocking, but still worse than backing up.
- **Who can leave an intersection changes the game most** (November 11, 2026, Two blockers together vs Everyone alone vs Pairs). With "the most, and tied teams" and a 1-minute hold, Everyone alone won 67 of 100. With "only the blocking team" and no hold limit, 46, and the blockers 26. With Barb's "a lead frees everyone there, a tie freezes everyone", Everyone alone won 45 to 46 and players were held 1 to 4 minutes each. Under that rule, rescues cut the time held from about 9 minutes a player to 3.
- **Rescue is a swap** under the other two rules: one more teammate ties the count, the held player leaves, and the rescuer is left outnumbered in their place. Barb: switching off could let players rest.
- **Seeing blocks only up close** (40 or 100 m, or the last third of the trail) changed little: Everyone alone won 59 to 63 instead of 67.
- **Blockers timing their exit** to the last checkpoints changed finish times by about 10 seconds.
- On a schoolyard network (40 m between intersections), a game takes about 5 minutes. On forest trails (250 m), about 35.

### Open questions

- **How long can a team hold someone?** Without a limit, one player could be stuck all game. Options: a time limit (2 minutes, then the blocking team must release them, but still picks the direction), or held players can always go back the way they came. Holding "until they're no longer outnumbered" makes for interesting play (Barb, in the simulator): a held player's teammates have to come and even the count.
- **How does everyone see who's blocking?** Arrival order no longer matters (ties go to the team already blocking), but players still need to see the block at a glance. Low-tech, for Level 1: a team-colored clip or flag that the blocking team puts on the intersection marker. Fancier: team-colored light sticks like the ones at K-pop concerts, which glow the team's color, and maybe blink when a player is held. Concert light sticks are switched centrally by the venue's system; whether a game operator could do that is worth looking into. An electronic timing box at each intersection would also log every arrival, but that takes a lot of boxes.
- **Checkpoints at intersections or on the trails between them?** At intersections makes them worth fighting over; on trails makes route choice matter more.
- **Scoring if no team gets every checkpoint.** Most checkpoints by the last pickup time, with ties broken by arrival time at pickup?
- **Who can leave an intersection?** Three versions in the simulator: the team with the most and teams tied with it; only the blocking team; or Barb's idea (November 11, 2026), where a team with the most frees all its players there (they stay free as they leave one by one, so a rescue gets everyone out) and a tie for the most freezes everyone. Not yet thought through: under the last one, a lone player passing an intersection where two other teams are tied is stuck too.
- **Simulator, next:** players texting teammates (which checkpoints they have, which intersections are blocked and by whom) instead of knowing everything; and teams planning the checkpoint split at the start, as in the activity's planning time.
- **How to make blocking matter more,** since spreading out wins: more checkpoints than players, fewer loops in the network, or a bonus for holding an intersection.
