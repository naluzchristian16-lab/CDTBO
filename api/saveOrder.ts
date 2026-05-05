import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const body = req.body;

    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const netTotal =
      body.total -
      (body.discount || 0) +
      (body.deliveryFee || 0);

    // ORDER SUMMARY
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Orders!A:H",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            body.id,
            body.time,
            body.orderType,
            body.total,
            body.discount || 0,
            body.deliveryFee || 0,
            netTotal,
            body.status,
          ],
        ],
      },
    });

    // ORDER ITEMS
    const rows = body.items.map((i) => [
      body.id,
      i.name,
      i.variant,
      i.qty,
      (i.addons || []).join(", "),
      i.price || 0,
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "OrderItems!A:F",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: rows,
      },
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Save failed" });
  }
}
