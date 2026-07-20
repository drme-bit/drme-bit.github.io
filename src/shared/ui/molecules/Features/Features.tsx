'use client';

import { Shield, Zap, Globe, Lock, Layers, Code2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import styles from './Features.module.scss';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Shield,
    title: 'Security-First Architecture',
    description: 'Building systems with security as a foundational principle, not an afterthought. From input validation to encryption at rest.',
  },
  {
    icon: Zap,
    title: 'Performance Optimization',
    description: 'Delivering blazing-fast experiences through code splitting, lazy loading, and efficient resource management.',
  },
  {
    icon: Globe,
    title: 'Full-Stack Expertise',
    description: 'End-to-end development from responsive frontends to scalable APIs, databases, and deployment pipelines.',
  },
  {
    icon: Lock,
    title: 'Scalable Solutions',
    description: 'Designing architecture that grows with your business, handling increased load without compromising performance.',
  },
  {
    icon: Layers,
    title: 'Clean Code Practices',
    description: 'Writing maintainable, well-documented code following SOLID principles and industry best practices.',
  },
  {
    icon: Code2,
    title: 'Modern Tech Stack',
    description: 'Leveraging React, TypeScript, Node.js, PostgreSQL, and cutting-edge tools to build robust applications.',
  },
];

export default function Features() {
  return (
    <section className={styles.featuresSection}>
      <div className={styles.featuresGrid}>
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Icon className={styles.icon} />
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
