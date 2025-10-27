export type Category = {
  id: string;
  name: string;
  image: string;
};

export type Product = {
  id: string;
  title: string;
  price: number;
  rating: number;
  image: string;
  images?: string[];
  description: string;
  categoryId: string;
};

export const categories: Category[] = [
  { id: "cat-1", name: "Electronics", image: "/project_tracker_img.png" },
  { id: "cat-2", name: "Home & Kitchen", image: "/project_tracker_img.png" },
  { id: "cat-3", name: "Fashion", image: "/project_tracker_img.png" },
  { id: "cat-4", name: "Sports", image: "/project_tracker_img.png" },
];

export const products: Product[] = Array.from({ length: 24 }).map((_, i) => {
  const categoryId = categories[i % categories.length].id;
  const price = 19 + (i % 10) * 5;
  const rating = (i % 5) + 1;
  return {
    id: `prod-${i + 1}`,
    title: `Premium Product ${i + 1}`,
    price,
    rating,
    image: "/project_tracker_img.png",
    images: ["/project_tracker_img.png", "/project_tracker_img.png"],
    description:
      "Experience premium quality and modern design. Built for performance and crafted to impress.",
    categoryId,
  };
});


