const USD_TO_TZS_RATE = 2750;
const USD_TO_KES_RATE = 155;

export function convertUsdToTzs(amount: number, rate: number = USD_TO_TZS_RATE): number {
  return Math.round(amount * rate);
}

export function convertUsdToKes(amount: number, rate: number = USD_TO_KES_RATE): number {
  return Math.round(amount * rate);
}

export function formatCurrency(amount: number, currency: string): string {
  switch (currency.toUpperCase()) {
    case 'TZS':
      return `TSh ${amount.toLocaleString('en-TZ')}`;
    case 'KES':
      return `KSh ${amount.toLocaleString('en-KE')}`;
    case 'USD':
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'EUR':
      return `€${amount.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'GBP':
      return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    default:
      return `${currency.toUpperCase()} ${amount.toLocaleString()}`;
  }
}
