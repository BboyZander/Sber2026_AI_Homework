export function LandingBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-canvas" />
      <div className="absolute -left-1/4 top-0 h-[520px] w-[520px] rounded-full bg-accent/18 blur-[120px]" />
      <div className="absolute -right-1/4 top-1/3 h-[480px] w-[480px] rounded-full bg-accent-dark/14 blur-[100px]" />
      <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[90px]" />
    </div>
  );
}
