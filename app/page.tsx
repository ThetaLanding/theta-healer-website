import Image from "next/image";
import fs from "fs";
import path from "path";

type Content = typeof import("../lib/content.json");

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

const HERO_DISPLAY_LINE = "leading-[1]";
const HERO_DISPLAY_SIZE =
  "text-[2.7rem] sm:text-[3.375rem] lg:text-[4.05rem] xl:text-[5.4rem]";
const BODY_TEXT = "text-sm sm:text-base text-[#6b4f62] leading-relaxed";

export default function Home() {
  const content = getContent();

  return (
    <main className="flex flex-col min-h-screen text-[#6b4f62]">
      <section className="w-full min-h-[70vh] flex flex-col md:flex-row">
        <div
          className="md:w-1/2 w-full flex flex-col justify-center px-6 md:px-10 lg:px-16 py-20 md:py-24"
          style={{ backgroundColor: content.hero.backgroundLeft }}
        >
          <div className="w-full max-w-xl space-y-6 text-white">
            <div>
              <h1 className={`hero-display-title ${HERO_DISPLAY_LINE} space-y-2 sm:space-y-3`}>
                <span className={`block ${HERO_DISPLAY_SIZE} tracking-[0.18em] ${HERO_DISPLAY_LINE}`}>
                  COMING
                </span>
                <span className={`block ${HERO_DISPLAY_SIZE} tracking-[0.18em] ${HERO_DISPLAY_LINE}`}>
                  SOON
                </span>
              </h1>
            </div>
            <p className={`${BODY_TEXT} text-white/95 font-bold`}>
              Subconscious reprogramming for root-cause healing
            </p>
            <p className={`${BODY_TEXT} text-white/95 font-bold`}>
              Reach Out:{" "}
              <a
                href="mailto:hello@createhigher.com"
                className="underline underline-offset-4 hover:opacity-90"
              >
                hello@createhigher.com
              </a>
            </p>
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
    </main>
  );
}
