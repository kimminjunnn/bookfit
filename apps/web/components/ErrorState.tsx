"use client";

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
  onFallbackRecommendation?: () => void;
}

export default function ErrorState({
  message = "추천 서비스를 일시적으로 이용할 수 없습니다. 다시 시도해주세요.",
  onRetry,
  onFallbackRecommendation,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-error-container/20 flex items-center justify-center">
        <span className="material-symbols-outlined text-error text-[36px]">
          error
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-[18px] text-error">
          알 수 없는 오류가 발생했습니다
        </h3>
        <p className="text-[14px] text-on-surface-variant max-w-[384px]">
          {message}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-xs w-full max-w-[320px]">
        <button
          onClick={onRetry}
          className="flex-1 h-11 bg-primary text-white rounded-lg font-semibold text-[14px] flex items-center justify-center gap-xs hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          다시 시도하기
        </button>
        {onFallbackRecommendation && (
          <button
            onClick={onFallbackRecommendation}
            className="flex-1 h-11 border border-outline-variant bg-surface hover:bg-surface-container rounded-lg font-semibold text-[14px] transition-colors"
          >
            기본 추천 도서 보기
          </button>
        )}
      </div>
    </div>
  );
}
