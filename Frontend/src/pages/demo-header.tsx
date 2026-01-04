import { Header } from "@/components/layout/Header";

export default function DemoHeader() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 px-6">
        <h1 className="text-3xl font-display">
          Header Demo
        </h1>
        <p className="mt-4 text-muted-foreground">
          Scroll, resize, toggle auth — this page exists purely to validate header behavior.
        </p>
      </main>
    </div>
  );
}
