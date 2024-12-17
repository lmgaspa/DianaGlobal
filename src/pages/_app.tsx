import Script from "next/script";
import { ThemeProvider } from "@/context/ThemeContext";
import MainContainer from "@/components/GlobalComponent/MainComponent";
import { AppProps } from "next/app";
import React, { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import ErrorBoundary from "@/components/ErrorBoundary";
import "../styles/globals.css";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useEffect(() => {
    const clearLocalStorage = () => {
      localStorage.removeItem("userId");
      localStorage.removeItem("email");
    };

    clearLocalStorage();
  }, []);

  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <ErrorBoundary>
          <MainContainer>
            <div className="overflow-hidden">
              {/* Google Analytics */}
              <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=G-VZVY5E6YNN`}
              />
              <Script
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'G-VZVY5E6YNN', {
                      page_path: window.location.pathname,
                    });
                  `,
                }}
              />
              <Component {...pageProps} />
            </div>
          </MainContainer>
        </ErrorBoundary>
      </ThemeProvider>
    </SessionProvider>
  );
}

export default MyApp;
