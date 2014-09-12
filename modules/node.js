var _  = require("lodash"),
   htmlToText = require('html-to-text');


function extendListener( root, nodeName ){
  root.listen = root.listen || {}
  root.listen[nodeName+'.create.before'] = function(val){
    console.log("begin to briefing for", nodeName)
    if( val[root.config.field].length > root.config.limit + root.config.overflow ){
      //TODO 摘要规则进一步优化

      val[root.config.toField] =
        htmlToText.fromString(val[root.config.field]).slice(0,root.config.limit).replace(/[,.\uff0c\u3002_-]+$/g,"") + '...'

    }else{
      console.log( "too short no need to brief", val[root.config.field].length)
    }
    return val
  }
}

module.exports = {
  deps : ['bus','config'],
  nodes : {},
  config : {
    auto : true,
    field : 'content',
    toField : 'brief',
    limit : 300,
    overflow : 100,
    exclude : []
  },
  expand : function( module ){
    var root = this
    if( module.models ){
      module.models.forEach(  function( model){
        if( model.isNode ){
          root.nodes[model.identity] = model
        }
      })
    }
  },
  bootstrap : function(){
    var root = this

    _.forEach(root.nodes, function( node, nodeName ){
      if( root.config.auto === true && node.brief !== false){
        extendListener( root, nodeName )
      }else if( root.config.auto ===false && node.brief ===true){
        extendListener( root, nodeName )
      }
    })
    console.log("[NODE] after extend listener", root.listen)
    root.dep.bus.expand(root)
  }
}