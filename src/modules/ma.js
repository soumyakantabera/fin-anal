import { safeDivide } from '../core/utils.js';

export const computeMA = ({ acquirer, target, assumptions }) => {
  const premium = assumptions.premium || 0.25;
  const cashMix = assumptions.cashMix || 0.5;
  const stockMix = assumptions.stockMix || 0.3;
  const debtMix = assumptions.debtMix || 0.2;

  const targetPrice = target.marketCap || 0;
  const purchasePrice = targetPrice * (1 + premium);

  const cashUsed = purchasePrice * cashMix;
  const stockUsed = purchasePrice * stockMix;
  const debtUsed = purchasePrice * debtMix;

  const synergies = assumptions.synergies || 0;
  const integrationCosts = assumptions.integrationCosts || 0;

  const proFormaEbitda = (acquirer.ebitda || 0) + (target.ebitda || 0) + synergies - integrationCosts;
  const proFormaNetDebt = (acquirer.netDebt || 0) + (target.netDebt || 0) + debtUsed;

  const proFormaEps = safeDivide((acquirer.netIncome || 0) + (target.netIncome || 0) + synergies - integrationCosts, acquirer.shares || 1);
  const accretion = safeDivide(proFormaEps, acquirer.eps || 1) - 1;

  return {
    purchasePrice,
    cashUsed,
    stockUsed,
    debtUsed,
    proFormaEbitda,
    proFormaNetDebt,
    proFormaEps,
    accretion,
  };
};
