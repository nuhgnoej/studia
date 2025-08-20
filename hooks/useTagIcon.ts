import { useState, useEffect } from "react";
import { collection, query, where, getDocs, or } from "firebase/firestore";
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
      const qTagsCollectionRef = collection(db, "qTags");

      for (const tag of tags) {
        try {
          const lowercasedTag = tag.toLowerCase();

          const q = query(
            qTagsCollectionRef,
            or(
              where("tag_ko_lowercase", "==", lowercasedTag),
              where("tag_en_lowercase", "==", lowercasedTag)
            )
          );

          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
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

      if (!found) {
        setIconSource(DEFAULT_ICON);
      }

      setIsLoading(false);
    };

    fetchIcon();
  }, [tags]);

  return { iconSource, isLoading };
}
