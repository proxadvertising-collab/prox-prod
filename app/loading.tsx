export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 space-y-4">
      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Loading Prox...</p>
    </div>
  )
}
