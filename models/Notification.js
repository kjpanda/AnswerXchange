/* Ignore this for now, this will be for the notification system
   later */
var mongoose = require("mongoose");
var moment = require("moment");

/* Schema for a notification */
var Schema = mongoose.Schema

//Blueprint for my notification
var NotificationSchema = new Schema({
  //The id of the user that this notification belongs to
  user: {type: Schema.ObjectId, ref: "User", require: true},
  //Notification String
  information: {type: String, required: true},
  //Link to connect the notification to
  link: {type:String},
  //Time when the notification was created
  date: {type: Date, required: true},
});

/* Virtual to get the new format for the date */
NotificationSchema.virtual("date_formatted").get(function() {
  return moment(this.date).format('MMMM Do, YYYY, h:mm:ss a');
});

module.exports = mongoose.model("Notification", NotificationSchema);
