Ext.dd.DragDropMgr.mode = Ext.dd.DragDropMgr.INTERSECT;

Ext.onReady(function() {
  var sol = new Solitaire.Game();
  sol.launch();
});