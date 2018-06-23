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
    //The photos uploaded for this answer
    img: { data: Buffer, mime: String },
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


//Virtual to get the picture base encoding
AnswerSchema.virtual("picture_data").get(function() {
  return "data:" + this.img.mime + ";base64," +
      Buffer(this.img.data).toString('base64');
});

//Virtual to get the answer post's url
AnswerSchema.virtual("answerUrl").get(function() {
  return "/answer/" + this._id;
});

module.exports = mongoose.model("Answer", AnswerSchema);
