import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <div className="font-semibold text-lg">LuxStore</div>
          <p className="mt-2 text-muted-foreground">Premium products. Modern design.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="font-medium">Company</div>
            <Link href="#" className="text-muted-foreground hover:text-foreground">About</Link>
            <br />
            <Link href="#" className="text-muted-foreground hover:text-foreground">Careers</Link>
          </div>
          <div className="space-y-2">
            <div className="font-medium">Help</div>
            <Link href="#" className="text-muted-foreground hover:text-foreground">Support</Link>
            <br />
            <Link href="#" className="text-muted-foreground hover:text-foreground">Contact</Link>
          </div>
        </div>
        <div className="text-muted-foreground">© {new Date().getFullYear()} LuxStore. All rights reserved.</div>
      </div>
    </footer>
  );
}


