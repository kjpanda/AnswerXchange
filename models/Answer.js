var mongoose = require("mongoose");
var moment = require("moment");

/* Schema for an Answer */
var Schema = mongoose.Schema

//Blueprint as to what an answer contains
var AnswerSchema = new Schema ({
    //ID of the answer, serves as the primary key
    id: {type: Number, required: true},
    //answer string
    answer: {type: String, required: true},
    //userID of the user that posts the question
    userID: {type: Number, required: true},
    //Time when the answer is given
    date: {type: Date, required: true},
    //The question id that this answer is from
    questionID: {type: Number, required: true},
});

//Think of virtuals as your getters to be used for display
/* Virtual to get the new format for the date */
AnswerSchema.virtual("date_formatted").get(function() {
  return moment(this.date).format('MMMM Do, YYYY');
});

module.exports = mongoose.model("Answer", AnswerSchema);
