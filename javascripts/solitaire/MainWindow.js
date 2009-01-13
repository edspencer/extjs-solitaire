/**
 * Solitaire.MainWindow
 * @extends Ext.Window
 * Renders a Solitaire game
 */
Solitaire.MainWindow = function(config) {
  var config = config || {};
  
  this.topPanel = new Ext.Panel({
    layout: 'column',
    region: 'north',
    height: 130,
    
    defaults: {
      border: false,
      layout: 'column'
    },
    items: [
      {
        columnWidth: (3 / 7),
        items:       [config.dealer, config.deck, {html: ''}],
        defaults:    {columnWidth: (1 / 3), border: false}
      },
      {
        columnWidth: (4 / 7),
        items:       config.suitStacks,
        defaults:    {columnWidth: (1 / 4)}
      }
    ]
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
  
  this.score      = new Ext.Toolbar.TextItem('0');
  this.time       = new Ext.Toolbar.TextItem('0');
  this.leftInDeck = new Ext.Toolbar.TextItem('24');
  
  this.bbar = new Ext.StatusBar({
    statusAlign: 'right',
    items:       ['Left in deck: ', this.leftInDeck, '->', 'Score:', this.score, '-', 'Time:', this.time]
  });
 
  Ext.applyIf(config, {
    title:     'Solitaire',
    height:    680,
    width:     900,
    layout:    'border',
    cls:       'x-solitaire-window',
    constrain: true,
    closable:  false,
    
    tbar: [
      {
        text:    'New Game',
        scope:   this,
        handler: function() {
          this.fireEvent('newgame', this);
        }
      },
      '-',
      {
        text: 'Options',
        menu: [
          {
            text: 'Card background',
            menu: {
              defaults: {
                checked: false,
                group:   'background',
                scope:   this,
                checkHandler: function(item, checked) {
                  if (checked) {
                    this.fireEvent('changeCardBackground', item.text);
                  };
                }
              },
              items: [
                {text: 'Crown'}, {text: 'Cross', checked: true}, {text: 'Circle'}, {text: 'Woman'}, {text: 'Roses'}, {text: 'Checkered'}, {text: 'Squares'}
              ]
            }
          }
        ]
      },
      '-',
      {
        text: 'About',
        menu: {
          items: [
            {
              text:    'View Source',
              handler: function() {
                window.open('http://github.com/edspencer/extjs-solitaire/tree/master');
              }
            },
            {
              text:    'Download Source',
              handler: function() {
                window.open('http://github.com/edspencer/extjs-solitaire/zipball/master');
              }
            },
            {
              text:    'View blog post',
              handler: function() {
                window.open('http://edspencer.net/2009/01/extjs-solitaire.html');
              }
            },
            {
              text:    'Scoring',
              scope:   this,
              handler: this.showScoringHelp
            }
          ]
        }
      }
    ],
    
    bbar: this.bbar,
    
    defaults: {
      border: false
    },
    
    items: [
      this.topPanel,
      this.decksPanel
    ]
  });
 
  Solitaire.MainWindow.superclass.constructor.call(this, config);
  
  this.addEvents(
    /**
     * @event newgame
     * Fires whenever the new game button is clicked
     * @param {Solitaire.MainWindow} this The window firing the event
     */
    'newgame',
    
    /**
     * @event changeCardBackground
     * Fires when the user selects a different card background
     * @param {String} backgroundName The string name of the background to use
     */
    'changeCardBackground'
  );
    
  this.on('render', function() { this.el.alignTo(Ext.getBody(), 'c'); }, this);
  this.on('changeCardBackground', this.setCardBackground, this);
  
  //update the game time and score
  Ext.TaskMgr.start({
    run: function() {
      Ext.fly(this.leftInDeck.getEl()).update(this.game.deck.items.length);
      
      if (!this.game.inWinState()) {
        Ext.fly(this.score.getEl()).update(this.game.getScore());
        Ext.fly(this.time.getEl()).update(this.game.timeTaken());
      };
    },
    interval: 250,
    scope:    this
  });
};

Ext.extend(Solitaire.MainWindow, Ext.Window, {
  
  /**
   * @property scoreHelpWindow
   * @type Ext.Window
   * Scoring help window
   */
  scoreHelpWindow: null,
  
  /**
   * Opens a window describing how scoring works
   */
  showScoringHelp: function() {
    if (!this.scoreHelpWindow) {
      this.scoreHelpWindow = new Ext.Window({
        constrain: true,
        title:     'Scoring',
        cls:       'solitaire-info',
        width:     400,
        height:    200,
        layout:    'fit',
        items: [
          {
            html: '<h1>Scoring</h1><p>You get 10 points for every card you stack on the top card stacks.</p><p>You lose a point for every 10 seconds that pass without winning.</p>'
          }
        ],
        closeAction: 'hide'
      });
    };
    
    this.scoreHelpWindow.show();
  },
  
  /**
   * Changes the background of all cards to the specified background
   * @param {String} backgroundName The name of the background to change to
   */
  setCardBackground: function(backgroundName) {
    var offset = 0; //crown - default
    var width  = Solitaire.Card.prototype.cardWidth;
    switch(backgroundName) {
      case 'Cross'     : offset = 1; break;
      case 'Circle'    : offset = 2; break;
      case 'Woman'     : offset = 3; break;
      case 'Roses'     : offset = 4; break;
      case 'Checkered' : offset = 5; break;
      case 'Squares'   : offset = 6; break;
    };
    
    Ext.util.CSS.updateRule('.x-solitaire-card-hidden', 'background-position', '-' + width * offset + 'px 100px');
  }
});