export interface MenuItem {
  id: number;
  title: string;
  price: string;
  category: string;
  description?: string;
  image: string;
  images?: string[];
  tags?: string[];
  addOns?: { name: string, price: number }[];
}
