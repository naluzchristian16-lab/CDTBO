import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const { items } = req.body;

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

    const inventoryRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Inventory!A:D"
    });

    const recipeRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Recipes!A:D"
    });

    const inventory = inventoryRes.data.values || [];
    const recipes = recipeRes.data.values || [];

    const inventoryMap = {};

    inventory.slice(1).forEach((row, idx) => {
      inventoryMap[row[0]] = {
        row: idx + 2,
        stock: Number(row[2] || 0)
      };
    });

    const deductions = {};

    items.forEach((item) => {
      recipes.slice(1).forEach((recipe) => {
        const [product, size, ingredient, qty] = recipe;

        if (product === item.name && size === item.size) {
          deductions[ingredient] =
            (deductions[ingredient] || 0) +
            Number(qty) * Number(item.qty || 1);
        }
      });
    });

    const updates = [];

    Object.keys(deductions).forEach((ingredient) => {
      if (!inventoryMap[ingredient]) return;

      const newStock =
        inventoryMap[ingredient].stock - deductions[ingredient];

      updates.push({
        range: `Inventory!C${inventoryMap[ingredient].row}`,
        values: [[newStock]]
      });
    });

    if (updates.length) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: "USER_ENTERED",
          data: updates
        }
      });
    }

    res.status(200).json({
      success: true
    });
  } catch (err) {
    console.error("updateInventory error:", err);
    res.status(500).json({
      error: "Inventory failed"
    });
  }
}
