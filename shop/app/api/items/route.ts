import dbConnect  from "@/lib/dbConnect";
import Item from "@/models/Item";
import InventoryTransaction from "@/models/InventoryTransaction";
import ActivityLog from "@/models/ActivityLog";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import { verifyTokenFromReq } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ----------------- CLOUDINARY -----------------
async function uploadToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "inventory" },
      (err, result) => {
        if (err) return reject(err);
        resolve(result!.secure_url);
      }
    );
    stream.end(buffer);
  });
}

// ----------------- GET ITEMS BY CATEGORY + BRAND -----------------
export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const brandId = searchParams.get("brandId");

    if (!categoryId || !brandId) {
      return Response.json(
        { error: "categoryId and brandId are required" },
        { status: 400 }
      );
    }

    const items = await Item.find({
      category: categoryId,
      brand: brandId,
    })
      .populate("category")
      .populate("brand");

    return Response.json(items);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ----------------- CREATE ITEM -----------------
export async function POST(req: Request) {
  await dbConnect();

  try {
    const user = await verifyTokenFromReq(req, "admin");

    const form = await req.formData();
    const file = form.get("image") as File | null;

    const name = form.get("name")?.toString();
    const categoryId = form.get("categoryId")?.toString();
    const categoryName = form.get("categoryName")?.toString();
    const brandId = form.get("brandId")?.toString();
    const brandName = form.get("brandName")?.toString();
    const type = form.get("type")?.toString();
    const model = form.get("model")?.toString();
    const stock = Number(form.get("stock") || 0);
    const costPrice = Number(form.get("costPrice") || 0);
    const sellingPrice = Number(form.get("sellingPrice") || 0);
    const description = form.get("description")?.toString() || "";

    if (!name || !type || !model) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ----------------- CATEGORY -----------------
    let category;

    if (categoryId) {
      category = categoryId;
    } else if (categoryName) {
      const existingCategory = await Category.findOne({
        name: new RegExp(`^${categoryName}$`, "i"),
      });

      category = existingCategory
        ? existingCategory._id
        : (await Category.create({ name: categoryName }))._id;
    }

    if (!category) {
      return Response.json({ error: "Category is required" }, { status: 400 });
    }

    // ----------------- BRAND (CATEGORY SAFE) -----------------
    let brand;

    if (brandId) {
      const brandDoc = await Brand.findOne({
        _id: brandId,
        category: category,
      });

      if (!brandDoc) {
        return Response.json(
          { error: "Brand does not belong to selected category" },
          { status: 400 }
        );
      }

      brand = brandDoc._id;
    } else if (brandName) {
      const existingBrand = await Brand.findOne({
        name: new RegExp(`^${brandName}$`, "i"),
        category: category,
      });

      brand = existingBrand
        ? existingBrand._id
        : (await Brand.create({ name: brandName, category }))._id;
    }

    if (!brand) {
      return Response.json({ error: "Brand is required" }, { status: 400 });
    }

    // ----------------- IMAGE -----------------
    let photo = "";
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      photo = await uploadToCloudinary(buffer);
    }

    // ----------------- CREATE ITEM -----------------
    const newItem = await Item.create({
      name,
      category,
      brand,
      type,
      model,
      stock,
      costPrice,
      sellingPrice,
      description,
      photo,
    });

    // ----------------- INVENTORY TRANSACTION -----------------
    if (stock > 0 && costPrice > 0) {
      await InventoryTransaction.create({
        itemId: newItem._id,
        type: "purchase",
        quantity: stock,
        costPrice,
        userId: user.id,
      });
    }

    // ----------------- ACTIVITY LOG -----------------
    await ActivityLog.create({
      userId: user.id,
      action: "add_item",
      meta: { itemId: newItem._id, name: newItem.name },
    });

    return Response.json(newItem, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
