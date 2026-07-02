"use client";

import React, { createContext, useContext, useState } from "react";

interface AiConsultContextType {
  isModalOpen: boolean;
  prefillText: string;
  openModal: (prefill?: string) => void;
  closeModal: () => void;
}

const AiConsultContext = createContext<AiConsultContextType | undefined>(undefined);

export function AiConsultProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefillText, setPrefillText] = useState("");

  const openModal = (prefill?: string) => {
    setPrefillText(prefill ?? "");
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  return (
    <AiConsultContext.Provider value={{ isModalOpen, prefillText, openModal, closeModal }}>
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
