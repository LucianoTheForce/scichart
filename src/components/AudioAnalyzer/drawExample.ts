import {
    EAutoRange,
    FastLineRenderableSeries,
    HeatmapColorMap,
    NumericAxis,
    NumberRange,
    SciChartSurface,
    UniformHeatmapDataSeries,
    UniformHeatmapRenderableSeries,
    XyDataSeries,
    LogarithmicAxis,
    FastMountainRenderableSeries,
    EllipsePointMarker,
    PaletteFactory,
    GradientParams,
    Point,
    TextAnnotation,
    EHorizontalAnchorPoint,
    EVerticalAnchorPoint,
    ECoordinateMode
} from "scichart";

import { AudioDataProvider } from "./AudioDataProvider";
import { Radix2FFT } from "./Radix2FFT";

export const divElementIdAudioChart = "sciChart1";
export const divElementIdFttChart = "sciChart2";
export const divElementIdChart3 = "sciChart3";

const AUDIO_STREAM_BUFFER_SIZE = 2048;

export const drawExample = async () => {
    const dataProvider = new AudioDataProvider();
    const bufferSize = dataProvider.bufferSize;
    const sampleRate = dataProvider.sampleRate;
    const fft = new Radix2FFT(bufferSize);
    const hzPerDataPoint = sampleRate / bufferSize;
    const fftSize = fft.fftSize;
    const fftCount = 200;

    let fftXValues: number[];
    let spectrogramValues: number[][];
    let audioDS: XyDataSeries;
    let historyDS: XyDataSeries;
    let fftDS: XyDataSeries;
    let spectrogramDS: UniformHeatmapDataSeries;

    const helpText = new TextAnnotation({
        x1: 0,
        y1: 0,
        xAxisId: "history",
        xCoordinateMode: ECoordinateMode.Relative,
        yCoordinateMode: ECoordinateMode.Relative,
        horizontalAnchorPoint: EHorizontalAnchorPoint.Left,
        verticalAnchorPoint: EVerticalAnchorPoint.Top,
        text: "This example requires microphone permissions. Please click Allow in the popup.",
        textColor: "#FFFFFF88"
    });

    function updateAnalysers() {
        if (dataProvider.initialized === false) {
            return;
        }

        const audioData = dataProvider.next();
        audioDS.appendRange(audioData.xData, audioData.yData);
        historyDS.appendRange(audioData.xData, audioData.yData);

        const fftData = fft.run(audioData.yData);
        fftDS.clear();
        fftDS.appendRange(fftXValues, fftData);

        spectrogramValues.shift();
        spectrogramValues.push(fftData);
        spectrogramDS.setZValues(spectrogramValues);
    }

    // AUDIO CHART
    const initAudioChart = async () => {
        const { sciChartSurface, wasmContext } = await SciChartSurface.create(divElementIdAudioChart);

        const xAxis = new NumericAxis(wasmContext, {
            id: "audio",
            autoRange: EAutoRange.Always,
            drawLabels: false,
            drawMinorTickLines: false,
            drawMajorTickLines: false,
            drawMajorBands: false,
            drawMinorGridLines: false,
            drawMajorGridLines: false
        });

        const xhistAxis = new NumericAxis(wasmContext, {
            id: "history",
            autoRange: EAutoRange.Always,
            drawLabels: false,
            drawMinorGridLines: false,
            drawMajorTickLines: false
        });

        const yAxis = new NumericAxis(wasmContext, {
            autoRange: EAutoRange.Never,
            visibleRange: new NumberRange(-32768 * 0.8, 32767 * 0.8),
            drawLabels: false,
            drawMinorTickLines: false,
            drawMajorTickLines: false,
            drawMajorBands: false,
            drawMinorGridLines: false,
            drawMajorGridLines: false
        });

        sciChartSurface.xAxes.add(xAxis);
        sciChartSurface.xAxes.add(xhistAxis);
        sciChartSurface.yAxes.add(yAxis);

        audioDS = new XyDataSeries(wasmContext, { fifoCapacity: AUDIO_STREAM_BUFFER_SIZE });
        for (let i = 0; i < AUDIO_STREAM_BUFFER_SIZE; i++) {
            audioDS.append(0, 0);
        }

        const rs = new FastLineRenderableSeries(wasmContext, {
            xAxisId: "audio",
            stroke: "#4FBEE6",
            strokeThickness: 2,
            dataSeries: audioDS
        });

        sciChartSurface.renderableSeries.add(rs);

        historyDS = new XyDataSeries(wasmContext, { fifoCapacity: AUDIO_STREAM_BUFFER_SIZE * fftCount });
        for (let i = 0; i < AUDIO_STREAM_BUFFER_SIZE * fftCount; i++) {
            historyDS.append(0, 0);
        }

        const histrs = new FastLineRenderableSeries(wasmContext, {
            stroke: "#208EAD33",
            strokeThickness: 1,
            opacity: 0.5,
            xAxisId: "history",
            dataSeries: historyDS
        });

        sciChartSurface.renderableSeries.add(histrs);
        sciChartSurface.annotations.add(helpText);

        return sciChartSurface;
    };

    // FFT CHART
    const initFftChart = async () => {
        const { sciChartSurface, wasmContext } = await SciChartSurface.create(divElementIdFttChart);

        const xAxis = new LogarithmicAxis(wasmContext, {
            logBase: 10,
            drawMinorGridLines: false,
            drawMinorTickLines: false,
            drawMajorTickLines: false
        });

        const yAxis = new NumericAxis(wasmContext, {
            visibleRange: new NumberRange(0, 80),
            drawMinorGridLines: false,
            drawMinorTickLines: false,
            drawMajorTickLines: false
        });

        sciChartSurface.xAxes.add(xAxis);
        sciChartSurface.yAxes.add(yAxis);

        fftDS = new XyDataSeries(wasmContext);
        fftXValues = new Array<number>(fftSize);
        for (let i = 0; i < fftSize; i++) {
            fftXValues[i] = (i + 1) * hzPerDataPoint;
        }

        const rs = new FastMountainRenderableSeries(wasmContext, {
            dataSeries: fftDS,
            pointMarker: new EllipsePointMarker(wasmContext, { width: 9, height: 9 }),
            strokeThickness: 3,
            paletteProvider: PaletteFactory.createGradient(
                wasmContext,
                new GradientParams(new Point(0, 0), new Point(1, 1), [
                    { offset: 0, color: "#36B8E6" },
                    { offset: 0.001, color: "#5D8CC2" },
                    { offset: 0.01, color: "#8166A2" },
                    { offset: 0.1, color: "#AE418C" },
                    { offset: 1.0, color: "#CA5B79" }
                ]),
                {
                    enableStroke: true,
                    enableFill: true,
                    enablePointMarkers: true,
                    fillOpacity: 0.17,
                    pointMarkerOpacity: 0.37
                }
            )
        });

        sciChartSurface.renderableSeries.add(rs);
        return sciChartSurface;
    };

    // SPECTROGRAM CHART
    const initSpectrogramChart = async () => {
        spectrogramValues = new Array<number[]>(fftCount);
        for (let i = 0; i < fftCount; i++) {
            spectrogramValues[i] = new Array<number>(fftSize).fill(0);
        }

        const { sciChartSurface, wasmContext } = await SciChartSurface.create(divElementIdChart3);

        const xAxis = new NumericAxis(wasmContext, {
            autoRange: EAutoRange.Always,
            drawLabels: false,
            drawMinorTickLines: false,
            drawMajorTickLines: false
        });

        const yAxis = new NumericAxis(wasmContext, {
            autoRange: EAutoRange.Always,
            drawLabels: false,
            drawMinorTickLines: false,
            drawMajorTickLines: false
        });

        sciChartSurface.xAxes.add(xAxis);
        sciChartSurface.yAxes.add(yAxis);

        spectrogramDS = new UniformHeatmapDataSeries(wasmContext, {
            xStart: 0,
            xStep: 1,
            yStart: 0,
            yStep: 1,
            zValues: spectrogramValues
        });

        const rs = new UniformHeatmapRenderableSeries(wasmContext, {
            dataSeries: spectrogramDS,
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

        sciChartSurface.renderableSeries.add(rs);
        return sciChartSurface;
    };

    const charts = await Promise.all([initAudioChart(), initFftChart(), initSpectrogramChart()]);

    const hasAudio = await dataProvider.initAudio();
    if (!hasAudio) {
        if (dataProvider.permissionError) {
            helpText.text = "We were not able to access your microphone. This may be because you did not accept the permissions. Open your browser security settings and remove the block on microphone permissions from this site, then reload the page.";
        } else if (!window.isSecureContext) {
            helpText.text = "Cannot get microphone access if the site is not localhost or on https";
        } else {
            helpText.text = "There was an error trying to get microphone access. Check the console";
        }
    } else {
        helpText.text = "This example uses your microphone to generate waveforms. Say something!";

        const updateChart = () => {
            if (!dataProvider.isDeleted) {
                updateAnalysers();
                requestAnimationFrame(updateChart);
            }
        };
        updateChart();
    }

    return { charts, dataProvider };
};