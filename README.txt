RENA HANDMADE - SIMPLE ORDER VERSION

Online payment has been removed. Customers fill in delivery details and click “Place Order”. The order is saved and a confirmation email is sent to Rena.

Email setup still needs Gmail SMTP/App Password so the website can send the email automatically.

SETUP
1. Open this folder in VS Code.
2. Open Terminal in this folder.
3. Run: npm install
4. Create a file named .env beside package.json.
5. Copy .env.example into .env.
6. Put your Gmail App Password in SMTP_PASS. Never put your normal Gmail password in the website.
7. Run: npm start
8. Open http://localhost:3000
9. Add product → Cart → Checkout → fill details → Place Order.

The email sent to ORDER_NOTIFICATION_EMAIL includes customer name, phone, country, address, pincode, street, products, quantity, total amount, order status, order ID, and date/time.
