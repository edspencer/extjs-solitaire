/**
 * @class Ext.ux.Solitaire.Stack
 * @param {Array} An ordered array of cards to initialise this stack with
 * Represents an ordered stack of cards
 */
Ext.ux.Solitaire.Stack = function(startingCards) {
  var items = startingCards || [];
  var config = {
    items: items
  };
  
  this.addCard = function(card) {
    this.add(card);
  };
  
  this.removeCard = function() {
    return cards.pop();
  };
  
  this.topCard = function() {
    return items[items.length - 1];
  };
  
  Ext.ux.Solitaire.Stack.superclass.constructor.call(this, config);
  
  this.on('render', this.initializeDropTarget, this);
};

Ext.extend(Ext.ux.Solitaire.Stack, Ext.Container, {
  /**
   * Returns true if the request drop is allowed
   * @param {Ext.ux.Solitaire.Card} topCard The current top card for this stack
   * @param {Ext.ux.Solitaire.Card} cardToDrop The card the user wishes to drop onto this stack
   * @return {Boolean} True if this drop is allowed
   */
  dropAllowed: function(topCard, cardToDrop) {
    var nums = Ext.ux.Solitaire.Card.prototype.numbers;
    
    var nextNumber = nums.indexOf(cardToDrop.number) == (nums.indexOf(topCard.number) - 1);
    var diffColour = topCard.getColour() != cardToDrop.getColour();
    
    return nextNumber && diffColour;
  },
  
  /**
   * Creates the markup to render this stack
   */
  onRender: function(ct, position) {
    this.el = Ext.get(ct).createChild({
      tag: 'div',
      cls: 'x-solitaire-stack'
    });
  },
  
  /**
   * Sets up a drag zone to allow the top card of each stack to be draggable
   */
  initializeDropTarget: function() {
    //local reference to use in dropTarget config
    var stack = this;
    
    this.dropTarget = new Ext.dd.DropTarget(this.getEl(), {
      notifyOver: function(source, e, data) {
        if (stack.dropAllowed(stack.topCard(), data.card)) {
          return Ext.dd.DropTarget.prototype.dropAllowed;
        } else {
          return Ext.dd.DropTarget.prototype.dropNotAllowed;
        };
      },
      
      notifyDrop: function(source, e, data) {
        if (stack.dropAllowed(stack.topCard(), data.card)) {
          console.log('legally dropped a card: ');
          console.log(data.card);
        };
      }
    });
  }
});