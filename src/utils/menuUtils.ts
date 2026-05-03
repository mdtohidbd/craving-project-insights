import { MenuItem } from "@/types";

const imageOverrides: Record<string, string> = {
  "Guacamole": "guacamoleCustom",
  "Original Falafel Wrap": "originalFalafelWrapCustom",
  "Beyond Kebab": "beyondKebabCustom",
  "Desi Falafel Plate": "desiFalafelPlateCustom",
};

export const applyCustomImages = (menuItems: MenuItem[]): MenuItem[] => {
  return menuItems.map(item => {
    const customImage = imageOverrides[item.title];
    if (!customImage) return item;

    // If there's a custom image override, update both 'image' and 'images' array
    return {
      ...item,
      image: customImage,
      images: item.images && item.images.length > 0 
        ? [customImage, ...item.images.slice(1)]
        : [customImage]
    };
  });
};
