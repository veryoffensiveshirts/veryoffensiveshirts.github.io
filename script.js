const price = 15;

const cart_button = document.getElementById("cart-button");

const products = {
    shirts: {
        cute: [
            { name: 'Bee Beautiful', price: price, image: 'images/12CUTE.png' },
            { name: 'Boss Babe Energy', price: price, image: 'images/13.png' },
            { name: 'Absolute Queen', price: price, image: 'images/14.png' },
            { name: 'Good Morning Sunshine', price: price, image: 'images/15.png' },
            { name: 'Stay Pawsitive', price: price, image: 'images/16.png' },
        ],
        memes: [
            { name: 'I Love Goth Girls', price: price, image: 'images/1Ilovegothgirls.png' },
            { name: 'Skib.', price: price, image: 'images/2.png' },
            { name: 'Don\'t Commit Arson', price: price, image: 'images/dont.png' },
            { name: 'Don\'t Break My Edging Streak', price: price, image: 'images/5.png' },
            { name: 'R U Restarted?', price: price, image: 'images/6.png' },
            { name: 'I Prefer Men', price: price, image: 'images/7.png' },
            { name: 'It\'s Not Gay If You Do It For Money', price: price, image: 'images/8.png' },
            { name: 'Gimme Head', price: price, image: 'images/9.png' },
            { name: 'Let Me Touch You Bro', price: price, image: 'images/10.png' },
            { name: 'So No Head?', price: price, image: 'images/11sonohead.png' },
        ],
        political: {
            woke: [
                { name: 'My Body, My Choice', price: price, image: 'images/22.png' },
                { name: 'Make Love, Not War', price: price, image: 'images/23.png' },
                { name: 'Climate Action. Now.', price: price, image: 'images/24.png' },
                { name: 'Respect Pronouns', price: price, image: 'images/25.png' },
            ],
            antiWoke: [
                { name: 'Tax is Theft', price: price, image: 'images/17.png' },
                { name: 'Small Government, Big Freedom', price: price, image: 'images/18.png' },
                { name: 'Freedom isn\'t Free', price: price, image: 'images/19.png' },
                { name: 'MAGA', price: price, image: 'images/20.png' },
                { name: 'Ban Trudeau', price: price, image: 'images/21.png' },
            ],
        },
    },
};

// Initialize cart as an empty array
let cart = JSON.parse(localStorage.getItem('cart')) || [];

if (cart.length == 0){
    cart_button.style.visibility = "hidden";
}

const humorDropdown = document.getElementById('humor-dropdown');
const types = ['cute', 'memes', 'political'];
types.forEach(type => {
    let option = document.createElement('option');
    option.value = type;
    option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    humorDropdown.appendChild(option);
});

// Add event listener to Humor dropdown
document.getElementById('humor-dropdown').addEventListener('change', function() {
    const humorCategory = this.value;
    const subtypeDropdown = document.getElementById('subtype-dropdown');
    const subtypeLabel = document.getElementById('subtype-label');

    // Reset the products grid
    document.getElementById('products-grid').innerHTML = '';
    if (cart.length == 0){
        cart_button.style.visibility = "hidden";
    }

    if (humorCategory === 'political') {
        // Show political subtype options (woke, anti-woke)
        subtypeDropdown.style.display = 'inline-block';
        subtypeLabel.style.display = 'inline-block';
    } else if ((humorCategory === 'memes') || (humorCategory === 'cute')){
        // Hide political subtype and display products
        subtypeDropdown.value = '';
        subtypeDropdown.style.display = 'none';
        subtypeLabel.style.display = 'none';
        displayProducts(humorCategory);
        cart_button.style.visibility = "visible";
    } else {
        subtypeDropdown.style.display = 'none';
        subtypeLabel.style.display = 'none';
        if (cart.length == 0){
            cart_button.style.visibility = "hidden";
        }
    }
    
});

// Add event listener to Subtype (Political) dropdown
document.getElementById('subtype-dropdown').addEventListener('change', function() {
    const humorCategory = document.getElementById('humor-dropdown').value;
    const subtypeCategory = this.value;

    if (humorCategory && subtypeCategory) {
        displayProducts(humorCategory, subtypeCategory);
        cart_button.style.visibility = "visible";
    }
});

// Display products function
function displayProducts(humorCategory, subtypeCategory = '') {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';

    let selectedProducts;
    if (humorCategory === 'political') {
        selectedProducts = products.shirts.political[subtypeCategory] || [];
    } else {
        selectedProducts = products.shirts[humorCategory] || [];
    }

    selectedProducts.forEach(product => {
        let hidden = ["R U Restarted?", "It\'s Not Gay If You Do It For Money", "MAGA"];
        if(hidden.includes(product.name)){
            return;
        }
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');
        productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}" width=95%>
            <p>${product.name}</p>
            <p>$${product.price}</p>
            <select id="size-${product.name}">
              <option value="-">-- Choose Size --</option>
              <option value="s">Small (S)</option>
              <option value="m">Medium (M)</option>
              <option value="l">Large (L)</option>
              <option value="xl">Extra Large (XL)</option>
              <option value="xxl">Extra Extra Large (XXL)</option>
            </select>
            <br><br>
            <button id="add-to-cart-${product.name}" class="add-to-cart" disabled=true>Add to Cart</button>
        `;
        productsGrid.appendChild(productDiv);

        // Add event listener to the "Add to Cart" button
        const addButton = document.getElementById('add-to-cart-' + product.name);
        const sizeSelect = document.getElementById('size-' + product.name);

        sizeSelect.addEventListener('change', function() {
            if (sizeSelect.value != '-') {
                addButton.disabled = false;
            } else {
                addButton.disabled = true;
            }
        });

        addButton.addEventListener('click', function() {
            const size = document.getElementById('size-' + product.name).value;
            addToCart(product.name, product.price, size);
        });
    });
}

// Add to cart function
function addToCart(name, price, size) {
  if(size != '-'){
    size = size.toUpperCase();
    cart.push({ name, price, size });
    updateCartDisplay();
    localStorage.setItem('cart', JSON.stringify(cart)); // Save cart to localStorage
  }else{
    alert("Please select a size before adding this item to your cart!");
  }
}

// Toggle cart dropdown visibility
document.getElementById('cart-button').addEventListener('click', function() {
    const cartContent = document.getElementById('cart-content');
    cartContent.style.display = cartContent.style.display === 'none' ? 'block' : 'none';
});

// Clear the cart
document.getElementById('clear-cart').addEventListener('click', function() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    if (document.getElementById('humor-dropdown').value == ''){
        cart_button.style.visibility = "hidden";
    }
});

// Update the cart dropdown and button text
function updateCartDisplay() {
    const cartButton = document.getElementById('cart-button');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartContent = document.getElementById('cart-content');

    // Update cart button text with item count
    cartButton.textContent = `Cart (${cart.length})`;

    // Populate cart content
    cartItemsList.innerHTML = '';
    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${item.name} (${item.size}) - $${item.price}
            <button onclick="removeFromCart(${index})" style="margin-left: 10px; color: black;">Delete</button>
        `;
        cartItemsList.appendChild(li);
    });

    // Show cart content
    cartContent.style.display = cart.length > 0 ? 'block' : 'none';
}

function redirectToHome() {
    window.location.href = "index.html";
}
  
// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
    localStorage.setItem('cart', JSON.stringify(cart)); // Update localStorage
    if (cart.length == 0 && document.getElementById('humor-dropdown').value == ''){
        cart_button.style.visibility = "hidden";
    }
}
  
// Redirect to checkout
function redirectToCheckout() {
    localStorage.setItem('cart', JSON.stringify(cart)); // Save cart before navigating
    window.location.href = "checkout.html";
}
