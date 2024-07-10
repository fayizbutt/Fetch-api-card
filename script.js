const products = [];

async function fetchProductsFromServer() {
    try {
        const response = await fetch('https://usmanlive.com/wp-json/api/stories');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        products.push(...data);
        displayProducts();
    } catch (error) {
        console.error('Failed to fetch products:', error);
    }
}

async function saveProductsToServer() {
    try {
        const response = await fetch('https://usmanlive.com/wp-json/api/stories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(products)
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
    } catch (error) {
        console.error('Failed to save products:', error);
    }
}

function generateProductCard(product, index) {
    return `
        <div class="product-card" data-index="${index}">
            <div>
                <h2 class="product-title">${product.title}</h2>
                <p class="product-content">${product.content}</p>
            </div>
            <div class="product-actions">
                <button class="edit-btn" onclick="editProduct(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteProduct(${index})">Delete</button>
            </div>
        </div>
    `;
}

function displayProducts(filteredProducts = products) {
    const productContainer = document.getElementById('product-container');
    productContainer.innerHTML = '';
    filteredProducts.forEach((product, index) => {
        const productCardHTML = generateProductCard(product, index);
        productContainer.insertAdjacentHTML('beforeend', productCardHTML);
    });
}

function openModal() {
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    modalTitle.innerText = 'Add Product';
    document.getElementById('cardForm').reset();
    document.getElementById('product-index').value = '';
    document.getElementById('modal-submit-btn').innerText = 'Add Card';
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('product-modal');
    modal.style.display = 'none';
}

document.getElementById('add-product-btn').addEventListener('click', openModal);
document.querySelector('.close').addEventListener('click', closeModal);

document.getElementById('cardForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const index = document.getElementById('product-index').value;
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    const product = { title, content };

    if (index === '') {
        products.push(product);
    } else {
        products[index] = product;
    }

    await saveProductsToServer();
    displayProducts();
    closeModal();
});

function editProduct(index) {
    const product = products[index];
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    modalTitle.innerText = 'Edit Product';

    document.getElementById('product-index').value = index;
    document.getElementById('title').value = product.title;
    document.getElementById('content').value = product.content;
    document.getElementById('modal-submit-btn').innerText = 'Save Changes';
    modal.style.display = 'flex';
}

async function deleteProduct(index) {
    products.splice(index, 1);
    await saveProductsToServer();
    displayProducts();
}

function filterProducts(searchInput) {
    const filteredProducts = products.filter(product => {
        const searchableText = `${product.title} ${product.content}`.toLowerCase();
        return searchableText.includes(searchInput.toLowerCase());
    });

    displayProducts(filteredProducts);
}

document.getElementById('searchInput').addEventListener('input', function(event) {
    const searchTerm = event.target.value.trim();
    filterProducts(searchTerm);
});

fetchProductsFromServer();
