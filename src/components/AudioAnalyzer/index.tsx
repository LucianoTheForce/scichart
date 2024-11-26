import React, { useEffect } from 'react';
import { SciChartSurface } from 'scichart';
import { drawExample } from './drawExample';
import './styles.css';

export default function AudioAnalyzer() {
  const divElementIdAudioChart = "sciChart1";
  const divElementIdFttChart = "sciChart2";
  const divElementIdChart3 = "sciChart3";

  useEffect(() => {
    let chartsRef: any;
    let dataProviderRef: any;

    const initCharts = async () => {
      try {
        // Initialize SciChart with the correct WASM location
        await SciChartSurface.loadWasmFromCDN({
          wasmLocation: "/assets/scichart2d.wasm",
          dataUrl: "/assets/scichart2d.data"
        });

        const result = await drawExample();
        chartsRef = result.charts;
        dataProviderRef = result.dataProvider;
      } catch (error) {
        console.error("Failed to initialize SciChart:", error);
      }
    };

    initCharts();

    return () => {
      if (chartsRef) {
        chartsRef.forEach((c: any) => c.delete());
      }
      if (dataProviderRef) {
        dataProviderRef.closeAudio();
      }
    };
  }, []);

  return (
    <div className="ChartWrapper">
      <div className="ChartGrid">
        <div id={divElementIdAudioChart} />
        <div className="ChartRow">
          <div id={divElementIdFttChart} />
          <div id={divElementIdChart3} />
        </div>
      </div>
    </div>
  );
}