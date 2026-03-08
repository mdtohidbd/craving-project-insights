// Mock data helper for development
// When backend is not available, this provides sample data to test the UI

export const MOCK_MODE = false; // Set to true to enable mock data

export function mockDelay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockData = {
  owner: {
    _id: "owner1",
    name: "রহিম আহমেদ",
    role: "OWNER" as const,
    shop_id: "shop1",
    photo_url: "",
  },

  employee: {
    _id: "emp1",
    name: "করিম মিয়া",
    role: "EMPLOYEE" as const,
    shop_id: "shop1",
    roleLabel: "বিক্রয় প্রতিনিধি",
    photo_url: "",
  },

  customers: [
    {
      _id: "cust1",
      name: "আব্দুল করিম",
      phone: "০১৭১২৩৪৫৬৭৮",
      address: "ঢাকা, বাংলাদেশ",
      photo_url: "",
      notes: "ভালো কাস্টমার",
    },
    {
      _id: "cust2",
      name: "রহিমা খাতুন",
      phone: "০১৮১২৩৪৫৬৭৮",
      address: "চট্টগ্রাম, বাংলাদেশ",
      photo_url: "",
    },
  ],

  contracts: [
    {
      contract: {
        _id: "contract1",
        customer_id: "cust1",
        product_name: "ব্যাটারি ভ্যান",
        product_price: 90000,
        sale_date: "2025-11-01",
        total_installments: 9,
        paid_installments: 4,
        remaining_installments: 5,
        total_paid_amount: 40000,
        remaining_amount: 50000,
        base_installment_amount: 10000,
        status: "ACTIVE",
      },
      customer: {
        _id: "cust1",
        name: "আব্দুল করিম",
        phone: "০১৭১২৩৪৫৬৭৮",
        address: "ঢাকা, বাংলাদেশ",
        photo_url: "",
      },
      ui_status: "YELLOW" as const,
    },
  ],

  installments: [
    {
      installment: {
        _id: "inst1",
        contract_id: "contract1",
        installment_no: 1,
        due_date: "2025-11-28",
        amount: 10000,
        status: "OVERDUE" as const,
        paid_date: undefined,
        paid_by_name: undefined,
      },
      customer: {
        _id: "cust1",
        name: "আব্দুল করিম",
        phone: "০১৭১২৩৪৫৬৭৮",
        address: "ঢাকা, বাংলাদেশ",
        photo_url: "",
      },
      contract: {
        _id: "contract1",
        product_name: "ব্যাটারি ভ্যান",
        remaining_installments: 5,
        remaining_amount: 50000,
      },
    },
  ],

  summary: {
    total_customers: 25,
    total_sales_amount: 450000,
    total_outstanding_amount: 210000,
  },
};
