import "dotenv/config";

async function getAccessToken() {
    const consumerKey = process.env.SANDBOX_MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.SANDBOX_MPESA_CONSUMER_SECRET;

    console.log("=== M-PESA TOKEN DEBUG ===");
    console.log("Consumer Key loaded:", !!consumerKey);
    console.log("Consumer Secret loaded:", !!consumerSecret);

    const auth = Buffer.from(
        `${consumerKey}:${consumerSecret}`
    ).toString("base64");

    try {
        const response = await fetch(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            {
                method: "GET",
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            }
        );

        console.log("HTTP Status:", response.status);
        console.log("HTTP Status Text:", response.statusText);

        const body = await response.text();

        console.log("Response Body:");
        console.log(body);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = JSON.parse(body);

        console.log("Access Token received successfully.");

        return data.access_token;

    } catch (error) {
        console.error("Error fetching access token:");
        console.error(error);

        return null;
    }
}

export { getAccessToken };