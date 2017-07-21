"use strict";
var APP_ID = "amzn1.ask.skill.33279aaa-0c1c-4f6f-9c34-935c2495b344";

var ANSWER_COUNT = 5; // The number of possible answers per trivia question.
var QUIZ_LENGTH = 1;  // The number of questions per trivia quiz.
var QUIZ_STATES = {
    TRIVIA: "_TRIVIAMODE", // Asking trivia questions.
    START: "_STARTMODE", // Entry point, start the quiz.
    HELP: "_HELPMODE" // The user is asking for help.
};
var questions = require("./questions");

/**
 * When editing your questions pay attention to your punctuation. Make sure you use question marks or periods.
 * Make sure the first answer is the correct one. Set at least ANSWER_COUNT answers, any extras will be shuffled in.
 */
var languageString = {
    "en": {
        "translation": {
            "QUESTIONS" : questions["QUESTIONS_EN_US"],
            "QUIZ_NAME" : "Personality Quiz", // Be sure to change this for your skill.
            "HELP_MESSAGE": "I will ask you %s multiple choice questions. Say the number of the answer. " +
            "For example, say one, two, three, or four. To start a new quiz at any time, say, start quiz. ",
            "REPEAT_QUESTION_MESSAGE": "To repeat the last question, say, repeat. ",
            "ASK_MESSAGE_START": "Would you like to start playing?",
            "HELP_REPROMPT": "To give an answer to a question, say the number of the answer. ",
            "STOP_MESSAGE": "Would you like to keep playing?",
            "CANCEL_MESSAGE": "Ok, I\'m going to miss you very much. ",
            "NO_MESSAGE": "Ok, we\'ll play another time. I\'m going to miss you very much. ",
            "TRIVIA_UNHANDLED": "Try saying a number between 1 and %s",
            "HELP_UNHANDLED": "Say yes to continue, or no to end the quiz.",
            "START_UNHANDLED": "Say start to start a new quiz. ",
            "NEW_QUIZ_MESSAGE": "Snuffles fix. Make better. ",
            "WELCOME_MESSAGE": "Answer by saying one, two, three, four, or five. ",
            "ANSWER_CORRECT_MESSAGE": "right. Good human. ",
            "ANSWER_WRONG_MESSAGE": "wrong. ",
            "CORRECT_ANSWER_MESSAGE": "The answer is %s: %s. ",
            "ANSWER_IS_MESSAGE": "That\'s ",
            "TELL_QUESTION_MESSAGE": "Question %s. %s ",
            "QUIZ_OVER_MESSAGE": "%s out of %s questions right. You can call me Snuffles. ",
            "SCORE_IS_MESSAGE": "%s right. "
        }
    },
    "en-US": {
        "translation": {
            "QUESTIONS" : questions["QUESTIONS_EN_US"],
            "QUIZ_NAME" : "Personality Quiz" // Be sure to change this for your skill.
        }
    }
};

var Alexa = require("alexa-sdk");

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageString;
    alexa.registerHandlers(newSessionHandlers, startStateHandlers, triviaStateHandlers, helpStateHandlers);
    alexa.execute();
};

var newSessionHandlers = {
    "LaunchRequest": function () {
        this.handler.state = QUIZ_STATES.START;
        this.emitWithState("StartQuiz", true);
    },
    "AMAZON.StartOverIntent": function() {
        this.handler.state = QUIZ_STATES.START;
        this.emitWithState("StartQuiz", true);
    },
    "AMAZON.HelpIntent": function() {
        this.handler.state = QUIZ_STATES.HELP;
        this.emitWithState("helpTheUser", true);
    },
    "Unhandled": function () {
        var speechOutput = this.t("START_UNHANDLED");
        this.emit(":ask", speechOutput, speechOutput);
    }
};

var startStateHandlers = Alexa.CreateStateHandler(QUIZ_STATES.START, {
    "StartQuiz": function (newQuiz) {
        var speechOutput = newQuiz ? this.t("NEW_QUIZ_MESSAGE", this.t("QUIZ_NAME")) + this.t("WELCOME_MESSAGE", QUIZ_LENGTH.toString()) : "";
        // Select QUIZ_LENGTH questions for the quiz
        var translatedQuestions = this.t("QUESTIONS");
        var quizQuestions = populateQuizQuestions(translatedQuestions);
        // Generate a random index for the correct answer, from 0 to 3
//        var correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT));
        // Select and shuffle the answers for each question
//        var roundAnswers = populateRoundAnswers(quizQuestions, 0, correctAnswerIndex, translatedQuestions);
        var currentQuestionIndex = 0;
        var spokenQuestion = Object.keys(translatedQuestions[quizQuestions[currentQuestionIndex]])[0];
        var repromptText = this.t("TELL_QUESTION_MESSAGE", "1", spokenQuestion);

        for (var i = 0; i < ANSWER_COUNT; i++) {
//            repromptText += (i+1).toString() + ". " + roundAnswers[i] + ". ";
            repromptText += (i+1).toString() + ". " + i + ". ";

        }

        speechOutput += repromptText;

        Object.assign(this.attributes, {
            "speechOutput": repromptText,
            "repromptText": repromptText,
            "currentQuestionIndex": currentQuestionIndex,
//            "correctAnswerIndex": correctAnswerIndex + 1,
            "questions": quizQuestions,
            "score": 0,
//            "correctAnswerText": translatedQuestions[quizQuestions[currentQuestionIndex]][Object.keys(translatedQuestions[quizQuestions[currentQuestionIndex]])[0]][0]
        });

        // Set the current state to trivia mode. The skill will now use handlers defined in triviaStateHandlers
        this.handler.state = QUIZ_STATES.TRIVIA;
        this.emit(":askWithCard", speechOutput, repromptText, this.t("QUIZ_NAME"), repromptText);
    }
});

var triviaStateHandlers = Alexa.CreateStateHandler(QUIZ_STATES.TRIVIA, {
    "AnswerIntent": function () {
        handleUserGuess.call(this, false);
    },
    "DontKnowIntent": function () {
        handleUserGuess.call(this, true);
    },
    "AMAZON.StartOverIntent": function () {
        this.handler.state = QUIZ_STATES.START;
        this.emitWithState("StartQuiz", false);
    },
    "AMAZON.RepeatIntent": function () {
        this.emit(":ask", this.attributes["speechOutput"], this.attributes["repromptText"]);
    },
    "AMAZON.HelpIntent": function () {
        this.handler.state = QUIZ_STATES.HELP;
        this.emitWithState("helpTheUser", false);
    },
    "AMAZON.StopIntent": function () {
        this.handler.state = QUIZ_STATES.HELP;
        var speechOutput = this.t("STOP_MESSAGE");
        this.emit(":ask", speechOutput, speechOutput);
    },
    "AMAZON.CancelIntent": function () {
        this.emit(":tell", this.t("CANCEL_MESSAGE"));
    },
    "Unhandled": function () {
        var speechOutput = this.t("TRIVIA_UNHANDLED", ANSWER_COUNT.toString());
        this.emit(":ask", speechOutput, speechOutput);
    },
    "SessionEndedRequest": function () {
        console.log("Session ended in trivia state: " + this.event.request.reason);
    }
});

var helpStateHandlers = Alexa.CreateStateHandler(QUIZ_STATES.HELP, {
    "helpTheUser": function (newQuiz) {
        var askMessage = newQuiz ? this.t("ASK_MESSAGE_START") : this.t("REPEAT_QUESTION_MESSAGE") + this.t("STOP_MESSAGE");
        var speechOutput = this.t("HELP_MESSAGE", QUIZ_LENGTH) + askMessage;
        var repromptText = this.t("HELP_REPROMPT") + askMessage;
        this.emit(":ask", speechOutput, repromptText);
    },
    "AMAZON.StartOverIntent": function () {
        this.handler.state = QUIZ_STATES.START;
        this.emitWithState("StartQuiz", false);
    },
    "AMAZON.RepeatIntent": function () {
        var newQuiz = (this.attributes["speechOutput"] && this.attributes["repromptText"]) ? false : true;
        this.emitWithState("helpTheUser", newQuiz);
    },
    "AMAZON.HelpIntent": function() {
        var newQuiz = (this.attributes["speechOutput"] && this.attributes["repromptText"]) ? false : true;
        this.emitWithState("helpTheUser", newQuiz);
    },
    "AMAZON.YesIntent": function() {
        if (this.attributes["speechOutput"] && this.attributes["repromptText"]) {
            this.handler.state = QUIZ_STATES.TRIVIA;
            this.emitWithState("AMAZON.RepeatIntent");
        } else {
            this.handler.state = QUIZ_STATES.START;
            this.emitWithState("StartQuiz", false);
        }
    },
    "AMAZON.NoIntent": function() {
        var speechOutput = this.t("NO_MESSAGE");
        this.emit(":tell", speechOutput);
    },
    "AMAZON.StopIntent": function () {
        var speechOutput = this.t("STOP_MESSAGE");
        this.emit(":ask", speechOutput, speechOutput);
    },
    "AMAZON.CancelIntent": function () {
        this.emit(":tell", this.t("CANCEL_MESSAGE"));
    },
    "Unhandled": function () {
        var speechOutput = this.t("HELP_UNHANDLED");
        this.emit(":ask", speechOutput, speechOutput);
    },
    "SessionEndedRequest": function () {
        console.log("Session ended in help state: " + this.event.request.reason);
    }
});

function handleUserGuess(userGaveUp) {
    var answerSlotValid = isAnswerSlotValid(this.event.request.intent);
    var speechOutput = "";
    var speechOutputAnalysis = "";
    var quizQuestions = this.attributes.questions;
//    var correctAnswerIndex = parseInt(this.attributes.correctAnswerIndex);
    var currentScore = parseInt(this.attributes.score);
    var currentQuestionIndex = parseInt(this.attributes.currentQuestionIndex);
//    var correctAnswerText = this.attributes.correctAnswerText;
    var translatedQuestions = this.t("QUESTIONS");

    if (answerSlotValid && parseInt(this.event.request.intent.slots.Answer.value)) {
        currentScore++;
        speechOutputAnalysis = this.t("ANSWER_CORRECT_MESSAGE");
}
/**
    } else {
        if (!userGaveUp) {
            speechOutputAnalysis = this.t("ANSWER_WRONG_MESSAGE");
        }

        speechOutputAnalysis += this.t("CORRECT_ANSWER_MESSAGE", correctAnswerIndex, correctAnswerText);
    }
**/
    // Check if we can exit the quiz session after QUIZ_LENGTH questions (zero-indexed)
    if (this.attributes["currentQuestionIndex"] == QUIZ_LENGTH - 1) {
        speechOutput = userGaveUp ? "" : this.t("ANSWER_IS_MESSAGE");
        speechOutput += speechOutputAnalysis + this.t("QUIZ_OVER_MESSAGE", currentScore.toString(), QUIZ_LENGTH.toString());

        this.emit(":tell", speechOutput)
    } else {
        currentQuestionIndex += 1;
//        correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT));
        var spokenQuestion = Object.keys(translatedQuestions[quizQuestions[currentQuestionIndex]])[0];
//        var roundAnswers = populateRoundAnswers.call(this, quizQuestions, currentQuestionIndex, correctAnswerIndex, translatedQuestions);
        var questionIndexForSpeech = currentQuestionIndex + 1;
        var repromptText = this.t("TELL_QUESTION_MESSAGE", questionIndexForSpeech.toString(), spokenQuestion);

        for (var i = 0; i < ANSWER_COUNT; i++) {
//            repromptText += (i+1).toString() + ". " + roundAnswers[i] + ". "
            repromptText += (i+1).toString() + ". " + i + ". "

        }

        speechOutput += userGaveUp ? "" : this.t("ANSWER_IS_MESSAGE");
        speechOutput += speechOutputAnalysis + this.t("SCORE_IS_MESSAGE", currentScore.toString()) + repromptText;

        Object.assign(this.attributes, {
            "speechOutput": repromptText,
            "repromptText": repromptText,
            "currentQuestionIndex": currentQuestionIndex,
//            "correctAnswerIndex": correctAnswerIndex + 1,
            "questions": quizQuestions,
            "score": currentScore,
//            "correctAnswerText": translatedQuestions[quizQuestions[currentQuestionIndex]][Object.keys(translatedQuestions[quizQuestions[currentQuestionIndex]])[0]][0]
        });

        this.emit(":askWithCard", speechOutput, repromptText, this.t("QUIZ_NAME"), repromptText);
    }
}

function populateQuizQuestions(translatedQuestions) {
    var quizQuestions = [];
    var indexList = [];
    var index = translatedQuestions.length;

    if (QUIZ_LENGTH > index){
        throw new Error("Invalid Quiz Length.");
    }

    for (var i = 0; i < translatedQuestions.length; i++){
        //indexList.push(i);
        quizQuestions.push(i);
    }

    // Pick QUIZ_LENGTH random questions from the list to ask the user, make sure there are no repeats.
//   for (var j = 0; j < QUIZ_LENGTH; j++){
//        var rand = Math.floor(Math.random() * index);
//        index -= 1;

//        var temp = indexList[index];
//        indexList[index] = indexList[rand];
//        indexList[rand] = temp;
//        quizQuestions.push(indexList[index]);
//    }

    return quizQuestions;
}

/**
 * Get the answers for a given question, and place the correct answer at the spot marked by the
 * correctAnswerTargetLocation variable. Note that you can have as many answers as you want but
 * only ANSWER_COUNT will be selected.
function populateRoundAnswers(quizQuestionIndexes, correctAnswerIndex, correctAnswerTargetLocation, translatedQuestions) {
    var answers = [];
    var answersCopy = translatedQuestions[quizQuestionIndexes[correctAnswerIndex]][Object.keys(translatedQuestions[quizQuestionIndexes[correctAnswerIndex]])[0]].slice();
    var index = answersCopy.length;

    if (index < ANSWER_COUNT) {
        throw new Error("Not enough answers for question.");
    }

    // Shuffle the answers, excluding the first element which is the correct answer.
    for (var j = 1; j < answersCopy.length; j++){
        var rand = Math.floor(Math.random() * (index - 1)) + 1;
        index -= 1;

        var temp = answersCopy[index];
        answersCopy[index] = answersCopy[rand];
        answersCopy[rand] = temp;
    }

    // Swap the correct answer into the target location
    for (var i = 0; i < ANSWER_COUNT; i++) {
        answers[i] = answersCopy[i];
    }
    temp = answers[0];
    answers[0] = answers[correctAnswerTargetLocation];
    answers[correctAnswerTargetLocation] = temp;
    return answers;
}
* */
function isAnswerSlotValid(intent) {
    var answerSlotFilled = intent && intent.slots && intent.slots.Answer && intent.slots.Answer.value;
    var answerSlotIsInt = answerSlotFilled && !isNaN(parseInt(intent.slots.Answer.value));
    return answerSlotIsInt && parseInt(intent.slots.Answer.value) < (ANSWER_COUNT + 1) && parseInt(intent.slots.Answer.value) > 0;
}
