import React from 'react';
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';

const SparklineChart = ({ data, color = '#3b82f6', height = 24, width = 100 }) => {
  if (!data || data.length === 0) return null;

  return (
    <Sparklines data={data} height={height} width={width} margin={2}>
      <SparklinesLine color={color} strokeWidth={1.5} style={{ fill: "none" }} />
      <SparklinesSpots size={1.5} style={{ fill: color }} />
    </Sparklines>
  );
};

export default SparklineChart;