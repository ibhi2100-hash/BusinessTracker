export function StepFooter({ onNext, loading }: { onNext: () => void; loading: boolean }) {
  return (
    <div className="mt-6">
      <button
        onClick={onNext}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? "Please wait..." : "Next"}
      </button>
    </div>
  );
}
