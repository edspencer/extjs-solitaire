/**
 * @class Solitaire.Card
 * Representation of a single card
 * @cfg {String} suit The suit of the card (one of Diamonds, Hearts, Clubs or Spades)
 * @cfg {String} number The number of name of the card
 * @cfg {Boolean} revealed True if this card has already been revealed to the user (defaults to false)
 */
Solitaire.Card = function(config) {
  var config = config || {};
  Ext.apply(this, {
    revealed: false,
    location: null
  }, config);

  Solitaire.Card.superclass.constructor.call(this, {});
  
  this.addEvents(
    /**
     * @event dblclick
     * Fires when the card is double clicked
     * @param {Solitaire.Card} this The card which was clicked
     */
    'dblclick'
  );
  
  this.on('render', this.initializeDragSource, this);
};

Ext.extend(Solitaire.Card, Ext.Component, {
  
  /**
   * @property cardHeight
   * @type Number
   * The height of each card in the CSS sprite (defaults to 100)
   */
  cardHeight: 100,
  
  /**
   * @property cardWidth
   * @type Number
   * The width of each card in the CSS sprite (defaults to 72)
   */
  cardWidth: 72,
  
  /**
   * @property suits
   * @type Array
   * The suits available to the game (defaults to Diamonds, Hearts, Clubs and Spades)
   */
  suits:   ['Hearts', 'Diamonds', 'Clubs', 'Spades'],
  
  /**
   * @property numbers
   * @type Array
   * The numbers of the cards (defaults to Ace through to King)
   */
  numbers: ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"],
  
  /**
   * @property imageUrl
   * @type String
   * The URL at which to find the CSS sprite of all cards (defaults to images/cards.gif).
   */
  imageUrl: 'images/cards.gif',
  
  /**
   * Moves this card to the specified container
   * @param {Ext.Container} newContainer The container to move the card to
   * @param {Number} position An optional position to insert the card at (defaults to the top)
   */
  moveTo: function(newContainer, position) {
    if (!this.pack) { return false; }
    
    return this.pack.moveCard(this, newContainer, position);
  },
  
  /**
   * Returns the colour of the card (red or black)
   * @return {String} The colour of the card
   */
  getColour: function() {
    if (this.suit == 'Hearts' || this.suit == 'Diamonds') {
      return 'red';
    };
    
    if (this.suit == 'Clubs' || this.suit == 'Spades') {
      return 'black';
    };
    
    throw new Error("Could not determine the colour of the " + this.suit + " suit.");
  },
  
  /**
   * Renders this card
   * @param {Ext.Container} ct The container to render this Card to
   */
  onRender: function(ct, position) {
    var cls = this.revealed ? 'x-solitaire-card-revealed' : 'x-solitaire-card-hidden';
    this.el = ct.createChild({
      tag:   'div',
      cls:   'x-solitaire-card ' + cls,
      style: this.imageStyle(this)
    });
  },
  
  /**
   * Returns the styling required for this card (offsets for the CSS sprite)
   * @return {String} The url of the image for this card
   */
  imageStyle: function() {
    if (this.revealed) {
      var suitOffset   = this.cardHeight * -this.suits.indexOf(this.suit);
      var numberOffset = this.cardWidth  * -this.numbers.indexOf(this.number);
          
      return String.format("background-image: url({0}); background-position: {1}px {2}px", this.imageUrl, numberOffset, suitOffset);
    } else {
      return String.format("background-image: url({0});", this.imageUrl);
    };
  },
  
  /**
   * Reveals this card (adds appropriate css classes)
   */
  reveal: function() {
    this.revealed = true;
    this.el.applyStyles(this.imageStyle());
  },
  
  getBestMatch: function(dds) {
    //FIXME: NO! Just no.  Not good
    try {
      var winner = null;
  
      var len = dds.length;
  
      if (len == 1) {
          winner = dds[0];
      } else {
        for (var i=0; i<len; ++i) {
          var dd = dds[i];
                      
          if (false && dd.cursorIsOver) {
            winner = dd;
            break;
          
          } else {
            if (!winner || winner.overlap.getArea() < dd.overlap.getArea()) {
              winner = dd;
            }
          }
        }
      }
  
      return winner;
    } catch(e) {};
  },
  
  /**
   * Sets this card up to be draggable
   */
  initializeDragSource: function() {
    this.el.on('dblclick', function() { this.fireEvent('dblclick', this); }, this);
    
    //FIXME: Seriously, we should be reusing these :( Not sure if this even does what I want it to
    if (this.dragSource) {
      this.dragSource.destroy();
      delete this.dragSource;
    }
    
    //only allow a card to be dragged if it has been revealed
    if (!this.revealed) { return false; }
        
    //keep a reference to the card to use in getDragData
    var card = this;
    
    this.dragSource = new Ext.dd.DragSource(this.getEl(), {
      getDragData: function() {
        return {
          card: card
        };
      },
      
      onDragOver: function(e, id) {
        this.cachedTarget = card.getBestMatch(id);
        
        Ext.dd.DragSource.prototype.onDragOver.apply(this, arguments);
      },
      
      /**
       * Finds the offset of the click event relative to the card and sets this as the offset delta
       * for the ghost element so that the click point of the card is kept with the mouse pointer
       */
      autoOffset: function(x, y) {
        var cardXY = card.getEl().getXY();
        
        var xDelta = x - cardXY[0] + 22;
        var yDelta = y - cardXY[1];
        
        this.setDelta(xDelta, yDelta);
      },
      
      /**
       * Creates the drag proxy
       */
      onInitDrag: function(x, y) {
        var stack = card.location;
        
        //if the card is on a stack and is not the top card on that stack,
        //create a proxy containing this card and all on top of it
        if (stack && stack.isXType('solitaire-stack') && card != stack.getTopCard()) {
          var cards = stack.getCardsAbove(card);
          var clone = Ext.DomHelper.append(Ext.getBody(), {id: Ext.id()}, false);
          
          for (var i=0; i < cards.length; i++) {
            clone.appendChild(cards[i].el.dom.cloneNode(true));
          };

          this.proxy.update(clone);
        } else {
          var clone = this.el.dom.cloneNode(true);
          clone.id = Ext.id(); 
          this.proxy.update(clone);
        }
        
        this.onStartDrag(x, y);
        return true;
      },
      
      onDragEnter: function(e, id) {
        var target = card.getBestMatch(id);
        
        if(this.beforeDragEnter(target, e, id) !== false){
          if(target.isNotifyTarget){
            var status = target.notifyEnter(this, e, this.dragData);
            this.proxy.setStatus(status);
          }else{
            this.proxy.setStatus(this.dropAllowed);
          }
          
          if(this.afterDragEnter){
            this.afterDragEnter(target, e, id);
          }
        }
      },
      
      /**
       * Abstract drag out
       * @param {Ext.EventObject} e The drag out event
       */
      onDragOut: function(e, id) {
        this.cachedTarget = card.getBestMatch(id);
        
        Ext.dd.DragSource.prototype.onDragOut.apply(this, arguments);
      },
      
      /**
       * Handles logic of identifying drop source and firing appropriate events
       * @param {Ext.EventObject} e The drop event
       * @param {Array} id The array of intersecting drop targets identified (using INTERSECT mode)
       */
      onDragDrop: function(e, id) {
        this.cachedTarget = card.getBestMatch(id);
        
        Ext.dd.DragSource.prototype.onDragDrop.apply(this, arguments);
      }
    });
  }
  
});

Ext.reg('solitaire-card', Solitaire.Card);