import { NextResponse } from "next/server";

const ADS_TXT =
  "google.com, pub-2020371901709303, DIRECT, f08c47fec0942fa0\n";

export function GET() {
  return new NextResponse(ADS_TXT, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
