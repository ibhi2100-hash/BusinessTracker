// PageContainer.tsx

interface Props {
  children: React.ReactNode;
}

export function PageContainer({
  children,
}: Props) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {children}
    </div>
  );
}