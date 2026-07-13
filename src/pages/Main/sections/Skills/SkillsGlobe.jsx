import { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  SiReact, SiTypescript, SiJavascript, SiHtml5, SiSass,
  SiThreedotjs, SiNodedotjs, SiPython, SiGo, SiRust,
  SiPostgresql, SiRedis, SiGit, SiDocker,
  SiOpengl, SiLinux,
} from 'react-icons/si';
import { DiJava } from 'react-icons/di';
import { FiCode, FiCpu } from 'react-icons/fi';

import './SkillsGlobe.scss';

const ACCENT = '#e8e4df';
const GROUP_COLORS = {
  frontend: '#e8e4df',
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
  WebGPU: FiCode,
  CUDA: FiCpu, OpenGL: SiOpengl, Linux: SiLinux,
  C: FiCode, 'C++': FiCode, 'C#': FiCode, Luau: FiCode,
};

const SKILLS_DATA = [
  { name: 'React', group: 'frontend', level: 4, desc: 'Component-driven UIs with hooks, context, and state machines.', related: ['TypeScript', 'JavaScript', 'R3F'], projects: ['drme-bit.github.io', 'nexagon'] },
  { name: 'TypeScript', group: 'frontend', level: 4, desc: 'Type-safe JavaScript for maintainable large-scale apps.', related: ['React', 'JavaScript', 'Node.js'], projects: ['drme-bit.github.io', 'roblox-systems'] },
  { name: 'JavaScript', group: 'frontend', level: 5, desc: 'Core language of the web — ES6+ features and async patterns.', related: ['TypeScript', 'React', 'Node.js'], projects: ['drme-bit.github.io'] },
  { name: 'HTML/CSS', group: 'frontend', level: 5, desc: 'Semantic markup, responsive layouts, and modern CSS.', related: ['SCSS'], projects: ['drme-bit.github.io'] },
  { name: 'SCSS', group: 'frontend', level: 4, desc: 'SASS-powered stylesheets with variables, mixins, and nesting.', related: ['HTML/CSS'], projects: ['drme-bit.github.io'] },
  { name: 'Three.js', group: 'frontend', level: 3, desc: 'WebGL 3D rendering, shaders, and interactive scenes.', related: ['R3F', 'WebGPU', 'JavaScript'], projects: ['drme-bit.github.io'] },
  { name: 'R3F', group: 'frontend', level: 3, desc: 'React-three-fiber — declarative Three.js in React.', related: ['Three.js', 'React'], projects: ['drme-bit.github.io'] },
  { name: 'C/C++', group: 'frontend', level: 2, desc: 'Systems programming and performance-critical applications.', related: ['C#'], projects: [] },
  { name: 'C#', group: 'frontend', level: 2, desc: 'Modern, type-safe language for Windows and cross-platform development.', related: ['C/C++'], projects: [] },
  { name: 'Node.js', group: 'backend', level: 4, desc: 'Server-side JS runtime for APIs and tooling.', related: ['TypeScript', 'JavaScript', 'PostgreSQL', 'Redis'], projects: ['nexagon'] },
  { name: 'Python', group: 'backend', level: 3, desc: 'Scripting, automation, and backend services.', related: ['Docker', 'Linux'], projects: [] },
  { name: 'Go', group: 'backend', level: 2, desc: 'Performant, concurrent systems and CLI tools.', related: ['Docker', 'Linux'], projects: [] },
  { name: 'Rust', group: 'backend', level: 2, desc: 'Memory-safe systems programming with zero-cost abstractions.', related: ['WebGPU', 'Linux'], projects: ['nexagon'] },
  { name: 'Java', group: 'backend', level: 3, desc: 'Enterprise-grade applications and Android development.', related: [], projects: [] },
  { name: 'PostgreSQL', group: 'backend', level: 3, desc: 'Relational databases with advanced querying.', related: ['Node.js', 'Redis'], projects: ['nexagon'] },
  { name: 'Redis', group: 'backend', level: 2, desc: 'In-memory caching and pub/sub messaging.', related: ['Node.js', 'PostgreSQL'], projects: [] },
  { name: 'Luau', group: 'backend', level: 4, desc: 'Scripting language for Roblox game development.', related: ['TypeScript'], projects: ['roblox-systems'] },
  { name: 'Git', group: 'tools', level: 4, desc: 'Version control and collaborative development workflows.', related: ['Linux'], projects: ['drme-bit.github.io', 'nexagon'] },
  { name: 'Docker', group: 'tools', level: 3, desc: 'Containerized deployment and reproducible environments.', related: ['Linux', 'Node.js'], projects: ['nexagon'] },
  { name: 'WebGPU', group: 'tools', level: 2, desc: 'Next-gen GPU compute and rendering API.', related: ['Rust', 'Three.js'], projects: ['nexagon'] },
  { name: 'CUDA', group: 'tools', level: 1, desc: 'Parallel GPU computing for ML and simulation.', related: ['C/C++'], projects: [] },
  { name: 'OpenGL', group: 'tools', level: 2, desc: 'Cross-platform 2D/3D graphics API.', related: ['C/C++', 'Three.js'], projects: [] },
  { name: 'Linux', group: 'tools', level: 4, desc: 'Daily driver OS — shell, containers, and servers.', related: ['Docker', 'Git', 'Node.js'], projects: ['nexagon'] },
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

/* ---------- glowing center core ---------- */
function GlowingCore() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 0.8) * 0.06;
      ref.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={ACCENT} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.08} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.03} />
      </mesh>
    </group>
  );
}

/* ---------- orbit ring ---------- */
function OrbitRing({ radius, tilt, phase = 0 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = tilt;
      ref.current.rotation.x = clock.elapsedTime * 0.06 + phase;
    }
  });

  return (
    <mesh ref={ref} rotation={[0, 0, tilt]}>
      <torusGeometry args={[radius, 0.005, 6, 96]} />
      <meshBasicMaterial color={ACCENT} transparent opacity={0.06} />
    </mesh>
  );
}

/* ---------- animated connections from selected skill to related ---------- */
function SelectedConnections({ selected, skills, radius }) {
  const lineRef = useRef();

  const positions = useMemo(() => {
    if (!selected) return null;
    const skill = skills.find(s => s.name === selected.name);
    if (!skill?.related?.length) return null;

    const selIdx = skills.findIndex(s => s.name === selected.name);
    const selPos = fibonacciSphere(selIdx, skills.length, radius * 1.25);

    const points = [];
    for (const relName of skill.related) {
      const relIdx = skills.findIndex(s => s.name === relName);
      if (relIdx === -1) continue;
      const relPos = fibonacciSphere(relIdx, skills.length, radius * 1.25);
      points.push([selPos.clone(), relPos.clone()]);
    }
    return points;
  }, [selected, skills, radius]);

  useFrame(({ clock }) => {
    if (!lineRef.current) return;
    const target = selected ? 0.35 : 0;
    lineRef.current.children.forEach((child, i) => {
      const mat = child.material;
      const to = positions ? 0.35 : 0;
      mat.opacity += (to - mat.opacity) * 0.04;
      mat.dashOffset = clock.elapsedTime * 0.3;
    });
  });

  if (!positions) return null;

  return (
    <group ref={lineRef}>
      {positions.map(([from, to], i) => {
        const mid = from.clone().add(to).multiplyScalar(0.5);
        const dir = to.clone().sub(from);
        const len = dir.length();
        const curve = new THREE.CatmullRomCurve3([
          from,
          mid.clone().add(new THREE.Vector3(0, len * 0.15, 0)),
          to,
        ]);
        const curvePoints = curve.getPoints(16);

        return (
          <mesh key={i} position={[0, 0, 0]}>
            <tubeGeometry args={[curve, 16, 0.004, 4, false]} />
            <meshBasicMaterial color={ACCENT} transparent opacity={0} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ---------- skill dot on globe ---------- */
function SkillDot({ position, skill, opacity, isSelected, isRelated, color, onSelect, depth }) {
  const Icon = ICON_MAP[skill.name] || FiCode;
  const scale = 0.7 + (depth + 1.5) / 3 * 0.6;

  return (
    <Html position={position} center distanceFactor={8} occlude={false}>
      <button
        className={`globe-skill${isSelected ? ' is-selected' : ''}${isRelated ? ' is-related' : ''}`}
        style={{
          '--dot-color': color,
          color: isSelected ? color : isRelated ? color : 'rgba(255,255,255,0.25)',
          opacity,
          transform: `scale(${scale})`,
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          pointerEvents: opacity < 0.3 ? 'none' : 'auto',
        }}
        onClick={(e) => { e.stopPropagation(); onSelect(skill); }}
      >
        <Icon className="globe-skill-icon" style={{ color: isSelected ? color : isRelated ? color : 'rgba(255,255,255,0.25)' }} />
        <span className="globe-skill-label" style={{ color: isSelected ? color : isRelated ? color : 'rgba(255,255,255,0.25)' }}>
          {skill.name}
        </span>
      </button>
    </Html>
  );
}

/* ---------- background particles ---------- */
function GlobeParticles({ count = 300 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.6 + Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.025;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={ACCENT} size={0.02} transparent opacity={0.2} sizeAttenuation />
    </points>
  );
}

/* ---------- background connecting lines ---------- */
function ConnectingLines({ skills, radius, selectedGroup }) {
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

  const opacity = selectedGroup ? 0.12 : 0.06;

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={ACCENT} transparent opacity={opacity} />
    </lineSegments>
  );
}

/* ---------- main globe content ---------- */
function GlobeContent({ selected, onSelect, filterGroup, searchQuery }) {
  const groupRef = useRef();
  const controlsRef = useRef();
  const resumeTimer = useRef(null);
  const icoRef = useRef();
  const radius = 1.5;

  const activeNames = useMemo(() => {
    let names = new Set(SKILLS_DATA.map(s => s.name));
    if (filterGroup) {
      names = new Set(SKILLS_DATA.filter(s => s.group === filterGroup).map(s => s.name));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      names = new Set([...SKILLS_DATA].filter(s => names.has(s.name) && s.name.toLowerCase().includes(q)).map(s => s.name));
    }
    return names;
  }, [filterGroup, searchQuery]);

  const relatedNames = useMemo(() => {
    if (!selected) return new Set();
    const skill = SKILLS_DATA.find(s => s.name === selected.name);
    return new Set(skill?.related || []);
  }, [selected]);

  const hasActiveFilter = filterGroup || searchQuery || selected;

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

  useFrame(({ clock }) => {
    controlsRef.current?.update();
    if (icoRef.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 0.4) * 0.005;
      icoRef.current.scale.set(s, s, s);
      icoRef.current.rotation.y = clock.elapsedTime * 0.02;
    }
    if (groupRef.current) {
      const t = clock.elapsedTime;
      groupRef.current.position.x = Math.sin(t * 0.15) * 0.12;
      groupRef.current.position.y = Math.sin(t * 0.1 + 1) * 0.08;
    }
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

      <group ref={groupRef} rotation={[0.1, 0.3, 0]}>
        {/* icosahedron wireframe */}
        <mesh ref={icoRef}>
          <icosahedronGeometry args={[radius, 1]} />
          <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.1} />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[radius * 0.97, 0]} />
          <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.05} />
        </mesh>

        {/* orbit rings */}
        <OrbitRing radius={radius * 1.6} tilt={0.3} phase={0} />
        <OrbitRing radius={radius * 1.8} tilt={-0.5} phase={2} />
        <OrbitRing radius={radius * 1.4} tilt={0.8} phase={4} />

        {/* core glow */}
        <GlowingCore />

        {/* connections */}
        <SelectedConnections selected={selected} skills={SKILLS_DATA} radius={radius} />
        <ConnectingLines skills={SKILLS_DATA} radius={radius} selectedGroup={selected?.group} />
        <GlobeParticles />

        {/* skill nodes */}
        {SKILLS_DATA.map((skill, i) => {
          const pos = fibonacciSphere(i, SKILLS_DATA.length, radius * 1.25);
          const isActive = activeNames.has(skill.name);
          const isRelated = selected && relatedNames.has(skill.name);
          const isSelected = selected?.name === skill.name;

          let opacity = 1;
          if (hasActiveFilter) {
            if (isSelected || isRelated) opacity = 1;
            else if (isActive) opacity = 0.7;
            else opacity = 0.12;
          }

          return (
            <SkillDot
              key={skill.name}
              position={pos}
              skill={skill}
              color={GROUP_COLORS[skill.group]}
              isSelected={isSelected}
              isRelated={isRelated}
              opacity={opacity}
              onSelect={onSelect}
              depth={pos.z}
            />
          );
        })}
      </group>
    </>
  );
}

export { SKILLS_DATA, GROUP_COLORS, ICON_MAP };

export default function SkillsGlobe({ selected, onSelect, filterGroup, searchQuery }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 35, near: 0.1, far: 20 }}
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }}
      onLost={(e) => e.preventDefault()}
      style={{
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
      }}
    >
      <GlobeContent selected={selected} onSelect={onSelect} filterGroup={filterGroup} searchQuery={searchQuery} />
    </Canvas>
  );
}
