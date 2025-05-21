import React from 'react';
import { useRouter } from 'next/router';
import RefereeForm from '../../../../components/forms/RefereeForm';

const EditRefereePage = () => {
  const router = useRouter();
  const { id } = router.query;
  if (!id) return null;
  return <RefereeForm mode="edit" refereeId={id} />;
};

export default EditRefereePage; 