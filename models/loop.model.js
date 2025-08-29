import mongoose from "mongoose";

const loopSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    media: {
      type: String,
      required: true
    },
    caption: {
      type: String
    },
    likes: [
      { type: mongoose.Schema.Types.ObjectId, 
      ref: "User"
     }],
     comments: [
            {
              author:{ type: mongoose.Schema.Types.ObjectId, 
              ref: "User"
             },
             message:{
              type:String
             }
            }
        ]
  },
  { timestamps: false }
);

const Loop = mongoose.model("Loop",loopSchema);

export default Loop;  