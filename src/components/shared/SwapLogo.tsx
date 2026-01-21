import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";

interface SwapLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-9 w-9",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

export const SwapLogo = ({ className = "", size = "md" }: SwapLogoProps) => {
  return (
    <>
      {/* Light mode logo (visible in light mode) */}
      <img
        src={logoLight}
        alt="SWAP"
        className={`${sizeClasses[size]} rounded-lg dark:hidden ${className}`}
      />
      {/* Dark mode logo (visible in dark mode) */}
      <img
        src={logoDark}
        alt="SWAP"
        className={`${sizeClasses[size]} rounded-lg hidden dark:block ${className}`}
      />
    </>
  );
};