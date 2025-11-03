import React from "react";

const SupportPage: React.FC = () => {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 text-sm md:text-base">
      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">
          Support & Help — Diana Global
        </h1>
        <p className="text-zinc-600 leading-relaxed">
          Trouble signing in? Didn’t get the email? Forgot your password?
          This page walks you through the most common fixes.
          If you still need help, you can contact us at the bottom.
        </p>
        <p className="text-[11px] text-zinc-400 mt-2">
          Last updated: 11/03/2025
        </p>
      </header>

      {/* 1. Sign-in issues */}
      <section className="mb-8 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-900 mb-2">
          1. I can’t sign in
        </h2>

        <p className="text-zinc-700 mb-3">
          Before you panic, try this:
        </p>

        <ul className="list-disc list-inside text-zinc-700 space-y-2">
          <li>
            Double-check your email and password. Extra spaces break login
            (like <span className="italic">"you@example.com␣"</span>).
          </li>
          <li>Make sure CAPS LOCK is not on.</li>
          <li>
            If you see{" "}
            <span className="font-semibold">"Email not confirmed"</span>,
            that means you still need to click the confirmation link we sent
            to your email.
          </li>
          <li>
            Did you originally sign up using{" "}
            <span className="font-semibold">“Continue with Google”</span>?
            Then try logging in again with Google. You might not have created
            a password yet.
          </li>
        </ul>

        <p className="text-xs text-zinc-500 mt-4">
            If you already confirmed your email and you’re still locked out,
            try “Forgot password” and set a new one.
        </p>
      </section>

      {/* 2. I never got the confirmation email */}
      <section className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">
          2. I didn’t receive the confirmation email
        </h2>

        <p className="text-blue-900/90 mb-3">
          The confirmation email tells us “yes, this inbox is yours”.
          If it didn’t show up:
        </p>

        <ul className="list-disc list-inside text-blue-900/90 space-y-2">
          <li>Check Spam / Junk / Promotions tabs.</li>
          <li>
            Search your inbox for{" "}
            <span className="font-mono text-[0.8rem] bg-white/60 px-1 py-0.5 rounded border border-blue-200">
              dianaglobal
            </span>{" "}
            or{" "}
            <span className="font-mono text-[0.8rem] bg-white/60 px-1 py-0.5 rounded border border-blue-200">
              confirmation
            </span>
            .
          </li>
          <li>
            On the “Check your email” page in the app,
            click <strong>“Resend confirmation email”</strong>.
            We’ll send a fresh link.
          </li>
          <li>
            If we say you’ve hit the resend limit, just wait a bit.
            We limit how often someone can request links so nobody spams
            your inbox pretending to be you.
          </li>
        </ul>

        <p className="text-xs mt-4 text-blue-900/70">
          Still nothing after resending? Contact us at the bottom and tell us
          which email you tried to register.
        </p>
      </section>

      {/* 3. Forgot password / reset link */}
      <section className="mb-8 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-900 mb-2">
          3. I forgot my password
        </h2>

        <ol className="list-decimal list-inside text-zinc-700 space-y-2 mb-4">
          <li>Go to the Login screen.</li>
          <li>Click <strong>“Forgot your password?”</strong>.</li>
          <li>
            Enter your email. We’ll send you a secure link to create
            a new password.
          </li>
        </ol>

        <p className="text-zinc-700 mb-2">
          Didn’t get the reset email?
        </p>
        <ul className="list-disc list-inside text-zinc-700 space-y-2">
          <li>Check Spam / Junk / Promotions.</li>
          <li>
            Make sure you typed the same email you used to register.
            (yes, <span className="font-semibold">gmail.com</span> and{" "}
            <span className="font-semibold">gmail.com.br</span> are different for us)
          </li>
          <li>
            Try again. You can request a new reset link if the old one expired.
          </li>
        </ul>

        <p className="text-xs text-zinc-500 mt-4">
          For security reasons, password reset links expire.
          If it’s been a while, request a new one.
        </p>
      </section>

      {/* 4. “This link is expired / already used” */}
      <section className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-amber-900 mb-2">
          4. My link says “expired”, “invalid”, or “already used”
        </h2>

        <p className="text-amber-900/90 mb-3">
          This can happen with confirmation links or password reset links.
        </p>

        <ul className="list-disc list-inside text-amber-900/90 space-y-2">
          <li>
            <strong>Expired:</strong> The link timed out.
            Just request a new one in the app
            (“Resend confirmation email” or “Forgot password”).
          </li>
          <li>
            <strong>Already used:</strong> You probably clicked it once
            and it worked. Try logging in normally.
          </li>
          <li>
            <strong>Invalid:</strong> The link may have been cut off
            (for example, your email app broke it into two lines).
            Copy & paste the full link into your browser.
          </li>
        </ul>

        <p className="text-xs text-amber-900/70 mt-4">
          If you’re sure you’re doing everything right and it still fails,
          contact us below and tell us which link type failed:
          account confirmation or password reset.
        </p>
      </section>

      {/* 5. Google sign-in & “set a password” */}
      <section className="mb-8 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-900 mb-2">
          5. I signed up with Google. Do I have a password?
        </h2>

        <p className="text-zinc-700 mb-4">
          If you created your account with “Continue with Google”, at first
          you log in by tapping the Google button — no password needed.
        </p>

        <p className="text-zinc-700 mb-2">
          Later, inside your account, you’ll see an option like
          <span className="font-semibold"> “Set your password”</span>.
          That lets you create a normal email + password login too,
          without losing Google login.
        </p>

        <p className="text-xs text-zinc-500">
          Tip: This is useful if you want to log in on a device where
          Google Sign-In is blocked or not available.
        </p>
      </section>

      {/* 6. Security basics */}
      <section className="mb-8 rounded-lg border border-rose-200 bg-rose-50 p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-rose-900 mb-2">
          6. Security tips (please read 🙏)
        </h2>

        <ul className="list-disc list-inside text-rose-900/90 space-y-2">
          <li>
            We will <strong>never</strong> ask for your password in plain text,
            your 2FA code, or any wallet recovery phrase.
          </li>
          <li>
            If someone claims to be “Diana Support” and asks for
            your seed phrase: it is 100% a scam.
          </li>
          <li>
            Only trust links that start with{" "}
            <span className="font-mono text-[0.8rem] bg-white/70 px-1 py-0.5 rounded border border-rose-200">
              https://dianaglobal.com.br
            </span>{" "}
            or the official app.
          </li>
          <li>
            If your email or password was exposed somewhere else,
            change your Diana Global password right now.
          </li>
        </ul>

        <p className="text-xs text-rose-900/70 mt-4">
          Lost access to your email and can’t confirm it anymore?
          Reach out below. We may ask extra questions to verify
          you’re really the owner, for your safety.
        </p>
      </section>

      {/* 7. Contact us */}
      <section className="mb-8 rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-900 mb-2">
          7. Still need help?
        </h2>

        <p className="text-zinc-700 mb-4 leading-relaxed">
          No problem. Send us an email and include:
        </p>

        <ul className="list-disc list-inside text-zinc-700 space-y-2 mb-4">
          <li>The email you used to sign up</li>
          <li>What you were trying to do (sign in, confirm email, reset password, etc.)</li>
          <li>Any error message you saw</li>
        </ul>

        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-zinc-800 text-sm">
          <div className="font-semibold text-zinc-900">Support email</div>
          <div className="font-mono text-[0.9rem] break-all">
            andescoresoftware@gmail.com
          </div>
        </div>

        <p className="text-xs text-zinc-500 mt-4">
          We’re a small team. We do read everything, and we care about keeping
          your account safe.
        </p>
      </section>

      {/* Footer note */}
      <footer className="text-center text-[11px] text-zinc-400 mt-10">
        Diana Global — security-first wallet & account access.
        We will never DM you asking for money.
      </footer>
    </div>
  );
};

export default SupportPage;
