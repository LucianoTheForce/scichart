import { SciChartSurface, ISciChartTheme } from 'scichart';
import { NumericAxis } from "scichart/Charting/Visuals/Axis/NumericAxis";
import { XyDataSeries } from "scichart/Charting/Model/XyDataSeries";
import { FastLineRenderableSeries } from "scichart/Charting/Visuals/RenderableSeries/FastLineRenderableSeries";
import { NumberRange } from "scichart/Core/NumberRange";

interface AudioChartProps {
    containerRef: React.RefObject<HTMLDivElement>;
    bufferSize: number;
    theme: ISciChartTheme;
}

export const initAudioChart = async ({ containerRef, bufferSize, theme }: AudioChartProps) => {
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
        autoRange: false,
        visibleRange: new NumberRange(-32768 * 0.8, 32767 * 0.8),
        drawLabels: false,
        drawMinorGridLines: false,
        drawMajorGridLines: false
    });

    sciChartSurface.xAxes.add(xAxis);
    sciChartSurface.yAxes.add(yAxis);

    const dataSeries = new XyDataSeries(wasmContext, { fifoCapacity: bufferSize });
    const renderSeries = new FastLineRenderableSeries(wasmContext, {
        stroke: "#4FBEE6",
        strokeThickness: 2,
        dataSeries
    });

    sciChartSurface.renderableSeries.add(renderSeries);

    return sciChartSurface;
};