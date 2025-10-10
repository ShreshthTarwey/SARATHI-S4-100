"use client";

import CommunicationInterface from "@/components/communication-interface";
import ProtectedRoute from "@/components/ProtectedRoute";
import BrailleInput from "@/components/BrailleInput";

export default function CommunicationPage() {
  return (
    <ProtectedRoute>
      <CommunicationInterface />
    </ProtectedRoute>
  );
}
