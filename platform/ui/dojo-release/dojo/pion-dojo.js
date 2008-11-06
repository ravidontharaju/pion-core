/*
	Copyright (c) 2004-2008, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

/*
	This is a compiled version of Dojo, built for deployment and not for
	development. To get an editable version, please visit:

		http://dojotoolkit.org

	for documentation and information on getting the source.
*/

if(!dojo._hasResource["dojo.date.stamp"]){
dojo._hasResource["dojo.date.stamp"]=true;
dojo.provide("dojo.date.stamp");
dojo.date.stamp.fromISOString=function(_1,_2){
if(!dojo.date.stamp._isoRegExp){
dojo.date.stamp._isoRegExp=/^(?:(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(.\d+)?)?((?:[+-](\d{2}):(\d{2}))|Z)?)?$/;
}
var _3=dojo.date.stamp._isoRegExp.exec(_1);
var _4=null;
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
dojo.map(["FullYear","Month","Date","Hours","Minutes","Seconds","Milliseconds"],function(_5){
return _2["get"+_5]();
}).forEach(function(_6,_7){
if(_3[_7]===undefined){
_3[_7]=_6;
}
});
}
_4=new Date(_3[0]||1970,_3[1]||0,_3[2]||1,_3[3]||0,_3[4]||0,_3[5]||0,_3[6]||0);
var _8=0;
var _9=_3[7]&&_3[7].charAt(0);
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
var _=function(n){
return (n<10)?"0"+n:n;
};
_b=_b||{};
var _e=[];
var _f=_b.zulu?"getUTC":"get";
var _10="";
if(_b.selector!="time"){
var _11=_a[_f+"FullYear"]();
_10=["0000".substr((_11+"").length)+_11,_(_a[_f+"Month"]()+1),_(_a[_f+"Date"]())].join("-");
}
_e.push(_10);
if(_b.selector!="date"){
var _12=[_(_a[_f+"Hours"]()),_(_a[_f+"Minutes"]()),_(_a[_f+"Seconds"]())].join(":");
var _13=_a[_f+"Milliseconds"]();
if(_b.milliseconds){
_12+="."+(_13<100?"0":"")+_(_13);
}
if(_b.zulu){
_12+="Z";
}else{
if(_b.selector!="time"){
var _14=_a.getTimezoneOffset();
var _15=Math.abs(_14);
_12+=(_14>0?"-":"+")+_(Math.floor(_15/60))+":"+_(_15%60);
}
}
_e.push(_12);
}
return _e.join("T");
};
}
if(!dojo._hasResource["dojo.parser"]){
dojo._hasResource["dojo.parser"]=true;
dojo.provide("dojo.parser");
dojo.parser=new function(){
var d=dojo;
var _17=d._scopeName+"Type";
var qry="["+_17+"]";
function val2type(_19){
if(d.isString(_19)){
return "string";
}
if(typeof _19=="number"){
return "number";
}
if(typeof _19=="boolean"){
return "boolean";
}
if(d.isFunction(_19)){
return "function";
}
if(d.isArray(_19)){
return "array";
}
if(_19 instanceof Date){
return "date";
}
if(_19 instanceof d._Url){
return "url";
}
return "object";
};
function str2obj(_1a,_1b){
switch(_1b){
case "string":
return _1a;
case "number":
return _1a.length?Number(_1a):NaN;
case "boolean":
return typeof _1a=="boolean"?_1a:!(_1a.toLowerCase()=="false");
case "function":
if(d.isFunction(_1a)){
_1a=_1a.toString();
_1a=d.trim(_1a.substring(_1a.indexOf("{")+1,_1a.length-1));
}
try{
if(_1a.search(/[^\w\.]+/i)!=-1){
_1a=d.parser._nameAnonFunc(new Function(_1a),this);
}
return d.getObject(_1a,false);
}
catch(e){
return new Function();
}
case "array":
return _1a?_1a.split(/\s*,\s*/):[];
case "date":
switch(_1a){
case "":
return new Date("");
case "now":
return new Date();
default:
return d.date.stamp.fromISOString(_1a);
}
case "url":
return d.baseUrl+_1a;
default:
return d.fromJson(_1a);
}
};
var _1c={};
function getClassInfo(_1d){
if(!_1c[_1d]){
var cls=d.getObject(_1d);
if(!d.isFunction(cls)){
throw new Error("Could not load class '"+_1d+"'. Did you spell the name correctly and use a full path, like 'dijit.form.Button'?");
}
var _1f=cls.prototype;
var _20={};
for(var _21 in _1f){
if(_21.charAt(0)=="_"){
continue;
}
var _22=_1f[_21];
_20[_21]=val2type(_22);
}
_1c[_1d]={cls:cls,params:_20};
}
return _1c[_1d];
};
this._functionFromScript=function(_23){
var _24="";
var _25="";
var _26=_23.getAttribute("args");
if(_26){
d.forEach(_26.split(/\s*,\s*/),function(_27,idx){
_24+="var "+_27+" = arguments["+idx+"]; ";
});
}
var _29=_23.getAttribute("with");
if(_29&&_29.length){
d.forEach(_29.split(/\s*,\s*/),function(_2a){
_24+="with("+_2a+"){";
_25+="}";
});
}
return new Function(_24+_23.innerHTML+_25);
};
this.instantiate=function(_2b){
var _2c=[];
d.forEach(_2b,function(_2d){
if(!_2d){
return;
}
var _2e=_2d.getAttribute(_17);
if((!_2e)||(!_2e.length)){
return;
}
var _2f=getClassInfo(_2e);
var _30=_2f.cls;
var ps=_30._noScript||_30.prototype._noScript;
var _32={};
var _33=_2d.attributes;
for(var _34 in _2f.params){
var _35=_33.getNamedItem(_34);
if(!_35||(!_35.specified&&(!dojo.isIE||_34.toLowerCase()!="value"))){
continue;
}
var _36=_35.value;
switch(_34){
case "class":
_36=_2d.className;
break;
case "style":
_36=_2d.style&&_2d.style.cssText;
}
var _37=_2f.params[_34];
_32[_34]=str2obj(_36,_37);
}
if(!ps){
var _38=[],_39=[];
d.query("> script[type^='dojo/']",_2d).orphan().forEach(function(_3a){
var _3b=_3a.getAttribute("event"),_2e=_3a.getAttribute("type"),nf=d.parser._functionFromScript(_3a);
if(_3b){
if(_2e=="dojo/connect"){
_38.push({event:_3b,func:nf});
}else{
_32[_3b]=nf;
}
}else{
_39.push(nf);
}
});
}
var _3d=_30["markupFactory"];
if(!_3d&&_30["prototype"]){
_3d=_30.prototype["markupFactory"];
}
var _3e=_3d?_3d(_32,_2d,_30):new _30(_32,_2d);
_2c.push(_3e);
var _3f=_2d.getAttribute("jsId");
if(_3f){
d.setObject(_3f,_3e);
}
if(!ps){
d.forEach(_38,function(_40){
d.connect(_3e,_40.event,null,_40.func);
});
d.forEach(_39,function(_41){
_41.call(_3e);
});
}
});
d.forEach(_2c,function(_42){
if(_42&&_42.startup&&!_42._started&&(!_42.getParent||!_42.getParent())){
_42.startup();
}
});
return _2c;
};
this.parse=function(_43){
var _44=d.query(qry,_43);
var _45=this.instantiate(_44);
return _45;
};
}();
(function(){
var _46=function(){
if(dojo.config["parseOnLoad"]==true){
dojo.parser.parse();
}
};
if(dojo.exists("dijit.wai.onload")&&(dijit.wai.onload===dojo._loaders[0])){
dojo._loaders.splice(1,0,_46);
}else{
dojo._loaders.unshift(_46);
}
})();
dojo.parser._anonCtr=0;
dojo.parser._anon={};
dojo.parser._nameAnonFunc=function(_47,_48){
var jpn="$joinpoint";
var nso=(_48||dojo.parser._anon);
if(dojo.isIE){
var cn=_47["__dojoNameCache"];
if(cn&&nso[cn]===_47){
return _47["__dojoNameCache"];
}
}
var ret="__"+dojo.parser._anonCtr++;
while(typeof nso[ret]!="undefined"){
ret="__"+dojo.parser._anonCtr++;
}
nso[ret]=_47;
return ret;
};
}
if(!dojo._hasResource["dojo.data.util.filter"]){
dojo._hasResource["dojo.data.util.filter"]=true;
dojo.provide("dojo.data.util.filter");
dojo.data.util.filter.patternToRegExp=function(_4d,_4e){
var rxp="^";
var c=null;
for(var i=0;i<_4d.length;i++){
c=_4d.charAt(i);
switch(c){
case "\\":
rxp+=c;
i++;
rxp+=_4d.charAt(i);
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
if(_4e){
return new RegExp(rxp,"mi");
}else{
return new RegExp(rxp,"m");
}
};
}
if(!dojo._hasResource["dojo.data.util.sorter"]){
dojo._hasResource["dojo.data.util.sorter"]=true;
dojo.provide("dojo.data.util.sorter");
dojo.data.util.sorter.basicComparator=function(a,b){
var ret=0;
if(a>b||typeof a==="undefined"||a===null){
ret=1;
}else{
if(a<b||typeof b==="undefined"||b===null){
ret=-1;
}
}
return ret;
};
dojo.data.util.sorter.createSortFunction=function(_55,_56){
var _57=[];
function createSortFunction(_58,dir){
return function(_5a,_5b){
var a=_56.getValue(_5a,_58);
var b=_56.getValue(_5b,_58);
var _5e=null;
if(_56.comparatorMap){
if(typeof _58!=="string"){
_58=_56.getIdentity(_58);
}
_5e=_56.comparatorMap[_58]||dojo.data.util.sorter.basicComparator;
}
_5e=_5e||dojo.data.util.sorter.basicComparator;
return dir*_5e(a,b);
};
};
var _5f;
for(var i=0;i<_55.length;i++){
_5f=_55[i];
if(_5f.attribute){
var _61=(_5f.descending)?-1:1;
_57.push(createSortFunction(_5f.attribute,_61));
}
}
return function(_62,_63){
var i=0;
while(i<_57.length){
var ret=_57[i++](_62,_63);
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
dojo.data.util.simpleFetch.fetch=function(_66){
_66=_66||{};
if(!_66.store){
_66.store=this;
}
var _67=this;
var _68=function(_69,_6a){
if(_6a.onError){
var _6b=_6a.scope||dojo.global;
_6a.onError.call(_6b,_69,_6a);
}
};
var _6c=function(_6d,_6e){
var _6f=_6e.abort||null;
var _70=false;
var _71=_6e.start?_6e.start:0;
var _72=(_6e.count&&(_6e.count!==Infinity))?(_71+_6e.count):_6d.length;
_6e.abort=function(){
_70=true;
if(_6f){
_6f.call(_6e);
}
};
var _73=_6e.scope||dojo.global;
if(!_6e.store){
_6e.store=_67;
}
if(_6e.onBegin){
_6e.onBegin.call(_73,_6d.length,_6e);
}
if(_6e.sort){
_6d.sort(dojo.data.util.sorter.createSortFunction(_6e.sort,_67));
}
if(_6e.onItem){
for(var i=_71;(i<_6d.length)&&(i<_72);++i){
var _75=_6d[i];
if(!_70){
_6e.onItem.call(_73,_75,_6e);
}
}
}
if(_6e.onComplete&&!_70){
var _76=null;
if(!_6e.onItem){
_76=_6d.slice(_71,_72);
}
_6e.onComplete.call(_73,_76,_6e);
}
};
this._fetchItems(_66,_6c,_68);
return _66;
};
}
if(!dojo._hasResource["dojo.data.ItemFileReadStore"]){
dojo._hasResource["dojo.data.ItemFileReadStore"]=true;
dojo.provide("dojo.data.ItemFileReadStore");
dojo.declare("dojo.data.ItemFileReadStore",null,{constructor:function(_77){
this._arrayOfAllItems=[];
this._arrayOfTopLevelItems=[];
this._loadFinished=false;
this._jsonFileUrl=_77.url;
this._jsonData=_77.data;
this._datatypeMap=_77.typeMap||{};
if(!this._datatypeMap["Date"]){
this._datatypeMap["Date"]={type:Date,deserialize:function(_78){
return dojo.date.stamp.fromISOString(_78);
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
if(_77.urlPreventCache!==undefined){
this.urlPreventCache=_77.urlPreventCache?true:false;
}
if(_77.clearOnClose){
this.clearOnClose=true;
}
},url:"",data:null,typeMap:null,clearOnClose:false,urlPreventCache:false,_assertIsItem:function(_79){
if(!this.isItem(_79)){
throw new Error("dojo.data.ItemFileReadStore: Invalid item argument.");
}
},_assertIsAttribute:function(_7a){
if(typeof _7a!=="string"){
throw new Error("dojo.data.ItemFileReadStore: Invalid attribute argument.");
}
},getValue:function(_7b,_7c,_7d){
var _7e=this.getValues(_7b,_7c);
return (_7e.length>0)?_7e[0]:_7d;
},getValues:function(_7f,_80){
this._assertIsItem(_7f);
this._assertIsAttribute(_80);
return _7f[_80]||[];
},getAttributes:function(_81){
this._assertIsItem(_81);
var _82=[];
for(var key in _81){
if((key!==this._storeRefPropName)&&(key!==this._itemNumPropName)&&(key!==this._rootItemPropName)&&(key!==this._reverseRefMap)){
_82.push(key);
}
}
return _82;
},hasAttribute:function(_84,_85){
return this.getValues(_84,_85).length>0;
},containsValue:function(_86,_87,_88){
var _89=undefined;
if(typeof _88==="string"){
_89=dojo.data.util.filter.patternToRegExp(_88,false);
}
return this._containsValue(_86,_87,_88,_89);
},_containsValue:function(_8a,_8b,_8c,_8d){
return dojo.some(this.getValues(_8a,_8b),function(_8e){
if(_8e!==null&&!dojo.isObject(_8e)&&_8d){
if(_8e.toString().match(_8d)){
return true;
}
}else{
if(_8c===_8e){
return true;
}
}
});
},isItem:function(_8f){
if(_8f&&_8f[this._storeRefPropName]===this){
if(this._arrayOfAllItems[_8f[this._itemNumPropName]]===_8f){
return true;
}
}
return false;
},isItemLoaded:function(_90){
return this.isItem(_90);
},loadItem:function(_91){
this._assertIsItem(_91.item);
},getFeatures:function(){
return this._features;
},getLabel:function(_92){
if(this._labelAttr&&this.isItem(_92)){
return this.getValue(_92,this._labelAttr);
}
return undefined;
},getLabelAttributes:function(_93){
if(this._labelAttr){
return [this._labelAttr];
}
return null;
},_fetchItems:function(_94,_95,_96){
var _97=this;
var _98=function(_99,_9a){
var _9b=[];
if(_99.query){
var _9c=_99.queryOptions?_99.queryOptions.ignoreCase:false;
var _9d={};
for(var key in _99.query){
var _9f=_99.query[key];
if(typeof _9f==="string"){
_9d[key]=dojo.data.util.filter.patternToRegExp(_9f,_9c);
}
}
for(var i=0;i<_9a.length;++i){
var _a1=true;
var _a2=_9a[i];
if(_a2===null){
_a1=false;
}else{
for(var key in _99.query){
var _9f=_99.query[key];
if(!_97._containsValue(_a2,key,_9f,_9d[key])){
_a1=false;
}
}
}
if(_a1){
_9b.push(_a2);
}
}
_95(_9b,_99);
}else{
for(var i=0;i<_9a.length;++i){
var _a3=_9a[i];
if(_a3!==null){
_9b.push(_a3);
}
}
_95(_9b,_99);
}
};
if(this._loadFinished){
_98(_94,this._getItemsArray(_94.queryOptions));
}else{
if(this._jsonFileUrl){
if(this._loadInProgress){
this._queuedFetches.push({args:_94,filter:_98});
}else{
this._loadInProgress=true;
var _a4={url:_97._jsonFileUrl,handleAs:"json-comment-optional",preventCache:this.urlPreventCache};
var _a5=dojo.xhrGet(_a4);
_a5.addCallback(function(_a6){
try{
_97._getItemsFromLoadedData(_a6);
_97._loadFinished=true;
_97._loadInProgress=false;
_98(_94,_97._getItemsArray(_94.queryOptions));
_97._handleQueuedFetches();
}
catch(e){
_97._loadFinished=true;
_97._loadInProgress=false;
_96(e,_94);
}
});
_a5.addErrback(function(_a7){
_97._loadInProgress=false;
_96(_a7,_94);
});
}
}else{
if(this._jsonData){
try{
this._loadFinished=true;
this._getItemsFromLoadedData(this._jsonData);
this._jsonData=null;
_98(_94,this._getItemsArray(_94.queryOptions));
}
catch(e){
_96(e,_94);
}
}else{
_96(new Error("dojo.data.ItemFileReadStore: No JSON source data was provided as either URL or a nested Javascript object."),_94);
}
}
}
},_handleQueuedFetches:function(){
if(this._queuedFetches.length>0){
for(var i=0;i<this._queuedFetches.length;i++){
var _a9=this._queuedFetches[i];
var _aa=_a9.args;
var _ab=_a9.filter;
if(_ab){
_ab(_aa,this._getItemsArray(_aa.queryOptions));
}else{
this.fetchItemByIdentity(_aa);
}
}
this._queuedFetches=[];
}
},_getItemsArray:function(_ac){
if(_ac&&_ac.deep){
return this._arrayOfAllItems;
}
return this._arrayOfTopLevelItems;
},close:function(_ad){
if(this.clearOnClose&&(this._jsonFileUrl!=="")){
this._arrayOfAllItems=[];
this._arrayOfTopLevelItems=[];
this._loadFinished=false;
this._itemsByIdentity=null;
this._loadInProgress=false;
this._queuedFetches=[];
}
},_getItemsFromLoadedData:function(_ae){
var _af=false;
function valueIsAnItem(_b0){
var _b1=((_b0!=null)&&(typeof _b0=="object")&&(!dojo.isArray(_b0)||_af)&&(!dojo.isFunction(_b0))&&(_b0.constructor==Object||dojo.isArray(_b0))&&(typeof _b0._reference=="undefined")&&(typeof _b0._type=="undefined")&&(typeof _b0._value=="undefined"));
return _b1;
};
var _b2=this;
function addItemAndSubItemsToArrayOfAllItems(_b3){
_b2._arrayOfAllItems.push(_b3);
for(var _b4 in _b3){
var _b5=_b3[_b4];
if(_b5){
if(dojo.isArray(_b5)){
var _b6=_b5;
for(var k=0;k<_b6.length;++k){
var _b8=_b6[k];
if(valueIsAnItem(_b8)){
addItemAndSubItemsToArrayOfAllItems(_b8);
}
}
}else{
if(valueIsAnItem(_b5)){
addItemAndSubItemsToArrayOfAllItems(_b5);
}
}
}
}
};
this._labelAttr=_ae.label;
var i;
var _ba;
this._arrayOfAllItems=[];
this._arrayOfTopLevelItems=_ae.items;
for(i=0;i<this._arrayOfTopLevelItems.length;++i){
_ba=this._arrayOfTopLevelItems[i];
if(dojo.isArray(_ba)){
_af=true;
}
addItemAndSubItemsToArrayOfAllItems(_ba);
_ba[this._rootItemPropName]=true;
}
var _bb={};
var key;
for(i=0;i<this._arrayOfAllItems.length;++i){
_ba=this._arrayOfAllItems[i];
for(key in _ba){
if(key!==this._rootItemPropName){
var _bd=_ba[key];
if(_bd!==null){
if(!dojo.isArray(_bd)){
_ba[key]=[_bd];
}
}else{
_ba[key]=[null];
}
}
_bb[key]=key;
}
}
while(_bb[this._storeRefPropName]){
this._storeRefPropName+="_";
}
while(_bb[this._itemNumPropName]){
this._itemNumPropName+="_";
}
while(_bb[this._reverseRefMap]){
this._reverseRefMap+="_";
}
var _be;
var _bf=_ae.identifier;
if(_bf){
this._itemsByIdentity={};
this._features["dojo.data.api.Identity"]=_bf;
for(i=0;i<this._arrayOfAllItems.length;++i){
_ba=this._arrayOfAllItems[i];
_be=_ba[_bf];
var _c0=_be[0];
if(!this._itemsByIdentity[_c0]){
this._itemsByIdentity[_c0]=_ba;
}else{
if(this._jsonFileUrl){
throw new Error("dojo.data.ItemFileReadStore:  The json data as specified by: ["+this._jsonFileUrl+"] is malformed.  Items within the list have identifier: ["+_bf+"].  Value collided: ["+_c0+"]");
}else{
if(this._jsonData){
throw new Error("dojo.data.ItemFileReadStore:  The json data provided by the creation arguments is malformed.  Items within the list have identifier: ["+_bf+"].  Value collided: ["+_c0+"]");
}
}
}
}
}else{
this._features["dojo.data.api.Identity"]=Number;
}
for(i=0;i<this._arrayOfAllItems.length;++i){
_ba=this._arrayOfAllItems[i];
_ba[this._storeRefPropName]=this;
_ba[this._itemNumPropName]=i;
}
for(i=0;i<this._arrayOfAllItems.length;++i){
_ba=this._arrayOfAllItems[i];
for(key in _ba){
_be=_ba[key];
for(var j=0;j<_be.length;++j){
_bd=_be[j];
if(_bd!==null&&typeof _bd=="object"){
if(_bd._type&&_bd._value){
var _c2=_bd._type;
var _c3=this._datatypeMap[_c2];
if(!_c3){
throw new Error("dojo.data.ItemFileReadStore: in the typeMap constructor arg, no object class was specified for the datatype '"+_c2+"'");
}else{
if(dojo.isFunction(_c3)){
_be[j]=new _c3(_bd._value);
}else{
if(dojo.isFunction(_c3.deserialize)){
_be[j]=_c3.deserialize(_bd._value);
}else{
throw new Error("dojo.data.ItemFileReadStore: Value provided in typeMap was neither a constructor, nor a an object with a deserialize function");
}
}
}
}
if(_bd._reference){
var _c4=_bd._reference;
if(!dojo.isObject(_c4)){
_be[j]=this._itemsByIdentity[_c4];
}else{
for(var k=0;k<this._arrayOfAllItems.length;++k){
var _c6=this._arrayOfAllItems[k];
var _c7=true;
for(var _c8 in _c4){
if(_c6[_c8]!=_c4[_c8]){
_c7=false;
}
}
if(_c7){
_be[j]=_c6;
}
}
}
if(this.referenceIntegrity){
var _c9=_be[j];
if(this.isItem(_c9)){
this._addReferenceToMap(_c9,_ba,key);
}
}
}else{
if(this.isItem(_bd)){
if(this.referenceIntegrity){
this._addReferenceToMap(_bd,_ba,key);
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
if(!this._loadFinished){
var _d1=this;
if(this._jsonFileUrl){
if(this._loadInProgress){
this._queuedFetches.push({args:_d0});
}else{
this._loadInProgress=true;
var _d2={url:_d1._jsonFileUrl,handleAs:"json-comment-optional",preventCache:this.urlPreventCache};
var _d3=dojo.xhrGet(_d2);
_d3.addCallback(function(_d4){
var _d5=_d0.scope?_d0.scope:dojo.global;
try{
_d1._getItemsFromLoadedData(_d4);
_d1._loadFinished=true;
_d1._loadInProgress=false;
var _d6=_d1._getItemByIdentity(_d0.identity);
if(_d0.onItem){
_d0.onItem.call(_d5,_d6);
}
_d1._handleQueuedFetches();
}
catch(error){
_d1._loadInProgress=false;
if(_d0.onError){
_d0.onError.call(_d5,error);
}
}
});
_d3.addErrback(function(_d7){
_d1._loadInProgress=false;
if(_d0.onError){
var _d8=_d0.scope?_d0.scope:dojo.global;
_d0.onError.call(_d8,_d7);
}
});
}
}else{
if(this._jsonData){
_d1._getItemsFromLoadedData(_d1._jsonData);
_d1._jsonData=null;
_d1._loadFinished=true;
var _d9=_d1._getItemByIdentity(_d0.identity);
if(_d0.onItem){
var _da=_d0.scope?_d0.scope:dojo.global;
_d0.onItem.call(_da,_d9);
}
}
}
}else{
var _d9=this._getItemByIdentity(_d0.identity);
if(_d0.onItem){
var _da=_d0.scope?_d0.scope:dojo.global;
_d0.onItem.call(_da,_d9);
}
}
},_getItemByIdentity:function(_db){
var _dc=null;
if(this._itemsByIdentity){
_dc=this._itemsByIdentity[_db];
}else{
_dc=this._arrayOfAllItems[_db];
}
if(_dc===undefined){
_dc=null;
}
return _dc;
},getIdentityAttributes:function(_dd){
var _de=this._features["dojo.data.api.Identity"];
if(_de===Number){
return null;
}else{
return [_de];
}
},_forceLoad:function(){
var _df=this;
if(this._jsonFileUrl){
var _e0={url:_df._jsonFileUrl,handleAs:"json-comment-optional",preventCache:this.urlPreventCache,sync:true};
var _e1=dojo.xhrGet(_e0);
_e1.addCallback(function(_e2){
try{
if(_df._loadInProgress!==true&&!_df._loadFinished){
_df._getItemsFromLoadedData(_e2);
_df._loadFinished=true;
}else{
if(_df._loadInProgress){
throw new Error("dojo.data.ItemFileReadStore:  Unable to perform a synchronous load, an async load is in progress.");
}
}
}
catch(e){
console.log(e);
throw e;
}
});
_e1.addErrback(function(_e3){
throw _e3;
});
}else{
if(this._jsonData){
_df._getItemsFromLoadedData(_df._jsonData);
_df._jsonData=null;
_df._loadFinished=true;
}
}
}});
dojo.extend(dojo.data.ItemFileReadStore,dojo.data.util.simpleFetch);
}
if(!dojo._hasResource["dojo.data.ItemFileWriteStore"]){
dojo._hasResource["dojo.data.ItemFileWriteStore"]=true;
dojo.provide("dojo.data.ItemFileWriteStore");
dojo.declare("dojo.data.ItemFileWriteStore",dojo.data.ItemFileReadStore,{constructor:function(_e4){
this._features["dojo.data.api.Write"]=true;
this._features["dojo.data.api.Notification"]=true;
this._pending={_newItems:{},_modifiedItems:{},_deletedItems:{}};
if(!this._datatypeMap["Date"].serialize){
this._datatypeMap["Date"].serialize=function(obj){
return dojo.date.stamp.toISOString(obj,{zulu:true});
};
}
if(_e4&&(_e4.referenceIntegrity===false)){
this.referenceIntegrity=false;
}
this._saveInProgress=false;
},referenceIntegrity:true,_assert:function(_e6){
if(!_e6){
throw new Error("assertion failed in ItemFileWriteStore");
}
},_getIdentifierAttribute:function(){
var _e7=this.getFeatures()["dojo.data.api.Identity"];
return _e7;
},newItem:function(_e8,_e9){
this._assert(!this._saveInProgress);
if(!this._loadFinished){
this._forceLoad();
}
if(typeof _e8!="object"&&typeof _e8!="undefined"){
throw new Error("newItem() was passed something other than an object");
}
var _ea=null;
var _eb=this._getIdentifierAttribute();
if(_eb===Number){
_ea=this._arrayOfAllItems.length;
}else{
_ea=_e8[_eb];
if(typeof _ea==="undefined"){
throw new Error("newItem() was not passed an identity for the new item");
}
if(dojo.isArray(_ea)){
throw new Error("newItem() was not passed an single-valued identity");
}
}
if(this._itemsByIdentity){
this._assert(typeof this._itemsByIdentity[_ea]==="undefined");
}
this._assert(typeof this._pending._newItems[_ea]==="undefined");
this._assert(typeof this._pending._deletedItems[_ea]==="undefined");
var _ec={};
_ec[this._storeRefPropName]=this;
_ec[this._itemNumPropName]=this._arrayOfAllItems.length;
if(this._itemsByIdentity){
this._itemsByIdentity[_ea]=_ec;
_ec[_eb]=[_ea];
}
this._arrayOfAllItems.push(_ec);
var _ed=null;
if(_e9&&_e9.parent&&_e9.attribute){
_ed={item:_e9.parent,attribute:_e9.attribute,oldValue:undefined};
var _ee=this.getValues(_e9.parent,_e9.attribute);
if(_ee&&_ee.length>0){
var _ef=_ee.slice(0,_ee.length);
if(_ee.length===1){
_ed.oldValue=_ee[0];
}else{
_ed.oldValue=_ee.slice(0,_ee.length);
}
_ef.push(_ec);
this._setValueOrValues(_e9.parent,_e9.attribute,_ef,false);
_ed.newValue=this.getValues(_e9.parent,_e9.attribute);
}else{
this._setValueOrValues(_e9.parent,_e9.attribute,_ec,false);
_ed.newValue=_ec;
}
}else{
_ec[this._rootItemPropName]=true;
this._arrayOfTopLevelItems.push(_ec);
}
this._pending._newItems[_ea]=_ec;
for(var key in _e8){
if(key===this._storeRefPropName||key===this._itemNumPropName){
throw new Error("encountered bug in ItemFileWriteStore.newItem");
}
var _f1=_e8[key];
if(!dojo.isArray(_f1)){
_f1=[_f1];
}
_ec[key]=_f1;
if(this.referenceIntegrity){
for(var i=0;i<_f1.length;i++){
var val=_f1[i];
if(this.isItem(val)){
this._addReferenceToMap(val,_ec,key);
}
}
}
}
this.onNew(_ec,_ed);
return _ec;
},_removeArrayElement:function(_f4,_f5){
var _f6=dojo.indexOf(_f4,_f5);
if(_f6!=-1){
_f4.splice(_f6,1);
return true;
}
return false;
},deleteItem:function(_f7){
this._assert(!this._saveInProgress);
this._assertIsItem(_f7);
var _f8=_f7[this._itemNumPropName];
var _f9=this.getIdentity(_f7);
if(this.referenceIntegrity){
var _fa=this.getAttributes(_f7);
if(_f7[this._reverseRefMap]){
_f7["backup_"+this._reverseRefMap]=dojo.clone(_f7[this._reverseRefMap]);
}
dojo.forEach(_fa,function(_fb){
dojo.forEach(this.getValues(_f7,_fb),function(_fc){
if(this.isItem(_fc)){
if(!_f7["backupRefs_"+this._reverseRefMap]){
_f7["backupRefs_"+this._reverseRefMap]=[];
}
_f7["backupRefs_"+this._reverseRefMap].push({id:this.getIdentity(_fc),attr:_fb});
this._removeReferenceFromMap(_fc,_f7,_fb);
}
},this);
},this);
var _fd=_f7[this._reverseRefMap];
if(_fd){
for(var _fe in _fd){
var _ff=null;
if(this._itemsByIdentity){
_ff=this._itemsByIdentity[_fe];
}else{
_ff=this._arrayOfAllItems[_fe];
}
if(_ff){
for(var _100 in _fd[_fe]){
var _101=this.getValues(_ff,_100)||[];
var _102=dojo.filter(_101,function(_103){
return !(this.isItem(_103)&&this.getIdentity(_103)==_f9);
},this);
this._removeReferenceFromMap(_f7,_ff,_100);
if(_102.length<_101.length){
this._setValueOrValues(_ff,_100,_102,true);
}
}
}
}
}
}
this._arrayOfAllItems[_f8]=null;
_f7[this._storeRefPropName]=null;
if(this._itemsByIdentity){
delete this._itemsByIdentity[_f9];
}
this._pending._deletedItems[_f9]=_f7;
if(_f7[this._rootItemPropName]){
this._removeArrayElement(this._arrayOfTopLevelItems,_f7);
}
this.onDelete(_f7);
return true;
},setValue:function(item,_105,_106){
return this._setValueOrValues(item,_105,_106,true);
},setValues:function(item,_108,_109){
return this._setValueOrValues(item,_108,_109,true);
},unsetAttribute:function(item,_10b){
return this._setValueOrValues(item,_10b,[],true);
},_setValueOrValues:function(item,_10d,_10e,_10f){
this._assert(!this._saveInProgress);
this._assertIsItem(item);
this._assert(dojo.isString(_10d));
this._assert(typeof _10e!=="undefined");
var _110=this._getIdentifierAttribute();
if(_10d==_110){
throw new Error("ItemFileWriteStore does not have support for changing the value of an item's identifier.");
}
var _111=this._getValueOrValues(item,_10d);
var _112=this.getIdentity(item);
if(!this._pending._modifiedItems[_112]){
var _113={};
for(var key in item){
if((key===this._storeRefPropName)||(key===this._itemNumPropName)||(key===this._rootItemPropName)){
_113[key]=item[key];
}else{
if(key===this._reverseRefMap){
_113[key]=dojo.clone(item[key]);
}else{
_113[key]=item[key].slice(0,item[key].length);
}
}
}
this._pending._modifiedItems[_112]=_113;
}
var _115=false;
if(dojo.isArray(_10e)&&_10e.length===0){
_115=delete item[_10d];
_10e=undefined;
if(this.referenceIntegrity&&_111){
var _116=_111;
if(!dojo.isArray(_116)){
_116=[_116];
}
for(var i=0;i<_116.length;i++){
var _118=_116[i];
if(this.isItem(_118)){
this._removeReferenceFromMap(_118,item,_10d);
}
}
}
}else{
var _119;
if(dojo.isArray(_10e)){
var _11a=_10e;
_119=_10e.slice(0,_10e.length);
}else{
_119=[_10e];
}
if(this.referenceIntegrity){
if(_111){
var _116=_111;
if(!dojo.isArray(_116)){
_116=[_116];
}
var map={};
dojo.forEach(_116,function(_11c){
if(this.isItem(_11c)){
var id=this.getIdentity(_11c);
map[id.toString()]=true;
}
},this);
dojo.forEach(_119,function(_11e){
if(this.isItem(_11e)){
var id=this.getIdentity(_11e);
if(map[id.toString()]){
delete map[id.toString()];
}else{
this._addReferenceToMap(_11e,item,_10d);
}
}
},this);
for(var rId in map){
var _121;
if(this._itemsByIdentity){
_121=this._itemsByIdentity[rId];
}else{
_121=this._arrayOfAllItems[rId];
}
this._removeReferenceFromMap(_121,item,_10d);
}
}else{
for(var i=0;i<_119.length;i++){
var _118=_119[i];
if(this.isItem(_118)){
this._addReferenceToMap(_118,item,_10d);
}
}
}
}
item[_10d]=_119;
_115=true;
}
if(_10f){
this.onSet(item,_10d,_111,_10e);
}
return _115;
},_addReferenceToMap:function(_122,_123,_124){
var _125=this.getIdentity(_123);
var _126=_122[this._reverseRefMap];
if(!_126){
_126=_122[this._reverseRefMap]={};
}
var _127=_126[_125];
if(!_127){
_127=_126[_125]={};
}
_127[_124]=true;
},_removeReferenceFromMap:function(_128,_129,_12a){
var _12b=this.getIdentity(_129);
var _12c=_128[this._reverseRefMap];
var _12d;
if(_12c){
for(_12d in _12c){
if(_12d==_12b){
delete _12c[_12d][_12a];
if(this._isEmpty(_12c[_12d])){
delete _12c[_12d];
}
}
}
if(this._isEmpty(_12c)){
delete _128[this._reverseRefMap];
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
},_getValueOrValues:function(item,_131){
var _132=undefined;
if(this.hasAttribute(item,_131)){
var _133=this.getValues(item,_131);
if(_133.length==1){
_132=_133[0];
}else{
_132=_133;
}
}
return _132;
},_flatten:function(_134){
if(this.isItem(_134)){
var item=_134;
var _136=this.getIdentity(item);
var _137={_reference:_136};
return _137;
}else{
if(typeof _134==="object"){
for(var type in this._datatypeMap){
var _139=this._datatypeMap[type];
if(dojo.isObject(_139)&&!dojo.isFunction(_139)){
if(_134 instanceof _139.type){
if(!_139.serialize){
throw new Error("ItemFileWriteStore:  No serializer defined for type mapping: ["+type+"]");
}
return {_type:type,_value:_139.serialize(_134)};
}
}else{
if(_134 instanceof _139){
return {_type:type,_value:_134.toString()};
}
}
}
}
return _134;
}
},_getNewFileContentString:function(){
var _13a={};
var _13b=this._getIdentifierAttribute();
if(_13b!==Number){
_13a.identifier=_13b;
}
if(this._labelAttr){
_13a.label=this._labelAttr;
}
_13a.items=[];
for(var i=0;i<this._arrayOfAllItems.length;++i){
var item=this._arrayOfAllItems[i];
if(item!==null){
var _13e={};
for(var key in item){
if(key!==this._storeRefPropName&&key!==this._itemNumPropName){
var _140=key;
var _141=this.getValues(item,_140);
if(_141.length==1){
_13e[_140]=this._flatten(_141[0]);
}else{
var _142=[];
for(var j=0;j<_141.length;++j){
_142.push(this._flatten(_141[j]));
_13e[_140]=_142;
}
}
}
}
_13a.items.push(_13e);
}
}
var _144=true;
return dojo.toJson(_13a,_144);
},_isEmpty:function(_145){
var _146=true;
if(dojo.isObject(_145)){
var i;
for(i in _145){
_146=false;
break;
}
}else{
if(dojo.isArray(_145)){
if(_145.length>0){
_146=false;
}
}
}
return _146;
},save:function(_148){
this._assert(!this._saveInProgress);
this._saveInProgress=true;
var self=this;
var _14a=function(){
self._pending={_newItems:{},_modifiedItems:{},_deletedItems:{}};
self._saveInProgress=false;
if(_148&&_148.onComplete){
var _14b=_148.scope||dojo.global;
_148.onComplete.call(_14b);
}
};
var _14c=function(err){
self._saveInProgress=false;
if(_148&&_148.onError){
var _14e=_148.scope||dojo.global;
_148.onError.call(_14e,err);
}
};
if(this._saveEverything){
var _14f=this._getNewFileContentString();
this._saveEverything(_14a,_14c,_14f);
}
if(this._saveCustom){
this._saveCustom(_14a,_14c);
}
if(!this._saveEverything&&!this._saveCustom){
_14a();
}
},revert:function(){
this._assert(!this._saveInProgress);
var _150;
for(_150 in this._pending._modifiedItems){
var _151=this._pending._modifiedItems[_150];
var _152=null;
if(this._itemsByIdentity){
_152=this._itemsByIdentity[_150];
}else{
_152=this._arrayOfAllItems[_150];
}
_151[this._storeRefPropName]=this;
_152[this._storeRefPropName]=null;
var _153=_152[this._itemNumPropName];
this._arrayOfAllItems[_153]=_151;
if(_152[this._rootItemPropName]){
var i;
for(i=0;i<this._arrayOfTopLevelItems.length;i++){
var _155=this._arrayOfTopLevelItems[i];
if(this.getIdentity(_155)==_150){
this._arrayOfTopLevelItems[i]=_151;
break;
}
}
}
if(this._itemsByIdentity){
this._itemsByIdentity[_150]=_151;
}
}
var _156;
for(_150 in this._pending._deletedItems){
_156=this._pending._deletedItems[_150];
_156[this._storeRefPropName]=this;
var _157=_156[this._itemNumPropName];
if(_156["backup_"+this._reverseRefMap]){
_156[this._reverseRefMap]=_156["backup_"+this._reverseRefMap];
delete _156["backup_"+this._reverseRefMap];
}
this._arrayOfAllItems[_157]=_156;
if(this._itemsByIdentity){
this._itemsByIdentity[_150]=_156;
}
if(_156[this._rootItemPropName]){
this._arrayOfTopLevelItems.push(_156);
}
}
for(_150 in this._pending._deletedItems){
_156=this._pending._deletedItems[_150];
if(_156["backupRefs_"+this._reverseRefMap]){
dojo.forEach(_156["backupRefs_"+this._reverseRefMap],function(_158){
var _159;
if(this._itemsByIdentity){
_159=this._itemsByIdentity[_158.id];
}else{
_159=this._arrayOfAllItems[_158.id];
}
this._addReferenceToMap(_159,_156,_158.attr);
},this);
delete _156["backupRefs_"+this._reverseRefMap];
}
}
for(_150 in this._pending._newItems){
var _15a=this._pending._newItems[_150];
_15a[this._storeRefPropName]=null;
this._arrayOfAllItems[_15a[this._itemNumPropName]]=null;
if(_15a[this._rootItemPropName]){
this._removeArrayElement(this._arrayOfTopLevelItems,_15a);
}
if(this._itemsByIdentity){
delete this._itemsByIdentity[_150];
}
}
this._pending={_newItems:{},_modifiedItems:{},_deletedItems:{}};
return true;
},isDirty:function(item){
if(item){
var _15c=this.getIdentity(item);
return new Boolean(this._pending._newItems[_15c]||this._pending._modifiedItems[_15c]||this._pending._deletedItems[_15c]).valueOf();
}else{
if(!this._isEmpty(this._pending._newItems)||!this._isEmpty(this._pending._modifiedItems)||!this._isEmpty(this._pending._deletedItems)){
return true;
}
return false;
}
},onSet:function(item,_15e,_15f,_160){
},onNew:function(_161,_162){
},onDelete:function(_163){
},close:function(_164){
if(this.clearOnClose){
if(!this.isDirty()){
this.inherited(arguments);
}else{
if(this._jsonFileUrl!==""){
throw new Error("dojo.data.ItemFileWriteStore: There are unsaved changes present in the store.  Please save or revert the changes before invoking close.");
}
}
}
}});
}
if(!dojo._hasResource["dojo.dnd.common"]){
dojo._hasResource["dojo.dnd.common"]=true;
dojo.provide("dojo.dnd.common");
dojo.dnd._isMac=navigator.appVersion.indexOf("Macintosh")>=0;
dojo.dnd._copyKey=dojo.dnd._isMac?"metaKey":"ctrlKey";
dojo.dnd.getCopyKeyState=function(e){
return e[dojo.dnd._copyKey];
};
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
if(!dojo._hasResource["dojo.dnd.autoscroll"]){
dojo._hasResource["dojo.dnd.autoscroll"]=true;
dojo.provide("dojo.dnd.autoscroll");
dojo.dnd.getViewport=function(){
var d=dojo.doc,dd=d.documentElement,w=window,b=dojo.body();
if(dojo.isMozilla){
return {w:dd.clientWidth,h:w.innerHeight};
}else{
if(!dojo.isOpera&&w.innerWidth){
return {w:w.innerWidth,h:w.innerHeight};
}else{
if(!dojo.isOpera&&dd&&dd.clientWidth){
return {w:dd.clientWidth,h:dd.clientHeight};
}else{
if(b.clientWidth){
return {w:b.clientWidth,h:b.clientHeight};
}
}
}
}
return null;
};
dojo.dnd.V_TRIGGER_AUTOSCROLL=32;
dojo.dnd.H_TRIGGER_AUTOSCROLL=32;
dojo.dnd.V_AUTOSCROLL_VALUE=16;
dojo.dnd.H_AUTOSCROLL_VALUE=16;
dojo.dnd.autoScroll=function(e){
var v=dojo.dnd.getViewport(),dx=0,dy=0;
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
var b=dojo._getContentBox(n,s),t=dojo._abs(n,true);
var w=Math.min(dojo.dnd.H_TRIGGER_AUTOSCROLL,b.w/2),h=Math.min(dojo.dnd.V_TRIGGER_AUTOSCROLL,b.h/2),rx=e.pageX-t.x,ry=e.pageY-t.y,dx=0,dy=0;
if(dojo.isSafari||dojo.isOpera){
rx+=dojo.body().scrollLeft,ry+=dojo.body().scrollTop;
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
var _17c=n.scrollLeft,_17d=n.scrollTop;
n.scrollLeft=n.scrollLeft+dx;
n.scrollTop=n.scrollTop+dy;
if(_17c!=n.scrollLeft||_17d!=n.scrollTop){
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
this.marginBox={l:e.pageX,t:e.pageY};
this.mouseButton=e.button;
var h=this.host=host,d=node.ownerDocument,_183=dojo.connect(d,"onmousemove",this,"onFirstMove");
this.events=[dojo.connect(d,"onmousemove",this,"onMouseMove"),dojo.connect(d,"onmouseup",this,"onMouseUp"),dojo.connect(d,"ondragstart",dojo,"stopEvent"),dojo.connect(d,"onselectstart",dojo,"stopEvent"),_183];
if(h&&h.onMoveStart){
h.onMoveStart(this);
}
},onMouseMove:function(e){
dojo.dnd.autoScroll(e);
var m=this.marginBox;
this.host.onMove(this,{l:m.l+e.pageX,t:m.t+e.pageY});
dojo.stopEvent(e);
},onMouseUp:function(e){
if(dojo.isSafari&&dojo.dnd._isMac&&this.mouseButton==2?e.button==0:this.mouseButton==e.button){
this.destroy();
}
dojo.stopEvent(e);
},onFirstMove:function(){
var s=this.node.style,l,t,h=this.host;
switch(s.position){
case "relative":
case "absolute":
l=Math.round(parseFloat(s.left));
t=Math.round(parseFloat(s.top));
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
h.onFirstMove(this);
}
dojo.disconnect(this.events.pop());
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
dojo.declare("dojo.dnd.Moveable",null,{handle:"",delay:0,skip:false,constructor:function(node,_192){
this.node=dojo.byId(node);
if(!_192){
_192={};
}
this.handle=_192.handle?dojo.byId(_192.handle):null;
if(!this.handle){
this.handle=this.node;
}
this.delay=_192.delay>0?_192.delay:0;
this.skip=_192.skip;
this.mover=_192.mover?_192.mover:dojo.dnd.Mover;
this.events=[dojo.connect(this.handle,"onmousedown",this,"onMouseDown"),dojo.connect(this.handle,"ondragstart",this,"onSelectStart"),dojo.connect(this.handle,"onselectstart",this,"onSelectStart")];
},markupFactory:function(_193,node){
return new dojo.dnd.Moveable(node,_193);
},destroy:function(){
dojo.forEach(this.events,dojo.disconnect);
this.events=this.node=this.handle=null;
},onMouseDown:function(e){
if(this.skip&&dojo.dnd.isFormElement(e)){
return;
}
if(this.delay){
this.events.push(dojo.connect(this.handle,"onmousemove",this,"onMouseMove"));
this.events.push(dojo.connect(this.handle,"onmouseup",this,"onMouseUp"));
this._lastX=e.pageX;
this._lastY=e.pageY;
}else{
this.onDragDetected(e);
}
dojo.stopEvent(e);
},onMouseMove:function(e){
if(Math.abs(e.pageX-this._lastX)>this.delay||Math.abs(e.pageY-this._lastY)>this.delay){
this.onMouseUp(e);
this.onDragDetected(e);
}
dojo.stopEvent(e);
},onMouseUp:function(e){
dojo.disconnect(this.events.pop());
dojo.disconnect(this.events.pop());
dojo.stopEvent(e);
},onSelectStart:function(e){
if(!this.skip||!dojo.dnd.isFormElement(e)){
dojo.stopEvent(e);
}
},onDragDetected:function(e){
new this.mover(this.node,e,this);
},onMoveStart:function(_19a){
dojo.publish("/dnd/move/start",[_19a]);
dojo.addClass(dojo.body(),"dojoMove");
dojo.addClass(this.node,"dojoMoveItem");
},onMoveStop:function(_19b){
dojo.publish("/dnd/move/stop",[_19b]);
dojo.removeClass(dojo.body(),"dojoMove");
dojo.removeClass(this.node,"dojoMoveItem");
},onFirstMove:function(_19c){
},onMove:function(_19d,_19e){
this.onMoving(_19d,_19e);
var s=_19d.node.style;
s.left=_19e.l+"px";
s.top=_19e.t+"px";
this.onMoved(_19d,_19e);
},onMoving:function(_1a0,_1a1){
},onMoved:function(_1a2,_1a3){
}});
}
if(!dojo._hasResource["dojo.dnd.move"]){
dojo._hasResource["dojo.dnd.move"]=true;
dojo.provide("dojo.dnd.move");
dojo.declare("dojo.dnd.move.constrainedMoveable",dojo.dnd.Moveable,{constraints:function(){
},within:false,markupFactory:function(_1a4,node){
return new dojo.dnd.move.constrainedMoveable(node,_1a4);
},constructor:function(node,_1a7){
if(!_1a7){
_1a7={};
}
this.constraints=_1a7.constraints;
this.within=_1a7.within;
},onFirstMove:function(_1a8){
var c=this.constraintBox=this.constraints.call(this,_1a8);
c.r=c.l+c.w;
c.b=c.t+c.h;
if(this.within){
var mb=dojo.marginBox(_1a8.node);
c.r-=mb.w;
c.b-=mb.h;
}
},onMove:function(_1ab,_1ac){
var c=this.constraintBox,s=_1ab.node.style;
s.left=(_1ac.l<c.l?c.l:c.r<_1ac.l?c.r:_1ac.l)+"px";
s.top=(_1ac.t<c.t?c.t:c.b<_1ac.t?c.b:_1ac.t)+"px";
}});
dojo.declare("dojo.dnd.move.boxConstrainedMoveable",dojo.dnd.move.constrainedMoveable,{box:{},markupFactory:function(_1af,node){
return new dojo.dnd.move.boxConstrainedMoveable(node,_1af);
},constructor:function(node,_1b2){
var box=_1b2&&_1b2.box;
this.constraints=function(){
return box;
};
}});
dojo.declare("dojo.dnd.move.parentConstrainedMoveable",dojo.dnd.move.constrainedMoveable,{area:"content",markupFactory:function(_1b4,node){
return new dojo.dnd.move.parentConstrainedMoveable(node,_1b4);
},constructor:function(node,_1b7){
var area=_1b7&&_1b7.area;
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
dojo.dnd.move.constrainedMover=function(fun,_1be){
dojo.deprecated("dojo.dnd.move.constrainedMover, use dojo.dnd.move.constrainedMoveable instead");
var _1bf=function(node,e,_1c2){
dojo.dnd.Mover.call(this,node,e,_1c2);
};
dojo.extend(_1bf,dojo.dnd.Mover.prototype);
dojo.extend(_1bf,{onMouseMove:function(e){
dojo.dnd.autoScroll(e);
var m=this.marginBox,c=this.constraintBox,l=m.l+e.pageX,t=m.t+e.pageY;
l=l<c.l?c.l:c.r<l?c.r:l;
t=t<c.t?c.t:c.b<t?c.b:t;
this.host.onMove(this,{l:l,t:t});
},onFirstMove:function(){
dojo.dnd.Mover.prototype.onFirstMove.call(this);
var c=this.constraintBox=fun.call(this);
c.r=c.l+c.w;
c.b=c.t+c.h;
if(_1be){
var mb=dojo.marginBox(this.node);
c.r-=mb.w;
c.b-=mb.h;
}
}});
return _1bf;
};
dojo.dnd.move.boxConstrainedMover=function(box,_1cb){
dojo.deprecated("dojo.dnd.move.boxConstrainedMover, use dojo.dnd.move.boxConstrainedMoveable instead");
return dojo.dnd.move.constrainedMover(function(){
return box;
},_1cb);
};
dojo.dnd.move.parentConstrainedMover=function(area,_1cd){
dojo.deprecated("dojo.dnd.move.parentConstrainedMover, use dojo.dnd.move.parentConstrainedMoveable instead");
var fun=function(){
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
return dojo.dnd.move.constrainedMover(fun,_1cd);
};
dojo.dnd.constrainedMover=dojo.dnd.move.constrainedMover;
dojo.dnd.boxConstrainedMover=dojo.dnd.move.boxConstrainedMover;
dojo.dnd.parentConstrainedMover=dojo.dnd.move.parentConstrainedMover;
}
if(!dojo._hasResource["dojo.dnd.Container"]){
dojo._hasResource["dojo.dnd.Container"]=true;
dojo.provide("dojo.dnd.Container");
dojo.declare("dojo.dnd.Container",null,{skipForm:false,constructor:function(node,_1d4){
this.node=dojo.byId(node);
if(!_1d4){
_1d4={};
}
this.creator=_1d4.creator||null;
this.skipForm=_1d4.skipForm;
this.parent=_1d4.dropParent&&dojo.byId(_1d4.dropParent);
this.map={};
this.current=null;
this.containerState="";
dojo.addClass(this.node,"dojoDndContainer");
if(!(_1d4&&_1d4._skipStartup)){
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
},insertNodes:function(data,_1e4,_1e5){
if(!this.parent.firstChild){
_1e5=null;
}else{
if(_1e4){
if(!_1e5){
_1e5=this.parent.firstChild;
}
}else{
if(_1e5){
_1e5=_1e5.nextSibling;
}
}
}
if(_1e5){
for(var i=0;i<data.length;++i){
var t=this._normalizedCreator(data[i]);
this.setItem(t.node.id,{data:t.data,type:t.type});
this.parent.insertBefore(t.node,_1e5);
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
},markupFactory:function(_1e8,node){
_1e8._skipStartup=true;
return new dojo.dnd.Container(node,_1e8);
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
},_changeState:function(type,_1f1){
var _1f2="dojoDnd"+type;
var _1f3=type.toLowerCase()+"State";
dojo.removeClass(this.node,_1f2+this[_1f3]);
dojo.addClass(this.node,_1f2+_1f1);
this[_1f3]=_1f1;
},_addItemClass:function(node,type){
dojo.addClass(node,"dojoDndItem"+type);
},_removeItemClass:function(node,type){
dojo.removeClass(node,"dojoDndItem"+type);
},_getChildByEvent:function(e){
var node=e.target;
if(node){
for(var _1fa=node.parentNode;_1fa;node=_1fa,_1fa=node.parentNode){
if(_1fa==this.parent&&dojo.hasClass(node,"dojoDndItem")){
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
var n=dojo.doc.createElement(tag);
n.innerHTML=text;
return n;
};
};
dojo.dnd._createTrTd=function(text){
var tr=dojo.doc.createElement("tr");
var td=dojo.doc.createElement("td");
td.innerHTML=text;
tr.appendChild(td);
return tr;
};
dojo.dnd._createSpan=function(text){
var n=dojo.doc.createElement("span");
n.innerHTML=text;
return n;
};
dojo.dnd._defaultCreatorNodes={ul:"li",ol:"li",div:"div",p:"div"};
dojo.dnd._defaultCreator=function(node){
var tag=node.tagName.toLowerCase();
var c=tag=="tbody"||tag=="thead"?dojo.dnd._createTrTd:dojo.dnd._createNode(dojo.dnd._defaultCreatorNodes[tag]);
return function(item,hint){
var _20b=item&&dojo.isObject(item),data,type,n;
if(_20b&&item.tagName&&item.nodeType&&item.getAttribute){
data=item.getAttribute("dndData")||item.innerHTML;
type=item.getAttribute("dndType");
type=type?type.split(/\s*,\s*/):["text"];
n=item;
}else{
data=(_20b&&item.data)?item.data:item;
type=(_20b&&item.type)?item.type:["text"];
n=(hint=="avatar"?dojo.dnd._createSpan:c)(String(data));
}
n.id=dojo.dnd.getUniqueId();
return {node:n,data:data,type:type};
};
};
}
if(!dojo._hasResource["dojo.dnd.Selector"]){
dojo._hasResource["dojo.dnd.Selector"]=true;
dojo.provide("dojo.dnd.Selector");
dojo.declare("dojo.dnd.Selector",dojo.dnd.Container,{constructor:function(node,_210){
if(!_210){
_210={};
}
this.singular=_210.singular;
this.autoSync=_210.autoSync;
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
dojo._destroyElement(n);
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
},insertNodes:function(_222,data,_224,_225){
var _226=this._normalizedCreator;
this._normalizedCreator=function(item,hint){
var t=_226.call(this,item,hint);
if(_222){
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
dojo.dnd.Selector.superclass.insertNodes.call(this,data,_224,_225);
this._normalizedCreator=_226;
return this;
},destroy:function(){
dojo.dnd.Selector.superclass.destroy.call(this);
this.selection=this.anchor=null;
},markupFactory:function(_22a,node){
_22a._skipStartup=true;
return new dojo.dnd.Selector(node,_22a);
},onMouseDown:function(e){
if(this.autoSync){
this.sync();
}
if(!this.current){
return;
}
if(!this.singular&&!dojo.dnd.getCopyKeyState(e)&&!e.shiftKey&&(this.current.id in this.selection)){
this.simpleSelection=true;
dojo.stopEvent(e);
return;
}
if(!this.singular&&e.shiftKey){
if(!dojo.dnd.getCopyKeyState(e)){
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
if(dojo.dnd.getCopyKeyState(e)){
this.selectNone();
}
}else{
this.selectNone();
this.anchor=this.current;
this._addItemClass(this.anchor,"Anchor");
this.selection[this.current.id]=1;
}
}else{
if(dojo.dnd.getCopyKeyState(e)){
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
dojo.declare("dojo.dnd.Avatar",null,{constructor:function(_235){
this.manager=_235;
this.construct();
},construct:function(){
var a=dojo.doc.createElement("table");
a.className="dojoDndAvatar";
a.style.position="absolute";
a.style.zIndex=1999;
a.style.margin="0px";
var b=dojo.doc.createElement("tbody");
var tr=dojo.doc.createElement("tr");
tr.className="dojoDndAvatarHeader";
var td=dojo.doc.createElement("td");
td.innerHTML=this._generateText();
tr.appendChild(td);
dojo.style(tr,"opacity",0.9);
b.appendChild(tr);
var k=Math.min(5,this.manager.nodes.length);
var _23b=this.manager.source,node;
for(var i=0;i<k;++i){
tr=dojo.doc.createElement("tr");
tr.className="dojoDndAvatarItem";
td=dojo.doc.createElement("td");
if(_23b.creator){
node=_23b._normalizedCreator(_23b.getItem(this.manager.nodes[i].id).data,"avatar").node;
}else{
node=this.manager.nodes[i].cloneNode(true);
if(node.tagName.toLowerCase()=="tr"){
var _23e=dojo.doc.createElement("table"),_23f=dojo.doc.createElement("tbody");
_23f.appendChild(node);
_23e.appendChild(_23f);
node=_23e;
}
}
node.id="";
td.appendChild(node);
tr.appendChild(td);
dojo.style(tr,"opacity",(9-i)/10);
b.appendChild(tr);
}
a.appendChild(b);
this.node=a;
},destroy:function(){
dojo._destroyElement(this.node);
this.node=false;
},update:function(){
dojo[(this.manager.canDropFlag?"add":"remove")+"Class"](this.node,"dojoDndAvatarCanDrop");
dojo.query("tr.dojoDndAvatarHeader td",this.node).forEach(function(node){
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
},OFFSET_X:16,OFFSET_Y:16,overSource:function(_241){
if(this.avatar){
this.target=(_241&&_241.targetState!="Disabled")?_241:null;
this.canDropFlag=Boolean(this.target);
this.avatar.update();
}
dojo.publish("/dnd/source/over",[_241]);
},outSource:function(_242){
if(this.avatar){
if(this.target==_242){
this.target=null;
this.canDropFlag=false;
this.avatar.update();
dojo.publish("/dnd/source/over",[null]);
}
}else{
dojo.publish("/dnd/source/over",[null]);
}
},startDrag:function(_243,_244,copy){
this.source=_243;
this.nodes=_244;
this.copy=Boolean(copy);
this.avatar=this.makeAvatar();
dojo.body().appendChild(this.avatar.node);
dojo.publish("/dnd/start",[_243,_244,this.copy]);
this.events=[dojo.connect(dojo.doc,"onmousemove",this,"onMouseMove"),dojo.connect(dojo.doc,"onmouseup",this,"onMouseUp"),dojo.connect(dojo.doc,"onkeydown",this,"onKeyDown"),dojo.connect(dojo.doc,"onkeyup",this,"onKeyUp")];
var c="dojoDnd"+(copy?"Copy":"Move");
dojo.addClass(dojo.body(),c);
},canDrop:function(flag){
var _248=Boolean(this.target&&flag);
if(this.canDropFlag!=_248){
this.canDropFlag=_248;
this.avatar.update();
}
},stopDrag:function(){
dojo.removeClass(dojo.body(),"dojoDndCopy");
dojo.removeClass(dojo.body(),"dojoDndMove");
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
var copy=Boolean(this.source.copyState(dojo.dnd.getCopyKeyState(e)));
if(this.copy!=copy){
this._setCopyStatus(copy);
}
}
},onMouseUp:function(e){
if(this.avatar&&(!("mouseButton" in this.source)||(dojo.isSafari&&dojo.dnd._isMac&&this.source.mouseButton==2?e.button==0:this.source.mouseButton==e.button))){
if(this.target&&this.canDropFlag){
var copy=Boolean(this.source.copyState(dojo.dnd.getCopyKeyState(e))),_24f=[this.source,this.nodes,copy,this.target];
dojo.publish("/dnd/drop/before",_24f);
dojo.publish("/dnd/drop",_24f);
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
dojo.removeClass(dojo.body(),"dojoDnd"+(this.copy?"Move":"Copy"));
dojo.addClass(dojo.body(),"dojoDnd"+(this.copy?"Copy":"Move"));
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
dojo.declare("dojo.dnd.Source",dojo.dnd.Selector,{isSource:true,horizontal:false,copyOnly:false,selfCopy:false,selfAccept:true,skipForm:false,withHandles:false,autoSync:false,delay:0,accept:["text"],constructor:function(node,_256){
dojo.mixin(this,dojo.mixin({},_256));
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
},checkAcceptance:function(_259,_25a){
if(this==_259){
return !this.copyOnly||this.selfAccept;
}
for(var i=0;i<_25a.length;++i){
var type=_259.getItem(_25a[i].id).type;
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
},copyState:function(_25f,self){
if(_25f){
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
},markupFactory:function(_261,node){
_261._skipStartup=true;
return new dojo.dnd.Source(node,_261);
},onMouseMove:function(e){
if(this.isDragging&&this.targetState=="Disabled"){
return;
}
dojo.dnd.Source.superclass.onMouseMove.call(this,e);
var m=dojo.dnd.manager();
if(this.isDragging){
var _265=false;
if(this.current){
if(!this.targetBox||this.targetAnchor!=this.current){
this.targetBox={xy:dojo.coords(this.current,true),w:this.current.offsetWidth,h:this.current.offsetHeight};
}
if(this.horizontal){
_265=(e.pageX-this.targetBox.xy.x)<(this.targetBox.w/2);
}else{
_265=(e.pageY-this.targetBox.xy.y)<(this.targetBox.h/2);
}
}
if(this.current!=this.targetAnchor||_265!=this.before){
this._markTargetAnchor(_265);
m.canDrop(!this.current||m.source!=this||!(this.current.id in this.selection));
}
}else{
if(this.mouseDown&&this.isSource&&(Math.abs(e.pageX-this._lastX)>this.delay||Math.abs(e.pageY-this._lastY)>this.delay)){
var _266=this.getSelectedNodes();
if(_266.length){
m.startDrag(this,_266,this.copyState(dojo.dnd.getCopyKeyState(e),true));
}
}
}
},onMouseDown:function(e){
if(this._legalMouseDown(e)&&(!this.skipForm||!dojo.dnd.isFormElement(e))){
this.mouseDown=true;
this.mouseButton=e.button;
this._lastX=e.pageX;
this._lastY=e.pageY;
dojo.dnd.Source.superclass.onMouseDown.call(this,e);
}
},onMouseUp:function(e){
if(this.mouseDown){
this.mouseDown=false;
dojo.dnd.Source.superclass.onMouseUp.call(this,e);
}
},onDndSourceOver:function(_269){
if(this!=_269){
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
},onDndStart:function(_26b,_26c,copy){
if(this.autoSync){
this.sync();
}
if(this.isSource){
this._changeState("Source",this==_26b?(copy?"Copied":"Moved"):"");
}
var _26e=this.accept&&this.checkAcceptance(_26b,_26c);
this._changeState("Target",_26e?"":"Disabled");
if(this==_26b){
dojo.dnd.manager().overSource(this);
}
this.isDragging=true;
},onDndDrop:function(_26f,_270,copy,_272){
if(this==_272){
this.onDrop(_26f,_270,copy);
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
delete this.mouseButton;
this._changeState("Source","");
this._changeState("Target","");
},onDrop:function(_273,_274,copy){
if(this!=_273){
this.onDropExternal(_273,_274,copy);
}else{
this.onDropInternal(_274,copy);
}
},onDropExternal:function(_276,_277,copy){
var _279=this._normalizedCreator;
if(this.creator){
this._normalizedCreator=function(node,hint){
return _279.call(this,_276.getItem(node.id).data,hint);
};
}else{
if(copy){
this._normalizedCreator=function(node,hint){
var t=_276.getItem(node.id);
var n=node.cloneNode(true);
n.id=dojo.dnd.getUniqueId();
return {node:n,data:t.data,type:t.type};
};
}else{
this._normalizedCreator=function(node,hint){
var t=_276.getItem(node.id);
_276.delItem(node.id);
return {node:node,data:t.data,type:t.type};
};
}
}
this.selectNone();
if(!copy&&!this.creator){
_276.selectNone();
}
this.insertNodes(true,_277,this.before,this.current);
if(!copy&&this.creator){
_276.deleteSelectedNodes();
}
this._normalizedCreator=_279;
},onDropInternal:function(_283,copy){
var _285=this._normalizedCreator;
if(this.current&&this.current.id in this.selection){
return;
}
if(copy){
if(this.creator){
this._normalizedCreator=function(node,hint){
return _285.call(this,this.getItem(node.id).data,hint);
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
this.insertNodes(true,_283,this.before,this.current);
this._normalizedCreator=_285;
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
},_markTargetAnchor:function(_28f){
if(this.current==this.targetAnchor&&this.before==_28f){
return;
}
if(this.targetAnchor){
this._removeItemClass(this.targetAnchor,this.before?"Before":"After");
}
this.targetAnchor=this.current;
this.targetBox=null;
this.before=_28f;
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
if(!this.withHandles){
return true;
}
for(var node=e.target;node&&!dojo.hasClass(node,"dojoDndItem");node=node.parentNode){
if(dojo.hasClass(node,"dojoDndHandle")){
return true;
}
}
return false;
}});
dojo.declare("dojo.dnd.Target",dojo.dnd.Source,{constructor:function(node,_294){
this.isSource=false;
dojo.removeClass(this.node,"dojoDndSource");
},markupFactory:function(_295,node){
_295._skipStartup=true;
return new dojo.dnd.Target(node,_295);
}});
dojo.declare("dojo.dnd.AutoSource",dojo.dnd.Source,{constructor:function(node,_298){
this.autoSync=true;
},markupFactory:function(_299,node){
_299._skipStartup=true;
return new dojo.dnd.AutoSource(node,_299);
}});
}
if(!dojo._hasResource["dojo.dnd.TimedMoveable"]){
dojo._hasResource["dojo.dnd.TimedMoveable"]=true;
dojo.provide("dojo.dnd.TimedMoveable");
(function(){
var _29b=dojo.dnd.Moveable.prototype.onMove;
dojo.declare("dojo.dnd.TimedMoveable",dojo.dnd.Moveable,{timeout:40,constructor:function(node,_29d){
if(!_29d){
_29d={};
}
if(_29d.timeout&&typeof _29d.timeout=="number"&&_29d.timeout>=0){
this.timeout=_29d.timeout;
}
},markupFactory:function(_29e,node){
return new dojo.dnd.TimedMoveable(node,_29e);
},onMoveStop:function(_2a0){
if(_2a0._timer){
clearTimeout(_2a0._timer);
_29b.call(this,_2a0,_2a0._leftTop);
}
dojo.dnd.Moveable.prototype.onMoveStop.apply(this,arguments);
},onMove:function(_2a1,_2a2){
_2a1._leftTop=_2a2;
if(!_2a1._timer){
var _t=this;
_2a1._timer=setTimeout(function(){
_2a1._timer=null;
_29b.call(_t,_2a1,_2a1._leftTop);
},this.timeout);
}
}});
})();
}
if(!dojo._hasResource["dojo.fx"]){
dojo._hasResource["dojo.fx"]=true;
dojo.provide("dojo.fx");
dojo.provide("dojo.fx.Toggler");
(function(){
var _2a4={_fire:function(evt,args){
if(this[evt]){
this[evt].apply(this,args||[]);
}
return this;
}};
var _2a7=function(_2a8){
this._index=-1;
this._animations=_2a8||[];
this._current=this._onAnimateCtx=this._onEndCtx=null;
this.duration=0;
dojo.forEach(this._animations,function(a){
this.duration+=a.duration;
if(a.delay){
this.duration+=a.delay;
}
},this);
};
dojo.extend(_2a7,{_onAnimate:function(){
this._fire("onAnimate",arguments);
},_onEnd:function(){
dojo.disconnect(this._onAnimateCtx);
dojo.disconnect(this._onEndCtx);
this._onAnimateCtx=this._onEndCtx=null;
if(this._index+1==this._animations.length){
this._fire("onEnd");
}else{
this._current=this._animations[++this._index];
this._onAnimateCtx=dojo.connect(this._current,"onAnimate",this,"_onAnimate");
this._onEndCtx=dojo.connect(this._current,"onEnd",this,"_onEnd");
this._current.play(0,true);
}
},play:function(_2aa,_2ab){
if(!this._current){
this._current=this._animations[this._index=0];
}
if(!_2ab&&this._current.status()=="playing"){
return this;
}
var _2ac=dojo.connect(this._current,"beforeBegin",this,function(){
this._fire("beforeBegin");
}),_2ad=dojo.connect(this._current,"onBegin",this,function(arg){
this._fire("onBegin",arguments);
}),_2af=dojo.connect(this._current,"onPlay",this,function(arg){
this._fire("onPlay",arguments);
dojo.disconnect(_2ac);
dojo.disconnect(_2ad);
dojo.disconnect(_2af);
});
if(this._onAnimateCtx){
dojo.disconnect(this._onAnimateCtx);
}
this._onAnimateCtx=dojo.connect(this._current,"onAnimate",this,"_onAnimate");
if(this._onEndCtx){
dojo.disconnect(this._onEndCtx);
}
this._onEndCtx=dojo.connect(this._current,"onEnd",this,"_onEnd");
this._current.play.apply(this._current,arguments);
return this;
},pause:function(){
if(this._current){
var e=dojo.connect(this._current,"onPause",this,function(arg){
this._fire("onPause",arguments);
dojo.disconnect(e);
});
this._current.pause();
}
return this;
},gotoPercent:function(_2b3,_2b4){
this.pause();
var _2b5=this.duration*_2b3;
this._current=null;
dojo.some(this._animations,function(a){
if(a.duration<=_2b5){
this._current=a;
return true;
}
_2b5-=a.duration;
return false;
});
if(this._current){
this._current.gotoPercent(_2b5/this._current.duration,_2b4);
}
return this;
},stop:function(_2b7){
if(this._current){
if(_2b7){
for(;this._index+1<this._animations.length;++this._index){
this._animations[this._index].stop(true);
}
this._current=this._animations[this._index];
}
var e=dojo.connect(this._current,"onStop",this,function(arg){
this._fire("onStop",arguments);
dojo.disconnect(e);
});
this._current.stop();
}
return this;
},status:function(){
return this._current?this._current.status():"stopped";
},destroy:function(){
if(this._onAnimateCtx){
dojo.disconnect(this._onAnimateCtx);
}
if(this._onEndCtx){
dojo.disconnect(this._onEndCtx);
}
}});
dojo.extend(_2a7,_2a4);
dojo.fx.chain=function(_2ba){
return new _2a7(_2ba);
};
var _2bb=function(_2bc){
this._animations=_2bc||[];
this._connects=[];
this._finished=0;
this.duration=0;
dojo.forEach(_2bc,function(a){
var _2be=a.duration;
if(a.delay){
_2be+=a.delay;
}
if(this.duration<_2be){
this.duration=_2be;
}
this._connects.push(dojo.connect(a,"onEnd",this,"_onEnd"));
},this);
this._pseudoAnimation=new dojo._Animation({curve:[0,1],duration:this.duration});
dojo.forEach(["beforeBegin","onBegin","onPlay","onAnimate","onPause","onStop"],function(evt){
this._connects.push(dojo.connect(this._pseudoAnimation,evt,dojo.hitch(this,"_fire",evt)));
},this);
};
dojo.extend(_2bb,{_doAction:function(_2c0,args){
dojo.forEach(this._animations,function(a){
a[_2c0].apply(a,args);
});
return this;
},_onEnd:function(){
if(++this._finished==this._animations.length){
this._fire("onEnd");
}
},_call:function(_2c3,args){
var t=this._pseudoAnimation;
t[_2c3].apply(t,args);
},play:function(_2c6,_2c7){
this._finished=0;
this._doAction("play",arguments);
this._call("play",arguments);
return this;
},pause:function(){
this._doAction("pause",arguments);
this._call("pause",arguments);
return this;
},gotoPercent:function(_2c8,_2c9){
var ms=this.duration*_2c8;
dojo.forEach(this._animations,function(a){
a.gotoPercent(a.duration<ms?1:(ms/a.duration),_2c9);
});
this._call("gotoPercent",arguments);
return this;
},stop:function(_2cc){
this._doAction("stop",arguments);
this._call("stop",arguments);
return this;
},status:function(){
return this._pseudoAnimation.status();
},destroy:function(){
dojo.forEach(this._connects,dojo.disconnect);
}});
dojo.extend(_2bb,_2a4);
dojo.fx.combine=function(_2cd){
return new _2bb(_2cd);
};
})();
dojo.declare("dojo.fx.Toggler",null,{constructor:function(args){
var _t=this;
dojo.mixin(_t,args);
_t.node=args.node;
_t._showArgs=dojo.mixin({},args);
_t._showArgs.node=_t.node;
_t._showArgs.duration=_t.showDuration;
_t.showAnim=_t.showFunc(_t._showArgs);
_t._hideArgs=dojo.mixin({},args);
_t._hideArgs.node=_t.node;
_t._hideArgs.duration=_t.hideDuration;
_t.hideAnim=_t.hideFunc(_t._hideArgs);
dojo.connect(_t.showAnim,"beforeBegin",dojo.hitch(_t.hideAnim,"stop",true));
dojo.connect(_t.hideAnim,"beforeBegin",dojo.hitch(_t.showAnim,"stop",true));
},node:null,showFunc:dojo.fadeIn,hideFunc:dojo.fadeOut,showDuration:200,hideDuration:200,show:function(_2d0){
return this.showAnim.play(_2d0||0);
},hide:function(_2d1){
return this.hideAnim.play(_2d1||0);
}});
dojo.fx.wipeIn=function(args){
args.node=dojo.byId(args.node);
var node=args.node,s=node.style,o;
var anim=dojo.animateProperty(dojo.mixin({properties:{height:{start:function(){
o=s.overflow;
s.overflow="hidden";
if(s.visibility=="hidden"||s.display=="none"){
s.height="1px";
s.display="";
s.visibility="";
return 1;
}else{
var _2d7=dojo.style(node,"height");
return Math.max(_2d7,1);
}
},end:function(){
return node.scrollHeight;
}}}},args));
dojo.connect(anim,"onEnd",function(){
s.height="auto";
s.overflow=o;
});
return anim;
};
dojo.fx.wipeOut=function(args){
var node=args.node=dojo.byId(args.node);
var s=node.style;
var o;
var anim=dojo.animateProperty(dojo.mixin({properties:{height:{end:1}}},args));
dojo.connect(anim,"beforeBegin",function(){
o=s.overflow;
s.overflow="hidden";
s.display="";
});
dojo.connect(anim,"onEnd",function(){
s.overflow=o;
s.height="auto";
s.display="none";
});
return anim;
};
dojo.fx.slideTo=function(args){
var node=(args.node=dojo.byId(args.node));
var top=null;
var left=null;
var init=(function(n){
return function(){
var cs=dojo.getComputedStyle(n);
var pos=cs.position;
top=(pos=="absolute"?n.offsetTop:parseInt(cs.top)||0);
left=(pos=="absolute"?n.offsetLeft:parseInt(cs.left)||0);
if(pos!="absolute"&&pos!="relative"){
var ret=dojo.coords(n,true);
top=ret.y;
left=ret.x;
n.style.position="absolute";
n.style.top=top+"px";
n.style.left=left+"px";
}
};
})(node);
init();
var anim=dojo.animateProperty(dojo.mixin({properties:{top:{end:args.top||0},left:{end:args.left||0}}},args));
dojo.connect(anim,"beforeBegin",anim,init);
return anim;
};
}
if(!dojo._hasResource["dijit._base.focus"]){
dojo._hasResource["dijit._base.focus"]=true;
dojo.provide("dijit._base.focus");
dojo.mixin(dijit,{_curFocus:null,_prevFocus:null,isCollapsed:function(){
var _2e7=dojo.doc;
if(_2e7.selection){
var s=_2e7.selection;
if(s.type=="Text"){
return !s.createRange().htmlText.length;
}else{
return !s.createRange().length;
}
}else{
var _2e9=dojo.global;
var _2ea=_2e9.getSelection();
if(dojo.isString(_2ea)){
return !_2ea;
}else{
return _2ea.isCollapsed||!_2ea.toString();
}
}
},getBookmark:function(){
var _2eb,_2ec=dojo.doc.selection;
if(_2ec){
var _2ed=_2ec.createRange();
if(_2ec.type.toUpperCase()=="CONTROL"){
if(_2ed.length){
_2eb=[];
var i=0,len=_2ed.length;
while(i<len){
_2eb.push(_2ed.item(i++));
}
}else{
_2eb=null;
}
}else{
_2eb=_2ed.getBookmark();
}
}else{
if(window.getSelection){
_2ec=dojo.global.getSelection();
if(_2ec){
_2ed=_2ec.getRangeAt(0);
_2eb=_2ed.cloneRange();
}
}else{
console.warn("No idea how to store the current selection for this browser!");
}
}
return _2eb;
},moveToBookmark:function(_2f0){
var _2f1=dojo.doc;
if(_2f1.selection){
var _2f2;
if(dojo.isArray(_2f0)){
_2f2=_2f1.body.createControlRange();
dojo.forEach(_2f0,function(n){
_2f2.addElement(n);
});
}else{
_2f2=_2f1.selection.createRange();
_2f2.moveToBookmark(_2f0);
}
_2f2.select();
}else{
var _2f4=dojo.global.getSelection&&dojo.global.getSelection();
if(_2f4&&_2f4.removeAllRanges){
_2f4.removeAllRanges();
_2f4.addRange(_2f0);
}else{
console.warn("No idea how to restore selection for this browser!");
}
}
},getFocus:function(menu,_2f6){
return {node:menu&&dojo.isDescendant(dijit._curFocus,menu.domNode)?dijit._prevFocus:dijit._curFocus,bookmark:!dojo.withGlobal(_2f6||dojo.global,dijit.isCollapsed)?dojo.withGlobal(_2f6||dojo.global,dijit.getBookmark):null,openedForWindow:_2f6};
},focus:function(_2f7){
if(!_2f7){
return;
}
var node="node" in _2f7?_2f7.node:_2f7,_2f9=_2f7.bookmark,_2fa=_2f7.openedForWindow;
if(node){
var _2fb=(node.tagName.toLowerCase()=="iframe")?node.contentWindow:node;
if(_2fb&&_2fb.focus){
try{
_2fb.focus();
}
catch(e){
}
}
dijit._onFocusNode(node);
}
if(_2f9&&dojo.withGlobal(_2fa||dojo.global,dijit.isCollapsed)){
if(_2fa){
_2fa.focus();
}
try{
dojo.withGlobal(_2fa||dojo.global,dijit.moveToBookmark,null,[_2f9]);
}
catch(e){
}
}
},_activeStack:[],registerWin:function(_2fc){
if(!_2fc){
_2fc=window;
}
dojo.connect(_2fc.document,"onmousedown",function(evt){
dijit._justMouseDowned=true;
setTimeout(function(){
dijit._justMouseDowned=false;
},0);
dijit._onTouchNode(evt.target||evt.srcElement);
});
var doc=_2fc.document;
if(doc){
if(dojo.isIE){
doc.attachEvent("onactivate",function(evt){
if(evt.srcElement.tagName.toLowerCase()!="#document"){
dijit._onFocusNode(evt.srcElement);
}
});
doc.attachEvent("ondeactivate",function(evt){
dijit._onBlurNode(evt.srcElement);
});
}else{
doc.addEventListener("focus",function(evt){
dijit._onFocusNode(evt.target);
},true);
doc.addEventListener("blur",function(evt){
dijit._onBlurNode(evt.target);
},true);
}
}
doc=null;
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
},_onTouchNode:function(node){
if(dijit._clearActiveWidgetsTimer){
clearTimeout(dijit._clearActiveWidgetsTimer);
delete dijit._clearActiveWidgetsTimer;
}
var _305=[];
try{
while(node){
if(node.dijitPopupParent){
node=dijit.byId(node.dijitPopupParent).domNode;
}else{
if(node.tagName&&node.tagName.toLowerCase()=="body"){
if(node===dojo.body()){
break;
}
node=dijit.getDocumentWindow(node.ownerDocument).frameElement;
}else{
var id=node.getAttribute&&node.getAttribute("widgetId");
if(id){
_305.unshift(id);
}
node=node.parentNode;
}
}
}
}
catch(e){
}
dijit._setStack(_305);
},_onFocusNode:function(node){
if(!node){
return;
}
if(node.nodeName&&node.nodeName.toLowerCase()=="body"){
return;
}
if(node.nodeType==9){
var _308=dijit.getDocumentWindow(node).frameElement;
if(!_308){
return;
}
node=_308;
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
},_setStack:function(_309){
var _30a=dijit._activeStack;
dijit._activeStack=_309;
for(var _30b=0;_30b<Math.min(_30a.length,_309.length);_30b++){
if(_30a[_30b]!=_309[_30b]){
break;
}
}
for(var i=_30a.length-1;i>=_30b;i--){
var _30d=dijit.byId(_30a[i]);
if(_30d){
_30d._focused=false;
_30d._hasBeenBlurred=true;
if(_30d._onBlur){
_30d._onBlur();
}
if(_30d._setStateClass){
_30d._setStateClass();
}
dojo.publish("widgetBlur",[_30d]);
}
}
for(i=_30b;i<_309.length;i++){
_30d=dijit.byId(_309[i]);
if(_30d){
_30d._focused=true;
if(_30d._onFocus){
_30d._onFocus();
}
if(_30d._setStateClass){
_30d._setStateClass();
}
dojo.publish("widgetFocus",[_30d]);
}
}
}});
dojo.addOnLoad(dijit.registerWin);
}
if(!dojo._hasResource["dijit._base.manager"]){
dojo._hasResource["dijit._base.manager"]=true;
dojo.provide("dijit._base.manager");
dojo.declare("dijit.WidgetSet",null,{constructor:function(){
this._hash={};
},add:function(_30e){
if(this._hash[_30e.id]){
throw new Error("Tried to register widget with id=="+_30e.id+" but that id is already registered");
}
this._hash[_30e.id]=_30e;
},remove:function(id){
delete this._hash[id];
},forEach:function(func){
for(var id in this._hash){
func(this._hash[id]);
}
},filter:function(_312){
var res=new dijit.WidgetSet();
this.forEach(function(_314){
if(_312(_314)){
res.add(_314);
}
});
return res;
},byId:function(id){
return this._hash[id];
},byClass:function(cls){
return this.filter(function(_317){
return _317.declaredClass==cls;
});
}});
dijit.registry=new dijit.WidgetSet();
dijit._widgetTypeCtr={};
dijit.getUniqueId=function(_318){
var id;
do{
id=_318+"_"+(_318 in dijit._widgetTypeCtr?++dijit._widgetTypeCtr[_318]:dijit._widgetTypeCtr[_318]=0);
}while(dijit.byId(id));
return id;
};
if(dojo.isIE){
dojo.addOnWindowUnload(function(){
dijit.registry.forEach(function(_31a){
_31a.destroy();
});
});
}
dijit.byId=function(id){
return (dojo.isString(id))?dijit.registry.byId(id):id;
};
dijit.byNode=function(node){
return dijit.registry.byId(node.getAttribute("widgetId"));
};
dijit.getEnclosingWidget=function(node){
while(node){
if(node.getAttribute&&node.getAttribute("widgetId")){
return dijit.registry.byId(node.getAttribute("widgetId"));
}
node=node.parentNode;
}
return null;
};
dijit._tabElements={area:true,button:true,input:true,object:true,select:true,textarea:true};
dijit._isElementShown=function(elem){
var _31f=dojo.style(elem);
return (_31f.visibility!="hidden")&&(_31f.visibility!="collapsed")&&(_31f.display!="none")&&(dojo.attr(elem,"type")!="hidden");
};
dijit.isTabNavigable=function(elem){
if(dojo.hasAttr(elem,"disabled")){
return false;
}
var _321=dojo.hasAttr(elem,"tabindex");
var _322=dojo.attr(elem,"tabindex");
if(_321&&_322>=0){
return true;
}
var name=elem.nodeName.toLowerCase();
if(((name=="a"&&dojo.hasAttr(elem,"href"))||dijit._tabElements[name])&&(!_321||_322>=0)){
return true;
}
return false;
};
dijit._getTabNavigable=function(root){
var _325,last,_327,_328,_329,_32a;
var _32b=function(_32c){
dojo.query("> *",_32c).forEach(function(_32d){
var _32e=dijit._isElementShown(_32d);
if(_32e&&dijit.isTabNavigable(_32d)){
var _32f=dojo.attr(_32d,"tabindex");
if(!dojo.hasAttr(_32d,"tabindex")||_32f==0){
if(!_325){
_325=_32d;
}
last=_32d;
}else{
if(_32f>0){
if(!_327||_32f<_328){
_328=_32f;
_327=_32d;
}
if(!_329||_32f>=_32a){
_32a=_32f;
_329=_32d;
}
}
}
}
if(_32e&&_32d.nodeName.toUpperCase()!="SELECT"){
_32b(_32d);
}
});
};
if(dijit._isElementShown(root)){
_32b(root);
}
return {first:_325,last:last,lowest:_327,highest:_329};
};
dijit.getFirstInTabbingOrder=function(root){
var _331=dijit._getTabNavigable(dojo.byId(root));
return _331.lowest?_331.lowest:_331.first;
};
dijit.getLastInTabbingOrder=function(root){
var _333=dijit._getTabNavigable(dojo.byId(root));
return _333.last?_333.last:_333.highest;
};
dijit.defaultDuration=dojo.config["defaultDuration"]||200;
}
if(!dojo._hasResource["dojo.AdapterRegistry"]){
dojo._hasResource["dojo.AdapterRegistry"]=true;
dojo.provide("dojo.AdapterRegistry");
dojo.AdapterRegistry=function(_334){
this.pairs=[];
this.returnWrappers=_334||false;
};
dojo.extend(dojo.AdapterRegistry,{register:function(name,_336,wrap,_338,_339){
this.pairs[((_339)?"unshift":"push")]([name,_336,wrap,_338]);
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
var _33f=dojo.global;
var _340=dojo.doc;
var w=0,h=0;
var de=_340.documentElement;
var dew=de.clientWidth,deh=de.clientHeight;
if(dojo.isMozilla){
var minw,minh,maxw,maxh;
var dbw=_340.body.clientWidth;
if(dbw>dew){
minw=dew;
maxw=dbw;
}else{
maxw=dew;
minw=dbw;
}
var dbh=_340.body.clientHeight;
if(dbh>deh){
minh=deh;
maxh=dbh;
}else{
maxh=deh;
minh=dbh;
}
w=(maxw>_33f.innerWidth)?minw:maxw;
h=(maxh>_33f.innerHeight)?minh:maxh;
}else{
if(!dojo.isOpera&&_33f.innerWidth){
w=_33f.innerWidth;
h=_33f.innerHeight;
}else{
if(dojo.isIE&&de&&deh){
w=dew;
h=deh;
}else{
if(dojo.body().clientWidth){
w=dojo.body().clientWidth;
h=dojo.body().clientHeight;
}
}
}
}
var _34c=dojo._docScroll();
return {w:w,h:h,l:_34c.x,t:_34c.y};
};
dijit.placeOnScreen=function(node,pos,_34f,_350){
var _351=dojo.map(_34f,function(_352){
return {corner:_352,pos:pos};
});
return dijit._place(node,_351);
};
dijit._place=function(node,_354,_355){
var view=dijit.getViewport();
if(!node.parentNode||String(node.parentNode.tagName).toLowerCase()!="body"){
dojo.body().appendChild(node);
}
var best=null;
dojo.some(_354,function(_358){
var _359=_358.corner;
var pos=_358.pos;
if(_355){
_355(node,_358.aroundCorner,_359);
}
var _35b=node.style;
var _35c=_35b.display;
var _35d=_35b.visibility;
_35b.visibility="hidden";
_35b.display="";
var mb=dojo.marginBox(node);
_35b.display=_35c;
_35b.visibility=_35d;
var _35f=(_359.charAt(1)=="L"?pos.x:Math.max(view.l,pos.x-mb.w)),_360=(_359.charAt(0)=="T"?pos.y:Math.max(view.t,pos.y-mb.h)),endX=(_359.charAt(1)=="L"?Math.min(view.l+view.w,_35f+mb.w):pos.x),endY=(_359.charAt(0)=="T"?Math.min(view.t+view.h,_360+mb.h):pos.y),_363=endX-_35f,_364=endY-_360,_365=(mb.w-_363)+(mb.h-_364);
if(best==null||_365<best.overflow){
best={corner:_359,aroundCorner:_358.aroundCorner,x:_35f,y:_360,w:_363,h:_364,overflow:_365};
}
return !_365;
});
node.style.left=best.x+"px";
node.style.top=best.y+"px";
if(best.overflow&&_355){
_355(node,best.aroundCorner,best.corner);
}
return best;
};
dijit.placeOnScreenAroundNode=function(node,_367,_368,_369){
_367=dojo.byId(_367);
var _36a=_367.style.display;
_367.style.display="";
var _36b=_367.offsetWidth;
var _36c=_367.offsetHeight;
var _36d=dojo.coords(_367,true);
_367.style.display=_36a;
return dijit._placeOnScreenAroundRect(node,_36d.x,_36d.y,_36b,_36c,_368,_369);
};
dijit.placeOnScreenAroundRectangle=function(node,_36f,_370,_371){
return dijit._placeOnScreenAroundRect(node,_36f.x,_36f.y,_36f.width,_36f.height,_370,_371);
};
dijit._placeOnScreenAroundRect=function(node,x,y,_375,_376,_377,_378){
var _379=[];
for(var _37a in _377){
_379.push({aroundCorner:_37a,corner:_377[_37a],pos:{x:x+(_37a.charAt(1)=="L"?0:_375),y:y+(_37a.charAt(0)=="T"?0:_376)}});
}
return dijit._place(node,_379,_378);
};
dijit.placementRegistry=new dojo.AdapterRegistry();
dijit.placementRegistry.register("node",function(n,x){
return typeof x=="object"&&typeof x.offsetWidth!="undefined"&&typeof x.offsetHeight!="undefined";
},dijit.placeOnScreenAroundNode);
dijit.placementRegistry.register("rect",function(n,x){
return typeof x=="object"&&"x" in x&&"y" in x&&"width" in x&&"height" in x;
},dijit.placeOnScreenAroundRectangle);
dijit.placeOnScreenAroundElement=function(node,_380,_381,_382){
return dijit.placementRegistry.match.apply(dijit.placementRegistry,arguments);
};
}
if(!dojo._hasResource["dijit._base.window"]){
dojo._hasResource["dijit._base.window"]=true;
dojo.provide("dijit._base.window");
dijit.getDocumentWindow=function(doc){
if(dojo.isIE&&window!==document.parentWindow&&!doc._parentWindow){
doc.parentWindow.execScript("document._parentWindow = window;","Javascript");
var win=doc._parentWindow;
doc._parentWindow=null;
return win;
}
return doc._parentWindow||doc.parentWindow||doc.defaultView;
};
}
if(!dojo._hasResource["dijit._base.popup"]){
dojo._hasResource["dijit._base.popup"]=true;
dojo.provide("dijit._base.popup");
dijit.popup=new function(){
var _385=[],_386=1000,_387=1;
this.prepare=function(node){
dojo.body().appendChild(node);
var s=node.style;
if(s.display=="none"){
s.display="";
}
s.visibility="hidden";
s.position="absolute";
s.top="-9999px";
};
this.open=function(args){
var _38b=args.popup,_38c=args.orient||{"BL":"TL","TL":"BL"},_38d=args.around,id=(args.around&&args.around.id)?(args.around.id+"_dropdown"):("popup_"+_387++);
var _38f=dojo.doc.createElement("div");
dijit.setWaiRole(_38f,"presentation");
_38f.id=id;
_38f.className="dijitPopup";
_38f.style.zIndex=_386+_385.length;
_38f.style.left=_38f.style.top="0px";
_38f.style.visibility="hidden";
if(args.parent){
_38f.dijitPopupParent=args.parent.id;
}
dojo.body().appendChild(_38f);
var s=_38b.domNode.style;
s.display="";
s.visibility="";
s.position="";
_38f.appendChild(_38b.domNode);
var _391=new dijit.BackgroundIframe(_38f);
var best=_38d?dijit.placeOnScreenAroundElement(_38f,_38d,_38c,_38b.orient?dojo.hitch(_38b,"orient"):null):dijit.placeOnScreen(_38f,args,_38c=="R"?["TR","BR","TL","BL"]:["TL","BL","TR","BR"]);
_38f.style.visibility="visible";
var _393=[];
var _394=function(){
for(var pi=_385.length-1;pi>0&&_385[pi].parent===_385[pi-1].widget;pi--){
}
return _385[pi];
};
_393.push(dojo.connect(_38f,"onkeypress",this,function(evt){
if(evt.charOrCode==dojo.keys.ESCAPE&&args.onCancel){
dojo.stopEvent(evt);
args.onCancel();
}else{
if(evt.charOrCode===dojo.keys.TAB){
dojo.stopEvent(evt);
var _397=_394();
if(_397&&_397.onCancel){
_397.onCancel();
}
}
}
}));
if(_38b.onCancel){
_393.push(dojo.connect(_38b,"onCancel",null,args.onCancel));
}
_393.push(dojo.connect(_38b,_38b.onExecute?"onExecute":"onChange",null,function(){
var _398=_394();
if(_398&&_398.onExecute){
_398.onExecute();
}
}));
_385.push({wrapper:_38f,iframe:_391,widget:_38b,parent:args.parent,onExecute:args.onExecute,onCancel:args.onCancel,onClose:args.onClose,handlers:_393});
if(_38b.onOpen){
_38b.onOpen(best);
}
return best;
};
this.close=function(_399){
while(dojo.some(_385,function(elem){
return elem.widget==_399;
})){
var top=_385.pop(),_39c=top.wrapper,_39d=top.iframe,_39e=top.widget,_39f=top.onClose;
if(_39e.onClose){
_39e.onClose();
}
dojo.forEach(top.handlers,dojo.disconnect);
if(!_39e||!_39e.domNode){
return;
}
this.prepare(_39e.domNode);
_39d.destroy();
dojo._destroyElement(_39c);
if(_39f){
_39f();
}
}
};
}();
dijit._frames=new function(){
var _3a0=[];
this.pop=function(){
var _3a1;
if(_3a0.length){
_3a1=_3a0.pop();
_3a1.style.display="";
}else{
if(dojo.isIE){
var burl=dojo.config["dojoBlankHtmlUrl"]||(dojo.moduleUrl("dojo","resources/blank.html")+"")||"javascript:\"\"";
var html="<iframe src='"+burl+"'"+" style='position: absolute; left: 0px; top: 0px;"+"z-index: -1; filter:Alpha(Opacity=\"0\");'>";
_3a1=dojo.doc.createElement(html);
}else{
_3a1=dojo.doc.createElement("iframe");
_3a1.src="javascript:\"\"";
_3a1.className="dijitBackgroundIframe";
}
_3a1.tabIndex=-1;
dojo.body().appendChild(_3a1);
}
return _3a1;
};
this.push=function(_3a4){
_3a4.style.display="";
if(dojo.isIE){
_3a4.style.removeExpression("width");
_3a4.style.removeExpression("height");
}
_3a0.push(_3a4);
};
}();
if(dojo.isIE<7){
dojo.addOnLoad(function(){
var f=dijit._frames;
dojo.forEach([f.pop()],f.push);
});
}
dijit.BackgroundIframe=function(node){
if(!node.id){
throw new Error("no id");
}
if((dojo.isIE&&dojo.isIE<7)||(dojo.isFF&&dojo.isFF<3&&dojo.hasClass(dojo.body(),"dijit_a11y"))){
var _3a7=dijit._frames.pop();
node.appendChild(_3a7);
if(dojo.isIE){
_3a7.style.setExpression("width",dojo._scopeName+".doc.getElementById('"+node.id+"').offsetWidth");
_3a7.style.setExpression("height",dojo._scopeName+".doc.getElementById('"+node.id+"').offsetHeight");
}
this.iframe=_3a7;
}
};
dojo.extend(dijit.BackgroundIframe,{destroy:function(){
if(this.iframe){
dijit._frames.push(this.iframe);
delete this.iframe;
}
}});
}
if(!dojo._hasResource["dijit._base.scroll"]){
dojo._hasResource["dijit._base.scroll"]=true;
dojo.provide("dijit._base.scroll");
dijit.scrollIntoView=function(node){
node=dojo.byId(node);
var body=node.ownerDocument.body;
var html=body.parentNode;
if(dojo.isFF==2||node==body||node==html){
node.scrollIntoView(false);
return;
}
var rtl=!dojo._isBodyLtr();
var _3ac=dojo.doc.compatMode!="BackCompat";
var _3ad=(_3ac&&!dojo.isSafari)?html:body;
function addPseudoAttrs(_3ae){
var _3af=_3ae.parentNode;
var _3b0=_3ae.offsetParent;
if(_3b0==null){
_3ae=_3ad;
_3b0=html;
_3af=null;
}
_3ae._offsetParent=(_3b0==body)?_3ad:_3b0;
_3ae._parent=(_3af==body)?_3ad:_3af;
_3ae._start={H:_3ae.offsetLeft,V:_3ae.offsetTop};
_3ae._scroll={H:_3ae.scrollLeft,V:_3ae.scrollTop};
_3ae._renderedSize={H:_3ae.offsetWidth,V:_3ae.offsetHeight};
var bp=dojo._getBorderExtents(_3ae);
_3ae._borderStart={H:bp.l,V:bp.t};
_3ae._borderSize={H:bp.w,V:bp.h};
_3ae._clientSize=(_3ae._offsetParent==html&&dojo.isSafari&&_3ac)?{H:html.clientWidth,V:html.clientHeight}:{H:_3ae.clientWidth,V:_3ae.clientHeight};
_3ae._scrollBarSize={V:null,H:null};
for(var dir in _3ae._scrollBarSize){
var _3b3=_3ae._renderedSize[dir]-_3ae._clientSize[dir]-_3ae._borderSize[dir];
_3ae._scrollBarSize[dir]=(_3ae._clientSize[dir]>0&&_3b3>=15&&_3b3<=17)?_3b3:0;
}
_3ae._isScrollable={V:null,H:null};
for(dir in _3ae._isScrollable){
var _3b4=dir=="H"?"V":"H";
_3ae._isScrollable[dir]=_3ae==_3ad||_3ae._scroll[dir]||_3ae._scrollBarSize[_3b4];
}
};
var _3b5=node;
while(_3b5!=null){
addPseudoAttrs(_3b5);
var next=_3b5._parent;
if(next){
next._child=_3b5;
}
_3b5=next;
}
for(var dir in _3ad._renderedSize){
_3ad._renderedSize[dir]=Math.min(_3ad._clientSize[dir],_3ad._renderedSize[dir]);
}
var _3b8=node;
while(_3b8!=_3ad){
_3b5=_3b8._parent;
if(_3b5.tagName=="TD"){
var _3b9=_3b5._parent._parent._parent;
if(_3b9._offsetParent==_3b8._offsetParent&&_3b5._offsetParent!=_3b8._offsetParent){
_3b5=_3b9;
}
}
var _3ba=_3b8==_3ad||(_3b5._offsetParent!=_3b8._offsetParent);
for(dir in _3b8._start){
var _3bb=dir=="H"?"V":"H";
if(rtl&&dir=="H"&&(dojo.isSafari||dojo.isIE)&&_3b5._clientSize.H>0){
var _3bc=_3b5.scrollWidth-_3b5._clientSize.H;
if(_3bc>0){
_3b5._scroll.H-=_3bc;
}
}
if(dojo.isIE&&_3b5._offsetParent.tagName=="TABLE"){
_3b5._start[dir]-=_3b5._offsetParent._borderStart[dir];
_3b5._borderStart[dir]=_3b5._borderSize[dir]=0;
}
if(_3b5._clientSize[dir]==0){
_3b5._renderedSize[dir]=_3b5._clientSize[dir]=_3b5._child._clientSize[dir];
if(rtl&&dir=="H"){
_3b5._start[dir]-=_3b5._renderedSize[dir];
}
}else{
_3b5._renderedSize[dir]-=_3b5._borderSize[dir]+_3b5._scrollBarSize[dir];
}
_3b5._start[dir]+=_3b5._borderStart[dir];
var _3bd=_3b8._start[dir]-(_3ba?0:_3b5._start[dir])-_3b5._scroll[dir];
var _3be=_3bd+_3b8._renderedSize[dir]-_3b5._renderedSize[dir];
var _3bf,_3c0=(dir=="H")?"scrollLeft":"scrollTop";
var _3c1=(dir=="H"&&rtl);
var _3c2=_3c1?-_3be:_3bd;
var _3c3=_3c1?-_3bd:_3be;
if(_3c2<=0){
_3bf=_3c2;
}else{
if(_3c3<=0){
_3bf=0;
}else{
if(_3c2<_3c3){
_3bf=_3c2;
}else{
_3bf=_3c3;
}
}
}
var _3c4=0;
if(_3bf!=0){
var _3c5=_3b5[_3c0];
_3b5[_3c0]+=_3c1?-_3bf:_3bf;
_3c4=_3b5[_3c0]-_3c5;
_3bd-=_3c4;
_3c3-=_3c1?-_3c4:_3c4;
}
_3b5._renderedSize[dir]=_3b8._renderedSize[dir]+_3b5._scrollBarSize[dir]-((_3b5._isScrollable[dir]&&_3c3>0)?_3c3:0);
_3b5._start[dir]+=(_3bd>=0||!_3b5._isScrollable[dir])?_3bd:0;
}
_3b8=_3b5;
}
};
}
if(!dojo._hasResource["dijit._base.sniff"]){
dojo._hasResource["dijit._base.sniff"]=true;
dojo.provide("dijit._base.sniff");
(function(){
var d=dojo;
var ie=d.isIE;
var _3c8=d.isOpera;
var maj=Math.floor;
var ff=d.isFF;
var _3cb=d.boxModel.replace(/-/,"");
var _3cc={dj_ie:ie,dj_ie6:maj(ie)==6,dj_ie7:maj(ie)==7,dj_iequirks:ie&&d.isQuirks,dj_opera:_3c8,dj_opera8:maj(_3c8)==8,dj_opera9:maj(_3c8)==9,dj_khtml:d.isKhtml,dj_safari:d.isSafari,dj_gecko:d.isMozilla,dj_ff2:maj(ff)==2,dj_ff3:maj(ff)==3};
_3cc["dj_"+_3cb]=true;
var html=dojo.doc.documentElement;
for(var p in _3cc){
if(_3cc[p]){
if(html.className){
html.className+=" "+p;
}else{
html.className=p;
}
}
}
dojo._loaders.unshift(function(){
if(!dojo._isBodyLtr()){
html.className+=" dijitRtl";
for(var p in _3cc){
if(_3cc[p]){
html.className+=" "+p+"-rtl";
}
}
}
});
})();
}
if(!dojo._hasResource["dijit._base.typematic"]){
dojo._hasResource["dijit._base.typematic"]=true;
dojo.provide("dijit._base.typematic");
dijit.typematic={_fireEventAndReload:function(){
this._timer=null;
this._callback(++this._count,this._node,this._evt);
this._currentTimeout=(this._currentTimeout<0)?this._initialDelay:((this._subsequentDelay>1)?this._subsequentDelay:Math.round(this._currentTimeout*this._subsequentDelay));
this._timer=setTimeout(dojo.hitch(this,"_fireEventAndReload"),this._currentTimeout);
},trigger:function(evt,_3d1,node,_3d3,obj,_3d5,_3d6){
if(obj!=this._obj){
this.stop();
this._initialDelay=_3d6||500;
this._subsequentDelay=_3d5||0.9;
this._obj=obj;
this._evt=evt;
this._node=node;
this._currentTimeout=-1;
this._count=-1;
this._callback=dojo.hitch(_3d1,_3d3);
this._fireEventAndReload();
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
},addKeyListener:function(node,_3d8,_3d9,_3da,_3db,_3dc){
if(_3d8.keyCode){
_3d8.charOrCode=_3d8.keyCode;
dojo.deprecated("keyCode attribute parameter for dijit.typematic.addKeyListener is deprecated. Use charOrCode instead.","","2.0");
}else{
if(_3d8.charCode){
_3d8.charOrCode=String.fromCharCode(_3d8.charCode);
dojo.deprecated("charCode attribute parameter for dijit.typematic.addKeyListener is deprecated. Use charOrCode instead.","","2.0");
}
}
return [dojo.connect(node,"onkeypress",this,function(evt){
if(evt.charOrCode==_3d8.charOrCode&&(_3d8.ctrlKey===undefined||_3d8.ctrlKey==evt.ctrlKey)&&(_3d8.altKey===undefined||_3d8.altKey==evt.ctrlKey)&&(_3d8.shiftKey===undefined||_3d8.shiftKey==evt.ctrlKey)){
dojo.stopEvent(evt);
dijit.typematic.trigger(_3d8,_3d9,node,_3da,_3d8,_3db,_3dc);
}else{
if(dijit.typematic._obj==_3d8){
dijit.typematic.stop();
}
}
}),dojo.connect(node,"onkeyup",this,function(evt){
if(dijit.typematic._obj==_3d8){
dijit.typematic.stop();
}
})];
},addMouseListener:function(node,_3e0,_3e1,_3e2,_3e3){
var dc=dojo.connect;
return [dc(node,"mousedown",this,function(evt){
dojo.stopEvent(evt);
dijit.typematic.trigger(evt,_3e0,node,_3e1,node,_3e2,_3e3);
}),dc(node,"mouseup",this,function(evt){
dojo.stopEvent(evt);
dijit.typematic.stop();
}),dc(node,"mouseout",this,function(evt){
dojo.stopEvent(evt);
dijit.typematic.stop();
}),dc(node,"mousemove",this,function(evt){
dojo.stopEvent(evt);
}),dc(node,"dblclick",this,function(evt){
dojo.stopEvent(evt);
if(dojo.isIE){
dijit.typematic.trigger(evt,_3e0,node,_3e1,node,_3e2,_3e3);
setTimeout(dojo.hitch(this,dijit.typematic.stop),50);
}
})];
},addListener:function(_3ea,_3eb,_3ec,_3ed,_3ee,_3ef,_3f0){
return this.addKeyListener(_3eb,_3ec,_3ed,_3ee,_3ef,_3f0).concat(this.addMouseListener(_3ea,_3ed,_3ee,_3ef,_3f0));
}};
}
if(!dojo._hasResource["dijit._base.wai"]){
dojo._hasResource["dijit._base.wai"]=true;
dojo.provide("dijit._base.wai");
dijit.wai={onload:function(){
var div=dojo.doc.createElement("div");
div.id="a11yTestNode";
div.style.cssText="border: 1px solid;"+"border-color:red green;"+"position: absolute;"+"height: 5px;"+"top: -999px;"+"background-image: url(\""+(dojo.config.blankGif||dojo.moduleUrl("dojo","resources/blank.gif"))+"\");";
dojo.body().appendChild(div);
var cs=dojo.getComputedStyle(div);
if(cs){
var _3f3=cs.backgroundImage;
var _3f4=(cs.borderTopColor==cs.borderRightColor)||(_3f3!=null&&(_3f3=="none"||_3f3=="url(invalid-url:)"));
dojo[_3f4?"addClass":"removeClass"](dojo.body(),"dijit_a11y");
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
dojo.mixin(dijit,{_XhtmlRoles:/banner|contentinfo|definition|main|navigation|search|note|secondary|seealso/,hasWaiRole:function(elem,role){
var _3f7=this.getWaiRole(elem);
if(role){
return (_3f7.indexOf(role)>-1);
}else{
return (_3f7.length>0);
}
},getWaiRole:function(elem){
return dojo.trim((dojo.attr(elem,"role")||"").replace(this._XhtmlRoles,"").replace("wairole:",""));
},setWaiRole:function(elem,role){
var _3fb=dojo.attr(elem,"role")||"";
if(dojo.isFF<3||!this._XhtmlRoles.test(_3fb)){
dojo.attr(elem,"role",dojo.isFF<3?"wairole:"+role:role);
}else{
if((" "+_3fb+" ").indexOf(" "+role+" ")<0){
var _3fc=dojo.trim(_3fb.replace(this._XhtmlRoles,""));
var _3fd=dojo.trim(_3fb.replace(_3fc,""));
dojo.attr(elem,"role",_3fd+(_3fd?" ":"")+role);
}
}
},removeWaiRole:function(elem,role){
var _400=dojo.attr(elem,"role");
if(!_400){
return;
}
if(role){
var _401=dojo.isFF<3?"wairole:"+role:role;
var t=dojo.trim((" "+_400+" ").replace(" "+_401+" "," "));
dojo.attr(elem,"role",t);
}else{
elem.removeAttribute("role");
}
},hasWaiState:function(elem,_404){
if(dojo.isFF<3){
return elem.hasAttributeNS("http://www.w3.org/2005/07/aaa",_404);
}else{
return elem.hasAttribute?elem.hasAttribute("aria-"+_404):!!elem.getAttribute("aria-"+_404);
}
},getWaiState:function(elem,_406){
if(dojo.isFF<3){
return elem.getAttributeNS("http://www.w3.org/2005/07/aaa",_406);
}else{
var _407=elem.getAttribute("aria-"+_406);
return _407?_407:"";
}
},setWaiState:function(elem,_409,_40a){
if(dojo.isFF<3){
elem.setAttributeNS("http://www.w3.org/2005/07/aaa","aaa:"+_409,_40a);
}else{
elem.setAttribute("aria-"+_409,_40a);
}
},removeWaiState:function(elem,_40c){
if(dojo.isFF<3){
elem.removeAttributeNS("http://www.w3.org/2005/07/aaa",_40c);
}else{
elem.removeAttribute("aria-"+_40c);
}
}});
}
if(!dojo._hasResource["dijit._base"]){
dojo._hasResource["dijit._base"]=true;
dojo.provide("dijit._base");
}
if(!dojo._hasResource["dijit._Widget"]){
dojo._hasResource["dijit._Widget"]=true;
dojo.provide("dijit._Widget");
dojo.require("dijit._base");
dojo.connect(dojo,"connect",function(_40d,_40e){
if(_40d&&dojo.isFunction(_40d._onConnect)){
_40d._onConnect(_40e);
}
});
dijit._connectOnUseEventHandler=function(_40f){
};
(function(){
var _410={};
var _411=function(dc){
if(!_410[dc]){
var r=[];
var _414;
var _415=dojo.getObject(dc).prototype;
for(var _416 in _415){
if(dojo.isFunction(_415[_416])&&(_414=_416.match(/^_set([a-zA-Z]*)Attr$/))&&_414[1]){
r.push(_414[1].charAt(0).toLowerCase()+_414[1].substr(1));
}
}
_410[dc]=r;
}
return _410[dc]||[];
};
dojo.declare("dijit._Widget",null,{id:"",lang:"",dir:"","class":"",style:"",title:"",srcNodeRef:null,domNode:null,containerNode:null,attributeMap:{id:"",dir:"",lang:"","class":"",style:"",title:""},_deferredConnects:{onClick:"",onDblClick:"",onKeyDown:"",onKeyPress:"",onKeyUp:"",onMouseMove:"",onMouseDown:"",onMouseOut:"",onMouseOver:"",onMouseLeave:"",onMouseEnter:"",onMouseUp:""},onClick:dijit._connectOnUseEventHandler,onDblClick:dijit._connectOnUseEventHandler,onKeyDown:dijit._connectOnUseEventHandler,onKeyPress:dijit._connectOnUseEventHandler,onKeyUp:dijit._connectOnUseEventHandler,onMouseDown:dijit._connectOnUseEventHandler,onMouseMove:dijit._connectOnUseEventHandler,onMouseOut:dijit._connectOnUseEventHandler,onMouseOver:dijit._connectOnUseEventHandler,onMouseLeave:dijit._connectOnUseEventHandler,onMouseEnter:dijit._connectOnUseEventHandler,onMouseUp:dijit._connectOnUseEventHandler,_blankGif:(dojo.config.blankGif||dojo.moduleUrl("dojo","resources/blank.gif")),postscript:function(_417,_418){
this.create(_417,_418);
},create:function(_419,_41a){
this.srcNodeRef=dojo.byId(_41a);
this._connects=[];
this._deferredConnects=dojo.clone(this._deferredConnects);
for(var attr in this.attributeMap){
delete this._deferredConnects[attr];
}
for(attr in this._deferredConnects){
if(this[attr]!==dijit._connectOnUseEventHandler){
delete this._deferredConnects[attr];
}
}
if(this.srcNodeRef&&(typeof this.srcNodeRef.id=="string")){
this.id=this.srcNodeRef.id;
}
if(_419){
this.params=_419;
dojo.mixin(this,_419);
}
this.postMixInProperties();
if(!this.id){
this.id=dijit.getUniqueId(this.declaredClass.replace(/\./g,"_"));
}
dijit.registry.add(this);
this.buildRendering();
if(this.domNode){
this._applyAttributes();
for(attr in this.params){
this._onConnect(attr);
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
var _41c=function(attr,_41e){
if((_41e.params&&attr in _41e.params)||_41e[attr]){
_41e.attr(attr,_41e[attr]);
}
};
for(var attr in this.attributeMap){
_41c(attr,this);
}
dojo.forEach(_411(this.declaredClass),function(a){
if(!(a in this.attributeMap)){
_41c(a,this);
}
},this);
},postMixInProperties:function(){
},buildRendering:function(){
this.domNode=this.srcNodeRef||dojo.doc.createElement("div");
},postCreate:function(){
},startup:function(){
this._started=true;
},destroyRecursive:function(_421){
this.destroyDescendants(_421);
this.destroy(_421);
},destroy:function(_422){
this.uninitialize();
dojo.forEach(this._connects,function(_423){
dojo.forEach(_423,dojo.disconnect);
});
dojo.forEach(this._supportingWidgets||[],function(w){
if(w.destroy){
w.destroy();
}
});
this.destroyRendering(_422);
dijit.registry.remove(this.id);
},destroyRendering:function(_425){
if(this.bgIframe){
this.bgIframe.destroy(_425);
delete this.bgIframe;
}
if(this.domNode){
if(!_425){
dojo._destroyElement(this.domNode);
}
delete this.domNode;
}
if(this.srcNodeRef){
if(!_425){
dojo._destroyElement(this.srcNodeRef);
}
delete this.srcNodeRef;
}
},destroyDescendants:function(_426){
dojo.forEach(this.getDescendants(),function(_427){
if(_427.destroy){
_427.destroy(_426);
}
});
},uninitialize:function(){
return false;
},onFocus:function(){
},onBlur:function(){
},_onFocus:function(e){
this.onFocus();
},_onBlur:function(){
this.onBlur();
},_onConnect:function(_429){
if(_429 in this._deferredConnects){
var _42a=this[this._deferredConnects[_429]||"domNode"];
this.connect(_42a,_429.toLowerCase(),this[_429]);
delete this._deferredConnects[_429];
}
},_setClassAttr:function(_42b){
var _42c=this[this.attributeMap["class"]||"domNode"];
dojo.removeClass(_42c,this["class"]);
this["class"]=_42b;
dojo.addClass(_42c,_42b);
},_setStyleAttr:function(_42d){
var _42e=this[this.attributeMap["style"]||"domNode"];
if(_42e.style.cssText){
_42e.style.cssText+="; "+_42d;
}else{
_42e.style.cssText=_42d;
}
this["style"]=_42d;
},setAttribute:function(attr,_430){
dojo.deprecated(this.declaredClass+"::setAttribute() is deprecated. Use attr() instead.","","2.0");
this.attr(attr,_430);
},_attrToDom:function(attr,_432){
var _433=this.attributeMap[attr];
dojo.forEach(dojo.isArray(_433)?_433:[_433],function(_434){
var _435=this[_434.node||_434||"domNode"];
var type=_434.type||"attribute";
switch(type){
case "attribute":
if(dojo.isFunction(_432)){
_432=dojo.hitch(this,_432);
}
if(/^on[A-Z][a-zA-Z]*$/.test(attr)){
attr=attr.toLowerCase();
}
dojo.attr(_435,attr,_432);
break;
case "innerHTML":
_435.innerHTML=_432;
break;
case "class":
dojo.removeClass(_435,this[attr]);
dojo.addClass(_435,_432);
break;
}
},this);
this[attr]=_432;
},attr:function(name,_438){
var args=arguments.length;
if(args==1&&!dojo.isString(name)){
for(var x in name){
this.attr(x,name[x]);
}
return this;
}
var _43b=this._getAttrNames(name);
if(args==2){
if(this[_43b.s]){
return this[_43b.s](_438)||this;
}else{
if(name in this.attributeMap){
this._attrToDom(name,_438);
}
this[name]=_438;
}
return this;
}else{
if(this[_43b.g]){
return this[_43b.g]();
}else{
return this[name];
}
}
},_attrPairNames:{},_getAttrNames:function(name){
var apn=this._attrPairNames;
if(apn[name]){
return apn[name];
}
var uc=name.charAt(0).toUpperCase()+name.substr(1);
return apn[name]={n:name+"Node",s:"_set"+uc+"Attr",g:"_get"+uc+"Attr"};
},toString:function(){
return "[Widget "+this.declaredClass+", "+(this.id||"NO ID")+"]";
},getDescendants:function(){
if(this.containerNode){
var list=dojo.query("[widgetId]",this.containerNode);
return list.map(dijit.byNode);
}else{
return [];
}
},nodesWithKeyClick:["input","button"],connect:function(obj,_441,_442){
var d=dojo;
var dco=d.hitch(d,"connect",obj);
var _445=[];
if(_441=="ondijitclick"){
if(!this.nodesWithKeyClick[obj.nodeName]){
var m=d.hitch(this,_442);
_445.push(dco("onkeydown",this,function(e){
if(!d.isFF&&e.keyCode==d.keys.ENTER){
return m(e);
}else{
if(e.keyCode==d.keys.SPACE){
d.stopEvent(e);
}
}
}),dco("onkeyup",this,function(e){
if(e.keyCode==d.keys.SPACE){
return m(e);
}
}));
if(d.isFF){
_445.push(dco("onkeypress",this,function(e){
if(e.keyCode==d.keys.ENTER){
return m(e);
}
}));
}
}
_441="onclick";
}
_445.push(dco(_441,this,_442));
this._connects.push(_445);
return _445;
},disconnect:function(_44a){
for(var i=0;i<this._connects.length;i++){
if(this._connects[i]==_44a){
dojo.forEach(_44a,dojo.disconnect);
this._connects.splice(i,1);
return;
}
}
},isLeftToRight:function(){
return dojo._isBodyLtr();
},isFocusable:function(){
return this.focus&&(dojo.style(this.domNode,"display")!="none");
},placeAt:function(_44c,_44d){
if(_44c["declaredClass"]&&_44c["addChild"]){
_44c.addChild(this,_44d);
}else{
dojo.place(this.domNode,_44c,_44d);
}
return this;
}});
})();
}
if(!dojo._hasResource["dojo.string"]){
dojo._hasResource["dojo.string"]=true;
dojo.provide("dojo.string");
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
dojo.string.substitute=function(_457,map,_459,_45a){
_45a=_45a||dojo.global;
_459=(!_459)?function(v){
return v;
}:dojo.hitch(_45a,_459);
return _457.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g,function(_45c,key,_45e){
var _45f=dojo.getObject(key,false,map);
if(_45e){
_45f=dojo.getObject(_45e,false,_45a).call(_45a,_45f,key);
}
return _459(_45f,key).toString();
});
};
dojo.string.trim=function(str){
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
if(!dojo._hasResource["dijit._Templated"]){
dojo._hasResource["dijit._Templated"]=true;
dojo.provide("dijit._Templated");
dojo.declare("dijit._Templated",null,{templateNode:null,templateString:null,templatePath:null,widgetsInTemplate:false,_skipNodeCache:false,_stringRepl:function(tmpl){
var _463=this.declaredClass,_464=this;
return dojo.string.substitute(tmpl,this,function(_465,key){
if(key.charAt(0)=="!"){
_465=_464[key.substr(1)];
}
if(typeof _465=="undefined"){
throw new Error(_463+" template:"+key);
}
if(_465==null){
return "";
}
return key.charAt(0)=="!"?_465:_465.toString().replace(/"/g,"&quot;");
},this);
},buildRendering:function(){
var _467=dijit._Templated.getCachedTemplate(this.templatePath,this.templateString,this._skipNodeCache);
var node;
if(dojo.isString(_467)){
node=dijit._Templated._createNodesFromText(this._stringRepl(_467))[0];
}else{
node=_467.cloneNode(true);
}
this.domNode=node;
this._attachTemplateNodes(node);
var _469=this.srcNodeRef;
if(_469&&_469.parentNode){
_469.parentNode.replaceChild(node,_469);
}
if(this.widgetsInTemplate){
var cw=(this._supportingWidgets=dojo.parser.parse(node));
this._attachTemplateNodes(cw,function(n,p){
return n[p];
});
}
this._fillContent(_469);
},_fillContent:function(_46d){
var dest=this.containerNode;
if(_46d&&dest){
while(_46d.hasChildNodes()){
dest.appendChild(_46d.firstChild);
}
}
},_attachTemplateNodes:function(_46f,_470){
_470=_470||function(n,p){
return n.getAttribute(p);
};
var _473=dojo.isArray(_46f)?_46f:(_46f.all||_46f.getElementsByTagName("*"));
var x=dojo.isArray(_46f)?0:-1;
var _475={};
for(;x<_473.length;x++){
var _476=(x==-1)?_46f:_473[x];
if(this.widgetsInTemplate&&_470(_476,"dojoType")){
continue;
}
var _477=_470(_476,"dojoAttachPoint");
if(_477){
var _478,_479=_477.split(/\s*,\s*/);
while((_478=_479.shift())){
if(dojo.isArray(this[_478])){
this[_478].push(_476);
}else{
this[_478]=_476;
}
}
}
var _47a=_470(_476,"dojoAttachEvent");
if(_47a){
var _47b,_47c=_47a.split(/\s*,\s*/);
var trim=dojo.trim;
while((_47b=_47c.shift())){
if(_47b){
var _47e=null;
if(_47b.indexOf(":")!=-1){
var _47f=_47b.split(":");
_47b=trim(_47f[0]);
_47e=trim(_47f[1]);
}else{
_47b=trim(_47b);
}
if(!_47e){
_47e=_47b;
}
this.connect(_476,_47b,_47e);
}
}
}
var role=_470(_476,"waiRole");
if(role){
dijit.setWaiRole(_476,role);
}
var _481=_470(_476,"waiState");
if(_481){
dojo.forEach(_481.split(/\s*,\s*/),function(_482){
if(_482.indexOf("-")!=-1){
var pair=_482.split("-");
dijit.setWaiState(_476,pair[0],pair[1]);
}
});
}
}
}});
dijit._Templated._templateCache={};
dijit._Templated.getCachedTemplate=function(_484,_485,_486){
var _487=dijit._Templated._templateCache;
var key=_485||_484;
var _489=_487[key];
if(_489){
if(!_489.ownerDocument||_489.ownerDocument==dojo.doc){
return _489;
}
dojo._destroyElement(_489);
}
if(!_485){
_485=dijit._Templated._sanitizeTemplateString(dojo._getText(_484));
}
_485=dojo.string.trim(_485);
if(_486||_485.match(/\$\{([^\}]+)\}/g)){
return (_487[key]=_485);
}else{
return (_487[key]=dijit._Templated._createNodesFromText(_485)[0]);
}
};
dijit._Templated._sanitizeTemplateString=function(_48a){
if(_48a){
_48a=_48a.replace(/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,"");
var _48b=_48a.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
if(_48b){
_48a=_48b[1];
}
}else{
_48a="";
}
return _48a;
};
if(dojo.isIE){
dojo.addOnWindowUnload(function(){
var _48c=dijit._Templated._templateCache;
for(var key in _48c){
var _48e=_48c[key];
if(!isNaN(_48e.nodeType)){
dojo._destroyElement(_48e);
}
delete _48c[key];
}
});
}
(function(){
var _48f={cell:{re:/^<t[dh][\s\r\n>]/i,pre:"<table><tbody><tr>",post:"</tr></tbody></table>"},row:{re:/^<tr[\s\r\n>]/i,pre:"<table><tbody>",post:"</tbody></table>"},section:{re:/^<(thead|tbody|tfoot)[\s\r\n>]/i,pre:"<table>",post:"</table>"}};
var tn;
dijit._Templated._createNodesFromText=function(text){
if(tn&&tn.ownerDocument!=dojo.doc){
dojo._destroyElement(tn);
tn=undefined;
}
if(!tn){
tn=dojo.doc.createElement("div");
tn.style.display="none";
dojo.body().appendChild(tn);
}
var _492="none";
var _493=text.replace(/^\s+/,"");
for(var type in _48f){
var map=_48f[type];
if(map.re.test(_493)){
_492=type;
text=map.pre+text+map.post;
break;
}
}
tn.innerHTML=text;
if(tn.normalize){
tn.normalize();
}
var tag={cell:"tr",row:"tbody",section:"table"}[_492];
var _497=(typeof tag!="undefined")?tn.getElementsByTagName(tag)[0]:tn;
var _498=[];
while(_497.firstChild){
_498.push(_497.removeChild(_497.firstChild));
}
tn.innerHTML="";
return _498;
};
})();
dojo.extend(dijit._Widget,{dojoAttachEvent:"",dojoAttachPoint:"",waiRole:"",waiState:""});
}
if(!dojo._hasResource["dijit._Container"]){
dojo._hasResource["dijit._Container"]=true;
dojo.provide("dijit._Container");
dojo.declare("dijit._Contained",null,{getParent:function(){
for(var p=this.domNode.parentNode;p;p=p.parentNode){
var id=p.getAttribute&&p.getAttribute("widgetId");
if(id){
var _49b=dijit.byId(id);
return _49b.isContainer?_49b:null;
}
}
return null;
},_getSibling:function(_49c){
var node=this.domNode;
do{
node=node[_49c+"Sibling"];
}while(node&&node.nodeType!=1);
if(!node){
return null;
}
var id=node.getAttribute("widgetId");
return dijit.byId(id);
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
dojo.declare("dijit._Container",null,{isContainer:true,buildRendering:function(){
this.inherited(arguments);
if(!this.containerNode){
this.containerNode=this.domNode;
}
},addChild:function(_4a0,_4a1){
var _4a2=this.containerNode;
if(_4a1&&typeof _4a1=="number"){
var _4a3=dojo.query("> [widgetId]",_4a2);
if(_4a3&&_4a3.length>=_4a1){
_4a2=_4a3[_4a1-1];
_4a1="after";
}
}
dojo.place(_4a0.domNode,_4a2,_4a1);
if(this._started&&!_4a0._started){
_4a0.startup();
}
},removeChild:function(_4a4){
if(typeof _4a4=="number"&&_4a4>0){
_4a4=this.getChildren()[_4a4];
}
if(!_4a4||!_4a4.domNode){
return;
}
var node=_4a4.domNode;
node.parentNode.removeChild(node);
},_nextElement:function(node){
do{
node=node.nextSibling;
}while(node&&node.nodeType!=1);
return node;
},_firstElement:function(node){
node=node.firstChild;
if(node&&node.nodeType!=1){
node=this._nextElement(node);
}
return node;
},getChildren:function(){
return dojo.query("> [widgetId]",this.containerNode).map(dijit.byNode);
},hasChildren:function(){
return !!this._firstElement(this.containerNode);
},destroyDescendants:function(_4a8){
dojo.forEach(this.getChildren(),function(_4a9){
_4a9.destroyRecursive(_4a8);
});
},_getSiblingOfChild:function(_4aa,dir){
var node=_4aa.domNode;
var _4ad=(dir>0?"nextSibling":"previousSibling");
do{
node=node[_4ad];
}while(node&&(node.nodeType!=1||!dijit.byNode(node)));
return node?dijit.byNode(node):null;
},getIndexOfChild:function(_4ae){
var _4af=this.getChildren();
for(var i=0,c;c=_4af[i];i++){
if(c==_4ae){
return i;
}
}
return -1;
}});
dojo.declare("dijit._KeyNavContainer",[dijit._Container],{_keyNavCodes:{},connectKeyNavHandlers:function(_4b2,_4b3){
var _4b4=this._keyNavCodes={};
var prev=dojo.hitch(this,this.focusPrev);
var next=dojo.hitch(this,this.focusNext);
dojo.forEach(_4b2,function(code){
_4b4[code]=prev;
});
dojo.forEach(_4b3,function(code){
_4b4[code]=next;
});
this.connect(this.domNode,"onkeypress","_onContainerKeypress");
this.connect(this.domNode,"onfocus","_onContainerFocus");
},startupKeyNavChildren:function(){
dojo.forEach(this.getChildren(),dojo.hitch(this,"_startupChild"));
},addChild:function(_4b9,_4ba){
dijit._KeyNavContainer.superclass.addChild.apply(this,arguments);
this._startupChild(_4b9);
},focus:function(){
this.focusFirstChild();
},focusFirstChild:function(){
this.focusChild(this._getFirstFocusableChild());
},focusNext:function(){
if(this.focusedChild&&this.focusedChild.hasNextFocalNode&&this.focusedChild.hasNextFocalNode()){
this.focusedChild.focusNext();
return;
}
var _4bb=this._getNextFocusableChild(this.focusedChild,1);
if(_4bb.getFocalNodes){
this.focusChild(_4bb,_4bb.getFocalNodes()[0]);
}else{
this.focusChild(_4bb);
}
},focusPrev:function(){
if(this.focusedChild&&this.focusedChild.hasPrevFocalNode&&this.focusedChild.hasPrevFocalNode()){
this.focusedChild.focusPrev();
return;
}
var _4bc=this._getNextFocusableChild(this.focusedChild,-1);
if(_4bc.getFocalNodes){
var _4bd=_4bc.getFocalNodes();
this.focusChild(_4bc,_4bd[_4bd.length-1]);
}else{
this.focusChild(_4bc);
}
},focusChild:function(_4be,node){
if(_4be){
if(this.focusedChild&&_4be!==this.focusedChild){
this._onChildBlur(this.focusedChild);
}
this.focusedChild=_4be;
if(node&&_4be.focusFocalNode){
_4be.focusFocalNode(node);
}else{
_4be.focus();
}
}
},_startupChild:function(_4c0){
if(_4c0.getFocalNodes){
dojo.forEach(_4c0.getFocalNodes(),function(node){
dojo.attr(node,"tabindex",-1);
this._connectNode(node);
},this);
}else{
var node=_4c0.focusNode||_4c0.domNode;
if(_4c0.isFocusable()){
dojo.attr(node,"tabindex",-1);
}
this._connectNode(node);
}
},_connectNode:function(node){
this.connect(node,"onfocus","_onNodeFocus");
this.connect(node,"onblur","_onNodeBlur");
},_onContainerFocus:function(evt){
if(evt.target===this.domNode){
this.focusFirstChild();
}
},_onContainerKeypress:function(evt){
if(evt.ctrlKey||evt.altKey){
return;
}
var func=this._keyNavCodes[evt.charOrCode];
if(func){
func();
dojo.stopEvent(evt);
}
},_onNodeFocus:function(evt){
dojo.attr(this.domNode,"tabindex",-1);
var _4c8=dijit.getEnclosingWidget(evt.target);
if(_4c8&&_4c8.isFocusable()){
this.focusedChild=_4c8;
}
dojo.stopEvent(evt);
},_onNodeBlur:function(evt){
if(this.tabIndex){
dojo.attr(this.domNode,"tabindex",this.tabIndex);
}
dojo.stopEvent(evt);
},_onChildBlur:function(_4ca){
},_getFirstFocusableChild:function(){
return this._getNextFocusableChild(null,1);
},_getNextFocusableChild:function(_4cb,dir){
if(_4cb){
_4cb=this._getSiblingOfChild(_4cb,dir);
}
var _4cd=this.getChildren();
for(var i=0;i<_4cd.length;i++){
if(!_4cb){
_4cb=_4cd[(dir>0)?0:(_4cd.length-1)];
}
if(_4cb.isFocusable()){
return _4cb;
}
_4cb=this._getSiblingOfChild(_4cb,dir);
}
return null;
}});
}
if(!dojo._hasResource["dijit.layout._LayoutWidget"]){
dojo._hasResource["dijit.layout._LayoutWidget"]=true;
dojo.provide("dijit.layout._LayoutWidget");
dojo.declare("dijit.layout._LayoutWidget",[dijit._Widget,dijit._Container,dijit._Contained],{baseClass:"dijitLayoutContainer",isLayoutContainer:true,postCreate:function(){
dojo.addClass(this.domNode,"dijitContainer");
dojo.addClass(this.domNode,this.baseClass);
},startup:function(){
if(this._started){
return;
}
dojo.forEach(this.getChildren(),function(_4cf){
_4cf.startup();
});
if(!this.getParent||!this.getParent()){
this.resize();
this.connect(dojo.global,"onresize","resize");
}
this.inherited(arguments);
},resize:function(_4d0,_4d1){
var node=this.domNode;
if(_4d0){
dojo.marginBox(node,_4d0);
if(_4d0.t){
node.style.top=_4d0.t+"px";
}
if(_4d0.l){
node.style.left=_4d0.l+"px";
}
}
var mb=_4d1||{};
dojo.mixin(mb,_4d0||{});
if(!("h" in mb)||!("w" in mb)){
mb=dojo.mixin(dojo.marginBox(node),mb);
}
var cs=dojo.getComputedStyle(node);
var me=dojo._getMarginExtents(node,cs);
var be=dojo._getBorderExtents(node,cs);
var bb=this._borderBox={w:mb.w-(me.w+be.w),h:mb.h-(me.h+be.h)};
var pe=dojo._getPadExtents(node,cs);
this._contentBox={l:dojo._toPixelValue(node,cs.paddingLeft),t:dojo._toPixelValue(node,cs.paddingTop),w:bb.w-pe.w,h:bb.h-pe.h};
this.layout();
},layout:function(){
},_setupChild:function(_4d9){
if(_4d9.baseClass){
dojo.addClass(_4d9.domNode,this.baseClass+"-"+_4d9.baseClass);
}
},addChild:function(_4da,_4db){
this.inherited(arguments);
if(this._started){
this._setupChild(_4da);
}
},removeChild:function(_4dc){
if(_4dc.baseClass){
dojo.removeClass(_4dc.domNode,this.baseClass+"-"+_4dc.baseClass);
}
this.inherited(arguments);
}});
dijit.layout.marginBox2contentBox=function(node,mb){
var cs=dojo.getComputedStyle(node);
var me=dojo._getMarginExtents(node,cs);
var pb=dojo._getPadBorderExtents(node,cs);
return {l:dojo._toPixelValue(node,cs.paddingLeft),t:dojo._toPixelValue(node,cs.paddingTop),w:mb.w-(me.w+pb.w),h:mb.h-(me.h+pb.h)};
};
(function(){
var _4e2=function(word){
return word.substring(0,1).toUpperCase()+word.substring(1);
};
var size=function(_4e5,dim){
_4e5.resize?_4e5.resize(dim):dojo.marginBox(_4e5.domNode,dim);
dojo.mixin(_4e5,dojo.marginBox(_4e5.domNode));
dojo.mixin(_4e5,dim);
};
dijit.layout.layoutChildren=function(_4e7,dim,_4e9){
dim=dojo.mixin({},dim);
dojo.addClass(_4e7,"dijitLayoutContainer");
_4e9=dojo.filter(_4e9,function(item){
return item.layoutAlign!="client";
}).concat(dojo.filter(_4e9,function(item){
return item.layoutAlign=="client";
}));
dojo.forEach(_4e9,function(_4ec){
var elm=_4ec.domNode,pos=_4ec.layoutAlign;
var _4ef=elm.style;
_4ef.left=dim.l+"px";
_4ef.top=dim.t+"px";
_4ef.bottom=_4ef.right="auto";
dojo.addClass(elm,"dijitAlign"+_4e2(pos));
if(pos=="top"||pos=="bottom"){
size(_4ec,{w:dim.w});
dim.h-=_4ec.h;
if(pos=="top"){
dim.t+=_4ec.h;
}else{
_4ef.top=dim.t+dim.h+"px";
}
}else{
if(pos=="left"||pos=="right"){
size(_4ec,{h:dim.h});
dim.w-=_4ec.w;
if(pos=="left"){
dim.l+=_4ec.w;
}else{
_4ef.left=dim.l+dim.w+"px";
}
}else{
if(pos=="client"){
size(_4ec,dim);
}
}
}
});
};
})();
}
if(!dojo._hasResource["dojo.html"]){
dojo._hasResource["dojo.html"]=true;
dojo.provide("dojo.html");
(function(){
var _4f0=0;
dojo.html._secureForInnerHtml=function(cont){
return cont.replace(/(?:\s*<!DOCTYPE\s[^>]+>|<title[^>]*>[\s\S]*?<\/title>)/ig,"");
};
dojo.html._emptyNode=function(node){
while(node.firstChild){
dojo._destroyElement(node.firstChild);
}
};
dojo.html._setNodeContent=function(node,cont,_4f5){
if(_4f5){
dojo.html._emptyNode(node);
}
if(typeof cont=="string"){
var pre="",post="",walk=0,name=node.nodeName.toLowerCase();
switch(name){
case "tr":
pre="<tr>";
post="</tr>";
walk+=1;
case "tbody":
case "thead":
pre="<tbody>"+pre;
post+="</tbody>";
walk+=1;
case "table":
pre="<table>"+pre;
post+="</table>";
walk+=1;
break;
}
if(walk){
var n=node.ownerDocument.createElement("div");
n.innerHTML=pre+cont+post;
do{
n=n.firstChild;
}while(--walk);
dojo.forEach(n.childNodes,function(n){
node.appendChild(n.cloneNode(true));
});
}else{
node.innerHTML=cont;
}
}else{
if(cont.nodeType){
node.appendChild(cont);
}else{
dojo.forEach(cont,function(n){
node.appendChild(n.cloneNode(true));
});
}
}
return node;
};
dojo.declare("dojo.html._ContentSetter",null,{node:"",content:"",id:"",cleanContent:false,extractContent:false,parseContent:false,constructor:function(_4fd,node){
dojo.mixin(this,_4fd||{});
node=this.node=dojo.byId(this.node||node);
if(!this.id){
this.id=["Setter",(node)?node.id||node.tagName:"",_4f0++].join("_");
}
if(!(this.node||node)){
new Error(this.declaredClass+": no node provided to "+this.id);
}
},set:function(cont,_500){
if(undefined!==cont){
this.content=cont;
}
if(_500){
this._mixin(_500);
}
this.onBegin();
this.setContent();
this.onEnd();
return this.node;
},setContent:function(){
var node=this.node;
if(!node){
console.error("setContent given no node");
}
try{
node=dojo.html._setNodeContent(node,this.content);
}
catch(e){
var _502=this.onContentError(e);
try{
node.innerHTML=_502;
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
var _505=cont.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
if(_505){
cont=_505[1];
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
},_mixin:function(_507){
var _508={},key;
for(key in _507){
if(key in _508){
continue;
}
this[key]=_507[key];
}
},_parse:function(){
var _50a=this.node;
try{
this.parseResults=dojo.parser.parse(_50a,true);
}
catch(e){
this._onError("Content",e,"Error parsing in _ContentSetter#"+this.id);
}
},_onError:function(type,err,_50d){
var _50e=this["on"+type+"Error"].call(this,err);
if(_50d){
console.error(_50d,err);
}else{
if(_50e){
dojo.html._setNodeContent(this.node,_50e,true);
}
}
}});
dojo.html.set=function(node,cont,_511){
if(undefined==cont){
console.warn("dojo.html.set: no cont argument provided, using empty string");
cont="";
}
if(!_511){
return dojo.html._setNodeContent(node,cont,true);
}else{
var op=new dojo.html._ContentSetter(dojo.mixin(_511,{content:cont,node:node}));
return op.set();
}
};
})();
}
if(!dojo._hasResource["dojo.i18n"]){
dojo._hasResource["dojo.i18n"]=true;
dojo.provide("dojo.i18n");
dojo.i18n.getLocalization=function(_513,_514,_515){
_515=dojo.i18n.normalizeLocale(_515);
var _516=_515.split("-");
var _517=[_513,"nls",_514].join(".");
var _518=dojo._loadedModules[_517];
if(_518){
var _519;
for(var i=_516.length;i>0;i--){
var loc=_516.slice(0,i).join("_");
if(_518[loc]){
_519=_518[loc];
break;
}
}
if(!_519){
_519=_518.ROOT;
}
if(_519){
var _51c=function(){
};
_51c.prototype=_519;
return new _51c();
}
}
throw new Error("Bundle not found: "+_514+" in "+_513+" , locale="+_515);
};
dojo.i18n.normalizeLocale=function(_51d){
var _51e=_51d?_51d.toLowerCase():dojo.locale;
if(_51e=="root"){
_51e="ROOT";
}
return _51e;
};
dojo.i18n._requireLocalization=function(_51f,_520,_521,_522){
var _523=dojo.i18n.normalizeLocale(_521);
var _524=[_51f,"nls",_520].join(".");
var _525="";
if(_522){
var _526=_522.split(",");
for(var i=0;i<_526.length;i++){
if(_523["indexOf"](_526[i])==0){
if(_526[i].length>_525.length){
_525=_526[i];
}
}
}
if(!_525){
_525="ROOT";
}
}
var _528=_522?_525:_523;
var _529=dojo._loadedModules[_524];
var _52a=null;
if(_529){
if(dojo.config.localizationComplete&&_529._built){
return;
}
var _52b=_528.replace(/-/g,"_");
var _52c=_524+"."+_52b;
_52a=dojo._loadedModules[_52c];
}
if(!_52a){
_529=dojo["provide"](_524);
var syms=dojo._getModuleSymbols(_51f);
var _52e=syms.concat("nls").join("/");
var _52f;
dojo.i18n._searchLocalePath(_528,_522,function(loc){
var _531=loc.replace(/-/g,"_");
var _532=_524+"."+_531;
var _533=false;
if(!dojo._loadedModules[_532]){
dojo["provide"](_532);
var _534=[_52e];
if(loc!="ROOT"){
_534.push(loc);
}
_534.push(_520);
var _535=_534.join("/")+".js";
_533=dojo._loadPath(_535,null,function(hash){
var _537=function(){
};
_537.prototype=_52f;
_529[_531]=new _537();
for(var j in hash){
_529[_531][j]=hash[j];
}
});
}else{
_533=true;
}
if(_533&&_529[_531]){
_52f=_529[_531];
}else{
_529[_531]=_52f;
}
if(_522){
return true;
}
});
}
if(_522&&_523!=_525){
_529[_523.replace(/-/g,"_")]=_529[_525.replace(/-/g,"_")];
}
};
(function(){
var _539=dojo.config.extraLocale;
if(_539){
if(!_539 instanceof Array){
_539=[_539];
}
var req=dojo.i18n._requireLocalization;
dojo.i18n._requireLocalization=function(m,b,_53d,_53e){
req(m,b,_53d,_53e);
if(_53d){
return;
}
for(var i=0;i<_539.length;i++){
req(m,b,_539[i],_53e);
}
};
}
})();
dojo.i18n._searchLocalePath=function(_540,down,_542){
_540=dojo.i18n.normalizeLocale(_540);
var _543=_540.split("-");
var _544=[];
for(var i=_543.length;i>0;i--){
_544.push(_543.slice(0,i).join("-"));
}
_544.push(false);
if(down){
_544.reverse();
}
for(var j=_544.length-1;j>=0;j--){
var loc=_544[j]||"ROOT";
var stop=_542(loc);
if(stop){
break;
}
}
};
dojo.i18n._preloadLocalizations=function(_549,_54a){
function preload(_54b){
_54b=dojo.i18n.normalizeLocale(_54b);
dojo.i18n._searchLocalePath(_54b,true,function(loc){
for(var i=0;i<_54a.length;i++){
if(_54a[i]==loc){
dojo["require"](_549+"_"+loc);
return true;
}
}
return false;
});
};
preload();
var _54e=dojo.config.extraLocale||[];
for(var i=0;i<_54e.length;i++){
preload(_54e[i]);
}
};
}
if(!dojo._hasResource["dijit.layout.ContentPane"]){
dojo._hasResource["dijit.layout.ContentPane"]=true;
dojo.provide("dijit.layout.ContentPane");
dojo.declare("dijit.layout.ContentPane",dijit._Widget,{href:"",extractContent:false,parseOnLoad:true,preventCache:false,preload:false,refreshOnShow:false,loadingMessage:"<span class='dijitContentPaneLoading'>${loadingState}</span>",errorMessage:"<span class='dijitContentPaneError'>${errorState}</span>",isLoaded:false,baseClass:"dijitContentPane",doLayout:true,postMixInProperties:function(){
this.inherited(arguments);
var _550=dojo.i18n.getLocalization("dijit","loading",this.lang);
this.loadingMessage=dojo.string.substitute(this.loadingMessage,_550);
this.errorMessage=dojo.string.substitute(this.errorMessage,_550);
},buildRendering:function(){
this.inherited(arguments);
if(!this.containerNode){
this.containerNode=this.domNode;
}
},postCreate:function(){
this.domNode.title="";
if(!dijit.hasWaiRole(this.domNode)){
dijit.setWaiRole(this.domNode,"group");
}
dojo.addClass(this.domNode,this.baseClass);
},startup:function(){
if(this._started){
return;
}
if(this.doLayout!="false"&&this.doLayout!==false){
this._checkIfSingleChild();
if(this._singleChild){
this._singleChild.startup();
}
}
this._loadCheck();
this.inherited(arguments);
},_checkIfSingleChild:function(){
var _551=dojo.query(">",this.containerNode),_552=_551.filter(function(node){
return dojo.hasAttr(node,"dojoType")||dojo.hasAttr(node,"widgetId");
}),_554=dojo.filter(_552.map(dijit.byNode),function(_555){
return _555&&_555.domNode&&_555.resize;
});
if(_551.length==_552.length&&_554.length==1){
this.isContainer=true;
this._singleChild=_554[0];
}else{
delete this.isContainer;
delete this._singleChild;
}
},refresh:function(){
return this._prepareLoad(true);
},setHref:function(href){
dojo.deprecated("dijit.layout.ContentPane.setHref() is deprecated.\tUse attr('href', ...) instead.","","2.0");
return this.attr("href",href);
},_setHrefAttr:function(href){
this.href=href;
if(this._created){
return this._prepareLoad();
}
},setContent:function(data){
dojo.deprecated("dijit.layout.ContentPane.setContent() is deprecated.  Use attr('content', ...) instead.","","2.0");
this.attr("content",data);
},_setContentAttr:function(data){
if(!this._isDownloaded){
this.href="";
}
this._setContent(data||"");
this._isDownloaded=false;
if(this.doLayout!="false"&&this.doLayout!==false){
this._checkIfSingleChild();
if(this._singleChild&&this._singleChild.resize){
this._singleChild.startup();
var cb=this._contentBox||dojo.contentBox(this.containerNode);
this._singleChild.resize({w:cb.w,h:cb.h});
}
}
this._onLoadHandler();
},_getContentAttr:function(){
return this.containerNode.innerHTML;
},cancel:function(){
if(this._xhrDfd&&(this._xhrDfd.fired==-1)){
this._xhrDfd.cancel();
}
delete this._xhrDfd;
},destroyRecursive:function(_55b){
if(this._beingDestroyed){
return;
}
this._beingDestroyed=true;
this.inherited(arguments);
},resize:function(size){
dojo.marginBox(this.domNode,size);
var node=this.containerNode,mb=dojo.mixin(dojo.marginBox(node),size||{});
var cb=this._contentBox=dijit.layout.marginBox2contentBox(node,mb);
if(this._singleChild&&this._singleChild.resize){
this._singleChild.resize({w:cb.w,h:cb.h});
}
},_prepareLoad:function(_560){
this.cancel();
this.isLoaded=false;
this._loadCheck(_560);
},_isShown:function(){
if("open" in this){
return this.open;
}else{
var node=this.domNode;
return (node.style.display!="none")&&(node.style.visibility!="hidden");
}
},_loadCheck:function(_562){
var _563=this._isShown();
if(this.href&&(_562||(this.preload&&!this.isLoaded&&!this._xhrDfd)||(this.refreshOnShow&&_563&&!this._xhrDfd)||(!this.isLoaded&&_563&&!this._xhrDfd))){
this._downloadExternalContent();
}
},_downloadExternalContent:function(){
this._setContent(this.onDownloadStart.call(this));
var self=this;
var _565={preventCache:(this.preventCache||this.refreshOnShow),url:this.href,handleAs:"text"};
if(dojo.isObject(this.ioArgs)){
dojo.mixin(_565,this.ioArgs);
}
var hand=this._xhrDfd=(this.ioMethod||dojo.xhrGet)(_565);
hand.addCallback(function(html){
try{
self._isDownloaded=true;
self.attr.call(self,"content",html);
self.onDownloadEnd.call(self);
}
catch(err){
self._onError.call(self,"Content",err);
}
delete self._xhrDfd;
return html;
});
hand.addErrback(function(err){
if(!hand.cancelled){
self._onError.call(self,"Download",err);
}
delete self._xhrDfd;
return err;
});
},_onLoadHandler:function(){
this.isLoaded=true;
try{
this.onLoad.call(this);
}
catch(e){
console.error("Error "+this.widgetId+" running custom onLoad code");
}
},_onUnloadHandler:function(){
this.isLoaded=false;
this.cancel();
try{
this.onUnload.call(this);
}
catch(e){
console.error("Error "+this.widgetId+" running custom onUnload code");
}
},destroyDescendants:function(){
this._onUnloadHandler();
var _569=this._contentSetter;
if(_569){
_569.empty();
}else{
this.inherited(arguments);
dojo.html._emptyNode(this.containerNode);
}
},_setContent:function(cont){
this.destroyDescendants();
var _56b=this._contentSetter;
if(!(_56b&&_56b instanceof dojo.html._ContentSetter)){
_56b=this._contentSetter=new dojo.html._ContentSetter({node:this.containerNode,_onError:dojo.hitch(this,this._onError),onContentError:dojo.hitch(this,function(e){
var _56d=this.onContentError(e);
try{
this.containerNode.innerHTML=_56d;
}
catch(e){
console.error("Fatal "+this.id+" could not change content due to "+e.message,e);
}
})});
}
var _56e=dojo.mixin({cleanContent:this.cleanContent,extractContent:this.extractContent,parseContent:this.parseOnLoad},this._contentSetterParams||{});
dojo.mixin(_56b,_56e);
_56b.set((dojo.isObject(cont)&&cont.domNode)?cont.domNode:cont);
delete this._contentSetterParams;
},_onError:function(type,err,_571){
var _572=this["on"+type+"Error"].call(this,err);
if(_571){
console.error(_571,err);
}else{
if(_572){
this._setContent.call(this,_572);
}
}
},_createSubWidgets:function(){
try{
dojo.parser.parse(this.containerNode,true);
}
catch(e){
this._onError("Content",e,"Couldn't create widgets in "+this.id+(this.href?" from "+this.href:""));
}
},onLoad:function(e){
},onUnload:function(e){
},onDownloadStart:function(){
return this.loadingMessage;
},onContentError:function(_575){
},onDownloadError:function(_576){
return this.errorMessage;
},onDownloadEnd:function(){
}});
}
if(!dojo._hasResource["dijit.form.Form"]){
dojo._hasResource["dijit.form.Form"]=true;
dojo.provide("dijit.form.Form");
dojo.declare("dijit.form._FormMixin",null,{reset:function(){
dojo.forEach(this.getDescendants(),function(_577){
if(_577.reset){
_577.reset();
}
});
},validate:function(){
var _578=false;
return dojo.every(dojo.map(this.getDescendants(),function(_579){
_579._hasBeenBlurred=true;
var _57a=_579.disabled||!_579.validate||_579.validate();
if(!_57a&&!_578){
dijit.scrollIntoView(_579.containerNode||_579.domNode);
_579.focus();
_578=true;
}
return _57a;
}),function(item){
return item;
});
},setValues:function(val){
dojo.deprecated(this.declaredClass+"::setValues() is deprecated. Use attr('value', val) instead.","","2.0");
return this.attr("value",val);
},_setValueAttr:function(obj){
var map={};
dojo.forEach(this.getDescendants(),function(_57f){
if(!_57f.name){
return;
}
var _580=map[_57f.name]||(map[_57f.name]=[]);
_580.push(_57f);
});
for(var name in map){
if(!map.hasOwnProperty(name)){
continue;
}
var _582=map[name],_583=dojo.getObject(name,false,obj);
if(_583===undefined){
continue;
}
if(!dojo.isArray(_583)){
_583=[_583];
}
if(typeof _582[0].checked=="boolean"){
dojo.forEach(_582,function(w,i){
w.attr("value",dojo.indexOf(_583,w.value)!=-1);
});
}else{
if(_582[0]._multiValue){
_582[0].attr("value",_583);
}else{
dojo.forEach(_582,function(w,i){
w.attr("value",_583[i]);
});
}
}
}
},getValues:function(){
dojo.deprecated(this.declaredClass+"::getValues() is deprecated. Use attr('value') instead.","","2.0");
return this.attr("value");
},_getValueAttr:function(){
var obj={};
dojo.forEach(this.getDescendants(),function(_589){
var name=_589.name;
if(!name||_589.disabled){
return;
}
var _58b=_589.attr("value");
if(typeof _589.checked=="boolean"){
if(/Radio/.test(_589.declaredClass)){
if(_58b!==false){
dojo.setObject(name,_58b,obj);
}
}else{
var ary=dojo.getObject(name,false,obj);
if(!ary){
ary=[];
dojo.setObject(name,ary,obj);
}
if(_58b!==false){
ary.push(_58b);
}
}
}else{
dojo.setObject(name,_58b,obj);
}
});
return obj;
},isValid:function(){
this._invalidWidgets=[];
return dojo.every(this.getDescendants(),function(_58d){
var _58e=_58d.disabled||!_58d.isValid||_58d.isValid();
if(!_58e){
this._invalidWidgets.push(_58d);
}
return _58e;
},this);
},onValidStateChange:function(_58f){
},_widgetChange:function(_590){
var _591=this._lastValidState;
if(!_590||this._lastValidState===undefined){
_591=this.isValid();
if(this._lastValidState===undefined){
this._lastValidState=_591;
}
}else{
if(_590.isValid){
this._invalidWidgets=dojo.filter(this._invalidWidgets||[],function(w){
return (w!=_590);
},this);
if(!_590.isValid()&&!_590.attr("disabled")){
this._invalidWidgets.push(_590);
}
_591=(this._invalidWidgets.length===0);
}
}
if(_591!==this._lastValidState){
this._lastValidState=_591;
this.onValidStateChange(_591);
}
},connectChildren:function(){
dojo.forEach(this._changeConnections,dojo.hitch(this,"disconnect"));
var _593=this;
var _594=this._changeConnections=[];
dojo.forEach(dojo.filter(this.getDescendants(),function(item){
return item.validate;
}),function(_596){
_594.push(_593.connect(_596,"validate",dojo.hitch(_593,"_widgetChange",_596)));
_594.push(_593.connect(_596,"_setDisabledAttr",dojo.hitch(_593,"_widgetChange",_596)));
});
this._widgetChange(null);
},startup:function(){
this.inherited(arguments);
this._changeConnections=[];
this.connectChildren();
}});
dojo.declare("dijit.form.Form",[dijit._Widget,dijit._Templated,dijit.form._FormMixin],{name:"",action:"",method:"",encType:"","accept-charset":"",accept:"",target:"",templateString:"<form dojoAttachPoint='containerNode' dojoAttachEvent='onreset:_onReset,onsubmit:_onSubmit' name='${name}'></form>",attributeMap:dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap),{action:"",method:"",encType:"","accept-charset":"",accept:"",target:""}),execute:function(_597){
},onExecute:function(){
},_setEncTypeAttr:function(_598){
this.encType=_598;
dojo.attr(this.domNode,"encType",_598);
if(dojo.isIE){
this.domNode.encoding=_598;
}
},postCreate:function(){
if(dojo.isIE&&this.srcNodeRef&&this.srcNodeRef.attributes){
var item=this.srcNodeRef.attributes.getNamedItem("encType");
if(item&&!item.specified&&(typeof item.value=="string")){
this.attr("encType",item.value);
}
}
this.inherited(arguments);
},onReset:function(e){
return true;
},_onReset:function(e){
var faux={returnValue:true,preventDefault:function(){
this.returnValue=false;
},stopPropagation:function(){
},currentTarget:e.currentTarget,target:e.target};
if(!(this.onReset(faux)===false)&&faux.returnValue){
this.reset();
}
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
if(!dojo._hasResource["dijit.Dialog"]){
dojo._hasResource["dijit.Dialog"]=true;
dojo.provide("dijit.Dialog");
dojo.declare("dijit.DialogUnderlay",[dijit._Widget,dijit._Templated],{templateString:"<div class='dijitDialogUnderlayWrapper' id='${id}_wrapper'><div class='dijitDialogUnderlay ${class}' id='${id}' dojoAttachPoint='node'></div></div>",attributeMap:{},postCreate:function(){
dojo.body().appendChild(this.domNode);
this.bgIframe=new dijit.BackgroundIframe(this.domNode);
},layout:function(){
var _5a0=dijit.getViewport();
var is=this.node.style,os=this.domNode.style;
os.top=_5a0.t+"px";
os.left=_5a0.l+"px";
is.width=_5a0.w+"px";
is.height=_5a0.h+"px";
var _5a3=dijit.getViewport();
if(_5a0.w!=_5a3.w){
is.width=_5a3.w+"px";
}
if(_5a0.h!=_5a3.h){
is.height=_5a3.h+"px";
}
},show:function(){
this.domNode.style.display="block";
this.layout();
if(this.bgIframe.iframe){
this.bgIframe.iframe.style.display="block";
}
},hide:function(){
this.domNode.style.display="none";
if(this.bgIframe.iframe){
this.bgIframe.iframe.style.display="none";
}
},uninitialize:function(){
if(this.bgIframe){
this.bgIframe.destroy();
}
}});
dojo.declare("dijit._DialogMixin",null,{attributeMap:dijit._Widget.prototype.attributeMap,execute:function(_5a4){
},onCancel:function(){
},onExecute:function(){
},_onSubmit:function(){
this.onExecute();
this.execute(this.attr("value"));
},_getFocusItems:function(_5a5){
var _5a6=dijit._getTabNavigable(dojo.byId(_5a5));
this._firstFocusItem=_5a6.lowest||_5a6.first||_5a5;
this._lastFocusItem=_5a6.last||_5a6.highest||this._firstFocusItem;
if(dojo.isMoz&&this._firstFocusItem.tagName.toLowerCase()=="input"&&dojo.attr(this._firstFocusItem,"type").toLowerCase()=="file"){
dojo.attr(_5a5,"tabindex","0");
this._firstFocusItem=_5a5;
}
}});
dojo.declare("dijit.Dialog",[dijit.layout.ContentPane,dijit._Templated,dijit.form._FormMixin,dijit._DialogMixin],{templateString:null,templateString:"<div class=\"dijitDialog\" tabindex=\"-1\" waiRole=\"dialog\" waiState=\"labelledby-${id}_title\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\">\r\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\" id=\"${id}_title\"></span>\r\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\" title=\"${buttonCancel}\">\r\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\" title=\"${buttonCancel}\">x</span>\r\n\t</span>\r\n\t</div>\r\n\t\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"></div>\r\n</div>\r\n",attributeMap:dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap),{title:[{node:"titleNode",type:"innerHTML"},{node:"titleBar",type:"attribute"}]}),open:false,duration:dijit.defaultDuration,refocus:true,autofocus:true,_firstFocusItem:null,_lastFocusItem:null,doLayout:false,draggable:true,postMixInProperties:function(){
var _5a7=dojo.i18n.getLocalization("dijit","common");
dojo.mixin(this,_5a7);
this.inherited(arguments);
},postCreate:function(){
var s=this.domNode.style;
s.visibility="hidden";
s.position="absolute";
s.display="";
s.top="-9999px";
dojo.body().appendChild(this.domNode);
this.inherited(arguments);
this.connect(this,"onExecute","hide");
this.connect(this,"onCancel","hide");
this._modalconnects=[];
},onLoad:function(){
this._position();
this.inherited(arguments);
},_endDrag:function(e){
if(e&&e.node&&e.node===this.domNode){
var vp=dijit.getViewport();
var p=e._leftTop||dojo.coords(e.node,true);
this._relativePosition={t:p.t-vp.t,l:p.l-vp.l};
}
},_setup:function(){
var node=this.domNode;
if(this.titleBar&&this.draggable){
this._moveable=(dojo.isIE==6)?new dojo.dnd.TimedMoveable(node,{handle:this.titleBar}):new dojo.dnd.Moveable(node,{handle:this.titleBar,timeout:0});
dojo.subscribe("/dnd/move/stop",this,"_endDrag");
}else{
dojo.addClass(node,"dijitDialogFixed");
}
this._underlay=new dijit.DialogUnderlay({id:this.id+"_underlay","class":dojo.map(this["class"].split(/\s/),function(s){
return s+"_underlay";
}).join(" ")});
var _5ae=this._underlay;
this._fadeIn=dojo.fadeIn({node:node,duration:this.duration,onBegin:dojo.hitch(_5ae,"show")});
this._fadeOut=dojo.fadeOut({node:node,duration:this.duration,onEnd:function(){
node.style.visibility="hidden";
node.style.top="-9999px";
_5ae.hide();
}});
},uninitialize:function(){
if(this._fadeIn&&this._fadeIn.status()=="playing"){
this._fadeIn.stop();
}
if(this._fadeOut&&this._fadeOut.status()=="playing"){
this._fadeOut.stop();
}
if(this._underlay){
this._underlay.destroy();
}
if(this._moveable){
this._moveable.destroy();
}
},_size:function(){
var mb=dojo.marginBox(this.domNode);
var _5b0=dijit.getViewport();
if(mb.w>=_5b0.w||mb.h>=_5b0.h){
dojo.style(this.containerNode,{width:Math.min(mb.w,Math.floor(_5b0.w*0.75))+"px",height:Math.min(mb.h,Math.floor(_5b0.h*0.75))+"px",overflow:"auto",position:"relative"});
}
},_position:function(){
if(!dojo.hasClass(dojo.body(),"dojoMove")){
var node=this.domNode;
var _5b2=dijit.getViewport();
var p=this._relativePosition;
var mb=p?null:dojo.marginBox(node);
dojo.style(node,{left:Math.floor(_5b2.l+(p?p.l:(_5b2.w-mb.w)/2))+"px",top:Math.floor(_5b2.t+(p?p.t:(_5b2.h-mb.h)/2))+"px"});
}
},_onKey:function(evt){
if(evt.charOrCode){
var dk=dojo.keys;
var node=evt.target;
if(evt.charOrCode===dk.TAB){
this._getFocusItems(this.domNode);
}
var _5b8=(this._firstFocusItem==this._lastFocusItem);
if(node==this._firstFocusItem&&evt.shiftKey&&evt.charOrCode===dk.TAB){
if(!_5b8){
dijit.focus(this._lastFocusItem);
}
dojo.stopEvent(evt);
}else{
if(node==this._lastFocusItem&&evt.charOrCode===dk.TAB&&!evt.shiftKey){
if(!_5b8){
dijit.focus(this._firstFocusItem);
}
dojo.stopEvent(evt);
}else{
while(node){
if(node==this.domNode){
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
if(!this._alreadyInitialized){
this._setup();
this._alreadyInitialized=true;
}
if(this._fadeOut.status()=="playing"){
this._fadeOut.stop();
}
this._modalconnects.push(dojo.connect(window,"onscroll",this,"layout"));
this._modalconnects.push(dojo.connect(window,"onresize",this,"layout"));
this._modalconnects.push(dojo.connect(dojo.doc.documentElement,"onkeypress",this,"_onKey"));
dojo.style(this.domNode,{opacity:0,visibility:""});
this.open=true;
this._loadCheck();
this._size();
this._position();
this._fadeIn.play();
this._savedFocus=dijit.getFocus(this);
if(this.autofocus){
this._getFocusItems(this.domNode);
setTimeout(dojo.hitch(dijit,"focus",this._firstFocusItem),50);
}
},hide:function(){
if(!this._alreadyInitialized){
return;
}
if(this._fadeIn.status()=="playing"){
this._fadeIn.stop();
}
this._fadeOut.play();
if(this._scrollConnected){
this._scrollConnected=false;
}
dojo.forEach(this._modalconnects,dojo.disconnect);
this._modalconnects=[];
if(this.refocus){
this.connect(this._fadeOut,"onEnd",dojo.hitch(dijit,"focus",this._savedFocus));
}
if(this._relativePosition){
delete this._relativePosition;
}
this.open=false;
},layout:function(){
if(this.domNode.style.visibility!="hidden"){
this._underlay.layout();
this._position();
}
},destroy:function(){
dojo.forEach(this._modalconnects,dojo.disconnect);
if(this.refocus&&this.open){
setTimeout(dojo.hitch(dijit,"focus",this._savedFocus),25);
}
this.inherited(arguments);
}});
dojo.declare("dijit.TooltipDialog",[dijit.layout.ContentPane,dijit._Templated,dijit.form._FormMixin,dijit._DialogMixin],{title:"",doLayout:false,autofocus:true,"class":"dijitTooltipDialog",_firstFocusItem:null,_lastFocusItem:null,templateString:null,templateString:"<div waiRole=\"presentation\">\r\n\t<div class=\"dijitTooltipContainer\" waiRole=\"presentation\">\r\n\t\t<div class =\"dijitTooltipContents dijitTooltipFocusNode\" dojoAttachPoint=\"containerNode\" tabindex=\"-1\" waiRole=\"dialog\"></div>\r\n\t</div>\r\n\t<div class=\"dijitTooltipConnector\" waiRole=\"presentation\"></div>\r\n</div>\r\n",postCreate:function(){
this.inherited(arguments);
this.connect(this.containerNode,"onkeypress","_onKey");
this.containerNode.title=this.title;
},orient:function(node,_5ba,_5bb){
this.domNode.className=this["class"]+" dijitTooltipAB"+(_5bb.charAt(1)=="L"?"Left":"Right")+" dijitTooltip"+(_5bb.charAt(0)=="T"?"Below":"Above");
},onOpen:function(pos){
this.orient(this.domNode,pos.aroundCorner,pos.corner);
this._loadCheck();
if(this.autofocus){
this._getFocusItems(this.containerNode);
dijit.focus(this._firstFocusItem);
}
},_onKey:function(evt){
var node=evt.target;
var dk=dojo.keys;
if(evt.charOrCode===dk.TAB){
this._getFocusItems(this.containerNode);
}
var _5c0=(this._firstFocusItem==this._lastFocusItem);
if(evt.charOrCode==dk.ESCAPE){
this.onCancel();
dojo.stopEvent(evt);
}else{
if(node==this._firstFocusItem&&evt.shiftKey&&evt.charOrCode===dk.TAB){
if(!_5c0){
dijit.focus(this._lastFocusItem);
}
dojo.stopEvent(evt);
}else{
if(node==this._lastFocusItem&&evt.charOrCode===dk.TAB&&!evt.shiftKey){
if(!_5c0){
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
if(!dojo._hasResource["dijit.form._FormWidget"]){
dojo._hasResource["dijit.form._FormWidget"]=true;
dojo.provide("dijit.form._FormWidget");
dojo.declare("dijit.form._FormWidget",[dijit._Widget,dijit._Templated],{baseClass:"",name:"",alt:"",value:"",type:"text",tabIndex:"0",disabled:false,readOnly:false,intermediateChanges:false,attributeMap:dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap),{value:"focusNode",disabled:"focusNode",readOnly:"focusNode",id:"focusNode",tabIndex:"focusNode",alt:"focusNode"}),_setDisabledAttr:function(_5c1){
this.disabled=_5c1;
dojo.attr(this.focusNode,"disabled",_5c1);
dijit.setWaiState(this.focusNode,"disabled",_5c1);
if(_5c1){
this._hovering=false;
this._active=false;
this.focusNode.removeAttribute("tabIndex");
}else{
this.focusNode.setAttribute("tabIndex",this.tabIndex);
}
this._setStateClass();
},setDisabled:function(_5c2){
dojo.deprecated("setDisabled("+_5c2+") is deprecated. Use attr('disabled',"+_5c2+") instead.","","2.0");
this.attr("disabled",_5c2);
},_scroll:true,_onFocus:function(e){
if(this._scroll){
dijit.scrollIntoView(this.domNode);
}
this.inherited(arguments);
},_onMouse:function(_5c4){
var _5c5=_5c4.currentTarget;
if(_5c5&&_5c5.getAttribute){
this.stateModifier=_5c5.getAttribute("stateModifier")||"";
}
if(!this.disabled){
switch(_5c4.type){
case "mouseenter":
case "mouseover":
this._hovering=true;
this._active=this._mouseDown;
break;
case "mouseout":
case "mouseleave":
this._hovering=false;
this._active=false;
break;
case "mousedown":
this._active=true;
this._mouseDown=true;
var _5c6=this.connect(dojo.body(),"onmouseup",function(){
if(this._mouseDown&&this.isFocusable()){
this.focus();
}
this._active=false;
this._mouseDown=false;
this._setStateClass();
this.disconnect(_5c6);
});
break;
}
this._setStateClass();
}
},isFocusable:function(){
return !this.disabled&&!this.readOnly&&this.focusNode&&(dojo.style(this.domNode,"display")!="none");
},focus:function(){
dijit.focus(this.focusNode);
},_setStateClass:function(){
var _5c7=this.baseClass.split(" ");
function multiply(_5c8){
_5c7=_5c7.concat(dojo.map(_5c7,function(c){
return c+_5c8;
}),"dijit"+_5c8);
};
if(this.checked){
multiply("Checked");
}
if(this.state){
multiply(this.state);
}
if(this.selected){
multiply("Selected");
}
if(this.disabled){
multiply("Disabled");
}else{
if(this.readOnly){
multiply("ReadOnly");
}else{
if(this._active){
multiply(this.stateModifier+"Active");
}else{
if(this._focused){
multiply("Focused");
}
if(this._hovering){
multiply(this.stateModifier+"Hover");
}
}
}
}
var tn=this.stateNode||this.domNode,_5cb={};
dojo.forEach(tn.className.split(" "),function(c){
_5cb[c]=true;
});
if("_stateClasses" in this){
dojo.forEach(this._stateClasses,function(c){
delete _5cb[c];
});
}
dojo.forEach(_5c7,function(c){
_5cb[c]=true;
});
var _5cf=[];
for(var c in _5cb){
_5cf.push(c);
}
tn.className=_5cf.join(" ");
this._stateClasses=_5c7;
},compare:function(val1,val2){
if((typeof val1=="number")&&(typeof val2=="number")){
return (isNaN(val1)&&isNaN(val2))?0:(val1-val2);
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
},onChange:function(_5d3){
},_onChangeActive:false,_handleOnChange:function(_5d4,_5d5){
this._lastValue=_5d4;
if(this._lastValueReported==undefined&&(_5d5===null||!this._onChangeActive)){
this._resetValue=this._lastValueReported=_5d4;
}
if((this.intermediateChanges||_5d5||_5d5===undefined)&&((typeof _5d4!=typeof this._lastValueReported)||this.compare(_5d4,this._lastValueReported)!=0)){
this._lastValueReported=_5d4;
if(this._onChangeActive){
this.onChange(_5d4);
}
}
},create:function(){
this.inherited(arguments);
this._onChangeActive=true;
this._setStateClass();
},destroy:function(){
if(this._layoutHackHandle){
clearTimeout(this._layoutHackHandle);
}
this.inherited(arguments);
},setValue:function(_5d6){
dojo.deprecated("dijit.form._FormWidget:setValue("+_5d6+") is deprecated.  Use attr('value',"+_5d6+") instead.","","2.0");
this.attr("value",_5d6);
},getValue:function(){
dojo.deprecated(this.declaredClass+"::getValue() is deprecated. Use attr('value') instead.","","2.0");
return this.attr("value");
},_layoutHack:function(){
if(dojo.isFF==2&&!this._layoutHackHandle){
var node=this.domNode;
var old=node.style.opacity;
node.style.opacity="0.999";
this._layoutHackHandle=setTimeout(dojo.hitch(this,function(){
this._layoutHackHandle=null;
node.style.opacity=old;
}),0);
}
}});
dojo.declare("dijit.form._FormValueWidget",dijit.form._FormWidget,{attributeMap:dojo.mixin(dojo.clone(dijit.form._FormWidget.prototype.attributeMap),{value:""}),postCreate:function(){
if(dojo.isIE||dojo.isSafari){
this.connect(this.focusNode||this.domNode,"onkeydown",this._onKeyDown);
}
if(this._resetValue===undefined){
this._resetValue=this.value;
}
},_setValueAttr:function(_5d9,_5da){
this.value=_5d9;
this._handleOnChange(_5d9,_5da);
},_getValueAttr:function(_5db){
return this._lastValue;
},undo:function(){
this._setValueAttr(this._lastValueReported,false);
},reset:function(){
this._hasBeenBlurred=false;
this._setValueAttr(this._resetValue,true);
},_valueChanged:function(){
var v=this.attr("value");
var lv=this._lastValueReported;
return ((v!==null&&(v!==undefined)&&v.toString)?v.toString():"")!==((lv!==null&&(lv!==undefined)&&lv.toString)?lv.toString():"");
},_onKeyDown:function(e){
if(e.keyCode==dojo.keys.ESCAPE&&!e.ctrlKey&&!e.altKey){
var te;
if(dojo.isIE){
e.preventDefault();
te=document.createEventObject();
te.keyCode=dojo.keys.ESCAPE;
te.shiftKey=e.shiftKey;
e.srcElement.fireEvent("onkeypress",te);
}else{
if(dojo.isSafari){
te=document.createEvent("Events");
te.initEvent("keypress",true,true);
te.keyCode=dojo.keys.ESCAPE;
te.shiftKey=e.shiftKey;
e.target.dispatchEvent(te);
}
}
}
},_onKeyPress:function(e){
if(e.charOrCode==dojo.keys.ESCAPE&&!e.ctrlKey&&!e.altKey&&this._valueChanged()){
this.undo();
dojo.stopEvent(e);
return false;
}else{
if(this.intermediateChanges){
var _5e1=this;
setTimeout(function(){
_5e1._handleOnChange(_5e1.attr("value"),false);
},0);
}
}
return true;
}});
}
if(!dojo._hasResource["dijit.form.TextBox"]){
dojo._hasResource["dijit.form.TextBox"]=true;
dojo.provide("dijit.form.TextBox");
dojo.declare("dijit.form.TextBox",dijit.form._FormValueWidget,{trim:false,uppercase:false,lowercase:false,propercase:false,maxLength:"",templateString:"<input class=\"dijit dijitReset dijitLeft\" dojoAttachPoint='textbox,focusNode' name=\"${name}\"\r\n\tdojoAttachEvent='onmouseenter:_onMouse,onmouseleave:_onMouse,onfocus:_onMouse,onblur:_onMouse,onkeypress:_onKeyPress'\r\n\tautocomplete=\"off\" type=\"${type}\"\r\n\t/>\r\n",baseClass:"dijitTextBox",attributeMap:dojo.mixin(dojo.clone(dijit.form._FormValueWidget.prototype.attributeMap),{maxLength:"focusNode"}),_getValueAttr:function(){
return this.parse(this.attr("displayedValue"),this.constraints);
},_setValueAttr:function(_5e2,_5e3,_5e4){
var _5e5;
if(_5e2!==undefined){
_5e5=this.filter(_5e2);
if(_5e5!==null&&((typeof _5e5!="number")||!isNaN(_5e5))){
if(typeof _5e4!="string"){
_5e4=this.format(_5e5,this.constraints);
}
}else{
_5e4="";
}
}
if(_5e4!=null&&_5e4!=undefined){
this.textbox.value=_5e4;
}
dijit.form.TextBox.superclass._setValueAttr.call(this,_5e5,_5e3);
},displayedValue:"",getDisplayedValue:function(){
dojo.deprecated(this.declaredClass+"::getDisplayedValue() is deprecated. Use attr('displayedValue') instead.","","2.0");
return this.attr("displayedValue");
},_getDisplayedValueAttr:function(){
return this.filter(this.textbox.value);
},setDisplayedValue:function(_5e6){
dojo.deprecated(this.declaredClass+"::setDisplayedValue() is deprecated. Use attr('displayedValue', ...) instead.","","2.0");
this.attr("displayedValue",_5e6);
},_setDisplayedValueAttr:function(_5e7){
this.textbox.value=_5e7;
this._setValueAttr(this.attr("value"));
},format:function(_5e8,_5e9){
return ((_5e8==null||_5e8==undefined)?"":(_5e8.toString?_5e8.toString():_5e8));
},parse:function(_5ea,_5eb){
return _5ea;
},postCreate:function(){
this.textbox.setAttribute("value",this.textbox.value);
this.inherited(arguments);
this._layoutHack();
},filter:function(val){
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
this._setValueAttr(this.attr("value"),(this.isValid?this.isValid():true));
},_onBlur:function(){
this._setBlurValue();
this.inherited(arguments);
}});
dijit.selectInputText=function(_5ee,_5ef,stop){
var _5f1=dojo.global;
var _5f2=dojo.doc;
_5ee=dojo.byId(_5ee);
if(isNaN(_5ef)){
_5ef=0;
}
if(isNaN(stop)){
stop=_5ee.value?_5ee.value.length:0;
}
_5ee.focus();
if(_5f2["selection"]&&dojo.body()["createTextRange"]){
if(_5ee.createTextRange){
var _5f3=_5ee.createTextRange();
with(_5f3){
collapse(true);
moveStart("character",_5ef);
moveEnd("character",stop);
select();
}
}
}else{
if(_5f1["getSelection"]){
var _5f4=_5f1.getSelection();
if(_5ee.setSelectionRange){
_5ee.setSelectionRange(_5ef,stop);
}
}
}
};
}
if(!dojo._hasResource["dijit.Tooltip"]){
dojo._hasResource["dijit.Tooltip"]=true;
dojo.provide("dijit.Tooltip");
dojo.declare("dijit._MasterTooltip",[dijit._Widget,dijit._Templated],{duration:dijit.defaultDuration,templateString:"<div class=\"dijitTooltip dijitTooltipLeft\" id=\"dojoTooltip\">\r\n\t<div class=\"dijitTooltipContainer dijitTooltipContents\" dojoAttachPoint=\"containerNode\" waiRole='alert'></div>\r\n\t<div class=\"dijitTooltipConnector\"></div>\r\n</div>\r\n",postCreate:function(){
dojo.body().appendChild(this.domNode);
this.bgIframe=new dijit.BackgroundIframe(this.domNode);
this.fadeIn=dojo.fadeIn({node:this.domNode,duration:this.duration,onEnd:dojo.hitch(this,"_onShow")});
this.fadeOut=dojo.fadeOut({node:this.domNode,duration:this.duration,onEnd:dojo.hitch(this,"_onHide")});
},show:function(_5f5,_5f6,_5f7){
if(this.aroundNode&&this.aroundNode===_5f6){
return;
}
if(this.fadeOut.status()=="playing"){
this._onDeck=arguments;
return;
}
this.containerNode.innerHTML=_5f5;
this.domNode.style.top=(this.domNode.offsetTop+1)+"px";
var _5f8={};
var ltr=this.isLeftToRight();
dojo.forEach((_5f7&&_5f7.length)?_5f7:dijit.Tooltip.defaultPosition,function(pos){
switch(pos){
case "after":
_5f8[ltr?"BR":"BL"]=ltr?"BL":"BR";
break;
case "before":
_5f8[ltr?"BL":"BR"]=ltr?"BR":"BL";
break;
case "below":
_5f8[ltr?"BL":"BR"]=ltr?"TL":"TR";
_5f8[ltr?"BR":"BL"]=ltr?"TR":"TL";
break;
case "above":
default:
_5f8[ltr?"TL":"TR"]=ltr?"BL":"BR";
_5f8[ltr?"TR":"TL"]=ltr?"BR":"BL";
break;
}
});
var pos=dijit.placeOnScreenAroundElement(this.domNode,_5f6,_5f8,dojo.hitch(this,"orient"));
dojo.style(this.domNode,"opacity",0);
this.fadeIn.play();
this.isShowingNow=true;
this.aroundNode=_5f6;
},orient:function(node,_5fd,_5fe){
node.className="dijitTooltip "+{"BL-TL":"dijitTooltipBelow dijitTooltipABLeft","TL-BL":"dijitTooltipAbove dijitTooltipABLeft","BR-TR":"dijitTooltipBelow dijitTooltipABRight","TR-BR":"dijitTooltipAbove dijitTooltipABRight","BR-BL":"dijitTooltipRight","BL-BR":"dijitTooltipLeft"}[_5fd+"-"+_5fe];
},_onShow:function(){
if(dojo.isIE){
this.domNode.style.filter="";
}
},hide:function(_5ff){
if(this._onDeck&&this._onDeck[1]==_5ff){
this._onDeck=null;
}else{
if(this.aroundNode===_5ff){
this.fadeIn.stop();
this.isShowingNow=false;
this.aroundNode=null;
this.fadeOut.play();
}else{
}
}
},_onHide:function(){
this.domNode.style.cssText="";
if(this._onDeck){
this.show.apply(this,this._onDeck);
this._onDeck=null;
}
}});
dijit.showTooltip=function(_600,_601,_602){
if(!dijit._masterTT){
dijit._masterTT=new dijit._MasterTooltip();
}
return dijit._masterTT.show(_600,_601,_602);
};
dijit.hideTooltip=function(_603){
if(!dijit._masterTT){
dijit._masterTT=new dijit._MasterTooltip();
}
return dijit._masterTT.hide(_603);
};
dojo.declare("dijit.Tooltip",dijit._Widget,{label:"",showDelay:400,connectId:[],position:[],postCreate:function(){
dojo.addClass(this.domNode,"dijitTooltipData");
this._connectNodes=[];
dojo.forEach(this.connectId,function(id){
var node=dojo.byId(id);
if(node){
this._connectNodes.push(node);
dojo.forEach(["onMouseEnter","onMouseLeave","onFocus","onBlur"],function(_606){
this.connect(node,_606.toLowerCase(),"_"+_606);
},this);
if(dojo.isIE){
node.style.zoom=1;
}
}
},this);
},_onMouseEnter:function(e){
this._onHover(e);
},_onMouseLeave:function(e){
this._onUnHover(e);
},_onFocus:function(e){
this._focus=true;
this._onHover(e);
this.inherited(arguments);
},_onBlur:function(e){
this._focus=false;
this._onUnHover(e);
this.inherited(arguments);
},_onHover:function(e){
if(!this._showTimer){
var _60c=e.target;
this._showTimer=setTimeout(dojo.hitch(this,function(){
this.open(_60c);
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
},open:function(_60e){
_60e=_60e||this._connectNodes[0];
if(!_60e){
return;
}
if(this._showTimer){
clearTimeout(this._showTimer);
delete this._showTimer;
}
dijit.showTooltip(this.label||this.domNode.innerHTML,_60e,this.position);
this._connectNode=_60e;
},close:function(){
if(this._connectNode){
dijit.hideTooltip(this._connectNode);
delete this._connectNode;
}
if(this._showTimer){
clearTimeout(this._showTimer);
delete this._showTimer;
}
},uninitialize:function(){
this.close();
}});
dijit.Tooltip.defaultPosition=["after","before"];
}
if(!dojo._hasResource["dijit.form.ValidationTextBox"]){
dojo._hasResource["dijit.form.ValidationTextBox"]=true;
dojo.provide("dijit.form.ValidationTextBox");
dojo.declare("dijit.form.ValidationTextBox",dijit.form.TextBox,{templateString:"<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\r\n\tid=\"widget_${id}\"\r\n\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\" waiRole=\"presentation\"\r\n\t><div style=\"overflow:hidden;\"\r\n\t\t><div class=\"dijitReset dijitValidationIcon\"><br></div\r\n\t\t><div class=\"dijitReset dijitValidationIconText\">&Chi;</div\r\n\t\t><div class=\"dijitReset dijitInputField\"\r\n\t\t\t><input class=\"dijitReset\" dojoAttachPoint='textbox,focusNode' dojoAttachEvent='onfocus:_update,onkeyup:_update,onblur:_onMouse,onkeypress:_onKeyPress' autocomplete=\"off\"\r\n\t\t\ttype='${type}' name='${name}'\r\n\t\t/></div\r\n\t></div\r\n></div>\r\n",baseClass:"dijitTextBox",required:false,promptMessage:"",invalidMessage:"$_unset_$",constraints:{},regExp:".*",regExpGen:function(_60f){
return this.regExp;
},state:"",tooltipPosition:[],_setValueAttr:function(){
this.inherited(arguments);
this.validate(this._focused);
},validator:function(_610,_611){
return (new RegExp("^(?:"+this.regExpGen(_611)+")"+(this.required?"":"?")+"$")).test(_610)&&(!this.required||!this._isEmpty(_610))&&(this._isEmpty(_610)||this.parse(_610,_611)!==undefined);
},_isValidSubset:function(){
return this.textbox.value.search(this._partialre)==0;
},isValid:function(_612){
return this.validator(this.textbox.value,this.constraints);
},_isEmpty:function(_613){
return /^\s*$/.test(_613);
},getErrorMessage:function(_614){
return this.invalidMessage;
},getPromptMessage:function(_615){
return this.promptMessage;
},_maskValidSubsetError:true,validate:function(_616){
var _617="";
var _618=this.disabled||this.isValid(_616);
if(_618){
this._maskValidSubsetError=true;
}
var _619=!_618&&_616&&this._isValidSubset();
var _61a=this._isEmpty(this.textbox.value);
this.state=(_618||(!this._hasBeenBlurred&&_61a)||_619)?"":"Error";
if(this.state=="Error"){
this._maskValidSubsetError=false;
}
this._setStateClass();
dijit.setWaiState(this.focusNode,"invalid",_618?"false":"true");
if(_616){
if(_61a){
_617=this.getPromptMessage(true);
}
if(!_617&&(this.state=="Error"||(_619&&!this._maskValidSubsetError))){
_617=this.getErrorMessage(true);
}
}
this.displayMessage(_617);
return _618;
},_message:"",displayMessage:function(_61b){
if(this._message==_61b){
return;
}
this._message=_61b;
dijit.hideTooltip(this.domNode);
if(_61b){
dijit.showTooltip(_61b,this.domNode,this.tooltipPosition);
}
},_refreshState:function(){
this.validate(this._focused);
},_update:function(e){
this._refreshState();
this._onMouse(e);
},constructor:function(){
this.constraints={};
},postMixInProperties:function(){
this.inherited(arguments);
this.constraints.locale=this.lang;
this.messages=dojo.i18n.getLocalization("dijit.form","validate",this.lang);
if(this.invalidMessage=="$_unset_$"){
this.invalidMessage=this.messages.invalidMessage;
}
var p=this.regExpGen(this.constraints);
this.regExp=p;
var _61e="";
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
_61e+=re;
break;
case ")":
_61e+="|$)";
break;
default:
_61e+="(?:"+re+"|$)";
break;
}
});
}
try{
"".search(_61e);
}
catch(e){
_61e=this.regExp;
console.debug("RegExp error in "+this.declaredClass+": "+this.regExp);
}
this._partialre="^(?:"+_61e+")$";
},_setDisabledAttr:function(_620){
this.inherited(arguments);
if(this.valueNode){
this.valueNode.disabled=_620;
}
this._refreshState();
},_setRequiredAttr:function(_621){
this.required=_621;
dijit.setWaiState(this.focusNode,"required",_621);
this._refreshState();
},postCreate:function(){
if(dojo.isIE){
var s=dojo.getComputedStyle(this.focusNode);
if(s){
var ff=s.fontFamily;
if(ff){
this.focusNode.style.fontFamily=ff;
}
}
}
this.inherited(arguments);
}});
dojo.declare("dijit.form.MappedTextBox",dijit.form.ValidationTextBox,{serialize:function(val,_625){
return val.toString?val.toString():"";
},toString:function(){
var val=this.filter(this.attr("value"));
return val!=null?(typeof val=="string"?val:this.serialize(val,this.constraints)):"";
},validate:function(){
this.valueNode.value=this.toString();
return this.inherited(arguments);
},buildRendering:function(){
this.inherited(arguments);
var _627=this.textbox;
var _628=(this.valueNode=dojo.doc.createElement("input"));
_628.setAttribute("type",_627.type);
dojo.style(_628,"display","none");
this.valueNode.name=this.textbox.name;
dojo.place(_628,_627,"after");
this.textbox.name=this.textbox.name+"_displayed_";
this.textbox.removeAttribute("name");
},_setDisabledAttr:function(_629){
this.inherited(arguments);
dojo.attr(this.valueNode,"disabled",_629);
}});
dojo.declare("dijit.form.RangeBoundTextBox",dijit.form.MappedTextBox,{rangeMessage:"",rangeCheck:function(_62a,_62b){
var _62c="min" in _62b;
var _62d="max" in _62b;
if(_62c||_62d){
return (!_62c||this.compare(_62a,_62b.min)>=0)&&(!_62d||this.compare(_62a,_62b.max)<=0);
}
return true;
},isInRange:function(_62e){
return this.rangeCheck(this.attr("value"),this.constraints);
},_isDefinitelyOutOfRange:function(){
var val=this.attr("value");
var _630=false;
var _631=false;
if("min" in this.constraints){
var min=this.constraints.min;
val=this.compare(val,((typeof min=="number")&&min>=0&&val!=0)?0:min);
_630=(typeof val=="number")&&val<0;
}
if("max" in this.constraints){
var max=this.constraints.max;
val=this.compare(val,((typeof max!="number")||max>0)?max:0);
_631=(typeof val=="number")&&val>0;
}
return _630||_631;
},_isValidSubset:function(){
return this.inherited(arguments)&&!this._isDefinitelyOutOfRange();
},isValid:function(_634){
return this.inherited(arguments)&&((this._isEmpty(this.textbox.value)&&!this.required)||this.isInRange(_634));
},getErrorMessage:function(_635){
if(dijit.form.RangeBoundTextBox.superclass.isValid.call(this,false)&&!this.isInRange(_635)){
return this.rangeMessage;
}
return this.inherited(arguments);
},postMixInProperties:function(){
this.inherited(arguments);
if(!this.rangeMessage){
this.messages=dojo.i18n.getLocalization("dijit.form","validate",this.lang);
this.rangeMessage=this.messages.rangeMessage;
}
},postCreate:function(){
this.inherited(arguments);
if(this.constraints.min!==undefined){
dijit.setWaiState(this.focusNode,"valuemin",this.constraints.min);
}
if(this.constraints.max!==undefined){
dijit.setWaiState(this.focusNode,"valuemax",this.constraints.max);
}
},_setValueAttr:function(_636,_637){
dijit.setWaiState(this.focusNode,"valuenow",_636);
this.inherited(arguments);
}});
}
if(!dojo._hasResource["dijit.form.ComboBox"]){
dojo._hasResource["dijit.form.ComboBox"]=true;
dojo.provide("dijit.form.ComboBox");
dojo.declare("dijit.form.ComboBoxMixin",null,{item:null,pageSize:Infinity,store:null,fetchProperties:{},query:{},autoComplete:true,highlightMatch:"first",searchDelay:100,searchAttr:"name",labelAttr:"",labelType:"text",queryExpr:"${0}*",ignoreCase:true,hasDownArrow:true,templateString:"<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\r\n\tid=\"widget_${id}\"\r\n\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\" dojoAttachPoint=\"comboNode\" waiRole=\"combobox\" tabIndex=\"-1\"\r\n\t><div style=\"overflow:hidden;\"\r\n\t\t><div class='dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton'\r\n\t\t\tdojoAttachPoint=\"downArrowNode\" waiRole=\"presentation\"\r\n\t\t\tdojoAttachEvent=\"onmousedown:_onArrowMouseDown,onmouseup:_onMouse,onmouseenter:_onMouse,onmouseleave:_onMouse\"\r\n\t\t\t><div class=\"dijitArrowButtonInner\">&thinsp;</div\r\n\t\t\t><div class=\"dijitArrowButtonChar\">&#9660;</div\r\n\t\t></div\r\n\t\t><div class=\"dijitReset dijitValidationIcon\"><br></div\r\n\t\t><div class=\"dijitReset dijitValidationIconText\">&Chi;</div\r\n\t\t><div class=\"dijitReset dijitInputField\"\r\n\t\t\t><input type=\"text\" autocomplete=\"off\" name=\"${name}\" class='dijitReset'\r\n\t\t\tdojoAttachEvent=\"onkeypress:_onKeyPress, onfocus:_update, compositionend\"\r\n\t\t\tdojoAttachPoint=\"textbox,focusNode\" waiRole=\"textbox\" waiState=\"haspopup-true,autocomplete-list\"\r\n\t\t/></div\r\n\t></div\r\n></div>\r\n",baseClass:"dijitComboBox",_getCaretPos:function(_638){
var pos=0;
if(typeof (_638.selectionStart)=="number"){
pos=_638.selectionStart;
}else{
if(dojo.isIE){
var tr=dojo.doc.selection.createRange().duplicate();
var ntr=_638.createTextRange();
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
},_setCaretPos:function(_63c,_63d){
_63d=parseInt(_63d);
dijit.selectInputText(_63c,_63d,_63d);
},_setDisabledAttr:function(_63e){
dijit.setWaiState(this.comboNode,"disabled",_63e);
},_onKeyPress:function(evt){
var key=evt.charOrCode;
if(evt.altKey||(evt.ctrlKey&&(key!="x"&&key!="v"))||evt.key==dojo.keys.SHIFT){
return;
}
var _641=false;
var pw=this._popupWidget;
var dk=dojo.keys;
if(this._isShowingNow){
pw.handleKey(key);
}
switch(key){
case dk.PAGE_DOWN:
case dk.DOWN_ARROW:
if(!this._isShowingNow||this._prev_key_esc){
this._arrowPressed();
_641=true;
}else{
this._announceOption(pw.getHighlightedOption());
}
dojo.stopEvent(evt);
this._prev_key_backspace=false;
this._prev_key_esc=false;
break;
case dk.PAGE_UP:
case dk.UP_ARROW:
if(this._isShowingNow){
this._announceOption(pw.getHighlightedOption());
}
dojo.stopEvent(evt);
this._prev_key_backspace=false;
this._prev_key_esc=false;
break;
case dk.ENTER:
var _644;
if(this._isShowingNow&&(_644=pw.getHighlightedOption())){
if(_644==pw.nextButton){
this._nextSearch(1);
dojo.stopEvent(evt);
break;
}else{
if(_644==pw.previousButton){
this._nextSearch(-1);
dojo.stopEvent(evt);
break;
}
}
}else{
this._setDisplayedValueAttr(this.attr("displayedValue"),true);
}
evt.preventDefault();
case dk.TAB:
var _645=this.attr("displayedValue");
if(pw&&(_645==pw._messages["previousMessage"]||_645==pw._messages["nextMessage"])){
break;
}
if(this._isShowingNow){
this._prev_key_backspace=false;
this._prev_key_esc=false;
if(pw.getHighlightedOption()){
pw.attr("value",{target:pw.getHighlightedOption()});
}
this._lastQuery=null;
this._hideResultList();
}
break;
case " ":
this._prev_key_backspace=false;
this._prev_key_esc=false;
if(this._isShowingNow&&pw.getHighlightedOption()){
dojo.stopEvent(evt);
this._selectOption();
this._hideResultList();
}else{
_641=true;
}
break;
case dk.ESCAPE:
this._prev_key_backspace=false;
this._prev_key_esc=true;
if(this._isShowingNow){
dojo.stopEvent(evt);
this._hideResultList();
}else{
this.inherited(arguments);
}
break;
case dk.DELETE:
case dk.BACKSPACE:
this._prev_key_esc=false;
this._prev_key_backspace=true;
_641=true;
break;
case dk.RIGHT_ARROW:
case dk.LEFT_ARROW:
this._prev_key_backspace=false;
this._prev_key_esc=false;
break;
default:
this._prev_key_backspace=false;
this._prev_key_esc=false;
_641=typeof key=="string";
}
if(this.searchTimer){
clearTimeout(this.searchTimer);
}
if(_641){
setTimeout(dojo.hitch(this,"_startSearchFromInput"),1);
}
},_autoCompleteText:function(text){
var fn=this.focusNode;
dijit.selectInputText(fn,fn.value.length);
var _648=this.ignoreCase?"toLowerCase":"substr";
if(text[_648](0).indexOf(this.focusNode.value[_648](0))==0){
var cpos=this._getCaretPos(fn);
if((cpos+1)>fn.value.length){
fn.value=text;
dijit.selectInputText(fn,cpos);
}
}else{
fn.value=text;
dijit.selectInputText(fn);
}
},_openResultList:function(_64a,_64b){
if(this.disabled||this.readOnly||(_64b.query[this.searchAttr]!=this._lastQuery)){
return;
}
this._popupWidget.clearResultList();
if(!_64a.length){
this._hideResultList();
return;
}
var _64c=new String(this.store.getValue(_64a[0],this.searchAttr));
if(_64c&&this.autoComplete&&!this._prev_key_backspace&&(_64b.query[this.searchAttr]!="*")){
this._autoCompleteText(_64c);
}
_64b._maxOptions=this._maxOptions;
this._popupWidget.createOptions(_64a,_64b,dojo.hitch(this,"_getMenuLabelFromItem"));
this._showResultList();
if(_64b.direction){
if(1==_64b.direction){
this._popupWidget.highlightFirstOption();
}else{
if(-1==_64b.direction){
this._popupWidget.highlightLastOption();
}
}
this._announceOption(this._popupWidget.getHighlightedOption());
}
},_showResultList:function(){
this._hideResultList();
var _64d=this._popupWidget.getItems(),_64e=Math.min(_64d.length,this.maxListLength);
this._arrowPressed();
this.displayMessage("");
dojo.style(this._popupWidget.domNode,{width:"",height:""});
var best=this.open();
var _650=dojo.marginBox(this._popupWidget.domNode);
this._popupWidget.domNode.style.overflow=((best.h==_650.h)&&(best.w==_650.w))?"hidden":"auto";
var _651=best.w;
if(best.h<this._popupWidget.domNode.scrollHeight){
_651+=16;
}
dojo.marginBox(this._popupWidget.domNode,{h:best.h,w:Math.max(_651,this.domNode.offsetWidth)});
dijit.setWaiState(this.comboNode,"expanded","true");
},_hideResultList:function(){
if(this._isShowingNow){
dijit.popup.close(this._popupWidget);
this._arrowIdle();
this._isShowingNow=false;
dijit.setWaiState(this.comboNode,"expanded","false");
dijit.removeWaiState(this.focusNode,"activedescendant");
}
},_setBlurValue:function(){
var _652=this.attr("displayedValue");
var pw=this._popupWidget;
if(pw&&(_652==pw._messages["previousMessage"]||_652==pw._messages["nextMessage"])){
this._setValueAttr(this._lastValueReported,true);
}else{
this.attr("displayedValue",_652);
}
},_onBlur:function(){
this._hideResultList();
this._arrowIdle();
this.inherited(arguments);
},_announceOption:function(node){
if(node==null){
return;
}
var _655;
if(node==this._popupWidget.nextButton||node==this._popupWidget.previousButton){
_655=node.innerHTML;
}else{
_655=this.store.getValue(node.item,this.searchAttr);
}
this.focusNode.value=this.focusNode.value.substring(0,this._getCaretPos(this.focusNode));
dijit.setWaiState(this.focusNode,"activedescendant",dojo.attr(node,"id"));
this._autoCompleteText(_655);
},_selectOption:function(evt){
var tgt=null;
if(!evt){
evt={target:this._popupWidget.getHighlightedOption()};
}
if(!evt.target){
this.attr("displayedValue",this.attr("displayedValue"));
return;
}else{
tgt=evt.target;
}
if(!evt.noHide){
this._hideResultList();
this._setCaretPos(this.focusNode,this.store.getValue(tgt.item,this.searchAttr).length);
}
this._doSelect(tgt);
},_doSelect:function(tgt){
this.item=tgt.item;
this.attr("value",this.store.getValue(tgt.item,this.searchAttr));
},_onArrowMouseDown:function(evt){
if(this.disabled||this.readOnly){
return;
}
dojo.stopEvent(evt);
this.focus();
if(this._isShowingNow){
this._hideResultList();
}else{
this._startSearch("");
}
},_startSearchFromInput:function(){
this._startSearch(this.focusNode.value.replace(/([\\\*\?])/g,"\\$1"));
},_getQueryString:function(text){
return dojo.string.substitute(this.queryExpr,[text]);
},_startSearch:function(key){
if(!this._popupWidget){
var _65c=this.id+"_popup";
this._popupWidget=new dijit.form._ComboBoxMenu({onChange:dojo.hitch(this,this._selectOption),id:_65c});
dijit.removeWaiState(this.focusNode,"activedescendant");
dijit.setWaiState(this.textbox,"owns",_65c);
}
this.item=null;
var _65d=dojo.clone(this.query);
this._lastInput=key;
this._lastQuery=_65d[this.searchAttr]=this._getQueryString(key);
this.searchTimer=setTimeout(dojo.hitch(this,function(_65e,_65f){
var _660={queryOptions:{ignoreCase:this.ignoreCase,deep:true},query:_65e,onBegin:dojo.hitch(this,"_setMaxOptions"),onComplete:dojo.hitch(this,"_openResultList"),onError:function(_661){
console.error("dijit.form.ComboBox: "+_661);
dojo.hitch(_65f,"_hideResultList")();
},start:0,count:this.pageSize};
dojo.mixin(_660,_65f.fetchProperties);
var _662=_65f.store.fetch(_660);
var _663=function(_664,_665){
_664.start+=_664.count*_665;
_664.direction=_665;
this.store.fetch(_664);
};
this._nextSearch=this._popupWidget.onPage=dojo.hitch(this,_663,_662);
},_65d,this),this.searchDelay);
},_setMaxOptions:function(size,_667){
this._maxOptions=size;
},_getValueField:function(){
return this.searchAttr;
},_arrowPressed:function(){
if(!this.disabled&&!this.readOnly&&this.hasDownArrow){
dojo.addClass(this.downArrowNode,"dijitArrowButtonActive");
}
},_arrowIdle:function(){
if(!this.disabled&&!this.readOnly&&this.hasDownArrow){
dojo.removeClass(this.downArrowNode,"dojoArrowButtonPushed");
}
},compositionend:function(evt){
this._onKeyPress({charCode:-1});
},constructor:function(){
this.query={};
this.fetchProperties={};
},postMixInProperties:function(){
if(!this.hasDownArrow){
this.baseClass="dijitTextBox";
}
if(!this.store){
var _669=this.srcNodeRef;
this.store=new dijit.form._ComboBoxDataStore(_669);
if(!this.value||((typeof _669.selectedIndex=="number")&&_669.selectedIndex.toString()===this.value)){
var item=this.store.fetchSelectedItem();
if(item){
this.value=this.store.getValue(item,this._getValueField());
}
}
}
},_postCreate:function(){
var _66b=dojo.query("label[for=\""+this.id+"\"]");
if(_66b.length){
_66b[0].id=(this.id+"_label");
var cn=this.comboNode;
dijit.setWaiState(cn,"labelledby",_66b[0].id);
}
},uninitialize:function(){
if(this._popupWidget){
this._hideResultList();
this._popupWidget.destroy();
}
},_getMenuLabelFromItem:function(item){
var _66e=this.store.getValue(item,this.labelAttr||this.searchAttr);
var _66f=this.labelType;
if(this.highlightMatch!="none"&&this.labelType=="text"&&this._lastInput){
_66e=this.doHighlight(_66e,this._escapeHtml(this._lastInput));
_66f="html";
}
return {html:_66f=="html",label:_66e};
},doHighlight:function(_670,find){
var _672="i"+(this.highlightMatch=="all"?"g":"");
var _673=this._escapeHtml(_670);
var ret=_673.replace(new RegExp("^("+find+")",_672),"<span class=\"dijitComboBoxHighlightMatch\">$1</span>");
if(_673==ret){
ret=_673.replace(new RegExp(" ("+find+")",_672)," <span class=\"dijitComboBoxHighlightMatch\">$1</span>");
}
return ret;
},_escapeHtml:function(str){
str=String(str).replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;");
return str;
},open:function(){
this._isShowingNow=true;
return dijit.popup.open({popup:this._popupWidget,around:this.domNode,parent:this});
},reset:function(){
this.item=null;
this.inherited(arguments);
}});
dojo.declare("dijit.form._ComboBoxMenu",[dijit._Widget,dijit._Templated],{templateString:"<ul class='dijitReset dijitMenu' dojoAttachEvent='onmousedown:_onMouseDown,onmouseup:_onMouseUp,onmouseover:_onMouseOver,onmouseout:_onMouseOut' tabIndex='-1' style='overflow: \"auto\"; overflow-x: \"hidden\";'>"+"<li class='dijitMenuItem dijitMenuPreviousButton' dojoAttachPoint='previousButton'></li>"+"<li class='dijitMenuItem dijitMenuNextButton' dojoAttachPoint='nextButton'></li>"+"</ul>",_messages:null,postMixInProperties:function(){
this._messages=dojo.i18n.getLocalization("dijit.form","ComboBox",this.lang);
this.inherited("postMixInProperties",arguments);
},_setValueAttr:function(_676){
this.value=_676;
this.onChange(_676);
},onChange:function(_677){
},onPage:function(_678){
},postCreate:function(){
this.previousButton.innerHTML=this._messages["previousMessage"];
this.nextButton.innerHTML=this._messages["nextMessage"];
this.inherited(arguments);
},onClose:function(){
this._blurOptionNode();
},_createOption:function(item,_67a){
var _67b=_67a(item);
var _67c=dojo.doc.createElement("li");
dijit.setWaiRole(_67c,"option");
if(_67b.html){
_67c.innerHTML=_67b.label;
}else{
_67c.appendChild(dojo.doc.createTextNode(_67b.label));
}
if(_67c.innerHTML==""){
_67c.innerHTML="&nbsp;";
}
_67c.item=item;
return _67c;
},createOptions:function(_67d,_67e,_67f){
this.previousButton.style.display=(_67e.start==0)?"none":"";
dojo.attr(this.previousButton,"id",this.id+"_prev");
dojo.forEach(_67d,function(item,i){
var _682=this._createOption(item,_67f);
_682.className="dijitReset dijitMenuItem";
dojo.attr(_682,"id",this.id+i);
this.domNode.insertBefore(_682,this.nextButton);
},this);
var _683=false;
if(_67e._maxOptions&&_67e._maxOptions!=-1){
if((_67e.start+_67e.count)<_67e._maxOptions){
_683=true;
}else{
if((_67e.start+_67e.count)>(_67e._maxOptions-1)){
if(_67e.count==_67d.length){
_683=true;
}
}
}
}else{
if(_67e.count==_67d.length){
_683=true;
}
}
this.nextButton.style.display=_683?"":"none";
dojo.attr(this.nextButton,"id",this.id+"_next");
},clearResultList:function(){
while(this.domNode.childNodes.length>2){
this.domNode.removeChild(this.domNode.childNodes[this.domNode.childNodes.length-2]);
}
},getItems:function(){
return this.domNode.childNodes;
},getListLength:function(){
return this.domNode.childNodes.length-2;
},_onMouseDown:function(evt){
dojo.stopEvent(evt);
},_onMouseUp:function(evt){
if(evt.target===this.domNode){
return;
}else{
if(evt.target==this.previousButton){
this.onPage(-1);
}else{
if(evt.target==this.nextButton){
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
dojo.addClass(this._highlighted_option,"dijitMenuItemHover");
}
},_blurOptionNode:function(){
if(this._highlighted_option){
dojo.removeClass(this._highlighted_option,"dijitMenuItemHover");
this._highlighted_option=null;
}
},_highlightNextOption:function(){
var fc=this.domNode.firstChild;
if(!this.getHighlightedOption()){
this._focusOptionNode(fc.style.display=="none"?fc.nextSibling:fc);
}else{
var ns=this._highlighted_option.nextSibling;
if(ns&&ns.style.display!="none"){
this._focusOptionNode(ns);
}
}
dijit.scrollIntoView(this._highlighted_option);
},highlightFirstOption:function(){
this._focusOptionNode(this.domNode.firstChild.nextSibling);
dijit.scrollIntoView(this._highlighted_option);
},highlightLastOption:function(){
this._focusOptionNode(this.domNode.lastChild.previousSibling);
dijit.scrollIntoView(this._highlighted_option);
},_highlightPrevOption:function(){
var lc=this.domNode.lastChild;
if(!this.getHighlightedOption()){
this._focusOptionNode(lc.style.display=="none"?lc.previousSibling:lc);
}else{
var ps=this._highlighted_option.previousSibling;
if(ps&&ps.style.display!="none"){
this._focusOptionNode(ps);
}
}
dijit.scrollIntoView(this._highlighted_option);
},_page:function(up){
var _690=0;
var _691=this.domNode.scrollTop;
var _692=dojo.style(this.domNode,"height");
if(!this.getHighlightedOption()){
this._highlightNextOption();
}
while(_690<_692){
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
var _693=this.domNode.scrollTop;
_690+=(_693-_691)*(up?-1:1);
_691=_693;
}
},pageUp:function(){
this._page(true);
},pageDown:function(){
this._page(false);
},getHighlightedOption:function(){
var ho=this._highlighted_option;
return (ho&&ho.parentNode)?ho:null;
},handleKey:function(key){
switch(key){
case dojo.keys.DOWN_ARROW:
this._highlightNextOption();
break;
case dojo.keys.PAGE_DOWN:
this.pageDown();
break;
case dojo.keys.UP_ARROW:
this._highlightPrevOption();
break;
case dojo.keys.PAGE_UP:
this.pageUp();
break;
}
}});
dojo.declare("dijit.form.ComboBox",[dijit.form.ValidationTextBox,dijit.form.ComboBoxMixin],{postMixInProperties:function(){
dijit.form.ComboBoxMixin.prototype.postMixInProperties.apply(this,arguments);
dijit.form.ValidationTextBox.prototype.postMixInProperties.apply(this,arguments);
},postCreate:function(){
dijit.form.ComboBoxMixin.prototype._postCreate.apply(this,arguments);
dijit.form.ValidationTextBox.prototype.postCreate.apply(this,arguments);
},_setDisabledAttr:function(_696){
dijit.form.ValidationTextBox.prototype._setDisabledAttr.apply(this,arguments);
dijit.form.ComboBoxMixin.prototype._setDisabledAttr.apply(this,arguments);
},_setValueAttr:function(_697,_698){
if(!_697){
_697="";
}
dijit.form.ValidationTextBox.prototype._setValueAttr.call(this,_697,_698);
}});
dojo.declare("dijit.form._ComboBoxDataStore",null,{constructor:function(root){
this.root=root;
dojo.query("> option",root).forEach(function(node){
node.innerHTML=dojo.trim(node.innerHTML);
});
},getValue:function(item,_69c,_69d){
return (_69c=="value")?item.value:(item.innerText||item.textContent||"");
},isItemLoaded:function(_69e){
return true;
},getFeatures:function(){
return {"dojo.data.api.Read":true,"dojo.data.api.Identity":true};
},_fetchItems:function(args,_6a0,_6a1){
if(!args.query){
args.query={};
}
if(!args.query.name){
args.query.name="";
}
if(!args.queryOptions){
args.queryOptions={};
}
var _6a2=dojo.data.util.filter.patternToRegExp(args.query.name,args.queryOptions.ignoreCase),_6a3=dojo.query("> option",this.root).filter(function(_6a4){
return (_6a4.innerText||_6a4.textContent||"").match(_6a2);
});
if(args.sort){
_6a3.sort(dojo.data.util.sorter.createSortFunction(args.sort,this));
}
_6a0(_6a3,args);
},close:function(_6a5){
return;
},getLabel:function(item){
return item.innerHTML;
},getIdentity:function(item){
return dojo.attr(item,"value");
},fetchItemByIdentity:function(args){
var item=dojo.query("option[value='"+args.identity+"']",this.root)[0];
args.onItem(item);
},fetchSelectedItem:function(){
var root=this.root,si=root.selectedIndex;
return dojo.query("> option:nth-child("+(si!=-1?si+1:1)+")",root)[0];
}});
dojo.extend(dijit.form._ComboBoxDataStore,dojo.data.util.simpleFetch);
}
if(!dojo._hasResource["dijit.form.FilteringSelect"]){
dojo._hasResource["dijit.form.FilteringSelect"]=true;
dojo.provide("dijit.form.FilteringSelect");
dojo.declare("dijit.form.FilteringSelect",[dijit.form.MappedTextBox,dijit.form.ComboBoxMixin],{_isvalid:true,required:true,_lastDisplayedValue:"",isValid:function(){
return this._isvalid||(!this.required&&this.attr("displayedValue")=="");
},_callbackSetLabel:function(_6ac,_6ad,_6ae){
if((_6ad&&_6ad.query[this.searchAttr]!=this._lastQuery)||(!_6ad&&_6ac.length&&this.store.getIdentity(_6ac[0])!=this._lastQuery)){
return;
}
if(!_6ac.length){
if(_6ae||!this._focused){
this.valueNode.value="";
}
dijit.form.TextBox.superclass._setValueAttr.call(this,"",_6ae||!this._focused);
this._isvalid=false;
this.validate(this._focused);
this.item=null;
}else{
this._setValueFromItem(_6ac[0],_6ae);
}
},_openResultList:function(_6af,_6b0){
if(_6b0.query[this.searchAttr]!=this._lastQuery){
return;
}
this._isvalid=_6af.length!=0;
this.validate(true);
dijit.form.ComboBoxMixin.prototype._openResultList.apply(this,arguments);
},_getValueAttr:function(){
return this.valueNode.value;
},_getValueField:function(){
return "value";
},_setValue:function(_6b1,_6b2,_6b3){
this.valueNode.value=_6b1;
dijit.form.FilteringSelect.superclass._setValueAttr.call(this,_6b1,_6b3,_6b2);
this._lastDisplayedValue=_6b2;
},_setValueAttr:function(_6b4,_6b5){
if(!this._onChangeActive){
_6b5=null;
}
this._lastQuery=_6b4;
if(_6b4===null){
this._setDisplayedValueAttr("",_6b5);
return;
}
var self=this;
var _6b7=function(item,_6b9){
if(item){
if(self.store.isItemLoaded(item)){
self._callbackSetLabel([item],undefined,_6b9);
}else{
self.store.loadItem({item:item,onItem:function(_6ba,_6bb){
self._callbackSetLabel(_6ba,_6bb,_6b9);
}});
}
}else{
self._isvalid=false;
self.validate(false);
}
};
this.store.fetchItemByIdentity({identity:_6b4,onItem:function(item){
_6b7(item,_6b5);
}});
},_setValueFromItem:function(item,_6be){
this._isvalid=true;
this.item=item;
this._setValue(this.store.getIdentity(item),this.labelFunc(item,this.store),_6be);
},labelFunc:function(item,_6c0){
return _6c0.getValue(item,this.searchAttr);
},_doSelect:function(tgt){
this._setValueFromItem(tgt.item,true);
},_setDisplayedValueAttr:function(_6c2,_6c3){
if(!this._created){
_6c3=false;
}
if(this.store){
var _6c4=dojo.clone(this.query);
this._lastQuery=_6c4[this.searchAttr]=_6c2.replace(/([\\\*\?])/g,"\\$1");
this.textbox.value=_6c2;
this._lastDisplayedValue=_6c2;
var _6c5=this;
var _6c6={query:_6c4,queryOptions:{ignoreCase:this.ignoreCase,deep:true},onComplete:function(_6c7,_6c8){
dojo.hitch(_6c5,"_callbackSetLabel")(_6c7,_6c8,_6c3);
},onError:function(_6c9){
console.error("dijit.form.FilteringSelect: "+_6c9);
dojo.hitch(_6c5,"_setValue")("",_6c2,false);
}};
dojo.mixin(_6c6,this.fetchProperties);
this.store.fetch(_6c6);
}
},postMixInProperties:function(){
dijit.form.ComboBoxMixin.prototype.postMixInProperties.apply(this,arguments);
dijit.form.MappedTextBox.prototype.postMixInProperties.apply(this,arguments);
},postCreate:function(){
dijit.form.ComboBoxMixin.prototype._postCreate.apply(this,arguments);
dijit.form.MappedTextBox.prototype.postCreate.apply(this,arguments);
},_setDisabledAttr:function(attr,_6cb){
dijit.form.MappedTextBox.prototype._setDisabledAttr.apply(this,arguments);
dijit.form.ComboBoxMixin.prototype._setDisabledAttr.apply(this,arguments);
},undo:function(){
this.attr("displayedValue",this._lastDisplayedValue);
},_valueChanged:function(){
return this.attr("displayedValue")!=this._lastDisplayedValue;
}});
}
if(!dojo._hasResource["dijit.form.Textarea"]){
dojo._hasResource["dijit.form.Textarea"]=true;
dojo.provide("dijit.form.Textarea");
dojo.declare("dijit.form.Textarea",dijit.form._FormValueWidget,{attributeMap:dojo.mixin(dojo.clone(dijit.form._FormValueWidget.prototype.attributeMap),{style:"styleNode","class":"styleNode"}),templateString:(dojo.isIE||dojo.isSafari||dojo.isFF)?((dojo.isIE||dojo.isSafari||dojo.isFF>=3)?"<fieldset id=\"${id}\" class=\"dijitInline\" dojoAttachPoint=\"styleNode\" waiRole=\"presentation\"><div dojoAttachPoint=\"editNode,focusNode,eventNode\" dojoAttachEvent=\"onpaste:_changing,oncut:_changing\" waiRole=\"textbox\" waiState=\"multiline-true\" contentEditable=\"true\"></div>":"<span id=\"${id}\" class=\"dijitReset\">"+"<iframe src=\"javascript:<html><head><title>${_iframeEditTitle}</title></head><body><script>var _postCreate=window.frameElement?window.frameElement.postCreate:null;if(_postCreate)_postCreate();</script></body></html>\""+" dojoAttachPoint=\"iframe,styleNode,stateNode\" dojoAttachEvent=\"onblur:_onIframeBlur\" class=\"dijitInline dijitInputField\"></iframe>")+"<textarea name=\"${name}\" value=\"${value}\" dojoAttachPoint=\"formValueNode\" style=\"display:none;\" autocomplete=\"off\"></textarea>"+((dojo.isIE||dojo.isSafari||dojo.isFF>=3)?"</fieldset>":"</span>"):"<textarea id=\"${id}\" name=\"${name}\" value=\"${value}\" dojoAttachPoint=\"formValueNode,editNode,focusNode,styleNode\">"+dojo.isFF+"</textarea>",baseClass:"dijitTextArea",_setDisabledAttr:function(_6cc){
this.inherited(arguments);
this.formValueNode.disabled=this.disabled;
this._adjustWritable();
},_setReadOnlyAttr:function(_6cd){
this.readOnly=_6cd;
this._adjustWritable();
},_adjustWritable:function(){
if(dojo.isIE||dojo.isSafari||dojo.isFF>=3){
this.editNode.contentEditable=(!this.disabled&&!this.readOnly);
}else{
if(dojo.isFF){
this.iframe.contentDocument.designMode=(this.disabled||this.readOnly)?"off":"on";
}
}
},focus:function(){
if(!this.disabled&&!this.readOnly){
this._changing();
}
dijit.focus(this.iframe||this.focusNode);
},_setValueAttr:function(_6ce,_6cf){
var _6d0=this.editNode;
if(typeof _6ce=="string"){
_6d0.innerHTML="";
if(_6ce.split){
var _6d1=this;
var _6d2=true;
dojo.forEach(_6ce.split("\n"),function(line){
if(_6d2){
_6d2=false;
}else{
_6d0.appendChild(dojo.doc.createElement("BR"));
}
if(line){
_6d0.appendChild(dojo.doc.createTextNode(line));
}
});
}else{
if(_6ce){
_6d0.appendChild(dojo.doc.createTextNode(_6ce));
}
}
if(!dojo.isIE){
_6d0.appendChild(dojo.doc.createElement("BR"));
}
}else{
_6ce=_6d0.innerHTML;
if(this.iframe){
_6ce=_6ce.replace(/<div><\/div>\r?\n?$/i,"");
}
_6ce=_6ce.replace(/\s*\r?\n|^\s+|\s+$|&nbsp;/g,"").replace(/>\s+</g,"><").replace(/<\/(p|div)>$|^<(p|div)[^>]*>/gi,"").replace(/([^>])<div>/g,"$1\n").replace(/<\/p>\s*<p[^>]*>|<br[^>]*>|<\/div>\s*<div[^>]*>/gi,"\n").replace(/<[^>]*>/g,"").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">");
if(!dojo.isIE){
_6ce=_6ce.replace(/\n$/,"");
}
}
this.value=this.formValueNode.value=_6ce;
if(this.iframe){
var _6d4=dojo.doc.createElement("div");
_6d0.appendChild(_6d4);
var _6d5=_6d4.offsetTop;
if(_6d0.scrollWidth>_6d0.clientWidth){
_6d5+=16;
}
if(this.lastHeight!=_6d5){
if(_6d5==0){
_6d5=16;
}
dojo.contentBox(this.iframe,{h:_6d5});
this.lastHeight=_6d5;
}
_6d0.removeChild(_6d4);
}
dijit.form.Textarea.superclass._setValueAttr.call(this,this.attr("value"),_6cf);
},_getValueAttr:function(){
return this.value.replace(/\r/g,"");
},postMixInProperties:function(){
this.inherited(arguments);
if(this.srcNodeRef&&this.srcNodeRef.innerHTML!=""){
this.value=this.srcNodeRef.innerHTML;
this.srcNodeRef.innerHTML="";
}
if((!this.value||this.value=="")&&this.srcNodeRef&&this.srcNodeRef.value){
this.value=this.srcNodeRef.value;
}
if(!this.value){
this.value="";
}
this.value=this.value.replace(/\r\n/g,"\n").replace(/&gt;/g,">").replace(/&lt;/g,"<").replace(/&amp;/g,"&");
if(dojo.isFF==2){
var _6d6=dojo.i18n.getLocalization("dijit.form","Textarea");
this._iframeEditTitle=_6d6.iframeEditTitle;
this._iframeFocusTitle=_6d6.iframeFocusTitle;
var _6d7=dojo.query("label[for=\""+this.id+"\"]");
if(_6d7.length){
this._iframeEditTitle=_6d7[0].innerHTML+" "+this._iframeEditTitle;
}
this.focusNode=this.editNode=dojo.doc.createElement("BODY");
}
},postCreate:function(){
var _6d8="";
if(dojo.isIE||dojo.isSafari||dojo.isFF>=3){
this.domNode.style.overflowY="hidden";
}else{
if(dojo.isFF){
var w=this.iframe.contentWindow;
var _6da="";
try{
_6da=this.iframe.contentDocument.title;
}
catch(e){
}
if(!w||!_6da){
this.iframe.postCreate=dojo.hitch(this,this.postCreate);
return;
}
var d=w.document;
d.getElementsByTagName("HTML")[0].replaceChild(this.editNode,d.getElementsByTagName("BODY")[0]);
if(!this.isLeftToRight()){
d.getElementsByTagName("HTML")[0].dir="rtl";
}
this.iframe.style.overflowY="hidden";
this.eventNode=d;
w.addEventListener("resize",dojo.hitch(this,this._changed),false);
dijit.registerWin(w);
_6d8="margin:0px;padding:0px;border:0px;";
}else{
this.focusNode=this.domNode;
}
}
this.style.replace(/(^|;)(line-|font-?)[^;]+/g,function(_6dc){
_6d8+=_6dc.replace(/^;/g,"")+";";
});
dojo.attr(this.focusNode,"style",_6d8);
if(this.eventNode){
this.connect(this.eventNode,"keypress",this._onKeyPress);
this.connect(this.eventNode,"mousemove",this._changed);
this.connect(this.eventNode,"focus",this._focusedEventNode);
this.connect(this.eventNode,"blur",this._blurredEventNode);
}
if(this.editNode){
this.connect(this.editNode,"change",this._changed);
}
this.inherited("postCreate",arguments);
},_focusedEventNode:function(e){
this._focused=true;
this._setStateClass();
this._changed(e);
},_blurredEventNode:function(e){
this._focused=false;
this._setStateClass();
this._changed(e,true);
},_onIframeBlur:function(){
this.iframe.contentDocument.title=this._iframeEditTitle;
},_onKeyPress:function(e){
if(e.charOrCode===dojo.keys.TAB&&!e.shiftKey&&!e.ctrlKey&&!e.altKey&&this.iframe){
this.iframe.contentDocument.title=this._iframeFocusTitle;
this.iframe.focus();
dojo.stopEvent(e);
}else{
if(e.charOrCode==dojo.keys.ENTER){
e.stopPropagation();
}else{
if(this.inherited("_onKeyPress",arguments)&&this.iframe){
var te=dojo.doc.createEvent("KeyEvents");
te.initKeyEvent("keypress",true,true,null,e.ctrlKey,e.altKey,e.shiftKey,e.metaKey,e.keyCode,e.charCode);
this.iframe.dispatchEvent(te);
}
}
}
this._changing();
},_changing:function(e){
setTimeout(dojo.hitch(this,"_changed",e,false),1);
},_changed:function(e,_6e3){
if(this.iframe&&this.iframe.contentDocument.designMode!="on"&&!this.disabled&&!this.readOnly){
this.iframe.contentDocument.designMode="on";
}
this._setValueAttr(null,_6e3||false);
}});
}
if(!dojo._hasResource["dijit.form.Button"]){
dojo._hasResource["dijit.form.Button"]=true;
dojo.provide("dijit.form.Button");
dojo.declare("dijit.form.Button",dijit.form._FormWidget,{label:"",showLabel:true,iconClass:"",type:"button",baseClass:"dijitButton",templateString:"<span class=\"dijit dijitReset dijitLeft dijitInline\"\r\n\tdojoAttachEvent=\"ondijitclick:_onButtonClick,onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\"\r\n\t><span class=\"dijitReset dijitRight dijitInline\"\r\n\t\t><span class=\"dijitReset dijitInline dijitButtonNode\"\r\n\t\t\t><button class=\"dijitReset dijitStretch dijitButtonContents\"\r\n\t\t\t\tdojoAttachPoint=\"titleNode,focusNode\" \r\n\t\t\t\tname=\"${name}\" type=\"${type}\" waiRole=\"button\" waiState=\"labelledby-${id}_label\"\r\n\t\t\t\t><span class=\"dijitReset dijitInline\" dojoAttachPoint=\"iconNode\" \r\n\t\t\t\t\t><span class=\"dijitReset dijitToggleButtonIconChar\">&#10003;</span \r\n\t\t\t\t></span \r\n\t\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\" \r\n\t\t\t\t\tid=\"${id}_label\"  \r\n\t\t\t\t\tdojoAttachPoint=\"containerNode\"\r\n\t\t\t\t></span\r\n\t\t\t></button\r\n\t\t></span\r\n\t></span\r\n></span>\r\n",attributeMap:dojo.mixin(dojo.clone(dijit.form._FormWidget.prototype.attributeMap),{label:{node:"containerNode",type:"innerHTML"},iconClass:{node:"iconNode",type:"class"}}),_onClick:function(e){
if(this.disabled||this.readOnly){
return false;
}
this._clicked();
return this.onClick(e);
},_onButtonClick:function(e){
if(e.type!="click"){
dojo.stopEvent(e);
}
if(this._onClick(e)===false){
e.preventDefault();
}else{
if(this.type=="submit"&&!this.focusNode.form){
for(var node=this.domNode;node.parentNode;node=node.parentNode){
var _6e7=dijit.byNode(node);
if(_6e7&&typeof _6e7._onSubmit=="function"){
_6e7._onSubmit(e);
break;
}
}
}
}
},_fillContent:function(_6e8){
if(_6e8&&!("label" in this.params)){
this.attr("label",_6e8.innerHTML);
}
},postCreate:function(){
if(this.showLabel==false){
dojo.addClass(this.containerNode,"dijitDisplayNone");
}
dojo.setSelectable(this.focusNode,false);
this.inherited(arguments);
},onClick:function(e){
return true;
},_clicked:function(e){
},setLabel:function(_6eb){
dojo.deprecated("dijit.form.Button.setLabel() is deprecated.  Use attr('label', ...) instead.","","2.0");
this.attr("label",_6eb);
},_setLabelAttr:function(_6ec){
this.containerNode.innerHTML=this.label=_6ec;
this._layoutHack();
if(this.showLabel==false&&!this.params.title){
this.titleNode.title=dojo.trim(this.containerNode.innerText||this.containerNode.textContent||"");
}
}});
dojo.declare("dijit.form.DropDownButton",[dijit.form.Button,dijit._Container],{baseClass:"dijitDropDownButton",templateString:"<span class=\"dijit dijitReset dijitLeft dijitInline\"\r\n\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse,onclick:_onDropDownClick,onkeydown:_onDropDownKeydown,onblur:_onDropDownBlur,onkeypress:_onKey\"\r\n\t><span class='dijitReset dijitRight dijitInline'\r\n\t\t><span class='dijitReset dijitInline dijitButtonNode'\r\n\t\t\t><button class=\"dijitReset dijitStretch dijitButtonContents\" \r\n\t\t\t\ttype=\"${type}\" name=\"${name}\"\r\n\t\t\t\tdojoAttachPoint=\"focusNode,titleNode\" \r\n\t\t\t\twaiRole=\"button\" waiState=\"haspopup-true,labelledby-${id}_label\"\r\n\t\t\t\t><span class=\"dijitReset dijitInline\" \r\n\t\t\t\t\tdojoAttachPoint=\"iconNode\"\r\n\t\t\t\t></span\r\n\t\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\"  \r\n\t\t\t\t\tdojoAttachPoint=\"containerNode,popupStateNode\" \r\n\t\t\t\t\tid=\"${id}_label\"\r\n\t\t\t\t></span\r\n\t\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonInner\">&thinsp;</span\r\n\t\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonChar\">&#9660;</span\r\n\t\t\t></button\r\n\t\t></span\r\n\t></span\r\n></span>\r\n",_fillContent:function(){
if(this.srcNodeRef){
var _6ed=dojo.query("*",this.srcNodeRef);
dijit.form.DropDownButton.superclass._fillContent.call(this,_6ed[0]);
this.dropDownContainer=this.srcNodeRef;
}
},startup:function(){
if(this._started){
return;
}
if(!this.dropDown){
var _6ee=dojo.query("[widgetId]",this.dropDownContainer)[0];
this.dropDown=dijit.byNode(_6ee);
delete this.dropDownContainer;
}
dijit.popup.prepare(this.dropDown.domNode);
this.inherited(arguments);
},destroyDescendants:function(){
if(this.dropDown){
this.dropDown.destroyRecursive();
delete this.dropDown;
}
this.inherited(arguments);
},_onArrowClick:function(e){
if(this.disabled||this.readOnly){
return;
}
this._toggleDropDown();
},_onDropDownClick:function(e){
var _6f1=dojo.isFF&&dojo.isFF<3&&navigator.appVersion.indexOf("Macintosh")!=-1;
if(!_6f1||e.detail!=0||this._seenKeydown){
this._onArrowClick(e);
}
this._seenKeydown=false;
},_onDropDownKeydown:function(e){
this._seenKeydown=true;
},_onDropDownBlur:function(e){
this._seenKeydown=false;
},_onKey:function(e){
if(this.disabled||this.readOnly){
return;
}
if(e.charOrCode==dojo.keys.DOWN_ARROW){
if(!this.dropDown||this.dropDown.domNode.style.visibility=="hidden"){
dojo.stopEvent(e);
this._toggleDropDown();
}
}
},_onBlur:function(){
this._closeDropDown();
this.inherited(arguments);
},_toggleDropDown:function(){
if(this.disabled||this.readOnly){
return;
}
dijit.focus(this.popupStateNode);
var _6f5=this.dropDown;
if(!_6f5){
return;
}
if(!this._opened){
if(_6f5.href&&!_6f5.isLoaded){
var self=this;
var _6f7=dojo.connect(_6f5,"onLoad",function(){
dojo.disconnect(_6f7);
self._openDropDown();
});
_6f5._loadCheck(true);
return;
}else{
this._openDropDown();
}
}else{
this._closeDropDown();
}
},_openDropDown:function(){
var _6f8=this.dropDown;
var _6f9=_6f8.domNode.style.width;
var self=this;
dijit.popup.open({parent:this,popup:_6f8,around:this.domNode,orient:this.isLeftToRight()?{"BL":"TL","BR":"TR","TL":"BL","TR":"BR"}:{"BR":"TR","BL":"TL","TR":"BR","TL":"BL"},onExecute:function(){
self._closeDropDown(true);
},onCancel:function(){
self._closeDropDown(true);
},onClose:function(){
_6f8.domNode.style.width=_6f9;
self.popupStateNode.removeAttribute("popupActive");
self._opened=false;
}});
if(this.domNode.offsetWidth>_6f8.domNode.offsetWidth){
var _6fb=null;
if(!this.isLeftToRight()){
_6fb=_6f8.domNode.parentNode;
var _6fc=_6fb.offsetLeft+_6fb.offsetWidth;
}
dojo.marginBox(_6f8.domNode,{w:this.domNode.offsetWidth});
if(_6fb){
_6fb.style.left=_6fc-this.domNode.offsetWidth+"px";
}
}
this.popupStateNode.setAttribute("popupActive","true");
this._opened=true;
if(_6f8.focus){
_6f8.focus();
}
},_closeDropDown:function(_6fd){
if(this._opened){
dijit.popup.close(this.dropDown);
if(_6fd){
this.focus();
}
this._opened=false;
}
}});
dojo.declare("dijit.form.ComboButton",dijit.form.DropDownButton,{templateString:"<table class='dijit dijitReset dijitInline dijitLeft'\r\n\tcellspacing='0' cellpadding='0' waiRole=\"presentation\"\r\n\t><tbody waiRole=\"presentation\"><tr waiRole=\"presentation\"\r\n\t\t><td class=\"dijitReset dijitStretch dijitButtonContents dijitButtonNode\"\r\n\t\t\tdojoAttachEvent=\"ondijitclick:_onButtonClick,onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\"  dojoAttachPoint=\"titleNode\"\r\n\t\t\twaiRole=\"button\" waiState=\"labelledby-${id}_label\"\r\n\t\t\t><div class=\"dijitReset dijitInline\" dojoAttachPoint=\"iconNode\" waiRole=\"presentation\"></div\r\n\t\t\t><div class=\"dijitReset dijitInline dijitButtonText\" id=\"${id}_label\" dojoAttachPoint=\"containerNode\" waiRole=\"presentation\"></div\r\n\t\t></td\r\n\t\t><td class='dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton'\r\n\t\t\tdojoAttachPoint=\"popupStateNode,focusNode\"\r\n\t\t\tdojoAttachEvent=\"ondijitclick:_onArrowClick, onkeypress:_onKey,onmouseenter:_onMouse,onmouseleave:_onMouse\"\r\n\t\t\tstateModifier=\"DownArrow\"\r\n\t\t\ttitle=\"${optionsTitle}\" name=\"${name}\"\r\n\t\t\twaiRole=\"button\" waiState=\"haspopup-true\"\r\n\t\t\t><div class=\"dijitReset dijitArrowButtonInner\" waiRole=\"presentation\">&thinsp;</div\r\n\t\t\t><div class=\"dijitReset dijitArrowButtonChar\" waiRole=\"presentation\">&#9660;</div\r\n\t\t></td\r\n\t></tr></tbody\r\n></table>\r\n",attributeMap:dojo.mixin(dojo.clone(dijit.form.Button.prototype.attributeMap),{id:"",name:"",tabIndex:["focusNode","titleNode"]}),optionsTitle:"",baseClass:"dijitComboButton",_focusedNode:null,postCreate:function(){
this.inherited(arguments);
this._focalNodes=[this.titleNode,this.popupStateNode];
dojo.forEach(this._focalNodes,dojo.hitch(this,function(node){
if(dojo.isIE){
this.connect(node,"onactivate",this._onNodeFocus);
this.connect(node,"ondeactivate",this._onNodeBlur);
}else{
this.connect(node,"onfocus",this._onNodeFocus);
this.connect(node,"onblur",this._onNodeBlur);
}
}));
},focusFocalNode:function(node){
this._focusedNode=node;
dijit.focus(node);
},hasNextFocalNode:function(){
return this._focusedNode!==this.getFocalNodes()[1];
},focusNext:function(){
this._focusedNode=this.getFocalNodes()[this._focusedNode?1:0];
dijit.focus(this._focusedNode);
},hasPrevFocalNode:function(){
return this._focusedNode!==this.getFocalNodes()[0];
},focusPrev:function(){
this._focusedNode=this.getFocalNodes()[this._focusedNode?0:1];
dijit.focus(this._focusedNode);
},getFocalNodes:function(){
return this._focalNodes;
},_onNodeFocus:function(evt){
this._focusedNode=evt.currentTarget;
var fnc=this._focusedNode==this.focusNode?"dijitDownArrowButtonFocused":"dijitButtonContentsFocused";
dojo.addClass(this._focusedNode,fnc);
},_onNodeBlur:function(evt){
var fnc=evt.currentTarget==this.focusNode?"dijitDownArrowButtonFocused":"dijitButtonContentsFocused";
dojo.removeClass(evt.currentTarget,fnc);
},_onBlur:function(){
this.inherited(arguments);
this._focusedNode=null;
}});
dojo.declare("dijit.form.ToggleButton",dijit.form.Button,{baseClass:"dijitToggleButton",checked:false,attributeMap:dojo.mixin(dojo.clone(dijit.form.Button.prototype.attributeMap),{checked:"focusNode"}),_clicked:function(evt){
this.attr("checked",!this.checked);
},_setCheckedAttr:function(_705){
this.checked=_705;
dojo.attr(this.focusNode||this.domNode,"checked",_705);
dijit.setWaiState(this.focusNode||this.domNode,"pressed",_705);
this._setStateClass();
this._handleOnChange(_705,true);
},setChecked:function(_706){
dojo.deprecated("setChecked("+_706+") is deprecated. Use attr('checked',"+_706+") instead.","","2.0");
this.attr("checked",_706);
},reset:function(){
this._hasBeenBlurred=false;
this.attr("checked",this.params.checked||false);
}});
}
if(!dojo._hasResource["dijit.form.CheckBox"]){
dojo._hasResource["dijit.form.CheckBox"]=true;
dojo.provide("dijit.form.CheckBox");
dojo.declare("dijit.form.CheckBox",dijit.form.ToggleButton,{templateString:"<div class=\"dijitReset dijitInline\" waiRole=\"presentation\"\r\n\t><input\r\n\t \ttype=\"${type}\" name=\"${name}\"\r\n\t\tclass=\"dijitReset dijitCheckBoxInput\"\r\n\t\tdojoAttachPoint=\"focusNode\"\r\n\t \tdojoAttachEvent=\"onmouseover:_onMouse,onmouseout:_onMouse,onclick:_onClick\"\r\n/></div>\r\n",baseClass:"dijitCheckBox",type:"checkbox",value:"on",_setValueAttr:function(_707){
if(typeof _707=="string"){
this.value=_707;
dojo.attr(this.focusNode,"value",_707);
_707=true;
}
if(this._created){
this.attr("checked",_707);
}
},_getValueAttr:function(){
return (this.checked?this.value:false);
},postMixInProperties:function(){
if(this.value==""){
this.value="on";
}
this.inherited(arguments);
},_fillContent:function(_708){
},reset:function(){
this._hasBeenBlurred=false;
this.attr("checked",this.params.checked||false);
this.value=this.params.value||"on";
dojo.attr(this.focusNode,"value",this.value);
},_onFocus:function(){
if(this.id){
dojo.query("label[for='"+this.id+"']").addClass("dijitFocusedLabel");
}
},_onBlur:function(){
if(this.id){
dojo.query("label[for='"+this.id+"']").removeClass("dijitFocusedLabel");
}
}});
dojo.declare("dijit.form.RadioButton",dijit.form.CheckBox,{type:"radio",baseClass:"dijitRadio",_setCheckedAttr:function(_709){
this.inherited(arguments);
if(!this._created){
return;
}
if(_709){
var _70a=this;
dojo.query("INPUT[type=radio][name="+this.name+"]",this.focusNode.form||dojo.doc).forEach(function(_70b){
if(_70b!=_70a.focusNode&&_70b.form==_70a.focusNode.form){
var _70c=dijit.getEnclosingWidget(_70b);
if(_70c&&_70c.checked){
_70c.attr("checked",false);
}
}
});
}
},_clicked:function(e){
if(!this.checked){
this.attr("checked",true);
}
}});
}
if(!dojo._hasResource["dojo.regexp"]){
dojo._hasResource["dojo.regexp"]=true;
dojo.provide("dojo.regexp");
dojo.regexp.escapeString=function(str,_70f){
return str.replace(/([\.$?*!=:|{}\(\)\[\]\\\/^])/g,function(ch){
if(_70f&&_70f.indexOf(ch)!=-1){
return ch;
}
return "\\"+ch;
});
};
dojo.regexp.buildGroupRE=function(arr,re,_713){
if(!(arr instanceof Array)){
return re(arr);
}
var b=[];
for(var i=0;i<arr.length;i++){
b.push(re(arr[i]));
}
return dojo.regexp.group(b.join("|"),_713);
};
dojo.regexp.group=function(_716,_717){
return "("+(_717?"?:":"")+_716+")";
};
}
if(!dojo._hasResource["dojo.cookie"]){
dojo._hasResource["dojo.cookie"]=true;
dojo.provide("dojo.cookie");
dojo.cookie=function(name,_719,_71a){
var c=document.cookie;
if(arguments.length==1){
var _71c=c.match(new RegExp("(?:^|; )"+dojo.regexp.escapeString(name)+"=([^;]*)"));
return _71c?decodeURIComponent(_71c[1]):undefined;
}else{
_71a=_71a||{};
var exp=_71a.expires;
if(typeof exp=="number"){
var d=new Date();
d.setTime(d.getTime()+exp*24*60*60*1000);
exp=_71a.expires=d;
}
if(exp&&exp.toUTCString){
_71a.expires=exp.toUTCString();
}
_719=encodeURIComponent(_719);
var _71f=name+"="+_719,_720;
for(_720 in _71a){
_71f+="; "+_720;
var _721=_71a[_720];
if(_721!==true){
_71f+="="+_721;
}
}
document.cookie=_71f;
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
},postCreate:function(){
this.inherited(arguments);
this._splitters={};
this._splitterThickness={};
},startup:function(){
if(this._started){
return;
}
dojo.forEach(this.getChildren(),this._setupChild,this);
this.inherited(arguments);
},_setupChild:function(_722){
var _723=_722.region;
if(_723){
this.inherited(arguments);
dojo.addClass(_722.domNode,this.baseClass+"Pane");
var ltr=this.isLeftToRight();
if(_723=="leading"){
_723=ltr?"left":"right";
}
if(_723=="trailing"){
_723=ltr?"right":"left";
}
this["_"+_723]=_722.domNode;
this["_"+_723+"Widget"]=_722;
if((_722.splitter||this.gutters)&&!this._splitters[_723]){
var _725=dojo.getObject(_722.splitter?this._splitterClass:"dijit.layout._Gutter");
var flip={left:"right",right:"left",top:"bottom",bottom:"top",leading:"trailing",trailing:"leading"};
var _727=new _725({container:this,child:_722,region:_723,oppNode:dojo.query("[region="+flip[_722.region]+"]",this.domNode)[0],live:this.liveSplitters});
_727.isSplitter=true;
this._splitters[_723]=_727.domNode;
dojo.place(this._splitters[_723],_722.domNode,"after");
_727.startup();
}
_722.region=_723;
}
},_computeSplitterThickness:function(_728){
this._splitterThickness[_728]=this._splitterThickness[_728]||dojo.marginBox(this._splitters[_728])[(/top|bottom/.test(_728)?"h":"w")];
},layout:function(){
for(var _729 in this._splitters){
this._computeSplitterThickness(_729);
}
this._layoutChildren();
},addChild:function(_72a,_72b){
this.inherited(arguments);
if(this._started){
this._layoutChildren();
}
},removeChild:function(_72c){
var _72d=_72c.region;
var _72e=this._splitters[_72d];
if(_72e){
dijit.byNode(_72e).destroy();
delete this._splitters[_72d];
delete this._splitterThickness[_72d];
}
this.inherited(arguments);
delete this["_"+_72d];
delete this["_"+_72d+"Widget"];
if(this._started){
this._layoutChildren(_72c.region);
}
dojo.removeClass(_72c.domNode,this.baseClass+"Pane");
},getChildren:function(){
return dojo.filter(this.inherited(arguments),function(_72f){
return !_72f.isSplitter;
});
},getSplitter:function(_730){
var _731=this._splitters[_730];
return _731?dijit.byNode(_731):null;
},resize:function(_732,_733){
if(!this.cs||!this.pe){
var node=this.domNode;
this.cs=dojo.getComputedStyle(node);
this.pe=dojo._getPadExtents(node,this.cs);
this.pe.r=dojo._toPixelValue(node,this.cs.paddingRight);
this.pe.b=dojo._toPixelValue(node,this.cs.paddingBottom);
dojo.style(node,"padding","0px");
}
this.inherited(arguments);
},_layoutChildren:function(_735){
var _736=(this.design=="sidebar");
var _737=0,_738=0,_739=0,_73a=0;
var _73b={},_73c={},_73d={},_73e={},_73f=(this._center&&this._center.style)||{};
var _740=/left|right/.test(_735);
var _741=!_735||(!_740&&!_736);
var _742=!_735||(_740&&_736);
if(this._top){
_73b=_742&&this._top.style;
_737=dojo.marginBox(this._top).h;
}
if(this._left){
_73c=_741&&this._left.style;
_739=dojo.marginBox(this._left).w;
}
if(this._right){
_73d=_741&&this._right.style;
_73a=dojo.marginBox(this._right).w;
}
if(this._bottom){
_73e=_742&&this._bottom.style;
_738=dojo.marginBox(this._bottom).h;
}
var _743=this._splitters;
var _744=_743.top,_745=_743.bottom,_746=_743.left,_747=_743.right;
var _748=this._splitterThickness;
var _749=_748.top||0,_74a=_748.left||0,_74b=_748.right||0,_74c=_748.bottom||0;
if(_74a>50||_74b>50){
setTimeout(dojo.hitch(this,function(){
this._splitterThickness={};
for(var _74d in this._splitters){
this._computeSplitterThickness(_74d);
}
this._layoutChildren();
}),50);
return false;
}
var pe=this.pe;
var _74f={left:(_736?_739+_74a:0)+pe.l+"px",right:(_736?_73a+_74b:0)+pe.r+"px"};
if(_744){
dojo.mixin(_744.style,_74f);
_744.style.top=_737+pe.t+"px";
}
if(_745){
dojo.mixin(_745.style,_74f);
_745.style.bottom=_738+pe.b+"px";
}
_74f={top:(_736?0:_737+_749)+pe.t+"px",bottom:(_736?0:_738+_74c)+pe.b+"px"};
if(_746){
dojo.mixin(_746.style,_74f);
_746.style.left=_739+pe.l+"px";
}
if(_747){
dojo.mixin(_747.style,_74f);
_747.style.right=_73a+pe.r+"px";
}
dojo.mixin(_73f,{top:pe.t+_737+_749+"px",left:pe.l+_739+_74a+"px",right:pe.r+_73a+_74b+"px",bottom:pe.b+_738+_74c+"px"});
var _750={top:_736?pe.t+"px":_73f.top,bottom:_736?pe.b+"px":_73f.bottom};
dojo.mixin(_73c,_750);
dojo.mixin(_73d,_750);
_73c.left=pe.l+"px";
_73d.right=pe.r+"px";
_73b.top=pe.t+"px";
_73e.bottom=pe.b+"px";
if(_736){
_73b.left=_73e.left=_739+_74a+pe.l+"px";
_73b.right=_73e.right=_73a+_74b+pe.r+"px";
}else{
_73b.left=_73e.left=pe.l+"px";
_73b.right=_73e.right=pe.r+"px";
}
var _751=this._borderBox.h-pe.t-pe.b,_752=_751-(_737+_749+_738+_74c),_753=_736?_751:_752;
var _754=this._borderBox.w-pe.l-pe.r,_755=_754-(_739+_74a+_73a+_74b),_756=_736?_755:_754;
var dim={top:{w:_756,h:_737},bottom:{w:_756,h:_738},left:{w:_739,h:_753},right:{w:_73a,h:_753},center:{h:_752,w:_755}};
var _758=dojo.isIE||dojo.some(this.getChildren(),function(_759){
return _759.domNode.tagName=="TEXTAREA"||_759.domNode.tagName=="INPUT";
});
if(_758){
var _75a=function(_75b,_75c,_75d){
if(_75b){
(_75b.resize?_75b.resize(_75c,_75d):dojo.marginBox(_75b.domNode,_75c));
}
};
if(_746){
_746.style.height=_753;
}
if(_747){
_747.style.height=_753;
}
_75a(this._leftWidget,{h:_753},dim.left);
_75a(this._rightWidget,{h:_753},dim.right);
if(_744){
_744.style.width=_756;
}
if(_745){
_745.style.width=_756;
}
_75a(this._topWidget,{w:_756},dim.top);
_75a(this._bottomWidget,{w:_756},dim.bottom);
_75a(this._centerWidget,dim.center);
}else{
var _75e={};
if(_735){
_75e[_735]=_75e.center=true;
if(/top|bottom/.test(_735)&&this.design!="sidebar"){
_75e.left=_75e.right=true;
}else{
if(/left|right/.test(_735)&&this.design=="sidebar"){
_75e.top=_75e.bottom=true;
}
}
}
dojo.forEach(this.getChildren(),function(_75f){
if(_75f.resize&&(!_735||_75f.region in _75e)){
_75f.resize(null,dim[_75f.region]);
}
},this);
}
},destroy:function(){
for(region in this._splitters){
var _760=this._splitters[region];
dijit.byNode(_760).destroy();
dojo._destroyElement(_760);
}
delete this._splitters;
delete this._splitterThickness;
this.inherited(arguments);
}});
dojo.extend(dijit._Widget,{region:"",splitter:false,minSize:0,maxSize:Infinity});
dojo.declare("dijit.layout._Splitter",[dijit._Widget,dijit._Templated],{live:true,templateString:"<div class=\"dijitSplitter\" dojoAttachEvent=\"onkeypress:_onKeyPress,onmousedown:_startDrag\" tabIndex=\"0\" waiRole=\"separator\"><div class=\"dijitSplitterThumb\"></div></div>",postCreate:function(){
this.inherited(arguments);
this.horizontal=/top|bottom/.test(this.region);
dojo.addClass(this.domNode,"dijitSplitter"+(this.horizontal?"H":"V"));
this._factor=/top|left/.test(this.region)?1:-1;
this._minSize=this.child.minSize;
this.child.domNode._recalc=true;
this.connect(this.container,"resize",function(){
this.child.domNode._recalc=true;
});
this._cookieName=this.container.id+"_"+this.region;
if(this.container.persist){
var _761=dojo.cookie(this._cookieName);
if(_761){
this.child.domNode.style[this.horizontal?"height":"width"]=_761;
}
}
},_computeMaxSize:function(){
var dim=this.horizontal?"h":"w",_763=this.container._splitterThickness[this.region];
var _764=dojo.contentBox(this.container.domNode)[dim]-(this.oppNode?dojo.marginBox(this.oppNode)[dim]:0)-20-_763*2;
this._maxSize=Math.min(this.child.maxSize,_764);
},_startDrag:function(e){
if(this.child.domNode._recalc){
this._computeMaxSize();
this.child.domNode._recalc=false;
}
if(!this.cover){
this.cover=dojo.doc.createElement("div");
dojo.addClass(this.cover,"dijitSplitterCover");
dojo.place(this.cover,this.child.domNode,"after");
}else{
this.cover.style.zIndex=1;
}
if(this.fake){
dojo._destroyElement(this.fake);
}
if(!(this._resize=this.live)){
(this.fake=this.domNode.cloneNode(true)).removeAttribute("id");
dojo.addClass(this.domNode,"dijitSplitterShadow");
dojo.place(this.fake,this.domNode,"after");
}
dojo.addClass(this.domNode,"dijitSplitterActive");
var _766=this._factor,max=this._maxSize,min=this._minSize||20,_769=this.horizontal,axis=_769?"pageY":"pageX",_76b=e[axis],_76c=this.domNode.style,dim=_769?"h":"w",_76e=dojo.marginBox(this.child.domNode)[dim],_76f=this.region,_770=parseInt(this.domNode.style[_76f],10),_771=this._resize,mb={},_773=this.child.domNode,_774=dojo.hitch(this.container,this.container._layoutChildren),de=dojo.doc.body;
this._handlers=(this._handlers||[]).concat([dojo.connect(de,"onmousemove",this._drag=function(e,_777){
var _778=e[axis]-_76b,_779=_766*_778+_76e,_77a=Math.max(Math.min(_779,max),min);
if(_771||_777){
mb[dim]=_77a;
dojo.marginBox(_773,mb);
_774(_76f);
}
_76c[_76f]=_766*_778+_770+(_77a-_779)+"px";
}),dojo.connect(de,"onmouseup",this,"_stopDrag")]);
dojo.stopEvent(e);
},_stopDrag:function(e){
try{
if(this.cover){
this.cover.style.zIndex=-1;
}
if(this.fake){
dojo._destroyElement(this.fake);
}
dojo.removeClass(this.domNode,"dijitSplitterActive");
dojo.removeClass(this.domNode,"dijitSplitterShadow");
this._drag(e);
this._drag(e,true);
}
finally{
this._cleanupHandlers();
if(this.oppNode){
this.oppNode._recalc=true;
}
delete this._drag;
}
if(this.container.persist){
dojo.cookie(this._cookieName,this.child.domNode.style[this.horizontal?"height":"width"],{expires:365});
}
},_cleanupHandlers:function(){
dojo.forEach(this._handlers,dojo.disconnect);
delete this._handlers;
},_onKeyPress:function(e){
if(this.child.domNode._recalc){
this._computeMaxSize();
this.child.domNode._recalc=false;
}
this._resize=true;
var _77d=this.horizontal;
var tick=1;
var dk=dojo.keys;
switch(e.charOrCode){
case _77d?dk.UP_ARROW:dk.LEFT_ARROW:
tick*=-1;
case _77d?dk.DOWN_ARROW:dk.RIGHT_ARROW:
break;
default:
return;
}
var _780=dojo.marginBox(this.child.domNode)[_77d?"h":"w"]+this._factor*tick;
var mb={};
mb[this.horizontal?"h":"w"]=Math.max(Math.min(_780,this._maxSize),this._minSize);
dojo.marginBox(this.child.domNode,mb);
if(this.oppNode){
this.oppNode._recalc=true;
}
this.container._layoutChildren(this.region);
dojo.stopEvent(e);
},destroy:function(){
this._cleanupHandlers();
delete this.child;
delete this.container;
delete this.fake;
this.inherited(arguments);
}});
dojo.declare("dijit.layout._Gutter",[dijit._Widget,dijit._Templated],{templateString:"<div class=\"dijitGutter\" waiRole=\"presentation\"></div>",postCreate:function(){
this.horizontal=/top|bottom/.test(this.region);
dojo.addClass(this.domNode,"dijitGutter"+(this.horizontal?"H":"V"));
}});
}
if(!dojo._hasResource["dijit.Menu"]){
dojo._hasResource["dijit.Menu"]=true;
dojo.provide("dijit.Menu");
dojo.declare("dijit.Menu",[dijit._Widget,dijit._Templated,dijit._KeyNavContainer],{constructor:function(){
this._bindings=[];
},templateString:"<table class=\"dijit dijitMenu dijitReset dijitMenuTable\" waiRole=\"menu\" dojoAttachEvent=\"onkeypress:_onKeyPress\">"+"<tbody class=\"dijitReset\" dojoAttachPoint=\"containerNode\"></tbody>"+"</table>",targetNodeIds:[],contextMenuForWindow:false,leftClickToOpen:false,parentMenu:null,popupDelay:500,_contextMenuWithMouse:false,postCreate:function(){
if(this.contextMenuForWindow){
this.bindDomNode(dojo.body());
}else{
dojo.forEach(this.targetNodeIds,this.bindDomNode,this);
}
this.connectKeyNavHandlers([dojo.keys.UP_ARROW],[dojo.keys.DOWN_ARROW]);
},startup:function(){
if(this._started){
return;
}
dojo.forEach(this.getChildren(),function(_782){
_782.startup();
});
this.startupKeyNavChildren();
this.inherited(arguments);
},onExecute:function(){
},onCancel:function(_783){
},_moveToPopup:function(evt){
if(this.focusedChild&&this.focusedChild.popup&&!this.focusedChild.disabled){
this.focusedChild._onClick(evt);
}
},_onKeyPress:function(evt){
if(evt.ctrlKey||evt.altKey){
return;
}
switch(evt.charOrCode){
case dojo.keys.RIGHT_ARROW:
this._moveToPopup(evt);
dojo.stopEvent(evt);
break;
case dojo.keys.LEFT_ARROW:
if(this.parentMenu){
this.onCancel(false);
}else{
dojo.stopEvent(evt);
}
break;
}
},onItemHover:function(item){
this.focusChild(item);
if(this.focusedChild.popup&&!this.focusedChild.disabled&&!this.hover_timer){
this.hover_timer=setTimeout(dojo.hitch(this,"_openPopup"),this.popupDelay);
}
},_onChildBlur:function(item){
dijit.popup.close(item.popup);
item._blur();
this._stopPopupTimer();
},onItemUnhover:function(item){
},_stopPopupTimer:function(){
if(this.hover_timer){
clearTimeout(this.hover_timer);
this.hover_timer=null;
}
},_getTopMenu:function(){
for(var top=this;top.parentMenu;top=top.parentMenu){
}
return top;
},onItemClick:function(item,evt){
if(item.disabled){
return false;
}
if(item.popup){
if(!this.is_open){
this._openPopup();
}
}else{
this.onExecute();
item.onClick(evt);
}
},_iframeContentWindow:function(_78c){
var win=dijit.getDocumentWindow(dijit.Menu._iframeContentDocument(_78c))||dijit.Menu._iframeContentDocument(_78c)["__parent__"]||(_78c.name&&dojo.doc.frames[_78c.name])||null;
return win;
},_iframeContentDocument:function(_78e){
var doc=_78e.contentDocument||(_78e.contentWindow&&_78e.contentWindow.document)||(_78e.name&&dojo.doc.frames[_78e.name]&&dojo.doc.frames[_78e.name].document)||null;
return doc;
},bindDomNode:function(node){
node=dojo.byId(node);
var win=dijit.getDocumentWindow(node.ownerDocument);
if(node.tagName.toLowerCase()=="iframe"){
win=this._iframeContentWindow(node);
node=dojo.withGlobal(win,dojo.body);
}
var cn=(node==dojo.body()?dojo.doc:node);
node[this.id]=this._bindings.push([dojo.connect(cn,(this.leftClickToOpen)?"onclick":"oncontextmenu",this,"_openMyself"),dojo.connect(cn,"onkeydown",this,"_contextKey"),dojo.connect(cn,"onmousedown",this,"_contextMouse")]);
},unBindDomNode:function(_793){
var node=dojo.byId(_793);
if(node){
var bid=node[this.id]-1,b=this._bindings[bid];
dojo.forEach(b,dojo.disconnect);
delete this._bindings[bid];
}
},_contextKey:function(e){
this._contextMenuWithMouse=false;
if(e.keyCode==dojo.keys.F10){
dojo.stopEvent(e);
if(e.shiftKey&&e.type=="keydown"){
var _e={target:e.target,pageX:e.pageX,pageY:e.pageY};
_e.preventDefault=_e.stopPropagation=function(){
};
window.setTimeout(dojo.hitch(this,function(){
this._openMyself(_e);
}),1);
}
}
},_contextMouse:function(e){
this._contextMenuWithMouse=true;
},_openMyself:function(e){
if(this.leftClickToOpen&&e.button>0){
return;
}
dojo.stopEvent(e);
var x,y;
if(dojo.isSafari||this._contextMenuWithMouse){
x=e.pageX;
y=e.pageY;
}else{
var _79d=dojo.coords(e.target,true);
x=_79d.x+10;
y=_79d.y+10;
}
var self=this;
var _79f=dijit.getFocus(this);
function closeAndRestoreFocus(){
dijit.focus(_79f);
dijit.popup.close(self);
};
dijit.popup.open({popup:this,x:x,y:y,onExecute:closeAndRestoreFocus,onCancel:closeAndRestoreFocus,orient:this.isLeftToRight()?"L":"R"});
this.focus();
this._onBlur=function(){
this.inherited("_onBlur",arguments);
dijit.popup.close(this);
};
},onOpen:function(e){
this.isShowingNow=true;
},onClose:function(){
this._stopPopupTimer();
this.parentMenu=null;
this.isShowingNow=false;
this.currentPopup=null;
if(this.focusedChild){
this._onChildBlur(this.focusedChild);
this.focusedChild=null;
}
},_openPopup:function(){
this._stopPopupTimer();
var _7a1=this.focusedChild;
var _7a2=_7a1.popup;
if(_7a2.isShowingNow){
return;
}
_7a2.parentMenu=this;
var self=this;
dijit.popup.open({parent:this,popup:_7a2,around:_7a1.domNode,orient:this.isLeftToRight()?{"TR":"TL","TL":"TR"}:{"TL":"TR","TR":"TL"},onCancel:function(){
dijit.popup.close(_7a2);
_7a1.focus();
self.currentPopup=null;
}});
this.currentPopup=_7a2;
if(_7a2.focus){
_7a2.focus();
}
},uninitialize:function(){
dojo.forEach(this.targetNodeIds,this.unBindDomNode,this);
this.inherited(arguments);
}});
dojo.declare("dijit.MenuItem",[dijit._Widget,dijit._Templated,dijit._Contained],{templateString:"<tr class=\"dijitReset dijitMenuItem\" dojoAttachPoint=\"focusNode\" waiRole=\"menuitem\" tabIndex=\"-1\""+"dojoAttachEvent=\"onmouseenter:_onHover,onmouseleave:_onUnhover,ondijitclick:_onClick\">"+"<td class=\"dijitReset\" waiRole=\"presentation\"><div class=\"dijitMenuItemIcon\" dojoAttachPoint=\"iconNode\"></div></td>"+"<td class=\"dijitReset dijitMenuItemLabel\" dojoAttachPoint=\"containerNode\"></td>"+"<td class=\"dijitReset dijitMenuArrowCell\" waiRole=\"presentation\">"+"<div dojoAttachPoint=\"arrowWrapper\" style=\"display: none\">"+"<div class=\"dijitMenuExpand\"></div>"+"<span class=\"dijitMenuExpandA11y\">+</span>"+"</div>"+"</td>"+"</tr>",attributeMap:dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap),{label:{node:"containerNode",type:"innerHTML"},iconClass:{node:"iconNode",type:"class"}}),label:"",iconClass:"",disabled:false,_fillContent:function(_7a4){
if(_7a4&&!("label" in this.params)){
this.attr("label",_7a4.innerHTML);
}
},postCreate:function(){
dojo.setSelectable(this.domNode,false);
dojo.attr(this.containerNode,"id",this.id+"_text");
dijit.setWaiState(this.domNode,"labelledby",this.id+"_text");
},_onHover:function(){
this.getParent().onItemHover(this);
},_onUnhover:function(){
this.getParent().onItemUnhover(this);
},_onClick:function(evt){
this.getParent().onItemClick(this,evt);
dojo.stopEvent(evt);
},onClick:function(evt){
},focus:function(){
dojo.addClass(this.domNode,"dijitMenuItemHover");
try{
dijit.focus(this.focusNode);
}
catch(e){
}
},_blur:function(){
dojo.removeClass(this.domNode,"dijitMenuItemHover");
},setLabel:function(_7a7){
dojo.deprecated("dijit.MenuItem.setLabel() is deprecated.  Use attr('label', ...) instead.","","2.0");
this.attr("label",_7a7);
},setDisabled:function(_7a8){
dojo.deprecated("dijit.Menu.setDisabled() is deprecated.  Use attr('disabled', bool) instead.","","2.0");
this.attr("disabled",_7a8);
},_setDisabledAttr:function(_7a9){
this.disabled=_7a9;
dojo[_7a9?"addClass":"removeClass"](this.domNode,"dijitMenuItemDisabled");
dijit.setWaiState(this.focusNode,"disabled",_7a9?"true":"false");
}});
dojo.declare("dijit.PopupMenuItem",dijit.MenuItem,{_fillContent:function(){
if(this.srcNodeRef){
var _7aa=dojo.query("*",this.srcNodeRef);
dijit.PopupMenuItem.superclass._fillContent.call(this,_7aa[0]);
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
this.popup.domNode.style.display="none";
dojo.style(this.arrowWrapper,"display","");
dijit.setWaiState(this.focusNode,"haspopup","true");
},destroyDescendants:function(){
if(this.popup){
this.popup.destroyRecursive();
delete this.popup;
}
this.inherited(arguments);
}});
dojo.declare("dijit.MenuSeparator",[dijit._Widget,dijit._Templated,dijit._Contained],{templateString:"<tr class=\"dijitMenuSeparator\"><td colspan=3>"+"<div class=\"dijitMenuSeparatorTop\"></div>"+"<div class=\"dijitMenuSeparatorBottom\"></div>"+"</td></tr>",postCreate:function(){
dojo.setSelectable(this.domNode,false);
},isFocusable:function(){
return false;
}});
dojo.declare("dijit.CheckedMenuItem",dijit.MenuItem,{templateString:"<tr class=\"dijitReset dijitMenuItem\" dojoAttachPoint=\"focusNode\" waiRole=\"menuitemcheckbox\" tabIndex=\"-1\""+"dojoAttachEvent=\"onmouseenter:_onHover,onmouseleave:_onUnhover,ondijitclick:_onClick\">"+"<td class=\"dijitReset\" waiRole=\"presentation\"><div class=\"dijitMenuItemIcon dijitCheckedMenuItemIcon\" dojoAttachPoint=\"iconNode\">"+"<div class=\"dijitCheckedMenuItemIconChar\">&#10003;</div>"+"</div></td>"+"<td class=\"dijitReset dijitMenuItemLabel\" dojoAttachPoint=\"containerNode,labelNode\"></td>"+"<td class=\"dijitReset dijitMenuArrowCell\" waiRole=\"presentation\">"+"<div dojoAttachPoint=\"arrowWrapper\" style=\"display: none\">"+"<div class=\"dijitMenuExpand\"></div>"+"<span class=\"dijitMenuExpandA11y\">+</span>"+"</div>"+"</td>"+"</tr>",checked:false,_setCheckedAttr:function(_7ac){
dojo.toggleClass(this.iconNode,"dijitCheckedMenuItemIconChecked",_7ac);
dijit.setWaiState(this.domNode,"checked",_7ac);
this.checked=_7ac;
},onChange:function(_7ad){
},_onClick:function(e){
if(!this.disabled){
this.attr("checked",!this.checked);
this.onChange(this.checked);
}
this.inherited(arguments);
}});
}
if(!dojo._hasResource["dijit.layout.StackContainer"]){
dojo._hasResource["dijit.layout.StackContainer"]=true;
dojo.provide("dijit.layout.StackContainer");
dojo.declare("dijit.layout.StackContainer",dijit.layout._LayoutWidget,{doLayout:true,baseClass:"dijitStackContainer",_started:false,postCreate:function(){
this.inherited(arguments);
dijit.setWaiRole(this.containerNode,"tabpanel");
this.connect(this.domNode,"onkeypress",this._onKeyPress);
},startup:function(){
if(this._started){
return;
}
var _7af=this.getChildren();
dojo.forEach(_7af,this._setupChild,this);
dojo.some(_7af,function(_7b0){
if(_7b0.selected){
this.selectedChildWidget=_7b0;
}
return _7b0.selected;
},this);
var _7b1=this.selectedChildWidget;
if(!_7b1&&_7af[0]){
_7b1=this.selectedChildWidget=_7af[0];
_7b1.selected=true;
}
if(_7b1){
this._showChild(_7b1);
}
dojo.publish(this.id+"-startup",[{children:_7af,selected:_7b1}]);
this.inherited(arguments);
},_setupChild:function(_7b2){
this.inherited(arguments);
_7b2.domNode.style.display="none";
_7b2.domNode.style.position="relative";
_7b2.domNode.title="";
return _7b2;
},addChild:function(_7b3,_7b4){
this.inherited(arguments);
if(this._started){
dojo.publish(this.id+"-addChild",[_7b3,_7b4]);
this.layout();
if(!this.selectedChildWidget){
this.selectChild(_7b3);
}
}
},removeChild:function(page){
this.inherited(arguments);
if(this._beingDestroyed){
return;
}
if(this._started){
dojo.publish(this.id+"-removeChild",[page]);
this.layout();
}
if(this.selectedChildWidget===page){
this.selectedChildWidget=undefined;
if(this._started){
var _7b6=this.getChildren();
if(_7b6.length){
this.selectChild(_7b6[0]);
}
}
}
},selectChild:function(page){
page=dijit.byId(page);
if(this.selectedChildWidget!=page){
this._transition(page,this.selectedChildWidget);
this.selectedChildWidget=page;
dojo.publish(this.id+"-selectChild",[page]);
}
},_transition:function(_7b8,_7b9){
if(_7b9){
this._hideChild(_7b9);
}
this._showChild(_7b8);
if(this.doLayout&&_7b8.resize){
_7b8.resize(this._containerContentBox||this._contentBox);
}
},_adjacent:function(_7ba){
var _7bb=this.getChildren();
var _7bc=dojo.indexOf(_7bb,this.selectedChildWidget);
_7bc+=_7ba?1:_7bb.length-1;
return _7bb[_7bc%_7bb.length];
},forward:function(){
this.selectChild(this._adjacent(true));
},back:function(){
this.selectChild(this._adjacent(false));
},_onKeyPress:function(e){
dojo.publish(this.id+"-containerKeyPress",[{e:e,page:this}]);
},layout:function(){
if(this.doLayout&&this.selectedChildWidget&&this.selectedChildWidget.resize){
this.selectedChildWidget.resize(this._contentBox);
}
},_showChild:function(page){
var _7bf=this.getChildren();
page.isFirstChild=(page==_7bf[0]);
page.isLastChild=(page==_7bf[_7bf.length-1]);
page.selected=true;
page.domNode.style.display="";
if(page._loadCheck){
page._loadCheck();
}
if(page.onShow){
page.onShow();
}
},_hideChild:function(page){
page.selected=false;
page.domNode.style.display="none";
if(page.onHide){
page.onHide();
}
},closeChild:function(page){
var _7c2=page.onClose(this,page);
if(_7c2){
this.removeChild(page);
page.destroyRecursive();
}
},destroy:function(){
this._beingDestroyed=true;
this.inherited(arguments);
}});
dojo.declare("dijit.layout.StackController",[dijit._Widget,dijit._Templated,dijit._Container],{templateString:"<span wairole='tablist' dojoAttachEvent='onkeypress' class='dijitStackController'></span>",containerId:"",buttonWidget:"dijit.layout._StackButton",postCreate:function(){
dijit.setWaiRole(this.domNode,"tablist");
this.pane2button={};
this.pane2handles={};
this.pane2menu={};
this._subscriptions=[dojo.subscribe(this.containerId+"-startup",this,"onStartup"),dojo.subscribe(this.containerId+"-addChild",this,"onAddChild"),dojo.subscribe(this.containerId+"-removeChild",this,"onRemoveChild"),dojo.subscribe(this.containerId+"-selectChild",this,"onSelectChild"),dojo.subscribe(this.containerId+"-containerKeyPress",this,"onContainerKeyPress")];
},onStartup:function(info){
dojo.forEach(info.children,this.onAddChild,this);
this.onSelectChild(info.selected);
},destroy:function(){
for(var pane in this.pane2button){
this.onRemoveChild(pane);
}
dojo.forEach(this._subscriptions,dojo.unsubscribe);
this.inherited(arguments);
},onAddChild:function(page,_7c6){
var _7c7=dojo.doc.createElement("span");
this.domNode.appendChild(_7c7);
var cls=dojo.getObject(this.buttonWidget);
var _7c9=new cls({label:page.title,closeButton:page.closable},_7c7);
this.addChild(_7c9,_7c6);
this.pane2button[page]=_7c9;
page.controlButton=_7c9;
var _7ca=[];
_7ca.push(dojo.connect(_7c9,"onClick",dojo.hitch(this,"onButtonClick",page)));
if(page.closable){
_7ca.push(dojo.connect(_7c9,"onClickCloseButton",dojo.hitch(this,"onCloseButtonClick",page)));
var _7cb=dojo.i18n.getLocalization("dijit","common");
var _7cc=new dijit.Menu({targetNodeIds:[_7c9.id],id:_7c9.id+"_Menu"});
var _7cd=new dijit.MenuItem({label:_7cb.itemClose});
_7ca.push(dojo.connect(_7cd,"onClick",dojo.hitch(this,"onCloseButtonClick",page)));
_7cc.addChild(_7cd);
this.pane2menu[page]=_7cc;
}
this.pane2handles[page]=_7ca;
if(!this._currentChild){
_7c9.focusNode.setAttribute("tabIndex","0");
this._currentChild=page;
}
if(!this.isLeftToRight()&&dojo.isIE&&this._rectifyRtlTabList){
this._rectifyRtlTabList();
}
},onRemoveChild:function(page){
if(this._currentChild===page){
this._currentChild=null;
}
dojo.forEach(this.pane2handles[page],dojo.disconnect);
delete this.pane2handles[page];
var menu=this.pane2menu[page];
if(menu){
menu.destroyRecursive();
delete this.pane2menu[page];
}
var _7d0=this.pane2button[page];
if(_7d0){
_7d0.destroy();
delete this.pane2button[page];
}
},onSelectChild:function(page){
if(!page){
return;
}
if(this._currentChild){
var _7d2=this.pane2button[this._currentChild];
_7d2.attr("checked",false);
_7d2.focusNode.setAttribute("tabIndex","-1");
}
var _7d3=this.pane2button[page];
_7d3.attr("checked",true);
this._currentChild=page;
_7d3.focusNode.setAttribute("tabIndex","0");
var _7d4=dijit.byId(this.containerId);
dijit.setWaiState(_7d4.containerNode,"labelledby",_7d3.id);
},onButtonClick:function(page){
var _7d6=dijit.byId(this.containerId);
_7d6.selectChild(page);
},onCloseButtonClick:function(page){
var _7d8=dijit.byId(this.containerId);
_7d8.closeChild(page);
var b=this.pane2button[this._currentChild];
if(b){
dijit.focus(b.focusNode||b.domNode);
}
},adjacent:function(_7da){
if(!this.isLeftToRight()&&(!this.tabPosition||/top|bottom/.test(this.tabPosition))){
_7da=!_7da;
}
var _7db=this.getChildren();
var _7dc=dojo.indexOf(_7db,this.pane2button[this._currentChild]);
var _7dd=_7da?1:_7db.length-1;
return _7db[(_7dc+_7dd)%_7db.length];
},onkeypress:function(e){
if(this.disabled||e.altKey){
return;
}
var _7df=null;
if(e.ctrlKey||!e._djpage){
var k=dojo.keys;
switch(e.charOrCode){
case k.LEFT_ARROW:
case k.UP_ARROW:
if(!e._djpage){
_7df=false;
}
break;
case k.PAGE_UP:
if(e.ctrlKey){
_7df=false;
}
break;
case k.RIGHT_ARROW:
case k.DOWN_ARROW:
if(!e._djpage){
_7df=true;
}
break;
case k.PAGE_DOWN:
if(e.ctrlKey){
_7df=true;
}
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
if(_7df!==null){
this.adjacent(_7df).onClick();
dojo.stopEvent(e);
}
}
},onContainerKeyPress:function(info){
info.e._djpage=info.page;
this.onkeypress(info.e);
}});
dojo.declare("dijit.layout._StackButton",dijit.form.ToggleButton,{tabIndex:"-1",postCreate:function(evt){
dijit.setWaiRole((this.focusNode||this.domNode),"tab");
this.inherited(arguments);
},onClick:function(evt){
dijit.focus(this.focusNode);
},onClickCloseButton:function(evt){
evt.stopPropagation();
}});
dojo.extend(dijit._Widget,{title:"",selected:false,closable:false,onClose:function(){
return true;
}});
}
if(!dojo._hasResource["dijit.layout.AccordionContainer"]){
dojo._hasResource["dijit.layout.AccordionContainer"]=true;
dojo.provide("dijit.layout.AccordionContainer");
dojo.declare("dijit.layout.AccordionContainer",dijit.layout.StackContainer,{duration:dijit.defaultDuration,_verticalSpace:0,baseClass:"dijitAccordionContainer",postCreate:function(){
this.domNode.style.overflow="hidden";
this.inherited(arguments);
dijit.setWaiRole(this.domNode,"tablist");
},startup:function(){
if(this._started){
return;
}
this.inherited(arguments);
if(this.selectedChildWidget){
var _7e5=this.selectedChildWidget.containerNode.style;
_7e5.display="";
_7e5.overflow="auto";
this.selectedChildWidget._setSelectedState(true);
}
},_getTargetHeight:function(node){
var cs=dojo.getComputedStyle(node);
return Math.max(this._verticalSpace-dojo._getPadBorderExtents(node,cs).h,0);
},layout:function(){
var _7e8=0;
var _7e9=this.selectedChildWidget;
dojo.forEach(this.getChildren(),function(_7ea){
_7e8+=_7ea.getTitleHeight();
});
var _7eb=this._contentBox;
this._verticalSpace=_7eb.h-_7e8;
if(_7e9){
_7e9.containerNode.style.height=this._getTargetHeight(_7e9.containerNode)+"px";
}
},_setupChild:function(page){
return page;
},_transition:function(_7ed,_7ee){
if(this._inTransition){
return;
}
this._inTransition=true;
var _7ef=[];
var _7f0=this._verticalSpace;
if(_7ed){
_7ed.setSelected(true);
var _7f1=_7ed.containerNode;
_7f1.style.display="";
_7f0=this._getTargetHeight(_7ed.containerNode);
_7ef.push(dojo.animateProperty({node:_7f1,duration:this.duration,properties:{height:{start:1,end:_7f0}},onEnd:function(){
_7f1.style.overflow="auto";
}}));
}
if(_7ee){
_7ee.setSelected(false);
var _7f2=_7ee.containerNode;
_7f2.style.overflow="hidden";
_7f0=this._getTargetHeight(_7ee.containerNode);
_7ef.push(dojo.animateProperty({node:_7f2,duration:this.duration,properties:{height:{start:_7f0,end:"1"}},onEnd:function(){
_7f2.style.display="none";
}}));
}
this._inTransition=false;
dojo.fx.combine(_7ef).play();
},_onKeyPress:function(e){
if(this.disabled||e.altKey||!(e._dijitWidget||e.ctrlKey)){
return;
}
var k=dojo.keys;
var _7f5=e._dijitWidget;
switch(e.charOrCode){
case k.LEFT_ARROW:
case k.UP_ARROW:
if(_7f5){
this._adjacent(false)._onTitleClick();
dojo.stopEvent(e);
}
break;
case k.PAGE_UP:
if(e.ctrlKey){
this._adjacent(false)._onTitleClick();
dojo.stopEvent(e);
}
break;
case k.RIGHT_ARROW:
case k.DOWN_ARROW:
if(_7f5){
this._adjacent(true)._onTitleClick();
dojo.stopEvent(e);
}
break;
case k.PAGE_DOWN:
if(e.ctrlKey){
this._adjacent(true)._onTitleClick();
dojo.stopEvent(e);
}
break;
default:
if(e.ctrlKey&&e.charOrCode===k.TAB){
this._adjacent(e._dijitWidget,!e.shiftKey)._onTitleClick();
dojo.stopEvent(e);
}
}
}});
dojo.declare("dijit.layout.AccordionPane",[dijit.layout.ContentPane,dijit._Templated,dijit._Contained],{templateString:"<div waiRole=\"presentation\"\r\n\t><div dojoAttachPoint='titleNode,focusNode' dojoAttachEvent='ondijitclick:_onTitleClick,onkeypress:_onTitleKeyPress,onfocus:_handleFocus,onblur:_handleFocus,onmouseenter:_onTitleEnter,onmouseleave:_onTitleLeave'\r\n\t\tclass='dijitAccordionTitle' wairole=\"tab\" waiState=\"expanded-false\"\r\n\t\t><span class='dijitInline dijitAccordionArrow' waiRole=\"presentation\"></span\r\n\t\t><span class='arrowTextUp' waiRole=\"presentation\">+</span\r\n\t\t><span class='arrowTextDown' waiRole=\"presentation\">-</span\r\n\t\t><span waiRole=\"presentation\" dojoAttachPoint='titleTextNode' class='dijitAccordionText'></span></div\r\n\t><div waiRole=\"presentation\"><div dojoAttachPoint='containerNode' style='overflow: hidden; height: 1px; display: none'\r\n\t\tclass='dijitAccordionBody' wairole=\"tabpanel\"\r\n\t></div></div>\r\n</div>\r\n",attributeMap:dojo.mixin(dojo.clone(dijit.layout.ContentPane.prototype.attributeMap),{title:{node:"titleTextNode",type:"innerHTML"}}),baseClass:"dijitAccordionPane",postCreate:function(){
this.inherited(arguments);
dojo.setSelectable(this.titleNode,false);
this.setSelected(this.selected);
dojo.attr(this.titleTextNode,"id",this.domNode.id+"_title");
dijit.setWaiState(this.focusNode,"labelledby",dojo.attr(this.titleTextNode,"id"));
},getTitleHeight:function(){
return dojo.marginBox(this.titleNode).h;
},_onTitleClick:function(){
var _7f6=this.getParent();
if(!_7f6._inTransition){
_7f6.selectChild(this);
dijit.focus(this.focusNode);
}
},_onTitleEnter:function(){
dojo.addClass(this.focusNode,"dijitAccordionTitle-hover");
},_onTitleLeave:function(){
dojo.removeClass(this.focusNode,"dijitAccordionTitle-hover");
},_onTitleKeyPress:function(evt){
evt._dijitWidget=this;
return this.getParent()._onKeyPress(evt);
},_setSelectedState:function(_7f8){
this.selected=_7f8;
dojo[(_7f8?"addClass":"removeClass")](this.titleNode,"dijitAccordionTitle-selected");
dijit.setWaiState(this.focusNode,"expanded",_7f8);
this.focusNode.setAttribute("tabIndex",_7f8?"0":"-1");
},_handleFocus:function(e){
dojo[(e.type=="focus"?"addClass":"removeClass")](this.focusNode,"dijitAccordionFocused");
},setSelected:function(_7fa){
this._setSelectedState(_7fa);
if(_7fa){
this.onSelected();
this._loadCheck();
}
},onSelected:function(){
}});
}
if(!dojo._hasResource["dijit.layout.TabContainer"]){
dojo._hasResource["dijit.layout.TabContainer"]=true;
dojo.provide("dijit.layout.TabContainer");
dojo.declare("dijit.layout.TabContainer",[dijit.layout.StackContainer,dijit._Templated],{tabPosition:"top",baseClass:"dijitTabContainer",tabStrip:false,templateString:null,templateString:"<div class=\"dijitTabContainer\">\r\n\t<div dojoAttachPoint=\"tablistNode\"></div>\r\n\t<div dojoAttachPoint=\"tablistSpacer\" class=\"dijitTabSpacer ${baseClass}-spacer\"></div>\r\n\t<div class=\"dijitTabPaneWrapper ${baseClass}-container\" dojoAttachPoint=\"containerNode\"></div>\r\n</div>\r\n",_controllerWidget:"dijit.layout.TabController",postMixInProperties:function(){
this.baseClass+=this.tabPosition.charAt(0).toUpperCase()+this.tabPosition.substr(1).replace(/-.*/,"");
this.inherited(arguments);
},postCreate:function(){
this.inherited(arguments);
var _7fb=dojo.getObject(this._controllerWidget);
this.tablist=new _7fb({id:this.id+"_tablist",tabPosition:this.tabPosition,doLayout:this.doLayout,containerId:this.id,"class":this.baseClass+"-tabs"+(this.doLayout?"":" dijitTabNoLayout")},this.tablistNode);
if(this.tabStrip){
dojo.addClass(this.tablist.domNode,this.baseClass+"Strip");
}
},_setupChild:function(tab){
dojo.addClass(tab.domNode,"dijitTabPane");
this.inherited(arguments);
return tab;
},startup:function(){
if(this._started){
return;
}
this.tablist.startup();
this.inherited(arguments);
},layout:function(){
if(!this.doLayout){
return;
}
var _7fd=this.tabPosition.replace(/-h/,"");
var _7fe=[{domNode:this.tablist.domNode,layoutAlign:_7fd},{domNode:this.tablistSpacer,layoutAlign:_7fd},{domNode:this.containerNode,layoutAlign:"client"}];
dijit.layout.layoutChildren(this.domNode,this._contentBox,_7fe);
this._containerContentBox=dijit.layout.marginBox2contentBox(this.containerNode,_7fe[2]);
if(this.selectedChildWidget){
this._showChild(this.selectedChildWidget);
if(this.doLayout&&this.selectedChildWidget.resize){
this.selectedChildWidget.resize(this._containerContentBox);
}
}
},destroy:function(){
if(this.tablist){
this.tablist.destroy();
}
this.inherited(arguments);
}});
dojo.declare("dijit.layout.TabController",dijit.layout.StackController,{templateString:"<div wairole='tablist' dojoAttachEvent='onkeypress:onkeypress'></div>",tabPosition:"top",doLayout:true,buttonWidget:"dijit.layout._TabButton",_rectifyRtlTabList:function(){
if(0>=this.tabPosition.indexOf("-h")){
return;
}
if(!this.pane2button){
return;
}
var _7ff=0;
for(var pane in this.pane2button){
var ow=this.pane2button[pane].innerDiv.scrollWidth;
_7ff=Math.max(_7ff,ow);
}
for(pane in this.pane2button){
this.pane2button[pane].innerDiv.style.width=_7ff+"px";
}
}});
dojo.declare("dijit.layout._TabButton",dijit.layout._StackButton,{baseClass:"dijitTab",templateString:"<div waiRole=\"presentation\" dojoAttachEvent='onclick:onClick,onmouseenter:_onMouse,onmouseleave:_onMouse'>\r\n    <div waiRole=\"presentation\" class='dijitTabInnerDiv' dojoAttachPoint='innerDiv'>\r\n        <div waiRole=\"presentation\" class='dijitTabContent' dojoAttachPoint='tabContent'>\r\n\t        <span dojoAttachPoint='containerNode,focusNode' class='tabLabel'>${!label}</span><img class =\"dijitTabButtonSpacer\" src=\"${_blankGif}\" />\r\n\t        <div class=\"dijitInline closeNode\" dojoAttachPoint='closeNode' dojoAttachEvent='onclick:onClickCloseButton'>\r\n\t        \t<img src=\"${_blankGif}\" alt=\"\" dojoAttachPoint='closeButtonNode' class='closeImage' dojoAttachEvent='onmouseenter:_onMouse, onmouseleave:_onMouse' stateModifier='CloseButton' waiRole=\"presentation\"/>\r\n\t            <span dojoAttachPoint='closeText' class='closeText'>x</span>\r\n\t        </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n",_scroll:false,postCreate:function(){
if(this.closeButton){
dojo.addClass(this.innerDiv,"dijitClosable");
var _802=dojo.i18n.getLocalization("dijit","common");
if(this.closeNode){
dojo.attr(this.closeNode,"title",_802.itemClose);
dojo.attr(this.closeButtonNode,"title",_802.itemClose);
}
}else{
this.closeNode.style.display="none";
}
this.inherited(arguments);
dojo.setSelectable(this.containerNode,false);
}});
}
if(!dojo._hasResource["dijit.Tree"]){
dojo._hasResource["dijit.Tree"]=true;
dojo.provide("dijit.Tree");
dojo.declare("dijit._TreeNode",[dijit._Widget,dijit._Templated,dijit._Container,dijit._Contained],{item:null,isTreeNode:true,label:"",isExpandable:null,isExpanded:false,state:"UNCHECKED",templateString:"<div class=\"dijitTreeNode\" waiRole=\"presentation\"\r\n\t><div dojoAttachPoint=\"rowNode\" class=\"dijitTreeRow\" waiRole=\"presentation\"\r\n\t\t><img src=\"${_blankGif}\" alt=\"\" dojoAttachPoint=\"expandoNode\" class=\"dijitTreeExpando\" waiRole=\"presentation\"\r\n\t\t><span dojoAttachPoint=\"expandoNodeText\" class=\"dijitExpandoText\" waiRole=\"presentation\"\r\n\t\t></span\r\n\t\t><span dojoAttachPoint=\"contentNode\" dojoAttachEvent=\"onmouseenter:_onMouseEnter, onmouseleave:_onMouseLeave\"\r\n\t\t\tclass=\"dijitTreeContent\" waiRole=\"presentation\">\r\n\t\t\t<img src=\"${_blankGif}\" alt=\"\" dojoAttachPoint=\"iconNode\" class=\"dijitTreeIcon\" waiRole=\"presentation\"\r\n\t\t\t><span dojoAttachPoint=\"labelNode\" class=\"dijitTreeLabel\" wairole=\"treeitem\" tabindex=\"-1\" waiState=\"selected-false\" dojoAttachEvent=\"onfocus:_onNodeFocus\"></span>\r\n\t\t</span\r\n\t></div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitTreeContainer\" waiRole=\"presentation\" style=\"display: none;\"></div>\r\n</div>\r\n",postCreate:function(){
this.setLabelNode(this.label);
this._setExpando();
this._updateItemClasses(this.item);
if(this.isExpandable){
dijit.setWaiState(this.labelNode,"expanded",this.isExpanded);
}
},markProcessing:function(){
this.state="LOADING";
this._setExpando(true);
},unmarkProcessing:function(){
this._setExpando(false);
},_updateItemClasses:function(item){
var tree=this.tree,_805=tree.model;
if(tree._v10Compat&&item===_805.root){
item=null;
}
this.iconNode.className="dijitTreeIcon "+tree.getIconClass(item,this.isExpanded);
this.labelNode.className="dijitTreeLabel "+tree.getLabelClass(item,this.isExpanded);
},_updateLayout:function(){
var _806=this.getParent();
if(!_806||_806.rowNode.style.display=="none"){
dojo.addClass(this.domNode,"dijitTreeIsRoot");
}else{
dojo.toggleClass(this.domNode,"dijitTreeIsLast",!this.getNextSibling());
}
},_setExpando:function(_807){
var _808=["dijitTreeExpandoLoading","dijitTreeExpandoOpened","dijitTreeExpandoClosed","dijitTreeExpandoLeaf"];
var _809=["*","-","+","*"];
var idx=_807?0:(this.isExpandable?(this.isExpanded?1:2):3);
dojo.forEach(_808,function(s){
dojo.removeClass(this.expandoNode,s);
},this);
dojo.addClass(this.expandoNode,_808[idx]);
this.expandoNodeText.innerHTML=_809[idx];
},expand:function(){
if(this.isExpanded){
return;
}
this._wipeOut&&this._wipeOut.stop();
this.isExpanded=true;
dijit.setWaiState(this.labelNode,"expanded","true");
dijit.setWaiRole(this.containerNode,"group");
this.contentNode.className="dijitTreeContent dijitTreeContentExpanded";
this._setExpando();
this._updateItemClasses(this.item);
if(!this._wipeIn){
this._wipeIn=dojo.fx.wipeIn({node:this.containerNode,duration:dijit.defaultDuration});
}
this._wipeIn.play();
},collapse:function(){
if(!this.isExpanded){
return;
}
this._wipeIn&&this._wipeIn.stop();
this.isExpanded=false;
dijit.setWaiState(this.labelNode,"expanded","false");
this.contentNode.className="dijitTreeContent";
this._setExpando();
this._updateItemClasses(this.item);
if(!this._wipeOut){
this._wipeOut=dojo.fx.wipeOut({node:this.containerNode,duration:dijit.defaultDuration});
}
this._wipeOut.play();
},setLabelNode:function(_80c){
this.labelNode.innerHTML="";
this.labelNode.appendChild(dojo.doc.createTextNode(_80c));
},setChildItems:function(_80d){
var tree=this.tree,_80f=tree.model;
this.getChildren().forEach(function(_810){
dijit._Container.prototype.removeChild.call(this,_810);
},this);
this.state="LOADED";
if(_80d&&_80d.length>0){
this.isExpandable=true;
dojo.forEach(_80d,function(item){
var id=_80f.getIdentity(item),_813=tree._itemNodeMap[id],node=(_813&&!_813.getParent())?_813:this.tree._createTreeNode({item:item,tree:tree,isExpandable:_80f.mayHaveChildren(item),label:tree.getLabel(item)});
this.addChild(node);
tree._itemNodeMap[id]=node;
if(this.tree.persist){
if(tree._openedItemIds[id]){
tree._expandNode(node);
}
}
},this);
dojo.forEach(this.getChildren(),function(_815,idx){
_815._updateLayout();
});
}else{
this.isExpandable=false;
}
if(this._setExpando){
this._setExpando(false);
}
if(this==tree.rootNode){
var fc=this.tree.showRoot?this:this.getChildren()[0],_818=fc?fc.labelNode:this.domNode;
_818.setAttribute("tabIndex","0");
tree.lastFocused=fc;
}
},removeChild:function(node){
this.inherited(arguments);
var _81a=this.getChildren();
if(_81a.length==0){
this.isExpandable=false;
this.collapse();
}
dojo.forEach(_81a,function(_81b){
_81b._updateLayout();
});
},makeExpandable:function(){
this.isExpandable=true;
this._setExpando(false);
},_onNodeFocus:function(evt){
var node=dijit.getEnclosingWidget(evt.target);
this.tree._onTreeFocus(node);
},_onMouseEnter:function(evt){
dojo.addClass(this.contentNode,"dijitTreeNodeHover");
},_onMouseLeave:function(evt){
dojo.removeClass(this.contentNode,"dijitTreeNodeHover");
}});
dojo.declare("dijit.Tree",[dijit._Widget,dijit._Templated],{store:null,model:null,query:null,label:"",showRoot:true,childrenAttr:["children"],openOnClick:false,templateString:"<div class=\"dijitTreeContainer\" waiRole=\"tree\"\r\n\tdojoAttachEvent=\"onclick:_onClick,onkeypress:_onKeyPress\">\r\n</div>\r\n",isExpandable:true,isTree:true,persist:true,dndController:null,dndParams:["onDndDrop","itemCreator","onDndCancel","checkAcceptance","checkItemAcceptance","dragThreshold"],onDndDrop:null,itemCreator:null,onDndCancel:null,checkAcceptance:null,checkItemAcceptance:null,dragThreshold:0,_publish:function(_820,_821){
dojo.publish(this.id,[dojo.mixin({tree:this,event:_820},_821||{})]);
},postMixInProperties:function(){
this.tree=this;
this._itemNodeMap={};
if(!this.cookieName){
this.cookieName=this.id+"SaveStateCookie";
}
},postCreate:function(){
if(this.persist){
var _822=dojo.cookie(this.cookieName);
this._openedItemIds={};
if(_822){
dojo.forEach(_822.split(","),function(item){
this._openedItemIds[item]=true;
},this);
}
}
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
var _824={};
for(var i=0;i<this.dndParams.length;i++){
if(this[this.dndParams[i]]){
_824[this.dndParams[i]]=this[this.dndParams[i]];
}
}
this.dndController=new this.dndController(this,_824);
}
},_store2model:function(){
this._v10Compat=true;
dojo.deprecated("Tree: from version 2.0, should specify a model object rather than a store/query");
var _826={id:this.id+"_ForestStoreModel",store:this.store,query:this.query,childrenAttrs:this.childrenAttr};
if(this.params.mayHaveChildren){
_826.mayHaveChildren=dojo.hitch(this,"mayHaveChildren");
}
if(this.params.getItemChildren){
_826.getChildren=dojo.hitch(this,function(item,_828,_829){
this.getItemChildren((this._v10Compat&&item===this.model.root)?null:item,_828,_829);
});
}
this.model=new dijit.tree.ForestStoreModel(_826);
this.showRoot=Boolean(this.label);
},_load:function(){
this.model.getRoot(dojo.hitch(this,function(item){
var rn=this.rootNode=this.tree._createTreeNode({item:item,tree:this,isExpandable:true,label:this.label||this.getLabel(item)});
if(!this.showRoot){
rn.rowNode.style.display="none";
}
this.domNode.appendChild(rn.domNode);
this._itemNodeMap[this.model.getIdentity(item)]=rn;
rn._updateLayout();
this._expandNode(rn);
}),function(err){
console.error(this,": error loading root: ",err);
});
},mayHaveChildren:function(item){
},getItemChildren:function(_82e,_82f){
},getLabel:function(item){
return this.model.getLabel(item);
},getIconClass:function(item,_832){
return (!item||this.model.mayHaveChildren(item))?(_832?"dijitFolderOpened":"dijitFolderClosed"):"dijitLeaf";
},getLabelClass:function(item,_834){
},_onKeyPress:function(e){
if(e.altKey){
return;
}
var dk=dojo.keys;
var _837=dijit.getEnclosingWidget(e.target);
if(!_837){
return;
}
var key=e.charOrCode;
if(typeof key=="string"){
if(!e.altKey&&!e.ctrlKey&&!e.shiftKey&&!e.metaKey){
this._onLetterKeyNav({node:_837,key:key.toLowerCase()});
dojo.stopEvent(e);
}
}else{
var map=this._keyHandlerMap;
if(!map){
map={};
map[dk.ENTER]="_onEnterKey";
map[this.isLeftToRight()?dk.LEFT_ARROW:dk.RIGHT_ARROW]="_onLeftArrow";
map[this.isLeftToRight()?dk.RIGHT_ARROW:dk.LEFT_ARROW]="_onRightArrow";
map[dk.UP_ARROW]="_onUpArrow";
map[dk.DOWN_ARROW]="_onDownArrow";
map[dk.HOME]="_onHomeKey";
map[dk.END]="_onEndKey";
this._keyHandlerMap=map;
}
if(this._keyHandlerMap[key]){
this[this._keyHandlerMap[key]]({node:_837,item:_837.item});
dojo.stopEvent(e);
}
}
},_onEnterKey:function(_83a){
this._publish("execute",{item:_83a.item,node:_83a.node});
this.onClick(_83a.item,_83a.node);
},_onDownArrow:function(_83b){
var node=this._getNextNode(_83b.node);
if(node&&node.isTreeNode){
this.focusNode(node);
}
},_onUpArrow:function(_83d){
var node=_83d.node;
var _83f=node.getPreviousSibling();
if(_83f){
node=_83f;
while(node.isExpandable&&node.isExpanded&&node.hasChildren()){
var _840=node.getChildren();
node=_840[_840.length-1];
}
}else{
var _841=node.getParent();
if(!(!this.showRoot&&_841===this.rootNode)){
node=_841;
}
}
if(node&&node.isTreeNode){
this.focusNode(node);
}
},_onRightArrow:function(_842){
var node=_842.node;
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
},_onLeftArrow:function(_844){
var node=_844.node;
if(node.isExpandable&&node.isExpanded){
this._collapseNode(node);
}else{
var _846=node.getParent();
if(_846&&_846.isTreeNode&&!(!this.showRoot&&_846===this.rootNode)){
this.focusNode(_846);
}
}
},_onHomeKey:function(){
var node=this._getRootOrFirstNode();
if(node){
this.focusNode(node);
}
},_onEndKey:function(_848){
var node=this;
while(node.isExpanded){
var c=node.getChildren();
node=c[c.length-1];
}
if(node&&node.isTreeNode){
this.focusNode(node);
}
},_onLetterKeyNav:function(_84b){
var node=_84b.node,_84d=node,key=_84b.key;
do{
node=this._getNextNode(node);
if(!node){
node=this._getRootOrFirstNode();
}
}while(node!==_84d&&(node.label.charAt(0).toLowerCase()!=key));
if(node&&node.isTreeNode){
if(node!==_84d){
this.focusNode(node);
}
}
},_onClick:function(e){
var _850=e.target;
var _851=dijit.getEnclosingWidget(_850);
if(!_851||!_851.isTreeNode){
return;
}
if((this.openOnClick&&_851.isExpandable)||(_850==_851.expandoNode||_850==_851.expandoNodeText)){
if(_851.isExpandable){
this._onExpandoClick({node:_851});
}
}else{
this._publish("execute",{item:_851.item,node:_851});
this.onClick(_851.item,_851);
this.focusNode(_851);
}
dojo.stopEvent(e);
},_onExpandoClick:function(_852){
var node=_852.node;
this.focusNode(node);
if(node.isExpanded){
this._collapseNode(node);
}else{
this._expandNode(node);
}
},onClick:function(item,node){
},onOpen:function(item,node){
},onClose:function(item,node){
},_getNextNode:function(node){
if(node.isExpandable&&node.isExpanded&&node.hasChildren()){
return node.getChildren()[0];
}else{
while(node&&node.isTreeNode){
var _85b=node.getNextSibling();
if(_85b){
return _85b;
}
node=node.getParent();
}
return null;
}
},_getRootOrFirstNode:function(){
return this.showRoot?this.rootNode:this.rootNode.getChildren()[0];
},_collapseNode:function(node){
if(node.isExpandable){
if(node.state=="LOADING"){
return;
}
node.collapse();
this.onClose(node.item,node);
if(this.persist&&node.item){
delete this._openedItemIds[this.model.getIdentity(node.item)];
this._saveState();
}
}
},_expandNode:function(node){
if(!node.isExpandable){
return;
}
var _85e=this.model,item=node.item;
switch(node.state){
case "LOADING":
return;
case "UNCHECKED":
node.markProcessing();
var _860=this;
_85e.getChildren(item,function(_861){
node.unmarkProcessing();
node.setChildItems(_861);
_860._expandNode(node);
},function(err){
console.error(_860,": error loading root children: ",err);
});
break;
default:
node.expand();
this.onOpen(node.item,node);
if(this.persist&&item){
this._openedItemIds[_85e.getIdentity(item)]=true;
this._saveState();
}
}
},blurNode:function(){
var node=this.lastFocused;
if(!node){
return;
}
var _864=node.labelNode;
dojo.removeClass(_864,"dijitTreeLabelFocused");
_864.setAttribute("tabIndex","-1");
dijit.setWaiState(_864,"selected",false);
this.lastFocused=null;
},focusNode:function(node){
node.labelNode.focus();
},_onBlur:function(){
this.inherited(arguments);
if(this.lastFocused){
var _866=this.lastFocused.labelNode;
dojo.removeClass(_866,"dijitTreeLabelFocused");
}
},_onTreeFocus:function(node){
if(node){
if(node!=this.lastFocused){
this.blurNode();
}
var _868=node.labelNode;
_868.setAttribute("tabIndex","0");
dijit.setWaiState(_868,"selected",true);
dojo.addClass(_868,"dijitTreeLabelFocused");
this.lastFocused=node;
}
},_onItemDelete:function(item){
var _86a=this.model.getIdentity(item);
var node=this._itemNodeMap[_86a];
if(node){
var _86c=node.getParent();
if(_86c){
_86c.removeChild(node);
}
delete this._itemNodeMap[_86a];
node.destroyRecursive();
}
},_onItemChange:function(item){
var _86e=this.model,_86f=_86e.getIdentity(item),node=this._itemNodeMap[_86f];
if(node){
node.setLabelNode(this.getLabel(item));
node._updateItemClasses(item);
}
},_onItemChildrenChange:function(_871,_872){
var _873=this.model,_874=_873.getIdentity(_871),_875=this._itemNodeMap[_874];
if(_875){
_875.setChildItems(_872);
}
},_onItemDelete:function(item){
var _877=this.model,_878=_877.getIdentity(item),node=this._itemNodeMap[_878];
if(node){
node.destroyRecursive();
delete this._itemNodeMap[_878];
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
},_createTreeNode:function(args){
return new dijit._TreeNode(args);
}});
dojo.declare("dijit.tree.TreeStoreModel",null,{store:null,childrenAttrs:["children"],labelAttr:"",root:null,query:null,constructor:function(args){
dojo.mixin(this,args);
this.connects=[];
var _87e=this.store;
if(!_87e.getFeatures()["dojo.data.api.Identity"]){
throw new Error("dijit.Tree: store must support dojo.data.Identity");
}
if(_87e.getFeatures()["dojo.data.api.Notification"]){
this.connects=this.connects.concat([dojo.connect(_87e,"onNew",this,"_onNewItem"),dojo.connect(_87e,"onDelete",this,"_onDeleteItem"),dojo.connect(_87e,"onSet",this,"_onSetItem")]);
}
},destroy:function(){
dojo.forEach(this.connects,dojo.disconnect);
},getRoot:function(_87f,_880){
if(this.root){
_87f(this.root);
}else{
this.store.fetch({query:this.query,onComplete:dojo.hitch(this,function(_881){
if(_881.length!=1){
throw new Error(this.declaredClass+": query "+dojo.toJson(this.query)+" returned "+_881.length+" items, but must return exactly one item");
}
this.root=_881[0];
_87f(this.root);
}),onError:_880});
}
},mayHaveChildren:function(item){
return dojo.some(this.childrenAttrs,function(attr){
return this.store.hasAttribute(item,attr);
},this);
},getChildren:function(_884,_885,_886){
var _887=this.store;
var _888=[];
for(var i=0;i<this.childrenAttrs.length;i++){
var vals=_887.getValues(_884,this.childrenAttrs[i]);
_888=_888.concat(vals);
}
var _88b=0;
dojo.forEach(_888,function(item){
if(!_887.isItemLoaded(item)){
_88b++;
}
});
if(_88b==0){
_885(_888);
}else{
var _88d=function _88d(item){
if(--_88b==0){
_885(_888);
}
};
dojo.forEach(_888,function(item){
if(!_887.isItemLoaded(item)){
_887.loadItem({item:item,onItem:_88d,onError:_886});
}
});
}
},getIdentity:function(item){
return this.store.getIdentity(item);
},getLabel:function(item){
if(this.labelAttr){
return this.store.getValue(item,this.labelAttr);
}else{
return this.store.getLabel(item);
}
},newItem:function(args,_893){
var _894={parent:_893,attribute:this.childrenAttrs[0]};
return this.store.newItem(args,_894);
},pasteItem:function(_895,_896,_897,_898){
var _899=this.store,_89a=this.childrenAttrs[0];
if(_896){
dojo.forEach(this.childrenAttrs,function(attr){
if(_899.containsValue(_896,attr,_895)){
if(!_898){
var _89c=dojo.filter(_899.getValues(_896,attr),function(x){
return x!=_895;
});
_899.setValues(_896,attr,_89c);
}
_89a=attr;
}
});
}
if(_897){
_899.setValues(_897,_89a,_899.getValues(_897,_89a).concat(_895));
}
},onChange:function(item){
},onChildrenChange:function(_89f,_8a0){
},onDelete:function(_8a1,_8a2){
},_onNewItem:function(item,_8a4){
if(!_8a4){
return;
}
this.getChildren(_8a4.item,dojo.hitch(this,function(_8a5){
this.onChildrenChange(_8a4.item,_8a5);
}));
},_onDeleteItem:function(item){
this.onDelete(item);
},_onSetItem:function(item,_8a8,_8a9,_8aa){
if(dojo.indexOf(this.childrenAttrs,_8a8)!=-1){
this.getChildren(item,dojo.hitch(this,function(_8ab){
this.onChildrenChange(item,_8ab);
}));
}else{
this.onChange(item);
}
}});
dojo.declare("dijit.tree.ForestStoreModel",dijit.tree.TreeStoreModel,{rootId:"$root$",rootLabel:"ROOT",query:null,constructor:function(_8ac){
this.root={store:this,root:true,id:_8ac.rootId,label:_8ac.rootLabel,children:_8ac.rootChildren};
},mayHaveChildren:function(item){
return item===this.root||this.inherited(arguments);
},getChildren:function(_8ae,_8af,_8b0){
if(_8ae===this.root){
if(this.root.children){
_8af(this.root.children);
}else{
this.store.fetch({query:this.query,onComplete:dojo.hitch(this,function(_8b1){
this.root.children=_8b1;
_8af(_8b1);
}),onError:_8b0});
}
}else{
this.inherited(arguments);
}
},getIdentity:function(item){
return (item===this.root)?this.root.id:this.inherited(arguments);
},getLabel:function(item){
return (item===this.root)?this.root.label:this.inherited(arguments);
},newItem:function(args,_8b5){
if(_8b5===this.root){
this.onNewRootItem(args);
return this.store.newItem(args);
}else{
return this.inherited(arguments);
}
},onNewRootItem:function(args){
},pasteItem:function(_8b7,_8b8,_8b9,_8ba){
if(_8b8===this.root){
if(!_8ba){
this.onLeaveRoot(_8b7);
}
}
dijit.tree.TreeStoreModel.prototype.pasteItem.call(this,_8b7,_8b8===this.root?null:_8b8,_8b9===this.root?null:_8b9);
if(_8b9===this.root){
this.onAddToRoot(_8b7);
}
},onAddToRoot:function(item){
console.log(this,": item ",item," added to root");
},onLeaveRoot:function(item){
console.log(this,": item ",item," removed from root");
},_requeryTop:function(){
var _8bd=this.root.children||[];
this.store.fetch({query:this.query,onComplete:dojo.hitch(this,function(_8be){
this.root.children=_8be;
if(_8bd.length!=_8be.length||dojo.some(_8bd,function(item,idx){
return _8be[idx]!=item;
})){
this.onChildrenChange(this.root,_8be);
}
})});
},_onNewItem:function(item,_8c2){
this._requeryTop();
this.inherited(arguments);
},_onDeleteItem:function(item){
if(dojo.indexOf(this.root.children,item)!=-1){
this._requeryTop();
}
this.inherited(arguments);
}});
}
if(!dojo._hasResource["dojox.data.dom"]){
dojo._hasResource["dojox.data.dom"]=true;
dojo.provide("dojox.data.dom");
dojo.experimental("dojox.data.dom");
dojox.data.dom.createDocument=function(str,_8c5){
var _8c6=dojo.doc;
if(!_8c5){
_8c5="text/xml";
}
if(str&&dojo.trim(str)!==""&&(typeof dojo.global["DOMParser"])!=="undefined"){
var _8c7=new DOMParser();
return _8c7.parseFromString(str,_8c5);
}else{
if((typeof dojo.global["ActiveXObject"])!=="undefined"){
var _8c8=["MSXML2","Microsoft","MSXML","MSXML3"];
for(var i=0;i<_8c8.length;i++){
try{
var doc=new ActiveXObject(_8c8[i]+".XMLDOM");
if(str){
if(doc){
doc.async=false;
doc.loadXML(str);
return doc;
}else{
console.log("loadXML didn't work?");
}
}else{
if(doc){
return doc;
}
}
}
catch(e){
}
}
}else{
if((_8c6.implementation)&&(_8c6.implementation.createDocument)){
if(str&&dojo.trim(str)!==""){
if(_8c6.createElement){
var tmp=_8c6.createElement("xml");
tmp.innerHTML=str;
var _8cc=_8c6.implementation.createDocument("foo","",null);
for(var i=0;i<tmp.childNodes.length;i++){
_8cc.importNode(tmp.childNodes.item(i),true);
}
return _8cc;
}
}else{
return _8c6.implementation.createDocument("","",null);
}
}
}
}
return null;
};
dojox.data.dom.textContent=function(node,text){
if(arguments.length>1){
var _8cf=node.ownerDocument||dojo.doc;
dojox.data.dom.replaceChildren(node,_8cf.createTextNode(text));
return text;
}else{
if(node.textContent!==undefined){
return node.textContent;
}
var _8d0="";
if(node==null){
return _8d0;
}
for(var i=0;i<node.childNodes.length;i++){
switch(node.childNodes[i].nodeType){
case 1:
case 5:
_8d0+=dojox.data.dom.textContent(node.childNodes[i]);
break;
case 3:
case 2:
case 4:
_8d0+=node.childNodes[i].nodeValue;
break;
default:
break;
}
}
return _8d0;
}
};
dojox.data.dom.replaceChildren=function(node,_8d3){
var _8d4=[];
if(dojo.isIE){
for(var i=0;i<node.childNodes.length;i++){
_8d4.push(node.childNodes[i]);
}
}
dojox.data.dom.removeChildren(node);
for(var i=0;i<_8d4.length;i++){
dojo._destroyElement(_8d4[i]);
}
if(!dojo.isArray(_8d3)){
node.appendChild(_8d3);
}else{
for(var i=0;i<_8d3.length;i++){
node.appendChild(_8d3[i]);
}
}
};
dojox.data.dom.removeChildren=function(node){
var _8d7=node.childNodes.length;
while(node.hasChildNodes()){
node.removeChild(node.firstChild);
}
return _8d7;
};
dojox.data.dom.innerXML=function(node){
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
};
}
if(!dojo._hasResource["dojox.data.XmlStore"]){
dojo._hasResource["dojox.data.XmlStore"]=true;
dojo.provide("dojox.data.XmlStore");
dojo.provide("dojox.data.XmlItem");
dojo.declare("dojox.data.XmlStore",null,{constructor:function(args){
console.log("XmlStore()");
if(args){
this.url=args.url;
this.rootItem=(args.rootItem||args.rootitem||this.rootItem);
this.keyAttribute=(args.keyAttribute||args.keyattribute||this.keyAttribute);
this._attributeMap=(args.attributeMap||args.attributemap);
this.label=args.label||this.label;
this.sendQuery=(args.sendQuery||args.sendquery||this.sendQuery);
}
this._newItems=[];
this._deletedItems=[];
this._modifiedItems=[];
},url:"",rootItem:"",keyAttribute:"",label:"",sendQuery:false,getValue:function(item,_8db,_8dc){
var _8dd=item.element;
if(_8db==="tagName"){
return _8dd.nodeName;
}else{
if(_8db==="childNodes"){
for(var i=0;i<_8dd.childNodes.length;i++){
var node=_8dd.childNodes[i];
if(node.nodeType===1){
return this._getItem(node);
}
}
return _8dc;
}else{
if(_8db==="text()"){
for(var i=0;i<_8dd.childNodes.length;i++){
var node=_8dd.childNodes[i];
if(node.nodeType===3||node.nodeType===4){
return node.nodeValue;
}
}
return _8dc;
}else{
_8db=this._getAttribute(_8dd.nodeName,_8db);
if(_8db.charAt(0)==="@"){
var name=_8db.substring(1);
var _8e1=_8dd.getAttribute(name);
return (_8e1!==undefined)?_8e1:_8dc;
}else{
for(var i=0;i<_8dd.childNodes.length;i++){
var node=_8dd.childNodes[i];
if(node.nodeType===1&&node.nodeName===_8db){
return this._getItem(node);
}
}
return _8dc;
}
}
}
}
},getValues:function(item,_8e3){
var _8e4=item.element;
if(_8e3==="tagName"){
return [_8e4.nodeName];
}else{
if(_8e3==="childNodes"){
var _8e5=[];
for(var i=0;i<_8e4.childNodes.length;i++){
var node=_8e4.childNodes[i];
if(node.nodeType===1){
_8e5.push(this._getItem(node));
}
}
return _8e5;
}else{
if(_8e3==="text()"){
var _8e5=[],ec=_8e4.childNodes;
for(var i=0;i<ec.length;i++){
var node=ec[i];
if(node.nodeType===3||node.nodeType===4){
_8e5.push(node.nodeValue);
}
}
return _8e5;
}else{
_8e3=this._getAttribute(_8e4.nodeName,_8e3);
if(_8e3.charAt(0)==="@"){
var name=_8e3.substring(1);
var _8ea=_8e4.getAttribute(name);
return (_8ea!==undefined)?[_8ea]:[];
}else{
var _8e5=[];
for(var i=0;i<_8e4.childNodes.length;i++){
var node=_8e4.childNodes[i];
if(node.nodeType===1&&node.nodeName===_8e3){
_8e5.push(this._getItem(node));
}
}
return _8e5;
}
}
}
}
},getAttributes:function(item){
var _8ec=item.element;
var _8ed=[];
_8ed.push("tagName");
if(_8ec.childNodes.length>0){
var _8ee={};
var _8ef=true;
var text=false;
for(var i=0;i<_8ec.childNodes.length;i++){
var node=_8ec.childNodes[i];
if(node.nodeType===1){
var name=node.nodeName;
if(!_8ee[name]){
_8ed.push(name);
_8ee[name]=name;
}
_8ef=true;
}else{
if(node.nodeType===3){
text=true;
}
}
}
if(_8ef){
_8ed.push("childNodes");
}
if(text){
_8ed.push("text()");
}
}
for(var i=0;i<_8ec.attributes.length;i++){
_8ed.push("@"+_8ec.attributes[i].nodeName);
}
if(this._attributeMap){
for(var key in this._attributeMap){
var i=key.indexOf(".");
if(i>0){
var _8f5=key.substring(0,i);
if(_8f5===_8ec.nodeName){
_8ed.push(key.substring(i+1));
}
}else{
_8ed.push(key);
}
}
}
return _8ed;
},hasAttribute:function(item,_8f7){
return (this.getValue(item,_8f7)!==undefined);
},containsValue:function(item,_8f9,_8fa){
var _8fb=this.getValues(item,_8f9);
for(var i=0;i<_8fb.length;i++){
if((typeof _8fa==="string")){
if(_8fb[i].toString&&_8fb[i].toString()===_8fa){
return true;
}
}else{
if(_8fb[i]===_8fa){
return true;
}
}
}
return false;
},isItem:function(_8fd){
if(_8fd&&_8fd.element&&_8fd.store&&_8fd.store===this){
return true;
}
return false;
},isItemLoaded:function(_8fe){
return this.isItem(_8fe);
},loadItem:function(_8ff){
},getFeatures:function(){
var _900={"dojo.data.api.Read":true,"dojo.data.api.Write":true};
return _900;
},getLabel:function(item){
if((this.label!=="")&&this.isItem(item)){
var _902=this.getValue(item,this.label);
if(_902){
return _902.toString();
}
}
return undefined;
},getLabelAttributes:function(item){
if(this.label!==""){
return [this.label];
}
return null;
},_fetchItems:function(_904,_905,_906){
var url=this._getFetchUrl(_904);
console.log("XmlStore._fetchItems(): url="+url);
if(!url){
_906(new Error("No URL specified."));
return;
}
var _908=(!this.sendQuery?_904:null);
var self=this;
var _90a={url:url,handleAs:"xml",preventCache:true};
var _90b=dojo.xhrGet(_90a);
_90b.addCallback(function(data){
var _90d=self._getItems(data,_908);
console.log("XmlStore._fetchItems(): length="+(_90d?_90d.length:0));
if(_90d&&_90d.length>0){
_905(_90d,_904);
}else{
_905([],_904);
}
});
_90b.addErrback(function(data){
_906(data,_904);
});
},_getFetchUrl:function(_90f){
if(!this.sendQuery){
return this.url;
}
var _910=_90f.query;
if(!_910){
return this.url;
}
if(dojo.isString(_910)){
return this.url+_910;
}
var _911="";
for(var name in _910){
var _913=_910[name];
if(_913){
if(_911){
_911+="&";
}
_911+=(name+"="+_913);
}
}
if(!_911){
return this.url;
}
var _914=this.url;
if(_914.indexOf("?")<0){
_914+="?";
}else{
_914+="&";
}
return _914+_911;
},_getItems:function(_915,_916){
var _917=null;
if(_916){
_917=_916.query;
}
var _918=[];
var _919=null;
console.log("Looking up root item: "+this.rootItem);
if(this.rootItem!==""){
_919=_915.getElementsByTagName(this.rootItem);
}else{
_919=_915.documentElement.childNodes;
}
for(var i=0;i<_919.length;i++){
var node=_919[i];
if(node.nodeType!=1){
continue;
}
var item=this._getItem(node);
if(_917){
var _91d=true;
var _91e=_916.queryOptions?_916.queryOptions.ignoreCase:false;
var _91f={};
for(var key in _917){
var _921=_917[key];
if(typeof _921==="string"){
_91f[key]=dojo.data.util.filter.patternToRegExp(_921,_91e);
}
}
for(var _922 in _917){
var _921=this.getValue(item,_922);
if(_921){
var _923=_917[_922];
if((typeof _921)==="string"&&(_91f[_922])){
if((_921.match(_91f[_922]))!==null){
continue;
}
}else{
if((typeof _921)==="object"){
if(_921.toString&&(_91f[_922])){
var _924=_921.toString();
if((_924.match(_91f[_922]))!==null){
continue;
}
}else{
if(_923==="*"||_923===_921){
continue;
}
}
}
}
}
_91d=false;
break;
}
if(!_91d){
continue;
}
}
_918.push(item);
}
dojo.forEach(_918,function(item){
item.element.parentNode.removeChild(item.element);
},this);
return _918;
},close:function(_926){
},newItem:function(_927){
console.log("XmlStore.newItem()");
_927=(_927||{});
var _928=_927.tagName;
if(!_928){
_928=this.rootItem;
if(_928===""){
return null;
}
}
var _929=this._getDocument();
var _92a=_929.createElement(_928);
for(var _92b in _927){
if(_92b==="tagName"){
continue;
}else{
if(_92b==="text()"){
var text=_929.createTextNode(_927[_92b]);
_92a.appendChild(text);
}else{
_92b=this._getAttribute(_928,_92b);
if(_92b.charAt(0)==="@"){
var name=_92b.substring(1);
_92a.setAttribute(name,_927[_92b]);
}else{
var _92e=_929.createElement(_92b);
var text=_929.createTextNode(_927[_92b]);
_92e.appendChild(text);
_92a.appendChild(_92e);
}
}
}
}
var item=this._getItem(_92a);
this._newItems.push(item);
return item;
},deleteItem:function(item){
console.log("XmlStore.deleteItem()");
var _931=item.element;
if(_931.parentNode){
this._backupItem(item);
_931.parentNode.removeChild(_931);
return true;
}
this._forgetItem(item);
this._deletedItems.push(item);
return true;
},setValue:function(item,_933,_934){
if(_933==="tagName"){
return false;
}
this._backupItem(item);
var _935=item.element;
if(_933==="childNodes"){
var _936=_934.element;
_935.appendChild(_936);
}else{
if(_933==="text()"){
while(_935.firstChild){
_935.removeChild(_935.firstChild);
}
var text=this._getDocument(_935).createTextNode(_934);
_935.appendChild(text);
}else{
_933=this._getAttribute(_935.nodeName,_933);
if(_933.charAt(0)==="@"){
var name=_933.substring(1);
_935.setAttribute(name,_934);
}else{
var _936=null;
for(var i=0;i<_935.childNodes.length;i++){
var node=_935.childNodes[i];
if(node.nodeType===1&&node.nodeName===_933){
_936=node;
break;
}
}
var _93b=this._getDocument(_935);
if(_936){
while(_936.firstChild){
_936.removeChild(_936.firstChild);
}
}else{
_936=_93b.createElement(_933);
_935.appendChild(_936);
}
var text=_93b.createTextNode(_934);
_936.appendChild(text);
}
}
}
return true;
},setValues:function(item,_93d,_93e){
if(_93d==="tagName"){
return false;
}
this._backupItem(item);
var _93f=item.element;
if(_93d==="childNodes"){
while(_93f.firstChild){
_93f.removeChild(_93f.firstChild);
}
for(var i=0;i<_93e.length;i++){
var _941=_93e[i].element;
_93f.appendChild(_941);
}
}else{
if(_93d==="text()"){
while(_93f.firstChild){
_93f.removeChild(_93f.firstChild);
}
var _942="";
for(var i=0;i<_93e.length;i++){
_942+=_93e[i];
}
var text=this._getDocument(_93f).createTextNode(_942);
_93f.appendChild(text);
}else{
_93d=this._getAttribute(_93f.nodeName,_93d);
if(_93d.charAt(0)==="@"){
var name=_93d.substring(1);
_93f.setAttribute(name,_93e[0]);
}else{
for(var i=_93f.childNodes.length-1;i>=0;i--){
var node=_93f.childNodes[i];
if(node.nodeType===1&&node.nodeName===_93d){
_93f.removeChild(node);
}
}
var _946=this._getDocument(_93f);
for(var i=0;i<_93e.length;i++){
var _941=_946.createElement(_93d);
var text=_946.createTextNode(_93e[i]);
_941.appendChild(text);
_93f.appendChild(_941);
}
}
}
}
return true;
},unsetAttribute:function(item,_948){
if(_948==="tagName"){
return false;
}
this._backupItem(item);
var _949=item.element;
if(_948==="childNodes"||_948==="text()"){
while(_949.firstChild){
_949.removeChild(_949.firstChild);
}
}else{
_948=this._getAttribute(_949.nodeName,_948);
if(_948.charAt(0)==="@"){
var name=_948.substring(1);
_949.removeAttribute(name);
}else{
for(var i=_949.childNodes.length-1;i>=0;i--){
var node=_949.childNodes[i];
if(node.nodeType===1&&node.nodeName===_948){
_949.removeChild(node);
}
}
}
}
return true;
},save:function(_94d){
if(!_94d){
_94d={};
}
for(var i=0;i<this._modifiedItems.length;i++){
this._saveItem(this._modifiedItems[i],_94d,"PUT");
}
for(var i=0;i<this._newItems.length;i++){
var item=this._newItems[i];
if(item.element.parentNode){
this._newItems.splice(i,1);
i--;
continue;
}
this._saveItem(this._newItems[i],_94d,"POST");
}
for(var i=0;i<this._deletedItems.length;i++){
this._saveItem(this._deletedItems[i],_94d,"DELETE");
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
var _951=this._getRootElement(item.element);
return (this._getItemIndex(this._newItems,_951)>=0||this._getItemIndex(this._deletedItems,_951)>=0||this._getItemIndex(this._modifiedItems,_951)>=0);
}else{
return (this._newItems.length>0||this._deletedItems.length>0||this._modifiedItems.length>0);
}
},_saveItem:function(item,_953,_954){
var url;
if(_954==="PUT"){
url=this._getPutUrl(item);
}else{
if(_954==="DELETE"){
url=this._getDeleteUrl(item);
}else{
url=this._getPostUrl(item);
}
}
if(!url){
if(_953.onError){
_953.onError.call(_956,new Error("No URL for saving content: "+this._getPostContent(item)));
}
return;
}
var _957={url:url,method:(_954||"POST"),contentType:"text/xml",handleAs:"xml"};
var _958;
if(_954==="PUT"){
_957.putData=this._getPutContent(item);
_958=dojo.rawXhrPut(_957);
}else{
if(_954==="DELETE"){
_958=dojo.xhrDelete(_957);
}else{
_957.postData=this._getPostContent(item);
_958=dojo.rawXhrPost(_957);
}
}
var _956=(_953.scope||dojo.global);
var self=this;
_958.addCallback(function(data){
self._forgetItem(item);
if(_953.onComplete){
_953.onComplete.call(_956);
}
});
_958.addErrback(function(_95b){
if(_953.onError){
_953.onError.call(_956,_95b);
}
});
},_getPostUrl:function(item){
return this.url;
},_getPutUrl:function(item){
return this.url;
},_getDeleteUrl:function(item){
var url=this.url;
if(item&&this.keyAttribute!==""){
var _960=this.getValue(item,this.keyAttribute);
if(_960){
var key=this.keyAttribute.charAt(0)==="@"?this.keyAttribute.substring(1):this.keyAttribute;
url+=url.indexOf("?")<0?"?":"&";
url+=key+"="+_960;
}
}
return url;
},_getPostContent:function(item){
var _963=item.element;
var _964="<?xml version=\"1.0\"?>";
return _964+dojox.data.dom.innerXML(_963);
},_getPutContent:function(item){
var _966=item.element;
var _967="<?xml version=\"1.0\"?>";
return _967+dojox.data.dom.innerXML(_966);
},_getAttribute:function(_968,_969){
if(this._attributeMap){
var key=_968+"."+_969;
var _96b=this._attributeMap[key];
if(_96b){
_969=_96b;
}else{
_96b=this._attributeMap[_969];
if(_96b){
_969=_96b;
}
}
}
return _969;
},_getItem:function(_96c){
return new dojox.data.XmlItem(_96c,this);
},_getItemIndex:function(_96d,_96e){
for(var i=0;i<_96d.length;i++){
if(_96d[i].element===_96e){
return i;
}
}
return -1;
},_backupItem:function(item){
var _971=this._getRootElement(item.element);
if(this._getItemIndex(this._newItems,_971)>=0||this._getItemIndex(this._modifiedItems,_971)>=0){
return;
}
if(_971!=item.element){
item=this._getItem(_971);
}
item._backup=_971.cloneNode(true);
this._modifiedItems.push(item);
},_restoreItems:function(_972){
dojo.forEach(_972,function(item){
if(item._backup){
item.element=item._backup;
item._backup=null;
}
},this);
},_forgetItem:function(item){
var _975=item.element;
var _976=this._getItemIndex(this._newItems,_975);
if(_976>=0){
this._newItems.splice(_976,1);
}
_976=this._getItemIndex(this._deletedItems,_975);
if(_976>=0){
this._deletedItems.splice(_976,1);
}
_976=this._getItemIndex(this._modifiedItems,_975);
if(_976>=0){
this._modifiedItems.splice(_976,1);
}
},_getDocument:function(_977){
if(_977){
return _977.ownerDocument;
}else{
if(!this._document){
return dojox.data.dom.createDocument();
}
}
},_getRootElement:function(_978){
while(_978.parentNode){
_978=_978.parentNode;
}
return _978;
}});
dojo.declare("dojox.data.XmlItem",null,{constructor:function(_979,_97a){
this.element=_979;
this.store=_97a;
},toString:function(){
var str="";
if(this.element){
for(var i=0;i<this.element.childNodes.length;i++){
var node=this.element.childNodes[i];
if(node.nodeType===3||node.nodeType===4){
str=node.nodeValue;
break;
}
}
}
return str;
}});
dojo.extend(dojox.data.XmlStore,dojo.data.util.simpleFetch);
}
if(!dojo._hasResource["dojox.gfx.matrix"]){
dojo._hasResource["dojox.gfx.matrix"]=true;
dojo.provide("dojox.gfx.matrix");
(function(){
var m=dojox.gfx.matrix;
m._degToRad=function(_97f){
return Math.PI*_97f/180;
};
m._radToDeg=function(_980){
return _980/Math.PI*180;
};
m.Matrix2D=function(arg){
if(arg){
if(typeof arg=="number"){
this.xx=this.yy=arg;
}else{
if(arg instanceof Array){
if(arg.length>0){
var _982=m.normalize(arg[0]);
for(var i=1;i<arg.length;++i){
var l=_982,r=dojox.gfx.matrix.normalize(arg[i]);
_982=new m.Matrix2D();
_982.xx=l.xx*r.xx+l.xy*r.yx;
_982.xy=l.xx*r.xy+l.xy*r.yy;
_982.yx=l.yx*r.xx+l.yy*r.yx;
_982.yy=l.yx*r.xy+l.yy*r.yy;
_982.dx=l.xx*r.dx+l.xy*r.dy+l.dx;
_982.dy=l.yx*r.dx+l.yy*r.dy+l.dy;
}
dojo.mixin(this,_982);
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
},rotate:function(_98a){
var c=Math.cos(_98a);
var s=Math.sin(_98a);
return new m.Matrix2D({xx:c,xy:-s,yx:s,yy:c});
},rotateg:function(_98d){
return m.rotate(m._degToRad(_98d));
},skewX:function(_98e){
return new m.Matrix2D({xy:Math.tan(_98e)});
},skewXg:function(_98f){
return m.skewX(m._degToRad(_98f));
},skewY:function(_990){
return new m.Matrix2D({yx:Math.tan(_990)});
},skewYg:function(_991){
return m.skewY(m._degToRad(_991));
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
},normalize:function(_99e){
return (_99e instanceof m.Matrix2D)?_99e:new m.Matrix2D(_99e);
},clone:function(_99f){
var obj=new m.Matrix2D();
for(var i in _99f){
if(typeof (_99f[i])=="number"&&typeof (obj[i])=="number"&&obj[i]!=_99f[i]){
obj[i]=_99f[i];
}
}
return obj;
},invert:function(_9a2){
var M=m.normalize(_9a2),D=M.xx*M.yy-M.xy*M.yx,M=new m.Matrix2D({xx:M.yy/D,xy:-M.xy/D,yx:-M.yx/D,yy:M.xx/D,dx:(M.xy*M.dy-M.yy*M.dx)/D,dy:(M.yx*M.dx-M.xx*M.dy)/D});
return M;
},_multiplyPoint:function(_9a5,x,y){
return {x:_9a5.xx*x+_9a5.xy*y+_9a5.dx,y:_9a5.yx*x+_9a5.yy*y+_9a5.dy};
},multiplyPoint:function(_9a8,a,b){
var M=m.normalize(_9a8);
if(typeof a=="number"&&typeof b=="number"){
return m._multiplyPoint(M,a,b);
}
return m._multiplyPoint(M,a.x,a.y);
},multiply:function(_9ac){
var M=m.normalize(_9ac);
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
},_sandwich:function(_9b1,x,y){
return m.multiply(m.translate(x,y),_9b1,m.translate(-x,-y));
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
},rotateAt:function(_9b8,a,b){
if(arguments.length>2){
return m._sandwich(m.rotate(_9b8),a,b);
}
return m._sandwich(m.rotate(_9b8),a.x,a.y);
},rotategAt:function(_9bb,a,b){
if(arguments.length>2){
return m._sandwich(m.rotateg(_9bb),a,b);
}
return m._sandwich(m.rotateg(_9bb),a.x,a.y);
},skewXAt:function(_9be,a,b){
if(arguments.length>2){
return m._sandwich(m.skewX(_9be),a,b);
}
return m._sandwich(m.skewX(_9be),a.x,a.y);
},skewXgAt:function(_9c1,a,b){
if(arguments.length>2){
return m._sandwich(m.skewXg(_9c1),a,b);
}
return m._sandwich(m.skewXg(_9c1),a.x,a.y);
},skewYAt:function(_9c4,a,b){
if(arguments.length>2){
return m._sandwich(m.skewY(_9c4),a,b);
}
return m._sandwich(m.skewY(_9c4),a.x,a.y);
},skewYgAt:function(_9c7,a,b){
if(arguments.length>2){
return m._sandwich(m.skewYg(_9c7),a,b);
}
return m._sandwich(m.skewYg(_9c7),a.x,a.y);
}});
})();
dojox.gfx.Matrix2D=dojox.gfx.matrix.Matrix2D;
}
if(!dojo._hasResource["dojox.gfx._base"]){
dojo._hasResource["dojox.gfx._base"]=true;
dojo.provide("dojox.gfx._base");
(function(){
var g=dojox.gfx,b=g._base;
g._hasClass=function(node,_9cd){
return ((" "+node.getAttribute("className")+" ").indexOf(" "+_9cd+" ")>=0);
};
g._addClass=function(node,_9cf){
var cls=node.getAttribute("className");
if((" "+cls+" ").indexOf(" "+_9cf+" ")<0){
node.setAttribute("className",cls+(cls?" ":"")+_9cf);
}
};
g._removeClass=function(node,_9d2){
node.setAttribute("className",node.getAttribute("className").replace(new RegExp("(^|\\s+)"+_9d2+"(\\s+|$)"),"$1$2"));
};
b._getFontMeasurements=function(){
var _9d3={"1em":0,"1ex":0,"100%":0,"12pt":0,"16px":0,"xx-small":0,"x-small":0,"small":0,"medium":0,"large":0,"x-large":0,"xx-large":0};
if(dojo.isIE){
dojo.doc.documentElement.style.fontSize="100%";
}
var div=dojo.doc.createElement("div");
div.style.position="absolute";
div.style.left="-100px";
div.style.top="0";
div.style.width="30px";
div.style.height="1000em";
div.style.border="0";
div.style.margin="0";
div.style.padding="0";
div.style.outline="0";
div.style.lineHeight="1";
div.style.overflow="hidden";
dojo.body().appendChild(div);
for(var p in _9d3){
div.style.fontSize=p;
_9d3[p]=Math.round(div.offsetHeight*12/16)*16/12/1000;
}
dojo.body().removeChild(div);
div=null;
return _9d3;
};
var _9d6=null;
b._getCachedFontMeasurements=function(_9d7){
if(_9d7||!_9d6){
_9d6=b._getFontMeasurements();
}
return _9d6;
};
var _9d8=null,_9d9={};
b._getTextBox=function(text,_9db,_9dc){
var m;
if(!_9d8){
m=_9d8=dojo.doc.createElement("div");
m.style.position="absolute";
m.style.left="-10000px";
m.style.top="0";
dojo.body().appendChild(m);
}else{
m=_9d8;
}
m.className="";
m.style.border="0";
m.style.margin="0";
m.style.padding="0";
m.style.outline="0";
if(arguments.length>1&&_9db){
for(var i in _9db){
if(i in _9d9){
continue;
}
m.style[i]=_9db[i];
}
}
if(arguments.length>2&&_9dc){
m.className=_9dc;
}
m.innerHTML=text;
return dojo.marginBox(m);
};
var _9df=0;
b._getUniqueId=function(){
var id;
do{
id=dojo._scopeName+"Unique"+(++_9df);
}while(dojo.byId(id));
return id;
};
})();
dojo.mixin(dojox.gfx,{defaultPath:{type:"path",path:""},defaultPolyline:{type:"polyline",points:[]},defaultRect:{type:"rect",x:0,y:0,width:100,height:100,r:0},defaultEllipse:{type:"ellipse",cx:0,cy:0,rx:200,ry:100},defaultCircle:{type:"circle",cx:0,cy:0,r:100},defaultLine:{type:"line",x1:0,y1:0,x2:100,y2:100},defaultImage:{type:"image",x:0,y:0,width:0,height:0,src:""},defaultText:{type:"text",x:0,y:0,text:"",align:"start",decoration:"none",rotated:false,kerning:true},defaultTextPath:{type:"textpath",text:"",align:"start",decoration:"none",rotated:false,kerning:true},defaultStroke:{type:"stroke",color:"black",style:"solid",width:1,cap:"butt",join:4},defaultLinearGradient:{type:"linear",x1:0,y1:0,x2:100,y2:100,colors:[{offset:0,color:"black"},{offset:1,color:"white"}]},defaultRadialGradient:{type:"radial",cx:0,cy:0,r:100,colors:[{offset:0,color:"black"},{offset:1,color:"white"}]},defaultPattern:{type:"pattern",x:0,y:0,width:0,height:0,src:""},defaultFont:{type:"font",style:"normal",variant:"normal",weight:"normal",size:"10pt",family:"serif"},normalizeColor:function(_9e1){
return (_9e1 instanceof dojo.Color)?_9e1:new dojo.Color(_9e1);
},normalizeParameters:function(_9e2,_9e3){
if(_9e3){
var _9e4={};
for(var x in _9e2){
if(x in _9e3&&!(x in _9e4)){
_9e2[x]=_9e3[x];
}
}
}
return _9e2;
},makeParameters:function(_9e6,_9e7){
if(!_9e7){
return dojo.clone(_9e6);
}
var _9e8={};
for(var i in _9e6){
if(!(i in _9e8)){
_9e8[i]=dojo.clone((i in _9e7)?_9e7[i]:_9e6[i]);
}
}
return _9e8;
},formatNumber:function(x,_9eb){
var val=x.toString();
if(val.indexOf("e")>=0){
val=x.toFixed(4);
}else{
var _9ed=val.indexOf(".");
if(_9ed>=0&&val.length-_9ed>5){
val=x.toFixed(4);
}
}
if(x<0){
return val;
}
return _9eb?" "+val:val;
},makeFontString:function(font){
return font.style+" "+font.variant+" "+font.weight+" "+font.size+" "+font.family;
},splitFontString:function(str){
var font=dojo.clone(dojox.gfx.defaultFont);
var t=str.split(/\s+/);
do{
if(t.length<5){
break;
}
font.style=t[0];
font.varian=t[1];
font.weight=t[2];
var i=t[3].indexOf("/");
font.size=i<0?t[3]:t[3].substring(0,i);
var j=4;
if(i<0){
if(t[4]=="/"){
j=6;
break;
}
if(t[4].substr(0,1)=="/"){
j=5;
break;
}
}
if(j+3>t.length){
break;
}
font.size=t[j];
font.family=t[j+1];
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
var _9f7=dojox.gfx.px_in_pt();
var val=parseFloat(len);
switch(len.slice(-2)){
case "px":
return val;
case "pt":
return val*_9f7;
case "in":
return val*72*_9f7;
case "pc":
return val*12*_9f7;
case "mm":
return val*dojox.gfx.mm_in_pt*_9f7;
case "cm":
return val*dojox.gfx.cm_in_pt*_9f7;
}
}
return parseFloat(len);
},pathVmlRegExp:/([A-Za-z]+)|(\d+(\.\d+)?)|(\.\d+)|(-\d+(\.\d+)?)|(-\.\d+)/g,pathSvgRegExp:/([A-Za-z])|(\d+(\.\d+)?)|(\.\d+)|(-\d+(\.\d+)?)|(-\.\d+)/g,equalSources:function(a,b){
return a&&b&&a==b;
}});
}
if(!dojo._hasResource["dojox.gfx"]){
dojo._hasResource["dojox.gfx"]=true;
dojo.provide("dojox.gfx");
dojo.loadInit(function(){
var gfx=dojo.getObject("dojox.gfx",true),sl,flag,_9fe;
if(!gfx.renderer){
var _9ff=(typeof dojo.config.gfxRenderer=="string"?dojo.config.gfxRenderer:"svg,vml,silverlight,canvas").split(",");
var ua=navigator.userAgent,_a01=0,_a02=0;
if(dojo.isSafari>=3){
if(ua.indexOf("iPhone")>=0||ua.indexOf("iPod")>=0){
_9fe=ua.match(/Version\/(\d(\.\d)?(\.\d)?)\sMobile\/([^\s]*)\s?/);
if(_9fe){
_a01=parseInt(_9fe[4].substr(0,3),16);
}
}
if(!_a01){
_9fe=ua.match(/Android\s+(\d+\.\d+)/);
if(_9fe){
_a02=parseFloat(_9fe[1]);
}
}
}
for(var i=0;i<_9ff.length;++i){
switch(_9ff[i]){
case "svg":
if(!dojo.isIE&&(!_a01||_a01>=1521)&&!_a02){
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
if(!dojo.isIE){
dojox.gfx.renderer="canvas";
}
break;
}
if(dojox.gfx.renderer){
break;
}
}
if(dojo.config.isDebug){
console.log("gfx renderer = "+dojox.gfx.renderer);
}
}
});
dojo.requireIf(dojox.gfx.renderer=="svg","dojox.gfx.svg");
dojo.requireIf(dojox.gfx.renderer=="vml","dojox.gfx.vml");
dojo.requireIf(dojox.gfx.renderer=="silverlight","dojox.gfx.silverlight");
dojo.requireIf(dojox.gfx.renderer=="canvas","dojox.gfx.canvas");
}
if(!dojo._hasResource["dojox.grid.compat._grid.lib"]){
dojo._hasResource["dojox.grid.compat._grid.lib"]=true;
dojo.provide("dojox.grid.compat._grid.lib");
dojo.mixin(dojox.grid,{na:"...",nop:function(){
},getTdIndex:function(td){
return td.cellIndex>=0?td.cellIndex:dojo.indexOf(td.parentNode.cells,td);
},getTrIndex:function(tr){
return tr.rowIndex>=0?tr.rowIndex:dojo.indexOf(tr.parentNode.childNodes,tr);
},getTr:function(_a06,_a07){
return _a06&&((_a06.rows||0)[_a07]||_a06.childNodes[_a07]);
},getTd:function(_a08,_a09,_a0a){
return (dojox.grid.getTr(inTable,_a09)||0)[_a0a];
},findTable:function(node){
for(var n=node;n&&n.tagName!="TABLE";n=n.parentNode){
}
return n;
},ascendDom:function(_a0d,_a0e){
for(var n=_a0d;n&&_a0e(n);n=n.parentNode){
}
return n;
},makeNotTagName:function(_a10){
var name=_a10.toUpperCase();
return function(node){
return node.tagName!=name;
};
},fire:function(ob,ev,args){
var fn=ob&&ev&&ob[ev];
return fn&&(args?fn.apply(ob,args):ob[ev]());
},setStyleText:function(_a17,_a18){
if(_a17.style.cssText==undefined){
_a17.setAttribute("style",_a18);
}else{
_a17.style.cssText=_a18;
}
},getStyleText:function(_a19,_a1a){
return (_a19.style.cssText==undefined?_a19.getAttribute("style"):_a19.style.cssText);
},setStyle:function(_a1b,_a1c,_a1d){
if(_a1b&&_a1b.style[_a1c]!=_a1d){
_a1b.style[_a1c]=_a1d;
}
},setStyleHeightPx:function(_a1e,_a1f){
if(_a1f>=0){
dojox.grid.setStyle(_a1e,"height",_a1f+"px");
}
},mouseEvents:["mouseover","mouseout","mousedown","mouseup","click","dblclick","contextmenu"],keyEvents:["keyup","keydown","keypress"],funnelEvents:function(_a20,_a21,_a22,_a23){
var evts=(_a23?_a23:dojox.grid.mouseEvents.concat(dojox.grid.keyEvents));
for(var i=0,l=evts.length;i<l;i++){
dojo.connect(_a20,"on"+evts[i],_a21,_a22);
}
},removeNode:function(_a27){
_a27=dojo.byId(_a27);
_a27&&_a27.parentNode&&_a27.parentNode.removeChild(_a27);
return _a27;
},getScrollbarWidth:function(){
if(this._scrollBarWidth){
return this._scrollBarWidth;
}
this._scrollBarWidth=18;
try{
var e=document.createElement("div");
e.style.cssText="top:0;left:0;width:100px;height:100px;overflow:scroll;position:absolute;visibility:hidden;";
document.body.appendChild(e);
this._scrollBarWidth=e.offsetWidth-e.clientWidth;
document.body.removeChild(e);
delete e;
}
catch(ex){
}
return this._scrollBarWidth;
},getRef:function(name,_a2a,_a2b){
var obj=_a2b||dojo.global,_a2d=name.split("."),prop=_a2d.pop();
for(var i=0,p;obj&&(p=_a2d[i]);i++){
obj=(p in obj?obj[p]:(_a2a?obj[p]={}:undefined));
}
return {obj:obj,prop:prop};
},getProp:function(name,_a32,_a33){
with(dojox.grid.getRef(name,_a32,_a33)){
return (obj)&&(prop)&&(prop in obj?obj[prop]:(_a32?obj[prop]={}:undefined));
}
},indexInParent:function(_a34){
var i=0,n,p=_a34.parentNode;
while((n=p.childNodes[i++])){
if(n==_a34){
return i-1;
}
}
return -1;
},cleanNode:function(_a38){
if(!_a38){
return;
}
var _a39=function(inW){
return inW.domNode&&dojo.isDescendant(inW.domNode,_a38,true);
};
var ws=dijit.registry.filter(_a39);
for(var i=0,w;(w=ws[i]);i++){
w.destroy();
}
delete ws;
},getTagName:function(_a3e){
var node=dojo.byId(_a3e);
return (node&&node.tagName?node.tagName.toLowerCase():"");
},nodeKids:function(_a40,_a41){
var _a42=[];
var i=0,n;
while((n=_a40.childNodes[i++])){
if(dojox.grid.getTagName(n)==_a41){
_a42.push(n);
}
}
return _a42;
},divkids:function(_a45){
return dojox.grid.nodeKids(_a45,"div");
},focusSelectNode:function(_a46){
try{
dojox.grid.fire(_a46,"focus");
dojox.grid.fire(_a46,"select");
}
catch(e){
}
},whenIdle:function(){
setTimeout(dojo.hitch.apply(dojo,arguments),0);
},arrayCompare:function(inA,inB){
for(var i=0,l=inA.length;i<l;i++){
if(inA[i]!=inB[i]){
return false;
}
}
return (inA.length==inB.length);
},arrayInsert:function(_a4b,_a4c,_a4d){
if(_a4b.length<=_a4c){
_a4b[_a4c]=_a4d;
}else{
_a4b.splice(_a4c,0,_a4d);
}
},arrayRemove:function(_a4e,_a4f){
_a4e.splice(_a4f,1);
},arraySwap:function(_a50,inI,inJ){
var _a53=_a50[inI];
_a50[inI]=_a50[inJ];
_a50[inJ]=_a53;
},initTextSizePoll:function(_a54){
var f=document.createElement("div");
with(f.style){
top="0px";
left="0px";
position="absolute";
visibility="hidden";
}
f.innerHTML="TheQuickBrownFoxJumpedOverTheLazyDog";
document.body.appendChild(f);
var fw=f.offsetWidth;
var job=function(){
if(f.offsetWidth!=fw){
fw=f.offsetWidth;
dojox.grid.textSizeChanged();
}
};
window.setInterval(job,_a54||200);
dojox.grid.initTextSizePoll=dojox.grid.nop;
},textSizeChanged:function(){
}});
dojox.grid.jobs={cancel:function(_a58){
if(_a58){
window.clearTimeout(_a58);
}
},jobs:[],job:function(_a59,_a5a,_a5b){
dojox.grid.jobs.cancelJob(_a59);
var job=function(){
delete dojox.grid.jobs.jobs[_a59];
_a5b();
};
dojox.grid.jobs.jobs[_a59]=setTimeout(job,_a5a);
},cancelJob:function(_a5d){
dojox.grid.jobs.cancel(dojox.grid.jobs.jobs[_a5d]);
}};
}
if(!dojo._hasResource["dojox.grid.compat._grid.scroller"]){
dojo._hasResource["dojox.grid.compat._grid.scroller"]=true;
dojo.provide("dojox.grid.compat._grid.scroller");
dojo.declare("dojox.grid.scroller.base",null,{constructor:function(){
this.pageHeights=[];
this.stack=[];
},rowCount:0,defaultRowHeight:10,keepRows:100,contentNode:null,scrollboxNode:null,defaultPageHeight:0,keepPages:10,pageCount:0,windowHeight:0,firstVisibleRow:0,lastVisibleRow:0,page:0,pageTop:0,init:function(_a5e,_a5f,_a60){
switch(arguments.length){
case 3:
this.rowsPerPage=_a60;
case 2:
this.keepRows=_a5f;
case 1:
this.rowCount=_a5e;
}
this.defaultPageHeight=this.defaultRowHeight*this.rowsPerPage;
this.pageCount=Math.ceil(this.rowCount/this.rowsPerPage);
this.setKeepInfo(this.keepRows);
this.invalidate();
if(this.scrollboxNode){
this.scrollboxNode.scrollTop=0;
this.scroll(0);
this.scrollboxNode.onscroll=dojo.hitch(this,"onscroll");
}
},setKeepInfo:function(_a61){
this.keepRows=_a61;
this.keepPages=!this.keepRows?this.keepRows:Math.max(Math.ceil(this.keepRows/this.rowsPerPage),2);
},invalidate:function(){
this.invalidateNodes();
this.pageHeights=[];
this.height=(this.pageCount?(this.pageCount-1)*this.defaultPageHeight+this.calcLastPageHeight():0);
this.resize();
},updateRowCount:function(_a62){
this.invalidateNodes();
this.rowCount=_a62;
oldPageCount=this.pageCount;
this.pageCount=Math.ceil(this.rowCount/this.rowsPerPage);
if(this.pageCount<oldPageCount){
for(var i=oldPageCount-1;i>=this.pageCount;i--){
this.height-=this.getPageHeight(i);
delete this.pageHeights[i];
}
}else{
if(this.pageCount>oldPageCount){
this.height+=this.defaultPageHeight*(this.pageCount-oldPageCount-1)+this.calcLastPageHeight();
}
}
this.resize();
},pageExists:function(_a64){
},measurePage:function(_a65){
},positionPage:function(_a66,_a67){
},repositionPages:function(_a68){
},installPage:function(_a69){
},preparePage:function(_a6a,_a6b,_a6c){
},renderPage:function(_a6d){
},removePage:function(_a6e){
},pacify:function(_a6f){
},pacifying:false,pacifyTicks:200,setPacifying:function(_a70){
if(this.pacifying!=_a70){
this.pacifying=_a70;
this.pacify(this.pacifying);
}
},startPacify:function(){
this.startPacifyTicks=new Date().getTime();
},doPacify:function(){
var _a71=(new Date().getTime()-this.startPacifyTicks)>this.pacifyTicks;
this.setPacifying(true);
this.startPacify();
return _a71;
},endPacify:function(){
this.setPacifying(false);
},resize:function(){
if(this.scrollboxNode){
this.windowHeight=this.scrollboxNode.clientHeight;
}
dojox.grid.setStyleHeightPx(this.contentNode,this.height);
},calcLastPageHeight:function(){
if(!this.pageCount){
return 0;
}
var _a72=this.pageCount-1;
var _a73=((this.rowCount%this.rowsPerPage)||(this.rowsPerPage))*this.defaultRowHeight;
this.pageHeights[_a72]=_a73;
return _a73;
},updateContentHeight:function(inDh){
this.height+=inDh;
this.resize();
},updatePageHeight:function(_a75){
if(this.pageExists(_a75)){
var oh=this.getPageHeight(_a75);
var h=(this.measurePage(_a75))||(oh);
this.pageHeights[_a75]=h;
if((h)&&(oh!=h)){
this.updateContentHeight(h-oh);
this.repositionPages(_a75);
}
}
},rowHeightChanged:function(_a78){
this.updatePageHeight(Math.floor(_a78/this.rowsPerPage));
},invalidateNodes:function(){
while(this.stack.length){
this.destroyPage(this.popPage());
}
},createPageNode:function(){
var p=document.createElement("div");
p.style.position="absolute";
p.style[dojo._isBodyLtr()?"left":"right"]="0";
return p;
},getPageHeight:function(_a7a){
var ph=this.pageHeights[_a7a];
return (ph!==undefined?ph:this.defaultPageHeight);
},pushPage:function(_a7c){
return this.stack.push(_a7c);
},popPage:function(){
return this.stack.shift();
},findPage:function(_a7d){
var i=0,h=0;
for(var ph=0;i<this.pageCount;i++,h+=ph){
ph=this.getPageHeight(i);
if(h+ph>=_a7d){
break;
}
}
this.page=i;
this.pageTop=h;
},buildPage:function(_a81,_a82,_a83){
this.preparePage(_a81,_a82);
this.positionPage(_a81,_a83);
this.installPage(_a81);
this.renderPage(_a81);
this.pushPage(_a81);
},needPage:function(_a84,_a85){
var h=this.getPageHeight(_a84),oh=h;
if(!this.pageExists(_a84)){
this.buildPage(_a84,this.keepPages&&(this.stack.length>=this.keepPages),_a85);
h=this.measurePage(_a84)||h;
this.pageHeights[_a84]=h;
if(h&&(oh!=h)){
this.updateContentHeight(h-oh);
}
}else{
this.positionPage(_a84,_a85);
}
return h;
},onscroll:function(){
this.scroll(this.scrollboxNode.scrollTop);
},scroll:function(_a88){
this.startPacify();
this.findPage(_a88);
var h=this.height;
var b=this.getScrollBottom(_a88);
for(var p=this.page,y=this.pageTop;(p<this.pageCount)&&((b<0)||(y<b));p++){
y+=this.needPage(p,y);
}
this.firstVisibleRow=this.getFirstVisibleRow(this.page,this.pageTop,_a88);
this.lastVisibleRow=this.getLastVisibleRow(p-1,y,b);
if(h!=this.height){
this.repositionPages(p-1);
}
this.endPacify();
},getScrollBottom:function(_a8d){
return (this.windowHeight>=0?_a8d+this.windowHeight:-1);
},processNodeEvent:function(e,_a8f){
var t=e.target;
while(t&&(t!=_a8f)&&t.parentNode&&(t.parentNode.parentNode!=_a8f)){
t=t.parentNode;
}
if(!t||!t.parentNode||(t.parentNode.parentNode!=_a8f)){
return false;
}
var page=t.parentNode;
e.topRowIndex=page.pageIndex*this.rowsPerPage;
e.rowIndex=e.topRowIndex+dojox.grid.indexInParent(t);
e.rowTarget=t;
return true;
},processEvent:function(e){
return this.processNodeEvent(e,this.contentNode);
},dummy:0});
dojo.declare("dojox.grid.scroller",dojox.grid.scroller.base,{constructor:function(){
this.pageNodes=[];
},renderRow:function(_a93,_a94){
},removeRow:function(_a95){
},getDefaultNodes:function(){
return this.pageNodes;
},getDefaultPageNode:function(_a96){
return this.getDefaultNodes()[_a96];
},positionPageNode:function(_a97,_a98){
_a97.style.top=_a98+"px";
},getPageNodePosition:function(_a99){
return _a99.offsetTop;
},repositionPageNodes:function(_a9a,_a9b){
var last=0;
for(var i=0;i<this.stack.length;i++){
last=Math.max(this.stack[i],last);
}
var n=_a9b[_a9a];
var y=(n?this.getPageNodePosition(n)+this.getPageHeight(_a9a):0);
for(var p=_a9a+1;p<=last;p++){
n=_a9b[p];
if(n){
if(this.getPageNodePosition(n)==y){
return;
}
this.positionPage(p,y);
}
y+=this.getPageHeight(p);
}
},invalidatePageNode:function(_aa1,_aa2){
var p=_aa2[_aa1];
if(p){
delete _aa2[_aa1];
this.removePage(_aa1,p);
dojox.grid.cleanNode(p);
p.innerHTML="";
}
return p;
},preparePageNode:function(_aa4,_aa5,_aa6){
var p=(_aa5===null?this.createPageNode():this.invalidatePageNode(_aa5,_aa6));
p.pageIndex=_aa4;
p.id=(this._pageIdPrefix||"")+"page-"+_aa4;
_aa6[_aa4]=p;
},pageExists:function(_aa8){
return Boolean(this.getDefaultPageNode(_aa8));
},measurePage:function(_aa9){
var p=this.getDefaultPageNode(_aa9);
var h=p.offsetHeight;
if(!this._defaultRowHeight){
if(p){
this._defaultRowHeight=8;
var fr=p.firstChild;
if(fr){
var text=dojo.doc.createTextNode("T");
fr.appendChild(text);
this._defaultRowHeight=fr.offsetHeight;
fr.removeChild(text);
}
}
}
return (this.rowsPerPage==h)?(h*this._defaultRowHeight):h;
},positionPage:function(_aae,_aaf){
this.positionPageNode(this.getDefaultPageNode(_aae),_aaf);
},repositionPages:function(_ab0){
this.repositionPageNodes(_ab0,this.getDefaultNodes());
},preparePage:function(_ab1,_ab2){
this.preparePageNode(_ab1,(_ab2?this.popPage():null),this.getDefaultNodes());
},installPage:function(_ab3){
this.contentNode.appendChild(this.getDefaultPageNode(_ab3));
},destroyPage:function(_ab4){
var p=this.invalidatePageNode(_ab4,this.getDefaultNodes());
dojox.grid.removeNode(p);
},renderPage:function(_ab6){
var node=this.pageNodes[_ab6];
for(var i=0,j=_ab6*this.rowsPerPage;(i<this.rowsPerPage)&&(j<this.rowCount);i++,j++){
this.renderRow(j,node);
}
},removePage:function(_aba){
for(var i=0,j=_aba*this.rowsPerPage;i<this.rowsPerPage;i++,j++){
this.removeRow(j);
}
},getPageRow:function(_abd){
return _abd*this.rowsPerPage;
},getLastPageRow:function(_abe){
return Math.min(this.rowCount,this.getPageRow(_abe+1))-1;
},getFirstVisibleRowNodes:function(_abf,_ac0,_ac1,_ac2){
var row=this.getPageRow(_abf);
var rows=dojox.grid.divkids(_ac2[_abf]);
for(var i=0,l=rows.length;i<l&&_ac0<_ac1;i++,row++){
_ac0+=rows[i].offsetHeight;
}
return (row?row-1:row);
},getFirstVisibleRow:function(_ac7,_ac8,_ac9){
if(!this.pageExists(_ac7)){
return 0;
}
return this.getFirstVisibleRowNodes(_ac7,_ac8,_ac9,this.getDefaultNodes());
},getLastVisibleRowNodes:function(_aca,_acb,_acc,_acd){
var row=this.getLastPageRow(_aca);
var rows=dojox.grid.divkids(_acd[_aca]);
for(var i=rows.length-1;i>=0&&_acb>_acc;i--,row--){
_acb-=rows[i].offsetHeight;
}
return row+1;
},getLastVisibleRow:function(_ad1,_ad2,_ad3){
if(!this.pageExists(_ad1)){
return 0;
}
return this.getLastVisibleRowNodes(_ad1,_ad2,_ad3,this.getDefaultNodes());
},findTopRowForNodes:function(_ad4,_ad5){
var rows=dojox.grid.divkids(_ad5[this.page]);
for(var i=0,l=rows.length,t=this.pageTop,h;i<l;i++){
h=rows[i].offsetHeight;
t+=h;
if(t>=_ad4){
this.offset=h-(t-_ad4);
return i+this.page*this.rowsPerPage;
}
}
return -1;
},findScrollTopForNodes:function(_adb,_adc){
var _add=Math.floor(_adb/this.rowsPerPage);
var t=0;
for(var i=0;i<_add;i++){
t+=this.getPageHeight(i);
}
this.pageTop=t;
this.needPage(_add,this.pageTop);
var rows=dojox.grid.divkids(_adc[_add]);
var r=_adb-this.rowsPerPage*_add;
for(var i=0,l=rows.length;i<l&&i<r;i++){
t+=rows[i].offsetHeight;
}
return t;
},findTopRow:function(_ae3){
return this.findTopRowForNodes(_ae3,this.getDefaultNodes());
},findScrollTop:function(_ae4){
return this.findScrollTopForNodes(_ae4,this.getDefaultNodes());
},dummy:0});
dojo.declare("dojox.grid.scroller.columns",dojox.grid.scroller,{constructor:function(_ae5){
this.setContentNodes(_ae5);
},setContentNodes:function(_ae6){
this.contentNodes=_ae6;
this.colCount=(this.contentNodes?this.contentNodes.length:0);
this.pageNodes=[];
for(var i=0;i<this.colCount;i++){
this.pageNodes[i]=[];
}
},getDefaultNodes:function(){
return this.pageNodes[0]||[];
},scroll:function(_ae8){
if(this.colCount){
dojox.grid.scroller.prototype.scroll.call(this,_ae8);
}
},resize:function(){
if(this.scrollboxNode){
this.windowHeight=this.scrollboxNode.clientHeight;
}
for(var i=0;i<this.colCount;i++){
dojox.grid.setStyleHeightPx(this.contentNodes[i],this.height);
}
},positionPage:function(_aea,_aeb){
for(var i=0;i<this.colCount;i++){
this.positionPageNode(this.pageNodes[i][_aea],_aeb);
}
},preparePage:function(_aed,_aee){
var p=(_aee?this.popPage():null);
for(var i=0;i<this.colCount;i++){
this.preparePageNode(_aed,p,this.pageNodes[i]);
}
},installPage:function(_af1){
for(var i=0;i<this.colCount;i++){
this.contentNodes[i].appendChild(this.pageNodes[i][_af1]);
}
},destroyPage:function(_af3){
for(var i=0;i<this.colCount;i++){
dojox.grid.removeNode(this.invalidatePageNode(_af3,this.pageNodes[i]));
}
},renderPage:function(_af5){
var _af6=[];
for(var i=0;i<this.colCount;i++){
_af6[i]=this.pageNodes[i][_af5];
}
for(var i=0,j=_af5*this.rowsPerPage;(i<this.rowsPerPage)&&(j<this.rowCount);i++,j++){
this.renderRow(j,_af6);
}
}});
}
if(!dojo._hasResource["dojox.grid.compat._grid.drag"]){
dojo._hasResource["dojox.grid.compat._grid.drag"]=true;
dojo.provide("dojox.grid.compat._grid.drag");
(function(){
var _af9=dojox.grid.drag={};
_af9.dragging=false;
_af9.hysteresis=2;
_af9.capture=function(_afa){
if(_afa.setCapture){
_afa.setCapture();
}else{
document.addEventListener("mousemove",_afa.onmousemove,true);
document.addEventListener("mouseup",_afa.onmouseup,true);
document.addEventListener("click",_afa.onclick,true);
}
};
_af9.release=function(_afb){
if(_afb.releaseCapture){
_afb.releaseCapture();
}else{
document.removeEventListener("click",_afb.onclick,true);
document.removeEventListener("mouseup",_afb.onmouseup,true);
document.removeEventListener("mousemove",_afb.onmousemove,true);
}
};
_af9.start=function(_afc,_afd,_afe,_aff,_b00){
if(!_afc||_af9.dragging){
console.debug("failed to start drag: bad input node or already dragging");
return;
}
_af9.dragging=true;
_af9.elt=_afc;
_af9.events={drag:_afd||dojox.grid.nop,end:_afe||dojox.grid.nop,start:_b00||dojox.grid.nop,oldmove:_afc.onmousemove,oldup:_afc.onmouseup,oldclick:_afc.onclick};
_af9.positionX=(_aff&&("screenX" in _aff)?_aff.screenX:false);
_af9.positionY=(_aff&&("screenY" in _aff)?_aff.screenY:false);
_af9.started=(_af9.position===false);
_afc.onmousemove=_af9.mousemove;
_afc.onmouseup=_af9.mouseup;
_afc.onclick=_af9.click;
_af9.capture(_af9.elt);
};
_af9.end=function(){
_af9.release(_af9.elt);
_af9.elt.onmousemove=_af9.events.oldmove;
_af9.elt.onmouseup=_af9.events.oldup;
_af9.elt.onclick=_af9.events.oldclick;
_af9.elt=null;
try{
if(_af9.started){
_af9.events.end();
}
}
finally{
_af9.dragging=false;
}
};
_af9.calcDelta=function(_b01){
_b01.deltaX=_b01.screenX-_af9.positionX;
_b01.deltaY=_b01.screenY-_af9.positionY;
};
_af9.hasMoved=function(_b02){
return Math.abs(_b02.deltaX)+Math.abs(_b02.deltaY)>_af9.hysteresis;
};
_af9.mousemove=function(_b03){
_b03=dojo.fixEvent(_b03);
dojo.stopEvent(_b03);
_af9.calcDelta(_b03);
if((!_af9.started)&&(_af9.hasMoved(_b03))){
_af9.events.start(_b03);
_af9.started=true;
}
if(_af9.started){
_af9.events.drag(_b03);
}
};
_af9.mouseup=function(_b04){
dojo.stopEvent(dojo.fixEvent(_b04));
_af9.end();
};
_af9.click=function(_b05){
dojo.stopEvent(dojo.fixEvent(_b05));
};
})();
}
if(!dojo._hasResource["dojox.grid.compat._grid.builder"]){
dojo._hasResource["dojox.grid.compat._grid.builder"]=true;
dojo.provide("dojox.grid.compat._grid.builder");
dojo.declare("dojox.grid.Builder",null,{constructor:function(_b06){
this.view=_b06;
this.grid=_b06.grid;
},view:null,_table:"<table class=\"dojoxGrid-row-table\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"wairole:presentation\">",generateCellMarkup:function(_b07,_b08,_b09,_b0a){
var _b0b=[],html;
if(_b0a){
html=["<th tabIndex=\"-1\" role=\"wairole:columnheader\""];
}else{
html=["<td tabIndex=\"-1\" role=\"wairole:gridcell\""];
}
_b07.colSpan&&html.push(" colspan=\"",_b07.colSpan,"\"");
_b07.rowSpan&&html.push(" rowspan=\"",_b07.rowSpan,"\"");
html.push(" class=\"dojoxGrid-cell ");
_b07.classes&&html.push(_b07.classes," ");
_b09&&html.push(_b09," ");
_b0b.push(html.join(""));
_b0b.push("");
html=["\" idx=\"",_b07.index,"\" style=\""];
html.push(_b07.styles,_b08||"");
_b07.unitWidth&&html.push("width:",_b07.unitWidth,";");
_b0b.push(html.join(""));
_b0b.push("");
html=["\""];
_b07.attrs&&html.push(" ",_b07.attrs);
html.push(">");
_b0b.push(html.join(""));
_b0b.push("");
_b0b.push("</td>");
return _b0b;
},isCellNode:function(_b0d){
return Boolean(_b0d&&_b0d.getAttribute&&_b0d.getAttribute("idx"));
},getCellNodeIndex:function(_b0e){
return _b0e?Number(_b0e.getAttribute("idx")):-1;
},getCellNode:function(_b0f,_b10){
for(var i=0,row;row=dojox.grid.getTr(_b0f.firstChild,i);i++){
for(var j=0,cell;cell=row.cells[j];j++){
if(this.getCellNodeIndex(cell)==_b10){
return cell;
}
}
}
},findCellTarget:function(_b15,_b16){
var n=_b15;
while(n&&(!this.isCellNode(n)||(dojox.grid.gridViewTag in n.offsetParent.parentNode&&n.offsetParent.parentNode[dojox.grid.gridViewTag]!=this.view.id))&&(n!=_b16)){
n=n.parentNode;
}
return n!=_b16?n:null;
},baseDecorateEvent:function(e){
e.dispatch="do"+e.type;
e.grid=this.grid;
e.sourceView=this.view;
e.cellNode=this.findCellTarget(e.target,e.rowNode);
e.cellIndex=this.getCellNodeIndex(e.cellNode);
e.cell=(e.cellIndex>=0?this.grid.getCell(e.cellIndex):null);
},findTarget:function(_b19,_b1a){
var n=_b19;
while(n&&(n!=this.domNode)&&(!(_b1a in n)||(dojox.grid.gridViewTag in n&&n[dojox.grid.gridViewTag]!=this.view.id))){
n=n.parentNode;
}
return (n!=this.domNode)?n:null;
},findRowTarget:function(_b1c){
return this.findTarget(_b1c,dojox.grid.rowIndexTag);
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
dojo.declare("dojox.grid.contentBuilder",dojox.grid.Builder,{update:function(){
this.prepareHtml();
},prepareHtml:function(){
var _b24=this.grid.get,rows=this.view.structure.rows;
for(var j=0,row;(row=rows[j]);j++){
for(var i=0,cell;(cell=row[i]);i++){
cell.get=cell.get||(cell.value==undefined)&&_b24;
cell.markup=this.generateCellMarkup(cell,cell.cellStyles,cell.cellClasses,false);
}
}
},generateHtml:function(_b2a,_b2b){
var html=[this._table],v=this.view,obr=v.onBeforeRow,rows=v.structure.rows;
obr&&obr(_b2b,rows);
for(var j=0,row;(row=rows[j]);j++){
if(row.hidden||row.header){
continue;
}
html.push(!row.invisible?"<tr>":"<tr class=\"dojoxGrid-invisible\">");
for(var i=0,cell,m,cc,cs;(cell=row[i]);i++){
m=cell.markup,cc=cell.customClasses=[],cs=cell.customStyles=[];
m[5]=cell.format(_b2a);
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
e.rowIndex=e.rowNode[dojox.grid.rowIndexTag];
this.baseDecorateEvent(e);
e.cell=this.grid.getCell(e.cellIndex);
return true;
}});
dojo.declare("dojox.grid.headerBuilder",dojox.grid.Builder,{bogusClickTime:0,overResizeWidth:4,minColWidth:1,_table:"<table class=\"dojoxGrid-row-table\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"wairole:presentation\"",update:function(){
this.tableMap=new dojox.grid.tableMap(this.view.structure.rows);
},generateHtml:function(_b38,_b39){
var html=[this._table],rows=this.view.structure.rows;
if(this.view.viewWidth){
html.push([" style=\"width:",this.view.viewWidth,";\""].join(""));
}
html.push(">");
dojox.grid.fire(this.view,"onBeforeRow",[-1,rows]);
for(var j=0,row;(row=rows[j]);j++){
if(row.hidden){
continue;
}
html.push(!row.invisible?"<tr>":"<tr class=\"dojoxGrid-invisible\">");
for(var i=0,cell,_b40;(cell=row[i]);i++){
cell.customClasses=[];
cell.customStyles=[];
_b40=this.generateCellMarkup(cell,cell.headerStyles,cell.headerClasses,true);
_b40[5]=(_b39!=undefined?_b39:_b38(cell));
_b40[3]=cell.customStyles.join(";");
_b40[1]=cell.customClasses.join(" ");
html.push(_b40.join(""));
}
html.push("</tr>");
}
html.push("</table>");
return html.join("");
},getCellX:function(e){
var x=e.layerX;
if(dojo.isMoz){
var n=dojox.grid.ascendDom(e.target,dojox.grid.makeNotTagName("th"));
x-=(n&&n.offsetLeft)||0;
var t=e.sourceView.getScrollbarWidth();
if(!dojo._isBodyLtr()&&e.sourceView.headerNode.scrollLeft<t){
x-=t;
}
}
var n=dojox.grid.ascendDom(e.target,function(){
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
var i=dojox.grid.getTdIndex(e.cellNode);
e.cellNode=(i?e.cellNode.parentNode.cells[i+mod]:null);
e.cellIndex=(e.cellNode?this.getCellNodeIndex(e.cellNode):-1);
return Boolean(e.cellNode);
},canResize:function(e){
if(!e.cellNode||e.cellNode.colSpan>1){
return false;
}
var cell=this.grid.getCell(e.cellIndex);
return !cell.noresize&&!cell.isFlex();
},overLeftResizeArea:function(e){
if(dojo._isBodyLtr()){
return (e.cellIndex>0)&&(e.cellX<this.overResizeWidth)&&this.prepareResize(e,-1);
}
return t=e.cellNode&&(e.cellX<this.overResizeWidth);
},overRightResizeArea:function(e){
if(dojo._isBodyLtr()){
return e.cellNode&&(e.cellX>=e.cellNode.offsetWidth-this.overResizeWidth);
}
return (e.cellIndex>0)&&(e.cellX>=e.cellNode.offsetWidth-this.overResizeWidth)&&this.prepareResize(e,-1);
},domousemove:function(e){
var c=(this.overRightResizeArea(e)?"e-resize":(this.overLeftResizeArea(e)?"w-resize":""));
if(c&&!this.canResize(e)){
c="not-allowed";
}
e.sourceView.headerNode.style.cursor=c||"";
if(c){
dojo.stopEvent(e);
}
},domousedown:function(e){
if(!dojox.grid.drag.dragging){
if((this.overRightResizeArea(e)||this.overLeftResizeArea(e))&&this.canResize(e)){
this.beginColumnResize(e);
}else{
this.grid.onMouseDown(e);
this.grid.onMouseOverRow(e);
}
}
},doclick:function(e){
if(new Date().getTime()<this.bogusClickTime){
dojo.stopEvent(e);
return true;
}
},beginColumnResize:function(e){
dojo.stopEvent(e);
var _b52=[],_b53=this.tableMap.findOverlappingNodes(e.cellNode);
for(var i=0,cell;(cell=_b53[i]);i++){
_b52.push({node:cell,index:this.getCellNodeIndex(cell),width:cell.offsetWidth});
}
var drag={scrollLeft:e.sourceView.headerNode.scrollLeft,view:e.sourceView,node:e.cellNode,index:e.cellIndex,w:e.cellNode.clientWidth,spanners:_b52};
dojox.grid.drag.start(e.cellNode,dojo.hitch(this,"doResizeColumn",drag),dojo.hitch(this,"endResizeColumn",drag),e);
},doResizeColumn:function(_b57,_b58){
var _b59=dojo._isBodyLtr();
if(_b59){
var w=_b57.w+_b58.deltaX;
}else{
var w=_b57.w-_b58.deltaX;
}
if(w>=this.minColWidth){
for(var i=0,s,sw;(s=_b57.spanners[i]);i++){
if(_b59){
sw=s.width+_b58.deltaX;
}else{
sw=s.width-_b58.deltaX;
}
s.node.style.width=sw+"px";
_b57.view.setColWidth(s.index,sw);
}
_b57.node.style.width=w+"px";
_b57.view.setColWidth(_b57.index,w);
if(!_b59){
_b57.view.headerNode.scrollLeft=(_b57.scrollLeft-_b58.deltaX);
}
}
if(_b57.view.flexCells&&!_b57.view.testFlexCells()){
var t=dojox.grid.findTable(_b57.node);
t&&(t.style.width="");
}
},endResizeColumn:function(_b5f){
this.bogusClickTime=new Date().getTime()+30;
setTimeout(dojo.hitch(_b5f.view,"update"),50);
}});
dojo.declare("dojox.grid.tableMap",null,{constructor:function(_b60){
this.mapRows(_b60);
},map:null,mapRows:function(_b61){
var _b62=_b61.length;
if(!_b62){
return;
}
this.map=[];
for(var j=0,row;(row=_b61[j]);j++){
this.map[j]=[];
}
for(var j=0,row;(row=_b61[j]);j++){
for(var i=0,x=0,cell,_b68,_b69;(cell=row[i]);i++){
while(this.map[j][x]){
x++;
}
this.map[j][x]={c:i,r:j};
_b69=cell.rowSpan||1;
_b68=cell.colSpan||1;
for(var y=0;y<_b69;y++){
for(var s=0;s<_b68;s++){
this.map[j+y][x+s]=this.map[j][x];
}
}
x+=_b68;
}
}
},dumpMap:function(){
for(var j=0,row,h="";(row=this.map[j]);j++,h=""){
for(var i=0,cell;(cell=row[i]);i++){
h+=cell.r+","+cell.c+"   ";
}
console.log(h);
}
},getMapCoords:function(_b71,_b72){
for(var j=0,row;(row=this.map[j]);j++){
for(var i=0,cell;(cell=row[i]);i++){
if(cell.c==_b72&&cell.r==_b71){
return {j:j,i:i};
}
}
}
return {j:-1,i:-1};
},getNode:function(_b77,_b78,_b79){
var row=_b77&&_b77.rows[_b78];
return row&&row.cells[_b79];
},_findOverlappingNodes:function(_b7b,_b7c,_b7d){
var _b7e=[];
var m=this.getMapCoords(_b7c,_b7d);
var row=this.map[m.j];
for(var j=0,row;(row=this.map[j]);j++){
if(j==m.j){
continue;
}
with(row[m.i]){
var n=this.getNode(_b7b,r,c);
if(n){
_b7e.push(n);
}
}
}
return _b7e;
},findOverlappingNodes:function(_b83){
return this._findOverlappingNodes(dojox.grid.findTable(_b83),dojox.grid.getTrIndex(_b83.parentNode),dojox.grid.getTdIndex(_b83));
}});
dojox.grid.rowIndexTag="gridRowIndex";
dojox.grid.gridViewTag="gridView";
}
if(!dojo._hasResource["dojox.grid.compat._grid.view"]){
dojo._hasResource["dojox.grid.compat._grid.view"]=true;
dojo.provide("dojox.grid.compat._grid.view");
dojo.declare("dojox.GridView",[dijit._Widget,dijit._Templated],{defaultWidth:"18em",viewWidth:"",templateString:"<div class=\"dojoxGrid-view\">\r\n\t<div class=\"dojoxGrid-header\" dojoAttachPoint=\"headerNode\">\r\n\t\t<div dojoAttachPoint=\"headerNodeContainer\" style=\"width:9000em\">\r\n\t\t\t<div dojoAttachPoint=\"headerContentNode\"></div>\r\n\t\t</div>\r\n\t</div>\r\n\t<input type=\"checkbox\" class=\"dojoxGrid-hidden-focus\" dojoAttachPoint=\"hiddenFocusNode\" />\r\n\t<input type=\"checkbox\" class=\"dojoxGrid-hidden-focus\" />\r\n\t<div class=\"dojoxGrid-scrollbox\" dojoAttachPoint=\"scrollboxNode\">\r\n\t\t<div class=\"dojoxGrid-content\" dojoAttachPoint=\"contentNode\" hidefocus=\"hidefocus\"></div>\r\n\t</div>\r\n</div>\r\n",themeable:false,classTag:"dojoxGrid",marginBottom:0,rowPad:2,postMixInProperties:function(){
this.rowNodes=[];
},postCreate:function(){
this.connect(this.scrollboxNode,"onscroll","doscroll");
dojox.grid.funnelEvents(this.contentNode,this,"doContentEvent",["mouseover","mouseout","click","dblclick","contextmenu","mousedown"]);
dojox.grid.funnelEvents(this.headerNode,this,"doHeaderEvent",["dblclick","mouseover","mouseout","mousemove","mousedown","click","contextmenu"]);
this.content=new dojox.grid.contentBuilder(this);
this.header=new dojox.grid.headerBuilder(this);
if(!dojo._isBodyLtr()){
this.headerNodeContainer.style.width="";
}
},destroy:function(){
dojox.grid.removeNode(this.headerNode);
this.inherited("destroy",arguments);
},focus:function(){
if(dojo.isSafari||dojo.isOpera){
this.hiddenFocusNode.focus();
}else{
this.scrollboxNode.focus();
}
},setStructure:function(_b84){
var vs=this.structure=_b84;
if(vs.width&&!isNaN(vs.width)){
this.viewWidth=vs.width+"em";
}else{
this.viewWidth=vs.width||this.viewWidth;
}
this.onBeforeRow=vs.onBeforeRow;
this.noscroll=vs.noscroll;
if(this.noscroll){
this.scrollboxNode.style.overflow="hidden";
}
this.testFlexCells();
this.updateStructure();
},testFlexCells:function(){
this.flexCells=false;
for(var j=0,row;(row=this.structure.rows[j]);j++){
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
return (this.noscroll?0:dojox.grid.getScrollbarWidth());
},getColumnsWidth:function(){
return this.headerContentNode.firstChild.offsetWidth;
},getWidth:function(){
return this.viewWidth||(this.getColumnsWidth()+this.getScrollbarWidth())+"px";
},getContentWidth:function(){
return Math.max(0,dojo._getContentBox(this.domNode).w-this.getScrollbarWidth())+"px";
},render:function(){
this.scrollboxNode.style.height="";
this.renderHeader();
},renderHeader:function(){
this.headerContentNode.innerHTML=this.header.generateHtml(this._getHeaderContent);
},_getHeaderContent:function(_b8a){
var n=_b8a.name||_b8a.grid.getCellName(_b8a);
if(_b8a.index!=_b8a.grid.getSortIndex()){
return n;
}
return ["<div class=\"",_b8a.grid.sortInfo>0?"dojoxGrid-sort-down":"dojoxGrid-sort-up","\"><div class=\"gridArrowButtonChar\">",_b8a.grid.sortInfo>0?"&#9660;":"&#9650;","</div>",n,"</div>"].join("");
},resize:function(){
this.adaptHeight();
this.adaptWidth();
},hasScrollbar:function(){
return (this.scrollboxNode.clientHeight!=this.scrollboxNode.offsetHeight);
},adaptHeight:function(){
if(!this.grid.autoHeight){
var h=this.domNode.clientHeight;
if(!this.hasScrollbar()){
h-=dojox.grid.getScrollbarWidth();
}
dojox.grid.setStyleHeightPx(this.scrollboxNode,h);
}
},adaptWidth:function(){
if(this.flexCells){
this.contentWidth=this.getContentWidth();
this.headerContentNode.firstChild.style.width=this.contentWidth;
}
var w=this.scrollboxNode.offsetWidth-this.getScrollbarWidth();
w=Math.max(w,this.getColumnsWidth())+"px";
with(this.contentNode){
style.width="";
offsetWidth;
style.width=w;
}
},setSize:function(w,h){
with(this.domNode.style){
if(w){
width=w;
}
height=(h>=0?h+"px":"");
}
with(this.headerNode.style){
if(w){
width=w;
}
}
},renderRow:function(_b90,_b91){
var _b92=this.createRowNode(_b90);
this.buildRow(_b90,_b92,_b91);
this.grid.edit.restore(this,_b90);
return _b92;
},createRowNode:function(_b93){
var node=document.createElement("div");
node.className=this.classTag+"-row";
node[dojox.grid.gridViewTag]=this.id;
node[dojox.grid.rowIndexTag]=_b93;
this.rowNodes[_b93]=node;
return node;
},buildRow:function(_b95,_b96){
this.buildRowContent(_b95,_b96);
this.styleRow(_b95,_b96);
},buildRowContent:function(_b97,_b98){
_b98.innerHTML=this.content.generateHtml(_b97,_b97);
if(this.flexCells){
_b98.firstChild.style.width=this.contentWidth;
}
},rowRemoved:function(_b99){
this.grid.edit.save(this,_b99);
delete this.rowNodes[_b99];
},getRowNode:function(_b9a){
return this.rowNodes[_b9a];
},getCellNode:function(_b9b,_b9c){
var row=this.getRowNode(_b9b);
if(row){
return this.content.getCellNode(row,_b9c);
}
},styleRow:function(_b9e,_b9f){
_b9f._style=dojox.grid.getStyleText(_b9f);
this.styleRowNode(_b9e,_b9f);
},styleRowNode:function(_ba0,_ba1){
if(_ba1){
this.doStyleRowNode(_ba0,_ba1);
}
},doStyleRowNode:function(_ba2,_ba3){
this.grid.styleRowNode(_ba2,_ba3);
},updateRow:function(_ba4,_ba5,_ba6){
var _ba7=this.getRowNode(_ba4);
if(_ba7){
_ba7.style.height="";
this.buildRow(_ba4,_ba7);
}
return _ba7;
},updateRowStyles:function(_ba8){
this.styleRowNode(_ba8,this.getRowNode(_ba8));
},lastTop:0,firstScroll:0,doscroll:function(_ba9){
var _baa=dojo._isBodyLtr();
if(this.firstScroll<2){
if((!_baa&&this.firstScroll==1)||(_baa&&this.firstScroll==0)){
var s=dojo.marginBox(this.headerNodeContainer);
if(dojo.isIE){
this.headerNodeContainer.style.width=s.w+this.getScrollbarWidth()+"px";
}else{
if(dojo.isMoz){
this.headerNodeContainer.style.width=s.w-this.getScrollbarWidth()+"px";
if(_baa){
this.scrollboxNode.scrollLeft=this.scrollboxNode.scrollWidth-this.scrollboxNode.clientWidth;
}else{
this.scrollboxNode.scrollLeft=this.scrollboxNode.clientWidth-this.scrollboxNode.scrollWidth;
}
}
}
}
this.firstScroll++;
}
this.headerNode.scrollLeft=this.scrollboxNode.scrollLeft;
var top=this.scrollboxNode.scrollTop;
if(top!=this.lastTop){
this.grid.scrollTo(top);
}
},setScrollTop:function(_bad){
this.lastTop=_bad;
this.scrollboxNode.scrollTop=_bad;
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
},setColWidth:function(_bb2,_bb3){
this.grid.setCellWidth(_bb2,_bb3+"px");
},update:function(){
var left=this.scrollboxNode.scrollLeft;
this.content.update();
this.grid.update();
this.scrollboxNode.scrollLeft=left;
this.headerNode.scrollLeft=left;
}});
}
if(!dojo._hasResource["dojox.grid.compat._grid.views"]){
dojo._hasResource["dojox.grid.compat._grid.views"]=true;
dojo.provide("dojox.grid.compat._grid.views");
dojo.declare("dojox.grid.views",null,{constructor:function(_bb5){
this.grid=_bb5;
},defaultWidth:200,views:[],resize:function(){
this.onEach("resize");
},render:function(){
this.onEach("render");
},addView:function(_bb6){
_bb6.idx=this.views.length;
this.views.push(_bb6);
},destroyViews:function(){
for(var i=0,v;v=this.views[i];i++){
v.destroy();
}
this.views=[];
},getContentNodes:function(){
var _bb9=[];
for(var i=0,v;v=this.views[i];i++){
_bb9.push(v.contentNode);
}
return _bb9;
},forEach:function(_bbc){
for(var i=0,v;v=this.views[i];i++){
_bbc(v,i);
}
},onEach:function(_bbf,_bc0){
_bc0=_bc0||[];
for(var i=0,v;v=this.views[i];i++){
if(_bbf in v){
v[_bbf].apply(v,_bc0);
}
}
},normalizeHeaderNodeHeight:function(){
var _bc3=[];
for(var i=0,v;(v=this.views[i]);i++){
if(v.headerContentNode.firstChild){
_bc3.push(v.headerContentNode);
}
}
this.normalizeRowNodeHeights(_bc3);
},normalizeRowNodeHeights:function(_bc6){
var h=0;
for(var i=0,n,o;(n=_bc6[i]);i++){
h=Math.max(h,(n.firstChild.clientHeight)||(n.firstChild.offsetHeight));
}
h=(h>=0?h:0);
var hpx=h+"px";
for(var i=0,n;(n=_bc6[i]);i++){
if(n.firstChild.clientHeight!=h){
n.firstChild.style.height=hpx;
}
}
if(_bc6&&_bc6[0]){
_bc6[0].parentNode.offsetHeight;
}
},resetHeaderNodeHeight:function(){
for(var i=0,v,n;(v=this.views[i]);i++){
n=v.headerContentNode.firstChild;
if(n){
n.style.height="";
}
}
},renormalizeRow:function(_bcf){
var _bd0=[];
for(var i=0,v,n;(v=this.views[i])&&(n=v.getRowNode(_bcf));i++){
n.firstChild.style.height="";
_bd0.push(n);
}
this.normalizeRowNodeHeights(_bd0);
},getViewWidth:function(_bd4){
return this.views[_bd4].getWidth()||this.defaultWidth;
},measureHeader:function(){
this.resetHeaderNodeHeight();
this.forEach(function(_bd5){
_bd5.headerContentNode.style.height="";
});
var h=0;
this.forEach(function(_bd7){
h=Math.max(_bd7.headerNode.offsetHeight,h);
});
return h;
},measureContent:function(){
var h=0;
this.forEach(function(_bd9){
h=Math.max(_bd9.domNode.offsetHeight,h);
});
return h;
},findClient:function(_bda){
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
var _be5=function(v,l){
with(v.domNode.style){
if(!dojo._isBodyLtr()){
right=l+"px";
}else{
left=l+"px";
}
top=0+"px";
}
with(v.headerNode.style){
if(!dojo._isBodyLtr()){
right=l+"px";
}else{
left=l+"px";
}
top=0;
}
};
for(i=0;(v=this.views[i])&&(i<c);i++){
vw=this.getViewWidth(i);
v.setSize(vw,0);
_be5(v,l);
vw=v.domNode.offsetWidth;
l+=vw;
}
i++;
var r=w;
for(var j=len-1;(v=this.views[j])&&(i<=j);j--){
vw=this.getViewWidth(j);
v.setSize(vw,0);
vw=v.domNode.offsetWidth;
r-=vw;
_be5(v,r);
}
if(c<len){
v=this.views[c];
vw=Math.max(1,r-l);
v.setSize(vw+"px",0);
_be5(v,l);
}
return l;
},renderRow:function(_bea,_beb){
var _bec=[];
for(var i=0,v,n,_bf0;(v=this.views[i])&&(n=_beb[i]);i++){
_bf0=v.renderRow(_bea);
n.appendChild(_bf0);
_bec.push(_bf0);
}
this.normalizeRowNodeHeights(_bec);
},rowRemoved:function(_bf1){
this.onEach("rowRemoved",[_bf1]);
},updateRow:function(_bf2,_bf3){
for(var i=0,v;v=this.views[i];i++){
v.updateRow(_bf2,_bf3);
}
this.renormalizeRow(_bf2);
},updateRowStyles:function(_bf6){
this.onEach("updateRowStyles",[_bf6]);
},setScrollTop:function(_bf7){
var top=_bf7;
for(var i=0,v;v=this.views[i];i++){
top=v.setScrollTop(_bf7);
}
return top;
},getFirstScrollingView:function(){
for(var i=0,v;(v=this.views[i]);i++){
if(v.hasScrollbar()){
return v;
}
}
}});
}
if(!dojo._hasResource["dojox.grid.compat._grid.cell"]){
dojo._hasResource["dojox.grid.compat._grid.cell"]=true;
dojo.provide("dojox.grid.compat._grid.cell");
dojo.declare("dojox.grid.cell",null,{styles:"",constructor:function(_bfd){
dojo.mixin(this,_bfd);
if(this.editor){
this.editor=new this.editor(this);
}
},format:function(_bfe){
var f,i=this.grid.edit.info,d=this.get?this.get(_bfe):this.value;
if(this.editor&&(this.editor.alwaysOn||(i.rowIndex==_bfe&&i.cell==this))){
return this.editor.format(d,_bfe);
}else{
return (f=this.formatter)?f.call(this,d,_bfe):d;
}
},getNode:function(_c02){
return this.view.getCellNode(_c02,this.index);
},isFlex:function(){
var uw=this.unitWidth;
return uw&&(uw=="auto"||uw.slice(-1)=="%");
},applyEdit:function(_c04,_c05){
this.grid.edit.applyCellEdit(_c04,this,_c05);
},cancelEdit:function(_c06){
this.grid.doCancelEdit(_c06);
},_onEditBlur:function(_c07){
if(this.grid.edit.isEditCell(_c07,this.index)){
this.grid.edit.apply();
}
},registerOnBlur:function(_c08,_c09){
if(this.commitOnBlur){
dojo.connect(_c08,"onblur",function(e){
setTimeout(dojo.hitch(this,"_onEditBlur",_c09),250);
});
}
}});
}
if(!dojo._hasResource["dojox.grid.compat._grid.layout"]){
dojo._hasResource["dojox.grid.compat._grid.layout"]=true;
dojo.provide("dojox.grid.compat._grid.layout");
dojo.declare("dojox.grid.layout",null,{constructor:function(_c0b){
this.grid=_c0b;
},cells:[],structure:null,defaultWidth:"6em",setStructure:function(_c0c){
this.fieldIndex=0;
this.cells=[];
var s=this.structure=[];
for(var i=0,_c0f,rows;(_c0f=_c0c[i]);i++){
s.push(this.addViewDef(_c0f));
}
this.cellCount=this.cells.length;
},addViewDef:function(_c11){
this._defaultCellProps=_c11.defaultCell||{};
return dojo.mixin({},_c11,{rows:this.addRowsDef(_c11.rows||_c11.cells)});
},addRowsDef:function(_c12){
var _c13=[];
for(var i=0,row;_c12&&(row=_c12[i]);i++){
_c13.push(this.addRowDef(i,row));
}
return _c13;
},addRowDef:function(_c16,_c17){
var _c18=[];
for(var i=0,def,cell;(def=_c17[i]);i++){
cell=this.addCellDef(_c16,i,def);
_c18.push(cell);
this.cells.push(cell);
}
return _c18;
},addCellDef:function(_c1c,_c1d,_c1e){
var w=0;
if(_c1e.colSpan>1){
w=0;
}else{
if(!isNaN(_c1e.width)){
w=_c1e.width+"em";
}else{
w=_c1e.width||this.defaultWidth;
}
}
var _c20=_c1e.field!=undefined?_c1e.field:(_c1e.get?-1:this.fieldIndex);
if((_c1e.field!=undefined)||!_c1e.get){
this.fieldIndex=(_c1e.field>-1?_c1e.field:this.fieldIndex)+1;
}
return new dojox.grid.cell(dojo.mixin({},this._defaultCellProps,_c1e,{grid:this.grid,subrow:_c1c,layoutIndex:_c1d,index:this.cells.length,fieldIndex:_c20,unitWidth:w}));
}});
}
if(!dojo._hasResource["dojox.grid.compat._grid.rows"]){
dojo._hasResource["dojox.grid.compat._grid.rows"]=true;
dojo.provide("dojox.grid.compat._grid.rows");
dojo.declare("dojox.grid.rows",null,{constructor:function(_c21){
this.grid=_c21;
},linesToEms:2,defaultRowHeight:1,overRow:-2,getHeight:function(_c22){
return "";
},getDefaultHeightPx:function(){
return 32;
},prepareStylingRow:function(_c23,_c24){
return {index:_c23,node:_c24,odd:Boolean(_c23&1),selected:this.grid.selection.isSelected(_c23),over:this.isOver(_c23),customStyles:"",customClasses:"dojoxGrid-row"};
},styleRowNode:function(_c25,_c26){
var row=this.prepareStylingRow(_c25,_c26);
this.grid.onStyleRow(row);
this.applyStyles(row);
},applyStyles:function(_c28){
with(_c28){
node.className=customClasses;
var h=node.style.height;
dojox.grid.setStyleText(node,customStyles+";"+(node._style||""));
node.style.height=h;
}
},updateStyles:function(_c2a){
this.grid.updateRowStyles(_c2a);
},setOverRow:function(_c2b){
var last=this.overRow;
this.overRow=_c2b;
if((last!=this.overRow)&&(last>=0)){
this.updateStyles(last);
}
this.updateStyles(this.overRow);
},isOver:function(_c2d){
return (this.overRow==_c2d);
}});
}
if(!dojo._hasResource["dojox.grid.compat._grid.focus"]){
dojo._hasResource["dojox.grid.compat._grid.focus"]=true;
dojo.provide("dojox.grid.compat._grid.focus");
dojo.declare("dojox.grid.focus",null,{constructor:function(_c2e){
this.grid=_c2e;
this.cell=null;
this.rowIndex=-1;
dojo.connect(this.grid.domNode,"onfocus",this,"doFocus");
},tabbingOut:false,focusClass:"dojoxGrid-cell-focus",focusView:null,initFocusView:function(){
this.focusView=this.grid.views.getFirstScrollingView();
},isFocusCell:function(_c2f,_c30){
return (this.cell==_c2f)&&(this.rowIndex==_c30);
},isLastFocusCell:function(){
return (this.rowIndex==this.grid.rowCount-1)&&(this.cell.index==this.grid.layout.cellCount-1);
},isFirstFocusCell:function(){
return (this.rowIndex==0)&&(this.cell.index==0);
},isNoFocusCell:function(){
return (this.rowIndex<0)||!this.cell;
},_focusifyCellNode:function(_c31){
var n=this.cell&&this.cell.getNode(this.rowIndex);
if(n){
dojo.toggleClass(n,this.focusClass,_c31);
if(_c31){
this.scrollIntoView();
try{
if(!this.grid.edit.isEditing()){
dojox.grid.fire(n,"focus");
}
}
catch(e){
}
}
}
},scrollIntoView:function(){
if(!this.cell){
return;
}
var c=this.cell,s=c.view.scrollboxNode,sr={w:s.clientWidth,l:s.scrollLeft,t:s.scrollTop,h:s.clientHeight},n=c.getNode(this.rowIndex),r=c.view.getRowNode(this.rowIndex),rt=this.grid.scroller.findScrollTop(this.rowIndex);
if(n.offsetLeft+n.offsetWidth>sr.l+sr.w){
s.scrollLeft=n.offsetLeft+n.offsetWidth-sr.w;
}else{
if(n.offsetLeft<sr.l){
s.scrollLeft=n.offsetLeft;
}
}
if(rt+r.offsetHeight>sr.t+sr.h){
this.grid.setScrollTop(rt+r.offsetHeight-sr.h);
}else{
if(rt<sr.t){
this.grid.setScrollTop(rt);
}
}
},styleRow:function(_c39){
return;
},setFocusIndex:function(_c3a,_c3b){
this.setFocusCell(this.grid.getCell(_c3b),_c3a);
},setFocusCell:function(_c3c,_c3d){
if(_c3c&&!this.isFocusCell(_c3c,_c3d)){
this.tabbingOut=false;
this.focusGridView();
this._focusifyCellNode(false);
this.cell=_c3c;
this.rowIndex=_c3d;
this._focusifyCellNode(true);
}
if(dojo.isOpera){
setTimeout(dojo.hitch(this.grid,"onCellFocus",this.cell,this.rowIndex),1);
}else{
this.grid.onCellFocus(this.cell,this.rowIndex);
}
},next:function(){
var row=this.rowIndex,col=this.cell.index+1,cc=this.grid.layout.cellCount-1,rc=this.grid.rowCount-1;
if(col>cc){
col=0;
row++;
}
if(row>rc){
col=cc;
row=rc;
}
this.setFocusIndex(row,col);
},previous:function(){
var row=(this.rowIndex||0),col=(this.cell.index||0)-1;
if(col<0){
col=this.grid.layout.cellCount-1;
row--;
}
if(row<0){
row=0;
col=0;
}
this.setFocusIndex(row,col);
},move:function(_c44,_c45){
var rc=this.grid.rowCount-1,cc=this.grid.layout.cellCount-1,r=this.rowIndex,i=this.cell.index,row=Math.min(rc,Math.max(0,r+_c44)),col=Math.min(cc,Math.max(0,i+_c45));
this.setFocusIndex(row,col);
if(_c44){
this.grid.updateRow(r);
}
},previousKey:function(e){
if(this.isFirstFocusCell()){
this.tabOut(this.grid.domNode);
}else{
dojo.stopEvent(e);
this.previous();
}
},nextKey:function(e){
if(this.isLastFocusCell()){
this.tabOut(this.grid.lastFocusNode);
}else{
dojo.stopEvent(e);
this.next();
}
},tabOut:function(_c4e){
this.tabbingOut=true;
_c4e.focus();
},focusGridView:function(){
dojox.grid.fire(this.focusView,"focus");
},focusGrid:function(_c4f){
this.focusGridView();
this._focusifyCellNode(true);
},doFocus:function(e){
if(e&&e.target!=e.currentTarget){
return;
}
if(!this.tabbingOut&&this.isNoFocusCell()){
this.setFocusIndex(0,0);
}
this.tabbingOut=false;
}});
}
if(!dojo._hasResource["dojox.grid.compat._grid.selection"]){
dojo._hasResource["dojox.grid.compat._grid.selection"]=true;
dojo.provide("dojox.grid.compat._grid.selection");
dojo.declare("dojox.grid.selection",null,{constructor:function(_c51){
this.grid=_c51;
this.selected=[];
},multiSelect:true,selected:null,updating:0,selectedIndex:-1,onCanSelect:function(_c52){
return this.grid.onCanSelect(_c52);
},onCanDeselect:function(_c53){
return this.grid.onCanDeselect(_c53);
},onSelected:function(_c54){
return this.grid.onSelected(_c54);
},onDeselected:function(_c55){
return this.grid.onDeselected(_c55);
},onChanging:function(){
},onChanged:function(){
return this.grid.onSelectionChanged();
},isSelected:function(_c56){
return this.selected[_c56];
},getFirstSelected:function(){
for(var i=0,l=this.selected.length;i<l;i++){
if(this.selected[i]){
return i;
}
}
return -1;
},getNextSelected:function(_c59){
for(var i=_c59+1,l=this.selected.length;i<l;i++){
if(this.selected[i]){
return i;
}
}
return -1;
},getSelected:function(){
var _c5c=[];
for(var i=0,l=this.selected.length;i<l;i++){
if(this.selected[i]){
_c5c.push(i);
}
}
return _c5c;
},getSelectedCount:function(){
var c=0;
for(var i=0;i<this.selected.length;i++){
if(this.selected[i]){
c++;
}
}
return c;
},beginUpdate:function(){
if(this.updating==0){
this.onChanging();
}
this.updating++;
},endUpdate:function(){
this.updating--;
if(this.updating==0){
this.onChanged();
}
},select:function(_c61){
this.unselectAll(_c61);
this.addToSelection(_c61);
},addToSelection:function(_c62){
_c62=Number(_c62);
if(this.selected[_c62]){
this.selectedIndex=_c62;
}else{
if(this.onCanSelect(_c62)!==false){
this.selectedIndex=_c62;
this.beginUpdate();
this.selected[_c62]=true;
this.grid.onSelected(_c62);
this.endUpdate();
}
}
},deselect:function(_c63){
_c63=Number(_c63);
if(this.selectedIndex==_c63){
this.selectedIndex=-1;
}
if(this.selected[_c63]){
if(this.onCanDeselect(_c63)===false){
return;
}
this.beginUpdate();
delete this.selected[_c63];
this.grid.onDeselected(_c63);
this.endUpdate();
}
},setSelected:function(_c64,_c65){
this[(_c65?"addToSelection":"deselect")](_c64);
},toggleSelect:function(_c66){
this.setSelected(_c66,!this.selected[_c66]);
},insert:function(_c67){
this.selected.splice(_c67,0,false);
if(this.selectedIndex>=_c67){
this.selectedIndex++;
}
},remove:function(_c68){
this.selected.splice(_c68,1);
if(this.selectedIndex>=_c68){
this.selectedIndex--;
}
},unselectAll:function(_c69){
for(var i in this.selected){
if((i!=_c69)&&(this.selected[i]===true)){
this.deselect(i);
}
}
},shiftSelect:function(_c6b,inTo){
var s=(_c6b>=0?_c6b:inTo),e=inTo;
if(s>e){
e=s;
s=inTo;
}
for(var i=s;i<=e;i++){
this.addToSelection(i);
}
},clickSelect:function(_c70,_c71,_c72){
this.beginUpdate();
if(!this.multiSelect){
this.select(_c70);
}else{
var _c73=this.selectedIndex;
if(!_c71){
this.unselectAll(_c70);
}
if(_c72){
this.shiftSelect(_c73,_c70);
}else{
if(_c71){
this.toggleSelect(_c70);
}else{
this.addToSelection(_c70);
}
}
}
this.endUpdate();
},clickSelectEvent:function(e){
this.clickSelect(e.rowIndex,e.ctrlKey,e.shiftKey);
},clear:function(){
this.beginUpdate();
this.unselectAll();
this.endUpdate();
}});
}
if(!dojo._hasResource["dojox.grid.compat._grid.edit"]){
dojo._hasResource["dojox.grid.compat._grid.edit"]=true;
dojo.provide("dojox.grid.compat._grid.edit");
dojo.declare("dojox.grid.edit",null,{constructor:function(_c75){
this.grid=_c75;
this.connections=[];
if(dojo.isIE){
this.connections.push(dojo.connect(document.body,"onfocus",dojo.hitch(this,"_boomerangFocus")));
}
},info:{},destroy:function(){
dojo.forEach(this.connections,dojo.disconnect);
},cellFocus:function(_c76,_c77){
if(this.grid.singleClickEdit||this.isEditRow(_c77)){
this.setEditCell(_c76,_c77);
}else{
this.apply();
}
if(this.isEditing()||(_c76&&(_c76.editor||0).alwaysOn)){
this._focusEditor(_c76,_c77);
}
},rowClick:function(e){
if(this.isEditing()&&!this.isEditRow(e.rowIndex)){
this.apply();
}
},styleRow:function(_c79){
if(_c79.index==this.info.rowIndex){
_c79.customClasses+=" dojoxGrid-row-editing";
}
},dispatchEvent:function(e){
var c=e.cell,ed=c&&c.editor;
return ed&&ed.dispatchEvent(e.dispatch,e);
},isEditing:function(){
return this.info.rowIndex!==undefined;
},isEditCell:function(_c7d,_c7e){
return (this.info.rowIndex===_c7d)&&(this.info.cell.index==_c7e);
},isEditRow:function(_c7f){
return this.info.rowIndex===_c7f;
},setEditCell:function(_c80,_c81){
if(!this.isEditCell(_c81,_c80.index)&&this.grid.canEdit(_c80,_c81)){
this.start(_c80,_c81,this.isEditRow(_c81)||_c80.editor);
}
},_focusEditor:function(_c82,_c83){
dojox.grid.fire(_c82.editor,"focus",[_c83]);
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
},start:function(_c84,_c85,_c86){
this.grid.beginUpdate();
this.editorApply();
if(this.isEditing()&&!this.isEditRow(_c85)){
this.applyRowEdit();
this.grid.updateRow(_c85);
}
if(_c86){
this.info={cell:_c84,rowIndex:_c85};
this.grid.doStartEdit(_c84,_c85);
this.grid.updateRow(_c85);
}else{
this.info={};
}
this.grid.endUpdate();
this.grid.focus.focusGrid();
this._focusEditor(_c84,_c85);
this._doCatchBoomerang();
},_editorDo:function(_c87){
var c=this.info.cell;
c&&c.editor&&c.editor[_c87](this.info.rowIndex);
},editorApply:function(){
this._editorDo("apply");
},editorCancel:function(){
this._editorDo("cancel");
},applyCellEdit:function(_c89,_c8a,_c8b){
if(this.grid.canEdit(_c8a,_c8b)){
this.grid.doApplyCellEdit(_c89,_c8b,_c8a.fieldIndex);
}
},applyRowEdit:function(){
this.grid.doApplyEdit(this.info.rowIndex);
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
},save:function(_c8c,_c8d){
var c=this.info.cell;
if(this.isEditRow(_c8c)&&(!_c8d||c.view==_c8d)&&c.editor){
c.editor.save(c,this.info.rowIndex);
}
},restore:function(_c8f,_c90){
var c=this.info.cell;
if(this.isEditRow(_c90)&&c.view==_c8f&&c.editor){
c.editor.restore(c,this.info.rowIndex);
}
}});
}
if(!dojo._hasResource["dojox.grid.compat._grid.rowbar"]){
dojo._hasResource["dojox.grid.compat._grid.rowbar"]=true;
dojo.provide("dojox.grid.compat._grid.rowbar");
dojo.declare("dojox.GridRowView",dojox.GridView,{defaultWidth:"3em",noscroll:true,padBorderWidth:2,buildRendering:function(){
this.inherited("buildRendering",arguments);
this.scrollboxNode.style.overflow="hidden";
this.headerNode.style.visibility="hidden";
},getWidth:function(){
return this.viewWidth||this.defaultWidth;
},buildRowContent:function(_c92,_c93){
var w=this.contentNode.offsetWidth-this.padBorderWidth;
_c93.innerHTML="<table style=\"width:"+w+"px;\" role=\"wairole:presentation\"><tr><td class=\"dojoxGrid-rowbar-inner\"></td></tr></table>";
},renderHeader:function(){
},resize:function(){
this.adaptHeight();
},adaptWidth:function(){
},doStyleRowNode:function(_c95,_c96){
var n=["dojoxGrid-rowbar"];
if(this.grid.rows.isOver(_c95)){
n.push("dojoxGrid-rowbar-over");
}
if(this.grid.selection.isSelected(_c95)){
n.push("dojoxGrid-rowbar-selected");
}
_c96.className=n.join(" ");
},domouseover:function(e){
this.grid.onMouseOverRow(e);
},domouseout:function(e){
if(!this.isIntraRowEvent(e)){
this.grid.onMouseOutRow(e);
}
}});
}
if(!dojo._hasResource["dojox.grid.compat._grid.publicEvents"]){
dojo._hasResource["dojox.grid.compat._grid.publicEvents"]=true;
dojo.provide("dojox.grid.compat._grid.publicEvents");
dojox.grid.publicEvents={cellOverClass:"dojoxGrid-cell-over",onKeyEvent:function(e){
this.dispatchKeyEvent(e);
},onContentEvent:function(e){
this.dispatchContentEvent(e);
},onHeaderEvent:function(e){
this.dispatchHeaderEvent(e);
},onStyleRow:function(_c9d){
with(_c9d){
customClasses+=(odd?" dojoxGrid-row-odd":"")+(selected?" dojoxGrid-row-selected":"")+(over?" dojoxGrid-row-over":"");
}
this.focus.styleRow(_c9d);
this.edit.styleRow(_c9d);
},onKeyDown:function(e){
if(e.altKey||e.ctrlKey||e.metaKey){
return;
}
var dk=dojo.keys;
switch(e.keyCode){
case dk.ESCAPE:
this.edit.cancel();
break;
case dk.ENTER:
if(!e.shiftKey){
var _ca0=this.edit.isEditing();
this.edit.apply();
if(!_ca0){
this.edit.setEditCell(this.focus.cell,this.focus.rowIndex);
}
}
break;
case dk.TAB:
this.focus[e.shiftKey?"previousKey":"nextKey"](e);
break;
case dk.LEFT_ARROW:
case dk.RIGHT_ARROW:
if(!this.edit.isEditing()){
dojo.stopEvent(e);
var _ca1=(e.keyCode==dk.LEFT_ARROW)?1:-1;
if(dojo._isBodyLtr()){
_ca1*=-1;
}
this.focus.move(0,_ca1);
}
break;
case dk.UP_ARROW:
if(!this.edit.isEditing()&&this.focus.rowIndex!=0){
dojo.stopEvent(e);
this.focus.move(-1,0);
}
break;
case dk.DOWN_ARROW:
if(!this.edit.isEditing()&&this.focus.rowIndex+1!=this.model.count){
dojo.stopEvent(e);
this.focus.move(1,0);
}
break;
case dk.PAGE_UP:
if(!this.edit.isEditing()&&this.focus.rowIndex!=0){
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
if(!this.edit.isEditing()&&this.focus.rowIndex+1!=this.model.count){
dojo.stopEvent(e);
if(this.focus.rowIndex!=this.scroller.lastVisibleRow-1){
this.focus.move(this.scroller.lastVisibleRow-this.focus.rowIndex-1,0);
}else{
this.setScrollTop(this.scroller.findScrollTop(this.focus.rowIndex+1));
this.focus.move(this.scroller.lastVisibleRow-this.scroller.firstVisibleRow-1,0);
}
}
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
dojo.addClass(e.cellNode,this.cellOverClass);
},onCellMouseOut:function(e){
dojo.removeClass(e.cellNode,this.cellOverClass);
},onCellMouseDown:function(e){
},onCellClick:function(e){
this._click[0]=this._click[1];
this._click[1]=e;
if(!this.edit.isEditCell(e.rowIndex,e.cellIndex)){
this.focus.setFocusCell(e.cell,e.rowIndex);
}
this.onRowClick(e);
},onCellDblClick:function(e){
if(dojo.isIE){
this.edit.setEditCell(this._click[1].cell,this._click[1].rowIndex);
}else{
if(this._click[0].rowIndex!=this._click[1].rowIndex){
this.edit.setEditCell(this._click[0].cell,this._click[0].rowIndex);
}else{
this.edit.setEditCell(e.cell,e.rowIndex);
}
}
this.onRowDblClick(e);
},onCellContextMenu:function(e){
this.onRowContextMenu(e);
},onCellFocus:function(_cae,_caf){
this.edit.cellFocus(_cae,_caf);
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
dojo.addClass(e.cellNode,this.cellOverClass);
},onHeaderCellMouseOut:function(e){
dojo.removeClass(e.cellNode,this.cellOverClass);
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
dojo.stopEvent(e);
},onStartEdit:function(_cc1,_cc2){
},onApplyCellEdit:function(_cc3,_cc4,_cc5){
},onCancelEdit:function(_cc6){
},onApplyEdit:function(_cc7){
},onCanSelect:function(_cc8){
return true;
},onCanDeselect:function(_cc9){
return true;
},onSelected:function(_cca){
this.updateRowStyles(_cca);
},onDeselected:function(_ccb){
this.updateRowStyles(_ccb);
},onSelectionChanged:function(){
}};
}
if(!dojo._hasResource["dojox.grid.compat.VirtualGrid"]){
dojo._hasResource["dojox.grid.compat.VirtualGrid"]=true;
dojo.provide("dojox.grid.compat.VirtualGrid");
dojo.declare("dojox.VirtualGrid",[dijit._Widget,dijit._Templated],{templateString:"<div class=\"dojoxGrid\" hidefocus=\"hidefocus\" role=\"wairole:grid\">\r\n\t<div class=\"dojoxGrid-master-header\" dojoAttachPoint=\"viewsHeaderNode\"></div>\r\n\t<div class=\"dojoxGrid-master-view\" dojoAttachPoint=\"viewsNode\"></div>\r\n\t<span dojoAttachPoint=\"lastFocusNode\" tabindex=\"0\"></span>\r\n</div>\r\n",classTag:"dojoxGrid",get:function(_ccc){
},rowCount:5,keepRows:75,rowsPerPage:25,autoWidth:false,autoHeight:false,autoRender:true,defaultHeight:"15em",structure:"",elasticView:-1,singleClickEdit:false,_click:null,sortInfo:0,themeable:true,buildRendering:function(){
this.inherited(arguments);
if(this.get==dojox.VirtualGrid.prototype.get){
this.get=null;
}
if(!this.domNode.getAttribute("tabIndex")){
this.domNode.tabIndex="0";
}
this.createScroller();
this.createLayout();
this.createViews();
this.createManagers();
dojox.grid.initTextSizePoll();
this.connect(dojox.grid,"textSizeChanged","textSizeChanged");
dojox.grid.funnelEvents(this.domNode,this,"doKeyEvent",dojox.grid.keyEvents);
this.connect(this,"onShow","renderOnIdle");
},postCreate:function(){
this.styleChanged=this._styleChanged;
this.setStructure(this.structure);
this._click=[];
},destroy:function(){
this.domNode.onReveal=null;
this.domNode.onSizeChange=null;
this.edit.destroy();
this.views.destroyViews();
this.inherited(arguments);
},styleChanged:function(){
this.setStyledClass(this.domNode,"");
},_styleChanged:function(){
this.styleChanged();
this.update();
},textSizeChanged:function(){
setTimeout(dojo.hitch(this,"_textSizeChanged"),1);
},_textSizeChanged:function(){
if(this.domNode){
this.views.forEach(function(v){
v.content.update();
});
this.render();
}
},sizeChange:function(){
dojox.grid.jobs.job(this.id+"SizeChange",50,dojo.hitch(this,"update"));
},renderOnIdle:function(){
setTimeout(dojo.hitch(this,"render"),1);
},createManagers:function(){
this.rows=new dojox.grid.rows(this);
this.focus=new dojox.grid.focus(this);
this.selection=new dojox.grid.selection(this);
this.edit=new dojox.grid.edit(this);
},createScroller:function(){
this.scroller=new dojox.grid.scroller.columns();
this.scroller._pageIdPrefix=this.id+"-";
this.scroller.renderRow=dojo.hitch(this,"renderRow");
this.scroller.removeRow=dojo.hitch(this,"rowRemoved");
},createLayout:function(){
this.layout=new dojox.grid.layout(this);
},createViews:function(){
this.views=new dojox.grid.views(this);
this.views.createView=dojo.hitch(this,"createView");
},createView:function(_cce){
if(dojo.isAIR){
var obj=window;
var _cd0=_cce.split(".");
for(var i=0;i<_cd0.length;i++){
if(typeof obj[_cd0[i]]=="undefined"){
var _cd2=_cd0[0];
for(var j=1;j<=i;j++){
_cd2+="."+_cd0[j];
}
throw new Error(_cd2+" is undefined");
}
obj=obj[_cd0[i]];
}
var c=obj;
}else{
var c=eval(_cce);
}
var view=new c({grid:this});
this.viewsNode.appendChild(view.domNode);
this.viewsHeaderNode.appendChild(view.headerNode);
this.views.addView(view);
return view;
},buildViews:function(){
for(var i=0,vs;(vs=this.layout.structure[i]);i++){
this.createView(vs.type||dojox._scopeName+".GridView").setStructure(vs);
}
this.scroller.setContentNodes(this.views.getContentNodes());
},setStructure:function(_cd8){
this.views.destroyViews();
this.structure=_cd8;
if((this.structure)&&(dojo.isString(this.structure))){
this.structure=dojox.grid.getProp(this.structure);
}
if(!this.structure){
this.structure=window["layout"];
}
if(!this.structure){
return;
}
this.layout.setStructure(this.structure);
this._structureChanged();
},_structureChanged:function(){
this.buildViews();
if(this.autoRender){
this.render();
}
},hasLayout:function(){
return this.layout.cells.length;
},resize:function(_cd9){
this._sizeBox=_cd9;
this._resize();
this.sizeChange();
},_getPadBorder:function(){
this._padBorder=this._padBorder||dojo._getPadBorderExtents(this.domNode);
return this._padBorder;
},_resize:function(){
if(!this.domNode.parentNode||this.domNode.parentNode.nodeType!=1||!this.hasLayout()){
return;
}
var _cda=this._getPadBorder();
if(this.autoHeight){
this.domNode.style.height="auto";
this.viewsNode.style.height="";
}else{
if(this.flex>0){
}else{
if(this.domNode.clientHeight<=_cda.h){
if(this.domNode.parentNode==document.body){
this.domNode.style.height=this.defaultHeight;
}else{
this.fitTo="parent";
}
}
}
}
if(this._sizeBox){
dojo.contentBox(this.domNode,this._sizeBox);
}else{
if(this.fitTo=="parent"){
var h=dojo._getContentBox(this.domNode.parentNode).h;
dojo.marginBox(this.domNode,{h:Math.max(0,h)});
}
}
var h=dojo._getContentBox(this.domNode).h;
if(h==0&&!this.autoHeight){
this.viewsHeaderNode.style.display="none";
}else{
this.viewsHeaderNode.style.display="block";
}
this.adaptWidth();
this.adaptHeight();
this.scroller.defaultRowHeight=this.rows.getDefaultHeightPx()+1;
this.postresize();
},adaptWidth:function(){
var w=this.autoWidth?0:this.domNode.clientWidth||(this.domNode.offsetWidth-this._getPadBorder().w);
vw=this.views.arrange(1,w);
this.views.onEach("adaptWidth");
if(this.autoWidth){
this.domNode.style.width=vw+"px";
}
},adaptHeight:function(){
var vns=this.viewsHeaderNode.style,t=vns.display=="none"?0:this.views.measureHeader();
vns.height=t+"px";
this.views.normalizeHeaderNodeHeight();
var h=(this.autoHeight?-1:Math.max(this.domNode.clientHeight-t,0)||0);
this.views.onEach("setSize",[0,h]);
this.views.onEach("adaptHeight");
this.scroller.windowHeight=h;
},render:function(){
if(!this.domNode){
return;
}
if(!this.hasLayout()){
this.scroller.init(0,this.keepRows,this.rowsPerPage);
return;
}
this.update=this.defaultUpdate;
this.scroller.init(this.rowCount,this.keepRows,this.rowsPerPage);
this.prerender();
this.setScrollTop(0);
this.postrender();
},prerender:function(){
this.keepRows=this.autoHeight?0:this.constructor.prototype.keepRows;
this.scroller.setKeepInfo(this.keepRows);
this.views.render();
this._resize();
},postrender:function(){
this.postresize();
this.focus.initFocusView();
dojo.setSelectable(this.domNode,false);
},postresize:function(){
if(this.autoHeight){
this.viewsNode.style.height=this.views.measureContent()+"px";
}
},renderRow:function(_ce0,_ce1){
this.views.renderRow(_ce0,_ce1);
},rowRemoved:function(_ce2){
this.views.rowRemoved(_ce2);
},invalidated:null,updating:false,beginUpdate:function(){
if(this.invalidated==null){
this.invalidated={rows:[],count:1,all:false,rowCount:undefined};
}else{
this.invalidated.count++;
}
this.updating=true;
},endUpdate:function(){
var i=this.invalidated;
if(--i.count===0){
this.updating=false;
if(i.rows.length>0){
for(r in i.rows){
this.updateRow(Number(r));
}
this.invalidated.rows=[];
}
if(i.rowCount!=undefined){
this.updateRowCount(i.rowCount);
i.rowCount=undefined;
}
if(i.all){
this.update();
i.all=false;
}
}
},defaultUpdate:function(){
if(!this.domNode){
return;
}
if(this.updating){
this.invalidated.all=true;
return;
}
this.prerender();
this.scroller.invalidateNodes();
this.setScrollTop(this.scrollTop);
this.postrender();
},update:function(){
this.render();
},updateRow:function(_ce4){
_ce4=Number(_ce4);
if(this.updating){
this.invalidated.rows[_ce4]=true;
}else{
this.views.updateRow(_ce4,this.rows.getHeight(_ce4));
this.scroller.rowHeightChanged(_ce4);
}
},updateRowCount:function(_ce5){
if(this.updating){
this.invalidated.rowCount=_ce5;
}else{
this.rowCount=_ce5;
if(this.layout.cells.length){
this.scroller.updateRowCount(_ce5);
this.setScrollTop(this.scrollTop);
}
this._resize();
}
},updateRowStyles:function(_ce6){
this.views.updateRowStyles(_ce6);
},rowHeightChanged:function(_ce7){
this.views.renormalizeRow(_ce7);
this.scroller.rowHeightChanged(_ce7);
},fastScroll:true,delayScroll:false,scrollRedrawThreshold:(dojo.isIE?100:50),scrollTo:function(_ce8){
if(!this.fastScroll){
this.setScrollTop(_ce8);
return;
}
var _ce9=Math.abs(this.lastScrollTop-_ce8);
this.lastScrollTop=_ce8;
if(_ce9>this.scrollRedrawThreshold||this.delayScroll){
this.delayScroll=true;
this.scrollTop=_ce8;
this.views.setScrollTop(_ce8);
dojox.grid.jobs.job("dojoxGrid-scroll",200,dojo.hitch(this,"finishScrollJob"));
}else{
this.setScrollTop(_ce8);
}
},finishScrollJob:function(){
this.delayScroll=false;
this.setScrollTop(this.scrollTop);
},setScrollTop:function(_cea){
this.scrollTop=this.views.setScrollTop(_cea);
this.scroller.scroll(this.scrollTop);
},scrollToRow:function(_ceb){
this.setScrollTop(this.scroller.findScrollTop(_ceb)+1);
},styleRowNode:function(_cec,_ced){
if(_ced){
this.rows.styleRowNode(_cec,_ced);
}
},getCell:function(_cee){
return this.layout.cells[_cee];
},setCellWidth:function(_cef,_cf0){
this.getCell(_cef).unitWidth=_cf0;
},getCellName:function(_cf1){
return "Cell "+_cf1.index;
},canSort:function(_cf2){
},sort:function(){
},getSortAsc:function(_cf3){
_cf3=_cf3==undefined?this.sortInfo:_cf3;
return Boolean(_cf3>0);
},getSortIndex:function(_cf4){
_cf4=_cf4==undefined?this.sortInfo:_cf4;
return Math.abs(_cf4)-1;
},setSortIndex:function(_cf5,_cf6){
var si=_cf5+1;
if(_cf6!=undefined){
si*=(_cf6?1:-1);
}else{
if(this.getSortIndex()==_cf5){
si=-this.sortInfo;
}
}
this.setSortInfo(si);
},setSortInfo:function(_cf8){
if(this.canSort(_cf8)){
this.sortInfo=_cf8;
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
},doStartEdit:function(_d06,_d07){
this.onStartEdit(_d06,_d07);
},doApplyCellEdit:function(_d08,_d09,_d0a){
this.onApplyCellEdit(_d08,_d09,_d0a);
},doCancelEdit:function(_d0b){
this.onCancelEdit(_d0b);
},doApplyEdit:function(_d0c){
this.onApplyEdit(_d0c);
},addRow:function(){
this.updateRowCount(this.rowCount+1);
},removeSelectedRows:function(){
this.updateRowCount(Math.max(0,this.rowCount-this.selection.getSelected().length));
this.selection.clear();
}});
dojo.mixin(dojox.VirtualGrid.prototype,dojox.grid.publicEvents);
}
if(!dojo._hasResource["dojox.grid.compat._data.fields"]){
dojo._hasResource["dojox.grid.compat._data.fields"]=true;
dojo.provide("dojox.grid.compat._data.fields");
dojo.declare("dojox.grid.data.Mixer",null,{constructor:function(){
this.defaultValue={};
this.values=[];
},count:function(){
return this.values.length;
},clear:function(){
this.values=[];
},build:function(_d0d){
var _d0e=dojo.mixin({owner:this},this.defaultValue);
_d0e.key=_d0d;
this.values[_d0d]=_d0e;
return _d0e;
},getDefault:function(){
return this.defaultValue;
},setDefault:function(_d0f){
for(var i=0,a;(a=arguments[i]);i++){
dojo.mixin(this.defaultValue,a);
}
},get:function(_d12){
return this.values[_d12]||this.build(_d12);
},_set:function(_d13,_d14){
var v=this.get(_d13);
for(var i=1;i<arguments.length;i++){
dojo.mixin(v,arguments[i]);
}
this.values[_d13]=v;
},set:function(){
if(arguments.length<1){
return;
}
var a=arguments[0];
if(!dojo.isArray(a)){
this._set.apply(this,arguments);
}else{
if(a.length&&a[0]["default"]){
this.setDefault(a.shift());
}
for(var i=0,l=a.length;i<l;i++){
this._set(i,a[i]);
}
}
},insert:function(_d1a,_d1b){
if(_d1a>=this.values.length){
this.values[_d1a]=_d1b;
}else{
this.values.splice(_d1a,0,_d1b);
}
},remove:function(_d1c){
this.values.splice(_d1c,1);
},swap:function(_d1d,_d1e){
dojox.grid.arraySwap(this.values,_d1d,_d1e);
},move:function(_d1f,_d20){
dojox.grid.arrayMove(this.values,_d1f,_d20);
}});
dojox.grid.data.compare=function(a,b){
return (a>b?1:(a==b?0:-1));
};
dojo.declare("dojox.grid.data.Field",null,{constructor:function(_d23){
this.name=_d23;
this.compare=dojox.grid.data.compare;
},na:dojox.grid.na});
dojo.declare("dojox.grid.data.Fields",dojox.grid.data.Mixer,{constructor:function(_d24){
var _d25=_d24?_d24:dojox.grid.data.Field;
this.defaultValue=new _d25();
},indexOf:function(_d26){
for(var i=0;i<this.values.length;i++){
var v=this.values[i];
if(v&&v.key==_d26){
return i;
}
}
return -1;
}});
}
if(!dojo._hasResource["dojox.grid.compat._data.model"]){
dojo._hasResource["dojox.grid.compat._data.model"]=true;
dojo.provide("dojox.grid.compat._data.model");
dojo.declare("dojox.grid.data.Model",null,{constructor:function(_d29,_d2a){
this.observers=[];
this.fields=new dojox.grid.data.Fields();
if(_d29){
this.fields.set(_d29);
}
this.setData(_d2a);
},count:0,updating:0,observer:function(_d2b,_d2c){
this.observers.push({o:_d2b,p:_d2c||"model"});
},notObserver:function(_d2d){
for(var i=0,m,o;(o=this.observers[i]);i++){
if(o.o==_d2d){
this.observers.splice(i,1);
return;
}
}
},notify:function(_d31,_d32){
var a=_d32||[];
for(var i=0,m,o;(o=this.observers[i]);i++){
m=o.p+_d31;
o=o.o;
(m in o)&&(o[m].apply(o,a));
}
},clear:function(){
this.fields.clear();
this.clearData();
},beginUpdate:function(){
this.notify("BeginUpdate",arguments);
},endUpdate:function(){
this.notify("EndUpdate",arguments);
},clearData:function(){
this.setData(null);
},change:function(){
this.notify("Change",arguments);
},insertion:function(){
this.notify("Insertion",arguments);
this.notify("Change",arguments);
},removal:function(){
this.notify("Removal",arguments);
this.notify("Change",arguments);
},insert:function(_d37){
if(!this._insert.apply(this,arguments)){
return false;
}
this.insertion.apply(this,dojo._toArray(arguments,1));
return true;
},remove:function(_d38){
if(!this._remove.apply(this,arguments)){
return false;
}
this.removal.apply(this,arguments);
return true;
},canSort:function(){
return this.sort!=null;
},generateComparator:function(_d39,_d3a,_d3b,_d3c){
return function(a,b){
var ineq=_d39(a[_d3a],b[_d3a]);
return ineq?(_d3b?ineq:-ineq):_d3c&&_d3c(a,b);
};
},makeComparator:function(_d40){
var idx,col,_d43,_d44=null;
for(var i=_d40.length-1;i>=0;i--){
idx=_d40[i];
col=Math.abs(idx)-1;
if(col>=0){
_d43=this.fields.get(col);
_d44=this.generateComparator(_d43.compare,_d43.key,idx>0,_d44);
}
}
return _d44;
},sort:null,dummy:0});
dojo.declare("dojox.grid.data.Rows",dojox.grid.data.Model,{allChange:function(){
this.notify("AllChange",arguments);
this.notify("Change",arguments);
},rowChange:function(){
this.notify("RowChange",arguments);
},datumChange:function(){
this.notify("DatumChange",arguments);
},beginModifyRow:function(_d46){
if(!this.cache[_d46]){
this.cache[_d46]=this.copyRow(_d46);
}
},endModifyRow:function(_d47){
var _d48=this.cache[_d47];
if(_d48){
var data=this.getRow(_d47);
if(!dojox.grid.arrayCompare(_d48,data)){
this.update(_d48,data,_d47);
}
delete this.cache[_d47];
}
},cancelModifyRow:function(_d4a){
var _d4b=this.cache[_d4a];
if(_d4b){
this.setRow(_d4b,_d4a);
delete this.cache[_d4a];
}
}});
dojo.declare("dojox.grid.data.Table",dojox.grid.data.Rows,{constructor:function(){
this.cache=[];
},colCount:0,data:null,cache:null,measure:function(){
this.count=this.getRowCount();
this.colCount=this.getColCount();
this.allChange();
},getRowCount:function(){
return (this.data?this.data.length:0);
},getColCount:function(){
return (this.data&&this.data.length?this.data[0].length:this.fields.count());
},badIndex:function(_d4c,_d4d){
console.debug("dojox.grid.data.Table: badIndex");
},isGoodIndex:function(_d4e,_d4f){
return (_d4e>=0&&_d4e<this.count&&(arguments.length<2||(_d4f>=0&&_d4f<this.colCount)));
},getRow:function(_d50){
return this.data[_d50];
},copyRow:function(_d51){
return this.getRow(_d51).slice(0);
},getDatum:function(_d52,_d53){
return this.data[_d52][_d53];
},get:function(){
throw ("Plain \"get\" no longer supported. Use \"getRow\" or \"getDatum\".");
},setData:function(_d54){
this.data=(_d54||[]);
this.allChange();
},setRow:function(_d55,_d56){
this.data[_d56]=_d55;
this.rowChange(_d55,_d56);
this.change();
},setDatum:function(_d57,_d58,_d59){
this.data[_d58][_d59]=_d57;
this.datumChange(_d57,_d58,_d59);
},set:function(){
throw ("Plain \"set\" no longer supported. Use \"setData\", \"setRow\", or \"setDatum\".");
},setRows:function(_d5a,_d5b){
for(var i=0,l=_d5a.length,r=_d5b;i<l;i++,r++){
this.setRow(_d5a[i],r);
}
},update:function(_d5f,_d60,_d61){
return true;
},_insert:function(_d62,_d63){
dojox.grid.arrayInsert(this.data,_d63,_d62);
this.count++;
return true;
},_remove:function(_d64){
for(var i=_d64.length-1;i>=0;i--){
dojox.grid.arrayRemove(this.data,_d64[i]);
}
this.count-=_d64.length;
return true;
},sort:function(){
this.data.sort(this.makeComparator(arguments));
},swap:function(_d66,_d67){
dojox.grid.arraySwap(this.data,_d66,_d67);
this.rowChange(this.getRow(_d66),_d66);
this.rowChange(this.getRow(_d67),_d67);
this.change();
},dummy:0});
dojo.declare("dojox.grid.data.Objects",dojox.grid.data.Table,{constructor:function(_d68,_d69,_d6a){
if(!_d68){
this.autoAssignFields();
}
},allChange:function(){
this.notify("FieldsChange");
this.inherited(arguments);
},autoAssignFields:function(){
var d=this.data[0],i=0,_d6d;
for(var f in d){
_d6d=this.fields.get(i++);
if(!dojo.isString(_d6d.key)){
_d6d.key=f;
}
}
},setData:function(_d6f){
this.data=(_d6f||[]);
this.autoAssignFields();
this.allChange();
},getDatum:function(_d70,_d71){
return this.data[_d70][this.fields.get(_d71).key];
}});
dojo.declare("dojox.grid.data.Dynamic",dojox.grid.data.Table,{constructor:function(){
this.page=[];
this.pages=[];
},page:null,pages:null,rowsPerPage:100,requests:0,bop:-1,eop:-1,clearData:function(){
this.pages=[];
this.bop=this.eop=-1;
this.setData([]);
},getRowCount:function(){
return this.count;
},getColCount:function(){
return this.fields.count();
},setRowCount:function(_d72){
this.count=_d72;
this.change();
},requestsPending:function(_d73){
},rowToPage:function(_d74){
return (this.rowsPerPage?Math.floor(_d74/this.rowsPerPage):_d74);
},pageToRow:function(_d75){
return (this.rowsPerPage?this.rowsPerPage*_d75:_d75);
},requestRows:function(_d76,_d77){
},rowsProvided:function(_d78,_d79){
this.requests--;
if(this.requests==0){
this.requestsPending(false);
}
},requestPage:function(_d7a){
var row=this.pageToRow(_d7a);
var _d7c=Math.min(this.rowsPerPage,this.count-row);
if(_d7c>0){
this.requests++;
this.requestsPending(true);
setTimeout(dojo.hitch(this,"requestRows",row,_d7c),1);
}
},needPage:function(_d7d){
if(!this.pages[_d7d]){
this.pages[_d7d]=true;
this.requestPage(_d7d);
}
},preparePage:function(_d7e,_d7f){
if(_d7e<this.bop||_d7e>=this.eop){
var _d80=this.rowToPage(_d7e);
this.needPage(_d80);
this.bop=_d80*this.rowsPerPage;
this.eop=this.bop+(this.rowsPerPage||this.count);
}
},isRowLoaded:function(_d81){
return Boolean(this.data[_d81]);
},removePages:function(_d82){
for(var i=0,r;((r=_d82[i])!=undefined);i++){
this.pages[this.rowToPage(r)]=false;
}
this.bop=this.eop=-1;
},remove:function(_d85){
this.removePages(_d85);
dojox.grid.data.Table.prototype.remove.apply(this,arguments);
},getRow:function(_d86){
var row=this.data[_d86];
if(!row){
this.preparePage(_d86);
}
return row;
},getDatum:function(_d88,_d89){
var row=this.getRow(_d88);
return (row?row[_d89]:this.fields.get(_d89).na);
},setDatum:function(_d8b,_d8c,_d8d){
var row=this.getRow(_d8c);
if(row){
row[_d8d]=_d8b;
this.datumChange(_d8b,_d8c,_d8d);
}else{
console.debug("["+this.declaredClass+"] dojox.grid.data.dynamic.set: cannot set data on an non-loaded row");
}
},canSort:function(){
return false;
}});
dojox.grid.data.table=dojox.grid.data.Table;
dojox.grid.data.dynamic=dojox.grid.data.Dynamic;
dojo.declare("dojox.grid.data.DojoData",dojox.grid.data.Dynamic,{constructor:function(_d8f,_d90,args){
this.count=1;
this._rowIdentities={};
this._currentlyProcessing=[];
if(args){
dojo.mixin(this,args);
}
if(this.store){
var f=this.store.getFeatures();
this._canNotify=f["dojo.data.api.Notification"];
this._canWrite=f["dojo.data.api.Write"];
this._canIdentify=f["dojo.data.api.Identity"];
if(this._canNotify){
dojo.connect(this.store,"onSet",this,"_storeDatumChange");
dojo.connect(this.store,"onDelete",this,"_storeDatumDelete");
dojo.connect(this.store,"onNew",this,"_storeDatumNew");
}
if(this._canWrite){
dojo.connect(this.store,"revert",this,"refresh");
}
}
},markupFactory:function(args,node){
return new dojox.grid.data.DojoData(null,null,args);
},query:{name:"*"},store:null,_currentlyProcessing:null,_canNotify:false,_canWrite:false,_canIdentify:false,_rowIdentities:{},clientSort:false,sortFields:null,queryOptions:null,setData:function(_d95){
this.store=_d95;
this.data=[];
this.allChange();
},setRowCount:function(_d96){
this.count=_d96;
this.allChange();
},beginReturn:function(_d97){
if(this.count!=_d97){
this.setRowCount(_d97);
}
},_setupFields:function(_d98){
if(this.fields._nameMaps){
return;
}
var m={};
var _d9a=dojo.map(this.store.getAttributes(_d98),function(item,idx){
m[item]=idx;
m[idx+".idx"]=item;
return {name:item,key:item};
},this);
this.fields._nameMaps=m;
this.fields.set(_d9a);
this.notify("FieldsChange");
},_getRowFromItem:function(item){
},_createRow:function(item){
var row={};
row.__dojo_data_item=item;
dojo.forEach(this.fields.values,function(a){
value=this.store.getValue(item,a.name);
row[a.name]=(value===undefined||value===null)?"":value;
},this);
return row;
},processRows:function(_da1,_da2){
if(!_da1||_da1.length==0){
return;
}
this._setupFields(_da1[0]);
dojo.forEach(_da1,function(item,idx){
var row=this._createRow(item);
this._setRowId(item,_da2.start,idx);
this.setRow(row,_da2.start+idx);
},this);
this.endUpdate();
},requestRows:function(_da6,_da7){
this.beginUpdate();
var row=_da6||0;
var _da9={start:row,count:this.rowsPerPage,query:this.query,sort:this.sortFields,queryOptions:this.queryOptions,onBegin:dojo.hitch(this,"beginReturn"),onComplete:dojo.hitch(this,"processRows"),onError:dojo.hitch(this,"processError")};
this.store.fetch(_da9);
},getDatum:function(_daa,_dab){
var row=this.getRow(_daa);
var _dad=this.fields.values[_dab];
return row&&_dad?row[_dad.name]:_dad?_dad.na:"?";
},setDatum:function(_dae,_daf,_db0){
var n=this.fields._nameMaps[_db0+".idx"];
if(n){
this.data[_daf][n]=_dae;
this.datumChange(_dae,_daf,_db0);
}
},copyRow:function(_db2){
var row={};
var _db4={};
var src=this.getRow(_db2);
for(var x in src){
if(src[x]!=_db4[x]){
row[x]=src[x];
}
}
return row;
},_attrCompare:function(_db7,data){
dojo.forEach(this.fields.values,function(a){
if(_db7[a.name]!=data[a.name]){
return false;
}
},this);
return true;
},endModifyRow:function(_dba){
var _dbb=this.cache[_dba];
if(_dbb){
var data=this.getRow(_dba);
if(!this._attrCompare(_dbb,data)){
this.update(_dbb,data,_dba);
}
delete this.cache[_dba];
}
},cancelModifyRow:function(_dbd){
var _dbe=this.cache[_dbd];
if(_dbe){
this.setRow(_dbe,_dbd);
delete this.cache[_dbd];
}
},_setRowId:function(item,_dc0,idx){
if(this._canIdentify){
this._rowIdentities[this.store.getIdentity(item)]={rowId:_dc0+idx,item:item};
}else{
var _dc2=dojo.toJson(this.query)+":start:"+_dc0+":idx:"+idx+":sort:"+dojo.toJson(this.sortFields);
this._rowIdentities[_dc2]={rowId:_dc0+idx,item:item};
}
},_getRowId:function(item,_dc4){
var _dc5=null;
if(this._canIdentify&&!_dc4){
var _dc6=this._rowIdentities[this.store.getIdentity(item)];
if(_dc6){
_dc5=_dc6.rowId;
}
}else{
var id;
for(id in this._rowIdentities){
if(this._rowIdentities[id].item===item){
_dc5=this._rowIdentities[id].rowId;
break;
}
}
}
return _dc5;
},_storeDatumChange:function(item,attr,_dca,_dcb){
var _dcc=this._getRowId(item);
var row=this.getRow(_dcc);
if(row){
row[attr]=_dcb;
var _dce=this.fields._nameMaps[attr];
this.notify("DatumChange",[_dcb,_dcc,_dce]);
}
},_storeDatumDelete:function(item){
if(dojo.indexOf(this._currentlyProcessing,item)!=-1){
return;
}
var _dd0=this._getRowId(item,true);
if(_dd0!=null){
this._removeItems([_dd0]);
}
},_storeDatumNew:function(item){
if(this._disableNew){
return;
}
this._insertItem(item,this.data.length);
},insert:function(item,_dd3){
this._disableNew=true;
var i=this.store.newItem(item);
this._disableNew=false;
this._insertItem(i,_dd3);
},_insertItem:function(_dd5,_dd6){
if(!this.fields._nameMaps){
this._setupFields(_dd5);
}
var row=this._createRow(_dd5);
for(var i in this._rowIdentities){
var _dd9=this._rowIdentities[i];
if(_dd9.rowId>=_dd6){
_dd9.rowId++;
}
}
this._setRowId(_dd5,0,_dd6);
dojox.grid.data.Dynamic.prototype.insert.apply(this,[row,_dd6]);
},datumChange:function(_dda,_ddb,_ddc){
if(this._canWrite){
var row=this.getRow(_ddb);
var _dde=this.fields._nameMaps[_ddc+".idx"];
this.store.setValue(row.__dojo_data_item,_dde,_dda);
}else{
this.notify("DatumChange",arguments);
}
},insertion:function(){
this.notify("Insertion",arguments);
this.notify("Change",arguments);
},removal:function(){
this.notify("Removal",arguments);
this.notify("Change",arguments);
},remove:function(_ddf){
for(var i=_ddf.length-1;i>=0;i--){
var item=this.data[_ddf[i]].__dojo_data_item;
this._currentlyProcessing.push(item);
this.store.deleteItem(item);
}
this._removeItems(_ddf);
this._currentlyProcessing=[];
},_removeItems:function(_de2){
dojox.grid.data.Dynamic.prototype.remove.apply(this,arguments);
this._rowIdentities={};
for(var i=0;i<this.data.length;i++){
this._setRowId(this.data[i].__dojo_data_item,0,i);
}
},canSort:function(){
return true;
},sort:function(_de4){
var col=Math.abs(_de4)-1;
this.sortFields=[{"attribute":this.fields.values[col].name,"descending":(_de4>0)}];
this.refresh();
},refresh:function(){
this.clearData(true);
this.requestRows();
},clearData:function(_de6){
this._rowIdentities={};
this.pages=[];
this.bop=this.eop=-1;
this.count=0;
this.setData((_de6?this.store:[]));
},processError:function(_de7,_de8){
console.log(_de7);
}});
}
if(!dojo._hasResource["dojox.grid.compat._data.editors"]){
dojo._hasResource["dojox.grid.compat._data.editors"]=true;
dojo.provide("dojox.grid.compat._data.editors");
dojo.provide("dojox.grid.compat.editors");
dojo.declare("dojox.grid.editors.Base",null,{constructor:function(_de9){
this.cell=_de9;
},_valueProp:"value",_formatPending:false,format:function(_dea,_deb){
},needFormatNode:function(_dec,_ded){
this._formatPending=true;
dojox.grid.whenIdle(this,"_formatNode",_dec,_ded);
},cancelFormatNode:function(){
this._formatPending=false;
},_formatNode:function(_dee,_def){
if(this._formatPending){
this._formatPending=false;
dojo.setSelectable(this.cell.grid.domNode,true);
this.formatNode(this.getNode(_def),_dee,_def);
}
},getNode:function(_df0){
return (this.cell.getNode(_df0)||0).firstChild||0;
},formatNode:function(_df1,_df2,_df3){
if(dojo.isIE){
dojox.grid.whenIdle(this,"focus",_df3,_df1);
}else{
this.focus(_df3,_df1);
}
},dispatchEvent:function(m,e){
if(m in this){
return this[m](e);
}
},getValue:function(_df6){
return this.getNode(_df6)[this._valueProp];
},setValue:function(_df7,_df8){
var n=this.getNode(_df7);
if(n){
n[this._valueProp]=_df8;
}
},focus:function(_dfa,_dfb){
dojox.grid.focusSelectNode(_dfb||this.getNode(_dfa));
},save:function(_dfc){
this.value=this.value||this.getValue(_dfc);
},restore:function(_dfd){
this.setValue(_dfd,this.value);
},_finish:function(_dfe){
dojo.setSelectable(this.cell.grid.domNode,false);
this.cancelFormatNode(this.cell);
},apply:function(_dff){
this.cell.applyEdit(this.getValue(_dff),_dff);
this._finish(_dff);
},cancel:function(_e00){
this.cell.cancelEdit(_e00);
this._finish(_e00);
}});
dojox.grid.editors.base=dojox.grid.editors.Base;
dojo.declare("dojox.grid.editors.Input",dojox.grid.editors.Base,{constructor:function(_e01){
this.keyFilter=this.keyFilter||this.cell.keyFilter;
},keyFilter:null,format:function(_e02,_e03){
this.needFormatNode(_e02,_e03);
return "<input class=\"dojoxGrid-input\" type=\"text\" value=\""+_e02+"\">";
},formatNode:function(_e04,_e05,_e06){
this.inherited(arguments);
this.cell.registerOnBlur(_e04,_e06);
},doKey:function(e){
if(this.keyFilter){
var key=String.fromCharCode(e.charCode);
if(key.search(this.keyFilter)==-1){
dojo.stopEvent(e);
}
}
},_finish:function(_e09){
this.inherited(arguments);
var n=this.getNode(_e09);
try{
dojox.grid.fire(n,"blur");
}
catch(e){
}
}});
dojox.grid.editors.input=dojox.grid.editors.Input;
dojo.declare("dojox.grid.editors.Select",dojox.grid.editors.Input,{constructor:function(_e0b){
this.options=this.options||this.cell.options;
this.values=this.values||this.cell.values||this.options;
},format:function(_e0c,_e0d){
this.needFormatNode(_e0c,_e0d);
var h=["<select class=\"dojoxGrid-select\">"];
for(var i=0,o,v;((o=this.options[i])!==undefined)&&((v=this.values[i])!==undefined);i++){
h.push("<option",(_e0c==v?" selected":"")," value=\""+v+"\"",">",o,"</option>");
}
h.push("</select>");
return h.join("");
},getValue:function(_e12){
var n=this.getNode(_e12);
if(n){
var i=n.selectedIndex,o=n.options[i];
return this.cell.returnIndex?i:o.value||o.innerHTML;
}
}});
dojox.grid.editors.select=dojox.grid.editors.Select;
dojo.declare("dojox.grid.editors.AlwaysOn",dojox.grid.editors.Input,{alwaysOn:true,_formatNode:function(_e16,_e17){
this.formatNode(this.getNode(_e17),_e16,_e17);
},applyStaticValue:function(_e18){
var e=this.cell.grid.edit;
e.applyCellEdit(this.getValue(_e18),this.cell,_e18);
e.start(this.cell,_e18,true);
}});
dojox.grid.editors.alwaysOn=dojox.grid.editors.AlwaysOn;
dojo.declare("dojox.grid.editors.Bool",dojox.grid.editors.AlwaysOn,{_valueProp:"checked",format:function(_e1a,_e1b){
return "<input class=\"dojoxGrid-input\" type=\"checkbox\""+(_e1a?" checked=\"checked\"":"")+" style=\"width: auto\" />";
},doclick:function(e){
if(e.target.tagName=="INPUT"){
this.applyStaticValue(e.rowIndex);
}
}});
dojox.grid.editors.bool=dojox.grid.editors.Bool;
}
if(!dojo._hasResource["dojo.cldr.supplemental"]){
dojo._hasResource["dojo.cldr.supplemental"]=true;
dojo.provide("dojo.cldr.supplemental");
dojo.cldr.supplemental.getFirstDayOfWeek=function(_e1d){
var _e1e={mv:5,ae:6,af:6,bh:6,dj:6,dz:6,eg:6,er:6,et:6,iq:6,ir:6,jo:6,ke:6,kw:6,lb:6,ly:6,ma:6,om:6,qa:6,sa:6,sd:6,so:6,tn:6,ye:6,as:0,au:0,az:0,bw:0,ca:0,cn:0,fo:0,ge:0,gl:0,gu:0,hk:0,ie:0,il:0,is:0,jm:0,jp:0,kg:0,kr:0,la:0,mh:0,mo:0,mp:0,mt:0,nz:0,ph:0,pk:0,sg:0,th:0,tt:0,tw:0,um:0,us:0,uz:0,vi:0,za:0,zw:0,et:0,mw:0,ng:0,tj:0,sy:4};
var _e1f=dojo.cldr.supplemental._region(_e1d);
var dow=_e1e[_e1f];
return (dow===undefined)?1:dow;
};
dojo.cldr.supplemental._region=function(_e21){
_e21=dojo.i18n.normalizeLocale(_e21);
var tags=_e21.split("-");
var _e23=tags[1];
if(!_e23){
_e23={de:"de",en:"us",es:"es",fi:"fi",fr:"fr",he:"il",hu:"hu",it:"it",ja:"jp",ko:"kr",nl:"nl",pt:"br",sv:"se",zh:"cn"}[tags[0]];
}else{
if(_e23.length==4){
_e23=tags[2];
}
}
return _e23;
};
dojo.cldr.supplemental.getWeekend=function(_e24){
var _e25={eg:5,il:5,sy:5,"in":0,ae:4,bh:4,dz:4,iq:4,jo:4,kw:4,lb:4,ly:4,ma:4,om:4,qa:4,sa:4,sd:4,tn:4,ye:4};
var _e26={ae:5,bh:5,dz:5,iq:5,jo:5,kw:5,lb:5,ly:5,ma:5,om:5,qa:5,sa:5,sd:5,tn:5,ye:5,af:5,ir:5,eg:6,il:6,sy:6};
var _e27=dojo.cldr.supplemental._region(_e24);
var _e28=_e25[_e27];
var end=_e26[_e27];
if(_e28===undefined){
_e28=6;
}
if(end===undefined){
end=0;
}
return {start:_e28,end:end};
};
}
if(!dojo._hasResource["dojo.date"]){
dojo._hasResource["dojo.date"]=true;
dojo.provide("dojo.date");
dojo.date.getDaysInMonth=function(_e2a){
var _e2b=_e2a.getMonth();
var days=[31,28,31,30,31,30,31,31,30,31,30,31];
if(_e2b==1&&dojo.date.isLeapYear(_e2a)){
return 29;
}
return days[_e2b];
};
dojo.date.isLeapYear=function(_e2d){
var year=_e2d.getFullYear();
return !(year%400)||(!(year%4)&&!!(year%100));
};
dojo.date.getTimezoneName=function(_e2f){
var str=_e2f.toString();
var tz="";
var _e32;
var pos=str.indexOf("(");
if(pos>-1){
tz=str.substring(++pos,str.indexOf(")"));
}else{
var pat=/([A-Z\/]+) \d{4}$/;
if((_e32=str.match(pat))){
tz=_e32[1];
}else{
str=_e2f.toLocaleString();
pat=/ ([A-Z\/]+)$/;
if((_e32=str.match(pat))){
tz=_e32[1];
}
}
}
return (tz=="AM"||tz=="PM")?"":tz;
};
dojo.date.compare=function(_e35,_e36,_e37){
_e35=new Date(Number(_e35));
_e36=new Date(Number(_e36||new Date()));
if(_e37!=="undefined"){
if(_e37=="date"){
_e35.setHours(0,0,0,0);
_e36.setHours(0,0,0,0);
}else{
if(_e37=="time"){
_e35.setFullYear(0,0,0);
_e36.setFullYear(0,0,0);
}
}
}
if(_e35>_e36){
return 1;
}
if(_e35<_e36){
return -1;
}
return 0;
};
dojo.date.add=function(date,_e39,_e3a){
var sum=new Date(Number(date));
var _e3c=false;
var _e3d="Date";
switch(_e39){
case "day":
break;
case "weekday":
var days,_e3f;
var mod=_e3a%5;
if(!mod){
days=(_e3a>0)?5:-5;
_e3f=(_e3a>0)?((_e3a-5)/5):((_e3a+5)/5);
}else{
days=mod;
_e3f=parseInt(_e3a/5);
}
var strt=date.getDay();
var adj=0;
if(strt==6&&_e3a>0){
adj=1;
}else{
if(strt==0&&_e3a<0){
adj=-1;
}
}
var trgt=strt+days;
if(trgt==0||trgt==6){
adj=(_e3a>0)?2:-2;
}
_e3a=(7*_e3f)+days+adj;
break;
case "year":
_e3d="FullYear";
_e3c=true;
break;
case "week":
_e3a*=7;
break;
case "quarter":
_e3a*=3;
case "month":
_e3c=true;
_e3d="Month";
break;
case "hour":
case "minute":
case "second":
case "millisecond":
_e3d="UTC"+_e39.charAt(0).toUpperCase()+_e39.substring(1)+"s";
}
if(_e3d){
sum["set"+_e3d](sum["get"+_e3d]()+_e3a);
}
if(_e3c&&(sum.getDate()<date.getDate())){
sum.setDate(0);
}
return sum;
};
dojo.date.difference=function(_e44,_e45,_e46){
_e45=_e45||new Date();
_e46=_e46||"day";
var _e47=_e45.getFullYear()-_e44.getFullYear();
var _e48=1;
switch(_e46){
case "quarter":
var m1=_e44.getMonth();
var m2=_e45.getMonth();
var q1=Math.floor(m1/3)+1;
var q2=Math.floor(m2/3)+1;
q2+=(_e47*4);
_e48=q2-q1;
break;
case "weekday":
var days=Math.round(dojo.date.difference(_e44,_e45,"day"));
var _e4e=parseInt(dojo.date.difference(_e44,_e45,"week"));
var mod=days%7;
if(mod==0){
days=_e4e*5;
}else{
var adj=0;
var aDay=_e44.getDay();
var bDay=_e45.getDay();
_e4e=parseInt(days/7);
mod=days%7;
var _e53=new Date(_e44);
_e53.setDate(_e53.getDate()+(_e4e*7));
var _e54=_e53.getDay();
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
case (_e54+mod)>5:
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
case (_e54+mod)<0:
adj=2;
}
}
}
days+=adj;
days-=(_e4e*2);
}
_e48=days;
break;
case "year":
_e48=_e47;
break;
case "month":
_e48=(_e45.getMonth()-_e44.getMonth())+(_e47*12);
break;
case "week":
_e48=parseInt(dojo.date.difference(_e44,_e45,"day")/7);
break;
case "day":
_e48/=24;
case "hour":
_e48/=60;
case "minute":
_e48/=60;
case "second":
_e48/=1000;
case "millisecond":
_e48*=_e45.getTime()-_e44.getTime();
}
return Math.round(_e48);
};
}
if(!dojo._hasResource["dojo.date.locale"]){
dojo._hasResource["dojo.date.locale"]=true;
dojo.provide("dojo.date.locale");
(function(){
function formatPattern(_e55,_e56,_e57,_e58){
return _e58.replace(/([a-z])\1*/ig,function(_e59){
var s,pad;
var c=_e59.charAt(0);
var l=_e59.length;
var _e5e=["abbr","wide","narrow"];
switch(c){
case "G":
s=_e56[(l<4)?"eraAbbr":"eraNames"][_e55.getFullYear()<0?0:1];
break;
case "y":
s=_e55.getFullYear();
switch(l){
case 1:
break;
case 2:
if(!_e57){
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
s=Math.ceil((_e55.getMonth()+1)/3);
pad=true;
break;
case "M":
var m=_e55.getMonth();
if(l<3){
s=m+1;
pad=true;
}else{
var _e60=["months","format",_e5e[l-3]].join("-");
s=_e56[_e60][m];
}
break;
case "w":
var _e61=0;
s=dojo.date.locale._getWeekOfYear(_e55,_e61);
pad=true;
break;
case "d":
s=_e55.getDate();
pad=true;
break;
case "D":
s=dojo.date.locale._getDayOfYear(_e55);
pad=true;
break;
case "E":
var d=_e55.getDay();
if(l<3){
s=d+1;
pad=true;
}else{
var _e63=["days","format",_e5e[l-3]].join("-");
s=_e56[_e63][d];
}
break;
case "a":
var _e64=(_e55.getHours()<12)?"am":"pm";
s=_e56[_e64];
break;
case "h":
case "H":
case "K":
case "k":
var h=_e55.getHours();
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
s=_e55.getMinutes();
pad=true;
break;
case "s":
s=_e55.getSeconds();
pad=true;
break;
case "S":
s=Math.round(_e55.getMilliseconds()*Math.pow(10,l-3));
pad=true;
break;
case "v":
case "z":
s=dojo.date.getTimezoneName(_e55);
if(s){
break;
}
l=4;
case "Z":
var _e66=_e55.getTimezoneOffset();
var tz=[(_e66<=0?"+":"-"),dojo.string.pad(Math.floor(Math.abs(_e66)/60),2),dojo.string.pad(Math.abs(_e66)%60,2)];
if(l==4){
tz.splice(0,0,"GMT");
tz.splice(3,0,":");
}
s=tz.join("");
break;
default:
throw new Error("dojo.date.locale.format: invalid pattern char: "+_e58);
}
if(pad){
s=dojo.string.pad(s,l);
}
return s;
});
};
dojo.date.locale.format=function(_e68,_e69){
_e69=_e69||{};
var _e6a=dojo.i18n.normalizeLocale(_e69.locale);
var _e6b=_e69.formatLength||"short";
var _e6c=dojo.date.locale._getGregorianBundle(_e6a);
var str=[];
var _e6e=dojo.hitch(this,formatPattern,_e68,_e6c,_e69.fullYear);
if(_e69.selector=="year"){
var year=_e68.getFullYear();
if(_e6a.match(/^zh|^ja/)){
year+="年";
}
return year;
}
if(_e69.selector!="time"){
var _e70=_e69.datePattern||_e6c["dateFormat-"+_e6b];
if(_e70){
str.push(_processPattern(_e70,_e6e));
}
}
if(_e69.selector!="date"){
var _e71=_e69.timePattern||_e6c["timeFormat-"+_e6b];
if(_e71){
str.push(_processPattern(_e71,_e6e));
}
}
var _e72=str.join(" ");
return _e72;
};
dojo.date.locale.regexp=function(_e73){
return dojo.date.locale._parseInfo(_e73).regexp;
};
dojo.date.locale._parseInfo=function(_e74){
_e74=_e74||{};
var _e75=dojo.i18n.normalizeLocale(_e74.locale);
var _e76=dojo.date.locale._getGregorianBundle(_e75);
var _e77=_e74.formatLength||"short";
var _e78=_e74.datePattern||_e76["dateFormat-"+_e77];
var _e79=_e74.timePattern||_e76["timeFormat-"+_e77];
var _e7a;
if(_e74.selector=="date"){
_e7a=_e78;
}else{
if(_e74.selector=="time"){
_e7a=_e79;
}else{
_e7a=_e78+" "+_e79;
}
}
var _e7b=[];
var re=_processPattern(_e7a,dojo.hitch(this,_buildDateTimeRE,_e7b,_e76,_e74));
return {regexp:re,tokens:_e7b,bundle:_e76};
};
dojo.date.locale.parse=function(_e7d,_e7e){
var info=dojo.date.locale._parseInfo(_e7e);
var _e80=info.tokens,_e81=info.bundle;
var re=new RegExp("^"+info.regexp+"$",info.strict?"":"i");
var _e83=re.exec(_e7d);
if(!_e83){
return null;
}
var _e84=["abbr","wide","narrow"];
var _e85=[1970,0,1,0,0,0,0];
var amPm="";
var _e87=dojo.every(_e83,function(v,i){
if(!i){
return true;
}
var _e8a=_e80[i-1];
var l=_e8a.length;
switch(_e8a.charAt(0)){
case "y":
if(l!=2&&_e7e.strict){
_e85[0]=v;
}else{
if(v<100){
v=Number(v);
var year=""+new Date().getFullYear();
var _e8d=year.substring(0,2)*100;
var _e8e=Math.min(Number(year.substring(2,4))+20,99);
var num=(v<_e8e)?_e8d+v:_e8d-100+v;
_e85[0]=num;
}else{
if(_e7e.strict){
return false;
}
_e85[0]=v;
}
}
break;
case "M":
if(l>2){
var _e90=_e81["months-format-"+_e84[l-3]].concat();
if(!_e7e.strict){
v=v.replace(".","").toLowerCase();
_e90=dojo.map(_e90,function(s){
return s.replace(".","").toLowerCase();
});
}
v=dojo.indexOf(_e90,v);
if(v==-1){
return false;
}
}else{
v--;
}
_e85[1]=v;
break;
case "E":
case "e":
var days=_e81["days-format-"+_e84[l-3]].concat();
if(!_e7e.strict){
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
_e85[1]=0;
case "d":
_e85[2]=v;
break;
case "a":
var am=_e7e.am||_e81.am;
var pm=_e7e.pm||_e81.pm;
if(!_e7e.strict){
var _e96=/\./g;
v=v.replace(_e96,"").toLowerCase();
am=am.replace(_e96,"").toLowerCase();
pm=pm.replace(_e96,"").toLowerCase();
}
if(_e7e.strict&&v!=am&&v!=pm){
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
_e85[3]=v;
break;
case "m":
_e85[4]=v;
break;
case "s":
_e85[5]=v;
break;
case "S":
_e85[6]=v;
}
return true;
});
var _e97=+_e85[3];
if(amPm==="p"&&_e97<12){
_e85[3]=_e97+12;
}else{
if(amPm==="a"&&_e97==12){
_e85[3]=0;
}
}
var _e98=new Date(_e85[0],_e85[1],_e85[2],_e85[3],_e85[4],_e85[5],_e85[6]);
if(_e7e.strict){
_e98.setFullYear(_e85[0]);
}
var _e99=_e80.join("");
if(!_e87||(_e99.indexOf("M")!=-1&&_e98.getMonth()!=_e85[1])||(_e99.indexOf("d")!=-1&&_e98.getDate()!=_e85[2])){
return null;
}
return _e98;
};
function _processPattern(_e9a,_e9b,_e9c,_e9d){
var _e9e=function(x){
return x;
};
_e9b=_e9b||_e9e;
_e9c=_e9c||_e9e;
_e9d=_e9d||_e9e;
var _ea0=_e9a.match(/(''|[^'])+/g);
var _ea1=_e9a.charAt(0)=="'";
dojo.forEach(_ea0,function(_ea2,i){
if(!_ea2){
_ea0[i]="";
}else{
_ea0[i]=(_ea1?_e9c:_e9b)(_ea2);
_ea1=!_ea1;
}
});
return _e9d(_ea0.join(""));
};
function _buildDateTimeRE(_ea4,_ea5,_ea6,_ea7){
_ea7=dojo.regexp.escapeString(_ea7);
if(!_ea6.strict){
_ea7=_ea7.replace(" a"," ?a");
}
return _ea7.replace(/([a-z])\1*/ig,function(_ea8){
var s;
var c=_ea8.charAt(0);
var l=_ea8.length;
var p2="",p3="";
if(_ea6.strict){
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
s="[12]\\d|"+p2+"[1-9]|3[01]";
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
var am=_ea6.am||_ea5.am||"AM";
var pm=_ea6.pm||_ea5.pm||"PM";
if(_ea6.strict){
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
if(_ea4){
_ea4.push(_ea8);
}
return "("+s+")";
}).replace(/[\xa0 ]/g,"[\\s\\xa0]");
};
})();
(function(){
var _eb0=[];
dojo.date.locale.addCustomFormats=function(_eb1,_eb2){
_eb0.push({pkg:_eb1,name:_eb2});
};
dojo.date.locale._getGregorianBundle=function(_eb3){
var _eb4={};
dojo.forEach(_eb0,function(desc){
var _eb6=dojo.i18n.getLocalization(desc.pkg,desc.name,_eb3);
_eb4=dojo.mixin(_eb4,_eb6);
},this);
return _eb4;
};
})();
dojo.date.locale.addCustomFormats("dojo.cldr","gregorian");
dojo.date.locale.getNames=function(item,type,use,_eba){
var _ebb;
var _ebc=dojo.date.locale._getGregorianBundle(_eba);
var _ebd=[item,use,type];
if(use=="standAlone"){
var key=_ebd.join("-");
_ebb=_ebc[key];
if(_ebb[0]==1){
_ebb=undefined;
}
}
_ebd[1]="format";
return (_ebb||_ebc[_ebd.join("-")]).concat();
};
dojo.date.locale.isWeekend=function(_ebf,_ec0){
var _ec1=dojo.cldr.supplemental.getWeekend(_ec0);
var day=(_ebf||new Date()).getDay();
if(_ec1.end<_ec1.start){
_ec1.end+=7;
if(day<_ec1.start){
day+=7;
}
}
return day>=_ec1.start&&day<=_ec1.end;
};
dojo.date.locale._getDayOfYear=function(_ec3){
return dojo.date.difference(new Date(_ec3.getFullYear(),0,1,_ec3.getHours()),_ec3)+1;
};
dojo.date.locale._getWeekOfYear=function(_ec4,_ec5){
if(arguments.length==1){
_ec5=0;
}
var _ec6=new Date(_ec4.getFullYear(),0,1).getDay();
var adj=(_ec6-_ec5+7)%7;
var week=Math.floor((dojo.date.locale._getDayOfYear(_ec4)+adj-1)/7);
if(_ec6==_ec5){
week++;
}
return week;
};
}
if(!dojo._hasResource["dijit._Calendar"]){
dojo._hasResource["dijit._Calendar"]=true;
dojo.provide("dijit._Calendar");
dojo.declare("dijit._Calendar",[dijit._Widget,dijit._Templated],{templateString:"<table cellspacing=\"0\" cellpadding=\"0\" class=\"dijitCalendarContainer\">\r\n\t<thead>\r\n\t\t<tr class=\"dijitReset dijitCalendarMonthContainer\" valign=\"top\">\r\n\t\t\t<th class='dijitReset' dojoAttachPoint=\"decrementMonth\">\r\n\t\t\t\t<div class=\"dijitInline dijitCalendarIncrementControl dijitCalendarDecrease\"><span dojoAttachPoint=\"decreaseArrowNode\" class=\"dijitA11ySideArrow dijitCalendarIncrementControl dijitCalendarDecreaseInner\">-</span></div>\r\n\t\t\t</th>\r\n\t\t\t<th class='dijitReset' colspan=\"5\">\r\n\t\t\t\t<div dojoAttachPoint=\"monthLabelSpacer\" class=\"dijitCalendarMonthLabelSpacer\"></div>\r\n\t\t\t\t<div dojoAttachPoint=\"monthLabelNode\" class=\"dijitCalendarMonthLabel\"></div>\r\n\t\t\t</th>\r\n\t\t\t<th class='dijitReset' dojoAttachPoint=\"incrementMonth\">\r\n\t\t\t\t<div class=\"dijitInline dijitCalendarIncrementControl dijitCalendarIncrease\"><span dojoAttachPoint=\"increaseArrowNode\" class=\"dijitA11ySideArrow dijitCalendarIncrementControl dijitCalendarIncreaseInner\">+</span></div>\r\n\t\t\t</th>\r\n\t\t</tr>\r\n\t\t<tr>\r\n\t\t\t<th class=\"dijitReset dijitCalendarDayLabelTemplate\"><span class=\"dijitCalendarDayLabel\"></span></th>\r\n\t\t</tr>\r\n\t</thead>\r\n\t<tbody dojoAttachEvent=\"onclick: _onDayClick, onmouseover: _onDayMouseOver, onmouseout: _onDayMouseOut\" class=\"dijitReset dijitCalendarBodyContainer\">\r\n\t\t<tr class=\"dijitReset dijitCalendarWeekTemplate\">\r\n\t\t\t<td class=\"dijitReset dijitCalendarDateTemplate\"><span class=\"dijitCalendarDateLabel\"></span></td>\r\n\t\t</tr>\r\n\t</tbody>\r\n\t<tfoot class=\"dijitReset dijitCalendarYearContainer\">\r\n\t\t<tr>\r\n\t\t\t<td class='dijitReset' valign=\"top\" colspan=\"7\">\r\n\t\t\t\t<h3 class=\"dijitCalendarYearLabel\">\r\n\t\t\t\t\t<span dojoAttachPoint=\"previousYearLabelNode\" class=\"dijitInline dijitCalendarPreviousYear\"></span>\r\n\t\t\t\t\t<span dojoAttachPoint=\"currentYearLabelNode\" class=\"dijitInline dijitCalendarSelectedYear\"></span>\r\n\t\t\t\t\t<span dojoAttachPoint=\"nextYearLabelNode\" class=\"dijitInline dijitCalendarNextYear\"></span>\r\n\t\t\t\t</h3>\r\n\t\t\t</td>\r\n\t\t</tr>\r\n\t</tfoot>\r\n</table>\t\r\n",value:new Date(),dayWidth:"narrow",setValue:function(_ec9){
dojo.deprecated("dijit.Calendar:setValue() is deprecated.  Use attr('value', ...) instead.","","2.0");
this.attr("value",_ec9);
},_setValueAttr:function(_eca){
if(!this.value||dojo.date.compare(_eca,this.value)){
_eca=new Date(_eca);
this.displayMonth=new Date(_eca);
if(!this.isDisabledDate(_eca,this.lang)){
this.value=_eca;
this.value.setHours(0,0,0,0);
this.onChange(this.value);
}
this._populateGrid();
}
},_setText:function(node,text){
while(node.firstChild){
node.removeChild(node.firstChild);
}
node.appendChild(dojo.doc.createTextNode(text));
},_populateGrid:function(){
var _ecd=this.displayMonth;
_ecd.setDate(1);
var _ece=_ecd.getDay();
var _ecf=dojo.date.getDaysInMonth(_ecd);
var _ed0=dojo.date.getDaysInMonth(dojo.date.add(_ecd,"month",-1));
var _ed1=new Date();
var _ed2=this.value;
var _ed3=dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
if(_ed3>_ece){
_ed3-=7;
}
dojo.query(".dijitCalendarDateTemplate",this.domNode).forEach(function(_ed4,i){
i+=_ed3;
var date=new Date(_ecd);
var _ed7,_ed8="dijitCalendar",adj=0;
if(i<_ece){
_ed7=_ed0-_ece+i+1;
adj=-1;
_ed8+="Previous";
}else{
if(i>=(_ece+_ecf)){
_ed7=i-_ece-_ecf+1;
adj=1;
_ed8+="Next";
}else{
_ed7=i-_ece+1;
_ed8+="Current";
}
}
if(adj){
date=dojo.date.add(date,"month",adj);
}
date.setDate(_ed7);
if(!dojo.date.compare(date,_ed1,"date")){
_ed8="dijitCalendarCurrentDate "+_ed8;
}
if(!dojo.date.compare(date,_ed2,"date")){
_ed8="dijitCalendarSelectedDate "+_ed8;
}
if(this.isDisabledDate(date,this.lang)){
_ed8="dijitCalendarDisabledDate "+_ed8;
}
var _eda=this.getClassForDate(date,this.lang);
if(_eda){
_ed8=_eda+" "+_ed8;
}
_ed4.className=_ed8+"Month dijitCalendarDateTemplate";
_ed4.dijitDateValue=date.valueOf();
var _edb=dojo.query(".dijitCalendarDateLabel",_ed4)[0];
this._setText(_edb,date.getDate());
},this);
var _edc=dojo.date.locale.getNames("months","wide","standAlone",this.lang);
this._setText(this.monthLabelNode,_edc[_ecd.getMonth()]);
var y=_ecd.getFullYear()-1;
var d=new Date();
dojo.forEach(["previous","current","next"],function(name){
d.setFullYear(y++);
this._setText(this[name+"YearLabelNode"],dojo.date.locale.format(d,{selector:"year",locale:this.lang}));
},this);
var _ee0=this;
var _ee1=function(_ee2,_ee3,adj){
_ee0._connects.push(dijit.typematic.addMouseListener(_ee0[_ee2],_ee0,function(_ee5){
if(_ee5>=0){
_ee0._adjustDisplay(_ee3,adj);
}
},0.8,500));
};
_ee1("incrementMonth","month",1);
_ee1("decrementMonth","month",-1);
_ee1("nextYearLabelNode","year",1);
_ee1("previousYearLabelNode","year",-1);
},goToToday:function(){
this.attr("value",new Date());
},postCreate:function(){
this.inherited(arguments);
var _ee6=dojo.hitch(this,function(_ee7,n){
var _ee9=dojo.query(_ee7,this.domNode)[0];
for(var i=0;i<n;i++){
_ee9.parentNode.appendChild(_ee9.cloneNode(true));
}
});
_ee6(".dijitCalendarDayLabelTemplate",6);
_ee6(".dijitCalendarDateTemplate",6);
_ee6(".dijitCalendarWeekTemplate",5);
var _eeb=dojo.date.locale.getNames("days",this.dayWidth,"standAlone",this.lang);
var _eec=dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
dojo.query(".dijitCalendarDayLabel",this.domNode).forEach(function(_eed,i){
this._setText(_eed,_eeb[(i+_eec)%7]);
},this);
var _eef=dojo.date.locale.getNames("months","wide","standAlone",this.lang);
dojo.forEach(_eef,function(name){
var _ef1=dojo.doc.createElement("div");
this._setText(_ef1,name);
this.monthLabelSpacer.appendChild(_ef1);
},this);
this.value=null;
this.attr("value",new Date());
},_adjustDisplay:function(part,_ef3){
this.displayMonth=dojo.date.add(this.displayMonth,part,_ef3);
this._populateGrid();
},_onDayClick:function(evt){
var node=evt.target;
dojo.stopEvent(evt);
while(!node.dijitDateValue){
node=node.parentNode;
}
if(!dojo.hasClass(node,"dijitCalendarDisabledDate")){
this.attr("value",node.dijitDateValue);
this.onValueSelected(this.value);
}
},_onDayMouseOver:function(evt){
var node=evt.target;
if(node&&(node.dijitDateValue||node==this.previousYearLabelNode||node==this.nextYearLabelNode)){
dojo.addClass(node,"dijitCalendarHoveredDate");
this._currentNode=node;
}
},_onDayMouseOut:function(evt){
if(!this._currentNode){
return;
}
for(var node=evt.relatedTarget;node;){
if(node==this._currentNode){
return;
}
try{
node=node.parentNode;
}
catch(x){
node=null;
}
}
dojo.removeClass(this._currentNode,"dijitCalendarHoveredDate");
this._currentNode=null;
},onValueSelected:function(date){
},onChange:function(date){
},isDisabledDate:function(_efc,_efd){
},getClassForDate:function(_efe,_eff){
}});
}
if(!dojo._hasResource["dijit.form._DateTimeTextBox"]){
dojo._hasResource["dijit.form._DateTimeTextBox"]=true;
dojo.provide("dijit.form._DateTimeTextBox");
dojo.declare("dijit.form._DateTimeTextBox",dijit.form.RangeBoundTextBox,{regExpGen:dojo.date.locale.regexp,compare:dojo.date.compare,format:function(_f00,_f01){
if(!_f00){
return "";
}
return dojo.date.locale.format(_f00,_f01);
},parse:function(_f02,_f03){
return dojo.date.locale.parse(_f02,_f03)||(this._isEmpty(_f02)?null:undefined);
},serialize:dojo.date.stamp.toISOString,value:new Date(""),popupClass:"",_selector:"",postMixInProperties:function(){
this.inherited(arguments);
if(!this.value||this.value.toString()==dijit.form._DateTimeTextBox.prototype.value.toString()){
this.value=null;
}
var _f04=this.constraints;
_f04.selector=this._selector;
_f04.fullYear=true;
var _f05=dojo.date.stamp.fromISOString;
if(typeof _f04.min=="string"){
_f04.min=_f05(_f04.min);
}
if(typeof _f04.max=="string"){
_f04.max=_f05(_f04.max);
}
},_onFocus:function(evt){
this._open();
},_setValueAttr:function(_f07,_f08,_f09){
this.inherited(arguments);
if(this._picker){
if(!_f07){
_f07=new Date();
}
this._picker.attr("value",_f07);
}
},_open:function(){
if(this.disabled||this.readOnly||!this.popupClass){
return;
}
var _f0a=this;
if(!this._picker){
var _f0b=dojo.getObject(this.popupClass,false);
this._picker=new _f0b({onValueSelected:function(_f0c){
if(_f0a._tabbingAway){
delete _f0a._tabbingAway;
}else{
_f0a.focus();
}
setTimeout(dojo.hitch(_f0a,"_close"),1);
dijit.form._DateTimeTextBox.superclass._setValueAttr.call(_f0a,_f0c,true);
},lang:_f0a.lang,constraints:_f0a.constraints,isDisabledDate:function(date){
var _f0e=dojo.date.compare;
var _f0f=_f0a.constraints;
return _f0f&&(_f0f.min&&(_f0e(_f0f.min,date,"date")>0)||(_f0f.max&&_f0e(_f0f.max,date,"date")<0));
}});
this._picker.attr("value",this.attr("value")||new Date());
}
if(!this._opened){
dijit.popup.open({parent:this,popup:this._picker,around:this.domNode,onCancel:dojo.hitch(this,this._close),onClose:function(){
_f0a._opened=false;
}});
this._opened=true;
}
dojo.marginBox(this._picker.domNode,{w:this.domNode.offsetWidth});
},_close:function(){
if(this._opened){
dijit.popup.close(this._picker);
this._opened=false;
}
},_onBlur:function(){
this._close();
if(this._picker){
this._picker.destroy();
delete this._picker;
}
this.inherited(arguments);
},_getDisplayedValueAttr:function(){
return this.textbox.value;
},_setDisplayedValueAttr:function(_f10,_f11){
this._setValueAttr(this.parse(_f10,this.constraints),_f11,_f10);
},destroy:function(){
if(this._picker){
this._picker.destroy();
delete this._picker;
}
this.inherited(arguments);
},_onKeyPress:function(e){
var p=this._picker,dk=dojo.keys;
if(p&&this._opened&&p.handleKey){
if(p.handleKey(e)===false){
return;
}
}
if(this._opened&&e.charOrCode==dk.ESCAPE&&!e.shiftKey&&!e.ctrlKey&&!e.altKey){
this._close();
dojo.stopEvent(e);
}else{
if(!this._opened&&e.charOrCode==dk.DOWN_ARROW){
this._open();
dojo.stopEvent(e);
}else{
if(dijit.form._DateTimeTextBox.superclass._onKeyPress.apply(this,arguments)){
if(e.charOrCode===dk.TAB){
this._tabbingAway=true;
}else{
if(this._opened&&(e.keyChar||e.charOrCode===dk.BACKSPACE||e.charOrCode==dk.DELETE)){
setTimeout(dojo.hitch(this,function(){
dijit.placeOnScreenAroundElement(p.domNode.parentNode,this.domNode,{"BL":"TL","TL":"BL"},p.orient?dojo.hitch(p,"orient"):null);
}),1);
}
}
}
}
}
}});
}
if(!dojo._hasResource["dijit.form.DateTextBox"]){
dojo._hasResource["dijit.form.DateTextBox"]=true;
dojo.provide("dijit.form.DateTextBox");
dojo.declare("dijit.form.DateTextBox",dijit.form._DateTimeTextBox,{baseClass:"dijitTextBox dijitDateTextBox",popupClass:"dijit._Calendar",_selector:"date"});
}
if(!dojo._hasResource["dijit._TimePicker"]){
dojo._hasResource["dijit._TimePicker"]=true;
dojo.provide("dijit._TimePicker");
dojo.declare("dijit._TimePicker",[dijit._Widget,dijit._Templated],{templateString:"<div id=\"widget_${id}\" class=\"dijitMenu ${baseClass}\"\r\n    ><div dojoAttachPoint=\"upArrow\" class=\"dijitButtonNode dijitUpArrowButton\" dojoAttachEvent=\"onmouseenter:_buttonMouse,onmouseleave:_buttonMouse\"\r\n\t\t><div class=\"dijitReset dijitInline dijitArrowButtonInner\" wairole=\"presentation\" role=\"presentation\">&nbsp;</div\r\n\t\t><div class=\"dijitArrowButtonChar\">&#9650;</div></div\r\n    ><div dojoAttachPoint=\"timeMenu,focusNode\" dojoAttachEvent=\"onclick:_onOptionSelected,onmouseover,onmouseout\"></div\r\n    ><div dojoAttachPoint=\"downArrow\" class=\"dijitButtonNode dijitDownArrowButton\" dojoAttachEvent=\"onmouseenter:_buttonMouse,onmouseleave:_buttonMouse\"\r\n\t\t><div class=\"dijitReset dijitInline dijitArrowButtonInner\" wairole=\"presentation\" role=\"presentation\">&nbsp;</div\r\n\t\t><div class=\"dijitArrowButtonChar\">&#9660;</div></div\r\n></div>\r\n",baseClass:"dijitTimePicker",clickableIncrement:"T00:15:00",visibleIncrement:"T01:00:00",visibleRange:"T05:00:00",value:new Date(),_visibleIncrement:2,_clickableIncrement:1,_totalIncrements:10,constraints:{},serialize:dojo.date.stamp.toISOString,_filterString:"",setValue:function(_f15){
dojo.deprecated("dijit._TimePicker:setValue() is deprecated.  Use attr('value') instead.","","2.0");
this.attr("value",_f15);
},_setValueAttr:function(date){
this.value=date;
this._showText();
},onOpen:function(best){
if(this._beenOpened&&this.domNode.parentNode){
var p=dijit.byId(this.domNode.parentNode.dijitPopupParent);
if(p){
var val=p.getDisplayedValue();
if(val&&!p.parse(val,p.constraints)){
this._filterString=val;
}else{
this._filterString="";
}
this._showText();
}
}
this._beenOpened=true;
},isDisabledDate:function(_f1a,_f1b){
return false;
},_getFilteredNodes:function(_f1c,_f1d,_f1e){
var _f1f=[],n,i=_f1c,max=this._maxIncrement+Math.abs(i),chk=_f1e?-1:1,dec=_f1e?1:0,inc=_f1e?0:1;
do{
i=i-dec;
n=this._createOption(i);
if(n){
_f1f.push(n);
}
i=i+inc;
}while(_f1f.length<_f1d&&(i*chk)<max);
if(_f1e){
_f1f.reverse();
}
return _f1f;
},_showText:function(){
this.timeMenu.innerHTML="";
var _f26=dojo.date.stamp.fromISOString;
this._clickableIncrementDate=_f26(this.clickableIncrement);
this._visibleIncrementDate=_f26(this.visibleIncrement);
this._visibleRangeDate=_f26(this.visibleRange);
var _f27=function(date){
return date.getHours()*60*60+date.getMinutes()*60+date.getSeconds();
};
var _f29=_f27(this._clickableIncrementDate);
var _f2a=_f27(this._visibleIncrementDate);
var _f2b=_f27(this._visibleRangeDate);
var time=this.value.getTime();
this._refDate=new Date(time-time%(_f2a*1000));
this._refDate.setFullYear(1970,0,1);
this._clickableIncrement=1;
this._totalIncrements=_f2b/_f29;
this._visibleIncrement=_f2a/_f29;
this._maxIncrement=(60*60*24)/_f29;
var _f2d=this._getFilteredNodes(0,this._totalIncrements>>1,true);
var _f2e=this._getFilteredNodes(0,this._totalIncrements>>1,false);
if(_f2d.length<this._totalIncrements>>1){
_f2d=_f2d.slice(_f2d.length/2);
_f2e=_f2e.slice(0,_f2e.length/2);
}
dojo.forEach(_f2d.concat(_f2e),function(n){
this.timeMenu.appendChild(n);
},this);
},postCreate:function(){
if(this.constraints===dijit._TimePicker.prototype.constraints){
this.constraints={};
}
dojo.mixin(this,this.constraints);
if(!this.constraints.locale){
this.constraints.locale=this.lang;
}
this.connect(this.timeMenu,dojo.isIE?"onmousewheel":"DOMMouseScroll","_mouseWheeled");
var _f30=this;
var _f31=function(){
_f30._connects.push(dijit.typematic.addMouseListener.apply(null,arguments));
};
_f31(this.upArrow,this,this._onArrowUp,0.8,500);
_f31(this.downArrow,this,this._onArrowDown,0.8,500);
var _f32=function(cb){
return function(cnt){
if(cnt>0){
cb.call(this,arguments);
}
};
};
var _f35=function(node,cb){
return function(e){
dojo.stopEvent(e);
dijit.typematic.trigger(e,this,node,_f32(cb),node,0.85,250);
};
};
this.connect(this.upArrow,"onmouseover",_f35(this.upArrow,this._onArrowUp));
this.connect(this.downArrow,"onmouseover",_f35(this.downArrow,this._onArrowDown));
this.inherited(arguments);
},_buttonMouse:function(e){
dojo.toggleClass(e.currentTarget,"dijitButtonNodeHover",e.type=="mouseover");
},_createOption:function(_f3a){
var date=new Date(this._refDate);
var _f3c=this._clickableIncrementDate;
date.setHours(date.getHours()+_f3c.getHours()*_f3a,date.getMinutes()+_f3c.getMinutes()*_f3a,date.getSeconds()+_f3c.getSeconds()*_f3a);
var _f3d=dojo.date.locale.format(date,this.constraints);
if(this._filterString&&_f3d.toLowerCase().indexOf(this._filterString)!==0){
return null;
}
var div=dojo.doc.createElement("div");
div.date=date;
div.index=_f3a;
var _f3f=dojo.doc.createElement("div");
dojo.addClass(div,this.baseClass+"Item");
dojo.addClass(_f3f,this.baseClass+"ItemInner");
_f3f.innerHTML=_f3d;
div.appendChild(_f3f);
if(_f3a%this._visibleIncrement<1&&_f3a%this._visibleIncrement>-1){
dojo.addClass(div,this.baseClass+"Marker");
}else{
if(!(_f3a%this._clickableIncrement)){
dojo.addClass(div,this.baseClass+"Tick");
}
}
if(this.isDisabledDate(date)){
dojo.addClass(div,this.baseClass+"ItemDisabled");
}
if(!dojo.date.compare(this.value,date,this.constraints.selector)){
div.selected=true;
dojo.addClass(div,this.baseClass+"ItemSelected");
if(dojo.hasClass(div,this.baseClass+"Marker")){
dojo.addClass(div,this.baseClass+"MarkerSelected");
}else{
dojo.addClass(div,this.baseClass+"TickSelected");
}
}
return div;
},_onOptionSelected:function(tgt){
var _f41=tgt.target.date||tgt.target.parentNode.date;
if(!_f41||this.isDisabledDate(_f41)){
return;
}
this._highlighted_option=null;
this.attr("value",_f41);
this.onValueSelected(_f41);
},onValueSelected:function(_f42){
},_highlightOption:function(node,_f44){
if(!node){
return;
}
if(_f44){
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
dojo.toggleClass(node,this.baseClass+"ItemHover",_f44);
if(dojo.hasClass(node,this.baseClass+"Marker")){
dojo.toggleClass(node,this.baseClass+"MarkerHover",_f44);
}else{
dojo.toggleClass(node,this.baseClass+"TickHover",_f44);
}
},onmouseover:function(e){
var tgr=(e.target.parentNode===this.timeMenu)?e.target:e.target.parentNode;
if(!dojo.hasClass(tgr,this.baseClass+"Item")){
return;
}
this._highlightOption(tgr,true);
},onmouseout:function(e){
var tgr=(e.target.parentNode===this.timeMenu)?e.target:e.target.parentNode;
this._highlightOption(tgr,false);
},_mouseWheeled:function(e){
dojo.stopEvent(e);
var _f4a=(dojo.isIE?e.wheelDelta:-e.detail);
this[(_f4a>0?"_onArrowUp":"_onArrowDown")]();
},_onArrowUp:function(){
var _f4b=this.timeMenu.childNodes[0].index;
var divs=this._getFilteredNodes(_f4b,1,true);
if(divs.length){
this.timeMenu.removeChild(this.timeMenu.childNodes[this.timeMenu.childNodes.length-1]);
this.timeMenu.insertBefore(divs[0],this.timeMenu.childNodes[0]);
}
},_onArrowDown:function(){
var _f4d=this.timeMenu.childNodes[this.timeMenu.childNodes.length-1].index+1;
var divs=this._getFilteredNodes(_f4d,1,false);
if(divs.length){
this.timeMenu.removeChild(this.timeMenu.childNodes[0]);
this.timeMenu.appendChild(divs[0]);
}
},handleKey:function(e){
var dk=dojo.keys;
if(e.keyChar||e.charOrCode===dk.BACKSPACE||e.charOrCode==dk.DELETE){
setTimeout(dojo.hitch(this,function(){
this._filterString=e.target.value.toLowerCase();
this._showText();
}),1);
}else{
if(e.charOrCode==dk.DOWN_ARROW||e.charOrCode==dk.UP_ARROW){
dojo.stopEvent(e);
if(this._highlighted_option&&!this._highlighted_option.parentNode){
this._highlighted_option=null;
}
var _f51=this.timeMenu,tgt=this._highlighted_option||dojo.query("."+this.baseClass+"ItemSelected",_f51)[0];
if(!tgt){
tgt=_f51.childNodes[0];
}else{
if(_f51.childNodes.length){
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
}else{
if(this._highlighted_option&&(e.charOrCode==dk.ENTER||e.charOrCode===dk.TAB)){
if(e.charOrCode==dk.ENTER){
dojo.stopEvent(e);
}
setTimeout(dojo.hitch(this,function(){
this._onOptionSelected({target:this._highlighted_option});
}),1);
}
}
}
}});
}
if(!dojo._hasResource["dijit.form.TimeTextBox"]){
dojo._hasResource["dijit.form.TimeTextBox"]=true;
dojo.provide("dijit.form.TimeTextBox");
dojo.declare("dijit.form.TimeTextBox",dijit.form._DateTimeTextBox,{baseClass:"dijitTextBox dijitTimeTextBox",popupClass:"dijit._TimePicker",_selector:"time"});
}
if(!dojo._hasResource["dijit.form._Spinner"]){
dojo._hasResource["dijit.form._Spinner"]=true;
dojo.provide("dijit.form._Spinner");
dojo.declare("dijit.form._Spinner",dijit.form.RangeBoundTextBox,{defaultTimeout:500,timeoutChangeRate:0.9,smallDelta:1,largeDelta:10,templateString:"<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\r\n\tid=\"widget_${id}\"\r\n\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\" waiRole=\"presentation\"\r\n\t><div class=\"dijitInputLayoutContainer\"\r\n\t\t><div class=\"dijitReset dijitSpinnerButtonContainer\"\r\n\t\t\t>&nbsp;<div class=\"dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitUpArrowButton\"\r\n\t\t\t\tdojoAttachPoint=\"upArrowNode\"\r\n\t\t\t\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse\"\r\n\t\t\t\tstateModifier=\"UpArrow\"\r\n\t\t\t\t><div class=\"dijitArrowButtonInner\">&thinsp;</div\r\n\t\t\t\t><div class=\"dijitArrowButtonChar\">&#9650;</div\r\n\t\t\t></div\r\n\t\t\t><div class=\"dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitDownArrowButton\"\r\n\t\t\t\tdojoAttachPoint=\"downArrowNode\"\r\n\t\t\t\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse\"\r\n\t\t\t\tstateModifier=\"DownArrow\"\r\n\t\t\t\t><div class=\"dijitArrowButtonInner\">&thinsp;</div\r\n\t\t\t\t><div class=\"dijitArrowButtonChar\">&#9660;</div\r\n\t\t\t></div\r\n\t\t></div\r\n\t\t><div class=\"dijitReset dijitValidationIcon\"><br></div\r\n\t\t><div class=\"dijitReset dijitValidationIconText\">&Chi;</div\r\n\t\t><div class=\"dijitReset dijitInputField\"\r\n\t\t\t><input class='dijitReset' dojoAttachPoint=\"textbox,focusNode\" type=\"${type}\" dojoAttachEvent=\"onfocus:_update,onkeyup:_update,onkeypress:_onKeyPress\"\r\n\t\t\t\twaiRole=\"spinbutton\" autocomplete=\"off\" name=\"${name}\"\r\n\t\t/></div\r\n\t></div\r\n></div>\r\n",baseClass:"dijitSpinner",adjust:function(val,_f54){
return val;
},_arrowState:function(node,_f56){
this._active=_f56;
this.stateModifier=node.getAttribute("stateModifier")||"";
this._setStateClass();
},_arrowPressed:function(_f57,_f58,_f59){
if(this.disabled||this.readOnly){
return;
}
this._arrowState(_f57,true);
this._setValueAttr(this.adjust(this.attr("value"),_f58*_f59),false);
dijit.selectInputText(this.textbox,this.textbox.value.length);
},_arrowReleased:function(node){
this._wheelTimer=null;
if(this.disabled||this.readOnly){
return;
}
this._arrowState(node,false);
},_typematicCallback:function(_f5b,node,evt){
var inc=this.smallDelta;
if(node==this.textbox){
k=dojo.keys;
var key=evt.charOrCode;
inc=(key==k.PAGE_UP||key==k.PAGE_DOWN)?this.largeDelta:this.smallDelta;
node=(key==k.UP_ARROW||key==k.PAGE_UP)?this.upArrowNode:this.downArrowNode;
}
if(_f5b==-1){
this._arrowReleased(node);
}else{
this._arrowPressed(node,(node==this.upArrowNode)?1:-1,inc);
}
},_wheelTimer:null,_mouseWheeled:function(evt){
dojo.stopEvent(evt);
var _f61=evt.detail?(evt.detail*-1):(evt.wheelDelta/120);
if(_f61!==0){
var node=this[(_f61>0?"upArrowNode":"downArrowNode")];
this._arrowPressed(node,_f61,this.smallDelta);
if(!this._wheelTimer){
clearTimeout(this._wheelTimer);
}
this._wheelTimer=setTimeout(dojo.hitch(this,"_arrowReleased",node),50);
}
},postCreate:function(){
this.inherited("postCreate",arguments);
this.connect(this.domNode,!dojo.isMozilla?"onmousewheel":"DOMMouseScroll","_mouseWheeled");
this._connects.push(dijit.typematic.addListener(this.upArrowNode,this.textbox,{charOrCode:dojo.keys.UP_ARROW,ctrlKey:false,altKey:false,shiftKey:false},this,"_typematicCallback",this.timeoutChangeRate,this.defaultTimeout));
this._connects.push(dijit.typematic.addListener(this.downArrowNode,this.textbox,{charOrCode:dojo.keys.DOWN_ARROW,ctrlKey:false,altKey:false,shiftKey:false},this,"_typematicCallback",this.timeoutChangeRate,this.defaultTimeout));
this._connects.push(dijit.typematic.addListener(this.upArrowNode,this.textbox,{charOrCode:dojo.keys.PAGE_UP,ctrlKey:false,altKey:false,shiftKey:false},this,"_typematicCallback",this.timeoutChangeRate,this.defaultTimeout));
this._connects.push(dijit.typematic.addListener(this.downArrowNode,this.textbox,{charOrCode:dojo.keys.PAGE_DOWN,ctrlKey:false,altKey:false,shiftKey:false},this,"_typematicCallback",this.timeoutChangeRate,this.defaultTimeout));
if(dojo.isIE){
var _f63=this;
this.connect(this.domNode,"onresize",function(){
setTimeout(dojo.hitch(_f63,function(){
var sz=this.upArrowNode.parentNode.offsetHeight;
if(sz){
this.upArrowNode.style.height=sz>>1;
this.downArrowNode.style.height=sz-(sz>>1);
this.focusNode.parentNode.style.height=sz;
}
this._setStateClass();
}),0);
});
}
}});
}
if(!dojo._hasResource["dojo.number"]){
dojo._hasResource["dojo.number"]=true;
dojo.provide("dojo.number");
dojo.number.format=function(_f65,_f66){
_f66=dojo.mixin({},_f66||{});
var _f67=dojo.i18n.normalizeLocale(_f66.locale);
var _f68=dojo.i18n.getLocalization("dojo.cldr","number",_f67);
_f66.customs=_f68;
var _f69=_f66.pattern||_f68[(_f66.type||"decimal")+"Format"];
if(isNaN(_f65)){
return null;
}
return dojo.number._applyPattern(_f65,_f69,_f66);
};
dojo.number._numberPatternRE=/[#0,]*[#0](?:\.0*#*)?/;
dojo.number._applyPattern=function(_f6a,_f6b,_f6c){
_f6c=_f6c||{};
var _f6d=_f6c.customs.group;
var _f6e=_f6c.customs.decimal;
var _f6f=_f6b.split(";");
var _f70=_f6f[0];
_f6b=_f6f[(_f6a<0)?1:0]||("-"+_f70);
if(_f6b.indexOf("%")!=-1){
_f6a*=100;
}else{
if(_f6b.indexOf("‰")!=-1){
_f6a*=1000;
}else{
if(_f6b.indexOf("¤")!=-1){
_f6d=_f6c.customs.currencyGroup||_f6d;
_f6e=_f6c.customs.currencyDecimal||_f6e;
_f6b=_f6b.replace(/\u00a4{1,3}/,function(_f71){
var prop=["symbol","currency","displayName"][_f71.length-1];
return _f6c[prop]||_f6c.currency||"";
});
}else{
if(_f6b.indexOf("E")!=-1){
throw new Error("exponential notation not supported");
}
}
}
}
var _f73=dojo.number._numberPatternRE;
var _f74=_f70.match(_f73);
if(!_f74){
throw new Error("unable to find a number expression in pattern: "+_f6b);
}
if(_f6c.fractional===false){
_f6c.places=0;
}
return _f6b.replace(_f73,dojo.number._formatAbsolute(_f6a,_f74[0],{decimal:_f6e,group:_f6d,places:_f6c.places,round:_f6c.round}));
};
dojo.number.round=function(_f75,_f76,_f77){
var _f78=String(_f75).split(".");
var _f79=(_f78[1]&&_f78[1].length)||0;
if(_f79>_f76){
var _f7a=Math.pow(10,_f76);
if(_f77>0){
_f7a*=10/_f77;
_f76++;
}
_f75=Math.round(_f75*_f7a)/_f7a;
_f78=String(_f75).split(".");
_f79=(_f78[1]&&_f78[1].length)||0;
if(_f79>_f76){
_f78[1]=_f78[1].substr(0,_f76);
_f75=Number(_f78.join("."));
}
}
return _f75;
};
dojo.number._formatAbsolute=function(_f7b,_f7c,_f7d){
_f7d=_f7d||{};
if(_f7d.places===true){
_f7d.places=0;
}
if(_f7d.places===Infinity){
_f7d.places=6;
}
var _f7e=_f7c.split(".");
var _f7f=(_f7d.places>=0)?_f7d.places:(_f7e[1]&&_f7e[1].length)||0;
if(!(_f7d.round<0)){
_f7b=dojo.number.round(_f7b,_f7f,_f7d.round);
}
var _f80=String(Math.abs(_f7b)).split(".");
var _f81=_f80[1]||"";
if(_f7d.places){
var _f82=dojo.isString(_f7d.places)&&_f7d.places.indexOf(",");
if(_f82){
_f7d.places=_f7d.places.substring(_f82+1);
}
_f80[1]=dojo.string.pad(_f81.substr(0,_f7d.places),_f7d.places,"0",true);
}else{
if(_f7e[1]&&_f7d.places!==0){
var pad=_f7e[1].lastIndexOf("0")+1;
if(pad>_f81.length){
_f80[1]=dojo.string.pad(_f81,pad,"0",true);
}
var _f84=_f7e[1].length;
if(_f84<_f81.length){
_f80[1]=_f81.substr(0,_f84);
}
}else{
if(_f80[1]){
_f80.pop();
}
}
}
var _f85=_f7e[0].replace(",","");
pad=_f85.indexOf("0");
if(pad!=-1){
pad=_f85.length-pad;
if(pad>_f80[0].length){
_f80[0]=dojo.string.pad(_f80[0],pad);
}
if(_f85.indexOf("#")==-1){
_f80[0]=_f80[0].substr(_f80[0].length-pad);
}
}
var _f86=_f7e[0].lastIndexOf(",");
var _f87,_f88;
if(_f86!=-1){
_f87=_f7e[0].length-_f86-1;
var _f89=_f7e[0].substr(0,_f86);
_f86=_f89.lastIndexOf(",");
if(_f86!=-1){
_f88=_f89.length-_f86-1;
}
}
var _f8a=[];
for(var _f8b=_f80[0];_f8b;){
var off=_f8b.length-_f87;
_f8a.push((off>0)?_f8b.substr(off):_f8b);
_f8b=(off>0)?_f8b.slice(0,off):"";
if(_f88){
_f87=_f88;
delete _f88;
}
}
_f80[0]=_f8a.reverse().join(_f7d.group||",");
return _f80.join(_f7d.decimal||".");
};
dojo.number.regexp=function(_f8d){
return dojo.number._parseInfo(_f8d).regexp;
};
dojo.number._parseInfo=function(_f8e){
_f8e=_f8e||{};
var _f8f=dojo.i18n.normalizeLocale(_f8e.locale);
var _f90=dojo.i18n.getLocalization("dojo.cldr","number",_f8f);
var _f91=_f8e.pattern||_f90[(_f8e.type||"decimal")+"Format"];
var _f92=_f90.group;
var _f93=_f90.decimal;
var _f94=1;
if(_f91.indexOf("%")!=-1){
_f94/=100;
}else{
if(_f91.indexOf("‰")!=-1){
_f94/=1000;
}else{
var _f95=_f91.indexOf("¤")!=-1;
if(_f95){
_f92=_f90.currencyGroup||_f92;
_f93=_f90.currencyDecimal||_f93;
}
}
}
var _f96=_f91.split(";");
if(_f96.length==1){
_f96.push("-"+_f96[0]);
}
var re=dojo.regexp.buildGroupRE(_f96,function(_f98){
_f98="(?:"+dojo.regexp.escapeString(_f98,".")+")";
return _f98.replace(dojo.number._numberPatternRE,function(_f99){
var _f9a={signed:false,separator:_f8e.strict?_f92:[_f92,""],fractional:_f8e.fractional,decimal:_f93,exponent:false};
var _f9b=_f99.split(".");
var _f9c=_f8e.places;
if(_f9b.length==1||_f9c===0){
_f9a.fractional=false;
}else{
if(_f9c===undefined){
_f9c=_f8e.pattern?_f9b[1].lastIndexOf("0")+1:Infinity;
}
if(_f9c&&_f8e.fractional==undefined){
_f9a.fractional=true;
}
if(!_f8e.places&&(_f9c<_f9b[1].length)){
_f9c+=","+_f9b[1].length;
}
_f9a.places=_f9c;
}
var _f9d=_f9b[0].split(",");
if(_f9d.length>1){
_f9a.groupSize=_f9d.pop().length;
if(_f9d.length>1){
_f9a.groupSize2=_f9d.pop().length;
}
}
return "("+dojo.number._realNumberRegexp(_f9a)+")";
});
},true);
if(_f95){
re=re.replace(/(\s*)(\u00a4{1,3})(\s*)/g,function(_f9e,_f9f,_fa0,_fa1){
var prop=["symbol","currency","displayName"][_fa0.length-1];
var _fa3=dojo.regexp.escapeString(_f8e[prop]||_f8e.currency||"");
_f9f=_f9f?"\\s":"";
_fa1=_fa1?"\\s":"";
if(!_f8e.strict){
if(_f9f){
_f9f+="*";
}
if(_fa1){
_fa1+="*";
}
return "(?:"+_f9f+_fa3+_fa1+")?";
}
return _f9f+_fa3+_fa1;
});
}
return {regexp:re.replace(/[\xa0 ]/g,"[\\s\\xa0]"),group:_f92,decimal:_f93,factor:_f94};
};
dojo.number.parse=function(_fa4,_fa5){
var info=dojo.number._parseInfo(_fa5);
var _fa7=(new RegExp("^"+info.regexp+"$")).exec(_fa4);
if(!_fa7){
return NaN;
}
var _fa8=_fa7[1];
if(!_fa7[1]){
if(!_fa7[2]){
return NaN;
}
_fa8=_fa7[2];
info.factor*=-1;
}
_fa8=_fa8.replace(new RegExp("["+info.group+"\\s\\xa0"+"]","g"),"").replace(info.decimal,".");
return Number(_fa8)*info.factor;
};
dojo.number._realNumberRegexp=function(_fa9){
_fa9=_fa9||{};
if(!("places" in _fa9)){
_fa9.places=Infinity;
}
if(typeof _fa9.decimal!="string"){
_fa9.decimal=".";
}
if(!("fractional" in _fa9)||/^0/.test(_fa9.places)){
_fa9.fractional=[true,false];
}
if(!("exponent" in _fa9)){
_fa9.exponent=[true,false];
}
if(!("eSigned" in _fa9)){
_fa9.eSigned=[true,false];
}
var _faa=dojo.number._integerRegexp(_fa9);
var _fab=dojo.regexp.buildGroupRE(_fa9.fractional,function(q){
var re="";
if(q&&(_fa9.places!==0)){
re="\\"+_fa9.decimal;
if(_fa9.places==Infinity){
re="(?:"+re+"\\d+)?";
}else{
re+="\\d{"+_fa9.places+"}";
}
}
return re;
},true);
var _fae=dojo.regexp.buildGroupRE(_fa9.exponent,function(q){
if(q){
return "([eE]"+dojo.number._integerRegexp({signed:_fa9.eSigned})+")";
}
return "";
});
var _fb0=_faa+_fab;
if(_fab){
_fb0="(?:(?:"+_fb0+")|(?:"+_fab+"))";
}
return _fb0+_fae;
};
dojo.number._integerRegexp=function(_fb1){
_fb1=_fb1||{};
if(!("signed" in _fb1)){
_fb1.signed=[true,false];
}
if(!("separator" in _fb1)){
_fb1.separator="";
}else{
if(!("groupSize" in _fb1)){
_fb1.groupSize=3;
}
}
var _fb2=dojo.regexp.buildGroupRE(_fb1.signed,function(q){
return q?"[-+]":"";
},true);
var _fb4=dojo.regexp.buildGroupRE(_fb1.separator,function(sep){
if(!sep){
return "(?:0|[1-9]\\d*)";
}
sep=dojo.regexp.escapeString(sep);
if(sep==" "){
sep="\\s";
}else{
if(sep==" "){
sep="\\s\\xa0";
}
}
var grp=_fb1.groupSize,grp2=_fb1.groupSize2;
if(grp2){
var _fb8="(?:0|[1-9]\\d{0,"+(grp2-1)+"}(?:["+sep+"]\\d{"+grp2+"})*["+sep+"]\\d{"+grp+"})";
return ((grp-grp2)>0)?"(?:"+_fb8+"|(?:0|[1-9]\\d{0,"+(grp-1)+"}))":_fb8;
}
return "(?:0|[1-9]\\d{0,"+(grp-1)+"}(?:["+sep+"]\\d{"+grp+"})*)";
},true);
return _fb2+_fb4;
};
}
if(!dojo._hasResource["dijit.form.NumberTextBox"]){
dojo._hasResource["dijit.form.NumberTextBox"]=true;
dojo.provide("dijit.form.NumberTextBox");
dojo.declare("dijit.form.NumberTextBoxMixin",null,{regExpGen:dojo.number.regexp,editOptions:{pattern:"#.######"},_onFocus:function(){
this._setValueAttr(this.attr("value"),false);
this.inherited(arguments);
},_formatter:dojo.number.format,format:function(_fb9,_fba){
if(typeof _fb9=="string"){
return _fb9;
}
if(isNaN(_fb9)){
return "";
}
if(this.editOptions&&this._focused){
_fba=dojo.mixin(dojo.mixin({},this.editOptions),this.constraints);
}
return this._formatter(_fb9,_fba);
},parse:dojo.number.parse,filter:function(_fbb){
return (_fbb===null||_fbb===""||_fbb===undefined)?NaN:this.inherited(arguments);
},serialize:function(_fbc,_fbd){
return (typeof _fbc!="number"||isNaN(_fbc))?"":this.inherited(arguments);
},_getValueAttr:function(){
var v=this.inherited(arguments);
if(isNaN(v)&&this.textbox.value!==""){
return undefined;
}
return v;
},value:NaN});
dojo.declare("dijit.form.NumberTextBox",[dijit.form.RangeBoundTextBox,dijit.form.NumberTextBoxMixin],{});
}
if(!dojo._hasResource["dijit.form.NumberSpinner"]){
dojo._hasResource["dijit.form.NumberSpinner"]=true;
dojo.provide("dijit.form.NumberSpinner");
dojo.declare("dijit.form.NumberSpinner",[dijit.form._Spinner,dijit.form.NumberTextBoxMixin],{required:true,adjust:function(val,_fc0){
if(isNaN(val)&&_fc0!=0){
var _fc1=(_fc0>0),_fc2=(typeof this.constraints.max=="number"),_fc3=(typeof this.constraints.min=="number");
val=_fc1?(_fc3?this.constraints.min:(_fc2?this.constraints.max:0)):(_fc2?this.constraints.max:(_fc3?this.constraints.min:0));
}
var _fc4=val+_fc0;
if(isNaN(val)||isNaN(_fc4)){
return val;
}
if((typeof this.constraints.max=="number")&&(_fc4>this.constraints.max)){
_fc4=this.constraints.max;
}
if((typeof this.constraints.min=="number")&&(_fc4<this.constraints.min)){
_fc4=this.constraints.min;
}
return _fc4;
},_onKeyPress:function(e){
if((e.charOrCode==dojo.keys.HOME||e.charOrCode==dojo.keys.END)&&!e.ctrlKey&&!e.altKey){
var _fc6=e.charOrCode==dojo.keys.HOME?this.constraints["min"]:this.constraints["max"];
if(_fc6){
this._setValueAttr(_fc6,true);
}
dojo.stopEvent(e);
return false;
}else{
return this.inherited(arguments);
}
}});
}
if(!dojo._hasResource["dojo.cldr.monetary"]){
dojo._hasResource["dojo.cldr.monetary"]=true;
dojo.provide("dojo.cldr.monetary");
dojo.cldr.monetary.getData=function(code){
var _fc8={ADP:0,BHD:3,BIF:0,BYR:0,CLF:0,CLP:0,DJF:0,ESP:0,GNF:0,IQD:3,ITL:0,JOD:3,JPY:0,KMF:0,KRW:0,KWD:3,LUF:0,LYD:3,MGA:0,MGF:0,OMR:3,PYG:0,RWF:0,TND:3,TRL:0,VUV:0,XAF:0,XOF:0,XPF:0};
var _fc9={CHF:5};
var _fca=_fc8[code],_fcb=_fc9[code];
if(typeof _fca=="undefined"){
_fca=2;
}
if(typeof _fcb=="undefined"){
_fcb=0;
}
return {places:_fca,round:_fcb};
};
}
if(!dojo._hasResource["dojo.currency"]){
dojo._hasResource["dojo.currency"]=true;
dojo.provide("dojo.currency");
dojo.currency._mixInDefaults=function(_fcc){
_fcc=_fcc||{};
_fcc.type="currency";
var _fcd=dojo.i18n.getLocalization("dojo.cldr","currency",_fcc.locale)||{};
var iso=_fcc.currency;
var data=dojo.cldr.monetary.getData(iso);
dojo.forEach(["displayName","symbol","group","decimal"],function(prop){
data[prop]=_fcd[iso+"_"+prop];
});
data.fractional=[true,false];
return dojo.mixin(data,_fcc);
};
dojo.currency.format=function(_fd1,_fd2){
return dojo.number.format(_fd1,dojo.currency._mixInDefaults(_fd2));
};
dojo.currency.regexp=function(_fd3){
return dojo.number.regexp(dojo.currency._mixInDefaults(_fd3));
};
dojo.currency.parse=function(_fd4,_fd5){
return dojo.number.parse(_fd4,dojo.currency._mixInDefaults(_fd5));
};
}
if(!dojo._hasResource["dijit.form.CurrencyTextBox"]){
dojo._hasResource["dijit.form.CurrencyTextBox"]=true;
dojo.provide("dijit.form.CurrencyTextBox");
dojo.declare("dijit.form.CurrencyTextBox",dijit.form.NumberTextBox,{currency:"",regExpGen:dojo.currency.regexp,_formatter:dojo.currency.format,parse:dojo.currency.parse,postMixInProperties:function(){
if(this.constraints===dijit.form.ValidationTextBox.prototype.constraints){
this.constraints={};
}
this.constraints.currency=this.currency;
dijit.form.CurrencyTextBox.superclass.postMixInProperties.apply(this,arguments);
}});
}
if(!dojo._hasResource["dijit.form.Slider"]){
dojo._hasResource["dijit.form.Slider"]=true;
dojo.provide("dijit.form.Slider");
dojo.declare("dijit.form.HorizontalSlider",[dijit.form._FormValueWidget,dijit._Container],{templateString:"<table class=\"dijit dijitReset dijitSlider\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" rules=\"none\" dojoAttachEvent=\"onkeypress:_onKeyPress\"\r\n\t><tr class=\"dijitReset\"\r\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\r\n\t\t><td dojoAttachPoint=\"containerNode,topDecoration\" class=\"dijitReset\" style=\"text-align:center;width:100%;\"></td\r\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\r\n\t></tr\r\n\t><tr class=\"dijitReset\"\r\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerH\"\r\n\t\t\t><div class=\"dijitSliderDecrementIconH\" tabIndex=\"-1\" style=\"display:none\" dojoAttachPoint=\"decrementButton\"><span class=\"dijitSliderButtonInner\">-</span></div\r\n\t\t></td\r\n\t\t><td class=\"dijitReset\"\r\n\t\t\t><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperH dijitSliderLeftBumper dijitSliderLeftBumper\" dojoAttachEvent=\"onclick:_onClkDecBumper\"></div\r\n\t\t></td\r\n\t\t><td class=\"dijitReset\"\r\n\t\t\t><input dojoAttachPoint=\"valueNode\" type=\"hidden\" name=\"${name}\"\r\n\t\t\t/><div class=\"dijitReset dijitSliderBarContainerH\" waiRole=\"presentation\" dojoAttachPoint=\"sliderBarContainer\"\r\n\t\t\t\t><div waiRole=\"presentation\" dojoAttachPoint=\"progressBar\" class=\"dijitSliderBar dijitSliderBarH dijitSliderProgressBar dijitSliderProgressBarH\" dojoAttachEvent=\"onclick:_onBarClick\"\r\n\t\t\t\t\t><div class=\"dijitSliderMoveable dijitSliderMoveableH\" \r\n\t\t\t\t\t\t><div dojoAttachPoint=\"sliderHandle,focusNode\" class=\"dijitSliderImageHandle dijitSliderImageHandleH\" dojoAttachEvent=\"onmousedown:_onHandleClick\" waiRole=\"slider\" valuemin=\"${minimum}\" valuemax=\"${maximum}\"></div\r\n\t\t\t\t\t></div\r\n\t\t\t\t></div\r\n\t\t\t\t><div waiRole=\"presentation\" dojoAttachPoint=\"remainingBar\" class=\"dijitSliderBar dijitSliderBarH dijitSliderRemainingBar dijitSliderRemainingBarH\" dojoAttachEvent=\"onclick:_onBarClick\"></div\r\n\t\t\t></div\r\n\t\t></td\r\n\t\t><td class=\"dijitReset\"\r\n\t\t\t><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperH dijitSliderRightBumper dijitSliderRightBumper\" dojoAttachEvent=\"onclick:_onClkIncBumper\"></div\r\n\t\t></td\r\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerH\" style=\"right:0px;\"\r\n\t\t\t><div class=\"dijitSliderIncrementIconH\" tabIndex=\"-1\" style=\"display:none\" dojoAttachPoint=\"incrementButton\"><span class=\"dijitSliderButtonInner\">+</span></div\r\n\t\t></td\r\n\t></tr\r\n\t><tr class=\"dijitReset\"\r\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\r\n\t\t><td dojoAttachPoint=\"containerNode,bottomDecoration\" class=\"dijitReset\" style=\"text-align:center;\"></td\r\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\r\n\t></tr\r\n></table>\r\n",value:0,showButtons:true,minimum:0,maximum:100,discreteValues:Infinity,pageIncrement:2,clickSelect:true,slideDuration:dijit.defaultDuration,widgetsInTemplate:true,attributeMap:dojo.mixin(dojo.clone(dijit.form._FormWidget.prototype.attributeMap),{id:"",name:"valueNode"}),baseClass:"dijitSlider",_mousePixelCoord:"pageX",_pixelCount:"w",_startingPixelCoord:"x",_startingPixelCount:"l",_handleOffsetCoord:"left",_progressPixelSize:"width",_onKeyPress:function(e){
if(this.disabled||this.readOnly||e.altKey||e.ctrlKey){
return;
}
switch(e.charOrCode){
case dojo.keys.HOME:
this._setValueAttr(this.minimum,true);
break;
case dojo.keys.END:
this._setValueAttr(this.maximum,true);
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
this.inherited(arguments);
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
var _fd9=dojo.coords(this.sliderBarContainer,true);
var _fda=e[this._mousePixelCoord]-_fd9[this._startingPixelCoord];
this._setPixelValue(this._isReversed()?(_fd9[this._pixelCount]-_fda):_fda,_fd9[this._pixelCount],true);
},_setPixelValue:function(_fdb,_fdc,_fdd){
if(this.disabled||this.readOnly){
return;
}
_fdb=_fdb<0?0:_fdc<_fdb?_fdc:_fdb;
var _fde=this.discreteValues;
if(_fde<=1||_fde==Infinity){
_fde=_fdc;
}
_fde--;
var _fdf=_fdc/_fde;
var _fe0=Math.round(_fdb/_fdf);
this._setValueAttr((this.maximum-this.minimum)*_fe0/_fde+this.minimum,_fdd);
},_setValueAttr:function(_fe1,_fe2){
this.valueNode.value=this.value=_fe1;
dijit.setWaiState(this.focusNode,"valuenow",_fe1);
this.inherited(arguments);
var _fe3=(_fe1-this.minimum)/(this.maximum-this.minimum);
var _fe4=(this._descending===false)?this.remainingBar:this.progressBar;
var _fe5=(this._descending===false)?this.progressBar:this.remainingBar;
if(this._inProgressAnim&&this._inProgressAnim.status!="stopped"){
this._inProgressAnim.stop(true);
}
if(_fe2&&this.slideDuration>0&&_fe4.style[this._progressPixelSize]){
var _fe6=this;
var _fe7={};
var _fe8=parseFloat(_fe4.style[this._progressPixelSize]);
var _fe9=this.slideDuration*(_fe3-_fe8/100);
if(_fe9==0){
return;
}
if(_fe9<0){
_fe9=0-_fe9;
}
_fe7[this._progressPixelSize]={start:_fe8,end:_fe3*100,units:"%"};
this._inProgressAnim=dojo.animateProperty({node:_fe4,duration:_fe9,onAnimate:function(v){
_fe5.style[_fe6._progressPixelSize]=(100-parseFloat(v[_fe6._progressPixelSize]))+"%";
},onEnd:function(){
delete _fe6._inProgressAnim;
},properties:_fe7});
this._inProgressAnim.play();
}else{
_fe4.style[this._progressPixelSize]=(_fe3*100)+"%";
_fe5.style[this._progressPixelSize]=((1-_fe3)*100)+"%";
}
},_bumpValue:function(_feb){
if(this.disabled||this.readOnly){
return;
}
var s=dojo.getComputedStyle(this.sliderBarContainer);
var c=dojo._getContentBox(this.sliderBarContainer,s);
var _fee=this.discreteValues;
if(_fee<=1||_fee==Infinity){
_fee=c[this._pixelCount];
}
_fee--;
var _fef=(this.value-this.minimum)*_fee/(this.maximum-this.minimum)+_feb;
if(_fef<0){
_fef=0;
}
if(_fef>_fee){
_fef=_fee;
}
_fef=_fef*(this.maximum-this.minimum)/_fee+this.minimum;
this._setValueAttr(_fef,true);
},_onClkIncBumper:function(){
this._setValueAttr(this._descending===false?this.minimum:this.maximum,true);
},_onClkDecBumper:function(){
this._setValueAttr(this._descending===false?this.maximum:this.minimum,true);
},decrement:function(e){
this._bumpValue(e.charOrCode==dojo.keys.PAGE_DOWN?-this.pageIncrement:-1);
},increment:function(e){
this._bumpValue(e.charOrCode==dojo.keys.PAGE_UP?this.pageIncrement:1);
},_mouseWheeled:function(evt){
dojo.stopEvent(evt);
var _ff3=!dojo.isMozilla;
var _ff4=evt[(_ff3?"wheelDelta":"detail")]*(_ff3?1:-1);
this[(_ff4<0?"decrement":"increment")](evt);
},startup:function(){
dojo.forEach(this.getChildren(),function(_ff5){
if(this[_ff5.container]!=this.containerNode){
this[_ff5.container].appendChild(_ff5.domNode);
}
},this);
},_typematicCallback:function(_ff6,_ff7,e){
if(_ff6==-1){
return;
}
this[(_ff7==(this._descending?this.incrementButton:this.decrementButton))?"decrement":"increment"](e);
},postCreate:function(){
if(this.showButtons){
this.incrementButton.style.display="";
this.decrementButton.style.display="";
this._connects.push(dijit.typematic.addMouseListener(this.decrementButton,this,"_typematicCallback",25,500));
this._connects.push(dijit.typematic.addMouseListener(this.incrementButton,this,"_typematicCallback",25,500));
}
this.connect(this.domNode,!dojo.isMozilla?"onmousewheel":"DOMMouseScroll","_mouseWheeled");
var _ff9=this;
var _ffa=function(){
dijit.form._SliderMover.apply(this,arguments);
this.widget=_ff9;
};
dojo.extend(_ffa,dijit.form._SliderMover.prototype);
this._movable=new dojo.dnd.Moveable(this.sliderHandle,{mover:_ffa});
var _ffb=dojo.query("label[for=\""+this.id+"\"]");
if(_ffb.length){
_ffb[0].id=(this.id+"_label");
dijit.setWaiState(this.focusNode,"labelledby",_ffb[0].id);
}
dijit.setWaiState(this.focusNode,"valuemin",this.minimum);
dijit.setWaiState(this.focusNode,"valuemax",this.maximum);
this.inherited(arguments);
},destroy:function(){
this._movable.destroy();
if(this._inProgressAnim&&this._inProgressAnim.status!="stopped"){
this._inProgressAnim.stop(true);
}
this.inherited(arguments);
}});
dojo.declare("dijit.form.VerticalSlider",dijit.form.HorizontalSlider,{templateString:"<table class=\"dijitReset dijitSlider\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" rules=\"none\" dojoAttachEvent=\"onkeypress:_onKeyPress\"\r\n><tbody class=\"dijitReset\"\r\n\t><tr class=\"dijitReset\"\r\n\t\t><td class=\"dijitReset\"></td\r\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerV\"\r\n\t\t\t><div class=\"dijitSliderIncrementIconV\" tabIndex=\"-1\" style=\"display:none\" dojoAttachPoint=\"decrementButton\"><span class=\"dijitSliderButtonInner\">+</span></div\r\n\t\t></td\r\n\t\t><td class=\"dijitReset\"></td\r\n\t></tr\r\n\t><tr class=\"dijitReset\"\r\n\t\t><td class=\"dijitReset\"></td\r\n\t\t><td class=\"dijitReset\"\r\n\t\t\t><center><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperV dijitSliderTopBumper dijitSliderTopBumper\" dojoAttachEvent=\"onclick:_onClkIncBumper\"></div></center\r\n\t\t></td\r\n\t\t><td class=\"dijitReset\"></td\r\n\t></tr\r\n\t><tr class=\"dijitReset\"\r\n\t\t><td dojoAttachPoint=\"leftDecoration\" class=\"dijitReset\" style=\"text-align:center;height:100%;\"></td\r\n\t\t><td class=\"dijitReset\" style=\"height:100%;\"\r\n\t\t\t><input dojoAttachPoint=\"valueNode\" type=\"hidden\" name=\"${name}\"\r\n\t\t\t/><center class=\"dijitReset dijitSliderBarContainerV\" waiRole=\"presentation\" dojoAttachPoint=\"sliderBarContainer\"\r\n\t\t\t\t><div waiRole=\"presentation\" dojoAttachPoint=\"remainingBar\" class=\"dijitSliderBar dijitSliderBarV dijitSliderRemainingBar dijitSliderRemainingBarV\" dojoAttachEvent=\"onclick:_onBarClick\"><!--#5629--></div\r\n\t\t\t\t><div waiRole=\"presentation\" dojoAttachPoint=\"progressBar\" class=\"dijitSliderBar dijitSliderBarV dijitSliderProgressBar dijitSliderProgressBarV\" dojoAttachEvent=\"onclick:_onBarClick\"\r\n\t\t\t\t\t><div class=\"dijitSliderMoveable\" style=\"vertical-align:top;\" \r\n\t\t\t\t\t\t><div dojoAttachPoint=\"sliderHandle,focusNode\" class=\"dijitSliderImageHandle dijitSliderImageHandleV\" dojoAttachEvent=\"onmousedown:_onHandleClick\" waiRole=\"slider\" valuemin=\"${minimum}\" valuemax=\"${maximum}\"></div\r\n\t\t\t\t\t></div\r\n\t\t\t\t></div\r\n\t\t\t></center\r\n\t\t></td\r\n\t\t><td dojoAttachPoint=\"containerNode,rightDecoration\" class=\"dijitReset\" style=\"text-align:center;height:100%;\"></td\r\n\t></tr\r\n\t><tr class=\"dijitReset\"\r\n\t\t><td class=\"dijitReset\"></td\r\n\t\t><td class=\"dijitReset\"\r\n\t\t\t><center><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperV dijitSliderBottomBumper dijitSliderBottomBumper\" dojoAttachEvent=\"onclick:_onClkDecBumper\"></div></center\r\n\t\t></td\r\n\t\t><td class=\"dijitReset\"></td\r\n\t></tr\r\n\t><tr class=\"dijitReset\"\r\n\t\t><td class=\"dijitReset\"></td\r\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerV\"\r\n\t\t\t><div class=\"dijitSliderDecrementIconV\" tabIndex=\"-1\" style=\"display:none\" dojoAttachPoint=\"incrementButton\"><span class=\"dijitSliderButtonInner\">-</span></div\r\n\t\t></td\r\n\t\t><td class=\"dijitReset\"></td\r\n\t></tr\r\n></tbody></table>\r\n",_mousePixelCoord:"pageY",_pixelCount:"h",_startingPixelCoord:"y",_startingPixelCount:"t",_handleOffsetCoord:"top",_progressPixelSize:"height",_descending:true,startup:function(){
if(this._started){
return;
}
if(!this.isLeftToRight()&&dojo.isMoz){
if(this.leftDecoration){
this._rtlRectify(this.leftDecoration);
}
if(this.rightDecoration){
this._rtlRectify(this.rightDecoration);
}
}
this.inherited(arguments);
},_isReversed:function(){
return this._descending;
},_rtlRectify:function(_ffc){
var _ffd=[];
while(_ffc.firstChild){
_ffd.push(_ffc.firstChild);
_ffc.removeChild(_ffc.firstChild);
}
for(var i=_ffd.length-1;i>=0;i--){
if(_ffd[i]){
_ffc.appendChild(_ffd[i]);
}
}
}});
dojo.declare("dijit.form._SliderMover",dojo.dnd.Mover,{onMouseMove:function(e){
var _1000=this.widget;
var _1001=_1000._abspos;
if(!_1001){
_1001=_1000._abspos=dojo.coords(_1000.sliderBarContainer,true);
_1000._setPixelValue_=dojo.hitch(_1000,"_setPixelValue");
_1000._isReversed_=_1000._isReversed();
}
var _1002=e[_1000._mousePixelCoord]-_1001[_1000._startingPixelCoord];
_1000._setPixelValue_(_1000._isReversed_?(_1001[_1000._pixelCount]-_1002):_1002,_1001[_1000._pixelCount],false);
},destroy:function(e){
dojo.dnd.Mover.prototype.destroy.apply(this,arguments);
var _1004=this.widget;
_1004._abspos=null;
_1004._setValueAttr(_1004.value,true);
}});
dojo.declare("dijit.form.HorizontalRule",[dijit._Widget,dijit._Templated],{templateString:"<div class=\"dijitRuleContainer dijitRuleContainerH\"></div>",count:3,container:"containerNode",ruleStyle:"",_positionPrefix:"<div class=\"dijitRuleMark dijitRuleMarkH\" style=\"left:",_positionSuffix:"%;",_suffix:"\"></div>",_genHTML:function(pos,ndx){
return this._positionPrefix+pos+this._positionSuffix+this.ruleStyle+this._suffix;
},_isHorizontal:true,postCreate:function(){
var _1007;
if(this.count==1){
_1007=this._genHTML(50,0);
}else{
var i;
var _1009=100/(this.count-1);
if(!this._isHorizontal||this.isLeftToRight()){
_1007=this._genHTML(0,0);
for(i=1;i<this.count-1;i++){
_1007+=this._genHTML(_1009*i,i);
}
_1007+=this._genHTML(100,this.count-1);
}else{
_1007=this._genHTML(100,0);
for(i=1;i<this.count-1;i++){
_1007+=this._genHTML(100-_1009*i,i);
}
_1007+=this._genHTML(0,this.count-1);
}
}
this.domNode.innerHTML=_1007;
}});
dojo.declare("dijit.form.VerticalRule",dijit.form.HorizontalRule,{templateString:"<div class=\"dijitRuleContainer dijitRuleContainerV\"></div>",_positionPrefix:"<div class=\"dijitRuleMark dijitRuleMarkV\" style=\"top:",_isHorizontal:false});
dojo.declare("dijit.form.HorizontalRuleLabels",dijit.form.HorizontalRule,{templateString:"<div class=\"dijitRuleContainer dijitRuleContainerH dijitRuleLabelsContainer dijitRuleLabelsContainerH\"></div>",labelStyle:"",labels:[],numericMargin:0,minimum:0,maximum:1,constraints:{pattern:"#%"},_positionPrefix:"<div class=\"dijitRuleLabelContainer dijitRuleLabelContainerH\" style=\"left:",_labelPrefix:"\"><span class=\"dijitRuleLabel dijitRuleLabelH\">",_suffix:"</span></div>",_calcPosition:function(pos){
return pos;
},_genHTML:function(pos,ndx){
return this._positionPrefix+this._calcPosition(pos)+this._positionSuffix+this.labelStyle+this._labelPrefix+this.labels[ndx]+this._suffix;
},getLabels:function(){
var _100d=this.labels;
if(!_100d.length){
_100d=dojo.query("> li",this.srcNodeRef).map(function(node){
return String(node.innerHTML);
});
}
this.srcNodeRef.innerHTML="";
if(!_100d.length&&this.count>1){
var start=this.minimum;
var inc=(this.maximum-start)/(this.count-1);
for(var i=0;i<this.count;i++){
_100d.push((i<this.numericMargin||i>=(this.count-this.numericMargin))?"":dojo.number.format(start,this.constraints));
start+=inc;
}
}
return _100d;
},postMixInProperties:function(){
this.inherited(arguments);
this.labels=this.getLabels();
this.count=this.labels.length;
}});
dojo.declare("dijit.form.VerticalRuleLabels",dijit.form.HorizontalRuleLabels,{templateString:"<div class=\"dijitRuleContainer dijitRuleContainerV dijitRuleLabelsContainer dijitRuleLabelsContainerV\"></div>",_positionPrefix:"<div class=\"dijitRuleLabelContainer dijitRuleLabelContainerV\" style=\"top:",_labelPrefix:"\"><span class=\"dijitRuleLabel dijitRuleLabelV\">",_calcPosition:function(pos){
return 100-pos;
},_isHorizontal:false});
}
if(!dojo._hasResource["dijit._editor.selection"]){
dojo._hasResource["dijit._editor.selection"]=true;
dojo.provide("dijit._editor.selection");
dojo.mixin(dijit._editor.selection,{getType:function(){
if(dojo.doc.selection){
return dojo.doc.selection.type.toLowerCase();
}else{
var stype="text";
var oSel;
try{
oSel=dojo.global.getSelection();
}
catch(e){
}
if(oSel&&oSel.rangeCount==1){
var _1015=oSel.getRangeAt(0);
if((_1015.startContainer==_1015.endContainer)&&((_1015.endOffset-_1015.startOffset)==1)&&(_1015.startContainer.nodeType!=3)){
stype="control";
}
}
return stype;
}
},getSelectedText:function(){
if(dojo.doc.selection){
if(dijit._editor.selection.getType()=="control"){
return null;
}
return dojo.doc.selection.createRange().text;
}else{
var _1016=dojo.global.getSelection();
if(_1016){
return _1016.toString();
}
}
return "";
},getSelectedHtml:function(){
if(dojo.doc.selection){
if(dijit._editor.selection.getType()=="control"){
return null;
}
return dojo.doc.selection.createRange().htmlText;
}else{
var _1017=dojo.global.getSelection();
if(_1017&&_1017.rangeCount){
var frag=_1017.getRangeAt(0).cloneContents();
var div=dojo.doc.createElement("div");
div.appendChild(frag);
return div.innerHTML;
}
return null;
}
},getSelectedElement:function(){
if(dijit._editor.selection.getType()=="control"){
if(dojo.doc.selection){
var range=dojo.doc.selection.createRange();
if(range&&range.item){
return dojo.doc.selection.createRange().item(0);
}
}else{
var _101b=dojo.global.getSelection();
return _101b.anchorNode.childNodes[_101b.anchorOffset];
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
if(dojo.doc.selection){
var r=dojo.doc.selection.createRange();
r.collapse(true);
return r.parentElement();
}else{
var _101e=dojo.global.getSelection();
if(_101e){
var node=_101e.anchorNode;
while(node&&(node.nodeType!=1)){
node=node.parentNode;
}
return node;
}
}
}
return null;
},hasAncestorElement:function(_1020){
return this.getAncestorElement.apply(this,arguments)!=null;
},getAncestorElement:function(_1021){
var node=this.getSelectedElement()||this.getParentElement();
return this.getParentOfType(node,arguments);
},isTag:function(node,tags){
if(node&&node.tagName){
var _nlc=node.tagName.toLowerCase();
for(var i=0;i<tags.length;i++){
var _tlc=String(tags[i]).toLowerCase();
if(_nlc==_tlc){
return _tlc;
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
},collapse:function(_102a){
if(window["getSelection"]){
var _102b=dojo.global.getSelection();
if(_102b.removeAllRanges){
if(_102a){
_102b.collapseToStart();
}else{
_102b.collapseToEnd();
}
}else{
_102b.collapse(_102a);
}
}else{
if(dojo.doc.selection){
var range=dojo.doc.selection.createRange();
range.collapse(_102a);
range.select();
}
}
},remove:function(){
var _s=dojo.doc.selection;
if(_s){
if(_s.type.toLowerCase()!="none"){
_s.clear();
}
return _s;
}else{
_s=dojo.global.getSelection();
_s.deleteFromDocument();
return _s;
}
},selectElementChildren:function(_102e,_102f){
var _1030=dojo.global;
var _1031=dojo.doc;
_102e=dojo.byId(_102e);
if(_1031.selection&&dojo.body().createTextRange){
var range=_102e.ownerDocument.body.createTextRange();
range.moveToElementText(_102e);
if(!_102f){
try{
range.select();
}
catch(e){
}
}
}else{
if(_1030.getSelection){
var _1033=_1030.getSelection();
if(_1033.setBaseAndExtent){
_1033.setBaseAndExtent(_102e,0,_102e,_102e.innerText.length-1);
}else{
if(_1033.selectAllChildren){
_1033.selectAllChildren(_102e);
}
}
}
}
},selectElement:function(_1034,_1035){
var range,_1037=dojo.doc;
_1034=dojo.byId(_1034);
if(_1037.selection&&dojo.body().createTextRange){
try{
range=dojo.body().createControlRange();
range.addElement(_1034);
if(!_1035){
range.select();
}
}
catch(e){
this.selectElementChildren(_1034,_1035);
}
}else{
if(dojo.global.getSelection){
var _1038=dojo.global.getSelection();
if(_1038.removeAllRanges){
range=_1037.createRange();
range.selectNode(_1034);
_1038.removeAllRanges();
_1038.addRange(range);
}
}
}
}});
}
if(!dojo._hasResource["dijit._editor.range"]){
dojo._hasResource["dijit._editor.range"]=true;
dojo.provide("dijit._editor.range");
dijit.range={};
dijit.range.getIndex=function(node,_103a){
var ret=[],retR=[];
var stop=_103a;
var onode=node;
var pnode,n;
while(node!=stop){
var i=0;
pnode=node.parentNode;
while((n=pnode.childNodes[i++])){
if(n===node){
--i;
break;
}
}
if(i>=pnode.childNodes.length){
dojo.debug("Error finding index of a node in dijit.range.getIndex");
}
ret.unshift(i);
retR.unshift(i-pnode.childNodes.length);
node=pnode;
}
if(ret.length>0&&onode.nodeType==3){
n=onode.previousSibling;
while(n&&n.nodeType==3){
ret[ret.length-1]--;
n=n.previousSibling;
}
n=onode.nextSibling;
while(n&&n.nodeType==3){
retR[retR.length-1]++;
n=n.nextSibling;
}
}
return {o:ret,r:retR};
};
dijit.range.getNode=function(index,_1043){
if(!dojo.isArray(index)||index.length==0){
return _1043;
}
var node=_1043;
dojo.every(index,function(i){
if(i>=0&&i<node.childNodes.length){
node=node.childNodes[i];
}else{
node=null;
console.debug("Error: can not find node with index",index,"under parent node",_1043);
return false;
}
return true;
});
return node;
};
dijit.range.getCommonAncestor=function(n1,n2){
var _1048=function(n){
var as=[];
while(n){
as.unshift(n);
if(n.nodeName!="BODY"){
n=n.parentNode;
}else{
break;
}
}
return as;
};
var n1as=_1048(n1);
var n2as=_1048(n2);
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
dijit.range.getAncestor=function(node,regex,root){
root=root||node.ownerDocument.body;
while(node&&node!==root){
var name=node.nodeName.toUpperCase();
if(regex.test(name)){
return node;
}
node=node.parentNode;
}
return null;
};
dijit.range.BlockTagNames=/^(?:P|DIV|H1|H2|H3|H4|H5|H6|ADDRESS|PRE|OL|UL|LI|DT|DE)$/;
dijit.range.getBlockAncestor=function(node,regex,root){
root=root||node.ownerDocument.body;
regex=regex||dijit.range.BlockTagNames;
var block=null,_1058;
while(node&&node!==root){
var name=node.nodeName.toUpperCase();
if(!block&&regex.test(name)){
block=node;
}
if(!_1058&&(/^(?:BODY|TD|TH|CAPTION)$/).test(name)){
_1058=node;
}
node=node.parentNode;
}
return {blockNode:block,blockContainer:_1058||node.ownerDocument.body};
};
dijit.range.atBeginningOfContainer=function(_105a,node,_105c){
var _105d=false;
var _105e=(_105c==0);
if(!_105e&&node.nodeType==3){
if(dojo.trim(node.nodeValue.substr(0,_105c))==0){
_105e=true;
}
}
if(_105e){
var cnode=node;
_105d=true;
while(cnode&&cnode!==_105a){
if(cnode.previousSibling){
_105d=false;
break;
}
cnode=cnode.parentNode;
}
}
return _105d;
};
dijit.range.atEndOfContainer=function(_1060,node,_1062){
var atEnd=false;
var _1064=(_1062==(node.length||node.childNodes.length));
if(!_1064&&node.nodeType==3){
if(dojo.trim(node.nodeValue.substr(_1062))==0){
_1064=true;
}
}
if(_1064){
var cnode=node;
atEnd=true;
while(cnode&&cnode!==_1060){
if(cnode.nextSibling){
atEnd=false;
break;
}
cnode=cnode.parentNode;
}
}
return atEnd;
};
dijit.range.adjacentNoneTextNode=function(_1066,next){
var node=_1066;
var len=(0-_1066.length)||0;
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
dijit.range.create=function(){
if(dijit.range._w3c){
return dojo.doc.createRange();
}else{
return new dijit.range.W3CRange;
}
};
dijit.range.getSelection=function(win,_106c){
if(dijit.range._w3c){
return win.getSelection();
}else{
var s=new dijit.range.ie.selection(win);
if(!_106c){
s._getCurrentSelection();
}
return s;
}
};
if(!dijit.range._w3c){
dijit.range.ie={cachedSelection:{},selection:function(win){
this._ranges=[];
this.addRange=function(r,_1070){
this._ranges.push(r);
if(!_1070){
r._select();
}
this.rangeCount=this._ranges.length;
};
this.removeAllRanges=function(){
this._ranges=[];
this.rangeCount=0;
};
var _1071=function(){
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
var r=_1071();
if(r){
this.addRange(r,true);
}
};
},decomposeControlRange:function(range){
var _1077=range.item(0),_1078=range.item(range.length-1);
var _1079=_1077.parentNode,_107a=_1078.parentNode;
var _107b=dijit.range.getIndex(_1077,_1079).o;
var _107c=dijit.range.getIndex(_1078,_107a).o+1;
return [[_1079,_107b],[_107a,_107c]];
},getEndPoint:function(range,end){
var _107f=range.duplicate();
_107f.collapse(!end);
var _1080="EndTo"+(end?"End":"Start");
var _1081=_107f.parentElement();
var _1082,_1083,_1084;
if(_1081.childNodes.length>0){
dojo.every(_1081.childNodes,function(node,i){
var _1087;
if(node.nodeType!=3){
_107f.moveToElementText(node);
if(_107f.compareEndPoints(_1080,range)>0){
_1082=node.previousSibling;
if(_1084&&_1084.nodeType==3){
_1082=_1084;
_1087=true;
}else{
_1082=_1081;
_1083=i;
return false;
}
}else{
if(i==_1081.childNodes.length-1){
_1082=_1081;
_1083=_1081.childNodes.length;
return false;
}
}
}else{
if(i==_1081.childNodes.length-1){
_1082=node;
_1087=true;
}
}
if(_1087&&_1082){
var _1088=dijit.range.adjacentNoneTextNode(_1082)[0];
if(_1088){
_1082=_1088.nextSibling;
}else{
_1082=_1081.firstChild;
}
var _1089=dijit.range.adjacentNoneTextNode(_1082);
_1088=_1089[0];
var _108a=_1089[1];
if(_1088){
_107f.moveToElementText(_1088);
_107f.collapse(false);
}else{
_107f.moveToElementText(_1081);
}
_107f.setEndPoint(_1080,range);
_1083=_107f.text.length-_108a;
return false;
}
_1084=node;
return true;
});
}else{
_1082=_1081;
_1083=0;
}
if(!end&&_1082.nodeType!=3&&_1083==_1082.childNodes.length){
if(_1082.nextSibling&&_1082.nextSibling.nodeType==3){
_1082=_1082.nextSibling;
_1083=0;
}
}
return [_1082,_1083];
},setEndPoint:function(range,_108c,_108d){
var _108e=range.duplicate(),node,len;
if(_108c.nodeType!=3){
_108e.moveToElementText(_108c);
_108e.collapse(true);
if(_108d==_108c.childNodes.length){
if(_108d>0){
node=_108c.lastChild;
len=0;
while(node&&node.nodeType==3){
len+=node.length;
_108c=node;
node=node.previousSibling;
}
if(node){
_108e.moveToElementText(node);
}
_108e.collapse(false);
_108d=len;
}else{
_108e.moveToElementText(_108c);
_108e.collapse(true);
}
}else{
if(_108d>0){
node=_108c.childNodes[_108d-1];
if(node.nodeType==3){
_108c=node;
_108d=node.length;
}else{
_108e.moveToElementText(node);
_108e.collapse(false);
}
}
}
}
if(_108c.nodeType==3){
var _1091=dijit.range.adjacentNoneTextNode(_108c);
var _1092=_1091[0];
len=_1091[1];
if(_1092){
_108e.moveToElementText(_1092);
_108e.collapse(false);
if(_1092.contentEditable!="inherit"){
len++;
}
}else{
_108e.moveToElementText(_108c.parentNode);
_108e.collapse(true);
}
_108d+=len;
if(_108d>0){
if(_108e.move("character",_108d)!=_108d){
console.error("Error when moving!");
}
}
}
return _108e;
},decomposeTextRange:function(range){
var _1094=dijit.range.ie.getEndPoint(range);
var _1095=_1094[0],_1096=_1094[1];
var _1097=_1094[0],_1098=_1094[1];
if(range.htmlText.length){
if(range.htmlText==range.text){
_1098=_1096+range.text.length;
}else{
_1094=dijit.range.ie.getEndPoint(range,true);
_1097=_1094[0],_1098=_1094[1];
}
}
return [[_1095,_1096],[_1097,_1098]];
},setRange:function(range,_109a,_109b,_109c,_109d,_109e){
var _109f=dijit.range.ie.setEndPoint(range,_109a,_109b);
range.setEndPoint("StartToStart",_109f);
var _10a0=_109f;
if(!_109e){
_10a0=dijit.range.ie.setEndPoint(range,_109c,_109d);
}
range.setEndPoint("EndToEnd",_10a0);
return range;
}};
dojo.declare("dijit.range.W3CRange",null,{constructor:function(){
if(arguments.length>0){
this.setStart(arguments[0][0][0],arguments[0][0][1]);
this.setEnd(arguments[0][1][0],arguments[0][1][1]);
}else{
this.commonAncestorContainer=null;
this.startContainer=null;
this.startOffset=0;
this.endContainer=null;
this.endOffset=0;
this.collapsed=true;
}
},_simpleSetEndPoint:function(node,range,end){
var r=(this._body||node.ownerDocument.body).createTextRange();
if(node.nodeType!=1){
r.moveToElementText(node.parentNode);
}else{
r.moveToElementText(node);
}
r.collapse(true);
range.setEndPoint(end?"EndToEnd":"StartToStart",r);
},_updateInternal:function(){
if(this.startContainer!==this.endContainer){
this.commonAncestorContainer=dijit.range.getCommonAncestor(this.startContainer,this.endContainer);
}else{
this.commonAncestorContainer=this.startContainer;
}
this.collapsed=(this.startContainer===this.endContainer)&&(this.startOffset==this.endOffset);
},setStart:function(node,_10a6){
_10a6=parseInt(_10a6);
if(this.startContainer===node&&this.startOffset==_10a6){
return;
}
delete this._cachedBookmark;
this.startContainer=node;
this.startOffset=_10a6;
if(!this.endContainer){
this.setEnd(node,_10a6);
}else{
this._updateInternal();
}
},setEnd:function(node,_10a8){
_10a8=parseInt(_10a8);
if(this.endContainer===node&&this.endOffset==_10a8){
return;
}
delete this._cachedBookmark;
this.endContainer=node;
this.endOffset=_10a8;
if(!this.startContainer){
this.setStart(node,_10a8);
}else{
this._updateInternal();
}
},setStartAfter:function(node,_10aa){
this._setPoint("setStart",node,_10aa,1);
},setStartBefore:function(node,_10ac){
this._setPoint("setStart",node,_10ac,0);
},setEndAfter:function(node,_10ae){
this._setPoint("setEnd",node,_10ae,1);
},setEndBefore:function(node,_10b0){
this._setPoint("setEnd",node,_10b0,0);
},_setPoint:function(what,node,_10b3,ext){
var index=dijit.range.getIndex(node,node.parentNode).o;
this[what](node.parentNode,index.pop()+ext);
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
var r=new dijit.range.W3CRange([[this.startContainer,this.startOffset],[this.endContainer,this.endOffset]]);
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
dijit._editor.escapeXml=function(str,_10bc){
str=str.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;");
if(!_10bc){
str=str.replace(/'/gm,"&#39;");
}
return str;
};
dijit._editor.getNodeHtml=function(node){
var _10be;
switch(node.nodeType){
case 1:
_10be="<"+node.nodeName.toLowerCase();
var _10bf=[];
if(dojo.isIE&&node.outerHTML){
var s=node.outerHTML;
s=s.substr(0,s.indexOf(">")).replace(/(['"])[^"']*\1/g,"");
var reg=/([^\s=]+)=/g;
var m,key;
while((m=reg.exec(s))){
key=m[1];
if(key.substr(0,3)!="_dj"){
if(key=="src"||key=="href"){
if(node.getAttribute("_djrealurl")){
_10bf.push([key,node.getAttribute("_djrealurl")]);
continue;
}
}
var val;
switch(key){
case "style":
val=node.style.cssText.toLowerCase();
break;
case "class":
val=node.className;
break;
default:
val=node.getAttribute(key);
}
_10bf.push([key,val.toString()]);
}
}
}else{
var attr,i=0;
while((attr=node.attributes[i++])){
var n=attr.name;
if(n.substr(0,3)!="_dj"){
var v=attr.value;
if(n=="src"||n=="href"){
if(node.getAttribute("_djrealurl")){
v=node.getAttribute("_djrealurl");
}
}
_10bf.push([n,v]);
}
}
}
_10bf.sort(function(a,b){
return a[0]<b[0]?-1:(a[0]==b[0]?0:1);
});
var j=0;
while((attr=_10bf[j++])){
_10be+=" "+attr[0]+"=\""+(dojo.isString(attr[1])?dijit._editor.escapeXml(attr[1],true):attr[1])+"\"";
}
if(node.childNodes.length){
_10be+=">"+dijit._editor.getChildrenHtml(node)+"</"+node.nodeName.toLowerCase()+">";
}else{
_10be+=" />";
}
break;
case 3:
_10be=dijit._editor.escapeXml(node.nodeValue,true);
break;
case 8:
_10be="<!--"+dijit._editor.escapeXml(node.nodeValue,true)+"-->";
break;
default:
_10be="<!-- Element not recognized - Type: "+node.nodeType+" Name: "+node.nodeName+"-->";
}
return _10be;
};
dijit._editor.getChildrenHtml=function(dom){
var out="";
if(!dom){
return out;
}
var nodes=dom["childNodes"]||dom;
var node,i=0;
while((node=nodes[i++])){
out+=dijit._editor.getNodeHtml(node);
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
var _10d1=dojo.doc.createElement("textarea");
_10d1.id=dijit._scopeName+"._editor.RichText.savedContent";
var s=_10d1.style;
s.display="none";
s.position="absolute";
s.top="-100px";
s.left="-100px";
s.height="3px";
s.width="3px";
dojo.body().appendChild(_10d1);
})();
}else{
try{
dojo.doc.write("<textarea id=\""+dijit._scopeName+"._editor.RichText.savedContent\" "+"style=\"display:none;position:absolute;top:-100px;left:-100px;height:3px;width:3px;overflow:hidden;\"></textarea>");
}
catch(e){
}
}
}
dojo.declare("dijit._editor.RichText",dijit._Widget,{constructor:function(_10d3){
this.contentPreFilters=[];
this.contentPostFilters=[];
this.contentDomPreFilters=[];
this.contentDomPostFilters=[];
this.editingAreaStyleSheets=[];
this._keyHandlers={};
this.contentPreFilters.push(dojo.hitch(this,"_preFixUrlAttributes"));
if(dojo.isMoz){
this.contentPreFilters.push(this._fixContentForMoz);
this.contentPostFilters.push(this._removeMozBogus);
}
if(dojo.isSafari){
this.contentPostFilters.push(this._removeSafariBogus);
}
this.onLoadDeferred=new dojo.Deferred();
},inheritWidth:false,focusOnLoad:false,name:"",styleSheets:"",_content:"",height:"300px",minHeight:"1em",isClosed:true,isLoaded:false,_SEPARATOR:"@@**%%__RICHTEXTBOUNDRY__%%**@@",onLoadDeferred:null,isTabIndent:false,postCreate:function(){
if("textarea"==this.domNode.tagName.toLowerCase()){
console.warn("RichText should not be used with the TEXTAREA tag.  See dijit._editor.RichText docs.");
}
dojo.publish(dijit._scopeName+"._editor.RichText::init",[this]);
this.open();
this.setupDefaultShortcuts();
},setupDefaultShortcuts:function(){
var exec=dojo.hitch(this,function(cmd,arg){
return function(){
return !this.execCommand(cmd,arg);
};
});
var _10d7={b:exec("bold"),i:exec("italic"),u:exec("underline"),a:exec("selectall"),s:function(){
this.save(true);
},m:function(){
this.isTabIndent=!this.isTabIndent;
},"1":exec("formatblock","h1"),"2":exec("formatblock","h2"),"3":exec("formatblock","h3"),"4":exec("formatblock","h4"),"\\":exec("insertunorderedlist")};
if(!dojo.isIE){
_10d7.Z=exec("redo");
}
for(var key in _10d7){
this.addKeyHandler(key,true,false,_10d7[key]);
}
},events:["onKeyPress","onKeyDown","onKeyUp","onClick"],captureEvents:[],_editorCommandsLocalized:false,_localizeEditorCommands:function(){
if(this._editorCommandsLocalized){
return;
}
this._editorCommandsLocalized=true;
var _10d9=["div","p","pre","h1","h2","h3","h4","h5","h6","ol","ul","address"];
var _10da="",_10db,i=0;
while((_10db=_10d9[i++])){
if(_10db.charAt(1)!="l"){
_10da+="<"+_10db+"><span>content</span></"+_10db+"><br/>";
}else{
_10da+="<"+_10db+"><li>content</li></"+_10db+"><br/>";
}
}
var div=dojo.doc.createElement("div");
dojo.style(div,{position:"absolute",left:"-2000px",top:"-2000px"});
dojo.doc.body.appendChild(div);
div.innerHTML=_10da;
var node=div.firstChild;
while(node){
dijit._editor.selection.selectElement(node.firstChild);
dojo.withGlobal(this.window,"selectElement",dijit._editor.selection,[node.firstChild]);
var _10df=node.tagName.toLowerCase();
this._local2NativeFormatNames[_10df]=document.queryCommandValue("formatblock");
this._native2LocalFormatNames[this._local2NativeFormatNames[_10df]]=_10df;
node=node.nextSibling.nextSibling;
}
dojo.body().removeChild(div);
},open:function(_10e0){
if((!this.onLoadDeferred)||(this.onLoadDeferred.fired>=0)){
this.onLoadDeferred=new dojo.Deferred();
}
if(!this.isClosed){
this.close();
}
dojo.publish(dijit._scopeName+"._editor.RichText::open",[this]);
this._content="";
if((arguments.length==1)&&(_10e0["nodeName"])){
this.domNode=_10e0;
}
var dn=this.domNode;
var html;
if((dn["nodeName"])&&(dn.nodeName.toLowerCase()=="textarea")){
var ta=this.textarea=dn;
this.name=ta.name;
html=this._preFilterContent(ta.value);
dn=this.domNode=dojo.doc.createElement("div");
dn.setAttribute("widgetId",this.id);
ta.removeAttribute("widgetId");
dn.cssText=ta.cssText;
dn.className+=" "+ta.className;
dojo.place(dn,ta,"before");
var _10e4=dojo.hitch(this,function(){
with(ta.style){
display="block";
position="absolute";
left=top="-1000px";
if(dojo.isIE){
this.__overflow=overflow;
overflow="hidden";
}
}
});
if(dojo.isIE){
setTimeout(_10e4,10);
}else{
_10e4();
}
if(ta.form){
dojo.connect(ta.form,"onsubmit",this,function(){
ta.value=this.getValue();
});
}
}else{
html=this._preFilterContent(dijit._editor.getChildrenHtml(dn));
dn.innerHTML="";
}
if(html==""){
html="&nbsp;";
}
var _10e5=dojo.contentBox(dn);
this._oldHeight=_10e5.h;
this._oldWidth=_10e5.w;
this.savedContent=html;
if((dn["nodeName"])&&(dn.nodeName=="LI")){
dn.innerHTML=" <br>";
}
this.editingArea=dn.ownerDocument.createElement("div");
dn.appendChild(this.editingArea);
if(this.name!=""&&(!dojo.config["useXDomain"]||dojo.config["allowXdRichTextSave"])){
var _10e6=dojo.byId(dijit._scopeName+"._editor.RichText.savedContent");
if(_10e6.value!=""){
var datas=_10e6.value.split(this._SEPARATOR),i=0,dat;
while((dat=datas[i++])){
var data=dat.split(":");
if(data[0]==this.name){
html=data[1];
datas.splice(i,1);
break;
}
}
}
this.connect(window,"onbeforeunload","_saveContent");
}
this.isClosed=false;
if(dojo.isIE||dojo.isSafari||dojo.isOpera){
var burl=dojo.config["dojoBlankHtmlUrl"]||(dojo.moduleUrl("dojo","resources/blank.html")+"");
var ifr=this.editorObject=this.iframe=dojo.doc.createElement("iframe");
ifr.id=this.id+"_iframe";
ifr.src=burl;
ifr.style.border="none";
ifr.style.width="100%";
ifr.frameBorder=0;
this.editingArea.appendChild(ifr);
var h=null;
var _10ee=dojo.hitch(this,function(){
if(h){
dojo.disconnect(h);
h=null;
}
this.window=ifr.contentWindow;
var d=this.document=this.window.document;
d.open();
d.write(this._getIframeDocTxt(html));
d.close();
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
if(dojo.isIE){
this._localizeEditorCommands();
}
this.onLoad();
this.savedContent=this.getValue(true);
});
if(dojo.isIE&&dojo.isIE<=7){
var t=setInterval(function(){
if(ifr.contentWindow.isLoaded){
clearInterval(t);
_10ee();
}
},100);
}else{
h=dojo.connect(((dojo.isIE)?ifr.contentWindow:ifr),"onload",_10ee);
}
}else{
this._drawIframe(html);
this.savedContent=this.getValue(true);
}
if(dn.nodeName=="LI"){
dn.lastChild.style.marginTop="-1.2em";
}
if(this.domNode.nodeName=="LI"){
this.domNode.lastChild.style.marginTop="-1.2em";
}
dojo.addClass(this.domNode,"RichTextEditable");
},_local2NativeFormatNames:{},_native2LocalFormatNames:{},_localizedIframeTitles:null,_getIframeDocTxt:function(html){
var _cs=dojo.getComputedStyle(this.domNode);
if(dojo.isIE||(!this.height&&!dojo.isMoz)){
html="<div>"+html+"</div>";
}
var font=[_cs.fontWeight,_cs.fontSize,_cs.fontFamily].join(" ");
var _10f4=_cs.lineHeight;
if(_10f4.indexOf("px")>=0){
_10f4=parseFloat(_10f4)/parseFloat(_cs.fontSize);
}else{
if(_10f4.indexOf("em")>=0){
_10f4=parseFloat(_10f4);
}else{
_10f4="1.0";
}
}
var _10f5="";
this.style.replace(/(^|;)(line-|font-?)[^;]+/g,function(match){
_10f5+=match.replace(/^;/g,"")+";";
});
return [this.isLeftToRight()?"<html><head>":"<html dir='rtl'><head>",(dojo.isMoz?"<title>"+this._localizedIframeTitles.iframeEditTitle+"</title>":""),"<style>","body,html {","\tbackground:transparent;","\tpadding: 1em 0 0 0;","\tmargin: -1em 0 0 0;","\theight: 100%;","}","body{","\ttop:0px; left:0px; right:0px;","\tfont:",font,";",((this.height||dojo.isOpera)?"":"position: fixed;"),"\tmin-height:",this.minHeight,";","\tline-height:",_10f4,"}","p{ margin: 1em 0 !important; }",(this.height?"":"body,html{height:auto;overflow-y:hidden;/*for IE*/} body > div {overflow-x:auto;/*for FF to show vertical scrollbar*/}"),"li > ul:-moz-first-node, li > ol:-moz-first-node{ padding-top: 1.2em; } ","li{ min-height:1.2em; }","</style>",this._applyEditingAreaStyleSheets(),"</head><body style='"+_10f5+"'>"+html+"</body></html>"].join("");
},_drawIframe:function(html){
if(!this.iframe){
var ifr=this.iframe=dojo.doc.createElement("iframe");
ifr.id=this.id+"_iframe";
var ifrs=ifr.style;
ifrs.border="none";
ifrs.lineHeight="0";
ifrs.verticalAlign="bottom";
this.editorObject=this.iframe;
this._localizedIframeTitles=dojo.i18n.getLocalization("dijit.form","Textarea");
var label=dojo.query("label[for=\""+this.id+"\"]");
if(label.length){
this._localizedIframeTitles.iframeEditTitle=label[0].innerHTML+" "+this._localizedIframeTitles.iframeEditTitle;
}
}
this.iframe.style.width=this.inheritWidth?this._oldWidth:"100%";
if(this._layoutMode){
this.iframe.style.height="100%";
}else{
if(this.height){
this.iframe.style.height=this.height;
}else{
this.iframe.height=this._oldHeight;
}
}
var _10fb;
if(this.textarea){
_10fb=this.srcNodeRef;
}else{
_10fb=dojo.doc.createElement("div");
_10fb.style.display="none";
_10fb.innerHTML=html;
this.editingArea.appendChild(_10fb);
}
this.editingArea.appendChild(this.iframe);
var _10fc=dojo.hitch(this,function(){
if(!this.editNode){
if(!this.document){
try{
if(this.iframe.contentWindow){
this.window=this.iframe.contentWindow;
this.document=this.iframe.contentWindow.document;
}else{
if(this.iframe.contentDocument){
this.window=this.iframe.contentDocument.window;
this.document=this.iframe.contentDocument;
}
}
}
catch(e){
}
if(!this.document){
setTimeout(_10fc,50);
return;
}
var _10fd=this.document;
_10fd.open();
if(dojo.isAIR){
_10fd.body.innerHTML=html;
}else{
_10fd.write(this._getIframeDocTxt(html));
}
_10fd.close();
dojo._destroyElement(_10fb);
}
if(!this.document.body){
setTimeout(_10fc,50);
return;
}
this.onLoad();
}else{
dojo._destroyElement(_10fb);
this.editNode.innerHTML=html;
this.onDisplayChanged();
}
this._preDomFilterContent(this.editNode);
});
_10fc();
},_applyEditingAreaStyleSheets:function(){
var files=[];
if(this.styleSheets){
files=this.styleSheets.split(";");
this.styleSheets="";
}
files=files.concat(this.editingAreaStyleSheets);
this.editingAreaStyleSheets=[];
var text="",i=0,url;
while((url=files[i++])){
var _1102=(new dojo._Url(dojo.global.location,url)).toString();
this.editingAreaStyleSheets.push(_1102);
text+="<link rel=\"stylesheet\" type=\"text/css\" href=\""+_1102+"\"/>";
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
if(this.document.createStyleSheet){
this.document.createStyleSheet(url);
}else{
var head=this.document.getElementsByTagName("head")[0];
var _1106=this.document.createElement("link");
with(_1106){
rel="stylesheet";
type="text/css";
href=url;
}
head.appendChild(_1106);
}
},removeStyleSheet:function(uri){
var url=uri.toString();
if(url.charAt(0)=="."||(url.charAt(0)!="/"&&!uri.host)){
url=(new dojo._Url(dojo.global.location,url)).toString();
}
var index=dojo.indexOf(this.editingAreaStyleSheets,url);
if(index==-1){
return;
}
delete this.editingAreaStyleSheets[index];
dojo.withGlobal(this.window,"query",dojo,["link:[href=\""+url+"\"]"]).orphan();
},disabled:true,_mozSettingProps:["styleWithCSS","insertBrOnReturn"],_setDisabledAttr:function(value){
if(!this.editNode||"_delayedDisabled" in this){
this._delayedDisabled=value;
return;
}
value=Boolean(value);
if(dojo.isIE||dojo.isSafari||dojo.isOpera){
var _110b=dojo.isIE&&(this.isLoaded||!this.focusOnLoad);
if(_110b){
this.editNode.unselectable="on";
}
this.editNode.contentEditable=!value;
if(_110b){
var _this=this;
setTimeout(function(){
_this.editNode.unselectable="off";
},0);
}
}else{
if(value){
this._mozSettings=[false,this.blockNodeForEnter==="BR"];
}
this.document.designMode=(value?"off":"on");
if(!value&&this._mozSettingProps){
var ps=this._mozSettingProps;
for(var n in ps){
if(ps.hasOwnProperty(n)){
try{
this.document.execCommand(n,false,ps[n]);
}
catch(e){
}
}
}
}
}
this.disabled=value;
},_isResized:function(){
return false;
},onLoad:function(e){
if(!this.window.__registeredWindow){
this.window.__registeredWindow=true;
dijit.registerWin(this.window);
}
if(!dojo.isIE&&(this.height||dojo.isMoz)){
this.editNode=this.document.body;
}else{
this.editNode=this.document.body.firstChild;
var _this=this;
if(dojo.isIE){
var _1111=this.tabStop=dojo.doc.createElement("<div tabIndex=-1>");
this.editingArea.appendChild(_1111);
this.iframe.onfocus=function(){
_this.editNode.setActive();
};
}
}
this.focusNode=this.editNode;
try{
this.attr("disabled",false);
}
catch(e){
var _1112=dojo.connect(this,"onClick",this,function(){
this.attr("disabled",false);
dojo.disconnect(_1112);
});
}
this._preDomFilterContent(this.editNode);
var _1113=this.events.concat(this.captureEvents);
var ap=(this.iframe)?this.document:this.editNode;
dojo.forEach(_1113,function(item){
this.connect(ap,item.toLowerCase(),item);
},this);
if(dojo.isIE){
this.connect(this.document,"onmousedown","_onIEMouseDown");
this.editNode.style.zoom=1;
}
if(this.focusOnLoad){
dojo.addOnLoad(dojo.hitch(this,"focus"));
}
this.onDisplayChanged(e);
if("_delayedDisabled" in this){
var d=this._delayedDisabled;
delete this._delayedDisabled;
this.attr("disabled",d);
}
this.isLoaded=true;
if(this.onLoadDeferred){
this.onLoadDeferred.callback(true);
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
}else{
if(dojo.isMoz&&!this.isTabIndent){
if(e.keyCode==dojo.keys.TAB&&!e.shiftKey&&!e.ctrlKey&&!e.altKey&&this.iframe){
var _1118=dojo.isFF<3?this.iframe.contentDocument:this.iframe;
_1118.title=this._localizedIframeTitles.iframeFocusTitle;
this.iframe.focus();
dojo.stopEvent(e);
}else{
if(e.keyCode==dojo.keys.TAB&&e.shiftKey){
if(this.toolbar){
this.toolbar.focus();
}
dojo.stopEvent(e);
}
}
}
}
return true;
},onKeyUp:function(e){
return;
},setDisabled:function(_111a){
dojo.deprecated("dijit.Editor::setDisabled is deprecated","use dijit.Editor::attr(\"disabled\",boolean) instead",2);
this.attr("disabled",_111a);
},_setValueAttr:function(value){
this.setValue(value);
},onKeyPress:function(e){
var c=(e.keyChar&&e.keyChar.toLowerCase())||e.keyCode;
var _111e=this._keyHandlers[c];
var args=arguments;
if(_111e){
dojo.forEach(_111e,function(h){
if((!!h.shift==!!e.shiftKey)&&(!!h.ctrl==!!e.ctrlKey)){
if(!h.handler.apply(this,args)){
e.preventDefault();
}
}
},this);
}
if(!this._onKeyHitch){
this._onKeyHitch=dojo.hitch(this,"onKeyPressed");
}
setTimeout(this._onKeyHitch,1);
return true;
},addKeyHandler:function(key,ctrl,shift,_1124){
if(!dojo.isArray(this._keyHandlers[key])){
this._keyHandlers[key]=[];
}
this._keyHandlers[key].push({shift:shift||false,ctrl:ctrl||false,handler:_1124});
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
var _c=this.getValue(true);
if(_c!=this.savedContent){
this.onChange(_c);
this.savedContent=_c;
}
if(dojo.isMoz&&this.iframe){
var _1129=dojo.isFF<3?this.iframe.contentDocument:this.iframe;
_1129.title=this._localizedIframeTitles.iframeEditTitle;
}
},_initialFocus:true,_onFocus:function(e){
if(dojo.isMoz&&this._initialFocus){
this._initialFocus=false;
if(this.editNode.innerHTML.replace(/^\s+|\s+$/g,"")=="&nbsp;"){
this.placeCursorAtStart();
}
}
this.inherited(arguments);
},blur:function(){
if(!dojo.isIE&&this.window.document.documentElement&&this.window.document.documentElement.focus){
this.window.document.documentElement.focus();
}else{
if(dojo.doc.body.focus){
dojo.doc.body.focus();
}
}
},focus:function(){
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
},onChange:function(_112c){
},_normalizeCommand:function(cmd){
var _112e=cmd.toLowerCase();
if(_112e=="formatblock"){
if(dojo.isSafari){
_112e="heading";
}
}else{
if(_112e=="hilitecolor"&&!dojo.isMoz){
_112e="backcolor";
}
}
return _112e;
},_qcaCache:{},queryCommandAvailable:function(_112f){
var ca=this._qcaCache[_112f];
if(ca!=undefined){
return ca;
}
return this._qcaCache[_112f]=this._queryCommandAvailable(_112f);
},_queryCommandAvailable:function(_1131){
var ie=1;
var _1133=1<<1;
var _1134=1<<2;
var opera=1<<3;
var _1136=1<<4;
var gt420=dojo.isSafari;
function isSupportedBy(_1138){
return {ie:Boolean(_1138&ie),mozilla:Boolean(_1138&_1133),safari:Boolean(_1138&_1134),safari420:Boolean(_1138&_1136),opera:Boolean(_1138&opera)};
};
var _1139=null;
switch(_1131.toLowerCase()){
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
_1139=isSupportedBy(_1133|ie|_1134|opera);
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
_1139=isSupportedBy(_1133|ie|opera|_1136);
break;
case "blockdirltr":
case "blockdirrtl":
case "dirltr":
case "dirrtl":
case "inlinedirltr":
case "inlinedirrtl":
_1139=isSupportedBy(ie);
break;
case "cut":
case "copy":
case "paste":
_1139=isSupportedBy(ie|_1133|_1136);
break;
case "inserttable":
_1139=isSupportedBy(_1133|ie);
break;
case "insertcell":
case "insertcol":
case "insertrow":
case "deletecells":
case "deletecols":
case "deleterows":
case "mergecells":
case "splitcell":
_1139=isSupportedBy(ie|_1133);
break;
default:
return false;
}
return (dojo.isIE&&_1139.ie)||(dojo.isMoz&&_1139.mozilla)||(dojo.isSafari&&_1139.safari)||(gt420&&_1139.safari420)||(dojo.isOpera&&_1139.opera);
},execCommand:function(_113a,_113b){
var _113c;
this.focus();
_113a=this._normalizeCommand(_113a);
if(_113b!=undefined){
if(_113a=="heading"){
throw new Error("unimplemented");
}else{
if((_113a=="formatblock")&&dojo.isIE){
_113b="<"+_113b+">";
}
}
}
if(_113a=="inserthtml"){
_113b=this._preFilterContent(_113b);
_113c=true;
if(dojo.isIE){
var _113d=this.document.selection.createRange();
if(this.document.selection.type.toUpperCase()=="CONTROL"){
var n=_113d.item(0);
while(_113d.length){
_113d.remove(_113d.item(0));
}
n.outerHTML=_113b;
}else{
_113d.pasteHTML(_113b);
}
_113d.select();
}else{
if(dojo.isMoz&&!_113b.length){
this._sCall("remove");
}else{
_113c=this.document.execCommand(_113a,false,_113b);
}
}
}else{
if((_113a=="unlink")&&(this.queryCommandEnabled("unlink"))&&(dojo.isMoz||dojo.isSafari)){
var a=this._sCall("getAncestorElement",["a"]);
this._sCall("selectElement",[a]);
_113c=this.document.execCommand("unlink",false,null);
}else{
if((_113a=="hilitecolor")&&(dojo.isMoz)){
this.document.execCommand("styleWithCSS",false,true);
_113c=this.document.execCommand(_113a,false,_113b);
this.document.execCommand("styleWithCSS",false,false);
}else{
if((dojo.isIE)&&((_113a=="backcolor")||(_113a=="forecolor"))){
_113b=arguments.length>1?_113b:null;
_113c=this.document.execCommand(_113a,false,_113b);
}else{
_113b=arguments.length>1?_113b:null;
if(_113b||_113a!="createlink"){
_113c=this.document.execCommand(_113a,false,_113b);
}
}
}
}
}
this.onDisplayChanged();
return _113c;
},queryCommandEnabled:function(_1140){
if(this.disabled){
return false;
}
_1140=this._normalizeCommand(_1140);
if(dojo.isMoz||dojo.isSafari){
if(_1140=="unlink"){
this._sCall("hasAncestorElement",["a"]);
}else{
if(_1140=="inserttable"){
return true;
}
}
}
if(dojo.isSafari){
if(_1140=="copy"){
_1140="cut";
}else{
if(_1140=="paste"){
return true;
}
}
}
if(_1140=="indent"){
var li=this._sCall("getAncestorElement",["li"]);
var n=li&&li.previousSibling;
while(n){
if(n.nodeType==1){
return true;
}
n=n.previousSibling;
}
return false;
}else{
if(_1140=="outdent"){
return this._sCall("hasAncestorElement",["li"]);
}
}
var elem=dojo.isIE?this.document.selection.createRange():this.document;
return elem.queryCommandEnabled(_1140);
},queryCommandState:function(_1144){
if(this.disabled){
return false;
}
_1144=this._normalizeCommand(_1144);
return this.document.queryCommandState(_1144);
},queryCommandValue:function(_1145){
if(this.disabled){
return false;
}
var r;
_1145=this._normalizeCommand(_1145);
if(dojo.isIE&&_1145=="formatblock"){
r=this._native2LocalFormatNames[this.document.queryCommandValue(_1145)];
}else{
r=this.document.queryCommandValue(_1145);
}
return r;
},_sCall:function(name,args){
return dojo.withGlobal(this.window,name,dijit._editor.selection,args);
},placeCursorAtStart:function(){
this.focus();
var _1149=false;
if(dojo.isMoz){
var first=this.editNode.firstChild;
while(first){
if(first.nodeType==3){
if(first.nodeValue.replace(/^\s+|\s+$/g,"").length>0){
_1149=true;
this._sCall("selectElement",[first]);
break;
}
}else{
if(first.nodeType==1){
_1149=true;
this._sCall("selectElementChildren",[first]);
break;
}
}
first=first.nextSibling;
}
}else{
_1149=true;
this._sCall("selectElementChildren",[this.editNode]);
}
if(_1149){
this._sCall("collapse",[true]);
}
},placeCursorAtEnd:function(){
this.focus();
var _114b=false;
if(dojo.isMoz){
var last=this.editNode.lastChild;
while(last){
if(last.nodeType==3){
if(last.nodeValue.replace(/^\s+|\s+$/g,"").length>0){
_114b=true;
this._sCall("selectElement",[last]);
break;
}
}else{
if(last.nodeType==1){
_114b=true;
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
_114b=true;
this._sCall("selectElementChildren",[this.editNode]);
}
if(_114b){
this._sCall("collapse",[false]);
}
},getValue:function(_114d){
if(this.textarea){
if(this.isClosed||!this.isLoaded){
return this.textarea.value;
}
}
return this._postFilterContent(null,_114d);
},_getValueAttr:function(){
return this.getValue();
},setValue:function(html){
if(!this.isLoaded){
this.onLoadDeferred.addCallback(dojo.hitch(this,function(){
this.setValue(html);
}));
return;
}
if(this.textarea&&(this.isClosed||!this.isLoaded)){
this.textarea.value=html;
}else{
html=this._preFilterContent(html);
var node=this.isClosed?this.domNode:this.editNode;
node.innerHTML=html;
this._preDomFilterContent(node);
}
this.onDisplayChanged();
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
if(dojo.isMoz&&!html){
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
},_postFilterContent:function(dom,_1157){
var ec;
if(!dojo.isString(dom)){
dom=dom||this.editNode;
if(this.contentDomPostFilters.length){
if(_1157){
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
var _115c=dojo.byId(dijit._scopeName+"._editor.RichText.savedContent");
_115c.value+=this._SEPARATOR+this.name+":"+this.getValue();
},escapeXml:function(str,_115e){
str=str.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;");
if(!_115e){
str=str.replace(/'/gm,"&#39;");
}
return str;
},getNodeHtml:function(node){
dojo.deprecated("dijit.Editor::getNodeHtml is deprecated","use dijit._editor.getNodeHtml instead",2);
return dijit._editor.getNodeHtml(node);
},getNodeChildrenHtml:function(dom){
dojo.deprecated("dijit.Editor::getNodeChildrenHtml is deprecated","use dijit._editor.getChildrenHtml instead",2);
return dijit._editor.getChildrenHtml(dom);
},close:function(save,force){
if(this.isClosed){
return false;
}
if(!arguments.length){
save=true;
}
this._content=this.getValue();
var _1163=(this.savedContent!=this._content);
if(this.interval){
clearInterval(this.interval);
}
if(this.textarea){
with(this.textarea.style){
position="";
left=top="";
if(dojo.isIE){
overflow=this.__overflow;
this.__overflow=null;
}
}
this.textarea.value=save?this._content:this.savedContent;
dojo._destroyElement(this.domNode);
this.domNode=this.textarea;
}else{
this.domNode.innerHTML=save?this._content:this.savedContent;
}
dojo.removeClass(this.domNode,"RichTextEditable");
this.isClosed=true;
this.isLoaded=false;
delete this.editNode;
if(this.window&&this.window._frameElement){
this.window._frameElement=null;
}
this.window=null;
this.document=null;
this.editingArea=null;
this.editorObject=null;
return _1163;
},destroyRendering:function(){
},destroy:function(){
this.destroyRendering();
if(!this.isClosed){
this.close(false);
}
this.inherited("destroy",arguments);
},_removeMozBogus:function(html){
return html.replace(/\stype="_moz"/gi,"").replace(/\s_moz_dirty=""/gi,"");
},_removeSafariBogus:function(html){
return html.replace(/\sclass="webkit-block-placeholder"/gi,"");
},_fixContentForMoz:function(html){
return html.replace(/<(\/)?strong([ \>])/gi,"<$1b$2").replace(/<(\/)?em([ \>])/gi,"<$1i$2");
},_preFixUrlAttributes:function(html){
return html.replace(/(?:(<a(?=\s).*?\shref=)("|')(.*?)\2)|(?:(<a\s.*?href=)([^"'][^ >]+))/gi,"$1$4$2$3$5$2 _djrealurl=$2$3$5$2").replace(/(?:(<img(?=\s).*?\ssrc=)("|')(.*?)\2)|(?:(<img\s.*?src=)([^"'][^ >]+))/gi,"$1$4$2$3$5$2 _djrealurl=$2$3$5$2");
}});
}
if(!dojo._hasResource["dijit.Toolbar"]){
dojo._hasResource["dijit.Toolbar"]=true;
dojo.provide("dijit.Toolbar");
dojo.declare("dijit.Toolbar",[dijit._Widget,dijit._Templated,dijit._KeyNavContainer],{templateString:"<div class=\"dijit dijitToolbar\" waiRole=\"toolbar\" tabIndex=\"${tabIndex}\" dojoAttachPoint=\"containerNode\">"+"</div>",tabIndex:"0",postCreate:function(){
this.connectKeyNavHandlers(this.isLeftToRight()?[dojo.keys.LEFT_ARROW]:[dojo.keys.RIGHT_ARROW],this.isLeftToRight()?[dojo.keys.RIGHT_ARROW]:[dojo.keys.LEFT_ARROW]);
},startup:function(){
if(this._started){
return;
}
this.startupKeyNavChildren();
this.inherited(arguments);
}});
dojo.declare("dijit.ToolbarSeparator",[dijit._Widget,dijit._Templated],{templateString:"<div class=\"dijitToolbarSeparator dijitInline\"></div>",postCreate:function(){
dojo.setSelectable(this.domNode,false);
},isFocusable:function(){
return false;
}});
}
if(!dojo._hasResource["dijit._editor._Plugin"]){
dojo._hasResource["dijit._editor._Plugin"]=true;
dojo.provide("dijit._editor._Plugin");
dojo.declare("dijit._editor._Plugin",null,{constructor:function(args,node){
if(args){
dojo.mixin(this,args);
}
this._connects=[];
},editor:null,iconClassPrefix:"dijitEditorIcon",button:null,queryCommand:null,command:"",commandArg:null,useDefaultCommand:true,buttonClass:dijit.form.Button,getLabel:function(key){
return this.editor.commands[key];
},_initButton:function(props){
if(this.command.length){
var label=this.getLabel(this.command);
var _116d=this.iconClassPrefix+" "+this.iconClassPrefix+this.command.charAt(0).toUpperCase()+this.command.substr(1);
if(!this.button){
props=dojo.mixin({label:label,showLabel:false,iconClass:_116d,dropDown:this.dropDown,tabIndex:"-1"},props||{});
this.button=new this.buttonClass(props);
}
}
},destroy:function(f){
dojo.forEach(this._connects,dojo.disconnect);
},connect:function(o,f,tf){
this._connects.push(dojo.connect(o,f,this,tf));
},updateState:function(){
var _e=this.editor;
var _c=this.command;
if(!_e){
return;
}
if(!_e.isLoaded){
return;
}
if(!_c.length){
return;
}
if(this.button){
try{
var _1174=_e.queryCommandEnabled(_c);
if(this.enabled!==_1174){
this.enabled=_1174;
this.button.attr("disabled",!_1174);
}
if(typeof this.button.checked=="boolean"){
var _1175=_e.queryCommandState(_c);
if(this.checked!==_1175){
this.checked=_1175;
this.button.attr("checked",_e.queryCommandState(_c));
}
}
}
catch(e){
console.debug(e);
}
}
},setEditor:function(_1176){
this.editor=_1176;
this._initButton();
if(this.command.length&&!this.editor.queryCommandAvailable(this.command)){
if(this.button){
this.button.domNode.style.display="none";
}
}
if(this.button&&this.useDefaultCommand){
this.connect(this.button,"onClick",dojo.hitch(this.editor,"execCommand",this.command,this.commandArg));
}
this.connect(this.editor,"onNormalizedDisplayChanged","updateState");
},setToolbar:function(_1177){
if(this.button){
_1177.addChild(this.button);
}
}});
}
if(!dojo._hasResource["dijit._editor.plugins.EnterKeyHandling"]){
dojo._hasResource["dijit._editor.plugins.EnterKeyHandling"]=true;
dojo.provide("dijit._editor.plugins.EnterKeyHandling");
dojo.declare("dijit._editor.plugins.EnterKeyHandling",dijit._editor._Plugin,{blockNodeForEnter:"BR",constructor:function(args){
if(args){
dojo.mixin(this,args);
}
},setEditor:function(_1179){
this.editor=_1179;
if(this.blockNodeForEnter=="BR"){
if(dojo.isIE){
_1179.contentDomPreFilters.push(dojo.hitch(this,"regularPsToSingleLinePs"));
_1179.contentDomPostFilters.push(dojo.hitch(this,"singleLinePsToRegularPs"));
_1179.onLoadDeferred.addCallback(dojo.hitch(this,"_fixNewLineBehaviorForIE"));
}else{
_1179.onLoadDeferred.addCallback(dojo.hitch(this,function(d){
try{
this.editor.document.execCommand("insertBrOnReturn",false,true);
}
catch(e){
}
return d;
}));
}
}else{
if(this.blockNodeForEnter){
dojo["require"]("dijit._editor.range");
var h=dojo.hitch(this,this.handleEnterKey);
_1179.addKeyHandler(13,0,0,h);
_1179.addKeyHandler(13,0,1,h);
this.connect(this.editor,"onKeyPressed","onKeyPressed");
}
}
},connect:function(o,f,tf){
if(!this._connects){
this._connects=[];
}
this._connects.push(dojo.connect(o,f,this,tf));
},destroy:function(){
dojo.forEach(this._connects,dojo.disconnect);
this._connects=[];
},onKeyPressed:function(e){
if(this._checkListLater){
if(dojo.withGlobal(this.editor.window,"isCollapsed",dijit)){
var _1180=dojo.withGlobal(this.editor.window,"getAncestorElement",dijit._editor.selection,["LI"]);
if(!_1180){
dijit._editor.RichText.prototype.execCommand.call(this.editor,"formatblock",this.blockNodeForEnter);
var block=dojo.withGlobal(this.editor.window,"getAncestorElement",dijit._editor.selection,[this.blockNodeForEnter]);
if(block){
block.innerHTML=this.bogusHtmlContent;
if(dojo.isIE){
var r=this.editor.document.selection.createRange();
r.move("character",-1);
r.select();
}
}else{
alert("onKeyPressed: Can not find the new block node");
}
}else{
if(dojo.isMoz){
if(_1180.parentNode.parentNode.nodeName=="LI"){
_1180=_1180.parentNode.parentNode;
}
}
var fc=_1180.firstChild;
if(fc&&fc.nodeType==1&&(fc.nodeName=="UL"||fc.nodeName=="OL")){
_1180.insertBefore(fc.ownerDocument.createTextNode(" "),fc);
var _1184=dijit.range.create();
_1184.setStart(_1180.firstChild,0);
var _1185=dijit.range.getSelection(this.editor.window,true);
_1185.removeAllRanges();
_1185.addRange(_1184);
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
if(!this.blockNodeForEnter){
return true;
}
var _1187,range,_1189,doc=this.editor.document,br;
if(e.shiftKey||this.blockNodeForEnter=="BR"){
var _118c=dojo.withGlobal(this.editor.window,"getParentElement",dijit._editor.selection);
var _118d=dijit.range.getAncestor(_118c,this.blockNodes);
if(_118d){
if(!e.shiftKey&&_118d.tagName=="LI"){
return true;
}
_1187=dijit.range.getSelection(this.editor.window);
range=_1187.getRangeAt(0);
if(!range.collapsed){
range.deleteContents();
}
if(dijit.range.atBeginningOfContainer(_118d,range.startContainer,range.startOffset)){
if(e.shiftKey){
br=doc.createElement("br");
_1189=dijit.range.create();
_118d.insertBefore(br,_118d.firstChild);
_1189.setStartBefore(br.nextSibling);
_1187.removeAllRanges();
_1187.addRange(_1189);
}else{
dojo.place(br,_118d,"before");
}
}else{
if(dijit.range.atEndOfContainer(_118d,range.startContainer,range.startOffset)){
_1189=dijit.range.create();
br=doc.createElement("br");
if(e.shiftKey){
_118d.appendChild(br);
_118d.appendChild(doc.createTextNode(" "));
_1189.setStart(_118d.lastChild,0);
}else{
dojo.place(br,_118d,"after");
_1189.setStartAfter(_118d);
}
_1187.removeAllRanges();
_1187.addRange(_1189);
}else{
return true;
}
}
}else{
dijit._editor.RichText.prototype.execCommand.call(this.editor,"inserthtml","<br>");
}
return false;
}
var _118e=true;
_1187=dijit.range.getSelection(this.editor.window);
range=_1187.getRangeAt(0);
if(!range.collapsed){
range.deleteContents();
}
var block=dijit.range.getBlockAncestor(range.endContainer,null,this.editor.editNode);
var _1190=block.blockNode;
if((this._checkListLater=(_1190&&(_1190.nodeName=="LI"||_1190.parentNode.nodeName=="LI")))){
if(dojo.isMoz){
this._pressedEnterInBlock=_1190;
}
if(/^(?:\s|&nbsp;)$/.test(_1190.innerHTML)){
_1190.innerHTML="";
}
return true;
}
if(!block.blockNode||block.blockNode===this.editor.editNode){
dijit._editor.RichText.prototype.execCommand.call(this.editor,"formatblock",this.blockNodeForEnter);
block={blockNode:dojo.withGlobal(this.editor.window,"getAncestorElement",dijit._editor.selection,[this.blockNodeForEnter]),blockContainer:this.editor.editNode};
if(block.blockNode){
if(!(block.blockNode.textContent||block.blockNode.innerHTML).replace(/^\s+|\s+$/g,"").length){
this.removeTrailingBr(block.blockNode);
return false;
}
}else{
block.blockNode=this.editor.editNode;
}
_1187=dijit.range.getSelection(this.editor.window);
range=_1187.getRangeAt(0);
}
var _1191=doc.createElement(this.blockNodeForEnter);
_1191.innerHTML=this.bogusHtmlContent;
this.removeTrailingBr(block.blockNode);
if(dijit.range.atEndOfContainer(block.blockNode,range.endContainer,range.endOffset)){
if(block.blockNode===block.blockContainer){
block.blockNode.appendChild(_1191);
}else{
dojo.place(_1191,block.blockNode,"after");
}
_118e=false;
_1189=dijit.range.create();
_1189.setStart(_1191,0);
_1187.removeAllRanges();
_1187.addRange(_1189);
if(this.editor.height){
_1191.scrollIntoView(false);
}
}else{
if(dijit.range.atBeginningOfContainer(block.blockNode,range.startContainer,range.startOffset)){
dojo.place(_1191,block.blockNode,block.blockNode===block.blockContainer?"first":"before");
if(_1191.nextSibling&&this.editor.height){
_1191.nextSibling.scrollIntoView(false);
}
_118e=false;
}else{
if(dojo.isMoz){
this._pressedEnterInBlock=block.blockNode;
}
}
}
return _118e;
},removeTrailingBr:function(_1192){
var para=/P|DIV|LI/i.test(_1192.tagName)?_1192:dijit._editor.selection.getParentOfType(_1192,["P","DIV","LI"]);
if(!para){
return;
}
if(para.lastChild){
if((para.childNodes.length>1&&para.lastChild.nodeType==3&&/^[\s\xAD]*$/.test(para.lastChild.nodeValue))||(para.lastChild&&para.lastChild.tagName=="BR")){
dojo._destroyElement(para.lastChild);
}
}
if(!para.childNodes.length){
para.innerHTML=this.bogusHtmlContent;
}
},_fixNewLineBehaviorForIE:function(d){
if(this.editor.document.__INSERTED_EDITIOR_NEWLINE_CSS===undefined){
var _1195="p{margin:0 !important;}";
var _1196=function(_1197,doc,URI){
if(!_1197){
return null;
}
if(!doc){
doc=document;
}
var style=doc.createElement("style");
style.setAttribute("type","text/css");
var head=doc.getElementsByTagName("head")[0];
if(!head){
console.debug("No head tag in document, aborting styles");
return null;
}else{
head.appendChild(style);
}
if(style.styleSheet){
var _119c=function(){
try{
style.styleSheet.cssText=_1197;
}
catch(e){
console.debug(e);
}
};
if(style.styleSheet.disabled){
setTimeout(_119c,10);
}else{
_119c();
}
}else{
var _119d=doc.createTextNode(_1197);
style.appendChild(_119d);
}
return style;
};
_1196(_1195,this.editor.document);
this.editor.document.__INSERTED_EDITIOR_NEWLINE_CSS=true;
return d;
}
return null;
},regularPsToSingleLinePs:function(_119e,_119f){
function wrapLinesInPs(el){
function wrapNodes(nodes){
var newP=nodes[0].ownerDocument.createElement("p");
nodes[0].parentNode.insertBefore(newP,nodes[0]);
dojo.forEach(nodes,function(node){
newP.appendChild(node);
});
};
var _11a4=0;
var _11a5=[];
var _11a6;
while(_11a4<el.childNodes.length){
_11a6=el.childNodes[_11a4];
if(_11a6.nodeType==3||(_11a6.nodeType==1&&_11a6.nodeName!="BR"&&dojo.style(_11a6,"display")!="block")){
_11a5.push(_11a6);
}else{
var _11a7=_11a6.nextSibling;
if(_11a5.length){
wrapNodes(_11a5);
_11a4=(_11a4+1)-_11a5.length;
if(_11a6.nodeName=="BR"){
dojo._destroyElement(_11a6);
}
}
_11a5=[];
}
_11a4++;
}
if(_11a5.length){
wrapNodes(_11a5);
}
};
function splitP(el){
var _11a9=null;
var _11aa=[];
var _11ab=el.childNodes.length-1;
for(var i=_11ab;i>=0;i--){
_11a9=el.childNodes[i];
if(_11a9.nodeName=="BR"){
var newP=_11a9.ownerDocument.createElement("p");
dojo.place(newP,el,"after");
if(_11aa.length==0&&i!=_11ab){
newP.innerHTML="&nbsp;";
}
dojo.forEach(_11aa,function(node){
newP.appendChild(node);
});
dojo._destroyElement(_11a9);
_11aa=[];
}else{
_11aa.unshift(_11a9);
}
}
};
var pList=[];
var ps=_119e.getElementsByTagName("p");
dojo.forEach(ps,function(p){
pList.push(p);
});
dojo.forEach(pList,function(p){
if((p.previousSibling)&&(p.previousSibling.nodeName=="P"||dojo.style(p.previousSibling,"display")!="block")){
var newP=p.parentNode.insertBefore(this.document.createElement("p"),p);
newP.innerHTML=_119f?"":"&nbsp;";
}
splitP(p);
},this.editor);
wrapLinesInPs(_119e);
return _119e;
},singleLinePsToRegularPs:function(_11b4){
function getParagraphParents(node){
var ps=node.getElementsByTagName("p");
var _11b7=[];
for(var i=0;i<ps.length;i++){
var p=ps[i];
var _11ba=false;
for(var k=0;k<_11b7.length;k++){
if(_11b7[k]===p.parentNode){
_11ba=true;
break;
}
}
if(!_11ba){
_11b7.push(p.parentNode);
}
}
return _11b7;
};
function isParagraphDelimiter(node){
if(node.nodeType!=1||node.tagName!="P"){
return dojo.style(node,"display")=="block";
}else{
if(!node.childNodes.length||node.innerHTML=="&nbsp;"){
return true;
}
}
return false;
};
var _11bd=getParagraphParents(_11b4);
for(var i=0;i<_11bd.length;i++){
var _11bf=_11bd[i];
var _11c0=null;
var node=_11bf.firstChild;
var _11c2=null;
while(node){
if(node.nodeType!="1"||node.tagName!="P"){
_11c0=null;
}else{
if(isParagraphDelimiter(node)){
_11c2=node;
_11c0=null;
}else{
if(_11c0==null){
_11c0=node;
}else{
if((!_11c0.lastChild||_11c0.lastChild.nodeName!="BR")&&(node.firstChild)&&(node.firstChild.nodeName!="BR")){
_11c0.appendChild(this.editor.document.createElement("br"));
}
while(node.firstChild){
_11c0.appendChild(node.firstChild);
}
_11c2=node;
}
}
}
node=node.nextSibling;
if(_11c2){
dojo._destroyElement(_11c2);
_11c2=null;
}
}
}
return _11b4;
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
}
},postCreate:function(){
if(this.customUndo){
dojo["require"]("dijit._editor.range");
this._steps=this._steps.slice(0);
this._undoedSteps=this._undoedSteps.slice(0);
}
if(dojo.isArray(this.extraPlugins)){
this.plugins=this.plugins.concat(this.extraPlugins);
}
this.inherited(arguments);
this.commands=dojo.i18n.getLocalization("dijit._editor","commands",this.lang);
if(!this.toolbar){
this.toolbar=new dijit.Toolbar({});
dojo.place(this.toolbar.domNode,this.editingArea,"before");
}
dojo.forEach(this.plugins,this.addPlugin,this);
this.onNormalizedDisplayChanged();
this.toolbar.startup();
},destroy:function(){
dojo.forEach(this._plugins,function(p){
if(p&&p.destroy){
p.destroy();
}
});
this._plugins=[];
this.toolbar.destroy();
delete this.toolbar;
this.inherited(arguments);
},addPlugin:function(_11c4,index){
var args=dojo.isString(_11c4)?{name:_11c4}:_11c4;
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
console.warn("Cannot find plugin",_11c4);
return;
}
_11c4=o.plugin;
}
if(arguments.length>1){
this._plugins[index]=_11c4;
}else{
this._plugins.push(_11c4);
}
_11c4.setEditor(this);
if(dojo.isFunction(_11c4.setToolbar)){
_11c4.setToolbar(this.toolbar);
}
},startup:function(){
},resize:function(){
dijit.layout._LayoutWidget.prototype.resize.apply(this,arguments);
},layout:function(){
this.editingArea.style.height=(this._contentBox.h-dojo.marginBox(this.toolbar.domNode).h)+"px";
if(this.iframe){
this.iframe.style.height="100%";
}
this._layoutMode=true;
},onBeforeDeactivate:function(e){
if(this.customUndo){
this.endEditing(true);
}
this._saveSelection();
},customUndo:dojo.isIE,editActionInterval:3,beginEditing:function(cmd){
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
try{
var r=this.inherited("execCommand",arguments);
if(dojo.isSafari&&cmd=="paste"&&!r){
var su=dojo.string.substitute,_isM=navigator.userAgent.indexOf("Macintosh")!=-1;
alert(su(this.commands.systemShortcut,[this.commands[cmd],su(this.commands[_isM?"appleKey":"ctrlKey"],["V"])]));
}
}
catch(e){
if(dojo.isMoz&&/copy|cut|paste/.test(cmd)){
var sub=dojo.string.substitute,accel={cut:"X",copy:"C",paste:"V"},isMac=navigator.userAgent.indexOf("Macintosh")!=-1;
alert(sub(this.commands.systemShortcutFF,[this.commands[cmd],sub(this.commands[isMac?"appleKey":"ctrlKey"],[accel[cmd]])]));
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
return this.inherited("queryCommandEnabled",arguments);
}
},focus:function(){
var _11d3=0;
if(this._savedSelection&&dojo.isIE){
_11d3=dijit._curFocus!=this.editNode;
}
this.inherited(arguments);
if(_11d3){
this._restoreSelection();
}
},_moveToBookmark:function(b){
var _11d5=b;
if(dojo.isIE){
if(dojo.isArray(b)){
_11d5=[];
dojo.forEach(b,function(n){
_11d5.push(dijit.range.getNode(n,this.editNode));
},this);
}
}else{
var r=dijit.range.create();
r.setStart(dijit.range.getNode(b.startContainer,this.editNode),b.startOffset);
r.setEnd(dijit.range.getNode(b.endContainer,this.editNode),b.endOffset);
_11d5=r;
}
dojo.withGlobal(this.window,"moveToBookmark",dijit,[_11d5]);
},_changeToStep:function(from,to){
this.setValue(to.text);
var b=to.bookmark;
if(!b){
return;
}
this._moveToBookmark(b);
},undo:function(){
this.endEditing(true);
var s=this._steps.pop();
if(this._steps.length>0){
this.focus();
this._changeToStep(s,this._steps[this._steps.length-1]);
this._undoedSteps.push(s);
this.onDisplayChanged();
return true;
}
return false;
},redo:function(){
this.endEditing(true);
var s=this._undoedSteps.pop();
if(s&&this._steps.length>0){
this.focus();
this._changeToStep(this._steps[this._steps.length-1],s);
this._steps.push(s);
this.onDisplayChanged();
return true;
}
return false;
},endEditing:function(_11dd){
if(this._editTimer){
clearTimeout(this._editTimer);
}
if(this._inEditing){
this._endEditing(_11dd);
this._inEditing=false;
}
},_getBookmark:function(){
var b=dojo.withGlobal(this.window,dijit.getBookmark);
var tmp=[];
if(dojo.isIE){
if(dojo.isArray(b)){
dojo.forEach(b,function(n){
tmp.push(dijit.range.getIndex(n,this.editNode).o);
},this);
b=tmp;
}
}else{
tmp=dijit.range.getIndex(b.startContainer,this.editNode).o;
b={startContainer:tmp,startOffset:b.startOffset,endContainer:b.endContainer===b.startContainer?tmp:dijit.range.getIndex(b.endContainer,this.editNode).o,endOffset:b.endOffset};
}
return b;
},_beginEditing:function(cmd){
if(this._steps.length===0){
this._steps.push({"text":this.savedContent,"bookmark":this._getBookmark()});
}
},_endEditing:function(_11e2){
var v=this.getValue(true);
this._undoedSteps=[];
this._steps.push({text:v,bookmark:this._getBookmark()});
},onKeyDown:function(e){
if(!dojo.isIE&&!this.iframe&&e.keyCode==dojo.keys.TAB&&!this.tabIndent){
this._saveSelection();
}
if(!this.customUndo){
this.inherited("onKeyDown",arguments);
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
this.inherited("onKeyDown",arguments);
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
this.inherited("_onBlur",arguments);
this.endEditing(true);
},_saveSelection:function(){
this._savedSelection=this._getBookmark();
},_restoreSelection:function(){
if(this._savedSelection){
this._moveToBookmark(this._savedSelection);
delete this._savedSelection;
}
},_onFocus:function(){
this._restoreSelection();
this.inherited(arguments);
},onClick:function(){
this.endEditing(true);
this.inherited("onClick",arguments);
}});
dojo.subscribe(dijit._scopeName+".Editor.getPlugin",null,function(o){
if(o.plugin){
return;
}
var args=o.args,p;
var _p=dijit._editor._Plugin;
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
p=new _p({command:name});
break;
case "bold":
case "italic":
case "underline":
case "strikethrough":
case "subscript":
case "superscript":
p=new _p({buttonClass:dijit.form.ToggleButton,command:name});
break;
case "|":
p=new _p({button:new dijit.ToolbarSeparator()});
}
o.plugin=p;
});
}
if(!dojo._hasResource["dojox.grid.compat._data.dijitEditors"]){
dojo._hasResource["dojox.grid.compat._data.dijitEditors"]=true;
dojo.provide("dojox.grid.compat._data.dijitEditors");
dojo.declare("dojox.grid.editors.Dijit",dojox.grid.editors.base,{editorClass:"dijit.form.TextBox",constructor:function(_11ec){
this.editor=null;
this.editorClass=dojo.getObject(this.cell.editorClass||this.editorClass);
},format:function(_11ed,_11ee){
this.needFormatNode(_11ed,_11ee);
return "<div></div>";
},getValue:function(_11ef){
return this.editor.getValue();
},setValue:function(_11f0,_11f1){
if(this.editor&&this.editor.setValue){
this.editor.setValue(_11f1);
}else{
this.inherited(arguments);
}
},getEditorProps:function(_11f2){
return dojo.mixin({},this.cell.editorProps||{},{constraints:dojo.mixin({},this.cell.constraint)||{},value:_11f2});
},createEditor:function(_11f3,_11f4,_11f5){
return new this.editorClass(this.getEditorProps(_11f4),_11f3);
},attachEditor:function(_11f6,_11f7,_11f8){
_11f6.appendChild(this.editor.domNode);
this.setValue(_11f8,_11f7);
},formatNode:function(_11f9,_11fa,_11fb){
if(!this.editorClass){
return _11fa;
}
if(!this.editor){
this.editor=this.createEditor.apply(this,arguments);
}else{
this.attachEditor.apply(this,arguments);
}
this.sizeEditor.apply(this,arguments);
this.cell.grid.rowHeightChanged(_11fb);
this.focus();
},sizeEditor:function(_11fc,_11fd,_11fe){
var p=this.cell.getNode(_11fe),box=dojo.contentBox(p);
dojo.marginBox(this.editor.domNode,{w:box.w});
},focus:function(_1201,_1202){
if(this.editor){
setTimeout(dojo.hitch(this.editor,function(){
dojox.grid.fire(this,"focus");
}),0);
}
},_finish:function(_1203){
this.inherited(arguments);
dojox.grid.removeNode(this.editor.domNode);
}});
dojo.declare("dojox.grid.editors.ComboBox",dojox.grid.editors.Dijit,{editorClass:"dijit.form.ComboBox",getEditorProps:function(_1204){
var items=[];
dojo.forEach(this.cell.options,function(o){
items.push({name:o,value:o});
});
var store=new dojo.data.ItemFileReadStore({data:{identifier:"name",items:items}});
return dojo.mixin({},this.cell.editorProps||{},{value:_1204,store:store});
},getValue:function(){
var e=this.editor;
e.setDisplayedValue(e.getDisplayedValue());
return e.getValue();
}});
dojo.declare("dojox.grid.editors.DateTextBox",dojox.grid.editors.Dijit,{editorClass:"dijit.form.DateTextBox",setValue:function(_1209,_120a){
if(this.editor){
this.editor.setValue(new Date(_120a));
}else{
this.inherited(arguments);
}
},getEditorProps:function(_120b){
return dojo.mixin(this.inherited(arguments),{value:new Date(_120b)});
}});
dojo.declare("dojox.grid.editors.CheckBox",dojox.grid.editors.Dijit,{editorClass:"dijit.form.CheckBox",getValue:function(){
return this.editor.checked;
},setValue:function(_120c,_120d){
if(this.editor&&this.editor.setAttribute){
this.editor.setAttribute("checked",_120d);
}else{
this.inherited(arguments);
}
},sizeEditor:function(_120e,_120f,_1210){
return;
}});
dojo.declare("dojox.grid.editors.Editor",dojox.grid.editors.Dijit,{editorClass:"dijit.Editor",getEditorProps:function(_1211){
return dojo.mixin({},this.cell.editorProps||{},{height:this.cell.editorHeight||"100px"});
},createEditor:function(_1212,_1213,_1214){
var _1215=new this.editorClass(this.getEditorProps(_1213),_1212);
dojo.connect(_1215,"onLoad",dojo.hitch(this,"populateEditor"));
return _1215;
},formatNode:function(_1216,_1217,_1218){
this.content=_1217;
this.inherited(arguments);
if(dojo.isMoz){
var e=this.editor;
e.open();
if(this.cell.editorToolbar){
dojo.place(e.toolbar.domNode,e.editingArea,"before");
}
}
},populateEditor:function(){
this.editor.setValue(this.content);
this.editor.placeCursorAtEnd();
}});
}
if(!dojo._hasResource["dojox.grid.compat.Grid"]){
dojo._hasResource["dojox.grid.compat.Grid"]=true;
dojo.provide("dojox.grid.compat.Grid");
dojo.declare("dojox.Grid",dojox.VirtualGrid,{model:"dojox.grid.data.Table",postCreate:function(){
if(this.model){
var m=this.model;
if(dojo.isString(m)){
m=dojo.getObject(m);
}
this.model=(dojo.isFunction(m))?new m():m;
this._setModel(this.model);
}
this.inherited(arguments);
},destroy:function(){
this.setModel(null);
this.inherited(arguments);
},_structureChanged:function(){
this.indexCellFields();
this.inherited(arguments);
},_setModel:function(_121b){
this.model=_121b;
if(this.model){
this.model.observer(this);
this.model.measure();
this.indexCellFields();
}
},setModel:function(_121c){
if(this.model){
this.model.notObserver(this);
}
this._setModel(_121c);
},get:function(_121d){
return this.grid.model.getDatum(_121d,this.fieldIndex);
},modelAllChange:function(){
this.rowCount=(this.model?this.model.getRowCount():0);
this.updateRowCount(this.rowCount);
},modelBeginUpdate:function(){
this.beginUpdate();
},modelEndUpdate:function(){
this.endUpdate();
},modelRowChange:function(_121e,_121f){
this.updateRow(_121f);
},modelDatumChange:function(_1220,_1221,_1222){
this.updateRow(_1221);
},modelFieldsChange:function(){
this.indexCellFields();
this.render();
},modelInsertion:function(_1223){
this.updateRowCount(this.model.getRowCount());
},modelRemoval:function(_1224){
this.updateRowCount(this.model.getRowCount());
},getCellName:function(_1225){
var v=this.model.fields.values,i=_1225.fieldIndex;
return i>=0&&i<v.length&&v[i].name||this.inherited(arguments);
},indexCellFields:function(){
var cells=this.layout.cells;
for(var i=0,c;cells&&(c=cells[i]);i++){
if(dojo.isString(c.field)){
c.fieldIndex=this.model.fields.indexOf(c.field);
}
}
},refresh:function(){
this.edit.cancel();
this.model.measure();
},canSort:function(_122b){
var f=this.getSortField(_122b);
return f&&this.model.canSort(f);
},getSortField:function(_122d){
var c=this.getCell(this.getSortIndex(_122d));
return (c.fieldIndex+1)*(this.sortInfo>0?1:-1);
},sort:function(){
this.edit.apply();
this.model.sort(this.getSortField());
},addRow:function(_122f,_1230){
this.edit.apply();
var i=_1230||-1;
if(i<0){
i=this.selection.getFirstSelected()||0;
}
if(i<0){
i=0;
}
this.model.insert(_122f,i);
this.model.beginModifyRow(i);
for(var j=0,c;((c=this.getCell(j))&&!c.editor);j++){
}
if(c&&c.editor){
this.edit.setEditCell(c,i);
this.focus.setFocusCell(c,i);
}else{
this.focus.setFocusCell(this.getCell(0),i);
}
},removeSelectedRows:function(){
this.edit.apply();
var s=this.selection.getSelected();
if(s.length){
this.model.remove(s);
this.selection.clear();
}
},canEdit:function(_1235,_1236){
return (this.model.canModify?this.model.canModify(_1236):true);
},doStartEdit:function(_1237,_1238){
this.model.beginModifyRow(_1238);
this.onStartEdit(_1237,_1238);
},doApplyCellEdit:function(_1239,_123a,_123b){
this.model.setDatum(_1239,_123a,_123b);
this.onApplyCellEdit(_1239,_123a,_123b);
},doCancelEdit:function(_123c){
this.model.cancelModifyRow(_123c);
this.onCancelEdit.apply(this,arguments);
},doApplyEdit:function(_123d){
this.model.endModifyRow(_123d);
this.onApplyEdit(_123d);
},styleRowState:function(inRow){
if(this.model.getState){
var _123f=this.model.getState(inRow.index),c="";
for(var i=0,ss=["inflight","error","inserting"],s;s=ss[i];i++){
if(_123f[s]){
c=" dojoxGrid-row-"+s;
break;
}
}
inRow.customClasses+=c;
}
},onStyleRow:function(inRow){
this.styleRowState(inRow);
this.inherited(arguments);
}});
dojox.Grid.markupFactory=function(props,node,ctor){
var d=dojo;
var _1249=function(n){
var w=d.attr(n,"width")||"auto";
if((w!="auto")&&(w.substr(-2)!="em")){
w=parseInt(w)+"px";
}
return w;
};
if(!props.model&&d.hasAttr(node,"store")){
var mNode=node.cloneNode(false);
d.attr(mNode,{"jsId":null,"dojoType":d.attr(node,"dataModelClass")||"dojox.grid.data.DojoData"});
props.model=d.parser.instantiate([mNode])[0];
}
if(!props.structure&&node.nodeName.toLowerCase()=="table"){
props.structure=d.query("> colgroup",node).map(function(cg){
var sv=d.attr(cg,"span");
var v={noscroll:(d.attr(cg,"noscroll")=="true")?true:false,__span:(!!sv?parseInt(sv):1),cells:[]};
if(d.hasAttr(cg,"width")){
v.width=_1249(cg);
}
return v;
});
if(!props.structure.length){
props.structure.push({__span:Infinity,cells:[]});
}
d.query("thead > tr",node).forEach(function(tr,_1251){
var _1252=0;
var _1253=0;
var _1254;
var cView=null;
d.query("> th",tr).map(function(th){
if(!cView){
_1254=0;
cView=props.structure[0];
}else{
if(_1252>=(_1254+cView.__span)){
_1253++;
_1254+=cView.__span;
lastView=cView;
cView=props.structure[_1253];
}
}
var cell={name:d.trim(d.attr(th,"name")||th.innerHTML),field:d.trim(d.attr(th,"field")||""),colSpan:parseInt(d.attr(th,"colspan")||1)};
_1252+=cell.colSpan;
cell.field=cell.field||cell.name;
cell.width=_1249(th);
if(!cView.cells[_1251]){
cView.cells[_1251]=[];
}
cView.cells[_1251].push(cell);
});
});
}
return new dojox.Grid(props,node);
};
dojox.grid.Grid=dojox.Grid;
}
if(!dojo._hasResource["dojox.grid.Grid"]){
dojo._hasResource["dojox.grid.Grid"]=true;
dojo.provide("dojox.grid.Grid");
dojo.deprecated("dojox.grid.Grid");
}
if(!dojo._hasResource["dojox.xml.DomParser"]){
dojo._hasResource["dojox.xml.DomParser"]=true;
dojo.provide("dojox.xml.DomParser");
dojox.xml.DomParser=new (function(){
var _1258={ELEMENT:1,ATTRIBUTE:2,TEXT:3,CDATA_SECTION:4,PROCESSING_INSTRUCTION:7,COMMENT:8,DOCUMENT:9};
var _1259=/<([^>\/\s+]*)([^>]*)>([^<]*)/g;
var _125a=/([^=]*)=(("([^"]*)")|('([^']*)'))/g;
var _125b=/<!ENTITY\s+([^"]*)\s+"([^"]*)">/g;
var _125c=/<!\[CDATA\[([\u0001-\uFFFF]*?)\]\]>/g;
var _125d=/<!--([\u0001-\uFFFF]*?)-->/g;
var trim=/^\s+|\s+$/g;
var _125f=/\s+/g;
var egt=/\&gt;/g;
var elt=/\&lt;/g;
var equot=/\&quot;/g;
var eapos=/\&apos;/g;
var eamp=/\&amp;/g;
var dNs="_def_";
function _doc(){
return new (function(){
var all={};
this.nodeType=_1258.DOCUMENT;
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
this.byName=this.getElementsByTagName=byName;
this.byNameNS=this.getElementsByTagNameNS=byNameNS;
this.childrenByName=childrenByName;
})();
};
function byName(name){
function __(node,name,arr){
dojo.forEach(node.childNodes,function(c){
if(c.nodeType==_1258.ELEMENT){
if(name=="*"){
arr.push(c);
}else{
if(c.nodeName==name){
arr.push(c);
}
}
__(c,name,arr);
}
});
};
var a=[];
__(this,name,a);
return a;
};
function byNameNS(name,ns){
function __(node,name,ns,arr){
dojo.forEach(node.childNodes,function(c){
if(c.nodeType==_1258.ELEMENT){
if(name=="*"&&c.ownerDocument._nsPaths[ns]==c.namespace){
arr.push(c);
}else{
if(c.localName==name&&c.ownerDocument._nsPaths[ns]==c.namespace){
arr.push(c);
}
}
__(c,name,ns,arr);
}
});
};
if(!ns){
ns=dNs;
}
var a=[];
__(this,name,ns,a);
return a;
};
function childrenByName(name){
var a=[];
dojo.forEach(this.childNodes,function(c){
if(c.nodeType==_1258.ELEMENT){
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
function _createTextNode(v){
return {nodeType:_1258.TEXT,nodeName:"#text",nodeValue:v.replace(_125f," ").replace(egt,">").replace(elt,"<").replace(eapos,"'").replace(equot,"\"").replace(eamp,"&")};
};
function getAttr(name){
for(var i=0;i<this.attributes.length;i++){
if(this.attributes[i].nodeName==name){
return this.attributes[i].nodeValue;
}
}
return null;
};
function getAttrNS(name,ns){
for(var i=0;i<this.attributes.length;i++){
if(this.ownerDocument._nsPaths[ns]==this.attributes[i].namespace&&this.attributes[i].localName==name){
return this.attributes[i].nodeValue;
}
}
return null;
};
function setAttr(name,val){
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
function setAttrNS(name,val,ns){
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
var root=_doc();
if(str==null){
return root;
}
if(str.length==0){
return root;
}
if(str.indexOf("<!ENTITY")>0){
var _128f,eRe=[];
if(_125b.test(str)){
_125b.lastIndex=0;
while((_128f=_125b.exec(str))!=null){
eRe.push({entity:"&"+_128f[1].replace(trim,"")+";",expression:_128f[2]});
}
for(var i=0;i<eRe.length;i++){
str=str.replace(new RegExp(eRe[i].entity,"g"),eRe[i].expression);
}
}
}
var _1292=[],cdata;
while((cdata=_125c.exec(str))!=null){
_1292.push(cdata[1]);
}
for(var i=0;i<_1292.length;i++){
str=str.replace(_1292[i],i);
}
var _1294=[],_1295;
while((_1295=_125d.exec(str))!=null){
_1294.push(_1295[1]);
}
for(i=0;i<_1294.length;i++){
str=str.replace(_1294[i],i);
}
var res,obj=root;
while((res=_1259.exec(str))!=null){
if(res[2].charAt(0)=="/"&&res[2].replace(trim,"").length>1){
if(obj.parentNode){
obj=obj.parentNode;
}
var text=(res[3]||"").replace(trim,"");
if(text.length>0){
obj.childNodes.push(_createTextNode(text));
}
}else{
if(res[1].length>0){
if(res[1].charAt(0)=="?"){
var name=res[1].substr(1);
var _129a=res[2].substr(0,res[2].length-2);
obj.childNodes.push({nodeType:_1258.PROCESSING_INSTRUCTION,nodeName:name,nodeValue:_129a});
}else{
if(res[1].charAt(0)=="!"){
if(res[1].indexOf("![CDATA[")==0){
var val=parseInt(res[1].replace("![CDATA[","").replace("]]",""));
obj.childNodes.push({nodeType:_1258.CDATA_SECTION,nodeName:"#cdata-section",nodeValue:_1292[val]});
}else{
if(res[1].substr(0,3)=="!--"){
var val=parseInt(res[1].replace("!--","").replace("--",""));
obj.childNodes.push({nodeType:_1258.COMMENT,nodeName:"#comment",nodeValue:_1294[val]});
}
}
}else{
var name=res[1].replace(trim,"");
var o={nodeType:_1258.ELEMENT,nodeName:name,localName:name,namespace:dNs,ownerDocument:root,attributes:[],parentNode:null,childNodes:[]};
if(name.indexOf(":")>-1){
var t=name.split(":");
o.namespace=t[0];
o.localName=t[1];
}
o.byName=o.getElementsByTagName=byName;
o.byNameNS=o.getElementsByTagNameNS=byNameNS;
o.childrenByName=childrenByName;
o.getAttribute=getAttr;
o.getAttributeNS=getAttrNS;
o.setAttribute=setAttr;
o.setAttributeNS=setAttrNS;
o.previous=o.previousSibling=prev;
o.next=o.nextSibling=next;
var attr;
while((attr=_125a.exec(res[2]))!=null){
if(attr.length>0){
var name=attr[1].replace(trim,"");
var val=(attr[4]||attr[6]||"").replace(_125f," ").replace(egt,">").replace(elt,"<").replace(eapos,"'").replace(equot,"\"").replace(eamp,"&");
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
o.attributes.push({nodeType:_1258.ATTRIBUTE,nodeName:name,localName:ln,namespace:ns,nodeValue:val});
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
obj.childNodes.push(_createTextNode(text));
}
}
}
}
}
}
for(var i=0;i<root.childNodes.length;i++){
var e=root.childNodes[i];
if(e.nodeType==_1258.ELEMENT){
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
this.appendArray=function(_12a9){
return this.append.apply(this,_12a9);
};
this.clear=function(){
b="";
this.length=0;
return this;
};
this.replace=function(_12aa,_12ab){
b=b.replace(_12aa,_12ab);
this.length=b.length;
return this;
};
this.remove=function(start,len){
if(len===undefined){
len=b.length;
}
if(len==0){
return this;
}
b=b.substr(0,start)+b.substr(start+len);
this.length=b.length;
return this;
};
this.insert=function(index,str){
if(index==0){
b=str+b;
}else{
b=b.slice(0,index)+str+b.slice(index);
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
dojox.string.tokenize=function(str,re,_12b2,_12b3){
var _12b4=[];
var match,_12b6,_12b7=0;
while(match=re.exec(str)){
_12b6=str.slice(_12b7,re.lastIndex-match[0].length);
if(_12b6.length){
_12b4.push(_12b6);
}
if(_12b2){
if(dojo.isOpera){
var copy=match.slice(0);
while(copy.length<match.length){
copy.push(null);
}
match=copy;
}
var _12b9=_12b2.apply(_12b3,match.slice(1).concat(_12b4.length));
if(typeof _12b9!="undefined"){
_12b4.push(_12b9);
}
}
_12b7=re.lastIndex;
}
_12b6=str.slice(_12b7);
if(_12b6.length){
_12b4.push(_12b6);
}
return _12b4;
};
}
if(!dojo._hasResource["dojox.dtl._base"]){
dojo._hasResource["dojox.dtl._base"]=true;
dojo.provide("dojox.dtl._base");
(function(){
var dd=dojox.dtl;
dd.TOKEN_BLOCK=-1;
dd.TOKEN_VAR=-2;
dd.TOKEN_COMMENT=-3;
dd.TOKEN_TEXT=3;
dd._Context=dojo.extend(function(dict){
dojo._mixin(this,dict||{});
this._dicts=[];
},{push:function(){
var last=this;
var _12bd=dojo.delegate(this);
_12bd.pop=function(){
return last;
};
return _12bd;
},pop:function(){
throw new Error("pop() called on empty Context");
},get:function(key,_12bf){
if(typeof this[key]!="undefined"){
return this._normalize(this[key]);
}
for(var i=0,dict;dict=this._dicts[i];i++){
if(typeof dict[key]!="undefined"){
return this._normalize(dict[key]);
}
}
return _12bf;
},_normalize:function(value){
if(value instanceof Date){
value.year=value.getFullYear();
value.month=value.getMonth()+1;
value.day=value.getDate();
value.date=value.year+"-"+("0"+value.month).slice(-2)+"-"+("0"+value.day).slice(-2);
value.hour=value.getHours();
value.minute=value.getMinutes();
value.second=value.getSeconds();
value.microsecond=value.getMilliseconds();
}
return value;
},update:function(dict){
var _12c4=this.push();
if(dict){
dojo._mixin(this,dict);
}
return _12c4;
}});
var _12c5=/("(?:[^"\\]*(?:\\.[^"\\]*)*)"|'(?:[^'\\]*(?:\\.[^'\\]*)*)'|[^\s]+)/g;
var _12c6=/\s+/g;
var split=function(_12c8,limit){
_12c8=_12c8||_12c6;
if(!(_12c8 instanceof RegExp)){
_12c8=new RegExp(_12c8,"g");
}
if(!_12c8.global){
throw new Error("You must use a globally flagged RegExp with split "+_12c8);
}
_12c8.exec("");
var part,parts=[],_12cc=0,i=0;
while(part=_12c8.exec(this)){
parts.push(this.slice(_12cc,_12c8.lastIndex-part[0].length));
_12cc=_12c8.lastIndex;
if(limit&&(++i>limit-1)){
break;
}
}
parts.push(this.slice(_12cc));
return parts;
};
dd.Token=function(_12ce,_12cf){
this.token_type=_12ce;
this.contents=new String(dojo.trim(_12cf));
this.contents.split=split;
this.split=function(){
return String.prototype.split.apply(this.contents,arguments);
};
};
dd.Token.prototype.split_contents=function(limit){
var bit,bits=[],i=0;
limit=limit||999;
while(i++<limit&&(bit=_12c5.exec(this.contents))){
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
var ddt=dd.text={_get:function(_12d5,name,_12d7){
var _12d8=dd.register.get(_12d5,name.toLowerCase(),_12d7);
if(!_12d8){
if(!_12d7){
throw new Error("No tag found for "+name);
}
return null;
}
var fn=_12d8[1];
var _12da=_12d8[2];
var parts;
if(fn.indexOf(":")!=-1){
parts=fn.split(":");
fn=parts.pop();
}
dojo["require"](_12da);
var _12dc=dojo.getObject(_12da);
return _12dc[fn||name]||_12dc[name+"_"];
},getTag:function(name,_12de){
return ddt._get("tag",name,_12de);
},getFilter:function(name,_12e0){
return ddt._get("filter",name,_12e0);
},getTemplate:function(file){
return new dd.Template(ddt.getTemplateString(file));
},getTemplateString:function(file){
return dojo._getText(file.toString())||"";
},_resolveLazy:function(_12e3,sync,json){
if(sync){
if(json){
return dojo.fromJson(dojo._getText(_12e3))||{};
}else{
return dd.text.getTemplateString(_12e3);
}
}else{
return dojo.xhrGet({handleAs:(json)?"json":"text",url:_12e3});
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
var parts=dojo.trim(tag).split(/\s+/g);
for(var i=0,part;part=parts[i];i++){
dojo["require"](part);
}
}else{
return [dd.TOKEN_BLOCK,tag];
}
}
}};
dd.Template=dojo.extend(function(_12f4,_12f5){
var str=_12f5?_12f4:ddt._resolveTemplateArg(_12f4,true)||"";
var _12f7=ddt.tokenize(str);
var _12f8=new dd._Parser(_12f7);
this.nodelist=_12f8.parse();
},{update:function(node,_12fa){
return ddt._resolveContextArg(_12fa).addCallback(this,function(_12fb){
var _12fc=this.render(new dd._Context(_12fb));
if(node.forEach){
node.forEach(function(item){
item.innerHTML=_12fc;
});
}else{
dojo.byId(node).innerHTML=_12fc;
}
return this;
});
},render:function(_12fe,_12ff){
_12ff=_12ff||this.getBuffer();
_12fe=_12fe||new dd._Context({});
return this.nodelist.render(_12fe,_12ff)+"";
},getBuffer:function(){
return new dojox.string.Builder();
}});
var qfRe=/\{\{\s*(.+?)\s*\}\}/g;
dd.quickFilter=function(str){
if(!str){
return new dd._NodeList();
}
if(str.indexOf("{%")==-1){
return new dd._QuickNodeList(dojox.string.tokenize(str,qfRe,function(token){
return new dd._Filter(token);
}));
}
};
dd._QuickNodeList=dojo.extend(function(_1303){
this.contents=_1303;
},{render:function(_1304,_1305){
for(var i=0,l=this.contents.length;i<l;i++){
if(this.contents[i].resolve){
_1305=_1305.concat(this.contents[i].resolve(_1304));
}else{
_1305=_1305.concat(this.contents[i]);
}
}
return _1305;
},dummyRender:function(_1308){
return this.render(_1308,dd.Template.prototype.getBuffer()).toString();
},clone:function(_1309){
return this;
}});
dd._Filter=dojo.extend(function(token){
if(!token){
throw new Error("Filter must be called with variable name");
}
this.contents=token;
var cache=this._cache[token];
if(cache){
this.key=cache[0];
this.filters=cache[1];
}else{
this.filters=[];
dojox.string.tokenize(token,this._re,this._tokenize,this);
this._cache[token]=[this.key,this.filters];
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
var value=arguments[pos];
if(this._args[pos]=="'"){
value=value.replace(/\\'/g,"'");
}else{
if(this._args[pos]=="\""){
value=value.replace(/\\"/g,"\"");
}
}
arg=[!this._args[pos],value];
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
},resolve:function(_1312){
var str=this.resolvePath(this.key,_1312);
for(var i=0,_1315;_1315=this.filters[i];i++){
if(_1315[1]){
if(_1315[1][0]){
str=_1315[0](str,this.resolvePath(_1315[1][1],_1312));
}else{
str=_1315[0](str,_1315[1][1]);
}
}else{
str=_1315[0](str);
}
}
return str;
},resolvePath:function(path,_1317){
var _1318,parts;
var first=path.charAt(0);
var last=path.slice(-1);
if(!isNaN(parseInt(first))){
_1318=(path.indexOf(".")==-1)?parseInt(path):parseFloat(path);
}else{
if(first=="\""&&first==last){
_1318=path.slice(1,-1);
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
parts=path.split(".");
_1318=_1317.get(parts[0]);
for(var i=1;i<parts.length;i++){
var part=parts[i];
if(_1318){
var base=_1318;
if(dojo.isObject(_1318)&&part=="items"&&typeof _1318[part]=="undefined"){
var items=[];
for(var key in _1318){
items.push([key,_1318[key]]);
}
_1318=items;
continue;
}
if(_1318.get&&dojo.isFunction(_1318.get)){
_1318=_1318.get(part);
}else{
if(typeof _1318[part]=="undefined"){
_1318=_1318[part];
break;
}else{
_1318=_1318[part];
}
}
if(dojo.isFunction(_1318)){
if(_1318.alters_data){
_1318="";
}else{
_1318=_1318.call(base);
}
}else{
if(_1318 instanceof Date){
_1318=dd._Context.prototype._normalize(_1318);
}
}
}else{
return "";
}
}
}
}
return _1318;
}});
dd._TextNode=dd._Node=dojo.extend(function(obj){
this.contents=obj;
},{set:function(data){
this.contents=data;
return this;
},render:function(_1323,_1324){
return _1324.concat(this.contents);
},isEmpty:function(){
return !dojo.trim(this.contents);
},clone:function(){
return this;
}});
dd._NodeList=dojo.extend(function(nodes){
this.contents=nodes||[];
this.last="";
},{push:function(node){
this.contents.push(node);
return this;
},concat:function(nodes){
this.contents=this.contents.concat(nodes);
return this;
},render:function(_1328,_1329){
for(var i=0;i<this.contents.length;i++){
_1329=this.contents[i].render(_1328,_1329);
if(!_1329){
throw new Error("Template must return buffer");
}
}
return _1329;
},dummyRender:function(_132b){
return this.render(_132b,dd.Template.prototype.getBuffer()).toString();
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
},{render:function(_132d,_132e){
var str=this.contents.resolve(_132d);
if(!str.safe){
str=dd._base.escape(""+str);
}
return _132e.concat(str);
}});
dd._noOpNode=new function(){
this.render=this.unrender=function(){
return arguments[1];
};
this.clone=function(){
return this;
};
};
dd._Parser=dojo.extend(function(_1330){
this.contents=_1330;
},{i:0,parse:function(_1331){
var _1332={};
_1331=_1331||[];
for(var i=0;i<_1331.length;i++){
_1332[_1331[i]]=true;
}
var _1334=new dd._NodeList();
while(this.i<this.contents.length){
token=this.contents[this.i++];
if(typeof token=="string"){
_1334.push(new dd._TextNode(token));
}else{
var type=token[0];
var text=token[1];
if(type==dd.TOKEN_VAR){
_1334.push(new dd._VarNode(text));
}else{
if(type==dd.TOKEN_BLOCK){
if(_1332[text]){
--this.i;
return _1334;
}
var cmd=text.split(/\s+/g);
if(cmd.length){
cmd=cmd[0];
var fn=ddt.getTag(cmd);
if(fn){
_1334.push(fn(this,new dd.Token(type,text)));
}
}
}
}
}
}
if(_1331.length){
throw new Error("Could not find closing tag(s): "+_1331.toString());
}
this.contents.length=0;
return _1334;
},next_token:function(){
var token=this.contents[this.i++];
return new dd.Token(token[0],token[1]);
},delete_first_token:function(){
this.i++;
},skip_past:function(_133a){
while(this.i<this.contents.length){
var token=this.contents[this.i++];
if(token[0]==dd.TOKEN_BLOCK&&token[1]==_133a){
return;
}
}
throw new Error("Unclosed tag found when looking for "+_133a);
},create_variable_node:function(expr){
return new dd._VarNode(expr);
},create_text_node:function(expr){
return new dd._TextNode(expr||"");
},getTemplate:function(file){
return new dd.Template(file);
}});
dd.register={_registry:{attributes:[],tags:[],filters:[]},get:function(_133f,name){
var _1341=dd.register._registry[_133f+"s"];
for(var i=0,entry;entry=_1341[i];i++){
if(typeof entry[0]=="string"){
if(entry[0]==name){
return entry;
}
}else{
if(name.match(entry[0])){
return entry;
}
}
}
},getAttributeTags:function(){
var tags=[];
var _1345=dd.register._registry.attributes;
for(var i=0,entry;entry=_1345[i];i++){
if(entry.length==3){
tags.push(entry);
}else{
var fn=dojo.getObject(entry[1]);
if(fn&&dojo.isFunction(fn)){
entry.push(fn);
tags.push(entry);
}
}
}
return tags;
},_any:function(type,base,_134b){
for(var path in _134b){
for(var i=0,fn;fn=_134b[path][i];i++){
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
dd.register._registry.attributes.push([attr,base+"."+path+"."+attr]);
}
key=key.toLowerCase();
}
dd.register._registry[type].push([key,fn,base+"."+path]);
}
}
},tags:function(base,_1352){
dd.register._any("tags",base,_1352);
},filters:function(base,_1354){
dd.register._any("filters",base,_1354);
}};
var _1355=/&/g;
var _1356=/</g;
var _1357=/>/g;
var _1358=/'/g;
var _1359=/"/g;
dd._base.escape=function(value){
return dd.mark_safe(value.replace(_1355,"&amp;").replace(_1356,"&lt;").replace(_1357,"&gt;").replace(_1359,"&quot;").replace(_1358,"&#39;"));
};
dd._base.safe=function(value){
if(typeof value=="string"){
value=new String(value);
}
if(typeof value=="object"){
value.safe=true;
}
return value;
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
dojo.mixin(dojox.dtl.filter.htmlstrings,{_linebreaksrn:/(\r\n|\n\r)/g,_linebreaksn:/\n{2,}/g,_linebreakss:/(^\s+|\s+$)/g,_linebreaksbr:/\n/g,_removetagsfind:/[a-z0-9]+/g,_striptags:/<[^>]*?>/g,linebreaks:function(value){
var _135d=[];
var dh=dojox.dtl.filter.htmlstrings;
value=value.replace(dh._linebreaksrn,"\n");
var parts=value.split(dh._linebreaksn);
for(var i=0;i<parts.length;i++){
var part=parts[i].replace(dh._linebreakss,"").replace(dh._linebreaksbr,"<br />");
_135d.push("<p>"+part+"</p>");
}
return _135d.join("\n\n");
},linebreaksbr:function(value){
var dh=dojox.dtl.filter.htmlstrings;
return value.replace(dh._linebreaksrn,"\n").replace(dh._linebreaksbr,"<br />");
},removetags:function(value,arg){
var dh=dojox.dtl.filter.htmlstrings;
var tags=[];
var group;
while(group=dh._removetagsfind.exec(arg)){
tags.push(group[0]);
}
tags="("+tags.join("|")+")";
return value.replace(new RegExp("</?s*"+tags+"s*[^>]*>","gi"),"");
},striptags:function(value){
return value.replace(dojox.dtl.filter.htmlstrings._striptags,"");
}});
}
if(!dojo._hasResource["dojox.string.sprintf"]){
dojo._hasResource["dojox.string.sprintf"]=true;
dojo.provide("dojox.string.sprintf");
dojox.string.sprintf=function(_136a,_136b){
for(var args=[],i=1;i<arguments.length;i++){
args.push(arguments[i]);
}
var _136e=new dojox.string.sprintf.Formatter(_136a);
return _136e.format.apply(_136e,args);
};
dojox.string.sprintf.Formatter=function(_136f){
var _1370=[];
this._mapped=false;
this._format=_136f;
this._tokens=dojox.string.tokenize(_136f,this._re,this._parseDelim,this);
};
dojo.extend(dojox.string.sprintf.Formatter,{_re:/\%(?:\(([\w_]+)\)|([1-9]\d*)\$)?([0 +\-\#]*)(\*|\d+)?(\.)?(\*|\d+)?[hlL]?([\%scdeEfFgGiouxX])/g,_parseDelim:function(_1371,_1372,flags,_1374,_1375,_1376,_1377){
if(_1371){
this._mapped=true;
}
return {mapping:_1371,intmapping:_1372,flags:flags,_minWidth:_1374,period:_1375,_precision:_1376,specifier:_1377};
},_specifiers:{b:{base:2,isInt:true},o:{base:8,isInt:true},x:{base:16,isInt:true},X:{extend:["x"],toUpper:true},d:{base:10,isInt:true},i:{extend:["d"]},u:{extend:["d"],isUnsigned:true},c:{setArg:function(token){
if(!isNaN(token.arg)){
var num=parseInt(token.arg);
if(num<0||num>127){
throw new Error("invalid character code passed to %c in sprintf");
}
token.arg=isNaN(num)?""+num:String.fromCharCode(num);
}
}},s:{setMaxWidth:function(token){
token.maxWidth=(token.period==".")?token.precision:-1;
}},e:{isDouble:true,doubleNotation:"e"},E:{extend:["e"],toUpper:true},f:{isDouble:true,doubleNotation:"f"},F:{extend:["f"]},g:{isDouble:true,doubleNotation:"g"},G:{extend:["g"],toUpper:true}},format:function(_137b){
if(this._mapped&&typeof _137b!="object"){
throw new Error("format requires a mapping");
}
var str="";
var _137d=0;
for(var i=0,token;i<this._tokens.length;i++){
token=this._tokens[i];
if(typeof token=="string"){
str+=token;
}else{
if(this._mapped){
if(typeof _137b[token.mapping]=="undefined"){
throw new Error("missing key "+token.mapping);
}
token.arg=_137b[token.mapping];
}else{
if(token.intmapping){
var _137d=parseInt(token.intmapping)-1;
}
if(_137d>=arguments.length){
throw new Error("got "+arguments.length+" printf arguments, insufficient for '"+this._format+"'");
}
token.arg=arguments[_137d++];
}
if(!token.compiled){
token.compiled=true;
token.sign="";
token.zeroPad=false;
token.rightJustify=false;
token.alternative=false;
var flags={};
for(var fi=token.flags.length;fi--;){
var flag=token.flags.charAt(fi);
flags[flag]=true;
switch(flag){
case " ":
token.sign=" ";
break;
case "+":
token.sign="+";
break;
case "0":
token.zeroPad=(flags["-"])?false:true;
break;
case "-":
token.rightJustify=true;
token.zeroPad=false;
break;
case "#":
token.alternative=true;
break;
default:
throw Error("bad formatting flag '"+token.flags.charAt(fi)+"'");
}
}
token.minWidth=(token._minWidth)?parseInt(token._minWidth):0;
token.maxWidth=-1;
token.toUpper=false;
token.isUnsigned=false;
token.isInt=false;
token.isDouble=false;
token.precision=1;
if(token.period=="."){
if(token._precision){
token.precision=parseInt(token._precision);
}else{
token.precision=0;
}
}
var _1383=this._specifiers[token.specifier];
if(typeof _1383=="undefined"){
throw new Error("unexpected specifier '"+token.specifier+"'");
}
if(_1383.extend){
dojo.mixin(_1383,this._specifiers[_1383.extend]);
delete _1383.extend;
}
dojo.mixin(token,_1383);
}
if(typeof token.setArg=="function"){
token.setArg(token);
}
if(typeof token.setMaxWidth=="function"){
token.setMaxWidth(token);
}
if(token._minWidth=="*"){
if(this._mapped){
throw new Error("* width not supported in mapped formats");
}
token.minWidth=parseInt(arguments[_137d++]);
if(isNaN(token.minWidth)){
throw new Error("the argument for * width at position "+_137d+" is not a number in "+this._format);
}
if(token.minWidth<0){
token.rightJustify=true;
token.minWidth=-token.minWidth;
}
}
if(token._precision=="*"&&token.period=="."){
if(this._mapped){
throw new Error("* precision not supported in mapped formats");
}
token.precision=parseInt(arguments[_137d++]);
if(isNaN(token.precision)){
throw Error("the argument for * precision at position "+_137d+" is not a number in "+this._format);
}
if(token.precision<0){
token.precision=1;
token.period="";
}
}
if(token.isInt){
if(token.period=="."){
token.zeroPad=false;
}
this.formatInt(token);
}else{
if(token.isDouble){
if(token.period!="."){
token.precision=6;
}
this.formatDouble(token);
}
}
this.fitField(token);
str+=""+token.arg;
}
}
return str;
},_zeros10:"0000000000",_spaces10:"          ",formatInt:function(token){
var i=parseInt(token.arg);
if(!isFinite(i)){
if(typeof token.arg!="number"){
throw new Error("format argument '"+token.arg+"' not an integer; parseInt returned "+i);
}
i=0;
}
if(i<0&&(token.isUnsigned||token.base!=10)){
i=4294967295+i+1;
}
if(i<0){
token.arg=(-i).toString(token.base);
this.zeroPad(token);
token.arg="-"+token.arg;
}else{
token.arg=i.toString(token.base);
if(!i&&!token.precision){
token.arg="";
}else{
this.zeroPad(token);
}
if(token.sign){
token.arg=token.sign+token.arg;
}
}
if(token.base==16){
if(token.alternative){
token.arg="0x"+token.arg;
}
token.arg=token.toUpper?token.arg.toUpperCase():token.arg.toLowerCase();
}
if(token.base==8){
if(token.alternative&&token.arg.charAt(0)!="0"){
token.arg="0"+token.arg;
}
}
},formatDouble:function(token){
var f=parseFloat(token.arg);
if(!isFinite(f)){
if(typeof token.arg!="number"){
throw new Error("format argument '"+token.arg+"' not a float; parseFloat returned "+f);
}
f=0;
}
switch(token.doubleNotation){
case "e":
token.arg=f.toExponential(token.precision);
break;
case "f":
token.arg=f.toFixed(token.precision);
break;
case "g":
if(Math.abs(f)<0.0001){
token.arg=f.toExponential(token.precision>0?token.precision-1:token.precision);
}else{
token.arg=f.toPrecision(token.precision);
}
if(!token.alternative){
token.arg=token.arg.replace(/(\..*[^0])0*/,"$1");
token.arg=token.arg.replace(/\.0*e/,"e").replace(/\.0$/,"");
}
break;
default:
throw new Error("unexpected double notation '"+token.doubleNotation+"'");
}
token.arg=token.arg.replace(/e\+(\d)$/,"e+0$1").replace(/e\-(\d)$/,"e-0$1");
if(dojo.isOpera){
token.arg=token.arg.replace(/^\./,"0.");
}
if(token.alternative){
token.arg=token.arg.replace(/^(\d+)$/,"$1.");
token.arg=token.arg.replace(/^(\d+)e/,"$1.e");
}
if(f>=0&&token.sign){
token.arg=token.sign+token.arg;
}
token.arg=token.toUpper?token.arg.toUpperCase():token.arg.toLowerCase();
},zeroPad:function(token,_1389){
_1389=(arguments.length==2)?_1389:token.precision;
if(typeof token.arg!="string"){
token.arg=""+token.arg;
}
var _138a=_1389-10;
while(token.arg.length<_138a){
token.arg=(token.rightJustify)?token.arg+this._zeros10:this._zeros10+token.arg;
}
var pad=_1389-token.arg.length;
token.arg=(token.rightJustify)?token.arg+this._zeros10.substring(0,pad):this._zeros10.substring(0,pad)+token.arg;
},fitField:function(token){
if(token.maxWidth>=0&&token.arg.length>token.maxWidth){
return token.arg.substring(0,token.maxWidth);
}
if(token.zeroPad){
this.zeroPad(token,token.minWidth);
return;
}
this.spacePad(token);
},spacePad:function(token,_138e){
_138e=(arguments.length==2)?_138e:token.minWidth;
if(typeof token.arg!="string"){
token.arg=""+token.arg;
}
var _138f=_138e-10;
while(token.arg.length<_138f){
token.arg=(token.rightJustify)?token.arg+this._spaces10:this._spaces10+token.arg;
}
var pad=_138e-token.arg.length;
token.arg=(token.rightJustify)?token.arg+this._spaces10.substring(0,pad):this._spaces10.substring(0,pad)+token.arg;
}});
}
if(!dojo._hasResource["dojox.dtl.filter.strings"]){
dojo._hasResource["dojox.dtl.filter.strings"]=true;
dojo.provide("dojox.dtl.filter.strings");
dojo.mixin(dojox.dtl.filter.strings,{_urlquote:function(url,safe){
if(!safe){
safe="/";
}
return dojox.string.tokenize(url,/([^\w-_.])/g,function(token){
if(safe.indexOf(token)==-1){
if(token==" "){
return "+";
}else{
return "%"+token.charCodeAt(0).toString(16).toUpperCase();
}
}
return token;
}).join("");
},addslashes:function(value){
return value.replace(/\\/g,"\\\\").replace(/"/g,"\\\"").replace(/'/g,"\\'");
},capfirst:function(value){
value=""+value;
return value.charAt(0).toUpperCase()+value.substring(1);
},center:function(value,arg){
arg=arg||value.length;
value=value+"";
var diff=arg-value.length;
if(diff%2){
value=value+" ";
diff-=1;
}
for(var i=0;i<diff;i+=2){
value=" "+value+" ";
}
return value;
},cut:function(value,arg){
arg=arg+""||"";
value=value+"";
return value.replace(new RegExp(arg,"g"),"");
},_fix_ampersands:/&(?!(\w+|#\d+);)/g,fix_ampersands:function(value){
return value.replace(dojox.dtl.filter.strings._fix_ampersands,"&amp;");
},floatformat:function(value,arg){
arg=parseInt(arg||-1);
value=parseFloat(value);
var m=value-value.toFixed(0);
if(!m&&arg<0){
return value.toFixed();
}
value=value.toFixed(Math.abs(arg));
return (arg<0)?parseFloat(value)+"":value;
},iriencode:function(value){
return dojox.dtl.filter.strings._urlquote(value,"/#%[]=:;$&()+,!");
},linenumbers:function(value){
var df=dojox.dtl.filter;
var lines=value.split("\n");
var _13a4=[];
var width=(lines.length+"").length;
for(var i=0,line;i<lines.length;i++){
line=lines[i];
_13a4.push(df.strings.ljust(i+1,width)+". "+dojox.dtl._base.escape(line));
}
return _13a4.join("\n");
},ljust:function(value,arg){
value=value+"";
arg=parseInt(arg);
while(value.length<arg){
value=value+" ";
}
return value;
},lower:function(value){
return (value+"").toLowerCase();
},make_list:function(value){
var _13ac=[];
if(typeof value=="number"){
value=value+"";
}
if(value.charAt){
for(var i=0;i<value.length;i++){
_13ac.push(value.charAt(i));
}
return _13ac;
}
if(typeof value=="object"){
for(var key in value){
_13ac.push(value[key]);
}
return _13ac;
}
return [];
},rjust:function(value,arg){
value=value+"";
arg=parseInt(arg);
while(value.length<arg){
value=" "+value;
}
return value;
},slugify:function(value){
value=value.replace(/[^\w\s-]/g,"").toLowerCase();
return value.replace(/[\-\s]+/g,"-");
},_strings:{},stringformat:function(value,arg){
arg=""+arg;
var _13b4=dojox.dtl.filter.strings._strings;
if(!_13b4[arg]){
_13b4[arg]=new dojox.string.sprintf.Formatter("%"+arg);
}
return _13b4[arg].format(value);
},title:function(value){
var last,title="";
for(var i=0,_13b9;i<value.length;i++){
_13b9=value.charAt(i);
if(last==" "||last=="\n"||last=="\t"||!last){
title+=_13b9.toUpperCase();
}else{
title+=_13b9.toLowerCase();
}
last=_13b9;
}
return title;
},_truncatewords:/[ \n\r\t]/,truncatewords:function(value,arg){
arg=parseInt(arg);
if(!arg){
return value;
}
for(var i=0,j=value.length,count=0,_13bf,last;i<value.length;i++){
_13bf=value.charAt(i);
if(dojox.dtl.filter.strings._truncatewords.test(last)){
if(!dojox.dtl.filter.strings._truncatewords.test(_13bf)){
++count;
if(count==arg){
return value.substring(0,j+1);
}
}
}else{
if(!dojox.dtl.filter.strings._truncatewords.test(_13bf)){
j=i;
}
}
last=_13bf;
}
return value;
},_truncate_words:/(&.*?;|<.*?>|(\w[\w\-]*))/g,_truncate_tag:/<(\/)?([^ ]+?)(?: (\/)| .*?)?>/,_truncate_singlets:{br:true,col:true,link:true,base:true,img:true,param:true,area:true,hr:true,input:true},truncatewords_html:function(value,arg){
arg=parseInt(arg);
if(arg<=0){
return "";
}
var _13c3=dojox.dtl.filter.strings;
var words=0;
var open=[];
var _13c6=dojox.string.tokenize(value,_13c3._truncate_words,function(all,word){
if(word){
++words;
if(words<arg){
return word;
}else{
if(words==arg){
return word+" ...";
}
}
}
var tag=all.match(_13c3._truncate_tag);
if(!tag||words>=arg){
return;
}
var _13ca=tag[1];
var _13cb=tag[2].toLowerCase();
var _13cc=tag[3];
if(_13ca||_13c3._truncate_singlets[_13cb]){
}else{
if(_13ca){
var i=dojo.indexOf(open,_13cb);
if(i!=-1){
open=open.slice(i+1);
}
}else{
open.unshift(_13cb);
}
}
return all;
}).join("");
_13c6=_13c6.replace(/\s+$/g,"");
for(var i=0,tag;tag=open[i];i++){
_13c6+="</"+tag+">";
}
return _13c6;
},upper:function(value){
return value.toUpperCase();
},urlencode:function(value){
return dojox.dtl.filter.strings._urlquote(value);
},_urlize:/^((?:[(>]|&lt;)*)(.*?)((?:[.,)>\n]|&gt;)*)$/,_urlize2:/^\S+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+$/,urlize:function(value){
return dojox.dtl.filter.strings.urlizetrunc(value);
},urlizetrunc:function(value,arg){
arg=parseInt(arg);
return dojox.string.tokenize(value,/(\S+)/g,function(word){
var _13d6=dojox.dtl.filter.strings._urlize.exec(word);
if(!_13d6){
return word;
}
var lead=_13d6[1];
var _13d8=_13d6[2];
var trail=_13d6[3];
var _13da=_13d8.indexOf("www.")==0;
var hasAt=_13d8.indexOf("@")!=-1;
var _13dc=_13d8.indexOf(":")!=-1;
var _13dd=_13d8.indexOf("http://")==0;
var _13de=_13d8.indexOf("https://")==0;
var _13df=/[a-zA-Z0-9]/.test(_13d8.charAt(0));
var last4=_13d8.substring(_13d8.length-4);
var _13e1=_13d8;
if(arg>3){
_13e1=_13e1.substring(0,arg-3)+"...";
}
if(_13da||(!hasAt&&!_13dd&&_13d8.length&&_13df&&(last4==".org"||last4==".net"||last4==".com"))){
return "<a href=\"http://"+_13d8+"\" rel=\"nofollow\">"+_13e1+"</a>";
}else{
if(_13dd||_13de){
return "<a href=\""+_13d8+"\" rel=\"nofollow\">"+_13e1+"</a>";
}else{
if(hasAt&&!_13da&&!_13dc&&dojox.dtl.filter.strings._urlize2.test(_13d8)){
return "<a href=\"mailto:"+_13d8+"\">"+_13d8+"</a>";
}
}
}
return word;
}).join("");
},wordcount:function(value){
value=dojo.trim(value);
if(!value){
return 0;
}
return value.split(/\s+/g).length;
},wordwrap:function(value,arg){
arg=parseInt(arg);
var _13e5=[];
var parts=value.split(/\s+/g);
if(parts.length){
var word=parts.shift();
_13e5.push(word);
var pos=word.length-word.lastIndexOf("\n")-1;
for(var i=0;i<parts.length;i++){
word=parts[i];
if(word.indexOf("\n")!=-1){
var lines=word.split(/\n/g);
}else{
var lines=[word];
}
pos+=lines[0].length+1;
if(arg&&pos>arg){
_13e5.push("\n");
pos=lines[lines.length-1].length;
}else{
_13e5.push(" ");
if(lines.length>1){
pos=lines[lines.length-1].length;
}
}
_13e5.push(word);
}
}
return _13e5.join("");
}});
}
if(!dojo._hasResource["pion.login"]){
dojo._hasResource["pion.login"]=true;
dojo.provide("pion.login");
pion.login.logout=function(){
dojo.cookie("logged_in","",{expires:-1});
dojo.xhrGet({url:"/logout",preventCache:true,handleAs:"xml",timeout:5000,load:function(_13eb,_13ec){
console.debug("logout response: ",_13eb);
return _13eb;
},error:function(_13ed,_13ee){
console.error("logout error: HTTP status code = ",_13ee.xhr.status);
return _13ed;
}});
};
pion.login.expire=function(){
dojo.xhrGet({url:"/logout",preventCache:true,handleAs:"xml",timeout:5000,load:function(_13ef,_13f0){
console.debug("logout response: ",_13ef);
return _13ef;
},error:function(_13f1,_13f2){
console.error("logout error: HTTP status code = ",_13f2.xhr.status);
return _13f1;
}});
};
dojo.declare("pion.login.LoginDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog database_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Session Expired</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t>Your session has timed out.  Please login again.<table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Username:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" type=\"text\" name=\"Username\" tabindex=\"3\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Password:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" type=\"password\" name=\"Password\" tabindex=\"1\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t</div>\r\n\t<div>\r\n\t\t<button dojoType=dijit.form.Button type=\"submit\" tabindex=\"2\">Submit</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true});
pion.login.ops_temporarily_suppressed=false;
pion.login.login_pending=false;
pion.login.onLoginSuccess=function(){
dojo.cookie("logged_in","true",{expires:1});
};
pion.login.latestUsername="";
pion.login.doLoginDialog=function(_13f3){
pion.login.login_pending=true;
var _13f4=dijit.byId("ops_toggle_button");
if(!_13f4.checked){
_13f4.setAttribute("checked",true);
pion.login.ops_temporarily_suppressed=true;
}
var _13f5=new pion.login.LoginDialog({});
_13f5.setValues({Username:pion.login.latestUsername});
dojo.connect(_13f5.domNode,"onkeypress",function(event){
if(event.keyCode==dojo.keys.ENTER){
_13f5.execute(_13f5.getValues());
_13f5.destroyRecursive();
}
});
_13f5.show();
_13f5.execute=function(_13f7){
console.debug("dialogFields = ",_13f7);
pion.login.latestUsername=_13f7.Username;
dojo.xhrGet({url:"/login?user="+_13f7.Username+"&pass="+_13f7.Password,preventCache:true,handleAs:"xml",load:function(_13f8,_13f9){
pion.login.login_pending=false;
pion.login.onLoginSuccess();
console.debug("login response: ioArgs.xhr = ",_13f9.xhr);
if(pion.login.ops_temporarily_suppressed){
_13f4.setAttribute("checked",false);
pion.login.ops_temporarily_suppressed=false;
}
if(_13f3){
_13f3();
}
return _13f8;
},error:function(_13fa,_13fb){
pion.login.login_pending=false;
if(_13fb.xhr.status==401){
pion.login.doLoginDialog(_13f3);
return;
}
console.error("login error: HTTP status code = ",_13fb.xhr.status);
console.error("ioArgs = ",_13fb);
return _13fa;
}});
};
};
}
if(!dojo._hasResource["plugins.reactors.Reactor"]){
dojo._hasResource["plugins.reactors.Reactor"]=true;
dojo.provide("plugins.reactors.Reactor");
dojo.declare("plugins.reactors.Reactor",[dijit._Widget],{postCreate:function(){
this.inherited("postCreate",arguments);
this.special_config_elements=["@id","options"];
this.reactor_inputs=[];
this.reactor_outputs=[];
this.prev_events_in=0;
var _13fc=new dojo.dnd.Target(this.domNode,{accept:["connector"]});
dojo.connect(_13fc,"onDndDrop",pion.reactors.handleDropOnReactor);
this.name_div=document.createElement("div");
this.name_div.innerHTML=this.config.Name;
dojo.addClass(this.name_div,"name");
this.domNode.appendChild(this.name_div);
var _this=this;
this.run_button=new dijit.form.ToggleButton();
var _13fe=this.run_button.domNode;
dojo.connect(_13fe,"click",function(){
dojo.xhrPut({url:"/config/reactors/"+_this.config["@id"]+(_this.run_button.checked?"/start":"/stop"),error:pion.getXhrErrorHandler(dojo.xhrPut)});
});
this.domNode.appendChild(_13fe);
this.ops_per_sec=document.createElement("span");
dojo.addClass(this.ops_per_sec,"ops_per_sec");
this.ops_per_sec.innerHTML="0";
this.domNode.appendChild(this.ops_per_sec);
this.domNode.setAttribute("reactor_type",this.config.Plugin);
var _13ff=pion.reactors.categories[this.config.Plugin];
dojo.addClass(this.domNode,_13ff);
if(_13ff!="collection"){
this.run_button.attr("checked",true);
}
dojo.addClass(this.domNode,"moveable");
dojo.addClass(this.domNode,"reactor");
dojo.addClass(this.domNode,this.config.Plugin);
var m5=new dojo.dnd.move.parentConstrainedMoveable(this.domNode,{area:"padding",within:true});
var c=m5.constraints();
c.r=c.l+c.w-this.offsetWidth;
c.b=c.t+c.h-this.offsetHeight;
var _1402={l:this.config.X,t:this.config.Y};
console.debug("mouseLeftTop: ",_1402);
var _1403=pion.reactors.getNearbyGridPointInBox(c,_1402);
this.domNode.style.top=_1403.t+"px";
this.domNode.style.left=_1403.l+"px";
this.domNode.style.position="absolute";
this.domNode.style.background="url(../plugins/reactors/"+_13ff+"/"+this.config.Plugin+"/bg-moveable.png) repeat-x";
if(!firefox_on_mac){
var menu=new dijit.Menu({targetNodeIds:[this.domNode]});
menu.addChild(new dijit.MenuItem({label:"Edit reactor configuration",onClick:function(){
pion.reactors.showReactorConfigDialog(_this);
}}));
menu.addChild(new dijit.MenuItem({label:"Show XML",onClick:function(){
pion.reactors.showXMLDialog(_this);
}}));
menu.addChild(new dijit.MenuItem({label:"Delete reactor",onClick:function(){
pion.reactors.deleteReactorIfConfirmed(_this);
}}));
}
dojo.connect(this.domNode,"dblclick",function(event){
event.stopPropagation();
if(event.shiftKey){
_this.showQueryResult();
}else{
pion.reactors.showReactorConfigDialog(_this);
}
});
m5.onMove=function(mover,_1407){
var _1408=pion.reactors.getNearbyGridPointInBox(this.constraintBox,_1407);
dojo.marginBox(mover.node,_1408);
for(var i=0;i<_this.reactor_inputs.length;++i){
pion.reactors.updateConnectionLine(_this.reactor_inputs[i].line,_this.reactor_inputs[i].source.domNode,_this.domNode);
}
for(var i=0;i<_this.reactor_outputs.length;++i){
pion.reactors.updateConnectionLine(_this.reactor_outputs[i].line,_this.domNode,_this.reactor_outputs[i].sink.domNode);
}
};
dojo.connect(m5,"onMoveStop",this,this.handleMoveStop);
},_initOptions:function(_140a,_140b){
var store=pion.reactors.config_store;
var _this=this;
store.fetch({query:{"@id":_140a["@id"]},onItem:function(item){
_140a.options=[];
for(var _140f in _140b){
_140a[_140f]=_140b[_140f];
if(store.hasAttribute(item,_140f)){
_140a[_140f]=(store.getValue(item,_140f).toString()=="true");
}
if(_140a[_140f]){
_140a.options.push(_140f);
}
}
},onError:pion.handleFetchError});
},showQueryResult:function(){
window.open("/query/reactors/"+this.config["@id"]);
},handleMoveStop:function(mover){
if(this.config.X==mover.host.node.offsetLeft&&this.config.Y==mover.host.node.offsetTop){
return;
}
this.config.X=mover.host.node.offsetLeft;
this.config.Y=mover.host.node.offsetTop;
this.put_data="<PionConfig><Reactor>";
for(var tag in this.config){
if(dojo.indexOf(this.special_config_elements,tag)==-1){
console.debug("dialogFields[",tag,"] = ",this.config[tag]);
this.put_data+="<"+tag+">"+this.config[tag]+"</"+tag+">";
}
}
if(this._insertCustomData){
this._insertCustomData();
}
this.put_data+="</Reactor></PionConfig>";
console.debug("put_data: ",this.put_data);
dojo.rawXhrPut({url:"/config/reactors/"+this.config["@id"]+"/move",contentType:"text/xml",handleAs:"xml",putData:this.put_data,load:function(_1412){
console.debug("response: ",_1412);
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:this.put_data})});
}});
dojo.declare("plugins.reactors.ReactorIcon",[],{});
dojo.declare("plugins.reactors.ReactorInitDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">${title}</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<table>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Name:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Comments:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td>\r\n\t\t\t</tr>\r\n\t\t</table>\r\n\t</div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick: tryConfig\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t</div>\r\n\t<span dojoAttachPoint=\"tabEnd\" tabindex=\"0\"></span>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,tryConfig:function(){
var _1413=this.getValues();
console.debug(_1413);
console.debug("this.plugin = ",this.plugin);
var _1414=pion.reactors.workspace_box;
var dc=dojo.coords(_1414.node);
var X=Math.floor(pion.reactors.last_x-dc.x);
var Y=Math.floor(pion.reactors.last_y-dc.y);
this.post_data="<PionConfig><Reactor><Plugin>"+this.plugin+"</Plugin><Workspace>"+_1414.my_content_pane.title+"</Workspace><X>"+X+"</X><Y>"+Y+"</Y>";
for(var tag in _1413){
if(tag!="options"){
console.debug("dialogFields[",tag,"] = ",_1413[tag]);
this.post_data+="<"+tag+">"+_1413[tag]+"</"+tag+">";
}
}
if(_1413.options&&plugins.reactors[this.plugin].option_defaults){
for(var _1419 in plugins.reactors[this.plugin].option_defaults){
this.post_data+="<"+_1419+">";
this.post_data+=(dojo.indexOf(_1413.options,_1419)!=-1);
this.post_data+="</"+_1419+">";
}
}
if(this._insertCustomData){
this._insertCustomData(_1413);
}
this.post_data+="</Reactor></PionConfig>";
console.debug("post_data: ",this.post_data);
var _this=this;
dojo.rawXhrPost({url:"/config/reactors",contentType:"text/xml",handleAs:"xml",postData:this.post_data,load:function(_141b){
var node=_141b.getElementsByTagName("Reactor")[0];
var _141d={"@id":node.getAttribute("id")};
var _141e=node.childNodes;
for(var i=0;i<_141e.length;++i){
if(_141e[i].firstChild){
_141d[_141e[i].tagName]=_141e[i].firstChild.nodeValue;
}
}
var _1420=document.createElement("div");
_1414.node.replaceChild(_1420,_1414.node.lastChild);
var _1421=pion.reactors.createReactor(_141d,_1420);
pion.reactors.reactors_by_id[_141d["@id"]]=_1421;
_1421.workspace=_1414;
_1414.reactors.push(_1421);
_this.hide();
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:this.post_data})});
}});
dojo.declare("plugins.reactors.ReactorDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">${title}</span>\r\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\">\r\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" class=\"id_text_box\" disabled=\"true\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t</div>\r\n\t<h3>Input Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_inputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_inputs_grid_model\"\r\n\t\t structure=\"reactor_inputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<h3>Output Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_outputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_outputs_grid_model\"\r\n\t\t structure=\"reactor_outputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"delete\">Delete Reactor</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
var _this=this;
setTimeout(function(){
_this._position();
},200);
},reactor:"",_position:function(){
if(dojo.hasClass(dojo.body(),"dojoMove")){
return;
}
var _1423=dijit.getViewport();
var mb=dojo.marginBox(this.domNode);
var style=this.domNode.style;
style.left=Math.floor((_1423.l+(_1423.w-mb.w)/2))+"px";
var top=Math.floor((_1423.t+(_1423.h-mb.h)/2));
var _1427=Math.floor(_1423.h/30);
if(top-_1427<_1423.t){
top=_1423.t+_1427;
}
if(mb.h+_1427*2>=_1423.h){
style.overflow="auto";
style.bottom=(_1427-_1423.t)+"px";
}
style.top=top+"px";
_1423=dijit.getViewport();
mb=dojo.marginBox(this.domNode);
},execute:function(_1428){
dojo.mixin(this.reactor.config,_1428);
this.reactor.name_div.innerHTML=_1428.Name;
this.put_data="<PionConfig><Reactor><Plugin>"+this.reactor.config.Plugin+"</Plugin><Workspace>"+this.reactor.config.Workspace+"</Workspace><X>"+this.reactor.config.X+"</X><Y>"+this.reactor.config.Y+"</Y>";
for(var tag in _1428){
if(dojo.indexOf(this.reactor.special_config_elements,tag)==-1){
console.debug("dialogFields[",tag,"] = ",_1428[tag]);
this.put_data+="<"+tag+">"+_1428[tag]+"</"+tag+">";
}
}
if(_1428.options&&plugins.reactors[this.reactor.config.Plugin].option_defaults){
for(var _142a in plugins.reactors[this.reactor.config.Plugin].option_defaults){
this.put_data+="<"+_142a+">";
this.put_data+=(dojo.indexOf(_1428.options,_142a)!=-1);
this.put_data+="</"+_142a+">";
}
}
if(this._insertCustomData){
this._insertCustomData(_1428);
}
this.put_data+="</Reactor></PionConfig>";
console.debug("put_data: ",this.put_data);
var _this=this;
dojo.rawXhrPut({url:"/config/reactors/"+this.reactor.config["@id"],contentType:"text/xml",handleAs:"xml",putData:this.put_data,load:function(_142c){
console.debug("response: ",_142c);
if(_this.reactor._updateCustomData){
_this.reactor._updateCustomData();
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:this.put_data})});
}});
}
if(!dojo._hasResource["plugins.reactors.LogInputReactor"]){
dojo._hasResource["plugins.reactors.LogInputReactor"]=true;
dojo.provide("plugins.reactors.LogInputReactor");
dojo.declare("plugins.reactors.LogInputReactor",[plugins.reactors.Reactor],{postCreate:function(){
this.config.Plugin="LogInputReactor";
this.inherited("postCreate",arguments);
this._updateCustomData();
},_updateCustomData:function(){
this._initOptions(this.config,plugins.reactors.LogInputReactor.option_defaults);
}});
plugins.reactors.LogInputReactor.label="Log File Input Reactor";
dojo.declare("plugins.reactors.LogInputReactorInitDialog",[plugins.reactors.ReactorInitDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\" tabindex=\"-1\" waiRole=\"dialog\" waiState=\"labelledby-${id}_title\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Log File Input Reactor Initialization</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<table>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Name:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Comments:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Codec:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.FilteringSelect\" name=\"Codec\" store=\"pion.codecs.config_store\" searchAttr=\"Name\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Directory:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Directory\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Filename Regex:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Filename\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Frequency (in seconds):</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.ValidationTextBox\" type=\"text\" name=\"Frequency\" regExp=\"[1-9][0-9]*\"></td>\r\n\t\t\t</tr>\r\n\t\t</table>\r\n\t\t<table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Just One</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"JustOne\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Tail</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"TailF\"/></td\r\n\t\t\t></tr\r\n\t\t></table>\r\n\t</div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick: tryConfig\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.plugin="LogInputReactor";
console.debug("plugins.reactors.LogInputReactorInitDialog.postCreate");
this.inherited("postCreate",arguments);
}});
dojo.declare("plugins.reactors.LogInputReactorDialog",[plugins.reactors.ReactorDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\" tabindex=\"-1\" waiRole=\"dialog\" waiState=\"labelledby-${id}_title\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\">\r\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Log Input Reactor Configuration</span>\r\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\">\r\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" class=\"id_text_box\" disabled=\"true\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Codec:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.FilteringSelect\" name=\"Codec\" store=\"pion.codecs.config_store\" searchAttr=\"Name\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Directory:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Directory\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Filename Regex:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Filename\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Frequency (in seconds):</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.ValidationTextBox\" type=\"text\" name=\"Frequency\" regExp=\"[1-9][0-9]*\"></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Just One</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"JustOne\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Tail</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"TailF\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t</div>\r\n\t<h3>Input Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_inputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_inputs_grid_model\"\r\n\t\t structure=\"reactor_inputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<h3>Output Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_outputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_outputs_grid_model\"\r\n\t\t structure=\"reactor_outputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"delete\">Delete Reactor</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
}});
plugins.reactors.LogInputReactor.option_defaults={JustOne:false,TailF:false};
}
if(!dojo._hasResource["pion.terms"]){
dojo._hasResource["pion.terms"]=true;
dojo.provide("pion.terms");
pion.terms.store=new dojox.data.XmlStore({url:"/config/terms",rootItem:"Term",attributeMap:{"Term.id":"@id"}});
pion.terms.store.fetchItemByIdentity=function(_142d){
pion.terms.store.fetch({query:{"@id":_142d.identity},onItem:_142d.onItem,onError:pion.handleFetchError});
};
pion.terms.store.getIdentity=function(item){
return pion.terms.store.getValue(item,"@id");
};
pion.terms.type_store=new dojo.data.ItemFileReadStore({url:"/resources/termTypes.json"});
pion.terms.init=function(){
pion.terms.initTermTypeLookups();
};
pion.terms.initTermTypeLookups=function(){
pion.terms.types_by_description={};
pion.terms.type_descriptions_by_name={};
pion.terms.categories_by_type={};
var store=pion.terms.type_store;
store.fetch({onItem:function(item,_1431){
pion.terms.types_by_description[store.getValue(item,"description")]=store.getValue(item,"name");
pion.terms.type_descriptions_by_name[store.getValue(item,"name")]=store.getValue(item,"description");
pion.terms.categories_by_type[store.getValue(item,"name")]=store.getValue(item,"category");
},onComplete:pion.terms.buildMapOfCategoriesByTerm,onError:pion.handleFetchError});
};
pion.terms.buildMapOfCategoriesByTerm=function(){
pion.terms.categories_by_id={};
pion.terms.store.fetch({onItem:function(item){
var type=pion.terms.store.getValue(item,"Type").toString();
var id=pion.terms.store.getIdentity(item);
pion.terms.categories_by_id[id]=pion.terms.categories_by_type[type];
},onError:pion.handleFetchError});
};
}
if(!dojo._hasResource["plugins.codecs.Codec"]){
dojo._hasResource["plugins.codecs.Codec"]=true;
dojo.provide("plugins.codecs.Codec");
dojo.declare("plugins.codecs.CodecInitDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog codec_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Codec Initialization</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Plugin&nbsp;Type</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.FilteringSelect\" name=\"Plugin\" \r\n\t\t\t\t\t\tstore=\"pion.codecs.plugin_data_store\" searchAttr=\"label\" \r\n\t\t\t\t\t\tautocomplete=\"true\" value=\"1\" style=\"width: 100%;\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Event&nbsp;Type</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.FilteringSelect\" name=\"EventType\" query=\"{Type:'object'}\" \r\n\t\t\t\t\t\tstore=\"pion.terms.store\" searchAttr=\"id\" autocomplete=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t></div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: hide\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true});
dojo.declare("plugins.codecs.CodecPane",[dijit.layout.AccordionPane],{templateString:"<div class='dijitAccordionPane codec_pane'\r\n\t><div dojoAttachPoint='titleNode,focusNode' dojoAttachEvent='ondijitclick:_onTitleClick,onkeypress:_onTitleKeyPress,onfocus:_handleFocus,onblur:_handleFocus'\r\n\t\tclass='dijitAccordionTitle' wairole=\"tab\"\r\n\t\t><div class='dijitAccordionArrow'></div\r\n\t\t><div class='arrowTextUp' waiRole=\"presentation\">&#9650;</div\r\n\t\t><div class='arrowTextDown' waiRole=\"presentation\">&#9660;</div\r\n\t\t><div dojoAttachPoint='titleTextNode' class='dijitAccordionText'>${title}</div></div\r\n\t><div\r\n\t\t><div dojoAttachPoint='containerNode' style='overflow: hidden; height: 1px; display: none'\r\n\t\t\tclass='dijitAccordionBody' wairole=\"tabpanel\"\r\n\t\t\t><form dojoAttachPoint=\"form\" dojoType=\"dijit.form.Form\"\r\n\t\t\t\t><br/\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"100%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Name</label></td\r\n\t\t\t\t\t\t><td><input dojoAttachPoint=\"name\" dojoType=\"dijit.form.TextBox\" name=\"Name\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td rowspan=\"4\" valign=\"top\" width=\"20\">&nbsp;</td\r\n\t\t\t\t\t\t><td rowspan=\"1\"><label>Comments</label></td\r\n\t\t\t\t\t\t><td rowspan=\"4\" valign=\"top\"><textarea rows=\"4\" style=\"width: 95%\" name=\"Comment\" class=\"comment\"></textarea></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>ID</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td rowspan=\"3\">&nbsp;</td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Plugin&nbsp;Type</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Plugin\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Event&nbsp;Type</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.FilteringSelect\" name=\"EventType\" dojoAttachEvent='onChange:markAsChanged'\r\n\t\t\t\t\t\t\t\tstore=\"pion.terms.store\" searchAttr=\"id\" query=\"{Type:'object'}\" autocomplete=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><br/\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" style=\"border: 1px solid #999999;\" width=\"99%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td class=\"matrixMainHeader\">Map Field Names to Terms</td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td style=\"background-color: #f1f1f1;\"\r\n\t\t\t\t\t\t\t><div class=\"codec_grid\"\r\n\t\t\t\t\t\t\t\t><div dojoAttachPoint=\"codec_grid\" dojoType=\"dojox.Grid\" model=\"plugins.codecs.CodecPane.grid_model\"\r\n\t\t\t\t\t\t\t\t\t singleClickEdit=\"true\"></div\r\n\t\t\t\t\t\t\t></div\r\n\t\t\t\t\t\t\t><button dojoType=dijit.form.Button class=\"add_new_row\" dojoAttachEvent=\"onClick:_handleAddNewField\">ADD NEW ROW</button\r\n\t\t\t\t\t\t></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><hr noshade=\"noshade\" size=\"1\" color=\"#999999\"\r\n\t\t\t\t><div class=\"save_cancel_delete\"\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick:save\">Save Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick:cancel\">Cancel Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"delete\" dojoAttachEvent=\"onClick:delete2\">Delete Codec</button\r\n\t\t\t\t></div\r\n\t\t\t></form\r\n\t\t></div\r\n\t></div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
this.special_config_elements=["Field","tagName","childNodes"];
this.attributes_by_column=["text()","@term"];
this.delete_col_index=2;
var _this=this;
dojo.connect(this.codec_grid,"onCellClick",this,_this._handleCellClick);
dojo.connect(this.codec_grid,"onApplyCellEdit",this,_this._handleCellEdit);
dojo.query("input",this.domNode).forEach(function(n){
dojo.connect(n,"change",_this,_this.markAsChanged);
});
dojo.query("textarea",this.domNode).forEach(function(n){
dojo.connect(n,"change",_this,_this.markAsChanged);
});
},getHeight:function(){
return 475;
},populateFromConfigItem:function(item){
var store=pion.codecs.config_store;
var _143a={};
var _143b=store.getAttributes(item);
for(var i=0;i<_143b.length;++i){
if(dojo.indexOf(this.special_config_elements,_143b[i])==-1){
_143a[_143b[i]]=store.getValue(item,_143b[i]).toString();
}
}
if(this._addCustomConfigValues){
this._addCustomConfigValues(_143a,item);
}
console.dir(_143a);
this.form.setValues(_143a);
var _143d=dojo.query("textarea.comment",this.form.domNode)[0];
_143d.value=_143a.Comment;
console.debug("config = ",_143a);
this.title=_143a.Name;
var _143e=dojo.query(".dijitAccordionTitle .dijitAccordionText",this.domNode)[0];
_143e.firstChild.nodeValue=this.title;
var _143f=this._makeFieldTable(item);
plugins.codecs.CodecPane.grid_model.setData(_143f);
var grid=this.codec_grid;
this._setGridStructure(grid);
setTimeout(function(){
grid.update();
grid.resize();
},200);
var node=this.domNode;
setTimeout(function(){
dojo.removeClass(node,"unsaved_changes");
},500);
},_makeFieldTable:function(item){
var store=pion.codecs.config_store;
var _1444=store.getValues(item,"Field");
var _1445=[];
for(var i=0;i<_1444.length;++i){
var _1447=[];
for(var j=0;j<this.attributes_by_column.length;++j){
_1447[j]=store.getValue(_1444[i],this.attributes_by_column[j]);
}
_1445.push(_1447);
}
return _1445;
},_setGridStructure:function(grid){
if(!plugins.codecs.CodecPane.default_grid_layout){
plugins.codecs.initGridLayouts();
}
grid.setStructure(plugins.codecs.CodecPane.default_grid_layout);
},_handleCellClick:function(e){
console.debug("e.rowIndex = ",e.rowIndex,", e.cellIndex = ",e.cellIndex);
if(e.cellIndex==this.delete_col_index){
dojo.addClass(this.domNode,"unsaved_changes");
console.debug("Removing row ",e.rowIndex);
this.codec_grid.removeSelectedRows();
}
},_handleCellEdit:function(_144b,_144c,_144d){
console.debug("CodecPane._handleCellEdit inValue = ",_144b,", inRowIndex = ",_144c,", inFieldIndex = ",_144d);
dojo.addClass(this.domNode,"unsaved_changes");
},_handleAddNewField:function(){
console.debug("_handleAddNewField");
this.markAsChanged();
this.codec_grid.addRow([]);
},save:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
var _144e=this.form.getValues();
var _144f=dojo.query("textarea.comment",this.form.domNode)[0];
_144e.Comment=_144f.value;
var _1450="<PionConfig><Codec>";
for(var tag in _144e){
if(tag.charAt(0)!="@"&&tag!="options"){
console.debug("config[",tag,"] = ",_144e[tag]);
_1450+="<"+tag+">"+_144e[tag]+"</"+tag+">";
}
}
if(this._makeCustomElements){
_1450+=this._makeCustomElements(_144e);
}
_1450+=this._makeFieldElements();
_1450+="</Codec></PionConfig>";
console.debug("put_data: ",_1450);
_this=this;
dojo.rawXhrPut({url:"/config/codecs/"+this.uuid,contentType:"text/xml",handleAs:"xml",putData:_1450,load:function(_1452){
console.debug("response: ",_1452);
pion.codecs.config_store.fetch({query:{"@id":_this.uuid},onItem:function(item){
_this.config_item=item;
_this.populateFromConfigItem(item);
},onError:pion.handleFetchError});
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_1450})});
},_makeFieldElements:function(){
var _1454=plugins.codecs.CodecPane.grid_model.getRowCount();
var _1455="";
for(var i=0;i<_1454;++i){
var row=plugins.codecs.CodecPane.grid_model.getRow(i);
_1455+="<Field term=\""+row[1]+"\"";
_1455+=">"+row[0]+"</Field>";
}
return _1455;
},cancel:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
this.populateFromConfigItem(this.config_item);
},delete2:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
console.debug("delete2: selected codec is ",this.title);
_this=this;
dojo.xhrDelete({url:"/config/codecs/"+this.uuid,handleAs:"xml",timeout:5000,load:function(_1458,_1459){
console.debug("xhrDelete for url = /config/codecs/"+this.uuid,"; HTTP status code: ",_1459.xhr.status);
dijit.byId("codec_config_accordion").forward();
dijit.byId("codec_config_accordion").removeChild(_this);
pion.codecs._adjustAccordionSize();
return _1458;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
},markAsChanged:function(){
console.debug("markAsChanged");
dojo.addClass(this.domNode,"unsaved_changes");
},codec:""});
plugins.codecs.CodecPane.grid_model=new dojox.grid.data.Table(null,[]);
plugins.codecs.initGridLayouts=function(){
plugins.codecs.CodecPane.log_codec_grid_layout=[{rows:[[{name:"Field Name",styles:"",width:"auto",editor:dojox.grid.editors.Input},{name:"Term",styles:"",editor:dojox.grid.editors.Dijit,editorClass:"dijit.form.FilteringSelect",editorProps:{store:pion.terms.store,searchAttr:"id",keyAttr:"id"},width:"auto"},{name:"Start Char",width:3,styles:"text-align: center;",editor:dojox.grid.editors.Dijit,editorClass:"dijit.form.ValidationTextBox",editorProps:{regExp:".?"}},{name:"End Char",width:3,styles:"text-align: center;",editor:dojox.grid.editors.Dijit,editorClass:"dijit.form.ValidationTextBox",editorProps:{regExp:".?"}},{name:"Start/End Optional",width:4,styles:"text-align: center;",editor:dojox.grid.editors.Bool},{name:"Escape Char",width:3,styles:"text-align: center;",editor:dojox.grid.editors.Dijit,editorClass:"dijit.form.ValidationTextBox",editorProps:{regExp:".?"}},{name:"Empty String",width:3,styles:"text-align: center;",editor:dojox.grid.editors.AlwaysOn},{name:"Order",editor:dojox.grid.editors.Dijit,editorClass:"dijit.form.NumberSpinner",width:4},{name:"Delete",styles:"align: center;",width:3,value:"<button dojoType=dijit.form.Button class=\"delete_row\"><img src=\"images/icon-delete.png\" alt=\"DELETE\" border=\"0\" /></button>"},]]}];
plugins.codecs.CodecPane.default_grid_layout=[{rows:[[{name:"Field Name",styles:"",width:"auto",editor:dojox.grid.editors.Input},{name:"Term",styles:"",editor:dojox.grid.editors.Dijit,editorClass:"dijit.form.FilteringSelect",editorProps:{store:pion.terms.store,searchAttr:"id",keyAttr:"id"},width:"auto"},{name:"Delete",styles:"align: center;",width:3,value:"<button dojoType=dijit.form.Button class=\"delete_row\"><img src=\"images/icon-delete.png\" alt=\"DELETE\" border=\"0\" /></button>"},]]}];
};
}
if(!dojo._hasResource["plugins.codecs.LogCodec"]){
dojo._hasResource["plugins.codecs.LogCodec"]=true;
dojo.provide("plugins.codecs.LogCodec");
plugins.codecs.LogCodec={custom_post_data:"<Flush>false</Flush><Headers>false</Headers>"+"<Events split=\"\\r\\n\" join=\"\\n\" comment=\"#\"/>"+"<Fields split=\" \\t\" join=\"\\_\" consume=\"true\"/>"};
dojo.declare("plugins.codecs.LogCodecPane",[plugins.codecs.CodecPane],{templateString:"<div class='dijitAccordionPane codec_pane'\r\n\t><div dojoAttachPoint='titleNode,focusNode' dojoAttachEvent='ondijitclick:_onTitleClick,onkeypress:_onTitleKeyPress,onfocus:_handleFocus,onblur:_handleFocus'\r\n\t\tclass='dijitAccordionTitle' wairole=\"tab\"\r\n\t\t><div class='dijitAccordionArrow'></div\r\n\t\t><div class='arrowTextUp' waiRole=\"presentation\">&#9650;</div\r\n\t\t><div class='arrowTextDown' waiRole=\"presentation\">&#9660;</div\r\n\t\t><div dojoAttachPoint='titleTextNode' class='dijitAccordionText'>${title}</div></div\r\n\t><div\r\n\t\t><div dojoAttachPoint='containerNode' style='overflow: hidden; height: 1px; display: none'\r\n\t\t\tclass='dijitAccordionBody' wairole=\"tabpanel\"\r\n\t\t\t><form dojoAttachPoint=\"form\" dojoType=\"dijit.form.Form\"\r\n\t\t\t\t><br/\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"100%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Name</label></td\r\n\t\t\t\t\t\t><td><input dojoAttachPoint=\"name\" dojoType=\"dijit.form.TextBox\" name=\"Name\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td rowspan=\"4\" valign=\"top\" width=\"20\">&nbsp;</td\r\n\t\t\t\t\t\t><td rowspan=\"1\"><label>Comments</label></td\r\n\t\t\t\t\t\t><td rowspan=\"4\" valign=\"top\"><textarea rows=\"4\" style=\"width: 95%\" name=\"Comment\" class=\"comment\"></textarea></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>ID</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td rowspan=\"3\">&nbsp;</td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Plugin&nbsp;Type</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Plugin\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Event&nbsp;Type</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.FilteringSelect\" name=\"EventType\" dojoAttachEvent=\"onChange: markAsChanged\"\r\n\t\t\t\t\t\t\t\tstore=\"pion.terms.store\" searchAttr=\"id\" query=\"{Type:'object'}\" autocomplete=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"Flush\"/\r\n\t\t\t\t><label>Flush output stream after each write</label\r\n\t\t\t\t><br/\r\n\t\t\t\t><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"Headers\" dojoAttachEvent=\"onClick: updateDisabling\"/\r\n\t\t\t\t><label>Extended Log Format</label\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"100%\" dojoAttachPoint=\"separators\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><th width=\"120px\"></th\r\n\t\t\t\t\t\t><th>Record Separators</th\r\n\t\t\t\t\t\t><th rowspan=\"4\" valign=\"top\" width=\"20\">&nbsp;</th\r\n\t\t\t\t\t\t><th width=\"120px\"></th\r\n\t\t\t\t\t\t><th>Field Separators</th\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Split&nbsp;Set</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@event_split_set\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td><label class=\"disable_for_ELF\">Split&nbsp;Set</label></td\r\n\t\t\t\t\t\t><td><input class=\"disable_for_ELF\" dojoType=\"dijit.form.TextBox\" name=\"@field_split_set\" style=\"width: 95%;\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Join&nbsp;String</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@event_join_string\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td><label class=\"disable_for_ELF\">Join&nbsp;String</label></td\r\n\t\t\t\t\t\t><td><input class=\"disable_for_ELF\" dojoType=\"dijit.form.TextBox\" name=\"@field_join_string\" style=\"width: 95%;\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Comment&nbsp;Char</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.ValidationTextBox\" regExp=\".?\" name=\"@comment_prefix\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td><label class=\"disable_for_ELF\">Consecutive&nbsp;Delimiters</label></td\r\n\t\t\t\t\t\t><td\r\n\t\t\t\t\t\t\t ><select dojoType=\"dijit.form.FilteringSelect\" style=\"width: 95%;\"\r\n\t\t\t\t\t\t\t\t\t  dojoAttachEvent=\"onChange: markAsChanged\" name=\"@consec_field_delims\"\r\n\t\t\t\t\t\t\t\t><option value=\"true\">equivalent to single delimiter</option\r\n\t\t\t\t\t\t\t\t><option value=\"false\">indicate empty fields</option\r\n\t\t\t\t\t\t\t></select\r\n\t\t\t\t\t\t></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" style=\"border: 1px solid #999999;\" width=\"99%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td class=\"matrixMainHeader\">Map Field Names to Terms</td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td style=\"background-color: #f1f1f1;\"\r\n\t\t\t\t\t\t\t><div class=\"codec_grid\"\r\n\t\t\t\t\t\t\t\t><div dojoAttachPoint=\"codec_grid\" dojoType=\"dojox.Grid\" model=\"plugins.codecs.CodecPane.grid_model\"\r\n\t\t\t\t\t\t\t\t\t singleClickEdit=\"true\"></div\r\n\t\t\t\t\t\t\t></div\r\n\t\t\t\t\t\t\t><button dojoType=dijit.form.Button class=\"add_new_row\" dojoAttachEvent=\"onClick:_handleAddNewField\">ADD NEW ROW</button\r\n\t\t\t\t\t\t></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><hr noshade=\"noshade\" size=\"1\" color=\"#999999\"\r\n\t\t\t\t><div class=\"save_cancel_delete\"\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick:save\">Save Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick:cancel\">Cancel Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"delete\" dojoAttachEvent=\"onClick:delete2\">Delete Codec</button\r\n\t\t\t\t></div\r\n\t\t\t></form\r\n\t\t></div\r\n\t></div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
this.special_config_elements.push("Events");
this.special_config_elements.push("Fields");
this.attributes_by_column=["text()","@term","@start","@end","@optional","@escape","@empty"];
this.order_col_index=7;
this.delete_col_index=8;
},getHeight:function(){
return 610;
},_addCustomConfigValues:function(_145a,item){
var store=pion.codecs.config_store;
_145a.options=[];
if(store.hasAttribute(item,"Flush")){
if(store.getValue(item,"Flush").toString()=="true"){
_145a.options.push("Flush");
}
}
var _145d=false;
if(store.hasAttribute(item,"Headers")){
if(store.getValue(item,"Headers").toString()=="true"){
_145a.options.push("Headers");
this.disableAndClearSeparatorFields();
_145d=true;
}
}
if(!_145d){
var _145e=store.getValue(item,"Events");
if(_145e){
_145a["@event_split_set"]=store.getValue(_145e,"@split");
_145a["@event_join_string"]=store.getValue(_145e,"@join");
_145a["@comment_prefix"]=store.getValue(_145e,"@comment");
}
var _145f=store.getValue(item,"Fields");
if(_145f){
_145a["@field_split_set"]=store.getValue(_145f,"@split");
_145a["@field_join_string"]=store.getValue(_145f,"@join");
_145a["@consec_field_delims"]=store.getValue(_145f,"@consume");
}
}
},_makeCustomElements:function(_1460){
var _1461="<Flush>";
_1461+=(dojo.indexOf(_1460.options,"Flush")!=-1);
_1461+="</Flush><Headers>";
_1461+=(dojo.indexOf(_1460.options,"Headers")!=-1);
_1461+="</Headers><Events";
if(_1460["@event_split_set"]){
_1461+=" split=\""+dojox.dtl._base.escape(_1460["@event_split_set"])+"\"";
}
if(_1460["@event_join_string"]){
_1461+=" join=\""+dojox.dtl._base.escape(_1460["@event_join_string"])+"\"";
}
if(_1460["@comment_prefix"]){
_1461+=" comment=\""+dojox.dtl._base.escape(_1460["@comment_prefix"])+"\"";
}
_1461+="/><Fields";
if(_1460["@field_split_set"]){
_1461+=" split=\""+dojox.dtl._base.escape(_1460["@field_split_set"])+"\"";
}
if(_1460["@field_join_string"]){
_1461+=" join=\""+dojox.dtl._base.escape(_1460["@field_join_string"])+"\"";
}
if(_1460["@consec_field_delims"]){
_1461+=" consume=\""+dojox.dtl._base.escape(_1460["@consec_field_delims"])+"\"";
}
_1461+="/>";
return _1461;
},_makeFieldTable:function(item){
var store=pion.codecs.config_store;
var _1464=store.getValues(item,"Field");
var _1465=[];
this.order_map=[];
for(var i=0;i<_1464.length;++i){
var _1467=[];
for(var j=0;j<this.attributes_by_column.length;++j){
_1467[j]=store.getValue(_1464[i],this.attributes_by_column[j]);
}
_1467[this.order_col_index]=i+1;
_1465.push(_1467);
this.order_map[i]=i+1;
}
return _1465;
},_setGridStructure:function(grid){
if(!plugins.codecs.CodecPane.log_codec_grid_layout){
plugins.codecs.initGridLayouts();
}
grid.setStructure(plugins.codecs.CodecPane.log_codec_grid_layout);
},_handleCellEdit:function(_146a,_146b,_146c){
console.debug("LogCodecPane._handleCellEdit inValue = ",_146a,", inRowIndex = ",_146b,", inFieldIndex = ",_146c);
dojo.addClass(this.domNode,"unsaved_changes");
if(_146c==this.order_col_index){
var _146d=this.order_map[_146b];
var _146e=this.order_map;
console.debug("1: order_map = ",_146e);
_146e[_146b]=_146a;
if(_146a>_146d){
for(var i=0;i<_146e.length;++i){
if(_146e[i]>_146d&&_146e[i]<=_146a&&i!=_146b){
_146e[i]--;
}
}
}else{
for(var i=0;i<_146e.length;++i){
if(_146e[i]>=_146a&&_146e[i]<_146d&&i!=_146b){
_146e[i]++;
}
}
}
console.debug("2: order_map = ",_146e);
var _1470=[];
for(var i=0;i<_146e.length;++i){
var row=plugins.codecs.CodecPane.grid_model.getRow(i);
row[this.order_col_index]=_146e[i];
_1470.push(row);
}
plugins.codecs.CodecPane.grid_model.setData(_1470);
}
},_makeFieldElements:function(){
var _1472=plugins.codecs.CodecPane.grid_model.getRowCount();
var _1473=[];
for(var i=0;i<_1472;++i){
if(this.order_map.length==_1472){
_1473[this.order_map[i]-1]=i;
}else{
_1473[i]=i;
}
}
console.debug("this.order_map = ",this.order_map);
console.debug("inverse_order_map = ",_1473);
var _1475="";
for(var i=0;i<_1472;++i){
var row=plugins.codecs.CodecPane.grid_model.getRow(_1473[i]);
_1475+="<Field term=\""+row[1]+"\"";
if(row[2]){
_1475+=" start=\""+dojox.dtl._base.escape(row[2])+"\"";
}
if(row[3]){
_1475+=" end=\""+dojox.dtl._base.escape(row[3])+"\"";
}
if(row[4]){
_1475+=" optional=\"true\"";
}
if(row[5]){
_1475+=" escape=\""+dojox.dtl._base.escape(row[5])+"\"";
}
if(row[6]){
_1475+=" empty=\""+dojox.dtl._base.escape(row[6])+"\"";
}
_1475+=">"+row[0]+"</Field>";
}
return _1475;
},disableAndClearFieldSeparatorFields:function(){
dojo.query("input.disable_for_ELF",this.separators).forEach(function(n){
n.setAttribute("disabled",true);
});
dojo.query(".dijitComboBox",this.separators).forEach(function(n){
dijit.byNode(n).setDisabled(true);
dijit.byNode(n).setDisplayedValue("");
});
dojo.query("label.disable_for_ELF",this.separators).forEach(function(n){
dojo.addClass(n,"disabled");
});
var _147a=this.form.getValues();
_147a["@field_split_set"]="";
_147a["@field_join_string"]="";
this.form.setValues(_147a);
},updateDisabling:function(e){
if(e.target.checked){
this.disableAndClearFieldSeparatorFields();
}else{
dojo.query("input.disable_for_ELF",this.separators).forEach(function(n){
n.removeAttribute("disabled");
});
dojo.query(".dijitComboBox",this.separators).forEach(function(n){
dijit.byNode(n).setDisabled(false);
});
dojo.query("label.disable_for_ELF",this.separators).forEach(function(n){
dojo.removeClass(n,"disabled");
});
}
}});
}
if(!dojo._hasResource["pion.codecs"]){
dojo._hasResource["pion.codecs"]=true;
dojo.provide("pion.codecs");
var selected_codec_pane=null;
var codec_config_store;
pion.codecs.getHeight=function(){
return pion.codecs.height;
};
pion.codecs.config_store=new dojox.data.XmlStore({url:"/config/codecs"});
pion.codecs.config_store.fetchItemByIdentity=function(_147f){
pion.codecs.config_store.fetch({query:{"@id":_147f.identity},onItem:_147f.onItem,onError:pion.handleFetchError});
};
pion.codecs.config_store.getIdentity=function(item){
return pion.codecs.config_store.getValue(item,"@id");
};
pion.codecs.init=function(){
codec_config_store=pion.codecs.config_store;
var url=dojo.moduleUrl("plugins","codecs.json");
pion.codecs.plugin_data_store=new dojo.data.ItemFileReadStore({url:url});
dojo.subscribe("codec_config_accordion-selectChild",codecPaneSelected);
pion.codecs.createNewPaneFromItem=function(item){
var title=pion.codecs.config_store.getValue(item,"Name");
var _1484=pion.codecs.config_store.getValue(item,"Plugin");
var _1485=document.createElement("span");
var _1486="plugins.codecs."+_1484+"Pane";
var _1487=dojo.getObject(_1486);
if(_1487){
console.debug("found class ",_1486);
var _1488=new _1487({"class":"codec_pane",title:title},_1485);
}else{
console.debug("class ",_1486," not found; using plugins.codecs.CodecPane instead.");
var _1488=new plugins.codecs.CodecPane({"class":"codec_pane",title:title},_1485);
}
_1488.config_item=item;
_1488.uuid=pion.codecs.config_store.getValue(item,"@id");
dijit.byId("codec_config_accordion").addChild(_1488);
return _1488;
};
pion.codecs.createNewPaneFromStore=function(id,_148a){
pion.codecs.config_store.fetch({query:{"@id":id},onItem:function(item){
var _148c=pion.codecs.createNewPaneFromItem(item);
if(_148a){
pion.codecs._adjustAccordionSize();
dijit.byId("codec_config_accordion").selectChild(_148c);
}
},onError:pion.handleFetchError});
};
function onComplete(items,_148e){
var _148f=dijit.byId("codec_config_accordion");
for(var i=0;i<items.length;++i){
pion.codecs.createNewPaneFromItem(items[i]);
}
var _1491=_148f.getChildren()[0];
_148f.selectChild(_1491);
};
if(file_protocol){
dijit.byId("codec_config_accordion").removeChild(selected_codec_pane);
}else{
codec_config_store.fetch({onComplete:onComplete,onError:pion.handleFetchError});
}
dojo.connect(dojo.byId("add_new_codec_button"),"click",addNewCodec);
};
function addNewCodec(){
var _1492=new plugins.codecs.CodecInitDialog({title:"Add New Codec"});
setTimeout(function(){
dojo.query("input",_1492.domNode)[0].select();
},500);
_1492.show();
_1492.execute=function(_1493){
console.debug(_1493);
var _1494="<PionConfig><Codec>";
for(var tag in _1493){
console.debug("dialogFields[",tag,"] = ",_1493[tag]);
_1494+="<"+tag+">"+_1493[tag]+"</"+tag+">";
}
if(plugins.codecs[_1493.Plugin]&&plugins.codecs[_1493.Plugin].custom_post_data){
_1494+=plugins.codecs[_1493.Plugin].custom_post_data;
}
_1494+="</Codec></PionConfig>";
console.debug("post_data: ",_1494);
dojo.rawXhrPost({url:"/config/codecs",contentType:"text/xml",handleAs:"xml",postData:_1494,load:function(_1496){
var node=_1496.getElementsByTagName("Codec")[0];
var id=node.getAttribute("id");
console.debug("id (from server): ",id);
pion.codecs.createNewPaneFromStore(id,true);
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1494})});
};
};
pion.codecs._adjustAccordionSize=function(){
var _1499=dijit.byId("codec_config_accordion");
var _149a=_1499.getChildren().length;
console.debug("num_codecs = "+_149a);
var _149b=selected_codec_pane.getHeight();
var _149c=0;
if(_149a>0){
var _149d=_1499.getChildren()[0];
_149c=_149d.getTitleHeight();
}
var _149e=_149b+_149a*_149c;
_1499.resize({h:_149e});
pion.codecs.height=_149e+160;
dijit.byId("main_stack_container").resize({h:pion.codecs.height});
};
function codecPaneSelected(pane){
console.debug("Selected "+pane.title);
if(pane==selected_codec_pane){
return;
}
if(selected_codec_pane&&dojo.hasClass(selected_codec_pane.domNode,"unsaved_changes")){
var _14a0=new dijit.Dialog({title:"Warning: unsaved changes"});
_14a0.setContent("Please save or cancel unsaved changes before selecting another Codec.");
_14a0.show();
setTimeout("dijit.byId('codec_config_accordion').selectChild(selected_codec_pane)",500);
return;
}
selected_codec_pane=pane;
console.debug("Fetching item ",pane.uuid);
var store=pion.codecs.config_store;
store.fetch({query:{"@id":pane.uuid},onItem:function(item){
console.debug("item: ",item);
pane.populateFromConfigItem(item);
},onError:pion.handleFetchError});
var _14a3=dijit.byId("codec_config_accordion").duration;
setTimeout(function(){
dojo.style(pane.containerNode,"overflow","hidden");
pion.codecs._adjustAccordionSize();
},_14a3+50);
};
}
if(!dojo._hasResource["plugins.reactors.LogOutputReactor"]){
dojo._hasResource["plugins.reactors.LogOutputReactor"]=true;
dojo.provide("plugins.reactors.LogOutputReactor");
dojo.declare("plugins.reactors.LogOutputReactor",[plugins.reactors.Reactor],{postCreate:function(){
this.config.Plugin="LogOutputReactor";
this.inherited("postCreate",arguments);
}});
plugins.reactors.LogOutputReactor.label="Log File Output Reactor";
dojo.declare("plugins.reactors.LogOutputReactorInitDialog",[plugins.reactors.ReactorInitDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Log File Output Reactor Initialization</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<table>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Name:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Comments:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Codec:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.FilteringSelect\" name=\"Codec\" store=\"pion.codecs.config_store\" searchAttr=\"Name\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Filename:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Filename\"/></td>\r\n\t\t\t</tr>\r\n\t\t</table>\r\n\t</div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick: tryConfig\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.plugin="LogOutputReactor";
this.inherited("postCreate",arguments);
}});
dojo.declare("plugins.reactors.LogOutputReactorDialog",[plugins.reactors.ReactorDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Log Output Reactor Configuration</span>\r\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\">\r\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" class=\"id_text_box\" disabled=\"true\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Codec:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.FilteringSelect\" name=\"Codec\" store=\"pion.codecs.config_store\" searchAttr=\"Name\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Filename:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Filename\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t</div>\r\n\t<h3>Input Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_inputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_inputs_grid_model\"\r\n\t\t structure=\"reactor_inputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<h3>Output Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_outputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_outputs_grid_model\"\r\n\t\t structure=\"reactor_outputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"delete\">Delete Reactor</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true});
}
if(!dojo._hasResource["plugins.reactors.FilterReactor"]){
dojo._hasResource["plugins.reactors.FilterReactor"]=true;
dojo.provide("plugins.reactors.FilterReactor");
dojo.declare("plugins.reactors.FilterReactor",[plugins.reactors.Reactor],{postCreate:function(){
this.config.Plugin="FilterReactor";
this.inherited("postCreate",arguments);
this.special_config_elements.push("Comparison");
var store=pion.reactors.config_store;
var _this=this;
this.comparison_table=[];
store.fetch({query:{"@id":this.config["@id"]},onItem:function(item){
var _14a7=store.getValues(item,"Comparison");
for(var i=0;i<_14a7.length;++i){
var _14a9=[];
_14a9[0]=store.getValue(_14a7[i],"Term");
_14a9[1]=store.getValue(_14a7[i],"Type");
_14a9[2]=store.getValue(_14a7[i],"Value");
_this.comparison_table.push(_14a9);
}
},onError:pion.handleFetchError});
},_insertCustomData:function(){
for(var i=0;i<this.comparison_table.length;++i){
var row=this.comparison_table[i];
this.put_data+="<Comparison>";
this.put_data+="<Term>"+row[0]+"</Term>";
this.put_data+="<Type>"+row[1]+"</Type>";
if(row[2]){
this.put_data+="<Value>"+row[2]+"</Value>";
}
this.put_data+="</Comparison>";
}
}});
plugins.reactors.FilterReactor.label="Filter Reactor";
plugins.reactors.initFilterReactorGridLayout=function(){
plugins.reactors.filter_reactor_grid_layout=[{rows:[[{name:"Term",styles:"",editor:dojox.grid.editors.Dijit,editorClass:"dijit.form.FilteringSelect",editorProps:{store:pion.terms.store,searchAttr:"id",keyAttr:"id"},width:"auto"},{name:"Comparison",styles:"",width:"auto",editor:dojox.grid.editors.Dijit,editorClass:"dijit.form.FilteringSelect",editorProps:{store:pion.reactors.comparison_type_store,query:{category:"generic"}}},{name:"Value",width:"auto",styles:"text-align: center;",editor:dojox.grid.editors.Input},{name:"Delete",styles:"align: center;",width:3,value:"<button dojoType=dijit.form.Button class=\"delete_row\"><img src=\"images/icon-delete.png\" alt=\"DELETE\" border=\"0\" /></button>"},]]}];
};
dojo.declare("plugins.reactors.FilterReactorDialog",[plugins.reactors.ReactorDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Filter Reactor Configuration</span>\r\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\">\r\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" class=\"id_text_box\" disabled=\"true\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t</div>\r\n\t<div dojoAttachPoint=\"filter_reactor_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.filter_reactor_grid_model\"\r\n\t\t singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<button dojoAttachPoint=\"add_new_comparison_button\" dojoType=dijit.form.Button dojoAttachEvent=\"onClick:_handleAddNewComparison\" class=\"add_new_row\">ADD NEW COMPARISON</button>\r\n\t<h3>Input Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_inputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_inputs_grid_model\"\r\n\t\t structure=\"reactor_inputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<h3>Output Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_outputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_outputs_grid_model\"\r\n\t\t structure=\"reactor_outputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"delete\">Delete Reactor</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
var _this=this;
plugins.reactors.initFilterReactorGridLayout();
this.filter_reactor_grid.setStructure(plugins.reactors.filter_reactor_grid_layout);
this.reactor.comparison_table=[];
var store=pion.reactors.config_store;
store.fetch({query:{"@id":this.reactor.config["@id"]},onItem:function(item){
var _14af=store.getValues(item,"Comparison");
for(var i=0;i<_14af.length;++i){
var _14b1=[];
_14b1[0]=store.getValue(_14af[i],"Term");
_14b1[1]=store.getValue(_14af[i],"Type");
_14b1[2]=store.getValue(_14af[i],"Value");
_this.reactor.comparison_table.push(_14b1);
}
pion.reactors.filter_reactor_grid_model.setData(_this.reactor.comparison_table);
var grid=_this.filter_reactor_grid;
dojo.connect(grid,"onCellClick",grid,_this._handleCellClick);
setTimeout(function(){
grid.update();
grid.resize();
},200);
},onError:pion.handleFetchError});
},_handleCellClick:function(e){
console.debug("e.rowIndex = ",e.rowIndex,", e.cellIndex = ",e.cellIndex);
if(e.cellIndex==1){
var term=pion.reactors.filter_reactor_grid_model.getDatum(e.rowIndex,0).toString();
console.debug("term = ",term,", pion.terms.categories_by_id[term] = ",pion.terms.categories_by_id[term]);
plugins.reactors.filter_reactor_grid_layout[0].rows[0][1].editorProps.query.category=pion.terms.categories_by_id[term];
}else{
if(e.cellIndex==3){
console.debug("Removing row ",e.rowIndex);
this.removeSelectedRows();
}
}
},_handleAddNewComparison:function(){
this.filter_reactor_grid.addRow([0,"true"]);
},_insertCustomData:function(){
var _14b5=pion.reactors.filter_reactor_grid_model.getRowCount();
for(var i=0;i<_14b5;++i){
var row=pion.reactors.filter_reactor_grid_model.getRow(i);
this.put_data+="<Comparison>";
this.put_data+="<Term>"+row[0]+"</Term>";
this.put_data+="<Type>"+row[1]+"</Type>";
if(row[2]){
this.put_data+="<Value>"+row[2]+"</Value>";
}
this.put_data+="</Comparison>";
}
}});
}
if(!dojo._hasResource["plugins.reactors.TransformReactor"]){
dojo._hasResource["plugins.reactors.TransformReactor"]=true;
dojo.provide("plugins.reactors.TransformReactor");
dojo.declare("plugins.reactors.TransformReactor",[plugins.reactors.Reactor],{postCreate:function(){
this.config.Plugin="TransformReactor";
this.inherited("postCreate",arguments);
this.special_config_elements.push("Comparison");
this.special_config_elements.push("Transformation");
this._updateCustomData();
},_updateCustomData:function(){
this._initOptions(this.config,plugins.reactors.TransformReactor.option_defaults);
var store=pion.reactors.config_store;
var _this=this;
this.comparisons=[];
this.transformations=[];
store.fetch({query:{"@id":this.config["@id"]},onItem:function(item){
var _14bb=store.getValues(item,"Comparison");
for(var i=0;i<_14bb.length;++i){
var _14bd={};
_14bd.term=store.getValue(_14bb[i],"Term");
_14bd.type=store.getValue(_14bb[i],"Type");
_14bd.value=store.getValue(_14bb[i],"Value");
_this.comparisons.push(_14bd);
}
var _14be=store.getValues(item,"Transformation");
var _14bf=plugins.reactors.TransformReactor.getBool;
for(var i=0;i<_14be.length;++i){
var _14c0={};
_14c0.term=store.getValue(_14be[i],"Term");
_14c0.type=store.getValue(_14be[i],"Type");
_14c0.value=store.getValue(_14be[i],"Value");
_14c0.match_all=_14bf(store,_14be[i],"MatchAllValues");
_14c0.set_value=store.getValue(_14be[i],"SetValue");
_14c0.in_place=_14bf(store,_14be[i],"InPlace");
_14c0.set_term=store.getValue(_14be[i],"SetTerm");
_this.transformations.push(_14c0);
}
},onError:pion.handleFetchError});
},_insertCustomData:function(){
for(var i=0;i<this.comparisons.length;++i){
var c=this.comparisons[i];
this.put_data+="<Comparison>";
this.put_data+="<Term>"+c.term+"</Term>";
this.put_data+="<Type>"+c.type+"</Type>";
if(c.value){
this.put_data+="<Value>"+c.value+"</Value>";
}
this.put_data+="</Comparison>";
}
for(var i=0;i<this.transformations.length;++i){
var t=this.transformations[i];
this.put_data+="<Transformation>";
this.put_data+="<Term>"+t.term+"</Term>";
this.put_data+="<Type>"+t.type+"</Type>";
if(t.value){
this.put_data+="<Value>"+t.value+"</Value>";
}
if(t.match_all){
this.put_data+="<MatchAllValues>"+t.match_all+"</MatchAllValues>";
}
this.put_data+="<SetValue>"+t.set_value+"</SetValue>";
if(t.in_place){
this.put_data+="<InPlace>"+t.in_place+"</InPlace>";
}
if(t.set_term){
this.put_data+="<SetTerm>"+t.set_term+"</SetTerm>";
}
this.put_data+="</Transformation>";
}
}});
plugins.reactors.TransformReactor.label="Transformation Reactor";
dojo.declare("plugins.reactors.TransformReactorDialog",[plugins.reactors.ReactorDialog],{templateString:"<div class=\"dijitDialog reactor_dialog transform_reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Transform Reactor Configuration</span>\r\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\">\r\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" class=\"id_text_box\" disabled=\"true\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>All Conditions</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"AllConditions\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Deliver Original</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"DeliverOriginal\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t></div>\r\n\t<h3>Comparisons</h3>\r\n\t<div dojoAttachPoint=\"comparison_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.transform_reactor_comparison_grid_model\"\r\n\t\t singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<button dojoAttachPoint=\"add_new_comparison_button\" dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:_handleAddNewComparison\" class=\"add_new_row\">ADD NEW COMPARISON</button>\r\n\t<h3>Transformations</h3>\r\n\t<div dojoAttachPoint=\"transformation_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.transform_reactor_transformation_grid_model\"\r\n\t\t singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<button dojoAttachPoint=\"add_new_transformation_button\" dojoType=dijit.form.Button dojoAttachEvent=\"onClick:_handleAddNewTransformation\" class=\"add_new_row\">ADD NEW TRANSFORMATION</button>\r\n\t<h3>Input Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_inputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_inputs_grid_model\"\r\n\t\t structure=\"reactor_inputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<h3>Output Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_outputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_outputs_grid_model\"\r\n\t\t structure=\"reactor_outputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"delete\">Delete Reactor</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
this.initGridLayouts();
var _this=this;
this.comparison_grid.setStructure(this.comparison_grid_layout);
var _14c5=pion.reactors.transform_reactor_comparison_grid_model;
this.comparison_grid.canEdit=function(cell,_14c7){
switch(cell.index){
case this.value_column_index:
var type=_14c5.getDatum(_14c7,this.type_column_index);
return dojo.indexOf(pion.reactors.generic_comparison_types,type)==-1;
default:
return true;
}
};
this.transformation_grid.setStructure(this.transformation_grid_layout);
var _14c9=pion.reactors.transform_reactor_transformation_grid_model;
this.transformation_grid.canEdit=function(cell,_14cb){
switch(cell.index){
case this.value_column_index:
var type=_14c9.getDatum(_14cb,this.type_column_index);
return dojo.indexOf(pion.reactors.generic_comparison_types,type)==-1;
case this.set_term_column_index:
var _14cd=_14c9.getDatum(_14cb,this.in_place_column_index);
console.debug("in_place = ",_14cd);
if(_14cd){
return false;
}else{
return true;
}
default:
return true;
}
};
this.comparison_table=[];
this.transformation_table=[];
var store=pion.reactors.config_store;
store.fetch({query:{"@id":this.reactor.config["@id"]},onItem:function(item){
var _14d0=store.getValues(item,"Comparison");
var cg=_this.comparison_grid;
for(var i=0;i<_14d0.length;++i){
var _14d3=[];
_14d3[cg.term_column_index]=store.getValue(_14d0[i],"Term");
_14d3[cg.type_column_index]=store.getValue(_14d0[i],"Type");
_14d3[cg.value_column_index]=store.getValue(_14d0[i],"Value");
_this.comparison_table.push(_14d3);
}
_14c5.setData(_this.comparison_table);
var _14d4=store.getValues(item,"Transformation");
var tg=_this.transformation_grid;
var _14d6=plugins.reactors.TransformReactor.getBool;
for(var i=0;i<_14d4.length;++i){
var _14d3=[];
_14d3[tg.term_column_index]=store.getValue(_14d4[i],"Term");
_14d3[tg.type_column_index]=store.getValue(_14d4[i],"Type");
_14d3[tg.value_column_index]=store.getValue(_14d4[i],"Value");
_14d3[tg.match_all_column_index]=_14d6(store,_14d4[i],"MatchAllValues");
_14d3[tg.set_value_column_index]=store.getValue(_14d4[i],"SetValue");
_14d3[tg.in_place_column_index]=_14d6(store,_14d4[i],"InPlace");
_14d3[tg.set_term_column_index]=store.getValue(_14d4[i],"SetTerm");
_this.transformation_table.push(_14d3);
}
_14c9.setData(_this.transformation_table);
dojo.connect(_this.comparison_grid,"onCellClick",_this,_this._handleComparisonGridCellClick);
dojo.connect(_this.comparison_grid,"onApplyCellEdit",_this,_this._handleComparisonGridCellEdit);
dojo.connect(_this.transformation_grid,"onCellClick",_this,_this._handleTransformationGridCellClick);
dojo.connect(_this.transformation_grid,"onApplyCellEdit",_this,_this._handleTransformationGridCellEdit);
setTimeout(function(){
_this.comparison_grid.update();
_this.comparison_grid.resize();
_this.transformation_grid.update();
_this.transformation_grid.resize();
},200);
},onError:pion.handleFetchError});
},initGridLayouts:function(){
this.comparison_grid.term_column_index=0;
this.comparison_grid.type_column_index=1;
this.comparison_grid.value_column_index=2;
this.comparison_grid.delete_column_index=3;
this.comparison_grid_layout=[{rows:[[{name:"Term",styles:"",editor:dojox.grid.editors.Dijit,editorClass:"dijit.form.FilteringSelect",editorProps:{store:pion.terms.store,searchAttr:"id",keyAttr:"id"},width:"auto"},{name:"Comparison",styles:"",width:"auto",editor:dojox.grid.editors.Dijit,editorClass:"dijit.form.FilteringSelect",editorProps:{store:pion.reactors.comparison_type_store,query:{category:"generic"}}},{name:"Value",width:"auto",styles:"text-align: center;",editor:dojox.grid.editors.Input},{name:"Delete",styles:"align: center;",width:3,value:"<button dojoType=dijit.form.Button class=\"delete_row\"><img src=\"images/icon-delete.png\" alt=\"DELETE\" border=\"0\" /></button>"},]]}];
this.transformation_grid.term_column_index=0;
this.transformation_grid.type_column_index=1;
this.transformation_grid.value_column_index=2;
this.transformation_grid.match_all_column_index=3;
this.transformation_grid.set_value_column_index=4;
this.transformation_grid.in_place_column_index=5;
this.transformation_grid.set_term_column_index=6;
this.transformation_grid.delete_column_index=7;
this.transformation_grid_layout=[{rows:[[{name:"Term",styles:"",editor:dojox.grid.editors.Dijit,editorClass:"dijit.form.FilteringSelect",editorProps:{store:pion.terms.store,searchAttr:"id",keyAttr:"id"},width:14},{name:"Comparison",styles:"",width:"auto",editor:dojox.grid.editors.Dijit,editorClass:"dijit.form.FilteringSelect",editorProps:{store:pion.reactors.comparison_type_store,query:{category:"generic"}}},{name:"Value",width:"auto",styles:"text-align: center;",editor:dojox.grid.editors.Input},{name:"Match All",width:3,editor:dojox.grid.editors.Bool},{name:"Set Value",width:"auto",styles:"text-align: center;",editor:dojox.grid.editors.Input},{name:"In Place",width:3,editor:dojox.grid.editors.Bool},{name:"Set Term",styles:"",editor:dojox.grid.editors.Dijit,editorClass:"dijit.form.FilteringSelect",editorProps:{store:pion.terms.store,searchAttr:"id",keyAttr:"id"},width:14},{name:"Delete",styles:"align: center;",width:3,value:"<button dojoType=dijit.form.Button class=\"delete_row\"><img src=\"images/icon-delete.png\" alt=\"DELETE\" border=\"0\" /></button>"},]]}];
},_handleComparisonGridCellClick:function(e){
console.debug("In _handleComparisonGridCellClick: this.id = ",this.id);
console.debug("e.rowIndex = ",e.rowIndex,", e.cellIndex = ",e.cellIndex);
var grid=this.comparison_grid;
var model=pion.reactors.transform_reactor_comparison_grid_model;
switch(e.cellIndex){
case grid.type_column_index:
var term=model.getDatum(e.rowIndex,grid.term_column_index).toString();
console.debug("term = ",term,", pion.terms.categories_by_id[term] = ",pion.terms.categories_by_id[term]);
this.comparison_grid_layout[0].rows[0][e.cellIndex].editorProps.query.category=pion.terms.categories_by_id[term];
break;
case grid.delete_column_index:
console.debug("Removing row ",e.rowIndex);
grid.removeSelectedRows();
break;
default:
}
},_handleTransformationGridCellClick:function(e){
console.debug("In _handleTransformationGridCellClick: this.transformation_grid.id = ",this.transformation_grid.id);
console.debug("e.rowIndex = ",e.rowIndex,", e.cellIndex = ",e.cellIndex);
var grid=this.transformation_grid;
var model=pion.reactors.transform_reactor_transformation_grid_model;
switch(e.cellIndex){
case grid.type_column_index:
var term=model.getDatum(e.rowIndex,grid.term_column_index).toString();
console.debug("term = ",term,", pion.terms.categories_by_id[term] = ",pion.terms.categories_by_id[term]);
this.transformation_grid_layout[0].rows[0][e.cellIndex].editorProps.query.category=pion.terms.categories_by_id[term];
break;
case grid.delete_column_index:
console.debug("Removing row ",e.rowIndex);
grid.removeSelectedRows();
break;
default:
}
},_handleComparisonGridCellEdit:function(value,_14e0,_14e1){
console.debug("value = ",value);
var grid=this.comparison_grid;
var model=pion.reactors.transform_reactor_comparison_grid_model;
switch(_14e1){
case grid.type_column_index:
var store=pion.reactors.comparison_type_store;
store.fetchItemByIdentity({identity:value,onItem:function(item){
if(store.containsValue(item,"category","generic")){
model.setDatum("",_14e0,grid.value_column_index);
}
}});
break;
default:
}
},_handleTransformationGridCellEdit:function(value,_14e7,_14e8){
console.debug("value = ",value);
var grid=this.transformation_grid;
var model=pion.reactors.transform_reactor_transformation_grid_model;
switch(_14e8){
case grid.type_column_index:
var store=pion.reactors.comparison_type_store;
store.fetchItemByIdentity({identity:value,onItem:function(item){
if(store.containsValue(item,"category","generic")){
model.setDatum("",_14e7,grid.value_column_index);
}
}});
break;
case grid.in_place_column_index:
if(value){
model.setDatum("",_14e7,grid.set_term_column_index);
}else{
if(model.getDatum(_14e7,grid.set_term_column_index)===undefined){
var _14ed=model.getDatum(_14e7,grid.term_column_index);
model.setDatum(_14ed,_14e7,grid.set_term_column_index);
}
}
break;
default:
}
},_handleAddNewComparison:function(){
console.debug("this.comparison_grid.id = ",this.comparison_grid.id);
this.comparison_grid.addRow([0,"true"]);
},_handleAddNewTransformation:function(){
console.debug("this.transformation_grid.id = ",this.transformation_grid.id);
this.transformation_grid.addRow([0,"true",,false,0,true]);
},_insertCustomData:function(){
var _14ee=pion.reactors.transform_reactor_comparison_grid_model.getRowCount();
var cg=this.comparison_grid;
for(var i=0;i<_14ee;++i){
var row=pion.reactors.transform_reactor_comparison_grid_model.getRow(i);
this.put_data+="<Comparison>";
this.put_data+="<Term>"+row[cg.term_column_index]+"</Term>";
this.put_data+="<Type>"+row[cg.type_column_index]+"</Type>";
if(row[cg.value_column_index]){
this.put_data+="<Value>"+row[cg.value_column_index]+"</Value>";
}
this.put_data+="</Comparison>";
}
var _14f2=pion.reactors.transform_reactor_transformation_grid_model.getRowCount();
var tg=this.transformation_grid;
for(var i=0;i<_14f2;++i){
var row=pion.reactors.transform_reactor_transformation_grid_model.getRow(i);
this.put_data+="<Transformation>";
this.put_data+="<Term>"+row[tg.term_column_index]+"</Term>";
this.put_data+="<Type>"+row[tg.type_column_index]+"</Type>";
if(row[tg.value_column_index]){
this.put_data+="<Value>"+row[tg.value_column_index]+"</Value>";
}
if(row[tg.match_all_column_index]){
this.put_data+="<MatchAllValues>"+row[tg.match_all_column_index]+"</MatchAllValues>";
}
this.put_data+="<SetValue>"+row[tg.set_value_column_index]+"</SetValue>";
if(row[tg.in_place_column_index]){
this.put_data+="<InPlace>"+row[tg.in_place_column_index]+"</InPlace>";
}
if(row[tg.set_term_column_index]){
this.put_data+="<SetTerm>"+row[tg.set_term_column_index]+"</SetTerm>";
}
this.put_data+="</Transformation>";
}
}});
plugins.reactors.TransformReactor.option_defaults={AllConditions:false,DeliverOriginal:false};
plugins.reactors.TransformReactor.grid_option_defaults={InPlace:false,MatchAllValues:false};
plugins.reactors.TransformReactor.getBool=function(store,item,_14f6){
if(store.hasAttribute(item,_14f6)){
return store.getValue(item,_14f6).toString()=="true";
}else{
return plugins.reactors.TransformReactor.grid_option_defaults[_14f6];
}
};
}
if(!dojo._hasResource["plugins.databases.Database"]){
dojo._hasResource["plugins.databases.Database"]=true;
dojo.provide("plugins.databases.Database");
dojo.declare("plugins.databases.SelectPluginDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog database_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">${title}</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Plugin&nbsp;Type:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.FilteringSelect\" name=\"Plugin\" \r\n\t\t\t\t\t\tstore=\"pion.databases.plugin_data_store\" searchAttr=\"label\" \r\n\t\t\t\t\t\tautocomplete=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t</div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Continue</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: onCancel\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true});
dojo.declare("plugins.databases.DatabaseInitDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog database_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">${title}</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Plugin&nbsp;Type:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Plugin\" style=\"width: 100%;\"\r\n\t\t\t\t\t\treadonly=\"true\"/></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Filename:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Filename\" style=\"width: 100%;\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t</div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: onCancel\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true});
dojo.declare("plugins.databases.DatabasePane",[dijit.layout.AccordionPane],{templateString:"<div class='dijitAccordionPane database_pane'\r\n\t><div dojoAttachPoint='titleNode,focusNode' dojoAttachEvent='ondijitclick:_onTitleClick,onkeypress:_onTitleKeyPress,onfocus:_handleFocus,onblur:_handleFocus'\r\n\t\tclass='dijitAccordionTitle' wairole=\"tab\"\r\n\t\t><div class='dijitAccordionArrow'></div\r\n\t\t><div class='arrowTextUp' waiRole=\"presentation\">&#9650;</div\r\n\t\t><div class='arrowTextDown' waiRole=\"presentation\">&#9660;</div\r\n\t\t><div dojoAttachPoint='titleTextNode' class='dijitAccordionText'>${title}</div></div\r\n\t><div\r\n\t\t><div dojoAttachPoint='containerNode' style='overflow: hidden; height: 1px; display: none'\r\n\t\t\tclass='dijitAccordionBody' wairole=\"tabpanel\"\r\n\t\t\t><form dojoAttachPoint=\"database_form\" dojoType=\"dijit.form.Form\"\r\n\t\t\t\t><br /><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"100%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Name</label></td\r\n\t\t\t\t\t\t><td><input dojoAttachPoint=\"name\" dojoType=\"dijit.form.TextBox\" name=\"Name\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td rowspan=\"4\" valign=\"top\" width=\"20\">&nbsp;</td\r\n\t\t\t\t\t\t><td rowspan=\"1\"><label>Comments</label></td\r\n\t\t\t\t\t\t><td rowspan=\"4\" valign=\"top\"><textarea rows=\"4\" style=\"width: 95%\" name=\"Comment\" class=\"comment\" dojoAttachEvent=\"onChange:markAsChanged\"></textarea></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>ID</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td rowspan=\"3\">&nbsp;</td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Plugin&nbsp;Type</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Plugin\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Filename</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Filename\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><hr noshade=\"noshade\" size=\"1\" color=\"#999999\"\r\n\t\t\t\t><div class=\"save_cancel_delete\"\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick:save\">Save Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick:cancel\">Cancel Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"delete\" dojoAttachEvent=\"onClick:delete2\">Delete Database</button\r\n\t\t\t\t></div\r\n\t\t\t></form\r\n\t\t></div\r\n\t></div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
},getHeight:function(){
return 100;
},populateFromConfigItem:function(item){
var store=pion.databases.config_store;
var _14f9={};
var _14fa=store.getAttributes(item);
for(var i=0;i<_14fa.length;++i){
if(_14fa[i]!="tagName"&&_14fa[i]!="childNodes"){
_14f9[_14fa[i]]=store.getValue(item,_14fa[i]).toString();
}
}
console.dir(_14f9);
this.database_form.setValues(_14f9);
var _14fc=dojo.query("textarea.comment",this.database_form.domNode)[0];
_14fc.value=_14f9.Comment;
console.debug("config = ",_14f9);
this.title=_14f9.Name;
var _14fd=dojo.query(".dijitAccordionTitle .dijitAccordionText",this.domNode)[0];
_14fd.firstChild.nodeValue=this.title;
var node=this.domNode;
setTimeout(function(){
dojo.removeClass(node,"unsaved_changes");
},500);
},setUnsavedChangesTrue:function(){
dojo.addClass(this.domNode,"unsaved_changes");
},setUnsavedChangesFalse:function(){
console.debug("removeClass");
dojo.removeClass(this.domNode,"unsaved_changes");
},save:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
var _14ff=this.database_form.getValues();
var _1500=dojo.query("textarea.comment",this.database_form.domNode)[0];
_14ff.Comment=_1500.value;
this.put_data="<PionConfig><Database>";
for(var tag in _14ff){
if(tag!="@id"){
console.debug("config[",tag,"] = ",_14ff[tag]);
this.put_data+="<"+tag+">"+_14ff[tag]+"</"+tag+">";
}
}
if(this._insertCustomData){
this._insertCustomData();
}
this.put_data+="</Database></PionConfig>";
console.debug("put_data: ",this.put_data);
_this=this;
dojo.rawXhrPut({url:"/config/databases/"+this.uuid,contentType:"text/xml",handleAs:"xml",putData:this.put_data,load:function(_1502){
console.debug("response: ",_1502);
pion.databases.config_store.fetch({query:{"@id":_this.uuid},onItem:function(item){
_this.config_item=item;
_this.populateFromConfigItem(item);
},onError:pion.handleFetchError});
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:this.put_data})});
},cancel:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
this.populateFromConfigItem(this.config_item);
},delete2:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
console.debug("delete2: selected database is ",this.title);
_this=this;
dojo.xhrDelete({url:"/config/databases/"+this.uuid,handleAs:"xml",timeout:5000,load:function(_1504,_1505){
console.debug("xhrDelete for url = /config/databases/"+this.uuid,"; HTTP status code: ",_1505.xhr.status);
dijit.byId("database_config_accordion").forward();
dijit.byId("database_config_accordion").removeChild(_this);
pion.databases._adjustAccordionSize();
return _1504;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
},markAsChanged:function(){
console.debug("markAsChanged");
dojo.addClass(this.domNode,"unsaved_changes");
},database:""});
}
if(!dojo._hasResource["plugins.databases.SQLiteDatabase"]){
dojo._hasResource["plugins.databases.SQLiteDatabase"]=true;
dojo.provide("plugins.databases.SQLiteDatabase");
plugins.databases.SQLiteDatabase.label="SQLite Database";
dojo.declare("plugins.databases.SQLiteDatabasePane",[plugins.databases.DatabasePane],{widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
},getHeight:function(){
return 200;
}});
}
if(!dojo._hasResource["pion.databases"]){
dojo._hasResource["pion.databases"]=true;
dojo.provide("pion.databases");
pion.databases.getHeight=function(){
return pion.databases.height;
};
pion.databases.config_store=new dojox.data.XmlStore({url:"/config/databases"});
pion.databases.config_store.fetchItemByIdentity=function(_1506){
pion.databases.config_store.fetch({query:{"@id":_1506.identity},onItem:_1506.onItem,onError:pion.handleFetchError});
};
pion.databases.config_store.getIdentity=function(item){
return pion.databases.config_store.getValue(item,"@id");
};
pion.databases._adjustAccordionSize=function(){
var _1508=dijit.byId("database_config_accordion");
var _1509=_1508.getChildren().length;
console.debug("num_databases = "+_1509);
var _150a=pion.databases.selected_pane.getHeight();
var _150b=0;
if(_1509>0){
var _150c=_1508.getChildren()[0];
_150b=_150c.getTitleHeight();
}
var _150d=_150a+_1509*_150b;
_1508.resize({h:_150d});
pion.databases.height=_150d+160;
dijit.byId("main_stack_container").resize({h:pion.databases.height});
};
pion.databases.init=function(){
pion.databases.selected_pane=null;
var _150e=new dojox.data.XmlStore({url:"/config/databases/plugins"});
dojo.xhrGet({url:"/config/plugins",handleAs:"xml",timeout:5000,load:function(_150f,_1510){
pion.available_plugins=[];
var _1511=_150f.getElementsByTagName("Plugin");
dojo.forEach(_1511,function(n){
pion.available_plugins.push(dojo.isIE?n.childNodes[0].nodeValue:n.textContent);
});
var items=[];
_150e.fetch({onItem:function(item){
var _1515=_150e.getValue(item,"Plugin").toString();
if(dojo.indexOf(pion.available_plugins,_1515)!=-1){
var _1516="plugins.databases."+_1515;
var _1517=dojo.getObject(_1516);
if(!_1517){
var path="/plugins/databases/"+_1515+"/"+_1515;
dojo.registerModulePath(_1516,path);
dojo.requireIf(true,_1516);
_1517=dojo.getObject(_1516);
}
console.debug("label = ",_1517["label"]);
items.push({plugin:_1515,label:_1517["label"]});
}
},onComplete:function(){
pion.databases.plugin_data_store=new dojo.data.ItemFileWriteStore({data:{identifier:"plugin",items:items}});
if(file_protocol){
pion.databases._adjustAccordionSize();
}else{
pion.databases.config_store.fetch({onComplete:function(items,_151a){
var _151b=dijit.byId("database_config_accordion");
for(var i=0;i<items.length;++i){
pion.databases.createNewPaneFromItem(items[i]);
}
var _151d=_151b.getChildren()[0];
_151b.selectChild(_151d);
},onError:pion.handleFetchError});
}
}});
return _150f;
},error:pion.handleXhrGetError});
function _paneSelected(pane){
console.debug("Selected "+pane.title);
var _151f=pion.databases.selected_pane;
if(pane==_151f){
return;
}
if(_151f&&dojo.hasClass(_151f.domNode,"unsaved_changes")){
var _1520=new dijit.Dialog({title:"Warning: unsaved changes"});
_1520.setContent("Please save or cancel unsaved changes before selecting another Database.");
_1520.show();
setTimeout(function(){
dijit.byId("database_config_accordion").selectChild(_151f);
},500);
return;
}
pion.databases.selected_pane=pane;
console.debug("Fetching item ",pane.uuid);
var store=pion.databases.config_store;
store.fetch({query:{"@id":pane.uuid},onItem:function(item){
console.debug("item: ",item);
pane.populateFromConfigItem(item);
},onError:pion.handleFetchError});
var _1523=dijit.byId("database_config_accordion").duration;
setTimeout(function(){
dojo.style(pane.containerNode,"overflow","hidden");
pion.databases._adjustAccordionSize();
},_1523+50);
};
dojo.subscribe("database_config_accordion-selectChild",_paneSelected);
pion.databases.createNewPaneFromItem=function(item){
var title=pion.databases.config_store.getValue(item,"Name");
var _1526=pion.databases.config_store.getValue(item,"Plugin");
var _1527=document.createElement("span");
var _1528="plugins.databases."+_1526+"Pane";
var _1529=dojo.getObject(_1528);
if(_1529){
console.debug("found class ",_1528);
var _152a=new _1529({"class":"database_pane",title:title},_1527);
}else{
console.debug("class ",_1528," not found; using plugins.databases.DatabasePane instead.");
var _152a=new plugins.databases.DatabasePane({"class":"database_pane",title:title},_1527);
}
_152a.config_item=item;
_152a.uuid=pion.databases.config_store.getValue(item,"@id");
dijit.byId("database_config_accordion").addChild(_152a);
return _152a;
};
pion.databases.createNewPaneFromStore=function(id,_152c){
pion.databases.config_store.fetch({query:{"@id":id},onItem:function(item){
var _152e=pion.databases.createNewPaneFromItem(item);
if(_152c){
pion.databases._adjustAccordionSize();
dijit.byId("database_config_accordion").selectChild(_152e);
}
},onError:pion.handleFetchError});
};
function _isDuplicateDatabaseId(id){
var _1530=dijit.byId("database_config_accordion").getChildren();
for(var i=0;i<_1530.length;++i){
if(pion.databases.config_store.getValue(_1530[i].config_item,"@id")==id){
return true;
}
}
return false;
};
function _isDuplicateDatabaseName(name){
var _1533=dijit.byId("database_config_accordion").getChildren();
for(var i=0;i<_1533.length;++i){
if(_1533[i].title==name){
return true;
}
}
return false;
};
function _addNewDatabase(){
var _1535=new plugins.databases.SelectPluginDialog({title:"Select Database Plugin"});
_1535.show();
_1535.execute=function(_1536){
console.debug(_1536);
_initNewDatabase(_1536["Plugin"]);
};
};
function _initNewDatabase(_1537){
var title="Add New "+_1537;
var _1539="plugins.databases."+_1537+"InitDialog";
var _153a=dojo.getObject(_1539);
if(_153a){
console.debug("found class ",_1539);
var _153b=new _153a({title:title});
}else{
console.debug("class ",_1539," not found; using plugins.databases.DatabaseInitDialog instead.");
var _153b=new plugins.databases.DatabaseInitDialog({title:title});
}
_153b.setValues({Plugin:_1537});
setTimeout(function(){
dojo.query("input",_153b.domNode)[0].select();
},500);
_153b.show();
_153b.execute=function(_153c){
console.debug(_153c);
var _153d="<PionConfig><Database>";
for(var tag in _153c){
console.debug("dialogFields[",tag,"] = ",_153c[tag]);
_153d+="<"+tag+">"+_153c[tag]+"</"+tag+">";
}
if(this._insertCustomData){
this._insertCustomData();
}
_153d+="</Database></PionConfig>";
console.debug("post_data: ",_153d);
dojo.rawXhrPost({url:"/config/databases",contentType:"text/xml",handleAs:"xml",postData:_153d,load:function(_153f){
var node=_153f.getElementsByTagName("Database")[0];
var id=node.getAttribute("id");
console.debug("id (from server): ",id);
pion.databases.createNewPaneFromStore(id,true);
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_153d})});
};
};
dojo.connect(dojo.byId("add_new_database_button"),"click",_addNewDatabase);
};
}
if(!dojo._hasResource["plugins.reactors.DatabaseOutputReactor"]){
dojo._hasResource["plugins.reactors.DatabaseOutputReactor"]=true;
dojo.provide("plugins.reactors.DatabaseOutputReactor");
dojo.declare("plugins.reactors.DatabaseOutputReactor",[plugins.reactors.Reactor],{postCreate:function(){
this.config.Plugin="DatabaseOutputReactor";
this.inherited("postCreate",arguments);
this.special_config_elements.push("Field");
var store=pion.reactors.config_store;
var _this=this;
this.field_mapping_table=[];
store.fetch({query:{"@id":this.config["@id"]},onItem:function(item){
var _1545=store.getValues(item,"Field");
for(var i=0;i<_1545.length;++i){
var row=[];
row[0]=store.getValue(_1545[i],"text()");
row[1]=store.getValue(_1545[i],"@term");
_this.field_mapping_table.push(row);
}
},onError:pion.handleFetchError});
},_insertCustomData:function(){
for(var i=0;i<this.field_mapping_table.length;++i){
var row=this.field_mapping_table[i];
console.debug("frag: <Field term=\""+row[1]+"\">"+row[0]+"</Field>");
this.put_data+="<Field term=\""+row[1]+"\">"+row[0]+"</Field>";
}
}});
plugins.reactors.DatabaseOutputReactor.label="Embedded Storage Reactor";
dojo.declare("plugins.reactors.DatabaseOutputReactorInitDialog",[plugins.reactors.ReactorInitDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Database Output Reactor Initialization</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Database:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.FilteringSelect\" name=\"Database\" store=\"pion.databases.config_store\" searchAttr=\"Name\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Table:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Table\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t></div>\r\n\t<div dojoAttachPoint=\"grid\" dojoType=\"dojox.Grid\" model=\"plugins.reactors.DatabaseOutputReactorDialog.grid_model\"\r\n\t\t structure=\"plugins.reactors.DatabaseOutputReactorDialog.grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<button dojoAttachPoint=\"add_new_term_button\" dojoType=dijit.form.Button dojoAttachEvent=\"onClick: _handleAddNewTerm\" class=\"add_new_row\">ADD NEW TERM</button>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick: tryConfig\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.plugin="DatabaseOutputReactor";
this.inherited("postCreate",arguments);
_this=this;
plugins.reactors.DatabaseOutputReactorDialog.grid_model.setData([]);
var grid=this.grid;
dojo.connect(grid,"onCellClick",grid,this._handleCellClick);
setTimeout(function(){
grid.update();
grid.resize();
},200);
},_handleCellClick:function(e){
console.debug("e.rowIndex = ",e.rowIndex,", e.cellIndex = ",e.cellIndex);
if(e.cellIndex==2){
console.debug("Removing row ",e.rowIndex);
this.removeSelectedRows();
}
},_handleAddNewTerm:function(){
this.grid.addRow([]);
},_insertCustomData:function(){
var _154c=plugins.reactors.DatabaseOutputReactorDialog.grid_model.getRowCount();
for(var i=0;i<_154c;++i){
var row=plugins.reactors.DatabaseOutputReactorDialog.grid_model.getRow(i);
console.debug("frag: <Field term=\""+row[1]+"\">"+row[0]+"</Field>");
this.post_data+="<Field term=\""+row[1]+"\">"+row[0]+"</Field>";
}
}});
dojo.declare("plugins.reactors.DatabaseOutputReactorDialog",[plugins.reactors.ReactorDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Database Output Reactor Configuration</span>\r\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\">\r\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" class=\"id_text_box\" disabled=\"true\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Database:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.FilteringSelect\" name=\"Database\" store=\"pion.databases.config_store\" searchAttr=\"Name\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Table:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Table\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Queue Size:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"QueueSize\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Queue Timeout:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"QueueTimeout\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t></div>\r\n\t<div dojoAttachPoint=\"grid\" dojoType=\"dojox.Grid\" model=\"plugins.reactors.DatabaseOutputReactorDialog.grid_model\"\r\n\t\t structure=\"plugins.reactors.DatabaseOutputReactorDialog.grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<button dojoAttachPoint=\"add_new_term_button\" dojoType=dijit.form.Button dojoAttachEvent=\"onClick: _handleAddNewTerm\" class=\"add_new_row\">ADD NEW TERM</button>\r\n\t<h3>Input Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_inputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_inputs_grid_model\"\r\n\t\t structure=\"reactor_inputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<h3>Output Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_outputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_outputs_grid_model\"\r\n\t\t structure=\"reactor_outputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"delete\">Delete Reactor</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
var _this=this;
this.reactor.field_mapping_table=[];
var store=pion.reactors.config_store;
store.fetch({query:{"@id":this.reactor.config["@id"]},onItem:function(item){
var _1552=store.getValues(item,"Field");
for(var i=0;i<_1552.length;++i){
var row=[];
row[0]=store.getValue(_1552[i],"text()");
row[1]=store.getValue(_1552[i],"@term");
console.debug("row = ",row);
_this.reactor.field_mapping_table.push(row);
}
plugins.reactors.DatabaseOutputReactorDialog.grid_model.setData(_this.reactor.field_mapping_table);
var grid=_this.grid;
dojo.connect(grid,"onCellClick",grid,_this._handleCellClick);
setTimeout(function(){
grid.update();
grid.resize();
},200);
},onError:pion.handleFetchError});
},_handleCellClick:function(e){
console.debug("e.rowIndex = ",e.rowIndex,", e.cellIndex = ",e.cellIndex);
if(e.cellIndex==2){
console.debug("Removing row ",e.rowIndex);
this.removeSelectedRows();
}
},_handleAddNewTerm:function(){
this.grid.addRow([]);
},_insertCustomData:function(){
var _1557=plugins.reactors.DatabaseOutputReactorDialog.grid_model.getRowCount();
for(var i=0;i<_1557;++i){
var row=plugins.reactors.DatabaseOutputReactorDialog.grid_model.getRow(i);
console.debug("frag: <Field term=\""+row[1]+"\">"+row[0]+"</Field>");
this.put_data+="<Field term=\""+row[1]+"\">"+row[0]+"</Field>";
}
}});
plugins.reactors.DatabaseOutputReactorDialog.grid_model=new dojox.grid.data.Table(null,[]);
plugins.reactors.DatabaseOutputReactorDialog.grid_layout=[{rows:[[{name:"Field Name",styles:"",width:"auto",editor:dojox.grid.editors.Input},{name:"Term",styles:"",editor:dojox.grid.editors.Dijit,editorClass:"dijit.form.FilteringSelect",editorProps:{store:pion.terms.store,searchAttr:"id",keyAttr:"id"},width:"auto"},{name:"Delete",styles:"align: center;",width:3,value:"<button dojoType=dijit.form.Button class=\"delete_row\"><img src=\"images/icon-delete.png\" alt=\"DELETE\" border=\"0\" /></button>"},]]}];
}
if(!dojo._hasResource["pion.reactors"]){
dojo._hasResource["pion.reactors"]=true;
dojo.provide("pion.reactors");
var STEP=10;
var minimum_workspace_width=2000;
var minimum_workspace_height=2000;
var latest_event=null;
var workspace_boxes=[];
var surface=null;
var new_workspace_tab_clicked=false;
var workspaces_by_name={};
var reactor_config_store;
pion.reactors.workspace_box=null;
pion.reactors.reactors_by_id={};
pion.reactors.filter_reactor_grid_model=new dojox.grid.data.Table(null,[]);
pion.reactors.transform_reactor_comparison_grid_model=new dojox.grid.data.Table(null,[]);
pion.reactors.transform_reactor_transformation_grid_model=new dojox.grid.data.Table(null,[]);
pion.reactors.reactor_inputs_grid_model=new dojox.grid.data.Table(null,[]);
pion.reactors.reactor_outputs_grid_model=new dojox.grid.data.Table(null,[]);
pion.reactors.config_store=null;
pion.reactors.comparison_type_store=new dojo.data.ItemFileReadStore({url:"/resources/comparisonTypes.json"});
pion.reactors.generic_comparison_types=[];
pion.reactors.categories={};
pion.reactors.getHeight=function(){
return dojo.byId("outer").clientHeight-150;
};
pion.reactors.init=function(){
pion.reactors.initProtocols();
dijit.byId("main_stack_container").resize({h:pion.reactors.getHeight()});
var _155a=dijit.byId("ops_toggle_button");
dojo.connect(_155a.domNode,"click",function(){
if(_155a.checked){
dojo.addClass(dojo.byId("counterBackground"),"hidden");
}else{
dojo.removeClass(dojo.byId("counterBackground"),"hidden");
}
});
var _155b=function(item,hint){
var node=dojo.doc.createElement("div");
node.id=dojo.dnd.getUniqueId();
node.className="dojoDndItem";
node.setAttribute("reactor_type",item.reactor_type);
var _155f=dojo.doc.createElement("img");
node.appendChild(_155f);
_155f.setAttribute("src",item.src);
_155f.setAttribute("width",148);
_155f.setAttribute("height",25);
_155f.setAttribute("alt",item.alt);
return {node:node,data:item,type:["reactor"]};
};
var _1560={collection:collectionReactors,processing:processingReactors,storage:storageReactors};
for(var _1561 in _1560){
_1560[_1561].creator=_155b;
}
var store=pion.reactors.comparison_type_store;
store.fetch({query:{category:"generic"},onItem:function(item){
pion.reactors.generic_comparison_types.push(store.getValue(item,"name"));
}});
var _1564=new dojox.data.XmlStore({url:"/config/reactors/plugins"});
dojo.xhrGet({url:"/config/plugins",handleAs:"xml",timeout:5000,load:function(_1565,_1566){
pion.available_plugins=[];
var _1567=_1565.getElementsByTagName("Plugin");
dojo.forEach(_1567,function(n){
pion.available_plugins.push(dojo.isIE?n.childNodes[0].nodeValue:n.textContent);
});
_1564.fetch({onItem:function(item){
var _156a=_1564.getValue(item,"Plugin").toString();
if(dojo.indexOf(pion.available_plugins,_156a)!=-1){
var _156b=_1564.getValue(item,"ReactorType").toString();
var _156c="plugins.reactors."+_156a;
var _156d=dojo.getObject(_156c);
if(!_156d){
var path="/plugins/reactors/"+_156b+"/"+_156a+"/"+_156a;
dojo.registerModulePath(_156c,path);
dojo.requireIf(true,_156c);
_156d=dojo.getObject(_156c);
}
pion.reactors.categories[_156a]=_156b;
var icon=_156b+"/"+_156a+"/icon.png";
var _1570=dojo.moduleUrl("plugins.reactors",icon);
console.debug("icon_url = ",_1570);
_1560[_156b].insertNodes(false,[{reactor_type:_156a,src:_1570,alt:_156d["label"]}]);
}
},onComplete:function(){
pion.reactors.initConfiguredReactors();
}});
return _1565;
},error:pion.handleXhrGetError});
dojo.query(".dijitTab")[0].id="create_new_workspace_tab";
dojo.connect(window,"onresize",expandWorkspaceIfNeeded);
dojo.connect(document,"onkeypress",handleKeyPress);
dojo.connect(dijit.byId("mainTabContainer").tablist,"onButtonClick",function(){
if(new_workspace_tab_clicked){
pion.reactors.reselectCurrentWorkspace();
new_workspace_tab_clicked=false;
}
});
if(!file_protocol){
var _1571=0;
var _1572=0;
setInterval(function(){
if(!_155a.checked){
dojo.xhrGet({url:"/config/reactors/stats",preventCache:true,handleAs:"xml",timeout:1000,load:function(_1573,_1574){
var node=_1573.getElementsByTagName("TotalOps")[0];
var _1576=parseInt(dojo.isIE?node.xml.match(/.*>(\d*)<.*/)[1]:node.textContent);
var delta=_1576-_1571;
dojo.byId("global_ops").innerHTML=delta>0?delta:0;
_1571=_1576;
var _1578=0;
var _1579=_1573.getElementsByTagName("Reactor");
dojo.forEach(_1579,function(n){
var id=n.getAttribute("id");
var _157c=pion.reactors.reactors_by_id[id];
if(_157c){
if(_157c.workspace==pion.reactors.workspace_box){
var _157d=n.getElementsByTagName("EventsIn")[0];
var _157e=dojo.isIE?_157d.xml.match(/.*>(\d*)<.*/)[1]:_157d.textContent;
var _157f=parseInt(_157e);
_157c.ops_per_sec.innerHTML=_157f-_157c.prev_events_in;
_157c.prev_events_in=_157f;
_1578+=_157f;
}
var _1580=n.getElementsByTagName("Running")[0];
var _1581=dojo.isIE?_1580.xml.match(/.*>(\w*)<.*/)[1]:_1580.textContent;
var _1582=(_1581=="true");
_157c.run_button.attr("checked",_1582);
}
});
delta=_1578-_1572;
dojo.byId("workspace_ops").innerHTML=delta>0?delta:0;
_1572=_1578;
return _1573;
},error:pion.handleXhrGetError});
}
},1000);
}
};
pion.reactors.initProtocols=function(){
pion.protocols_config_store=new dojox.data.XmlStore({url:"/config/protocols"});
pion.protocols_config_store.fetchItemByIdentity=function(_1583){
pion.protocols_config_store.fetch({query:{"@id":_1583.identity},onItem:_1583.onItem,onError:pion.handleFetchError});
};
pion.protocols_config_store.getIdentity=function(item){
return pion.protocols_config_store.getValue(item,"@id");
};
pion.protocol_ids_by_name={};
pion.protocols_config_store.fetch({onItem:function(item){
pion.protocol_ids_by_name[pion.protocols_config_store.getValue(item,"Name")]=pion.protocols_config_store.getIdentity(item);
},onError:pion.handleFetchError});
};
pion.reactors.initConfiguredReactors=function(){
if(file_protocol){
addWorkspace();
pion.reactors.workspace_box=workspace_boxes[0];
surface=pion.reactors.workspace_box.my_surface;
dijit.byId("mainTabContainer").selectChild(pion.reactors.workspace_box.my_content_pane);
}else{
reactor_config_store=new dojox.data.XmlStore({url:"/config/reactors"});
pion.reactors.config_store=reactor_config_store;
reactor_config_store.fetch({query:{tagName:"Reactor"},onItem:function(item,_1587){
console.debug("fetched Reactor with id = ",reactor_config_store.getValue(item,"@id"));
var _1588={};
var _1589=reactor_config_store.getAttributes(item);
for(var i=0;i<_1589.length;++i){
if(_1589[i]!="tagName"&&_1589[i]!="childNodes"){
_1588[_1589[i]]=reactor_config_store.getValue(item,_1589[i]).toString();
}
}
pion.reactors.createReactorInConfiguredWorkspace(_1588);
},onComplete:function(items,_158c){
console.debug("done fetching Reactors");
reactor_config_store.fetch({query:{tagName:"Connection"},onItem:function(item,_158e){
pion.reactors.createConnection(reactor_config_store.getValue(item,"From").toString(),reactor_config_store.getValue(item,"To").toString(),reactor_config_store.getValue(item,"@id").toString());
},onComplete:function(items,_1590){
console.debug("done fetching Connections");
if(workspace_boxes.length==0){
addWorkspace();
}
pion.reactors.workspace_box=workspace_boxes[0];
surface=pion.reactors.workspace_box.my_surface;
dijit.byId("mainTabContainer").selectChild(pion.reactors.workspace_box.my_content_pane);
dijit.byId("main_stack_container").layout();
},onError:pion.handleFetchError});
},onError:pion.handleFetchError});
}
};
pion.reactors.createReactorInConfiguredWorkspace=function(_1591){
pion.reactors.workspace_box=workspaces_by_name[_1591.Workspace];
if(!pion.reactors.workspace_box){
addWorkspace(_1591.Workspace);
}
var _1592=pion.reactors.workspace_box;
dijit.byId("mainTabContainer").selectChild(_1592.my_content_pane);
var _1593=document.createElement("div");
_1592.node.appendChild(_1593);
var _1594=pion.reactors.createReactor(_1591,_1593);
pion.reactors.reactors_by_id[_1591["@id"]]=_1594;
_1594.workspace=_1592;
_1592.reactors.push(_1594);
console.debug("X, Y = ",_1591.X,", ",_1591.Y);
};
pion.reactors.createConnection=function(_1595,_1596,_1597){
var _1598=pion.reactors.reactors_by_id[_1595];
var _1599=pion.reactors.reactors_by_id[_1596];
pion.reactors.workspace_box=_1598.workspace;
var _159a=pion.reactors.workspace_box;
surface=_159a.my_surface;
dijit.byId("mainTabContainer").selectChild(_159a.my_content_pane);
var line=surface.createPolyline().setStroke("black");
pion.reactors.updateConnectionLine(line,_1598.domNode,_1599.domNode);
_1598.reactor_outputs.push({sink:_1599,line:line,id:_1597});
_1599.reactor_inputs.push({source:_1598,line:line,id:_1597});
};
pion.reactors.reselectCurrentWorkspace=function(){
dijit.byId("mainTabContainer").selectedChildWidget=undefined;
dijit.byId("mainTabContainer").selectChild(pion.reactors.workspace_box.my_content_pane);
};
function addWorkspace(name){
var i=workspace_boxes.length;
if(name){
var title=name;
}else{
var title="Workspace "+(i+1);
for(var j=i+2;isDuplicateWorkspaceName(null,title);++j){
title="Workspace "+j;
}
}
var _15a0=new dijit.layout.ContentPane({"class":"workspacePane",title:title,style:"overflow: auto"});
var _15a1=dijit.byId("mainTabContainer");
var _15a2=dojo.marginBox(_15a1.domNode);
console.debug("margin_box = dojo.marginBox(tab_container.domNode) = ",_15a2);
var shim=document.createElement("div");
if(_15a2.w<minimum_workspace_width){
shim.style.width=minimum_workspace_width+"px";
}else{
shim.style.width=(_15a2.w-4)+"px";
}
if(_15a2.h<minimum_workspace_height){
shim.style.height=minimum_workspace_height+"px";
}
_15a0.domNode.appendChild(shim);
_15a1.addChild(_15a0,i);
var _15a4=new dojo.dnd.Target(shim,{accept:["reactor"]});
dojo.addClass(_15a4.node,"workspaceTarget");
dojo.connect(_15a4,"onDndDrop",function(_15a5,nodes,copy,_15a8){
pion.reactors.handleDropOnWorkspace(_15a5,nodes,copy,_15a4);
});
dojo.connect(_15a4.node,"onmouseup",updateLatestMouseUpEvent);
_15a4.my_content_pane=_15a0;
_15a4.onEmpty=function(_15a9){
};
_15a0.my_workspace_box=_15a4;
workspaces_by_name[title]=_15a4;
workspace_boxes[i]=_15a4;
_15a1.selectChild(_15a0);
_15a4.node.style.width=_15a4.node.offsetWidth+"px";
var _15aa=dojo.marginBox(_15a4.node);
_15aa.h-=6;
console.debug("surface_box = ",_15aa);
_15a4.my_surface=dojox.gfx.createSurface(_15a4.node,_15aa.w,_15aa.h);
_15a4.reactors=[];
_15a4.isTracking=false;
if(!firefox_on_mac){
var menu=new dijit.Menu({targetNodeIds:[_15a0.controlButton.domNode,_15a4.node]});
menu.addChild(new dijit.MenuItem({label:"Edit workspace configuration",onClick:function(){
showWorkspaceConfigDialog(_15a0);
}}));
menu.addChild(new dijit.MenuItem({label:"Delete workspace",onClick:function(){
deleteWorkspaceIfConfirmed(_15a0);
}}));
}
_15a4.node.ondblclick=function(){
showWorkspaceConfigDialog(_15a0);
};
_15a0.controlButton.domNode.ondblclick=function(){
showWorkspaceConfigDialog(_15a0);
};
};
function makeScrollHandler(_15ac){
var _pane=_15ac;
var _node=_15ac.domNode;
return function(){
if(_pane.isScrolling){
return;
}
_pane.isScrolling=true;
var _15af=function(){
_pane.isScrolling=false;
if(_node.scrollLeft>_pane.prevScrollLeft){
_node.scrollLeft+=STEP-_node.scrollLeft%STEP;
}else{
_node.scrollLeft-=_node.scrollLeft%STEP;
}
if(_pane.prevScrollTop>_node.scrollTop){
_node.scrollTop+=STEP-_node.scrollTop%STEP;
}else{
if(_node.scrollTop<=STEP){
_node.scrollTop=0;
}else{
_node.scrollTop-=_node.scrollTop%STEP;
}
}
_pane.prevScrollLeft=_node.scrollLeft;
_pane.prevScrollTop=_node.scrollTop;
};
setTimeout(_15af,0);
};
};
function updateLatestMouseUpEvent(e){
latest_event=e;
console.debug("e = ",e);
pion.reactors.last_x=e.clientX;
pion.reactors.last_y=e.clientY;
};
pion.reactors.getNearbyGridPointInBox=function(_15b1,_15b2){
var c=_15b1;
c.l+=STEP-1;
c.l-=c.l%STEP;
c.t+=STEP-1;
c.t-=c.t%STEP;
var _15b4={};
_15b4.l=_15b2.l<c.l?c.l:c.r<_15b2.l?c.r:_15b2.l;
_15b4.t=_15b2.t<c.t?c.t:c.b<_15b2.t?c.b:_15b2.t;
_15b4.l-=_15b4.l%STEP;
_15b4.t-=_15b4.t%STEP;
return _15b4;
};
pion.reactors.updateConnectionLine=function(poly,_15b6,_15b7){
var x1=_15b6.offsetLeft+_15b6.offsetWidth/2;
var y1=_15b6.offsetTop+_15b6.offsetHeight/2;
if(_15b7.offsetTop>y1){
var x2=_15b7.offsetLeft+_15b7.offsetWidth/2;
var y2=_15b7.offsetTop;
var a1={x:x2-5,y:y2-5};
var a2={x:x2+5,y:y2-5};
}else{
if(_15b7.offsetTop+_15b7.offsetHeight<y1){
var x2=_15b7.offsetLeft+_15b7.offsetWidth/2;
var y2=_15b7.offsetTop+_15b7.offsetHeight;
var a1={x:x2-5,y:y2+5};
var a2={x:x2+5,y:y2+5};
}else{
if(_15b7.offsetLeft>x1){
var x2=_15b7.offsetLeft;
var y2=y1;
var a1={x:x2-5,y:y2-5};
var a2={x:x2-5,y:y2+5};
}else{
var x2=_15b7.offsetLeft+_15b7.offsetWidth;
var y2=y1;
var a1={x:x2+5,y:y2-5};
var a2={x:x2+5,y:y2+5};
}
}
}
poly.setShape([{x:x1,y:y1},{x:x2,y:y1},{x:x2,y:y2},a1,{x:x2,y:y2},a2]).setStroke("black");
};
pion.reactors.createReactor=function(_15be,node){
plugin_class_name="plugins.reactors."+_15be.Plugin;
var _15c0=dojo.getObject(plugin_class_name);
if(_15c0){
console.debug("found class ",plugin_class_name);
var _15c1=new _15c0({config:_15be},node);
}else{
console.debug("class ",plugin_class_name," not found; using plugins.reactors.Reactor instead.");
var _15c1=new plugins.reactors.Reactor({config:_15be},node);
}
return _15c1;
};
pion.reactors.handleDropOnWorkspace=function(_15c2,nodes,copy,_15c5){
console.debug("handleDropOnWorkspace called, target.node = ",_15c5.node,", workspace_box.node = ",pion.reactors.workspace_box.node);
dojo.query(".dojoDndItem",pion.reactors.workspace_box.node).forEach(function(n){
if(n.getAttribute("dndType")=="connector"){
console.debug("Removing ",n);
pion.reactors.workspace_box.node.removeChild(n);
}
});
if(!_15c5.checkAcceptance(_15c2,nodes)){
return;
}
if(_15c5!=pion.reactors.workspace_box){
return;
}
var _15c7=nodes[0].getAttribute("reactor_type");
var _15c8="plugins.reactors."+_15c7+"InitDialog";
console.debug("dialog_class_name: ",_15c8);
var _15c9=dojo.getObject(_15c8);
if(_15c9){
var _15ca=new _15c9();
}else{
var _15ca=new plugins.reactors.ReactorInitDialog({title:_15c7+" Initialization",plugin:_15c7});
}
setTimeout(function(){
dojo.query("input",_15ca.domNode)[0].select();
},500);
dojo.query(".dijitButton.cancel",_15ca.domNode).forEach(function(n){
dojo.connect(n,"click",_15ca,"onCancel");
});
_15ca.show();
};
pion.reactors.handleDropOnReactor=function(_15cc,nodes,copy,_15cf){
var _15d0=pion.reactors.workspace_box;
console.debug("handleDropOnReactor called, target.node.getAttribute(\"reactor_type\") = ",_15cf.node.getAttribute("reactor_type"));
if(!_15cf.node.getAttribute("reactor_type")){
return;
}
dojo.query(".dojoDndItem",_15cf.node).forEach(function(n){
_15cf.node.removeChild(n);
});
if(_15d0.isTracking){
return;
}
console.debug("nodes[0].getAttribute(\"dndType\") = ",nodes[0].getAttribute("dndType"));
console.debug("nodes[0].getAttribute(\"reactor_type\") = ",nodes[0].getAttribute("reactor_type"));
if(nodes[0].getAttribute("dndType")!="connector"){
console.debug("returning because nodes[0].getAttribute(\"dndType\") != \"connector\"");
return;
}
_15d0.isTracking=true;
var x1=_15cf.node.offsetLeft+_15cf.node.offsetWidth;
var y1=_15cf.node.offsetTop+_15cf.node.offsetHeight/2;
console.debug("x1 = ",x1,", y1 = ",y1);
_15d0.trackLine=surface.createPolyline([{x:x1,y:y1},{x:x1+20,y:y1},{x:x1+15,y:y1-5},{x:x1+20,y:y1},{x:x1+15,y:y1+5}]).setStroke("black");
var _15d4=dojo.byId("reactor_config_content").offsetLeft;
var _15d5=dojo.byId("reactor_config_content").offsetTop;
_15d5+=dojo.byId("reactor_config").offsetTop;
console.debug("xOffset = ",_15d4,", yOffset = ",_15d5);
mouseConnection=dojo.connect(_15d0.node,"onmousemove",function(event){
var x2=event.clientX-_15d4;
var y2=event.clientY-_15d5;
_15d0.trackLine.setShape([{x:x1,y:y1},{x:x2,y:y1},{x:x2,y:y2}]);
});
console.debug("created mouseConnection");
wrapperWithStartpoint=function(event){
dojo.disconnect(mouseConnection);
console.debug("disconnected mouseConnection");
_15d0.trackLine.removeShape();
handleSelectionOfConnectorEndpoint(event,_15cf.node);
};
dojo.query(".moveable").filter(function(n){
return n!=_15cf.node;
}).forEach("item.onClickHandler = dojo.connect(item, 'click', wrapperWithStartpoint)");
};
function handleSelectionOfConnectorEndpoint(event,_15dc){
pion.reactors.workspace_box.isTracking=false;
console.debug("handleSelectionOfConnectorEndpoint: event = ",event);
var _15dd=dijit.byNode(_15dc);
console.debug("source_reactor = ",_15dd);
var _15de=dijit.byNode(event.target);
if(!_15de){
_15de=dijit.byNode(event.target.parentNode);
}
console.debug("sink_reactor = ",_15de);
dojo.query(".moveable").forEach("dojo.disconnect(item.onClickHandler)");
var _15df="<PionConfig><Connection><Type>reactor</Type>"+"<From>"+_15dd.config["@id"]+"</From>"+"<To>"+_15de.config["@id"]+"</To>"+"</Connection></PionConfig>";
dojo.rawXhrPost({url:"/config/connections",contentType:"text/xml",handleAs:"xml",postData:_15df,load:function(_15e0){
var node=_15e0.getElementsByTagName("Connection")[0];
var id=node.getAttribute("id");
console.debug("connection id (from server): ",id);
var line=surface.createPolyline().setStroke("black");
pion.reactors.updateConnectionLine(line,_15dd.domNode,_15de.domNode);
_15dd.reactor_outputs.push({sink:_15de,line:line,id:id});
_15de.reactor_inputs.push({source:_15dd,line:line,id:id});
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_15df})});
};
pion.reactors.showReactorConfigDialog=function(_15e4){
var _15e5="plugins.reactors."+_15e4.config.Plugin+"Dialog";
console.debug("dialog_class_name = ",_15e5);
var _15e6=dojo.getObject(_15e5);
if(_15e6){
var _15e7=new _15e6({reactor:_15e4});
}else{
var _15e7=new plugins.reactors.ReactorDialog({title:_15e4.config.Plugin+" Configuration",reactor:_15e4});
}
_15e7.setValues(_15e4.config);
var _15e8=[];
for(var i=0;i<_15e4.reactor_inputs.length;++i){
var _15ea=[];
_15ea[0]=_15e4.reactor_inputs[i].source.config.Name;
_15ea[1]=_15e4.reactor_inputs[i].id;
_15e8.push(_15ea);
}
pion.reactors.reactor_inputs_grid_model.setData(_15e8);
var _15eb=_15e7.reactor_inputs_grid;
setTimeout(function(){
_15eb.update();
_15eb.resize();
},200);
dojo.connect(_15eb,"onCellClick",function(e){
console.debug("e.rowIndex = ",e.rowIndex,", e.cellIndex = ",e.cellIndex);
if(e.cellIndex==2){
console.debug("Removing connection in row ",e.rowIndex);
var _15ed=_15e4.reactor_inputs[e.rowIndex];
dojo.xhrDelete({url:"/config/connections/"+_15ed.id,handleAs:"xml",timeout:5000,load:function(_15ee,_15ef){
console.debug("xhrDelete for url = /config/connections/",_15ed.id,"; HTTP status code: ",_15ef.xhr.status);
_15eb.removeSelectedRows();
var _15f0=_15ed.source;
_15ed.line.removeShape();
_15e4.reactor_inputs.splice(e.rowIndex,1);
for(var j=0;j<_15f0.reactor_outputs.length;++j){
if(_15f0.reactor_outputs[j].sink==_15e4){
_15f0.reactor_outputs.splice(j,1);
break;
}
}
return _15ee;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
}
});
var _15f2=[];
for(var i=0;i<_15e4.reactor_outputs.length;++i){
var _15f3=[];
_15f3[0]=_15e4.reactor_outputs[i].sink.config.Name;
_15f3[1]=_15e4.reactor_outputs[i].id;
_15f2.push(_15f3);
}
pion.reactors.reactor_outputs_grid_model.setData(_15f2);
var _15f4=_15e7.reactor_outputs_grid;
setTimeout(function(){
_15f4.update();
_15f4.resize();
},200);
dojo.connect(_15f4,"onCellClick",function(e){
console.debug("e.rowIndex = ",e.rowIndex,", e.cellIndex = ",e.cellIndex);
if(e.cellIndex==2){
console.debug("Removing connection in row ",e.rowIndex);
var _15f6=_15e4.reactor_outputs[e.rowIndex];
dojo.xhrDelete({url:"/config/connections/"+_15f6.id,handleAs:"xml",timeout:5000,load:function(_15f7,_15f8){
console.debug("xhrDelete for url = /config/connections/",_15f6.id,"; HTTP status code: ",_15f8.xhr.status);
_15f4.removeSelectedRows();
var _15f9=_15f6.sink;
_15f6.line.removeShape();
_15e4.reactor_outputs.splice(e.rowIndex,1);
for(var j=0;j<_15f9.reactor_inputs.length;++j){
if(_15f9.reactor_inputs[j].source==_15e4){
_15f9.reactor_inputs.splice(j,1);
break;
}
}
return _15f7;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
}
});
dojo.query(".dijitComboBox[name='event_type']",_15e7.domNode).forEach(function(n){
dijit.byNode(n).setValue(_15e4.event_type||1);
});
dojo.query(".dijitButton.delete",_15e7.domNode).forEach(function(n){
dojo.connect(n,"click",function(){
_15e7.onCancel();
pion.reactors.deleteReactorIfConfirmed(_15e4);
});
});
dojo.query(".dijitButton.cancel",_15e7.domNode).forEach(function(n){
dojo.connect(n,"click",_15e7,"onCancel");
});
dojo.query(".dijitButton.save",_15e7.domNode).forEach(function(n){
dijit.byNode(n).onClick=function(){
return _15e7.isValid();
};
});
setTimeout(function(){
dojo.query("input",_15e7.domNode)[0].select();
},500);
_15e7.show();
};
pion.reactors.showXMLDialog=function(_15ff){
window.open("/config/reactors/"+_15ff.config["@id"]);
};
pion.reactors.deleteReactorIfConfirmed=function(_1600){
var _1601=dijit.byId("delete_confirmation_dialog");
dojo.byId("are_you_sure").innerHTML="Are you sure you want to delete this reactor?";
dojo.byId("confirm_delete").onclick=function(){
_1601.onCancel();
deleteReactor(_1600);
};
dojo.byId("cancel_delete").onclick=function(){
_1601.onCancel();
};
_1601.show();
setTimeout("dijit.byId('cancel_delete').focus()",500);
};
function deleteReactor(_1602){
console.debug("deleting ",_1602.config.Name);
dojo.xhrDelete({url:"/config/reactors/"+_1602.config["@id"],handleAs:"xml",timeout:5000,load:function(_1603,_1604){
console.debug("xhrDelete for url = /config/reactors/",_1602.config["@id"],"; HTTP status code: ",_1604.xhr.status);
for(var i=0;i<_1602.reactor_inputs.length;++i){
var _1606=_1602.reactor_inputs[i].source;
_1602.reactor_inputs[i].line.removeShape();
for(var j=0;j<_1606.reactor_outputs.length;++j){
if(_1606.reactor_outputs[j].sink==_1602){
_1606.reactor_outputs.splice(j,1);
}
}
}
for(var i=0;i<_1602.reactor_outputs.length;++i){
var _1608=_1602.reactor_outputs[i].sink;
_1602.reactor_outputs[i].line.removeShape();
for(var j=0;j<_1608.reactor_inputs.length;++j){
if(_1608.reactor_inputs[j].source==_1602){
_1608.reactor_inputs.splice(j,1);
}
}
}
var _1609=pion.reactors.workspace_box;
_1609.node.removeChild(_1602.domNode);
for(var j=0;j<_1609.reactors.length;++j){
if(_1609.reactors[j]==_1602){
_1609.reactors.splice(j,1);
}
}
if(_1609.reactors.length==0){
_1609.onEmpty(_1609.my_content_pane);
}
return _1603;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
};
function selected(page){
if(page.title=="Add new workspace"){
console.debug("'Add new workspace' tab was selected");
if(new_workspace_tab_clicked){
console.debug("redundant call");
return;
}
new_workspace_tab_clicked=true;
addWorkspace();
return;
}
console.debug("selected "+page.title+", page.id = "+page.id);
pion.reactors.workspace_box=page.my_workspace_box;
surface=pion.reactors.workspace_box.my_surface;
expandWorkspaceIfNeeded();
};
dojo.subscribe("mainTabContainer-selectChild",selected);
function expandWorkspaceIfNeeded(){
if(!surface){
return;
}
var _160b=pion.reactors.workspace_box;
var _160c=_160b.my_content_pane.domNode.offsetWidth;
var _160d=_160b.my_content_pane.domNode.offsetHeight;
_160c-=2;
_160d-=6;
var _160e=surface.getDimensions();
var _160f=parseInt(_160e.width);
var _1610=parseInt(_160e.height);
console.debug("old_width = ",_160f,", new_width = ",_160c,", old_height = ",_1610,", new_height = ",_160d);
if(_160c>_160f){
console.debug("expanding workspace width to ",_160c,"px");
_160b.node.style.width=_160c+"px";
_160e.width=_160c;
}
if(_160d>_1610){
console.debug("expanding workspace height to ",_160d,"px");
_160b.node.style.height=_160d+"px";
_160e.height=_160d;
}
if(_160c>_160f||_160d>_1610){
surface.setDimensions(parseInt(_160e.width)+"px",parseInt(_160e.height)+"px");
}
};
function handleKeyPress(e){
var _1612=pion.reactors.workspace_box;
if(e.keyCode==dojo.keys.ESCAPE){
if(_1612.isTracking){
dojo.disconnect(mouseConnection);
_1612.trackLine.removeShape();
_1612.isTracking=false;
}
}
};
function showWorkspaceConfigDialog(_1613){
console.debug("showWorkspaceConfigDialog: workspace_pane = ",_1613);
console.debug("workspace_pane.title = ",_1613.title);
var _1614=dijit.byId("workspace_name");
_1614.isValid=function(_1615){
if(!this.validator(this.textbox.value,this.constraints)){
this.invalidMessage="Invalid Workspace name";
console.debug("validationTextBox.isValid returned false");
return false;
}
if(isDuplicateWorkspaceName(_1613,this.textbox.value)){
this.invalidMessage="A Workspace with this name already exists";
console.debug("In validationTextBox.isValid, isDuplicateWorkspaceName returned true");
return false;
}
console.debug("validationTextBox.isValid returned true");
return true;
};
_1614.setDisplayedValue(_1613.title);
var _1616=dijit.byId("workspace_dialog");
dojo.query(".dijitButton.delete",_1616.domNode).forEach(function(n){
dojo.connect(n,"click",function(){
_1616.onCancel();
deleteWorkspaceIfConfirmed(_1613);
});
});
dojo.query(".dijitButton.cancel",_1616.domNode).forEach(function(n){
dojo.connect(n,"click",_1616,"onCancel");
});
dojo.query(".dijitButton.save",_1616.domNode).forEach(function(n){
dijit.byNode(n).onClick=function(){
return _1616.isValid();
};
});
setTimeout(function(){
dojo.query("input",_1616.domNode)[0].select();
},500);
_1616.show();
_1616.execute=function(_161a){
updateWorkspaceConfig(_161a,_1613);
};
};
function updateWorkspaceConfig(_161b,node){
node.title=_161b.name;
dojo.byId(node.controlButton.id).innerHTML=_161b.name;
};
function isDuplicateWorkspaceName(_161d,name){
for(var i=0;i<workspace_boxes.length;++i){
if(workspace_boxes[i].my_content_pane!=_161d&&workspace_boxes[i].my_content_pane.title==name){
return true;
}
}
return false;
};
function deleteWorkspaceIfConfirmed(_1620){
if(_1620.my_workspace_box.reactors.length==0){
_deleteEmptyWorkspace(_1620);
return;
}
var _1621=dijit.byId("delete_confirmation_dialog");
dojo.byId("are_you_sure").innerHTML="Are you sure you want to delete workspace '"+_1620.title+"' and all the reactors it contains?";
dojo.byId("confirm_delete").onclick=function(){
_1621.onCancel();
deleteWorkspace(_1620);
};
dojo.byId("cancel_delete").onclick=function(){
_1621.onCancel();
};
_1621.show();
setTimeout("dijit.byId('cancel_delete').focus()",500);
};
function deleteWorkspace(_1622){
var _1623=[];
for(var i=0;i<_1622.my_workspace_box.reactors.length;++i){
_1623[i]=_1622.my_workspace_box.reactors[i];
}
for(i=0;i<_1623.length;++i){
deleteReactor(_1623[i]);
}
dojo.connect(_1622.my_workspace_box,"onEmpty",_deleteEmptyWorkspace);
};
function _deleteEmptyWorkspace(_1625){
console.debug("deleting ",_1625.title);
delete workspaces_by_name[_1625.title];
for(var j=0;j<workspace_boxes.length;++j){
if(workspace_boxes[j]==_1625.my_workspace_box){
workspace_boxes.splice(j,1);
}
}
dijit.byId("mainTabContainer").removeChild(_1625);
};
}
if(!dojo._hasResource["plugins.vocabularies.Vocabulary"]){
dojo._hasResource["plugins.vocabularies.Vocabulary"]=true;
dojo.provide("plugins.vocabularies.Vocabulary");
dojo.declare("plugins.vocabularies.Vocabulary",[],{constructor:function(id,args){
this.id=id;
dojo.mixin(this,args);
plugins.vocabularies.vocabularies_by_id[id]=this;
var store=pion.vocabularies.plugin_data_store;
var _this=this;
store.fetchItemByIdentity({identity:this.Plugin,onItem:function(item){
_this.label=store.getValue(item,"label");
}});
}});
plugins.vocabularies.vocabularies_by_id={};
dojo.declare("plugins.vocabularies.VocabularyInitDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog vocabulary_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Vocabulary Initialization</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t><td><input dojoAttachPoint=\"id_widget\" dojoType=\"dijit.form.ValidationTextBox\" type=\"text\" name=\"@id\"\r\n\t\t\t\t\t regExp=\"\\w+\" required=\"true\"></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoAttachPoint=\"name_widget\" dojoType=\"dijit.form.ValidationTextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t></div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: onCancel\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
var _this=this;
this.id_widget.isValid=function(){
if(!this.validator(this.textbox.value,this.constraints)){
this.invalidMessage="Invalid Vocabulary ID";
return false;
}
if(pion.vocabularies.isDuplicateVocabularyId(this.textbox.value)){
this.invalidMessage="A Vocabulary with this ID already exists";
return false;
}
return true;
};
this.name_widget.isValid=function(){
if(pion.vocabularies.isDuplicateVocabularyName(this.textbox.value)){
this.invalidMessage="A Vocabulary with this name already exists";
return false;
}
return true;
};
}});
dojo.declare("plugins.vocabularies.TermInitDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog vocabulary_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Term Initialization</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.ValidationTextBox\" type=\"text\" name=\"@id\"\r\n\t\t\t\t\t regExp=\"\\w+\" required=\"true\"></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Type:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.FilteringSelect\" name=\"Type\" dojoAttachEvent=\"onChange: _handleTypeChange\"\r\n\t\t\t\t\t\tstore=\"pion.terms.type_store\" searchAttr=\"description\" \r\n\t\t\t\t\t\tautocomplete=\"true\" value=\"1\" style=\"width: 100%;\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Format:</label></td\r\n\t\t\t\t><td><input dojoAttachPoint=\"format_widget\" dojoType=\"dijit.form.ValidationTextBox\" type=\"text\" name=\"Format\" disabled=\"true\" \r\n\t\t\t\t\t regExp=\".*%.*\"></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Size:</label></td\r\n\t\t\t\t><td><input dojoAttachPoint=\"size_widget\" dojoType=\"dijit.form.ValidationTextBox\" type=\"text\" name=\"Size\" disabled=\"true\" \r\n\t\t\t\t\t regExp=\"[1-9][0-9]*\"></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t></div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: onCancel\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,_handleTypeChange:function(type){
console.debug("_handleTypeChange: type = ",type);
if(type=="specific date"||type=="specific time"||type=="specific time & date"){
this.format_widget.attr("disabled",false);
this.format_widget.setValue("%Y");
this.format_widget.domNode.style.visibility="visible";
}else{
this.format_widget.attr("disabled",true);
this.format_widget.setValue("");
this.format_widget.domNode.style.visibility="hidden";
}
if(type=="fixed-length string"){
this.size_widget.attr("disabled",false);
this.size_widget.setValue("1");
this.size_widget.domNode.style.visibility="visible";
}else{
this.size_widget.attr("disabled",true);
this.size_widget.setValue("");
this.size_widget.domNode.style.visibility="hidden";
}
},execute:function(_162e){
var pane=pion.vocabularies.selected_pane;
var _1630={ID:_162e["@id"],Type:_162e.Type,Comment:_162e.Comment};
_1630.Format=_162e.Format?_162e.Format:"-";
_1630.Size=_162e.Size?_162e.Size:"-";
pane.working_store.newItem(_1630);
pane.vocab_grid.model.requestRows();
pane.vocab_grid.update();
pane.vocab_grid.scrollToRow(pane.vocab_grid.model.getRowCount());
pane.markAsChanged();
}});
dojo.declare("plugins.vocabularies.VocabularyPane",[dijit.layout.AccordionPane],{templateString:"<div class='dijitAccordionPane vocab_pane'\r\n\t><div dojoAttachPoint='titleNode,focusNode' dojoAttachEvent='ondijitclick:_onTitleClick,onkeypress:_onTitleKeyPress,onfocus:_handleFocus,onblur:_handleFocus'\r\n\t\tclass='dijitAccordionTitle' wairole=\"tab\"\r\n\t\t><div class='dijitAccordionArrow'></div\r\n\t\t><div class='arrowTextUp' waiRole=\"presentation\">&#9650;</div\r\n\t\t><div class='arrowTextDown' waiRole=\"presentation\">&#9660;</div\r\n\t\t><div dojoAttachPoint='titleTextNode' class='dijitAccordionText'>${title}</div></div\r\n\t><div\r\n\t\t><div dojoAttachPoint='containerNode' style='overflow: hidden; height: 1px; display: none'\r\n\t\t\tclass='dijitAccordionBody' wairole=\"tabpanel\"\r\n\t\t\t><form dojoAttachPoint=\"form\" dojoType=\"dijit.form.Form\"\r\n\t\t\t\t><br/\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"100%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Name</label></td\r\n\t\t\t\t\t\t><td><input dojoAttachPoint=\"name\" dojoType=\"dijit.form.TextBox\" name=\"Name\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td rowspan=\"4\" valign=\"top\" width=\"20\">&nbsp;</td\r\n\t\t\t\t\t\t><td rowspan=\"1\"><label>Comments</label></td\r\n\t\t\t\t\t\t><td rowspan=\"4\" valign=\"top\"><textarea dojoAttachPoint=\"comment\" rows=\"4\" style=\"width: 95%\" name=\"Comment\" class=\"comment\"></textarea></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>ID</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td rowspan=\"3\">&nbsp;</td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Locked</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"checkboxes\" value=\"locked\"/></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><br/\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" style=\"border: 1px solid #999999;\" width=\"99%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td class=\"matrixMainHeader\">Terms</td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td style=\"background-color: #f1f1f1;\"\r\n\t\t\t\t\t\t\t><div class=\"vocab_grid\"\r\n\t\t\t\t\t\t\t\t><div dojoAttachPoint=\"vocab_grid\" dojoType=\"dojox.Grid\"\r\n\t\t\t\t\t\t\t\t\t singleClickEdit=\"true\"></div\r\n\t\t\t\t\t\t\t></div\r\n\t\t\t\t\t\t\t><button dojoType=dijit.form.Button class=\"add_new_row\" dojoAttachPoint=\"add_new_term_button\" dojoAttachEvent=\"onClick:_handleAddNewTerm\">ADD NEW TERM</button\r\n\t\t\t\t\t\t></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><hr noshade=\"noshade\" size=\"1\" color=\"#999999\"\r\n\t\t\t\t><div class=\"save_cancel_delete\"\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick:save\">Save Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick:cancel\">Cancel Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"delete\" dojoAttachEvent=\"onClick:delete2\">Delete Vocabulary</button\r\n\t\t\t\t></div\r\n\t\t\t></form\r\n\t\t></div\r\n\t></div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
this.delete_col_index=5;
var _this=this;
dojo.connect(this.vocab_grid,"onCellClick",this,_this._handleCellClick);
dojo.connect(this.vocab_grid,"onApplyCellEdit",this,_this.markAsChanged);
dojo.connect(this.vocab_grid,"onRowClick",function(e){
console.debug("***** onRowClick: e = ",e);
});
dojo.connect(this.vocab_grid,"onCellFocus",function(e){
console.debug("***** onCellFocus: e.index = ",e.index,", e.fieldIndex = ",e.fieldIndex,", e = ",e);
});
dojo.connect(this.vocab_grid,"onStartEdit",function(_1634,_1635){
console.debug("***** onStartEdit: inCell = ",_1634,", inRowIndex = ",_1635);
});
this.url="/config/vocabularies/"+this.config["@id"];
console.debug("url = ",this.url);
this.vocab_store=new dojox.data.XmlStore({url:this.url,attributeMap:{"Vocabulary.id":"@id"}});
this.vocab_term_store=new dojox.data.XmlStore({url:this.url,rootItem:"Term",attributeMap:{"Term.id":"@id"}});
this.vocab_term_store.getIdentity=function(item){
console.debug("vocab_term_store.getIdentity");
return _this.vocab_term_store.getValue(item,"@id");
};
this.items=[];
this.vocab_term_store.fetch({onItem:function(item){
var _1638={};
_1638.ID=_this.vocab_term_store.getValue(item,"@id").split("#")[1];
var type=_this.vocab_term_store.getValue(item,"Type");
_1638.Type=pion.terms.type_descriptions_by_name[type.toString()];
_1638.Format=_this.vocab_term_store.getValue(type,"@format");
_1638.Size=_this.vocab_term_store.getValue(type,"@size");
var _163a=_this.vocab_term_store.getValue(item,"Comment");
if(_163a){
_1638.Comment=_163a.toString();
}
_this.items.push(_1638);
},onComplete:function(){
console.debug(_this.url,": items = ",_this.items,", items[0] = ",_this.items[0]);
_this.working_store=new dojo.data.ItemFileWriteStore({data:{identifier:"ID",items:_this.items}});
_this.model=new dojox.grid.data.DojoData(null,null,{store:_this.working_store,query:{Type:"*"}});
_this.model.requestRows();
_this.vocab_grid.setModel(_this.model);
setTimeout(function(){
_this.vocab_grid.update();
_this.vocab_grid.resize();
},500);
},onError:pion.handleFetchError});
dojo.query("input",this.domNode).forEach(function(n){
dojo.connect(n,"change",_this,_this.markAsChanged);
});
dojo.query("textarea",this.domNode).forEach(function(n){
dojo.connect(n,"change",_this,_this.markAsChanged);
});
},populateFromVocabStore:function(){
var _this=this;
this.vocab_store.fetch({query:{"tagName":"Vocabulary"},onComplete:function(items,_163f){
console.debug("vocab_store.fetch.onComplete: items.length = ",items.length);
_this.vocab_item=items[0];
_this.populateFromVocabItem();
},onError:pion.handleFetchError});
},populateFromVocabItem:function(){
this.config.Name=this.vocab_store.getValue(this.vocab_item,"Name").toString();
var _1640=this.vocab_store.getValue(this.vocab_item,"Comment");
if(_1640){
this.config.Comment=_1640.toString();
}
var _1641=this.vocab_store.getValue(this.vocab_item,"Locked");
this.config.Locked=(typeof _1641!=="undefined")&&_1641.toString()=="true";
console.dir(this.config);
this.name.attr("readOnly",this.config.Locked);
this.comment.disabled=this.config.Locked;
this.add_new_term_button.attr("disabled",this.config.Locked);
if(this.config.Locked){
if(!plugins.vocabularies.VocabularyPane.read_only_grid_layout){
plugins.vocabularies.initGridLayouts();
}
this.vocab_grid.setStructure(plugins.vocabularies.VocabularyPane.read_only_grid_layout);
}else{
if(!plugins.vocabularies.VocabularyPane.grid_layout){
plugins.vocabularies.initGridLayouts();
}
this.vocab_grid.setStructure(plugins.vocabularies.VocabularyPane.grid_layout);
}
this.vocab_grid.update();
var _1642=dojo.clone(this.config);
_1642.checkboxes=this.config.Locked?["locked"]:[];
this.form.attr("value",_1642);
var _1643=dojo.query("textarea.comment",this.form.domNode)[0];
_1643.value=this.config.Comment?this.config.Comment:"";
this.title=this.config.Name;
var _1644=dojo.query(".dijitAccordionTitle .dijitAccordionText",this.domNode)[0];
_1644.firstChild.nodeValue=this.title;
var node=this.domNode;
setTimeout(function(){
dojo.removeClass(node,"unsaved_changes");
},500);
},_handleCellClick:function(e){
if(this.config.Locked){
return;
}
console.debug("e.rowIndex = ",e.rowIndex,", e.cellIndex = ",e.cellIndex);
if(e.cellIndex==this.delete_col_index){
var row=this.vocab_grid.model.getRow(e.rowIndex);
console.debug("deleting item ",row.__dojo_data_item);
this.working_store.deleteItem(row.__dojo_data_item);
dojo.addClass(this.domNode,"unsaved_changes");
console.debug("Removing row ",e.rowIndex);
this.vocab_grid.removeSelectedRows();
}
if(e.cellIndex==2||e.cellIndex==3){
console.debug("e.cell.editorProps.regExp = ",e.cell.editorProps.regExp);
if(e.cell.editor.editor){
console.debug("e.cell.editor.editor.regExp = ",e.cell.editor.editor.regExp);
}
var type=this.vocab_grid.model.getDatum(e.rowIndex,1);
var _1649="-";
if(e.cellIndex==2){
if(type=="specific date"||type=="specific time"||type=="specific time & date"){
_1649=".*%.*";
}
}
if(e.cellIndex==3){
if(type=="fixed-length string"){
_1649="[1-9][0-9]*";
}
}
if(e.cell.editor.editor){
console.debug("e.cell.editor.editor.regExp set to ",_1649);
e.cell.editor.editor.regExp=_1649;
}else{
console.debug("e.cell.editorProps.regExp set to ",_1649);
e.cell.editorProps.regExp=_1649;
}
}
},_handleAddNewTerm:function(){
console.debug("_handleAddNewTerm");
var _164a=new plugins.vocabularies.TermInitDialog();
setTimeout(function(){
dojo.query("input",_164a.domNode)[0].select();
},500);
_164a.show();
},_handleLockingChange:function(){
console.debug("_handleLockingChange");
},save:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
this.saveVocabConfig();
this.saveChangedTerms();
},saveVocabConfig:function(){
var _this=this;
var _164c=this.form.attr("value");
this.config.Name=_164c.Name;
this.config.Locked=dojo.indexOf(_164c.checkboxes,"locked")>=0;
var _164d=dojo.query("textarea.comment",this.form.domNode)[0];
this.config.Comment=_164d.value;
var _164e="<PionConfig><Vocabulary>";
for(var tag in this.config){
if(tag!="@id"){
_164e+="<"+tag+">"+this.config[tag]+"</"+tag+">";
}
}
_164e+="</Vocabulary></PionConfig>";
console.debug("put_data: ",_164e);
_this=this;
dojo.rawXhrPut({url:"/config/vocabularies/"+this.config["@id"],contentType:"text/xml",handleAs:"xml",putData:_164e,load:function(_1650){
console.debug("response: ",_1650);
_this.populateFromVocabStore();
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_164e})});
},saveChangedTerms:function(){
var store=this.working_store;
var _this=this;
var ID,url;
store._saveCustom=function(_1655,_1656){
for(ID in this._pending._modifiedItems){
url=dojox.dtl.filter.strings.urlencode("/config/terms/"+_this.config["@id"]+"#"+ID);
console.debug("_saveCustom: url = ",url);
this.fetchItemByIdentity({identity:ID,onItem:function(item){
var _1658="<PionConfig><Term><Type";
var _1659=store.getValue(item,"Format");
if(_1659&&_1659!="-"){
_1658+=" format=\""+_1659+"\"";
}
var size=store.getValue(item,"Size");
if(size&&size!="-"){
_1658+=" size=\""+size+"\"";
}
_1658+=">"+pion.terms.types_by_description[store.getValue(item,"Type")]+"</Type>";
if(store.getValue(item,"Comment")){
_1658+="<Comment>"+store.getValue(item,"Comment")+"</Comment>";
}
_1658+="</Term></PionConfig>";
console.debug("put_data = ",_1658);
dojo.rawXhrPut({url:url,handleAs:"xml",timeout:1000,contentType:"text/xml",putData:_1658,load:function(_165b,_165c){
console.debug("rawXhrPut for url = "+this.url,"; HTTP status code: ",_165c.xhr.status);
return _165b;
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_1658})});
},onError:pion.handleFetchError});
}
for(ID in this._pending._newItems){
url=dojox.dtl.filter.strings.urlencode("/config/terms/"+_this.config["@id"]+"#"+ID);
console.debug("_saveCustom: url = ",url);
var item=this._pending._newItems[ID];
var _165e="<PionConfig><Term><Type";
var _165f=store.getValue(item,"Format");
if(_165f&&_165f!="-"){
_165e+=" format=\""+_165f+"\"";
}
var size=store.getValue(item,"Size");
if(size&&size!="-"){
_165e+=" size=\""+size+"\"";
}
_165e+=">"+pion.terms.types_by_description[store.getValue(item,"Type")]+"</Type>";
if(store.getValue(item,"Comment")){
_165e+="<Comment>"+store.getValue(item,"Comment")+"</Comment>";
}
_165e+="</Term></PionConfig>";
console.debug("post_data = ",_165e);
dojo.rawXhrPost({url:url,handleAs:"xml",timeout:1000,contentType:"text/xml",postData:_165e,load:function(_1661,_1662){
console.debug("rawXhrPost for url = "+this.url,"; HTTP status code: ",_1662.xhr.status);
return _1661;
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_165e})});
}
for(ID in this._pending._deletedItems){
url=dojox.dtl.filter.strings.urlencode("/config/terms/"+_this.config["@id"]+"#"+ID);
console.debug("_saveCustom: url = ",url);
dojo.xhrDelete({url:url,handleAs:"xml",timeout:1000,load:function(_1663,_1664){
console.debug("xhrDelete for url = "+this.url,"; HTTP status code: ",_1664.xhr.status);
return _1663;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
}
_1655();
};
store.save({});
pion.terms.buildMapOfCategoriesByTerm();
},cancel:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
this.working_store.revert();
this.vocab_grid.model.requestRows();
this.populateFromVocabStore();
},delete2:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
console.debug("delete2: selected vocabulary is ",this.title);
_this=this;
dojo.xhrDelete({url:"/config/vocabularies/"+this.config["@id"],handleAs:"xml",timeout:5000,load:function(_1665,_1666){
console.debug("xhrDelete for url = "+this.url,"; HTTP status code: ",_1666.xhr.status);
dijit.byId("vocab_config_accordion").forward();
dijit.byId("vocab_config_accordion").removeChild(_this);
pion.vocabularies._adjustAccordionSize();
return _1665;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
},markAsChanged:function(){
console.debug("markAsChanged");
dojo.addClass(this.domNode,"unsaved_changes");
}});
plugins.vocabularies.initGridLayouts=function(){
plugins.vocabularies.VocabularyPane.grid_layout=[{rows:[[{name:"ID",field:"ID",width:"auto",styles:""},{name:"Type",field:"Type",width:"auto",styles:"",editor:dojox.grid.editors.Dijit,editorClass:"dijit.form.FilteringSelect",editorProps:{store:pion.terms.type_store,searchAttr:"description"}},{name:"Format",field:"Format",width:10,styles:"",editor:dojox.grid.editors.Dijit,editorClass:"dijit.form.ValidationTextBox",editorProps:{}},{name:"Size",field:"Size",width:3,styles:"",editor:dojox.grid.editors.Dijit,editorClass:"dijit.form.ValidationTextBox",editorProps:{}},{name:"Comment",field:"Comment",width:"auto",styles:"",editor:dojox.grid.editors.Dijit,editorClass:"dijit.form.TextBox",editorProps:{}},{name:"Delete",width:3,styles:"align: center;",value:"<button dojoType=dijit.form.Button class=\"delete_row\"><img src=\"images/icon-delete.png\" alt=\"DELETE\" border=\"0\" /></button>"}]]}];
plugins.vocabularies.VocabularyPane.read_only_grid_layout=[{rows:[[{field:"ID",width:"auto",styles:""},{field:"Type",width:"auto",styles:""},{field:"Format",width:10,styles:""},{field:"Size",width:3,styles:""},{field:"Comment",width:"auto",styles:""}]]}];
};
}
if(!dojo._hasResource["pion.vocabularies"]){
dojo._hasResource["pion.vocabularies"]=true;
dojo.provide("pion.vocabularies");
pion.vocabularies.getHeight=function(){
return pion.vocabularies.height;
};
pion.vocabularies._adjustAccordionSize=function(){
var _1667=dijit.byId("vocab_config_accordion");
var _1668=_1667.getChildren().length;
console.debug("num_vocabs = "+_1668);
var _1669=450;
var _166a=0;
if(_1668>0){
var _166b=_1667.getChildren()[0];
var _166a=_166b.getTitleHeight();
}
var _166c=_1669+_1668*_166a;
_1667.resize({h:_166c});
pion.vocabularies.height=_166c+160;
dijit.byId("main_stack_container").resize({h:pion.vocabularies.height});
};
pion.vocabularies.isDuplicateVocabularyId=function(id){
var _166e=dijit.byId("vocab_config_accordion").getChildren();
var _166f="urn:vocab:"+id;
for(var i=0;i<_166e.length;++i){
if(_166e[i].config["@id"]==_166f){
return true;
}
}
return false;
};
pion.vocabularies.isDuplicateVocabularyName=function(name){
var _1672=dijit.byId("vocab_config_accordion").getChildren();
for(var i=0;i<_1672.length;++i){
if(_1672[i].title==name){
return true;
}
}
return false;
};
pion.vocabularies.config_store=new dojox.data.XmlStore({url:"/config/vocabularies",rootItem:"VocabularyConfig",attributeMap:{"VocabularyConfig.id":"@id"}});
pion.vocabularies.init=function(){
var _1674=null;
var _1675=["@id","Type","@format","Size","Comment"];
var _1676=_1675.length;
function _paneSelected(pane){
console.debug("Selected "+pane.title);
if(pane==_1674){
return;
}
if(_1674&&dojo.hasClass(_1674.domNode,"unsaved_changes")){
var _1678=new dijit.Dialog({title:"Warning: unsaved changes"});
_1678.setContent("Please save or cancel unsaved changes before selecting another Vocabulary.");
_1678.show();
setTimeout(function(){
dijit.byId("vocab_config_accordion").selectChild(_1674);
},500);
return;
}
_1674=pane;
pion.vocabularies.selected_pane=_1674;
pane.populateFromVocabStore();
var _1679=dijit.byId("vocab_config_accordion").duration;
setTimeout(function(){
dojo.style(pane.containerNode,"overflow","hidden");
},_1679+50);
};
dojo.subscribe("vocab_config_accordion-selectChild",_paneSelected);
function _createNewPane(_167a){
var _167b=document.createElement("span");
var _167c=new plugins.vocabularies.VocabularyPane(_167a,_167b);
return _167c;
};
pion.vocabularies.config_store.fetch({onComplete:function(items,_167e){
var _167f=dijit.byId("vocab_config_accordion");
for(var i=0;i<items.length;++i){
var id=pion.vocabularies.config_store.getValue(items[i],"@id");
var _1682=_createNewPane({config:{"@id":id},title:id});
_167f.addChild(_1682);
}
pion.vocabularies._adjustAccordionSize();
var _1683=_167f.getChildren()[0];
_167f.selectChild(_1683);
},onError:pion.handleFetchError});
function _addNewVocabulary(){
var _1684=new plugins.vocabularies.VocabularyInitDialog();
dojo.query(".dijitButton.save",_1684.domNode).forEach(function(n){
dijit.byNode(n).onClick=function(){
return _1684.isValid();
};
});
setTimeout(function(){
dojo.query("input",_1684.domNode)[0].select();
},500);
_1684.show();
_1684.execute=function(_1686){
var _1687="<PionConfig><Vocabulary>";
_1687+="<Name>"+_1686.Name+"</Name>";
_1687+="<Comment>"+_1686.Comment+"</Comment>";
_1687+="</Vocabulary></PionConfig>";
console.debug("post_data: ",_1687);
var _1688="urn:vocab:"+_1686["@id"];
dojo.rawXhrPost({url:"/config/vocabularies/"+_1688,contentType:"text/xml",handleAs:"xml",postData:_1687,load:function(_1689){
var node=_1689.getElementsByTagName("Vocabulary")[0];
var _168b=dijit.byId("vocab_config_accordion");
var _168c=_createNewPane({config:{"@id":_1688,Name:_1686.Name},title:_1686.Name});
_168b.addChild(_168c);
pion.vocabularies._adjustAccordionSize();
_168b.selectChild(_168c);
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1687})});
};
};
dojo.connect(dojo.byId("add_new_vocab_button"),"click",_addNewVocabulary);
};
}
if(!dojo._hasResource["plugins.protocols.Protocol"]){
dojo._hasResource["plugins.protocols.Protocol"]=true;
dojo.provide("plugins.protocols.Protocol");
dojo.declare("plugins.protocols.ProtocolInitDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog protocol_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Protocol Initialization</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Plugin&nbsp;Type</label></td\r\n\t\t\t\t><td><select dojoType=\"dijit.form.FilteringSelect\" name=\"Plugin\" style=\"width: 100%;\"\r\n\t\t\t\t\t   ><option value=\"HTTPProtocol\">HTTP Protocol</option\r\n\t\t\t\t   ></select></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Event&nbsp;Type</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.FilteringSelect\" name=\"EventType\" query=\"{Type:'object'}\" \r\n\t\t\t\t\t\tstore=\"pion.terms.store\" searchAttr=\"id\" autocomplete=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t></div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: hide\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true});
dojo.declare("plugins.protocols.ProtocolPane",[dijit.layout.AccordionPane],{templateString:"<div class='dijitAccordionPane protocol_pane'\r\n\t><div dojoAttachPoint='titleNode,focusNode' dojoAttachEvent='ondijitclick:_onTitleClick,onkeypress:_onTitleKeyPress,onfocus:_handleFocus,onblur:_handleFocus'\r\n\t\tclass='dijitAccordionTitle' wairole=\"tab\"\r\n\t\t><div class='dijitAccordionArrow'></div\r\n\t\t><div class='arrowTextUp' waiRole=\"presentation\">&#9650;</div\r\n\t\t><div class='arrowTextDown' waiRole=\"presentation\">&#9660;</div\r\n\t\t><div dojoAttachPoint='titleTextNode' class='dijitAccordionText'>${title}</div></div\r\n\t><div\r\n\t\t><div dojoAttachPoint='containerNode' style='overflow: hidden; height: 1px; display: none'\r\n\t\t\tclass='dijitAccordionBody' wairole=\"tabpanel\"\r\n\t\t\t><form dojoAttachPoint=\"form\" dojoType=\"dijit.form.Form\"\r\n\t\t\t\t><br/\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"100%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Name</label></td\r\n\t\t\t\t\t\t><td><input dojoAttachPoint=\"name\" dojoType=\"dijit.form.TextBox\" name=\"Name\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td rowspan=\"4\" valign=\"top\" width=\"20\">&nbsp;</td\r\n\t\t\t\t\t\t><td rowspan=\"1\"><label>Comments</label></td\r\n\t\t\t\t\t\t><td rowspan=\"4\" valign=\"top\"><textarea rows=\"4\" style=\"width: 95%\" name=\"Comment\" class=\"comment\"></textarea></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>ID</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td rowspan=\"3\">&nbsp;</td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Plugin&nbsp;Type</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Plugin\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Event&nbsp;Type</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.FilteringSelect\" name=\"EventType\" dojoAttachEvent='onChange:markAsChanged'\r\n\t\t\t\t\t\t\t\tstore=\"pion.terms.store\" searchAttr=\"id\" query=\"{Type:'object'}\" autocomplete=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><br/\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" style=\"border: 1px solid #999999;\" width=\"99%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td class=\"matrixMainHeader\">Extraction Rules</td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td style=\"background-color: #f1f1f1;\"\r\n\t\t\t\t\t\t\t><div class=\"protocol_grid\"\r\n\t\t\t\t\t\t\t\t><div dojoAttachPoint=\"protocol_grid\" dojoType=\"dojox.Grid\" model=\"plugins.protocols.ProtocolPane.grid_model\"\r\n\t\t\t\t\t\t\t\t\t singleClickEdit=\"true\"></div\r\n\t\t\t\t\t\t\t></div\r\n\t\t\t\t\t\t\t><button dojoType=dijit.form.Button class=\"add_new_row\" dojoAttachEvent=\"onClick: _handleAddNewRow\">ADD NEW RULE</button\r\n\t\t\t\t\t\t></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><hr noshade=\"noshade\" size=\"1\" color=\"#999999\"\r\n\t\t\t\t><div class=\"save_cancel_delete\"\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick:save\">Save Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick:cancel\">Cancel Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"delete\" dojoAttachEvent=\"onClick:delete2\">Delete Protocol</button\r\n\t\t\t\t></div\r\n\t\t\t></form\r\n\t\t></div\r\n\t></div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
this.special_config_elements=["Extract","tagName","childNodes"];
this.attributes_by_column=["@term"];
var _this=this;
dojo.connect(this.protocol_grid,"onCellClick",this,_this._handleCellClick);
dojo.connect(this.protocol_grid,"onApplyCellEdit",this,_this._handleCellEdit);
dojo.query("input",this.domNode).forEach(function(n){
dojo.connect(n,"change",_this,_this.markAsChanged);
});
dojo.query("textarea",this.domNode).forEach(function(n){
dojo.connect(n,"change",_this,_this.markAsChanged);
});
},getHeight:function(){
return 470;
},populateFromConfigItem:function(item){
var store=pion.protocols.config_store;
var _1692={};
var _1693=store.getAttributes(item);
for(var i=0;i<_1693.length;++i){
if(dojo.indexOf(this.special_config_elements,_1693[i])==-1){
_1692[_1693[i]]=store.getValue(item,_1693[i]).toString();
}
}
if(this._addCustomConfigValues){
this._addCustomConfigValues(_1692,item);
}
console.dir(_1692);
this.form.setValues(_1692);
var _1695=dojo.query("textarea.comment",this.form.domNode)[0];
_1695.value=_1692.Comment;
console.debug("config = ",_1692);
this.title=_1692.Name;
var _1696=dojo.query(".dijitAccordionTitle .dijitAccordionText",this.domNode)[0];
_1696.firstChild.nodeValue=this.title;
var _1697=this._makeExtractionRuleTable(item);
plugins.protocols.ProtocolPane.grid_model.setData(_1697);
var grid=this.protocol_grid;
this._setGridStructure(grid);
setTimeout(function(){
grid.update();
grid.resize();
},200);
var node=this.domNode;
setTimeout(function(){
dojo.removeClass(node,"unsaved_changes");
},500);
},_makeExtractionRuleTable:function(item){
var store=pion.protocols.config_store;
return dojo.map(store.getValues(item,"Extract"),function(item){
var row=[];
row.push(store.getValue(item,"@term"));
row.push(store.getValue(item,"Source"));
row.push(store.getValue(item,"Name"));
if(store.hasAttribute(item,"Match")){
row.push(store.getValue(item,"Match").toString());
}else{
row.push("");
}
row.push(store.getValue(item,"Format"));
row.push(store.getValue(item,"ContentType"));
row.push(store.getValue(item,"MaxSize"));
return row;
});
},_setGridStructure:function(grid){
if(!this.default_grid_layout){
this.initGridLayouts();
}
grid.setStructure(this.default_grid_layout);
},_handleCellClick:function(e){
console.debug("e.rowIndex = ",e.rowIndex,", e.cellIndex = ",e.cellIndex);
if(e.cellIndex==this.protocol_grid.delete_column_index){
dojo.addClass(this.domNode,"unsaved_changes");
console.debug("Removing row ",e.rowIndex);
this.protocol_grid.removeSelectedRows();
}
},_handleCellEdit:function(_16a0,_16a1,_16a2){
console.debug("ProtocolPane._handleCellEdit inValue = ",_16a0,", inRowIndex = ",_16a1,", inFieldIndex = ",_16a2);
dojo.addClass(this.domNode,"unsaved_changes");
},_handleAddNewRow:function(){
this.markAsChanged();
this.protocol_grid.addRow([]);
},save:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
var _16a3=this.form.getValues();
var _16a4=dojo.query("textarea.comment",this.form.domNode)[0];
_16a3.Comment=_16a4.value;
var _16a5="<PionConfig><Protocol>";
for(var tag in _16a3){
if(tag.charAt(0)!="@"&&tag!="options"){
console.debug("config[",tag,"] = ",_16a3[tag]);
_16a5+="<"+tag+">"+_16a3[tag]+"</"+tag+">";
}
}
if(this._makeCustomElements){
_16a5+=this._makeCustomElements(_16a3);
}
_16a5+=this._makeExtractionRuleElements();
_16a5+="</Protocol></PionConfig>";
console.debug("put_data: ",_16a5);
_this=this;
dojo.rawXhrPut({url:"/config/protocols/"+this.uuid,contentType:"text/xml",handleAs:"xml",putData:_16a5,load:function(_16a7){
console.debug("response: ",_16a7);
pion.protocols.config_store.fetch({query:{"@id":_this.uuid},onItem:function(item){
_this.config_item=item;
_this.populateFromConfigItem(item);
},onError:pion.handleFetchError});
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_16a5})});
},_makeExtractionRuleElements:function(){
var _16a9=plugins.protocols.ProtocolPane.grid_model.getRowCount();
var _16aa="";
for(var i=0;i<_16a9;++i){
var row=plugins.protocols.ProtocolPane.grid_model.getRow(i);
_16aa+="<Extract term=\""+row[this.protocol_grid.term_column_index]+"\">";
_16aa+="<Source>"+row[this.protocol_grid.source_column_index]+"</Source>";
if(row[this.protocol_grid.name_column_index]){
_16aa+="<Name>"+row[this.protocol_grid.name_column_index]+"</Name>";
}
if(row[this.protocol_grid.match_column_index]){
_16aa+="<Match>"+dojox.dtl._base.escape(row[this.protocol_grid.match_column_index])+"</Match>";
}
if(row[this.protocol_grid.format_column_index]){
_16aa+="<Format>"+row[this.protocol_grid.format_column_index]+"</Format>";
}
if(row[this.protocol_grid.content_type_column_index]){
_16aa+="<ContentType>"+row[this.protocol_grid.content_type_column_index]+"</ContentType>";
}
if(row[this.protocol_grid.max_size_column_index]){
_16aa+="<MaxSize>"+row[this.protocol_grid.max_size_column_index]+"</MaxSize>";
}
_16aa+="</Extract>";
}
return _16aa;
},cancel:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
this.populateFromConfigItem(this.config_item);
},delete2:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
console.debug("delete2: selected protocol is ",this.title);
_this=this;
dojo.xhrDelete({url:"/config/protocols/"+this.uuid,handleAs:"xml",timeout:5000,load:function(_16ad,_16ae){
console.debug("xhrDelete for url = /config/protocols/"+this.uuid,"; HTTP status code: ",_16ae.xhr.status);
dijit.byId("protocol_config_accordion").forward();
dijit.byId("protocol_config_accordion").removeChild(_this);
pion.protocols._adjustAccordionSize();
return _16ad;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
},markAsChanged:function(){
console.debug("markAsChanged");
dojo.addClass(this.domNode,"unsaved_changes");
},initGridLayouts:function(){
this.protocol_grid.term_column_index=0;
this.protocol_grid.source_column_index=1;
this.protocol_grid.name_column_index=2;
this.protocol_grid.match_column_index=3;
this.protocol_grid.format_column_index=4;
this.protocol_grid.content_type_column_index=5;
this.protocol_grid.max_size_column_index=6;
this.protocol_grid.delete_column_index=7;
this.default_grid_layout=[{rows:[[{name:"Term",styles:"",editor:dojox.grid.editors.Dijit,editorClass:"dijit.form.FilteringSelect",editorProps:{store:pion.terms.store,searchAttr:"id",keyAttr:"id"},width:12},{name:"Source",styles:"",width:"auto",editor:dojox.grid.editors.Dijit,editorClass:"dijit.form.FilteringSelect",editorProps:{store:plugins.protocols.source_store,searchAttr:"description"}},{name:"Name",styles:"",width:"auto",editor:dojox.grid.editors.Input},{name:"Match",styles:"",width:"auto",editor:dojox.grid.editors.AlwaysOn},{name:"Format",styles:"",width:"auto",editor:dojox.grid.editors.Input},{name:"ContentType",styles:"",width:"auto",editor:dojox.grid.editors.Input},{name:"MaxSize",styles:"",width:"auto",editor:dojox.grid.editors.Input},{name:"Delete",styles:"align: center;",width:3,value:"<button dojoType=dijit.form.Button class=\"delete_row\"><img src=\"images/icon-delete.png\" alt=\"DELETE\" border=\"0\" /></button>"},]]}];
},protocol:""});
plugins.protocols.ProtocolPane.grid_model=new dojox.grid.data.Table(null,[]);
plugins.protocols.source_store=new dojo.data.ItemFileReadStore({data:{identifier:"name",items:[{name:"query",description:"query"},{name:"cookie",description:"cookie"},{name:"cs-header",description:"cs-header"},{name:"sc-header",description:"sc-header"},{name:"cs-content",description:"cs-content"},{name:"sc-content",description:"sc-content"}]}});
}
if(!dojo._hasResource["pion.protocols"]){
dojo._hasResource["pion.protocols"]=true;
dojo.provide("pion.protocols");
var selected_protocol_pane=null;
var protocol_config_store;
pion.protocols.getHeight=function(){
return pion.protocols.height;
};
pion.protocols.config_store=new dojox.data.XmlStore({url:"/config/protocols"});
pion.protocols.config_store.fetchItemByIdentity=function(_16af){
pion.protocols.config_store.fetch({query:{"@id":_16af.identity},onItem:_16af.onItem,onError:pion.handleFetchError});
};
pion.protocols.config_store.getIdentity=function(item){
return pion.protocols.config_store.getValue(item,"@id");
};
pion.protocols.init=function(){
protocol_config_store=pion.protocols.config_store;
dojo.subscribe("protocol_config_accordion-selectChild",protocolPaneSelected);
pion.protocols.createNewPaneFromItem=function(item){
var title=pion.protocols.config_store.getValue(item,"Name");
var _16b3=pion.protocols.config_store.getValue(item,"Plugin");
var _16b4=document.createElement("span");
var _16b5="plugins.protocols."+_16b3+"Pane";
var _16b6=dojo.getObject(_16b5);
if(_16b6){
console.debug("found class ",_16b5);
var _16b7=new _16b6({"class":"protocol_pane",title:title},_16b4);
}else{
console.debug("class ",_16b5," not found; using plugins.protocols.ProtocolPane instead.");
var _16b7=new plugins.protocols.ProtocolPane({"class":"protocol_pane",title:title},_16b4);
}
_16b7.config_item=item;
_16b7.uuid=pion.protocols.config_store.getValue(item,"@id");
dijit.byId("protocol_config_accordion").addChild(_16b7);
return _16b7;
};
pion.protocols.createNewPaneFromStore=function(id,_16b9){
pion.protocols.config_store.fetch({query:{"@id":id},onItem:function(item){
var _16bb=pion.protocols.createNewPaneFromItem(item);
if(_16b9){
pion.protocols._adjustAccordionSize();
dijit.byId("protocol_config_accordion").selectChild(_16bb);
}
},onError:pion.handleFetchError});
};
function onComplete(items,_16bd){
var _16be=dijit.byId("protocol_config_accordion");
for(var i=0;i<items.length;++i){
pion.protocols.createNewPaneFromItem(items[i]);
}
var _16c0=_16be.getChildren()[0];
_16be.selectChild(_16c0);
};
protocol_config_store.fetch({onComplete:onComplete,onError:pion.handleFetchError});
dojo.connect(dojo.byId("add_new_protocol_button"),"click",addNewProtocol);
};
function addNewProtocol(){
var _16c1=new plugins.protocols.ProtocolInitDialog({title:"Add New Protocol"});
setTimeout(function(){
dojo.query("input",_16c1.domNode)[0].select();
},500);
_16c1.show();
_16c1.execute=function(_16c2){
console.debug(_16c2);
var _16c3="<PionConfig><Protocol>";
for(var tag in _16c2){
console.debug("dialogFields[",tag,"] = ",_16c2[tag]);
_16c3+="<"+tag+">"+_16c2[tag]+"</"+tag+">";
}
if(plugins.protocols[_16c2.Plugin]&&plugins.protocols[_16c2.Plugin].custom_post_data){
_16c3+=plugins.protocols[_16c2.Plugin].custom_post_data;
}
_16c3+="</Protocol></PionConfig>";
console.debug("post_data: ",_16c3);
dojo.rawXhrPost({url:"/config/protocols",contentType:"text/xml",handleAs:"xml",postData:_16c3,load:function(_16c5){
var node=_16c5.getElementsByTagName("Protocol")[0];
var id=node.getAttribute("id");
console.debug("id (from server): ",id);
pion.protocols.createNewPaneFromStore(id,true);
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_16c3})});
};
};
pion.protocols._adjustAccordionSize=function(){
var _16c8=dijit.byId("protocol_config_accordion");
var _16c9=_16c8.getChildren().length;
console.debug("num_protocols = "+_16c9);
var _16ca=selected_protocol_pane.getHeight();
var _16cb=0;
if(_16c9>0){
var _16cc=_16c8.getChildren()[0];
_16cb=_16cc.getTitleHeight();
}
var _16cd=_16ca+_16c9*_16cb;
_16c8.resize({h:_16cd});
pion.protocols.height=_16cd+160;
dijit.byId("main_stack_container").resize({h:pion.protocols.height});
};
function protocolPaneSelected(pane){
console.debug("Selected "+pane.title);
if(pane==selected_protocol_pane){
return;
}
if(selected_protocol_pane&&dojo.hasClass(selected_protocol_pane.domNode,"unsaved_changes")){
var _16cf=new dijit.Dialog({title:"Warning: unsaved changes"});
_16cf.setContent("Please save or cancel unsaved changes before selecting another Protocol.");
_16cf.show();
setTimeout("dijit.byId('protocol_config_accordion').selectChild(selected_protocol_pane)",500);
return;
}
selected_protocol_pane=pane;
console.debug("Fetching item ",pane.uuid);
var store=pion.protocols.config_store;
store.fetch({query:{"@id":pane.uuid},onItem:function(item){
console.debug("item: ",item);
pane.populateFromConfigItem(item);
},onError:pion.handleFetchError});
var _16d2=dijit.byId("protocol_config_accordion").duration;
setTimeout(function(){
dojo.style(pane.containerNode,"overflow","hidden");
pion.protocols._adjustAccordionSize();
},_16d2+50);
};
}
if(!dojo._hasResource["pion.widgets.User"]){
dojo._hasResource["pion.widgets.User"]=true;
dojo.provide("pion.widgets.User");
dojo.declare("pion.widgets.UserInitDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog user_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Add New User</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Username</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.ValidationTextBox\" regExp=\"[\\w-]+\" name=\"@id\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Last name</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"LastName\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>First name</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"FirstName\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Password</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Password\" type=\"password\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t</div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: onCancel\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true});
dojo.declare("pion.widgets.UserPane",[dijit.layout.AccordionPane],{templateString:"<div class='dijitAccordionPane user_pane'\r\n\t><div dojoAttachPoint='titleNode,focusNode' dojoAttachEvent='ondijitclick:_onTitleClick,onkeypress:_onTitleKeyPress,onfocus:_handleFocus,onblur:_handleFocus'\r\n\t\tclass='dijitAccordionTitle' wairole=\"tab\"\r\n\t\t><div class='dijitAccordionArrow'></div\r\n\t\t><div class='arrowTextUp' waiRole=\"presentation\">&#9650;</div\r\n\t\t><div class='arrowTextDown' waiRole=\"presentation\">&#9660;</div\r\n\t\t><div dojoAttachPoint='titleTextNode' class='dijitAccordionText'>${title}</div></div\r\n\t><div\r\n\t\t><div dojoAttachPoint='containerNode' style='overflow: hidden; height: 1px; display: none'\r\n\t\t\tclass='dijitAccordionBody' wairole=\"tabpanel\"\r\n\t\t\t><form dojoAttachPoint=\"form\" dojoType=\"dijit.form.Form\"\r\n\t\t\t\t><br /><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"100%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Username</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" disabled=\"true\"/></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Last name</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"LastName\"/></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>First name</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"FirstName\"/></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Password</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Password\" type=\"password\"/></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><hr noshade=\"noshade\" size=\"1\" color=\"#999999\"\r\n\t\t\t\t><div class=\"save_cancel_delete\"\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick:save\">Save Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick:cancel\">Cancel Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"delete\" dojoAttachEvent=\"onClick:delete2\">Delete User</button\r\n\t\t\t\t></div\r\n\t\t\t></form\r\n\t\t></div\r\n\t></div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,populateFromConfigItem:function(item){
var store=pion.users.config_store;
var _16d5={};
var _16d6=store.getAttributes(item);
for(var i=0;i<_16d6.length;++i){
if(_16d6[i]!="Field"&&_16d6[i]!="tagName"&&_16d6[i]!="childNodes"){
_16d5[_16d6[i]]=store.getValue(item,_16d6[i]).toString();
}
}
console.dir(_16d5);
this.form.setValues(_16d5);
console.debug("config = ",_16d5);
var _16d8=dojo.query(".dijitAccordionTitle .dijitAccordionText",this.domNode)[0];
_16d8.firstChild.nodeValue=this.title;
var node=this.domNode;
setTimeout(function(){
dojo.removeClass(node,"unsaved_changes");
},500);
},save:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
var _16da=this.form.getValues();
var _16db="<PionConfig><User>";
for(var tag in _16da){
if(tag!="@id"){
console.debug("config[",tag,"] = ",_16da[tag]);
_16db+="<"+tag+">"+_16da[tag]+"</"+tag+">";
}
}
_16db+="</User></PionConfig>";
console.debug("put_data: ",_16db);
_this=this;
dojo.rawXhrPut({url:"/config/users/"+this.uuid,contentType:"text/xml",handleAs:"xml",putData:_16db,load:function(_16dd){
console.debug("response: ",_16dd);
pion.users.config_store.fetch({query:{"@id":_this.uuid},onItem:function(item){
_this.config_item=item;
_this.populateFromConfigItem(item);
},onError:pion.handleFetchError});
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_16db})});
},cancel:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
this.populateFromConfigItem(this.config_item);
},delete2:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
console.debug("delete2: selected user is ",this.title);
_this=this;
dojo.xhrDelete({url:"/config/users/"+this.uuid,handleAs:"xml",timeout:5000,load:function(_16df,_16e0){
console.debug("xhrDelete for url = /config/users/"+this.uuid,"; HTTP status code: ",_16e0.xhr.status);
dijit.byId("user_config_accordion").forward();
dijit.byId("user_config_accordion").removeChild(_this);
pion.users._adjustAccordionSize();
return _16df;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
},markAsChanged:function(){
console.debug("markAsChanged");
dojo.addClass(this.domNode,"unsaved_changes");
},user:""});
}
if(!dojo._hasResource["pion.users"]){
dojo._hasResource["pion.users"]=true;
dojo.provide("pion.users");
var selected_user_pane=null;
pion.users.getHeight=function(){
return pion.users.height;
};
pion.users.config_store=new dojox.data.XmlStore({url:"/config/users"});
pion.users.init=function(){
var url=dojo.moduleUrl("plugins","users.json");
pion.users.plugin_data_store=new dojo.data.ItemFileReadStore({url:url});
dojo.subscribe("user_config_accordion-selectChild",userPaneSelected);
function onComplete(items,_16e3){
var _16e4=dijit.byId("user_config_accordion");
for(var i=0;i<items.length;++i){
var title=pion.users.config_store.getValue(items[i],"@id");
var _16e7=createNewUserPane(title);
_16e7.config_item=items[i];
_16e7.uuid=pion.users.config_store.getValue(items[i],"@id");
_16e4.addChild(_16e7);
}
pion.users._adjustAccordionSize();
var _16e8=_16e4.getChildren()[0];
_16e4.selectChild(_16e8);
};
if(file_protocol){
dijit.byId("user_config_accordion").removeChild(selected_user_pane);
}else{
pion.users.config_store.fetch({onComplete:onComplete,onError:pion.handleFetchError});
}
dojo.connect(dojo.byId("add_new_user_button"),"click",addNewUser);
};
function createNewUserPane(title){
var _16ea=document.createElement("span");
var _16eb=new pion.widgets.UserPane({"class":"user_pane",title:title},_16ea);
return _16eb;
};
function addNewUser(){
var _16ec=new pion.widgets.UserInitDialog();
setTimeout(function(){
dojo.query("input",_16ec.domNode)[0].select();
},500);
_16ec.show();
_16ec.execute=function(_16ed){
console.debug(_16ed);
var id=_16ed["@id"];
delete _16ed["@id"];
var _16ef="<PionConfig><User id=\""+id+"\">";
for(var tag in _16ed){
console.debug("dialogFields[",tag,"] = ",_16ed[tag]);
_16ef+="<"+tag+">"+_16ed[tag]+"</"+tag+">";
}
_16ef+="</User></PionConfig>";
console.debug("post_data: ",_16ef);
dojo.rawXhrPost({url:"/config/users",contentType:"text/xml",handleAs:"xml",postData:_16ef,load:function(_16f1){
var _16f2=dijit.byId("user_config_accordion");
var _16f3=createNewUserPane(id);
_16f3.uuid=id;
_16f2.addChild(_16f3);
pion.users._adjustAccordionSize();
_16f2.selectChild(_16f3);
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_16ef})});
};
};
pion.users._adjustAccordionSize=function(){
var _16f4=dijit.byId("user_config_accordion");
var _16f5=_16f4.getChildren().length;
console.debug("num_users = "+_16f5);
var _16f6=210;
var _16f7=0;
if(_16f5>0){
var _16f8=_16f4.getChildren()[0];
_16f7=_16f8.getTitleHeight();
}
var _16f9=_16f6+_16f5*_16f7;
_16f4.resize({h:_16f9});
pion.users.height=_16f9+160;
dijit.byId("main_stack_container").resize({h:pion.users.height});
};
function userPaneSelected(pane){
console.debug("Selected "+pane.title);
if(pane==selected_user_pane){
return;
}
if(selected_user_pane&&dojo.hasClass(selected_user_pane.domNode,"unsaved_changes")){
var _16fb=new dijit.Dialog({title:"Warning: unsaved changes"});
_16fb.setContent("Please save or cancel unsaved changes before selecting another User.");
_16fb.show();
setTimeout("dijit.byId('user_config_accordion').selectChild(selected_user_pane)",500);
return;
}
selected_user_pane=pane;
console.debug("Fetching item ",pane.uuid);
var store=pion.users.config_store;
store.fetch({query:{"@id":pane.uuid},onItem:function(item){
console.debug("item: ",item);
pane.populateFromConfigItem(item);
},onError:pion.handleFetchError});
var _16fe=dijit.byId("user_config_accordion").duration;
setTimeout(function(){
dojo.style(pane.containerNode,"overflow","hidden");
},_16fe+50);
};
dojo.subscribe("user_config_accordion-selectChild",userPaneSelected);
}
if(!dojo._hasResource["pion.widgets.XMLImport"]){
dojo._hasResource["pion.widgets.XMLImport"]=true;
dojo.provide("pion.widgets.XMLImport");
dojo.declare("pion.widgets.XMLImportDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog XML_import_dialog\" style=\"width: 600px\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Import XML Configuration</span>\r\n\t</div>\r\n\t<div style=\"padding: 10px\">\r\n\t\tEnter XML configurations for one or more Reactors, Connections, Codecs or Databases below.\r\n\t\tThe set of components and their references to other components must be complete.\r\n\t\tFor example, if you include the following Reactor configuration: \r\n\t\t<pre>\r\n\t&lt;Reactor id=\"11111111-2222-3333-4444-555555555555\"&gt;\r\n\t\t...\r\n\t\t&lt;Codec&gt;22222222-3333-4444-5555-666666666666&lt;/Codec&gt;\r\n\t\t...\r\n\t&lt;/Reactor&gt;\r\n\t\t</pre>\r\n\t\tthen you must also include the following Codec configuration:\r\n\t\t<pre>\r\n\t&lt;Codec id=\"22222222-3333-4444-5555-666666666666\"&gt;\r\n\t\t...\r\n\t&lt;/Codec&gt;\r\n\t\t</pre>\r\n\t\tA configuration need not specify its own UUID if no other included configuration needs to refer to it.\r\n\t\tNew UUIDs will be assigned for all included components, with all specified relationships preserved.\r\n\t</div>\r\n\t<div class=\"dijitDialogPaneContent\">\r\n\t\t<textarea dojoAttachPoint=\"XML_text_area\" style=\"width: 100%\" rows=\"8\" dojoAttachEvent=\"oninput: enableApply, onkeydown: enableApply\"></textarea>\r\n\t</div>\r\n\t<div class=\"dijitDialogPaneContent\">\r\n\t\t<textarea dojoAttachPoint=\"result_text_area\" style=\"width: 100%\" rows=\"8\" disabled=\"true\" wrap=\"off\"></textarea>\r\n\t</div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick: applyXML\"\r\n\t\t\t\tdojoAttachPoint=\"apply_button\" disabled=\"true\">Apply</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: hide\">Exit</button>\r\n\t</div>\r\n</div>\r\n",widgetsInTemplate:true,postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},postCreate:function(){
this.inherited("postCreate",arguments);
dojo.connect(this,"hide",this,"destroyRecursive");
this.uuid_replacements={};
},enableApply:function(){
console.debug("enableApply called");
this.apply_button.setAttribute("disabled",false);
},applyXML:function(){
console.debug("applyXML called");
this.apply_button.setAttribute("disabled",true);
var _16ff="<PionConfig>"+this.XML_text_area.value+"</PionConfig>";
var _1700=_16ff.replace(/>\s*/g,">");
if(dojo.isIE){
var _1701=dojox.data.dom.createDocument();
_1701.loadXML(_1700);
}else{
var _1702=new DOMParser();
var _1701=_1702.parseFromString(_1700,"text/xml");
}
var _1703=_1701.childNodes[0].childNodes;
this.result_text_area.value+=_1703.length+" configurations found.\n";
this.configs_by_type={Codec:[],Database:[],Reactor:[],Connection:[]};
for(var i=0;i<_1703.length;++i){
var type=_1703[i].nodeName;
if(!this.configs_by_type[type]){
this.result_text_area.value+="Error: unknown configuration type \""+type+"\".\n";
return;
}
this.configs_by_type[type].push(_1703[i]);
}
this.processCodecs();
},processCodecs:function(){
if(this.configs_by_type.Codec.length==0){
this.result_text_area.value+="No Codec configurations found.\n";
this.processDatabases();
}else{
this.result_text_area.value+=this.configs_by_type.Codec.length+" Codec configurations found.\n";
var _1706=0;
var _this=this;
dojo.forEach(this.configs_by_type.Codec,function(_1708){
var _1709=_1708.getAttribute("id");
var _170a="<PionConfig>"+dojox.data.dom.innerXML(_1708)+"</PionConfig>";
dojo.rawXhrPost({url:"/config/codecs",contentType:"text/xml",handleAs:"xml",postData:_170a,load:function(_170b){
var node=_170b.getElementsByTagName("Codec")[0];
var _170d=node.getAttribute("id");
if(_1709){
_this.uuid_replacements[_1709]=_170d;
}
if(codec_config_page_initialized){
pion.codecs.createNewPaneFromStore(_170d,false);
}
var name=node.getElementsByTagName("Name")[0].childNodes[0].nodeValue;
_this.result_text_area.value+="Codec named \""+name+"\" added with new UUID "+_170d+"\n";
if(++_1706==_this.configs_by_type.Codec.length){
_this.processDatabases();
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_170a})});
});
}
},processDatabases:function(){
if(this.configs_by_type.Database.length==0){
this.result_text_area.value+="No Database configurations found.\n";
this.processReactors();
}else{
this.result_text_area.value+=this.configs_by_type.Database.length+" Database configurations found.\n";
var _170f=0;
var _this=this;
dojo.forEach(this.configs_by_type.Database,function(_1711){
var _1712=_1711.getAttribute("id");
var _1713="<PionConfig>"+dojox.data.dom.innerXML(_1711)+"</PionConfig>";
dojo.rawXhrPost({url:"/config/databases",contentType:"text/xml",handleAs:"xml",postData:_1713,load:function(_1714){
var node=_1714.getElementsByTagName("Database")[0];
var _1716=node.getAttribute("id");
if(_1712){
_this.uuid_replacements[_1712]=_1716;
}
if(database_config_page_initialized){
pion.databases.createNewPaneFromStore(_1716,false);
}
var name=node.getElementsByTagName("Name")[0].childNodes[0].nodeValue;
_this.result_text_area.value+="Database named \""+name+"\" added with new UUID "+_1716+"\n";
if(++_170f==_this.configs_by_type.Database.length){
_this.processReactors();
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1713})});
});
}
},processReactors:function(){
if(this.configs_by_type.Reactor.length==0){
this.result_text_area.value+="No Reactor configurations found.\n";
console.debug("this.uuid_replacements = ",this.uuid_replacements);
this.processConnections();
}else{
dijit.byId("main_stack_container").selectChild(dijit.byId("reactor_config"));
this.result_text_area.value+=this.configs_by_type.Reactor.length+" Reactor configurations found.\n";
var _1718=0;
var _this=this;
dojo.forEach(this.configs_by_type.Reactor,function(_171a){
var _171b=_171a.getAttribute("id");
var _171c="<PionConfig>"+dojox.data.dom.innerXML(_171a)+"</PionConfig>";
for(var _171d in _this.uuid_replacements){
_171c=_171c.replace(RegExp(_171d,"g"),_this.uuid_replacements[_171d]);
}
console.debug("post_data = ",_171c);
dojo.rawXhrPost({url:"/config/reactors",contentType:"text/xml",handleAs:"xml",postData:_171c,load:function(_171e){
var node=_171e.getElementsByTagName("Reactor")[0];
var _1720=node.getAttribute("id");
if(_171b){
_this.uuid_replacements[_171b]=_1720;
}
var _1721={"@id":_1720};
var _1722=node.childNodes;
for(var i=0;i<_1722.length;++i){
if(_1722[i].firstChild){
_1721[_1722[i].tagName]=_1722[i].firstChild.nodeValue;
}
}
pion.reactors.createReactorInConfiguredWorkspace(_1721);
_this.result_text_area.value+="Reactor named \""+_1721.Name+"\" added with new UUID "+_1720+"\n";
if(++_1718==_this.configs_by_type.Reactor.length){
dijit.byId("main_stack_container").selectChild(dijit.byId("system_config"));
console.debug("this.uuid_replacements = ",this.uuid_replacements);
_this.processConnections();
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_171c})});
});
}
},processConnections:function(){
if(this.configs_by_type.Connection.length==0){
this.result_text_area.value+="No Connection configurations found.\n";
}else{
dijit.byId("main_stack_container").selectChild(dijit.byId("reactor_config"));
this.result_text_area.value+=this.configs_by_type.Connection.length+" Connections found.\n";
var _1724=0;
var _this=this;
dojo.forEach(this.configs_by_type.Connection,function(_1726){
var _1727=_1726.getAttribute("id");
var _1728="<PionConfig>"+dojox.data.dom.innerXML(_1726)+"</PionConfig>";
for(var _1729 in _this.uuid_replacements){
_1728=_1728.replace(RegExp(_1729,"g"),_this.uuid_replacements[_1729]);
}
console.debug("post_data = ",_1728);
dojo.rawXhrPost({url:"/config/connections",contentType:"text/xml",handleAs:"xml",postData:_1728,load:function(_172a){
var node=_172a.getElementsByTagName("Connection")[0];
var _172c=node.getAttribute("id");
var _172d=_172a.getElementsByTagName("From")[0].firstChild.nodeValue;
var to_id=_172a.getElementsByTagName("To")[0].firstChild.nodeValue;
pion.reactors.createConnection(_172d,to_id,_172c);
_this.result_text_area.value+="Connection from "+_172d+" to "+to_id+" added with new UUID "+_172c+"\n";
if(++_1724==_this.configs_by_type.Connection.length){
dijit.byId("main_stack_container").selectChild(dijit.byId("system_config"));
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1728})});
});
}
}});
}
if(!dojo._hasResource["pion.system"]){
dojo._hasResource["pion.system"]=true;
dojo.provide("pion.system");
var server_store;
dojo.declare("childlessChildrenFirstStore",dojo.data.ItemFileWriteStore,{getValues:function(item,_1730){
var _1731=this.inherited("getValues",arguments);
if(_1730!="services"){
return _1731;
}
var len=_1731.length;
for(var i=0;i<len;++i){
if(_1731[0].services){
_1731.push(_1731[0]);
_1731.splice(0,1);
}
}
return _1731;
}});
pion.system.getHeight=function(){
return 800;
};
pion.system.init=function(){
dijit.byId("main_stack_container").resize({h:pion.system.getHeight()});
if(file_protocol){
return;
}
dojo.xhrGet({url:"/config",handleAs:"xml",timeout:5000,load:function(_1734,_1735){
console.debug("in load()");
if(dojo.isIE){
dojo.byId("platform_conf_file").innerHTML=_1734.getElementsByTagName("PlatformConfig")[0].xml;
dojo.byId("reactor_conf_file").innerHTML=_1734.getElementsByTagName("ReactorConfig")[0].xml;
dojo.byId("vocab_conf_file").innerHTML=_1734.getElementsByTagName("VocabularyConfig")[0].xml;
dojo.byId("codec_conf_file").innerHTML=_1734.getElementsByTagName("CodecConfig")[0].xml;
dojo.byId("database_conf_file").innerHTML=_1734.getElementsByTagName("DatabaseConfig")[0].xml;
dojo.byId("user_conf_file").innerHTML=_1734.getElementsByTagName("UserConfig")[0].xml;
dojo.byId("protocol_conf_file").innerHTML=_1734.getElementsByTagName("ProtocolConfig")[0].xml;
dojo.byId("service_conf_file").innerHTML=_1734.getElementsByTagName("ServiceConfig")[0].xml;
dojo.byId("log_conf_file").innerHTML=_1734.getElementsByTagName("LogConfig")[0].xml;
dojo.byId("vocab_path").innerHTML=_1734.getElementsByTagName("VocabularyPath")[0].xml;
}else{
dojo.byId("platform_conf_file").innerHTML=_1734.getElementsByTagName("PlatformConfig")[0].textContent;
dojo.byId("reactor_conf_file").innerHTML=_1734.getElementsByTagName("ReactorConfig")[0].textContent;
dojo.byId("vocab_conf_file").innerHTML=_1734.getElementsByTagName("VocabularyConfig")[0].textContent;
dojo.byId("codec_conf_file").innerHTML=_1734.getElementsByTagName("CodecConfig")[0].textContent;
dojo.byId("database_conf_file").innerHTML=_1734.getElementsByTagName("DatabaseConfig")[0].textContent;
dojo.byId("user_conf_file").innerHTML=_1734.getElementsByTagName("UserConfig")[0].textContent;
dojo.byId("protocol_conf_file").innerHTML=_1734.getElementsByTagName("ProtocolConfig")[0].textContent;
dojo.byId("service_conf_file").innerHTML=_1734.getElementsByTagName("ServiceConfig")[0].textContent;
dojo.byId("log_conf_file").innerHTML=_1734.getElementsByTagName("LogConfig")[0].textContent;
dojo.byId("vocab_path").innerHTML=_1734.getElementsByTagName("VocabularyPath")[0].textContent;
}
var _1736=dojo.byId("plugin_paths");
var _1737=_1736.getElementsByTagName("tr")[0];
while(_1736.firstChild){
_1736.removeChild(_1736.firstChild);
}
var _1738=_1734.getElementsByTagName("PluginPath");
var _1739=[];
for(var i=0;i<_1738.length;++i){
if(dojo.isIE){
_1739[i]=_1736.insertRow();
dojo.forEach(_1737.childNodes,function(n){
_1739[i].appendChild(dojo.clone(n));
});
}else{
_1739[i]=dojo.clone(_1737);
_1736.appendChild(_1739[i]);
}
_1739[i].getElementsByTagName("label")[0].innerHTML="Plugin Path "+(i+1);
var _173c=dojo.isIE?_1738[i].xml:_1738[i].textContent;
_1739[i].getElementsByTagName("td")[1].innerHTML=_173c;
}
return _1734;
},error:pion.handleXhrGetError});
dojo.byId("platform_conf_file").firstChild.nodeValue="actual/path/here/PlatformConfigFile.xml";
server_store=new dojox.data.XmlStore({url:"/config/services"});
server_store.getFeatures=function(){
return {"dojo.data.api.Read":true,"dojo.data.api.Identity":true};
};
server_store.getIdentity=function(item){
console.debug("server_store.getValue(item, '@id') = ",server_store.getValue(item,"@id"));
console.debug("server_store.getAttributes(item) = ",server_store.getAttributes(item));
return server_store.getValue(item,"@id");
};
pion.system.myModel=new dijit.tree.ForestStoreModel({store:server_store,query:{tagName:"Server"},rootId:"serverRoot",childrenAttrs:["childNodes"]});
server_store.fetch({query:{tagName:"Server"},onComplete:function(){
pion.system.buildTree();
},onError:pion.handleFetchError});
};
pion.system.buildTree=function(){
new dijit.Tree({model:pion.system.myModel,showRoot:false,getLabel:function(item){
if(item.root){
return;
}
var label=server_store.getValue(item,"tagName");
var id=server_store.getValue(item,"@id");
if(id){
return label+": "+id;
}
if(label=="Option"){
label+=" "+server_store.getValue(item,"@name");
}
if(server_store.hasAttribute(item,"text()")){
return label+": "+server_store.getValue(item,"text()");
}
return label;
}},dojo.byId("server_tree"));
};
pion.system.importXMLConfiguration=function(){
var _1741=new pion.widgets.XMLImportDialog();
_1741.show();
};
}
if(!dojo._hasResource["pion.about"]){
dojo._hasResource["pion.about"]=true;
dojo.provide("pion.about");
dojo.declare("pion.about.LicenseKeyDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog about_dialog\" style=\"height: 550px; width: 600px\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">About Pion</span>\r\n\t\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: hide\">\r\n\t\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<p>\r\n\t\t\t<big><strong><span id=\"full_version\" dojoAttachPoint=\"full_version\"></span></strong></big><br/>\r\n\t\t\tCopyright &copy; 2008 Atomic Labs, Inc.  All Rights Reserved.\r\n\t\t</p>\r\n\t\t<p>\r\n\t\t\tPion includes a collection of <a href=\"third_party_libraries.html\" target=\"_blank\" style=\"color:#0033CC; text-decoration:underline\">third party\r\n\t\t\tlibraries</a>, all of which may be downloaded from \r\n\t\t\t<a href=\"http://pion.org/projects/pion-platform/documentation/libraries\" target=\"_blank\" style=\"color:#0033CC; text-decoration:underline\">our\r\n\t\t\tcommunity website.</a>\r\n\t\t</p>\r\n\r\n\t\t<h2>License Information</h2>\r\n\t\t<hr>\r\n\r\n\t\t<div id=\"license_block\">\r\n\r\n\t\t\t<div id=\"community_license\" dojoAttachPoint=\"community_license\"\r\n\t\t\t\tstyle=\"display: none\">\r\n\r\n\t\t\t\t<p>\r\n\t\t\t\t\tPion Community Edition is licensed under the\r\n\t\t\t\t\t<a href=\"/licenses/gpl_affero.html\" target=\"_blank\" style=\"color:#0033CC; text-decoration:underline\">\r\n\t\t\t\t\t\tGNU Affero\r\n\t\t\t\t\t\tGeneral Public License\r\n\t\t\t\t\t</a>.\r\n\t\t\t\t</p>\r\n\r\n\t\t\t</div>\r\n\r\n\t\t\t<div id=\"enterprise_not_licensed\" dojoAttachPoint=\"enterprise_not_licensed\"\r\n\t\t\t\tstyle=\"display: none\">\r\n\t\t\t\r\n\t\t\t\t<p><span id=\"reason_needs_license\" dojoAttachPoint=\"reason_needs_license\"></span></p>\r\n\r\n\t\t\t\t<form>\r\n\t\t\t\t<p>\r\n\t\t\t\tPlease cut and paste your license key into the box below and click \"Submit Key.\"<br/>\r\n\t\t\t\tIf you don't have a license key, you can obtain one from\r\n\t\t\t\t<a href=\"http://www.atomiclabs.com/pion/download-enterprise.php\" style=\"color:#0033CC; text-decoration:underline\">atomiclabs.com</a>.\r\n\t\t\t\t</p>\r\n\t\t\t\t<textarea id=\"license_key\" dojoAttachPoint=\"license_key\" cols=\"65\" rows=\"8\"></textarea><br/>\r\n\t\t\t\t<button dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick: submitKey\">Submit Key</button>\r\n\t\t\t\t</form>\r\n\t\t\t\t<p><big><strong><span id=\"result_of_submitting_key\" dojoAttachPoint=\"result_of_submitting_key\"></span></strong></big></p>\r\n\t\t\t\r\n\t\t\t</div>\r\n\t\t\t\r\n\t\t\t<div id=\"enterprise_licensed\" dojoAttachPoint=\"enterprise_licensed\"\r\n\t\t\t\tstyle=\"display: none\">\r\n\t\t\t\r\n\t\t\t\t<p>Pion Enterprise Edition is licensed under the\r\n\t\t\t\t<a href=\"/licenses/atomic_enterprise.html\" target=\"_blank\" style=\"color:#0033CC; text-decoration:underline\">Atomic Labs\r\n\t\t\t\tEnterprise Software License Agreement</a>.</p>\r\n\t\t\t\t\r\n\t\t\t\t<table>\r\n\t\t\t\t<tr>\r\n\t\t\t\t\t<td><big><strong>Name:</strong></big></td>\r\n\t\t\t\t\t<td><span id=\"license_name\" dojoAttachPoint=\"license_name\"></span></td>\r\n\t\t\t\t</tr>\r\n\t\t\t\t<tr>\r\n\t\t\t\t\t<td><big><strong>Email:</strong></big></td>\r\n\t\t\t\t\t<td><span id=\"license_email\" dojoAttachPoint=\"license_email\"></span></td>\r\n\t\t\t\t</tr>\r\n\t\t\t\t<tr>\r\n\t\t\t\t\t<td><big><strong>Version:</strong></big></td>\r\n\t\t\t\t\t<td><span id=\"license_version\" dojoAttachPoint=\"license_version\"></span></td>\r\n\t\t\t\t</tr>\r\n\t\t\t\t<tr>\r\n\t\t\t\t\t<td><big><strong>Expiration:</strong></big></td>\r\n\t\t\t\t\t<td><span id=\"license_expiration\" dojoAttachPoint=\"license_expiration\"></span></td>\r\n\t\t\t\t</tr>\r\n\t\t\t\t</table>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
var _this=this;
dojo.xhrGet({url:"/config",preventCache:true,handleAs:"xml",timeout:5000,load:function(_1743,_1744){
if(dojo.isIE){
var _1745=_1743.getElementsByTagName("Version")[0].childNodes[0].nodeValue;
}else{
var _1745=_1743.getElementsByTagName("Version")[0].textContent;
}
var _1746="Unknown";
dojo.xhrGet({url:"/key/status",preventCache:true,handleAs:"xml",timeout:5000,load:function(_1747,_1748){
if(dojo.isIE){
var _1749=_1747.getElementsByTagName("Status")[0].childNodes[0].nodeValue;
}else{
var _1749=_1747.getElementsByTagName("Status")[0].textContent;
}
_1746="Enterprise";
_this.doLicenseStuff(_1745,_1746,_1749);
return _1747;
},error:function(_174a,_174b){
if(_174b.xhr.status==404){
_1746="Community";
_this.doLicenseStuff(_1745,_1746,"404");
}
return _174a;
}});
return _1743;
}});
},submitKey:function(e){
var key=this.license_key.value;
console.debug("key = ",key);
var _this=this;
dojo.rawXhrPut({url:"/key",contentType:"text/plain",handleAs:"text",putData:key,load:function(_174f){
console.debug("response: ",_174f);
_this.hide();
pion.about.doDialog();
return _174f;
},error:function(_1750,_1751){
console.debug(_1751);
_this.result_of_submitting_key.innerHTML="Error: Key not accepted.";
return _1750;
}});
},doLicenseStuff:function(_1752,_1753,_1754){
console.debug("pion_version = ",_1752,", pion_edition = ",_1753,", key_status = ",_1754);
full_edition_str="Pion "+_1753+" Edition";
full_version_str=full_edition_str+" v"+_1752;
this.full_version.innerHTML=full_version_str;
if(_1753=="Community"){
this.community_license.style.display="block";
}else{
if(_1754=="valid"){
var _this=this;
dojo.xhrGet({url:"/key",preventCache:true,handleAs:"xml",timeout:5000,load:function(_1756,_1757){
if(dojo.isIE){
var _1758=_1756.getElementsByTagName("Name")[0].xml;
var _1759=_1756.getElementsByTagName("Email")[0].xml;
var _175a=_1756.getElementsByTagName("Version");
var _175b=_175a.length>0?_175a[0].xml:"";
var _175c=_1756.getElementsByTagName("Expiration");
var _175d=_175c.length>0?_175c[0].xml:"";
}else{
var _1758=_1756.getElementsByTagName("Name")[0].textContent;
var _1759=_1756.getElementsByTagName("Email")[0].textContent;
var _175a=_1756.getElementsByTagName("Version");
var _175b=_175a.length>0?_175a[0].textContent:"";
var _175c=_1756.getElementsByTagName("Expiration");
var _175d=_175c.length>0?_175c[0].textContent:"";
}
_this.license_name.innerHTML=_1758;
_this.license_email.innerHTML=_1759;
if(_175b==""){
_this.license_version.innerHTML="All versions";
}else{
_this.license_version.innerHTML=_175b;
}
if(_175d==""){
_this.license_expiration.innerHTML="None";
}else{
_this.license_expiration.innerHTML=_175d;
}
_this.enterprise_licensed.style.display="block";
return _1756;
},error:function(){
console.debug("error from xhrGet");
}});
}else{
if(_1754=="invalid"){
this.reason_needs_license.innerHTML="Invalid license key (may have expired).";
}else{
this.reason_needs_license.innerHTML="No license key found.";
}
this.enterprise_not_licensed.style.display="block";
}
}
}});
pion.about.doDialog=function(){
var _175e=new pion.about.LicenseKeyDialog();
_175e.show();
};
}
dojo.registerModulePath("pion","/scripts");
dojo.registerModulePath("plugins","/plugins");
var vocab_config_page_initialized=false;
var codec_config_page_initialized=false;
var database_config_page_initialized=false;
var protocol_config_page_initialized=false;
var user_config_page_initialized=false;
var system_config_page_initialized=false;
var file_protocol=false;
var firefox_on_mac;
pion.handleXhrError=function(_175f,_1760,_1761,_1762){
console.debug("In pion.handleXhrError: ioArgs.args = ",_1760.args);
if(_1760.xhr.status==401){
if(pion.login.login_pending){
var h=dojo.connect(pion.login,"onLoginSuccess",function(){
dojo.disconnect(h);
_1761(_1760.args);
});
}else{
if(!dojo.cookie("logged_in")){
location.replace("login.html");
}
pion.login.doLoginDialog(function(){
_1761(_1760.args);
});
}
return;
}else{
if(_1760.xhr.status==500){
var _1764=new dijit.Dialog({title:"Pion Server Error"});
_1764.setContent(_175f.responseText);
_1764.show();
}
if(_1762){
_1762();
}
}
return _175f;
};
pion.handleXhrGetError=function(_1765,_1766){
console.debug("In pion.handleXhrGetError: ioArgs.args = ",_1766.args);
return pion.handleXhrError(_1765,_1766,dojo.xhrGet);
};
pion.getXhrErrorHandler=function(_1767,_1768,_1769){
return function(_176a,_176b){
dojo.mixin(_176b.args,_1768);
return pion.handleXhrError(_176a,_176b,_1767,_1769);
};
};
pion.handleFetchError=function(_176c,_176d){
console.debug("In pion.handleFetchError: request = ",_176d,", errorData = "+_176c);
if(_176c.status==401){
if(pion.login.login_pending){
var h=dojo.connect(pion.login,"onLoginSuccess",function(){
dojo.disconnect(h);
_176d.store.fetch(_176d);
});
}else{
if(!dojo.cookie("logged_in")){
location.replace("login.html");
}
pion.login.doLoginDialog(function(){
_176d.store.fetch(_176d);
});
}
return;
}
};
var init=function(){
dojo.byId("outer").style.visibility="visible";
dojo.subscribe("main_stack_container-selectChild",configPageSelected);
file_protocol=(window.location.protocol=="file:");
firefox_on_mac=navigator.userAgent.indexOf("Mac")>=0&&navigator.userAgent.indexOf("Firefox")>=0;
dojo.xhrGet({url:"/config",preventCache:true,handleAs:"xml",timeout:5000,load:function(_176f,_1770){
dojo.cookie("logged_in","true",{expires:1});
pion.terms.init();
pion.reactors.init();
},error:function(_1771,_1772){
if(_1772.xhr.status==401){
if(!dojo.cookie("logged_in")){
location.replace("login.html");
}
pion.login.doLoginDialog(function(){
pion.terms.init();
pion.reactors.init();
});
}else{
console.error("HTTP status code: ",_1772.xhr.status);
}
return _1771;
}});
};
dojo.addOnLoad(init);
function configPageSelected(page){
console.debug("Selected "+page.title+" configuration page");
if(page.title=="Reactors"){
pion.reactors.reselectCurrentWorkspace();
dijit.byId("main_stack_container").resize({h:pion.reactors.getHeight()});
}else{
if(page.title=="Vocabularies"){
if(vocab_config_page_initialized){
dijit.byId("main_stack_container").resize({h:pion.vocabularies.getHeight()});
}else{
pion.vocabularies.init();
vocab_config_page_initialized=true;
}
}else{
if(page.title=="Codecs"){
if(codec_config_page_initialized){
pion.codecs._adjustAccordionSize();
dijit.byId("main_stack_container").resize({h:pion.codecs.getHeight()});
}else{
pion.codecs.init();
codec_config_page_initialized=true;
}
}else{
if(page.title=="Databases"){
if(database_config_page_initialized){
pion.databases._adjustAccordionSize();
dijit.byId("main_stack_container").resize({h:pion.databases.getHeight()});
}else{
pion.databases.init();
database_config_page_initialized=true;
}
}else{
if(page.title=="Protocols"){
if(protocol_config_page_initialized){
pion.protocols._adjustAccordionSize();
dijit.byId("main_stack_container").resize({h:pion.protocols.getHeight()});
}else{
pion.protocols.init();
protocol_config_page_initialized=true;
}
}else{
if(page.title=="Users"){
if(user_config_page_initialized){
dijit.byId("main_stack_container").resize({h:pion.users.getHeight()});
}else{
pion.users.init();
user_config_page_initialized=true;
}
}else{
if(page.title=="System"){
if(system_config_page_initialized){
dijit.byId("main_stack_container").resize({h:pion.system.getHeight()});
}else{
pion.system.init();
system_config_page_initialized=true;
}
}
}
}
}
}
}
}
};
dijit.form.TextBox.prototype._setValueAttr=function(value,_1775,_1776){
var _1777;
if(value!==undefined){
_1777=this.filter(value);
if(_1777!==null&&((typeof _1777!="number")||!isNaN(_1777))){
if(_1776===undefined||!_1776.toString){
_1776=this.format(_1777,this.constraints);
}
}else{
_1776="";
}
}
if(_1776!=null&&_1776!=undefined){
this.textbox.value=_1776;
}
dijit.form.TextBox.superclass._setValueAttr.call(this,_1777,_1775);
};
dojo.i18n._preloadLocalizations("dojo.nls.pion-dojo",["he","nl","tr","no","ko","el","en","en-gb","ROOT","zh-cn","hu","es","fi-fi","pt-br","ca","fi","he-il","xx","ru","it","fr","cs","de-de","fr-fr","it-it","es-es","ja","sk","da","sl","pl","de","sv","pt","pt-pt","nl-nl","zh-tw","ko-kr","ar","en-us","zh","th","ja-jp"]);
