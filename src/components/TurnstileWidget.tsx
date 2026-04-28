import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          language?: "de" | "en";
          action?: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      remove?: (widgetId: string) => void;
    };
  }
}

const turnstileScriptId = "cf-turnstile-script";
const turnstileScriptSrc = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let turnstileScriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Turnstile is only available in the browser."));
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(turnstileScriptId) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Turnstile.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = turnstileScriptId;
    script.src = turnstileScriptSrc;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Turnstile."));
    document.head.appendChild(script);
  }).catch((error) => {
    turnstileScriptPromise = null;
    throw error;
  });

  return turnstileScriptPromise;
}

type TurnstileWidgetProps = {
  siteKey: string;
  language: "de" | "en";
  onTokenChange: (token: string) => void;
  onLoadError?: () => void;
};

export default function TurnstileWidget({
  siteKey,
  language,
  onTokenChange,
  onLoadError,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const onLoadErrorRef = useRef(onLoadError);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    onLoadErrorRef.current = onLoadError;
  }, [onLoadError]);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    loadTurnstileScript()
      .then(() => {
        if (!cancelled) {
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
          onLoadErrorRef.current?.();
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (status !== "ready" || !containerRef.current || !window.turnstile) {
      return;
    }

    onTokenChangeRef.current("");

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: "dark",
      language,
      action: "contact_form",
      callback: (token) => onTokenChangeRef.current(token),
      "expired-callback": () => onTokenChangeRef.current(""),
      "error-callback": () => {
        onTokenChangeRef.current("");
        setStatus("error");
        onLoadErrorRef.current?.();
      },
    });

    return () => {
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }

      widgetIdRef.current = null;
    };
  }, [language, siteKey, status]);

  return (
    <div className="turnstile-widget">
      <span className="turnstile-label">
        {language === "de" ? "Sicherheitsprüfung" : "Security check"}
      </span>

      <div className="turnstile-frame">
        {(status === "idle" || status === "loading") ? (
          <div className="turnstile-skeleton" />
        ) : null}

        {status === "error" ? (
          <div className="turnstile-error">
            {language === "de"
              ? "Die Sicherheitsprüfung konnte nicht geladen werden."
              : "The security check could not be loaded."}
          </div>
        ) : null}

        <div
          ref={containerRef}
          className={status === "ready" ? "turnstile-container" : "turnstile-container is-hidden"}
        />
      </div>
    </div>
  );
}
