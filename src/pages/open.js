import React, { useEffect } from 'react';
import SubPageLayout from '../layouts/subpage-layout';

async function getStats() {
  const resp = await fetch('/api/stats');
  return resp.json();
}
export default function Terms() {
  return <SubPageLayout />;
}
