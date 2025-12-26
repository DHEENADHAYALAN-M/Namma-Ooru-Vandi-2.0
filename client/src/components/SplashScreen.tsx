import { MapPin, Bus } from "lucide-react";

interface SplashScreenProps {
  isVisible: boolean;
}

export function SplashScreen({ isVisible }: SplashScreenProps) {
  return (
    <div
      className={`fixed inset-0 z-[9999] bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-6 animate-splash-fade-in">
        {/* Logo Circle */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-white/10 rounded-full blur-xl"></div>
          <div className="relative bg-white/20 backdrop-blur-sm rounded-full w-28 h-28 flex items-center justify-center border border-white/30 shadow-2xl">
            <div className="flex flex-col items-center justify-center gap-1">
              <Bus size={48} className="text-white" strokeWidth={1.5} />
              <MapPin size={20} className="text-blue-200" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* App Name */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight font-display">
            Namma Ooru Vandi
          </h1>
          <p className="text-blue-100 text-sm font-medium mt-2">
            Real-time Transit Tracker
          </p>
        </div>
      </div>
    </div>
  );
}
