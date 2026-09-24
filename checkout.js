(function(){
 const form=document.getElementById('checkoutForm'), summary=document.getElementById('checkoutSummary'), msg=document.getElementById('checkoutMsg'), btn=document.getElementById('payBtn');
 function cart(){try{return JSON.parse(localStorage.getItem('rena_cart')||'[]')}catch(e){return []}}
 function products(){return window.products||[]}
 function money(n){return '₹'+Number(n).toLocaleString('en-IN')}
 function showMessage(text,type){
   msg.textContent=text;
   msg.style.color=type==='error'?'#b42318':type==='success'?'#287a3d':'#8c6d63';
   msg.style.whiteSpace='pre-line';
 }
 function isLocalFile(){return window.location.protocol==='file:'}
 function friendlyNetworkError(err){
   if(isLocalFile()) return '⚠️ Please open the shop through the Rena server.\n\n1. Open Terminal in the Rena folder\n2. Run: npm start\n3. Open: http://localhost:3000';
   if(err && (err.name==='TypeError' || /fetch|network|failed to fetch/i.test(err.message||''))) return '⚠️ Could not connect to the Rena server.\n\nMake sure Terminal shows “Rena Handmade running at http://localhost:3000”, then refresh the page.';
   return err && err.message ? err.message : 'Something went wrong. Please try again.';
 }
 if(isLocalFile()){
   showMessage('⚠️ This checkout page was opened as a local file.\n\nPlease start the Rena server with npm start, then open http://localhost:3000.','error');
   btn.disabled=true;
 }
 const c=cart(); const ps=products();
 if(!c.length){summary.innerHTML='<h2>Your cart is empty</h2><p>Add something cute before checkout.</p><a class="btn" href="shop.html">Shop Now →</a>';form.style.display='none';return;}
 let total=0; let rows=c.map(x=>{const p=ps.find(a=>a.id===x.id); if(!p)return ''; total+=p.price*x.qty; return `<p><b>${p.name}</b><br>Qty: ${x.qty} × ${money(p.price)}</p>`}).join('');
 summary.innerHTML=`<h2>Order Summary</h2>${rows}<hr><h2>Total: ${money(total)}</h2>`;
 form.addEventListener('submit',async e=>{
   e.preventDefault();
   if(!form.checkValidity()){form.reportValidity();return;}
   if(isLocalFile()){
     showMessage('⚠️ Please open http://localhost:3000 before placing the order.','error');
     return;
   }
   btn.disabled=true; showMessage('Placing your order...');
   const data=Object.fromEntries(new FormData(form).entries());
   try{
     const r=await fetch('/api/create-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customer:data,items:c})});
     let order; try{order=await r.json()}catch(e){order={}}
     if(!r.ok) throw new Error(order.error||`Order server returned an error (${r.status}).`);
     localStorage.removeItem('rena_cart');
     window.location.href='order-success.html?order='+encodeURIComponent(order.orderId);
   }catch(err){
     btn.disabled=false;
     showMessage(friendlyNetworkError(err),'error');
   }
 });
})();
