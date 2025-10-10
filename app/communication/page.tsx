"use client";

import CommunicationInterface from "@/components/communication-interface";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CommunicationPage() {
  return (
    <ProtectedRoute>
      <CommunicationInterface />
    </ProtectedRoute>
  );
}
