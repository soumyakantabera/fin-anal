export const buildForecast = ({ baseIncome, assumptions, years = 5 }) => {
  const last = baseIncome[0] || {};
  const forecasts = [];
  let revenue = last.revenue || 0;
  for (let i = 1; i <= years; i += 1) {
    revenue *= 1 + (assumptions.revenueGrowth || 0.05);
    const ebitda = revenue * (assumptions.ebitdaMargin || 0.25);
    const ebit = revenue * (assumptions.ebitMargin || 0.18);
    const dAndA = revenue * (assumptions.daPercent || 0.03);
    const capex = revenue * (assumptions.capexPercent || 0.04);
    const nwc = revenue * (assumptions.nwcPercent || 0.02);
    forecasts.push({
      year: `FY+${i}`,
      revenue,
      ebitda,
      ebit,
      dAndA,
      capex,
      nwc,
    });
  }
  return forecasts;
};
