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
    'movecard',
    
    /**
     * @event cardDblclick
     * Fires when a card in this pack is double clicked
     * @param {Ext.ux.Solitaire.Card} card The card which was double clicked
     * @param {Ext.ux.Solitaire.Pack} this This pack
     */
    'cardDblclick'
  );
  
  //add the cards
  for (var i=0; i < suits.length; i++) {
    for (var j=0; j < numbers.length; j++) {
      var card = new Ext.ux.Solitaire.Card({
        suit:   suits[i],
        number: numbers[j],
        pack:   this,
        listeners: {
          'dblclick': {
            scope: this,
            fn:    function(card) {this.fireEvent('cardDblclick', card, this);}
          }
        }
      });
      cards.push(card);
    };
  };
  
  /**
   * Moves a card to a new container.  Adds/removes card from containers appropriately
   * and calls doLayout() on each altered container
   */
  this.moveCard = function(card, newContainer) {
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
          oldContainer.remove(cardsToMove[i])
        };
        
        oldContainer.doLayout();
      };
      
      for (var i=0; i < cardsToMove.length; i++) {
        newContainer.add(cardsToMove[i]);
        cardsToMove[i].location = newContainer;
        
        this.fireEvent('movecard', this, cardsToMove[i], newContainer, oldContainer);
      };
      
      newContainer.doLayout();

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