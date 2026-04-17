"use client";

import { useEffect, useState } from "react";
import RichTextEditor from "./RichTextEditor";
type Content = typeof import("../../lib/content.json");

const SECTION_KEYS = [
  "hero",
  "section2",
  "section3",
  "reviews",
  "about",
  "imagine",
  "screenshots",
  "section8",
  "truthCallout",
  "offer",
  "ctaBanner",
  "whyWorks",
  "closing",
  "footer",
] as const;

type SectionKey = (typeof SECTION_KEYS)[number];

const PASSWORD = "admin123";

const SECTION_LABELS: Record<SectionKey, string> = {
  hero: "Hero",
  section2: "Section 2",
  section3: "Section 3",
  reviews: "Reviews",
  about: "About",
  imagine: "Imagine",
  screenshots: "Screenshots",
  section8: "Section 8",
  truthCallout: "Truth Callout",
  offer: "Offer",
  ctaBanner: "CTA Banner",
  whyWorks: "Why Works",
  closing: "Closing",
  footer: "Footer",
};

export default function AdminPage() {
  const [inputPassword, setInputPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [content, setContent] = useState<Content | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authorized) return;
    const load = async () => {
      setError(null);
      try {
        const res = await fetch("/api/content");
        const json = await res.json();
        const normalizedSection8Items = Array.isArray(json.section8?.items)
          ? json.section8.items.map((item: { title?: string; body?: string }) => {
              const title = item?.title ?? "";
              const body = item?.body ?? "";
              const merged = [title, body].filter(Boolean).join(" ").trim();
              return {
                title: merged,
                body: "",
              };
            })
          : json.section8?.items;

        const screenshotImages = Array.isArray(json.screenshots?.images)
          ? [...(json.screenshots.images as string[])]
          : [];
        while (screenshotImages.length < 9) screenshotImages.push("");
        const normalizedScreenshots = {
          ...json.screenshots,
          images: screenshotImages.slice(0, 9),
        };

        setContent({
          ...json,
          section8: {
            ...json.section8,
            items: normalizedSection8Items,
          },
          screenshots: normalizedScreenshots,
        });
      } catch {
        setError("Failed to load content.");
      }
    };
    load();
  }, [authorized]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === PASSWORD) {
      setAuthorized(true);
      setInputPassword("");
      setError(null);
    } else {
      setError("Incorrect password.");
    }
  };

  const updateContent = (updater: (prev: Content) => Content) => {
    setContent((prev) => (prev ? updater(prev as Content) : prev));
  };

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(content, null, 2),
      });
      if (!res.ok) {
        throw new Error("Save failed");
      }
      setSuccess("Saved successfully.");
    } catch {
      setError("Failed to save content.");
    } finally {
      setSaving(false);
    }
  };

  if (!authorized) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f4f1ec] text-[#6b4f62] px-4">
        <form
          onSubmit={handleLogin}
          className="bg-white shadow-md rounded-lg px-8 py-6 w-full max-w-sm space-y-4"
        >
          <h1 className="text-xl">Admin Login</h1>
          <div className="space-y-2">
            <label className="block text-sm">Password</label>
            <input
              type="password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full px-6 py-2 text-xs tracking-[0.18em] uppercase bg-[#b8878a] text-white"
          >
            Log in
          </button>
        </form>
      </main>
    );
  }

  if (!content) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f4f1ec] text-[#6b4f62] px-4">
        <p>Loading content…</p>
      </main>
    );
  }

  const updateSection = (key: SectionKey, value: unknown) => {
    updateContent((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderEditor = (
    value: unknown,
    onChange: (next: unknown) => void,
    fieldPath: string
  ): React.ReactNode => {
    if (typeof value === "string") {
      const isColor = /(?:^|\.)(?:background|color)$/i.test(fieldPath);
      const isPathLike =
        /(?:src|href|image|backgroundImage)$/i.test(fieldPath) ||
        /images\.\d+$/i.test(fieldPath);
      if (isColor || isPathLike) {
        return (
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      }
      return <RichTextEditor value={value} onChange={(html) => onChange(html)} />;
    }

    if (Array.isArray(value)) {
      if (fieldPath === "about.paragraphs") {
        const combined = value.filter((item): item is string => typeof item === "string").join("\n\n");
        return (
          <div className="space-y-2">
            <label className="block text-sm">Paragraph</label>
            <RichTextEditor
              value={combined}
              onChange={(html) => onChange([html])}
            />
          </div>
        );
      }
      return (
        <div className="space-y-3">
          {value.map((item, idx) => (
            <div key={idx} className="space-y-2 border border-gray-200 rounded-md p-3">
              <label className="block text-xs text-gray-500">Item {idx + 1}</label>
              {renderEditor(
                item,
                (next) => {
                  const nextArray = [...value];
                  nextArray[idx] = next;
                  onChange(nextArray);
                },
                `${fieldPath}.${idx}`
              )}
            </div>
          ))}
        </div>
      );
    }

    if (value && typeof value === "object") {
      if (/^section8\.items\.\d+$/.test(fieldPath)) {
        const section8Item = value as { title?: string; body?: string };
        const merged = [section8Item.title ?? "", section8Item.body ?? ""]
          .filter(Boolean)
          .join(" ")
          .trim();
        return (
          <div className="space-y-2">
            <label className="block text-sm">Text</label>
            <RichTextEditor
              value={merged}
              onChange={(html) =>
                onChange({
                  title: html,
                  body: "",
                })
              }
            />
          </div>
        );
      }
      const entries = Object.entries(value as Record<string, unknown>);
      return (
        <div className="space-y-4">
          {entries.map(([key, nested]) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm capitalize">{key}</label>
              {renderEditor(
                nested,
                (next) =>
                  onChange({
                    ...(value as Record<string, unknown>),
                    [key]: next,
                  }),
                `${fieldPath}.${key}`
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <input
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };

  return (
    <main className="min-h-screen bg-[#f4f1ec] text-[#6b4f62] px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-2xl">Editor Dashboard</h1>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full px-6 py-2 text-xs tracking-[0.18em] uppercase bg-[#ffa769] text-[#6b4f62]"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </header>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-emerald-700">{success}</p>}

        {SECTION_KEYS.map((sectionKey) => (
          <section key={sectionKey} className="space-y-4 bg-white rounded-lg p-6">
            <h2 className="text-xl">{SECTION_LABELS[sectionKey]}</h2>
            {sectionKey === "screenshots" && (
              <p className="text-sm text-gray-600">
                Nine slots (grid). Prefer a root path from <code className="text-xs">public/</code>, e.g.{" "}
                <code className="text-xs">/images/your-shot.jpg</code> (leading <code className="text-xs">/</code>{" "}
                required for optimized images), or a full <code className="text-xs">https://</code> URL. Leave empty for a
                placeholder.
              </p>
            )}
            {sectionKey === "reviews" && (
              <p className="text-sm text-gray-600">
                Three reviews: the site shows one card at a time with prev/next arrows.
              </p>
            )}
            {renderEditor(
              content[sectionKey as keyof Content],
              (next) => updateSection(sectionKey, next),
              sectionKey
            )}
          </section>
        ))}
      </div>
    </main>
  );
}

