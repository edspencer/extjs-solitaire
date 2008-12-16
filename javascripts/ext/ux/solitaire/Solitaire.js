Ext.ns('Ext.ux.Solitaire');

Ext.ux.Solitaire.Game = function() {
  this.pack = new Ext.ux.Solitaire.Pack();
  this.deck = new Ext.ux.Solitaire.Deck();
  
  this.win = new Ext.ux.Solitaire.MainWindow({
    deck:       this.deck,
    suitStacks: this.initialiseSuitStacks(),
    stacks:     this.initialiseStacks()
  });
};

Ext.ux.Solitaire.Game.prototype = {
  
  /**
   * @property stacks
   * @type Array
   * Array holding the stacks used in this game
   */
  stacks: [],
  
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
   * Creates stacks and populates them with cards from the Pack
   */
  initialiseStacks: function() {
    this.stacks = this.stacks || [];
    
    for (var i=0; i < this.numberOfStacks; i++) {
      var items = [];
      
      //add 1 card to first stack, 2 to second etc.  Top card on each stack is revealed
      for (var j=0; j <= i; j++) {
        var card = this.pack.getTopCard();
        card.revealed = (i == j);
        items.push(card);
      };
      
      this.stacks.push(new Ext.ux.Solitaire.Stack(items));
    };
    
    return this.stacks;
  },
  
  initialiseSuitStacks: function() {
    var numSuits = Ext.ux.Solitaire.Card.prototype.suits.length;  
    this.suitStacks = [];
    for (var i=0; i < numSuits; i++) {
      this.suitStacks.push(new Ext.ux.Solitaire.SuitStack());
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