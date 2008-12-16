Ext.ns('SolitaireApp');

Ext.onReady(function() {
  var sol = new Ext.ux.Solitaire.Game();
  sol.launch();
});