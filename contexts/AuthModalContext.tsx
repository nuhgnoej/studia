// contexts/AuthModalContext.tsx

import React, {
  createContext,
  useContext,
  useRef,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import LoginContent from "@/components/auth/LoginContent";
import SignupContent from "@/components/auth/SignupContent";
import { useNotification } from "./NotificationContext";

type ModalType = "login" | "signup";

interface AuthModalContextType {
  openAuthModal: (type: ModalType) => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(
  undefined
);

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
};

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const loginSheetRef = useRef<BottomSheetModal>(null);
  const signupSheetRef = useRef<BottomSheetModal>(null);
  const { showNotification } = useNotification();

  const snapPoints = useMemo(() => ["90%"], []);

  const openAuthModal = useCallback((type: ModalType) => {
    if (type === "login") {
      loginSheetRef.current?.present();
    } else {
      signupSheetRef.current?.present();
    }
  }, []);

  const closeAuthModal = useCallback(() => {
    loginSheetRef.current?.dismiss();
    signupSheetRef.current?.dismiss();
  }, []);

  const handleSignupSuccess = useCallback(() => {
    closeAuthModal(); // 우선 모달을 닫고
    // 그 다음에 성공 알림을 띄웁니다.
    showNotification({
      title: "회원가입 완료",
      description: "스터디아에 오신 것을 환영합니다!",
      status: "success",
    });
  }, [closeAuthModal, showNotification]);

  // 로그인 모달에서 회원가입 모달로 전환하는 함수
  const switchToconUp = useCallback(() => {
    loginSheetRef.current?.dismiss();
    setTimeout(() => {
      signupSheetRef.current?.present();
    }, 250);
  }, []);

  const switchToLogin = useCallback(() => {
    signupSheetRef.current?.dismiss();
    setTimeout(() => {
      loginSheetRef.current?.present();
    }, 250);
  }, []);

  const value = { openAuthModal, closeAuthModal };

  return (
    <BottomSheetModalProvider>
      <AuthModalContext.Provider value={value}>
        {children}
      </AuthModalContext.Provider>

      {/* 앱 전역에 존재할 Bottom Sheet들을 여기에 정의 */}
      <BottomSheetModal ref={loginSheetRef} index={0} snapPoints={snapPoints}>
        <LoginContent
          onLoginSuccess={closeAuthModal}
          onNavigateToSignup={switchToconUp}
        />
      </BottomSheetModal>
      <BottomSheetModal ref={signupSheetRef} index={0} snapPoints={snapPoints}>
        <SignupContent
          onSignupSuccess={handleSignupSuccess}
          onNavigateToLogin={switchToLogin}
        />
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};
