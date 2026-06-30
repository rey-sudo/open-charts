import { createChart } from "../src/index";
import { ADXSeries } from "./indicators/ADXSeries";
import { CandlestickSeries } from "./indicators/CandlestickSeries";

function generateCandles(
  count: number,
  {
    startPrice = 63332,
    startTs = Date.now(),
    intervalMs = 30 * 60 * 1000,
    trend = 0.0001, // tendencia promedio por vela
    volatility = 0.002, // volatilidad
  } = {},
) {
  const candles = [];

  let lastClose = startPrice;

  for (let i = 0; i < count; i++) {
    const open = lastClose;

    // movimiento principal
    const randomMove = (Math.random() - 0.5) * volatility;
    const close = open * (1 + trend + randomMove);

    // mechas proporcionales al movimiento
    const bodySize = Math.abs(close - open);

    const high =
      Math.max(open, close) + bodySize * Math.random() + open * 0.0003;

    const low =
      Math.min(open, close) - bodySize * Math.random() - open * 0.0003;

    // volumen correlacionado con el movimiento
    const volume = 5 + bodySize * 0.5 + Math.random() * 10;

    const start_ts = startTs + i * intervalMs;

    candles.push({
      open: open.toFixed(2),
      high: high.toFixed(2),
      low: low.toFixed(2),
      close: close.toFixed(2),
      volume: volume.toFixed(5),
      start_ts,
      end_ts: start_ts + intervalMs,
    });

    lastClose = close;
  }

  return candles;
}

function normalizeCandles(candles: any) {
  return candles.map((candle: any) => ({
    time: Math.floor(candle.start_ts / 1000), // timestamp en segundos
    open: Number(candle.open),
    high: Number(candle.high),
    low: Number(candle.low),
    close: Number(candle.close),
    volume: Number(candle.volume),
  }));
}

function normalizeCandle(candle: any) {
  return {
    t: Math.floor(candle.start_ts / 1000), // timestamp en segundos
    o: Number(candle.open),
    h: Number(candle.high),
    l: Number(candle.low),
    c: Number(candle.close),
    v: Number(candle.volume),
  };
}

const fakeData = generateCandles(500, {
  startPrice: 60_000,
  trend: 0.0002, // alcista
  volatility: 0.013,
});

let chart1 = createChart(document.getElementById("chart-left")!);

const candles1 = chart1.api.addSeries(CandlestickSeries);

candles1.setData(normalizeCandles(fakeData));
/** 
//const MAseries = chart.api.addSeries(MovingAverageSeries);

//MAseries.setData(normalizeCandles(fakeData));

let chart2 = createChart(document.getElementById("chart-right")!);

const candles2 = chart2.api.addSeries(CandlestickSeries);

candles2.setData(normalizeCandles(fakeData));
*/

let indicatorLeft1 = createChart(document.getElementById("left-pane-1")!);

const ADX1 = indicatorLeft1.api.addSeries(ADXSeries);

ADX1.setData(normalizeCandles(fakeData));
