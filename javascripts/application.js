Ext.ns('SolitaireApp');

Ext.onReady(function() {
  var sol = new Ext.ux.Solitaire.Game();
  sol.launch();
  
  //TODO: hmm doesn't work currently - just gives errors
  // Ext.dd.DragDropMgr.mode = Ext.dd.DragDropMgr.INTERSECT;
});