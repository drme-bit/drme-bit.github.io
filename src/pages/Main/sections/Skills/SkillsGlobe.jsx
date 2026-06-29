import { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  SiReact, SiTypescript, SiJavascript, SiHtml5, SiSass,
  SiThreedotjs, SiNodedotjs, SiPython, SiGo, SiRust,
  SiPostgresql, SiRedis, SiGit, SiDocker,
  SiWebassembly, SiOpengl, SiLinux,
} from 'react-icons/si';
import { DiJava } from 'react-icons/di';
import { FiCode, FiCpu } from 'react-icons/fi';

import './SkillsGlobe.scss';

const ACCENT = '#5ec8d8';
const GROUP_COLORS = {
  frontend: '#5ec8d8',
  backend: '#d8a85e',
  tools: '#a85ed8',
};

const ICON_MAP = {
  React: SiReact, TypeScript: SiTypescript, JavaScript: SiJavascript,
  'HTML/CSS': SiHtml5, SCSS: SiSass, 'Three.js': SiThreedotjs,
  R3F: FiCode, 'Node.js': SiNodedotjs, Python: SiPython,
  Go: SiGo, Rust: SiRust, Java: DiJava,
  PostgreSQL: SiPostgresql, Redis: SiRedis,
  Git: SiGit, Docker: SiDocker,
  WebGPU: FiCode, WASM: SiWebassembly,
  CUDA: FiCpu, OpenGL: SiOpengl, Linux: SiLinux,
  C: FiCode, 'C++': FiCode, 'C#': FiCode, Luau: FiCode,
};

const SKILLS_DATA = [
  { name: 'React', group: 'frontend', desc: 'Component-driven UIs with hooks, context, and state machines.' },
  { name: 'TypeScript', group: 'frontend', desc: 'Type-safe JavaScript for maintainable large-scale apps.' },
  { name: 'JavaScript', group: 'frontend', desc: 'Core language of the web — ES6+ features and async patterns.' },
  { name: 'HTML/CSS', group: 'frontend', desc: 'Semantic markup, responsive layouts, and modern CSS.' },
  { name: 'SCSS', group: 'frontend', desc: 'SASS-powered stylesheets with variables, mixins, and nesting.' },
  { name: 'Three.js', group: 'frontend', desc: 'WebGL 3D rendering, shaders, and interactive scenes.' },
  { name: 'R3F', group: 'frontend', desc: 'React-three-fiber — declarative Three.js in React.' },
  { name: 'C/C++', group: 'frontend', desc: 'Systems programming and performance-critical applications.' },
  { name: 'C#', group: 'frontend', desc: 'Modern, type-safe language for Windows and cross-platform development.' },
  { name: 'Node.js', group: 'backend', desc: 'Server-side JS runtime for APIs and tooling.' },
  { name: 'Python', group: 'backend', desc: 'Scripting, automation, and backend services.' },
  { name: 'Go', group: 'backend', desc: 'Performant, concurrent systems and CLI tools.' },
  { name: 'Rust', group: 'backend', desc: 'Memory-safe systems programming with zero-cost abstractions.' },
  { name: 'Java', group: 'backend', desc: 'Enterprise-grade applications and Android development.' },
  { name: 'PostgreSQL', group: 'backend', desc: 'Relational databases with advanced querying.' },
  { name: 'Redis', group: 'backend', desc: 'In-memory caching and pub/sub messaging.' },
  { name: 'Luau', group: 'backend', desc: 'Scripting language for Roblox game development.' },
  { name: 'Git', group: 'tools', desc: 'Version control and collaborative development workflows.' },
  { name: 'Docker', group: 'tools', desc: 'Containerized deployment and reproducible environments.' },
  { name: 'WebGPU', group: 'tools', desc: 'Next-gen GPU compute and rendering API.' },
  { name: 'CUDA', group: 'tools', desc: 'Parallel GPU computing for ML and simulation.' },
  { name: 'OpenGL', group: 'tools', desc: 'Cross-platform 2D/3D graphics API.' },
  { name: 'Linux', group: 'tools', desc: 'Daily driver OS — shell, containers, and servers.' },
];

function fibonacciSphere(index, total, radius) {
  const phi = Math.acos(1 - 2 * (index + 0.5) / total);
  const theta = Math.PI * (1 + Math.sqrt(5)) * (index + 0.5);
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
  );
}

function SkillDot({ position, skill, isSelected, color, onSelect }) {
  const Icon = ICON_MAP[skill.name] || FiCode;

  return (
    <Html position={position} center distanceFactor={8} occlude={false}>
      <button
        className={`globe-skill${isSelected ? ' is-selected' : ''}`}
        style={{
          '--dot-color': color,
          color: isSelected ? color : 'rgba(255,255,255,0.25)',
        }}
        onClick={(e) => { e.stopPropagation(); onSelect(skill); }}
      >
        <Icon className="globe-skill-icon" style={{ color: isSelected ? color : 'rgba(255,255,255,0.25)' }} />
        <span className="globe-skill-label" style={{ color: isSelected ? color : 'rgba(255,255,255,0.25)' }}>
          {skill.name}
        </span>
      </button>
    </Html>
  );
}

function GlobeParticles({ count = 300 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.5 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.03;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={ACCENT} size={0.025} transparent opacity={0.25} sizeAttenuation />
    </points>
  );
}

function ConnectingLines({ skills, radius }) {
  const positions = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < skills.length; i++) {
      for (let j = i + 1; j < skills.length; j++) {
        if (skills[i].group === skills[j].group && Math.random() < 0.3) {
          const p1 = fibonacciSphere(i, skills.length, radius);
          const p2 = fibonacciSphere(j, skills.length, radius);
          pairs.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
        }
      }
    }
    return new Float32Array(pairs);
  }, [skills, radius]);

  if (positions.length === 0) return null;

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={ACCENT} transparent opacity={0.06} />
    </lineSegments>
  );
}

function GlobeContent({ selected, onSelect }) {
  const groupRef = useRef();
  const controlsRef = useRef();
  const resumeTimer = useRef(null);
  const radius = 1.5;

  const pauseAutoRotate = useCallback(() => {
    if (controlsRef.current) controlsRef.current.autoRotate = false;
    clearTimeout(resumeTimer.current);
  }, []);

  const resumeAutoRotate = useCallback(() => {
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      if (controlsRef.current) controlsRef.current.autoRotate = true;
    }, 3000);
  }, []);

  useFrame(() => {
    controlsRef.current?.update();
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[6, 4, 6]} intensity={0.5} />

      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.35}
        rotateSpeed={0.6}
        onStart={pauseAutoRotate}
        onEnd={resumeAutoRotate}
      />

      <group ref={groupRef}>
        <mesh>
          <sphereGeometry args={[radius, 36, 24]} />
          <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.08} />
        </mesh>

        <mesh>
          <sphereGeometry args={[radius * 0.97, 18, 12]} />
          <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.04} />
        </mesh>

        <ConnectingLines skills={SKILLS_DATA} radius={radius} />
        <GlobeParticles />

        {SKILLS_DATA.map((skill, i) => {
          const pos = fibonacciSphere(i, SKILLS_DATA.length, radius * 1.25);
          return (
            <SkillDot
              key={skill.name}
              position={pos}
              skill={skill}
              color={GROUP_COLORS[skill.group]}
              isSelected={selected?.name === skill.name}
              onSelect={onSelect}
            />
          );
        })}
      </group>
    </>
  );
}

export default function SkillsGlobe({ selected, onSelect }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 35, near: 0.1, far: 20 }}
      gl={{ alpha: true, antialias: true }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }}
      style={{
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        overflow: 'visible',
      }}
    >
      <GlobeContent selected={selected} onSelect={onSelect} />
    </Canvas>
  );
}
