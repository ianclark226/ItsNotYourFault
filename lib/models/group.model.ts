import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    id: { 
        type: String, 
        required: true
    },
    username: { 
        type: String, 
        required: true, 
        unique: true
    },
    name: { 
        type: String, 
        required: true
    },
    image: String,

    bio: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    attaches: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Attach",
        },
    ],
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
})

const Group = mongoose.models.Group || mongoose.model('Group', groupSchema)

export default Group