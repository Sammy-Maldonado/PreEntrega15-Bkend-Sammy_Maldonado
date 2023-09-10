import mongoose from "mongoose";
import moment from "moment-timezone";

const collection = "Users";

const schema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  age: Number,
  password: String,
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin", "premium"]
  },
  orders:[
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref:'Orders'
    }
  ],
  status: {
    type: Boolean,
    default: false
  },
  documents: [
    {
      name: String,
      reference: String
    }
  ],
  last_connection: {
    type: String,
    default: () => {
      moment.locale('es');
      const now = moment().tz('America/Santiago');
      const formattedDate = now.format('DD/MM/YYYY[, a las] HH:mm:ss [GMT]ZZ');
      return formattedDate;
    }
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

const userModel = mongoose.model(collection, schema);

export default userModel;