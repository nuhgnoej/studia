### Studia 퀴즈 앱

React Native(Expo) 기반의 학습용 퀴즈 애플리케이션입니다. Firebase 인증과 로컬 SQLite 데이터베이스를 통해 사용자와 문제 세트를 관리하고, Expo Router로 화면을 구성합니다.

## 주요 기능

- **Firebase 인증**: 이메일/비밀번호 및 Google OAuth 로그인을 제공하며 `AuthContext`로 전역 상태를 관리합니다.
- **문제 세트 관리**: JSON 파일을 업로드하거나 공식/커뮤니티 아카이브에서 내려받아 로컬 DB에 저장합니다.
- **진행도 저장**: 퀴즈 진행 상황을 자동으로 저장하고 마지막 풀이 위치에서 이어서 풀 수 있습니다.
- **오답 모드**: 최근 정답 기록을 기반으로 틀린 문제만 따로 다시 풀 수 있습니다.
- **태그 & 배경 이미지**: 문제마다 태그를 편집할 수 있으며 태그에 맞는 배경 이미지를 표시합니다.
- **커뮤니티 업로드**: 사용자가 작성한 문제 세트를 Firebase Storage/Firestore에 업로드하여 공유할 수 있습니다.
- **프로필 & 설정**: 프로필 이미지·이름·소개 수정, 테마 모드(라이트/다크/시스템) 선택, 로컬 DB 초기화, 로그인/로그아웃 등을 지원합니다.

## 실행 방법

1. 의존성 설치

   ```bash
   npm install
   ```

2. Google OAuth 환경 변수 설정 (EAS 환경 변수 사용)

   ```bash
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
   EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=...
   ```

3. 앱 실행

   ```bash
   npx expo start
   ```

브라우저에서 Android/iOS 시뮬레이터 또는 Expo Go 앱으로 실행할 수 있습니다.

## 폴더 구조

- `app/` – 화면 라우트와 탭 구성. `archive`(공식/커뮤니티), `subject`(세부/퀴즈), `profile`, `settings` 등을 포함합니다.
- `components/` – 공통 UI 컴포넌트와 퀴즈 관련 구성요소, `archive/` 등 세부 컴포넌트가 위치합니다.
- `lib/` – Firebase 설정, SQLite DB 액세스, 태그 유틸리티 등 핵심 로직.
- `contexts/` – 인증 컨텍스트 등 글로벌 상태 관리.
- `hooks/` – `useAuth` 등 커스텀 훅.
- `assets/` – 문제 세트 JSON과 태그별 배경 이미지 등 정적 자산.
- `scripts/` – 태그 추출, 파일 매핑 등 개발 유틸리티 스크립트.

## 초기화

새 프로젝트 상태로 돌리고 싶다면 다음 명령을 실행합니다.

```bash
npm run reset-project
```

기본 예제 코드를 `app-example/`로 이동하고 빈 `app/` 폴더를 생성합니다.

## 참고

앱은 Expo Router 기반 파일 라우팅을 사용합니다. 예시 문제 세트는 `assets/questions` 폴더에 JSON 형식으로 제공됩니다.
