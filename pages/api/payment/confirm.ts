import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId } = req.query;

  console.log(orderId,"222")

  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: "Client credentials not found" });
  }

  const url =
    process.env.CASHFREE_ENVIRONMENT === "sandbox"
      ? `https://sandbox.cashfree.com/pg/orders/${orderId}`
      : `https://api.cashfree.com/pg/orders/${orderId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Id": clientId,
        "X-Client-Secret": clientSecret,
        "X-Api-Version": "2023-08-01", // Specify the valid API version here

      },
   
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
