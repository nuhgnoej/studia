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
  status: "success" | "error" | "info";
  onConfirm?: () => void;
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
        status={info?.status ?? "info"}
        onClose={() => {
          info?.onConfirm?.(); // 콜백이 있으면 실행
          setInfo(null); // 그 후에 시트 닫기
        }}
      />
    </NotificationContext.Provider>
  );
};
