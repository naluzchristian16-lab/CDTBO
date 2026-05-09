import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const order = req.body;

    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const rows = order.items.map((item) => {
      const addonQty = item.addons?.includes("Extra Shot") ? 1 : 0;

      const addonTotal = addonQty * 10 * (item.qty || 1);

      const lineTotal =
        (Number(item.price || 0) * Number(item.qty || 1)) + addonTotal;

      return [
        order.orderNumber || order.id,
        order.date || "",
        order.time || "",
        order.status || "ongoing",
        item.name || "",
        item.size || "",
        item.qty || 1,
        (item.addons || []).join(", "),
        lineTotal,
        order.total || 0
      ];
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Orders!A:J",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: rows
      }
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Google Sheets Error:", err);
    return res.status(500).json({ error: "Failed to save order" });
  }
}
