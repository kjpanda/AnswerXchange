var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var QuestionSchema = new Schema({
  //Question string
  question: {type: String, required: true},
  //The number of replies to this question
  replies: {type: Number, required: true},
  //The user ID for the question
  userID: {type: Schema.ObjectId, ref: "User", required: true},
  //The name of the user that posted the question
  userName: {type: String, required: true},
  //Module code for the question
  moduleCode: {type: String},
  //Semester that this question is from
  semester: {type: String, required: true},
});

//Virtual to get the url for this question
QuestionSchema.virtual("url").get(function() {
  return "/question/" + this._id;
});

//Virtual to get the user's url from the question
QuestionSchema.virtual("userUrl").get(function() {
  return "/" + this.userID;
});

module.exports = mongoose.model("Question", QuestionSchema);
