Ext.ns('Ext.ux.Solitaire');

Ext.ux.Solitaire.Game = function() {
  this.initialise();
};

Ext.ux.Solitaire.Game.prototype = {
  
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
   * Initialises the game, sets up pack, deck, stacks and window
   */
  initialise: function() {
    this.pack = new Ext.ux.Solitaire.Pack();
    this.initialiseSuitStacks();
    this.initialiseStacks();
    
    this.deck = new Ext.ux.Solitaire.Deck({pack: this.pack});
    
    if (this.win) {this.win.close(); this.win.destroy();}

    this.win = new Ext.ux.Solitaire.MainWindow({
      deck:       this.deck,
      suitStacks: this.suitStacks,
      stacks:     this.stacks,
      
      listeners: {
        'newgame': {
          scope: this,
          fn: function() {
            if (this.inProgress) {
              alert('in progress');
            } else {this.initialise(); this.launch();}
          }
        }
      }
    });
    
    this.pack.on('movecard', this.startGame, this);
  },
  
  /**
   * Updates internal representation of game to indicate that a game is in progress
   */
  startGame: function() {
    this.inProgress = true;
  },
  
  /**
   * Creates stacks and populates them with cards from the Pack
   */
  initialiseStacks: function() {
    this.stacks = this.stacks || [];
    
    for (var i=0; i < this.numberOfStacks; i++) {
      var stack = new Ext.ux.Solitaire.Stack({
        listeners: {
          'carddropped': {
            fn: function(stack, card) {
              this.pack.moveCard(card, stack);
            },
            scope: this
          }
        }
      });
      
      //add 1 card to first stack, 2 to second etc.  Top card on each stack is revealed
      for (var j=0; j <= i; j++) {
        var card = this.pack.getTopCard();
        card.revealed = (i == j);
        card.moveTo(stack);
      };
      
      this.stacks.push(stack);
    };
    
    return this.stacks;
  },
  
  initialiseSuitStacks: function() {
    var numSuits = Ext.ux.Solitaire.Card.prototype.suits.length;  
    this.suitStacks = this.suitStacks || [];
    for (var i=0; i < numSuits; i++) {
      this.suitStacks.push(new Ext.ux.Solitaire.SuitStack({
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