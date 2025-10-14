import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <>
      <div className="creative-bg pointer-events-none z-0">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>

      <Navbar />
      <main className="min-h-screen pt-24 flex items-center justify-center">
        <section className="max-w-4xl mx-auto p-8 text-white">
          <h1 className="text-4xl font-bold mb-4">Landing Page</h1>
          <p className="text-lg text-gray-100/85">This is the Next.js frontend. Use the Login / Signup pages to test endpoints.</p>
        </section>
      </main>
    </>
  );
}
