import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

const handleClerk = clerkMiddleware(async (auth, req) => {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    await auth.protect();
  }
});

export default async function proxy(req: NextRequest, event: NextFetchEvent) {
  const isProtected =
    req.nextUrl.pathname.startsWith("/admin") ||
    req.nextUrl.pathname.startsWith("/sign-in") ||
    req.nextUrl.pathname.startsWith("/sign-up");

  const hasClerkKeys =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!hasClerkKeys && !isProtected) {
    return NextResponse.next();
  }

  try {
    return await handleClerk(req, event);
  } catch (error) {
    if (isProtected) {
      throw error;
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
