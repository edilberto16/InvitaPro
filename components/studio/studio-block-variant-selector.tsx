"use client";

import type { StudioBlockVariant } from "@/lib/studio/block-registry";

type Props = {
  options: StudioBlockVariant[];
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
};

export default function StudioBlockVariantSelector({ options, value, onChange, compact = false }: Props) {
  if (!options.length) return null;

  if (compact) {
    return (
      <div className="studio-context-variants">
        <small>ESTILO DEL BLOQUE</small>
        <div>
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={value === option.value ? "active" : ""}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="studio-variant-panel">
      <div>
        <strong>Diseño de la sección</strong>
        <small>Elige cómo se presenta este bloque.</small>
      </div>
      <div className="studio-variant-options">
        {options.map((option) => (
          <button
            type="button"
            key={option.value}
            className={value === option.value ? "active" : ""}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
