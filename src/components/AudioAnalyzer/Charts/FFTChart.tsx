import { SciChartSurface, ISciChartTheme } from 'scichart';
import { LogarithmicAxis } from "scichart/Charting/Visuals/Axis/LogarithmicAxis";
import { NumericAxis } from "scichart/Charting/Visuals/Axis/NumericAxis";
import { XyDataSeries } from "scichart/Charting/Model/XyDataSeries";
import { FastMountainRenderableSeries } from "scichart/Charting/Visuals/RenderableSeries/FastMountainRenderableSeries";
import { EllipsePointMarker } from "scichart/Charting/Visuals/PointMarkers/EllipsePointMarker";
import { NumberRange } from "scichart/Core/NumberRange";
import { Point } from "scichart/Core/Point";
import { PaletteFactory } from "scichart/Core/PaletteProvider";
import { GradientParams } from "scichart/Core/PaletteProvider";

interface FFTChartProps {
    containerRef: React.RefObject<HTMLDivElement>;
    theme: ISciChartTheme;
}

export const initFFTChart = async ({ containerRef, theme }: FFTChartProps) => {
    const { sciChartSurface, wasmContext } = await SciChartSurface.create(containerRef.current, {
        theme
    });

    const xAxis = new LogarithmicAxis(wasmContext, {
        logBase: 10,
        maxAutoTicks: 5,
        drawMinorGridLines: false,
        drawMajorGridLines: false
    });

    const yAxis = new NumericAxis(wasmContext, {
        visibleRange: new NumberRange(0, 80),
        drawMinorGridLines: false,
        drawMajorGridLines: false
    });

    sciChartSurface.xAxes.add(xAxis);
    sciChartSurface.yAxes.add(yAxis);

    const dataSeries = new XyDataSeries(wasmContext);
    const renderSeries = new FastMountainRenderableSeries(wasmContext, {
        dataSeries,
        strokeThickness: 3,
        pointMarker: new EllipsePointMarker(wasmContext, { width: 7, height: 7 }),
        paletteProvider: PaletteFactory.createGradient(
            wasmContext,
            new GradientParams(new Point(0, 0), new Point(1, 1), [
                { offset: 0, color: "#36B8E6" },
                { offset: 0.5, color: "#8166A2" },
                { offset: 1, color: "#CA5B79" }
            ]),
            {
                strokeOpacity: 1,
                fillOpacity: 0.3,
                enableFill: true,
                enableStroke: true
            }
        )
    });

    sciChartSurface.renderableSeries.add(renderSeries);

    return sciChartSurface;
};