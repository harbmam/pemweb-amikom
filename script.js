// Data Katalog Produk
const catalogData = [
    { id: 101, name: "Prosesor AMD Ryzen 5 5600", category: "Processor", price: 1650000, image: "asset/proces.png", stock: 15 },
    { id: 102, name: "VGA NVIDIA RTX 4060 8GB", category: "Graphics", price: 4200000, image: "asset/vga.png", stock: 8 },
    { id: 103, name: "RAM Corsair 16GB DDR4 3200MHz", category: "Memory", price: 580000, image: "asset/ram.png", stock: 25 },
    { id: 104, name: "SSD NVMe Samsung 980 500GB", category: "Storage", price: 750000, image: "asset/ssd.png", stock: 20 },
    { id: 105, name: "Casing Lian Li Lancool 216", category: "Casing", price: 1200000, image: "asset/case.png", stock: 12 },
    { id: 106, name: "Motherboard B550M PRO-VDH", category: "Motherboard", price: 1350000, image: "asset/mobo.png", stock: 10 }
];

// Data Jurnal / Artikel
const journalData = [
    {
        id: 1,
        title: "Panduan Memilih VGA untuk Gaming 2026",
        excerpt: "Temukan tips memilih kartu grafis yang tepat sesuai budget dan kebutuhan gaming Anda.",
        icon: "fa-display",
        date: "28 Apr 2026",
        readTime: "5 min"
    },
    {
        id: 2,
        title: "Optimasi RAM: DDR4 vs DDR5",
        excerpt: "Perbandingan performa dan harga antara DDR4 dan DDR5 untuk workstation dan gaming.",
        icon: "fa-memory",
        date: "25 Apr 2026",
        readTime: "4 min"
    },
    {
        id: 3,
        title: "Tips Merawat Komponen PC Agar Awet",
        excerpt: "Panduan praktis perawatan hardware komputer untuk memperpanjang usia pakai.",
        icon: "fa-screwdriver-wrench",
        date: "20 Apr 2026",
        readTime: "6 min"
    }
];

// State Management
let cart = JSON.parse(localStorage.getItem("pcaja_cart")) || [];

// DOM References
const productGrid = document.getElementById("productGrid");
const journalGrid = document.getElementById("journalGrid");
const cartList = document.getElementById("cartList");
const cartBadge = document.getElementById("cartBadge");
const cartTotal = document.getElementById("cartTotal");
const emptyCart = document.getElementById("emptyCart");
const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutForm = document.getElementById("checkoutForm");
const toastEl = document.getElementById("liveToast");
const toastBody = document.getElementById("toastMessage");
const toast = new bootstrap.Toast(toastEl);
const contactForm = document.getElementById("contactForm");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    renderCatalog();
    renderJournal();
    renderCart();
    animateStats();
    initContactForm();
});

// Render Katalog Produk
function renderCatalog() {
    productGrid.innerHTML = ""; 
    catalogData.forEach(product => {
        const col = document.createElement("div");
        col.className = "col-12 col-md-6 col-lg-4";
        col.innerHTML = `
            <div class="card product-card h-100">
                <div class="product-image-placeholder">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                </div>
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge bg-light text-dark badge-stock">${product.category}</span>
                        <span class="badge ${product.stock <= 5 ? 'bg-warning text-dark' : 'bg-success'} badge-stock">
                            ${product.stock <= 5 ? 'Stok Terbatas' : 'Tersedia'}
                        </span>
                    </div>
                    <h5 class="card-title mb-1">${escapeHtml(product.name)}</h5>
                    <p class="text-primary fw-bold fs-5 mb-3">Rp ${formatRupiah(product.price)}</p>
                    <button class="btn btn-primary mt-auto add-to-cart-btn" data-id="${product.id}" ${product.stock <= 0 ? 'disabled' : ''}>
                        <i class="fa-solid fa-cart-plus me-1"></i> ${product.stock <= 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                    </button>
                </div>
            </div>
        `;
        productGrid.appendChild(col);
    });

    productGrid.addEventListener("click", (e) => {
        const btn = e.target.closest(".add-to-cart-btn");
        if (btn && !btn.disabled) {
            addToCart(parseInt(btn.dataset.id));
        }
    });
}

// Render Jurnal / Artikel
function renderJournal() {
    journalGrid.innerHTML = "";
    journalData.forEach(article => {
        const col = document.createElement("div");
        col.className = "col-12 col-md-6 col-lg-4";
        col.innerHTML = `
            <article class="card journal-card h-100">
                <div class="journal-image">
                    <i class="fa-solid ${article.icon}"></i>
                </div>
                <div class="card-body">
                    <div class="d-flex gap-2 mb-2">
                        <small class="text-muted">${article.date}</small>
                        <small class="text-muted">•</small>
                        <small class="text-muted">${article.readTime}</small>
                    </div>
                    <h5 class="card-title h6 fw-semibold mb-2">${escapeHtml(article.title)}</h5>
                    <p class="card-text text-muted small mb-3">${escapeHtml(article.excerpt)}</p>
                    <a href="#" class="btn btn-outline-primary btn-sm stretched-link">
                        Baca Selengkapnya <i class="fa-solid fa-arrow-right ms-1"></i>
                    </a>
                </div>
            </article>
        `;
        journalGrid.appendChild(col);
    });
}

// Tambah ke Keranjang
function addToCart(productId) {
    const product = catalogData.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        if (existingItem.qty >= product.stock) {
            showToast("Maaf, stok tidak mencukupi.", "warning");
            return;
        }
        existingItem.qty += 1;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
    }

    saveCart();
    renderCart();
    showToast(`${product.name} ditambahkan ke keranjang.`, "success");
}

// Render Keranjang
function renderCart() {
    cartList.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        emptyCart.classList.remove("d-none");
        checkoutBtn.disabled = true;
    } else {
        emptyCart.classList.add("d-none");
        checkoutBtn.disabled = false;

        cart.forEach(item => {
            const product = catalogData.find(p => p.id === item.id);
            const maxQty = product ? product.stock : 99;
            const subtotal = item.price * item.qty;
            total += subtotal;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="ps-4 fw-medium">${escapeHtml(item.name)}</td>
                <td>Rp ${formatRupiah(item.price)}</td>
                <td class="text-center">
                    <div class="quantity-control mx-auto">
                        <button onclick="updateQty(${item.id}, -1)" ${item.qty <= 1 ? 'disabled' : ''}>-</button>
                        <span>${item.qty}</span>
                        <button onclick="updateQty(${item.id}, 1)" ${item.qty >= maxQty ? 'disabled' : ''}>+</button>
                    </div>
                </td>
                <td class="text-center fw-bold">Rp ${formatRupiah(subtotal)}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-danger" onclick="removeItem(${item.id})" title="Hapus">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            `;
            cartList.appendChild(row);
        });
    }

    cartTotal.textContent = `Rp ${formatRupiah(total)}`;
    cartBadge.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
}

// Update Jumlah Item
function updateQty(productId, change) {
    const item = cart.find(p => p.id === productId);
    const product = catalogData.find(p => p.id === productId);
    if (!item || !product) return;

    item.qty += change;
    if (item.qty < 1) item.qty = 1;
    if (item.qty > product.stock) item.qty = product.stock;

    saveCart();
    renderCart();
}

// Hapus Item
function removeItem(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
    showToast("Item dihapus dari keranjang.", "warning");
}

// Simpan ke LocalStorage
function saveCart() {
    localStorage.setItem("pcaja_cart", JSON.stringify(cart));
}

// Animasi Counter Stats
function animateStats() {
    const targets = [
        { id: "statCustomers", end: 2500, suffix: "+" },
        { id: "statOrders", end: 8900, suffix: "+" }
    ];

    targets.forEach(target => {
        const el = document.getElementById(target.id);
        if (!el) return;

        let current = 0;
        const increment = Math.ceil(target.end / 50);
        const timer = setInterval(() => {
            current += increment;
            if (current >= target.end) {
                el.textContent = target.end.toLocaleString("id-ID") + target.suffix;
                clearInterval(timer);
            } else {
                el.textContent = current.toLocaleString("id-ID");
            }
        }, 30);
    });
}

// Handle Checkout Form
checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const orderData = {
        id: Date.now(),
        date: new Date().toLocaleDateString("id-ID"),
        customer: document.getElementById("custName").value.trim(),
        phone: document.getElementById("custPhone").value.trim(),
        address: document.getElementById("custAddress").value.trim(),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.qty), 0)
    };

    // Simpan ke LocalStorage (simulasi database)
    const orders = JSON.parse(localStorage.getItem("pcaja_orders")) || [];
    orders.push(orderData);
    localStorage.setItem("pcaja_orders", JSON.stringify(orders));

    // Reset
    cart = [];
    saveCart();
    renderCart();
    checkoutForm.reset();

    const modalEl = bootstrap.Modal.getInstance(document.getElementById("checkoutModal"));
    modalEl.hide();

    showToast("Pesanan berhasil! Tim kami akan menghubungi Anda via WhatsApp.", "success");
});

// Handle Contact Form
function initContactForm() {
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            showToast("Pesan terkirim! Kami akan membalas dalam 1x24 jam.", "success");
            contactForm.reset();
        });
    }
}

// Helper: Format Rupiah
function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID").format(number);
}

// Helper: Escape XSS
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// Helper: Toast Notification
function showToast(message, type) {
    toastBody.textContent = message;
    const header = toastEl.querySelector(".toast-header");
    const icon = header.querySelector("i");

    header.style.backgroundColor = "";
    header.style.color = "";
    icon.className = "fa-solid fa-circle-info me-2";

    if (type === "success") {
        header.style.backgroundColor = "#198754";
        header.style.color = "#fff";
        icon.className = "fa-solid fa-circle-check me-2";
    } else if (type === "warning") {
        header.style.backgroundColor = "#ffc107";
        header.style.color = "#000";
        icon.className = "fa-solid fa-circle-exclamation me-2";
    }

    toast.show();
}