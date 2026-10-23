"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  Check,
  CircleHelp,
  Files,
  LayoutDashboard,
  UserRound,
  UsersRound,
  X
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/lib/access";
import styles from "./platform-tutorial.module.css";

type TutorialRole = "mentor" | "mentee";

type TutorialStep = {
  title: string;
  description: string;
  hint: string;
  href: string;
  area: string;
  selector: string;
  icon: LucideIcon;
};

type TargetRect = {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
};

const tutorials: Record<TutorialRole, TutorialStep[]> = {
  mentor: [
    {
      title: "Este é o seu ponto de partida",
      description: "O painel resume mentorias, planos, sessões e notificações. Os atalhos destacados levam direto ao trabalho do dia.",
      hint: "Você pode clicar em qualquer atalho enquanto o tour estiver aberto.",
      href: "/app",
      area: "Painel",
      selector: '[data-tour="dashboard-actions"]',
      icon: LayoutDashboard
    },
    {
      title: "Gerencie cada mentorado",
      description: "Aqui você aceita solicitações, envia convites e abre os planos de uma pessoa clicando no mentorado.",
      hint: "Clique em um mentorado para ir aos planos já com a pessoa selecionada.",
      href: "/app/relationships",
      area: "Mentorados",
      selector: '[data-tour="relationships-workspace"]',
      icon: UsersRound
    },
    {
      title: "Monte a trilha da mentoria",
      description: "Selecione o mentorado, crie o plano e registre objetivo, tópicos, período e progresso.",
      hint: "Os botões Novo plano e Editar ficam disponíveis nesta própria área.",
      href: "/app/plans",
      area: "Planos",
      selector: '[data-tour="plans-workspace"]',
      icon: BookOpenCheck
    },
    {
      title: "Navegue pela agenda semanal",
      description: "A semana real fica visível aqui. Use as setas para avançar ou voltar e o botão Hoje para retornar à semana atual.",
      hint: "Experimente os controles do calendário agora, sem fechar o tutorial.",
      href: "/app/calendar",
      area: "Calendário",
      selector: '[data-tour="weekly-calendar"]',
      icon: CalendarDays
    },
    {
      title: "Crie sua biblioteca",
      description: "Adicione materiais por link ou arquivo, edite os itens existentes e organize o que será usado nas mentorias.",
      hint: "Use Novo material para testar o fluxo de criação.",
      href: "/app/materials",
      area: "Materiais",
      selector: '[data-tour="materials-workspace"]',
      icon: Files
    },
    {
      title: "Finalize o seu perfil",
      description: "Configure sua disponibilidade para deixar claro quando os encontros podem acontecer. Defina também o limite de mentorados para não receber novas relações acima da sua capacidade de acompanhamento.",
      hint: "Essas configurações mantêm sua agenda viável e garantem atenção de qualidade para cada mentorado.",
      href: "/app/profile",
      area: "Perfil",
      selector: '[data-tour="profile-editor"]',
      icon: UserRound
    }
  ],
  mentee: [
    {
      title: "Este é o seu ponto de partida",
      description: "O painel mostra sua mentoria, o plano atual, os próximos encontros e os caminhos mais usados.",
      hint: "Você pode clicar em qualquer atalho enquanto o tour estiver aberto.",
      href: "/app",
      area: "Painel",
      selector: '[data-tour="dashboard-actions"]',
      icon: LayoutDashboard
    },
    {
      title: "Encontre e acompanhe seu mentor",
      description: "Nesta área você busca mentores, envia solicitações e acompanha a relação de mentoria ativa.",
      hint: "Confira especialidades e disponibilidade antes de solicitar uma mentoria.",
      href: "/app/relationships",
      area: "Minha mentoria",
      selector: '[data-tour="relationships-workspace"]',
      icon: UsersRound
    },
    {
      title: "Acompanhe o seu plano",
      description: "Objetivo, tópicos, período e progresso ficam reunidos aqui para orientar os próximos passos.",
      hint: "Use os tópicos e o progresso para se preparar para a próxima sessão.",
      href: "/app/plans",
      area: "Meu plano",
      selector: '[data-tour="plans-workspace"]',
      icon: BookOpenCheck
    },
    {
      title: "Consulte seus encontros",
      description: "A visão semanal mostra sessões futuras e permite navegar pelas semanas da sua mentoria.",
      hint: "Experimente as setas ou o botão Hoje sem sair do tutorial.",
      href: "/app/calendar",
      area: "Calendário",
      selector: '[data-tour="weekly-calendar"]',
      icon: CalendarDays
    },
    {
      title: "Abra os materiais compartilhados",
      description: "Sua biblioteca reúne os conteúdos que o mentor disponibilizou para a jornada.",
      hint: "Links e arquivos podem ser abertos diretamente pelos cartões.",
      href: "/app/materials",
      area: "Materiais",
      selector: '[data-tour="materials-workspace"]',
      icon: Files
    },
    {
      title: "Mantenha o seu perfil completo",
      description: "Interesses e horários disponíveis ajudam o mentor a entender seus objetivos e combinar encontros.",
      hint: "Revise a disponibilidade sempre que sua rotina mudar.",
      href: "/app/profile",
      area: "Perfil",
      selector: '[data-tour="profile-editor"]',
      icon: UserRound
    }
  ]
};

function tutorialKey(userId: string, role: TutorialRole) {
  return `nossamentoria:tutorial:v2:${userId}:${role}`;
}

function accountTutorialRole(activeRole?: UserRole | null): TutorialRole | null {
  if (activeRole === "mentor" || activeRole === "mentee") return activeRole;
  return null;
}

function pathStepIndex(steps: TutorialStep[], pathname: string) {
  return steps.findIndex((step) => pathname === step.href || (step.href !== "/app" && pathname.startsWith(`${step.href}/`)));
}

function stepForPath(steps: TutorialStep[], pathname: string) {
  const index = pathStepIndex(steps, pathname);
  return index >= 0 ? index : 0;
}

function sameRect(current: TargetRect | null, next: TargetRect) {
  return current !== null
    && Math.abs(current.top - next.top) < 1
    && Math.abs(current.left - next.left) < 1
    && Math.abs(current.width - next.width) < 1
    && Math.abs(current.height - next.height) < 1;
}

export function PlatformTutorial({ userId, activeRole }: { userId: string; activeRole?: UserRole | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const accountRole = accountTutorialRole(activeRole);
  const [role, setRole] = useState<TutorialRole>(() => accountTutorialRole(activeRole) ?? "mentor");
  const [stepIndex, setStepIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [viewport, setViewport] = useState({ width: 1440, height: 900 });
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const requestedPathRef = useRef<string | null>(null);
  const prefetchedRoutesRef = useRef(new Set<string>());
  const steps = tutorials[role];
  const step = steps[stepIndex] ?? steps[0];
  const StepIcon = step.icon;

  const finishTutorial = useCallback(() => {
    localStorage.setItem(tutorialKey(userId, role), "seen");
    requestedPathRef.current = null;
    setOpen(false);
    setTargetRect(null);
    window.setTimeout(() => previousFocusRef.current?.focus(), 0);
  }, [role, userId]);

  const startTutorial = useCallback(() => {
    if (!accountRole) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    setRole(accountRole);
    setStepIndex(stepForPath(tutorials[accountRole], pathname));
    requestedPathRef.current = null;
    setOpen(true);
  }, [accountRole, pathname]);

  useEffect(() => {
    const nextRole = accountTutorialRole(activeRole);
    if (!nextRole) {
      setOpen(false);
      setTargetRect(null);
      return;
    }

    setRole(nextRole);
    setStepIndex(0);

    if ((activeRole === "mentor" || activeRole === "mentee") && !localStorage.getItem(tutorialKey(userId, nextRole))) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      requestedPathRef.current = tutorials[nextRole][0].href;
      setOpen(true);
    }
  }, [activeRole, userId]);

  useEffect(() => {
    if (!open) return;

    const nextRoutes = [
      ...steps.slice(stepIndex + 1),
      ...steps.slice(0, stepIndex)
    ].filter((item) => item.href !== pathname && !prefetchedRoutesRef.current.has(item.href));
    const timers = nextRoutes.map((item, index) => window.setTimeout(() => {
      prefetchedRoutesRef.current.add(item.href);
      router.prefetch(item.href);
    }, index === 0 ? 0 : 180 + index * 140));

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [open, pathname, router, stepIndex, steps]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finishTutorial();
      if (event.key === "ArrowRight" && event.altKey) {
        event.preventDefault();
        setStepIndex((current) => {
          const next = Math.min(steps.length - 1, current + 1);
          requestedPathRef.current = steps[next].href;
          return next;
        });
      }
      if (event.key === "ArrowLeft" && event.altKey) {
        event.preventDefault();
        setStepIndex((current) => {
          const next = Math.max(0, current - 1);
          requestedPathRef.current = steps[next].href;
          return next;
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [finishTutorial, open, steps.length]);

  useEffect(() => {
    if (!open) return;

    if (requestedPathRef.current === pathname) {
      requestedPathRef.current = null;
      return;
    }

    const navigatedStep = pathStepIndex(steps, pathname);
    if (requestedPathRef.current === null && navigatedStep >= 0 && navigatedStep !== stepIndex) {
      setStepIndex(navigatedStep);
    }
  }, [open, pathname, stepIndex, steps]);

  useEffect(() => {
    if (!open) return;

    if (pathname !== step.href) {
      const navigatedStep = pathStepIndex(steps, pathname);
      if (requestedPathRef.current === null && navigatedStep >= 0) return;

      setTargetRect(null);
      requestedPathRef.current = step.href;
      router.push(step.href, { scroll: false });
      return;
    }

    let disposed = false;
    let attempts = 0;
    let retryTimer: number | undefined;
    let observer: ResizeObserver | undefined;
    let target: HTMLElement | null = null;

    const measure = () => {
      if (!target || disposed) return;
      const rect = target.getBoundingClientRect();
      const next = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom
      };
      setTargetRect((current) => sameRect(current, next) ? current : next);
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    const findTarget = () => {
      if (disposed) return;
      target = document.querySelector<HTMLElement>(step.selector)
        ?? document.querySelector<HTMLElement>(`[data-tour-route="${step.href}"]`)
        ?? document.querySelector<HTMLElement>("main");

      if (!target && attempts < 20) {
        attempts += 1;
        retryTimer = window.setTimeout(findTarget, 100);
        return;
      }

      if (!target) return;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center", inline: "nearest" });
      window.requestAnimationFrame(measure);
      retryTimer = window.setTimeout(measure, reducedMotion ? 0 : 380);
      observer = new ResizeObserver(measure);
      observer.observe(target);
    };

    findTarget();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);

    return () => {
      disposed = true;
      if (retryTimer) window.clearTimeout(retryTimer);
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, pathname, router, step.href, step.selector, steps]);

  const coachmarkStyle = useMemo<CSSProperties>(() => {
    if (!targetRect) return { top: 74, right: 18 };

    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;
    const style: CSSProperties = targetCenterX > viewport.width / 2 ? { left: 18 } : { right: 18 };

    if (targetCenterY > viewport.height / 2) style.top = 76;
    else style.bottom = 18;

    return style;
  }, [targetRect, viewport]);

  function goToStep(index: number) {
    requestedPathRef.current = steps[index].href;
    setStepIndex(index);
  }

  function nextStep() {
    if (stepIndex === steps.length - 1) {
      finishTutorial();
      return;
    }
    goToStep(stepIndex + 1);
  }

  const spotlightStyle = useMemo<CSSProperties | undefined>(() => {
    if (!targetRect) return undefined;

    const left = Math.max(8, Math.min(targetRect.left - 7, viewport.width - 32));
    const top = Math.max(8, Math.min(targetRect.top - 7, viewport.height - 32));
    const right = Math.min(targetRect.right + 7, viewport.width - 8);
    const bottom = Math.min(targetRect.bottom + 7, viewport.height - 8);

    return {
      top,
      left,
      width: Math.max(24, right - left),
      height: Math.max(24, bottom - top)
    };
  }, [targetRect, viewport]);

  if (!accountRole) return null;

  const tutorialLayer = open ? createPortal(
    <>
      {spotlightStyle ? <div className={styles.spotlight} aria-hidden="true" style={spotlightStyle} /> : null}

      <section className={styles.coachmark} style={coachmarkStyle} role="dialog" aria-labelledby="tutorial-title" aria-describedby="tutorial-description">
        <div className={styles.coachHeader}>
          <span className={styles.stepIcon}><StepIcon size={18} /></span>
          <div>
            <span>{role === "mentor" ? "Tour para mentor" : "Tour para mentorado"}</span>
            <strong>{step.area}</strong>
          </div>
          <button className={styles.closeButton} type="button" onClick={finishTutorial} aria-label="Fechar tutorial"><X size={17} /></button>
        </div>

        <div className={styles.progress} aria-label={`Passo ${stepIndex + 1} de ${steps.length}`}>
          {steps.map((item, index) => (
            <button
              className={index === stepIndex ? styles.progressActive : index < stepIndex ? styles.progressDone : ""}
              type="button"
              onClick={() => goToStep(index)}
              aria-label={`Ir para ${item.area}`}
              aria-current={index === stepIndex ? "step" : undefined}
              key={item.href}
            />
          ))}
        </div>

        <div className={styles.coachContent}>
          <span className={styles.counter}>Passo {stepIndex + 1} de {steps.length}</span>
          <h2 id="tutorial-title">{step.title}</h2>
          <p id="tutorial-description">{step.description}</p>
          <div className={styles.hint}><CircleHelp size={15} /><span>{step.hint}</span></div>
        </div>

        <footer className={styles.actions}>
          <button className={styles.skipButton} type="button" onClick={finishTutorial}>Encerrar</button>
          <div>
            <button className={styles.backButton} type="button" onClick={() => goToStep(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0} aria-label="Etapa anterior"><ArrowLeft size={16} /></button>
            <button className={styles.nextButton} type="button" onClick={nextStep}>
              {stepIndex === steps.length - 1 ? <><span>Concluir</span><Check size={16} /></> : <><span>Próximo</span><ArrowRight size={16} /></>}
            </button>
          </div>
        </footer>
      </section>
    </>,
    document.body
  ) : null;

  return (
    <div className={styles.helpWrap}>
      <button
        className={[styles.helpButton, open ? styles.helpButtonActive : ""].join(" ")}
        type="button"
        onClick={startTutorial}
        aria-label="Abrir tutorial da plataforma"
        title="Tutorial"
      >
        <CircleHelp size={18} />
      </button>

      {tutorialLayer}
    </div>
  );
}
