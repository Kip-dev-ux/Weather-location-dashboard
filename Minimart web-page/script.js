let cart = [];

const cartBtn = document.querySelector('.cart-btn');
const addButtons = document.querySelectorAll('.add-btn');
const cartModal = document.getElementById('cart-modal');
const closeModalBtn = document.getElementById('close-modal');
const cartItemsList = document.getElementById('cart-items');
const modalTotalAmount = document.getElementById('modal-total-amount');
const clearCartBtn = document.getElementById('clear-cart');
const whatsappBtn = document.getElementById('whatsapp-checkout');

const storePhone = "254700000000";

addButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.parentElement;
    const name = card.querySelector('h3').innerText;
    const priceText = card.querySelector('.price').innerText;
    const price = parseInt(priceText.replace('KES ', ''));

    cart.push({ name, price });
    updateCartUI();

    button.innerText = 'Added! ✓';
    button.style.backgroundColor = '#1b4332';

    setTimeout(() => {
      button.innerText = 'Add to Cart';
      button.style.backgroundColor = '#2d6a4f';
    }, 800);
  });
});

function updateCartUI() {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  cartBtn.innerText = `Cart (${cart.length}) - KES ${total}`;
  modalTotalAmount.innerText = total;

  cartItemsList.innerHTML = '';
  if (cart.length === 0) {
    cartItemsList.innerHTML = '<li>Your cart is empty.</li>';
    return;
  }

  cart.forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${item.name}</span><span>KES ${item.price}</span>`;
    cartItemsList.appendChild(li);
  });
}

cartBtn.addEventListener('click', () => cartModal.classList.remove('hidden'));
closeModalBtn.addEventListener('click', () => cartModal.classList.add('hidden'));

clearCartBtn.addEventListener('click', () => {
  cart = [];
  updateCartUI();
});

whatsappBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  let message = "Hello FreshCart Minimart! I'd like to place an order:\n\n";
  cart.forEach((item, index) => {
    message += `${index + 1}. ${item.name} - KES ${item.price}\n`;
  });

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  message += `\n*Total: KES ${total}*`;

  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me{storePhone}?text=${encodedMessage}`, '_blank');
});
