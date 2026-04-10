import "@/components/studio/studio.css";
import { LoginForm } from "@/components/studio/auth/LoginForm";
import { StudioHeader } from "@/components/studio/layout/StudioHeader";

export const metadata = {
  title: "Studio Login",
};

export default function StudioLoginPage() {
  return (
    <div className="studio flex h-screen flex-col">
      <StudioHeader userName={null} />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 items-center justify-center px-4 sm:px-6">
        <section className="st-panel w-full max-w-md p-8 sm:p-10">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-(--st-text)">Sign In</h1>
          </div>

          <LoginForm />
        </section>
      </main>
    </div>
  );
}
