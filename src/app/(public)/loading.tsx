export default function Loading() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <p className="text-text-muted text-sm">Carregando...</p>
      </div>
    </div>
  );
}
