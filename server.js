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
