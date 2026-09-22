import React, { createContext, useContext, useState } from 'react';

interface ScanContextType {
  scanVisible: boolean;
  openScan: () => void;
  closeScan: () => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [scanVisible, setScanVisible] = useState(false);

  return (
    <ScanContext.Provider
      value={{
        scanVisible,
        openScan: () => setScanVisible(true),
        closeScan: () => setScanVisible(false),
      }}
    >
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error('useScan must be used within ScanProvider');
  return ctx;
}
