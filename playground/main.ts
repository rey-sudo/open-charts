import { createChart } from "../src/index";
import { CandlestickSeries } from "./CandlestickSeries";
import { MovingAverageSeries } from "./MovingAverageSeries";

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

let container = document.getElementById("chart-area");

let chart = createChart(container!);

const candles = chart.api.addSeries(CandlestickSeries);

candles.setData(normalizeCandles(fakeData));

//const MAseries = chart.api.addSeries(MovingAverageSeries);

//MAseries.setData(normalizeCandles(fakeData));
