const express = require('express');
const bodyParser = require('body-parser');
const paypal = require('paypal-rest-sdk');
const dotenv = require('dotenv');
const path = require('path');
const nodemailer = require('nodemailer');

dotenv.config(); // Load environment variables

paypal.configure({
    mode: 'sandbox', // or 'live'
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET
});

const app = express();

// Middleware to serve static files (e.g., your HTML, JS, CSS)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'images')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Setup email transporter (using Gmail in this example)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL, // Your email address
        pass: process.env.EMAIL_PASSWORD // Your email password or app password
    }
});

// Route to send order details via email
app.post('/send-order-email', (req, res) => {
    const { name, address, cart, total, payerName } = req.body;
  
    const cartDetails = cart.map(item => `${item.name} (${item.size}) - $${item.price}`).join('\n');
    const emailContent = `
      New order placed by: ${payerName}
      Name: ${name}
      Address: ${address}
      Order details:
      ${cartDetails}
      Total: $${total}
    `;
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.RECEIVER_EMAIL, // The email where the order details should be sent
      subject: 'New Order Received',
      text: emailContent
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, error: error.message });
      } else {
        console.log('Email sent: ' + info.response);
        res.status(200).json({ success: true });
      }
    });
  });

// Function to send the order email
/*function sendOrderEmail(paymentDetails) {
    const mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL, // Your email
        subject: 'New Order Received',
        text: `
            You have received a new order:
            Name: ${paymentDetails.payer.name.given_name} ${paymentDetails.payer.name.surname}
            Email: ${paymentDetails.payer.email_address}
            Order Details: ${paymentDetails.purchase_units[0].description}
            Total Price: $${paymentDetails.purchase_units[0].amount.value}
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email: ', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}*/

// Route to handle payment creation (PayPal)
app.post('/pay', (req, res) => {
    const { paymentData } = req.body;

    const createPaymentJson = {
        intent: 'sale',
        payer: {
            payment_method: 'paypal',
        },
        redirect_urls: {
            return_url: 'http://localhost:5000/success',
            cancel_url: 'http://localhost:5000/cancel',
        },
        transactions: [
            {
                amount: {
                    currency: 'CAD',
                    total: '20',
                },
                description: 'Payment for your order.',
            },
        ],
    };

    paypal.payment.create(createPaymentJson, (error, payment) => {
        if (error) {
            console.error(error);
            res.status(500).send('Error creating payment');
        } else {
            const approvalUrl = payment.links.find((link) => link.rel === 'approval_url').href;
            sendOrderEmail(paymentData);
            res.send({ approvalUrl });
            res.send({ message: 'Payment processed' });
        }
    });
});

// Route for success page
app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const executePaymentJson = {
        payer_id: payerId,
        transactions: [
            {
                amount: {
                    currency: 'USD',
                    total: '100.00', // Set dynamic total amount here
                },
            },
        ],
    };

    paypal.payment.execute(paymentId, executePaymentJson, (error, payment) => {
        if (error) {
            console.error(error);
            res.status(500).send('Payment failed');
        } else {
            res.send('Payment Success');
        }
    });
});

// Route for cancel page
app.get('/cancel', (req, res) => {
    res.send('Payment canceled');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
