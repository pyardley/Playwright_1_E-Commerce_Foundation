import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import { Client } from "pg";

interface PerfRecord {
  recordedAt: string;
  suite: string | undefined;
  project: string | undefined;
  specFile: string;
  titlePath: string[];
  title: string;
  tags: string[];
  status: TestResult["status"];
  expectedStatus: TestCase["expectedStatus"];
  retry: number;
  durationMs: number;
  workerIndex: number;
  gitSha?: string;
  gitRef?: string;
  webVitals: unknown[];
}

function describeTitlePath(test: TestCase): string[] {
  const path: string[] = [];
  let suite: Suite | undefined = test.parent;
  while (suite && suite.type === "describe") {
    path.unshift(suite.title);
    suite = suite.parent;
  }
  return path;
}

function resolveGitInfo(): { gitSha?: string; gitRef?: string } {
  try {
    return {
      gitSha: execFileSync("git", ["rev-parse", "HEAD"], {
        encoding: "utf-8",
      }).trim(),
      gitRef: execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
        encoding: "utf-8",
      }).trim(),
    };
  } catch {
    return {};
  }
}

// Local-only: writes every test's duration + captured web-vitals (see
// fixtures/fixtures.ts's capturePerf auto-fixture) to a local Postgres
// database for trend tracking (e.g. via Grafana's built-in Postgres data
// source). Never registered in CI - see playwright.config.ts.
export default class PerfReporter implements Reporter {
  private rootDir = "";
  private git = resolveGitInfo();
  private records: PerfRecord[] = [];

  onBegin(config: FullConfig, _suite: Suite): void {
    this.rootDir = config.rootDir;
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const attachment = result.attachments.find(
      (a) => a.name === "perf-web-vitals.json",
    );
    let webVitals: unknown[] = [];
    if (attachment?.body) {
      try {
        webVitals = JSON.parse(attachment.body.toString("utf-8"));
      } catch (error) {
        console.error(
          `[perfReporter] failed to parse perf-web-vitals.json for "${test.title}":`,
          error,
        );
      }
    }

    this.records.push({
      recordedAt: new Date().toISOString(),
      suite: process.env.TEST_SUITE,
      project: test.parent.project()?.name,
      specFile: relative(this.rootDir, test.location.file).split(sep).join("/"),
      titlePath: [...describeTitlePath(test), test.title],
      title: test.title,
      tags: test.tags,
      status: result.status,
      expectedStatus: test.expectedStatus,
      retry: result.retry,
      durationMs: result.duration,
      workerIndex: result.workerIndex,
      ...this.git,
      webVitals,
    });
  }

  async onEnd(_result: FullResult): Promise<void> {
    const dbUrl = process.env.PERF_DB_URL;
    if (!dbUrl) {
      console.log(
        "[perfReporter] PERF_DB_URL not set - performance data not persisted this run",
      );
      return;
    }
    if (this.records.length === 0) return;

    const client = new Client({ connectionString: dbUrl });
    try {
      await client.connect();

      const schema = readFileSync(
        join(__dirname, "..", "db", "schema.sql"),
        "utf-8",
      );
      await client.query(schema);

      await client.query("BEGIN");
      for (const record of this.records) {
        await client.query(
          `INSERT INTO perf_results
            (recorded_at, suite, project, spec_file, title_path, title, tags,
             status, expected_status, retry, duration_ms, worker_index,
             git_sha, git_ref, web_vitals)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            record.recordedAt,
            record.suite ?? null,
            record.project ?? null,
            record.specFile,
            record.titlePath,
            record.title,
            record.tags,
            record.status,
            record.expectedStatus,
            record.retry,
            record.durationMs,
            record.workerIndex,
            record.gitSha ?? null,
            record.gitRef ?? null,
            JSON.stringify(record.webVitals),
          ],
        );
      }
      await client.query("COMMIT");

      console.log(
        `[perfReporter] persisted ${this.records.length} test result(s) to Postgres`,
      );
    } catch (error) {
      console.error(
        "[perfReporter] failed to persist performance data - is Postgres running? (npm run perf:db:up)",
        error,
      );
      try {
        await client.query("ROLLBACK");
      } catch {
        // connection may already be dead - nothing more to do
      }
    } finally {
      await client.end().catch(() => undefined);
    }
  }
}
