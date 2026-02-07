export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 pt-16 z-10">
      {children}
    </div>
  );
}
