/**
    @namespace H5P
*/
var H5P = H5P || {};

H5P.PersonalityQuiz = (function ($, EventDispatcher) {
  /**
    A personality quiz.

    @memberof PersonalityQuiz
    @param {Object} params
    @param {number} id
    @constructor
  */
  function PersonalityQuiz(params, id) {
    var self = this;

    self.classPrefix = 'h5p-personality-quiz-';
    self.resultAnimation = params.resultScreen.animation;
    self.resultTitle = params.resultScreen.displayTitle;
    self.resultDescription = params.resultScreen.displayDescription;
    self.resultImagePosition = params.resultScreen.imagePosition;
    self.progressText = params.progressText;
    self.personalities = params.personalities;
    self.numQuestions = params.questions.length;

    self.slidePercentage = 100 / self.numQuestions;

    var loadingImages = [];

    EventDispatcher.call(self);

    /**
      Event handler for the personality quiz completed event. Hides
      the progressbar, since it is no longer needed. Sets the quiz
      as completed, calculates the personality and sets the result.
    */
    self.on('personality-quiz-completed', function () {
      var personality = self.calculatePersonality();

      self.$progressbar.hide();
      self.completed = true;

      self.setResult(personality);

      if (animation && self.resultAnimation === 'fade-in') {
        self.$result.addClass(prefix('fade-in'));
      }

      // Add xAPI event for quiz completion
      var xAPIEvent = self.createXAPIEventTemplate('completed');
      xAPIEvent.setVerb('http://adlnet.gov/expapi/verbs/completed');
      xAPIEvent.setResult({
        "response": personality.name, // Return the final outcome
        "completion": true,
        "success": true // Assuming all quizzes are meant to be completed successfully
      });
      xAPIEvent.data.statement.actor = {
        "name": H5PIntegration.user.name, // Set this dynamically
        "account": {
          "name": H5PIntegration.user.id,
          "homePage": H5PIntegration.siteUrl
        }
      };
      self.trigger(xAPIEvent);
    });

    /**
      Event handler for the personality quiz answer event. Counts
      up all personalities in the answer matching the given personalities.
    */
    self.on('personality-quiz-answer', function (event) {
      var answers;

      if (event !== undefined && event.data !== undefined) {
        answers = event.data.split(', ');

        answers.forEach(function (answer) {
          self.personalities.forEach(function (personality) {
            if (personality.name === answer) {
              personality.count++;
            }
          });
        });

        self.answered += 1;
      }

      self.next();
    });
  }

  PersonalityQuiz.prototype = Object.create(EventDispatcher);
  PersonalityQuiz.prototype.constructor = PersonalityQuiz;

  return PersonalityQuiz;
})(H5P.jQuery, H5P.EventDispatcher);
