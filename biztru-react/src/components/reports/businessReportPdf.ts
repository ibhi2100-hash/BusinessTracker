
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import type {
  DashboardSummary,
  ReportSummary,
  MonthlyRow,
  YearlyRow,
  ComparisonResult,
} from "@business/shared-types";

export interface BusinessReportData {
  branchId: string;
  period: string;
  generatedAt: Date;
  dashboard: DashboardSummary;
  summary: ReportSummary;
  monthly: MonthlyRow[];
  yearly: YearlyRow[];
  comparison: ComparisonResult;
}

const CURRENCY = "NGN";

const money = (value: number) =>
  `${CURRENCY} ${Number(value || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const number = (value: number) =>
  Number(value || 0).toLocaleString("en-NG");

const percent = (value: number) =>
  `${value.toFixed(2)}%`;

const margin = (profit: number, revenue: number) =>
  revenue > 0 ? (profit / revenue) * 100 : 0;

const growth = (current: number, previous: number) => {
  if (previous === 0) {
    return current > 0 ? "New activity" : "0.00%";
  }

  return `${(((current - previous) / Math.abs(previous)) * 100).toFixed(2)}%`;
};

function addHeading(
  doc: jsPDF,
  title: string,
  subtitle?: string
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(15, 45, 48);
  doc.text(title, 14, 20);

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text(subtitle, 14, 27);
  }

  doc.setDrawColor(210, 220, 220);
  doc.line(14, 32, 196, 32);
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    const height = doc.internal.pageSize.height;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);

    doc.text(
      "BizTru | Business Performance Report",
      14,
      height - 10
    );

    doc.text(
      `Page ${i} of ${pageCount}`,
      196,
      height - 10,
      { align: "right" }
    );
  }
}

function table(
  doc: jsPDF,
  headers: string[],
  rows: (string | number)[][],
  startY = 38
) {
  autoTable(doc, {
    startY,
    head: [headers],
    body: rows,
    theme: "grid",
    margin: { left: 14, right: 14 },
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3,
      textColor: [50, 60, 60],
      lineColor: [225, 230, 230],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [15, 65, 65],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 249, 248],
    },
  });
}

function addParagraph(
  doc: jsPDF,
  text: string,
  startY: number
) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(65, 75, 75);

  const lines = doc.splitTextToSize(text, 180);

  doc.text(lines, 14, startY);

  return startY + lines.length * 5 + 5;
}

function addSection(
  doc: jsPDF,
  title: string,
  text: string,
  startY: number
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 65, 65);

  doc.text(title, 14, startY);

  return addParagraph(doc, text, startY + 7);
}

function getAnalysis(data: BusinessReportData) {
  const { summary, dashboard, comparison, monthly } = data;

  const revenue = summary.revenue;
  const grossProfit = summary.grossProfit;
  const netProfit = summary.netProfit;
  const expenses = summary.expenses;
  const cogs = summary.cogs;

  const grossMargin = margin(grossProfit, revenue);
  const netMargin = margin(netProfit, revenue);
  const expenseRatio = margin(expenses, revenue);
  const cogsRatio = margin(cogs, revenue);

  const previousRevenue = comparison.previous?.revenue ?? 0;
  const revenueGrowth = growth(
    comparison.current.revenue,
    previousRevenue
  );

  const cashAndBank = dashboard.cash + dashboard.bank;
  const liquidityCoverage =
    dashboard.liabilities > 0
      ? (cashAndBank / dashboard.liabilities) * 100
      : null;

  const observations: string[] = [];
  const recommendations: string[] = [];

  if (revenue <= 0) {
    observations.push(
      "No positive revenue was recorded in the selected reporting period."
    );

    recommendations.push(
      "Review sales activity, transaction posting and revenue recognition."
    );
  } else {
    observations.push(
      `Gross profit margin is ${percent(grossMargin)}.`
    );

    observations.push(
      `Net profit margin is ${percent(netMargin)}.`
    );

    if (netProfit < 0) {
      observations.push(
        "The business recorded a net loss during this reporting period."
      );

      recommendations.push(
        "Investigate operating expenses, selling prices and cost of goods sold."
      );
    } else if (netProfit > 0) {
      observations.push(
        "The business generated positive net profit during this period."
      );
    }

    if (grossMargin < 20) {
      recommendations.push(
        "Review product margins, supplier costs and selling prices."
      );
    }

    if (expenseRatio > 30) {
      observations.push(
        "Operating expenses consume a relatively high proportion of revenue."
      );

      recommendations.push(
        "Review recurring operating costs and identify unnecessary expenditure."
      );
    }

    if (netMargin > 15) {
      observations.push(
        "Net profitability is relatively strong compared with revenue."
      );
    }
  }

  if (
    comparison.previous &&
    comparison.previous.revenue > 0
  ) {
    observations.push(
      `Revenue changed by ${revenueGrowth} compared with the previous month.`
    );

    if (comparison.current.revenue < previousRevenue) {
      recommendations.push(
        "Investigate the causes of declining monthly revenue and review sales performance."
      );
    }
  }

  if (liquidityCoverage !== null) {
    observations.push(
      `Cash and bank balances cover ${percent(liquidityCoverage)} of recorded liabilities.`
    );

    if (liquidityCoverage < 100) {
      recommendations.push(
        "Review upcoming obligations and strengthen cash-flow planning."
      );
    }
  } else {
    observations.push(
      "No liabilities were recorded in the dashboard balances."
    );
  }

  if (dashboard.inventoryValue <= 0) {
    recommendations.push(
      "Verify inventory records and stock valuation."
    );
  }

  if (monthly.length >= 2) {
    const first = monthly[0];
    const last = monthly[monthly.length - 1];

    if (last.revenue < first.revenue) {
      observations.push(
        "Revenue in the latest monthly record is below the earliest record in the displayed trend."
      );
    }
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Continue monitoring margins, operating expenses, inventory and cash flow."
    );
  }

  return {
    grossMargin,
    netMargin,
    expenseRatio,
    cogsRatio,
    revenueGrowth,
    liquidityCoverage,
    observations,
    recommendations,
  };
}

export function createBusinessReport(
  data: BusinessReportData
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const {
    dashboard,
    summary,
    monthly,
    yearly,
    comparison,
  } = data;

  const analysis = getAnalysis(data);

  // PAGE 1: EXECUTIVE SUMMARY

  addHeading(
    doc,
    "BUSINESS PERFORMANCE REPORT",
    `Reporting period: ${data.period}`
  );

  let y = 42;

  y = addParagraph(
    doc,
    "This document provides a consolidated overview of business financial performance, financial position indicators, historical performance and management observations.",
    y
  );

  table(
    doc,
    ["Business Indicator", "Value"],
    [
      ["Branch identifier", data.branchId],
      ["Reporting period", data.period],
      ["Generated on", data.generatedAt.toLocaleString("en-NG")],
      ["Cash balance", money(dashboard.cash)],
      ["Bank balance", money(dashboard.bank)],
      ["Inventory valuation", money(dashboard.inventoryValue)],
      ["Recorded liabilities", money(dashboard.liabilities)],
    ],
    y
  );

  y = (doc as any).lastAutoTable.finalY + 10;

  table(
    doc,
    ["Performance Indicator", "Amount"],
    [
      ["Revenue", money(summary.revenue)],
      ["Cost of Goods Sold", money(summary.cogs)],
      ["Gross profit", money(summary.grossProfit)],
      ["Operating expenses", money(summary.expenses)],
      ["Net profit", money(summary.netProfit)],
    ],
    y
  );

  // PAGE 2: FINANCIAL PERFORMANCE

  doc.addPage();

  addHeading(doc, "FINANCIAL PERFORMANCE");

  table(
    doc,
    ["Metric", "Value", "Ratio"],
    [
      [
        "Revenue",
        money(summary.revenue),
        "100.00%",
      ],
      [
        "Cost of Goods Sold",
        money(summary.cogs),
        percent(analysis.cogsRatio),
      ],
      [
        "Gross profit",
        money(summary.grossProfit),
        percent(analysis.grossMargin),
      ],
      [
        "Operating expenses",
        money(summary.expenses),
        percent(analysis.expenseRatio),
      ],
      [
        "Net profit",
        money(summary.netProfit),
        percent(analysis.netMargin),
      ],
    ]
  );

  y = (doc as any).lastAutoTable.finalY + 12;

  y = addSection(
    doc,
    "Gross Profit Analysis",
    `Gross profit represents revenue remaining after deducting cost of goods sold. The recorded gross profit is ${money(summary.grossProfit)}, representing ${percent(analysis.grossMargin)} of revenue.`,
    y
  );

  y = addSection(
    doc,
    "Operating Expense Analysis",
    `Recorded operating expenses amount to ${money(summary.expenses)}. This represents ${percent(analysis.expenseRatio)} of revenue.`,
    y
  );

  addSection(
    doc,
    "Net Profit Analysis",
    `Net profit after the recorded expenses is ${money(summary.netProfit)}. The net profit margin is ${percent(analysis.netMargin)}.`,
    y
  );

  // PAGE 3: FINANCIAL POSITION

  doc.addPage();

  addHeading(
    doc,
    "FINANCIAL POSITION INDICATORS"
  );

  table(
    doc,
    ["Indicator", "Amount"],
    [
      ["Cash", money(dashboard.cash)],
      ["Bank", money(dashboard.bank)],
      [
        "Combined cash and bank",
        money(dashboard.cash + dashboard.bank),
      ],
      ["Inventory valuation", money(dashboard.inventoryValue)],
      ["Liabilities", money(dashboard.liabilities)],
    ]
  );

  y = (doc as any).lastAutoTable.finalY + 12;

  y = addSection(
    doc,
    "Liquidity Observation",
    analysis.liquidityCoverage === null
      ? "No liabilities were recorded. A liabilities coverage ratio cannot be calculated."
      : `Cash and bank balances represent ${percent(analysis.liquidityCoverage)} of recorded liabilities. This is a basic coverage indicator, not a formal current ratio.`,
    y
  );

  addSection(
    doc,
    "Inventory Observation",
    `The dashboard reports inventory valued at ${money(dashboard.inventoryValue)}. Management should monitor stock valuation, inventory movement and potential obsolete stock.`,
    y
  );

  // PAGE 4: MONTHLY COMPARISON

  doc.addPage();

  addHeading(
    doc,
    "MONTH-OVER-MONTH COMPARISON"
  );

  const comparisonRows = [
    {
      label: "Revenue",
      current: comparison.current.revenue,
      previous: comparison.previous?.revenue ?? 0,
    },
    {
      label: "COGS",
      current: comparison.current.cogs,
      previous: comparison.previous?.cogs ?? 0,
    },
    {
      label: "Expenses",
      current: comparison.current.expenses,
      previous: comparison.previous?.expenses ?? 0,
    },
    {
      label: "Gross profit",
      current: comparison.current.grossProfit,
      previous: comparison.previous?.grossProfit ?? 0,
    },
    {
      label: "Net profit",
      current: comparison.current.netProfit,
      previous: comparison.previous?.netProfit ?? 0,
    },
  ];

  table(
    doc,
    ["Metric", "Current month", "Previous month", "Change"],
    comparisonRows.map((r) => [
      r.label,
      money(r.current),
      money(r.previous),
      comparison.previous
        ? growth(r.current, r.previous)
        : "No previous period",
    ])
  );

  y = (doc as any).lastAutoTable.finalY + 12;

  addSection(
    doc,
    "Comparison Interpretation",
    comparison.previous
      ? "This section compares the current monthly reporting figures with the previous month. Percentage changes should be interpreted alongside the underlying monetary amounts, especially when the previous period is zero or negative."
      : "Previous-month data is unavailable. A comparative growth assessment cannot be completed.",
    y
  );

  // PAGE 5: MONTHLY HISTORY

  doc.addPage();

  addHeading(
    doc,
    "LAST 12 MONTHS PERFORMANCE"
  );

  table(
    doc,
    ["Month", "Revenue", "Net profit"],
    monthly.map((m) => [
      m.month,
      money(m.revenue),
      money(m.netProfit),
    ])
  );

  y = (doc as any).lastAutoTable.finalY + 10;

  addParagraph(
    doc,
    "The historical table presents the monthly revenue and net profit figures returned by the reporting service. Use the trend to identify changes in business performance and investigate unusual movements.",
    y
  );

  // PAGE 6: YEARLY PERFORMANCE

  doc.addPage();

  addHeading(
    doc,
    "YEARLY BUSINESS PERFORMANCE"
  );

  table(
    doc,
    [
      "Year",
      "Revenue",
      "COGS",
      "Expenses",
      "Gross profit",
      "Net profit",
    ],
    yearly.map((r) => [
      String(r.year),
      money(r.revenue),
      money(r.cogs),
      money(r.expenses),
      money(r.grossProfit),
      money(r.netProfit),
    ])
  );

  // PAGE 7: BUSINESS ANALYSIS

  doc.addPage();

  addHeading(
    doc,
    "BUSINESS ANALYSIS & MANAGEMENT INSIGHTS"
  );

  y = 42;

  y = addSection(
    doc,
    "Profitability",
    `Gross profit margin: ${percent(analysis.grossMargin)}. Net profit margin: ${percent(analysis.netMargin)}. These ratios indicate the proportion of revenue retained after the respective recorded costs.`,
    y
  );

  y = addSection(
    doc,
    "Cost Structure",
    `Cost of goods sold accounts for ${percent(analysis.cogsRatio)} of revenue. Operating expenses account for ${percent(analysis.expenseRatio)}.`,
    y
  );

  y = addSection(
    doc,
    "Revenue Movement",
    `The month-over-month revenue change is ${analysis.revenueGrowth}.`,
    y
  );

  y = addSection(
    doc,
    "Management Observations",
    "",
    y
  );

  analysis.observations.forEach((item) => {
    y = addParagraph(doc, `- ${item}`, y);
  });

  y = addSection(
    doc,
    "Recommended Management Actions",
    "",
    y + 3
  );

  analysis.recommendations.forEach((item) => {
    y = addParagraph(doc, `- ${item}`, y);
  });

  // PAGE 8: MANAGEMENT CONCLUSION

  doc.addPage();

  addHeading(
    doc,
    "MANAGEMENT CONCLUSION"
  );

  y = 42;

  y = addParagraph(
    doc,
    `For the selected reporting period, the business recorded revenue of ${money(summary.revenue)}, gross profit of ${money(summary.grossProfit)} and net profit of ${money(summary.netProfit)}.`,
    y
  );

  y = addParagraph(
    doc,
    `The business currently reports cash of ${money(dashboard.cash)}, bank balances of ${money(dashboard.bank)}, inventory valuation of ${money(dashboard.inventoryValue)} and liabilities of ${money(dashboard.liabilities)}.`,
    y
  );

  y = addSection(
    doc,
    "Priority Management Actions",
    analysis.recommendations.join(" "),
    y + 5
  );

  addParagraph(
    doc,
    "This report is based on information returned by the BizTru reporting services at the time of generation. Its analysis is indicative and should be reviewed alongside the underlying accounting records.",
    y + 5
  );

  addFooter(doc);

  return doc;
}

export function downloadBusinessReport(
  data: BusinessReportData
) {
  const doc = createBusinessReport(data);

  const date = data.generatedAt
    .toISOString()
    .slice(0, 10);

  doc.save(`BizTru-Business-Report-${date}.pdf`);
}

export function printBusinessReport(
  data: BusinessReportData
) {
  const doc = createBusinessReport(data);

  doc.autoPrint();

  const blob = doc.output("blob");

  const url = URL.createObjectURL(blob);

  const printWindow = window.open(url, "_blank");

  if (!printWindow) {
    URL.revokeObjectURL(url);
    throw new Error(
      "The print window was blocked. Allow pop-ups and try again."
    );
  }

  printWindow.addEventListener("afterprint", () => {
    URL.revokeObjectURL(url);
  }, { once: true });
}
