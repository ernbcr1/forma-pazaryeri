import Image from "next/image";

export default function BrandLogo({
  size = "md",
  showText = true,
}: {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}) {
  const iconSize =
    size === "sm" ? "h-9 w-9" : size === "lg" ? "h-14 w-14" : "h-11 w-11";

  const imageSize = size === "sm" ? 36 : size === "lg" ? 56 : 44;

  const textSize =
    size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-base";

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${iconSize} relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#07111f]/10 bg-white shadow-[0_14px_35px_rgba(7,17,31,0.10)]`}
      >
        <Image
          src="/elf-icon.jpg"
          alt="elFormazione logo"
          width={imageSize}
          height={imageSize}
          className="h-full w-full object-cover"
          priority
        />
      </div>

      {showText && (
        <div className="hidden md:block">
          <p
            className={`${textSize} font-black leading-5 tracking-[-0.045em] text-[#07111f]`}
          >
            elFormazione
          </p>

          <p className="mt-1 text-[11px] font-black tracking-[-0.01em] text-[#0b1d35]/75">
            Original football marketplace
          </p>
        </div>
      )}
    </div>
  );
}