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