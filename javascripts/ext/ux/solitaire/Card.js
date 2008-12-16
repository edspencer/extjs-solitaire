/**
 * @class Ext.ux.Solitaire.Card
 * Representation of a single card
 * @cfg {String} suit The suit of the card (one of Diamonds, Hearts, Clubs or Spades)
 * @cfg {String} number The number of name of the card
 * @cfg {Boolean} revealed True if this card has already been revealed to the user (defaults to false)
 */
Ext.ux.Solitaire.Card = function(config) {
  var config = config || {};
  Ext.apply(this, {
    revealed: false,
    location: null
  }, config);

  Ext.ux.Solitaire.Card.superclass.constructor.call(this, {});
  
  this.on('render', this.initializeDragSource, this);
};

Ext.extend(Ext.ux.Solitaire.Card, Ext.Component, {
  
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
   */
  moveTo: function(newContainer) {
    if (!this.pack) { return false; }
    
    return this.pack.moveCard(this, newContainer);
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
      return String.format("background: transparent url({0}) 72px 100px;", this.imageUrl);
    };
  },
  
  /**
   * Reveals this card (adds appropriate css classes)
   */
  reveal: function() {
    this.revealed = true;
    this.el.applyStyles(this.imageStyle());
  },
  
  /**
   * Sets this card up to be draggable
   */
  initializeDragSource: function() {
    //only allow a card to be dragged if it has been revealed
    if (!this.revealed) { return false; }
        
    //keep a reference to the card to use in getDragData
    var card = this;
    
    this.dragSource = new Ext.dd.DragSource(this.getEl(), {
      getDragData: function() {
        return {
          card: card
        };
      }
    });
  }
  
});