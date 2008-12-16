/**
 * @class Ext.ux.Solitaire.Deck
 * @param {Array} cards An array of cards to initialise the deck with
 * Represents the deck of all non-dealt cards
 */
Ext.ux.Solitaire.Deck = function(cards) {
  var cards = cards || [];
  
  var config = {
    items: [{
      html: '<p>Deck</p>'
    }]
  };
  
  Ext.ux.Solitaire.Deck.superclass.constructor.call(this, config);
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
  }
});