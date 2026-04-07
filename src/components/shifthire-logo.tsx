import { cn } from "@/lib/utils";

interface ShiftHireLogoProps {
  size?: "xs" | "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizes = {
  xs: { box: "w-7 h-7 rounded-lg", svg: "w-3.5 h-3.5", text: "text-sm font-bold" },
  sm: { box: "w-9 h-9 rounded-xl", svg: "w-4 h-4", text: "text-base font-bold" },
  md: { box: "w-11 h-11 rounded-xl", svg: "w-5 h-5", text: "text-lg font-bold" },
  lg: { box: "w-14 h-14 rounded-2xl", svg: "w-7 h-7", text: "text-2xl font-bold" },
};

export function ShiftHireLogo({ size = "sm", showText = true, className }: ShiftHireLogoProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Icon mark */}
      <div className={cn(
        s.box,
        "relative flex items-center justify-center flex-shrink-0 overflow-hidden",
        "bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700",
        "shadow-lg shadow-blue-600/30"
      )}>
        {/* Subtle grid texture */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 4px,rgba(255,255,255,0.1) 4px,rgba(255,255,255,0.1) 5px),repeating-linear-gradient(90deg,transparent,transparent 4px,rgba(255,255,255,0.1) 4px,rgba(255,255,255,0.1) 5px)"
          }}
        />
        {/* Lightning bolt + shift arrow icon */}
        <svg className={cn(s.svg, "text-white relative z-10 drop-shadow")} viewBox="0 0 24 24" fill="none">
          {/* Arrow pointing right/up = "shift" */}
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {showText && (
        <span className={cn(s.text, "text-foreground tracking-tight leading-none")}>
          Shift<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Hire</span>
        </span>
      )}
    </div>
  );
}
