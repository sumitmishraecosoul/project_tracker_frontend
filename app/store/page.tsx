import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { categories, products } from "@/lib/store-data";
import { ProductCard } from "@/components/ProductCard";

export default function StoreHomePage() {
  const featured = products.slice(0, 8);

  return (
    <div className="py-8">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-r from-primary/10 to-primary/0 p-8 md:p-12">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight">Discover Premium Products</h1>
          <p className="text-muted-foreground">Elevate your lifestyle with modern, high-quality essentials curated for you.</p>
          <div className="flex gap-3">
            <Link href="/store/shop"><Button size="lg">Shop Now</Button></Link>
            <Link href="/store/shop"><Button size="lg" variant="outline">Explore Deals</Button></Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Shop by Category</h2>
          <Link href="/store/shop" className="text-sm text-muted-foreground hover:text-foreground">View all</Link>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link key={c.id} href={{ pathname: "/store/shop", query: { category: c.id } }} className="group rounded-xl border p-4 hover:shadow-md">
              <img src={c.image} alt={c.name} className="h-28 w-full rounded-lg object-cover" />
              <div className="mt-3 font-medium group-hover:underline">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Featured</h2>
          <Link href="/store/shop" className="text-sm text-muted-foreground hover:text-foreground">Browse</Link>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="mt-16 rounded-2xl border p-8 text-center">
        <h3 className="text-lg font-semibold">Join our newsletter</h3>
        <p className="mt-1 text-sm text-muted-foreground">Be the first to know about new arrivals and exclusive offers.</p>
        <form className="mt-4 mx-auto flex max-w-md items-center gap-2">
          <input type="email" placeholder="you@example.com" className="h-10 flex-1 rounded-md border px-3 text-sm" />
          <Button>Subscribe</Button>
        </form>
      </section>
    </div>
  );
}


