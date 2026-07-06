import { performance } from 'node:perf_hooks';

const baseUrl = (process.env.LOAD_TEST_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const eventId = process.env.LOAD_TEST_EVENT_ID ?? '991c4c5b-bb31-43d8-bcea-ab4bbf2c636a';
const stages = parseStages(process.env.LOAD_TEST_STAGES ?? '5x10,15x10,30x10');
const requestTimeoutMs = positiveInteger(process.env.LOAD_TEST_TIMEOUT_MS ?? '10000', 'LOAD_TEST_TIMEOUT_MS');
const isLocalTarget = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(baseUrl);

if (!isLocalTarget && process.env.ALLOW_REMOTE_LOAD_TEST !== 'true') {
  throw new Error('Remote load tests require ALLOW_REMOTE_LOAD_TEST=true.');
}

const endpoint = `${baseUrl}/events/${encodeURIComponent(eventId)}`;
const results = [];
let totalElapsedMs = 0;

console.log(`Target: ${endpoint}`);
console.log(`Stages: ${stages.map(stage => `${stage.concurrency} users / ${stage.durationSeconds}s`).join(', ')}`);

for (const stage of stages) {
  console.log(`\nRunning ${stage.concurrency} concurrent users for ${stage.durationSeconds}s...`);
  const stageRun = await runStage(stage);
  results.push(...stageRun.results);
  totalElapsedMs += stageRun.elapsedMs;
  printSummary(stageRun.results, stageRun.elapsedMs);
}

console.log('\nOverall');
const overall = printSummary(results, totalElapsedMs);
if (overall.errorRate > 0.01) {
  console.error('FAILED: error rate exceeded 1%.');
  process.exitCode = 1;
}

async function runStage({ concurrency, durationSeconds }) {
  const stageStartedAt = performance.now();
  const deadline = performance.now() + durationSeconds * 1000;
  const stageResults = [];

  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (performance.now() < deadline) {
      const startedAt = performance.now();
      let status = 0;
      let error;

      try {
        const response = await fetch(endpoint, {
          headers: { accept: 'application/json' },
          signal: AbortSignal.timeout(requestTimeoutMs)
        });
        status = response.status;
        await response.arrayBuffer();
        if (!response.ok) error = `HTTP ${response.status}`;
      } catch (requestError) {
        error = requestError instanceof Error ? requestError.message : String(requestError);
      }

      stageResults.push({
        durationMs: performance.now() - startedAt,
        status,
        error
      });
    }
  }));

  return {
    results: stageResults,
    elapsedMs: performance.now() - stageStartedAt
  };
}

function printSummary(stageResults, elapsedMs) {
  const durations = stageResults.map(result => result.durationMs).sort((a, b) => a - b);
  const errors = stageResults.filter(result => result.error);
  const summary = {
    requests: stageResults.length,
    errors: errors.length,
    errorRate: stageResults.length ? errors.length / stageResults.length : 1,
    p50: percentile(durations, 50),
    p95: percentile(durations, 95),
    p99: percentile(durations, 99),
    rps: elapsedMs ? stageResults.length / (elapsedMs / 1000) : 0
  };

  console.table({
    requests: summary.requests,
    errors: `${summary.errors} (${(summary.errorRate * 100).toFixed(2)}%)`,
    p50: `${summary.p50.toFixed(1)} ms`,
    p95: `${summary.p95.toFixed(1)} ms`,
    p99: `${summary.p99.toFixed(1)} ms`,
    rps: summary.rps.toFixed(1)
  });

  if (errors.length) {
    const errorCounts = errors.reduce((counts, result) => {
      const message = result.error ?? 'unknown';
      counts[message] = (counts[message] ?? 0) + 1;
      return counts;
    }, {});
    console.table(errorCounts);
  }

  return summary;
}

function percentile(sortedValues, value) {
  if (!sortedValues.length) return 0;
  const index = Math.ceil((value / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, index)];
}

function parseStages(value) {
  return value.split(',').map((rawStage) => {
    const [rawConcurrency, rawDuration] = rawStage.trim().toLowerCase().split('x');
    return {
      concurrency: positiveInteger(rawConcurrency, 'stage concurrency'),
      durationSeconds: positiveInteger(rawDuration, 'stage duration')
    };
  });
}

function positiveInteger(value, label) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer.`);
  }
  return parsed;
}
