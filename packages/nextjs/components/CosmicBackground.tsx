export default function CosmicBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px] animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>
    </div>
  );
}
