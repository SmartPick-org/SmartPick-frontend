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
  subCategories: string[];
};

export const CATEGORY_META: CategoryMeta[] = [
  { key: "Food", label: "식비", helper: "외식, 배달, 패스트푸드", subCategories: ["외식", "배달", "패스트푸드"] },
  { key: "Traffic", label: "교통", helper: "대중교통, 택시, 주유 등", subCategories: ["대중교통(버스/지하철/KTX 등)", "택시", "주유", "전기차충전", "주차", "하이패스", "렌터카", "정비/세차"] },
  { key: "Shopping", label: "쇼핑", helper: "온라인/오프라인 쇼핑", subCategories: ["온라인쇼핑", "백화점", "마트/슈퍼", "편의점", "홈쇼핑", "면세점", "생활용품", "뷰티/미용"] },
  { key: "Coffee", label: "카페", helper: "카페, 디저트/베이커리", subCategories: ["카페", "디저트/베이커리"] },
  { key: "Cultural", label: "문화", helper: "영화, 공연, OTT 등", subCategories: ["영화", "공연/전시", "도서", "스트리밍", "OTT/구독", "레저/스포츠(골프/테니스 등)"] },
  { key: "Travel", label: "여행", helper: "항공, 숙박, 해외 등", subCategories: ["항공", "숙박", "여행사", "해외", "철도/고속버스"] },
  { key: "Life", label: "생활", helper: "통신, 공과금, 세금 등", subCategories: ["통신", "공과금", "관리비", "생활서비스", "세금/보험/연금"] },
  { key: "EduHealth", label: "교육/건강", helper: "병원, 약국, 피트니스 등", subCategories: ["병원", "약국", "학원/교육", "피트니스(헬스/요가 등)"] },
  { key: "Others", label: "기타", helper: "기타 소비 항목", subCategories: ["기타"] }
];

export const CATEGORY_LABEL_MAP = new Map(
  CATEGORY_META.map((item) => [item.label, item.key])
);

export const CATEGORY_KEY_TO_LABEL = new Map(
  CATEGORY_META.map((item) => [item.key, item.label])
);
