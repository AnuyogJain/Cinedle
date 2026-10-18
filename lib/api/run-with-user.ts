import { NextResponse } from "next/server";
import {
  runWithUserSession,
  UnauthorizedError,
} from "@/lib/auth/user-context";

type RouteContext = { params?: Promise<Record<string, string>> };

type RouteHandler = (
  request: Request,
  context?: RouteContext,
) => Promise<Response> | Response;

export function withUser(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await runWithUserSession(() =>
        Promise.resolve(handler(request, context)),
      );
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      throw error;
    }
  };
}
