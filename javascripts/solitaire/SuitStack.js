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