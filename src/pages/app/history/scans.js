import React, { useState } from 'react';
import { useAsync } from '../../../utils/hooks';

import './scans.css';

async function fetchScanHistory() {
  const res = await fetch('/api/me/scans');
  return res.json();
}

export default function ScanHistory() {
  const { error, value: scans, loading } = useAsync(fetchScanHistory);
  return (
    <div className="scan-list">
      <ul />
    </div>
  );
}
