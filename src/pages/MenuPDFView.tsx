import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, PDFDownloadLink, Image } from '@react-pdf/renderer';
import { MenuItem } from '@/types';
import { Loader2, Download, Printer, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { resolveImage } from './Menu';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { applyCustomImages } from '@/utils/menuUtils';

// Error Boundary to catch any PDF rendering errors gracefully
class PDFErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("PDF Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Helper to get safe image URL for @react-pdf/renderer
const getSafeImageUrl = (img?: string): string | null => {
  if (!img) return null;
  try {
    const resolved = resolveImage(img);
    if (!resolved || typeof resolved !== 'string') return null;
    if (resolved.startsWith('http://') || resolved.startsWith('https://') || resolved.startsWith('data:')) {
      return resolved;
    }
    if (resolved.startsWith('/')) {
      return `${window.location.origin}${resolved}`;
    }
    return `${window.location.origin}/${resolved}`;
  } catch (e) {
    return null;
  }
};

// Create styles for the PDF Document using built-in Helvetica fonts
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FAF9F6',
    padding: 24,
    fontFamily: 'Helvetica',
  },
  pageBorder: {
    flex: 1,
    border: '2px solid #D4AF37',
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Oblique',
    color: '#D4AF37',
    letterSpacing: 1,
  },
  divider: {
    borderBottom: '1px solid #D4AF37',
    marginBottom: 12,
  },
  categorySection: {
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#D4AF37',
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: 3,
    marginBottom: 8,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoryItemsGrid: {
    flexDirection: 'column',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemContainer: {
    width: '48%',
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 4,
    border: '1px solid #F0F0F0',
  },
  imageContainer: {
    width: 36,
    height: 36,
    marginRight: 6,
    borderRadius: 4,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  itemName: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    flex: 1,
    paddingRight: 4,
  },
  itemPrice: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#D4AF37',
  },
  itemDescription: {
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: '#6B7280',
    lineHeight: 1.2,
  },
  footer: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    textAlign: 'center',
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: '#999999',
    borderTop: '1px solid #E0E0E0',
    paddingTop: 8,
  }
});

interface MenuDocumentProps {
  items: MenuItem[];
  categories: string[];
  t: (key: string, defaultValue?: string) => string;
}

// The actual PDF Document component - DOES NOT call React DOM hooks internally
const MenuDocument = ({ items, categories, t }: MenuDocumentProps) => {
  const chunkArray = (arr: any[], size: number) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  return (
    <Document title="Menu - Lost Appetite">
      <Page size="A4" style={styles.page}>
        <View style={styles.pageBorder}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("pos.lost_appetite", "Lost Appetite")}</Text>
            <Text style={styles.subtitle}>{t("pos.a_culinary_journey_of_delectable_offerin", "A culinary journey of delectable offerings")}</Text>
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
                      {rowItems.map((item: MenuItem) => {
                        const safeImage = getSafeImageUrl(item.image);
                        const priceStr = item.price ? String(item.price).replace('$', '৳').replace('.00', '') : '';

                        return (
                          <View key={item.id || item.title} style={styles.itemContainer}>
                            {safeImage ? (
                              <View style={styles.imageContainer}>
                                <Image style={styles.itemImage} src={safeImage} />
                              </View>
                            ) : null}
                            <View style={styles.itemDetails}>
                              <View style={styles.itemRow}>
                                <Text style={styles.itemName}>{item.title}</Text>
                                <Text style={styles.itemPrice}>{priceStr}</Text>
                              </View>
                              {item.description ? (
                                <Text style={styles.itemDescription}>{item.description}</Text>
                              ) : null}
                            </View>
                          </View>
                        );
                      })}
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

const PrintableMenuFallback = ({ items, categories }: { items: MenuItem[]; categories: string[] }) => (
  <div className="w-full p-8 print:p-0">
    <div className="text-center max-w-xl mx-auto mb-8 print:hidden">
      <h2 className="text-[#D4AF37] font-bold text-xl mb-1">Interactive Menu Viewer</h2>
      <p className="text-sm text-muted-foreground">Print or save the elegant menu directly!</p>
    </div>

    <div className="max-w-4xl mx-auto border-2 border-[#D4AF37] p-8 rounded-lg bg-[#FAF9F6]">
      <div className="text-center mb-6 border-b border-[#D4AF37] pb-4">
        <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-wider">LOST APPETITE</h1>
        <p className="text-xs italic text-[#D4AF37] uppercase tracking-widest mt-1">A culinary journey of delectable offerings</p>
      </div>

      {categories.map((cat) => {
        const catItems = items.filter(i => i.category === cat);
        if (catItems.length === 0) return null;
        return (
          <div key={cat} className="mb-6">
            <h2 className="text-lg font-bold text-[#D4AF37] uppercase border-b border-gray-200 pb-1 mb-4">{cat}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {catItems.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-white rounded border border-gray-100 shadow-sm">
                  {item.image && (
                    <img src={resolveImage(item.image)} alt={item.title} className="w-12 h-12 object-cover rounded" />
                  )}
                  <div className="flex-grow">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                      <span className="text-sm font-bold text-[#D4AF37]">{item.price?.replace('$', '৳').replace('.00', '')}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const MenuPDFView = () => {
  const { t } = useTranslation();
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
          const processedMenuData = applyCustomImages(menuData);
          setItems(processedMenuData);

          let catData = [];
          if (catRes.ok) {
            try { catData = await catRes.json(); } catch (e) { }
          }

          const apiCatNames = catData.filter((c: any) => c.name !== "All").map((c: any) => c.name);
          const itemCatNames = Array.from(new Set(processedMenuData.map((m: any) => m.category))).filter(Boolean);
          const allCatNames = Array.from(new Set([...apiCatNames, ...itemCatNames]));
          const validCatNames = allCatNames.filter(cat =>
            processedMenuData.some((item: any) => item.category === cat)
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[hsl(40_18%_96%)] flex flex-col">
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className="pt-24 pb-6 px-4 md:px-12 flex-grow flex flex-col print:pt-0 print:pb-0 print:px-0">
        <div className="container mx-auto mb-4 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
          <div>
            <Link to="/menu" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Menu
            </Link>
            <h1 className="text-3xl font-serif font-bold text-primary">{t("pos.our_menu_pdf", "Our Menu PDF")}</h1>
            <p className="text-sm text-muted-foreground">{t("pos.you_can_download_or_print_this_menu_dire", "You can download or print this menu directly from the viewer.")}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-all text-xs font-bold uppercase tracking-wider shadow-md"
            >
              <Printer className="w-4 h-4" /> Print Menu
            </button>

            {!loading && items.length > 0 && (
              <PDFErrorBoundary fallback={null}>
                <PDFDownloadLink
                  document={<MenuDocument items={items} categories={categories} t={t} />}
                  fileName="Lost-Appetite-Menu.pdf"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-[hsl(195,30%,8%)] hover:bg-accent/90 transition-all text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  {({ loading: pdfLoading }) => (
                    pdfLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Preparing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" /> Download PDF
                      </>
                    )
                  )}
                </PDFDownloadLink>
              </PDFErrorBoundary>
            )}
          </div>
        </div>

        <div className="flex-grow rounded-xl overflow-hidden shadow-2xl border border-primary/10 bg-white min-h-[75vh] flex flex-col print:shadow-none print:border-none print:rounded-none">
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center min-h-[500px]">
              <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
              <p className="text-primary font-medium">{t("pos.generating_beautiful_pdf", "Generating beautiful PDF...")}</p>
            </div>
          ) : (
            <PDFErrorBoundary fallback={<PrintableMenuFallback items={items} categories={categories} />}>
              <div className="w-full h-full min-h-[650px] flex-grow relative">
                <PDFViewer width="100%" height="100%" className="border-none w-full h-full min-h-[650px] absolute inset-0">
                  <MenuDocument items={items} categories={categories} t={t} />
                </PDFViewer>
              </div>
            </PDFErrorBoundary>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuPDFView;
