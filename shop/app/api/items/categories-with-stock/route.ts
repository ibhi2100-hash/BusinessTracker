import dbConnect  from "@/lib/dbConnect";
import Item from "@/models/Item";

export async function GET() {
  await dbConnect();

  const categories = await Item.aggregate([
    // 1️⃣ Safety filter
    {
      $match: {
        category: { $type: "objectId" }
      }
    },

    // 2️⃣ Normalize fields FIRST
    {
      $addFields: {
        validPhoto: {
          $cond: [{ $ne: ["$photo", ""] }, "$photo", null]
        },
        isOutOfStock: {
          $cond: [{ $lte: ["$stock", 0] }, 1, 0]
        }
      }
    },

    // 3️⃣ Group safely
    {
      $group: {
        _id: "$category",
        hasOutOfStock: { $max: "$isOutOfStock" },
        imageUrl: { $first: "$validPhoto" }
      }
    },

    // 4️⃣ Join category metadata
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category"
      }
    },

    { $unwind: "$category" },

    // 5️⃣ Shape API response
    {
      $project: {
        _id: "$category._id",
        name: "$category.name",
        hasOutOfStock: { $toBool: "$hasOutOfStock" },
        imageUrl: { $ifNull: ["$imageUrl", ""] }
      }
    },

    { $sort: { name: 1 } }
  ]);

  return Response.json(categories);
}
