# Duka Connect API

A backend system for a simple e-commerce platform integrating M-Pesa STK Push payments, order management, and AI-generated responses using the Gemini API.

---

## Features

- Product and order management
- M-Pesa STK Push integration (Daraja API)
- Payment callback handling
- Payment status checking
- AI-generated thank-you messages using Gemini API

---

## Tech Stack

- Node.js
- Express.js
- M-Pesa Daraja API (Sandbox)
- Google Gemini API
- dotenv

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/duka-connect.git
cd duka-connect
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` file

```env
PORT=3000

GOOGLE_API_KEY=your_gemini_api_key

SANDBOX_MPESA_SHORTCODE=your_shortcode
SANDBOX_MPESA_PASSKEY=your_passkey
SANDBOX_MPESA_CALLBACK_URL=your_ngrok_url/callback
```

### 4. Run the server

```bash
npm start
```

Server runs at: `http://localhost:3000`

---

## API Endpoints

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Get all products |
| GET | `/products/:id` | Get a single product |
| POST | `/products` | Create a product |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | Get all orders |
| GET | `/orders/:id` | Get a single order |
| POST | `/orders` | Create an order |

### Payments (M-Pesa)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/pay` | Initiate STK Push |
| POST | `/callback` | Receive Safaricom callback |
| GET | `/payment-status/:checkoutRequestID` | Check payment status |

### AI Feature

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/thank-you` | Generate AI thank-you message |

---

## Example Requests

### Create Order

```json
{
  "productIds": [1, 2, 3]
}
```

### M-Pesa Payment

```json
{
  "phone": "254724997755",
  "amount": 500
}
```

### AI Thank You

```json
{
  "name": "Sylvia",
  "amount": 500
}
```

---

## Flow

1. Create order
2. Initiate M-Pesa payment
3. Receive callback from Safaricom
4. Check payment status
5. Generate AI thank-you message using Gemini

---

## Notes

- Uses M-Pesa sandbox environment
- Ngrok is required for callback testing
- Do not commit `.env` file to GitHub

