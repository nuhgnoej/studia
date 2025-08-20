import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase"; // Firebase 설정 파일 경로

// Image source prop은 { uri: string } 또는 require()의 결과(숫자)를 받을 수 있습니다.
type ImageSource = { uri: string } | number;

const DEFAULT_ICON = require("@/assets/images/default-card.png");

export function useTagIcon(tags: string[]) {
  const [iconSource, setIconSource] = useState<ImageSource>(DEFAULT_ICON);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tags || tags.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchIcon = async () => {
      setIsLoading(true);
      let found = false;
      for (const tag of tags) {
        try {
          const docRef = doc(db, "qTags", tag);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.iconURL) {
              setIconSource({ uri: data.iconURL });
              found = true;
              break;
            }
          }
        } catch (error) {
          console.error(`Error fetching tag icon for "${tag}":`, error);
        }
      }

      // 루프가 끝날 때까지 아이콘을 찾지 못했다면 기본 아이콘을 유지합니다.
      if (!found) {
        setIconSource(DEFAULT_ICON);
      }

      setIsLoading(false);
    };

    fetchIcon();
  }, [tags]); // tags 배열이 변경될 때만 이 effect를 다시 실행합니다.

  return { iconSource, isLoading };
}
