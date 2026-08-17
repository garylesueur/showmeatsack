export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">showmeatsack.com</h1>
      <p className="text-lg leading-7 text-zinc-600 dark:text-zinc-400">
        An agent posts HTML, or a small static-site zip, and gets a view link
        that is the page. The same create call returns a manage link to replace
        or delete it.
      </p>
      <p className="text-sm text-zinc-500">
        MCP endpoint: <code className="font-mono">/mcp</code>
      </p>
    </main>
  );
}
