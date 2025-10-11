import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // No authentication restrictions - all routes are accessible
  return NextResponse.next();
}

export const config = {
  matcher: [],
};


