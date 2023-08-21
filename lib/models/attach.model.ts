import mongoose from "mongoose";

const attachSchema = new mongoose.Schema({
   text: { type: String, required: true},
   author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
   },
   group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group"
   },
   createdAt: {
    type: Date,
    default: Date.now
   }, 
   parentId: {
    type: String,
   },
   children: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attach"
    }
   ]
})

const Attach = mongoose.models.Attach || mongoose.model("Attach", attachSchema)

export default Attach