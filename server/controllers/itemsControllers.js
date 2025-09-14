import Item from "../models/Item.js";

export async function getAllItems(req, res) {
  try {
    const { category } = req.query;

    const filter = {};

    if (category && category.trim() !== "") {
      filter.category = category.trim();
    }

    const sortOrder = req.query.sort === "desc" ? -1 : 1;
    const items = await Item.find(filter).sort({ createdAt: sortOrder });

    res.json(items);
  } 
  catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createAnItem(req, res) {
  try {
    const { title, description, category, condition, address } = req.body;
    const userId = req.userId; // From auth middleware

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
      donatedBy: userId,
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getItemById(req, res) {
  try {
    const item = await Item.findById(req.params.id)
      .populate('donatedBy', 'name email profilePic phone'); // Populate donor info
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
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