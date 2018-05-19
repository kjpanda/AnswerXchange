var sql = require("mySql");

/* Object prototype for an answer */
function Answer(answerID, questionID, userID, text, timeStamp) {
  this.answerID = answerID;
  this.questionID = questionID;
  this.userID = userID;
  this.text = text;
  this.timeStamp = timeStamp;
}

function searchAnswer() {

}
