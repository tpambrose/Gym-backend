const mongoose = require("mongoose");

const gymMemberSchema = new mongoose.Schema({
  name: String,
  password: String,
  email: String,
  workoutTime: String,
});

const GymMember = mongoose.model("GymMember", gymMemberSchema);

module.exports = GymMember;
