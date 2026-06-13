"use client";

import { useState, useTransition } from "react";
import { updateDemande } from "@/app/admin/actions";

export default function DemandeStatusSelect({
  id,
  statut,
}: {
  id: number;
  statut: "new" | "in_progress" | "done";
}) {
  const [value, setValue] = useState(statut);
  const [pending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value as "new" | "in_progress" | "done";
    setValue(v);
    startTransition(async () => {
      await updateDemande(id, v);
    });
  }

  return (
    <select
      className={`adm-dem-select ${value}`}
      value={value}
      onChange={onChange}
      disabled={pending}
    >
      <option value="new">🔴 Nouveau</option>
      <option value="in_progress">🟡 En cours</option>
      <option value="done">🟢 Traité</option>
    </select>
  );
}
