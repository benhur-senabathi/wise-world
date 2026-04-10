import { Send, Receive, Convert, Plus } from '@transferwise/icons';

export const LOGO_DEV_TOKEN = 'pk_CkDnlfI6QH-YA3A_mVN8gA';
export const logoUrl = (domain: string) =>
  `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=128&format=png`;

export type Transaction = {
  name: string;
  subtitle?: string;
  amount: string;
  amountSub?: string;
  isPositive: boolean;
  icon?: React.ReactNode;
  imgSrc?: string;
  date: string;
  currency: string;
  /** For conversion transactions: the other currency involved */
  conversion?: {
    fromCurrency: string;
    toCurrency: string;
    fromAmount: string;
    toAmount: string;
  };
};

/**
 * Get transactions for a specific currency page.
 * - Regular transactions: filtered by currency as normal
 * - Conversion transactions: shown on BOTH currencies involved,
 *   with the name/amount adjusted per currency perspective
 */
export function getTransactionsForCurrency(currencyCode: string, txList: Transaction[] = transactions, movedByYou?: string): Transaction[] {
  const result: Transaction[] = [];
  const movedLabel = movedByYou ?? 'Moved by you';

  for (const tx of txList) {
    if (tx.conversion) {
      const { fromCurrency, toCurrency, fromAmount, toAmount } = tx.conversion;

      if (fromCurrency === currencyCode) {
        // This is the "from" side — money left this currency
        result.push({
          ...tx,
          name: `To ${toCurrency}`,
          subtitle: movedLabel,
          amount: `- ${fromAmount}`,
          amountSub: undefined,
          isPositive: false,
        });
      } else if (toCurrency === currencyCode) {
        // This is the "to" side — money arrived in this currency
        result.push({
          ...tx,
          name: `From ${fromCurrency}`,
          subtitle: movedLabel,
          amount: `+ ${toAmount}`,
          amountSub: undefined,
          isPositive: true,
        });
      }
    } else if (tx.currency === currencyCode) {
      result.push(tx);
    }
  }

  return result;
}

export function groupByDate(txs: Transaction[]): [string, Transaction[]][] {
  const groups: [string, Transaction[]][] = [];
  for (const tx of txs) {
    const last = groups[groups.length - 1];
    if (last && last[0] === tx.date) {
      last[1].push(tx);
    } else {
      groups.push([tx.date, [tx]]);
    }
  }
  return groups;
}

export type TxTranslator = {
  sent: string;
  sentByYou: string;
  added: string;
  addedByYou: string;
  moved: string;
  movedByYou: string;
  spentByYou: string;
};

const defaultLabels: TxTranslator = {
  sent: 'Sent',
  sentByYou: 'Sent by you',
  added: 'Added',
  addedByYou: 'Added by you',
  moved: 'Moved',
  movedByYou: 'Moved by you',
  spentByYou: 'Spent by you',
};

export function buildTransactions(consumerName: string, businessName: string, labels: TxTranslator = defaultLabels): Transaction[] {
  return [
    // Today (10 Apr) — GBP: -6.40 -18.90
    { name: 'Pret A Manger', amount: '6.40 GBP', isPositive: false, imgSrc: logoUrl('pret.com'), date: 'Today', currency: 'GBP' },
    { name: 'Deliveroo', amount: '18.90 GBP', isPositive: false, imgSrc: logoUrl('deliveroo.co.uk'), date: 'Today', currency: 'GBP' },

    // Yesterday (9 Apr) — GBP: +0.04 +350.00 -32.50
    { name: 'Wise Interest', subtitle: labels.added, amount: '+ 0.04 GBP', isPositive: true, icon: <Plus size={24} />, date: 'Yesterday', currency: 'GBP' },
    { name: businessName, amount: '+ 350.00 GBP', isPositive: true, icon: <Receive size={24} />, date: 'Yesterday', currency: 'GBP' },
    { name: 'Sainsburys', amount: '32.50 GBP', isPositive: false, imgSrc: logoUrl('sainsburys.co.uk'), date: 'Yesterday', currency: 'GBP' },

    // 8 Apr — GBP: -2.80 -22.50 | USD: -17.49
    { name: 'TfL', amount: '2.80 GBP', isPositive: false, imgSrc: logoUrl('tfl.gov.uk'), date: '8 April', currency: 'GBP' },
    { name: 'Uber Eats', amount: '22.50 GBP', isPositive: false, imgSrc: logoUrl('ubereats.com'), date: '8 April', currency: 'GBP' },
    { name: 'Netflix', amount: '17.49 USD', isPositive: false, imgSrc: logoUrl('netflix.com'), date: '8 April', currency: 'USD' },

    // 7 Apr — GBP: +0.03 -14.80 | EUR: -38.90
    { name: 'Wise Interest', subtitle: labels.added, amount: '+ 0.03 GBP', isPositive: true, icon: <Plus size={24} />, date: '7 April', currency: 'GBP' },
    { name: 'Deliveroo', amount: '14.80 GBP', isPositive: false, imgSrc: logoUrl('deliveroo.co.uk'), date: '7 April', currency: 'GBP' },
    { name: 'Zara', amount: '38.90 EUR', isPositive: false, imgSrc: logoUrl('zara.com'), date: '7 April', currency: 'EUR' },

    // 6 Apr — GBP: -45.20 | USD: -13.99
    { name: 'Tesco', amount: '45.20 GBP', isPositive: false, imgSrc: logoUrl('tesco.com'), date: '6 April', currency: 'GBP' },
    { name: 'Disney+', amount: '13.99 USD', isPositive: false, imgSrc: logoUrl('disneyplus.com'), date: '6 April', currency: 'USD' },

    // 5 Apr — GBP: +0.03 -5.20 -10.99 | EUR: -29.90
    { name: 'Wise Interest', subtitle: labels.added, amount: '+ 0.03 GBP', isPositive: true, icon: <Plus size={24} />, date: '5 April', currency: 'GBP' },
    { name: 'Starbucks', amount: '5.20 GBP', isPositive: false, imgSrc: logoUrl('starbucks.com'), date: '5 April', currency: 'GBP' },
    { name: 'Spotify', amount: '10.99 GBP', isPositive: false, imgSrc: logoUrl('spotify.com'), date: '5 April', currency: 'GBP' },
    { name: 'Mango', amount: '29.90 EUR', isPositive: false, imgSrc: logoUrl('mango.com'), date: '5 April', currency: 'EUR' },

    // 4 Apr — GBP: -24.50 -3.90
    { name: 'Nando\'s', amount: '24.50 GBP', isPositive: false, imgSrc: logoUrl('nandos.co.uk'), date: '4 April', currency: 'GBP' },
    { name: 'Costa Coffee', amount: '3.90 GBP', isPositive: false, imgSrc: logoUrl('costa.co.uk'), date: '4 April', currency: 'GBP' },

    // 3 Apr — GBP: +0.04 -145.00 | EUR: +80.00
    { name: 'Wise Interest', subtitle: labels.added, amount: '+ 0.04 GBP', isPositive: true, icon: <Plus size={24} />, date: '3 April', currency: 'GBP' },
    { name: 'HMRC', subtitle: labels.sent, amount: '145.00 GBP', isPositive: false, icon: <Send size={24} />, date: '3 April', currency: 'GBP' },
    { name: 'Isabella Moreno', amount: '+ 80.00 EUR', isPositive: true, icon: <Receive size={24} />, date: '3 April', currency: 'EUR' },

    // 2 Apr — GBP: +350.00 -16.90 | USD: -24.99
    { name: businessName, amount: '+ 350.00 GBP', isPositive: true, icon: <Receive size={24} />, date: '2 April', currency: 'GBP' },
    { name: 'Deliveroo', amount: '16.90 GBP', isPositive: false, imgSrc: logoUrl('deliveroo.co.uk'), date: '2 April', currency: 'GBP' },
    { name: 'Amazon', amount: '24.99 USD', isPositive: false, imgSrc: logoUrl('amazon.com'), date: '2 April', currency: 'USD' },

    // 1 Apr — GBP: +0.03 -27.40 | EUR: -48.50
    { name: 'Wise Interest', subtitle: labels.added, amount: '+ 0.03 GBP', isPositive: true, icon: <Plus size={24} />, date: '1 April', currency: 'GBP' },
    { name: 'Tesco', amount: '27.40 GBP', isPositive: false, imgSrc: logoUrl('tesco.com'), date: '1 April', currency: 'GBP' },
    { name: 'H&M', amount: '48.50 EUR', isPositive: false, imgSrc: logoUrl('hm.com'), date: '1 April', currency: 'EUR' },

    // 31 Mar — GBP: -5.40 -21.50
    { name: 'Pret A Manger', amount: '5.40 GBP', isPositive: false, imgSrc: logoUrl('pret.com'), date: '31 March', currency: 'GBP' },
    { name: 'Uber Eats', amount: '21.50 GBP', isPositive: false, imgSrc: logoUrl('ubereats.com'), date: '31 March', currency: 'GBP' },

    // 30 Mar — GBP: +0.03 -35.80 | USD: -23.17
    { name: 'Wise Interest', subtitle: labels.added, amount: '+ 0.03 GBP', isPositive: true, icon: <Plus size={24} />, date: '30 March', currency: 'GBP' },
    { name: 'Sainsburys', amount: '35.80 GBP', isPositive: false, imgSrc: logoUrl('sainsburys.co.uk'), date: '30 March', currency: 'GBP' },
    { name: 'Target', amount: '23.17 USD', isPositive: false, imgSrc: logoUrl('target.com'), date: '30 March', currency: 'USD' },

    // 29 Mar — GBP: -4.60 -2.80
    { name: 'Pret A Manger', amount: '4.60 GBP', isPositive: false, imgSrc: logoUrl('pret.com'), date: '29 March', currency: 'GBP' },
    { name: 'TfL', amount: '2.80 GBP', isPositive: false, imgSrc: logoUrl('tfl.gov.uk'), date: '29 March', currency: 'GBP' },

    // 28 Mar — GBP: -42.00 +100.00
    { name: 'Christie Davis', subtitle: labels.sent, amount: '42.00 GBP', isPositive: false, icon: <Send size={24} />, date: '28 March', currency: 'GBP' },
    { name: 'Olivia Hartley', amount: '+ 100.00 GBP', isPositive: true, icon: <Receive size={24} />, date: '28 March', currency: 'GBP' },

    // --- Original transactions shifted to actual dates ---

    // 27 Mar — GBP: +0.03 -27.40
    { name: 'Wise Interest', subtitle: labels.added, amount: '+ 0.03 GBP', isPositive: true, icon: <Plus size={24} />, date: '27 March', currency: 'GBP' },
    { name: 'Tesco', amount: '27.40 GBP', isPositive: false, imgSrc: logoUrl('tesco.com'), date: '27 March', currency: 'GBP' },

    // 26 Mar — GBP: -16.90 -2.80 | USD: -24.99
    { name: 'Deliveroo', amount: '16.90 GBP', isPositive: false, imgSrc: logoUrl('deliveroo.co.uk'), date: '26 March', currency: 'GBP' },
    { name: 'TfL', amount: '2.80 GBP', isPositive: false, imgSrc: logoUrl('tfl.gov.uk'), date: '26 March', currency: 'GBP' },
    { name: 'Amazon', amount: '24.99 USD', isPositive: false, imgSrc: logoUrl('amazon.com'), date: '26 March', currency: 'USD' },

    // 25 Mar — GBP: +0.04 -5.20 | EUR: -32.47
    { name: 'Wise Interest', subtitle: labels.added, amount: '+ 0.04 GBP', isPositive: true, icon: <Plus size={24} />, date: '25 March', currency: 'GBP' },
    { name: 'Starbucks', amount: '5.20 GBP', isPositive: false, imgSrc: logoUrl('starbucks.com'), date: '25 March', currency: 'GBP' },
    { name: 'H&M', amount: '32.47 EUR', isPositive: false, imgSrc: logoUrl('hm.com'), date: '25 March', currency: 'EUR' },

    // 24 Mar — GBP: +350.00 -4.60
    { name: businessName, amount: '+ 350.00 GBP', isPositive: true, icon: <Receive size={24} />, date: '24 March', currency: 'GBP' },
    { name: 'Pret A Manger', amount: '4.60 GBP', isPositive: false, imgSrc: logoUrl('pret.com'), date: '24 March', currency: 'GBP' },

    // 23 Mar — GBP: -35.80 | USD: -13.99
    { name: 'Sainsburys', amount: '35.80 GBP', isPositive: false, imgSrc: logoUrl('sainsburys.co.uk'), date: '23 March', currency: 'GBP' },
    { name: 'Disney+', amount: '13.99 USD', isPositive: false, imgSrc: logoUrl('disneyplus.com'), date: '23 March', currency: 'USD' },

    // 22 Mar — GBP: +0.03 -18.50 | EUR: -48.50
    { name: 'Wise Interest', subtitle: labels.added, amount: '+ 0.03 GBP', isPositive: true, icon: <Plus size={24} />, date: '22 March', currency: 'GBP' },
    { name: 'Nando\'s', amount: '18.50 GBP', isPositive: false, imgSrc: logoUrl('nandos.co.uk'), date: '22 March', currency: 'GBP' },
    { name: 'Zara', amount: '48.50 EUR', isPositive: false, imgSrc: logoUrl('zara.com'), date: '22 March', currency: 'EUR' },

    // 21 Mar — GBP: -3.90 -21.50
    { name: 'Costa Coffee', amount: '3.90 GBP', isPositive: false, imgSrc: logoUrl('costa.co.uk'), date: '21 March', currency: 'GBP' },
    { name: 'Uber Eats', amount: '21.50 GBP', isPositive: false, imgSrc: logoUrl('ubereats.com'), date: '21 March', currency: 'GBP' },

    // 20 Mar — GBP: +0.03 -5.40
    { name: 'Wise Interest', subtitle: labels.added, amount: '+ 0.03 GBP', isPositive: true, icon: <Plus size={24} />, date: '20 March', currency: 'GBP' },
    { name: 'Pret A Manger', amount: '5.40 GBP', isPositive: false, imgSrc: logoUrl('pret.com'), date: '20 March', currency: 'GBP' },

    // 19 Mar — GBP: -22.50 | USD: -23.17
    { name: 'Uber Eats', amount: '22.50 GBP', isPositive: false, imgSrc: logoUrl('ubereats.com'), date: '19 March', currency: 'GBP' },
    { name: 'Target', amount: '23.17 USD', isPositive: false, imgSrc: logoUrl('target.com'), date: '19 March', currency: 'USD' },

    // 18 Mar — GBP: +0.04 -14.80
    { name: 'Wise Interest', subtitle: labels.added, amount: '+ 0.04 GBP', isPositive: true, icon: <Plus size={24} />, date: '18 March', currency: 'GBP' },
    { name: 'Deliveroo', amount: '14.80 GBP', isPositive: false, imgSrc: logoUrl('deliveroo.co.uk'), date: '18 March', currency: 'GBP' },

    // 17 Mar — GBP: +350.00 -2.80
    { name: businessName, amount: '+ 350.00 GBP', isPositive: true, icon: <Receive size={24} />, date: '17 March', currency: 'GBP' },
    { name: 'TfL', amount: '2.80 GBP', isPositive: false, imgSrc: logoUrl('tfl.gov.uk'), date: '17 March', currency: 'GBP' },

    // 16 Mar — GBP: -10.99 | EUR: -43.18
    { name: 'Spotify', amount: '10.99 GBP', isPositive: false, imgSrc: logoUrl('spotify.com'), date: '16 March', currency: 'GBP' },
    { name: 'Uniqlo', amount: '43.18 EUR', isPositive: false, imgSrc: logoUrl('uniqlo.com'), date: '16 March', currency: 'EUR' },

    // 15 Mar — GBP: +0.03 +100.00 | USD: -17.49
    { name: 'Wise Interest', subtitle: labels.added, amount: '+ 0.03 GBP', isPositive: true, icon: <Plus size={24} />, date: '15 March', currency: 'GBP' },
    { name: 'Olivia Hartley', amount: '+ 100.00 GBP', isPositive: true, icon: <Receive size={24} />, date: '15 March', currency: 'GBP' },
    { name: 'Netflix', amount: '17.49 USD', isPositive: false, imgSrc: logoUrl('netflix.com'), date: '15 March', currency: 'USD' },

    // 14 Mar — GBP: -32.75 | EUR: -28.50
    { name: 'Sainsburys', amount: '32.75 GBP', isPositive: false, imgSrc: logoUrl('sainsburys.co.uk'), date: '14 March', currency: 'GBP' },
    { name: 'H&M', amount: '28.50 EUR', isPositive: false, imgSrc: logoUrl('hm.com'), date: '14 March', currency: 'EUR' },

    // 13 Mar — GBP: -4.95 -3.80
    { name: 'Starbucks', amount: '4.95 GBP', isPositive: false, imgSrc: logoUrl('starbucks.com'), date: '13 March', currency: 'GBP' },
    { name: 'Costa Coffee', amount: '3.80 GBP', isPositive: false, imgSrc: logoUrl('costa.co.uk'), date: '13 March', currency: 'GBP' },

    // 12 Mar — GBP: -18.75 +0.03
    { name: 'Tesco', amount: '18.75 GBP', isPositive: false, imgSrc: logoUrl('tesco.com'), date: '12 March', currency: 'GBP' },
    { name: 'Wise Interest', subtitle: labels.added, amount: '+ 0.03 GBP', isPositive: true, icon: <Plus size={24} />, date: '12 March', currency: 'GBP' },

    // 11 Mar — GBP: -16.40 | USD: -37.42
    { name: 'Uber Eats', amount: '16.40 GBP', isPositive: false, imgSrc: logoUrl('ubereats.com'), date: '11 March', currency: 'GBP' },
    { name: 'Nike', amount: '37.42 USD', isPositive: false, imgSrc: logoUrl('nike.com'), date: '11 March', currency: 'USD' },

    // 10 Mar — GBP: +0.04 | EUR: -51.73
    { name: 'Wise Interest', subtitle: labels.added, amount: '+ 0.04 GBP', isPositive: true, icon: <Plus size={24} />, date: '10 March', currency: 'GBP' },
    { name: 'Decathlon', amount: '51.73 EUR', isPositive: false, imgSrc: logoUrl('decathlon.com'), date: '10 March', currency: 'EUR' },

    // 9 Mar — GBP: +150.00 -4.85
    { name: 'Olivia Hartley', amount: '+ 150.00 GBP', isPositive: true, icon: <Receive size={24} />, date: '9 March', currency: 'GBP' },
    { name: 'Starbucks', amount: '4.85 GBP', isPositive: false, imgSrc: logoUrl('starbucks.com'), date: '9 March', currency: 'GBP' },

    // 8 Mar — GBP: -2.80 | USD: -18.63
    { name: 'TfL', amount: '2.80 GBP', isPositive: false, imgSrc: logoUrl('tfl.gov.uk'), date: '8 March', currency: 'GBP' },
    { name: 'DoorDash', amount: '18.63 USD', isPositive: false, imgSrc: logoUrl('doordash.com'), date: '8 March', currency: 'USD' },

    // 7 Mar — GBP: +350.00 +0.03 -18.90
    { name: businessName, amount: '+ 350.00 GBP', isPositive: true, icon: <Receive size={24} />, date: '7 March', currency: 'GBP' },
    { name: 'Wise Interest', subtitle: labels.added, amount: '+ 0.03 GBP', isPositive: true, icon: <Plus size={24} />, date: '7 March', currency: 'GBP' },
    { name: 'Deliveroo', amount: '18.90 GBP', isPositive: false, imgSrc: logoUrl('deliveroo.co.uk'), date: '7 March', currency: 'GBP' },

    // 6 Mar — GBP: -150.00(->EUR) -38.62 | EUR: +175.50
    { name: 'To EUR', subtitle: labels.moved, amount: '150.00 GBP', amountSub: '175.50 EUR', isPositive: false, icon: <Convert size={24} />, date: '6 March', currency: 'GBP', conversion: { fromCurrency: 'GBP', toCurrency: 'EUR', fromAmount: '150.00 GBP', toAmount: '175.50 EUR' } },
    { name: 'Sainsburys', amount: '38.62 GBP', isPositive: false, imgSrc: logoUrl('sainsburys.co.uk'), date: '6 March', currency: 'GBP' },

    // 5 Mar — GBP: -10.99 | EUR: -29.90
    { name: 'Spotify', amount: '10.99 GBP', isPositive: false, imgSrc: logoUrl('spotify.com'), date: '5 March', currency: 'GBP' },
    { name: 'Mango', amount: '29.90 EUR', isPositive: false, imgSrc: logoUrl('mango.com'), date: '5 March', currency: 'EUR' },

    // 4 Mar — GBP: +250.00 +0.04 -4.20
    { name: businessName, amount: '+ 250.00 GBP', isPositive: true, icon: <Receive size={24} />, date: '4 March', currency: 'GBP' },
    { name: 'Wise Interest', subtitle: labels.added, amount: '+ 0.04 GBP', isPositive: true, icon: <Plus size={24} />, date: '4 March', currency: 'GBP' },
    { name: 'Costa Coffee', amount: '4.20 GBP', isPositive: false, imgSrc: logoUrl('costa.co.uk'), date: '4 March', currency: 'GBP' },

    // 3 Mar — GBP: -24.50 | USD: -0.99
    { name: 'Nando\'s', amount: '24.50 GBP', isPositive: false, imgSrc: logoUrl('nandos.co.uk'), date: '3 March', currency: 'GBP' },
    { name: 'Apple', amount: '0.99 USD', isPositive: false, imgSrc: logoUrl('apple.com'), date: '3 March', currency: 'USD' },

    // 2 Mar — GBP: +0.02 -145.00 | EUR: -78.64
    { name: 'Wise Interest', subtitle: labels.added, amount: '+ 0.02 GBP', isPositive: true, icon: <Plus size={24} />, date: '2 March', currency: 'GBP' },
    { name: 'HMRC', subtitle: labels.sent, amount: '145.00 GBP', isPositive: false, icon: <Send size={24} />, date: '2 March', currency: 'GBP' },
    { name: 'Booking.com', amount: '78.64 EUR', isPositive: false, imgSrc: logoUrl('booking.com'), date: '2 March', currency: 'EUR' },

    // 1 Mar — GBP: -7.85 -100.00(->USD) | USD: +127.50
    { name: 'McDonald\'s', amount: '7.85 GBP', isPositive: false, imgSrc: logoUrl('mcdonalds.com'), date: '1 March', currency: 'GBP' },
    { name: 'To USD', subtitle: labels.moved, amount: '100.00 GBP', amountSub: '127.50 USD', isPositive: false, icon: <Convert size={24} />, date: '1 March', currency: 'GBP', conversion: { fromCurrency: 'GBP', toCurrency: 'USD', fromAmount: '100.00 GBP', toAmount: '127.50 USD' } },

    // 28 Feb — GBP: +0.03 -25.00 -5.60
    { name: 'Wise Interest', subtitle: labels.added, amount: '+ 0.03 GBP', isPositive: true, icon: <Plus size={24} />, date: '28 February', currency: 'GBP' },
    { name: 'Christie Davis', subtitle: labels.sent, amount: '25.00 GBP', isPositive: false, icon: <Send size={24} />, date: '28 February', currency: 'GBP' },
    { name: 'Pret A Manger', amount: '5.60 GBP', isPositive: false, imgSrc: logoUrl('pret.com'), date: '28 February', currency: 'GBP' },

    // 27 Feb — GBP: -41.30 | EUR: +80.00
    { name: 'Tesco', amount: '41.30 GBP', isPositive: false, imgSrc: logoUrl('tesco.com'), date: '27 February', currency: 'GBP' },
    { name: 'Isabella Moreno', amount: '+ 80.00 EUR', isPositive: true, icon: <Receive size={24} />, date: '27 February', currency: 'EUR' },

    // 26 Feb — GBP: -6.40 | EUR: -14.90
    { name: 'Pret A Manger', amount: '6.40 GBP', isPositive: false, imgSrc: logoUrl('pret.com'), date: '26 February', currency: 'GBP' },
    { name: 'Lidl', amount: '14.90 EUR', isPositive: false, imgSrc: logoUrl('lidl.com'), date: '26 February', currency: 'EUR' },

    // 25 Feb — GBP: +75.00 -29.99 | USD: -9.99
    { name: 'Olivia Hartley', amount: '+ 75.00 GBP', isPositive: true, icon: <Receive size={24} />, date: '25 February', currency: 'GBP' },
    { name: 'Nando\'s', amount: '29.99 GBP', isPositive: false, imgSrc: logoUrl('nandos.co.uk'), date: '25 February', currency: 'GBP' },
    { name: 'Hulu', amount: '9.99 USD', isPositive: false, imgSrc: logoUrl('hulu.com'), date: '25 February', currency: 'USD' },

    // 24 Feb — EUR: -42.16 | GBP: -8.50
    { name: 'Booking.com', amount: '42.16 EUR', isPositive: false, imgSrc: logoUrl('booking.com'), date: '24 February', currency: 'EUR' },
    { name: 'Costa Coffee', amount: '8.50 GBP', isPositive: false, imgSrc: logoUrl('costa.co.uk'), date: '24 February', currency: 'GBP' },

    // 23 Feb — GBP: +199.66 -147.30
    { name: 'Olivia Hartley', amount: '+ 199.66 GBP', isPositive: true, icon: <Receive size={24} />, date: '23 February', currency: 'GBP' },
    { name: 'Enterprise Rent-A-Car', amount: '147.30 GBP', isPositive: false, imgSrc: logoUrl('enterprise.com'), date: '23 February', currency: 'GBP' },

    // 22 Feb — GBP: -8.49 | USD: -13.99
    { name: "McDonald's", amount: '8.49 GBP', isPositive: false, imgSrc: logoUrl('mcdonalds.com'), date: '22 February', currency: 'GBP' },
    { name: 'YouTube Premium', amount: '13.99 USD', isPositive: false, imgSrc: logoUrl('youtube.com'), date: '22 February', currency: 'USD' },

    // 21 Feb — GBP: +0.04 | EUR: +120.00
    { name: 'Wise Interest', subtitle: labels.added, amount: '+ 0.04 GBP', isPositive: true, icon: <Plus size={24} />, date: '21 February', currency: 'GBP' },
    { name: 'Isabella Moreno', amount: '+ 120.00 EUR', isPositive: true, icon: <Receive size={24} />, date: '21 February', currency: 'EUR' },

    // 20 Feb — GBP: -189.93 +1.00
    { name: 'AMERICAN EXP 4916', subtitle: labels.sent, amount: '189.93 GBP', isPositive: false, icon: <Send size={24} />, date: '20 February', currency: 'GBP' },
    { name: businessName, amount: '+ 1.00 GBP', isPositive: true, icon: <Receive size={24} />, date: '20 February', currency: 'GBP' },

    // 18 Feb — GBP: -0.01 +0.03
    { name: 'Christie Davis', subtitle: labels.sent, amount: '0.01 GBP', isPositive: false, icon: <Send size={24} />, date: '18 February', currency: 'GBP' },
    { name: 'Wise Interest', subtitle: labels.added, amount: '+ 0.03 GBP', isPositive: true, icon: <Plus size={24} />, date: '18 February', currency: 'GBP' },

    // 16 Feb — GBP: -32.47
    { name: 'Tesco', amount: '32.47 GBP', isPositive: false, imgSrc: logoUrl('tesco.com'), date: '16 February', currency: 'GBP' },

    // 15 Feb — GBP: -10.99 -2.80
    { name: 'Spotify', amount: '10.99 GBP', isPositive: false, imgSrc: logoUrl('spotify.com'), date: '15 February', currency: 'GBP' },
    { name: 'TfL', amount: '2.80 GBP', isPositive: false, imgSrc: logoUrl('tfl.gov.uk'), date: '15 February', currency: 'GBP' },

    // 13 Feb — GBP: +0.02 -23.99 -188.00(->USD) | USD: +240.28
    { name: 'Amazon', amount: '23.99 GBP', isPositive: false, imgSrc: logoUrl('amazon.co.uk'), date: '13 February', currency: 'GBP' },
    { name: 'To USD', subtitle: labels.moved, amount: '188.00 GBP', amountSub: '240.28 USD', isPositive: false, icon: <Convert size={24} />, date: '13 February', currency: 'GBP', conversion: { fromCurrency: 'GBP', toCurrency: 'USD', fromAmount: '188.00 GBP', toAmount: '240.28 USD' } },
    { name: 'Wise Interest', subtitle: labels.added, amount: '+ 0.02 GBP', isPositive: true, icon: <Plus size={24} />, date: '13 February', currency: 'GBP' },

    // 11 Feb — EUR: -22.50 | GBP: +50.00
    { name: 'Deliveroo', amount: '22.50 EUR', isPositive: false, imgSrc: logoUrl('deliveroo.co.uk'), date: '11 February', currency: 'EUR' },
    { name: 'Olivia Hartley', amount: '+ 50.00 GBP', isPositive: true, icon: <Receive size={24} />, date: '11 February', currency: 'GBP' },

    // 9 Feb — GBP: +350.00 -47.82
    { name: 'Sainsburys', amount: '47.82 GBP', isPositive: false, imgSrc: logoUrl('sainsburys.co.uk'), date: '9 February', currency: 'GBP' },
    { name: businessName, amount: '+ 350.00 GBP', isPositive: true, icon: <Receive size={24} />, date: '9 February', currency: 'GBP' },

    // 6 Feb — GBP: -219.00(->EUR) -12.40 | EUR: +256.20
    { name: 'To EUR', subtitle: labels.moved, amount: '219.00 GBP', amountSub: '256.20 EUR', isPositive: false, icon: <Convert size={24} />, date: '6 February', currency: 'GBP', conversion: { fromCurrency: 'GBP', toCurrency: 'EUR', fromAmount: '219.00 GBP', toAmount: '256.20 EUR' } },
    { name: 'Uber', amount: '12.40 GBP', isPositive: false, imgSrc: logoUrl('uber.com'), date: '6 February', currency: 'GBP' },

    // 4 Feb — GBP: +500.00
    { name: consumerName, subtitle: labels.added, amount: '+ 500.00 GBP', isPositive: true, icon: <Plus size={24} />, date: '4 February', currency: 'GBP' },
  ];
}

export const transactions: Transaction[] = buildTransactions('Connor Berry', 'Berry Design');

/**
 * Compute a currency's balance by summing all transaction credits and debits.
 * Handles regular transactions and both sides of conversions.
 */
export function computeCurrencyBalance(code: string, txList: Transaction[]): number {
  let balance = 0;
  for (const tx of txList) {
    if (tx.conversion) {
      const { fromCurrency, toCurrency, fromAmount, toAmount } = tx.conversion;
      if (fromCurrency === code) {
        balance -= parseFloat(fromAmount.replace(/,/g, '').split(' ')[0]);
      }
      if (toCurrency === code) {
        balance += parseFloat(toAmount.replace(/,/g, '').split(' ')[0]);
      }
    } else if (tx.currency === code) {
      const raw = tx.amount.replace(/[+,]/g, '').trim().split(' ')[0];
      const amount = parseFloat(raw);
      if (tx.isPositive) balance += amount;
      else balance -= amount;
    }
  }
  return Math.round(balance * 100) / 100;
}
