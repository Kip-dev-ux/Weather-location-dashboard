// State Management: Load existing records from storage, or fallback to empty template
let state = JSON.parse(localStorage.getItem('merchant_ledger_data')) || {
    grossTotal: 0,
    feesTotal: 0,
    netTotal: 0,
    transactions: []
};

// DOM Selections
const form = document.getElementById('transaction-form');
const amountInput = document.getElementById('amount');
const methodSelect = document.getElementById('payment-method');
const submitBtn = document.getElementById('submit-btn');

const totalGrossEl = document.getElementById('total-gross');
const totalFeesEl = document.getElementById('total-fees');
const totalNetEl = document.getElementById('total-net');
const transactionListEl = document.getElementById('transaction-list');
const amountErrorEl = document.getElementById('amount-error');

// Real-world M-Pesa Customer Withdrawal Tariff Table Data
const mpesaWithdrawalTariffs = [
    { min: 1, max: 49, fee: 0 },
    { min: 50, max: 100, fee: 11 },
    { min: 101, max: 500, fee: 29 },
    { min: 501, max: 1000, fee: 29 },
    { min: 1001, max: 1500, fee: 30 },
    { min: 1501, max: 2500, fee: 30 },
    { min: 2501, max: 3500, fee: 53 },
    { min: 3501, max: 5000, fee: 70 },
    { min: 5001, max: 7500, fee: 88 },
    { min: 7501, max: 10000, fee: 115 },
    { min: 10001, max: 15000, fee: 167 },
    { min: 15001, max: 20000, fee: 185 },
    { min: 20001, max: 35000, fee: 197 },
    { min: 35001, max: 50000, fee: 278 },
    { min: 50001, max: 250000, fee: 300 }
];

// Calculate processing friction fees dynamically
function calculateTransactionFee(amount, method) {
    let fee = 0;
    
    if (method === 'mpesa-till') {
        fee = amount * 0.005; // 0.5% standard merchant levy
    } else if (method === 'mpesa-withdrawal') {
        // High-level Array Lookup: Locates the exact tier array match
        const matchingTier = mpesaWithdrawalTariffs.find(t => amount >= t.min && amount <= t.max);
        fee = matchingTier ? matchingTier.fee : 0;
    } else if (method === 'mpesa-stk' || method === 'cash') {
        fee = 0;
    }
    
    return Math.round(fee * 100) / 100;
}

// Render values to browser
function updateUI() {
    totalGrossEl.textContent = `KES ${state.grossTotal.toFixed(2)}`;
    totalFeesEl.textContent = `KES ${state.feesTotal.toFixed(2)}`;
    totalNetEl.textContent = `KES ${state.netTotal.toFixed(2)}`;
    
    transactionListEl.innerHTML = '';
    state.transactions.forEach(tx => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${tx.channel.toUpperCase()}</strong>: Gross KES ${tx.gross.toFixed(2)}</span>
            <span style="color: ${tx.fee > 0 ? '#EF4444' : '#10B981'}">Fee: KES ${tx.fee.toFixed(2)}</span>
        `;
        transactionListEl.appendChild(li);
    });
    // Sync the current state object into persistent local storage strings
    localStorage.setItem('merchant_ledger_data', JSON.stringify(state));
}

// Handle data safe submission
form.addEventListener('submit', function (event) {
    event.preventDefault();
    
    // Idempotency: Freeze double execution
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    amountErrorEl.textContent = '';
    
    const numericAmount = parseFloat(amountInput.value);
    const selectedChannel = methodSelect.value;

    if (isNaN(numericAmount) || numericAmount <= 0) {
        amountErrorEl.textContent = 'Please enter a valid amount greater than 0.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log Transaction';
        return;
    }

    const calculatedFee = calculateTransactionFee(numericAmount, selectedChannel);
    const calculatedNet = numericAmount - calculatedFee;

    // Mutate ledger data values safely
    state.grossTotal += numericAmount;
    state.feesTotal += calculatedFee;
    state.netTotal += calculatedNet;
    
    state.transactions.unshift({
        id: Date.now(),
        gross: numericAmount,
        fee: calculatedFee,
        net: calculatedNet,
        channel: selectedChannel
    });

    updateUI();
    form.reset();

    // Release interface freeze cleanly
    setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log Transaction';
    }, 400);
});
// DOM Selection for Clear Button
const clearLedgerBtn = document.getElementById('clear-ledger-btn');

// Safe State Eraser with Confirmation Step
clearLedgerBtn.addEventListener('click', function() {
    // Structural Safeguard: Prevent accidental data wipeouts
    const userConfirmed = confirm("Are you absolutely sure you want to clear the entire ledger? This action cannot be undone.");
    
    if (userConfirmed) {
        // Reset the memory state object fully
        state.grossTotal = 0;
        state.feesTotal = 0;
        state.netTotal = 0;
        state.transactions = [];
        
        // Push the blank values back onto the screen
        updateUI();
        localStorage.removeItem('merchant_ledger_data');
    }
});
updateUI();