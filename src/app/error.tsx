"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="surface-dark flex min-h-svh items-center">
      <div className="container-x">
        <p className="eyebrow mb-6">Something went wrong</p>
        <h1 className="display-l max-w-[14ch]">A room failed to <em>load.</em></h1>
        <button type="button" onClick={reset} className="btn btn-solid mt-10">Try again</button>
      </div>
    </main>
  );
}
