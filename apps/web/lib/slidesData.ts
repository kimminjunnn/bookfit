export interface Slide {
  id: number;
  tag: string;
  tagColor: string;
  tagTextColor: string;
  title: string;
  subtitle: string;
  description: string;
  cta?: string;
  ctaStyle: string;
  bgImage: string;
  overlayGradient: string;
  accentColor: string;
  rightVisual: "book" | "trophy" | "store" | "none";
}

export interface EventSection {
  title: string;
  content: string[];
  list?: string[];
}

export interface EventDetail {
  id: number;
  title: string;
  subtitle: string;
  period: string;
  bannerBg: string;
  accentColor: string;
  sections: EventSection[];
  ctaText?: string;
  ctaAction?: "modal" | "link";
  ctaLink?: string;
}

export const slides: Slide[] = [
  {
    id: 0,
    tag: "이벤트",
    tagColor: "bg-[#F97316]",
    tagTextColor: "text-white",
    title: "독서의 달 기념\n전 도서 10% 적립",
    subtitle: "7월 한 달간",
    description:
      "가을의 시작을 책과 함께하세요.\n모든 도서 구매 시 포인트 혜택을 드립니다.",
    cta: "이벤트 보기",
    ctaStyle:
      "bg-[#F97316] text-white hover:bg-[#ea6a08] shadow-[0_0_24px_rgba(249,115,22,0.5)]",
    bgImage: "/banner-slide1.png",
    overlayGradient:
      "linear-gradient(105deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.1) 100%)",
    accentColor: "#F97316",
    rightVisual: "none",
  },
  {
    id: 1,
    tag: "신작 출시",
    tagColor: "bg-[#0EA5E9]",
    tagTextColor: "text-white",
    title: "올해의 화제작\n내 몸 건강 진단서",
    subtitle: "2025 베스트셀러",
    description:
      "몸이 보내는 신호, 부위별로 점검하기.\n당신의 건강을 위한 필독서가 출시되었습니다.",
    cta: "자세히 보기",
    ctaStyle:
      "bg-[#0EA5E9] text-white hover:bg-[#0284c7] shadow-[0_0_24px_rgba(14,165,233,0.5)]",
    bgImage: "/banner-slide2.png",
    overlayGradient:
      "linear-gradient(105deg, rgba(2,12,30,0.88) 0%, rgba(2,12,30,0.65) 50%, rgba(2,12,30,0.15) 100%)",
    accentColor: "#0EA5E9",
    rightVisual: "book",
  },
  {
    id: 2,
    tag: "공모전",
    tagColor: "bg-[#EAB308]",
    tagTextColor: "text-black",
    title: "제1회 BookFit AI\n독후감 공모전",
    subtitle: "총 상금 500만원",
    description:
      "AI와 함께하는 새로운 독서 경험.\n당신만의 이야기를 들려주세요.",
    cta: "지금 참여하기",
    ctaStyle:
      "bg-[#EAB308] text-black hover:bg-[#ca9a07] shadow-[0_0_24px_rgba(234,179,8,0.5)]",
    bgImage: "/banner-slide3.png",
    overlayGradient:
      "linear-gradient(105deg, rgba(20,10,40,0.85) 0%, rgba(20,10,40,0.60) 50%, rgba(20,10,40,0.1) 100%)",
    accentColor: "#EAB308",
    rightVisual: "trophy",
  },
  {
    id: 3,
    tag: "서비스 안내",
    tagColor: "bg-[#22C55E]",
    tagTextColor: "text-white",
    title: "바로드림 서비스\n이용 안내",
    subtitle: "30분 내 픽업 보장",
    description:
      "온라인으로 주문하고 매장에서 바로 픽업!\n더 빠르고 편리한 독서 생활을 경험하세요.",
    cta: "이용방법 확인",
    ctaStyle:
      "bg-[#22C55E] text-white hover:bg-[#16a34a] shadow-[0_0_24px_rgba(34,197,94,0.5)]",
    bgImage: "/banner-slide4.png",
    overlayGradient:
      "linear-gradient(105deg, rgba(0,20,10,0.82) 0%, rgba(0,20,10,0.55) 50%, rgba(0,20,10,0.1) 100%)",
    accentColor: "#22C55E",
    rightVisual: "store",
  },
];

export const eventDetails: Record<number, EventDetail> = {
  0: {
    id: 0,
    title: "독서의 달 기념 전 도서 10% 적립 이벤트",
    subtitle: "올여름, 독서의 즐거움과 함께 특별한 혜택을 누려보세요.",
    period: "2026년 7월 1일(월) ~ 2026년 7월 31일(목)",
    bannerBg: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
    accentColor: "#f97316",
    sections: [
      {
        title: "이벤트 안내",
        content: [
          "독서하기 가장 좋은 계절을 맞아 BookFit에서 모든 도서를 사랑하는 독자분들을 위해 파격적인 10% 적립 혜택을 준비했습니다.",
          "종이책부터 e-book, 학습 수험서 및 외국 원서까지 상관없이 BookFit에 등록된 모든 도서를 구매하실 때 정가 대비 10% 포인트 적립 혜택이 즉시 적용됩니다.",
          "이번 기회에 평소 읽고 싶었던 도서 리스트를 채우고 알뜰한 독서 생활을 시작해 보세요!"
        ]
      },
      {
        title: "참여 혜택 & 방식",
        content: [
          "본 혜택은 회원 가입 후 로그인한 상태에서 도서를 결제하실 때 자동으로 적용됩니다."
        ],
        list: [
          "혜택 대상: BookFit 전체 가입 회원",
          "혜택 내용: 도서 구매 금액의 10%를 BookFit 포인트로 즉시 적립",
          "포인트 유효기한: 적립일로부터 1년 (사용 제한 조건 없음)",
          "사용 방법: 적립된 포인트는 차기 도서 구매 시 10원 단위로 즉시 사용 가능"
        ]
      },
      {
        title: "꼭 확인해주세요!",
        content: [],
        list: [
          "비회원 구매 시에는 포인트 적립 대상에서 제외되니 구매 전 반드시 로그인해 주세요.",
          "주문 취소 또는 도서 반품 시 적립된 포인트는 자동으로 회수됩니다.",
          "일부 잡지 및 문구류는 도서 품목이 아니므로 본 10% 적립 혜택에서 제외됩니다."
        ]
      }
    ],
    ctaText: "도서 보러가기",
    ctaAction: "link",
    ctaLink: "/"
  },
  1: {
    id: 1,
    title: "올해의 화제작 [내 몸 건강 진단서] 신작 출시",
    subtitle: "2025년 가장 큰 화제를 모은 의학 건강 베스트셀러를 지금 만나보세요.",
    period: "상시 판매 중 (신작 도서)",
    bannerBg: "linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)",
    accentColor: "#0ea5e9",
    sections: [
      {
        title: "도서 소개",
        content: [
          "바쁜 현대 사회 속에서 우리는 얼마나 우리 몸의 목소리에 귀를 기울이고 있을까요? 소화 불량, 두통, 지속적인 피로와 같은 가벼운 증상들은 우리 몸이 보내는 적신호일 수 있습니다.",
          "신간 [내 몸 건강 진단서]는 복잡한 의학 지식을 일반인의 눈높이에 맞추어 핵심 위주로 쉽게 구성한 도서입니다. 전문의들이 제안하는 일상의 증상 자가 체크리스트와 부위별 관리 팁을 통해 나와 내 가족의 건강을 스스로 돌볼 수 있는 능력을 키워줍니다."
        ]
      },
      {
        title: "이 책의 핵심 구성",
        content: [
          "이 책은 신체 기관별로 일어날 수 있는 건강 이상 신호들을 정리하고 해결 방안을 체계적으로 안내합니다."
        ],
        list: [
          "1장: 만성 피로와 면역계 - 현대인의 가장 큰 적, 호르몬 불균형 해결법",
          "2장: 머리부터 발끝까지 - 소화기 계통 자가진단 및 건강한 식습관 교정법",
          "3장: 척추와 골격 - 매일 5분씩 투자하는 거북목 및 골반 교정 스트레칭",
          "4장: 마음 건강 진단서 - 스트레스와 번아웃을 예방하는 멘탈 피트니스"
        ]
      },
      {
        title: "추천 독자 대상",
        content: [],
        list: [
          "잦은 피로감과 원인 모를 신체 증상으로 걱정이 많으신 분",
          "건강검진 전후로 예방 의학 및 평소 생활 습관 개선에 관심이 있는 분",
          "부모님이나 소중한 지인에게 부담 없고 유익한 건강 안내서를 선물하고 싶으신 분"
        ]
      }
    ],
    ctaText: "도서 상세 정보 보기",
    ctaAction: "link",
    ctaLink: "/" // 1번 이미지 도서 상세로 바로드림 매장 안내하기 위해 연결
  },
  2: {
    id: 2,
    title: "제1회 BookFit AI 독후감 공모전 개최",
    subtitle: "AI 독서 큐레이터와 함께 읽고 토론하며 당신의 풍부한 생각을 글로 담아보세요.",
    period: "2026년 7월 10일(금) ~ 2026년 8월 20일(목)",
    bannerBg: "linear-gradient(135deg, #ca9a07 0%, #eab308 100%)",
    accentColor: "#eab308",
    sections: [
      {
        title: "공모전 개요",
        content: [
          "BookFit은 인공지능 기술을 접목하여 독자 개개인의 성향과 상황에 딱 맞는 맞춤형 도서를 추천하는 혁신적인 독서 경험을 제공하고 있습니다.",
          "이번 공모전은 AI가 추천한 책을 읽고 작성하는 신개념 독서 감상문 대회로, 독서의 폭을 넓히고 나아가 인공지능이 우리 삶과 생각의 확장에 기여하는 긍정적인 가치를 함께 나누고자 합니다.",
          "BookFit의 AI 큐레이터 'BookFit'과 나눈 대화 경험, 그리고 추천 도서를 완독하고 느낀 영감을 여러분만의 문체로 작성해 접수해 주세요."
        ]
      },
      {
        title: "시상 내역 (총 상금 500만원)",
        content: [],
        list: [
          "🥇 대상 (1명): 상금 300만원 및 상장 수여",
          "🥈 최우수상 (2명): 상금 각 70만원 및 상장 수여",
          "🥉 우수상 (3명): 상금 각 20만원 및 상장 수여",
          "🎁 참가상 (선착순 100명): BookFit 도서 할인 쿠폰 1만원권 제공"
        ]
      },
      {
        title: "참여 및 제출 방법",
        content: [],
        list: [
          "1단계: BookFit AI 대화(상담) 기능을 통해 현재 나의 고민이나 목적을 입력하고 맞춤형 도서를 추천받습니다.",
          "2단계: 추천받은 도서 리스트 중 한 권 이상을 선택하여 완독합니다.",
          "3단계: 'AI와의 상담 경험'과 '도서 감상평'을 아우르는 자유 형식의 독후감을 작성합니다 (A4 용지 2매 내외).",
          "4단계: 하단의 공모전 응모 페이지를 통해 한글 또는 워드 파일로 제출합니다."
        ]
      }
    ],
    ctaText: "AI와 대화하고 책 추천받기",
    ctaAction: "modal"
  },
  3: {
    id: 3,
    title: "BookFit 매장 즉시 수령 '바로드림' 서비스 이용법",
    subtitle: "기다림 없는 스마트한 독서 라이프, 주문 후 30분 만에 책을 바로 만나는 비결!",
    period: "연중무휴 서비스 제공",
    bannerBg: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
    accentColor: "#22c55e",
    sections: [
      {
        title: "바로드림 서비스란?",
        content: [
          "원하는 책을 서점에 갈 때마다 재고가 없어 헛걸음하셨거나, 배송받는 며칠의 시간마저 아쉬웠던 경험이 있으신가요?",
          "BookFit의 '바로드림' 서비스는 온라인/모바일 앱에서 편리하고 저렴한 가격에 도서를 결제한 후, 고객님께서 직접 지정한 오프라인 서점 매장에서 단 30분 만에 도서를 안전하게 수령할 수 있는 혁신적인 온·오프라인 결합 픽업 서비스입니다."
        ]
      },
      {
        title: "이용 프로세스 3단계",
        content: [],
        list: [
          "1단계 [주문/결제]: BookFit 모바일 또는 PC에서 원하는 도서를 장바구니에 담고 결제 시 배송 수단을 '바로드림'으로 선택한 뒤, 수령할 오프라인 매장을 지정합니다.",
          "2단계 [도서 준비 알림]: 선택하신 매장의 직원이 도서 서가에서 해당 책을 픽업하여 픽업 부스에 준비해 둡니다. 준비 완료 시 알림톡(카카오톡 또는 SMS)이 발송됩니다 (약 20~30분 소요).",
          "3단계 [수령]: 알림톡 혹은 주문 상세 화면의 픽업 바코드를 지참하여 서점 내 '바로드림 존' 부스에 방문해 보여주시면 바로 도서를 수령하실 수 있습니다."
        ]
      },
      {
        title: "바로드림 고객만의 특별한 혜택",
        content: [],
        list: [
          "단 1권만 사도 배송비 완전히 무료!",
          "매장에서 책 상태를 직접 확인하고 마음이 변했다면 그 자리에서 타 도서로 교체 또는 반품 가능",
          "오프라인 매장 전용 도서 쇼핑백 및 BookFit 스티커 무료 증정"
        ]
      }
    ],
    ctaText: "주변 픽업 가능 매장 보기",
    ctaAction: "link",
    ctaLink: "/"
  }
};
