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
if(!dojo._hasResource["dojox.html.metrics"]){
dojo._hasResource["dojox.html.metrics"]=true;
dojo.provide("dojox.html.metrics");
(function(){
var dhm=dojox.html.metrics;
dhm.getFontMeasurements=function(){
var _a05={"1em":0,"1ex":0,"100%":0,"12pt":0,"16px":0,"xx-small":0,"x-small":0,"small":0,"medium":0,"large":0,"x-large":0,"xx-large":0};
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
ds.border="0";
ds.margin="0";
ds.padding="0";
ds.outline="0";
ds.lineHeight="1";
ds.overflow="hidden";
dojo.body().appendChild(div);
for(var p in _a05){
ds.fontSize=p;
_a05[p]=Math.round(div.offsetHeight*12/16)*16/12/1000;
}
dojo.body().removeChild(div);
div=null;
return _a05;
};
var _a09=null;
dhm.getCachedFontMeasurements=function(_a0a){
if(_a0a||!_a09){
_a09=dhm.getFontMeasurements();
}
return _a09;
};
var _a0b=null,_a0c={};
dhm.getTextBox=function(text,_a0e,_a0f){
var m;
if(!_a0b){
m=_a0b=dojo.doc.createElement("div");
m.style.position="absolute";
m.style.left="-10000px";
m.style.top="0";
dojo.body().appendChild(m);
}else{
m=_a0b;
}
m.className="";
m.style.border="0";
m.style.margin="0";
m.style.padding="0";
m.style.outline="0";
if(arguments.length>1&&_a0e){
for(var i in _a0e){
if(i in _a0c){
continue;
}
m.style[i]=_a0e[i];
}
}
if(arguments.length>2&&_a0f){
m.className=_a0f;
}
m.innerHTML=text;
return dojo.marginBox(m);
};
var _a12={w:16,h:16};
dhm.getScrollbar=function(){
return {w:_a12.w,h:_a12.h};
};
dhm._fontResizeNode=null;
dhm.initOnFontResize=function(_a13){
var f=dhm._fontResizeNode=dojo.doc.createElement("iframe");
var fs=f.style;
fs.position="absolute";
fs.width="5em";
fs.height="10em";
fs.top="-10000px";
dojo.body().appendChild(f);
if(dojo.isIE){
f.onreadystatechange=function(){
if(f.contentWindow.document.readyState=="complete"){
f.onresize=Function("window.parent."+dojox._scopeName+".html.metrics._fontresize()");
}
};
}else{
f.onload=function(){
f.contentWindow.onresize=Function("window.parent."+dojox._scopeName+".html.metrics._fontresize()");
};
}
dhm.initOnFontResize=function(){
};
};
dhm.onFontResize=function(){
};
dhm._fontresize=function(){
dhm.onFontResize();
};
dojo.addOnLoad(function(){
try{
var n=dojo.doc.createElement("div");
n.style.cssText="top:0;left:0;width:100px;height:100px;overflow:scroll;position:absolute;visibility:hidden;";
dojo.body().appendChild(n);
_a12.w=n.offsetWidth-n.clientWidth;
_a12.h=n.offsetHeight-n.clientHeight;
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
dgu.fire=function(ob,ev,args){
var fn=ob&&ev&&ob[ev];
return fn&&(args?fn.apply(ob,args):ob[ev]());
};
dgu.setStyleHeightPx=function(_a1c,_a1d){
if(_a1d>=0){
var s=_a1c.style;
var v=_a1d+"px";
if(_a1c&&s["height"]!=v){
s["height"]=v;
}
}
};
dgu.mouseEvents=["mouseover","mouseout","mousedown","mouseup","click","dblclick","contextmenu"];
dgu.keyEvents=["keyup","keydown","keypress"];
dgu.funnelEvents=function(_a20,_a21,_a22,_a23){
var evts=(_a23?_a23:dgu.mouseEvents.concat(dgu.keyEvents));
for(var i=0,l=evts.length;i<l;i++){
_a21.connect(_a20,"on"+evts[i],_a22);
}
},dgu.removeNode=function(_a27){
_a27=dojo.byId(_a27);
_a27&&_a27.parentNode&&_a27.parentNode.removeChild(_a27);
return _a27;
};
dgu.arrayCompare=function(inA,inB){
for(var i=0,l=inA.length;i<l;i++){
if(inA[i]!=inB[i]){
return false;
}
}
return (inA.length==inB.length);
};
dgu.arrayInsert=function(_a2c,_a2d,_a2e){
if(_a2c.length<=_a2d){
_a2c[_a2d]=_a2e;
}else{
_a2c.splice(_a2d,0,_a2e);
}
};
dgu.arrayRemove=function(_a2f,_a30){
_a2f.splice(_a30,1);
};
dgu.arraySwap=function(_a31,inI,inJ){
var _a34=_a31[inI];
_a31[inI]=_a31[inJ];
_a31[inJ]=_a34;
};
})();
}
if(!dojo._hasResource["dojox.grid._Scroller"]){
dojo._hasResource["dojox.grid._Scroller"]=true;
dojo.provide("dojox.grid._Scroller");
(function(){
var _a35=function(_a36){
var i=0,n,p=_a36.parentNode;
while((n=p.childNodes[i++])){
if(n==_a36){
return i-1;
}
}
return -1;
};
var _a3a=function(_a3b){
if(!_a3b){
return;
}
var _a3c=function(inW){
return inW.domNode&&dojo.isDescendant(inW.domNode,_a3b,true);
};
var ws=dijit.registry.filter(_a3c);
for(var i=0,w;(w=ws[i]);i++){
w.destroy();
}
delete ws;
};
var _a41=function(_a42){
var node=dojo.byId(_a42);
return (node&&node.tagName?node.tagName.toLowerCase():"");
};
var _a44=function(_a45,_a46){
var _a47=[];
var i=0,n;
while((n=_a45.childNodes[i++])){
if(_a41(n)==_a46){
_a47.push(n);
}
}
return _a47;
};
var _a4a=function(_a4b){
return _a44(_a4b,"div");
};
dojo.declare("dojox.grid._Scroller",null,{constructor:function(_a4c){
this.setContentNodes(_a4c);
this.pageHeights=[];
this.pageNodes=[];
this.stack=[];
},rowCount:0,defaultRowHeight:32,keepRows:100,contentNode:null,scrollboxNode:null,defaultPageHeight:0,keepPages:10,pageCount:0,windowHeight:0,firstVisibleRow:0,lastVisibleRow:0,averageRowHeight:0,page:0,pageTop:0,init:function(_a4d,_a4e,_a4f){
switch(arguments.length){
case 3:
this.rowsPerPage=_a4f;
case 2:
this.keepRows=_a4e;
case 1:
this.rowCount=_a4d;
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
},_getPageCount:function(_a50,_a51){
return _a50?(Math.ceil(_a50/_a51)||1):0;
},destroy:function(){
this.invalidateNodes();
delete this.contentNodes;
delete this.contentNode;
delete this.scrollboxNode;
},setKeepInfo:function(_a52){
this.keepRows=_a52;
this.keepPages=!this.keepRows?this.keepRows:Math.max(Math.ceil(this.keepRows/this.rowsPerPage),2);
},setContentNodes:function(_a53){
this.contentNodes=_a53;
this.colCount=(this.contentNodes?this.contentNodes.length:0);
this.pageNodes=[];
for(var i=0;i<this.colCount;i++){
this.pageNodes[i]=[];
}
},getDefaultNodes:function(){
return this.pageNodes[0]||[];
},invalidate:function(){
this.invalidateNodes();
this.pageHeights=[];
this.height=(this.pageCount?(this.pageCount-1)*this.defaultPageHeight+this.calcLastPageHeight():0);
this.resize();
},updateRowCount:function(_a55){
this.invalidateNodes();
this.rowCount=_a55;
var _a56=this.pageCount;
this.pageCount=this._getPageCount(this.rowCount,this.rowsPerPage);
if(this.pageCount<_a56){
for(var i=_a56-1;i>=this.pageCount;i--){
this.height-=this.getPageHeight(i);
delete this.pageHeights[i];
}
}else{
if(this.pageCount>_a56){
this.height+=this.defaultPageHeight*(this.pageCount-_a56-1)+this.calcLastPageHeight();
}
}
this.resize();
},pageExists:function(_a58){
return Boolean(this.getDefaultPageNode(_a58));
},measurePage:function(_a59){
var n=this.getDefaultPageNode(_a59);
return (n&&n.innerHTML)?n.offsetHeight:0;
},positionPage:function(_a5b,_a5c){
for(var i=0;i<this.colCount;i++){
this.pageNodes[i][_a5b].style.top=_a5c+"px";
}
},repositionPages:function(_a5e){
var _a5f=this.getDefaultNodes();
var last=0;
for(var i=0;i<this.stack.length;i++){
last=Math.max(this.stack[i],last);
}
var n=_a5f[_a5e];
var y=(n?this.getPageNodePosition(n)+this.getPageHeight(_a5e):0);
for(var p=_a5e+1;p<=last;p++){
n=_a5f[p];
if(n){
if(this.getPageNodePosition(n)==y){
return;
}
this.positionPage(p,y);
}
y+=this.getPageHeight(p);
}
},installPage:function(_a65){
for(var i=0;i<this.colCount;i++){
this.contentNodes[i].appendChild(this.pageNodes[i][_a65]);
}
},preparePage:function(_a67,_a68,_a69){
var p=(_a69?this.popPage():null);
for(var i=0;i<this.colCount;i++){
var _a6c=this.pageNodes[i];
var _a6d=(p===null?this.createPageNode():this.invalidatePageNode(p,_a6c));
_a6d.pageIndex=_a67;
_a6d.id=(this._pageIdPrefix||"")+"page-"+_a67;
_a6c[_a67]=_a6d;
}
},renderPage:function(_a6e){
var _a6f=[];
for(var i=0;i<this.colCount;i++){
_a6f[i]=this.pageNodes[i][_a6e];
}
for(var i=0,j=_a6e*this.rowsPerPage;(i<this.rowsPerPage)&&(j<this.rowCount);i++,j++){
this.renderRow(j,_a6f);
}
},removePage:function(_a72){
for(var i=0,j=_a72*this.rowsPerPage;i<this.rowsPerPage;i++,j++){
this.removeRow(j);
}
},destroyPage:function(_a75){
for(var i=0;i<this.colCount;i++){
var n=this.invalidatePageNode(_a75,this.pageNodes[i]);
if(n){
dojo._destroyElement(n);
}
}
},pacify:function(_a78){
},pacifying:false,pacifyTicks:200,setPacifying:function(_a79){
if(this.pacifying!=_a79){
this.pacifying=_a79;
this.pacify(this.pacifying);
}
},startPacify:function(){
this.startPacifyTicks=new Date().getTime();
},doPacify:function(){
var _a7a=(new Date().getTime()-this.startPacifyTicks)>this.pacifyTicks;
this.setPacifying(true);
this.startPacify();
return _a7a;
},endPacify:function(){
this.setPacifying(false);
},resize:function(){
if(this.scrollboxNode){
this.windowHeight=this.scrollboxNode.clientHeight;
}
for(var i=0;i<this.colCount;i++){
dojox.grid.util.setStyleHeightPx(this.contentNodes[i],this.height);
}
this.needPage(this.page,this.pageTop);
var _a7c=(this.page<this.pageCount-1)?this.rowsPerPage:(this.rowCount%this.rowsPerPage);
var _a7d=this.getPageHeight(this.page);
this.averageRowHeight=(_a7d>0&&_a7c>0)?(_a7d/_a7c):0;
},calcLastPageHeight:function(){
if(!this.pageCount){
return 0;
}
var _a7e=this.pageCount-1;
var _a7f=((this.rowCount%this.rowsPerPage)||(this.rowsPerPage))*this.defaultRowHeight;
this.pageHeights[_a7e]=_a7f;
return _a7f;
},updateContentHeight:function(inDh){
this.height+=inDh;
this.resize();
},updatePageHeight:function(_a81){
if(this.pageExists(_a81)){
var oh=this.getPageHeight(_a81);
var h=(this.measurePage(_a81))||(oh);
this.pageHeights[_a81]=h;
if((h)&&(oh!=h)){
this.updateContentHeight(h-oh);
this.repositionPages(_a81);
}
}
},rowHeightChanged:function(_a84){
this.updatePageHeight(Math.floor(_a84/this.rowsPerPage));
},invalidateNodes:function(){
while(this.stack.length){
this.destroyPage(this.popPage());
}
},createPageNode:function(){
var p=document.createElement("div");
p.style.position="absolute";
p.style[dojo._isBodyLtr()?"left":"right"]="0";
return p;
},getPageHeight:function(_a86){
var ph=this.pageHeights[_a86];
return (ph!==undefined?ph:this.defaultPageHeight);
},pushPage:function(_a88){
return this.stack.push(_a88);
},popPage:function(){
return this.stack.shift();
},findPage:function(_a89){
var i=0,h=0;
for(var ph=0;i<this.pageCount;i++,h+=ph){
ph=this.getPageHeight(i);
if(h+ph>=_a89){
break;
}
}
this.page=i;
this.pageTop=h;
},buildPage:function(_a8d,_a8e,_a8f){
this.preparePage(_a8d,_a8e);
this.positionPage(_a8d,_a8f);
this.installPage(_a8d);
this.renderPage(_a8d);
this.pushPage(_a8d);
},needPage:function(_a90,_a91){
var h=this.getPageHeight(_a90),oh=h;
if(!this.pageExists(_a90)){
this.buildPage(_a90,this.keepPages&&(this.stack.length>=this.keepPages),_a91);
h=this.measurePage(_a90)||h;
this.pageHeights[_a90]=h;
if(h&&(oh!=h)){
this.updateContentHeight(h-oh);
}
}else{
this.positionPage(_a90,_a91);
}
return h;
},onscroll:function(){
this.scroll(this.scrollboxNode.scrollTop);
},scroll:function(_a94){
this.grid.scrollTop=_a94;
if(this.colCount){
this.startPacify();
this.findPage(_a94);
var h=this.height;
var b=this.getScrollBottom(_a94);
for(var p=this.page,y=this.pageTop;(p<this.pageCount)&&((b<0)||(y<b));p++){
y+=this.needPage(p,y);
}
this.firstVisibleRow=this.getFirstVisibleRow(this.page,this.pageTop,_a94);
this.lastVisibleRow=this.getLastVisibleRow(p-1,y,b);
if(h!=this.height){
this.repositionPages(p-1);
}
this.endPacify();
}
},getScrollBottom:function(_a99){
return (this.windowHeight>=0?_a99+this.windowHeight:-1);
},processNodeEvent:function(e,_a9b){
var t=e.target;
while(t&&(t!=_a9b)&&t.parentNode&&(t.parentNode.parentNode!=_a9b)){
t=t.parentNode;
}
if(!t||!t.parentNode||(t.parentNode.parentNode!=_a9b)){
return false;
}
var page=t.parentNode;
e.topRowIndex=page.pageIndex*this.rowsPerPage;
e.rowIndex=e.topRowIndex+_a35(t);
e.rowTarget=t;
return true;
},processEvent:function(e){
return this.processNodeEvent(e,this.contentNode);
},renderRow:function(_a9f,_aa0){
},removeRow:function(_aa1){
},getDefaultPageNode:function(_aa2){
return this.getDefaultNodes()[_aa2];
},positionPageNode:function(_aa3,_aa4){
},getPageNodePosition:function(_aa5){
return _aa5.offsetTop;
},invalidatePageNode:function(_aa6,_aa7){
var p=_aa7[_aa6];
if(p){
delete _aa7[_aa6];
this.removePage(_aa6,p);
_a3a(p);
p.innerHTML="";
}
return p;
},getPageRow:function(_aa9){
return _aa9*this.rowsPerPage;
},getLastPageRow:function(_aaa){
return Math.min(this.rowCount,this.getPageRow(_aaa+1))-1;
},getFirstVisibleRow:function(_aab,_aac,_aad){
if(!this.pageExists(_aab)){
return 0;
}
var row=this.getPageRow(_aab);
var _aaf=this.getDefaultNodes();
var rows=_a4a(_aaf[_aab]);
for(var i=0,l=rows.length;i<l&&_aac<_aad;i++,row++){
_aac+=rows[i].offsetHeight;
}
return (row?row-1:row);
},getLastVisibleRow:function(_ab3,_ab4,_ab5){
if(!this.pageExists(_ab3)){
return 0;
}
var _ab6=this.getDefaultNodes();
var row=this.getLastPageRow(_ab3);
var rows=_a4a(_ab6[_ab3]);
for(var i=rows.length-1;i>=0&&_ab4>_ab5;i--,row--){
_ab4-=rows[i].offsetHeight;
}
return row+1;
},findTopRow:function(_aba){
var _abb=this.getDefaultNodes();
var rows=_a4a(_abb[this.page]);
for(var i=0,l=rows.length,t=this.pageTop,h;i<l;i++){
h=rows[i].offsetHeight;
t+=h;
if(t>=_aba){
this.offset=h-(t-_aba);
return i+this.page*this.rowsPerPage;
}
}
return -1;
},findScrollTop:function(_ac1){
var _ac2=Math.floor(_ac1/this.rowsPerPage);
var t=0;
for(var i=0;i<_ac2;i++){
t+=this.getPageHeight(i);
}
this.pageTop=t;
this.needPage(_ac2,this.pageTop);
var _ac5=this.getDefaultNodes();
var rows=_a4a(_ac5[_ac2]);
var r=_ac1-this.rowsPerPage*_ac2;
for(var i=0,l=rows.length;i<l&&i<r;i++){
t+=rows[i].offsetHeight;
}
return t;
},dummy:0});
})();
}
if(!dojo._hasResource["dojox.grid.cells._base"]){
dojo._hasResource["dojox.grid.cells._base"]=true;
dojo.provide("dojox.grid.cells._base");
(function(){
var _ac9=function(_aca){
try{
dojox.grid.util.fire(_aca,"focus");
dojox.grid.util.fire(_aca,"select");
}
catch(e){
}
};
var _acb=function(){
setTimeout(dojo.hitch.apply(dojo,arguments),0);
};
var dgc=dojox.grid.cells;
dojo.declare("dojox.grid.cells._Base",null,{styles:"",classes:"",editable:false,alwaysEditing:false,formatter:null,defaultValue:"...",value:null,hidden:false,_valueProp:"value",_formatPending:false,constructor:function(_acd){
this._props=_acd||{};
dojo.mixin(this,_acd);
},format:function(_ace,_acf){
var f,i=this.grid.edit.info,d=this.get?this.get(_ace,_acf):(this.value||this.defaultValue);
if(this.editable&&(this.alwaysEditing||(i.rowIndex==_ace&&i.cell==this))){
return this.formatEditing(d,_ace);
}else{
var v=(d!=this.defaultValue&&(f=this.formatter))?f.call(this,d,_ace):d;
return (typeof v=="undefined"?this.defaultValue:v);
}
},formatEditing:function(_ad4,_ad5){
},getNode:function(_ad6){
return this.view.getCellNode(_ad6,this.index);
},getHeaderNode:function(){
return this.view.getHeaderCellNode(this.index);
},getEditNode:function(_ad7){
return (this.getNode(_ad7)||0).firstChild||0;
},canResize:function(){
var uw=this.unitWidth;
return uw&&(uw=="auto");
},isFlex:function(){
var uw=this.unitWidth;
return uw&&(uw=="auto"||uw.slice(-1)=="%");
},applyEdit:function(_ada,_adb){
this.grid.edit.applyCellEdit(_ada,this,_adb);
},cancelEdit:function(_adc){
this.grid.doCancelEdit(_adc);
},_onEditBlur:function(_add){
if(this.grid.edit.isEditCell(_add,this.index)){
this.grid.edit.apply();
}
},registerOnBlur:function(_ade,_adf){
if(this.commitOnBlur){
dojo.connect(_ade,"onblur",function(e){
setTimeout(dojo.hitch(this,"_onEditBlur",_adf),250);
});
}
},needFormatNode:function(_ae1,_ae2){
this._formatPending=true;
_acb(this,"_formatNode",_ae1,_ae2);
},cancelFormatNode:function(){
this._formatPending=false;
},_formatNode:function(_ae3,_ae4){
if(this._formatPending){
this._formatPending=false;
dojo.setSelectable(this.grid.domNode,true);
this.formatNode(this.getEditNode(_ae4),_ae3,_ae4);
}
},formatNode:function(_ae5,_ae6,_ae7){
if(dojo.isIE){
_acb(this,"focus",_ae7,_ae5);
}else{
this.focus(_ae7,_ae5);
}
},dispatchEvent:function(m,e){
if(m in this){
return this[m](e);
}
},getValue:function(_aea){
return this.getEditNode(_aea)[this._valueProp];
},setValue:function(_aeb,_aec){
var n=this.getEditNode(_aeb);
if(n){
n[this._valueProp]=_aec;
}
},focus:function(_aee,_aef){
_ac9(_aef||this.getEditNode(_aee));
},save:function(_af0){
this.value=this.value||this.getValue(_af0);
},restore:function(_af1){
this.setValue(_af1,this.value);
},_finish:function(_af2){
dojo.setSelectable(this.grid.domNode,false);
this.cancelFormatNode();
},apply:function(_af3){
this.applyEdit(this.getValue(_af3),_af3);
this._finish(_af3);
},cancel:function(_af4){
this.cancelEdit(_af4);
this._finish(_af4);
}});
dgc._Base.markupFactory=function(node,_af6){
var d=dojo;
var _af8=d.trim(d.attr(node,"formatter")||"");
if(_af8){
_af6.formatter=dojo.getObject(_af8);
}
var get=d.trim(d.attr(node,"get")||"");
if(get){
_af6.get=dojo.getObject(get);
}
var _afa=d.trim(d.attr(node,"sortDesc")||"");
if(_afa){
_af6.sortDesc=!(_afa.toLowerCase()=="false");
}
var _afb=d.trim(d.attr(node,"loadingText")||d.attr(node,"defaultValue")||"");
if(_afb){
_af6.defaultValue=_afb;
}
var _afc=d.trim(d.attr(node,"editable")||"");
if(_afc){
_af6.editable=!(_afc.toLowerCase()=="false");
}
var _afd=d.trim(d.attr(node,"alwaysEditing")||"");
if(_afd){
_af6.alwaysEditing=!(_afd.toLowerCase()=="false");
}
var _afe=d.trim(d.attr(node,"styles")||"");
if(_afe){
_af6.styles=_afe;
}
var _aff=d.trim(d.attr(node,"classes")||"");
if(_aff){
_af6.classes=_aff;
}
};
dojo.declare("dojox.grid.cells.Cell",dgc._Base,{constructor:function(){
this.keyFilter=this.keyFilter;
},keyFilter:null,formatEditing:function(_b00,_b01){
this.needFormatNode(_b00,_b01);
return "<input class=\"dojoxGridInput\" type=\"text\" value=\""+_b00+"\">";
},formatNode:function(_b02,_b03,_b04){
this.inherited(arguments);
this.registerOnBlur(_b02,_b04);
},doKey:function(e){
if(this.keyFilter){
var key=String.fromCharCode(e.charCode);
if(key.search(this.keyFilter)==-1){
dojo.stopEvent(e);
}
}
},_finish:function(_b07){
this.inherited(arguments);
var n=this.getEditNode(_b07);
try{
dojox.grid.util.fire(n,"blur");
}
catch(e){
}
}});
dgc.Cell.markupFactory=function(node,_b0a){
dgc._Base.markupFactory(node,_b0a);
var d=dojo;
var _b0c=d.trim(d.attr(node,"keyFilter")||"");
if(_b0c){
_b0a.keyFilter=new RegExp(_b0c);
}
};
dojo.declare("dojox.grid.cells.RowIndex",dgc.Cell,{name:"Row",postscript:function(){
this.editable=false;
},get:function(_b0d){
return _b0d+1;
}});
dgc.RowIndex.markupFactory=function(node,_b0f){
dgc.Cell.markupFactory(node,_b0f);
};
dojo.declare("dojox.grid.cells.Select",dgc.Cell,{options:null,values:null,returnIndex:-1,constructor:function(_b10){
this.values=this.values||this.options;
},formatEditing:function(_b11,_b12){
this.needFormatNode(_b11,_b12);
var h=["<select class=\"dojoxGridSelect\">"];
for(var i=0,o,v;((o=this.options[i])!==undefined)&&((v=this.values[i])!==undefined);i++){
h.push("<option",(_b11==v?" selected":"")," value=\""+v+"\"",">",o,"</option>");
}
h.push("</select>");
return h.join("");
},getValue:function(_b17){
var n=this.getEditNode(_b17);
if(n){
var i=n.selectedIndex,o=n.options[i];
return this.returnIndex>-1?i:o.value||o.innerHTML;
}
}});
dgc.Select.markupFactory=function(node,cell){
dgc.Cell.markupFactory(node,cell);
var d=dojo;
var _b1e=d.trim(d.attr(node,"options")||"");
if(_b1e){
var o=_b1e.split(",");
if(o[0]!=_b1e){
cell.options=o;
}
}
var _b20=d.trim(d.attr(node,"values")||"");
if(_b20){
var v=_b20.split(",");
if(v[0]!=_b20){
cell.values=v;
}
}
};
dojo.declare("dojox.grid.cells.AlwaysEdit",dgc.Cell,{alwaysEditing:true,_formatNode:function(_b22,_b23){
this.formatNode(this.getEditNode(_b23),_b22,_b23);
},applyStaticValue:function(_b24){
var e=this.grid.edit;
e.applyCellEdit(this.getValue(_b24),this,_b24);
e.start(this,_b24,true);
}});
dgc.AlwaysEdit.markupFactory=function(node,cell){
dgc.Cell.markupFactory(node,cell);
};
dojo.declare("dojox.grid.cells.Bool",dgc.AlwaysEdit,{_valueProp:"checked",formatEditing:function(_b28,_b29){
return "<input class=\"dojoxGridInput\" type=\"checkbox\""+(_b28?" checked=\"checked\"":"")+" style=\"width: auto\" />";
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
if(!dojo._hasResource["dojox.grid._View"]){
dojo._hasResource["dojox.grid._View"]=true;
dojo.provide("dojox.grid._View");
(function(){
var _b2d="gridRowIndex";
var _b2e="gridView";
var _b2f=function(td){
return td.cellIndex>=0?td.cellIndex:dojo.indexOf(td.parentNode.cells,td);
};
var _b31=function(tr){
return tr.rowIndex>=0?tr.rowIndex:dojo.indexOf(tr.parentNode.childNodes,tr);
};
var _b33=function(_b34,_b35){
return _b34&&((_b34.rows||0)[_b35]||_b34.childNodes[_b35]);
};
var _b36=function(node){
for(var n=node;n&&n.tagName!="TABLE";n=n.parentNode){
}
return n;
};
var _b39=function(_b3a,_b3b){
for(var n=_b3a;n&&_b3b(n);n=n.parentNode){
}
return n;
};
var _b3d=function(_b3e){
var name=_b3e.toUpperCase();
return function(node){
return node.tagName!=name;
};
};
var _b41=function(_b42,_b43){
return _b42.style.cssText==undefined?_b42.getAttribute("style"):_b42.style.cssText;
};
var _b44=function(view){
if(view){
this.view=view;
this.grid=view.grid;
}
};
dojo.extend(_b44,{view:null,_table:"<table class=\"dojoxGridRowTable\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"wairole:presentation\"",getTableArray:function(){
var html=[this._table];
if(this.view.viewWidth){
html.push([" style=\"width:",this.view.viewWidth,";\""].join(""));
}
html.push(">");
return html;
},generateCellMarkup:function(_b47,_b48,_b49,_b4a){
var _b4b=[],html;
if(_b4a){
html=["<th tabIndex=\"-1\" role=\"wairole:columnheader\""];
}else{
html=["<td tabIndex=\"-1\" role=\"wairole:gridcell\""];
}
_b47.colSpan&&html.push(" colspan=\"",_b47.colSpan,"\"");
_b47.rowSpan&&html.push(" rowspan=\"",_b47.rowSpan,"\"");
html.push(" class=\"dojoxGridCell ");
_b47.classes&&html.push(_b47.classes," ");
_b49&&html.push(_b49," ");
_b4b.push(html.join(""));
_b4b.push("");
html=["\" idx=\"",_b47.index,"\" style=\""];
if(_b48&&_b48[_b48.length-1]!=";"){
_b48+=";";
}
html.push(_b47.styles,_b48||"",_b47.hidden?"display:none;":"");
_b47.unitWidth&&html.push("width:",_b47.unitWidth,";");
_b4b.push(html.join(""));
_b4b.push("");
html=["\""];
_b47.attrs&&html.push(" ",_b47.attrs);
html.push(">");
_b4b.push(html.join(""));
_b4b.push("");
_b4b.push("</td>");
return _b4b;
},isCellNode:function(_b4d){
return Boolean(_b4d&&_b4d!=dojo.doc&&dojo.attr(_b4d,"idx"));
},getCellNodeIndex:function(_b4e){
return _b4e?Number(dojo.attr(_b4e,"idx")):-1;
},getCellNode:function(_b4f,_b50){
for(var i=0,row;row=_b33(_b4f.firstChild,i);i++){
for(var j=0,cell;cell=row.cells[j];j++){
if(this.getCellNodeIndex(cell)==_b50){
return cell;
}
}
}
},findCellTarget:function(_b55,_b56){
var n=_b55;
while(n&&(!this.isCellNode(n)||(n.offsetParent&&_b2e in n.offsetParent.parentNode&&n.offsetParent.parentNode[_b2e]!=this.view.id))&&(n!=_b56)){
n=n.parentNode;
}
return n!=_b56?n:null;
},baseDecorateEvent:function(e){
e.dispatch="do"+e.type;
e.grid=this.grid;
e.sourceView=this.view;
e.cellNode=this.findCellTarget(e.target,e.rowNode);
e.cellIndex=this.getCellNodeIndex(e.cellNode);
e.cell=(e.cellIndex>=0?this.grid.getCell(e.cellIndex):null);
},findTarget:function(_b59,_b5a){
var n=_b59;
while(n&&(n!=this.domNode)&&(!(_b5a in n)||(_b2e in n&&n[_b2e]!=this.view.id))){
n=n.parentNode;
}
return (n!=this.domNode)?n:null;
},findRowTarget:function(_b5c){
return this.findTarget(_b5c,_b2d);
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
var _b64=function(view){
_b44.call(this,view);
};
_b64.prototype=new _b44();
dojo.extend(_b64,{update:function(){
this.prepareHtml();
},prepareHtml:function(){
var _b66=this.grid.get,_b67=this.view.structure.cells;
for(var j=0,row;(row=_b67[j]);j++){
for(var i=0,cell;(cell=row[i]);i++){
cell.get=cell.get||(cell.value==undefined)&&_b66;
cell.markup=this.generateCellMarkup(cell,cell.cellStyles,cell.cellClasses,false);
}
}
},generateHtml:function(_b6c,_b6d){
var html=this.getTableArray(),v=this.view,_b70=v.structure.cells,item=this.grid.getItem(_b6d);
dojox.grid.util.fire(this.view,"onBeforeRow",[_b6d,_b70]);
for(var j=0,row;(row=_b70[j]);j++){
if(row.hidden||row.header){
continue;
}
html.push(!row.invisible?"<tr>":"<tr class=\"dojoxGridInvisible\">");
for(var i=0,cell,m,cc,cs;(cell=row[i]);i++){
m=cell.markup,cc=cell.customClasses=[],cs=cell.customStyles=[];
m[5]=cell.format(_b6d,item);
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
e.rowIndex=e.rowNode[_b2d];
this.baseDecorateEvent(e);
e.cell=this.grid.getCell(e.cellIndex);
return true;
}});
var _b7a=null;
var _b7b=function(view){
_b44.call(this,view);
};
_b7b.prototype=new _b44();
dojo.extend(_b7b,{_skipBogusClicks:false,overResizeWidth:4,minColWidth:1,update:function(){
this.tableMap=new _b7d(this.view.structure.cells);
},generateHtml:function(_b7e,_b7f){
var html=this.getTableArray(),_b81=this.view.structure.cells;
dojox.grid.util.fire(this.view,"onBeforeRow",[-1,_b81]);
for(var j=0,row;(row=_b81[j]);j++){
if(row.hidden){
continue;
}
html.push(!row.invisible?"<tr>":"<tr class=\"dojoxGridInvisible\">");
for(var i=0,cell,_b86;(cell=row[i]);i++){
cell.customClasses=[];
cell.customStyles=[];
if(this.view.simpleStructure){
if(cell.headerClasses){
if(cell.headerClasses.indexOf("dojoDndItem")==-1){
cell.headerClasses+=" dojoDndItem";
}
}else{
cell.headerClasses="dojoDndItem";
}
if(cell.attrs){
if(cell.attrs.indexOf("dndType='gridColumn'")==-1){
cell.attrs+=" dndType='gridColumn_"+this.grid.id+"'";
}
}else{
cell.attrs="dndType='gridColumn_"+this.grid.id+"'";
}
}
_b86=this.generateCellMarkup(cell,cell.headerStyles,cell.headerClasses,true);
_b86[5]=(_b7f!=undefined?_b7f:_b7e(cell));
_b86[3]=cell.customStyles.join(";");
_b86[1]=cell.customClasses.join(" ");
html.push(_b86.join(""));
}
html.push("</tr>");
}
html.push("</table>");
return html.join("");
},getCellX:function(e){
var x=e.layerX;
if(dojo.isMoz){
var n=_b39(e.target,_b3d("th"));
x-=(n&&n.offsetLeft)||0;
var t=e.sourceView.getScrollbarWidth();
if(!dojo._isBodyLtr()&&e.sourceView.headerNode.scrollLeft<t){
x-=t;
}
}
var n=_b39(e.target,function(){
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
var i=_b2f(e.cellNode);
e.cellNode=(i?e.cellNode.parentNode.cells[i+mod]:null);
e.cellIndex=(e.cellNode?this.getCellNodeIndex(e.cellNode):-1);
}while(e.cellNode&&e.cellNode.style.display=="none");
return Boolean(e.cellNode);
},canResize:function(e){
if(!e.cellNode||e.cellNode.colSpan>1){
return false;
}
var cell=this.grid.getCell(e.cellIndex);
return !cell.noresize&&!cell.canResize();
},overLeftResizeArea:function(e){
if(dojo._isBodyLtr()){
return (e.cellIndex>0)&&(e.cellX<this.overResizeWidth)&&this.prepareResize(e,-1);
}
var t=e.cellNode&&(e.cellX<this.overResizeWidth);
return t;
},overRightResizeArea:function(e){
if(dojo._isBodyLtr()){
return e.cellNode&&(e.cellX>=e.cellNode.offsetWidth-this.overResizeWidth);
}
return (e.cellIndex>0)&&(e.cellX>=e.cellNode.offsetWidth-this.overResizeWidth)&&this.prepareResize(e,-1);
},domousemove:function(e){
if(!_b7a){
var c=(this.overRightResizeArea(e)?"e-resize":(this.overLeftResizeArea(e)?"w-resize":""));
if(c&&!this.canResize(e)){
c="not-allowed";
}
if(dojo.isIE){
var t=e.sourceView.headerNode.scrollLeft;
e.sourceView.headerNode.style.cursor=c||"";
e.sourceView.headerNode.scrollLeft=t;
}else{
e.sourceView.headerNode.style.cursor=c||"";
}
if(c){
dojo.stopEvent(e);
}
}
},domousedown:function(e){
if(!_b7a){
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
},beginColumnResize:function(e){
this.moverDiv=document.createElement("div");
dojo.style(this.moverDiv,{position:"absolute",left:0});
dojo.body().appendChild(this.moverDiv);
var m=_b7a=new dojo.dnd.Moveable(this.moverDiv);
var _b9b=[],_b9c=this.tableMap.findOverlappingNodes(e.cellNode);
for(var i=0,cell;(cell=_b9c[i]);i++){
_b9b.push({node:cell,index:this.getCellNodeIndex(cell),width:cell.offsetWidth});
}
var view=e.sourceView;
var adj=dojo._isBodyLtr()?1:-1;
var _ba1=e.grid.views.views;
var _ba2=[];
for(var i=view.idx+adj,_ba3;(_ba3=_ba1[i]);i=i+adj){
_ba2.push({node:_ba3.headerNode,left:window.parseInt(_ba3.headerNode.style.left)});
}
var _ba4=view.headerContentNode.firstChild;
var drag={scrollLeft:e.sourceView.headerNode.scrollLeft,view:view,node:e.cellNode,index:e.cellIndex,w:dojo.contentBox(e.cellNode).w,vw:dojo.contentBox(view.headerNode).w,table:_ba4,tw:dojo.contentBox(_ba4).w,spanners:_b9b,followers:_ba2};
m.onMove=dojo.hitch(this,"doResizeColumn",drag);
dojo.connect(m,"onMoveStop",dojo.hitch(this,function(){
this.endResizeColumn(drag);
if(drag.node.releaseCapture){
drag.node.releaseCapture();
}
_b7a.destroy();
delete _b7a;
_b7a=null;
}));
view.convertColPctToFixed();
if(e.cellNode.setCapture){
e.cellNode.setCapture();
}
m.onMouseDown(e);
},doResizeColumn:function(_ba6,_ba7,_ba8){
var _ba9=dojo._isBodyLtr();
var _baa=_ba9?_ba8.l:-_ba8.l;
var w=_ba6.w+_baa;
var vw=_ba6.vw+_baa;
var tw=_ba6.tw+_baa;
if(w>=this.minColWidth){
for(var i=0,s,sw;(s=_ba6.spanners[i]);i++){
sw=s.width+_baa;
s.node.style.width=sw+"px";
_ba6.view.setColWidth(s.index,sw);
}
for(var i=0,f,fl;(f=_ba6.followers[i]);i++){
fl=f.left+_baa;
f.node.style.left=fl+"px";
}
_ba6.node.style.width=w+"px";
_ba6.view.setColWidth(_ba6.index,w);
_ba6.view.headerNode.style.width=vw+"px";
_ba6.view.setColumnsWidth(tw);
if(!_ba9){
_ba6.view.headerNode.scrollLeft=_ba6.scrollLeft+_baa;
}
}
if(_ba6.view.flexCells&&!_ba6.view.testFlexCells()){
var t=_b36(_ba6.node);
t&&(t.style.width="");
}
},endResizeColumn:function(_bb4){
dojo._destroyElement(this.moverDiv);
delete this.moverDiv;
this._skipBogusClicks=true;
var conn=dojo.connect(_bb4.view,"update",this,function(){
dojo.disconnect(conn);
this._skipBogusClicks=false;
});
setTimeout(dojo.hitch(_bb4.view,"update"),50);
}});
var _b7d=function(rows){
this.mapRows(rows);
};
dojo.extend(_b7d,{map:null,mapRows:function(_bb7){
var _bb8=_bb7.length;
if(!_bb8){
return;
}
this.map=[];
for(var j=0,row;(row=_bb7[j]);j++){
this.map[j]=[];
}
for(var j=0,row;(row=_bb7[j]);j++){
for(var i=0,x=0,cell,_bbe,_bbf;(cell=row[i]);i++){
while(this.map[j][x]){
x++;
}
this.map[j][x]={c:i,r:j};
_bbf=cell.rowSpan||1;
_bbe=cell.colSpan||1;
for(var y=0;y<_bbf;y++){
for(var s=0;s<_bbe;s++){
this.map[j+y][x+s]=this.map[j][x];
}
}
x+=_bbe;
}
}
},dumpMap:function(){
for(var j=0,row,h="";(row=this.map[j]);j++,h=""){
for(var i=0,cell;(cell=row[i]);i++){
h+=cell.r+","+cell.c+"   ";
}
}
},getMapCoords:function(_bc7,_bc8){
for(var j=0,row;(row=this.map[j]);j++){
for(var i=0,cell;(cell=row[i]);i++){
if(cell.c==_bc8&&cell.r==_bc7){
return {j:j,i:i};
}
}
}
return {j:-1,i:-1};
},getNode:function(_bcd,_bce,_bcf){
var row=_bcd&&_bcd.rows[_bce];
return row&&row.cells[_bcf];
},_findOverlappingNodes:function(_bd1,_bd2,_bd3){
var _bd4=[];
var m=this.getMapCoords(_bd2,_bd3);
var row=this.map[m.j];
for(var j=0,row;(row=this.map[j]);j++){
if(j==m.j){
continue;
}
var rw=row[m.i];
var n=(rw?this.getNode(_bd1,rw.r,rw.c):null);
if(n){
_bd4.push(n);
}
}
return _bd4;
},findOverlappingNodes:function(_bda){
return this._findOverlappingNodes(_b36(_bda),_b31(_bda.parentNode),_b2f(_bda));
}});
dojo.declare("dojox.grid._View",[dijit._Widget,dijit._Templated],{defaultWidth:"18em",viewWidth:"",templateString:"<div class=\"dojoxGridView\">\r\n\t<div class=\"dojoxGridHeader\" dojoAttachPoint=\"headerNode\">\r\n\t\t<div dojoAttachPoint=\"headerNodeContainer\" style=\"width:9000em\">\r\n\t\t\t<div dojoAttachPoint=\"headerContentNode\"></div>\r\n\t\t</div>\r\n\t</div>\r\n\t<input type=\"checkbox\" class=\"dojoxGridHiddenFocus\" dojoAttachPoint=\"hiddenFocusNode\" />\r\n\t<input type=\"checkbox\" class=\"dojoxGridHiddenFocus\" />\r\n\t<div class=\"dojoxGridScrollbox\" dojoAttachPoint=\"scrollboxNode\">\r\n\t\t<div class=\"dojoxGridContent\" dojoAttachPoint=\"contentNode\" hidefocus=\"hidefocus\"></div>\r\n\t</div>\r\n</div>\r\n",themeable:false,classTag:"dojoxGrid",marginBottom:0,rowPad:2,_togglingColumn:-1,postMixInProperties:function(){
this.rowNodes=[];
},postCreate:function(){
this.connect(this.scrollboxNode,"onscroll","doscroll");
dojox.grid.util.funnelEvents(this.contentNode,this,"doContentEvent",["mouseover","mouseout","click","dblclick","contextmenu","mousedown"]);
dojox.grid.util.funnelEvents(this.headerNode,this,"doHeaderEvent",["dblclick","mouseover","mouseout","mousemove","mousedown","click","contextmenu"]);
this.content=new _b64(this);
this.header=new _b7b(this);
if(!dojo._isBodyLtr()){
this.headerNodeContainer.style.width="";
}
},destroy:function(){
dojo._destroyElement(this.headerNode);
delete this.headerNode;
dojo.forEach(this.rowNodes,dojo._destroyElement);
this.rowNodes=[];
if(this.source){
this.source.destroy();
}
this.inherited(arguments);
},focus:function(){
if(dojo.isSafari||dojo.isOpera){
this.hiddenFocusNode.focus();
}else{
this.scrollboxNode.focus();
}
},setStructure:function(_bdb){
var vs=this.structure=_bdb;
if(vs.width&&!isNaN(vs.width)){
this.viewWidth=vs.width+"em";
}else{
this.viewWidth=vs.width||(vs.noscroll?"auto":this.viewWidth);
}
this.onBeforeRow=vs.onBeforeRow;
this.noscroll=vs.noscroll;
if(this.noscroll){
this.scrollboxNode.style.overflow="hidden";
}
this.simpleStructure=Boolean(vs.cells.length==1);
this.testFlexCells();
this.updateStructure();
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
var _be1=this.hasVScrollbar();
var _be2=dojo.style(this.scrollboxNode,"overflow");
if(this.noscroll||!_be2||_be2=="hidden"){
_be1=false;
}else{
if(_be2=="scroll"){
_be1=true;
}
}
return (_be1?dojox.html.metrics.getScrollbar().w:0);
},getColumnsWidth:function(){
return this.headerContentNode.firstChild.offsetWidth;
},setColumnsWidth:function(_be3){
this.headerContentNode.firstChild.style.width=_be3+"px";
if(this.viewWidth){
this.viewWidth=_be3+"px";
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
var _be4=this.grid.layout.cells;
var _be5=dojo.hitch(this,function(node,_be7){
var inc=_be7?-1:1;
var idx=this.header.getCellNodeIndex(node)+inc;
var cell=_be4[idx];
while(cell&&cell.getHeaderNode()&&cell.getHeaderNode().style.display=="none"){
idx+=inc;
cell=_be4[idx];
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
this.source=new dojo.dnd.Source(this.headerContentNode.firstChild.rows[0],{horizontal:true,accept:["gridColumn_"+this.grid.id],viewIndex:this.index,onMouseDown:dojo.hitch(this,function(e){
this.header.decorateEvent(e);
if((this.header.overRightResizeArea(e)||this.header.overLeftResizeArea(e))&&this.header.canResize(e)&&!_b7a){
this.header.beginColumnResize(e);
}else{
if(this.grid.headerMenu){
this.grid.headerMenu.onCancel(true);
}
if(e.button===(dojo.isIE?1:0)){
dojo.dnd.Source.prototype.onMouseDown.call(this.source,e);
}
}
}),_markTargetAnchor:dojo.hitch(this,function(_bec){
var src=this.source;
if(src.current==src.targetAnchor&&src.before==_bec){
return;
}
if(src.targetAnchor&&_be5(src.targetAnchor,src.before)){
src._removeItemClass(_be5(src.targetAnchor,src.before),src.before?"After":"Before");
}
dojo.dnd.Source.prototype._markTargetAnchor.call(src,_bec);
if(src.targetAnchor&&_be5(src.targetAnchor,src.before)){
src._addItemClass(_be5(src.targetAnchor,src.before),src.before?"After":"Before");
}
}),_unmarkTargetAnchor:dojo.hitch(this,function(){
var src=this.source;
if(!src.targetAnchor){
return;
}
if(src.targetAnchor&&_be5(src.targetAnchor,src.before)){
src._removeItemClass(_be5(src.targetAnchor,src.before),src.before?"After":"Before");
}
dojo.dnd.Source.prototype._unmarkTargetAnchor.call(src);
}),destroy:dojo.hitch(this,function(){
dojo.disconnect(this._source_conn);
dojo.unsubscribe(this._source_sub);
dojo.dnd.Source.prototype.destroy.call(this.source);
})});
this._source_conn=dojo.connect(this.source,"onDndDrop",this,"_onDndDrop");
this._source_sub=dojo.subscribe("/dnd/drop/before",this,"_onDndDropBefore");
this.source.startup();
}
},_onDndDropBefore:function(_bef,_bf0,copy){
if(dojo.dnd.manager().target!==this.source){
return;
}
this.source._targetNode=this.source.targetAnchor;
this.source._beforeTarget=this.source.before;
var _bf2=this.grid.views.views;
var _bf3=_bf2[_bef.viewIndex];
var _bf4=_bf2[this.index];
if(_bf4!=_bf3){
var s=_bf3.convertColPctToFixed();
var t=_bf4.convertColPctToFixed();
if(s||t){
setTimeout(function(){
_bf3.update();
_bf4.update();
},50);
}
}
},_onDndDrop:function(_bf7,_bf8,copy){
if(dojo.dnd.manager().target!==this.source){
if(dojo.dnd.manager().source===this.source){
this._removingColumn=true;
}
return;
}
var _bfa=function(n){
return n?dojo.attr(n,"idx"):null;
};
var w=dojo.marginBox(_bf8[0]).w;
if(_bf7.viewIndex!==this.index){
var _bfd=this.grid.views.views;
var _bfe=_bfd[_bf7.viewIndex];
var _bff=_bfd[this.index];
if(_bfe.viewWidth&&_bfe.viewWidth!="auto"){
_bfe.setColumnsWidth(_bfe.getColumnsWidth()-w);
}
if(_bff.viewWidth&&_bff.viewWidth!="auto"){
_bff.setColumnsWidth(_bff.getColumnsWidth());
}
}
var stn=this.source._targetNode;
var stb=this.source._beforeTarget;
var _c02=this.grid.layout;
var idx=this.index;
delete this.source._targetNode;
delete this.source._beforeTarget;
window.setTimeout(function(){
_c02.moveColumn(_bf7.viewIndex,idx,_bfa(_bf8[0]),_bfa(stn),stb);
},1);
},renderHeader:function(){
this.headerContentNode.innerHTML=this.header.generateHtml(this._getHeaderContent);
if(this.flexCells){
this.contentWidth=this.getContentWidth();
this.headerContentNode.firstChild.style.width=this.contentWidth;
}
},_getHeaderContent:function(_c04){
var n=_c04.name||_c04.grid.getCellName(_c04);
var ret=["<div class=\"dojoxGridSortNode"];
if(_c04.index!=_c04.grid.getSortIndex()){
ret.push("\">");
}else{
ret=ret.concat([" ",_c04.grid.sortInfo>0?"dojoxGridSortUp":"dojoxGridSortDown","\"><div class=\"dojoxGridArrowButtonChar\">",_c04.grid.sortInfo>0?"&#9650;":"&#9660;","</div><div class=\"dojoxGridArrowButtonNode\"></div>"]);
}
ret=ret.concat([n,"</div>"]);
return ret.join("");
},resize:function(){
this.adaptHeight();
this.adaptWidth();
},hasHScrollbar:function(_c07){
if(this._hasHScroll==undefined||_c07){
if(this.noscroll){
this._hasHScroll=false;
}else{
var _c08=dojo.style(this.scrollboxNode,"overflow");
if(_c08=="hidden"){
this._hasHScroll=false;
}else{
if(_c08=="scroll"){
this._hasHScroll=true;
}else{
this._hasHScroll=(this.scrollboxNode.offsetWidth<this.contentNode.offsetWidth);
}
}
}
}
return this._hasHScroll;
},hasVScrollbar:function(_c09){
if(this._hasVScroll==undefined||_c09){
if(this.noscroll){
this._hasVScroll=false;
}else{
var _c0a=dojo.style(this.scrollboxNode,"overflow");
if(_c0a=="hidden"){
this._hasVScroll=false;
}else{
if(_c0a=="scroll"){
this._hasVScroll=true;
}else{
this._hasVScroll=(this.scrollboxNode.offsetHeight<this.contentNode.offsetHeight);
}
}
}
}
return this._hasVScroll;
},convertColPctToFixed:function(){
var _c0b=false;
var _c0c=dojo.query("th",this.headerContentNode);
var _c0d=dojo.map(_c0c,function(c){
var w=c.style.width;
if(w&&w.slice(-1)=="%"){
_c0b=true;
return dojo.contentBox(c).w;
}else{
if(w&&w.slice(-2)=="px"){
return window.parseInt(w,10);
}
}
return -1;
});
if(_c0b){
dojo.forEach(this.grid.layout.cells,function(cell,idx){
if(cell.view==this){
var vIdx=cell.layoutIndex;
this.setColWidth(idx,_c0d[vIdx]);
_c0c[vIdx].style.width=cell.unitWidth;
}
},this);
return true;
}
return false;
},adaptHeight:function(_c13){
if(!this.grid._autoHeight){
var h=this.domNode.clientHeight;
if(_c13){
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
},renderRow:function(_c1b){
var _c1c=this.createRowNode(_c1b);
this.buildRow(_c1b,_c1c);
this.grid.edit.restore(this,_c1b);
if(this._pendingUpdate){
window.clearTimeout(this._pendingUpdate);
}
this._pendingUpdate=window.setTimeout(dojo.hitch(this,function(){
window.clearTimeout(this._pendingUpdate);
delete this._pendingUpdate;
this.grid._resize();
}),50);
return _c1c;
},createRowNode:function(_c1d){
var node=document.createElement("div");
node.className=this.classTag+"Row";
node[_b2e]=this.id;
node[_b2d]=_c1d;
this.rowNodes[_c1d]=node;
return node;
},buildRow:function(_c1f,_c20){
this.buildRowContent(_c1f,_c20);
this.styleRow(_c1f,_c20);
},buildRowContent:function(_c21,_c22){
_c22.innerHTML=this.content.generateHtml(_c21,_c21);
if(this.flexCells&&this.contentWidth){
_c22.firstChild.style.width=this.contentWidth;
}
},rowRemoved:function(_c23){
this.grid.edit.save(this,_c23);
delete this.rowNodes[_c23];
},getRowNode:function(_c24){
return this.rowNodes[_c24];
},getCellNode:function(_c25,_c26){
var row=this.getRowNode(_c25);
if(row){
return this.content.getCellNode(row,_c26);
}
},getHeaderCellNode:function(_c28){
if(this.headerContentNode){
return this.header.getCellNode(this.headerContentNode,_c28);
}
},styleRow:function(_c29,_c2a){
_c2a._style=_b41(_c2a);
this.styleRowNode(_c29,_c2a);
},styleRowNode:function(_c2b,_c2c){
if(_c2c){
this.doStyleRowNode(_c2b,_c2c);
}
},doStyleRowNode:function(_c2d,_c2e){
this.grid.styleRowNode(_c2d,_c2e);
},updateRow:function(_c2f){
var _c30=this.getRowNode(_c2f);
if(_c30){
_c30.style.height="";
this.buildRow(_c2f,_c30);
}
return _c30;
},updateRowStyles:function(_c31){
this.styleRowNode(_c31,this.getRowNode(_c31));
},lastTop:0,firstScroll:0,doscroll:function(_c32){
var _c33=dojo._isBodyLtr();
if(this.firstScroll<2){
if((!_c33&&this.firstScroll==1)||(_c33&&this.firstScroll==0)){
var s=dojo.marginBox(this.headerNodeContainer);
if(dojo.isIE){
this.headerNodeContainer.style.width=s.w+this.getScrollbarWidth()+"px";
}else{
if(dojo.isMoz){
this.headerNodeContainer.style.width=s.w-this.getScrollbarWidth()+"px";
this.scrollboxNode.scrollLeft=_c33?this.scrollboxNode.clientWidth-this.scrollboxNode.scrollWidth:this.scrollboxNode.scrollWidth-this.scrollboxNode.clientWidth;
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
},setScrollTop:function(_c36){
this.lastTop=_c36;
this.scrollboxNode.scrollTop=_c36;
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
},setColWidth:function(_c3b,_c3c){
this.grid.setCellWidth(_c3b,_c3c+"px");
},update:function(){
var left=this.scrollboxNode.scrollLeft;
this.content.update();
this.grid.update();
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
var _c44=this.manager.source,node;
if(_c44.creator){
node=_c44._normailzedCreator(_c44.getItem(this.manager.nodes[0].id).data,"avatar").node;
}else{
node=this.manager.nodes[0].cloneNode(true);
if(node.tagName.toLowerCase()=="tr"){
var _c46=dd.createElement("table"),_c47=dd.createElement("tbody");
_c47.appendChild(node);
_c46.appendChild(_c47);
node=_c46;
}else{
if(node.tagName.toLowerCase()=="th"){
var _c46=dd.createElement("table"),_c47=dd.createElement("tbody"),r=dd.createElement("tr");
_c46.cellPadding=_c46.cellSpacing="0";
r.appendChild(node);
_c47.appendChild(r);
_c46.appendChild(_c47);
node=_c46;
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
var _c4a=dojo.dnd.manager().makeAvatar;
dojo.dnd.manager().makeAvatar=function(){
var src=this.source;
if(src.viewIndex!==undefined){
return new dojox.grid._GridAvatar(this);
}
return _c4a.call(dojo.dnd.manager());
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
},buildRowContent:function(_c4c,_c4d){
var w=this.contentNode.offsetWidth-this.padBorderWidth;
_c4d.innerHTML="<table class=\"dojoxGridRowbarTable\" style=\"width:"+w+"px;\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"wairole:presentation\"><tr><td class=\"dojoxGridRowbarInner\">&nbsp;</td></tr></table>";
},renderHeader:function(){
},resize:function(){
this.adaptHeight();
},adaptWidth:function(){
},doStyleRowNode:function(_c4f,_c50){
var n=["dojoxGridRowbar"];
if(this.grid.rows.isOver(_c4f)){
n.push("dojoxGridRowbarOver");
}
if(this.grid.selection.isSelected(_c4f)){
n.push("dojoxGridRowbarSelected");
}
_c50.className=n.join(" ");
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
dojo.declare("dojox.grid._Layout",null,{constructor:function(_c54){
this.grid=_c54;
},cells:[],structure:null,defaultWidth:"6em",moveColumn:function(_c55,_c56,_c57,_c58,_c59){
var _c5a=this.structure[_c55].cells[0];
var _c5b=this.structure[_c56].cells[0];
var cell=null;
var _c5d=0;
var _c5e=0;
for(var i=0,c;c=_c5a[i];i++){
if(c.index==_c57){
_c5d=i;
break;
}
}
cell=_c5a.splice(_c5d,1)[0];
cell.view=this.grid.views.views[_c56];
for(i=0,c=null;c=_c5b[i];i++){
if(c.index==_c58){
_c5e=i;
break;
}
}
if(!_c59){
_c5e+=1;
}
_c5b.splice(_c5e,0,cell);
var _c61=this.grid.getCell(this.grid.getSortIndex());
if(_c61){
_c61._currentlySorted=this.grid.getSortAsc();
}
this.cells=[];
var _c57=0;
for(var i=0,v;v=this.structure[i];i++){
for(var j=0,cs;cs=v.cells[j];j++){
for(var k=0,c;c=cs[k];k++){
c.index=_c57;
this.cells.push(c);
if("_currentlySorted" in c){
var si=_c57+1;
si*=c._currentlySorted?1:-1;
this.grid.sortInfo=si;
delete c._currentlySorted;
}
_c57++;
}
}
}
this.grid.setupHeaderMenu();
},setColumnVisibility:function(_c67,_c68){
var cell=this.cells[_c67];
if(cell.hidden==_c68){
cell.hidden=!_c68;
var v=cell.view,w=v.viewWidth;
if(w&&w!="auto"){
v._togglingColumn=dojo.marginBox(cell.getHeaderNode()).w||0;
}
v.update();
return true;
}else{
return false;
}
},addCellDef:function(_c6c,_c6d,_c6e){
var self=this;
var _c70=function(_c71){
var w=0;
if(_c71.colSpan>1){
w=0;
}else{
if(!isNaN(_c71.width)){
w=_c71.width+"em";
}else{
w=_c71.width||self.defaultWidth;
}
}
return w;
};
var _c73={grid:this.grid,subrow:_c6c,layoutIndex:_c6d,index:this.cells.length};
if(_c6e&&_c6e instanceof dojox.grid.cells._Base){
var _c74=dojo.clone(_c6e);
_c73.unitWidth=_c70(_c74._props);
_c74=dojo.mixin(_c74,this._defaultCellProps,_c6e._props,_c73);
return _c74;
}
var _c75=_c6e.type||this._defaultCellProps.type||dojox.grid.cells.Cell;
_c73.unitWidth=_c70(_c6e);
return new _c75(dojo.mixin({},this._defaultCellProps,_c6e,_c73));
},addRowDef:function(_c76,_c77){
var _c78=[];
var _c79=0,_c7a=0,_c7b=true;
for(var i=0,def,cell;(def=_c77[i]);i++){
cell=this.addCellDef(_c76,i,def);
_c78.push(cell);
this.cells.push(cell);
if(_c7b&&cell.relWidth){
_c79+=cell.relWidth;
}else{
if(cell.width){
var w=cell.width;
if(typeof w=="string"&&w.slice(-1)=="%"){
_c7a+=window.parseInt(w,10);
}else{
if(w=="auto"){
_c7b=false;
}
}
}
}
}
if(_c79&&_c7b){
dojo.forEach(_c78,function(cell){
if(cell.relWidth){
cell.width=cell.unitWidth=((cell.relWidth/_c79)*(100-_c7a))+"%";
}
});
}
return _c78;
},addRowsDef:function(_c81){
var _c82=[];
if(dojo.isArray(_c81)){
if(dojo.isArray(_c81[0])){
for(var i=0,row;_c81&&(row=_c81[i]);i++){
_c82.push(this.addRowDef(i,row));
}
}else{
_c82.push(this.addRowDef(0,_c81));
}
}
return _c82;
},addViewDef:function(_c85){
this._defaultCellProps=_c85.defaultCell||{};
return dojo.mixin({},_c85,{cells:this.addRowsDef(_c85.rows||_c85.cells)});
},setStructure:function(_c86){
this.fieldIndex=0;
this.cells=[];
var s=this.structure=[];
if(this.grid.rowSelector){
var sel={type:dojox._scopeName+".grid._RowSelector"};
if(dojo.isString(this.grid.rowSelector)){
var _c89=this.grid.rowSelector;
if(_c89=="false"){
sel=null;
}else{
if(_c89!="true"){
sel["width"]=_c89;
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
var _c8a=function(def){
return ("name" in def||"field" in def||"get" in def);
};
var _c8c=function(def){
if(dojo.isArray(def)){
if(dojo.isArray(def[0])||_c8a(def[0])){
return true;
}
}
return false;
};
var _c8e=function(def){
return (def!=null&&dojo.isObject(def)&&("cells" in def||"rows" in def||("type" in def&&!_c8a(def))));
};
if(dojo.isArray(_c86)){
var _c90=false;
for(var i=0,st;(st=_c86[i]);i++){
if(_c8e(st)){
_c90=true;
break;
}
}
if(!_c90){
s.push(this.addViewDef({cells:_c86}));
}else{
for(var i=0,st;(st=_c86[i]);i++){
if(_c8c(st)){
s.push(this.addViewDef({cells:st}));
}else{
if(_c8e(st)){
s.push(this.addViewDef(st));
}
}
}
}
}else{
if(_c8e(_c86)){
s.push(this.addViewDef(_c86));
}
}
this.cellCount=this.cells.length;
this.grid.setupHeaderMenu();
}});
}
if(!dojo._hasResource["dojox.grid._ViewManager"]){
dojo._hasResource["dojox.grid._ViewManager"]=true;
dojo.provide("dojox.grid._ViewManager");
dojo.declare("dojox.grid._ViewManager",null,{constructor:function(_c93){
this.grid=_c93;
},defaultWidth:200,views:[],resize:function(){
this.onEach("resize");
},render:function(){
this.onEach("render");
},addView:function(_c94){
_c94.idx=this.views.length;
this.views.push(_c94);
},destroyViews:function(){
for(var i=0,v;v=this.views[i];i++){
v.destroy();
}
this.views=[];
},getContentNodes:function(){
var _c97=[];
for(var i=0,v;v=this.views[i];i++){
_c97.push(v.contentNode);
}
return _c97;
},forEach:function(_c9a){
for(var i=0,v;v=this.views[i];i++){
_c9a(v,i);
}
},onEach:function(_c9d,_c9e){
_c9e=_c9e||[];
for(var i=0,v;v=this.views[i];i++){
if(_c9d in v){
v[_c9d].apply(v,_c9e);
}
}
},normalizeHeaderNodeHeight:function(){
var _ca1=[];
for(var i=0,v;(v=this.views[i]);i++){
if(v.headerContentNode.firstChild){
_ca1.push(v.headerContentNode);
}
}
this.normalizeRowNodeHeights(_ca1);
},normalizeRowNodeHeights:function(_ca4){
var h=0;
for(var i=0,n,o;(n=_ca4[i]);i++){
h=Math.max(h,dojo.marginBox(n.firstChild).h);
}
h=(h>=0?h:0);
for(var i=0,n;(n=_ca4[i]);i++){
dojo.marginBox(n.firstChild,{h:h});
}
if(_ca4&&_ca4[0]&&_ca4[0].parentNode){
_ca4[0].parentNode.offsetHeight;
}
},resetHeaderNodeHeight:function(){
for(var i=0,v,n;(v=this.views[i]);i++){
n=v.headerContentNode.firstChild;
if(n){
n.style.height="";
}
}
},renormalizeRow:function(_cac){
var _cad=[];
for(var i=0,v,n;(v=this.views[i])&&(n=v.getRowNode(_cac));i++){
n.firstChild.style.height="";
_cad.push(n);
}
this.normalizeRowNodeHeights(_cad);
},getViewWidth:function(_cb1){
return this.views[_cb1].getWidth()||this.defaultWidth;
},measureHeader:function(){
this.resetHeaderNodeHeight();
this.forEach(function(_cb2){
_cb2.headerContentNode.style.height="";
});
var h=0;
this.forEach(function(_cb4){
h=Math.max(_cb4.headerNode.offsetHeight,h);
});
return h;
},measureContent:function(){
var h=0;
this.forEach(function(_cb6){
h=Math.max(_cb6.domNode.offsetHeight,h);
});
return h;
},findClient:function(_cb7){
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
var _cc2=function(v,l){
var ds=v.domNode.style;
var hs=v.headerNode.style;
if(!dojo._isBodyLtr()){
ds.right=l+"px";
hs.right=l+"px";
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
_cc2(v,l);
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
_cc2(v,r);
}
if(c<len){
v=this.views[c];
vw=Math.max(1,r-l);
v.setSize(vw+"px",0);
_cc2(v,l);
}
return l;
},renderRow:function(_cc9,_cca){
var _ccb=[];
for(var i=0,v,n,_ccf;(v=this.views[i])&&(n=_cca[i]);i++){
_ccf=v.renderRow(_cc9);
n.appendChild(_ccf);
_ccb.push(_ccf);
}
this.normalizeRowNodeHeights(_ccb);
},rowRemoved:function(_cd0){
this.onEach("rowRemoved",[_cd0]);
},updateRow:function(_cd1){
for(var i=0,v;v=this.views[i];i++){
v.updateRow(_cd1);
}
this.renormalizeRow(_cd1);
},updateRowStyles:function(_cd4){
this.onEach("updateRowStyles",[_cd4]);
},setScrollTop:function(_cd5){
var top=_cd5;
for(var i=0,v;v=this.views[i];i++){
top=v.setScrollTop(_cd5);
}
return top;
},getFirstScrollingView:function(){
for(var i=0,v;(v=this.views[i]);i++){
if(v.hasHScrollbar()||v.hasVScrollbar()){
return v;
}
}
}});
}
if(!dojo._hasResource["dojox.grid._RowManager"]){
dojo._hasResource["dojox.grid._RowManager"]=true;
dojo.provide("dojox.grid._RowManager");
(function(){
var _cdb=function(_cdc,_cdd){
if(_cdc.style.cssText==undefined){
_cdc.setAttribute("style",_cdd);
}else{
_cdc.style.cssText=_cdd;
}
};
dojo.declare("dojox.grid._RowManager",null,{constructor:function(_cde){
this.grid=_cde;
},linesToEms:2,overRow:-2,prepareStylingRow:function(_cdf,_ce0){
return {index:_cdf,node:_ce0,odd:Boolean(_cdf&1),selected:this.grid.selection.isSelected(_cdf),over:this.isOver(_cdf),customStyles:"",customClasses:"dojoxGridRow"};
},styleRowNode:function(_ce1,_ce2){
var row=this.prepareStylingRow(_ce1,_ce2);
this.grid.onStyleRow(row);
this.applyStyles(row);
},applyStyles:function(_ce4){
var i=_ce4;
i.node.className=i.customClasses;
var h=i.node.style.height;
_cdb(i.node,i.customStyles+";"+(i.node._style||""));
i.node.style.height=h;
},updateStyles:function(_ce7){
this.grid.updateRowStyles(_ce7);
},setOverRow:function(_ce8){
var last=this.overRow;
this.overRow=_ce8;
if((last!=this.overRow)&&(last>=0)){
this.updateStyles(last);
}
this.updateStyles(this.overRow);
},isOver:function(_cea){
return (this.overRow==_cea);
}});
})();
}
if(!dojo._hasResource["dojox.grid._FocusManager"]){
dojo._hasResource["dojox.grid._FocusManager"]=true;
dojo.provide("dojox.grid._FocusManager");
dojo.declare("dojox.grid._FocusManager",null,{constructor:function(_ceb){
this.grid=_ceb;
this.cell=null;
this.rowIndex=-1;
this._connects=[];
this._connects.push(dojo.connect(this.grid.domNode,"onfocus",this,"doFocus"));
this._connects.push(dojo.connect(this.grid.domNode,"onblur",this,"doBlur"));
this._connects.push(dojo.connect(this.grid.lastFocusNode,"onfocus",this,"doLastNodeFocus"));
this._connects.push(dojo.connect(this.grid.lastFocusNode,"onblur",this,"doLastNodeBlur"));
},destroy:function(){
dojo.forEach(this._connects,dojo.disconnect);
delete this.grid;
delete this.cell;
},_colHeadNode:null,tabbingOut:false,focusClass:"dojoxGridCellFocus",focusView:null,initFocusView:function(){
this.focusView=this.grid.views.getFirstScrollingView();
this._initColumnHeaders();
},isFocusCell:function(_cec,_ced){
return (this.cell==_cec)&&(this.rowIndex==_ced);
},isLastFocusCell:function(){
return (this.rowIndex==this.grid.rowCount-1)&&(this.cell.index==this.grid.layout.cellCount-1);
},isFirstFocusCell:function(){
return (this.rowIndex==0)&&(this.cell.index==0);
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
},_focusifyCellNode:function(_cee){
var n=this.cell&&this.cell.getNode(this.rowIndex);
if(n){
dojo.toggleClass(n,this.focusClass,_cee);
if(_cee){
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
},_initColumnHeaders:function(){
this._connects.push(dojo.connect(this.grid.viewsHeaderNode,"onblur",this,"doBlurHeader"));
var _cf1=this._findHeaderCells();
for(var i=0;i<_cf1.length;i++){
this._connects.push(dojo.connect(_cf1[i],"onfocus",this,"doColHeaderFocus"));
this._connects.push(dojo.connect(_cf1[i],"onblur",this,"doColHeaderBlur"));
}
},_findHeaderCells:function(){
var _cf3=dojo.query("th",this.grid.viewsHeaderNode);
var _cf4=[];
for(var i=0;i<_cf3.length;i++){
var _cf6=_cf3[i];
var _cf7=dojo.hasAttr(_cf6,"tabindex");
var _cf8=dojo.attr(_cf6,"tabindex");
if(_cf7&&_cf8<0){
_cf4.push(_cf6);
}
}
return _cf4;
},scrollIntoView:function(){
var info=(this.cell?this._scrollInfo(this.cell):null);
if(!info){
return null;
}
var rt=this.grid.scroller.findScrollTop(this.rowIndex);
if(info.n.offsetLeft+info.n.offsetWidth>info.sr.l+info.sr.w){
info.s.scrollLeft=info.n.offsetLeft+info.n.offsetWidth-info.sr.w;
}else{
if(info.n.offsetLeft<info.sr.l){
info.s.scrollLeft=info.n.offsetLeft;
}
}
if(rt+info.r.offsetHeight>info.sr.t+info.sr.h){
this.grid.setScrollTop(rt+info.r.offsetHeight-info.sr.h);
}else{
if(rt<info.sr.t){
this.grid.setScrollTop(rt);
}
}
return info.s.scrollLeft;
},_scrollInfo:function(cell,_cfc){
if(cell){
var cl=cell,sbn=cl.view.scrollboxNode,sbnr={w:sbn.clientWidth,l:sbn.scrollLeft,t:sbn.scrollTop,h:sbn.clientHeight},rn=cl.view.getRowNode(this.rowIndex);
return {c:cl,s:sbn,sr:sbnr,n:(_cfc?_cfc:cell.getNode(this.rowIndex)),r:rn};
}
return null;
},_scrollHeader:function(_d01){
var info=null;
if(this._colHeadNode){
info=this._scrollInfo(this.grid.getCell(_d01),this._colHeadNode);
}
if(info){
if(info.n.offsetLeft+info.n.offsetWidth>info.sr.l+info.sr.w){
info.s.scrollLeft=info.n.offsetLeft+info.n.offsetWidth-info.sr.w;
}else{
if(info.n.offsetLeft<info.sr.l){
info.s.scrollLeft=info.n.offsetLeft;
}
}
}
},styleRow:function(_d03){
return;
},setFocusIndex:function(_d04,_d05){
this.setFocusCell(this.grid.getCell(_d05),_d04);
},setFocusCell:function(_d06,_d07){
if(_d06&&!this.isFocusCell(_d06,_d07)){
this.tabbingOut=false;
this._colHeadNode=null;
this.focusGridView();
this._focusifyCellNode(false);
this.cell=_d06;
this.rowIndex=_d07;
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
},move:function(_d0e,_d0f){
if(this.isNavHeader()){
var _d10=this._findHeaderCells();
var _d11=dojo.indexOf(_d10,this._colHeadNode);
_d11+=_d0f;
if((_d11>=0)&&(_d11<_d10.length)){
this._colHeadNode=_d10[_d11];
this._colHeadNode.focus();
this._scrollHeader(_d11);
}
}else{
var rc=this.grid.rowCount-1,cc=this.grid.layout.cellCount-1,r=this.rowIndex,i=this.cell.index,row=Math.min(rc,Math.max(0,r+_d0e)),col=Math.min(cc,Math.max(0,i+_d0f));
this.setFocusIndex(row,col);
if(_d0e){
this.grid.updateRow(r);
}
}
},previousKey:function(e){
if(!this.isNavHeader()){
this.focusHeader();
dojo.stopEvent(e);
}else{
if(this.grid.edit.isEditing()){
dojo.stopEvent(e);
this.previous();
}else{
this.tabOut(this.grid.domNode);
}
}
},nextKey:function(e){
if(e.target===this.grid.domNode){
this.focusHeader();
dojo.stopEvent(e);
}else{
if(this.isNavHeader()){
this._colHeadNode=null;
if(this.isNoFocusCell()){
this.setFocusIndex(0,0);
}else{
if(this.cell){
this.focusGrid();
}
}
}else{
if(this.grid.edit.isEditing()){
dojo.stopEvent(e);
this.next();
}else{
this.tabOut(this.grid.lastFocusNode);
}
}
}
},tabOut:function(_d1a){
this.tabbingOut=true;
_d1a.focus();
},focusGridView:function(){
dojox.grid.util.fire(this.focusView,"focus");
},focusGrid:function(_d1b){
this.focusGridView();
this._focusifyCellNode(true);
},focusHeader:function(){
var _d1c=this._findHeaderCells();
if(this.isNoFocusCell()){
this._colHeadNode=_d1c[0];
}else{
this._colHeadNode=_d1c[this.cell.index];
}
if(this._colHeadNode){
this._colHeadNode.focus();
this._focusifyCellNode(false);
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
},doBlurHeader:function(e){
dojo.stopEvent(e);
},doLastNodeFocus:function(e){
if(this.tabbingOut){
this._focusifyCellNode(false);
}else{
this._focusifyCellNode(true);
}
this.tabbingOut=false;
dojo.stopEvent(e);
},doLastNodeBlur:function(e){
dojo.stopEvent(e);
},doColHeaderFocus:function(e){
dojo.toggleClass(e.target,this.focusClass,true);
},doColHeaderBlur:function(e){
dojo.toggleClass(e.target,this.focusClass,false);
}});
}
if(!dojo._hasResource["dojox.grid._EditManager"]){
dojo._hasResource["dojox.grid._EditManager"]=true;
dojo.provide("dojox.grid._EditManager");
dojo.declare("dojox.grid._EditManager",null,{constructor:function(_d24){
this.grid=_d24;
this.connections=[];
if(dojo.isIE){
this.connections.push(dojo.connect(document.body,"onfocus",dojo.hitch(this,"_boomerangFocus")));
}
},info:{},destroy:function(){
dojo.forEach(this.connections,dojo.disconnect);
},cellFocus:function(_d25,_d26){
if(this.grid.singleClickEdit||this.isEditRow(_d26)){
this.setEditCell(_d25,_d26);
}else{
this.apply();
}
if(this.isEditing()||(_d25&&_d25.editable&&_d25.alwaysEditing)){
this._focusEditor(_d25,_d26);
}
},rowClick:function(e){
if(this.isEditing()&&!this.isEditRow(e.rowIndex)){
this.apply();
}
},styleRow:function(_d28){
if(_d28.index==this.info.rowIndex){
_d28.customClasses+=" dojoxGridRowEditing";
}
},dispatchEvent:function(e){
var c=e.cell,ed=(c&&c["editable"])?c:0;
return ed&&ed.dispatchEvent(e.dispatch,e);
},isEditing:function(){
return this.info.rowIndex!==undefined;
},isEditCell:function(_d2c,_d2d){
return (this.info.rowIndex===_d2c)&&(this.info.cell.index==_d2d);
},isEditRow:function(_d2e){
return this.info.rowIndex===_d2e;
},setEditCell:function(_d2f,_d30){
if(!this.isEditCell(_d30,_d2f.index)&&this.grid.canEdit&&this.grid.canEdit(_d2f,_d30)){
this.start(_d2f,_d30,this.isEditRow(_d30)||_d2f.editable);
}
},_focusEditor:function(_d31,_d32){
dojox.grid.util.fire(_d31,"focus",[_d32]);
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
},start:function(_d33,_d34,_d35){
this.grid.beginUpdate();
this.editorApply();
if(this.isEditing()&&!this.isEditRow(_d34)){
this.applyRowEdit();
this.grid.updateRow(_d34);
}
if(_d35){
this.info={cell:_d33,rowIndex:_d34};
this.grid.doStartEdit(_d33,_d34);
this.grid.updateRow(_d34);
}else{
this.info={};
}
this.grid.endUpdate();
this.grid.focus.focusGrid();
this._focusEditor(_d33,_d34);
this._doCatchBoomerang();
},_editorDo:function(_d36){
var c=this.info.cell;
c&&c.editable&&c[_d36](this.info.rowIndex);
},editorApply:function(){
this._editorDo("apply");
},editorCancel:function(){
this._editorDo("cancel");
},applyCellEdit:function(_d38,_d39,_d3a){
if(this.grid.canEdit(_d39,_d3a)){
this.grid.doApplyCellEdit(_d38,_d3a,_d39.field);
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
},save:function(_d3b,_d3c){
var c=this.info.cell;
if(this.isEditRow(_d3b)&&(!_d3c||c.view==_d3c)&&c.editable){
c.save(c,this.info.rowIndex);
}
},restore:function(_d3e,_d3f){
var c=this.info.cell;
if(this.isEditRow(_d3f)&&c.view==_d3e&&c.editable){
c.restore(c,this.info.rowIndex);
}
}});
}
if(!dojo._hasResource["dojox.grid.Selection"]){
dojo._hasResource["dojox.grid.Selection"]=true;
dojo.provide("dojox.grid.Selection");
dojo.declare("dojox.grid.Selection",null,{constructor:function(_d41){
this.grid=_d41;
this.selected=[];
this.setMode(_d41.selectionMode);
},mode:"extended",selected:null,updating:0,selectedIndex:-1,setMode:function(mode){
if(this.selected.length){
this.deselectAll();
}
if(mode!="extended"&&mode!="multiple"&&mode!="single"&&mode!="none"){
this.mode="extended";
}else{
this.mode=mode;
}
},onCanSelect:function(_d43){
return this.grid.onCanSelect(_d43);
},onCanDeselect:function(_d44){
return this.grid.onCanDeselect(_d44);
},onSelected:function(_d45){
},onDeselected:function(_d46){
},onChanging:function(){
},onChanged:function(){
},isSelected:function(_d47){
if(this.mode=="none"){
return false;
}
return this.selected[_d47];
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
},getNextSelected:function(_d4a){
if(this.mode=="none"){
return -1;
}
for(var i=_d4a+1,l=this.selected.length;i<l;i++){
if(this.selected[i]){
return i;
}
}
return -1;
},getSelected:function(){
var _d4d=[];
for(var i=0,l=this.selected.length;i<l;i++){
if(this.selected[i]){
_d4d.push(i);
}
}
return _d4d;
},getSelectedCount:function(){
var c=0;
for(var i=0;i<this.selected.length;i++){
if(this.selected[i]){
c++;
}
}
return c;
},_beginUpdate:function(){
if(this.updating==0){
this.onChanging();
}
this.updating++;
},_endUpdate:function(){
this.updating--;
if(this.updating==0){
this.onChanged();
}
},select:function(_d52){
if(this.mode=="none"){
return;
}
if(this.mode!="multiple"){
this.deselectAll(_d52);
this.addToSelection(_d52);
}else{
this.toggleSelect(_d52);
}
},addToSelection:function(_d53){
if(this.mode=="none"){
return;
}
_d53=Number(_d53);
if(this.selected[_d53]){
this.selectedIndex=_d53;
}else{
if(this.onCanSelect(_d53)!==false){
this.selectedIndex=_d53;
this._beginUpdate();
this.selected[_d53]=true;
this.onSelected(_d53);
this._endUpdate();
}
}
},deselect:function(_d54){
if(this.mode=="none"){
return;
}
_d54=Number(_d54);
if(this.selectedIndex==_d54){
this.selectedIndex=-1;
}
if(this.selected[_d54]){
if(this.onCanDeselect(_d54)===false){
return;
}
this._beginUpdate();
delete this.selected[_d54];
this.onDeselected(_d54);
this._endUpdate();
}
},setSelected:function(_d55,_d56){
this[(_d56?"addToSelection":"deselect")](_d55);
},toggleSelect:function(_d57){
this.setSelected(_d57,!this.selected[_d57]);
},_range:function(_d58,inTo,func){
var s=(_d58>=0?_d58:inTo),e=inTo;
if(s>e){
e=s;
s=inTo;
}
for(var i=s;i<=e;i++){
func(i);
}
},selectRange:function(_d5e,inTo){
this._range(_d5e,inTo,dojo.hitch(this,"addToSelection"));
},deselectRange:function(_d60,inTo){
this._range(_d60,inTo,dojo.hitch(this,"deselect"));
},insert:function(_d62){
this.selected.splice(_d62,0,false);
if(this.selectedIndex>=_d62){
this.selectedIndex++;
}
},remove:function(_d63){
this.selected.splice(_d63,1);
if(this.selectedIndex>=_d63){
this.selectedIndex--;
}
},deselectAll:function(_d64){
for(var i in this.selected){
if((i!=_d64)&&(this.selected[i]===true)){
this.deselect(i);
}
}
},clickSelect:function(_d66,_d67,_d68){
if(this.mode=="none"){
return;
}
this._beginUpdate();
if(this.mode!="extended"){
this.select(_d66);
}else{
var _d69=this.selectedIndex;
if(!_d67){
this.deselectAll(_d66);
}
if(_d68){
this.selectRange(_d69,_d66);
}else{
if(_d67){
this.toggleSelect(_d66);
}else{
this.addToSelection(_d66);
}
}
}
this._endUpdate();
},clickSelectEvent:function(e){
this.clickSelect(e.rowIndex,e.ctrlKey,e.shiftKey);
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
},onStyleRow:function(_d6e){
var i=_d6e;
i.customClasses+=(i.odd?" dojoxGridRowOdd":"")+(i.selected?" dojoxGridRowSelected":"")+(i.over?" dojoxGridRowOver":"");
this.focus.styleRow(_d6e);
this.edit.styleRow(_d6e);
},onKeyDown:function(e){
if(e.altKey||e.metaKey){
return;
}
var dk=dojo.keys;
switch(e.keyCode){
case dk.ESCAPE:
this.edit.cancel();
break;
case dk.ENTER:
if(!e.shiftKey){
var _d72=this.edit.isEditing();
this.edit.apply();
if(!_d72){
this.edit.setEditCell(this.focus.cell,this.focus.rowIndex);
}
}
break;
case dk.SPACE:
if(!this.edit.isEditing()){
var _d73=this.focus.getHeaderIndex();
if(_d73>=0){
this.setSortIndex(_d73);
}else{
this.selection.clickSelect(this.focus.rowIndex,e.ctrlKey,e.shiftKey);
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
dojo.stopEvent(e);
var _d74=(e.keyCode==dk.LEFT_ARROW)?1:-1;
if(dojo._isBodyLtr()){
_d74*=-1;
}
this.focus.move(0,_d74);
}
break;
case dk.UP_ARROW:
if(!this.edit.isEditing()&&this.focus.rowIndex!=0){
dojo.stopEvent(e);
this.focus.move(-1,0);
}
break;
case dk.DOWN_ARROW:
if(!this.edit.isEditing()&&this.store&&this.focus.rowIndex+1!=this.rowCount){
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
if(!this.edit.isEditing()&&this.store&&this.focus.rowIndex+1!=this.store.count){
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
},onCellFocus:function(_d81,_d82){
this.edit.cellFocus(_d81,_d82);
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
},onStartEdit:function(_d94,_d95){
},onApplyCellEdit:function(_d96,_d97,_d98){
},onCancelEdit:function(_d99){
},onApplyEdit:function(_d9a){
},onCanSelect:function(_d9b){
return true;
},onCanDeselect:function(_d9c){
return true;
},onSelected:function(_d9d){
this.updateRowStyles(_d9d);
},onDeselected:function(_d9e){
this.updateRowStyles(_d9e);
},onSelectionChanged:function(){
}});
}
if(!dojo._hasResource["dojox.grid._Grid"]){
dojo._hasResource["dojox.grid._Grid"]=true;
dojo.provide("dojox.grid._Grid");
(function(){
var jobs={cancel:function(_da0){
if(_da0){
clearTimeout(_da0);
}
},jobs:[],job:function(_da1,_da2,_da3){
jobs.cancelJob(_da1);
var job=function(){
delete jobs.jobs[_da1];
_da3();
};
jobs.jobs[_da1]=setTimeout(job,_da2);
},cancelJob:function(_da5){
jobs.cancel(jobs.jobs[_da5]);
}};
dojo.declare("dojox.grid._Grid",[dijit._Widget,dijit._Templated,dojox.grid._Events],{templateString:"<div class=\"dojoxGrid\" hidefocus=\"hidefocus\" role=\"wairole:grid\" dojoAttachEvent=\"onmouseout:_mouseOut\">\r\n\t<div class=\"dojoxGridMasterHeader\" dojoAttachPoint=\"viewsHeaderNode\" tabindex=\"-1\"></div>\r\n\t<div class=\"dojoxGridMasterView\" dojoAttachPoint=\"viewsNode\"></div>\r\n\t<div class=\"dojoxGridMasterMessages\" style=\"display: none;\" dojoAttachPoint=\"messagesNode\"></div>\r\n\t<span dojoAttachPoint=\"lastFocusNode\" tabindex=\"0\"></span>\r\n</div>\r\n",classTag:"dojoxGrid",get:function(_da6){
},rowCount:5,keepRows:75,rowsPerPage:25,autoWidth:false,autoHeight:"",autoRender:true,defaultHeight:"15em",height:"",structure:"",elasticView:-1,singleClickEdit:false,selectionMode:"extended",rowSelector:"",columnReordering:false,headerMenu:null,placeholderLabel:"GridColumns",_click:null,loadingMessage:"<span class='dojoxGridLoading'>${loadingState}</span>",errorMessage:"<span class='dojoxGridError'>${errorState}</span>",noDataMessage:"",sortInfo:0,themeable:true,_placeholders:null,buildRendering:function(){
this.inherited(arguments);
if(this.get==dojox.grid._Grid.prototype.get){
this.get=null;
}
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
this.connect(this,"onShow","renderOnIdle");
},postMixInProperties:function(){
this.inherited(arguments);
var _da7=dojo.i18n.getLocalization("dijit","loading",this.lang);
this.loadingMessage=dojo.string.substitute(this.loadingMessage,_da7);
this.errorMessage=dojo.string.substitute(this.errorMessage,_da7);
if(this.srcNodeRef&&this.srcNodeRef.style.height){
this.height=this.srcNodeRef.style.height;
}
this._setAutoHeightAttr(this.autoHeight,true);
},postCreate:function(){
this.styleChanged=this._styleChanged;
this._placeholders=[];
this.setHeaderMenu(this.headerMenu);
this.setStructure(this.structure);
this._click=[];
},destroy:function(){
this.domNode.onReveal=null;
this.domNode.onSizeChange=null;
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
},_setAutoHeightAttr:function(ah,_daa){
if(typeof ah=="string"){
if(!ah||ah=="false"){
ah=false;
}else{
if(ah=="true"){
ah=true;
}else{
ah=window.parseInt(ah,10);
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
}
}
this.autoHeight=ah;
if(typeof ah=="boolean"){
this._autoHeight=ah;
}else{
if(typeof ah=="number"){
this._autoHeight=(ah>=this.rowCount);
}else{
this._autoHeight=false;
}
}
if(this._started&&!_daa){
this.render();
}
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
jobs.job(this.id+"SizeChange",50,dojo.hitch(this,"update"));
},renderOnIdle:function(){
setTimeout(dojo.hitch(this,"render"),1);
},createManagers:function(){
this.rows=new dojox.grid._RowManager(this);
this.focus=new dojox.grid._FocusManager(this);
this.edit=new dojox.grid._EditManager(this);
},createSelection:function(){
this.selection=new dojox.grid.Selection(this);
},createScroller:function(){
this.scroller=new dojox.grid._Scroller();
this.scroller.grid=this;
this.scroller._pageIdPrefix=this.id+"-";
this.scroller.renderRow=dojo.hitch(this,"renderRow");
this.scroller.removeRow=dojo.hitch(this,"rowRemoved");
},createLayout:function(){
this.layout=new dojox.grid._Layout(this);
this.connect(this.layout,"moveColumn","onMoveColumn");
},onMoveColumn:function(){
this.render();
this._resize();
},createViews:function(){
this.views=new dojox.grid._ViewManager(this);
this.views.createView=dojo.hitch(this,"createView");
},createView:function(_dac,idx){
var c=dojo.getObject(_dac);
var view=new c({grid:this,index:idx});
this.viewsNode.appendChild(view.domNode);
this.viewsHeaderNode.appendChild(view.headerNode);
this.views.addView(view);
return view;
},buildViews:function(){
for(var i=0,vs;(vs=this.layout.structure[i]);i++){
this.createView(vs.type||dojox._scopeName+".grid._View",i).setStructure(vs);
}
this.scroller.setContentNodes(this.views.getContentNodes());
},setStructure:function(_db2){
var s=_db2;
if(s&&dojo.isString(s)){
s=dojo.getObject(s);
}
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
},getColumnTogglingItems:function(){
return dojo.map(this.layout.cells,function(cell){
if(!cell.menuItems){
cell.menuItems=[];
}
var self=this;
var item=new dijit.CheckedMenuItem({label:cell.name,checked:!cell.hidden,_gridCell:cell,onChange:function(_db7){
if(self.layout.setColumnVisibility(this._gridCell.index,_db7)){
var _db8=this._gridCell.menuItems;
if(_db8.length>1){
dojo.forEach(_db8,function(item){
if(item!==this){
item.setAttribute("checked",_db7);
}
},this);
}
var _db7=dojo.filter(self.layout.cells,function(c){
if(c.menuItems.length>1){
dojo.forEach(c.menuItems,"item.attr('disabled', false);");
}else{
c.menuItems[0].attr("disabled",false);
}
return !c.hidden;
});
if(_db7.length==1){
dojo.forEach(_db7[0].menuItems,"item.attr('disabled', true);");
}
}
},destroy:function(){
var _dbb=dojo.indexOf(this._gridCell.menuItems,this);
this._gridCell.menuItems.splice(_dbb,1);
delete this._gridCell;
dijit.CheckedMenuItem.prototype.destroy.apply(this,arguments);
}});
cell.menuItems.push(item);
return item;
},this);
},setHeaderMenu:function(menu){
if(this._placeholders.length){
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
},setupHeaderMenu:function(){
if(this._placeholders&&this._placeholders.length){
dojo.forEach(this._placeholders,function(p){
if(p._replaced){
p.unReplace(true);
}
p.replace(this.getColumnTogglingItems());
},this);
}
},_fetch:function(_dbf){
this.setScrollTop(0);
},getItem:function(_dc0){
return null;
},showMessage:function(_dc1){
if(_dc1){
this.messagesNode.innerHTML=_dc1;
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
},resize:function(_dc2,_dc3){
var _dc4={};
dojo.mixin(_dc4,_dc3||{});
dojo.mixin(_dc4,_dc2||{});
this._sizeBox=_dc4;
this._resize();
this.sizeChange();
},_getPadBorder:function(){
this._padBorder=this._padBorder||dojo._getPadBorderExtents(this.domNode);
return this._padBorder;
},_getHeaderHeight:function(){
var vns=this.viewsHeaderNode.style,t=vns.display=="none"?0:this.views.measureHeader();
vns.height=t+"px";
this.views.normalizeHeaderNodeHeight();
return t;
},_resize:function(){
var pn=this.domNode.parentNode;
if(!pn||pn.nodeType!=1||!this.hasLayout()||pn.style.visibility=="hidden"||pn.style.display=="none"){
return;
}
var _dc8=this._getPadBorder();
if(this._autoHeight){
this.domNode.style.height="auto";
this.viewsNode.style.height="";
}else{
if(typeof this.autoHeight=="number"){
var h=this._getHeaderHeight();
h+=(this.scroller.averageRowHeight*this.autoHeight);
this.domNode.style.height=h+"px";
}else{
if(this.flex>0){
}else{
if(this.domNode.clientHeight<=_dc8.h){
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
}
if(this._sizeBox){
dojo.contentBox(this.domNode,this._sizeBox);
}else{
if(this.fitTo=="parent"){
var h=dojo._getContentBox(pn).h;
dojo.marginBox(this.domNode,{h:Math.max(0,h)});
}
}
var h=dojo._getContentBox(this.domNode).h;
if(h==0&&!this._autoHeight){
this.viewsHeaderNode.style.display="none";
}else{
this.viewsHeaderNode.style.display="block";
this._getHeaderHeight();
}
this.adaptWidth();
this.adaptHeight();
this.postresize();
},adaptWidth:function(){
var w=this.autoWidth?0:this.domNode.clientWidth||(this.domNode.offsetWidth-this._getPadBorder().w),vw=this.views.arrange(1,w);
this.views.onEach("adaptWidth");
if(this.autoWidth){
this.domNode.style.width=vw+"px";
}
},adaptHeight:function(){
var t=this._getHeaderHeight();
var h=(this._autoHeight?-1:Math.max(this.domNode.clientHeight-t,0)||0);
this.views.onEach("setSize",[0,h]);
this.views.onEach("adaptHeight");
if(!this._autoHeight){
var _dce=0,_dcf=0;
var _dd0=dojo.filter(this.views.views,function(v){
var has=v.hasHScrollbar();
if(has){
_dce++;
}else{
_dcf++;
}
return (!has);
});
if(_dce>0&&_dcf>0){
dojo.forEach(_dd0,function(v){
v.adaptHeight(true);
});
}
}
if(this.autoHeight===true||h!=-1||(typeof this.autoHeight=="number"&&this.autoHeight>=this.rowCount)){
this.scroller.windowHeight=h;
}else{
this.scroller.windowHeight=Math.max(this.domNode.clientHeight-t,0);
}
},startup:function(){
if(this._started){
return;
}
this.inherited(arguments);
this.render();
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
this.scroller.init(this.rowCount,this.keepRows,this.rowsPerPage);
this.prerender();
this.setScrollTop(0);
this.postrender();
},prerender:function(){
this.keepRows=this._autoHeight?0:this.constructor.prototype.keepRows;
this.scroller.setKeepInfo(this.keepRows);
this.views.render();
this._resize();
},postrender:function(){
this.postresize();
this.focus.initFocusView();
dojo.setSelectable(this.domNode,false);
},postresize:function(){
if(this._autoHeight){
var size=Math.max(this.views.measureContent())+"px";
this.viewsNode.style.height=size;
}
},renderRow:function(_dd5,_dd6){
this.views.renderRow(_dd5,_dd6);
},rowRemoved:function(_dd7){
this.views.rowRemoved(_dd7);
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
this.invalidated=null;
},defaultUpdate:function(){
if(!this.domNode){
return;
}
if(this.updating){
this.invalidated.all=true;
return;
}
var _dda=this.scrollTop;
this.prerender();
this.scroller.invalidateNodes();
this.setScrollTop(_dda);
this.postrender();
},update:function(){
this.render();
},updateRow:function(_ddb){
_ddb=Number(_ddb);
if(this.updating){
this.invalidated[_ddb]=true;
}else{
this.views.updateRow(_ddb);
this.scroller.rowHeightChanged(_ddb);
}
},updateRows:function(_ddc,_ddd){
_ddc=Number(_ddc);
_ddd=Number(_ddd);
if(this.updating){
for(var i=0;i<_ddd;i++){
this.invalidated[i+_ddc]=true;
}
}else{
for(var i=0;i<_ddd;i++){
this.views.updateRow(i+_ddc);
}
this.scroller.rowHeightChanged(_ddc);
}
},updateRowCount:function(_ddf){
if(this.updating){
this.invalidated.rowCount=_ddf;
}else{
this.rowCount=_ddf;
this._setAutoHeightAttr(this.autoHeight,true);
if(this.layout.cells.length){
this.scroller.updateRowCount(_ddf);
}
this._resize();
if(this.layout.cells.length){
this.setScrollTop(this.scrollTop);
}
}
},updateRowStyles:function(_de0){
this.views.updateRowStyles(_de0);
},rowHeightChanged:function(_de1){
this.views.renormalizeRow(_de1);
this.scroller.rowHeightChanged(_de1);
},fastScroll:true,delayScroll:false,scrollRedrawThreshold:(dojo.isIE?100:50),scrollTo:function(_de2){
if(!this.fastScroll){
this.setScrollTop(_de2);
return;
}
var _de3=Math.abs(this.lastScrollTop-_de2);
this.lastScrollTop=_de2;
if(_de3>this.scrollRedrawThreshold||this.delayScroll){
this.delayScroll=true;
this.scrollTop=_de2;
this.views.setScrollTop(_de2);
jobs.job("dojoxGridScroll",200,dojo.hitch(this,"finishScrollJob"));
}else{
this.setScrollTop(_de2);
}
},finishScrollJob:function(){
this.delayScroll=false;
this.setScrollTop(this.scrollTop);
},setScrollTop:function(_de4){
this.scroller.scroll(this.views.setScrollTop(_de4));
},scrollToRow:function(_de5){
this.setScrollTop(this.scroller.findScrollTop(_de5)+1);
},styleRowNode:function(_de6,_de7){
if(_de7){
this.rows.styleRowNode(_de6,_de7);
}
},_mouseOut:function(e){
this.rows.setOverRow(-2);
},getCell:function(_de9){
return this.layout.cells[_de9];
},setCellWidth:function(_dea,_deb){
this.getCell(_dea).unitWidth=_deb;
},getCellName:function(_dec){
return "Cell "+_dec.index;
},canSort:function(_ded){
},sort:function(){
},getSortAsc:function(_dee){
_dee=_dee==undefined?this.sortInfo:_dee;
return Boolean(_dee>0);
},getSortIndex:function(_def){
_def=_def==undefined?this.sortInfo:_def;
return Math.abs(_def)-1;
},setSortIndex:function(_df0,_df1){
var si=_df0+1;
if(_df1!=undefined){
si*=(_df1?1:-1);
}else{
if(this.getSortIndex()==_df0){
si=-this.sortInfo;
}
}
this.setSortInfo(si);
},setSortInfo:function(_df3){
if(this.canSort(_df3)){
this.sortInfo=_df3;
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
},doStartEdit:function(_e01,_e02){
this.onStartEdit(_e01,_e02);
},doApplyCellEdit:function(_e03,_e04,_e05){
this.onApplyCellEdit(_e03,_e04,_e05);
},doCancelEdit:function(_e06){
this.onCancelEdit(_e06);
},doApplyEdit:function(_e07){
this.onApplyEdit(_e07);
},addRow:function(){
this.updateRowCount(this.rowCount+1);
},removeSelectedRows:function(){
this.updateRowCount(Math.max(0,this.rowCount-this.selection.getSelected().length));
this.selection.clear();
}});
dojox.grid._Grid.markupFactory=function(_e08,node,ctor,_e0b){
var d=dojo;
var _e0d=function(n){
var w=d.attr(n,"width")||"auto";
if((w!="auto")&&(w.slice(-2)!="em")&&(w.slice(-1)!="%")){
w=parseInt(w)+"px";
}
return w;
};
if(!_e08.structure&&node.nodeName.toLowerCase()=="table"){
_e08.structure=d.query("> colgroup",node).map(function(cg){
var sv=d.attr(cg,"span");
var v={noscroll:(d.attr(cg,"noscroll")=="true")?true:false,__span:(!!sv?parseInt(sv):1),cells:[]};
if(d.hasAttr(cg,"width")){
v.width=_e0d(cg);
}
return v;
});
if(!_e08.structure.length){
_e08.structure.push({__span:Infinity,cells:[]});
}
d.query("thead > tr",node).forEach(function(tr,_e14){
var _e15=0;
var _e16=0;
var _e17;
var _e18=null;
d.query("> th",tr).map(function(th){
if(!_e18){
_e17=0;
_e18=_e08.structure[0];
}else{
if(_e15>=(_e17+_e18.__span)){
_e16++;
_e17+=_e18.__span;
lastView=_e18;
_e18=_e08.structure[_e16];
}
}
var cell={name:d.trim(d.attr(th,"name")||th.innerHTML),colSpan:parseInt(d.attr(th,"colspan")||1,10),type:d.trim(d.attr(th,"cellType")||"")};
_e15+=cell.colSpan;
var _e1b=d.attr(th,"rowspan");
if(_e1b){
cell.rowSpan=_e1b;
}
if(d.hasAttr(th,"width")){
cell.width=_e0d(th);
}
if(d.hasAttr(th,"relWidth")){
cell.relWidth=window.parseInt(dojo.attr(th,"relWidth"),10);
}
if(d.hasAttr(th,"hidden")){
cell.hidden=d.attr(th,"hidden")=="true";
}
if(_e0b){
_e0b(th,cell);
}
cell.type=cell.type?dojo.getObject(cell.type):dojox.grid.cells.Cell;
if(cell.type&&cell.type.markupFactory){
cell.type.markupFactory(th,cell);
}
if(!_e18.cells[_e14]){
_e18.cells[_e14]=[];
}
_e18.cells[_e14].push(cell);
});
});
}
return new ctor(_e08,node);
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
},getNextSelected:function(_e1d){
var _e1e=this.grid.getItemIndex(_e1d);
var idx=dojox.grid.Selection.prototype.getNextSelected.call(this,_e1e);
if(idx==-1){
return null;
}
return this.grid.getItem(idx);
},getSelected:function(){
var _e20=[];
for(var i=0,l=this.selected.length;i<l;i++){
if(this.selected[i]){
_e20.push(this.grid.getItem(i));
}
}
return _e20;
},addToSelection:function(_e23){
if(this.mode=="none"){
return;
}
var idx=null;
if(typeof _e23=="number"||typeof _e23=="string"){
idx=_e23;
}else{
idx=this.grid.getItemIndex(_e23);
}
dojox.grid.Selection.prototype.addToSelection.call(this,idx);
},deselect:function(_e25){
if(this.mode=="none"){
return;
}
var idx=null;
if(typeof _e25=="number"||typeof _e25=="string"){
idx=_e25;
}else{
idx=this.grid.getItemIndex(_e25);
}
dojox.grid.Selection.prototype.deselect.call(this,idx);
},deselectAll:function(_e27){
var idx=null;
if(_e27||typeof _e27=="number"){
if(typeof _e27=="number"||typeof _e27=="string"){
idx=_e27;
}else{
idx=this.grid.getItemIndex(_e27);
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
dojo.declare("dojox.grid.DataGrid",dojox.grid._Grid,{store:null,query:null,queryOptions:null,fetchText:"...",items:null,_store_connects:null,_by_idty:null,_by_idx:null,_cache:null,_pages:null,_pending_requests:null,_bop:-1,_eop:-1,_requests:0,rowCount:0,_isLoaded:false,_isLoading:false,postCreate:function(){
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
},get:function(_e29,_e2a){
return (!_e2a?this.defaultValue:(!this.field?this.value:this.grid.store.getValue(_e2a,this.field)));
},_onSet:function(item,_e2c,_e2d,_e2e){
var idx=this.getItemIndex(item);
if(idx>-1){
this.updateRow(idx);
}
},_addItem:function(item,_e31,_e32){
var idty=this._hasIdentity?this.store.getIdentity(item):dojo.toJson(this.query)+":idx:"+_e31+":sort:"+dojo.toJson(this.getSortProps());
var o={idty:idty,item:item};
this._by_idty[idty]=this._by_idx[_e31]=o;
if(!_e32){
this.updateRow(_e31);
}
},_onNew:function(item,_e36){
this.updateRowCount(this.rowCount+1);
this._addItem(item,this.rowCount-1);
this.showMessage();
},_onDelete:function(item){
var idx=this._getItemIndex(item,true);
if(idx>=0){
var o=this._by_idx[idx];
this._by_idx.splice(idx,1);
delete this._by_idty[o.idty];
this.updateRowCount(this.rowCount-1);
if(this.rowCount===0){
this.showMessage(this.noDataMessage);
}
}
},_onRevert:function(){
this._refresh();
},setStore:function(_e3a,_e3b,_e3c){
this._setQuery(_e3b,_e3c);
this._setStore(_e3a);
this._refresh(true);
},setQuery:function(_e3d,_e3e){
this._setQuery(_e3d,_e3e);
this._refresh(true);
},setItems:function(_e3f){
this.items=_e3f;
this._setStore(this.store);
this._refresh(true);
},_setQuery:function(_e40,_e41){
this.query=_e40||this.query;
this.queryOptions=_e41||this.queryOptions;
},_setStore:function(_e42){
if(this.store&&this._store_connects){
dojo.forEach(this._store_connects,function(arr){
dojo.forEach(arr,dojo.disconnect);
});
}
this.store=_e42;
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
if(this.rowCount!=size){
if(req.isRender){
this.scroller.init(size,this.keepRows,this.rowsPerPage);
this.prerender();
}
this.updateRowCount(size);
}
},_onFetchComplete:function(_e48,req){
if(_e48&&_e48.length>0){
dojo.forEach(_e48,function(item,idx){
this._addItem(item,req.start+idx,true);
},this);
this.updateRows(req.start,_e48.length);
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
if(!_e48||!_e48.length){
this.showMessage(this.noDataMessage);
}else{
this.showMessage();
}
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
this.onFetchError(err,req);
},onFetchError:function(err,req){
},_fetch:function(_e50,_e51){
var _e50=_e50||0;
if(this.store&&!this._pending_requests[_e50]){
if(!this._isLoaded&&!this._isLoading){
this._isLoading=true;
this.showMessage(this.loadingMessage);
}
this._pending_requests[_e50]=true;
try{
if(this.items){
var _e52=this.items;
var _e53=this.store;
this.rowsPerPage=_e52.length;
var req={start:_e50,count:this.rowsPerPage,isRender:_e51};
this._onFetchBegin(_e52.length,req);
var _e55=0;
dojo.forEach(_e52,function(i){
if(!_e53.isItemLoaded(i)){
_e55++;
}
});
if(_e55===0){
this._onFetchComplete(_e52,req);
}else{
var _e57=function(item){
_e55--;
if(_e55===0){
this._onFetchComplete(_e52,req);
}
};
dojo.forEach(_e52,function(i){
if(!_e53.isItemLoaded(i)){
_e53.loadItem({item:i,onItem:_e57,scope:this});
}
},this);
}
}else{
this.store.fetch({start:_e50,count:this.rowsPerPage,query:this.query,sort:this.getSortProps(),queryOptions:this.queryOptions,isRender:_e51,onBegin:dojo.hitch(this,"_onFetchBegin"),onComplete:dojo.hitch(this,"_onFetchComplete"),onError:dojo.hitch(this,"_onFetchError")});
}
}
catch(e){
this._onFetchError(e);
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
},_getItemIndex:function(item,_e5e){
if(!_e5e&&!this.store.isItem(item)){
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
},filter:function(_e63,_e64){
this.query=_e63;
if(_e64){
this._clearData();
}
this._fetch();
},_getItemAttr:function(idx,attr){
var item=this.getItem(idx);
return (!item?this.fetchText:this.store.getValue(item,attr));
},_render:function(){
if(this.domNode.parentNode){
this.scroller.init(this.rowCount,this.keepRows,this.rowsPerPage);
this.prerender();
this._fetch(0,true);
}
},_requestsPending:function(_e68){
return this._pending_requests[_e68];
},_rowToPage:function(_e69){
return (this.rowsPerPage?Math.floor(_e69/this.rowsPerPage):_e69);
},_pageToRow:function(_e6a){
return (this.rowsPerPage?this.rowsPerPage*_e6a:_e6a);
},_preparePage:function(_e6b){
if(_e6b<this._bop||_e6b>=this._eop){
var _e6c=this._rowToPage(_e6b);
this._needPage(_e6c);
this._bop=_e6c*this.rowsPerPage;
this._eop=this._bop+(this.rowsPerPage||this.rowCount);
}
},_needPage:function(_e6d){
if(!this._pages[_e6d]){
this._pages[_e6d]=true;
this._requestPage(_e6d);
}
},_requestPage:function(_e6e){
var row=this._pageToRow(_e6e);
var _e70=Math.min(this.rowsPerPage,this.rowCount-row);
if(_e70>0){
this._requests++;
if(!this._requestsPending(row)){
setTimeout(dojo.hitch(this,"_fetch",row,false),1);
}
}
},getCellName:function(_e71){
return _e71.field;
},_refresh:function(_e72){
this._clearData();
this._fetch(0,_e72);
},sort:function(){
this._lastScrollTop=this.scrollTop;
this._refresh();
},canSort:function(){
return (!this._isLoading);
},getSortProps:function(){
var c=this.getCell(this.getSortIndex());
if(!c){
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
},styleRowState:function(_e76){
if(this.store&&this.store.getState){
var _e77=this.store.getState(_e76.index),c="";
for(var i=0,ss=["inflight","error","inserting"],s;s=ss[i];i++){
if(_e77[s]){
c=" dojoxGridRow-"+s;
break;
}
}
_e76.customClasses+=c;
}
},onStyleRow:function(_e7c){
this.styleRowState(_e7c);
this.inherited(arguments);
},canEdit:function(_e7d,_e7e){
return this._canEdit;
},_copyAttr:function(idx,attr){
var row={};
var _e82={};
var src=this.getItem(idx);
return this.store.getValue(src,attr);
},doStartEdit:function(_e84,_e85){
if(!this._cache[_e85]){
this._cache[_e85]=this._copyAttr(_e85,_e84.field);
}
this.onStartEdit(_e84,_e85);
},doApplyCellEdit:function(_e86,_e87,_e88){
this.store.fetchItemByIdentity({identity:this._by_idx[_e87].idty,onItem:dojo.hitch(this,function(item){
this.store.setValue(item,_e88,_e86);
this.onApplyCellEdit(_e86,_e87,_e88);
})});
},doCancelEdit:function(_e8a){
var _e8b=this._cache[_e8a];
if(_e8b){
this.updateRow(_e8a);
delete this._cache[_e8a];
}
this.onCancelEdit.apply(this,arguments);
},doApplyEdit:function(_e8c,_e8d){
var _e8e=this._cache[_e8c];
this.onApplyEdit(_e8c);
},removeSelectedRows:function(){
if(this._canEdit){
this.edit.apply();
var _e8f=this.selection.getSelected();
if(_e8f.length){
dojo.forEach(_e8f,this.store.deleteItem,this.store);
this.selection.clear();
}
}
}});
dojox.grid.DataGrid.markupFactory=function(_e90,node,ctor,_e93){
return dojox.grid._Grid.markupFactory(_e90,node,ctor,function(node,_e95){
var _e96=dojo.trim(dojo.attr(node,"field")||"");
if(_e96){
_e95.field=_e96;
}
_e95.field=_e95.field||_e95.name;
if(_e93){
_e93(node,_e95);
}
});
};
}
if(!dojo._hasResource["dojo.cldr.supplemental"]){
dojo._hasResource["dojo.cldr.supplemental"]=true;
dojo.provide("dojo.cldr.supplemental");
dojo.cldr.supplemental.getFirstDayOfWeek=function(_e97){
var _e98={mv:5,ae:6,af:6,bh:6,dj:6,dz:6,eg:6,er:6,et:6,iq:6,ir:6,jo:6,ke:6,kw:6,lb:6,ly:6,ma:6,om:6,qa:6,sa:6,sd:6,so:6,tn:6,ye:6,as:0,au:0,az:0,bw:0,ca:0,cn:0,fo:0,ge:0,gl:0,gu:0,hk:0,ie:0,il:0,is:0,jm:0,jp:0,kg:0,kr:0,la:0,mh:0,mo:0,mp:0,mt:0,nz:0,ph:0,pk:0,sg:0,th:0,tt:0,tw:0,um:0,us:0,uz:0,vi:0,za:0,zw:0,et:0,mw:0,ng:0,tj:0,sy:4};
var _e99=dojo.cldr.supplemental._region(_e97);
var dow=_e98[_e99];
return (dow===undefined)?1:dow;
};
dojo.cldr.supplemental._region=function(_e9b){
_e9b=dojo.i18n.normalizeLocale(_e9b);
var tags=_e9b.split("-");
var _e9d=tags[1];
if(!_e9d){
_e9d={de:"de",en:"us",es:"es",fi:"fi",fr:"fr",he:"il",hu:"hu",it:"it",ja:"jp",ko:"kr",nl:"nl",pt:"br",sv:"se",zh:"cn"}[tags[0]];
}else{
if(_e9d.length==4){
_e9d=tags[2];
}
}
return _e9d;
};
dojo.cldr.supplemental.getWeekend=function(_e9e){
var _e9f={eg:5,il:5,sy:5,"in":0,ae:4,bh:4,dz:4,iq:4,jo:4,kw:4,lb:4,ly:4,ma:4,om:4,qa:4,sa:4,sd:4,tn:4,ye:4};
var _ea0={ae:5,bh:5,dz:5,iq:5,jo:5,kw:5,lb:5,ly:5,ma:5,om:5,qa:5,sa:5,sd:5,tn:5,ye:5,af:5,ir:5,eg:6,il:6,sy:6};
var _ea1=dojo.cldr.supplemental._region(_e9e);
var _ea2=_e9f[_ea1];
var end=_ea0[_ea1];
if(_ea2===undefined){
_ea2=6;
}
if(end===undefined){
end=0;
}
return {start:_ea2,end:end};
};
}
if(!dojo._hasResource["dojo.date"]){
dojo._hasResource["dojo.date"]=true;
dojo.provide("dojo.date");
dojo.date.getDaysInMonth=function(_ea4){
var _ea5=_ea4.getMonth();
var days=[31,28,31,30,31,30,31,31,30,31,30,31];
if(_ea5==1&&dojo.date.isLeapYear(_ea4)){
return 29;
}
return days[_ea5];
};
dojo.date.isLeapYear=function(_ea7){
var year=_ea7.getFullYear();
return !(year%400)||(!(year%4)&&!!(year%100));
};
dojo.date.getTimezoneName=function(_ea9){
var str=_ea9.toString();
var tz="";
var _eac;
var pos=str.indexOf("(");
if(pos>-1){
tz=str.substring(++pos,str.indexOf(")"));
}else{
var pat=/([A-Z\/]+) \d{4}$/;
if((_eac=str.match(pat))){
tz=_eac[1];
}else{
str=_ea9.toLocaleString();
pat=/ ([A-Z\/]+)$/;
if((_eac=str.match(pat))){
tz=_eac[1];
}
}
}
return (tz=="AM"||tz=="PM")?"":tz;
};
dojo.date.compare=function(_eaf,_eb0,_eb1){
_eaf=new Date(Number(_eaf));
_eb0=new Date(Number(_eb0||new Date()));
if(_eb1!=="undefined"){
if(_eb1=="date"){
_eaf.setHours(0,0,0,0);
_eb0.setHours(0,0,0,0);
}else{
if(_eb1=="time"){
_eaf.setFullYear(0,0,0);
_eb0.setFullYear(0,0,0);
}
}
}
if(_eaf>_eb0){
return 1;
}
if(_eaf<_eb0){
return -1;
}
return 0;
};
dojo.date.add=function(date,_eb3,_eb4){
var sum=new Date(Number(date));
var _eb6=false;
var _eb7="Date";
switch(_eb3){
case "day":
break;
case "weekday":
var days,_eb9;
var mod=_eb4%5;
if(!mod){
days=(_eb4>0)?5:-5;
_eb9=(_eb4>0)?((_eb4-5)/5):((_eb4+5)/5);
}else{
days=mod;
_eb9=parseInt(_eb4/5);
}
var strt=date.getDay();
var adj=0;
if(strt==6&&_eb4>0){
adj=1;
}else{
if(strt==0&&_eb4<0){
adj=-1;
}
}
var trgt=strt+days;
if(trgt==0||trgt==6){
adj=(_eb4>0)?2:-2;
}
_eb4=(7*_eb9)+days+adj;
break;
case "year":
_eb7="FullYear";
_eb6=true;
break;
case "week":
_eb4*=7;
break;
case "quarter":
_eb4*=3;
case "month":
_eb6=true;
_eb7="Month";
break;
case "hour":
case "minute":
case "second":
case "millisecond":
_eb7="UTC"+_eb3.charAt(0).toUpperCase()+_eb3.substring(1)+"s";
}
if(_eb7){
sum["set"+_eb7](sum["get"+_eb7]()+_eb4);
}
if(_eb6&&(sum.getDate()<date.getDate())){
sum.setDate(0);
}
return sum;
};
dojo.date.difference=function(_ebe,_ebf,_ec0){
_ebf=_ebf||new Date();
_ec0=_ec0||"day";
var _ec1=_ebf.getFullYear()-_ebe.getFullYear();
var _ec2=1;
switch(_ec0){
case "quarter":
var m1=_ebe.getMonth();
var m2=_ebf.getMonth();
var q1=Math.floor(m1/3)+1;
var q2=Math.floor(m2/3)+1;
q2+=(_ec1*4);
_ec2=q2-q1;
break;
case "weekday":
var days=Math.round(dojo.date.difference(_ebe,_ebf,"day"));
var _ec8=parseInt(dojo.date.difference(_ebe,_ebf,"week"));
var mod=days%7;
if(mod==0){
days=_ec8*5;
}else{
var adj=0;
var aDay=_ebe.getDay();
var bDay=_ebf.getDay();
_ec8=parseInt(days/7);
mod=days%7;
var _ecd=new Date(_ebe);
_ecd.setDate(_ecd.getDate()+(_ec8*7));
var _ece=_ecd.getDay();
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
case (_ece+mod)>5:
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
case (_ece+mod)<0:
adj=2;
}
}
}
days+=adj;
days-=(_ec8*2);
}
_ec2=days;
break;
case "year":
_ec2=_ec1;
break;
case "month":
_ec2=(_ebf.getMonth()-_ebe.getMonth())+(_ec1*12);
break;
case "week":
_ec2=parseInt(dojo.date.difference(_ebe,_ebf,"day")/7);
break;
case "day":
_ec2/=24;
case "hour":
_ec2/=60;
case "minute":
_ec2/=60;
case "second":
_ec2/=1000;
case "millisecond":
_ec2*=_ebf.getTime()-_ebe.getTime();
}
return Math.round(_ec2);
};
}
if(!dojo._hasResource["dojo.date.locale"]){
dojo._hasResource["dojo.date.locale"]=true;
dojo.provide("dojo.date.locale");
(function(){
function formatPattern(_ecf,_ed0,_ed1,_ed2){
return _ed2.replace(/([a-z])\1*/ig,function(_ed3){
var s,pad;
var c=_ed3.charAt(0);
var l=_ed3.length;
var _ed8=["abbr","wide","narrow"];
switch(c){
case "G":
s=_ed0[(l<4)?"eraAbbr":"eraNames"][_ecf.getFullYear()<0?0:1];
break;
case "y":
s=_ecf.getFullYear();
switch(l){
case 1:
break;
case 2:
if(!_ed1){
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
s=Math.ceil((_ecf.getMonth()+1)/3);
pad=true;
break;
case "M":
var m=_ecf.getMonth();
if(l<3){
s=m+1;
pad=true;
}else{
var _eda=["months","format",_ed8[l-3]].join("-");
s=_ed0[_eda][m];
}
break;
case "w":
var _edb=0;
s=dojo.date.locale._getWeekOfYear(_ecf,_edb);
pad=true;
break;
case "d":
s=_ecf.getDate();
pad=true;
break;
case "D":
s=dojo.date.locale._getDayOfYear(_ecf);
pad=true;
break;
case "E":
var d=_ecf.getDay();
if(l<3){
s=d+1;
pad=true;
}else{
var _edd=["days","format",_ed8[l-3]].join("-");
s=_ed0[_edd][d];
}
break;
case "a":
var _ede=(_ecf.getHours()<12)?"am":"pm";
s=_ed0[_ede];
break;
case "h":
case "H":
case "K":
case "k":
var h=_ecf.getHours();
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
s=_ecf.getMinutes();
pad=true;
break;
case "s":
s=_ecf.getSeconds();
pad=true;
break;
case "S":
s=Math.round(_ecf.getMilliseconds()*Math.pow(10,l-3));
pad=true;
break;
case "v":
case "z":
s=dojo.date.getTimezoneName(_ecf);
if(s){
break;
}
l=4;
case "Z":
var _ee0=_ecf.getTimezoneOffset();
var tz=[(_ee0<=0?"+":"-"),dojo.string.pad(Math.floor(Math.abs(_ee0)/60),2),dojo.string.pad(Math.abs(_ee0)%60,2)];
if(l==4){
tz.splice(0,0,"GMT");
tz.splice(3,0,":");
}
s=tz.join("");
break;
default:
throw new Error("dojo.date.locale.format: invalid pattern char: "+_ed2);
}
if(pad){
s=dojo.string.pad(s,l);
}
return s;
});
};
dojo.date.locale.format=function(_ee2,_ee3){
_ee3=_ee3||{};
var _ee4=dojo.i18n.normalizeLocale(_ee3.locale);
var _ee5=_ee3.formatLength||"short";
var _ee6=dojo.date.locale._getGregorianBundle(_ee4);
var str=[];
var _ee8=dojo.hitch(this,formatPattern,_ee2,_ee6,_ee3.fullYear);
if(_ee3.selector=="year"){
var year=_ee2.getFullYear();
if(_ee4.match(/^zh|^ja/)){
year+="年";
}
return year;
}
if(_ee3.selector!="time"){
var _eea=_ee3.datePattern||_ee6["dateFormat-"+_ee5];
if(_eea){
str.push(_processPattern(_eea,_ee8));
}
}
if(_ee3.selector!="date"){
var _eeb=_ee3.timePattern||_ee6["timeFormat-"+_ee5];
if(_eeb){
str.push(_processPattern(_eeb,_ee8));
}
}
var _eec=str.join(" ");
return _eec;
};
dojo.date.locale.regexp=function(_eed){
return dojo.date.locale._parseInfo(_eed).regexp;
};
dojo.date.locale._parseInfo=function(_eee){
_eee=_eee||{};
var _eef=dojo.i18n.normalizeLocale(_eee.locale);
var _ef0=dojo.date.locale._getGregorianBundle(_eef);
var _ef1=_eee.formatLength||"short";
var _ef2=_eee.datePattern||_ef0["dateFormat-"+_ef1];
var _ef3=_eee.timePattern||_ef0["timeFormat-"+_ef1];
var _ef4;
if(_eee.selector=="date"){
_ef4=_ef2;
}else{
if(_eee.selector=="time"){
_ef4=_ef3;
}else{
_ef4=_ef2+" "+_ef3;
}
}
var _ef5=[];
var re=_processPattern(_ef4,dojo.hitch(this,_buildDateTimeRE,_ef5,_ef0,_eee));
return {regexp:re,tokens:_ef5,bundle:_ef0};
};
dojo.date.locale.parse=function(_ef7,_ef8){
var info=dojo.date.locale._parseInfo(_ef8);
var _efa=info.tokens,_efb=info.bundle;
var re=new RegExp("^"+info.regexp+"$",info.strict?"":"i");
var _efd=re.exec(_ef7);
if(!_efd){
return null;
}
var _efe=["abbr","wide","narrow"];
var _eff=[1970,0,1,0,0,0,0];
var amPm="";
var _f01=dojo.every(_efd,function(v,i){
if(!i){
return true;
}
var _f04=_efa[i-1];
var l=_f04.length;
switch(_f04.charAt(0)){
case "y":
if(l!=2&&_ef8.strict){
_eff[0]=v;
}else{
if(v<100){
v=Number(v);
var year=""+new Date().getFullYear();
var _f07=year.substring(0,2)*100;
var _f08=Math.min(Number(year.substring(2,4))+20,99);
var num=(v<_f08)?_f07+v:_f07-100+v;
_eff[0]=num;
}else{
if(_ef8.strict){
return false;
}
_eff[0]=v;
}
}
break;
case "M":
if(l>2){
var _f0a=_efb["months-format-"+_efe[l-3]].concat();
if(!_ef8.strict){
v=v.replace(".","").toLowerCase();
_f0a=dojo.map(_f0a,function(s){
return s.replace(".","").toLowerCase();
});
}
v=dojo.indexOf(_f0a,v);
if(v==-1){
return false;
}
}else{
v--;
}
_eff[1]=v;
break;
case "E":
case "e":
var days=_efb["days-format-"+_efe[l-3]].concat();
if(!_ef8.strict){
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
_eff[1]=0;
case "d":
_eff[2]=v;
break;
case "a":
var am=_ef8.am||_efb.am;
var pm=_ef8.pm||_efb.pm;
if(!_ef8.strict){
var _f10=/\./g;
v=v.replace(_f10,"").toLowerCase();
am=am.replace(_f10,"").toLowerCase();
pm=pm.replace(_f10,"").toLowerCase();
}
if(_ef8.strict&&v!=am&&v!=pm){
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
_eff[3]=v;
break;
case "m":
_eff[4]=v;
break;
case "s":
_eff[5]=v;
break;
case "S":
_eff[6]=v;
}
return true;
});
var _f11=+_eff[3];
if(amPm==="p"&&_f11<12){
_eff[3]=_f11+12;
}else{
if(amPm==="a"&&_f11==12){
_eff[3]=0;
}
}
var _f12=new Date(_eff[0],_eff[1],_eff[2],_eff[3],_eff[4],_eff[5],_eff[6]);
if(_ef8.strict){
_f12.setFullYear(_eff[0]);
}
var _f13=_efa.join("");
if(!_f01||(_f13.indexOf("M")!=-1&&_f12.getMonth()!=_eff[1])||(_f13.indexOf("d")!=-1&&_f12.getDate()!=_eff[2])){
return null;
}
return _f12;
};
function _processPattern(_f14,_f15,_f16,_f17){
var _f18=function(x){
return x;
};
_f15=_f15||_f18;
_f16=_f16||_f18;
_f17=_f17||_f18;
var _f1a=_f14.match(/(''|[^'])+/g);
var _f1b=_f14.charAt(0)=="'";
dojo.forEach(_f1a,function(_f1c,i){
if(!_f1c){
_f1a[i]="";
}else{
_f1a[i]=(_f1b?_f16:_f15)(_f1c);
_f1b=!_f1b;
}
});
return _f17(_f1a.join(""));
};
function _buildDateTimeRE(_f1e,_f1f,_f20,_f21){
_f21=dojo.regexp.escapeString(_f21);
if(!_f20.strict){
_f21=_f21.replace(" a"," ?a");
}
return _f21.replace(/([a-z])\1*/ig,function(_f22){
var s;
var c=_f22.charAt(0);
var l=_f22.length;
var p2="",p3="";
if(_f20.strict){
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
var am=_f20.am||_f1f.am||"AM";
var pm=_f20.pm||_f1f.pm||"PM";
if(_f20.strict){
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
if(_f1e){
_f1e.push(_f22);
}
return "("+s+")";
}).replace(/[\xa0 ]/g,"[\\s\\xa0]");
};
})();
(function(){
var _f2a=[];
dojo.date.locale.addCustomFormats=function(_f2b,_f2c){
_f2a.push({pkg:_f2b,name:_f2c});
};
dojo.date.locale._getGregorianBundle=function(_f2d){
var _f2e={};
dojo.forEach(_f2a,function(desc){
var _f30=dojo.i18n.getLocalization(desc.pkg,desc.name,_f2d);
_f2e=dojo.mixin(_f2e,_f30);
},this);
return _f2e;
};
})();
dojo.date.locale.addCustomFormats("dojo.cldr","gregorian");
dojo.date.locale.getNames=function(item,type,use,_f34){
var _f35;
var _f36=dojo.date.locale._getGregorianBundle(_f34);
var _f37=[item,use,type];
if(use=="standAlone"){
var key=_f37.join("-");
_f35=_f36[key];
if(_f35[0]==1){
_f35=undefined;
}
}
_f37[1]="format";
return (_f35||_f36[_f37.join("-")]).concat();
};
dojo.date.locale.isWeekend=function(_f39,_f3a){
var _f3b=dojo.cldr.supplemental.getWeekend(_f3a);
var day=(_f39||new Date()).getDay();
if(_f3b.end<_f3b.start){
_f3b.end+=7;
if(day<_f3b.start){
day+=7;
}
}
return day>=_f3b.start&&day<=_f3b.end;
};
dojo.date.locale._getDayOfYear=function(_f3d){
return dojo.date.difference(new Date(_f3d.getFullYear(),0,1,_f3d.getHours()),_f3d)+1;
};
dojo.date.locale._getWeekOfYear=function(_f3e,_f3f){
if(arguments.length==1){
_f3f=0;
}
var _f40=new Date(_f3e.getFullYear(),0,1).getDay();
var adj=(_f40-_f3f+7)%7;
var week=Math.floor((dojo.date.locale._getDayOfYear(_f3e)+adj-1)/7);
if(_f40==_f3f){
week++;
}
return week;
};
}
if(!dojo._hasResource["dijit._Calendar"]){
dojo._hasResource["dijit._Calendar"]=true;
dojo.provide("dijit._Calendar");
dojo.declare("dijit._Calendar",[dijit._Widget,dijit._Templated],{templateString:"<table cellspacing=\"0\" cellpadding=\"0\" class=\"dijitCalendarContainer\">\r\n\t<thead>\r\n\t\t<tr class=\"dijitReset dijitCalendarMonthContainer\" valign=\"top\">\r\n\t\t\t<th class='dijitReset' dojoAttachPoint=\"decrementMonth\">\r\n\t\t\t\t<div class=\"dijitInline dijitCalendarIncrementControl dijitCalendarDecrease\"><span dojoAttachPoint=\"decreaseArrowNode\" class=\"dijitA11ySideArrow dijitCalendarIncrementControl dijitCalendarDecreaseInner\">-</span></div>\r\n\t\t\t</th>\r\n\t\t\t<th class='dijitReset' colspan=\"5\">\r\n\t\t\t\t<div dojoAttachPoint=\"monthLabelSpacer\" class=\"dijitCalendarMonthLabelSpacer\"></div>\r\n\t\t\t\t<div dojoAttachPoint=\"monthLabelNode\" class=\"dijitCalendarMonthLabel\"></div>\r\n\t\t\t</th>\r\n\t\t\t<th class='dijitReset' dojoAttachPoint=\"incrementMonth\">\r\n\t\t\t\t<div class=\"dijitInline dijitCalendarIncrementControl dijitCalendarIncrease\"><span dojoAttachPoint=\"increaseArrowNode\" class=\"dijitA11ySideArrow dijitCalendarIncrementControl dijitCalendarIncreaseInner\">+</span></div>\r\n\t\t\t</th>\r\n\t\t</tr>\r\n\t\t<tr>\r\n\t\t\t<th class=\"dijitReset dijitCalendarDayLabelTemplate\"><span class=\"dijitCalendarDayLabel\"></span></th>\r\n\t\t</tr>\r\n\t</thead>\r\n\t<tbody dojoAttachEvent=\"onclick: _onDayClick, onmouseover: _onDayMouseOver, onmouseout: _onDayMouseOut\" class=\"dijitReset dijitCalendarBodyContainer\">\r\n\t\t<tr class=\"dijitReset dijitCalendarWeekTemplate\">\r\n\t\t\t<td class=\"dijitReset dijitCalendarDateTemplate\"><span class=\"dijitCalendarDateLabel\"></span></td>\r\n\t\t</tr>\r\n\t</tbody>\r\n\t<tfoot class=\"dijitReset dijitCalendarYearContainer\">\r\n\t\t<tr>\r\n\t\t\t<td class='dijitReset' valign=\"top\" colspan=\"7\">\r\n\t\t\t\t<h3 class=\"dijitCalendarYearLabel\">\r\n\t\t\t\t\t<span dojoAttachPoint=\"previousYearLabelNode\" class=\"dijitInline dijitCalendarPreviousYear\"></span>\r\n\t\t\t\t\t<span dojoAttachPoint=\"currentYearLabelNode\" class=\"dijitInline dijitCalendarSelectedYear\"></span>\r\n\t\t\t\t\t<span dojoAttachPoint=\"nextYearLabelNode\" class=\"dijitInline dijitCalendarNextYear\"></span>\r\n\t\t\t\t</h3>\r\n\t\t\t</td>\r\n\t\t</tr>\r\n\t</tfoot>\r\n</table>\t\r\n",value:new Date(),dayWidth:"narrow",setValue:function(_f43){
dojo.deprecated("dijit.Calendar:setValue() is deprecated.  Use attr('value', ...) instead.","","2.0");
this.attr("value",_f43);
},_setValueAttr:function(_f44){
if(!this.value||dojo.date.compare(_f44,this.value)){
_f44=new Date(_f44);
this.displayMonth=new Date(_f44);
if(!this.isDisabledDate(_f44,this.lang)){
this.value=_f44;
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
var _f47=this.displayMonth;
_f47.setDate(1);
var _f48=_f47.getDay();
var _f49=dojo.date.getDaysInMonth(_f47);
var _f4a=dojo.date.getDaysInMonth(dojo.date.add(_f47,"month",-1));
var _f4b=new Date();
var _f4c=this.value;
var _f4d=dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
if(_f4d>_f48){
_f4d-=7;
}
dojo.query(".dijitCalendarDateTemplate",this.domNode).forEach(function(_f4e,i){
i+=_f4d;
var date=new Date(_f47);
var _f51,_f52="dijitCalendar",adj=0;
if(i<_f48){
_f51=_f4a-_f48+i+1;
adj=-1;
_f52+="Previous";
}else{
if(i>=(_f48+_f49)){
_f51=i-_f48-_f49+1;
adj=1;
_f52+="Next";
}else{
_f51=i-_f48+1;
_f52+="Current";
}
}
if(adj){
date=dojo.date.add(date,"month",adj);
}
date.setDate(_f51);
if(!dojo.date.compare(date,_f4b,"date")){
_f52="dijitCalendarCurrentDate "+_f52;
}
if(!dojo.date.compare(date,_f4c,"date")){
_f52="dijitCalendarSelectedDate "+_f52;
}
if(this.isDisabledDate(date,this.lang)){
_f52="dijitCalendarDisabledDate "+_f52;
}
var _f54=this.getClassForDate(date,this.lang);
if(_f54){
_f52=_f54+" "+_f52;
}
_f4e.className=_f52+"Month dijitCalendarDateTemplate";
_f4e.dijitDateValue=date.valueOf();
var _f55=dojo.query(".dijitCalendarDateLabel",_f4e)[0];
this._setText(_f55,date.getDate());
},this);
var _f56=dojo.date.locale.getNames("months","wide","standAlone",this.lang);
this._setText(this.monthLabelNode,_f56[_f47.getMonth()]);
var y=_f47.getFullYear()-1;
var d=new Date();
dojo.forEach(["previous","current","next"],function(name){
d.setFullYear(y++);
this._setText(this[name+"YearLabelNode"],dojo.date.locale.format(d,{selector:"year",locale:this.lang}));
},this);
var _f5a=this;
var _f5b=function(_f5c,_f5d,adj){
_f5a._connects.push(dijit.typematic.addMouseListener(_f5a[_f5c],_f5a,function(_f5f){
if(_f5f>=0){
_f5a._adjustDisplay(_f5d,adj);
}
},0.8,500));
};
_f5b("incrementMonth","month",1);
_f5b("decrementMonth","month",-1);
_f5b("nextYearLabelNode","year",1);
_f5b("previousYearLabelNode","year",-1);
},goToToday:function(){
this.attr("value",new Date());
},postCreate:function(){
this.inherited(arguments);
var _f60=dojo.hitch(this,function(_f61,n){
var _f63=dojo.query(_f61,this.domNode)[0];
for(var i=0;i<n;i++){
_f63.parentNode.appendChild(_f63.cloneNode(true));
}
});
_f60(".dijitCalendarDayLabelTemplate",6);
_f60(".dijitCalendarDateTemplate",6);
_f60(".dijitCalendarWeekTemplate",5);
var _f65=dojo.date.locale.getNames("days",this.dayWidth,"standAlone",this.lang);
var _f66=dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
dojo.query(".dijitCalendarDayLabel",this.domNode).forEach(function(_f67,i){
this._setText(_f67,_f65[(i+_f66)%7]);
},this);
var _f69=dojo.date.locale.getNames("months","wide","standAlone",this.lang);
dojo.forEach(_f69,function(name){
var _f6b=dojo.doc.createElement("div");
this._setText(_f6b,name);
this.monthLabelSpacer.appendChild(_f6b);
},this);
this.value=null;
this.attr("value",new Date());
},_adjustDisplay:function(part,_f6d){
this.displayMonth=dojo.date.add(this.displayMonth,part,_f6d);
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
},isDisabledDate:function(_f76,_f77){
},getClassForDate:function(_f78,_f79){
}});
}
if(!dojo._hasResource["dijit.form._DateTimeTextBox"]){
dojo._hasResource["dijit.form._DateTimeTextBox"]=true;
dojo.provide("dijit.form._DateTimeTextBox");
dojo.declare("dijit.form._DateTimeTextBox",dijit.form.RangeBoundTextBox,{regExpGen:dojo.date.locale.regexp,compare:dojo.date.compare,format:function(_f7a,_f7b){
if(!_f7a){
return "";
}
return dojo.date.locale.format(_f7a,_f7b);
},parse:function(_f7c,_f7d){
return dojo.date.locale.parse(_f7c,_f7d)||(this._isEmpty(_f7c)?null:undefined);
},serialize:dojo.date.stamp.toISOString,value:new Date(""),popupClass:"",_selector:"",postMixInProperties:function(){
this.inherited(arguments);
if(!this.value||this.value.toString()==dijit.form._DateTimeTextBox.prototype.value.toString()){
this.value=null;
}
var _f7e=this.constraints;
_f7e.selector=this._selector;
_f7e.fullYear=true;
var _f7f=dojo.date.stamp.fromISOString;
if(typeof _f7e.min=="string"){
_f7e.min=_f7f(_f7e.min);
}
if(typeof _f7e.max=="string"){
_f7e.max=_f7f(_f7e.max);
}
},_onFocus:function(evt){
this._open();
},_setValueAttr:function(_f81,_f82,_f83){
this.inherited(arguments);
if(this._picker){
if(!_f81){
_f81=new Date();
}
this._picker.attr("value",_f81);
}
},_open:function(){
if(this.disabled||this.readOnly||!this.popupClass){
return;
}
var _f84=this;
if(!this._picker){
var _f85=dojo.getObject(this.popupClass,false);
this._picker=new _f85({onValueSelected:function(_f86){
if(_f84._tabbingAway){
delete _f84._tabbingAway;
}else{
_f84.focus();
}
setTimeout(dojo.hitch(_f84,"_close"),1);
dijit.form._DateTimeTextBox.superclass._setValueAttr.call(_f84,_f86,true);
},lang:_f84.lang,constraints:_f84.constraints,isDisabledDate:function(date){
var _f88=dojo.date.compare;
var _f89=_f84.constraints;
return _f89&&(_f89.min&&(_f88(_f89.min,date,"date")>0)||(_f89.max&&_f88(_f89.max,date,"date")<0));
}});
this._picker.attr("value",this.attr("value")||new Date());
}
if(!this._opened){
dijit.popup.open({parent:this,popup:this._picker,around:this.domNode,onCancel:dojo.hitch(this,this._close),onClose:function(){
_f84._opened=false;
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
},_setDisplayedValueAttr:function(_f8a,_f8b){
this._setValueAttr(this.parse(_f8a,this.constraints),_f8b,_f8a);
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
dojo.declare("dijit._TimePicker",[dijit._Widget,dijit._Templated],{templateString:"<div id=\"widget_${id}\" class=\"dijitMenu ${baseClass}\"\r\n    ><div dojoAttachPoint=\"upArrow\" class=\"dijitButtonNode dijitUpArrowButton\" dojoAttachEvent=\"onmouseenter:_buttonMouse,onmouseleave:_buttonMouse\"\r\n\t\t><div class=\"dijitReset dijitInline dijitArrowButtonInner\" wairole=\"presentation\" role=\"presentation\">&nbsp;</div\r\n\t\t><div class=\"dijitArrowButtonChar\">&#9650;</div></div\r\n    ><div dojoAttachPoint=\"timeMenu,focusNode\" dojoAttachEvent=\"onclick:_onOptionSelected,onmouseover,onmouseout\"></div\r\n    ><div dojoAttachPoint=\"downArrow\" class=\"dijitButtonNode dijitDownArrowButton\" dojoAttachEvent=\"onmouseenter:_buttonMouse,onmouseleave:_buttonMouse\"\r\n\t\t><div class=\"dijitReset dijitInline dijitArrowButtonInner\" wairole=\"presentation\" role=\"presentation\">&nbsp;</div\r\n\t\t><div class=\"dijitArrowButtonChar\">&#9660;</div></div\r\n></div>\r\n",baseClass:"dijitTimePicker",clickableIncrement:"T00:15:00",visibleIncrement:"T01:00:00",visibleRange:"T05:00:00",value:new Date(),_visibleIncrement:2,_clickableIncrement:1,_totalIncrements:10,constraints:{},serialize:dojo.date.stamp.toISOString,_filterString:"",setValue:function(_f8f){
dojo.deprecated("dijit._TimePicker:setValue() is deprecated.  Use attr('value') instead.","","2.0");
this.attr("value",_f8f);
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
},isDisabledDate:function(_f94,_f95){
return false;
},_getFilteredNodes:function(_f96,_f97,_f98){
var _f99=[],n,i=_f96,max=this._maxIncrement+Math.abs(i),chk=_f98?-1:1,dec=_f98?1:0,inc=_f98?0:1;
do{
i=i-dec;
n=this._createOption(i);
if(n){
_f99.push(n);
}
i=i+inc;
}while(_f99.length<_f97&&(i*chk)<max);
if(_f98){
_f99.reverse();
}
return _f99;
},_showText:function(){
this.timeMenu.innerHTML="";
var _fa0=dojo.date.stamp.fromISOString;
this._clickableIncrementDate=_fa0(this.clickableIncrement);
this._visibleIncrementDate=_fa0(this.visibleIncrement);
this._visibleRangeDate=_fa0(this.visibleRange);
var _fa1=function(date){
return date.getHours()*60*60+date.getMinutes()*60+date.getSeconds();
};
var _fa3=_fa1(this._clickableIncrementDate);
var _fa4=_fa1(this._visibleIncrementDate);
var _fa5=_fa1(this._visibleRangeDate);
var time=this.value.getTime();
this._refDate=new Date(time-time%(_fa4*1000));
this._refDate.setFullYear(1970,0,1);
this._clickableIncrement=1;
this._totalIncrements=_fa5/_fa3;
this._visibleIncrement=_fa4/_fa3;
this._maxIncrement=(60*60*24)/_fa3;
var _fa7=this._getFilteredNodes(0,this._totalIncrements>>1,true);
var _fa8=this._getFilteredNodes(0,this._totalIncrements>>1,false);
if(_fa7.length<this._totalIncrements>>1){
_fa7=_fa7.slice(_fa7.length/2);
_fa8=_fa8.slice(0,_fa8.length/2);
}
dojo.forEach(_fa7.concat(_fa8),function(n){
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
var _faa=this;
var _fab=function(){
_faa._connects.push(dijit.typematic.addMouseListener.apply(null,arguments));
};
_fab(this.upArrow,this,this._onArrowUp,0.8,500);
_fab(this.downArrow,this,this._onArrowDown,0.8,500);
var _fac=function(cb){
return function(cnt){
if(cnt>0){
cb.call(this,arguments);
}
};
};
var _faf=function(node,cb){
return function(e){
dojo.stopEvent(e);
dijit.typematic.trigger(e,this,node,_fac(cb),node,0.85,250);
};
};
this.connect(this.upArrow,"onmouseover",_faf(this.upArrow,this._onArrowUp));
this.connect(this.downArrow,"onmouseover",_faf(this.downArrow,this._onArrowDown));
this.inherited(arguments);
},_buttonMouse:function(e){
dojo.toggleClass(e.currentTarget,"dijitButtonNodeHover",e.type=="mouseover");
},_createOption:function(_fb4){
var date=new Date(this._refDate);
var _fb6=this._clickableIncrementDate;
date.setHours(date.getHours()+_fb6.getHours()*_fb4,date.getMinutes()+_fb6.getMinutes()*_fb4,date.getSeconds()+_fb6.getSeconds()*_fb4);
var _fb7=dojo.date.locale.format(date,this.constraints);
if(this._filterString&&_fb7.toLowerCase().indexOf(this._filterString)!==0){
return null;
}
var div=dojo.doc.createElement("div");
div.date=date;
div.index=_fb4;
var _fb9=dojo.doc.createElement("div");
dojo.addClass(div,this.baseClass+"Item");
dojo.addClass(_fb9,this.baseClass+"ItemInner");
_fb9.innerHTML=_fb7;
div.appendChild(_fb9);
if(_fb4%this._visibleIncrement<1&&_fb4%this._visibleIncrement>-1){
dojo.addClass(div,this.baseClass+"Marker");
}else{
if(!(_fb4%this._clickableIncrement)){
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
var _fbb=tgt.target.date||tgt.target.parentNode.date;
if(!_fbb||this.isDisabledDate(_fbb)){
return;
}
this._highlighted_option=null;
this.attr("value",_fbb);
this.onValueSelected(_fbb);
},onValueSelected:function(_fbc){
},_highlightOption:function(node,_fbe){
if(!node){
return;
}
if(_fbe){
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
dojo.toggleClass(node,this.baseClass+"ItemHover",_fbe);
if(dojo.hasClass(node,this.baseClass+"Marker")){
dojo.toggleClass(node,this.baseClass+"MarkerHover",_fbe);
}else{
dojo.toggleClass(node,this.baseClass+"TickHover",_fbe);
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
var _fc4=(dojo.isIE?e.wheelDelta:-e.detail);
this[(_fc4>0?"_onArrowUp":"_onArrowDown")]();
},_onArrowUp:function(){
var _fc5=this.timeMenu.childNodes[0].index;
var divs=this._getFilteredNodes(_fc5,1,true);
if(divs.length){
this.timeMenu.removeChild(this.timeMenu.childNodes[this.timeMenu.childNodes.length-1]);
this.timeMenu.insertBefore(divs[0],this.timeMenu.childNodes[0]);
}
},_onArrowDown:function(){
var _fc7=this.timeMenu.childNodes[this.timeMenu.childNodes.length-1].index+1;
var divs=this._getFilteredNodes(_fc7,1,false);
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
var _fcb=this.timeMenu,tgt=this._highlighted_option||dojo.query("."+this.baseClass+"ItemSelected",_fcb)[0];
if(!tgt){
tgt=_fcb.childNodes[0];
}else{
if(_fcb.childNodes.length){
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
dojo.declare("dijit.form._Spinner",dijit.form.RangeBoundTextBox,{defaultTimeout:500,timeoutChangeRate:0.9,smallDelta:1,largeDelta:10,templateString:"<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\r\n\tid=\"widget_${id}\"\r\n\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\" waiRole=\"presentation\"\r\n\t><div class=\"dijitInputLayoutContainer\"\r\n\t\t><div class=\"dijitReset dijitSpinnerButtonContainer\"\r\n\t\t\t>&nbsp;<div class=\"dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitUpArrowButton\"\r\n\t\t\t\tdojoAttachPoint=\"upArrowNode\"\r\n\t\t\t\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse\"\r\n\t\t\t\tstateModifier=\"UpArrow\"\r\n\t\t\t\t><div class=\"dijitArrowButtonInner\">&thinsp;</div\r\n\t\t\t\t><div class=\"dijitArrowButtonChar\">&#9650;</div\r\n\t\t\t></div\r\n\t\t\t><div class=\"dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitDownArrowButton\"\r\n\t\t\t\tdojoAttachPoint=\"downArrowNode\"\r\n\t\t\t\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse\"\r\n\t\t\t\tstateModifier=\"DownArrow\"\r\n\t\t\t\t><div class=\"dijitArrowButtonInner\">&thinsp;</div\r\n\t\t\t\t><div class=\"dijitArrowButtonChar\">&#9660;</div\r\n\t\t\t></div\r\n\t\t></div\r\n\t\t><div class=\"dijitReset dijitValidationIcon\"><br></div\r\n\t\t><div class=\"dijitReset dijitValidationIconText\">&Chi;</div\r\n\t\t><div class=\"dijitReset dijitInputField\"\r\n\t\t\t><input class='dijitReset' dojoAttachPoint=\"textbox,focusNode\" type=\"${type}\" dojoAttachEvent=\"onfocus:_update,onkeyup:_update,onkeypress:_onKeyPress\"\r\n\t\t\t\twaiRole=\"spinbutton\" autocomplete=\"off\" name=\"${name}\"\r\n\t\t/></div\r\n\t></div\r\n></div>\r\n",baseClass:"dijitSpinner",adjust:function(val,_fce){
return val;
},_arrowState:function(node,_fd0){
this._active=_fd0;
this.stateModifier=node.getAttribute("stateModifier")||"";
this._setStateClass();
},_arrowPressed:function(_fd1,_fd2,_fd3){
if(this.disabled||this.readOnly){
return;
}
this._arrowState(_fd1,true);
this._setValueAttr(this.adjust(this.attr("value"),_fd2*_fd3),false);
dijit.selectInputText(this.textbox,this.textbox.value.length);
},_arrowReleased:function(node){
this._wheelTimer=null;
if(this.disabled||this.readOnly){
return;
}
this._arrowState(node,false);
},_typematicCallback:function(_fd5,node,evt){
var inc=this.smallDelta;
if(node==this.textbox){
k=dojo.keys;
var key=evt.charOrCode;
inc=(key==k.PAGE_UP||key==k.PAGE_DOWN)?this.largeDelta:this.smallDelta;
node=(key==k.UP_ARROW||key==k.PAGE_UP)?this.upArrowNode:this.downArrowNode;
}
if(_fd5==-1){
this._arrowReleased(node);
}else{
this._arrowPressed(node,(node==this.upArrowNode)?1:-1,inc);
}
},_wheelTimer:null,_mouseWheeled:function(evt){
dojo.stopEvent(evt);
var _fdb=evt.detail?(evt.detail*-1):(evt.wheelDelta/120);
if(_fdb!==0){
var node=this[(_fdb>0?"upArrowNode":"downArrowNode")];
this._arrowPressed(node,_fdb,this.smallDelta);
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
var _fdd=this;
this.connect(this.domNode,"onresize",function(){
setTimeout(dojo.hitch(_fdd,function(){
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
dojo.number.format=function(_fdf,_fe0){
_fe0=dojo.mixin({},_fe0||{});
var _fe1=dojo.i18n.normalizeLocale(_fe0.locale);
var _fe2=dojo.i18n.getLocalization("dojo.cldr","number",_fe1);
_fe0.customs=_fe2;
var _fe3=_fe0.pattern||_fe2[(_fe0.type||"decimal")+"Format"];
if(isNaN(_fdf)){
return null;
}
return dojo.number._applyPattern(_fdf,_fe3,_fe0);
};
dojo.number._numberPatternRE=/[#0,]*[#0](?:\.0*#*)?/;
dojo.number._applyPattern=function(_fe4,_fe5,_fe6){
_fe6=_fe6||{};
var _fe7=_fe6.customs.group;
var _fe8=_fe6.customs.decimal;
var _fe9=_fe5.split(";");
var _fea=_fe9[0];
_fe5=_fe9[(_fe4<0)?1:0]||("-"+_fea);
if(_fe5.indexOf("%")!=-1){
_fe4*=100;
}else{
if(_fe5.indexOf("‰")!=-1){
_fe4*=1000;
}else{
if(_fe5.indexOf("¤")!=-1){
_fe7=_fe6.customs.currencyGroup||_fe7;
_fe8=_fe6.customs.currencyDecimal||_fe8;
_fe5=_fe5.replace(/\u00a4{1,3}/,function(_feb){
var prop=["symbol","currency","displayName"][_feb.length-1];
return _fe6[prop]||_fe6.currency||"";
});
}else{
if(_fe5.indexOf("E")!=-1){
throw new Error("exponential notation not supported");
}
}
}
}
var _fed=dojo.number._numberPatternRE;
var _fee=_fea.match(_fed);
if(!_fee){
throw new Error("unable to find a number expression in pattern: "+_fe5);
}
if(_fe6.fractional===false){
_fe6.places=0;
}
return _fe5.replace(_fed,dojo.number._formatAbsolute(_fe4,_fee[0],{decimal:_fe8,group:_fe7,places:_fe6.places,round:_fe6.round}));
};
dojo.number.round=function(_fef,_ff0,_ff1){
var _ff2=String(_fef).split(".");
var _ff3=(_ff2[1]&&_ff2[1].length)||0;
if(_ff3>_ff0){
var _ff4=Math.pow(10,_ff0);
if(_ff1>0){
_ff4*=10/_ff1;
_ff0++;
}
_fef=Math.round(_fef*_ff4)/_ff4;
_ff2=String(_fef).split(".");
_ff3=(_ff2[1]&&_ff2[1].length)||0;
if(_ff3>_ff0){
_ff2[1]=_ff2[1].substr(0,_ff0);
_fef=Number(_ff2.join("."));
}
}
return _fef;
};
dojo.number._formatAbsolute=function(_ff5,_ff6,_ff7){
_ff7=_ff7||{};
if(_ff7.places===true){
_ff7.places=0;
}
if(_ff7.places===Infinity){
_ff7.places=6;
}
var _ff8=_ff6.split(".");
var _ff9=(_ff7.places>=0)?_ff7.places:(_ff8[1]&&_ff8[1].length)||0;
if(!(_ff7.round<0)){
_ff5=dojo.number.round(_ff5,_ff9,_ff7.round);
}
var _ffa=String(Math.abs(_ff5)).split(".");
var _ffb=_ffa[1]||"";
if(_ff7.places){
var _ffc=dojo.isString(_ff7.places)&&_ff7.places.indexOf(",");
if(_ffc){
_ff7.places=_ff7.places.substring(_ffc+1);
}
_ffa[1]=dojo.string.pad(_ffb.substr(0,_ff7.places),_ff7.places,"0",true);
}else{
if(_ff8[1]&&_ff7.places!==0){
var pad=_ff8[1].lastIndexOf("0")+1;
if(pad>_ffb.length){
_ffa[1]=dojo.string.pad(_ffb,pad,"0",true);
}
var _ffe=_ff8[1].length;
if(_ffe<_ffb.length){
_ffa[1]=_ffb.substr(0,_ffe);
}
}else{
if(_ffa[1]){
_ffa.pop();
}
}
}
var _fff=_ff8[0].replace(",","");
pad=_fff.indexOf("0");
if(pad!=-1){
pad=_fff.length-pad;
if(pad>_ffa[0].length){
_ffa[0]=dojo.string.pad(_ffa[0],pad);
}
if(_fff.indexOf("#")==-1){
_ffa[0]=_ffa[0].substr(_ffa[0].length-pad);
}
}
var index=_ff8[0].lastIndexOf(",");
var _1001,_1002;
if(index!=-1){
_1001=_ff8[0].length-index-1;
var _1003=_ff8[0].substr(0,index);
index=_1003.lastIndexOf(",");
if(index!=-1){
_1002=_1003.length-index-1;
}
}
var _1004=[];
for(var whole=_ffa[0];whole;){
var off=whole.length-_1001;
_1004.push((off>0)?whole.substr(off):whole);
whole=(off>0)?whole.slice(0,off):"";
if(_1002){
_1001=_1002;
delete _1002;
}
}
_ffa[0]=_1004.reverse().join(_ff7.group||",");
return _ffa.join(_ff7.decimal||".");
};
dojo.number.regexp=function(_1007){
return dojo.number._parseInfo(_1007).regexp;
};
dojo.number._parseInfo=function(_1008){
_1008=_1008||{};
var _1009=dojo.i18n.normalizeLocale(_1008.locale);
var _100a=dojo.i18n.getLocalization("dojo.cldr","number",_1009);
var _100b=_1008.pattern||_100a[(_1008.type||"decimal")+"Format"];
var group=_100a.group;
var _100d=_100a.decimal;
var _100e=1;
if(_100b.indexOf("%")!=-1){
_100e/=100;
}else{
if(_100b.indexOf("‰")!=-1){
_100e/=1000;
}else{
var _100f=_100b.indexOf("¤")!=-1;
if(_100f){
group=_100a.currencyGroup||group;
_100d=_100a.currencyDecimal||_100d;
}
}
}
var _1010=_100b.split(";");
if(_1010.length==1){
_1010.push("-"+_1010[0]);
}
var re=dojo.regexp.buildGroupRE(_1010,function(_1012){
_1012="(?:"+dojo.regexp.escapeString(_1012,".")+")";
return _1012.replace(dojo.number._numberPatternRE,function(_1013){
var flags={signed:false,separator:_1008.strict?group:[group,""],fractional:_1008.fractional,decimal:_100d,exponent:false};
var parts=_1013.split(".");
var _1016=_1008.places;
if(parts.length==1||_1016===0){
flags.fractional=false;
}else{
if(_1016===undefined){
_1016=_1008.pattern?parts[1].lastIndexOf("0")+1:Infinity;
}
if(_1016&&_1008.fractional==undefined){
flags.fractional=true;
}
if(!_1008.places&&(_1016<parts[1].length)){
_1016+=","+parts[1].length;
}
flags.places=_1016;
}
var _1017=parts[0].split(",");
if(_1017.length>1){
flags.groupSize=_1017.pop().length;
if(_1017.length>1){
flags.groupSize2=_1017.pop().length;
}
}
return "("+dojo.number._realNumberRegexp(flags)+")";
});
},true);
if(_100f){
re=re.replace(/(\s*)(\u00a4{1,3})(\s*)/g,function(match,_1019,_101a,after){
var prop=["symbol","currency","displayName"][_101a.length-1];
var _101d=dojo.regexp.escapeString(_1008[prop]||_1008.currency||"");
_1019=_1019?"\\s":"";
after=after?"\\s":"";
if(!_1008.strict){
if(_1019){
_1019+="*";
}
if(after){
after+="*";
}
return "(?:"+_1019+_101d+after+")?";
}
return _1019+_101d+after;
});
}
return {regexp:re.replace(/[\xa0 ]/g,"[\\s\\xa0]"),group:group,decimal:_100d,factor:_100e};
};
dojo.number.parse=function(_101e,_101f){
var info=dojo.number._parseInfo(_101f);
var _1021=(new RegExp("^"+info.regexp+"$")).exec(_101e);
if(!_1021){
return NaN;
}
var _1022=_1021[1];
if(!_1021[1]){
if(!_1021[2]){
return NaN;
}
_1022=_1021[2];
info.factor*=-1;
}
_1022=_1022.replace(new RegExp("["+info.group+"\\s\\xa0"+"]","g"),"").replace(info.decimal,".");
return Number(_1022)*info.factor;
};
dojo.number._realNumberRegexp=function(flags){
flags=flags||{};
if(!("places" in flags)){
flags.places=Infinity;
}
if(typeof flags.decimal!="string"){
flags.decimal=".";
}
if(!("fractional" in flags)||/^0/.test(flags.places)){
flags.fractional=[true,false];
}
if(!("exponent" in flags)){
flags.exponent=[true,false];
}
if(!("eSigned" in flags)){
flags.eSigned=[true,false];
}
var _1024=dojo.number._integerRegexp(flags);
var _1025=dojo.regexp.buildGroupRE(flags.fractional,function(q){
var re="";
if(q&&(flags.places!==0)){
re="\\"+flags.decimal;
if(flags.places==Infinity){
re="(?:"+re+"\\d+)?";
}else{
re+="\\d{"+flags.places+"}";
}
}
return re;
},true);
var _1028=dojo.regexp.buildGroupRE(flags.exponent,function(q){
if(q){
return "([eE]"+dojo.number._integerRegexp({signed:flags.eSigned})+")";
}
return "";
});
var _102a=_1024+_1025;
if(_1025){
_102a="(?:(?:"+_102a+")|(?:"+_1025+"))";
}
return _102a+_1028;
};
dojo.number._integerRegexp=function(flags){
flags=flags||{};
if(!("signed" in flags)){
flags.signed=[true,false];
}
if(!("separator" in flags)){
flags.separator="";
}else{
if(!("groupSize" in flags)){
flags.groupSize=3;
}
}
var _102c=dojo.regexp.buildGroupRE(flags.signed,function(q){
return q?"[-+]":"";
},true);
var _102e=dojo.regexp.buildGroupRE(flags.separator,function(sep){
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
var grp=flags.groupSize,grp2=flags.groupSize2;
if(grp2){
var _1032="(?:0|[1-9]\\d{0,"+(grp2-1)+"}(?:["+sep+"]\\d{"+grp2+"})*["+sep+"]\\d{"+grp+"})";
return ((grp-grp2)>0)?"(?:"+_1032+"|(?:0|[1-9]\\d{0,"+(grp-1)+"}))":_1032;
}
return "(?:0|[1-9]\\d{0,"+(grp-1)+"}(?:["+sep+"]\\d{"+grp+"})*)";
},true);
return _102c+_102e;
};
}
if(!dojo._hasResource["dijit.form.NumberTextBox"]){
dojo._hasResource["dijit.form.NumberTextBox"]=true;
dojo.provide("dijit.form.NumberTextBox");
dojo.declare("dijit.form.NumberTextBoxMixin",null,{regExpGen:dojo.number.regexp,editOptions:{pattern:"#.######"},_onFocus:function(){
this._setValueAttr(this.attr("value"),false);
this.inherited(arguments);
},_formatter:dojo.number.format,format:function(value,_1034){
if(typeof value=="string"){
return value;
}
if(isNaN(value)){
return "";
}
if(this.editOptions&&this._focused){
_1034=dojo.mixin(dojo.mixin({},this.editOptions),this.constraints);
}
return this._formatter(value,_1034);
},parse:dojo.number.parse,filter:function(value){
return (value===null||value===""||value===undefined)?NaN:this.inherited(arguments);
},serialize:function(value,_1037){
return (typeof value!="number"||isNaN(value))?"":this.inherited(arguments);
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
dojo.declare("dijit.form.NumberSpinner",[dijit.form._Spinner,dijit.form.NumberTextBoxMixin],{required:true,adjust:function(val,delta){
if(isNaN(val)&&delta!=0){
var _103b=(delta>0),_103c=(typeof this.constraints.max=="number"),_103d=(typeof this.constraints.min=="number");
val=_103b?(_103d?this.constraints.min:(_103c?this.constraints.max:0)):(_103c?this.constraints.max:(_103d?this.constraints.min:0));
}
var _103e=val+delta;
if(isNaN(val)||isNaN(_103e)){
return val;
}
if((typeof this.constraints.max=="number")&&(_103e>this.constraints.max)){
_103e=this.constraints.max;
}
if((typeof this.constraints.min=="number")&&(_103e<this.constraints.min)){
_103e=this.constraints.min;
}
return _103e;
},_onKeyPress:function(e){
if((e.charOrCode==dojo.keys.HOME||e.charOrCode==dojo.keys.END)&&!e.ctrlKey&&!e.altKey){
var value=e.charOrCode==dojo.keys.HOME?this.constraints["min"]:this.constraints["max"];
if(value){
this._setValueAttr(value,true);
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
var _1042={ADP:0,BHD:3,BIF:0,BYR:0,CLF:0,CLP:0,DJF:0,ESP:0,GNF:0,IQD:3,ITL:0,JOD:3,JPY:0,KMF:0,KRW:0,KWD:3,LUF:0,LYD:3,MGA:0,MGF:0,OMR:3,PYG:0,RWF:0,TND:3,TRL:0,VUV:0,XAF:0,XOF:0,XPF:0};
var _1043={CHF:5};
var _1044=_1042[code],round=_1043[code];
if(typeof _1044=="undefined"){
_1044=2;
}
if(typeof round=="undefined"){
round=0;
}
return {places:_1044,round:round};
};
}
if(!dojo._hasResource["dojo.currency"]){
dojo._hasResource["dojo.currency"]=true;
dojo.provide("dojo.currency");
dojo.currency._mixInDefaults=function(_1046){
_1046=_1046||{};
_1046.type="currency";
var _1047=dojo.i18n.getLocalization("dojo.cldr","currency",_1046.locale)||{};
var iso=_1046.currency;
var data=dojo.cldr.monetary.getData(iso);
dojo.forEach(["displayName","symbol","group","decimal"],function(prop){
data[prop]=_1047[iso+"_"+prop];
});
data.fractional=[true,false];
return dojo.mixin(data,_1046);
};
dojo.currency.format=function(value,_104c){
return dojo.number.format(value,dojo.currency._mixInDefaults(_104c));
};
dojo.currency.regexp=function(_104d){
return dojo.number.regexp(dojo.currency._mixInDefaults(_104d));
};
dojo.currency.parse=function(_104e,_104f){
return dojo.number.parse(_104e,dojo.currency._mixInDefaults(_104f));
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
var _1053=dojo.coords(this.sliderBarContainer,true);
var _1054=e[this._mousePixelCoord]-_1053[this._startingPixelCoord];
this._setPixelValue(this._isReversed()?(_1053[this._pixelCount]-_1054):_1054,_1053[this._pixelCount],true);
},_setPixelValue:function(_1055,_1056,_1057){
if(this.disabled||this.readOnly){
return;
}
_1055=_1055<0?0:_1056<_1055?_1056:_1055;
var count=this.discreteValues;
if(count<=1||count==Infinity){
count=_1056;
}
count--;
var _1059=_1056/count;
var _105a=Math.round(_1055/_1059);
this._setValueAttr((this.maximum-this.minimum)*_105a/count+this.minimum,_1057);
},_setValueAttr:function(value,_105c){
this.valueNode.value=this.value=value;
dijit.setWaiState(this.focusNode,"valuenow",value);
this.inherited(arguments);
var _105d=(value-this.minimum)/(this.maximum-this.minimum);
var _105e=(this._descending===false)?this.remainingBar:this.progressBar;
var _105f=(this._descending===false)?this.progressBar:this.remainingBar;
if(this._inProgressAnim&&this._inProgressAnim.status!="stopped"){
this._inProgressAnim.stop(true);
}
if(_105c&&this.slideDuration>0&&_105e.style[this._progressPixelSize]){
var _this=this;
var props={};
var start=parseFloat(_105e.style[this._progressPixelSize]);
var _1063=this.slideDuration*(_105d-start/100);
if(_1063==0){
return;
}
if(_1063<0){
_1063=0-_1063;
}
props[this._progressPixelSize]={start:start,end:_105d*100,units:"%"};
this._inProgressAnim=dojo.animateProperty({node:_105e,duration:_1063,onAnimate:function(v){
_105f.style[_this._progressPixelSize]=(100-parseFloat(v[_this._progressPixelSize]))+"%";
},onEnd:function(){
delete _this._inProgressAnim;
},properties:props});
this._inProgressAnim.play();
}else{
_105e.style[this._progressPixelSize]=(_105d*100)+"%";
_105f.style[this._progressPixelSize]=((1-_105d)*100)+"%";
}
},_bumpValue:function(_1065){
if(this.disabled||this.readOnly){
return;
}
var s=dojo.getComputedStyle(this.sliderBarContainer);
var c=dojo._getContentBox(this.sliderBarContainer,s);
var count=this.discreteValues;
if(count<=1||count==Infinity){
count=c[this._pixelCount];
}
count--;
var value=(this.value-this.minimum)*count/(this.maximum-this.minimum)+_1065;
if(value<0){
value=0;
}
if(value>count){
value=count;
}
value=value*(this.maximum-this.minimum)/count+this.minimum;
this._setValueAttr(value,true);
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
var janky=!dojo.isMozilla;
var _106e=evt[(janky?"wheelDelta":"detail")]*(janky?1:-1);
this[(_106e<0?"decrement":"increment")](evt);
},startup:function(){
dojo.forEach(this.getChildren(),function(child){
if(this[child.container]!=this.containerNode){
this[child.container].appendChild(child.domNode);
}
},this);
},_typematicCallback:function(count,_1071,e){
if(count==-1){
return;
}
this[(_1071==(this._descending?this.incrementButton:this.decrementButton))?"decrement":"increment"](e);
},postCreate:function(){
if(this.showButtons){
this.incrementButton.style.display="";
this.decrementButton.style.display="";
this._connects.push(dijit.typematic.addMouseListener(this.decrementButton,this,"_typematicCallback",25,500));
this._connects.push(dijit.typematic.addMouseListener(this.incrementButton,this,"_typematicCallback",25,500));
}
this.connect(this.domNode,!dojo.isMozilla?"onmousewheel":"DOMMouseScroll","_mouseWheeled");
var _self=this;
var mover=function(){
dijit.form._SliderMover.apply(this,arguments);
this.widget=_self;
};
dojo.extend(mover,dijit.form._SliderMover.prototype);
this._movable=new dojo.dnd.Moveable(this.sliderHandle,{mover:mover});
var label=dojo.query("label[for=\""+this.id+"\"]");
if(label.length){
label[0].id=(this.id+"_label");
dijit.setWaiState(this.focusNode,"labelledby",label[0].id);
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
},_rtlRectify:function(_1076){
var _1077=[];
while(_1076.firstChild){
_1077.push(_1076.firstChild);
_1076.removeChild(_1076.firstChild);
}
for(var i=_1077.length-1;i>=0;i--){
if(_1077[i]){
_1076.appendChild(_1077[i]);
}
}
}});
dojo.declare("dijit.form._SliderMover",dojo.dnd.Mover,{onMouseMove:function(e){
var _107a=this.widget;
var _107b=_107a._abspos;
if(!_107b){
_107b=_107a._abspos=dojo.coords(_107a.sliderBarContainer,true);
_107a._setPixelValue_=dojo.hitch(_107a,"_setPixelValue");
_107a._isReversed_=_107a._isReversed();
}
var _107c=e[_107a._mousePixelCoord]-_107b[_107a._startingPixelCoord];
_107a._setPixelValue_(_107a._isReversed_?(_107b[_107a._pixelCount]-_107c):_107c,_107b[_107a._pixelCount],false);
},destroy:function(e){
dojo.dnd.Mover.prototype.destroy.apply(this,arguments);
var _107e=this.widget;
_107e._abspos=null;
_107e._setValueAttr(_107e.value,true);
}});
dojo.declare("dijit.form.HorizontalRule",[dijit._Widget,dijit._Templated],{templateString:"<div class=\"dijitRuleContainer dijitRuleContainerH\"></div>",count:3,container:"containerNode",ruleStyle:"",_positionPrefix:"<div class=\"dijitRuleMark dijitRuleMarkH\" style=\"left:",_positionSuffix:"%;",_suffix:"\"></div>",_genHTML:function(pos,ndx){
return this._positionPrefix+pos+this._positionSuffix+this.ruleStyle+this._suffix;
},_isHorizontal:true,postCreate:function(){
var _1081;
if(this.count==1){
_1081=this._genHTML(50,0);
}else{
var i;
var _1083=100/(this.count-1);
if(!this._isHorizontal||this.isLeftToRight()){
_1081=this._genHTML(0,0);
for(i=1;i<this.count-1;i++){
_1081+=this._genHTML(_1083*i,i);
}
_1081+=this._genHTML(100,this.count-1);
}else{
_1081=this._genHTML(100,0);
for(i=1;i<this.count-1;i++){
_1081+=this._genHTML(100-_1083*i,i);
}
_1081+=this._genHTML(0,this.count-1);
}
}
this.domNode.innerHTML=_1081;
}});
dojo.declare("dijit.form.VerticalRule",dijit.form.HorizontalRule,{templateString:"<div class=\"dijitRuleContainer dijitRuleContainerV\"></div>",_positionPrefix:"<div class=\"dijitRuleMark dijitRuleMarkV\" style=\"top:",_isHorizontal:false});
dojo.declare("dijit.form.HorizontalRuleLabels",dijit.form.HorizontalRule,{templateString:"<div class=\"dijitRuleContainer dijitRuleContainerH dijitRuleLabelsContainer dijitRuleLabelsContainerH\"></div>",labelStyle:"",labels:[],numericMargin:0,minimum:0,maximum:1,constraints:{pattern:"#%"},_positionPrefix:"<div class=\"dijitRuleLabelContainer dijitRuleLabelContainerH\" style=\"left:",_labelPrefix:"\"><span class=\"dijitRuleLabel dijitRuleLabelH\">",_suffix:"</span></div>",_calcPosition:function(pos){
return pos;
},_genHTML:function(pos,ndx){
return this._positionPrefix+this._calcPosition(pos)+this._positionSuffix+this.labelStyle+this._labelPrefix+this.labels[ndx]+this._suffix;
},getLabels:function(){
var _1087=this.labels;
if(!_1087.length){
_1087=dojo.query("> li",this.srcNodeRef).map(function(node){
return String(node.innerHTML);
});
}
this.srcNodeRef.innerHTML="";
if(!_1087.length&&this.count>1){
var start=this.minimum;
var inc=(this.maximum-start)/(this.count-1);
for(var i=0;i<this.count;i++){
_1087.push((i<this.numericMargin||i>=(this.count-this.numericMargin))?"":dojo.number.format(start,this.constraints));
start+=inc;
}
}
return _1087;
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
var _108f=oSel.getRangeAt(0);
if((_108f.startContainer==_108f.endContainer)&&((_108f.endOffset-_108f.startOffset)==1)&&(_108f.startContainer.nodeType!=3)){
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
var _1090=dojo.global.getSelection();
if(_1090){
return _1090.toString();
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
var _1091=dojo.global.getSelection();
if(_1091&&_1091.rangeCount){
var frag=_1091.getRangeAt(0).cloneContents();
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
var _1095=dojo.global.getSelection();
return _1095.anchorNode.childNodes[_1095.anchorOffset];
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
var _1098=dojo.global.getSelection();
if(_1098){
var node=_1098.anchorNode;
while(node&&(node.nodeType!=1)){
node=node.parentNode;
}
return node;
}
}
}
return null;
},hasAncestorElement:function(_109a){
return this.getAncestorElement.apply(this,arguments)!=null;
},getAncestorElement:function(_109b){
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
},collapse:function(_10a4){
if(window["getSelection"]){
var _10a5=dojo.global.getSelection();
if(_10a5.removeAllRanges){
if(_10a4){
_10a5.collapseToStart();
}else{
_10a5.collapseToEnd();
}
}else{
_10a5.collapse(_10a4);
}
}else{
if(dojo.doc.selection){
var range=dojo.doc.selection.createRange();
range.collapse(_10a4);
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
},selectElementChildren:function(_10a8,_10a9){
var _10aa=dojo.global;
var _10ab=dojo.doc;
_10a8=dojo.byId(_10a8);
if(_10ab.selection&&dojo.body().createTextRange){
var range=_10a8.ownerDocument.body.createTextRange();
range.moveToElementText(_10a8);
if(!_10a9){
try{
range.select();
}
catch(e){
}
}
}else{
if(_10aa.getSelection){
var _10ad=_10aa.getSelection();
if(_10ad.setBaseAndExtent){
_10ad.setBaseAndExtent(_10a8,0,_10a8,_10a8.innerText.length-1);
}else{
if(_10ad.selectAllChildren){
_10ad.selectAllChildren(_10a8);
}
}
}
}
},selectElement:function(_10ae,_10af){
var range,_10b1=dojo.doc;
_10ae=dojo.byId(_10ae);
if(_10b1.selection&&dojo.body().createTextRange){
try{
range=dojo.body().createControlRange();
range.addElement(_10ae);
if(!_10af){
range.select();
}
}
catch(e){
this.selectElementChildren(_10ae,_10af);
}
}else{
if(dojo.global.getSelection){
var _10b2=dojo.global.getSelection();
if(_10b2.removeAllRanges){
range=_10b1.createRange();
range.selectNode(_10ae);
_10b2.removeAllRanges();
_10b2.addRange(range);
}
}
}
}});
}
if(!dojo._hasResource["dijit._editor.range"]){
dojo._hasResource["dijit._editor.range"]=true;
dojo.provide("dijit._editor.range");
dijit.range={};
dijit.range.getIndex=function(node,_10b4){
var ret=[],retR=[];
var stop=_10b4;
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
dijit.range.getNode=function(index,_10bd){
if(!dojo.isArray(index)||index.length==0){
return _10bd;
}
var node=_10bd;
dojo.every(index,function(i){
if(i>=0&&i<node.childNodes.length){
node=node.childNodes[i];
}else{
node=null;
console.debug("Error: can not find node with index",index,"under parent node",_10bd);
return false;
}
return true;
});
return node;
};
dijit.range.getCommonAncestor=function(n1,n2){
var _10c2=function(n){
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
var n1as=_10c2(n1);
var n2as=_10c2(n2);
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
var block=null,_10d2;
while(node&&node!==root){
var name=node.nodeName.toUpperCase();
if(!block&&regex.test(name)){
block=node;
}
if(!_10d2&&(/^(?:BODY|TD|TH|CAPTION)$/).test(name)){
_10d2=node;
}
node=node.parentNode;
}
return {blockNode:block,blockContainer:_10d2||node.ownerDocument.body};
};
dijit.range.atBeginningOfContainer=function(_10d4,node,_10d6){
var _10d7=false;
var _10d8=(_10d6==0);
if(!_10d8&&node.nodeType==3){
if(dojo.trim(node.nodeValue.substr(0,_10d6))==0){
_10d8=true;
}
}
if(_10d8){
var cnode=node;
_10d7=true;
while(cnode&&cnode!==_10d4){
if(cnode.previousSibling){
_10d7=false;
break;
}
cnode=cnode.parentNode;
}
}
return _10d7;
};
dijit.range.atEndOfContainer=function(_10da,node,_10dc){
var atEnd=false;
var _10de=(_10dc==(node.length||node.childNodes.length));
if(!_10de&&node.nodeType==3){
if(dojo.trim(node.nodeValue.substr(_10dc))==0){
_10de=true;
}
}
if(_10de){
var cnode=node;
atEnd=true;
while(cnode&&cnode!==_10da){
if(cnode.nextSibling){
atEnd=false;
break;
}
cnode=cnode.parentNode;
}
}
return atEnd;
};
dijit.range.adjacentNoneTextNode=function(_10e0,next){
var node=_10e0;
var len=(0-_10e0.length)||0;
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
dijit.range.getSelection=function(win,_10e6){
if(dijit.range._w3c){
return win.getSelection();
}else{
var s=new dijit.range.ie.selection(win);
if(!_10e6){
s._getCurrentSelection();
}
return s;
}
};
if(!dijit.range._w3c){
dijit.range.ie={cachedSelection:{},selection:function(win){
this._ranges=[];
this.addRange=function(r,_10ea){
this._ranges.push(r);
if(!_10ea){
r._select();
}
this.rangeCount=this._ranges.length;
};
this.removeAllRanges=function(){
this._ranges=[];
this.rangeCount=0;
};
var _10eb=function(){
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
var r=_10eb();
if(r){
this.addRange(r,true);
}
};
},decomposeControlRange:function(range){
var _10f1=range.item(0),_10f2=range.item(range.length-1);
var _10f3=_10f1.parentNode,_10f4=_10f2.parentNode;
var _10f5=dijit.range.getIndex(_10f1,_10f3).o;
var _10f6=dijit.range.getIndex(_10f2,_10f4).o+1;
return [[_10f3,_10f5],[_10f4,_10f6]];
},getEndPoint:function(range,end){
var _10f9=range.duplicate();
_10f9.collapse(!end);
var _10fa="EndTo"+(end?"End":"Start");
var _10fb=_10f9.parentElement();
var _10fc,_10fd,_10fe;
if(_10fb.childNodes.length>0){
dojo.every(_10fb.childNodes,function(node,i){
var _1101;
if(node.nodeType!=3){
_10f9.moveToElementText(node);
if(_10f9.compareEndPoints(_10fa,range)>0){
_10fc=node.previousSibling;
if(_10fe&&_10fe.nodeType==3){
_10fc=_10fe;
_1101=true;
}else{
_10fc=_10fb;
_10fd=i;
return false;
}
}else{
if(i==_10fb.childNodes.length-1){
_10fc=_10fb;
_10fd=_10fb.childNodes.length;
return false;
}
}
}else{
if(i==_10fb.childNodes.length-1){
_10fc=node;
_1101=true;
}
}
if(_1101&&_10fc){
var _1102=dijit.range.adjacentNoneTextNode(_10fc)[0];
if(_1102){
_10fc=_1102.nextSibling;
}else{
_10fc=_10fb.firstChild;
}
var _1103=dijit.range.adjacentNoneTextNode(_10fc);
_1102=_1103[0];
var _1104=_1103[1];
if(_1102){
_10f9.moveToElementText(_1102);
_10f9.collapse(false);
}else{
_10f9.moveToElementText(_10fb);
}
_10f9.setEndPoint(_10fa,range);
_10fd=_10f9.text.length-_1104;
return false;
}
_10fe=node;
return true;
});
}else{
_10fc=_10fb;
_10fd=0;
}
if(!end&&_10fc.nodeType!=3&&_10fd==_10fc.childNodes.length){
if(_10fc.nextSibling&&_10fc.nextSibling.nodeType==3){
_10fc=_10fc.nextSibling;
_10fd=0;
}
}
return [_10fc,_10fd];
},setEndPoint:function(range,_1106,_1107){
var _1108=range.duplicate(),node,len;
if(_1106.nodeType!=3){
_1108.moveToElementText(_1106);
_1108.collapse(true);
if(_1107==_1106.childNodes.length){
if(_1107>0){
node=_1106.lastChild;
len=0;
while(node&&node.nodeType==3){
len+=node.length;
_1106=node;
node=node.previousSibling;
}
if(node){
_1108.moveToElementText(node);
}
_1108.collapse(false);
_1107=len;
}else{
_1108.moveToElementText(_1106);
_1108.collapse(true);
}
}else{
if(_1107>0){
node=_1106.childNodes[_1107-1];
if(node.nodeType==3){
_1106=node;
_1107=node.length;
}else{
_1108.moveToElementText(node);
_1108.collapse(false);
}
}
}
}
if(_1106.nodeType==3){
var _110b=dijit.range.adjacentNoneTextNode(_1106);
var _110c=_110b[0];
len=_110b[1];
if(_110c){
_1108.moveToElementText(_110c);
_1108.collapse(false);
if(_110c.contentEditable!="inherit"){
len++;
}
}else{
_1108.moveToElementText(_1106.parentNode);
_1108.collapse(true);
}
_1107+=len;
if(_1107>0){
if(_1108.move("character",_1107)!=_1107){
console.error("Error when moving!");
}
}
}
return _1108;
},decomposeTextRange:function(range){
var _110e=dijit.range.ie.getEndPoint(range);
var _110f=_110e[0],_1110=_110e[1];
var _1111=_110e[0],_1112=_110e[1];
if(range.htmlText.length){
if(range.htmlText==range.text){
_1112=_1110+range.text.length;
}else{
_110e=dijit.range.ie.getEndPoint(range,true);
_1111=_110e[0],_1112=_110e[1];
}
}
return [[_110f,_1110],[_1111,_1112]];
},setRange:function(range,_1114,_1115,_1116,_1117,_1118){
var _1119=dijit.range.ie.setEndPoint(range,_1114,_1115);
range.setEndPoint("StartToStart",_1119);
var _111a=_1119;
if(!_1118){
_111a=dijit.range.ie.setEndPoint(range,_1116,_1117);
}
range.setEndPoint("EndToEnd",_111a);
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
},setStart:function(node,_1120){
_1120=parseInt(_1120);
if(this.startContainer===node&&this.startOffset==_1120){
return;
}
delete this._cachedBookmark;
this.startContainer=node;
this.startOffset=_1120;
if(!this.endContainer){
this.setEnd(node,_1120);
}else{
this._updateInternal();
}
},setEnd:function(node,_1122){
_1122=parseInt(_1122);
if(this.endContainer===node&&this.endOffset==_1122){
return;
}
delete this._cachedBookmark;
this.endContainer=node;
this.endOffset=_1122;
if(!this.startContainer){
this.setStart(node,_1122);
}else{
this._updateInternal();
}
},setStartAfter:function(node,_1124){
this._setPoint("setStart",node,_1124,1);
},setStartBefore:function(node,_1126){
this._setPoint("setStart",node,_1126,0);
},setEndAfter:function(node,_1128){
this._setPoint("setEnd",node,_1128,1);
},setEndBefore:function(node,_112a){
this._setPoint("setEnd",node,_112a,0);
},_setPoint:function(what,node,_112d,ext){
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
dijit._editor.escapeXml=function(str,_1136){
str=str.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;");
if(!_1136){
str=str.replace(/'/gm,"&#39;");
}
return str;
};
dijit._editor.getNodeHtml=function(node){
var _1138;
switch(node.nodeType){
case 1:
_1138="<"+node.nodeName.toLowerCase();
var _1139=[];
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
_1139.push([key,node.getAttribute("_djrealurl")]);
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
_1139.push([key,val.toString()]);
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
_1139.push([n,v]);
}
}
}
_1139.sort(function(a,b){
return a[0]<b[0]?-1:(a[0]==b[0]?0:1);
});
var j=0;
while((attr=_1139[j++])){
_1138+=" "+attr[0]+"=\""+(dojo.isString(attr[1])?dijit._editor.escapeXml(attr[1],true):attr[1])+"\"";
}
if(node.childNodes.length){
_1138+=">"+dijit._editor.getChildrenHtml(node)+"</"+node.nodeName.toLowerCase()+">";
}else{
_1138+=" />";
}
break;
case 3:
_1138=dijit._editor.escapeXml(node.nodeValue,true);
break;
case 8:
_1138="<!--"+dijit._editor.escapeXml(node.nodeValue,true)+"-->";
break;
default:
_1138="<!-- Element not recognized - Type: "+node.nodeType+" Name: "+node.nodeName+"-->";
}
return _1138;
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
var _114b=dojo.doc.createElement("textarea");
_114b.id=dijit._scopeName+"._editor.RichText.savedContent";
var s=_114b.style;
s.display="none";
s.position="absolute";
s.top="-100px";
s.left="-100px";
s.height="3px";
s.width="3px";
dojo.body().appendChild(_114b);
})();
}else{
try{
dojo.doc.write("<textarea id=\""+dijit._scopeName+"._editor.RichText.savedContent\" "+"style=\"display:none;position:absolute;top:-100px;left:-100px;height:3px;width:3px;overflow:hidden;\"></textarea>");
}
catch(e){
}
}
}
dojo.declare("dijit._editor.RichText",dijit._Widget,{constructor:function(_114d){
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
var _1151={b:exec("bold"),i:exec("italic"),u:exec("underline"),a:exec("selectall"),s:function(){
this.save(true);
},m:function(){
this.isTabIndent=!this.isTabIndent;
},"1":exec("formatblock","h1"),"2":exec("formatblock","h2"),"3":exec("formatblock","h3"),"4":exec("formatblock","h4"),"\\":exec("insertunorderedlist")};
if(!dojo.isIE){
_1151.Z=exec("redo");
}
for(var key in _1151){
this.addKeyHandler(key,true,false,_1151[key]);
}
},events:["onKeyPress","onKeyDown","onKeyUp","onClick"],captureEvents:[],_editorCommandsLocalized:false,_localizeEditorCommands:function(){
if(this._editorCommandsLocalized){
return;
}
this._editorCommandsLocalized=true;
var _1153=["div","p","pre","h1","h2","h3","h4","h5","h6","ol","ul","address"];
var _1154="",_1155,i=0;
while((_1155=_1153[i++])){
if(_1155.charAt(1)!="l"){
_1154+="<"+_1155+"><span>content</span></"+_1155+"><br/>";
}else{
_1154+="<"+_1155+"><li>content</li></"+_1155+"><br/>";
}
}
var div=dojo.doc.createElement("div");
dojo.style(div,{position:"absolute",left:"-2000px",top:"-2000px"});
dojo.doc.body.appendChild(div);
div.innerHTML=_1154;
var node=div.firstChild;
while(node){
dijit._editor.selection.selectElement(node.firstChild);
dojo.withGlobal(this.window,"selectElement",dijit._editor.selection,[node.firstChild]);
var _1159=node.tagName.toLowerCase();
this._local2NativeFormatNames[_1159]=document.queryCommandValue("formatblock");
this._native2LocalFormatNames[this._local2NativeFormatNames[_1159]]=_1159;
node=node.nextSibling.nextSibling;
}
dojo.body().removeChild(div);
},open:function(_115a){
if((!this.onLoadDeferred)||(this.onLoadDeferred.fired>=0)){
this.onLoadDeferred=new dojo.Deferred();
}
if(!this.isClosed){
this.close();
}
dojo.publish(dijit._scopeName+"._editor.RichText::open",[this]);
this._content="";
if((arguments.length==1)&&(_115a["nodeName"])){
this.domNode=_115a;
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
var _115e=dojo.hitch(this,function(){
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
setTimeout(_115e,10);
}else{
_115e();
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
var _115f=dojo.contentBox(dn);
this._oldHeight=_115f.h;
this._oldWidth=_115f.w;
this.savedContent=html;
if((dn["nodeName"])&&(dn.nodeName=="LI")){
dn.innerHTML=" <br>";
}
this.editingArea=dn.ownerDocument.createElement("div");
dn.appendChild(this.editingArea);
if(this.name!=""&&(!dojo.config["useXDomain"]||dojo.config["allowXdRichTextSave"])){
var _1160=dojo.byId(dijit._scopeName+"._editor.RichText.savedContent");
if(_1160.value!=""){
var datas=_1160.value.split(this._SEPARATOR),i=0,dat;
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
var _1168=dojo.hitch(this,function(){
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
_1168();
}
},100);
}else{
h=dojo.connect(((dojo.isIE)?ifr.contentWindow:ifr),"onload",_1168);
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
var _116e=_cs.lineHeight;
if(_116e.indexOf("px")>=0){
_116e=parseFloat(_116e)/parseFloat(_cs.fontSize);
}else{
if(_116e.indexOf("em")>=0){
_116e=parseFloat(_116e);
}else{
_116e="1.0";
}
}
var _116f="";
this.style.replace(/(^|;)(line-|font-?)[^;]+/g,function(match){
_116f+=match.replace(/^;/g,"")+";";
});
return [this.isLeftToRight()?"<html><head>":"<html dir='rtl'><head>",(dojo.isMoz?"<title>"+this._localizedIframeTitles.iframeEditTitle+"</title>":""),"<style>","body,html {","\tbackground:transparent;","\tpadding: 1em 0 0 0;","\tmargin: -1em 0 0 0;","\theight: 100%;","}","body{","\ttop:0px; left:0px; right:0px;","\tfont:",font,";",((this.height||dojo.isOpera)?"":"position: fixed;"),"\tmin-height:",this.minHeight,";","\tline-height:",_116e,"}","p{ margin: 1em 0 !important; }",(this.height?"":"body,html{height:auto;overflow-y:hidden;/*for IE*/} body > div {overflow-x:auto;/*for FF to show vertical scrollbar*/}"),"li > ul:-moz-first-node, li > ol:-moz-first-node{ padding-top: 1.2em; } ","li{ min-height:1.2em; }","</style>",this._applyEditingAreaStyleSheets(),"</head><body style='"+_116f+"'>"+html+"</body></html>"].join("");
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
var _1175;
if(this.textarea){
_1175=this.srcNodeRef;
}else{
_1175=dojo.doc.createElement("div");
_1175.style.display="none";
_1175.innerHTML=html;
this.editingArea.appendChild(_1175);
}
this.editingArea.appendChild(this.iframe);
var _1176=dojo.hitch(this,function(){
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
setTimeout(_1176,50);
return;
}
var _1177=this.document;
_1177.open();
if(dojo.isAIR){
_1177.body.innerHTML=html;
}else{
_1177.write(this._getIframeDocTxt(html));
}
_1177.close();
dojo._destroyElement(_1175);
}
if(!this.document.body){
setTimeout(_1176,50);
return;
}
this.onLoad();
}else{
dojo._destroyElement(_1175);
this.editNode.innerHTML=html;
this.onDisplayChanged();
}
this._preDomFilterContent(this.editNode);
});
_1176();
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
var _117c=(new dojo._Url(dojo.global.location,url)).toString();
this.editingAreaStyleSheets.push(_117c);
text+="<link rel=\"stylesheet\" type=\"text/css\" href=\""+_117c+"\"/>";
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
var _1180=this.document.createElement("link");
with(_1180){
rel="stylesheet";
type="text/css";
href=url;
}
head.appendChild(_1180);
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
var _1185=dojo.isIE&&(this.isLoaded||!this.focusOnLoad);
if(_1185){
this.editNode.unselectable="on";
}
this.editNode.contentEditable=!value;
if(_1185){
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
var _118b=this.tabStop=dojo.doc.createElement("<div tabIndex=-1>");
this.editingArea.appendChild(_118b);
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
var _118c=dojo.connect(this,"onClick",this,function(){
this.attr("disabled",false);
dojo.disconnect(_118c);
});
}
this._preDomFilterContent(this.editNode);
var _118d=this.events.concat(this.captureEvents);
var ap=(this.iframe)?this.document:this.editNode;
dojo.forEach(_118d,function(item){
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
var _1192=dojo.isFF<3?this.iframe.contentDocument:this.iframe;
_1192.title=this._localizedIframeTitles.iframeFocusTitle;
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
},setDisabled:function(_1194){
dojo.deprecated("dijit.Editor::setDisabled is deprecated","use dijit.Editor::attr(\"disabled\",boolean) instead",2);
this.attr("disabled",_1194);
},_setValueAttr:function(value){
this.setValue(value);
},onKeyPress:function(e){
var c=(e.keyChar&&e.keyChar.toLowerCase())||e.keyCode;
var _1198=this._keyHandlers[c];
var args=arguments;
if(_1198){
dojo.forEach(_1198,function(h){
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
},addKeyHandler:function(key,ctrl,shift,_119e){
if(!dojo.isArray(this._keyHandlers[key])){
this._keyHandlers[key]=[];
}
this._keyHandlers[key].push({shift:shift||false,ctrl:ctrl||false,handler:_119e});
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
var _11a3=dojo.isFF<3?this.iframe.contentDocument:this.iframe;
_11a3.title=this._localizedIframeTitles.iframeEditTitle;
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
},onChange:function(_11a6){
},_normalizeCommand:function(cmd){
var _11a8=cmd.toLowerCase();
if(_11a8=="formatblock"){
if(dojo.isSafari){
_11a8="heading";
}
}else{
if(_11a8=="hilitecolor"&&!dojo.isMoz){
_11a8="backcolor";
}
}
return _11a8;
},_qcaCache:{},queryCommandAvailable:function(_11a9){
var ca=this._qcaCache[_11a9];
if(ca!=undefined){
return ca;
}
return this._qcaCache[_11a9]=this._queryCommandAvailable(_11a9);
},_queryCommandAvailable:function(_11ab){
var ie=1;
var _11ad=1<<1;
var _11ae=1<<2;
var opera=1<<3;
var _11b0=1<<4;
var gt420=dojo.isSafari;
function isSupportedBy(_11b2){
return {ie:Boolean(_11b2&ie),mozilla:Boolean(_11b2&_11ad),safari:Boolean(_11b2&_11ae),safari420:Boolean(_11b2&_11b0),opera:Boolean(_11b2&opera)};
};
var _11b3=null;
switch(_11ab.toLowerCase()){
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
_11b3=isSupportedBy(_11ad|ie|_11ae|opera);
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
_11b3=isSupportedBy(_11ad|ie|opera|_11b0);
break;
case "blockdirltr":
case "blockdirrtl":
case "dirltr":
case "dirrtl":
case "inlinedirltr":
case "inlinedirrtl":
_11b3=isSupportedBy(ie);
break;
case "cut":
case "copy":
case "paste":
_11b3=isSupportedBy(ie|_11ad|_11b0);
break;
case "inserttable":
_11b3=isSupportedBy(_11ad|ie);
break;
case "insertcell":
case "insertcol":
case "insertrow":
case "deletecells":
case "deletecols":
case "deleterows":
case "mergecells":
case "splitcell":
_11b3=isSupportedBy(ie|_11ad);
break;
default:
return false;
}
return (dojo.isIE&&_11b3.ie)||(dojo.isMoz&&_11b3.mozilla)||(dojo.isSafari&&_11b3.safari)||(gt420&&_11b3.safari420)||(dojo.isOpera&&_11b3.opera);
},execCommand:function(_11b4,_11b5){
var _11b6;
this.focus();
_11b4=this._normalizeCommand(_11b4);
if(_11b5!=undefined){
if(_11b4=="heading"){
throw new Error("unimplemented");
}else{
if((_11b4=="formatblock")&&dojo.isIE){
_11b5="<"+_11b5+">";
}
}
}
if(_11b4=="inserthtml"){
_11b5=this._preFilterContent(_11b5);
_11b6=true;
if(dojo.isIE){
var _11b7=this.document.selection.createRange();
if(this.document.selection.type.toUpperCase()=="CONTROL"){
var n=_11b7.item(0);
while(_11b7.length){
_11b7.remove(_11b7.item(0));
}
n.outerHTML=_11b5;
}else{
_11b7.pasteHTML(_11b5);
}
_11b7.select();
}else{
if(dojo.isMoz&&!_11b5.length){
this._sCall("remove");
}else{
_11b6=this.document.execCommand(_11b4,false,_11b5);
}
}
}else{
if((_11b4=="unlink")&&(this.queryCommandEnabled("unlink"))&&(dojo.isMoz||dojo.isSafari)){
var a=this._sCall("getAncestorElement",["a"]);
this._sCall("selectElement",[a]);
_11b6=this.document.execCommand("unlink",false,null);
}else{
if((_11b4=="hilitecolor")&&(dojo.isMoz)){
this.document.execCommand("styleWithCSS",false,true);
_11b6=this.document.execCommand(_11b4,false,_11b5);
this.document.execCommand("styleWithCSS",false,false);
}else{
if((dojo.isIE)&&((_11b4=="backcolor")||(_11b4=="forecolor"))){
_11b5=arguments.length>1?_11b5:null;
_11b6=this.document.execCommand(_11b4,false,_11b5);
}else{
_11b5=arguments.length>1?_11b5:null;
if(_11b5||_11b4!="createlink"){
_11b6=this.document.execCommand(_11b4,false,_11b5);
}
}
}
}
}
this.onDisplayChanged();
return _11b6;
},queryCommandEnabled:function(_11ba){
if(this.disabled){
return false;
}
_11ba=this._normalizeCommand(_11ba);
if(dojo.isMoz||dojo.isSafari){
if(_11ba=="unlink"){
this._sCall("hasAncestorElement",["a"]);
}else{
if(_11ba=="inserttable"){
return true;
}
}
}
if(dojo.isSafari){
if(_11ba=="copy"){
_11ba="cut";
}else{
if(_11ba=="paste"){
return true;
}
}
}
if(_11ba=="indent"){
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
if(_11ba=="outdent"){
return this._sCall("hasAncestorElement",["li"]);
}
}
var elem=dojo.isIE?this.document.selection.createRange():this.document;
return elem.queryCommandEnabled(_11ba);
},queryCommandState:function(_11be){
if(this.disabled){
return false;
}
_11be=this._normalizeCommand(_11be);
return this.document.queryCommandState(_11be);
},queryCommandValue:function(_11bf){
if(this.disabled){
return false;
}
var r;
_11bf=this._normalizeCommand(_11bf);
if(dojo.isIE&&_11bf=="formatblock"){
r=this._native2LocalFormatNames[this.document.queryCommandValue(_11bf)];
}else{
r=this.document.queryCommandValue(_11bf);
}
return r;
},_sCall:function(name,args){
return dojo.withGlobal(this.window,name,dijit._editor.selection,args);
},placeCursorAtStart:function(){
this.focus();
var _11c3=false;
if(dojo.isMoz){
var first=this.editNode.firstChild;
while(first){
if(first.nodeType==3){
if(first.nodeValue.replace(/^\s+|\s+$/g,"").length>0){
_11c3=true;
this._sCall("selectElement",[first]);
break;
}
}else{
if(first.nodeType==1){
_11c3=true;
this._sCall("selectElementChildren",[first]);
break;
}
}
first=first.nextSibling;
}
}else{
_11c3=true;
this._sCall("selectElementChildren",[this.editNode]);
}
if(_11c3){
this._sCall("collapse",[true]);
}
},placeCursorAtEnd:function(){
this.focus();
var _11c5=false;
if(dojo.isMoz){
var last=this.editNode.lastChild;
while(last){
if(last.nodeType==3){
if(last.nodeValue.replace(/^\s+|\s+$/g,"").length>0){
_11c5=true;
this._sCall("selectElement",[last]);
break;
}
}else{
if(last.nodeType==1){
_11c5=true;
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
_11c5=true;
this._sCall("selectElementChildren",[this.editNode]);
}
if(_11c5){
this._sCall("collapse",[false]);
}
},getValue:function(_11c7){
if(this.textarea){
if(this.isClosed||!this.isLoaded){
return this.textarea.value;
}
}
return this._postFilterContent(null,_11c7);
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
},_postFilterContent:function(dom,_11d1){
var ec;
if(!dojo.isString(dom)){
dom=dom||this.editNode;
if(this.contentDomPostFilters.length){
if(_11d1){
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
var _11d6=dojo.byId(dijit._scopeName+"._editor.RichText.savedContent");
_11d6.value+=this._SEPARATOR+this.name+":"+this.getValue();
},escapeXml:function(str,_11d8){
str=str.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;");
if(!_11d8){
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
var _11dd=(this.savedContent!=this._content);
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
return _11dd;
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
var _11e7=this.iconClassPrefix+" "+this.iconClassPrefix+this.command.charAt(0).toUpperCase()+this.command.substr(1);
if(!this.button){
props=dojo.mixin({label:label,showLabel:false,iconClass:_11e7,dropDown:this.dropDown,tabIndex:"-1"},props||{});
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
var _11ee=_e.queryCommandEnabled(_c);
if(this.enabled!==_11ee){
this.enabled=_11ee;
this.button.attr("disabled",!_11ee);
}
if(typeof this.button.checked=="boolean"){
var _11ef=_e.queryCommandState(_c);
if(this.checked!==_11ef){
this.checked=_11ef;
this.button.attr("checked",_e.queryCommandState(_c));
}
}
}
catch(e){
console.debug(e);
}
}
},setEditor:function(_11f0){
this.editor=_11f0;
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
},setToolbar:function(_11f1){
if(this.button){
_11f1.addChild(this.button);
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
},setEditor:function(_11f3){
this.editor=_11f3;
if(this.blockNodeForEnter=="BR"){
if(dojo.isIE){
_11f3.contentDomPreFilters.push(dojo.hitch(this,"regularPsToSingleLinePs"));
_11f3.contentDomPostFilters.push(dojo.hitch(this,"singleLinePsToRegularPs"));
_11f3.onLoadDeferred.addCallback(dojo.hitch(this,"_fixNewLineBehaviorForIE"));
}else{
_11f3.onLoadDeferred.addCallback(dojo.hitch(this,function(d){
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
_11f3.addKeyHandler(13,0,0,h);
_11f3.addKeyHandler(13,0,1,h);
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
var _11fa=dojo.withGlobal(this.editor.window,"getAncestorElement",dijit._editor.selection,["LI"]);
if(!_11fa){
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
if(_11fa.parentNode.parentNode.nodeName=="LI"){
_11fa=_11fa.parentNode.parentNode;
}
}
var fc=_11fa.firstChild;
if(fc&&fc.nodeType==1&&(fc.nodeName=="UL"||fc.nodeName=="OL")){
_11fa.insertBefore(fc.ownerDocument.createTextNode(" "),fc);
var _11fe=dijit.range.create();
_11fe.setStart(_11fa.firstChild,0);
var _11ff=dijit.range.getSelection(this.editor.window,true);
_11ff.removeAllRanges();
_11ff.addRange(_11fe);
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
var _1201,range,_1203,doc=this.editor.document,br;
if(e.shiftKey||this.blockNodeForEnter=="BR"){
var _1206=dojo.withGlobal(this.editor.window,"getParentElement",dijit._editor.selection);
var _1207=dijit.range.getAncestor(_1206,this.blockNodes);
if(_1207){
if(!e.shiftKey&&_1207.tagName=="LI"){
return true;
}
_1201=dijit.range.getSelection(this.editor.window);
range=_1201.getRangeAt(0);
if(!range.collapsed){
range.deleteContents();
}
if(dijit.range.atBeginningOfContainer(_1207,range.startContainer,range.startOffset)){
if(e.shiftKey){
br=doc.createElement("br");
_1203=dijit.range.create();
_1207.insertBefore(br,_1207.firstChild);
_1203.setStartBefore(br.nextSibling);
_1201.removeAllRanges();
_1201.addRange(_1203);
}else{
dojo.place(br,_1207,"before");
}
}else{
if(dijit.range.atEndOfContainer(_1207,range.startContainer,range.startOffset)){
_1203=dijit.range.create();
br=doc.createElement("br");
if(e.shiftKey){
_1207.appendChild(br);
_1207.appendChild(doc.createTextNode(" "));
_1203.setStart(_1207.lastChild,0);
}else{
dojo.place(br,_1207,"after");
_1203.setStartAfter(_1207);
}
_1201.removeAllRanges();
_1201.addRange(_1203);
}else{
return true;
}
}
}else{
dijit._editor.RichText.prototype.execCommand.call(this.editor,"inserthtml","<br>");
}
return false;
}
var _1208=true;
_1201=dijit.range.getSelection(this.editor.window);
range=_1201.getRangeAt(0);
if(!range.collapsed){
range.deleteContents();
}
var block=dijit.range.getBlockAncestor(range.endContainer,null,this.editor.editNode);
var _120a=block.blockNode;
if((this._checkListLater=(_120a&&(_120a.nodeName=="LI"||_120a.parentNode.nodeName=="LI")))){
if(dojo.isMoz){
this._pressedEnterInBlock=_120a;
}
if(/^(?:\s|&nbsp;)$/.test(_120a.innerHTML)){
_120a.innerHTML="";
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
_1201=dijit.range.getSelection(this.editor.window);
range=_1201.getRangeAt(0);
}
var _120b=doc.createElement(this.blockNodeForEnter);
_120b.innerHTML=this.bogusHtmlContent;
this.removeTrailingBr(block.blockNode);
if(dijit.range.atEndOfContainer(block.blockNode,range.endContainer,range.endOffset)){
if(block.blockNode===block.blockContainer){
block.blockNode.appendChild(_120b);
}else{
dojo.place(_120b,block.blockNode,"after");
}
_1208=false;
_1203=dijit.range.create();
_1203.setStart(_120b,0);
_1201.removeAllRanges();
_1201.addRange(_1203);
if(this.editor.height){
_120b.scrollIntoView(false);
}
}else{
if(dijit.range.atBeginningOfContainer(block.blockNode,range.startContainer,range.startOffset)){
dojo.place(_120b,block.blockNode,block.blockNode===block.blockContainer?"first":"before");
if(_120b.nextSibling&&this.editor.height){
_120b.nextSibling.scrollIntoView(false);
}
_1208=false;
}else{
if(dojo.isMoz){
this._pressedEnterInBlock=block.blockNode;
}
}
}
return _1208;
},removeTrailingBr:function(_120c){
var para=/P|DIV|LI/i.test(_120c.tagName)?_120c:dijit._editor.selection.getParentOfType(_120c,["P","DIV","LI"]);
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
var _120f="p{margin:0 !important;}";
var _1210=function(_1211,doc,URI){
if(!_1211){
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
var _1216=function(){
try{
style.styleSheet.cssText=_1211;
}
catch(e){
console.debug(e);
}
};
if(style.styleSheet.disabled){
setTimeout(_1216,10);
}else{
_1216();
}
}else{
var _1217=doc.createTextNode(_1211);
style.appendChild(_1217);
}
return style;
};
_1210(_120f,this.editor.document);
this.editor.document.__INSERTED_EDITIOR_NEWLINE_CSS=true;
return d;
}
return null;
},regularPsToSingleLinePs:function(_1218,_1219){
function wrapLinesInPs(el){
function wrapNodes(nodes){
var newP=nodes[0].ownerDocument.createElement("p");
nodes[0].parentNode.insertBefore(newP,nodes[0]);
dojo.forEach(nodes,function(node){
newP.appendChild(node);
});
};
var _121e=0;
var _121f=[];
var _1220;
while(_121e<el.childNodes.length){
_1220=el.childNodes[_121e];
if(_1220.nodeType==3||(_1220.nodeType==1&&_1220.nodeName!="BR"&&dojo.style(_1220,"display")!="block")){
_121f.push(_1220);
}else{
var _1221=_1220.nextSibling;
if(_121f.length){
wrapNodes(_121f);
_121e=(_121e+1)-_121f.length;
if(_1220.nodeName=="BR"){
dojo._destroyElement(_1220);
}
}
_121f=[];
}
_121e++;
}
if(_121f.length){
wrapNodes(_121f);
}
};
function splitP(el){
var _1223=null;
var _1224=[];
var _1225=el.childNodes.length-1;
for(var i=_1225;i>=0;i--){
_1223=el.childNodes[i];
if(_1223.nodeName=="BR"){
var newP=_1223.ownerDocument.createElement("p");
dojo.place(newP,el,"after");
if(_1224.length==0&&i!=_1225){
newP.innerHTML="&nbsp;";
}
dojo.forEach(_1224,function(node){
newP.appendChild(node);
});
dojo._destroyElement(_1223);
_1224=[];
}else{
_1224.unshift(_1223);
}
}
};
var pList=[];
var ps=_1218.getElementsByTagName("p");
dojo.forEach(ps,function(p){
pList.push(p);
});
dojo.forEach(pList,function(p){
if((p.previousSibling)&&(p.previousSibling.nodeName=="P"||dojo.style(p.previousSibling,"display")!="block")){
var newP=p.parentNode.insertBefore(this.document.createElement("p"),p);
newP.innerHTML=_1219?"":"&nbsp;";
}
splitP(p);
},this.editor);
wrapLinesInPs(_1218);
return _1218;
},singleLinePsToRegularPs:function(_122e){
function getParagraphParents(node){
var ps=node.getElementsByTagName("p");
var _1231=[];
for(var i=0;i<ps.length;i++){
var p=ps[i];
var _1234=false;
for(var k=0;k<_1231.length;k++){
if(_1231[k]===p.parentNode){
_1234=true;
break;
}
}
if(!_1234){
_1231.push(p.parentNode);
}
}
return _1231;
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
var _1237=getParagraphParents(_122e);
for(var i=0;i<_1237.length;i++){
var _1239=_1237[i];
var _123a=null;
var node=_1239.firstChild;
var _123c=null;
while(node){
if(node.nodeType!="1"||node.tagName!="P"){
_123a=null;
}else{
if(isParagraphDelimiter(node)){
_123c=node;
_123a=null;
}else{
if(_123a==null){
_123a=node;
}else{
if((!_123a.lastChild||_123a.lastChild.nodeName!="BR")&&(node.firstChild)&&(node.firstChild.nodeName!="BR")){
_123a.appendChild(this.editor.document.createElement("br"));
}
while(node.firstChild){
_123a.appendChild(node.firstChild);
}
_123c=node;
}
}
}
node=node.nextSibling;
if(_123c){
dojo._destroyElement(_123c);
_123c=null;
}
}
}
return _122e;
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
},addPlugin:function(_123e,index){
var args=dojo.isString(_123e)?{name:_123e}:_123e;
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
console.warn("Cannot find plugin",_123e);
return;
}
_123e=o.plugin;
}
if(arguments.length>1){
this._plugins[index]=_123e;
}else{
this._plugins.push(_123e);
}
_123e.setEditor(this);
if(dojo.isFunction(_123e.setToolbar)){
_123e.setToolbar(this.toolbar);
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
var _124d=0;
if(this._savedSelection&&dojo.isIE){
_124d=dijit._curFocus!=this.editNode;
}
this.inherited(arguments);
if(_124d){
this._restoreSelection();
}
},_moveToBookmark:function(b){
var _124f=b;
if(dojo.isIE){
if(dojo.isArray(b)){
_124f=[];
dojo.forEach(b,function(n){
_124f.push(dijit.range.getNode(n,this.editNode));
},this);
}
}else{
var r=dijit.range.create();
r.setStart(dijit.range.getNode(b.startContainer,this.editNode),b.startOffset);
r.setEnd(dijit.range.getNode(b.endContainer,this.editNode),b.endOffset);
_124f=r;
}
dojo.withGlobal(this.window,"moveToBookmark",dijit,[_124f]);
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
},endEditing:function(_1257){
if(this._editTimer){
clearTimeout(this._editTimer);
}
if(this._inEditing){
this._endEditing(_1257);
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
},_endEditing:function(_125c){
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
if(!dojo._hasResource["dojox.grid.cells.dijit"]){
dojo._hasResource["dojox.grid.cells.dijit"]=true;
dojo.provide("dojox.grid.cells.dijit");
(function(){
var dgc=dojox.grid.cells;
dojo.declare("dojox.grid.cells._Widget",dgc._Base,{widgetClass:"dijit.form.TextBox",constructor:function(_1267){
this.widget=null;
if(typeof this.widgetClass=="string"){
this.widgetClass=dojo.getObject(this.widgetClass);
}
},formatEditing:function(_1268,_1269){
this.needFormatNode(_1268,_1269);
return "<div></div>";
},getValue:function(_126a){
return this.widget.attr("value");
},setValue:function(_126b,_126c){
if(this.widget&&this.widget.setValue){
this.widget.setValue(_126c);
}else{
this.inherited(arguments);
}
},getWidgetProps:function(_126d){
return dojo.mixin({},this.widgetProps||{},{constraints:dojo.mixin({},this.constraint)||{},value:_126d});
},createWidget:function(_126e,_126f,_1270){
return new this.widgetClass(this.getWidgetProps(_126f),_126e);
},attachWidget:function(_1271,_1272,_1273){
_1271.appendChild(this.widget.domNode);
this.setValue(_1273,_1272);
},formatNode:function(_1274,_1275,_1276){
if(!this.widgetClass){
return _1275;
}
if(!this.widget){
this.widget=this.createWidget.apply(this,arguments);
}else{
this.attachWidget.apply(this,arguments);
}
this.sizeWidget.apply(this,arguments);
this.grid.rowHeightChanged(_1276);
this.focus();
},sizeWidget:function(_1277,_1278,_1279){
var p=this.getNode(_1279),box=dojo.contentBox(p);
dojo.marginBox(this.widget.domNode,{w:box.w});
},focus:function(_127c,_127d){
if(this.widget){
setTimeout(dojo.hitch(this.widget,function(){
dojox.grid.util.fire(this,"focus");
}),0);
}
},_finish:function(_127e){
this.inherited(arguments);
dojox.grid.util.removeNode(this.widget.domNode);
}});
dgc._Widget.markupFactory=function(node,cell){
dgc._Base.markupFactory(node,cell);
var d=dojo;
var _1282=d.trim(d.attr(node,"widgetProps")||"");
var _1283=d.trim(d.attr(node,"constraint")||"");
var _1284=d.trim(d.attr(node,"widgetClass")||"");
if(_1282){
cell.widgetProps=d.fromJson(_1282);
}
if(_1283){
cell.constraint=d.fromJson(_1283);
}
if(_1284){
cell.widgetClass=d.getObject(_1284);
}
};
dojo.declare("dojox.grid.cells.ComboBox",dgc._Widget,{widgetClass:"dijit.form.ComboBox",getWidgetProps:function(_1285){
var items=[];
dojo.forEach(this.options,function(o){
items.push({name:o,value:o});
});
var store=new dojo.data.ItemFileReadStore({data:{identifier:"name",items:items}});
return dojo.mixin({},this.widgetProps||{},{value:_1285,store:store});
},getValue:function(){
var e=this.widget;
e.attr("displayedValue",e.attr("displayedValue"));
return e.attr("value");
}});
dgc.ComboBox.markupFactory=function(node,cell){
dgc._Widget.markupFactory(node,cell);
var d=dojo;
var _128d=d.trim(d.attr(node,"options")||"");
if(_128d){
var o=_128d.split(",");
if(o[0]!=_128d){
cell.options=o;
}
}
};
dojo.declare("dojox.grid.cells.DateTextBox",dgc._Widget,{widgetClass:"dijit.form.DateTextBox",setValue:function(_128f,_1290){
if(this.widget){
this.widget.setValue(new Date(_1290));
}else{
this.inherited(arguments);
}
},getWidgetProps:function(_1291){
return dojo.mixin(this.inherited(arguments),{value:new Date(_1291)});
}});
dgc.DateTextBox.markupFactory=function(node,cell){
dgc._Widget.markupFactory(node,cell);
};
dojo.declare("dojox.grid.cells.CheckBox",dgc._Widget,{widgetClass:"dijit.form.CheckBox",getValue:function(){
return this.widget.checked;
},setValue:function(_1294,_1295){
if(this.widget&&this.widget.setAttribute){
this.widget.setAttribute("checked",_1295);
}else{
this.inherited(arguments);
}
},sizeWidget:function(_1296,_1297,_1298){
return;
}});
dgc.CheckBox.markupFactory=function(node,cell){
dgc._Widget.markupFactory(node,cell);
};
dojo.declare("dojox.grid.cells.Editor",dgc._Widget,{widgetClass:"dijit.Editor",getWidgetProps:function(_129b){
return dojo.mixin({},this.widgetProps||{},{height:this.widgetHeight||"100px"});
},createWidget:function(_129c,_129d,_129e){
var _129f=new this.widgetClass(this.getWidgetProps(_129d),_129c);
dojo.connect(_129f,"onLoad",dojo.hitch(this,"populateEditor"));
return _129f;
},formatNode:function(_12a0,_12a1,_12a2){
this.content=_12a1;
this.inherited(arguments);
if(dojo.isMoz){
var e=this.widget;
e.open();
if(this.widgetToolbar){
dojo.place(e.toolbar.domNode,e.editingArea,"before");
}
}
},populateEditor:function(){
this.widget.setValue(this.content);
this.widget.placeCursorAtEnd();
}});
dgc.Editor.markupFactory=function(node,cell){
dgc._Widget.markupFactory(node,cell);
var d=dojo;
var h=dojo.trim(dojo.attr(node,"widgetHeight")||"");
if(h){
if((h!="auto")&&(h.substr(-2)!="em")){
h=parseInt(w)+"px";
}
cell.widgetHeight=h;
}
};
})();
}
if(!dojo._hasResource["dojox.grid.compat._grid.lib"]){
dojo._hasResource["dojox.grid.compat._grid.lib"]=true;
dojo.provide("dojox.grid.compat._grid.lib");
dojo.mixin(dojox.grid,{na:"...",nop:function(){
},getTdIndex:function(td){
return td.cellIndex>=0?td.cellIndex:dojo.indexOf(td.parentNode.cells,td);
},getTrIndex:function(tr){
return tr.rowIndex>=0?tr.rowIndex:dojo.indexOf(tr.parentNode.childNodes,tr);
},getTr:function(_12aa,index){
return _12aa&&((_12aa.rows||0)[index]||_12aa.childNodes[index]);
},getTd:function(_12ac,_12ad,_12ae){
return (dojox.grid.getTr(inTable,_12ad)||0)[_12ae];
},findTable:function(node){
for(var n=node;n&&n.tagName!="TABLE";n=n.parentNode){
}
return n;
},ascendDom:function(_12b1,_12b2){
for(var n=_12b1;n&&_12b2(n);n=n.parentNode){
}
return n;
},makeNotTagName:function(_12b4){
var name=_12b4.toUpperCase();
return function(node){
return node.tagName!=name;
};
},fire:function(ob,ev,args){
var fn=ob&&ev&&ob[ev];
return fn&&(args?fn.apply(ob,args):ob[ev]());
},setStyleText:function(_12bb,_12bc){
if(_12bb.style.cssText==undefined){
_12bb.setAttribute("style",_12bc);
}else{
_12bb.style.cssText=_12bc;
}
},getStyleText:function(_12bd,_12be){
return (_12bd.style.cssText==undefined?_12bd.getAttribute("style"):_12bd.style.cssText);
},setStyle:function(_12bf,_12c0,_12c1){
if(_12bf&&_12bf.style[_12c0]!=_12c1){
_12bf.style[_12c0]=_12c1;
}
},setStyleHeightPx:function(_12c2,_12c3){
if(_12c3>=0){
dojox.grid.setStyle(_12c2,"height",_12c3+"px");
}
},mouseEvents:["mouseover","mouseout","mousedown","mouseup","click","dblclick","contextmenu"],keyEvents:["keyup","keydown","keypress"],funnelEvents:function(_12c4,_12c5,_12c6,_12c7){
var evts=(_12c7?_12c7:dojox.grid.mouseEvents.concat(dojox.grid.keyEvents));
for(var i=0,l=evts.length;i<l;i++){
dojo.connect(_12c4,"on"+evts[i],_12c5,_12c6);
}
},removeNode:function(_12cb){
_12cb=dojo.byId(_12cb);
_12cb&&_12cb.parentNode&&_12cb.parentNode.removeChild(_12cb);
return _12cb;
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
},getRef:function(name,_12ce,_12cf){
var obj=_12cf||dojo.global,parts=name.split("."),prop=parts.pop();
for(var i=0,p;obj&&(p=parts[i]);i++){
obj=(p in obj?obj[p]:(_12ce?obj[p]={}:undefined));
}
return {obj:obj,prop:prop};
},getProp:function(name,_12d6,_12d7){
with(dojox.grid.getRef(name,_12d6,_12d7)){
return (obj)&&(prop)&&(prop in obj?obj[prop]:(_12d6?obj[prop]={}:undefined));
}
},indexInParent:function(_12d8){
var i=0,n,p=_12d8.parentNode;
while((n=p.childNodes[i++])){
if(n==_12d8){
return i-1;
}
}
return -1;
},cleanNode:function(_12dc){
if(!_12dc){
return;
}
var _12dd=function(inW){
return inW.domNode&&dojo.isDescendant(inW.domNode,_12dc,true);
};
var ws=dijit.registry.filter(_12dd);
for(var i=0,w;(w=ws[i]);i++){
w.destroy();
}
delete ws;
},getTagName:function(_12e2){
var node=dojo.byId(_12e2);
return (node&&node.tagName?node.tagName.toLowerCase():"");
},nodeKids:function(_12e4,inTag){
var _12e6=[];
var i=0,n;
while((n=_12e4.childNodes[i++])){
if(dojox.grid.getTagName(n)==inTag){
_12e6.push(n);
}
}
return _12e6;
},divkids:function(_12e9){
return dojox.grid.nodeKids(_12e9,"div");
},focusSelectNode:function(_12ea){
try{
dojox.grid.fire(_12ea,"focus");
dojox.grid.fire(_12ea,"select");
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
},arrayInsert:function(_12ef,_12f0,_12f1){
if(_12ef.length<=_12f0){
_12ef[_12f0]=_12f1;
}else{
_12ef.splice(_12f0,0,_12f1);
}
},arrayRemove:function(_12f2,_12f3){
_12f2.splice(_12f3,1);
},arraySwap:function(_12f4,inI,inJ){
var cache=_12f4[inI];
_12f4[inI]=_12f4[inJ];
_12f4[inJ]=cache;
},initTextSizePoll:function(_12f8){
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
window.setInterval(job,_12f8||200);
dojox.grid.initTextSizePoll=dojox.grid.nop;
},textSizeChanged:function(){
}});
dojox.grid.jobs={cancel:function(_12fc){
if(_12fc){
window.clearTimeout(_12fc);
}
},jobs:[],job:function(_12fd,_12fe,inJob){
dojox.grid.jobs.cancelJob(_12fd);
var job=function(){
delete dojox.grid.jobs.jobs[_12fd];
inJob();
};
dojox.grid.jobs.jobs[_12fd]=setTimeout(job,_12fe);
},cancelJob:function(_1301){
dojox.grid.jobs.cancel(dojox.grid.jobs.jobs[_1301]);
}};
}
if(!dojo._hasResource["dojox.grid.compat._grid.scroller"]){
dojo._hasResource["dojox.grid.compat._grid.scroller"]=true;
dojo.provide("dojox.grid.compat._grid.scroller");
dojo.declare("dojox.grid.scroller.base",null,{constructor:function(){
this.pageHeights=[];
this.stack=[];
},rowCount:0,defaultRowHeight:10,keepRows:100,contentNode:null,scrollboxNode:null,defaultPageHeight:0,keepPages:10,pageCount:0,windowHeight:0,firstVisibleRow:0,lastVisibleRow:0,page:0,pageTop:0,init:function(_1302,_1303,_1304){
switch(arguments.length){
case 3:
this.rowsPerPage=_1304;
case 2:
this.keepRows=_1303;
case 1:
this.rowCount=_1302;
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
},setKeepInfo:function(_1305){
this.keepRows=_1305;
this.keepPages=!this.keepRows?this.keepRows:Math.max(Math.ceil(this.keepRows/this.rowsPerPage),2);
},invalidate:function(){
this.invalidateNodes();
this.pageHeights=[];
this.height=(this.pageCount?(this.pageCount-1)*this.defaultPageHeight+this.calcLastPageHeight():0);
this.resize();
},updateRowCount:function(_1306){
this.invalidateNodes();
this.rowCount=_1306;
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
},pageExists:function(_1308){
},measurePage:function(_1309){
},positionPage:function(_130a,inPos){
},repositionPages:function(_130c){
},installPage:function(_130d){
},preparePage:function(_130e,inPos,_1310){
},renderPage:function(_1311){
},removePage:function(_1312){
},pacify:function(_1313){
},pacifying:false,pacifyTicks:200,setPacifying:function(_1314){
if(this.pacifying!=_1314){
this.pacifying=_1314;
this.pacify(this.pacifying);
}
},startPacify:function(){
this.startPacifyTicks=new Date().getTime();
},doPacify:function(){
var _1315=(new Date().getTime()-this.startPacifyTicks)>this.pacifyTicks;
this.setPacifying(true);
this.startPacify();
return _1315;
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
var _1316=this.pageCount-1;
var _1317=((this.rowCount%this.rowsPerPage)||(this.rowsPerPage))*this.defaultRowHeight;
this.pageHeights[_1316]=_1317;
return _1317;
},updateContentHeight:function(inDh){
this.height+=inDh;
this.resize();
},updatePageHeight:function(_1319){
if(this.pageExists(_1319)){
var oh=this.getPageHeight(_1319);
var h=(this.measurePage(_1319))||(oh);
this.pageHeights[_1319]=h;
if((h)&&(oh!=h)){
this.updateContentHeight(h-oh);
this.repositionPages(_1319);
}
}
},rowHeightChanged:function(_131c){
this.updatePageHeight(Math.floor(_131c/this.rowsPerPage));
},invalidateNodes:function(){
while(this.stack.length){
this.destroyPage(this.popPage());
}
},createPageNode:function(){
var p=document.createElement("div");
p.style.position="absolute";
p.style[dojo._isBodyLtr()?"left":"right"]="0";
return p;
},getPageHeight:function(_131e){
var ph=this.pageHeights[_131e];
return (ph!==undefined?ph:this.defaultPageHeight);
},pushPage:function(_1320){
return this.stack.push(_1320);
},popPage:function(){
return this.stack.shift();
},findPage:function(inTop){
var i=0,h=0;
for(var ph=0;i<this.pageCount;i++,h+=ph){
ph=this.getPageHeight(i);
if(h+ph>=inTop){
break;
}
}
this.page=i;
this.pageTop=h;
},buildPage:function(_1325,_1326,inPos){
this.preparePage(_1325,_1326);
this.positionPage(_1325,inPos);
this.installPage(_1325);
this.renderPage(_1325);
this.pushPage(_1325);
},needPage:function(_1328,inPos){
var h=this.getPageHeight(_1328),oh=h;
if(!this.pageExists(_1328)){
this.buildPage(_1328,this.keepPages&&(this.stack.length>=this.keepPages),inPos);
h=this.measurePage(_1328)||h;
this.pageHeights[_1328]=h;
if(h&&(oh!=h)){
this.updateContentHeight(h-oh);
}
}else{
this.positionPage(_1328,inPos);
}
return h;
},onscroll:function(){
this.scroll(this.scrollboxNode.scrollTop);
},scroll:function(inTop){
this.startPacify();
this.findPage(inTop);
var h=this.height;
var b=this.getScrollBottom(inTop);
for(var p=this.page,y=this.pageTop;(p<this.pageCount)&&((b<0)||(y<b));p++){
y+=this.needPage(p,y);
}
this.firstVisibleRow=this.getFirstVisibleRow(this.page,this.pageTop,inTop);
this.lastVisibleRow=this.getLastVisibleRow(p-1,y,b);
if(h!=this.height){
this.repositionPages(p-1);
}
this.endPacify();
},getScrollBottom:function(inTop){
return (this.windowHeight>=0?inTop+this.windowHeight:-1);
},processNodeEvent:function(e,_1333){
var t=e.target;
while(t&&(t!=_1333)&&t.parentNode&&(t.parentNode.parentNode!=_1333)){
t=t.parentNode;
}
if(!t||!t.parentNode||(t.parentNode.parentNode!=_1333)){
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
},renderRow:function(_1337,_1338){
},removeRow:function(_1339){
},getDefaultNodes:function(){
return this.pageNodes;
},getDefaultPageNode:function(_133a){
return this.getDefaultNodes()[_133a];
},positionPageNode:function(_133b,inPos){
_133b.style.top=inPos+"px";
},getPageNodePosition:function(_133d){
return _133d.offsetTop;
},repositionPageNodes:function(_133e,_133f){
var last=0;
for(var i=0;i<this.stack.length;i++){
last=Math.max(this.stack[i],last);
}
var n=_133f[_133e];
var y=(n?this.getPageNodePosition(n)+this.getPageHeight(_133e):0);
for(var p=_133e+1;p<=last;p++){
n=_133f[p];
if(n){
if(this.getPageNodePosition(n)==y){
return;
}
this.positionPage(p,y);
}
y+=this.getPageHeight(p);
}
},invalidatePageNode:function(_1345,_1346){
var p=_1346[_1345];
if(p){
delete _1346[_1345];
this.removePage(_1345,p);
dojox.grid.cleanNode(p);
p.innerHTML="";
}
return p;
},preparePageNode:function(_1348,_1349,_134a){
var p=(_1349===null?this.createPageNode():this.invalidatePageNode(_1349,_134a));
p.pageIndex=_1348;
p.id=(this._pageIdPrefix||"")+"page-"+_1348;
_134a[_1348]=p;
},pageExists:function(_134c){
return Boolean(this.getDefaultPageNode(_134c));
},measurePage:function(_134d){
var p=this.getDefaultPageNode(_134d);
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
},positionPage:function(_1352,inPos){
this.positionPageNode(this.getDefaultPageNode(_1352),inPos);
},repositionPages:function(_1354){
this.repositionPageNodes(_1354,this.getDefaultNodes());
},preparePage:function(_1355,_1356){
this.preparePageNode(_1355,(_1356?this.popPage():null),this.getDefaultNodes());
},installPage:function(_1357){
this.contentNode.appendChild(this.getDefaultPageNode(_1357));
},destroyPage:function(_1358){
var p=this.invalidatePageNode(_1358,this.getDefaultNodes());
dojox.grid.removeNode(p);
},renderPage:function(_135a){
var node=this.pageNodes[_135a];
for(var i=0,j=_135a*this.rowsPerPage;(i<this.rowsPerPage)&&(j<this.rowCount);i++,j++){
this.renderRow(j,node);
}
},removePage:function(_135e){
for(var i=0,j=_135e*this.rowsPerPage;i<this.rowsPerPage;i++,j++){
this.removeRow(j);
}
},getPageRow:function(_1361){
return _1361*this.rowsPerPage;
},getLastPageRow:function(_1362){
return Math.min(this.rowCount,this.getPageRow(_1362+1))-1;
},getFirstVisibleRowNodes:function(_1363,_1364,_1365,_1366){
var row=this.getPageRow(_1363);
var rows=dojox.grid.divkids(_1366[_1363]);
for(var i=0,l=rows.length;i<l&&_1364<_1365;i++,row++){
_1364+=rows[i].offsetHeight;
}
return (row?row-1:row);
},getFirstVisibleRow:function(_136b,_136c,_136d){
if(!this.pageExists(_136b)){
return 0;
}
return this.getFirstVisibleRowNodes(_136b,_136c,_136d,this.getDefaultNodes());
},getLastVisibleRowNodes:function(_136e,_136f,_1370,_1371){
var row=this.getLastPageRow(_136e);
var rows=dojox.grid.divkids(_1371[_136e]);
for(var i=rows.length-1;i>=0&&_136f>_1370;i--,row--){
_136f-=rows[i].offsetHeight;
}
return row+1;
},getLastVisibleRow:function(_1375,_1376,_1377){
if(!this.pageExists(_1375)){
return 0;
}
return this.getLastVisibleRowNodes(_1375,_1376,_1377,this.getDefaultNodes());
},findTopRowForNodes:function(_1378,_1379){
var rows=dojox.grid.divkids(_1379[this.page]);
for(var i=0,l=rows.length,t=this.pageTop,h;i<l;i++){
h=rows[i].offsetHeight;
t+=h;
if(t>=_1378){
this.offset=h-(t-_1378);
return i+this.page*this.rowsPerPage;
}
}
return -1;
},findScrollTopForNodes:function(inRow,_1380){
var _1381=Math.floor(inRow/this.rowsPerPage);
var t=0;
for(var i=0;i<_1381;i++){
t+=this.getPageHeight(i);
}
this.pageTop=t;
this.needPage(_1381,this.pageTop);
var rows=dojox.grid.divkids(_1380[_1381]);
var r=inRow-this.rowsPerPage*_1381;
for(var i=0,l=rows.length;i<l&&i<r;i++){
t+=rows[i].offsetHeight;
}
return t;
},findTopRow:function(_1387){
return this.findTopRowForNodes(_1387,this.getDefaultNodes());
},findScrollTop:function(inRow){
return this.findScrollTopForNodes(inRow,this.getDefaultNodes());
},dummy:0});
dojo.declare("dojox.grid.scroller.columns",dojox.grid.scroller,{constructor:function(_1389){
this.setContentNodes(_1389);
},setContentNodes:function(_138a){
this.contentNodes=_138a;
this.colCount=(this.contentNodes?this.contentNodes.length:0);
this.pageNodes=[];
for(var i=0;i<this.colCount;i++){
this.pageNodes[i]=[];
}
},getDefaultNodes:function(){
return this.pageNodes[0]||[];
},scroll:function(inTop){
if(this.colCount){
dojox.grid.scroller.prototype.scroll.call(this,inTop);
}
},resize:function(){
if(this.scrollboxNode){
this.windowHeight=this.scrollboxNode.clientHeight;
}
for(var i=0;i<this.colCount;i++){
dojox.grid.setStyleHeightPx(this.contentNodes[i],this.height);
}
},positionPage:function(_138e,inPos){
for(var i=0;i<this.colCount;i++){
this.positionPageNode(this.pageNodes[i][_138e],inPos);
}
},preparePage:function(_1391,_1392){
var p=(_1392?this.popPage():null);
for(var i=0;i<this.colCount;i++){
this.preparePageNode(_1391,p,this.pageNodes[i]);
}
},installPage:function(_1395){
for(var i=0;i<this.colCount;i++){
this.contentNodes[i].appendChild(this.pageNodes[i][_1395]);
}
},destroyPage:function(_1397){
for(var i=0;i<this.colCount;i++){
dojox.grid.removeNode(this.invalidatePageNode(_1397,this.pageNodes[i]));
}
},renderPage:function(_1399){
var nodes=[];
for(var i=0;i<this.colCount;i++){
nodes[i]=this.pageNodes[i][_1399];
}
for(var i=0,j=_1399*this.rowsPerPage;(i<this.rowsPerPage)&&(j<this.rowCount);i++,j++){
this.renderRow(j,nodes);
}
}});
}
if(!dojo._hasResource["dojox.grid.compat._grid.drag"]){
dojo._hasResource["dojox.grid.compat._grid.drag"]=true;
dojo.provide("dojox.grid.compat._grid.drag");
(function(){
var _139d=dojox.grid.drag={};
_139d.dragging=false;
_139d.hysteresis=2;
_139d.capture=function(_139e){
if(_139e.setCapture){
_139e.setCapture();
}else{
document.addEventListener("mousemove",_139e.onmousemove,true);
document.addEventListener("mouseup",_139e.onmouseup,true);
document.addEventListener("click",_139e.onclick,true);
}
};
_139d.release=function(_139f){
if(_139f.releaseCapture){
_139f.releaseCapture();
}else{
document.removeEventListener("click",_139f.onclick,true);
document.removeEventListener("mouseup",_139f.onmouseup,true);
document.removeEventListener("mousemove",_139f.onmousemove,true);
}
};
_139d.start=function(_13a0,_13a1,_13a2,_13a3,_13a4){
if(!_13a0||_139d.dragging){
console.debug("failed to start drag: bad input node or already dragging");
return;
}
_139d.dragging=true;
_139d.elt=_13a0;
_139d.events={drag:_13a1||dojox.grid.nop,end:_13a2||dojox.grid.nop,start:_13a4||dojox.grid.nop,oldmove:_13a0.onmousemove,oldup:_13a0.onmouseup,oldclick:_13a0.onclick};
_139d.positionX=(_13a3&&("screenX" in _13a3)?_13a3.screenX:false);
_139d.positionY=(_13a3&&("screenY" in _13a3)?_13a3.screenY:false);
_139d.started=(_139d.position===false);
_13a0.onmousemove=_139d.mousemove;
_13a0.onmouseup=_139d.mouseup;
_13a0.onclick=_139d.click;
_139d.capture(_139d.elt);
};
_139d.end=function(){
_139d.release(_139d.elt);
_139d.elt.onmousemove=_139d.events.oldmove;
_139d.elt.onmouseup=_139d.events.oldup;
_139d.elt.onclick=_139d.events.oldclick;
_139d.elt=null;
try{
if(_139d.started){
_139d.events.end();
}
}
finally{
_139d.dragging=false;
}
};
_139d.calcDelta=function(_13a5){
_13a5.deltaX=_13a5.screenX-_139d.positionX;
_13a5.deltaY=_13a5.screenY-_139d.positionY;
};
_139d.hasMoved=function(_13a6){
return Math.abs(_13a6.deltaX)+Math.abs(_13a6.deltaY)>_139d.hysteresis;
};
_139d.mousemove=function(_13a7){
_13a7=dojo.fixEvent(_13a7);
dojo.stopEvent(_13a7);
_139d.calcDelta(_13a7);
if((!_139d.started)&&(_139d.hasMoved(_13a7))){
_139d.events.start(_13a7);
_139d.started=true;
}
if(_139d.started){
_139d.events.drag(_13a7);
}
};
_139d.mouseup=function(_13a8){
dojo.stopEvent(dojo.fixEvent(_13a8));
_139d.end();
};
_139d.click=function(_13a9){
dojo.stopEvent(dojo.fixEvent(_13a9));
};
})();
}
if(!dojo._hasResource["dojox.grid.compat._grid.builder"]){
dojo._hasResource["dojox.grid.compat._grid.builder"]=true;
dojo.provide("dojox.grid.compat._grid.builder");
dojo.declare("dojox.grid.Builder",null,{constructor:function(_13aa){
this.view=_13aa;
this.grid=_13aa.grid;
},view:null,_table:"<table class=\"dojoxGrid-row-table\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"wairole:presentation\">",generateCellMarkup:function(_13ab,_13ac,_13ad,_13ae){
var _13af=[],html;
if(_13ae){
html=["<th tabIndex=\"-1\" role=\"wairole:columnheader\""];
}else{
html=["<td tabIndex=\"-1\" role=\"wairole:gridcell\""];
}
_13ab.colSpan&&html.push(" colspan=\"",_13ab.colSpan,"\"");
_13ab.rowSpan&&html.push(" rowspan=\"",_13ab.rowSpan,"\"");
html.push(" class=\"dojoxGrid-cell ");
_13ab.classes&&html.push(_13ab.classes," ");
_13ad&&html.push(_13ad," ");
_13af.push(html.join(""));
_13af.push("");
html=["\" idx=\"",_13ab.index,"\" style=\""];
html.push(_13ab.styles,_13ac||"");
_13ab.unitWidth&&html.push("width:",_13ab.unitWidth,";");
_13af.push(html.join(""));
_13af.push("");
html=["\""];
_13ab.attrs&&html.push(" ",_13ab.attrs);
html.push(">");
_13af.push(html.join(""));
_13af.push("");
_13af.push("</td>");
return _13af;
},isCellNode:function(_13b1){
return Boolean(_13b1&&_13b1.getAttribute&&_13b1.getAttribute("idx"));
},getCellNodeIndex:function(_13b2){
return _13b2?Number(_13b2.getAttribute("idx")):-1;
},getCellNode:function(_13b3,_13b4){
for(var i=0,row;row=dojox.grid.getTr(_13b3.firstChild,i);i++){
for(var j=0,cell;cell=row.cells[j];j++){
if(this.getCellNodeIndex(cell)==_13b4){
return cell;
}
}
}
},findCellTarget:function(_13b9,_13ba){
var n=_13b9;
while(n&&(!this.isCellNode(n)||(dojox.grid.gridViewTag in n.offsetParent.parentNode&&n.offsetParent.parentNode[dojox.grid.gridViewTag]!=this.view.id))&&(n!=_13ba)){
n=n.parentNode;
}
return n!=_13ba?n:null;
},baseDecorateEvent:function(e){
e.dispatch="do"+e.type;
e.grid=this.grid;
e.sourceView=this.view;
e.cellNode=this.findCellTarget(e.target,e.rowNode);
e.cellIndex=this.getCellNodeIndex(e.cellNode);
e.cell=(e.cellIndex>=0?this.grid.getCell(e.cellIndex):null);
},findTarget:function(_13bd,inTag){
var n=_13bd;
while(n&&(n!=this.domNode)&&(!(inTag in n)||(dojox.grid.gridViewTag in n&&n[dojox.grid.gridViewTag]!=this.view.id))){
n=n.parentNode;
}
return (n!=this.domNode)?n:null;
},findRowTarget:function(_13c0){
return this.findTarget(_13c0,dojox.grid.rowIndexTag);
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
var _13c8=this.grid.get,rows=this.view.structure.rows;
for(var j=0,row;(row=rows[j]);j++){
for(var i=0,cell;(cell=row[i]);i++){
cell.get=cell.get||(cell.value==undefined)&&_13c8;
cell.markup=this.generateCellMarkup(cell,cell.cellStyles,cell.cellClasses,false);
}
}
},generateHtml:function(_13ce,_13cf){
var html=[this._table],v=this.view,obr=v.onBeforeRow,rows=v.structure.rows;
obr&&obr(_13cf,rows);
for(var j=0,row;(row=rows[j]);j++){
if(row.hidden||row.header){
continue;
}
html.push(!row.invisible?"<tr>":"<tr class=\"dojoxGrid-invisible\">");
for(var i=0,cell,m,cc,cs;(cell=row[i]);i++){
m=cell.markup,cc=cell.customClasses=[],cs=cell.customStyles=[];
m[5]=cell.format(_13ce);
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
},generateHtml:function(_13dc,_13dd){
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
for(var i=0,cell,_13e4;(cell=row[i]);i++){
cell.customClasses=[];
cell.customStyles=[];
_13e4=this.generateCellMarkup(cell,cell.headerStyles,cell.headerClasses,true);
_13e4[5]=(_13dd!=undefined?_13dd:_13dc(cell));
_13e4[3]=cell.customStyles.join(";");
_13e4[1]=cell.customClasses.join(" ");
html.push(_13e4.join(""));
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
var _13f6=[],nodes=this.tableMap.findOverlappingNodes(e.cellNode);
for(var i=0,cell;(cell=nodes[i]);i++){
_13f6.push({node:cell,index:this.getCellNodeIndex(cell),width:cell.offsetWidth});
}
var drag={scrollLeft:e.sourceView.headerNode.scrollLeft,view:e.sourceView,node:e.cellNode,index:e.cellIndex,w:e.cellNode.clientWidth,spanners:_13f6};
dojox.grid.drag.start(e.cellNode,dojo.hitch(this,"doResizeColumn",drag),dojo.hitch(this,"endResizeColumn",drag),e);
},doResizeColumn:function(_13fb,_13fc){
var isLtr=dojo._isBodyLtr();
if(isLtr){
var w=_13fb.w+_13fc.deltaX;
}else{
var w=_13fb.w-_13fc.deltaX;
}
if(w>=this.minColWidth){
for(var i=0,s,sw;(s=_13fb.spanners[i]);i++){
if(isLtr){
sw=s.width+_13fc.deltaX;
}else{
sw=s.width-_13fc.deltaX;
}
s.node.style.width=sw+"px";
_13fb.view.setColWidth(s.index,sw);
}
_13fb.node.style.width=w+"px";
_13fb.view.setColWidth(_13fb.index,w);
if(!isLtr){
_13fb.view.headerNode.scrollLeft=(_13fb.scrollLeft-_13fc.deltaX);
}
}
if(_13fb.view.flexCells&&!_13fb.view.testFlexCells()){
var t=dojox.grid.findTable(_13fb.node);
t&&(t.style.width="");
}
},endResizeColumn:function(_1403){
this.bogusClickTime=new Date().getTime()+30;
setTimeout(dojo.hitch(_1403.view,"update"),50);
}});
dojo.declare("dojox.grid.tableMap",null,{constructor:function(_1404){
this.mapRows(_1404);
},map:null,mapRows:function(_1405){
var _1406=_1405.length;
if(!_1406){
return;
}
this.map=[];
for(var j=0,row;(row=_1405[j]);j++){
this.map[j]=[];
}
for(var j=0,row;(row=_1405[j]);j++){
for(var i=0,x=0,cell,_140c,_140d;(cell=row[i]);i++){
while(this.map[j][x]){
x++;
}
this.map[j][x]={c:i,r:j};
_140d=cell.rowSpan||1;
_140c=cell.colSpan||1;
for(var y=0;y<_140d;y++){
for(var s=0;s<_140c;s++){
this.map[j+y][x+s]=this.map[j][x];
}
}
x+=_140c;
}
}
},dumpMap:function(){
for(var j=0,row,h="";(row=this.map[j]);j++,h=""){
for(var i=0,cell;(cell=row[i]);i++){
h+=cell.r+","+cell.c+"   ";
}
console.log(h);
}
},getMapCoords:function(inRow,inCol){
for(var j=0,row;(row=this.map[j]);j++){
for(var i=0,cell;(cell=row[i]);i++){
if(cell.c==inCol&&cell.r==inRow){
return {j:j,i:i};
}
}
}
return {j:-1,i:-1};
},getNode:function(_141b,inRow,inCol){
var row=_141b&&_141b.rows[inRow];
return row&&row.cells[inCol];
},_findOverlappingNodes:function(_141f,inRow,inCol){
var nodes=[];
var m=this.getMapCoords(inRow,inCol);
var row=this.map[m.j];
for(var j=0,row;(row=this.map[j]);j++){
if(j==m.j){
continue;
}
with(row[m.i]){
var n=this.getNode(_141f,r,c);
if(n){
nodes.push(n);
}
}
}
return nodes;
},findOverlappingNodes:function(_1427){
return this._findOverlappingNodes(dojox.grid.findTable(_1427),dojox.grid.getTrIndex(_1427.parentNode),dojox.grid.getTdIndex(_1427));
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
},setStructure:function(_1428){
var vs=this.structure=_1428;
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
},_getHeaderContent:function(_142e){
var n=_142e.name||_142e.grid.getCellName(_142e);
if(_142e.index!=_142e.grid.getSortIndex()){
return n;
}
return ["<div class=\"",_142e.grid.sortInfo>0?"dojoxGrid-sort-down":"dojoxGrid-sort-up","\"><div class=\"gridArrowButtonChar\">",_142e.grid.sortInfo>0?"&#9660;":"&#9650;","</div>",n,"</div>"].join("");
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
},renderRow:function(_1434,_1435){
var _1436=this.createRowNode(_1434);
this.buildRow(_1434,_1436,_1435);
this.grid.edit.restore(this,_1434);
return _1436;
},createRowNode:function(_1437){
var node=document.createElement("div");
node.className=this.classTag+"-row";
node[dojox.grid.gridViewTag]=this.id;
node[dojox.grid.rowIndexTag]=_1437;
this.rowNodes[_1437]=node;
return node;
},buildRow:function(_1439,_143a){
this.buildRowContent(_1439,_143a);
this.styleRow(_1439,_143a);
},buildRowContent:function(_143b,_143c){
_143c.innerHTML=this.content.generateHtml(_143b,_143b);
if(this.flexCells){
_143c.firstChild.style.width=this.contentWidth;
}
},rowRemoved:function(_143d){
this.grid.edit.save(this,_143d);
delete this.rowNodes[_143d];
},getRowNode:function(_143e){
return this.rowNodes[_143e];
},getCellNode:function(_143f,_1440){
var row=this.getRowNode(_143f);
if(row){
return this.content.getCellNode(row,_1440);
}
},styleRow:function(_1442,_1443){
_1443._style=dojox.grid.getStyleText(_1443);
this.styleRowNode(_1442,_1443);
},styleRowNode:function(_1444,_1445){
if(_1445){
this.doStyleRowNode(_1444,_1445);
}
},doStyleRowNode:function(_1446,_1447){
this.grid.styleRowNode(_1446,_1447);
},updateRow:function(_1448,_1449,_144a){
var _144b=this.getRowNode(_1448);
if(_144b){
_144b.style.height="";
this.buildRow(_1448,_144b);
}
return _144b;
},updateRowStyles:function(_144c){
this.styleRowNode(_144c,this.getRowNode(_144c));
},lastTop:0,firstScroll:0,doscroll:function(_144d){
var isLtr=dojo._isBodyLtr();
if(this.firstScroll<2){
if((!isLtr&&this.firstScroll==1)||(isLtr&&this.firstScroll==0)){
var s=dojo.marginBox(this.headerNodeContainer);
if(dojo.isIE){
this.headerNodeContainer.style.width=s.w+this.getScrollbarWidth()+"px";
}else{
if(dojo.isMoz){
this.headerNodeContainer.style.width=s.w-this.getScrollbarWidth()+"px";
if(isLtr){
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
},setScrollTop:function(inTop){
this.lastTop=inTop;
this.scrollboxNode.scrollTop=inTop;
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
},setColWidth:function(_1456,_1457){
this.grid.setCellWidth(_1456,_1457+"px");
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
dojo.declare("dojox.grid.views",null,{constructor:function(_1459){
this.grid=_1459;
},defaultWidth:200,views:[],resize:function(){
this.onEach("resize");
},render:function(){
this.onEach("render");
},addView:function(_145a){
_145a.idx=this.views.length;
this.views.push(_145a);
},destroyViews:function(){
for(var i=0,v;v=this.views[i];i++){
v.destroy();
}
this.views=[];
},getContentNodes:function(){
var nodes=[];
for(var i=0,v;v=this.views[i];i++){
nodes.push(v.contentNode);
}
return nodes;
},forEach:function(_1460){
for(var i=0,v;v=this.views[i];i++){
_1460(v,i);
}
},onEach:function(_1463,_1464){
_1464=_1464||[];
for(var i=0,v;v=this.views[i];i++){
if(_1463 in v){
v[_1463].apply(v,_1464);
}
}
},normalizeHeaderNodeHeight:function(){
var _1467=[];
for(var i=0,v;(v=this.views[i]);i++){
if(v.headerContentNode.firstChild){
_1467.push(v.headerContentNode);
}
}
this.normalizeRowNodeHeights(_1467);
},normalizeRowNodeHeights:function(_146a){
var h=0;
for(var i=0,n,o;(n=_146a[i]);i++){
h=Math.max(h,(n.firstChild.clientHeight)||(n.firstChild.offsetHeight));
}
h=(h>=0?h:0);
var hpx=h+"px";
for(var i=0,n;(n=_146a[i]);i++){
if(n.firstChild.clientHeight!=h){
n.firstChild.style.height=hpx;
}
}
if(_146a&&_146a[0]){
_146a[0].parentNode.offsetHeight;
}
},resetHeaderNodeHeight:function(){
for(var i=0,v,n;(v=this.views[i]);i++){
n=v.headerContentNode.firstChild;
if(n){
n.style.height="";
}
}
},renormalizeRow:function(_1473){
var _1474=[];
for(var i=0,v,n;(v=this.views[i])&&(n=v.getRowNode(_1473));i++){
n.firstChild.style.height="";
_1474.push(n);
}
this.normalizeRowNodeHeights(_1474);
},getViewWidth:function(_1478){
return this.views[_1478].getWidth()||this.defaultWidth;
},measureHeader:function(){
this.resetHeaderNodeHeight();
this.forEach(function(_1479){
_1479.headerContentNode.style.height="";
});
var h=0;
this.forEach(function(_147b){
h=Math.max(_147b.headerNode.offsetHeight,h);
});
return h;
},measureContent:function(){
var h=0;
this.forEach(function(_147d){
h=Math.max(_147d.domNode.offsetHeight,h);
});
return h;
},findClient:function(_147e){
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
var _1489=function(v,l){
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
_1489(v,l);
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
_1489(v,r);
}
if(c<len){
v=this.views[c];
vw=Math.max(1,r-l);
v.setSize(vw+"px",0);
_1489(v,l);
}
return l;
},renderRow:function(_148e,_148f){
var _1490=[];
for(var i=0,v,n,_1494;(v=this.views[i])&&(n=_148f[i]);i++){
_1494=v.renderRow(_148e);
n.appendChild(_1494);
_1490.push(_1494);
}
this.normalizeRowNodeHeights(_1490);
},rowRemoved:function(_1495){
this.onEach("rowRemoved",[_1495]);
},updateRow:function(_1496,_1497){
for(var i=0,v;v=this.views[i];i++){
v.updateRow(_1496,_1497);
}
this.renormalizeRow(_1496);
},updateRowStyles:function(_149a){
this.onEach("updateRowStyles",[_149a]);
},setScrollTop:function(inTop){
var top=inTop;
for(var i=0,v;v=this.views[i];i++){
top=v.setScrollTop(inTop);
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
dojo.declare("dojox.grid.cell",null,{styles:"",constructor:function(_14a1){
dojo.mixin(this,_14a1);
if(this.editor){
this.editor=new this.editor(this);
}
},format:function(_14a2){
var f,i=this.grid.edit.info,d=this.get?this.get(_14a2):this.value;
if(this.editor&&(this.editor.alwaysOn||(i.rowIndex==_14a2&&i.cell==this))){
return this.editor.format(d,_14a2);
}else{
return (f=this.formatter)?f.call(this,d,_14a2):d;
}
},getNode:function(_14a6){
return this.view.getCellNode(_14a6,this.index);
},isFlex:function(){
var uw=this.unitWidth;
return uw&&(uw=="auto"||uw.slice(-1)=="%");
},applyEdit:function(_14a8,_14a9){
this.grid.edit.applyCellEdit(_14a8,this,_14a9);
},cancelEdit:function(_14aa){
this.grid.doCancelEdit(_14aa);
},_onEditBlur:function(_14ab){
if(this.grid.edit.isEditCell(_14ab,this.index)){
this.grid.edit.apply();
}
},registerOnBlur:function(_14ac,_14ad){
if(this.commitOnBlur){
dojo.connect(_14ac,"onblur",function(e){
setTimeout(dojo.hitch(this,"_onEditBlur",_14ad),250);
});
}
}});
}
if(!dojo._hasResource["dojox.grid.compat._grid.layout"]){
dojo._hasResource["dojox.grid.compat._grid.layout"]=true;
dojo.provide("dojox.grid.compat._grid.layout");
dojo.declare("dojox.grid.layout",null,{constructor:function(_14af){
this.grid=_14af;
},cells:[],structure:null,defaultWidth:"6em",setStructure:function(_14b0){
this.fieldIndex=0;
this.cells=[];
var s=this.structure=[];
for(var i=0,_14b3,rows;(_14b3=_14b0[i]);i++){
s.push(this.addViewDef(_14b3));
}
this.cellCount=this.cells.length;
},addViewDef:function(inDef){
this._defaultCellProps=inDef.defaultCell||{};
return dojo.mixin({},inDef,{rows:this.addRowsDef(inDef.rows||inDef.cells)});
},addRowsDef:function(inDef){
var _14b7=[];
for(var i=0,row;inDef&&(row=inDef[i]);i++){
_14b7.push(this.addRowDef(i,row));
}
return _14b7;
},addRowDef:function(_14ba,inDef){
var _14bc=[];
for(var i=0,def,cell;(def=inDef[i]);i++){
cell=this.addCellDef(_14ba,i,def);
_14bc.push(cell);
this.cells.push(cell);
}
return _14bc;
},addCellDef:function(_14c0,_14c1,inDef){
var w=0;
if(inDef.colSpan>1){
w=0;
}else{
if(!isNaN(inDef.width)){
w=inDef.width+"em";
}else{
w=inDef.width||this.defaultWidth;
}
}
var _14c4=inDef.field!=undefined?inDef.field:(inDef.get?-1:this.fieldIndex);
if((inDef.field!=undefined)||!inDef.get){
this.fieldIndex=(inDef.field>-1?inDef.field:this.fieldIndex)+1;
}
return new dojox.grid.cell(dojo.mixin({},this._defaultCellProps,inDef,{grid:this.grid,subrow:_14c0,layoutIndex:_14c1,index:this.cells.length,fieldIndex:_14c4,unitWidth:w}));
}});
}
if(!dojo._hasResource["dojox.grid.compat._grid.rows"]){
dojo._hasResource["dojox.grid.compat._grid.rows"]=true;
dojo.provide("dojox.grid.compat._grid.rows");
dojo.declare("dojox.grid.rows",null,{constructor:function(_14c5){
this.grid=_14c5;
},linesToEms:2,defaultRowHeight:1,overRow:-2,getHeight:function(_14c6){
return "";
},getDefaultHeightPx:function(){
return 32;
},prepareStylingRow:function(_14c7,_14c8){
return {index:_14c7,node:_14c8,odd:Boolean(_14c7&1),selected:this.grid.selection.isSelected(_14c7),over:this.isOver(_14c7),customStyles:"",customClasses:"dojoxGrid-row"};
},styleRowNode:function(_14c9,_14ca){
var row=this.prepareStylingRow(_14c9,_14ca);
this.grid.onStyleRow(row);
this.applyStyles(row);
},applyStyles:function(inRow){
with(inRow){
node.className=customClasses;
var h=node.style.height;
dojox.grid.setStyleText(node,customStyles+";"+(node._style||""));
node.style.height=h;
}
},updateStyles:function(_14ce){
this.grid.updateRowStyles(_14ce);
},setOverRow:function(_14cf){
var last=this.overRow;
this.overRow=_14cf;
if((last!=this.overRow)&&(last>=0)){
this.updateStyles(last);
}
this.updateStyles(this.overRow);
},isOver:function(_14d1){
return (this.overRow==_14d1);
}});
}
if(!dojo._hasResource["dojox.grid.compat._grid.focus"]){
dojo._hasResource["dojox.grid.compat._grid.focus"]=true;
dojo.provide("dojox.grid.compat._grid.focus");
dojo.declare("dojox.grid.focus",null,{constructor:function(_14d2){
this.grid=_14d2;
this.cell=null;
this.rowIndex=-1;
dojo.connect(this.grid.domNode,"onfocus",this,"doFocus");
},tabbingOut:false,focusClass:"dojoxGrid-cell-focus",focusView:null,initFocusView:function(){
this.focusView=this.grid.views.getFirstScrollingView();
},isFocusCell:function(_14d3,_14d4){
return (this.cell==_14d3)&&(this.rowIndex==_14d4);
},isLastFocusCell:function(){
return (this.rowIndex==this.grid.rowCount-1)&&(this.cell.index==this.grid.layout.cellCount-1);
},isFirstFocusCell:function(){
return (this.rowIndex==0)&&(this.cell.index==0);
},isNoFocusCell:function(){
return (this.rowIndex<0)||!this.cell;
},_focusifyCellNode:function(_14d5){
var n=this.cell&&this.cell.getNode(this.rowIndex);
if(n){
dojo.toggleClass(n,this.focusClass,_14d5);
if(_14d5){
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
},styleRow:function(inRow){
return;
},setFocusIndex:function(_14de,_14df){
this.setFocusCell(this.grid.getCell(_14df),_14de);
},setFocusCell:function(_14e0,_14e1){
if(_14e0&&!this.isFocusCell(_14e0,_14e1)){
this.tabbingOut=false;
this.focusGridView();
this._focusifyCellNode(false);
this.cell=_14e0;
this.rowIndex=_14e1;
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
},move:function(_14e8,_14e9){
var rc=this.grid.rowCount-1,cc=this.grid.layout.cellCount-1,r=this.rowIndex,i=this.cell.index,row=Math.min(rc,Math.max(0,r+_14e8)),col=Math.min(cc,Math.max(0,i+_14e9));
this.setFocusIndex(row,col);
if(_14e8){
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
},tabOut:function(_14f2){
this.tabbingOut=true;
_14f2.focus();
},focusGridView:function(){
dojox.grid.fire(this.focusView,"focus");
},focusGrid:function(_14f3){
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
dojo.declare("dojox.grid.selection",null,{constructor:function(_14f5){
this.grid=_14f5;
this.selected=[];
},multiSelect:true,selected:null,updating:0,selectedIndex:-1,onCanSelect:function(_14f6){
return this.grid.onCanSelect(_14f6);
},onCanDeselect:function(_14f7){
return this.grid.onCanDeselect(_14f7);
},onSelected:function(_14f8){
return this.grid.onSelected(_14f8);
},onDeselected:function(_14f9){
return this.grid.onDeselected(_14f9);
},onChanging:function(){
},onChanged:function(){
return this.grid.onSelectionChanged();
},isSelected:function(_14fa){
return this.selected[_14fa];
},getFirstSelected:function(){
for(var i=0,l=this.selected.length;i<l;i++){
if(this.selected[i]){
return i;
}
}
return -1;
},getNextSelected:function(_14fd){
for(var i=_14fd+1,l=this.selected.length;i<l;i++){
if(this.selected[i]){
return i;
}
}
return -1;
},getSelected:function(){
var _1500=[];
for(var i=0,l=this.selected.length;i<l;i++){
if(this.selected[i]){
_1500.push(i);
}
}
return _1500;
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
},select:function(_1505){
this.unselectAll(_1505);
this.addToSelection(_1505);
},addToSelection:function(_1506){
_1506=Number(_1506);
if(this.selected[_1506]){
this.selectedIndex=_1506;
}else{
if(this.onCanSelect(_1506)!==false){
this.selectedIndex=_1506;
this.beginUpdate();
this.selected[_1506]=true;
this.grid.onSelected(_1506);
this.endUpdate();
}
}
},deselect:function(_1507){
_1507=Number(_1507);
if(this.selectedIndex==_1507){
this.selectedIndex=-1;
}
if(this.selected[_1507]){
if(this.onCanDeselect(_1507)===false){
return;
}
this.beginUpdate();
delete this.selected[_1507];
this.grid.onDeselected(_1507);
this.endUpdate();
}
},setSelected:function(_1508,_1509){
this[(_1509?"addToSelection":"deselect")](_1508);
},toggleSelect:function(_150a){
this.setSelected(_150a,!this.selected[_150a]);
},insert:function(_150b){
this.selected.splice(_150b,0,false);
if(this.selectedIndex>=_150b){
this.selectedIndex++;
}
},remove:function(_150c){
this.selected.splice(_150c,1);
if(this.selectedIndex>=_150c){
this.selectedIndex--;
}
},unselectAll:function(_150d){
for(var i in this.selected){
if((i!=_150d)&&(this.selected[i]===true)){
this.deselect(i);
}
}
},shiftSelect:function(_150f,inTo){
var s=(_150f>=0?_150f:inTo),e=inTo;
if(s>e){
e=s;
s=inTo;
}
for(var i=s;i<=e;i++){
this.addToSelection(i);
}
},clickSelect:function(_1514,_1515,_1516){
this.beginUpdate();
if(!this.multiSelect){
this.select(_1514);
}else{
var _1517=this.selectedIndex;
if(!_1515){
this.unselectAll(_1514);
}
if(_1516){
this.shiftSelect(_1517,_1514);
}else{
if(_1515){
this.toggleSelect(_1514);
}else{
this.addToSelection(_1514);
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
dojo.declare("dojox.grid.edit",null,{constructor:function(_1519){
this.grid=_1519;
this.connections=[];
if(dojo.isIE){
this.connections.push(dojo.connect(document.body,"onfocus",dojo.hitch(this,"_boomerangFocus")));
}
},info:{},destroy:function(){
dojo.forEach(this.connections,dojo.disconnect);
},cellFocus:function(_151a,_151b){
if(this.grid.singleClickEdit||this.isEditRow(_151b)){
this.setEditCell(_151a,_151b);
}else{
this.apply();
}
if(this.isEditing()||(_151a&&(_151a.editor||0).alwaysOn)){
this._focusEditor(_151a,_151b);
}
},rowClick:function(e){
if(this.isEditing()&&!this.isEditRow(e.rowIndex)){
this.apply();
}
},styleRow:function(inRow){
if(inRow.index==this.info.rowIndex){
inRow.customClasses+=" dojoxGrid-row-editing";
}
},dispatchEvent:function(e){
var c=e.cell,ed=c&&c.editor;
return ed&&ed.dispatchEvent(e.dispatch,e);
},isEditing:function(){
return this.info.rowIndex!==undefined;
},isEditCell:function(_1521,_1522){
return (this.info.rowIndex===_1521)&&(this.info.cell.index==_1522);
},isEditRow:function(_1523){
return this.info.rowIndex===_1523;
},setEditCell:function(_1524,_1525){
if(!this.isEditCell(_1525,_1524.index)&&this.grid.canEdit(_1524,_1525)){
this.start(_1524,_1525,this.isEditRow(_1525)||_1524.editor);
}
},_focusEditor:function(_1526,_1527){
dojox.grid.fire(_1526.editor,"focus",[_1527]);
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
},start:function(_1528,_1529,_152a){
this.grid.beginUpdate();
this.editorApply();
if(this.isEditing()&&!this.isEditRow(_1529)){
this.applyRowEdit();
this.grid.updateRow(_1529);
}
if(_152a){
this.info={cell:_1528,rowIndex:_1529};
this.grid.doStartEdit(_1528,_1529);
this.grid.updateRow(_1529);
}else{
this.info={};
}
this.grid.endUpdate();
this.grid.focus.focusGrid();
this._focusEditor(_1528,_1529);
this._doCatchBoomerang();
},_editorDo:function(_152b){
var c=this.info.cell;
c&&c.editor&&c.editor[_152b](this.info.rowIndex);
},editorApply:function(){
this._editorDo("apply");
},editorCancel:function(){
this._editorDo("cancel");
},applyCellEdit:function(_152d,_152e,_152f){
if(this.grid.canEdit(_152e,_152f)){
this.grid.doApplyCellEdit(_152d,_152f,_152e.fieldIndex);
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
},save:function(_1530,_1531){
var c=this.info.cell;
if(this.isEditRow(_1530)&&(!_1531||c.view==_1531)&&c.editor){
c.editor.save(c,this.info.rowIndex);
}
},restore:function(_1533,_1534){
var c=this.info.cell;
if(this.isEditRow(_1534)&&c.view==_1533&&c.editor){
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
},buildRowContent:function(_1536,_1537){
var w=this.contentNode.offsetWidth-this.padBorderWidth;
_1537.innerHTML="<table style=\"width:"+w+"px;\" role=\"wairole:presentation\"><tr><td class=\"dojoxGrid-rowbar-inner\"></td></tr></table>";
},renderHeader:function(){
},resize:function(){
this.adaptHeight();
},adaptWidth:function(){
},doStyleRowNode:function(_1539,_153a){
var n=["dojoxGrid-rowbar"];
if(this.grid.rows.isOver(_1539)){
n.push("dojoxGrid-rowbar-over");
}
if(this.grid.selection.isSelected(_1539)){
n.push("dojoxGrid-rowbar-selected");
}
_153a.className=n.join(" ");
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
},onStyleRow:function(inRow){
with(inRow){
customClasses+=(odd?" dojoxGrid-row-odd":"")+(selected?" dojoxGrid-row-selected":"")+(over?" dojoxGrid-row-over":"");
}
this.focus.styleRow(inRow);
this.edit.styleRow(inRow);
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
var _1544=this.edit.isEditing();
this.edit.apply();
if(!_1544){
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
var _1545=(e.keyCode==dk.LEFT_ARROW)?1:-1;
if(dojo._isBodyLtr()){
_1545*=-1;
}
this.focus.move(0,_1545);
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
},onCellFocus:function(_1552,_1553){
this.edit.cellFocus(_1552,_1553);
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
},onStartEdit:function(_1565,_1566){
},onApplyCellEdit:function(_1567,_1568,_1569){
},onCancelEdit:function(_156a){
},onApplyEdit:function(_156b){
},onCanSelect:function(_156c){
return true;
},onCanDeselect:function(_156d){
return true;
},onSelected:function(_156e){
this.updateRowStyles(_156e);
},onDeselected:function(_156f){
this.updateRowStyles(_156f);
},onSelectionChanged:function(){
}};
}
if(!dojo._hasResource["dojox.grid.compat.VirtualGrid"]){
dojo._hasResource["dojox.grid.compat.VirtualGrid"]=true;
dojo.provide("dojox.grid.compat.VirtualGrid");
dojo.declare("dojox.VirtualGrid",[dijit._Widget,dijit._Templated],{templateString:"<div class=\"dojoxGrid\" hidefocus=\"hidefocus\" role=\"wairole:grid\">\r\n\t<div class=\"dojoxGrid-master-header\" dojoAttachPoint=\"viewsHeaderNode\"></div>\r\n\t<div class=\"dojoxGrid-master-view\" dojoAttachPoint=\"viewsNode\"></div>\r\n\t<span dojoAttachPoint=\"lastFocusNode\" tabindex=\"0\"></span>\r\n</div>\r\n",classTag:"dojoxGrid",get:function(_1570){
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
},createView:function(_1572){
if(dojo.isAIR){
var obj=window;
var names=_1572.split(".");
for(var i=0;i<names.length;i++){
if(typeof obj[names[i]]=="undefined"){
var _1576=names[0];
for(var j=1;j<=i;j++){
_1576+="."+names[j];
}
throw new Error(_1576+" is undefined");
}
obj=obj[names[i]];
}
var c=obj;
}else{
var c=eval(_1572);
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
},setStructure:function(_157c){
this.views.destroyViews();
this.structure=_157c;
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
},resize:function(_157d){
this._sizeBox=_157d;
this._resize();
this.sizeChange();
},_getPadBorder:function(){
this._padBorder=this._padBorder||dojo._getPadBorderExtents(this.domNode);
return this._padBorder;
},_resize:function(){
if(!this.domNode.parentNode||this.domNode.parentNode.nodeType!=1||!this.hasLayout()){
return;
}
var _157e=this._getPadBorder();
if(this.autoHeight){
this.domNode.style.height="auto";
this.viewsNode.style.height="";
}else{
if(this.flex>0){
}else{
if(this.domNode.clientHeight<=_157e.h){
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
},renderRow:function(_1584,_1585){
this.views.renderRow(_1584,_1585);
},rowRemoved:function(_1586){
this.views.rowRemoved(_1586);
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
},updateRow:function(_1588){
_1588=Number(_1588);
if(this.updating){
this.invalidated.rows[_1588]=true;
}else{
this.views.updateRow(_1588,this.rows.getHeight(_1588));
this.scroller.rowHeightChanged(_1588);
}
},updateRowCount:function(_1589){
if(this.updating){
this.invalidated.rowCount=_1589;
}else{
this.rowCount=_1589;
if(this.layout.cells.length){
this.scroller.updateRowCount(_1589);
this.setScrollTop(this.scrollTop);
}
this._resize();
}
},updateRowStyles:function(_158a){
this.views.updateRowStyles(_158a);
},rowHeightChanged:function(_158b){
this.views.renormalizeRow(_158b);
this.scroller.rowHeightChanged(_158b);
},fastScroll:true,delayScroll:false,scrollRedrawThreshold:(dojo.isIE?100:50),scrollTo:function(inTop){
if(!this.fastScroll){
this.setScrollTop(inTop);
return;
}
var delta=Math.abs(this.lastScrollTop-inTop);
this.lastScrollTop=inTop;
if(delta>this.scrollRedrawThreshold||this.delayScroll){
this.delayScroll=true;
this.scrollTop=inTop;
this.views.setScrollTop(inTop);
dojox.grid.jobs.job("dojoxGrid-scroll",200,dojo.hitch(this,"finishScrollJob"));
}else{
this.setScrollTop(inTop);
}
},finishScrollJob:function(){
this.delayScroll=false;
this.setScrollTop(this.scrollTop);
},setScrollTop:function(inTop){
this.scrollTop=this.views.setScrollTop(inTop);
this.scroller.scroll(this.scrollTop);
},scrollToRow:function(_158f){
this.setScrollTop(this.scroller.findScrollTop(_158f)+1);
},styleRowNode:function(_1590,_1591){
if(_1591){
this.rows.styleRowNode(_1590,_1591);
}
},getCell:function(_1592){
return this.layout.cells[_1592];
},setCellWidth:function(_1593,_1594){
this.getCell(_1593).unitWidth=_1594;
},getCellName:function(_1595){
return "Cell "+_1595.index;
},canSort:function(_1596){
},sort:function(){
},getSortAsc:function(_1597){
_1597=_1597==undefined?this.sortInfo:_1597;
return Boolean(_1597>0);
},getSortIndex:function(_1598){
_1598=_1598==undefined?this.sortInfo:_1598;
return Math.abs(_1598)-1;
},setSortIndex:function(_1599,inAsc){
var si=_1599+1;
if(inAsc!=undefined){
si*=(inAsc?1:-1);
}else{
if(this.getSortIndex()==_1599){
si=-this.sortInfo;
}
}
this.setSortInfo(si);
},setSortInfo:function(_159c){
if(this.canSort(_159c)){
this.sortInfo=_159c;
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
},doStartEdit:function(_15aa,_15ab){
this.onStartEdit(_15aa,_15ab);
},doApplyCellEdit:function(_15ac,_15ad,_15ae){
this.onApplyCellEdit(_15ac,_15ad,_15ae);
},doCancelEdit:function(_15af){
this.onCancelEdit(_15af);
},doApplyEdit:function(_15b0){
this.onApplyEdit(_15b0);
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
},build:function(_15b1){
var _15b2=dojo.mixin({owner:this},this.defaultValue);
_15b2.key=_15b1;
this.values[_15b1]=_15b2;
return _15b2;
},getDefault:function(){
return this.defaultValue;
},setDefault:function(_15b3){
for(var i=0,a;(a=arguments[i]);i++){
dojo.mixin(this.defaultValue,a);
}
},get:function(_15b6){
return this.values[_15b6]||this.build(_15b6);
},_set:function(_15b7,_15b8){
var v=this.get(_15b7);
for(var i=1;i<arguments.length;i++){
dojo.mixin(v,arguments[i]);
}
this.values[_15b7]=v;
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
},insert:function(_15be,_15bf){
if(_15be>=this.values.length){
this.values[_15be]=_15bf;
}else{
this.values.splice(_15be,0,_15bf);
}
},remove:function(_15c0){
this.values.splice(_15c0,1);
},swap:function(_15c1,_15c2){
dojox.grid.arraySwap(this.values,_15c1,_15c2);
},move:function(_15c3,_15c4){
dojox.grid.arrayMove(this.values,_15c3,_15c4);
}});
dojox.grid.data.compare=function(a,b){
return (a>b?1:(a==b?0:-1));
};
dojo.declare("dojox.grid.data.Field",null,{constructor:function(_15c7){
this.name=_15c7;
this.compare=dojox.grid.data.compare;
},na:dojox.grid.na});
dojo.declare("dojox.grid.data.Fields",dojox.grid.data.Mixer,{constructor:function(_15c8){
var _15c9=_15c8?_15c8:dojox.grid.data.Field;
this.defaultValue=new _15c9();
},indexOf:function(inKey){
for(var i=0;i<this.values.length;i++){
var v=this.values[i];
if(v&&v.key==inKey){
return i;
}
}
return -1;
}});
}
if(!dojo._hasResource["dojox.grid.compat._data.model"]){
dojo._hasResource["dojox.grid.compat._data.model"]=true;
dojo.provide("dojox.grid.compat._data.model");
dojo.declare("dojox.grid.data.Model",null,{constructor:function(_15cd,_15ce){
this.observers=[];
this.fields=new dojox.grid.data.Fields();
if(_15cd){
this.fields.set(_15cd);
}
this.setData(_15ce);
},count:0,updating:0,observer:function(_15cf,_15d0){
this.observers.push({o:_15cf,p:_15d0||"model"});
},notObserver:function(_15d1){
for(var i=0,m,o;(o=this.observers[i]);i++){
if(o.o==_15d1){
this.observers.splice(i,1);
return;
}
}
},notify:function(inMsg,_15d6){
var a=_15d6||[];
for(var i=0,m,o;(o=this.observers[i]);i++){
m=o.p+inMsg;
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
},insert:function(_15db){
if(!this._insert.apply(this,arguments)){
return false;
}
this.insertion.apply(this,dojo._toArray(arguments,1));
return true;
},remove:function(_15dc){
if(!this._remove.apply(this,arguments)){
return false;
}
this.removal.apply(this,arguments);
return true;
},canSort:function(){
return this.sort!=null;
},generateComparator:function(_15dd,_15de,_15df,_15e0){
return function(a,b){
var ineq=_15dd(a[_15de],b[_15de]);
return ineq?(_15df?ineq:-ineq):_15e0&&_15e0(a,b);
};
},makeComparator:function(_15e4){
var idx,col,field,_15e8=null;
for(var i=_15e4.length-1;i>=0;i--){
idx=_15e4[i];
col=Math.abs(idx)-1;
if(col>=0){
field=this.fields.get(col);
_15e8=this.generateComparator(field.compare,field.key,idx>0,_15e8);
}
}
return _15e8;
},sort:null,dummy:0});
dojo.declare("dojox.grid.data.Rows",dojox.grid.data.Model,{allChange:function(){
this.notify("AllChange",arguments);
this.notify("Change",arguments);
},rowChange:function(){
this.notify("RowChange",arguments);
},datumChange:function(){
this.notify("DatumChange",arguments);
},beginModifyRow:function(_15ea){
if(!this.cache[_15ea]){
this.cache[_15ea]=this.copyRow(_15ea);
}
},endModifyRow:function(_15eb){
var cache=this.cache[_15eb];
if(cache){
var data=this.getRow(_15eb);
if(!dojox.grid.arrayCompare(cache,data)){
this.update(cache,data,_15eb);
}
delete this.cache[_15eb];
}
},cancelModifyRow:function(_15ee){
var cache=this.cache[_15ee];
if(cache){
this.setRow(cache,_15ee);
delete this.cache[_15ee];
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
},badIndex:function(_15f0,_15f1){
console.debug("dojox.grid.data.Table: badIndex");
},isGoodIndex:function(_15f2,_15f3){
return (_15f2>=0&&_15f2<this.count&&(arguments.length<2||(_15f3>=0&&_15f3<this.colCount)));
},getRow:function(_15f4){
return this.data[_15f4];
},copyRow:function(_15f5){
return this.getRow(_15f5).slice(0);
},getDatum:function(_15f6,_15f7){
return this.data[_15f6][_15f7];
},get:function(){
throw ("Plain \"get\" no longer supported. Use \"getRow\" or \"getDatum\".");
},setData:function(_15f8){
this.data=(_15f8||[]);
this.allChange();
},setRow:function(_15f9,_15fa){
this.data[_15fa]=_15f9;
this.rowChange(_15f9,_15fa);
this.change();
},setDatum:function(_15fb,_15fc,_15fd){
this.data[_15fc][_15fd]=_15fb;
this.datumChange(_15fb,_15fc,_15fd);
},set:function(){
throw ("Plain \"set\" no longer supported. Use \"setData\", \"setRow\", or \"setDatum\".");
},setRows:function(_15fe,_15ff){
for(var i=0,l=_15fe.length,r=_15ff;i<l;i++,r++){
this.setRow(_15fe[i],r);
}
},update:function(_1603,_1604,_1605){
return true;
},_insert:function(_1606,_1607){
dojox.grid.arrayInsert(this.data,_1607,_1606);
this.count++;
return true;
},_remove:function(_1608){
for(var i=_1608.length-1;i>=0;i--){
dojox.grid.arrayRemove(this.data,_1608[i]);
}
this.count-=_1608.length;
return true;
},sort:function(){
this.data.sort(this.makeComparator(arguments));
},swap:function(_160a,_160b){
dojox.grid.arraySwap(this.data,_160a,_160b);
this.rowChange(this.getRow(_160a),_160a);
this.rowChange(this.getRow(_160b),_160b);
this.change();
},dummy:0});
dojo.declare("dojox.grid.data.Objects",dojox.grid.data.Table,{constructor:function(_160c,_160d,inKey){
if(!_160c){
this.autoAssignFields();
}
},allChange:function(){
this.notify("FieldsChange");
this.inherited(arguments);
},autoAssignFields:function(){
var d=this.data[0],i=0,field;
for(var f in d){
field=this.fields.get(i++);
if(!dojo.isString(field.key)){
field.key=f;
}
}
},setData:function(_1613){
this.data=(_1613||[]);
this.autoAssignFields();
this.allChange();
},getDatum:function(_1614,_1615){
return this.data[_1614][this.fields.get(_1615).key];
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
},setRowCount:function(_1616){
this.count=_1616;
this.change();
},requestsPending:function(_1617){
},rowToPage:function(_1618){
return (this.rowsPerPage?Math.floor(_1618/this.rowsPerPage):_1618);
},pageToRow:function(_1619){
return (this.rowsPerPage?this.rowsPerPage*_1619:_1619);
},requestRows:function(_161a,_161b){
},rowsProvided:function(_161c,_161d){
this.requests--;
if(this.requests==0){
this.requestsPending(false);
}
},requestPage:function(_161e){
var row=this.pageToRow(_161e);
var count=Math.min(this.rowsPerPage,this.count-row);
if(count>0){
this.requests++;
this.requestsPending(true);
setTimeout(dojo.hitch(this,"requestRows",row,count),1);
}
},needPage:function(_1621){
if(!this.pages[_1621]){
this.pages[_1621]=true;
this.requestPage(_1621);
}
},preparePage:function(_1622,_1623){
if(_1622<this.bop||_1622>=this.eop){
var _1624=this.rowToPage(_1622);
this.needPage(_1624);
this.bop=_1624*this.rowsPerPage;
this.eop=this.bop+(this.rowsPerPage||this.count);
}
},isRowLoaded:function(_1625){
return Boolean(this.data[_1625]);
},removePages:function(_1626){
for(var i=0,r;((r=_1626[i])!=undefined);i++){
this.pages[this.rowToPage(r)]=false;
}
this.bop=this.eop=-1;
},remove:function(_1629){
this.removePages(_1629);
dojox.grid.data.Table.prototype.remove.apply(this,arguments);
},getRow:function(_162a){
var row=this.data[_162a];
if(!row){
this.preparePage(_162a);
}
return row;
},getDatum:function(_162c,_162d){
var row=this.getRow(_162c);
return (row?row[_162d]:this.fields.get(_162d).na);
},setDatum:function(_162f,_1630,_1631){
var row=this.getRow(_1630);
if(row){
row[_1631]=_162f;
this.datumChange(_162f,_1630,_1631);
}else{
console.debug("["+this.declaredClass+"] dojox.grid.data.dynamic.set: cannot set data on an non-loaded row");
}
},canSort:function(){
return false;
}});
dojox.grid.data.table=dojox.grid.data.Table;
dojox.grid.data.dynamic=dojox.grid.data.Dynamic;
dojo.declare("dojox.grid.data.DojoData",dojox.grid.data.Dynamic,{constructor:function(_1633,_1634,args){
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
},query:{name:"*"},store:null,_currentlyProcessing:null,_canNotify:false,_canWrite:false,_canIdentify:false,_rowIdentities:{},clientSort:false,sortFields:null,queryOptions:null,setData:function(_1639){
this.store=_1639;
this.data=[];
this.allChange();
},setRowCount:function(_163a){
this.count=_163a;
this.allChange();
},beginReturn:function(_163b){
if(this.count!=_163b){
this.setRowCount(_163b);
}
},_setupFields:function(_163c){
if(this.fields._nameMaps){
return;
}
var m={};
var _163e=dojo.map(this.store.getAttributes(_163c),function(item,idx){
m[item]=idx;
m[idx+".idx"]=item;
return {name:item,key:item};
},this);
this.fields._nameMaps=m;
this.fields.set(_163e);
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
},processRows:function(items,_1646){
if(!items||items.length==0){
return;
}
this._setupFields(items[0]);
dojo.forEach(items,function(item,idx){
var row=this._createRow(item);
this._setRowId(item,_1646.start,idx);
this.setRow(row,_1646.start+idx);
},this);
this.endUpdate();
},requestRows:function(_164a,_164b){
this.beginUpdate();
var row=_164a||0;
var _164d={start:row,count:this.rowsPerPage,query:this.query,sort:this.sortFields,queryOptions:this.queryOptions,onBegin:dojo.hitch(this,"beginReturn"),onComplete:dojo.hitch(this,"processRows"),onError:dojo.hitch(this,"processError")};
this.store.fetch(_164d);
},getDatum:function(_164e,_164f){
var row=this.getRow(_164e);
var field=this.fields.values[_164f];
return row&&field?row[field.name]:field?field.na:"?";
},setDatum:function(_1652,_1653,_1654){
var n=this.fields._nameMaps[_1654+".idx"];
if(n){
this.data[_1653][n]=_1652;
this.datumChange(_1652,_1653,_1654);
}
},copyRow:function(_1656){
var row={};
var _1658={};
var src=this.getRow(_1656);
for(var x in src){
if(src[x]!=_1658[x]){
row[x]=src[x];
}
}
return row;
},_attrCompare:function(cache,data){
dojo.forEach(this.fields.values,function(a){
if(cache[a.name]!=data[a.name]){
return false;
}
},this);
return true;
},endModifyRow:function(_165e){
var cache=this.cache[_165e];
if(cache){
var data=this.getRow(_165e);
if(!this._attrCompare(cache,data)){
this.update(cache,data,_165e);
}
delete this.cache[_165e];
}
},cancelModifyRow:function(_1661){
var cache=this.cache[_1661];
if(cache){
this.setRow(cache,_1661);
delete this.cache[_1661];
}
},_setRowId:function(item,_1664,idx){
if(this._canIdentify){
this._rowIdentities[this.store.getIdentity(item)]={rowId:_1664+idx,item:item};
}else{
var _1666=dojo.toJson(this.query)+":start:"+_1664+":idx:"+idx+":sort:"+dojo.toJson(this.sortFields);
this._rowIdentities[_1666]={rowId:_1664+idx,item:item};
}
},_getRowId:function(item,_1668){
var rowId=null;
if(this._canIdentify&&!_1668){
var _166a=this._rowIdentities[this.store.getIdentity(item)];
if(_166a){
rowId=_166a.rowId;
}
}else{
var id;
for(id in this._rowIdentities){
if(this._rowIdentities[id].item===item){
rowId=this._rowIdentities[id].rowId;
break;
}
}
}
return rowId;
},_storeDatumChange:function(item,attr,_166e,_166f){
var rowId=this._getRowId(item);
var row=this.getRow(rowId);
if(row){
row[attr]=_166f;
var colId=this.fields._nameMaps[attr];
this.notify("DatumChange",[_166f,rowId,colId]);
}
},_storeDatumDelete:function(item){
if(dojo.indexOf(this._currentlyProcessing,item)!=-1){
return;
}
var rowId=this._getRowId(item,true);
if(rowId!=null){
this._removeItems([rowId]);
}
},_storeDatumNew:function(item){
if(this._disableNew){
return;
}
this._insertItem(item,this.data.length);
},insert:function(item,index){
this._disableNew=true;
var i=this.store.newItem(item);
this._disableNew=false;
this._insertItem(i,index);
},_insertItem:function(_1679,index){
if(!this.fields._nameMaps){
this._setupFields(_1679);
}
var row=this._createRow(_1679);
for(var i in this._rowIdentities){
var _167d=this._rowIdentities[i];
if(_167d.rowId>=index){
_167d.rowId++;
}
}
this._setRowId(_1679,0,index);
dojox.grid.data.Dynamic.prototype.insert.apply(this,[row,index]);
},datumChange:function(value,_167f,_1680){
if(this._canWrite){
var row=this.getRow(_167f);
var field=this.fields._nameMaps[_1680+".idx"];
this.store.setValue(row.__dojo_data_item,field,value);
}else{
this.notify("DatumChange",arguments);
}
},insertion:function(){
this.notify("Insertion",arguments);
this.notify("Change",arguments);
},removal:function(){
this.notify("Removal",arguments);
this.notify("Change",arguments);
},remove:function(_1683){
for(var i=_1683.length-1;i>=0;i--){
var item=this.data[_1683[i]].__dojo_data_item;
this._currentlyProcessing.push(item);
this.store.deleteItem(item);
}
this._removeItems(_1683);
this._currentlyProcessing=[];
},_removeItems:function(_1686){
dojox.grid.data.Dynamic.prototype.remove.apply(this,arguments);
this._rowIdentities={};
for(var i=0;i<this.data.length;i++){
this._setRowId(this.data[i].__dojo_data_item,0,i);
}
},canSort:function(){
return true;
},sort:function(_1688){
var col=Math.abs(_1688)-1;
this.sortFields=[{"attribute":this.fields.values[col].name,"descending":(_1688>0)}];
this.refresh();
},refresh:function(){
this.clearData(true);
this.requestRows();
},clearData:function(_168a){
this._rowIdentities={};
this.pages=[];
this.bop=this.eop=-1;
this.count=0;
this.setData((_168a?this.store:[]));
},processError:function(error,_168c){
console.log(error);
}});
}
if(!dojo._hasResource["dojox.grid.compat._data.editors"]){
dojo._hasResource["dojox.grid.compat._data.editors"]=true;
dojo.provide("dojox.grid.compat._data.editors");
dojo.provide("dojox.grid.compat.editors");
dojo.declare("dojox.grid.editors.Base",null,{constructor:function(_168d){
this.cell=_168d;
},_valueProp:"value",_formatPending:false,format:function(_168e,_168f){
},needFormatNode:function(_1690,_1691){
this._formatPending=true;
dojox.grid.whenIdle(this,"_formatNode",_1690,_1691);
},cancelFormatNode:function(){
this._formatPending=false;
},_formatNode:function(_1692,_1693){
if(this._formatPending){
this._formatPending=false;
dojo.setSelectable(this.cell.grid.domNode,true);
this.formatNode(this.getNode(_1693),_1692,_1693);
}
},getNode:function(_1694){
return (this.cell.getNode(_1694)||0).firstChild||0;
},formatNode:function(_1695,_1696,_1697){
if(dojo.isIE){
dojox.grid.whenIdle(this,"focus",_1697,_1695);
}else{
this.focus(_1697,_1695);
}
},dispatchEvent:function(m,e){
if(m in this){
return this[m](e);
}
},getValue:function(_169a){
return this.getNode(_169a)[this._valueProp];
},setValue:function(_169b,_169c){
var n=this.getNode(_169b);
if(n){
n[this._valueProp]=_169c;
}
},focus:function(_169e,_169f){
dojox.grid.focusSelectNode(_169f||this.getNode(_169e));
},save:function(_16a0){
this.value=this.value||this.getValue(_16a0);
},restore:function(_16a1){
this.setValue(_16a1,this.value);
},_finish:function(_16a2){
dojo.setSelectable(this.cell.grid.domNode,false);
this.cancelFormatNode(this.cell);
},apply:function(_16a3){
this.cell.applyEdit(this.getValue(_16a3),_16a3);
this._finish(_16a3);
},cancel:function(_16a4){
this.cell.cancelEdit(_16a4);
this._finish(_16a4);
}});
dojox.grid.editors.base=dojox.grid.editors.Base;
dojo.declare("dojox.grid.editors.Input",dojox.grid.editors.Base,{constructor:function(_16a5){
this.keyFilter=this.keyFilter||this.cell.keyFilter;
},keyFilter:null,format:function(_16a6,_16a7){
this.needFormatNode(_16a6,_16a7);
return "<input class=\"dojoxGrid-input\" type=\"text\" value=\""+_16a6+"\">";
},formatNode:function(_16a8,_16a9,_16aa){
this.inherited(arguments);
this.cell.registerOnBlur(_16a8,_16aa);
},doKey:function(e){
if(this.keyFilter){
var key=String.fromCharCode(e.charCode);
if(key.search(this.keyFilter)==-1){
dojo.stopEvent(e);
}
}
},_finish:function(_16ad){
this.inherited(arguments);
var n=this.getNode(_16ad);
try{
dojox.grid.fire(n,"blur");
}
catch(e){
}
}});
dojox.grid.editors.input=dojox.grid.editors.Input;
dojo.declare("dojox.grid.editors.Select",dojox.grid.editors.Input,{constructor:function(_16af){
this.options=this.options||this.cell.options;
this.values=this.values||this.cell.values||this.options;
},format:function(_16b0,_16b1){
this.needFormatNode(_16b0,_16b1);
var h=["<select class=\"dojoxGrid-select\">"];
for(var i=0,o,v;((o=this.options[i])!==undefined)&&((v=this.values[i])!==undefined);i++){
h.push("<option",(_16b0==v?" selected":"")," value=\""+v+"\"",">",o,"</option>");
}
h.push("</select>");
return h.join("");
},getValue:function(_16b6){
var n=this.getNode(_16b6);
if(n){
var i=n.selectedIndex,o=n.options[i];
return this.cell.returnIndex?i:o.value||o.innerHTML;
}
}});
dojox.grid.editors.select=dojox.grid.editors.Select;
dojo.declare("dojox.grid.editors.AlwaysOn",dojox.grid.editors.Input,{alwaysOn:true,_formatNode:function(_16ba,_16bb){
this.formatNode(this.getNode(_16bb),_16ba,_16bb);
},applyStaticValue:function(_16bc){
var e=this.cell.grid.edit;
e.applyCellEdit(this.getValue(_16bc),this.cell,_16bc);
e.start(this.cell,_16bc,true);
}});
dojox.grid.editors.alwaysOn=dojox.grid.editors.AlwaysOn;
dojo.declare("dojox.grid.editors.Bool",dojox.grid.editors.AlwaysOn,{_valueProp:"checked",format:function(_16be,_16bf){
return "<input class=\"dojoxGrid-input\" type=\"checkbox\""+(_16be?" checked=\"checked\"":"")+" style=\"width: auto\" />";
},doclick:function(e){
if(e.target.tagName=="INPUT"){
this.applyStaticValue(e.rowIndex);
}
}});
dojox.grid.editors.bool=dojox.grid.editors.Bool;
}
if(!dojo._hasResource["dojox.grid.compat._data.dijitEditors"]){
dojo._hasResource["dojox.grid.compat._data.dijitEditors"]=true;
dojo.provide("dojox.grid.compat._data.dijitEditors");
dojo.declare("dojox.grid.editors.Dijit",dojox.grid.editors.base,{editorClass:"dijit.form.TextBox",constructor:function(_16c1){
this.editor=null;
this.editorClass=dojo.getObject(this.cell.editorClass||this.editorClass);
},format:function(_16c2,_16c3){
this.needFormatNode(_16c2,_16c3);
return "<div></div>";
},getValue:function(_16c4){
return this.editor.getValue();
},setValue:function(_16c5,_16c6){
if(this.editor&&this.editor.setValue){
this.editor.setValue(_16c6);
}else{
this.inherited(arguments);
}
},getEditorProps:function(_16c7){
return dojo.mixin({},this.cell.editorProps||{},{constraints:dojo.mixin({},this.cell.constraint)||{},value:_16c7});
},createEditor:function(_16c8,_16c9,_16ca){
return new this.editorClass(this.getEditorProps(_16c9),_16c8);
},attachEditor:function(_16cb,_16cc,_16cd){
_16cb.appendChild(this.editor.domNode);
this.setValue(_16cd,_16cc);
},formatNode:function(_16ce,_16cf,_16d0){
if(!this.editorClass){
return _16cf;
}
if(!this.editor){
this.editor=this.createEditor.apply(this,arguments);
}else{
this.attachEditor.apply(this,arguments);
}
this.sizeEditor.apply(this,arguments);
this.cell.grid.rowHeightChanged(_16d0);
this.focus();
},sizeEditor:function(_16d1,_16d2,_16d3){
var p=this.cell.getNode(_16d3),box=dojo.contentBox(p);
dojo.marginBox(this.editor.domNode,{w:box.w});
},focus:function(_16d6,_16d7){
if(this.editor){
setTimeout(dojo.hitch(this.editor,function(){
dojox.grid.fire(this,"focus");
}),0);
}
},_finish:function(_16d8){
this.inherited(arguments);
dojox.grid.removeNode(this.editor.domNode);
}});
dojo.declare("dojox.grid.editors.ComboBox",dojox.grid.editors.Dijit,{editorClass:"dijit.form.ComboBox",getEditorProps:function(_16d9){
var items=[];
dojo.forEach(this.cell.options,function(o){
items.push({name:o,value:o});
});
var store=new dojo.data.ItemFileReadStore({data:{identifier:"name",items:items}});
return dojo.mixin({},this.cell.editorProps||{},{value:_16d9,store:store});
},getValue:function(){
var e=this.editor;
e.setDisplayedValue(e.getDisplayedValue());
return e.getValue();
}});
dojo.declare("dojox.grid.editors.DateTextBox",dojox.grid.editors.Dijit,{editorClass:"dijit.form.DateTextBox",setValue:function(_16de,_16df){
if(this.editor){
this.editor.setValue(new Date(_16df));
}else{
this.inherited(arguments);
}
},getEditorProps:function(_16e0){
return dojo.mixin(this.inherited(arguments),{value:new Date(_16e0)});
}});
dojo.declare("dojox.grid.editors.CheckBox",dojox.grid.editors.Dijit,{editorClass:"dijit.form.CheckBox",getValue:function(){
return this.editor.checked;
},setValue:function(_16e1,_16e2){
if(this.editor&&this.editor.setAttribute){
this.editor.setAttribute("checked",_16e2);
}else{
this.inherited(arguments);
}
},sizeEditor:function(_16e3,_16e4,_16e5){
return;
}});
dojo.declare("dojox.grid.editors.Editor",dojox.grid.editors.Dijit,{editorClass:"dijit.Editor",getEditorProps:function(_16e6){
return dojo.mixin({},this.cell.editorProps||{},{height:this.cell.editorHeight||"100px"});
},createEditor:function(_16e7,_16e8,_16e9){
var _16ea=new this.editorClass(this.getEditorProps(_16e8),_16e7);
dojo.connect(_16ea,"onLoad",dojo.hitch(this,"populateEditor"));
return _16ea;
},formatNode:function(_16eb,_16ec,_16ed){
this.content=_16ec;
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
},_setModel:function(_16f0){
this.model=_16f0;
if(this.model){
this.model.observer(this);
this.model.measure();
this.indexCellFields();
}
},setModel:function(_16f1){
if(this.model){
this.model.notObserver(this);
}
this._setModel(_16f1);
},get:function(_16f2){
return this.grid.model.getDatum(_16f2,this.fieldIndex);
},modelAllChange:function(){
this.rowCount=(this.model?this.model.getRowCount():0);
this.updateRowCount(this.rowCount);
},modelBeginUpdate:function(){
this.beginUpdate();
},modelEndUpdate:function(){
this.endUpdate();
},modelRowChange:function(_16f3,_16f4){
this.updateRow(_16f4);
},modelDatumChange:function(_16f5,_16f6,_16f7){
this.updateRow(_16f6);
},modelFieldsChange:function(){
this.indexCellFields();
this.render();
},modelInsertion:function(_16f8){
this.updateRowCount(this.model.getRowCount());
},modelRemoval:function(_16f9){
this.updateRowCount(this.model.getRowCount());
},getCellName:function(_16fa){
var v=this.model.fields.values,i=_16fa.fieldIndex;
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
},canSort:function(_1700){
var f=this.getSortField(_1700);
return f&&this.model.canSort(f);
},getSortField:function(_1702){
var c=this.getCell(this.getSortIndex(_1702));
return (c.fieldIndex+1)*(this.sortInfo>0?1:-1);
},sort:function(){
this.edit.apply();
this.model.sort(this.getSortField());
},addRow:function(_1704,_1705){
this.edit.apply();
var i=_1705||-1;
if(i<0){
i=this.selection.getFirstSelected()||0;
}
if(i<0){
i=0;
}
this.model.insert(_1704,i);
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
},canEdit:function(_170a,_170b){
return (this.model.canModify?this.model.canModify(_170b):true);
},doStartEdit:function(_170c,_170d){
this.model.beginModifyRow(_170d);
this.onStartEdit(_170c,_170d);
},doApplyCellEdit:function(_170e,_170f,_1710){
this.model.setDatum(_170e,_170f,_1710);
this.onApplyCellEdit(_170e,_170f,_1710);
},doCancelEdit:function(_1711){
this.model.cancelModifyRow(_1711);
this.onCancelEdit.apply(this,arguments);
},doApplyEdit:function(_1712){
this.model.endModifyRow(_1712);
this.onApplyEdit(_1712);
},styleRowState:function(inRow){
if(this.model.getState){
var _1714=this.model.getState(inRow.index),c="";
for(var i=0,ss=["inflight","error","inserting"],s;s=ss[i];i++){
if(_1714[s]){
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
var _171e=function(n){
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
v.width=_171e(cg);
}
return v;
});
if(!props.structure.length){
props.structure.push({__span:Infinity,cells:[]});
}
d.query("thead > tr",node).forEach(function(tr,_1726){
var _1727=0;
var _1728=0;
var _1729;
var cView=null;
d.query("> th",tr).map(function(th){
if(!cView){
_1729=0;
cView=props.structure[0];
}else{
if(_1727>=(_1729+cView.__span)){
_1728++;
_1729+=cView.__span;
lastView=cView;
cView=props.structure[_1728];
}
}
var cell={name:d.trim(d.attr(th,"name")||th.innerHTML),field:d.trim(d.attr(th,"field")||""),colSpan:parseInt(d.attr(th,"colspan")||1)};
_1727+=cell.colSpan;
cell.field=cell.field||cell.name;
cell.width=_171e(th);
if(!cView.cells[_1726]){
cView.cells[_1726]=[];
}
cView.cells[_1726].push(cell);
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
var _172d={ELEMENT:1,ATTRIBUTE:2,TEXT:3,CDATA_SECTION:4,PROCESSING_INSTRUCTION:7,COMMENT:8,DOCUMENT:9};
var _172e=/<([^>\/\s+]*)([^>]*)>([^<]*)/g;
var _172f=/([^=]*)=(("([^"]*)")|('([^']*)'))/g;
var _1730=/<!ENTITY\s+([^"]*)\s+"([^"]*)">/g;
var _1731=/<!\[CDATA\[([\u0001-\uFFFF]*?)\]\]>/g;
var _1732=/<!--([\u0001-\uFFFF]*?)-->/g;
var trim=/^\s+|\s+$/g;
var _1734=/\s+/g;
var egt=/\&gt;/g;
var elt=/\&lt;/g;
var equot=/\&quot;/g;
var eapos=/\&apos;/g;
var eamp=/\&amp;/g;
var dNs="_def_";
function _doc(){
return new (function(){
var all={};
this.nodeType=_172d.DOCUMENT;
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
if(c.nodeType==_172d.ELEMENT){
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
if(c.nodeType==_172d.ELEMENT){
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
if(c.nodeType==_172d.ELEMENT){
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
return {nodeType:_172d.TEXT,nodeName:"#text",nodeValue:v.replace(_1734," ").replace(egt,">").replace(elt,"<").replace(eapos,"'").replace(equot,"\"").replace(eamp,"&")};
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
var _1764,eRe=[];
if(_1730.test(str)){
_1730.lastIndex=0;
while((_1764=_1730.exec(str))!=null){
eRe.push({entity:"&"+_1764[1].replace(trim,"")+";",expression:_1764[2]});
}
for(var i=0;i<eRe.length;i++){
str=str.replace(new RegExp(eRe[i].entity,"g"),eRe[i].expression);
}
}
}
var _1767=[],cdata;
while((cdata=_1731.exec(str))!=null){
_1767.push(cdata[1]);
}
for(var i=0;i<_1767.length;i++){
str=str.replace(_1767[i],i);
}
var _1769=[],_176a;
while((_176a=_1732.exec(str))!=null){
_1769.push(_176a[1]);
}
for(i=0;i<_1769.length;i++){
str=str.replace(_1769[i],i);
}
var res,obj=root;
while((res=_172e.exec(str))!=null){
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
var _176f=res[2].substr(0,res[2].length-2);
obj.childNodes.push({nodeType:_172d.PROCESSING_INSTRUCTION,nodeName:name,nodeValue:_176f});
}else{
if(res[1].charAt(0)=="!"){
if(res[1].indexOf("![CDATA[")==0){
var val=parseInt(res[1].replace("![CDATA[","").replace("]]",""));
obj.childNodes.push({nodeType:_172d.CDATA_SECTION,nodeName:"#cdata-section",nodeValue:_1767[val]});
}else{
if(res[1].substr(0,3)=="!--"){
var val=parseInt(res[1].replace("!--","").replace("--",""));
obj.childNodes.push({nodeType:_172d.COMMENT,nodeName:"#comment",nodeValue:_1769[val]});
}
}
}else{
var name=res[1].replace(trim,"");
var o={nodeType:_172d.ELEMENT,nodeName:name,localName:name,namespace:dNs,ownerDocument:root,attributes:[],parentNode:null,childNodes:[]};
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
while((attr=_172f.exec(res[2]))!=null){
if(attr.length>0){
var name=attr[1].replace(trim,"");
var val=(attr[4]||attr[6]||"").replace(_1734," ").replace(egt,">").replace(elt,"<").replace(eapos,"'").replace(equot,"\"").replace(eamp,"&");
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
o.attributes.push({nodeType:_172d.ATTRIBUTE,nodeName:name,localName:ln,namespace:ns,nodeValue:val});
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
if(e.nodeType==_172d.ELEMENT){
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
this.appendArray=function(_177e){
return this.append.apply(this,_177e);
};
this.clear=function(){
b="";
this.length=0;
return this;
};
this.replace=function(_177f,_1780){
b=b.replace(_177f,_1780);
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
dojox.string.tokenize=function(str,re,_1787,_1788){
var _1789=[];
var match,_178b,_178c=0;
while(match=re.exec(str)){
_178b=str.slice(_178c,re.lastIndex-match[0].length);
if(_178b.length){
_1789.push(_178b);
}
if(_1787){
if(dojo.isOpera){
var copy=match.slice(0);
while(copy.length<match.length){
copy.push(null);
}
match=copy;
}
var _178e=_1787.apply(_1788,match.slice(1).concat(_1789.length));
if(typeof _178e!="undefined"){
_1789.push(_178e);
}
}
_178c=re.lastIndex;
}
_178b=str.slice(_178c);
if(_178b.length){
_1789.push(_178b);
}
return _1789;
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
var _1792=dojo.delegate(this);
_1792.pop=function(){
return last;
};
return _1792;
},pop:function(){
throw new Error("pop() called on empty Context");
},get:function(key,_1794){
if(typeof this[key]!="undefined"){
return this._normalize(this[key]);
}
for(var i=0,dict;dict=this._dicts[i];i++){
if(typeof dict[key]!="undefined"){
return this._normalize(dict[key]);
}
}
return _1794;
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
var _1799=this.push();
if(dict){
dojo._mixin(this,dict);
}
return _1799;
}});
var _179a=/("(?:[^"\\]*(?:\\.[^"\\]*)*)"|'(?:[^'\\]*(?:\\.[^'\\]*)*)'|[^\s]+)/g;
var _179b=/\s+/g;
var split=function(_179d,limit){
_179d=_179d||_179b;
if(!(_179d instanceof RegExp)){
_179d=new RegExp(_179d,"g");
}
if(!_179d.global){
throw new Error("You must use a globally flagged RegExp with split "+_179d);
}
_179d.exec("");
var part,parts=[],_17a1=0,i=0;
while(part=_179d.exec(this)){
parts.push(this.slice(_17a1,_179d.lastIndex-part[0].length));
_17a1=_179d.lastIndex;
if(limit&&(++i>limit-1)){
break;
}
}
parts.push(this.slice(_17a1));
return parts;
};
dd.Token=function(_17a3,_17a4){
this.token_type=_17a3;
this.contents=new String(dojo.trim(_17a4));
this.contents.split=split;
this.split=function(){
return String.prototype.split.apply(this.contents,arguments);
};
};
dd.Token.prototype.split_contents=function(limit){
var bit,bits=[],i=0;
limit=limit||999;
while(i++<limit&&(bit=_179a.exec(this.contents))){
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
var ddt=dd.text={_get:function(_17aa,name,_17ac){
var _17ad=dd.register.get(_17aa,name.toLowerCase(),_17ac);
if(!_17ad){
if(!_17ac){
throw new Error("No tag found for "+name);
}
return null;
}
var fn=_17ad[1];
var _17af=_17ad[2];
var parts;
if(fn.indexOf(":")!=-1){
parts=fn.split(":");
fn=parts.pop();
}
dojo["require"](_17af);
var _17b1=dojo.getObject(_17af);
return _17b1[fn||name]||_17b1[name+"_"];
},getTag:function(name,_17b3){
return ddt._get("tag",name,_17b3);
},getFilter:function(name,_17b5){
return ddt._get("filter",name,_17b5);
},getTemplate:function(file){
return new dd.Template(ddt.getTemplateString(file));
},getTemplateString:function(file){
return dojo._getText(file.toString())||"";
},_resolveLazy:function(_17b8,sync,json){
if(sync){
if(json){
return dojo.fromJson(dojo._getText(_17b8))||{};
}else{
return dd.text.getTemplateString(_17b8);
}
}else{
return dojo.xhrGet({handleAs:(json)?"json":"text",url:_17b8});
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
dd.Template=dojo.extend(function(_17c9,_17ca){
var str=_17ca?_17c9:ddt._resolveTemplateArg(_17c9,true)||"";
var _17cc=ddt.tokenize(str);
var _17cd=new dd._Parser(_17cc);
this.nodelist=_17cd.parse();
},{update:function(node,_17cf){
return ddt._resolveContextArg(_17cf).addCallback(this,function(_17d0){
var _17d1=this.render(new dd._Context(_17d0));
if(node.forEach){
node.forEach(function(item){
item.innerHTML=_17d1;
});
}else{
dojo.byId(node).innerHTML=_17d1;
}
return this;
});
},render:function(_17d3,_17d4){
_17d4=_17d4||this.getBuffer();
_17d3=_17d3||new dd._Context({});
return this.nodelist.render(_17d3,_17d4)+"";
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
dd._QuickNodeList=dojo.extend(function(_17d8){
this.contents=_17d8;
},{render:function(_17d9,_17da){
for(var i=0,l=this.contents.length;i<l;i++){
if(this.contents[i].resolve){
_17da=_17da.concat(this.contents[i].resolve(_17d9));
}else{
_17da=_17da.concat(this.contents[i]);
}
}
return _17da;
},dummyRender:function(_17dd){
return this.render(_17dd,dd.Template.prototype.getBuffer()).toString();
},clone:function(_17de){
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
},resolve:function(_17e7){
var str=this.resolvePath(this.key,_17e7);
for(var i=0,_17ea;_17ea=this.filters[i];i++){
if(_17ea[1]){
if(_17ea[1][0]){
str=_17ea[0](str,this.resolvePath(_17ea[1][1],_17e7));
}else{
str=_17ea[0](str,_17ea[1][1]);
}
}else{
str=_17ea[0](str);
}
}
return str;
},resolvePath:function(path,_17ec){
var _17ed,parts;
var first=path.charAt(0);
var last=path.slice(-1);
if(!isNaN(parseInt(first))){
_17ed=(path.indexOf(".")==-1)?parseInt(path):parseFloat(path);
}else{
if(first=="\""&&first==last){
_17ed=path.slice(1,-1);
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
_17ed=_17ec.get(parts[0]);
for(var i=1;i<parts.length;i++){
var part=parts[i];
if(_17ed){
var base=_17ed;
if(dojo.isObject(_17ed)&&part=="items"&&typeof _17ed[part]=="undefined"){
var items=[];
for(var key in _17ed){
items.push([key,_17ed[key]]);
}
_17ed=items;
continue;
}
if(_17ed.get&&dojo.isFunction(_17ed.get)){
_17ed=_17ed.get(part);
}else{
if(typeof _17ed[part]=="undefined"){
_17ed=_17ed[part];
break;
}else{
_17ed=_17ed[part];
}
}
if(dojo.isFunction(_17ed)){
if(_17ed.alters_data){
_17ed="";
}else{
_17ed=_17ed.call(base);
}
}else{
if(_17ed instanceof Date){
_17ed=dd._Context.prototype._normalize(_17ed);
}
}
}else{
return "";
}
}
}
}
return _17ed;
}});
dd._TextNode=dd._Node=dojo.extend(function(obj){
this.contents=obj;
},{set:function(data){
this.contents=data;
return this;
},render:function(_17f8,_17f9){
return _17f9.concat(this.contents);
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
},render:function(_17fd,_17fe){
for(var i=0;i<this.contents.length;i++){
_17fe=this.contents[i].render(_17fd,_17fe);
if(!_17fe){
throw new Error("Template must return buffer");
}
}
return _17fe;
},dummyRender:function(_1800){
return this.render(_1800,dd.Template.prototype.getBuffer()).toString();
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
},{render:function(_1802,_1803){
var str=this.contents.resolve(_1802);
if(!str.safe){
str=dd._base.escape(""+str);
}
return _1803.concat(str);
}});
dd._noOpNode=new function(){
this.render=this.unrender=function(){
return arguments[1];
};
this.clone=function(){
return this;
};
};
dd._Parser=dojo.extend(function(_1805){
this.contents=_1805;
},{i:0,parse:function(_1806){
var _1807={};
_1806=_1806||[];
for(var i=0;i<_1806.length;i++){
_1807[_1806[i]]=true;
}
var _1809=new dd._NodeList();
while(this.i<this.contents.length){
token=this.contents[this.i++];
if(typeof token=="string"){
_1809.push(new dd._TextNode(token));
}else{
var type=token[0];
var text=token[1];
if(type==dd.TOKEN_VAR){
_1809.push(new dd._VarNode(text));
}else{
if(type==dd.TOKEN_BLOCK){
if(_1807[text]){
--this.i;
return _1809;
}
var cmd=text.split(/\s+/g);
if(cmd.length){
cmd=cmd[0];
var fn=ddt.getTag(cmd);
if(fn){
_1809.push(fn(this,new dd.Token(type,text)));
}
}
}
}
}
}
if(_1806.length){
throw new Error("Could not find closing tag(s): "+_1806.toString());
}
this.contents.length=0;
return _1809;
},next_token:function(){
var token=this.contents[this.i++];
return new dd.Token(token[0],token[1]);
},delete_first_token:function(){
this.i++;
},skip_past:function(_180f){
while(this.i<this.contents.length){
var token=this.contents[this.i++];
if(token[0]==dd.TOKEN_BLOCK&&token[1]==_180f){
return;
}
}
throw new Error("Unclosed tag found when looking for "+_180f);
},create_variable_node:function(expr){
return new dd._VarNode(expr);
},create_text_node:function(expr){
return new dd._TextNode(expr||"");
},getTemplate:function(file){
return new dd.Template(file);
}});
dd.register={_registry:{attributes:[],tags:[],filters:[]},get:function(_1814,name){
var _1816=dd.register._registry[_1814+"s"];
for(var i=0,entry;entry=_1816[i];i++){
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
var _181a=dd.register._registry.attributes;
for(var i=0,entry;entry=_181a[i];i++){
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
},_any:function(type,base,_1820){
for(var path in _1820){
for(var i=0,fn;fn=_1820[path][i];i++){
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
},tags:function(base,_1827){
dd.register._any("tags",base,_1827);
},filters:function(base,_1829){
dd.register._any("filters",base,_1829);
}};
var _182a=/&/g;
var _182b=/</g;
var _182c=/>/g;
var _182d=/'/g;
var _182e=/"/g;
dd._base.escape=function(value){
return dd.mark_safe(value.replace(_182a,"&amp;").replace(_182b,"&lt;").replace(_182c,"&gt;").replace(_182e,"&quot;").replace(_182d,"&#39;"));
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
var _1832=[];
var dh=dojox.dtl.filter.htmlstrings;
value=value.replace(dh._linebreaksrn,"\n");
var parts=value.split(dh._linebreaksn);
for(var i=0;i<parts.length;i++){
var part=parts[i].replace(dh._linebreakss,"").replace(dh._linebreaksbr,"<br />");
_1832.push("<p>"+part+"</p>");
}
return _1832.join("\n\n");
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
dojox.string.sprintf=function(_183f,_1840){
for(var args=[],i=1;i<arguments.length;i++){
args.push(arguments[i]);
}
var _1843=new dojox.string.sprintf.Formatter(_183f);
return _1843.format.apply(_1843,args);
};
dojox.string.sprintf.Formatter=function(_1844){
var _1845=[];
this._mapped=false;
this._format=_1844;
this._tokens=dojox.string.tokenize(_1844,this._re,this._parseDelim,this);
};
dojo.extend(dojox.string.sprintf.Formatter,{_re:/\%(?:\(([\w_]+)\)|([1-9]\d*)\$)?([0 +\-\#]*)(\*|\d+)?(\.)?(\*|\d+)?[hlL]?([\%scdeEfFgGiouxX])/g,_parseDelim:function(_1846,_1847,flags,_1849,_184a,_184b,_184c){
if(_1846){
this._mapped=true;
}
return {mapping:_1846,intmapping:_1847,flags:flags,_minWidth:_1849,period:_184a,_precision:_184b,specifier:_184c};
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
}},e:{isDouble:true,doubleNotation:"e"},E:{extend:["e"],toUpper:true},f:{isDouble:true,doubleNotation:"f"},F:{extend:["f"]},g:{isDouble:true,doubleNotation:"g"},G:{extend:["g"],toUpper:true}},format:function(_1850){
if(this._mapped&&typeof _1850!="object"){
throw new Error("format requires a mapping");
}
var str="";
var _1852=0;
for(var i=0,token;i<this._tokens.length;i++){
token=this._tokens[i];
if(typeof token=="string"){
str+=token;
}else{
if(this._mapped){
if(typeof _1850[token.mapping]=="undefined"){
throw new Error("missing key "+token.mapping);
}
token.arg=_1850[token.mapping];
}else{
if(token.intmapping){
var _1852=parseInt(token.intmapping)-1;
}
if(_1852>=arguments.length){
throw new Error("got "+arguments.length+" printf arguments, insufficient for '"+this._format+"'");
}
token.arg=arguments[_1852++];
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
var _1858=this._specifiers[token.specifier];
if(typeof _1858=="undefined"){
throw new Error("unexpected specifier '"+token.specifier+"'");
}
if(_1858.extend){
dojo.mixin(_1858,this._specifiers[_1858.extend]);
delete _1858.extend;
}
dojo.mixin(token,_1858);
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
token.minWidth=parseInt(arguments[_1852++]);
if(isNaN(token.minWidth)){
throw new Error("the argument for * width at position "+_1852+" is not a number in "+this._format);
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
token.precision=parseInt(arguments[_1852++]);
if(isNaN(token.precision)){
throw Error("the argument for * precision at position "+_1852+" is not a number in "+this._format);
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
},zeroPad:function(token,_185e){
_185e=(arguments.length==2)?_185e:token.precision;
if(typeof token.arg!="string"){
token.arg=""+token.arg;
}
var _185f=_185e-10;
while(token.arg.length<_185f){
token.arg=(token.rightJustify)?token.arg+this._zeros10:this._zeros10+token.arg;
}
var pad=_185e-token.arg.length;
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
},spacePad:function(token,_1863){
_1863=(arguments.length==2)?_1863:token.minWidth;
if(typeof token.arg!="string"){
token.arg=""+token.arg;
}
var _1864=_1863-10;
while(token.arg.length<_1864){
token.arg=(token.rightJustify)?token.arg+this._spaces10:this._spaces10+token.arg;
}
var pad=_1863-token.arg.length;
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
var _1879=[];
var width=(lines.length+"").length;
for(var i=0,line;i<lines.length;i++){
line=lines[i];
_1879.push(df.strings.ljust(i+1,width)+". "+dojox.dtl._base.escape(line));
}
return _1879.join("\n");
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
var _1881=[];
if(typeof value=="number"){
value=value+"";
}
if(value.charAt){
for(var i=0;i<value.length;i++){
_1881.push(value.charAt(i));
}
return _1881;
}
if(typeof value=="object"){
for(var key in value){
_1881.push(value[key]);
}
return _1881;
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
var _1889=dojox.dtl.filter.strings._strings;
if(!_1889[arg]){
_1889[arg]=new dojox.string.sprintf.Formatter("%"+arg);
}
return _1889[arg].format(value);
},title:function(value){
var last,title="";
for(var i=0,_188e;i<value.length;i++){
_188e=value.charAt(i);
if(last==" "||last=="\n"||last=="\t"||!last){
title+=_188e.toUpperCase();
}else{
title+=_188e.toLowerCase();
}
last=_188e;
}
return title;
},_truncatewords:/[ \n\r\t]/,truncatewords:function(value,arg){
arg=parseInt(arg);
if(!arg){
return value;
}
for(var i=0,j=value.length,count=0,_1894,last;i<value.length;i++){
_1894=value.charAt(i);
if(dojox.dtl.filter.strings._truncatewords.test(last)){
if(!dojox.dtl.filter.strings._truncatewords.test(_1894)){
++count;
if(count==arg){
return value.substring(0,j+1);
}
}
}else{
if(!dojox.dtl.filter.strings._truncatewords.test(_1894)){
j=i;
}
}
last=_1894;
}
return value;
},_truncate_words:/(&.*?;|<.*?>|(\w[\w\-]*))/g,_truncate_tag:/<(\/)?([^ ]+?)(?: (\/)| .*?)?>/,_truncate_singlets:{br:true,col:true,link:true,base:true,img:true,param:true,area:true,hr:true,input:true},truncatewords_html:function(value,arg){
arg=parseInt(arg);
if(arg<=0){
return "";
}
var _1898=dojox.dtl.filter.strings;
var words=0;
var open=[];
var _189b=dojox.string.tokenize(value,_1898._truncate_words,function(all,word){
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
var tag=all.match(_1898._truncate_tag);
if(!tag||words>=arg){
return;
}
var _189f=tag[1];
var _18a0=tag[2].toLowerCase();
var _18a1=tag[3];
if(_189f||_1898._truncate_singlets[_18a0]){
}else{
if(_189f){
var i=dojo.indexOf(open,_18a0);
if(i!=-1){
open=open.slice(i+1);
}
}else{
open.unshift(_18a0);
}
}
return all;
}).join("");
_189b=_189b.replace(/\s+$/g,"");
for(var i=0,tag;tag=open[i];i++){
_189b+="</"+tag+">";
}
return _189b;
},upper:function(value){
return value.toUpperCase();
},urlencode:function(value){
return dojox.dtl.filter.strings._urlquote(value);
},_urlize:/^((?:[(>]|&lt;)*)(.*?)((?:[.,)>\n]|&gt;)*)$/,_urlize2:/^\S+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+$/,urlize:function(value){
return dojox.dtl.filter.strings.urlizetrunc(value);
},urlizetrunc:function(value,arg){
arg=parseInt(arg);
return dojox.string.tokenize(value,/(\S+)/g,function(word){
var _18ab=dojox.dtl.filter.strings._urlize.exec(word);
if(!_18ab){
return word;
}
var lead=_18ab[1];
var _18ad=_18ab[2];
var trail=_18ab[3];
var _18af=_18ad.indexOf("www.")==0;
var hasAt=_18ad.indexOf("@")!=-1;
var _18b1=_18ad.indexOf(":")!=-1;
var _18b2=_18ad.indexOf("http://")==0;
var _18b3=_18ad.indexOf("https://")==0;
var _18b4=/[a-zA-Z0-9]/.test(_18ad.charAt(0));
var last4=_18ad.substring(_18ad.length-4);
var _18b6=_18ad;
if(arg>3){
_18b6=_18b6.substring(0,arg-3)+"...";
}
if(_18af||(!hasAt&&!_18b2&&_18ad.length&&_18b4&&(last4==".org"||last4==".net"||last4==".com"))){
return "<a href=\"http://"+_18ad+"\" rel=\"nofollow\">"+_18b6+"</a>";
}else{
if(_18b2||_18b3){
return "<a href=\""+_18ad+"\" rel=\"nofollow\">"+_18b6+"</a>";
}else{
if(hasAt&&!_18af&&!_18b1&&dojox.dtl.filter.strings._urlize2.test(_18ad)){
return "<a href=\"mailto:"+_18ad+"\">"+_18ad+"</a>";
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
var _18ba=[];
var parts=value.split(/\s+/g);
if(parts.length){
var word=parts.shift();
_18ba.push(word);
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
_18ba.push("\n");
pos=lines[lines.length-1].length;
}else{
_18ba.push(" ");
if(lines.length>1){
pos=lines[lines.length-1].length;
}
}
_18ba.push(word);
}
}
return _18ba.join("");
}});
}
if(!dojo._hasResource["pion.login"]){
dojo._hasResource["pion.login"]=true;
dojo.provide("pion.login");
pion.login.logout=function(){
dojo.cookie("logged_in","",{expires:-1});
dojo.xhrGet({url:"/logout",preventCache:true,handleAs:"xml",timeout:5000,load:function(_18c0,_18c1){
console.debug("logout response: ",_18c0);
return _18c0;
},error:function(_18c2,_18c3){
console.error("logout error: HTTP status code = ",_18c3.xhr.status);
return _18c2;
}});
};
pion.login.expire=function(){
dojo.xhrGet({url:"/logout",preventCache:true,handleAs:"xml",timeout:5000,load:function(_18c4,_18c5){
console.debug("logout response: ",_18c4);
return _18c4;
},error:function(_18c6,_18c7){
console.error("logout error: HTTP status code = ",_18c7.xhr.status);
return _18c6;
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
pion.login.doLoginDialog=function(_18c8){
pion.login.login_pending=true;
var _18c9=dijit.byId("ops_toggle_button");
if(!_18c9.checked){
_18c9.setAttribute("checked",true);
pion.login.ops_temporarily_suppressed=true;
}
var _18ca=new pion.login.LoginDialog({});
_18ca.setValues({Username:pion.login.latestUsername});
dojo.connect(_18ca.domNode,"onkeypress",function(event){
if(event.keyCode==dojo.keys.ENTER){
_18ca.execute(_18ca.getValues());
_18ca.destroyRecursive();
}
});
_18ca.show();
_18ca.execute=function(_18cc){
console.debug("dialogFields = ",_18cc);
pion.login.latestUsername=_18cc.Username;
dojo.xhrGet({url:"/login?user="+_18cc.Username+"&pass="+_18cc.Password,preventCache:true,handleAs:"xml",load:function(_18cd,_18ce){
pion.login.login_pending=false;
pion.login.onLoginSuccess();
console.debug("login response: ioArgs.xhr = ",_18ce.xhr);
if(pion.login.ops_temporarily_suppressed){
_18c9.setAttribute("checked",false);
pion.login.ops_temporarily_suppressed=false;
}
if(_18c8){
_18c8();
}
return _18cd;
},error:function(_18cf,_18d0){
pion.login.login_pending=false;
if(_18d0.xhr.status==401){
pion.login.doLoginDialog(_18c8);
return;
}
console.error("login error: HTTP status code = ",_18d0.xhr.status);
console.error("ioArgs = ",_18d0);
return _18cf;
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
var _18d1=new dojo.dnd.Target(this.domNode,{accept:["connector"]});
dojo.connect(_18d1,"onDndDrop",pion.reactors.handleDropOnReactor);
this.name_div=document.createElement("div");
this.name_div.innerHTML=this.config.Name;
dojo.addClass(this.name_div,"name");
this.domNode.appendChild(this.name_div);
var _this=this;
this.run_button=new dijit.form.ToggleButton();
var _18d3=this.run_button.domNode;
dojo.connect(_18d3,"click",function(){
dojo.xhrPut({url:"/config/reactors/"+_this.config["@id"]+(_this.run_button.checked?"/start":"/stop"),error:pion.getXhrErrorHandler(dojo.xhrPut)});
});
this.domNode.appendChild(_18d3);
this.ops_per_sec=document.createElement("span");
dojo.addClass(this.ops_per_sec,"ops_per_sec");
this.ops_per_sec.innerHTML="0";
this.domNode.appendChild(this.ops_per_sec);
this.domNode.setAttribute("reactor_type",this.config.Plugin);
var _18d4=pion.reactors.categories[this.config.Plugin];
dojo.addClass(this.domNode,_18d4);
if(_18d4!="collection"){
this.run_button.attr("checked",true);
}
dojo.addClass(this.domNode,"moveable");
dojo.addClass(this.domNode,"reactor");
dojo.addClass(this.domNode,this.config.Plugin);
var m5=new dojo.dnd.move.parentConstrainedMoveable(this.domNode,{area:"padding",within:true});
var c=m5.constraints();
c.r=c.l+c.w-this.offsetWidth;
c.b=c.t+c.h-this.offsetHeight;
var _18d7={l:this.config.X,t:this.config.Y};
console.debug("mouseLeftTop: ",_18d7);
var _18d8=pion.reactors.getNearbyGridPointInBox(c,_18d7);
this.domNode.style.top=_18d8.t+"px";
this.domNode.style.left=_18d8.l+"px";
this.domNode.style.position="absolute";
this.domNode.style.background="url(../plugins/reactors/"+_18d4+"/"+this.config.Plugin+"/bg-moveable.png) repeat-x";
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
m5.onMove=function(mover,_18dc){
var _18dd=pion.reactors.getNearbyGridPointInBox(this.constraintBox,_18dc);
dojo.marginBox(mover.node,_18dd);
for(var i=0;i<_this.reactor_inputs.length;++i){
pion.reactors.updateConnectionLine(_this.reactor_inputs[i].line,_this.reactor_inputs[i].source.domNode,_this.domNode);
}
for(var i=0;i<_this.reactor_outputs.length;++i){
pion.reactors.updateConnectionLine(_this.reactor_outputs[i].line,_this.domNode,_this.reactor_outputs[i].sink.domNode);
}
};
dojo.connect(m5,"onMoveStop",this,this.handleMoveStop);
},_initOptions:function(_18df,_18e0){
var store=pion.reactors.config_store;
var _this=this;
store.fetch({query:{"@id":_18df["@id"]},onItem:function(item){
_18df.options=[];
for(var _18e4 in _18e0){
_18df[_18e4]=_18e0[_18e4];
if(store.hasAttribute(item,_18e4)){
_18df[_18e4]=(store.getValue(item,_18e4).toString()=="true");
}
if(_18df[_18e4]){
_18df.options.push(_18e4);
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
dojo.rawXhrPut({url:"/config/reactors/"+this.config["@id"]+"/move",contentType:"text/xml",handleAs:"xml",putData:this.put_data,load:function(_18e7){
console.debug("response: ",_18e7);
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:this.put_data})});
}});
dojo.declare("plugins.reactors.ReactorIcon",[],{});
dojo.declare("plugins.reactors.ReactorInitDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">${title}</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<table>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Name:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Comments:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td>\r\n\t\t\t</tr>\r\n\t\t</table>\r\n\t</div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick: tryConfig\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t</div>\r\n\t<span dojoAttachPoint=\"tabEnd\" tabindex=\"0\"></span>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,tryConfig:function(){
var _18e8=this.getValues();
console.debug(_18e8);
console.debug("this.plugin = ",this.plugin);
var _18e9=pion.reactors.workspace_box;
var dc=dojo.coords(_18e9.node);
var X=Math.floor(pion.reactors.last_x-dc.x);
var Y=Math.floor(pion.reactors.last_y-dc.y);
this.post_data="<PionConfig><Reactor><Plugin>"+this.plugin+"</Plugin><Workspace>"+_18e9.my_content_pane.title+"</Workspace><X>"+X+"</X><Y>"+Y+"</Y>";
for(var tag in _18e8){
if(tag!="options"){
console.debug("dialogFields[",tag,"] = ",_18e8[tag]);
this.post_data+="<"+tag+">"+_18e8[tag]+"</"+tag+">";
}
}
if(_18e8.options&&plugins.reactors[this.plugin].option_defaults){
for(var _18ee in plugins.reactors[this.plugin].option_defaults){
this.post_data+="<"+_18ee+">";
this.post_data+=(dojo.indexOf(_18e8.options,_18ee)!=-1);
this.post_data+="</"+_18ee+">";
}
}
if(this._insertCustomData){
this._insertCustomData(_18e8);
}
this.post_data+="</Reactor></PionConfig>";
console.debug("post_data: ",this.post_data);
var _this=this;
dojo.rawXhrPost({url:"/config/reactors",contentType:"text/xml",handleAs:"xml",postData:this.post_data,load:function(_18f0){
var node=_18f0.getElementsByTagName("Reactor")[0];
var _18f2={"@id":node.getAttribute("id")};
var _18f3=node.childNodes;
for(var i=0;i<_18f3.length;++i){
if(_18f3[i].firstChild){
_18f2[_18f3[i].tagName]=_18f3[i].firstChild.nodeValue;
}
}
var _18f5=document.createElement("div");
_18e9.node.replaceChild(_18f5,_18e9.node.lastChild);
var _18f6=pion.reactors.createReactor(_18f2,_18f5);
pion.reactors.reactors_by_id[_18f2["@id"]]=_18f6;
_18f6.workspace=_18e9;
_18e9.reactors.push(_18f6);
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
var _18f8=dijit.getViewport();
var mb=dojo.marginBox(this.domNode);
var style=this.domNode.style;
style.left=Math.floor((_18f8.l+(_18f8.w-mb.w)/2))+"px";
var top=Math.floor((_18f8.t+(_18f8.h-mb.h)/2));
var _18fc=Math.floor(_18f8.h/30);
if(top-_18fc<_18f8.t){
top=_18f8.t+_18fc;
}
if(mb.h+_18fc*2>=_18f8.h){
style.overflow="auto";
style.bottom=(_18fc-_18f8.t)+"px";
}
style.top=top+"px";
_18f8=dijit.getViewport();
mb=dojo.marginBox(this.domNode);
},execute:function(_18fd){
dojo.mixin(this.reactor.config,_18fd);
this.reactor.name_div.innerHTML=_18fd.Name;
this.put_data="<PionConfig><Reactor><Plugin>"+this.reactor.config.Plugin+"</Plugin><Workspace>"+this.reactor.config.Workspace+"</Workspace><X>"+this.reactor.config.X+"</X><Y>"+this.reactor.config.Y+"</Y>";
for(var tag in _18fd){
if(dojo.indexOf(this.reactor.special_config_elements,tag)==-1){
console.debug("dialogFields[",tag,"] = ",_18fd[tag]);
this.put_data+="<"+tag+">"+_18fd[tag]+"</"+tag+">";
}
}
if(_18fd.options&&plugins.reactors[this.reactor.config.Plugin].option_defaults){
for(var _18ff in plugins.reactors[this.reactor.config.Plugin].option_defaults){
this.put_data+="<"+_18ff+">";
this.put_data+=(dojo.indexOf(_18fd.options,_18ff)!=-1);
this.put_data+="</"+_18ff+">";
}
}
if(this._insertCustomData){
this._insertCustomData(_18fd);
}
this.put_data+="</Reactor></PionConfig>";
console.debug("put_data: ",this.put_data);
var _this=this;
dojo.rawXhrPut({url:"/config/reactors/"+this.reactor.config["@id"],contentType:"text/xml",handleAs:"xml",putData:this.put_data,load:function(_1901){
console.debug("response: ",_1901);
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
pion.terms.store.fetchItemByIdentity=function(_1902){
pion.terms.store.fetch({query:{"@id":_1902.identity},onItem:_1902.onItem,onError:pion.handleFetchError});
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
store.fetch({onItem:function(item,_1906){
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
var _190f={};
var _1910=store.getAttributes(item);
for(var i=0;i<_1910.length;++i){
if(dojo.indexOf(this.special_config_elements,_1910[i])==-1){
_190f[_1910[i]]=store.getValue(item,_1910[i]).toString();
}
}
if(this._addCustomConfigValues){
this._addCustomConfigValues(_190f,item);
}
console.dir(_190f);
this.form.setValues(_190f);
var _1912=dojo.query("textarea.comment",this.form.domNode)[0];
_1912.value=_190f.Comment;
console.debug("config = ",_190f);
this.title=_190f.Name;
var _1913=dojo.query(".dijitAccordionTitle .dijitAccordionText",this.domNode)[0];
_1913.firstChild.nodeValue=this.title;
var _1914=this._makeFieldTable(item);
plugins.codecs.CodecPane.grid_model.setData(_1914);
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
var _1919=store.getValues(item,"Field");
var _191a=[];
for(var i=0;i<_1919.length;++i){
var _191c=[];
for(var j=0;j<this.attributes_by_column.length;++j){
_191c[j]=store.getValue(_1919[i],this.attributes_by_column[j]);
}
_191a.push(_191c);
}
return _191a;
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
},_handleCellEdit:function(_1920,_1921,_1922){
console.debug("CodecPane._handleCellEdit inValue = ",_1920,", inRowIndex = ",_1921,", inFieldIndex = ",_1922);
dojo.addClass(this.domNode,"unsaved_changes");
},_handleAddNewField:function(){
console.debug("_handleAddNewField");
this.markAsChanged();
this.codec_grid.addRow([]);
},save:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
var _1923=this.form.getValues();
var _1924=dojo.query("textarea.comment",this.form.domNode)[0];
_1923.Comment=_1924.value;
var _1925="<PionConfig><Codec>";
for(var tag in _1923){
if(tag.charAt(0)!="@"&&tag!="options"){
console.debug("config[",tag,"] = ",_1923[tag]);
_1925+="<"+tag+">"+_1923[tag]+"</"+tag+">";
}
}
if(this._makeCustomElements){
_1925+=this._makeCustomElements(_1923);
}
_1925+=this._makeFieldElements();
_1925+="</Codec></PionConfig>";
console.debug("put_data: ",_1925);
_this=this;
dojo.rawXhrPut({url:"/config/codecs/"+this.uuid,contentType:"text/xml",handleAs:"xml",putData:_1925,load:function(_1927){
console.debug("response: ",_1927);
pion.codecs.config_store.fetch({query:{"@id":_this.uuid},onItem:function(item){
_this.config_item=item;
_this.populateFromConfigItem(item);
},onError:pion.handleFetchError});
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_1925})});
},_makeFieldElements:function(){
var _1929=plugins.codecs.CodecPane.grid_model.getRowCount();
var _192a="";
for(var i=0;i<_1929;++i){
var row=plugins.codecs.CodecPane.grid_model.getRow(i);
_192a+="<Field term=\""+row[1]+"\"";
_192a+=">"+row[0]+"</Field>";
}
return _192a;
},cancel:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
this.populateFromConfigItem(this.config_item);
},delete2:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
console.debug("delete2: selected codec is ",this.title);
_this=this;
dojo.xhrDelete({url:"/config/codecs/"+this.uuid,handleAs:"xml",timeout:5000,load:function(_192d,_192e){
console.debug("xhrDelete for url = /config/codecs/"+this.uuid,"; HTTP status code: ",_192e.xhr.status);
dijit.byId("codec_config_accordion").forward();
dijit.byId("codec_config_accordion").removeChild(_this);
pion.codecs._adjustAccordionSize();
return _192d;
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
},_addCustomConfigValues:function(_192f,item){
var store=pion.codecs.config_store;
_192f.options=[];
if(store.hasAttribute(item,"Flush")){
if(store.getValue(item,"Flush").toString()=="true"){
_192f.options.push("Flush");
}
}
var _1932=false;
if(store.hasAttribute(item,"Headers")){
if(store.getValue(item,"Headers").toString()=="true"){
_192f.options.push("Headers");
this.disableAndClearSeparatorFields();
_1932=true;
}
}
if(!_1932){
var _1933=store.getValue(item,"Events");
if(_1933){
_192f["@event_split_set"]=store.getValue(_1933,"@split");
_192f["@event_join_string"]=store.getValue(_1933,"@join");
_192f["@comment_prefix"]=store.getValue(_1933,"@comment");
}
var _1934=store.getValue(item,"Fields");
if(_1934){
_192f["@field_split_set"]=store.getValue(_1934,"@split");
_192f["@field_join_string"]=store.getValue(_1934,"@join");
_192f["@consec_field_delims"]=store.getValue(_1934,"@consume");
}
}
},_makeCustomElements:function(_1935){
var _1936="<Flush>";
_1936+=(dojo.indexOf(_1935.options,"Flush")!=-1);
_1936+="</Flush><Headers>";
_1936+=(dojo.indexOf(_1935.options,"Headers")!=-1);
_1936+="</Headers><Events";
if(_1935["@event_split_set"]){
_1936+=" split=\""+dojox.dtl._base.escape(_1935["@event_split_set"])+"\"";
}
if(_1935["@event_join_string"]){
_1936+=" join=\""+dojox.dtl._base.escape(_1935["@event_join_string"])+"\"";
}
if(_1935["@comment_prefix"]){
_1936+=" comment=\""+dojox.dtl._base.escape(_1935["@comment_prefix"])+"\"";
}
_1936+="/><Fields";
if(_1935["@field_split_set"]){
_1936+=" split=\""+dojox.dtl._base.escape(_1935["@field_split_set"])+"\"";
}
if(_1935["@field_join_string"]){
_1936+=" join=\""+dojox.dtl._base.escape(_1935["@field_join_string"])+"\"";
}
if(_1935["@consec_field_delims"]){
_1936+=" consume=\""+dojox.dtl._base.escape(_1935["@consec_field_delims"])+"\"";
}
_1936+="/>";
return _1936;
},_makeFieldTable:function(item){
var store=pion.codecs.config_store;
var _1939=store.getValues(item,"Field");
var _193a=[];
this.order_map=[];
for(var i=0;i<_1939.length;++i){
var _193c=[];
for(var j=0;j<this.attributes_by_column.length;++j){
_193c[j]=store.getValue(_1939[i],this.attributes_by_column[j]);
}
_193c[this.order_col_index]=i+1;
_193a.push(_193c);
this.order_map[i]=i+1;
}
return _193a;
},_setGridStructure:function(grid){
if(!plugins.codecs.CodecPane.log_codec_grid_layout){
plugins.codecs.initGridLayouts();
}
grid.setStructure(plugins.codecs.CodecPane.log_codec_grid_layout);
},_handleCellEdit:function(_193f,_1940,_1941){
console.debug("LogCodecPane._handleCellEdit inValue = ",_193f,", inRowIndex = ",_1940,", inFieldIndex = ",_1941);
dojo.addClass(this.domNode,"unsaved_changes");
if(_1941==this.order_col_index){
var _1942=this.order_map[_1940];
var _1943=this.order_map;
console.debug("1: order_map = ",_1943);
_1943[_1940]=_193f;
if(_193f>_1942){
for(var i=0;i<_1943.length;++i){
if(_1943[i]>_1942&&_1943[i]<=_193f&&i!=_1940){
_1943[i]--;
}
}
}else{
for(var i=0;i<_1943.length;++i){
if(_1943[i]>=_193f&&_1943[i]<_1942&&i!=_1940){
_1943[i]++;
}
}
}
console.debug("2: order_map = ",_1943);
var _1945=[];
for(var i=0;i<_1943.length;++i){
var row=plugins.codecs.CodecPane.grid_model.getRow(i);
row[this.order_col_index]=_1943[i];
_1945.push(row);
}
plugins.codecs.CodecPane.grid_model.setData(_1945);
}
},_makeFieldElements:function(){
var _1947=plugins.codecs.CodecPane.grid_model.getRowCount();
var _1948=[];
for(var i=0;i<_1947;++i){
if(this.order_map.length==_1947){
_1948[this.order_map[i]-1]=i;
}else{
_1948[i]=i;
}
}
console.debug("this.order_map = ",this.order_map);
console.debug("inverse_order_map = ",_1948);
var _194a="";
for(var i=0;i<_1947;++i){
var row=plugins.codecs.CodecPane.grid_model.getRow(_1948[i]);
_194a+="<Field term=\""+row[1]+"\"";
if(row[2]){
_194a+=" start=\""+dojox.dtl._base.escape(row[2])+"\"";
}
if(row[3]){
_194a+=" end=\""+dojox.dtl._base.escape(row[3])+"\"";
}
if(row[4]){
_194a+=" optional=\"true\"";
}
if(row[5]){
_194a+=" escape=\""+dojox.dtl._base.escape(row[5])+"\"";
}
if(row[6]){
_194a+=" empty=\""+dojox.dtl._base.escape(row[6])+"\"";
}
_194a+=">"+row[0]+"</Field>";
}
return _194a;
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
var _194f=this.form.getValues();
_194f["@field_split_set"]="";
_194f["@field_join_string"]="";
this.form.setValues(_194f);
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
pion.codecs.config_store.fetchItemByIdentity=function(_1954){
pion.codecs.config_store.fetch({query:{"@id":_1954.identity},onItem:_1954.onItem,onError:pion.handleFetchError});
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
var _1959=pion.codecs.config_store.getValue(item,"Plugin");
var _195a=document.createElement("span");
var _195b="plugins.codecs."+_1959+"Pane";
var _195c=dojo.getObject(_195b);
if(_195c){
console.debug("found class ",_195b);
var _195d=new _195c({"class":"codec_pane",title:title},_195a);
}else{
console.debug("class ",_195b," not found; using plugins.codecs.CodecPane instead.");
var _195d=new plugins.codecs.CodecPane({"class":"codec_pane",title:title},_195a);
}
_195d.config_item=item;
_195d.uuid=pion.codecs.config_store.getValue(item,"@id");
dijit.byId("codec_config_accordion").addChild(_195d);
return _195d;
};
pion.codecs.createNewPaneFromStore=function(id,_195f){
pion.codecs.config_store.fetch({query:{"@id":id},onItem:function(item){
var _1961=pion.codecs.createNewPaneFromItem(item);
if(_195f){
pion.codecs._adjustAccordionSize();
dijit.byId("codec_config_accordion").selectChild(_1961);
}
},onError:pion.handleFetchError});
};
function onComplete(items,_1963){
var _1964=dijit.byId("codec_config_accordion");
for(var i=0;i<items.length;++i){
pion.codecs.createNewPaneFromItem(items[i]);
}
var _1966=_1964.getChildren()[0];
_1964.selectChild(_1966);
};
if(file_protocol){
dijit.byId("codec_config_accordion").removeChild(selected_codec_pane);
}else{
codec_config_store.fetch({onComplete:onComplete,onError:pion.handleFetchError});
}
dojo.connect(dojo.byId("add_new_codec_button"),"click",addNewCodec);
};
function addNewCodec(){
var _1967=new plugins.codecs.CodecInitDialog({title:"Add New Codec"});
setTimeout(function(){
dojo.query("input",_1967.domNode)[0].select();
},500);
_1967.show();
_1967.execute=function(_1968){
console.debug(_1968);
var _1969="<PionConfig><Codec>";
for(var tag in _1968){
console.debug("dialogFields[",tag,"] = ",_1968[tag]);
_1969+="<"+tag+">"+_1968[tag]+"</"+tag+">";
}
if(plugins.codecs[_1968.Plugin]&&plugins.codecs[_1968.Plugin].custom_post_data){
_1969+=plugins.codecs[_1968.Plugin].custom_post_data;
}
_1969+="</Codec></PionConfig>";
console.debug("post_data: ",_1969);
dojo.rawXhrPost({url:"/config/codecs",contentType:"text/xml",handleAs:"xml",postData:_1969,load:function(_196b){
var node=_196b.getElementsByTagName("Codec")[0];
var id=node.getAttribute("id");
console.debug("id (from server): ",id);
pion.codecs.createNewPaneFromStore(id,true);
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1969})});
};
};
pion.codecs._adjustAccordionSize=function(){
var _196e=dijit.byId("codec_config_accordion");
var _196f=_196e.getChildren().length;
console.debug("num_codecs = "+_196f);
var _1970=selected_codec_pane.getHeight();
var _1971=0;
if(_196f>0){
var _1972=_196e.getChildren()[0];
_1971=_1972.getTitleHeight();
}
var _1973=_1970+_196f*_1971;
_196e.resize({h:_1973});
pion.codecs.height=_1973+160;
dijit.byId("main_stack_container").resize({h:pion.codecs.height});
};
function codecPaneSelected(pane){
console.debug("Selected "+pane.title);
if(pane==selected_codec_pane){
return;
}
if(selected_codec_pane&&dojo.hasClass(selected_codec_pane.domNode,"unsaved_changes")){
var _1975=new dijit.Dialog({title:"Warning: unsaved changes"});
_1975.setContent("Please save or cancel unsaved changes before selecting another Codec.");
_1975.show();
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
var _1978=dijit.byId("codec_config_accordion").duration;
setTimeout(function(){
dojo.style(pane.containerNode,"overflow","hidden");
pion.codecs._adjustAccordionSize();
},_1978+50);
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
this.comparison_store=new dojo.data.ItemFileWriteStore({data:{identifier:"ID",items:[]}});
this.comparison_store.next_id=0;
this._populateComparisonStore();
},reloadComparisonStore:function(){
var _this=this;
this.comparison_store.fetch({onItem:function(item){
_this.comparison_store.deleteItem(item);
},onComplete:function(){
_this._populateComparisonStore();
},onError:pion.handleFetchError});
},onDonePopulatingComparisonStore:function(){
},_populateComparisonStore:function(){
var _this=this;
var store=pion.reactors.config_store;
store.fetch({query:{"@id":this.config["@id"]},onItem:function(item){
var _197e=store.getValues(item,"Comparison");
for(var i=0;i<_197e.length;++i){
var _1980={ID:_this.comparison_store.next_id++,Term:store.getValue(_197e[i],"Term"),Type:store.getValue(_197e[i],"Type")};
if(store.hasAttribute(_197e[i],"Value")){
_1980.Value=store.getValue(_197e[i],"Value");
}
_this.comparison_store.newItem(_1980);
}
},onComplete:function(){
_this.updateNamedCustomPutData("custom_put_data_from_config");
_this.onDonePopulatingComparisonStore();
},onError:pion.handleFetchError});
},_updateCustomData:function(){
this.custom_put_data_from_config=this.custom_put_data_from_comparison_store;
},_insertCustomData:function(){
this.put_data+=this.custom_put_data_from_config;
},updateNamedCustomPutData:function(_1981){
var _1982="";
var _this=this;
var store=this.comparison_store;
store.fetch({onItem:function(item){
_1982+="<Comparison>";
_1982+="<Term>"+store.getValue(item,"Term")+"</Term>";
_1982+="<Type>"+store.getValue(item,"Type")+"</Type>";
var value=store.getValue(item,"Value");
if(value&&value.toString()){
_1982+="<Value>"+value+"</Value>";
}
_1982+="</Comparison>";
},onComplete:function(){
_this[_1981]=_1982;
},onError:pion.handleFetchError});
}});
plugins.reactors.FilterReactor.label="Filter Reactor";
dojo.declare("plugins.reactors.FilterReactorDialog",[plugins.reactors.ReactorDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Filter Reactor Configuration</span>\r\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\">\r\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" class=\"id_text_box\" disabled=\"true\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t</div>\r\n\t<h3>Comparisons</h3>\r\n\t<div dojoAttachPoint=\"comparison_grid_node\"></div>\r\n\t<button dojoAttachPoint=\"add_new_comparison_button\" dojoType=dijit.form.Button dojoAttachEvent=\"onClick:_handleAddNewComparison\" class=\"add_new_row\">ADD NEW COMPARISON</button>\r\n\t<h3>Input Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_inputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_inputs_grid_model\"\r\n\t\t structure=\"reactor_inputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<h3>Output Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_outputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_outputs_grid_model\"\r\n\t\t structure=\"reactor_outputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"delete\">Delete Reactor</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
var _this=this;
var h=dojo.connect(this.reactor,"onDonePopulatingComparisonStore",function(){
_this._updateCustomPutDataFromComparisonStore();
_this.connect(_this.reactor.comparison_store,"onNew","_updateCustomPutDataFromComparisonStore");
_this.connect(_this.reactor.comparison_store,"onSet","_updateCustomPutDataFromComparisonStore");
_this.connect(_this.reactor.comparison_store,"onDelete","_updateCustomPutDataFromComparisonStore");
dojo.disconnect(h);
});
this.reactor.reloadComparisonStore();
this.comparison_grid_layout=[{defaultCell:{width:8,editable:true,type:dojox.grid.cells._Widget,styles:"text-align: right;"},rows:[{field:"Term",name:"Term",width:20,widgetClass:"dijit.form.FilteringSelect",widgetProps:{store:pion.terms.store,searchAttr:"id",keyAttr:"id"}},{field:"Type",name:"Comparison",width:15,widgetClass:"dijit.form.FilteringSelect",widgetProps:{store:pion.reactors.comparison_type_store,query:{category:"generic"}}},{field:"Value",name:"Value",width:"auto"},{name:"Delete",styles:"align: center;",width:3,editable:false,value:"<button dojoType=dijit.form.Button class=\"delete_row\"><img src=\"images/icon-delete.png\" alt=\"DELETE\" border=\"0\" /></button>"},]}];
this.comparison_grid=new dojox.grid.DataGrid({store:this.reactor.comparison_store,structure:this.comparison_grid_layout,singleClickEdit:true,autoHeight:true},document.createElement("div"));
this.comparison_grid_node.appendChild(this.comparison_grid.domNode);
this.comparison_grid.startup();
this.comparison_grid.connect(this.comparison_grid,"onCellClick",_this._handleCellClick);
this.connect(this,"onCancel","destroyRecursive");
this.connect(this,"execute","destroyRecursive");
},uninitialize:function(){
this.comparison_grid.destroy();
},_updateCustomPutDataFromComparisonStore:function(){
this.reactor.updateNamedCustomPutData("custom_put_data_from_comparison_store");
},_insertCustomData:function(){
this.put_data+=this.reactor.custom_put_data_from_comparison_store;
},_handleCellClick:function(e){
console.debug("e.rowIndex = ",e.rowIndex,", e.cellIndex = ",e.cellIndex);
if(e.cellIndex==1){
var item=this.getItem(e.rowIndex);
var term=this.store.getValue(item,"Term").toString();
console.debug("term = ",term,", pion.terms.categories_by_id[term] = ",pion.terms.categories_by_id[term]);
this.structure[0].rows[1].widgetProps.query.category=pion.terms.categories_by_id[term];
}else{
if(e.cellIndex==3){
console.debug("Removing row ",e.rowIndex);
this.store.deleteItem(this.getItem(e.rowIndex));
}
}
},_handleAddNewComparison:function(){
this.reactor.comparison_store.newItem({ID:this.reactor.comparison_store.next_id++});
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
var _198f=store.getValues(item,"Comparison");
for(var i=0;i<_198f.length;++i){
var _1991={};
_1991.term=store.getValue(_198f[i],"Term");
_1991.type=store.getValue(_198f[i],"Type");
_1991.value=store.getValue(_198f[i],"Value");
_this.comparisons.push(_1991);
}
var _1992=store.getValues(item,"Transformation");
var _1993=plugins.reactors.TransformReactor.getBool;
for(var i=0;i<_1992.length;++i){
var _1994={};
_1994.term=store.getValue(_1992[i],"Term");
_1994.type=store.getValue(_1992[i],"Type");
_1994.value=store.getValue(_1992[i],"Value");
_1994.match_all=_1993(store,_1992[i],"MatchAllValues");
_1994.set_value=store.getValue(_1992[i],"SetValue");
_1994.in_place=_1993(store,_1992[i],"InPlace");
_1994.set_term=store.getValue(_1992[i],"SetTerm");
_this.transformations.push(_1994);
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
var _1999=pion.reactors.transform_reactor_comparison_grid_model;
this.comparison_grid.canEdit=function(cell,_199b){
switch(cell.index){
case this.value_column_index:
var type=_1999.getDatum(_199b,this.type_column_index);
return dojo.indexOf(pion.reactors.generic_comparison_types,type)==-1;
default:
return true;
}
};
this.transformation_grid.setStructure(this.transformation_grid_layout);
var _199d=pion.reactors.transform_reactor_transformation_grid_model;
this.transformation_grid.canEdit=function(cell,_199f){
switch(cell.index){
case this.value_column_index:
var type=_199d.getDatum(_199f,this.type_column_index);
return dojo.indexOf(pion.reactors.generic_comparison_types,type)==-1;
case this.set_term_column_index:
var _19a1=_199d.getDatum(_199f,this.in_place_column_index);
console.debug("in_place = ",_19a1);
if(_19a1){
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
var _19a4=store.getValues(item,"Comparison");
var cg=_this.comparison_grid;
for(var i=0;i<_19a4.length;++i){
var _19a7=[];
_19a7[cg.term_column_index]=store.getValue(_19a4[i],"Term");
_19a7[cg.type_column_index]=store.getValue(_19a4[i],"Type");
_19a7[cg.value_column_index]=store.getValue(_19a4[i],"Value");
_this.comparison_table.push(_19a7);
}
_1999.setData(_this.comparison_table);
var _19a8=store.getValues(item,"Transformation");
var tg=_this.transformation_grid;
var _19aa=plugins.reactors.TransformReactor.getBool;
for(var i=0;i<_19a8.length;++i){
var _19a7=[];
_19a7[tg.term_column_index]=store.getValue(_19a8[i],"Term");
_19a7[tg.type_column_index]=store.getValue(_19a8[i],"Type");
_19a7[tg.value_column_index]=store.getValue(_19a8[i],"Value");
_19a7[tg.match_all_column_index]=_19aa(store,_19a8[i],"MatchAllValues");
_19a7[tg.set_value_column_index]=store.getValue(_19a8[i],"SetValue");
_19a7[tg.in_place_column_index]=_19aa(store,_19a8[i],"InPlace");
_19a7[tg.set_term_column_index]=store.getValue(_19a8[i],"SetTerm");
_this.transformation_table.push(_19a7);
}
_199d.setData(_this.transformation_table);
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
},_handleComparisonGridCellEdit:function(value,_19b4,_19b5){
console.debug("value = ",value);
var grid=this.comparison_grid;
var model=pion.reactors.transform_reactor_comparison_grid_model;
switch(_19b5){
case grid.type_column_index:
var store=pion.reactors.comparison_type_store;
store.fetchItemByIdentity({identity:value,onItem:function(item){
if(store.containsValue(item,"category","generic")){
model.setDatum("",_19b4,grid.value_column_index);
}
}});
break;
default:
}
},_handleTransformationGridCellEdit:function(value,_19bb,_19bc){
console.debug("value = ",value);
var grid=this.transformation_grid;
var model=pion.reactors.transform_reactor_transformation_grid_model;
switch(_19bc){
case grid.type_column_index:
var store=pion.reactors.comparison_type_store;
store.fetchItemByIdentity({identity:value,onItem:function(item){
if(store.containsValue(item,"category","generic")){
model.setDatum("",_19bb,grid.value_column_index);
}
}});
break;
case grid.in_place_column_index:
if(value){
model.setDatum("",_19bb,grid.set_term_column_index);
}else{
if(model.getDatum(_19bb,grid.set_term_column_index)===undefined){
var _19c1=model.getDatum(_19bb,grid.term_column_index);
model.setDatum(_19c1,_19bb,grid.set_term_column_index);
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
var _19c2=pion.reactors.transform_reactor_comparison_grid_model.getRowCount();
var cg=this.comparison_grid;
for(var i=0;i<_19c2;++i){
var row=pion.reactors.transform_reactor_comparison_grid_model.getRow(i);
this.put_data+="<Comparison>";
this.put_data+="<Term>"+row[cg.term_column_index]+"</Term>";
this.put_data+="<Type>"+row[cg.type_column_index]+"</Type>";
if(row[cg.value_column_index]){
this.put_data+="<Value>"+row[cg.value_column_index]+"</Value>";
}
this.put_data+="</Comparison>";
}
var _19c6=pion.reactors.transform_reactor_transformation_grid_model.getRowCount();
var tg=this.transformation_grid;
for(var i=0;i<_19c6;++i){
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
plugins.reactors.TransformReactor.getBool=function(store,item,_19ca){
if(store.hasAttribute(item,_19ca)){
return store.getValue(item,_19ca).toString()=="true";
}else{
return plugins.reactors.TransformReactor.grid_option_defaults[_19ca];
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
var _19cd={};
var _19ce=store.getAttributes(item);
for(var i=0;i<_19ce.length;++i){
if(_19ce[i]!="tagName"&&_19ce[i]!="childNodes"){
_19cd[_19ce[i]]=store.getValue(item,_19ce[i]).toString();
}
}
console.dir(_19cd);
this.database_form.setValues(_19cd);
var _19d0=dojo.query("textarea.comment",this.database_form.domNode)[0];
_19d0.value=_19cd.Comment;
console.debug("config = ",_19cd);
this.title=_19cd.Name;
var _19d1=dojo.query(".dijitAccordionTitle .dijitAccordionText",this.domNode)[0];
_19d1.firstChild.nodeValue=this.title;
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
var _19d3=this.database_form.getValues();
var _19d4=dojo.query("textarea.comment",this.database_form.domNode)[0];
_19d3.Comment=_19d4.value;
this.put_data="<PionConfig><Database>";
for(var tag in _19d3){
if(tag!="@id"){
console.debug("config[",tag,"] = ",_19d3[tag]);
this.put_data+="<"+tag+">"+_19d3[tag]+"</"+tag+">";
}
}
if(this._insertCustomData){
this._insertCustomData();
}
this.put_data+="</Database></PionConfig>";
console.debug("put_data: ",this.put_data);
_this=this;
dojo.rawXhrPut({url:"/config/databases/"+this.uuid,contentType:"text/xml",handleAs:"xml",putData:this.put_data,load:function(_19d6){
console.debug("response: ",_19d6);
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
dojo.xhrDelete({url:"/config/databases/"+this.uuid,handleAs:"xml",timeout:5000,load:function(_19d8,_19d9){
console.debug("xhrDelete for url = /config/databases/"+this.uuid,"; HTTP status code: ",_19d9.xhr.status);
dijit.byId("database_config_accordion").forward();
dijit.byId("database_config_accordion").removeChild(_this);
pion.databases._adjustAccordionSize();
return _19d8;
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
pion.databases.config_store.fetchItemByIdentity=function(_19da){
pion.databases.config_store.fetch({query:{"@id":_19da.identity},onItem:_19da.onItem,onError:pion.handleFetchError});
};
pion.databases.config_store.getIdentity=function(item){
return pion.databases.config_store.getValue(item,"@id");
};
pion.databases._adjustAccordionSize=function(){
var _19dc=dijit.byId("database_config_accordion");
var _19dd=_19dc.getChildren().length;
console.debug("num_databases = "+_19dd);
var _19de=pion.databases.selected_pane.getHeight();
var _19df=0;
if(_19dd>0){
var _19e0=_19dc.getChildren()[0];
_19df=_19e0.getTitleHeight();
}
var _19e1=_19de+_19dd*_19df;
_19dc.resize({h:_19e1});
pion.databases.height=_19e1+160;
dijit.byId("main_stack_container").resize({h:pion.databases.height});
};
pion.databases.init=function(){
pion.databases.selected_pane=null;
var _19e2=new dojox.data.XmlStore({url:"/config/databases/plugins"});
dojo.xhrGet({url:"/config/plugins",handleAs:"xml",timeout:5000,load:function(_19e3,_19e4){
pion.available_plugins=[];
var _19e5=_19e3.getElementsByTagName("Plugin");
dojo.forEach(_19e5,function(n){
pion.available_plugins.push(dojo.isIE?n.childNodes[0].nodeValue:n.textContent);
});
var items=[];
_19e2.fetch({onItem:function(item){
var _19e9=_19e2.getValue(item,"Plugin").toString();
if(dojo.indexOf(pion.available_plugins,_19e9)!=-1){
var _19ea="plugins.databases."+_19e9;
var _19eb=dojo.getObject(_19ea);
if(!_19eb){
var path="/plugins/databases/"+_19e9+"/"+_19e9;
dojo.registerModulePath(_19ea,path);
dojo.requireIf(true,_19ea);
_19eb=dojo.getObject(_19ea);
}
console.debug("label = ",_19eb["label"]);
items.push({plugin:_19e9,label:_19eb["label"]});
}
},onComplete:function(){
pion.databases.plugin_data_store=new dojo.data.ItemFileWriteStore({data:{identifier:"plugin",items:items}});
if(file_protocol){
pion.databases._adjustAccordionSize();
}else{
pion.databases.config_store.fetch({onComplete:function(items,_19ee){
var _19ef=dijit.byId("database_config_accordion");
for(var i=0;i<items.length;++i){
pion.databases.createNewPaneFromItem(items[i]);
}
var _19f1=_19ef.getChildren()[0];
_19ef.selectChild(_19f1);
},onError:pion.handleFetchError});
}
}});
return _19e3;
},error:pion.handleXhrGetError});
function _paneSelected(pane){
console.debug("Selected "+pane.title);
var _19f3=pion.databases.selected_pane;
if(pane==_19f3){
return;
}
if(_19f3&&dojo.hasClass(_19f3.domNode,"unsaved_changes")){
var _19f4=new dijit.Dialog({title:"Warning: unsaved changes"});
_19f4.setContent("Please save or cancel unsaved changes before selecting another Database.");
_19f4.show();
setTimeout(function(){
dijit.byId("database_config_accordion").selectChild(_19f3);
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
var _19f7=dijit.byId("database_config_accordion").duration;
setTimeout(function(){
dojo.style(pane.containerNode,"overflow","hidden");
pion.databases._adjustAccordionSize();
},_19f7+50);
};
dojo.subscribe("database_config_accordion-selectChild",_paneSelected);
pion.databases.createNewPaneFromItem=function(item){
var title=pion.databases.config_store.getValue(item,"Name");
var _19fa=pion.databases.config_store.getValue(item,"Plugin");
var _19fb=document.createElement("span");
var _19fc="plugins.databases."+_19fa+"Pane";
var _19fd=dojo.getObject(_19fc);
if(_19fd){
console.debug("found class ",_19fc);
var _19fe=new _19fd({"class":"database_pane",title:title},_19fb);
}else{
console.debug("class ",_19fc," not found; using plugins.databases.DatabasePane instead.");
var _19fe=new plugins.databases.DatabasePane({"class":"database_pane",title:title},_19fb);
}
_19fe.config_item=item;
_19fe.uuid=pion.databases.config_store.getValue(item,"@id");
dijit.byId("database_config_accordion").addChild(_19fe);
return _19fe;
};
pion.databases.createNewPaneFromStore=function(id,_1a00){
pion.databases.config_store.fetch({query:{"@id":id},onItem:function(item){
var _1a02=pion.databases.createNewPaneFromItem(item);
if(_1a00){
pion.databases._adjustAccordionSize();
dijit.byId("database_config_accordion").selectChild(_1a02);
}
},onError:pion.handleFetchError});
};
function _isDuplicateDatabaseId(id){
var _1a04=dijit.byId("database_config_accordion").getChildren();
for(var i=0;i<_1a04.length;++i){
if(pion.databases.config_store.getValue(_1a04[i].config_item,"@id")==id){
return true;
}
}
return false;
};
function _isDuplicateDatabaseName(name){
var _1a07=dijit.byId("database_config_accordion").getChildren();
for(var i=0;i<_1a07.length;++i){
if(_1a07[i].title==name){
return true;
}
}
return false;
};
function _addNewDatabase(){
var _1a09=new plugins.databases.SelectPluginDialog({title:"Select Database Plugin"});
_1a09.show();
_1a09.execute=function(_1a0a){
console.debug(_1a0a);
_initNewDatabase(_1a0a["Plugin"]);
};
};
function _initNewDatabase(_1a0b){
var title="Add New "+_1a0b;
var _1a0d="plugins.databases."+_1a0b+"InitDialog";
var _1a0e=dojo.getObject(_1a0d);
if(_1a0e){
console.debug("found class ",_1a0d);
var _1a0f=new _1a0e({title:title});
}else{
console.debug("class ",_1a0d," not found; using plugins.databases.DatabaseInitDialog instead.");
var _1a0f=new plugins.databases.DatabaseInitDialog({title:title});
}
_1a0f.setValues({Plugin:_1a0b});
setTimeout(function(){
dojo.query("input",_1a0f.domNode)[0].select();
},500);
_1a0f.show();
_1a0f.execute=function(_1a10){
console.debug(_1a10);
var _1a11="<PionConfig><Database>";
for(var tag in _1a10){
console.debug("dialogFields[",tag,"] = ",_1a10[tag]);
_1a11+="<"+tag+">"+_1a10[tag]+"</"+tag+">";
}
if(this._insertCustomData){
this._insertCustomData();
}
_1a11+="</Database></PionConfig>";
console.debug("post_data: ",_1a11);
dojo.rawXhrPost({url:"/config/databases",contentType:"text/xml",handleAs:"xml",postData:_1a11,load:function(_1a13){
var node=_1a13.getElementsByTagName("Database")[0];
var id=node.getAttribute("id");
console.debug("id (from server): ",id);
pion.databases.createNewPaneFromStore(id,true);
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1a11})});
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
var _1a19=store.getValues(item,"Field");
for(var i=0;i<_1a19.length;++i){
var row=[];
row[0]=store.getValue(_1a19[i],"text()");
row[1]=store.getValue(_1a19[i],"@term");
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
var _1a20=plugins.reactors.DatabaseOutputReactorDialog.grid_model.getRowCount();
for(var i=0;i<_1a20;++i){
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
var _1a26=store.getValues(item,"Field");
for(var i=0;i<_1a26.length;++i){
var row=[];
row[0]=store.getValue(_1a26[i],"text()");
row[1]=store.getValue(_1a26[i],"@term");
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
var _1a2b=plugins.reactors.DatabaseOutputReactorDialog.grid_model.getRowCount();
for(var i=0;i<_1a2b;++i){
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
var _1a2e=dijit.byId("ops_toggle_button");
dojo.connect(_1a2e.domNode,"click",function(){
if(_1a2e.checked){
dojo.addClass(dojo.byId("counterBackground"),"hidden");
}else{
dojo.removeClass(dojo.byId("counterBackground"),"hidden");
}
});
var _1a2f=function(item,hint){
var node=dojo.doc.createElement("div");
node.id=dojo.dnd.getUniqueId();
node.className="dojoDndItem";
node.setAttribute("reactor_type",item.reactor_type);
var _1a33=dojo.doc.createElement("img");
node.appendChild(_1a33);
_1a33.setAttribute("src",item.src);
_1a33.setAttribute("width",148);
_1a33.setAttribute("height",25);
_1a33.setAttribute("alt",item.alt);
return {node:node,data:item,type:["reactor"]};
};
var _1a34={collection:collectionReactors,processing:processingReactors,storage:storageReactors};
for(var _1a35 in _1a34){
_1a34[_1a35].creator=_1a2f;
}
var store=pion.reactors.comparison_type_store;
store.fetch({query:{category:"generic"},onItem:function(item){
pion.reactors.generic_comparison_types.push(store.getValue(item,"name"));
}});
var _1a38=new dojox.data.XmlStore({url:"/config/reactors/plugins"});
dojo.xhrGet({url:"/config/plugins",handleAs:"xml",timeout:5000,load:function(_1a39,_1a3a){
pion.available_plugins=[];
var _1a3b=_1a39.getElementsByTagName("Plugin");
dojo.forEach(_1a3b,function(n){
pion.available_plugins.push(dojo.isIE?n.childNodes[0].nodeValue:n.textContent);
});
_1a38.fetch({onItem:function(item){
var _1a3e=_1a38.getValue(item,"Plugin").toString();
if(dojo.indexOf(pion.available_plugins,_1a3e)!=-1){
var _1a3f=_1a38.getValue(item,"ReactorType").toString();
var _1a40="plugins.reactors."+_1a3e;
var _1a41=dojo.getObject(_1a40);
if(!_1a41){
var path="/plugins/reactors/"+_1a3f+"/"+_1a3e+"/"+_1a3e;
dojo.registerModulePath(_1a40,path);
dojo.requireIf(true,_1a40);
_1a41=dojo.getObject(_1a40);
}
pion.reactors.categories[_1a3e]=_1a3f;
var icon=_1a3f+"/"+_1a3e+"/icon.png";
var _1a44=dojo.moduleUrl("plugins.reactors",icon);
console.debug("icon_url = ",_1a44);
_1a34[_1a3f].insertNodes(false,[{reactor_type:_1a3e,src:_1a44,alt:_1a41["label"]}]);
}
},onComplete:function(){
pion.reactors.initConfiguredReactors();
}});
return _1a39;
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
var _1a45=0;
var _1a46=0;
setInterval(function(){
if(!_1a2e.checked){
dojo.xhrGet({url:"/config/reactors/stats",preventCache:true,handleAs:"xml",timeout:1000,load:function(_1a47,_1a48){
var node=_1a47.getElementsByTagName("TotalOps")[0];
var _1a4a=parseInt(dojo.isIE?node.xml.match(/.*>(\d*)<.*/)[1]:node.textContent);
var delta=_1a4a-_1a45;
dojo.byId("global_ops").innerHTML=delta>0?delta:0;
_1a45=_1a4a;
var _1a4c=0;
var _1a4d=_1a47.getElementsByTagName("Reactor");
dojo.forEach(_1a4d,function(n){
var id=n.getAttribute("id");
var _1a50=pion.reactors.reactors_by_id[id];
if(_1a50){
if(_1a50.workspace==pion.reactors.workspace_box){
var _1a51=n.getElementsByTagName("EventsIn")[0];
var _1a52=dojo.isIE?_1a51.xml.match(/.*>(\d*)<.*/)[1]:_1a51.textContent;
var _1a53=parseInt(_1a52);
_1a50.ops_per_sec.innerHTML=_1a53-_1a50.prev_events_in;
_1a50.prev_events_in=_1a53;
_1a4c+=_1a53;
}
var _1a54=n.getElementsByTagName("Running")[0];
var _1a55=dojo.isIE?_1a54.xml.match(/.*>(\w*)<.*/)[1]:_1a54.textContent;
var _1a56=(_1a55=="true");
_1a50.run_button.attr("checked",_1a56);
}
});
delta=_1a4c-_1a46;
dojo.byId("workspace_ops").innerHTML=delta>0?delta:0;
_1a46=_1a4c;
return _1a47;
},error:pion.handleXhrGetError});
}
},1000);
}
};
pion.reactors.initProtocols=function(){
pion.protocols_config_store=new dojox.data.XmlStore({url:"/config/protocols"});
pion.protocols_config_store.fetchItemByIdentity=function(_1a57){
pion.protocols_config_store.fetch({query:{"@id":_1a57.identity},onItem:_1a57.onItem,onError:pion.handleFetchError});
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
reactor_config_store.fetch({query:{tagName:"Reactor"},onItem:function(item,_1a5b){
console.debug("fetched Reactor with id = ",reactor_config_store.getValue(item,"@id"));
var _1a5c={};
var _1a5d=reactor_config_store.getAttributes(item);
for(var i=0;i<_1a5d.length;++i){
if(_1a5d[i]!="tagName"&&_1a5d[i]!="childNodes"){
_1a5c[_1a5d[i]]=reactor_config_store.getValue(item,_1a5d[i]).toString();
}
}
pion.reactors.createReactorInConfiguredWorkspace(_1a5c);
},onComplete:function(items,_1a60){
console.debug("done fetching Reactors");
reactor_config_store.fetch({query:{tagName:"Connection"},onItem:function(item,_1a62){
pion.reactors.createConnection(reactor_config_store.getValue(item,"From").toString(),reactor_config_store.getValue(item,"To").toString(),reactor_config_store.getValue(item,"@id").toString());
},onComplete:function(items,_1a64){
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
pion.reactors.createReactorInConfiguredWorkspace=function(_1a65){
pion.reactors.workspace_box=workspaces_by_name[_1a65.Workspace];
if(!pion.reactors.workspace_box){
addWorkspace(_1a65.Workspace);
}
var _1a66=pion.reactors.workspace_box;
dijit.byId("mainTabContainer").selectChild(_1a66.my_content_pane);
var _1a67=document.createElement("div");
_1a66.node.appendChild(_1a67);
var _1a68=pion.reactors.createReactor(_1a65,_1a67);
pion.reactors.reactors_by_id[_1a65["@id"]]=_1a68;
_1a68.workspace=_1a66;
_1a66.reactors.push(_1a68);
console.debug("X, Y = ",_1a65.X,", ",_1a65.Y);
};
pion.reactors.createConnection=function(_1a69,_1a6a,_1a6b){
var _1a6c=pion.reactors.reactors_by_id[_1a69];
var _1a6d=pion.reactors.reactors_by_id[_1a6a];
pion.reactors.workspace_box=_1a6c.workspace;
var _1a6e=pion.reactors.workspace_box;
surface=_1a6e.my_surface;
dijit.byId("mainTabContainer").selectChild(_1a6e.my_content_pane);
var line=surface.createPolyline().setStroke("black");
pion.reactors.updateConnectionLine(line,_1a6c.domNode,_1a6d.domNode);
_1a6c.reactor_outputs.push({sink:_1a6d,line:line,id:_1a6b});
_1a6d.reactor_inputs.push({source:_1a6c,line:line,id:_1a6b});
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
var _1a74=new dijit.layout.ContentPane({"class":"workspacePane",title:title,style:"overflow: auto"});
var _1a75=dijit.byId("mainTabContainer");
var _1a76=dojo.marginBox(_1a75.domNode);
console.debug("margin_box = dojo.marginBox(tab_container.domNode) = ",_1a76);
var shim=document.createElement("div");
if(_1a76.w<minimum_workspace_width){
shim.style.width=minimum_workspace_width+"px";
}else{
shim.style.width=(_1a76.w-4)+"px";
}
if(_1a76.h<minimum_workspace_height){
shim.style.height=minimum_workspace_height+"px";
}
_1a74.domNode.appendChild(shim);
_1a75.addChild(_1a74,i);
var _1a78=new dojo.dnd.Target(shim,{accept:["reactor"]});
dojo.addClass(_1a78.node,"workspaceTarget");
dojo.connect(_1a78,"onDndDrop",function(_1a79,nodes,copy,_1a7c){
pion.reactors.handleDropOnWorkspace(_1a79,nodes,copy,_1a78);
});
dojo.connect(_1a78.node,"onmouseup",updateLatestMouseUpEvent);
_1a78.my_content_pane=_1a74;
_1a78.onEmpty=function(_1a7d){
};
_1a74.my_workspace_box=_1a78;
workspaces_by_name[title]=_1a78;
workspace_boxes[i]=_1a78;
_1a75.selectChild(_1a74);
_1a78.node.style.width=_1a78.node.offsetWidth+"px";
var _1a7e=dojo.marginBox(_1a78.node);
_1a7e.h-=6;
console.debug("surface_box = ",_1a7e);
_1a78.my_surface=dojox.gfx.createSurface(_1a78.node,_1a7e.w,_1a7e.h);
_1a78.reactors=[];
_1a78.isTracking=false;
if(!firefox_on_mac){
var menu=new dijit.Menu({targetNodeIds:[_1a74.controlButton.domNode,_1a78.node]});
menu.addChild(new dijit.MenuItem({label:"Edit workspace configuration",onClick:function(){
showWorkspaceConfigDialog(_1a74);
}}));
menu.addChild(new dijit.MenuItem({label:"Delete workspace",onClick:function(){
deleteWorkspaceIfConfirmed(_1a74);
}}));
}
_1a78.node.ondblclick=function(){
showWorkspaceConfigDialog(_1a74);
};
_1a74.controlButton.domNode.ondblclick=function(){
showWorkspaceConfigDialog(_1a74);
};
};
function makeScrollHandler(_1a80){
var _pane=_1a80;
var _node=_1a80.domNode;
return function(){
if(_pane.isScrolling){
return;
}
_pane.isScrolling=true;
var _1a83=function(){
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
setTimeout(_1a83,0);
};
};
function updateLatestMouseUpEvent(e){
latest_event=e;
console.debug("e = ",e);
pion.reactors.last_x=e.clientX;
pion.reactors.last_y=e.clientY;
};
pion.reactors.getNearbyGridPointInBox=function(_1a85,_1a86){
var c=_1a85;
c.l+=STEP-1;
c.l-=c.l%STEP;
c.t+=STEP-1;
c.t-=c.t%STEP;
var _1a88={};
_1a88.l=_1a86.l<c.l?c.l:c.r<_1a86.l?c.r:_1a86.l;
_1a88.t=_1a86.t<c.t?c.t:c.b<_1a86.t?c.b:_1a86.t;
_1a88.l-=_1a88.l%STEP;
_1a88.t-=_1a88.t%STEP;
return _1a88;
};
pion.reactors.updateConnectionLine=function(poly,_1a8a,_1a8b){
var x1=_1a8a.offsetLeft+_1a8a.offsetWidth/2;
var y1=_1a8a.offsetTop+_1a8a.offsetHeight/2;
if(_1a8b.offsetTop>y1){
var x2=_1a8b.offsetLeft+_1a8b.offsetWidth/2;
var y2=_1a8b.offsetTop;
var a1={x:x2-5,y:y2-5};
var a2={x:x2+5,y:y2-5};
}else{
if(_1a8b.offsetTop+_1a8b.offsetHeight<y1){
var x2=_1a8b.offsetLeft+_1a8b.offsetWidth/2;
var y2=_1a8b.offsetTop+_1a8b.offsetHeight;
var a1={x:x2-5,y:y2+5};
var a2={x:x2+5,y:y2+5};
}else{
if(_1a8b.offsetLeft>x1){
var x2=_1a8b.offsetLeft;
var y2=y1;
var a1={x:x2-5,y:y2-5};
var a2={x:x2-5,y:y2+5};
}else{
var x2=_1a8b.offsetLeft+_1a8b.offsetWidth;
var y2=y1;
var a1={x:x2+5,y:y2-5};
var a2={x:x2+5,y:y2+5};
}
}
}
poly.setShape([{x:x1,y:y1},{x:x2,y:y1},{x:x2,y:y2},a1,{x:x2,y:y2},a2]).setStroke("black");
};
pion.reactors.createReactor=function(_1a92,node){
plugin_class_name="plugins.reactors."+_1a92.Plugin;
var _1a94=dojo.getObject(plugin_class_name);
if(_1a94){
console.debug("found class ",plugin_class_name);
var _1a95=new _1a94({config:_1a92},node);
}else{
console.debug("class ",plugin_class_name," not found; using plugins.reactors.Reactor instead.");
var _1a95=new plugins.reactors.Reactor({config:_1a92},node);
}
return _1a95;
};
pion.reactors.handleDropOnWorkspace=function(_1a96,nodes,copy,_1a99){
console.debug("handleDropOnWorkspace called, target.node = ",_1a99.node,", workspace_box.node = ",pion.reactors.workspace_box.node);
dojo.query(".dojoDndItem",pion.reactors.workspace_box.node).forEach(function(n){
if(n.getAttribute("dndType")=="connector"){
console.debug("Removing ",n);
pion.reactors.workspace_box.node.removeChild(n);
}
});
if(!_1a99.checkAcceptance(_1a96,nodes)){
return;
}
if(_1a99!=pion.reactors.workspace_box){
return;
}
var _1a9b=nodes[0].getAttribute("reactor_type");
var _1a9c="plugins.reactors."+_1a9b+"InitDialog";
console.debug("dialog_class_name: ",_1a9c);
var _1a9d=dojo.getObject(_1a9c);
if(_1a9d){
var _1a9e=new _1a9d();
}else{
var _1a9e=new plugins.reactors.ReactorInitDialog({title:_1a9b+" Initialization",plugin:_1a9b});
}
setTimeout(function(){
dojo.query("input",_1a9e.domNode)[0].select();
},500);
dojo.query(".dijitButton.cancel",_1a9e.domNode).forEach(function(n){
dojo.connect(n,"click",_1a9e,"onCancel");
});
_1a9e.show();
};
pion.reactors.handleDropOnReactor=function(_1aa0,nodes,copy,_1aa3){
var _1aa4=pion.reactors.workspace_box;
console.debug("handleDropOnReactor called, target.node.getAttribute(\"reactor_type\") = ",_1aa3.node.getAttribute("reactor_type"));
if(!_1aa3.node.getAttribute("reactor_type")){
return;
}
dojo.query(".dojoDndItem",_1aa3.node).forEach(function(n){
_1aa3.node.removeChild(n);
});
if(_1aa4.isTracking){
return;
}
console.debug("nodes[0].getAttribute(\"dndType\") = ",nodes[0].getAttribute("dndType"));
console.debug("nodes[0].getAttribute(\"reactor_type\") = ",nodes[0].getAttribute("reactor_type"));
if(nodes[0].getAttribute("dndType")!="connector"){
console.debug("returning because nodes[0].getAttribute(\"dndType\") != \"connector\"");
return;
}
_1aa4.isTracking=true;
var x1=_1aa3.node.offsetLeft+_1aa3.node.offsetWidth;
var y1=_1aa3.node.offsetTop+_1aa3.node.offsetHeight/2;
console.debug("x1 = ",x1,", y1 = ",y1);
_1aa4.trackLine=surface.createPolyline([{x:x1,y:y1},{x:x1+20,y:y1},{x:x1+15,y:y1-5},{x:x1+20,y:y1},{x:x1+15,y:y1+5}]).setStroke("black");
var _1aa8=dojo.byId("reactor_config_content").offsetLeft;
var _1aa9=dojo.byId("reactor_config_content").offsetTop;
_1aa9+=dojo.byId("reactor_config").offsetTop;
console.debug("xOffset = ",_1aa8,", yOffset = ",_1aa9);
mouseConnection=dojo.connect(_1aa4.node,"onmousemove",function(event){
var x2=event.clientX-_1aa8;
var y2=event.clientY-_1aa9;
_1aa4.trackLine.setShape([{x:x1,y:y1},{x:x2,y:y1},{x:x2,y:y2}]);
});
console.debug("created mouseConnection");
wrapperWithStartpoint=function(event){
dojo.disconnect(mouseConnection);
console.debug("disconnected mouseConnection");
_1aa4.trackLine.removeShape();
handleSelectionOfConnectorEndpoint(event,_1aa3.node);
};
dojo.query(".moveable").filter(function(n){
return n!=_1aa3.node;
}).forEach("item.onClickHandler = dojo.connect(item, 'click', wrapperWithStartpoint)");
};
function handleSelectionOfConnectorEndpoint(event,_1ab0){
pion.reactors.workspace_box.isTracking=false;
console.debug("handleSelectionOfConnectorEndpoint: event = ",event);
var _1ab1=dijit.byNode(_1ab0);
console.debug("source_reactor = ",_1ab1);
var _1ab2=dijit.byNode(event.target);
if(!_1ab2){
_1ab2=dijit.byNode(event.target.parentNode);
}
console.debug("sink_reactor = ",_1ab2);
dojo.query(".moveable").forEach("dojo.disconnect(item.onClickHandler)");
var _1ab3="<PionConfig><Connection><Type>reactor</Type>"+"<From>"+_1ab1.config["@id"]+"</From>"+"<To>"+_1ab2.config["@id"]+"</To>"+"</Connection></PionConfig>";
dojo.rawXhrPost({url:"/config/connections",contentType:"text/xml",handleAs:"xml",postData:_1ab3,load:function(_1ab4){
var node=_1ab4.getElementsByTagName("Connection")[0];
var id=node.getAttribute("id");
console.debug("connection id (from server): ",id);
var line=surface.createPolyline().setStroke("black");
pion.reactors.updateConnectionLine(line,_1ab1.domNode,_1ab2.domNode);
_1ab1.reactor_outputs.push({sink:_1ab2,line:line,id:id});
_1ab2.reactor_inputs.push({source:_1ab1,line:line,id:id});
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1ab3})});
};
pion.reactors.showReactorConfigDialog=function(_1ab8){
var _1ab9="plugins.reactors."+_1ab8.config.Plugin+"Dialog";
console.debug("dialog_class_name = ",_1ab9);
var _1aba=dojo.getObject(_1ab9);
if(_1aba){
var _1abb=new _1aba({reactor:_1ab8});
}else{
var _1abb=new plugins.reactors.ReactorDialog({title:_1ab8.config.Plugin+" Configuration",reactor:_1ab8});
}
_1abb.setValues(_1ab8.config);
var _1abc=[];
for(var i=0;i<_1ab8.reactor_inputs.length;++i){
var _1abe=[];
_1abe[0]=_1ab8.reactor_inputs[i].source.config.Name;
_1abe[1]=_1ab8.reactor_inputs[i].id;
_1abc.push(_1abe);
}
pion.reactors.reactor_inputs_grid_model.setData(_1abc);
var _1abf=_1abb.reactor_inputs_grid;
setTimeout(function(){
_1abf.update();
_1abf.resize();
},200);
dojo.connect(_1abf,"onCellClick",function(e){
console.debug("e.rowIndex = ",e.rowIndex,", e.cellIndex = ",e.cellIndex);
if(e.cellIndex==2){
console.debug("Removing connection in row ",e.rowIndex);
var _1ac1=_1ab8.reactor_inputs[e.rowIndex];
dojo.xhrDelete({url:"/config/connections/"+_1ac1.id,handleAs:"xml",timeout:5000,load:function(_1ac2,_1ac3){
console.debug("xhrDelete for url = /config/connections/",_1ac1.id,"; HTTP status code: ",_1ac3.xhr.status);
_1abf.removeSelectedRows();
var _1ac4=_1ac1.source;
_1ac1.line.removeShape();
_1ab8.reactor_inputs.splice(e.rowIndex,1);
for(var j=0;j<_1ac4.reactor_outputs.length;++j){
if(_1ac4.reactor_outputs[j].sink==_1ab8){
_1ac4.reactor_outputs.splice(j,1);
break;
}
}
return _1ac2;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
}
});
var _1ac6=[];
for(var i=0;i<_1ab8.reactor_outputs.length;++i){
var _1ac7=[];
_1ac7[0]=_1ab8.reactor_outputs[i].sink.config.Name;
_1ac7[1]=_1ab8.reactor_outputs[i].id;
_1ac6.push(_1ac7);
}
pion.reactors.reactor_outputs_grid_model.setData(_1ac6);
var _1ac8=_1abb.reactor_outputs_grid;
setTimeout(function(){
_1ac8.update();
_1ac8.resize();
},200);
dojo.connect(_1ac8,"onCellClick",function(e){
console.debug("e.rowIndex = ",e.rowIndex,", e.cellIndex = ",e.cellIndex);
if(e.cellIndex==2){
console.debug("Removing connection in row ",e.rowIndex);
var _1aca=_1ab8.reactor_outputs[e.rowIndex];
dojo.xhrDelete({url:"/config/connections/"+_1aca.id,handleAs:"xml",timeout:5000,load:function(_1acb,_1acc){
console.debug("xhrDelete for url = /config/connections/",_1aca.id,"; HTTP status code: ",_1acc.xhr.status);
_1ac8.removeSelectedRows();
var _1acd=_1aca.sink;
_1aca.line.removeShape();
_1ab8.reactor_outputs.splice(e.rowIndex,1);
for(var j=0;j<_1acd.reactor_inputs.length;++j){
if(_1acd.reactor_inputs[j].source==_1ab8){
_1acd.reactor_inputs.splice(j,1);
break;
}
}
return _1acb;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
}
});
dojo.query(".dijitComboBox[name='event_type']",_1abb.domNode).forEach(function(n){
dijit.byNode(n).setValue(_1ab8.event_type||1);
});
dojo.query(".dijitButton.delete",_1abb.domNode).forEach(function(n){
dojo.connect(n,"click",function(){
_1abb.onCancel();
pion.reactors.deleteReactorIfConfirmed(_1ab8);
});
});
dojo.query(".dijitButton.cancel",_1abb.domNode).forEach(function(n){
dojo.connect(n,"click",_1abb,"onCancel");
});
dojo.query(".dijitButton.save",_1abb.domNode).forEach(function(n){
dijit.byNode(n).onClick=function(){
return _1abb.isValid();
};
});
setTimeout(function(){
dojo.query("input",_1abb.domNode)[0].select();
},500);
_1abb.show();
};
pion.reactors.showXMLDialog=function(_1ad3){
window.open("/config/reactors/"+_1ad3.config["@id"]);
};
pion.reactors.deleteReactorIfConfirmed=function(_1ad4){
var _1ad5=dijit.byId("delete_confirmation_dialog");
dojo.byId("are_you_sure").innerHTML="Are you sure you want to delete this reactor?";
dojo.byId("confirm_delete").onclick=function(){
_1ad5.onCancel();
deleteReactor(_1ad4);
};
dojo.byId("cancel_delete").onclick=function(){
_1ad5.onCancel();
};
_1ad5.show();
setTimeout("dijit.byId('cancel_delete').focus()",500);
};
function deleteReactor(_1ad6){
console.debug("deleting ",_1ad6.config.Name);
dojo.xhrDelete({url:"/config/reactors/"+_1ad6.config["@id"],handleAs:"xml",timeout:5000,load:function(_1ad7,_1ad8){
console.debug("xhrDelete for url = /config/reactors/",_1ad6.config["@id"],"; HTTP status code: ",_1ad8.xhr.status);
for(var i=0;i<_1ad6.reactor_inputs.length;++i){
var _1ada=_1ad6.reactor_inputs[i].source;
_1ad6.reactor_inputs[i].line.removeShape();
for(var j=0;j<_1ada.reactor_outputs.length;++j){
if(_1ada.reactor_outputs[j].sink==_1ad6){
_1ada.reactor_outputs.splice(j,1);
}
}
}
for(var i=0;i<_1ad6.reactor_outputs.length;++i){
var _1adc=_1ad6.reactor_outputs[i].sink;
_1ad6.reactor_outputs[i].line.removeShape();
for(var j=0;j<_1adc.reactor_inputs.length;++j){
if(_1adc.reactor_inputs[j].source==_1ad6){
_1adc.reactor_inputs.splice(j,1);
}
}
}
var _1add=pion.reactors.workspace_box;
_1add.node.removeChild(_1ad6.domNode);
for(var j=0;j<_1add.reactors.length;++j){
if(_1add.reactors[j]==_1ad6){
_1add.reactors.splice(j,1);
}
}
if(_1add.reactors.length==0){
_1add.onEmpty(_1add.my_content_pane);
}
return _1ad7;
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
var _1adf=pion.reactors.workspace_box;
var _1ae0=_1adf.my_content_pane.domNode.offsetWidth;
var _1ae1=_1adf.my_content_pane.domNode.offsetHeight;
_1ae0-=2;
_1ae1-=6;
var _1ae2=surface.getDimensions();
var _1ae3=parseInt(_1ae2.width);
var _1ae4=parseInt(_1ae2.height);
console.debug("old_width = ",_1ae3,", new_width = ",_1ae0,", old_height = ",_1ae4,", new_height = ",_1ae1);
if(_1ae0>_1ae3){
console.debug("expanding workspace width to ",_1ae0,"px");
_1adf.node.style.width=_1ae0+"px";
_1ae2.width=_1ae0;
}
if(_1ae1>_1ae4){
console.debug("expanding workspace height to ",_1ae1,"px");
_1adf.node.style.height=_1ae1+"px";
_1ae2.height=_1ae1;
}
if(_1ae0>_1ae3||_1ae1>_1ae4){
surface.setDimensions(parseInt(_1ae2.width)+"px",parseInt(_1ae2.height)+"px");
}
};
function handleKeyPress(e){
var _1ae6=pion.reactors.workspace_box;
if(e.keyCode==dojo.keys.ESCAPE){
if(_1ae6.isTracking){
dojo.disconnect(mouseConnection);
_1ae6.trackLine.removeShape();
_1ae6.isTracking=false;
}
}
};
function showWorkspaceConfigDialog(_1ae7){
console.debug("showWorkspaceConfigDialog: workspace_pane = ",_1ae7);
console.debug("workspace_pane.title = ",_1ae7.title);
var _1ae8=dijit.byId("workspace_name");
_1ae8.isValid=function(_1ae9){
if(!this.validator(this.textbox.value,this.constraints)){
this.invalidMessage="Invalid Workspace name";
console.debug("validationTextBox.isValid returned false");
return false;
}
if(isDuplicateWorkspaceName(_1ae7,this.textbox.value)){
this.invalidMessage="A Workspace with this name already exists";
console.debug("In validationTextBox.isValid, isDuplicateWorkspaceName returned true");
return false;
}
console.debug("validationTextBox.isValid returned true");
return true;
};
_1ae8.setDisplayedValue(_1ae7.title);
var _1aea=dijit.byId("workspace_dialog");
dojo.query(".dijitButton.delete",_1aea.domNode).forEach(function(n){
dojo.connect(n,"click",function(){
_1aea.onCancel();
deleteWorkspaceIfConfirmed(_1ae7);
});
});
dojo.query(".dijitButton.cancel",_1aea.domNode).forEach(function(n){
dojo.connect(n,"click",_1aea,"onCancel");
});
dojo.query(".dijitButton.save",_1aea.domNode).forEach(function(n){
dijit.byNode(n).onClick=function(){
return _1aea.isValid();
};
});
setTimeout(function(){
dojo.query("input",_1aea.domNode)[0].select();
},500);
_1aea.show();
_1aea.execute=function(_1aee){
updateWorkspaceConfig(_1aee,_1ae7);
};
};
function updateWorkspaceConfig(_1aef,node){
node.title=_1aef.name;
dojo.byId(node.controlButton.id).innerHTML=_1aef.name;
};
function isDuplicateWorkspaceName(_1af1,name){
for(var i=0;i<workspace_boxes.length;++i){
if(workspace_boxes[i].my_content_pane!=_1af1&&workspace_boxes[i].my_content_pane.title==name){
return true;
}
}
return false;
};
function deleteWorkspaceIfConfirmed(_1af4){
if(_1af4.my_workspace_box.reactors.length==0){
_deleteEmptyWorkspace(_1af4);
return;
}
var _1af5=dijit.byId("delete_confirmation_dialog");
dojo.byId("are_you_sure").innerHTML="Are you sure you want to delete workspace '"+_1af4.title+"' and all the reactors it contains?";
dojo.byId("confirm_delete").onclick=function(){
_1af5.onCancel();
deleteWorkspace(_1af4);
};
dojo.byId("cancel_delete").onclick=function(){
_1af5.onCancel();
};
_1af5.show();
setTimeout("dijit.byId('cancel_delete').focus()",500);
};
function deleteWorkspace(_1af6){
var _1af7=[];
for(var i=0;i<_1af6.my_workspace_box.reactors.length;++i){
_1af7[i]=_1af6.my_workspace_box.reactors[i];
}
for(i=0;i<_1af7.length;++i){
deleteReactor(_1af7[i]);
}
dojo.connect(_1af6.my_workspace_box,"onEmpty",_deleteEmptyWorkspace);
};
function _deleteEmptyWorkspace(_1af9){
console.debug("deleting ",_1af9.title);
delete workspaces_by_name[_1af9.title];
for(var j=0;j<workspace_boxes.length;++j){
if(workspace_boxes[j]==_1af9.my_workspace_box){
workspace_boxes.splice(j,1);
}
}
dijit.byId("mainTabContainer").removeChild(_1af9);
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
},execute:function(_1b02){
var pane=pion.vocabularies.selected_pane;
var _1b04={ID:_1b02["@id"],Type:_1b02.Type,Comment:_1b02.Comment};
_1b04.Format=_1b02.Format?_1b02.Format:"-";
_1b04.Size=_1b02.Size?_1b02.Size:"-";
pane.working_store.newItem(_1b04);
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
dojo.connect(this.vocab_grid,"onStartEdit",function(_1b08,_1b09){
console.debug("***** onStartEdit: inCell = ",_1b08,", inRowIndex = ",_1b09);
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
var _1b0c={};
_1b0c.ID=_this.vocab_term_store.getValue(item,"@id").split("#")[1];
var type=_this.vocab_term_store.getValue(item,"Type");
_1b0c.Type=pion.terms.type_descriptions_by_name[type.toString()];
_1b0c.Format=_this.vocab_term_store.getValue(type,"@format");
_1b0c.Size=_this.vocab_term_store.getValue(type,"@size");
var _1b0e=_this.vocab_term_store.getValue(item,"Comment");
if(_1b0e){
_1b0c.Comment=_1b0e.toString();
}
_this.items.push(_1b0c);
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
this.vocab_store.fetch({query:{"tagName":"Vocabulary"},onComplete:function(items,_1b13){
console.debug("vocab_store.fetch.onComplete: items.length = ",items.length);
_this.vocab_item=items[0];
_this.populateFromVocabItem();
},onError:pion.handleFetchError});
},populateFromVocabItem:function(){
this.config.Name=this.vocab_store.getValue(this.vocab_item,"Name").toString();
var _1b14=this.vocab_store.getValue(this.vocab_item,"Comment");
if(_1b14){
this.config.Comment=_1b14.toString();
}
var _1b15=this.vocab_store.getValue(this.vocab_item,"Locked");
this.config.Locked=(typeof _1b15!=="undefined")&&_1b15.toString()=="true";
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
var _1b16=dojo.clone(this.config);
_1b16.checkboxes=this.config.Locked?["locked"]:[];
this.form.attr("value",_1b16);
var _1b17=dojo.query("textarea.comment",this.form.domNode)[0];
_1b17.value=this.config.Comment?this.config.Comment:"";
this.title=this.config.Name;
var _1b18=dojo.query(".dijitAccordionTitle .dijitAccordionText",this.domNode)[0];
_1b18.firstChild.nodeValue=this.title;
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
var _1b1d="-";
if(e.cellIndex==2){
if(type=="specific date"||type=="specific time"||type=="specific time & date"){
_1b1d=".*%.*";
}
}
if(e.cellIndex==3){
if(type=="fixed-length string"){
_1b1d="[1-9][0-9]*";
}
}
if(e.cell.editor.editor){
console.debug("e.cell.editor.editor.regExp set to ",_1b1d);
e.cell.editor.editor.regExp=_1b1d;
}else{
console.debug("e.cell.editorProps.regExp set to ",_1b1d);
e.cell.editorProps.regExp=_1b1d;
}
}
},_handleAddNewTerm:function(){
console.debug("_handleAddNewTerm");
var _1b1e=new plugins.vocabularies.TermInitDialog();
setTimeout(function(){
dojo.query("input",_1b1e.domNode)[0].select();
},500);
_1b1e.show();
},_handleLockingChange:function(){
console.debug("_handleLockingChange");
},save:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
this.saveVocabConfig();
this.saveChangedTerms();
},saveVocabConfig:function(){
var _this=this;
var _1b20=this.form.attr("value");
this.config.Name=_1b20.Name;
this.config.Locked=dojo.indexOf(_1b20.checkboxes,"locked")>=0;
var _1b21=dojo.query("textarea.comment",this.form.domNode)[0];
this.config.Comment=_1b21.value;
var _1b22="<PionConfig><Vocabulary>";
for(var tag in this.config){
if(tag!="@id"){
_1b22+="<"+tag+">"+this.config[tag]+"</"+tag+">";
}
}
_1b22+="</Vocabulary></PionConfig>";
console.debug("put_data: ",_1b22);
_this=this;
dojo.rawXhrPut({url:"/config/vocabularies/"+this.config["@id"],contentType:"text/xml",handleAs:"xml",putData:_1b22,load:function(_1b24){
console.debug("response: ",_1b24);
_this.populateFromVocabStore();
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_1b22})});
},saveChangedTerms:function(){
var store=this.working_store;
var _this=this;
var ID,url;
store._saveCustom=function(_1b29,_1b2a){
for(ID in this._pending._modifiedItems){
url=dojox.dtl.filter.strings.urlencode("/config/terms/"+_this.config["@id"]+"#"+ID);
console.debug("_saveCustom: url = ",url);
this.fetchItemByIdentity({identity:ID,onItem:function(item){
var _1b2c="<PionConfig><Term><Type";
var _1b2d=store.getValue(item,"Format");
if(_1b2d&&_1b2d!="-"){
_1b2c+=" format=\""+_1b2d+"\"";
}
var size=store.getValue(item,"Size");
if(size&&size!="-"){
_1b2c+=" size=\""+size+"\"";
}
_1b2c+=">"+pion.terms.types_by_description[store.getValue(item,"Type")]+"</Type>";
if(store.getValue(item,"Comment")){
_1b2c+="<Comment>"+store.getValue(item,"Comment")+"</Comment>";
}
_1b2c+="</Term></PionConfig>";
console.debug("put_data = ",_1b2c);
dojo.rawXhrPut({url:url,handleAs:"xml",timeout:1000,contentType:"text/xml",putData:_1b2c,load:function(_1b2f,_1b30){
console.debug("rawXhrPut for url = "+this.url,"; HTTP status code: ",_1b30.xhr.status);
return _1b2f;
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_1b2c})});
},onError:pion.handleFetchError});
}
for(ID in this._pending._newItems){
url=dojox.dtl.filter.strings.urlencode("/config/terms/"+_this.config["@id"]+"#"+ID);
console.debug("_saveCustom: url = ",url);
var item=this._pending._newItems[ID];
var _1b32="<PionConfig><Term><Type";
var _1b33=store.getValue(item,"Format");
if(_1b33&&_1b33!="-"){
_1b32+=" format=\""+_1b33+"\"";
}
var size=store.getValue(item,"Size");
if(size&&size!="-"){
_1b32+=" size=\""+size+"\"";
}
_1b32+=">"+pion.terms.types_by_description[store.getValue(item,"Type")]+"</Type>";
if(store.getValue(item,"Comment")){
_1b32+="<Comment>"+store.getValue(item,"Comment")+"</Comment>";
}
_1b32+="</Term></PionConfig>";
console.debug("post_data = ",_1b32);
dojo.rawXhrPost({url:url,handleAs:"xml",timeout:1000,contentType:"text/xml",postData:_1b32,load:function(_1b35,_1b36){
console.debug("rawXhrPost for url = "+this.url,"; HTTP status code: ",_1b36.xhr.status);
return _1b35;
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1b32})});
}
for(ID in this._pending._deletedItems){
url=dojox.dtl.filter.strings.urlencode("/config/terms/"+_this.config["@id"]+"#"+ID);
console.debug("_saveCustom: url = ",url);
dojo.xhrDelete({url:url,handleAs:"xml",timeout:1000,load:function(_1b37,_1b38){
console.debug("xhrDelete for url = "+this.url,"; HTTP status code: ",_1b38.xhr.status);
return _1b37;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
}
_1b29();
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
dojo.xhrDelete({url:"/config/vocabularies/"+this.config["@id"],handleAs:"xml",timeout:5000,load:function(_1b39,_1b3a){
console.debug("xhrDelete for url = "+this.url,"; HTTP status code: ",_1b3a.xhr.status);
dijit.byId("vocab_config_accordion").forward();
dijit.byId("vocab_config_accordion").removeChild(_this);
pion.vocabularies._adjustAccordionSize();
return _1b39;
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
var _1b3b=dijit.byId("vocab_config_accordion");
var _1b3c=_1b3b.getChildren().length;
console.debug("num_vocabs = "+_1b3c);
var _1b3d=450;
var _1b3e=0;
if(_1b3c>0){
var _1b3f=_1b3b.getChildren()[0];
var _1b3e=_1b3f.getTitleHeight();
}
var _1b40=_1b3d+_1b3c*_1b3e;
_1b3b.resize({h:_1b40});
pion.vocabularies.height=_1b40+160;
dijit.byId("main_stack_container").resize({h:pion.vocabularies.height});
};
pion.vocabularies.isDuplicateVocabularyId=function(id){
var _1b42=dijit.byId("vocab_config_accordion").getChildren();
var _1b43="urn:vocab:"+id;
for(var i=0;i<_1b42.length;++i){
if(_1b42[i].config["@id"]==_1b43){
return true;
}
}
return false;
};
pion.vocabularies.isDuplicateVocabularyName=function(name){
var _1b46=dijit.byId("vocab_config_accordion").getChildren();
for(var i=0;i<_1b46.length;++i){
if(_1b46[i].title==name){
return true;
}
}
return false;
};
pion.vocabularies.config_store=new dojox.data.XmlStore({url:"/config/vocabularies",rootItem:"VocabularyConfig",attributeMap:{"VocabularyConfig.id":"@id"}});
pion.vocabularies.init=function(){
var _1b48=null;
var _1b49=["@id","Type","@format","Size","Comment"];
var _1b4a=_1b49.length;
function _paneSelected(pane){
console.debug("Selected "+pane.title);
if(pane==_1b48){
return;
}
if(_1b48&&dojo.hasClass(_1b48.domNode,"unsaved_changes")){
var _1b4c=new dijit.Dialog({title:"Warning: unsaved changes"});
_1b4c.setContent("Please save or cancel unsaved changes before selecting another Vocabulary.");
_1b4c.show();
setTimeout(function(){
dijit.byId("vocab_config_accordion").selectChild(_1b48);
},500);
return;
}
_1b48=pane;
pion.vocabularies.selected_pane=_1b48;
pane.populateFromVocabStore();
var _1b4d=dijit.byId("vocab_config_accordion").duration;
setTimeout(function(){
dojo.style(pane.containerNode,"overflow","hidden");
},_1b4d+50);
};
dojo.subscribe("vocab_config_accordion-selectChild",_paneSelected);
function _createNewPane(_1b4e){
var _1b4f=document.createElement("span");
var _1b50=new plugins.vocabularies.VocabularyPane(_1b4e,_1b4f);
return _1b50;
};
pion.vocabularies.config_store.fetch({onComplete:function(items,_1b52){
var _1b53=dijit.byId("vocab_config_accordion");
for(var i=0;i<items.length;++i){
var id=pion.vocabularies.config_store.getValue(items[i],"@id");
var _1b56=_createNewPane({config:{"@id":id},title:id});
_1b53.addChild(_1b56);
}
pion.vocabularies._adjustAccordionSize();
var _1b57=_1b53.getChildren()[0];
_1b53.selectChild(_1b57);
},onError:pion.handleFetchError});
function _addNewVocabulary(){
var _1b58=new plugins.vocabularies.VocabularyInitDialog();
dojo.query(".dijitButton.save",_1b58.domNode).forEach(function(n){
dijit.byNode(n).onClick=function(){
return _1b58.isValid();
};
});
setTimeout(function(){
dojo.query("input",_1b58.domNode)[0].select();
},500);
_1b58.show();
_1b58.execute=function(_1b5a){
var _1b5b="<PionConfig><Vocabulary>";
_1b5b+="<Name>"+_1b5a.Name+"</Name>";
_1b5b+="<Comment>"+_1b5a.Comment+"</Comment>";
_1b5b+="</Vocabulary></PionConfig>";
console.debug("post_data: ",_1b5b);
var _1b5c="urn:vocab:"+_1b5a["@id"];
dojo.rawXhrPost({url:"/config/vocabularies/"+_1b5c,contentType:"text/xml",handleAs:"xml",postData:_1b5b,load:function(_1b5d){
var node=_1b5d.getElementsByTagName("Vocabulary")[0];
var _1b5f=dijit.byId("vocab_config_accordion");
var _1b60=_createNewPane({config:{"@id":_1b5c,Name:_1b5a.Name},title:_1b5a.Name});
_1b5f.addChild(_1b60);
pion.vocabularies._adjustAccordionSize();
_1b5f.selectChild(_1b60);
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1b5b})});
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
var _1b66={};
var _1b67=store.getAttributes(item);
for(var i=0;i<_1b67.length;++i){
if(dojo.indexOf(this.special_config_elements,_1b67[i])==-1){
_1b66[_1b67[i]]=store.getValue(item,_1b67[i]).toString();
}
}
if(this._addCustomConfigValues){
this._addCustomConfigValues(_1b66,item);
}
console.dir(_1b66);
this.form.setValues(_1b66);
var _1b69=dojo.query("textarea.comment",this.form.domNode)[0];
_1b69.value=_1b66.Comment;
console.debug("config = ",_1b66);
this.title=_1b66.Name;
var _1b6a=dojo.query(".dijitAccordionTitle .dijitAccordionText",this.domNode)[0];
_1b6a.firstChild.nodeValue=this.title;
var _1b6b=this._makeExtractionRuleTable(item);
plugins.protocols.ProtocolPane.grid_model.setData(_1b6b);
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
},_handleCellEdit:function(_1b74,_1b75,_1b76){
console.debug("ProtocolPane._handleCellEdit inValue = ",_1b74,", inRowIndex = ",_1b75,", inFieldIndex = ",_1b76);
dojo.addClass(this.domNode,"unsaved_changes");
},_handleAddNewRow:function(){
this.markAsChanged();
this.protocol_grid.addRow([]);
},save:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
var _1b77=this.form.getValues();
var _1b78=dojo.query("textarea.comment",this.form.domNode)[0];
_1b77.Comment=_1b78.value;
var _1b79="<PionConfig><Protocol>";
for(var tag in _1b77){
if(tag.charAt(0)!="@"&&tag!="options"){
console.debug("config[",tag,"] = ",_1b77[tag]);
_1b79+="<"+tag+">"+_1b77[tag]+"</"+tag+">";
}
}
if(this._makeCustomElements){
_1b79+=this._makeCustomElements(_1b77);
}
_1b79+=this._makeExtractionRuleElements();
_1b79+="</Protocol></PionConfig>";
console.debug("put_data: ",_1b79);
_this=this;
dojo.rawXhrPut({url:"/config/protocols/"+this.uuid,contentType:"text/xml",handleAs:"xml",putData:_1b79,load:function(_1b7b){
console.debug("response: ",_1b7b);
pion.protocols.config_store.fetch({query:{"@id":_this.uuid},onItem:function(item){
_this.config_item=item;
_this.populateFromConfigItem(item);
},onError:pion.handleFetchError});
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_1b79})});
},_makeExtractionRuleElements:function(){
var _1b7d=plugins.protocols.ProtocolPane.grid_model.getRowCount();
var _1b7e="";
for(var i=0;i<_1b7d;++i){
var row=plugins.protocols.ProtocolPane.grid_model.getRow(i);
_1b7e+="<Extract term=\""+row[this.protocol_grid.term_column_index]+"\">";
_1b7e+="<Source>"+row[this.protocol_grid.source_column_index]+"</Source>";
if(row[this.protocol_grid.name_column_index]){
_1b7e+="<Name>"+row[this.protocol_grid.name_column_index]+"</Name>";
}
if(row[this.protocol_grid.match_column_index]){
_1b7e+="<Match>"+dojox.dtl._base.escape(row[this.protocol_grid.match_column_index])+"</Match>";
}
if(row[this.protocol_grid.format_column_index]){
_1b7e+="<Format>"+row[this.protocol_grid.format_column_index]+"</Format>";
}
if(row[this.protocol_grid.content_type_column_index]){
_1b7e+="<ContentType>"+row[this.protocol_grid.content_type_column_index]+"</ContentType>";
}
if(row[this.protocol_grid.max_size_column_index]){
_1b7e+="<MaxSize>"+row[this.protocol_grid.max_size_column_index]+"</MaxSize>";
}
_1b7e+="</Extract>";
}
return _1b7e;
},cancel:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
this.populateFromConfigItem(this.config_item);
},delete2:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
console.debug("delete2: selected protocol is ",this.title);
_this=this;
dojo.xhrDelete({url:"/config/protocols/"+this.uuid,handleAs:"xml",timeout:5000,load:function(_1b81,_1b82){
console.debug("xhrDelete for url = /config/protocols/"+this.uuid,"; HTTP status code: ",_1b82.xhr.status);
dijit.byId("protocol_config_accordion").forward();
dijit.byId("protocol_config_accordion").removeChild(_this);
pion.protocols._adjustAccordionSize();
return _1b81;
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
pion.protocols.config_store.fetchItemByIdentity=function(_1b83){
pion.protocols.config_store.fetch({query:{"@id":_1b83.identity},onItem:_1b83.onItem,onError:pion.handleFetchError});
};
pion.protocols.config_store.getIdentity=function(item){
return pion.protocols.config_store.getValue(item,"@id");
};
pion.protocols.init=function(){
protocol_config_store=pion.protocols.config_store;
dojo.subscribe("protocol_config_accordion-selectChild",protocolPaneSelected);
pion.protocols.createNewPaneFromItem=function(item){
var title=pion.protocols.config_store.getValue(item,"Name");
var _1b87=pion.protocols.config_store.getValue(item,"Plugin");
var _1b88=document.createElement("span");
var _1b89="plugins.protocols."+_1b87+"Pane";
var _1b8a=dojo.getObject(_1b89);
if(_1b8a){
console.debug("found class ",_1b89);
var _1b8b=new _1b8a({"class":"protocol_pane",title:title},_1b88);
}else{
console.debug("class ",_1b89," not found; using plugins.protocols.ProtocolPane instead.");
var _1b8b=new plugins.protocols.ProtocolPane({"class":"protocol_pane",title:title},_1b88);
}
_1b8b.config_item=item;
_1b8b.uuid=pion.protocols.config_store.getValue(item,"@id");
dijit.byId("protocol_config_accordion").addChild(_1b8b);
return _1b8b;
};
pion.protocols.createNewPaneFromStore=function(id,_1b8d){
pion.protocols.config_store.fetch({query:{"@id":id},onItem:function(item){
var _1b8f=pion.protocols.createNewPaneFromItem(item);
if(_1b8d){
pion.protocols._adjustAccordionSize();
dijit.byId("protocol_config_accordion").selectChild(_1b8f);
}
},onError:pion.handleFetchError});
};
function onComplete(items,_1b91){
var _1b92=dijit.byId("protocol_config_accordion");
for(var i=0;i<items.length;++i){
pion.protocols.createNewPaneFromItem(items[i]);
}
var _1b94=_1b92.getChildren()[0];
_1b92.selectChild(_1b94);
};
protocol_config_store.fetch({onComplete:onComplete,onError:pion.handleFetchError});
dojo.connect(dojo.byId("add_new_protocol_button"),"click",addNewProtocol);
};
function addNewProtocol(){
var _1b95=new plugins.protocols.ProtocolInitDialog({title:"Add New Protocol"});
setTimeout(function(){
dojo.query("input",_1b95.domNode)[0].select();
},500);
_1b95.show();
_1b95.execute=function(_1b96){
console.debug(_1b96);
var _1b97="<PionConfig><Protocol>";
for(var tag in _1b96){
console.debug("dialogFields[",tag,"] = ",_1b96[tag]);
_1b97+="<"+tag+">"+_1b96[tag]+"</"+tag+">";
}
if(plugins.protocols[_1b96.Plugin]&&plugins.protocols[_1b96.Plugin].custom_post_data){
_1b97+=plugins.protocols[_1b96.Plugin].custom_post_data;
}
_1b97+="</Protocol></PionConfig>";
console.debug("post_data: ",_1b97);
dojo.rawXhrPost({url:"/config/protocols",contentType:"text/xml",handleAs:"xml",postData:_1b97,load:function(_1b99){
var node=_1b99.getElementsByTagName("Protocol")[0];
var id=node.getAttribute("id");
console.debug("id (from server): ",id);
pion.protocols.createNewPaneFromStore(id,true);
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1b97})});
};
};
pion.protocols._adjustAccordionSize=function(){
var _1b9c=dijit.byId("protocol_config_accordion");
var _1b9d=_1b9c.getChildren().length;
console.debug("num_protocols = "+_1b9d);
var _1b9e=selected_protocol_pane.getHeight();
var _1b9f=0;
if(_1b9d>0){
var _1ba0=_1b9c.getChildren()[0];
_1b9f=_1ba0.getTitleHeight();
}
var _1ba1=_1b9e+_1b9d*_1b9f;
_1b9c.resize({h:_1ba1});
pion.protocols.height=_1ba1+160;
dijit.byId("main_stack_container").resize({h:pion.protocols.height});
};
function protocolPaneSelected(pane){
console.debug("Selected "+pane.title);
if(pane==selected_protocol_pane){
return;
}
if(selected_protocol_pane&&dojo.hasClass(selected_protocol_pane.domNode,"unsaved_changes")){
var _1ba3=new dijit.Dialog({title:"Warning: unsaved changes"});
_1ba3.setContent("Please save or cancel unsaved changes before selecting another Protocol.");
_1ba3.show();
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
var _1ba6=dijit.byId("protocol_config_accordion").duration;
setTimeout(function(){
dojo.style(pane.containerNode,"overflow","hidden");
pion.protocols._adjustAccordionSize();
},_1ba6+50);
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
var _1ba9={};
var _1baa=store.getAttributes(item);
for(var i=0;i<_1baa.length;++i){
if(_1baa[i]!="Field"&&_1baa[i]!="tagName"&&_1baa[i]!="childNodes"){
_1ba9[_1baa[i]]=store.getValue(item,_1baa[i]).toString();
}
}
console.dir(_1ba9);
this.form.setValues(_1ba9);
console.debug("config = ",_1ba9);
var _1bac=dojo.query(".dijitAccordionTitle .dijitAccordionText",this.domNode)[0];
_1bac.firstChild.nodeValue=this.title;
var node=this.domNode;
setTimeout(function(){
dojo.removeClass(node,"unsaved_changes");
},500);
},save:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
var _1bae=this.form.getValues();
var _1baf="<PionConfig><User>";
for(var tag in _1bae){
if(tag!="@id"){
console.debug("config[",tag,"] = ",_1bae[tag]);
_1baf+="<"+tag+">"+_1bae[tag]+"</"+tag+">";
}
}
_1baf+="</User></PionConfig>";
console.debug("put_data: ",_1baf);
_this=this;
dojo.rawXhrPut({url:"/config/users/"+this.uuid,contentType:"text/xml",handleAs:"xml",putData:_1baf,load:function(_1bb1){
console.debug("response: ",_1bb1);
pion.users.config_store.fetch({query:{"@id":_this.uuid},onItem:function(item){
_this.config_item=item;
_this.populateFromConfigItem(item);
},onError:pion.handleFetchError});
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_1baf})});
},cancel:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
this.populateFromConfigItem(this.config_item);
},delete2:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
console.debug("delete2: selected user is ",this.title);
_this=this;
dojo.xhrDelete({url:"/config/users/"+this.uuid,handleAs:"xml",timeout:5000,load:function(_1bb3,_1bb4){
console.debug("xhrDelete for url = /config/users/"+this.uuid,"; HTTP status code: ",_1bb4.xhr.status);
dijit.byId("user_config_accordion").forward();
dijit.byId("user_config_accordion").removeChild(_this);
pion.users._adjustAccordionSize();
return _1bb3;
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
function onComplete(items,_1bb7){
var _1bb8=dijit.byId("user_config_accordion");
for(var i=0;i<items.length;++i){
var title=pion.users.config_store.getValue(items[i],"@id");
var _1bbb=createNewUserPane(title);
_1bbb.config_item=items[i];
_1bbb.uuid=pion.users.config_store.getValue(items[i],"@id");
_1bb8.addChild(_1bbb);
}
pion.users._adjustAccordionSize();
var _1bbc=_1bb8.getChildren()[0];
_1bb8.selectChild(_1bbc);
};
if(file_protocol){
dijit.byId("user_config_accordion").removeChild(selected_user_pane);
}else{
pion.users.config_store.fetch({onComplete:onComplete,onError:pion.handleFetchError});
}
dojo.connect(dojo.byId("add_new_user_button"),"click",addNewUser);
};
function createNewUserPane(title){
var _1bbe=document.createElement("span");
var _1bbf=new pion.widgets.UserPane({"class":"user_pane",title:title},_1bbe);
return _1bbf;
};
function addNewUser(){
var _1bc0=new pion.widgets.UserInitDialog();
setTimeout(function(){
dojo.query("input",_1bc0.domNode)[0].select();
},500);
_1bc0.show();
_1bc0.execute=function(_1bc1){
console.debug(_1bc1);
var id=_1bc1["@id"];
delete _1bc1["@id"];
var _1bc3="<PionConfig><User id=\""+id+"\">";
for(var tag in _1bc1){
console.debug("dialogFields[",tag,"] = ",_1bc1[tag]);
_1bc3+="<"+tag+">"+_1bc1[tag]+"</"+tag+">";
}
_1bc3+="</User></PionConfig>";
console.debug("post_data: ",_1bc3);
dojo.rawXhrPost({url:"/config/users",contentType:"text/xml",handleAs:"xml",postData:_1bc3,load:function(_1bc5){
var _1bc6=dijit.byId("user_config_accordion");
var _1bc7=createNewUserPane(id);
_1bc7.uuid=id;
_1bc6.addChild(_1bc7);
pion.users._adjustAccordionSize();
_1bc6.selectChild(_1bc7);
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1bc3})});
};
};
pion.users._adjustAccordionSize=function(){
var _1bc8=dijit.byId("user_config_accordion");
var _1bc9=_1bc8.getChildren().length;
console.debug("num_users = "+_1bc9);
var _1bca=210;
var _1bcb=0;
if(_1bc9>0){
var _1bcc=_1bc8.getChildren()[0];
_1bcb=_1bcc.getTitleHeight();
}
var _1bcd=_1bca+_1bc9*_1bcb;
_1bc8.resize({h:_1bcd});
pion.users.height=_1bcd+160;
dijit.byId("main_stack_container").resize({h:pion.users.height});
};
function userPaneSelected(pane){
console.debug("Selected "+pane.title);
if(pane==selected_user_pane){
return;
}
if(selected_user_pane&&dojo.hasClass(selected_user_pane.domNode,"unsaved_changes")){
var _1bcf=new dijit.Dialog({title:"Warning: unsaved changes"});
_1bcf.setContent("Please save or cancel unsaved changes before selecting another User.");
_1bcf.show();
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
var _1bd2=dijit.byId("user_config_accordion").duration;
setTimeout(function(){
dojo.style(pane.containerNode,"overflow","hidden");
},_1bd2+50);
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
var _1bd3="<PionConfig>"+this.XML_text_area.value+"</PionConfig>";
var _1bd4=_1bd3.replace(/>\s*/g,">");
if(dojo.isIE){
var _1bd5=dojox.data.dom.createDocument();
_1bd5.loadXML(_1bd4);
}else{
var _1bd6=new DOMParser();
var _1bd5=_1bd6.parseFromString(_1bd4,"text/xml");
}
var _1bd7=_1bd5.childNodes[0].childNodes;
this.result_text_area.value+=_1bd7.length+" configurations found.\n";
this.configs_by_type={Codec:[],Database:[],Reactor:[],Connection:[]};
for(var i=0;i<_1bd7.length;++i){
var type=_1bd7[i].nodeName;
if(!this.configs_by_type[type]){
this.result_text_area.value+="Error: unknown configuration type \""+type+"\".\n";
return;
}
this.configs_by_type[type].push(_1bd7[i]);
}
this.processCodecs();
},processCodecs:function(){
if(this.configs_by_type.Codec.length==0){
this.result_text_area.value+="No Codec configurations found.\n";
this.processDatabases();
}else{
this.result_text_area.value+=this.configs_by_type.Codec.length+" Codec configurations found.\n";
var _1bda=0;
var _this=this;
dojo.forEach(this.configs_by_type.Codec,function(_1bdc){
var _1bdd=_1bdc.getAttribute("id");
var _1bde="<PionConfig>"+dojox.data.dom.innerXML(_1bdc)+"</PionConfig>";
dojo.rawXhrPost({url:"/config/codecs",contentType:"text/xml",handleAs:"xml",postData:_1bde,load:function(_1bdf){
var node=_1bdf.getElementsByTagName("Codec")[0];
var _1be1=node.getAttribute("id");
if(_1bdd){
_this.uuid_replacements[_1bdd]=_1be1;
}
if(codec_config_page_initialized){
pion.codecs.createNewPaneFromStore(_1be1,false);
}
var name=node.getElementsByTagName("Name")[0].childNodes[0].nodeValue;
_this.result_text_area.value+="Codec named \""+name+"\" added with new UUID "+_1be1+"\n";
if(++_1bda==_this.configs_by_type.Codec.length){
_this.processDatabases();
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1bde})});
});
}
},processDatabases:function(){
if(this.configs_by_type.Database.length==0){
this.result_text_area.value+="No Database configurations found.\n";
this.processReactors();
}else{
this.result_text_area.value+=this.configs_by_type.Database.length+" Database configurations found.\n";
var _1be3=0;
var _this=this;
dojo.forEach(this.configs_by_type.Database,function(_1be5){
var _1be6=_1be5.getAttribute("id");
var _1be7="<PionConfig>"+dojox.data.dom.innerXML(_1be5)+"</PionConfig>";
dojo.rawXhrPost({url:"/config/databases",contentType:"text/xml",handleAs:"xml",postData:_1be7,load:function(_1be8){
var node=_1be8.getElementsByTagName("Database")[0];
var _1bea=node.getAttribute("id");
if(_1be6){
_this.uuid_replacements[_1be6]=_1bea;
}
if(database_config_page_initialized){
pion.databases.createNewPaneFromStore(_1bea,false);
}
var name=node.getElementsByTagName("Name")[0].childNodes[0].nodeValue;
_this.result_text_area.value+="Database named \""+name+"\" added with new UUID "+_1bea+"\n";
if(++_1be3==_this.configs_by_type.Database.length){
_this.processReactors();
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1be7})});
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
var _1bec=0;
var _this=this;
dojo.forEach(this.configs_by_type.Reactor,function(_1bee){
var _1bef=_1bee.getAttribute("id");
var _1bf0="<PionConfig>"+dojox.data.dom.innerXML(_1bee)+"</PionConfig>";
for(var _1bf1 in _this.uuid_replacements){
_1bf0=_1bf0.replace(RegExp(_1bf1,"g"),_this.uuid_replacements[_1bf1]);
}
console.debug("post_data = ",_1bf0);
dojo.rawXhrPost({url:"/config/reactors",contentType:"text/xml",handleAs:"xml",postData:_1bf0,load:function(_1bf2){
var node=_1bf2.getElementsByTagName("Reactor")[0];
var _1bf4=node.getAttribute("id");
if(_1bef){
_this.uuid_replacements[_1bef]=_1bf4;
}
var _1bf5={"@id":_1bf4};
var _1bf6=node.childNodes;
for(var i=0;i<_1bf6.length;++i){
if(_1bf6[i].firstChild){
_1bf5[_1bf6[i].tagName]=_1bf6[i].firstChild.nodeValue;
}
}
pion.reactors.createReactorInConfiguredWorkspace(_1bf5);
_this.result_text_area.value+="Reactor named \""+_1bf5.Name+"\" added with new UUID "+_1bf4+"\n";
if(++_1bec==_this.configs_by_type.Reactor.length){
dijit.byId("main_stack_container").selectChild(dijit.byId("system_config"));
console.debug("this.uuid_replacements = ",this.uuid_replacements);
_this.processConnections();
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1bf0})});
});
}
},processConnections:function(){
if(this.configs_by_type.Connection.length==0){
this.result_text_area.value+="No Connection configurations found.\n";
}else{
dijit.byId("main_stack_container").selectChild(dijit.byId("reactor_config"));
this.result_text_area.value+=this.configs_by_type.Connection.length+" Connections found.\n";
var _1bf8=0;
var _this=this;
dojo.forEach(this.configs_by_type.Connection,function(_1bfa){
var _1bfb=_1bfa.getAttribute("id");
var _1bfc="<PionConfig>"+dojox.data.dom.innerXML(_1bfa)+"</PionConfig>";
for(var _1bfd in _this.uuid_replacements){
_1bfc=_1bfc.replace(RegExp(_1bfd,"g"),_this.uuid_replacements[_1bfd]);
}
console.debug("post_data = ",_1bfc);
dojo.rawXhrPost({url:"/config/connections",contentType:"text/xml",handleAs:"xml",postData:_1bfc,load:function(_1bfe){
var node=_1bfe.getElementsByTagName("Connection")[0];
var _1c00=node.getAttribute("id");
var _1c01=_1bfe.getElementsByTagName("From")[0].firstChild.nodeValue;
var to_id=_1bfe.getElementsByTagName("To")[0].firstChild.nodeValue;
pion.reactors.createConnection(_1c01,to_id,_1c00);
_this.result_text_area.value+="Connection from "+_1c01+" to "+to_id+" added with new UUID "+_1c00+"\n";
if(++_1bf8==_this.configs_by_type.Connection.length){
dijit.byId("main_stack_container").selectChild(dijit.byId("system_config"));
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1bfc})});
});
}
}});
}
if(!dojo._hasResource["pion.system"]){
dojo._hasResource["pion.system"]=true;
dojo.provide("pion.system");
var server_store;
dojo.declare("childlessChildrenFirstStore",dojo.data.ItemFileWriteStore,{getValues:function(item,_1c04){
var _1c05=this.inherited("getValues",arguments);
if(_1c04!="services"){
return _1c05;
}
var len=_1c05.length;
for(var i=0;i<len;++i){
if(_1c05[0].services){
_1c05.push(_1c05[0]);
_1c05.splice(0,1);
}
}
return _1c05;
}});
pion.system.getHeight=function(){
return 800;
};
pion.system.init=function(){
dijit.byId("main_stack_container").resize({h:pion.system.getHeight()});
if(file_protocol){
return;
}
dojo.xhrGet({url:"/config",handleAs:"xml",timeout:5000,load:function(_1c08,_1c09){
console.debug("in load()");
if(dojo.isIE){
dojo.byId("platform_conf_file").innerHTML=_1c08.getElementsByTagName("PlatformConfig")[0].xml;
dojo.byId("reactor_conf_file").innerHTML=_1c08.getElementsByTagName("ReactorConfig")[0].xml;
dojo.byId("vocab_conf_file").innerHTML=_1c08.getElementsByTagName("VocabularyConfig")[0].xml;
dojo.byId("codec_conf_file").innerHTML=_1c08.getElementsByTagName("CodecConfig")[0].xml;
dojo.byId("database_conf_file").innerHTML=_1c08.getElementsByTagName("DatabaseConfig")[0].xml;
dojo.byId("user_conf_file").innerHTML=_1c08.getElementsByTagName("UserConfig")[0].xml;
dojo.byId("protocol_conf_file").innerHTML=_1c08.getElementsByTagName("ProtocolConfig")[0].xml;
dojo.byId("service_conf_file").innerHTML=_1c08.getElementsByTagName("ServiceConfig")[0].xml;
dojo.byId("log_conf_file").innerHTML=_1c08.getElementsByTagName("LogConfig")[0].xml;
dojo.byId("vocab_path").innerHTML=_1c08.getElementsByTagName("VocabularyPath")[0].xml;
}else{
dojo.byId("platform_conf_file").innerHTML=_1c08.getElementsByTagName("PlatformConfig")[0].textContent;
dojo.byId("reactor_conf_file").innerHTML=_1c08.getElementsByTagName("ReactorConfig")[0].textContent;
dojo.byId("vocab_conf_file").innerHTML=_1c08.getElementsByTagName("VocabularyConfig")[0].textContent;
dojo.byId("codec_conf_file").innerHTML=_1c08.getElementsByTagName("CodecConfig")[0].textContent;
dojo.byId("database_conf_file").innerHTML=_1c08.getElementsByTagName("DatabaseConfig")[0].textContent;
dojo.byId("user_conf_file").innerHTML=_1c08.getElementsByTagName("UserConfig")[0].textContent;
dojo.byId("protocol_conf_file").innerHTML=_1c08.getElementsByTagName("ProtocolConfig")[0].textContent;
dojo.byId("service_conf_file").innerHTML=_1c08.getElementsByTagName("ServiceConfig")[0].textContent;
dojo.byId("log_conf_file").innerHTML=_1c08.getElementsByTagName("LogConfig")[0].textContent;
dojo.byId("vocab_path").innerHTML=_1c08.getElementsByTagName("VocabularyPath")[0].textContent;
}
var _1c0a=dojo.byId("plugin_paths");
var _1c0b=_1c0a.getElementsByTagName("tr")[0];
while(_1c0a.firstChild){
_1c0a.removeChild(_1c0a.firstChild);
}
var _1c0c=_1c08.getElementsByTagName("PluginPath");
var _1c0d=[];
for(var i=0;i<_1c0c.length;++i){
if(dojo.isIE){
_1c0d[i]=_1c0a.insertRow();
dojo.forEach(_1c0b.childNodes,function(n){
_1c0d[i].appendChild(dojo.clone(n));
});
}else{
_1c0d[i]=dojo.clone(_1c0b);
_1c0a.appendChild(_1c0d[i]);
}
_1c0d[i].getElementsByTagName("label")[0].innerHTML="Plugin Path "+(i+1);
var _1c10=dojo.isIE?_1c0c[i].xml:_1c0c[i].textContent;
_1c0d[i].getElementsByTagName("td")[1].innerHTML=_1c10;
}
return _1c08;
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
var _1c15=new pion.widgets.XMLImportDialog();
_1c15.show();
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
dojo.xhrGet({url:"/config",preventCache:true,handleAs:"xml",timeout:5000,load:function(_1c17,_1c18){
if(dojo.isIE){
var _1c19=_1c17.getElementsByTagName("Version")[0].childNodes[0].nodeValue;
}else{
var _1c19=_1c17.getElementsByTagName("Version")[0].textContent;
}
var _1c1a="Unknown";
dojo.xhrGet({url:"/key/status",preventCache:true,handleAs:"xml",timeout:5000,load:function(_1c1b,_1c1c){
if(dojo.isIE){
var _1c1d=_1c1b.getElementsByTagName("Status")[0].childNodes[0].nodeValue;
}else{
var _1c1d=_1c1b.getElementsByTagName("Status")[0].textContent;
}
_1c1a="Enterprise";
_this.doLicenseStuff(_1c19,_1c1a,_1c1d);
return _1c1b;
},error:function(_1c1e,_1c1f){
if(_1c1f.xhr.status==404){
_1c1a="Community";
_this.doLicenseStuff(_1c19,_1c1a,"404");
}
return _1c1e;
}});
return _1c17;
}});
},submitKey:function(e){
var key=this.license_key.value;
console.debug("key = ",key);
var _this=this;
dojo.rawXhrPut({url:"/key",contentType:"text/plain",handleAs:"text",putData:key,load:function(_1c23){
console.debug("response: ",_1c23);
_this.hide();
pion.about.doDialog();
return _1c23;
},error:function(_1c24,_1c25){
console.debug(_1c25);
_this.result_of_submitting_key.innerHTML="Error: Key not accepted.";
return _1c24;
}});
},doLicenseStuff:function(_1c26,_1c27,_1c28){
console.debug("pion_version = ",_1c26,", pion_edition = ",_1c27,", key_status = ",_1c28);
full_edition_str="Pion "+_1c27+" Edition";
full_version_str=full_edition_str+" v"+_1c26;
this.full_version.innerHTML=full_version_str;
if(_1c27=="Community"){
this.community_license.style.display="block";
}else{
if(_1c28=="valid"){
var _this=this;
dojo.xhrGet({url:"/key",preventCache:true,handleAs:"xml",timeout:5000,load:function(_1c2a,_1c2b){
if(dojo.isIE){
var _1c2c=_1c2a.getElementsByTagName("Name")[0].xml;
var _1c2d=_1c2a.getElementsByTagName("Email")[0].xml;
var _1c2e=_1c2a.getElementsByTagName("Version");
var _1c2f=_1c2e.length>0?_1c2e[0].xml:"";
var _1c30=_1c2a.getElementsByTagName("Expiration");
var _1c31=_1c30.length>0?_1c30[0].xml:"";
}else{
var _1c2c=_1c2a.getElementsByTagName("Name")[0].textContent;
var _1c2d=_1c2a.getElementsByTagName("Email")[0].textContent;
var _1c2e=_1c2a.getElementsByTagName("Version");
var _1c2f=_1c2e.length>0?_1c2e[0].textContent:"";
var _1c30=_1c2a.getElementsByTagName("Expiration");
var _1c31=_1c30.length>0?_1c30[0].textContent:"";
}
_this.license_name.innerHTML=_1c2c;
_this.license_email.innerHTML=_1c2d;
if(_1c2f==""){
_this.license_version.innerHTML="All versions";
}else{
_this.license_version.innerHTML=_1c2f;
}
if(_1c31==""){
_this.license_expiration.innerHTML="None";
}else{
_this.license_expiration.innerHTML=_1c31;
}
_this.enterprise_licensed.style.display="block";
return _1c2a;
},error:function(){
console.debug("error from xhrGet");
}});
}else{
if(_1c28=="invalid"){
this.reason_needs_license.innerHTML="Invalid license key (may have expired).";
}else{
this.reason_needs_license.innerHTML="No license key found.";
}
this.enterprise_not_licensed.style.display="block";
}
}
}});
pion.about.doDialog=function(){
var _1c32=new pion.about.LicenseKeyDialog();
_1c32.show();
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
pion.handleXhrError=function(_1c33,_1c34,_1c35,_1c36){
console.debug("In pion.handleXhrError: ioArgs.args = ",_1c34.args);
if(_1c34.xhr.status==401){
if(pion.login.login_pending){
var h=dojo.connect(pion.login,"onLoginSuccess",function(){
dojo.disconnect(h);
_1c35(_1c34.args);
});
}else{
if(!dojo.cookie("logged_in")){
location.replace("login.html");
}
pion.login.doLoginDialog(function(){
_1c35(_1c34.args);
});
}
return;
}else{
if(_1c34.xhr.status==500){
var _1c38=new dijit.Dialog({title:"Pion Server Error"});
_1c38.setContent(_1c33.responseText);
_1c38.show();
}
if(_1c36){
_1c36();
}
}
return _1c33;
};
pion.handleXhrGetError=function(_1c39,_1c3a){
console.debug("In pion.handleXhrGetError: ioArgs.args = ",_1c3a.args);
return pion.handleXhrError(_1c39,_1c3a,dojo.xhrGet);
};
pion.getXhrErrorHandler=function(_1c3b,_1c3c,_1c3d){
return function(_1c3e,_1c3f){
dojo.mixin(_1c3f.args,_1c3c);
return pion.handleXhrError(_1c3e,_1c3f,_1c3b,_1c3d);
};
};
pion.handleFetchError=function(_1c40,_1c41){
console.debug("In pion.handleFetchError: request = ",_1c41,", errorData = "+_1c40);
if(_1c40.status==401){
if(pion.login.login_pending){
var h=dojo.connect(pion.login,"onLoginSuccess",function(){
dojo.disconnect(h);
_1c41.store.fetch(_1c41);
});
}else{
if(!dojo.cookie("logged_in")){
location.replace("login.html");
}
pion.login.doLoginDialog(function(){
_1c41.store.fetch(_1c41);
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
dojo.xhrGet({url:"/config",preventCache:true,handleAs:"xml",timeout:5000,load:function(_1c43,_1c44){
dojo.cookie("logged_in","true",{expires:1});
pion.terms.init();
pion.reactors.init();
},error:function(_1c45,_1c46){
if(_1c46.xhr.status==401){
if(!dojo.cookie("logged_in")){
location.replace("login.html");
}
pion.login.doLoginDialog(function(){
pion.terms.init();
pion.reactors.init();
});
}else{
console.error("HTTP status code: ",_1c46.xhr.status);
}
return _1c45;
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
dijit.form.TextBox.prototype._setValueAttr=function(value,_1c49,_1c4a){
var _1c4b;
if(value!==undefined){
_1c4b=this.filter(value);
if(_1c4b!==null&&((typeof _1c4b!="number")||!isNaN(_1c4b))){
if(_1c4a===undefined||!_1c4a.toString){
_1c4a=this.format(_1c4b,this.constraints);
}
}else{
_1c4a="";
}
}
if(_1c4a!=null&&_1c4a!=undefined){
this.textbox.value=_1c4a;
}
dijit.form.TextBox.superclass._setValueAttr.call(this,_1c4b,_1c49);
};
dojo.i18n._preloadLocalizations("dojo.nls.pion-dojo",["he","nl","tr","no","ko","el","en","en-gb","ROOT","zh-cn","hu","es","fi-fi","pt-br","ca","fi","he-il","xx","ru","it","fr","cs","de-de","fr-fr","it-it","es-es","ja","sk","da","sl","pl","de","sv","pt","pt-pt","nl-nl","zh-tw","ko-kr","ar","en-us","zh","th","ja-jp"]);
