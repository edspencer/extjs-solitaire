/**
 * @class Ext.ux.Solitaire.Pack
 * @extends Ext.util.Observable
 * Represents a complete pack of cards
 */
Ext.ux.Solitaire.Pack = function(config) {
  var config = config || {};
  
  var cards = [];
  
  var suits   = Ext.ux.Solitaire.Card.prototype.suits;
  var numbers = Ext.ux.Solitaire.Card.prototype.numbers;
  
  Ext.ux.Solitaire.Pack.superclass.constructor.call(this, config);
  
  this.addEvents(
    /**
     * @event beforemovecard
     * Fires before a card is moved, return false from any listener to cancel
     * @param {Ext.ux.Solitaire.Pack} this The pack of cards
      * @param {Ext.ux.Solitaire.Card} card The card which was just moved
      * @param {Ext.Container} newContainer The container the card will be moved to
      * @param {Ext.Container} currentContainer The container the card is currently inside
     */
    'beforemovecard',
    
    /**
     * @event movecard
     * Fires after a card has been moved from one container to another
     * @param {Ext.ux.Solitaire.Pack} this The pack of cards
     * @param {Ext.ux.Solitaire.Card} card The card which was just moved
     * @param {Ext.Container} newContainer The container the card is now inside
     * @param {Ext.Container} oldContainer The container the card was previously inside
     */
    'movecard'
  );
  
  //add the cards
  for (var i=0; i < suits.length; i++) {
    for (var j=0; j < numbers.length; j++) {
      cards.push(new Ext.ux.Solitaire.Card({suit: suits[i], number: numbers[j], pack: this}));
    };
  };
  
  /**
   * Moves a card to a new container.  Adds/removes card from containers appropriately
   * and calls doLayout() on each altered container
   */
  this.moveCard = function(card, newContainer) {
    var oldContainer = card.location;
    
    if (this.fireEvent('beforemovecard', this, card, newContainer, oldContainer)) {
      if (oldContainer) {
        oldContainer.remove(card);
        oldContainer.doLayout();
      };
      
      newContainer.add(card);
      card.location = newContainer;
      newContainer.doLayout();

      this.fireEvent('movecard', this, card, newContainer, oldContainer);
      return true;
    }
  };
  
  /**
   * Returns the card currently on the top of the pack
   * @return {Ext.ux.Solitaire.Card} The card from the top of the pack
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

Ext.extend(Ext.ux.Solitaire.Pack, Ext.util.Observable);