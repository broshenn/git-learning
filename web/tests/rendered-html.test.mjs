import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Git learning site", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="zh-CN"/i);
  assert.match(html, /<title>Git 企业实战课｜从零到团队协作<\/title>/i);
  assert.match(html, /Git 实战课/);
  assert.match(html, /第 1 课：环境、项目与 Git 基本原理/);
  assert.match(html, /命令词典/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton/);
});

test("bundles all five courses and two reference documents", async () => {
  const [generated, page, layout] = await Promise.all([
    readFile(new URL("../content/courses.generated.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);

  for (const id of ["course-1", "course-2", "course-3", "course-4", "course-5"]) {
    assert.match(generated, new RegExp(`"id": ${JSON.stringify(id)}`));
  }
  assert.match(generated, /"id": "commands"/);
  assert.match(generated, /"id": "troubleshooting"/);
  assert.match(page, /<LearningApp \/>/);
  assert.match(layout, /lang="zh-CN"/);

  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});
