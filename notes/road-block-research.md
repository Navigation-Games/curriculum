# Road Block: research notes toward a paper

Started November 11, 2026, with Barb. The game's rules, the simulator and its findings are in `notes/map-games.md` ("Road Block"). This file collects the theory: what we've proved, what's known, and directions for a paper. Nothing is drafted yet. Where the paper lives and who the coauthors are is still open (see the end).

## What Barb wants from the paper

- Stay rooted in a fun multi-person, multi-team game.
- Look at different options for communication and what each player knows. That may be where the interesting results are.
- Find real-world applications.
- Ideally, find a surprisingly fast or useful algorithm, not only a hardness result.
- An NP-complete version would be nice. A quantum angle would be cool if there's an honest one (there mostly isn't; see below).

## Venue: FUN with Algorithms

FUN is the International Conference on Fun with Algorithms: a peer-reviewed computer science conference for algorithms and complexity results about games, puzzles and other playful topics. Typical papers: "Classic Nintendo games are (computationally) hard", the complexity of a card game, algorithms for a puzzle. The proceedings appear in LIPIcs (Dagstuhl), and at least one author must attend in person. It runs every two years: FUN 2026 was May 18 to 22, 2026, in Porquerolles, France (full papers were due January 13, 2026), so the next one is probably 2028 with a deadline around January 2028 (to confirm when its call comes out). A rigorous result about a real outdoor team game with a simulator is a good fit. Alternatives: a journal, or an arXiv preprint first.

## Quantum computers and NP-complete problems

- No efficient quantum algorithm is known for any NP-complete problem, and the class of problems quantum computers solve efficiently (BQP) is widely believed not to contain NP. A belief, like P ≠ NP, not a theorem.
- Grover's algorithm searches N possibilities in about √N steps. For 2^n candidate solutions that's 2^(n/2): faster, still exponential. Bennett, Bernstein, Brassard and Vazirani (1997) proved √N is the best possible for unstructured search. That's evidence, not proof, for real NP-complete problems, which have structure.
- Shor's exponential speedup is for factoring and discrete logarithms, which are in NP ∩ coNP and not believed NP-complete.
- Quantum annealing (D-Wave) and QAOA (Farhi, Goldstone, Gutmann 2014) work on QUBO / Ising formulations (Lucas 2014 gives them for all of Karp's 21 problems, vertex cover included). They are heuristics with no proven exponential speedup.
- For the paper: no promise of an efficient quantum solution. At most a short side note with a QUBO formulation and Grover's square-root speedup.

## Complexity of games, in short

The more back-and-forth, the harder, roughly a class per step. (Items marked * are from memory and need checking before they're cited.)

1. **One move each (leader, then follower).** Blockers place, the runner routes. If the follower's problem is easy (a shortest route), the leader's problem is typically NP-complete: our Theorem 1. If the follower's problem is itself NP-hard (visiting every checkpoint), the leader's question "is there a placement such that every response is slow?" is one level up, Σ₂ᵖ in the polynomial hierarchy (bilevel knapsack is complete there*).
2. **Many alternating moves.** "Does the first player have a winning strategy?" is usually PSPACE-complete for games of polynomial length (quantified Boolean formulas, Generalized Geography, Hex*), and EXPTIME-complete for games that can run exponentially long (n×n chess and Go*, cops and robbers with the number of cops part of the input*). Framework: Hearn and Demaine, *Games, Puzzles, and Computation* (2009)*.
3. **Teams with private information.** Much worse. Some team games where teammates can't see each other are undecidable (Peterson and Reif*; Hearn and Demaine*). Planning for a team that can't communicate: a finite-horizon decentralized POMDP is NEXP-complete even for two agents (Bernstein, Givan, Immerman, Zilberstein 2002), while one agent, or a team with free and instant communication, is PSPACE-complete (Papadimitriou and Tsitsiklis 1987*). **Communication changes the complexity class.**
4. **Simultaneous moves and equilibria.** A Nash equilibrium always exists, so finding one is PPAD-complete rather than NP-hard (Daskalakis, Goldberg, Papadimitriou*; Chen and Deng*). Asking for an equilibrium with a property (player 1 gets at least v) is NP-complete again (Gilboa and Zemel*; Conitzer and Sandholm*). Two-player zero-sum games are linear programming, so easy, unless there are exponentially many strategies (Colonel Blotto, network security games).
5. **Chance and uncertainty.** Playing against random events, or a network you discover as you go, tends to land in PSPACE (Papadimitriou's "games against nature"*; the Canadian traveller problem, Papadimitriou and Yannakakis 1991).

Road Block on that ladder: blockers place and a lone runner routes, NP-complete (proved below). Blockers place and a team must get every checkpoint, probably Σ₂ᵖ. Both teams moving and reacting, probably PSPACE or EXPTIME. Teams that can't see or talk to each other, possibly worse. The simulator covers the top rungs, where theory runs out.

## Theorem 1: blocker placement is NP-complete

**Road Block Placement.** A trail network is a graph whose edges are trails with integer lengths (walking times). An intersection is a node with at least 3 trails; bends and dead ends can't be blocked, and neither can the start S or the finish F. Given k blockers and a time T, the blocking team places its blockers at intersections before the race, and then a lone runner takes the fastest route from S to F. Can the blockers make that time more than T?

Why this is the real game: under the default rule, a lone runner arriving at an intersection held by one blocker is in a tie, and a tie freezes everyone. With "No time limit", a blocked intersection is a wall for a lone runner. With the same start and the same speed, a blocker can reach any intersection no later than a runner, so placing blockers before the race isn't unrealistic.

**Theorem 1.** Road Block Placement is NP-complete, even with every trail of length 1 and T = 5.

- In NP: given the placement, compute the runner's fastest route (Dijkstra).
- Still NP-complete with any hold limit of at least T, since a held runner can't finish in time.
- Still NP-complete if the other team travels in groups of g: each block needs g blockers to have the majority, so multiply k by g.

**Proof (reduction from Vertex Cover).** Given a graph H with n vertices, none isolated, and a number k. For each vertex v of H, three intersections L_v, M_v, R_v, with trails S–L_v (1), L_v–M_v (1), M_v–R_v (1), R_v–F (1), S–M_v (3), M_v–F (3). For each edge uv of H, trails L_u–R_v and L_v–R_u (1 each). Trails of length 3 are drawn with two bends, so all trails have length 1. Blockers: n + k. Time: T = 5.

- Every intersection has at least 3 trails: M_v has 4, and L_v and R_v have two plus one per neighbor. So the network follows the game's rules.
- Short routes (5 or less): S–L_v–M_v–F and S–M_v–R_v–F (5 each), and S–L_u–R_v–F for each edge, in both directions (3). The route S–M_v–F takes 6.
- **Key fact.** Every route from S to F except S–M_v–F has, as its first two intersections, one of the pairs {L_v, M_v}, {M_v, R_v}, or {L_u, R_v} with uv an edge. From S, a route goes to some L_x or M_x. From L_x, the next intersection is M_x or R_u for a neighbor u. From M_x, it's L_x, R_x, or straight to F. So the blockers stop every route of length 5 or less exactly when each of those pairs has a blocker on it: (L_v or M_v) and (M_v or R_v) for each vertex, (L_u or R_v) and (L_v or R_u) for each edge.
- **A cover of size k gives n + k blockers:** block both L_v and R_v for v in the cover, and M_v for every other v. Each vertex's pairs are hit. For an edge uv with u in the cover, L_u and R_u are blocked, which hits both of its pairs.
- **n + k blockers give a cover of size k:** each vertex's three intersections need at least one blocker (pair L_v, M_v). A vertex with exactly one must have it on M_v, to hit both of its pairs. Call vertices with two or more blockers "covered"; there are at most k of them. If an edge uv had neither end covered, then L_u and R_v are both unblocked, and the route S–L_u–R_v–F takes 3.
- Checked by brute force on 60 random graphs with 2 to 5 vertices: the fewest blockers was always n + (smallest vertex cover). The script is `check_reduction.py` in the session notes folder (move it next to the paper once the paper has a home).

This is our own write-up of the idea behind Baier et al.'s (2010) hardness proof for length-bounded node cuts. The threshold is sharp: with unit trails, T of 4 or less is polynomial (Lovász, Neumann-Lara and Plummer 1978; Baier et al. 2010, Table I).

**Easy cases.** Networks without loops (one route, so one blocker on it suffices); a fixed number of blockers (try every placement); T of 4 or less with unit trails.

**Is it interesting?** Not much on its own. Barb's point: blockers that stand still just delete intersections, so Theorem 1 is the known length-bounded cut problem in game clothes, and the planar case is probably known too (the edge version is NP-hard on planar graphs; van der Holst and de Pina 2002 may cover nodes, to check). Good as a lemma. The interesting results have to use what only Road Block has: majority, holds that end, blockers who are also racers, and limited communication.

## Directions

### A. When does blocking pay?

The simulator says spreading out usually beats blocking, except where there's a real bottleneck (one bus stop). Possible theorems:

- **Holds are delays, not walls.** With a 1-minute hold, a blocked intersection costs a held runner up to a minute, and the blocker picks the trail they leave by. The value of a block then depends on the detours around it. Something like: on a network where every intersection has a detour costing at most d, k blockers can delay a runner by at most a bound in k, d and the hold limit. That would explain why loopy networks make blocking weak.
- **Blockers are runners taken out of the race.** The question is whether a team does better diverting b players to block than having them run. Conditions under which it never pays, and networks where it provably does (a gate intersection on the way to the only bus stop).
- **Majority makes it Colonel Blotto on a network.** Both teams choose group sizes, and a block holds only against smaller groups.

### B. Communication and what players know

The game already has these options (`notes/map-games.md`, "Communication" and "Playing it in real life"): no radios (Level 1), texting within a team, operator-controlled channels, talk windows between teams for deals, GPS for teammates, an app as referee. The simulator has "From anywhere", "From 40 m away" and "Only when they get there" for seeing blocks.

- **Communication changes the complexity class** (see item 3 of the ladder): planning for a team that can't talk is NEXP-complete, and with free communication it's PSPACE-complete. A Road Block version of that would fit Barb's question exactly.
- **Value of information.** Discovering blocks only on arrival is the Canadian traveller problem. For one traveller facing up to k blocked roads, the best deterministic strategy is within a factor 2k+1 of the shortest route when you know everything (Westphal 2008*). With a team that texts what it sees, how much better can it do? There's work on several travellers, with and without communication (to find and check). A clean theorem: a team of r that shares sightings improves the worst case by some factor, compared with r players who can't talk.
- **Deals between teams.** With three teams, two can gang up on the leader, or one team can decide who wins. That's coalition game theory, and the operator's talk windows control it.
- **The simulator can measure all of these.** Texting isn't built yet (it's on the list in `notes/map-games.md`).

### C. A surprisingly fast or useful algorithm

- **A blocking map.** For every intersection at once: how much would blocking it delay a runner from the start to each checkpoint or bus stop? The "most vital node" algorithm finds the single most damaging node to remove from a shortest route in O(m + n log n) time, about the cost of one shortest-path computation (Nardelli, Proietti, Widmayer 2003, for 2-connected undirected networks with positive lengths). Uses: a game designer picks checkpoints and bus stops so blocking matters but doesn't decide the game; players see where blocking pays; storm crews see which intersection most needs clearing; in the simulator, blockers choose spots instantly. Still to work out: the version with a hold limit, where the blocker chooses the held player's exit.
- **First results (November 11, 2026)** are in "Blocking map: first results" below.
- **Exact answers on real maps.** On planar networks, the length-bounded cut is solvable in O((L+2)^(3L) · n) time (Kolman 2018): linear in the size of the network for a fixed route length L. That's a theory result; for routes of 10 or more trail segments the constant is huge. More practical: real trail networks may have small treewidth, so dynamic programming could be fast in practice. Testable on real park trail networks from OpenStreetMap.

### D. Real-world applications

- **Storm repair crews.** Two parts. Fallen trees block roads, and crews clear routes to reach repair sites: the post-disaster debris clearance problem (Çelik, Ergun, Keskinocak, *Operations Research* 2015). It's our blocking problem turned around: choose roads to clear so every site is reachable quickly, and the vertex cover reduction should flip to it. Then repair order and crew routing for the grid (Van Hentenryck and Coffrin, *Mathematical Programming* 2015). Communication ties in: after a storm, phone service is often down, crews learn which roads are blocked when they get there, and they share it when they can. That's a team Canadian traveller problem with patchy communication.
- **Guarding intersections and stations.** Security games: after the 2008 attacks, the Mumbai police placed a limited number of inspection checkpoints on the road network, chosen by an algorithm (Jain, Korzhyk, Vaněk, Conitzer, Pěchouček, Tambe, AAMAS 2011). Defender-attacker-defender models for infrastructure, with an electrical transmission example (Brown, Carlyle, Salmerón, Wood, *Interfaces* 2006). Majority fits guarding: how many guards a place needs depends on the size of the group coming.
- **What Road Block adds:** majority, and the cost of pulling people off the main job (a crew clearing a road isn't repairing lines; a guard at one station isn't at another). "When does blocking pay" is that staffing tradeoff in its simplest form.
- Others to check: the firefighter problem (blocking a spread on a network), evacuation routes, snowplow routing.
- For Navigation Games: Road Block lets students feel chokepoints, detours and when blocking pays, on a real map, with their feet.

## Blocking map: first results (November 11, 2026)

**Definition.** For a trip from a to b by a lone runner, and a group at intersection x that outnumbers the runner, the runner has two choices: avoid x (the fastest route without x), or go through, be held h seconds, leave by the trail the blocking team picks (the worst one for the runner), and then avoid x. The delay is the better of the two, minus the trip's normal time. With no hold limit, only the first choice exists, and the delay is the "replacement path" cost of removing x. The blocking map gives every intersection its total delay over trips between key places (start, checkpoints, bus stops), in both directions. The simulator's current choice for "Two blockers together" is the "busiest" intersection: the one on the most shortest routes between those same places.

**How it was tested.** A scratch Node script (kept out of the repo, like the simulator's test scripts) loads the simulator code, computes the map on each network (all distances with each intersection removed, a few milliseconds a map), and plays batches with Two blockers together / Everyone alone / Pairs at the default settings. The seeds are the usual 150 or more. The runner speed for converting meters to seconds is 2.9 m/s, the middle of the simulator's range.

**Findings.**

- **The map and the busiest count disagree about half the time.** The top spot was the same on 70 of 150 maps. The busiest intersection ranked about 2nd on the map on average, with about 72% of the top spot's value.
- **Being held never beats the detour.** On the default networks, a runner facing a 1-minute block whose exit the blocker picks always did better going around. So on networks with loops, a 1-minute block works like a wall, and the fast "most vital node" algorithms for removing a node apply as they are. The map's top spot affected about a third of the trips between key places, by 57 seconds on average, which is about one hold.
- **Choosing the spot by the map helps blocking a little, if at all.** Wins for Two blockers together, seeds 1 to 300, with each team's other players held about 50 to 55 s a player either way:

| Setting | Busiest | Map's top spot |
|---|---|---|
| Defaults | 49 | 60 |
| One bus stop | 72 | 83 |
| Seeing blocks only from 40 m | 56 | 65 |
| 40 m, one bus stop | 73 | 85 |

  The gain is about 10 wins in 300 games every time, but these rows share seeds, so they're not independent. On seeds 1 to 150 it was 24 vs 35, and on seeds 151 to 450 it was 50 vs 51. So: maybe a small real effect, not a reliable one.
- **Neither score predicts who wins.** Playing each map with the blockers at each of the 6 busiest intersections in turn, both scores predicted the other teams' time held only weakly (rank correlation about 0.3) and the blocking team's winning margin not at all (about 0). A score built from the trips the other teams actually walked in a game without blocking did no better. Where a team blocks matters much less than the fact that it's 2 runners short, which fits "spreading out wins."
- **A possible rule gap: sending players back at a gate.** Some intersections are gates: the only way from one key place to another (225 of 2,076 intersections over 150 maps; 115 of the maps have at least one). Under the current rule, the blocking team picks the trail a held player leaves by. At a gate it can send them back every time, so the player comes back, is held another minute, and is sent back again, for as long as the blockers stay. The simulator shows players held again at the same intersection 1.5 to 7 minutes after their last hold 549 times in 127 of 150 games, nearly all by Two blockers together. Many of those are rescue swaps rather than send-backs, but genuine returns happen (seed 1: Green held at intersection 11 at 3:54, sent toward 14 at 4:54, held at 11 again at 5:30). Possible fixes, for Barb to decide: the held player picks the way out (the simulator's "Who picks the way out" setting already has this), or a released player can't be held at the same intersection again for a few minutes.

**What this means for the paper.** The blocking map is cheap and well defined, and on networks with loops it reduces to the node-removal version, where fast algorithms are known. As a strategy tool in the simulator, it's a small improvement at best. That supports "blocking is hard to plan and rarely worth it" rather than a "surprisingly useful algorithm." The map may still be useful for game design (which maps make blocking matter) and for the storm-crew version, where a closed road is a wall rather than a team counting heads. Open algorithmic question: with a hold limit and the blocker picking the exit, the map needs, for every intersection x and every neighbor y, the fastest route from y avoiding x. Whether all of these can be found in about the time of one shortest-path computation is worth checking against the replacement-paths literature.

## Suggested story for the paper

"Blocking is hard to plan, often not worth it, and depends on what you know." Theorem 1 as a lemma (on grids, ideally, to match the simulator). The main results from A, B and C: a fast blocking map, when blocking pays, and how communication changes things. The simulator confirms with numbers. Real-world applications in the introduction and discussion.

## References

Checked November 11, 2026:

- Baier, Erlebach, Hall, Köhler, Kolman, Pangrác, Schilling, Skutella. Length-bounded cuts and flows. ACM Transactions on Algorithms 7(1), 2010.
- Ball, Golden, Vohra. Finding the most vital arcs in a network. Operations Research Letters 8(2):73-76, 1989.
- Bar-Noy, Khuller, Schieber. The complexity of finding most vital arcs and nodes. University of Maryland tech report CS-TR-3539, 1995.
- Bennett, Bernstein, Brassard, Vazirani. Strengths and weaknesses of quantum computing. SIAM Journal on Computing 26(5):1510-1523, 1997.
- Bernstein, Givan, Immerman, Zilberstein. The complexity of decentralized control of Markov decision processes. Mathematics of Operations Research 27(4):819-840, 2002.
- Brown, Carlyle, Salmerón, Wood. Defending critical infrastructure. Interfaces 36(6):530-544, 2006.
- Çelik, Ergun, Keskinocak. The post-disaster debris clearance problem under incomplete information. Operations Research 63(1):65-85, 2015.
- Chao, Golden, Wasil. The team orienteering problem. European Journal of Operational Research 88(3):464-474, 1996.
- Farhi, Goldstone, Gutmann. A quantum approximate optimization algorithm. arXiv:1411.4028, 2014.
- Golden, Levy, Vohra. The orienteering problem. Naval Research Logistics 34(3):307-318, 1987.
- Israeli, Wood. Shortest-path network interdiction. Networks 40(2):97-111, 2002.
- Jain, Korzhyk, Vaněk, Conitzer, Pěchouček, Tambe. A double oracle algorithm for zero-sum security games on graphs. AAMAS 2011, 305-312.
- Khachiyan, Boros, Borys, Elbassioni, Gurvich, Rudolf, Zhao. On short paths interdiction problems: total and node-wise limited interdiction. Theory of Computing Systems 43(2):204-233, 2008.
- Kolman. On algorithms employing treewidth for L-bounded cut problems. Journal of Graph Algorithms and Applications 22(2):177-191, 2018.
- Lovász, Neumann-Lara, Plummer. Mengerian theorems for paths of bounded length. Periodica Mathematica Hungarica 9(4):269-276, 1978.
- Lucas. Ising formulations of many NP problems. Frontiers in Physics 2:5, 2014.
- Nardelli, Proietti, Widmayer. Finding the most vital node of a shortest path. Theoretical Computer Science 296(1):167-177, 2003.
- Papadimitriou, Yannakakis. Shortest paths without a map. Theoretical Computer Science 84:127-150, 1991.
- Van Hentenryck, Coffrin. Transmission system repair and restoration. Mathematical Programming, 2015.

Still to check: Grover 1996 (STOC) and Shor 1994 (FOCS) page details; everything marked * above; van der Holst and de Pina 2002 (planar, node version?); Westphal 2008 and multi-traveller Canadian traveller work; cops and robbers; multi-agent path finding; Colonel Blotto on networks; the firefighter problem.

## Open with Barb

1. Which directions to pursue first (A, B, C, D, or the grid version of Theorem 1).
2. Where the paper lives: LaTeX in the repo (`papers/road-block/`) or a Google Doc.
3. Coauthors.
