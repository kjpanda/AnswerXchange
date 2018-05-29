var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var QuestionSchema = new Schema({
  //Question string
  question: {type: String, required: true},
  //The number of replies to this question
  replies: {type: Number, required: true},
  //The user ID for the question
  user: {type: Schema.ObjectId, ref: "User", required: true},
  //Module code for the question
  moduleCode: {type: String},
  //Semester that this question is from
  semester: {type: Number},
});

//Virtual to get the url for this question
QuestionSchema.virtual("url").get(function() {
  return "/question/" + this.id;
});

module.exports = mongoose.model("Question", QuestionSchema);
