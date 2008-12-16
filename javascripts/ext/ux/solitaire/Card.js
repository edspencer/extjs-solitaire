/**
 * @class Ext.ux.Solitaire.Card
 * Representation of a single card
 * @param {String} suit The suit of the card (one of Diamonds, Hearts, Clubs or Spades)
 * @param {String} number The number of name of the card
 * @param {Boolean} revealed True if this card has already been revealed to the user (defaults to false)
 */
Ext.ux.Solitaire.Card = function(suit, number, revealed) {
  this.suit     = suit;
  this.number   = number;
  
  this.revealed = revealed || false;
  
  Ext.ux.Solitaire.Card.superclass.constructor.call(this, {});
  
  this.on('render', this.initializeDragSource, this);
  
  /**
   * Returns the colour of the card (red or black)
   * @return {String} The colour of the card
   */
  this.getColour = function() {
    if (this.suit == 'Hearts' || this.suit == 'Diamonds') {
      return 'red';
    };
    
    if (this.suit == 'Clubs' || this.suit == 'Spades') {
      return 'black';
    };
    
    throw new Error("Could not determine the colour of the " + this.suit + " suit.");
  };
  
    /**
   * Renders this card
   * @param {Ext.Container} ct The container to render this Card to
   */
  this.onRender = function(ct, position) {
    this.el = ct.createChild({
      tag:   'div',
      cls:   'x-solitaire-card',
      style: this.imageStyle(this)
    });
  };
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
   * Returns the styling required for this card (offsets for the CSS sprite)
   * @param {String} suit The suit name of the card
   * @param {String} number The number or name of the card
   * @return {String} The url of the image for this card
   */
  imageStyle: function(card) {
    if (card.revealed) {
      var suitOffset   = this.cardHeight * -this.suits.indexOf(card.suit);
      var numberOffset = this.cardWidth  * -this.numbers.indexOf(card.number);
          
      return String.format("background-image: url({0}); background-position: {1}px {2}px", card.imageUrl, numberOffset, suitOffset);
    } else {
      return String.format("background: transparent url({0}) 72px 100px", card.imageUrl);
    };
  },
  
  /**
   * Sets this card up to be draggable
   */
  initializeDragSource: function() {
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