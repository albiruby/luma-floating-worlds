import { buildSampleFeaturedDuelReplay, FEATURED_COMMUNITY_STAGES } from '../../game/communityStages';
import { generateDailyRiftSpec, parseRiftChallengeCode } from '../../game/dailyRift';
import { computeStageHash, verifyReplayDeterministically } from '../../game/echoEngine';
import { validateCustomLevel } from '../../game/stageValidator';
import { QATestResult } from '../debugTypes';

export function runUnboundSuite(): QATestResult[] {
  const results: QATestResult[] = [];

  // 1. Validate all Featured Community Stages via bounded BFS solver
  const tFeaturedStart = performance.now();
  let featuredFailures = 0;
  let featuredWarnings = 0;
  const featuredNotes: string[] = [];

  for (const stageFile of FEATURED_COMMUNITY_STAGES) {
    const res = validateCustomLevel(stageFile.level);
    if (res.status === 'INVALID') {
      featuredFailures += 1;
      featuredNotes.push(`${stageFile.title}: ${res.summary}`);
    } else if (res.status === 'WARNING' || res.status === 'UNVERIFIED') {
      featuredWarnings += 1;
      featuredNotes.push(`${stageFile.title}: ${res.status}`);
    }
  }

  results.push({
    id: 'unbound-featured-bfs',
    suite: 'unbound',
    name: `Featured Stages Solvability (${FEATURED_COMMUNITY_STAGES.length} stages)`,
    status: featuredFailures > 0 ? 'FAIL' : featuredWarnings > 0 ? 'WARNING' : 'PASS',
    executionMode: 'static-logic',
    message:
      featuredFailures > 0
        ? `Invalid featured stages: ${featuredNotes.join('; ')}`
        : featuredWarnings > 0
          ? `Featured stages passed structural checks with warnings: ${featuredNotes.join('; ')}`
          : `All ${FEATURED_COMMUNITY_STAGES.length} featured stages verified solvable (VALID).`,
    durationMs: Number((performance.now() - tFeaturedStart).toFixed(2)),
  });

  // 2. Deterministic Replay & Stage Hash Verification
  const tReplayStart = performance.now();
  const astralStage = FEATURED_COMMUNITY_STAGES.find((s) => s.id === 'featured_astral_duet');
  if (!astralStage) {
    results.push({
      id: 'unbound-replay-det',
      suite: 'unbound',
      name: 'Deterministic Replay Verification',
      status: 'FAIL',
      executionMode: 'static-logic',
      message: 'Featured stage featured_astral_duet is missing.',
      durationMs: Number((performance.now() - tReplayStart).toFixed(2)),
    });
  } else {
    const sampleReplay = buildSampleFeaturedDuelReplay();
    const expectedHash = computeStageHash(astralStage.level);
    const verification = verifyReplayDeterministically(astralStage.level, sampleReplay);
    const hashMatches = sampleReplay.stageHash === expectedHash;
    results.push({
      id: 'unbound-replay-det',
      suite: 'unbound',
      name: 'Deterministic Replay & StageHash Verification',
      status: hashMatches && verification.verified && verification.timelinePositions.length > 0 ? 'PASS' : 'FAIL',
      executionMode: 'static-logic',
      message:
        hashMatches && verification.verified && verification.timelinePositions.length > 0
          ? `Sample duel replay deterministically verified (${verification.timelinePositions.length} ticks, ${verification.simulatedSeconds.toFixed(2)}s, hash ${expectedHash}).`
          : `Verification failed: hashMatch=${hashMatches}, verified=${verification.verified}, reason=${verification.reason}.`,
      durationMs: Number((performance.now() - tReplayStart).toFixed(2)),
    });
  }

  // 3. Daily/Weekly/Monthly Rift Seeded Generator & Code Round-trip
  const tRiftStart = performance.now();
  const daily = generateDailyRiftSpec('daily', new Date('2026-11-17T00:00:00Z'));
  const weekly = generateDailyRiftSpec('weekly', new Date('2026-11-17T00:00:00Z'));
  const monthly = generateDailyRiftSpec('monthly', new Date('2026-11-17T00:00:00Z'));
  const parsedDaily = parseRiftChallengeCode(daily.challengeCode);
  const allValid =
    daily.verifiedBySolver &&
    weekly.verifiedBySolver &&
    monthly.verifiedBySolver &&
    parsedDaily?.seed === daily.seed;

  results.push({
    id: 'unbound-daily-rift',
    suite: 'unbound',
    name: 'Daily / Weekly / Monthly Rift Generator',
    status: allValid ? 'PASS' : 'FAIL',
    executionMode: 'static-logic',
    message: allValid
      ? `All 3 Rift cadences generated & solver-verified (${daily.challengeCode}).`
      : `Rift check failed (daily=${daily.verifiedBySolver}, weekly=${weekly.verifiedBySolver}, monthly=${monthly.verifiedBySolver}).`,
    durationMs: Number((performance.now() - tRiftStart).toFixed(2)),
  });

  return results;
}
