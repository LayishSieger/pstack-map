"use client";

import { useState } from "react";
import { compare } from "@/catalog";
import type { ChoiceId } from "@/data/decide";
import { cn } from "cn";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function Decide() {
  const { choices, columns, jobs } = compare();
  const [choiceId, setChoiceId] = useState<ChoiceId>("hybrid");
  const choice = choices.find((item) => item.id === choiceId) ?? choices[2];

  return (
    <div className="flex flex-col gap-6 p-4 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain">
      <header className="flex max-w-3xl flex-col gap-2">
        <p className="font-mono text-sm text-mark">compare</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Which flow</h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Pstack is one sticky router that picks a playbook. Pocock is a set of small commands you invoke, and a
          user-invoked skill does not call another user-invoked skill. Pick one owner per phase. Two builders on the
          same ticket fight.
        </p>
      </header>

      <div className="grid gap-2 md:grid-cols-3">
        {choices.map((item) => {
          const active = item.id === choice.id;
          return (
            <button key={item.id} type="button" onClick={() => setChoiceId(item.id)} className="text-left">
              <Card className={cn("h-full", active && "ring-2 ring-mark")}>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription className="leading-relaxed">{item.when}</CardDescription>
                </CardHeader>
              </Card>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Run this</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-3">
              {choice.steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm leading-relaxed">
                  <span className="font-mono text-mark">0{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Leave these out</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {choice.drop.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <section className="flex flex-col gap-3 pb-4">
        <h2 className="text-sm font-medium">Same job, both packs</h2>
        <ul className="grid gap-3 md:hidden">
          {jobs.map((row) => (
            <li key={row.job}>
              <Card size="sm">
                <CardHeader>
                  <CardTitle>{row.job}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm leading-relaxed">
                  {columns.map((column) => (
                    <p key={column.id}>
                      <span className="text-muted-foreground">{column.label}. </span>
                      <SkillNames skills={row.packs[column.id]} />
                    </p>
                  ))}
                  <p>
                    <span className="text-muted-foreground">Keep. </span>
                    {row.keep}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10 md:block">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Job</th>
                {columns.map((column) => (
                  <th key={column.id} className="px-3 py-2 font-medium">
                    {column.label}
                  </th>
                ))}
                <th className="px-3 py-2 font-medium">Keep</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((row) => (
                <tr key={row.job} className="border-t border-border align-top">
                  <td className="px-3 py-2 font-medium">{row.job}</td>
                  {columns.map((column) => (
                    <td key={column.id} className="px-3 py-2 text-muted-foreground">
                      <SkillNames skills={row.packs[column.id]} />
                    </td>
                  ))}
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

function SkillNames({ skills }: { skills: readonly { id: string; title: string }[] }) {
  return skills.map((skill, index) => (
    <span key={skill.id}>
      {index > 0 ? ", " : null}
      <a href={`/skills/${skill.id}`} className="text-foreground underline-offset-4 hover:underline">
        {skill.title}
      </a>
    </span>
  ));
}
