export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white p-6">
      <div className="mb-4">
        <p className="text-sm text-gray-500">Step Progress</p>
        <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
          <div className="h-2 bg-emerald-600 rounded-full w-1/3"></div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {children}
      </div>
    </div>
  );
}
