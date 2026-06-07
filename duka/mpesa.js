import { getAccessToken } from "./auth.js";

import express from "express";
const router = express.Router();

// console.log("MPESA ROUTES LOADED"); //for test


// Create STK endpoint
router.post("/pay", async (req, res) => {
    try{

        const{phone, amount} = req.body;

        if (!phone || !amount) {
            return res.status(400).json ({
                error: "Phone and Amount required!"
            });
        }

        const token = await getAccessToken(); //allow Saf API usage

        const BusinessShortCode = process.env.SANDBOX_MPESA_SHORTCODE;
        const passkey = process.env.SANDBOX_MPESA_PASSKEY; 
        const CallBackURL = process.env.SANDBOX_MPESA_CALLBACK_URL

        const date = new Date();

        const year = date.getFullYear();

        const month = (date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1);

        const day = (date.getDate() < 10 ? `0${date.getDate()}` : date.getDate());

        const hours = (date.getHours() < 10 ? `0${date.getHours()}` : date.getHours());

        const minutes = (date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes());

        const seconds = (date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds());

        // the full timestsmp:

        const Timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

        const password = Buffer.from(BusinessShortCode + passkey + Timestamp).toString("base64");


        const paymentDtls = {
            BusinessShortCode,
            Password: password,
            Timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: phone,
            PartyB: BusinessShortCode,
            PhoneNumber: phone,
            CallBackURL,
            AccountReference: "accountref",
            TransactionDesc: "Integration"
        };

        // API CALL
        const response = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(paymentDtls)
            }
        );
    
    if (!response.ok) {
        const errorText = await response.text();
        console.log("HTTP ERROR:", errorText);
    
        return res.status(500).json({
            error: "Safaricom request failed",
            details: errorText
        });
    }

    const resDtls = await response.json();
    console.log({
        timestamp: Timestamp,
        response: resDtls
    });

    return res.status(200).json({
        timestamp: Timestamp,
        response: resDtls
        });

        } catch (error) {
            console.log(error);

            return res.status(500).json({
            error: "STK Push failed"
            });
        }
        });

    
//Express callback route; without this Mpesa sends back data but server has no way to see it

router.post("/callback", (req, res) => {
    try {

        console.log("CALLBACK RECEIVED"); // 👈 added here

        const callback = req.body.Body.stkCallback;
        const resultCode = callback.ResultCode;
        const resultDesc = callback.ResultDesc;

        console.log("CheckoutRequestID:", callback.CheckoutRequestID);

        if (resultCode === 0) {
            console.log("PAYMENT SUCCESS");
            console.log(resultDesc);

            const metadata = callback.CallbackMetadata?.Item;

            if (metadata) {
            const amount = metadata.find(item => item.Name === "Amount")?.Value;
            // const mpesaReceiptNumber = metadata.find(item => item.Name === "MpesaReceiptNumber")?.Value;
            const phoneNumber = metadata.find(item => item.Name === "PhoneNumber")?.Value;

            console.log("Amount:", amount);
            console.log("Phone Number:", phoneNumber);  
            }
            
        } else {
            console.log("PAYMENT FAILED");
            console.log(resultDesc);
        }

        return res.status(200).json({
            message: "Callback received",
            resultCode,
            resultDesc
        });

    } catch (error) {
        console.log("Callback processing error:", error);
        return res.status(500).json({
            error: "Callback processing failed"
        });
    }
});


// Payment status endpoint-----------------------------
router.get("/payment-status/:checkoutRequestID", async (req, res) => {
    try {
        const token = await getAccessToken();

        const businessShortCode = process.env.SANDBOX_MPESA_SHORTCODE;
        const passkey = process.env.SANDBOX_MPESA_PASSKEY;

        // const { checkoutRequestID } = req.params;

        const date = new Date();

        const year = date.getFullYear();

        const month = (date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1);

        const day = (date.getDate() < 10 ? `0${date.getDate()}` : date.getDate());     

        const hours = (date.getHours() < 10 ? `0${date.getHours()}` : date.getHours());

        const minutes = (date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes());

        const seconds = (date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds());

        const Timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

        const password = Buffer.from(businessShortCode + passkey + Timestamp).toString("base64");

        const statusDtls = {
            BusinessShortCode: businessShortCode,
            Password: password,
            Timestamp,
            CheckoutRequestID: req.params.checkoutRequestID
        };  

        const response = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query",
            {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(statusDtls)
        });

        const data = await response.json();

        if (!response.ok) {
            console.log("HTTP ERROR:", data);
            return res.status(500).json({   
                error: "Safaricom request failed",
                details: data
            });
        }
        console.log("Payment status response:", data);

        return res.status(200).json({
            message: "Payment status retrieved",
            data
        });
    } catch (error) {
        console.log("Payment status error:", error);
        return res.status(500).json({   
            error: "Payment status retrieval failed"
        });
    }   
});


//SEND AI GENERATED THANK YOU NOTE

router.post("/thank-you", async (req, res) => {
    try {
        const { name, amount } = req.body;

        const prompt = `Write a thank you message for ${name} who just paid ${amount} KES. Be friendly and slightly humorous.
            Rules:
                - Only 1 message
                - Friendly tone
                - Slight humor
                - Max 40 words
                - No alternatives or lists`;

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": process.env.GOOGLE_API_KEY
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        const data = await response.json();

        const message =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;

        return res.json({ message });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "failed" });
    }
});



export default router;