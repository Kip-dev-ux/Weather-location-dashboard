const form = document.getElementById('converterForm');
const amountInput = document.getElementById('amount');
const fromCurrency = document.getElementById('fromCurrency');
const toCurrency = document.getElementById('toCurrency');
const swapBtn = document.getElementById('swapBtn');
const rateInfo = document.getElementById('rateInfo');
const convertedResult = document.getElementById('convertedResult');

// Fallback rates relative to 1 USD (used if sandbox blocks external fetch)
const fallbackRatesUSD = {
  USD: 1,
  KES: 129.2,
  EUR: 0.92,
  GBP: 0.79,
  UGX: 3680,
  TZS: 2650
};

async function convertCurrency() {
  const amount = parseFloat(amountInput.value);
  const from = fromCurrency.value;
  const to = toCurrency.value;

  if (isNaN(amount) || amount <= 0) {
    rateInfo.textContent = 'Please enter a valid amount.';
    return;
  }

  rateInfo.textContent = 'Fetching live rate...';
  convertedResult.textContent = '...';

  try {
    const response = await fetch(`https://frankfurter.app{from}&to=${to}`);
    if (!response.ok) throw new Error('API unavailable');
    const data = await response.json();

    const rate = data.rates[to];
    displayResult(amount, rate, from, to, 'Live Rate');
  } catch (error) {
    // Fallback calculation if preview sandbox blocks external network calls
    const rate = fallbackRatesUSD[to] / fallbackRatesUSD[from];
    displayResult(amount, rate, from, to, 'Offline Reference Rate');
  }
}

function displayResult(amount, rate, from, to, sourceLabel) {
  const total = (amount * rate).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  rateInfo.textContent = `${sourceLabel}: 1 ${from} = ${rate.toFixed(4)} ${to}`;
  convertedResult.textContent = `${total} ${to}`;
}

swapBtn.addEventListener('click', () => {
  const temp = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = temp;
  convertCurrency();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  convertCurrency();
});

convertCurrency();
