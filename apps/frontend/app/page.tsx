import Link from 'next/link';

export default function HomePage() {
  const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-12">
      <div className="mx-auto max-w-4xl rounded-3xl bg-slate-900/80 p-10 shadow-2xl ring-1 ring-white/10">
        <h1 className="text-4xl font-semibold text-cyan-300">Inquiry Agent</h1>
        <p className="mt-4 text-slate-300 leading-8">
          A starter frontend for the inquiry agent platform. Use this UI to connect to the backend agent API.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href={`${API_BASE_URL}/health`} className="rounded-2xl bg-cyan-500 px-5 py-4 font-semibold text-slate-950 transition hover:bg-cyan-400">
            View status
          </Link>

          <Link href={`${API_BASE_URL}/agent`} className="rounded-2xl border border-cyan-500 px-5 py-4 text-cyan-200 transition hover:bg-cyan-500/10">
            Call agent API
          </Link>
        </div>
      </div>
    </main>
  );
}
