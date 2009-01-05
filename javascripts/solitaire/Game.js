Ext.ns('Solitaire');

Solitaire.Game = function() {
  this.createSuitStacks();
  this.createStacks();
  this.createDeckAndDealer();
  
  if (!this.win) {
    this.win = new Solitaire.MainWindow({
      deck:       this.deck,
      dealer:     this.dealer,
      suitStacks: this.suitStacks,
      stacks:     this.stacks,
      game:       this,

      listeners: {
        'newgame': {
          scope: this,
          fn: function() {
            if (this.inProgress) {
              Ext.Msg.confirm('Game in progress', "Are you sure?  You'll lose your current game", function(btn) {
                if (btn == 'yes') {
                  // this.newGame();
                  window.location = window.location;
                };
              });
            } else {
              // this.newGame();
              window.location = window.location;
            }
          }
        }
      }
    });
  };
  
  this.newGame();
};

Solitaire.Game.prototype = {
  
  /**
   * @property stacks
   * @type Array
   * Array holding the stacks used in this game
   */
  stacks: [],
  
  /**
   * @property suitStacks
   * @type Array
   * Array holding the suit stacks used in this game
   */
  suitStacks: [],
  
  /**
   * @property inProgress
   * @type Boolean
   * true if a game is in progress
   */
  inProgress: false,
  
  /**
   * @property numberOfStacks
   * @type Number
   * The number of stacks to start this game with (defaults to 7)
   */
  numberOfStacks: 7,
  
  /**
   * @property startTime
   * @type Date
   * Date and time game started
   */
  startTime: new Date(),
  
  /**
   * Returns the time this game has been running for so far in seconds
   * @return {Number} The number of seconds passed so far this game
   */
  timeTaken: function() {
    this.startTime = this.startTime || new Date();
    
    return Math.round((new Date() - this.startTime) / 1000);
  },
  
  /**
   * Resets the game
   */
  newGame: function() {
    //clear cards from the suit stacks
    for (var i=0; i < this.suitStacks.length; i++) {
      var s = this.suitStacks[i];
      
      if (s.items) {
        s.items.each(function(card) { s.remove(card); card.destroy(); });
        s.doLayout();  
      };
    };
    
    //clear cards from the stacks
    for (var i=0; i < this.stacks.length; i++) {
      var s = this.stacks[i];
      
      if (s.items) {
        s.items.each(function(card) { s.remove(card); card.destroy(); });
        s.doLayout();        
      };
    };
    
    //get a new pack, repopulate stacks and deck
    this.pack = new Solitaire.Pack();
    this.initialiseStacks();
    this.deck.claimUndealtCards(this.pack);
    
    this.pack.on('movecard',     this.updateGameState, this);
    this.pack.on('carddblclick', this.autoMoveCard,    this);
    
    this.startTime = new Date();
  },
  
  /**
   * Adds up the number of cards in the correct position and removes a time penalty
   * @return {Number} The current score
   */
  getScore: function() {
    var score = 0;
    
    //10 points for every card in a suit stack
    for (var i=0; i < this.suitStacks.length; i++) {
      if (this.suitStacks[i].items) {
        score += (this.suitStacks[i].items.length * 10);
      };
    };
    
    //5 points for every card removed from the Deck.  Deck starts with 24 cards
    // score += ((24 - this.deck.items.length) * 5); //that's just dumb
    
    
    
    //-1 point for every 10 seconds taken
    score -= (Math.floor(this.timeTaken() / 10));
    
    return score;
  },
  
  /**
   * Returns true if the game is in a winning state (all suit stacks complete)
   * @return {Boolean} True if the game has been won
   */
  inWinState: function() {
    for (var i=0; i < this.suitStacks.length; i++) {
      if (!this.suitStacks[i].isComplete()) {
        return false;
      }
    };
    
    return true;
  },
  
  /**
   * Updates inProgress after each move.  Intended to be attached to
   * pack's movecard event
   */
  updateGameState: function() {
    if (this.inWinState()) {
      if (this.inProgress) {
        this.inProgress = false;
        this.displayWinMessage();        
      };
    } else {
      this.inProgress = true;
    }
  },
  
  /**
   * Attempts to automaticaly move the given card to the appropriate suit stack
   * @param {Solitaire.Card} card The card to automatically move
   * @return {Boolean} True if a valid move was found and attempted
   */
  autoMoveCard: function(card) {
    for (var i=0; i < this.suitStacks.length; i++) {
      var s = this.suitStacks[i];
      if (s.dropAllowed(card)) {
        card.moveTo(s);
        return true;
      };
    };
    
    return false;
  },
  
  /**
   * Displays congrats window
   */
  displayWinMessage: function() {
    Ext.Msg.alert('Winnerman!', "You've won, well done.  Seriously, you're awesome, just amazing.");
  },
  
  /**
   * Sets up the Deck
   */
  createDeckAndDealer: function() {
    this.dealer = new Solitaire.Dealer();
    this.deck   = new Solitaire.Deck({pack: this.pack, dealer: this.dealer});
  },
  
  /**
   * Populates stacks with cards from the Pack
   */
  initialiseStacks: function() {
    for (var i=0; i < this.stacks.length; i++) {
      var stack = this.stacks[i];
      
      //add 1 card to first stack, 2 to second etc.  Top card on each stack is revealed
      for (var j=0; j <= i; j++) {
        var card = this.pack.getTopCard();
        card.revealed = (i == j);
        card.moveTo(stack);
      };
    };
  },
  
  /**
   * Creates stacks components
   */
  createStacks: function() {
    for (var i=0; i < this.numberOfStacks; i++) {
      var stack = new Solitaire.Stack({
        listeners: {
          'carddropped': {
            fn: function(stack, card) {
              this.pack.moveCard(card, stack);
            },
            scope: this
          }
        }
      });
      
      this.stacks.push(stack);
    };
    
    return this.stacks;
  },
  
  /**
   * Creates Suit Stack components
   */
  createSuitStacks: function() {
    var numSuits = Solitaire.Card.prototype.suits.length;  
    this.suitStacks = this.suitStacks || [];
    for (var i=0; i < numSuits; i++) {
      this.suitStacks.push(new Solitaire.SuitStack({
        listeners: {
          'carddropped': {
            fn: function(stack, card) {
              this.pack.moveCard(card, stack);
            },
            scope: this
          }
        }
      }));
    };
    
    return this.suitStacks;
  },
  
  /**
   * Starts the game by opening the window
   */
  launch: function() {
    this.win.show();
  }
};