/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

/*
	This is an optimized version of Dojo, built for deployment and not for
	development. To get sources and documentation, please visit:

		http://dojotoolkit.org
*/

if(!dojo._hasResource["dojo.date.stamp"]){
dojo._hasResource["dojo.date.stamp"]=true;
dojo.provide("dojo.date.stamp");
dojo.getObject("date.stamp",true,dojo);
dojo.date.stamp.fromISOString=function(_1,_2){
if(!dojo.date.stamp._isoRegExp){
dojo.date.stamp._isoRegExp=/^(?:(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(.\d+)?)?((?:[+-](\d{2}):(\d{2}))|Z)?)?$/;
}
var _3=dojo.date.stamp._isoRegExp.exec(_1),_4=null;
if(_3){
_3.shift();
if(_3[1]){
_3[1]--;
}
if(_3[6]){
_3[6]*=1000;
}
if(_2){
_2=new Date(_2);
dojo.forEach(dojo.map(["FullYear","Month","Date","Hours","Minutes","Seconds","Milliseconds"],function(_5){
return _2["get"+_5]();
}),function(_6,_7){
_3[_7]=_3[_7]||_6;
});
}
_4=new Date(_3[0]||1970,_3[1]||0,_3[2]||1,_3[3]||0,_3[4]||0,_3[5]||0,_3[6]||0);
if(_3[0]<100){
_4.setFullYear(_3[0]||1970);
}
var _8=0,_9=_3[7]&&_3[7].charAt(0);
if(_9!="Z"){
_8=((_3[8]||0)*60)+(Number(_3[9])||0);
if(_9!="-"){
_8*=-1;
}
}
if(_9){
_8-=_4.getTimezoneOffset();
}
if(_8){
_4.setTime(_4.getTime()+_8*60000);
}
}
return _4;
};
dojo.date.stamp.toISOString=function(_a,_b){
var _c=function(n){
return (n<10)?"0"+n:n;
};
_b=_b||{};
var _d=[],_e=_b.zulu?"getUTC":"get",_f="";
if(_b.selector!="time"){
var _10=_a[_e+"FullYear"]();
_f=["0000".substr((_10+"").length)+_10,_c(_a[_e+"Month"]()+1),_c(_a[_e+"Date"]())].join("-");
}
_d.push(_f);
if(_b.selector!="date"){
var _11=[_c(_a[_e+"Hours"]()),_c(_a[_e+"Minutes"]()),_c(_a[_e+"Seconds"]())].join(":");
var _12=_a[_e+"Milliseconds"]();
if(_b.milliseconds){
_11+="."+(_12<100?"0":"")+_c(_12);
}
if(_b.zulu){
_11+="Z";
}else{
if(_b.selector!="time"){
var _13=_a.getTimezoneOffset();
var _14=Math.abs(_13);
_11+=(_13>0?"-":"+")+_c(Math.floor(_14/60))+":"+_c(_14%60);
}
}
_d.push(_11);
}
return _d.join("T");
};
}
if(!dojo._hasResource["dojo.parser"]){
dojo._hasResource["dojo.parser"]=true;
dojo.provide("dojo.parser");
new Date("X");
dojo.parser=new function(){
var d=dojo;
function _15(_16){
if(d.isString(_16)){
return "string";
}
if(typeof _16=="number"){
return "number";
}
if(typeof _16=="boolean"){
return "boolean";
}
if(d.isFunction(_16)){
return "function";
}
if(d.isArray(_16)){
return "array";
}
if(_16 instanceof Date){
return "date";
}
if(_16 instanceof d._Url){
return "url";
}
return "object";
};
function _17(_18,_19){
switch(_19){
case "string":
return _18;
case "number":
return _18.length?Number(_18):NaN;
case "boolean":
return typeof _18=="boolean"?_18:!(_18.toLowerCase()=="false");
case "function":
if(d.isFunction(_18)){
_18=_18.toString();
_18=d.trim(_18.substring(_18.indexOf("{")+1,_18.length-1));
}
try{
if(_18===""||_18.search(/[^\w\.]+/i)!=-1){
return new Function(_18);
}else{
return d.getObject(_18,false)||new Function(_18);
}
}
catch(e){
return new Function();
}
case "array":
return _18?_18.split(/\s*,\s*/):[];
case "date":
switch(_18){
case "":
return new Date("");
case "now":
return new Date();
default:
return d.date.stamp.fromISOString(_18);
}
case "url":
return d.baseUrl+_18;
default:
return d.fromJson(_18);
}
};
var _1a={},_1b={};
d.connect(d,"extend",function(){
_1b={};
});
function _1c(cls,_1d){
for(var _1e in cls){
if(_1e.charAt(0)=="_"){
continue;
}
if(_1e in _1a){
continue;
}
_1d[_1e]=_15(cls[_1e]);
}
return _1d;
};
function _1f(_20,_21){
var c=_1b[_20];
if(!c){
var cls=d.getObject(_20),_22=null;
if(!cls){
return null;
}
if(!_21){
_22=_1c(cls.prototype,{});
}
c={cls:cls,params:_22};
}else{
if(!_21&&!c.params){
c.params=_1c(c.cls.prototype,{});
}
}
return c;
};
this._functionFromScript=function(_23,_24){
var _25="";
var _26="";
var _27=(_23.getAttribute(_24+"args")||_23.getAttribute("args"));
if(_27){
d.forEach(_27.split(/\s*,\s*/),function(_28,idx){
_25+="var "+_28+" = arguments["+idx+"]; ";
});
}
var _29=_23.getAttribute("with");
if(_29&&_29.length){
d.forEach(_29.split(/\s*,\s*/),function(_2a){
_25+="with("+_2a+"){";
_26+="}";
});
}
return new Function(_25+_23.innerHTML+_26);
};
this.instantiate=function(_2b,_2c,_2d){
var _2e=[],_2c=_2c||{};
_2d=_2d||{};
var _2f=(_2d.scope||d._scopeName)+"Type",_30="data-"+(_2d.scope||d._scopeName)+"-";
d.forEach(_2b,function(obj){
if(!obj){
return;
}
var _31,_32,_33,_34,_35,_36;
if(obj.node){
_31=obj.node;
_32=obj.type;
_36=obj.fastpath;
_33=obj.clsInfo||(_32&&_1f(_32,_36));
_34=_33&&_33.cls;
_35=obj.scripts;
}else{
_31=obj;
_32=_2f in _2c?_2c[_2f]:_31.getAttribute(_2f);
_33=_32&&_1f(_32);
_34=_33&&_33.cls;
_35=(_34&&(_34._noScript||_34.prototype._noScript)?[]:d.query("> script[type^='dojo/']",_31));
}
if(!_33){
throw new Error("Could not load class '"+_32);
}
var _37={};
if(_2d.defaults){
d._mixin(_37,_2d.defaults);
}
if(obj.inherited){
d._mixin(_37,obj.inherited);
}
if(_36){
var _38=_31.getAttribute(_30+"props");
if(_38&&_38.length){
try{
_38=d.fromJson.call(_2d.propsThis,"{"+_38+"}");
d._mixin(_37,_38);
}
catch(e){
throw new Error(e.toString()+" in data-dojo-props='"+_38+"'");
}
}
var _39=_31.getAttribute(_30+"attach-point");
if(_39){
_37.dojoAttachPoint=_39;
}
var _3a=_31.getAttribute(_30+"attach-event");
if(_3a){
_37.dojoAttachEvent=_3a;
}
dojo.mixin(_37,_2c);
}else{
var _3b=_31.attributes;
for(var _3c in _33.params){
var _3d=_3c in _2c?{value:_2c[_3c],specified:true}:_3b.getNamedItem(_3c);
if(!_3d||(!_3d.specified&&(!dojo.isIE||_3c.toLowerCase()!="value"))){
continue;
}
var _3e=_3d.value;
switch(_3c){
case "class":
_3e="className" in _2c?_2c.className:_31.className;
break;
case "style":
_3e="style" in _2c?_2c.style:(_31.style&&_31.style.cssText);
}
var _3f=_33.params[_3c];
if(typeof _3e=="string"){
_37[_3c]=_17(_3e,_3f);
}else{
_37[_3c]=_3e;
}
}
}
var _40=[],_41=[];
d.forEach(_35,function(_42){
_31.removeChild(_42);
var _43=(_42.getAttribute(_30+"event")||_42.getAttribute("event")),_32=_42.getAttribute("type"),nf=d.parser._functionFromScript(_42,_30);
if(_43){
if(_32=="dojo/connect"){
_40.push({event:_43,func:nf});
}else{
_37[_43]=nf;
}
}else{
_41.push(nf);
}
});
var _44=_34.markupFactory||_34.prototype&&_34.prototype.markupFactory;
var _45=_44?_44(_37,_31,_34):new _34(_37,_31);
_2e.push(_45);
var _46=(_31.getAttribute(_30+"id")||_31.getAttribute("jsId"));
if(_46){
d.setObject(_46,_45);
}
d.forEach(_40,function(_47){
d.connect(_45,_47.event,null,_47.func);
});
d.forEach(_41,function(_48){
_48.call(_45);
});
});
if(!_2c._started){
d.forEach(_2e,function(_49){
if(!_2d.noStart&&_49&&dojo.isFunction(_49.startup)&&!_49._started&&(!_49.getParent||!_49.getParent())){
_49.startup();
}
});
}
return _2e;
};
this.parse=function(_4a,_4b){
var _4c;
if(!_4b&&_4a&&_4a.rootNode){
_4b=_4a;
_4c=_4b.rootNode;
}else{
_4c=_4a;
}
_4b=_4b||{};
var _4d=(_4b.scope||d._scopeName)+"Type",_4e="data-"+(_4b.scope||d._scopeName)+"-";
function _4f(_50,_51){
var _52=dojo.clone(_50.inherited);
dojo.forEach(["dir","lang"],function(_53){
var val=_50.node.getAttribute(_53);
if(val){
_52[_53]=val;
}
});
var _54=_50.clsInfo&&!_50.clsInfo.cls.prototype._noScript?_50.scripts:null;
var _55=(!_50.clsInfo||!_50.clsInfo.cls.prototype.stopParser)||(_4b&&_4b.template);
for(var _56=_50.node.firstChild;_56;_56=_56.nextSibling){
if(_56.nodeType==1){
var _57,_58=_55&&_56.getAttribute(_4e+"type");
if(_58){
_57=_58;
}else{
_57=_55&&_56.getAttribute(_4d);
}
var _59=_58==_57;
if(_57){
var _5a={"type":_57,fastpath:_59,clsInfo:_1f(_57,_59),node:_56,scripts:[],inherited:_52};
_51.push(_5a);
_4f(_5a,_51);
}else{
if(_54&&_56.nodeName.toLowerCase()=="script"){
_57=_56.getAttribute("type");
if(_57&&/^dojo\/\w/i.test(_57)){
_54.push(_56);
}
}else{
if(_55){
_4f({node:_56,inherited:_52},_51);
}
}
}
}
}
};
var _5b=[];
_4f({node:_4c?dojo.byId(_4c):dojo.body(),inherited:(_4b&&_4b.inherited)||{dir:dojo._isBodyLtr()?"ltr":"rtl"}},_5b);
var _5c=_4b&&_4b.template?{template:true}:null;
return this.instantiate(_5b,_5c,_4b);
};
}();
(function(){
var _5d=function(){
if(dojo.config.parseOnLoad){
dojo.parser.parse();
}
};
if(dojo.getObject("dijit.wai.onload")===dojo._loaders[0]){
dojo._loaders.splice(1,0,_5d);
}else{
dojo._loaders.unshift(_5d);
}
})();
}
if(!dojo._hasResource["dojo.data.util.filter"]){
dojo._hasResource["dojo.data.util.filter"]=true;
dojo.provide("dojo.data.util.filter");
dojo.getObject("data.util.filter",true,dojo);
dojo.data.util.filter.patternToRegExp=function(_5e,_5f){
var rxp="^";
var c=null;
for(var i=0;i<_5e.length;i++){
c=_5e.charAt(i);
switch(c){
case "\\":
rxp+=c;
i++;
rxp+=_5e.charAt(i);
break;
case "*":
rxp+=".*";
break;
case "?":
rxp+=".";
break;
case "$":
case "^":
case "/":
case "+":
case ".":
case "|":
case "(":
case ")":
case "{":
case "}":
case "[":
case "]":
rxp+="\\";
default:
rxp+=c;
}
}
rxp+="$";
if(_5f){
return new RegExp(rxp,"mi");
}else{
return new RegExp(rxp,"m");
}
};
}
if(!dojo._hasResource["dojo.data.util.sorter"]){
dojo._hasResource["dojo.data.util.sorter"]=true;
dojo.provide("dojo.data.util.sorter");
dojo.getObject("data.util.sorter",true,dojo);
dojo.data.util.sorter.basicComparator=function(a,b){
var r=-1;
if(a===null){
a=undefined;
}
if(b===null){
b=undefined;
}
if(a==b){
r=0;
}else{
if(a>b||a==null){
r=1;
}
}
return r;
};
dojo.data.util.sorter.createSortFunction=function(_60,_61){
var _62=[];
function _63(_64,dir,_65,s){
return function(_66,_67){
var a=s.getValue(_66,_64);
var b=s.getValue(_67,_64);
return dir*_65(a,b);
};
};
var _68;
var map=_61.comparatorMap;
var bc=dojo.data.util.sorter.basicComparator;
for(var i=0;i<_60.length;i++){
_68=_60[i];
var _69=_68.attribute;
if(_69){
var dir=(_68.descending)?-1:1;
var _6a=bc;
if(map){
if(typeof _69!=="string"&&("toString" in _69)){
_69=_69.toString();
}
_6a=map[_69]||bc;
}
_62.push(_63(_69,dir,_6a,_61));
}
}
return function(_6b,_6c){
var i=0;
while(i<_62.length){
var ret=_62[i++](_6b,_6c);
if(ret!==0){
return ret;
}
}
return 0;
};
};
}
if(!dojo._hasResource["dojo.data.util.simpleFetch"]){
dojo._hasResource["dojo.data.util.simpleFetch"]=true;
dojo.provide("dojo.data.util.simpleFetch");
dojo.getObject("data.util.simpleFetch",true,dojo);
dojo.data.util.simpleFetch.fetch=function(_6d){
_6d=_6d||{};
if(!_6d.store){
_6d.store=this;
}
var _6e=this;
var _6f=function(_70,_71){
if(_71.onError){
var _72=_71.scope||dojo.global;
_71.onError.call(_72,_70,_71);
}
};
var _73=function(_74,_75){
var _76=_75.abort||null;
var _77=false;
var _78=_75.start?_75.start:0;
var _79=(_75.count&&(_75.count!==Infinity))?(_78+_75.count):_74.length;
_75.abort=function(){
_77=true;
if(_76){
_76.call(_75);
}
};
var _7a=_75.scope||dojo.global;
if(!_75.store){
_75.store=_6e;
}
if(_75.onBegin){
_75.onBegin.call(_7a,_74.length,_75);
}
if(_75.sort){
_74.sort(dojo.data.util.sorter.createSortFunction(_75.sort,_6e));
}
if(_75.onItem){
for(var i=_78;(i<_74.length)&&(i<_79);++i){
var _7b=_74[i];
if(!_77){
_75.onItem.call(_7a,_7b,_75);
}
}
}
if(_75.onComplete&&!_77){
var _7c=null;
if(!_75.onItem){
_7c=_74.slice(_78,_79);
}
_75.onComplete.call(_7a,_7c,_75);
}
};
this._fetchItems(_6d,_73,_6f);
return _6d;
};
}
if(!dojo._hasResource["dojo.data.ItemFileReadStore"]){
dojo._hasResource["dojo.data.ItemFileReadStore"]=true;
dojo.provide("dojo.data.ItemFileReadStore");
dojo.declare("dojo.data.ItemFileReadStore",null,{constructor:function(_7d){
this._arrayOfAllItems=[];
this._arrayOfTopLevelItems=[];
this._loadFinished=false;
this._jsonFileUrl=_7d.url;
this._ccUrl=_7d.url;
this.url=_7d.url;
this._jsonData=_7d.data;
this.data=null;
this._datatypeMap=_7d.typeMap||{};
if(!this._datatypeMap["Date"]){
this._datatypeMap["Date"]={type:Date,deserialize:function(_7e){
return dojo.date.stamp.fromISOString(_7e);
}};
}
this._features={"dojo.data.api.Read":true,"dojo.data.api.Identity":true};
this._itemsByIdentity=null;
this._storeRefPropName="_S";
this._itemNumPropName="_0";
this._rootItemPropName="_RI";
this._reverseRefMap="_RRM";
this._loadInProgress=false;
this._queuedFetches=[];
if(_7d.urlPreventCache!==undefined){
this.urlPreventCache=_7d.urlPreventCache?true:false;
}
if(_7d.hierarchical!==undefined){
this.hierarchical=_7d.hierarchical?true:false;
}
if(_7d.clearOnClose){
this.clearOnClose=true;
}
if("failOk" in _7d){
this.failOk=_7d.failOk?true:false;
}
},url:"",_ccUrl:"",data:null,typeMap:null,clearOnClose:false,urlPreventCache:false,failOk:false,hierarchical:true,_assertIsItem:function(_7f){
if(!this.isItem(_7f)){
throw new Error("dojo.data.ItemFileReadStore: Invalid item argument.");
}
},_assertIsAttribute:function(_80){
if(typeof _80!=="string"){
throw new Error("dojo.data.ItemFileReadStore: Invalid attribute argument.");
}
},getValue:function(_81,_82,_83){
var _84=this.getValues(_81,_82);
return (_84.length>0)?_84[0]:_83;
},getValues:function(_85,_86){
this._assertIsItem(_85);
this._assertIsAttribute(_86);
return (_85[_86]||[]).slice(0);
},getAttributes:function(_87){
this._assertIsItem(_87);
var _88=[];
for(var key in _87){
if((key!==this._storeRefPropName)&&(key!==this._itemNumPropName)&&(key!==this._rootItemPropName)&&(key!==this._reverseRefMap)){
_88.push(key);
}
}
return _88;
},hasAttribute:function(_89,_8a){
this._assertIsItem(_89);
this._assertIsAttribute(_8a);
return (_8a in _89);
},containsValue:function(_8b,_8c,_8d){
var _8e=undefined;
if(typeof _8d==="string"){
_8e=dojo.data.util.filter.patternToRegExp(_8d,false);
}
return this._containsValue(_8b,_8c,_8d,_8e);
},_containsValue:function(_8f,_90,_91,_92){
return dojo.some(this.getValues(_8f,_90),function(_93){
if(_93!==null&&!dojo.isObject(_93)&&_92){
if(_93.toString().match(_92)){
return true;
}
}else{
if(_91===_93){
return true;
}
}
});
},isItem:function(_94){
if(_94&&_94[this._storeRefPropName]===this){
if(this._arrayOfAllItems[_94[this._itemNumPropName]]===_94){
return true;
}
}
return false;
},isItemLoaded:function(_95){
return this.isItem(_95);
},loadItem:function(_96){
this._assertIsItem(_96.item);
},getFeatures:function(){
return this._features;
},getLabel:function(_97){
if(this._labelAttr&&this.isItem(_97)){
return this.getValue(_97,this._labelAttr);
}
return undefined;
},getLabelAttributes:function(_98){
if(this._labelAttr){
return [this._labelAttr];
}
return null;
},_fetchItems:function(_99,_9a,_9b){
var _9c=this,_9d=function(_9e,_9f){
var _a0=[],i,key;
if(_9e.query){
var _a1,_a2=_9e.queryOptions?_9e.queryOptions.ignoreCase:false;
var _a3={};
for(key in _9e.query){
_a1=_9e.query[key];
if(typeof _a1==="string"){
_a3[key]=dojo.data.util.filter.patternToRegExp(_a1,_a2);
}else{
if(_a1 instanceof RegExp){
_a3[key]=_a1;
}
}
}
for(i=0;i<_9f.length;++i){
var _a4=true;
var _a5=_9f[i];
if(_a5===null){
_a4=false;
}else{
for(key in _9e.query){
_a1=_9e.query[key];
if(!_9c._containsValue(_a5,key,_a1,_a3[key])){
_a4=false;
}
}
}
if(_a4){
_a0.push(_a5);
}
}
_9a(_a0,_9e);
}else{
for(i=0;i<_9f.length;++i){
var _a6=_9f[i];
if(_a6!==null){
_a0.push(_a6);
}
}
_9a(_a0,_9e);
}
};
if(this._loadFinished){
_9d(_99,this._getItemsArray(_99.queryOptions));
}else{
if(this._jsonFileUrl!==this._ccUrl){
dojo.deprecated("dojo.data.ItemFileReadStore: ","To change the url, set the url property of the store,"+" not _jsonFileUrl.  _jsonFileUrl support will be removed in 2.0");
this._ccUrl=this._jsonFileUrl;
this.url=this._jsonFileUrl;
}else{
if(this.url!==this._ccUrl){
this._jsonFileUrl=this.url;
this._ccUrl=this.url;
}
}
if(this.data!=null){
this._jsonData=this.data;
this.data=null;
}
if(this._jsonFileUrl){
if(this._loadInProgress){
this._queuedFetches.push({args:_99,filter:_9d});
}else{
this._loadInProgress=true;
var _a7={url:_9c._jsonFileUrl,handleAs:"json-comment-optional",preventCache:this.urlPreventCache,failOk:this.failOk};
var _a8=dojo.xhrGet(_a7);
_a8.addCallback(function(_a9){
try{
_9c._getItemsFromLoadedData(_a9);
_9c._loadFinished=true;
_9c._loadInProgress=false;
_9d(_99,_9c._getItemsArray(_99.queryOptions));
_9c._handleQueuedFetches();
}
catch(e){
_9c._loadFinished=true;
_9c._loadInProgress=false;
_9b(e,_99);
}
});
_a8.addErrback(function(_aa){
_9c._loadInProgress=false;
_9b(_aa,_99);
});
var _ab=null;
if(_99.abort){
_ab=_99.abort;
}
_99.abort=function(){
var df=_a8;
if(df&&df.fired===-1){
df.cancel();
df=null;
}
if(_ab){
_ab.call(_99);
}
};
}
}else{
if(this._jsonData){
try{
this._loadFinished=true;
this._getItemsFromLoadedData(this._jsonData);
this._jsonData=null;
_9d(_99,this._getItemsArray(_99.queryOptions));
}
catch(e){
_9b(e,_99);
}
}else{
_9b(new Error("dojo.data.ItemFileReadStore: No JSON source data was provided as either URL or a nested Javascript object."),_99);
}
}
}
},_handleQueuedFetches:function(){
if(this._queuedFetches.length>0){
for(var i=0;i<this._queuedFetches.length;i++){
var _ac=this._queuedFetches[i],_ad=_ac.args,_ae=_ac.filter;
if(_ae){
_ae(_ad,this._getItemsArray(_ad.queryOptions));
}else{
this.fetchItemByIdentity(_ad);
}
}
this._queuedFetches=[];
}
},_getItemsArray:function(_af){
if(_af&&_af.deep){
return this._arrayOfAllItems;
}
return this._arrayOfTopLevelItems;
},close:function(_b0){
if(this.clearOnClose&&this._loadFinished&&!this._loadInProgress){
if(((this._jsonFileUrl==""||this._jsonFileUrl==null)&&(this.url==""||this.url==null))&&this.data==null){
console.debug("dojo.data.ItemFileReadStore: WARNING!  Data reload "+" information has not been provided."+"  Please set 'url' or 'data' to the appropriate value before"+" the next fetch");
}
this._arrayOfAllItems=[];
this._arrayOfTopLevelItems=[];
this._loadFinished=false;
this._itemsByIdentity=null;
this._loadInProgress=false;
this._queuedFetches=[];
}
},_getItemsFromLoadedData:function(_b1){
var _b2=false,_b3=this;
function _b4(_b5){
var _b6=((_b5!==null)&&(typeof _b5==="object")&&(!dojo.isArray(_b5)||_b2)&&(!dojo.isFunction(_b5))&&(_b5.constructor==Object||dojo.isArray(_b5))&&(typeof _b5._reference==="undefined")&&(typeof _b5._type==="undefined")&&(typeof _b5._value==="undefined")&&_b3.hierarchical);
return _b6;
};
function _b7(_b8){
_b3._arrayOfAllItems.push(_b8);
for(var _b9 in _b8){
var _ba=_b8[_b9];
if(_ba){
if(dojo.isArray(_ba)){
var _bb=_ba;
for(var k=0;k<_bb.length;++k){
var _bc=_bb[k];
if(_b4(_bc)){
_b7(_bc);
}
}
}else{
if(_b4(_ba)){
_b7(_ba);
}
}
}
}
};
this._labelAttr=_b1.label;
var i,_bd;
this._arrayOfAllItems=[];
this._arrayOfTopLevelItems=_b1.items;
for(i=0;i<this._arrayOfTopLevelItems.length;++i){
_bd=this._arrayOfTopLevelItems[i];
if(dojo.isArray(_bd)){
_b2=true;
}
_b7(_bd);
_bd[this._rootItemPropName]=true;
}
var _be={},key;
for(i=0;i<this._arrayOfAllItems.length;++i){
_bd=this._arrayOfAllItems[i];
for(key in _bd){
if(key!==this._rootItemPropName){
var _bf=_bd[key];
if(_bf!==null){
if(!dojo.isArray(_bf)){
_bd[key]=[_bf];
}
}else{
_bd[key]=[null];
}
}
_be[key]=key;
}
}
while(_be[this._storeRefPropName]){
this._storeRefPropName+="_";
}
while(_be[this._itemNumPropName]){
this._itemNumPropName+="_";
}
while(_be[this._reverseRefMap]){
this._reverseRefMap+="_";
}
var _c0;
var _c1=_b1.identifier;
if(_c1){
this._itemsByIdentity={};
this._features["dojo.data.api.Identity"]=_c1;
for(i=0;i<this._arrayOfAllItems.length;++i){
_bd=this._arrayOfAllItems[i];
_c0=_bd[_c1];
var _c2=_c0[0];
if(!Object.hasOwnProperty.call(this._itemsByIdentity,_c2)){
this._itemsByIdentity[_c2]=_bd;
}else{
if(this._jsonFileUrl){
throw new Error("dojo.data.ItemFileReadStore:  The json data as specified by: ["+this._jsonFileUrl+"] is malformed.  Items within the list have identifier: ["+_c1+"].  Value collided: ["+_c2+"]");
}else{
if(this._jsonData){
throw new Error("dojo.data.ItemFileReadStore:  The json data provided by the creation arguments is malformed.  Items within the list have identifier: ["+_c1+"].  Value collided: ["+_c2+"]");
}
}
}
}
}else{
this._features["dojo.data.api.Identity"]=Number;
}
for(i=0;i<this._arrayOfAllItems.length;++i){
_bd=this._arrayOfAllItems[i];
_bd[this._storeRefPropName]=this;
_bd[this._itemNumPropName]=i;
}
for(i=0;i<this._arrayOfAllItems.length;++i){
_bd=this._arrayOfAllItems[i];
for(key in _bd){
_c0=_bd[key];
for(var j=0;j<_c0.length;++j){
_bf=_c0[j];
if(_bf!==null&&typeof _bf=="object"){
if(("_type" in _bf)&&("_value" in _bf)){
var _c3=_bf._type;
var _c4=this._datatypeMap[_c3];
if(!_c4){
throw new Error("dojo.data.ItemFileReadStore: in the typeMap constructor arg, no object class was specified for the datatype '"+_c3+"'");
}else{
if(dojo.isFunction(_c4)){
_c0[j]=new _c4(_bf._value);
}else{
if(dojo.isFunction(_c4.deserialize)){
_c0[j]=_c4.deserialize(_bf._value);
}else{
throw new Error("dojo.data.ItemFileReadStore: Value provided in typeMap was neither a constructor, nor a an object with a deserialize function");
}
}
}
}
if(_bf._reference){
var _c5=_bf._reference;
if(!dojo.isObject(_c5)){
_c0[j]=this._getItemByIdentity(_c5);
}else{
for(var k=0;k<this._arrayOfAllItems.length;++k){
var _c6=this._arrayOfAllItems[k],_c7=true;
for(var _c8 in _c5){
if(_c6[_c8]!=_c5[_c8]){
_c7=false;
}
}
if(_c7){
_c0[j]=_c6;
}
}
}
if(this.referenceIntegrity){
var _c9=_c0[j];
if(this.isItem(_c9)){
this._addReferenceToMap(_c9,_bd,key);
}
}
}else{
if(this.isItem(_bf)){
if(this.referenceIntegrity){
this._addReferenceToMap(_bf,_bd,key);
}
}
}
}
}
}
}
},_addReferenceToMap:function(_ca,_cb,_cc){
},getIdentity:function(_cd){
var _ce=this._features["dojo.data.api.Identity"];
if(_ce===Number){
return _cd[this._itemNumPropName];
}else{
var _cf=_cd[_ce];
if(_cf){
return _cf[0];
}
}
return null;
},fetchItemByIdentity:function(_d0){
var _d1,_d2;
if(!this._loadFinished){
var _d3=this;
if(this._jsonFileUrl!==this._ccUrl){
dojo.deprecated("dojo.data.ItemFileReadStore: ","To change the url, set the url property of the store,"+" not _jsonFileUrl.  _jsonFileUrl support will be removed in 2.0");
this._ccUrl=this._jsonFileUrl;
this.url=this._jsonFileUrl;
}else{
if(this.url!==this._ccUrl){
this._jsonFileUrl=this.url;
this._ccUrl=this.url;
}
}
if(this.data!=null&&this._jsonData==null){
this._jsonData=this.data;
this.data=null;
}
if(this._jsonFileUrl){
if(this._loadInProgress){
this._queuedFetches.push({args:_d0});
}else{
this._loadInProgress=true;
var _d4={url:_d3._jsonFileUrl,handleAs:"json-comment-optional",preventCache:this.urlPreventCache,failOk:this.failOk};
var _d5=dojo.xhrGet(_d4);
_d5.addCallback(function(_d6){
var _d7=_d0.scope?_d0.scope:dojo.global;
try{
_d3._getItemsFromLoadedData(_d6);
_d3._loadFinished=true;
_d3._loadInProgress=false;
_d1=_d3._getItemByIdentity(_d0.identity);
if(_d0.onItem){
_d0.onItem.call(_d7,_d1);
}
_d3._handleQueuedFetches();
}
catch(error){
_d3._loadInProgress=false;
if(_d0.onError){
_d0.onError.call(_d7,error);
}
}
});
_d5.addErrback(function(_d8){
_d3._loadInProgress=false;
if(_d0.onError){
var _d9=_d0.scope?_d0.scope:dojo.global;
_d0.onError.call(_d9,_d8);
}
});
}
}else{
if(this._jsonData){
_d3._getItemsFromLoadedData(_d3._jsonData);
_d3._jsonData=null;
_d3._loadFinished=true;
_d1=_d3._getItemByIdentity(_d0.identity);
if(_d0.onItem){
_d2=_d0.scope?_d0.scope:dojo.global;
_d0.onItem.call(_d2,_d1);
}
}
}
}else{
_d1=this._getItemByIdentity(_d0.identity);
if(_d0.onItem){
_d2=_d0.scope?_d0.scope:dojo.global;
_d0.onItem.call(_d2,_d1);
}
}
},_getItemByIdentity:function(_da){
var _db=null;
if(this._itemsByIdentity&&Object.hasOwnProperty.call(this._itemsByIdentity,_da)){
_db=this._itemsByIdentity[_da];
}else{
if(Object.hasOwnProperty.call(this._arrayOfAllItems,_da)){
_db=this._arrayOfAllItems[_da];
}
}
if(_db===undefined){
_db=null;
}
return _db;
},getIdentityAttributes:function(_dc){
var _dd=this._features["dojo.data.api.Identity"];
if(_dd===Number){
return null;
}else{
return [_dd];
}
},_forceLoad:function(){
var _de=this;
if(this._jsonFileUrl!==this._ccUrl){
dojo.deprecated("dojo.data.ItemFileReadStore: ","To change the url, set the url property of the store,"+" not _jsonFileUrl.  _jsonFileUrl support will be removed in 2.0");
this._ccUrl=this._jsonFileUrl;
this.url=this._jsonFileUrl;
}else{
if(this.url!==this._ccUrl){
this._jsonFileUrl=this.url;
this._ccUrl=this.url;
}
}
if(this.data!=null){
this._jsonData=this.data;
this.data=null;
}
if(this._jsonFileUrl){
var _df={url:this._jsonFileUrl,handleAs:"json-comment-optional",preventCache:this.urlPreventCache,failOk:this.failOk,sync:true};
var _e0=dojo.xhrGet(_df);
_e0.addCallback(function(_e1){
try{
if(_de._loadInProgress!==true&&!_de._loadFinished){
_de._getItemsFromLoadedData(_e1);
_de._loadFinished=true;
}else{
if(_de._loadInProgress){
throw new Error("dojo.data.ItemFileReadStore:  Unable to perform a synchronous load, an async load is in progress.");
}
}
}
catch(e){
console.log(e);
throw e;
}
});
_e0.addErrback(function(_e2){
throw _e2;
});
}else{
if(this._jsonData){
_de._getItemsFromLoadedData(_de._jsonData);
_de._jsonData=null;
_de._loadFinished=true;
}
}
}});
dojo.extend(dojo.data.ItemFileReadStore,dojo.data.util.simpleFetch);
}
if(!dojo._hasResource["dojo.data.ItemFileWriteStore"]){
dojo._hasResource["dojo.data.ItemFileWriteStore"]=true;
dojo.provide("dojo.data.ItemFileWriteStore");
dojo.declare("dojo.data.ItemFileWriteStore",dojo.data.ItemFileReadStore,{constructor:function(_e3){
this._features["dojo.data.api.Write"]=true;
this._features["dojo.data.api.Notification"]=true;
this._pending={_newItems:{},_modifiedItems:{},_deletedItems:{}};
if(!this._datatypeMap["Date"].serialize){
this._datatypeMap["Date"].serialize=function(obj){
return dojo.date.stamp.toISOString(obj,{zulu:true});
};
}
if(_e3&&(_e3.referenceIntegrity===false)){
this.referenceIntegrity=false;
}
this._saveInProgress=false;
},referenceIntegrity:true,_assert:function(_e4){
if(!_e4){
throw new Error("assertion failed in ItemFileWriteStore");
}
},_getIdentifierAttribute:function(){
var _e5=this.getFeatures()["dojo.data.api.Identity"];
return _e5;
},newItem:function(_e6,_e7){
this._assert(!this._saveInProgress);
if(!this._loadFinished){
this._forceLoad();
}
if(typeof _e6!="object"&&typeof _e6!="undefined"){
throw new Error("newItem() was passed something other than an object");
}
var _e8=null;
var _e9=this._getIdentifierAttribute();
if(_e9===Number){
_e8=this._arrayOfAllItems.length;
}else{
_e8=_e6[_e9];
if(typeof _e8==="undefined"){
throw new Error("newItem() was not passed an identity for the new item");
}
if(dojo.isArray(_e8)){
throw new Error("newItem() was not passed an single-valued identity");
}
}
if(this._itemsByIdentity){
this._assert(typeof this._itemsByIdentity[_e8]==="undefined");
}
this._assert(typeof this._pending._newItems[_e8]==="undefined");
this._assert(typeof this._pending._deletedItems[_e8]==="undefined");
var _ea={};
_ea[this._storeRefPropName]=this;
_ea[this._itemNumPropName]=this._arrayOfAllItems.length;
if(this._itemsByIdentity){
this._itemsByIdentity[_e8]=_ea;
_ea[_e9]=[_e8];
}
this._arrayOfAllItems.push(_ea);
var _eb=null;
if(_e7&&_e7.parent&&_e7.attribute){
_eb={item:_e7.parent,attribute:_e7.attribute,oldValue:undefined};
var _ec=this.getValues(_e7.parent,_e7.attribute);
if(_ec&&_ec.length>0){
var _ed=_ec.slice(0,_ec.length);
if(_ec.length===1){
_eb.oldValue=_ec[0];
}else{
_eb.oldValue=_ec.slice(0,_ec.length);
}
_ed.push(_ea);
this._setValueOrValues(_e7.parent,_e7.attribute,_ed,false);
_eb.newValue=this.getValues(_e7.parent,_e7.attribute);
}else{
this._setValueOrValues(_e7.parent,_e7.attribute,_ea,false);
_eb.newValue=_ea;
}
}else{
_ea[this._rootItemPropName]=true;
this._arrayOfTopLevelItems.push(_ea);
}
this._pending._newItems[_e8]=_ea;
for(var key in _e6){
if(key===this._storeRefPropName||key===this._itemNumPropName){
throw new Error("encountered bug in ItemFileWriteStore.newItem");
}
var _ee=_e6[key];
if(!dojo.isArray(_ee)){
_ee=[_ee];
}
_ea[key]=_ee;
if(this.referenceIntegrity){
for(var i=0;i<_ee.length;i++){
var val=_ee[i];
if(this.isItem(val)){
this._addReferenceToMap(val,_ea,key);
}
}
}
}
this.onNew(_ea,_eb);
return _ea;
},_removeArrayElement:function(_ef,_f0){
var _f1=dojo.indexOf(_ef,_f0);
if(_f1!=-1){
_ef.splice(_f1,1);
return true;
}
return false;
},deleteItem:function(_f2){
this._assert(!this._saveInProgress);
this._assertIsItem(_f2);
var _f3=_f2[this._itemNumPropName];
var _f4=this.getIdentity(_f2);
if(this.referenceIntegrity){
var _f5=this.getAttributes(_f2);
if(_f2[this._reverseRefMap]){
_f2["backup_"+this._reverseRefMap]=dojo.clone(_f2[this._reverseRefMap]);
}
dojo.forEach(_f5,function(_f6){
dojo.forEach(this.getValues(_f2,_f6),function(_f7){
if(this.isItem(_f7)){
if(!_f2["backupRefs_"+this._reverseRefMap]){
_f2["backupRefs_"+this._reverseRefMap]=[];
}
_f2["backupRefs_"+this._reverseRefMap].push({id:this.getIdentity(_f7),attr:_f6});
this._removeReferenceFromMap(_f7,_f2,_f6);
}
},this);
},this);
var _f8=_f2[this._reverseRefMap];
if(_f8){
for(var _f9 in _f8){
var _fa=null;
if(this._itemsByIdentity){
_fa=this._itemsByIdentity[_f9];
}else{
_fa=this._arrayOfAllItems[_f9];
}
if(_fa){
for(var _fb in _f8[_f9]){
var _fc=this.getValues(_fa,_fb)||[];
var _fd=dojo.filter(_fc,function(_fe){
return !(this.isItem(_fe)&&this.getIdentity(_fe)==_f4);
},this);
this._removeReferenceFromMap(_f2,_fa,_fb);
if(_fd.length<_fc.length){
this._setValueOrValues(_fa,_fb,_fd,true);
}
}
}
}
}
}
this._arrayOfAllItems[_f3]=null;
_f2[this._storeRefPropName]=null;
if(this._itemsByIdentity){
delete this._itemsByIdentity[_f4];
}
this._pending._deletedItems[_f4]=_f2;
if(_f2[this._rootItemPropName]){
this._removeArrayElement(this._arrayOfTopLevelItems,_f2);
}
this.onDelete(_f2);
return true;
},setValue:function(_ff,_100,_101){
return this._setValueOrValues(_ff,_100,_101,true);
},setValues:function(item,_102,_103){
return this._setValueOrValues(item,_102,_103,true);
},unsetAttribute:function(item,_104){
return this._setValueOrValues(item,_104,[],true);
},_setValueOrValues:function(item,_105,_106,_107){
this._assert(!this._saveInProgress);
this._assertIsItem(item);
this._assert(dojo.isString(_105));
this._assert(typeof _106!=="undefined");
var _108=this._getIdentifierAttribute();
if(_105==_108){
throw new Error("ItemFileWriteStore does not have support for changing the value of an item's identifier.");
}
var _109=this._getValueOrValues(item,_105);
var _10a=this.getIdentity(item);
if(!this._pending._modifiedItems[_10a]){
var _10b={};
for(var key in item){
if((key===this._storeRefPropName)||(key===this._itemNumPropName)||(key===this._rootItemPropName)){
_10b[key]=item[key];
}else{
if(key===this._reverseRefMap){
_10b[key]=dojo.clone(item[key]);
}else{
_10b[key]=item[key].slice(0,item[key].length);
}
}
}
this._pending._modifiedItems[_10a]=_10b;
}
var _10c=false;
if(dojo.isArray(_106)&&_106.length===0){
_10c=delete item[_105];
_106=undefined;
if(this.referenceIntegrity&&_109){
var _10d=_109;
if(!dojo.isArray(_10d)){
_10d=[_10d];
}
for(var i=0;i<_10d.length;i++){
var _10e=_10d[i];
if(this.isItem(_10e)){
this._removeReferenceFromMap(_10e,item,_105);
}
}
}
}else{
var _10f;
if(dojo.isArray(_106)){
var _110=_106;
_10f=_106.slice(0,_106.length);
}else{
_10f=[_106];
}
if(this.referenceIntegrity){
if(_109){
var _10d=_109;
if(!dojo.isArray(_10d)){
_10d=[_10d];
}
var map={};
dojo.forEach(_10d,function(_111){
if(this.isItem(_111)){
var id=this.getIdentity(_111);
map[id.toString()]=true;
}
},this);
dojo.forEach(_10f,function(_112){
if(this.isItem(_112)){
var id=this.getIdentity(_112);
if(map[id.toString()]){
delete map[id.toString()];
}else{
this._addReferenceToMap(_112,item,_105);
}
}
},this);
for(var rId in map){
var _113;
if(this._itemsByIdentity){
_113=this._itemsByIdentity[rId];
}else{
_113=this._arrayOfAllItems[rId];
}
this._removeReferenceFromMap(_113,item,_105);
}
}else{
for(var i=0;i<_10f.length;i++){
var _10e=_10f[i];
if(this.isItem(_10e)){
this._addReferenceToMap(_10e,item,_105);
}
}
}
}
item[_105]=_10f;
_10c=true;
}
if(_107){
this.onSet(item,_105,_109,_106);
}
return _10c;
},_addReferenceToMap:function(_114,_115,_116){
var _117=this.getIdentity(_115);
var _118=_114[this._reverseRefMap];
if(!_118){
_118=_114[this._reverseRefMap]={};
}
var _119=_118[_117];
if(!_119){
_119=_118[_117]={};
}
_119[_116]=true;
},_removeReferenceFromMap:function(_11a,_11b,_11c){
var _11d=this.getIdentity(_11b);
var _11e=_11a[this._reverseRefMap];
var _11f;
if(_11e){
for(_11f in _11e){
if(_11f==_11d){
delete _11e[_11f][_11c];
if(this._isEmpty(_11e[_11f])){
delete _11e[_11f];
}
}
}
if(this._isEmpty(_11e)){
delete _11a[this._reverseRefMap];
}
}
},_dumpReferenceMap:function(){
var i;
for(i=0;i<this._arrayOfAllItems.length;i++){
var item=this._arrayOfAllItems[i];
if(item&&item[this._reverseRefMap]){
console.log("Item: ["+this.getIdentity(item)+"] is referenced by: "+dojo.toJson(item[this._reverseRefMap]));
}
}
},_getValueOrValues:function(item,_120){
var _121=undefined;
if(this.hasAttribute(item,_120)){
var _122=this.getValues(item,_120);
if(_122.length==1){
_121=_122[0];
}else{
_121=_122;
}
}
return _121;
},_flatten:function(_123){
if(this.isItem(_123)){
var item=_123;
var _124=this.getIdentity(item);
var _125={_reference:_124};
return _125;
}else{
if(typeof _123==="object"){
for(var type in this._datatypeMap){
var _126=this._datatypeMap[type];
if(dojo.isObject(_126)&&!dojo.isFunction(_126)){
if(_123 instanceof _126.type){
if(!_126.serialize){
throw new Error("ItemFileWriteStore:  No serializer defined for type mapping: ["+type+"]");
}
return {_type:type,_value:_126.serialize(_123)};
}
}else{
if(_123 instanceof _126){
return {_type:type,_value:_123.toString()};
}
}
}
}
return _123;
}
},_getNewFileContentString:function(){
var _127={};
var _128=this._getIdentifierAttribute();
if(_128!==Number){
_127.identifier=_128;
}
if(this._labelAttr){
_127.label=this._labelAttr;
}
_127.items=[];
for(var i=0;i<this._arrayOfAllItems.length;++i){
var item=this._arrayOfAllItems[i];
if(item!==null){
var _129={};
for(var key in item){
if(key!==this._storeRefPropName&&key!==this._itemNumPropName&&key!==this._reverseRefMap&&key!==this._rootItemPropName){
var _12a=key;
var _12b=this.getValues(item,_12a);
if(_12b.length==1){
_129[_12a]=this._flatten(_12b[0]);
}else{
var _12c=[];
for(var j=0;j<_12b.length;++j){
_12c.push(this._flatten(_12b[j]));
_129[_12a]=_12c;
}
}
}
}
_127.items.push(_129);
}
}
var _12d=true;
return dojo.toJson(_127,_12d);
},_isEmpty:function(_12e){
var _12f=true;
if(dojo.isObject(_12e)){
var i;
for(i in _12e){
_12f=false;
break;
}
}else{
if(dojo.isArray(_12e)){
if(_12e.length>0){
_12f=false;
}
}
}
return _12f;
},save:function(_130){
this._assert(!this._saveInProgress);
this._saveInProgress=true;
var self=this;
var _131=function(){
self._pending={_newItems:{},_modifiedItems:{},_deletedItems:{}};
self._saveInProgress=false;
if(_130&&_130.onComplete){
var _132=_130.scope||dojo.global;
_130.onComplete.call(_132);
}
};
var _133=function(err){
self._saveInProgress=false;
if(_130&&_130.onError){
var _134=_130.scope||dojo.global;
_130.onError.call(_134,err);
}
};
if(this._saveEverything){
var _135=this._getNewFileContentString();
this._saveEverything(_131,_133,_135);
}
if(this._saveCustom){
this._saveCustom(_131,_133);
}
if(!this._saveEverything&&!this._saveCustom){
_131();
}
},revert:function(){
this._assert(!this._saveInProgress);
var _136;
for(_136 in this._pending._modifiedItems){
var _137=this._pending._modifiedItems[_136];
var _138=null;
if(this._itemsByIdentity){
_138=this._itemsByIdentity[_136];
}else{
_138=this._arrayOfAllItems[_136];
}
_137[this._storeRefPropName]=this;
for(key in _138){
delete _138[key];
}
dojo.mixin(_138,_137);
}
var _139;
for(_136 in this._pending._deletedItems){
_139=this._pending._deletedItems[_136];
_139[this._storeRefPropName]=this;
var _13a=_139[this._itemNumPropName];
if(_139["backup_"+this._reverseRefMap]){
_139[this._reverseRefMap]=_139["backup_"+this._reverseRefMap];
delete _139["backup_"+this._reverseRefMap];
}
this._arrayOfAllItems[_13a]=_139;
if(this._itemsByIdentity){
this._itemsByIdentity[_136]=_139;
}
if(_139[this._rootItemPropName]){
this._arrayOfTopLevelItems.push(_139);
}
}
for(_136 in this._pending._deletedItems){
_139=this._pending._deletedItems[_136];
if(_139["backupRefs_"+this._reverseRefMap]){
dojo.forEach(_139["backupRefs_"+this._reverseRefMap],function(_13b){
var _13c;
if(this._itemsByIdentity){
_13c=this._itemsByIdentity[_13b.id];
}else{
_13c=this._arrayOfAllItems[_13b.id];
}
this._addReferenceToMap(_13c,_139,_13b.attr);
},this);
delete _139["backupRefs_"+this._reverseRefMap];
}
}
for(_136 in this._pending._newItems){
var _13d=this._pending._newItems[_136];
_13d[this._storeRefPropName]=null;
this._arrayOfAllItems[_13d[this._itemNumPropName]]=null;
if(_13d[this._rootItemPropName]){
this._removeArrayElement(this._arrayOfTopLevelItems,_13d);
}
if(this._itemsByIdentity){
delete this._itemsByIdentity[_136];
}
}
this._pending={_newItems:{},_modifiedItems:{},_deletedItems:{}};
return true;
},isDirty:function(item){
if(item){
var _13e=this.getIdentity(item);
return new Boolean(this._pending._newItems[_13e]||this._pending._modifiedItems[_13e]||this._pending._deletedItems[_13e]).valueOf();
}else{
if(!this._isEmpty(this._pending._newItems)||!this._isEmpty(this._pending._modifiedItems)||!this._isEmpty(this._pending._deletedItems)){
return true;
}
return false;
}
},onSet:function(item,_13f,_140,_141){
},onNew:function(_142,_143){
},onDelete:function(_144){
},close:function(_145){
if(this.clearOnClose){
if(!this.isDirty()){
this.inherited(arguments);
}else{
throw new Error("dojo.data.ItemFileWriteStore: There are unsaved changes present in the store.  Please save or revert the changes before invoking close.");
}
}
}});
}
if(!dojo._hasResource["dojo.dnd.common"]){
dojo._hasResource["dojo.dnd.common"]=true;
dojo.provide("dojo.dnd.common");
dojo.getObject("dnd",true,dojo);
dojo.dnd.getCopyKeyState=dojo.isCopyKey;
dojo.dnd._uniqueId=0;
dojo.dnd.getUniqueId=function(){
var id;
do{
id=dojo._scopeName+"Unique"+(++dojo.dnd._uniqueId);
}while(dojo.byId(id));
return id;
};
dojo.dnd._empty={};
dojo.dnd.isFormElement=function(e){
var t=e.target;
if(t.nodeType==3){
t=t.parentNode;
}
return " button textarea input select option ".indexOf(" "+t.tagName.toLowerCase()+" ")>=0;
};
}
if(!dojo._hasResource["dojo.window"]){
dojo._hasResource["dojo.window"]=true;
dojo.provide("dojo.window");
dojo.getObject("window",true,dojo);
dojo.window.getBox=function(){
var _146=(dojo.doc.compatMode=="BackCompat")?dojo.body():dojo.doc.documentElement;
var _147=dojo._docScroll();
return {w:_146.clientWidth,h:_146.clientHeight,l:_147.x,t:_147.y};
};
dojo.window.get=function(doc){
if(dojo.isIE&&window!==document.parentWindow){
doc.parentWindow.execScript("document._parentWindow = window;","Javascript");
var win=doc._parentWindow;
doc._parentWindow=null;
return win;
}
return doc.parentWindow||doc.defaultView;
};
dojo.window.scrollIntoView=function(node,pos){
try{
node=dojo.byId(node);
var doc=node.ownerDocument||dojo.doc,body=doc.body||dojo.body(),html=doc.documentElement||body.parentNode,isIE=dojo.isIE,isWK=dojo.isWebKit;
if((!(dojo.isMoz||isIE||isWK||dojo.isOpera)||node==body||node==html)&&(typeof node.scrollIntoView!="undefined")){
node.scrollIntoView(false);
return;
}
var _148=doc.compatMode=="BackCompat",_149=_148?body:html,_14a=isWK?body:_149,_14b=_149.clientWidth,_14c=_149.clientHeight,rtl=!dojo._isBodyLtr(),_14d=pos||dojo.position(node),el=node.parentNode,_14e=function(el){
return ((isIE<=6||(isIE&&_148))?false:(dojo.style(el,"position").toLowerCase()=="fixed"));
};
if(_14e(node)){
return;
}
while(el){
if(el==body){
el=_14a;
}
var _14f=dojo.position(el),_150=_14e(el);
if(el==_14a){
_14f.w=_14b;
_14f.h=_14c;
if(_14a==html&&isIE&&rtl){
_14f.x+=_14a.offsetWidth-_14f.w;
}
if(_14f.x<0||!isIE){
_14f.x=0;
}
if(_14f.y<0||!isIE){
_14f.y=0;
}
}else{
var pb=dojo._getPadBorderExtents(el);
_14f.w-=pb.w;
_14f.h-=pb.h;
_14f.x+=pb.l;
_14f.y+=pb.t;
}
if(el!=_14a){
var _151=el.clientWidth,_152=_14f.w-_151;
if(_151>0&&_152>0){
_14f.w=_151;
if(isIE&&rtl){
_14f.x+=_152;
}
}
_151=el.clientHeight;
_152=_14f.h-_151;
if(_151>0&&_152>0){
_14f.h=_151;
}
}
if(_150){
if(_14f.y<0){
_14f.h+=_14f.y;
_14f.y=0;
}
if(_14f.x<0){
_14f.w+=_14f.x;
_14f.x=0;
}
if(_14f.y+_14f.h>_14c){
_14f.h=_14c-_14f.y;
}
if(_14f.x+_14f.w>_14b){
_14f.w=_14b-_14f.x;
}
}
var l=_14d.x-_14f.x,t=_14d.y-Math.max(_14f.y,0),r=l+_14d.w-_14f.w,bot=t+_14d.h-_14f.h;
if(r*l>0){
var s=Math[l<0?"max":"min"](l,r);
_14d.x+=el.scrollLeft;
el.scrollLeft+=(isIE>=8&&!_148&&rtl)?-s:s;
_14d.x-=el.scrollLeft;
}
if(bot*t>0){
_14d.y+=el.scrollTop;
el.scrollTop+=Math[t<0?"max":"min"](t,bot);
_14d.y-=el.scrollTop;
}
el=(el!=_14a)&&!_150&&el.parentNode;
}
}
catch(error){
console.error("scrollIntoView: "+error);
node.scrollIntoView(false);
}
};
}
if(!dojo._hasResource["dojo.dnd.autoscroll"]){
dojo._hasResource["dojo.dnd.autoscroll"]=true;
dojo.provide("dojo.dnd.autoscroll");
dojo.getObject("dnd",true,dojo);
dojo.dnd.getViewport=dojo.window.getBox;
dojo.dnd.V_TRIGGER_AUTOSCROLL=32;
dojo.dnd.H_TRIGGER_AUTOSCROLL=32;
dojo.dnd.V_AUTOSCROLL_VALUE=16;
dojo.dnd.H_AUTOSCROLL_VALUE=16;
dojo.dnd.autoScroll=function(e){
var v=dojo.window.getBox(),dx=0,dy=0;
if(e.clientX<dojo.dnd.H_TRIGGER_AUTOSCROLL){
dx=-dojo.dnd.H_AUTOSCROLL_VALUE;
}else{
if(e.clientX>v.w-dojo.dnd.H_TRIGGER_AUTOSCROLL){
dx=dojo.dnd.H_AUTOSCROLL_VALUE;
}
}
if(e.clientY<dojo.dnd.V_TRIGGER_AUTOSCROLL){
dy=-dojo.dnd.V_AUTOSCROLL_VALUE;
}else{
if(e.clientY>v.h-dojo.dnd.V_TRIGGER_AUTOSCROLL){
dy=dojo.dnd.V_AUTOSCROLL_VALUE;
}
}
window.scrollBy(dx,dy);
};
dojo.dnd._validNodes={"div":1,"p":1,"td":1};
dojo.dnd._validOverflow={"auto":1,"scroll":1};
dojo.dnd.autoScrollNodes=function(e){
for(var n=e.target;n;){
if(n.nodeType==1&&(n.tagName.toLowerCase() in dojo.dnd._validNodes)){
var s=dojo.getComputedStyle(n);
if(s.overflow.toLowerCase() in dojo.dnd._validOverflow){
var b=dojo._getContentBox(n,s),t=dojo.position(n,true);
var w=Math.min(dojo.dnd.H_TRIGGER_AUTOSCROLL,b.w/2),h=Math.min(dojo.dnd.V_TRIGGER_AUTOSCROLL,b.h/2),rx=e.pageX-t.x,ry=e.pageY-t.y,dx=0,dy=0;
if(dojo.isWebKit||dojo.isOpera){
rx+=dojo.body().scrollLeft;
ry+=dojo.body().scrollTop;
}
if(rx>0&&rx<b.w){
if(rx<w){
dx=-w;
}else{
if(rx>b.w-w){
dx=w;
}
}
}
if(ry>0&&ry<b.h){
if(ry<h){
dy=-h;
}else{
if(ry>b.h-h){
dy=h;
}
}
}
var _153=n.scrollLeft,_154=n.scrollTop;
n.scrollLeft=n.scrollLeft+dx;
n.scrollTop=n.scrollTop+dy;
if(_153!=n.scrollLeft||_154!=n.scrollTop){
return;
}
}
}
try{
n=n.parentNode;
}
catch(x){
n=null;
}
}
dojo.dnd.autoScroll(e);
};
}
if(!dojo._hasResource["dojo.dnd.Mover"]){
dojo._hasResource["dojo.dnd.Mover"]=true;
dojo.provide("dojo.dnd.Mover");
dojo.declare("dojo.dnd.Mover",null,{constructor:function(node,e,host){
this.node=dojo.byId(node);
var pos=e.touches?e.touches[0]:e;
this.marginBox={l:pos.pageX,t:pos.pageY};
this.mouseButton=e.button;
var h=(this.host=host),d=node.ownerDocument;
this.events=[dojo.connect(d,"onmousemove",this,"onFirstMove"),dojo.connect(d,"ontouchmove",this,"onFirstMove"),dojo.connect(d,"onmousemove",this,"onMouseMove"),dojo.connect(d,"ontouchmove",this,"onMouseMove"),dojo.connect(d,"onmouseup",this,"onMouseUp"),dojo.connect(d,"ontouchend",this,"onMouseUp"),dojo.connect(d,"ondragstart",dojo.stopEvent),dojo.connect(d.body,"onselectstart",dojo.stopEvent)];
if(h&&h.onMoveStart){
h.onMoveStart(this);
}
},onMouseMove:function(e){
dojo.dnd.autoScroll(e);
var m=this.marginBox,pos=e.touches?e.touches[0]:e;
this.host.onMove(this,{l:m.l+pos.pageX,t:m.t+pos.pageY},e);
dojo.stopEvent(e);
},onMouseUp:function(e){
if(dojo.isWebKit&&dojo.isMac&&this.mouseButton==2?e.button==0:this.mouseButton==e.button){
this.destroy();
}
dojo.stopEvent(e);
},onFirstMove:function(e){
var s=this.node.style,l,t,h=this.host;
switch(s.position){
case "relative":
case "absolute":
l=Math.round(parseFloat(s.left))||0;
t=Math.round(parseFloat(s.top))||0;
break;
default:
s.position="absolute";
var m=dojo.marginBox(this.node);
var b=dojo.doc.body;
var bs=dojo.getComputedStyle(b);
var bm=dojo._getMarginBox(b,bs);
var bc=dojo._getContentBox(b,bs);
l=m.l-(bc.l-bm.l);
t=m.t-(bc.t-bm.t);
break;
}
this.marginBox.l=l-this.marginBox.l;
this.marginBox.t=t-this.marginBox.t;
if(h&&h.onFirstMove){
h.onFirstMove(this,e);
}
dojo.disconnect(this.events.shift());
dojo.disconnect(this.events.shift());
},destroy:function(){
dojo.forEach(this.events,dojo.disconnect);
var h=this.host;
if(h&&h.onMoveStop){
h.onMoveStop(this);
}
this.events=this.node=this.host=null;
}});
}
if(!dojo._hasResource["dojo.dnd.Moveable"]){
dojo._hasResource["dojo.dnd.Moveable"]=true;
dojo.provide("dojo.dnd.Moveable");
dojo.declare("dojo.dnd.Moveable",null,{handle:"",delay:0,skip:false,constructor:function(node,_155){
this.node=dojo.byId(node);
if(!_155){
_155={};
}
this.handle=_155.handle?dojo.byId(_155.handle):null;
if(!this.handle){
this.handle=this.node;
}
this.delay=_155.delay>0?_155.delay:0;
this.skip=_155.skip;
this.mover=_155.mover?_155.mover:dojo.dnd.Mover;
this.events=[dojo.connect(this.handle,"onmousedown",this,"onMouseDown"),dojo.connect(this.handle,"ontouchstart",this,"onMouseDown"),dojo.connect(this.handle,"ondragstart",this,"onSelectStart"),dojo.connect(this.handle,"onselectstart",this,"onSelectStart")];
},markupFactory:function(_156,node){
return new dojo.dnd.Moveable(node,_156);
},destroy:function(){
dojo.forEach(this.events,dojo.disconnect);
this.events=this.node=this.handle=null;
},onMouseDown:function(e){
if(this.skip&&dojo.dnd.isFormElement(e)){
return;
}
if(this.delay){
this.events.push(dojo.connect(this.handle,"onmousemove",this,"onMouseMove"),dojo.connect(this.handle,"ontouchmove",this,"onMouseMove"),dojo.connect(this.handle,"onmouseup",this,"onMouseUp"),dojo.connect(this.handle,"ontouchend",this,"onMouseUp"));
var pos=e.touches?e.touches[0]:e;
this._lastX=pos.pageX;
this._lastY=pos.pageY;
}else{
this.onDragDetected(e);
}
dojo.stopEvent(e);
},onMouseMove:function(e){
var pos=e.touches?e.touches[0]:e;
if(Math.abs(pos.pageX-this._lastX)>this.delay||Math.abs(pos.pageY-this._lastY)>this.delay){
this.onMouseUp(e);
this.onDragDetected(e);
}
dojo.stopEvent(e);
},onMouseUp:function(e){
for(var i=0;i<2;++i){
dojo.disconnect(this.events.pop());
}
dojo.stopEvent(e);
},onSelectStart:function(e){
if(!this.skip||!dojo.dnd.isFormElement(e)){
dojo.stopEvent(e);
}
},onDragDetected:function(e){
new this.mover(this.node,e,this);
},onMoveStart:function(_157){
dojo.publish("/dnd/move/start",[_157]);
dojo.addClass(dojo.body(),"dojoMove");
dojo.addClass(this.node,"dojoMoveItem");
},onMoveStop:function(_158){
dojo.publish("/dnd/move/stop",[_158]);
dojo.removeClass(dojo.body(),"dojoMove");
dojo.removeClass(this.node,"dojoMoveItem");
},onFirstMove:function(_159,e){
},onMove:function(_15a,_15b,e){
this.onMoving(_15a,_15b);
var s=_15a.node.style;
s.left=_15b.l+"px";
s.top=_15b.t+"px";
this.onMoved(_15a,_15b);
},onMoving:function(_15c,_15d){
},onMoved:function(_15e,_15f){
}});
}
if(!dojo._hasResource["dojo.dnd.move"]){
dojo._hasResource["dojo.dnd.move"]=true;
dojo.provide("dojo.dnd.move");
dojo.declare("dojo.dnd.move.constrainedMoveable",dojo.dnd.Moveable,{constraints:function(){
},within:false,markupFactory:function(_160,node){
return new dojo.dnd.move.constrainedMoveable(node,_160);
},constructor:function(node,_161){
if(!_161){
_161={};
}
this.constraints=_161.constraints;
this.within=_161.within;
},onFirstMove:function(_162){
var c=this.constraintBox=this.constraints.call(this,_162);
c.r=c.l+c.w;
c.b=c.t+c.h;
if(this.within){
var mb=dojo._getMarginSize(_162.node);
c.r-=mb.w;
c.b-=mb.h;
}
},onMove:function(_163,_164){
var c=this.constraintBox,s=_163.node.style;
this.onMoving(_163,_164);
_164.l=_164.l<c.l?c.l:c.r<_164.l?c.r:_164.l;
_164.t=_164.t<c.t?c.t:c.b<_164.t?c.b:_164.t;
s.left=_164.l+"px";
s.top=_164.t+"px";
this.onMoved(_163,_164);
}});
dojo.declare("dojo.dnd.move.boxConstrainedMoveable",dojo.dnd.move.constrainedMoveable,{box:{},markupFactory:function(_165,node){
return new dojo.dnd.move.boxConstrainedMoveable(node,_165);
},constructor:function(node,_166){
var box=_166&&_166.box;
this.constraints=function(){
return box;
};
}});
dojo.declare("dojo.dnd.move.parentConstrainedMoveable",dojo.dnd.move.constrainedMoveable,{area:"content",markupFactory:function(_167,node){
return new dojo.dnd.move.parentConstrainedMoveable(node,_167);
},constructor:function(node,_168){
var area=_168&&_168.area;
this.constraints=function(){
var n=this.node.parentNode,s=dojo.getComputedStyle(n),mb=dojo._getMarginBox(n,s);
if(area=="margin"){
return mb;
}
var t=dojo._getMarginExtents(n,s);
mb.l+=t.l,mb.t+=t.t,mb.w-=t.w,mb.h-=t.h;
if(area=="border"){
return mb;
}
t=dojo._getBorderExtents(n,s);
mb.l+=t.l,mb.t+=t.t,mb.w-=t.w,mb.h-=t.h;
if(area=="padding"){
return mb;
}
t=dojo._getPadExtents(n,s);
mb.l+=t.l,mb.t+=t.t,mb.w-=t.w,mb.h-=t.h;
return mb;
};
}});
dojo.dnd.constrainedMover=dojo.dnd.move.constrainedMover;
dojo.dnd.boxConstrainedMover=dojo.dnd.move.boxConstrainedMover;
dojo.dnd.parentConstrainedMover=dojo.dnd.move.parentConstrainedMover;
}
if(!dojo._hasResource["dojo.dnd.Container"]){
dojo._hasResource["dojo.dnd.Container"]=true;
dojo.provide("dojo.dnd.Container");
dojo.declare("dojo.dnd.Container",null,{skipForm:false,constructor:function(node,_169){
this.node=dojo.byId(node);
if(!_169){
_169={};
}
this.creator=_169.creator||null;
this.skipForm=_169.skipForm;
this.parent=_169.dropParent&&dojo.byId(_169.dropParent);
this.map={};
this.current=null;
this.containerState="";
dojo.addClass(this.node,"dojoDndContainer");
if(!(_169&&_169._skipStartup)){
this.startup();
}
this.events=[dojo.connect(this.node,"onmouseover",this,"onMouseOver"),dojo.connect(this.node,"onmouseout",this,"onMouseOut"),dojo.connect(this.node,"ondragstart",this,"onSelectStart"),dojo.connect(this.node,"onselectstart",this,"onSelectStart")];
},creator:function(){
},getItem:function(key){
return this.map[key];
},setItem:function(key,data){
this.map[key]=data;
},delItem:function(key){
delete this.map[key];
},forInItems:function(f,o){
o=o||dojo.global;
var m=this.map,e=dojo.dnd._empty;
for(var i in m){
if(i in e){
continue;
}
f.call(o,m[i],i,this);
}
return o;
},clearItems:function(){
this.map={};
},getAllNodes:function(){
return dojo.query("> .dojoDndItem",this.parent);
},sync:function(){
var map={};
this.getAllNodes().forEach(function(node){
if(node.id){
var item=this.getItem(node.id);
if(item){
map[node.id]=item;
return;
}
}else{
node.id=dojo.dnd.getUniqueId();
}
var type=node.getAttribute("dndType"),data=node.getAttribute("dndData");
map[node.id]={data:data||node.innerHTML,type:type?type.split(/\s*,\s*/):["text"]};
},this);
this.map=map;
return this;
},insertNodes:function(data,_16a,_16b){
if(!this.parent.firstChild){
_16b=null;
}else{
if(_16a){
if(!_16b){
_16b=this.parent.firstChild;
}
}else{
if(_16b){
_16b=_16b.nextSibling;
}
}
}
if(_16b){
for(var i=0;i<data.length;++i){
var t=this._normalizedCreator(data[i]);
this.setItem(t.node.id,{data:t.data,type:t.type});
this.parent.insertBefore(t.node,_16b);
}
}else{
for(var i=0;i<data.length;++i){
var t=this._normalizedCreator(data[i]);
this.setItem(t.node.id,{data:t.data,type:t.type});
this.parent.appendChild(t.node);
}
}
return this;
},destroy:function(){
dojo.forEach(this.events,dojo.disconnect);
this.clearItems();
this.node=this.parent=this.current=null;
},markupFactory:function(_16c,node){
_16c._skipStartup=true;
return new dojo.dnd.Container(node,_16c);
},startup:function(){
if(!this.parent){
this.parent=this.node;
if(this.parent.tagName.toLowerCase()=="table"){
var c=this.parent.getElementsByTagName("tbody");
if(c&&c.length){
this.parent=c[0];
}
}
}
this.defaultCreator=dojo.dnd._defaultCreator(this.parent);
this.sync();
},onMouseOver:function(e){
var n=e.relatedTarget;
while(n){
if(n==this.node){
break;
}
try{
n=n.parentNode;
}
catch(x){
n=null;
}
}
if(!n){
this._changeState("Container","Over");
this.onOverEvent();
}
n=this._getChildByEvent(e);
if(this.current==n){
return;
}
if(this.current){
this._removeItemClass(this.current,"Over");
}
if(n){
this._addItemClass(n,"Over");
}
this.current=n;
},onMouseOut:function(e){
for(var n=e.relatedTarget;n;){
if(n==this.node){
return;
}
try{
n=n.parentNode;
}
catch(x){
n=null;
}
}
if(this.current){
this._removeItemClass(this.current,"Over");
this.current=null;
}
this._changeState("Container","");
this.onOutEvent();
},onSelectStart:function(e){
if(!this.skipForm||!dojo.dnd.isFormElement(e)){
dojo.stopEvent(e);
}
},onOverEvent:function(){
},onOutEvent:function(){
},_changeState:function(type,_16d){
var _16e="dojoDnd"+type;
var _16f=type.toLowerCase()+"State";
dojo.replaceClass(this.node,_16e+_16d,_16e+this[_16f]);
this[_16f]=_16d;
},_addItemClass:function(node,type){
dojo.addClass(node,"dojoDndItem"+type);
},_removeItemClass:function(node,type){
dojo.removeClass(node,"dojoDndItem"+type);
},_getChildByEvent:function(e){
var node=e.target;
if(node){
for(var _170=node.parentNode;_170;node=_170,_170=node.parentNode){
if(_170==this.parent&&dojo.hasClass(node,"dojoDndItem")){
return node;
}
}
}
return null;
},_normalizedCreator:function(item,hint){
var t=(this.creator||this.defaultCreator).call(this,item,hint);
if(!dojo.isArray(t.type)){
t.type=["text"];
}
if(!t.node.id){
t.node.id=dojo.dnd.getUniqueId();
}
dojo.addClass(t.node,"dojoDndItem");
return t;
}});
dojo.dnd._createNode=function(tag){
if(!tag){
return dojo.dnd._createSpan;
}
return function(text){
return dojo.create(tag,{innerHTML:text});
};
};
dojo.dnd._createTrTd=function(text){
var tr=dojo.create("tr");
dojo.create("td",{innerHTML:text},tr);
return tr;
};
dojo.dnd._createSpan=function(text){
return dojo.create("span",{innerHTML:text});
};
dojo.dnd._defaultCreatorNodes={ul:"li",ol:"li",div:"div",p:"div"};
dojo.dnd._defaultCreator=function(node){
var tag=node.tagName.toLowerCase();
var c=tag=="tbody"||tag=="thead"?dojo.dnd._createTrTd:dojo.dnd._createNode(dojo.dnd._defaultCreatorNodes[tag]);
return function(item,hint){
var _171=item&&dojo.isObject(item),data,type,n;
if(_171&&item.tagName&&item.nodeType&&item.getAttribute){
data=item.getAttribute("dndData")||item.innerHTML;
type=item.getAttribute("dndType");
type=type?type.split(/\s*,\s*/):["text"];
n=item;
}else{
data=(_171&&item.data)?item.data:item;
type=(_171&&item.type)?item.type:["text"];
n=(hint=="avatar"?dojo.dnd._createSpan:c)(String(data));
}
if(!n.id){
n.id=dojo.dnd.getUniqueId();
}
return {node:n,data:data,type:type};
};
};
}
if(!dojo._hasResource["dojo.dnd.Selector"]){
dojo._hasResource["dojo.dnd.Selector"]=true;
dojo.provide("dojo.dnd.Selector");
dojo.declare("dojo.dnd.Selector",dojo.dnd.Container,{constructor:function(node,_172){
if(!_172){
_172={};
}
this.singular=_172.singular;
this.autoSync=_172.autoSync;
this.selection={};
this.anchor=null;
this.simpleSelection=false;
this.events.push(dojo.connect(this.node,"onmousedown",this,"onMouseDown"),dojo.connect(this.node,"onmouseup",this,"onMouseUp"));
},singular:false,getSelectedNodes:function(){
var t=new dojo.NodeList();
var e=dojo.dnd._empty;
for(var i in this.selection){
if(i in e){
continue;
}
t.push(dojo.byId(i));
}
return t;
},selectNone:function(){
return this._removeSelection()._removeAnchor();
},selectAll:function(){
this.forInItems(function(data,id){
this._addItemClass(dojo.byId(id),"Selected");
this.selection[id]=1;
},this);
return this._removeAnchor();
},deleteSelectedNodes:function(){
var e=dojo.dnd._empty;
for(var i in this.selection){
if(i in e){
continue;
}
var n=dojo.byId(i);
this.delItem(i);
dojo.destroy(n);
}
this.anchor=null;
this.selection={};
return this;
},forInSelectedItems:function(f,o){
o=o||dojo.global;
var s=this.selection,e=dojo.dnd._empty;
for(var i in s){
if(i in e){
continue;
}
f.call(o,this.getItem(i),i,this);
}
},sync:function(){
dojo.dnd.Selector.superclass.sync.call(this);
if(this.anchor){
if(!this.getItem(this.anchor.id)){
this.anchor=null;
}
}
var t=[],e=dojo.dnd._empty;
for(var i in this.selection){
if(i in e){
continue;
}
if(!this.getItem(i)){
t.push(i);
}
}
dojo.forEach(t,function(i){
delete this.selection[i];
},this);
return this;
},insertNodes:function(_173,data,_174,_175){
var _176=this._normalizedCreator;
this._normalizedCreator=function(item,hint){
var t=_176.call(this,item,hint);
if(_173){
if(!this.anchor){
this.anchor=t.node;
this._removeItemClass(t.node,"Selected");
this._addItemClass(this.anchor,"Anchor");
}else{
if(this.anchor!=t.node){
this._removeItemClass(t.node,"Anchor");
this._addItemClass(t.node,"Selected");
}
}
this.selection[t.node.id]=1;
}else{
this._removeItemClass(t.node,"Selected");
this._removeItemClass(t.node,"Anchor");
}
return t;
};
dojo.dnd.Selector.superclass.insertNodes.call(this,data,_174,_175);
this._normalizedCreator=_176;
return this;
},destroy:function(){
dojo.dnd.Selector.superclass.destroy.call(this);
this.selection=this.anchor=null;
},markupFactory:function(_177,node){
_177._skipStartup=true;
return new dojo.dnd.Selector(node,_177);
},onMouseDown:function(e){
if(this.autoSync){
this.sync();
}
if(!this.current){
return;
}
if(!this.singular&&!dojo.isCopyKey(e)&&!e.shiftKey&&(this.current.id in this.selection)){
this.simpleSelection=true;
if(e.button===dojo.mouseButtons.LEFT){
dojo.stopEvent(e);
}
return;
}
if(!this.singular&&e.shiftKey){
if(!dojo.isCopyKey(e)){
this._removeSelection();
}
var c=this.getAllNodes();
if(c.length){
if(!this.anchor){
this.anchor=c[0];
this._addItemClass(this.anchor,"Anchor");
}
this.selection[this.anchor.id]=1;
if(this.anchor!=this.current){
var i=0;
for(;i<c.length;++i){
var node=c[i];
if(node==this.anchor||node==this.current){
break;
}
}
for(++i;i<c.length;++i){
var node=c[i];
if(node==this.anchor||node==this.current){
break;
}
this._addItemClass(node,"Selected");
this.selection[node.id]=1;
}
this._addItemClass(this.current,"Selected");
this.selection[this.current.id]=1;
}
}
}else{
if(this.singular){
if(this.anchor==this.current){
if(dojo.isCopyKey(e)){
this.selectNone();
}
}else{
this.selectNone();
this.anchor=this.current;
this._addItemClass(this.anchor,"Anchor");
this.selection[this.current.id]=1;
}
}else{
if(dojo.isCopyKey(e)){
if(this.anchor==this.current){
delete this.selection[this.anchor.id];
this._removeAnchor();
}else{
if(this.current.id in this.selection){
this._removeItemClass(this.current,"Selected");
delete this.selection[this.current.id];
}else{
if(this.anchor){
this._removeItemClass(this.anchor,"Anchor");
this._addItemClass(this.anchor,"Selected");
}
this.anchor=this.current;
this._addItemClass(this.current,"Anchor");
this.selection[this.current.id]=1;
}
}
}else{
if(!(this.current.id in this.selection)){
this.selectNone();
this.anchor=this.current;
this._addItemClass(this.current,"Anchor");
this.selection[this.current.id]=1;
}
}
}
}
dojo.stopEvent(e);
},onMouseUp:function(e){
if(!this.simpleSelection){
return;
}
this.simpleSelection=false;
this.selectNone();
if(this.current){
this.anchor=this.current;
this._addItemClass(this.anchor,"Anchor");
this.selection[this.current.id]=1;
}
},onMouseMove:function(e){
this.simpleSelection=false;
},onOverEvent:function(){
this.onmousemoveEvent=dojo.connect(this.node,"onmousemove",this,"onMouseMove");
},onOutEvent:function(){
dojo.disconnect(this.onmousemoveEvent);
delete this.onmousemoveEvent;
},_removeSelection:function(){
var e=dojo.dnd._empty;
for(var i in this.selection){
if(i in e){
continue;
}
var node=dojo.byId(i);
if(node){
this._removeItemClass(node,"Selected");
}
}
this.selection={};
return this;
},_removeAnchor:function(){
if(this.anchor){
this._removeItemClass(this.anchor,"Anchor");
this.anchor=null;
}
return this;
}});
}
if(!dojo._hasResource["dojo.dnd.Avatar"]){
dojo._hasResource["dojo.dnd.Avatar"]=true;
dojo.provide("dojo.dnd.Avatar");
dojo.declare("dojo.dnd.Avatar",null,{constructor:function(_178){
this.manager=_178;
this.construct();
},construct:function(){
this.isA11y=dojo.hasClass(dojo.body(),"dijit_a11y");
var a=dojo.create("table",{"class":"dojoDndAvatar",style:{position:"absolute",zIndex:"1999",margin:"0px"}}),_179=this.manager.source,node,b=dojo.create("tbody",null,a),tr=dojo.create("tr",null,b),td=dojo.create("td",null,tr),icon=this.isA11y?dojo.create("span",{id:"a11yIcon",innerHTML:this.manager.copy?"+":"<"},td):null,span=dojo.create("span",{innerHTML:_179.generateText?this._generateText():""},td),k=Math.min(5,this.manager.nodes.length),i=0;
dojo.attr(tr,{"class":"dojoDndAvatarHeader",style:{opacity:0.9}});
for(;i<k;++i){
if(_179.creator){
node=_179._normalizedCreator(_179.getItem(this.manager.nodes[i].id).data,"avatar").node;
}else{
node=this.manager.nodes[i].cloneNode(true);
if(node.tagName.toLowerCase()=="tr"){
var _17a=dojo.create("table"),_17b=dojo.create("tbody",null,_17a);
_17b.appendChild(node);
node=_17a;
}
}
node.id="";
tr=dojo.create("tr",null,b);
td=dojo.create("td",null,tr);
td.appendChild(node);
dojo.attr(tr,{"class":"dojoDndAvatarItem",style:{opacity:(9-i)/10}});
}
this.node=a;
},destroy:function(){
dojo.destroy(this.node);
this.node=false;
},update:function(){
dojo[(this.manager.canDropFlag?"add":"remove")+"Class"](this.node,"dojoDndAvatarCanDrop");
if(this.isA11y){
var icon=dojo.byId("a11yIcon");
var text="+";
if(this.manager.canDropFlag&&!this.manager.copy){
text="< ";
}else{
if(!this.manager.canDropFlag&&!this.manager.copy){
text="o";
}else{
if(!this.manager.canDropFlag){
text="x";
}
}
}
icon.innerHTML=text;
}
dojo.query(("tr.dojoDndAvatarHeader td span"+(this.isA11y?" span":"")),this.node).forEach(function(node){
node.innerHTML=this._generateText();
},this);
},_generateText:function(){
return this.manager.nodes.length.toString();
}});
}
if(!dojo._hasResource["dojo.dnd.Manager"]){
dojo._hasResource["dojo.dnd.Manager"]=true;
dojo.provide("dojo.dnd.Manager");
dojo.declare("dojo.dnd.Manager",null,{constructor:function(){
this.avatar=null;
this.source=null;
this.nodes=[];
this.copy=true;
this.target=null;
this.canDropFlag=false;
this.events=[];
},OFFSET_X:16,OFFSET_Y:16,overSource:function(_17c){
if(this.avatar){
this.target=(_17c&&_17c.targetState!="Disabled")?_17c:null;
this.canDropFlag=Boolean(this.target);
this.avatar.update();
}
dojo.publish("/dnd/source/over",[_17c]);
},outSource:function(_17d){
if(this.avatar){
if(this.target==_17d){
this.target=null;
this.canDropFlag=false;
this.avatar.update();
dojo.publish("/dnd/source/over",[null]);
}
}else{
dojo.publish("/dnd/source/over",[null]);
}
},startDrag:function(_17e,_17f,copy){
this.source=_17e;
this.nodes=_17f;
this.copy=Boolean(copy);
this.avatar=this.makeAvatar();
dojo.body().appendChild(this.avatar.node);
dojo.publish("/dnd/start",[_17e,_17f,this.copy]);
this.events=[dojo.connect(dojo.doc,"onmousemove",this,"onMouseMove"),dojo.connect(dojo.doc,"onmouseup",this,"onMouseUp"),dojo.connect(dojo.doc,"onkeydown",this,"onKeyDown"),dojo.connect(dojo.doc,"onkeyup",this,"onKeyUp"),dojo.connect(dojo.doc,"ondragstart",dojo.stopEvent),dojo.connect(dojo.body(),"onselectstart",dojo.stopEvent)];
var c="dojoDnd"+(copy?"Copy":"Move");
dojo.addClass(dojo.body(),c);
},canDrop:function(flag){
var _180=Boolean(this.target&&flag);
if(this.canDropFlag!=_180){
this.canDropFlag=_180;
this.avatar.update();
}
},stopDrag:function(){
dojo.removeClass(dojo.body(),["dojoDndCopy","dojoDndMove"]);
dojo.forEach(this.events,dojo.disconnect);
this.events=[];
this.avatar.destroy();
this.avatar=null;
this.source=this.target=null;
this.nodes=[];
},makeAvatar:function(){
return new dojo.dnd.Avatar(this);
},updateAvatar:function(){
this.avatar.update();
},onMouseMove:function(e){
var a=this.avatar;
if(a){
dojo.dnd.autoScrollNodes(e);
var s=a.node.style;
s.left=(e.pageX+this.OFFSET_X)+"px";
s.top=(e.pageY+this.OFFSET_Y)+"px";
var copy=Boolean(this.source.copyState(dojo.isCopyKey(e)));
if(this.copy!=copy){
this._setCopyStatus(copy);
}
}
},onMouseUp:function(e){
if(this.avatar){
if(this.target&&this.canDropFlag){
var copy=Boolean(this.source.copyState(dojo.isCopyKey(e))),_181=[this.source,this.nodes,copy,this.target,e];
dojo.publish("/dnd/drop/before",_181);
dojo.publish("/dnd/drop",_181);
}else{
dojo.publish("/dnd/cancel");
}
this.stopDrag();
}
},onKeyDown:function(e){
if(this.avatar){
switch(e.keyCode){
case dojo.keys.CTRL:
var copy=Boolean(this.source.copyState(true));
if(this.copy!=copy){
this._setCopyStatus(copy);
}
break;
case dojo.keys.ESCAPE:
dojo.publish("/dnd/cancel");
this.stopDrag();
break;
}
}
},onKeyUp:function(e){
if(this.avatar&&e.keyCode==dojo.keys.CTRL){
var copy=Boolean(this.source.copyState(false));
if(this.copy!=copy){
this._setCopyStatus(copy);
}
}
},_setCopyStatus:function(copy){
this.copy=copy;
this.source._markDndStatus(this.copy);
this.updateAvatar();
dojo.replaceClass(dojo.body(),"dojoDnd"+(this.copy?"Copy":"Move"),"dojoDnd"+(this.copy?"Move":"Copy"));
}});
dojo.dnd._manager=null;
dojo.dnd.manager=function(){
if(!dojo.dnd._manager){
dojo.dnd._manager=new dojo.dnd.Manager();
}
return dojo.dnd._manager;
};
}
if(!dojo._hasResource["dojo.dnd.Source"]){
dojo._hasResource["dojo.dnd.Source"]=true;
dojo.provide("dojo.dnd.Source");
dojo.declare("dojo.dnd.Source",dojo.dnd.Selector,{isSource:true,horizontal:false,copyOnly:false,selfCopy:false,selfAccept:true,skipForm:false,withHandles:false,autoSync:false,delay:0,accept:["text"],generateText:true,constructor:function(node,_182){
dojo.mixin(this,dojo.mixin({},_182));
var type=this.accept;
if(type.length){
this.accept={};
for(var i=0;i<type.length;++i){
this.accept[type[i]]=1;
}
}
this.isDragging=false;
this.mouseDown=false;
this.targetAnchor=null;
this.targetBox=null;
this.before=true;
this._lastX=0;
this._lastY=0;
this.sourceState="";
if(this.isSource){
dojo.addClass(this.node,"dojoDndSource");
}
this.targetState="";
if(this.accept){
dojo.addClass(this.node,"dojoDndTarget");
}
if(this.horizontal){
dojo.addClass(this.node,"dojoDndHorizontal");
}
this.topics=[dojo.subscribe("/dnd/source/over",this,"onDndSourceOver"),dojo.subscribe("/dnd/start",this,"onDndStart"),dojo.subscribe("/dnd/drop",this,"onDndDrop"),dojo.subscribe("/dnd/cancel",this,"onDndCancel")];
},checkAcceptance:function(_183,_184){
if(this==_183){
return !this.copyOnly||this.selfAccept;
}
for(var i=0;i<_184.length;++i){
var type=_183.getItem(_184[i].id).type;
var flag=false;
for(var j=0;j<type.length;++j){
if(type[j] in this.accept){
flag=true;
break;
}
}
if(!flag){
return false;
}
}
return true;
},copyState:function(_185,self){
if(_185){
return true;
}
if(arguments.length<2){
self=this==dojo.dnd.manager().target;
}
if(self){
if(this.copyOnly){
return this.selfCopy;
}
}else{
return this.copyOnly;
}
return false;
},destroy:function(){
dojo.dnd.Source.superclass.destroy.call(this);
dojo.forEach(this.topics,dojo.unsubscribe);
this.targetAnchor=null;
},markupFactory:function(_186,node){
_186._skipStartup=true;
return new dojo.dnd.Source(node,_186);
},onMouseMove:function(e){
if(this.isDragging&&this.targetState=="Disabled"){
return;
}
dojo.dnd.Source.superclass.onMouseMove.call(this,e);
var m=dojo.dnd.manager();
if(!this.isDragging){
if(this.mouseDown&&this.isSource&&(Math.abs(e.pageX-this._lastX)>this.delay||Math.abs(e.pageY-this._lastY)>this.delay)){
var _187=this.getSelectedNodes();
if(_187.length){
m.startDrag(this,_187,this.copyState(dojo.isCopyKey(e),true));
}
}
}
if(this.isDragging){
var _188=false;
if(this.current){
if(!this.targetBox||this.targetAnchor!=this.current){
this.targetBox=dojo.position(this.current,true);
}
if(this.horizontal){
_188=(e.pageX-this.targetBox.x)<(this.targetBox.w/2);
}else{
_188=(e.pageY-this.targetBox.y)<(this.targetBox.h/2);
}
}
if(this.current!=this.targetAnchor||_188!=this.before){
this._markTargetAnchor(_188);
m.canDrop(!this.current||m.source!=this||!(this.current.id in this.selection));
}
}
},onMouseDown:function(e){
if(!this.mouseDown&&this._legalMouseDown(e)&&(!this.skipForm||!dojo.dnd.isFormElement(e))){
this.mouseDown=true;
this._lastX=e.pageX;
this._lastY=e.pageY;
dojo.dnd.Source.superclass.onMouseDown.call(this,e);
}
},onMouseUp:function(e){
if(this.mouseDown){
this.mouseDown=false;
dojo.dnd.Source.superclass.onMouseUp.call(this,e);
}
},onDndSourceOver:function(_189){
if(this!=_189){
this.mouseDown=false;
if(this.targetAnchor){
this._unmarkTargetAnchor();
}
}else{
if(this.isDragging){
var m=dojo.dnd.manager();
m.canDrop(this.targetState!="Disabled"&&(!this.current||m.source!=this||!(this.current.id in this.selection)));
}
}
},onDndStart:function(_18a,_18b,copy){
if(this.autoSync){
this.sync();
}
if(this.isSource){
this._changeState("Source",this==_18a?(copy?"Copied":"Moved"):"");
}
var _18c=this.accept&&this.checkAcceptance(_18a,_18b);
this._changeState("Target",_18c?"":"Disabled");
if(this==_18a){
dojo.dnd.manager().overSource(this);
}
this.isDragging=true;
},onDndDrop:function(_18d,_18e,copy,_18f){
if(this==_18f){
this.onDrop(_18d,_18e,copy);
}
this.onDndCancel();
},onDndCancel:function(){
if(this.targetAnchor){
this._unmarkTargetAnchor();
this.targetAnchor=null;
}
this.before=true;
this.isDragging=false;
this.mouseDown=false;
this._changeState("Source","");
this._changeState("Target","");
},onDrop:function(_190,_191,copy){
if(this!=_190){
this.onDropExternal(_190,_191,copy);
}else{
this.onDropInternal(_191,copy);
}
},onDropExternal:function(_192,_193,copy){
var _194=this._normalizedCreator;
if(this.creator){
this._normalizedCreator=function(node,hint){
return _194.call(this,_192.getItem(node.id).data,hint);
};
}else{
if(copy){
this._normalizedCreator=function(node,hint){
var t=_192.getItem(node.id);
var n=node.cloneNode(true);
n.id=dojo.dnd.getUniqueId();
return {node:n,data:t.data,type:t.type};
};
}else{
this._normalizedCreator=function(node,hint){
var t=_192.getItem(node.id);
_192.delItem(node.id);
return {node:node,data:t.data,type:t.type};
};
}
}
this.selectNone();
if(!copy&&!this.creator){
_192.selectNone();
}
this.insertNodes(true,_193,this.before,this.current);
if(!copy&&this.creator){
_192.deleteSelectedNodes();
}
this._normalizedCreator=_194;
},onDropInternal:function(_195,copy){
var _196=this._normalizedCreator;
if(this.current&&this.current.id in this.selection){
return;
}
if(copy){
if(this.creator){
this._normalizedCreator=function(node,hint){
return _196.call(this,this.getItem(node.id).data,hint);
};
}else{
this._normalizedCreator=function(node,hint){
var t=this.getItem(node.id);
var n=node.cloneNode(true);
n.id=dojo.dnd.getUniqueId();
return {node:n,data:t.data,type:t.type};
};
}
}else{
if(!this.current){
return;
}
this._normalizedCreator=function(node,hint){
var t=this.getItem(node.id);
return {node:node,data:t.data,type:t.type};
};
}
this._removeSelection();
this.insertNodes(true,_195,this.before,this.current);
this._normalizedCreator=_196;
},onDraggingOver:function(){
},onDraggingOut:function(){
},onOverEvent:function(){
dojo.dnd.Source.superclass.onOverEvent.call(this);
dojo.dnd.manager().overSource(this);
if(this.isDragging&&this.targetState!="Disabled"){
this.onDraggingOver();
}
},onOutEvent:function(){
dojo.dnd.Source.superclass.onOutEvent.call(this);
dojo.dnd.manager().outSource(this);
if(this.isDragging&&this.targetState!="Disabled"){
this.onDraggingOut();
}
},_markTargetAnchor:function(_197){
if(this.current==this.targetAnchor&&this.before==_197){
return;
}
if(this.targetAnchor){
this._removeItemClass(this.targetAnchor,this.before?"Before":"After");
}
this.targetAnchor=this.current;
this.targetBox=null;
this.before=_197;
if(this.targetAnchor){
this._addItemClass(this.targetAnchor,this.before?"Before":"After");
}
},_unmarkTargetAnchor:function(){
if(!this.targetAnchor){
return;
}
this._removeItemClass(this.targetAnchor,this.before?"Before":"After");
this.targetAnchor=null;
this.targetBox=null;
this.before=true;
},_markDndStatus:function(copy){
this._changeState("Source",copy?"Copied":"Moved");
},_legalMouseDown:function(e){
if(!dojo.mouseButtons.isLeft(e)){
return false;
}
if(!this.withHandles){
return true;
}
for(var node=e.target;node&&node!==this.node;node=node.parentNode){
if(dojo.hasClass(node,"dojoDndHandle")){
return true;
}
if(dojo.hasClass(node,"dojoDndItem")||dojo.hasClass(node,"dojoDndIgnore")){
break;
}
}
return false;
}});
dojo.declare("dojo.dnd.Target",dojo.dnd.Source,{constructor:function(node,_198){
this.isSource=false;
dojo.removeClass(this.node,"dojoDndSource");
},markupFactory:function(_199,node){
_199._skipStartup=true;
return new dojo.dnd.Target(node,_199);
}});
dojo.declare("dojo.dnd.AutoSource",dojo.dnd.Source,{constructor:function(node,_19a){
this.autoSync=true;
},markupFactory:function(_19b,node){
_19b._skipStartup=true;
return new dojo.dnd.AutoSource(node,_19b);
}});
}
if(!dojo._hasResource["dojo.dnd.TimedMoveable"]){
dojo._hasResource["dojo.dnd.TimedMoveable"]=true;
dojo.provide("dojo.dnd.TimedMoveable");
(function(){
var _19c=dojo.dnd.Moveable.prototype.onMove;
dojo.declare("dojo.dnd.TimedMoveable",dojo.dnd.Moveable,{timeout:40,constructor:function(node,_19d){
if(!_19d){
_19d={};
}
if(_19d.timeout&&typeof _19d.timeout=="number"&&_19d.timeout>=0){
this.timeout=_19d.timeout;
}
},markupFactory:function(_19e,node){
return new dojo.dnd.TimedMoveable(node,_19e);
},onMoveStop:function(_19f){
if(_19f._timer){
clearTimeout(_19f._timer);
_19c.call(this,_19f,_19f._leftTop);
}
dojo.dnd.Moveable.prototype.onMoveStop.apply(this,arguments);
},onMove:function(_1a0,_1a1){
_1a0._leftTop=_1a1;
if(!_1a0._timer){
var _1a2=this;
_1a0._timer=setTimeout(function(){
_1a0._timer=null;
_19c.call(_1a2,_1a0,_1a0._leftTop);
},this.timeout);
}
}});
})();
}
if(!dojo._hasResource["dojo.fx.Toggler"]){
dojo._hasResource["dojo.fx.Toggler"]=true;
dojo.provide("dojo.fx.Toggler");
dojo.declare("dojo.fx.Toggler",null,{node:null,showFunc:dojo.fadeIn,hideFunc:dojo.fadeOut,showDuration:200,hideDuration:200,constructor:function(args){
var _1a3=this;
dojo.mixin(_1a3,args);
_1a3.node=args.node;
_1a3._showArgs=dojo.mixin({},args);
_1a3._showArgs.node=_1a3.node;
_1a3._showArgs.duration=_1a3.showDuration;
_1a3.showAnim=_1a3.showFunc(_1a3._showArgs);
_1a3._hideArgs=dojo.mixin({},args);
_1a3._hideArgs.node=_1a3.node;
_1a3._hideArgs.duration=_1a3.hideDuration;
_1a3.hideAnim=_1a3.hideFunc(_1a3._hideArgs);
dojo.connect(_1a3.showAnim,"beforeBegin",dojo.hitch(_1a3.hideAnim,"stop",true));
dojo.connect(_1a3.hideAnim,"beforeBegin",dojo.hitch(_1a3.showAnim,"stop",true));
},show:function(_1a4){
return this.showAnim.play(_1a4||0);
},hide:function(_1a5){
return this.hideAnim.play(_1a5||0);
}});
}
if(!dojo._hasResource["dojo.fx"]){
dojo._hasResource["dojo.fx"]=true;
dojo.provide("dojo.fx");
(function(){
var d=dojo,_1a6={_fire:function(evt,args){
if(this[evt]){
this[evt].apply(this,args||[]);
}
return this;
}};
var _1a7=function(_1a8){
this._index=-1;
this._animations=_1a8||[];
this._current=this._onAnimateCtx=this._onEndCtx=null;
this.duration=0;
d.forEach(this._animations,function(a){
this.duration+=a.duration;
if(a.delay){
this.duration+=a.delay;
}
},this);
};
d.extend(_1a7,{_onAnimate:function(){
this._fire("onAnimate",arguments);
},_onEnd:function(){
d.disconnect(this._onAnimateCtx);
d.disconnect(this._onEndCtx);
this._onAnimateCtx=this._onEndCtx=null;
if(this._index+1==this._animations.length){
this._fire("onEnd");
}else{
this._current=this._animations[++this._index];
this._onAnimateCtx=d.connect(this._current,"onAnimate",this,"_onAnimate");
this._onEndCtx=d.connect(this._current,"onEnd",this,"_onEnd");
this._current.play(0,true);
}
},play:function(_1a9,_1aa){
if(!this._current){
this._current=this._animations[this._index=0];
}
if(!_1aa&&this._current.status()=="playing"){
return this;
}
var _1ab=d.connect(this._current,"beforeBegin",this,function(){
this._fire("beforeBegin");
}),_1ac=d.connect(this._current,"onBegin",this,function(arg){
this._fire("onBegin",arguments);
}),_1ad=d.connect(this._current,"onPlay",this,function(arg){
this._fire("onPlay",arguments);
d.disconnect(_1ab);
d.disconnect(_1ac);
d.disconnect(_1ad);
});
if(this._onAnimateCtx){
d.disconnect(this._onAnimateCtx);
}
this._onAnimateCtx=d.connect(this._current,"onAnimate",this,"_onAnimate");
if(this._onEndCtx){
d.disconnect(this._onEndCtx);
}
this._onEndCtx=d.connect(this._current,"onEnd",this,"_onEnd");
this._current.play.apply(this._current,arguments);
return this;
},pause:function(){
if(this._current){
var e=d.connect(this._current,"onPause",this,function(arg){
this._fire("onPause",arguments);
d.disconnect(e);
});
this._current.pause();
}
return this;
},gotoPercent:function(_1ae,_1af){
this.pause();
var _1b0=this.duration*_1ae;
this._current=null;
d.some(this._animations,function(a){
if(a.duration<=_1b0){
this._current=a;
return true;
}
_1b0-=a.duration;
return false;
});
if(this._current){
this._current.gotoPercent(_1b0/this._current.duration,_1af);
}
return this;
},stop:function(_1b1){
if(this._current){
if(_1b1){
for(;this._index+1<this._animations.length;++this._index){
this._animations[this._index].stop(true);
}
this._current=this._animations[this._index];
}
var e=d.connect(this._current,"onStop",this,function(arg){
this._fire("onStop",arguments);
d.disconnect(e);
});
this._current.stop();
}
return this;
},status:function(){
return this._current?this._current.status():"stopped";
},destroy:function(){
if(this._onAnimateCtx){
d.disconnect(this._onAnimateCtx);
}
if(this._onEndCtx){
d.disconnect(this._onEndCtx);
}
}});
d.extend(_1a7,_1a6);
dojo.fx.chain=function(_1b2){
return new _1a7(_1b2);
};
var _1b3=function(_1b4){
this._animations=_1b4||[];
this._connects=[];
this._finished=0;
this.duration=0;
d.forEach(_1b4,function(a){
var _1b5=a.duration;
if(a.delay){
_1b5+=a.delay;
}
if(this.duration<_1b5){
this.duration=_1b5;
}
this._connects.push(d.connect(a,"onEnd",this,"_onEnd"));
},this);
this._pseudoAnimation=new d.Animation({curve:[0,1],duration:this.duration});
var self=this;
d.forEach(["beforeBegin","onBegin","onPlay","onAnimate","onPause","onStop","onEnd"],function(evt){
self._connects.push(d.connect(self._pseudoAnimation,evt,function(){
self._fire(evt,arguments);
}));
});
};
d.extend(_1b3,{_doAction:function(_1b6,args){
d.forEach(this._animations,function(a){
a[_1b6].apply(a,args);
});
return this;
},_onEnd:function(){
if(++this._finished>this._animations.length){
this._fire("onEnd");
}
},_call:function(_1b7,args){
var t=this._pseudoAnimation;
t[_1b7].apply(t,args);
},play:function(_1b8,_1b9){
this._finished=0;
this._doAction("play",arguments);
this._call("play",arguments);
return this;
},pause:function(){
this._doAction("pause",arguments);
this._call("pause",arguments);
return this;
},gotoPercent:function(_1ba,_1bb){
var ms=this.duration*_1ba;
d.forEach(this._animations,function(a){
a.gotoPercent(a.duration<ms?1:(ms/a.duration),_1bb);
});
this._call("gotoPercent",arguments);
return this;
},stop:function(_1bc){
this._doAction("stop",arguments);
this._call("stop",arguments);
return this;
},status:function(){
return this._pseudoAnimation.status();
},destroy:function(){
d.forEach(this._connects,dojo.disconnect);
}});
d.extend(_1b3,_1a6);
dojo.fx.combine=function(_1bd){
return new _1b3(_1bd);
};
dojo.fx.wipeIn=function(args){
var node=args.node=d.byId(args.node),s=node.style,o;
var anim=d.animateProperty(d.mixin({properties:{height:{start:function(){
o=s.overflow;
s.overflow="hidden";
if(s.visibility=="hidden"||s.display=="none"){
s.height="1px";
s.display="";
s.visibility="";
return 1;
}else{
var _1be=d.style(node,"height");
return Math.max(_1be,1);
}
},end:function(){
return node.scrollHeight;
}}}},args));
d.connect(anim,"onEnd",function(){
s.height="auto";
s.overflow=o;
});
return anim;
};
dojo.fx.wipeOut=function(args){
var node=args.node=d.byId(args.node),s=node.style,o;
var anim=d.animateProperty(d.mixin({properties:{height:{end:1}}},args));
d.connect(anim,"beforeBegin",function(){
o=s.overflow;
s.overflow="hidden";
s.display="";
});
d.connect(anim,"onEnd",function(){
s.overflow=o;
s.height="auto";
s.display="none";
});
return anim;
};
dojo.fx.slideTo=function(args){
var node=args.node=d.byId(args.node),top=null,left=null;
var init=(function(n){
return function(){
var cs=d.getComputedStyle(n);
var pos=cs.position;
top=(pos=="absolute"?n.offsetTop:parseInt(cs.top)||0);
left=(pos=="absolute"?n.offsetLeft:parseInt(cs.left)||0);
if(pos!="absolute"&&pos!="relative"){
var ret=d.position(n,true);
top=ret.y;
left=ret.x;
n.style.position="absolute";
n.style.top=top+"px";
n.style.left=left+"px";
}
};
})(node);
init();
var anim=d.animateProperty(d.mixin({properties:{top:args.top||0,left:args.left||0}},args));
d.connect(anim,"beforeBegin",anim,init);
return anim;
};
})();
}
if(!dojo._hasResource["dijit._base.manager"]){
dojo._hasResource["dijit._base.manager"]=true;
dojo.provide("dijit._base.manager");
dojo.declare("dijit.WidgetSet",null,{constructor:function(){
this._hash={};
this.length=0;
},add:function(_1bf){
if(this._hash[_1bf.id]){
throw new Error("Tried to register widget with id=="+_1bf.id+" but that id is already registered");
}
this._hash[_1bf.id]=_1bf;
this.length++;
},remove:function(id){
if(this._hash[id]){
delete this._hash[id];
this.length--;
}
},forEach:function(func,_1c0){
_1c0=_1c0||dojo.global;
var i=0,id;
for(id in this._hash){
func.call(_1c0,this._hash[id],i++,this._hash);
}
return this;
},filter:function(_1c1,_1c2){
_1c2=_1c2||dojo.global;
var res=new dijit.WidgetSet(),i=0,id;
for(id in this._hash){
var w=this._hash[id];
if(_1c1.call(_1c2,w,i++,this._hash)){
res.add(w);
}
}
return res;
},byId:function(id){
return this._hash[id];
},byClass:function(cls){
var res=new dijit.WidgetSet(),id,_1c3;
for(id in this._hash){
_1c3=this._hash[id];
if(_1c3.declaredClass==cls){
res.add(_1c3);
}
}
return res;
},toArray:function(){
var ar=[];
for(var id in this._hash){
ar.push(this._hash[id]);
}
return ar;
},map:function(func,_1c4){
return dojo.map(this.toArray(),func,_1c4);
},every:function(func,_1c5){
_1c5=_1c5||dojo.global;
var x=0,i;
for(i in this._hash){
if(!func.call(_1c5,this._hash[i],x++,this._hash)){
return false;
}
}
return true;
},some:function(func,_1c6){
_1c6=_1c6||dojo.global;
var x=0,i;
for(i in this._hash){
if(func.call(_1c6,this._hash[i],x++,this._hash)){
return true;
}
}
return false;
}});
(function(){
dijit.registry=new dijit.WidgetSet();
var hash=dijit.registry._hash,attr=dojo.attr,_1c7=dojo.hasAttr,_1c8=dojo.style;
dijit.byId=function(id){
return typeof id=="string"?hash[id]:id;
};
var _1c9={};
dijit.getUniqueId=function(_1ca){
var id;
do{
id=_1ca+"_"+(_1ca in _1c9?++_1c9[_1ca]:_1c9[_1ca]=0);
}while(hash[id]);
return dijit._scopeName=="dijit"?id:dijit._scopeName+"_"+id;
};
dijit.findWidgets=function(root){
var _1cb=[];
function _1cc(root){
for(var node=root.firstChild;node;node=node.nextSibling){
if(node.nodeType==1){
var _1cd=node.getAttribute("widgetId");
if(_1cd){
var _1ce=hash[_1cd];
if(_1ce){
_1cb.push(_1ce);
}
}else{
_1cc(node);
}
}
}
};
_1cc(root);
return _1cb;
};
dijit._destroyAll=function(){
dijit._curFocus=null;
dijit._prevFocus=null;
dijit._activeStack=[];
dojo.forEach(dijit.findWidgets(dojo.body()),function(_1cf){
if(!_1cf._destroyed){
if(_1cf.destroyRecursive){
_1cf.destroyRecursive();
}else{
if(_1cf.destroy){
_1cf.destroy();
}
}
}
});
};
if(dojo.isIE){
dojo.addOnWindowUnload(function(){
dijit._destroyAll();
});
}
dijit.byNode=function(node){
return hash[node.getAttribute("widgetId")];
};
dijit.getEnclosingWidget=function(node){
while(node){
var id=node.getAttribute&&node.getAttribute("widgetId");
if(id){
return hash[id];
}
node=node.parentNode;
}
return null;
};
var _1d0=(dijit._isElementShown=function(elem){
var s=_1c8(elem);
return (s.visibility!="hidden")&&(s.visibility!="collapsed")&&(s.display!="none")&&(attr(elem,"type")!="hidden");
});
dijit.hasDefaultTabStop=function(elem){
switch(elem.nodeName.toLowerCase()){
case "a":
return _1c7(elem,"href");
case "area":
case "button":
case "input":
case "object":
case "select":
case "textarea":
return true;
case "iframe":
var body;
try{
var _1d1=elem.contentDocument;
if("designMode" in _1d1&&_1d1.designMode=="on"){
return true;
}
body=_1d1.body;
}
catch(e1){
try{
body=elem.contentWindow.document.body;
}
catch(e2){
return false;
}
}
return body.contentEditable=="true"||(body.firstChild&&body.firstChild.contentEditable=="true");
default:
return elem.contentEditable=="true";
}
};
var _1d2=(dijit.isTabNavigable=function(elem){
if(attr(elem,"disabled")){
return false;
}else{
if(_1c7(elem,"tabIndex")){
return attr(elem,"tabIndex")>=0;
}else{
return dijit.hasDefaultTabStop(elem);
}
}
});
dijit._getTabNavigable=function(root){
var _1d3,last,_1d4,_1d5,_1d6,_1d7,_1d8={};
function _1d9(node){
return node&&node.tagName.toLowerCase()=="input"&&node.type&&node.type.toLowerCase()=="radio"&&node.name&&node.name.toLowerCase();
};
var _1da=function(_1db){
dojo.query("> *",_1db).forEach(function(_1dc){
if((dojo.isIE&&_1dc.scopeName!=="HTML")||!_1d0(_1dc)){
return;
}
if(_1d2(_1dc)){
var _1dd=attr(_1dc,"tabIndex");
if(!_1c7(_1dc,"tabIndex")||_1dd==0){
if(!_1d3){
_1d3=_1dc;
}
last=_1dc;
}else{
if(_1dd>0){
if(!_1d4||_1dd<_1d5){
_1d5=_1dd;
_1d4=_1dc;
}
if(!_1d6||_1dd>=_1d7){
_1d7=_1dd;
_1d6=_1dc;
}
}
}
var rn=_1d9(_1dc);
if(dojo.attr(_1dc,"checked")&&rn){
_1d8[rn]=_1dc;
}
}
if(_1dc.nodeName.toUpperCase()!="SELECT"){
_1da(_1dc);
}
});
};
if(_1d0(root)){
_1da(root);
}
function rs(node){
return _1d8[_1d9(node)]||node;
};
return {first:rs(_1d3),last:rs(last),lowest:rs(_1d4),highest:rs(_1d6)};
};
dijit.getFirstInTabbingOrder=function(root){
var _1de=dijit._getTabNavigable(dojo.byId(root));
return _1de.lowest?_1de.lowest:_1de.first;
};
dijit.getLastInTabbingOrder=function(root){
var _1df=dijit._getTabNavigable(dojo.byId(root));
return _1df.last?_1df.last:_1df.highest;
};
dijit.defaultDuration=dojo.config["defaultDuration"]||200;
})();
}
if(!dojo._hasResource["dojo.Stateful"]){
dojo._hasResource["dojo.Stateful"]=true;
dojo.provide("dojo.Stateful");
dojo.declare("dojo.Stateful",null,{postscript:function(_1e0){
if(_1e0){
dojo.mixin(this,_1e0);
}
},get:function(name){
return this[name];
},set:function(name,_1e1){
if(typeof name==="object"){
for(var x in name){
this.set(x,name[x]);
}
return this;
}
var _1e2=this[name];
this[name]=_1e1;
if(this._watchCallbacks){
this._watchCallbacks(name,_1e2,_1e1);
}
return this;
},watch:function(name,_1e3){
var _1e4=this._watchCallbacks;
if(!_1e4){
var self=this;
_1e4=this._watchCallbacks=function(name,_1e5,_1e6,_1e7){
var _1e8=function(_1e9){
if(_1e9){
_1e9=_1e9.slice();
for(var i=0,l=_1e9.length;i<l;i++){
try{
_1e9[i].call(self,name,_1e5,_1e6);
}
catch(e){
console.error(e);
}
}
}
};
_1e8(_1e4["_"+name]);
if(!_1e7){
_1e8(_1e4["*"]);
}
};
}
if(!_1e3&&typeof name==="function"){
_1e3=name;
name="*";
}else{
name="_"+name;
}
var _1ea=_1e4[name];
if(typeof _1ea!=="object"){
_1ea=_1e4[name]=[];
}
_1ea.push(_1e3);
return {unwatch:function(){
_1ea.splice(dojo.indexOf(_1ea,_1e3),1);
}};
}});
}
if(!dojo._hasResource["dijit._WidgetBase"]){
dojo._hasResource["dijit._WidgetBase"]=true;
dojo.provide("dijit._WidgetBase");
(function(){
dojo.declare("dijit._WidgetBase",dojo.Stateful,{id:"",lang:"",dir:"","class":"",style:"",title:"",tooltip:"",baseClass:"",srcNodeRef:null,domNode:null,containerNode:null,attributeMap:{id:"",dir:"",lang:"","class":"",style:"",title:""},_blankGif:(dojo.config.blankGif||dojo.moduleUrl("dojo","resources/blank.gif")).toString(),postscript:function(_1eb,_1ec){
this.create(_1eb,_1ec);
},create:function(_1ed,_1ee){
this.srcNodeRef=dojo.byId(_1ee);
this._connects=[];
this._subscribes=[];
if(this.srcNodeRef&&(typeof this.srcNodeRef.id=="string")){
this.id=this.srcNodeRef.id;
}
if(_1ed){
this.params=_1ed;
dojo._mixin(this,_1ed);
}
this.postMixInProperties();
if(!this.id){
this.id=dijit.getUniqueId(this.declaredClass.replace(/\./g,"_"));
}
dijit.registry.add(this);
this.buildRendering();
if(this.domNode){
this._applyAttributes();
var _1ef=this.srcNodeRef;
if(_1ef&&_1ef.parentNode&&this.domNode!==_1ef){
_1ef.parentNode.replaceChild(this.domNode,_1ef);
}
}
if(this.domNode){
this.domNode.setAttribute("widgetId",this.id);
}
this.postCreate();
if(this.srcNodeRef&&!this.srcNodeRef.parentNode){
delete this.srcNodeRef;
}
this._created=true;
},_applyAttributes:function(){
var _1f0=function(attr,_1f1){
if((_1f1.params&&attr in _1f1.params)||_1f1[attr]){
_1f1.set(attr,_1f1[attr]);
}
};
for(var attr in this.attributeMap){
_1f0(attr,this);
}
dojo.forEach(this._getSetterAttributes(),function(a){
if(!(a in this.attributeMap)){
_1f0(a,this);
}
},this);
},_getSetterAttributes:function(){
var ctor=this.constructor;
if(!ctor._setterAttrs){
var r=(ctor._setterAttrs=[]),_1f2,_1f3=ctor.prototype;
for(var _1f4 in _1f3){
if(dojo.isFunction(_1f3[_1f4])&&(_1f2=_1f4.match(/^_set([a-zA-Z]*)Attr$/))&&_1f2[1]){
r.push(_1f2[1].charAt(0).toLowerCase()+_1f2[1].substr(1));
}
}
}
return ctor._setterAttrs;
},postMixInProperties:function(){
},buildRendering:function(){
if(!this.domNode){
this.domNode=this.srcNodeRef||dojo.create("div");
}
if(this.baseClass){
var _1f5=this.baseClass.split(" ");
if(!this.isLeftToRight()){
_1f5=_1f5.concat(dojo.map(_1f5,function(name){
return name+"Rtl";
}));
}
dojo.addClass(this.domNode,_1f5);
}
},postCreate:function(){
},startup:function(){
this._started=true;
},destroyRecursive:function(_1f6){
this._beingDestroyed=true;
this.destroyDescendants(_1f6);
this.destroy(_1f6);
},destroy:function(_1f7){
this._beingDestroyed=true;
this.uninitialize();
var d=dojo,dfe=d.forEach,dun=d.unsubscribe;
dfe(this._connects,function(_1f8){
dfe(_1f8,d.disconnect);
});
dfe(this._subscribes,function(_1f9){
dun(_1f9);
});
dfe(this._supportingWidgets||[],function(w){
if(w.destroyRecursive){
w.destroyRecursive();
}else{
if(w.destroy){
w.destroy();
}
}
});
this.destroyRendering(_1f7);
dijit.registry.remove(this.id);
this._destroyed=true;
},destroyRendering:function(_1fa){
if(this.bgIframe){
this.bgIframe.destroy(_1fa);
delete this.bgIframe;
}
if(this.domNode){
if(_1fa){
dojo.removeAttr(this.domNode,"widgetId");
}else{
dojo.destroy(this.domNode);
}
delete this.domNode;
}
if(this.srcNodeRef){
if(!_1fa){
dojo.destroy(this.srcNodeRef);
}
delete this.srcNodeRef;
}
},destroyDescendants:function(_1fb){
dojo.forEach(this.getChildren(),function(_1fc){
if(_1fc.destroyRecursive){
_1fc.destroyRecursive(_1fb);
}
});
},uninitialize:function(){
return false;
},_setClassAttr:function(_1fd){
var _1fe=this[this.attributeMap["class"]||"domNode"];
dojo.replaceClass(_1fe,_1fd,this["class"]);
this._set("class",_1fd);
},_setStyleAttr:function(_1ff){
var _200=this[this.attributeMap.style||"domNode"];
if(dojo.isObject(_1ff)){
dojo.style(_200,_1ff);
}else{
if(_200.style.cssText){
_200.style.cssText+="; "+_1ff;
}else{
_200.style.cssText=_1ff;
}
}
this._set("style",_1ff);
},_attrToDom:function(attr,_201){
var _202=this.attributeMap[attr];
dojo.forEach(dojo.isArray(_202)?_202:[_202],function(_203){
var _204=this[_203.node||_203||"domNode"];
var type=_203.type||"attribute";
switch(type){
case "attribute":
if(dojo.isFunction(_201)){
_201=dojo.hitch(this,_201);
}
var _205=_203.attribute?_203.attribute:(/^on[A-Z][a-zA-Z]*$/.test(attr)?attr.toLowerCase():attr);
dojo.attr(_204,_205,_201);
break;
case "innerText":
_204.innerHTML="";
_204.appendChild(dojo.doc.createTextNode(_201));
break;
case "innerHTML":
_204.innerHTML=_201;
break;
case "class":
dojo.replaceClass(_204,_201,this[attr]);
break;
}
},this);
},get:function(name){
var _206=this._getAttrNames(name);
return this[_206.g]?this[_206.g]():this[name];
},set:function(name,_207){
if(typeof name==="object"){
for(var x in name){
this.set(x,name[x]);
}
return this;
}
var _208=this._getAttrNames(name);
if(this[_208.s]){
var _209=this[_208.s].apply(this,Array.prototype.slice.call(arguments,1));
}else{
if(name in this.attributeMap){
this._attrToDom(name,_207);
}
this._set(name,_207);
}
return _209||this;
},_attrPairNames:{},_getAttrNames:function(name){
var apn=this._attrPairNames;
if(apn[name]){
return apn[name];
}
var uc=name.charAt(0).toUpperCase()+name.substr(1);
return (apn[name]={n:name+"Node",s:"_set"+uc+"Attr",g:"_get"+uc+"Attr"});
},_set:function(name,_20a){
var _20b=this[name];
this[name]=_20a;
if(this._watchCallbacks&&this._created&&_20a!==_20b){
this._watchCallbacks(name,_20b,_20a);
}
},toString:function(){
return "[Widget "+this.declaredClass+", "+(this.id||"NO ID")+"]";
},getDescendants:function(){
return this.containerNode?dojo.query("[widgetId]",this.containerNode).map(dijit.byNode):[];
},getChildren:function(){
return this.containerNode?dijit.findWidgets(this.containerNode):[];
},connect:function(obj,_20c,_20d){
var _20e=[dojo._connect(obj,_20c,this,_20d)];
this._connects.push(_20e);
return _20e;
},disconnect:function(_20f){
for(var i=0;i<this._connects.length;i++){
if(this._connects[i]==_20f){
dojo.forEach(_20f,dojo.disconnect);
this._connects.splice(i,1);
return;
}
}
},subscribe:function(_210,_211){
var _212=dojo.subscribe(_210,this,_211);
this._subscribes.push(_212);
return _212;
},unsubscribe:function(_213){
for(var i=0;i<this._subscribes.length;i++){
if(this._subscribes[i]==_213){
dojo.unsubscribe(_213);
this._subscribes.splice(i,1);
return;
}
}
},isLeftToRight:function(){
return this.dir?(this.dir=="ltr"):dojo._isBodyLtr();
},placeAt:function(_214,_215){
if(_214.declaredClass&&_214.addChild){
_214.addChild(this,_215);
}else{
dojo.place(this.domNode,_214,_215);
}
return this;
}});
})();
}
if(!dojo._hasResource["dijit._base.focus"]){
dojo._hasResource["dijit._base.focus"]=true;
dojo.provide("dijit._base.focus");
dojo.mixin(dijit,{_curFocus:null,_prevFocus:null,isCollapsed:function(){
return dijit.getBookmark().isCollapsed;
},getBookmark:function(){
var bm,rg,tg,sel=dojo.doc.selection,cf=dijit._curFocus;
if(dojo.global.getSelection){
sel=dojo.global.getSelection();
if(sel){
if(sel.isCollapsed){
tg=cf?cf.tagName:"";
if(tg){
tg=tg.toLowerCase();
if(tg=="textarea"||(tg=="input"&&(!cf.type||cf.type.toLowerCase()=="text"))){
sel={start:cf.selectionStart,end:cf.selectionEnd,node:cf,pRange:true};
return {isCollapsed:(sel.end<=sel.start),mark:sel};
}
}
bm={isCollapsed:true};
}else{
rg=sel.getRangeAt(0);
bm={isCollapsed:false,mark:rg.cloneRange()};
}
}
}else{
if(sel){
tg=cf?cf.tagName:"";
tg=tg.toLowerCase();
if(cf&&tg&&(tg=="button"||tg=="textarea"||tg=="input")){
if(sel.type&&sel.type.toLowerCase()=="none"){
return {isCollapsed:true,mark:null};
}else{
rg=sel.createRange();
return {isCollapsed:rg.text&&rg.text.length?false:true,mark:{range:rg,pRange:true}};
}
}
bm={};
try{
rg=sel.createRange();
bm.isCollapsed=!(sel.type=="Text"?rg.htmlText.length:rg.length);
}
catch(e){
bm.isCollapsed=true;
return bm;
}
if(sel.type.toUpperCase()=="CONTROL"){
if(rg.length){
bm.mark=[];
var i=0,len=rg.length;
while(i<len){
bm.mark.push(rg.item(i++));
}
}else{
bm.isCollapsed=true;
bm.mark=null;
}
}else{
bm.mark=rg.getBookmark();
}
}else{
console.warn("No idea how to store the current selection for this browser!");
}
}
return bm;
},moveToBookmark:function(_216){
var _217=dojo.doc,mark=_216.mark;
if(mark){
if(dojo.global.getSelection){
var sel=dojo.global.getSelection();
if(sel&&sel.removeAllRanges){
if(mark.pRange){
var r=mark;
var n=r.node;
n.selectionStart=r.start;
n.selectionEnd=r.end;
}else{
sel.removeAllRanges();
sel.addRange(mark);
}
}else{
console.warn("No idea how to restore selection for this browser!");
}
}else{
if(_217.selection&&mark){
var rg;
if(mark.pRange){
rg=mark.range;
}else{
if(dojo.isArray(mark)){
rg=_217.body.createControlRange();
dojo.forEach(mark,function(n){
rg.addElement(n);
});
}else{
rg=_217.body.createTextRange();
rg.moveToBookmark(mark);
}
}
rg.select();
}
}
}
},getFocus:function(menu,_218){
var node=!dijit._curFocus||(menu&&dojo.isDescendant(dijit._curFocus,menu.domNode))?dijit._prevFocus:dijit._curFocus;
return {node:node,bookmark:(node==dijit._curFocus)&&dojo.withGlobal(_218||dojo.global,dijit.getBookmark),openedForWindow:_218};
},focus:function(_219){
if(!_219){
return;
}
var node="node" in _219?_219.node:_219,_21a=_219.bookmark,_21b=_219.openedForWindow,_21c=_21a?_21a.isCollapsed:false;
if(node){
var _21d=(node.tagName.toLowerCase()=="iframe")?node.contentWindow:node;
if(_21d&&_21d.focus){
try{
_21d.focus();
}
catch(e){
}
}
dijit._onFocusNode(node);
}
if(_21a&&dojo.withGlobal(_21b||dojo.global,dijit.isCollapsed)&&!_21c){
if(_21b){
_21b.focus();
}
try{
dojo.withGlobal(_21b||dojo.global,dijit.moveToBookmark,null,[_21a]);
}
catch(e2){
}
}
},_activeStack:[],registerIframe:function(_21e){
return dijit.registerWin(_21e.contentWindow,_21e);
},unregisterIframe:function(_21f){
dijit.unregisterWin(_21f);
},registerWin:function(_220,_221){
var _222=function(evt){
dijit._justMouseDowned=true;
setTimeout(function(){
dijit._justMouseDowned=false;
},0);
if(dojo.isIE&&evt&&evt.srcElement&&evt.srcElement.parentNode==null){
return;
}
dijit._onTouchNode(_221||evt.target||evt.srcElement,"mouse");
};
var doc=dojo.isIE?_220.document.documentElement:_220.document;
if(doc){
if(dojo.isIE){
_220.document.body.attachEvent("onmousedown",_222);
var _223=function(evt){
if(evt.srcElement.tagName.toLowerCase()!="#document"&&dijit.isTabNavigable(evt.srcElement)){
dijit._onFocusNode(_221||evt.srcElement);
}else{
dijit._onTouchNode(_221||evt.srcElement);
}
};
doc.attachEvent("onactivate",_223);
var _224=function(evt){
dijit._onBlurNode(_221||evt.srcElement);
};
doc.attachEvent("ondeactivate",_224);
return function(){
_220.document.detachEvent("onmousedown",_222);
doc.detachEvent("onactivate",_223);
doc.detachEvent("ondeactivate",_224);
doc=null;
};
}else{
doc.body.addEventListener("mousedown",_222,true);
var _225=function(evt){
dijit._onFocusNode(_221||evt.target);
};
doc.addEventListener("focus",_225,true);
var _226=function(evt){
dijit._onBlurNode(_221||evt.target);
};
doc.addEventListener("blur",_226,true);
return function(){
doc.body.removeEventListener("mousedown",_222,true);
doc.removeEventListener("focus",_225,true);
doc.removeEventListener("blur",_226,true);
doc=null;
};
}
}
},unregisterWin:function(_227){
_227&&_227();
},_onBlurNode:function(node){
dijit._prevFocus=dijit._curFocus;
dijit._curFocus=null;
if(dijit._justMouseDowned){
return;
}
if(dijit._clearActiveWidgetsTimer){
clearTimeout(dijit._clearActiveWidgetsTimer);
}
dijit._clearActiveWidgetsTimer=setTimeout(function(){
delete dijit._clearActiveWidgetsTimer;
dijit._setStack([]);
dijit._prevFocus=null;
},100);
},_onTouchNode:function(node,by){
if(dijit._clearActiveWidgetsTimer){
clearTimeout(dijit._clearActiveWidgetsTimer);
delete dijit._clearActiveWidgetsTimer;
}
var _228=[];
try{
while(node){
var _229=dojo.attr(node,"dijitPopupParent");
if(_229){
node=dijit.byId(_229).domNode;
}else{
if(node.tagName&&node.tagName.toLowerCase()=="body"){
if(node===dojo.body()){
break;
}
node=dojo.window.get(node.ownerDocument).frameElement;
}else{
var id=node.getAttribute&&node.getAttribute("widgetId"),_22a=id&&dijit.byId(id);
if(_22a&&!(by=="mouse"&&_22a.get("disabled"))){
_228.unshift(id);
}
node=node.parentNode;
}
}
}
}
catch(e){
}
dijit._setStack(_228,by);
},_onFocusNode:function(node){
if(!node){
return;
}
if(node.nodeType==9){
return;
}
dijit._onTouchNode(node);
if(node==dijit._curFocus){
return;
}
if(dijit._curFocus){
dijit._prevFocus=dijit._curFocus;
}
dijit._curFocus=node;
dojo.publish("focusNode",[node]);
},_setStack:function(_22b,by){
var _22c=dijit._activeStack;
dijit._activeStack=_22b;
for(var _22d=0;_22d<Math.min(_22c.length,_22b.length);_22d++){
if(_22c[_22d]!=_22b[_22d]){
break;
}
}
var _22e;
for(var i=_22c.length-1;i>=_22d;i--){
_22e=dijit.byId(_22c[i]);
if(_22e){
_22e._focused=false;
_22e.set("focused",false);
_22e._hasBeenBlurred=true;
if(_22e._onBlur){
_22e._onBlur(by);
}
dojo.publish("widgetBlur",[_22e,by]);
}
}
for(i=_22d;i<_22b.length;i++){
_22e=dijit.byId(_22b[i]);
if(_22e){
_22e._focused=true;
_22e.set("focused",true);
if(_22e._onFocus){
_22e._onFocus(by);
}
dojo.publish("widgetFocus",[_22e,by]);
}
}
}});
dojo.addOnLoad(function(){
var _22f=dijit.registerWin(window);
if(dojo.isIE){
dojo.addOnWindowUnload(function(){
dijit.unregisterWin(_22f);
_22f=null;
});
}
});
}
if(!dojo._hasResource["dojo.AdapterRegistry"]){
dojo._hasResource["dojo.AdapterRegistry"]=true;
dojo.provide("dojo.AdapterRegistry");
dojo.AdapterRegistry=function(_230){
this.pairs=[];
this.returnWrappers=_230||false;
};
dojo.extend(dojo.AdapterRegistry,{register:function(name,_231,wrap,_232,_233){
this.pairs[((_233)?"unshift":"push")]([name,_231,wrap,_232]);
},match:function(){
for(var i=0;i<this.pairs.length;i++){
var pair=this.pairs[i];
if(pair[1].apply(this,arguments)){
if((pair[3])||(this.returnWrappers)){
return pair[2];
}else{
return pair[2].apply(this,arguments);
}
}
}
throw new Error("No match found");
},unregister:function(name){
for(var i=0;i<this.pairs.length;i++){
var pair=this.pairs[i];
if(pair[0]==name){
this.pairs.splice(i,1);
return true;
}
}
return false;
}});
}
if(!dojo._hasResource["dijit._base.place"]){
dojo._hasResource["dijit._base.place"]=true;
dojo.provide("dijit._base.place");
dijit.getViewport=function(){
return dojo.window.getBox();
};
dijit.placeOnScreen=function(node,pos,_234,_235){
var _236=dojo.map(_234,function(_237){
var c={corner:_237,pos:{x:pos.x,y:pos.y}};
if(_235){
c.pos.x+=_237.charAt(1)=="L"?_235.x:-_235.x;
c.pos.y+=_237.charAt(0)=="T"?_235.y:-_235.y;
}
return c;
});
return dijit._place(node,_236);
};
dijit._place=function(node,_238,_239,_23a){
var view=dojo.window.getBox();
if(!node.parentNode||String(node.parentNode.tagName).toLowerCase()!="body"){
dojo.body().appendChild(node);
}
var best=null;
dojo.some(_238,function(_23b){
var _23c=_23b.corner;
var pos=_23b.pos;
var _23d=0;
var _23e={w:_23c.charAt(1)=="L"?(view.l+view.w)-pos.x:pos.x-view.l,h:_23c.charAt(1)=="T"?(view.t+view.h)-pos.y:pos.y-view.t};
if(_239){
var res=_239(node,_23b.aroundCorner,_23c,_23e,_23a);
_23d=typeof res=="undefined"?0:res;
}
var _23f=node.style;
var _240=_23f.display;
var _241=_23f.visibility;
_23f.visibility="hidden";
_23f.display="";
var mb=dojo.marginBox(node);
_23f.display=_240;
_23f.visibility=_241;
var _242=Math.max(view.l,_23c.charAt(1)=="L"?pos.x:(pos.x-mb.w)),_243=Math.max(view.t,_23c.charAt(0)=="T"?pos.y:(pos.y-mb.h)),endX=Math.min(view.l+view.w,_23c.charAt(1)=="L"?(_242+mb.w):pos.x),endY=Math.min(view.t+view.h,_23c.charAt(0)=="T"?(_243+mb.h):pos.y),_244=endX-_242,_245=endY-_243;
_23d+=(mb.w-_244)+(mb.h-_245);
if(best==null||_23d<best.overflow){
best={corner:_23c,aroundCorner:_23b.aroundCorner,x:_242,y:_243,w:_244,h:_245,overflow:_23d,spaceAvailable:_23e};
}
return !_23d;
});
if(best.overflow&&_239){
_239(node,best.aroundCorner,best.corner,best.spaceAvailable,_23a);
}
var l=dojo._isBodyLtr(),s=node.style;
s.top=best.y+"px";
s[l?"left":"right"]=(l?best.x:view.w-best.x-best.w)+"px";
return best;
};
dijit.placeOnScreenAroundNode=function(node,_246,_247,_248){
_246=dojo.byId(_246);
var _249=dojo.position(_246,true);
return dijit._placeOnScreenAroundRect(node,_249.x,_249.y,_249.w,_249.h,_247,_248);
};
dijit.placeOnScreenAroundRectangle=function(node,_24a,_24b,_24c){
return dijit._placeOnScreenAroundRect(node,_24a.x,_24a.y,_24a.width,_24a.height,_24b,_24c);
};
dijit._placeOnScreenAroundRect=function(node,x,y,_24d,_24e,_24f,_250){
var _251=[];
for(var _252 in _24f){
_251.push({aroundCorner:_252,corner:_24f[_252],pos:{x:x+(_252.charAt(1)=="L"?0:_24d),y:y+(_252.charAt(0)=="T"?0:_24e)}});
}
return dijit._place(node,_251,_250,{w:_24d,h:_24e});
};
dijit.placementRegistry=new dojo.AdapterRegistry();
dijit.placementRegistry.register("node",function(n,x){
return typeof x=="object"&&typeof x.offsetWidth!="undefined"&&typeof x.offsetHeight!="undefined";
},dijit.placeOnScreenAroundNode);
dijit.placementRegistry.register("rect",function(n,x){
return typeof x=="object"&&"x" in x&&"y" in x&&"width" in x&&"height" in x;
},dijit.placeOnScreenAroundRectangle);
dijit.placeOnScreenAroundElement=function(node,_253,_254,_255){
return dijit.placementRegistry.match.apply(dijit.placementRegistry,arguments);
};
dijit.getPopupAroundAlignment=function(_256,_257){
var _258={};
dojo.forEach(_256,function(pos){
switch(pos){
case "after":
_258[_257?"BR":"BL"]=_257?"BL":"BR";
break;
case "before":
_258[_257?"BL":"BR"]=_257?"BR":"BL";
break;
case "below-alt":
_257=!_257;
case "below":
_258[_257?"BL":"BR"]=_257?"TL":"TR";
_258[_257?"BR":"BL"]=_257?"TR":"TL";
break;
case "above-alt":
_257=!_257;
case "above":
default:
_258[_257?"TL":"TR"]=_257?"BL":"BR";
_258[_257?"TR":"TL"]=_257?"BR":"BL";
break;
}
});
return _258;
};
}
if(!dojo._hasResource["dijit._base.window"]){
dojo._hasResource["dijit._base.window"]=true;
dojo.provide("dijit._base.window");
dijit.getDocumentWindow=function(doc){
return dojo.window.get(doc);
};
}
if(!dojo._hasResource["dijit._base.popup"]){
dojo._hasResource["dijit._base.popup"]=true;
dojo.provide("dijit._base.popup");
dijit.popup={_stack:[],_beginZIndex:1000,_idGen:1,_createWrapper:function(_259){
var _25a=_259.declaredClass?_259._popupWrapper:(dojo.hasClass(_259.parentNode,"dijitPopup")&&_259.parentNode),node=_259.domNode||_259;
if(!_25a){
_25a=dojo.create("div",{"class":"dijitPopup",style:{display:"none"},role:"presentation"},dojo.body());
_25a.appendChild(node);
var s=node.style;
s.display="";
s.visibility="";
s.position="";
s.top="0px";
if(_259.declaredClass){
_259._popupWrapper=_25a;
dojo.connect(_259,"destroy",function(){
dojo.destroy(_25a);
delete _259._popupWrapper;
});
}
}
return _25a;
},moveOffScreen:function(_25b){
var _25c=this._createWrapper(_25b);
dojo.style(_25c,{visibility:"hidden",top:"-9999px",display:""});
},hide:function(_25d){
var _25e=this._createWrapper(_25d);
dojo.style(_25e,"display","none");
},getTopPopup:function(){
var _25f=this._stack;
for(var pi=_25f.length-1;pi>0&&_25f[pi].parent===_25f[pi-1].widget;pi--){
}
return _25f[pi];
},open:function(args){
var _260=this._stack,_261=args.popup,_262=args.orient||((args.parent?args.parent.isLeftToRight():dojo._isBodyLtr())?{"BL":"TL","BR":"TR","TL":"BL","TR":"BR"}:{"BR":"TR","BL":"TL","TR":"BR","TL":"BL"}),_263=args.around,id=(args.around&&args.around.id)?(args.around.id+"_dropdown"):("popup_"+this._idGen++);
while(_260.length&&(!args.parent||!dojo.isDescendant(args.parent.domNode,_260[_260.length-1].widget.domNode))){
dijit.popup.close(_260[_260.length-1].widget);
}
var _264=this._createWrapper(_261);
dojo.attr(_264,{id:id,style:{zIndex:this._beginZIndex+_260.length},"class":"dijitPopup "+(_261.baseClass||_261["class"]||"").split(" ")[0]+"Popup",dijitPopupParent:args.parent?args.parent.id:""});
if(dojo.isIE||dojo.isMoz){
if(!_261.bgIframe){
_261.bgIframe=new dijit.BackgroundIframe(_264);
}
}
var best=_263?dijit.placeOnScreenAroundElement(_264,_263,_262,_261.orient?dojo.hitch(_261,"orient"):null):dijit.placeOnScreen(_264,args,_262=="R"?["TR","BR","TL","BL"]:["TL","BL","TR","BR"],args.padding);
_264.style.display="";
_264.style.visibility="visible";
_261.domNode.style.visibility="visible";
var _265=[];
_265.push(dojo.connect(_264,"onkeypress",this,function(evt){
if(evt.charOrCode==dojo.keys.ESCAPE&&args.onCancel){
dojo.stopEvent(evt);
args.onCancel();
}else{
if(evt.charOrCode===dojo.keys.TAB){
dojo.stopEvent(evt);
var _266=this.getTopPopup();
if(_266&&_266.onCancel){
_266.onCancel();
}
}
}
}));
if(_261.onCancel){
_265.push(dojo.connect(_261,"onCancel",args.onCancel));
}
_265.push(dojo.connect(_261,_261.onExecute?"onExecute":"onChange",this,function(){
var _267=this.getTopPopup();
if(_267&&_267.onExecute){
_267.onExecute();
}
}));
_260.push({widget:_261,parent:args.parent,onExecute:args.onExecute,onCancel:args.onCancel,onClose:args.onClose,handlers:_265});
if(_261.onOpen){
_261.onOpen(best);
}
return best;
},close:function(_268){
var _269=this._stack;
while((_268&&dojo.some(_269,function(elem){
return elem.widget==_268;
}))||(!_268&&_269.length)){
var top=_269.pop(),_26a=top.widget,_26b=top.onClose;
if(_26a.onClose){
_26a.onClose();
}
dojo.forEach(top.handlers,dojo.disconnect);
if(_26a&&_26a.domNode){
this.hide(_26a);
}
if(_26b){
_26b();
}
}
}};
dijit._frames=new function(){
var _26c=[];
this.pop=function(){
var _26d;
if(_26c.length){
_26d=_26c.pop();
_26d.style.display="";
}else{
if(dojo.isIE<9){
var burl=dojo.config["dojoBlankHtmlUrl"]||(dojo.moduleUrl("dojo","resources/blank.html")+"")||"javascript:\"\"";
var html="<iframe src='"+burl+"'"+" style='position: absolute; left: 0px; top: 0px;"+"z-index: -1; filter:Alpha(Opacity=\"0\");'>";
_26d=dojo.doc.createElement(html);
}else{
_26d=dojo.create("iframe");
_26d.src="javascript:\"\"";
_26d.className="dijitBackgroundIframe";
dojo.style(_26d,"opacity",0.1);
}
_26d.tabIndex=-1;
dijit.setWaiRole(_26d,"presentation");
}
return _26d;
};
this.push=function(_26e){
_26e.style.display="none";
_26c.push(_26e);
};
}();
dijit.BackgroundIframe=function(node){
if(!node.id){
throw new Error("no id");
}
if(dojo.isIE||dojo.isMoz){
var _26f=(this.iframe=dijit._frames.pop());
node.appendChild(_26f);
if(dojo.isIE<7||dojo.isQuirks){
this.resize(node);
this._conn=dojo.connect(node,"onresize",this,function(){
this.resize(node);
});
}else{
dojo.style(_26f,{width:"100%",height:"100%"});
}
}
};
dojo.extend(dijit.BackgroundIframe,{resize:function(node){
if(this.iframe){
dojo.style(this.iframe,{width:node.offsetWidth+"px",height:node.offsetHeight+"px"});
}
},destroy:function(){
if(this._conn){
dojo.disconnect(this._conn);
this._conn=null;
}
if(this.iframe){
dijit._frames.push(this.iframe);
delete this.iframe;
}
}});
}
if(!dojo._hasResource["dijit._base.scroll"]){
dojo._hasResource["dijit._base.scroll"]=true;
dojo.provide("dijit._base.scroll");
dijit.scrollIntoView=function(node,pos){
dojo.window.scrollIntoView(node,pos);
};
}
if(!dojo._hasResource["dojo.uacss"]){
dojo._hasResource["dojo.uacss"]=true;
dojo.provide("dojo.uacss");
(function(){
var d=dojo,html=d.doc.documentElement,ie=d.isIE,_270=d.isOpera,maj=Math.floor,ff=d.isFF,_271=d.boxModel.replace(/-/,""),_272={dj_ie:ie,dj_ie6:maj(ie)==6,dj_ie7:maj(ie)==7,dj_ie8:maj(ie)==8,dj_ie9:maj(ie)==9,dj_quirks:d.isQuirks,dj_iequirks:ie&&d.isQuirks,dj_opera:_270,dj_khtml:d.isKhtml,dj_webkit:d.isWebKit,dj_safari:d.isSafari,dj_chrome:d.isChrome,dj_gecko:d.isMozilla,dj_ff3:maj(ff)==3};
_272["dj_"+_271]=true;
var _273="";
for(var clz in _272){
if(_272[clz]){
_273+=clz+" ";
}
}
html.className=d.trim(html.className+" "+_273);
dojo._loaders.unshift(function(){
if(!dojo._isBodyLtr()){
var _274="dj_rtl dijitRtl "+_273.replace(/ /g,"-rtl ");
html.className=d.trim(html.className+" "+_274);
}
});
})();
}
if(!dojo._hasResource["dijit._base.sniff"]){
dojo._hasResource["dijit._base.sniff"]=true;
dojo.provide("dijit._base.sniff");
}
if(!dojo._hasResource["dijit._base.typematic"]){
dojo._hasResource["dijit._base.typematic"]=true;
dojo.provide("dijit._base.typematic");
dijit.typematic={_fireEventAndReload:function(){
this._timer=null;
this._callback(++this._count,this._node,this._evt);
this._currentTimeout=Math.max(this._currentTimeout<0?this._initialDelay:(this._subsequentDelay>1?this._subsequentDelay:Math.round(this._currentTimeout*this._subsequentDelay)),this._minDelay);
this._timer=setTimeout(dojo.hitch(this,"_fireEventAndReload"),this._currentTimeout);
},trigger:function(evt,_275,node,_276,obj,_277,_278,_279){
if(obj!=this._obj){
this.stop();
this._initialDelay=_278||500;
this._subsequentDelay=_277||0.9;
this._minDelay=_279||10;
this._obj=obj;
this._evt=evt;
this._node=node;
this._currentTimeout=-1;
this._count=-1;
this._callback=dojo.hitch(_275,_276);
this._fireEventAndReload();
this._evt=dojo.mixin({faux:true},evt);
}
},stop:function(){
if(this._timer){
clearTimeout(this._timer);
this._timer=null;
}
if(this._obj){
this._callback(-1,this._node,this._evt);
this._obj=null;
}
},addKeyListener:function(node,_27a,_27b,_27c,_27d,_27e,_27f){
if(_27a.keyCode){
_27a.charOrCode=_27a.keyCode;
dojo.deprecated("keyCode attribute parameter for dijit.typematic.addKeyListener is deprecated. Use charOrCode instead.","","2.0");
}else{
if(_27a.charCode){
_27a.charOrCode=String.fromCharCode(_27a.charCode);
dojo.deprecated("charCode attribute parameter for dijit.typematic.addKeyListener is deprecated. Use charOrCode instead.","","2.0");
}
}
return [dojo.connect(node,"onkeypress",this,function(evt){
if(evt.charOrCode==_27a.charOrCode&&(_27a.ctrlKey===undefined||_27a.ctrlKey==evt.ctrlKey)&&(_27a.altKey===undefined||_27a.altKey==evt.altKey)&&(_27a.metaKey===undefined||_27a.metaKey==(evt.metaKey||false))&&(_27a.shiftKey===undefined||_27a.shiftKey==evt.shiftKey)){
dojo.stopEvent(evt);
dijit.typematic.trigger(evt,_27b,node,_27c,_27a,_27d,_27e,_27f);
}else{
if(dijit.typematic._obj==_27a){
dijit.typematic.stop();
}
}
}),dojo.connect(node,"onkeyup",this,function(evt){
if(dijit.typematic._obj==_27a){
dijit.typematic.stop();
}
})];
},addMouseListener:function(node,_280,_281,_282,_283,_284){
var dc=dojo.connect;
return [dc(node,"mousedown",this,function(evt){
dojo.stopEvent(evt);
dijit.typematic.trigger(evt,_280,node,_281,node,_282,_283,_284);
}),dc(node,"mouseup",this,function(evt){
dojo.stopEvent(evt);
dijit.typematic.stop();
}),dc(node,"mouseout",this,function(evt){
dojo.stopEvent(evt);
dijit.typematic.stop();
}),dc(node,"mousemove",this,function(evt){
evt.preventDefault();
}),dc(node,"dblclick",this,function(evt){
dojo.stopEvent(evt);
if(dojo.isIE){
dijit.typematic.trigger(evt,_280,node,_281,node,_282,_283,_284);
setTimeout(dojo.hitch(this,dijit.typematic.stop),50);
}
})];
},addListener:function(_285,_286,_287,_288,_289,_28a,_28b,_28c){
return this.addKeyListener(_286,_287,_288,_289,_28a,_28b,_28c).concat(this.addMouseListener(_285,_288,_289,_28a,_28b,_28c));
}};
}
if(!dojo._hasResource["dijit._base.wai"]){
dojo._hasResource["dijit._base.wai"]=true;
dojo.provide("dijit._base.wai");
dijit.wai={onload:function(){
var div=dojo.create("div",{id:"a11yTestNode",style:{cssText:"border: 1px solid;"+"border-color:red green;"+"position: absolute;"+"height: 5px;"+"top: -999px;"+"background-image: url(\""+(dojo.config.blankGif||dojo.moduleUrl("dojo","resources/blank.gif"))+"\");"}},dojo.body());
var cs=dojo.getComputedStyle(div);
if(cs){
var _28d=cs.backgroundImage;
var _28e=(cs.borderTopColor==cs.borderRightColor)||(_28d!=null&&(_28d=="none"||_28d=="url(invalid-url:)"));
dojo[_28e?"addClass":"removeClass"](dojo.body(),"dijit_a11y");
if(dojo.isIE){
div.outerHTML="";
}else{
dojo.body().removeChild(div);
}
}
}};
if(dojo.isIE||dojo.isMoz){
dojo._loaders.unshift(dijit.wai.onload);
}
dojo.mixin(dijit,{hasWaiRole:function(elem,role){
var _28f=this.getWaiRole(elem);
return role?(_28f.indexOf(role)>-1):(_28f.length>0);
},getWaiRole:function(elem){
return dojo.trim((dojo.attr(elem,"role")||"").replace("wairole:",""));
},setWaiRole:function(elem,role){
dojo.attr(elem,"role",role);
},removeWaiRole:function(elem,role){
var _290=dojo.attr(elem,"role");
if(!_290){
return;
}
if(role){
var t=dojo.trim((" "+_290+" ").replace(" "+role+" "," "));
dojo.attr(elem,"role",t);
}else{
elem.removeAttribute("role");
}
},hasWaiState:function(elem,_291){
return elem.hasAttribute?elem.hasAttribute("aria-"+_291):!!elem.getAttribute("aria-"+_291);
},getWaiState:function(elem,_292){
return elem.getAttribute("aria-"+_292)||"";
},setWaiState:function(elem,_293,_294){
elem.setAttribute("aria-"+_293,_294);
},removeWaiState:function(elem,_295){
elem.removeAttribute("aria-"+_295);
}});
}
if(!dojo._hasResource["dijit._base"]){
dojo._hasResource["dijit._base"]=true;
dojo.provide("dijit._base");
}
if(!dojo._hasResource["dijit._Widget"]){
dojo._hasResource["dijit._Widget"]=true;
dojo.provide("dijit._Widget");
dojo.connect(dojo,"_connect",function(_296,_297){
if(_296&&dojo.isFunction(_296._onConnect)){
_296._onConnect(_297);
}
});
dijit._connectOnUseEventHandler=function(_298){
};
dijit._lastKeyDownNode=null;
if(dojo.isIE){
(function(){
var _299=function(evt){
dijit._lastKeyDownNode=evt.srcElement;
};
dojo.doc.attachEvent("onkeydown",_299);
dojo.addOnWindowUnload(function(){
dojo.doc.detachEvent("onkeydown",_299);
});
})();
}else{
dojo.doc.addEventListener("keydown",function(evt){
dijit._lastKeyDownNode=evt.target;
},true);
}
(function(){
dojo.declare("dijit._Widget",dijit._WidgetBase,{_deferredConnects:{onClick:"",onDblClick:"",onKeyDown:"",onKeyPress:"",onKeyUp:"",onMouseMove:"",onMouseDown:"",onMouseOut:"",onMouseOver:"",onMouseLeave:"",onMouseEnter:"",onMouseUp:""},onClick:dijit._connectOnUseEventHandler,onDblClick:dijit._connectOnUseEventHandler,onKeyDown:dijit._connectOnUseEventHandler,onKeyPress:dijit._connectOnUseEventHandler,onKeyUp:dijit._connectOnUseEventHandler,onMouseDown:dijit._connectOnUseEventHandler,onMouseMove:dijit._connectOnUseEventHandler,onMouseOut:dijit._connectOnUseEventHandler,onMouseOver:dijit._connectOnUseEventHandler,onMouseLeave:dijit._connectOnUseEventHandler,onMouseEnter:dijit._connectOnUseEventHandler,onMouseUp:dijit._connectOnUseEventHandler,create:function(_29a,_29b){
this._deferredConnects=dojo.clone(this._deferredConnects);
for(var attr in this.attributeMap){
delete this._deferredConnects[attr];
}
for(attr in this._deferredConnects){
if(this[attr]!==dijit._connectOnUseEventHandler){
delete this._deferredConnects[attr];
}
}
this.inherited(arguments);
if(this.domNode){
for(attr in this.params){
this._onConnect(attr);
}
}
},_onConnect:function(_29c){
if(_29c in this._deferredConnects){
var _29d=this[this._deferredConnects[_29c]||"domNode"];
this.connect(_29d,_29c.toLowerCase(),_29c);
delete this._deferredConnects[_29c];
}
},focused:false,isFocusable:function(){
return this.focus&&(dojo.style(this.domNode,"display")!="none");
},onFocus:function(){
},onBlur:function(){
},_onFocus:function(e){
this.onFocus();
},_onBlur:function(){
this.onBlur();
},setAttribute:function(attr,_29e){
dojo.deprecated(this.declaredClass+"::setAttribute(attr, value) is deprecated. Use set() instead.","","2.0");
this.set(attr,_29e);
},attr:function(name,_29f){
if(dojo.config.isDebug){
var _2a0=arguments.callee._ach||(arguments.callee._ach={}),_2a1=(arguments.callee.caller||"unknown caller").toString();
if(!_2a0[_2a1]){
dojo.deprecated(this.declaredClass+"::attr() is deprecated. Use get() or set() instead, called from "+_2a1,"","2.0");
_2a0[_2a1]=true;
}
}
var args=arguments.length;
if(args>=2||typeof name==="object"){
return this.set.apply(this,arguments);
}else{
return this.get(name);
}
},nodesWithKeyClick:["input","button"],connect:function(obj,_2a2,_2a3){
var d=dojo,dc=d._connect,_2a4=this.inherited(arguments,[obj,_2a2=="ondijitclick"?"onclick":_2a2,_2a3]);
if(_2a2=="ondijitclick"){
if(d.indexOf(this.nodesWithKeyClick,obj.nodeName.toLowerCase())==-1){
var m=d.hitch(this,_2a3);
_2a4.push(dc(obj,"onkeydown",this,function(e){
if((e.keyCode==d.keys.ENTER||e.keyCode==d.keys.SPACE)&&!e.ctrlKey&&!e.shiftKey&&!e.altKey&&!e.metaKey){
dijit._lastKeyDownNode=e.target;
if(!("openDropDown" in this&&obj==this._buttonNode)){
e.preventDefault();
}
}
}),dc(obj,"onkeyup",this,function(e){
if((e.keyCode==d.keys.ENTER||e.keyCode==d.keys.SPACE)&&e.target==dijit._lastKeyDownNode&&!e.ctrlKey&&!e.shiftKey&&!e.altKey&&!e.metaKey){
dijit._lastKeyDownNode=null;
return m(e);
}
}));
}
}
return _2a4;
},_onShow:function(){
this.onShow();
},onShow:function(){
},onHide:function(){
},onClose:function(){
return true;
}});
})();
}
if(!dojo._hasResource["dojo.string"]){
dojo._hasResource["dojo.string"]=true;
dojo.provide("dojo.string");
dojo.getObject("string",true,dojo);
dojo.string.rep=function(str,num){
if(num<=0||!str){
return "";
}
var buf=[];
for(;;){
if(num&1){
buf.push(str);
}
if(!(num>>=1)){
break;
}
str+=str;
}
return buf.join("");
};
dojo.string.pad=function(text,size,ch,end){
if(!ch){
ch="0";
}
var out=String(text),pad=dojo.string.rep(ch,Math.ceil((size-out.length)/ch.length));
return end?out+pad:pad+out;
};
dojo.string.substitute=function(_2a5,map,_2a6,_2a7){
_2a7=_2a7||dojo.global;
_2a6=_2a6?dojo.hitch(_2a7,_2a6):function(v){
return v;
};
return _2a5.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g,function(_2a8,key,_2a9){
var _2aa=dojo.getObject(key,false,map);
if(_2a9){
_2aa=dojo.getObject(_2a9,false,_2a7).call(_2a7,_2aa,key);
}
return _2a6(_2aa,key).toString();
});
};
dojo.string.trim=String.prototype.trim?dojo.trim:function(str){
str=str.replace(/^\s+/,"");
for(var i=str.length-1;i>=0;i--){
if(/\S/.test(str.charAt(i))){
str=str.substring(0,i+1);
break;
}
}
return str;
};
}
if(!dojo._hasResource["dojo.cache"]){
dojo._hasResource["dojo.cache"]=true;
dojo.provide("dojo.cache");
var cache={};
dojo.cache=function(_2ab,url,_2ac){
if(typeof _2ab=="string"){
var _2ad=dojo.moduleUrl(_2ab,url);
}else{
_2ad=_2ab;
_2ac=url;
}
var key=_2ad.toString();
var val=_2ac;
if(_2ac!=undefined&&!dojo.isString(_2ac)){
val=("value" in _2ac?_2ac.value:undefined);
}
var _2ae=_2ac&&_2ac.sanitize?true:false;
if(typeof val=="string"){
val=cache[key]=_2ae?dojo.cache._sanitize(val):val;
}else{
if(val===null){
delete cache[key];
}else{
if(!(key in cache)){
val=dojo._getText(key);
cache[key]=_2ae?dojo.cache._sanitize(val):val;
}
val=cache[key];
}
}
return val;
};
dojo.cache._sanitize=function(val){
if(val){
val=val.replace(/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,"");
var _2af=val.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
if(_2af){
val=_2af[1];
}
}else{
val="";
}
return val;
};
}
if(!dojo._hasResource["dijit._Templated"]){
dojo._hasResource["dijit._Templated"]=true;
dojo.provide("dijit._Templated");
dojo.declare("dijit._Templated",null,{templateString:null,templatePath:null,widgetsInTemplate:false,_skipNodeCache:false,_earlyTemplatedStartup:false,constructor:function(){
this._attachPoints=[];
this._attachEvents=[];
},_stringRepl:function(tmpl){
var _2b0=this.declaredClass,_2b1=this;
return dojo.string.substitute(tmpl,this,function(_2b2,key){
if(key.charAt(0)=="!"){
_2b2=dojo.getObject(key.substr(1),false,_2b1);
}
if(typeof _2b2=="undefined"){
throw new Error(_2b0+" template:"+key);
}
if(_2b2==null){
return "";
}
return key.charAt(0)=="!"?_2b2:_2b2.toString().replace(/"/g,"&quot;");
},this);
},buildRendering:function(){
var _2b3=dijit._Templated.getCachedTemplate(this.templatePath,this.templateString,this._skipNodeCache);
var node;
if(dojo.isString(_2b3)){
node=dojo._toDom(this._stringRepl(_2b3));
if(node.nodeType!=1){
throw new Error("Invalid template: "+_2b3);
}
}else{
node=_2b3.cloneNode(true);
}
this.domNode=node;
this.inherited(arguments);
this._attachTemplateNodes(node);
if(this.widgetsInTemplate){
var cw=(this._startupWidgets=dojo.parser.parse(node,{noStart:!this._earlyTemplatedStartup,template:true,inherited:{dir:this.dir,lang:this.lang},propsThis:this,scope:"dojo"}));
this._supportingWidgets=dijit.findWidgets(node);
this._attachTemplateNodes(cw,function(n,p){
return n[p];
});
}
this._fillContent(this.srcNodeRef);
},_fillContent:function(_2b4){
var dest=this.containerNode;
if(_2b4&&dest){
while(_2b4.hasChildNodes()){
dest.appendChild(_2b4.firstChild);
}
}
},_attachTemplateNodes:function(_2b5,_2b6){
_2b6=_2b6||function(n,p){
return n.getAttribute(p);
};
var _2b7=dojo.isArray(_2b5)?_2b5:(_2b5.all||_2b5.getElementsByTagName("*"));
var x=dojo.isArray(_2b5)?0:-1;
for(;x<_2b7.length;x++){
var _2b8=(x==-1)?_2b5:_2b7[x];
if(this.widgetsInTemplate&&(_2b6(_2b8,"dojoType")||_2b6(_2b8,"data-dojo-type"))){
continue;
}
var _2b9=_2b6(_2b8,"dojoAttachPoint")||_2b6(_2b8,"data-dojo-attach-point");
if(_2b9){
var _2ba,_2bb=_2b9.split(/\s*,\s*/);
while((_2ba=_2bb.shift())){
if(dojo.isArray(this[_2ba])){
this[_2ba].push(_2b8);
}else{
this[_2ba]=_2b8;
}
this._attachPoints.push(_2ba);
}
}
var _2bc=_2b6(_2b8,"dojoAttachEvent")||_2b6(_2b8,"data-dojo-attach-event");
if(_2bc){
var _2bd,_2be=_2bc.split(/\s*,\s*/);
var trim=dojo.trim;
while((_2bd=_2be.shift())){
if(_2bd){
var _2bf=null;
if(_2bd.indexOf(":")!=-1){
var _2c0=_2bd.split(":");
_2bd=trim(_2c0[0]);
_2bf=trim(_2c0[1]);
}else{
_2bd=trim(_2bd);
}
if(!_2bf){
_2bf=_2bd;
}
this._attachEvents.push(this.connect(_2b8,_2bd,_2bf));
}
}
}
var role=_2b6(_2b8,"waiRole");
if(role){
dijit.setWaiRole(_2b8,role);
}
var _2c1=_2b6(_2b8,"waiState");
if(_2c1){
dojo.forEach(_2c1.split(/\s*,\s*/),function(_2c2){
if(_2c2.indexOf("-")!=-1){
var pair=_2c2.split("-");
dijit.setWaiState(_2b8,pair[0],pair[1]);
}
});
}
}
},startup:function(){
dojo.forEach(this._startupWidgets,function(w){
if(w&&!w._started&&w.startup){
w.startup();
}
});
this.inherited(arguments);
},destroyRendering:function(){
dojo.forEach(this._attachPoints,function(_2c3){
delete this[_2c3];
},this);
this._attachPoints=[];
dojo.forEach(this._attachEvents,this.disconnect,this);
this._attachEvents=[];
this.inherited(arguments);
}});
dijit._Templated._templateCache={};
dijit._Templated.getCachedTemplate=function(_2c4,_2c5,_2c6){
var _2c7=dijit._Templated._templateCache;
var key=_2c5||_2c4;
var _2c8=_2c7[key];
if(_2c8){
try{
if(!_2c8.ownerDocument||_2c8.ownerDocument==dojo.doc){
return _2c8;
}
}
catch(e){
}
dojo.destroy(_2c8);
}
if(!_2c5){
_2c5=dojo.cache(_2c4,{sanitize:true});
}
_2c5=dojo.string.trim(_2c5);
if(_2c6||_2c5.match(/\$\{([^\}]+)\}/g)){
return (_2c7[key]=_2c5);
}else{
var node=dojo._toDom(_2c5);
if(node.nodeType!=1){
throw new Error("Invalid template: "+_2c5);
}
return (_2c7[key]=node);
}
};
if(dojo.isIE){
dojo.addOnWindowUnload(function(){
var _2c9=dijit._Templated._templateCache;
for(var key in _2c9){
var _2ca=_2c9[key];
if(typeof _2ca=="object"){
dojo.destroy(_2ca);
}
delete _2c9[key];
}
});
}
dojo.extend(dijit._Widget,{dojoAttachEvent:"",dojoAttachPoint:"",waiRole:"",waiState:""});
}
if(!dojo._hasResource["dijit._CssStateMixin"]){
dojo._hasResource["dijit._CssStateMixin"]=true;
dojo.provide("dijit._CssStateMixin");
dojo.declare("dijit._CssStateMixin",[],{cssStateNodes:{},hovering:false,active:false,_applyAttributes:function(){
this.inherited(arguments);
dojo.forEach(["onmouseenter","onmouseleave","onmousedown"],function(e){
this.connect(this.domNode,e,"_cssMouseEvent");
},this);
dojo.forEach(["disabled","readOnly","checked","selected","focused","state","hovering","active"],function(attr){
this.watch(attr,dojo.hitch(this,"_setStateClass"));
},this);
for(var ap in this.cssStateNodes){
this._trackMouseState(this[ap],this.cssStateNodes[ap]);
}
this._setStateClass();
},_cssMouseEvent:function(_2cb){
if(!this.disabled){
switch(_2cb.type){
case "mouseenter":
case "mouseover":
this._set("hovering",true);
this._set("active",this._mouseDown);
break;
case "mouseleave":
case "mouseout":
this._set("hovering",false);
this._set("active",false);
break;
case "mousedown":
this._set("active",true);
this._mouseDown=true;
var _2cc=this.connect(dojo.body(),"onmouseup",function(){
this._mouseDown=false;
this._set("active",false);
this.disconnect(_2cc);
});
break;
}
}
},_setStateClass:function(){
var _2cd=this.baseClass.split(" ");
function _2ce(_2cf){
_2cd=_2cd.concat(dojo.map(_2cd,function(c){
return c+_2cf;
}),"dijit"+_2cf);
};
if(!this.isLeftToRight()){
_2ce("Rtl");
}
if(this.checked){
_2ce("Checked");
}
if(this.state){
_2ce(this.state);
}
if(this.selected){
_2ce("Selected");
}
if(this.disabled){
_2ce("Disabled");
}else{
if(this.readOnly){
_2ce("ReadOnly");
}else{
if(this.active){
_2ce("Active");
}else{
if(this.hovering){
_2ce("Hover");
}
}
}
}
if(this._focused){
_2ce("Focused");
}
var tn=this.stateNode||this.domNode,_2d0={};
dojo.forEach(tn.className.split(" "),function(c){
_2d0[c]=true;
});
if("_stateClasses" in this){
dojo.forEach(this._stateClasses,function(c){
delete _2d0[c];
});
}
dojo.forEach(_2cd,function(c){
_2d0[c]=true;
});
var _2d1=[];
for(var c in _2d0){
_2d1.push(c);
}
tn.className=_2d1.join(" ");
this._stateClasses=_2cd;
},_trackMouseState:function(node,_2d2){
var _2d3=false,_2d4=false,_2d5=false;
var self=this,cn=dojo.hitch(this,"connect",node);
function _2d6(){
var _2d7=("disabled" in self&&self.disabled)||("readonly" in self&&self.readonly);
dojo.toggleClass(node,_2d2+"Hover",_2d3&&!_2d4&&!_2d7);
dojo.toggleClass(node,_2d2+"Active",_2d4&&!_2d7);
dojo.toggleClass(node,_2d2+"Focused",_2d5&&!_2d7);
};
cn("onmouseenter",function(){
_2d3=true;
_2d6();
});
cn("onmouseleave",function(){
_2d3=false;
_2d4=false;
_2d6();
});
cn("onmousedown",function(){
_2d4=true;
_2d6();
});
cn("onmouseup",function(){
_2d4=false;
_2d6();
});
cn("onfocus",function(){
_2d5=true;
_2d6();
});
cn("onblur",function(){
_2d5=false;
_2d6();
});
this.watch("disabled",_2d6);
this.watch("readOnly",_2d6);
}});
}
if(!dojo._hasResource["dijit.form._FormMixin"]){
dojo._hasResource["dijit.form._FormMixin"]=true;
dojo.provide("dijit.form._FormMixin");
dojo.declare("dijit.form._FormMixin",null,{state:"",reset:function(){
dojo.forEach(this.getDescendants(),function(_2d8){
if(_2d8.reset){
_2d8.reset();
}
});
},validate:function(){
var _2d9=false;
return dojo.every(dojo.map(this.getDescendants(),function(_2da){
_2da._hasBeenBlurred=true;
var _2db=_2da.disabled||!_2da.validate||_2da.validate();
if(!_2db&&!_2d9){
dojo.window.scrollIntoView(_2da.containerNode||_2da.domNode);
_2da.focus();
_2d9=true;
}
return _2db;
}),function(item){
return item;
});
},setValues:function(val){
dojo.deprecated(this.declaredClass+"::setValues() is deprecated. Use set('value', val) instead.","","2.0");
return this.set("value",val);
},_setValueAttr:function(obj){
var map={};
dojo.forEach(this.getDescendants(),function(_2dc){
if(!_2dc.name){
return;
}
var _2dd=map[_2dc.name]||(map[_2dc.name]=[]);
_2dd.push(_2dc);
});
for(var name in map){
if(!map.hasOwnProperty(name)){
continue;
}
var _2de=map[name],_2df=dojo.getObject(name,false,obj);
if(_2df===undefined){
continue;
}
if(!dojo.isArray(_2df)){
_2df=[_2df];
}
if(typeof _2de[0].checked=="boolean"){
dojo.forEach(_2de,function(w,i){
w.set("value",dojo.indexOf(_2df,w.value)!=-1);
});
}else{
if(_2de[0].multiple){
_2de[0].set("value",_2df);
}else{
dojo.forEach(_2de,function(w,i){
w.set("value",_2df[i]);
});
}
}
}
},getValues:function(){
dojo.deprecated(this.declaredClass+"::getValues() is deprecated. Use get('value') instead.","","2.0");
return this.get("value");
},_getValueAttr:function(){
var obj={};
dojo.forEach(this.getDescendants(),function(_2e0){
var name=_2e0.name;
if(!name||_2e0.disabled){
return;
}
var _2e1=_2e0.get("value");
if(typeof _2e0.checked=="boolean"){
if(/Radio/.test(_2e0.declaredClass)){
if(_2e1!==false){
dojo.setObject(name,_2e1,obj);
}else{
_2e1=dojo.getObject(name,false,obj);
if(_2e1===undefined){
dojo.setObject(name,null,obj);
}
}
}else{
var ary=dojo.getObject(name,false,obj);
if(!ary){
ary=[];
dojo.setObject(name,ary,obj);
}
if(_2e1!==false){
ary.push(_2e1);
}
}
}else{
var prev=dojo.getObject(name,false,obj);
if(typeof prev!="undefined"){
if(dojo.isArray(prev)){
prev.push(_2e1);
}else{
dojo.setObject(name,[prev,_2e1],obj);
}
}else{
dojo.setObject(name,_2e1,obj);
}
}
});
return obj;
},isValid:function(){
return this.state=="";
},onValidStateChange:function(_2e2){
},_getState:function(){
var _2e3=dojo.map(this._descendants,function(w){
return w.get("state")||"";
});
return dojo.indexOf(_2e3,"Error")>=0?"Error":dojo.indexOf(_2e3,"Incomplete")>=0?"Incomplete":"";
},disconnectChildren:function(){
dojo.forEach(this._childConnections||[],dojo.hitch(this,"disconnect"));
dojo.forEach(this._childWatches||[],function(w){
w.unwatch();
});
},connectChildren:function(_2e4){
var _2e5=this;
this.disconnectChildren();
this._descendants=this.getDescendants();
var set=_2e4?function(name,val){
_2e5[name]=val;
}:dojo.hitch(this,"_set");
set("value",this.get("value"));
set("state",this._getState());
var _2e6=(this._childConnections=[]),_2e7=(this._childWatches=[]);
dojo.forEach(dojo.filter(this._descendants,function(item){
return item.validate;
}),function(_2e8){
dojo.forEach(["state","disabled"],function(attr){
_2e7.push(_2e8.watch(attr,function(attr,_2e9,_2ea){
_2e5.set("state",_2e5._getState());
}));
});
});
var _2eb=function(){
if(_2e5._onChangeDelayTimer){
clearTimeout(_2e5._onChangeDelayTimer);
}
_2e5._onChangeDelayTimer=setTimeout(function(){
delete _2e5._onChangeDelayTimer;
_2e5._set("value",_2e5.get("value"));
},10);
};
dojo.forEach(dojo.filter(this._descendants,function(item){
return item.onChange;
}),function(_2ec){
_2e6.push(_2e5.connect(_2ec,"onChange",_2eb));
_2e7.push(_2ec.watch("disabled",_2eb));
});
},startup:function(){
this.inherited(arguments);
this.connectChildren(true);
this.watch("state",function(attr,_2ed,_2ee){
this.onValidStateChange(_2ee=="");
});
},destroy:function(){
this.disconnectChildren();
this.inherited(arguments);
}});
}
if(!dojo._hasResource["dijit._DialogMixin"]){
dojo._hasResource["dijit._DialogMixin"]=true;
dojo.provide("dijit._DialogMixin");
dojo.declare("dijit._DialogMixin",null,{attributeMap:dijit._Widget.prototype.attributeMap,execute:function(_2ef){
},onCancel:function(){
},onExecute:function(){
},_onSubmit:function(){
this.onExecute();
this.execute(this.get("value"));
},_getFocusItems:function(){
var _2f0=dijit._getTabNavigable(this.containerNode);
this._firstFocusItem=_2f0.lowest||_2f0.first||this.closeButtonNode||this.domNode;
this._lastFocusItem=_2f0.last||_2f0.highest||this._firstFocusItem;
}});
}
if(!dojo._hasResource["dijit.DialogUnderlay"]){
dojo._hasResource["dijit.DialogUnderlay"]=true;
dojo.provide("dijit.DialogUnderlay");
dojo.declare("dijit.DialogUnderlay",[dijit._Widget,dijit._Templated],{templateString:"<div class='dijitDialogUnderlayWrapper'><div class='dijitDialogUnderlay' dojoAttachPoint='node'></div></div>",dialogId:"","class":"",attributeMap:{id:"domNode"},_setDialogIdAttr:function(id){
dojo.attr(this.node,"id",id+"_underlay");
this._set("dialogId",id);
},_setClassAttr:function(_2f1){
this.node.className="dijitDialogUnderlay "+_2f1;
this._set("class",_2f1);
},postCreate:function(){
dojo.body().appendChild(this.domNode);
},layout:function(){
var is=this.node.style,os=this.domNode.style;
os.display="none";
var _2f2=dojo.window.getBox();
os.top=_2f2.t+"px";
os.left=_2f2.l+"px";
is.width=_2f2.w+"px";
is.height=_2f2.h+"px";
os.display="block";
},show:function(){
this.domNode.style.display="block";
this.layout();
this.bgIframe=new dijit.BackgroundIframe(this.domNode);
},hide:function(){
this.bgIframe.destroy();
delete this.bgIframe;
this.domNode.style.display="none";
}});
}
if(!dojo._hasResource["dijit._Container"]){
dojo._hasResource["dijit._Container"]=true;
dojo.provide("dijit._Container");
dojo.declare("dijit._Container",null,{isContainer:true,buildRendering:function(){
this.inherited(arguments);
if(!this.containerNode){
this.containerNode=this.domNode;
}
},addChild:function(_2f3,_2f4){
var _2f5=this.containerNode;
if(_2f4&&typeof _2f4=="number"){
var _2f6=this.getChildren();
if(_2f6&&_2f6.length>=_2f4){
_2f5=_2f6[_2f4-1].domNode;
_2f4="after";
}
}
dojo.place(_2f3.domNode,_2f5,_2f4);
if(this._started&&!_2f3._started){
_2f3.startup();
}
},removeChild:function(_2f7){
if(typeof _2f7=="number"){
_2f7=this.getChildren()[_2f7];
}
if(_2f7){
var node=_2f7.domNode;
if(node&&node.parentNode){
node.parentNode.removeChild(node);
}
}
},hasChildren:function(){
return this.getChildren().length>0;
},destroyDescendants:function(_2f8){
dojo.forEach(this.getChildren(),function(_2f9){
_2f9.destroyRecursive(_2f8);
});
},_getSiblingOfChild:function(_2fa,dir){
var node=_2fa.domNode,_2fb=(dir>0?"nextSibling":"previousSibling");
do{
node=node[_2fb];
}while(node&&(node.nodeType!=1||!dijit.byNode(node)));
return node&&dijit.byNode(node);
},getIndexOfChild:function(_2fc){
return dojo.indexOf(this.getChildren(),_2fc);
},startup:function(){
if(this._started){
return;
}
dojo.forEach(this.getChildren(),function(_2fd){
_2fd.startup();
});
this.inherited(arguments);
}});
}
if(!dojo._hasResource["dijit._Contained"]){
dojo._hasResource["dijit._Contained"]=true;
dojo.provide("dijit._Contained");
dojo.declare("dijit._Contained",null,{getParent:function(){
var _2fe=dijit.getEnclosingWidget(this.domNode.parentNode);
return _2fe&&_2fe.isContainer?_2fe:null;
},_getSibling:function(_2ff){
var node=this.domNode;
do{
node=node[_2ff+"Sibling"];
}while(node&&node.nodeType!=1);
return node&&dijit.byNode(node);
},getPreviousSibling:function(){
return this._getSibling("previous");
},getNextSibling:function(){
return this._getSibling("next");
},getIndexInParent:function(){
var p=this.getParent();
if(!p||!p.getIndexOfChild){
return -1;
}
return p.getIndexOfChild(this);
}});
}
if(!dojo._hasResource["dijit.layout._LayoutWidget"]){
dojo._hasResource["dijit.layout._LayoutWidget"]=true;
dojo.provide("dijit.layout._LayoutWidget");
dojo.declare("dijit.layout._LayoutWidget",[dijit._Widget,dijit._Container,dijit._Contained],{baseClass:"dijitLayoutContainer",isLayoutContainer:true,buildRendering:function(){
this.inherited(arguments);
dojo.addClass(this.domNode,"dijitContainer");
},startup:function(){
if(this._started){
return;
}
this.inherited(arguments);
var _300=this.getParent&&this.getParent();
if(!(_300&&_300.isLayoutContainer)){
this.resize();
this.connect(dojo.isIE?this.domNode:dojo.global,"onresize",function(){
this.resize();
});
}
},resize:function(_301,_302){
var node=this.domNode;
if(_301){
dojo.marginBox(node,_301);
if(_301.t){
node.style.top=_301.t+"px";
}
if(_301.l){
node.style.left=_301.l+"px";
}
}
var mb=_302||{};
dojo.mixin(mb,_301||{});
if(!("h" in mb)||!("w" in mb)){
mb=dojo.mixin(dojo.marginBox(node),mb);
}
var cs=dojo.getComputedStyle(node);
var me=dojo._getMarginExtents(node,cs);
var be=dojo._getBorderExtents(node,cs);
var bb=(this._borderBox={w:mb.w-(me.w+be.w),h:mb.h-(me.h+be.h)});
var pe=dojo._getPadExtents(node,cs);
this._contentBox={l:dojo._toPixelValue(node,cs.paddingLeft),t:dojo._toPixelValue(node,cs.paddingTop),w:bb.w-pe.w,h:bb.h-pe.h};
this.layout();
},layout:function(){
},_setupChild:function(_303){
var cls=this.baseClass+"-child "+(_303.baseClass?this.baseClass+"-"+_303.baseClass:"");
dojo.addClass(_303.domNode,cls);
},addChild:function(_304,_305){
this.inherited(arguments);
if(this._started){
this._setupChild(_304);
}
},removeChild:function(_306){
var cls=this.baseClass+"-child"+(_306.baseClass?" "+this.baseClass+"-"+_306.baseClass:"");
dojo.removeClass(_306.domNode,cls);
this.inherited(arguments);
}});
dijit.layout.marginBox2contentBox=function(node,mb){
var cs=dojo.getComputedStyle(node);
var me=dojo._getMarginExtents(node,cs);
var pb=dojo._getPadBorderExtents(node,cs);
return {l:dojo._toPixelValue(node,cs.paddingLeft),t:dojo._toPixelValue(node,cs.paddingTop),w:mb.w-(me.w+pb.w),h:mb.h-(me.h+pb.h)};
};
(function(){
var _307=function(word){
return word.substring(0,1).toUpperCase()+word.substring(1);
};
var size=function(_308,dim){
_308.resize?_308.resize(dim):dojo.marginBox(_308.domNode,dim);
dojo.mixin(_308,dojo.marginBox(_308.domNode));
dojo.mixin(_308,dim);
};
dijit.layout.layoutChildren=function(_309,dim,_30a,_30b,_30c){
dim=dojo.mixin({},dim);
dojo.addClass(_309,"dijitLayoutContainer");
_30a=dojo.filter(_30a,function(item){
return item.region!="center"&&item.layoutAlign!="client";
}).concat(dojo.filter(_30a,function(item){
return item.region=="center"||item.layoutAlign=="client";
}));
dojo.forEach(_30a,function(_30d){
var elm=_30d.domNode,pos=(_30d.region||_30d.layoutAlign);
var _30e=elm.style;
_30e.left=dim.l+"px";
_30e.top=dim.t+"px";
_30e.bottom=_30e.right="auto";
dojo.addClass(elm,"dijitAlign"+_307(pos));
var _30f={};
if(_30b&&_30b==_30d.id){
_30f[_30d.region=="top"||_30d.region=="bottom"?"h":"w"]=_30c;
}
if(pos=="top"||pos=="bottom"){
_30f.w=dim.w;
size(_30d,_30f);
dim.h-=_30d.h;
if(pos=="top"){
dim.t+=_30d.h;
}else{
_30e.top=dim.t+dim.h+"px";
}
}else{
if(pos=="left"||pos=="right"){
_30f.h=dim.h;
size(_30d,_30f);
dim.w-=_30d.w;
if(pos=="left"){
dim.l+=_30d.w;
}else{
_30e.left=dim.l+dim.w+"px";
}
}else{
if(pos=="client"||pos=="center"){
size(_30d,dim);
}
}
}
});
};
})();
}
if(!dojo._hasResource["dijit.layout._ContentPaneResizeMixin"]){
dojo._hasResource["dijit.layout._ContentPaneResizeMixin"]=true;
dojo.provide("dijit.layout._ContentPaneResizeMixin");
dojo.declare("dijit.layout._ContentPaneResizeMixin",null,{doLayout:true,isContainer:true,isLayoutContainer:true,_startChildren:function(){
dojo.forEach(this.getChildren(),function(_310){
_310.startup();
_310._started=true;
});
},startup:function(){
if(this._started){
return;
}
var _311=dijit._Contained.prototype.getParent.call(this);
this._childOfLayoutWidget=_311&&_311.isLayoutContainer;
this._needLayout=!this._childOfLayoutWidget;
this.inherited(arguments);
this._startChildren();
},_checkIfSingleChild:function(){
var _312=dojo.query("> *",this.containerNode).filter(function(node){
return node.tagName!=="SCRIPT";
}),_313=_312.filter(function(node){
return dojo.hasAttr(node,"data-dojo-type")||dojo.hasAttr(node,"dojoType")||dojo.hasAttr(node,"widgetId");
}),_314=dojo.filter(_313.map(dijit.byNode),function(_315){
return _315&&_315.domNode&&_315.resize;
});
if(_312.length==_313.length&&_314.length==1){
this._singleChild=_314[0];
}else{
delete this._singleChild;
}
dojo.toggleClass(this.containerNode,this.baseClass+"SingleChild",!!this._singleChild);
},resize:function(_316,_317){
this._layout(_316,_317);
},_layout:function(_318,_319){
if(_318){
dojo.marginBox(this.domNode,_318);
}
var cn=this.containerNode;
if(cn===this.domNode){
var mb=_319||{};
dojo.mixin(mb,_318||{});
if(!("h" in mb)||!("w" in mb)){
mb=dojo.mixin(dojo.marginBox(cn),mb);
}
this._contentBox=dijit.layout.marginBox2contentBox(cn,mb);
}else{
this._contentBox=dojo.contentBox(cn);
}
this._layoutChildren();
delete this._needLayout;
},_layoutChildren:function(){
if(this.doLayout){
this._checkIfSingleChild();
}
if(this._singleChild&&this._singleChild.resize){
var cb=this._contentBox||dojo.contentBox(this.containerNode);
this._singleChild.resize({w:cb.w,h:cb.h});
}else{
dojo.forEach(this.getChildren(),function(_31a){
if(_31a.resize){
_31a.resize();
}
});
}
}});
}
if(!dojo._hasResource["dojo.html"]){
dojo._hasResource["dojo.html"]=true;
dojo.provide("dojo.html");
dojo.getObject("html",true,dojo);
(function(){
var _31b=0,d=dojo;
dojo.html._secureForInnerHtml=function(cont){
return cont.replace(/(?:\s*<!DOCTYPE\s[^>]+>|<title[^>]*>[\s\S]*?<\/title>)/ig,"");
};
dojo.html._emptyNode=dojo.empty;
dojo.html._setNodeContent=function(node,cont){
d.empty(node);
if(cont){
if(typeof cont=="string"){
cont=d._toDom(cont,node.ownerDocument);
}
if(!cont.nodeType&&d.isArrayLike(cont)){
for(var _31c=cont.length,i=0;i<cont.length;i=_31c==cont.length?i+1:0){
d.place(cont[i],node,"last");
}
}else{
d.place(cont,node,"last");
}
}
return node;
};
dojo.declare("dojo.html._ContentSetter",null,{node:"",content:"",id:"",cleanContent:false,extractContent:false,parseContent:false,parserScope:dojo._scopeName,startup:true,constructor:function(_31d,node){
dojo.mixin(this,_31d||{});
node=this.node=dojo.byId(this.node||node);
if(!this.id){
this.id=["Setter",(node)?node.id||node.tagName:"",_31b++].join("_");
}
},set:function(cont,_31e){
if(undefined!==cont){
this.content=cont;
}
if(_31e){
this._mixin(_31e);
}
this.onBegin();
this.setContent();
this.onEnd();
return this.node;
},setContent:function(){
var node=this.node;
if(!node){
throw new Error(this.declaredClass+": setContent given no node");
}
try{
node=dojo.html._setNodeContent(node,this.content);
}
catch(e){
var _31f=this.onContentError(e);
try{
node.innerHTML=_31f;
}
catch(e){
console.error("Fatal "+this.declaredClass+".setContent could not change content due to "+e.message,e);
}
}
this.node=node;
},empty:function(){
if(this.parseResults&&this.parseResults.length){
dojo.forEach(this.parseResults,function(w){
if(w.destroy){
w.destroy();
}
});
delete this.parseResults;
}
dojo.html._emptyNode(this.node);
},onBegin:function(){
var cont=this.content;
if(dojo.isString(cont)){
if(this.cleanContent){
cont=dojo.html._secureForInnerHtml(cont);
}
if(this.extractContent){
var _320=cont.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
if(_320){
cont=_320[1];
}
}
}
this.empty();
this.content=cont;
return this.node;
},onEnd:function(){
if(this.parseContent){
this._parse();
}
return this.node;
},tearDown:function(){
delete this.parseResults;
delete this.node;
delete this.content;
},onContentError:function(err){
return "Error occured setting content: "+err;
},_mixin:function(_321){
var _322={},key;
for(key in _321){
if(key in _322){
continue;
}
this[key]=_321[key];
}
},_parse:function(){
var _323=this.node;
try{
this.parseResults=dojo.parser.parse({rootNode:_323,noStart:!this.startup,inherited:{dir:this.dir,lang:this.lang},scope:this.parserScope});
}
catch(e){
this._onError("Content",e,"Error parsing in _ContentSetter#"+this.id);
}
},_onError:function(type,err,_324){
var _325=this["on"+type+"Error"].call(this,err);
if(_324){
console.error(_324,err);
}else{
if(_325){
dojo.html._setNodeContent(this.node,_325,true);
}
}
}});
dojo.html.set=function(node,cont,_326){
if(undefined==cont){
console.warn("dojo.html.set: no cont argument provided, using empty string");
cont="";
}
if(!_326){
return dojo.html._setNodeContent(node,cont,true);
}else{
var op=new dojo.html._ContentSetter(dojo.mixin(_326,{content:cont,node:node}));
return op.set();
}
};
})();
}
if(!dojo._hasResource["dojo.i18n"]){
dojo._hasResource["dojo.i18n"]=true;
dojo.provide("dojo.i18n");
dojo.getObject("i18n",true,dojo);
dojo.i18n.getLocalization=dojo.i18n.getLocalization||function(_327,_328,_329){
_329=dojo.i18n.normalizeLocale(_329);
var _32a=_329.split("-");
var _32b=[_327,"nls",_328].join(".");
var _32c=dojo._loadedModules[_32b];
if(_32c){
var _32d;
for(var i=_32a.length;i>0;i--){
var loc=_32a.slice(0,i).join("_");
if(_32c[loc]){
_32d=_32c[loc];
break;
}
}
if(!_32d){
_32d=_32c.ROOT;
}
if(_32d){
var _32e=function(){
};
_32e.prototype=_32d;
return new _32e();
}
}
throw new Error("Bundle not found: "+_328+" in "+_327+" , locale="+_329);
};
dojo.i18n.normalizeLocale=function(_32f){
var _330=_32f?_32f.toLowerCase():dojo.locale;
if(_330=="root"){
_330="ROOT";
}
return _330;
};
dojo.i18n._requireLocalization=function(_331,_332,_333,_334){
var _335=dojo.i18n.normalizeLocale(_333);
var _336=[_331,"nls",_332].join(".");
var _337="";
if(_334){
var _338=_334.split(",");
for(var i=0;i<_338.length;i++){
if(_335["indexOf"](_338[i])==0){
if(_338[i].length>_337.length){
_337=_338[i];
}
}
}
if(!_337){
_337="ROOT";
}
}
var _339=_334?_337:_335;
var _33a=dojo._loadedModules[_336];
var _33b=null;
if(_33a){
if(dojo.config.localizationComplete&&_33a._built){
return;
}
var _33c=_339.replace(/-/g,"_");
var _33d=_336+"."+_33c;
_33b=dojo._loadedModules[_33d];
}
if(!_33b){
_33a=dojo["provide"](_336);
var syms=dojo._getModuleSymbols(_331);
var _33e=syms.concat("nls").join("/");
var _33f;
dojo.i18n._searchLocalePath(_339,_334,function(loc){
var _340=loc.replace(/-/g,"_");
var _341=_336+"."+_340;
var _342=false;
if(!dojo._loadedModules[_341]){
dojo["provide"](_341);
var _343=[_33e];
if(loc!="ROOT"){
_343.push(loc);
}
_343.push(_332);
var _344=_343.join("/")+".js";
_342=dojo._loadPath(_344,null,function(hash){
hash=hash.root||hash;
var _345=function(){
};
_345.prototype=_33f;
_33a[_340]=new _345();
for(var j in hash){
_33a[_340][j]=hash[j];
}
});
}else{
_342=true;
}
if(_342&&_33a[_340]){
_33f=_33a[_340];
}else{
_33a[_340]=_33f;
}
if(_334){
return true;
}
});
}
if(_334&&_335!=_337){
_33a[_335.replace(/-/g,"_")]=_33a[_337.replace(/-/g,"_")];
}
};
(function(){
var _346=dojo.config.extraLocale;
if(_346){
if(!_346 instanceof Array){
_346=[_346];
}
var req=dojo.i18n._requireLocalization;
dojo.i18n._requireLocalization=function(m,b,_347,_348){
req(m,b,_347,_348);
if(_347){
return;
}
for(var i=0;i<_346.length;i++){
req(m,b,_346[i],_348);
}
};
}
})();
dojo.i18n._searchLocalePath=function(_349,down,_34a){
_349=dojo.i18n.normalizeLocale(_349);
var _34b=_349.split("-");
var _34c=[];
for(var i=_34b.length;i>0;i--){
_34c.push(_34b.slice(0,i).join("-"));
}
_34c.push(false);
if(down){
_34c.reverse();
}
for(var j=_34c.length-1;j>=0;j--){
var loc=_34c[j]||"ROOT";
var stop=_34a(loc);
if(stop){
break;
}
}
};
dojo.i18n._preloadLocalizations=function(_34d,_34e){
function _34f(_350){
_350=dojo.i18n.normalizeLocale(_350);
dojo.i18n._searchLocalePath(_350,true,function(loc){
for(var i=0;i<_34e.length;i++){
if(_34e[i]==loc){
dojo["require"](_34d+"_"+loc);
return true;
}
}
return false;
});
};
_34f();
var _351=dojo.config.extraLocale||[];
for(var i=0;i<_351.length;i++){
_34f(_351[i]);
}
};
}
if(!dojo._hasResource["dijit.layout.ContentPane"]){
dojo._hasResource["dijit.layout.ContentPane"]=true;
dojo.provide("dijit.layout.ContentPane");
dojo.declare("dijit.layout.ContentPane",[dijit._Widget,dijit.layout._ContentPaneResizeMixin],{href:"",extractContent:false,parseOnLoad:true,parserScope:dojo._scopeName,preventCache:false,preload:false,refreshOnShow:false,loadingMessage:"<span class='dijitContentPaneLoading'>${loadingState}</span>",errorMessage:"<span class='dijitContentPaneError'>${errorState}</span>",isLoaded:false,baseClass:"dijitContentPane",ioArgs:{},onLoadDeferred:null,attributeMap:dojo.delegate(dijit._Widget.prototype.attributeMap,{title:[]}),stopParser:true,template:false,create:function(_352,_353){
if((!_352||!_352.template)&&_353&&!("href" in _352)&&!("content" in _352)){
var df=dojo.doc.createDocumentFragment();
_353=dojo.byId(_353);
while(_353.firstChild){
df.appendChild(_353.firstChild);
}
_352=dojo.delegate(_352,{content:df});
}
this.inherited(arguments,[_352,_353]);
},postMixInProperties:function(){
this.inherited(arguments);
var _354=dojo.i18n.getLocalization("dijit","loading",this.lang);
this.loadingMessage=dojo.string.substitute(this.loadingMessage,_354);
this.errorMessage=dojo.string.substitute(this.errorMessage,_354);
},buildRendering:function(){
this.inherited(arguments);
if(!this.containerNode){
this.containerNode=this.domNode;
}
this.domNode.title="";
if(!dojo.attr(this.domNode,"role")){
dijit.setWaiRole(this.domNode,"group");
}
},_startChildren:function(){
this.inherited(arguments);
if(this._contentSetter){
dojo.forEach(this._contentSetter.parseResults,function(obj){
if(!obj._started&&!obj._destroyed&&dojo.isFunction(obj.startup)){
obj.startup();
obj._started=true;
}
},this);
}
},startup:function(){
if(this._started){
return;
}
this.inherited(arguments);
if(this._isShown()){
this._onShow();
}
},setHref:function(href){
dojo.deprecated("dijit.layout.ContentPane.setHref() is deprecated. Use set('href', ...) instead.","","2.0");
return this.set("href",href);
},_setHrefAttr:function(href){
this.cancel();
this.onLoadDeferred=new dojo.Deferred(dojo.hitch(this,"cancel"));
this.onLoadDeferred.addCallback(dojo.hitch(this,"onLoad"));
this._set("href",href);
if(this.preload||(this._created&&this._isShown())){
this._load();
}else{
this._hrefChanged=true;
}
return this.onLoadDeferred;
},setContent:function(data){
dojo.deprecated("dijit.layout.ContentPane.setContent() is deprecated.  Use set('content', ...) instead.","","2.0");
this.set("content",data);
},_setContentAttr:function(data){
this._set("href","");
this.cancel();
this.onLoadDeferred=new dojo.Deferred(dojo.hitch(this,"cancel"));
if(this._created){
this.onLoadDeferred.addCallback(dojo.hitch(this,"onLoad"));
}
this._setContent(data||"");
this._isDownloaded=false;
return this.onLoadDeferred;
},_getContentAttr:function(){
return this.containerNode.innerHTML;
},cancel:function(){
if(this._xhrDfd&&(this._xhrDfd.fired==-1)){
this._xhrDfd.cancel();
}
delete this._xhrDfd;
this.onLoadDeferred=null;
},uninitialize:function(){
if(this._beingDestroyed){
this.cancel();
}
this.inherited(arguments);
},destroyRecursive:function(_355){
if(this._beingDestroyed){
return;
}
this.inherited(arguments);
},resize:function(_356,_357){
if(!this._wasShown&&this.open!==false){
this._onShow();
}
this._resizeCalled=true;
this._scheduleLayout(_356,_357);
},_isShown:function(){
if(this._childOfLayoutWidget){
if(this._resizeCalled&&"open" in this){
return this.open;
}
return this._resizeCalled;
}else{
if("open" in this){
return this.open;
}else{
var node=this.domNode,_358=this.domNode.parentNode;
return (node.style.display!="none")&&(node.style.visibility!="hidden")&&!dojo.hasClass(node,"dijitHidden")&&_358&&_358.style&&(_358.style.display!="none");
}
}
},_onShow:function(){
if(this.href){
if(!this._xhrDfd&&(!this.isLoaded||this._hrefChanged||this.refreshOnShow)){
var d=this.refresh();
}
}else{
if(this._needLayout){
this._layout(this._changeSize,this._resultSize);
}
}
this.inherited(arguments);
this._wasShown=true;
return d;
},refresh:function(){
this.cancel();
this.onLoadDeferred=new dojo.Deferred(dojo.hitch(this,"cancel"));
this.onLoadDeferred.addCallback(dojo.hitch(this,"onLoad"));
this._load();
return this.onLoadDeferred;
},_load:function(){
this._setContent(this.onDownloadStart(),true);
var self=this;
var _359={preventCache:(this.preventCache||this.refreshOnShow),url:this.href,handleAs:"text"};
if(dojo.isObject(this.ioArgs)){
dojo.mixin(_359,this.ioArgs);
}
var hand=(this._xhrDfd=(this.ioMethod||dojo.xhrGet)(_359));
hand.addCallback(function(html){
try{
self._isDownloaded=true;
self._setContent(html,false);
self.onDownloadEnd();
}
catch(err){
self._onError("Content",err);
}
delete self._xhrDfd;
return html;
});
hand.addErrback(function(err){
if(!hand.canceled){
self._onError("Download",err);
}
delete self._xhrDfd;
return err;
});
delete this._hrefChanged;
},_onLoadHandler:function(data){
this._set("isLoaded",true);
try{
this.onLoadDeferred.callback(data);
}
catch(e){
console.error("Error "+this.widgetId+" running custom onLoad code: "+e.message);
}
},_onUnloadHandler:function(){
this._set("isLoaded",false);
try{
this.onUnload();
}
catch(e){
console.error("Error "+this.widgetId+" running custom onUnload code: "+e.message);
}
},destroyDescendants:function(){
if(this.isLoaded){
this._onUnloadHandler();
}
var _35a=this._contentSetter;
dojo.forEach(this.getChildren(),function(_35b){
if(_35b.destroyRecursive){
_35b.destroyRecursive();
}
});
if(_35a){
dojo.forEach(_35a.parseResults,function(_35c){
if(_35c.destroyRecursive&&_35c.domNode&&_35c.domNode.parentNode==dojo.body()){
_35c.destroyRecursive();
}
});
delete _35a.parseResults;
}
dojo.html._emptyNode(this.containerNode);
delete this._singleChild;
},_setContent:function(cont,_35d){
this.destroyDescendants();
var _35e=this._contentSetter;
if(!(_35e&&_35e instanceof dojo.html._ContentSetter)){
_35e=this._contentSetter=new dojo.html._ContentSetter({node:this.containerNode,_onError:dojo.hitch(this,this._onError),onContentError:dojo.hitch(this,function(e){
var _35f=this.onContentError(e);
try{
this.containerNode.innerHTML=_35f;
}
catch(e){
console.error("Fatal "+this.id+" could not change content due to "+e.message,e);
}
})});
}
var _360=dojo.mixin({cleanContent:this.cleanContent,extractContent:this.extractContent,parseContent:this.parseOnLoad,parserScope:this.parserScope,startup:false,dir:this.dir,lang:this.lang},this._contentSetterParams||{});
_35e.set((dojo.isObject(cont)&&cont.domNode)?cont.domNode:cont,_360);
delete this._contentSetterParams;
if(this.doLayout){
this._checkIfSingleChild();
}
if(!_35d){
if(this._started){
this._startChildren();
this._scheduleLayout();
}
this._onLoadHandler(cont);
}
},_onError:function(type,err,_361){
this.onLoadDeferred.errback(err);
var _362=this["on"+type+"Error"].call(this,err);
if(_361){
console.error(_361,err);
}else{
if(_362){
this._setContent(_362,true);
}
}
},_scheduleLayout:function(_363,_364){
if(this._isShown()){
this._layout(_363,_364);
}else{
this._needLayout=true;
this._changeSize=_363;
this._resultSize=_364;
}
},onLoad:function(data){
},onUnload:function(){
},onDownloadStart:function(){
return this.loadingMessage;
},onContentError:function(_365){
},onDownloadError:function(_366){
return this.errorMessage;
},onDownloadEnd:function(){
}});
}
if(!dojo._hasResource["dijit.TooltipDialog"]){
dojo._hasResource["dijit.TooltipDialog"]=true;
dojo.provide("dijit.TooltipDialog");
dojo.declare("dijit.TooltipDialog",[dijit.layout.ContentPane,dijit._Templated,dijit.form._FormMixin,dijit._DialogMixin],{title:"",doLayout:false,autofocus:true,baseClass:"dijitTooltipDialog",_firstFocusItem:null,_lastFocusItem:null,templateString:dojo.cache("dijit","templates/TooltipDialog.html","<div role=\"presentation\" tabIndex=\"-1\">\r\n\t<div class=\"dijitTooltipContainer\" role=\"presentation\">\r\n\t\t<div class =\"dijitTooltipContents dijitTooltipFocusNode\" dojoAttachPoint=\"containerNode\" role=\"dialog\"></div>\r\n\t</div>\r\n\t<div class=\"dijitTooltipConnector\" role=\"presentation\"></div>\r\n</div>\r\n"),_setTitleAttr:function(_367){
this.containerNode.title=_367;
this._set("title",_367);
},postCreate:function(){
this.inherited(arguments);
this.connect(this.containerNode,"onkeypress","_onKey");
},orient:function(node,_368,_369){
var newC="dijitTooltipAB"+(_369.charAt(1)=="L"?"Left":"Right")+" dijitTooltip"+(_369.charAt(0)=="T"?"Below":"Above");
dojo.replaceClass(this.domNode,newC,this._currentOrientClass||"");
this._currentOrientClass=newC;
},focus:function(){
this._getFocusItems(this.containerNode);
dijit.focus(this._firstFocusItem);
},onOpen:function(pos){
this.orient(this.domNode,pos.aroundCorner,pos.corner);
this._onShow();
},onClose:function(){
this.onHide();
},_onKey:function(evt){
var node=evt.target;
var dk=dojo.keys;
if(evt.charOrCode===dk.TAB){
this._getFocusItems(this.containerNode);
}
var _36a=(this._firstFocusItem==this._lastFocusItem);
if(evt.charOrCode==dk.ESCAPE){
setTimeout(dojo.hitch(this,"onCancel"),0);
dojo.stopEvent(evt);
}else{
if(node==this._firstFocusItem&&evt.shiftKey&&evt.charOrCode===dk.TAB){
if(!_36a){
dijit.focus(this._lastFocusItem);
}
dojo.stopEvent(evt);
}else{
if(node==this._lastFocusItem&&evt.charOrCode===dk.TAB&&!evt.shiftKey){
if(!_36a){
dijit.focus(this._firstFocusItem);
}
dojo.stopEvent(evt);
}else{
if(evt.charOrCode===dk.TAB){
evt.stopPropagation();
}
}
}
}
}});
}
if(!dojo._hasResource["dijit.Dialog"]){
dojo._hasResource["dijit.Dialog"]=true;
dojo.provide("dijit.Dialog");
dojo.declare("dijit._DialogBase",[dijit._Templated,dijit.form._FormMixin,dijit._DialogMixin,dijit._CssStateMixin],{templateString:dojo.cache("dijit","templates/Dialog.html","<div class=\"dijitDialog\" role=\"dialog\" aria-labelledby=\"${id}_title\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\">\r\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\" id=\"${id}_title\"></span>\r\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"ondijitclick: onCancel\" title=\"${buttonCancel}\" role=\"button\" tabIndex=\"-1\">\r\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\" title=\"${buttonCancel}\">x</span>\r\n\t</span>\r\n\t</div>\r\n\t\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"></div>\r\n</div>\r\n"),baseClass:"dijitDialog",cssStateNodes:{closeButtonNode:"dijitDialogCloseIcon"},attributeMap:dojo.delegate(dijit._Widget.prototype.attributeMap,{title:[{node:"titleNode",type:"innerHTML"},{node:"titleBar",type:"attribute"}],"aria-describedby":""}),open:false,duration:dijit.defaultDuration,refocus:true,autofocus:true,_firstFocusItem:null,_lastFocusItem:null,doLayout:false,draggable:true,"aria-describedby":"",postMixInProperties:function(){
var _36b=dojo.i18n.getLocalization("dijit","common");
dojo.mixin(this,_36b);
this.inherited(arguments);
},postCreate:function(){
dojo.style(this.domNode,{display:"none",position:"absolute"});
dojo.body().appendChild(this.domNode);
this.inherited(arguments);
this.connect(this,"onExecute","hide");
this.connect(this,"onCancel","hide");
this._modalconnects=[];
},onLoad:function(){
this._position();
if(this.autofocus&&dijit._DialogLevelManager.isTop(this)){
this._getFocusItems(this.domNode);
dijit.focus(this._firstFocusItem);
}
this.inherited(arguments);
},_endDrag:function(e){
if(e&&e.node&&e.node===this.domNode){
this._relativePosition=dojo.position(e.node);
}
},_setup:function(){
var node=this.domNode;
if(this.titleBar&&this.draggable){
this._moveable=(dojo.isIE==6)?new dojo.dnd.TimedMoveable(node,{handle:this.titleBar}):new dojo.dnd.Moveable(node,{handle:this.titleBar,timeout:0});
this._dndListener=dojo.subscribe("/dnd/move/stop",this,"_endDrag");
}else{
dojo.addClass(node,"dijitDialogFixed");
}
this.underlayAttrs={dialogId:this.id,"class":dojo.map(this["class"].split(/\s/),function(s){
return s+"_underlay";
}).join(" ")};
},_size:function(){
this._checkIfSingleChild();
if(this._singleChild){
if(this._singleChildOriginalStyle){
this._singleChild.domNode.style.cssText=this._singleChildOriginalStyle;
}
delete this._singleChildOriginalStyle;
}else{
dojo.style(this.containerNode,{width:"auto",height:"auto"});
}
var mb=dojo._getMarginSize(this.domNode);
var _36c=dojo.window.getBox();
if(mb.w>=_36c.w||mb.h>=_36c.h){
var w=Math.min(mb.w,Math.floor(_36c.w*0.75)),h=Math.min(mb.h,Math.floor(_36c.h*0.75));
if(this._singleChild&&this._singleChild.resize){
this._singleChildOriginalStyle=this._singleChild.domNode.style.cssText;
this._singleChild.resize({w:w,h:h});
}else{
dojo.style(this.containerNode,{width:w+"px",height:h+"px",overflow:"auto",position:"relative"});
}
}else{
if(this._singleChild&&this._singleChild.resize){
this._singleChild.resize();
}
}
},_position:function(){
if(!dojo.hasClass(dojo.body(),"dojoMove")){
var node=this.domNode,_36d=dojo.window.getBox(),p=this._relativePosition,bb=p?null:dojo._getBorderBox(node),l=Math.floor(_36d.l+(p?p.x:(_36d.w-bb.w)/2)),t=Math.floor(_36d.t+(p?p.y:(_36d.h-bb.h)/2));
dojo.style(node,{left:l+"px",top:t+"px"});
}
},_onKey:function(evt){
if(evt.charOrCode){
var dk=dojo.keys;
var node=evt.target;
if(evt.charOrCode===dk.TAB){
this._getFocusItems(this.domNode);
}
var _36e=(this._firstFocusItem==this._lastFocusItem);
if(node==this._firstFocusItem&&evt.shiftKey&&evt.charOrCode===dk.TAB){
if(!_36e){
dijit.focus(this._lastFocusItem);
}
dojo.stopEvent(evt);
}else{
if(node==this._lastFocusItem&&evt.charOrCode===dk.TAB&&!evt.shiftKey){
if(!_36e){
dijit.focus(this._firstFocusItem);
}
dojo.stopEvent(evt);
}else{
while(node){
if(node==this.domNode||dojo.hasClass(node,"dijitPopup")){
if(evt.charOrCode==dk.ESCAPE){
this.onCancel();
}else{
return;
}
}
node=node.parentNode;
}
if(evt.charOrCode!==dk.TAB){
dojo.stopEvent(evt);
}else{
if(!dojo.isOpera){
try{
this._firstFocusItem.focus();
}
catch(e){
}
}
}
}
}
}
},show:function(){
if(this.open){
return;
}
if(!this._started){
this.startup();
}
if(!this._alreadyInitialized){
this._setup();
this._alreadyInitialized=true;
}
if(this._fadeOutDeferred){
this._fadeOutDeferred.cancel();
}
this._modalconnects.push(dojo.connect(window,"onscroll",this,"layout"));
this._modalconnects.push(dojo.connect(window,"onresize",this,function(){
var _36f=dojo.window.getBox();
if(!this._oldViewport||_36f.h!=this._oldViewport.h||_36f.w!=this._oldViewport.w){
this.layout();
this._oldViewport=_36f;
}
}));
this._modalconnects.push(dojo.connect(this.domNode,"onkeypress",this,"_onKey"));
dojo.style(this.domNode,{opacity:0,display:""});
this._set("open",true);
this._onShow();
this._size();
this._position();
var _370;
this._fadeInDeferred=new dojo.Deferred(dojo.hitch(this,function(){
_370.stop();
delete this._fadeInDeferred;
}));
_370=dojo.fadeIn({node:this.domNode,duration:this.duration,beforeBegin:dojo.hitch(this,function(){
dijit._DialogLevelManager.show(this,this.underlayAttrs);
}),onEnd:dojo.hitch(this,function(){
if(this.autofocus&&dijit._DialogLevelManager.isTop(this)){
this._getFocusItems(this.domNode);
dijit.focus(this._firstFocusItem);
}
this._fadeInDeferred.callback(true);
delete this._fadeInDeferred;
})}).play();
return this._fadeInDeferred;
},hide:function(){
if(!this._alreadyInitialized){
return;
}
if(this._fadeInDeferred){
this._fadeInDeferred.cancel();
}
var _371;
this._fadeOutDeferred=new dojo.Deferred(dojo.hitch(this,function(){
_371.stop();
delete this._fadeOutDeferred;
}));
_371=dojo.fadeOut({node:this.domNode,duration:this.duration,onEnd:dojo.hitch(this,function(){
this.domNode.style.display="none";
dijit._DialogLevelManager.hide(this);
this.onHide();
this._fadeOutDeferred.callback(true);
delete this._fadeOutDeferred;
})}).play();
if(this._scrollConnected){
this._scrollConnected=false;
}
dojo.forEach(this._modalconnects,dojo.disconnect);
this._modalconnects=[];
if(this._relativePosition){
delete this._relativePosition;
}
this._set("open",false);
return this._fadeOutDeferred;
},layout:function(){
if(this.domNode.style.display!="none"){
if(dijit._underlay){
dijit._underlay.layout();
}
this._position();
}
},destroy:function(){
if(this._fadeInDeferred){
this._fadeInDeferred.cancel();
}
if(this._fadeOutDeferred){
this._fadeOutDeferred.cancel();
}
if(this._moveable){
this._moveable.destroy();
}
if(this._dndListener){
dojo.unsubscribe(this._dndListener);
}
dojo.forEach(this._modalconnects,dojo.disconnect);
dijit._DialogLevelManager.hide(this);
this.inherited(arguments);
}});
dojo.declare("dijit.Dialog",[dijit.layout.ContentPane,dijit._DialogBase],{});
dijit._DialogLevelManager={show:function(_372,_373){
var ds=dijit._dialogStack;
ds[ds.length-1].focus=dijit.getFocus(_372);
var _374=dijit._underlay;
if(!_374||_374._destroyed){
_374=dijit._underlay=new dijit.DialogUnderlay(_373);
}else{
_374.set(_372.underlayAttrs);
}
var _375=ds[ds.length-1].dialog?ds[ds.length-1].zIndex+2:950;
if(ds.length==1){
_374.show();
}
dojo.style(dijit._underlay.domNode,"zIndex",_375-1);
dojo.style(_372.domNode,"zIndex",_375);
ds.push({dialog:_372,underlayAttrs:_373,zIndex:_375});
},hide:function(_376){
var ds=dijit._dialogStack;
if(ds[ds.length-1].dialog==_376){
ds.pop();
var pd=ds[ds.length-1];
if(ds.length==1){
if(!dijit._underlay._destroyed){
dijit._underlay.hide();
}
}else{
dojo.style(dijit._underlay.domNode,"zIndex",pd.zIndex-1);
dijit._underlay.set(pd.underlayAttrs);
}
if(_376.refocus){
var _377=pd.focus;
if(!_377||(pd.dialog&&!dojo.isDescendant(_377.node,pd.dialog.domNode))){
pd.dialog._getFocusItems(pd.dialog.domNode);
_377=pd.dialog._firstFocusItem;
}
try{
dijit.focus(_377);
}
catch(e){
}
}
}else{
var idx=dojo.indexOf(dojo.map(ds,function(elem){
return elem.dialog;
}),_376);
if(idx!=-1){
ds.splice(idx,1);
}
}
},isTop:function(_378){
var ds=dijit._dialogStack;
return ds[ds.length-1].dialog==_378;
}};
dijit._dialogStack=[{dialog:null,focus:null,underlayAttrs:null}];
}
if(!dojo._hasResource["dojo.regexp"]){
dojo._hasResource["dojo.regexp"]=true;
dojo.provide("dojo.regexp");
dojo.getObject("regexp",true,dojo);
dojo.regexp.escapeString=function(str,_379){
return str.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g,function(ch){
if(_379&&_379.indexOf(ch)!=-1){
return ch;
}
return "\\"+ch;
});
};
dojo.regexp.buildGroupRE=function(arr,re,_37a){
if(!(arr instanceof Array)){
return re(arr);
}
var b=[];
for(var i=0;i<arr.length;i++){
b.push(re(arr[i]));
}
return dojo.regexp.group(b.join("|"),_37a);
};
dojo.regexp.group=function(_37b,_37c){
return "("+(_37c?"?:":"")+_37b+")";
};
}
if(!dojo._hasResource["dijit.form._FormWidget"]){
dojo._hasResource["dijit.form._FormWidget"]=true;
dojo.provide("dijit.form._FormWidget");
dojo.declare("dijit.form._FormWidget",[dijit._Widget,dijit._Templated,dijit._CssStateMixin],{name:"",alt:"",value:"",type:"text",tabIndex:"0",disabled:false,intermediateChanges:false,scrollOnFocus:true,attributeMap:dojo.delegate(dijit._Widget.prototype.attributeMap,{value:"focusNode",id:"focusNode",tabIndex:"focusNode",alt:"focusNode",title:"focusNode"}),postMixInProperties:function(){
this.nameAttrSetting=this.name?("name=\""+this.name.replace(/'/g,"&quot;")+"\""):"";
this.inherited(arguments);
},postCreate:function(){
this.inherited(arguments);
this.connect(this.domNode,"onmousedown","_onMouseDown");
},_setDisabledAttr:function(_37d){
this._set("disabled",_37d);
dojo.attr(this.focusNode,"disabled",_37d);
if(this.valueNode){
dojo.attr(this.valueNode,"disabled",_37d);
}
dijit.setWaiState(this.focusNode,"disabled",_37d);
if(_37d){
this._set("hovering",false);
this._set("active",false);
var _37e="tabIndex" in this.attributeMap?this.attributeMap.tabIndex:"focusNode";
dojo.forEach(dojo.isArray(_37e)?_37e:[_37e],function(_37f){
var node=this[_37f];
if(dojo.isWebKit||dijit.hasDefaultTabStop(node)){
node.setAttribute("tabIndex","-1");
}else{
node.removeAttribute("tabIndex");
}
},this);
}else{
if(this.tabIndex!=""){
this.focusNode.setAttribute("tabIndex",this.tabIndex);
}
}
},setDisabled:function(_380){
dojo.deprecated("setDisabled("+_380+") is deprecated. Use set('disabled',"+_380+") instead.","","2.0");
this.set("disabled",_380);
},_onFocus:function(e){
if(this.scrollOnFocus){
dojo.window.scrollIntoView(this.domNode);
}
this.inherited(arguments);
},isFocusable:function(){
return !this.disabled&&this.focusNode&&(dojo.style(this.domNode,"display")!="none");
},focus:function(){
if(!this.disabled){
dijit.focus(this.focusNode);
}
},compare:function(val1,val2){
if(typeof val1=="number"&&typeof val2=="number"){
return (isNaN(val1)&&isNaN(val2))?0:val1-val2;
}else{
if(val1>val2){
return 1;
}else{
if(val1<val2){
return -1;
}else{
return 0;
}
}
}
},onChange:function(_381){
},_onChangeActive:false,_handleOnChange:function(_382,_383){
if(this._lastValueReported==undefined&&(_383===null||!this._onChangeActive)){
this._resetValue=this._lastValueReported=_382;
}
this._pendingOnChange=this._pendingOnChange||(typeof _382!=typeof this._lastValueReported)||(this.compare(_382,this._lastValueReported)!=0);
if((this.intermediateChanges||_383||_383===undefined)&&this._pendingOnChange){
this._lastValueReported=_382;
this._pendingOnChange=false;
if(this._onChangeActive){
if(this._onChangeHandle){
clearTimeout(this._onChangeHandle);
}
this._onChangeHandle=setTimeout(dojo.hitch(this,function(){
this._onChangeHandle=null;
this.onChange(_382);
}),0);
}
}
},create:function(){
this.inherited(arguments);
this._onChangeActive=true;
},destroy:function(){
if(this._onChangeHandle){
clearTimeout(this._onChangeHandle);
this.onChange(this._lastValueReported);
}
this.inherited(arguments);
},setValue:function(_384){
dojo.deprecated("dijit.form._FormWidget:setValue("+_384+") is deprecated.  Use set('value',"+_384+") instead.","","2.0");
this.set("value",_384);
},getValue:function(){
dojo.deprecated(this.declaredClass+"::getValue() is deprecated. Use get('value') instead.","","2.0");
return this.get("value");
},_onMouseDown:function(e){
if(!e.ctrlKey&&dojo.mouseButtons.isLeft(e)&&this.isFocusable()){
var _385=this.connect(dojo.body(),"onmouseup",function(){
if(this.isFocusable()){
this.focus();
}
this.disconnect(_385);
});
}
}});
dojo.declare("dijit.form._FormValueWidget",dijit.form._FormWidget,{readOnly:false,attributeMap:dojo.delegate(dijit.form._FormWidget.prototype.attributeMap,{value:"",readOnly:"focusNode"}),_setReadOnlyAttr:function(_386){
dojo.attr(this.focusNode,"readOnly",_386);
dijit.setWaiState(this.focusNode,"readonly",_386);
this._set("readOnly",_386);
},postCreate:function(){
this.inherited(arguments);
if(dojo.isIE){
this.connect(this.focusNode||this.domNode,"onkeydown",this._onKeyDown);
}
if(this._resetValue===undefined){
this._lastValueReported=this._resetValue=this.value;
}
},_setValueAttr:function(_387,_388){
this._handleOnChange(_387,_388);
},_handleOnChange:function(_389,_38a){
this._set("value",_389);
this.inherited(arguments);
},undo:function(){
this._setValueAttr(this._lastValueReported,false);
},reset:function(){
this._hasBeenBlurred=false;
this._setValueAttr(this._resetValue,true);
},_onKeyDown:function(e){
if(e.keyCode==dojo.keys.ESCAPE&&!(e.ctrlKey||e.altKey||e.metaKey)){
var te;
if(dojo.isIE){
e.preventDefault();
te=document.createEventObject();
te.keyCode=dojo.keys.ESCAPE;
te.shiftKey=e.shiftKey;
e.srcElement.fireEvent("onkeypress",te);
}
}
},_layoutHackIE7:function(){
if(dojo.isIE==7){
var _38b=this.domNode;
var _38c=_38b.parentNode;
var _38d=_38b.firstChild||_38b;
var _38e=_38d.style.filter;
var _38f=this;
while(_38c&&_38c.clientHeight==0){
(function ping(){
var _390=_38f.connect(_38c,"onscroll",function(e){
_38f.disconnect(_390);
_38d.style.filter=(new Date()).getMilliseconds();
setTimeout(function(){
_38d.style.filter=_38e;
},0);
});
})();
_38c=_38c.parentNode;
}
}
}});
}
if(!dojo._hasResource["dijit.form.TextBox"]){
dojo._hasResource["dijit.form.TextBox"]=true;
dojo.provide("dijit.form.TextBox");
dojo.declare("dijit.form.TextBox",dijit.form._FormValueWidget,{trim:false,uppercase:false,lowercase:false,propercase:false,maxLength:"",selectOnClick:false,placeHolder:"",templateString:dojo.cache("dijit.form","templates/TextBox.html","<div class=\"dijit dijitReset dijitInline dijitLeft\" id=\"widget_${id}\" role=\"presentation\"\r\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\r\n\t\t><input class=\"dijitReset dijitInputInner\" dojoAttachPoint='textbox,focusNode' autocomplete=\"off\"\r\n\t\t\t${!nameAttrSetting} type='${type}'\r\n\t/></div\r\n></div>\r\n"),_singleNodeTemplate:"<input class=\"dijit dijitReset dijitLeft dijitInputField\" dojoAttachPoint=\"textbox,focusNode\" autocomplete=\"off\" type=\"${type}\" ${!nameAttrSetting} />",_buttonInputDisabled:dojo.isIE?"disabled":"",baseClass:"dijitTextBox",attributeMap:dojo.delegate(dijit.form._FormValueWidget.prototype.attributeMap,{maxLength:"focusNode"}),postMixInProperties:function(){
var type=this.type.toLowerCase();
if(this.templateString&&this.templateString.toLowerCase()=="input"||((type=="hidden"||type=="file")&&this.templateString==dijit.form.TextBox.prototype.templateString)){
this.templateString=this._singleNodeTemplate;
}
this.inherited(arguments);
},_setPlaceHolderAttr:function(v){
this._set("placeHolder",v);
if(!this._phspan){
this._attachPoints.push("_phspan");
this._phspan=dojo.create("span",{className:"dijitPlaceHolder dijitInputField"},this.textbox,"after");
}
this._phspan.innerHTML="";
this._phspan.appendChild(document.createTextNode(v));
this._updatePlaceHolder();
},_updatePlaceHolder:function(){
if(this._phspan){
this._phspan.style.display=(this.placeHolder&&!this._focused&&!this.textbox.value)?"":"none";
}
},_getValueAttr:function(){
return this.parse(this.get("displayedValue"),this.constraints);
},_setValueAttr:function(_391,_392,_393){
var _394;
if(_391!==undefined){
_394=this.filter(_391);
if(typeof _393!="string"){
if(_394!==null&&((typeof _394!="number")||!isNaN(_394))){
_393=this.filter(this.format(_394,this.constraints));
}else{
_393="";
}
}
}
if(_393!=null&&_393!=undefined&&((typeof _393)!="number"||!isNaN(_393))&&this.textbox.value!=_393){
this.textbox.value=_393;
this._set("displayedValue",this.get("displayedValue"));
}
this._updatePlaceHolder();
this.inherited(arguments,[_394,_392]);
},displayedValue:"",getDisplayedValue:function(){
dojo.deprecated(this.declaredClass+"::getDisplayedValue() is deprecated. Use set('displayedValue') instead.","","2.0");
return this.get("displayedValue");
},_getDisplayedValueAttr:function(){
return this.filter(this.textbox.value);
},setDisplayedValue:function(_395){
dojo.deprecated(this.declaredClass+"::setDisplayedValue() is deprecated. Use set('displayedValue', ...) instead.","","2.0");
this.set("displayedValue",_395);
},_setDisplayedValueAttr:function(_396){
if(_396===null||_396===undefined){
_396="";
}else{
if(typeof _396!="string"){
_396=String(_396);
}
}
this.textbox.value=_396;
this._setValueAttr(this.get("value"),undefined);
this._set("displayedValue",this.get("displayedValue"));
},format:function(_397,_398){
return ((_397==null||_397==undefined)?"":(_397.toString?_397.toString():_397));
},parse:function(_399,_39a){
return _399;
},_refreshState:function(){
},_onInput:function(e){
if(e&&e.type&&/key/i.test(e.type)&&e.keyCode){
switch(e.keyCode){
case dojo.keys.SHIFT:
case dojo.keys.ALT:
case dojo.keys.CTRL:
case dojo.keys.TAB:
return;
}
}
if(this.intermediateChanges){
var _39b=this;
setTimeout(function(){
_39b._handleOnChange(_39b.get("value"),false);
},0);
}
this._refreshState();
this._set("displayedValue",this.get("displayedValue"));
},postCreate:function(){
if(dojo.isIE){
setTimeout(dojo.hitch(this,function(){
var s=dojo.getComputedStyle(this.domNode);
if(s){
var ff=s.fontFamily;
if(ff){
var _39c=this.domNode.getElementsByTagName("INPUT");
if(_39c){
for(var i=0;i<_39c.length;i++){
_39c[i].style.fontFamily=ff;
}
}
}
}
}),0);
}
this.textbox.setAttribute("value",this.textbox.value);
this.inherited(arguments);
if(dojo.isMoz||dojo.isOpera){
this.connect(this.textbox,"oninput","_onInput");
}else{
this.connect(this.textbox,"onkeydown","_onInput");
this.connect(this.textbox,"onkeyup","_onInput");
this.connect(this.textbox,"onpaste","_onInput");
this.connect(this.textbox,"oncut","_onInput");
}
},_blankValue:"",filter:function(val){
if(val===null){
return this._blankValue;
}
if(typeof val!="string"){
return val;
}
if(this.trim){
val=dojo.trim(val);
}
if(this.uppercase){
val=val.toUpperCase();
}
if(this.lowercase){
val=val.toLowerCase();
}
if(this.propercase){
val=val.replace(/[^\s]+/g,function(word){
return word.substring(0,1).toUpperCase()+word.substring(1);
});
}
return val;
},_setBlurValue:function(){
this._setValueAttr(this.get("value"),true);
},_onBlur:function(e){
if(this.disabled){
return;
}
this._setBlurValue();
this.inherited(arguments);
if(this._selectOnClickHandle){
this.disconnect(this._selectOnClickHandle);
}
if(this.selectOnClick&&dojo.isMoz){
this.textbox.selectionStart=this.textbox.selectionEnd=undefined;
}
this._updatePlaceHolder();
},_onFocus:function(by){
if(this.disabled||this.readOnly){
return;
}
if(this.selectOnClick&&by=="mouse"){
this._selectOnClickHandle=this.connect(this.domNode,"onmouseup",function(){
this.disconnect(this._selectOnClickHandle);
var _39d;
if(dojo.isIE){
var _39e=dojo.doc.selection.createRange();
var _39f=_39e.parentElement();
_39d=_39f==this.textbox&&_39e.text.length==0;
}else{
_39d=this.textbox.selectionStart==this.textbox.selectionEnd;
}
if(_39d){
dijit.selectInputText(this.textbox);
}
});
}
this._updatePlaceHolder();
this.inherited(arguments);
this._refreshState();
},reset:function(){
this.textbox.value="";
this.inherited(arguments);
}});
dijit.selectInputText=function(_3a0,_3a1,stop){
var _3a2=dojo.global;
var _3a3=dojo.doc;
_3a0=dojo.byId(_3a0);
if(isNaN(_3a1)){
_3a1=0;
}
if(isNaN(stop)){
stop=_3a0.value?_3a0.value.length:0;
}
dijit.focus(_3a0);
if(_3a3["selection"]&&dojo.body()["createTextRange"]){
if(_3a0.createTextRange){
var r=_3a0.createTextRange();
r.collapse(true);
r.moveStart("character",-99999);
r.moveStart("character",_3a1);
r.moveEnd("character",stop-_3a1);
r.select();
}
}else{
if(_3a2["getSelection"]){
if(_3a0.setSelectionRange){
_3a0.setSelectionRange(_3a1,stop);
}
}
}
};
}
if(!dojo._hasResource["dijit.Tooltip"]){
dojo._hasResource["dijit.Tooltip"]=true;
dojo.provide("dijit.Tooltip");
dojo.declare("dijit._MasterTooltip",[dijit._Widget,dijit._Templated],{duration:dijit.defaultDuration,templateString:dojo.cache("dijit","templates/Tooltip.html","<div class=\"dijitTooltip dijitTooltipLeft\" id=\"dojoTooltip\"\r\n\t><div class=\"dijitTooltipContainer dijitTooltipContents\" dojoAttachPoint=\"containerNode\" role='alert'></div\r\n\t><div class=\"dijitTooltipConnector\" dojoAttachPoint=\"connectorNode\"></div\r\n></div>\r\n"),postCreate:function(){
dojo.body().appendChild(this.domNode);
this.bgIframe=new dijit.BackgroundIframe(this.domNode);
this.fadeIn=dojo.fadeIn({node:this.domNode,duration:this.duration,onEnd:dojo.hitch(this,"_onShow")});
this.fadeOut=dojo.fadeOut({node:this.domNode,duration:this.duration,onEnd:dojo.hitch(this,"_onHide")});
},show:function(_3a4,_3a5,_3a6,rtl){
if(this.aroundNode&&this.aroundNode===_3a5){
return;
}
this.domNode.width="auto";
if(this.fadeOut.status()=="playing"){
this._onDeck=arguments;
return;
}
this.containerNode.innerHTML=_3a4;
var pos=dijit.placeOnScreenAroundElement(this.domNode,_3a5,dijit.getPopupAroundAlignment((_3a6&&_3a6.length)?_3a6:dijit.Tooltip.defaultPosition,!rtl),dojo.hitch(this,"orient"));
dojo.style(this.domNode,"opacity",0);
this.fadeIn.play();
this.isShowingNow=true;
this.aroundNode=_3a5;
},orient:function(node,_3a7,_3a8,_3a9,_3aa){
this.connectorNode.style.top="";
var _3ab=_3a9.w-this.connectorNode.offsetWidth;
node.className="dijitTooltip "+{"BL-TL":"dijitTooltipBelow dijitTooltipABLeft","TL-BL":"dijitTooltipAbove dijitTooltipABLeft","BR-TR":"dijitTooltipBelow dijitTooltipABRight","TR-BR":"dijitTooltipAbove dijitTooltipABRight","BR-BL":"dijitTooltipRight","BL-BR":"dijitTooltipLeft"}[_3a7+"-"+_3a8];
this.domNode.style.width="auto";
var size=dojo.contentBox(this.domNode);
var _3ac=Math.min((Math.max(_3ab,1)),size.w);
var _3ad=_3ac<size.w;
this.domNode.style.width=_3ac+"px";
if(_3ad){
this.containerNode.style.overflow="auto";
var _3ae=this.containerNode.scrollWidth;
this.containerNode.style.overflow="visible";
if(_3ae>_3ac){
_3ae=_3ae+dojo.style(this.domNode,"paddingLeft")+dojo.style(this.domNode,"paddingRight");
this.domNode.style.width=_3ae+"px";
}
}
if(_3a8.charAt(0)=="B"&&_3a7.charAt(0)=="B"){
var mb=dojo.marginBox(node);
var _3af=this.connectorNode.offsetHeight;
if(mb.h>_3a9.h){
var _3b0=_3a9.h-(_3aa.h/2)-(_3af/2);
this.connectorNode.style.top=_3b0+"px";
this.connectorNode.style.bottom="";
}else{
this.connectorNode.style.bottom=Math.min(Math.max(_3aa.h/2-_3af/2,0),mb.h-_3af)+"px";
this.connectorNode.style.top="";
}
}else{
this.connectorNode.style.top="";
this.connectorNode.style.bottom="";
}
return Math.max(0,size.w-_3ab);
},_onShow:function(){
if(dojo.isIE){
this.domNode.style.filter="";
}
},hide:function(_3b1){
if(this._onDeck&&this._onDeck[1]==_3b1){
this._onDeck=null;
}else{
if(this.aroundNode===_3b1){
this.fadeIn.stop();
this.isShowingNow=false;
this.aroundNode=null;
this.fadeOut.play();
}else{
}
}
},_onHide:function(){
this.domNode.style.cssText="";
this.containerNode.innerHTML="";
if(this._onDeck){
this.show.apply(this,this._onDeck);
this._onDeck=null;
}
}});
dijit.showTooltip=function(_3b2,_3b3,_3b4,rtl){
if(!dijit._masterTT){
dijit._masterTT=new dijit._MasterTooltip();
}
return dijit._masterTT.show(_3b2,_3b3,_3b4,rtl);
};
dijit.hideTooltip=function(_3b5){
if(!dijit._masterTT){
dijit._masterTT=new dijit._MasterTooltip();
}
return dijit._masterTT.hide(_3b5);
};
dojo.declare("dijit.Tooltip",dijit._Widget,{label:"",showDelay:400,connectId:[],position:[],_setConnectIdAttr:function(_3b6){
dojo.forEach(this._connections||[],function(_3b7){
dojo.forEach(_3b7,dojo.hitch(this,"disconnect"));
},this);
var ary=dojo.isArrayLike(_3b6)?_3b6:(_3b6?[_3b6]:[]);
this._connections=dojo.map(ary,function(id){
var node=dojo.byId(id);
return node?[this.connect(node,"onmouseenter","_onTargetMouseEnter"),this.connect(node,"onmouseleave","_onTargetMouseLeave"),this.connect(node,"onfocus","_onTargetFocus"),this.connect(node,"onblur","_onTargetBlur")]:[];
},this);
this._set("connectId",_3b6);
this._connectIds=ary;
},addTarget:function(node){
var id=node.id||node;
if(dojo.indexOf(this._connectIds,id)==-1){
this.set("connectId",this._connectIds.concat(id));
}
},removeTarget:function(node){
var id=node.id||node,idx=dojo.indexOf(this._connectIds,id);
if(idx>=0){
this._connectIds.splice(idx,1);
this.set("connectId",this._connectIds);
}
},buildRendering:function(){
this.inherited(arguments);
dojo.addClass(this.domNode,"dijitTooltipData");
},startup:function(){
this.inherited(arguments);
var ids=this.connectId;
dojo.forEach(dojo.isArrayLike(ids)?ids:[ids],this.addTarget,this);
},_onTargetMouseEnter:function(e){
this._onHover(e);
},_onTargetMouseLeave:function(e){
this._onUnHover(e);
},_onTargetFocus:function(e){
this._focus=true;
this._onHover(e);
},_onTargetBlur:function(e){
this._focus=false;
this._onUnHover(e);
},_onHover:function(e){
if(!this._showTimer){
var _3b8=e.target;
this._showTimer=setTimeout(dojo.hitch(this,function(){
this.open(_3b8);
}),this.showDelay);
}
},_onUnHover:function(e){
if(this._focus){
return;
}
if(this._showTimer){
clearTimeout(this._showTimer);
delete this._showTimer;
}
this.close();
},open:function(_3b9){
if(this._showTimer){
clearTimeout(this._showTimer);
delete this._showTimer;
}
dijit.showTooltip(this.label||this.domNode.innerHTML,_3b9,this.position,!this.isLeftToRight());
this._connectNode=_3b9;
this.onShow(_3b9,this.position);
},close:function(){
if(this._connectNode){
dijit.hideTooltip(this._connectNode);
delete this._connectNode;
this.onHide();
}
if(this._showTimer){
clearTimeout(this._showTimer);
delete this._showTimer;
}
},onShow:function(_3ba,_3bb){
},onHide:function(){
},uninitialize:function(){
this.close();
this.inherited(arguments);
}});
dijit.Tooltip.defaultPosition=["after","before"];
}
if(!dojo._hasResource["dijit.form.ValidationTextBox"]){
dojo._hasResource["dijit.form.ValidationTextBox"]=true;
dojo.provide("dijit.form.ValidationTextBox");
dojo.declare("dijit.form.ValidationTextBox",dijit.form.TextBox,{templateString:dojo.cache("dijit.form","templates/ValidationTextBox.html","<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\r\n\tid=\"widget_${id}\" role=\"presentation\"\r\n\t><div class='dijitReset dijitValidationContainer'\r\n\t\t><input class=\"dijitReset dijitInputField dijitValidationIcon dijitValidationInner\" value=\"&#935;\" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\r\n\t/></div\r\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\r\n\t\t><input class=\"dijitReset dijitInputInner\" dojoAttachPoint='textbox,focusNode' autocomplete=\"off\"\r\n\t\t\t${!nameAttrSetting} type='${type}'\r\n\t/></div\r\n></div>\r\n"),baseClass:"dijitTextBox dijitValidationTextBox",required:false,promptMessage:"",invalidMessage:"$_unset_$",missingMessage:"$_unset_$",message:"",constraints:{},regExp:".*",regExpGen:function(_3bc){
return this.regExp;
},state:"",tooltipPosition:[],_setValueAttr:function(){
this.inherited(arguments);
this.validate(this._focused);
},validator:function(_3bd,_3be){
return (new RegExp("^(?:"+this.regExpGen(_3be)+")"+(this.required?"":"?")+"$")).test(_3bd)&&(!this.required||!this._isEmpty(_3bd))&&(this._isEmpty(_3bd)||this.parse(_3bd,_3be)!==undefined);
},_isValidSubset:function(){
return this.textbox.value.search(this._partialre)==0;
},isValid:function(_3bf){
return this.validator(this.textbox.value,this.constraints);
},_isEmpty:function(_3c0){
return (this.trim?/^\s*$/:/^$/).test(_3c0);
},getErrorMessage:function(_3c1){
return (this.required&&this._isEmpty(this.textbox.value))?this.missingMessage:this.invalidMessage;
},getPromptMessage:function(_3c2){
return this.promptMessage;
},_maskValidSubsetError:true,validate:function(_3c3){
var _3c4="";
var _3c5=this.disabled||this.isValid(_3c3);
if(_3c5){
this._maskValidSubsetError=true;
}
var _3c6=this._isEmpty(this.textbox.value);
var _3c7=!_3c5&&_3c3&&this._isValidSubset();
this._set("state",_3c5?"":(((((!this._hasBeenBlurred||_3c3)&&_3c6)||_3c7)&&this._maskValidSubsetError)?"Incomplete":"Error"));
dijit.setWaiState(this.focusNode,"invalid",_3c5?"false":"true");
if(this.state=="Error"){
this._maskValidSubsetError=_3c3&&_3c7;
_3c4=this.getErrorMessage(_3c3);
}else{
if(this.state=="Incomplete"){
_3c4=this.getPromptMessage(_3c3);
this._maskValidSubsetError=!this._hasBeenBlurred||_3c3;
}else{
if(_3c6){
_3c4=this.getPromptMessage(_3c3);
}
}
}
this.set("message",_3c4);
return _3c5;
},displayMessage:function(_3c8){
dijit.hideTooltip(this.domNode);
if(_3c8&&this._focused){
dijit.showTooltip(_3c8,this.domNode,this.tooltipPosition,!this.isLeftToRight());
}
},_refreshState:function(){
this.validate(this._focused);
this.inherited(arguments);
},constructor:function(){
this.constraints={};
},_setConstraintsAttr:function(_3c9){
if(!_3c9.locale&&this.lang){
_3c9.locale=this.lang;
}
this._set("constraints",_3c9);
this._computePartialRE();
},_computePartialRE:function(){
var p=this.regExpGen(this.constraints);
this.regExp=p;
var _3ca="";
if(p!=".*"){
this.regExp.replace(/\\.|\[\]|\[.*?[^\\]{1}\]|\{.*?\}|\(\?[=:!]|./g,function(re){
switch(re.charAt(0)){
case "{":
case "+":
case "?":
case "*":
case "^":
case "$":
case "|":
case "(":
_3ca+=re;
break;
case ")":
_3ca+="|$)";
break;
default:
_3ca+="(?:"+re+"|$)";
break;
}
});
}
try{
"".search(_3ca);
}
catch(e){
_3ca=this.regExp;
console.warn("RegExp error in "+this.declaredClass+": "+this.regExp);
}
this._partialre="^(?:"+_3ca+")$";
},postMixInProperties:function(){
this.inherited(arguments);
this.messages=dojo.i18n.getLocalization("dijit.form","validate",this.lang);
if(this.invalidMessage=="$_unset_$"){
this.invalidMessage=this.messages.invalidMessage;
}
if(!this.invalidMessage){
this.invalidMessage=this.promptMessage;
}
if(this.missingMessage=="$_unset_$"){
this.missingMessage=this.messages.missingMessage;
}
if(!this.missingMessage){
this.missingMessage=this.invalidMessage;
}
this._setConstraintsAttr(this.constraints);
},_setDisabledAttr:function(_3cb){
this.inherited(arguments);
this._refreshState();
},_setRequiredAttr:function(_3cc){
this._set("required",_3cc);
dijit.setWaiState(this.focusNode,"required",_3cc);
this._refreshState();
},_setMessageAttr:function(_3cd){
this._set("message",_3cd);
this.displayMessage(_3cd);
},reset:function(){
this._maskValidSubsetError=true;
this.inherited(arguments);
},_onBlur:function(){
this.displayMessage("");
this.inherited(arguments);
}});
dojo.declare("dijit.form.MappedTextBox",dijit.form.ValidationTextBox,{postMixInProperties:function(){
this.inherited(arguments);
this.nameAttrSetting="";
},serialize:function(val,_3ce){
return val.toString?val.toString():"";
},toString:function(){
var val=this.filter(this.get("value"));
return val!=null?(typeof val=="string"?val:this.serialize(val,this.constraints)):"";
},validate:function(){
this.valueNode.value=this.toString();
return this.inherited(arguments);
},buildRendering:function(){
this.inherited(arguments);
this.valueNode=dojo.place("<input type='hidden'"+(this.name?" name='"+this.name.replace(/'/g,"&quot;")+"'":"")+"/>",this.textbox,"after");
},reset:function(){
this.valueNode.value="";
this.inherited(arguments);
}});
dojo.declare("dijit.form.RangeBoundTextBox",dijit.form.MappedTextBox,{rangeMessage:"",rangeCheck:function(_3cf,_3d0){
return ("min" in _3d0?(this.compare(_3cf,_3d0.min)>=0):true)&&("max" in _3d0?(this.compare(_3cf,_3d0.max)<=0):true);
},isInRange:function(_3d1){
return this.rangeCheck(this.get("value"),this.constraints);
},_isDefinitelyOutOfRange:function(){
var val=this.get("value");
var _3d2=false;
var _3d3=false;
if("min" in this.constraints){
var min=this.constraints.min;
min=this.compare(val,((typeof min=="number")&&min>=0&&val!=0)?0:min);
_3d2=(typeof min=="number")&&min<0;
}
if("max" in this.constraints){
var max=this.constraints.max;
max=this.compare(val,((typeof max!="number")||max>0)?max:0);
_3d3=(typeof max=="number")&&max>0;
}
return _3d2||_3d3;
},_isValidSubset:function(){
return this.inherited(arguments)&&!this._isDefinitelyOutOfRange();
},isValid:function(_3d4){
return this.inherited(arguments)&&((this._isEmpty(this.textbox.value)&&!this.required)||this.isInRange(_3d4));
},getErrorMessage:function(_3d5){
var v=this.get("value");
if(v!==null&&v!==""&&v!==undefined&&(typeof v!="number"||!isNaN(v))&&!this.isInRange(_3d5)){
return this.rangeMessage;
}
return this.inherited(arguments);
},postMixInProperties:function(){
this.inherited(arguments);
if(!this.rangeMessage){
this.messages=dojo.i18n.getLocalization("dijit.form","validate",this.lang);
this.rangeMessage=this.messages.rangeMessage;
}
},_setConstraintsAttr:function(_3d6){
this.inherited(arguments);
if(this.focusNode){
if(this.constraints.min!==undefined){
dijit.setWaiState(this.focusNode,"valuemin",this.constraints.min);
}else{
dijit.removeWaiState(this.focusNode,"valuemin");
}
if(this.constraints.max!==undefined){
dijit.setWaiState(this.focusNode,"valuemax",this.constraints.max);
}else{
dijit.removeWaiState(this.focusNode,"valuemax");
}
}
},_setValueAttr:function(_3d7,_3d8){
dijit.setWaiState(this.focusNode,"valuenow",_3d7);
this.inherited(arguments);
}});
}
if(!dojo._hasResource["dijit._HasDropDown"]){
dojo._hasResource["dijit._HasDropDown"]=true;
dojo.provide("dijit._HasDropDown");
dojo.declare("dijit._HasDropDown",null,{_buttonNode:null,_arrowWrapperNode:null,_popupStateNode:null,_aroundNode:null,dropDown:null,autoWidth:true,forceWidth:false,maxHeight:0,dropDownPosition:["below","above"],_stopClickEvents:true,_onDropDownMouseDown:function(e){
if(this.disabled||this.readOnly){
return;
}
this._docHandler=this.connect(dojo.doc,"onmouseup","_onDropDownMouseUp");
this.toggleDropDown();
},_onDropDownMouseUp:function(e){
if(e&&this._docHandler){
this.disconnect(this._docHandler);
}
var _3d9=this.dropDown,_3da=false;
if(e&&this._opened){
var c=dojo.position(this._buttonNode,true);
if(!(e.pageX>=c.x&&e.pageX<=c.x+c.w)||!(e.pageY>=c.y&&e.pageY<=c.y+c.h)){
var t=e.target;
while(t&&!_3da){
if(dojo.hasClass(t,"dijitPopup")){
_3da=true;
}else{
t=t.parentNode;
}
}
if(_3da){
t=e.target;
if(_3d9.onItemClick){
var _3db;
while(t&&!(_3db=dijit.byNode(t))){
t=t.parentNode;
}
if(_3db&&_3db.onClick&&_3db.getParent){
_3db.getParent().onItemClick(_3db,e);
}
}
return;
}
}
}
if(this._opened&&_3d9.focus&&_3d9.autoFocus!==false){
window.setTimeout(dojo.hitch(_3d9,"focus"),1);
}
},_onDropDownClick:function(e){
if(this._stopClickEvents){
dojo.stopEvent(e);
}
},buildRendering:function(){
this.inherited(arguments);
this._buttonNode=this._buttonNode||this.focusNode||this.domNode;
this._popupStateNode=this._popupStateNode||this.focusNode||this._buttonNode;
var _3dc={"after":this.isLeftToRight()?"Right":"Left","before":this.isLeftToRight()?"Left":"Right","above":"Up","below":"Down","left":"Left","right":"Right"}[this.dropDownPosition[0]]||this.dropDownPosition[0]||"Down";
dojo.addClass(this._arrowWrapperNode||this._buttonNode,"dijit"+_3dc+"ArrowButton");
},postCreate:function(){
this.inherited(arguments);
this.connect(this._buttonNode,"onmousedown","_onDropDownMouseDown");
this.connect(this._buttonNode,"onclick","_onDropDownClick");
this.connect(this.focusNode,"onkeypress","_onKey");
},destroy:function(){
if(this.dropDown){
if(!this.dropDown._destroyed){
this.dropDown.destroyRecursive();
}
delete this.dropDown;
}
this.inherited(arguments);
},_onKey:function(e){
if(this.disabled||this.readOnly){
return;
}
var d=this.dropDown,_3dd=e.target;
if(d&&this._opened&&d.handleKey){
if(d.handleKey(e)===false){
dojo.stopEvent(e);
return;
}
}
if(d&&this._opened&&e.charOrCode==dojo.keys.ESCAPE){
this.closeDropDown();
dojo.stopEvent(e);
}else{
if(!this._opened&&(e.charOrCode==dojo.keys.DOWN_ARROW||((e.charOrCode==dojo.keys.ENTER||e.charOrCode==" ")&&((_3dd.tagName||"").toLowerCase()!=="input"||(_3dd.type&&_3dd.type.toLowerCase()!=="text"))))){
this.toggleDropDown();
d=this.dropDown;
if(d&&d.focus){
setTimeout(dojo.hitch(d,"focus"),1);
}
dojo.stopEvent(e);
}
}
},_onBlur:function(){
var _3de=dijit._curFocus&&this.dropDown&&dojo.isDescendant(dijit._curFocus,this.dropDown.domNode);
this.closeDropDown(_3de);
this.inherited(arguments);
},isLoaded:function(){
return true;
},loadDropDown:function(_3df){
_3df();
},toggleDropDown:function(){
if(this.disabled||this.readOnly){
return;
}
if(!this._opened){
if(!this.isLoaded()){
this.loadDropDown(dojo.hitch(this,"openDropDown"));
return;
}else{
this.openDropDown();
}
}else{
this.closeDropDown();
}
},openDropDown:function(){
var _3e0=this.dropDown,_3e1=_3e0.domNode,_3e2=this._aroundNode||this.domNode,self=this;
if(!this._preparedNode){
this._preparedNode=true;
if(_3e1.style.width){
this._explicitDDWidth=true;
}
if(_3e1.style.height){
this._explicitDDHeight=true;
}
}
if(this.maxHeight||this.forceWidth||this.autoWidth){
var _3e3={display:"",visibility:"hidden"};
if(!this._explicitDDWidth){
_3e3.width="";
}
if(!this._explicitDDHeight){
_3e3.height="";
}
dojo.style(_3e1,_3e3);
var _3e4=this.maxHeight;
if(_3e4==-1){
var _3e5=dojo.window.getBox(),_3e6=dojo.position(_3e2,false);
_3e4=Math.floor(Math.max(_3e6.y,_3e5.h-(_3e6.y+_3e6.h)));
}
if(_3e0.startup&&!_3e0._started){
_3e0.startup();
}
dijit.popup.moveOffScreen(_3e0);
var mb=dojo._getMarginSize(_3e1);
var _3e7=(_3e4&&mb.h>_3e4);
dojo.style(_3e1,{overflowX:"hidden",overflowY:_3e7?"auto":"hidden"});
if(_3e7){
mb.h=_3e4;
if("w" in mb){
mb.w+=16;
}
}else{
delete mb.h;
}
if(this.forceWidth){
mb.w=_3e2.offsetWidth;
}else{
if(this.autoWidth){
mb.w=Math.max(mb.w,_3e2.offsetWidth);
}else{
delete mb.w;
}
}
if(dojo.isFunction(_3e0.resize)){
_3e0.resize(mb);
}else{
dojo.marginBox(_3e1,mb);
}
}
var _3e8=dijit.popup.open({parent:this,popup:_3e0,around:_3e2,orient:dijit.getPopupAroundAlignment((this.dropDownPosition&&this.dropDownPosition.length)?this.dropDownPosition:["below"],this.isLeftToRight()),onExecute:function(){
self.closeDropDown(true);
},onCancel:function(){
self.closeDropDown(true);
},onClose:function(){
dojo.attr(self._popupStateNode,"popupActive",false);
dojo.removeClass(self._popupStateNode,"dijitHasDropDownOpen");
self._opened=false;
}});
dojo.attr(this._popupStateNode,"popupActive","true");
dojo.addClass(self._popupStateNode,"dijitHasDropDownOpen");
this._opened=true;
return _3e8;
},closeDropDown:function(_3e9){
if(this._opened){
if(_3e9){
this.focus();
}
dijit.popup.close(this.dropDown);
this._opened=false;
}
}});
}
if(!dojo._hasResource["dijit.form.ComboBox"]){
dojo._hasResource["dijit.form.ComboBox"]=true;
dojo.provide("dijit.form.ComboBox");
dojo.declare("dijit.form.ComboBoxMixin",dijit._HasDropDown,{item:null,pageSize:Infinity,store:null,fetchProperties:{},query:{},autoComplete:true,highlightMatch:"first",searchDelay:100,searchAttr:"name",labelAttr:"",labelType:"text",queryExpr:"${0}*",ignoreCase:true,hasDownArrow:true,templateString:dojo.cache("dijit.form","templates/DropDownBox.html","<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\r\n\tid=\"widget_${id}\"\r\n\trole=\"combobox\"\r\n\t><div class='dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton dijitArrowButtonContainer'\r\n\t\tdojoAttachPoint=\"_buttonNode, _popupStateNode\" role=\"presentation\"\r\n\t\t><input class=\"dijitReset dijitInputField dijitArrowButtonInner\" value=\"&#9660; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\r\n\t\t\t${_buttonInputDisabled}\r\n\t/></div\r\n\t><div class='dijitReset dijitValidationContainer'\r\n\t\t><input class=\"dijitReset dijitInputField dijitValidationIcon dijitValidationInner\" value=\"&#935;\" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\r\n\t/></div\r\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\r\n\t\t><input class='dijitReset dijitInputInner' ${!nameAttrSetting} type=\"text\" autocomplete=\"off\"\r\n\t\t\tdojoAttachPoint=\"textbox,focusNode\" role=\"textbox\" aria-haspopup=\"true\"\r\n\t/></div\r\n></div>\r\n"),baseClass:"dijitTextBox dijitComboBox",dropDownClass:"dijit.form._ComboBoxMenu",cssStateNodes:{"_buttonNode":"dijitDownArrowButton"},maxHeight:-1,_getCaretPos:function(_3ea){
var pos=0;
if(typeof (_3ea.selectionStart)=="number"){
pos=_3ea.selectionStart;
}else{
if(dojo.isIE){
var tr=dojo.doc.selection.createRange().duplicate();
var ntr=_3ea.createTextRange();
tr.move("character",0);
ntr.move("character",0);
try{
ntr.setEndPoint("EndToEnd",tr);
pos=String(ntr.text).replace(/\r/g,"").length;
}
catch(e){
}
}
}
return pos;
},_setCaretPos:function(_3eb,_3ec){
_3ec=parseInt(_3ec);
dijit.selectInputText(_3eb,_3ec,_3ec);
},_setDisabledAttr:function(_3ed){
this.inherited(arguments);
dijit.setWaiState(this.domNode,"disabled",_3ed);
},_abortQuery:function(){
if(this.searchTimer){
clearTimeout(this.searchTimer);
this.searchTimer=null;
}
if(this._fetchHandle){
if(this._fetchHandle.abort){
this._fetchHandle.abort();
}
this._fetchHandle=null;
}
},_onInput:function(evt){
if(!this.searchTimer&&(evt.type=="paste"||evt.type=="input")&&this._lastInput!=this.textbox.value){
this.searchTimer=setTimeout(dojo.hitch(this,function(){
this._onKey({charOrCode:229});
}),100);
}
this.inherited(arguments);
},_onKey:function(evt){
var key=evt.charOrCode;
if(evt.altKey||((evt.ctrlKey||evt.metaKey)&&(key!="x"&&key!="v"))||key==dojo.keys.SHIFT){
return;
}
var _3ee=false;
var pw=this.dropDown;
var dk=dojo.keys;
var _3ef=null;
this._prev_key_backspace=false;
this._abortQuery();
this.inherited(arguments);
if(this._opened){
_3ef=pw.getHighlightedOption();
}
switch(key){
case dk.PAGE_DOWN:
case dk.DOWN_ARROW:
case dk.PAGE_UP:
case dk.UP_ARROW:
if(this._opened){
this._announceOption(_3ef);
}
dojo.stopEvent(evt);
break;
case dk.ENTER:
if(_3ef){
if(_3ef==pw.nextButton){
this._nextSearch(1);
dojo.stopEvent(evt);
break;
}else{
if(_3ef==pw.previousButton){
this._nextSearch(-1);
dojo.stopEvent(evt);
break;
}
}
}else{
this._setBlurValue();
this._setCaretPos(this.focusNode,this.focusNode.value.length);
}
if(this._opened||this._fetchHandle){
evt.preventDefault();
}
case dk.TAB:
var _3f0=this.get("displayedValue");
if(pw&&(_3f0==pw._messages["previousMessage"]||_3f0==pw._messages["nextMessage"])){
break;
}
if(_3ef){
this._selectOption();
}
if(this._opened){
this._lastQuery=null;
this.closeDropDown();
}
break;
case " ":
if(_3ef){
dojo.stopEvent(evt);
this._selectOption();
this.closeDropDown();
}else{
_3ee=true;
}
break;
case dk.DELETE:
case dk.BACKSPACE:
this._prev_key_backspace=true;
_3ee=true;
break;
default:
_3ee=typeof key=="string"||key==229;
}
if(_3ee){
this.item=undefined;
this.searchTimer=setTimeout(dojo.hitch(this,"_startSearchFromInput"),1);
}
},_autoCompleteText:function(text){
var fn=this.focusNode;
dijit.selectInputText(fn,fn.value.length);
var _3f1=this.ignoreCase?"toLowerCase":"substr";
if(text[_3f1](0).indexOf(this.focusNode.value[_3f1](0))==0){
var cpos=this._getCaretPos(fn);
if((cpos+1)>fn.value.length){
fn.value=text;
dijit.selectInputText(fn,cpos);
}
}else{
fn.value=text;
dijit.selectInputText(fn);
}
},_openResultList:function(_3f2,_3f3){
this._fetchHandle=null;
if(this.disabled||this.readOnly||(_3f3.query[this.searchAttr]!=this._lastQuery)){
return;
}
var _3f4=this.dropDown._highlighted_option&&dojo.hasClass(this.dropDown._highlighted_option,"dijitMenuItemSelected");
this.dropDown.clearResultList();
if(!_3f2.length&&!this._maxOptions){
this.closeDropDown();
return;
}
_3f3._maxOptions=this._maxOptions;
var _3f5=this.dropDown.createOptions(_3f2,_3f3,dojo.hitch(this,"_getMenuLabelFromItem"));
this._showResultList();
if(_3f3.direction){
if(1==_3f3.direction){
this.dropDown.highlightFirstOption();
}else{
if(-1==_3f3.direction){
this.dropDown.highlightLastOption();
}
}
if(_3f4){
this._announceOption(this.dropDown.getHighlightedOption());
}
}else{
if(this.autoComplete&&!this._prev_key_backspace&&!/^[*]+$/.test(_3f3.query[this.searchAttr])){
this._announceOption(_3f5[1]);
}
}
},_showResultList:function(){
this.closeDropDown(true);
this.displayMessage("");
this.openDropDown();
dijit.setWaiState(this.domNode,"expanded","true");
},loadDropDown:function(_3f6){
this._startSearchAll();
},isLoaded:function(){
return false;
},closeDropDown:function(){
this._abortQuery();
if(this._opened){
this.inherited(arguments);
dijit.setWaiState(this.domNode,"expanded","false");
dijit.removeWaiState(this.focusNode,"activedescendant");
}
},_setBlurValue:function(){
var _3f7=this.get("displayedValue");
var pw=this.dropDown;
if(pw&&(_3f7==pw._messages["previousMessage"]||_3f7==pw._messages["nextMessage"])){
this._setValueAttr(this._lastValueReported,true);
}else{
if(typeof this.item=="undefined"){
this.item=null;
this.set("displayedValue",_3f7);
}else{
if(this.value!=this._lastValueReported){
dijit.form._FormValueWidget.prototype._setValueAttr.call(this,this.value,true);
}
this._refreshState();
}
}
},_onBlur:function(){
this.closeDropDown();
this.inherited(arguments);
},_setItemAttr:function(item,_3f8,_3f9){
if(!_3f9){
var _3fa=this.labelFunc(item,this.store);
if(this.labelType=="html"){
var span=this._helperSpan;
span.innerHTML=_3fa;
_3f9=span.innerText||span.textContent;
}else{
_3f9=_3fa;
}
}
var _3fb=this._getValueField()!=this.searchAttr?this.store.getIdentity(item):_3f9;
this._set("item",item);
dijit.form.ComboBox.superclass._setValueAttr.call(this,_3fb,_3f8,_3f9);
},_announceOption:function(node){
if(!node){
return;
}
var _3fc;
if(node==this.dropDown.nextButton||node==this.dropDown.previousButton){
_3fc=node.innerHTML;
this.item=undefined;
this.value="";
}else{
_3fc=node.innerText||node.textContent||"";
this.set("item",node.item,false,_3fc);
}
this.focusNode.value=this.focusNode.value.substring(0,this._lastInput.length);
dijit.setWaiState(this.focusNode,"activedescendant",dojo.attr(node,"id"));
this._autoCompleteText(_3fc);
},_selectOption:function(evt){
if(evt){
this._announceOption(evt.target);
}
this.closeDropDown();
this._setCaretPos(this.focusNode,this.focusNode.value.length);
dijit.form._FormValueWidget.prototype._setValueAttr.call(this,this.value,true);
},_startSearchAll:function(){
this._startSearch("");
},_startSearchFromInput:function(){
this._startSearch(this.focusNode.value.replace(/([\\\*\?])/g,"\\$1"));
},_getQueryString:function(text){
return dojo.string.substitute(this.queryExpr,[text]);
},_startSearch:function(key){
if(!this.dropDown){
var _3fd=this.id+"_popup",_3fe=dojo.getObject(this.dropDownClass,false);
this.dropDown=new _3fe({onChange:dojo.hitch(this,this._selectOption),id:_3fd,dir:this.dir});
dijit.removeWaiState(this.focusNode,"activedescendant");
dijit.setWaiState(this.textbox,"owns",_3fd);
}
var _3ff=dojo.clone(this.query);
this._lastInput=key;
this._lastQuery=_3ff[this.searchAttr]=this._getQueryString(key);
this.searchTimer=setTimeout(dojo.hitch(this,function(_400,_401){
this.searchTimer=null;
var _402={queryOptions:{ignoreCase:this.ignoreCase,deep:true},query:_400,onBegin:dojo.hitch(this,"_setMaxOptions"),onComplete:dojo.hitch(this,"_openResultList"),onError:function(_403){
_401._fetchHandle=null;
console.error("dijit.form.ComboBox: "+_403);
_401.closeDropDown();
},start:0,count:this.pageSize};
dojo.mixin(_402,_401.fetchProperties);
this._fetchHandle=_401.store.fetch(_402);
var _404=function(_405,_406){
_405.start+=_405.count*_406;
_405.direction=_406;
this._fetchHandle=this.store.fetch(_405);
this.focus();
};
this._nextSearch=this.dropDown.onPage=dojo.hitch(this,_404,this._fetchHandle);
},_3ff,this),this.searchDelay);
},_setMaxOptions:function(size,_407){
this._maxOptions=size;
},_getValueField:function(){
return this.searchAttr;
},constructor:function(){
this.query={};
this.fetchProperties={};
},postMixInProperties:function(){
if(!this.store){
var _408=this.srcNodeRef;
this.store=new dijit.form._ComboBoxDataStore(_408);
if(!("value" in this.params)){
var item=(this.item=this.store.fetchSelectedItem());
if(item){
var _409=this._getValueField();
this.value=_409!=this.searchAttr?this.store.getValue(item,_409):this.labelFunc(item,this.store);
}
}
}
this._helperSpan=dojo.create("span");
this.inherited(arguments);
},postCreate:function(){
var _40a=dojo.query("label[for=\""+this.id+"\"]");
if(_40a.length){
_40a[0].id=(this.id+"_label");
dijit.setWaiState(this.domNode,"labelledby",_40a[0].id);
}
this.inherited(arguments);
},destroy:function(){
dojo.destroy(this._helperSpan);
this.inherited(arguments);
},_setHasDownArrowAttr:function(val){
this.hasDownArrow=val;
this._buttonNode.style.display=val?"":"none";
},_getMenuLabelFromItem:function(item){
var _40b=this.labelFunc(item,this.store),_40c=this.labelType;
if(this.highlightMatch!="none"&&this.labelType=="text"&&this._lastInput){
_40b=this.doHighlight(_40b,this._escapeHtml(this._lastInput));
_40c="html";
}
return {html:_40c=="html",label:_40b};
},doHighlight:function(_40d,find){
var _40e=(this.ignoreCase?"i":"")+(this.highlightMatch=="all"?"g":""),i=this.queryExpr.indexOf("${0}");
find=dojo.regexp.escapeString(find);
return this._escapeHtml(_40d).replace(new RegExp((i==0?"^":"")+"("+find+")"+(i==(this.queryExpr.length-4)?"$":""),_40e),"<span class=\"dijitComboBoxHighlightMatch\">$1</span>");
},_escapeHtml:function(str){
str=String(str).replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;");
return str;
},reset:function(){
this.item=null;
this.inherited(arguments);
},labelFunc:function(item,_40f){
return _40f.getValue(item,this.labelAttr||this.searchAttr).toString();
}});
dojo.declare("dijit.form._ComboBoxMenu",[dijit._Widget,dijit._Templated,dijit._CssStateMixin],{templateString:"<ul class='dijitReset dijitMenu' dojoAttachEvent='onmousedown:_onMouseDown,onmouseup:_onMouseUp,onmouseover:_onMouseOver,onmouseout:_onMouseOut' style='overflow: \"auto\"; overflow-x: \"hidden\";'>"+"<li class='dijitMenuItem dijitMenuPreviousButton' dojoAttachPoint='previousButton' role='option'></li>"+"<li class='dijitMenuItem dijitMenuNextButton' dojoAttachPoint='nextButton' role='option'></li>"+"</ul>",_messages:null,baseClass:"dijitComboBoxMenu",postMixInProperties:function(){
this.inherited(arguments);
this._messages=dojo.i18n.getLocalization("dijit.form","ComboBox",this.lang);
},buildRendering:function(){
this.inherited(arguments);
this.previousButton.innerHTML=this._messages["previousMessage"];
this.nextButton.innerHTML=this._messages["nextMessage"];
},_setValueAttr:function(_410){
this.value=_410;
this.onChange(_410);
},onChange:function(_411){
},onPage:function(_412){
},onClose:function(){
this._blurOptionNode();
},_createOption:function(item,_413){
var _414=dojo.create("li",{"class":"dijitReset dijitMenuItem"+(this.isLeftToRight()?"":" dijitMenuItemRtl"),role:"option"});
var _415=_413(item);
if(_415.html){
_414.innerHTML=_415.label;
}else{
_414.appendChild(dojo.doc.createTextNode(_415.label));
}
if(_414.innerHTML==""){
_414.innerHTML="&nbsp;";
}
_414.item=item;
return _414;
},createOptions:function(_416,_417,_418){
this.previousButton.style.display=(_417.start==0)?"none":"";
dojo.attr(this.previousButton,"id",this.id+"_prev");
dojo.forEach(_416,function(item,i){
var _419=this._createOption(item,_418);
dojo.attr(_419,"id",this.id+i);
this.domNode.insertBefore(_419,this.nextButton);
},this);
var _41a=false;
if(_417._maxOptions&&_417._maxOptions!=-1){
if((_417.start+_417.count)<_417._maxOptions){
_41a=true;
}else{
if((_417.start+_417.count)>_417._maxOptions&&_417.count==_416.length){
_41a=true;
}
}
}else{
if(_417.count==_416.length){
_41a=true;
}
}
this.nextButton.style.display=_41a?"":"none";
dojo.attr(this.nextButton,"id",this.id+"_next");
return this.domNode.childNodes;
},clearResultList:function(){
while(this.domNode.childNodes.length>2){
this.domNode.removeChild(this.domNode.childNodes[this.domNode.childNodes.length-2]);
}
this._blurOptionNode();
},_onMouseDown:function(evt){
dojo.stopEvent(evt);
},_onMouseUp:function(evt){
if(evt.target===this.domNode||!this._highlighted_option){
return;
}else{
if(evt.target==this.previousButton){
this._blurOptionNode();
this.onPage(-1);
}else{
if(evt.target==this.nextButton){
this._blurOptionNode();
this.onPage(1);
}else{
var tgt=evt.target;
while(!tgt.item){
tgt=tgt.parentNode;
}
this._setValueAttr({target:tgt},true);
}
}
}
},_onMouseOver:function(evt){
if(evt.target===this.domNode){
return;
}
var tgt=evt.target;
if(!(tgt==this.previousButton||tgt==this.nextButton)){
while(!tgt.item){
tgt=tgt.parentNode;
}
}
this._focusOptionNode(tgt);
},_onMouseOut:function(evt){
if(evt.target===this.domNode){
return;
}
this._blurOptionNode();
},_focusOptionNode:function(node){
if(this._highlighted_option!=node){
this._blurOptionNode();
this._highlighted_option=node;
dojo.addClass(this._highlighted_option,"dijitMenuItemSelected");
}
},_blurOptionNode:function(){
if(this._highlighted_option){
dojo.removeClass(this._highlighted_option,"dijitMenuItemSelected");
this._highlighted_option=null;
}
},_highlightNextOption:function(){
if(!this.getHighlightedOption()){
var fc=this.domNode.firstChild;
this._focusOptionNode(fc.style.display=="none"?fc.nextSibling:fc);
}else{
var ns=this._highlighted_option.nextSibling;
if(ns&&ns.style.display!="none"){
this._focusOptionNode(ns);
}else{
this.highlightFirstOption();
}
}
dojo.window.scrollIntoView(this._highlighted_option);
},highlightFirstOption:function(){
var _41b=this.domNode.firstChild;
var _41c=_41b.nextSibling;
this._focusOptionNode(_41c.style.display=="none"?_41b:_41c);
dojo.window.scrollIntoView(this._highlighted_option);
},highlightLastOption:function(){
this._focusOptionNode(this.domNode.lastChild.previousSibling);
dojo.window.scrollIntoView(this._highlighted_option);
},_highlightPrevOption:function(){
if(!this.getHighlightedOption()){
var lc=this.domNode.lastChild;
this._focusOptionNode(lc.style.display=="none"?lc.previousSibling:lc);
}else{
var ps=this._highlighted_option.previousSibling;
if(ps&&ps.style.display!="none"){
this._focusOptionNode(ps);
}else{
this.highlightLastOption();
}
}
dojo.window.scrollIntoView(this._highlighted_option);
},_page:function(up){
var _41d=0;
var _41e=this.domNode.scrollTop;
var _41f=dojo.style(this.domNode,"height");
if(!this.getHighlightedOption()){
this._highlightNextOption();
}
while(_41d<_41f){
if(up){
if(!this.getHighlightedOption().previousSibling||this._highlighted_option.previousSibling.style.display=="none"){
break;
}
this._highlightPrevOption();
}else{
if(!this.getHighlightedOption().nextSibling||this._highlighted_option.nextSibling.style.display=="none"){
break;
}
this._highlightNextOption();
}
var _420=this.domNode.scrollTop;
_41d+=(_420-_41e)*(up?-1:1);
_41e=_420;
}
},pageUp:function(){
this._page(true);
},pageDown:function(){
this._page(false);
},getHighlightedOption:function(){
var ho=this._highlighted_option;
return (ho&&ho.parentNode)?ho:null;
},handleKey:function(evt){
switch(evt.charOrCode){
case dojo.keys.DOWN_ARROW:
this._highlightNextOption();
return false;
case dojo.keys.PAGE_DOWN:
this.pageDown();
return false;
case dojo.keys.UP_ARROW:
this._highlightPrevOption();
return false;
case dojo.keys.PAGE_UP:
this.pageUp();
return false;
default:
return true;
}
}});
dojo.declare("dijit.form.ComboBox",[dijit.form.ValidationTextBox,dijit.form.ComboBoxMixin],{_setValueAttr:function(_421,_422,_423){
this._set("item",null);
if(!_421){
_421="";
}
dijit.form.ValidationTextBox.prototype._setValueAttr.call(this,_421,_422,_423);
}});
dojo.declare("dijit.form._ComboBoxDataStore",null,{constructor:function(root){
this.root=root;
if(root.tagName!="SELECT"&&root.firstChild){
root=dojo.query("select",root);
if(root.length>0){
root=root[0];
}else{
this.root.innerHTML="<SELECT>"+this.root.innerHTML+"</SELECT>";
root=this.root.firstChild;
}
this.root=root;
}
dojo.query("> option",root).forEach(function(node){
node.innerHTML=dojo.trim(node.innerHTML);
});
},getValue:function(item,_424,_425){
return (_424=="value")?item.value:(item.innerText||item.textContent||"");
},isItemLoaded:function(_426){
return true;
},getFeatures:function(){
return {"dojo.data.api.Read":true,"dojo.data.api.Identity":true};
},_fetchItems:function(args,_427,_428){
if(!args.query){
args.query={};
}
if(!args.query.name){
args.query.name="";
}
if(!args.queryOptions){
args.queryOptions={};
}
var _429=dojo.data.util.filter.patternToRegExp(args.query.name,args.queryOptions.ignoreCase),_42a=dojo.query("> option",this.root).filter(function(_42b){
return (_42b.innerText||_42b.textContent||"").match(_429);
});
if(args.sort){
_42a.sort(dojo.data.util.sorter.createSortFunction(args.sort,this));
}
_427(_42a,args);
},close:function(_42c){
return;
},getLabel:function(item){
return item.innerHTML;
},getIdentity:function(item){
return dojo.attr(item,"value");
},fetchItemByIdentity:function(args){
var item=dojo.query("> option[value='"+args.identity+"']",this.root)[0];
args.onItem(item);
},fetchSelectedItem:function(){
var root=this.root,si=root.selectedIndex;
return typeof si=="number"?dojo.query("> option:nth-child("+(si!=-1?si+1:1)+")",root)[0]:null;
}});
dojo.extend(dijit.form._ComboBoxDataStore,dojo.data.util.simpleFetch);
}
if(!dojo._hasResource["dijit.form.FilteringSelect"]){
dojo._hasResource["dijit.form.FilteringSelect"]=true;
dojo.provide("dijit.form.FilteringSelect");
dojo.declare("dijit.form.FilteringSelect",[dijit.form.MappedTextBox,dijit.form.ComboBoxMixin],{required:true,_lastDisplayedValue:"",_isValidSubset:function(){
return this._opened;
},isValid:function(){
return this.item||(!this.required&&this.get("displayedValue")=="");
},_refreshState:function(){
if(!this.searchTimer){
this.inherited(arguments);
}
},_callbackSetLabel:function(_42d,_42e,_42f){
if((_42e&&_42e.query[this.searchAttr]!=this._lastQuery)||(!_42e&&_42d.length&&this.store.getIdentity(_42d[0])!=this._lastQuery)){
return;
}
if(!_42d.length){
this.valueNode.value="";
dijit.form.TextBox.superclass._setValueAttr.call(this,"",_42f||(_42f===undefined&&!this._focused));
this._set("item",null);
this.validate(this._focused);
}else{
this.set("item",_42d[0],_42f);
}
},_openResultList:function(_430,_431){
if(_431.query[this.searchAttr]!=this._lastQuery){
return;
}
dijit.form.ComboBoxMixin.prototype._openResultList.apply(this,arguments);
if(this.item===undefined){
this.validate(true);
}
},_getValueAttr:function(){
return this.valueNode.value;
},_getValueField:function(){
return "value";
},_setValueAttr:function(_432,_433){
if(!this._onChangeActive){
_433=null;
}
this._lastQuery=_432;
if(_432===null||_432===""){
this._setDisplayedValueAttr("",_433);
return;
}
var self=this;
this.store.fetchItemByIdentity({identity:_432,onItem:function(item){
self._callbackSetLabel(item?[item]:[],undefined,_433);
}});
},_setItemAttr:function(item,_434,_435){
this.inherited(arguments);
this.valueNode.value=this.value;
this._lastDisplayedValue=this.textbox.value;
},_getDisplayQueryString:function(text){
return text.replace(/([\\\*\?])/g,"\\$1");
},_setDisplayedValueAttr:function(_436,_437){
if(_436==null){
_436="";
}
if(!this._created){
if(!("displayedValue" in this.params)){
return;
}
_437=false;
}
if(this.store){
this.closeDropDown();
var _438=dojo.clone(this.query);
this._lastQuery=_438[this.labelAttr||this.searchAttr]=this._getDisplayQueryString(_436);
this.textbox.value=_436;
this._lastDisplayedValue=_436;
var _439=this;
var _43a={query:_438,queryOptions:{ignoreCase:this.ignoreCase,deep:true},onComplete:function(_43b,_43c){
_439._fetchHandle=null;
dojo.hitch(_439,"_callbackSetLabel")(_43b,_43c,_437);
},onError:function(_43d){
_439._fetchHandle=null;
console.error("dijit.form.FilteringSelect: "+_43d);
dojo.hitch(_439,"_callbackSetLabel")([],undefined,false);
}};
dojo.mixin(_43a,this.fetchProperties);
this._fetchHandle=this.store.fetch(_43a);
}
},undo:function(){
this.set("displayedValue",this._lastDisplayedValue);
}});
}
if(!dojo._hasResource["dijit.form.Form"]){
dojo._hasResource["dijit.form.Form"]=true;
dojo.provide("dijit.form.Form");
dojo.declare("dijit.form.Form",[dijit._Widget,dijit._Templated,dijit.form._FormMixin,dijit.layout._ContentPaneResizeMixin],{name:"",action:"",method:"",encType:"","accept-charset":"",accept:"",target:"",templateString:"<form dojoAttachPoint='containerNode' dojoAttachEvent='onreset:_onReset,onsubmit:_onSubmit' ${!nameAttrSetting}></form>",attributeMap:dojo.delegate(dijit._Widget.prototype.attributeMap,{action:"",method:"",encType:"","accept-charset":"",accept:"",target:""}),postMixInProperties:function(){
this.nameAttrSetting=this.name?("name='"+this.name+"'"):"";
this.inherited(arguments);
},execute:function(_43e){
},onExecute:function(){
},_setEncTypeAttr:function(_43f){
this.encType=_43f;
dojo.attr(this.domNode,"encType",_43f);
if(dojo.isIE){
this.domNode.encoding=_43f;
}
},postCreate:function(){
if(dojo.isIE&&this.srcNodeRef&&this.srcNodeRef.attributes){
var item=this.srcNodeRef.attributes.getNamedItem("encType");
if(item&&!item.specified&&(typeof item.value=="string")){
this.set("encType",item.value);
}
}
this.inherited(arguments);
},reset:function(e){
var faux={returnValue:true,preventDefault:function(){
this.returnValue=false;
},stopPropagation:function(){
},currentTarget:e?e.target:this.domNode,target:e?e.target:this.domNode};
if(!(this.onReset(faux)===false)&&faux.returnValue){
this.inherited(arguments,[]);
}
},onReset:function(e){
return true;
},_onReset:function(e){
this.reset(e);
dojo.stopEvent(e);
return false;
},_onSubmit:function(e){
var fp=dijit.form.Form.prototype;
if(this.execute!=fp.execute||this.onExecute!=fp.onExecute){
dojo.deprecated("dijit.form.Form:execute()/onExecute() are deprecated. Use onSubmit() instead.","","2.0");
this.onExecute();
this.execute(this.getValues());
}
if(this.onSubmit(e)===false){
dojo.stopEvent(e);
}
},onSubmit:function(e){
return this.isValid();
},submit:function(){
if(!(this.onSubmit()===false)){
this.containerNode.submit();
}
}});
}
if(!dojo._hasResource["dijit.form.SimpleTextarea"]){
dojo._hasResource["dijit.form.SimpleTextarea"]=true;
dojo.provide("dijit.form.SimpleTextarea");
dojo.declare("dijit.form.SimpleTextarea",dijit.form.TextBox,{baseClass:"dijitTextBox dijitTextArea",attributeMap:dojo.delegate(dijit.form._FormValueWidget.prototype.attributeMap,{rows:"textbox",cols:"textbox"}),rows:"3",cols:"20",templateString:"<textarea ${!nameAttrSetting} dojoAttachPoint='focusNode,containerNode,textbox' autocomplete='off'></textarea>",postMixInProperties:function(){
if(!this.value&&this.srcNodeRef){
this.value=this.srcNodeRef.value;
}
this.inherited(arguments);
},buildRendering:function(){
this.inherited(arguments);
if(dojo.isIE&&this.cols){
dojo.addClass(this.textbox,"dijitTextAreaCols");
}
},filter:function(_440){
if(_440){
_440=_440.replace(/\r/g,"");
}
return this.inherited(arguments);
},_previousValue:"",_onInput:function(e){
if(this.maxLength){
var _441=parseInt(this.maxLength);
var _442=this.textbox.value.replace(/\r/g,"");
var _443=_442.length-_441;
if(_443>0){
if(e){
dojo.stopEvent(e);
}
var _444=this.textbox;
if(_444.selectionStart){
var pos=_444.selectionStart;
var cr=0;
if(dojo.isOpera){
cr=(this.textbox.value.substring(0,pos).match(/\r/g)||[]).length;
}
this.textbox.value=_442.substring(0,pos-_443-cr)+_442.substring(pos-cr);
_444.setSelectionRange(pos-_443,pos-_443);
}else{
if(dojo.doc.selection){
_444.focus();
var _445=dojo.doc.selection.createRange();
_445.moveStart("character",-_443);
_445.text="";
_445.select();
}
}
}
this._previousValue=this.textbox.value;
}
this.inherited(arguments);
}});
}
if(!dojo._hasResource["dijit.form.Textarea"]){
dojo._hasResource["dijit.form.Textarea"]=true;
dojo.provide("dijit.form.Textarea");
dojo.declare("dijit.form.Textarea",dijit.form.SimpleTextarea,{baseClass:"dijitTextBox dijitTextArea dijitExpandingTextArea",cols:"",_previousNewlines:0,_strictMode:(dojo.doc.compatMode!="BackCompat"),_getHeight:function(_446){
var newH=_446.scrollHeight;
if(dojo.isIE){
newH+=_446.offsetHeight-_446.clientHeight-((dojo.isIE<8&&this._strictMode)?dojo._getPadBorderExtents(_446).h:0);
}else{
if(dojo.isMoz){
newH+=_446.offsetHeight-_446.clientHeight;
}else{
if(dojo.isWebKit){
newH+=dojo._getBorderExtents(_446).h;
}else{
newH+=dojo._getPadBorderExtents(_446).h;
}
}
}
return newH;
},_estimateHeight:function(_447){
_447.style.maxHeight="";
_447.style.height="auto";
_447.rows=(_447.value.match(/\n/g)||[]).length+1;
},_needsHelpShrinking:dojo.isMoz||dojo.isWebKit,_onInput:function(){
this.inherited(arguments);
if(this._busyResizing){
return;
}
this._busyResizing=true;
var _448=this.textbox;
if(_448.scrollHeight&&_448.offsetHeight&&_448.clientHeight){
var newH=this._getHeight(_448)+"px";
if(_448.style.height!=newH){
_448.style.maxHeight=_448.style.height=newH;
}
if(this._needsHelpShrinking){
if(this._setTimeoutHandle){
clearTimeout(this._setTimeoutHandle);
}
this._setTimeoutHandle=setTimeout(dojo.hitch(this,"_shrink"),0);
}
}else{
this._estimateHeight(_448);
}
this._busyResizing=false;
},_busyResizing:false,_shrink:function(){
this._setTimeoutHandle=null;
if(this._needsHelpShrinking&&!this._busyResizing){
this._busyResizing=true;
var _449=this.textbox;
var _44a=false;
if(_449.value==""){
_449.value=" ";
_44a=true;
}
var _44b=_449.scrollHeight;
if(!_44b){
this._estimateHeight(_449);
}else{
var _44c=_449.style.paddingBottom;
var _44d=dojo._getPadExtents(_449);
_44d=_44d.h-_44d.t;
_449.style.paddingBottom=_44d+1+"px";
var newH=this._getHeight(_449)-1+"px";
if(_449.style.maxHeight!=newH){
_449.style.paddingBottom=_44d+_44b+"px";
_449.scrollTop=0;
_449.style.maxHeight=this._getHeight(_449)-_44b+"px";
}
_449.style.paddingBottom=_44c;
}
if(_44a){
_449.value="";
}
this._busyResizing=false;
}
},resize:function(){
this._onInput();
},_setValueAttr:function(){
this.inherited(arguments);
this.resize();
},buildRendering:function(){
this.inherited(arguments);
dojo.style(this.textbox,{overflowY:"hidden",overflowX:"auto",boxSizing:"border-box",MsBoxSizing:"border-box",WebkitBoxSizing:"border-box",MozBoxSizing:"border-box"});
},postCreate:function(){
this.inherited(arguments);
this.connect(this.textbox,"onscroll","_onInput");
this.connect(this.textbox,"onresize","_onInput");
this.connect(this.textbox,"onfocus","_onInput");
this._setTimeoutHandle=setTimeout(dojo.hitch(this,"resize"),0);
},uninitialize:function(){
if(this._setTimeoutHandle){
clearTimeout(this._setTimeoutHandle);
}
this.inherited(arguments);
}});
}
if(!dojo._hasResource["dijit.form.Button"]){
dojo._hasResource["dijit.form.Button"]=true;
dojo.provide("dijit.form.Button");
dojo.declare("dijit.form.Button",dijit.form._FormWidget,{label:"",showLabel:true,iconClass:"",type:"button",baseClass:"dijitButton",templateString:dojo.cache("dijit.form","templates/Button.html","<span class=\"dijit dijitReset dijitInline\"\r\n\t><span class=\"dijitReset dijitInline dijitButtonNode\"\r\n\t\tdojoAttachEvent=\"ondijitclick:_onButtonClick\"\r\n\t\t><span class=\"dijitReset dijitStretch dijitButtonContents\"\r\n\t\t\tdojoAttachPoint=\"titleNode,focusNode\"\r\n\t\t\trole=\"button\" aria-labelledby=\"${id}_label\"\r\n\t\t\t><span class=\"dijitReset dijitInline dijitIcon\" dojoAttachPoint=\"iconNode\"></span\r\n\t\t\t><span class=\"dijitReset dijitToggleButtonIconChar\">&#x25CF;</span\r\n\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\"\r\n\t\t\t\tid=\"${id}_label\"\r\n\t\t\t\tdojoAttachPoint=\"containerNode\"\r\n\t\t\t></span\r\n\t\t></span\r\n\t></span\r\n\t><input ${!nameAttrSetting} type=\"${type}\" value=\"${value}\" class=\"dijitOffScreen\"\r\n\t\tdojoAttachPoint=\"valueNode\"\r\n/></span>\r\n"),attributeMap:dojo.delegate(dijit.form._FormWidget.prototype.attributeMap,{value:"valueNode"}),_onClick:function(e){
if(this.disabled){
return false;
}
this._clicked();
return this.onClick(e);
},_onButtonClick:function(e){
if(this._onClick(e)===false){
e.preventDefault();
}else{
if(this.type=="submit"&&!(this.valueNode||this.focusNode).form){
for(var node=this.domNode;node.parentNode;node=node.parentNode){
var _44e=dijit.byNode(node);
if(_44e&&typeof _44e._onSubmit=="function"){
_44e._onSubmit(e);
break;
}
}
}else{
if(this.valueNode){
this.valueNode.click();
e.preventDefault();
}
}
}
},buildRendering:function(){
this.inherited(arguments);
dojo.setSelectable(this.focusNode,false);
},_fillContent:function(_44f){
if(_44f&&(!this.params||!("label" in this.params))){
this.set("label",_44f.innerHTML);
}
},_setShowLabelAttr:function(val){
if(this.containerNode){
dojo.toggleClass(this.containerNode,"dijitDisplayNone",!val);
}
this._set("showLabel",val);
},onClick:function(e){
return true;
},_clicked:function(e){
},setLabel:function(_450){
dojo.deprecated("dijit.form.Button.setLabel() is deprecated.  Use set('label', ...) instead.","","2.0");
this.set("label",_450);
},_setLabelAttr:function(_451){
this._set("label",_451);
this.containerNode.innerHTML=_451;
if(this.showLabel==false&&!this.params.title){
this.titleNode.title=dojo.trim(this.containerNode.innerText||this.containerNode.textContent||"");
}
},_setIconClassAttr:function(val){
var _452=this.iconClass||"dijitNoIcon",_453=val||"dijitNoIcon";
dojo.replaceClass(this.iconNode,_453,_452);
this._set("iconClass",val);
}});
dojo.declare("dijit.form.DropDownButton",[dijit.form.Button,dijit._Container,dijit._HasDropDown],{baseClass:"dijitDropDownButton",templateString:dojo.cache("dijit.form","templates/DropDownButton.html","<span class=\"dijit dijitReset dijitInline\"\r\n\t><span class='dijitReset dijitInline dijitButtonNode'\r\n\t\tdojoAttachEvent=\"ondijitclick:_onButtonClick\" dojoAttachPoint=\"_buttonNode\"\r\n\t\t><span class=\"dijitReset dijitStretch dijitButtonContents\"\r\n\t\t\tdojoAttachPoint=\"focusNode,titleNode,_arrowWrapperNode\"\r\n\t\t\trole=\"button\" aria-haspopup=\"true\" aria-labelledby=\"${id}_label\"\r\n\t\t\t><span class=\"dijitReset dijitInline dijitIcon\"\r\n\t\t\t\tdojoAttachPoint=\"iconNode\"\r\n\t\t\t></span\r\n\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\"\r\n\t\t\t\tdojoAttachPoint=\"containerNode,_popupStateNode\"\r\n\t\t\t\tid=\"${id}_label\"\r\n\t\t\t></span\r\n\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonInner\"></span\r\n\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonChar\">&#9660;</span\r\n\t\t></span\r\n\t></span\r\n\t><input ${!nameAttrSetting} type=\"${type}\" value=\"${value}\" class=\"dijitOffScreen\"\r\n\t\tdojoAttachPoint=\"valueNode\"\r\n/></span>\r\n"),_fillContent:function(){
if(this.srcNodeRef){
var _454=dojo.query("*",this.srcNodeRef);
dijit.form.DropDownButton.superclass._fillContent.call(this,_454[0]);
this.dropDownContainer=this.srcNodeRef;
}
},startup:function(){
if(this._started){
return;
}
if(!this.dropDown&&this.dropDownContainer){
var _455=dojo.query("[widgetId]",this.dropDownContainer)[0];
this.dropDown=dijit.byNode(_455);
delete this.dropDownContainer;
}
if(this.dropDown){
dijit.popup.hide(this.dropDown);
}
this.inherited(arguments);
},isLoaded:function(){
var _456=this.dropDown;
return (!!_456&&(!_456.href||_456.isLoaded));
},loadDropDown:function(){
var _457=this.dropDown;
if(!_457){
return;
}
if(!this.isLoaded()){
var _458=dojo.connect(_457,"onLoad",this,function(){
dojo.disconnect(_458);
this.openDropDown();
});
_457.refresh();
}else{
this.openDropDown();
}
},isFocusable:function(){
return this.inherited(arguments)&&!this._mouseDown;
}});
dojo.declare("dijit.form.ComboButton",dijit.form.DropDownButton,{templateString:dojo.cache("dijit.form","templates/ComboButton.html","<table class=\"dijit dijitReset dijitInline dijitLeft\"\r\n\tcellspacing='0' cellpadding='0' role=\"presentation\"\r\n\t><tbody role=\"presentation\"><tr role=\"presentation\"\r\n\t\t><td class=\"dijitReset dijitStretch dijitButtonNode\" dojoAttachPoint=\"buttonNode\" dojoAttachEvent=\"ondijitclick:_onButtonClick,onkeypress:_onButtonKeyPress\"\r\n\t\t><div id=\"${id}_button\" class=\"dijitReset dijitButtonContents\"\r\n\t\t\tdojoAttachPoint=\"titleNode\"\r\n\t\t\trole=\"button\" aria-labelledby=\"${id}_label\"\r\n\t\t\t><div class=\"dijitReset dijitInline dijitIcon\" dojoAttachPoint=\"iconNode\" role=\"presentation\"></div\r\n\t\t\t><div class=\"dijitReset dijitInline dijitButtonText\" id=\"${id}_label\" dojoAttachPoint=\"containerNode\" role=\"presentation\"></div\r\n\t\t></div\r\n\t\t></td\r\n\t\t><td id=\"${id}_arrow\" class='dijitReset dijitRight dijitButtonNode dijitArrowButton'\r\n\t\t\tdojoAttachPoint=\"_popupStateNode,focusNode,_buttonNode\"\r\n\t\t\tdojoAttachEvent=\"onkeypress:_onArrowKeyPress\"\r\n\t\t\ttitle=\"${optionsTitle}\"\r\n\t\t\trole=\"button\" aria-haspopup=\"true\"\r\n\t\t\t><div class=\"dijitReset dijitArrowButtonInner\" role=\"presentation\"></div\r\n\t\t\t><div class=\"dijitReset dijitArrowButtonChar\" role=\"presentation\">&#9660;</div\r\n\t\t></td\r\n\t\t><td style=\"display:none !important;\"\r\n\t\t\t><input ${!nameAttrSetting} type=\"${type}\" value=\"${value}\" dojoAttachPoint=\"valueNode\"\r\n\t\t/></td></tr></tbody\r\n></table>\r\n"),attributeMap:dojo.mixin(dojo.clone(dijit.form.Button.prototype.attributeMap),{id:"",tabIndex:["focusNode","titleNode"],title:"titleNode"}),optionsTitle:"",baseClass:"dijitComboButton",cssStateNodes:{"buttonNode":"dijitButtonNode","titleNode":"dijitButtonContents","_popupStateNode":"dijitDownArrowButton"},_focusedNode:null,_onButtonKeyPress:function(evt){
if(evt.charOrCode==dojo.keys[this.isLeftToRight()?"RIGHT_ARROW":"LEFT_ARROW"]){
dijit.focus(this._popupStateNode);
dojo.stopEvent(evt);
}
},_onArrowKeyPress:function(evt){
if(evt.charOrCode==dojo.keys[this.isLeftToRight()?"LEFT_ARROW":"RIGHT_ARROW"]){
dijit.focus(this.titleNode);
dojo.stopEvent(evt);
}
},focus:function(_459){
if(!this.disabled){
dijit.focus(_459=="start"?this.titleNode:this._popupStateNode);
}
}});
dojo.declare("dijit.form.ToggleButton",dijit.form.Button,{baseClass:"dijitToggleButton",checked:false,attributeMap:dojo.mixin(dojo.clone(dijit.form.Button.prototype.attributeMap),{checked:"focusNode"}),_clicked:function(evt){
this.set("checked",!this.checked);
},_setCheckedAttr:function(_45a,_45b){
this._set("checked",_45a);
dojo.attr(this.focusNode||this.domNode,"checked",_45a);
dijit.setWaiState(this.focusNode||this.domNode,"pressed",_45a);
this._handleOnChange(_45a,_45b);
},setChecked:function(_45c){
dojo.deprecated("setChecked("+_45c+") is deprecated. Use set('checked',"+_45c+") instead.","","2.0");
this.set("checked",_45c);
},reset:function(){
this._hasBeenBlurred=false;
this.set("checked",this.params.checked||false);
}});
}
if(!dojo._hasResource["dijit.form.ToggleButton"]){
dojo._hasResource["dijit.form.ToggleButton"]=true;
dojo.provide("dijit.form.ToggleButton");
}
if(!dojo._hasResource["dijit.form.CheckBox"]){
dojo._hasResource["dijit.form.CheckBox"]=true;
dojo.provide("dijit.form.CheckBox");
dojo.declare("dijit.form.CheckBox",dijit.form.ToggleButton,{templateString:dojo.cache("dijit.form","templates/CheckBox.html","<div class=\"dijit dijitReset dijitInline\" role=\"presentation\"\r\n\t><input\r\n\t \t${!nameAttrSetting} type=\"${type}\" ${checkedAttrSetting}\r\n\t\tclass=\"dijitReset dijitCheckBoxInput\"\r\n\t\tdojoAttachPoint=\"focusNode\"\r\n\t \tdojoAttachEvent=\"onclick:_onClick\"\r\n/></div>\r\n"),baseClass:"dijitCheckBox",type:"checkbox",value:"on",readOnly:false,attributeMap:dojo.delegate(dijit.form._FormWidget.prototype.attributeMap,{readOnly:"focusNode"}),_setReadOnlyAttr:function(_45d){
this._set("readOnly",_45d);
dojo.attr(this.focusNode,"readOnly",_45d);
dijit.setWaiState(this.focusNode,"readonly",_45d);
},_setValueAttr:function(_45e,_45f){
if(typeof _45e=="string"){
this._set("value",_45e);
dojo.attr(this.focusNode,"value",_45e);
_45e=true;
}
if(this._created){
this.set("checked",_45e,_45f);
}
},_getValueAttr:function(){
return (this.checked?this.value:false);
},_setLabelAttr:undefined,postMixInProperties:function(){
if(this.value==""){
this.value="on";
}
this.checkedAttrSetting=this.checked?"checked":"";
this.inherited(arguments);
},_fillContent:function(_460){
},reset:function(){
this._hasBeenBlurred=false;
this.set("checked",this.params.checked||false);
this._set("value",this.params.value||"on");
dojo.attr(this.focusNode,"value",this.value);
},_onFocus:function(){
if(this.id){
dojo.query("label[for='"+this.id+"']").addClass("dijitFocusedLabel");
}
this.inherited(arguments);
},_onBlur:function(){
if(this.id){
dojo.query("label[for='"+this.id+"']").removeClass("dijitFocusedLabel");
}
this.inherited(arguments);
},_onClick:function(e){
if(this.readOnly){
dojo.stopEvent(e);
return false;
}
return this.inherited(arguments);
}});
dojo.declare("dijit.form.RadioButton",dijit.form.CheckBox,{type:"radio",baseClass:"dijitRadio",_setCheckedAttr:function(_461){
this.inherited(arguments);
if(!this._created){
return;
}
if(_461){
var _462=this;
dojo.query("INPUT[type=radio]",this.focusNode.form||dojo.doc).forEach(function(_463){
if(_463.name==_462.name&&_463!=_462.focusNode&&_463.form==_462.focusNode.form){
var _464=dijit.getEnclosingWidget(_463);
if(_464&&_464.checked){
_464.set("checked",false);
}
}
});
}
},_clicked:function(e){
if(!this.checked){
this.set("checked",true);
}
}});
}
if(!dojo._hasResource["dijit.form.RadioButton"]){
dojo._hasResource["dijit.form.RadioButton"]=true;
dojo.provide("dijit.form.RadioButton");
}
if(!dojo._hasResource["dojo.date"]){
dojo._hasResource["dojo.date"]=true;
dojo.provide("dojo.date");
dojo.getObject("date",true,dojo);
dojo.date.getDaysInMonth=function(_465){
var _466=_465.getMonth();
var days=[31,28,31,30,31,30,31,31,30,31,30,31];
if(_466==1&&dojo.date.isLeapYear(_465)){
return 29;
}
return days[_466];
};
dojo.date.isLeapYear=function(_467){
var year=_467.getFullYear();
return !(year%400)||(!(year%4)&&!!(year%100));
};
dojo.date.getTimezoneName=function(_468){
var str=_468.toString();
var tz="";
var _469;
var pos=str.indexOf("(");
if(pos>-1){
tz=str.substring(++pos,str.indexOf(")"));
}else{
var pat=/([A-Z\/]+) \d{4}$/;
if((_469=str.match(pat))){
tz=_469[1];
}else{
str=_468.toLocaleString();
pat=/ ([A-Z\/]+)$/;
if((_469=str.match(pat))){
tz=_469[1];
}
}
}
return (tz=="AM"||tz=="PM")?"":tz;
};
dojo.date.compare=function(_46a,_46b,_46c){
_46a=new Date(+_46a);
_46b=new Date(+(_46b||new Date()));
if(_46c=="date"){
_46a.setHours(0,0,0,0);
_46b.setHours(0,0,0,0);
}else{
if(_46c=="time"){
_46a.setFullYear(0,0,0);
_46b.setFullYear(0,0,0);
}
}
if(_46a>_46b){
return 1;
}
if(_46a<_46b){
return -1;
}
return 0;
};
dojo.date.add=function(date,_46d,_46e){
var sum=new Date(+date);
var _46f=false;
var _470="Date";
switch(_46d){
case "day":
break;
case "weekday":
var days,_471;
var mod=_46e%5;
if(!mod){
days=(_46e>0)?5:-5;
_471=(_46e>0)?((_46e-5)/5):((_46e+5)/5);
}else{
days=mod;
_471=parseInt(_46e/5);
}
var strt=date.getDay();
var adj=0;
if(strt==6&&_46e>0){
adj=1;
}else{
if(strt==0&&_46e<0){
adj=-1;
}
}
var trgt=strt+days;
if(trgt==0||trgt==6){
adj=(_46e>0)?2:-2;
}
_46e=(7*_471)+days+adj;
break;
case "year":
_470="FullYear";
_46f=true;
break;
case "week":
_46e*=7;
break;
case "quarter":
_46e*=3;
case "month":
_46f=true;
_470="Month";
break;
default:
_470="UTC"+_46d.charAt(0).toUpperCase()+_46d.substring(1)+"s";
}
if(_470){
sum["set"+_470](sum["get"+_470]()+_46e);
}
if(_46f&&(sum.getDate()<date.getDate())){
sum.setDate(0);
}
return sum;
};
dojo.date.difference=function(_472,_473,_474){
_473=_473||new Date();
_474=_474||"day";
var _475=_473.getFullYear()-_472.getFullYear();
var _476=1;
switch(_474){
case "quarter":
var m1=_472.getMonth();
var m2=_473.getMonth();
var q1=Math.floor(m1/3)+1;
var q2=Math.floor(m2/3)+1;
q2+=(_475*4);
_476=q2-q1;
break;
case "weekday":
var days=Math.round(dojo.date.difference(_472,_473,"day"));
var _477=parseInt(dojo.date.difference(_472,_473,"week"));
var mod=days%7;
if(mod==0){
days=_477*5;
}else{
var adj=0;
var aDay=_472.getDay();
var bDay=_473.getDay();
_477=parseInt(days/7);
mod=days%7;
var _478=new Date(_472);
_478.setDate(_478.getDate()+(_477*7));
var _479=_478.getDay();
if(days>0){
switch(true){
case aDay==6:
adj=-1;
break;
case aDay==0:
adj=0;
break;
case bDay==6:
adj=-1;
break;
case bDay==0:
adj=-2;
break;
case (_479+mod)>5:
adj=-2;
}
}else{
if(days<0){
switch(true){
case aDay==6:
adj=0;
break;
case aDay==0:
adj=1;
break;
case bDay==6:
adj=2;
break;
case bDay==0:
adj=1;
break;
case (_479+mod)<0:
adj=2;
}
}
}
days+=adj;
days-=(_477*2);
}
_476=days;
break;
case "year":
_476=_475;
break;
case "month":
_476=(_473.getMonth()-_472.getMonth())+(_475*12);
break;
case "week":
_476=parseInt(dojo.date.difference(_472,_473,"day")/7);
break;
case "day":
_476/=24;
case "hour":
_476/=60;
case "minute":
_476/=60;
case "second":
_476/=1000;
case "millisecond":
_476*=_473.getTime()-_472.getTime();
}
return Math.round(_476);
};
}
if(!dojo._hasResource["dojo.cldr.supplemental"]){
dojo._hasResource["dojo.cldr.supplemental"]=true;
dojo.provide("dojo.cldr.supplemental");
dojo.getObject("cldr.supplemental",true,dojo);
dojo.cldr.supplemental.getFirstDayOfWeek=function(_47a){
var _47b={mv:5,ae:6,af:6,bh:6,dj:6,dz:6,eg:6,er:6,et:6,iq:6,ir:6,jo:6,ke:6,kw:6,ly:6,ma:6,om:6,qa:6,sa:6,sd:6,so:6,sy:6,tn:6,ye:6,ar:0,as:0,az:0,bw:0,ca:0,cn:0,fo:0,ge:0,gl:0,gu:0,hk:0,il:0,"in":0,jm:0,jp:0,kg:0,kr:0,la:0,mh:0,mn:0,mo:0,mp:0,mt:0,nz:0,ph:0,pk:0,sg:0,th:0,tt:0,tw:0,um:0,us:0,uz:0,vi:0,zw:0};
var _47c=dojo.cldr.supplemental._region(_47a);
var dow=_47b[_47c];
return (dow===undefined)?1:dow;
};
dojo.cldr.supplemental._region=function(_47d){
_47d=dojo.i18n.normalizeLocale(_47d);
var tags=_47d.split("-");
var _47e=tags[1];
if(!_47e){
_47e={de:"de",en:"us",es:"es",fi:"fi",fr:"fr",he:"il",hu:"hu",it:"it",ja:"jp",ko:"kr",nl:"nl",pt:"br",sv:"se",zh:"cn"}[tags[0]];
}else{
if(_47e.length==4){
_47e=tags[2];
}
}
return _47e;
};
dojo.cldr.supplemental.getWeekend=function(_47f){
var _480={"in":0,af:4,dz:4,ir:4,om:4,sa:4,ye:4,ae:5,bh:5,eg:5,il:5,iq:5,jo:5,kw:5,ly:5,ma:5,qa:5,sd:5,sy:5,tn:5};
var _481={af:5,dz:5,ir:5,om:5,sa:5,ye:5,ae:6,bh:5,eg:6,il:6,iq:6,jo:6,kw:6,ly:6,ma:6,qa:6,sd:6,sy:6,tn:6};
var _482=dojo.cldr.supplemental._region(_47f);
var _483=_480[_482];
var end=_481[_482];
if(_483===undefined){
_483=6;
}
if(end===undefined){
end=0;
}
return {start:_483,end:end};
};
}
if(!dojo._hasResource["dojo.date.locale"]){
dojo._hasResource["dojo.date.locale"]=true;
dojo.provide("dojo.date.locale");
dojo.getObject("date.locale",true,dojo);
(function(){
function _484(_485,_486,_487,_488){
return _488.replace(/([a-z])\1*/ig,function(_489){
var s,pad,c=_489.charAt(0),l=_489.length,_48a=["abbr","wide","narrow"];
switch(c){
case "G":
s=_486[(l<4)?"eraAbbr":"eraNames"][_485.getFullYear()<0?0:1];
break;
case "y":
s=_485.getFullYear();
switch(l){
case 1:
break;
case 2:
if(!_487.fullYear){
s=String(s);
s=s.substr(s.length-2);
break;
}
default:
pad=true;
}
break;
case "Q":
case "q":
s=Math.ceil((_485.getMonth()+1)/3);
pad=true;
break;
case "M":
var m=_485.getMonth();
if(l<3){
s=m+1;
pad=true;
}else{
var _48b=["months","format",_48a[l-3]].join("-");
s=_486[_48b][m];
}
break;
case "w":
var _48c=0;
s=dojo.date.locale._getWeekOfYear(_485,_48c);
pad=true;
break;
case "d":
s=_485.getDate();
pad=true;
break;
case "D":
s=dojo.date.locale._getDayOfYear(_485);
pad=true;
break;
case "E":
var d=_485.getDay();
if(l<3){
s=d+1;
pad=true;
}else{
var _48d=["days","format",_48a[l-3]].join("-");
s=_486[_48d][d];
}
break;
case "a":
var _48e=(_485.getHours()<12)?"am":"pm";
s=_487[_48e]||_486["dayPeriods-format-wide-"+_48e];
break;
case "h":
case "H":
case "K":
case "k":
var h=_485.getHours();
switch(c){
case "h":
s=(h%12)||12;
break;
case "H":
s=h;
break;
case "K":
s=(h%12);
break;
case "k":
s=h||24;
break;
}
pad=true;
break;
case "m":
s=_485.getMinutes();
pad=true;
break;
case "s":
s=_485.getSeconds();
pad=true;
break;
case "S":
s=Math.round(_485.getMilliseconds()*Math.pow(10,l-3));
pad=true;
break;
case "v":
case "z":
s=dojo.date.locale._getZone(_485,true,_487);
if(s){
break;
}
l=4;
case "Z":
var _48f=dojo.date.locale._getZone(_485,false,_487);
var tz=[(_48f<=0?"+":"-"),dojo.string.pad(Math.floor(Math.abs(_48f)/60),2),dojo.string.pad(Math.abs(_48f)%60,2)];
if(l==4){
tz.splice(0,0,"GMT");
tz.splice(3,0,":");
}
s=tz.join("");
break;
default:
throw new Error("dojo.date.locale.format: invalid pattern char: "+_488);
}
if(pad){
s=dojo.string.pad(s,l);
}
return s;
});
};
dojo.date.locale._getZone=function(_490,_491,_492){
if(_491){
return dojo.date.getTimezoneName(_490);
}else{
return _490.getTimezoneOffset();
}
};
dojo.date.locale.format=function(_493,_494){
_494=_494||{};
var _495=dojo.i18n.normalizeLocale(_494.locale),_496=_494.formatLength||"short",_497=dojo.date.locale._getGregorianBundle(_495),str=[],_498=dojo.hitch(this,_484,_493,_497,_494);
if(_494.selector=="year"){
return _499(_497["dateFormatItem-yyyy"]||"yyyy",_498);
}
var _49a;
if(_494.selector!="date"){
_49a=_494.timePattern||_497["timeFormat-"+_496];
if(_49a){
str.push(_499(_49a,_498));
}
}
if(_494.selector!="time"){
_49a=_494.datePattern||_497["dateFormat-"+_496];
if(_49a){
str.push(_499(_49a,_498));
}
}
return str.length==1?str[0]:_497["dateTimeFormat-"+_496].replace(/\{(\d+)\}/g,function(_49b,key){
return str[key];
});
};
dojo.date.locale.regexp=function(_49c){
return dojo.date.locale._parseInfo(_49c).regexp;
};
dojo.date.locale._parseInfo=function(_49d){
_49d=_49d||{};
var _49e=dojo.i18n.normalizeLocale(_49d.locale),_49f=dojo.date.locale._getGregorianBundle(_49e),_4a0=_49d.formatLength||"short",_4a1=_49d.datePattern||_49f["dateFormat-"+_4a0],_4a2=_49d.timePattern||_49f["timeFormat-"+_4a0],_4a3;
if(_49d.selector=="date"){
_4a3=_4a1;
}else{
if(_49d.selector=="time"){
_4a3=_4a2;
}else{
_4a3=_49f["dateTimeFormat-"+_4a0].replace(/\{(\d+)\}/g,function(_4a4,key){
return [_4a2,_4a1][key];
});
}
}
var _4a5=[],re=_499(_4a3,dojo.hitch(this,_4a6,_4a5,_49f,_49d));
return {regexp:re,tokens:_4a5,bundle:_49f};
};
dojo.date.locale.parse=function(_4a7,_4a8){
var _4a9=/[\u200E\u200F\u202A\u202E]/g,info=dojo.date.locale._parseInfo(_4a8),_4aa=info.tokens,_4ab=info.bundle,re=new RegExp("^"+info.regexp.replace(_4a9,"")+"$",info.strict?"":"i"),_4ac=re.exec(_4a7&&_4a7.replace(_4a9,""));
if(!_4ac){
return null;
}
var _4ad=["abbr","wide","narrow"],_4ae=[1970,0,1,0,0,0,0],amPm="",_4af=dojo.every(_4ac,function(v,i){
if(!i){
return true;
}
var _4b0=_4aa[i-1];
var l=_4b0.length;
switch(_4b0.charAt(0)){
case "y":
if(l!=2&&_4a8.strict){
_4ae[0]=v;
}else{
if(v<100){
v=Number(v);
var year=""+new Date().getFullYear(),_4b1=year.substring(0,2)*100,_4b2=Math.min(Number(year.substring(2,4))+20,99),num=(v<_4b2)?_4b1+v:_4b1-100+v;
_4ae[0]=num;
}else{
if(_4a8.strict){
return false;
}
_4ae[0]=v;
}
}
break;
case "M":
if(l>2){
var _4b3=_4ab["months-format-"+_4ad[l-3]].concat();
if(!_4a8.strict){
v=v.replace(".","").toLowerCase();
_4b3=dojo.map(_4b3,function(s){
return s.replace(".","").toLowerCase();
});
}
v=dojo.indexOf(_4b3,v);
if(v==-1){
return false;
}
}else{
v--;
}
_4ae[1]=v;
break;
case "E":
case "e":
var days=_4ab["days-format-"+_4ad[l-3]].concat();
if(!_4a8.strict){
v=v.toLowerCase();
days=dojo.map(days,function(d){
return d.toLowerCase();
});
}
v=dojo.indexOf(days,v);
if(v==-1){
return false;
}
break;
case "D":
_4ae[1]=0;
case "d":
_4ae[2]=v;
break;
case "a":
var am=_4a8.am||_4ab["dayPeriods-format-wide-am"],pm=_4a8.pm||_4ab["dayPeriods-format-wide-pm"];
if(!_4a8.strict){
var _4b4=/\./g;
v=v.replace(_4b4,"").toLowerCase();
am=am.replace(_4b4,"").toLowerCase();
pm=pm.replace(_4b4,"").toLowerCase();
}
if(_4a8.strict&&v!=am&&v!=pm){
return false;
}
amPm=(v==pm)?"p":(v==am)?"a":"";
break;
case "K":
if(v==24){
v=0;
}
case "h":
case "H":
case "k":
if(v>23){
return false;
}
_4ae[3]=v;
break;
case "m":
_4ae[4]=v;
break;
case "s":
_4ae[5]=v;
break;
case "S":
_4ae[6]=v;
}
return true;
});
var _4b5=+_4ae[3];
if(amPm==="p"&&_4b5<12){
_4ae[3]=_4b5+12;
}else{
if(amPm==="a"&&_4b5==12){
_4ae[3]=0;
}
}
var _4b6=new Date(_4ae[0],_4ae[1],_4ae[2],_4ae[3],_4ae[4],_4ae[5],_4ae[6]);
if(_4a8.strict){
_4b6.setFullYear(_4ae[0]);
}
var _4b7=_4aa.join(""),_4b8=_4b7.indexOf("d")!=-1,_4b9=_4b7.indexOf("M")!=-1;
if(!_4af||(_4b9&&_4b6.getMonth()>_4ae[1])||(_4b8&&_4b6.getDate()>_4ae[2])){
return null;
}
if((_4b9&&_4b6.getMonth()<_4ae[1])||(_4b8&&_4b6.getDate()<_4ae[2])){
_4b6=dojo.date.add(_4b6,"hour",1);
}
return _4b6;
};
function _499(_4ba,_4bb,_4bc,_4bd){
var _4be=function(x){
return x;
};
_4bb=_4bb||_4be;
_4bc=_4bc||_4be;
_4bd=_4bd||_4be;
var _4bf=_4ba.match(/(''|[^'])+/g),_4c0=_4ba.charAt(0)=="'";
dojo.forEach(_4bf,function(_4c1,i){
if(!_4c1){
_4bf[i]="";
}else{
_4bf[i]=(_4c0?_4bc:_4bb)(_4c1.replace(/''/g,"'"));
_4c0=!_4c0;
}
});
return _4bd(_4bf.join(""));
};
function _4a6(_4c2,_4c3,_4c4,_4c5){
_4c5=dojo.regexp.escapeString(_4c5);
if(!_4c4.strict){
_4c5=_4c5.replace(" a"," ?a");
}
return _4c5.replace(/([a-z])\1*/ig,function(_4c6){
var s,c=_4c6.charAt(0),l=_4c6.length,p2="",p3="";
if(_4c4.strict){
if(l>1){
p2="0"+"{"+(l-1)+"}";
}
if(l>2){
p3="0"+"{"+(l-2)+"}";
}
}else{
p2="0?";
p3="0{0,2}";
}
switch(c){
case "y":
s="\\d{2,4}";
break;
case "M":
s=(l>2)?"\\S+?":p2+"[1-9]|1[0-2]";
break;
case "D":
s=p2+"[1-9]|"+p3+"[1-9][0-9]|[12][0-9][0-9]|3[0-5][0-9]|36[0-6]";
break;
case "d":
s="3[01]|[12]\\d|"+p2+"[1-9]";
break;
case "w":
s=p2+"[1-9]|[1-4][0-9]|5[0-3]";
break;
case "E":
s="\\S+";
break;
case "h":
s=p2+"[1-9]|1[0-2]";
break;
case "k":
s=p2+"\\d|1[01]";
break;
case "H":
s=p2+"\\d|1\\d|2[0-3]";
break;
case "K":
s=p2+"[1-9]|1\\d|2[0-4]";
break;
case "m":
case "s":
s="[0-5]\\d";
break;
case "S":
s="\\d{"+l+"}";
break;
case "a":
var am=_4c4.am||_4c3["dayPeriods-format-wide-am"],pm=_4c4.pm||_4c3["dayPeriods-format-wide-pm"];
if(_4c4.strict){
s=am+"|"+pm;
}else{
s=am+"|"+pm;
if(am!=am.toLowerCase()){
s+="|"+am.toLowerCase();
}
if(pm!=pm.toLowerCase()){
s+="|"+pm.toLowerCase();
}
if(s.indexOf(".")!=-1){
s+="|"+s.replace(/\./g,"");
}
}
s=s.replace(/\./g,"\\.");
break;
default:
s=".*";
}
if(_4c2){
_4c2.push(_4c6);
}
return "("+s+")";
}).replace(/[\xa0 ]/g,"[\\s\\xa0]");
};
})();
(function(){
var _4c7=[];
dojo.date.locale.addCustomFormats=function(_4c8,_4c9){
_4c7.push({pkg:_4c8,name:_4c9});
};
dojo.date.locale._getGregorianBundle=function(_4ca){
var _4cb={};
dojo.forEach(_4c7,function(desc){
var _4cc=dojo.i18n.getLocalization(desc.pkg,desc.name,_4ca);
_4cb=dojo.mixin(_4cb,_4cc);
},this);
return _4cb;
};
})();
dojo.date.locale.addCustomFormats("dojo.cldr","gregorian");
dojo.date.locale.getNames=function(item,type,_4cd,_4ce){
var _4cf,_4d0=dojo.date.locale._getGregorianBundle(_4ce),_4d1=[item,_4cd,type];
if(_4cd=="standAlone"){
var key=_4d1.join("-");
_4cf=_4d0[key];
if(_4cf[0]==1){
_4cf=undefined;
}
}
_4d1[1]="format";
return (_4cf||_4d0[_4d1.join("-")]).concat();
};
dojo.date.locale.isWeekend=function(_4d2,_4d3){
var _4d4=dojo.cldr.supplemental.getWeekend(_4d3),day=(_4d2||new Date()).getDay();
if(_4d4.end<_4d4.start){
_4d4.end+=7;
if(day<_4d4.start){
day+=7;
}
}
return day>=_4d4.start&&day<=_4d4.end;
};
dojo.date.locale._getDayOfYear=function(_4d5){
return dojo.date.difference(new Date(_4d5.getFullYear(),0,1,_4d5.getHours()),_4d5)+1;
};
dojo.date.locale._getWeekOfYear=function(_4d6,_4d7){
if(arguments.length==1){
_4d7=0;
}
var _4d8=new Date(_4d6.getFullYear(),0,1).getDay(),adj=(_4d8-_4d7+7)%7,week=Math.floor((dojo.date.locale._getDayOfYear(_4d6)+adj-1)/7);
if(_4d8==_4d7){
week++;
}
return week;
};
}
if(!dojo._hasResource["dijit._TimePicker"]){
dojo._hasResource["dijit._TimePicker"]=true;
dojo.provide("dijit._TimePicker");
dojo.declare("dijit._TimePicker",[dijit._Widget,dijit._Templated],{templateString:dojo.cache("dijit","templates/TimePicker.html","<div id=\"widget_${id}\" class=\"dijitMenu\"\r\n    ><div dojoAttachPoint=\"upArrow\" class=\"dijitButtonNode dijitUpArrowButton\" dojoAttachEvent=\"onmouseenter:_buttonMouse,onmouseleave:_buttonMouse\"\r\n\t\t><div class=\"dijitReset dijitInline dijitArrowButtonInner\" role=\"presentation\">&nbsp;</div\r\n\t\t><div class=\"dijitArrowButtonChar\">&#9650;</div></div\r\n    ><div dojoAttachPoint=\"timeMenu,focusNode\" dojoAttachEvent=\"onclick:_onOptionSelected,onmouseover,onmouseout\"></div\r\n    ><div dojoAttachPoint=\"downArrow\" class=\"dijitButtonNode dijitDownArrowButton\" dojoAttachEvent=\"onmouseenter:_buttonMouse,onmouseleave:_buttonMouse\"\r\n\t\t><div class=\"dijitReset dijitInline dijitArrowButtonInner\" role=\"presentation\">&nbsp;</div\r\n\t\t><div class=\"dijitArrowButtonChar\">&#9660;</div></div\r\n></div>\r\n"),baseClass:"dijitTimePicker",clickableIncrement:"T00:15:00",visibleIncrement:"T01:00:00",visibleRange:"T05:00:00",value:new Date(),_visibleIncrement:2,_clickableIncrement:1,_totalIncrements:10,constraints:{},serialize:dojo.date.stamp.toISOString,setValue:function(_4d9){
dojo.deprecated("dijit._TimePicker:setValue() is deprecated.  Use set('value', ...) instead.","","2.0");
this.set("value",_4d9);
},_setValueAttr:function(date){
this._set("value",date);
this._showText();
},_setFilterStringAttr:function(val){
this._set("filterString",val);
this._showText();
},isDisabledDate:function(_4da,_4db){
return false;
},_getFilteredNodes:function(_4dc,_4dd,_4de,_4df){
var _4e0=[],_4e1=_4df?_4df.date:this._refDate,n,i=_4dc,max=this._maxIncrement+Math.abs(i),chk=_4de?-1:1,dec=_4de?1:0,inc=1-dec;
do{
i=i-dec;
n=this._createOption(i);
if(n){
if((_4de&&n.date>_4e1)||(!_4de&&n.date<_4e1)){
break;
}
_4e0[_4de?"unshift":"push"](n);
_4e1=n.date;
}
i=i+inc;
}while(_4e0.length<_4dd&&(i*chk)<max);
return _4e0;
},_showText:function(){
var _4e2=dojo.date.stamp.fromISOString;
this.timeMenu.innerHTML="";
this._clickableIncrementDate=_4e2(this.clickableIncrement);
this._visibleIncrementDate=_4e2(this.visibleIncrement);
this._visibleRangeDate=_4e2(this.visibleRange);
var _4e3=function(date){
return date.getHours()*60*60+date.getMinutes()*60+date.getSeconds();
},_4e4=_4e3(this._clickableIncrementDate),_4e5=_4e3(this._visibleIncrementDate),_4e6=_4e3(this._visibleRangeDate),time=(this.value||this.currentFocus).getTime();
this._refDate=new Date(time-time%(_4e5*1000));
this._refDate.setFullYear(1970,0,1);
this._clickableIncrement=1;
this._totalIncrements=_4e6/_4e4;
this._visibleIncrement=_4e5/_4e4;
this._maxIncrement=(60*60*24)/_4e4;
var _4e7=this._getFilteredNodes(0,Math.min(this._totalIncrements>>1,10)-1),_4e8=this._getFilteredNodes(0,Math.min(this._totalIncrements,10)-_4e7.length,true,_4e7[0]);
dojo.forEach(_4e8.concat(_4e7),function(n){
this.timeMenu.appendChild(n);
},this);
},constructor:function(){
this.constraints={};
},postMixInProperties:function(){
this.inherited(arguments);
this._setConstraintsAttr(this.constraints);
},_setConstraintsAttr:function(_4e9){
dojo.mixin(this,_4e9);
if(!_4e9.locale){
_4e9.locale=this.lang;
}
},postCreate:function(){
this.connect(this.timeMenu,dojo.isIE?"onmousewheel":"DOMMouseScroll","_mouseWheeled");
this._connects.push(dijit.typematic.addMouseListener(this.upArrow,this,"_onArrowUp",33,250));
this._connects.push(dijit.typematic.addMouseListener(this.downArrow,this,"_onArrowDown",33,250));
this.inherited(arguments);
},_buttonMouse:function(e){
dojo.toggleClass(e.currentTarget,e.currentTarget==this.upArrow?"dijitUpArrowHover":"dijitDownArrowHover",e.type=="mouseenter"||e.type=="mouseover");
},_createOption:function(_4ea){
var date=new Date(this._refDate);
var _4eb=this._clickableIncrementDate;
date.setHours(date.getHours()+_4eb.getHours()*_4ea,date.getMinutes()+_4eb.getMinutes()*_4ea,date.getSeconds()+_4eb.getSeconds()*_4ea);
if(this.constraints.selector=="time"){
date.setFullYear(1970,0,1);
}
var _4ec=dojo.date.locale.format(date,this.constraints);
if(this.filterString&&_4ec.toLowerCase().indexOf(this.filterString)!==0){
return null;
}
var div=dojo.create("div",{"class":this.baseClass+"Item"});
div.date=date;
div.index=_4ea;
dojo.create("div",{"class":this.baseClass+"ItemInner",innerHTML:_4ec},div);
if(_4ea%this._visibleIncrement<1&&_4ea%this._visibleIncrement>-1){
dojo.addClass(div,this.baseClass+"Marker");
}else{
if(!(_4ea%this._clickableIncrement)){
dojo.addClass(div,this.baseClass+"Tick");
}
}
if(this.isDisabledDate(date)){
dojo.addClass(div,this.baseClass+"ItemDisabled");
}
if(this.value&&!dojo.date.compare(this.value,date,this.constraints.selector)){
div.selected=true;
dojo.addClass(div,this.baseClass+"ItemSelected");
if(dojo.hasClass(div,this.baseClass+"Marker")){
dojo.addClass(div,this.baseClass+"MarkerSelected");
}else{
dojo.addClass(div,this.baseClass+"TickSelected");
}
this._highlightOption(div,true);
}
return div;
},_onOptionSelected:function(tgt){
var _4ed=tgt.target.date||tgt.target.parentNode.date;
if(!_4ed||this.isDisabledDate(_4ed)){
return;
}
this._highlighted_option=null;
this.set("value",_4ed);
this.onChange(_4ed);
},onChange:function(time){
},_highlightOption:function(node,_4ee){
if(!node){
return;
}
if(_4ee){
if(this._highlighted_option){
this._highlightOption(this._highlighted_option,false);
}
this._highlighted_option=node;
}else{
if(this._highlighted_option!==node){
return;
}else{
this._highlighted_option=null;
}
}
dojo.toggleClass(node,this.baseClass+"ItemHover",_4ee);
if(dojo.hasClass(node,this.baseClass+"Marker")){
dojo.toggleClass(node,this.baseClass+"MarkerHover",_4ee);
}else{
dojo.toggleClass(node,this.baseClass+"TickHover",_4ee);
}
},onmouseover:function(e){
this._keyboardSelected=null;
var tgr=(e.target.parentNode===this.timeMenu)?e.target:e.target.parentNode;
if(!dojo.hasClass(tgr,this.baseClass+"Item")){
return;
}
this._highlightOption(tgr,true);
},onmouseout:function(e){
this._keyboardSelected=null;
var tgr=(e.target.parentNode===this.timeMenu)?e.target:e.target.parentNode;
this._highlightOption(tgr,false);
},_mouseWheeled:function(e){
this._keyboardSelected=null;
dojo.stopEvent(e);
var _4ef=(dojo.isIE?e.wheelDelta:-e.detail);
this[(_4ef>0?"_onArrowUp":"_onArrowDown")]();
},_onArrowUp:function(_4f0){
if(typeof _4f0=="number"&&_4f0==-1){
return;
}
if(!this.timeMenu.childNodes.length){
return;
}
var _4f1=this.timeMenu.childNodes[0].index;
var divs=this._getFilteredNodes(_4f1,1,true,this.timeMenu.childNodes[0]);
if(divs.length){
this.timeMenu.removeChild(this.timeMenu.childNodes[this.timeMenu.childNodes.length-1]);
this.timeMenu.insertBefore(divs[0],this.timeMenu.childNodes[0]);
}
},_onArrowDown:function(_4f2){
if(typeof _4f2=="number"&&_4f2==-1){
return;
}
if(!this.timeMenu.childNodes.length){
return;
}
var _4f3=this.timeMenu.childNodes[this.timeMenu.childNodes.length-1].index+1;
var divs=this._getFilteredNodes(_4f3,1,false,this.timeMenu.childNodes[this.timeMenu.childNodes.length-1]);
if(divs.length){
this.timeMenu.removeChild(this.timeMenu.childNodes[0]);
this.timeMenu.appendChild(divs[0]);
}
},handleKey:function(e){
var dk=dojo.keys;
if(e.charOrCode==dk.DOWN_ARROW||e.charOrCode==dk.UP_ARROW){
dojo.stopEvent(e);
if(this._highlighted_option&&!this._highlighted_option.parentNode){
this._highlighted_option=null;
}
var _4f4=this.timeMenu,tgt=this._highlighted_option||dojo.query("."+this.baseClass+"ItemSelected",_4f4)[0];
if(!tgt){
tgt=_4f4.childNodes[0];
}else{
if(_4f4.childNodes.length){
if(e.charOrCode==dk.DOWN_ARROW&&!tgt.nextSibling){
this._onArrowDown();
}else{
if(e.charOrCode==dk.UP_ARROW&&!tgt.previousSibling){
this._onArrowUp();
}
}
if(e.charOrCode==dk.DOWN_ARROW){
tgt=tgt.nextSibling;
}else{
tgt=tgt.previousSibling;
}
}
}
this._highlightOption(tgt,true);
this._keyboardSelected=tgt;
return false;
}else{
if(e.charOrCode==dk.ENTER||e.charOrCode===dk.TAB){
if(!this._keyboardSelected&&e.charOrCode===dk.TAB){
return true;
}
if(this._highlighted_option){
this._onOptionSelected({target:this._highlighted_option});
}
return e.charOrCode===dk.TAB;
}
}
}});
}
if(!dojo._hasResource["dijit.form._DateTimeTextBox"]){
dojo._hasResource["dijit.form._DateTimeTextBox"]=true;
dojo.provide("dijit.form._DateTimeTextBox");
new Date("X");
dojo.declare("dijit.form._DateTimeTextBox",[dijit.form.RangeBoundTextBox,dijit._HasDropDown],{templateString:dojo.cache("dijit.form","templates/DropDownBox.html","<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\r\n\tid=\"widget_${id}\"\r\n\trole=\"combobox\"\r\n\t><div class='dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton dijitArrowButtonContainer'\r\n\t\tdojoAttachPoint=\"_buttonNode, _popupStateNode\" role=\"presentation\"\r\n\t\t><input class=\"dijitReset dijitInputField dijitArrowButtonInner\" value=\"&#9660; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\r\n\t\t\t${_buttonInputDisabled}\r\n\t/></div\r\n\t><div class='dijitReset dijitValidationContainer'\r\n\t\t><input class=\"dijitReset dijitInputField dijitValidationIcon dijitValidationInner\" value=\"&#935;\" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\r\n\t/></div\r\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\r\n\t\t><input class='dijitReset dijitInputInner' ${!nameAttrSetting} type=\"text\" autocomplete=\"off\"\r\n\t\t\tdojoAttachPoint=\"textbox,focusNode\" role=\"textbox\" aria-haspopup=\"true\"\r\n\t/></div\r\n></div>\r\n"),hasDownArrow:true,openOnClick:true,regExpGen:dojo.date.locale.regexp,datePackage:"dojo.date",compare:function(val1,val2){
return dojo.date.compare(val1,val2,this._selector);
},forceWidth:true,format:function(_4f5,_4f6){
if(!_4f5){
return "";
}
return this.dateLocaleModule.format(_4f5,_4f6);
},"parse":function(_4f7,_4f8){
return this.dateLocaleModule.parse(_4f7,_4f8)||(this._isEmpty(_4f7)?null:undefined);
},serialize:function(val,_4f9){
if(val.toGregorian){
val=val.toGregorian();
}
return dojo.date.stamp.toISOString(val,_4f9);
},dropDownDefaultValue:new Date(),value:new Date(""),_blankValue:null,popupClass:"",_selector:"",constructor:function(args){
var _4fa=args.datePackage?args.datePackage+".Date":"Date";
this.dateClassObj=dojo.getObject(_4fa,false);
this.value=new this.dateClassObj("");
this.datePackage=args.datePackage||this.datePackage;
this.dateLocaleModule=dojo.getObject(this.datePackage+".locale",false);
this.regExpGen=this.dateLocaleModule.regexp;
this._invalidDate=dijit.form._DateTimeTextBox.prototype.value.toString();
},buildRendering:function(){
this.inherited(arguments);
if(!this.hasDownArrow){
this._buttonNode.style.display="none";
}
if(this.openOnClick||!this.hasDownArrow){
this._buttonNode=this.domNode;
this.baseClass+=" dijitComboBoxOpenOnClick";
}
},_setConstraintsAttr:function(_4fb){
_4fb.selector=this._selector;
_4fb.fullYear=true;
var _4fc=dojo.date.stamp.fromISOString;
if(typeof _4fb.min=="string"){
_4fb.min=_4fc(_4fb.min);
}
if(typeof _4fb.max=="string"){
_4fb.max=_4fc(_4fb.max);
}
this.inherited(arguments,[_4fb]);
},_isInvalidDate:function(_4fd){
return !_4fd||isNaN(_4fd)||typeof _4fd!="object"||_4fd.toString()==this._invalidDate;
},_setValueAttr:function(_4fe,_4ff,_500){
if(_4fe!==undefined){
if(typeof _4fe=="string"){
_4fe=dojo.date.stamp.fromISOString(_4fe);
}
if(this._isInvalidDate(_4fe)){
_4fe=null;
}
if(_4fe instanceof Date&&!(this.dateClassObj instanceof Date)){
_4fe=new this.dateClassObj(_4fe);
}
}
this.inherited(arguments,[_4fe,_4ff,_500]);
if(this.dropDown){
this.dropDown.set("value",_4fe,false);
}
},_set:function(attr,_501){
if(attr=="value"&&this.value instanceof Date&&((this._isInvalidDate(this.value)&&this._isInvalidDate(_501))||this.compare(_501,this.value)==0)){
return;
}
this.inherited(arguments);
},_setDropDownDefaultValueAttr:function(val){
if(this._isInvalidDate(val)){
val=new this.dateClassObj();
}
this.dropDownDefaultValue=val;
},openDropDown:function(_502){
if(this.dropDown){
this.dropDown.destroy();
}
var _503=dojo.getObject(this.popupClass,false),_504=this,_505=this.get("value");
this.dropDown=new _503({onChange:function(_506){
dijit.form._DateTimeTextBox.superclass._setValueAttr.call(_504,_506,true);
},id:this.id+"_popup",dir:_504.dir,lang:_504.lang,value:_505,currentFocus:!this._isInvalidDate(_505)?_505:this.dropDownDefaultValue,constraints:_504.constraints,filterString:_504.filterString,datePackage:_504.datePackage,isDisabledDate:function(date){
return !_504.rangeCheck(date,_504.constraints);
}});
this.inherited(arguments);
},_getDisplayedValueAttr:function(){
return this.textbox.value;
},_setDisplayedValueAttr:function(_507,_508){
this._setValueAttr(this.parse(_507,this.constraints),_508,_507);
}});
}
if(!dojo._hasResource["dijit.form.TimeTextBox"]){
dojo._hasResource["dijit.form.TimeTextBox"]=true;
dojo.provide("dijit.form.TimeTextBox");
dojo.declare("dijit.form.TimeTextBox",dijit.form._DateTimeTextBox,{baseClass:"dijitTextBox dijitComboBox dijitTimeTextBox",popupClass:"dijit._TimePicker",_selector:"time",value:new Date(""),_onKey:function(evt){
this.inherited(arguments);
switch(evt.keyCode){
case dojo.keys.ENTER:
case dojo.keys.TAB:
case dojo.keys.ESCAPE:
case dojo.keys.DOWN_ARROW:
case dojo.keys.UP_ARROW:
break;
default:
setTimeout(dojo.hitch(this,function(){
var val=this.get("displayedValue");
this.filterString=(val&&!this.parse(val,this.constraints))?val.toLowerCase():"";
if(this._opened){
this.closeDropDown();
}
this.openDropDown();
}),0);
}
}});
}
if(!dojo._hasResource["dijit.form.DropDownButton"]){
dojo._hasResource["dijit.form.DropDownButton"]=true;
dojo.provide("dijit.form.DropDownButton");
}
if(!dojo._hasResource["dijit.Calendar"]){
dojo._hasResource["dijit.Calendar"]=true;
dojo.provide("dijit.Calendar");
dojo.declare("dijit.Calendar",[dijit._Widget,dijit._Templated,dijit._CssStateMixin],{templateString:dojo.cache("dijit","templates/Calendar.html","<table cellspacing=\"0\" cellpadding=\"0\" class=\"dijitCalendarContainer\" role=\"grid\" dojoAttachEvent=\"onkeypress: _onKeyPress\" aria-labelledby=\"${id}_year\">\r\n\t<thead>\r\n\t\t<tr class=\"dijitReset dijitCalendarMonthContainer\" valign=\"top\">\r\n\t\t\t<th class='dijitReset dijitCalendarArrow' dojoAttachPoint=\"decrementMonth\">\r\n\t\t\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitCalendarIncrementControl dijitCalendarDecrease\" role=\"presentation\"/>\r\n\t\t\t\t<span dojoAttachPoint=\"decreaseArrowNode\" class=\"dijitA11ySideArrow\">-</span>\r\n\t\t\t</th>\r\n\t\t\t<th class='dijitReset' colspan=\"5\">\r\n\t\t\t\t<div dojoType=\"dijit.form.DropDownButton\" dojoAttachPoint=\"monthDropDownButton\"\r\n\t\t\t\t\tid=\"${id}_mddb\" tabIndex=\"-1\">\r\n\t\t\t\t</div>\r\n\t\t\t</th>\r\n\t\t\t<th class='dijitReset dijitCalendarArrow' dojoAttachPoint=\"incrementMonth\">\r\n\t\t\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitCalendarIncrementControl dijitCalendarIncrease\" role=\"presentation\"/>\r\n\t\t\t\t<span dojoAttachPoint=\"increaseArrowNode\" class=\"dijitA11ySideArrow\">+</span>\r\n\t\t\t</th>\r\n\t\t</tr>\r\n\t\t<tr>\r\n\t\t\t<th class=\"dijitReset dijitCalendarDayLabelTemplate\" role=\"columnheader\"><span class=\"dijitCalendarDayLabel\"></span></th>\r\n\t\t</tr>\r\n\t</thead>\r\n\t<tbody dojoAttachEvent=\"onclick: _onDayClick, onmouseover: _onDayMouseOver, onmouseout: _onDayMouseOut, onmousedown: _onDayMouseDown, onmouseup: _onDayMouseUp\" class=\"dijitReset dijitCalendarBodyContainer\">\r\n\t\t<tr class=\"dijitReset dijitCalendarWeekTemplate\" role=\"row\">\r\n\t\t\t<td class=\"dijitReset dijitCalendarDateTemplate\" role=\"gridcell\"><span class=\"dijitCalendarDateLabel\"></span></td>\r\n\t\t</tr>\r\n\t</tbody>\r\n\t<tfoot class=\"dijitReset dijitCalendarYearContainer\">\r\n\t\t<tr>\r\n\t\t\t<td class='dijitReset' valign=\"top\" colspan=\"7\">\r\n\t\t\t\t<h3 class=\"dijitCalendarYearLabel\">\r\n\t\t\t\t\t<span dojoAttachPoint=\"previousYearLabelNode\" class=\"dijitInline dijitCalendarPreviousYear\"></span>\r\n\t\t\t\t\t<span dojoAttachPoint=\"currentYearLabelNode\" class=\"dijitInline dijitCalendarSelectedYear\" id=\"${id}_year\"></span>\r\n\t\t\t\t\t<span dojoAttachPoint=\"nextYearLabelNode\" class=\"dijitInline dijitCalendarNextYear\"></span>\r\n\t\t\t\t</h3>\r\n\t\t\t</td>\r\n\t\t</tr>\r\n\t</tfoot>\r\n</table>\r\n"),widgetsInTemplate:true,value:new Date(""),datePackage:"dojo.date",dayWidth:"narrow",tabIndex:"0",currentFocus:new Date(),baseClass:"dijitCalendar",cssStateNodes:{"decrementMonth":"dijitCalendarArrow","incrementMonth":"dijitCalendarArrow","previousYearLabelNode":"dijitCalendarPreviousYear","nextYearLabelNode":"dijitCalendarNextYear"},_isValidDate:function(_509){
return _509&&!isNaN(_509)&&typeof _509=="object"&&_509.toString()!=this.constructor.prototype.value.toString();
},setValue:function(_50a){
dojo.deprecated("dijit.Calendar:setValue() is deprecated.  Use set('value', ...) instead.","","2.0");
this.set("value",_50a);
},_getValueAttr:function(){
var _50b=new this.dateClassObj(this.value);
_50b.setHours(0,0,0,0);
if(_50b.getDate()<this.value.getDate()){
_50b=this.dateFuncObj.add(_50b,"hour",1);
}
return _50b;
},_setValueAttr:function(_50c,_50d){
if(_50c){
_50c=new this.dateClassObj(_50c);
}
if(this._isValidDate(_50c)){
if(!this._isValidDate(this.value)||this.dateFuncObj.compare(_50c,this.value)){
_50c.setHours(1,0,0,0);
if(!this.isDisabledDate(_50c,this.lang)){
this._set("value",_50c);
this.set("currentFocus",_50c);
if(_50d||typeof _50d=="undefined"){
this.onChange(this.get("value"));
this.onValueSelected(this.get("value"));
}
}
}
}else{
this._set("value",null);
this.set("currentFocus",this.currentFocus);
}
},_setText:function(node,text){
while(node.firstChild){
node.removeChild(node.firstChild);
}
node.appendChild(dojo.doc.createTextNode(text));
},_populateGrid:function(){
var _50e=new this.dateClassObj(this.currentFocus);
_50e.setDate(1);
var _50f=_50e.getDay(),_510=this.dateFuncObj.getDaysInMonth(_50e),_511=this.dateFuncObj.getDaysInMonth(this.dateFuncObj.add(_50e,"month",-1)),_512=new this.dateClassObj(),_513=dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
if(_513>_50f){
_513-=7;
}
dojo.query(".dijitCalendarDateTemplate",this.domNode).forEach(function(_514,i){
i+=_513;
var date=new this.dateClassObj(_50e),_515,_516="dijitCalendar",adj=0;
if(i<_50f){
_515=_511-_50f+i+1;
adj=-1;
_516+="Previous";
}else{
if(i>=(_50f+_510)){
_515=i-_50f-_510+1;
adj=1;
_516+="Next";
}else{
_515=i-_50f+1;
_516+="Current";
}
}
if(adj){
date=this.dateFuncObj.add(date,"month",adj);
}
date.setDate(_515);
if(!this.dateFuncObj.compare(date,_512,"date")){
_516="dijitCalendarCurrentDate "+_516;
}
if(this._isSelectedDate(date,this.lang)){
_516="dijitCalendarSelectedDate "+_516;
}
if(this.isDisabledDate(date,this.lang)){
_516="dijitCalendarDisabledDate "+_516;
}
var _517=this.getClassForDate(date,this.lang);
if(_517){
_516=_517+" "+_516;
}
_514.className=_516+"Month dijitCalendarDateTemplate";
_514.dijitDateValue=date.valueOf();
dojo.attr(_514,"dijitDateValue",date.valueOf());
var _518=dojo.query(".dijitCalendarDateLabel",_514)[0],text=date.getDateLocalized?date.getDateLocalized(this.lang):date.getDate();
this._setText(_518,text);
},this);
var _519=this.dateLocaleModule.getNames("months","wide","standAlone",this.lang,_50e);
this.monthDropDownButton.dropDown.set("months",_519);
this.monthDropDownButton.containerNode.innerHTML=(dojo.isIE==6?"":"<div class='dijitSpacer'>"+this.monthDropDownButton.dropDown.domNode.innerHTML+"</div>")+"<div class='dijitCalendarMonthLabel dijitCalendarCurrentMonthLabel'>"+_519[_50e.getMonth()]+"</div>";
var y=_50e.getFullYear()-1;
var d=new this.dateClassObj();
dojo.forEach(["previous","current","next"],function(name){
d.setFullYear(y++);
this._setText(this[name+"YearLabelNode"],this.dateLocaleModule.format(d,{selector:"year",locale:this.lang}));
},this);
},goToToday:function(){
this.set("value",new this.dateClassObj());
},constructor:function(args){
var _51a=(args.datePackage&&(args.datePackage!="dojo.date"))?args.datePackage+".Date":"Date";
this.dateClassObj=dojo.getObject(_51a,false);
this.datePackage=args.datePackage||this.datePackage;
this.dateFuncObj=dojo.getObject(this.datePackage,false);
this.dateLocaleModule=dojo.getObject(this.datePackage+".locale",false);
},postMixInProperties:function(){
if(isNaN(this.value)){
delete this.value;
}
this.inherited(arguments);
},buildRendering:function(){
this.inherited(arguments);
dojo.setSelectable(this.domNode,false);
var _51b=dojo.hitch(this,function(_51c,n){
var _51d=dojo.query(_51c,this.domNode)[0];
for(var i=0;i<n;i++){
_51d.parentNode.appendChild(_51d.cloneNode(true));
}
});
_51b(".dijitCalendarDayLabelTemplate",6);
_51b(".dijitCalendarDateTemplate",6);
_51b(".dijitCalendarWeekTemplate",5);
var _51e=this.dateLocaleModule.getNames("days",this.dayWidth,"standAlone",this.lang);
var _51f=dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
dojo.query(".dijitCalendarDayLabel",this.domNode).forEach(function(_520,i){
this._setText(_520,_51e[(i+_51f)%7]);
},this);
var _521=new this.dateClassObj(this.currentFocus);
this.monthDropDownButton.dropDown=new dijit.Calendar._MonthDropDown({id:this.id+"_mdd",onChange:dojo.hitch(this,"_onMonthSelect")});
this.set("currentFocus",_521,false);
var _522=this;
var _523=function(_524,_525,adj){
_522._connects.push(dijit.typematic.addMouseListener(_522[_524],_522,function(_526){
if(_526>=0){
_522._adjustDisplay(_525,adj);
}
},0.8,500));
};
_523("incrementMonth","month",1);
_523("decrementMonth","month",-1);
_523("nextYearLabelNode","year",1);
_523("previousYearLabelNode","year",-1);
},_adjustDisplay:function(part,_527){
this._setCurrentFocusAttr(this.dateFuncObj.add(this.currentFocus,part,_527));
},_setCurrentFocusAttr:function(date,_528){
var _529=this.currentFocus,_52a=_529?dojo.query("[dijitDateValue="+_529.valueOf()+"]",this.domNode)[0]:null;
date=new this.dateClassObj(date);
date.setHours(1,0,0,0);
this._set("currentFocus",date);
this._populateGrid();
var _52b=dojo.query("[dijitDateValue="+date.valueOf()+"]",this.domNode)[0];
_52b.setAttribute("tabIndex",this.tabIndex);
if(this._focused||_528){
_52b.focus();
}
if(_52a&&_52a!=_52b){
if(dojo.isWebKit){
_52a.setAttribute("tabIndex","-1");
}else{
_52a.removeAttribute("tabIndex");
}
}
},focus:function(){
this._setCurrentFocusAttr(this.currentFocus,true);
},_onMonthSelect:function(_52c){
this.currentFocus=this.dateFuncObj.add(this.currentFocus,"month",_52c-this.currentFocus.getMonth());
this._populateGrid();
},_onDayClick:function(evt){
dojo.stopEvent(evt);
for(var node=evt.target;node&&!node.dijitDateValue;node=node.parentNode){
}
if(node&&!dojo.hasClass(node,"dijitCalendarDisabledDate")){
this.set("value",node.dijitDateValue);
}
},_onDayMouseOver:function(evt){
var node=dojo.hasClass(evt.target,"dijitCalendarDateLabel")?evt.target.parentNode:evt.target;
if(node&&(node.dijitDateValue||node==this.previousYearLabelNode||node==this.nextYearLabelNode)){
dojo.addClass(node,"dijitCalendarHoveredDate");
this._currentNode=node;
}
},_onDayMouseOut:function(evt){
if(!this._currentNode){
return;
}
if(evt.relatedTarget&&evt.relatedTarget.parentNode==this._currentNode){
return;
}
var cls="dijitCalendarHoveredDate";
if(dojo.hasClass(this._currentNode,"dijitCalendarActiveDate")){
cls+=" dijitCalendarActiveDate";
}
dojo.removeClass(this._currentNode,cls);
this._currentNode=null;
},_onDayMouseDown:function(evt){
var node=evt.target.parentNode;
if(node&&node.dijitDateValue){
dojo.addClass(node,"dijitCalendarActiveDate");
this._currentNode=node;
}
},_onDayMouseUp:function(evt){
var node=evt.target.parentNode;
if(node&&node.dijitDateValue){
dojo.removeClass(node,"dijitCalendarActiveDate");
}
},handleKey:function(evt){
var dk=dojo.keys,_52d=-1,_52e,_52f=this.currentFocus;
switch(evt.keyCode){
case dk.RIGHT_ARROW:
_52d=1;
case dk.LEFT_ARROW:
_52e="day";
if(!this.isLeftToRight()){
_52d*=-1;
}
break;
case dk.DOWN_ARROW:
_52d=1;
case dk.UP_ARROW:
_52e="week";
break;
case dk.PAGE_DOWN:
_52d=1;
case dk.PAGE_UP:
_52e=evt.ctrlKey||evt.altKey?"year":"month";
break;
case dk.END:
_52f=this.dateFuncObj.add(_52f,"month",1);
_52e="day";
case dk.HOME:
_52f=new this.dateClassObj(_52f);
_52f.setDate(1);
break;
case dk.ENTER:
case dk.SPACE:
this.set("value",this.currentFocus);
break;
default:
return true;
}
if(_52e){
_52f=this.dateFuncObj.add(_52f,_52e,_52d);
}
this._setCurrentFocusAttr(_52f);
return false;
},_onKeyPress:function(evt){
if(!this.handleKey(evt)){
dojo.stopEvent(evt);
}
},onValueSelected:function(date){
},onChange:function(date){
},_isSelectedDate:function(_530,_531){
return this._isValidDate(this.value)&&!this.dateFuncObj.compare(_530,this.value,"date");
},isDisabledDate:function(_532,_533){
},getClassForDate:function(_534,_535){
}});
dojo.declare("dijit.Calendar._MonthDropDown",[dijit._Widget,dijit._Templated],{months:[],templateString:"<div class='dijitCalendarMonthMenu dijitMenu' "+"dojoAttachEvent='onclick:_onClick,onmouseover:_onMenuHover,onmouseout:_onMenuHover'></div>",_setMonthsAttr:function(_536){
this.domNode.innerHTML=dojo.map(_536,function(_537,idx){
return _537?"<div class='dijitCalendarMonthLabel' month='"+idx+"'>"+_537+"</div>":"";
}).join("");
},_onClick:function(evt){
this.onChange(dojo.attr(evt.target,"month"));
},onChange:function(_538){
},_onMenuHover:function(evt){
dojo.toggleClass(evt.target,"dijitCalendarMonthLabelHover",evt.type=="mouseover");
}});
}
if(!dojo._hasResource["dijit.form.DateTextBox"]){
dojo._hasResource["dijit.form.DateTextBox"]=true;
dojo.provide("dijit.form.DateTextBox");
dojo.declare("dijit.form.DateTextBox",dijit.form._DateTimeTextBox,{baseClass:"dijitTextBox dijitComboBox dijitDateTextBox",popupClass:"dijit.Calendar",_selector:"date",value:new Date("")});
}
if(!dojo._hasResource["dojo.number"]){
dojo._hasResource["dojo.number"]=true;
dojo.provide("dojo.number");
dojo.getObject("number",true,dojo);
dojo.number.format=function(_539,_53a){
_53a=dojo.mixin({},_53a||{});
var _53b=dojo.i18n.normalizeLocale(_53a.locale),_53c=dojo.i18n.getLocalization("dojo.cldr","number",_53b);
_53a.customs=_53c;
var _53d=_53a.pattern||_53c[(_53a.type||"decimal")+"Format"];
if(isNaN(_539)||Math.abs(_539)==Infinity){
return null;
}
return dojo.number._applyPattern(_539,_53d,_53a);
};
dojo.number._numberPatternRE=/[#0,]*[#0](?:\.0*#*)?/;
dojo.number._applyPattern=function(_53e,_53f,_540){
_540=_540||{};
var _541=_540.customs.group,_542=_540.customs.decimal,_543=_53f.split(";"),_544=_543[0];
_53f=_543[(_53e<0)?1:0]||("-"+_544);
if(_53f.indexOf("%")!=-1){
_53e*=100;
}else{
if(_53f.indexOf("‰")!=-1){
_53e*=1000;
}else{
if(_53f.indexOf("¤")!=-1){
_541=_540.customs.currencyGroup||_541;
_542=_540.customs.currencyDecimal||_542;
_53f=_53f.replace(/\u00a4{1,3}/,function(_545){
var prop=["symbol","currency","displayName"][_545.length-1];
return _540[prop]||_540.currency||"";
});
}else{
if(_53f.indexOf("E")!=-1){
throw new Error("exponential notation not supported");
}
}
}
}
var _546=dojo.number._numberPatternRE;
var _547=_544.match(_546);
if(!_547){
throw new Error("unable to find a number expression in pattern: "+_53f);
}
if(_540.fractional===false){
_540.places=0;
}
return _53f.replace(_546,dojo.number._formatAbsolute(_53e,_547[0],{decimal:_542,group:_541,places:_540.places,round:_540.round}));
};
dojo.number.round=function(_548,_549,_54a){
var _54b=10/(_54a||10);
return (_54b*+_548).toFixed(_549)/_54b;
};
if((0.9).toFixed()==0){
(function(){
var _54c=dojo.number.round;
dojo.number.round=function(v,p,m){
var d=Math.pow(10,-p||0),a=Math.abs(v);
if(!v||a>=d||a*Math.pow(10,p+1)<5){
d=0;
}
return _54c(v,p,m)+(v>0?d:-d);
};
})();
}
dojo.number._formatAbsolute=function(_54d,_54e,_54f){
_54f=_54f||{};
if(_54f.places===true){
_54f.places=0;
}
if(_54f.places===Infinity){
_54f.places=6;
}
var _550=_54e.split("."),_551=typeof _54f.places=="string"&&_54f.places.indexOf(","),_552=_54f.places;
if(_551){
_552=_54f.places.substring(_551+1);
}else{
if(!(_552>=0)){
_552=(_550[1]||[]).length;
}
}
if(!(_54f.round<0)){
_54d=dojo.number.round(_54d,_552,_54f.round);
}
var _553=String(Math.abs(_54d)).split("."),_554=_553[1]||"";
if(_550[1]||_54f.places){
if(_551){
_54f.places=_54f.places.substring(0,_551);
}
var pad=_54f.places!==undefined?_54f.places:(_550[1]&&_550[1].lastIndexOf("0")+1);
if(pad>_554.length){
_553[1]=dojo.string.pad(_554,pad,"0",true);
}
if(_552<_554.length){
_553[1]=_554.substr(0,_552);
}
}else{
if(_553[1]){
_553.pop();
}
}
var _555=_550[0].replace(",","");
pad=_555.indexOf("0");
if(pad!=-1){
pad=_555.length-pad;
if(pad>_553[0].length){
_553[0]=dojo.string.pad(_553[0],pad);
}
if(_555.indexOf("#")==-1){
_553[0]=_553[0].substr(_553[0].length-pad);
}
}
var _556=_550[0].lastIndexOf(","),_557,_558;
if(_556!=-1){
_557=_550[0].length-_556-1;
var _559=_550[0].substr(0,_556);
_556=_559.lastIndexOf(",");
if(_556!=-1){
_558=_559.length-_556-1;
}
}
var _55a=[];
for(var _55b=_553[0];_55b;){
var off=_55b.length-_557;
_55a.push((off>0)?_55b.substr(off):_55b);
_55b=(off>0)?_55b.slice(0,off):"";
if(_558){
_557=_558;
delete _558;
}
}
_553[0]=_55a.reverse().join(_54f.group||",");
return _553.join(_54f.decimal||".");
};
dojo.number.regexp=function(_55c){
return dojo.number._parseInfo(_55c).regexp;
};
dojo.number._parseInfo=function(_55d){
_55d=_55d||{};
var _55e=dojo.i18n.normalizeLocale(_55d.locale),_55f=dojo.i18n.getLocalization("dojo.cldr","number",_55e),_560=_55d.pattern||_55f[(_55d.type||"decimal")+"Format"],_561=_55f.group,_562=_55f.decimal,_563=1;
if(_560.indexOf("%")!=-1){
_563/=100;
}else{
if(_560.indexOf("‰")!=-1){
_563/=1000;
}else{
var _564=_560.indexOf("¤")!=-1;
if(_564){
_561=_55f.currencyGroup||_561;
_562=_55f.currencyDecimal||_562;
}
}
}
var _565=_560.split(";");
if(_565.length==1){
_565.push("-"+_565[0]);
}
var re=dojo.regexp.buildGroupRE(_565,function(_566){
_566="(?:"+dojo.regexp.escapeString(_566,".")+")";
return _566.replace(dojo.number._numberPatternRE,function(_567){
var _568={signed:false,separator:_55d.strict?_561:[_561,""],fractional:_55d.fractional,decimal:_562,exponent:false},_569=_567.split("."),_56a=_55d.places;
if(_569.length==1&&_563!=1){
_569[1]="###";
}
if(_569.length==1||_56a===0){
_568.fractional=false;
}else{
if(_56a===undefined){
_56a=_55d.pattern?_569[1].lastIndexOf("0")+1:Infinity;
}
if(_56a&&_55d.fractional==undefined){
_568.fractional=true;
}
if(!_55d.places&&(_56a<_569[1].length)){
_56a+=","+_569[1].length;
}
_568.places=_56a;
}
var _56b=_569[0].split(",");
if(_56b.length>1){
_568.groupSize=_56b.pop().length;
if(_56b.length>1){
_568.groupSize2=_56b.pop().length;
}
}
return "("+dojo.number._realNumberRegexp(_568)+")";
});
},true);
if(_564){
re=re.replace(/([\s\xa0]*)(\u00a4{1,3})([\s\xa0]*)/g,function(_56c,_56d,_56e,_56f){
var prop=["symbol","currency","displayName"][_56e.length-1],_570=dojo.regexp.escapeString(_55d[prop]||_55d.currency||"");
_56d=_56d?"[\\s\\xa0]":"";
_56f=_56f?"[\\s\\xa0]":"";
if(!_55d.strict){
if(_56d){
_56d+="*";
}
if(_56f){
_56f+="*";
}
return "(?:"+_56d+_570+_56f+")?";
}
return _56d+_570+_56f;
});
}
return {regexp:re.replace(/[\xa0 ]/g,"[\\s\\xa0]"),group:_561,decimal:_562,factor:_563};
};
dojo.number.parse=function(_571,_572){
var info=dojo.number._parseInfo(_572),_573=(new RegExp("^"+info.regexp+"$")).exec(_571);
if(!_573){
return NaN;
}
var _574=_573[1];
if(!_573[1]){
if(!_573[2]){
return NaN;
}
_574=_573[2];
info.factor*=-1;
}
_574=_574.replace(new RegExp("["+info.group+"\\s\\xa0"+"]","g"),"").replace(info.decimal,".");
return _574*info.factor;
};
dojo.number._realNumberRegexp=function(_575){
_575=_575||{};
if(!("places" in _575)){
_575.places=Infinity;
}
if(typeof _575.decimal!="string"){
_575.decimal=".";
}
if(!("fractional" in _575)||/^0/.test(_575.places)){
_575.fractional=[true,false];
}
if(!("exponent" in _575)){
_575.exponent=[true,false];
}
if(!("eSigned" in _575)){
_575.eSigned=[true,false];
}
var _576=dojo.number._integerRegexp(_575),_577=dojo.regexp.buildGroupRE(_575.fractional,function(q){
var re="";
if(q&&(_575.places!==0)){
re="\\"+_575.decimal;
if(_575.places==Infinity){
re="(?:"+re+"\\d+)?";
}else{
re+="\\d{"+_575.places+"}";
}
}
return re;
},true);
var _578=dojo.regexp.buildGroupRE(_575.exponent,function(q){
if(q){
return "([eE]"+dojo.number._integerRegexp({signed:_575.eSigned})+")";
}
return "";
});
var _579=_576+_577;
if(_577){
_579="(?:(?:"+_579+")|(?:"+_577+"))";
}
return _579+_578;
};
dojo.number._integerRegexp=function(_57a){
_57a=_57a||{};
if(!("signed" in _57a)){
_57a.signed=[true,false];
}
if(!("separator" in _57a)){
_57a.separator="";
}else{
if(!("groupSize" in _57a)){
_57a.groupSize=3;
}
}
var _57b=dojo.regexp.buildGroupRE(_57a.signed,function(q){
return q?"[-+]":"";
},true);
var _57c=dojo.regexp.buildGroupRE(_57a.separator,function(sep){
if(!sep){
return "(?:\\d+)";
}
sep=dojo.regexp.escapeString(sep);
if(sep==" "){
sep="\\s";
}else{
if(sep==" "){
sep="\\s\\xa0";
}
}
var grp=_57a.groupSize,grp2=_57a.groupSize2;
if(grp2){
var _57d="(?:0|[1-9]\\d{0,"+(grp2-1)+"}(?:["+sep+"]\\d{"+grp2+"})*["+sep+"]\\d{"+grp+"})";
return ((grp-grp2)>0)?"(?:"+_57d+"|(?:0|[1-9]\\d{0,"+(grp-1)+"}))":_57d;
}
return "(?:0|[1-9]\\d{0,"+(grp-1)+"}(?:["+sep+"]\\d{"+grp+"})*)";
},true);
return _57b+_57c;
};
}
if(!dojo._hasResource["dijit.ProgressBar"]){
dojo._hasResource["dijit.ProgressBar"]=true;
dojo.provide("dijit.ProgressBar");
dojo.declare("dijit.ProgressBar",[dijit._Widget,dijit._Templated],{progress:"0",value:"",maximum:100,places:0,indeterminate:false,label:"",name:"",templateString:dojo.cache("dijit","templates/ProgressBar.html","<div class=\"dijitProgressBar dijitProgressBarEmpty\" role=\"progressbar\"\r\n\t><div  dojoAttachPoint=\"internalProgress\" class=\"dijitProgressBarFull\"\r\n\t\t><div class=\"dijitProgressBarTile\" role=\"presentation\"></div\r\n\t\t><span style=\"visibility:hidden\">&nbsp;</span\r\n\t></div\r\n\t><div dojoAttachPoint=\"labelNode\" class=\"dijitProgressBarLabel\" id=\"${id}_label\"></div\r\n\t><img dojoAttachPoint=\"indeterminateHighContrastImage\" class=\"dijitProgressBarIndeterminateHighContrastImage\" alt=\"\"\r\n/></div>\r\n"),_indeterminateHighContrastImagePath:dojo.moduleUrl("dijit","themes/a11y/indeterminate_progress.gif"),postMixInProperties:function(){
this.inherited(arguments);
if(!("value" in this.params)){
this.value=this.indeterminate?Infinity:this.progress;
}
},buildRendering:function(){
this.inherited(arguments);
this.indeterminateHighContrastImage.setAttribute("src",this._indeterminateHighContrastImagePath.toString());
this.update();
},update:function(_57e){
dojo.mixin(this,_57e||{});
var tip=this.internalProgress,ap=this.domNode;
var _57f=1;
if(this.indeterminate){
dijit.removeWaiState(ap,"valuenow");
dijit.removeWaiState(ap,"valuemin");
dijit.removeWaiState(ap,"valuemax");
}else{
if(String(this.progress).indexOf("%")!=-1){
_57f=Math.min(parseFloat(this.progress)/100,1);
this.progress=_57f*this.maximum;
}else{
this.progress=Math.min(this.progress,this.maximum);
_57f=this.progress/this.maximum;
}
dijit.setWaiState(ap,"describedby",this.labelNode.id);
dijit.setWaiState(ap,"valuenow",this.progress);
dijit.setWaiState(ap,"valuemin",0);
dijit.setWaiState(ap,"valuemax",this.maximum);
}
this.labelNode.innerHTML=this.report(_57f);
dojo.toggleClass(this.domNode,"dijitProgressBarIndeterminate",this.indeterminate);
tip.style.width=(_57f*100)+"%";
this.onChange();
},_setValueAttr:function(v){
this._set("value",v);
if(v==Infinity){
this.update({indeterminate:true});
}else{
this.update({indeterminate:false,progress:v});
}
},_setLabelAttr:function(_580){
this._set("label",_580);
this.update();
},_setIndeterminateAttr:function(_581){
this.indeterminate=_581;
this.update();
},report:function(_582){
return this.label?this.label:(this.indeterminate?"&nbsp;":dojo.number.format(_582,{type:"percent",places:this.places,locale:this.lang}));
},onChange:function(){
}});
}
if(!dojo._hasResource["dojo.cookie"]){
dojo._hasResource["dojo.cookie"]=true;
dojo.provide("dojo.cookie");
dojo.cookie=function(name,_583,_584){
var c=document.cookie;
if(arguments.length==1){
var _585=c.match(new RegExp("(?:^|; )"+dojo.regexp.escapeString(name)+"=([^;]*)"));
return _585?decodeURIComponent(_585[1]):undefined;
}else{
_584=_584||{};
var exp=_584.expires;
if(typeof exp=="number"){
var d=new Date();
d.setTime(d.getTime()+exp*24*60*60*1000);
exp=_584.expires=d;
}
if(exp&&exp.toUTCString){
_584.expires=exp.toUTCString();
}
_583=encodeURIComponent(_583);
var _586=name+"="+_583,_587;
for(_587 in _584){
_586+="; "+_587;
var _588=_584[_587];
if(_588!==true){
_586+="="+_588;
}
}
document.cookie=_586;
}
};
dojo.cookie.isSupported=function(){
if(!("cookieEnabled" in navigator)){
this("__djCookieTest__","CookiesAllowed");
navigator.cookieEnabled=this("__djCookieTest__")=="CookiesAllowed";
if(navigator.cookieEnabled){
this("__djCookieTest__","",{expires:-1});
}
}
return navigator.cookieEnabled;
};
}
if(!dojo._hasResource["dijit.layout.BorderContainer"]){
dojo._hasResource["dijit.layout.BorderContainer"]=true;
dojo.provide("dijit.layout.BorderContainer");
dojo.declare("dijit.layout.BorderContainer",dijit.layout._LayoutWidget,{design:"headline",gutters:true,liveSplitters:true,persist:false,baseClass:"dijitBorderContainer",_splitterClass:"dijit.layout._Splitter",postMixInProperties:function(){
if(!this.gutters){
this.baseClass+="NoGutter";
}
this.inherited(arguments);
},startup:function(){
if(this._started){
return;
}
dojo.forEach(this.getChildren(),this._setupChild,this);
this.inherited(arguments);
},_setupChild:function(_589){
var _58a=_589.region;
if(_58a){
this.inherited(arguments);
dojo.addClass(_589.domNode,this.baseClass+"Pane");
var ltr=this.isLeftToRight();
if(_58a=="leading"){
_58a=ltr?"left":"right";
}
if(_58a=="trailing"){
_58a=ltr?"right":"left";
}
if(_58a!="center"&&(_589.splitter||this.gutters)&&!_589._splitterWidget){
var _58b=dojo.getObject(_589.splitter?this._splitterClass:"dijit.layout._Gutter");
var _58c=new _58b({id:_589.id+"_splitter",container:this,child:_589,region:_58a,live:this.liveSplitters});
_58c.isSplitter=true;
_589._splitterWidget=_58c;
dojo.place(_58c.domNode,_589.domNode,"after");
_58c.startup();
}
_589.region=_58a;
}
},layout:function(){
this._layoutChildren();
},addChild:function(_58d,_58e){
this.inherited(arguments);
if(this._started){
this.layout();
}
},removeChild:function(_58f){
var _590=_58f.region;
var _591=_58f._splitterWidget;
if(_591){
_591.destroy();
delete _58f._splitterWidget;
}
this.inherited(arguments);
if(this._started){
this._layoutChildren();
}
dojo.removeClass(_58f.domNode,this.baseClass+"Pane");
dojo.style(_58f.domNode,{top:"auto",bottom:"auto",left:"auto",right:"auto",position:"static"});
dojo.style(_58f.domNode,_590=="top"||_590=="bottom"?"width":"height","auto");
},getChildren:function(){
return dojo.filter(this.inherited(arguments),function(_592){
return !_592.isSplitter;
});
},getSplitter:function(_593){
return dojo.filter(this.getChildren(),function(_594){
return _594.region==_593;
})[0]._splitterWidget;
},resize:function(_595,_596){
if(!this.cs||!this.pe){
var node=this.domNode;
this.cs=dojo.getComputedStyle(node);
this.pe=dojo._getPadExtents(node,this.cs);
this.pe.r=dojo._toPixelValue(node,this.cs.paddingRight);
this.pe.b=dojo._toPixelValue(node,this.cs.paddingBottom);
dojo.style(node,"padding","0px");
}
this.inherited(arguments);
},_layoutChildren:function(_597,_598){
if(!this._borderBox||!this._borderBox.h){
return;
}
var _599=dojo.map(this.getChildren(),function(_59a,idx){
return {pane:_59a,weight:[_59a.region=="center"?Infinity:0,_59a.layoutPriority,(this.design=="sidebar"?1:-1)*(/top|bottom/.test(_59a.region)?1:-1),idx]};
},this);
_599.sort(function(a,b){
var aw=a.weight,bw=b.weight;
for(var i=0;i<aw.length;i++){
if(aw[i]!=bw[i]){
return aw[i]-bw[i];
}
}
return 0;
});
var _59b=[];
dojo.forEach(_599,function(_59c){
var pane=_59c.pane;
_59b.push(pane);
if(pane._splitterWidget){
_59b.push(pane._splitterWidget);
}
});
var dim={l:this.pe.l,t:this.pe.t,w:this._borderBox.w-this.pe.w,h:this._borderBox.h-this.pe.h};
dijit.layout.layoutChildren(this.domNode,dim,_59b,_597,_598);
},destroyRecursive:function(){
dojo.forEach(this.getChildren(),function(_59d){
var _59e=_59d._splitterWidget;
if(_59e){
_59e.destroy();
}
delete _59d._splitterWidget;
});
this.inherited(arguments);
}});
dojo.extend(dijit._Widget,{region:"",layoutPriority:0,splitter:false,minSize:0,maxSize:Infinity});
dojo.declare("dijit.layout._Splitter",[dijit._Widget,dijit._Templated],{live:true,templateString:"<div class=\"dijitSplitter\" dojoAttachEvent=\"onkeypress:_onKeyPress,onmousedown:_startDrag,onmouseenter:_onMouse,onmouseleave:_onMouse\" tabIndex=\"0\" role=\"separator\"><div class=\"dijitSplitterThumb\"></div></div>",postMixInProperties:function(){
this.inherited(arguments);
this.horizontal=/top|bottom/.test(this.region);
this._factor=/top|left/.test(this.region)?1:-1;
this._cookieName=this.container.id+"_"+this.region;
},buildRendering:function(){
this.inherited(arguments);
dojo.addClass(this.domNode,"dijitSplitter"+(this.horizontal?"H":"V"));
if(this.container.persist){
var _59f=dojo.cookie(this._cookieName);
if(_59f){
this.child.domNode.style[this.horizontal?"height":"width"]=_59f;
}
}
},_computeMaxSize:function(){
var dim=this.horizontal?"h":"w",_5a0=dojo.marginBox(this.child.domNode)[dim],_5a1=dojo.filter(this.container.getChildren(),function(_5a2){
return _5a2.region=="center";
})[0],_5a3=dojo.marginBox(_5a1.domNode)[dim];
return Math.min(this.child.maxSize,_5a0+_5a3);
},_startDrag:function(e){
if(!this.cover){
this.cover=dojo.doc.createElement("div");
dojo.addClass(this.cover,"dijitSplitterCover");
dojo.place(this.cover,this.child.domNode,"after");
}
dojo.addClass(this.cover,"dijitSplitterCoverActive");
if(this.fake){
dojo.destroy(this.fake);
}
if(!(this._resize=this.live)){
(this.fake=this.domNode.cloneNode(true)).removeAttribute("id");
dojo.addClass(this.domNode,"dijitSplitterShadow");
dojo.place(this.fake,this.domNode,"after");
}
dojo.addClass(this.domNode,"dijitSplitterActive dijitSplitter"+(this.horizontal?"H":"V")+"Active");
if(this.fake){
dojo.removeClass(this.fake,"dijitSplitterHover dijitSplitter"+(this.horizontal?"H":"V")+"Hover");
}
var _5a4=this._factor,_5a5=this.horizontal,axis=_5a5?"pageY":"pageX",_5a6=e[axis],_5a7=this.domNode.style,dim=_5a5?"h":"w",_5a8=dojo.marginBox(this.child.domNode)[dim],max=this._computeMaxSize(),min=this.child.minSize||20,_5a9=this.region,_5aa=_5a9=="top"||_5a9=="bottom"?"top":"left",_5ab=parseInt(_5a7[_5aa],10),_5ac=this._resize,_5ad=dojo.hitch(this.container,"_layoutChildren",this.child.id),de=dojo.doc;
this._handlers=(this._handlers||[]).concat([dojo.connect(de,"onmousemove",this._drag=function(e,_5ae){
var _5af=e[axis]-_5a6,_5b0=_5a4*_5af+_5a8,_5b1=Math.max(Math.min(_5b0,max),min);
if(_5ac||_5ae){
_5ad(_5b1);
}
_5a7[_5aa]=_5af+_5ab+_5a4*(_5b1-_5b0)+"px";
}),dojo.connect(de,"ondragstart",dojo.stopEvent),dojo.connect(dojo.body(),"onselectstart",dojo.stopEvent),dojo.connect(de,"onmouseup",this,"_stopDrag")]);
dojo.stopEvent(e);
},_onMouse:function(e){
var o=(e.type=="mouseover"||e.type=="mouseenter");
dojo.toggleClass(this.domNode,"dijitSplitterHover",o);
dojo.toggleClass(this.domNode,"dijitSplitter"+(this.horizontal?"H":"V")+"Hover",o);
},_stopDrag:function(e){
try{
if(this.cover){
dojo.removeClass(this.cover,"dijitSplitterCoverActive");
}
if(this.fake){
dojo.destroy(this.fake);
}
dojo.removeClass(this.domNode,"dijitSplitterActive dijitSplitter"+(this.horizontal?"H":"V")+"Active dijitSplitterShadow");
this._drag(e);
this._drag(e,true);
}
finally{
this._cleanupHandlers();
delete this._drag;
}
if(this.container.persist){
dojo.cookie(this._cookieName,this.child.domNode.style[this.horizontal?"height":"width"],{expires:365});
}
},_cleanupHandlers:function(){
dojo.forEach(this._handlers,dojo.disconnect);
delete this._handlers;
},_onKeyPress:function(e){
this._resize=true;
var _5b2=this.horizontal;
var tick=1;
var dk=dojo.keys;
switch(e.charOrCode){
case _5b2?dk.UP_ARROW:dk.LEFT_ARROW:
tick*=-1;
case _5b2?dk.DOWN_ARROW:dk.RIGHT_ARROW:
break;
default:
return;
}
var _5b3=dojo._getMarginSize(this.child.domNode)[_5b2?"h":"w"]+this._factor*tick;
this.container._layoutChildren(this.child.id,Math.max(Math.min(_5b3,this._computeMaxSize()),this.child.minSize));
dojo.stopEvent(e);
},destroy:function(){
this._cleanupHandlers();
delete this.child;
delete this.container;
delete this.cover;
delete this.fake;
this.inherited(arguments);
}});
dojo.declare("dijit.layout._Gutter",[dijit._Widget,dijit._Templated],{templateString:"<div class=\"dijitGutter\" role=\"presentation\"></div>",postMixInProperties:function(){
this.inherited(arguments);
this.horizontal=/top|bottom/.test(this.region);
},buildRendering:function(){
this.inherited(arguments);
dojo.addClass(this.domNode,"dijitGutter"+(this.horizontal?"H":"V"));
}});
}
if(!dojo._hasResource["dijit.layout.StackController"]){
dojo._hasResource["dijit.layout.StackController"]=true;
dojo.provide("dijit.layout.StackController");
dojo.declare("dijit.layout.StackController",[dijit._Widget,dijit._Templated,dijit._Container],{templateString:"<span role='tablist' dojoAttachEvent='onkeypress' class='dijitStackController'></span>",containerId:"",buttonWidget:"dijit.layout._StackButton",constructor:function(){
this.pane2button={};
this.pane2connects={};
this.pane2watches={};
},buildRendering:function(){
this.inherited(arguments);
dijit.setWaiRole(this.domNode,"tablist");
},postCreate:function(){
this.inherited(arguments);
this.subscribe(this.containerId+"-startup","onStartup");
this.subscribe(this.containerId+"-addChild","onAddChild");
this.subscribe(this.containerId+"-removeChild","onRemoveChild");
this.subscribe(this.containerId+"-selectChild","onSelectChild");
this.subscribe(this.containerId+"-containerKeyPress","onContainerKeyPress");
},onStartup:function(info){
dojo.forEach(info.children,this.onAddChild,this);
if(info.selected){
this.onSelectChild(info.selected);
}
},destroy:function(){
for(var pane in this.pane2button){
this.onRemoveChild(dijit.byId(pane));
}
this.inherited(arguments);
},onAddChild:function(page,_5b4){
var cls=dojo.getObject(this.buttonWidget);
var _5b5=new cls({id:this.id+"_"+page.id,label:page.title,dir:page.dir,lang:page.lang,showLabel:page.showTitle,iconClass:page.iconClass,closeButton:page.closable,title:page.tooltip});
dijit.setWaiState(_5b5.focusNode,"selected","false");
var _5b6=["title","showTitle","iconClass","closable","tooltip"],_5b7=["label","showLabel","iconClass","closeButton","title"];
this.pane2watches[page.id]=dojo.map(_5b6,function(_5b8,idx){
return page.watch(_5b8,function(name,_5b9,_5ba){
_5b5.set(_5b7[idx],_5ba);
});
});
this.pane2connects[page.id]=[this.connect(_5b5,"onClick",dojo.hitch(this,"onButtonClick",page)),this.connect(_5b5,"onClickCloseButton",dojo.hitch(this,"onCloseButtonClick",page))];
this.addChild(_5b5,_5b4);
this.pane2button[page.id]=_5b5;
page.controlButton=_5b5;
if(!this._currentChild){
_5b5.focusNode.setAttribute("tabIndex","0");
dijit.setWaiState(_5b5.focusNode,"selected","true");
this._currentChild=page;
}
if(!this.isLeftToRight()&&dojo.isIE&&this._rectifyRtlTabList){
this._rectifyRtlTabList();
}
},onRemoveChild:function(page){
if(this._currentChild===page){
this._currentChild=null;
}
dojo.forEach(this.pane2connects[page.id],dojo.hitch(this,"disconnect"));
delete this.pane2connects[page.id];
dojo.forEach(this.pane2watches[page.id],function(w){
w.unwatch();
});
delete this.pane2watches[page.id];
var _5bb=this.pane2button[page.id];
if(_5bb){
this.removeChild(_5bb);
delete this.pane2button[page.id];
_5bb.destroy();
}
delete page.controlButton;
},onSelectChild:function(page){
if(!page){
return;
}
if(this._currentChild){
var _5bc=this.pane2button[this._currentChild.id];
_5bc.set("checked",false);
dijit.setWaiState(_5bc.focusNode,"selected","false");
_5bc.focusNode.setAttribute("tabIndex","-1");
}
var _5bd=this.pane2button[page.id];
_5bd.set("checked",true);
dijit.setWaiState(_5bd.focusNode,"selected","true");
this._currentChild=page;
_5bd.focusNode.setAttribute("tabIndex","0");
var _5be=dijit.byId(this.containerId);
dijit.setWaiState(_5be.containerNode,"labelledby",_5bd.id);
},onButtonClick:function(page){
var _5bf=dijit.byId(this.containerId);
_5bf.selectChild(page);
},onCloseButtonClick:function(page){
var _5c0=dijit.byId(this.containerId);
_5c0.closeChild(page);
if(this._currentChild){
var b=this.pane2button[this._currentChild.id];
if(b){
dijit.focus(b.focusNode||b.domNode);
}
}
},adjacent:function(_5c1){
if(!this.isLeftToRight()&&(!this.tabPosition||/top|bottom/.test(this.tabPosition))){
_5c1=!_5c1;
}
var _5c2=this.getChildren();
var _5c3=dojo.indexOf(_5c2,this.pane2button[this._currentChild.id]);
var _5c4=_5c1?1:_5c2.length-1;
return _5c2[(_5c3+_5c4)%_5c2.length];
},onkeypress:function(e){
if(this.disabled||e.altKey){
return;
}
var _5c5=null;
if(e.ctrlKey||!e._djpage){
var k=dojo.keys;
switch(e.charOrCode){
case k.LEFT_ARROW:
case k.UP_ARROW:
if(!e._djpage){
_5c5=false;
}
break;
case k.PAGE_UP:
if(e.ctrlKey){
_5c5=false;
}
break;
case k.RIGHT_ARROW:
case k.DOWN_ARROW:
if(!e._djpage){
_5c5=true;
}
break;
case k.PAGE_DOWN:
if(e.ctrlKey){
_5c5=true;
}
break;
case k.HOME:
case k.END:
var _5c6=this.getChildren();
if(_5c6&&_5c6.length){
_5c6[e.charOrCode==k.HOME?0:_5c6.length-1].onClick();
}
dojo.stopEvent(e);
break;
case k.DELETE:
if(this._currentChild.closable){
this.onCloseButtonClick(this._currentChild);
}
dojo.stopEvent(e);
break;
default:
if(e.ctrlKey){
if(e.charOrCode===k.TAB){
this.adjacent(!e.shiftKey).onClick();
dojo.stopEvent(e);
}else{
if(e.charOrCode=="w"){
if(this._currentChild.closable){
this.onCloseButtonClick(this._currentChild);
}
dojo.stopEvent(e);
}
}
}
}
if(_5c5!==null){
this.adjacent(_5c5).onClick();
dojo.stopEvent(e);
}
}
},onContainerKeyPress:function(info){
info.e._djpage=info.page;
this.onkeypress(info.e);
}});
dojo.declare("dijit.layout._StackButton",dijit.form.ToggleButton,{tabIndex:"-1",buildRendering:function(evt){
this.inherited(arguments);
dijit.setWaiRole((this.focusNode||this.domNode),"tab");
},onClick:function(evt){
dijit.focus(this.focusNode);
},onClickCloseButton:function(evt){
evt.stopPropagation();
}});
}
if(!dojo._hasResource["dijit.layout.StackContainer"]){
dojo._hasResource["dijit.layout.StackContainer"]=true;
dojo.provide("dijit.layout.StackContainer");
dojo.declare("dijit.layout.StackContainer",dijit.layout._LayoutWidget,{doLayout:true,persist:false,baseClass:"dijitStackContainer",buildRendering:function(){
this.inherited(arguments);
dojo.addClass(this.domNode,"dijitLayoutContainer");
dijit.setWaiRole(this.containerNode,"tabpanel");
},postCreate:function(){
this.inherited(arguments);
this.connect(this.domNode,"onkeypress",this._onKeyPress);
},startup:function(){
if(this._started){
return;
}
var _5c7=this.getChildren();
dojo.forEach(_5c7,this._setupChild,this);
if(this.persist){
this.selectedChildWidget=dijit.byId(dojo.cookie(this.id+"_selectedChild"));
}else{
dojo.some(_5c7,function(_5c8){
if(_5c8.selected){
this.selectedChildWidget=_5c8;
}
return _5c8.selected;
},this);
}
var _5c9=this.selectedChildWidget;
if(!_5c9&&_5c7[0]){
_5c9=this.selectedChildWidget=_5c7[0];
_5c9.selected=true;
}
dojo.publish(this.id+"-startup",[{children:_5c7,selected:_5c9}]);
this.inherited(arguments);
},resize:function(){
var _5ca=this.selectedChildWidget;
if(_5ca&&!this._hasBeenShown){
this._hasBeenShown=true;
this._showChild(_5ca);
}
this.inherited(arguments);
},_setupChild:function(_5cb){
this.inherited(arguments);
dojo.replaceClass(_5cb.domNode,"dijitHidden","dijitVisible");
_5cb.domNode.title="";
},addChild:function(_5cc,_5cd){
this.inherited(arguments);
if(this._started){
dojo.publish(this.id+"-addChild",[_5cc,_5cd]);
this.layout();
if(!this.selectedChildWidget){
this.selectChild(_5cc);
}
}
},removeChild:function(page){
this.inherited(arguments);
if(this._started){
dojo.publish(this.id+"-removeChild",[page]);
}
if(this._beingDestroyed){
return;
}
if(this.selectedChildWidget===page){
this.selectedChildWidget=undefined;
if(this._started){
var _5ce=this.getChildren();
if(_5ce.length){
this.selectChild(_5ce[0]);
}
}
}
if(this._started){
this.layout();
}
},selectChild:function(page,_5cf){
page=dijit.byId(page);
if(this.selectedChildWidget!=page){
var d=this._transition(page,this.selectedChildWidget,_5cf);
this._set("selectedChildWidget",page);
dojo.publish(this.id+"-selectChild",[page]);
if(this.persist){
dojo.cookie(this.id+"_selectedChild",this.selectedChildWidget.id);
}
}
return d;
},_transition:function(_5d0,_5d1,_5d2){
if(_5d1){
this._hideChild(_5d1);
}
var d=this._showChild(_5d0);
if(_5d0.resize){
if(this.doLayout){
_5d0.resize(this._containerContentBox||this._contentBox);
}else{
_5d0.resize();
}
}
return d;
},_adjacent:function(_5d3){
var _5d4=this.getChildren();
var _5d5=dojo.indexOf(_5d4,this.selectedChildWidget);
_5d5+=_5d3?1:_5d4.length-1;
return _5d4[_5d5%_5d4.length];
},forward:function(){
return this.selectChild(this._adjacent(true),true);
},back:function(){
return this.selectChild(this._adjacent(false),true);
},_onKeyPress:function(e){
dojo.publish(this.id+"-containerKeyPress",[{e:e,page:this}]);
},layout:function(){
if(this.doLayout&&this.selectedChildWidget&&this.selectedChildWidget.resize){
this.selectedChildWidget.resize(this._containerContentBox||this._contentBox);
}
},_showChild:function(page){
var _5d6=this.getChildren();
page.isFirstChild=(page==_5d6[0]);
page.isLastChild=(page==_5d6[_5d6.length-1]);
page._set("selected",true);
dojo.replaceClass(page.domNode,"dijitVisible","dijitHidden");
return page._onShow()||true;
},_hideChild:function(page){
page._set("selected",false);
dojo.replaceClass(page.domNode,"dijitHidden","dijitVisible");
page.onHide();
},closeChild:function(page){
var _5d7=page.onClose(this,page);
if(_5d7){
this.removeChild(page);
page.destroyRecursive();
}
},destroyDescendants:function(_5d8){
dojo.forEach(this.getChildren(),function(_5d9){
this.removeChild(_5d9);
_5d9.destroyRecursive(_5d8);
},this);
}});
dojo.extend(dijit._Widget,{selected:false,closable:false,iconClass:"",showTitle:true});
}
if(!dojo._hasResource["dijit.layout.AccordionPane"]){
dojo._hasResource["dijit.layout.AccordionPane"]=true;
dojo.provide("dijit.layout.AccordionPane");
dojo.declare("dijit.layout.AccordionPane",dijit.layout.ContentPane,{constructor:function(){
dojo.deprecated("dijit.layout.AccordionPane deprecated, use ContentPane instead","","2.0");
},onSelected:function(){
}});
}
if(!dojo._hasResource["dijit.layout.AccordionContainer"]){
dojo._hasResource["dijit.layout.AccordionContainer"]=true;
dojo.provide("dijit.layout.AccordionContainer");
dojo.declare("dijit.layout.AccordionContainer",dijit.layout.StackContainer,{duration:dijit.defaultDuration,buttonWidget:"dijit.layout._AccordionButton",baseClass:"dijitAccordionContainer",buildRendering:function(){
this.inherited(arguments);
this.domNode.style.overflow="hidden";
dijit.setWaiRole(this.domNode,"tablist");
},startup:function(){
if(this._started){
return;
}
this.inherited(arguments);
if(this.selectedChildWidget){
var _5da=this.selectedChildWidget.containerNode.style;
_5da.display="";
_5da.overflow="auto";
this.selectedChildWidget._wrapperWidget.set("selected",true);
}
},layout:function(){
var _5db=this.selectedChildWidget;
if(!_5db){
return;
}
var _5dc=_5db._wrapperWidget.domNode,_5dd=dojo._getMarginExtents(_5dc),_5de=dojo._getPadBorderExtents(_5dc),_5df=_5db._wrapperWidget.containerNode,_5e0=dojo._getMarginExtents(_5df),_5e1=dojo._getPadBorderExtents(_5df),_5e2=this._contentBox;
var _5e3=0;
dojo.forEach(this.getChildren(),function(_5e4){
if(_5e4!=_5db){
_5e3+=dojo._getMarginSize(_5e4._wrapperWidget.domNode).h;
}
});
this._verticalSpace=_5e2.h-_5e3-_5dd.h-_5de.h-_5e0.h-_5e1.h-_5db._buttonWidget.getTitleHeight();
this._containerContentBox={h:this._verticalSpace,w:this._contentBox.w-_5dd.w-_5de.w-_5e0.w-_5e1.w};
if(_5db){
_5db.resize(this._containerContentBox);
}
},_setupChild:function(_5e5){
_5e5._wrapperWidget=new dijit.layout._AccordionInnerContainer({contentWidget:_5e5,buttonWidget:this.buttonWidget,id:_5e5.id+"_wrapper",dir:_5e5.dir,lang:_5e5.lang,parent:this});
this.inherited(arguments);
},addChild:function(_5e6,_5e7){
if(this._started){
dojo.place(_5e6.domNode,this.containerNode,_5e7);
if(!_5e6._started){
_5e6.startup();
}
this._setupChild(_5e6);
dojo.publish(this.id+"-addChild",[_5e6,_5e7]);
this.layout();
if(!this.selectedChildWidget){
this.selectChild(_5e6);
}
}else{
this.inherited(arguments);
}
},removeChild:function(_5e8){
if(_5e8._wrapperWidget){
dojo.place(_5e8.domNode,_5e8._wrapperWidget.domNode,"after");
_5e8._wrapperWidget.destroy();
delete _5e8._wrapperWidget;
}
dojo.removeClass(_5e8.domNode,"dijitHidden");
this.inherited(arguments);
},getChildren:function(){
return dojo.map(this.inherited(arguments),function(_5e9){
return _5e9.declaredClass=="dijit.layout._AccordionInnerContainer"?_5e9.contentWidget:_5e9;
},this);
},destroy:function(){
if(this._animation){
this._animation.stop();
}
dojo.forEach(this.getChildren(),function(_5ea){
if(_5ea._wrapperWidget){
_5ea._wrapperWidget.destroy();
}else{
_5ea.destroyRecursive();
}
});
this.inherited(arguments);
},_showChild:function(_5eb){
_5eb._wrapperWidget.containerNode.style.display="block";
return this.inherited(arguments);
},_hideChild:function(_5ec){
_5ec._wrapperWidget.containerNode.style.display="none";
this.inherited(arguments);
},_transition:function(_5ed,_5ee,_5ef){
if(dojo.isIE<8){
_5ef=false;
}
if(this._animation){
this._animation.stop(true);
delete this._animation;
}
var self=this;
if(_5ed){
_5ed._wrapperWidget.set("selected",true);
var d=this._showChild(_5ed);
if(this.doLayout&&_5ed.resize){
_5ed.resize(this._containerContentBox);
}
}
if(_5ee){
_5ee._wrapperWidget.set("selected",false);
if(!_5ef){
this._hideChild(_5ee);
}
}
if(_5ef){
var _5f0=_5ed._wrapperWidget.containerNode,_5f1=_5ee._wrapperWidget.containerNode;
var _5f2=_5ed._wrapperWidget.containerNode,_5f3=dojo._getMarginExtents(_5f2),_5f4=dojo._getPadBorderExtents(_5f2),_5f5=_5f3.h+_5f4.h;
_5f1.style.height=(self._verticalSpace-_5f5)+"px";
this._animation=new dojo.Animation({node:_5f0,duration:this.duration,curve:[1,this._verticalSpace-_5f5-1],onAnimate:function(_5f6){
_5f6=Math.floor(_5f6);
_5f0.style.height=_5f6+"px";
_5f1.style.height=(self._verticalSpace-_5f5-_5f6)+"px";
},onEnd:function(){
delete self._animation;
_5f0.style.height="auto";
_5ee._wrapperWidget.containerNode.style.display="none";
_5f1.style.height="auto";
self._hideChild(_5ee);
}});
this._animation.onStop=this._animation.onEnd;
this._animation.play();
}
return d;
},_onKeyPress:function(e,_5f7){
if(this.disabled||e.altKey||!(_5f7||e.ctrlKey)){
return;
}
var k=dojo.keys,c=e.charOrCode;
if((_5f7&&(c==k.LEFT_ARROW||c==k.UP_ARROW))||(e.ctrlKey&&c==k.PAGE_UP)){
this._adjacent(false)._buttonWidget._onTitleClick();
dojo.stopEvent(e);
}else{
if((_5f7&&(c==k.RIGHT_ARROW||c==k.DOWN_ARROW))||(e.ctrlKey&&(c==k.PAGE_DOWN||c==k.TAB))){
this._adjacent(true)._buttonWidget._onTitleClick();
dojo.stopEvent(e);
}
}
}});
dojo.declare("dijit.layout._AccordionInnerContainer",[dijit._Widget,dijit._CssStateMixin],{baseClass:"dijitAccordionInnerContainer",isContainer:true,isLayoutContainer:true,buildRendering:function(){
this.domNode=dojo.place("<div class='"+this.baseClass+"'>",this.contentWidget.domNode,"after");
var _5f8=this.contentWidget,cls=dojo.getObject(this.buttonWidget);
this.button=_5f8._buttonWidget=(new cls({contentWidget:_5f8,label:_5f8.title,title:_5f8.tooltip,dir:_5f8.dir,lang:_5f8.lang,iconClass:_5f8.iconClass,id:_5f8.id+"_button",parent:this.parent})).placeAt(this.domNode);
this.containerNode=dojo.place("<div class='dijitAccordionChildWrapper' style='display:none'>",this.domNode);
dojo.place(this.contentWidget.domNode,this.containerNode);
},postCreate:function(){
this.inherited(arguments);
var _5f9=this.button;
this._contentWidgetWatches=[this.contentWidget.watch("title",dojo.hitch(this,function(name,_5fa,_5fb){
_5f9.set("label",_5fb);
})),this.contentWidget.watch("tooltip",dojo.hitch(this,function(name,_5fc,_5fd){
_5f9.set("title",_5fd);
})),this.contentWidget.watch("iconClass",dojo.hitch(this,function(name,_5fe,_5ff){
_5f9.set("iconClass",_5ff);
}))];
},_setSelectedAttr:function(_600){
this._set("selected",_600);
this.button.set("selected",_600);
if(_600){
var cw=this.contentWidget;
if(cw.onSelected){
cw.onSelected();
}
}
},startup:function(){
this.contentWidget.startup();
},destroy:function(){
this.button.destroyRecursive();
dojo.forEach(this._contentWidgetWatches||[],function(w){
w.unwatch();
});
delete this.contentWidget._buttonWidget;
delete this.contentWidget._wrapperWidget;
this.inherited(arguments);
},destroyDescendants:function(){
this.contentWidget.destroyRecursive();
}});
dojo.declare("dijit.layout._AccordionButton",[dijit._Widget,dijit._Templated,dijit._CssStateMixin],{templateString:dojo.cache("dijit.layout","templates/AccordionButton.html","<div dojoAttachEvent='onclick:_onTitleClick' class='dijitAccordionTitle'>\r\n\t<div dojoAttachPoint='titleNode,focusNode' dojoAttachEvent='onkeypress:_onTitleKeyPress'\r\n\t\t\tclass='dijitAccordionTitleFocus' role=\"tab\" aria-expanded=\"false\"\r\n\t\t><span class='dijitInline dijitAccordionArrow' role=\"presentation\"></span\r\n\t\t><span class='arrowTextUp' role=\"presentation\">+</span\r\n\t\t><span class='arrowTextDown' role=\"presentation\">-</span\r\n\t\t><img src=\"${_blankGif}\" alt=\"\" class=\"dijitIcon\" dojoAttachPoint='iconNode' style=\"vertical-align: middle\" role=\"presentation\"/>\r\n\t\t<span role=\"presentation\" dojoAttachPoint='titleTextNode' class='dijitAccordionText'></span>\r\n\t</div>\r\n</div>\r\n"),attributeMap:dojo.mixin(dojo.clone(dijit.layout.ContentPane.prototype.attributeMap),{label:{node:"titleTextNode",type:"innerHTML"},title:{node:"titleTextNode",type:"attribute",attribute:"title"},iconClass:{node:"iconNode",type:"class"}}),baseClass:"dijitAccordionTitle",getParent:function(){
return this.parent;
},buildRendering:function(){
this.inherited(arguments);
var _601=this.id.replace(" ","_");
dojo.attr(this.titleTextNode,"id",_601+"_title");
dijit.setWaiState(this.focusNode,"labelledby",dojo.attr(this.titleTextNode,"id"));
dojo.setSelectable(this.domNode,false);
},getTitleHeight:function(){
return dojo._getMarginSize(this.domNode).h;
},_onTitleClick:function(){
var _602=this.getParent();
_602.selectChild(this.contentWidget,true);
dijit.focus(this.focusNode);
},_onTitleKeyPress:function(evt){
return this.getParent()._onKeyPress(evt,this.contentWidget);
},_setSelectedAttr:function(_603){
this._set("selected",_603);
dijit.setWaiState(this.focusNode,"expanded",_603);
dijit.setWaiState(this.focusNode,"selected",_603);
this.focusNode.setAttribute("tabIndex",_603?"0":"-1");
}});
}
if(!dojo._hasResource["dijit.layout._TabContainerBase"]){
dojo._hasResource["dijit.layout._TabContainerBase"]=true;
dojo.provide("dijit.layout._TabContainerBase");
dojo.declare("dijit.layout._TabContainerBase",[dijit.layout.StackContainer,dijit._Templated],{tabPosition:"top",baseClass:"dijitTabContainer",tabStrip:false,nested:false,templateString:dojo.cache("dijit.layout","templates/TabContainer.html","<div class=\"dijitTabContainer\">\r\n\t<div class=\"dijitTabListWrapper\" dojoAttachPoint=\"tablistNode\"></div>\r\n\t<div dojoAttachPoint=\"tablistSpacer\" class=\"dijitTabSpacer ${baseClass}-spacer\"></div>\r\n\t<div class=\"dijitTabPaneWrapper ${baseClass}-container\" dojoAttachPoint=\"containerNode\"></div>\r\n</div>\r\n"),postMixInProperties:function(){
this.baseClass+=this.tabPosition.charAt(0).toUpperCase()+this.tabPosition.substr(1).replace(/-.*/,"");
this.srcNodeRef&&dojo.style(this.srcNodeRef,"visibility","hidden");
this.inherited(arguments);
},buildRendering:function(){
this.inherited(arguments);
this.tablist=this._makeController(this.tablistNode);
if(!this.doLayout){
dojo.addClass(this.domNode,"dijitTabContainerNoLayout");
}
if(this.nested){
dojo.addClass(this.domNode,"dijitTabContainerNested");
dojo.addClass(this.tablist.containerNode,"dijitTabContainerTabListNested");
dojo.addClass(this.tablistSpacer,"dijitTabContainerSpacerNested");
dojo.addClass(this.containerNode,"dijitTabPaneWrapperNested");
}else{
dojo.addClass(this.domNode,"tabStrip-"+(this.tabStrip?"enabled":"disabled"));
}
},_setupChild:function(tab){
dojo.addClass(tab.domNode,"dijitTabPane");
this.inherited(arguments);
},startup:function(){
if(this._started){
return;
}
this.tablist.startup();
this.inherited(arguments);
},layout:function(){
if(!this._contentBox||typeof (this._contentBox.l)=="undefined"){
return;
}
var sc=this.selectedChildWidget;
if(this.doLayout){
var _604=this.tabPosition.replace(/-h/,"");
this.tablist.layoutAlign=_604;
var _605=[this.tablist,{domNode:this.tablistSpacer,layoutAlign:_604},{domNode:this.containerNode,layoutAlign:"client"}];
dijit.layout.layoutChildren(this.domNode,this._contentBox,_605);
this._containerContentBox=dijit.layout.marginBox2contentBox(this.containerNode,_605[2]);
if(sc&&sc.resize){
sc.resize(this._containerContentBox);
}
}else{
if(this.tablist.resize){
var s=this.tablist.domNode.style;
s.width="0";
var _606=dojo.contentBox(this.domNode).w;
s.width="";
this.tablist.resize({w:_606});
}
if(sc&&sc.resize){
sc.resize();
}
}
},destroy:function(){
if(this.tablist){
this.tablist.destroy();
}
this.inherited(arguments);
}});
}
if(!dojo._hasResource["dijit._KeyNavContainer"]){
dojo._hasResource["dijit._KeyNavContainer"]=true;
dojo.provide("dijit._KeyNavContainer");
dojo.declare("dijit._KeyNavContainer",dijit._Container,{tabIndex:"0",_keyNavCodes:{},connectKeyNavHandlers:function(_607,_608){
var _609=(this._keyNavCodes={});
var prev=dojo.hitch(this,this.focusPrev);
var next=dojo.hitch(this,this.focusNext);
dojo.forEach(_607,function(code){
_609[code]=prev;
});
dojo.forEach(_608,function(code){
_609[code]=next;
});
_609[dojo.keys.HOME]=dojo.hitch(this,"focusFirstChild");
_609[dojo.keys.END]=dojo.hitch(this,"focusLastChild");
this.connect(this.domNode,"onkeypress","_onContainerKeypress");
this.connect(this.domNode,"onfocus","_onContainerFocus");
},startupKeyNavChildren:function(){
dojo.forEach(this.getChildren(),dojo.hitch(this,"_startupChild"));
},addChild:function(_60a,_60b){
dijit._KeyNavContainer.superclass.addChild.apply(this,arguments);
this._startupChild(_60a);
},focus:function(){
this.focusFirstChild();
},focusFirstChild:function(){
var _60c=this._getFirstFocusableChild();
if(_60c){
this.focusChild(_60c);
}
},focusLastChild:function(){
var _60d=this._getLastFocusableChild();
if(_60d){
this.focusChild(_60d);
}
},focusNext:function(){
var _60e=this._getNextFocusableChild(this.focusedChild,1);
this.focusChild(_60e);
},focusPrev:function(){
var _60f=this._getNextFocusableChild(this.focusedChild,-1);
this.focusChild(_60f,true);
},focusChild:function(_610,last){
if(this.focusedChild&&_610!==this.focusedChild){
this._onChildBlur(this.focusedChild);
}
_610.focus(last?"end":"start");
this._set("focusedChild",_610);
},_startupChild:function(_611){
_611.set("tabIndex","-1");
this.connect(_611,"_onFocus",function(){
_611.set("tabIndex",this.tabIndex);
});
this.connect(_611,"_onBlur",function(){
_611.set("tabIndex","-1");
});
},_onContainerFocus:function(evt){
if(evt.target!==this.domNode){
return;
}
this.focusFirstChild();
dojo.attr(this.domNode,"tabIndex","-1");
},_onBlur:function(evt){
if(this.tabIndex){
dojo.attr(this.domNode,"tabIndex",this.tabIndex);
}
this.inherited(arguments);
},_onContainerKeypress:function(evt){
if(evt.ctrlKey||evt.altKey){
return;
}
var func=this._keyNavCodes[evt.charOrCode];
if(func){
func();
dojo.stopEvent(evt);
}
},_onChildBlur:function(_612){
},_getFirstFocusableChild:function(){
return this._getNextFocusableChild(null,1);
},_getLastFocusableChild:function(){
return this._getNextFocusableChild(null,-1);
},_getNextFocusableChild:function(_613,dir){
if(_613){
_613=this._getSiblingOfChild(_613,dir);
}
var _614=this.getChildren();
for(var i=0;i<_614.length;i++){
if(!_613){
_613=_614[(dir>0)?0:(_614.length-1)];
}
if(_613.isFocusable()){
return _613;
}
_613=this._getSiblingOfChild(_613,dir);
}
return null;
}});
}
if(!dojo._hasResource["dijit.MenuItem"]){
dojo._hasResource["dijit.MenuItem"]=true;
dojo.provide("dijit.MenuItem");
dojo.declare("dijit.MenuItem",[dijit._Widget,dijit._Templated,dijit._Contained,dijit._CssStateMixin],{templateString:dojo.cache("dijit","templates/MenuItem.html","<tr class=\"dijitReset dijitMenuItem\" dojoAttachPoint=\"focusNode\" role=\"menuitem\" tabIndex=\"-1\"\r\n\t\tdojoAttachEvent=\"onmouseenter:_onHover,onmouseleave:_onUnhover,ondijitclick:_onClick\">\r\n\t<td class=\"dijitReset dijitMenuItemIconCell\" role=\"presentation\">\r\n\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitIcon dijitMenuItemIcon\" dojoAttachPoint=\"iconNode\"/>\r\n\t</td>\r\n\t<td class=\"dijitReset dijitMenuItemLabel\" colspan=\"2\" dojoAttachPoint=\"containerNode\"></td>\r\n\t<td class=\"dijitReset dijitMenuItemAccelKey\" style=\"display: none\" dojoAttachPoint=\"accelKeyNode\"></td>\r\n\t<td class=\"dijitReset dijitMenuArrowCell\" role=\"presentation\">\r\n\t\t<div dojoAttachPoint=\"arrowWrapper\" style=\"visibility: hidden\">\r\n\t\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitMenuExpand\"/>\r\n\t\t\t<span class=\"dijitMenuExpandA11y\">+</span>\r\n\t\t</div>\r\n\t</td>\r\n</tr>\r\n"),attributeMap:dojo.delegate(dijit._Widget.prototype.attributeMap,{label:{node:"containerNode",type:"innerHTML"},iconClass:{node:"iconNode",type:"class"}}),baseClass:"dijitMenuItem",label:"",iconClass:"",accelKey:"",disabled:false,_fillContent:function(_615){
if(_615&&!("label" in this.params)){
this.set("label",_615.innerHTML);
}
},buildRendering:function(){
this.inherited(arguments);
var _616=this.id+"_text";
dojo.attr(this.containerNode,"id",_616);
if(this.accelKeyNode){
dojo.attr(this.accelKeyNode,"id",this.id+"_accel");
_616+=" "+this.id+"_accel";
}
dijit.setWaiState(this.domNode,"labelledby",_616);
dojo.setSelectable(this.domNode,false);
},_onHover:function(){
this.getParent().onItemHover(this);
},_onUnhover:function(){
this.getParent().onItemUnhover(this);
this._set("hovering",false);
},_onClick:function(evt){
this.getParent().onItemClick(this,evt);
dojo.stopEvent(evt);
},onClick:function(evt){
},focus:function(){
try{
if(dojo.isIE==8){
this.containerNode.focus();
}
dijit.focus(this.focusNode);
}
catch(e){
}
},_onFocus:function(){
this._setSelected(true);
this.getParent()._onItemFocus(this);
this.inherited(arguments);
},_setSelected:function(_617){
dojo.toggleClass(this.domNode,"dijitMenuItemSelected",_617);
},setLabel:function(_618){
dojo.deprecated("dijit.MenuItem.setLabel() is deprecated.  Use set('label', ...) instead.","","2.0");
this.set("label",_618);
},setDisabled:function(_619){
dojo.deprecated("dijit.Menu.setDisabled() is deprecated.  Use set('disabled', bool) instead.","","2.0");
this.set("disabled",_619);
},_setDisabledAttr:function(_61a){
dijit.setWaiState(this.focusNode,"disabled",_61a?"true":"false");
this._set("disabled",_61a);
},_setAccelKeyAttr:function(_61b){
this.accelKeyNode.style.display=_61b?"":"none";
this.accelKeyNode.innerHTML=_61b;
dojo.attr(this.containerNode,"colSpan",_61b?"1":"2");
this._set("accelKey",_61b);
}});
}
if(!dojo._hasResource["dijit.PopupMenuItem"]){
dojo._hasResource["dijit.PopupMenuItem"]=true;
dojo.provide("dijit.PopupMenuItem");
dojo.declare("dijit.PopupMenuItem",dijit.MenuItem,{_fillContent:function(){
if(this.srcNodeRef){
var _61c=dojo.query("*",this.srcNodeRef);
dijit.PopupMenuItem.superclass._fillContent.call(this,_61c[0]);
this.dropDownContainer=this.srcNodeRef;
}
},startup:function(){
if(this._started){
return;
}
this.inherited(arguments);
if(!this.popup){
var node=dojo.query("[widgetId]",this.dropDownContainer)[0];
this.popup=dijit.byNode(node);
}
dojo.body().appendChild(this.popup.domNode);
this.popup.startup();
this.popup.domNode.style.display="none";
if(this.arrowWrapper){
dojo.style(this.arrowWrapper,"visibility","");
}
dijit.setWaiState(this.focusNode,"haspopup","true");
},destroyDescendants:function(){
if(this.popup){
if(!this.popup._destroyed){
this.popup.destroyRecursive();
}
delete this.popup;
}
this.inherited(arguments);
}});
}
if(!dojo._hasResource["dijit.CheckedMenuItem"]){
dojo._hasResource["dijit.CheckedMenuItem"]=true;
dojo.provide("dijit.CheckedMenuItem");
dojo.declare("dijit.CheckedMenuItem",dijit.MenuItem,{templateString:dojo.cache("dijit","templates/CheckedMenuItem.html","<tr class=\"dijitReset dijitMenuItem\" dojoAttachPoint=\"focusNode\" role=\"menuitemcheckbox\" tabIndex=\"-1\"\r\n\t\tdojoAttachEvent=\"onmouseenter:_onHover,onmouseleave:_onUnhover,ondijitclick:_onClick\">\r\n\t<td class=\"dijitReset dijitMenuItemIconCell\" role=\"presentation\">\r\n\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitMenuItemIcon dijitCheckedMenuItemIcon\" dojoAttachPoint=\"iconNode\"/>\r\n\t\t<span class=\"dijitCheckedMenuItemIconChar\">&#10003;</span>\r\n\t</td>\r\n\t<td class=\"dijitReset dijitMenuItemLabel\" colspan=\"2\" dojoAttachPoint=\"containerNode,labelNode\"></td>\r\n\t<td class=\"dijitReset dijitMenuItemAccelKey\" style=\"display: none\" dojoAttachPoint=\"accelKeyNode\"></td>\r\n\t<td class=\"dijitReset dijitMenuArrowCell\" role=\"presentation\">&nbsp;</td>\r\n</tr>\r\n"),checked:false,_setCheckedAttr:function(_61d){
dojo.toggleClass(this.domNode,"dijitCheckedMenuItemChecked",_61d);
dijit.setWaiState(this.domNode,"checked",_61d);
this._set("checked",_61d);
},onChange:function(_61e){
},_onClick:function(e){
if(!this.disabled){
this.set("checked",!this.checked);
this.onChange(this.checked);
}
this.inherited(arguments);
}});
}
if(!dojo._hasResource["dijit.MenuSeparator"]){
dojo._hasResource["dijit.MenuSeparator"]=true;
dojo.provide("dijit.MenuSeparator");
dojo.declare("dijit.MenuSeparator",[dijit._Widget,dijit._Templated,dijit._Contained],{templateString:dojo.cache("dijit","templates/MenuSeparator.html","<tr class=\"dijitMenuSeparator\">\r\n\t<td class=\"dijitMenuSeparatorIconCell\">\r\n\t\t<div class=\"dijitMenuSeparatorTop\"></div>\r\n\t\t<div class=\"dijitMenuSeparatorBottom\"></div>\r\n\t</td>\r\n\t<td colspan=\"3\" class=\"dijitMenuSeparatorLabelCell\">\r\n\t\t<div class=\"dijitMenuSeparatorTop dijitMenuSeparatorLabel\"></div>\r\n\t\t<div class=\"dijitMenuSeparatorBottom\"></div>\r\n\t</td>\r\n</tr>\r\n"),buildRendering:function(){
this.inherited(arguments);
dojo.setSelectable(this.domNode,false);
},isFocusable:function(){
return false;
}});
}
if(!dojo._hasResource["dijit.Menu"]){
dojo._hasResource["dijit.Menu"]=true;
dojo.provide("dijit.Menu");
dojo.declare("dijit._MenuBase",[dijit._Widget,dijit._Templated,dijit._KeyNavContainer],{parentMenu:null,popupDelay:500,startup:function(){
if(this._started){
return;
}
dojo.forEach(this.getChildren(),function(_61f){
_61f.startup();
});
this.startupKeyNavChildren();
this.inherited(arguments);
},onExecute:function(){
},onCancel:function(_620){
},_moveToPopup:function(evt){
if(this.focusedChild&&this.focusedChild.popup&&!this.focusedChild.disabled){
this.focusedChild._onClick(evt);
}else{
var _621=this._getTopMenu();
if(_621&&_621._isMenuBar){
_621.focusNext();
}
}
},_onPopupHover:function(evt){
if(this.currentPopup&&this.currentPopup._pendingClose_timer){
var _622=this.currentPopup.parentMenu;
if(_622.focusedChild){
_622.focusedChild._setSelected(false);
}
_622.focusedChild=this.currentPopup.from_item;
_622.focusedChild._setSelected(true);
this._stopPendingCloseTimer(this.currentPopup);
}
},onItemHover:function(item){
if(this.isActive){
this.focusChild(item);
if(this.focusedChild.popup&&!this.focusedChild.disabled&&!this.hover_timer){
this.hover_timer=setTimeout(dojo.hitch(this,"_openPopup"),this.popupDelay);
}
}
if(this.focusedChild){
this.focusChild(item);
}
this._hoveredChild=item;
},_onChildBlur:function(item){
this._stopPopupTimer();
item._setSelected(false);
var _623=item.popup;
if(_623){
this._stopPendingCloseTimer(_623);
_623._pendingClose_timer=setTimeout(function(){
_623._pendingClose_timer=null;
if(_623.parentMenu){
_623.parentMenu.currentPopup=null;
}
dijit.popup.close(_623);
},this.popupDelay);
}
},onItemUnhover:function(item){
if(this.isActive){
this._stopPopupTimer();
}
if(this._hoveredChild==item){
this._hoveredChild=null;
}
},_stopPopupTimer:function(){
if(this.hover_timer){
clearTimeout(this.hover_timer);
this.hover_timer=null;
}
},_stopPendingCloseTimer:function(_624){
if(_624._pendingClose_timer){
clearTimeout(_624._pendingClose_timer);
_624._pendingClose_timer=null;
}
},_stopFocusTimer:function(){
if(this._focus_timer){
clearTimeout(this._focus_timer);
this._focus_timer=null;
}
},_getTopMenu:function(){
for(var top=this;top.parentMenu;top=top.parentMenu){
}
return top;
},onItemClick:function(item,evt){
if(typeof this.isShowingNow=="undefined"){
this._markActive();
}
this.focusChild(item);
if(item.disabled){
return false;
}
if(item.popup){
this._openPopup();
}else{
this.onExecute();
item.onClick(evt);
}
},_openPopup:function(){
this._stopPopupTimer();
var _625=this.focusedChild;
if(!_625){
return;
}
var _626=_625.popup;
if(_626.isShowingNow){
return;
}
if(this.currentPopup){
this._stopPendingCloseTimer(this.currentPopup);
dijit.popup.close(this.currentPopup);
}
_626.parentMenu=this;
_626.from_item=_625;
var self=this;
dijit.popup.open({parent:this,popup:_626,around:_625.domNode,orient:this._orient||(this.isLeftToRight()?{"TR":"TL","TL":"TR","BR":"BL","BL":"BR"}:{"TL":"TR","TR":"TL","BL":"BR","BR":"BL"}),onCancel:function(){
self.focusChild(_625);
self._cleanUp();
_625._setSelected(true);
self.focusedChild=_625;
},onExecute:dojo.hitch(this,"_cleanUp")});
this.currentPopup=_626;
_626.connect(_626.domNode,"onmouseenter",dojo.hitch(self,"_onPopupHover"));
if(_626.focus){
_626._focus_timer=setTimeout(dojo.hitch(_626,function(){
this._focus_timer=null;
this.focus();
}),0);
}
},_markActive:function(){
this.isActive=true;
dojo.replaceClass(this.domNode,"dijitMenuActive","dijitMenuPassive");
},onOpen:function(e){
this.isShowingNow=true;
this._markActive();
},_markInactive:function(){
this.isActive=false;
dojo.replaceClass(this.domNode,"dijitMenuPassive","dijitMenuActive");
},onClose:function(){
this._stopFocusTimer();
this._markInactive();
this.isShowingNow=false;
this.parentMenu=null;
},_closeChild:function(){
this._stopPopupTimer();
var _627=this.focusedChild&&this.focusedChild.from_item;
if(this.currentPopup){
if(dijit._curFocus&&dojo.isDescendant(dijit._curFocus,this.currentPopup.domNode)){
this.focusedChild.focusNode.focus();
}
dijit.popup.close(this.currentPopup);
this.currentPopup=null;
}
if(this.focusedChild){
this.focusedChild._setSelected(false);
this.focusedChild._onUnhover();
this.focusedChild=null;
}
},_onItemFocus:function(item){
if(this._hoveredChild&&this._hoveredChild!=item){
this._hoveredChild._onUnhover();
}
},_onBlur:function(){
this._cleanUp();
this.inherited(arguments);
},_cleanUp:function(){
this._closeChild();
if(typeof this.isShowingNow=="undefined"){
this._markInactive();
}
}});
dojo.declare("dijit.Menu",dijit._MenuBase,{constructor:function(){
this._bindings=[];
},templateString:dojo.cache("dijit","templates/Menu.html","<table class=\"dijit dijitMenu dijitMenuPassive dijitReset dijitMenuTable\" role=\"menu\" tabIndex=\"${tabIndex}\" dojoAttachEvent=\"onkeypress:_onKeyPress\" cellspacing=\"0\">\r\n\t<tbody class=\"dijitReset\" dojoAttachPoint=\"containerNode\"></tbody>\r\n</table>\r\n"),baseClass:"dijitMenu",targetNodeIds:[],contextMenuForWindow:false,leftClickToOpen:false,refocus:true,postCreate:function(){
if(this.contextMenuForWindow){
this.bindDomNode(dojo.body());
}else{
dojo.forEach(this.targetNodeIds,this.bindDomNode,this);
}
var k=dojo.keys,l=this.isLeftToRight();
this._openSubMenuKey=l?k.RIGHT_ARROW:k.LEFT_ARROW;
this._closeSubMenuKey=l?k.LEFT_ARROW:k.RIGHT_ARROW;
this.connectKeyNavHandlers([k.UP_ARROW],[k.DOWN_ARROW]);
},_onKeyPress:function(evt){
if(evt.ctrlKey||evt.altKey){
return;
}
switch(evt.charOrCode){
case this._openSubMenuKey:
this._moveToPopup(evt);
dojo.stopEvent(evt);
break;
case this._closeSubMenuKey:
if(this.parentMenu){
if(this.parentMenu._isMenuBar){
this.parentMenu.focusPrev();
}else{
this.onCancel(false);
}
}else{
dojo.stopEvent(evt);
}
break;
}
},_iframeContentWindow:function(_628){
var win=dojo.window.get(this._iframeContentDocument(_628))||this._iframeContentDocument(_628)["__parent__"]||(_628.name&&dojo.doc.frames[_628.name])||null;
return win;
},_iframeContentDocument:function(_629){
var doc=_629.contentDocument||(_629.contentWindow&&_629.contentWindow.document)||(_629.name&&dojo.doc.frames[_629.name]&&dojo.doc.frames[_629.name].document)||null;
return doc;
},bindDomNode:function(node){
node=dojo.byId(node);
var cn;
if(node.tagName.toLowerCase()=="iframe"){
var _62a=node,win=this._iframeContentWindow(_62a);
cn=dojo.withGlobal(win,dojo.body);
}else{
cn=(node==dojo.body()?dojo.doc.documentElement:node);
}
var _62b={node:node,iframe:_62a};
dojo.attr(node,"_dijitMenu"+this.id,this._bindings.push(_62b));
var _62c=dojo.hitch(this,function(cn){
return [dojo.connect(cn,this.leftClickToOpen?"onclick":"oncontextmenu",this,function(evt){
dojo.stopEvent(evt);
this._scheduleOpen(evt.target,_62a,{x:evt.pageX,y:evt.pageY});
}),dojo.connect(cn,"onkeydown",this,function(evt){
if(evt.shiftKey&&evt.keyCode==dojo.keys.F10){
dojo.stopEvent(evt);
this._scheduleOpen(evt.target,_62a);
}
})];
});
_62b.connects=cn?_62c(cn):[];
if(_62a){
_62b.onloadHandler=dojo.hitch(this,function(){
var win=this._iframeContentWindow(_62a);
cn=dojo.withGlobal(win,dojo.body);
_62b.connects=_62c(cn);
});
if(_62a.addEventListener){
_62a.addEventListener("load",_62b.onloadHandler,false);
}else{
_62a.attachEvent("onload",_62b.onloadHandler);
}
}
},unBindDomNode:function(_62d){
var node;
try{
node=dojo.byId(_62d);
}
catch(e){
return;
}
var _62e="_dijitMenu"+this.id;
if(node&&dojo.hasAttr(node,_62e)){
var bid=dojo.attr(node,_62e)-1,b=this._bindings[bid];
dojo.forEach(b.connects,dojo.disconnect);
var _62f=b.iframe;
if(_62f){
if(_62f.removeEventListener){
_62f.removeEventListener("load",b.onloadHandler,false);
}else{
_62f.detachEvent("onload",b.onloadHandler);
}
}
dojo.removeAttr(node,_62e);
delete this._bindings[bid];
}
},_scheduleOpen:function(_630,_631,_632){
if(!this._openTimer){
this._openTimer=setTimeout(dojo.hitch(this,function(){
delete this._openTimer;
this._openMyself({target:_630,iframe:_631,coords:_632});
}),1);
}
},_openMyself:function(args){
var _633=args.target,_634=args.iframe,_635=args.coords;
if(_635){
if(_634){
var od=_633.ownerDocument,ifc=dojo.position(_634,true),win=this._iframeContentWindow(_634),_636=dojo.withGlobal(win,"_docScroll",dojo);
var cs=dojo.getComputedStyle(_634),tp=dojo._toPixelValue,left=(dojo.isIE&&dojo.isQuirks?0:tp(_634,cs.paddingLeft))+(dojo.isIE&&dojo.isQuirks?tp(_634,cs.borderLeftWidth):0),top=(dojo.isIE&&dojo.isQuirks?0:tp(_634,cs.paddingTop))+(dojo.isIE&&dojo.isQuirks?tp(_634,cs.borderTopWidth):0);
_635.x+=ifc.x+left-_636.x;
_635.y+=ifc.y+top-_636.y;
}
}else{
_635=dojo.position(_633,true);
_635.x+=10;
_635.y+=10;
}
var self=this;
var _637=dijit.getFocus(this);
function _638(){
if(self.refocus){
dijit.focus(_637);
}
dijit.popup.close(self);
};
dijit.popup.open({popup:this,x:_635.x,y:_635.y,onExecute:_638,onCancel:_638,orient:this.isLeftToRight()?"L":"R"});
this.focus();
this._onBlur=function(){
this.inherited("_onBlur",arguments);
dijit.popup.close(this);
};
},uninitialize:function(){
dojo.forEach(this._bindings,function(b){
if(b){
this.unBindDomNode(b.node);
}
},this);
this.inherited(arguments);
}});
}
if(!dojo._hasResource["dijit.layout.TabController"]){
dojo._hasResource["dijit.layout.TabController"]=true;
dojo.provide("dijit.layout.TabController");
dojo.declare("dijit.layout.TabController",dijit.layout.StackController,{templateString:"<div role='tablist' dojoAttachEvent='onkeypress:onkeypress'></div>",tabPosition:"top",buttonWidget:"dijit.layout._TabButton",_rectifyRtlTabList:function(){
if(0>=this.tabPosition.indexOf("-h")){
return;
}
if(!this.pane2button){
return;
}
var _639=0;
for(var pane in this.pane2button){
var ow=this.pane2button[pane].innerDiv.scrollWidth;
_639=Math.max(_639,ow);
}
for(pane in this.pane2button){
this.pane2button[pane].innerDiv.style.width=_639+"px";
}
}});
dojo.declare("dijit.layout._TabButton",dijit.layout._StackButton,{baseClass:"dijitTab",cssStateNodes:{closeNode:"dijitTabCloseButton"},templateString:dojo.cache("dijit.layout","templates/_TabButton.html","<div role=\"presentation\" dojoAttachPoint=\"titleNode\" dojoAttachEvent='onclick:onClick'>\r\n    <div role=\"presentation\" class='dijitTabInnerDiv' dojoAttachPoint='innerDiv'>\r\n        <div role=\"presentation\" class='dijitTabContent' dojoAttachPoint='tabContent'>\r\n        \t<div role=\"presentation\" dojoAttachPoint='focusNode'>\r\n\t\t        <img src=\"${_blankGif}\" alt=\"\" class=\"dijitIcon dijitTabButtonIcon\" dojoAttachPoint='iconNode' />\r\n\t\t        <span dojoAttachPoint='containerNode' class='tabLabel'></span>\r\n\t\t        <span class=\"dijitInline dijitTabCloseButton dijitTabCloseIcon\" dojoAttachPoint='closeNode'\r\n\t\t        \t\tdojoAttachEvent='onclick: onClickCloseButton' role=\"presentation\">\r\n\t\t            <span dojoAttachPoint='closeText' class='dijitTabCloseText'>[x]</span\r\n\t\t        ></span>\r\n\t\t\t</div>\r\n        </div>\r\n    </div>\r\n</div>\r\n"),scrollOnFocus:false,buildRendering:function(){
this.inherited(arguments);
dojo.setSelectable(this.containerNode,false);
},startup:function(){
this.inherited(arguments);
var n=this.domNode;
setTimeout(function(){
n.className=n.className;
},1);
},_setCloseButtonAttr:function(disp){
this._set("closeButton",disp);
dojo.toggleClass(this.innerDiv,"dijitClosable",disp);
this.closeNode.style.display=disp?"":"none";
if(disp){
var _63a=dojo.i18n.getLocalization("dijit","common");
if(this.closeNode){
dojo.attr(this.closeNode,"title",_63a.itemClose);
}
var _63a=dojo.i18n.getLocalization("dijit","common");
this._closeMenu=new dijit.Menu({id:this.id+"_Menu",dir:this.dir,lang:this.lang,targetNodeIds:[this.domNode]});
this._closeMenu.addChild(new dijit.MenuItem({label:_63a.itemClose,dir:this.dir,lang:this.lang,onClick:dojo.hitch(this,"onClickCloseButton")}));
}else{
if(this._closeMenu){
this._closeMenu.destroyRecursive();
delete this._closeMenu;
}
}
},_setLabelAttr:function(_63b){
this.inherited(arguments);
if(this.showLabel==false&&!this.params.title){
this.iconNode.alt=dojo.trim(this.containerNode.innerText||this.containerNode.textContent||"");
}
},destroy:function(){
if(this._closeMenu){
this._closeMenu.destroyRecursive();
delete this._closeMenu;
}
this.inherited(arguments);
}});
}
if(!dojo._hasResource["dijit.layout.ScrollingTabController"]){
dojo._hasResource["dijit.layout.ScrollingTabController"]=true;
dojo.provide("dijit.layout.ScrollingTabController");
dojo.declare("dijit.layout.ScrollingTabController",dijit.layout.TabController,{templateString:dojo.cache("dijit.layout","templates/ScrollingTabController.html","<div class=\"dijitTabListContainer-${tabPosition}\" style=\"visibility:hidden\">\r\n\t<div dojoType=\"dijit.layout._ScrollingTabControllerMenuButton\"\r\n\t\t\tclass=\"tabStripButton-${tabPosition}\"\r\n\t\t\tid=\"${id}_menuBtn\" containerId=\"${containerId}\" iconClass=\"dijitTabStripMenuIcon\"\r\n\t\t\tdropDownPosition=\"below-alt, above-alt\"\r\n\t\t\tdojoAttachPoint=\"_menuBtn\" showLabel=false>&#9660;</div>\r\n\t<div dojoType=\"dijit.layout._ScrollingTabControllerButton\"\r\n\t\t\tclass=\"tabStripButton-${tabPosition}\"\r\n\t\t\tid=\"${id}_leftBtn\" iconClass=\"dijitTabStripSlideLeftIcon\"\r\n\t\t\tdojoAttachPoint=\"_leftBtn\" dojoAttachEvent=\"onClick: doSlideLeft\" showLabel=false>&#9664;</div>\r\n\t<div dojoType=\"dijit.layout._ScrollingTabControllerButton\"\r\n\t\t\tclass=\"tabStripButton-${tabPosition}\"\r\n\t\t\tid=\"${id}_rightBtn\" iconClass=\"dijitTabStripSlideRightIcon\"\r\n\t\t\tdojoAttachPoint=\"_rightBtn\" dojoAttachEvent=\"onClick: doSlideRight\" showLabel=false>&#9654;</div>\r\n\t<div class='dijitTabListWrapper' dojoAttachPoint='tablistWrapper'>\r\n\t\t<div role='tablist' dojoAttachEvent='onkeypress:onkeypress'\r\n\t\t\t\tdojoAttachPoint='containerNode' class='nowrapTabStrip'></div>\r\n\t</div>\r\n</div>\r\n"),useMenu:true,useSlider:true,tabStripClass:"",widgetsInTemplate:true,_minScroll:5,attributeMap:dojo.delegate(dijit._Widget.prototype.attributeMap,{"class":"containerNode"}),buildRendering:function(){
this.inherited(arguments);
var n=this.domNode;
this.scrollNode=this.tablistWrapper;
this._initButtons();
if(!this.tabStripClass){
this.tabStripClass="dijitTabContainer"+this.tabPosition.charAt(0).toUpperCase()+this.tabPosition.substr(1).replace(/-.*/,"")+"None";
dojo.addClass(n,"tabStrip-disabled");
}
dojo.addClass(this.tablistWrapper,this.tabStripClass);
},onStartup:function(){
this.inherited(arguments);
dojo.style(this.domNode,"visibility","visible");
this._postStartup=true;
},onAddChild:function(page,_63c){
this.inherited(arguments);
dojo.forEach(["label","iconClass"],function(attr){
this.pane2watches[page.id].push(this.pane2button[page.id].watch(attr,dojo.hitch(this,function(name,_63d,_63e){
if(this._postStartup&&this._dim){
this.resize(this._dim);
}
})));
},this);
dojo.style(this.containerNode,"width",(dojo.style(this.containerNode,"width")+200)+"px");
},onRemoveChild:function(page,_63f){
var _640=this.pane2button[page.id];
if(this._selectedTab===_640.domNode){
this._selectedTab=null;
}
this.inherited(arguments);
},_initButtons:function(){
this._btnWidth=0;
this._buttons=dojo.query("> .tabStripButton",this.domNode).filter(function(btn){
if((this.useMenu&&btn==this._menuBtn.domNode)||(this.useSlider&&(btn==this._rightBtn.domNode||btn==this._leftBtn.domNode))){
this._btnWidth+=dojo._getMarginSize(btn).w;
return true;
}else{
dojo.style(btn,"display","none");
return false;
}
},this);
},_getTabsWidth:function(){
var _641=this.getChildren();
if(_641.length){
var _642=_641[this.isLeftToRight()?0:_641.length-1].domNode,_643=_641[this.isLeftToRight()?_641.length-1:0].domNode;
return _643.offsetLeft+dojo.style(_643,"width")-_642.offsetLeft;
}else{
return 0;
}
},_enableBtn:function(_644){
var _645=this._getTabsWidth();
_644=_644||dojo.style(this.scrollNode,"width");
return _645>0&&_644<_645;
},resize:function(dim){
if(this.domNode.offsetWidth==0){
return;
}
this._dim=dim;
this.scrollNode.style.height="auto";
this._contentBox=dijit.layout.marginBox2contentBox(this.domNode,{h:0,w:dim.w});
this._contentBox.h=this.scrollNode.offsetHeight;
dojo.contentBox(this.domNode,this._contentBox);
var _646=this._enableBtn(this._contentBox.w);
this._buttons.style("display",_646?"":"none");
this._leftBtn.layoutAlign="left";
this._rightBtn.layoutAlign="right";
this._menuBtn.layoutAlign=this.isLeftToRight()?"right":"left";
dijit.layout.layoutChildren(this.domNode,this._contentBox,[this._menuBtn,this._leftBtn,this._rightBtn,{domNode:this.scrollNode,layoutAlign:"client"}]);
if(this._selectedTab){
if(this._anim&&this._anim.status()=="playing"){
this._anim.stop();
}
var w=this.scrollNode,sl=this._convertToScrollLeft(this._getScrollForSelectedTab());
w.scrollLeft=sl;
}
this._setButtonClass(this._getScroll());
this._postResize=true;
},_getScroll:function(){
var sl=(this.isLeftToRight()||dojo.isIE<8||(dojo.isIE&&dojo.isQuirks)||dojo.isWebKit)?this.scrollNode.scrollLeft:dojo.style(this.containerNode,"width")-dojo.style(this.scrollNode,"width")+(dojo.isIE==8?-1:1)*this.scrollNode.scrollLeft;
return sl;
},_convertToScrollLeft:function(val){
if(this.isLeftToRight()||dojo.isIE<8||(dojo.isIE&&dojo.isQuirks)||dojo.isWebKit){
return val;
}else{
var _647=dojo.style(this.containerNode,"width")-dojo.style(this.scrollNode,"width");
return (dojo.isIE==8?-1:1)*(val-_647);
}
},onSelectChild:function(page){
var tab=this.pane2button[page.id];
if(!tab||!page){
return;
}
var node=tab.domNode;
if(this._postResize&&node!=this._selectedTab){
this._selectedTab=node;
var sl=this._getScroll();
if(sl>node.offsetLeft||sl+dojo.style(this.scrollNode,"width")<node.offsetLeft+dojo.style(node,"width")){
this.createSmoothScroll().play();
}
}
this.inherited(arguments);
},_getScrollBounds:function(){
var _648=this.getChildren(),_649=dojo.style(this.scrollNode,"width"),_64a=dojo.style(this.containerNode,"width"),_64b=_64a-_649,_64c=this._getTabsWidth();
if(_648.length&&_64c>_649){
return {min:this.isLeftToRight()?0:_648[_648.length-1].domNode.offsetLeft,max:this.isLeftToRight()?(_648[_648.length-1].domNode.offsetLeft+dojo.style(_648[_648.length-1].domNode,"width"))-_649:_64b};
}else{
var _64d=this.isLeftToRight()?0:_64b;
return {min:_64d,max:_64d};
}
},_getScrollForSelectedTab:function(){
var w=this.scrollNode,n=this._selectedTab,_64e=dojo.style(this.scrollNode,"width"),_64f=this._getScrollBounds();
var pos=(n.offsetLeft+dojo.style(n,"width")/2)-_64e/2;
pos=Math.min(Math.max(pos,_64f.min),_64f.max);
return pos;
},createSmoothScroll:function(x){
if(arguments.length>0){
var _650=this._getScrollBounds();
x=Math.min(Math.max(x,_650.min),_650.max);
}else{
x=this._getScrollForSelectedTab();
}
if(this._anim&&this._anim.status()=="playing"){
this._anim.stop();
}
var self=this,w=this.scrollNode,anim=new dojo._Animation({beforeBegin:function(){
if(this.curve){
delete this.curve;
}
var oldS=w.scrollLeft,newS=self._convertToScrollLeft(x);
anim.curve=new dojo._Line(oldS,newS);
},onAnimate:function(val){
w.scrollLeft=val;
}});
this._anim=anim;
this._setButtonClass(x);
return anim;
},_getBtnNode:function(e){
var n=e.target;
while(n&&!dojo.hasClass(n,"tabStripButton")){
n=n.parentNode;
}
return n;
},doSlideRight:function(e){
this.doSlide(1,this._getBtnNode(e));
},doSlideLeft:function(e){
this.doSlide(-1,this._getBtnNode(e));
},doSlide:function(_651,node){
if(node&&dojo.hasClass(node,"dijitTabDisabled")){
return;
}
var _652=dojo.style(this.scrollNode,"width");
var d=(_652*0.75)*_651;
var to=this._getScroll()+d;
this._setButtonClass(to);
this.createSmoothScroll(to).play();
},_setButtonClass:function(_653){
var _654=this._getScrollBounds();
this._leftBtn.set("disabled",_653<=_654.min);
this._rightBtn.set("disabled",_653>=_654.max);
}});
dojo.declare("dijit.layout._ScrollingTabControllerButtonMixin",null,{baseClass:"dijitTab tabStripButton",templateString:dojo.cache("dijit.layout","templates/_ScrollingTabControllerButton.html","<div dojoAttachEvent=\"onclick:_onButtonClick\">\r\n\t<div role=\"presentation\" class=\"dijitTabInnerDiv\" dojoattachpoint=\"innerDiv,focusNode\">\r\n\t\t<div role=\"presentation\" class=\"dijitTabContent dijitButtonContents\" dojoattachpoint=\"tabContent\">\r\n\t\t\t<img role=\"presentation\" alt=\"\" src=\"${_blankGif}\" class=\"dijitTabStripIcon\" dojoAttachPoint=\"iconNode\"/>\r\n\t\t\t<span dojoAttachPoint=\"containerNode,titleNode\" class=\"dijitButtonText\"></span>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n"),tabIndex:"",isFocusable:function(){
return false;
}});
dojo.declare("dijit.layout._ScrollingTabControllerButton",[dijit.form.Button,dijit.layout._ScrollingTabControllerButtonMixin]);
dojo.declare("dijit.layout._ScrollingTabControllerMenuButton",[dijit.form.Button,dijit._HasDropDown,dijit.layout._ScrollingTabControllerButtonMixin],{containerId:"",tabIndex:"-1",isLoaded:function(){
return false;
},loadDropDown:function(_655){
this.dropDown=new dijit.Menu({id:this.containerId+"_menu",dir:this.dir,lang:this.lang});
var _656=dijit.byId(this.containerId);
dojo.forEach(_656.getChildren(),function(page){
var _657=new dijit.MenuItem({id:page.id+"_stcMi",label:page.title,iconClass:page.iconClass,dir:page.dir,lang:page.lang,onClick:function(){
_656.selectChild(page);
}});
this.dropDown.addChild(_657);
},this);
_655();
},closeDropDown:function(_658){
this.inherited(arguments);
if(this.dropDown){
this.dropDown.destroyRecursive();
delete this.dropDown;
}
}});
}
if(!dojo._hasResource["dijit.layout.TabContainer"]){
dojo._hasResource["dijit.layout.TabContainer"]=true;
dojo.provide("dijit.layout.TabContainer");
dojo.declare("dijit.layout.TabContainer",dijit.layout._TabContainerBase,{useMenu:true,useSlider:true,controllerWidget:"",_makeController:function(_659){
var cls=this.baseClass+"-tabs"+(this.doLayout?"":" dijitTabNoLayout"),_65a=dojo.getObject(this.controllerWidget);
return new _65a({id:this.id+"_tablist",dir:this.dir,lang:this.lang,tabPosition:this.tabPosition,doLayout:this.doLayout,containerId:this.id,"class":cls,nested:this.nested,useMenu:this.useMenu,useSlider:this.useSlider,tabStripClass:this.tabStrip?this.baseClass+(this.tabStrip?"":"No")+"Strip":null},_659);
},postMixInProperties:function(){
this.inherited(arguments);
if(!this.controllerWidget){
this.controllerWidget=(this.tabPosition=="top"||this.tabPosition=="bottom")&&!this.nested?"dijit.layout.ScrollingTabController":"dijit.layout.TabController";
}
}});
}
if(!dojo._hasResource["dojo.DeferredList"]){
dojo._hasResource["dojo.DeferredList"]=true;
dojo.provide("dojo.DeferredList");
dojo.DeferredList=function(list,_65b,_65c,_65d,_65e){
var _65f=[];
dojo.Deferred.call(this);
var self=this;
if(list.length===0&&!_65b){
this.resolve([0,[]]);
}
var _660=0;
dojo.forEach(list,function(item,i){
item.then(function(_661){
if(_65b){
self.resolve([i,_661]);
}else{
_662(true,_661);
}
},function(_663){
if(_65c){
self.reject(_663);
}else{
_662(false,_663);
}
if(_65d){
return null;
}
throw _663;
});
function _662(_664,_665){
_65f[i]=[_664,_665];
_660++;
if(_660===list.length){
self.resolve(_65f);
}
};
});
};
dojo.DeferredList.prototype=new dojo.Deferred();
dojo.DeferredList.prototype.gatherResults=function(_666){
var d=new dojo.DeferredList(_666,false,true,false);
d.addCallback(function(_667){
var ret=[];
dojo.forEach(_667,function(_668){
ret.push(_668[1]);
});
return ret;
});
return d;
};
}
if(!dojo._hasResource["dijit.tree.TreeStoreModel"]){
dojo._hasResource["dijit.tree.TreeStoreModel"]=true;
dojo.provide("dijit.tree.TreeStoreModel");
dojo.declare("dijit.tree.TreeStoreModel",null,{store:null,childrenAttrs:["children"],newItemIdAttr:"id",labelAttr:"",root:null,query:null,deferItemLoadingUntilExpand:false,constructor:function(args){
dojo.mixin(this,args);
this.connects=[];
var _669=this.store;
if(!_669.getFeatures()["dojo.data.api.Identity"]){
throw new Error("dijit.Tree: store must support dojo.data.Identity");
}
if(_669.getFeatures()["dojo.data.api.Notification"]){
this.connects=this.connects.concat([dojo.connect(_669,"onNew",this,"onNewItem"),dojo.connect(_669,"onDelete",this,"onDeleteItem"),dojo.connect(_669,"onSet",this,"onSetItem")]);
}
},destroy:function(){
dojo.forEach(this.connects,dojo.disconnect);
},getRoot:function(_66a,_66b){
if(this.root){
_66a(this.root);
}else{
this.store.fetch({query:this.query,onComplete:dojo.hitch(this,function(_66c){
if(_66c.length!=1){
throw new Error(this.declaredClass+": query "+dojo.toJson(this.query)+" returned "+_66c.length+" items, but must return exactly one item");
}
this.root=_66c[0];
_66a(this.root);
}),onError:_66b});
}
},mayHaveChildren:function(item){
return dojo.some(this.childrenAttrs,function(attr){
return this.store.hasAttribute(item,attr);
},this);
},getChildren:function(_66d,_66e,_66f){
var _670=this.store;
if(!_670.isItemLoaded(_66d)){
var _671=dojo.hitch(this,arguments.callee);
_670.loadItem({item:_66d,onItem:function(_672){
_671(_672,_66e,_66f);
},onError:_66f});
return;
}
var _673=[];
for(var i=0;i<this.childrenAttrs.length;i++){
var vals=_670.getValues(_66d,this.childrenAttrs[i]);
_673=_673.concat(vals);
}
var _674=0;
if(!this.deferItemLoadingUntilExpand){
dojo.forEach(_673,function(item){
if(!_670.isItemLoaded(item)){
_674++;
}
});
}
if(_674==0){
_66e(_673);
}else{
dojo.forEach(_673,function(item,idx){
if(!_670.isItemLoaded(item)){
_670.loadItem({item:item,onItem:function(item){
_673[idx]=item;
if(--_674==0){
_66e(_673);
}
},onError:_66f});
}
});
}
},isItem:function(_675){
return this.store.isItem(_675);
},fetchItemByIdentity:function(_676){
this.store.fetchItemByIdentity(_676);
},getIdentity:function(item){
return this.store.getIdentity(item);
},getLabel:function(item){
if(this.labelAttr){
return this.store.getValue(item,this.labelAttr);
}else{
return this.store.getLabel(item);
}
},newItem:function(args,_677,_678){
var _679={parent:_677,attribute:this.childrenAttrs[0]},_67a;
if(this.newItemIdAttr&&args[this.newItemIdAttr]){
this.fetchItemByIdentity({identity:args[this.newItemIdAttr],scope:this,onItem:function(item){
if(item){
this.pasteItem(item,null,_677,true,_678);
}else{
_67a=this.store.newItem(args,_679);
if(_67a&&(_678!=undefined)){
this.pasteItem(_67a,_677,_677,false,_678);
}
}
}});
}else{
_67a=this.store.newItem(args,_679);
if(_67a&&(_678!=undefined)){
this.pasteItem(_67a,_677,_677,false,_678);
}
}
},pasteItem:function(_67b,_67c,_67d,_67e,_67f){
var _680=this.store,_681=this.childrenAttrs[0];
if(_67c){
dojo.forEach(this.childrenAttrs,function(attr){
if(_680.containsValue(_67c,attr,_67b)){
if(!_67e){
var _682=dojo.filter(_680.getValues(_67c,attr),function(x){
return x!=_67b;
});
_680.setValues(_67c,attr,_682);
}
_681=attr;
}
});
}
if(_67d){
if(typeof _67f=="number"){
var _683=_680.getValues(_67d,_681).slice();
_683.splice(_67f,0,_67b);
_680.setValues(_67d,_681,_683);
}else{
_680.setValues(_67d,_681,_680.getValues(_67d,_681).concat(_67b));
}
}
},onChange:function(item){
},onChildrenChange:function(_684,_685){
},onDelete:function(_686,_687){
},onNewItem:function(item,_688){
if(!_688){
return;
}
this.getChildren(_688.item,dojo.hitch(this,function(_689){
this.onChildrenChange(_688.item,_689);
}));
},onDeleteItem:function(item){
this.onDelete(item);
},onSetItem:function(item,_68a,_68b,_68c){
if(dojo.indexOf(this.childrenAttrs,_68a)!=-1){
this.getChildren(item,dojo.hitch(this,function(_68d){
this.onChildrenChange(item,_68d);
}));
}else{
this.onChange(item);
}
}});
}
if(!dojo._hasResource["dijit.tree.ForestStoreModel"]){
dojo._hasResource["dijit.tree.ForestStoreModel"]=true;
dojo.provide("dijit.tree.ForestStoreModel");
dojo.declare("dijit.tree.ForestStoreModel",dijit.tree.TreeStoreModel,{rootId:"$root$",rootLabel:"ROOT",query:null,constructor:function(_68e){
this.root={store:this,root:true,id:_68e.rootId,label:_68e.rootLabel,children:_68e.rootChildren};
},mayHaveChildren:function(item){
return item===this.root||this.inherited(arguments);
},getChildren:function(_68f,_690,_691){
if(_68f===this.root){
if(this.root.children){
_690(this.root.children);
}else{
this.store.fetch({query:this.query,onComplete:dojo.hitch(this,function(_692){
this.root.children=_692;
_690(_692);
}),onError:_691});
}
}else{
this.inherited(arguments);
}
},isItem:function(_693){
return (_693===this.root)?true:this.inherited(arguments);
},fetchItemByIdentity:function(_694){
if(_694.identity==this.root.id){
var _695=_694.scope?_694.scope:dojo.global;
if(_694.onItem){
_694.onItem.call(_695,this.root);
}
}else{
this.inherited(arguments);
}
},getIdentity:function(item){
return (item===this.root)?this.root.id:this.inherited(arguments);
},getLabel:function(item){
return (item===this.root)?this.root.label:this.inherited(arguments);
},newItem:function(args,_696,_697){
if(_696===this.root){
this.onNewRootItem(args);
return this.store.newItem(args);
}else{
return this.inherited(arguments);
}
},onNewRootItem:function(args){
},pasteItem:function(_698,_699,_69a,_69b,_69c){
if(_699===this.root){
if(!_69b){
this.onLeaveRoot(_698);
}
}
dijit.tree.TreeStoreModel.prototype.pasteItem.call(this,_698,_699===this.root?null:_699,_69a===this.root?null:_69a,_69b,_69c);
if(_69a===this.root){
this.onAddToRoot(_698);
}
},onAddToRoot:function(item){
console.log(this,": item ",item," added to root");
},onLeaveRoot:function(item){
console.log(this,": item ",item," removed from root");
},_requeryTop:function(){
var _69d=this.root.children||[];
this.store.fetch({query:this.query,onComplete:dojo.hitch(this,function(_69e){
this.root.children=_69e;
if(_69d.length!=_69e.length||dojo.some(_69d,function(item,idx){
return _69e[idx]!=item;
})){
this.onChildrenChange(this.root,_69e);
}
})});
},onNewItem:function(item,_69f){
this._requeryTop();
this.inherited(arguments);
},onDeleteItem:function(item){
if(dojo.indexOf(this.root.children,item)!=-1){
this._requeryTop();
}
this.inherited(arguments);
},onSetItem:function(item,_6a0,_6a1,_6a2){
this._requeryTop();
this.inherited(arguments);
}});
}
if(!dojo._hasResource["dijit.tree._dndContainer"]){
dojo._hasResource["dijit.tree._dndContainer"]=true;
dojo.provide("dijit.tree._dndContainer");
dojo.getObject("tree",true,dojo);
dijit.tree._compareNodes=function(n1,n2){
if(n1===n2){
return 0;
}
if("sourceIndex" in document.documentElement){
return n1.sourceIndex-n2.sourceIndex;
}else{
if("compareDocumentPosition" in document.documentElement){
return n1.compareDocumentPosition(n2)&2?1:-1;
}else{
if(document.createRange){
var r1=doc.createRange();
r1.setStartBefore(n1);
var r2=doc.createRange();
r2.setStartBefore(n2);
return r1.compareBoundaryPoints(r1.END_TO_END,r2);
}else{
throw Error("dijit.tree._compareNodes don't know how to compare two different nodes in this browser");
}
}
}
};
dojo.declare("dijit.tree._dndContainer",null,{constructor:function(tree,_6a3){
this.tree=tree;
this.node=tree.domNode;
dojo.mixin(this,_6a3);
this.map={};
this.current=null;
this.containerState="";
dojo.addClass(this.node,"dojoDndContainer");
this.events=[dojo.connect(this.node,"onmouseenter",this,"onOverEvent"),dojo.connect(this.node,"onmouseleave",this,"onOutEvent"),dojo.connect(this.tree,"_onNodeMouseEnter",this,"onMouseOver"),dojo.connect(this.tree,"_onNodeMouseLeave",this,"onMouseOut"),dojo.connect(this.node,"ondragstart",dojo,"stopEvent"),dojo.connect(this.node,"onselectstart",dojo,"stopEvent")];
},getItem:function(key){
var _6a4=this.selection[key],ret={data:_6a4,type:["treeNode"]};
return ret;
},destroy:function(){
dojo.forEach(this.events,dojo.disconnect);
this.node=this.parent=null;
},onMouseOver:function(_6a5,evt){
this.current=_6a5;
},onMouseOut:function(_6a6,evt){
this.current=null;
},_changeState:function(type,_6a7){
var _6a8="dojoDnd"+type;
var _6a9=type.toLowerCase()+"State";
dojo.replaceClass(this.node,_6a8+_6a7,_6a8+this[_6a9]);
this[_6a9]=_6a7;
},_addItemClass:function(node,type){
dojo.addClass(node,"dojoDndItem"+type);
},_removeItemClass:function(node,type){
dojo.removeClass(node,"dojoDndItem"+type);
},onOverEvent:function(){
this._changeState("Container","Over");
},onOutEvent:function(){
this._changeState("Container","");
}});
}
if(!dojo._hasResource["dijit.tree._dndSelector"]){
dojo._hasResource["dijit.tree._dndSelector"]=true;
dojo.provide("dijit.tree._dndSelector");
dojo.declare("dijit.tree._dndSelector",dijit.tree._dndContainer,{constructor:function(tree,_6aa){
this.selection={};
this.anchor=null;
dijit.setWaiState(this.tree.domNode,"multiselect",!this.singular);
this.events.push(dojo.connect(this.tree.domNode,"onmousedown",this,"onMouseDown"),dojo.connect(this.tree.domNode,"onmouseup",this,"onMouseUp"),dojo.connect(this.tree.domNode,"onmousemove",this,"onMouseMove"));
},singular:false,getSelectedTreeNodes:function(){
var _6ab=[],sel=this.selection;
for(var i in sel){
_6ab.push(sel[i]);
}
return _6ab;
},selectNone:function(){
this.setSelection([]);
return this;
},destroy:function(){
this.inherited(arguments);
this.selection=this.anchor=null;
},addTreeNode:function(node,_6ac){
this.setSelection(this.getSelectedTreeNodes().concat([node]));
if(_6ac){
this.anchor=node;
}
return node;
},removeTreeNode:function(node){
this.setSelection(this._setDifference(this.getSelectedTreeNodes(),[node]));
return node;
},isTreeNodeSelected:function(node){
return node.id&&!!this.selection[node.id];
},setSelection:function(_6ad){
var _6ae=this.getSelectedTreeNodes();
dojo.forEach(this._setDifference(_6ae,_6ad),dojo.hitch(this,function(node){
node.setSelected(false);
if(this.anchor==node){
delete this.anchor;
}
delete this.selection[node.id];
}));
dojo.forEach(this._setDifference(_6ad,_6ae),dojo.hitch(this,function(node){
node.setSelected(true);
this.selection[node.id]=node;
}));
this._updateSelectionProperties();
},_setDifference:function(xs,ys){
dojo.forEach(ys,function(y){
y.__exclude__=true;
});
var ret=dojo.filter(xs,function(x){
return !x.__exclude__;
});
dojo.forEach(ys,function(y){
delete y["__exclude__"];
});
return ret;
},_updateSelectionProperties:function(){
var _6af=this.getSelectedTreeNodes();
var _6b0=[],_6b1=[];
dojo.forEach(_6af,function(node){
_6b1.push(node);
_6b0.push(node.getTreePath());
});
var _6b2=dojo.map(_6b1,function(node){
return node.item;
});
this.tree._set("paths",_6b0);
this.tree._set("path",_6b0[0]||[]);
this.tree._set("selectedNodes",_6b1);
this.tree._set("selectedNode",_6b1[0]||null);
this.tree._set("selectedItems",_6b2);
this.tree._set("selectedItem",_6b2[0]||null);
},onMouseDown:function(e){
if(!this.current||this.tree.isExpandoNode(e.target,this.current)){
return;
}
if(e.button==dojo.mouseButtons.RIGHT){
return;
}
dojo.stopEvent(e);
var _6b3=this.current,copy=dojo.isCopyKey(e),id=_6b3.id;
if(!this.singular&&!e.shiftKey&&this.selection[id]){
this._doDeselect=true;
return;
}else{
this._doDeselect=false;
}
this.userSelect(_6b3,copy,e.shiftKey);
},onMouseUp:function(e){
if(!this._doDeselect){
return;
}
this._doDeselect=false;
this.userSelect(this.current,dojo.isCopyKey(e),e.shiftKey);
},onMouseMove:function(e){
this._doDeselect=false;
},userSelect:function(node,_6b4,_6b5){
if(this.singular){
if(this.anchor==node&&_6b4){
this.selectNone();
}else{
this.setSelection([node]);
this.anchor=node;
}
}else{
if(_6b5&&this.anchor){
var cr=dijit.tree._compareNodes(this.anchor.rowNode,node.rowNode),_6b6,end,_6b7=this.anchor;
if(cr<0){
_6b6=_6b7;
end=node;
}else{
_6b6=node;
end=_6b7;
}
nodes=[];
while(_6b6!=end){
nodes.push(_6b6);
_6b6=this.tree._getNextNode(_6b6);
}
nodes.push(end);
this.setSelection(nodes);
}else{
if(this.selection[node.id]&&_6b4){
this.removeTreeNode(node);
}else{
if(_6b4){
this.addTreeNode(node,true);
}else{
this.setSelection([node]);
this.anchor=node;
}
}
}
}
},forInSelectedItems:function(f,o){
o=o||dojo.global;
for(var id in this.selection){
f.call(o,this.getItem(id),id,this);
}
}});
}
if(!dojo._hasResource["dijit.Tree"]){
dojo._hasResource["dijit.Tree"]=true;
dojo.provide("dijit.Tree");
dojo.declare("dijit._TreeNode",[dijit._Widget,dijit._Templated,dijit._Container,dijit._Contained,dijit._CssStateMixin],{item:null,isTreeNode:true,label:"",isExpandable:null,isExpanded:false,state:"UNCHECKED",templateString:dojo.cache("dijit","templates/TreeNode.html","<div class=\"dijitTreeNode\" role=\"presentation\"\r\n\t><div dojoAttachPoint=\"rowNode\" class=\"dijitTreeRow\" role=\"presentation\" dojoAttachEvent=\"onmouseenter:_onMouseEnter, onmouseleave:_onMouseLeave, onclick:_onClick, ondblclick:_onDblClick\"\r\n\t\t><img src=\"${_blankGif}\" alt=\"\" dojoAttachPoint=\"expandoNode\" class=\"dijitTreeExpando\" role=\"presentation\"\r\n\t\t/><span dojoAttachPoint=\"expandoNodeText\" class=\"dijitExpandoText\" role=\"presentation\"\r\n\t\t></span\r\n\t\t><span dojoAttachPoint=\"contentNode\"\r\n\t\t\tclass=\"dijitTreeContent\" role=\"presentation\">\r\n\t\t\t<img src=\"${_blankGif}\" alt=\"\" dojoAttachPoint=\"iconNode\" class=\"dijitIcon dijitTreeIcon\" role=\"presentation\"\r\n\t\t\t/><span dojoAttachPoint=\"labelNode\" class=\"dijitTreeLabel\" role=\"treeitem\" tabindex=\"-1\" aria-selected=\"false\" dojoAttachEvent=\"onfocus:_onLabelFocus\"></span>\r\n\t\t</span\r\n\t></div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitTreeContainer\" role=\"presentation\" style=\"display: none;\"></div>\r\n</div>\r\n"),baseClass:"dijitTreeNode",cssStateNodes:{rowNode:"dijitTreeRow",labelNode:"dijitTreeLabel"},attributeMap:dojo.delegate(dijit._Widget.prototype.attributeMap,{label:{node:"labelNode",type:"innerText"},tooltip:{node:"rowNode",type:"attribute",attribute:"title"}}),buildRendering:function(){
this.inherited(arguments);
this._setExpando();
this._updateItemClasses(this.item);
if(this.isExpandable){
dijit.setWaiState(this.labelNode,"expanded",this.isExpanded);
}
this.setSelected(false);
},_setIndentAttr:function(_6b8){
var _6b9=(Math.max(_6b8,0)*this.tree._nodePixelIndent)+"px";
dojo.style(this.domNode,"backgroundPosition",_6b9+" 0px");
dojo.style(this.rowNode,this.isLeftToRight()?"paddingLeft":"paddingRight",_6b9);
dojo.forEach(this.getChildren(),function(_6ba){
_6ba.set("indent",_6b8+1);
});
this._set("indent",_6b8);
},markProcessing:function(){
this.state="LOADING";
this._setExpando(true);
},unmarkProcessing:function(){
this._setExpando(false);
},_updateItemClasses:function(item){
var tree=this.tree,_6bb=tree.model;
if(tree._v10Compat&&item===_6bb.root){
item=null;
}
this._applyClassAndStyle(item,"icon","Icon");
this._applyClassAndStyle(item,"label","Label");
this._applyClassAndStyle(item,"row","Row");
},_applyClassAndStyle:function(item,_6bc,_6bd){
var _6be="_"+_6bc+"Class";
var _6bf=_6bc+"Node";
var _6c0=this[_6be];
this[_6be]=this.tree["get"+_6bd+"Class"](item,this.isExpanded);
dojo.replaceClass(this[_6bf],this[_6be]||"",_6c0||"");
dojo.style(this[_6bf],this.tree["get"+_6bd+"Style"](item,this.isExpanded)||{});
},_updateLayout:function(){
var _6c1=this.getParent();
if(!_6c1||_6c1.rowNode.style.display=="none"){
dojo.addClass(this.domNode,"dijitTreeIsRoot");
}else{
dojo.toggleClass(this.domNode,"dijitTreeIsLast",!this.getNextSibling());
}
},_setExpando:function(_6c2){
var _6c3=["dijitTreeExpandoLoading","dijitTreeExpandoOpened","dijitTreeExpandoClosed","dijitTreeExpandoLeaf"],_6c4=["*","-","+","*"],idx=_6c2?0:(this.isExpandable?(this.isExpanded?1:2):3);
dojo.replaceClass(this.expandoNode,_6c3[idx],_6c3);
this.expandoNodeText.innerHTML=_6c4[idx];
},expand:function(){
if(this._expandDeferred){
return this._expandDeferred;
}
this._wipeOut&&this._wipeOut.stop();
this.isExpanded=true;
dijit.setWaiState(this.labelNode,"expanded","true");
if(this.tree.showRoot||this!==this.tree.rootNode){
dijit.setWaiRole(this.containerNode,"group");
}
dojo.addClass(this.contentNode,"dijitTreeContentExpanded");
this._setExpando();
this._updateItemClasses(this.item);
if(this==this.tree.rootNode){
dijit.setWaiState(this.tree.domNode,"expanded","true");
}
var def,_6c5=dojo.fx.wipeIn({node:this.containerNode,duration:dijit.defaultDuration,onEnd:function(){
def.callback(true);
}});
def=(this._expandDeferred=new dojo.Deferred(function(){
_6c5.stop();
}));
_6c5.play();
return def;
},collapse:function(){
if(!this.isExpanded){
return;
}
if(this._expandDeferred){
this._expandDeferred.cancel();
delete this._expandDeferred;
}
this.isExpanded=false;
dijit.setWaiState(this.labelNode,"expanded","false");
if(this==this.tree.rootNode){
dijit.setWaiState(this.tree.domNode,"expanded","false");
}
dojo.removeClass(this.contentNode,"dijitTreeContentExpanded");
this._setExpando();
this._updateItemClasses(this.item);
if(!this._wipeOut){
this._wipeOut=dojo.fx.wipeOut({node:this.containerNode,duration:dijit.defaultDuration});
}
this._wipeOut.play();
},indent:0,setChildItems:function(_6c6){
var tree=this.tree,_6c7=tree.model,defs=[];
dojo.forEach(this.getChildren(),function(_6c8){
dijit._Container.prototype.removeChild.call(this,_6c8);
},this);
this.state="LOADED";
if(_6c6&&_6c6.length>0){
this.isExpandable=true;
dojo.forEach(_6c6,function(item){
var id=_6c7.getIdentity(item),_6c9=tree._itemNodesMap[id],node;
if(_6c9){
for(var i=0;i<_6c9.length;i++){
if(_6c9[i]&&!_6c9[i].getParent()){
node=_6c9[i];
node.set("indent",this.indent+1);
break;
}
}
}
if(!node){
node=this.tree._createTreeNode({item:item,tree:tree,isExpandable:_6c7.mayHaveChildren(item),label:tree.getLabel(item),tooltip:tree.getTooltip(item),dir:tree.dir,lang:tree.lang,indent:this.indent+1});
if(_6c9){
_6c9.push(node);
}else{
tree._itemNodesMap[id]=[node];
}
}
this.addChild(node);
if(this.tree.autoExpand||this.tree._state(item)){
defs.push(tree._expandNode(node));
}
},this);
dojo.forEach(this.getChildren(),function(_6ca,idx){
_6ca._updateLayout();
});
}else{
this.isExpandable=false;
}
if(this._setExpando){
this._setExpando(false);
}
this._updateItemClasses(this.item);
if(this==tree.rootNode){
var fc=this.tree.showRoot?this:this.getChildren()[0];
if(fc){
fc.setFocusable(true);
tree.lastFocused=fc;
}else{
tree.domNode.setAttribute("tabIndex","0");
}
}
return new dojo.DeferredList(defs);
},getTreePath:function(){
var node=this;
var path=[];
while(node&&node!==this.tree.rootNode){
path.unshift(node.item);
node=node.getParent();
}
path.unshift(this.tree.rootNode.item);
return path;
},getIdentity:function(){
return this.tree.model.getIdentity(this.item);
},removeChild:function(node){
this.inherited(arguments);
var _6cb=this.getChildren();
if(_6cb.length==0){
this.isExpandable=false;
this.collapse();
}
dojo.forEach(_6cb,function(_6cc){
_6cc._updateLayout();
});
},makeExpandable:function(){
this.isExpandable=true;
this._setExpando(false);
},_onLabelFocus:function(evt){
this.tree._onNodeFocus(this);
},setSelected:function(_6cd){
dijit.setWaiState(this.labelNode,"selected",_6cd);
dojo.toggleClass(this.rowNode,"dijitTreeRowSelected",_6cd);
},setFocusable:function(_6ce){
this.labelNode.setAttribute("tabIndex",_6ce?"0":"-1");
},_onClick:function(evt){
this.tree._onClick(this,evt);
},_onDblClick:function(evt){
this.tree._onDblClick(this,evt);
},_onMouseEnter:function(evt){
this.tree._onNodeMouseEnter(this,evt);
},_onMouseLeave:function(evt){
this.tree._onNodeMouseLeave(this,evt);
}});
dojo.declare("dijit.Tree",[dijit._Widget,dijit._Templated],{store:null,model:null,query:null,label:"",showRoot:true,childrenAttr:["children"],paths:[],path:[],selectedItems:null,selectedItem:null,openOnClick:false,openOnDblClick:false,templateString:dojo.cache("dijit","templates/Tree.html","<div class=\"dijitTree dijitTreeContainer\" role=\"tree\"\r\n\tdojoAttachEvent=\"onkeypress:_onKeyPress\">\r\n\t<div class=\"dijitInline dijitTreeIndent\" style=\"position: absolute; top: -9999px\" dojoAttachPoint=\"indentDetector\"></div>\r\n</div>\r\n"),persist:true,autoExpand:false,dndController:"dijit.tree._dndSelector",dndParams:["onDndDrop","itemCreator","onDndCancel","checkAcceptance","checkItemAcceptance","dragThreshold","betweenThreshold"],onDndDrop:null,itemCreator:null,onDndCancel:null,checkAcceptance:null,checkItemAcceptance:null,dragThreshold:5,betweenThreshold:0,_nodePixelIndent:19,_publish:function(_6cf,_6d0){
dojo.publish(this.id,[dojo.mixin({tree:this,event:_6cf},_6d0||{})]);
},postMixInProperties:function(){
this.tree=this;
if(this.autoExpand){
this.persist=false;
}
this._itemNodesMap={};
if(!this.cookieName){
this.cookieName=this.id+"SaveStateCookie";
}
this._loadDeferred=new dojo.Deferred();
this.inherited(arguments);
},postCreate:function(){
this._initState();
if(!this.model){
this._store2model();
}
this.connect(this.model,"onChange","_onItemChange");
this.connect(this.model,"onChildrenChange","_onItemChildrenChange");
this.connect(this.model,"onDelete","_onItemDelete");
this._load();
this.inherited(arguments);
if(this.dndController){
if(dojo.isString(this.dndController)){
this.dndController=dojo.getObject(this.dndController);
}
var _6d1={};
for(var i=0;i<this.dndParams.length;i++){
if(this[this.dndParams[i]]){
_6d1[this.dndParams[i]]=this[this.dndParams[i]];
}
}
this.dndController=new this.dndController(this,_6d1);
}
},_store2model:function(){
this._v10Compat=true;
dojo.deprecated("Tree: from version 2.0, should specify a model object rather than a store/query");
var _6d2={id:this.id+"_ForestStoreModel",store:this.store,query:this.query,childrenAttrs:this.childrenAttr};
if(this.params.mayHaveChildren){
_6d2.mayHaveChildren=dojo.hitch(this,"mayHaveChildren");
}
if(this.params.getItemChildren){
_6d2.getChildren=dojo.hitch(this,function(item,_6d3,_6d4){
this.getItemChildren((this._v10Compat&&item===this.model.root)?null:item,_6d3,_6d4);
});
}
this.model=new dijit.tree.ForestStoreModel(_6d2);
this.showRoot=Boolean(this.label);
},onLoad:function(){
},_load:function(){
this.model.getRoot(dojo.hitch(this,function(item){
var rn=(this.rootNode=this.tree._createTreeNode({item:item,tree:this,isExpandable:true,label:this.label||this.getLabel(item),indent:this.showRoot?0:-1}));
if(!this.showRoot){
rn.rowNode.style.display="none";
dijit.setWaiRole(this.domNode,"presentation");
dijit.setWaiRole(rn.labelNode,"presentation");
dijit.setWaiRole(rn.containerNode,"tree");
}
this.domNode.appendChild(rn.domNode);
var _6d5=this.model.getIdentity(item);
if(this._itemNodesMap[_6d5]){
this._itemNodesMap[_6d5].push(rn);
}else{
this._itemNodesMap[_6d5]=[rn];
}
rn._updateLayout();
this._expandNode(rn).addCallback(dojo.hitch(this,function(){
this._loadDeferred.callback(true);
this.onLoad();
}));
}),function(err){
console.error(this,": error loading root: ",err);
});
},getNodesByItem:function(item){
if(!item){
return [];
}
var _6d6=dojo.isString(item)?item:this.model.getIdentity(item);
return [].concat(this._itemNodesMap[_6d6]);
},_setSelectedItemAttr:function(item){
this.set("selectedItems",[item]);
},_setSelectedItemsAttr:function(_6d7){
var tree=this;
this._loadDeferred.addCallback(dojo.hitch(this,function(){
var _6d8=dojo.map(_6d7,function(item){
return (!item||dojo.isString(item))?item:tree.model.getIdentity(item);
});
var _6d9=[];
dojo.forEach(_6d8,function(id){
_6d9=_6d9.concat(tree._itemNodesMap[id]||[]);
});
this.set("selectedNodes",_6d9);
}));
},_setPathAttr:function(path){
if(path.length){
return this.set("paths",[path]);
}else{
return this.set("paths",[]);
}
},_setPathsAttr:function(_6da){
var tree=this;
return new dojo.DeferredList(dojo.map(_6da,function(path){
var d=new dojo.Deferred();
path=dojo.map(path,function(item){
return dojo.isString(item)?item:tree.model.getIdentity(item);
});
if(path.length){
tree._loadDeferred.addCallback(function(){
_6db(path,[tree.rootNode],d);
});
}else{
d.errback("Empty path");
}
return d;
})).addCallback(_6dc);
function _6db(path,_6dd,def){
var _6de=path.shift();
var _6df=dojo.filter(_6dd,function(node){
return node.getIdentity()==_6de;
})[0];
if(!!_6df){
if(path.length){
tree._expandNode(_6df).addCallback(function(){
_6db(path,_6df.getChildren(),def);
});
}else{
def.callback(_6df);
}
}else{
def.errback("Could not expand path at "+_6de);
}
};
function _6dc(_6e0){
tree.set("selectedNodes",dojo.map(dojo.filter(_6e0,function(x){
return x[0];
}),function(x){
return x[1];
}));
};
},_setSelectedNodeAttr:function(node){
this.set("selectedNodes",[node]);
},_setSelectedNodesAttr:function(_6e1){
this._loadDeferred.addCallback(dojo.hitch(this,function(){
this.dndController.setSelection(_6e1);
}));
},mayHaveChildren:function(item){
},getItemChildren:function(_6e2,_6e3){
},getLabel:function(item){
return this.model.getLabel(item);
},getIconClass:function(item,_6e4){
return (!item||this.model.mayHaveChildren(item))?(_6e4?"dijitFolderOpened":"dijitFolderClosed"):"dijitLeaf";
},getLabelClass:function(item,_6e5){
},getRowClass:function(item,_6e6){
},getIconStyle:function(item,_6e7){
},getLabelStyle:function(item,_6e8){
},getRowStyle:function(item,_6e9){
},getTooltip:function(item){
return "";
},_onKeyPress:function(e){
if(e.altKey){
return;
}
var dk=dojo.keys;
var _6ea=dijit.getEnclosingWidget(e.target);
if(!_6ea){
return;
}
var key=e.charOrCode;
if(typeof key=="string"&&key!=" "){
if(!e.altKey&&!e.ctrlKey&&!e.shiftKey&&!e.metaKey){
this._onLetterKeyNav({node:_6ea,key:key.toLowerCase()});
dojo.stopEvent(e);
}
}else{
if(this._curSearch){
clearTimeout(this._curSearch.timer);
delete this._curSearch;
}
var map=this._keyHandlerMap;
if(!map){
map={};
map[dk.ENTER]="_onEnterKey";
map[dk.SPACE]=map[" "]="_onEnterKey";
map[this.isLeftToRight()?dk.LEFT_ARROW:dk.RIGHT_ARROW]="_onLeftArrow";
map[this.isLeftToRight()?dk.RIGHT_ARROW:dk.LEFT_ARROW]="_onRightArrow";
map[dk.UP_ARROW]="_onUpArrow";
map[dk.DOWN_ARROW]="_onDownArrow";
map[dk.HOME]="_onHomeKey";
map[dk.END]="_onEndKey";
this._keyHandlerMap=map;
}
if(this._keyHandlerMap[key]){
this[this._keyHandlerMap[key]]({node:_6ea,item:_6ea.item,evt:e});
dojo.stopEvent(e);
}
}
},_onEnterKey:function(_6eb){
this._publish("execute",{item:_6eb.item,node:_6eb.node});
this.dndController.userSelect(_6eb.node,dojo.isCopyKey(_6eb.evt),_6eb.evt.shiftKey);
this.onClick(_6eb.item,_6eb.node,_6eb.evt);
},_onDownArrow:function(_6ec){
var node=this._getNextNode(_6ec.node);
if(node&&node.isTreeNode){
this.focusNode(node);
}
},_onUpArrow:function(_6ed){
var node=_6ed.node;
var _6ee=node.getPreviousSibling();
if(_6ee){
node=_6ee;
while(node.isExpandable&&node.isExpanded&&node.hasChildren()){
var _6ef=node.getChildren();
node=_6ef[_6ef.length-1];
}
}else{
var _6f0=node.getParent();
if(!(!this.showRoot&&_6f0===this.rootNode)){
node=_6f0;
}
}
if(node&&node.isTreeNode){
this.focusNode(node);
}
},_onRightArrow:function(_6f1){
var node=_6f1.node;
if(node.isExpandable&&!node.isExpanded){
this._expandNode(node);
}else{
if(node.hasChildren()){
node=node.getChildren()[0];
if(node&&node.isTreeNode){
this.focusNode(node);
}
}
}
},_onLeftArrow:function(_6f2){
var node=_6f2.node;
if(node.isExpandable&&node.isExpanded){
this._collapseNode(node);
}else{
var _6f3=node.getParent();
if(_6f3&&_6f3.isTreeNode&&!(!this.showRoot&&_6f3===this.rootNode)){
this.focusNode(_6f3);
}
}
},_onHomeKey:function(){
var node=this._getRootOrFirstNode();
if(node){
this.focusNode(node);
}
},_onEndKey:function(_6f4){
var node=this.rootNode;
while(node.isExpanded){
var c=node.getChildren();
node=c[c.length-1];
}
if(node&&node.isTreeNode){
this.focusNode(node);
}
},multiCharSearchDuration:250,_onLetterKeyNav:function(_6f5){
var cs=this._curSearch;
if(cs){
cs.pattern=cs.pattern+_6f5.key;
clearTimeout(cs.timer);
}else{
cs=this._curSearch={pattern:_6f5.key,startNode:_6f5.node};
}
var self=this;
cs.timer=setTimeout(function(){
delete self._curSearch;
},this.multiCharSearchDuration);
var node=cs.startNode;
do{
node=this._getNextNode(node);
if(!node){
node=this._getRootOrFirstNode();
}
}while(node!==cs.startNode&&(node.label.toLowerCase().substr(0,cs.pattern.length)!=cs.pattern));
if(node&&node.isTreeNode){
if(node!==cs.startNode){
this.focusNode(node);
}
}
},isExpandoNode:function(node,_6f6){
return dojo.isDescendant(node,_6f6.expandoNode);
},_onClick:function(_6f7,e){
var _6f8=e.target,_6f9=this.isExpandoNode(_6f8,_6f7);
if((this.openOnClick&&_6f7.isExpandable)||_6f9){
if(_6f7.isExpandable){
this._onExpandoClick({node:_6f7});
}
}else{
this._publish("execute",{item:_6f7.item,node:_6f7,evt:e});
this.onClick(_6f7.item,_6f7,e);
this.focusNode(_6f7);
}
dojo.stopEvent(e);
},_onDblClick:function(_6fa,e){
var _6fb=e.target,_6fc=(_6fb==_6fa.expandoNode||_6fb==_6fa.expandoNodeText);
if((this.openOnDblClick&&_6fa.isExpandable)||_6fc){
if(_6fa.isExpandable){
this._onExpandoClick({node:_6fa});
}
}else{
this._publish("execute",{item:_6fa.item,node:_6fa,evt:e});
this.onDblClick(_6fa.item,_6fa,e);
this.focusNode(_6fa);
}
dojo.stopEvent(e);
},_onExpandoClick:function(_6fd){
var node=_6fd.node;
this.focusNode(node);
if(node.isExpanded){
this._collapseNode(node);
}else{
this._expandNode(node);
}
},onClick:function(item,node,evt){
},onDblClick:function(item,node,evt){
},onOpen:function(item,node){
},onClose:function(item,node){
},_getNextNode:function(node){
if(node.isExpandable&&node.isExpanded&&node.hasChildren()){
return node.getChildren()[0];
}else{
while(node&&node.isTreeNode){
var _6fe=node.getNextSibling();
if(_6fe){
return _6fe;
}
node=node.getParent();
}
return null;
}
},_getRootOrFirstNode:function(){
return this.showRoot?this.rootNode:this.rootNode.getChildren()[0];
},_collapseNode:function(node){
if(node._expandNodeDeferred){
delete node._expandNodeDeferred;
}
if(node.isExpandable){
if(node.state=="LOADING"){
return;
}
node.collapse();
this.onClose(node.item,node);
if(node.item){
this._state(node.item,false);
this._saveState();
}
}
},_expandNode:function(node,_6ff){
if(node._expandNodeDeferred&&!_6ff){
return node._expandNodeDeferred;
}
var _700=this.model,item=node.item,_701=this;
switch(node.state){
case "UNCHECKED":
node.markProcessing();
var def=(node._expandNodeDeferred=new dojo.Deferred());
_700.getChildren(item,function(_702){
node.unmarkProcessing();
var scid=node.setChildItems(_702);
var ed=_701._expandNode(node,true);
scid.addCallback(function(){
ed.addCallback(function(){
def.callback();
});
});
},function(err){
console.error(_701,": error loading root children: ",err);
});
break;
default:
def=(node._expandNodeDeferred=node.expand());
this.onOpen(node.item,node);
if(item){
this._state(item,true);
this._saveState();
}
}
return def;
},focusNode:function(node){
dijit.focus(node.labelNode);
},_onNodeFocus:function(node){
if(node&&node!=this.lastFocused){
if(this.lastFocused&&!this.lastFocused._destroyed){
this.lastFocused.setFocusable(false);
}
node.setFocusable(true);
this.lastFocused=node;
}
},_onNodeMouseEnter:function(node){
},_onNodeMouseLeave:function(node){
},_onItemChange:function(item){
var _703=this.model,_704=_703.getIdentity(item),_705=this._itemNodesMap[_704];
if(_705){
var _706=this.getLabel(item),_707=this.getTooltip(item);
dojo.forEach(_705,function(node){
node.set({item:item,label:_706,tooltip:_707});
node._updateItemClasses(item);
});
}
},_onItemChildrenChange:function(_708,_709){
var _70a=this.model,_70b=_70a.getIdentity(_708),_70c=this._itemNodesMap[_70b];
if(_70c){
dojo.forEach(_70c,function(_70d){
_70d.setChildItems(_709);
});
}
},_onItemDelete:function(item){
var _70e=this.model,_70f=_70e.getIdentity(item),_710=this._itemNodesMap[_70f];
if(_710){
dojo.forEach(_710,function(node){
var _711=node.getParent();
if(_711){
_711.removeChild(node);
}
node.destroyRecursive();
});
delete this._itemNodesMap[_70f];
}
},_initState:function(){
if(this.persist){
var _712=dojo.cookie(this.cookieName);
this._openedItemIds={};
if(_712){
dojo.forEach(_712.split(","),function(item){
this._openedItemIds[item]=true;
},this);
}
}
},_state:function(item,_713){
if(!this.persist){
return false;
}
var id=this.model.getIdentity(item);
if(arguments.length===1){
return this._openedItemIds[id];
}
if(_713){
this._openedItemIds[id]=true;
}else{
delete this._openedItemIds[id];
}
},_saveState:function(){
if(!this.persist){
return;
}
var ary=[];
for(var id in this._openedItemIds){
ary.push(id);
}
dojo.cookie(this.cookieName,ary.join(","),{expires:365});
},destroy:function(){
if(this._curSearch){
clearTimeout(this._curSearch.timer);
delete this._curSearch;
}
if(this.rootNode){
this.rootNode.destroyRecursive();
}
if(this.dndController&&!dojo.isString(this.dndController)){
this.dndController.destroy();
}
this.rootNode=null;
this.inherited(arguments);
},destroyRecursive:function(){
this.destroy();
},resize:function(_714){
if(_714){
dojo.marginBox(this.domNode,_714);
}
this._nodePixelIndent=dojo._getMarginSize(this.tree.indentDetector).w;
if(this.tree.rootNode){
this.tree.rootNode.set("indent",this.showRoot?0:-1);
}
},_createTreeNode:function(args){
return new dijit._TreeNode(args);
}});
}
if(!dojo._hasResource["dojox.xml.parser"]){
dojo._hasResource["dojox.xml.parser"]=true;
dojo.provide("dojox.xml.parser");
dojox.xml.parser.parse=function(str,_715){
var _716=dojo.doc;
var doc;
_715=_715||"text/xml";
if(str&&dojo.trim(str)&&"DOMParser" in dojo.global){
var _717=new DOMParser();
doc=_717.parseFromString(str,_715);
var de=doc.documentElement;
var _718="http://www.mozilla.org/newlayout/xml/parsererror.xml";
if(de.nodeName=="parsererror"&&de.namespaceURI==_718){
var _719=de.getElementsByTagNameNS(_718,"sourcetext")[0];
if(_719){
_719=_719.firstChild.data;
}
throw new Error("Error parsing text "+de.firstChild.data+" \n"+_719);
}
return doc;
}else{
if("ActiveXObject" in dojo.global){
var ms=function(n){
return "MSXML"+n+".DOMDocument";
};
var dp=["Microsoft.XMLDOM",ms(6),ms(4),ms(3),ms(2)];
dojo.some(dp,function(p){
try{
doc=new ActiveXObject(p);
}
catch(e){
return false;
}
return true;
});
if(str&&doc){
doc.async=false;
doc.loadXML(str);
var pe=doc.parseError;
if(pe.errorCode!==0){
throw new Error("Line: "+pe.line+"\n"+"Col: "+pe.linepos+"\n"+"Reason: "+pe.reason+"\n"+"Error Code: "+pe.errorCode+"\n"+"Source: "+pe.srcText);
}
}
if(doc){
return doc;
}
}else{
if(_716.implementation&&_716.implementation.createDocument){
if(str&&dojo.trim(str)&&_716.createElement){
var tmp=_716.createElement("xml");
tmp.innerHTML=str;
var _71a=_716.implementation.createDocument("foo","",null);
dojo.forEach(tmp.childNodes,function(_71b){
_71a.importNode(_71b,true);
});
return _71a;
}else{
return _716.implementation.createDocument("","",null);
}
}
}
}
return null;
};
dojox.xml.parser.textContent=function(node,text){
if(arguments.length>1){
var _71c=node.ownerDocument||dojo.doc;
dojox.xml.parser.replaceChildren(node,_71c.createTextNode(text));
return text;
}else{
if(node.textContent!==undefined){
return node.textContent;
}
var _71d="";
if(node){
dojo.forEach(node.childNodes,function(_71e){
switch(_71e.nodeType){
case 1:
case 5:
_71d+=dojox.xml.parser.textContent(_71e);
break;
case 3:
case 2:
case 4:
_71d+=_71e.nodeValue;
}
});
}
return _71d;
}
};
dojox.xml.parser.replaceChildren=function(node,_71f){
var _720=[];
if(dojo.isIE){
dojo.forEach(node.childNodes,function(_721){
_720.push(_721);
});
}
dojox.xml.parser.removeChildren(node);
dojo.forEach(_720,dojo.destroy);
if(!dojo.isArray(_71f)){
node.appendChild(_71f);
}else{
dojo.forEach(_71f,function(_722){
node.appendChild(_722);
});
}
};
dojox.xml.parser.removeChildren=function(node){
var _723=node.childNodes.length;
while(node.hasChildNodes()){
node.removeChild(node.firstChild);
}
return _723;
};
dojox.xml.parser.innerXML=function(node){
if(node.innerXML){
return node.innerXML;
}else{
if(node.xml){
return node.xml;
}else{
if(typeof XMLSerializer!="undefined"){
return (new XMLSerializer()).serializeToString(node);
}
}
}
return null;
};
}
if(!dojo._hasResource["dojox.data.dom"]){
dojo._hasResource["dojox.data.dom"]=true;
dojo.provide("dojox.data.dom");
dojo.deprecated("dojox.data.dom","Use dojox.xml.parser instead.","2.0");
dojox.data.dom.createDocument=function(str,_724){
dojo.deprecated("dojox.data.dom.createDocument()","Use dojox.xml.parser.parse() instead.","2.0");
try{
return dojox.xml.parser.parse(str,_724);
}
catch(e){
return null;
}
};
dojox.data.dom.textContent=function(node,text){
dojo.deprecated("dojox.data.dom.textContent()","Use dojox.xml.parser.textContent() instead.","2.0");
if(arguments.length>1){
return dojox.xml.parser.textContent(node,text);
}else{
return dojox.xml.parser.textContent(node);
}
};
dojox.data.dom.replaceChildren=function(node,_725){
dojo.deprecated("dojox.data.dom.replaceChildren()","Use dojox.xml.parser.replaceChildren() instead.","2.0");
dojox.xml.parser.replaceChildren(node,_725);
};
dojox.data.dom.removeChildren=function(node){
dojo.deprecated("dojox.data.dom.removeChildren()","Use dojox.xml.parser.removeChildren() instead.","2.0");
return dojox.xml.parser.removeChildren(node);
};
dojox.data.dom.innerXML=function(node){
dojo.deprecated("dojox.data.dom.innerXML()","Use dojox.xml.parser.innerXML() instead.","2.0");
return dojox.xml.parser.innerXML(node);
};
}
if(!dojo._hasResource["dojox.data.XmlStore"]){
dojo._hasResource["dojox.data.XmlStore"]=true;
dojo.provide("dojox.data.XmlStore");
dojo.provide("dojox.data.XmlItem");
dojo.declare("dojox.data.XmlStore",null,{constructor:function(args){
if(args){
this.url=args.url;
this.rootItem=(args.rootItem||args.rootitem||this.rootItem);
this.keyAttribute=(args.keyAttribute||args.keyattribute||this.keyAttribute);
this._attributeMap=(args.attributeMap||args.attributemap);
this.label=args.label||this.label;
this.sendQuery=(args.sendQuery||args.sendquery||this.sendQuery);
if("urlPreventCache" in args){
this.urlPreventCache=args.urlPreventCache?true:false;
}
}
this._newItems=[];
this._deletedItems=[];
this._modifiedItems=[];
},url:"",rootItem:"",keyAttribute:"",label:"",sendQuery:false,attributeMap:null,urlPreventCache:true,getValue:function(item,_726,_727){
var _728=item.element;
var i;
var node;
if(_726==="tagName"){
return _728.nodeName;
}else{
if(_726==="childNodes"){
for(i=0;i<_728.childNodes.length;i++){
node=_728.childNodes[i];
if(node.nodeType===1){
return this._getItem(node);
}
}
return _727;
}else{
if(_726==="text()"){
for(i=0;i<_728.childNodes.length;i++){
node=_728.childNodes[i];
if(node.nodeType===3||node.nodeType===4){
return node.nodeValue;
}
}
return _727;
}else{
_726=this._getAttribute(_728.nodeName,_726);
if(_726.charAt(0)==="@"){
var name=_726.substring(1);
var _729=_728.getAttribute(name);
return (_729)?_729:_727;
}else{
for(i=0;i<_728.childNodes.length;i++){
node=_728.childNodes[i];
if(node.nodeType===1&&node.nodeName===_726){
return this._getItem(node);
}
}
return _727;
}
}
}
}
},getValues:function(item,_72a){
var _72b=item.element;
var _72c=[];
var i;
var node;
if(_72a==="tagName"){
return [_72b.nodeName];
}else{
if(_72a==="childNodes"){
for(i=0;i<_72b.childNodes.length;i++){
node=_72b.childNodes[i];
if(node.nodeType===1){
_72c.push(this._getItem(node));
}
}
return _72c;
}else{
if(_72a==="text()"){
var ec=_72b.childNodes;
for(i=0;i<ec.length;i++){
node=ec[i];
if(node.nodeType===3||node.nodeType===4){
_72c.push(node.nodeValue);
}
}
return _72c;
}else{
_72a=this._getAttribute(_72b.nodeName,_72a);
if(_72a.charAt(0)==="@"){
var name=_72a.substring(1);
var _72d=_72b.getAttribute(name);
return (_72d!==undefined)?[_72d]:[];
}else{
for(i=0;i<_72b.childNodes.length;i++){
node=_72b.childNodes[i];
if(node.nodeType===1&&node.nodeName===_72a){
_72c.push(this._getItem(node));
}
}
return _72c;
}
}
}
}
},getAttributes:function(item){
var _72e=item.element;
var _72f=[];
var i;
_72f.push("tagName");
if(_72e.childNodes.length>0){
var _730={};
var _731=true;
var text=false;
for(i=0;i<_72e.childNodes.length;i++){
var node=_72e.childNodes[i];
if(node.nodeType===1){
var name=node.nodeName;
if(!_730[name]){
_72f.push(name);
_730[name]=name;
}
_731=true;
}else{
if(node.nodeType===3){
text=true;
}
}
}
if(_731){
_72f.push("childNodes");
}
if(text){
_72f.push("text()");
}
}
for(i=0;i<_72e.attributes.length;i++){
_72f.push("@"+_72e.attributes[i].nodeName);
}
if(this._attributeMap){
for(var key in this._attributeMap){
i=key.indexOf(".");
if(i>0){
var _732=key.substring(0,i);
if(_732===_72e.nodeName){
_72f.push(key.substring(i+1));
}
}else{
_72f.push(key);
}
}
}
return _72f;
},hasAttribute:function(item,_733){
return (this.getValue(item,_733)!==undefined);
},containsValue:function(item,_734,_735){
var _736=this.getValues(item,_734);
for(var i=0;i<_736.length;i++){
if((typeof _735==="string")){
if(_736[i].toString&&_736[i].toString()===_735){
return true;
}
}else{
if(_736[i]===_735){
return true;
}
}
}
return false;
},isItem:function(_737){
if(_737&&_737.element&&_737.store&&_737.store===this){
return true;
}
return false;
},isItemLoaded:function(_738){
return this.isItem(_738);
},loadItem:function(_739){
},getFeatures:function(){
var _73a={"dojo.data.api.Read":true,"dojo.data.api.Write":true};
if(!this.sendQuery||this.keyAttribute!==""){
_73a["dojo.data.api.Identity"]=true;
}
return _73a;
},getLabel:function(item){
if((this.label!=="")&&this.isItem(item)){
var _73b=this.getValue(item,this.label);
if(_73b){
return _73b.toString();
}
}
return undefined;
},getLabelAttributes:function(item){
if(this.label!==""){
return [this.label];
}
return null;
},_fetchItems:function(_73c,_73d,_73e){
var url=this._getFetchUrl(_73c);
console.log("XmlStore._fetchItems(): url="+url);
if(!url){
_73e(new Error("No URL specified."));
return;
}
var _73f=(!this.sendQuery?_73c:{});
var self=this;
var _740={url:url,handleAs:"xml",preventCache:self.urlPreventCache};
var _741=dojo.xhrGet(_740);
_741.addCallback(function(data){
var _742=self._getItems(data,_73f);
console.log("XmlStore._fetchItems(): length="+(_742?_742.length:0));
if(_742&&_742.length>0){
_73d(_742,_73c);
}else{
_73d([],_73c);
}
});
_741.addErrback(function(data){
_73e(data,_73c);
});
},_getFetchUrl:function(_743){
if(!this.sendQuery){
return this.url;
}
var _744=_743.query;
if(!_744){
return this.url;
}
if(dojo.isString(_744)){
return this.url+_744;
}
var _745="";
for(var name in _744){
var _746=_744[name];
if(_746){
if(_745){
_745+="&";
}
_745+=(name+"="+_746);
}
}
if(!_745){
return this.url;
}
var _747=this.url;
if(_747.indexOf("?")<0){
_747+="?";
}else{
_747+="&";
}
return _747+_745;
},_getItems:function(_748,_749){
var _74a=null;
if(_749){
_74a=_749.query;
}
var _74b=[];
var _74c=null;
if(this.rootItem!==""){
_74c=dojo.query(this.rootItem,_748);
}else{
_74c=_748.documentElement.childNodes;
}
var deep=_749.queryOptions?_749.queryOptions.deep:false;
if(deep){
_74c=this._flattenNodes(_74c);
}
for(var i=0;i<_74c.length;i++){
var node=_74c[i];
if(node.nodeType!=1){
continue;
}
var item=this._getItem(node);
if(_74a){
var _74d=_749.queryOptions?_749.queryOptions.ignoreCase:false;
var _74e;
var _74f=false;
var j;
var _750=true;
var _751={};
for(var key in _74a){
_74e=_74a[key];
if(typeof _74e==="string"){
_751[key]=dojo.data.util.filter.patternToRegExp(_74e,_74d);
}
}
for(var _752 in _74a){
_750=false;
var _753=this.getValues(item,_752);
for(j=0;j<_753.length;j++){
_74e=_753[j];
if(_74e){
var _754=_74a[_752];
if((typeof _74e)==="string"&&(_751[_752])){
if((_74e.match(_751[_752]))!==null){
_74f=true;
}else{
_74f=false;
}
}else{
if((typeof _74e)==="object"){
if(_74e.toString&&(_751[_752])){
var _755=_74e.toString();
if((_755.match(_751[_752]))!==null){
_74f=true;
}else{
_74f=false;
}
}else{
if(_754==="*"||_754===_74e){
_74f=true;
}else{
_74f=false;
}
}
}
}
}
if(_74f){
break;
}
}
if(!_74f){
break;
}
}
if(_750||_74f){
_74b.push(item);
}
}else{
_74b.push(item);
}
}
dojo.forEach(_74b,function(item){
if(item.element.parentNode){
item.element.parentNode.removeChild(item.element);
}
},this);
return _74b;
},_flattenNodes:function(_756){
var _757=[];
if(_756){
var i;
for(i=0;i<_756.length;i++){
var node=_756[i];
_757.push(node);
if(node.childNodes&&node.childNodes.length>0){
_757=_757.concat(this._flattenNodes(node.childNodes));
}
}
}
return _757;
},close:function(_758){
},newItem:function(_759,_75a){
console.log("XmlStore.newItem()");
_759=(_759||{});
var _75b=_759.tagName;
if(!_75b){
_75b=this.rootItem;
if(_75b===""){
return null;
}
}
var _75c=this._getDocument();
var _75d=_75c.createElement(_75b);
for(var _75e in _759){
var text;
if(_75e==="tagName"){
continue;
}else{
if(_75e==="text()"){
text=_75c.createTextNode(_759[_75e]);
_75d.appendChild(text);
}else{
_75e=this._getAttribute(_75b,_75e);
if(_75e.charAt(0)==="@"){
var name=_75e.substring(1);
_75d.setAttribute(name,_759[_75e]);
}else{
var _75f=_75c.createElement(_75e);
text=_75c.createTextNode(_759[_75e]);
_75f.appendChild(text);
_75d.appendChild(_75f);
}
}
}
}
var item=this._getItem(_75d);
this._newItems.push(item);
var _760=null;
if(_75a&&_75a.parent&&_75a.attribute){
_760={item:_75a.parent,attribute:_75a.attribute,oldValue:undefined};
var _761=this.getValues(_75a.parent,_75a.attribute);
if(_761&&_761.length>0){
var _762=_761.slice(0,_761.length);
if(_761.length===1){
_760.oldValue=_761[0];
}else{
_760.oldValue=_761.slice(0,_761.length);
}
_762.push(item);
this.setValues(_75a.parent,_75a.attribute,_762);
_760.newValue=this.getValues(_75a.parent,_75a.attribute);
}else{
this.setValues(_75a.parent,_75a.attribute,item);
_760.newValue=item;
}
}
return item;
},deleteItem:function(item){
console.log("XmlStore.deleteItem()");
var _763=item.element;
if(_763.parentNode){
this._backupItem(item);
_763.parentNode.removeChild(_763);
return true;
}
this._forgetItem(item);
this._deletedItems.push(item);
return true;
},setValue:function(item,_764,_765){
if(_764==="tagName"){
return false;
}
this._backupItem(item);
var _766=item.element;
var _767;
var text;
if(_764==="childNodes"){
_767=_765.element;
_766.appendChild(_767);
}else{
if(_764==="text()"){
while(_766.firstChild){
_766.removeChild(_766.firstChild);
}
text=this._getDocument(_766).createTextNode(_765);
_766.appendChild(text);
}else{
_764=this._getAttribute(_766.nodeName,_764);
if(_764.charAt(0)==="@"){
var name=_764.substring(1);
_766.setAttribute(name,_765);
}else{
for(var i=0;i<_766.childNodes.length;i++){
var node=_766.childNodes[i];
if(node.nodeType===1&&node.nodeName===_764){
_767=node;
break;
}
}
var _768=this._getDocument(_766);
if(_767){
while(_767.firstChild){
_767.removeChild(_767.firstChild);
}
}else{
_767=_768.createElement(_764);
_766.appendChild(_767);
}
text=_768.createTextNode(_765);
_767.appendChild(text);
}
}
}
return true;
},setValues:function(item,_769,_76a){
if(_769==="tagName"){
return false;
}
this._backupItem(item);
var _76b=item.element;
var i;
var _76c;
var text;
if(_769==="childNodes"){
while(_76b.firstChild){
_76b.removeChild(_76b.firstChild);
}
for(i=0;i<_76a.length;i++){
_76c=_76a[i].element;
_76b.appendChild(_76c);
}
}else{
if(_769==="text()"){
while(_76b.firstChild){
_76b.removeChild(_76b.firstChild);
}
var _76d="";
for(i=0;i<_76a.length;i++){
_76d+=_76a[i];
}
text=this._getDocument(_76b).createTextNode(_76d);
_76b.appendChild(text);
}else{
_769=this._getAttribute(_76b.nodeName,_769);
if(_769.charAt(0)==="@"){
var name=_769.substring(1);
_76b.setAttribute(name,_76a[0]);
}else{
for(i=_76b.childNodes.length-1;i>=0;i--){
var node=_76b.childNodes[i];
if(node.nodeType===1&&node.nodeName===_769){
_76b.removeChild(node);
}
}
var _76e=this._getDocument(_76b);
for(i=0;i<_76a.length;i++){
_76c=_76e.createElement(_769);
text=_76e.createTextNode(_76a[i]);
_76c.appendChild(text);
_76b.appendChild(_76c);
}
}
}
}
return true;
},unsetAttribute:function(item,_76f){
if(_76f==="tagName"){
return false;
}
this._backupItem(item);
var _770=item.element;
if(_76f==="childNodes"||_76f==="text()"){
while(_770.firstChild){
_770.removeChild(_770.firstChild);
}
}else{
_76f=this._getAttribute(_770.nodeName,_76f);
if(_76f.charAt(0)==="@"){
var name=_76f.substring(1);
_770.removeAttribute(name);
}else{
for(var i=_770.childNodes.length-1;i>=0;i--){
var node=_770.childNodes[i];
if(node.nodeType===1&&node.nodeName===_76f){
_770.removeChild(node);
}
}
}
}
return true;
},save:function(_771){
if(!_771){
_771={};
}
var i;
for(i=0;i<this._modifiedItems.length;i++){
this._saveItem(this._modifiedItems[i],_771,"PUT");
}
for(i=0;i<this._newItems.length;i++){
var item=this._newItems[i];
if(item.element.parentNode){
this._newItems.splice(i,1);
i--;
continue;
}
this._saveItem(this._newItems[i],_771,"POST");
}
for(i=0;i<this._deletedItems.length;i++){
this._saveItem(this._deletedItems[i],_771,"DELETE");
}
},revert:function(){
console.log("XmlStore.revert() _newItems="+this._newItems.length);
console.log("XmlStore.revert() _deletedItems="+this._deletedItems.length);
console.log("XmlStore.revert() _modifiedItems="+this._modifiedItems.length);
this._newItems=[];
this._restoreItems(this._deletedItems);
this._deletedItems=[];
this._restoreItems(this._modifiedItems);
this._modifiedItems=[];
return true;
},isDirty:function(item){
if(item){
var _772=this._getRootElement(item.element);
return (this._getItemIndex(this._newItems,_772)>=0||this._getItemIndex(this._deletedItems,_772)>=0||this._getItemIndex(this._modifiedItems,_772)>=0);
}else{
return (this._newItems.length>0||this._deletedItems.length>0||this._modifiedItems.length>0);
}
},_saveItem:function(item,_773,_774){
var url;
var _775;
if(_774==="PUT"){
url=this._getPutUrl(item);
}else{
if(_774==="DELETE"){
url=this._getDeleteUrl(item);
}else{
url=this._getPostUrl(item);
}
}
if(!url){
if(_773.onError){
_775=_773.scope||dojo.global;
_773.onError.call(_775,new Error("No URL for saving content: "+this._getPostContent(item)));
}
return;
}
var _776={url:url,method:(_774||"POST"),contentType:"text/xml",handleAs:"xml"};
var _777;
if(_774==="PUT"){
_776.putData=this._getPutContent(item);
_777=dojo.rawXhrPut(_776);
}else{
if(_774==="DELETE"){
_777=dojo.xhrDelete(_776);
}else{
_776.postData=this._getPostContent(item);
_777=dojo.rawXhrPost(_776);
}
}
_775=(_773.scope||dojo.global);
var self=this;
_777.addCallback(function(data){
self._forgetItem(item);
if(_773.onComplete){
_773.onComplete.call(_775);
}
});
_777.addErrback(function(_778){
if(_773.onError){
_773.onError.call(_775,_778);
}
});
},_getPostUrl:function(item){
return this.url;
},_getPutUrl:function(item){
return this.url;
},_getDeleteUrl:function(item){
var url=this.url;
if(item&&this.keyAttribute!==""){
var _779=this.getValue(item,this.keyAttribute);
if(_779){
var key=this.keyAttribute.charAt(0)==="@"?this.keyAttribute.substring(1):this.keyAttribute;
url+=url.indexOf("?")<0?"?":"&";
url+=key+"="+_779;
}
}
return url;
},_getPostContent:function(item){
var _77a=item.element;
var _77b="<?xml version=\"1.0\"?>";
return _77b+dojox.xml.parser.innerXML(_77a);
},_getPutContent:function(item){
var _77c=item.element;
var _77d="<?xml version=\"1.0\"?>";
return _77d+dojox.xml.parser.innerXML(_77c);
},_getAttribute:function(_77e,_77f){
if(this._attributeMap){
var key=_77e+"."+_77f;
var _780=this._attributeMap[key];
if(_780){
_77f=_780;
}else{
_780=this._attributeMap[_77f];
if(_780){
_77f=_780;
}
}
}
return _77f;
},_getItem:function(_781){
try{
var q=null;
if(this.keyAttribute===""){
q=this._getXPath(_781);
}
return new dojox.data.XmlItem(_781,this,q);
}
catch(e){
console.log(e);
}
return null;
},_getItemIndex:function(_782,_783){
for(var i=0;i<_782.length;i++){
if(_782[i].element===_783){
return i;
}
}
return -1;
},_backupItem:function(item){
var _784=this._getRootElement(item.element);
if(this._getItemIndex(this._newItems,_784)>=0||this._getItemIndex(this._modifiedItems,_784)>=0){
return;
}
if(_784!=item.element){
item=this._getItem(_784);
}
item._backup=_784.cloneNode(true);
this._modifiedItems.push(item);
},_restoreItems:function(_785){
dojo.forEach(_785,function(item){
if(item._backup){
item.element=item._backup;
item._backup=null;
}
},this);
},_forgetItem:function(item){
var _786=item.element;
var _787=this._getItemIndex(this._newItems,_786);
if(_787>=0){
this._newItems.splice(_787,1);
}
_787=this._getItemIndex(this._deletedItems,_786);
if(_787>=0){
this._deletedItems.splice(_787,1);
}
_787=this._getItemIndex(this._modifiedItems,_786);
if(_787>=0){
this._modifiedItems.splice(_787,1);
}
},_getDocument:function(_788){
if(_788){
return _788.ownerDocument;
}else{
if(!this._document){
return dojox.xml.parser.parse();
}
}
return null;
},_getRootElement:function(_789){
while(_789.parentNode){
_789=_789.parentNode;
}
return _789;
},_getXPath:function(_78a){
var _78b=null;
if(!this.sendQuery){
var node=_78a;
_78b="";
while(node&&node!=_78a.ownerDocument){
var pos=0;
var _78c=node;
var name=node.nodeName;
while(_78c){
_78c=_78c.previousSibling;
if(_78c&&_78c.nodeName===name){
pos++;
}
}
var temp="/"+name+"["+pos+"]";
if(_78b){
_78b=temp+_78b;
}else{
_78b=temp;
}
node=node.parentNode;
}
}
return _78b;
},getIdentity:function(item){
if(!this.isItem(item)){
throw new Error("dojox.data.XmlStore: Object supplied to getIdentity is not an item");
}else{
var id=null;
if(this.sendQuery&&this.keyAttribute!==""){
id=this.getValue(item,this.keyAttribute).toString();
}else{
if(!this.serverQuery){
if(this.keyAttribute!==""){
id=this.getValue(item,this.keyAttribute).toString();
}else{
id=item.q;
}
}
}
return id;
}
},getIdentityAttributes:function(item){
if(!this.isItem(item)){
throw new Error("dojox.data.XmlStore: Object supplied to getIdentity is not an item");
}else{
if(this.keyAttribute!==""){
return [this.keyAttribute];
}else{
return null;
}
}
},fetchItemByIdentity:function(_78d){
var _78e=null;
var _78f=null;
var self=this;
var url=null;
var _790=null;
var _791=null;
if(!self.sendQuery){
_78e=function(data){
if(data){
if(self.keyAttribute!==""){
var _792={};
_792.query={};
_792.query[self.keyAttribute]=_78d.identity;
_792.queryOptions={deep:true};
var _793=self._getItems(data,_792);
_78f=_78d.scope||dojo.global;
if(_793.length===1){
if(_78d.onItem){
_78d.onItem.call(_78f,_793[0]);
}
}else{
if(_793.length===0){
if(_78d.onItem){
_78d.onItem.call(_78f,null);
}
}else{
if(_78d.onError){
_78d.onError.call(_78f,new Error("Items array size for identity lookup greater than 1, invalid keyAttribute."));
}
}
}
}else{
var _794=_78d.identity.split("/");
var i;
var node=data;
for(i=0;i<_794.length;i++){
if(_794[i]&&_794[i]!==""){
var _795=_794[i];
_795=_795.substring(0,_795.length-1);
var vals=_795.split("[");
var tag=vals[0];
var _796=parseInt(vals[1],10);
var pos=0;
if(node){
var _797=node.childNodes;
if(_797){
var j;
var _798=null;
for(j=0;j<_797.length;j++){
var _799=_797[j];
if(_799.nodeName===tag){
if(pos<_796){
pos++;
}else{
_798=_799;
break;
}
}
}
if(_798){
node=_798;
}else{
node=null;
}
}else{
node=null;
}
}else{
break;
}
}
}
var item=null;
if(node){
item=self._getItem(node);
if(item.element.parentNode){
item.element.parentNode.removeChild(item.element);
}
}
if(_78d.onItem){
_78f=_78d.scope||dojo.global;
_78d.onItem.call(_78f,item);
}
}
}
};
url=this._getFetchUrl(null);
_790={url:url,handleAs:"xml",preventCache:self.urlPreventCache};
_791=dojo.xhrGet(_790);
_791.addCallback(_78e);
if(_78d.onError){
_791.addErrback(function(_79a){
var s=_78d.scope||dojo.global;
_78d.onError.call(s,_79a);
});
}
}else{
if(self.keyAttribute!==""){
var _79b={query:{}};
_79b.query[self.keyAttribute]=_78d.identity;
url=this._getFetchUrl(_79b);
_78e=function(data){
var item=null;
if(data){
var _79c=self._getItems(data,{});
if(_79c.length===1){
item=_79c[0];
}else{
if(_78d.onError){
var _79d=_78d.scope||dojo.global;
_78d.onError.call(_79d,new Error("More than one item was returned from the server for the denoted identity"));
}
}
}
if(_78d.onItem){
_79d=_78d.scope||dojo.global;
_78d.onItem.call(_79d,item);
}
};
_790={url:url,handleAs:"xml",preventCache:self.urlPreventCache};
_791=dojo.xhrGet(_790);
_791.addCallback(_78e);
if(_78d.onError){
_791.addErrback(function(_79e){
var s=_78d.scope||dojo.global;
_78d.onError.call(s,_79e);
});
}
}else{
if(_78d.onError){
var s=_78d.scope||dojo.global;
_78d.onError.call(s,new Error("XmlStore is not told that the server to provides identity support.  No keyAttribute specified."));
}
}
}
}});
dojo.declare("dojox.data.XmlItem",null,{constructor:function(_79f,_7a0,_7a1){
this.element=_79f;
this.store=_7a0;
this.q=_7a1;
},toString:function(){
var str="";
if(this.element){
for(var i=0;i<this.element.childNodes.length;i++){
var node=this.element.childNodes[i];
if(node.nodeType===3||node.nodeType===4){
str+=node.nodeValue;
}
}
}
return str;
}});
dojo.extend(dojox.data.XmlStore,dojo.data.util.simpleFetch);
}
if(!dojo._hasResource["dojox.data.QueryReadStore"]){
dojo._hasResource["dojox.data.QueryReadStore"]=true;
dojo.provide("dojox.data.QueryReadStore");
dojo.declare("dojox.data.QueryReadStore",null,{url:"",requestMethod:"get",_className:"dojox.data.QueryReadStore",_items:[],_lastServerQuery:null,_numRows:-1,lastRequestHash:null,doClientPaging:false,doClientSorting:false,_itemsByIdentity:null,_identifier:null,_features:{"dojo.data.api.Read":true,"dojo.data.api.Identity":true},_labelAttr:"label",constructor:function(_7a2){
dojo.mixin(this,_7a2);
},getValue:function(item,_7a3,_7a4){
this._assertIsItem(item);
if(!dojo.isString(_7a3)){
throw new Error(this._className+".getValue(): Invalid attribute, string expected!");
}
if(!this.hasAttribute(item,_7a3)){
if(_7a4){
return _7a4;
}
}
return item.i[_7a3];
},getValues:function(item,_7a5){
this._assertIsItem(item);
var ret=[];
if(this.hasAttribute(item,_7a5)){
ret.push(item.i[_7a5]);
}
return ret;
},getAttributes:function(item){
this._assertIsItem(item);
var ret=[];
for(var i in item.i){
ret.push(i);
}
return ret;
},hasAttribute:function(item,_7a6){
return this.isItem(item)&&typeof item.i[_7a6]!="undefined";
},containsValue:function(item,_7a7,_7a8){
var _7a9=this.getValues(item,_7a7);
var len=_7a9.length;
for(var i=0;i<len;i++){
if(_7a9[i]==_7a8){
return true;
}
}
return false;
},isItem:function(_7aa){
if(_7aa){
return typeof _7aa.r!="undefined"&&_7aa.r==this;
}
return false;
},isItemLoaded:function(_7ab){
return this.isItem(_7ab);
},loadItem:function(args){
if(this.isItemLoaded(args.item)){
return;
}
},fetch:function(_7ac){
_7ac=_7ac||{};
if(!_7ac.store){
_7ac.store=this;
}
var self=this;
var _7ad=function(_7ae,_7af){
if(_7af.onError){
var _7b0=_7af.scope||dojo.global;
_7af.onError.call(_7b0,_7ae,_7af);
}
};
var _7b1=function(_7b2,_7b3,_7b4){
var _7b5=_7b3.abort||null;
var _7b6=false;
var _7b7=_7b3.start?_7b3.start:0;
if(self.doClientPaging==false){
_7b7=0;
}
var _7b8=_7b3.count?(_7b7+_7b3.count):_7b2.length;
_7b3.abort=function(){
_7b6=true;
if(_7b5){
_7b5.call(_7b3);
}
};
var _7b9=_7b3.scope||dojo.global;
if(!_7b3.store){
_7b3.store=self;
}
if(_7b3.onBegin){
_7b3.onBegin.call(_7b9,_7b4,_7b3);
}
if(_7b3.sort&&self.doClientSorting){
_7b2.sort(dojo.data.util.sorter.createSortFunction(_7b3.sort,self));
}
if(_7b3.onItem){
for(var i=_7b7;(i<_7b2.length)&&(i<_7b8);++i){
var item=_7b2[i];
if(!_7b6){
_7b3.onItem.call(_7b9,item,_7b3);
}
}
}
if(_7b3.onComplete&&!_7b6){
var _7ba=null;
if(!_7b3.onItem){
_7ba=_7b2.slice(_7b7,_7b8);
}
_7b3.onComplete.call(_7b9,_7ba,_7b3);
}
};
this._fetchItems(_7ac,_7b1,_7ad);
return _7ac;
},getFeatures:function(){
return this._features;
},close:function(_7bb){
},getLabel:function(item){
if(this._labelAttr&&this.isItem(item)){
return this.getValue(item,this._labelAttr);
}
return undefined;
},getLabelAttributes:function(item){
if(this._labelAttr){
return [this._labelAttr];
}
return null;
},_xhrFetchHandler:function(data,_7bc,_7bd,_7be){
data=this._filterResponse(data);
if(data.label){
this._labelAttr=data.label;
}
var _7bf=data.numRows||-1;
this._items=[];
dojo.forEach(data.items,function(e){
this._items.push({i:e,r:this});
},this);
var _7c0=data.identifier;
this._itemsByIdentity={};
if(_7c0){
this._identifier=_7c0;
var i;
for(i=0;i<this._items.length;++i){
var item=this._items[i].i;
var _7c1=item[_7c0];
if(!this._itemsByIdentity[_7c1]){
this._itemsByIdentity[_7c1]=item;
}else{
throw new Error(this._className+":  The json data as specified by: ["+this.url+"] is malformed.  Items within the list have identifier: ["+_7c0+"].  Value collided: ["+_7c1+"]");
}
}
}else{
this._identifier=Number;
for(i=0;i<this._items.length;++i){
this._items[i].n=i;
}
}
_7bf=this._numRows=(_7bf===-1)?this._items.length:_7bf;
_7bd(this._items,_7bc,_7bf);
this._numRows=_7bf;
},_fetchItems:function(_7c2,_7c3,_7c4){
var _7c5=_7c2.serverQuery||_7c2.query||{};
if(!this.doClientPaging){
_7c5.start=_7c2.start||0;
if(_7c2.count){
_7c5.count=_7c2.count;
}
}
if(!this.doClientSorting&&_7c2.sort){
var _7c6=[];
dojo.forEach(_7c2.sort,function(sort){
if(sort&&sort.attribute){
_7c6.push((sort.descending?"-":"")+sort.attribute);
}
});
_7c5.sort=_7c6.join(",");
}
if(this.doClientPaging&&this._lastServerQuery!==null&&dojo.toJson(_7c5)==dojo.toJson(this._lastServerQuery)){
this._numRows=(this._numRows===-1)?this._items.length:this._numRows;
_7c3(this._items,_7c2,this._numRows);
}else{
var _7c7=this.requestMethod.toLowerCase()=="post"?dojo.xhrPost:dojo.xhrGet;
var _7c8=_7c7({url:this.url,handleAs:"json-comment-optional",content:_7c5,failOk:true});
_7c2.abort=function(){
_7c8.cancel();
};
_7c8.addCallback(dojo.hitch(this,function(data){
this._xhrFetchHandler(data,_7c2,_7c3,_7c4);
}));
_7c8.addErrback(function(_7c9){
_7c4(_7c9,_7c2);
});
this.lastRequestHash=new Date().getTime()+"-"+String(Math.random()).substring(2);
this._lastServerQuery=dojo.mixin({},_7c5);
}
},_filterResponse:function(data){
return data;
},_assertIsItem:function(item){
if(!this.isItem(item)){
throw new Error(this._className+": Invalid item argument.");
}
},_assertIsAttribute:function(_7ca){
if(typeof _7ca!=="string"){
throw new Error(this._className+": Invalid attribute argument ('"+_7ca+"').");
}
},fetchItemByIdentity:function(_7cb){
if(this._itemsByIdentity){
var item=this._itemsByIdentity[_7cb.identity];
if(!(item===undefined)){
if(_7cb.onItem){
var _7cc=_7cb.scope?_7cb.scope:dojo.global;
_7cb.onItem.call(_7cc,{i:item,r:this});
}
return;
}
}
var _7cd=function(_7ce,_7cf){
var _7d0=_7cb.scope?_7cb.scope:dojo.global;
if(_7cb.onError){
_7cb.onError.call(_7d0,_7ce);
}
};
var _7d1=function(_7d2,_7d3){
var _7d4=_7cb.scope?_7cb.scope:dojo.global;
try{
var item=null;
if(_7d2&&_7d2.length==1){
item=_7d2[0];
}
if(_7cb.onItem){
_7cb.onItem.call(_7d4,item);
}
}
catch(error){
if(_7cb.onError){
_7cb.onError.call(_7d4,error);
}
}
};
var _7d5={serverQuery:{id:_7cb.identity}};
this._fetchItems(_7d5,_7d1,_7cd);
},getIdentity:function(item){
var _7d6=null;
if(this._identifier===Number){
_7d6=item.n;
}else{
_7d6=item.i[this._identifier];
}
return _7d6;
},getIdentityAttributes:function(item){
return [this._identifier];
}});
}
if(!dojo._hasResource["dojox.gfx.matrix"]){
dojo._hasResource["dojox.gfx.matrix"]=true;
dojo.provide("dojox.gfx.matrix");
(function(){
var m=dojox.gfx.matrix;
var _7d7={};
m._degToRad=function(_7d8){
return _7d7[_7d8]||(_7d7[_7d8]=(Math.PI*_7d8/180));
};
m._radToDeg=function(_7d9){
return _7d9/Math.PI*180;
};
m.Matrix2D=function(arg){
if(arg){
if(typeof arg=="number"){
this.xx=this.yy=arg;
}else{
if(arg instanceof Array){
if(arg.length>0){
var _7da=m.normalize(arg[0]);
for(var i=1;i<arg.length;++i){
var l=_7da,r=dojox.gfx.matrix.normalize(arg[i]);
_7da=new m.Matrix2D();
_7da.xx=l.xx*r.xx+l.xy*r.yx;
_7da.xy=l.xx*r.xy+l.xy*r.yy;
_7da.yx=l.yx*r.xx+l.yy*r.yx;
_7da.yy=l.yx*r.xy+l.yy*r.yy;
_7da.dx=l.xx*r.dx+l.xy*r.dy+l.dx;
_7da.dy=l.yx*r.dx+l.yy*r.dy+l.dy;
}
dojo.mixin(this,_7da);
}
}else{
dojo.mixin(this,arg);
}
}
}
};
dojo.extend(m.Matrix2D,{xx:1,xy:0,yx:0,yy:1,dx:0,dy:0});
dojo.mixin(m,{identity:new m.Matrix2D(),flipX:new m.Matrix2D({xx:-1}),flipY:new m.Matrix2D({yy:-1}),flipXY:new m.Matrix2D({xx:-1,yy:-1}),translate:function(a,b){
if(arguments.length>1){
return new m.Matrix2D({dx:a,dy:b});
}
return new m.Matrix2D({dx:a.x,dy:a.y});
},scale:function(a,b){
if(arguments.length>1){
return new m.Matrix2D({xx:a,yy:b});
}
if(typeof a=="number"){
return new m.Matrix2D({xx:a,yy:a});
}
return new m.Matrix2D({xx:a.x,yy:a.y});
},rotate:function(_7db){
var c=Math.cos(_7db);
var s=Math.sin(_7db);
return new m.Matrix2D({xx:c,xy:-s,yx:s,yy:c});
},rotateg:function(_7dc){
return m.rotate(m._degToRad(_7dc));
},skewX:function(_7dd){
return new m.Matrix2D({xy:Math.tan(_7dd)});
},skewXg:function(_7de){
return m.skewX(m._degToRad(_7de));
},skewY:function(_7df){
return new m.Matrix2D({yx:Math.tan(_7df)});
},skewYg:function(_7e0){
return m.skewY(m._degToRad(_7e0));
},reflect:function(a,b){
if(arguments.length==1){
b=a.y;
a=a.x;
}
var a2=a*a,b2=b*b,n2=a2+b2,xy=2*a*b/n2;
return new m.Matrix2D({xx:2*a2/n2-1,xy:xy,yx:xy,yy:2*b2/n2-1});
},project:function(a,b){
if(arguments.length==1){
b=a.y;
a=a.x;
}
var a2=a*a,b2=b*b,n2=a2+b2,xy=a*b/n2;
return new m.Matrix2D({xx:a2/n2,xy:xy,yx:xy,yy:b2/n2});
},normalize:function(_7e1){
return (_7e1 instanceof m.Matrix2D)?_7e1:new m.Matrix2D(_7e1);
},clone:function(_7e2){
var obj=new m.Matrix2D();
for(var i in _7e2){
if(typeof (_7e2[i])=="number"&&typeof (obj[i])=="number"&&obj[i]!=_7e2[i]){
obj[i]=_7e2[i];
}
}
return obj;
},invert:function(_7e3){
var M=m.normalize(_7e3),D=M.xx*M.yy-M.xy*M.yx,M=new m.Matrix2D({xx:M.yy/D,xy:-M.xy/D,yx:-M.yx/D,yy:M.xx/D,dx:(M.xy*M.dy-M.yy*M.dx)/D,dy:(M.yx*M.dx-M.xx*M.dy)/D});
return M;
},_multiplyPoint:function(_7e4,x,y){
return {x:_7e4.xx*x+_7e4.xy*y+_7e4.dx,y:_7e4.yx*x+_7e4.yy*y+_7e4.dy};
},multiplyPoint:function(_7e5,a,b){
var M=m.normalize(_7e5);
if(typeof a=="number"&&typeof b=="number"){
return m._multiplyPoint(M,a,b);
}
return m._multiplyPoint(M,a.x,a.y);
},multiply:function(_7e6){
var M=m.normalize(_7e6);
for(var i=1;i<arguments.length;++i){
var l=M,r=m.normalize(arguments[i]);
M=new m.Matrix2D();
M.xx=l.xx*r.xx+l.xy*r.yx;
M.xy=l.xx*r.xy+l.xy*r.yy;
M.yx=l.yx*r.xx+l.yy*r.yx;
M.yy=l.yx*r.xy+l.yy*r.yy;
M.dx=l.xx*r.dx+l.xy*r.dy+l.dx;
M.dy=l.yx*r.dx+l.yy*r.dy+l.dy;
}
return M;
},_sandwich:function(_7e7,x,y){
return m.multiply(m.translate(x,y),_7e7,m.translate(-x,-y));
},scaleAt:function(a,b,c,d){
switch(arguments.length){
case 4:
return m._sandwich(m.scale(a,b),c,d);
case 3:
if(typeof c=="number"){
return m._sandwich(m.scale(a),b,c);
}
return m._sandwich(m.scale(a,b),c.x,c.y);
}
return m._sandwich(m.scale(a),b.x,b.y);
},rotateAt:function(_7e8,a,b){
if(arguments.length>2){
return m._sandwich(m.rotate(_7e8),a,b);
}
return m._sandwich(m.rotate(_7e8),a.x,a.y);
},rotategAt:function(_7e9,a,b){
if(arguments.length>2){
return m._sandwich(m.rotateg(_7e9),a,b);
}
return m._sandwich(m.rotateg(_7e9),a.x,a.y);
},skewXAt:function(_7ea,a,b){
if(arguments.length>2){
return m._sandwich(m.skewX(_7ea),a,b);
}
return m._sandwich(m.skewX(_7ea),a.x,a.y);
},skewXgAt:function(_7eb,a,b){
if(arguments.length>2){
return m._sandwich(m.skewXg(_7eb),a,b);
}
return m._sandwich(m.skewXg(_7eb),a.x,a.y);
},skewYAt:function(_7ec,a,b){
if(arguments.length>2){
return m._sandwich(m.skewY(_7ec),a,b);
}
return m._sandwich(m.skewY(_7ec),a.x,a.y);
},skewYgAt:function(_7ed,a,b){
if(arguments.length>2){
return m._sandwich(m.skewYg(_7ed),a,b);
}
return m._sandwich(m.skewYg(_7ed),a.x,a.y);
}});
})();
dojox.gfx.Matrix2D=dojox.gfx.matrix.Matrix2D;
}
if(!dojo._hasResource["dojox.gfx._base"]){
dojo._hasResource["dojox.gfx._base"]=true;
dojo.provide("dojox.gfx._base");
(function(){
var g=dojox.gfx,b=g._base;
g._hasClass=function(node,_7ee){
var cls=node.getAttribute("className");
return cls&&(" "+cls+" ").indexOf(" "+_7ee+" ")>=0;
};
g._addClass=function(node,_7ef){
var cls=node.getAttribute("className")||"";
if(!cls||(" "+cls+" ").indexOf(" "+_7ef+" ")<0){
node.setAttribute("className",cls+(cls?" ":"")+_7ef);
}
};
g._removeClass=function(node,_7f0){
var cls=node.getAttribute("className");
if(cls){
node.setAttribute("className",cls.replace(new RegExp("(^|\\s+)"+_7f0+"(\\s+|$)"),"$1$2"));
}
};
b._getFontMeasurements=function(){
var _7f1={"1em":0,"1ex":0,"100%":0,"12pt":0,"16px":0,"xx-small":0,"x-small":0,"small":0,"medium":0,"large":0,"x-large":0,"xx-large":0};
if(dojo.isIE){
dojo.doc.documentElement.style.fontSize="100%";
}
var div=dojo.create("div",{style:{position:"absolute",left:"0",top:"-100px",width:"30px",height:"1000em",borderWidth:"0",margin:"0",padding:"0",outline:"none",lineHeight:"1",overflow:"hidden"}},dojo.body());
for(var p in _7f1){
div.style.fontSize=p;
_7f1[p]=Math.round(div.offsetHeight*12/16)*16/12/1000;
}
dojo.body().removeChild(div);
return _7f1;
};
var _7f2=null;
b._getCachedFontMeasurements=function(_7f3){
if(_7f3||!_7f2){
_7f2=b._getFontMeasurements();
}
return _7f2;
};
var _7f4=null,_7f5={};
b._getTextBox=function(text,_7f6,_7f7){
var m,s,al=arguments.length;
if(!_7f4){
_7f4=dojo.create("div",{style:{position:"absolute",top:"-10000px",left:"0"}},dojo.body());
}
m=_7f4;
m.className="";
s=m.style;
s.borderWidth="0";
s.margin="0";
s.padding="0";
s.outline="0";
if(al>1&&_7f6){
for(var i in _7f6){
if(i in _7f5){
continue;
}
s[i]=_7f6[i];
}
}
if(al>2&&_7f7){
m.className=_7f7;
}
m.innerHTML=text;
if(m["getBoundingClientRect"]){
var bcr=m.getBoundingClientRect();
return {l:bcr.left,t:bcr.top,w:bcr.width||(bcr.right-bcr.left),h:bcr.height||(bcr.bottom-bcr.top)};
}else{
return dojo.marginBox(m);
}
};
var _7f8=0;
b._getUniqueId=function(){
var id;
do{
id=dojo._scopeName+"Unique"+(++_7f8);
}while(dojo.byId(id));
return id;
};
})();
dojo.mixin(dojox.gfx,{defaultPath:{type:"path",path:""},defaultPolyline:{type:"polyline",points:[]},defaultRect:{type:"rect",x:0,y:0,width:100,height:100,r:0},defaultEllipse:{type:"ellipse",cx:0,cy:0,rx:200,ry:100},defaultCircle:{type:"circle",cx:0,cy:0,r:100},defaultLine:{type:"line",x1:0,y1:0,x2:100,y2:100},defaultImage:{type:"image",x:0,y:0,width:0,height:0,src:""},defaultText:{type:"text",x:0,y:0,text:"",align:"start",decoration:"none",rotated:false,kerning:true},defaultTextPath:{type:"textpath",text:"",align:"start",decoration:"none",rotated:false,kerning:true},defaultStroke:{type:"stroke",color:"black",style:"solid",width:1,cap:"butt",join:4},defaultLinearGradient:{type:"linear",x1:0,y1:0,x2:100,y2:100,colors:[{offset:0,color:"black"},{offset:1,color:"white"}]},defaultRadialGradient:{type:"radial",cx:0,cy:0,r:100,colors:[{offset:0,color:"black"},{offset:1,color:"white"}]},defaultPattern:{type:"pattern",x:0,y:0,width:0,height:0,src:""},defaultFont:{type:"font",style:"normal",variant:"normal",weight:"normal",size:"10pt",family:"serif"},getDefault:(function(){
var _7f9={};
return function(type){
var t=_7f9[type];
if(t){
return new t();
}
t=_7f9[type]=new Function;
t.prototype=dojox.gfx["default"+type];
return new t();
};
})(),normalizeColor:function(_7fa){
return (_7fa instanceof dojo.Color)?_7fa:new dojo.Color(_7fa);
},normalizeParameters:function(_7fb,_7fc){
if(_7fc){
var _7fd={};
for(var x in _7fb){
if(x in _7fc&&!(x in _7fd)){
_7fb[x]=_7fc[x];
}
}
}
return _7fb;
},makeParameters:function(_7fe,_7ff){
if(!_7ff){
return dojo.delegate(_7fe);
}
var _800={};
for(var i in _7fe){
if(!(i in _800)){
_800[i]=dojo.clone((i in _7ff)?_7ff[i]:_7fe[i]);
}
}
return _800;
},formatNumber:function(x,_801){
var val=x.toString();
if(val.indexOf("e")>=0){
val=x.toFixed(4);
}else{
var _802=val.indexOf(".");
if(_802>=0&&val.length-_802>5){
val=x.toFixed(4);
}
}
if(x<0){
return val;
}
return _801?" "+val:val;
},makeFontString:function(font){
return font.style+" "+font.variant+" "+font.weight+" "+font.size+" "+font.family;
},splitFontString:function(str){
var font=dojox.gfx.getDefault("Font");
var t=str.split(/\s+/);
do{
if(t.length<5){
break;
}
font.style=t[0];
font.variant=t[1];
font.weight=t[2];
var i=t[3].indexOf("/");
font.size=i<0?t[3]:t[3].substring(0,i);
var j=4;
if(i<0){
if(t[4]=="/"){
j=6;
}else{
if(t[4].charAt(0)=="/"){
j=5;
}
}
}
if(j<t.length){
font.family=t.slice(j).join(" ");
}
}while(false);
return font;
},cm_in_pt:72/2.54,mm_in_pt:7.2/2.54,px_in_pt:function(){
return dojox.gfx._base._getCachedFontMeasurements()["12pt"]/12;
},pt2px:function(len){
return len*dojox.gfx.px_in_pt();
},px2pt:function(len){
return len/dojox.gfx.px_in_pt();
},normalizedLength:function(len){
if(len.length==0){
return 0;
}
if(len.length>2){
var _803=dojox.gfx.px_in_pt();
var val=parseFloat(len);
switch(len.slice(-2)){
case "px":
return val;
case "pt":
return val*_803;
case "in":
return val*72*_803;
case "pc":
return val*12*_803;
case "mm":
return val*dojox.gfx.mm_in_pt*_803;
case "cm":
return val*dojox.gfx.cm_in_pt*_803;
}
}
return parseFloat(len);
},pathVmlRegExp:/([A-Za-z]+)|(\d+(\.\d+)?)|(\.\d+)|(-\d+(\.\d+)?)|(-\.\d+)/g,pathSvgRegExp:/([A-Za-z])|(\d+(\.\d+)?)|(\.\d+)|(-\d+(\.\d+)?)|(-\.\d+)/g,equalSources:function(a,b){
return a&&b&&a==b;
},switchTo:function(_804){
var ns=dojox.gfx[_804];
if(ns){
dojo.forEach(["Group","Rect","Ellipse","Circle","Line","Polyline","Image","Text","Path","TextPath","Surface","createSurface"],function(name){
dojox.gfx[name]=ns[name];
});
}
}});
}
if(!dojo._hasResource["dojox.gfx"]){
dojo._hasResource["dojox.gfx"]=true;
dojo.provide("dojox.gfx");
dojo.loadInit(function(){
var gfx=dojo.getObject("dojox.gfx",true),sl,flag,_805;
while(!gfx.renderer){
if(dojo.config.forceGfxRenderer){
dojox.gfx.renderer=dojo.config.forceGfxRenderer;
break;
}
var _806=(typeof dojo.config.gfxRenderer=="string"?dojo.config.gfxRenderer:"svg,vml,canvas,silverlight").split(",");
for(var i=0;i<_806.length;++i){
switch(_806[i]){
case "svg":
if("SVGAngle" in dojo.global){
dojox.gfx.renderer="svg";
}
break;
case "vml":
if(dojo.isIE){
dojox.gfx.renderer="vml";
}
break;
case "silverlight":
try{
if(dojo.isIE){
sl=new ActiveXObject("AgControl.AgControl");
if(sl&&sl.IsVersionSupported("1.0")){
flag=true;
}
}else{
if(navigator.plugins["Silverlight Plug-In"]){
flag=true;
}
}
}
catch(e){
flag=false;
}
finally{
sl=null;
}
if(flag){
dojox.gfx.renderer="silverlight";
}
break;
case "canvas":
if(dojo.global.CanvasRenderingContext2D){
dojox.gfx.renderer="canvas";
}
break;
}
if(gfx.renderer){
break;
}
}
break;
}
if(dojo.config.isDebug){
console.log("gfx renderer = "+gfx.renderer);
}
if(gfx[gfx.renderer]){
gfx.switchTo(gfx.renderer);
}else{
gfx.loadAndSwitch=gfx.renderer;
dojo["require"]("dojox.gfx."+gfx.renderer);
}
});
}
if(!dojo._hasResource["dijit.dijit"]){
dojo._hasResource["dijit.dijit"]=true;
dojo.provide("dijit.dijit");
}
if(!dojo._hasResource["dojox.html.metrics"]){
dojo._hasResource["dojox.html.metrics"]=true;
dojo.provide("dojox.html.metrics");
(function(){
var dhm=dojox.html.metrics;
dhm.getFontMeasurements=function(){
var _807={"1em":0,"1ex":0,"100%":0,"12pt":0,"16px":0,"xx-small":0,"x-small":0,"small":0,"medium":0,"large":0,"x-large":0,"xx-large":0};
if(dojo.isIE){
dojo.doc.documentElement.style.fontSize="100%";
}
var div=dojo.doc.createElement("div");
var ds=div.style;
ds.position="absolute";
ds.left="-100px";
ds.top="0";
ds.width="30px";
ds.height="1000em";
ds.borderWidth="0";
ds.margin="0";
ds.padding="0";
ds.outline="0";
ds.lineHeight="1";
ds.overflow="hidden";
dojo.body().appendChild(div);
for(var p in _807){
ds.fontSize=p;
_807[p]=Math.round(div.offsetHeight*12/16)*16/12/1000;
}
dojo.body().removeChild(div);
div=null;
return _807;
};
var _808=null;
dhm.getCachedFontMeasurements=function(_809){
if(_809||!_808){
_808=dhm.getFontMeasurements();
}
return _808;
};
var _80a=null,_80b={};
dhm.getTextBox=function(text,_80c,_80d){
var m,s;
if(!_80a){
m=_80a=dojo.doc.createElement("div");
var c=dojo.doc.createElement("div");
c.appendChild(m);
s=c.style;
s.overflow="scroll";
s.position="absolute";
s.left="0px";
s.top="-10000px";
s.width="1px";
s.height="1px";
s.visibility="hidden";
s.borderWidth="0";
s.margin="0";
s.padding="0";
s.outline="0";
dojo.body().appendChild(c);
}else{
m=_80a;
}
m.className="";
s=m.style;
s.borderWidth="0";
s.margin="0";
s.padding="0";
s.outline="0";
if(arguments.length>1&&_80c){
for(var i in _80c){
if(i in _80b){
continue;
}
s[i]=_80c[i];
}
}
if(arguments.length>2&&_80d){
m.className=_80d;
}
m.innerHTML=text;
var box=dojo.position(m);
box.w=m.parentNode.scrollWidth;
return box;
};
var _80e={w:16,h:16};
dhm.getScrollbar=function(){
return {w:_80e.w,h:_80e.h};
};
dhm._fontResizeNode=null;
dhm.initOnFontResize=function(_80f){
var f=dhm._fontResizeNode=dojo.doc.createElement("iframe");
var fs=f.style;
fs.position="absolute";
fs.width="5em";
fs.height="10em";
fs.top="-10000px";
if(dojo.isIE){
f.onreadystatechange=function(){
if(f.contentWindow.document.readyState=="complete"){
f.onresize=f.contentWindow.parent[dojox._scopeName].html.metrics._fontresize;
}
};
}else{
f.onload=function(){
f.contentWindow.onresize=f.contentWindow.parent[dojox._scopeName].html.metrics._fontresize;
};
}
f.setAttribute("src","javascript:'<html><head><script>if(\"loadFirebugConsole\" in window){window.loadFirebugConsole();}</script></head><body></body></html>'");
dojo.body().appendChild(f);
dhm.initOnFontResize=function(){
};
};
dhm.onFontResize=function(){
};
dhm._fontresize=function(){
dhm.onFontResize();
};
dojo.addOnUnload(function(){
var f=dhm._fontResizeNode;
if(f){
if(dojo.isIE&&f.onresize){
f.onresize=null;
}else{
if(f.contentWindow&&f.contentWindow.onresize){
f.contentWindow.onresize=null;
}
}
dhm._fontResizeNode=null;
}
});
dojo.addOnLoad(function(){
try{
var n=dojo.doc.createElement("div");
n.style.cssText="top:0;left:0;width:100px;height:100px;overflow:scroll;position:absolute;visibility:hidden;";
dojo.body().appendChild(n);
_80e.w=n.offsetWidth-n.clientWidth;
_80e.h=n.offsetHeight-n.clientHeight;
dojo.body().removeChild(n);
delete n;
}
catch(e){
}
if("fontSizeWatch" in dojo.config&&!!dojo.config.fontSizeWatch){
dhm.initOnFontResize();
}
});
})();
}
if(!dojo._hasResource["dojox.grid.util"]){
dojo._hasResource["dojox.grid.util"]=true;
dojo.provide("dojox.grid.util");
(function(){
var dgu=dojox.grid.util;
dgu.na="...";
dgu.rowIndexTag="gridRowIndex";
dgu.gridViewTag="gridView";
dgu.fire=function(ob,ev,args){
var fn=ob&&ev&&ob[ev];
return fn&&(args?fn.apply(ob,args):ob[ev]());
};
dgu.setStyleHeightPx=function(_810,_811){
if(_811>=0){
var s=_810.style;
var v=_811+"px";
if(_810&&s["height"]!=v){
s["height"]=v;
}
}
};
dgu.mouseEvents=["mouseover","mouseout","mousedown","mouseup","click","dblclick","contextmenu"];
dgu.keyEvents=["keyup","keydown","keypress"];
dgu.funnelEvents=function(_812,_813,_814,_815){
var evts=(_815?_815:dgu.mouseEvents.concat(dgu.keyEvents));
for(var i=0,l=evts.length;i<l;i++){
_813.connect(_812,"on"+evts[i],_814);
}
};
dgu.removeNode=function(_816){
_816=dojo.byId(_816);
_816&&_816.parentNode&&_816.parentNode.removeChild(_816);
return _816;
};
dgu.arrayCompare=function(inA,inB){
for(var i=0,l=inA.length;i<l;i++){
if(inA[i]!=inB[i]){
return false;
}
}
return (inA.length==inB.length);
};
dgu.arrayInsert=function(_817,_818,_819){
if(_817.length<=_818){
_817[_818]=_819;
}else{
_817.splice(_818,0,_819);
}
};
dgu.arrayRemove=function(_81a,_81b){
_81a.splice(_81b,1);
};
dgu.arraySwap=function(_81c,inI,inJ){
var _81d=_81c[inI];
_81c[inI]=_81c[inJ];
_81c[inJ]=_81d;
};
})();
}
if(!dojo._hasResource["dojox.grid._Scroller"]){
dojo._hasResource["dojox.grid._Scroller"]=true;
dojo.provide("dojox.grid._Scroller");
(function(){
var _81e=function(_81f){
var i=0,n,p=_81f.parentNode;
while((n=p.childNodes[i++])){
if(n==_81f){
return i-1;
}
}
return -1;
};
var _820=function(_821){
if(!_821){
return;
}
var _822=function(inW){
return inW.domNode&&dojo.isDescendant(inW.domNode,_821,true);
};
var ws=dijit.registry.filter(_822);
for(var i=0,w;(w=ws[i]);i++){
w.destroy();
}
delete ws;
};
var _823=function(_824){
var node=dojo.byId(_824);
return (node&&node.tagName?node.tagName.toLowerCase():"");
};
var _825=function(_826,_827){
var _828=[];
var i=0,n;
while((n=_826.childNodes[i])){
i++;
if(_823(n)==_827){
_828.push(n);
}
}
return _828;
};
var _829=function(_82a){
return _825(_82a,"div");
};
dojo.declare("dojox.grid._Scroller",null,{constructor:function(_82b){
this.setContentNodes(_82b);
this.pageHeights=[];
this.pageNodes=[];
this.stack=[];
},rowCount:0,defaultRowHeight:32,keepRows:100,contentNode:null,scrollboxNode:null,defaultPageHeight:0,keepPages:10,pageCount:0,windowHeight:0,firstVisibleRow:0,lastVisibleRow:0,averageRowHeight:0,page:0,pageTop:0,init:function(_82c,_82d,_82e){
switch(arguments.length){
case 3:
this.rowsPerPage=_82e;
case 2:
this.keepRows=_82d;
case 1:
this.rowCount=_82c;
default:
break;
}
this.defaultPageHeight=this.defaultRowHeight*this.rowsPerPage;
this.pageCount=this._getPageCount(this.rowCount,this.rowsPerPage);
this.setKeepInfo(this.keepRows);
this.invalidate();
if(this.scrollboxNode){
this.scrollboxNode.scrollTop=0;
this.scroll(0);
this.scrollboxNode.onscroll=dojo.hitch(this,"onscroll");
}
},_getPageCount:function(_82f,_830){
return _82f?(Math.ceil(_82f/_830)||1):0;
},destroy:function(){
this.invalidateNodes();
delete this.contentNodes;
delete this.contentNode;
delete this.scrollboxNode;
},setKeepInfo:function(_831){
this.keepRows=_831;
this.keepPages=!this.keepRows?this.keepPages:Math.max(Math.ceil(this.keepRows/this.rowsPerPage),2);
},setContentNodes:function(_832){
this.contentNodes=_832;
this.colCount=(this.contentNodes?this.contentNodes.length:0);
this.pageNodes=[];
for(var i=0;i<this.colCount;i++){
this.pageNodes[i]=[];
}
},getDefaultNodes:function(){
return this.pageNodes[0]||[];
},invalidate:function(){
this._invalidating=true;
this.invalidateNodes();
this.pageHeights=[];
this.height=(this.pageCount?(this.pageCount-1)*this.defaultPageHeight+this.calcLastPageHeight():0);
this.resize();
this._invalidating=false;
},updateRowCount:function(_833){
this.invalidateNodes();
this.rowCount=_833;
var _834=this.pageCount;
if(_834===0){
this.height=1;
}
this.pageCount=this._getPageCount(this.rowCount,this.rowsPerPage);
if(this.pageCount<_834){
for(var i=_834-1;i>=this.pageCount;i--){
this.height-=this.getPageHeight(i);
delete this.pageHeights[i];
}
}else{
if(this.pageCount>_834){
this.height+=this.defaultPageHeight*(this.pageCount-_834-1)+this.calcLastPageHeight();
}
}
this.resize();
},pageExists:function(_835){
return Boolean(this.getDefaultPageNode(_835));
},measurePage:function(_836){
if(this.grid.rowHeight){
var _837=this.grid.rowHeight+1;
return ((_836+1)*this.rowsPerPage>this.rowCount?this.rowCount-_836*this.rowsPerPage:this.rowsPerPage)*_837;
}
var n=this.getDefaultPageNode(_836);
return (n&&n.innerHTML)?n.offsetHeight:undefined;
},positionPage:function(_838,_839){
for(var i=0;i<this.colCount;i++){
this.pageNodes[i][_838].style.top=_839+"px";
}
},repositionPages:function(_83a){
var _83b=this.getDefaultNodes();
var last=0;
for(var i=0;i<this.stack.length;i++){
last=Math.max(this.stack[i],last);
}
var n=_83b[_83a];
var y=(n?this.getPageNodePosition(n)+this.getPageHeight(_83a):0);
for(var p=_83a+1;p<=last;p++){
n=_83b[p];
if(n){
if(this.getPageNodePosition(n)==y){
return;
}
this.positionPage(p,y);
}
y+=this.getPageHeight(p);
}
},installPage:function(_83c){
for(var i=0;i<this.colCount;i++){
this.contentNodes[i].appendChild(this.pageNodes[i][_83c]);
}
},preparePage:function(_83d,_83e){
var p=(_83e?this.popPage():null);
for(var i=0;i<this.colCount;i++){
var _83f=this.pageNodes[i];
var _840=(p===null?this.createPageNode():this.invalidatePageNode(p,_83f));
_840.pageIndex=_83d;
_83f[_83d]=_840;
}
},renderPage:function(_841){
var _842=[];
var i,j;
for(i=0;i<this.colCount;i++){
_842[i]=this.pageNodes[i][_841];
}
for(i=0,j=_841*this.rowsPerPage;(i<this.rowsPerPage)&&(j<this.rowCount);i++,j++){
this.renderRow(j,_842);
}
},removePage:function(_843){
for(var i=0,j=_843*this.rowsPerPage;i<this.rowsPerPage;i++,j++){
this.removeRow(j);
}
},destroyPage:function(_844){
for(var i=0;i<this.colCount;i++){
var n=this.invalidatePageNode(_844,this.pageNodes[i]);
if(n){
dojo.destroy(n);
}
}
},pacify:function(_845){
},pacifying:false,pacifyTicks:200,setPacifying:function(_846){
if(this.pacifying!=_846){
this.pacifying=_846;
this.pacify(this.pacifying);
}
},startPacify:function(){
this.startPacifyTicks=new Date().getTime();
},doPacify:function(){
var _847=(new Date().getTime()-this.startPacifyTicks)>this.pacifyTicks;
this.setPacifying(true);
this.startPacify();
return _847;
},endPacify:function(){
this.setPacifying(false);
},resize:function(){
if(this.scrollboxNode){
this.windowHeight=this.scrollboxNode.clientHeight;
}
for(var i=0;i<this.colCount;i++){
dojox.grid.util.setStyleHeightPx(this.contentNodes[i],Math.max(1,this.height));
}
var _848=(!this._invalidating);
if(!_848){
var ah=this.grid.get("autoHeight");
if(typeof ah=="number"&&ah<=Math.min(this.rowsPerPage,this.rowCount)){
_848=true;
}
}
if(_848){
this.needPage(this.page,this.pageTop);
}
var _849=(this.page<this.pageCount-1)?this.rowsPerPage:((this.rowCount%this.rowsPerPage)||this.rowsPerPage);
var _84a=this.getPageHeight(this.page);
this.averageRowHeight=(_84a>0&&_849>0)?(_84a/_849):0;
},calcLastPageHeight:function(){
if(!this.pageCount){
return 0;
}
var _84b=this.pageCount-1;
var _84c=((this.rowCount%this.rowsPerPage)||(this.rowsPerPage))*this.defaultRowHeight;
this.pageHeights[_84b]=_84c;
return _84c;
},updateContentHeight:function(inDh){
this.height+=inDh;
this.resize();
},updatePageHeight:function(_84d,_84e,_84f){
if(this.pageExists(_84d)){
var oh=this.getPageHeight(_84d);
var h=(this.measurePage(_84d));
if(h===undefined){
h=oh;
}
this.pageHeights[_84d]=h;
if(oh!=h){
this.updateContentHeight(h-oh);
var ah=this.grid.get("autoHeight");
if((typeof ah=="number"&&ah>this.rowCount)||(ah===true&&!_84e)){
if(!_84f){
this.grid.sizeChange();
}else{
var ns=this.grid.viewsNode.style;
ns.height=parseInt(ns.height)+h-oh+"px";
this.repositionPages(_84d);
}
}else{
this.repositionPages(_84d);
}
}
return h;
}
return 0;
},rowHeightChanged:function(_850,_851){
this.updatePageHeight(Math.floor(_850/this.rowsPerPage),false,_851);
},invalidateNodes:function(){
while(this.stack.length){
this.destroyPage(this.popPage());
}
},createPageNode:function(){
var p=document.createElement("div");
dojo.attr(p,"role","presentation");
p.style.position="absolute";
p.style[dojo._isBodyLtr()?"left":"right"]="0";
return p;
},getPageHeight:function(_852){
var ph=this.pageHeights[_852];
return (ph!==undefined?ph:this.defaultPageHeight);
},pushPage:function(_853){
return this.stack.push(_853);
},popPage:function(){
return this.stack.shift();
},findPage:function(_854){
var i=0,h=0;
for(var ph=0;i<this.pageCount;i++,h+=ph){
ph=this.getPageHeight(i);
if(h+ph>=_854){
break;
}
}
this.page=i;
this.pageTop=h;
},buildPage:function(_855,_856,_857){
this.preparePage(_855,_856);
this.positionPage(_855,_857);
this.installPage(_855);
this.renderPage(_855);
this.pushPage(_855);
},needPage:function(_858,_859){
var h=this.getPageHeight(_858),oh=h;
if(!this.pageExists(_858)){
this.buildPage(_858,(!this.grid._autoHeight&&this.keepPages&&(this.stack.length>=this.keepPages)),_859);
h=this.updatePageHeight(_858,true);
}else{
this.positionPage(_858,_859);
}
return h;
},onscroll:function(){
this.scroll(this.scrollboxNode.scrollTop);
},scroll:function(_85a){
this.grid.scrollTop=_85a;
if(this.colCount){
this.startPacify();
this.findPage(_85a);
var h=this.height;
var b=this.getScrollBottom(_85a);
for(var p=this.page,y=this.pageTop;(p<this.pageCount)&&((b<0)||(y<b));p++){
y+=this.needPage(p,y);
}
this.firstVisibleRow=this.getFirstVisibleRow(this.page,this.pageTop,_85a);
this.lastVisibleRow=this.getLastVisibleRow(p-1,y,b);
if(h!=this.height){
this.repositionPages(p-1);
}
this.endPacify();
}
},getScrollBottom:function(_85b){
return (this.windowHeight>=0?_85b+this.windowHeight:-1);
},processNodeEvent:function(e,_85c){
var t=e.target;
while(t&&(t!=_85c)&&t.parentNode&&(t.parentNode.parentNode!=_85c)){
t=t.parentNode;
}
if(!t||!t.parentNode||(t.parentNode.parentNode!=_85c)){
return false;
}
var page=t.parentNode;
e.topRowIndex=page.pageIndex*this.rowsPerPage;
e.rowIndex=e.topRowIndex+_81e(t);
e.rowTarget=t;
return true;
},processEvent:function(e){
return this.processNodeEvent(e,this.contentNode);
},renderRow:function(_85d,_85e){
},removeRow:function(_85f){
},getDefaultPageNode:function(_860){
return this.getDefaultNodes()[_860];
},positionPageNode:function(_861,_862){
},getPageNodePosition:function(_863){
return _863.offsetTop;
},invalidatePageNode:function(_864,_865){
var p=_865[_864];
if(p){
delete _865[_864];
this.removePage(_864,p);
_820(p);
p.innerHTML="";
}
return p;
},getPageRow:function(_866){
return _866*this.rowsPerPage;
},getLastPageRow:function(_867){
return Math.min(this.rowCount,this.getPageRow(_867+1))-1;
},getFirstVisibleRow:function(_868,_869,_86a){
if(!this.pageExists(_868)){
return 0;
}
var row=this.getPageRow(_868);
var _86b=this.getDefaultNodes();
var rows=_829(_86b[_868]);
for(var i=0,l=rows.length;i<l&&_869<_86a;i++,row++){
_869+=rows[i].offsetHeight;
}
return (row?row-1:row);
},getLastVisibleRow:function(_86c,_86d,_86e){
if(!this.pageExists(_86c)){
return 0;
}
var _86f=this.getDefaultNodes();
var row=this.getLastPageRow(_86c);
var rows=_829(_86f[_86c]);
for(var i=rows.length-1;i>=0&&_86d>_86e;i--,row--){
_86d-=rows[i].offsetHeight;
}
return row+1;
},findTopRow:function(_870){
var _871=this.getDefaultNodes();
var rows=_829(_871[this.page]);
for(var i=0,l=rows.length,t=this.pageTop,h;i<l;i++){
h=rows[i].offsetHeight;
t+=h;
if(t>=_870){
this.offset=h-(t-_870);
return i+this.page*this.rowsPerPage;
}
}
return -1;
},findScrollTop:function(_872){
var _873=Math.floor(_872/this.rowsPerPage);
var t=0;
var i,l;
for(i=0;i<_873;i++){
t+=this.getPageHeight(i);
}
this.pageTop=t;
this.page=_873;
this.needPage(_873,this.pageTop);
var _874=this.getDefaultNodes();
var rows=_829(_874[_873]);
var r=_872-this.rowsPerPage*_873;
for(i=0,l=rows.length;i<l&&i<r;i++){
t+=rows[i].offsetHeight;
}
return t;
},dummy:0});
})();
}
if(!dojo._hasResource["dojox.grid.cells._base"]){
dojo._hasResource["dojox.grid.cells._base"]=true;
dojo.provide("dojox.grid.cells._base");
dojo.declare("dojox.grid._DeferredTextWidget",dijit._Widget,{deferred:null,_destroyOnRemove:true,postCreate:function(){
if(this.deferred){
this.deferred.addBoth(dojo.hitch(this,function(text){
if(this.domNode){
this.domNode.innerHTML=text;
}
}));
}
}});
(function(){
var _875=function(_876){
try{
dojox.grid.util.fire(_876,"focus");
dojox.grid.util.fire(_876,"select");
}
catch(e){
}
};
var _877=function(){
setTimeout(dojo.hitch.apply(dojo,arguments),0);
};
var dgc=dojox.grid.cells;
dojo.declare("dojox.grid.cells._Base",null,{styles:"",classes:"",editable:false,alwaysEditing:false,formatter:null,defaultValue:"...",value:null,hidden:false,noresize:false,draggable:true,_valueProp:"value",_formatPending:false,constructor:function(_878){
this._props=_878||{};
dojo.mixin(this,_878);
if(this.draggable===undefined){
this.draggable=true;
}
},_defaultFormat:function(_879,_87a){
var s=this.grid.formatterScope||this;
var f=this.formatter;
if(f&&s&&typeof f=="string"){
f=this.formatter=s[f];
}
var v=(_879!=this.defaultValue&&f)?f.apply(s,_87a):_879;
if(typeof v=="undefined"){
return this.defaultValue;
}
if(v&&v.addBoth){
v=new dojox.grid._DeferredTextWidget({deferred:v},dojo.create("span",{innerHTML:this.defaultValue}));
}
if(v&&v.declaredClass&&v.startup){
return "<div class='dojoxGridStubNode' linkWidget='"+v.id+"' cellIdx='"+this.index+"'>"+this.defaultValue+"</div>";
}
return v;
},format:function(_87b,_87c){
var f,i=this.grid.edit.info,d=this.get?this.get(_87b,_87c):(this.value||this.defaultValue);
d=(d&&d.replace&&this.grid.escapeHTMLInData)?d.replace(/&/g,"&amp;").replace(/</g,"&lt;"):d;
if(this.editable&&(this.alwaysEditing||(i.rowIndex==_87b&&i.cell==this))){
return this.formatEditing(d,_87b);
}else{
return this._defaultFormat(d,[d,_87b,this]);
}
},formatEditing:function(_87d,_87e){
},getNode:function(_87f){
return this.view.getCellNode(_87f,this.index);
},getHeaderNode:function(){
return this.view.getHeaderCellNode(this.index);
},getEditNode:function(_880){
return (this.getNode(_880)||0).firstChild||0;
},canResize:function(){
var uw=this.unitWidth;
return uw&&(uw!=="auto");
},isFlex:function(){
var uw=this.unitWidth;
return uw&&dojo.isString(uw)&&(uw=="auto"||uw.slice(-1)=="%");
},applyEdit:function(_881,_882){
this.grid.edit.applyCellEdit(_881,this,_882);
},cancelEdit:function(_883){
this.grid.doCancelEdit(_883);
},_onEditBlur:function(_884){
if(this.grid.edit.isEditCell(_884,this.index)){
this.grid.edit.apply();
}
},registerOnBlur:function(_885,_886){
if(this.commitOnBlur){
dojo.connect(_885,"onblur",function(e){
setTimeout(dojo.hitch(this,"_onEditBlur",_886),250);
});
}
},needFormatNode:function(_887,_888){
this._formatPending=true;
_877(this,"_formatNode",_887,_888);
},cancelFormatNode:function(){
this._formatPending=false;
},_formatNode:function(_889,_88a){
if(this._formatPending){
this._formatPending=false;
dojo.setSelectable(this.grid.domNode,true);
this.formatNode(this.getEditNode(_88a),_889,_88a);
}
},formatNode:function(_88b,_88c,_88d){
if(dojo.isIE){
_877(this,"focus",_88d,_88b);
}else{
this.focus(_88d,_88b);
}
},dispatchEvent:function(m,e){
if(m in this){
return this[m](e);
}
},getValue:function(_88e){
return this.getEditNode(_88e)[this._valueProp];
},setValue:function(_88f,_890){
var n=this.getEditNode(_88f);
if(n){
n[this._valueProp]=_890;
}
},focus:function(_891,_892){
_875(_892||this.getEditNode(_891));
},save:function(_893){
this.value=this.value||this.getValue(_893);
},restore:function(_894){
this.setValue(_894,this.value);
},_finish:function(_895){
dojo.setSelectable(this.grid.domNode,false);
this.cancelFormatNode();
},apply:function(_896){
this.applyEdit(this.getValue(_896),_896);
this._finish(_896);
},cancel:function(_897){
this.cancelEdit(_897);
this._finish(_897);
}});
dgc._Base.markupFactory=function(node,_898){
var d=dojo;
var _899=d.trim(d.attr(node,"formatter")||"");
if(_899){
_898.formatter=dojo.getObject(_899)||_899;
}
var get=d.trim(d.attr(node,"get")||"");
if(get){
_898.get=dojo.getObject(get);
}
var _89a=function(attr,cell,_89b){
var _89c=d.trim(d.attr(node,attr)||"");
if(_89c){
cell[_89b||attr]=!(_89c.toLowerCase()=="false");
}
};
_89a("sortDesc",_898);
_89a("editable",_898);
_89a("alwaysEditing",_898);
_89a("noresize",_898);
_89a("draggable",_898);
var _89d=d.trim(d.attr(node,"loadingText")||d.attr(node,"defaultValue")||"");
if(_89d){
_898.defaultValue=_89d;
}
var _89e=function(attr,cell,_89f){
var _8a0=d.trim(d.attr(node,attr)||"")||undefined;
if(_8a0){
cell[_89f||attr]=_8a0;
}
};
_89e("styles",_898);
_89e("headerStyles",_898);
_89e("cellStyles",_898);
_89e("classes",_898);
_89e("headerClasses",_898);
_89e("cellClasses",_898);
};
dojo.declare("dojox.grid.cells.Cell",dgc._Base,{constructor:function(){
this.keyFilter=this.keyFilter;
},keyFilter:null,formatEditing:function(_8a1,_8a2){
this.needFormatNode(_8a1,_8a2);
return "<input class=\"dojoxGridInput\" type=\"text\" value=\""+_8a1+"\">";
},formatNode:function(_8a3,_8a4,_8a5){
this.inherited(arguments);
this.registerOnBlur(_8a3,_8a5);
},doKey:function(e){
if(this.keyFilter){
var key=String.fromCharCode(e.charCode);
if(key.search(this.keyFilter)==-1){
dojo.stopEvent(e);
}
}
},_finish:function(_8a6){
this.inherited(arguments);
var n=this.getEditNode(_8a6);
try{
dojox.grid.util.fire(n,"blur");
}
catch(e){
}
}});
dgc.Cell.markupFactory=function(node,_8a7){
dgc._Base.markupFactory(node,_8a7);
var d=dojo;
var _8a8=d.trim(d.attr(node,"keyFilter")||"");
if(_8a8){
_8a7.keyFilter=new RegExp(_8a8);
}
};
dojo.declare("dojox.grid.cells.RowIndex",dgc.Cell,{name:"Row",postscript:function(){
this.editable=false;
},get:function(_8a9){
return _8a9+1;
}});
dgc.RowIndex.markupFactory=function(node,_8aa){
dgc.Cell.markupFactory(node,_8aa);
};
dojo.declare("dojox.grid.cells.Select",dgc.Cell,{options:null,values:null,returnIndex:-1,constructor:function(_8ab){
this.values=this.values||this.options;
},formatEditing:function(_8ac,_8ad){
this.needFormatNode(_8ac,_8ad);
var h=["<select class=\"dojoxGridSelect\">"];
for(var i=0,o,v;((o=this.options[i])!==undefined)&&((v=this.values[i])!==undefined);i++){
h.push("<option",(_8ac==v?" selected":"")," value=\""+v+"\"",">",o,"</option>");
}
h.push("</select>");
return h.join("");
},getValue:function(_8ae){
var n=this.getEditNode(_8ae);
if(n){
var i=n.selectedIndex,o=n.options[i];
return this.returnIndex>-1?i:o.value||o.innerHTML;
}
}});
dgc.Select.markupFactory=function(node,cell){
dgc.Cell.markupFactory(node,cell);
var d=dojo;
var _8af=d.trim(d.attr(node,"options")||"");
if(_8af){
var o=_8af.split(",");
if(o[0]!=_8af){
cell.options=o;
}
}
var _8b0=d.trim(d.attr(node,"values")||"");
if(_8b0){
var v=_8b0.split(",");
if(v[0]!=_8b0){
cell.values=v;
}
}
};
dojo.declare("dojox.grid.cells.AlwaysEdit",dgc.Cell,{alwaysEditing:true,_formatNode:function(_8b1,_8b2){
this.formatNode(this.getEditNode(_8b2),_8b1,_8b2);
},applyStaticValue:function(_8b3){
var e=this.grid.edit;
e.applyCellEdit(this.getValue(_8b3),this,_8b3);
e.start(this,_8b3,true);
}});
dgc.AlwaysEdit.markupFactory=function(node,cell){
dgc.Cell.markupFactory(node,cell);
};
dojo.declare("dojox.grid.cells.Bool",dgc.AlwaysEdit,{_valueProp:"checked",formatEditing:function(_8b4,_8b5){
return "<input class=\"dojoxGridInput\" type=\"checkbox\""+(_8b4?" checked=\"checked\"":"")+" style=\"width: auto\" />";
},doclick:function(e){
if(e.target.tagName=="INPUT"){
this.applyStaticValue(e.rowIndex);
}
}});
dgc.Bool.markupFactory=function(node,cell){
dgc.AlwaysEdit.markupFactory(node,cell);
};
})();
}
if(!dojo._hasResource["dojox.grid.cells"]){
dojo._hasResource["dojox.grid.cells"]=true;
dojo.provide("dojox.grid.cells");
}
if(!dojo._hasResource["dojox.grid._Builder"]){
dojo._hasResource["dojox.grid._Builder"]=true;
dojo.provide("dojox.grid._Builder");
(function(){
var dg=dojox.grid;
var _8b6=function(td){
return td.cellIndex>=0?td.cellIndex:dojo.indexOf(td.parentNode.cells,td);
};
var _8b7=function(tr){
return tr.rowIndex>=0?tr.rowIndex:dojo.indexOf(tr.parentNode.childNodes,tr);
};
var _8b8=function(_8b9,_8ba){
return _8b9&&((_8b9.rows||0)[_8ba]||_8b9.childNodes[_8ba]);
};
var _8bb=function(node){
for(var n=node;n&&n.tagName!="TABLE";n=n.parentNode){
}
return n;
};
var _8bc=function(_8bd,_8be){
for(var n=_8bd;n&&_8be(n);n=n.parentNode){
}
return n;
};
var _8bf=function(_8c0){
var name=_8c0.toUpperCase();
return function(node){
return node.tagName!=name;
};
};
var _8c1=dojox.grid.util.rowIndexTag;
var _8c2=dojox.grid.util.gridViewTag;
dg._Builder=dojo.extend(function(view){
if(view){
this.view=view;
this.grid=view.grid;
}
},{view:null,_table:"<table class=\"dojoxGridRowTable\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\"",getTableArray:function(){
var html=[this._table];
if(this.view.viewWidth){
html.push([" style=\"width:",this.view.viewWidth,";\""].join(""));
}
html.push(">");
return html;
},generateCellMarkup:function(_8c3,_8c4,_8c5,_8c6){
var _8c7=[],html;
if(_8c6){
var _8c8=_8c3.index!=_8c3.grid.getSortIndex()?"":_8c3.grid.sortInfo>0?"aria-sort=\"ascending\"":"aria-sort=\"descending\"";
if(!_8c3.id){
_8c3.id=this.grid.id+"Hdr"+_8c3.index;
}
html=["<th tabIndex=\"-1\" aria-readonly=\"true\" role=\"columnheader\"",_8c8,"id=\"",_8c3.id,"\""];
}else{
var _8c9=this.grid.editable&&!_8c3.editable?"aria-readonly=\"true\"":"";
html=["<td tabIndex=\"-1\" role=\"gridcell\"",_8c9];
}
if(_8c3.colSpan){
html.push(" colspan=\"",_8c3.colSpan,"\"");
}
if(_8c3.rowSpan){
html.push(" rowspan=\"",_8c3.rowSpan,"\"");
}
html.push(" class=\"dojoxGridCell ");
if(_8c3.classes){
html.push(_8c3.classes," ");
}
if(_8c5){
html.push(_8c5," ");
}
_8c7.push(html.join(""));
_8c7.push("");
html=["\" idx=\"",_8c3.index,"\" style=\""];
if(_8c4&&_8c4[_8c4.length-1]!=";"){
_8c4+=";";
}
html.push(_8c3.styles,_8c4||"",_8c3.hidden?"display:none;":"");
if(_8c3.unitWidth){
html.push("width:",_8c3.unitWidth,";");
}
_8c7.push(html.join(""));
_8c7.push("");
html=["\""];
if(_8c3.attrs){
html.push(" ",_8c3.attrs);
}
html.push(">");
_8c7.push(html.join(""));
_8c7.push("");
_8c7.push(_8c6?"</th>":"</td>");
return _8c7;
},isCellNode:function(_8ca){
return Boolean(_8ca&&_8ca!=dojo.doc&&dojo.attr(_8ca,"idx"));
},getCellNodeIndex:function(_8cb){
return _8cb?Number(dojo.attr(_8cb,"idx")):-1;
},getCellNode:function(_8cc,_8cd){
for(var i=0,row;(row=_8b8(_8cc.firstChild,i));i++){
for(var j=0,cell;(cell=row.cells[j]);j++){
if(this.getCellNodeIndex(cell)==_8cd){
return cell;
}
}
}
return null;
},findCellTarget:function(_8ce,_8cf){
var n=_8ce;
while(n&&(!this.isCellNode(n)||(n.offsetParent&&_8c2 in n.offsetParent.parentNode&&n.offsetParent.parentNode[_8c2]!=this.view.id))&&(n!=_8cf)){
n=n.parentNode;
}
return n!=_8cf?n:null;
},baseDecorateEvent:function(e){
e.dispatch="do"+e.type;
e.grid=this.grid;
e.sourceView=this.view;
e.cellNode=this.findCellTarget(e.target,e.rowNode);
e.cellIndex=this.getCellNodeIndex(e.cellNode);
e.cell=(e.cellIndex>=0?this.grid.getCell(e.cellIndex):null);
},findTarget:function(_8d0,_8d1){
var n=_8d0;
while(n&&(n!=this.domNode)&&(!(_8d1 in n)||(_8c2 in n&&n[_8c2]!=this.view.id))){
n=n.parentNode;
}
return (n!=this.domNode)?n:null;
},findRowTarget:function(_8d2){
return this.findTarget(_8d2,_8c1);
},isIntraNodeEvent:function(e){
try{
return (e.cellNode&&e.relatedTarget&&dojo.isDescendant(e.relatedTarget,e.cellNode));
}
catch(x){
return false;
}
},isIntraRowEvent:function(e){
try{
var row=e.relatedTarget&&this.findRowTarget(e.relatedTarget);
return !row&&(e.rowIndex==-1)||row&&(e.rowIndex==row.gridRowIndex);
}
catch(x){
return false;
}
},dispatchEvent:function(e){
if(e.dispatch in this){
return this[e.dispatch](e);
}
return false;
},domouseover:function(e){
if(e.cellNode&&(e.cellNode!=this.lastOverCellNode)){
this.lastOverCellNode=e.cellNode;
this.grid.onMouseOver(e);
}
this.grid.onMouseOverRow(e);
},domouseout:function(e){
if(e.cellNode&&(e.cellNode==this.lastOverCellNode)&&!this.isIntraNodeEvent(e,this.lastOverCellNode)){
this.lastOverCellNode=null;
this.grid.onMouseOut(e);
if(!this.isIntraRowEvent(e)){
this.grid.onMouseOutRow(e);
}
}
},domousedown:function(e){
if(e.cellNode){
this.grid.onMouseDown(e);
}
this.grid.onMouseDownRow(e);
}});
dg._ContentBuilder=dojo.extend(function(view){
dg._Builder.call(this,view);
},dg._Builder.prototype,{update:function(){
this.prepareHtml();
},prepareHtml:function(){
var _8d3=this.grid.get,_8d4=this.view.structure.cells;
for(var j=0,row;(row=_8d4[j]);j++){
for(var i=0,cell;(cell=row[i]);i++){
cell.get=cell.get||(cell.value==undefined)&&_8d3;
cell.markup=this.generateCellMarkup(cell,cell.cellStyles,cell.cellClasses,false);
if(!this.grid.editable&&cell.editable){
this.grid.editable=true;
}
}
}
},generateHtml:function(_8d5,_8d6){
var html=this.getTableArray(),v=this.view,_8d7=v.structure.cells,item=this.grid.getItem(_8d6);
dojox.grid.util.fire(this.view,"onBeforeRow",[_8d6,_8d7]);
for(var j=0,row;(row=_8d7[j]);j++){
if(row.hidden||row.header){
continue;
}
html.push(!row.invisible?"<tr>":"<tr class=\"dojoxGridInvisible\">");
for(var i=0,cell,m,cc,cs;(cell=row[i]);i++){
m=cell.markup;
cc=cell.customClasses=[];
cs=cell.customStyles=[];
m[5]=cell.format(_8d6,item);
m[1]=cc.join(" ");
m[3]=cs.join(";");
html.push.apply(html,m);
}
html.push("</tr>");
}
html.push("</table>");
return html.join("");
},decorateEvent:function(e){
e.rowNode=this.findRowTarget(e.target);
if(!e.rowNode){
return false;
}
e.rowIndex=e.rowNode[_8c1];
this.baseDecorateEvent(e);
e.cell=this.grid.getCell(e.cellIndex);
return true;
}});
dg._HeaderBuilder=dojo.extend(function(view){
this.moveable=null;
dg._Builder.call(this,view);
},dg._Builder.prototype,{_skipBogusClicks:false,overResizeWidth:4,minColWidth:1,update:function(){
if(this.tableMap){
this.tableMap.mapRows(this.view.structure.cells);
}else{
this.tableMap=new dg._TableMap(this.view.structure.cells);
}
},generateHtml:function(_8d8,_8d9){
var html=this.getTableArray(),_8da=this.view.structure.cells;
dojox.grid.util.fire(this.view,"onBeforeRow",[-1,_8da]);
for(var j=0,row;(row=_8da[j]);j++){
if(row.hidden){
continue;
}
html.push(!row.invisible?"<tr>":"<tr class=\"dojoxGridInvisible\">");
for(var i=0,cell,_8db;(cell=row[i]);i++){
cell.customClasses=[];
cell.customStyles=[];
if(this.view.simpleStructure){
if(cell.draggable){
if(cell.headerClasses){
if(cell.headerClasses.indexOf("dojoDndItem")==-1){
cell.headerClasses+=" dojoDndItem";
}
}else{
cell.headerClasses="dojoDndItem";
}
}
if(cell.attrs){
if(cell.attrs.indexOf("dndType='gridColumn_")==-1){
cell.attrs+=" dndType='gridColumn_"+this.grid.id+"'";
}
}else{
cell.attrs="dndType='gridColumn_"+this.grid.id+"'";
}
}
_8db=this.generateCellMarkup(cell,cell.headerStyles,cell.headerClasses,true);
_8db[5]=(_8d9!=undefined?_8d9:_8d8(cell));
_8db[3]=cell.customStyles.join(";");
_8db[1]=cell.customClasses.join(" ");
html.push(_8db.join(""));
}
html.push("</tr>");
}
html.push("</table>");
return html.join("");
},getCellX:function(e){
var n,x=e.layerX;
if(dojo.isMoz){
n=_8bc(e.target,_8bf("th"));
x-=(n&&n.offsetLeft)||0;
var t=e.sourceView.getScrollbarWidth();
if(!dojo._isBodyLtr()){
table=_8bc(n,_8bf("table"));
x-=(table&&table.offsetLeft)||0;
}
}
n=_8bc(e.target,function(){
if(!n||n==e.cellNode){
return false;
}
x+=(n.offsetLeft<0?0:n.offsetLeft);
return true;
});
return x;
},decorateEvent:function(e){
this.baseDecorateEvent(e);
e.rowIndex=-1;
e.cellX=this.getCellX(e);
return true;
},prepareResize:function(e,mod){
do{
var i=_8b6(e.cellNode);
e.cellNode=(i?e.cellNode.parentNode.cells[i+mod]:null);
e.cellIndex=(e.cellNode?this.getCellNodeIndex(e.cellNode):-1);
}while(e.cellNode&&e.cellNode.style.display=="none");
return Boolean(e.cellNode);
},canResize:function(e){
if(!e.cellNode||e.cellNode.colSpan>1){
return false;
}
var cell=this.grid.getCell(e.cellIndex);
return !cell.noresize&&cell.canResize();
},overLeftResizeArea:function(e){
if(dojo.hasClass(dojo.body(),"dojoDndMove")){
return false;
}
if(dojo.isIE){
var tN=e.target;
if(dojo.hasClass(tN,"dojoxGridArrowButtonNode")||dojo.hasClass(tN,"dojoxGridArrowButtonChar")){
return false;
}
}
if(dojo._isBodyLtr()){
return (e.cellIndex>0)&&(e.cellX>0&&e.cellX<this.overResizeWidth)&&this.prepareResize(e,-1);
}
var t=e.cellNode&&(e.cellX>0&&e.cellX<this.overResizeWidth);
return t;
},overRightResizeArea:function(e){
if(dojo.hasClass(dojo.body(),"dojoDndMove")){
return false;
}
if(dojo.isIE){
var tN=e.target;
if(dojo.hasClass(tN,"dojoxGridArrowButtonNode")||dojo.hasClass(tN,"dojoxGridArrowButtonChar")){
return false;
}
}
if(dojo._isBodyLtr()){
return e.cellNode&&(e.cellX>=e.cellNode.offsetWidth-this.overResizeWidth);
}
return (e.cellIndex>0)&&(e.cellX>=e.cellNode.offsetWidth-this.overResizeWidth)&&this.prepareResize(e,-1);
},domousemove:function(e){
if(!this.moveable){
var c=(this.overRightResizeArea(e)?"dojoxGridColResize":(this.overLeftResizeArea(e)?"dojoxGridColResize":""));
if(c&&!this.canResize(e)){
c="dojoxGridColNoResize";
}
dojo.toggleClass(e.sourceView.headerNode,"dojoxGridColNoResize",(c=="dojoxGridColNoResize"));
dojo.toggleClass(e.sourceView.headerNode,"dojoxGridColResize",(c=="dojoxGridColResize"));
if(dojo.isIE){
var t=e.sourceView.headerNode.scrollLeft;
e.sourceView.headerNode.scrollLeft=t;
}
if(c){
dojo.stopEvent(e);
}
}
},domousedown:function(e){
if(!this.moveable){
if((this.overRightResizeArea(e)||this.overLeftResizeArea(e))&&this.canResize(e)){
this.beginColumnResize(e);
}else{
this.grid.onMouseDown(e);
this.grid.onMouseOverRow(e);
}
}
},doclick:function(e){
if(this._skipBogusClicks){
dojo.stopEvent(e);
return true;
}
return false;
},colResizeSetup:function(e,_8dc){
var _8dd=dojo.contentBox(e.sourceView.headerNode);
if(_8dc){
this.lineDiv=document.createElement("div");
var vw=(dojo.position||dojo._abs)(e.sourceView.headerNode,true);
var _8de=dojo.contentBox(e.sourceView.domNode);
var l=e.pageX;
if(!dojo._isBodyLtr()&&dojo.isIE<8){
l-=dojox.html.metrics.getScrollbar().w;
}
dojo.style(this.lineDiv,{top:vw.y+"px",left:l+"px",height:(_8de.h+_8dd.h)+"px"});
dojo.addClass(this.lineDiv,"dojoxGridResizeColLine");
this.lineDiv._origLeft=l;
dojo.body().appendChild(this.lineDiv);
}
var _8df=[],_8e0=this.tableMap.findOverlappingNodes(e.cellNode);
for(var i=0,cell;(cell=_8e0[i]);i++){
_8df.push({node:cell,index:this.getCellNodeIndex(cell),width:cell.offsetWidth});
}
var view=e.sourceView;
var adj=dojo._isBodyLtr()?1:-1;
var _8e1=e.grid.views.views;
var _8e2=[];
for(var j=view.idx+adj,_8e3;(_8e3=_8e1[j]);j=j+adj){
_8e2.push({node:_8e3.headerNode,left:window.parseInt(_8e3.headerNode.style.left)});
}
var _8e4=view.headerContentNode.firstChild;
var drag={scrollLeft:e.sourceView.headerNode.scrollLeft,view:view,node:e.cellNode,index:e.cellIndex,w:dojo.contentBox(e.cellNode).w,vw:_8dd.w,table:_8e4,tw:dojo.contentBox(_8e4).w,spanners:_8df,followers:_8e2};
return drag;
},beginColumnResize:function(e){
this.moverDiv=document.createElement("div");
dojo.style(this.moverDiv,{position:"absolute",left:0});
dojo.body().appendChild(this.moverDiv);
dojo.addClass(this.grid.domNode,"dojoxGridColumnResizing");
var m=(this.moveable=new dojo.dnd.Moveable(this.moverDiv));
var drag=this.colResizeSetup(e,true);
m.onMove=dojo.hitch(this,"doResizeColumn",drag);
dojo.connect(m,"onMoveStop",dojo.hitch(this,function(){
this.endResizeColumn(drag);
if(drag.node.releaseCapture){
drag.node.releaseCapture();
}
this.moveable.destroy();
delete this.moveable;
this.moveable=null;
dojo.removeClass(this.grid.domNode,"dojoxGridColumnResizing");
}));
if(e.cellNode.setCapture){
e.cellNode.setCapture();
}
m.onMouseDown(e);
},doResizeColumn:function(_8e5,_8e6,_8e7){
var _8e8=_8e7.l;
var data={deltaX:_8e8,w:_8e5.w+(dojo._isBodyLtr()?_8e8:-_8e8),vw:_8e5.vw+_8e8,tw:_8e5.tw+_8e8};
this.dragRecord={inDrag:_8e5,mover:_8e6,leftTop:_8e7};
if(data.w>=this.minColWidth){
if(!_8e6){
this.doResizeNow(_8e5,data);
}else{
dojo.style(this.lineDiv,"left",(this.lineDiv._origLeft+data.deltaX)+"px");
}
}
},endResizeColumn:function(_8e9){
if(this.dragRecord){
var _8ea=this.dragRecord.leftTop;
var _8eb=dojo._isBodyLtr()?_8ea.l:-_8ea.l;
_8eb+=Math.max(_8e9.w+_8eb,this.minColWidth)-(_8e9.w+_8eb);
if(dojo.isWebKit&&_8e9.spanners.length){
_8eb+=dojo._getPadBorderExtents(_8e9.spanners[0].node).w;
}
var data={deltaX:_8eb,w:_8e9.w+_8eb,vw:_8e9.vw+_8eb,tw:_8e9.tw+_8eb};
this.doResizeNow(_8e9,data);
delete this.dragRecord;
}
dojo.destroy(this.lineDiv);
dojo.destroy(this.moverDiv);
dojo.destroy(this.moverDiv);
delete this.moverDiv;
this._skipBogusClicks=true;
_8e9.view.update();
this._skipBogusClicks=false;
this.grid.onResizeColumn(_8e9.index);
},doResizeNow:function(_8ec,data){
_8ec.view.convertColPctToFixed();
if(_8ec.view.flexCells&&!_8ec.view.testFlexCells()){
var t=_8bb(_8ec.node);
if(t){
(t.style.width="");
}
}
var i,s,sw,f,fl;
for(i=0;(s=_8ec.spanners[i]);i++){
sw=s.width+data.deltaX;
s.node.style.width=sw+"px";
_8ec.view.setColWidth(s.index,sw);
}
if(dojo._isBodyLtr()||!dojo.isIE){
for(i=0;(f=_8ec.followers[i]);i++){
fl=f.left+data.deltaX;
f.node.style.left=fl+"px";
}
}
_8ec.node.style.width=data.w+"px";
_8ec.view.setColWidth(_8ec.index,data.w);
_8ec.view.headerNode.style.width=data.vw+"px";
_8ec.view.setColumnsWidth(data.tw);
if(!dojo._isBodyLtr()){
_8ec.view.headerNode.scrollLeft=_8ec.scrollLeft+data.deltaX;
}
}});
dg._TableMap=dojo.extend(function(rows){
this.mapRows(rows);
},{map:null,mapRows:function(_8ed){
var _8ee=_8ed.length;
if(!_8ee){
return;
}
this.map=[];
var row;
for(var k=0;(row=_8ed[k]);k++){
this.map[k]=[];
}
for(var j=0;(row=_8ed[j]);j++){
for(var i=0,x=0,cell,_8ef,_8f0;(cell=row[i]);i++){
while(this.map[j][x]){
x++;
}
this.map[j][x]={c:i,r:j};
_8f0=cell.rowSpan||1;
_8ef=cell.colSpan||1;
for(var y=0;y<_8f0;y++){
for(var s=0;s<_8ef;s++){
this.map[j+y][x+s]=this.map[j][x];
}
}
x+=_8ef;
}
}
},dumpMap:function(){
for(var j=0,row,h="";(row=this.map[j]);j++,h=""){
for(var i=0,cell;(cell=row[i]);i++){
h+=cell.r+","+cell.c+"   ";
}
}
},getMapCoords:function(_8f1,_8f2){
for(var j=0,row;(row=this.map[j]);j++){
for(var i=0,cell;(cell=row[i]);i++){
if(cell.c==_8f2&&cell.r==_8f1){
return {j:j,i:i};
}
}
}
return {j:-1,i:-1};
},getNode:function(_8f3,_8f4,_8f5){
var row=_8f3&&_8f3.rows[_8f4];
return row&&row.cells[_8f5];
},_findOverlappingNodes:function(_8f6,_8f7,_8f8){
var _8f9=[];
var m=this.getMapCoords(_8f7,_8f8);
for(var j=0,row;(row=this.map[j]);j++){
if(j==m.j){
continue;
}
var rw=row[m.i];
var n=(rw?this.getNode(_8f6,rw.r,rw.c):null);
if(n){
_8f9.push(n);
}
}
return _8f9;
},findOverlappingNodes:function(_8fa){
return this._findOverlappingNodes(_8bb(_8fa),_8b7(_8fa.parentNode),_8b6(_8fa));
}});
})();
}
if(!dojo._hasResource["dojox.grid._View"]){
dojo._hasResource["dojox.grid._View"]=true;
dojo.provide("dojox.grid._View");
(function(){
var _8fb=function(_8fc,_8fd){
return _8fc.style.cssText==undefined?_8fc.getAttribute("style"):_8fc.style.cssText;
};
dojo.declare("dojox.grid._View",[dijit._Widget,dijit._Templated],{defaultWidth:"18em",viewWidth:"",templateString:"<div class=\"dojoxGridView\" role=\"presentation\">\r\n\t<div class=\"dojoxGridHeader\" dojoAttachPoint=\"headerNode\" role=\"presentation\">\r\n\t\t<div dojoAttachPoint=\"headerNodeContainer\" style=\"width:9000em\" role=\"presentation\">\r\n\t\t\t<div dojoAttachPoint=\"headerContentNode\" role=\"row\"></div>\r\n\t\t</div>\r\n\t</div>\r\n\t<input type=\"checkbox\" class=\"dojoxGridHiddenFocus\" dojoAttachPoint=\"hiddenFocusNode\" role=\"presentation\" />\r\n\t<input type=\"checkbox\" class=\"dojoxGridHiddenFocus\" role=\"presentation\" />\r\n\t<div class=\"dojoxGridScrollbox\" dojoAttachPoint=\"scrollboxNode\" role=\"presentation\">\r\n\t\t<div class=\"dojoxGridContent\" dojoAttachPoint=\"contentNode\" hidefocus=\"hidefocus\" role=\"presentation\"></div>\r\n\t</div>\r\n</div>\r\n",themeable:false,classTag:"dojoxGrid",marginBottom:0,rowPad:2,_togglingColumn:-1,_headerBuilderClass:dojox.grid._HeaderBuilder,_contentBuilderClass:dojox.grid._ContentBuilder,postMixInProperties:function(){
this.rowNodes={};
},postCreate:function(){
this.connect(this.scrollboxNode,"onscroll","doscroll");
dojox.grid.util.funnelEvents(this.contentNode,this,"doContentEvent",["mouseover","mouseout","click","dblclick","contextmenu","mousedown"]);
dojox.grid.util.funnelEvents(this.headerNode,this,"doHeaderEvent",["dblclick","mouseover","mouseout","mousemove","mousedown","click","contextmenu"]);
this.content=new this._contentBuilderClass(this);
this.header=new this._headerBuilderClass(this);
if(!dojo._isBodyLtr()){
this.headerNodeContainer.style.width="";
}
},destroy:function(){
dojo.destroy(this.headerNode);
delete this.headerNode;
for(var i in this.rowNodes){
dojo.destroy(this.rowNodes[i]);
}
this.rowNodes={};
if(this.source){
this.source.destroy();
}
this.inherited(arguments);
},focus:function(){
if(dojo.isIE||dojo.isWebKit||dojo.isOpera){
this.hiddenFocusNode.focus();
}else{
this.scrollboxNode.focus();
}
},setStructure:function(_8fe){
var vs=(this.structure=_8fe);
if(vs.width&&!isNaN(vs.width)){
this.viewWidth=vs.width+"em";
}else{
this.viewWidth=vs.width||(vs.noscroll?"auto":this.viewWidth);
}
this._onBeforeRow=vs.onBeforeRow||function(){
};
this._onAfterRow=vs.onAfterRow||function(){
};
this.noscroll=vs.noscroll;
if(this.noscroll){
this.scrollboxNode.style.overflow="hidden";
}
this.simpleStructure=Boolean(vs.cells.length==1);
this.testFlexCells();
this.updateStructure();
},_cleanupRowWidgets:function(_8ff){
if(_8ff){
dojo.forEach(dojo.query("[widgetId]",_8ff).map(dijit.byNode),function(w){
if(w._destroyOnRemove){
w.destroy();
delete w;
}else{
if(w.domNode&&w.domNode.parentNode){
w.domNode.parentNode.removeChild(w.domNode);
}
}
});
}
},onBeforeRow:function(_900,_901){
this._onBeforeRow(_900,_901);
if(_900>=0){
this._cleanupRowWidgets(this.getRowNode(_900));
}
},onAfterRow:function(_902,_903,_904){
this._onAfterRow(_902,_903,_904);
var g=this.grid;
dojo.forEach(dojo.query(".dojoxGridStubNode",_904),function(n){
if(n&&n.parentNode){
var lw=n.getAttribute("linkWidget");
var _905=window.parseInt(dojo.attr(n,"cellIdx"),10);
var _906=g.getCell(_905);
var w=dijit.byId(lw);
if(w){
n.parentNode.replaceChild(w.domNode,n);
if(!w._started){
w.startup();
}
}else{
n.innerHTML="";
}
}
},this);
},testFlexCells:function(){
this.flexCells=false;
for(var j=0,row;(row=this.structure.cells[j]);j++){
for(var i=0,cell;(cell=row[i]);i++){
cell.view=this;
this.flexCells=this.flexCells||cell.isFlex();
}
}
return this.flexCells;
},updateStructure:function(){
this.header.update();
this.content.update();
},getScrollbarWidth:function(){
var _907=this.hasVScrollbar();
var _908=dojo.style(this.scrollboxNode,"overflow");
if(this.noscroll||!_908||_908=="hidden"){
_907=false;
}else{
if(_908=="scroll"){
_907=true;
}
}
return (_907?dojox.html.metrics.getScrollbar().w:0);
},getColumnsWidth:function(){
var h=this.headerContentNode;
return h&&h.firstChild?h.firstChild.offsetWidth:0;
},setColumnsWidth:function(_909){
this.headerContentNode.firstChild.style.width=_909+"px";
if(this.viewWidth){
this.viewWidth=_909+"px";
}
},getWidth:function(){
return this.viewWidth||(this.getColumnsWidth()+this.getScrollbarWidth())+"px";
},getContentWidth:function(){
return Math.max(0,dojo._getContentBox(this.domNode).w-this.getScrollbarWidth())+"px";
},render:function(){
this.scrollboxNode.style.height="";
this.renderHeader();
if(this._togglingColumn>=0){
this.setColumnsWidth(this.getColumnsWidth()-this._togglingColumn);
this._togglingColumn=-1;
}
var _90a=this.grid.layout.cells;
var _90b=dojo.hitch(this,function(node,_90c){
!dojo._isBodyLtr()&&(_90c=!_90c);
var inc=_90c?-1:1;
var idx=this.header.getCellNodeIndex(node)+inc;
var cell=_90a[idx];
while(cell&&cell.getHeaderNode()&&cell.getHeaderNode().style.display=="none"){
idx+=inc;
cell=_90a[idx];
}
if(cell){
return cell.getHeaderNode();
}
return null;
});
if(this.grid.columnReordering&&this.simpleStructure){
if(this.source){
this.source.destroy();
}
var _90d="dojoxGrid_bottomMarker";
var _90e="dojoxGrid_topMarker";
if(this.bottomMarker){
dojo.destroy(this.bottomMarker);
}
this.bottomMarker=dojo.byId(_90d);
if(this.topMarker){
dojo.destroy(this.topMarker);
}
this.topMarker=dojo.byId(_90e);
if(!this.bottomMarker){
this.bottomMarker=dojo.create("div",{"id":_90d,"class":"dojoxGridColPlaceBottom"},dojo.body());
this._hide(this.bottomMarker);
this.topMarker=dojo.create("div",{"id":_90e,"class":"dojoxGridColPlaceTop"},dojo.body());
this._hide(this.topMarker);
}
this.arrowDim=dojo.contentBox(this.bottomMarker);
var _90f=dojo.contentBox(this.headerContentNode.firstChild.rows[0]).h;
this.source=new dojo.dnd.Source(this.headerContentNode.firstChild.rows[0],{horizontal:true,accept:["gridColumn_"+this.grid.id],viewIndex:this.index,generateText:false,onMouseDown:dojo.hitch(this,function(e){
this.header.decorateEvent(e);
if((this.header.overRightResizeArea(e)||this.header.overLeftResizeArea(e))&&this.header.canResize(e)&&!this.header.moveable){
this.header.beginColumnResize(e);
}else{
if(this.grid.headerMenu){
this.grid.headerMenu.onCancel(true);
}
if(e.button===(dojo.isIE?1:0)){
dojo.dnd.Source.prototype.onMouseDown.call(this.source,e);
}
}
}),onMouseOver:dojo.hitch(this,function(e){
var src=this.source;
if(src._getChildByEvent(e)){
dojo.dnd.Source.prototype.onMouseOver.apply(src,arguments);
}
}),_markTargetAnchor:dojo.hitch(this,function(_910){
var src=this.source;
if(src.current==src.targetAnchor&&src.before==_910){
return;
}
if(src.targetAnchor&&_90b(src.targetAnchor,src.before)){
src._removeItemClass(_90b(src.targetAnchor,src.before),src.before?"After":"Before");
}
dojo.dnd.Source.prototype._markTargetAnchor.call(src,_910);
var _911=_910?src.targetAnchor:_90b(src.targetAnchor,src.before);
var _912=0;
if(!_911){
_911=src.targetAnchor;
_912=dojo.contentBox(_911).w+this.arrowDim.w/2+2;
}
var pos=(dojo.position||dojo._abs)(_911,true);
var left=Math.floor(pos.x-this.arrowDim.w/2+_912);
dojo.style(this.bottomMarker,"visibility","visible");
dojo.style(this.topMarker,"visibility","visible");
dojo.style(this.bottomMarker,{"left":left+"px","top":(_90f+pos.y)+"px"});
dojo.style(this.topMarker,{"left":left+"px","top":(pos.y-this.arrowDim.h)+"px"});
if(src.targetAnchor&&_90b(src.targetAnchor,src.before)){
src._addItemClass(_90b(src.targetAnchor,src.before),src.before?"After":"Before");
}
}),_unmarkTargetAnchor:dojo.hitch(this,function(){
var src=this.source;
if(!src.targetAnchor){
return;
}
if(src.targetAnchor&&_90b(src.targetAnchor,src.before)){
src._removeItemClass(_90b(src.targetAnchor,src.before),src.before?"After":"Before");
}
this._hide(this.bottomMarker);
this._hide(this.topMarker);
dojo.dnd.Source.prototype._unmarkTargetAnchor.call(src);
}),destroy:dojo.hitch(this,function(){
dojo.disconnect(this._source_conn);
dojo.unsubscribe(this._source_sub);
dojo.dnd.Source.prototype.destroy.call(this.source);
if(this.bottomMarker){
dojo.destroy(this.bottomMarker);
delete this.bottomMarker;
}
if(this.topMarker){
dojo.destroy(this.topMarker);
delete this.topMarker;
}
}),onDndCancel:dojo.hitch(this,function(){
dojo.dnd.Source.prototype.onDndCancel.call(this.source);
this._hide(this.bottomMarker);
this._hide(this.topMarker);
})});
this._source_conn=dojo.connect(this.source,"onDndDrop",this,"_onDndDrop");
this._source_sub=dojo.subscribe("/dnd/drop/before",this,"_onDndDropBefore");
this.source.startup();
}
},_hide:function(node){
dojo.style(node,{left:"-10000px",top:"-10000px","visibility":"hidden"});
},_onDndDropBefore:function(_913,_914,copy){
if(dojo.dnd.manager().target!==this.source){
return;
}
this.source._targetNode=this.source.targetAnchor;
this.source._beforeTarget=this.source.before;
var _915=this.grid.views.views;
var _916=_915[_913.viewIndex];
var _917=_915[this.index];
if(_917!=_916){
_916.convertColPctToFixed();
_917.convertColPctToFixed();
}
},_onDndDrop:function(_918,_919,copy){
if(dojo.dnd.manager().target!==this.source){
if(dojo.dnd.manager().source===this.source){
this._removingColumn=true;
}
return;
}
this._hide(this.bottomMarker);
this._hide(this.topMarker);
var _91a=function(n){
return n?dojo.attr(n,"idx"):null;
};
var w=dojo.marginBox(_919[0]).w;
if(_918.viewIndex!==this.index){
var _91b=this.grid.views.views;
var _91c=_91b[_918.viewIndex];
var _91d=_91b[this.index];
if(_91c.viewWidth&&_91c.viewWidth!="auto"){
_91c.setColumnsWidth(_91c.getColumnsWidth()-w);
}
if(_91d.viewWidth&&_91d.viewWidth!="auto"){
_91d.setColumnsWidth(_91d.getColumnsWidth());
}
}
var stn=this.source._targetNode;
var stb=this.source._beforeTarget;
!dojo._isBodyLtr()&&(stb=!stb);
var _91e=this.grid.layout;
var idx=this.index;
delete this.source._targetNode;
delete this.source._beforeTarget;
_91e.moveColumn(_918.viewIndex,idx,_91a(_919[0]),_91a(stn),stb);
},renderHeader:function(){
this.headerContentNode.innerHTML=this.header.generateHtml(this._getHeaderContent);
if(this.flexCells){
this.contentWidth=this.getContentWidth();
this.headerContentNode.firstChild.style.width=this.contentWidth;
}
dojox.grid.util.fire(this,"onAfterRow",[-1,this.structure.cells,this.headerContentNode]);
},_getHeaderContent:function(_91f){
var n=_91f.name||_91f.grid.getCellName(_91f);
var ret=["<div class=\"dojoxGridSortNode"];
if(_91f.index!=_91f.grid.getSortIndex()){
ret.push("\">");
}else{
ret=ret.concat([" ",_91f.grid.sortInfo>0?"dojoxGridSortUp":"dojoxGridSortDown","\"><div class=\"dojoxGridArrowButtonChar\">",_91f.grid.sortInfo>0?"&#9650;":"&#9660;","</div><div class=\"dojoxGridArrowButtonNode\" role=\"presentation\"></div>","<div class=\"dojoxGridColCaption\">"]);
}
ret=ret.concat([n,"</div></div>"]);
return ret.join("");
},resize:function(){
this.adaptHeight();
this.adaptWidth();
},hasHScrollbar:function(_920){
var _921=this._hasHScroll||false;
if(this._hasHScroll==undefined||_920){
if(this.noscroll){
this._hasHScroll=false;
}else{
var _922=dojo.style(this.scrollboxNode,"overflow");
if(_922=="hidden"){
this._hasHScroll=false;
}else{
if(_922=="scroll"){
this._hasHScroll=true;
}else{
this._hasHScroll=(this.scrollboxNode.offsetWidth-this.getScrollbarWidth()<this.contentNode.offsetWidth);
}
}
}
}
if(_921!==this._hasHScroll){
this.grid.update();
}
return this._hasHScroll;
},hasVScrollbar:function(_923){
var _924=this._hasVScroll||false;
if(this._hasVScroll==undefined||_923){
if(this.noscroll){
this._hasVScroll=false;
}else{
var _925=dojo.style(this.scrollboxNode,"overflow");
if(_925=="hidden"){
this._hasVScroll=false;
}else{
if(_925=="scroll"){
this._hasVScroll=true;
}else{
this._hasVScroll=(this.scrollboxNode.scrollHeight>this.scrollboxNode.clientHeight);
}
}
}
}
if(_924!==this._hasVScroll){
this.grid.update();
}
return this._hasVScroll;
},convertColPctToFixed:function(){
var _926=false;
this.grid.initialWidth="";
var _927=dojo.query("th",this.headerContentNode);
var _928=dojo.map(_927,function(c,vIdx){
var w=c.style.width;
dojo.attr(c,"vIdx",vIdx);
if(w&&w.slice(-1)=="%"){
_926=true;
}else{
if(w&&w.slice(-2)=="px"){
return window.parseInt(w,10);
}
}
return dojo.contentBox(c).w;
});
if(_926){
dojo.forEach(this.grid.layout.cells,function(cell,idx){
if(cell.view==this){
var _929=cell.view.getHeaderCellNode(cell.index);
if(_929&&dojo.hasAttr(_929,"vIdx")){
var vIdx=window.parseInt(dojo.attr(_929,"vIdx"));
this.setColWidth(idx,_928[vIdx]);
dojo.removeAttr(_929,"vIdx");
}
}
},this);
return true;
}
return false;
},adaptHeight:function(_92a){
if(!this.grid._autoHeight){
var h=(this.domNode.style.height&&parseInt(this.domNode.style.height.replace(/px/,""),10))||this.domNode.clientHeight;
var self=this;
var _92b=function(){
var v;
for(var i in self.grid.views.views){
v=self.grid.views.views[i];
if(v!==self&&v.hasHScrollbar()){
return true;
}
}
return false;
};
if(_92a||(this.noscroll&&_92b())){
h-=dojox.html.metrics.getScrollbar().h;
}
dojox.grid.util.setStyleHeightPx(this.scrollboxNode,h);
}
this.hasVScrollbar(true);
},adaptWidth:function(){
if(this.flexCells){
this.contentWidth=this.getContentWidth();
this.headerContentNode.firstChild.style.width=this.contentWidth;
}
var w=this.scrollboxNode.offsetWidth-this.getScrollbarWidth();
if(!this._removingColumn){
w=Math.max(w,this.getColumnsWidth())+"px";
}else{
w=Math.min(w,this.getColumnsWidth())+"px";
this._removingColumn=false;
}
var cn=this.contentNode;
cn.style.width=w;
this.hasHScrollbar(true);
},setSize:function(w,h){
var ds=this.domNode.style;
var hs=this.headerNode.style;
if(w){
ds.width=w;
hs.width=w;
}
ds.height=(h>=0?h+"px":"");
},renderRow:function(_92c){
var _92d=this.createRowNode(_92c);
this.buildRow(_92c,_92d);
this.grid.edit.restore(this,_92c);
return _92d;
},createRowNode:function(_92e){
var node=document.createElement("div");
node.className=this.classTag+"Row";
if(this instanceof dojox.grid._RowSelector){
dojo.attr(node,"role","presentation");
}else{
dojo.attr(node,"role","row");
if(this.grid.selectionMode!="none"){
dojo.attr(node,"aria-selected","false");
}
}
node[dojox.grid.util.gridViewTag]=this.id;
node[dojox.grid.util.rowIndexTag]=_92e;
this.rowNodes[_92e]=node;
return node;
},buildRow:function(_92f,_930){
this.buildRowContent(_92f,_930);
this.styleRow(_92f,_930);
},buildRowContent:function(_931,_932){
_932.innerHTML=this.content.generateHtml(_931,_931);
if(this.flexCells&&this.contentWidth){
_932.firstChild.style.width=this.contentWidth;
}
dojox.grid.util.fire(this,"onAfterRow",[_931,this.structure.cells,_932]);
},rowRemoved:function(_933){
if(_933>=0){
this._cleanupRowWidgets(this.getRowNode(_933));
}
this.grid.edit.save(this,_933);
delete this.rowNodes[_933];
},getRowNode:function(_934){
return this.rowNodes[_934];
},getCellNode:function(_935,_936){
var row=this.getRowNode(_935);
if(row){
return this.content.getCellNode(row,_936);
}
},getHeaderCellNode:function(_937){
if(this.headerContentNode){
return this.header.getCellNode(this.headerContentNode,_937);
}
},styleRow:function(_938,_939){
_939._style=_8fb(_939);
this.styleRowNode(_938,_939);
},styleRowNode:function(_93a,_93b){
if(_93b){
this.doStyleRowNode(_93a,_93b);
}
},doStyleRowNode:function(_93c,_93d){
this.grid.styleRowNode(_93c,_93d);
},updateRow:function(_93e){
var _93f=this.getRowNode(_93e);
if(_93f){
_93f.style.height="";
this.buildRow(_93e,_93f);
}
return _93f;
},updateRowStyles:function(_940){
this.styleRowNode(_940,this.getRowNode(_940));
},lastTop:0,firstScroll:0,doscroll:function(_941){
var _942=dojo._isBodyLtr();
if(this.firstScroll<2){
if((!_942&&this.firstScroll==1)||(_942&&this.firstScroll===0)){
var s=dojo.marginBox(this.headerNodeContainer);
if(dojo.isIE){
this.headerNodeContainer.style.width=s.w+this.getScrollbarWidth()+"px";
}else{
if(dojo.isMoz){
this.headerNodeContainer.style.width=s.w-this.getScrollbarWidth()+"px";
this.scrollboxNode.scrollLeft=_942?this.scrollboxNode.clientWidth-this.scrollboxNode.scrollWidth:this.scrollboxNode.scrollWidth-this.scrollboxNode.clientWidth;
}
}
}
this.firstScroll++;
}
this.headerNode.scrollLeft=this.scrollboxNode.scrollLeft;
var top=this.scrollboxNode.scrollTop;
if(top!==this.lastTop){
this.grid.scrollTo(top);
}
},setScrollTop:function(_943){
this.lastTop=_943;
this.scrollboxNode.scrollTop=_943;
return this.scrollboxNode.scrollTop;
},doContentEvent:function(e){
if(this.content.decorateEvent(e)){
this.grid.onContentEvent(e);
}
},doHeaderEvent:function(e){
if(this.header.decorateEvent(e)){
this.grid.onHeaderEvent(e);
}
},dispatchContentEvent:function(e){
return this.content.dispatchEvent(e);
},dispatchHeaderEvent:function(e){
return this.header.dispatchEvent(e);
},setColWidth:function(_944,_945){
this.grid.setCellWidth(_944,_945+"px");
},update:function(){
if(!this.domNode){
return;
}
this.content.update();
this.grid.update();
var left=this.scrollboxNode.scrollLeft;
this.scrollboxNode.scrollLeft=left;
this.headerNode.scrollLeft=left;
}});
dojo.declare("dojox.grid._GridAvatar",dojo.dnd.Avatar,{construct:function(){
var dd=dojo.doc;
var a=dd.createElement("table");
a.cellPadding=a.cellSpacing="0";
a.className="dojoxGridDndAvatar";
a.style.position="absolute";
a.style.zIndex=1999;
a.style.margin="0px";
var b=dd.createElement("tbody");
var tr=dd.createElement("tr");
var td=dd.createElement("td");
var img=dd.createElement("td");
tr.className="dojoxGridDndAvatarItem";
img.className="dojoxGridDndAvatarItemImage";
img.style.width="16px";
var _946=this.manager.source,node;
if(_946.creator){
node=_946._normalizedCreator(_946.getItem(this.manager.nodes[0].id).data,"avatar").node;
}else{
node=this.manager.nodes[0].cloneNode(true);
var _947,_948;
if(node.tagName.toLowerCase()=="tr"){
_947=dd.createElement("table");
_948=dd.createElement("tbody");
_948.appendChild(node);
_947.appendChild(_948);
node=_947;
}else{
if(node.tagName.toLowerCase()=="th"){
_947=dd.createElement("table");
_948=dd.createElement("tbody");
var r=dd.createElement("tr");
_947.cellPadding=_947.cellSpacing="0";
r.appendChild(node);
_948.appendChild(r);
_947.appendChild(_948);
node=_947;
}
}
}
node.id="";
td.appendChild(node);
tr.appendChild(img);
tr.appendChild(td);
dojo.style(tr,"opacity",0.9);
b.appendChild(tr);
a.appendChild(b);
this.node=a;
var m=dojo.dnd.manager();
this.oldOffsetY=m.OFFSET_Y;
m.OFFSET_Y=1;
},destroy:function(){
dojo.dnd.manager().OFFSET_Y=this.oldOffsetY;
this.inherited(arguments);
}});
var _949=dojo.dnd.manager().makeAvatar;
dojo.dnd.manager().makeAvatar=function(){
var src=this.source;
if(src.viewIndex!==undefined&&!dojo.hasClass(dojo.body(),"dijit_a11y")){
return new dojox.grid._GridAvatar(this);
}
return _949.call(dojo.dnd.manager());
};
})();
}
if(!dojo._hasResource["dojox.grid._RowSelector"]){
dojo._hasResource["dojox.grid._RowSelector"]=true;
dojo.provide("dojox.grid._RowSelector");
dojo.declare("dojox.grid._RowSelector",dojox.grid._View,{defaultWidth:"2em",noscroll:true,padBorderWidth:2,buildRendering:function(){
this.inherited("buildRendering",arguments);
this.scrollboxNode.style.overflow="hidden";
this.headerNode.style.visibility="hidden";
},getWidth:function(){
return this.viewWidth||this.defaultWidth;
},buildRowContent:function(_94a,_94b){
var w=this.contentWidth||0;
_94b.innerHTML="<table class=\"dojoxGridRowbarTable\" style=\"width:"+w+"px;height:1px;\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\"><tr><td class=\"dojoxGridRowbarInner\">&nbsp;</td></tr></table>";
},renderHeader:function(){
},updateRow:function(){
},resize:function(){
this.adaptHeight();
},adaptWidth:function(){
if(!("contentWidth" in this)&&this.contentNode){
this.contentWidth=this.contentNode.offsetWidth-this.padBorderWidth;
}
},doStyleRowNode:function(_94c,_94d){
var n=["dojoxGridRowbar dojoxGridNonNormalizedCell"];
if(this.grid.rows.isOver(_94c)){
n.push("dojoxGridRowbarOver");
}
if(this.grid.selection.isSelected(_94c)){
n.push("dojoxGridRowbarSelected");
}
_94d.className=n.join(" ");
},domouseover:function(e){
this.grid.onMouseOverRow(e);
},domouseout:function(e){
if(!this.isIntraRowEvent(e)){
this.grid.onMouseOutRow(e);
}
}});
}
if(!dojo._hasResource["dojox.grid._Layout"]){
dojo._hasResource["dojox.grid._Layout"]=true;
dojo.provide("dojox.grid._Layout");
dojo.declare("dojox.grid._Layout",null,{constructor:function(_94e){
this.grid=_94e;
},cells:[],structure:null,defaultWidth:"6em",moveColumn:function(_94f,_950,_951,_952,_953){
var _954=this.structure[_94f].cells[0];
var _955=this.structure[_950].cells[0];
var cell=null;
var _956=0;
var _957=0;
for(var i=0,c;c=_954[i];i++){
if(c.index==_951){
_956=i;
break;
}
}
cell=_954.splice(_956,1)[0];
cell.view=this.grid.views.views[_950];
for(i=0,c=null;c=_955[i];i++){
if(c.index==_952){
_957=i;
break;
}
}
if(!_953){
_957+=1;
}
_955.splice(_957,0,cell);
var _958=this.grid.getCell(this.grid.getSortIndex());
if(_958){
_958._currentlySorted=this.grid.getSortAsc();
}
this.cells=[];
_951=0;
var v;
for(i=0;v=this.structure[i];i++){
for(var j=0,cs;cs=v.cells[j];j++){
for(var k=0;c=cs[k];k++){
c.index=_951;
this.cells.push(c);
if("_currentlySorted" in c){
var si=_951+1;
si*=c._currentlySorted?1:-1;
this.grid.sortInfo=si;
delete c._currentlySorted;
}
_951++;
}
}
}
dojo.forEach(this.cells,function(c){
var _959=c.markup[2].split(" ");
var _95a=parseInt(_959[1].substring(5));
if(_95a!=c.index){
_959[1]="idx=\""+c.index+"\"";
c.markup[2]=_959.join(" ");
}
});
this.grid.setupHeaderMenu();
},setColumnVisibility:function(_95b,_95c){
var cell=this.cells[_95b];
if(cell.hidden==_95c){
cell.hidden=!_95c;
var v=cell.view,w=v.viewWidth;
if(w&&w!="auto"){
v._togglingColumn=dojo.marginBox(cell.getHeaderNode()).w||0;
}
v.update();
return true;
}else{
return false;
}
},addCellDef:function(_95d,_95e,_95f){
var self=this;
var _960=function(_961){
var w=0;
if(_961.colSpan>1){
w=0;
}else{
w=_961.width||self._defaultCellProps.width||self.defaultWidth;
if(!isNaN(w)){
w=w+"em";
}
}
return w;
};
var _962={grid:this.grid,subrow:_95d,layoutIndex:_95e,index:this.cells.length};
if(_95f&&_95f instanceof dojox.grid.cells._Base){
var _963=dojo.clone(_95f);
_962.unitWidth=_960(_963._props);
_963=dojo.mixin(_963,this._defaultCellProps,_95f._props,_962);
return _963;
}
var _964=_95f.type||_95f.cellType||this._defaultCellProps.type||this._defaultCellProps.cellType||dojox.grid.cells.Cell;
_962.unitWidth=_960(_95f);
return new _964(dojo.mixin({},this._defaultCellProps,_95f,_962));
},addRowDef:function(_965,_966){
var _967=[];
var _968=0,_969=0,_96a=true;
for(var i=0,def,cell;(def=_966[i]);i++){
cell=this.addCellDef(_965,i,def);
_967.push(cell);
this.cells.push(cell);
if(_96a&&cell.relWidth){
_968+=cell.relWidth;
}else{
if(cell.width){
var w=cell.width;
if(typeof w=="string"&&w.slice(-1)=="%"){
_969+=window.parseInt(w,10);
}else{
if(w=="auto"){
_96a=false;
}
}
}
}
}
if(_968&&_96a){
dojo.forEach(_967,function(cell){
if(cell.relWidth){
cell.width=cell.unitWidth=((cell.relWidth/_968)*(100-_969))+"%";
}
});
}
return _967;
},addRowsDef:function(_96b){
var _96c=[];
if(dojo.isArray(_96b)){
if(dojo.isArray(_96b[0])){
for(var i=0,row;_96b&&(row=_96b[i]);i++){
_96c.push(this.addRowDef(i,row));
}
}else{
_96c.push(this.addRowDef(0,_96b));
}
}
return _96c;
},addViewDef:function(_96d){
this._defaultCellProps=_96d.defaultCell||{};
if(_96d.width&&_96d.width=="auto"){
delete _96d.width;
}
return dojo.mixin({},_96d,{cells:this.addRowsDef(_96d.rows||_96d.cells)});
},setStructure:function(_96e){
this.fieldIndex=0;
this.cells=[];
var s=this.structure=[];
if(this.grid.rowSelector){
var sel={type:dojox._scopeName+".grid._RowSelector"};
if(dojo.isString(this.grid.rowSelector)){
var _96f=this.grid.rowSelector;
if(_96f=="false"){
sel=null;
}else{
if(_96f!="true"){
sel["width"]=_96f;
}
}
}else{
if(!this.grid.rowSelector){
sel=null;
}
}
if(sel){
s.push(this.addViewDef(sel));
}
}
var _970=function(def){
return ("name" in def||"field" in def||"get" in def);
};
var _971=function(def){
if(dojo.isArray(def)){
if(dojo.isArray(def[0])||_970(def[0])){
return true;
}
}
return false;
};
var _972=function(def){
return (def!==null&&dojo.isObject(def)&&("cells" in def||"rows" in def||("type" in def&&!_970(def))));
};
if(dojo.isArray(_96e)){
var _973=false;
for(var i=0,st;(st=_96e[i]);i++){
if(_972(st)){
_973=true;
break;
}
}
if(!_973){
s.push(this.addViewDef({cells:_96e}));
}else{
for(i=0;(st=_96e[i]);i++){
if(_971(st)){
s.push(this.addViewDef({cells:st}));
}else{
if(_972(st)){
s.push(this.addViewDef(st));
}
}
}
}
}else{
if(_972(_96e)){
s.push(this.addViewDef(_96e));
}
}
this.cellCount=this.cells.length;
this.grid.setupHeaderMenu();
}});
}
if(!dojo._hasResource["dojox.grid._ViewManager"]){
dojo._hasResource["dojox.grid._ViewManager"]=true;
dojo.provide("dojox.grid._ViewManager");
dojo.declare("dojox.grid._ViewManager",null,{constructor:function(_974){
this.grid=_974;
},defaultWidth:200,views:[],resize:function(){
this.onEach("resize");
},render:function(){
this.onEach("render");
},addView:function(_975){
_975.idx=this.views.length;
this.views.push(_975);
},destroyViews:function(){
for(var i=0,v;v=this.views[i];i++){
v.destroy();
}
this.views=[];
},getContentNodes:function(){
var _976=[];
for(var i=0,v;v=this.views[i];i++){
_976.push(v.contentNode);
}
return _976;
},forEach:function(_977){
for(var i=0,v;v=this.views[i];i++){
_977(v,i);
}
},onEach:function(_978,_979){
_979=_979||[];
for(var i=0,v;v=this.views[i];i++){
if(_978 in v){
v[_978].apply(v,_979);
}
}
},normalizeHeaderNodeHeight:function(){
var _97a=[];
for(var i=0,v;(v=this.views[i]);i++){
if(v.headerContentNode.firstChild){
_97a.push(v.headerContentNode);
}
}
this.normalizeRowNodeHeights(_97a);
},normalizeRowNodeHeights:function(_97b){
var h=0;
var _97c=[];
if(this.grid.rowHeight){
h=this.grid.rowHeight;
}else{
if(_97b.length<=1){
return;
}
for(var i=0,n;(n=_97b[i]);i++){
if(!dojo.hasClass(n,"dojoxGridNonNormalizedCell")){
_97c[i]=n.firstChild.offsetHeight;
h=Math.max(h,_97c[i]);
}
}
h=(h>=0?h:0);
if(dojo.isMoz&&h){
h++;
}
}
for(i=0;(n=_97b[i]);i++){
if(_97c[i]!=h){
n.firstChild.style.height=h+"px";
}
}
},resetHeaderNodeHeight:function(){
for(var i=0,v,n;(v=this.views[i]);i++){
n=v.headerContentNode.firstChild;
if(n){
n.style.height="";
}
}
},renormalizeRow:function(_97d){
var _97e=[];
for(var i=0,v,n;(v=this.views[i])&&(n=v.getRowNode(_97d));i++){
n.firstChild.style.height="";
_97e.push(n);
}
this.normalizeRowNodeHeights(_97e);
},getViewWidth:function(_97f){
return this.views[_97f].getWidth()||this.defaultWidth;
},measureHeader:function(){
this.resetHeaderNodeHeight();
this.forEach(function(_980){
_980.headerContentNode.style.height="";
});
var h=0;
this.forEach(function(_981){
h=Math.max(_981.headerNode.offsetHeight,h);
});
return h;
},measureContent:function(){
var h=0;
this.forEach(function(_982){
h=Math.max(_982.domNode.offsetHeight,h);
});
return h;
},findClient:function(_983){
var c=this.grid.elasticView||-1;
if(c<0){
for(var i=1,v;(v=this.views[i]);i++){
if(v.viewWidth){
for(i=1;(v=this.views[i]);i++){
if(!v.viewWidth){
c=i;
break;
}
}
break;
}
}
}
if(c<0){
c=Math.floor(this.views.length/2);
}
return c;
},arrange:function(l,w){
var i,v,vw,len=this.views.length;
var c=(w<=0?len:this.findClient());
var _984=function(v,l){
var ds=v.domNode.style;
var hs=v.headerNode.style;
if(!dojo._isBodyLtr()){
ds.right=l+"px";
if(dojo.isMoz){
hs.right=l+v.getScrollbarWidth()+"px";
hs.width=parseInt(hs.width,10)-v.getScrollbarWidth()+"px";
}else{
hs.right=l+"px";
}
}else{
ds.left=l+"px";
hs.left=l+"px";
}
ds.top=0+"px";
hs.top=0;
};
for(i=0;(v=this.views[i])&&(i<c);i++){
vw=this.getViewWidth(i);
v.setSize(vw,0);
_984(v,l);
if(v.headerContentNode&&v.headerContentNode.firstChild){
vw=v.getColumnsWidth()+v.getScrollbarWidth();
}else{
vw=v.domNode.offsetWidth;
}
l+=vw;
}
i++;
var r=w;
for(var j=len-1;(v=this.views[j])&&(i<=j);j--){
vw=this.getViewWidth(j);
v.setSize(vw,0);
vw=v.domNode.offsetWidth;
r-=vw;
_984(v,r);
}
if(c<len){
v=this.views[c];
vw=Math.max(1,r-l);
v.setSize(vw+"px",0);
_984(v,l);
}
return l;
},renderRow:function(_985,_986,_987){
var _988=[];
for(var i=0,v,n,_989;(v=this.views[i])&&(n=_986[i]);i++){
_989=v.renderRow(_985);
n.appendChild(_989);
_988.push(_989);
}
if(!_987){
this.normalizeRowNodeHeights(_988);
}
},rowRemoved:function(_98a){
this.onEach("rowRemoved",[_98a]);
},updateRow:function(_98b,_98c){
for(var i=0,v;v=this.views[i];i++){
v.updateRow(_98b);
}
if(!_98c){
this.renormalizeRow(_98b);
}
},updateRowStyles:function(_98d){
this.onEach("updateRowStyles",[_98d]);
},setScrollTop:function(_98e){
var top=_98e;
for(var i=0,v;v=this.views[i];i++){
top=v.setScrollTop(_98e);
if(dojo.isIE&&v.headerNode&&v.scrollboxNode){
v.headerNode.scrollLeft=v.scrollboxNode.scrollLeft;
}
}
return top;
},getFirstScrollingView:function(){
for(var i=0,v;(v=this.views[i]);i++){
if(v.hasHScrollbar()||v.hasVScrollbar()){
return v;
}
}
return null;
}});
}
if(!dojo._hasResource["dojox.grid._RowManager"]){
dojo._hasResource["dojox.grid._RowManager"]=true;
dojo.provide("dojox.grid._RowManager");
(function(){
var _98f=function(_990,_991){
if(_990.style.cssText==undefined){
_990.setAttribute("style",_991);
}else{
_990.style.cssText=_991;
}
};
dojo.declare("dojox.grid._RowManager",null,{constructor:function(_992){
this.grid=_992;
},linesToEms:2,overRow:-2,prepareStylingRow:function(_993,_994){
return {index:_993,node:_994,odd:Boolean(_993&1),selected:!!this.grid.selection.isSelected(_993),over:this.isOver(_993),customStyles:"",customClasses:"dojoxGridRow"};
},styleRowNode:function(_995,_996){
var row=this.prepareStylingRow(_995,_996);
this.grid.onStyleRow(row);
this.applyStyles(row);
},applyStyles:function(_997){
var i=_997;
i.node.className=i.customClasses;
var h=i.node.style.height;
_98f(i.node,i.customStyles+";"+(i.node._style||""));
i.node.style.height=h;
},updateStyles:function(_998){
this.grid.updateRowStyles(_998);
},setOverRow:function(_999){
var last=this.overRow;
this.overRow=_999;
if((last!=this.overRow)&&(dojo.isString(last)||last>=0)){
this.updateStyles(last);
}
this.updateStyles(this.overRow);
},isOver:function(_99a){
return (this.overRow==_99a&&!dojo.hasClass(this.grid.domNode,"dojoxGridColumnResizing"));
}});
})();
}
if(!dojo._hasResource["dojox.grid._FocusManager"]){
dojo._hasResource["dojox.grid._FocusManager"]=true;
dojo.provide("dojox.grid._FocusManager");
dojo.declare("dojox.grid._FocusManager",null,{constructor:function(_99b){
this.grid=_99b;
this.cell=null;
this.rowIndex=-1;
this._connects=[];
this._headerConnects=[];
this.headerMenu=this.grid.headerMenu;
this._connects.push(dojo.connect(this.grid.domNode,"onfocus",this,"doFocus"));
this._connects.push(dojo.connect(this.grid.domNode,"onblur",this,"doBlur"));
this._connects.push(dojo.connect(this.grid.domNode,"oncontextmenu",this,"doContextMenu"));
this._connects.push(dojo.connect(this.grid.lastFocusNode,"onfocus",this,"doLastNodeFocus"));
this._connects.push(dojo.connect(this.grid.lastFocusNode,"onblur",this,"doLastNodeBlur"));
this._connects.push(dojo.connect(this.grid,"_onFetchComplete",this,"_delayedCellFocus"));
this._connects.push(dojo.connect(this.grid,"postrender",this,"_delayedHeaderFocus"));
},destroy:function(){
dojo.forEach(this._connects,dojo.disconnect);
dojo.forEach(this._headerConnects,dojo.disconnect);
delete this.grid;
delete this.cell;
},_colHeadNode:null,_colHeadFocusIdx:null,_contextMenuBindNode:null,tabbingOut:false,focusClass:"dojoxGridCellFocus",focusView:null,initFocusView:function(){
this.focusView=this.grid.views.getFirstScrollingView()||this.focusView||this.grid.views.views[0];
this._initColumnHeaders();
},isFocusCell:function(_99c,_99d){
return (this.cell==_99c)&&(this.rowIndex==_99d);
},isLastFocusCell:function(){
if(this.cell){
return (this.rowIndex==this.grid.rowCount-1)&&(this.cell.index==this.grid.layout.cellCount-1);
}
return false;
},isFirstFocusCell:function(){
if(this.cell){
return (this.rowIndex===0)&&(this.cell.index===0);
}
return false;
},isNoFocusCell:function(){
return (this.rowIndex<0)||!this.cell;
},isNavHeader:function(){
return (!!this._colHeadNode);
},getHeaderIndex:function(){
if(this._colHeadNode){
return dojo.indexOf(this._findHeaderCells(),this._colHeadNode);
}else{
return -1;
}
},_focusifyCellNode:function(_99e){
var n=this.cell&&this.cell.getNode(this.rowIndex);
if(n){
dojo.toggleClass(n,this.focusClass,_99e);
if(_99e){
var sl=this.scrollIntoView();
try{
if(!this.grid.edit.isEditing()){
dojox.grid.util.fire(n,"focus");
if(sl){
this.cell.view.scrollboxNode.scrollLeft=sl;
}
}
}
catch(e){
}
}
}
},_delayedCellFocus:function(){
if(this.isNavHeader()||!this.grid._focused){
return;
}
var n=this.cell&&this.cell.getNode(this.rowIndex);
if(n){
try{
if(!this.grid.edit.isEditing()){
dojo.toggleClass(n,this.focusClass,true);
this.blurHeader();
dojox.grid.util.fire(n,"focus");
}
}
catch(e){
}
}
},_delayedHeaderFocus:function(){
if(this.isNavHeader()){
this.focusHeader();
this.grid.domNode.focus();
}
},_initColumnHeaders:function(){
dojo.forEach(this._headerConnects,dojo.disconnect);
this._headerConnects=[];
var _99f=this._findHeaderCells();
for(var i=0;i<_99f.length;i++){
this._headerConnects.push(dojo.connect(_99f[i],"onfocus",this,"doColHeaderFocus"));
this._headerConnects.push(dojo.connect(_99f[i],"onblur",this,"doColHeaderBlur"));
}
},_findHeaderCells:function(){
var _9a0=dojo.query("th",this.grid.viewsHeaderNode);
var _9a1=[];
for(var i=0;i<_9a0.length;i++){
var _9a2=_9a0[i];
var _9a3=dojo.hasAttr(_9a2,"tabIndex");
var _9a4=dojo.attr(_9a2,"tabIndex");
if(_9a3&&_9a4<0){
_9a1.push(_9a2);
}
}
return _9a1;
},_setActiveColHeader:function(_9a5,_9a6,_9a7){
dojo.attr(this.grid.domNode,"aria-activedescendant",_9a5.id);
if(_9a7!=null&&_9a7>=0&&_9a7!=_9a6){
dojo.toggleClass(this._findHeaderCells()[_9a7],this.focusClass,false);
}
dojo.toggleClass(_9a5,this.focusClass,true);
this._colHeadNode=_9a5;
this._colHeadFocusIdx=_9a6;
this._scrollHeader(this._colHeadFocusIdx);
},scrollIntoView:function(){
var info=(this.cell?this._scrollInfo(this.cell):null);
if(!info||!info.s){
return null;
}
var rt=this.grid.scroller.findScrollTop(this.rowIndex);
if(info.n&&info.sr){
if(info.n.offsetLeft+info.n.offsetWidth>info.sr.l+info.sr.w){
info.s.scrollLeft=info.n.offsetLeft+info.n.offsetWidth-info.sr.w;
}else{
if(info.n.offsetLeft<info.sr.l){
info.s.scrollLeft=info.n.offsetLeft;
}
}
}
if(info.r&&info.sr){
if(rt+info.r.offsetHeight>info.sr.t+info.sr.h){
this.grid.setScrollTop(rt+info.r.offsetHeight-info.sr.h);
}else{
if(rt<info.sr.t){
this.grid.setScrollTop(rt);
}
}
}
return info.s.scrollLeft;
},_scrollInfo:function(cell,_9a8){
if(cell){
var cl=cell,sbn=cl.view.scrollboxNode,sbnr={w:sbn.clientWidth,l:sbn.scrollLeft,t:sbn.scrollTop,h:sbn.clientHeight},rn=cl.view.getRowNode(this.rowIndex);
return {c:cl,s:sbn,sr:sbnr,n:(_9a8?_9a8:cell.getNode(this.rowIndex)),r:rn};
}
return null;
},_scrollHeader:function(_9a9){
var info=null;
if(this._colHeadNode){
var cell=this.grid.getCell(_9a9);
info=this._scrollInfo(cell,cell.getNode(0));
}
if(info&&info.s&&info.sr&&info.n){
var _9aa=info.sr.l+info.sr.w;
if(info.n.offsetLeft+info.n.offsetWidth>_9aa){
info.s.scrollLeft=info.n.offsetLeft+info.n.offsetWidth-info.sr.w;
}else{
if(info.n.offsetLeft<info.sr.l){
info.s.scrollLeft=info.n.offsetLeft;
}else{
if(dojo.isIE<=7&&cell&&cell.view.headerNode){
cell.view.headerNode.scrollLeft=info.s.scrollLeft;
}
}
}
}
},_isHeaderHidden:function(){
var _9ab=this.focusView;
if(!_9ab){
for(var i=0,_9ac;(_9ac=this.grid.views.views[i]);i++){
if(_9ac.headerNode){
_9ab=_9ac;
break;
}
}
}
return (_9ab&&dojo.getComputedStyle(_9ab.headerNode).display=="none");
},colSizeAdjust:function(e,_9ad,_9ae){
var _9af=this._findHeaderCells();
var view=this.focusView;
if(!view){
for(var i=0,_9b0;(_9b0=this.grid.views.views[i]);i++){
if(_9b0.header.tableMap.map){
view=_9b0;
break;
}
}
}
var _9b1=_9af[_9ad];
if(!view||(_9ad==_9af.length-1&&_9ad===0)){
return;
}
view.content.baseDecorateEvent(e);
e.cellNode=_9b1;
e.cellIndex=view.content.getCellNodeIndex(e.cellNode);
e.cell=(e.cellIndex>=0?this.grid.getCell(e.cellIndex):null);
if(view.header.canResize(e)){
var _9b2={l:_9ae};
var drag=view.header.colResizeSetup(e,false);
view.header.doResizeColumn(drag,null,_9b2);
view.update();
}
},styleRow:function(_9b3){
return;
},setFocusIndex:function(_9b4,_9b5){
this.setFocusCell(this.grid.getCell(_9b5),_9b4);
},setFocusCell:function(_9b6,_9b7){
if(_9b6&&!this.isFocusCell(_9b6,_9b7)){
this.tabbingOut=false;
if(this._colHeadNode){
this.blurHeader();
}
this._colHeadNode=this._colHeadFocusIdx=null;
this.focusGridView();
this._focusifyCellNode(false);
this.cell=_9b6;
this.rowIndex=_9b7;
this._focusifyCellNode(true);
}
if(dojo.isOpera){
setTimeout(dojo.hitch(this.grid,"onCellFocus",this.cell,this.rowIndex),1);
}else{
this.grid.onCellFocus(this.cell,this.rowIndex);
}
},next:function(){
if(this.cell){
var row=this.rowIndex,col=this.cell.index+1,cc=this.grid.layout.cellCount-1,rc=this.grid.rowCount-1;
if(col>cc){
col=0;
row++;
}
if(row>rc){
col=cc;
row=rc;
}
if(this.grid.edit.isEditing()){
var _9b8=this.grid.getCell(col);
if(!this.isLastFocusCell()&&(!_9b8.editable||this.grid.canEdit&&!this.grid.canEdit(_9b8,row))){
this.cell=_9b8;
this.rowIndex=row;
this.next();
return;
}
}
this.setFocusIndex(row,col);
}
},previous:function(){
if(this.cell){
var row=(this.rowIndex||0),col=(this.cell.index||0)-1;
if(col<0){
col=this.grid.layout.cellCount-1;
row--;
}
if(row<0){
row=0;
col=0;
}
if(this.grid.edit.isEditing()){
var _9b9=this.grid.getCell(col);
if(!this.isFirstFocusCell()&&!_9b9.editable){
this.cell=_9b9;
this.rowIndex=row;
this.previous();
return;
}
}
this.setFocusIndex(row,col);
}
},move:function(_9ba,_9bb){
var _9bc=_9bb<0?-1:1;
if(this.isNavHeader()){
var _9bd=this._findHeaderCells();
var _9be=currentIdx=dojo.indexOf(_9bd,this._colHeadNode);
currentIdx+=_9bb;
while(currentIdx>=0&&currentIdx<_9bd.length&&_9bd[currentIdx].style.display=="none"){
currentIdx+=_9bc;
}
if((currentIdx>=0)&&(currentIdx<_9bd.length)){
this._setActiveColHeader(_9bd[currentIdx],currentIdx,_9be);
}
}else{
if(this.cell){
var sc=this.grid.scroller,r=this.rowIndex,rc=this.grid.rowCount-1,row=Math.min(rc,Math.max(0,r+_9ba));
if(_9ba){
if(_9ba>0){
if(row>sc.getLastPageRow(sc.page)){
this.grid.setScrollTop(this.grid.scrollTop+sc.findScrollTop(row)-sc.findScrollTop(r));
}
}else{
if(_9ba<0){
if(row<=sc.getPageRow(sc.page)){
this.grid.setScrollTop(this.grid.scrollTop-sc.findScrollTop(r)-sc.findScrollTop(row));
}
}
}
}
var cc=this.grid.layout.cellCount-1,i=this.cell.index,col=Math.min(cc,Math.max(0,i+_9bb));
var cell=this.grid.getCell(col);
while(col>=0&&col<cc&&cell&&cell.hidden===true){
col+=_9bc;
cell=this.grid.getCell(col);
}
if(!cell||cell.hidden===true){
col=i;
}
this.setFocusIndex(row,col);
if(_9ba){
this.grid.updateRow(r);
}
}
}
},previousKey:function(e){
if(this.grid.edit.isEditing()){
dojo.stopEvent(e);
this.previous();
}else{
if(!this.isNavHeader()&&!this._isHeaderHidden()){
this.grid.domNode.focus();
dojo.stopEvent(e);
}else{
this.tabOut(this.grid.domNode);
if(this._colHeadFocusIdx!=null){
dojo.toggleClass(this._findHeaderCells()[this._colHeadFocusIdx],this.focusClass,false);
this._colHeadFocusIdx=null;
}
this._focusifyCellNode(false);
}
}
},nextKey:function(e){
var _9bf=(this.grid.rowCount===0);
if(e.target===this.grid.domNode&&this._colHeadFocusIdx==null){
this.focusHeader();
dojo.stopEvent(e);
}else{
if(this.isNavHeader()){
this.blurHeader();
if(!this.findAndFocusGridCell()){
this.tabOut(this.grid.lastFocusNode);
}
this._colHeadNode=this._colHeadFocusIdx=null;
}else{
if(this.grid.edit.isEditing()){
dojo.stopEvent(e);
this.next();
}else{
this.tabOut(this.grid.lastFocusNode);
}
}
}
},tabOut:function(_9c0){
this.tabbingOut=true;
_9c0.focus();
},focusGridView:function(){
dojox.grid.util.fire(this.focusView,"focus");
},focusGrid:function(_9c1){
this.focusGridView();
this._focusifyCellNode(true);
},findAndFocusGridCell:function(){
var _9c2=true;
var _9c3=(this.grid.rowCount===0);
if(this.isNoFocusCell()&&!_9c3){
var _9c4=0;
var cell=this.grid.getCell(_9c4);
if(cell.hidden){
_9c4=this.isNavHeader()?this._colHeadFocusIdx:0;
}
this.setFocusIndex(0,_9c4);
}else{
if(this.cell&&!_9c3){
if(this.focusView&&!this.focusView.rowNodes[this.rowIndex]){
this.grid.scrollToRow(this.rowIndex);
}
this.focusGrid();
}else{
_9c2=false;
}
}
this._colHeadNode=this._colHeadFocusIdx=null;
return _9c2;
},focusHeader:function(){
var _9c5=this._findHeaderCells();
var _9c6=this._colHeadFocusIdx;
if(this._isHeaderHidden()){
this.findAndFocusGridCell();
}else{
if(!this._colHeadFocusIdx){
if(this.isNoFocusCell()){
this._colHeadFocusIdx=0;
}else{
this._colHeadFocusIdx=this.cell.index;
}
}
}
this._colHeadNode=_9c5[this._colHeadFocusIdx];
while(this._colHeadNode&&this._colHeadFocusIdx>=0&&this._colHeadFocusIdx<_9c5.length&&this._colHeadNode.style.display=="none"){
this._colHeadFocusIdx++;
this._colHeadNode=_9c5[this._colHeadFocusIdx];
}
if(this._colHeadNode&&this._colHeadNode.style.display!="none"){
if(this.headerMenu&&this._contextMenuBindNode!=this.grid.domNode){
this.headerMenu.unBindDomNode(this.grid.viewsHeaderNode);
this.headerMenu.bindDomNode(this.grid.domNode);
this._contextMenuBindNode=this.grid.domNode;
}
this._setActiveColHeader(this._colHeadNode,this._colHeadFocusIdx,_9c6);
this._scrollHeader(this._colHeadFocusIdx);
this._focusifyCellNode(false);
}else{
this.findAndFocusGridCell();
}
},blurHeader:function(){
dojo.removeClass(this._colHeadNode,this.focusClass);
dojo.removeAttr(this.grid.domNode,"aria-activedescendant");
if(this.headerMenu&&this._contextMenuBindNode==this.grid.domNode){
var _9c7=this.grid.viewsHeaderNode;
this.headerMenu.unBindDomNode(this.grid.domNode);
this.headerMenu.bindDomNode(_9c7);
this._contextMenuBindNode=_9c7;
}
},doFocus:function(e){
if(e&&e.target!=e.currentTarget){
dojo.stopEvent(e);
return;
}
if(!this.tabbingOut){
this.focusHeader();
}
this.tabbingOut=false;
dojo.stopEvent(e);
},doBlur:function(e){
dojo.stopEvent(e);
},doContextMenu:function(e){
if(!this.headerMenu){
dojo.stopEvent(e);
}
},doLastNodeFocus:function(e){
if(this.tabbingOut){
this._focusifyCellNode(false);
}else{
if(this.grid.rowCount>0){
if(this.isNoFocusCell()){
this.setFocusIndex(0,0);
}
this._focusifyCellNode(true);
}else{
this.focusHeader();
}
}
this.tabbingOut=false;
dojo.stopEvent(e);
},doLastNodeBlur:function(e){
dojo.stopEvent(e);
},doColHeaderFocus:function(e){
this._setActiveColHeader(e.target,dojo.attr(e.target,"idx"),this._colHeadFocusIdx);
this._scrollHeader(this.getHeaderIndex());
dojo.stopEvent(e);
},doColHeaderBlur:function(e){
dojo.toggleClass(e.target,this.focusClass,false);
}});
}
if(!dojo._hasResource["dojox.grid._EditManager"]){
dojo._hasResource["dojox.grid._EditManager"]=true;
dojo.provide("dojox.grid._EditManager");
dojo.declare("dojox.grid._EditManager",null,{constructor:function(_9c8){
this.grid=_9c8;
if(dojo.isIE){
this.connections=[dojo.connect(document.body,"onfocus",dojo.hitch(this,"_boomerangFocus"))];
}else{
this.connections=[dojo.connect(this.grid,"onBlur",this,"apply")];
}
},info:{},destroy:function(){
dojo.forEach(this.connections,dojo.disconnect);
},cellFocus:function(_9c9,_9ca){
if(this.grid.singleClickEdit||this.isEditRow(_9ca)){
this.setEditCell(_9c9,_9ca);
}else{
this.apply();
}
if(this.isEditing()||(_9c9&&_9c9.editable&&_9c9.alwaysEditing)){
this._focusEditor(_9c9,_9ca);
}
},rowClick:function(e){
if(this.isEditing()&&!this.isEditRow(e.rowIndex)){
this.apply();
}
},styleRow:function(_9cb){
if(_9cb.index==this.info.rowIndex){
_9cb.customClasses+=" dojoxGridRowEditing";
}
},dispatchEvent:function(e){
var c=e.cell,ed=(c&&c["editable"])?c:0;
return ed&&ed.dispatchEvent(e.dispatch,e);
},isEditing:function(){
return this.info.rowIndex!==undefined;
},isEditCell:function(_9cc,_9cd){
return (this.info.rowIndex===_9cc)&&(this.info.cell.index==_9cd);
},isEditRow:function(_9ce){
return this.info.rowIndex===_9ce;
},setEditCell:function(_9cf,_9d0){
if(!this.isEditCell(_9d0,_9cf.index)&&this.grid.canEdit&&this.grid.canEdit(_9cf,_9d0)){
this.start(_9cf,_9d0,this.isEditRow(_9d0)||_9cf.editable);
}
},_focusEditor:function(_9d1,_9d2){
dojox.grid.util.fire(_9d1,"focus",[_9d2]);
},focusEditor:function(){
if(this.isEditing()){
this._focusEditor(this.info.cell,this.info.rowIndex);
}
},_boomerangWindow:500,_shouldCatchBoomerang:function(){
return this._catchBoomerang>new Date().getTime();
},_boomerangFocus:function(){
if(this._shouldCatchBoomerang()){
this.grid.focus.focusGrid();
this.focusEditor();
this._catchBoomerang=0;
}
},_doCatchBoomerang:function(){
if(dojo.isIE){
this._catchBoomerang=new Date().getTime()+this._boomerangWindow;
}
},start:function(_9d3,_9d4,_9d5){
this.grid.beginUpdate();
this.editorApply();
if(this.isEditing()&&!this.isEditRow(_9d4)){
this.applyRowEdit();
this.grid.updateRow(_9d4);
}
if(_9d5){
this.info={cell:_9d3,rowIndex:_9d4};
this.grid.doStartEdit(_9d3,_9d4);
this.grid.updateRow(_9d4);
}else{
this.info={};
}
this.grid.endUpdate();
this.grid.focus.focusGrid();
this._focusEditor(_9d3,_9d4);
this._doCatchBoomerang();
},_editorDo:function(_9d6){
var c=this.info.cell;
if(c&&c.editable){
c[_9d6](this.info.rowIndex);
}
},editorApply:function(){
this._editorDo("apply");
},editorCancel:function(){
this._editorDo("cancel");
},applyCellEdit:function(_9d7,_9d8,_9d9){
if(this.grid.canEdit(_9d8,_9d9)){
this.grid.doApplyCellEdit(_9d7,_9d9,_9d8.field);
}
},applyRowEdit:function(){
this.grid.doApplyEdit(this.info.rowIndex,this.info.cell.field);
},apply:function(){
if(this.isEditing()){
this.grid.beginUpdate();
this.editorApply();
this.applyRowEdit();
this.info={};
this.grid.endUpdate();
this.grid.focus.focusGrid();
this._doCatchBoomerang();
}
},cancel:function(){
if(this.isEditing()){
this.grid.beginUpdate();
this.editorCancel();
this.info={};
this.grid.endUpdate();
this.grid.focus.focusGrid();
this._doCatchBoomerang();
}
},save:function(_9da,_9db){
var c=this.info.cell;
if(this.isEditRow(_9da)&&(!_9db||c.view==_9db)&&c.editable){
c.save(c,this.info.rowIndex);
}
},restore:function(_9dc,_9dd){
var c=this.info.cell;
if(this.isEditRow(_9dd)&&c.view==_9dc&&c.editable){
c.restore(c,this.info.rowIndex);
}
}});
}
if(!dojo._hasResource["dojox.grid.Selection"]){
dojo._hasResource["dojox.grid.Selection"]=true;
dojo.provide("dojox.grid.Selection");
dojo.declare("dojox.grid.Selection",null,{constructor:function(_9de){
this.grid=_9de;
this.selected=[];
this.setMode(_9de.selectionMode);
},mode:"extended",selected:null,updating:0,selectedIndex:-1,setMode:function(mode){
if(this.selected.length){
this.deselectAll();
}
if(mode!="extended"&&mode!="multiple"&&mode!="single"&&mode!="none"){
this.mode="extended";
}else{
this.mode=mode;
}
},onCanSelect:function(_9df){
return this.grid.onCanSelect(_9df);
},onCanDeselect:function(_9e0){
return this.grid.onCanDeselect(_9e0);
},onSelected:function(_9e1){
},onDeselected:function(_9e2){
},onChanging:function(){
},onChanged:function(){
},isSelected:function(_9e3){
if(this.mode=="none"){
return false;
}
return this.selected[_9e3];
},getFirstSelected:function(){
if(!this.selected.length||this.mode=="none"){
return -1;
}
for(var i=0,l=this.selected.length;i<l;i++){
if(this.selected[i]){
return i;
}
}
return -1;
},getNextSelected:function(_9e4){
if(this.mode=="none"){
return -1;
}
for(var i=_9e4+1,l=this.selected.length;i<l;i++){
if(this.selected[i]){
return i;
}
}
return -1;
},getSelected:function(){
var _9e5=[];
for(var i=0,l=this.selected.length;i<l;i++){
if(this.selected[i]){
_9e5.push(i);
}
}
return _9e5;
},getSelectedCount:function(){
var c=0;
for(var i=0;i<this.selected.length;i++){
if(this.selected[i]){
c++;
}
}
return c;
},_beginUpdate:function(){
if(this.updating===0){
this.onChanging();
}
this.updating++;
},_endUpdate:function(){
this.updating--;
if(this.updating===0){
this.onChanged();
}
},select:function(_9e6){
if(this.mode=="none"){
return;
}
if(this.mode!="multiple"){
this.deselectAll(_9e6);
this.addToSelection(_9e6);
}else{
this.toggleSelect(_9e6);
}
},addToSelection:function(_9e7){
if(this.mode=="none"){
return;
}
if(dojo.isArray(_9e7)){
dojo.forEach(_9e7,this.addToSelection,this);
return;
}
_9e7=Number(_9e7);
if(this.selected[_9e7]){
this.selectedIndex=_9e7;
}else{
if(this.onCanSelect(_9e7)!==false){
this.selectedIndex=_9e7;
var _9e8=this.grid.getRowNode(_9e7);
if(_9e8){
dojo.attr(_9e8,"aria-selected","true");
}
this._beginUpdate();
this.selected[_9e7]=true;
this.onSelected(_9e7);
this._endUpdate();
}
}
},deselect:function(_9e9){
if(this.mode=="none"){
return;
}
if(dojo.isArray(_9e9)){
dojo.forEach(_9e9,this.deselect,this);
return;
}
_9e9=Number(_9e9);
if(this.selectedIndex==_9e9){
this.selectedIndex=-1;
}
if(this.selected[_9e9]){
if(this.onCanDeselect(_9e9)===false){
return;
}
var _9ea=this.grid.getRowNode(_9e9);
if(_9ea){
dojo.attr(_9ea,"aria-selected","false");
}
this._beginUpdate();
delete this.selected[_9e9];
this.onDeselected(_9e9);
this._endUpdate();
}
},setSelected:function(_9eb,_9ec){
this[(_9ec?"addToSelection":"deselect")](_9eb);
},toggleSelect:function(_9ed){
if(dojo.isArray(_9ed)){
dojo.forEach(_9ed,this.toggleSelect,this);
return;
}
this.setSelected(_9ed,!this.selected[_9ed]);
},_range:function(_9ee,inTo,func){
var s=(_9ee>=0?_9ee:inTo),e=inTo;
if(s>e){
e=s;
s=inTo;
}
for(var i=s;i<=e;i++){
func(i);
}
},selectRange:function(_9ef,inTo){
this._range(_9ef,inTo,dojo.hitch(this,"addToSelection"));
},deselectRange:function(_9f0,inTo){
this._range(_9f0,inTo,dojo.hitch(this,"deselect"));
},insert:function(_9f1){
this.selected.splice(_9f1,0,false);
if(this.selectedIndex>=_9f1){
this.selectedIndex++;
}
},remove:function(_9f2){
this.selected.splice(_9f2,1);
if(this.selectedIndex>=_9f2){
this.selectedIndex--;
}
},deselectAll:function(_9f3){
for(var i in this.selected){
if((i!=_9f3)&&(this.selected[i]===true)){
this.deselect(i);
}
}
},clickSelect:function(_9f4,_9f5,_9f6){
if(this.mode=="none"){
return;
}
this._beginUpdate();
if(this.mode!="extended"){
this.select(_9f4);
}else{
var _9f7=this.selectedIndex;
if(!_9f5){
this.deselectAll(_9f4);
}
if(_9f6){
this.selectRange(_9f7,_9f4);
}else{
if(_9f5){
this.toggleSelect(_9f4);
}else{
this.addToSelection(_9f4);
}
}
}
this._endUpdate();
},clickSelectEvent:function(e){
this.clickSelect(e.rowIndex,dojo.isCopyKey(e),e.shiftKey);
},clear:function(){
this._beginUpdate();
this.deselectAll();
this._endUpdate();
}});
}
if(!dojo._hasResource["dojox.grid._Events"]){
dojo._hasResource["dojox.grid._Events"]=true;
dojo.provide("dojox.grid._Events");
dojo.declare("dojox.grid._Events",null,{cellOverClass:"dojoxGridCellOver",onKeyEvent:function(e){
this.dispatchKeyEvent(e);
},onContentEvent:function(e){
this.dispatchContentEvent(e);
},onHeaderEvent:function(e){
this.dispatchHeaderEvent(e);
},onStyleRow:function(_9f8){
var i=_9f8;
i.customClasses+=(i.odd?" dojoxGridRowOdd":"")+(i.selected?" dojoxGridRowSelected":"")+(i.over?" dojoxGridRowOver":"");
this.focus.styleRow(_9f8);
this.edit.styleRow(_9f8);
},onKeyDown:function(e){
if(e.altKey||e.metaKey){
return;
}
var dk=dojo.keys;
var _9f9;
switch(e.keyCode){
case dk.ESCAPE:
this.edit.cancel();
break;
case dk.ENTER:
if(!this.edit.isEditing()){
_9f9=this.focus.getHeaderIndex();
if(_9f9>=0){
this.setSortIndex(_9f9);
break;
}else{
this.selection.clickSelect(this.focus.rowIndex,dojo.isCopyKey(e),e.shiftKey);
}
dojo.stopEvent(e);
}
if(!e.shiftKey){
var _9fa=this.edit.isEditing();
this.edit.apply();
if(!_9fa){
this.edit.setEditCell(this.focus.cell,this.focus.rowIndex);
}
}
if(!this.edit.isEditing()){
var _9fb=this.focus.focusView||this.views.views[0];
_9fb.content.decorateEvent(e);
this.onRowClick(e);
}
break;
case dk.SPACE:
if(!this.edit.isEditing()){
_9f9=this.focus.getHeaderIndex();
if(_9f9>=0){
this.setSortIndex(_9f9);
break;
}else{
this.selection.clickSelect(this.focus.rowIndex,dojo.isCopyKey(e),e.shiftKey);
}
dojo.stopEvent(e);
}
break;
case dk.TAB:
this.focus[e.shiftKey?"previousKey":"nextKey"](e);
break;
case dk.LEFT_ARROW:
case dk.RIGHT_ARROW:
if(!this.edit.isEditing()){
var _9fc=e.keyCode;
dojo.stopEvent(e);
_9f9=this.focus.getHeaderIndex();
if(_9f9>=0&&(e.shiftKey&&e.ctrlKey)){
this.focus.colSizeAdjust(e,_9f9,(_9fc==dk.LEFT_ARROW?-1:1)*5);
}else{
var _9fd=(_9fc==dk.LEFT_ARROW)?1:-1;
if(dojo._isBodyLtr()){
_9fd*=-1;
}
this.focus.move(0,_9fd);
}
}
break;
case dk.UP_ARROW:
if(!this.edit.isEditing()&&this.focus.rowIndex!==0){
dojo.stopEvent(e);
this.focus.move(-1,0);
}
break;
case dk.DOWN_ARROW:
if(!this.edit.isEditing()&&this.focus.rowIndex+1!=this.rowCount){
dojo.stopEvent(e);
this.focus.move(1,0);
}
break;
case dk.PAGE_UP:
if(!this.edit.isEditing()&&this.focus.rowIndex!==0){
dojo.stopEvent(e);
if(this.focus.rowIndex!=this.scroller.firstVisibleRow+1){
this.focus.move(this.scroller.firstVisibleRow-this.focus.rowIndex,0);
}else{
this.setScrollTop(this.scroller.findScrollTop(this.focus.rowIndex-1));
this.focus.move(this.scroller.firstVisibleRow-this.scroller.lastVisibleRow+1,0);
}
}
break;
case dk.PAGE_DOWN:
if(!this.edit.isEditing()&&this.focus.rowIndex+1!=this.rowCount){
dojo.stopEvent(e);
if(this.focus.rowIndex!=this.scroller.lastVisibleRow-1){
this.focus.move(this.scroller.lastVisibleRow-this.focus.rowIndex-1,0);
}else{
this.setScrollTop(this.scroller.findScrollTop(this.focus.rowIndex+1));
this.focus.move(this.scroller.lastVisibleRow-this.scroller.firstVisibleRow-1,0);
}
}
break;
default:
break;
}
},onMouseOver:function(e){
e.rowIndex==-1?this.onHeaderCellMouseOver(e):this.onCellMouseOver(e);
},onMouseOut:function(e){
e.rowIndex==-1?this.onHeaderCellMouseOut(e):this.onCellMouseOut(e);
},onMouseDown:function(e){
e.rowIndex==-1?this.onHeaderCellMouseDown(e):this.onCellMouseDown(e);
},onMouseOverRow:function(e){
if(!this.rows.isOver(e.rowIndex)){
this.rows.setOverRow(e.rowIndex);
e.rowIndex==-1?this.onHeaderMouseOver(e):this.onRowMouseOver(e);
}
},onMouseOutRow:function(e){
if(this.rows.isOver(-1)){
this.onHeaderMouseOut(e);
}else{
if(!this.rows.isOver(-2)){
this.rows.setOverRow(-2);
this.onRowMouseOut(e);
}
}
},onMouseDownRow:function(e){
if(e.rowIndex!=-1){
this.onRowMouseDown(e);
}
},onCellMouseOver:function(e){
if(e.cellNode){
dojo.addClass(e.cellNode,this.cellOverClass);
}
},onCellMouseOut:function(e){
if(e.cellNode){
dojo.removeClass(e.cellNode,this.cellOverClass);
}
},onCellMouseDown:function(e){
},onCellClick:function(e){
this._click[0]=this._click[1];
this._click[1]=e;
if(!this.edit.isEditCell(e.rowIndex,e.cellIndex)){
this.focus.setFocusCell(e.cell,e.rowIndex);
}
this.onRowClick(e);
},onCellDblClick:function(e){
if(this._click.length>1&&dojo.isIE){
this.edit.setEditCell(this._click[1].cell,this._click[1].rowIndex);
}else{
if(this._click.length>1&&this._click[0].rowIndex!=this._click[1].rowIndex){
this.edit.setEditCell(this._click[0].cell,this._click[0].rowIndex);
}else{
this.edit.setEditCell(e.cell,e.rowIndex);
}
}
this.onRowDblClick(e);
},onCellContextMenu:function(e){
this.onRowContextMenu(e);
},onCellFocus:function(_9fe,_9ff){
this.edit.cellFocus(_9fe,_9ff);
},onRowClick:function(e){
this.edit.rowClick(e);
this.selection.clickSelectEvent(e);
},onRowDblClick:function(e){
},onRowMouseOver:function(e){
},onRowMouseOut:function(e){
},onRowMouseDown:function(e){
},onRowContextMenu:function(e){
dojo.stopEvent(e);
},onHeaderMouseOver:function(e){
},onHeaderMouseOut:function(e){
},onHeaderCellMouseOver:function(e){
if(e.cellNode){
dojo.addClass(e.cellNode,this.cellOverClass);
}
},onHeaderCellMouseOut:function(e){
if(e.cellNode){
dojo.removeClass(e.cellNode,this.cellOverClass);
}
},onHeaderCellMouseDown:function(e){
},onHeaderClick:function(e){
},onHeaderCellClick:function(e){
this.setSortIndex(e.cell.index);
this.onHeaderClick(e);
},onHeaderDblClick:function(e){
},onHeaderCellDblClick:function(e){
this.onHeaderDblClick(e);
},onHeaderCellContextMenu:function(e){
this.onHeaderContextMenu(e);
},onHeaderContextMenu:function(e){
if(!this.headerMenu){
dojo.stopEvent(e);
}
},onStartEdit:function(_a00,_a01){
},onApplyCellEdit:function(_a02,_a03,_a04){
},onCancelEdit:function(_a05){
},onApplyEdit:function(_a06){
},onCanSelect:function(_a07){
return true;
},onCanDeselect:function(_a08){
return true;
},onSelected:function(_a09){
this.updateRowStyles(_a09);
},onDeselected:function(_a0a){
this.updateRowStyles(_a0a);
},onSelectionChanged:function(){
}});
}
if(!dojo._hasResource["dojox.grid._Grid"]){
dojo._hasResource["dojox.grid._Grid"]=true;
dojo.provide("dojox.grid._Grid");
(function(){
if(!dojo.isCopyKey){
dojo.isCopyKey=dojo.dnd.getCopyKeyState;
}
dojo.declare("dojox.grid._Grid",[dijit._Widget,dijit._Templated,dojox.grid._Events],{templateString:"<div hidefocus=\"hidefocus\" role=\"grid\" dojoAttachEvent=\"onmouseout:_mouseOut\">\r\n\t<div class=\"dojoxGridMasterHeader\" dojoAttachPoint=\"viewsHeaderNode\" role=\"presentation\"></div>\r\n\t<div class=\"dojoxGridMasterView\" dojoAttachPoint=\"viewsNode\" role=\"presentation\"></div>\r\n\t<div class=\"dojoxGridMasterMessages\" style=\"display: none;\" dojoAttachPoint=\"messagesNode\"></div>\r\n\t<span dojoAttachPoint=\"lastFocusNode\" tabindex=\"0\"></span>\r\n</div>\r\n",classTag:"dojoxGrid",rowCount:5,keepRows:75,rowsPerPage:25,autoWidth:false,initialWidth:"",autoHeight:"",rowHeight:0,autoRender:true,defaultHeight:"15em",height:"",structure:null,elasticView:-1,singleClickEdit:false,selectionMode:"extended",rowSelector:"",columnReordering:false,headerMenu:null,placeholderLabel:"GridColumns",selectable:false,_click:null,loadingMessage:"<span class='dojoxGridLoading'>${loadingState}</span>",errorMessage:"<span class='dojoxGridError'>${errorState}</span>",noDataMessage:"",escapeHTMLInData:true,formatterScope:null,editable:false,sortInfo:0,themeable:true,_placeholders:null,_layoutClass:dojox.grid._Layout,buildRendering:function(){
this.inherited(arguments);
if(!this.domNode.getAttribute("tabIndex")){
this.domNode.tabIndex="0";
}
this.createScroller();
this.createLayout();
this.createViews();
this.createManagers();
this.createSelection();
this.connect(this.selection,"onSelected","onSelected");
this.connect(this.selection,"onDeselected","onDeselected");
this.connect(this.selection,"onChanged","onSelectionChanged");
dojox.html.metrics.initOnFontResize();
this.connect(dojox.html.metrics,"onFontResize","textSizeChanged");
dojox.grid.util.funnelEvents(this.domNode,this,"doKeyEvent",dojox.grid.util.keyEvents);
if(this.selectionMode!="none"){
dojo.attr(this.domNode,"aria-multiselectable",this.selectionMode=="single"?"false":"true");
}
dojo.addClass(this.domNode,this.classTag);
if(!this.isLeftToRight()){
dojo.addClass(this.domNode,this.classTag+"Rtl");
}
},postMixInProperties:function(){
this.inherited(arguments);
var _a0b=dojo.i18n.getLocalization("dijit","loading",this.lang);
this.loadingMessage=dojo.string.substitute(this.loadingMessage,_a0b);
this.errorMessage=dojo.string.substitute(this.errorMessage,_a0b);
if(this.srcNodeRef&&this.srcNodeRef.style.height){
this.height=this.srcNodeRef.style.height;
}
this._setAutoHeightAttr(this.autoHeight,true);
this.lastScrollTop=this.scrollTop=0;
},postCreate:function(){
this._placeholders=[];
this._setHeaderMenuAttr(this.headerMenu);
this._setStructureAttr(this.structure);
this._click=[];
this.inherited(arguments);
if(this.domNode&&this.autoWidth&&this.initialWidth){
this.domNode.style.width=this.initialWidth;
}
if(this.domNode&&!this.editable){
dojo.attr(this.domNode,"aria-readonly","true");
}
},destroy:function(){
this.domNode.onReveal=null;
this.domNode.onSizeChange=null;
delete this._click;
this.edit.destroy();
delete this.edit;
this.views.destroyViews();
if(this.scroller){
this.scroller.destroy();
delete this.scroller;
}
if(this.focus){
this.focus.destroy();
delete this.focus;
}
if(this.headerMenu&&this._placeholders.length){
dojo.forEach(this._placeholders,function(p){
p.unReplace(true);
});
this.headerMenu.unBindDomNode(this.viewsHeaderNode);
}
this.inherited(arguments);
},_setAutoHeightAttr:function(ah,_a0c){
if(typeof ah=="string"){
if(!ah||ah=="false"){
ah=false;
}else{
if(ah=="true"){
ah=true;
}else{
ah=window.parseInt(ah,10);
}
}
}
if(typeof ah=="number"){
if(isNaN(ah)){
ah=false;
}
if(ah<0){
ah=true;
}else{
if(ah===0){
ah=false;
}
}
}
this.autoHeight=ah;
if(typeof ah=="boolean"){
this._autoHeight=ah;
}else{
if(typeof ah=="number"){
this._autoHeight=(ah>=this.get("rowCount"));
}else{
this._autoHeight=false;
}
}
if(this._started&&!_a0c){
this.render();
}
},_getRowCountAttr:function(){
return this.updating&&this.invalidated&&this.invalidated.rowCount!=undefined?this.invalidated.rowCount:this.rowCount;
},textSizeChanged:function(){
this.render();
},sizeChange:function(){
this.update();
},createManagers:function(){
this.rows=new dojox.grid._RowManager(this);
this.focus=new dojox.grid._FocusManager(this);
this.edit=new dojox.grid._EditManager(this);
},createSelection:function(){
this.selection=new dojox.grid.Selection(this);
},createScroller:function(){
this.scroller=new dojox.grid._Scroller();
this.scroller.grid=this;
this.scroller.renderRow=dojo.hitch(this,"renderRow");
this.scroller.removeRow=dojo.hitch(this,"rowRemoved");
},createLayout:function(){
this.layout=new this._layoutClass(this);
this.connect(this.layout,"moveColumn","onMoveColumn");
},onMoveColumn:function(){
this.render();
},onResizeColumn:function(_a0d){
},createViews:function(){
this.views=new dojox.grid._ViewManager(this);
this.views.createView=dojo.hitch(this,"createView");
},createView:function(_a0e,idx){
var c=dojo.getObject(_a0e);
var view=new c({grid:this,index:idx});
this.viewsNode.appendChild(view.domNode);
this.viewsHeaderNode.appendChild(view.headerNode);
this.views.addView(view);
dojo.attr(this.domNode,"align",dojo._isBodyLtr()?"left":"right");
return view;
},buildViews:function(){
for(var i=0,vs;(vs=this.layout.structure[i]);i++){
this.createView(vs.type||dojox._scopeName+".grid._View",i).setStructure(vs);
}
this.scroller.setContentNodes(this.views.getContentNodes());
},_setStructureAttr:function(_a0f){
var s=_a0f;
if(s&&dojo.isString(s)){
dojo.deprecated("dojox.grid._Grid.set('structure', 'objVar')","use dojox.grid._Grid.set('structure', objVar) instead","2.0");
s=dojo.getObject(s);
}
this.structure=s;
if(!s){
if(this.layout.structure){
s=this.layout.structure;
}else{
return;
}
}
this.views.destroyViews();
if(s!==this.layout.structure){
this.layout.setStructure(s);
}
this._structureChanged();
},setStructure:function(_a10){
dojo.deprecated("dojox.grid._Grid.setStructure(obj)","use dojox.grid._Grid.set('structure', obj) instead.","2.0");
this._setStructureAttr(_a10);
},getColumnTogglingItems:function(){
return dojo.map(this.layout.cells,function(cell){
if(!cell.menuItems){
cell.menuItems=[];
}
var self=this;
var item=new dijit.CheckedMenuItem({label:cell.name,checked:!cell.hidden,_gridCell:cell,onChange:function(_a11){
if(self.layout.setColumnVisibility(this._gridCell.index,_a11)){
var _a12=this._gridCell.menuItems;
if(_a12.length>1){
dojo.forEach(_a12,function(item){
if(item!==this){
item.setAttribute("checked",_a11);
}
},this);
}
_a11=dojo.filter(self.layout.cells,function(c){
if(c.menuItems.length>1){
dojo.forEach(c.menuItems,"item.set('disabled', false);");
}else{
c.menuItems[0].set("disabled",false);
}
return !c.hidden;
});
if(_a11.length==1){
dojo.forEach(_a11[0].menuItems,"item.set('disabled', true);");
}
}
},destroy:function(){
var _a13=dojo.indexOf(this._gridCell.menuItems,this);
this._gridCell.menuItems.splice(_a13,1);
delete this._gridCell;
dijit.CheckedMenuItem.prototype.destroy.apply(this,arguments);
}});
cell.menuItems.push(item);
return item;
},this);
},_setHeaderMenuAttr:function(menu){
if(this._placeholders&&this._placeholders.length){
dojo.forEach(this._placeholders,function(p){
p.unReplace(true);
});
this._placeholders=[];
}
if(this.headerMenu){
this.headerMenu.unBindDomNode(this.viewsHeaderNode);
}
this.headerMenu=menu;
if(!menu){
return;
}
this.headerMenu.bindDomNode(this.viewsHeaderNode);
if(this.headerMenu.getPlaceholders){
this._placeholders=this.headerMenu.getPlaceholders(this.placeholderLabel);
}
},setHeaderMenu:function(menu){
dojo.deprecated("dojox.grid._Grid.setHeaderMenu(obj)","use dojox.grid._Grid.set('headerMenu', obj) instead.","2.0");
this._setHeaderMenuAttr(menu);
},setupHeaderMenu:function(){
if(this._placeholders&&this._placeholders.length){
dojo.forEach(this._placeholders,function(p){
if(p._replaced){
p.unReplace(true);
}
p.replace(this.getColumnTogglingItems());
},this);
}
},_fetch:function(_a14){
this.setScrollTop(0);
},getItem:function(_a15){
return null;
},showMessage:function(_a16){
if(_a16){
this.messagesNode.innerHTML=_a16;
this.messagesNode.style.display="";
}else{
this.messagesNode.innerHTML="";
this.messagesNode.style.display="none";
}
},_structureChanged:function(){
this.buildViews();
if(this.autoRender&&this._started){
this.render();
}
},hasLayout:function(){
return this.layout.cells.length;
},resize:function(_a17,_a18){
this._pendingChangeSize=_a17;
this._pendingResultSize=_a18;
this.sizeChange();
},_getPadBorder:function(){
this._padBorder=this._padBorder||dojo._getPadBorderExtents(this.domNode);
return this._padBorder;
},_getHeaderHeight:function(){
var vns=this.viewsHeaderNode.style,t=vns.display=="none"?0:this.views.measureHeader();
vns.height=t+"px";
this.views.normalizeHeaderNodeHeight();
return t;
},_resize:function(_a19,_a1a){
_a19=_a19||this._pendingChangeSize;
_a1a=_a1a||this._pendingResultSize;
delete this._pendingChangeSize;
delete this._pendingResultSize;
if(!this.domNode){
return;
}
var pn=this.domNode.parentNode;
if(!pn||pn.nodeType!=1||!this.hasLayout()||pn.style.visibility=="hidden"||pn.style.display=="none"){
return;
}
var _a1b=this._getPadBorder();
var hh=undefined;
var h;
if(this._autoHeight){
this.domNode.style.height="auto";
}else{
if(typeof this.autoHeight=="number"){
h=hh=this._getHeaderHeight();
h+=(this.scroller.averageRowHeight*this.autoHeight);
this.domNode.style.height=h+"px";
}else{
if(this.domNode.clientHeight<=_a1b.h){
if(pn==document.body){
this.domNode.style.height=this.defaultHeight;
}else{
if(this.height){
this.domNode.style.height=this.height;
}else{
this.fitTo="parent";
}
}
}
}
}
if(_a1a){
_a19=_a1a;
}
if(_a19){
dojo.marginBox(this.domNode,_a19);
this.height=this.domNode.style.height;
delete this.fitTo;
}else{
if(this.fitTo=="parent"){
h=this._parentContentBoxHeight=this._parentContentBoxHeight||dojo._getContentBox(pn).h;
this.domNode.style.height=Math.max(0,h)+"px";
}
}
var _a1c=dojo.some(this.views.views,function(v){
return v.flexCells;
});
if(!this._autoHeight&&(h||dojo._getContentBox(this.domNode).h)===0){
this.viewsHeaderNode.style.display="none";
}else{
this.viewsHeaderNode.style.display="block";
if(!_a1c&&hh===undefined){
hh=this._getHeaderHeight();
}
}
if(_a1c){
hh=undefined;
}
this.adaptWidth();
this.adaptHeight(hh);
this.postresize();
},adaptWidth:function(){
var _a1d=(!this.initialWidth&&this.autoWidth);
var w=_a1d?0:this.domNode.clientWidth||(this.domNode.offsetWidth-this._getPadBorder().w),vw=this.views.arrange(1,w);
this.views.onEach("adaptWidth");
if(_a1d){
this.domNode.style.width=vw+"px";
}
},adaptHeight:function(_a1e){
var t=_a1e===undefined?this._getHeaderHeight():_a1e;
var h=(this._autoHeight?-1:Math.max(this.domNode.clientHeight-t,0)||0);
this.views.onEach("setSize",[0,h]);
this.views.onEach("adaptHeight");
if(!this._autoHeight){
var _a1f=0,_a20=0;
var _a21=dojo.filter(this.views.views,function(v){
var has=v.hasHScrollbar();
if(has){
_a1f++;
}else{
_a20++;
}
return (!has);
});
if(_a1f>0&&_a20>0){
dojo.forEach(_a21,function(v){
v.adaptHeight(true);
});
}
}
if(this.autoHeight===true||h!=-1||(typeof this.autoHeight=="number"&&this.autoHeight>=this.get("rowCount"))){
this.scroller.windowHeight=h;
}else{
this.scroller.windowHeight=Math.max(this.domNode.clientHeight-t,0);
}
},startup:function(){
if(this._started){
return;
}
this.inherited(arguments);
if(this.autoRender){
this.render();
}
},render:function(){
if(!this.domNode){
return;
}
if(!this._started){
return;
}
if(!this.hasLayout()){
this.scroller.init(0,this.keepRows,this.rowsPerPage);
return;
}
this.update=this.defaultUpdate;
this._render();
},_render:function(){
this.scroller.init(this.get("rowCount"),this.keepRows,this.rowsPerPage);
this.prerender();
this.setScrollTop(0);
this.postrender();
},prerender:function(){
this.keepRows=this._autoHeight?0:this.keepRows;
this.scroller.setKeepInfo(this.keepRows);
this.views.render();
this._resize();
},postrender:function(){
this.postresize();
this.focus.initFocusView();
dojo.setSelectable(this.domNode,this.selectable);
},postresize:function(){
if(this._autoHeight){
var size=Math.max(this.views.measureContent())+"px";
this.viewsNode.style.height=size;
}
},renderRow:function(_a22,_a23){
this.views.renderRow(_a22,_a23,this._skipRowRenormalize);
},rowRemoved:function(_a24){
this.views.rowRemoved(_a24);
},invalidated:null,updating:false,beginUpdate:function(){
this.invalidated=[];
this.updating=true;
},endUpdate:function(){
this.updating=false;
var i=this.invalidated,r;
if(i.all){
this.update();
}else{
if(i.rowCount!=undefined){
this.updateRowCount(i.rowCount);
}else{
for(r in i){
this.updateRow(Number(r));
}
}
}
this.invalidated=[];
},defaultUpdate:function(){
if(!this.domNode){
return;
}
if(this.updating){
this.invalidated.all=true;
return;
}
this.lastScrollTop=this.scrollTop;
this.prerender();
this.scroller.invalidateNodes();
this.setScrollTop(this.lastScrollTop);
this.postrender();
},update:function(){
this.render();
},updateRow:function(_a25){
_a25=Number(_a25);
if(this.updating){
this.invalidated[_a25]=true;
}else{
this.views.updateRow(_a25);
this.scroller.rowHeightChanged(_a25);
}
},updateRows:function(_a26,_a27){
_a26=Number(_a26);
_a27=Number(_a27);
var i;
if(this.updating){
for(i=0;i<_a27;i++){
this.invalidated[i+_a26]=true;
}
}else{
for(i=0;i<_a27;i++){
this.views.updateRow(i+_a26,this._skipRowRenormalize);
}
this.scroller.rowHeightChanged(_a26);
}
},updateRowCount:function(_a28){
if(this.updating){
this.invalidated.rowCount=_a28;
}else{
this.rowCount=_a28;
this._setAutoHeightAttr(this.autoHeight,true);
if(this.layout.cells.length){
this.scroller.updateRowCount(_a28);
}
this._resize();
if(this.layout.cells.length){
this.setScrollTop(this.scrollTop);
}
}
},updateRowStyles:function(_a29){
this.views.updateRowStyles(_a29);
},getRowNode:function(_a2a){
if(this.focus.focusView&&!(this.focus.focusView instanceof dojox.grid._RowSelector)){
return this.focus.focusView.rowNodes[_a2a];
}else{
for(var i=0,_a2b;(_a2b=this.views.views[i]);i++){
if(!(_a2b instanceof dojox.grid._RowSelector)){
return _a2b.rowNodes[_a2a];
}
}
}
return null;
},rowHeightChanged:function(_a2c){
this.views.renormalizeRow(_a2c);
this.scroller.rowHeightChanged(_a2c);
},fastScroll:true,delayScroll:false,scrollRedrawThreshold:(dojo.isIE?100:50),scrollTo:function(_a2d){
if(!this.fastScroll){
this.setScrollTop(_a2d);
return;
}
var _a2e=Math.abs(this.lastScrollTop-_a2d);
this.lastScrollTop=_a2d;
if(_a2e>this.scrollRedrawThreshold||this.delayScroll){
this.delayScroll=true;
this.scrollTop=_a2d;
this.views.setScrollTop(_a2d);
if(this._pendingScroll){
window.clearTimeout(this._pendingScroll);
}
var _a2f=this;
this._pendingScroll=window.setTimeout(function(){
delete _a2f._pendingScroll;
_a2f.finishScrollJob();
},200);
}else{
this.setScrollTop(_a2d);
}
},finishScrollJob:function(){
this.delayScroll=false;
this.setScrollTop(this.scrollTop);
},setScrollTop:function(_a30){
this.scroller.scroll(this.views.setScrollTop(_a30));
},scrollToRow:function(_a31){
this.setScrollTop(this.scroller.findScrollTop(_a31)+1);
},styleRowNode:function(_a32,_a33){
if(_a33){
this.rows.styleRowNode(_a32,_a33);
}
},_mouseOut:function(e){
this.rows.setOverRow(-2);
},getCell:function(_a34){
return this.layout.cells[_a34];
},setCellWidth:function(_a35,_a36){
this.getCell(_a35).unitWidth=_a36;
},getCellName:function(_a37){
return "Cell "+_a37.index;
},canSort:function(_a38){
},sort:function(){
},getSortAsc:function(_a39){
_a39=_a39==undefined?this.sortInfo:_a39;
return Boolean(_a39>0);
},getSortIndex:function(_a3a){
_a3a=_a3a==undefined?this.sortInfo:_a3a;
return Math.abs(_a3a)-1;
},setSortIndex:function(_a3b,_a3c){
var si=_a3b+1;
if(_a3c!=undefined){
si*=(_a3c?1:-1);
}else{
if(this.getSortIndex()==_a3b){
si=-this.sortInfo;
}
}
this.setSortInfo(si);
},setSortInfo:function(_a3d){
if(this.canSort(_a3d)){
this.sortInfo=_a3d;
this.sort();
this.update();
}
},doKeyEvent:function(e){
e.dispatch="do"+e.type;
this.onKeyEvent(e);
},_dispatch:function(m,e){
if(m in this){
return this[m](e);
}
return false;
},dispatchKeyEvent:function(e){
this._dispatch(e.dispatch,e);
},dispatchContentEvent:function(e){
this.edit.dispatchEvent(e)||e.sourceView.dispatchContentEvent(e)||this._dispatch(e.dispatch,e);
},dispatchHeaderEvent:function(e){
e.sourceView.dispatchHeaderEvent(e)||this._dispatch("doheader"+e.type,e);
},dokeydown:function(e){
this.onKeyDown(e);
},doclick:function(e){
if(e.cellNode){
this.onCellClick(e);
}else{
this.onRowClick(e);
}
},dodblclick:function(e){
if(e.cellNode){
this.onCellDblClick(e);
}else{
this.onRowDblClick(e);
}
},docontextmenu:function(e){
if(e.cellNode){
this.onCellContextMenu(e);
}else{
this.onRowContextMenu(e);
}
},doheaderclick:function(e){
if(e.cellNode){
this.onHeaderCellClick(e);
}else{
this.onHeaderClick(e);
}
},doheaderdblclick:function(e){
if(e.cellNode){
this.onHeaderCellDblClick(e);
}else{
this.onHeaderDblClick(e);
}
},doheadercontextmenu:function(e){
if(e.cellNode){
this.onHeaderCellContextMenu(e);
}else{
this.onHeaderContextMenu(e);
}
},doStartEdit:function(_a3e,_a3f){
this.onStartEdit(_a3e,_a3f);
},doApplyCellEdit:function(_a40,_a41,_a42){
this.onApplyCellEdit(_a40,_a41,_a42);
},doCancelEdit:function(_a43){
this.onCancelEdit(_a43);
},doApplyEdit:function(_a44){
this.onApplyEdit(_a44);
},addRow:function(){
this.updateRowCount(this.get("rowCount")+1);
},removeSelectedRows:function(){
if(this.allItemsSelected){
this.updateRowCount(0);
}else{
this.updateRowCount(Math.max(0,this.get("rowCount")-this.selection.getSelected().length));
}
this.selection.clear();
}});
dojox.grid._Grid.markupFactory=function(_a45,node,ctor,_a46){
var d=dojo;
var _a47=function(n){
var w=d.attr(n,"width")||"auto";
if((w!="auto")&&(w.slice(-2)!="em")&&(w.slice(-1)!="%")){
w=parseInt(w,10)+"px";
}
return w;
};
if(!_a45.structure&&node.nodeName.toLowerCase()=="table"){
_a45.structure=d.query("> colgroup",node).map(function(cg){
var sv=d.attr(cg,"span");
var v={noscroll:(d.attr(cg,"noscroll")=="true")?true:false,__span:(!!sv?parseInt(sv,10):1),cells:[]};
if(d.hasAttr(cg,"width")){
v.width=_a47(cg);
}
return v;
});
if(!_a45.structure.length){
_a45.structure.push({__span:Infinity,cells:[]});
}
d.query("thead > tr",node).forEach(function(tr,_a48){
var _a49=0;
var _a4a=0;
var _a4b;
var _a4c=null;
d.query("> th",tr).map(function(th){
if(!_a4c){
_a4b=0;
_a4c=_a45.structure[0];
}else{
if(_a49>=(_a4b+_a4c.__span)){
_a4a++;
_a4b+=_a4c.__span;
var _a4d=_a4c;
_a4c=_a45.structure[_a4a];
}
}
var cell={name:d.trim(d.attr(th,"name")||th.innerHTML),colSpan:parseInt(d.attr(th,"colspan")||1,10),type:d.trim(d.attr(th,"cellType")||""),id:d.trim(d.attr(th,"id")||"")};
_a49+=cell.colSpan;
var _a4e=d.attr(th,"rowspan");
if(_a4e){
cell.rowSpan=_a4e;
}
if(d.hasAttr(th,"width")){
cell.width=_a47(th);
}
if(d.hasAttr(th,"relWidth")){
cell.relWidth=window.parseInt(dojo.attr(th,"relWidth"),10);
}
if(d.hasAttr(th,"hidden")){
cell.hidden=(d.attr(th,"hidden")=="true"||d.attr(th,"hidden")===true);
}
if(_a46){
_a46(th,cell);
}
cell.type=cell.type?dojo.getObject(cell.type):dojox.grid.cells.Cell;
if(cell.type&&cell.type.markupFactory){
cell.type.markupFactory(th,cell);
}
if(!_a4c.cells[_a48]){
_a4c.cells[_a48]=[];
}
_a4c.cells[_a48].push(cell);
});
});
}
return new ctor(_a45,node);
};
})();
}
if(!dojo._hasResource["dojox.grid.DataSelection"]){
dojo._hasResource["dojox.grid.DataSelection"]=true;
dojo.provide("dojox.grid.DataSelection");
dojo.declare("dojox.grid.DataSelection",dojox.grid.Selection,{getFirstSelected:function(){
var idx=dojox.grid.Selection.prototype.getFirstSelected.call(this);
if(idx==-1){
return null;
}
return this.grid.getItem(idx);
},getNextSelected:function(_a4f){
var _a50=this.grid.getItemIndex(_a4f);
var idx=dojox.grid.Selection.prototype.getNextSelected.call(this,_a50);
if(idx==-1){
return null;
}
return this.grid.getItem(idx);
},getSelected:function(){
var _a51=[];
for(var i=0,l=this.selected.length;i<l;i++){
if(this.selected[i]){
_a51.push(this.grid.getItem(i));
}
}
return _a51;
},addToSelection:function(_a52){
if(this.mode=="none"){
return;
}
var idx=null;
if(typeof _a52=="number"||typeof _a52=="string"){
idx=_a52;
}else{
idx=this.grid.getItemIndex(_a52);
}
dojox.grid.Selection.prototype.addToSelection.call(this,idx);
},deselect:function(_a53){
if(this.mode=="none"){
return;
}
var idx=null;
if(typeof _a53=="number"||typeof _a53=="string"){
idx=_a53;
}else{
idx=this.grid.getItemIndex(_a53);
}
dojox.grid.Selection.prototype.deselect.call(this,idx);
},deselectAll:function(_a54){
var idx=null;
if(_a54||typeof _a54=="number"){
if(typeof _a54=="number"||typeof _a54=="string"){
idx=_a54;
}else{
idx=this.grid.getItemIndex(_a54);
}
dojox.grid.Selection.prototype.deselectAll.call(this,idx);
}else{
this.inherited(arguments);
}
}});
}
if(!dojo._hasResource["dojox.grid.DataGrid"]){
dojo._hasResource["dojox.grid.DataGrid"]=true;
dojo.provide("dojox.grid.DataGrid");
dojo.declare("dojox.grid.DataGrid",dojox.grid._Grid,{store:null,query:null,queryOptions:null,fetchText:"...",sortFields:null,updateDelay:1,items:null,_store_connects:null,_by_idty:null,_by_idx:null,_cache:null,_pages:null,_pending_requests:null,_bop:-1,_eop:-1,_requests:0,rowCount:0,_isLoaded:false,_isLoading:false,postCreate:function(){
this._pages=[];
this._store_connects=[];
this._by_idty={};
this._by_idx=[];
this._cache=[];
this._pending_requests={};
this._setStore(this.store);
this.inherited(arguments);
},createSelection:function(){
this.selection=new dojox.grid.DataSelection(this);
},get:function(_a55,_a56){
if(_a56&&this.field=="_item"&&!this.fields){
return _a56;
}else{
if(_a56&&this.fields){
var ret=[];
var s=this.grid.store;
dojo.forEach(this.fields,function(f){
ret=ret.concat(s.getValues(_a56,f));
});
return ret;
}else{
if(!_a56&&typeof _a55==="string"){
return this.inherited(arguments);
}
}
}
return (!_a56?this.defaultValue:(!this.field?this.value:(this.field=="_item"?_a56:this.grid.store.getValue(_a56,this.field))));
},_checkUpdateStatus:function(){
if(this.updateDelay>0){
var _a57=false;
if(this._endUpdateDelay){
clearTimeout(this._endUpdateDelay);
delete this._endUpdateDelay;
_a57=true;
}
if(!this.updating){
this.beginUpdate();
_a57=true;
}
if(_a57){
var _a58=this;
this._endUpdateDelay=setTimeout(function(){
delete _a58._endUpdateDelay;
_a58.endUpdate();
},this.updateDelay);
}
}
},_onSet:function(item,_a59,_a5a,_a5b){
this._checkUpdateStatus();
var idx=this.getItemIndex(item);
if(idx>-1){
this.updateRow(idx);
}
},_createItem:function(item,_a5c){
var idty=this._hasIdentity?this.store.getIdentity(item):dojo.toJson(this.query)+":idx:"+_a5c+":sort:"+dojo.toJson(this.getSortProps());
var o=this._by_idty[idty]={idty:idty,item:item};
return o;
},_addItem:function(item,_a5d,_a5e){
this._by_idx[_a5d]=this._createItem(item,_a5d);
if(!_a5e){
this.updateRow(_a5d);
}
},_onNew:function(item,_a5f){
this._checkUpdateStatus();
var _a60=this.get("rowCount");
this._addingItem=true;
this.updateRowCount(_a60+1);
this._addingItem=false;
this._addItem(item,_a60);
this.showMessage();
},_onDelete:function(item){
this._checkUpdateStatus();
var idx=this._getItemIndex(item,true);
if(idx>=0){
this._pages=[];
this._bop=-1;
this._eop=-1;
var o=this._by_idx[idx];
this._by_idx.splice(idx,1);
delete this._by_idty[o.idty];
this.updateRowCount(this.get("rowCount")-1);
if(this.get("rowCount")===0){
this.showMessage(this.noDataMessage);
}
}
},_onRevert:function(){
this._refresh();
},setStore:function(_a61,_a62,_a63){
this._setQuery(_a62,_a63);
this._setStore(_a61);
this._refresh(true);
},setQuery:function(_a64,_a65){
this._setQuery(_a64,_a65);
this._refresh(true);
},setItems:function(_a66){
this.items=_a66;
this._setStore(this.store);
this._refresh(true);
},_setQuery:function(_a67,_a68){
this.query=_a67;
this.queryOptions=_a68||this.queryOptions;
},_setStore:function(_a69){
if(this.store&&this._store_connects){
dojo.forEach(this._store_connects,this.disconnect,this);
}
this.store=_a69;
if(this.store){
var f=this.store.getFeatures();
var h=[];
this._canEdit=!!f["dojo.data.api.Write"]&&!!f["dojo.data.api.Identity"];
this._hasIdentity=!!f["dojo.data.api.Identity"];
if(!!f["dojo.data.api.Notification"]&&!this.items){
h.push(this.connect(this.store,"onSet","_onSet"));
h.push(this.connect(this.store,"onNew","_onNew"));
h.push(this.connect(this.store,"onDelete","_onDelete"));
}
if(this._canEdit){
h.push(this.connect(this.store,"revert","_onRevert"));
}
this._store_connects=h;
}
},_onFetchBegin:function(size,req){
if(!this.scroller){
return;
}
if(this.rowCount!=size){
if(req.isRender){
this.scroller.init(size,this.keepRows,this.rowsPerPage);
this.rowCount=size;
this._setAutoHeightAttr(this.autoHeight,true);
this._skipRowRenormalize=true;
this.prerender();
this._skipRowRenormalize=false;
}else{
this.updateRowCount(size);
}
}
if(!size){
this.views.render();
this._resize();
this.showMessage(this.noDataMessage);
this.focus.initFocusView();
}else{
this.showMessage();
}
},_onFetchComplete:function(_a6a,req){
if(!this.scroller){
return;
}
if(_a6a&&_a6a.length>0){
dojo.forEach(_a6a,function(item,idx){
this._addItem(item,req.start+idx,true);
},this);
this.updateRows(req.start,_a6a.length);
if(req.isRender){
this.setScrollTop(0);
this.postrender();
}else{
if(this._lastScrollTop){
this.setScrollTop(this._lastScrollTop);
}
}
}
delete this._lastScrollTop;
if(!this._isLoaded){
this._isLoading=false;
this._isLoaded=true;
}
this._pending_requests[req.start]=false;
},_onFetchError:function(err,req){
console.log(err);
delete this._lastScrollTop;
if(!this._isLoaded){
this._isLoading=false;
this._isLoaded=true;
this.showMessage(this.errorMessage);
}
this._pending_requests[req.start]=false;
this.onFetchError(err,req);
},onFetchError:function(err,req){
},_fetch:function(_a6b,_a6c){
_a6b=_a6b||0;
if(this.store&&!this._pending_requests[_a6b]){
if(!this._isLoaded&&!this._isLoading){
this._isLoading=true;
this.showMessage(this.loadingMessage);
}
this._pending_requests[_a6b]=true;
try{
if(this.items){
var _a6d=this.items;
var _a6e=this.store;
this.rowsPerPage=_a6d.length;
var req={start:_a6b,count:this.rowsPerPage,isRender:_a6c};
this._onFetchBegin(_a6d.length,req);
var _a6f=0;
dojo.forEach(_a6d,function(i){
if(!_a6e.isItemLoaded(i)){
_a6f++;
}
});
if(_a6f===0){
this._onFetchComplete(_a6d,req);
}else{
var _a70=function(item){
_a6f--;
if(_a6f===0){
this._onFetchComplete(_a6d,req);
}
};
dojo.forEach(_a6d,function(i){
if(!_a6e.isItemLoaded(i)){
_a6e.loadItem({item:i,onItem:_a70,scope:this});
}
},this);
}
}else{
this.store.fetch({start:_a6b,count:this.rowsPerPage,query:this.query,sort:this.getSortProps(),queryOptions:this.queryOptions,isRender:_a6c,onBegin:dojo.hitch(this,"_onFetchBegin"),onComplete:dojo.hitch(this,"_onFetchComplete"),onError:dojo.hitch(this,"_onFetchError")});
}
}
catch(e){
this._onFetchError(e,{start:_a6b,count:this.rowsPerPage});
}
}
},_clearData:function(){
this.updateRowCount(0);
this._by_idty={};
this._by_idx=[];
this._pages=[];
this._bop=this._eop=-1;
this._isLoaded=false;
this._isLoading=false;
},getItem:function(idx){
var data=this._by_idx[idx];
if(!data||(data&&!data.item)){
this._preparePage(idx);
return null;
}
return data.item;
},getItemIndex:function(item){
return this._getItemIndex(item,false);
},_getItemIndex:function(item,_a71){
if(!_a71&&!this.store.isItem(item)){
return -1;
}
var idty=this._hasIdentity?this.store.getIdentity(item):null;
for(var i=0,l=this._by_idx.length;i<l;i++){
var d=this._by_idx[i];
if(d&&((idty&&d.idty==idty)||(d.item===item))){
return i;
}
}
return -1;
},filter:function(_a72,_a73){
this.query=_a72;
if(_a73){
this._clearData();
}
this._fetch();
},_getItemAttr:function(idx,attr){
var item=this.getItem(idx);
return (!item?this.fetchText:this.store.getValue(item,attr));
},_render:function(){
if(this.domNode.parentNode){
this.scroller.init(this.get("rowCount"),this.keepRows,this.rowsPerPage);
this.prerender();
this._fetch(0,true);
}
},_requestsPending:function(_a74){
return this._pending_requests[_a74];
},_rowToPage:function(_a75){
return (this.rowsPerPage?Math.floor(_a75/this.rowsPerPage):_a75);
},_pageToRow:function(_a76){
return (this.rowsPerPage?this.rowsPerPage*_a76:_a76);
},_preparePage:function(_a77){
if((_a77<this._bop||_a77>=this._eop)&&!this._addingItem){
var _a78=this._rowToPage(_a77);
this._needPage(_a78);
this._bop=_a78*this.rowsPerPage;
this._eop=this._bop+(this.rowsPerPage||this.get("rowCount"));
}
},_needPage:function(_a79){
if(!this._pages[_a79]){
this._pages[_a79]=true;
this._requestPage(_a79);
}
},_requestPage:function(_a7a){
var row=this._pageToRow(_a7a);
var _a7b=Math.min(this.rowsPerPage,this.get("rowCount")-row);
if(_a7b>0){
this._requests++;
if(!this._requestsPending(row)){
setTimeout(dojo.hitch(this,"_fetch",row,false),1);
}
}
},getCellName:function(_a7c){
return _a7c.field;
},_refresh:function(_a7d){
this._clearData();
this._fetch(0,_a7d);
},sort:function(){
this.edit.apply();
this._lastScrollTop=this.scrollTop;
this._refresh();
},canSort:function(){
return (!this._isLoading);
},getSortProps:function(){
var c=this.getCell(this.getSortIndex());
if(!c){
if(this.sortFields){
return this.sortFields;
}
return null;
}else{
var desc=c["sortDesc"];
var si=!(this.sortInfo>0);
if(typeof desc=="undefined"){
desc=si;
}else{
desc=si?!desc:desc;
}
return [{attribute:c.field,descending:desc}];
}
},styleRowState:function(_a7e){
if(this.store&&this.store.getState){
var _a7f=this.store.getState(_a7e.index),c="";
for(var i=0,ss=["inflight","error","inserting"],s;s=ss[i];i++){
if(_a7f[s]){
c=" dojoxGridRow-"+s;
break;
}
}
_a7e.customClasses+=c;
}
},onStyleRow:function(_a80){
this.styleRowState(_a80);
this.inherited(arguments);
},canEdit:function(_a81,_a82){
return this._canEdit;
},_copyAttr:function(idx,attr){
var row={};
var _a83={};
var src=this.getItem(idx);
return this.store.getValue(src,attr);
},doStartEdit:function(_a84,_a85){
if(!this._cache[_a85]){
this._cache[_a85]=this._copyAttr(_a85,_a84.field);
}
this.onStartEdit(_a84,_a85);
},doApplyCellEdit:function(_a86,_a87,_a88){
this.store.fetchItemByIdentity({identity:this._by_idx[_a87].idty,onItem:dojo.hitch(this,function(item){
var _a89=this.store.getValue(item,_a88);
if(typeof _a89=="number"){
_a86=isNaN(_a86)?_a86:parseFloat(_a86);
}else{
if(typeof _a89=="boolean"){
_a86=_a86=="true"?true:_a86=="false"?false:_a86;
}else{
if(_a89 instanceof Date){
var _a8a=new Date(_a86);
_a86=isNaN(_a8a.getTime())?_a86:_a8a;
}
}
}
this.store.setValue(item,_a88,_a86);
this.onApplyCellEdit(_a86,_a87,_a88);
})});
},doCancelEdit:function(_a8b){
var _a8c=this._cache[_a8b];
if(_a8c){
this.updateRow(_a8b);
delete this._cache[_a8b];
}
this.onCancelEdit.apply(this,arguments);
},doApplyEdit:function(_a8d,_a8e){
var _a8f=this._cache[_a8d];
this.onApplyEdit(_a8d);
},removeSelectedRows:function(){
if(this._canEdit){
this.edit.apply();
var fx=dojo.hitch(this,function(_a90){
if(_a90.length){
dojo.forEach(_a90,this.store.deleteItem,this.store);
this.selection.clear();
}
});
if(this.allItemsSelected){
this.store.fetch({query:this.query,queryOptions:this.queryOptions,onComplete:fx});
}else{
fx(this.selection.getSelected());
}
}
}});
dojox.grid.DataGrid.cell_markupFactory=function(_a91,node,_a92){
var _a93=dojo.trim(dojo.attr(node,"field")||"");
if(_a93){
_a92.field=_a93;
}
_a92.field=_a92.field||_a92.name;
var _a94=dojo.trim(dojo.attr(node,"fields")||"");
if(_a94){
_a92.fields=_a94.split(",");
}
if(_a91){
_a91(node,_a92);
}
};
dojox.grid.DataGrid.markupFactory=function(_a95,node,ctor,_a96){
return dojox.grid._Grid.markupFactory(_a95,node,ctor,dojo.partial(dojox.grid.DataGrid.cell_markupFactory,_a96));
};
}
if(!dojo._hasResource["dijit.form._Spinner"]){
dojo._hasResource["dijit.form._Spinner"]=true;
dojo.provide("dijit.form._Spinner");
dojo.declare("dijit.form._Spinner",dijit.form.RangeBoundTextBox,{defaultTimeout:500,minimumTimeout:10,timeoutChangeRate:0.9,smallDelta:1,largeDelta:10,templateString:dojo.cache("dijit.form","templates/Spinner.html","<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\r\n\tid=\"widget_${id}\" role=\"presentation\"\r\n\t><div class=\"dijitReset dijitButtonNode dijitSpinnerButtonContainer\"\r\n\t\t><input class=\"dijitReset dijitInputField dijitSpinnerButtonInner\" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\r\n\t\t/><div class=\"dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitUpArrowButton\"\r\n\t\t\tdojoAttachPoint=\"upArrowNode\"\r\n\t\t\t><div class=\"dijitArrowButtonInner\"\r\n\t\t\t\t><input class=\"dijitReset dijitInputField\" value=\"&#9650;\" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\r\n\t\t\t\t\t${_buttonInputDisabled}\r\n\t\t\t/></div\r\n\t\t></div\r\n\t\t><div class=\"dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitDownArrowButton\"\r\n\t\t\tdojoAttachPoint=\"downArrowNode\"\r\n\t\t\t><div class=\"dijitArrowButtonInner\"\r\n\t\t\t\t><input class=\"dijitReset dijitInputField\" value=\"&#9660;\" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\r\n\t\t\t\t\t${_buttonInputDisabled}\r\n\t\t\t/></div\r\n\t\t></div\r\n\t></div\r\n\t><div class='dijitReset dijitValidationContainer'\r\n\t\t><input class=\"dijitReset dijitInputField dijitValidationIcon dijitValidationInner\" value=\"&#935;\" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\r\n\t/></div\r\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\r\n\t\t><input class='dijitReset dijitInputInner' dojoAttachPoint=\"textbox,focusNode\" type=\"${type}\" dojoAttachEvent=\"onkeypress:_onKeyPress\"\r\n\t\t\trole=\"spinbutton\" autocomplete=\"off\" ${!nameAttrSetting}\r\n\t/></div\r\n></div>\r\n"),baseClass:"dijitTextBox dijitSpinner",cssStateNodes:{"upArrowNode":"dijitUpArrowButton","downArrowNode":"dijitDownArrowButton"},adjust:function(val,_a97){
return val;
},_arrowPressed:function(_a98,_a99,_a9a){
if(this.disabled||this.readOnly){
return;
}
this._setValueAttr(this.adjust(this.get("value"),_a99*_a9a),false);
dijit.selectInputText(this.textbox,this.textbox.value.length);
},_arrowReleased:function(node){
this._wheelTimer=null;
if(this.disabled||this.readOnly){
return;
}
},_typematicCallback:function(_a9b,node,evt){
var inc=this.smallDelta;
if(node==this.textbox){
var k=dojo.keys;
var key=evt.charOrCode;
inc=(key==k.PAGE_UP||key==k.PAGE_DOWN)?this.largeDelta:this.smallDelta;
node=(key==k.UP_ARROW||key==k.PAGE_UP)?this.upArrowNode:this.downArrowNode;
}
if(_a9b==-1){
this._arrowReleased(node);
}else{
this._arrowPressed(node,(node==this.upArrowNode)?1:-1,inc);
}
},_wheelTimer:null,_mouseWheeled:function(evt){
dojo.stopEvent(evt);
var _a9c=evt.detail?(evt.detail*-1):(evt.wheelDelta/120);
if(_a9c!==0){
var node=this[(_a9c>0?"upArrowNode":"downArrowNode")];
this._arrowPressed(node,_a9c,this.smallDelta);
if(!this._wheelTimer){
clearTimeout(this._wheelTimer);
}
this._wheelTimer=setTimeout(dojo.hitch(this,"_arrowReleased",node),50);
}
},postCreate:function(){
this.inherited(arguments);
this.connect(this.domNode,!dojo.isMozilla?"onmousewheel":"DOMMouseScroll","_mouseWheeled");
this._connects.push(dijit.typematic.addListener(this.upArrowNode,this.textbox,{charOrCode:dojo.keys.UP_ARROW,ctrlKey:false,altKey:false,shiftKey:false,metaKey:false},this,"_typematicCallback",this.timeoutChangeRate,this.defaultTimeout,this.minimumTimeout));
this._connects.push(dijit.typematic.addListener(this.downArrowNode,this.textbox,{charOrCode:dojo.keys.DOWN_ARROW,ctrlKey:false,altKey:false,shiftKey:false,metaKey:false},this,"_typematicCallback",this.timeoutChangeRate,this.defaultTimeout,this.minimumTimeout));
this._connects.push(dijit.typematic.addListener(this.upArrowNode,this.textbox,{charOrCode:dojo.keys.PAGE_UP,ctrlKey:false,altKey:false,shiftKey:false,metaKey:false},this,"_typematicCallback",this.timeoutChangeRate,this.defaultTimeout,this.minimumTimeout));
this._connects.push(dijit.typematic.addListener(this.downArrowNode,this.textbox,{charOrCode:dojo.keys.PAGE_DOWN,ctrlKey:false,altKey:false,shiftKey:false,metaKey:false},this,"_typematicCallback",this.timeoutChangeRate,this.defaultTimeout,this.minimumTimeout));
}});
}
if(!dojo._hasResource["dijit.form.NumberTextBox"]){
dojo._hasResource["dijit.form.NumberTextBox"]=true;
dojo.provide("dijit.form.NumberTextBox");
dojo.declare("dijit.form.NumberTextBoxMixin",null,{regExpGen:dojo.number.regexp,value:NaN,editOptions:{pattern:"#.######"},_formatter:dojo.number.format,_setConstraintsAttr:function(_a9d){
var _a9e=typeof _a9d.places=="number"?_a9d.places:0;
if(_a9e){
_a9e++;
}
if(typeof _a9d.max!="number"){
_a9d.max=9*Math.pow(10,15-_a9e);
}
if(typeof _a9d.min!="number"){
_a9d.min=-9*Math.pow(10,15-_a9e);
}
this.inherited(arguments,[_a9d]);
if(this.focusNode&&this.focusNode.value&&!isNaN(this.value)){
this.set("value",this.value);
}
},_onFocus:function(){
if(this.disabled){
return;
}
var val=this.get("value");
if(typeof val=="number"&&!isNaN(val)){
var _a9f=this.format(val,this.constraints);
if(_a9f!==undefined){
this.textbox.value=_a9f;
}
}
this.inherited(arguments);
},format:function(_aa0,_aa1){
var _aa2=String(_aa0);
if(typeof _aa0!="number"){
return _aa2;
}
if(isNaN(_aa0)){
return "";
}
if(!("rangeCheck" in this&&this.rangeCheck(_aa0,_aa1))&&_aa1.exponent!==false&&/\de[-+]?\d/i.test(_aa2)){
return _aa2;
}
if(this.editOptions&&this._focused){
_aa1=dojo.mixin({},_aa1,this.editOptions);
}
return this._formatter(_aa0,_aa1);
},_parser:dojo.number.parse,parse:function(_aa3,_aa4){
var v=this._parser(_aa3,dojo.mixin({},_aa4,(this.editOptions&&this._focused)?this.editOptions:{}));
if(this.editOptions&&this._focused&&isNaN(v)){
v=this._parser(_aa3,_aa4);
}
return v;
},_getDisplayedValueAttr:function(){
var v=this.inherited(arguments);
return isNaN(v)?this.textbox.value:v;
},filter:function(_aa5){
return (_aa5===null||_aa5===""||_aa5===undefined)?NaN:this.inherited(arguments);
},serialize:function(_aa6,_aa7){
return (typeof _aa6!="number"||isNaN(_aa6))?"":this.inherited(arguments);
},_setBlurValue:function(){
var val=dojo.hitch(dojo.mixin({},this,{_focused:true}),"get")("value");
this._setValueAttr(val,true);
},_setValueAttr:function(_aa8,_aa9,_aaa){
if(_aa8!==undefined&&_aaa===undefined){
_aaa=String(_aa8);
if(typeof _aa8=="number"){
if(isNaN(_aa8)){
_aaa="";
}else{
if(("rangeCheck" in this&&this.rangeCheck(_aa8,this.constraints))||this.constraints.exponent===false||!/\de[-+]?\d/i.test(_aaa)){
_aaa=undefined;
}
}
}else{
if(!_aa8){
_aaa="";
_aa8=NaN;
}else{
_aa8=undefined;
}
}
}
this.inherited(arguments,[_aa8,_aa9,_aaa]);
},_getValueAttr:function(){
var v=this.inherited(arguments);
if(isNaN(v)&&this.textbox.value!==""){
if(this.constraints.exponent!==false&&/\de[-+]?\d/i.test(this.textbox.value)&&(new RegExp("^"+dojo.number._realNumberRegexp(dojo.mixin({},this.constraints))+"$").test(this.textbox.value))){
var n=Number(this.textbox.value);
return isNaN(n)?undefined:n;
}else{
return undefined;
}
}else{
return v;
}
},isValid:function(_aab){
if(!this._focused||this._isEmpty(this.textbox.value)){
return this.inherited(arguments);
}else{
var v=this.get("value");
if(!isNaN(v)&&this.rangeCheck(v,this.constraints)){
if(this.constraints.exponent!==false&&/\de[-+]?\d/i.test(this.textbox.value)){
return true;
}else{
return this.inherited(arguments);
}
}else{
return false;
}
}
}});
dojo.declare("dijit.form.NumberTextBox",[dijit.form.RangeBoundTextBox,dijit.form.NumberTextBoxMixin],{baseClass:"dijitTextBox dijitNumberTextBox"});
}
if(!dojo._hasResource["dijit.form.NumberSpinner"]){
dojo._hasResource["dijit.form.NumberSpinner"]=true;
dojo.provide("dijit.form.NumberSpinner");
dojo.declare("dijit.form.NumberSpinner",[dijit.form._Spinner,dijit.form.NumberTextBoxMixin],{adjust:function(val,_aac){
var tc=this.constraints,v=isNaN(val),_aad=!isNaN(tc.max),_aae=!isNaN(tc.min);
if(v&&_aac!=0){
val=(_aac>0)?_aae?tc.min:_aad?tc.max:0:_aad?this.constraints.max:_aae?tc.min:0;
}
var _aaf=val+_aac;
if(v||isNaN(_aaf)){
return val;
}
if(_aad&&(_aaf>tc.max)){
_aaf=tc.max;
}
if(_aae&&(_aaf<tc.min)){
_aaf=tc.min;
}
return _aaf;
},_onKeyPress:function(e){
if((e.charOrCode==dojo.keys.HOME||e.charOrCode==dojo.keys.END)&&!(e.ctrlKey||e.altKey||e.metaKey)&&typeof this.get("value")!="undefined"){
var _ab0=this.constraints[(e.charOrCode==dojo.keys.HOME?"min":"max")];
if(typeof _ab0=="number"){
this._setValueAttr(_ab0,false);
}
dojo.stopEvent(e);
}
}});
}
if(!dojo._hasResource["dojo.cldr.monetary"]){
dojo._hasResource["dojo.cldr.monetary"]=true;
dojo.provide("dojo.cldr.monetary");
dojo.getObject("cldr.monetary",true,dojo);
dojo.cldr.monetary.getData=function(code){
var _ab1={ADP:0,AFN:0,ALL:0,AMD:0,BHD:3,BIF:0,BYR:0,CLF:0,CLP:0,COP:0,CRC:0,DJF:0,ESP:0,GNF:0,GYD:0,HUF:0,IDR:0,IQD:0,IRR:3,ISK:0,ITL:0,JOD:3,JPY:0,KMF:0,KPW:0,KRW:0,KWD:3,LAK:0,LBP:0,LUF:0,LYD:3,MGA:0,MGF:0,MMK:0,MNT:0,MRO:0,MUR:0,OMR:3,PKR:0,PYG:0,RSD:0,RWF:0,SLL:0,SOS:0,STD:0,SYP:0,TMM:0,TND:3,TRL:0,TZS:0,UGX:0,UZS:0,VND:0,VUV:0,XAF:0,XOF:0,XPF:0,YER:0,ZMK:0,ZWD:0};
var _ab2={CHF:5};
var _ab3=_ab1[code],_ab4=_ab2[code];
if(typeof _ab3=="undefined"){
_ab3=2;
}
if(typeof _ab4=="undefined"){
_ab4=0;
}
return {places:_ab3,round:_ab4};
};
}
if(!dojo._hasResource["dojo.currency"]){
dojo._hasResource["dojo.currency"]=true;
dojo.provide("dojo.currency");
dojo.getObject("currency",true,dojo);
dojo.currency._mixInDefaults=function(_ab5){
_ab5=_ab5||{};
_ab5.type="currency";
var _ab6=dojo.i18n.getLocalization("dojo.cldr","currency",_ab5.locale)||{};
var iso=_ab5.currency;
var data=dojo.cldr.monetary.getData(iso);
dojo.forEach(["displayName","symbol","group","decimal"],function(prop){
data[prop]=_ab6[iso+"_"+prop];
});
data.fractional=[true,false];
return dojo.mixin(data,_ab5);
};
dojo.currency.format=function(_ab7,_ab8){
return dojo.number.format(_ab7,dojo.currency._mixInDefaults(_ab8));
};
dojo.currency.regexp=function(_ab9){
return dojo.number.regexp(dojo.currency._mixInDefaults(_ab9));
};
dojo.currency.parse=function(_aba,_abb){
return dojo.number.parse(_aba,dojo.currency._mixInDefaults(_abb));
};
}
if(!dojo._hasResource["dijit.form.CurrencyTextBox"]){
dojo._hasResource["dijit.form.CurrencyTextBox"]=true;
dojo.provide("dijit.form.CurrencyTextBox");
dojo.declare("dijit.form.CurrencyTextBox",dijit.form.NumberTextBox,{currency:"",baseClass:"dijitTextBox dijitCurrencyTextBox",regExpGen:function(_abc){
return "("+(this._focused?this.inherited(arguments,[dojo.mixin({},_abc,this.editOptions)])+"|":"")+dojo.currency.regexp(_abc)+")";
},_formatter:dojo.currency.format,_parser:dojo.currency.parse,parse:function(_abd,_abe){
var v=this.inherited(arguments);
if(isNaN(v)&&/\d+/.test(_abd)){
v=dojo.hitch(dojo.mixin({},this,{_parser:dijit.form.NumberTextBox.prototype._parser}),"inherited")(arguments);
}
return v;
},_setConstraintsAttr:function(_abf){
if(!_abf.currency&&this.currency){
_abf.currency=this.currency;
}
this.inherited(arguments,[dojo.currency._mixInDefaults(dojo.mixin(_abf,{exponent:false}))]);
}});
}
if(!dojo._hasResource["dijit.form.HorizontalSlider"]){
dojo._hasResource["dijit.form.HorizontalSlider"]=true;
dojo.provide("dijit.form.HorizontalSlider");
dojo.declare("dijit.form.HorizontalSlider",[dijit.form._FormValueWidget,dijit._Container],{templateString:dojo.cache("dijit.form","templates/HorizontalSlider.html","<table class=\"dijit dijitReset dijitSlider dijitSliderH\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" rules=\"none\" dojoAttachEvent=\"onkeypress:_onKeyPress,onkeyup:_onKeyUp\"\r\n\t><tr class=\"dijitReset\"\r\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\r\n\t\t><td dojoAttachPoint=\"topDecoration\" class=\"dijitReset dijitSliderDecoration dijitSliderDecorationT dijitSliderDecorationH\"></td\r\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\r\n\t></tr\r\n\t><tr class=\"dijitReset\"\r\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerH\"\r\n\t\t\t><div class=\"dijitSliderDecrementIconH\" style=\"display:none\" dojoAttachPoint=\"decrementButton\"><span class=\"dijitSliderButtonInner\">-</span></div\r\n\t\t></td\r\n\t\t><td class=\"dijitReset\"\r\n\t\t\t><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperH dijitSliderLeftBumper\" dojoAttachEvent=\"onmousedown:_onClkDecBumper\"></div\r\n\t\t></td\r\n\t\t><td class=\"dijitReset\"\r\n\t\t\t><input dojoAttachPoint=\"valueNode\" type=\"hidden\" ${!nameAttrSetting}\r\n\t\t\t/><div class=\"dijitReset dijitSliderBarContainerH\" role=\"presentation\" dojoAttachPoint=\"sliderBarContainer\"\r\n\t\t\t\t><div role=\"presentation\" dojoAttachPoint=\"progressBar\" class=\"dijitSliderBar dijitSliderBarH dijitSliderProgressBar dijitSliderProgressBarH\" dojoAttachEvent=\"onmousedown:_onBarClick\"\r\n\t\t\t\t\t><div class=\"dijitSliderMoveable dijitSliderMoveableH\"\r\n\t\t\t\t\t\t><div dojoAttachPoint=\"sliderHandle,focusNode\" class=\"dijitSliderImageHandle dijitSliderImageHandleH\" dojoAttachEvent=\"onmousedown:_onHandleClick\" role=\"slider\" valuemin=\"${minimum}\" valuemax=\"${maximum}\"></div\r\n\t\t\t\t\t></div\r\n\t\t\t\t></div\r\n\t\t\t\t><div role=\"presentation\" dojoAttachPoint=\"remainingBar\" class=\"dijitSliderBar dijitSliderBarH dijitSliderRemainingBar dijitSliderRemainingBarH\" dojoAttachEvent=\"onmousedown:_onBarClick\"></div\r\n\t\t\t></div\r\n\t\t></td\r\n\t\t><td class=\"dijitReset\"\r\n\t\t\t><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperH dijitSliderRightBumper\" dojoAttachEvent=\"onmousedown:_onClkIncBumper\"></div\r\n\t\t></td\r\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerH\"\r\n\t\t\t><div class=\"dijitSliderIncrementIconH\" style=\"display:none\" dojoAttachPoint=\"incrementButton\"><span class=\"dijitSliderButtonInner\">+</span></div\r\n\t\t></td\r\n\t></tr\r\n\t><tr class=\"dijitReset\"\r\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\r\n\t\t><td dojoAttachPoint=\"containerNode,bottomDecoration\" class=\"dijitReset dijitSliderDecoration dijitSliderDecorationB dijitSliderDecorationH\"></td\r\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\r\n\t></tr\r\n></table>\r\n"),value:0,showButtons:true,minimum:0,maximum:100,discreteValues:Infinity,pageIncrement:2,clickSelect:true,slideDuration:dijit.defaultDuration,widgetsInTemplate:true,attributeMap:dojo.delegate(dijit.form._FormWidget.prototype.attributeMap,{id:""}),baseClass:"dijitSlider",cssStateNodes:{incrementButton:"dijitSliderIncrementButton",decrementButton:"dijitSliderDecrementButton",focusNode:"dijitSliderThumb"},_mousePixelCoord:"pageX",_pixelCount:"w",_startingPixelCoord:"x",_startingPixelCount:"l",_handleOffsetCoord:"left",_progressPixelSize:"width",_onKeyUp:function(e){
if(this.disabled||this.readOnly||e.altKey||e.ctrlKey||e.metaKey){
return;
}
this._setValueAttr(this.value,true);
},_onKeyPress:function(e){
if(this.disabled||this.readOnly||e.altKey||e.ctrlKey||e.metaKey){
return;
}
switch(e.charOrCode){
case dojo.keys.HOME:
this._setValueAttr(this.minimum,false);
break;
case dojo.keys.END:
this._setValueAttr(this.maximum,false);
break;
case ((this._descending||this.isLeftToRight())?dojo.keys.RIGHT_ARROW:dojo.keys.LEFT_ARROW):
case (this._descending===false?dojo.keys.DOWN_ARROW:dojo.keys.UP_ARROW):
case (this._descending===false?dojo.keys.PAGE_DOWN:dojo.keys.PAGE_UP):
this.increment(e);
break;
case ((this._descending||this.isLeftToRight())?dojo.keys.LEFT_ARROW:dojo.keys.RIGHT_ARROW):
case (this._descending===false?dojo.keys.UP_ARROW:dojo.keys.DOWN_ARROW):
case (this._descending===false?dojo.keys.PAGE_UP:dojo.keys.PAGE_DOWN):
this.decrement(e);
break;
default:
return;
}
dojo.stopEvent(e);
},_onHandleClick:function(e){
if(this.disabled||this.readOnly){
return;
}
if(!dojo.isIE){
dijit.focus(this.sliderHandle);
}
dojo.stopEvent(e);
},_isReversed:function(){
return !this.isLeftToRight();
},_onBarClick:function(e){
if(this.disabled||this.readOnly||!this.clickSelect){
return;
}
dijit.focus(this.sliderHandle);
dojo.stopEvent(e);
var _ac0=dojo.position(this.sliderBarContainer,true);
var _ac1=e[this._mousePixelCoord]-_ac0[this._startingPixelCoord];
this._setPixelValue(this._isReversed()?(_ac0[this._pixelCount]-_ac1):_ac1,_ac0[this._pixelCount],true);
this._movable.onMouseDown(e);
},_setPixelValue:function(_ac2,_ac3,_ac4){
if(this.disabled||this.readOnly){
return;
}
_ac2=_ac2<0?0:_ac3<_ac2?_ac3:_ac2;
var _ac5=this.discreteValues;
if(_ac5<=1||_ac5==Infinity){
_ac5=_ac3;
}
_ac5--;
var _ac6=_ac3/_ac5;
var _ac7=Math.round(_ac2/_ac6);
this._setValueAttr((this.maximum-this.minimum)*_ac7/_ac5+this.minimum,_ac4);
},_setValueAttr:function(_ac8,_ac9){
this._set("value",_ac8);
this.valueNode.value=_ac8;
dijit.setWaiState(this.focusNode,"valuenow",_ac8);
this.inherited(arguments);
var _aca=(_ac8-this.minimum)/(this.maximum-this.minimum);
var _acb=(this._descending===false)?this.remainingBar:this.progressBar;
var _acc=(this._descending===false)?this.progressBar:this.remainingBar;
if(this._inProgressAnim&&this._inProgressAnim.status!="stopped"){
this._inProgressAnim.stop(true);
}
if(_ac9&&this.slideDuration>0&&_acb.style[this._progressPixelSize]){
var _acd=this;
var _ace={};
var _acf=parseFloat(_acb.style[this._progressPixelSize]);
var _ad0=this.slideDuration*(_aca-_acf/100);
if(_ad0==0){
return;
}
if(_ad0<0){
_ad0=0-_ad0;
}
_ace[this._progressPixelSize]={start:_acf,end:_aca*100,units:"%"};
this._inProgressAnim=dojo.animateProperty({node:_acb,duration:_ad0,onAnimate:function(v){
_acc.style[_acd._progressPixelSize]=(100-parseFloat(v[_acd._progressPixelSize]))+"%";
},onEnd:function(){
delete _acd._inProgressAnim;
},properties:_ace});
this._inProgressAnim.play();
}else{
_acb.style[this._progressPixelSize]=(_aca*100)+"%";
_acc.style[this._progressPixelSize]=((1-_aca)*100)+"%";
}
},_bumpValue:function(_ad1,_ad2){
if(this.disabled||this.readOnly){
return;
}
var s=dojo.getComputedStyle(this.sliderBarContainer);
var c=dojo._getContentBox(this.sliderBarContainer,s);
var _ad3=this.discreteValues;
if(_ad3<=1||_ad3==Infinity){
_ad3=c[this._pixelCount];
}
_ad3--;
var _ad4=(this.value-this.minimum)*_ad3/(this.maximum-this.minimum)+_ad1;
if(_ad4<0){
_ad4=0;
}
if(_ad4>_ad3){
_ad4=_ad3;
}
_ad4=_ad4*(this.maximum-this.minimum)/_ad3+this.minimum;
this._setValueAttr(_ad4,_ad2);
},_onClkBumper:function(val){
if(this.disabled||this.readOnly||!this.clickSelect){
return;
}
this._setValueAttr(val,true);
},_onClkIncBumper:function(){
this._onClkBumper(this._descending===false?this.minimum:this.maximum);
},_onClkDecBumper:function(){
this._onClkBumper(this._descending===false?this.maximum:this.minimum);
},decrement:function(e){
this._bumpValue(e.charOrCode==dojo.keys.PAGE_DOWN?-this.pageIncrement:-1);
},increment:function(e){
this._bumpValue(e.charOrCode==dojo.keys.PAGE_UP?this.pageIncrement:1);
},_mouseWheeled:function(evt){
dojo.stopEvent(evt);
var _ad5=!dojo.isMozilla;
var _ad6=evt[(_ad5?"wheelDelta":"detail")]*(_ad5?1:-1);
this._bumpValue(_ad6<0?-1:1,true);
},startup:function(){
if(this._started){
return;
}
dojo.forEach(this.getChildren(),function(_ad7){
if(this[_ad7.container]!=this.containerNode){
this[_ad7.container].appendChild(_ad7.domNode);
}
},this);
this.inherited(arguments);
},_typematicCallback:function(_ad8,_ad9,e){
if(_ad8==-1){
this._setValueAttr(this.value,true);
}else{
this[(_ad9==(this._descending?this.incrementButton:this.decrementButton))?"decrement":"increment"](e);
}
},buildRendering:function(){
this.inherited(arguments);
if(this.showButtons){
this.incrementButton.style.display="";
this.decrementButton.style.display="";
}
var _ada=dojo.query("label[for=\""+this.id+"\"]");
if(_ada.length){
_ada[0].id=(this.id+"_label");
dijit.setWaiState(this.focusNode,"labelledby",_ada[0].id);
}
dijit.setWaiState(this.focusNode,"valuemin",this.minimum);
dijit.setWaiState(this.focusNode,"valuemax",this.maximum);
},postCreate:function(){
this.inherited(arguments);
if(this.showButtons){
this._connects.push(dijit.typematic.addMouseListener(this.decrementButton,this,"_typematicCallback",25,500));
this._connects.push(dijit.typematic.addMouseListener(this.incrementButton,this,"_typematicCallback",25,500));
}
this.connect(this.domNode,!dojo.isMozilla?"onmousewheel":"DOMMouseScroll","_mouseWheeled");
var _adb=dojo.declare(dijit.form._SliderMover,{widget:this});
this._movable=new dojo.dnd.Moveable(this.sliderHandle,{mover:_adb});
this._layoutHackIE7();
},destroy:function(){
this._movable.destroy();
if(this._inProgressAnim&&this._inProgressAnim.status!="stopped"){
this._inProgressAnim.stop(true);
}
this._supportingWidgets=dijit.findWidgets(this.domNode);
this.inherited(arguments);
}});
dojo.declare("dijit.form._SliderMover",dojo.dnd.Mover,{onMouseMove:function(e){
var _adc=this.widget;
var _add=_adc._abspos;
if(!_add){
_add=_adc._abspos=dojo.position(_adc.sliderBarContainer,true);
_adc._setPixelValue_=dojo.hitch(_adc,"_setPixelValue");
_adc._isReversed_=_adc._isReversed();
}
var _ade=e.touches?e.touches[0]:e,_adf=_ade[_adc._mousePixelCoord]-_add[_adc._startingPixelCoord];
_adc._setPixelValue_(_adc._isReversed_?(_add[_adc._pixelCount]-_adf):_adf,_add[_adc._pixelCount],false);
},destroy:function(e){
dojo.dnd.Mover.prototype.destroy.apply(this,arguments);
var _ae0=this.widget;
_ae0._abspos=null;
_ae0._setValueAttr(_ae0.value,true);
}});
}
if(!dojo._hasResource["dijit._editor.selection"]){
dojo._hasResource["dijit._editor.selection"]=true;
dojo.provide("dijit._editor.selection");
dojo.getObject("_editor.selection",true,dijit);
dojo.mixin(dijit._editor.selection,{getType:function(){
if(dojo.isIE){
return dojo.doc.selection.type.toLowerCase();
}else{
var _ae1="text";
var oSel;
try{
oSel=dojo.global.getSelection();
}
catch(e){
}
if(oSel&&oSel.rangeCount==1){
var _ae2=oSel.getRangeAt(0);
if((_ae2.startContainer==_ae2.endContainer)&&((_ae2.endOffset-_ae2.startOffset)==1)&&(_ae2.startContainer.nodeType!=3)){
_ae1="control";
}
}
return _ae1;
}
},getSelectedText:function(){
if(dojo.isIE){
if(dijit._editor.selection.getType()=="control"){
return null;
}
return dojo.doc.selection.createRange().text;
}else{
var _ae3=dojo.global.getSelection();
if(_ae3){
return _ae3.toString();
}
}
return "";
},getSelectedHtml:function(){
if(dojo.isIE){
if(dijit._editor.selection.getType()=="control"){
return null;
}
return dojo.doc.selection.createRange().htmlText;
}else{
var _ae4=dojo.global.getSelection();
if(_ae4&&_ae4.rangeCount){
var i;
var html="";
for(i=0;i<_ae4.rangeCount;i++){
var frag=_ae4.getRangeAt(i).cloneContents();
var div=dojo.doc.createElement("div");
div.appendChild(frag);
html+=div.innerHTML;
}
return html;
}
return null;
}
},getSelectedElement:function(){
if(dijit._editor.selection.getType()=="control"){
if(dojo.isIE){
var _ae5=dojo.doc.selection.createRange();
if(_ae5&&_ae5.item){
return dojo.doc.selection.createRange().item(0);
}
}else{
var _ae6=dojo.global.getSelection();
return _ae6.anchorNode.childNodes[_ae6.anchorOffset];
}
}
return null;
},getParentElement:function(){
if(dijit._editor.selection.getType()=="control"){
var p=this.getSelectedElement();
if(p){
return p.parentNode;
}
}else{
if(dojo.isIE){
var r=dojo.doc.selection.createRange();
r.collapse(true);
return r.parentElement();
}else{
var _ae7=dojo.global.getSelection();
if(_ae7){
var node=_ae7.anchorNode;
while(node&&(node.nodeType!=1)){
node=node.parentNode;
}
return node;
}
}
}
return null;
},hasAncestorElement:function(_ae8){
return this.getAncestorElement.apply(this,arguments)!=null;
},getAncestorElement:function(_ae9){
var node=this.getSelectedElement()||this.getParentElement();
return this.getParentOfType(node,arguments);
},isTag:function(node,tags){
if(node&&node.tagName){
var _aea=node.tagName.toLowerCase();
for(var i=0;i<tags.length;i++){
var _aeb=String(tags[i]).toLowerCase();
if(_aea==_aeb){
return _aeb;
}
}
}
return "";
},getParentOfType:function(node,tags){
while(node){
if(this.isTag(node,tags).length){
return node;
}
node=node.parentNode;
}
return null;
},collapse:function(_aec){
if(window.getSelection){
var _aed=dojo.global.getSelection();
if(_aed.removeAllRanges){
if(_aec){
_aed.collapseToStart();
}else{
_aed.collapseToEnd();
}
}else{
_aed.collapse(_aec);
}
}else{
if(dojo.isIE){
var _aee=dojo.doc.selection.createRange();
_aee.collapse(_aec);
_aee.select();
}
}
},remove:function(){
var sel=dojo.doc.selection;
if(dojo.isIE){
if(sel.type.toLowerCase()!="none"){
sel.clear();
}
return sel;
}else{
sel=dojo.global.getSelection();
sel.deleteFromDocument();
return sel;
}
},selectElementChildren:function(_aef,_af0){
var win=dojo.global;
var doc=dojo.doc;
var _af1;
_aef=dojo.byId(_aef);
if(doc.selection&&dojo.isIE&&dojo.body().createTextRange){
_af1=_aef.ownerDocument.body.createTextRange();
_af1.moveToElementText(_aef);
if(!_af0){
try{
_af1.select();
}
catch(e){
}
}
}else{
if(win.getSelection){
var _af2=dojo.global.getSelection();
if(dojo.isOpera){
if(_af2.rangeCount){
_af1=_af2.getRangeAt(0);
}else{
_af1=doc.createRange();
}
_af1.setStart(_aef,0);
_af1.setEnd(_aef,(_aef.nodeType==3)?_aef.length:_aef.childNodes.length);
_af2.addRange(_af1);
}else{
_af2.selectAllChildren(_aef);
}
}
}
},selectElement:function(_af3,_af4){
var _af5;
var doc=dojo.doc;
var win=dojo.global;
_af3=dojo.byId(_af3);
if(dojo.isIE&&dojo.body().createTextRange){
try{
_af5=dojo.body().createControlRange();
_af5.addElement(_af3);
if(!_af4){
_af5.select();
}
}
catch(e){
this.selectElementChildren(_af3,_af4);
}
}else{
if(dojo.global.getSelection){
var _af6=win.getSelection();
_af5=doc.createRange();
if(_af6.removeAllRanges){
if(dojo.isOpera){
if(_af6.getRangeAt(0)){
_af5=_af6.getRangeAt(0);
}
}
_af5.selectNode(_af3);
_af6.removeAllRanges();
_af6.addRange(_af5);
}
}
}
},inSelection:function(node){
if(node){
var _af7;
var doc=dojo.doc;
var _af8;
if(dojo.global.getSelection){
var sel=dojo.global.getSelection();
if(sel&&sel.rangeCount>0){
_af8=sel.getRangeAt(0);
}
if(_af8&&_af8.compareBoundaryPoints&&doc.createRange){
try{
_af7=doc.createRange();
_af7.setStart(node,0);
if(_af8.compareBoundaryPoints(_af8.START_TO_END,_af7)===1){
return true;
}
}
catch(e){
}
}
}else{
if(doc.selection){
_af8=doc.selection.createRange();
try{
_af7=node.ownerDocument.body.createControlRange();
if(_af7){
_af7.addElement(node);
}
}
catch(e1){
try{
_af7=node.ownerDocument.body.createTextRange();
_af7.moveToElementText(node);
}
catch(e2){
}
}
if(_af8&&_af7){
if(_af8.compareEndPoints("EndToStart",_af7)===1){
return true;
}
}
}
}
}
return false;
}});
}
if(!dojo._hasResource["dijit._editor.range"]){
dojo._hasResource["dijit._editor.range"]=true;
dojo.provide("dijit._editor.range");
dijit.range={};
dijit.range.getIndex=function(node,_af9){
var ret=[],retR=[];
var stop=_af9;
var _afa=node;
var _afb,n;
while(node!=stop){
var i=0;
_afb=node.parentNode;
while((n=_afb.childNodes[i++])){
if(n===node){
--i;
break;
}
}
ret.unshift(i);
retR.unshift(i-_afb.childNodes.length);
node=_afb;
}
if(ret.length>0&&_afa.nodeType==3){
n=_afa.previousSibling;
while(n&&n.nodeType==3){
ret[ret.length-1]--;
n=n.previousSibling;
}
n=_afa.nextSibling;
while(n&&n.nodeType==3){
retR[retR.length-1]++;
n=n.nextSibling;
}
}
return {o:ret,r:retR};
};
dijit.range.getNode=function(_afc,_afd){
if(!dojo.isArray(_afc)||_afc.length==0){
return _afd;
}
var node=_afd;
dojo.every(_afc,function(i){
if(i>=0&&i<node.childNodes.length){
node=node.childNodes[i];
}else{
node=null;
return false;
}
return true;
});
return node;
};
dijit.range.getCommonAncestor=function(n1,n2,root){
root=root||n1.ownerDocument.body;
var _afe=function(n){
var as=[];
while(n){
as.unshift(n);
if(n!==root){
n=n.parentNode;
}else{
break;
}
}
return as;
};
var n1as=_afe(n1);
var n2as=_afe(n2);
var m=Math.min(n1as.length,n2as.length);
var com=n1as[0];
for(var i=1;i<m;i++){
if(n1as[i]===n2as[i]){
com=n1as[i];
}else{
break;
}
}
return com;
};
dijit.range.getAncestor=function(node,_aff,root){
root=root||node.ownerDocument.body;
while(node&&node!==root){
var name=node.nodeName.toUpperCase();
if(_aff.test(name)){
return node;
}
node=node.parentNode;
}
return null;
};
dijit.range.BlockTagNames=/^(?:P|DIV|H1|H2|H3|H4|H5|H6|ADDRESS|PRE|OL|UL|LI|DT|DE)$/;
dijit.range.getBlockAncestor=function(node,_b00,root){
root=root||node.ownerDocument.body;
_b00=_b00||dijit.range.BlockTagNames;
var _b01=null,_b02;
while(node&&node!==root){
var name=node.nodeName.toUpperCase();
if(!_b01&&_b00.test(name)){
_b01=node;
}
if(!_b02&&(/^(?:BODY|TD|TH|CAPTION)$/).test(name)){
_b02=node;
}
node=node.parentNode;
}
return {blockNode:_b01,blockContainer:_b02||node.ownerDocument.body};
};
dijit.range.atBeginningOfContainer=function(_b03,node,_b04){
var _b05=false;
var _b06=(_b04==0);
if(!_b06&&node.nodeType==3){
if(/^[\s\xA0]+$/.test(node.nodeValue.substr(0,_b04))){
_b06=true;
}
}
if(_b06){
var _b07=node;
_b05=true;
while(_b07&&_b07!==_b03){
if(_b07.previousSibling){
_b05=false;
break;
}
_b07=_b07.parentNode;
}
}
return _b05;
};
dijit.range.atEndOfContainer=function(_b08,node,_b09){
var _b0a=false;
var _b0b=(_b09==(node.length||node.childNodes.length));
if(!_b0b&&node.nodeType==3){
if(/^[\s\xA0]+$/.test(node.nodeValue.substr(_b09))){
_b0b=true;
}
}
if(_b0b){
var _b0c=node;
_b0a=true;
while(_b0c&&_b0c!==_b08){
if(_b0c.nextSibling){
_b0a=false;
break;
}
_b0c=_b0c.parentNode;
}
}
return _b0a;
};
dijit.range.adjacentNoneTextNode=function(_b0d,next){
var node=_b0d;
var len=(0-_b0d.length)||0;
var prop=next?"nextSibling":"previousSibling";
while(node){
if(node.nodeType!=3){
break;
}
len+=node.length;
node=node[prop];
}
return [node,len];
};
dijit.range._w3c=Boolean(window["getSelection"]);
dijit.range.create=function(win){
if(dijit.range._w3c){
return (win||dojo.global).document.createRange();
}else{
return new dijit.range.W3CRange;
}
};
dijit.range.getSelection=function(win,_b0e){
if(dijit.range._w3c){
return win.getSelection();
}else{
var s=new dijit.range.ie.selection(win);
if(!_b0e){
s._getCurrentSelection();
}
return s;
}
};
if(!dijit.range._w3c){
dijit.range.ie={cachedSelection:{},selection:function(win){
this._ranges=[];
this.addRange=function(r,_b0f){
this._ranges.push(r);
if(!_b0f){
r._select();
}
this.rangeCount=this._ranges.length;
};
this.removeAllRanges=function(){
this._ranges=[];
this.rangeCount=0;
};
var _b10=function(){
var r=win.document.selection.createRange();
var type=win.document.selection.type.toUpperCase();
if(type=="CONTROL"){
return new dijit.range.W3CRange(dijit.range.ie.decomposeControlRange(r));
}else{
return new dijit.range.W3CRange(dijit.range.ie.decomposeTextRange(r));
}
};
this.getRangeAt=function(i){
return this._ranges[i];
};
this._getCurrentSelection=function(){
this.removeAllRanges();
var r=_b10();
if(r){
this.addRange(r,true);
}
};
},decomposeControlRange:function(_b11){
var _b12=_b11.item(0),_b13=_b11.item(_b11.length-1);
var _b14=_b12.parentNode,_b15=_b13.parentNode;
var _b16=dijit.range.getIndex(_b12,_b14).o;
var _b17=dijit.range.getIndex(_b13,_b15).o+1;
return [_b14,_b16,_b15,_b17];
},getEndPoint:function(_b18,end){
var _b19=_b18.duplicate();
_b19.collapse(!end);
var _b1a="EndTo"+(end?"End":"Start");
var _b1b=_b19.parentElement();
var _b1c,_b1d,_b1e;
if(_b1b.childNodes.length>0){
dojo.every(_b1b.childNodes,function(node,i){
var _b1f;
if(node.nodeType!=3){
_b19.moveToElementText(node);
if(_b19.compareEndPoints(_b1a,_b18)>0){
if(_b1e&&_b1e.nodeType==3){
_b1c=_b1e;
_b1f=true;
}else{
_b1c=_b1b;
_b1d=i;
return false;
}
}else{
if(i==_b1b.childNodes.length-1){
_b1c=_b1b;
_b1d=_b1b.childNodes.length;
return false;
}
}
}else{
if(i==_b1b.childNodes.length-1){
_b1c=node;
_b1f=true;
}
}
if(_b1f&&_b1c){
var _b20=dijit.range.adjacentNoneTextNode(_b1c)[0];
if(_b20){
_b1c=_b20.nextSibling;
}else{
_b1c=_b1b.firstChild;
}
var _b21=dijit.range.adjacentNoneTextNode(_b1c);
_b20=_b21[0];
var _b22=_b21[1];
if(_b20){
_b19.moveToElementText(_b20);
_b19.collapse(false);
}else{
_b19.moveToElementText(_b1b);
}
_b19.setEndPoint(_b1a,_b18);
_b1d=_b19.text.length-_b22;
return false;
}
_b1e=node;
return true;
});
}else{
_b1c=_b1b;
_b1d=0;
}
if(!end&&_b1c.nodeType==1&&_b1d==_b1c.childNodes.length){
var _b23=_b1c.nextSibling;
if(_b23&&_b23.nodeType==3){
_b1c=_b23;
_b1d=0;
}
}
return [_b1c,_b1d];
},setEndPoint:function(_b24,_b25,_b26){
var _b27=_b24.duplicate(),node,len;
if(_b25.nodeType!=3){
if(_b26>0){
node=_b25.childNodes[_b26-1];
if(node){
if(node.nodeType==3){
_b25=node;
_b26=node.length;
}else{
if(node.nextSibling&&node.nextSibling.nodeType==3){
_b25=node.nextSibling;
_b26=0;
}else{
_b27.moveToElementText(node.nextSibling?node:_b25);
var _b28=node.parentNode;
var _b29=_b28.insertBefore(node.ownerDocument.createTextNode(" "),node.nextSibling);
_b27.collapse(false);
_b28.removeChild(_b29);
}
}
}
}else{
_b27.moveToElementText(_b25);
_b27.collapse(true);
}
}
if(_b25.nodeType==3){
var _b2a=dijit.range.adjacentNoneTextNode(_b25);
var _b2b=_b2a[0];
len=_b2a[1];
if(_b2b){
_b27.moveToElementText(_b2b);
_b27.collapse(false);
if(_b2b.contentEditable!="inherit"){
len++;
}
}else{
_b27.moveToElementText(_b25.parentNode);
_b27.collapse(true);
}
_b26+=len;
if(_b26>0){
if(_b27.move("character",_b26)!=_b26){
console.error("Error when moving!");
}
}
}
return _b27;
},decomposeTextRange:function(_b2c){
var _b2d=dijit.range.ie.getEndPoint(_b2c);
var _b2e=_b2d[0],_b2f=_b2d[1];
var _b30=_b2d[0],_b31=_b2d[1];
if(_b2c.htmlText.length){
if(_b2c.htmlText==_b2c.text){
_b31=_b2f+_b2c.text.length;
}else{
_b2d=dijit.range.ie.getEndPoint(_b2c,true);
_b30=_b2d[0],_b31=_b2d[1];
}
}
return [_b2e,_b2f,_b30,_b31];
},setRange:function(_b32,_b33,_b34,_b35,_b36,_b37){
var _b38=dijit.range.ie.setEndPoint(_b32,_b33,_b34);
_b32.setEndPoint("StartToStart",_b38);
if(!_b37){
var end=dijit.range.ie.setEndPoint(_b32,_b35,_b36);
}
_b32.setEndPoint("EndToEnd",end||_b38);
return _b32;
}};
dojo.declare("dijit.range.W3CRange",null,{constructor:function(){
if(arguments.length>0){
this.setStart(arguments[0][0],arguments[0][1]);
this.setEnd(arguments[0][2],arguments[0][3]);
}else{
this.commonAncestorContainer=null;
this.startContainer=null;
this.startOffset=0;
this.endContainer=null;
this.endOffset=0;
this.collapsed=true;
}
},_updateInternal:function(){
if(this.startContainer!==this.endContainer){
this.commonAncestorContainer=dijit.range.getCommonAncestor(this.startContainer,this.endContainer);
}else{
this.commonAncestorContainer=this.startContainer;
}
this.collapsed=(this.startContainer===this.endContainer)&&(this.startOffset==this.endOffset);
},setStart:function(node,_b39){
_b39=parseInt(_b39);
if(this.startContainer===node&&this.startOffset==_b39){
return;
}
delete this._cachedBookmark;
this.startContainer=node;
this.startOffset=_b39;
if(!this.endContainer){
this.setEnd(node,_b39);
}else{
this._updateInternal();
}
},setEnd:function(node,_b3a){
_b3a=parseInt(_b3a);
if(this.endContainer===node&&this.endOffset==_b3a){
return;
}
delete this._cachedBookmark;
this.endContainer=node;
this.endOffset=_b3a;
if(!this.startContainer){
this.setStart(node,_b3a);
}else{
this._updateInternal();
}
},setStartAfter:function(node,_b3b){
this._setPoint("setStart",node,_b3b,1);
},setStartBefore:function(node,_b3c){
this._setPoint("setStart",node,_b3c,0);
},setEndAfter:function(node,_b3d){
this._setPoint("setEnd",node,_b3d,1);
},setEndBefore:function(node,_b3e){
this._setPoint("setEnd",node,_b3e,0);
},_setPoint:function(what,node,_b3f,ext){
var _b40=dijit.range.getIndex(node,node.parentNode).o;
this[what](node.parentNode,_b40.pop()+ext);
},_getIERange:function(){
var r=(this._body||this.endContainer.ownerDocument.body).createTextRange();
dijit.range.ie.setRange(r,this.startContainer,this.startOffset,this.endContainer,this.endOffset,this.collapsed);
return r;
},getBookmark:function(body){
this._getIERange();
return this._cachedBookmark;
},_select:function(){
var r=this._getIERange();
r.select();
},deleteContents:function(){
var r=this._getIERange();
r.pasteHTML("");
this.endContainer=this.startContainer;
this.endOffset=this.startOffset;
this.collapsed=true;
},cloneRange:function(){
var r=new dijit.range.W3CRange([this.startContainer,this.startOffset,this.endContainer,this.endOffset]);
r._body=this._body;
return r;
},detach:function(){
this._body=null;
this.commonAncestorContainer=null;
this.startContainer=null;
this.startOffset=0;
this.endContainer=null;
this.endOffset=0;
this.collapsed=true;
}});
}
}
if(!dojo._hasResource["dijit._editor.html"]){
dojo._hasResource["dijit._editor.html"]=true;
dojo.provide("dijit._editor.html");
dojo.getObject("_editor",true,dijit);
dijit._editor.escapeXml=function(str,_b41){
str=str.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;");
if(!_b41){
str=str.replace(/'/gm,"&#39;");
}
return str;
};
dijit._editor.getNodeHtml=function(node){
var _b42;
switch(node.nodeType){
case 1:
var _b43=node.nodeName.toLowerCase();
if(!_b43||_b43.charAt(0)=="/"){
return "";
}
_b42="<"+_b43;
var _b44=[];
var attr;
if(dojo.isIE&&node.outerHTML){
var s=node.outerHTML;
s=s.substr(0,s.indexOf(">")).replace(/(['"])[^"']*\1/g,"");
var reg=/(\b\w+)\s?=/g;
var m,key;
while((m=reg.exec(s))){
key=m[1];
if(key.substr(0,3)!="_dj"){
if(key=="src"||key=="href"){
if(node.getAttribute("_djrealurl")){
_b44.push([key,node.getAttribute("_djrealurl")]);
continue;
}
}
var val,_b45;
switch(key){
case "style":
val=node.style.cssText.toLowerCase();
break;
case "class":
val=node.className;
break;
case "width":
if(_b43==="img"){
_b45=/width=(\S+)/i.exec(s);
if(_b45){
val=_b45[1];
}
break;
}
case "height":
if(_b43==="img"){
_b45=/height=(\S+)/i.exec(s);
if(_b45){
val=_b45[1];
}
break;
}
default:
val=node.getAttribute(key);
}
if(val!=null){
_b44.push([key,val.toString()]);
}
}
}
}else{
var i=0;
while((attr=node.attributes[i++])){
var n=attr.name;
if(n.substr(0,3)!="_dj"){
var v=attr.value;
if(n=="src"||n=="href"){
if(node.getAttribute("_djrealurl")){
v=node.getAttribute("_djrealurl");
}
}
_b44.push([n,v]);
}
}
}
_b44.sort(function(a,b){
return a[0]<b[0]?-1:(a[0]==b[0]?0:1);
});
var j=0;
while((attr=_b44[j++])){
_b42+=" "+attr[0]+"=\""+(dojo.isString(attr[1])?dijit._editor.escapeXml(attr[1],true):attr[1])+"\"";
}
if(_b43==="script"){
_b42+=">"+node.innerHTML+"</"+_b43+">";
}else{
if(node.childNodes.length){
_b42+=">"+dijit._editor.getChildrenHtml(node)+"</"+_b43+">";
}else{
switch(_b43){
case "br":
case "hr":
case "img":
case "input":
case "base":
case "meta":
case "area":
case "basefont":
_b42+=" />";
break;
default:
_b42+="></"+_b43+">";
}
}
}
break;
case 4:
case 3:
_b42=dijit._editor.escapeXml(node.nodeValue,true);
break;
case 8:
_b42="<!--"+dijit._editor.escapeXml(node.nodeValue,true)+"-->";
break;
default:
_b42="<!-- Element not recognized - Type: "+node.nodeType+" Name: "+node.nodeName+"-->";
}
return _b42;
};
dijit._editor.getChildrenHtml=function(dom){
var out="";
if(!dom){
return out;
}
var _b46=dom["childNodes"]||dom;
var _b47=!dojo.isIE||_b46!==dom;
var node,i=0;
while((node=_b46[i++])){
if(!_b47||node.parentNode==dom){
out+=dijit._editor.getNodeHtml(node);
}
}
return out;
};
}
if(!dojo._hasResource["dijit._editor.RichText"]){
dojo._hasResource["dijit._editor.RichText"]=true;
dojo.provide("dijit._editor.RichText");
if(!dojo.config["useXDomain"]||dojo.config["allowXdRichTextSave"]){
if(dojo._postLoad){
(function(){
var _b48=dojo.doc.createElement("textarea");
_b48.id=dijit._scopeName+"._editor.RichText.value";
dojo.style(_b48,{display:"none",position:"absolute",top:"-100px",height:"3px",width:"3px"});
dojo.body().appendChild(_b48);
})();
}else{
try{
dojo.doc.write("<textarea id=\""+dijit._scopeName+"._editor.RichText.value\" "+"style=\"display:none;position:absolute;top:-100px;left:-100px;height:3px;width:3px;overflow:hidden;\"></textarea>");
}
catch(e){
}
}
}
dojo.declare("dijit._editor.RichText",[dijit._Widget,dijit._CssStateMixin],{constructor:function(_b49){
this.contentPreFilters=[];
this.contentPostFilters=[];
this.contentDomPreFilters=[];
this.contentDomPostFilters=[];
this.editingAreaStyleSheets=[];
this.events=[].concat(this.events);
this._keyHandlers={};
if(_b49&&dojo.isString(_b49.value)){
this.value=_b49.value;
}
this.onLoadDeferred=new dojo.Deferred();
},baseClass:"dijitEditor",inheritWidth:false,focusOnLoad:false,name:"",styleSheets:"",height:"300px",minHeight:"1em",isClosed:true,isLoaded:false,_SEPARATOR:"@@**%%__RICHTEXTBOUNDRY__%%**@@",_NAME_CONTENT_SEP:"@@**%%:%%**@@",onLoadDeferred:null,isTabIndent:false,disableSpellCheck:false,postCreate:function(){
if("textarea"==this.domNode.tagName.toLowerCase()){
console.warn("RichText should not be used with the TEXTAREA tag.  See dijit._editor.RichText docs.");
}
this.contentPreFilters=[dojo.hitch(this,"_preFixUrlAttributes")].concat(this.contentPreFilters);
if(dojo.isMoz){
this.contentPreFilters=[this._normalizeFontStyle].concat(this.contentPreFilters);
this.contentPostFilters=[this._removeMozBogus].concat(this.contentPostFilters);
}
if(dojo.isWebKit){
this.contentPreFilters=[this._removeWebkitBogus].concat(this.contentPreFilters);
this.contentPostFilters=[this._removeWebkitBogus].concat(this.contentPostFilters);
}
if(dojo.isIE){
this.contentPostFilters=[this._normalizeFontStyle].concat(this.contentPostFilters);
}
this.inherited(arguments);
dojo.publish(dijit._scopeName+"._editor.RichText::init",[this]);
this.open();
this.setupDefaultShortcuts();
},setupDefaultShortcuts:function(){
var exec=dojo.hitch(this,function(cmd,arg){
return function(){
return !this.execCommand(cmd,arg);
};
});
var _b4a={b:exec("bold"),i:exec("italic"),u:exec("underline"),a:exec("selectall"),s:function(){
this.save(true);
},m:function(){
this.isTabIndent=!this.isTabIndent;
},"1":exec("formatblock","h1"),"2":exec("formatblock","h2"),"3":exec("formatblock","h3"),"4":exec("formatblock","h4"),"\\":exec("insertunorderedlist")};
if(!dojo.isIE){
_b4a.Z=exec("redo");
}
for(var key in _b4a){
this.addKeyHandler(key,true,false,_b4a[key]);
}
},events:["onKeyPress","onKeyDown","onKeyUp"],captureEvents:[],_editorCommandsLocalized:false,_localizeEditorCommands:function(){
if(this._editorCommandsLocalized){
return;
}
this._editorCommandsLocalized=true;
var _b4b=["div","p","pre","h1","h2","h3","h4","h5","h6","ol","ul","address"];
var _b4c="",_b4d,i=0;
while((_b4d=_b4b[i++])){
if(_b4d.charAt(1)!="l"){
_b4c+="<"+_b4d+"><span>content</span></"+_b4d+"><br/>";
}else{
_b4c+="<"+_b4d+"><li>content</li></"+_b4d+"><br/>";
}
}
var div=dojo.doc.createElement("div");
dojo.style(div,{position:"absolute",top:"-2000px"});
dojo.doc.body.appendChild(div);
div.innerHTML=_b4c;
var node=div.firstChild;
while(node){
dijit._editor.selection.selectElement(node.firstChild);
dojo.withGlobal(this.window,"selectElement",dijit._editor.selection,[node.firstChild]);
var _b4e=node.tagName.toLowerCase();
this._local2NativeFormatNames[_b4e]=document.queryCommandValue("formatblock");
this._native2LocalFormatNames[this._local2NativeFormatNames[_b4e]]=_b4e;
node=node.nextSibling.nextSibling;
}
dojo.body().removeChild(div);
},open:function(_b4f){
if(!this.onLoadDeferred||this.onLoadDeferred.fired>=0){
this.onLoadDeferred=new dojo.Deferred();
}
if(!this.isClosed){
this.close();
}
dojo.publish(dijit._scopeName+"._editor.RichText::open",[this]);
if(arguments.length==1&&_b4f.nodeName){
this.domNode=_b4f;
}
var dn=this.domNode;
var html;
if(dojo.isString(this.value)){
html=this.value;
delete this.value;
dn.innerHTML="";
}else{
if(dn.nodeName&&dn.nodeName.toLowerCase()=="textarea"){
var ta=(this.textarea=dn);
this.name=ta.name;
html=ta.value;
dn=this.domNode=dojo.doc.createElement("div");
dn.setAttribute("widgetId",this.id);
ta.removeAttribute("widgetId");
dn.cssText=ta.cssText;
dn.className+=" "+ta.className;
dojo.place(dn,ta,"before");
var _b50=dojo.hitch(this,function(){
dojo.style(ta,{display:"block",position:"absolute",top:"-1000px"});
if(dojo.isIE){
var s=ta.style;
this.__overflow=s.overflow;
s.overflow="hidden";
}
});
if(dojo.isIE){
setTimeout(_b50,10);
}else{
_b50();
}
if(ta.form){
var _b51=ta.value;
this.reset=function(){
var _b52=this.getValue();
if(_b52!=_b51){
this.replaceValue(_b51);
}
};
dojo.connect(ta.form,"onsubmit",this,function(){
dojo.attr(ta,"disabled",this.disabled);
ta.value=this.getValue();
});
}
}else{
html=dijit._editor.getChildrenHtml(dn);
dn.innerHTML="";
}
}
var _b53=dojo.contentBox(dn);
this._oldHeight=_b53.h;
this._oldWidth=_b53.w;
this.value=html;
if(dn.nodeName&&dn.nodeName=="LI"){
dn.innerHTML=" <br>";
}
this.header=dn.ownerDocument.createElement("div");
dn.appendChild(this.header);
this.editingArea=dn.ownerDocument.createElement("div");
dn.appendChild(this.editingArea);
this.footer=dn.ownerDocument.createElement("div");
dn.appendChild(this.footer);
if(!this.name){
this.name=this.id+"_AUTOGEN";
}
if(this.name!==""&&(!dojo.config["useXDomain"]||dojo.config["allowXdRichTextSave"])){
var _b54=dojo.byId(dijit._scopeName+"._editor.RichText.value");
if(_b54&&_b54.value!==""){
var _b55=_b54.value.split(this._SEPARATOR),i=0,dat;
while((dat=_b55[i++])){
var data=dat.split(this._NAME_CONTENT_SEP);
if(data[0]==this.name){
html=data[1];
_b55=_b55.splice(i,1);
_b54.value=_b55.join(this._SEPARATOR);
break;
}
}
}
if(!dijit._editor._globalSaveHandler){
dijit._editor._globalSaveHandler={};
dojo.addOnUnload(function(){
var id;
for(id in dijit._editor._globalSaveHandler){
var f=dijit._editor._globalSaveHandler[id];
if(dojo.isFunction(f)){
f();
}
}
});
}
dijit._editor._globalSaveHandler[this.id]=dojo.hitch(this,"_saveContent");
}
this.isClosed=false;
var ifr=(this.editorObject=this.iframe=dojo.doc.createElement("iframe"));
ifr.id=this.id+"_iframe";
this._iframeSrc=this._getIframeDocTxt();
ifr.style.border="none";
ifr.style.width="100%";
if(this._layoutMode){
ifr.style.height="100%";
}else{
if(dojo.isIE>=7){
if(this.height){
ifr.style.height=this.height;
}
if(this.minHeight){
ifr.style.minHeight=this.minHeight;
}
}else{
ifr.style.height=this.height?this.height:this.minHeight;
}
}
ifr.frameBorder=0;
ifr._loadFunc=dojo.hitch(this,function(win){
this.window=win;
this.document=this.window.document;
if(dojo.isIE){
this._localizeEditorCommands();
}
this.onLoad(html);
});
var s="javascript:parent."+dijit._scopeName+".byId(\""+this.id+"\")._iframeSrc";
ifr.setAttribute("src",s);
this.editingArea.appendChild(ifr);
if(dojo.isSafari<=4){
var src=ifr.getAttribute("src");
if(!src||src.indexOf("javascript")==-1){
setTimeout(function(){
ifr.setAttribute("src",s);
},0);
}
}
if(dn.nodeName=="LI"){
dn.lastChild.style.marginTop="-1.2em";
}
dojo.addClass(this.domNode,this.baseClass);
},_local2NativeFormatNames:{},_native2LocalFormatNames:{},_getIframeDocTxt:function(){
var _b56=dojo.getComputedStyle(this.domNode);
var html="";
var _b57=true;
if(dojo.isIE||dojo.isWebKit||(!this.height&&!dojo.isMoz)){
html="<div id='dijitEditorBody'></div>";
_b57=false;
}else{
if(dojo.isMoz){
this._cursorToStart=true;
html="&nbsp;";
}
}
var font=[_b56.fontWeight,_b56.fontSize,_b56.fontFamily].join(" ");
var _b58=_b56.lineHeight;
if(_b58.indexOf("px")>=0){
_b58=parseFloat(_b58)/parseFloat(_b56.fontSize);
}else{
if(_b58.indexOf("em")>=0){
_b58=parseFloat(_b58);
}else{
_b58="normal";
}
}
var _b59="";
var self=this;
this.style.replace(/(^|;)\s*(line-|font-?)[^;]+/ig,function(_b5a){
_b5a=_b5a.replace(/^;/ig,"")+";";
var s=_b5a.split(":")[0];
if(s){
s=dojo.trim(s);
s=s.toLowerCase();
var i;
var sC="";
for(i=0;i<s.length;i++){
var c=s.charAt(i);
switch(c){
case "-":
i++;
c=s.charAt(i).toUpperCase();
default:
sC+=c;
}
}
dojo.style(self.domNode,sC,"");
}
_b59+=_b5a+";";
});
var _b5b=dojo.query("label[for=\""+this.id+"\"]");
return [this.isLeftToRight()?"<html>\n<head>\n":"<html dir='rtl'>\n<head>\n",(dojo.isMoz&&_b5b.length?"<title>"+_b5b[0].innerHTML+"</title>\n":""),"<meta http-equiv='Content-Type' content='text/html'>\n","<style>\n","\tbody,html {\n","\t\tbackground:transparent;\n","\t\tpadding: 1px 0 0 0;\n","\t\tmargin: -1px 0 0 0;\n",((dojo.isWebKit)?"\t\twidth: 100%;\n":""),((dojo.isWebKit)?"\t\theight: 100%;\n":""),"\t}\n","\tbody{\n","\t\ttop:0px;\n","\t\tleft:0px;\n","\t\tright:0px;\n","\t\tfont:",font,";\n",((this.height||dojo.isOpera)?"":"\t\tposition: fixed;\n"),"\t\tmin-height:",this.minHeight,";\n","\t\tline-height:",_b58,";\n","\t}\n","\tp{ margin: 1em 0; }\n",(!_b57&&!this.height?"\tbody,html {overflow-y: hidden;}\n":""),"\t#dijitEditorBody{overflow-x: auto; overflow-y:"+(this.height?"auto;":"hidden;")+" outline: 0px;}\n","\tli > ul:-moz-first-node, li > ol:-moz-first-node{ padding-top: 1.2em; }\n","\tli{ min-height:1.2em; }\n","</style>\n",this._applyEditingAreaStyleSheets(),"\n","</head>\n<body ",(_b57?"id='dijitEditorBody' ":""),"onload='frameElement._loadFunc(window,document)' style='"+_b59+"'>",html,"</body>\n</html>"].join("");
},_applyEditingAreaStyleSheets:function(){
var _b5c=[];
if(this.styleSheets){
_b5c=this.styleSheets.split(";");
this.styleSheets="";
}
_b5c=_b5c.concat(this.editingAreaStyleSheets);
this.editingAreaStyleSheets=[];
var text="",i=0,url;
while((url=_b5c[i++])){
var _b5d=(new dojo._Url(dojo.global.location,url)).toString();
this.editingAreaStyleSheets.push(_b5d);
text+="<link rel=\"stylesheet\" type=\"text/css\" href=\""+_b5d+"\"/>";
}
return text;
},addStyleSheet:function(uri){
var url=uri.toString();
if(url.charAt(0)=="."||(url.charAt(0)!="/"&&!uri.host)){
url=(new dojo._Url(dojo.global.location,url)).toString();
}
if(dojo.indexOf(this.editingAreaStyleSheets,url)>-1){
return;
}
this.editingAreaStyleSheets.push(url);
this.onLoadDeferred.addCallback(dojo.hitch(this,function(){
if(this.document.createStyleSheet){
this.document.createStyleSheet(url);
}else{
var head=this.document.getElementsByTagName("head")[0];
var _b5e=this.document.createElement("link");
_b5e.rel="stylesheet";
_b5e.type="text/css";
_b5e.href=url;
head.appendChild(_b5e);
}
}));
},removeStyleSheet:function(uri){
var url=uri.toString();
if(url.charAt(0)=="."||(url.charAt(0)!="/"&&!uri.host)){
url=(new dojo._Url(dojo.global.location,url)).toString();
}
var _b5f=dojo.indexOf(this.editingAreaStyleSheets,url);
if(_b5f==-1){
return;
}
delete this.editingAreaStyleSheets[_b5f];
dojo.withGlobal(this.window,"query",dojo,["link:[href=\""+url+"\"]"]).orphan();
},disabled:false,_mozSettingProps:{"styleWithCSS":false},_setDisabledAttr:function(_b60){
_b60=!!_b60;
this._set("disabled",_b60);
if(!this.isLoaded){
return;
}
if(dojo.isIE||dojo.isWebKit||dojo.isOpera){
var _b61=dojo.isIE&&(this.isLoaded||!this.focusOnLoad);
if(_b61){
this.editNode.unselectable="on";
}
this.editNode.contentEditable=!_b60;
if(_b61){
var _b62=this;
setTimeout(function(){
_b62.editNode.unselectable="off";
},0);
}
}else{
try{
this.document.designMode=(_b60?"off":"on");
}
catch(e){
return;
}
if(!_b60&&this._mozSettingProps){
var ps=this._mozSettingProps;
for(var n in ps){
if(ps.hasOwnProperty(n)){
try{
this.document.execCommand(n,false,ps[n]);
}
catch(e2){
}
}
}
}
}
this._disabledOK=true;
},onLoad:function(html){
if(!this.window.__registeredWindow){
this.window.__registeredWindow=true;
this._iframeRegHandle=dijit.registerIframe(this.iframe);
}
if(!dojo.isIE&&!dojo.isWebKit&&(this.height||dojo.isMoz)){
this.editNode=this.document.body;
}else{
this.editNode=this.document.body.firstChild;
var _b63=this;
if(dojo.isIE){
this.tabStop=dojo.create("div",{tabIndex:-1},this.editingArea);
this.iframe.onfocus=function(){
_b63.editNode.setActive();
};
}
}
this.focusNode=this.editNode;
var _b64=this.events.concat(this.captureEvents);
var ap=this.iframe?this.document:this.editNode;
dojo.forEach(_b64,function(item){
this.connect(ap,item.toLowerCase(),item);
},this);
this.connect(ap,"onmouseup","onClick");
if(dojo.isIE){
this.connect(this.document,"onmousedown","_onIEMouseDown");
this.editNode.style.zoom=1;
}else{
this.connect(this.document,"onmousedown",function(){
delete this._cursorToStart;
});
}
if(dojo.isWebKit){
this._webkitListener=this.connect(this.document,"onmouseup","onDisplayChanged");
this.connect(this.document,"onmousedown",function(e){
var t=e.target;
if(t&&(t===this.document.body||t===this.document)){
setTimeout(dojo.hitch(this,"placeCursorAtEnd"),0);
}
});
}
if(dojo.isIE){
try{
this.document.execCommand("RespectVisibilityInDesign",true,null);
}
catch(e){
}
}
this.isLoaded=true;
this.set("disabled",this.disabled);
var _b65=dojo.hitch(this,function(){
this.setValue(html);
if(this.onLoadDeferred){
this.onLoadDeferred.callback(true);
}
this.onDisplayChanged();
if(this.focusOnLoad){
dojo.addOnLoad(dojo.hitch(this,function(){
setTimeout(dojo.hitch(this,"focus"),this.updateInterval);
}));
}
this.value=this.getValue(true);
});
if(this.setValueDeferred){
this.setValueDeferred.addCallback(_b65);
}else{
_b65();
}
},onKeyDown:function(e){
if(e.keyCode===dojo.keys.TAB&&this.isTabIndent){
dojo.stopEvent(e);
if(this.queryCommandEnabled((e.shiftKey?"outdent":"indent"))){
this.execCommand((e.shiftKey?"outdent":"indent"));
}
}
if(dojo.isIE){
if(e.keyCode==dojo.keys.TAB&&!this.isTabIndent){
if(e.shiftKey&&!e.ctrlKey&&!e.altKey){
this.iframe.focus();
}else{
if(!e.shiftKey&&!e.ctrlKey&&!e.altKey){
this.tabStop.focus();
}
}
}else{
if(e.keyCode===dojo.keys.BACKSPACE&&this.document.selection.type==="Control"){
dojo.stopEvent(e);
this.execCommand("delete");
}else{
if((65<=e.keyCode&&e.keyCode<=90)||(e.keyCode>=37&&e.keyCode<=40)){
e.charCode=e.keyCode;
this.onKeyPress(e);
}
}
}
}
return true;
},onKeyUp:function(e){
return;
},setDisabled:function(_b66){
dojo.deprecated("dijit.Editor::setDisabled is deprecated","use dijit.Editor::attr(\"disabled\",boolean) instead",2);
this.set("disabled",_b66);
},_setValueAttr:function(_b67){
this.setValue(_b67);
},_setDisableSpellCheckAttr:function(_b68){
if(this.document){
dojo.attr(this.document.body,"spellcheck",!_b68);
}else{
this.onLoadDeferred.addCallback(dojo.hitch(this,function(){
dojo.attr(this.document.body,"spellcheck",!_b68);
}));
}
this._set("disableSpellCheck",_b68);
},onKeyPress:function(e){
var c=(e.keyChar&&e.keyChar.toLowerCase())||e.keyCode,_b69=this._keyHandlers[c],args=arguments;
if(_b69&&!e.altKey){
dojo.some(_b69,function(h){
if(!(h.shift^e.shiftKey)&&!(h.ctrl^(e.ctrlKey||e.metaKey))){
if(!h.handler.apply(this,args)){
e.preventDefault();
}
return true;
}
},this);
}
if(!this._onKeyHitch){
this._onKeyHitch=dojo.hitch(this,"onKeyPressed");
}
setTimeout(this._onKeyHitch,1);
return true;
},addKeyHandler:function(key,ctrl,_b6a,_b6b){
if(!dojo.isArray(this._keyHandlers[key])){
this._keyHandlers[key]=[];
}
this._keyHandlers[key].push({shift:_b6a||false,ctrl:ctrl||false,handler:_b6b});
},onKeyPressed:function(){
this.onDisplayChanged();
},onClick:function(e){
this.onDisplayChanged(e);
},_onIEMouseDown:function(e){
if(!this._focused&&!this.disabled){
this.focus();
}
},_onBlur:function(e){
this.inherited(arguments);
var _b6c=this.getValue(true);
if(_b6c!=this.value){
this.onChange(_b6c);
}
this._set("value",_b6c);
},_onFocus:function(e){
if(!this.disabled){
if(!this._disabledOK){
this.set("disabled",false);
}
this.inherited(arguments);
}
},blur:function(){
if(!dojo.isIE&&this.window.document.documentElement&&this.window.document.documentElement.focus){
this.window.document.documentElement.focus();
}else{
if(dojo.doc.body.focus){
dojo.doc.body.focus();
}
}
},focus:function(){
if(!this.isLoaded){
this.focusOnLoad=true;
return;
}
if(this._cursorToStart){
delete this._cursorToStart;
if(this.editNode.childNodes){
this.placeCursorAtStart();
return;
}
}
if(!dojo.isIE){
dijit.focus(this.iframe);
}else{
if(this.editNode&&this.editNode.focus){
this.iframe.fireEvent("onfocus",document.createEventObject());
}
}
},updateInterval:200,_updateTimer:null,onDisplayChanged:function(e){
if(this._updateTimer){
clearTimeout(this._updateTimer);
}
if(!this._updateHandler){
this._updateHandler=dojo.hitch(this,"onNormalizedDisplayChanged");
}
this._updateTimer=setTimeout(this._updateHandler,this.updateInterval);
},onNormalizedDisplayChanged:function(){
delete this._updateTimer;
},onChange:function(_b6d){
},_normalizeCommand:function(cmd,_b6e){
var _b6f=cmd.toLowerCase();
if(_b6f=="formatblock"){
if(dojo.isSafari&&_b6e===undefined){
_b6f="heading";
}
}else{
if(_b6f=="hilitecolor"&&!dojo.isMoz){
_b6f="backcolor";
}
}
return _b6f;
},_qcaCache:{},queryCommandAvailable:function(_b70){
var ca=this._qcaCache[_b70];
if(ca!==undefined){
return ca;
}
return (this._qcaCache[_b70]=this._queryCommandAvailable(_b70));
},_queryCommandAvailable:function(_b71){
var ie=1;
var _b72=1<<1;
var _b73=1<<2;
var _b74=1<<3;
function _b75(_b76){
return {ie:Boolean(_b76&ie),mozilla:Boolean(_b76&_b72),webkit:Boolean(_b76&_b73),opera:Boolean(_b76&_b74)};
};
var _b77=null;
switch(_b71.toLowerCase()){
case "bold":
case "italic":
case "underline":
case "subscript":
case "superscript":
case "fontname":
case "fontsize":
case "forecolor":
case "hilitecolor":
case "justifycenter":
case "justifyfull":
case "justifyleft":
case "justifyright":
case "delete":
case "selectall":
case "toggledir":
_b77=_b75(_b72|ie|_b73|_b74);
break;
case "createlink":
case "unlink":
case "removeformat":
case "inserthorizontalrule":
case "insertimage":
case "insertorderedlist":
case "insertunorderedlist":
case "indent":
case "outdent":
case "formatblock":
case "inserthtml":
case "undo":
case "redo":
case "strikethrough":
case "tabindent":
_b77=_b75(_b72|ie|_b74|_b73);
break;
case "blockdirltr":
case "blockdirrtl":
case "dirltr":
case "dirrtl":
case "inlinedirltr":
case "inlinedirrtl":
_b77=_b75(ie);
break;
case "cut":
case "copy":
case "paste":
_b77=_b75(ie|_b72|_b73);
break;
case "inserttable":
_b77=_b75(_b72|ie);
break;
case "insertcell":
case "insertcol":
case "insertrow":
case "deletecells":
case "deletecols":
case "deleterows":
case "mergecells":
case "splitcell":
_b77=_b75(ie|_b72);
break;
default:
return false;
}
return (dojo.isIE&&_b77.ie)||(dojo.isMoz&&_b77.mozilla)||(dojo.isWebKit&&_b77.webkit)||(dojo.isOpera&&_b77.opera);
},execCommand:function(_b78,_b79){
var _b7a;
this.focus();
_b78=this._normalizeCommand(_b78,_b79);
if(_b79!==undefined){
if(_b78=="heading"){
throw new Error("unimplemented");
}else{
if((_b78=="formatblock")&&dojo.isIE){
_b79="<"+_b79+">";
}
}
}
var _b7b="_"+_b78+"Impl";
if(this[_b7b]){
_b7a=this[_b7b](_b79);
}else{
_b79=arguments.length>1?_b79:null;
if(_b79||_b78!="createlink"){
_b7a=this.document.execCommand(_b78,false,_b79);
}
}
this.onDisplayChanged();
return _b7a;
},queryCommandEnabled:function(_b7c){
if(this.disabled||!this._disabledOK){
return false;
}
_b7c=this._normalizeCommand(_b7c);
if(dojo.isMoz||dojo.isWebKit){
if(_b7c=="unlink"){
return this._sCall("hasAncestorElement",["a"]);
}else{
if(_b7c=="inserttable"){
return true;
}
}
}
if(dojo.isWebKit){
if(_b7c=="cut"||_b7c=="copy"){
var sel=this.window.getSelection();
if(sel){
sel=sel.toString();
}
return !!sel;
}else{
if(_b7c=="paste"){
return true;
}
}
}
var elem=dojo.isIE?this.document.selection.createRange():this.document;
try{
return elem.queryCommandEnabled(_b7c);
}
catch(e){
return false;
}
},queryCommandState:function(_b7d){
if(this.disabled||!this._disabledOK){
return false;
}
_b7d=this._normalizeCommand(_b7d);
try{
return this.document.queryCommandState(_b7d);
}
catch(e){
return false;
}
},queryCommandValue:function(_b7e){
if(this.disabled||!this._disabledOK){
return false;
}
var r;
_b7e=this._normalizeCommand(_b7e);
if(dojo.isIE&&_b7e=="formatblock"){
r=this._native2LocalFormatNames[this.document.queryCommandValue(_b7e)];
}else{
if(dojo.isMoz&&_b7e==="hilitecolor"){
var _b7f;
try{
_b7f=this.document.queryCommandValue("styleWithCSS");
}
catch(e){
_b7f=false;
}
this.document.execCommand("styleWithCSS",false,true);
r=this.document.queryCommandValue(_b7e);
this.document.execCommand("styleWithCSS",false,_b7f);
}else{
r=this.document.queryCommandValue(_b7e);
}
}
return r;
},_sCall:function(name,args){
return dojo.withGlobal(this.window,name,dijit._editor.selection,args);
},placeCursorAtStart:function(){
this.focus();
var _b80=false;
if(dojo.isMoz){
var _b81=this.editNode.firstChild;
while(_b81){
if(_b81.nodeType==3){
if(_b81.nodeValue.replace(/^\s+|\s+$/g,"").length>0){
_b80=true;
this._sCall("selectElement",[_b81]);
break;
}
}else{
if(_b81.nodeType==1){
_b80=true;
var tg=_b81.tagName?_b81.tagName.toLowerCase():"";
if(/br|input|img|base|meta|area|basefont|hr|link/.test(tg)){
this._sCall("selectElement",[_b81]);
}else{
this._sCall("selectElementChildren",[_b81]);
}
break;
}
}
_b81=_b81.nextSibling;
}
}else{
_b80=true;
this._sCall("selectElementChildren",[this.editNode]);
}
if(_b80){
this._sCall("collapse",[true]);
}
},placeCursorAtEnd:function(){
this.focus();
var _b82=false;
if(dojo.isMoz){
var last=this.editNode.lastChild;
while(last){
if(last.nodeType==3){
if(last.nodeValue.replace(/^\s+|\s+$/g,"").length>0){
_b82=true;
this._sCall("selectElement",[last]);
break;
}
}else{
if(last.nodeType==1){
_b82=true;
if(last.lastChild){
this._sCall("selectElement",[last.lastChild]);
}else{
this._sCall("selectElement",[last]);
}
break;
}
}
last=last.previousSibling;
}
}else{
_b82=true;
this._sCall("selectElementChildren",[this.editNode]);
}
if(_b82){
this._sCall("collapse",[false]);
}
},getValue:function(_b83){
if(this.textarea){
if(this.isClosed||!this.isLoaded){
return this.textarea.value;
}
}
return this._postFilterContent(null,_b83);
},_getValueAttr:function(){
return this.getValue(true);
},setValue:function(html){
if(!this.isLoaded){
this.onLoadDeferred.addCallback(dojo.hitch(this,function(){
this.setValue(html);
}));
return;
}
this._cursorToStart=true;
if(this.textarea&&(this.isClosed||!this.isLoaded)){
this.textarea.value=html;
}else{
html=this._preFilterContent(html);
var node=this.isClosed?this.domNode:this.editNode;
if(html&&dojo.isMoz&&html.toLowerCase()=="<p></p>"){
html="<p>&nbsp;</p>";
}
if(!html&&dojo.isWebKit){
html="&nbsp;";
}
node.innerHTML=html;
this._preDomFilterContent(node);
}
this.onDisplayChanged();
this._set("value",this.getValue(true));
},replaceValue:function(html){
if(this.isClosed){
this.setValue(html);
}else{
if(this.window&&this.window.getSelection&&!dojo.isMoz){
this.setValue(html);
}else{
if(this.window&&this.window.getSelection){
html=this._preFilterContent(html);
this.execCommand("selectall");
if(!html){
this._cursorToStart=true;
html="&nbsp;";
}
this.execCommand("inserthtml",html);
this._preDomFilterContent(this.editNode);
}else{
if(this.document&&this.document.selection){
this.setValue(html);
}
}
}
}
this._set("value",this.getValue(true));
},_preFilterContent:function(html){
var ec=html;
dojo.forEach(this.contentPreFilters,function(ef){
if(ef){
ec=ef(ec);
}
});
return ec;
},_preDomFilterContent:function(dom){
dom=dom||this.editNode;
dojo.forEach(this.contentDomPreFilters,function(ef){
if(ef&&dojo.isFunction(ef)){
ef(dom);
}
},this);
},_postFilterContent:function(dom,_b84){
var ec;
if(!dojo.isString(dom)){
dom=dom||this.editNode;
if(this.contentDomPostFilters.length){
if(_b84){
dom=dojo.clone(dom);
}
dojo.forEach(this.contentDomPostFilters,function(ef){
dom=ef(dom);
});
}
ec=dijit._editor.getChildrenHtml(dom);
}else{
ec=dom;
}
if(!dojo.trim(ec.replace(/^\xA0\xA0*/,"").replace(/\xA0\xA0*$/,"")).length){
ec="";
}
dojo.forEach(this.contentPostFilters,function(ef){
ec=ef(ec);
});
return ec;
},_saveContent:function(e){
var _b85=dojo.byId(dijit._scopeName+"._editor.RichText.value");
if(_b85.value){
_b85.value+=this._SEPARATOR;
}
_b85.value+=this.name+this._NAME_CONTENT_SEP+this.getValue(true);
},escapeXml:function(str,_b86){
str=str.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;");
if(!_b86){
str=str.replace(/'/gm,"&#39;");
}
return str;
},getNodeHtml:function(node){
dojo.deprecated("dijit.Editor::getNodeHtml is deprecated","use dijit._editor.getNodeHtml instead",2);
return dijit._editor.getNodeHtml(node);
},getNodeChildrenHtml:function(dom){
dojo.deprecated("dijit.Editor::getNodeChildrenHtml is deprecated","use dijit._editor.getChildrenHtml instead",2);
return dijit._editor.getChildrenHtml(dom);
},close:function(save){
if(this.isClosed){
return;
}
if(!arguments.length){
save=true;
}
if(save){
this._set("value",this.getValue(true));
}
if(this.interval){
clearInterval(this.interval);
}
if(this._webkitListener){
this.disconnect(this._webkitListener);
delete this._webkitListener;
}
if(dojo.isIE){
this.iframe.onfocus=null;
}
this.iframe._loadFunc=null;
if(this._iframeRegHandle){
dijit.unregisterIframe(this._iframeRegHandle);
delete this._iframeRegHandle;
}
if(this.textarea){
var s=this.textarea.style;
s.position="";
s.left=s.top="";
if(dojo.isIE){
s.overflow=this.__overflow;
this.__overflow=null;
}
this.textarea.value=this.value;
dojo.destroy(this.domNode);
this.domNode=this.textarea;
}else{
this.domNode.innerHTML=this.value;
}
delete this.iframe;
dojo.removeClass(this.domNode,this.baseClass);
this.isClosed=true;
this.isLoaded=false;
delete this.editNode;
delete this.focusNode;
if(this.window&&this.window._frameElement){
this.window._frameElement=null;
}
this.window=null;
this.document=null;
this.editingArea=null;
this.editorObject=null;
},destroy:function(){
if(!this.isClosed){
this.close(false);
}
this.inherited(arguments);
if(dijit._editor._globalSaveHandler){
delete dijit._editor._globalSaveHandler[this.id];
}
},_removeMozBogus:function(html){
return html.replace(/\stype="_moz"/gi,"").replace(/\s_moz_dirty=""/gi,"").replace(/_moz_resizing="(true|false)"/gi,"");
},_removeWebkitBogus:function(html){
html=html.replace(/\sclass="webkit-block-placeholder"/gi,"");
html=html.replace(/\sclass="apple-style-span"/gi,"");
html=html.replace(/<meta charset=\"utf-8\" \/>/gi,"");
return html;
},_normalizeFontStyle:function(html){
return html.replace(/<(\/)?strong([ \>])/gi,"<$1b$2").replace(/<(\/)?em([ \>])/gi,"<$1i$2");
},_preFixUrlAttributes:function(html){
return html.replace(/(?:(<a(?=\s).*?\shref=)("|')(.*?)\2)|(?:(<a\s.*?href=)([^"'][^ >]+))/gi,"$1$4$2$3$5$2 _djrealurl=$2$3$5$2").replace(/(?:(<img(?=\s).*?\ssrc=)("|')(.*?)\2)|(?:(<img\s.*?src=)([^"'][^ >]+))/gi,"$1$4$2$3$5$2 _djrealurl=$2$3$5$2");
},_inserthorizontalruleImpl:function(_b87){
if(dojo.isIE){
return this._inserthtmlImpl("<hr>");
}
return this.document.execCommand("inserthorizontalrule",false,_b87);
},_unlinkImpl:function(_b88){
if((this.queryCommandEnabled("unlink"))&&(dojo.isMoz||dojo.isWebKit)){
var a=this._sCall("getAncestorElement",["a"]);
this._sCall("selectElement",[a]);
return this.document.execCommand("unlink",false,null);
}
return this.document.execCommand("unlink",false,_b88);
},_hilitecolorImpl:function(_b89){
var _b8a;
if(dojo.isMoz){
this.document.execCommand("styleWithCSS",false,true);
_b8a=this.document.execCommand("hilitecolor",false,_b89);
this.document.execCommand("styleWithCSS",false,false);
}else{
_b8a=this.document.execCommand("hilitecolor",false,_b89);
}
return _b8a;
},_backcolorImpl:function(_b8b){
if(dojo.isIE){
_b8b=_b8b?_b8b:null;
}
return this.document.execCommand("backcolor",false,_b8b);
},_forecolorImpl:function(_b8c){
if(dojo.isIE){
_b8c=_b8c?_b8c:null;
}
return this.document.execCommand("forecolor",false,_b8c);
},_inserthtmlImpl:function(_b8d){
_b8d=this._preFilterContent(_b8d);
var rv=true;
if(dojo.isIE){
var _b8e=this.document.selection.createRange();
if(this.document.selection.type.toUpperCase()=="CONTROL"){
var n=_b8e.item(0);
while(_b8e.length){
_b8e.remove(_b8e.item(0));
}
n.outerHTML=_b8d;
}else{
_b8e.pasteHTML(_b8d);
}
_b8e.select();
}else{
if(dojo.isMoz&&!_b8d.length){
this._sCall("remove");
}else{
rv=this.document.execCommand("inserthtml",false,_b8d);
}
}
return rv;
},_boldImpl:function(_b8f){
if(dojo.isIE){
this._adaptIESelection();
}
return this.document.execCommand("bold",false,_b8f);
},_italicImpl:function(_b90){
if(dojo.isIE){
this._adaptIESelection();
}
return this.document.execCommand("italic",false,_b90);
},_underlineImpl:function(_b91){
if(dojo.isIE){
this._adaptIESelection();
}
return this.document.execCommand("underline",false,_b91);
},_strikethroughImpl:function(_b92){
if(dojo.isIE){
this._adaptIESelection();
}
return this.document.execCommand("strikethrough",false,_b92);
},getHeaderHeight:function(){
return this._getNodeChildrenHeight(this.header);
},getFooterHeight:function(){
return this._getNodeChildrenHeight(this.footer);
},_getNodeChildrenHeight:function(node){
var h=0;
if(node&&node.childNodes){
var i;
for(i=0;i<node.childNodes.length;i++){
var size=dojo.position(node.childNodes[i]);
h+=size.h;
}
}
return h;
},_isNodeEmpty:function(node,_b93){
if(node.nodeType==1){
if(node.childNodes.length>0){
return this._isNodeEmpty(node.childNodes[0],_b93);
}
return true;
}else{
if(node.nodeType==3){
return (node.nodeValue.substring(_b93)=="");
}
}
return false;
},_removeStartingRangeFromRange:function(node,_b94){
if(node.nextSibling){
_b94.setStart(node.nextSibling,0);
}else{
var _b95=node.parentNode;
while(_b95&&_b95.nextSibling==null){
_b95=_b95.parentNode;
}
if(_b95){
_b94.setStart(_b95.nextSibling,0);
}
}
return _b94;
},_adaptIESelection:function(){
var _b96=dijit.range.getSelection(this.window);
if(_b96&&_b96.rangeCount){
var _b97=_b96.getRangeAt(0);
var _b98=_b97.startContainer;
var _b99=_b97.startOffset;
while(_b98.nodeType==3&&_b99>=_b98.length&&_b98.nextSibling){
_b99=_b99-_b98.length;
_b98=_b98.nextSibling;
}
var _b9a=null;
while(this._isNodeEmpty(_b98,_b99)&&_b98!=_b9a){
_b9a=_b98;
_b97=this._removeStartingRangeFromRange(_b98,_b97);
_b98=_b97.startContainer;
_b99=0;
}
_b96.removeAllRanges();
_b96.addRange(_b97);
}
}});
}
if(!dojo._hasResource["dijit.ToolbarSeparator"]){
dojo._hasResource["dijit.ToolbarSeparator"]=true;
dojo.provide("dijit.ToolbarSeparator");
dojo.declare("dijit.ToolbarSeparator",[dijit._Widget,dijit._Templated],{templateString:"<div class=\"dijitToolbarSeparator dijitInline\" role=\"presentation\"></div>",buildRendering:function(){
this.inherited(arguments);
dojo.setSelectable(this.domNode,false);
},isFocusable:function(){
return false;
}});
}
if(!dojo._hasResource["dijit.Toolbar"]){
dojo._hasResource["dijit.Toolbar"]=true;
dojo.provide("dijit.Toolbar");
dojo.declare("dijit.Toolbar",[dijit._Widget,dijit._Templated,dijit._KeyNavContainer],{templateString:"<div class=\"dijit\" role=\"toolbar\" tabIndex=\"${tabIndex}\" dojoAttachPoint=\"containerNode\">"+"</div>",baseClass:"dijitToolbar",postCreate:function(){
this.inherited(arguments);
this.connectKeyNavHandlers(this.isLeftToRight()?[dojo.keys.LEFT_ARROW]:[dojo.keys.RIGHT_ARROW],this.isLeftToRight()?[dojo.keys.RIGHT_ARROW]:[dojo.keys.LEFT_ARROW]);
},startup:function(){
if(this._started){
return;
}
this.startupKeyNavChildren();
this.inherited(arguments);
}});
}
if(!dojo._hasResource["dijit._editor._Plugin"]){
dojo._hasResource["dijit._editor._Plugin"]=true;
dojo.provide("dijit._editor._Plugin");
dojo.declare("dijit._editor._Plugin",null,{constructor:function(args,node){
this.params=args||{};
dojo.mixin(this,this.params);
this._connects=[];
this._attrPairNames={};
},editor:null,iconClassPrefix:"dijitEditorIcon",button:null,command:"",useDefaultCommand:true,buttonClass:dijit.form.Button,disabled:false,getLabel:function(key){
return this.editor.commands[key];
},_initButton:function(){
if(this.command.length){
var _b9b=this.getLabel(this.command),_b9c=this.editor,_b9d=this.iconClassPrefix+" "+this.iconClassPrefix+this.command.charAt(0).toUpperCase()+this.command.substr(1);
if(!this.button){
var _b9e=dojo.mixin({label:_b9b,dir:_b9c.dir,lang:_b9c.lang,showLabel:false,iconClass:_b9d,dropDown:this.dropDown,tabIndex:"-1"},this.params||{});
this.button=new this.buttonClass(_b9e);
}
}
if(this.get("disabled")&&this.button){
this.button.set("disabled",this.get("disabled"));
}
},destroy:function(){
dojo.forEach(this._connects,dojo.disconnect);
if(this.dropDown){
this.dropDown.destroyRecursive();
}
},connect:function(o,f,tf){
this._connects.push(dojo.connect(o,f,this,tf));
},updateState:function(){
var e=this.editor,c=this.command,_b9f,_ba0;
if(!e||!e.isLoaded||!c.length){
return;
}
var _ba1=this.get("disabled");
if(this.button){
try{
_ba0=!_ba1&&e.queryCommandEnabled(c);
if(this.enabled!==_ba0){
this.enabled=_ba0;
this.button.set("disabled",!_ba0);
}
if(typeof this.button.checked=="boolean"){
_b9f=e.queryCommandState(c);
if(this.checked!==_b9f){
this.checked=_b9f;
this.button.set("checked",e.queryCommandState(c));
}
}
}
catch(e){
console.log(e);
}
}
},setEditor:function(_ba2){
this.editor=_ba2;
this._initButton();
if(this.button&&this.useDefaultCommand){
if(this.editor.queryCommandAvailable(this.command)){
this.connect(this.button,"onClick",dojo.hitch(this.editor,"execCommand",this.command,this.commandArg));
}else{
this.button.domNode.style.display="none";
}
}
this.connect(this.editor,"onNormalizedDisplayChanged","updateState");
},setToolbar:function(_ba3){
if(this.button){
_ba3.addChild(this.button);
}
},set:function(name,_ba4){
if(typeof name==="object"){
for(var x in name){
this.set(x,name[x]);
}
return this;
}
var _ba5=this._getAttrNames(name);
if(this[_ba5.s]){
var _ba6=this[_ba5.s].apply(this,Array.prototype.slice.call(arguments,1));
}else{
this._set(name,_ba4);
}
return _ba6||this;
},get:function(name){
var _ba7=this._getAttrNames(name);
return this[_ba7.g]?this[_ba7.g]():this[name];
},_setDisabledAttr:function(_ba8){
this.disabled=_ba8;
this.updateState();
},_getAttrNames:function(name){
var apn=this._attrPairNames;
if(apn[name]){
return apn[name];
}
var uc=name.charAt(0).toUpperCase()+name.substr(1);
return (apn[name]={s:"_set"+uc+"Attr",g:"_get"+uc+"Attr"});
},_set:function(name,_ba9){
var _baa=this[name];
this[name]=_ba9;
}});
}
if(!dojo._hasResource["dijit._editor.plugins.EnterKeyHandling"]){
dojo._hasResource["dijit._editor.plugins.EnterKeyHandling"]=true;
dojo.provide("dijit._editor.plugins.EnterKeyHandling");
dojo.declare("dijit._editor.plugins.EnterKeyHandling",dijit._editor._Plugin,{blockNodeForEnter:"BR",constructor:function(args){
if(args){
if("blockNodeForEnter" in args){
args.blockNodeForEnter=args.blockNodeForEnter.toUpperCase();
}
dojo.mixin(this,args);
}
},setEditor:function(_bab){
if(this.editor===_bab){
return;
}
this.editor=_bab;
if(this.blockNodeForEnter=="BR"){
this.editor.customUndo=true;
_bab.onLoadDeferred.addCallback(dojo.hitch(this,function(d){
this.connect(_bab.document,"onkeypress",function(e){
if(e.charOrCode==dojo.keys.ENTER){
var ne=dojo.mixin({},e);
ne.shiftKey=true;
if(!this.handleEnterKey(ne)){
dojo.stopEvent(e);
}
}
});
return d;
}));
}else{
if(this.blockNodeForEnter){
var h=dojo.hitch(this,this.handleEnterKey);
_bab.addKeyHandler(13,0,0,h);
_bab.addKeyHandler(13,0,1,h);
this.connect(this.editor,"onKeyPressed","onKeyPressed");
}
}
},onKeyPressed:function(e){
if(this._checkListLater){
if(dojo.withGlobal(this.editor.window,"isCollapsed",dijit)){
var _bac=dojo.withGlobal(this.editor.window,"getAncestorElement",dijit._editor.selection,["LI"]);
if(!_bac){
dijit._editor.RichText.prototype.execCommand.call(this.editor,"formatblock",this.blockNodeForEnter);
var _bad=dojo.withGlobal(this.editor.window,"getAncestorElement",dijit._editor.selection,[this.blockNodeForEnter]);
if(_bad){
_bad.innerHTML=this.bogusHtmlContent;
if(dojo.isIE){
var r=this.editor.document.selection.createRange();
r.move("character",-1);
r.select();
}
}else{
console.error("onKeyPressed: Cannot find the new block node");
}
}else{
if(dojo.isMoz){
if(_bac.parentNode.parentNode.nodeName=="LI"){
_bac=_bac.parentNode.parentNode;
}
}
var fc=_bac.firstChild;
if(fc&&fc.nodeType==1&&(fc.nodeName=="UL"||fc.nodeName=="OL")){
_bac.insertBefore(fc.ownerDocument.createTextNode(" "),fc);
var _bae=dijit.range.create(this.editor.window);
_bae.setStart(_bac.firstChild,0);
var _baf=dijit.range.getSelection(this.editor.window,true);
_baf.removeAllRanges();
_baf.addRange(_bae);
}
}
}
this._checkListLater=false;
}
if(this._pressedEnterInBlock){
if(this._pressedEnterInBlock.previousSibling){
this.removeTrailingBr(this._pressedEnterInBlock.previousSibling);
}
delete this._pressedEnterInBlock;
}
},bogusHtmlContent:"&nbsp;",blockNodes:/^(?:P|H1|H2|H3|H4|H5|H6|LI)$/,handleEnterKey:function(e){
var _bb0,_bb1,_bb2,doc=this.editor.document,br,rs,txt;
if(e.shiftKey){
var _bb3=dojo.withGlobal(this.editor.window,"getParentElement",dijit._editor.selection);
var _bb4=dijit.range.getAncestor(_bb3,this.blockNodes);
if(_bb4){
if(_bb4.tagName=="LI"){
return true;
}
_bb0=dijit.range.getSelection(this.editor.window);
_bb1=_bb0.getRangeAt(0);
if(!_bb1.collapsed){
_bb1.deleteContents();
_bb0=dijit.range.getSelection(this.editor.window);
_bb1=_bb0.getRangeAt(0);
}
if(dijit.range.atBeginningOfContainer(_bb4,_bb1.startContainer,_bb1.startOffset)){
br=doc.createElement("br");
_bb2=dijit.range.create(this.editor.window);
_bb4.insertBefore(br,_bb4.firstChild);
_bb2.setStartBefore(br.nextSibling);
_bb0.removeAllRanges();
_bb0.addRange(_bb2);
}else{
if(dijit.range.atEndOfContainer(_bb4,_bb1.startContainer,_bb1.startOffset)){
_bb2=dijit.range.create(this.editor.window);
br=doc.createElement("br");
_bb4.appendChild(br);
_bb4.appendChild(doc.createTextNode(" "));
_bb2.setStart(_bb4.lastChild,0);
_bb0.removeAllRanges();
_bb0.addRange(_bb2);
}else{
rs=_bb1.startContainer;
if(rs&&rs.nodeType==3){
txt=rs.nodeValue;
dojo.withGlobal(this.editor.window,function(){
var _bb5=doc.createTextNode(txt.substring(0,_bb1.startOffset));
var _bb6=doc.createTextNode(txt.substring(_bb1.startOffset));
var _bb7=doc.createElement("br");
if(_bb6.nodeValue==""&&dojo.isWebKit){
_bb6=doc.createTextNode(" ");
}
dojo.place(_bb5,rs,"after");
dojo.place(_bb7,_bb5,"after");
dojo.place(_bb6,_bb7,"after");
dojo.destroy(rs);
_bb2=dijit.range.create(dojo.gobal);
_bb2.setStart(_bb6,0);
_bb0.removeAllRanges();
_bb0.addRange(_bb2);
});
return false;
}
return true;
}
}
}else{
_bb0=dijit.range.getSelection(this.editor.window);
if(_bb0.rangeCount){
_bb1=_bb0.getRangeAt(0);
if(_bb1&&_bb1.startContainer){
if(!_bb1.collapsed){
_bb1.deleteContents();
_bb0=dijit.range.getSelection(this.editor.window);
_bb1=_bb0.getRangeAt(0);
}
rs=_bb1.startContainer;
var _bb8,_bb9,_bba;
if(rs&&rs.nodeType==3){
dojo.withGlobal(this.editor.window,dojo.hitch(this,function(){
var _bbb=false;
var _bbc=_bb1.startOffset;
if(rs.length<_bbc){
ret=this._adjustNodeAndOffset(rs,_bbc);
rs=ret.node;
_bbc=ret.offset;
}
txt=rs.nodeValue;
_bb8=doc.createTextNode(txt.substring(0,_bbc));
_bb9=doc.createTextNode(txt.substring(_bbc));
_bba=doc.createElement("br");
if(!_bb9.length){
_bb9=doc.createTextNode(" ");
_bbb=true;
}
if(_bb8.length){
dojo.place(_bb8,rs,"after");
}else{
_bb8=rs;
}
dojo.place(_bba,_bb8,"after");
dojo.place(_bb9,_bba,"after");
dojo.destroy(rs);
_bb2=dijit.range.create(dojo.gobal);
_bb2.setStart(_bb9,0);
_bb2.setEnd(_bb9,_bb9.length);
_bb0.removeAllRanges();
_bb0.addRange(_bb2);
if(_bbb&&!dojo.isWebKit){
dijit._editor.selection.remove();
}else{
dijit._editor.selection.collapse(true);
}
}));
}else{
dojo.withGlobal(this.editor.window,dojo.hitch(this,function(){
var _bbd=doc.createElement("br");
rs.appendChild(_bbd);
var _bbe=doc.createTextNode(" ");
rs.appendChild(_bbe);
_bb2=dijit.range.create(dojo.global);
_bb2.setStart(_bbe,0);
_bb2.setEnd(_bbe,_bbe.length);
_bb0.removeAllRanges();
_bb0.addRange(_bb2);
dijit._editor.selection.collapse(true);
}));
}
}
}else{
dijit._editor.RichText.prototype.execCommand.call(this.editor,"inserthtml","<br>");
}
}
return false;
}
var _bbf=true;
_bb0=dijit.range.getSelection(this.editor.window);
_bb1=_bb0.getRangeAt(0);
if(!_bb1.collapsed){
_bb1.deleteContents();
_bb0=dijit.range.getSelection(this.editor.window);
_bb1=_bb0.getRangeAt(0);
}
var _bc0=dijit.range.getBlockAncestor(_bb1.endContainer,null,this.editor.editNode);
var _bc1=_bc0.blockNode;
if((this._checkListLater=(_bc1&&(_bc1.nodeName=="LI"||_bc1.parentNode.nodeName=="LI")))){
if(dojo.isMoz){
this._pressedEnterInBlock=_bc1;
}
if(/^(\s|&nbsp;|\xA0|<span\b[^>]*\bclass=['"]Apple-style-span['"][^>]*>(\s|&nbsp;|\xA0)<\/span>)?(<br>)?$/.test(_bc1.innerHTML)){
_bc1.innerHTML="";
if(dojo.isWebKit){
_bb2=dijit.range.create(this.editor.window);
_bb2.setStart(_bc1,0);
_bb0.removeAllRanges();
_bb0.addRange(_bb2);
}
this._checkListLater=false;
}
return true;
}
if(!_bc0.blockNode||_bc0.blockNode===this.editor.editNode){
try{
dijit._editor.RichText.prototype.execCommand.call(this.editor,"formatblock",this.blockNodeForEnter);
}
catch(e2){
}
_bc0={blockNode:dojo.withGlobal(this.editor.window,"getAncestorElement",dijit._editor.selection,[this.blockNodeForEnter]),blockContainer:this.editor.editNode};
if(_bc0.blockNode){
if(_bc0.blockNode!=this.editor.editNode&&(!(_bc0.blockNode.textContent||_bc0.blockNode.innerHTML).replace(/^\s+|\s+$/g,"").length)){
this.removeTrailingBr(_bc0.blockNode);
return false;
}
}else{
_bc0.blockNode=this.editor.editNode;
}
_bb0=dijit.range.getSelection(this.editor.window);
_bb1=_bb0.getRangeAt(0);
}
var _bc2=doc.createElement(this.blockNodeForEnter);
_bc2.innerHTML=this.bogusHtmlContent;
this.removeTrailingBr(_bc0.blockNode);
var _bc3=_bb1.endOffset;
var node=_bb1.endContainer;
if(node.length<_bc3){
var ret=this._adjustNodeAndOffset(node,_bc3);
node=ret.node;
_bc3=ret.offset;
}
if(dijit.range.atEndOfContainer(_bc0.blockNode,node,_bc3)){
if(_bc0.blockNode===_bc0.blockContainer){
_bc0.blockNode.appendChild(_bc2);
}else{
dojo.place(_bc2,_bc0.blockNode,"after");
}
_bbf=false;
_bb2=dijit.range.create(this.editor.window);
_bb2.setStart(_bc2,0);
_bb0.removeAllRanges();
_bb0.addRange(_bb2);
if(this.editor.height){
dojo.window.scrollIntoView(_bc2);
}
}else{
if(dijit.range.atBeginningOfContainer(_bc0.blockNode,_bb1.startContainer,_bb1.startOffset)){
dojo.place(_bc2,_bc0.blockNode,_bc0.blockNode===_bc0.blockContainer?"first":"before");
if(_bc2.nextSibling&&this.editor.height){
_bb2=dijit.range.create(this.editor.window);
_bb2.setStart(_bc2.nextSibling,0);
_bb0.removeAllRanges();
_bb0.addRange(_bb2);
dojo.window.scrollIntoView(_bc2.nextSibling);
}
_bbf=false;
}else{
if(_bc0.blockNode===_bc0.blockContainer){
_bc0.blockNode.appendChild(_bc2);
}else{
dojo.place(_bc2,_bc0.blockNode,"after");
}
_bbf=false;
if(_bc0.blockNode.style){
if(_bc2.style){
if(_bc0.blockNode.style.cssText){
_bc2.style.cssText=_bc0.blockNode.style.cssText;
}
}
}
rs=_bb1.startContainer;
if(rs&&rs.nodeType==3){
var _bc4,_bc5;
_bc3=_bb1.endOffset;
if(rs.length<_bc3){
ret=this._adjustNodeAndOffset(rs,_bc3);
rs=ret.node;
_bc3=ret.offset;
}
txt=rs.nodeValue;
var _bb8=doc.createTextNode(txt.substring(0,_bc3));
var _bb9=doc.createTextNode(txt.substring(_bc3,txt.length));
dojo.place(_bb8,rs,"before");
dojo.place(_bb9,rs,"after");
dojo.destroy(rs);
var _bc6=_bb8.parentNode;
while(_bc6!==_bc0.blockNode){
var tg=_bc6.tagName;
var _bc7=doc.createElement(tg);
if(_bc6.style){
if(_bc7.style){
if(_bc6.style.cssText){
_bc7.style.cssText=_bc6.style.cssText;
}
}
}
_bc4=_bb9;
while(_bc4){
_bc5=_bc4.nextSibling;
_bc7.appendChild(_bc4);
_bc4=_bc5;
}
dojo.place(_bc7,_bc6,"after");
_bb8=_bc6;
_bb9=_bc7;
_bc6=_bc6.parentNode;
}
_bc4=_bb9;
if(_bc4.nodeType==1||(_bc4.nodeType==3&&_bc4.nodeValue)){
_bc2.innerHTML="";
}
while(_bc4){
_bc5=_bc4.nextSibling;
_bc2.appendChild(_bc4);
_bc4=_bc5;
}
}
_bb2=dijit.range.create(this.editor.window);
_bb2.setStart(_bc2,0);
_bb0.removeAllRanges();
_bb0.addRange(_bb2);
if(this.editor.height){
dijit.scrollIntoView(_bc2);
}
if(dojo.isMoz){
this._pressedEnterInBlock=_bc0.blockNode;
}
}
}
return _bbf;
},_adjustNodeAndOffset:function(node,_bc8){
while(node.length<_bc8&&node.nextSibling&&node.nextSibling.nodeType==3){
_bc8=_bc8-node.length;
node=node.nextSibling;
}
var ret={"node":node,"offset":_bc8};
return ret;
},removeTrailingBr:function(_bc9){
var para=/P|DIV|LI/i.test(_bc9.tagName)?_bc9:dijit._editor.selection.getParentOfType(_bc9,["P","DIV","LI"]);
if(!para){
return;
}
if(para.lastChild){
if((para.childNodes.length>1&&para.lastChild.nodeType==3&&/^[\s\xAD]*$/.test(para.lastChild.nodeValue))||para.lastChild.tagName=="BR"){
dojo.destroy(para.lastChild);
}
}
if(!para.childNodes.length){
para.innerHTML=this.bogusHtmlContent;
}
}});
}
if(!dojo._hasResource["dijit.Editor"]){
dojo._hasResource["dijit.Editor"]=true;
dojo.provide("dijit.Editor");
dojo.declare("dijit.Editor",dijit._editor.RichText,{plugins:null,extraPlugins:null,constructor:function(){
if(!dojo.isArray(this.plugins)){
this.plugins=["undo","redo","|","cut","copy","paste","|","bold","italic","underline","strikethrough","|","insertOrderedList","insertUnorderedList","indent","outdent","|","justifyLeft","justifyRight","justifyCenter","justifyFull","dijit._editor.plugins.EnterKeyHandling"];
}
this._plugins=[];
this._editInterval=this.editActionInterval*1000;
if(dojo.isIE){
this.events.push("onBeforeDeactivate");
this.events.push("onBeforeActivate");
}
},postMixInProperties:function(){
this.setValueDeferred=new dojo.Deferred();
this.inherited(arguments);
},postCreate:function(){
this._steps=this._steps.slice(0);
this._undoedSteps=this._undoedSteps.slice(0);
if(dojo.isArray(this.extraPlugins)){
this.plugins=this.plugins.concat(this.extraPlugins);
}
this.inherited(arguments);
this.commands=dojo.i18n.getLocalization("dijit._editor","commands",this.lang);
if(!this.toolbar){
this.toolbar=new dijit.Toolbar({dir:this.dir,lang:this.lang});
this.header.appendChild(this.toolbar.domNode);
}
dojo.forEach(this.plugins,this.addPlugin,this);
this.setValueDeferred.callback(true);
dojo.addClass(this.iframe.parentNode,"dijitEditorIFrameContainer");
dojo.addClass(this.iframe,"dijitEditorIFrame");
dojo.attr(this.iframe,"allowTransparency",true);
if(dojo.isWebKit){
dojo.style(this.domNode,"KhtmlUserSelect","none");
}
this.toolbar.startup();
this.onNormalizedDisplayChanged();
},destroy:function(){
dojo.forEach(this._plugins,function(p){
if(p&&p.destroy){
p.destroy();
}
});
this._plugins=[];
this.toolbar.destroyRecursive();
delete this.toolbar;
this.inherited(arguments);
},addPlugin:function(_bca,_bcb){
var args=dojo.isString(_bca)?{name:_bca}:_bca;
if(!args.setEditor){
var o={"args":args,"plugin":null,"editor":this};
dojo.publish(dijit._scopeName+".Editor.getPlugin",[o]);
if(!o.plugin){
var pc=dojo.getObject(args.name);
if(pc){
o.plugin=new pc(args);
}
}
if(!o.plugin){
console.warn("Cannot find plugin",_bca);
return;
}
_bca=o.plugin;
}
if(arguments.length>1){
this._plugins[_bcb]=_bca;
}else{
this._plugins.push(_bca);
}
_bca.setEditor(this);
if(dojo.isFunction(_bca.setToolbar)){
_bca.setToolbar(this.toolbar);
}
},startup:function(){
},resize:function(size){
if(size){
dijit.layout._LayoutWidget.prototype.resize.apply(this,arguments);
}
},layout:function(){
var _bcc=(this._contentBox.h-(this.getHeaderHeight()+this.getFooterHeight()+dojo._getPadBorderExtents(this.iframe.parentNode).h+dojo._getMarginExtents(this.iframe.parentNode).h));
this.editingArea.style.height=_bcc+"px";
if(this.iframe){
this.iframe.style.height="100%";
}
this._layoutMode=true;
},_onIEMouseDown:function(e){
var _bcd;
var b=this.document.body;
var _bce=b.clientWidth;
var _bcf=b.clientHeight;
var _bd0=b.clientLeft;
var _bd1=b.offsetWidth;
var _bd2=b.offsetHeight;
var _bd3=b.offsetLeft;
bodyDir=b.dir?b.dir.toLowerCase():"";
if(bodyDir!="rtl"){
if(_bce<_bd1&&e.x>_bce&&e.x<_bd1){
_bcd=true;
}
}else{
if(e.x<_bd0&&e.x>_bd3){
_bcd=true;
}
}
if(!_bcd){
if(_bcf<_bd2&&e.y>_bcf&&e.y<_bd2){
_bcd=true;
}
}
if(!_bcd){
delete this._cursorToStart;
delete this._savedSelection;
if(e.target.tagName=="BODY"){
setTimeout(dojo.hitch(this,"placeCursorAtEnd"),0);
}
this.inherited(arguments);
}
},onBeforeActivate:function(e){
this._restoreSelection();
},onBeforeDeactivate:function(e){
if(this.customUndo){
this.endEditing(true);
}
if(e.target.tagName!="BODY"){
this._saveSelection();
}
},customUndo:true,editActionInterval:3,beginEditing:function(cmd){
if(!this._inEditing){
this._inEditing=true;
this._beginEditing(cmd);
}
if(this.editActionInterval>0){
if(this._editTimer){
clearTimeout(this._editTimer);
}
this._editTimer=setTimeout(dojo.hitch(this,this.endEditing),this._editInterval);
}
},_steps:[],_undoedSteps:[],execCommand:function(cmd){
if(this.customUndo&&(cmd=="undo"||cmd=="redo")){
return this[cmd]();
}else{
if(this.customUndo){
this.endEditing();
this._beginEditing();
}
var r;
var _bd4=/copy|cut|paste/.test(cmd);
try{
r=this.inherited(arguments);
if(dojo.isWebKit&&_bd4&&!r){
throw {code:1011};
}
}
catch(e){
if(e.code==1011&&_bd4){
var sub=dojo.string.substitute,_bd5={cut:"X",copy:"C",paste:"V"};
alert(sub(this.commands.systemShortcut,[this.commands[cmd],sub(this.commands[dojo.isMac?"appleKey":"ctrlKey"],[_bd5[cmd]])]));
}
r=false;
}
if(this.customUndo){
this._endEditing();
}
return r;
}
},queryCommandEnabled:function(cmd){
if(this.customUndo&&(cmd=="undo"||cmd=="redo")){
return cmd=="undo"?(this._steps.length>1):(this._undoedSteps.length>0);
}else{
return this.inherited(arguments);
}
},_moveToBookmark:function(b){
var _bd6=b.mark;
var mark=b.mark;
var col=b.isCollapsed;
var r,_bd7,_bd8,sel;
if(mark){
if(dojo.isIE){
if(dojo.isArray(mark)){
_bd6=[];
dojo.forEach(mark,function(n){
_bd6.push(dijit.range.getNode(n,this.editNode));
},this);
dojo.withGlobal(this.window,"moveToBookmark",dijit,[{mark:_bd6,isCollapsed:col}]);
}else{
if(mark.startContainer&&mark.endContainer){
sel=dijit.range.getSelection(this.window);
if(sel&&sel.removeAllRanges){
sel.removeAllRanges();
r=dijit.range.create(this.window);
_bd7=dijit.range.getNode(mark.startContainer,this.editNode);
_bd8=dijit.range.getNode(mark.endContainer,this.editNode);
if(_bd7&&_bd8){
r.setStart(_bd7,mark.startOffset);
r.setEnd(_bd8,mark.endOffset);
sel.addRange(r);
}
}
}
}
}else{
sel=dijit.range.getSelection(this.window);
if(sel&&sel.removeAllRanges){
sel.removeAllRanges();
r=dijit.range.create(this.window);
_bd7=dijit.range.getNode(mark.startContainer,this.editNode);
_bd8=dijit.range.getNode(mark.endContainer,this.editNode);
if(_bd7&&_bd8){
r.setStart(_bd7,mark.startOffset);
r.setEnd(_bd8,mark.endOffset);
sel.addRange(r);
}
}
}
}
},_changeToStep:function(from,to){
this.setValue(to.text);
var b=to.bookmark;
if(!b){
return;
}
this._moveToBookmark(b);
},undo:function(){
var ret=false;
if(!this._undoRedoActive){
this._undoRedoActive=true;
this.endEditing(true);
var s=this._steps.pop();
if(s&&this._steps.length>0){
this.focus();
this._changeToStep(s,this._steps[this._steps.length-1]);
this._undoedSteps.push(s);
this.onDisplayChanged();
delete this._undoRedoActive;
ret=true;
}
delete this._undoRedoActive;
}
return ret;
},redo:function(){
var ret=false;
if(!this._undoRedoActive){
this._undoRedoActive=true;
this.endEditing(true);
var s=this._undoedSteps.pop();
if(s&&this._steps.length>0){
this.focus();
this._changeToStep(this._steps[this._steps.length-1],s);
this._steps.push(s);
this.onDisplayChanged();
ret=true;
}
delete this._undoRedoActive;
}
return ret;
},endEditing:function(_bd9){
if(this._editTimer){
clearTimeout(this._editTimer);
}
if(this._inEditing){
this._endEditing(_bd9);
this._inEditing=false;
}
},_getBookmark:function(){
var b=dojo.withGlobal(this.window,dijit.getBookmark);
var tmp=[];
if(b&&b.mark){
var mark=b.mark;
if(dojo.isIE){
var sel=dijit.range.getSelection(this.window);
if(!dojo.isArray(mark)){
if(sel){
var _bda;
if(sel.rangeCount){
_bda=sel.getRangeAt(0);
}
if(_bda){
b.mark=_bda.cloneRange();
}else{
b.mark=dojo.withGlobal(this.window,dijit.getBookmark);
}
}
}else{
dojo.forEach(b.mark,function(n){
tmp.push(dijit.range.getIndex(n,this.editNode).o);
},this);
b.mark=tmp;
}
}
try{
if(b.mark&&b.mark.startContainer){
tmp=dijit.range.getIndex(b.mark.startContainer,this.editNode).o;
b.mark={startContainer:tmp,startOffset:b.mark.startOffset,endContainer:b.mark.endContainer===b.mark.startContainer?tmp:dijit.range.getIndex(b.mark.endContainer,this.editNode).o,endOffset:b.mark.endOffset};
}
}
catch(e){
b.mark=null;
}
}
return b;
},_beginEditing:function(cmd){
if(this._steps.length===0){
this._steps.push({"text":dijit._editor.getChildrenHtml(this.editNode),"bookmark":this._getBookmark()});
}
},_endEditing:function(_bdb){
var v=dijit._editor.getChildrenHtml(this.editNode);
this._undoedSteps=[];
this._steps.push({text:v,bookmark:this._getBookmark()});
},onKeyDown:function(e){
if(!dojo.isIE&&!this.iframe&&e.keyCode==dojo.keys.TAB&&!this.tabIndent){
this._saveSelection();
}
if(!this.customUndo){
this.inherited(arguments);
return;
}
var k=e.keyCode,ks=dojo.keys;
if(e.ctrlKey&&!e.altKey){
if(k==90||k==122){
dojo.stopEvent(e);
this.undo();
return;
}else{
if(k==89||k==121){
dojo.stopEvent(e);
this.redo();
return;
}
}
}
this.inherited(arguments);
switch(k){
case ks.ENTER:
case ks.BACKSPACE:
case ks.DELETE:
this.beginEditing();
break;
case 88:
case 86:
if(e.ctrlKey&&!e.altKey&&!e.metaKey){
this.endEditing();
if(e.keyCode==88){
this.beginEditing("cut");
setTimeout(dojo.hitch(this,this.endEditing),1);
}else{
this.beginEditing("paste");
setTimeout(dojo.hitch(this,this.endEditing),1);
}
break;
}
default:
if(!e.ctrlKey&&!e.altKey&&!e.metaKey&&(e.keyCode<dojo.keys.F1||e.keyCode>dojo.keys.F15)){
this.beginEditing();
break;
}
case ks.ALT:
this.endEditing();
break;
case ks.UP_ARROW:
case ks.DOWN_ARROW:
case ks.LEFT_ARROW:
case ks.RIGHT_ARROW:
case ks.HOME:
case ks.END:
case ks.PAGE_UP:
case ks.PAGE_DOWN:
this.endEditing(true);
break;
case ks.CTRL:
case ks.SHIFT:
case ks.TAB:
break;
}
},_onBlur:function(){
this.inherited(arguments);
this.endEditing(true);
},_saveSelection:function(){
try{
this._savedSelection=this._getBookmark();
}
catch(e){
}
},_restoreSelection:function(){
if(this._savedSelection){
delete this._cursorToStart;
if(dojo.withGlobal(this.window,"isCollapsed",dijit)){
this._moveToBookmark(this._savedSelection);
}
delete this._savedSelection;
}
},onClick:function(){
this.endEditing(true);
this.inherited(arguments);
},replaceValue:function(html){
if(!this.customUndo){
this.inherited(arguments);
}else{
if(this.isClosed){
this.setValue(html);
}else{
this.beginEditing();
if(!html){
html="&nbsp;";
}
this.setValue(html);
this.endEditing();
}
}
},_setDisabledAttr:function(_bdc){
var _bdd=dojo.hitch(this,function(){
if((!this.disabled&&_bdc)||(!this._buttonEnabledPlugins&&_bdc)){
dojo.forEach(this._plugins,function(p){
p.set("disabled",true);
});
}else{
if(this.disabled&&!_bdc){
dojo.forEach(this._plugins,function(p){
p.set("disabled",false);
});
}
}
});
this.setValueDeferred.addCallback(_bdd);
this.inherited(arguments);
},_setStateClass:function(){
try{
this.inherited(arguments);
if(this.document&&this.document.body){
dojo.style(this.document.body,"color",dojo.style(this.iframe,"color"));
}
}
catch(e){
}
}});
dojo.subscribe(dijit._scopeName+".Editor.getPlugin",null,function(o){
if(o.plugin){
return;
}
var args=o.args,p;
var _bde=dijit._editor._Plugin;
var name=args.name;
switch(name){
case "undo":
case "redo":
case "cut":
case "copy":
case "paste":
case "insertOrderedList":
case "insertUnorderedList":
case "indent":
case "outdent":
case "justifyCenter":
case "justifyFull":
case "justifyLeft":
case "justifyRight":
case "delete":
case "selectAll":
case "removeFormat":
case "unlink":
case "insertHorizontalRule":
p=new _bde({command:name});
break;
case "bold":
case "italic":
case "underline":
case "strikethrough":
case "subscript":
case "superscript":
p=new _bde({buttonClass:dijit.form.ToggleButton,command:name});
break;
case "|":
p=new _bde({button:new dijit.ToolbarSeparator(),setEditor:function(_bdf){
this.editor=_bdf;
}});
}
o.plugin=p;
});
}
if(!dojo._hasResource["dojox.grid.cells.dijit"]){
dojo._hasResource["dojox.grid.cells.dijit"]=true;
dojo.provide("dojox.grid.cells.dijit");
(function(){
var dgc=dojox.grid.cells;
dojo.declare("dojox.grid.cells._Widget",dgc._Base,{widgetClass:dijit.form.TextBox,constructor:function(_be0){
this.widget=null;
if(typeof this.widgetClass=="string"){
dojo.deprecated("Passing a string to widgetClass is deprecated","pass the widget class object instead","2.0");
this.widgetClass=dojo.getObject(this.widgetClass);
}
},formatEditing:function(_be1,_be2){
this.needFormatNode(_be1,_be2);
return "<div></div>";
},getValue:function(_be3){
return this.widget.get("value");
},setValue:function(_be4,_be5){
if(this.widget&&this.widget.set){
if(this.widget.onLoadDeferred){
var self=this;
this.widget.onLoadDeferred.addCallback(function(){
self.widget.set("value",_be5===null?"":_be5);
});
}else{
this.widget.set("value",_be5);
}
}else{
this.inherited(arguments);
}
},getWidgetProps:function(_be6){
return dojo.mixin({dir:this.dir,lang:this.lang},this.widgetProps||{},{constraints:dojo.mixin({},this.constraint)||{},value:_be6});
},createWidget:function(_be7,_be8,_be9){
return new this.widgetClass(this.getWidgetProps(_be8),_be7);
},attachWidget:function(_bea,_beb,_bec){
_bea.appendChild(this.widget.domNode);
this.setValue(_bec,_beb);
},formatNode:function(_bed,_bee,_bef){
if(!this.widgetClass){
return _bee;
}
if(!this.widget){
this.widget=this.createWidget.apply(this,arguments);
}else{
this.attachWidget.apply(this,arguments);
}
this.sizeWidget.apply(this,arguments);
this.grid.views.renormalizeRow(_bef);
this.grid.scroller.rowHeightChanged(_bef,true);
this.focus();
return undefined;
},sizeWidget:function(_bf0,_bf1,_bf2){
var p=this.getNode(_bf2),box=dojo.contentBox(p);
dojo.marginBox(this.widget.domNode,{w:box.w});
},focus:function(_bf3,_bf4){
if(this.widget){
setTimeout(dojo.hitch(this.widget,function(){
dojox.grid.util.fire(this,"focus");
}),0);
}
},_finish:function(_bf5){
this.inherited(arguments);
dojox.grid.util.removeNode(this.widget.domNode);
if(dojo.isIE){
dojo.setSelectable(this.widget.domNode,true);
}
}});
dgc._Widget.markupFactory=function(node,cell){
dgc._Base.markupFactory(node,cell);
var d=dojo;
var _bf6=d.trim(d.attr(node,"widgetProps")||"");
var _bf7=d.trim(d.attr(node,"constraint")||"");
var _bf8=d.trim(d.attr(node,"widgetClass")||"");
if(_bf6){
cell.widgetProps=d.fromJson(_bf6);
}
if(_bf7){
cell.constraint=d.fromJson(_bf7);
}
if(_bf8){
cell.widgetClass=d.getObject(_bf8);
}
};
dojo.declare("dojox.grid.cells.ComboBox",dgc._Widget,{widgetClass:dijit.form.ComboBox,getWidgetProps:function(_bf9){
var _bfa=[];
dojo.forEach(this.options,function(o){
_bfa.push({name:o,value:o});
});
var _bfb=new dojo.data.ItemFileReadStore({data:{identifier:"name",items:_bfa}});
return dojo.mixin({},this.widgetProps||{},{value:_bf9,store:_bfb});
},getValue:function(){
var e=this.widget;
e.set("displayedValue",e.get("displayedValue"));
return e.get("value");
}});
dgc.ComboBox.markupFactory=function(node,cell){
dgc._Widget.markupFactory(node,cell);
var d=dojo;
var _bfc=d.trim(d.attr(node,"options")||"");
if(_bfc){
var o=_bfc.split(",");
if(o[0]!=_bfc){
cell.options=o;
}
}
};
dojo.declare("dojox.grid.cells.DateTextBox",dgc._Widget,{widgetClass:dijit.form.DateTextBox,setValue:function(_bfd,_bfe){
if(this.widget){
this.widget.set("value",new Date(_bfe));
}else{
this.inherited(arguments);
}
},getWidgetProps:function(_bff){
return dojo.mixin(this.inherited(arguments),{value:new Date(_bff)});
}});
dgc.DateTextBox.markupFactory=function(node,cell){
dgc._Widget.markupFactory(node,cell);
};
dojo.declare("dojox.grid.cells.CheckBox",dgc._Widget,{widgetClass:dijit.form.CheckBox,getValue:function(){
return this.widget.checked;
},setValue:function(_c00,_c01){
if(this.widget&&this.widget.attributeMap.checked){
this.widget.set("checked",_c01);
}else{
this.inherited(arguments);
}
},sizeWidget:function(_c02,_c03,_c04){
return;
}});
dgc.CheckBox.markupFactory=function(node,cell){
dgc._Widget.markupFactory(node,cell);
};
dojo.declare("dojox.grid.cells.Editor",dgc._Widget,{widgetClass:dijit.Editor,getWidgetProps:function(_c05){
return dojo.mixin({},this.widgetProps||{},{height:this.widgetHeight||"100px"});
},createWidget:function(_c06,_c07,_c08){
var _c09=new this.widgetClass(this.getWidgetProps(_c07),_c06);
dojo.connect(_c09,"onLoad",dojo.hitch(this,"populateEditor"));
return _c09;
},formatNode:function(_c0a,_c0b,_c0c){
this.content=_c0b;
this.inherited(arguments);
if(dojo.isMoz){
var e=this.widget;
e.open();
if(this.widgetToolbar){
dojo.place(e.toolbar.domNode,e.editingArea,"before");
}
}
},populateEditor:function(){
this.widget.set("value",this.content);
this.widget.placeCursorAtEnd();
}});
dgc.Editor.markupFactory=function(node,cell){
dgc._Widget.markupFactory(node,cell);
var d=dojo;
var h=dojo.trim(dojo.attr(node,"widgetHeight")||"");
if(h){
if((h!="auto")&&(h.substr(-2)!="em")){
h=parseInt(h,10)+"px";
}
cell.widgetHeight=h;
}
};
})();
}
if(!dojo._hasResource["dojox.html._base"]){
dojo._hasResource["dojox.html._base"]=true;
dojo.provide("dojox.html._base");
(function(){
if(dojo.isIE){
var _c0d=/(AlphaImageLoader\([^)]*?src=(['"]))(?![a-z]+:|\/)([^\r\n;}]+?)(\2[^)]*\)\s*[;}]?)/g;
}
var _c0e=/(?:(?:@import\s*(['"])(?![a-z]+:|\/)([^\r\n;{]+?)\1)|url\(\s*(['"]?)(?![a-z]+:|\/)([^\r\n;]+?)\3\s*\))([a-z, \s]*[;}]?)/g;
var _c0f=dojox.html._adjustCssPaths=function(_c10,_c11){
if(!_c11||!_c10){
return;
}
if(_c0d){
_c11=_c11.replace(_c0d,function(_c12,pre,_c13,url,post){
return pre+(new dojo._Url(_c10,"./"+url).toString())+post;
});
}
return _c11.replace(_c0e,function(_c14,_c15,_c16,_c17,_c18,_c19){
if(_c16){
return "@import \""+(new dojo._Url(_c10,"./"+_c16).toString())+"\""+_c19;
}else{
return "url("+(new dojo._Url(_c10,"./"+_c18).toString())+")"+_c19;
}
});
};
var _c1a=/(<[a-z][a-z0-9]*\s[^>]*)(?:(href|src)=(['"]?)([^>]*?)\3|style=(['"]?)([^>]*?)\5)([^>]*>)/gi;
var _c1b=dojox.html._adjustHtmlPaths=function(_c1c,cont){
var url=_c1c||"./";
return cont.replace(_c1a,function(tag,_c1d,name,_c1e,_c1f,_c20,_c21,end){
return _c1d+(name?(name+"="+_c1e+(new dojo._Url(url,_c1f).toString())+_c1e):("style="+_c20+_c0f(url,_c21)+_c20))+end;
});
};
var _c22=dojox.html._snarfStyles=function(_c23,cont,_c24){
_c24.attributes=[];
return cont.replace(/(?:<style([^>]*)>([\s\S]*?)<\/style>|<link\s+(?=[^>]*rel=['"]?stylesheet)([^>]*?href=(['"])([^>]*?)\4[^>\/]*)\/?>)/gi,function(_c25,_c26,_c27,_c28,_c29,href){
var i,attr=(_c26||_c28||"").replace(/^\s*([\s\S]*?)\s*$/i,"$1");
if(_c27){
i=_c24.push(_c23?_c0f(_c23,_c27):_c27);
}else{
i=_c24.push("@import \""+href+"\";");
attr=attr.replace(/\s*(?:rel|href)=(['"])?[^\s]*\1\s*/gi,"");
}
if(attr){
attr=attr.split(/\s+/);
var _c2a={},tmp;
for(var j=0,e=attr.length;j<e;j++){
tmp=attr[j].split("=");
_c2a[tmp[0]]=tmp[1].replace(/^\s*['"]?([\s\S]*?)['"]?\s*$/,"$1");
}
_c24.attributes[i-1]=_c2a;
}
return "";
});
};
var _c2b=dojox.html._snarfScripts=function(cont,_c2c){
_c2c.code="";
cont=cont.replace(/<[!][-][-](.|\s)*?[-][-]>/g,function(_c2d){
return _c2d.replace(/<(\/?)script\b/ig,"&lt;$1Script");
});
function _c2e(src){
if(_c2c.downloadRemote){
src=src.replace(/&([a-z0-9#]+);/g,function(m,name){
switch(name){
case "amp":
return "&";
case "gt":
return ">";
case "lt":
return "<";
default:
return name.charAt(0)=="#"?String.fromCharCode(name.substring(1)):"&"+name+";";
}
});
dojo.xhrGet({url:src,sync:true,load:function(code){
_c2c.code+=code+";";
},error:_c2c.errBack});
}
};
return cont.replace(/<script\s*(?![^>]*type=['"]?(?:dojo\/|text\/html\b))(?:[^>]*?(?:src=(['"]?)([^>]*?)\1[^>]*)?)*>([\s\S]*?)<\/script>/gi,function(_c2f,_c30,src,code){
if(src){
_c2e(src);
}else{
_c2c.code+=code;
}
return "";
});
};
var _c31=dojox.html.evalInGlobal=function(code,_c32){
_c32=_c32||dojo.doc.body;
var n=_c32.ownerDocument.createElement("script");
n.type="text/javascript";
_c32.appendChild(n);
n.text=code;
};
dojo.declare("dojox.html._ContentSetter",[dojo.html._ContentSetter],{adjustPaths:false,referencePath:".",renderStyles:false,executeScripts:false,scriptHasHooks:false,scriptHookReplacement:null,_renderStyles:function(_c33){
this._styleNodes=[];
var st,att,_c34,doc=this.node.ownerDocument;
var head=doc.getElementsByTagName("head")[0];
for(var i=0,e=_c33.length;i<e;i++){
_c34=_c33[i];
att=_c33.attributes[i];
st=doc.createElement("style");
st.setAttribute("type","text/css");
for(var x in att){
st.setAttribute(x,att[x]);
}
this._styleNodes.push(st);
head.appendChild(st);
if(st.styleSheet){
st.styleSheet.cssText=_c34;
}else{
st.appendChild(doc.createTextNode(_c34));
}
}
},empty:function(){
this.inherited("empty",arguments);
this._styles=[];
},onBegin:function(){
this.inherited("onBegin",arguments);
var cont=this.content,node=this.node;
var _c35=this._styles;
if(dojo.isString(cont)){
if(this.adjustPaths&&this.referencePath){
cont=_c1b(this.referencePath,cont);
}
if(this.renderStyles||this.cleanContent){
cont=_c22(this.referencePath,cont,_c35);
}
if(this.executeScripts){
var _c36=this;
var _c37={downloadRemote:true,errBack:function(e){
_c36._onError.call(_c36,"Exec","Error downloading remote script in \""+_c36.id+"\"",e);
}};
cont=_c2b(cont,_c37);
this._code=_c37.code;
}
}
this.content=cont;
},onEnd:function(){
var code=this._code,_c38=this._styles;
if(this._styleNodes&&this._styleNodes.length){
while(this._styleNodes.length){
dojo.destroy(this._styleNodes.pop());
}
}
if(this.renderStyles&&_c38&&_c38.length){
this._renderStyles(_c38);
}
if(this.executeScripts&&code){
if(this.cleanContent){
code=code.replace(/(<!--|(?:\/\/)?-->|<!\[CDATA\[|\]\]>)/g,"");
}
if(this.scriptHasHooks){
code=code.replace(/_container_(?!\s*=[^=])/g,this.scriptHookReplacement);
}
try{
_c31(code,this.node);
}
catch(e){
this._onError("Exec","Error eval script in "+this.id+", "+e.message,e);
}
}
this.inherited("onEnd",arguments);
},tearDown:function(){
this.inherited(arguments);
delete this._styles;
if(this._styleNodes&&this._styleNodes.length){
while(this._styleNodes.length){
dojo.destroy(this._styleNodes.pop());
}
}
delete this._styleNodes;
dojo.mixin(this,dojo.getObject(this.declaredClass).prototype);
}});
dojox.html.set=function(node,cont,_c39){
if(!_c39){
return dojo.html._setNodeContent(node,cont,true);
}else{
var op=new dojox.html._ContentSetter(dojo.mixin(_c39,{content:cont,node:node}));
return op.set();
}
};
})();
}
if(!dojo._hasResource["dojox.layout.ContentPane"]){
dojo._hasResource["dojox.layout.ContentPane"]=true;
dojo.provide("dojox.layout.ContentPane");
dojo.declare("dojox.layout.ContentPane",dijit.layout.ContentPane,{adjustPaths:false,cleanContent:false,renderStyles:false,executeScripts:true,scriptHasHooks:false,constructor:function(){
this.ioArgs={};
this.ioMethod=dojo.xhrGet;
},onExecError:function(e){
},_setContent:function(cont){
var _c3a=this._contentSetter;
if(!(_c3a&&_c3a instanceof dojox.html._ContentSetter)){
_c3a=this._contentSetter=new dojox.html._ContentSetter({node:this.containerNode,_onError:dojo.hitch(this,this._onError),onContentError:dojo.hitch(this,function(e){
var _c3b=this.onContentError(e);
try{
this.containerNode.innerHTML=_c3b;
}
catch(e){
console.error("Fatal "+this.id+" could not change content due to "+e.message,e);
}
})});
}
this._contentSetterParams={adjustPaths:Boolean(this.adjustPaths&&(this.href||this.referencePath)),referencePath:this.href||this.referencePath,renderStyles:this.renderStyles,executeScripts:this.executeScripts,scriptHasHooks:this.scriptHasHooks,scriptHookReplacement:"dijit.byId('"+this.id+"')"};
this.inherited("_setContent",arguments);
}});
}
if(!dojo._hasResource["dojox.layout.ResizeHandle"]){
dojo._hasResource["dojox.layout.ResizeHandle"]=true;
dojo.provide("dojox.layout.ResizeHandle");
dojo.experimental("dojox.layout.ResizeHandle");
dojo.declare("dojox.layout.ResizeHandle",[dijit._Widget,dijit._Templated],{targetId:"",targetContainer:null,resizeAxis:"xy",activeResize:false,activeResizeClass:"dojoxResizeHandleClone",animateSizing:true,animateMethod:"chain",animateDuration:225,minHeight:100,minWidth:100,constrainMax:false,maxHeight:0,maxWidth:0,fixedAspect:false,intermediateChanges:false,startTopic:"/dojo/resize/start",endTopic:"/dojo/resize/stop",templateString:"<div dojoAttachPoint=\"resizeHandle\" class=\"dojoxResizeHandle\"><div></div></div>",postCreate:function(){
this.connect(this.resizeHandle,"onmousedown","_beginSizing");
if(!this.activeResize){
this._resizeHelper=dijit.byId("dojoxGlobalResizeHelper");
if(!this._resizeHelper){
this._resizeHelper=new dojox.layout._ResizeHelper({id:"dojoxGlobalResizeHelper"}).placeAt(dojo.body());
dojo.addClass(this._resizeHelper.domNode,this.activeResizeClass);
}
}else{
this.animateSizing=false;
}
if(!this.minSize){
this.minSize={w:this.minWidth,h:this.minHeight};
}
if(this.constrainMax){
this.maxSize={w:this.maxWidth,h:this.maxHeight};
}
this._resizeX=this._resizeY=false;
var _c3c=dojo.partial(dojo.addClass,this.resizeHandle);
switch(this.resizeAxis.toLowerCase()){
case "xy":
this._resizeX=this._resizeY=true;
_c3c("dojoxResizeNW");
break;
case "x":
this._resizeX=true;
_c3c("dojoxResizeW");
break;
case "y":
this._resizeY=true;
_c3c("dojoxResizeN");
break;
}
},_beginSizing:function(e){
if(this._isSizing){
return false;
}
dojo.publish(this.startTopic,[this]);
this.targetWidget=dijit.byId(this.targetId);
this.targetDomNode=this.targetWidget?this.targetWidget.domNode:dojo.byId(this.targetId);
if(this.targetContainer){
this.targetDomNode=this.targetContainer;
}
if(!this.targetDomNode){
return false;
}
if(!this.activeResize){
var c=dojo.position(this.targetDomNode,true);
console.log(c);
console.log(dojo.window.getBox());
this._resizeHelper.resize({l:c.x,t:c.y,w:c.w,h:c.h});
this._resizeHelper.show();
}
this._isSizing=true;
this.startPoint={x:e.clientX,y:e.clientY};
var mb=this.targetWidget?dojo.marginBox(this.targetDomNode):dojo.contentBox(this.targetDomNode);
this.startSize={w:mb.w,h:mb.h};
if(this.fixedAspect){
var max,val;
if(mb.w>mb.h){
max="w";
val=mb.w/mb.h;
}else{
max="h";
val=mb.h/mb.w;
}
this._aspect={prop:max};
this._aspect[max]=val;
}
this._pconnects=[];
this._pconnects.push(dojo.connect(dojo.doc,"onmousemove",this,"_updateSizing"));
this._pconnects.push(dojo.connect(dojo.doc,"onmouseup",this,"_endSizing"));
dojo.stopEvent(e);
},_updateSizing:function(e){
if(this.activeResize){
this._changeSizing(e);
}else{
var tmp=this._getNewCoords(e);
if(tmp===false){
return;
}
this._resizeHelper.resize(tmp);
}
e.preventDefault();
},_getNewCoords:function(e){
try{
if(!e.clientX||!e.clientY){
return false;
}
}
catch(e){
return false;
}
this._activeResizeLastEvent=e;
var dx=(this.isLeftToRight()?this.startPoint.x-e.clientX:e.clientX-this.startPoint.x),dy=this.startPoint.y-e.clientY,newW=this.startSize.w-(this._resizeX?dx:0),newH=this.startSize.h-(this._resizeY?dy:0);
return this._checkConstraints(newW,newH);
},_checkConstraints:function(newW,newH){
if(this.minSize){
var tm=this.minSize;
if(newW<tm.w){
newW=tm.w;
}
if(newH<tm.h){
newH=tm.h;
}
}
if(this.constrainMax&&this.maxSize){
var ms=this.maxSize;
if(newW>ms.w){
newW=ms.w;
}
if(newH>ms.h){
newH=ms.h;
}
}
if(this.fixedAspect){
var ta=this._aspect[this._aspect.prop];
if(newW<newH){
newH=newW*ta;
}else{
if(newH<newW){
newW=newH*ta;
}
}
}
return {w:newW,h:newH};
},_changeSizing:function(e){
var tmp=this._getNewCoords(e);
if(tmp===false){
return;
}
if(this.targetWidget&&dojo.isFunction(this.targetWidget.resize)){
this.targetWidget.resize(tmp);
}else{
if(this.animateSizing){
var anim=dojo.fx[this.animateMethod]([dojo.animateProperty({node:this.targetDomNode,properties:{width:{start:this.startSize.w,end:tmp.w}},duration:this.animateDuration}),dojo.animateProperty({node:this.targetDomNode,properties:{height:{start:this.startSize.h,end:tmp.h}},duration:this.animateDuration})]);
anim.play();
}else{
dojo.style(this.targetDomNode,{width:tmp.w+"px",height:tmp.h+"px"});
}
}
if(this.intermediateChanges){
this.onResize(e);
}
},_endSizing:function(e){
dojo.forEach(this._pconnects,dojo.disconnect);
var pub=dojo.partial(dojo.publish,this.endTopic,[this]);
if(!this.activeResize){
this._resizeHelper.hide();
this._changeSizing(e);
setTimeout(pub,this.animateDuration+15);
}else{
pub();
}
this._isSizing=false;
this.onResize(e);
},onResize:function(e){
}});
dojo.declare("dojox.layout._ResizeHelper",dijit._Widget,{show:function(){
dojo.fadeIn({node:this.domNode,duration:120,beforeBegin:function(n){
dojo.style(n,"display","");
}}).play();
},hide:function(){
dojo.fadeOut({node:this.domNode,duration:250,onEnd:function(n){
dojo.style(n,"display","none");
}}).play();
},resize:function(dim){
dojo.marginBox(this.domNode,dim);
}});
}
if(!dojo._hasResource["dojox.layout.FloatingPane"]){
dojo._hasResource["dojox.layout.FloatingPane"]=true;
dojo.provide("dojox.layout.FloatingPane");
dojo.experimental("dojox.layout.FloatingPane");
dojo.declare("dojox.layout.FloatingPane",[dojox.layout.ContentPane,dijit._Templated],{closable:true,dockable:true,resizable:false,maxable:false,resizeAxis:"xy",title:"",dockTo:"",duration:400,contentClass:"dojoxFloatingPaneContent",_showAnim:null,_hideAnim:null,_dockNode:null,_restoreState:{},_allFPs:[],_startZ:100,templateString:dojo.cache("dojox.layout","resources/FloatingPane.html","<div class=\"dojoxFloatingPane\" id=\"${id}\">\r\n\t<div tabindex=\"0\" role=\"button\" class=\"dojoxFloatingPaneTitle\" dojoAttachPoint=\"focusNode\">\r\n\t\t<span dojoAttachPoint=\"closeNode\" dojoAttachEvent=\"onclick: close\" class=\"dojoxFloatingCloseIcon\"></span>\r\n\t\t<span dojoAttachPoint=\"maxNode\" dojoAttachEvent=\"onclick: maximize\" class=\"dojoxFloatingMaximizeIcon\">&thinsp;</span>\r\n\t\t<span dojoAttachPoint=\"restoreNode\" dojoAttachEvent=\"onclick: _restore\" class=\"dojoxFloatingRestoreIcon\">&thinsp;</span>\t\r\n\t\t<span dojoAttachPoint=\"dockNode\" dojoAttachEvent=\"onclick: minimize\" class=\"dojoxFloatingMinimizeIcon\">&thinsp;</span>\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitInline dijitTitleNode\"></span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"canvas\" class=\"dojoxFloatingPaneCanvas\">\r\n\t\t<div dojoAttachPoint=\"containerNode\" role=\"region\" tabindex=\"-1\" class=\"${contentClass}\">\r\n\t\t</div>\r\n\t\t<span dojoAttachPoint=\"resizeHandle\" class=\"dojoxFloatingResizeHandle\"></span>\r\n\t</div>\r\n</div>\r\n"),attributeMap:dojo.delegate(dijit._Widget.prototype.attributeMap,{title:{type:"innerHTML",node:"titleNode"}}),postCreate:function(){
this.inherited(arguments);
new dojo.dnd.Moveable(this.domNode,{handle:this.focusNode});
if(!this.dockable){
this.dockNode.style.display="none";
}
if(!this.closable){
this.closeNode.style.display="none";
}
if(!this.maxable){
this.maxNode.style.display="none";
this.restoreNode.style.display="none";
}
if(!this.resizable){
this.resizeHandle.style.display="none";
}else{
this.domNode.style.width=dojo.marginBox(this.domNode).w+"px";
}
this._allFPs.push(this);
this.domNode.style.position="absolute";
this.bgIframe=new dijit.BackgroundIframe(this.domNode);
this._naturalState=dojo.coords(this.domNode);
},startup:function(){
if(this._started){
return;
}
this.inherited(arguments);
if(this.resizable){
if(dojo.isIE){
this.canvas.style.overflow="auto";
}else{
this.containerNode.style.overflow="auto";
}
this._resizeHandle=new dojox.layout.ResizeHandle({targetId:this.id,resizeAxis:this.resizeAxis},this.resizeHandle);
}
if(this.dockable){
var _c3d=this.dockTo;
if(this.dockTo){
this.dockTo=dijit.byId(this.dockTo);
}else{
this.dockTo=dijit.byId("dojoxGlobalFloatingDock");
}
if(!this.dockTo){
var _c3e,_c3f;
if(_c3d){
_c3e=_c3d;
_c3f=dojo.byId(_c3d);
}else{
_c3f=dojo.create("div",null,dojo.body());
dojo.addClass(_c3f,"dojoxFloatingDockDefault");
_c3e="dojoxGlobalFloatingDock";
}
this.dockTo=new dojox.layout.Dock({id:_c3e,autoPosition:"south"},_c3f);
this.dockTo.startup();
}
if((this.domNode.style.display=="none")||(this.domNode.style.visibility=="hidden")){
this.minimize();
}
}
this.connect(this.focusNode,"onmousedown","bringToTop");
this.connect(this.domNode,"onmousedown","bringToTop");
this.resize(dojo.coords(this.domNode));
this._started=true;
},setTitle:function(_c40){
dojo.deprecated("pane.setTitle","Use pane.set('title', someTitle)","2.0");
this.set("title",_c40);
},close:function(){
if(!this.closable){
return;
}
dojo.unsubscribe(this._listener);
this.hide(dojo.hitch(this,function(){
this.destroyRecursive();
}));
},hide:function(_c41){
dojo.fadeOut({node:this.domNode,duration:this.duration,onEnd:dojo.hitch(this,function(){
this.domNode.style.display="none";
this.domNode.style.visibility="hidden";
if(this.dockTo&&this.dockable){
this.dockTo._positionDock(null);
}
if(_c41){
_c41();
}
})}).play();
},show:function(_c42){
var anim=dojo.fadeIn({node:this.domNode,duration:this.duration,beforeBegin:dojo.hitch(this,function(){
this.domNode.style.display="";
this.domNode.style.visibility="visible";
if(this.dockTo&&this.dockable){
this.dockTo._positionDock(null);
}
if(typeof _c42=="function"){
_c42();
}
this._isDocked=false;
if(this._dockNode){
this._dockNode.destroy();
this._dockNode=null;
}
})}).play();
this.resize(dojo.coords(this.domNode));
},minimize:function(){
if(!this._isDocked){
this.hide(dojo.hitch(this,"_dock"));
}
},maximize:function(){
if(this._maximized){
return;
}
this._naturalState=dojo.position(this.domNode);
if(this._isDocked){
this.show();
setTimeout(dojo.hitch(this,"maximize"),this.duration);
}
dojo.addClass(this.focusNode,"floatingPaneMaximized");
this.resize(dojo.window.getBox());
this._maximized=true;
},_restore:function(){
if(this._maximized){
this.resize(this._naturalState);
dojo.removeClass(this.focusNode,"floatingPaneMaximized");
this._maximized=false;
}
},_dock:function(){
if(!this._isDocked&&this.dockable){
this._dockNode=this.dockTo.addNode(this);
this._isDocked=true;
}
},resize:function(dim){
dim=dim||this._naturalState;
this._currentState=dim;
var dns=this.domNode.style;
if("t" in dim){
dns.top=dim.t+"px";
}
if("l" in dim){
dns.left=dim.l+"px";
}
dns.width=dim.w+"px";
dns.height=dim.h+"px";
var _c43={l:0,t:0,w:dim.w,h:(dim.h-this.focusNode.offsetHeight)};
dojo.marginBox(this.canvas,_c43);
this._checkIfSingleChild();
if(this._singleChild&&this._singleChild.resize){
this._singleChild.resize(_c43);
}
},bringToTop:function(){
var _c44=dojo.filter(this._allFPs,function(i){
return i!==this;
},this);
_c44.sort(function(a,b){
return a.domNode.style.zIndex-b.domNode.style.zIndex;
});
_c44.push(this);
dojo.forEach(_c44,function(w,x){
w.domNode.style.zIndex=this._startZ+(x*2);
dojo.removeClass(w.domNode,"dojoxFloatingPaneFg");
},this);
dojo.addClass(this.domNode,"dojoxFloatingPaneFg");
},destroy:function(){
this._allFPs.splice(dojo.indexOf(this._allFPs,this),1);
if(this._resizeHandle){
this._resizeHandle.destroy();
}
this.inherited(arguments);
}});
dojo.declare("dojox.layout.Dock",[dijit._Widget,dijit._Templated],{templateString:"<div class=\"dojoxDock\"><ul dojoAttachPoint=\"containerNode\" class=\"dojoxDockList\"></ul></div>",_docked:[],_inPositioning:false,autoPosition:false,addNode:function(_c45){
var div=dojo.create("li",null,this.containerNode),node=new dojox.layout._DockNode({title:_c45.title,paneRef:_c45},div);
node.startup();
return node;
},startup:function(){
if(this.id=="dojoxGlobalFloatingDock"||this.isFixedDock){
this.connect(window,"onresize","_positionDock");
this.connect(window,"onscroll","_positionDock");
if(dojo.isIE){
this.connect(this.domNode,"onresize","_positionDock");
}
}
this._positionDock(null);
this.inherited(arguments);
},_positionDock:function(e){
if(!this._inPositioning){
if(this.autoPosition=="south"){
setTimeout(dojo.hitch(this,function(){
this._inPositiononing=true;
var _c46=dojo.window.getBox();
var s=this.domNode.style;
s.left=_c46.l+"px";
s.width=(_c46.w-2)+"px";
s.top=(_c46.h+_c46.t)-this.domNode.offsetHeight+"px";
this._inPositioning=false;
}),125);
}
}
}});
dojo.declare("dojox.layout._DockNode",[dijit._Widget,dijit._Templated],{title:"",paneRef:null,templateString:"<li dojoAttachEvent=\"onclick: restore\" class=\"dojoxDockNode\">"+"<span dojoAttachPoint=\"restoreNode\" class=\"dojoxDockRestoreButton\" dojoAttachEvent=\"onclick: restore\"></span>"+"<span class=\"dojoxDockTitleNode\" dojoAttachPoint=\"titleNode\">${title}</span>"+"</li>",restore:function(){
this.paneRef.show();
this.paneRef.bringToTop();
if(!this.paneRef.isLoaded){
this.paneRef.refresh();
}
this.destroy();
}});
}
if(!dojo._hasResource["dojox.xml.DomParser"]){
dojo._hasResource["dojox.xml.DomParser"]=true;
dojo.provide("dojox.xml.DomParser");
dojox.xml.DomParser=new (function(){
var _c47={ELEMENT:1,ATTRIBUTE:2,TEXT:3,CDATA_SECTION:4,PROCESSING_INSTRUCTION:7,COMMENT:8,DOCUMENT:9};
var _c48=/<([^>\/\s+]*)([^>]*)>([^<]*)/g;
var _c49=/([^=]*)=(("([^"]*)")|('([^']*)'))/g;
var _c4a=/<!ENTITY\s+([^"]*)\s+"([^"]*)">/g;
var _c4b=/<!\[CDATA\[([\u0001-\uFFFF]*?)\]\]>/g;
var _c4c=/<!--([\u0001-\uFFFF]*?)-->/g;
var trim=/^\s+|\s+$/g;
var _c4d=/\s+/g;
var egt=/\&gt;/g;
var elt=/\&lt;/g;
var _c4e=/\&quot;/g;
var _c4f=/\&apos;/g;
var eamp=/\&amp;/g;
var dNs="_def_";
function _c50(){
return new (function(){
var all={};
this.nodeType=_c47.DOCUMENT;
this.nodeName="#document";
this.namespaces={};
this._nsPaths={};
this.childNodes=[];
this.documentElement=null;
this._add=function(obj){
if(typeof (obj.id)!="undefined"){
all[obj.id]=obj;
}
};
this._remove=function(id){
if(all[id]){
delete all[id];
}
};
this.byId=this.getElementById=function(id){
return all[id];
};
this.byName=this.getElementsByTagName=_c51;
this.byNameNS=this.getElementsByTagNameNS=_c52;
this.childrenByName=_c53;
this.childrenByNameNS=_c54;
})();
};
function _c51(name){
function _c55(node,name,arr){
dojo.forEach(node.childNodes,function(c){
if(c.nodeType==_c47.ELEMENT){
if(name=="*"){
arr.push(c);
}else{
if(c.nodeName==name){
arr.push(c);
}
}
_c55(c,name,arr);
}
});
};
var a=[];
_c55(this,name,a);
return a;
};
function _c52(name,ns){
function _c56(node,name,ns,arr){
dojo.forEach(node.childNodes,function(c){
if(c.nodeType==_c47.ELEMENT){
if(name=="*"&&c.ownerDocument._nsPaths[ns]==c.namespace){
arr.push(c);
}else{
if(c.localName==name&&c.ownerDocument._nsPaths[ns]==c.namespace){
arr.push(c);
}
}
_c56(c,name,ns,arr);
}
});
};
if(!ns){
ns=dNs;
}
var a=[];
_c56(this,name,ns,a);
return a;
};
function _c53(name){
var a=[];
dojo.forEach(this.childNodes,function(c){
if(c.nodeType==_c47.ELEMENT){
if(name=="*"){
a.push(c);
}else{
if(c.nodeName==name){
a.push(c);
}
}
}
});
return a;
};
function _c54(name,ns){
var a=[];
dojo.forEach(this.childNodes,function(c){
if(c.nodeType==_c47.ELEMENT){
if(name=="*"&&c.ownerDocument._nsPaths[ns]==c.namespace){
a.push(c);
}else{
if(c.localName==name&&c.ownerDocument._nsPaths[ns]==c.namespace){
a.push(c);
}
}
}
});
return a;
};
function _c57(v){
return {nodeType:_c47.TEXT,nodeName:"#text",nodeValue:v.replace(_c4d," ").replace(egt,">").replace(elt,"<").replace(_c4f,"'").replace(_c4e,"\"").replace(eamp,"&")};
};
function _c58(name){
for(var i=0;i<this.attributes.length;i++){
if(this.attributes[i].nodeName==name){
return this.attributes[i].nodeValue;
}
}
return null;
};
function _c59(name,ns){
for(var i=0;i<this.attributes.length;i++){
if(this.ownerDocument._nsPaths[ns]==this.attributes[i].namespace&&this.attributes[i].localName==name){
return this.attributes[i].nodeValue;
}
}
return null;
};
function _c5a(name,val){
var old=null;
for(var i=0;i<this.attributes.length;i++){
if(this.attributes[i].nodeName==name){
old=this.attributes[i].nodeValue;
this.attributes[i].nodeValue=val;
break;
}
}
if(name=="id"){
if(old!=null){
this.ownerDocument._remove(old);
}
this.ownerDocument._add(this);
}
};
function _c5b(name,val,ns){
for(var i=0;i<this.attributes.length;i++){
if(this.ownerDocument._nsPaths[ns]==this.attributes[i].namespace&&this.attributes[i].localName==name){
this.attributes[i].nodeValue=val;
return;
}
}
};
function prev(){
var p=this.parentNode;
if(p){
for(var i=0;i<p.childNodes.length;i++){
if(p.childNodes[i]==this&&i>0){
return p.childNodes[i-1];
}
}
}
return null;
};
function next(){
var p=this.parentNode;
if(p){
for(var i=0;i<p.childNodes.length;i++){
if(p.childNodes[i]==this&&(i+1)<p.childNodes.length){
return p.childNodes[i+1];
}
}
}
return null;
};
this.parse=function(str){
var root=_c50();
if(str==null){
return root;
}
if(str.length==0){
return root;
}
if(str.indexOf("<!ENTITY")>0){
var _c5c,eRe=[];
if(_c4a.test(str)){
_c4a.lastIndex=0;
while((_c5c=_c4a.exec(str))!=null){
eRe.push({entity:"&"+_c5c[1].replace(trim,"")+";",expression:_c5c[2]});
}
for(var i=0;i<eRe.length;i++){
str=str.replace(new RegExp(eRe[i].entity,"g"),eRe[i].expression);
}
}
}
var _c5d=[],_c5e;
while((_c5e=_c4b.exec(str))!=null){
_c5d.push(_c5e[1]);
}
for(var i=0;i<_c5d.length;i++){
str=str.replace(_c5d[i],i);
}
var _c5f=[],_c60;
while((_c60=_c4c.exec(str))!=null){
_c5f.push(_c60[1]);
}
for(i=0;i<_c5f.length;i++){
str=str.replace(_c5f[i],i);
}
var res,obj=root;
while((res=_c48.exec(str))!=null){
if(res[2].charAt(0)=="/"&&res[2].replace(trim,"").length>1){
if(obj.parentNode){
obj=obj.parentNode;
}
var text=(res[3]||"").replace(trim,"");
if(text.length>0){
obj.childNodes.push(_c57(text));
}
}else{
if(res[1].length>0){
if(res[1].charAt(0)=="?"){
var name=res[1].substr(1);
var _c61=res[2].substr(0,res[2].length-2);
obj.childNodes.push({nodeType:_c47.PROCESSING_INSTRUCTION,nodeName:name,nodeValue:_c61});
}else{
if(res[1].charAt(0)=="!"){
if(res[1].indexOf("![CDATA[")==0){
var val=parseInt(res[1].replace("![CDATA[","").replace("]]",""));
obj.childNodes.push({nodeType:_c47.CDATA_SECTION,nodeName:"#cdata-section",nodeValue:_c5d[val]});
}else{
if(res[1].substr(0,3)=="!--"){
var val=parseInt(res[1].replace("!--","").replace("--",""));
obj.childNodes.push({nodeType:_c47.COMMENT,nodeName:"#comment",nodeValue:_c5f[val]});
}
}
}else{
var name=res[1].replace(trim,"");
var o={nodeType:_c47.ELEMENT,nodeName:name,localName:name,namespace:dNs,ownerDocument:root,attributes:[],parentNode:null,childNodes:[]};
if(name.indexOf(":")>-1){
var t=name.split(":");
o.namespace=t[0];
o.localName=t[1];
}
o.byName=o.getElementsByTagName=_c51;
o.byNameNS=o.getElementsByTagNameNS=_c52;
o.childrenByName=_c53;
o.childrenByNameNS=_c54;
o.getAttribute=_c58;
o.getAttributeNS=_c59;
o.setAttribute=_c5a;
o.setAttributeNS=_c5b;
o.previous=o.previousSibling=prev;
o.next=o.nextSibling=next;
var attr;
while((attr=_c49.exec(res[2]))!=null){
if(attr.length>0){
var name=attr[1].replace(trim,"");
var val=(attr[4]||attr[6]||"").replace(_c4d," ").replace(egt,">").replace(elt,"<").replace(_c4f,"'").replace(_c4e,"\"").replace(eamp,"&");
if(name.indexOf("xmlns")==0){
if(name.indexOf(":")>0){
var ns=name.split(":");
root.namespaces[ns[1]]=val;
root._nsPaths[val]=ns[1];
}else{
root.namespaces[dNs]=val;
root._nsPaths[val]=dNs;
}
}else{
var ln=name;
var ns=dNs;
if(name.indexOf(":")>0){
var t=name.split(":");
ln=t[1];
ns=t[0];
}
o.attributes.push({nodeType:_c47.ATTRIBUTE,nodeName:name,localName:ln,namespace:ns,nodeValue:val});
if(ln=="id"){
o.id=val;
}
}
}
}
root._add(o);
if(obj){
obj.childNodes.push(o);
o.parentNode=obj;
if(res[2].charAt(res[2].length-1)!="/"){
obj=o;
}
}
var text=res[3];
if(text.length>0){
obj.childNodes.push(_c57(text));
}
}
}
}
}
}
for(var i=0;i<root.childNodes.length;i++){
var e=root.childNodes[i];
if(e.nodeType==_c47.ELEMENT){
root.documentElement=e;
break;
}
}
return root;
};
})();
}
if(!dojo._hasResource["dojox.string.Builder"]){
dojo._hasResource["dojox.string.Builder"]=true;
dojo.provide("dojox.string.Builder");
dojox.string.Builder=function(str){
var b="";
this.length=0;
this.append=function(s){
if(arguments.length>1){
var tmp="",l=arguments.length;
switch(l){
case 9:
tmp=""+arguments[8]+tmp;
case 8:
tmp=""+arguments[7]+tmp;
case 7:
tmp=""+arguments[6]+tmp;
case 6:
tmp=""+arguments[5]+tmp;
case 5:
tmp=""+arguments[4]+tmp;
case 4:
tmp=""+arguments[3]+tmp;
case 3:
tmp=""+arguments[2]+tmp;
case 2:
b+=""+arguments[0]+arguments[1]+tmp;
break;
default:
var i=0;
while(i<arguments.length){
tmp+=arguments[i++];
}
b+=tmp;
}
}else{
b+=s;
}
this.length=b.length;
return this;
};
this.concat=function(s){
return this.append.apply(this,arguments);
};
this.appendArray=function(_c62){
return this.append.apply(this,_c62);
};
this.clear=function(){
b="";
this.length=0;
return this;
};
this.replace=function(_c63,_c64){
b=b.replace(_c63,_c64);
this.length=b.length;
return this;
};
this.remove=function(_c65,len){
if(len===undefined){
len=b.length;
}
if(len==0){
return this;
}
b=b.substr(0,_c65)+b.substr(_c65+len);
this.length=b.length;
return this;
};
this.insert=function(_c66,str){
if(_c66==0){
b=str+b;
}else{
b=b.slice(0,_c66)+str+b.slice(_c66);
}
this.length=b.length;
return this;
};
this.toString=function(){
return b;
};
if(str){
this.append(str);
}
};
}
if(!dojo._hasResource["dojox.string.tokenize"]){
dojo._hasResource["dojox.string.tokenize"]=true;
dojo.provide("dojox.string.tokenize");
dojox.string.tokenize=function(str,re,_c67,_c68){
var _c69=[];
var _c6a,_c6b,_c6c=0;
while(_c6a=re.exec(str)){
_c6b=str.slice(_c6c,re.lastIndex-_c6a[0].length);
if(_c6b.length){
_c69.push(_c6b);
}
if(_c67){
if(dojo.isOpera){
var copy=_c6a.slice(0);
while(copy.length<_c6a.length){
copy.push(null);
}
_c6a=copy;
}
var _c6d=_c67.apply(_c68,_c6a.slice(1).concat(_c69.length));
if(typeof _c6d!="undefined"){
_c69.push(_c6d);
}
}
_c6c=re.lastIndex;
}
_c6b=str.slice(_c6c);
if(_c6b.length){
_c69.push(_c6b);
}
return _c69;
};
}
if(!dojo._hasResource["dojox.dtl._base"]){
dojo._hasResource["dojox.dtl._base"]=true;
dojo.provide("dojox.dtl._base");
dojo.experimental("dojox.dtl");
(function(){
var dd=dojox.dtl;
dd.TOKEN_BLOCK=-1;
dd.TOKEN_VAR=-2;
dd.TOKEN_COMMENT=-3;
dd.TOKEN_TEXT=3;
dd._Context=dojo.extend(function(dict){
if(dict){
dojo._mixin(this,dict);
if(dict.get){
this._getter=dict.get;
delete this.get;
}
}
},{push:function(){
var last=this;
var _c6e=dojo.delegate(this);
_c6e.pop=function(){
return last;
};
return _c6e;
},pop:function(){
throw new Error("pop() called on empty Context");
},get:function(key,_c6f){
var n=this._normalize;
if(this._getter){
var got=this._getter(key);
if(typeof got!="undefined"){
return n(got);
}
}
if(typeof this[key]!="undefined"){
return n(this[key]);
}
return _c6f;
},_normalize:function(_c70){
if(_c70 instanceof Date){
_c70.year=_c70.getFullYear();
_c70.month=_c70.getMonth()+1;
_c70.day=_c70.getDate();
_c70.date=_c70.year+"-"+("0"+_c70.month).slice(-2)+"-"+("0"+_c70.day).slice(-2);
_c70.hour=_c70.getHours();
_c70.minute=_c70.getMinutes();
_c70.second=_c70.getSeconds();
_c70.microsecond=_c70.getMilliseconds();
}
return _c70;
},update:function(dict){
var _c71=this.push();
if(dict){
dojo._mixin(this,dict);
}
return _c71;
}});
var _c72=/("(?:[^"\\]*(?:\\.[^"\\]*)*)"|'(?:[^'\\]*(?:\\.[^'\\]*)*)'|[^\s]+)/g;
var _c73=/\s+/g;
var _c74=function(_c75,_c76){
_c75=_c75||_c73;
if(!(_c75 instanceof RegExp)){
_c75=new RegExp(_c75,"g");
}
if(!_c75.global){
throw new Error("You must use a globally flagged RegExp with split "+_c75);
}
_c75.exec("");
var part,_c77=[],_c78=0,i=0;
while(part=_c75.exec(this)){
_c77.push(this.slice(_c78,_c75.lastIndex-part[0].length));
_c78=_c75.lastIndex;
if(_c76&&(++i>_c76-1)){
break;
}
}
_c77.push(this.slice(_c78));
return _c77;
};
dd.Token=function(_c79,_c7a){
this.token_type=_c79;
this.contents=new String(dojo.trim(_c7a));
this.contents.split=_c74;
this.split=function(){
return String.prototype.split.apply(this.contents,arguments);
};
};
dd.Token.prototype.split_contents=function(_c7b){
var bit,bits=[],i=0;
_c7b=_c7b||999;
while(i++<_c7b&&(bit=_c72.exec(this.contents))){
bit=bit[0];
if(bit.charAt(0)=="\""&&bit.slice(-1)=="\""){
bits.push("\""+bit.slice(1,-1).replace("\\\"","\"").replace("\\\\","\\")+"\"");
}else{
if(bit.charAt(0)=="'"&&bit.slice(-1)=="'"){
bits.push("'"+bit.slice(1,-1).replace("\\'","'").replace("\\\\","\\")+"'");
}else{
bits.push(bit);
}
}
}
return bits;
};
var ddt=dd.text={_get:function(_c7c,name,_c7d){
var _c7e=dd.register.get(_c7c,name.toLowerCase(),_c7d);
if(!_c7e){
if(!_c7d){
throw new Error("No tag found for "+name);
}
return null;
}
var fn=_c7e[1];
var _c7f=_c7e[2];
var _c80;
if(fn.indexOf(":")!=-1){
_c80=fn.split(":");
fn=_c80.pop();
}
dojo["require"](_c7f);
var _c81=dojo.getObject(_c7f);
return _c81[fn||name]||_c81[name+"_"]||_c81[fn+"_"];
},getTag:function(name,_c82){
return ddt._get("tag",name,_c82);
},getFilter:function(name,_c83){
return ddt._get("filter",name,_c83);
},getTemplate:function(file){
return new dd.Template(ddt.getTemplateString(file));
},getTemplateString:function(file){
return dojo._getText(file.toString())||"";
},_resolveLazy:function(_c84,sync,json){
if(sync){
if(json){
return dojo.fromJson(dojo._getText(_c84))||{};
}else{
return dd.text.getTemplateString(_c84);
}
}else{
return dojo.xhrGet({handleAs:(json)?"json":"text",url:_c84});
}
},_resolveTemplateArg:function(arg,sync){
if(ddt._isTemplate(arg)){
if(!sync){
var d=new dojo.Deferred();
d.callback(arg);
return d;
}
return arg;
}
return ddt._resolveLazy(arg,sync);
},_isTemplate:function(arg){
return (typeof arg=="undefined")||(typeof arg=="string"&&(arg.match(/^\s*[<{]/)||arg.indexOf(" ")!=-1));
},_resolveContextArg:function(arg,sync){
if(arg.constructor==Object){
if(!sync){
var d=new dojo.Deferred;
d.callback(arg);
return d;
}
return arg;
}
return ddt._resolveLazy(arg,sync,true);
},_re:/(?:\{\{\s*(.+?)\s*\}\}|\{%\s*(load\s*)?(.+?)\s*%\})/g,tokenize:function(str){
return dojox.string.tokenize(str,ddt._re,ddt._parseDelims);
},_parseDelims:function(varr,load,tag){
if(varr){
return [dd.TOKEN_VAR,varr];
}else{
if(load){
var _c85=dojo.trim(tag).split(/\s+/g);
for(var i=0,part;part=_c85[i];i++){
dojo["require"](part);
}
}else{
return [dd.TOKEN_BLOCK,tag];
}
}
}};
dd.Template=dojo.extend(function(_c86,_c87){
var str=_c87?_c86:ddt._resolveTemplateArg(_c86,true)||"";
var _c88=ddt.tokenize(str);
var _c89=new dd._Parser(_c88);
this.nodelist=_c89.parse();
},{update:function(node,_c8a){
return ddt._resolveContextArg(_c8a).addCallback(this,function(_c8b){
var _c8c=this.render(new dd._Context(_c8b));
if(node.forEach){
node.forEach(function(item){
item.innerHTML=_c8c;
});
}else{
dojo.byId(node).innerHTML=_c8c;
}
return this;
});
},render:function(_c8d,_c8e){
_c8e=_c8e||this.getBuffer();
_c8d=_c8d||new dd._Context({});
return this.nodelist.render(_c8d,_c8e)+"";
},getBuffer:function(){
return new dojox.string.Builder();
}});
var qfRe=/\{\{\s*(.+?)\s*\}\}/g;
dd.quickFilter=function(str){
if(!str){
return new dd._NodeList();
}
if(str.indexOf("{%")==-1){
return new dd._QuickNodeList(dojox.string.tokenize(str,qfRe,function(_c8f){
return new dd._Filter(_c8f);
}));
}
};
dd._QuickNodeList=dojo.extend(function(_c90){
this.contents=_c90;
},{render:function(_c91,_c92){
for(var i=0,l=this.contents.length;i<l;i++){
if(this.contents[i].resolve){
_c92=_c92.concat(this.contents[i].resolve(_c91));
}else{
_c92=_c92.concat(this.contents[i]);
}
}
return _c92;
},dummyRender:function(_c93){
return this.render(_c93,dd.Template.prototype.getBuffer()).toString();
},clone:function(_c94){
return this;
}});
dd._Filter=dojo.extend(function(_c95){
if(!_c95){
throw new Error("Filter must be called with variable name");
}
this.contents=_c95;
var _c96=this._cache[_c95];
if(_c96){
this.key=_c96[0];
this.filters=_c96[1];
}else{
this.filters=[];
dojox.string.tokenize(_c95,this._re,this._tokenize,this);
this._cache[_c95]=[this.key,this.filters];
}
},{_cache:{},_re:/(?:^_\("([^\\"]*(?:\\.[^\\"])*)"\)|^"([^\\"]*(?:\\.[^\\"]*)*)"|^([a-zA-Z0-9_.]+)|\|(\w+)(?::(?:_\("([^\\"]*(?:\\.[^\\"])*)"\)|"([^\\"]*(?:\\.[^\\"]*)*)"|([a-zA-Z0-9_.]+)|'([^\\']*(?:\\.[^\\']*)*)'))?|^'([^\\']*(?:\\.[^\\']*)*)')/g,_values:{0:"\"",1:"\"",2:"",8:"\""},_args:{4:"\"",5:"\"",6:"",7:"'"},_tokenize:function(){
var pos,arg;
for(var i=0,has=[];i<arguments.length;i++){
has[i]=(typeof arguments[i]!="undefined"&&typeof arguments[i]=="string"&&arguments[i]);
}
if(!this.key){
for(pos in this._values){
if(has[pos]){
this.key=this._values[pos]+arguments[pos]+this._values[pos];
break;
}
}
}else{
for(pos in this._args){
if(has[pos]){
var _c97=arguments[pos];
if(this._args[pos]=="'"){
_c97=_c97.replace(/\\'/g,"'");
}else{
if(this._args[pos]=="\""){
_c97=_c97.replace(/\\"/g,"\"");
}
}
arg=[!this._args[pos],_c97];
break;
}
}
var fn=ddt.getFilter(arguments[3]);
if(!dojo.isFunction(fn)){
throw new Error(arguments[3]+" is not registered as a filter");
}
this.filters.push([fn,arg]);
}
},getExpression:function(){
return this.contents;
},resolve:function(_c98){
if(typeof this.key=="undefined"){
return "";
}
var str=this.resolvePath(this.key,_c98);
for(var i=0,_c99;_c99=this.filters[i];i++){
if(_c99[1]){
if(_c99[1][0]){
str=_c99[0](str,this.resolvePath(_c99[1][1],_c98));
}else{
str=_c99[0](str,_c99[1][1]);
}
}else{
str=_c99[0](str);
}
}
return str;
},resolvePath:function(path,_c9a){
var _c9b,_c9c;
var _c9d=path.charAt(0);
var last=path.slice(-1);
if(!isNaN(parseInt(_c9d))){
_c9b=(path.indexOf(".")==-1)?parseInt(path):parseFloat(path);
}else{
if(_c9d=="\""&&_c9d==last){
_c9b=path.slice(1,-1);
}else{
if(path=="true"){
return true;
}
if(path=="false"){
return false;
}
if(path=="null"||path=="None"){
return null;
}
_c9c=path.split(".");
_c9b=_c9a.get(_c9c[0]);
if(dojo.isFunction(_c9b)){
var self=_c9a.getThis&&_c9a.getThis();
if(_c9b.alters_data){
_c9b="";
}else{
if(self){
_c9b=_c9b.call(self);
}else{
_c9b="";
}
}
}
for(var i=1;i<_c9c.length;i++){
var part=_c9c[i];
if(_c9b){
var base=_c9b;
if(dojo.isObject(_c9b)&&part=="items"&&typeof _c9b[part]=="undefined"){
var _c9e=[];
for(var key in _c9b){
_c9e.push([key,_c9b[key]]);
}
_c9b=_c9e;
continue;
}
if(_c9b.get&&dojo.isFunction(_c9b.get)&&_c9b.get.safe){
_c9b=_c9b.get(part);
}else{
if(typeof _c9b[part]=="undefined"){
_c9b=_c9b[part];
break;
}else{
_c9b=_c9b[part];
}
}
if(dojo.isFunction(_c9b)){
if(_c9b.alters_data){
_c9b="";
}else{
_c9b=_c9b.call(base);
}
}else{
if(_c9b instanceof Date){
_c9b=dd._Context.prototype._normalize(_c9b);
}
}
}else{
return "";
}
}
}
}
return _c9b;
}});
dd._TextNode=dd._Node=dojo.extend(function(obj){
this.contents=obj;
},{set:function(data){
this.contents=data;
return this;
},render:function(_c9f,_ca0){
return _ca0.concat(this.contents);
},isEmpty:function(){
return !dojo.trim(this.contents);
},clone:function(){
return this;
}});
dd._NodeList=dojo.extend(function(_ca1){
this.contents=_ca1||[];
this.last="";
},{push:function(node){
this.contents.push(node);
return this;
},concat:function(_ca2){
this.contents=this.contents.concat(_ca2);
return this;
},render:function(_ca3,_ca4){
for(var i=0;i<this.contents.length;i++){
_ca4=this.contents[i].render(_ca3,_ca4);
if(!_ca4){
throw new Error("Template must return buffer");
}
}
return _ca4;
},dummyRender:function(_ca5){
return this.render(_ca5,dd.Template.prototype.getBuffer()).toString();
},unrender:function(){
return arguments[1];
},clone:function(){
return this;
},rtrim:function(){
while(1){
i=this.contents.length-1;
if(this.contents[i] instanceof dd._TextNode&&this.contents[i].isEmpty()){
this.contents.pop();
}else{
break;
}
}
return this;
}});
dd._VarNode=dojo.extend(function(str){
this.contents=new dd._Filter(str);
},{render:function(_ca6,_ca7){
var str=this.contents.resolve(_ca6);
if(!str.safe){
str=dd._base.escape(""+str);
}
return _ca7.concat(str);
}});
dd._noOpNode=new function(){
this.render=this.unrender=function(){
return arguments[1];
};
this.clone=function(){
return this;
};
};
dd._Parser=dojo.extend(function(_ca8){
this.contents=_ca8;
},{i:0,parse:function(_ca9){
var _caa={},_cab;
_ca9=_ca9||[];
for(var i=0;i<_ca9.length;i++){
_caa[_ca9[i]]=true;
}
var _cac=new dd._NodeList();
while(this.i<this.contents.length){
_cab=this.contents[this.i++];
if(typeof _cab=="string"){
_cac.push(new dd._TextNode(_cab));
}else{
var type=_cab[0];
var text=_cab[1];
if(type==dd.TOKEN_VAR){
_cac.push(new dd._VarNode(text));
}else{
if(type==dd.TOKEN_BLOCK){
if(_caa[text]){
--this.i;
return _cac;
}
var cmd=text.split(/\s+/g);
if(cmd.length){
cmd=cmd[0];
var fn=ddt.getTag(cmd);
if(fn){
_cac.push(fn(this,new dd.Token(type,text)));
}
}
}
}
}
}
if(_ca9.length){
throw new Error("Could not find closing tag(s): "+_ca9.toString());
}
this.contents.length=0;
return _cac;
},next_token:function(){
var _cad=this.contents[this.i++];
return new dd.Token(_cad[0],_cad[1]);
},delete_first_token:function(){
this.i++;
},skip_past:function(_cae){
while(this.i<this.contents.length){
var _caf=this.contents[this.i++];
if(_caf[0]==dd.TOKEN_BLOCK&&_caf[1]==_cae){
return;
}
}
throw new Error("Unclosed tag found when looking for "+_cae);
},create_variable_node:function(expr){
return new dd._VarNode(expr);
},create_text_node:function(expr){
return new dd._TextNode(expr||"");
},getTemplate:function(file){
return new dd.Template(file);
}});
dd.register={_registry:{attributes:[],tags:[],filters:[]},get:function(_cb0,name){
var _cb1=dd.register._registry[_cb0+"s"];
for(var i=0,_cb2;_cb2=_cb1[i];i++){
if(typeof _cb2[0]=="string"){
if(_cb2[0]==name){
return _cb2;
}
}else{
if(name.match(_cb2[0])){
return _cb2;
}
}
}
},getAttributeTags:function(){
var tags=[];
var _cb3=dd.register._registry.attributes;
for(var i=0,_cb4;_cb4=_cb3[i];i++){
if(_cb4.length==3){
tags.push(_cb4);
}else{
var fn=dojo.getObject(_cb4[1]);
if(fn&&dojo.isFunction(fn)){
_cb4.push(fn);
tags.push(_cb4);
}
}
}
return tags;
},_any:function(type,base,_cb5){
for(var path in _cb5){
for(var i=0,fn;fn=_cb5[path][i];i++){
var key=fn;
if(dojo.isArray(fn)){
key=fn[0];
fn=fn[1];
}
if(typeof key=="string"){
if(key.substr(0,5)=="attr:"){
var attr=fn;
if(attr.substr(0,5)=="attr:"){
attr=attr.slice(5);
}
dd.register._registry.attributes.push([attr.toLowerCase(),base+"."+path+"."+attr]);
}
key=key.toLowerCase();
}
dd.register._registry[type].push([key,fn,base+"."+path]);
}
}
},tags:function(base,_cb6){
dd.register._any("tags",base,_cb6);
},filters:function(base,_cb7){
dd.register._any("filters",base,_cb7);
}};
var _cb8=/&/g;
var _cb9=/</g;
var _cba=/>/g;
var _cbb=/'/g;
var _cbc=/"/g;
dd._base.escape=function(_cbd){
return dd.mark_safe(_cbd.replace(_cb8,"&amp;").replace(_cb9,"&lt;").replace(_cba,"&gt;").replace(_cbc,"&quot;").replace(_cbb,"&#39;"));
};
dd._base.safe=function(_cbe){
if(typeof _cbe=="string"){
_cbe=new String(_cbe);
}
if(typeof _cbe=="object"){
_cbe.safe=true;
}
return _cbe;
};
dd.mark_safe=dd._base.safe;
dd.register.tags("dojox.dtl.tag",{"date":["now"],"logic":["if","for","ifequal","ifnotequal"],"loader":["extends","block","include","load","ssi"],"misc":["comment","debug","filter","firstof","spaceless","templatetag","widthratio","with"],"loop":["cycle","ifchanged","regroup"]});
dd.register.filters("dojox.dtl.filter",{"dates":["date","time","timesince","timeuntil"],"htmlstrings":["linebreaks","linebreaksbr","removetags","striptags"],"integers":["add","get_digit"],"lists":["dictsort","dictsortreversed","first","join","length","length_is","random","slice","unordered_list"],"logic":["default","default_if_none","divisibleby","yesno"],"misc":["filesizeformat","pluralize","phone2numeric","pprint"],"strings":["addslashes","capfirst","center","cut","fix_ampersands","floatformat","iriencode","linenumbers","ljust","lower","make_list","rjust","slugify","stringformat","title","truncatewords","truncatewords_html","upper","urlencode","urlize","urlizetrunc","wordcount","wordwrap"]});
dd.register.filters("dojox.dtl",{"_base":["escape","safe"]});
})();
}
if(!dojo._hasResource["dojox.dtl"]){
dojo._hasResource["dojox.dtl"]=true;
dojo.provide("dojox.dtl");
}
if(!dojo._hasResource["dojox.dtl.filter.htmlstrings"]){
dojo._hasResource["dojox.dtl.filter.htmlstrings"]=true;
dojo.provide("dojox.dtl.filter.htmlstrings");
dojo.mixin(dojox.dtl.filter.htmlstrings,{_linebreaksrn:/(\r\n|\n\r)/g,_linebreaksn:/\n{2,}/g,_linebreakss:/(^\s+|\s+$)/g,_linebreaksbr:/\n/g,_removetagsfind:/[a-z0-9]+/g,_striptags:/<[^>]*?>/g,linebreaks:function(_cbf){
var _cc0=[];
var dh=dojox.dtl.filter.htmlstrings;
_cbf=_cbf.replace(dh._linebreaksrn,"\n");
var _cc1=_cbf.split(dh._linebreaksn);
for(var i=0;i<_cc1.length;i++){
var part=_cc1[i].replace(dh._linebreakss,"").replace(dh._linebreaksbr,"<br />");
_cc0.push("<p>"+part+"</p>");
}
return _cc0.join("\n\n");
},linebreaksbr:function(_cc2){
var dh=dojox.dtl.filter.htmlstrings;
return _cc2.replace(dh._linebreaksrn,"\n").replace(dh._linebreaksbr,"<br />");
},removetags:function(_cc3,arg){
var dh=dojox.dtl.filter.htmlstrings;
var tags=[];
var _cc4;
while(_cc4=dh._removetagsfind.exec(arg)){
tags.push(_cc4[0]);
}
tags="("+tags.join("|")+")";
return _cc3.replace(new RegExp("</?s*"+tags+"s*[^>]*>","gi"),"");
},striptags:function(_cc5){
return _cc5.replace(dojox.dtl.filter.htmlstrings._striptags,"");
}});
}
if(!dojo._hasResource["dojox.string.sprintf"]){
dojo._hasResource["dojox.string.sprintf"]=true;
dojo.provide("dojox.string.sprintf");
dojox.string.sprintf=function(_cc6,_cc7){
for(var args=[],i=1;i<arguments.length;i++){
args.push(arguments[i]);
}
var _cc8=new dojox.string.sprintf.Formatter(_cc6);
return _cc8.format.apply(_cc8,args);
};
dojox.string.sprintf.Formatter=function(_cc9){
var _cca=[];
this._mapped=false;
this._format=_cc9;
this._tokens=dojox.string.tokenize(_cc9,this._re,this._parseDelim,this);
};
dojo.extend(dojox.string.sprintf.Formatter,{_re:/\%(?:\(([\w_]+)\)|([1-9]\d*)\$)?([0 +\-\#]*)(\*|\d+)?(\.)?(\*|\d+)?[hlL]?([\%scdeEfFgGiouxX])/g,_parseDelim:function(_ccb,_ccc,_ccd,_cce,_ccf,_cd0,_cd1){
if(_ccb){
this._mapped=true;
}
return {mapping:_ccb,intmapping:_ccc,flags:_ccd,_minWidth:_cce,period:_ccf,_precision:_cd0,specifier:_cd1};
},_specifiers:{b:{base:2,isInt:true},o:{base:8,isInt:true},x:{base:16,isInt:true},X:{extend:["x"],toUpper:true},d:{base:10,isInt:true},i:{extend:["d"]},u:{extend:["d"],isUnsigned:true},c:{setArg:function(_cd2){
if(!isNaN(_cd2.arg)){
var num=parseInt(_cd2.arg);
if(num<0||num>127){
throw new Error("invalid character code passed to %c in sprintf");
}
_cd2.arg=isNaN(num)?""+num:String.fromCharCode(num);
}
}},s:{setMaxWidth:function(_cd3){
_cd3.maxWidth=(_cd3.period==".")?_cd3.precision:-1;
}},e:{isDouble:true,doubleNotation:"e"},E:{extend:["e"],toUpper:true},f:{isDouble:true,doubleNotation:"f"},F:{extend:["f"]},g:{isDouble:true,doubleNotation:"g"},G:{extend:["g"],toUpper:true}},format:function(_cd4){
if(this._mapped&&typeof _cd4!="object"){
throw new Error("format requires a mapping");
}
var str="";
var _cd5=0;
for(var i=0,_cd6;i<this._tokens.length;i++){
_cd6=this._tokens[i];
if(typeof _cd6=="string"){
str+=_cd6;
}else{
if(this._mapped){
if(typeof _cd4[_cd6.mapping]=="undefined"){
throw new Error("missing key "+_cd6.mapping);
}
_cd6.arg=_cd4[_cd6.mapping];
}else{
if(_cd6.intmapping){
var _cd5=parseInt(_cd6.intmapping)-1;
}
if(_cd5>=arguments.length){
throw new Error("got "+arguments.length+" printf arguments, insufficient for '"+this._format+"'");
}
_cd6.arg=arguments[_cd5++];
}
if(!_cd6.compiled){
_cd6.compiled=true;
_cd6.sign="";
_cd6.zeroPad=false;
_cd6.rightJustify=false;
_cd6.alternative=false;
var _cd7={};
for(var fi=_cd6.flags.length;fi--;){
var flag=_cd6.flags.charAt(fi);
_cd7[flag]=true;
switch(flag){
case " ":
_cd6.sign=" ";
break;
case "+":
_cd6.sign="+";
break;
case "0":
_cd6.zeroPad=(_cd7["-"])?false:true;
break;
case "-":
_cd6.rightJustify=true;
_cd6.zeroPad=false;
break;
case "#":
_cd6.alternative=true;
break;
default:
throw Error("bad formatting flag '"+_cd6.flags.charAt(fi)+"'");
}
}
_cd6.minWidth=(_cd6._minWidth)?parseInt(_cd6._minWidth):0;
_cd6.maxWidth=-1;
_cd6.toUpper=false;
_cd6.isUnsigned=false;
_cd6.isInt=false;
_cd6.isDouble=false;
_cd6.precision=1;
if(_cd6.period=="."){
if(_cd6._precision){
_cd6.precision=parseInt(_cd6._precision);
}else{
_cd6.precision=0;
}
}
var _cd8=this._specifiers[_cd6.specifier];
if(typeof _cd8=="undefined"){
throw new Error("unexpected specifier '"+_cd6.specifier+"'");
}
if(_cd8.extend){
dojo.mixin(_cd8,this._specifiers[_cd8.extend]);
delete _cd8.extend;
}
dojo.mixin(_cd6,_cd8);
}
if(typeof _cd6.setArg=="function"){
_cd6.setArg(_cd6);
}
if(typeof _cd6.setMaxWidth=="function"){
_cd6.setMaxWidth(_cd6);
}
if(_cd6._minWidth=="*"){
if(this._mapped){
throw new Error("* width not supported in mapped formats");
}
_cd6.minWidth=parseInt(arguments[_cd5++]);
if(isNaN(_cd6.minWidth)){
throw new Error("the argument for * width at position "+_cd5+" is not a number in "+this._format);
}
if(_cd6.minWidth<0){
_cd6.rightJustify=true;
_cd6.minWidth=-_cd6.minWidth;
}
}
if(_cd6._precision=="*"&&_cd6.period=="."){
if(this._mapped){
throw new Error("* precision not supported in mapped formats");
}
_cd6.precision=parseInt(arguments[_cd5++]);
if(isNaN(_cd6.precision)){
throw Error("the argument for * precision at position "+_cd5+" is not a number in "+this._format);
}
if(_cd6.precision<0){
_cd6.precision=1;
_cd6.period="";
}
}
if(_cd6.isInt){
if(_cd6.period=="."){
_cd6.zeroPad=false;
}
this.formatInt(_cd6);
}else{
if(_cd6.isDouble){
if(_cd6.period!="."){
_cd6.precision=6;
}
this.formatDouble(_cd6);
}
}
this.fitField(_cd6);
str+=""+_cd6.arg;
}
}
return str;
},_zeros10:"0000000000",_spaces10:"          ",formatInt:function(_cd9){
var i=parseInt(_cd9.arg);
if(!isFinite(i)){
if(typeof _cd9.arg!="number"){
throw new Error("format argument '"+_cd9.arg+"' not an integer; parseInt returned "+i);
}
i=0;
}
if(i<0&&(_cd9.isUnsigned||_cd9.base!=10)){
i=4294967295+i+1;
}
if(i<0){
_cd9.arg=(-i).toString(_cd9.base);
this.zeroPad(_cd9);
_cd9.arg="-"+_cd9.arg;
}else{
_cd9.arg=i.toString(_cd9.base);
if(!i&&!_cd9.precision){
_cd9.arg="";
}else{
this.zeroPad(_cd9);
}
if(_cd9.sign){
_cd9.arg=_cd9.sign+_cd9.arg;
}
}
if(_cd9.base==16){
if(_cd9.alternative){
_cd9.arg="0x"+_cd9.arg;
}
_cd9.arg=_cd9.toUpper?_cd9.arg.toUpperCase():_cd9.arg.toLowerCase();
}
if(_cd9.base==8){
if(_cd9.alternative&&_cd9.arg.charAt(0)!="0"){
_cd9.arg="0"+_cd9.arg;
}
}
},formatDouble:function(_cda){
var f=parseFloat(_cda.arg);
if(!isFinite(f)){
if(typeof _cda.arg!="number"){
throw new Error("format argument '"+_cda.arg+"' not a float; parseFloat returned "+f);
}
f=0;
}
switch(_cda.doubleNotation){
case "e":
_cda.arg=f.toExponential(_cda.precision);
break;
case "f":
_cda.arg=f.toFixed(_cda.precision);
break;
case "g":
if(Math.abs(f)<0.0001){
_cda.arg=f.toExponential(_cda.precision>0?_cda.precision-1:_cda.precision);
}else{
_cda.arg=f.toPrecision(_cda.precision);
}
if(!_cda.alternative){
_cda.arg=_cda.arg.replace(/(\..*[^0])0*/,"$1");
_cda.arg=_cda.arg.replace(/\.0*e/,"e").replace(/\.0$/,"");
}
break;
default:
throw new Error("unexpected double notation '"+_cda.doubleNotation+"'");
}
_cda.arg=_cda.arg.replace(/e\+(\d)$/,"e+0$1").replace(/e\-(\d)$/,"e-0$1");
if(dojo.isOpera){
_cda.arg=_cda.arg.replace(/^\./,"0.");
}
if(_cda.alternative){
_cda.arg=_cda.arg.replace(/^(\d+)$/,"$1.");
_cda.arg=_cda.arg.replace(/^(\d+)e/,"$1.e");
}
if(f>=0&&_cda.sign){
_cda.arg=_cda.sign+_cda.arg;
}
_cda.arg=_cda.toUpper?_cda.arg.toUpperCase():_cda.arg.toLowerCase();
},zeroPad:function(_cdb,_cdc){
_cdc=(arguments.length==2)?_cdc:_cdb.precision;
if(typeof _cdb.arg!="string"){
_cdb.arg=""+_cdb.arg;
}
var _cdd=_cdc-10;
while(_cdb.arg.length<_cdd){
_cdb.arg=(_cdb.rightJustify)?_cdb.arg+this._zeros10:this._zeros10+_cdb.arg;
}
var pad=_cdc-_cdb.arg.length;
_cdb.arg=(_cdb.rightJustify)?_cdb.arg+this._zeros10.substring(0,pad):this._zeros10.substring(0,pad)+_cdb.arg;
},fitField:function(_cde){
if(_cde.maxWidth>=0&&_cde.arg.length>_cde.maxWidth){
return _cde.arg.substring(0,_cde.maxWidth);
}
if(_cde.zeroPad){
this.zeroPad(_cde,_cde.minWidth);
return;
}
this.spacePad(_cde);
},spacePad:function(_cdf,_ce0){
_ce0=(arguments.length==2)?_ce0:_cdf.minWidth;
if(typeof _cdf.arg!="string"){
_cdf.arg=""+_cdf.arg;
}
var _ce1=_ce0-10;
while(_cdf.arg.length<_ce1){
_cdf.arg=(_cdf.rightJustify)?_cdf.arg+this._spaces10:this._spaces10+_cdf.arg;
}
var pad=_ce0-_cdf.arg.length;
_cdf.arg=(_cdf.rightJustify)?_cdf.arg+this._spaces10.substring(0,pad):this._spaces10.substring(0,pad)+_cdf.arg;
}});
}
if(!dojo._hasResource["dojox.dtl.filter.strings"]){
dojo._hasResource["dojox.dtl.filter.strings"]=true;
dojo.provide("dojox.dtl.filter.strings");
dojo.mixin(dojox.dtl.filter.strings,{_urlquote:function(url,safe){
if(!safe){
safe="/";
}
return dojox.string.tokenize(url,/([^\w-_.])/g,function(_ce2){
if(safe.indexOf(_ce2)==-1){
if(_ce2==" "){
return "+";
}else{
return "%"+_ce2.charCodeAt(0).toString(16).toUpperCase();
}
}
return _ce2;
}).join("");
},addslashes:function(_ce3){
return _ce3.replace(/\\/g,"\\\\").replace(/"/g,"\\\"").replace(/'/g,"\\'");
},capfirst:function(_ce4){
_ce4=""+_ce4;
return _ce4.charAt(0).toUpperCase()+_ce4.substring(1);
},center:function(_ce5,arg){
arg=arg||_ce5.length;
_ce5=_ce5+"";
var diff=arg-_ce5.length;
if(diff%2){
_ce5=_ce5+" ";
diff-=1;
}
for(var i=0;i<diff;i+=2){
_ce5=" "+_ce5+" ";
}
return _ce5;
},cut:function(_ce6,arg){
arg=arg+""||"";
_ce6=_ce6+"";
return _ce6.replace(new RegExp(arg,"g"),"");
},_fix_ampersands:/&(?!(\w+|#\d+);)/g,fix_ampersands:function(_ce7){
return _ce7.replace(dojox.dtl.filter.strings._fix_ampersands,"&amp;");
},floatformat:function(_ce8,arg){
arg=parseInt(arg||-1,10);
_ce8=parseFloat(_ce8);
var m=_ce8-_ce8.toFixed(0);
if(!m&&arg<0){
return _ce8.toFixed();
}
_ce8=_ce8.toFixed(Math.abs(arg));
return (arg<0)?parseFloat(_ce8)+"":_ce8;
},iriencode:function(_ce9){
return dojox.dtl.filter.strings._urlquote(_ce9,"/#%[]=:;$&()+,!");
},linenumbers:function(_cea){
var df=dojox.dtl.filter;
var _ceb=_cea.split("\n");
var _cec=[];
var _ced=(_ceb.length+"").length;
for(var i=0,line;i<_ceb.length;i++){
line=_ceb[i];
_cec.push(df.strings.ljust(i+1,_ced)+". "+dojox.dtl._base.escape(line));
}
return _cec.join("\n");
},ljust:function(_cee,arg){
_cee=_cee+"";
arg=parseInt(arg,10);
while(_cee.length<arg){
_cee=_cee+" ";
}
return _cee;
},lower:function(_cef){
return (_cef+"").toLowerCase();
},make_list:function(_cf0){
var _cf1=[];
if(typeof _cf0=="number"){
_cf0=_cf0+"";
}
if(_cf0.charAt){
for(var i=0;i<_cf0.length;i++){
_cf1.push(_cf0.charAt(i));
}
return _cf1;
}
if(typeof _cf0=="object"){
for(var key in _cf0){
_cf1.push(_cf0[key]);
}
return _cf1;
}
return [];
},rjust:function(_cf2,arg){
_cf2=_cf2+"";
arg=parseInt(arg,10);
while(_cf2.length<arg){
_cf2=" "+_cf2;
}
return _cf2;
},slugify:function(_cf3){
_cf3=_cf3.replace(/[^\w\s-]/g,"").toLowerCase();
return _cf3.replace(/[\-\s]+/g,"-");
},_strings:{},stringformat:function(_cf4,arg){
arg=""+arg;
var _cf5=dojox.dtl.filter.strings._strings;
if(!_cf5[arg]){
_cf5[arg]=new dojox.string.sprintf.Formatter("%"+arg);
}
return _cf5[arg].format(_cf4);
},title:function(_cf6){
var last,_cf7="";
for(var i=0,_cf8;i<_cf6.length;i++){
_cf8=_cf6.charAt(i);
if(last==" "||last=="\n"||last=="\t"||!last){
_cf7+=_cf8.toUpperCase();
}else{
_cf7+=_cf8.toLowerCase();
}
last=_cf8;
}
return _cf7;
},_truncatewords:/[ \n\r\t]/,truncatewords:function(_cf9,arg){
arg=parseInt(arg,10);
if(!arg){
return _cf9;
}
for(var i=0,j=_cf9.length,_cfa=0,_cfb,last;i<_cf9.length;i++){
_cfb=_cf9.charAt(i);
if(dojox.dtl.filter.strings._truncatewords.test(last)){
if(!dojox.dtl.filter.strings._truncatewords.test(_cfb)){
++_cfa;
if(_cfa==arg){
return _cf9.substring(0,j+1);
}
}
}else{
if(!dojox.dtl.filter.strings._truncatewords.test(_cfb)){
j=i;
}
}
last=_cfb;
}
return _cf9;
},_truncate_words:/(&.*?;|<.*?>|(\w[\w\-]*))/g,_truncate_tag:/<(\/)?([^ ]+?)(?: (\/)| .*?)?>/,_truncate_singlets:{br:true,col:true,link:true,base:true,img:true,param:true,area:true,hr:true,input:true},truncatewords_html:function(_cfc,arg){
arg=parseInt(arg,10);
if(arg<=0){
return "";
}
var _cfd=dojox.dtl.filter.strings;
var _cfe=0;
var open=[];
var _cff=dojox.string.tokenize(_cfc,_cfd._truncate_words,function(all,word){
if(word){
++_cfe;
if(_cfe<arg){
return word;
}else{
if(_cfe==arg){
return word+" ...";
}
}
}
var tag=all.match(_cfd._truncate_tag);
if(!tag||_cfe>=arg){
return;
}
var _d00=tag[1];
var _d01=tag[2].toLowerCase();
var _d02=tag[3];
if(_d00||_cfd._truncate_singlets[_d01]){
}else{
if(_d00){
var i=dojo.indexOf(open,_d01);
if(i!=-1){
open=open.slice(i+1);
}
}else{
open.unshift(_d01);
}
}
return all;
}).join("");
_cff=_cff.replace(/\s+$/g,"");
for(var i=0,tag;tag=open[i];i++){
_cff+="</"+tag+">";
}
return _cff;
},upper:function(_d03){
return _d03.toUpperCase();
},urlencode:function(_d04){
return dojox.dtl.filter.strings._urlquote(_d04);
},_urlize:/^((?:[(>]|&lt;)*)(.*?)((?:[.,)>\n]|&gt;)*)$/,_urlize2:/^\S+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+$/,urlize:function(_d05){
return dojox.dtl.filter.strings.urlizetrunc(_d05);
},urlizetrunc:function(_d06,arg){
arg=parseInt(arg);
return dojox.string.tokenize(_d06,/(\S+)/g,function(word){
var _d07=dojox.dtl.filter.strings._urlize.exec(word);
if(!_d07){
return word;
}
var lead=_d07[1];
var _d08=_d07[2];
var _d09=_d07[3];
var _d0a=_d08.indexOf("www.")==0;
var _d0b=_d08.indexOf("@")!=-1;
var _d0c=_d08.indexOf(":")!=-1;
var _d0d=_d08.indexOf("http://")==0;
var _d0e=_d08.indexOf("https://")==0;
var _d0f=/[a-zA-Z0-9]/.test(_d08.charAt(0));
var _d10=_d08.substring(_d08.length-4);
var _d11=_d08;
if(arg>3){
_d11=_d11.substring(0,arg-3)+"...";
}
if(_d0a||(!_d0b&&!_d0d&&_d08.length&&_d0f&&(_d10==".org"||_d10==".net"||_d10==".com"))){
return "<a href=\"http://"+_d08+"\" rel=\"nofollow\">"+_d11+"</a>";
}else{
if(_d0d||_d0e){
return "<a href=\""+_d08+"\" rel=\"nofollow\">"+_d11+"</a>";
}else{
if(_d0b&&!_d0a&&!_d0c&&dojox.dtl.filter.strings._urlize2.test(_d08)){
return "<a href=\"mailto:"+_d08+"\">"+_d08+"</a>";
}
}
}
return word;
}).join("");
},wordcount:function(_d12){
_d12=dojo.trim(_d12);
if(!_d12){
return 0;
}
return _d12.split(/\s+/g).length;
},wordwrap:function(_d13,arg){
arg=parseInt(arg);
var _d14=[];
var _d15=_d13.split(/\s+/g);
if(_d15.length){
var word=_d15.shift();
_d14.push(word);
var pos=word.length-word.lastIndexOf("\n")-1;
for(var i=0;i<_d15.length;i++){
word=_d15[i];
if(word.indexOf("\n")!=-1){
var _d16=word.split(/\n/g);
}else{
var _d16=[word];
}
pos+=_d16[0].length+1;
if(arg&&pos>arg){
_d14.push("\n");
pos=_d16[_d16.length-1].length;
}else{
_d14.push(" ");
if(_d16.length>1){
pos=_d16[_d16.length-1].length;
}
}
_d14.push(word);
}
}
return _d14.join("");
}});
}
if(!dojo._hasResource["dojox.widget.Wizard"]){
dojo._hasResource["dojox.widget.Wizard"]=true;
dojo.provide("dojox.widget.Wizard");
dojo.declare("dojox.widget.Wizard",[dijit.layout.StackContainer,dijit._Templated],{widgetsInTemplate:true,templateString:dojo.cache("dojox.widget","Wizard/Wizard.html","<div class=\"dojoxWizard\" dojoAttachPoint=\"wizardNode\">\r\n    <div class=\"dojoxWizardContainer\" dojoAttachPoint=\"containerNode\"></div>\r\n    <div class=\"dojoxWizardButtons\" dojoAttachPoint=\"wizardNav\">\r\n        <button dojoType=\"dijit.form.Button\" type=\"button\" dojoAttachPoint=\"previousButton\">${previousButtonLabel}</button>\r\n        <button dojoType=\"dijit.form.Button\" type=\"button\" dojoAttachPoint=\"nextButton\">${nextButtonLabel}</button>\r\n        <button dojoType=\"dijit.form.Button\" type=\"button\" dojoAttachPoint=\"doneButton\" style=\"display:none\">${doneButtonLabel}</button>\r\n        <button dojoType=\"dijit.form.Button\" type=\"button\" dojoAttachPoint=\"cancelButton\">${cancelButtonLabel}</button>\r\n    </div>\r\n</div>\r\n"),nextButtonLabel:"",previousButtonLabel:"",cancelButtonLabel:"",doneButtonLabel:"",cancelFunction:null,hideDisabled:false,postMixInProperties:function(){
this.inherited(arguments);
var _d17=dojo.mixin({cancel:dojo.i18n.getLocalization("dijit","common",this.lang).buttonCancel},dojo.i18n.getLocalization("dojox.widget","Wizard",this.lang));
var prop;
for(prop in _d17){
if(!this[prop+"ButtonLabel"]){
this[prop+"ButtonLabel"]=_d17[prop];
}
}
},startup:function(){
if(this._started){
return;
}
this.inherited(arguments);
this.connect(this.nextButton,"onClick","_forward");
this.connect(this.previousButton,"onClick","back");
if(this.cancelFunction){
if(dojo.isString(this.cancelFunction)){
this.cancelFunction=dojo.getObject(this.cancelFunction);
}
this.connect(this.cancelButton,"onClick",this.cancelFunction);
}else{
this.cancelButton.domNode.style.display="none";
}
this.connect(this.doneButton,"onClick","done");
this._subscription=dojo.subscribe(this.id+"-selectChild",dojo.hitch(this,"_checkButtons"));
this._started=true;
},resize:function(){
this.inherited(arguments);
this._checkButtons();
},_checkButtons:function(){
var sw=this.selectedChildWidget;
var _d18=sw.isLastChild;
this.nextButton.set("disabled",_d18);
this._setButtonClass(this.nextButton);
if(sw.doneFunction){
this.doneButton.domNode.style.display="";
if(_d18){
this.nextButton.domNode.style.display="none";
}
}else{
this.doneButton.domNode.style.display="none";
}
this.previousButton.set("disabled",!this.selectedChildWidget.canGoBack);
this._setButtonClass(this.previousButton);
},_setButtonClass:function(_d19){
_d19.domNode.style.display=(this.hideDisabled&&_d19.disabled)?"none":"";
},_forward:function(){
if(this.selectedChildWidget._checkPass()){
this.forward();
}
},done:function(){
this.selectedChildWidget.done();
},destroy:function(){
dojo.unsubscribe(this._subscription);
this.inherited(arguments);
}});
dojo.declare("dojox.widget.WizardPane",dijit.layout.ContentPane,{canGoBack:true,passFunction:null,doneFunction:null,startup:function(){
this.inherited(arguments);
if(this.isFirstChild){
this.canGoBack=false;
}
if(dojo.isString(this.passFunction)){
this.passFunction=dojo.getObject(this.passFunction);
}
if(dojo.isString(this.doneFunction)&&this.doneFunction){
this.doneFunction=dojo.getObject(this.doneFunction);
}
},_onShow:function(){
if(this.isFirstChild){
this.canGoBack=false;
}
this.inherited(arguments);
},_checkPass:function(){
var r=true;
if(this.passFunction&&dojo.isFunction(this.passFunction)){
var _d1a=this.passFunction();
switch(typeof _d1a){
case "boolean":
r=_d1a;
break;
case "string":
alert(_d1a);
r=false;
break;
}
}
return r;
},done:function(){
if(this.doneFunction&&dojo.isFunction(this.doneFunction)){
this.doneFunction();
}
}});
}
if(!dojo._hasResource["dojox.widget.Standby"]){
dojo._hasResource["dojox.widget.Standby"]=true;
dojo.provide("dojox.widget.Standby");
dojo.experimental("dojox.widget.Standby");
dojo.declare("dojox.widget.Standby",[dijit._Widget,dijit._Templated],{templateString:"<div>"+"<div style=\"display: none; opacity: 0; z-index: 9999; "+"position: absolute; cursor:wait;\" dojoAttachPoint=\"_underlayNode\"></div>"+"<img src=\"${image}\" style=\"opacity: 0; display: none; z-index: -10000; "+"position: absolute; top: 0px; left: 0px; cursor:wait;\" "+"dojoAttachPoint=\"_imageNode\">"+"<div style=\"opacity: 0; display: none; z-index: -10000; position: absolute; "+"top: 0px;\" dojoAttachPoint=\"_textNode\"></div>"+"</div>",_underlayNode:null,_imageNode:null,_textNode:null,_centerNode:null,image:dojo.moduleUrl("dojox","widget/Standby/images/loading.gif").toString(),imageText:"Please Wait...",text:"Please wait...",centerIndicator:"image",_displayed:false,_resizeCheck:null,target:"",color:"#C0C0C0",duration:500,_started:false,_parent:null,zIndex:"auto",startup:function(args){
if(!this._started){
if(typeof this.target==="string"){
var w=dijit.byId(this.target);
if(w){
this.target=w.domNode;
}else{
this.target=dojo.byId(this.target);
}
}
if(this.text){
this._textNode.innerHTML=this.text;
}
if(this.centerIndicator==="image"){
this._centerNode=this._imageNode;
dojo.attr(this._imageNode,"src",this.image);
dojo.attr(this._imageNode,"alt",this.imageText);
}else{
this._centerNode=this._textNode;
}
dojo.style(this._underlayNode,{display:"none",backgroundColor:this.color});
dojo.style(this._centerNode,"display","none");
this.connect(this._underlayNode,"onclick","_ignore");
if(this.domNode.parentNode&&this.domNode.parentNode!=dojo.body()){
dojo.body().appendChild(this.domNode);
}
if(dojo.isIE==7){
this._ieFixNode=dojo.doc.createElement("div");
dojo.style(this._ieFixNode,{opacity:"0",zIndex:"-1000",position:"absolute",top:"-1000px"});
dojo.body().appendChild(this._ieFixNode);
}
}
},show:function(){
if(!this._displayed){
if(this._anim){
this._anim.stop();
delete this._anim;
}
this._displayed=true;
this._size();
this._disableOverflow();
this._fadeIn();
}
},hide:function(){
if(this._displayed){
if(this._anim){
this._anim.stop();
delete this._anim;
}
this._size();
this._fadeOut();
this._displayed=false;
if(this._resizeCheck!==null){
clearInterval(this._resizeCheck);
this._resizeCheck=null;
}
}
},isVisible:function(){
return this._displayed;
},onShow:function(){
},onHide:function(){
},uninitialize:function(){
this._displayed=false;
if(this._resizeCheck){
clearInterval(this._resizeCheck);
}
dojo.style(this._centerNode,"display","none");
dojo.style(this._underlayNode,"display","none");
if(dojo.isIE==7){
dojo.body().removeChild(this._ieFixNode);
delete this._ieFixNode;
}
if(this._anim){
this._anim.stop();
delete this._anim;
}
this.target=null;
this._imageNode=null;
this._textNode=null;
this._centerNode=null;
this.inherited(arguments);
},_size:function(){
if(this._displayed){
var dir=dojo.attr(dojo.body(),"dir");
if(dir){
dir=dir.toLowerCase();
}
var _d1b;
var _d1c=this._scrollerWidths();
var _d1d=this.target;
var _d1e=dojo.style(this._centerNode,"display");
dojo.style(this._centerNode,"display","block");
var box=dojo.position(_d1d,true);
if(_d1d===dojo.body()||_d1d===dojo.doc){
box=dojo.window.getBox();
box.x=box.l;
box.y=box.t;
}
var _d1f=dojo.marginBox(this._centerNode);
dojo.style(this._centerNode,"display",_d1e);
if(this._ieFixNode){
_d1b=-this._ieFixNode.offsetTop/1000;
box.x=Math.floor((box.x+0.9)/_d1b);
box.y=Math.floor((box.y+0.9)/_d1b);
box.w=Math.floor((box.w+0.9)/_d1b);
box.h=Math.floor((box.h+0.9)/_d1b);
}
var zi=dojo.style(_d1d,"zIndex");
var ziUl=zi;
var ziIn=zi;
if(this.zIndex==="auto"){
if(zi!="auto"){
ziUl=parseInt(ziUl,10)+1;
ziIn=parseInt(ziIn,10)+2;
}else{
var _d20=_d1d.parentNode;
var _d21=-100000;
while(_d20&&_d20!==dojo.body()){
zi=dojo.style(_d20,"zIndex");
if(!zi||zi==="auto"){
_d20=_d20.parentNode;
}else{
var _d22=parseInt(zi,10);
if(_d21<_d22){
_d21=_d22;
ziUl=_d22+1;
ziIn=_d22+2;
}
_d20=_d20.parentNode;
}
}
}
}else{
ziUl=parseInt(this.zIndex,10)+1;
ziIn=parseInt(this.zIndex,10)+2;
}
dojo.style(this._centerNode,"zIndex",ziIn);
dojo.style(this._underlayNode,"zIndex",ziUl);
var pn=_d1d.parentNode;
if(pn&&pn!==dojo.body()&&_d1d!==dojo.body()&&_d1d!==dojo.doc){
var obh=box.h;
var obw=box.w;
var _d23=dojo.position(pn,true);
if(this._ieFixNode){
_d1b=-this._ieFixNode.offsetTop/1000;
_d23.x=Math.floor((_d23.x+0.9)/_d1b);
_d23.y=Math.floor((_d23.y+0.9)/_d1b);
_d23.w=Math.floor((_d23.w+0.9)/_d1b);
_d23.h=Math.floor((_d23.h+0.9)/_d1b);
}
_d23.w-=pn.scrollHeight>pn.clientHeight&&pn.clientHeight>0?_d1c.v:0;
_d23.h-=pn.scrollWidth>pn.clientWidth&&pn.clientWidth>0?_d1c.h:0;
if(dir==="rtl"){
if(dojo.isOpera){
box.x+=pn.scrollHeight>pn.clientHeight&&pn.clientHeight>0?_d1c.v:0;
_d23.x+=pn.scrollHeight>pn.clientHeight&&pn.clientHeight>0?_d1c.v:0;
}else{
if(dojo.isIE){
_d23.x+=pn.scrollHeight>pn.clientHeight&&pn.clientHeight>0?_d1c.v:0;
}else{
if(dojo.isWebKit){
}
}
}
}
if(_d23.w<box.w){
box.w=box.w-_d23.w;
}
if(_d23.h<box.h){
box.h=box.h-_d23.h;
}
var _d24=_d23.y;
var _d25=_d23.y+_d23.h;
var bTop=box.y;
var _d26=box.y+obh;
var _d27=_d23.x;
var _d28=_d23.x+_d23.w;
var _d29=box.x;
var _d2a=box.x+obw;
var _d2b;
if(_d26>_d24&&bTop<_d24){
box.y=_d23.y;
_d2b=_d24-bTop;
var _d2c=obh-_d2b;
if(_d2c<_d23.h){
box.h=_d2c;
}else{
box.h-=2*(pn.scrollWidth>pn.clientWidth&&pn.clientWidth>0?_d1c.h:0);
}
}else{
if(bTop<_d25&&_d26>_d25){
box.h=_d25-bTop;
}else{
if(_d26<=_d24||bTop>=_d25){
box.h=0;
}
}
}
if(_d2a>_d27&&_d29<_d27){
box.x=_d23.x;
_d2b=_d27-_d29;
var _d2d=obw-_d2b;
if(_d2d<_d23.w){
box.w=_d2d;
}else{
box.w-=2*(pn.scrollHeight>pn.clientHeight&&pn.clientHeight>0?_d1c.w:0);
}
}else{
if(_d29<_d28&&_d2a>_d28){
box.w=_d28-_d29;
}else{
if(_d2a<=_d27||_d29>=_d28){
box.w=0;
}
}
}
}
if(box.h>0&&box.w>0){
dojo.style(this._underlayNode,{display:"block",width:box.w+"px",height:box.h+"px",top:box.y+"px",left:box.x+"px"});
var _d2e=["borderRadius","borderTopLeftRadius","borderTopRightRadius","borderBottomLeftRadius","borderBottomRightRadius"];
this._cloneStyles(_d2e);
if(!dojo.isIE){
_d2e=["MozBorderRadius","MozBorderRadiusTopleft","MozBorderRadiusTopright","MozBorderRadiusBottomleft","MozBorderRadiusBottomright","WebkitBorderRadius","WebkitBorderTopLeftRadius","WebkitBorderTopRightRadius","WebkitBorderBottomLeftRadius","WebkitBorderBottomRightRadius"];
this._cloneStyles(_d2e,this);
}
var _d2f=(box.h/2)-(_d1f.h/2);
var _d30=(box.w/2)-(_d1f.w/2);
if(box.h>=_d1f.h&&box.w>=_d1f.w){
dojo.style(this._centerNode,{top:(_d2f+box.y)+"px",left:(_d30+box.x)+"px",display:"block"});
}else{
dojo.style(this._centerNode,"display","none");
}
}else{
dojo.style(this._underlayNode,"display","none");
dojo.style(this._centerNode,"display","none");
}
if(this._resizeCheck===null){
var self=this;
this._resizeCheck=setInterval(function(){
self._size();
},100);
}
}
},_cloneStyles:function(list){
dojo.forEach(list,function(_d31){
dojo.style(this._underlayNode,_d31,dojo.style(this.target,_d31));
},this);
},_fadeIn:function(){
var self=this;
var _d32=dojo.animateProperty({duration:self.duration,node:self._underlayNode,properties:{opacity:{start:0,end:0.75}}});
var _d33=dojo.animateProperty({duration:self.duration,node:self._centerNode,properties:{opacity:{start:0,end:1}},onEnd:function(){
self.onShow();
delete self._anim;
}});
this._anim=dojo.fx.combine([_d32,_d33]);
this._anim.play();
},_fadeOut:function(){
var self=this;
var _d34=dojo.animateProperty({duration:self.duration,node:self._underlayNode,properties:{opacity:{start:0.75,end:0}},onEnd:function(){
dojo.style(this.node,{"display":"none","zIndex":"-1000"});
}});
var _d35=dojo.animateProperty({duration:self.duration,node:self._centerNode,properties:{opacity:{start:1,end:0}},onEnd:function(){
dojo.style(this.node,{"display":"none","zIndex":"-1000"});
self.onHide();
self._enableOverflow();
delete self._anim;
}});
this._anim=dojo.fx.combine([_d34,_d35]);
this._anim.play();
},_ignore:function(_d36){
if(_d36){
dojo.stopEvent(_d36);
}
},_scrollerWidths:function(){
var div=dojo.doc.createElement("div");
dojo.style(div,{position:"absolute",opacity:0,overflow:"hidden",width:"50px",height:"50px",zIndex:"-100",top:"-200px",left:"-200px",padding:"0px",margin:"0px"});
var iDiv=dojo.doc.createElement("div");
dojo.style(iDiv,{width:"200px",height:"10px"});
div.appendChild(iDiv);
dojo.body().appendChild(div);
var b=dojo.contentBox(div);
dojo.style(div,"overflow","scroll");
var a=dojo.contentBox(div);
dojo.body().removeChild(div);
return {v:b.w-a.w,h:b.h-a.h};
},_setTextAttr:function(text){
this._textNode.innerHTML=text;
this.text=text;
},_setColorAttr:function(c){
dojo.style(this._underlayNode,"backgroundColor",c);
this.color=c;
},_setImageTextAttr:function(text){
dojo.attr(this._imageNode,"alt",text);
this.imageText=text;
},_setImageAttr:function(url){
dojo.attr(this._imageNode,"src",url);
this.image=url;
},_setCenterIndicatorAttr:function(_d37){
this.centerIndicator=_d37;
if(_d37==="image"){
this._centerNode=this._imageNode;
dojo.style(this._textNode,"display","none");
}else{
this._centerNode=this._textNode;
dojo.style(this._imageNode,"display","none");
}
},_disableOverflow:function(){
if(this.target===dojo.body()||this.target===dojo.doc){
this._overflowDisabled=true;
var body=dojo.body();
if(body.style&&body.style.overflow){
this._oldOverflow=dojo.style(body,"overflow");
}else{
this._oldOverflow="";
}
if(dojo.isIE&&!dojo.isQuirks){
if(body.parentNode&&body.parentNode.style&&body.parentNode.style.overflow){
this._oldBodyParentOverflow=body.parentNode.style.overflow;
}else{
try{
this._oldBodyParentOverflow=dojo.style(body.parentNode,"overflow");
}
catch(e){
this._oldBodyParentOverflow="scroll";
}
}
dojo.style(body.parentNode,"overflow","hidden");
}
dojo.style(body,"overflow","hidden");
}
},_enableOverflow:function(){
if(this._overflowDisabled){
delete this._overflowDisabled;
var body=dojo.body();
if(dojo.isIE&&!dojo.isQuirks){
body.parentNode.style.overflow=this._oldBodyParentOverflow;
delete this._oldBodyParentOverflow;
}
dojo.style(body,"overflow",this._oldOverflow);
if(dojo.isWebKit){
var div=dojo.create("div",{style:{height:"2px"}});
body.appendChild(div);
setTimeout(function(){
body.removeChild(div);
},0);
}
delete this._oldOverflow;
}
}});
}
dojo.i18n._preloadLocalizations("dojo.nls.dojo-for-pion",["ROOT","en","en-gb","en-us","xx"]);
