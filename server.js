require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const STORE_NAME = process.env.STORE_NAME || 'Rena Handmade';
const ORDER_EMAIL = process.env.ORDER_NOTIFICATION_EMAIL || 'renasunzone@gmail.com';
const ordersFile = path.join(__dirname, 'data', 'orders.json');
fs.mkdirSync(path.dirname(ordersFile), { recursive: true });
if (!fs.existsSync(ordersFile)) fs.writeFileSync(ordersFile, '[]');

// Keep this catalog server-side so customers cannot change prices from the browser.
const PRODUCTS = [
  {id:'flower-turtle',name:'Flower Turtle',cat:'Clay Animal Keychains',price:149},
  {id:'red-bow',name:'Red Bow',cat:'Hair Accessories',price:69},
  {id:'white-bow',name:'White Bow',cat:'Hair Accessories',price:69}
];

function readOrders(){ try { return JSON.parse(fs.readFileSync(ordersFile,'utf8')); } catch { return []; } }
function writeOrders(orders){ fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2)); }
function money(n){ return `₹${Number(n).toLocaleString('en-IN')}`; }
function clean(v,max=300){ return String(v ?? '').trim().slice(0,max); }

function mailer(){
  if(!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_PASS === 'your_gmail_app_password') return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

async function sendOrderEmail(order){
  const transport = mailer();
  if(!transport) throw new Error('SMTP is not configured. Set SMTP_USER and replace SMTP_PASS with a Gmail App Password in .env.');
  const items = order.items.map(i => `<tr><td style="padding:8px;border-bottom:1px solid #f0d9d1">${escapeHtml(i.name)}</td><td style="padding:8px;border-bottom:1px solid #f0d9d1;text-align:center">${i.qty}</td><td style="padding:8px;border-bottom:1px solid #f0d9d1;text-align:right">${money(i.price*i.qty)}</td></tr>`).join('');
  const paymentMethod = escapeHtml(order.customer.paymentMethod || 'Not provided');
  const paymentDetails = order.customer.paymentDetails ? escapeHtml(order.customer.paymentDetails) : 'Not provided';
  const paymentStatus = order.paymentStatus || 'Payment details captured';
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;color:#5b3428">
    <h2 style="color:#df7184">🎉 New Order Confirmed — ${STORE_NAME}</h2>
    <p><b>Order ID:</b> ${escapeHtml(order.orderId)}</p>
    <p><b>Date & Time:</b> ${escapeHtml(order.dateTime)}</p>
    <hr>
    <h3>Customer Details</h3>
    <p><b>Customer name:</b> ${escapeHtml(order.customer.name)}</p>
    <p><b>Phone number:</b> ${escapeHtml(order.customer.phone)}</p>
    <p><b>Country:</b> ${escapeHtml(order.customer.country)}</p>
    <p><b>Address:</b> ${escapeHtml(order.customer.address)}</p>
    <p><b>Pincode:</b> ${escapeHtml(order.customer.pincode)}</p>
    <p><b>Street name:</b> ${escapeHtml(order.customer.street)}</p>
    <h3>Ordered Products</h3>
    <table style="border-collapse:collapse;width:100%"><thead><tr><th style="text-align:left;padding:8px">Product</th><th style="padding:8px">Quantity</th><th style="text-align:right;padding:8px">Amount</th></tr></thead><tbody>${items}</tbody></table>
    <h3 style="text-align:right">Total amount: ${money(order.total)}</h3>
    <p><b>Payment method:</b> ${paymentMethod}</p>
    <p><b>Payment details:</b> ${paymentDetails}</p>
    <p><b>Payment status:</b> ${escapeHtml(paymentStatus)}</p>
    <p><b>Order status:</b> Confirmed ✅</p>
    ${order.customer.email ? `<p><b>Customer email:</b> ${escapeHtml(order.customer.email)}</p>` : ''}
  </div>`;
  await transport.sendMail({ from: process.env.SMTP_USER, to: ORDER_EMAIL, subject: `🎉 New Rena Order ${order.orderId} — ${money(order.total)}`, html });
  return true;
}

function escapeHtml(s){ return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function makeOrderId(){ return `RENA-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`; }

// Simple setup-status endpoint: it never exposes the email password.
app.use(express.json({limit:'100kb'}));

app.get('/api/status',(req,res)=>{
  res.json({
    ok:true,
    emailConfigured:Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
    notificationEmail:ORDER_EMAIL,
    message: process.env.SMTP_USER && process.env.SMTP_PASS
      ? 'Order email is configured.'
      : 'Order email is not configured. Create .env and add your Gmail SMTP settings, then restart the server.'
  });
});

app.get('/api/config',(req,res)=>{
  res.json({
    ok:true,
    paymentMethod: clean(process.env.PAYMENT_METHOD || 'UPI', 80),
    paymentInstructions: process.env.PAYMENT_DETAILS ? 'Payment instructions available after order placement.' : 'Payment details not configured yet.'
  });
});

app.post('/api/create-order', async (req,res)=>{
  try {
    const customer = req.body.customer || {};
    const rawItems = Array.isArray(req.body.items) ? req.body.items : [];
    if(!rawItems.length) return res.status(400).json({error:'Cart is empty.'});
    const defaultPaymentMethod = clean(process.env.PAYMENT_METHOD || 'UPI', 80);
    const defaultPaymentDetails = clean(process.env.PAYMENT_DETAILS || '', 200);
    const name=clean(customer.name,100), phone=clean(customer.phone,30), country=clean(customer.country,80), address=clean(customer.address,300), pincode=clean(customer.pincode,20), street=clean(customer.street,150), email=clean(customer.email,150), paymentMethod=clean(customer.paymentMethod || defaultPaymentMethod,80), paymentDetails=clean(customer.paymentDetails || defaultPaymentDetails,200);
    if(!name || !phone || !country || !address || !pincode || !street || !paymentMethod) return res.status(400).json({error:'Please fill all required customer and payment details.'});
    const items = rawItems.map(x=>{
      const p=PRODUCTS.find(a=>a.id===x.id); const qty=Math.max(1,Math.min(20,Number(x.qty)||1));
      if(!p) throw new Error('Invalid product in cart.');
      return {id:p.id,name:p.name,qty,price:p.price};
    });
    const total=items.reduce((sum,x)=>sum+x.price*x.qty,0);
    if(total<1) return res.status(400).json({error:'Invalid order total.'});
    const paymentStatus = paymentMethod === 'Cash on Delivery' ? 'Pending on delivery' : 'Payment details collected';
    const orderId=makeOrderId();
    const order={orderId,customer:{name,phone,country,address,pincode,street,email,paymentMethod,paymentDetails},items,total,paymentStatus,orderStatus:'Confirmed',dateTime:new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),createdAt:new Date().toISOString(),ownerEmailSent:false};
    const orders=readOrders(); orders.push(order); writeOrders(orders);
    try{
      await sendOrderEmail(order);
      order.ownerEmailSent=true;
      order.ownerEmailError=null;
    }catch(e){
      order.ownerEmailSent=false;
      order.ownerEmailError=e.message;
      writeOrders(orders);
      return res.status(503).json({code:'EMAIL_NOT_CONFIGURED',error:`Order was saved, but the confirmation email could not be sent: ${e.message}`});
    }
    writeOrders(orders);
    res.json({ok:true,orderId:order.orderId,orderStatus:order.orderStatus,paymentStatus:order.paymentStatus,emailSent:true});
  } catch(e){ console.error(e); res.status(400).json({error:e.message||'Could not place order.'}); }
});

app.get('/api/order/:orderId',(req,res)=>{
  const order=readOrders().find(o=>o.orderId===req.params.orderId);
  if(!order) return res.status(404).json({error:'Order not found'});
  res.json({
    orderId:order.orderId,
    paymentStatus:order.paymentStatus,
    paymentMethod:order.customer.paymentMethod,
    paymentDetails:order.customer.paymentDetails,
    dateTime:order.dateTime,
    total:order.total
  });
});

app.use(express.static(__dirname));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'index.html')));
app.listen(PORT,()=>console.log(`${STORE_NAME} running at http://localhost:${PORT}`));
