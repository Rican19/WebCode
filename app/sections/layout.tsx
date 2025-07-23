import SideNavbar from "../components/side-navbar";
import { DiseaseDataProvider } from "../contexts/DiseaseDataContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DiseaseDataProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-[#f8fffe] via-[#f0f9ff] to-[#e0f2fe] relative overflow-hidden">
        {/* Enhanced Professional Background - Enhanced nga professional background para sa consistency */}
        <div className="absolute inset-0">
          {/* Subtle geometric patterns - Subtle nga geometric patterns na consistent sa login */}
          <div className="absolute inset-0 opacity-8">
            <div className="absolute top-20 left-20 w-32 h-32 border border-[#A0C878]/30 rounded-full"></div>
            <div className="absolute top-40 right-40 w-24 h-24 border border-[#143D60]/20 rounded-lg rotate-45"></div>
            <div className="absolute bottom-32 left-32 w-20 h-20 border border-[#EB5B00]/25 rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-16 h-16 border border-[#A0C878]/30 rounded-lg rotate-12"></div>

            {/* Additional complementary shapes - Additional shapes para sa better visual balance */}
            <div className="absolute top-1/3 left-10 w-12 h-12 border border-[#143D60]/15 rounded-full"></div>
            <div className="absolute top-2/3 right-10 w-8 h-8 border border-[#A0C878]/20 rounded-lg rotate-45"></div>
            <div className="absolute top-1/2 left-1/3 w-6 h-6 bg-[#DDEB9D]/20 rounded-full"></div>
            <div className="absolute bottom-1/3 right-1/3 w-10 h-10 bg-[#A0C878]/10 rounded-lg rotate-12"></div>
          </div>

          {/* Enhanced gradient overlays - Enhanced gradient overlays para sa better depth */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#DDEB9D]/15 via-transparent to-[#A0C878]/8"></div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-white/20 via-transparent to-transparent"></div>

          {/* Subtle grid pattern - Subtle grid pattern para sa texture na consistent */}
          <div className="absolute inset-0 opacity-3" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #143D60 0.5px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative z-10 flex w-full">
          <SideNavbar />
          {children}
        </div>
      </div>
    </DiseaseDataProvider>
  );
}
