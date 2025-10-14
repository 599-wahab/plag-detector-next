// components/Navbar.js
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="navbar fixed top-0 left-0 right-0 z-30">
      <nav className="max-w-6xl mx-auto px-6 py-4 grid grid-cols-3 items-center">
        <div className="nav-left">
          <h2 className="text-white font-semibold text-xl">AWK Ltd</h2>
        </div>

        <div className="nav-center flex justify-center gap-6">
          <Link href="/" className="text-white hover:text-red-300">Home</Link>
          <Link href="/meeting" className="text-white hover:text-red-300">Meeting</Link>
          <Link href="/profile" className="text-white hover:text-red-300">Profile</Link>
        </div>

        <div className="nav-right flex justify-end">
          <Link
            href="/signup"
            className="signup-btn inline-block text-white border-2 border-red-500 rounded-md px-4 py-1 hover:bg-red-500 transition"
          >
            Sign up
          </Link>
        </div>
      </nav>
    </header>
  );
}
