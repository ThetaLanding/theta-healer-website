import Image from "next/image";
import fs from "fs";
import path from "path";
import type { ReactNode } from "react";
import ReviewsCarousel, {
  ReviewBlock,
  reviewThreeColumnCardClass,
} from "./components/ReviewsCarousel";

type SectionKey =
  | "hero"
  | "section2"
  | "section3"
  | "reviews"
  | "about"
  | "imagine"
  | "screenshots"
  | "section8"
  | "truthCallout"
  | "offer"
  | "ctaBanner"
  | "whyWorks"
  | "closing"
  | "footer";

type Content = typeof import("../lib/content.json") & {
  sectionOrder?: SectionKey[];
};

const DEFAULT_SECTION_ORDER: SectionKey[] = [
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
];

function getContent(): Content {
  const filePath = path.join(process.cwd(), "lib", "content.json");
  const file = fs.readFileSync(filePath, "utf8");
  return JSON.parse(file);
}

/** Keep JSON paths like `/images/hero.jpg`; bust cache when the file under `public/` is replaced. */
function publicImageSrcWithMtime(src: string): string {
  const s = (src ?? "").trim();
  if (!s.startsWith("/") || /^https?:\/\//i.test(s) || s.includes("?")) return s;
  try {
    const abs = path.join(process.cwd(), "public", s.slice(1));
    const st = fs.statSync(abs);
    return `${s}?t=${Math.floor(st.mtimeMs)}`;
  } catch {
    return s;
  }
}

const BUTTON_BASE =
  "inline-flex items-center justify-center text-center rounded-full px-8 py-3 text-xs tracking-[0.18em] uppercase transition-colors [&_.rich-text-content]:text-center [&_.rich-text-content_p]:text-center [&_.rich-text-content_span]:text-center";

const BUTTON_PRIMARY = `${BUTTON_BASE} bg-[#ffa769] text-[#6b4f62] hover:bg-[#ff9450]`;
const BUTTON_SECONDARY = `${BUTTON_BASE} bg-[#b8878a] text-white hover:bg-[#a47174]`;
const BUTTON_TERTIARY = `${BUTTON_BASE} bg-[#f4f1ec] text-[#6b4f62] hover:bg-[#e4daca]`;

/**
 * Section titles: h2 everywhere + h1 for offer/footer (same scale).
 * `!leading-[0.8]` beats Tailwind text-* bundled line-height (no global heading line-height in CSS).
 */
const SECTION_TITLE = "text-2xl sm:text-3xl lg:text-4xl !leading-[0.8]";

/**
 * Offer main title + footer CTA title (h1): same breakpoints as h2 / SECTION_TITLE,
 * font size ×1.32 (= ×1.2 then +10%).
 */
const SECTION_TITLE_DISPLAY_H1 =
  "text-[1.98rem] sm:text-[2.475rem] lg:text-[2.97rem] !leading-[0.8]";

/** Class on offer/footer h1 only — avoids matching TipTap <h1> lines nested inside .hero-display-title */
const SECTION_DISPLAY_H1 = "section-display-h1";

/** Hero display lines — `leading-[1.08]` + `space-y-2 sm:space-y-3` (same as when you called this look “perfect”) */
const HERO_DISPLAY_LINE = "leading-[1.08]";

/** Default body copy for landing sections (editor can still change size inline) */
const BODY_TEXT = "text-sm sm:text-base text-[#6b4f62] leading-relaxed";

/** Single wrapping <p> (with or without attributes); otherwise return trimmed html. */
function toInlineHtml(html: string) {
  const t = html.trim();
  const m = t.match(/^<p(\s[^>]*)?>([\s\S]*)<\/p>\s*$/i);
  return m ? m[2].trim() : t;
}

/** Strip a single outer heading wrapper from TipTap HTML so React can own the real heading tag. */
function unwrapOuterHeadingTag(html: string, tag: "h1" | "h2" | "h3"): string {
  const t = html.trim();
  const re = new RegExp(
    `^<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>\\s*(?:<p(\\s[^>]*)?>\\s*<\\/p>\\s*)?$`,
    "i"
  );
  const m = t.match(re);
  return m ? m[1].trim() : t;
}

/** Inner phrasing HTML for a page-level heading (unwrap saved h1/h2, else single-paragraph inline). */
function phrasingHtmlForPageHeading(html: string): string {
  const h = html.trim();
  const u1 = unwrapOuterHeadingTag(h, "h1");
  if (u1 !== h) return u1;
  const u2 = unwrapOuterHeadingTag(h, "h2");
  if (u2 !== h) return u2;
  return toInlineHtml(h);
}

/**
 * Inner HTML for section <h2> titles: strip duplicate TipTap <h2>/<h1>, then a single wrapping <p>.
 * Keeps typography consistent (nested headings were only visibly "correct" for section 2 & 3).
 */
function phrasingHtmlForSectionHeading(html: string): string {
  const h = html.trim();
  const u2 = unwrapOuterHeadingTag(h, "h2");
  if (u2 !== h) return u2;
  const u1 = unwrapOuterHeadingTag(h, "h1");
  if (u1 !== h) return u1;
  return toInlineHtml(h);
}

/** Inner HTML for card/column <h3> titles (unwrap h3/h2/h1/p wrapper from editor). */
function phrasingHtmlForCardHeading(html: string): string {
  const h = html.trim();
  const u3 = unwrapOuterHeadingTag(h, "h3");
  if (u3 !== h) return u3;
  const u2 = unwrapOuterHeadingTag(h, "h2");
  if (u2 !== h) return u2;
  const u1 = unwrapOuterHeadingTag(h, "h1");
  if (u1 !== h) return u1;
  return toInlineHtml(h);
}

function HtmlContent({
  html,
  className,
  as = "div",
}: {
  html: string;
  className?: string;
  as?: "div" | "span";
}) {
  const Tag = as;
  const renderedHtml = as === "span" ? toInlineHtml(html) : html;
  return (
    <Tag
      className={`rich-text-content ${className ?? ""}`.trim()}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}

export default function Home() {
  const content = getContent();
  const sectionOrder =
    content.sectionOrder && content.sectionOrder.length > 0
      ? content.sectionOrder.filter((key): key is SectionKey =>
          DEFAULT_SECTION_ORDER.includes(key)
        )
      : DEFAULT_SECTION_ORDER;

  const sectionRenderers: Record<SectionKey, () => ReactNode> = {
    hero: () => (
      <section className="w-full min-h-[70vh] flex flex-col md:flex-row">
        <div
          className="md:w-1/2 w-full flex flex-col justify-center px-6 md:px-10 lg:px-16 py-20 md:py-24"
          style={{ backgroundColor: content.hero.backgroundLeft }}
        >
          <div className="w-full max-w-xl space-y-6 text-white">
            <div>
              <h1 className={`hero-display-title ${HERO_DISPLAY_LINE} space-y-2 sm:space-y-3`}>
                <span
                  className={`block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-[0.18em] ${HERO_DISPLAY_LINE}`}
                >
                  <HtmlContent html={content.hero.headingLineOne} as="span" />
                </span>
                <span
                  className={`block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-[0.18em] ${HERO_DISPLAY_LINE}`}
                >
                  <HtmlContent html={content.hero.headingLineTwo} as="span" />
                </span>
                <span
                  className={`block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-[0.18em] ${HERO_DISPLAY_LINE}`}
                >
                  <HtmlContent html={content.hero.headingLineThree} as="span" />
                </span>
                <span
                  className={`block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-[0.18em] ${HERO_DISPLAY_LINE}`}
                >
                  <HtmlContent html={content.hero.headingLineFour} as="span" />
                </span>
              </h1>
            </div>
            {content.hero.paragraph && (
              <HtmlContent html={content.hero.paragraph} className={`${BODY_TEXT} text-white/95`} />
            )}
            <div>
              <a
                href={content.hero.primaryButtonHref}
                className={BUTTON_PRIMARY}
                target="_blank"
                rel="noopener noreferrer"
              >
                <HtmlContent html={content.hero.primaryButtonLabel} as="span" />
              </a>
            </div>
          </div>
        </div>
        <div className="relative md:w-1/2 w-full min-h-[300px] md:min-h-[70vh]">
          <Image
            src={publicImageSrcWithMtime(content.hero.imageSrc)}
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>
    ),
    section2: () => (
      <section className="relative isolate w-full overflow-hidden" style={{ backgroundColor: content.section2.background }}>
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 md:block lg:w-[46%]" aria-hidden>
          <Image
            src={publicImageSrcWithMtime(content.section2.imageSrc)}
            alt=""
            fill
            sizes="50vw"
            className="object-contain object-right"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-8 md:px-10 md:pb-24 md:pt-24 lg:px-16">
          <div className="flex max-w-xl flex-col gap-6 lg:max-w-2xl">
            {content.section2.heading && (
              <h2 className={`${SECTION_TITLE} text-[#6b4f62]`}>
                <HtmlContent html={phrasingHtmlForSectionHeading(content.section2.heading)} as="span" />
              </h2>
            )}
            <ul className="space-y-3 text-sm sm:text-base">
              {content.section2.bullets.map((item, idx) => item && (
                <li key={idx} className="flex gap-3"><span className="mt-1 text-[#ffa769]">•</span><HtmlContent html={item} className="flex-1" /></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="relative z-10 px-6 pb-20 md:hidden">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-lg min-h-[220px] max-h-[55vh]">
            <Image
              src={publicImageSrcWithMtime(content.section2.imageSrc)}
              alt=""
              fill
              sizes="100vw"
              className="object-contain object-center"
            />
          </div>
        </div>
      </section>
    ),
    section3: () => (
      <section className="w-full py-20 md:py-24" style={{ backgroundColor: content.section3.background }}>
        <div className="max-w-6xl mx-auto flex flex-col items-start gap-6 px-6 md:flex-row md:gap-10 md:px-10 lg:px-16">
          <div className="md:w-1/3">
            {content.section3.heading && (
              <h2 className={`${SECTION_TITLE} text-white`}>
                <HtmlContent html={phrasingHtmlForSectionHeading(content.section3.heading)} as="span" />
              </h2>
            )}
          </div>
          <div className="md:w-2/3">
            <ul className="space-y-3 text-sm sm:text-base text-[#6b4f62]">
              {content.section3.bullets.map((item, idx) => item && (
                <li key={idx} className="flex gap-3">
                  <span className="mt-1 shrink-0 text-white">✔</span>
                  <HtmlContent html={item} className="flex-1 text-[#6b4f62]" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    ),
    reviews: () => (
      <section className="w-full py-14 md:py-18" style={{ backgroundColor: content.reviews.background }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 md:px-10 lg:px-16">
          <div className="text-center">
            <h2 className={`${SECTION_TITLE} text-[#6b4f62]`}>
              <HtmlContent html={phrasingHtmlForSectionHeading(content.reviews.heading)} as="span" />
            </h2>
          </div>
          <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4">
            {content.reviews.items.map((item, idx) => (
              <ReviewBlock key={idx} quote={item.quote} attribution={item.attribution} />
            ))}
          </div>
          <div className="lg:hidden">
            <ReviewsCarousel items={content.reviews.items} />
          </div>
          <div className="mt-4 flex justify-center">
            <a
              href={content.reviews.secondaryButtonHref}
              className={BUTTON_SECONDARY}
              target="_blank"
              rel="noopener noreferrer"
            >
              <HtmlContent html={content.reviews.secondaryButtonLabel} as="span" />
            </a>
          </div>
        </div>
      </section>
    ),
    about: () => (
      <section className="w-full py-20 md:py-24" style={{ backgroundColor: content.about.backgroundOuter }}>
        <div className="mx-auto max-w-6xl px-6 md:px-10 lg:px-16">
          <div
            className="flex w-full flex-col gap-6 px-6 py-10 sm:px-10 sm:py-12 md:px-16 md:py-16"
            style={{ backgroundColor: content.about.backgroundInner }}
          >
            <h2 className={`${SECTION_TITLE} text-center text-[#6b4f62]`}>
              <HtmlContent html={phrasingHtmlForSectionHeading(content.about.heading)} as="span" />
            </h2>
            <div className={BODY_TEXT}>
              <HtmlContent html={content.about.paragraphs.filter(Boolean).join("\n\n")} />
            </div>
            <div className="flex justify-center pt-4">
              <a
                href={content.about.secondaryButtonHref}
                className={BUTTON_SECONDARY}
                target="_blank"
                rel="noopener noreferrer"
              >
                <HtmlContent html={content.about.secondaryButtonLabel} as="span" />
              </a>
            </div>
          </div>
        </div>
      </section>
    ),
    imagine: () => (
      <section className="w-full relative min-h-[400px]">
        <Image
          src={publicImageSrcWithMtime(content.imagine.backgroundImage)}
          alt=""
          fill
          className="object-cover"
        />
        <div className="relative max-w-6xl mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-24">
          <div className="w-full md:w-2/3 px-6 sm:px-10 md:px-12 py-10 sm:py-12 md:py-16">
            <div className="flex flex-col gap-6" style={{ backgroundColor: "rgba(244,241,236,0.82)" }}>
              <div className="px-4 pt-6 sm:px-6 sm:pt-8">
                {content.imagine.heading && (
                  <h2 className={`${SECTION_TITLE} text-[#6b4f62]`}>
                    <HtmlContent html={phrasingHtmlForSectionHeading(content.imagine.heading)} as="span" />
                  </h2>
                )}
              </div>
              <div className="px-4 pb-6 sm:px-6 sm:pb-8">
                <ul className="space-y-3 text-sm sm:text-base text-[#6b4f62]">
                  {content.imagine.bullets.map((item, idx) => item && (
                    <li key={idx} className="flex gap-3">
                      <span className="mt-1 text-[#ffa769]">✔</span>
                      <HtmlContent html={item} as="span" />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    ),
    screenshots: () => {
      const raw = content.screenshots.images;
      const slots = Array.isArray(raw) ? [...raw] : [];
      while (slots.length < 9) slots.push("");
      const images = slots.slice(0, 9);
      return (
        <section className="w-full py-20 md:py-24" style={{ backgroundColor: content.screenshots.background }}>
          <div className="mx-auto max-w-6xl px-6 md:px-10 lg:px-16">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
              {images.map((src, idx) => {
                const trimmed = (src ?? "").trim();
                const isRemote = /^https?:\/\//i.test(trimmed);
                const isProtocolRelative = trimmed.startsWith("//");
                /** `next/image` only accepts root-relative `/file` paths from `public/` (not `//…`, not bare `file.jpg`). */
                const useNextImage =
                  !isRemote && !isProtocolRelative && trimmed.startsWith("/") && trimmed.length > 1;
                const fallbackImgSrc = trimmed.startsWith("/")
                  ? trimmed
                  : `/${trimmed.replace(/^\/+/, "")}`;
                return (
                <div
                  key={idx}
                  className="relative aspect-video overflow-hidden rounded-lg bg-gray-200 ring-1 ring-[#6b4f62]/10"
                >
                  {trimmed ? (
                    !useNextImage ? (
                      // eslint-disable-next-line @next/next/no-img-element -- remotes, protocol-relative, or paths without leading /
                      <img
                        src={publicImageSrcWithMtime(
                          isRemote || isProtocolRelative ? trimmed : fallbackImgSrc
                        )}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={publicImageSrcWithMtime(trimmed)}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                    )
                  ) : (
                    <div className="flex h-full items-center justify-center px-2 text-center text-xs text-[#6b4f62] sm:text-sm">
                      Set image URL in Admin → Screenshots
                    </div>
                  )}
                </div>
              );
              })}
            </div>
          </div>
        </section>
      );
    },
    section8: () => (
      <section className="w-full py-20 md:py-24" style={{ backgroundColor: content.section8.background }}>
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 md:px-10 lg:px-16">
          {content.section8.heading && (
            <h2 className={`${SECTION_TITLE} text-[#6b4f62]`}>
              <HtmlContent html={phrasingHtmlForSectionHeading(content.section8.heading)} as="span" />
            </h2>
          )}
          <div className="space-y-6">
            {content.section8.items.map((item, idx) => {
              if (!item.title) return null;
              return (
                <div key={idx} className="flex items-start gap-3">
                  <span
                    className="shrink-0 pt-0.5 text-2xl leading-none text-[#b8878a] sm:text-3xl"
                    aria-hidden
                  >
                    →
                  </span>
                  <p className={BODY_TEXT}>
                    <HtmlContent html={item.title} as="span" />
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    ),
    truthCallout: () => (
      <section className="w-full py-20 md:py-24 text-center px-6" style={{ backgroundColor: content.truthCallout.background }}>
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {content.truthCallout.heading && (
            <h2 className={`${SECTION_TITLE} text-[#6b4f62]`}>
              <HtmlContent html={phrasingHtmlForSectionHeading(content.truthCallout.heading)} as="span" />
            </h2>
          )}
          {content.truthCallout.paragraph && (
            <p className={BODY_TEXT}>
              <HtmlContent html={content.truthCallout.paragraph} as="span" />
            </p>
          )}
        </div>
      </section>
    ),
    offer: () => (
      <section className="w-full py-20 md:py-24" style={{ backgroundColor: content.offer.background }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 md:px-10 lg:px-16">
          <div className="flex flex-col items-center gap-6 text-center">
            <h1 className={`${SECTION_DISPLAY_H1} ${SECTION_TITLE_DISPLAY_H1} text-[#6b4f62]`}>
              <HtmlContent html={phrasingHtmlForPageHeading(content.offer.title)} as="span" />
            </h1>
            {content.offer.description && (
              <div
                className={`mx-auto max-w-3xl ${BODY_TEXT} [&_.rich-text-content]:text-center [&_.rich-text-content_p]:text-center`}
              >
                <HtmlContent html={content.offer.description} />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-6">
            <h2 className={`text-center ${SECTION_TITLE} tracking-[0.18em] text-[#6b4f62]`}>
              <HtmlContent html={phrasingHtmlForSectionHeading(content.offer.whatsIncludedHeading)} as="span" />
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-4">
              {content.offer.columns.map((col, idx) => (
                <article key={idx} className={`${reviewThreeColumnCardClass} gap-6`}>
                  {col.title && (
                    <h3 className="text-center text-lg sm:text-xl !leading-[0.8] text-[#6b4f62]">
                      <HtmlContent html={phrasingHtmlForCardHeading(col.title)} as="span" />
                    </h3>
                  )}
                  <ul className="space-y-3 text-left text-sm text-[#6b4f62] sm:text-base">
                    {col.items.map(
                      (item, i) =>
                        item && (
                          <li key={i} className="flex gap-3">
                            <span className="mt-1 shrink-0 text-[#ffa769]">✔</span>
                            <HtmlContent html={item} className="flex-1" />
                          </li>
                        )
                    )}
                  </ul>
                </article>
              ))}
            </div>
            {content.offer.belowColumnsParagraph && (
              <div
                className={`mx-auto max-w-3xl text-center ${BODY_TEXT} [&_.rich-text-content]:text-center [&_.rich-text-content_p]:text-center`}
              >
                <HtmlContent html={content.offer.belowColumnsParagraph} />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-6 pt-4 text-center">
            <h2 className={`${SECTION_TITLE} text-[#6b4f62]`}>
              <HtmlContent html={phrasingHtmlForSectionHeading(content.offer.investmentHeading)} as="span" />
            </h2>
            {content.offer.investmentText && (
              <div
                className={`mx-auto max-w-3xl ${BODY_TEXT} [&_.rich-text-content]:text-center [&_.rich-text-content_p]:text-center`}
              >
                <HtmlContent html={content.offer.investmentText} className="whitespace-pre-line" />
              </div>
            )}
          </div>
        </div>
      </section>
    ),
    ctaBanner: () => (
      <section className="w-full py-20 md:py-24 text-center px-6" style={{ backgroundColor: content.ctaBanner.background }}>
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {content.ctaBanner.heading && (
            <h2 className={`${SECTION_TITLE} text-[#6b4f62]`}>
              <HtmlContent html={phrasingHtmlForSectionHeading(content.ctaBanner.heading)} as="span" />
            </h2>
          )}
          {content.ctaBanner.paragraph && (
            <p className={`${BODY_TEXT} whitespace-pre-line`}>
              <HtmlContent html={content.ctaBanner.paragraph} as="span" />
            </p>
          )}
          <a
            href={content.ctaBanner.primaryButtonHref}
            className={BUTTON_TERTIARY}
            target="_blank"
            rel="noopener noreferrer"
          >
            <HtmlContent html={content.ctaBanner.primaryButtonLabel} as="span" />
          </a>
        </div>
      </section>
    ),
    whyWorks: () => (
      <section className="w-full relative min-h-[400px]">
        <Image
          src={publicImageSrcWithMtime(content.whyWorks.backgroundImage)}
          alt=""
          fill
          className="object-cover"
        />
        <div className="relative max-w-6xl mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-24 flex items-center">
          <div className="flex w-full flex-col gap-6 text-white md:w-1/2">
            {content.whyWorks.heading && (
              <h2 className={SECTION_TITLE}>
                <HtmlContent html={phrasingHtmlForSectionHeading(content.whyWorks.heading)} as="span" />
              </h2>
            )}
            <div className="space-y-4 text-sm sm:text-base">
              {content.whyWorks.paragraphs.map(
                (p, idx) =>
                  p && (
                    <p key={idx} className="leading-relaxed">
                      <HtmlContent html={p} as="span" />
                    </p>
                  )
              )}
            </div>
            <div className="pt-2">
              <a
                href={content.whyWorks.buttonHref}
                className={`${BUTTON_SECONDARY} bg-[#b8878a] hover:bg-[#a47174]`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <HtmlContent html={content.whyWorks.buttonLabel} as="span" />
              </a>
            </div>
          </div>
        </div>
      </section>
    ),
    closing: () => (
      <section className="w-full py-20 md:py-24 text-center px-6" style={{ backgroundColor: content.closing.background }}>
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {content.closing.heading && (
            <h2 className={`${SECTION_TITLE} text-[#6b4f62]`}>
              <HtmlContent html={phrasingHtmlForSectionHeading(content.closing.heading)} as="span" />
            </h2>
          )}
          {content.closing.paragraph && (
            <p className={BODY_TEXT}>
              <HtmlContent html={content.closing.paragraph} as="span" />
            </p>
          )}
        </div>
      </section>
    ),
    footer: () => (
      <footer className="w-full py-16 md:py-20 text-center px-6" style={{ backgroundColor: content.footer.background }}>
        <div className="flex flex-col items-center gap-6">
          <h1 className={`${SECTION_DISPLAY_H1} ${SECTION_TITLE_DISPLAY_H1} text-white`}>
            <HtmlContent html={phrasingHtmlForPageHeading(content.footer.heading)} as="span" />
          </h1>
          <a
            href={content.footer.primaryButtonHref}
            className={BUTTON_PRIMARY}
            target="_blank"
            rel="noopener noreferrer"
          >
            <HtmlContent html={content.footer.primaryButtonLabel} as="span" />
          </a>
        </div>
      </footer>
    ),
  };

  return (
    <main className="flex flex-col min-h-screen text-[#6b4f62]">
      {sectionOrder.map((key, idx) => (
        <div key={`${key}-${idx}`}>{sectionRenderers[key]()}</div>
      ))}
    </main>
  );
}
