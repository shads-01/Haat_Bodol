import Item from "../models/Item.js";

// export async function getAllItems(req, res) {
//   try {
//     const items = await Item.find();
//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }

export async function getAllItems(req, res) {
  try {
    const { category } = req.query;

    const filter = {};

    if (category && category.trim() !== "") {
      filter.category = category.trim();
    }

    // const items = await Item.find(filter).sort({ createdAt: -1 });
    const items = await Item.find(filter);

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createAnItem(req, res) {
  try {
    const { title, description, category, condition, address } = req.body;

    const photoPaths = req.files
      ? req.files.map((file) => ({
          url: file.path,
          public_id: file.filename,
        }))
      : [];

    const item = await Item.create({
      title,
      description,
      category,
      condition,
      address,
      photos: photoPaths,
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getItemById(req, res) {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

export async function searchItems(req, res) {
  try {
    const query = req.query.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const items = await Item.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    });

    res.json(items);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}