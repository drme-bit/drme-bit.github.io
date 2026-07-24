'use client';

import SectionTitle from '@/shared/ui/molecules/SectionTitle/SectionTitle';
import ScrollStages from '../components/stages/ScrollStages';
import StageWhyMe from '../components/stages/StageWhyMe';
import StageWhyContact from '../components/stages/StageWhyContact';
import StageContactMe from '../components/stages/StageContactMe';
import styles from './Contacts.module.scss';

export default function Contacts() {
  return (
    <section id="contact" className={styles.section}>
      <SectionTitle title="contact" accent="_" visible />

      <ScrollStages>
        <StageWhyMe />
        <StageWhyContact />
        <StageContactMe />
      </ScrollStages>
    </section>
  );
}
