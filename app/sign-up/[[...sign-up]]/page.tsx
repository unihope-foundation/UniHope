import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] p-4">
      <Suspense
        fallback={
          <div className="text-sm font-medium text-slate-500">
            Loading sign-up...
          </div>
        }
      >
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/admin"
        />
      </Suspense>
    </div>
  );
}
