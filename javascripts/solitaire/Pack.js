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