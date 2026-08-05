import React from "react";
import { X, Printer, Receipt, CheckCircle, Clock, Smartphone, CreditCard, Wallet, MapPin, Phone, User, Calendar } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useTranslation } from "react-i18next";

export interface InvoiceItem {
    menuItemId?: string;
    title?: string;
    name?: string;
    price: number;
    quantity?: number;
    qty?: number;
    addOns?: { name: string; price: number }[];
}

export interface InvoiceData {
    _id?: string;
    orderId?: string;
    id?: string;
    customerInfo?: {
        name?: string;
        phone?: string;
        address?: string;
        notes?: string;
    };
    customer?: string;
    phone?: string;
    address?: string;
    items?: InvoiceItem[] | string;
    subtotal?: number;
    tax?: number;
    discount?: number;
    total?: number;
    amount?: number;
    paymentMethod?: string;
    payment?: string;
    amountReceived?: number;
    changeAmount?: number;
    status?: string;
    createdAt?: string;
    date?: string;
    time?: string;
    dateTime?: string;
    orderType?: string;
    type?: string;
    tableNumber?: string;
}

interface InvoiceModalProps {
    order: InvoiceData | null;
    onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
    const { t } = useTranslation();
    const { settings } = useSettings();

    if (!order) return null;

    // Normalizing properties
    const orderId = order.orderId || order._id || order.id || "#ORD-0000";
    const formattedId = orderId.startsWith("#") ? orderId : `#ORD-${orderId.slice(-6).toUpperCase()}`;
    const customerName = order.customerInfo?.name || order.customer || "Guest Customer";
    const customerPhone = order.customerInfo?.phone || order.phone || "N/A";
    const customerAddress = order.customerInfo?.address || order.address || "";
    const orderDate = order.dateTime || order.createdAt || order.date || new Date().toLocaleString();
    const orderType = order.orderType || order.type || "Dine-in";
    const paymentMethod = order.paymentMethod || order.payment || "Cash";
    const status = order.status || "Completed";

    // Parse items array
    let itemList: InvoiceItem[] = [];
    if (Array.isArray(order.items)) {
        itemList = order.items;
    } else if (typeof order.items === "string") {
        // If string representation e.g. "2x Grilled Chicken, 1x Cold Coffee"
        const parts = order.items.split(",");
        itemList = parts.map((part, idx) => {
            const trimmed = part.trim();
            const match = trimmed.match(/^(\d+)x\s+(.+)$/);
            if (match) {
                return {
                    name: match[2],
                    title: match[2],
                    quantity: parseInt(match[1], 10),
                    price: 0
                };
            }
            return {
                name: trimmed,
                title: trimmed,
                quantity: 1,
                price: 0
            };
        });
    }

    const grandTotal = order.total ?? order.amount ?? itemList.reduce((sum, i) => sum + (i.price * (i.quantity || i.qty || 1)), 0);
    const subtotal = order.subtotal ?? (grandTotal > 0 ? grandTotal * 0.87 : 0);
    const tax = order.tax ?? (grandTotal - subtotal);
    const discount = order.discount ?? 0;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:static print:bg-white print:p-0 print:block overflow-y-auto">
            <div className="bg-white rounded-[20px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:shadow-none print:max-w-none print:rounded-none print:max-h-none print:overflow-visible border border-neutral-100 print:border-none my-auto">
                
                {/* Modal Action Header (Hidden in Print) */}
                <div className="flex items-center justify-between p-4 px-6 bg-neutral-900 text-white print:hidden border-b border-neutral-800">
                    <div className="flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-emerald-400" />
                        <div>
                            <h3 className="font-bold text-sm leading-tight">{t("invoice.title", "Order Invoice")}</h3>
                            <p className="text-[11px] text-neutral-400 font-mono">{formattedId}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-[8px] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{t("invoice.print", "Print Invoice")}</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Invoice Body Printable */}
                <div className="p-6 md:p-8 overflow-y-auto print:overflow-visible print:p-4 text-neutral-800 text-xs font-sans bg-white leading-relaxed">
                    
                    {/* Restaurant Branding Header */}
                    <div className="text-center pb-5 border-b border-dashed border-neutral-300">
                        <h2 className="text-xl font-black tracking-tight text-neutral-900 uppercase font-serif">
                            {settings?.restaurantName || "CRAVING RESTAURANT"}
                        </h2>
                        <p className="text-[11px] text-neutral-500 mt-1 font-medium">
                            {settings?.address || "123 Food Street, Gulshan 2, Dhaka, Bangladesh"}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                            Phone: {settings?.phone || "+880 1711 223344"} | VAT BIN: 004892154-0102
                        </p>
                    </div>

                    {/* Invoice Meta Grid */}
                    <div className="py-4 border-b border-dashed border-neutral-300 space-y-2 text-[11px]">
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-500 font-semibold uppercase tracking-wider">{t("invoice.no", "Invoice No")}:</span>
                            <span className="font-bold font-mono text-neutral-900 text-xs">{formattedId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-500 font-semibold uppercase tracking-wider">{t("invoice.date", "Date & Time")}:</span>
                            <span className="font-medium text-neutral-800">{orderDate}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-500 font-semibold uppercase tracking-wider">{t("invoice.customer", "Customer")}:</span>
                            <span className="font-bold text-neutral-900">{customerName} {customerPhone !== "N/A" ? `(${customerPhone})` : ""}</span>
                        </div>
                        {customerAddress && (
                            <div className="flex justify-between items-start">
                                <span className="text-neutral-500 font-semibold uppercase tracking-wider">{t("invoice.address", "Address")}:</span>
                                <span className="font-medium text-neutral-800 text-right max-w-[200px] truncate">{customerAddress}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-neutral-500 font-semibold uppercase tracking-wider">{t("invoice.type_payment", "Type & Payment")}:</span>
                            <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded bg-neutral-100 font-bold uppercase text-[9px] text-neutral-700">
                                    {orderType}
                                </span>
                                {order.tableNumber && (
                                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold uppercase text-[9px]">
                                        Table #{order.tableNumber}
                                    </span>
                                )}
                                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold uppercase text-[9px]">
                                    {paymentMethod}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="py-4">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-300 text-[10px] text-neutral-500 uppercase tracking-wider">
                                    <th className="pb-2 font-bold">{t("invoice.item", "Item Description")}</th>
                                    <th className="pb-2 font-bold text-center">{t("invoice.qty", "Qty")}</th>
                                    <th className="pb-2 font-bold text-right">{t("invoice.price", "Price")}</th>
                                    <th className="pb-2 font-bold text-right">{t("invoice.amount", "Total")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 text-[11px]">
                                {itemList.map((item, idx) => {
                                    const qty = item.quantity || item.qty || 1;
                                    const unitPrice = item.price || (grandTotal > 0 && itemList.length === 1 ? grandTotal : 0);
                                    const itemTotal = unitPrice * qty;

                                    return (
                                        <tr key={idx} className="align-top">
                                            <td className="py-2 pr-2 font-semibold text-neutral-900">
                                                <div>{item.title || item.name}</div>
                                                {item.addOns && item.addOns.length > 0 && (
                                                    <div className="text-[10px] text-neutral-400 font-normal">
                                                        + {item.addOns.map(a => a.name).join(", ")}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-2 text-center font-bold text-neutral-700">{qty}</td>
                                            <td className="py-2 text-right font-medium text-neutral-600">
                                                {unitPrice > 0 ? `৳${unitPrice.toLocaleString()}` : "-"}
                                            </td>
                                            <td className="py-2 text-right font-bold text-neutral-900">
                                                {itemTotal > 0 ? `৳${itemTotal.toLocaleString()}` : "-"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Summary */}
                    <div className="pt-3 border-t border-dashed border-neutral-300 space-y-1.5 text-[11px]">
                        {subtotal > 0 && (
                            <div className="flex justify-between text-neutral-600">
                                <span>{t("invoice.subtotal", "Subtotal")}:</span>
                                <span>৳{subtotal.toFixed(2)}</span>
                            </div>
                        )}
                        {discount > 0 && (
                            <div className="flex justify-between text-emerald-600 font-medium">
                                <span>{t("invoice.discount", "Discount")}:</span>
                                <span>-৳{discount.toFixed(2)}</span>
                            </div>
                        )}
                        {tax > 0 && (
                            <div className="flex justify-between text-neutral-600">
                                <span>{t("invoice.vat", "VAT / Tax")}:</span>
                                <span>+৳{tax.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-2 text-sm font-black text-neutral-900 border-t border-neutral-200">
                            <span>{t("invoice.grand_total", "Grand Total")}:</span>
                            <span className="text-emerald-600 font-mono text-base">৳{grandTotal.toLocaleString()}</span>
                        </div>
                        {order.amountReceived && order.amountReceived > 0 && (
                            <div className="flex justify-between text-[10px] text-neutral-500 pt-1">
                                <span>{t("invoice.paid_amount", "Paid Amount")}: ৳{order.amountReceived}</span>
                                {order.changeAmount !== undefined && (
                                    <span>{t("invoice.change", "Change Return")}: ৳{order.changeAmount}</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Payment Status Stamp & Footer */}
                    <div className="mt-6 pt-4 border-t border-neutral-200 text-center space-y-2">
                        <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold uppercase tracking-widest text-[10px]">
                            ✓ {status === "Paid" || status === "Completed" ? t("invoice.paid_status", "PAID & VERIFIED") : status}
                        </div>
                        <p className="text-[10px] text-neutral-400 font-medium pt-1">
                            Thank you for dining with us! Please come again.
                        </p>
                        {/* Barcode graphic effect */}
                        <div className="pt-2 flex flex-col items-center opacity-70">
                            <div className="h-6 w-48 bg-[repeating-linear-gradient(90deg,#000_0,#000_2px,transparent_2px,transparent_4px,#000_4px,#000_7px,transparent_7px,transparent_9px)]" />
                            <span className="text-[9px] font-mono text-neutral-400 mt-1">{formattedId}</span>
                        </div>
                    </div>
                </div>

                {/* Printable CSS Helper (applied globally when active) */}
                <style>{`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .print\\:block, .print\\:block * {
                            visibility: visible;
                        }
                        .print\\:static {
                            position: static !important;
                        }
                        @page {
                            margin: 10mm;
                            size: auto;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default InvoiceModal;
