import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = "then" in params ? await params : params;
    const bookId = resolvedParams.id;
    
    // 끝에 슬래시가 있을 경우 자동 제거 (//books 이중 슬래시 방지)
    const FASTAPI_BASE_URL = (process.env.FASTAPI_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
    
    console.log(`[Next.js API Proxy] FastAPI 서버(${FASTAPI_BASE_URL}/books/${bookId}) 단건 조회 시도...`);
    const response = await fetch(`${FASTAPI_BASE_URL}/books/${bookId}`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: "Book not found in FastAPI Chroma DB" },
        { status: 404 }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Next.js API Proxy] FastAPI 단건 조회 프록시 중 에러 발생:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
