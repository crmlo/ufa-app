"use client";

import BoxBreathingModal from "./BoxBreathingModal";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function BoxBreathing({ open, onClose }: Props) {
  if (!open) return null;
  return <BoxBreathingModal onClose={onClose} />;
}

