export function Brand({ onHome }: { onHome: () => void }) {
  return (
    <header className="fixed top-[max(4vh,env(safe-area-inset-top))] left-[5vw] z-20 pointer-events-none max-w-[70vw] md:max-w-none">
      <button
        type="button"
        onClick={onHome}
        aria-label="Aiden Jang, back to the top"
        className="pointer-events-auto cursor-pointer block p-0 m-0 bg-transparent border-0 text-left"
      >
        <span className="garage-brand">AJ / portfolio</span>
      </button>
    </header>
  );
}
