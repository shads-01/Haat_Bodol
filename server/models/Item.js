import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
    {
        title: {type: String, required: true},
        description: {type: String, required: true},
    }
)
export default mongoose.model("Item", itemSchema);


// import mongoose from "mongoose";

// const itemSchema = new mongoose.Schema({
//   name: String,
//   description: String,
//   category: String,
//   condition: String,
//   status: String,
//   location: String,
//   postedTime: String,
//   image: String,
// });

// const Item = mongoose.model("Item", itemSchema);
// export default Item;



