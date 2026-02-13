import dbConnect  from "@/lib/dbConnect";
import Item from "@/models/Item";
import Category from "@/models/Category"; // Make sure you have this model
import Brand from "@/models/Brand";       // Make sure you have this model
import InventoryTransaction from "@/models/InventoryTransaction";
import ActivityLog from "@/models/ActivityLog";
import { verifyTokenFromReq } from "@/lib/auth";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const admin = await verifyTokenFromReq(req);

    const purchaseList = await req.json(); // Expect an array of items
    if (!Array.isArray(purchaseList) || purchaseList.length === 0) {
      return new Response(JSON.stringify({ error: "Purchase list is empty" }), { status: 400 });
    }

    const results = [];

    for (const itemData of purchaseList) {
      let { name, category, newCategory, brand, newBrand, model, purchaseQty, costPrice, sellingPrice } = itemData;

      if (!name || (!category && !newCategory) || (!brand && !newBrand) || !purchaseQty || !costPrice || !sellingPrice) {
        return new Response(
          JSON.stringify({ error: "Missing required fields in one of the items" }),
          { status: 400 }
        );
      }

      // Handle new category
      if (category === "new" && newCategory) {
        let existingCat = await Category.findOne({ name: newCategory });
        if (!existingCat) {
          existingCat = await Category.create({ name: newCategory });
        }
        category = existingCat._id;
      }

      // Handle new brand
      if (brand === "new" && newBrand) {
        let existingBrand = await Brand.findOne({ name: newBrand });
        if (!existingBrand) {
          existingBrand = await Brand.create({ name: newBrand });
        }
        brand = existingBrand._id;
      }

      // Check if item already exists
      let item = await Item.findOne({ name, category, brand, model });

      if (item) {
        // Update existing stock and prices
        item.stock += purchaseQty;
        item.costPrice = costPrice;
        item.sellingPrice = sellingPrice;
        await item.save();
      } else {
        // Create new item
        item = await Item.create({
          name,
          category,
          brand,
          model,
          stock: purchaseQty,
          costPrice,
          sellingPrice,
        });
      }

      // Record inventory transaction
      await InventoryTransaction.create({
        itemId: item._id,
        type: "purchase",
        quantity: purchaseQty,
        costPrice: costPrice,
        userId: admin.id,
      });

      // Log admin activity
      await ActivityLog.create({
        userId: admin.id,
        action: "inventory_purchase",
        entityType: "Item",
        entityId: item._id,
        meta: { purchaseQty, costPrice, category, brand },
      });

      results.push({
        itemId: item._id,
        name: item.name,
        category: item.category,
        brand: item.brand,
        stock: item.stock,
      });
    }

    return new Response(JSON.stringify(results), { status: 201 });
  } catch (err: any) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal Server Error" }),
      { status: err.status || 500 }
    );
  }
}
