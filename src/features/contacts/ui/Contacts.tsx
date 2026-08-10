'use client';

import dynamic from 'next/dynamic';

const PremiumContacts = dynamic(() => import('@/features/contacts/ui/PremiumContacts').then(mod => mod.PremiumContacts), {
  ssr: false,
});

export default function Contacts() {
  return <PremiumContacts />;
}