import type { NextApiRequest, NextApiResponse } from "next";

const getCashfreeUrl = (path: string) =>
  process.env.CASHFREE_ENVIRONMENT === "sandbox"
    ? `https://sandbox.cashfree.com${path}`
    : `https://api.cashfree.com${path}`;

const clientId = process.env.CASHFREE_CLIENT_ID;
const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error("Client credentials not found");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { orderId, refundId, refundAmount, refundReason } = req.body;

    if (!orderId || !refundId || !refundAmount || !refundReason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const url = getCashfreeUrl(`/pg/orders/${orderId}/refunds`);

    const response = await fetch(url, {
      method: "POST",
      
      headers: {
        "Content-Type": "application/json",
        "X-Client-Id": clientId as string,
        "X-Client-Secret": clientSecret as string,
        "X-Api-Version": "2023-08-01",
      },
      body: JSON.stringify({
        refund_id: refundId,
        refund_amount: refundAmount,
        refund_reason: refundReason,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      res.status(200).json({ success: true, data });
    } else {
      res.status(400).json({ success: false, error: data.message });
    }
  } catch (error) {
    console.error("Error processing refund:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
