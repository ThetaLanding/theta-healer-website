"use client";

import { useEffect, useState } from "react";
import RichTextEditor from "./RichTextEditor";

type Content = typeof import("../../lib/content.json");

const PASSWORD = "admin123";

const RICH_TEXT_TAG_REGEX = /<[^>]+>/;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeRichText(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "<p></p>";
  }
  if (RICH_TEXT_TAG_REGEX.test(trimmed)) {
    return value;
  }
  return `<p>${escapeHtml(value)}</p>`;
}

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
        setContent(json);
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
    const normalizedContent: Content = {
      ...content,
      hero: {
        ...content.hero,
        paragraph: normalizeRichText(content.hero.paragraph),
        primaryButtonLabel: normalizeRichText(content.hero.primaryButtonLabel),
      },
      section2: {
        ...content.section2,
        heading: normalizeRichText(content.section2.heading),
        bullets: content.section2.bullets.map(normalizeRichText),
      },
      section3: {
        ...content.section3,
        heading: normalizeRichText(content.section3.heading),
        bullets: content.section3.bullets.map(normalizeRichText),
      },
      reviews: {
        ...content.reviews,
        heading: normalizeRichText(content.reviews.heading),
        secondaryButtonLabel: normalizeRichText(content.reviews.secondaryButtonLabel),
        items: content.reviews.items.map((item) => ({
          ...item,
          quote: normalizeRichText(item.quote),
          attribution: normalizeRichText(item.attribution),
        })),
      },
    };
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(normalizedContent, null, 2),
      });
      if (!res.ok) {
        throw new Error("Save failed");
      }
      setContent(normalizedContent);
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

        <section className="space-y-4 bg-white rounded-lg p-6">
          <h2 className="text-xl">Section 1 — Hero</h2>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Main headline (four lines, same style on the site — larger than
              section headings)
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm">Headline — line 1</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={content.hero.headingLineOne}
                  onChange={(e) =>
                    updateContent((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, headingLineOne: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm">Headline — line 2</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={content.hero.headingLineTwo}
                  onChange={(e) =>
                    updateContent((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, headingLineTwo: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm">Headline — line 3</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={content.hero.headingLineThree}
                  onChange={(e) =>
                    updateContent((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, headingLineThree: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm">Headline — line 4</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={content.hero.headingLineFour}
                  onChange={(e) =>
                    updateContent((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, headingLineFour: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm">Paragraph</label>
              <RichTextEditor
                value={content.hero.paragraph}
                onChange={(html) =>
                  updateContent((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, paragraph: html },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm">Hero image path</label>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={content.hero.imageSrc}
                onChange={(e) =>
                  updateContent((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, imageSrc: e.target.value },
                  }))
                }
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="block text-sm">Button label</label>
              <RichTextEditor
                value={content.hero.primaryButtonLabel}
                onChange={(html) =>
                  updateContent((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, primaryButtonLabel: html },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm">Button link (Book a Call)</label>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={content.hero.primaryButtonHref}
                onChange={(e) =>
                  updateContent((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, primaryButtonHref: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm">Left background color</label>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={content.hero.backgroundLeft}
                onChange={(e) =>
                  updateContent((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, backgroundLeft: e.target.value },
                  }))
                }
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 bg-white rounded-lg p-6">
          <h2 className="text-xl">Section 2 — You Can&apos;t Shake The Craving</h2>
          <div className="space-y-2">
            <label className="block text-sm">Heading</label>
            <RichTextEditor
              value={content.section2.heading}
              onChange={(html) =>
                updateContent((prev) => ({
                  ...prev,
                  section2: { ...prev.section2, heading: html },
                }))
              }
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {content.section2.bullets.map((bullet, idx) => (
              <div key={idx} className="space-y-2">
                <label className="block text-sm">Bullet {idx + 1}</label>
                <RichTextEditor
                  value={bullet}
                  onChange={(html) =>
                    updateContent((prev) => {
                      const updated = [...prev.section2.bullets];
                      updated[idx] = html;
                      return {
                        ...prev,
                        section2: { ...prev.section2, bullets: updated },
                      };
                    })
                  }
                />
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="block text-sm">Image path</label>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={content.section2.imageSrc}
                onChange={(e) =>
                  updateContent((prev) => ({
                    ...prev,
                    section2: { ...prev.section2, imageSrc: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm">Background color</label>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={content.section2.background}
                onChange={(e) =>
                  updateContent((prev) => ({
                    ...prev,
                    section2: { ...prev.section2, background: e.target.value },
                  }))
                }
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 bg-white rounded-lg p-6">
          <h2 className="text-xl">Section 3 — You&apos;re Done Waiting</h2>
          <div className="space-y-2">
            <label className="block text-sm">Heading</label>
            <RichTextEditor
              value={content.section3.heading}
              onChange={(html) =>
                updateContent((prev) => ({
                  ...prev,
                  section3: { ...prev.section3, heading: html },
                }))
              }
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {content.section3.bullets.map((bullet, idx) => (
              <div key={idx} className="space-y-2">
                <label className="block text-sm">Bullet {idx + 1}</label>
                <RichTextEditor
                  value={bullet}
                  onChange={(html) =>
                    updateContent((prev) => {
                      const updated = [...prev.section3.bullets];
                      updated[idx] = html;
                      return {
                        ...prev,
                        section3: { ...prev.section3, bullets: updated },
                      };
                    })
                  }
                />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <label className="block text-sm">Background color</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={content.section3.background}
              onChange={(e) =>
                updateContent((prev) => ({
                  ...prev,
                  section3: { ...prev.section3, background: e.target.value },
                }))
              }
            />
          </div>
        </section>

        <section className="space-y-4 bg-white rounded-lg p-6">
          <h2 className="text-xl">Section 4 — Reviews</h2>
          <div className="space-y-2">
            <label className="block text-sm">Heading</label>
            <RichTextEditor
              value={content.reviews.heading}
              onChange={(html) =>
                updateContent((prev) => ({
                  ...prev,
                  reviews: { ...prev.reviews, heading: html },
                }))
              }
            />
          </div>
          {content.reviews.items.map((item, idx) => (
            <div key={idx} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm">Quote {idx + 1}</label>
                <RichTextEditor
                  value={item.quote}
                  onChange={(html) =>
                    updateContent((prev) => {
                      const updated = [...prev.reviews.items];
                      updated[idx] = { ...updated[idx], quote: html };
                      return {
                        ...prev,
                        reviews: { ...prev.reviews, items: updated },
                      };
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm">Attribution {idx + 1}</label>
                <RichTextEditor
                  value={item.attribution}
                  onChange={(html) =>
                    updateContent((prev) => {
                      const updated = [...prev.reviews.items];
                      updated[idx] = {
                        ...updated[idx],
                        attribution: html,
                      };
                      return {
                        ...prev,
                        reviews: { ...prev.reviews, items: updated },
                      };
                    })
                  }
                />
              </div>
            </div>
          ))}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="block text-sm">Secondary button label</label>
              <RichTextEditor
                value={content.reviews.secondaryButtonLabel}
                onChange={(html) =>
                  updateContent((prev) => ({
                    ...prev,
                    reviews: {
                      ...prev.reviews,
                      secondaryButtonLabel: html,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm">Secondary button link</label>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={content.reviews.secondaryButtonHref}
                onChange={(e) =>
                  updateContent((prev) => ({
                    ...prev,
                    reviews: {
                      ...prev.reviews,
                      secondaryButtonHref: e.target.value,
                    },
                  }))
                }
              />
            </div>
          </div>
        </section>

        {/* Additional sections (about, imagine, screenshots, section8, truthCallout, offer, ctaBanner, whyWorks, closing, footer) */}
        {/* To keep this concise, they follow the same pattern: label + inputs for text, links, images, and background colors. */}
      </div>
    </main>
  );
}

