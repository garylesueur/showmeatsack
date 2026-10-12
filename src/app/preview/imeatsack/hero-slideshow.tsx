"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import styles from "./preview.module.css";

type Scene = {
  name: string;
  image: string;
  alt: string;
  handoff: string;
};

function subscribeReducedMotion(onChange: () => void) {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  preference.addEventListener("change", onChange);
  return () => preference.removeEventListener("change", onChange);
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

export function HeroSlideshow({ scenes }: { scenes: Scene[] }) {
  const [active, setActive] = useState(() =>
    Math.max(
      0,
      scenes.findIndex((scene) => scene.name === "Show"),
    ),
  );
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
  const pageHidden = useSyncExternalStore(
    subscribeVisibility,
    () => document.hidden,
    () => false,
  );

  useEffect(() => {
    if (!playing || hovered || focusPaused || reducedMotion || pageHidden) return;
    const timer = window.setInterval(() => {
      setActive((previous) => (previous + 1) % scenes.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [playing, hovered, focusPaused, reducedMotion, pageHidden, scenes.length]);

  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- These handlers pause rotation; the region itself has no interactive action.
    <section
      className={styles.heroSlideshow}
      aria-label="Ask, Share and Show illustrations"
      aria-roledescription="carousel"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocusPaused(true)}
    >
      <div className={styles.heroArt}>
        {scenes.map((scene, index) => (
          <div
            key={scene.name}
            className={`${styles.heroSlide} ${index === active ? styles.heroSlideActive : ""}`}
            aria-hidden={index !== active}
          >
            <Image
              src={scene.image}
              alt={scene.alt}
              fill
              priority={scene.name === "Show"}
              loading={scene.name === "Show" ? undefined : "eager"}
              sizes="(min-width: 1024px) 520px, (min-width: 768px) 50vw, calc(100vw - 48px)"
            />
          </div>
        ))}
      </div>
      <p className={styles.heroCaption} aria-live={playing && !reducedMotion ? "off" : "polite"}>
        {scenes[active].handoff}
      </p>
      <div className={styles.heroControls}>
        <fieldset className={styles.sceneButtons}>
          <legend className="sr-only">Choose a hero scene</legend>
          {scenes.map((scene, index) => (
            <button
              key={scene.name}
              type="button"
              aria-label={`${scene.name} scene`}
              aria-pressed={index === active}
              onClick={() => {
                setActive(index);
                setPlaying(false);
              }}
            >
              {scene.name}
            </button>
          ))}
        </fieldset>
        {!reducedMotion ? (
          <button
            type="button"
            aria-label={playing ? "Pause slideshow" : "Play slideshow"}
            onClick={() => {
              setFocusPaused(false);
              setPlaying((previous) => !previous);
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              {playing ? <path d="M4 3h3v10H4zm5 0h3v10H9z" /> : <path d="m5 2 8 6-8 6z" />}
            </svg>
            {playing ? "Pause" : "Play"}
          </button>
        ) : null}
      </div>
    </section>
  );
}
