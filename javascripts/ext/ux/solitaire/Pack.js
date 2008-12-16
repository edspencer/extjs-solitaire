/**
 * @class Ext.ux.Solitaire.Pack
 * Represents a complete pack of cards
 */
Ext.ux.Solitaire.Pack = function() {
  var cards = [];
  
  var suits   = Ext.ux.Solitaire.Card.prototype.suits;
  var numbers = Ext.ux.Solitaire.Card.prototype.numbers;
  
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
    var oldContainer;
    if (card.location) {
      oldContainer = card.location;
      oldContainer.remove(card);
      oldContainer.doLayout();
    };
    
    newContainer.add(card);
    card.location = newContainer;
    newContainer.doLayout();
    
    return true;
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