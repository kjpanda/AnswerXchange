var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var QuestionSchema = new Schema({
  //Question id, serves as the primary key
  id : {type: Number, required: true},
  //Question string
  question: {type: String, required: true},
  //The number of replies to this question
  replies: {type: Number, required: true},
  //The user ID for the question
  userID: {type: Number, required: true},
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
