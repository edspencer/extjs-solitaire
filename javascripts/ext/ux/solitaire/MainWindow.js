/**
 * Ext.ux.Solitaire.MainWindow
 * @extends Ext.Window
 * Renders a Solitaire game
 */
Ext.ux.Solitaire.MainWindow = function(config) {
  var config = config || {};
  
  //add items for the top panel (deck, dealt cards, a gap and then the suit stacks)
  var tpItems = [
    config.deck,
    {
      html: '<p>empty</p>'
    },
    {
      html: '<p>empty</p>'
    }
  ];
  
  for (var i=0; i < config.suitStacks.length; i++) {
    tpItems.push(config.suitStacks[i]);
  };
    
  this.topPanel = new Ext.Panel({
    layout: 'column',
    region: 'north',
    height: 120,
    defaults: {
      columnWidth: (1 / tpItems.length)
    },
    items: tpItems
  });
  
  this.decksPanel = new Ext.Panel({
    layout:     'column',
    region:     'center',
    items:      config.stacks,
    autoScroll: true,

    defaults: {
      columnWidth: (1 / config.stacks.length)
    }
  });
 
  Ext.applyIf(config, {
    title:     'Solitaire',
    height:    600,
    width:     900,
    layout:    'border',
    constrain: true,
    
    tbar: [
      {
        text:    'New Game',
        scope:   this,
        handler: function() {
          this.fireEvent('newgame', this);
        }
      }
    ],
    
    defaults: {
      border: false
    },
    
    items: [
      this.topPanel,
      this.decksPanel
    ]
  });
 
  Ext.ux.Solitaire.MainWindow.superclass.constructor.call(this, config);
  
  this.addEvents(
    /**
     * @event newgame
     * Fires whenever the new game button is clicked
     * @param {Ext.ux.Solitaire.MainWindow} this The window firing the event
     */
    'newgame'
  );
    
  this.on('render', function() {
    this.el.alignTo(Ext.getBody(), 'c');
  }, this);
};

Ext.extend(Ext.ux.Solitaire.MainWindow, Ext.Window);