import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs text-brass tracking-widest uppercase mb-3">404</p>
      <p className="font-display text-2xl text-ink mb-2">No record at this address.</p>
      <p className="font-body text-pencil max-w-md mb-6">
        Nothing's registered under this path. Check the link, or start from the beginning.
      </p>
      <Link
        to="/"
        className="focus-ring bg-ink text-paper font-body text-sm rounded px-5 py-2.5"
      >
        Back to home
      </Link>
    </div>
  );
}
