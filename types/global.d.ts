// global.d.ts
interface CashfreeCheckout {
    init(options: {
      layout: "iframe" | "popup";
      mode: "TEST" | "PROD";
      session: string;
      onSuccess: (response: any) => void;
      onFailure: (response: any) => void;
      style?: {
        backgroundColor?: string;
        color?: string;
        fontSize?: string;
        fontFamily?: string;
      };
    }): void;
  }
  
  interface Window {
    Cashfree: {
      checkout: CashfreeCheckout;
    };
  }
  