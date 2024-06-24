import React from 'react';
import Counts from '@/components/ui/Counts';
import { BusinessImpact } from '@/sections/overview/BusinessImpact';
import { Conclusion } from '@/sections/overview/Conclusion';
import { Findings } from '@/sections/overview/Findings';
import { NewFeatures } from '@/sections/overview/NewFeatures';
import { Recommendations } from '@/sections/overview/Recommendations';

export const Overview = () => {
  const client_short = 'Acme Corp.';
  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <Counts
        stats={{
          seeds: 100,
          assets: 300,
          risks: 50,
        }}
        type="overview"
      />

      <div className="flex space-x-6">
        {/* Left Column: New Features */}
        <div className="w-1/4">
          <NewFeatures />
        </div>

        {/* Center Column: Main Report Information */}
        <div className="w-3/4">
          <Findings />
          <Recommendations client_short={client_short} />
          <BusinessImpact />
          <Conclusion />
        </div>
      </div>
    </div>
  );
};
