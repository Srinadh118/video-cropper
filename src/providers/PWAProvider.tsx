"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface Window {
    deferredPrompt?: BeforeInstallPromptEvent;
  }
}

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  showInstallBanner: boolean;
  installApp: () => Promise<boolean>;
  dismissInstallBanner: () => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone mode (installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    
    setIsInstalled(isStandalone);

    // 2. Check if a prompt was already captured on the window object
    if (window.deferredPrompt) {
      setIsInstallable(true);
      
      // Check if user has previously dismissed the banner in local storage
      const dismissed = localStorage.getItem("pwa-banner-dismissed") === "true";
      if (!isStandalone && !dismissed) {
        setShowInstallBanner(true);
      }
    }

    // 3. Define event listeners for PWA installation
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent browser's automatic prompt showing
      e.preventDefault();
      // Store event on global window
      window.deferredPrompt = e as BeforeInstallPromptEvent;
      setIsInstallable(true);

      const dismissed = localStorage.getItem("pwa-banner-dismissed") === "true";
      if (!isStandalone && !dismissed) {
        setShowInstallBanner(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallBanner(false);
      window.deferredPrompt = undefined;
    };

    // Listen to custom event dispatched by early loader script
    const handleCustomInstallable = () => {
      setIsInstallable(true);
      const dismissed = localStorage.getItem("pwa-banner-dismissed") === "true";
      if (!isStandalone && !dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("pwa-installable", handleCustomInstallable);

    // 4. Service Worker Handling: register service worker in both development and production
    if ("serviceWorker" in navigator) {
      const registerSW = () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("ServiceWorker registration successful with scope: ", registration.scope);
          },
          (err) => {
            console.log("ServiceWorker registration failed: ", err);
          }
        );
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("pwa-installable", handleCustomInstallable);
    };
  }, [isInstalled]);

  const installApp = async () => {
    const promptEvent = window.deferredPrompt;
    if (!promptEvent) {
      console.warn("PWA installation prompt not available.");
      return false;
    }

    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      
      // The event can only be used once, so clear it
      window.deferredPrompt = undefined;
      setIsInstallable(false);
      setShowInstallBanner(false);
      
      return outcome === "accepted";
    } catch (err) {
      console.error("Error during PWA installation: ", err);
      return false;
    }
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem("pwa-banner-dismissed", "true");
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isInstalled,
        showInstallBanner,
        installApp,
        dismissInstallBanner,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

export function usePWAInstall() {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error("usePWAInstall must be used within a PWAProvider");
  }
  return context;
}
