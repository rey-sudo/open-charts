export type CandleBubble = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time: number;

  start_ts: number;
  end_ts: number;

  buy_qty: number;
  sell_qty: number;

  delta_pct: number;
  signal: number;

  bubble_color: "green" | "red" | "gray";
  bubble_size: number;
  show_bubble: boolean;
};

export function generateCandleBubble(
  count: number,
  {
    startPrice = 63332,
    startTs = Date.now(),
    intervalMs = 30 * 60 * 1000,
    trend = 0.0001,
    volatility = 0.002,
  } = {},
): CandleBubble[] {
  const candles: CandleBubble[] = [];

  let lastClose = startPrice;

  // Estado para la EMA y el flujo de órdenes
  let lastSignal = 0;
  let orderFlowBias = 0;

  const SPAN = 20;
  const ALPHA = 2 / (SPAN + 1);
  const THRESHOLD = 0.15;

  for (let i = 0; i < count; i++) {
    const open = lastClose;

    // Movimiento principal
    const randomMove = (Math.random() - 0.5) * volatility;
    const close = open * (1 + trend + randomMove);

    // Mechas
    const bodySize = Math.abs(close - open);

    const high =
      Math.max(open, close) + bodySize * Math.random() + open * 0.0003;

    const low =
      Math.min(open, close) - bodySize * Math.random() - open * 0.0003;

    // Volumen
    const volume = 5 + bodySize * 0.5 + Math.random() * 10;

    const start_ts = startTs + i * intervalMs;

    // -----------------------------------------------------------------
    // Simulación de order flow con persistencia (más parecido al mercado)
    // -----------------------------------------------------------------

    orderFlowBias += (Math.random() - 0.5) * 0.08;
    orderFlowBias = Math.max(-0.9, Math.min(0.9, orderFlowBias));

    const totalQty = Math.floor(200 + Math.random() * 300);

    const buy_qty = Math.round(totalQty * (0.5 + orderFlowBias / 2));
    const sell_qty = totalQty - buy_qty;

    // 1. Delta normalizado
    const delta_pct =
      totalQty === 0 ? 0 : (buy_qty - sell_qty) / totalQty;

    // 2. EMA(span=20, adjust=False)
    const signal =
      i === 0
        ? delta_pct
        : ALPHA * delta_pct + (1 - ALPHA) * lastSignal;

    lastSignal = signal;

    // 3. Filtro de ruido
    const show_bubble = Math.abs(signal) > THRESHOLD;

    // 4. Color
    const bubble_color = !show_bubble
      ? "gray"
      : signal > 0
        ? "green"
        : "red";

    // 5. Tamaño
    const bubble_size = show_bubble
      ? +(10 + 40 * Math.abs(signal)).toFixed(2)
      : 0;

    candles.push({
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume: +volume.toFixed(5),

      start_ts,
      end_ts: start_ts + intervalMs,
      time: Math.floor(start_ts / 1000),

      buy_qty,
      sell_qty,

      delta_pct: +delta_pct.toFixed(3),
      signal: +signal.toFixed(3),

      show_bubble,
      bubble_color,
      bubble_size,
    });

    lastClose = close;
  }

  return candles;
}

export function generateCandlesNormal(
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

export function normalizeCandles(candles: any) {
  return candles.map((candle: any) => ({
    time: Math.floor(candle.start_ts / 1000), // timestamp en segundos
    open: Number(candle.open),
    high: Number(candle.high),
    low: Number(candle.low),
    close: Number(candle.close),
    volume: Number(candle.volume),
  }));
}

export function normalizeCandle(candle: any) {
  return {
    t: Math.floor(candle.start_ts / 1000), // timestamp en segundos
    o: Number(candle.open),
    h: Number(candle.high),
    l: Number(candle.low),
    c: Number(candle.close),
    v: Number(candle.volume),
  };
}
