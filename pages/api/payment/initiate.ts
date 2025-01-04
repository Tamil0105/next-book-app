// // pages/api/payment/initiate.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import fetch from 'node-fetch';

// type PaymentRequest = {
//   amount: number;
//   orderId: string;
//   email: string;
//   phone: string;
//   orderCurrency?: string;
// };
// type CashfreeResponse = {
//     success: boolean;
//     cftoken: string;
//     error_message?: string;
//   };
  

// const API_URL = 'https://api.cashfree.com/api/v2/cftoken/order'; // Cashfree API URL
// const MERCHANT_ID = process.env.CASHFREE_MERCHANT_ID as string; // Your Merchant ID
// const API_KEY = process.env.CASHFREE_API_KEY as string; // Your API Key

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   const { amount, orderId, email, phone, orderCurrency = 'INR' }: PaymentRequest = req.body;

//   const body = {
//     order_amount: amount,
//     order_currency: orderCurrency,
//     customer_email: email,
//     customer_phone: phone,
//     order_id: orderId,
//   };

//   const headers = {
//     'Content-Type': 'application/json',
//     'x-client-id': MERCHANT_ID,
//     'x-client-secret': API_KEY,
//   };

//   try {
//     const response = await fetch(API_URL, {
//       method: 'POST',
//       headers,
//       body: JSON.stringify(body),
//     }) ;

//     const data = await response.json() as CashfreeResponse;

//     if (data.success) {
//       return res.status(200).json({ token: data.cftoken });
//     }

//     return res.status(500).json({ error: 'Failed to create payment token' });
//   } catch (error) {
//     return res.status(500).json({ error: 'Something went wrong' });
//   }
// }
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId, orderAmount, customerDetails } = req.body;

  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: "Client credentials not found" });
  }

  const url =
    process.env.CASHFREE_ENVIRONMENT === "sandbox"
      ? "https://sandbox.cashfree.com/pg/orders"
      : "https://api.cashfree.com/pg/orders";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Id": clientId,
        "X-Client-Secret": clientSecret,
        "X-Api-Version": "2023-08-01", // Specify the valid API version here

      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: orderAmount,
        order_currency: "INR",
        customer_details: customerDetails,
      }),
    });

    const data = await response.json();
     console.log(data)
    if (response.ok) {
        console.log(2)
      res.status(200).json({ data });
    } else {
      res.status(400).json({ error: data.message });
    }
  } catch (error) {
    console.error("Error creating payment link:", error);
    res.status(500).json({ error: "Payment link creation failed" });
  }
}
