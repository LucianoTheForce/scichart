import { SciChartSurface, ISciChartTheme } from 'scichart';
import { NumericAxis } from "scichart/Charting/Visuals/Axis/NumericAxis";
import { UniformHeatmapDataSeries } from "scichart/Charting/Model/UniformHeatmapDataSeries";
import { UniformHeatmapRenderableSeries } from "scichart/Charting/Visuals/RenderableSeries/UniformHeatmapRenderableSeries";
import { HeatmapColorMap } from "scichart/Charting/Visuals/RenderableSeries/HeatmapColorMap";

interface SpectrogramChartProps {
    containerRef: React.RefObject<HTMLDivElement>;
    fftCount: number;
    fftSize: number;
    theme: ISciChartTheme;
}

export const initSpectrogramChart = async ({ containerRef, fftCount, fftSize, theme }: SpectrogramChartProps) => {
    const { sciChartSurface, wasmContext } = await SciChartSurface.create(containerRef.current, {
        theme
    });

    const xAxis = new NumericAxis(wasmContext, {
        autoRange: true,
        drawLabels: false,
        drawMinorGridLines: false,
        drawMajorGridLines: false
    });

    const yAxis = new NumericAxis(wasmContext, {
        autoRange: true,
        drawLabels: false,
        drawMinorGridLines: false,
        drawMajorGridLines: false
    });

    sciChartSurface.xAxes.add(xAxis);
    sciChartSurface.yAxes.add(yAxis);

    const spectrogramValues = Array(fftCount).fill(null).map(() => Array(fftSize).fill(0));
    const dataSeries = new UniformHeatmapDataSeries(wasmContext, {
        xStart: 0,
        xStep: 1,
        yStart: 0,
        yStep: 1,
        zValues: spectrogramValues
    });

    const renderSeries = new UniformHeatmapRenderableSeries(wasmContext, {
        dataSeries,
        colorMap: new HeatmapColorMap({
            minimum: 0,
            maximum: 70,
            gradientStops: [
                { offset: 0, color: "#000000" },
                { offset: 0.25, color: "#800080" },
                { offset: 0.5, color: "#FF0000" },
                { offset: 0.75, color: "#FFFF00" },
                { offset: 1, color: "#FFFFFF" }
            ]
        })
    });

    sciChartSurface.renderableSeries.add(renderSeries);

    return sciChartSurface;
};