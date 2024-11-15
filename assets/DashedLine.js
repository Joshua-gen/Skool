// DashedLine.js
import React from 'react';
import { Svg, Line } from 'react-native-svg';

const DashedLine = ({ color = 'black', width = '100%', height = 1, dashArray = [4, 2] }) => {
  return (
    <Svg height={height} width={width}>
      <Line
        x1="0"
        y1="0"
        x2="100%"
        y2="0"
        stroke={color}
        strokeWidth={height}
        strokeDasharray={dashArray.join(',')}
      />
    </Svg>
  );
};

export default DashedLine;
