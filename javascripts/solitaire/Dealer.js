/**
 * Solitaire.Dealer
 * @extends Ext.Container
 * Represents a set of cards dealt from the Deck
 */

Solitaire.Dealer = Ext.extend(Ext.Container, {
  
  /**
   * Renders the Deal
   * @param {Ext.Container} ct The container to render this component to
   */
  onRender: function(ct) {
    this.el = ct.createChild({
      cls: 'x-solitaire-dealer-wrapper',
      children: [{
        cls:   'x-solitaire-dealer x-solitaire-card-hidden',
        style: 'background-image: url(images/cards.gif);'
      }]
    });
    
    this.dealHolder = this.el.child('.x-solitaire-deal');
    
    this.relayEvents(this.el, ['click']);
    
    Solitaire.Dealer.superclass.onRender.apply(this, arguments);
  },
  
  getLayoutTarget: function() {
    return this.dealHolder;
  }
});

Ext.reg('solitaire-deal', Solitaire.Dealer);