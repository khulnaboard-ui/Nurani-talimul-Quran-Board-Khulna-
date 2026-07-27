import HeroSlider from "@/components/home/HeroSlider";
import NoticeBoard from "@/components/home/NoticeBoard";
import ShortcutCards from "@/components/home/ShortcutCards";
import AboutBoard from "@/components/home/AboutBoard";
import TrainingSchedule from "@/components/home/TrainingSchedule";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const user = await getUserSession();
  const isMadrasa = user?.role === "MADRASA";

  const record = await prisma.pageContent.findUnique({ where: { slug: 'cover-display-flags' } });
  let scrollingNotice = "";
  let showScrollingNotice = false;
  
  if (record) {
    try {
      const parsed = JSON.parse(record.content);
      scrollingNotice = parsed.scrollingNotice || "";
      showScrollingNotice = parsed.showScrollingNotice ?? false;
    } catch {}
  }

  return (
    <div className="flex flex-col min-h-screen pb-16 bg-slate-50">
      
      {/* Top Section: Hero Slider (Parallax Sticky) */}
      <section className="w-full sticky top-[60px] md:top-[68px] z-0">
        <HeroSlider isMadrasa={isMadrasa} />
      </section>

      {/* Content wrapper with solid background to scroll over the sticky hero */}
      <div className="bg-slate-50 flex-1 relative z-10 shadow-[0_-8px_20px_rgb(0,0,0,0.08)]">
        
        {/* Scrolling Notice Ticker */}
        {showScrollingNotice && scrollingNotice && (
          <div className="bg-emerald-700 text-white py-2 overflow-hidden flex items-center shadow-sm">
            <div className="container mx-auto flex items-center px-4">
              <span className="font-bold whitespace-nowrap bg-emerald-800 px-3 py-1 rounded-md mr-4 text-sm z-10 shrink-0">জরুরী নোটিশ:</span>
              <div className="flex-1 overflow-hidden relative">
                {/* @ts-ignore - marquee is deprecated but works reliably for simple tickers without custom css */}
                <marquee className="text-sm font-medium pt-1">{scrollingNotice}</marquee>
              </div>
            </div>
          </div>
        )}
        
        {/* Middle Section: Shortcut Cards + Notice Board */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <ShortcutCards />
            </div>
            <div className="lg:col-span-1">
              <NoticeBoard />
            </div>
          </div>
        </section>

        {/* Bottom Section: Split Board & Training */}
        <section className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-5 flex flex-col">
            <AboutBoard />
          </div>
          <div className="lg:col-span-7 flex flex-col">
            <TrainingSchedule />
          </div>
        </div>
      </section>
      </div>

    </div>
  );
}
