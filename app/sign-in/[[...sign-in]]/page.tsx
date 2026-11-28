import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] p-4">
      <Suspense
        fallback={
          <div className="text-sm font-medium text-slate-500">
            Loading sign-in...
          </div>
        }
      >
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/admin"
        />
      </Suspense>
    </div>
  );
}
