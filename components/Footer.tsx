import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary/80 text-neutral py-6 mt-16">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <p>© {new Date().getFullYear()} RapiMoni. All rights reserved.</p>
        <div className="space-x-6">
          <a href="/terms" className="hover:underline">Terms</a>
          <a href="/privacy" className="hover:underline">Privacy</a>
          <a href="/contact" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
}
