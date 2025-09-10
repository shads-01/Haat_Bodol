import Item from "../models/Item.js";

export async function getAllItems(req, res) {
  try {
    const items = await Item.find();
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
          public_id: file.filename
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

export async function searchItems(req, res) {
  const query = req.query.query;

  if (!query || query.trim() === "") {
    return res.json([]);
  }

  try {
    const results = await Item.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } }
      ],
    }).limit(10); // optional: limit results

    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error during search" });
  }
}

