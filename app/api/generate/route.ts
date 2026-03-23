import type { NextRequest } from "next/server";
import { POST as parserPost } from "@/app/api/parser/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
	return parserPost(request);
}
