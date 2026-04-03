export type CategoryKey =
  | "General"
  | "Shopping"
  | "Traffic"
  | "Food"
  | "Coffee"
  | "Cultural"
  | "Travel"
  | "Life"
  | "EduHealth"
  | "Others";

type CategoryMeta = {
  key: CategoryKey;
  label: string;
  helper: string;
};

export const CATEGORY_META: CategoryMeta[] = [
  { key: "Food", label: "식비", helper: "외식, 배달, 마트" },
  { key: "Traffic", label: "교통", helper: "대중교통, 택시, 통행료" },
  { key: "Shopping", label: "쇼핑", helper: "온라인/오프라인 쇼핑" },
  { key: "Coffee", label: "카페", helper: "커피, 디저트" },
  { key: "Cultural", label: "문화", helper: "영화, 공연, 전시" },
  { key: "Life", label: "생활", helper: "마트, 편의점, 생활비" },
  { key: "Travel", label: "여행", helper: "항공, 숙박, 해외 결제" },
  { key: "EduHealth", label: "교육/건강", helper: "병원, 약국, 학원" },
  { key: "Others", label: "기타", helper: "기타 소비 항목" }
];

export const CATEGORY_LABEL_MAP = new Map(
  CATEGORY_META.map((item) => [item.label, item.key])
);

export const CATEGORY_KEY_TO_LABEL = new Map(
  CATEGORY_META.map((item) => [item.key, item.label])
);
