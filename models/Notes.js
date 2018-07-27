var mongoose = require("mongoose");
var moment = require("moment");

/* Schema for notes */
var Schema = mongoose.Schema

//Blueprint as to what a set of notes contains
var NotesSchema = new Schema ({
    //Name of the user that posted the notes
    userName: {type: String, required: true},
    //userID of the user that posted the notes
    userID: {type: Schema.ObjectId, ref: "User"},
    //Time when the notes is given
    date: {type: Date, required: true},
    //Module code for the set of notes
    moduleCode: {type: String, required: true},
    semester: {type: String, required: true},
    //Votes for the notes
    vote: {type: Number},
    //Users who have voted,
    votedUsers: [Schema.Types.ObjectId],
    //The link to the notes
    file: { data: Buffer, mime: String},
    fileName : {type: String},
});

//Think of virtuals as your getters to be used for display
/* Virtual to get the new format for the date */
NotesSchema.virtual("date_formatted").get(function() {
  return moment(this.date).format('MMMM Do, YYYY, h:mm:ss a');
});

//Virtual to get the user's url from the question
NotesSchema.virtual("userUrl").get(function() {
  return "/" + this.userID;
});

//Virtual to get the notes post's url
NotesSchema.virtual("url").get(function() {
  return "/notes/" + this._id;
});

NotesSchema.virtual("notesDeleteUrl").get(function() {
  return "/notes/delete/" + this._id;
});

NotesSchema.virtual("votingURL").get(function() {
  return "/notes/" + this._id + "/vote";
});

module.exports = mongoose.model("Notes", NotesSchema);
