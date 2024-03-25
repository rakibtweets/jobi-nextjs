import React from 'react';
import SavedCandidateArea from '@/app/components/dashboard/employ/saved-candidate-area';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { getSavedCandidates } from '@/lib/actions/employee.action';
import { getUserById } from '@/lib/actions/user.action';
import { SearchParamsProps } from '@/types';

const EmployDashboardSavedCandidatePage = async ({searchParams}:SearchParamsProps) => {
  const user = await currentUser();
  if (!user || user.privateMetadata.role !== 'employee') {
    return redirect('/');
  }

  const loggedInUser = await getUserById({ userId: user.id });

  const { candidates } = await getSavedCandidates({
    clerkId: user.id as string,
    query: searchParams.query,
  });

  return (
    <>
      {/* saved candidate area start */}
      <SavedCandidateArea loggedInUser={loggedInUser} candidates={candidates} />
      {/* saved candidate area end */}
    </>
  );
};

export default EmployDashboardSavedCandidatePage;
