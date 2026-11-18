import Grain from "./Grain";

// 28px grid, crumple highlights/shadows, then the paper colour.
const PAPER_BG = [
  "linear-gradient(rgba(0,0,0,0.07) 1px, transparent 1px) 0 0 / 28px 28px",
  "linear-gradient(90deg, rgba(0,0,0,0.07) 1px, transparent 1px) 0 0 / 28px 28px",
  "radial-gradient(40% 30% at 20% 30%, rgba(255,255,255,0.55), transparent 70%)",
  "radial-gradient(35% 25% at 75% 20%, rgba(0,0,0,0.06), transparent 70%)",
  "radial-gradient(45% 35% at 60% 70%, rgba(255,255,255,0.4), transparent 70%)",
  "radial-gradient(30% 30% at 30% 80%, rgba(0,0,0,0.05), transparent 70%)",
  "var(--color-paper)",
].join(", ");

type Props = React.HTMLAttributes<HTMLDivElement>;

/** The paper sheet: grid + crumples + grain. Position/size/clip come from the caller. */
export default function Paper({ className = "", style, children, ...rest }: Props) {
  return (
    <div className={`relative ${className}`} style={{ background: PAPER_BG, ...style }} {...rest}>
      <Grain />
      {children}
    </div>
  );
}
