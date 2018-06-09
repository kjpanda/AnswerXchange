var mongoose = require("mongoose");
var moment = require("moment");

/* Schema for an Answer */
var Schema = mongoose.Schema

//Blueprint as to what an answer contains
var AnswerSchema = new Schema ({
    //answer string
    answer: {type: String, required: true},
    //Name of the user that post this answer
    userName: {type: String, required: true},
    //userID of the user that posts the question
    userID: {type: Schema.ObjectId, ref: "User"},
    //Time when the answer is given
    date: {type: Date, required: true},
    //The question id that this answer is from
    question: {type: Schema.ObjectId, ref: "Question", required: true},
});

//Think of virtuals as your getters to be used for display
/* Virtual to get the new format for the date */
AnswerSchema.virtual("date_formatted").get(function() {
  return moment(this.date).format('MMMM Do, YYYY, h:mm:ss a');
});

//Virtual to get the user's url from the question
AnswerSchema.virtual("userUrl").get(function() {
  return "/" + this.userID;
});

module.exports = mongoose.model("Answer", AnswerSchema);
