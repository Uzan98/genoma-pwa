'use client';

import { useCallback } from 'react';
import { Particles } from '@tsparticles/react';
import { type Container, type Engine } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';

export function ParticlesBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    // console.log(container);
  }, []);

  return (
    <Particles
      id="tsparticles"
      className="absolute inset-0"
      particlesLoaded={particlesLoaded}
      options={{
        fpsLimit: 120,
        fullScreen: false,
        particles: {
          color: {
            value: ['#9333ea', '#3b82f6'],
          },
          move: {
            direction: 'none',
            enable: true,
            outModes: {
              default: 'bounce',
            },
            random: true,
            speed: 0.5,
            straight: false,
          },
          number: {
            value: 40,
            density: {
              enable: true,
            },
          },
          opacity: {
            value: 0.1,
          },
          shape: {
            type: 'circle',
          },
          size: {
            value: { min: 1, max: 5 },
          },
        },
        detectRetina: true,
      }}
    />
  );
} 