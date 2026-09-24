
const products = [
 {id:'flower-turtle',name:'Flower Turtle',cat:'Clay Animal Keychains',price:149,emoji:'🐢',image:'assets/clay-flower-turtle.jpg'},
 {id:'red-bow',name:'A Red Bow',cat:'Hair Accessories',price:69,image:'assets/red-bow.jpg'},
 {id:'white-bow',name:'White Bow',cat:'Hair Accessories',price:69,emoji:'🎀',image:'assets/white bow.jpg'},
];
const categories = ['All','Hair Accessories','Clay Animal Keychains'];
const getCart=()=>JSON.parse(localStorage.getItem('rena_cart')||'[]');
const getWish=()=>JSON.parse(localStorage.getItem('rena_wish')||'[]');
const saveCart=x=>localStorage.setItem('rena_cart',JSON.stringify(x));
const saveWish=x=>localStorage.setItem('rena_wish',JSON.stringify(x));
const money=n=>'₹'+Number(n).toLocaleString('en-IN');
function toast(msg){let n=document.querySelector('.notice');if(!n)return;n.textContent=msg;n.classList.add('show');setTimeout(()=>n.classList.remove('show'),1800)}
function updateBadges(){
 const c=getCart().reduce((s,x)=>s+x.qty,0), w=getWish().length;
 document.querySelectorAll('[data-cart-count]').forEach(x=>x.textContent=c);
 document.querySelectorAll('[data-wish-count]').forEach(x=>x.textContent=w);
}
function addCart(id){let c=getCart(),x=c.find(a=>a.id===id);if(x)x.qty++;else c.push({id,qty:1});saveCart(c);updateBadges();toast('Added to cart ♡')}
function toggleWish(id){let w=getWish();if(w.includes(id))w=w.filter(x=>x!==id),toast('Removed from wishlist');else w.push(id),toast('Saved to wishlist ♡');saveWish(w);updateBadges()}
function productCard(p){let wished=getWish().includes(p.id);let visual=p.image?`<img src="${p.image}" alt="${p.name}">`:p.emoji;return `<article class="card"><div class="product-art">${visual}</div><div class="card-body"><span class="tag">${p.cat}</span><h3>${p.name}</h3><div class="price">${money(p.price)}</div><div class="card-actions"><button class="wish" onclick="toggleWish('${p.id}')" aria-label="Wishlist">${wished?'♥':'♡'}</button><button class="cartbtn" onclick="addCart('${p.id}')" aria-label="Add to cart">🛒</button></div></div></article>`}
function renderProducts(list,el){el.innerHTML=list.map(productCard).join('');updateBadges()}
function initGallery(){
 const grid=document.querySelector('#galleryGrid');if(!grid)return;
 const images=products.filter(p=>p.image);
 grid.innerHTML=images.length?images.map(p=>`<div class="gallery-item"><div class="gallery-art"><img src="${p.image}" alt="${p.name}"></div><h3>${p.name}</h3></div>`).join(''):'<div class="empty" style="grid-column:1/-1"><h2>No product images yet</h2><p>Add an image to a product to show it here.</p></div>';
}
function initShop(){
 const grid=document.querySelector('#productGrid');if(!grid)return;
 const filters=document.querySelector('#filters');
 filters.innerHTML=categories.map((c,i)=>`<button class="filter ${i===0?'active':''}" data-cat="${c}">${c}</button>`).join('');
 renderProducts(products,grid);
 filters.addEventListener('click',e=>{if(!e.target.matches('.filter'))return;document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));e.target.classList.add('active');let c=e.target.dataset.cat;renderProducts(c==='All'?products:products.filter(p=>p.cat===c),grid)})
}
function initCart(){
 const el=document.querySelector('#cartList');if(!el)return;let c=getCart();
 if(!c.length){el.innerHTML='<div class="empty"><div style="font-size:55px">🛒</div><h2>Your cart is waiting for something cute!</h2><p>Add a handmade creation from the shop.</p><a class="btn" href="shop.html">Shop Now →</a></div>';return}
 function draw(){c=getCart();if(!c.length){location.reload();return}let total=0;el.innerHTML=c.map(x=>{let p=products.find(a=>a.id===x.id);total+=p.price*x.qty;return `<div class="cart-item"><div class="cart-thumb">${p.emoji}</div><div class="cart-info"><h3>${p.name}</h3><span>${money(p.price)}</span></div><div class="qty"><button onclick="changeQty('${p.id}',-1)">−</button><b>${x.qty}</b><button onclick="changeQty('${p.id}',1)">+</button></div><button class="iconbtn" onclick="removeCart('${p.id}')">🗑️</button></div>`}).join('')+`<div class="total"><h2>Total: ${money(total)}</h2><a class="btn" href="checkout.html">Proceed to Checkout →</a></div>`}
 window.changeQty=(id,d)=>{let x=c.find(a=>a.id===id);x.qty+=d;if(x.qty<1)c=c.filter(a=>a.id!==id);saveCart(c);draw();updateBadges()}
 window.removeCart=id=>{c=c.filter(a=>a.id!==id);saveCart(c);draw();updateBadges()}
 draw()
}
function initWishlist(){
 const el=document.querySelector('#wishGrid');if(!el)return;let w=getWish();let list=products.filter(p=>w.includes(p.id));
 el.innerHTML=list.length?list.map(productCard).join(''):'<div class="empty" style="grid-column:1/-1"><div style="font-size:55px">♡</div><h2>Your wishlist is empty</h2><p>Save your favorite handmade pieces here.</p><a class="btn" href="shop.html">Explore Products →</a></div>';
 updateBadges()
}
document.addEventListener('DOMContentLoaded',()=>{document.querySelector('.menu')?.addEventListener('click',()=>document.querySelector('.navlinks').classList.toggle('open'));updateBadges();initShop();initCart();initWishlist();initGallery()})
