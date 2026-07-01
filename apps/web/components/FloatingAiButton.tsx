"use client";

export default function FloatingAiButton() {
  const handleClick = () => {
    // 추후 AI 상담 모달로 교체
    alert("AI 도서 상담 기능은 곧 출시됩니다! 🎉");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-10 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-50"
      aria-label="AI 도서 상담"
    >
      <span
        className="material-symbols-outlined text-[28px]"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        chat
      </span>
    </button>
  );
}
