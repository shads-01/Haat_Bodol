import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
    {
        title: {type: String, required: true},
        description: {type: String, required: true},
    }
)
export default mongoose.model("Item", itemSchema);