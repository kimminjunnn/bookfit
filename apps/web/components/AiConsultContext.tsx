"use client";

import React, { createContext, useContext, useState } from "react";

interface AiConsultContextType {
  isModalOpen: boolean;
  prefillText: string;
  autoSubmit: boolean;
  openModal: (prefill?: any, autoSubmit?: boolean) => void;
  closeModal: () => void;
}

const AiConsultContext = createContext<AiConsultContextType | undefined>(undefined);

export function AiConsultProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefillText, setPrefillText] = useState("");
  const [autoSubmit, setAutoSubmit] = useState(false);

  const openModal = (prefill?: any, auto?: boolean) => {
    setPrefillText(typeof prefill === "string" ? prefill : "");
    setAutoSubmit(!!auto);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setAutoSubmit(false);
  };

  return (
    <AiConsultContext.Provider value={{ isModalOpen, prefillText, autoSubmit, openModal, closeModal }}>
      {children}
    </AiConsultContext.Provider>
  );
}

export function useAiConsult() {
  const context = useContext(AiConsultContext);
  if (!context) {
    throw new Error("useAiConsult must be used within an AiConsultProvider");
  }
  return context;
}
