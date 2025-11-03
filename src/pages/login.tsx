// src/pages/support.tsx
"use client";

import React from "react";

export default function SupportPage(): JSX.Element {
  return (
    <main className="min-h-screen flex flex-col bg-white text-zinc-900 dark:bg-black dark:text-white">
      <section className="w-full max-w-3xl mx-auto px-4 py-10 flex-1">
        {/* INTRO CARD (Header dentro da caixinha) */}
        <section
          className="mb-8 rounded-lg border border-zinc-300 bg-white p-5 shadow-sm text-center
                     text-zinc-800
                     dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <h1 className="text-2xl md:text-3xl font-semibold mb-3 text-zinc-900 dark:text-white">
            Support &amp; Help — Diana Global
          </h1>

          <p className="text-sm md:text-base leading-relaxed text-zinc-700 dark:text-zinc-100">
            Trouble signing in? Didn’t get the email? Forgot your password?
            This page walks you through the most common fixes. If you still
            need help, you can contact us at the bottom.
          </p>

          <p className="text-[11px] mt-3 text-zinc-500 dark:text-zinc-400">
            Last updated: 11/03/2025
          </p>
        </section>

        {/* CARD 1 - Can't sign in */}
        <section
          className="mb-6 rounded-lg border border-zinc-300 bg-white p-5 shadow-sm
                     text-zinc-800
                     dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <h2 className="font-semibold text-lg mb-2 flex items-start gap-2">
            <span>1. I can’t sign in</span>
          </h2>

          <p className="text-sm leading-relaxed mb-3">
            Before you panic, try this:
          </p>

          <ul className="list-disc pl-5 text-sm space-y-2">
            <li>
              Double-check your email and password. Extra spaces break login
              (like{" "}
              <code className="bg-zinc-100 text-zinc-800 px-1 rounded dark:bg-zinc-800 dark:text-white">
                "you@example.com,"
              </code>
              ).
            </li>

            <li>Make sure CAPS LOCK is not on.</li>

            <li>
              If you see{" "}
              <strong className="font-semibold">"Email not confirmed"</strong>,
              that means you still need to click the confirmation link we sent
              to your email.
            </li>

            <li>
              Did you originally sign up using{" "}
              <strong className="font-semibold">"Continue with Google"?</strong>{" "}
              Then try logging in again with Google. You might not have created
              a password yet.
            </li>
          </ul>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">
            If you already confirmed your email and you’re still locked out,
            try “Forgot your password?” and set a new one.
          </p>
        </section>

        {/* CARD 2 - Didn't get confirmation email */}
        <section
          className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-5 shadow-sm
                     text-zinc-800
                     dark:border-blue-900/40 dark:bg-blue-950 dark:text-blue-100"
        >
          <h2 className="font-semibold text-lg mb-2 flex items-start gap-2">
            <span>2. I didn’t receive the confirmation email</span>
          </h2>

          <p className="text-sm leading-relaxed mb-3">
            The confirmation email tells us “yes, this inbox is yours”. If it
            didn’t show up:
          </p>

          <ul className="list-disc pl-5 text-sm space-y-2">
            <li>Check Spam / Junk / Promotions tabs.</li>

            <li>
              Search your inbox for{" "}
              <code className="bg-zinc-100 text-zinc-800 px-1 rounded dark:bg-zinc-800 dark:text-white">
                dianaglobal
              </code>{" "}
              or{" "}
              <code className="bg-zinc-100 text-zinc-800 px-1 rounded dark:bg-zinc-800 dark:text-white">
                confirmation
              </code>
              .
            </li>

            <li>
              On the <strong>“Check your email”</strong> page in the app, click{" "}
              <strong>“Resend confirmation email”</strong>. We’ll send a fresh
              link.
            </li>

            <li>
              If we say you’ve hit the resend limit, just wait a bit. We limit
              how often someone can request links so nobody spams your inbox
              pretending to be you.
            </li>
          </ul>

          <p className="text-[11px] text-blue-900 dark:text-blue-300 mt-3 leading-relaxed">
            Still nothing after resending? Contact us below and tell us which
            email you tried to register.
          </p>
        </section>

        {/* CARD 3 - Forgot password */}
        <section
          className="mb-6 rounded-lg border border-zinc-300 bg-white p-5 shadow-sm
                     text-zinc-800
                     dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <h2 className="font-semibold text-lg mb-2 flex items-start gap-2">
            <span>3. I forgot my password</span>
          </h2>

          <p className="text-sm leading-relaxed mb-3">
            No problem — you don’t need to remember it forever:
          </p>

          <ul className="list-disc pl-5 text-sm space-y-2">
            <li>
              Go to{" "}
              <a
                className="underline text-blue-600 dark:text-blue-400 hover:opacity-90"
                href="/forgot-password"
              >
                Forgot your password
              </a>{" "}
              and enter your email.
            </li>

            <li>
              We’ll send a secure link where you can set a brand new password.
            </li>

            <li>
              The link expires for safety. If it’s expired, just request
              another.
            </li>
          </ul>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">
            Tip: After you set a new password, try logging in again normally.
            You shouldn’t need to confirm your email again.
          </p>
        </section>

        {/* CARD 4 - Email change issues */}
        <section
          className="mb-6 rounded-lg border border-zinc-300 bg-white p-5 shadow-sm
                     text-zinc-800
                     dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <h2 className="font-semibold text-lg mb-2 flex items-start gap-2">
            <span>4. I changed my email and now I can’t log in</span>
          </h2>

          <p className="text-sm leading-relaxed mb-3">
            If you asked to change your login email, we send a confirmation
            link to the <strong>new</strong> email before we finalize the
            change.
          </p>

          <ul className="list-disc pl-5 text-sm space-y-2">
            <li>
              Check the <strong>new</strong> inbox for “Confirm email change”.
            </li>

            <li>
              Click the link. After that, you’ll sign in with the new email.
            </li>

            <li>
              Didn’t click in time? That link can expire — just request the
              change again inside your account settings.
            </li>
          </ul>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">
            If someone else requested a change and it wasn’t you: ignore the
            email and let us know immediately.
          </p>
        </section>

        {/* CARD 5 - Security basics */}
        <section
          className="mb-10 rounded-lg border border-zinc-300 bg-white p-5 shadow-sm
                     text-zinc-800
                     dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <h2 className="font-semibold text-lg mb-2 flex items-start gap-2">
            <span>5. Security basics</span>
          </h2>

          <ul className="list-disc pl-5 text-sm space-y-2">
            <li>
              We will <strong>never</strong> ask for your password in plain
              text or your wallet seed phrase. Never send that to anyone.
            </li>

            <li>
              Only trust links that start with{" "}
              <code className="bg-zinc-100 text-zinc-800 px-1 rounded dark:bg-zinc-800 dark:text-white">
                dianaglobal.com.br
              </code>
              .
            </li>

            <li>
              If something looks weird (spelling errors, urgent threats,
              “confirm now or lose access”), stop and contact us before
              clicking anything.
            </li>
          </ul>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">
            If you think someone accessed your account: immediately reset your
            password and then reach out to us.
          </p>
        </section>

        {/* CONTACT / FOOTER CARD */}
        <footer
          className="rounded-lg border border-zinc-700 bg-zinc-900 p-6 text-white shadow-md
                     dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
        >
          <h2 className="text-xl font-semibold mb-3 text-white">
            Still need help?
          </h2>

          <p className="text-base leading-relaxed text-zinc-200 mb-4">
            We’re here for account access problems, security concerns,
            and anything related to your login or wallet access.
            <br />
            <br />
            When you contact us, please tell us:
            <br />• The email you tried to use
            <br />• What you were doing (login, reset password, etc.)
            <br />• The exact message you saw on screen (for example:
            “Email not confirmed”, “Invalid CSRF token”, etc.)
          </p>

          <div className="text-base text-zinc-100">
            <div className="font-medium">Diana Global Support</div>
            <div>
              Email:{" "}
              <a
                href="mailto:andescoresoftware@gmail.com"
                className="underline text-blue-400 hover:text-blue-300"
              >
                andescoresoftware@gmail.com
              </a>
            </div>

            <div className="text-zinc-400 text-sm mt-3">
              We respond in the order we get requests. Please don’t send
              passwords or seed phrases — we’ll never ask for those.
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}
