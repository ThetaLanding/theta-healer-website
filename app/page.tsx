import Image from "next/image";
import fs from "fs";
import path from "path";

type Content = typeof import("../lib/content.json");

function getContent(): Content {
  const filePath = path.join(process.cwd(), "lib", "content.json");
  const file = fs.readFileSync(filePath, "utf8");
  return JSON.parse(file);
}

const BUTTON_BASE =
  "inline-flex items-center justify-center rounded-full px-8 py-3 text-xs tracking-[0.18em] uppercase transition-colors";

const BUTTON_PRIMARY = `${BUTTON_BASE} bg-[#ffa769] text-[#6b4f62] hover:bg-[#ff9450]`;
const BUTTON_SECONDARY = `${BUTTON_BASE} bg-[#b8878a] text-white hover:bg-[#a47174]`;
const BUTTON_TERTIARY = `${BUTTON_BASE} bg-[#f4f1ec] text-[#6b4f62] hover:bg-[#e4daca]`;

function toInlineHtml(html: string) {
  return html.replace(/^<p>([\s\S]*)<\/p>$/i, "$1");
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

  return (
    <main className="flex flex-col min-h-screen text-[#6b4f62]">
      {/* SECTION 1 — HERO */}
      <section className="w-full min-h-[70vh] flex flex-col md:flex-row">
        <div
          className="md:w-1/2 w-full flex flex-col justify-center px-8 py-16 md:py-24 lg:py-28"
          style={{ backgroundColor: content.hero.backgroundLeft }}
        >
          <div className="max-w-xl space-y-6 text-white">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-6xl leading-tight">
                <span className="block">{content.hero.headingLineOne}</span>
                <span className="block mt-2 tracking-[0.2em] text-base sm:text-lg lg:text-2xl">
                  {content.hero.headingLineTwo}
                </span>
                <span className="block tracking-[0.2em] text-base sm:text-lg lg:text-2xl">
                  {content.hero.headingLineThree}
                </span>
                <span className="block tracking-[0.2em] text-base sm:text-lg lg:text-2xl">
                  {content.hero.headingLineFour}
                </span>
              </h1>
            </div>
            {content.hero.paragraph && (
              <HtmlContent
                html={content.hero.paragraph}
                className="text-sm sm:text-base leading-relaxed"
              />
            )}
            <div>
              <a
                href={content.hero.primaryButtonHref}
                className={BUTTON_PRIMARY}
              >
                <HtmlContent html={content.hero.primaryButtonLabel} as="span" />
              </a>
            </div>
          </div>
        </div>
        <div className="relative md:w-1/2 w-full min-h-[300px] md:min-h-[70vh]">
          <Image
            src={content.hero.imageSrc}
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* SECTION 2 — YOU CAN'T SHAKE THE CRAVING */}
      <section
        className="w-full py-20 md:py-24"
        style={{ backgroundColor: content.section2.background }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-16 flex flex-col md:flex-row gap-12 items-start">
          <div className="md:w-2/3 space-y-6">
            {content.section2.heading && (
              <h2 className="text-2xl sm:text-3xl lg:text-4xl text-[#6b4f62]">
                <HtmlContent html={content.section2.heading} as="span" />
              </h2>
            )}
            <ul className="space-y-3 text-sm sm:text-base">
              {content.section2.bullets.map(
                (item, idx) =>
                  item && (
                    <li key={idx} className="flex gap-3">
                      <span className="mt-1 text-[#ffa769]">•</span>
                      <HtmlContent html={item} className="flex-1" />
                    </li>
                  )
              )}
            </ul>
          </div>
          <div className="md:w-1/3 w-full">
            <div className="relative w-full aspect-[4/5]">
              <Image
                src={content.section2.imageSrc}
                alt=""
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — YOU'RE DONE WAITING */}
      <section
        className="w-full py-20 md:py-24"
        style={{ backgroundColor: content.section3.background }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-16 flex flex-col md:flex-row gap-10 items-start">
          <div className="md:w-1/3">
            {content.section3.heading && (
              <h2 className="text-2xl sm:text-3xl lg:text-4xl text-white">
                <HtmlContent html={content.section3.heading} as="span" />
              </h2>
            )}
          </div>
          <div className="md:w-2/3">
            <ul className="space-y-3 text-sm sm:text-base text-[#6b4f62]">
              {content.section3.bullets.map(
                (item, idx) =>
                  item && (
                    <li key={idx} className="flex gap-3">
                      <span className="mt-1 text-[#ffa769]">✔</span>
                      <HtmlContent html={item} className="flex-1" />
                    </li>
                  )
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 4 — REVIEWS SLIDER */}
      <section
        className="w-full py-20 md:py-24"
        style={{ backgroundColor: content.reviews.background }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-16 space-y-10">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl text-[#6b4f62]">
              <HtmlContent html={content.reviews.heading} as="span" />
            </h2>
          </div>

          <div className="relative overflow-hidden">
            <div className="flex gap-6">
              {content.reviews.items.map((item, idx) => (
                <article
                  key={idx}
                  className={`shrink-0 ${
                    idx === 0 ? "w-2/3" : "w-1/3"
                  } hidden md:block bg-white/80 rounded-xl p-8`}
                >
                  {item.quote && (
                    <HtmlContent
                      html={item.quote}
                      className="text-sm sm:text-base leading-relaxed"
                    />
                  )}
                  {item.attribution && (
                    <HtmlContent
                      html={item.attribution}
                      className="mt-4 text-sm"
                    />
                  )}
                </article>
              ))}

              {/* Mobile simple stack */}
              <div className="md:hidden w-full space-y-4">
                {content.reviews.items.map((item, idx) => (
                  <article
                    key={idx}
                    className="bg-white/80 rounded-xl p-6 w-full"
                  >
                    {item.quote && (
                      <HtmlContent
                        html={item.quote}
                        className="text-sm leading-relaxed"
                      />
                    )}
                    {item.attribution && (
                      <HtmlContent
                        html={item.attribution}
                        className="mt-3 text-sm"
                      />
                    )}
                  </article>
                ))}
              </div>
            </div>

            {/* Slider arrows (non-functional placeholders for now) */}
            <div className="hidden md:flex absolute inset-y-0 left-0 right-0 items-center justify-between px-2 pointer-events-none">
              <button
                type="button"
                className={`${BUTTON_TERTIARY} pointer-events-auto px-3 py-2`}
              >
                ←
              </button>
              <button
                type="button"
                className={`${BUTTON_TERTIARY} pointer-events-auto px-3 py-2`}
              >
                →
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <a
              href={content.reviews.secondaryButtonHref}
              className={BUTTON_SECONDARY}
            >
              <HtmlContent html={content.reviews.secondaryButtonLabel} as="span" />
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 5 — HI I'M STASIA */}
      <section
        className="w-full py-20 md:py-24"
        style={{ backgroundColor: content.about.backgroundOuter }}
      >
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          <div
            className="w-full px-6 sm:px-10 md:px-16 py-10 sm:py-12 md:py-16 space-y-6"
            style={{ backgroundColor: content.about.backgroundInner }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl text-[#6b4f62] text-center">
              {content.about.heading}
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-[#6b4f62]">
              {content.about.paragraphs.map(
                (p, idx) =>
                  p && (
                    <p key={idx} className="leading-relaxed">
                      {p}
                    </p>
                  )
              )}
            </div>
            <div className="flex justify-center pt-4">
              <a
                href={content.about.secondaryButtonHref}
                className={BUTTON_SECONDARY}
              >
                {content.about.secondaryButtonLabel}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — IMAGINE YOUR LIFE */}
      <section className="w-full relative min-h-[400px]">
        <Image
          src={content.imagine.backgroundImage}
          alt=""
          fill
          className="object-cover"
        />
        <div className="relative max-w-6xl mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-24">
          <div className="w-full md:w-2/3 px-6 sm:px-10 md:px-12 py-10 sm:py-12 md:py-16">
            <div
              className="space-y-6"
              style={{ backgroundColor: "rgba(244,241,236,0.7)" }}
            >
              <div className="px-4 pt-6 sm:px-6 sm:pt-8">
                {content.imagine.heading && (
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl text-[#6b4f62]">
                    {content.imagine.heading}
                  </h2>
                )}
              </div>
              <div className="px-4 pb-6 sm:px-6 sm:pb-8">
                <ul className="space-y-3 text-sm sm:text-base text-[#6b4f62]">
                  {content.imagine.bullets.map(
                    (item, idx) =>
                      item && (
                        <li key={idx} className="flex gap-3">
                          <span className="mt-1 text-[#ffa769]">✔</span>
                          <span>{item}</span>
                        </li>
                      )
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — SCREENSHOTS */}
      <section
        className="w-full py-20 md:py-24"
        style={{ backgroundColor: content.screenshots.background }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 9 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center aspect-video bg-gray-200 text-xs sm:text-sm text-[#6b4f62]"
              >
                Screenshot coming soon
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 — THIS WORK IS FOR YOU IF */}
      <section
        className="w-full py-20 md:py-24"
        style={{ backgroundColor: content.section8.background }}
      >
        <div className="max-w-5xl mx-auto px-6 md:px-10 lg:px-16 space-y-8">
          {content.section8.heading && (
            <h2 className="text-2xl sm:text-3xl lg:text-4xl text-[#6b4f62]">
              {content.section8.heading}
            </h2>
          )}
          <div className="space-y-6">
            {content.section8.items.map(
              (item, idx) =>
                (item.title || item.body) && (
                  <div key={idx} className="flex gap-3">
                    <span className="mt-2 text-[#b8878a]">→</span>
                    <div>
                      {item.title && (
                        <h3 className="text-lg sm:text-xl text-[#6b4f62]">
                          {item.title}
                        </h3>
                      )}
                      {item.body && (
                        <p className="mt-1 text-sm sm:text-base text-[#6b4f62]">
                          {item.body}
                        </p>
                      )}
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
      </section>

      {/* SECTION 9 — TRUTH CALLOUT */}
      <section
        className="w-full py-20 md:py-24 text-center px-6"
        style={{ backgroundColor: content.truthCallout.background }}
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {content.truthCallout.heading && (
            <h2 className="text-2xl sm:text-3xl lg:text-4xl text-[#6b4f62]">
              {content.truthCallout.heading}
            </h2>
          )}
          {content.truthCallout.paragraph && (
            <p className="text-sm sm:text-base text-[#6b4f62] leading-relaxed">
              {content.truthCallout.paragraph}
            </p>
          )}
        </div>
      </section>

      {/* SECTION 10 — THE EXPANSION PRIVATE MENTORSHIP */}
      <section
        className="w-full py-20 md:py-24"
        style={{ backgroundColor: content.offer.background }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-16 space-y-10">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl text-[#6b4f62]">
              {content.offer.title}
            </h1>
            {content.offer.description && (
              <p className="text-sm sm:text-base leading-relaxed text-[#6b4f62] max-w-3xl">
                {content.offer.description}
              </p>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl tracking-[0.18em] text-[#6b4f62]">
              {content.offer.whatsIncludedHeading}
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {content.offer.columns.map((col, idx) => (
                <div
                  key={idx}
                  className="px-6 sm:px-8 py-8 sm:py-10 rounded-xl text-white"
                  style={{ backgroundColor: "#b8878a" }}
                >
                  {col.title && (
                    <h3 className="text-lg sm:text-xl mb-4">{col.title}</h3>
                  )}
                  <ul className="space-y-3 text-sm sm:text-base">
                    {col.items.map(
                      (item, i) =>
                        item && (
                          <li key={i} className="flex gap-3">
                            <span className="mt-1 text-[#ffa769]">✔</span>
                            <span>{item}</span>
                          </li>
                        )
                    )}
                  </ul>
                </div>
              ))}
            </div>
            {content.offer.belowColumnsParagraph && (
              <p className="text-sm sm:text-base leading-relaxed text-[#6b4f62] max-w-3xl">
                {content.offer.belowColumnsParagraph}
              </p>
            )}
          </div>

          <div className="text-center space-y-3 pt-4">
            <h2 className="text-xl sm:text-2xl lg:text-3xl text-[#6b4f62]">
              {content.offer.investmentHeading}
            </h2>
            {content.offer.investmentText && (
              <p className="text-lg sm:text-2xl text-[#6b4f62] whitespace-pre-line">
                {content.offer.investmentText}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 11 — CTA BANNER */}
      <section
        className="w-full py-20 md:py-24 text-center px-6"
        style={{ backgroundColor: content.ctaBanner.background }}
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {content.ctaBanner.heading && (
            <h2 className="text-2xl sm:text-3xl lg:text-4xl text-[#6b4f62]">
              {content.ctaBanner.heading}
            </h2>
          )}
          {content.ctaBanner.paragraph && (
            <p className="text-sm sm:text-base text-[#6b4f62] leading-relaxed whitespace-pre-line">
              {content.ctaBanner.paragraph}
            </p>
          )}
          <a
            href={content.ctaBanner.primaryButtonHref}
            className={BUTTON_TERTIARY}
          >
            {content.ctaBanner.primaryButtonLabel}
          </a>
        </div>
      </section>

      {/* SECTION 12 — WHY I KNOW THIS WORKS */}
      <section className="w-full relative min-h-[400px]">
        <Image
          src={content.whyWorks.backgroundImage}
          alt=""
          fill
          className="object-cover"
        />
        <div className="relative max-w-6xl mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-24 flex items-center">
          <div className="w-full md:w-1/2 space-y-6 text-white">
            {content.whyWorks.heading && (
              <h2 className="text-2xl sm:text-3xl lg:text-4xl">
                {content.whyWorks.heading}
              </h2>
            )}
            <div className="space-y-4 text-sm sm:text-base">
              {content.whyWorks.paragraphs.map(
                (p, idx) =>
                  p && (
                    <p key={idx} className="leading-relaxed">
                      {p}
                    </p>
                  )
              )}
            </div>
            <div className="pt-2">
              <a
                href={content.whyWorks.buttonHref}
                className={`${BUTTON_SECONDARY} bg-[#b8878a] hover:bg-[#a47174]`}
              >
                {content.whyWorks.buttonLabel}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 13 — CLOSING MESSAGE */}
      <section
        className="w-full py-20 md:py-24 text-center px-6"
        style={{ backgroundColor: content.closing.background }}
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {content.closing.heading && (
            <h2 className="text-2xl sm:text-3xl lg:text-4xl text-[#6b4f62]">
              {content.closing.heading}
            </h2>
          )}
          {content.closing.paragraph && (
            <p className="text-sm sm:text-base text-[#6b4f62] leading-relaxed">
              {content.closing.paragraph}
            </p>
          )}
        </div>
      </section>

      {/* SECTION 14 — FOOTER */}
      <footer
        className="w-full py-16 md:py-20 text-center px-6"
        style={{ backgroundColor: content.footer.background }}
      >
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl text-white">
            {content.footer.heading}
          </h1>
          <a
            href={content.footer.primaryButtonHref}
            className={BUTTON_PRIMARY}
          >
            {content.footer.primaryButtonLabel}
          </a>
        </div>
      </footer>
    </main>
  );
}
