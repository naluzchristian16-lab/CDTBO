import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const order = req.body;

    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    const sheets = google.sheets({
      version: "v4",
      auth
    });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const rows = order.items.map((item) => {
      const addonTotal =
        (item.addons?.includes("Extra Shot") ? 10 : 0) *
        Number(item.qty || 1);

      const lineTotal =
        Number(item.price || 0) * Number(item.qty || 1) + addonTotal;

      return [
        order.id,
        order.date || "",
        order.time || "",
        order.status || "ongoing",
        order.orderType || "",
        Number(order.deliveryFee || 0),
        Number(order.discount || 0),
        item.name || "",
        item.size || "",
        Number(item.qty || 1),
        item.addons?.join(", ") || "",
        lineTotal,
        Number(order.total || 0)
      ];
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Orders!A:M",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: rows
      }
    });

    res.status(200).json({
      success: true
    });
  } catch (err) {
    console.error("saveOrder error:", err);
    res.status(500).json({
      error: "Save failed"
    });
  }
}
