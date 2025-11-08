import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/70 bg-blue-300/95 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-black dark:text-slate-400 sm:text-base">
              Diana Global
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Secure access for a global workforce.
            </h2>
            <p className="mt-4 max-w-xl text-base text-black/80 dark:text-slate-300 sm:text-lg">
              Authentication that puts security and resilience first, so your teams can focus on what matters.
            </p>
          </div>

          <div className="text-base sm:text-lg">
            <h3 className="text-base font-semibold uppercase tracking-wide text-black/80 dark:text-slate-400 sm:text-lg">
              Resources
            </h3>
            <ul className="mt-4 space-y-3 text-base text-black/80 dark:text-slate-300 sm:text-lg">
              <li>
                <a className="transition hover:text-blue-600" href="/privacy-policy">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a className="transition hover:text-blue-500" href="/terms-service">
                  Terms of Service
                </a>
              </li>
              <li>
                <a className="transition hover:text-blue-500" href="/cookies">
                  Cookies Policy
                </a>
              </li>
              <li>
                <a className="transition hover:text-blue-500" href="/disclosures">
                  Disclosures
                </a>
              </li>
            </ul>
          </div>

          <div className="text-base sm:text-lg">
            <h3 className="text-base font-semibold uppercase tracking-wide text-black/80 dark:text-slate-400 sm:text-lg">
              Need help?
            </h3>
            <p className="mt-4 text-base text-black/80 dark:text-slate-300 sm:text-lg">
              Trouble signing in or confirming your account? Reach our team for guided support.
            </p>
            <a
              className="mt-6 inline-flex items-center justify-center rounded-lg border border-black/70 bg-white px-5 py-3 text-base font-semibold text-black transition hover:bg-black hover:text-white dark:border-blue-500/80 dark:bg-transparent dark:text-blue-300 dark:hover:bg-blue-500/20 sm:text-lg"
              href="/support"
            >
              Visit Support
              <span className="ml-2 text-lg leading-none" aria-hidden>
                →
              </span>
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200/70 pt-6 text-base text-black dark:border-slate-800/70 dark:text-slate-300 sm:flex-row sm:text-lg">
          <p className="font-semibold text-black dark:text-slate-100">
            © {new Date().getFullYear()}{" "}
            <a
              className="transition hover:text-yellow-600 cursor-pointer"
              href="https://www.andescoresoftware.com.br/"
              target="_blank"
              rel="noopener noreferrer"
            >
              AndesCore Software
            </a>
            . All rights reserved.
          </p>
          <p className="text-center font-semibold text-black dark:text-slate-100 sm:text-right">
            Contact{" "}
            <a className="font-medium text-blue-700 transition hover:text-yellow-600 cursor-pointer dark:text-blue-300 dark:hover:text-yellow-400" href="mailto:andescoresoftware@gmail.com">
              andescoresoftware@gmail.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
