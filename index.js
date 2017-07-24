var express = require('express');
var request = require('request');

var app = express();

var GA_TRACKING_ID = 'UA-102972388-1';

function trackEvent(category, action, label, value, callbback) {
  var data = {
    v: '1', // API Version.
    tid: GA_TRACKING_ID, // Tracking ID / Property ID.
    // Anonymous Client Identifier. Ideally, this should be a UUID that
    // is associated with particular user, device, or browser instance.
    cid: '555',
    t: 'event', // Event hit type.
    ec: category, // Event category.
    ea: action, // Event action.
    el: label, // Event label.
    ev: value, // Event value.
  };

  request.post(
    'http://www.google-analytics.com/collect', {
      form: data
    },
    function(err, response) {
      if (err) { return callbback(err); }
      if (response.statusCode !== 200) {
        return callbback(new Error('Tracking failed'));
      }
      callbback();
    }
  );
}


"use strict";
var APP_ID = "amzn1.ask.skill.33279aaa-0c1c-4f6f-9c34-935c2495b344";

var ANSWER_COUNT = 5; // The number of possible answers per trivia question.
var QUIZ_LENGTH = 50;  // The number of questions per trivia quiz.
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
            "HELP_MESSAGE": "Say the number of the answer, say one, two, three, four, or five. To start a new quiz at any time, say, start quiz. ",
            "REPEAT_QUESTION_MESSAGE": "To repeat the last question, say, repeat. ",
            "ASK_MESSAGE_START": "Would you like to start a new quiz?",
            "HELP_REPROMPT": "To answer a question, say the number of the answer. ",
            "STOP_MESSAGE": "Would you like to continue?",
            "CANCEL_MESSAGE": "Ok. ",
            "NO_MESSAGE": "Ok we can do this another time. ",
            "TRIVIA_UNHANDLED": "Try saying a number between 1 and %s",
            "HELP_UNHANDLED": "Say yes to continue, or no to end the quiz. ",
            "START_UNHANDLED": "Say start to start a new quiz. ",
            "NEW_QUIZ_MESSAGE": "Starting new Big Five OCEAN fifty question Personality Quiz. ",
            "WELCOME_MESSAGE": "Have something ready to write on when we finish the quiz. Answer by saying one for disagree, two for slightly disagree, three for neutral, four for slightly agree, or five for agree. Answer as if you were a neutral observer reviewing the past couple months of your life. Let\'s begin with question. ",
            "ANSWER_CORRECT_MESSAGE": "right. ",
            "ANSWER_WRONG_MESSAGE": "also right. ",
            "CORRECT_ANSWER_MESSAGE": "The answer is whatever you say between one and five. ",
            "ANSWER_IS_MESSAGE": "That\'s ",
            "TELL_QUESTION_MESSAGE": "%s. %s ",
            "SCORE_IS_MESSAGE": "That\'s right. ",
            "QUIZ_OVER_MESSAGE": "End of questions. Get ready for your Big Five OCEAN personality scores. First, write down the word ocean. O, C, E, A, and N. Get ready to write down your score next to each letter. " +
                                 "Your O for Openness score is %s. " +
                                 "Your C for Conscientiousness score is %s.  " +
                                 "Your E for Extroversion score is %s.  " +
                                 "Your A for Agreeableness score is %s.  " +
                                 "Your N for Neuroticism score is %s.  " +
                                 "All scores are on a continuum. Scores range from zero to forty. Twenty is in the mid range. This means if you scored near mid range you may have traits on both sides of the continuum. " +
                                 "Let me tell you what these scores may determine about your personality. ",
            "HI_OPENNESS": "In Openness, you may be willing to try many things and have many interests. " +
                           "You may have creative pursuits or just enjoy creativity in general. " +
                           "You can see things as how they can be, and not just as they are. ",
            "LO_OPENNESS": "In Openness, you may be more traditional and down to earth. " +
                           "You tend to know what you like and what you don\'t like and stick to it. ",
            "HI_CONSCIENTIOUS": "In Conscientiousness, you can be organized and pay attention to details. " +
                                "You often like structure and schedules. " +
                                "This helps you finish tasks and accomplish your goals. ",
            "LO_CONSCIENTIOUS": "In Conscientiousness, you can be disorganized and pay little attention to detail. " +
                                "You often dislike structure and schedules. " +
                                "This can get in the way of accomplishing your goals. ",
            "HI_EXTROVERSION": "In Extroversion, you can be outgoing. You generally can find energy in being around people. " +
                               "You tend to say things before you think about them. ",
            "LO_EXTROVERSION": "In Extroversion, you can be reserved. You generally can find energy in solitude. " +
                                "You tend to think things through before speaking. ",
            "HI_AGREEABLENESS": "In Agreeableness, you can be cooperative. You enjoy helping and adding to others happiness. " +
                                "Others tend to have warm happy feelings after talking with you and you like that. ",
            "LO_AGREEABLENESS": "In Agreeableness, how you can be competitive. You enjoy winning and staying ahead. " +
                                "Your tendency to tell it like you see it may not leave others with warm happy feelings. ",
            "HI_NEUROTICISM": "In Neuroticism, mood swings, anxiety, irritability and sadness can throw you off. " +
                              "It\'s important to for you to remember to ask for what you need and reach out for help when needed. ",
            "LO_NEUROTICISM": "In Neuroticism, you can seem more emotionally stable. " +
                              "You can bounce back from life\'s inevitable setbacks. ",
            "MID_RANGE_MESSAGE": "This next trait may vary because you scored mid range. ",
            "CONSERVATIVE": "Your opinions may lean towards the conservative end of the spectrum. ",
            "LIBERAL": "Your opinions may lean towards the liberal end of the spectrum. ",
            "END_MESSAGE": "End of evaluation. If you would like to hear your evaluation again please say, repeat, and answer question fifty again. Thank you. "
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
var APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).


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
      trackEvent(
        'Sequence',
        'Began',
        'na',
        '100', // Event value must be numeric.
        function(err) {
          if (err) {
            return next(err);
          }
        });
        var speechOutput = newQuiz ? this.t("NEW_QUIZ_MESSAGE", this.t("QUIZ_NAME")) + this.t("WELCOME_MESSAGE", QUIZ_LENGTH.toString()) : "";
        // Select QUIZ_LENGTH questions for the quiz
        var translatedQuestions = this.t("QUESTIONS");
        var quizQuestions = populateQuizQuestions(translatedQuestions);
        // Generate a random index for the correct answer, from 0 to 3
        var correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT));
        // Select and shuffle the answers for each question
        var roundAnswers = populateRoundAnswers(quizQuestions, 0, correctAnswerIndex, translatedQuestions);
        var currentQuestionIndex = 0;
        var spokenQuestion = Object.keys(translatedQuestions[quizQuestions[currentQuestionIndex]])[0];
        var repromptText = this.t("TELL_QUESTION_MESSAGE", "1", spokenQuestion);

        for (var i = 0; i < ANSWER_COUNT; i++) {
            repromptText += (i+1).toString() + ". " + roundAnswers[i] + ". ";
        }

        speechOutput += repromptText;

        Object.assign(this.attributes, {
            "speechOutput": repromptText,
            "repromptText": repromptText,
            "currentQuestionIndex": currentQuestionIndex,
            "correctAnswerIndex": correctAnswerIndex + 1,
            "questions": quizQuestions,
            "score": 0,
            "correctAnswerText": translatedQuestions[quizQuestions[currentQuestionIndex]][Object.keys(translatedQuestions[quizQuestions[currentQuestionIndex]])[0]][0]
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
      trackEvent(
        'Intent',
        'AMAZON.StartOverIntent',
        'na',
        '100', // Event value must be numeric.
        function(err) {
          if (err) {
            return next(err);
          }
        });
        this.handler.state = QUIZ_STATES.START;
        this.emitWithState("StartQuiz", false);
    },
    "AMAZON.RepeatIntent": function () {
      trackEvent(
        'Intent',
        'AMAZON.RepeatIntent',
        'na',
        '100', // Event value must be numeric.
        function(err) {
          if (err) {
            return next(err);
          }
        });
        var newQuiz = (this.attributes["speechOutput"] && this.attributes["repromptText"]) ? false : true;
        this.emitWithState("helpTheUser", newQuiz);
    },
    "AMAZON.HelpIntent": function() {
      trackEvent(
        'Intent',
        'AMAZON.HelpIntent',
        'na',
        '100', // Event value must be numeric.
        function(err) {
          if (err) {
            return next(err);
          }
        });
        var newQuiz = (this.attributes["speechOutput"] && this.attributes["repromptText"]) ? false : true;
        this.emitWithState("helpTheUser", newQuiz);
    },
    "AMAZON.YesIntent": function() {
      trackEvent(
        'Intent',
        'AMAZON.YesIntent',
        'na',
        '100', // Event value must be numeric.
        function(err) {
          if (err) {
            return next(err);
          }
        });
        if (this.attributes["speechOutput"] && this.attributes["repromptText"]) {
            this.handler.state = QUIZ_STATES.TRIVIA;
            this.emitWithState("AMAZON.RepeatIntent");
        } else {
            this.handler.state = QUIZ_STATES.START;
            this.emitWithState("StartQuiz", false);
        }
    },
    "AMAZON.NoIntent": function() {
        trackEvent(
          'Intent',
          'AMAZON.NoIntent',
          'na',
          '100', // Event value must be numeric.
          function(err) {
            if (err) {
              return next(err);
            }
          });
        var speechOutput = this.t("NO_MESSAGE");
        this.emit(":tell", speechOutput);
    },
    "AMAZON.StopIntent": function () {
      trackEvent(
        'Intent',
        'AMAZON.StopIntent',
        'na',
        '100', // Event value must be numeric.
        function(err) {
          if (err) {
            return next(err);
          }
        });
        var speechOutput = this.t("STOP_MESSAGE");
        this.emit(":ask", speechOutput, speechOutput);
    },
    "AMAZON.CancelIntent": function () {
      trackEvent(
        'Intent',
        'AMAZON.CancelIntent',
        'na',
        '100', // Event value must be numeric.
        function(err) {
          if (err) {
            return next(err);
          }
        });
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

var scores=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

function handleUserGuess(userGaveUp) {
    var answerSlotValid = isAnswerSlotValid(this.event.request.intent);
    var speechOutput = "";
    var speechOutputAnalysis = "";
    var quizQuestions = this.attributes.questions;
    var correctAnswerIndex = parseInt(this.attributes.correctAnswerIndex);
    var currentScore = parseInt(this.attributes.score);
    var currentQuestionIndex = parseInt(this.attributes.currentQuestionIndex);
    var correctAnswerText = this.attributes.correctAnswerText;
    var translatedQuestions = this.t("QUESTIONS");

    if (!answerSlotValid) {
           // If the user provided answer isn't a number > 0 and < ANSWER_COUNT,
           // return an error message to the user. Remember to guide the user into providing correct values.
              var spokenQuestion = Object.keys(translatedQuestions[quizQuestions[currentQuestionIndex]])[0];
              var roundAnswers = populateRoundAnswers.call(this, quizQuestions, currentQuestionIndex, correctAnswerIndex, translatedQuestions);
              var questionIndexForSpeech = currentQuestionIndex + 1;
              var repromptText = this.t("TELL_QUESTION_MESSAGE", questionIndexForSpeech.toString(), spokenQuestion);

              for (var i = 0; i < ANSWER_COUNT; i++) {
                  repromptText += (i+1).toString() + ". " + roundAnswers[i] + ". ";
              }

              var speechOutput = "Your answer must be a number between 1 and " + ANSWER_COUNT + ". Let me repeat Question " + repromptText;
              this.handler.state = QUIZ_STATES.TRIVIA;
              this.emit(":askWithCard", speechOutput, repromptText, this.t("QUIZ_NAME"), repromptText);

    } else if (answerSlotValid && parseInt(this.event.request.intent.slots.Answer.value)) {

//  if (answerSlotValid && parseInt(this.event.request.intent.slots.Answer.value)) {
      var i = currentQuestionIndex + 1;
      scores[i] = parseInt(this.event.request.intent.slots.Answer.value);
      currentScore = scores[i];
    }

    // Check if we can exit the quiz session after QUIZ_LENGTH questions (zero-indexed)
    if (this.attributes["currentQuestionIndex"] == QUIZ_LENGTH - 1) {
      trackEvent(
        'Sequence',
        'Completed',
        'na',
        '100', // Event value must be numeric.
        function(err) {
          if (err) {
            return next(err);
          }
        });


        var userOpenness = (8 + scores[5] - scores[10] + scores[15] - scores[20] + scores[25] - scores[30] + scores[35] + scores[40] + scores[45] + scores[50]);
        var userConscientious = (14 + scores[3] - scores[8] + scores[13] - scores[18] + scores[23] - scores[28] + scores[33] - scores[38] + scores[43] + scores[48]);
        var userExtroversion = (20 + scores[1] - scores[6] + scores[11] - scores[16] + scores[21] - scores[26] + scores[31] - scores[36] + scores[41] - scores[46]);
        var userAgreeableness = (14 - scores[2] + scores[7] - scores[12] + scores[17] - scores[22] + scores[27] - scores[32] + scores[37] + scores[42] + scores[47]);
        var userNeuroticism = (38 - scores[4] + scores[9] - scores[14] + scores[19] - scores[24] - scores[29] - scores[34] - scores[39] - scores[44] - scores[49]);


//        speechOutput = userGaveUp ? "" : this.t("ANSWER_IS_MESSAGE");
        speechOutput = speechOutputAnalysis + this.t("QUIZ_OVER_MESSAGE", userOpenness.toString(), userConscientious.toString(), userExtroversion.toString(), userAgreeableness.toString(), userNeuroticism.toString());


        if (userOpenness>15 && userOpenness<25) {
        speechOutput += this.t("MID_RANGE_MESSAGE");
        }

        if (userOpenness>=20){
          speechOutput += this.t("HI_OPENNESS");
        } else {
          speechOutput += this.t("LO_OPENNESS");
        }


        if (userConscientious>15 && userConscientious<25) {
        speechOutput += this.t("MID_RANGE_MESSAGE");
        }

        if (userConscientious>=20){
          speechOutput += this.t("HI_CONSCIENTIOUS");
        } else {
          speechOutput += this.t("LO_CONSCIENTIOUS");
        }


        if (userConscientious>=23 && userOpenness<=17){
          speechOutput += this.t("CONSERVATIVE");
        } else if (userConscientious<=17 && userOpenness>=23) {
          speechOutput += this.t("LIBERAL");
        }

        if (userExtroversion>15 && userExtroversion<25) {
          speechOutput += this.t("MID_RANGE_MESSAGE");
        }

        if (userExtroversion>=20){
          speechOutput += this.t("HI_EXTROVERSION");
        } else {
          speechOutput += this.t("LO_EXTROVERSION");
        }

        if (userAgreeableness>15 && userAgreeableness<25) {
          speechOutput += this.t("MID_RANGE_MESSAGE");
        }

        if (userAgreeableness>=20){
          speechOutput += this.t("HI_AGREEABLENESS");
        } else {
          speechOutput += this.t("LO_AGREEABLENESS");
        }

        if (userNeuroticism>15 && userNeuroticism<25) {
          speechOutput += this.t("MID_RANGE_MESSAGE");
        }

        if (userNeuroticism>=20){
          speechOutput += this.t("HI_NEUROTICISM");
        } else {
          speechOutput += this.t("LO_NEUROTICISM");
        }

        speechOutput += this.t("END_MESSAGE");

        this.emit(":tell", speechOutput)
    } else {
        currentQuestionIndex += 1;
        correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT));
        var spokenQuestion = Object.keys(translatedQuestions[quizQuestions[currentQuestionIndex]])[0];
        var roundAnswers = populateRoundAnswers.call(this, quizQuestions, currentQuestionIndex, correctAnswerIndex, translatedQuestions);
        var questionIndexForSpeech = currentQuestionIndex + 1;
        var repromptText = this.t("TELL_QUESTION_MESSAGE", questionIndexForSpeech.toString(), spokenQuestion);

        for (var i = 0; i < ANSWER_COUNT; i++) {
            repromptText += (i+1).toString() + ". " + roundAnswers[i] + ". "
        }

  //      speechOutput += userGaveUp ? "" : this.t("ANSWER_IS_MESSAGE");
  //      speechOutput += speechOutputAnalysis + this.t("SCORE_IS_MESSAGE", currentScore.toString()) + repromptText;
        speechOutput += speechOutputAnalysis + repromptText;

        Object.assign(this.attributes, {
            "speechOutput": repromptText,
            "repromptText": repromptText,
            "currentQuestionIndex": currentQuestionIndex,
            "correctAnswerIndex": correctAnswerIndex + 1,
            "questions": quizQuestions,
            "score": currentScore,
            "correctAnswerText": translatedQuestions[quizQuestions[currentQuestionIndex]][Object.keys(translatedQuestions[quizQuestions[currentQuestionIndex]])[0]][0]
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
          quizQuestions.push(i);
    }
    return quizQuestions;
}


function populateRoundAnswers(quizQuestionIndexes, correctAnswerIndex, correctAnswerTargetLocation, translatedQuestions) {
    var answers = ["Disagree",
                   "Slightly disagree",
                   "Neutral",
                   "Slightly agree",
                   "Agree"];
    return answers;
}

function isAnswerSlotValid(intent) {
    var answerSlotFilled = intent && intent.slots && intent.slots.Answer && intent.slots.Answer.value;
    var answerSlotIsInt = answerSlotFilled && !isNaN(parseInt(intent.slots.Answer.value));
    return answerSlotIsInt && parseInt(intent.slots.Answer.value) < (ANSWER_COUNT + 1) && parseInt(intent.slots.Answer.value) > 0;
}
