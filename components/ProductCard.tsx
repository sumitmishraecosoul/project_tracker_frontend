"use client";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCart } from "@/lib/cart-context";
import { Product } from "@/lib/store-data";
import { motion } from "framer-motion";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="group rounded-lg border bg-card p-3 hover:shadow-md">
      <Link href={`/store/product/${product.id}`} className="block">
        <div className="relative overflow-hidden rounded-md">
          <img src={product.image} alt={product.title} className="h-52 w-full object-cover transition-transform group-hover:scale-105" />
          <Badge className="absolute left-2 top-2">{product.rating}★</Badge>
        </div>
        <div className="mt-3 space-y-1">
          <div className="line-clamp-1 font-medium">{product.title}</div>
          <div className="text-primary font-semibold">${product.price.toFixed(2)}</div>
        </div>
      </Link>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => addToCart({ id: product.id, title: product.title, price: product.price, image: product.image })}>Add to Cart</Button>
        <Link href="/store/checkout">
          <Button>Buy Now</Button>
        </Link>
      </div>
    </motion.div>
  );
}


