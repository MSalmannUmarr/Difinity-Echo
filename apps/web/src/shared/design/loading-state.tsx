export function LoadingState({ label = "Loading evidence" }: { label?: string }) {
  return <div className="loading-state" role="status" aria-label={label}><div className="skeleton h-7 w-48"/><div className="skeleton h-24 w-full"/><div className="grid grid-cols-3 gap-3"><div className="skeleton h-36"/><div className="skeleton h-36"/><div className="skeleton h-36"/></div></div>
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return <div className="state-panel"><p className="state-kicker">Unable to load prototype data</p><h2>The simulated evidence service did not respond.</h2><p>Switch the Demo scenario to Healthy organisation or retry this local request.</p>{onRetry && <button className="button-primary" onClick={onRetry}>Retry</button>}</div>
}
