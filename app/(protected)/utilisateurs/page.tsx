'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { UsersPageContent } from '@/components/users/users-page-content';

export default function UsersPage() {
  return (
      <MainLayout>
        <UsersPageContent />
      </MainLayout>
  );
}
