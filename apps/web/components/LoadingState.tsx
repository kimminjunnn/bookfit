"use client";

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-6">
      {/* Robot animation area */}
      <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-primary-container/10">
        <span
          className="material-symbols-outlined text-primary text-[32px] animate-bounce"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          smart_toy
        </span>
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>

      <div className="text-center space-y-2">
        <h3 className="font-semibold text-[18px] text-primary">
          AI 독서 상담사가 도서를 선별하고 있습니다
        </h3>
        <p className="text-[14px] text-on-surface-variant/80">
          당신의 상황과 요구사항을 바탕으로 책을 매칭하고 있습니다. (약 3~5초 소요)
        </p>
      </div>

      {/* Skeleton cards container */}
      <div className="w-full space-y-3 mt-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-md p-md bg-surface border border-outline-variant rounded-xl"
          >
            {/* Cover placeholder */}
            <div className="w-[60px] h-[80px] skeleton shrink-0" />
            
            {/* Details placeholder */}
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 skeleton" />
              <div className="h-5 w-3/4 skeleton" />
              <div className="h-3 w-5/6 skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
