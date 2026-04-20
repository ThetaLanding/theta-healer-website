import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const CONTENT_PATH = path.join(process.cwd(), "lib", "content.json");

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
    const content = await readContent();
    return NextResponse.json(content);
  } catch (error) {
    console.error("Error reading content.json", error);
    return NextResponse.json(
      { error: "Failed to read content" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await writeContent(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error writing content.json", error);
    return NextResponse.json(
      { error: "Failed to write content" },
      { status: 500 }
    );
  }
}

