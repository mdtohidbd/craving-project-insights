import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Font, Image } from '@react-pdf/renderer';
import { MenuItem } from '@/types';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { resolveImage } from './Menu';

// Register fonts for a more elegant look
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 700 },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-italic.ttf', fontStyle: 'italic' },
  ]
});

// Create styles for the PDF Document
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FAF9F6',
    padding: 30,
    fontFamily: 'Open Sans',
  },
  pageBorder: {
    flex: 1,
    border: '2px solid #D4AF37',
    padding: 20,
    paddingBottom: 50,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#D4AF37',
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  divider: {
    borderBottom: '1px solid #E0E0E0',
    width: '50%',
    alignSelf: 'center',
    marginBottom: 20,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    backgroundColor: '#f0ece1',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  categoryItemsGrid: {
    flexDirection: 'column',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  itemContainer: {
    width: '48%',
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  imageContainer: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 25,
    overflow: 'hidden',
    border: '1px solid #D4AF37',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  itemDetails: {
    flex: 1,
    flexDirection: 'column',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#222222',
  },
  itemPrice: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  itemDescription: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.3,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#999999',
    borderTop: '1px solid #E0E0E0',
    paddingTop: 10,
  }
});

// The actual PDF Document component
const MenuDocument = ({ items, categories }: { items: MenuItem[], categories: string[] }) => {
  const chunkArray = (arr: any[], size: number) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.pageBorder}>
          <View style={styles.header}>
            <Text style={styles.title}>Lost Appetite</Text>
            <Text style={styles.subtitle}>A culinary journey of delectable offerings</Text>
          </View>
          <View style={styles.divider} />

          {categories.map((category) => {
            const categoryItems = items.filter(item => item.category === category);
            if (categoryItems.length === 0) return null;
            
            const rows = chunkArray(categoryItems, 2);
            
            return (
              <View key={category} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>{category}</Text>
                <View style={styles.categoryItemsGrid}>
                  {rows.map((rowItems, rowIdx) => (
                    <View key={rowIdx} style={styles.rowContainer} wrap={false}>
                      {rowItems.map((item: any) => (
                        <View key={item.id} style={styles.itemContainer}>
                          {item.image ? (
                            <View style={styles.imageContainer}>
                              <Image style={styles.itemImage} src={resolveImage(item.image)} />
                            </View>
                          ) : null}
                          <View style={styles.itemDetails}>
                            <View style={styles.itemRow}>
                              <Text style={styles.itemName}>{item.title}</Text>
                              <Text style={styles.itemPrice}>{item.price?.replace('$', '৳').replace('.00', '') || ''}</Text>
                            </View>
                            <Text style={styles.itemDescription}>{item.description}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </View>
            );
          })}

          <Text style={styles.footer} fixed>
            Thank you for choosing Lost Appetite • Visit us online for more!
          </Text>
        </View>
      </Page>
    </Document>
  );
};

const MenuPDFView = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const [menuRes, catRes] = await Promise.all([
          fetch(`${apiUrl}/menu`),
          fetch(`${apiUrl}/categories`)
        ]);

        if (menuRes.ok) {
          const menuData = await menuRes.json();
          setItems(menuData);
          
          let catData = [];
          if (catRes.ok) {
            try { catData = await catRes.json(); } catch (e) {}
          }
          
          const apiCatNames = catData.filter((c: any) => c.name !== "All").map((c: any) => c.name);
          const itemCatNames = Array.from(new Set(menuData.map((m: any) => m.category))).filter(Boolean);
          const allCatNames = Array.from(new Set([...apiCatNames, ...itemCatNames]));
          const validCatNames = allCatNames.filter(cat => 
            menuData.some((item: any) => item.category === cat)
          );
          
          setCategories(validCatNames as string[]);
        }
      } catch (error) {
        console.error("Failed to load menu for PDF", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(40_18%_96%)] flex flex-col">
      <Navbar />
      
      <div className="pt-24 pb-6 px-4 md:px-12 flex-grow flex flex-col">
        <div className="container mx-auto mb-4 text-center">
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">Our Menu PDF</h1>
          <p className="text-muted-foreground">You can download or print this menu directly from the viewer.</p>
        </div>
        
        <div className="flex-grow rounded-xl overflow-hidden shadow-2xl border border-primary/10 bg-white" style={{ minHeight: '75vh' }}>
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center min-h-[500px]">
              <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
              <p className="text-primary font-medium">Generating beautiful PDF...</p>
            </div>
          ) : (
            <PDFViewer width="100%" height="100%" className="border-none min-h-[500px] h-full">
              <MenuDocument items={items} categories={categories} />
            </PDFViewer>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuPDFView;
