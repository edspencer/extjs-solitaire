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

/**
 * Solitaire.MainWindow
 * @extends Ext.Window
 * Renders a Solitaire game
 */
Solitaire.MainWindow = function(config) {
  var config = config || {};
  
  this.topPanel = new Ext.Panel({
    layout: 'column',
    region: 'north',
    height: 130,
    
    defaults: {
      border: false,
      layout: 'column'
    },
    items: [
      {
        columnWidth: (3 / 7),
        items:       [config.dealer, config.deck, {html: ''}],
        defaults:    {columnWidth: (1 / 3), border: false}
      },
      {
        columnWidth: (4 / 7),
        items:       config.suitStacks,
        defaults:    {columnWidth: (1 / 4)}
      }
    ]
  });
  
  this.decksPanel = new Ext.Panel({
    layout:     'column',
    region:     'center',
    items:      config.stacks,
    autoScroll: true,

    defaults: {
      columnWidth: (1 / config.stacks.length)
    }
  });
  
  this.score      = new Ext.Toolbar.TextItem('0');
  this.time       = new Ext.Toolbar.TextItem('0');
  this.leftInDeck = new Ext.Toolbar.TextItem('24');
  
  this.bbar = new Ext.StatusBar({
    statusAlign: 'right',
    items:       ['Left in deck: ', this.leftInDeck, '->', 'Score:', this.score, '-', 'Time:', this.time]
  });
 
  Ext.applyIf(config, {
    title:     'Solitaire',
    height:    680,
    width:     900,
    layout:    'border',
    cls:       'x-solitaire-window',
    constrain: true,
    closable:  false,
    
    tbar: [
      {
        text:    'New Game',
        scope:   this,
        handler: function() {
          this.fireEvent('newgame', this);
        }
      },
      '-',
      {
        text: 'Options',
        menu: [
          {
            text: 'Card background',
            menu: {
              defaults: {
                checked: false,
                group:   'background',
                scope:   this,
                checkHandler: function(item, checked) {
                  if (checked) {
                    this.fireEvent('changeCardBackground', item.text);
                  };
                }
              },
              items: [
                {text: 'Crown'}, {text: 'Cross', checked: true}, {text: 'Circle'}, {text: 'Woman'}, {text: 'Roses'}, {text: 'Checkered'}, {text: 'Squares'}
              ]
            }
          }
        ]
      },
      '-',
      {
        text: 'About',
        menu: {
          items: [
            {
              text:    'View Source',
              handler: function() {
                window.open('http://github.com/edspencer/extjs-solitaire/tree/master');
              }
            },
            {
              text:    'Download Source',
              handler: function() {
                window.open('http://github.com/edspencer/extjs-solitaire/zipball/master');
              }
            },
            {
              text:    'View blog post',
              handler: function() {
                window.open('http://edspencer.net/2009/01/extjs-solitaire.html');
              }
            },
            {
              text:    'Scoring',
              scope:   this,
              handler: this.showScoringHelp
            }
          ]
        }
      }
    ],
    
    bbar: this.bbar,
    
    defaults: {
      border: false
    },
    
    items: [
      this.topPanel,
      this.decksPanel
    ]
  });
 
  Solitaire.MainWindow.superclass.constructor.call(this, config);
  
  this.addEvents(
    /**
     * @event newgame
     * Fires whenever the new game button is clicked
     * @param {Solitaire.MainWindow} this The window firing the event
     */
    'newgame',
    
    /**
     * @event changeCardBackground
     * Fires when the user selects a different card background
     * @param {String} backgroundName The string name of the background to use
     */
    'changeCardBackground'
  );
    
  this.on('render', function() { this.el.alignTo(Ext.getBody(), 'c'); }, this);
  this.on('changeCardBackground', this.setCardBackground, this);
  
  //update the game time and score
  Ext.TaskMgr.start({
    run: function() {
      Ext.fly(this.leftInDeck.getEl()).update(this.game.deck.items.length);
      
      if (!this.game.inWinState()) {
        Ext.fly(this.score.getEl()).update(this.game.getScore());
        Ext.fly(this.time.getEl()).update(this.game.timeTaken());
      };
    },
    interval: 250,
    scope:    this
  });
};

Ext.extend(Solitaire.MainWindow, Ext.Window, {
  
  /**
   * @property scoreHelpWindow
   * @type Ext.Window
   * Scoring help window
   */
  scoreHelpWindow: null,
  
  /**
   * Opens a window describing how scoring works
   */
  showScoringHelp: function() {
    if (!this.scoreHelpWindow) {
      this.scoreHelpWindow = new Ext.Window({
        constrain: true,
        title:     'Scoring',
        cls:       'solitaire-info',
        width:     400,
        height:    200,
        layout:    'fit',
        items: [
          {
            html: '<h1>Scoring</h1><p>You get 10 points for every card you stack on the top card stacks.</p><p>You lose a point for every 10 seconds that pass without winning.</p>'
          }
        ],
        closeAction: 'hide'
      });
    };
    
    this.scoreHelpWindow.show();
  },
  
  /**
   * Changes the background of all cards to the specified background
   * @param {String} backgroundName The name of the background to change to
   */
  setCardBackground: function(backgroundName) {
    var offset = 0; //crown - default
    var width  = Solitaire.Card.prototype.cardWidth;
    switch(backgroundName) {
      case 'Cross'     : offset = 1; break;
      case 'Circle'    : offset = 2; break;
      case 'Woman'     : offset = 3; break;
      case 'Roses'     : offset = 4; break;
      case 'Checkered' : offset = 5; break;
      case 'Squares'   : offset = 6; break;
    };
    
    Ext.util.CSS.updateRule('.x-solitaire-card-hidden', 'background-position', '-' + width * offset + 'px 100px');
  }
});

/**
 * @class Solitaire.Deck
 * @param {Array} cards An array of cards to initialise the deck with
 * Represents the deck of all non-dealt cards
 */
Solitaire.Deck = function(config) {
  var config = config || {};
  
  Solitaire.Deck.superclass.constructor.call(this, config);
  
  this.claimUndealtCards(config.pack);
  
  this.dealer = config.dealer;
  this.dealer.on('click', this.cycleCards, this);
  
  this.on('afterlayout', this.applyClasses, this);
};

Ext.extend(Solitaire.Deck, Ext.Container, {
  
  /**
   * Removes all remaining cards from the pack
   */
  claimUndealtCards: function(pack) {
    this.pack = pack || this.pack;
    
    if (this.pack) {
      while (c = this.pack.getTopCard()) {
        this.pack.moveCard(c, this);
      }
    };
  },
  
  /**
   * @property numberToDeal
   * @type Number
   * The number of cards to deal each time the deck is clicked (usually 1 or 3, defaults to 1)
   */
  numberToDeal: 1,
  
  /**
   * Renders the Deck
   * @param {Ext.Container} ct The container to render this component to
   */
  onRender: function(ct, position) {
    this.el = Ext.get(ct).createChild({
      cls: 'x-solitaire-deck-wrapper',
      children: [{
        cls:   'x-solitaire-deck',
        style: 'background: url(images/cards.gif) no-repeat bottom right;'
      }]
    });
    
    this.deckHolder = this.el.child('.x-solitaire-deck');
    
    Solitaire.Deck.superclass.onRender.apply(this, arguments);
  },
  
  getLayoutTarget: function(paramName) {
    return this.deckHolder;
  },
  
  /**
   * Iterates over the cards in the deck, adding CSS classes accordingly.
   * Intended to be attached to the afterlayout event
   */
  applyClasses: function() {
    this.items.each(function(c) {
      if (c == this.items.items[this.items.length - 1]) {
        //top card in stack
        c.addClass('x-solitaire-card-top');
        c.removeClass('x-solitaire-card-under');
        c.reveal();
      } else {
        c.addClass('x-solitaire-card-under');
        c.removeClass('x-solitaire-card-top');
      };
      
      c.initializeDragSource();
    }, this);
  },
  
  /**
   * Cycles the cards, putting the current bottom item on the top
   */
  cycleCards: function() {
    var bottom = this.items.first();
    if (bottom) {
      this.remove(bottom);
      this.add(bottom); //adds it to the top
      this.doLayout();
    };
  }
});

/**
 * Solitaire.Dealer
 * @extends Ext.Container
 * Represents a set of cards dealt from the Deck
 */

Solitaire.Dealer = Ext.extend(Ext.Container, {
  
  /**
   * Renders the Deal
   * @param {Ext.Container} ct The container to render this component to
   */
  onRender: function(ct) {
    this.el = ct.createChild({
      cls: 'x-solitaire-dealer-wrapper',
      children: [{
        cls:   'x-solitaire-dealer x-solitaire-card-hidden',
        style: 'background-image: url(images/cards.gif);'
      }]
    });
    
    this.dealHolder = this.el.child('.x-solitaire-deal');
    
    this.relayEvents(this.el, ['click']);
    
    Solitaire.Dealer.superclass.onRender.apply(this, arguments);
  },
  
  getLayoutTarget: function() {
    return this.dealHolder;
  }
});

Ext.reg('solitaire-deal', Solitaire.Dealer);

/**
 * @class Solitaire.Card
 * Representation of a single card
 * @cfg {String} suit The suit of the card (one of Diamonds, Hearts, Clubs or Spades)
 * @cfg {String} number The number of name of the card
 * @cfg {Boolean} revealed True if this card has already been revealed to the user (defaults to false)
 */
Solitaire.Card = function(config) {
  var config = config || {};
  Ext.apply(this, {
    revealed: false,
    location: null
  }, config);

  Solitaire.Card.superclass.constructor.call(this, {});
  
  this.addEvents(
    /**
     * @event dblclick
     * Fires when the card is double clicked
     * @param {Solitaire.Card} this The card which was clicked
     */
    'dblclick'
  );
  
  this.on('render', this.initializeDragSource, this);
};

Ext.extend(Solitaire.Card, Ext.Component, {
  
  /**
   * @property cardHeight
   * @type Number
   * The height of each card in the CSS sprite (defaults to 100)
   */
  cardHeight: 100,
  
  /**
   * @property cardWidth
   * @type Number
   * The width of each card in the CSS sprite (defaults to 72)
   */
  cardWidth: 72,
  
  /**
   * @property suits
   * @type Array
   * The suits available to the game (defaults to Diamonds, Hearts, Clubs and Spades)
   */
  suits:   ['Hearts', 'Diamonds', 'Clubs', 'Spades'],
  
  /**
   * @property numbers
   * @type Array
   * The numbers of the cards (defaults to Ace through to King)
   */
  numbers: ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"],
  
  /**
   * @property imageUrl
   * @type String
   * The URL at which to find the CSS sprite of all cards (defaults to images/cards.gif).
   */
  imageUrl: 'images/cards.gif',
  
  /**
   * Moves this card to the specified container
   * @param {Ext.Container} newContainer The container to move the card to
   * @param {Number} position An optional position to insert the card at (defaults to the top)
   */
  moveTo: function(newContainer, position) {
    if (!this.pack) { return false; }
    
    return this.pack.moveCard(this, newContainer, position);
  },
  
  /**
   * Returns the colour of the card (red or black)
   * @return {String} The colour of the card
   */
  getColour: function() {
    if (this.suit == 'Hearts' || this.suit == 'Diamonds') {
      return 'red';
    };
    
    if (this.suit == 'Clubs' || this.suit == 'Spades') {
      return 'black';
    };
    
    throw new Error("Could not determine the colour of the " + this.suit + " suit.");
  },
  
  /**
   * Renders this card
   * @param {Ext.Container} ct The container to render this Card to
   */
  onRender: function(ct, position) {
    var cls = this.revealed ? 'x-solitaire-card-revealed' : 'x-solitaire-card-hidden';
    this.el = ct.createChild({
      tag:   'div',
      cls:   'x-solitaire-card ' + cls,
      style: this.imageStyle(this)
    });
  },
  
  /**
   * Returns the styling required for this card (offsets for the CSS sprite)
   * @return {String} The url of the image for this card
   */
  imageStyle: function() {
    if (this.revealed) {
      var suitOffset   = this.cardHeight * -this.suits.indexOf(this.suit);
      var numberOffset = this.cardWidth  * -this.numbers.indexOf(this.number);
          
      return String.format("background-image: url({0}); background-position: {1}px {2}px", this.imageUrl, numberOffset, suitOffset);
    } else {
      return String.format("background-image: url({0});", this.imageUrl);
    };
  },
  
  /**
   * Reveals this card (adds appropriate css classes)
   */
  reveal: function() {
    this.revealed = true;
    this.el.applyStyles(this.imageStyle());
  },
  
  getBestMatch: function(dds) {
    //FIXME: NO! Just no.  Not good
    try {
      var winner = null;
  
      var len = dds.length;
  
      if (len == 1) {
          winner = dds[0];
      } else {
        for (var i=0; i<len; ++i) {
          var dd = dds[i];
                      
          if (false && dd.cursorIsOver) {
            winner = dd;
            break;
          
          } else {
            if (!winner || winner.overlap.getArea() < dd.overlap.getArea()) {
              winner = dd;
            }
          }
        }
      }
  
      return winner;
    } catch(e) {};
  },
  
  /**
   * Sets this card up to be draggable
   */
  initializeDragSource: function() {
    this.el.on('dblclick', function() { this.fireEvent('dblclick', this); }, this);
    
    //FIXME: Seriously, we should be reusing these :( Not sure if this even does what I want it to
    if (this.dragSource) {
      this.dragSource.destroy();
      delete this.dragSource;
    }
    
    //only allow a card to be dragged if it has been revealed
    if (!this.revealed) { return false; }
        
    //keep a reference to the card to use in getDragData
    var card = this;
    
    this.dragSource = new Ext.dd.DragSource(this.getEl(), {
      getDragData: function() {
        return {
          card: card
        };
      },
      
      onDragOver: function(e, id) {
        this.cachedTarget = card.getBestMatch(id);
        
        Ext.dd.DragSource.prototype.onDragOver.apply(this, arguments);
      },
      
      /**
       * Finds the offset of the click event relative to the card and sets this as the offset delta
       * for the ghost element so that the click point of the card is kept with the mouse pointer
       */
      autoOffset: function(x, y) {
        var cardXY = card.getEl().getXY();
        
        var xDelta = x - cardXY[0] + 22;
        var yDelta = y - cardXY[1];
        
        this.setDelta(xDelta, yDelta);
      },
      
      /**
       * Creates the drag proxy
       */
      onInitDrag: function(x, y) {
        var stack = card.location;
        
        //if the card is on a stack and is not the top card on that stack,
        //create a proxy containing this card and all on top of it
        if (stack && stack.isXType('solitaire-stack') && card != stack.getTopCard()) {
          var cards = stack.getCardsAbove(card);
          var clone = Ext.DomHelper.append(Ext.getBody(), {id: Ext.id()}, false);
          
          for (var i=0; i < cards.length; i++) {
            clone.appendChild(cards[i].el.dom.cloneNode(true));
          };

          this.proxy.update(clone);
        } else {
          var clone = this.el.dom.cloneNode(true);
          clone.id = Ext.id(); 
          this.proxy.update(clone);
        }
        
        this.onStartDrag(x, y);
        return true;
      },
      
      onDragEnter: function(e, id) {
        var target = card.getBestMatch(id);
        
        if(this.beforeDragEnter(target, e, id) !== false){
          if(target.isNotifyTarget){
            var status = target.notifyEnter(this, e, this.dragData);
            this.proxy.setStatus(status);
          }else{
            this.proxy.setStatus(this.dropAllowed);
          }
          
          if(this.afterDragEnter){
            this.afterDragEnter(target, e, id);
          }
        }
      },
      
      /**
       * Abstract drag out
       * @param {Ext.EventObject} e The drag out event
       */
      onDragOut: function(e, id) {
        this.cachedTarget = card.getBestMatch(id);
        
        Ext.dd.DragSource.prototype.onDragOut.apply(this, arguments);
      },
      
      /**
       * Handles logic of identifying drop source and firing appropriate events
       * @param {Ext.EventObject} e The drop event
       * @param {Array} id The array of intersecting drop targets identified (using INTERSECT mode)
       */
      onDragDrop: function(e, id) {
        this.cachedTarget = card.getBestMatch(id);
        
        Ext.dd.DragSource.prototype.onDragDrop.apply(this, arguments);
      }
    });
  }
  
});

Ext.reg('solitaire-card', Solitaire.Card);

/**
 * @class Solitaire.Pack
 * @extends Ext.util.Observable
 * Represents a complete pack of cards
 */
Solitaire.Pack = function(config) {
  var config = config || {};
  
  var cards = [];
  
  var suits   = Solitaire.Card.prototype.suits;
  var numbers = Solitaire.Card.prototype.numbers;
  
  Solitaire.Pack.superclass.constructor.call(this, config);
  
  this.addEvents(
    /**
     * @event beforemovecard
     * Fires before a card is moved, return false from any listener to cancel
     * @param {Solitaire.Pack} this The pack of cards
      * @param {Solitaire.Card} card The card which was just moved
      * @param {Ext.Container} newContainer The container the card will be moved to
      * @param {Ext.Container} currentContainer The container the card is currently inside
     */
    'beforemovecard',
    
    /**
     * @event movecard
     * Fires after a card has been moved from one container to another
     * @param {Solitaire.Pack} this The pack of cards
     * @param {Solitaire.Card} card The card which was just moved
     * @param {Ext.Container} newContainer The container the card is now inside
     * @param {Ext.Container} oldContainer The container the card was previously inside
     */
    'movecard',
    
    /**
     * @event carddblclick
     * Fires when a card in this pack is double clicked
     * @param {Solitaire.Card} card The card which was double clicked
     * @param {Solitaire.Pack} this This pack
     */
    'carddblclick'
  );
  
  //add the cards
  for (var i=0; i < suits.length; i++) {
    for (var j=0; j < numbers.length; j++) {
      var card = new Solitaire.Card({
        suit:   suits[i],
        number: numbers[j],
        pack:   this,
        listeners: {
          'dblclick': {
            scope: this,
            fn:    function(card) {this.fireEvent('carddblclick', card, this);}
          }
        }
      });
      cards.push(card);
    };
  };
  
  this.getRevealed = function() {
    
  };
  
  this.getUnrevealed = function() {
    
  };
  
  /**
   * Moves a card to a new container.  Adds/removes card from containers appropriately
   * and calls doLayout() on each altered container
   */
  this.moveCard = function(card, newContainer, position) {
    var oldContainer = card.location;
    
    if (this.fireEvent('beforemovecard', this, card, newContainer, oldContainer)) {
      var cardsToMove = [card];
      
      if (oldContainer) {
        if (oldContainer.isXType('solitaire-stack', true)) {
          var index  = oldContainer.items.indexOf(card);
          var number = oldContainer.items.length;
          
          //add all cards on top of this one
          for (var j=index+1; j < number; j++) {
            cardsToMove.push(oldContainer.items.get(j));
          };
        };
        
        for (var i=0; i < cardsToMove.length; i++) {
          oldContainer.remove(cardsToMove[i]);
        };
        
        oldContainer.doLayout();
      };
      
      for (var i=0; i < cardsToMove.length; i++) {
        if (typeof position == "undefined") {
          //defaults to adding the card to the top
          newContainer.add(cardsToMove[i]);
        } else {
          newContainer.insert(position, cardsToMove[i]);
        };
        cardsToMove[i].location = newContainer;
        
        this.fireEvent('movecard', this, cardsToMove[i], newContainer, oldContainer);
      };
      
      newContainer.doLayout();
      
      //FIXME: this isn't great, we shouldn't have to do this really
      //reattach double click listeners to all moved cards
      var pack = this;
      for (var i=0; i < cardsToMove.length; i++) {
        cardsToMove[i].on('dblclick', function() { pack.fireEvent('carddblclick', this, pack); });
      };

      return true;
    }
  };
  
  /**
   * Returns the card currently on the top of the pack
   * @return {Solitaire.Card} The card from the top of the pack
   */
  this.getTopCard = function() {
    return cards.shift();
  };
  
  /**
   * Shuffles the pack the specified number of times
   * @param {Number} times The number of times to shuffle the pack
   */
  this.shuffle = function(times) {
    var times = times || 1;
    
    //shuffle the pack as many times as required
    for (var x = times - 1; x >= 0; x--) {
      var i = cards.length;
      
      while (--i) {
        var j = Math.floor(Math.random() * (i + 1));
        var a = cards[i];
        var b = cards[j];
        
        cards[i] = b;
        cards[j] = a;
      }
    };
  };
  
  this.shuffle();
};

Ext.extend(Solitaire.Pack, Ext.util.Observable);

/**
 * @class Solitaire.Stack
 * @param {Array} An ordered array of cards to initialise this stack with
 * Represents an ordered stack of cards
 */
Solitaire.Stack = function(config) {
  var config = config || {};
  
  this.addCard = function(card) {
    this.add(card);
  };
  
  this.removeCard = function() {
    return cards.pop();
  };
    
  Solitaire.Stack.superclass.constructor.call(this, config);
    
  this.addEvents(
    /**
     * @event carddropped
     * Fires when a card is dropped on this stack
     * @param {Solitaire.Stack} this The stack the card was dropped on
     * @param {Solitaire.Card} card The card that was dropped
     */
    'carddropped'
  );
  
  this.on('render',      this.initializeDropTarget, this);
  this.on('afterlayout', this.applyClasses,         this);
};

Ext.extend(Solitaire.Stack, Ext.Container, {
  /**
   * Returns true if the request drop is allowed
   * @param {Solitaire.Card} cardToDrop The card the user wishes to drop onto this stack
   * @return {Boolean} True if this drop is allowed
   */
  dropAllowed: function(cardToDrop) {
    var nums = Solitaire.Card.prototype.numbers;
    
    var topCard = this.getTopCard();
    
    if (topCard) {
      var nextNumber = nums.indexOf(cardToDrop.number) == (nums.indexOf(topCard.number) - 1);
      var diffColour = topCard.getColour() != cardToDrop.getColour();
    
      return nextNumber && diffColour;
    } else {
      //can drop the highest card (King) on an empty stack
      return cardToDrop.number == nums[nums.length - 1];
    };
  },
  
  /**
   * Returns the top card on this stack, or null if the stack is empty (does not remove the card from the stack)
   * @return {Solitaire.Card/null} The top card
   */
  getTopCard: function() {
    if (!this.items || this.items.length == 0) {
      return null;
    };
    return this.items.items[this.items.items.length - 1];
  },
  
  /**
   * Returns an array of cards above (higher in the stack) this one.  Also contains the passed card
   * @param {Solitaire.Card} card The bottom card to return
   * @return {Array} An array of all cards above the requested card.  Also contains the card itself
   */
  getCardsAbove: function(card) {
    var above = [];
    var items = this.items.items;
    var found = false;
    
    for (var i=0; i < items.length; i++) {
      var c = items[i];
      if (c == card) { found = true; }
      
      if (found) { above.push(c); }
    };
    
    return above;
  },
  
  /**
   * Iterates over the cards in this stack, adding CSS classes accordingly.
   * Intended to be attached to the afterlayout event
   */
  applyClasses: function() {
    this.items.each(function(c) {
      if (c == this.items.items[this.items.length - 1]) {
        //top card in stack
        c.addClass('x-solitaire-card-top');
        c.removeClass('x-solitaire-card-under');
        c.reveal();
      } else {
        c.addClass('x-solitaire-card-under');
        c.removeClass('x-solitaire-card-top');
      };
      
      c.initializeDragSource();
    }, this);
  },
  
  /**
   * Creates the markup to render this stack
   */
  onRender: function(ct, position) {
    this.el = ct.createChild({
      cls: 'x-solitaire-stack-wrapper',
      children: [
        {
          cls:   'x-solitaire-stack',
          style: 'background: url(images/cards.gif) no-repeat bottom right;'
        }
      ]
    });
    
    this.stackHolder = this.el.child('.x-solitaire-stack');
    
    Solitaire.Stack.superclass.onRender.apply(this, arguments);
  },

  getLayoutTarget: function(){
    return this.stackHolder;
  },
  
  /**
   * Sets up a drag zone to allow the top card of each stack to be draggable
   */
  initializeDropTarget: function() {
    //local reference to use in dropTarget config
    var stack = this;
    
    this.dropTarget = new Ext.dd.DropTarget(this.getEl(), {
      notifyOver: function(source, e, data) {
        if (stack.dropAllowed(data.card)) {
          return Ext.dd.DropTarget.prototype.dropAllowed;
        } else {
          return Ext.dd.DropTarget.prototype.dropNotAllowed;
        };
      },
      
      notifyDrop: function(source, e, data) {
        if (stack.dropAllowed(data.card)) {
          return stack.fireEvent('carddropped', stack, data.card);
        } else {
          return false;
        }
      }
    });
  }
});

Ext.reg('solitaire-stack', Solitaire.Stack);

/**
 * Solitaire.SuitStack
 * @extends Solitaire.Stack
 * Specialised implementation of Stack which only allows the same suit to be dropped
 */
Solitaire.SuitStack = function(config) {
  var config = config || {};
  
  Solitaire.SuitStack.superclass.constructor.call(this, config);
};
Ext.extend(Solitaire.SuitStack, Solitaire.Stack, {
  /**
   * Returns true if the request drop is allowed
   * @param {Solitaire.Card} cardToDrop The card the user wishes to drop onto this stack
   * @return {Boolean} True if this drop is allowed
   */
  dropAllowed: function(cardToDrop) {
    var nums = Solitaire.Card.prototype.numbers;
    var topCard = this.getTopCard();
    
    if (!topCard) {
      //ace can be dropped when no other card is present
      if (nums.indexOf(cardToDrop.number) == 0) {
        return true;
      } else {
        return false;
      };
    };
    
    var sameSuit   = (topCard.suit == cardToDrop.suit);
    var nextNumber = nums.indexOf(cardToDrop.number) == (nums.indexOf(topCard.number) + 1);
    
    return sameSuit && nextNumber;
  },
  
  /**
   * Returns whether this suit stack has been completed yet or not (all cards present in right order)
   * @return {Boolean} True if this suit stack is complete
   */
  isComplete: function() {
    if (!this.items) { return false; }

    var nums = Solitaire.Card.prototype.numbers;
    
    //makes sure each and every number is in the correct place
    for (var i=0; i < nums.length; i++) {
      if (!this.items.items[i] || this.items.items[i].number != nums[i]) {
        return false;
      }
    };
    
    return true;
  },
  
  /**
   * Renders this Suit Stack
   * @param {Ext.Container} ct The container to render this component to
   */
  onRender: function(ct, position) {
    this.el = ct.createChild({
      cls: 'x-solitaire-stack-wrapper',
      children: [
        {
          cls: 'x-solitaire-suit-stack x-solitaire-stack',
          style: 'background: url(images/cards.gif) no-repeat bottom right;'
        }
      ]
    });
    
    this.stackHolder = this.el.child('.x-solitaire-suit-stack');
  }
});

