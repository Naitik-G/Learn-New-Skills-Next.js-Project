import Header from "@/components/Header";

export default function Home() {
  return (
    <div>
      <Header />
      <main className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold">Hello World</h1>
        <p className="text-gray-600 mt-2">
          Welcome to the Freelance Platform. Please register or login to continue.
        </p>
      </main>
    </div>
  );
}