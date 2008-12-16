/**
 * @class Ext.ux.Solitaire.Deck
 * @param {Array} cards An array of cards to initialise the deck with
 * Represents the deck of all non-dealt cards
 */
Ext.ux.Solitaire.Deck = function(config) {
  var config = config || {};
  
  Ext.ux.Solitaire.Deck.superclass.constructor.call(this, config);
  
  if (config.pack) {
    this.pack = config.pack;
    while (c = this.pack.getTopCard()) {
      this.pack.moveCard(c, this);
    }
  };
  
  this.on('afterlayout', this.applyClasses, this);
};

Ext.extend(Ext.ux.Solitaire.Deck, Ext.Container, {
  
  /**
   * Renders the Deck
   * @param {Ext.Container} ct The container to render this component to
   */
  onRender: function(ct, position) {
    this.el = Ext.get(ct).createChild({
      tag: 'div',
      cls: 'x-solitaire-deck'
    });
    
    this.el.on('click', this.cycleCards, this);
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
   * Cycles the cards, putting the current top item on the bottom
   */
  cycleCards: function() {
    var top = this.items.last();
    if (top) {
      this.remove(top);
      this.items.insert(0, top);
      this.doLayout();
    };
  }
});