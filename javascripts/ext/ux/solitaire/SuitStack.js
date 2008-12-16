/**
 * Ext.ux.Solitaire.SuitStack
 * @extends Ext.ux.Solitaire.Stack
 * Specialised implementation of Stack which only allows the same suit to be dropped
 */
Ext.ux.Solitaire.SuitStack = function(config) {
  var config = config || {};
 
  Ext.applyIf(config, {
    
  });
 
  Ext.ux.Solitaire.SuitStack.superclass.constructor.call(this, config);
};
Ext.extend(Ext.ux.Solitaire.SuitStack, Ext.ux.Solitaire.Stack, {
  /**
   * Returns true if the request drop is allowed
   * @param {Ext.ux.Solitaire.Card} topCard The current top card for this stack
   * @param {Ext.ux.Solitaire.Card} cardToDrop The card the user wishes to drop onto this stack
   * @return {Boolean} True if this drop is allowed
   */
  dropAllowed: function(topCard, cardToDrop) {
    var nums = Ext.ux.Solitaire.Card.prototype.numbers;
    
    if (!topCard) {
      if (nums.indexOf(cardToDrop.number) == 0) {
        return true;
      } else {
        return false;
      };
    };
    
    var sameSuit   = topCard.suit == cardToDrop.suit;
    var nextNumber = nums.indexOf(cardToDrop.number) == (nums.indexOf(topCard.number) + 1);
    
    return sameSuit && nextNumber;
  },
  
  /**
   * Renders this Suit Stack
   * @param {Ext.Container} ct The container to render this component to
   */
  onRender: function(ct, position) {
    this.el = ct.createChild({
      tag: 'div',
      cls: 'x-solitaire-suit-stack'
    });
  }
});