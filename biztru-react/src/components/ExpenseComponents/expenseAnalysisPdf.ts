
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ExpenseRow = {
  id: string;
  amount: number;
  title?: string | null;
  description?: string | null;
  categoryName?: string | null;
  vendorName?: string | null;
  vendorRef?: string | null;
  paymentMethod?: string | null;
  userId?: string | null;
  userName?: string | null;
  status?: string | null;
  incurredAt?: string | number | null;
  createdAt?: string | number | null;
};

type CategorySummary = {
  name: string;
  amount: number;
  percentage: number;
};

type StaffSummary = {
  name: string;
  amount: number;
  count: number;
};

type ExportData = {
  branchName: string;
  currency: string;
  period: string;
  generatedAt: Date;
  expenses: ExpenseRow[];
  metrics: {
    total: number;
    count: number;
    average: number;
    reimbursed: number;
  };
  categories: CategorySummary[];
  staffSpending: StaffSummary[];
  paymentMethods: [string, number][];
  insights: {
    largeExpenses: number;
    missingDescription: number;
    missingVendor: number;
    repeatedGroups: number;
  };
};

function getExpenseDate(expense: ExpenseRow): Date | null {
  const value = expense.incurredAt ?? expense.createdAt;
  if (!value) return null;

  const date =
    typeof value === "number"
      ? new Date(value < 1e12 ? value * 1000 : value)
      : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  } catch {
    return `${currency} ${(amount || 0).toLocaleString()}`;
  }
}

function formatDate(date: Date | null) {
  return date ? date.toLocaleDateString("en-GB") : "—";
}

function categoryName(expense: ExpenseRow) {
  return expense.categoryName?.trim() || "Uncategorised";
}

function recorderName(expense: ExpenseRow) {
  return expense.userName || expense.userId || "Unknown recorder";
}

function periodLabel(period: string) {
  const labels: Record<string, string> = {
    today: "Today",
    week: "This week",
    month: "This month",
    year: "This year",
    all: "All time",
  };

  return labels[period] || period;
}

export async function downloadExpensesAnalysisPdf(
  data: ExportData
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  const money = (value: number) =>
    formatMoney(value, data.currency);

  let y = 18;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text("Expenses Analysis", margin, y);

  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Branch: ${data.branchName}`, margin, y);

  y += 5;
  doc.text(`Period: ${periodLabel(data.period)}`, margin, y);

  y += 5;
  doc.text(
    `Generated: ${data.generatedAt.toLocaleString("en-GB")}`,
    margin,
    y
  );

  y += 8;

  doc.setDrawColor(210, 210, 210);
  doc.line(margin, y, pageWidth - margin, y);
  y += 9;

  // Financial summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Financial Summary", margin, y);

  y += 4;

  autoTable(doc, {
    startY: y,
    theme: "grid",
    margin: { left: margin, right: margin },
    head: [["Metric", "Value"]],
    body: [
      ["Total expenses", money(data.metrics.total)],
      ["Number of transactions", String(data.metrics.count)],
      ["Average expense", money(data.metrics.average)],
      ["Reimbursed expenses", money(data.metrics.reimbursed)],
    ],
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [35, 75, 120],
      textColor: 255,
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Category breakdown
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Spending by Category", margin, y);

  y += 4;

  autoTable(doc, {
    startY: y,
    theme: "striped",
    margin: { left: margin, right: margin },
    head: [["Category", "Amount", "Share"]],
    body: data.categories.map((item) => [
      item.name,
      money(item.amount),
      `${item.percentage.toFixed(1)}%`,
    ]),
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2.5,
    },
    headStyles: {
      fillColor: [35, 75, 120],
      textColor: 255,
    },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Staff spending
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Expenses Recorded by Staff", margin, y);

  y += 4;

  autoTable(doc, {
    startY: y,
    theme: "striped",
    margin: { left: margin, right: margin },
    head: [["Staff member / User ID", "Transactions", "Total recorded"]],
    body: data.staffSpending.map((staff) => [
      staff.name,
      String(staff.count),
      money(staff.amount),
    ]),
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2.5,
    },
    headStyles: {
      fillColor: [35, 75, 120],
      textColor: 255,
    },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Payment methods
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Payment Methods", margin, y);

  y += 4;

  autoTable(doc, {
    startY: y,
    theme: "grid",
    margin: { left: margin, right: margin },
    head: [["Payment method", "Total amount"]],
    body: data.paymentMethods.map(([method, amount]) => [
      method,
      money(amount),
    ]),
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2.5,
    },
    headStyles: {
      fillColor: [35, 75, 120],
      textColor: 255,
    },
    columnStyles: {
      1: { halign: "right" },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Review indicators
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Review Indicators", margin, y);

  y += 4;

  autoTable(doc, {
    startY: y,
    theme: "grid",
    margin: { left: margin, right: margin },
    head: [["Indicator", "Count"]],
    body: [
      ["Large expenses", String(data.insights.largeExpenses)],
      ["Expenses without descriptions", String(data.insights.missingDescription)],
      ["Expenses without vendor information", String(data.insights.missingVendor)],
      ["Repeated expense groups", String(data.insights.repeatedGroups)],
    ],
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2.5,
    },
    headStyles: {
      fillColor: [35, 75, 120],
      textColor: 255,
    },
  });

  // Detailed expense register
  doc.addPage();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Detailed Expense Register", margin, 18);

  autoTable(doc, {
    startY: 24,
    theme: "striped",
    margin: {
      left: margin,
      right: margin,
      bottom: 18,
    },
    head: [[
      "Date",
      "Description",
      "Category",
      "Vendor",
      "Recorded by",
      "Amount",
    ]],
    body: data.expenses.map((expense) => [
      formatDate(getExpenseDate(expense)),
      expense.title || expense.description || "No description",
      categoryName(expense),
      expense.vendorName || expense.vendorRef || "—",
      recorderName(expense),
      money(Number(expense.amount || 0)),
    ]),
    styles: {
      font: "helvetica",
      fontSize: 7,
      cellPadding: 2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [35, 75, 120],
      textColor: 255,
      fontSize: 7,
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 43 },
      2: { cellWidth: 28 },
      3: { cellWidth: 28 },
      4: { cellWidth: 27 },
      5: { cellWidth: 30, halign: "right" },
    },
  });

  // Footer on every page
  const totalPages = doc.getNumberOfPages();

  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);

    doc.text(
      `${data.branchName} · Expenses Analysis`,
      margin,
      pageHeight - 8
    );

    doc.text(
      `Page ${page} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: "right" }
    );
  }

  const safeBranchName = data.branchName
    .trim()
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/^-+|-+$/g, "");

  const filename = `Expenses-Analysis-${safeBranchName || "Branch"}-${data.generatedAt
    .toISOString()
    .slice(0, 10)}.pdf`;

  doc.save(filename);
}
