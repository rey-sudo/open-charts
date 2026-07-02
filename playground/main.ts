import { createChart } from "../src/index";
import { ADXSeries } from "./indicators/ADXSeries";
import { CandleBubbleSeries } from "./indicators/CandleBubbleSeries";
import { SqueezeSeries } from "./indicators/SqueezeSeries";
import {
  generateCandleBubble,
  normalizeCandles,
} from "./indicators/generateCandles";

const fakeData = generateCandleBubble(500, {
  startPrice: 60_000,
  trend: 0.0002, // alcista
  volatility: 0.010,
});

let chart1 = createChart(document.getElementById("chart-left")!);

chart1.api.applyOptions({ legend: "Bitcoin/Tether USD · 4h" });

const candles1 = chart1.api.addSeries(CandleBubbleSeries);

candles1.setData(fakeData);

/** 
//const MAseries = chart.api.addSeries(MovingAverageSeries);

//MAseries.setData(normalizeCandles(fakeData));

let chart2 = createChart(document.getElementById("chart-right")!);

const candles2 = chart2.api.addSeries(CandlestickSeries);

candles2.setData(normalizeCandles(fakeData));
*/

//let indicatorLeft1 = createChart(document.getElementById("left-pane-1")!);

//const ADX1 = indicatorLeft1.api.addSeries(ADXSeries);

//ADX1.setData(normalizeCandles(fakeData));

//

//let indicatorLeft2 = createChart(document.getElementById("left-pane-2")!);

//const SQUEEZE = indicatorLeft2.api.addSeries(SqueezeSeries);

//SQUEEZE.setData(normalizeCandles(fakeData));
