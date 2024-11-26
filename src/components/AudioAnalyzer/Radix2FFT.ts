export class Radix2FFT {
    public readonly fftSize: number;

    private n: number;
    private m: number;
    private mm1: number;
    private x: { re: number; im: number }[];
    private dft: { re: number; im: number }[];
    private TwoPi_N: number;
    private WN = { re: 0, im: 0 };
    private TEMP = { re: 0, im: 0 };

    constructor(n: number) {
        this.n = n;
        this.m = Math.round(Math.log(n) / Math.log(2));

        if (Math.pow(2, this.m) !== n) {
            throw new Error("n should be with power of 2");
        }

        this.fftSize = n / 2;
        this.TwoPi_N = (Math.PI * 2) / n;
        this.mm1 = this.m - 1;

        this.x = new Array(n).fill(null).map(() => ({ re: 0, im: 0 }));
        this.dft = new Array(n).fill(null).map(() => ({ re: 0, im: 0 }));
    }

    public run(input: number[]) {
        if (input.length !== this.n) {
            throw new Error("Length of the input array should match n");
        }

        for (let i = 0; i < this.n; i++) {
            this.x[i].re = input[i];
            this.x[i].im = 0;
        }

        this.rad2FFT(this.x, this.dft);

        const output = Array(this.fftSize);
        for (let i = 0; i < this.fftSize; i++) {
            output[i] = this.calculateOutputValue(this.dft[i]);
        }

        return output;
    }

    private calculateOutputValue(complex: { re: number; im: number }) {
        const magnitude = Math.sqrt(complex.re * complex.re + complex.im * complex.im);
        return 20 * Math.log10(magnitude / this.n);
    }

    private rad2FFT(x: { re: number; im: number }[], DFT: { re: number; im: number }[]) {
        for (let i = 0; i < this.n; i++) {
            let ii = 0;
            let iaddr = i;
            
            for (let l = 0; l < this.m; l++) {
                if ((iaddr & 0x01) !== 0) {
                    ii += 1 << (this.mm1 - l);
                }
                iaddr >>= 1;
                if (iaddr === 0) break;
            }

            DFT[ii].re = x[i].re;
            DFT[ii].im = x[i].im;
        }

        for (let stage = 1; stage <= this.m; stage++) {
            const BSep = Math.pow(2, stage);
            const P = this.n / BSep;
            const BWidth = BSep / 2;

            for (let j = 0; j < BWidth; j++) {
                if (j !== 0) {
                    this.WN.re = Math.cos(this.TwoPi_N * P * j);
                    this.WN.im = -Math.sin(this.TwoPi_N * P * j);
                }

                for (let HiIndex = j; HiIndex < this.n; HiIndex += BSep) {
                    const pHi = DFT[HiIndex];
                    const pLo = DFT[HiIndex + BWidth];

                    if (j !== 0) {
                        this.TEMP.re = pLo.re * this.WN.re - pLo.im * this.WN.im;
                        this.TEMP.im = pLo.re * this.WN.im + pLo.im * this.WN.re;
                    } else {
                        this.TEMP.re = pLo.re;
                        this.TEMP.im = pLo.im;
                    }

                    pLo.re = pHi.re - this.TEMP.re;
                    pLo.im = pHi.im - this.TEMP.im;
                    pHi.re = pHi.re + this.TEMP.re;
                    pHi.im = pHi.im + this.TEMP.im;
                }
            }
        }
    }
}