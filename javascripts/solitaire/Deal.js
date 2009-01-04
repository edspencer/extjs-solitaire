/**
 * Solitaire.Deal
 * @extends Ext.Container
 * Represents a set of cards dealt from the Deck
 */
Solitaire.Deal = function(config) {
  var config = config || {};
 
  Ext.applyIf(config, {
    
  });
 
  Solitaire.Deal.superclass.constructor.call(this, config);
};
Ext.extend(Solitaire.Deal, Ext.Container, {
  
  /**
   * Renders the Deal
   * @param {Ext.Container} ct The container to render this component to
   */
  onRender: function(ct) {
    this.el = ct.createChild({
      tag: 'div',
      cls: 'x-solitaire-deal'
    });
  }
});

Ext.reg('solitaire-deal', Solitaire.Deal);