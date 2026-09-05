import type { ReactNode } from 'react';
import { clamp } from '../lib/character';

export function Card({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="card">
      <div className="cardhead">
        <h3>{title}</h3>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

export function HealthBar({
  health,
  maxHealth,
  onChange,
}: {
  health: number;
  maxHealth: number;
  onChange: (v: number) => void;
}) {
  const slots = clamp(maxHealth, 1, 40);
  return (
    <div className="health-wrap">
      <div className="health-label">
        <span>Health</span>
        <b>
          {health} / {maxHealth}
        </b>
      </div>
      <div className="healthbar">
        {Array.from({ length: slots }, (_, i) => (
          <button
            key={i}
            className={`hp-slot${i < health ? ' filled' : ''}`}
            aria-label={`Set health to ${i + 1}`}
            onClick={() => onChange(i + 1 === health ? i : i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="buttonrow">
        <button onClick={() => onChange(clamp(health - 1, 0, maxHealth))}>- Damage</button>
        <button onClick={() => onChange(clamp(health + 1, 0, maxHealth))}>+ Heal</button>
        <button onClick={() => onChange(maxHealth)}>Full</button>
      </div>
    </div>
  );
}
