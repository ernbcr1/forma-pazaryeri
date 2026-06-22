export default function BrandLogo({
  size = "md",
  showText = true,
}: {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}) {
  const iconSize =
    size === "sm" ? "h-9 w-9" : size === "lg" ? "h-14 w-14" : "h-11 w-11";

  const textSize =
    size === "sm"
      ? "text-sm"
      : size === "lg"
        ? "text-2xl"
        : "text-base";

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${iconSize} relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,51,102,0.16),transparent_35%)]" />

        <div className="relative flex items-center">
          <span className="text-[22px] font-black leading-none tracking-[-0.14em] text-[#003366]">
            e
          </span>
          <span className="-ml-1 text-[24px] font-black leading-none tracking-[-0.08em] text-[#003366]">
            F
          </span>
        </div>

        <div className="absolute bottom-1.5 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-[#003366]/45" />
      </div>

      {showText && (
        <div className="hidden md:block">
          <p className={`${textSize} font-black leading-5 tracking-tight`}>
            elFormazione
          </p>
          <p className="mt-0.5 text-[11px] font-medium tracking-wide text-neutral-500">
            Original football marketplace
          </p>
        </div>
      )}
    </div>
  );
}