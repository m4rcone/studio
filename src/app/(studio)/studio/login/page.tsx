import "@/components/studio/studio.css";
import { LoginForm } from "@/components/studio/auth/LoginForm";
import { STUDIO_STRINGS } from "@/lib/studio/constants";

export const metadata = {
  title: "Studio Login",
};

export default function StudioLoginPage() {
  const s = STUDIO_STRINGS.auth;

  return (
    <div className="studio flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-(--st-radius-lg) border border-(--st-border) bg-(--st-bg-elevated) p-8 shadow-(--st-shadow-lg)">
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-(--st-accent)"
            >
              <path d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.813 1.912a2 2 0 00-1.272 1.272L12 21l-1.912-5.813a2 2 0 00-1.272-1.272L3 12l5.813-1.912a2 2 0 001.272-1.272z" />
            </svg>
            <h1 className="text-xl font-semibold text-(--st-text)">
              {s.loginTitle}
            </h1>
          </div>
          <p className="text-sm text-(--st-text-secondary)">
            {s.loginSubtitle}
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
