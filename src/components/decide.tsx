"use client";

import { useState } from "react";
import { choices, jobs, type ChoiceId } from "@/data/decide";

export function Decide() {
  const [choiceId, setChoiceId] = useState<ChoiceId>("hybrid");
  const choice = choices.find((item) => item.id === choiceId) ?? choices[2];

  return (
    <div>
      <header className="mb-6 max-w-3xl">
        <p className="font-mono text-sm text-mark">compare</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Which flow</h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Pstack is one sticky router that picks a playbook. Pocock is a set of small commands you invoke, and a
          user-invoked skill does not call another user-invoked skill. Pick one owner per phase. Two builders on the
          same ticket fight.
        </p>
      </header>

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        {choices.map((item) => {
          const active = item.id === choice.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setChoiceId(item.id)}
              className={`min-h-11 rounded-card border p-3 text-left ${
                active ? "border-mark bg-raised" : "border-line bg-surface"
              }`}
            >
              <span className="block font-medium">{item.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted">{item.when}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-card border border-line bg-surface p-4">
          <h2 className="text-sm font-medium">Run this</h2>
          <ol className="mt-3 space-y-3">
            {choice.steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-relaxed">
                <span className="font-mono text-mark">0{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
        <section className="rounded-card border border-line bg-surface p-4">
          <h2 className="text-sm font-medium">Leave these out</h2>
          <ul className="mt-3 space-y-3">
            {choice.drop.map((item) => (
              <li key={item} className="text-sm leading-relaxed text-muted">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-medium">Same job, both packs</h2>
        <div className="mt-3 overflow-x-auto rounded-card border border-line">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-surface text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Job</th>
                <th className="px-3 py-2 font-medium">Pstack</th>
                <th className="px-3 py-2 font-medium">Pocock</th>
                <th className="px-3 py-2 font-medium">Keep</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((row) => (
                <tr key={row.job} className="border-t border-line">
                  <td className="px-3 py-2 font-medium">{row.job}</td>
                  <td className="px-3 py-2 text-muted">{row.pstack}</td>
                  <td className="px-3 py-2 text-muted">{row.pocock}</td>
                  <td className="px-3 py-2">{row.keep}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
