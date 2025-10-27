"use client";
import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";

export function Navbar() {
  const { items, subtotal } = useCart();
  const [open, setOpen] = useState(false);
  const count = items.reduce((n, it) => n + it.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/store" className="font-semibold text-lg">LuxStore</Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/store">Home</Link>
            <Link href="/store/shop">Shop</Link>
            <Link href="/store/profile">Profile</Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/store/auth/login">
            <Button variant="ghost" size="icon" aria-label="Account">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <div className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart" onClick={() => setOpen((v) => !v)}>
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center px-1">
                  {count}
                </span>
              )}
            </Button>
            {open && (
              <div className="absolute right-0 mt-2 w-80 rounded-md border bg-popover p-3 shadow-lg">
                <div className="mb-2 text-sm font-medium">Cart</div>
                {items.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Your cart is empty.</div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-auto pr-1">
                    {items.map((it) => (
                      <div key={it.id} className="flex items-center gap-3">
                        <img src={it.image} alt={it.title} className="h-12 w-12 rounded object-cover" />
                        <div className="flex-1">
                          <div className="text-sm font-medium line-clamp-1">{it.title}</div>
                          <div className="text-xs text-muted-foreground">{it.quantity} × ${it.price.toFixed(2)}</div>
                        </div>
                        <div className="text-sm font-semibold">${(it.price * it.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm">Subtotal</div>
                  <div className="text-sm font-semibold">${subtotal.toFixed(2)}</div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link href="/store/cart" onClick={() => setOpen(false)}>
                    <Button className="w-full" variant="outline">View Cart</Button>
                  </Link>
                  <Link href="/store/checkout" onClick={() => setOpen(false)}>
                    <Button className="w-full">Checkout</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


