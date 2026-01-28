import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getColorCodes } from '../components/CommonComponents/colorCodes';
import { RootState } from '../slices/reducer';

const useChartColors = (dataset: { chartColors: string; chartDarkColors: string }) => {
  const [chartColors, setChartColors] = useState<string[]>([]);
  const { layoutDataColor, layoutMode } = useSelector((state: RootState) => state.Layout);

  // Memoize the dataset to avoid unnecessary re-renders
  const stableDataset = useMemo(() => ({
    chartColors: dataset.chartColors,
    chartDarkColors: dataset.chartDarkColors
  }), [dataset.chartColors, dataset.chartDarkColors]);

  useEffect(() => {
    const colors = getColorCodes(stableDataset);
    setChartColors(colors);

  }, [layoutDataColor, stableDataset, layoutMode]);

  return chartColors;
};

export default useChartColors;


