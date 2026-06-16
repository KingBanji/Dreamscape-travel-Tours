import React, { createContext, useContext, useState, useEffect } from "react";
import { KWACHA_RATE } from "./currency";

export type CurrencyType = "ZMW" | "USD";

interface CurrencyContextType {
  currency: CurrencyType;
  exchangeRate: number;
  setCurrency: (currency: CurrencyType) => void;
  convertAmount: (zmwAmount: number) => number;
  formatAmount: (zmwAmount: number) => string;
  currencySymbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyType>(() => {
    try {
      const saved = localStorage.getItem("dreamscape_currency");
      return (saved as CurrencyType) || "ZMW";
    } catch {
      return "ZMW";
    }
  });

  const [exchangeRate, setExchangeRate] = useState<number>(() => {
    try {
      const savedRate = localStorage.getItem("dreamscape_exchange_rate");
      return savedRate ? parseFloat(savedRate) : KWACHA_RATE;
    } catch {
      return KWACHA_RATE;
    }
  });

  const setCurrency = (newCurrency: CurrencyType) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem("dreamscape_currency", newCurrency);
    } catch (e) {
      console.warn("localStorage not writeable", e);
    }
  };

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch("https://open.er-api.com/v6/latest/USD");
        if (response.ok) {
          const data = await response.json();
          if (data && data.rates && typeof data.rates.ZMW === "number") {
            const rawRate = data.rates.ZMW;
            setExchangeRate(rawRate);
            try {
              localStorage.setItem("dreamscape_exchange_rate", rawRate.toString());
            } catch (e) {
              console.warn("localStorage not writeable", e);
            }
            console.log("Real-time ZMW exchange rate loaded:", rawRate);
          }
        }
      } catch (error) {
        console.warn("Failed to fetch real-time exchange rate, falling back to local stored/default:", error);
      }
    };

    fetchRate();
  }, []);

  const convertAmount = (zmwAmount: number): number => {
    if (currency === "ZMW") {
      return zmwAmount;
    }
    // ZMW amount / exchangeRate = USD amount
    return zmwAmount / exchangeRate;
  };

  const formatAmount = (zmwAmount: number): string => {
    const converted = convertAmount(zmwAmount);
    if (currency === "ZMW") {
      return `ZK ${Math.round(converted).toLocaleString()}`;
    } else {
      return `$${Math.round(converted).toLocaleString()}`;
    }
  };

  const currencySymbol = currency === "ZMW" ? "ZK" : "$";

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        exchangeRate,
        setCurrency,
        convertAmount,
        formatAmount,
        currencySymbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
