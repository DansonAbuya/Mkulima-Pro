export default function ProtectedLoading() {
  return (
    <div className="flex flex-col pt-16 lg:pt-0 flex-1 bg-gray-50 animate-pulse">
      <div className="border-b border-gray-200 bg-white h-32" />
      <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
