"use client";

import LearnerProfile from "@/components/learner-profile";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <LearnerProfile />
    </ProtectedRoute>
  );
}
