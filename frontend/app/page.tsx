import { Suspense } from "react";
import ContentSection from "@/components/Content/ContentSection";
import ContentClients from "@/components/Clients/ContentClients";
export default function Home() {
  return (
    <main className="h-full bg-[radial-gradient(circle_at_top,#fff7ed_0%,#fafafa_35%,#f4f4f5_100%)] px-6 py-10 text-zinc-900 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 rounded-full border border-zinc-200 bg-white/80 px-6 py-3 text-sm text-zinc-500 shadow-sm backdrop-blur">
          Video and Comments
        </div>
        <Suspense>
          {/*Clients Provider*/}
          <ContentClients>
            {/* Content Provided */}
            <ContentSection />
          </ContentClients>
        </Suspense>
      </div>
    </main>
  );
}
