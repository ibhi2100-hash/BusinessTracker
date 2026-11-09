export interface PrinterAdapter {
  print(): Promise<void>;
}

export class BrowserPrintAdapter
  implements PrinterAdapter {

  async print(): Promise<void> {
    if (typeof window === "undefined") {
      throw new Error(
        "Browser printing is unavailable.",
      );
    }

    window.print();
  }
}