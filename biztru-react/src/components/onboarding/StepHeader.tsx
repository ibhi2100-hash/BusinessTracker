export function StepHeader({ step, title }: { step: number; title: string }) {
  return (
    <div className="mb-4">
      <p className="text-sm text-gray-500">Step {step}</p>
      <h1 className="text-xl font-bold">{title}</h1>
    </div>
  );
}
