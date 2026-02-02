import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DataModule from '../ui/screens/DataModule.jsx';
import RatiosModule from '../ui/screens/RatiosModule.jsx';
import ForecastModule from '../ui/screens/ForecastModule.jsx';
import DcfModule from '../ui/screens/DcfModule.jsx';
import LboModule from '../ui/screens/LboModule.jsx';
import CompsModule from '../ui/screens/CompsModule.jsx';
import MaModule from '../ui/screens/MaModule.jsx';
import CapitalModule from '../ui/screens/CapitalModule.jsx';

export default function AppRouter(props) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/data" replace />} />
      <Route path="/data" element={<DataModule {...props} />} />
      <Route path="/ratios" element={<RatiosModule {...props} />} />
      <Route path="/forecast" element={<ForecastModule {...props} />} />
      <Route path="/dcf" element={<DcfModule {...props} />} />
      <Route path="/lbo" element={<LboModule {...props} />} />
      <Route path="/comps" element={<CompsModule {...props} />} />
      <Route path="/ma" element={<MaModule {...props} />} />
      <Route path="/capital" element={<CapitalModule {...props} />} />
    </Routes>
  );
}
