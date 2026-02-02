export const buildComps = (peers = []) => {
  const multiples = peers.map((peer) => ({
    ...peer,
    evRevenue: peer.ev && peer.revenue ? peer.ev / peer.revenue : null,
    evEbitda: peer.ev && peer.ebitda ? peer.ev / peer.ebitda : null,
    pe: peer.marketCap && peer.netIncome ? peer.marketCap / peer.netIncome : null,
  }));

  return multiples;
};

export const summarizeComps = (multiples) => {
  const metrics = ['evRevenue', 'evEbitda', 'pe'];
  const summary = {};
  metrics.forEach((metric) => {
    const values = multiples.map((item) => item[metric]).filter((value) => value !== null && value !== undefined);
    summary[metric] = {
      min: Math.min(...values),
      max: Math.max(...values),
      median: values.sort((a, b) => a - b)[Math.floor(values.length / 2)] || null,
    };
  });
  return summary;
};
