import { MenuItem } from "@/types";

const imageOverrides: Record<string, string> = {
  "Guacamole": "guacamoleCustom",
  "Original Falafel Wrap": "originalFalafelWrapCustom",
  "Beyond Kebab": "beyondKebabCustom",
  "Desi Falafel Plate": "desiFalafelPlateCustom",
};

export const applyCustomImages = (menuItems: MenuItem[]): MenuItem[] => {
  return menuItems.map(item => ({
    ...item,
    image: imageOverrides[item.title] || item.image
  }));
};
