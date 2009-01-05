/**
 * @class Solitaire.Stack
 * @param {Array} An ordered array of cards to initialise this stack with
 * Represents an ordered stack of cards
 */
Solitaire.Stack = function(config) {
  var config = config || {};
  
  this.addCard = function(card) {
    this.add(card);
  };
  
  this.removeCard = function() {
    return cards.pop();
  };
    
  Solitaire.Stack.superclass.constructor.call(this, config);
    
  this.addEvents(
    /**
     * @event carddropped
     * Fires when a card is dropped on this stack
     * @param {Solitaire.Stack} this The stack the card was dropped on
     * @param {Solitaire.Card} card The card that was dropped
     */
    'carddropped'
  );
  
  this.on('render',      this.initializeDropTarget, this);
  this.on('afterlayout', this.applyClasses,         this);
};

Ext.extend(Solitaire.Stack, Ext.Container, {
  /**
   * Returns true if the request drop is allowed
   * @param {Solitaire.Card} cardToDrop The card the user wishes to drop onto this stack
   * @return {Boolean} True if this drop is allowed
   */
  dropAllowed: function(cardToDrop) {
    var nums = Solitaire.Card.prototype.numbers;
    
    var topCard = this.getTopCard();
    
    if (topCard) {
      var nextNumber = nums.indexOf(cardToDrop.number) == (nums.indexOf(topCard.number) - 1);
      var diffColour = topCard.getColour() != cardToDrop.getColour();
    
      return nextNumber && diffColour;
    } else {
      //can drop the highest card (King) on an empty stack
      return cardToDrop.number == nums[nums.length - 1];
    };
  },
  
  /**
   * Returns the top card on this stack, or null if the stack is empty (does not remove the card from the stack)
   * @return {Solitaire.Card/null} The top card
   */
  getTopCard: function() {
    if (!this.items || this.items.length == 0) {
      return null;
    };
    return this.items.items[this.items.items.length - 1];
  },
  
  /**
   * Returns an array of cards above (higher in the stack) this one.  Also contains the passed card
   * @param {Solitaire.Card} card The bottom card to return
   * @return {Array} An array of all cards above the requested card.  Also contains the card itself
   */
  getCardsAbove: function(card) {
    var above = [];
    var items = this.items.items;
    var found = false;
    
    for (var i=0; i < items.length; i++) {
      var c = items[i];
      if (c == card) { found = true; }
      
      if (found) { above.push(c); }
    };
    
    return above;
  },
  
  /**
   * Iterates over the cards in this stack, adding CSS classes accordingly.
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
   * Creates the markup to render this stack
   */
  onRender: function(ct, position) {
    this.el = ct.createChild({
      cls: 'x-solitaire-stack-wrapper',
      children: [
        {
          cls:   'x-solitaire-stack',
          style: 'background: url(images/cards.gif) no-repeat bottom right;'
        }
      ]
    });
    
    this.stackHolder = this.el.child('.x-solitaire-stack');
    
    Solitaire.Stack.superclass.onRender.apply(this, arguments);
  },

  getLayoutTarget: function(){
    return this.stackHolder;
  },
  
  /**
   * Sets up a drag zone to allow the top card of each stack to be draggable
   */
  initializeDropTarget: function() {
    //local reference to use in dropTarget config
    var stack = this;
    
    this.dropTarget = new Ext.dd.DropTarget(this.getEl(), {
      notifyOver: function(source, e, data) {
        if (stack.dropAllowed(data.card)) {
          return Ext.dd.DropTarget.prototype.dropAllowed;
        } else {
          return Ext.dd.DropTarget.prototype.dropNotAllowed;
        };
      },
      
      notifyDrop: function(source, e, data) {
        if (stack.dropAllowed(data.card)) {
          return stack.fireEvent('carddropped', stack, data.card);
        } else {
          return false;
        }
      }
    });
  }
});

Ext.reg('solitaire-stack', Solitaire.Stack);