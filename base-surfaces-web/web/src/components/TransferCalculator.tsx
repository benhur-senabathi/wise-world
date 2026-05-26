import { useState, useCallback, useMemo } from 'react';
import { Button, IconButton, ListItem, Modal } from '@transferwise/components';
import { NotificationActive, QuestionMarkCircle } from '@transferwise/icons';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { CurrencyInputGroup } from './CurrencyInputGroup';
import { useLanguage } from '../context/Language';
import { usdBaseRates } from '@shared/data/currency-rates';
import { useLiveRates } from '../context/LiveRates';
import { useShimmer } from '../context/Shimmer';
import { ShimmerTransferCalculator } from './Shimmer';

type RatePoint = { date: string; rate: number };

// Generate date labels for the last 25 days ending today
function generateDateLabels(): string[] {
  const labels: string[] = [];
  const today = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 24; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    labels.push(`${d.getDate()} ${months[d.getMonth()]}`);
  }
  labels.push('Today');
  return labels;
}

const dateLabels = generateDateLabels();

// Seeded PRNG for deterministic but varied output
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 4294967296;
  };
}

// Volatility profiles per currency (annual % expressed as daily factor)
const currencyVolatility: Record<string, number> = {
  AED: 0.001, ARS: 0.025, AUD: 0.006, BDT: 0.004, BRL: 0.012,
  CAD: 0.005, CHF: 0.005, CNY: 0.003, EUR: 0.005, GBP: 0.006,
  HUF: 0.008, IDR: 0.006, INR: 0.004, JPY: 0.007, MXN: 0.009,
  NGN: 0.015, PHP: 0.005, PLN: 0.007, SEK: 0.006, SGD: 0.003,
  THB: 0.004, TRY: 0.018, USD: 0.005, ZAR: 0.012,
};

function generateRateData(source: string, target: string, rates: Record<string, number> = usdBaseRates): RatePoint[] {
  const sourceUsd = rates[source] ?? 1;
  const targetUsd = rates[target] ?? 1;
  const baseRate = targetUsd / sourceUsd;

  // Create a seed from the currency pair string
  const seed = `${source}-${target}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const rng = seededRandom(Math.abs(hash));

  // Combined volatility of both currencies
  const vol = ((currencyVolatility[source] ?? 0.005) + (currencyVolatility[target] ?? 0.005)) * 0.7;

  // Generate a random walk (brownian motion) for natural-looking lines
  const points: RatePoint[] = [];
  let cumulative = 0;

  // Pick a random trend direction and magnitude per pair
  const trendPerDay = (rng() - 0.5) * vol * 0.4;
  // Pick a random mean-reversion speed
  const meanRevert = 0.02 + rng() * 0.06;

  for (let i = 0; i < dateLabels.length; i++) {
    // Box-Muller transform for normal distribution
    const u1 = rng() || 0.0001;
    const u2 = rng();
    const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

    // Random walk step with mean reversion and trend
    const step = normal * vol - cumulative * meanRevert + trendPerDay;
    cumulative += step;

    const rate = baseRate * (1 + cumulative);
    points.push({ date: dateLabels[i], rate: parseFloat(rate.toFixed(4)) });
  }

  return points;
}

function getRateData(source: string, target: string, rates: Record<string, number> = usdBaseRates): RatePoint[] {
  if (source === target) {
    return dateLabels.map(date => ({ date, rate: 1.0 }));
  }
  return generateRateData(source, target, rates);
}

// Get the first x-axis label (one month ago)
function getOneMonthAgoLabel(): string {
  const d = new Date();
  d.setDate(d.getDate() - 24);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

const oneMonthAgoLabel = getOneMonthAgoLabel();

const FEE = 7.23;

function parseAmount(val: string): number {
  return parseFloat(val.replace(/,/g, '')) || 0;
}

function formatAmount(val: number): string {
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function CustomTooltip({ active, payload, label, targetCurrency }: { active?: boolean; payload?: Array<{ value: number }>; label?: string; targetCurrency?: string }) {
  if (!active || !payload?.length) return null;
  const value = payload.find(p => p.value != null)?.value;
  if (value == null) return null;
  return (
    <div style={{
      background: 'var(--color-background-screen)',
      border: '1px solid var(--color-border-neutral)',
      borderRadius: 8,
      padding: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div className="np-text-body-default" style={{ color: 'var(--color-content-tertiary)' }}>{label}</div>
      <div className="np-text-body-default-bold transfer-calculator__tooltip-rate">
        {value.toFixed(4)} {targetCurrency || 'GBP'}
      </div>
    </div>
  );
}

function CustomActiveDot(props: { cx?: number; cy?: number }) {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill="var(--color-background-neutral)" opacity={0.6} />
      <circle cx={cx} cy={cy} r={6} fill="var(--color-background-screen)" />
      <circle cx={cx} cy={cy} r={3} fill="var(--color-content-primary)" />
    </g>
  );
}

export function TransferCalculator({ onSend }: { onSend?: (sourceCurrency: string, targetCurrency: string, sourceAmount?: string, targetAmount?: string) => void } = {}) {
  const { t } = useLanguage();
  const { shimmerMode } = useShimmer();
  const rates = useLiveRates();
  const [sourceAmount, setSourceAmount] = useState('1,267.38');
  const [sourceCurrency, setSourceCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('GBP');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [feeModalOpen, setFeeModalOpen] = useState(false);

  const rateData = useMemo(() => getRateData(sourceCurrency, targetCurrency, rates), [sourceCurrency, targetCurrency, rates]);
  const currentRate = rateData[rateData.length - 1].rate;
  const dataCount = rateData.length;

  const [targetAmount, setTargetAmount] = useState(() => {
    const source = parseAmount('1,267.38');
    const rate = getRateData('USD', 'GBP');
    return formatAmount((source - FEE) * rate[rate.length - 1].rate);
  });

  const handleSourceAmountChange = useCallback((val: string) => {
    setSourceAmount(val);
    const source = parseAmount(val);
    if (source > FEE) {
      setTargetAmount(formatAmount((source - FEE) * currentRate));
    } else {
      setTargetAmount('0.00');
    }
  }, [currentRate]);

  const handleTargetAmountChange = useCallback((val: string) => {
    setTargetAmount(val);
    const target = parseAmount(val);
    if (target > 0 && currentRate > 0) {
      setSourceAmount(formatAmount((target / currentRate) + FEE));
    }
  }, [currentRate]);

  const handleSourceCurrencyChange = useCallback((code: string) => {
    setSourceCurrency(code);

    const newRate = getRateData(code, targetCurrency, rates);
    const rate = newRate[newRate.length - 1].rate;
    const source = parseAmount(sourceAmount);
    if (source > FEE) {
      setTargetAmount(formatAmount((source - FEE) * rate));
    }
  }, [targetCurrency, sourceAmount, rates]);

  const handleTargetCurrencyChange = useCallback((code: string) => {
    setTargetCurrency(code);

    const newRate = getRateData(sourceCurrency, code, rates);
    const rate = newRate[newRate.length - 1].rate;
    const source = parseAmount(sourceAmount);
    if (source > FEE) {
      setTargetAmount(formatAmount((source - FEE) * rate));
    }
  }, [sourceCurrency, sourceAmount, rates]);

  const gradientOffset = activeIndex !== null ? (activeIndex / (dataCount - 1)) * 100 : 100;

  const handleChartMouseMove = useCallback((state: { activeTooltipIndex?: number }) => {
    if (state?.activeTooltipIndex != null) {
      setActiveIndex(state.activeTooltipIndex);
    }
  }, []);

  const handleChartMouseLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  const handleSwap = () => {
    const newSource = targetCurrency;
    const newTarget = sourceCurrency;
    setSourceCurrency(newSource);
    setTargetCurrency(newTarget);

    setSourceAmount(targetAmount);
    setTargetAmount(sourceAmount);
  };

  // Custom XAxis tick — first and last only
  const CustomXAxisTick = useCallback((props: { x?: number; y?: number; payload?: { value: string; index: number } }) => {
    const { x, y, payload } = props;
    if (!payload || x == null || y == null) return null;
    const isFirst = payload.index === 0;
    const isLast = payload.index === dataCount - 1;
    if (!isFirst && !isLast) return null;
    return (
      <text
        x={x}
        y={y + 16}
        textAnchor={isFirst ? 'start' : 'end'}
        fill="var(--color-content-tertiary)"
        fontSize={14}
      >
        {isFirst ? oneMonthAgoLabel : payload.value}
      </text>
    );
  }, [dataCount]);

  if (shimmerMode) return (
    <div className="transfer-calculator">
      <ShimmerTransferCalculator />
    </div>
  );

  const chartContent = (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={rateData}
        margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
        onMouseMove={handleChartMouseMove}
        onMouseLeave={handleChartMouseLeave}
      >
        <defs>
          <linearGradient id="lineColorGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset={`${gradientOffset}%`} stopColor="var(--transfer-chart-line-color)" />
            <stop offset={`${gradientOffset}%`} stopColor="var(--color-border-neutral)" />
          </linearGradient>
        </defs>
        <CartesianGrid
          horizontal={true}
          vertical={false}
          strokeDasharray="3 3"
          stroke="var(--color-border-neutral)"
        />
        <XAxis
          dataKey="date"
          axisLine={{ stroke: 'var(--color-border-neutral)' }}
          tick={<CustomXAxisTick />}
          tickLine={false}
          height={30}
          interval={0}
        />
        <YAxis
          orientation="right"
          axisLine={{ stroke: 'var(--color-border-neutral)' }}
          tick={{ fontSize: 14, fill: 'var(--color-content-tertiary)' }}
          domain={['dataMin - 0.002', 'dataMax + 0.002']}
          tickFormatter={(val: number) => val.toFixed(3)}
          width={56}
        />
        <Tooltip content={<CustomTooltip targetCurrency={targetCurrency} />} cursor={false} />
        <Line
          type="natural"
          dataKey="rate"
          stroke={activeIndex !== null ? 'url(#lineColorGradient)' : 'var(--transfer-chart-line-color)'}
          strokeWidth={2}
          dot={false}
          activeDot={<CustomActiveDot />}
          isAnimationActive={true}
          animationDuration={600}
          animationEasing="ease-out"
        />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <>
      <div className="transfer-calculator">
        <h3 className="np-text-title-subsection transfer-calculator__rate-title">
          1 {sourceCurrency} = {currentRate.toFixed(4)} {targetCurrency}
        </h3>

        <div className="transfer-calculator__body">
          <div className="transfer-calculator__chart-section">
            <div className="transfer-calculator__chart-col">
              {chartContent}
            </div>
          </div>

          <div className="transfer-calculator__inputs-col">
            <CurrencyInputGroup
              sourceAmount={sourceAmount}
              sourceCurrency={sourceCurrency}
              targetAmount={targetAmount}
              targetCurrency={targetCurrency}
              onSourceAmountChange={handleSourceAmountChange}
              onTargetAmountChange={handleTargetAmountChange}
              onSourceCurrencyChange={handleSourceCurrencyChange}
              onTargetCurrencyChange={handleTargetCurrencyChange}
              onSwap={handleSwap}
            />

            <div className="transfer-calculator__details">
              <dl className="transfer-calculator__detail">
                <dt>
                  {t('calculator.includesFees')}{' '}
                  <span className="transfer-calculator__info-btn">
                    <IconButton size={24} priority="tertiary" aria-label={t('calculator.learnMoreFees')} onClick={() => setFeeModalOpen(true)}>
                      <QuestionMarkCircle size={16} />
                    </IconButton>
                  </span>
                </dt>
                <dd>{FEE.toFixed(2)} {sourceCurrency}</dd>
              </dl>
              <dl className="transfer-calculator__detail">
                <dt>{t('calculator.shouldArrive')}</dt>
                <dd>{t('calculator.inSeconds')}</dd>
              </dl>
            </div>

            <Button v2 size="lg" priority="primary" block onClick={() => onSend?.(sourceCurrency, targetCurrency, sourceAmount, targetAmount)}>{t('common.send')}</Button>
          </div>
        </div>
      </div>

      <div className="transfer-calculator__rate-alert">
        <ul className="wds-list list-unstyled m-y-0">
          <ListItem
            title={t('calculator.rateAlerts')}
            media={
              <ListItem.AvatarView size={48}>
                <NotificationActive size={24} />
              </ListItem.AvatarView>
            }
            control={<ListItem.Navigation onClick={() => {}} />}
          />
        </ul>
      </div>

      <Modal
        open={feeModalOpen}
        onClose={() => setFeeModalOpen(false)}
        title={t('calculator.feeModalTitle')}
        body={
          <div>
            <p className="np-text-body-large" style={{ color: 'var(--color-content-primary)', margin: '0 0 12px' }}>
              {t('calculator.feeModalBody')}
            </p>
            <ul style={{ margin: '0 0 16px', paddingLeft: 20 }}>
              <li className="np-text-body-large" style={{ color: 'var(--color-content-primary)', marginBottom: 4 }}>{t('calculator.feeReason1')}</li>
              <li className="np-text-body-large" style={{ color: 'var(--color-content-primary)', marginBottom: 4 }}>{t('calculator.feeReason2')}</li>
              <li className="np-text-body-large" style={{ color: 'var(--color-content-primary)' }}>{t('calculator.feeReason3')}</li>
            </ul>
            <a href="#" className="np-text-link-large" onClick={(e) => e.preventDefault()}>{t('calculator.feeLearnMore')}</a>
          </div>
        }
      />
    </>
  );
}
