// contexts/NotificationContext.tsx

import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  ReactNode,
} from "react";
import { InfoSheet } from "@/components/sheets/InfoSheet";

type InfoSheetState = {
  title: string;
  description: string;
  status: "success" | "error";
} | null;

interface NotificationContextType {
  showNotification: (info: NonNullable<InfoSheetState>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [info, setInfo] = useState<InfoSheetState>(null);

  const showNotification = useCallback(
    (infoData: NonNullable<InfoSheetState>) => {
      setInfo(infoData);
    },
    []
  );

  const value = { showNotification };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <InfoSheet
        visible={!!info}
        title={info?.title ?? ""}
        description={info?.description ?? ""}
        status={info?.status ?? "success"}
        onClose={() => setInfo(null)}
      />
    </NotificationContext.Provider>
  );
};
