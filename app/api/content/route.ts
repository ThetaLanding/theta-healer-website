import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const CONTENT_PATH = path.join(process.cwd(), "lib", "content.json");
const DEFAULT_CONTENT_PATH = "lib/content.json";
const DEFAULT_BRANCH = "main";

function getErrorDetails(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown server error";
}

type GitHubConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  contentPath: string;
};

type GitHubContentResponse = {
  content: string;
  sha: string;
};

function shouldUseGitHubStorage() {
  return Boolean(process.env.VERCEL);
}

function getGitHubConfig(): GitHubConfig {
  const token = process.env.GITHUB_TOKEN?.trim();
  const owner = process.env.GITHUB_REPO_OWNER?.trim();
  const repo = process.env.GITHUB_REPO_NAME?.trim();
  const branch = process.env.GITHUB_BRANCH?.trim() || DEFAULT_BRANCH;
  const contentPath =
    process.env.GITHUB_CONTENT_PATH?.trim() || DEFAULT_CONTENT_PATH;

  if (!token || !owner || !repo) {
    throw new Error(
      "Missing GitHub env vars. Required: GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME."
    );
  }

  return { token, owner, repo, branch, contentPath };
}

async function fetchGitHubContent(config: GitHubConfig) {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.contentPath}?ref=${encodeURIComponent(config.branch)}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `GitHub read failed (${response.status}): ${details || "No details"}`
    );
  }

  const data = (await response.json()) as GitHubContentResponse;
  const decoded = Buffer.from(data.content, "base64").toString("utf8");
  return { parsed: JSON.parse(decoded), sha: data.sha };
}

async function readContent() {
  const data = await fs.readFile(CONTENT_PATH, "utf8");
  return JSON.parse(data);
}

async function writeContent(content: unknown) {
  const data = JSON.stringify(content, null, 2);
  await fs.writeFile(CONTENT_PATH, data, "utf8");
}

export async function GET() {
  try {
    if (shouldUseGitHubStorage()) {
      const config = getGitHubConfig();
      const { parsed } = await fetchGitHubContent(config);
      return NextResponse.json(parsed);
    }

    const content = await readContent();
    return NextResponse.json(content);
  } catch (error) {
    console.error("Error reading content.json", error);
    return NextResponse.json(
      { error: "Failed to read content", details: getErrorDetails(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (shouldUseGitHubStorage()) {
      const config = getGitHubConfig();
      const { sha } = await fetchGitHubContent(config);
      const data = JSON.stringify(body, null, 2);
      const encoded = Buffer.from(data, "utf8").toString("base64");
      const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.contentPath}`;
      const message = "Update content via admin";

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          content: encoded,
          sha,
          branch: config.branch,
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(
          `GitHub write failed (${response.status}): ${details || "No details"}`
        );
      }

      return NextResponse.json({
        success: true,
        storage: "github",
      });
    }

    await writeContent(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error writing content.json", error);
    return NextResponse.json(
      { error: "Failed to write content", details: getErrorDetails(error) },
      { status: 500 }
    );
  }
}

