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
      ? req.files.map((file) => `/uploads/items/${file.filename}`)
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
