const subForm = document.getElementById('subForm');
const subName = document.getElementById('subName');
const subCost = document.getElementById('subCost');
const renewalDate = document.getElementById('renewalDate');
const subList = document.getElementById('subList');
const monthlyTotalEl = document.getElementById('monthlyTotal');
const annualTotalEl = document.getElementById('annualTotal');

let subscriptions = JSON.parse(localStorage.getItem('audit_subscriptions')) || [];

function getDaysUntil(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  const diffTime = target - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function saveAndRender() {
  localStorage.setItem('audit_subscriptions', JSON.stringify(subscriptions));
  renderSubscriptions();
  updateTotals();
}

function updateTotals() {
  const monthly = subscriptions.reduce((sum, s) => sum + s.cost, 0);
  const annual = monthly * 12;

  monthlyTotalEl.textContent = `KES ${monthly.toLocaleString()}`;
  annualTotalEl.textContent = `KES ${annual.toLocaleString()}`;
}

function renderSubscriptions() {
  subList.innerHTML = '';

  subscriptions.forEach((sub) => {
    const daysLeft = getDaysUntil(sub.date);
    const isDueSoon = daysLeft >= 0 && daysLeft <= 3;

    const li = document.createElement('li');
    li.className = `sub-item ${isDueSoon ? 'due-soon' : ''}`;

    const badgeHTML = isDueSoon
      ? `<span class="badge">Due in ${daysLeft === 0 ? 'today' : daysLeft + 'd'}</span>`
      : '';

    li.innerHTML = `
      <div class="sub-info">
        <strong>${sub.name} ${badgeHTML}</strong>
        <small>Renews: ${sub.date}</small>
      </div>
      <div>
        <strong>KES ${sub.cost.toLocaleString()}/mo</strong>
        <button class="delete-btn" onclick="deleteSub(${sub.id})">✕</button>
      </div>
    `;
    subList.appendChild(li);
  });
}

window.deleteSub = function (id) {
  subscriptions = subscriptions.filter((s) => s.id !== id);
  saveAndRender();
};

subForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = subName.value.trim();
  const cost = Number(subCost.value);
  const date = renewalDate.value;

  if (!name || cost <= 0 || !date) return;

  subscriptions.push({
    id: Date.now(),
    name,
    cost,
    date
  });

  subForm.reset();
  saveAndRender();
});

saveAndRender();
