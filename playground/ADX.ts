export interface ADXResult {
    adx: number[];
    plusDI: number[];
    minusDI: number[];
    reversal: boolean[];
}

function change(src: number[]): number[] {
    const out = new Array(src.length).fill(NaN);

    for (let i = 1; i < src.length; i++) {
        out[i] = src[i] - src[i - 1];
    }

    return out;
}

function trueRange(
    high: number[],
    low: number[],
    close: number[]
): number[] {
    const tr = new Array(high.length);

    tr[0] = high[0] - low[0];

    for (let i = 1; i < high.length; i++) {
        const hl = high[i] - low[i];
        const hc = Math.abs(high[i] - close[i - 1]);
        const lc = Math.abs(low[i] - close[i - 1]);

        tr[i] = Math.max(hl, hc, lc);
    }

    return tr;
}

/**
 * Pine ta.rma()
 * Exact implementation.
 */
function rma(src: number[], length: number): number[] {
    const out = new Array(src.length).fill(NaN);

    let sum = 0;
    let count = 0;

    for (let i = 0; i < src.length; i++) {
        const v = src[i];

        if (!Number.isFinite(v)) {
            continue;
        }

        if (count < length) {
            sum += v;
            count++;

            if (count === length) {
                out[i] = sum / length;
            }

            continue;
        }

        out[i] =
            (out[i - 1] * (length - 1) + v) /
            length;
    }

    return out;
}

function directionalMovement(
    high: number[],
    low: number[],
    close: number[],
    length: number
) {
    const upMove = change(high);
    const downMove = change(low).map(v => -v);

    const plusDM = new Array(high.length).fill(0);
    const minusDM = new Array(high.length).fill(0);

    for (let i = 1; i < high.length; i++) {
        plusDM[i] =
            upMove[i] > downMove[i] && upMove[i] > 0
                ? upMove[i]
                : 0;

        minusDM[i] =
            downMove[i] > upMove[i] && downMove[i] > 0
                ? downMove[i]
                : 0;
    }

    const tr = trueRange(high, low, close);

    const trRma = rma(tr, length);
    const plusRma = rma(plusDM, length);
    const minusRma = rma(minusDM, length);

    const plusDI = new Array(high.length).fill(NaN);
    const minusDI = new Array(high.length).fill(NaN);

    for (let i = 0; i < high.length; i++) {
        plusDI[i] = (100 * plusRma[i]) / trRma[i];
        minusDI[i] = (100 * minusRma[i]) / trRma[i];
    }

    return {
        plusDI,
        minusDI
    };
}

export function calculateADX(
    high: number[],
    low: number[],
    close: number[],
    diLength = 14,
    adxLength = 14,
    keyLevel = 23
): ADXResult {

    const { plusDI, minusDI } = directionalMovement(
        high,
        low,
        close,
        diLength
    );

    const dx = new Array(high.length).fill(NaN);

    for (let i = 0; i < high.length; i++) {
        const sum = plusDI[i] + minusDI[i];

        dx[i] =
            100 *
            Math.abs(plusDI[i] - minusDI[i]) /
            (sum === 0 ? 1 : sum);
    }

    const adx = rma(dx, adxLength);

    const reversal = new Array(high.length).fill(false);

    for (let i = 2; i < high.length; i++) {
        const rule1 = adx[i] < adx[i - 1];
        const rule2 = adx[i - 1] > adx[i - 2];
        const rule3 = adx[i - 1] > keyLevel;

        reversal[i] = rule1 && rule2 && rule3;
    }

    return {
        adx,
        plusDI,
        minusDI,
        reversal
    };
}


