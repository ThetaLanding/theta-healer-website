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
    fieldPath: string,
    richTextCompact = false
  ): React.ReactNode => {
    if (typeof value === "string") {
      const isColor =
        /(?:^|\.)(?:backgroundOuter|backgroundInner|background|color)$/i.test(
          fieldPath
        );
      const isPathLike =
        /(?:src|href|image|backgroundImage)$/i.test(fieldPath) ||
        /images\.\d+$/i.test(fieldPath);
      if (isColor || isPathLike) {
        return (
          <input
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-[13px]"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      }
      return (
        <RichTextEditor
          value={value}
          onChange={(html) => onChange(html)}
          compact={richTextCompact}
        />
      );
    }

    if (Array.isArray(value)) {
      if (fieldPath === "about.paragraphs") {
        const combined = value.filter((item): item is string => typeof item === "string").join("\n\n");
        return (
          <div className="space-y-0.5">
            <label className="block text-[11px] font-medium text-gray-600">Paragraph</label>
            <RichTextEditor
              value={combined}
              onChange={(html) => onChange([html])}
            />
          </div>
        );
      }

      const allStrings = value.length > 0 && value.every((item): item is string => typeof item === "string");
      if (fieldPath === "screenshots.images" && allStrings) {
        return (
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 md:grid-cols-3">
            {value.map((item, idx) => (
              <div key={idx} className="min-w-0 space-y-0.5 rounded border border-gray-200 bg-gray-50/60 p-1.5">
                <label className="block text-[10px] font-medium uppercase tracking-wide text-gray-500">
                  Slot {idx + 1}
                </label>
                {renderEditor(
                  item,
                  (next) => {
                    const nextArray = [...value];
                    nextArray[idx] = next;
                    onChange(nextArray);
                  },
                  `${fieldPath}.${idx}`,
                  false
                )}
              </div>
            ))}
          </div>
        );
      }

      if (
        fieldPath === "reviews.items" &&
        value.every((item) => item !== null && typeof item === "object")
      ) {
        return (
          <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-3">
            {value.map((item, idx) => (
              <div key={idx} className="min-w-0 space-y-1 rounded border border-gray-200 p-1.5">
                <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                  Review {idx + 1}
                </div>
                {renderEditor(
                  item,
                  (next) => {
                    const nextArray = [...value];
                    nextArray[idx] = next;
                    onChange(nextArray);
                  },
                  `${fieldPath}.${idx}`,
                  false
                )}
              </div>
            ))}
          </div>
        );
      }

      if (
        fieldPath === "offer.columns" &&
        value.every((item) => item !== null && typeof item === "object")
      ) {
        return (
          <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-3">
            {value.map((item, idx) => (
              <div key={idx} className="min-w-0 space-y-1 rounded border border-gray-200 p-1.5">
                <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                  Column {idx + 1}
                </div>
                {renderEditor(
                  item,
                  (next) => {
                    const nextArray = [...value];
                    nextArray[idx] = next;
                    onChange(nextArray);
                  },
                  `${fieldPath}.${idx}`,
                  false
                )}
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="space-y-1.5">
          {value.map((item, idx) => (
            <div key={idx} className="space-y-0.5 rounded border border-gray-200 p-1.5">
              <label className="block text-[11px] font-medium text-gray-500">Item {idx + 1}</label>
              {renderEditor(
                item,
                (next) => {
                  const nextArray = [...value];
                  nextArray[idx] = next;
                  onChange(nextArray);
                },
                `${fieldPath}.${idx}`,
                false
              )}
            </div>
          ))}
        </div>
      );
    }

    if (value && typeof value === "object") {
      if (fieldPath === "hero") {
        const record = value as Record<string, unknown>;
        const patch = (key: string, next: unknown) =>
          onChange({
            ...record,
            [key]: next,
          });
        const headlines = ["headingLineOne", "headingLineTwo", "headingLineThree", "headingLineFour"] as const;
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {headlines.map((key, i) => (
                <div key={key} className="min-w-0 space-y-0.5">
                  <label className="block text-[11px] font-medium text-gray-600">Headline {i + 1}</label>
                  {renderEditor(
                    record[key],
                    (next) => patch(key, next),
                    `${fieldPath}.${key}`,
                    true
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-0.5">
              <label className="block text-[11px] font-medium text-gray-600">Paragraph</label>
              {renderEditor(
                record.paragraph,
                (next) => patch("paragraph", next),
                `${fieldPath}.paragraph`,
                false
              )}
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="min-w-0 space-y-0.5">
                <label className="block text-[11px] font-medium text-gray-600">Background left</label>
                {renderEditor(
                  record.backgroundLeft,
                  (next) => patch("backgroundLeft", next),
                  `${fieldPath}.backgroundLeft`,
                  false
                )}
              </div>
              <div className="min-w-0 space-y-0.5">
                <label className="block text-[11px] font-medium text-gray-600">Image src</label>
                {renderEditor(
                  record.imageSrc,
                  (next) => patch("imageSrc", next),
                  `${fieldPath}.imageSrc`,
                  false
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="min-w-0 space-y-0.5">
                <label className="block text-[11px] font-medium text-gray-600">Primary button label</label>
                {renderEditor(
                  record.primaryButtonLabel,
                  (next) => patch("primaryButtonLabel", next),
                  `${fieldPath}.primaryButtonLabel`,
                  false
                )}
              </div>
              <div className="min-w-0 space-y-0.5">
                <label className="block text-[11px] font-medium text-gray-600">Primary button href</label>
                {renderEditor(
                  record.primaryButtonHref,
                  (next) => patch("primaryButtonHref", next),
                  `${fieldPath}.primaryButtonHref`,
                  false
                )}
              </div>
            </div>
          </div>
        );
      }

      if (/^section8\.items\.\d+$/.test(fieldPath)) {
        const section8Item = value as { title?: string; body?: string };
        const merged = [section8Item.title ?? "", section8Item.body ?? ""]
          .filter(Boolean)
          .join(" ")
          .trim();
        return (
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600">Text</label>
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
        <div className="space-y-2">
          {entries.map(([key, nested]) => (
            <div key={key} className="space-y-0.5">
              <label className="block text-[11px] font-medium text-gray-600 capitalize">{key}</label>
              {renderEditor(
                nested,
                (next) =>
                  onChange({
                    ...(value as Record<string, unknown>),
                    [key]: next,
                  }),
                `${fieldPath}.${key}`,
                false
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <input
        className="w-full border border-gray-300 rounded-md px-2 py-1 text-[13px]"
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };

  return (
    <main className="min-h-screen bg-[#f4f1ec] text-[#6b4f62] px-3 py-4 pb-24 sm:px-4 sm:pb-28">
      <div className="max-w-7xl mx-auto space-y-3">
        <header>
          <h1 className="text-lg font-semibold tracking-tight">Editor Dashboard</h1>
        </header>

        {error && <p className="text-xs text-red-600">{error}</p>}
        {success && <p className="text-xs text-emerald-700">{success}</p>}

        {SECTION_KEYS.map((sectionKey) => (
          <section
            key={sectionKey}
            className="space-y-2 bg-white rounded-md border border-gray-200/80 p-3 shadow-sm"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#5a4154]">
              {SECTION_LABELS[sectionKey]}
            </h2>
            {sectionKey === "screenshots" && (
              <p className="text-xs text-gray-600 leading-snug">
                Nine slots (grid). Prefer a root path from <code className="text-xs">public/</code>, e.g.{" "}
                <code className="text-xs">/images/your-shot.jpg</code> (leading <code className="text-xs">/</code>{" "}
                required for optimized images), or a full <code className="text-xs">https://</code> URL. Leave empty for a
                placeholder.
              </p>
            )}
            {sectionKey === "reviews" && (
              <p className="text-[11px] text-gray-600 leading-snug">
                Large screens: three columns on the site; smaller screens: one card with prev/next.
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

      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 flex justify-end p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="pointer-events-auto inline-flex items-center justify-center rounded-full px-5 py-2.5 text-[11px] font-semibold tracking-[0.14em] uppercase shadow-lg ring-1 ring-[#6b4f62]/15 bg-[#ffa769] text-[#6b4f62] transition hover:brightness-105 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </main>
  );
}

