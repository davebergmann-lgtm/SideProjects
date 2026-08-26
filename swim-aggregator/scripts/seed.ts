import "dotenv/config";
import { createJob, runJob } from "../src/lib/pipeline";

// A mix of pasted text (masters sets, drills, coaching notes) so search is
// not empty on first load. Add URL / YouTube sources by running the app UI.
const SEEDS: Array<{ label: string; text: string }> = [
  {
    label: "Catch-up freestyle drill",
    text: `Catch-up drill (freestyle): Swim freestyle but keep one hand fully extended in front until the other hand touches it before beginning the next stroke. Emphasizes long, patient front-quadrant timing and body rotation. 4x50 easy with fins. Focus: catch, rotation, distance per stroke.`,
  },
  {
    label: "Fingertip drag drill",
    text: `Fingertip drag: Drag your fingertips along the water surface during the recovery phase of freestyle. Forces a high-elbow recovery and better rotation. 4x50 moderate. Common cue: "zip up the side seam".`,
  },
  {
    label: "6-1-6 backstroke rotation drill",
    text: `6-1-6 (backstroke): 6 kicks on your side with one arm extended, 1 stroke to rotate to the opposite side, 6 more kicks. Builds hip-driven backstroke rotation and body position. 8x25 with fins recommended.`,
  },
  {
    label: "Streamline kick on your back",
    text: `Streamline kick on back: Push off in a tight streamline face-up, kick 15m underwater dolphin, then flutter kick to the wall. 8x25 with fins. Focus: underwater dolphin, body position.`,
  },
  {
    label: "Threshold set 10x100 freestyle",
    text: `Main set: 10x100 freestyle @ 1:30 (or descend by pace group). Hold your CSS pace on every rep. Target stroke count ±1 across the set. Best for intermediate/advanced swimmers building threshold.`,
  },
  {
    label: "Sprint set 8x50 fast @ 1:00",
    text: `Sprint set: 8x50 freestyle FAST @ 1:00 rest interval. Odd 50s max effort with no breath in the last 5m; even 50s smooth build. Focus: speed, distance per stroke on the smooth ones.`,
  },
  {
    label: "3/5/7 breathing pattern",
    text: `3/5/7 breathing pattern (freestyle): 4x100, breathe every 3 strokes on the first 25, every 5 on the second, every 7 on the third, every 3 on the last. Builds CO2 tolerance and bilateral breathing.`,
  },
  {
    label: "Underwater dolphin off every wall",
    text: `Underwater dolphin off every wall: 6x75 freestyle, no breath and 5+ dolphin kicks off each wall. Rest 20s. Improves underwater kick and streamline discipline.`,
  },
  {
    label: "Pull set 6x150 freestyle with paddles + buoy",
    text: `Pull set: 6x150 freestyle with paddles and pull buoy @ 2:30. Descend 1-3, 4-6. Focus on catch and high-elbow pull. Skip paddles if shoulders feel loaded.`,
  },
  {
    label: "IM turns practice",
    text: `IM transition set: 8x50 IM order (fly-back, back-breast, breast-free, then repeat). Focus on legal turns, especially the back-to-breast crossover touch. @ 1:15.`,
  },
  {
    label: "Kick set 10x50 kickboard descending",
    text: `Kick set: 10x50 flutter kick with kickboard @ 1:15. Descend 1-5 and 6-10. Focus: kick from the hips, small tight kick, ankles relaxed.`,
  },
  {
    label: "Breaststroke pulldown practice",
    text: `Breaststroke pulldown practice: 6x25. Push off streamline, one deep pull-down to the thighs, one dolphin kick (legal), single breaststroke kick, then break out and swim to the wall. Focus: streamline, timing.`,
  },
  {
    label: "Butterfly one-arm drill",
    text: `One-arm fly: 8x25 butterfly with one arm at a time, other arm at your side. Alternate 25s per arm. Focus on hip-driven undulation and consistent 2 kicks per stroke.`,
  },
  {
    label: "Distance per stroke set",
    text: `DPS set: 6x100 freestyle. Count strokes per 25 and try to hold the count while descending pace. Rest 20s. Advanced swimmers only.`,
  },
  {
    label: "Warmup 400 mixed",
    text: `Warmup: 400 mixed. 100 freestyle easy, 100 backstroke easy, 100 kick with board, 100 pull with buoy. Build effort throughout.`,
  },
  {
    label: "Cooldown 200 easy",
    text: `Cooldown: 200 easy freestyle, breathing every 3, focus on long strokes and low heart rate.`,
  },
];

async function main() {
  for (const s of SEEDS) {
    process.stdout.write(`→ ${s.label}… `);
    const jobId = await createJob({ source_kind: "text", raw_input: s.text });
    try {
      await runJob(jobId);
      console.log("ok");
    } catch (err) {
      console.log(`FAILED: ${(err as Error).message}`);
    }
  }
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
