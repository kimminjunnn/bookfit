"use client";

import React, { createContext, useContext, useState } from "react";

interface AiConsultContextType {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const AiConsultContext = createContext<AiConsultContextType | undefined>(undefined);

export function AiConsultProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <AiConsultContext.Provider value={{ isModalOpen, openModal, closeModal }}>
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
