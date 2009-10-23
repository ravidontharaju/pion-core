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
this.events=[dojo.connect(d,"onmousemove",this,"onMouseMove"),dojo.connect(d,"onmouseup",this,"onMouseUp"),dojo.connect(d,"ondragstart",dojo.stopEvent),dojo.connect(d.body,"onselectstart",dojo.stopEvent),_183];
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
this.events.push(dojo.connect(this.handle,"onmousemove",this,"onMouseMove"),dojo.connect(this.handle,"onmouseup",this,"onMouseUp"));
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
},onMoveStart:function(_19b){
dojo.publish("/dnd/move/start",[_19b]);
dojo.addClass(dojo.body(),"dojoMove");
dojo.addClass(this.node,"dojoMoveItem");
},onMoveStop:function(_19c){
dojo.publish("/dnd/move/stop",[_19c]);
dojo.removeClass(dojo.body(),"dojoMove");
dojo.removeClass(this.node,"dojoMoveItem");
},onFirstMove:function(_19d){
},onMove:function(_19e,_19f){
this.onMoving(_19e,_19f);
var s=_19e.node.style;
s.left=_19f.l+"px";
s.top=_19f.t+"px";
this.onMoved(_19e,_19f);
},onMoving:function(_1a1,_1a2){
},onMoved:function(_1a3,_1a4){
}});
}
if(!dojo._hasResource["dojo.dnd.move"]){
dojo._hasResource["dojo.dnd.move"]=true;
dojo.provide("dojo.dnd.move");
dojo.declare("dojo.dnd.move.constrainedMoveable",dojo.dnd.Moveable,{constraints:function(){
},within:false,markupFactory:function(_1a5,node){
return new dojo.dnd.move.constrainedMoveable(node,_1a5);
},constructor:function(node,_1a8){
if(!_1a8){
_1a8={};
}
this.constraints=_1a8.constraints;
this.within=_1a8.within;
},onFirstMove:function(_1a9){
var c=this.constraintBox=this.constraints.call(this,_1a9);
c.r=c.l+c.w;
c.b=c.t+c.h;
if(this.within){
var mb=dojo.marginBox(_1a9.node);
c.r-=mb.w;
c.b-=mb.h;
}
},onMove:function(_1ac,_1ad){
var c=this.constraintBox,s=_1ac.node.style;
s.left=(_1ad.l<c.l?c.l:c.r<_1ad.l?c.r:_1ad.l)+"px";
s.top=(_1ad.t<c.t?c.t:c.b<_1ad.t?c.b:_1ad.t)+"px";
}});
dojo.declare("dojo.dnd.move.boxConstrainedMoveable",dojo.dnd.move.constrainedMoveable,{box:{},markupFactory:function(_1b0,node){
return new dojo.dnd.move.boxConstrainedMoveable(node,_1b0);
},constructor:function(node,_1b3){
var box=_1b3&&_1b3.box;
this.constraints=function(){
return box;
};
}});
dojo.declare("dojo.dnd.move.parentConstrainedMoveable",dojo.dnd.move.constrainedMoveable,{area:"content",markupFactory:function(_1b5,node){
return new dojo.dnd.move.parentConstrainedMoveable(node,_1b5);
},constructor:function(node,_1b8){
var area=_1b8&&_1b8.area;
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
dojo.dnd.move.constrainedMover=function(fun,_1bf){
dojo.deprecated("dojo.dnd.move.constrainedMover, use dojo.dnd.move.constrainedMoveable instead");
var _1c0=function(node,e,_1c3){
dojo.dnd.Mover.call(this,node,e,_1c3);
};
dojo.extend(_1c0,dojo.dnd.Mover.prototype);
dojo.extend(_1c0,{onMouseMove:function(e){
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
if(_1bf){
var mb=dojo.marginBox(this.node);
c.r-=mb.w;
c.b-=mb.h;
}
}});
return _1c0;
};
dojo.dnd.move.boxConstrainedMover=function(box,_1cc){
dojo.deprecated("dojo.dnd.move.boxConstrainedMover, use dojo.dnd.move.boxConstrainedMoveable instead");
return dojo.dnd.move.constrainedMover(function(){
return box;
},_1cc);
};
dojo.dnd.move.parentConstrainedMover=function(area,_1ce){
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
return dojo.dnd.move.constrainedMover(fun,_1ce);
};
dojo.dnd.constrainedMover=dojo.dnd.move.constrainedMover;
dojo.dnd.boxConstrainedMover=dojo.dnd.move.boxConstrainedMover;
dojo.dnd.parentConstrainedMover=dojo.dnd.move.parentConstrainedMover;
}
if(!dojo._hasResource["dojo.dnd.Container"]){
dojo._hasResource["dojo.dnd.Container"]=true;
dojo.provide("dojo.dnd.Container");
dojo.declare("dojo.dnd.Container",null,{skipForm:false,constructor:function(node,_1d5){
this.node=dojo.byId(node);
if(!_1d5){
_1d5={};
}
this.creator=_1d5.creator||null;
this.skipForm=_1d5.skipForm;
this.parent=_1d5.dropParent&&dojo.byId(_1d5.dropParent);
this.map={};
this.current=null;
this.containerState="";
dojo.addClass(this.node,"dojoDndContainer");
if(!(_1d5&&_1d5._skipStartup)){
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
},insertNodes:function(data,_1e5,_1e6){
if(!this.parent.firstChild){
_1e6=null;
}else{
if(_1e5){
if(!_1e6){
_1e6=this.parent.firstChild;
}
}else{
if(_1e6){
_1e6=_1e6.nextSibling;
}
}
}
if(_1e6){
for(var i=0;i<data.length;++i){
var t=this._normalizedCreator(data[i]);
this.setItem(t.node.id,{data:t.data,type:t.type});
this.parent.insertBefore(t.node,_1e6);
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
},markupFactory:function(_1e9,node){
_1e9._skipStartup=true;
return new dojo.dnd.Container(node,_1e9);
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
},_changeState:function(type,_1f2){
var _1f3="dojoDnd"+type;
var _1f4=type.toLowerCase()+"State";
dojo.removeClass(this.node,_1f3+this[_1f4]);
dojo.addClass(this.node,_1f3+_1f2);
this[_1f4]=_1f2;
},_addItemClass:function(node,type){
dojo.addClass(node,"dojoDndItem"+type);
},_removeItemClass:function(node,type){
dojo.removeClass(node,"dojoDndItem"+type);
},_getChildByEvent:function(e){
var node=e.target;
if(node){
for(var _1fb=node.parentNode;_1fb;node=_1fb,_1fb=node.parentNode){
if(_1fb==this.parent&&dojo.hasClass(node,"dojoDndItem")){
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
var _20c=item&&dojo.isObject(item),data,type,n;
if(_20c&&item.tagName&&item.nodeType&&item.getAttribute){
data=item.getAttribute("dndData")||item.innerHTML;
type=item.getAttribute("dndType");
type=type?type.split(/\s*,\s*/):["text"];
n=item;
}else{
data=(_20c&&item.data)?item.data:item;
type=(_20c&&item.type)?item.type:["text"];
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
dojo.declare("dojo.dnd.Selector",dojo.dnd.Container,{constructor:function(node,_211){
if(!_211){
_211={};
}
this.singular=_211.singular;
this.autoSync=_211.autoSync;
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
},insertNodes:function(_223,data,_225,_226){
var _227=this._normalizedCreator;
this._normalizedCreator=function(item,hint){
var t=_227.call(this,item,hint);
if(_223){
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
dojo.dnd.Selector.superclass.insertNodes.call(this,data,_225,_226);
this._normalizedCreator=_227;
return this;
},destroy:function(){
dojo.dnd.Selector.superclass.destroy.call(this);
this.selection=this.anchor=null;
},markupFactory:function(_22b,node){
_22b._skipStartup=true;
return new dojo.dnd.Selector(node,_22b);
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
dojo.declare("dojo.dnd.Avatar",null,{constructor:function(_236){
this.manager=_236;
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
var _23c=this.manager.source,node;
for(var i=0;i<k;++i){
tr=dojo.doc.createElement("tr");
tr.className="dojoDndAvatarItem";
td=dojo.doc.createElement("td");
if(_23c.creator){
node=_23c._normalizedCreator(_23c.getItem(this.manager.nodes[i].id).data,"avatar").node;
}else{
node=this.manager.nodes[i].cloneNode(true);
if(node.tagName.toLowerCase()=="tr"){
var _23f=dojo.doc.createElement("table"),_240=dojo.doc.createElement("tbody");
_240.appendChild(node);
_23f.appendChild(_240);
node=_23f;
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
},OFFSET_X:16,OFFSET_Y:16,overSource:function(_242){
if(this.avatar){
this.target=(_242&&_242.targetState!="Disabled")?_242:null;
this.canDropFlag=Boolean(this.target);
this.avatar.update();
}
dojo.publish("/dnd/source/over",[_242]);
},outSource:function(_243){
if(this.avatar){
if(this.target==_243){
this.target=null;
this.canDropFlag=false;
this.avatar.update();
dojo.publish("/dnd/source/over",[null]);
}
}else{
dojo.publish("/dnd/source/over",[null]);
}
},startDrag:function(_244,_245,copy){
this.source=_244;
this.nodes=_245;
this.copy=Boolean(copy);
this.avatar=this.makeAvatar();
dojo.body().appendChild(this.avatar.node);
dojo.publish("/dnd/start",[_244,_245,this.copy]);
this.events=[dojo.connect(dojo.doc,"onmousemove",this,"onMouseMove"),dojo.connect(dojo.doc,"onmouseup",this,"onMouseUp"),dojo.connect(dojo.doc,"onkeydown",this,"onKeyDown"),dojo.connect(dojo.doc,"onkeyup",this,"onKeyUp"),dojo.connect(dojo.doc,"ondragstart",dojo.stopEvent),dojo.connect(dojo.body(),"onselectstart",dojo.stopEvent)];
var c="dojoDnd"+(copy?"Copy":"Move");
dojo.addClass(dojo.body(),c);
},canDrop:function(flag){
var _249=Boolean(this.target&&flag);
if(this.canDropFlag!=_249){
this.canDropFlag=_249;
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
var copy=Boolean(this.source.copyState(dojo.dnd.getCopyKeyState(e))),_250=[this.source,this.nodes,copy,this.target];
dojo.publish("/dnd/drop/before",_250);
dojo.publish("/dnd/drop",_250);
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
dojo.declare("dojo.dnd.Source",dojo.dnd.Selector,{isSource:true,horizontal:false,copyOnly:false,selfCopy:false,selfAccept:true,skipForm:false,withHandles:false,autoSync:false,delay:0,accept:["text"],constructor:function(node,_257){
dojo.mixin(this,dojo.mixin({},_257));
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
},checkAcceptance:function(_25a,_25b){
if(this==_25a){
return !this.copyOnly||this.selfAccept;
}
for(var i=0;i<_25b.length;++i){
var type=_25a.getItem(_25b[i].id).type;
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
},copyState:function(_260,self){
if(_260){
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
},markupFactory:function(_262,node){
_262._skipStartup=true;
return new dojo.dnd.Source(node,_262);
},onMouseMove:function(e){
if(this.isDragging&&this.targetState=="Disabled"){
return;
}
dojo.dnd.Source.superclass.onMouseMove.call(this,e);
var m=dojo.dnd.manager();
if(this.isDragging){
var _266=false;
if(this.current){
if(!this.targetBox||this.targetAnchor!=this.current){
this.targetBox={xy:dojo.coords(this.current,true),w:this.current.offsetWidth,h:this.current.offsetHeight};
}
if(this.horizontal){
_266=(e.pageX-this.targetBox.xy.x)<(this.targetBox.w/2);
}else{
_266=(e.pageY-this.targetBox.xy.y)<(this.targetBox.h/2);
}
}
if(this.current!=this.targetAnchor||_266!=this.before){
this._markTargetAnchor(_266);
m.canDrop(!this.current||m.source!=this||!(this.current.id in this.selection));
}
}else{
if(this.mouseDown&&this.isSource&&(Math.abs(e.pageX-this._lastX)>this.delay||Math.abs(e.pageY-this._lastY)>this.delay)){
var _267=this.getSelectedNodes();
if(_267.length){
m.startDrag(this,_267,this.copyState(dojo.dnd.getCopyKeyState(e),true));
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
},onDndSourceOver:function(_26a){
if(this!=_26a){
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
},onDndStart:function(_26c,_26d,copy){
if(this.autoSync){
this.sync();
}
if(this.isSource){
this._changeState("Source",this==_26c?(copy?"Copied":"Moved"):"");
}
var _26f=this.accept&&this.checkAcceptance(_26c,_26d);
this._changeState("Target",_26f?"":"Disabled");
if(this==_26c){
dojo.dnd.manager().overSource(this);
}
this.isDragging=true;
},onDndDrop:function(_270,_271,copy,_273){
if(this==_273){
this.onDrop(_270,_271,copy);
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
},onDrop:function(_274,_275,copy){
if(this!=_274){
this.onDropExternal(_274,_275,copy);
}else{
this.onDropInternal(_275,copy);
}
},onDropExternal:function(_277,_278,copy){
var _27a=this._normalizedCreator;
if(this.creator){
this._normalizedCreator=function(node,hint){
return _27a.call(this,_277.getItem(node.id).data,hint);
};
}else{
if(copy){
this._normalizedCreator=function(node,hint){
var t=_277.getItem(node.id);
var n=node.cloneNode(true);
n.id=dojo.dnd.getUniqueId();
return {node:n,data:t.data,type:t.type};
};
}else{
this._normalizedCreator=function(node,hint){
var t=_277.getItem(node.id);
_277.delItem(node.id);
return {node:node,data:t.data,type:t.type};
};
}
}
this.selectNone();
if(!copy&&!this.creator){
_277.selectNone();
}
this.insertNodes(true,_278,this.before,this.current);
if(!copy&&this.creator){
_277.deleteSelectedNodes();
}
this._normalizedCreator=_27a;
},onDropInternal:function(_284,copy){
var _286=this._normalizedCreator;
if(this.current&&this.current.id in this.selection){
return;
}
if(copy){
if(this.creator){
this._normalizedCreator=function(node,hint){
return _286.call(this,this.getItem(node.id).data,hint);
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
this.insertNodes(true,_284,this.before,this.current);
this._normalizedCreator=_286;
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
},_markTargetAnchor:function(_290){
if(this.current==this.targetAnchor&&this.before==_290){
return;
}
if(this.targetAnchor){
this._removeItemClass(this.targetAnchor,this.before?"Before":"After");
}
this.targetAnchor=this.current;
this.targetBox=null;
this.before=_290;
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
for(var node=e.target;node;node=node.parentNode){
if(dojo.hasClass(node,"dojoDndHandle")){
return true;
}
if(dojo.hasClass(node,"dojoDndItem")){
break;
}
}
return false;
}});
dojo.declare("dojo.dnd.Target",dojo.dnd.Source,{constructor:function(node,_295){
this.isSource=false;
dojo.removeClass(this.node,"dojoDndSource");
},markupFactory:function(_296,node){
_296._skipStartup=true;
return new dojo.dnd.Target(node,_296);
}});
dojo.declare("dojo.dnd.AutoSource",dojo.dnd.Source,{constructor:function(node,_299){
this.autoSync=true;
},markupFactory:function(_29a,node){
_29a._skipStartup=true;
return new dojo.dnd.AutoSource(node,_29a);
}});
}
if(!dojo._hasResource["dojo.dnd.TimedMoveable"]){
dojo._hasResource["dojo.dnd.TimedMoveable"]=true;
dojo.provide("dojo.dnd.TimedMoveable");
(function(){
var _29c=dojo.dnd.Moveable.prototype.onMove;
dojo.declare("dojo.dnd.TimedMoveable",dojo.dnd.Moveable,{timeout:40,constructor:function(node,_29e){
if(!_29e){
_29e={};
}
if(_29e.timeout&&typeof _29e.timeout=="number"&&_29e.timeout>=0){
this.timeout=_29e.timeout;
}
},markupFactory:function(_29f,node){
return new dojo.dnd.TimedMoveable(node,_29f);
},onMoveStop:function(_2a1){
if(_2a1._timer){
clearTimeout(_2a1._timer);
_29c.call(this,_2a1,_2a1._leftTop);
}
dojo.dnd.Moveable.prototype.onMoveStop.apply(this,arguments);
},onMove:function(_2a2,_2a3){
_2a2._leftTop=_2a3;
if(!_2a2._timer){
var _t=this;
_2a2._timer=setTimeout(function(){
_2a2._timer=null;
_29c.call(_t,_2a2,_2a2._leftTop);
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
var _2a5={_fire:function(evt,args){
if(this[evt]){
this[evt].apply(this,args||[]);
}
return this;
}};
var _2a8=function(_2a9){
this._index=-1;
this._animations=_2a9||[];
this._current=this._onAnimateCtx=this._onEndCtx=null;
this.duration=0;
dojo.forEach(this._animations,function(a){
this.duration+=a.duration;
if(a.delay){
this.duration+=a.delay;
}
},this);
};
dojo.extend(_2a8,{_onAnimate:function(){
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
},play:function(_2ab,_2ac){
if(!this._current){
this._current=this._animations[this._index=0];
}
if(!_2ac&&this._current.status()=="playing"){
return this;
}
var _2ad=dojo.connect(this._current,"beforeBegin",this,function(){
this._fire("beforeBegin");
}),_2ae=dojo.connect(this._current,"onBegin",this,function(arg){
this._fire("onBegin",arguments);
}),_2b0=dojo.connect(this._current,"onPlay",this,function(arg){
this._fire("onPlay",arguments);
dojo.disconnect(_2ad);
dojo.disconnect(_2ae);
dojo.disconnect(_2b0);
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
},gotoPercent:function(_2b4,_2b5){
this.pause();
var _2b6=this.duration*_2b4;
this._current=null;
dojo.some(this._animations,function(a){
if(a.duration<=_2b6){
this._current=a;
return true;
}
_2b6-=a.duration;
return false;
});
if(this._current){
this._current.gotoPercent(_2b6/this._current.duration,_2b5);
}
return this;
},stop:function(_2b8){
if(this._current){
if(_2b8){
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
dojo.extend(_2a8,_2a5);
dojo.fx.chain=function(_2bb){
return new _2a8(_2bb);
};
var _2bc=function(_2bd){
this._animations=_2bd||[];
this._connects=[];
this._finished=0;
this.duration=0;
dojo.forEach(_2bd,function(a){
var _2bf=a.duration;
if(a.delay){
_2bf+=a.delay;
}
if(this.duration<_2bf){
this.duration=_2bf;
}
this._connects.push(dojo.connect(a,"onEnd",this,"_onEnd"));
},this);
this._pseudoAnimation=new dojo._Animation({curve:[0,1],duration:this.duration});
dojo.forEach(["beforeBegin","onBegin","onPlay","onAnimate","onPause","onStop"],function(evt){
this._connects.push(dojo.connect(this._pseudoAnimation,evt,dojo.hitch(this,"_fire",evt)));
},this);
};
dojo.extend(_2bc,{_doAction:function(_2c1,args){
dojo.forEach(this._animations,function(a){
a[_2c1].apply(a,args);
});
return this;
},_onEnd:function(){
if(++this._finished==this._animations.length){
this._fire("onEnd");
}
},_call:function(_2c4,args){
var t=this._pseudoAnimation;
t[_2c4].apply(t,args);
},play:function(_2c7,_2c8){
this._finished=0;
this._doAction("play",arguments);
this._call("play",arguments);
return this;
},pause:function(){
this._doAction("pause",arguments);
this._call("pause",arguments);
return this;
},gotoPercent:function(_2c9,_2ca){
var ms=this.duration*_2c9;
dojo.forEach(this._animations,function(a){
a.gotoPercent(a.duration<ms?1:(ms/a.duration),_2ca);
});
this._call("gotoPercent",arguments);
return this;
},stop:function(_2cd){
this._doAction("stop",arguments);
this._call("stop",arguments);
return this;
},status:function(){
return this._pseudoAnimation.status();
},destroy:function(){
dojo.forEach(this._connects,dojo.disconnect);
}});
dojo.extend(_2bc,_2a5);
dojo.fx.combine=function(_2ce){
return new _2bc(_2ce);
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
},node:null,showFunc:dojo.fadeIn,hideFunc:dojo.fadeOut,showDuration:200,hideDuration:200,show:function(_2d1){
return this.showAnim.play(_2d1||0);
},hide:function(_2d2){
return this.hideAnim.play(_2d2||0);
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
var _2d8=dojo.style(node,"height");
return Math.max(_2d8,1);
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
var _2e8=dojo.doc;
if(_2e8.selection){
var s=_2e8.selection;
if(s.type=="Text"){
return !s.createRange().htmlText.length;
}else{
return !s.createRange().length;
}
}else{
var _2ea=dojo.global;
var _2eb=_2ea.getSelection();
if(dojo.isString(_2eb)){
return !_2eb;
}else{
return _2eb.isCollapsed||!_2eb.toString();
}
}
},getBookmark:function(){
var _2ec,_2ed=dojo.doc.selection;
if(_2ed){
var _2ee=_2ed.createRange();
if(_2ed.type.toUpperCase()=="CONTROL"){
if(_2ee.length){
_2ec=[];
var i=0,len=_2ee.length;
while(i<len){
_2ec.push(_2ee.item(i++));
}
}else{
_2ec=null;
}
}else{
_2ec=_2ee.getBookmark();
}
}else{
if(window.getSelection){
_2ed=dojo.global.getSelection();
if(_2ed){
_2ee=_2ed.getRangeAt(0);
_2ec=_2ee.cloneRange();
}
}else{
console.warn("No idea how to store the current selection for this browser!");
}
}
return _2ec;
},moveToBookmark:function(_2f1){
var _2f2=dojo.doc;
if(_2f2.selection){
var _2f3;
if(dojo.isArray(_2f1)){
_2f3=_2f2.body.createControlRange();
dojo.forEach(_2f1,function(n){
_2f3.addElement(n);
});
}else{
_2f3=_2f2.selection.createRange();
_2f3.moveToBookmark(_2f1);
}
_2f3.select();
}else{
var _2f5=dojo.global.getSelection&&dojo.global.getSelection();
if(_2f5&&_2f5.removeAllRanges){
_2f5.removeAllRanges();
_2f5.addRange(_2f1);
}else{
console.warn("No idea how to restore selection for this browser!");
}
}
},getFocus:function(menu,_2f7){
return {node:menu&&dojo.isDescendant(dijit._curFocus,menu.domNode)?dijit._prevFocus:dijit._curFocus,bookmark:!dojo.withGlobal(_2f7||dojo.global,dijit.isCollapsed)?dojo.withGlobal(_2f7||dojo.global,dijit.getBookmark):null,openedForWindow:_2f7};
},focus:function(_2f8){
if(!_2f8){
return;
}
var node="node" in _2f8?_2f8.node:_2f8,_2fa=_2f8.bookmark,_2fb=_2f8.openedForWindow;
if(node){
var _2fc=(node.tagName.toLowerCase()=="iframe")?node.contentWindow:node;
if(_2fc&&_2fc.focus){
try{
_2fc.focus();
}
catch(e){
}
}
dijit._onFocusNode(node);
}
if(_2fa&&dojo.withGlobal(_2fb||dojo.global,dijit.isCollapsed)){
if(_2fb){
_2fb.focus();
}
try{
dojo.withGlobal(_2fb||dojo.global,dijit.moveToBookmark,null,[_2fa]);
}
catch(e){
}
}
},_activeStack:[],registerWin:function(_2fd){
if(!_2fd){
_2fd=window;
}
dojo.connect(_2fd.document,"onmousedown",function(evt){
dijit._justMouseDowned=true;
setTimeout(function(){
dijit._justMouseDowned=false;
},0);
dijit._onTouchNode(evt.target||evt.srcElement);
});
var doc=_2fd.document;
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
var _306=[];
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
_306.unshift(id);
}
node=node.parentNode;
}
}
}
}
catch(e){
}
dijit._setStack(_306);
},_onFocusNode:function(node){
if(!node){
return;
}
if(node.nodeType==9){
return;
}
if(node.nodeType==9){
var _309=dijit.getDocumentWindow(node).frameElement;
if(!_309){
return;
}
node=_309;
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
},_setStack:function(_30a){
var _30b=dijit._activeStack;
dijit._activeStack=_30a;
for(var _30c=0;_30c<Math.min(_30b.length,_30a.length);_30c++){
if(_30b[_30c]!=_30a[_30c]){
break;
}
}
for(var i=_30b.length-1;i>=_30c;i--){
var _30e=dijit.byId(_30b[i]);
if(_30e){
_30e._focused=false;
_30e._hasBeenBlurred=true;
if(_30e._onBlur){
_30e._onBlur();
}
if(_30e._setStateClass){
_30e._setStateClass();
}
dojo.publish("widgetBlur",[_30e]);
}
}
for(i=_30c;i<_30a.length;i++){
_30e=dijit.byId(_30a[i]);
if(_30e){
_30e._focused=true;
if(_30e._onFocus){
_30e._onFocus();
}
if(_30e._setStateClass){
_30e._setStateClass();
}
dojo.publish("widgetFocus",[_30e]);
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
},add:function(_30f){
if(this._hash[_30f.id]){
throw new Error("Tried to register widget with id=="+_30f.id+" but that id is already registered");
}
this._hash[_30f.id]=_30f;
},remove:function(id){
delete this._hash[id];
},forEach:function(func){
for(var id in this._hash){
func(this._hash[id]);
}
},filter:function(_313){
var res=new dijit.WidgetSet();
this.forEach(function(_315){
if(_313(_315)){
res.add(_315);
}
});
return res;
},byId:function(id){
return this._hash[id];
},byClass:function(cls){
return this.filter(function(_318){
return _318.declaredClass==cls;
});
}});
dijit.registry=new dijit.WidgetSet();
dijit._widgetTypeCtr={};
dijit.getUniqueId=function(_319){
var id;
do{
id=_319+"_"+(_319 in dijit._widgetTypeCtr?++dijit._widgetTypeCtr[_319]:dijit._widgetTypeCtr[_319]=0);
}while(dijit.byId(id));
return id;
};
if(dojo.isIE){
dojo.addOnWindowUnload(function(){
dijit.registry.forEach(function(_31b){
_31b.destroy();
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
var _320=dojo.style(elem);
return (_320.visibility!="hidden")&&(_320.visibility!="collapsed")&&(_320.display!="none")&&(dojo.attr(elem,"type")!="hidden");
};
dijit.isTabNavigable=function(elem){
if(dojo.hasAttr(elem,"disabled")){
return false;
}
var _322=dojo.hasAttr(elem,"tabindex");
var _323=dojo.attr(elem,"tabindex");
if(_322&&_323>=0){
return true;
}
var name=elem.nodeName.toLowerCase();
if(((name=="a"&&dojo.hasAttr(elem,"href"))||dijit._tabElements[name])&&(!_322||_323>=0)){
return true;
}
return false;
};
dijit._getTabNavigable=function(root){
var _326,last,_328,_329,_32a,_32b;
var _32c=function(_32d){
dojo.query("> *",_32d).forEach(function(_32e){
var _32f=dijit._isElementShown(_32e);
if(_32f&&dijit.isTabNavigable(_32e)){
var _330=dojo.attr(_32e,"tabindex");
if(!dojo.hasAttr(_32e,"tabindex")||_330==0){
if(!_326){
_326=_32e;
}
last=_32e;
}else{
if(_330>0){
if(!_328||_330<_329){
_329=_330;
_328=_32e;
}
if(!_32a||_330>=_32b){
_32b=_330;
_32a=_32e;
}
}
}
}
if(_32f&&_32e.nodeName.toUpperCase()!="SELECT"){
_32c(_32e);
}
});
};
if(dijit._isElementShown(root)){
_32c(root);
}
return {first:_326,last:last,lowest:_328,highest:_32a};
};
dijit.getFirstInTabbingOrder=function(root){
var _332=dijit._getTabNavigable(dojo.byId(root));
return _332.lowest?_332.lowest:_332.first;
};
dijit.getLastInTabbingOrder=function(root){
var _334=dijit._getTabNavigable(dojo.byId(root));
return _334.last?_334.last:_334.highest;
};
dijit.defaultDuration=dojo.config["defaultDuration"]||200;
}
if(!dojo._hasResource["dojo.AdapterRegistry"]){
dojo._hasResource["dojo.AdapterRegistry"]=true;
dojo.provide("dojo.AdapterRegistry");
dojo.AdapterRegistry=function(_335){
this.pairs=[];
this.returnWrappers=_335||false;
};
dojo.extend(dojo.AdapterRegistry,{register:function(name,_337,wrap,_339,_33a){
this.pairs[((_33a)?"unshift":"push")]([name,_337,wrap,_339]);
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
var _340=dojo.global;
var _341=dojo.doc;
var w=0,h=0;
var de=_341.documentElement;
var dew=de.clientWidth,deh=de.clientHeight;
if(dojo.isMozilla){
var minw,minh,maxw,maxh;
var dbw=_341.body.clientWidth;
if(dbw>dew){
minw=dew;
maxw=dbw;
}else{
maxw=dew;
minw=dbw;
}
var dbh=_341.body.clientHeight;
if(dbh>deh){
minh=deh;
maxh=dbh;
}else{
maxh=deh;
minh=dbh;
}
w=(maxw>_340.innerWidth)?minw:maxw;
h=(maxh>_340.innerHeight)?minh:maxh;
}else{
if(!dojo.isOpera&&_340.innerWidth){
w=_340.innerWidth;
h=_340.innerHeight;
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
var _34d=dojo._docScroll();
return {w:w,h:h,l:_34d.x,t:_34d.y};
};
dijit.placeOnScreen=function(node,pos,_350,_351){
var _352=dojo.map(_350,function(_353){
return {corner:_353,pos:pos};
});
return dijit._place(node,_352);
};
dijit._place=function(node,_355,_356){
var view=dijit.getViewport();
if(!node.parentNode||String(node.parentNode.tagName).toLowerCase()!="body"){
dojo.body().appendChild(node);
}
var best=null;
dojo.some(_355,function(_359){
var _35a=_359.corner;
var pos=_359.pos;
if(_356){
_356(node,_359.aroundCorner,_35a);
}
var _35c=node.style;
var _35d=_35c.display;
var _35e=_35c.visibility;
_35c.visibility="hidden";
_35c.display="";
var mb=dojo.marginBox(node);
_35c.display=_35d;
_35c.visibility=_35e;
var _360=(_35a.charAt(1)=="L"?pos.x:Math.max(view.l,pos.x-mb.w)),_361=(_35a.charAt(0)=="T"?pos.y:Math.max(view.t,pos.y-mb.h)),endX=(_35a.charAt(1)=="L"?Math.min(view.l+view.w,_360+mb.w):pos.x),endY=(_35a.charAt(0)=="T"?Math.min(view.t+view.h,_361+mb.h):pos.y),_364=endX-_360,_365=endY-_361,_366=(mb.w-_364)+(mb.h-_365);
if(best==null||_366<best.overflow){
best={corner:_35a,aroundCorner:_359.aroundCorner,x:_360,y:_361,w:_364,h:_365,overflow:_366};
}
return !_366;
});
node.style.left=best.x+"px";
node.style.top=best.y+"px";
if(best.overflow&&_356){
_356(node,best.aroundCorner,best.corner);
}
return best;
};
dijit.placeOnScreenAroundNode=function(node,_368,_369,_36a){
_368=dojo.byId(_368);
var _36b=_368.style.display;
_368.style.display="";
var _36c=_368.offsetWidth;
var _36d=_368.offsetHeight;
var _36e=dojo.coords(_368,true);
_368.style.display=_36b;
return dijit._placeOnScreenAroundRect(node,_36e.x,_36e.y,_36c,_36d,_369,_36a);
};
dijit.placeOnScreenAroundRectangle=function(node,_370,_371,_372){
return dijit._placeOnScreenAroundRect(node,_370.x,_370.y,_370.width,_370.height,_371,_372);
};
dijit._placeOnScreenAroundRect=function(node,x,y,_376,_377,_378,_379){
var _37a=[];
for(var _37b in _378){
_37a.push({aroundCorner:_37b,corner:_378[_37b],pos:{x:x+(_37b.charAt(1)=="L"?0:_376),y:y+(_37b.charAt(0)=="T"?0:_377)}});
}
return dijit._place(node,_37a,_379);
};
dijit.placementRegistry=new dojo.AdapterRegistry();
dijit.placementRegistry.register("node",function(n,x){
return typeof x=="object"&&typeof x.offsetWidth!="undefined"&&typeof x.offsetHeight!="undefined";
},dijit.placeOnScreenAroundNode);
dijit.placementRegistry.register("rect",function(n,x){
return typeof x=="object"&&"x" in x&&"y" in x&&"width" in x&&"height" in x;
},dijit.placeOnScreenAroundRectangle);
dijit.placeOnScreenAroundElement=function(node,_381,_382,_383){
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
var _386=[],_387=1000,_388=1;
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
var _38c=args.popup,_38d=args.orient||{"BL":"TL","TL":"BL"},_38e=args.around,id=(args.around&&args.around.id)?(args.around.id+"_dropdown"):("popup_"+_388++);
var _390=dojo.doc.createElement("div");
dijit.setWaiRole(_390,"presentation");
_390.id=id;
_390.className="dijitPopup";
_390.style.zIndex=_387+_386.length;
_390.style.left=_390.style.top="0px";
_390.style.visibility="hidden";
if(args.parent){
_390.dijitPopupParent=args.parent.id;
}
dojo.body().appendChild(_390);
var s=_38c.domNode.style;
s.display="";
s.visibility="";
s.position="";
_390.appendChild(_38c.domNode);
var _392=new dijit.BackgroundIframe(_390);
var best=_38e?dijit.placeOnScreenAroundElement(_390,_38e,_38d,_38c.orient?dojo.hitch(_38c,"orient"):null):dijit.placeOnScreen(_390,args,_38d=="R"?["TR","BR","TL","BL"]:["TL","BL","TR","BR"]);
_390.style.visibility="visible";
var _394=[];
var _395=function(){
for(var pi=_386.length-1;pi>0&&_386[pi].parent===_386[pi-1].widget;pi--){
}
return _386[pi];
};
_394.push(dojo.connect(_390,"onkeypress",this,function(evt){
if(evt.charOrCode==dojo.keys.ESCAPE&&args.onCancel){
dojo.stopEvent(evt);
args.onCancel();
}else{
if(evt.charOrCode===dojo.keys.TAB){
dojo.stopEvent(evt);
var _398=_395();
if(_398&&_398.onCancel){
_398.onCancel();
}
}
}
}));
if(_38c.onCancel){
_394.push(dojo.connect(_38c,"onCancel",null,args.onCancel));
}
_394.push(dojo.connect(_38c,_38c.onExecute?"onExecute":"onChange",null,function(){
var _399=_395();
if(_399&&_399.onExecute){
_399.onExecute();
}
}));
_386.push({wrapper:_390,iframe:_392,widget:_38c,parent:args.parent,onExecute:args.onExecute,onCancel:args.onCancel,onClose:args.onClose,handlers:_394});
if(_38c.onOpen){
_38c.onOpen(best);
}
return best;
};
this.close=function(_39a){
while(dojo.some(_386,function(elem){
return elem.widget==_39a;
})){
var top=_386.pop(),_39d=top.wrapper,_39e=top.iframe,_39f=top.widget,_3a0=top.onClose;
if(_39f.onClose){
_39f.onClose();
}
dojo.forEach(top.handlers,dojo.disconnect);
if(!_39f||!_39f.domNode){
return;
}
this.prepare(_39f.domNode);
_39e.destroy();
dojo._destroyElement(_39d);
if(_3a0){
_3a0();
}
}
};
}();
dijit._frames=new function(){
var _3a1=[];
this.pop=function(){
var _3a2;
if(_3a1.length){
_3a2=_3a1.pop();
_3a2.style.display="";
}else{
if(dojo.isIE){
var burl=dojo.config["dojoBlankHtmlUrl"]||(dojo.moduleUrl("dojo","resources/blank.html")+"")||"javascript:\"\"";
var html="<iframe src='"+burl+"'"+" style='position: absolute; left: 0px; top: 0px;"+"z-index: -1; filter:Alpha(Opacity=\"0\");'>";
_3a2=dojo.doc.createElement(html);
}else{
_3a2=dojo.doc.createElement("iframe");
_3a2.src="javascript:\"\"";
_3a2.className="dijitBackgroundIframe";
}
_3a2.tabIndex=-1;
dojo.body().appendChild(_3a2);
}
return _3a2;
};
this.push=function(_3a5){
_3a5.style.display="";
if(dojo.isIE){
_3a5.style.removeExpression("width");
_3a5.style.removeExpression("height");
}
_3a1.push(_3a5);
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
var _3a8=dijit._frames.pop();
node.appendChild(_3a8);
if(dojo.isIE){
_3a8.style.setExpression("width",dojo._scopeName+".doc.getElementById('"+node.id+"').offsetWidth");
_3a8.style.setExpression("height",dojo._scopeName+".doc.getElementById('"+node.id+"').offsetHeight");
}
this.iframe=_3a8;
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
var _3ad=dojo.doc.compatMode!="BackCompat";
var _3ae=(_3ad&&!dojo.isSafari)?html:body;
function addPseudoAttrs(_3af){
var _3b0=_3af.parentNode;
var _3b1=_3af.offsetParent;
if(_3b1==null){
_3af=_3ae;
_3b1=html;
_3b0=null;
}
_3af._offsetParent=(_3b1==body)?_3ae:_3b1;
_3af._parent=(_3b0==body)?_3ae:_3b0;
_3af._start={H:_3af.offsetLeft,V:_3af.offsetTop};
_3af._scroll={H:_3af.scrollLeft,V:_3af.scrollTop};
_3af._renderedSize={H:_3af.offsetWidth,V:_3af.offsetHeight};
var bp=dojo._getBorderExtents(_3af);
_3af._borderStart={H:bp.l,V:bp.t};
_3af._borderSize={H:bp.w,V:bp.h};
_3af._clientSize=(_3af._offsetParent==html&&dojo.isSafari&&_3ad)?{H:html.clientWidth,V:html.clientHeight}:{H:_3af.clientWidth,V:_3af.clientHeight};
_3af._scrollBarSize={V:null,H:null};
for(var dir in _3af._scrollBarSize){
var _3b4=_3af._renderedSize[dir]-_3af._clientSize[dir]-_3af._borderSize[dir];
_3af._scrollBarSize[dir]=(_3af._clientSize[dir]>0&&_3b4>=15&&_3b4<=17)?_3b4:0;
}
_3af._isScrollable={V:null,H:null};
for(dir in _3af._isScrollable){
var _3b5=dir=="H"?"V":"H";
_3af._isScrollable[dir]=_3af==_3ae||_3af._scroll[dir]||_3af._scrollBarSize[_3b5];
}
};
var _3b6=node;
while(_3b6!=null){
addPseudoAttrs(_3b6);
var next=_3b6._parent;
if(next){
next._child=_3b6;
}
_3b6=next;
}
for(var dir in _3ae._renderedSize){
_3ae._renderedSize[dir]=Math.min(_3ae._clientSize[dir],_3ae._renderedSize[dir]);
}
var _3b9=node;
while(_3b9!=_3ae){
_3b6=_3b9._parent;
if(_3b6.tagName=="TD"){
var _3ba=_3b6._parent._parent._parent;
if(_3ba._offsetParent==_3b9._offsetParent&&_3b6._offsetParent!=_3b9._offsetParent){
_3b6=_3ba;
}
}
var _3bb=_3b9==_3ae||(_3b6._offsetParent!=_3b9._offsetParent);
for(dir in _3b9._start){
var _3bc=dir=="H"?"V":"H";
if(rtl&&dir=="H"&&(dojo.isSafari||dojo.isIE)&&_3b6._clientSize.H>0){
var _3bd=_3b6.scrollWidth-_3b6._clientSize.H;
if(_3bd>0){
_3b6._scroll.H-=_3bd;
}
}
if(dojo.isIE&&_3b6._offsetParent.tagName=="TABLE"){
_3b6._start[dir]-=_3b6._offsetParent._borderStart[dir];
_3b6._borderStart[dir]=_3b6._borderSize[dir]=0;
}
if(_3b6._clientSize[dir]==0){
_3b6._renderedSize[dir]=_3b6._clientSize[dir]=_3b6._child._clientSize[dir];
if(rtl&&dir=="H"){
_3b6._start[dir]-=_3b6._renderedSize[dir];
}
}else{
_3b6._renderedSize[dir]-=_3b6._borderSize[dir]+_3b6._scrollBarSize[dir];
}
_3b6._start[dir]+=_3b6._borderStart[dir];
var _3be=_3b9._start[dir]-(_3bb?0:_3b6._start[dir])-_3b6._scroll[dir];
var _3bf=_3be+_3b9._renderedSize[dir]-_3b6._renderedSize[dir];
var _3c0,_3c1=(dir=="H")?"scrollLeft":"scrollTop";
var _3c2=(dir=="H"&&rtl);
var _3c3=_3c2?-_3bf:_3be;
var _3c4=_3c2?-_3be:_3bf;
if(_3c3<=0){
_3c0=_3c3;
}else{
if(_3c4<=0){
_3c0=0;
}else{
if(_3c3<_3c4){
_3c0=_3c3;
}else{
_3c0=_3c4;
}
}
}
var _3c5=0;
if(_3c0!=0){
var _3c6=_3b6[_3c1];
_3b6[_3c1]+=_3c2?-_3c0:_3c0;
_3c5=_3b6[_3c1]-_3c6;
_3be-=_3c5;
_3c4-=_3c2?-_3c5:_3c5;
}
_3b6._renderedSize[dir]=_3b9._renderedSize[dir]+_3b6._scrollBarSize[dir]-((_3b6._isScrollable[dir]&&_3c4>0)?_3c4:0);
_3b6._start[dir]+=(_3be>=0||!_3b6._isScrollable[dir])?_3be:0;
}
_3b9=_3b6;
}
};
}
if(!dojo._hasResource["dijit._base.sniff"]){
dojo._hasResource["dijit._base.sniff"]=true;
dojo.provide("dijit._base.sniff");
(function(){
var d=dojo;
var ie=d.isIE;
var _3c9=d.isOpera;
var maj=Math.floor;
var ff=d.isFF;
var _3cc=d.boxModel.replace(/-/,"");
var _3cd={dj_ie:ie,dj_ie6:maj(ie)==6,dj_ie7:maj(ie)==7,dj_iequirks:ie&&d.isQuirks,dj_opera:_3c9,dj_opera8:maj(_3c9)==8,dj_opera9:maj(_3c9)==9,dj_khtml:d.isKhtml,dj_safari:d.isSafari,dj_gecko:d.isMozilla,dj_ff2:maj(ff)==2,dj_ff3:maj(ff)==3};
_3cd["dj_"+_3cc]=true;
var html=dojo.doc.documentElement;
for(var p in _3cd){
if(_3cd[p]){
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
for(var p in _3cd){
if(_3cd[p]){
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
},trigger:function(evt,_3d2,node,_3d4,obj,_3d6,_3d7){
if(obj!=this._obj){
this.stop();
this._initialDelay=_3d7||500;
this._subsequentDelay=_3d6||0.9;
this._obj=obj;
this._evt=evt;
this._node=node;
this._currentTimeout=-1;
this._count=-1;
this._callback=dojo.hitch(_3d2,_3d4);
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
},addKeyListener:function(node,_3d9,_3da,_3db,_3dc,_3dd){
if(_3d9.keyCode){
_3d9.charOrCode=_3d9.keyCode;
dojo.deprecated("keyCode attribute parameter for dijit.typematic.addKeyListener is deprecated. Use charOrCode instead.","","2.0");
}else{
if(_3d9.charCode){
_3d9.charOrCode=String.fromCharCode(_3d9.charCode);
dojo.deprecated("charCode attribute parameter for dijit.typematic.addKeyListener is deprecated. Use charOrCode instead.","","2.0");
}
}
return [dojo.connect(node,"onkeypress",this,function(evt){
if(evt.charOrCode==_3d9.charOrCode&&(_3d9.ctrlKey===undefined||_3d9.ctrlKey==evt.ctrlKey)&&(_3d9.altKey===undefined||_3d9.altKey==evt.ctrlKey)&&(_3d9.shiftKey===undefined||_3d9.shiftKey==evt.ctrlKey)){
dojo.stopEvent(evt);
dijit.typematic.trigger(_3d9,_3da,node,_3db,_3d9,_3dc,_3dd);
}else{
if(dijit.typematic._obj==_3d9){
dijit.typematic.stop();
}
}
}),dojo.connect(node,"onkeyup",this,function(evt){
if(dijit.typematic._obj==_3d9){
dijit.typematic.stop();
}
})];
},addMouseListener:function(node,_3e1,_3e2,_3e3,_3e4){
var dc=dojo.connect;
return [dc(node,"mousedown",this,function(evt){
dojo.stopEvent(evt);
dijit.typematic.trigger(evt,_3e1,node,_3e2,node,_3e3,_3e4);
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
dijit.typematic.trigger(evt,_3e1,node,_3e2,node,_3e3,_3e4);
setTimeout(dojo.hitch(this,dijit.typematic.stop),50);
}
})];
},addListener:function(_3eb,_3ec,_3ed,_3ee,_3ef,_3f0,_3f1){
return this.addKeyListener(_3ec,_3ed,_3ee,_3ef,_3f0,_3f1).concat(this.addMouseListener(_3eb,_3ee,_3ef,_3f0,_3f1));
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
var _3f4=cs.backgroundImage;
var _3f5=(cs.borderTopColor==cs.borderRightColor)||(_3f4!=null&&(_3f4=="none"||_3f4=="url(invalid-url:)"));
dojo[_3f5?"addClass":"removeClass"](dojo.body(),"dijit_a11y");
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
var _3f8=this.getWaiRole(elem);
if(role){
return (_3f8.indexOf(role)>-1);
}else{
return (_3f8.length>0);
}
},getWaiRole:function(elem){
return dojo.trim((dojo.attr(elem,"role")||"").replace(this._XhtmlRoles,"").replace("wairole:",""));
},setWaiRole:function(elem,role){
var _3fc=dojo.attr(elem,"role")||"";
if(dojo.isFF<3||!this._XhtmlRoles.test(_3fc)){
dojo.attr(elem,"role",dojo.isFF<3?"wairole:"+role:role);
}else{
if((" "+_3fc+" ").indexOf(" "+role+" ")<0){
var _3fd=dojo.trim(_3fc.replace(this._XhtmlRoles,""));
var _3fe=dojo.trim(_3fc.replace(_3fd,""));
dojo.attr(elem,"role",_3fe+(_3fe?" ":"")+role);
}
}
},removeWaiRole:function(elem,role){
var _401=dojo.attr(elem,"role");
if(!_401){
return;
}
if(role){
var _402=dojo.isFF<3?"wairole:"+role:role;
var t=dojo.trim((" "+_401+" ").replace(" "+_402+" "," "));
dojo.attr(elem,"role",t);
}else{
elem.removeAttribute("role");
}
},hasWaiState:function(elem,_405){
if(dojo.isFF<3){
return elem.hasAttributeNS("http://www.w3.org/2005/07/aaa",_405);
}else{
return elem.hasAttribute?elem.hasAttribute("aria-"+_405):!!elem.getAttribute("aria-"+_405);
}
},getWaiState:function(elem,_407){
if(dojo.isFF<3){
return elem.getAttributeNS("http://www.w3.org/2005/07/aaa",_407);
}else{
var _408=elem.getAttribute("aria-"+_407);
return _408?_408:"";
}
},setWaiState:function(elem,_40a,_40b){
if(dojo.isFF<3){
elem.setAttributeNS("http://www.w3.org/2005/07/aaa","aaa:"+_40a,_40b);
}else{
elem.setAttribute("aria-"+_40a,_40b);
}
},removeWaiState:function(elem,_40d){
if(dojo.isFF<3){
elem.removeAttributeNS("http://www.w3.org/2005/07/aaa",_40d);
}else{
elem.removeAttribute("aria-"+_40d);
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
dojo.connect(dojo,"connect",function(_40e,_40f){
if(_40e&&dojo.isFunction(_40e._onConnect)){
_40e._onConnect(_40f);
}
});
dijit._connectOnUseEventHandler=function(_410){
};
(function(){
var _411={};
var _412=function(dc){
if(!_411[dc]){
var r=[];
var _415;
var _416=dojo.getObject(dc).prototype;
for(var _417 in _416){
if(dojo.isFunction(_416[_417])&&(_415=_417.match(/^_set([a-zA-Z]*)Attr$/))&&_415[1]){
r.push(_415[1].charAt(0).toLowerCase()+_415[1].substr(1));
}
}
_411[dc]=r;
}
return _411[dc]||[];
};
dojo.declare("dijit._Widget",null,{id:"",lang:"",dir:"","class":"",style:"",title:"",srcNodeRef:null,domNode:null,containerNode:null,attributeMap:{id:"",dir:"",lang:"","class":"",style:"",title:""},_deferredConnects:{onClick:"",onDblClick:"",onKeyDown:"",onKeyPress:"",onKeyUp:"",onMouseMove:"",onMouseDown:"",onMouseOut:"",onMouseOver:"",onMouseLeave:"",onMouseEnter:"",onMouseUp:""},onClick:dijit._connectOnUseEventHandler,onDblClick:dijit._connectOnUseEventHandler,onKeyDown:dijit._connectOnUseEventHandler,onKeyPress:dijit._connectOnUseEventHandler,onKeyUp:dijit._connectOnUseEventHandler,onMouseDown:dijit._connectOnUseEventHandler,onMouseMove:dijit._connectOnUseEventHandler,onMouseOut:dijit._connectOnUseEventHandler,onMouseOver:dijit._connectOnUseEventHandler,onMouseLeave:dijit._connectOnUseEventHandler,onMouseEnter:dijit._connectOnUseEventHandler,onMouseUp:dijit._connectOnUseEventHandler,_blankGif:(dojo.config.blankGif||dojo.moduleUrl("dojo","resources/blank.gif")),postscript:function(_418,_419){
this.create(_418,_419);
},create:function(_41a,_41b){
this.srcNodeRef=dojo.byId(_41b);
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
if(_41a){
this.params=_41a;
dojo.mixin(this,_41a);
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
var _41d=function(attr,_41f){
if((_41f.params&&attr in _41f.params)||_41f[attr]){
_41f.attr(attr,_41f[attr]);
}
};
for(var attr in this.attributeMap){
_41d(attr,this);
}
dojo.forEach(_412(this.declaredClass),function(a){
if(!(a in this.attributeMap)){
_41d(a,this);
}
},this);
},postMixInProperties:function(){
},buildRendering:function(){
this.domNode=this.srcNodeRef||dojo.doc.createElement("div");
},postCreate:function(){
},startup:function(){
this._started=true;
},destroyRecursive:function(_422){
this.destroyDescendants(_422);
this.destroy(_422);
},destroy:function(_423){
this.uninitialize();
dojo.forEach(this._connects,function(_424){
dojo.forEach(_424,dojo.disconnect);
});
dojo.forEach(this._supportingWidgets||[],function(w){
if(w.destroy){
w.destroy();
}
});
this.destroyRendering(_423);
dijit.registry.remove(this.id);
},destroyRendering:function(_426){
if(this.bgIframe){
this.bgIframe.destroy(_426);
delete this.bgIframe;
}
if(this.domNode){
if(!_426){
dojo._destroyElement(this.domNode);
}
delete this.domNode;
}
if(this.srcNodeRef){
if(!_426){
dojo._destroyElement(this.srcNodeRef);
}
delete this.srcNodeRef;
}
},destroyDescendants:function(_427){
dojo.forEach(this.getDescendants(),function(_428){
if(_428.destroy){
_428.destroy(_427);
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
},_onConnect:function(_42a){
if(_42a in this._deferredConnects){
var _42b=this[this._deferredConnects[_42a]||"domNode"];
this.connect(_42b,_42a.toLowerCase(),this[_42a]);
delete this._deferredConnects[_42a];
}
},_setClassAttr:function(_42c){
var _42d=this[this.attributeMap["class"]||"domNode"];
dojo.removeClass(_42d,this["class"]);
this["class"]=_42c;
dojo.addClass(_42d,_42c);
},_setStyleAttr:function(_42e){
var _42f=this[this.attributeMap["style"]||"domNode"];
if(_42f.style.cssText){
_42f.style.cssText+="; "+_42e;
}else{
_42f.style.cssText=_42e;
}
this["style"]=_42e;
},setAttribute:function(attr,_431){
dojo.deprecated(this.declaredClass+"::setAttribute() is deprecated. Use attr() instead.","","2.0");
this.attr(attr,_431);
},_attrToDom:function(attr,_433){
var _434=this.attributeMap[attr];
dojo.forEach(dojo.isArray(_434)?_434:[_434],function(_435){
var _436=this[_435.node||_435||"domNode"];
var type=_435.type||"attribute";
switch(type){
case "attribute":
if(dojo.isFunction(_433)){
_433=dojo.hitch(this,_433);
}
if(/^on[A-Z][a-zA-Z]*$/.test(attr)){
attr=attr.toLowerCase();
}
dojo.attr(_436,attr,_433);
break;
case "innerHTML":
_436.innerHTML=_433;
break;
case "class":
dojo.removeClass(_436,this[attr]);
dojo.addClass(_436,_433);
break;
}
},this);
this[attr]=_433;
},attr:function(name,_439){
var args=arguments.length;
if(args==1&&!dojo.isString(name)){
for(var x in name){
this.attr(x,name[x]);
}
return this;
}
var _43c=this._getAttrNames(name);
if(args==2){
if(this[_43c.s]){
return this[_43c.s](_439)||this;
}else{
if(name in this.attributeMap){
this._attrToDom(name,_439);
}
this[name]=_439;
}
return this;
}else{
if(this[_43c.g]){
return this[_43c.g]();
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
},nodesWithKeyClick:["input","button"],connect:function(obj,_442,_443){
var d=dojo;
var dco=d.hitch(d,"connect",obj);
var _446=[];
if(_442=="ondijitclick"){
if(!this.nodesWithKeyClick[obj.nodeName]){
var m=d.hitch(this,_443);
_446.push(dco("onkeydown",this,function(e){
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
_446.push(dco("onkeypress",this,function(e){
if(e.keyCode==d.keys.ENTER){
return m(e);
}
}));
}
}
_442="onclick";
}
_446.push(dco(_442,this,_443));
this._connects.push(_446);
return _446;
},disconnect:function(_44b){
for(var i=0;i<this._connects.length;i++){
if(this._connects[i]==_44b){
dojo.forEach(_44b,dojo.disconnect);
this._connects.splice(i,1);
return;
}
}
},isLeftToRight:function(){
return dojo._isBodyLtr();
},isFocusable:function(){
return this.focus&&(dojo.style(this.domNode,"display")!="none");
},placeAt:function(_44d,_44e){
if(_44d["declaredClass"]&&_44d["addChild"]){
_44d.addChild(this,_44e);
}else{
dojo.place(this.domNode,_44d,_44e);
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
dojo.string.substitute=function(_458,map,_45a,_45b){
_45b=_45b||dojo.global;
_45a=(!_45a)?function(v){
return v;
}:dojo.hitch(_45b,_45a);
return _458.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g,function(_45d,key,_45f){
var _460=dojo.getObject(key,false,map);
if(_45f){
_460=dojo.getObject(_45f,false,_45b).call(_45b,_460,key);
}
return _45a(_460,key).toString();
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
var _464=this.declaredClass,_465=this;
return dojo.string.substitute(tmpl,this,function(_466,key){
if(key.charAt(0)=="!"){
_466=_465[key.substr(1)];
}
if(typeof _466=="undefined"){
throw new Error(_464+" template:"+key);
}
if(_466==null){
return "";
}
return key.charAt(0)=="!"?_466:_466.toString().replace(/"/g,"&quot;");
},this);
},buildRendering:function(){
var _468=dijit._Templated.getCachedTemplate(this.templatePath,this.templateString,this._skipNodeCache);
var node;
if(dojo.isString(_468)){
node=dijit._Templated._createNodesFromText(this._stringRepl(_468))[0];
}else{
node=_468.cloneNode(true);
}
this.domNode=node;
this._attachTemplateNodes(node);
var _46a=this.srcNodeRef;
if(_46a&&_46a.parentNode){
_46a.parentNode.replaceChild(node,_46a);
}
if(this.widgetsInTemplate){
var cw=(this._supportingWidgets=dojo.parser.parse(node));
this._attachTemplateNodes(cw,function(n,p){
return n[p];
});
}
this._fillContent(_46a);
},_fillContent:function(_46e){
var dest=this.containerNode;
if(_46e&&dest){
while(_46e.hasChildNodes()){
dest.appendChild(_46e.firstChild);
}
}
},_attachTemplateNodes:function(_470,_471){
_471=_471||function(n,p){
return n.getAttribute(p);
};
var _474=dojo.isArray(_470)?_470:(_470.all||_470.getElementsByTagName("*"));
var x=dojo.isArray(_470)?0:-1;
var _476={};
for(;x<_474.length;x++){
var _477=(x==-1)?_470:_474[x];
if(this.widgetsInTemplate&&_471(_477,"dojoType")){
continue;
}
var _478=_471(_477,"dojoAttachPoint");
if(_478){
var _479,_47a=_478.split(/\s*,\s*/);
while((_479=_47a.shift())){
if(dojo.isArray(this[_479])){
this[_479].push(_477);
}else{
this[_479]=_477;
}
}
}
var _47b=_471(_477,"dojoAttachEvent");
if(_47b){
var _47c,_47d=_47b.split(/\s*,\s*/);
var trim=dojo.trim;
while((_47c=_47d.shift())){
if(_47c){
var _47f=null;
if(_47c.indexOf(":")!=-1){
var _480=_47c.split(":");
_47c=trim(_480[0]);
_47f=trim(_480[1]);
}else{
_47c=trim(_47c);
}
if(!_47f){
_47f=_47c;
}
this.connect(_477,_47c,_47f);
}
}
}
var role=_471(_477,"waiRole");
if(role){
dijit.setWaiRole(_477,role);
}
var _482=_471(_477,"waiState");
if(_482){
dojo.forEach(_482.split(/\s*,\s*/),function(_483){
if(_483.indexOf("-")!=-1){
var pair=_483.split("-");
dijit.setWaiState(_477,pair[0],pair[1]);
}
});
}
}
}});
dijit._Templated._templateCache={};
dijit._Templated.getCachedTemplate=function(_485,_486,_487){
var _488=dijit._Templated._templateCache;
var key=_486||_485;
var _48a=_488[key];
if(_48a){
if(!_48a.ownerDocument||_48a.ownerDocument==dojo.doc){
return _48a;
}
dojo._destroyElement(_48a);
}
if(!_486){
_486=dijit._Templated._sanitizeTemplateString(dojo._getText(_485));
}
_486=dojo.string.trim(_486);
if(_487||_486.match(/\$\{([^\}]+)\}/g)){
return (_488[key]=_486);
}else{
return (_488[key]=dijit._Templated._createNodesFromText(_486)[0]);
}
};
dijit._Templated._sanitizeTemplateString=function(_48b){
if(_48b){
_48b=_48b.replace(/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,"");
var _48c=_48b.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
if(_48c){
_48b=_48c[1];
}
}else{
_48b="";
}
return _48b;
};
if(dojo.isIE){
dojo.addOnWindowUnload(function(){
var _48d=dijit._Templated._templateCache;
for(var key in _48d){
var _48f=_48d[key];
if(!isNaN(_48f.nodeType)){
dojo._destroyElement(_48f);
}
delete _48d[key];
}
});
}
(function(){
var _490={cell:{re:/^<t[dh][\s\r\n>]/i,pre:"<table><tbody><tr>",post:"</tr></tbody></table>"},row:{re:/^<tr[\s\r\n>]/i,pre:"<table><tbody>",post:"</tbody></table>"},section:{re:/^<(thead|tbody|tfoot)[\s\r\n>]/i,pre:"<table>",post:"</table>"}};
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
var _493="none";
var _494=text.replace(/^\s+/,"");
for(var type in _490){
var map=_490[type];
if(map.re.test(_494)){
_493=type;
text=map.pre+text+map.post;
break;
}
}
tn.innerHTML=text;
if(tn.normalize){
tn.normalize();
}
var tag={cell:"tr",row:"tbody",section:"table"}[_493];
var _498=(typeof tag!="undefined")?tn.getElementsByTagName(tag)[0]:tn;
var _499=[];
while(_498.firstChild){
_499.push(_498.removeChild(_498.firstChild));
}
tn.innerHTML="";
return _499;
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
var _49c=dijit.byId(id);
return _49c.isContainer?_49c:null;
}
}
return null;
},_getSibling:function(_49d){
var node=this.domNode;
do{
node=node[_49d+"Sibling"];
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
},addChild:function(_4a1,_4a2){
var _4a3=this.containerNode;
if(_4a2&&typeof _4a2=="number"){
var _4a4=dojo.query("> [widgetId]",_4a3);
if(_4a4&&_4a4.length>=_4a2){
_4a3=_4a4[_4a2-1];
_4a2="after";
}
}
dojo.place(_4a1.domNode,_4a3,_4a2);
if(this._started&&!_4a1._started){
_4a1.startup();
}
},removeChild:function(_4a5){
if(typeof _4a5=="number"&&_4a5>0){
_4a5=this.getChildren()[_4a5];
}
if(!_4a5||!_4a5.domNode){
return;
}
var node=_4a5.domNode;
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
},destroyDescendants:function(_4a9){
dojo.forEach(this.getChildren(),function(_4aa){
_4aa.destroyRecursive(_4a9);
});
},_getSiblingOfChild:function(_4ab,dir){
var node=_4ab.domNode;
var _4ae=(dir>0?"nextSibling":"previousSibling");
do{
node=node[_4ae];
}while(node&&(node.nodeType!=1||!dijit.byNode(node)));
return node?dijit.byNode(node):null;
},getIndexOfChild:function(_4af){
var _4b0=this.getChildren();
for(var i=0,c;c=_4b0[i];i++){
if(c==_4af){
return i;
}
}
return -1;
}});
dojo.declare("dijit._KeyNavContainer",[dijit._Container],{_keyNavCodes:{},connectKeyNavHandlers:function(_4b3,_4b4){
var _4b5=this._keyNavCodes={};
var prev=dojo.hitch(this,this.focusPrev);
var next=dojo.hitch(this,this.focusNext);
dojo.forEach(_4b3,function(code){
_4b5[code]=prev;
});
dojo.forEach(_4b4,function(code){
_4b5[code]=next;
});
this.connect(this.domNode,"onkeypress","_onContainerKeypress");
this.connect(this.domNode,"onfocus","_onContainerFocus");
},startupKeyNavChildren:function(){
dojo.forEach(this.getChildren(),dojo.hitch(this,"_startupChild"));
},addChild:function(_4ba,_4bb){
dijit._KeyNavContainer.superclass.addChild.apply(this,arguments);
this._startupChild(_4ba);
},focus:function(){
this.focusFirstChild();
},focusFirstChild:function(){
this.focusChild(this._getFirstFocusableChild());
},focusNext:function(){
if(this.focusedChild&&this.focusedChild.hasNextFocalNode&&this.focusedChild.hasNextFocalNode()){
this.focusedChild.focusNext();
return;
}
var _4bc=this._getNextFocusableChild(this.focusedChild,1);
if(_4bc.getFocalNodes){
this.focusChild(_4bc,_4bc.getFocalNodes()[0]);
}else{
this.focusChild(_4bc);
}
},focusPrev:function(){
if(this.focusedChild&&this.focusedChild.hasPrevFocalNode&&this.focusedChild.hasPrevFocalNode()){
this.focusedChild.focusPrev();
return;
}
var _4bd=this._getNextFocusableChild(this.focusedChild,-1);
if(_4bd.getFocalNodes){
var _4be=_4bd.getFocalNodes();
this.focusChild(_4bd,_4be[_4be.length-1]);
}else{
this.focusChild(_4bd);
}
},focusChild:function(_4bf,node){
if(_4bf){
if(this.focusedChild&&_4bf!==this.focusedChild){
this._onChildBlur(this.focusedChild);
}
this.focusedChild=_4bf;
if(node&&_4bf.focusFocalNode){
_4bf.focusFocalNode(node);
}else{
_4bf.focus();
}
}
},_startupChild:function(_4c1){
if(_4c1.getFocalNodes){
dojo.forEach(_4c1.getFocalNodes(),function(node){
dojo.attr(node,"tabindex",-1);
this._connectNode(node);
},this);
}else{
var node=_4c1.focusNode||_4c1.domNode;
if(_4c1.isFocusable()){
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
var _4c9=dijit.getEnclosingWidget(evt.target);
if(_4c9&&_4c9.isFocusable()){
this.focusedChild=_4c9;
}
dojo.stopEvent(evt);
},_onNodeBlur:function(evt){
if(this.tabIndex){
dojo.attr(this.domNode,"tabindex",this.tabIndex);
}
dojo.stopEvent(evt);
},_onChildBlur:function(_4cb){
},_getFirstFocusableChild:function(){
return this._getNextFocusableChild(null,1);
},_getNextFocusableChild:function(_4cc,dir){
if(_4cc){
_4cc=this._getSiblingOfChild(_4cc,dir);
}
var _4ce=this.getChildren();
for(var i=0;i<_4ce.length;i++){
if(!_4cc){
_4cc=_4ce[(dir>0)?0:(_4ce.length-1)];
}
if(_4cc.isFocusable()){
return _4cc;
}
_4cc=this._getSiblingOfChild(_4cc,dir);
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
dojo.forEach(this.getChildren(),function(_4d0){
_4d0.startup();
});
if(!this.getParent||!this.getParent()){
this.resize();
this.connect(dojo.global,"onresize","resize");
}
this.inherited(arguments);
},resize:function(_4d1,_4d2){
var node=this.domNode;
if(_4d1){
dojo.marginBox(node,_4d1);
if(_4d1.t){
node.style.top=_4d1.t+"px";
}
if(_4d1.l){
node.style.left=_4d1.l+"px";
}
}
var mb=_4d2||{};
dojo.mixin(mb,_4d1||{});
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
},_setupChild:function(_4da){
if(_4da.baseClass){
dojo.addClass(_4da.domNode,this.baseClass+"-"+_4da.baseClass);
}
},addChild:function(_4db,_4dc){
this.inherited(arguments);
if(this._started){
this._setupChild(_4db);
}
},removeChild:function(_4dd){
if(_4dd.baseClass){
dojo.removeClass(_4dd.domNode,this.baseClass+"-"+_4dd.baseClass);
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
var _4e3=function(word){
return word.substring(0,1).toUpperCase()+word.substring(1);
};
var size=function(_4e6,dim){
_4e6.resize?_4e6.resize(dim):dojo.marginBox(_4e6.domNode,dim);
dojo.mixin(_4e6,dojo.marginBox(_4e6.domNode));
dojo.mixin(_4e6,dim);
};
dijit.layout.layoutChildren=function(_4e8,dim,_4ea){
dim=dojo.mixin({},dim);
dojo.addClass(_4e8,"dijitLayoutContainer");
_4ea=dojo.filter(_4ea,function(item){
return item.layoutAlign!="client";
}).concat(dojo.filter(_4ea,function(item){
return item.layoutAlign=="client";
}));
dojo.forEach(_4ea,function(_4ed){
var elm=_4ed.domNode,pos=_4ed.layoutAlign;
var _4f0=elm.style;
_4f0.left=dim.l+"px";
_4f0.top=dim.t+"px";
_4f0.bottom=_4f0.right="auto";
dojo.addClass(elm,"dijitAlign"+_4e3(pos));
if(pos=="top"||pos=="bottom"){
size(_4ed,{w:dim.w});
dim.h-=_4ed.h;
if(pos=="top"){
dim.t+=_4ed.h;
}else{
_4f0.top=dim.t+dim.h+"px";
}
}else{
if(pos=="left"||pos=="right"){
size(_4ed,{h:dim.h});
dim.w-=_4ed.w;
if(pos=="left"){
dim.l+=_4ed.w;
}else{
_4f0.left=dim.l+dim.w+"px";
}
}else{
if(pos=="client"){
size(_4ed,dim);
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
var _4f1=0;
dojo.html._secureForInnerHtml=function(cont){
return cont.replace(/(?:\s*<!DOCTYPE\s[^>]+>|<title[^>]*>[\s\S]*?<\/title>)/ig,"");
};
dojo.html._emptyNode=function(node){
while(node.firstChild){
dojo._destroyElement(node.firstChild);
}
};
dojo.html._setNodeContent=function(node,cont,_4f6){
if(_4f6){
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
dojo.declare("dojo.html._ContentSetter",null,{node:"",content:"",id:"",cleanContent:false,extractContent:false,parseContent:false,constructor:function(_4fe,node){
dojo.mixin(this,_4fe||{});
node=this.node=dojo.byId(this.node||node);
if(!this.id){
this.id=["Setter",(node)?node.id||node.tagName:"",_4f1++].join("_");
}
if(!(this.node||node)){
new Error(this.declaredClass+": no node provided to "+this.id);
}
},set:function(cont,_501){
if(undefined!==cont){
this.content=cont;
}
if(_501){
this._mixin(_501);
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
var _503=this.onContentError(e);
try{
node.innerHTML=_503;
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
var _506=cont.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
if(_506){
cont=_506[1];
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
},_mixin:function(_508){
var _509={},key;
for(key in _508){
if(key in _509){
continue;
}
this[key]=_508[key];
}
},_parse:function(){
var _50b=this.node;
try{
this.parseResults=dojo.parser.parse(_50b,true);
}
catch(e){
this._onError("Content",e,"Error parsing in _ContentSetter#"+this.id);
}
},_onError:function(type,err,_50e){
var _50f=this["on"+type+"Error"].call(this,err);
if(_50e){
console.error(_50e,err);
}else{
if(_50f){
dojo.html._setNodeContent(this.node,_50f,true);
}
}
}});
dojo.html.set=function(node,cont,_512){
if(undefined==cont){
console.warn("dojo.html.set: no cont argument provided, using empty string");
cont="";
}
if(!_512){
return dojo.html._setNodeContent(node,cont,true);
}else{
var op=new dojo.html._ContentSetter(dojo.mixin(_512,{content:cont,node:node}));
return op.set();
}
};
})();
}
if(!dojo._hasResource["dojo.i18n"]){
dojo._hasResource["dojo.i18n"]=true;
dojo.provide("dojo.i18n");
dojo.i18n.getLocalization=function(_514,_515,_516){
_516=dojo.i18n.normalizeLocale(_516);
var _517=_516.split("-");
var _518=[_514,"nls",_515].join(".");
var _519=dojo._loadedModules[_518];
if(_519){
var _51a;
for(var i=_517.length;i>0;i--){
var loc=_517.slice(0,i).join("_");
if(_519[loc]){
_51a=_519[loc];
break;
}
}
if(!_51a){
_51a=_519.ROOT;
}
if(_51a){
var _51d=function(){
};
_51d.prototype=_51a;
return new _51d();
}
}
throw new Error("Bundle not found: "+_515+" in "+_514+" , locale="+_516);
};
dojo.i18n.normalizeLocale=function(_51e){
var _51f=_51e?_51e.toLowerCase():dojo.locale;
if(_51f=="root"){
_51f="ROOT";
}
return _51f;
};
dojo.i18n._requireLocalization=function(_520,_521,_522,_523){
var _524=dojo.i18n.normalizeLocale(_522);
var _525=[_520,"nls",_521].join(".");
var _526="";
if(_523){
var _527=_523.split(",");
for(var i=0;i<_527.length;i++){
if(_524["indexOf"](_527[i])==0){
if(_527[i].length>_526.length){
_526=_527[i];
}
}
}
if(!_526){
_526="ROOT";
}
}
var _529=_523?_526:_524;
var _52a=dojo._loadedModules[_525];
var _52b=null;
if(_52a){
if(dojo.config.localizationComplete&&_52a._built){
return;
}
var _52c=_529.replace(/-/g,"_");
var _52d=_525+"."+_52c;
_52b=dojo._loadedModules[_52d];
}
if(!_52b){
_52a=dojo["provide"](_525);
var syms=dojo._getModuleSymbols(_520);
var _52f=syms.concat("nls").join("/");
var _530;
dojo.i18n._searchLocalePath(_529,_523,function(loc){
var _532=loc.replace(/-/g,"_");
var _533=_525+"."+_532;
var _534=false;
if(!dojo._loadedModules[_533]){
dojo["provide"](_533);
var _535=[_52f];
if(loc!="ROOT"){
_535.push(loc);
}
_535.push(_521);
var _536=_535.join("/")+".js";
_534=dojo._loadPath(_536,null,function(hash){
var _538=function(){
};
_538.prototype=_530;
_52a[_532]=new _538();
for(var j in hash){
_52a[_532][j]=hash[j];
}
});
}else{
_534=true;
}
if(_534&&_52a[_532]){
_530=_52a[_532];
}else{
_52a[_532]=_530;
}
if(_523){
return true;
}
});
}
if(_523&&_524!=_526){
_52a[_524.replace(/-/g,"_")]=_52a[_526.replace(/-/g,"_")];
}
};
(function(){
var _53a=dojo.config.extraLocale;
if(_53a){
if(!_53a instanceof Array){
_53a=[_53a];
}
var req=dojo.i18n._requireLocalization;
dojo.i18n._requireLocalization=function(m,b,_53e,_53f){
req(m,b,_53e,_53f);
if(_53e){
return;
}
for(var i=0;i<_53a.length;i++){
req(m,b,_53a[i],_53f);
}
};
}
})();
dojo.i18n._searchLocalePath=function(_541,down,_543){
_541=dojo.i18n.normalizeLocale(_541);
var _544=_541.split("-");
var _545=[];
for(var i=_544.length;i>0;i--){
_545.push(_544.slice(0,i).join("-"));
}
_545.push(false);
if(down){
_545.reverse();
}
for(var j=_545.length-1;j>=0;j--){
var loc=_545[j]||"ROOT";
var stop=_543(loc);
if(stop){
break;
}
}
};
dojo.i18n._preloadLocalizations=function(_54a,_54b){
function preload(_54c){
_54c=dojo.i18n.normalizeLocale(_54c);
dojo.i18n._searchLocalePath(_54c,true,function(loc){
for(var i=0;i<_54b.length;i++){
if(_54b[i]==loc){
dojo["require"](_54a+"_"+loc);
return true;
}
}
return false;
});
};
preload();
var _54f=dojo.config.extraLocale||[];
for(var i=0;i<_54f.length;i++){
preload(_54f[i]);
}
};
}
if(!dojo._hasResource["dijit.layout.ContentPane"]){
dojo._hasResource["dijit.layout.ContentPane"]=true;
dojo.provide("dijit.layout.ContentPane");
dojo.declare("dijit.layout.ContentPane",dijit._Widget,{href:"",extractContent:false,parseOnLoad:true,preventCache:false,preload:false,refreshOnShow:false,loadingMessage:"<span class='dijitContentPaneLoading'>${loadingState}</span>",errorMessage:"<span class='dijitContentPaneError'>${errorState}</span>",isLoaded:false,baseClass:"dijitContentPane",doLayout:true,_isRealContent:true,postMixInProperties:function(){
this.inherited(arguments);
var _551=dojo.i18n.getLocalization("dijit","loading",this.lang);
this.loadingMessage=dojo.string.substitute(this.loadingMessage,_551);
this.errorMessage=dojo.string.substitute(this.errorMessage,_551);
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
var _552=dojo.query(">",this.containerNode),_553=_552.filter(function(node){
return dojo.hasAttr(node,"dojoType")||dojo.hasAttr(node,"widgetId");
}),_555=dojo.filter(_553.map(dijit.byNode),function(_556){
return _556&&_556.domNode&&_556.resize;
});
if(_552.length==_553.length&&_555.length==1){
this.isContainer=true;
this._singleChild=_555[0];
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
this.href="";
this.cancel();
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
},_getContentAttr:function(){
return this.containerNode.innerHTML;
},cancel:function(){
if(this._xhrDfd&&(this._xhrDfd.fired==-1)){
this._xhrDfd.cancel();
}
delete this._xhrDfd;
},destroyRecursive:function(_55c){
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
},_prepareLoad:function(_561){
this.cancel();
this.isLoaded=false;
this._loadCheck(_561);
},_isShown:function(){
if("open" in this){
return this.open;
}else{
var node=this.domNode;
return (node.style.display!="none")&&(node.style.visibility!="hidden");
}
},_loadCheck:function(_563){
var _564=this._isShown();
if(this.href&&(_563||(this.preload&&!this.isLoaded&&!this._xhrDfd)||(this.refreshOnShow&&_564&&!this._xhrDfd)||(!this.isLoaded&&_564&&!this._xhrDfd))){
this._downloadExternalContent();
}
},_downloadExternalContent:function(){
this._setContent(this.onDownloadStart(),true);
var self=this;
var _566={preventCache:(this.preventCache||this.refreshOnShow),url:this.href,handleAs:"text"};
if(dojo.isObject(this.ioArgs)){
dojo.mixin(_566,this.ioArgs);
}
var hand=this._xhrDfd=(this.ioMethod||dojo.xhrGet)(_566);
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
if(!hand.cancelled){
self._onError("Download",err);
}
delete self._xhrDfd;
return err;
});
},_onLoadHandler:function(data){
this.isLoaded=true;
try{
this.onLoad(data);
}
catch(e){
console.error("Error "+this.widgetId+" running custom onLoad code");
}
},_onUnloadHandler:function(){
this.isLoaded=false;
try{
this.onUnload();
}
catch(e){
console.error("Error "+this.widgetId+" running custom onUnload code");
}
},destroyDescendants:function(){
if(this._isRealContent){
this._onUnloadHandler();
}
var _56b=this._contentSetter;
if(_56b){
_56b.empty();
}else{
this.inherited(arguments);
dojo.html._emptyNode(this.containerNode);
}
},_setContent:function(cont,_56d){
this.destroyDescendants();
this._isRealContent=!_56d;
var _56e=this._contentSetter;
if(!(_56e&&_56e instanceof dojo.html._ContentSetter)){
_56e=this._contentSetter=new dojo.html._ContentSetter({node:this.containerNode,_onError:dojo.hitch(this,this._onError),onContentError:dojo.hitch(this,function(e){
var _570=this.onContentError(e);
try{
this.containerNode.innerHTML=_570;
}
catch(e){
console.error("Fatal "+this.id+" could not change content due to "+e.message,e);
}
})});
}
var _571=dojo.mixin({cleanContent:this.cleanContent,extractContent:this.extractContent,parseContent:this.parseOnLoad},this._contentSetterParams||{});
dojo.mixin(_56e,_571);
_56e.set((dojo.isObject(cont)&&cont.domNode)?cont.domNode:cont);
delete this._contentSetterParams;
if(!_56d){
this._onLoadHandler(cont);
}
},_onError:function(type,err,_574){
var _575=this["on"+type+"Error"].call(this,err);
if(_574){
console.error(_574,err);
}else{
if(_575){
this._setContent(_575,true);
}
}
},_createSubWidgets:function(){
try{
dojo.parser.parse(this.containerNode,true);
}
catch(e){
this._onError("Content",e,"Couldn't create widgets in "+this.id+(this.href?" from "+this.href:""));
}
},onLoad:function(data){
},onUnload:function(){
},onDownloadStart:function(){
return this.loadingMessage;
},onContentError:function(_577){
},onDownloadError:function(_578){
return this.errorMessage;
},onDownloadEnd:function(){
}});
}
if(!dojo._hasResource["dijit.form.Form"]){
dojo._hasResource["dijit.form.Form"]=true;
dojo.provide("dijit.form.Form");
dojo.declare("dijit.form._FormMixin",null,{reset:function(){
dojo.forEach(this.getDescendants(),function(_579){
if(_579.reset){
_579.reset();
}
});
},validate:function(){
var _57a=false;
return dojo.every(dojo.map(this.getDescendants(),function(_57b){
_57b._hasBeenBlurred=true;
var _57c=_57b.disabled||!_57b.validate||_57b.validate();
if(!_57c&&!_57a){
dijit.scrollIntoView(_57b.containerNode||_57b.domNode);
_57b.focus();
_57a=true;
}
return _57c;
}),function(item){
return item;
});
},setValues:function(val){
dojo.deprecated(this.declaredClass+"::setValues() is deprecated. Use attr('value', val) instead.","","2.0");
return this.attr("value",val);
},_setValueAttr:function(obj){
var map={};
dojo.forEach(this.getDescendants(),function(_581){
if(!_581.name){
return;
}
var _582=map[_581.name]||(map[_581.name]=[]);
_582.push(_581);
});
for(var name in map){
if(!map.hasOwnProperty(name)){
continue;
}
var _584=map[name],_585=dojo.getObject(name,false,obj);
if(_585===undefined){
continue;
}
if(!dojo.isArray(_585)){
_585=[_585];
}
if(typeof _584[0].checked=="boolean"){
dojo.forEach(_584,function(w,i){
w.attr("value",dojo.indexOf(_585,w.value)!=-1);
});
}else{
if(_584[0]._multiValue){
_584[0].attr("value",_585);
}else{
dojo.forEach(_584,function(w,i){
w.attr("value",_585[i]);
});
}
}
}
},getValues:function(){
dojo.deprecated(this.declaredClass+"::getValues() is deprecated. Use attr('value') instead.","","2.0");
return this.attr("value");
},_getValueAttr:function(){
var obj={};
dojo.forEach(this.getDescendants(),function(_58b){
var name=_58b.name;
if(!name||_58b.disabled){
return;
}
var _58d=_58b.attr("value");
if(typeof _58b.checked=="boolean"){
if(/Radio/.test(_58b.declaredClass)){
if(_58d!==false){
dojo.setObject(name,_58d,obj);
}
}else{
var ary=dojo.getObject(name,false,obj);
if(!ary){
ary=[];
dojo.setObject(name,ary,obj);
}
if(_58d!==false){
ary.push(_58d);
}
}
}else{
dojo.setObject(name,_58d,obj);
}
});
return obj;
},isValid:function(){
this._invalidWidgets=[];
return dojo.every(this.getDescendants(),function(_58f){
var _590=_58f.disabled||!_58f.isValid||_58f.isValid();
if(!_590){
this._invalidWidgets.push(_58f);
}
return _590;
},this);
},onValidStateChange:function(_591){
},_widgetChange:function(_592){
var _593=this._lastValidState;
if(!_592||this._lastValidState===undefined){
_593=this.isValid();
if(this._lastValidState===undefined){
this._lastValidState=_593;
}
}else{
if(_592.isValid){
this._invalidWidgets=dojo.filter(this._invalidWidgets||[],function(w){
return (w!=_592);
},this);
if(!_592.isValid()&&!_592.attr("disabled")){
this._invalidWidgets.push(_592);
}
_593=(this._invalidWidgets.length===0);
}
}
if(_593!==this._lastValidState){
this._lastValidState=_593;
this.onValidStateChange(_593);
}
},connectChildren:function(){
dojo.forEach(this._changeConnections,dojo.hitch(this,"disconnect"));
var _595=this;
var _596=this._changeConnections=[];
dojo.forEach(dojo.filter(this.getDescendants(),function(item){
return item.validate;
}),function(_598){
_596.push(_595.connect(_598,"validate",dojo.hitch(_595,"_widgetChange",_598)));
_596.push(_595.connect(_598,"_setDisabledAttr",dojo.hitch(_595,"_widgetChange",_598)));
});
this._widgetChange(null);
},startup:function(){
this.inherited(arguments);
this._changeConnections=[];
this.connectChildren();
}});
dojo.declare("dijit.form.Form",[dijit._Widget,dijit._Templated,dijit.form._FormMixin],{name:"",action:"",method:"",encType:"","accept-charset":"",accept:"",target:"",templateString:"<form dojoAttachPoint='containerNode' dojoAttachEvent='onreset:_onReset,onsubmit:_onSubmit' name='${name}'></form>",attributeMap:dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap),{action:"",method:"",encType:"","accept-charset":"",accept:"",target:""}),execute:function(_599){
},onExecute:function(){
},_setEncTypeAttr:function(_59a){
this.encType=_59a;
dojo.attr(this.domNode,"encType",_59a);
if(dojo.isIE){
this.domNode.encoding=_59a;
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
var _5a2=dijit.getViewport();
var is=this.node.style,os=this.domNode.style;
os.top=_5a2.t+"px";
os.left=_5a2.l+"px";
is.width=_5a2.w+"px";
is.height=_5a2.h+"px";
var _5a5=dijit.getViewport();
if(_5a2.w!=_5a5.w){
is.width=_5a5.w+"px";
}
if(_5a2.h!=_5a5.h){
is.height=_5a5.h+"px";
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
dojo.declare("dijit._DialogMixin",null,{attributeMap:dijit._Widget.prototype.attributeMap,execute:function(_5a6){
},onCancel:function(){
},onExecute:function(){
},_onSubmit:function(){
this.onExecute();
this.execute(this.attr("value"));
},_getFocusItems:function(_5a7){
var _5a8=dijit._getTabNavigable(dojo.byId(_5a7));
this._firstFocusItem=_5a8.lowest||_5a8.first||_5a7;
this._lastFocusItem=_5a8.last||_5a8.highest||this._firstFocusItem;
if(dojo.isMoz&&this._firstFocusItem.tagName.toLowerCase()=="input"&&dojo.attr(this._firstFocusItem,"type").toLowerCase()=="file"){
dojo.attr(_5a7,"tabindex","0");
this._firstFocusItem=_5a7;
}
}});
dojo.declare("dijit.Dialog",[dijit.layout.ContentPane,dijit._Templated,dijit.form._FormMixin,dijit._DialogMixin],{templateString:null,templateString:"<div class=\"dijitDialog\" tabindex=\"-1\" waiRole=\"dialog\" waiState=\"labelledby-${id}_title\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\">\r\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\" id=\"${id}_title\"></span>\r\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\" title=\"${buttonCancel}\">\r\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\" title=\"${buttonCancel}\">x</span>\r\n\t</span>\r\n\t</div>\r\n\t\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"></div>\r\n</div>\r\n",attributeMap:dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap),{title:[{node:"titleNode",type:"innerHTML"},{node:"titleBar",type:"attribute"}]}),open:false,duration:dijit.defaultDuration,refocus:true,autofocus:true,_firstFocusItem:null,_lastFocusItem:null,doLayout:false,draggable:true,postMixInProperties:function(){
var _5a9=dojo.i18n.getLocalization("dijit","common");
dojo.mixin(this,_5a9);
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
var _5b0=this._underlay;
this._fadeIn=dojo.fadeIn({node:node,duration:this.duration,onBegin:dojo.hitch(_5b0,"show")});
this._fadeOut=dojo.fadeOut({node:node,duration:this.duration,onEnd:function(){
node.style.visibility="hidden";
node.style.top="-9999px";
_5b0.hide();
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
var _5b2=dijit.getViewport();
if(mb.w>=_5b2.w||mb.h>=_5b2.h){
dojo.style(this.containerNode,{width:Math.min(mb.w,Math.floor(_5b2.w*0.75))+"px",height:Math.min(mb.h,Math.floor(_5b2.h*0.75))+"px",overflow:"auto",position:"relative"});
}
},_position:function(){
if(!dojo.hasClass(dojo.body(),"dojoMove")){
var node=this.domNode;
var _5b4=dijit.getViewport();
var p=this._relativePosition;
var mb=p?null:dojo.marginBox(node);
dojo.style(node,{left:Math.floor(_5b4.l+(p?p.l:(_5b4.w-mb.w)/2))+"px",top:Math.floor(_5b4.t+(p?p.t:(_5b4.h-mb.h)/2))+"px"});
}
},_onKey:function(evt){
if(evt.charOrCode){
var dk=dojo.keys;
var node=evt.target;
if(evt.charOrCode===dk.TAB){
this._getFocusItems(this.domNode);
}
var _5ba=(this._firstFocusItem==this._lastFocusItem);
if(node==this._firstFocusItem&&evt.shiftKey&&evt.charOrCode===dk.TAB){
if(!_5ba){
dijit.focus(this._lastFocusItem);
}
dojo.stopEvent(evt);
}else{
if(node==this._lastFocusItem&&evt.charOrCode===dk.TAB&&!evt.shiftKey){
if(!_5ba){
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
},orient:function(node,_5bc,_5bd){
this.domNode.className=this["class"]+" dijitTooltipAB"+(_5bd.charAt(1)=="L"?"Left":"Right")+" dijitTooltip"+(_5bd.charAt(0)=="T"?"Below":"Above");
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
var _5c2=(this._firstFocusItem==this._lastFocusItem);
if(evt.charOrCode==dk.ESCAPE){
this.onCancel();
dojo.stopEvent(evt);
}else{
if(node==this._firstFocusItem&&evt.shiftKey&&evt.charOrCode===dk.TAB){
if(!_5c2){
dijit.focus(this._lastFocusItem);
}
dojo.stopEvent(evt);
}else{
if(node==this._lastFocusItem&&evt.charOrCode===dk.TAB&&!evt.shiftKey){
if(!_5c2){
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
dojo.declare("dijit.form._FormWidget",[dijit._Widget,dijit._Templated],{baseClass:"",name:"",alt:"",value:"",type:"text",tabIndex:"0",disabled:false,readOnly:false,intermediateChanges:false,attributeMap:dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap),{value:"focusNode",disabled:"focusNode",readOnly:"focusNode",id:"focusNode",tabIndex:"focusNode",alt:"focusNode"}),_setDisabledAttr:function(_5c3){
this.disabled=_5c3;
dojo.attr(this.focusNode,"disabled",_5c3);
dijit.setWaiState(this.focusNode,"disabled",_5c3);
if(_5c3){
this._hovering=false;
this._active=false;
this.focusNode.removeAttribute("tabIndex");
}else{
this.focusNode.setAttribute("tabIndex",this.tabIndex);
}
this._setStateClass();
},setDisabled:function(_5c4){
dojo.deprecated("setDisabled("+_5c4+") is deprecated. Use attr('disabled',"+_5c4+") instead.","","2.0");
this.attr("disabled",_5c4);
},_scroll:true,_onFocus:function(e){
if(this._scroll){
dijit.scrollIntoView(this.domNode);
}
this.inherited(arguments);
},_onMouse:function(_5c6){
var _5c7=_5c6.currentTarget;
if(_5c7&&_5c7.getAttribute){
this.stateModifier=_5c7.getAttribute("stateModifier")||"";
}
if(!this.disabled){
switch(_5c6.type){
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
var _5c8=this.connect(dojo.body(),"onmouseup",function(){
if(this._mouseDown&&this.isFocusable()){
this.focus();
}
this._active=false;
this._mouseDown=false;
this._setStateClass();
this.disconnect(_5c8);
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
var _5c9=this.baseClass.split(" ");
function multiply(_5ca){
_5c9=_5c9.concat(dojo.map(_5c9,function(c){
return c+_5ca;
}),"dijit"+_5ca);
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
var tn=this.stateNode||this.domNode,_5cd={};
dojo.forEach(tn.className.split(" "),function(c){
_5cd[c]=true;
});
if("_stateClasses" in this){
dojo.forEach(this._stateClasses,function(c){
delete _5cd[c];
});
}
dojo.forEach(_5c9,function(c){
_5cd[c]=true;
});
var _5d1=[];
for(var c in _5cd){
_5d1.push(c);
}
tn.className=_5d1.join(" ");
this._stateClasses=_5c9;
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
},onChange:function(_5d5){
},_onChangeActive:false,_handleOnChange:function(_5d6,_5d7){
this._lastValue=_5d6;
if(this._lastValueReported==undefined&&(_5d7===null||!this._onChangeActive)){
this._resetValue=this._lastValueReported=_5d6;
}
if((this.intermediateChanges||_5d7||_5d7===undefined)&&((typeof _5d6!=typeof this._lastValueReported)||this.compare(_5d6,this._lastValueReported)!=0)){
this._lastValueReported=_5d6;
if(this._onChangeActive){
this.onChange(_5d6);
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
},setValue:function(_5d8){
dojo.deprecated("dijit.form._FormWidget:setValue("+_5d8+") is deprecated.  Use attr('value',"+_5d8+") instead.","","2.0");
this.attr("value",_5d8);
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
},_setValueAttr:function(_5db,_5dc){
this.value=_5db;
this._handleOnChange(_5db,_5dc);
},_getValueAttr:function(_5dd){
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
var _5e3=this;
setTimeout(function(){
_5e3._handleOnChange(_5e3.attr("value"),false);
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
},_setValueAttr:function(_5e4,_5e5,_5e6){
var _5e7;
if(_5e4!==undefined){
_5e7=this.filter(_5e4);
if(_5e7!==null&&((typeof _5e7!="number")||!isNaN(_5e7))){
if(typeof _5e6!="string"){
_5e6=this.format(_5e7,this.constraints);
}
}else{
_5e6="";
}
}
if(_5e6!=null&&_5e6!=undefined){
this.textbox.value=_5e6;
}
dijit.form.TextBox.superclass._setValueAttr.call(this,_5e7,_5e5);
},displayedValue:"",getDisplayedValue:function(){
dojo.deprecated(this.declaredClass+"::getDisplayedValue() is deprecated. Use attr('displayedValue') instead.","","2.0");
return this.attr("displayedValue");
},_getDisplayedValueAttr:function(){
return this.filter(this.textbox.value);
},setDisplayedValue:function(_5e8){
dojo.deprecated(this.declaredClass+"::setDisplayedValue() is deprecated. Use attr('displayedValue', ...) instead.","","2.0");
this.attr("displayedValue",_5e8);
},_setDisplayedValueAttr:function(_5e9){
this.textbox.value=_5e9;
this._setValueAttr(this.attr("value"));
},format:function(_5ea,_5eb){
return ((_5ea==null||_5ea==undefined)?"":(_5ea.toString?_5ea.toString():_5ea));
},parse:function(_5ec,_5ed){
return _5ec;
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
dijit.selectInputText=function(_5f0,_5f1,stop){
var _5f3=dojo.global;
var _5f4=dojo.doc;
_5f0=dojo.byId(_5f0);
if(isNaN(_5f1)){
_5f1=0;
}
if(isNaN(stop)){
stop=_5f0.value?_5f0.value.length:0;
}
_5f0.focus();
if(_5f4["selection"]&&dojo.body()["createTextRange"]){
if(_5f0.createTextRange){
var _5f5=_5f0.createTextRange();
with(_5f5){
collapse(true);
moveStart("character",_5f1);
moveEnd("character",stop);
select();
}
}
}else{
if(_5f3["getSelection"]){
var _5f6=_5f3.getSelection();
if(_5f0.setSelectionRange){
_5f0.setSelectionRange(_5f1,stop);
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
},show:function(_5f7,_5f8,_5f9){
if(this.aroundNode&&this.aroundNode===_5f8){
return;
}
if(this.fadeOut.status()=="playing"){
this._onDeck=arguments;
return;
}
this.containerNode.innerHTML=_5f7;
this.domNode.style.top=(this.domNode.offsetTop+1)+"px";
var _5fa={};
var ltr=this.isLeftToRight();
dojo.forEach((_5f9&&_5f9.length)?_5f9:dijit.Tooltip.defaultPosition,function(pos){
switch(pos){
case "after":
_5fa[ltr?"BR":"BL"]=ltr?"BL":"BR";
break;
case "before":
_5fa[ltr?"BL":"BR"]=ltr?"BR":"BL";
break;
case "below":
_5fa[ltr?"BL":"BR"]=ltr?"TL":"TR";
_5fa[ltr?"BR":"BL"]=ltr?"TR":"TL";
break;
case "above":
default:
_5fa[ltr?"TL":"TR"]=ltr?"BL":"BR";
_5fa[ltr?"TR":"TL"]=ltr?"BR":"BL";
break;
}
});
var pos=dijit.placeOnScreenAroundElement(this.domNode,_5f8,_5fa,dojo.hitch(this,"orient"));
dojo.style(this.domNode,"opacity",0);
this.fadeIn.play();
this.isShowingNow=true;
this.aroundNode=_5f8;
},orient:function(node,_5ff,_600){
node.className="dijitTooltip "+{"BL-TL":"dijitTooltipBelow dijitTooltipABLeft","TL-BL":"dijitTooltipAbove dijitTooltipABLeft","BR-TR":"dijitTooltipBelow dijitTooltipABRight","TR-BR":"dijitTooltipAbove dijitTooltipABRight","BR-BL":"dijitTooltipRight","BL-BR":"dijitTooltipLeft"}[_5ff+"-"+_600];
},_onShow:function(){
if(dojo.isIE){
this.domNode.style.filter="";
}
},hide:function(_601){
if(this._onDeck&&this._onDeck[1]==_601){
this._onDeck=null;
}else{
if(this.aroundNode===_601){
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
dijit.showTooltip=function(_602,_603,_604){
if(!dijit._masterTT){
dijit._masterTT=new dijit._MasterTooltip();
}
return dijit._masterTT.show(_602,_603,_604);
};
dijit.hideTooltip=function(_605){
if(!dijit._masterTT){
dijit._masterTT=new dijit._MasterTooltip();
}
return dijit._masterTT.hide(_605);
};
dojo.declare("dijit.Tooltip",dijit._Widget,{label:"",showDelay:400,connectId:[],position:[],postCreate:function(){
dojo.addClass(this.domNode,"dijitTooltipData");
this._connectNodes=[];
dojo.forEach(this.connectId,function(id){
var node=dojo.byId(id);
if(node){
this._connectNodes.push(node);
dojo.forEach(["onMouseEnter","onMouseLeave","onFocus","onBlur"],function(_608){
this.connect(node,_608.toLowerCase(),"_"+_608);
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
var _60e=e.target;
this._showTimer=setTimeout(dojo.hitch(this,function(){
this.open(_60e);
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
},open:function(_610){
_610=_610||this._connectNodes[0];
if(!_610){
return;
}
if(this._showTimer){
clearTimeout(this._showTimer);
delete this._showTimer;
}
dijit.showTooltip(this.label||this.domNode.innerHTML,_610,this.position);
this._connectNode=_610;
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
dojo.declare("dijit.form.ValidationTextBox",dijit.form.TextBox,{templateString:"<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\r\n\tid=\"widget_${id}\"\r\n\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\" waiRole=\"presentation\"\r\n\t><div style=\"overflow:hidden;\"\r\n\t\t><div class=\"dijitReset dijitValidationIcon\"><br></div\r\n\t\t><div class=\"dijitReset dijitValidationIconText\">&Chi;</div\r\n\t\t><div class=\"dijitReset dijitInputField\"\r\n\t\t\t><input class=\"dijitReset\" dojoAttachPoint='textbox,focusNode' dojoAttachEvent='onfocus:_update,onkeyup:_update,onblur:_onMouse,onkeypress:_onKeyPress' autocomplete=\"off\"\r\n\t\t\ttype='${type}' name='${name}'\r\n\t\t/></div\r\n\t></div\r\n></div>\r\n",baseClass:"dijitTextBox",required:false,promptMessage:"",invalidMessage:"$_unset_$",constraints:{},regExp:".*",regExpGen:function(_611){
return this.regExp;
},state:"",tooltipPosition:[],_setValueAttr:function(){
this.inherited(arguments);
this.validate(this._focused);
},validator:function(_612,_613){
return (new RegExp("^(?:"+this.regExpGen(_613)+")"+(this.required?"":"?")+"$")).test(_612)&&(!this.required||!this._isEmpty(_612))&&(this._isEmpty(_612)||this.parse(_612,_613)!==undefined);
},_isValidSubset:function(){
return this.textbox.value.search(this._partialre)==0;
},isValid:function(_614){
return this.validator(this.textbox.value,this.constraints);
},_isEmpty:function(_615){
return /^\s*$/.test(_615);
},getErrorMessage:function(_616){
return this.invalidMessage;
},getPromptMessage:function(_617){
return this.promptMessage;
},_maskValidSubsetError:true,validate:function(_618){
var _619="";
var _61a=this.disabled||this.isValid(_618);
if(_61a){
this._maskValidSubsetError=true;
}
var _61b=!_61a&&_618&&this._isValidSubset();
var _61c=this._isEmpty(this.textbox.value);
this.state=(_61a||(!this._hasBeenBlurred&&_61c)||_61b)?"":"Error";
if(this.state=="Error"){
this._maskValidSubsetError=false;
}
this._setStateClass();
dijit.setWaiState(this.focusNode,"invalid",_61a?"false":"true");
if(_618){
if(_61c){
_619=this.getPromptMessage(true);
}
if(!_619&&(this.state=="Error"||(_61b&&!this._maskValidSubsetError))){
_619=this.getErrorMessage(true);
}
}
this.displayMessage(_619);
return _61a;
},_message:"",displayMessage:function(_61d){
if(this._message==_61d){
return;
}
this._message=_61d;
dijit.hideTooltip(this.domNode);
if(_61d){
dijit.showTooltip(_61d,this.domNode,this.tooltipPosition);
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
var _620="";
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
_620+=re;
break;
case ")":
_620+="|$)";
break;
default:
_620+="(?:"+re+"|$)";
break;
}
});
}
try{
"".search(_620);
}
catch(e){
_620=this.regExp;
console.debug("RegExp error in "+this.declaredClass+": "+this.regExp);
}
this._partialre="^(?:"+_620+")$";
},_setDisabledAttr:function(_622){
this.inherited(arguments);
if(this.valueNode){
this.valueNode.disabled=_622;
}
this._refreshState();
},_setRequiredAttr:function(_623){
this.required=_623;
dijit.setWaiState(this.focusNode,"required",_623);
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
dojo.declare("dijit.form.MappedTextBox",dijit.form.ValidationTextBox,{serialize:function(val,_627){
return val.toString?val.toString():"";
},toString:function(){
var val=this.filter(this.attr("value"));
return val!=null?(typeof val=="string"?val:this.serialize(val,this.constraints)):"";
},validate:function(){
this.valueNode.value=this.toString();
return this.inherited(arguments);
},buildRendering:function(){
this.inherited(arguments);
var _629=this.textbox;
var _62a=(this.valueNode=dojo.doc.createElement("input"));
_62a.setAttribute("type",_629.type);
dojo.style(_62a,"display","none");
this.valueNode.name=this.textbox.name;
dojo.place(_62a,_629,"after");
this.textbox.name=this.textbox.name+"_displayed_";
this.textbox.removeAttribute("name");
},_setDisabledAttr:function(_62b){
this.inherited(arguments);
dojo.attr(this.valueNode,"disabled",_62b);
}});
dojo.declare("dijit.form.RangeBoundTextBox",dijit.form.MappedTextBox,{rangeMessage:"",rangeCheck:function(_62c,_62d){
var _62e="min" in _62d;
var _62f="max" in _62d;
if(_62e||_62f){
return (!_62e||this.compare(_62c,_62d.min)>=0)&&(!_62f||this.compare(_62c,_62d.max)<=0);
}
return true;
},isInRange:function(_630){
return this.rangeCheck(this.attr("value"),this.constraints);
},_isDefinitelyOutOfRange:function(){
var val=this.attr("value");
var _632=false;
var _633=false;
if("min" in this.constraints){
var min=this.constraints.min;
val=this.compare(val,((typeof min=="number")&&min>=0&&val!=0)?0:min);
_632=(typeof val=="number")&&val<0;
}
if("max" in this.constraints){
var max=this.constraints.max;
val=this.compare(val,((typeof max!="number")||max>0)?max:0);
_633=(typeof val=="number")&&val>0;
}
return _632||_633;
},_isValidSubset:function(){
return this.inherited(arguments)&&!this._isDefinitelyOutOfRange();
},isValid:function(_636){
return this.inherited(arguments)&&((this._isEmpty(this.textbox.value)&&!this.required)||this.isInRange(_636));
},getErrorMessage:function(_637){
if(dijit.form.RangeBoundTextBox.superclass.isValid.call(this,false)&&!this.isInRange(_637)){
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
},_setValueAttr:function(_638,_639){
dijit.setWaiState(this.focusNode,"valuenow",_638);
this.inherited(arguments);
}});
}
if(!dojo._hasResource["dijit.form.ComboBox"]){
dojo._hasResource["dijit.form.ComboBox"]=true;
dojo.provide("dijit.form.ComboBox");
dojo.declare("dijit.form.ComboBoxMixin",null,{item:null,pageSize:Infinity,store:null,fetchProperties:{},query:{},autoComplete:true,highlightMatch:"first",searchDelay:100,searchAttr:"name",labelAttr:"",labelType:"text",queryExpr:"${0}*",ignoreCase:true,hasDownArrow:true,templateString:"<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\r\n\tid=\"widget_${id}\"\r\n\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\" dojoAttachPoint=\"comboNode\" waiRole=\"combobox\" tabIndex=\"-1\"\r\n\t><div style=\"overflow:hidden;\"\r\n\t\t><div class='dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton'\r\n\t\t\tdojoAttachPoint=\"downArrowNode\" waiRole=\"presentation\"\r\n\t\t\tdojoAttachEvent=\"onmousedown:_onArrowMouseDown,onmouseup:_onMouse,onmouseenter:_onMouse,onmouseleave:_onMouse\"\r\n\t\t\t><div class=\"dijitArrowButtonInner\">&thinsp;</div\r\n\t\t\t><div class=\"dijitArrowButtonChar\">&#9660;</div\r\n\t\t></div\r\n\t\t><div class=\"dijitReset dijitValidationIcon\"><br></div\r\n\t\t><div class=\"dijitReset dijitValidationIconText\">&Chi;</div\r\n\t\t><div class=\"dijitReset dijitInputField\"\r\n\t\t\t><input type=\"text\" autocomplete=\"off\" name=\"${name}\" class='dijitReset'\r\n\t\t\tdojoAttachEvent=\"onkeypress:_onKeyPress, onfocus:_update, compositionend\"\r\n\t\t\tdojoAttachPoint=\"textbox,focusNode\" waiRole=\"textbox\" waiState=\"haspopup-true,autocomplete-list\"\r\n\t\t/></div\r\n\t></div\r\n></div>\r\n",baseClass:"dijitComboBox",_getCaretPos:function(_63a){
var pos=0;
if(typeof (_63a.selectionStart)=="number"){
pos=_63a.selectionStart;
}else{
if(dojo.isIE){
var tr=dojo.doc.selection.createRange().duplicate();
var ntr=_63a.createTextRange();
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
},_setCaretPos:function(_63e,_63f){
_63f=parseInt(_63f);
dijit.selectInputText(_63e,_63f,_63f);
},_setDisabledAttr:function(_640){
dijit.setWaiState(this.comboNode,"disabled",_640);
},_onKeyPress:function(evt){
var key=evt.charOrCode;
if(evt.altKey||(evt.ctrlKey&&(key!="x"&&key!="v"))||evt.key==dojo.keys.SHIFT){
return;
}
var _643=false;
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
_643=true;
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
var _646;
if(this._isShowingNow&&(_646=pw.getHighlightedOption())){
if(_646==pw.nextButton){
this._nextSearch(1);
dojo.stopEvent(evt);
break;
}else{
if(_646==pw.previousButton){
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
var _647=this.attr("displayedValue");
if(pw&&(_647==pw._messages["previousMessage"]||_647==pw._messages["nextMessage"])){
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
_643=true;
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
_643=true;
break;
case dk.RIGHT_ARROW:
case dk.LEFT_ARROW:
this._prev_key_backspace=false;
this._prev_key_esc=false;
break;
default:
this._prev_key_backspace=false;
this._prev_key_esc=false;
_643=typeof key=="string";
}
if(this.searchTimer){
clearTimeout(this.searchTimer);
}
if(_643){
setTimeout(dojo.hitch(this,"_startSearchFromInput"),1);
}
},_autoCompleteText:function(text){
var fn=this.focusNode;
dijit.selectInputText(fn,fn.value.length);
var _64a=this.ignoreCase?"toLowerCase":"substr";
if(text[_64a](0).indexOf(this.focusNode.value[_64a](0))==0){
var cpos=this._getCaretPos(fn);
if((cpos+1)>fn.value.length){
fn.value=text;
dijit.selectInputText(fn,cpos);
}
}else{
fn.value=text;
dijit.selectInputText(fn);
}
},_openResultList:function(_64c,_64d){
if(this.disabled||this.readOnly||(_64d.query[this.searchAttr]!=this._lastQuery)){
return;
}
this._popupWidget.clearResultList();
if(!_64c.length){
this._hideResultList();
return;
}
var _64e=new String(this.store.getValue(_64c[0],this.searchAttr));
if(_64e&&this.autoComplete&&!this._prev_key_backspace&&(_64d.query[this.searchAttr]!="*")){
this._autoCompleteText(_64e);
}
_64d._maxOptions=this._maxOptions;
this._popupWidget.createOptions(_64c,_64d,dojo.hitch(this,"_getMenuLabelFromItem"));
this._showResultList();
if(_64d.direction){
if(1==_64d.direction){
this._popupWidget.highlightFirstOption();
}else{
if(-1==_64d.direction){
this._popupWidget.highlightLastOption();
}
}
this._announceOption(this._popupWidget.getHighlightedOption());
}
},_showResultList:function(){
this._hideResultList();
var _64f=this._popupWidget.getItems(),_650=Math.min(_64f.length,this.maxListLength);
this._arrowPressed();
this.displayMessage("");
dojo.style(this._popupWidget.domNode,{width:"",height:""});
var best=this.open();
var _652=dojo.marginBox(this._popupWidget.domNode);
this._popupWidget.domNode.style.overflow=((best.h==_652.h)&&(best.w==_652.w))?"hidden":"auto";
var _653=best.w;
if(best.h<this._popupWidget.domNode.scrollHeight){
_653+=16;
}
dojo.marginBox(this._popupWidget.domNode,{h:best.h,w:Math.max(_653,this.domNode.offsetWidth)});
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
var _654=this.attr("displayedValue");
var pw=this._popupWidget;
if(pw&&(_654==pw._messages["previousMessage"]||_654==pw._messages["nextMessage"])){
this._setValueAttr(this._lastValueReported,true);
}else{
this.attr("displayedValue",_654);
}
},_onBlur:function(){
this._hideResultList();
this._arrowIdle();
this.inherited(arguments);
},_announceOption:function(node){
if(node==null){
return;
}
var _657;
if(node==this._popupWidget.nextButton||node==this._popupWidget.previousButton){
_657=node.innerHTML;
}else{
_657=this.store.getValue(node.item,this.searchAttr);
}
this.focusNode.value=this.focusNode.value.substring(0,this._getCaretPos(this.focusNode));
dijit.setWaiState(this.focusNode,"activedescendant",dojo.attr(node,"id"));
this._autoCompleteText(_657);
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
var _65e=this.id+"_popup";
this._popupWidget=new dijit.form._ComboBoxMenu({onChange:dojo.hitch(this,this._selectOption),id:_65e});
dijit.removeWaiState(this.focusNode,"activedescendant");
dijit.setWaiState(this.textbox,"owns",_65e);
}
this.item=null;
var _65f=dojo.clone(this.query);
this._lastInput=key;
this._lastQuery=_65f[this.searchAttr]=this._getQueryString(key);
this.searchTimer=setTimeout(dojo.hitch(this,function(_660,_661){
var _662={queryOptions:{ignoreCase:this.ignoreCase,deep:true},query:_660,onBegin:dojo.hitch(this,"_setMaxOptions"),onComplete:dojo.hitch(this,"_openResultList"),onError:function(_663){
console.error("dijit.form.ComboBox: "+_663);
dojo.hitch(_661,"_hideResultList")();
},start:0,count:this.pageSize};
dojo.mixin(_662,_661.fetchProperties);
var _664=_661.store.fetch(_662);
var _665=function(_666,_667){
_666.start+=_666.count*_667;
_666.direction=_667;
this.store.fetch(_666);
};
this._nextSearch=this._popupWidget.onPage=dojo.hitch(this,_665,_664);
},_65f,this),this.searchDelay);
},_setMaxOptions:function(size,_669){
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
var _66b=this.srcNodeRef;
this.store=new dijit.form._ComboBoxDataStore(_66b);
if(!this.value||((typeof _66b.selectedIndex=="number")&&_66b.selectedIndex.toString()===this.value)){
var item=this.store.fetchSelectedItem();
if(item){
this.value=this.store.getValue(item,this._getValueField());
}
}
}
},_postCreate:function(){
var _66d=dojo.query("label[for=\""+this.id+"\"]");
if(_66d.length){
_66d[0].id=(this.id+"_label");
var cn=this.comboNode;
dijit.setWaiState(cn,"labelledby",_66d[0].id);
}
},uninitialize:function(){
if(this._popupWidget){
this._hideResultList();
this._popupWidget.destroy();
}
},_getMenuLabelFromItem:function(item){
var _670=this.store.getValue(item,this.labelAttr||this.searchAttr);
var _671=this.labelType;
if(this.highlightMatch!="none"&&this.labelType=="text"&&this._lastInput){
_670=this.doHighlight(_670,this._escapeHtml(this._lastInput));
_671="html";
}
return {html:_671=="html",label:_670};
},doHighlight:function(_672,find){
var _674="i"+(this.highlightMatch=="all"?"g":"");
var _675=this._escapeHtml(_672);
var ret=_675.replace(new RegExp("^("+find+")",_674),"<span class=\"dijitComboBoxHighlightMatch\">$1</span>");
if(_675==ret){
ret=_675.replace(new RegExp(" ("+find+")",_674)," <span class=\"dijitComboBoxHighlightMatch\">$1</span>");
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
},_setValueAttr:function(_678){
this.value=_678;
this.onChange(_678);
},onChange:function(_679){
},onPage:function(_67a){
},postCreate:function(){
this.previousButton.innerHTML=this._messages["previousMessage"];
this.nextButton.innerHTML=this._messages["nextMessage"];
this.inherited(arguments);
},onClose:function(){
this._blurOptionNode();
},_createOption:function(item,_67c){
var _67d=_67c(item);
var _67e=dojo.doc.createElement("li");
dijit.setWaiRole(_67e,"option");
if(_67d.html){
_67e.innerHTML=_67d.label;
}else{
_67e.appendChild(dojo.doc.createTextNode(_67d.label));
}
if(_67e.innerHTML==""){
_67e.innerHTML="&nbsp;";
}
_67e.item=item;
return _67e;
},createOptions:function(_67f,_680,_681){
this.previousButton.style.display=(_680.start==0)?"none":"";
dojo.attr(this.previousButton,"id",this.id+"_prev");
dojo.forEach(_67f,function(item,i){
var _684=this._createOption(item,_681);
_684.className="dijitReset dijitMenuItem";
dojo.attr(_684,"id",this.id+i);
this.domNode.insertBefore(_684,this.nextButton);
},this);
var _685=false;
if(_680._maxOptions&&_680._maxOptions!=-1){
if((_680.start+_680.count)<_680._maxOptions){
_685=true;
}else{
if((_680.start+_680.count)>(_680._maxOptions-1)){
if(_680.count==_67f.length){
_685=true;
}
}
}
}else{
if(_680.count==_67f.length){
_685=true;
}
}
this.nextButton.style.display=_685?"":"none";
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
var _692=0;
var _693=this.domNode.scrollTop;
var _694=dojo.style(this.domNode,"height");
if(!this.getHighlightedOption()){
this._highlightNextOption();
}
while(_692<_694){
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
var _695=this.domNode.scrollTop;
_692+=(_695-_693)*(up?-1:1);
_693=_695;
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
},_setDisabledAttr:function(_698){
dijit.form.ValidationTextBox.prototype._setDisabledAttr.apply(this,arguments);
dijit.form.ComboBoxMixin.prototype._setDisabledAttr.apply(this,arguments);
},_setValueAttr:function(_699,_69a){
if(!_699){
_699="";
}
dijit.form.ValidationTextBox.prototype._setValueAttr.call(this,_699,_69a);
}});
dojo.declare("dijit.form._ComboBoxDataStore",null,{constructor:function(root){
this.root=root;
dojo.query("> option",root).forEach(function(node){
node.innerHTML=dojo.trim(node.innerHTML);
});
},getValue:function(item,_69e,_69f){
return (_69e=="value")?item.value:(item.innerText||item.textContent||"");
},isItemLoaded:function(_6a0){
return true;
},getFeatures:function(){
return {"dojo.data.api.Read":true,"dojo.data.api.Identity":true};
},_fetchItems:function(args,_6a2,_6a3){
if(!args.query){
args.query={};
}
if(!args.query.name){
args.query.name="";
}
if(!args.queryOptions){
args.queryOptions={};
}
var _6a4=dojo.data.util.filter.patternToRegExp(args.query.name,args.queryOptions.ignoreCase),_6a5=dojo.query("> option",this.root).filter(function(_6a6){
return (_6a6.innerText||_6a6.textContent||"").match(_6a4);
});
if(args.sort){
_6a5.sort(dojo.data.util.sorter.createSortFunction(args.sort,this));
}
_6a2(_6a5,args);
},close:function(_6a7){
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
},_callbackSetLabel:function(_6ae,_6af,_6b0){
if((_6af&&_6af.query[this.searchAttr]!=this._lastQuery)||(!_6af&&_6ae.length&&this.store.getIdentity(_6ae[0])!=this._lastQuery)){
return;
}
if(!_6ae.length){
if(_6b0||!this._focused){
this.valueNode.value="";
}
dijit.form.TextBox.superclass._setValueAttr.call(this,"",_6b0||!this._focused);
this._isvalid=false;
this.validate(this._focused);
this.item=null;
}else{
this._setValueFromItem(_6ae[0],_6b0);
}
},_openResultList:function(_6b1,_6b2){
if(_6b2.query[this.searchAttr]!=this._lastQuery){
return;
}
this._isvalid=_6b1.length!=0;
this.validate(true);
dijit.form.ComboBoxMixin.prototype._openResultList.apply(this,arguments);
},_getValueAttr:function(){
return this.valueNode.value;
},_getValueField:function(){
return "value";
},_setValue:function(_6b3,_6b4,_6b5){
this.valueNode.value=_6b3;
dijit.form.FilteringSelect.superclass._setValueAttr.call(this,_6b3,_6b5,_6b4);
this._lastDisplayedValue=_6b4;
},_setValueAttr:function(_6b6,_6b7){
if(!this._onChangeActive){
_6b7=null;
}
this._lastQuery=_6b6;
if(_6b6===null){
this._setDisplayedValueAttr("",_6b7);
return;
}
var self=this;
var _6b9=function(item,_6bb){
if(item){
if(self.store.isItemLoaded(item)){
self._callbackSetLabel([item],undefined,_6bb);
}else{
self.store.loadItem({item:item,onItem:function(_6bc,_6bd){
self._callbackSetLabel(_6bc,_6bd,_6bb);
}});
}
}else{
self._isvalid=false;
self.validate(false);
}
};
this.store.fetchItemByIdentity({identity:_6b6,onItem:function(item){
_6b9(item,_6b7);
}});
},_setValueFromItem:function(item,_6c0){
this._isvalid=true;
this.item=item;
this._setValue(this.store.getIdentity(item),this.labelFunc(item,this.store),_6c0);
},labelFunc:function(item,_6c2){
return _6c2.getValue(item,this.searchAttr);
},_doSelect:function(tgt){
this._setValueFromItem(tgt.item,true);
},_setDisplayedValueAttr:function(_6c4,_6c5){
if(!this._created){
_6c5=false;
}
if(this.store){
var _6c6=dojo.clone(this.query);
this._lastQuery=_6c6[this.searchAttr]=_6c4.replace(/([\\\*\?])/g,"\\$1");
this.textbox.value=_6c4;
this._lastDisplayedValue=_6c4;
var _6c7=this;
var _6c8={query:_6c6,queryOptions:{ignoreCase:this.ignoreCase,deep:true},onComplete:function(_6c9,_6ca){
dojo.hitch(_6c7,"_callbackSetLabel")(_6c9,_6ca,_6c5);
},onError:function(_6cb){
console.error("dijit.form.FilteringSelect: "+_6cb);
dojo.hitch(_6c7,"_setValue")("",_6c4,false);
}};
dojo.mixin(_6c8,this.fetchProperties);
this.store.fetch(_6c8);
}
},postMixInProperties:function(){
dijit.form.ComboBoxMixin.prototype.postMixInProperties.apply(this,arguments);
dijit.form.MappedTextBox.prototype.postMixInProperties.apply(this,arguments);
},postCreate:function(){
dijit.form.ComboBoxMixin.prototype._postCreate.apply(this,arguments);
dijit.form.MappedTextBox.prototype.postCreate.apply(this,arguments);
},_setDisabledAttr:function(attr,_6cd){
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
dojo.declare("dijit.form.Textarea",dijit.form._FormValueWidget,{attributeMap:dojo.mixin(dojo.clone(dijit.form._FormValueWidget.prototype.attributeMap),{style:"styleNode","class":"styleNode"}),templateString:(dojo.isIE||dojo.isSafari||dojo.isFF)?((dojo.isIE||dojo.isSafari||dojo.isFF>=3)?"<fieldset id=\"${id}\" class=\"dijitInline\" dojoAttachPoint=\"styleNode\" waiRole=\"presentation\"><div dojoAttachPoint=\"editNode,focusNode,eventNode\" dojoAttachEvent=\"onpaste:_changing,oncut:_changing\" waiRole=\"textbox\" waiState=\"multiline-true\" contentEditable=\"true\"></div>":"<span id=\"${id}\" class=\"dijitReset\">"+"<iframe src=\"javascript:<html><head><title>${_iframeEditTitle}</title></head><body><script>var _postCreate=window.frameElement?window.frameElement.postCreate:null;if(_postCreate)_postCreate();</script></body></html>\""+" dojoAttachPoint=\"iframe,styleNode,stateNode\" dojoAttachEvent=\"onblur:_onIframeBlur\" class=\"dijitInline dijitInputField\"></iframe>")+"<textarea name=\"${name}\" value=\"${value}\" dojoAttachPoint=\"formValueNode\" style=\"display:none;\" autocomplete=\"off\"></textarea>"+((dojo.isIE||dojo.isSafari||dojo.isFF>=3)?"</fieldset>":"</span>"):"<textarea id=\"${id}\" name=\"${name}\" value=\"${value}\" dojoAttachPoint=\"formValueNode,editNode,focusNode,styleNode\">"+dojo.isFF+"</textarea>",baseClass:"dijitTextArea",_setDisabledAttr:function(_6ce){
this.inherited(arguments);
this.formValueNode.disabled=this.disabled;
this._adjustWritable();
},_setReadOnlyAttr:function(_6cf){
this.readOnly=_6cf;
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
},_setValueAttr:function(_6d0,_6d1){
var _6d2=this.editNode;
if(typeof _6d0=="string"){
_6d2.innerHTML="";
if(_6d0.split){
var _6d3=this;
var _6d4=true;
dojo.forEach(_6d0.split("\n"),function(line){
if(_6d4){
_6d4=false;
}else{
_6d2.appendChild(dojo.doc.createElement("BR"));
}
if(line){
_6d2.appendChild(dojo.doc.createTextNode(line));
}
});
}else{
if(_6d0){
_6d2.appendChild(dojo.doc.createTextNode(_6d0));
}
}
if(!dojo.isIE){
_6d2.appendChild(dojo.doc.createElement("BR"));
}
}else{
_6d0=_6d2.innerHTML;
if(this.iframe){
_6d0=_6d0.replace(/<div><\/div>\r?\n?$/i,"");
}
_6d0=_6d0.replace(/\s*\r?\n|^\s+|\s+$|&nbsp;/g,"").replace(/>\s+</g,"><").replace(/<\/(p|div)>$|^<(p|div)[^>]*>/gi,"").replace(/([^>])<div>/g,"$1\n").replace(/<\/p>\s*<p[^>]*>|<br[^>]*>|<\/div>\s*<div[^>]*>/gi,"\n").replace(/<[^>]*>/g,"").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">");
if(!dojo.isIE){
_6d0=_6d0.replace(/\n$/,"");
}
}
this.value=this.formValueNode.value=_6d0;
if(this.iframe){
var _6d6=dojo.doc.createElement("div");
_6d2.appendChild(_6d6);
var _6d7=_6d6.offsetTop;
if(_6d2.scrollWidth>_6d2.clientWidth){
_6d7+=16;
}
if(this.lastHeight!=_6d7){
if(_6d7==0){
_6d7=16;
}
dojo.contentBox(this.iframe,{h:_6d7});
this.lastHeight=_6d7;
}
_6d2.removeChild(_6d6);
}
dijit.form.Textarea.superclass._setValueAttr.call(this,this.attr("value"),_6d1);
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
var _6d8=dojo.i18n.getLocalization("dijit.form","Textarea");
this._iframeEditTitle=_6d8.iframeEditTitle;
this._iframeFocusTitle=_6d8.iframeFocusTitle;
var _6d9=dojo.query("label[for=\""+this.id+"\"]");
if(_6d9.length){
this._iframeEditTitle=_6d9[0].innerHTML+" "+this._iframeEditTitle;
}
this.focusNode=this.editNode=dojo.doc.createElement("BODY");
}
},postCreate:function(){
var _6da="";
if(dojo.isIE||dojo.isSafari||dojo.isFF>=3){
this.domNode.style.overflowY="hidden";
}else{
if(dojo.isFF){
var w=this.iframe.contentWindow;
var _6dc="";
try{
_6dc=this.iframe.contentDocument.title;
}
catch(e){
}
if(!w||!_6dc){
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
_6da="margin:0px;padding:0px;border:0px;";
}else{
this.focusNode=this.domNode;
}
}
this.style.replace(/(^|;)(line-|font-?)[^;]+/g,function(_6de){
_6da+=_6de.replace(/^;/g,"")+";";
});
dojo.attr(this.focusNode,"style",_6da);
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
},_changed:function(e,_6e5){
if(this.iframe&&this.iframe.contentDocument.designMode!="on"&&!this.disabled&&!this.readOnly){
this.iframe.contentDocument.designMode="on";
}
this._setValueAttr(null,_6e5||false);
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
var _6e9=dijit.byNode(node);
if(_6e9&&typeof _6e9._onSubmit=="function"){
_6e9._onSubmit(e);
break;
}
}
}
}
},_fillContent:function(_6ea){
if(_6ea&&!("label" in this.params)){
this.attr("label",_6ea.innerHTML);
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
},setLabel:function(_6ed){
dojo.deprecated("dijit.form.Button.setLabel() is deprecated.  Use attr('label', ...) instead.","","2.0");
this.attr("label",_6ed);
},_setLabelAttr:function(_6ee){
this.containerNode.innerHTML=this.label=_6ee;
this._layoutHack();
if(this.showLabel==false&&!this.params.title){
this.titleNode.title=dojo.trim(this.containerNode.innerText||this.containerNode.textContent||"");
}
}});
dojo.declare("dijit.form.DropDownButton",[dijit.form.Button,dijit._Container],{baseClass:"dijitDropDownButton",templateString:"<span class=\"dijit dijitReset dijitLeft dijitInline\"\r\n\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse,onclick:_onDropDownClick,onkeydown:_onDropDownKeydown,onblur:_onDropDownBlur,onkeypress:_onKey\"\r\n\t><span class='dijitReset dijitRight dijitInline'\r\n\t\t><span class='dijitReset dijitInline dijitButtonNode'\r\n\t\t\t><button class=\"dijitReset dijitStretch dijitButtonContents\" \r\n\t\t\t\ttype=\"${type}\" name=\"${name}\"\r\n\t\t\t\tdojoAttachPoint=\"focusNode,titleNode\" \r\n\t\t\t\twaiRole=\"button\" waiState=\"haspopup-true,labelledby-${id}_label\"\r\n\t\t\t\t><span class=\"dijitReset dijitInline\" \r\n\t\t\t\t\tdojoAttachPoint=\"iconNode\"\r\n\t\t\t\t></span\r\n\t\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\"  \r\n\t\t\t\t\tdojoAttachPoint=\"containerNode,popupStateNode\" \r\n\t\t\t\t\tid=\"${id}_label\"\r\n\t\t\t\t></span\r\n\t\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonInner\">&thinsp;</span\r\n\t\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonChar\">&#9660;</span\r\n\t\t\t></button\r\n\t\t></span\r\n\t></span\r\n></span>\r\n",_fillContent:function(){
if(this.srcNodeRef){
var _6ef=dojo.query("*",this.srcNodeRef);
dijit.form.DropDownButton.superclass._fillContent.call(this,_6ef[0]);
this.dropDownContainer=this.srcNodeRef;
}
},startup:function(){
if(this._started){
return;
}
if(!this.dropDown){
var _6f0=dojo.query("[widgetId]",this.dropDownContainer)[0];
this.dropDown=dijit.byNode(_6f0);
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
var _6f3=dojo.isFF&&dojo.isFF<3&&navigator.appVersion.indexOf("Macintosh")!=-1;
if(!_6f3||e.detail!=0||this._seenKeydown){
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
var _6f7=this.dropDown;
if(!_6f7){
return;
}
if(!this._opened){
if(_6f7.href&&!_6f7.isLoaded){
var self=this;
var _6f9=dojo.connect(_6f7,"onLoad",function(){
dojo.disconnect(_6f9);
self._openDropDown();
});
_6f7._loadCheck(true);
return;
}else{
this._openDropDown();
}
}else{
this._closeDropDown();
}
},_openDropDown:function(){
var _6fa=this.dropDown;
var _6fb=_6fa.domNode.style.width;
var self=this;
dijit.popup.open({parent:this,popup:_6fa,around:this.domNode,orient:this.isLeftToRight()?{"BL":"TL","BR":"TR","TL":"BL","TR":"BR"}:{"BR":"TR","BL":"TL","TR":"BR","TL":"BL"},onExecute:function(){
self._closeDropDown(true);
},onCancel:function(){
self._closeDropDown(true);
},onClose:function(){
_6fa.domNode.style.width=_6fb;
self.popupStateNode.removeAttribute("popupActive");
self._opened=false;
}});
if(this.domNode.offsetWidth>_6fa.domNode.offsetWidth){
var _6fd=null;
if(!this.isLeftToRight()){
_6fd=_6fa.domNode.parentNode;
var _6fe=_6fd.offsetLeft+_6fd.offsetWidth;
}
dojo.marginBox(_6fa.domNode,{w:this.domNode.offsetWidth});
if(_6fd){
_6fd.style.left=_6fe-this.domNode.offsetWidth+"px";
}
}
this.popupStateNode.setAttribute("popupActive","true");
this._opened=true;
if(_6fa.focus){
_6fa.focus();
}
},_closeDropDown:function(_6ff){
if(this._opened){
dijit.popup.close(this.dropDown);
if(_6ff){
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
},_setCheckedAttr:function(_707){
this.checked=_707;
dojo.attr(this.focusNode||this.domNode,"checked",_707);
dijit.setWaiState(this.focusNode||this.domNode,"pressed",_707);
this._setStateClass();
this._handleOnChange(_707,true);
},setChecked:function(_708){
dojo.deprecated("setChecked("+_708+") is deprecated. Use attr('checked',"+_708+") instead.","","2.0");
this.attr("checked",_708);
},reset:function(){
this._hasBeenBlurred=false;
this.attr("checked",this.params.checked||false);
}});
}
if(!dojo._hasResource["dijit.form.CheckBox"]){
dojo._hasResource["dijit.form.CheckBox"]=true;
dojo.provide("dijit.form.CheckBox");
dojo.declare("dijit.form.CheckBox",dijit.form.ToggleButton,{templateString:"<div class=\"dijitReset dijitInline\" waiRole=\"presentation\"\r\n\t><input\r\n\t \ttype=\"${type}\" name=\"${name}\"\r\n\t\tclass=\"dijitReset dijitCheckBoxInput\"\r\n\t\tdojoAttachPoint=\"focusNode\"\r\n\t \tdojoAttachEvent=\"onmouseover:_onMouse,onmouseout:_onMouse,onclick:_onClick\"\r\n/></div>\r\n",baseClass:"dijitCheckBox",type:"checkbox",value:"on",_setValueAttr:function(_709){
if(typeof _709=="string"){
this.value=_709;
dojo.attr(this.focusNode,"value",_709);
_709=true;
}
if(this._created){
this.attr("checked",_709);
}
},_getValueAttr:function(){
return (this.checked?this.value:false);
},postMixInProperties:function(){
if(this.value==""){
this.value="on";
}
this.inherited(arguments);
},_fillContent:function(_70a){
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
dojo.declare("dijit.form.RadioButton",dijit.form.CheckBox,{type:"radio",baseClass:"dijitRadio",_setCheckedAttr:function(_70b){
this.inherited(arguments);
if(!this._created){
return;
}
if(_70b){
var _70c=this;
dojo.query("INPUT[type=radio][name="+this.name+"]",this.focusNode.form||dojo.doc).forEach(function(_70d){
if(_70d!=_70c.focusNode&&_70d.form==_70c.focusNode.form){
var _70e=dijit.getEnclosingWidget(_70d);
if(_70e&&_70e.checked){
_70e.attr("checked",false);
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
dojo.regexp.escapeString=function(str,_711){
return str.replace(/([\.$?*!=:|{}\(\)\[\]\\\/^])/g,function(ch){
if(_711&&_711.indexOf(ch)!=-1){
return ch;
}
return "\\"+ch;
});
};
dojo.regexp.buildGroupRE=function(arr,re,_715){
if(!(arr instanceof Array)){
return re(arr);
}
var b=[];
for(var i=0;i<arr.length;i++){
b.push(re(arr[i]));
}
return dojo.regexp.group(b.join("|"),_715);
};
dojo.regexp.group=function(_718,_719){
return "("+(_719?"?:":"")+_718+")";
};
}
if(!dojo._hasResource["dojo.cookie"]){
dojo._hasResource["dojo.cookie"]=true;
dojo.provide("dojo.cookie");
dojo.cookie=function(name,_71b,_71c){
var c=document.cookie;
if(arguments.length==1){
var _71e=c.match(new RegExp("(?:^|; )"+dojo.regexp.escapeString(name)+"=([^;]*)"));
return _71e?decodeURIComponent(_71e[1]):undefined;
}else{
_71c=_71c||{};
var exp=_71c.expires;
if(typeof exp=="number"){
var d=new Date();
d.setTime(d.getTime()+exp*24*60*60*1000);
exp=_71c.expires=d;
}
if(exp&&exp.toUTCString){
_71c.expires=exp.toUTCString();
}
_71b=encodeURIComponent(_71b);
var _721=name+"="+_71b,_722;
for(_722 in _71c){
_721+="; "+_722;
var _723=_71c[_722];
if(_723!==true){
_721+="="+_723;
}
}
document.cookie=_721;
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
},_setupChild:function(_724){
var _725=_724.region;
if(_725){
this.inherited(arguments);
dojo.addClass(_724.domNode,this.baseClass+"Pane");
var ltr=this.isLeftToRight();
if(_725=="leading"){
_725=ltr?"left":"right";
}
if(_725=="trailing"){
_725=ltr?"right":"left";
}
this["_"+_725]=_724.domNode;
this["_"+_725+"Widget"]=_724;
if((_724.splitter||this.gutters)&&!this._splitters[_725]){
var _727=dojo.getObject(_724.splitter?this._splitterClass:"dijit.layout._Gutter");
var flip={left:"right",right:"left",top:"bottom",bottom:"top",leading:"trailing",trailing:"leading"};
var _729=new _727({container:this,child:_724,region:_725,oppNode:dojo.query("[region="+flip[_724.region]+"]",this.domNode)[0],live:this.liveSplitters});
_729.isSplitter=true;
this._splitters[_725]=_729.domNode;
dojo.place(this._splitters[_725],_724.domNode,"after");
_729.startup();
}
_724.region=_725;
}
},_computeSplitterThickness:function(_72a){
this._splitterThickness[_72a]=this._splitterThickness[_72a]||dojo.marginBox(this._splitters[_72a])[(/top|bottom/.test(_72a)?"h":"w")];
},layout:function(){
for(var _72b in this._splitters){
this._computeSplitterThickness(_72b);
}
this._layoutChildren();
},addChild:function(_72c,_72d){
this.inherited(arguments);
if(this._started){
this._layoutChildren();
}
},removeChild:function(_72e){
var _72f=_72e.region;
var _730=this._splitters[_72f];
if(_730){
dijit.byNode(_730).destroy();
delete this._splitters[_72f];
delete this._splitterThickness[_72f];
}
this.inherited(arguments);
delete this["_"+_72f];
delete this["_"+_72f+"Widget"];
if(this._started){
this._layoutChildren(_72e.region);
}
dojo.removeClass(_72e.domNode,this.baseClass+"Pane");
},getChildren:function(){
return dojo.filter(this.inherited(arguments),function(_731){
return !_731.isSplitter;
});
},getSplitter:function(_732){
var _733=this._splitters[_732];
return _733?dijit.byNode(_733):null;
},resize:function(_734,_735){
if(!this.cs||!this.pe){
var node=this.domNode;
this.cs=dojo.getComputedStyle(node);
this.pe=dojo._getPadExtents(node,this.cs);
this.pe.r=dojo._toPixelValue(node,this.cs.paddingRight);
this.pe.b=dojo._toPixelValue(node,this.cs.paddingBottom);
dojo.style(node,"padding","0px");
}
this.inherited(arguments);
},_layoutChildren:function(_737){
var _738=(this.design=="sidebar");
var _739=0,_73a=0,_73b=0,_73c=0;
var _73d={},_73e={},_73f={},_740={},_741=(this._center&&this._center.style)||{};
var _742=/left|right/.test(_737);
var _743=!_737||(!_742&&!_738);
var _744=!_737||(_742&&_738);
if(this._top){
_73d=_744&&this._top.style;
_739=dojo.marginBox(this._top).h;
}
if(this._left){
_73e=_743&&this._left.style;
_73b=dojo.marginBox(this._left).w;
}
if(this._right){
_73f=_743&&this._right.style;
_73c=dojo.marginBox(this._right).w;
}
if(this._bottom){
_740=_744&&this._bottom.style;
_73a=dojo.marginBox(this._bottom).h;
}
var _745=this._splitters;
var _746=_745.top,_747=_745.bottom,_748=_745.left,_749=_745.right;
var _74a=this._splitterThickness;
var _74b=_74a.top||0,_74c=_74a.left||0,_74d=_74a.right||0,_74e=_74a.bottom||0;
if(_74c>50||_74d>50){
setTimeout(dojo.hitch(this,function(){
this._splitterThickness={};
for(var _74f in this._splitters){
this._computeSplitterThickness(_74f);
}
this._layoutChildren();
}),50);
return false;
}
var pe=this.pe;
var _751={left:(_738?_73b+_74c:0)+pe.l+"px",right:(_738?_73c+_74d:0)+pe.r+"px"};
if(_746){
dojo.mixin(_746.style,_751);
_746.style.top=_739+pe.t+"px";
}
if(_747){
dojo.mixin(_747.style,_751);
_747.style.bottom=_73a+pe.b+"px";
}
_751={top:(_738?0:_739+_74b)+pe.t+"px",bottom:(_738?0:_73a+_74e)+pe.b+"px"};
if(_748){
dojo.mixin(_748.style,_751);
_748.style.left=_73b+pe.l+"px";
}
if(_749){
dojo.mixin(_749.style,_751);
_749.style.right=_73c+pe.r+"px";
}
dojo.mixin(_741,{top:pe.t+_739+_74b+"px",left:pe.l+_73b+_74c+"px",right:pe.r+_73c+_74d+"px",bottom:pe.b+_73a+_74e+"px"});
var _752={top:_738?pe.t+"px":_741.top,bottom:_738?pe.b+"px":_741.bottom};
dojo.mixin(_73e,_752);
dojo.mixin(_73f,_752);
_73e.left=pe.l+"px";
_73f.right=pe.r+"px";
_73d.top=pe.t+"px";
_740.bottom=pe.b+"px";
if(_738){
_73d.left=_740.left=_73b+_74c+pe.l+"px";
_73d.right=_740.right=_73c+_74d+pe.r+"px";
}else{
_73d.left=_740.left=pe.l+"px";
_73d.right=_740.right=pe.r+"px";
}
var _753=this._borderBox.h-pe.t-pe.b,_754=_753-(_739+_74b+_73a+_74e),_755=_738?_753:_754;
var _756=this._borderBox.w-pe.l-pe.r,_757=_756-(_73b+_74c+_73c+_74d),_758=_738?_757:_756;
var dim={top:{w:_758,h:_739},bottom:{w:_758,h:_73a},left:{w:_73b,h:_755},right:{w:_73c,h:_755},center:{h:_754,w:_757}};
var _75a=dojo.isIE||dojo.some(this.getChildren(),function(_75b){
return _75b.domNode.tagName=="TEXTAREA"||_75b.domNode.tagName=="INPUT";
});
if(_75a){
var _75c=function(_75d,_75e,_75f){
if(_75d){
(_75d.resize?_75d.resize(_75e,_75f):dojo.marginBox(_75d.domNode,_75e));
}
};
if(_748){
_748.style.height=_755;
}
if(_749){
_749.style.height=_755;
}
_75c(this._leftWidget,{h:_755},dim.left);
_75c(this._rightWidget,{h:_755},dim.right);
if(_746){
_746.style.width=_758;
}
if(_747){
_747.style.width=_758;
}
_75c(this._topWidget,{w:_758},dim.top);
_75c(this._bottomWidget,{w:_758},dim.bottom);
_75c(this._centerWidget,dim.center);
}else{
var _760={};
if(_737){
_760[_737]=_760.center=true;
if(/top|bottom/.test(_737)&&this.design!="sidebar"){
_760.left=_760.right=true;
}else{
if(/left|right/.test(_737)&&this.design=="sidebar"){
_760.top=_760.bottom=true;
}
}
}
dojo.forEach(this.getChildren(),function(_761){
if(_761.resize&&(!_737||_761.region in _760)){
_761.resize(null,dim[_761.region]);
}
},this);
}
},destroy:function(){
for(region in this._splitters){
var _762=this._splitters[region];
dijit.byNode(_762).destroy();
dojo._destroyElement(_762);
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
var _763=dojo.cookie(this._cookieName);
if(_763){
this.child.domNode.style[this.horizontal?"height":"width"]=_763;
}
}
},_computeMaxSize:function(){
var dim=this.horizontal?"h":"w",_765=this.container._splitterThickness[this.region];
var _766=dojo.contentBox(this.container.domNode)[dim]-(this.oppNode?dojo.marginBox(this.oppNode)[dim]:0)-20-_765*2;
this._maxSize=Math.min(this.child.maxSize,_766);
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
var _768=this._factor,max=this._maxSize,min=this._minSize||20,_76b=this.horizontal,axis=_76b?"pageY":"pageX",_76d=e[axis],_76e=this.domNode.style,dim=_76b?"h":"w",_770=dojo.marginBox(this.child.domNode)[dim],_771=this.region,_772=parseInt(this.domNode.style[_771],10),_773=this._resize,mb={},_775=this.child.domNode,_776=dojo.hitch(this.container,this.container._layoutChildren),de=dojo.doc.body;
this._handlers=(this._handlers||[]).concat([dojo.connect(de,"onmousemove",this._drag=function(e,_779){
var _77a=e[axis]-_76d,_77b=_768*_77a+_770,_77c=Math.max(Math.min(_77b,max),min);
if(_773||_779){
mb[dim]=_77c;
dojo.marginBox(_775,mb);
_776(_771);
}
_76e[_771]=_768*_77a+_772+(_77c-_77b)+"px";
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
var _77f=this.horizontal;
var tick=1;
var dk=dojo.keys;
switch(e.charOrCode){
case _77f?dk.UP_ARROW:dk.LEFT_ARROW:
tick*=-1;
case _77f?dk.DOWN_ARROW:dk.RIGHT_ARROW:
break;
default:
return;
}
var _782=dojo.marginBox(this.child.domNode)[_77f?"h":"w"]+this._factor*tick;
var mb={};
mb[this.horizontal?"h":"w"]=Math.max(Math.min(_782,this._maxSize),this._minSize);
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
dojo.forEach(this.getChildren(),function(_784){
_784.startup();
});
this.startupKeyNavChildren();
this.inherited(arguments);
},onExecute:function(){
},onCancel:function(_785){
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
},_iframeContentWindow:function(_78e){
var win=dijit.getDocumentWindow(dijit.Menu._iframeContentDocument(_78e))||dijit.Menu._iframeContentDocument(_78e)["__parent__"]||(_78e.name&&dojo.doc.frames[_78e.name])||null;
return win;
},_iframeContentDocument:function(_790){
var doc=_790.contentDocument||(_790.contentWindow&&_790.contentWindow.document)||(_790.name&&dojo.doc.frames[_790.name]&&dojo.doc.frames[_790.name].document)||null;
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
},unBindDomNode:function(_795){
var node=dojo.byId(_795);
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
var _79f=dojo.coords(e.target,true);
x=_79f.x+10;
y=_79f.y+10;
}
var self=this;
var _7a1=dijit.getFocus(this);
function closeAndRestoreFocus(){
dijit.focus(_7a1);
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
var _7a3=this.focusedChild;
var _7a4=_7a3.popup;
if(_7a4.isShowingNow){
return;
}
_7a4.parentMenu=this;
var self=this;
dijit.popup.open({parent:this,popup:_7a4,around:_7a3.domNode,orient:this.isLeftToRight()?{"TR":"TL","TL":"TR"}:{"TL":"TR","TR":"TL"},onCancel:function(){
dijit.popup.close(_7a4);
_7a3.focus();
self.currentPopup=null;
}});
this.currentPopup=_7a4;
if(_7a4.focus){
_7a4.focus();
}
},uninitialize:function(){
dojo.forEach(this.targetNodeIds,this.unBindDomNode,this);
this.inherited(arguments);
}});
dojo.declare("dijit.MenuItem",[dijit._Widget,dijit._Templated,dijit._Contained],{templateString:"<tr class=\"dijitReset dijitMenuItem\" dojoAttachPoint=\"focusNode\" waiRole=\"menuitem\" tabIndex=\"-1\""+"dojoAttachEvent=\"onmouseenter:_onHover,onmouseleave:_onUnhover,ondijitclick:_onClick\">"+"<td class=\"dijitReset\" waiRole=\"presentation\"><div class=\"dijitMenuItemIcon\" dojoAttachPoint=\"iconNode\"></div></td>"+"<td class=\"dijitReset dijitMenuItemLabel\" dojoAttachPoint=\"containerNode\"></td>"+"<td class=\"dijitReset dijitMenuArrowCell\" waiRole=\"presentation\">"+"<div dojoAttachPoint=\"arrowWrapper\" style=\"display: none\">"+"<div class=\"dijitMenuExpand\"></div>"+"<span class=\"dijitMenuExpandA11y\">+</span>"+"</div>"+"</td>"+"</tr>",attributeMap:dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap),{label:{node:"containerNode",type:"innerHTML"},iconClass:{node:"iconNode",type:"class"}}),label:"",iconClass:"",disabled:false,_fillContent:function(_7a6){
if(_7a6&&!("label" in this.params)){
this.attr("label",_7a6.innerHTML);
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
},setLabel:function(_7a9){
dojo.deprecated("dijit.MenuItem.setLabel() is deprecated.  Use attr('label', ...) instead.","","2.0");
this.attr("label",_7a9);
},setDisabled:function(_7aa){
dojo.deprecated("dijit.Menu.setDisabled() is deprecated.  Use attr('disabled', bool) instead.","","2.0");
this.attr("disabled",_7aa);
},_setDisabledAttr:function(_7ab){
this.disabled=_7ab;
dojo[_7ab?"addClass":"removeClass"](this.domNode,"dijitMenuItemDisabled");
dijit.setWaiState(this.focusNode,"disabled",_7ab?"true":"false");
}});
dojo.declare("dijit.PopupMenuItem",dijit.MenuItem,{_fillContent:function(){
if(this.srcNodeRef){
var _7ac=dojo.query("*",this.srcNodeRef);
dijit.PopupMenuItem.superclass._fillContent.call(this,_7ac[0]);
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
dojo.declare("dijit.CheckedMenuItem",dijit.MenuItem,{templateString:"<tr class=\"dijitReset dijitMenuItem\" dojoAttachPoint=\"focusNode\" waiRole=\"menuitemcheckbox\" tabIndex=\"-1\""+"dojoAttachEvent=\"onmouseenter:_onHover,onmouseleave:_onUnhover,ondijitclick:_onClick\">"+"<td class=\"dijitReset\" waiRole=\"presentation\"><div class=\"dijitMenuItemIcon dijitCheckedMenuItemIcon\" dojoAttachPoint=\"iconNode\">"+"<div class=\"dijitCheckedMenuItemIconChar\">&#10003;</div>"+"</div></td>"+"<td class=\"dijitReset dijitMenuItemLabel\" dojoAttachPoint=\"containerNode,labelNode\"></td>"+"<td class=\"dijitReset dijitMenuArrowCell\" waiRole=\"presentation\">"+"<div dojoAttachPoint=\"arrowWrapper\" style=\"display: none\">"+"<div class=\"dijitMenuExpand\"></div>"+"<span class=\"dijitMenuExpandA11y\">+</span>"+"</div>"+"</td>"+"</tr>",checked:false,_setCheckedAttr:function(_7ae){
dojo.toggleClass(this.iconNode,"dijitCheckedMenuItemIconChecked",_7ae);
dijit.setWaiState(this.domNode,"checked",_7ae);
this.checked=_7ae;
},onChange:function(_7af){
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
var _7b1=this.getChildren();
dojo.forEach(_7b1,this._setupChild,this);
dojo.some(_7b1,function(_7b2){
if(_7b2.selected){
this.selectedChildWidget=_7b2;
}
return _7b2.selected;
},this);
var _7b3=this.selectedChildWidget;
if(!_7b3&&_7b1[0]){
_7b3=this.selectedChildWidget=_7b1[0];
_7b3.selected=true;
}
if(_7b3){
this._showChild(_7b3);
}
dojo.publish(this.id+"-startup",[{children:_7b1,selected:_7b3}]);
this.inherited(arguments);
},_setupChild:function(_7b4){
this.inherited(arguments);
_7b4.domNode.style.display="none";
_7b4.domNode.style.position="relative";
_7b4.domNode.title="";
return _7b4;
},addChild:function(_7b5,_7b6){
this.inherited(arguments);
if(this._started){
dojo.publish(this.id+"-addChild",[_7b5,_7b6]);
this.layout();
if(!this.selectedChildWidget){
this.selectChild(_7b5);
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
var _7b8=this.getChildren();
if(_7b8.length){
this.selectChild(_7b8[0]);
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
},_transition:function(_7ba,_7bb){
if(_7bb){
this._hideChild(_7bb);
}
this._showChild(_7ba);
if(this.doLayout&&_7ba.resize){
_7ba.resize(this._containerContentBox||this._contentBox);
}
},_adjacent:function(_7bc){
var _7bd=this.getChildren();
var _7be=dojo.indexOf(_7bd,this.selectedChildWidget);
_7be+=_7bc?1:_7bd.length-1;
return _7bd[_7be%_7bd.length];
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
var _7c1=this.getChildren();
page.isFirstChild=(page==_7c1[0]);
page.isLastChild=(page==_7c1[_7c1.length-1]);
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
var _7c4=page.onClose(this,page);
if(_7c4){
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
},onAddChild:function(page,_7c8){
var _7c9=dojo.doc.createElement("span");
this.domNode.appendChild(_7c9);
var cls=dojo.getObject(this.buttonWidget);
var _7cb=new cls({label:page.title,closeButton:page.closable},_7c9);
this.addChild(_7cb,_7c8);
this.pane2button[page]=_7cb;
page.controlButton=_7cb;
var _7cc=[];
_7cc.push(dojo.connect(_7cb,"onClick",dojo.hitch(this,"onButtonClick",page)));
if(page.closable){
_7cc.push(dojo.connect(_7cb,"onClickCloseButton",dojo.hitch(this,"onCloseButtonClick",page)));
var _7cd=dojo.i18n.getLocalization("dijit","common");
var _7ce=new dijit.Menu({targetNodeIds:[_7cb.id],id:_7cb.id+"_Menu"});
var _7cf=new dijit.MenuItem({label:_7cd.itemClose});
_7cc.push(dojo.connect(_7cf,"onClick",dojo.hitch(this,"onCloseButtonClick",page)));
_7ce.addChild(_7cf);
this.pane2menu[page]=_7ce;
}
this.pane2handles[page]=_7cc;
if(!this._currentChild){
_7cb.focusNode.setAttribute("tabIndex","0");
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
var _7d2=this.pane2button[page];
if(_7d2){
_7d2.destroy();
delete this.pane2button[page];
}
},onSelectChild:function(page){
if(!page){
return;
}
if(this._currentChild){
var _7d4=this.pane2button[this._currentChild];
_7d4.attr("checked",false);
_7d4.focusNode.setAttribute("tabIndex","-1");
}
var _7d5=this.pane2button[page];
_7d5.attr("checked",true);
this._currentChild=page;
_7d5.focusNode.setAttribute("tabIndex","0");
var _7d6=dijit.byId(this.containerId);
dijit.setWaiState(_7d6.containerNode,"labelledby",_7d5.id);
},onButtonClick:function(page){
var _7d8=dijit.byId(this.containerId);
_7d8.selectChild(page);
},onCloseButtonClick:function(page){
var _7da=dijit.byId(this.containerId);
_7da.closeChild(page);
var b=this.pane2button[this._currentChild];
if(b){
dijit.focus(b.focusNode||b.domNode);
}
},adjacent:function(_7dc){
if(!this.isLeftToRight()&&(!this.tabPosition||/top|bottom/.test(this.tabPosition))){
_7dc=!_7dc;
}
var _7dd=this.getChildren();
var _7de=dojo.indexOf(_7dd,this.pane2button[this._currentChild]);
var _7df=_7dc?1:_7dd.length-1;
return _7dd[(_7de+_7df)%_7dd.length];
},onkeypress:function(e){
if(this.disabled||e.altKey){
return;
}
var _7e1=null;
if(e.ctrlKey||!e._djpage){
var k=dojo.keys;
switch(e.charOrCode){
case k.LEFT_ARROW:
case k.UP_ARROW:
if(!e._djpage){
_7e1=false;
}
break;
case k.PAGE_UP:
if(e.ctrlKey){
_7e1=false;
}
break;
case k.RIGHT_ARROW:
case k.DOWN_ARROW:
if(!e._djpage){
_7e1=true;
}
break;
case k.PAGE_DOWN:
if(e.ctrlKey){
_7e1=true;
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
if(_7e1!==null){
this.adjacent(_7e1).onClick();
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
var _7e7=this.selectedChildWidget.containerNode.style;
_7e7.display="";
_7e7.overflow="auto";
this.selectedChildWidget._setSelectedState(true);
}
},_getTargetHeight:function(node){
var cs=dojo.getComputedStyle(node);
return Math.max(this._verticalSpace-dojo._getPadBorderExtents(node,cs).h,0);
},layout:function(){
var _7ea=0;
var _7eb=this.selectedChildWidget;
dojo.forEach(this.getChildren(),function(_7ec){
_7ea+=_7ec.getTitleHeight();
});
var _7ed=this._contentBox;
this._verticalSpace=_7ed.h-_7ea;
if(_7eb){
_7eb.containerNode.style.height=this._getTargetHeight(_7eb.containerNode)+"px";
}
},_setupChild:function(page){
return page;
},_transition:function(_7ef,_7f0){
if(this._inTransition){
return;
}
this._inTransition=true;
var _7f1=[];
var _7f2=this._verticalSpace;
if(_7ef){
_7ef.setSelected(true);
var _7f3=_7ef.containerNode;
_7f3.style.display="";
_7f2=this._getTargetHeight(_7ef.containerNode);
_7f1.push(dojo.animateProperty({node:_7f3,duration:this.duration,properties:{height:{start:1,end:_7f2}},onEnd:function(){
_7f3.style.overflow="auto";
}}));
}
if(_7f0){
_7f0.setSelected(false);
var _7f4=_7f0.containerNode;
_7f4.style.overflow="hidden";
_7f2=this._getTargetHeight(_7f0.containerNode);
_7f1.push(dojo.animateProperty({node:_7f4,duration:this.duration,properties:{height:{start:_7f2,end:"1"}},onEnd:function(){
_7f4.style.display="none";
}}));
}
this._inTransition=false;
dojo.fx.combine(_7f1).play();
},_onKeyPress:function(e){
if(this.disabled||e.altKey||!(e._dijitWidget||e.ctrlKey)){
return;
}
var k=dojo.keys;
var _7f7=e._dijitWidget;
switch(e.charOrCode){
case k.LEFT_ARROW:
case k.UP_ARROW:
if(_7f7){
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
if(_7f7){
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
var _7f8=this.getParent();
if(!_7f8._inTransition){
_7f8.selectChild(this);
dijit.focus(this.focusNode);
}
},_onTitleEnter:function(){
dojo.addClass(this.focusNode,"dijitAccordionTitle-hover");
},_onTitleLeave:function(){
dojo.removeClass(this.focusNode,"dijitAccordionTitle-hover");
},_onTitleKeyPress:function(evt){
evt._dijitWidget=this;
return this.getParent()._onKeyPress(evt);
},_setSelectedState:function(_7fa){
this.selected=_7fa;
dojo[(_7fa?"addClass":"removeClass")](this.titleNode,"dijitAccordionTitle-selected");
dijit.setWaiState(this.focusNode,"expanded",_7fa);
this.focusNode.setAttribute("tabIndex",_7fa?"0":"-1");
},_handleFocus:function(e){
dojo[(e.type=="focus"?"addClass":"removeClass")](this.focusNode,"dijitAccordionFocused");
},setSelected:function(_7fc){
this._setSelectedState(_7fc);
if(_7fc){
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
var _7fd=dojo.getObject(this._controllerWidget);
this.tablist=new _7fd({id:this.id+"_tablist",tabPosition:this.tabPosition,doLayout:this.doLayout,containerId:this.id,"class":this.baseClass+"-tabs"+(this.doLayout?"":" dijitTabNoLayout")},this.tablistNode);
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
var _7ff=this.tabPosition.replace(/-h/,"");
var _800=[{domNode:this.tablist.domNode,layoutAlign:_7ff},{domNode:this.tablistSpacer,layoutAlign:_7ff},{domNode:this.containerNode,layoutAlign:"client"}];
dijit.layout.layoutChildren(this.domNode,this._contentBox,_800);
this._containerContentBox=dijit.layout.marginBox2contentBox(this.containerNode,_800[2]);
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
var _801=0;
for(var pane in this.pane2button){
var ow=this.pane2button[pane].innerDiv.scrollWidth;
_801=Math.max(_801,ow);
}
for(pane in this.pane2button){
this.pane2button[pane].innerDiv.style.width=_801+"px";
}
}});
dojo.declare("dijit.layout._TabButton",dijit.layout._StackButton,{baseClass:"dijitTab",templateString:"<div waiRole=\"presentation\" dojoAttachEvent='onclick:onClick,onmouseenter:_onMouse,onmouseleave:_onMouse'>\r\n    <div waiRole=\"presentation\" class='dijitTabInnerDiv' dojoAttachPoint='innerDiv'>\r\n        <div waiRole=\"presentation\" class='dijitTabContent' dojoAttachPoint='tabContent'>\r\n\t        <span dojoAttachPoint='containerNode,focusNode' class='tabLabel'>${!label}</span><img class =\"dijitTabButtonSpacer\" src=\"${_blankGif}\" />\r\n\t        <div class=\"dijitInline closeNode\" dojoAttachPoint='closeNode' dojoAttachEvent='onclick:onClickCloseButton'>\r\n\t        \t<img src=\"${_blankGif}\" alt=\"\" dojoAttachPoint='closeButtonNode' class='closeImage' dojoAttachEvent='onmouseenter:_onMouse, onmouseleave:_onMouse' stateModifier='CloseButton' waiRole=\"presentation\"/>\r\n\t            <span dojoAttachPoint='closeText' class='closeText'>x</span>\r\n\t        </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n",_scroll:false,postCreate:function(){
if(this.closeButton){
dojo.addClass(this.innerDiv,"dijitClosable");
var _804=dojo.i18n.getLocalization("dijit","common");
if(this.closeNode){
dojo.attr(this.closeNode,"title",_804.itemClose);
dojo.attr(this.closeButtonNode,"title",_804.itemClose);
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
var tree=this.tree,_807=tree.model;
if(tree._v10Compat&&item===_807.root){
item=null;
}
this.iconNode.className="dijitTreeIcon "+tree.getIconClass(item,this.isExpanded);
this.labelNode.className="dijitTreeLabel "+tree.getLabelClass(item,this.isExpanded);
},_updateLayout:function(){
var _808=this.getParent();
if(!_808||_808.rowNode.style.display=="none"){
dojo.addClass(this.domNode,"dijitTreeIsRoot");
}else{
dojo.toggleClass(this.domNode,"dijitTreeIsLast",!this.getNextSibling());
}
},_setExpando:function(_809){
var _80a=["dijitTreeExpandoLoading","dijitTreeExpandoOpened","dijitTreeExpandoClosed","dijitTreeExpandoLeaf"];
var _80b=["*","-","+","*"];
var idx=_809?0:(this.isExpandable?(this.isExpanded?1:2):3);
dojo.forEach(_80a,function(s){
dojo.removeClass(this.expandoNode,s);
},this);
dojo.addClass(this.expandoNode,_80a[idx]);
this.expandoNodeText.innerHTML=_80b[idx];
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
},setLabelNode:function(_80e){
this.labelNode.innerHTML="";
this.labelNode.appendChild(dojo.doc.createTextNode(_80e));
},setChildItems:function(_80f){
var tree=this.tree,_811=tree.model;
this.getChildren().forEach(function(_812){
dijit._Container.prototype.removeChild.call(this,_812);
},this);
this.state="LOADED";
if(_80f&&_80f.length>0){
this.isExpandable=true;
dojo.forEach(_80f,function(item){
var id=_811.getIdentity(item),_815=tree._itemNodeMap[id],node=(_815&&!_815.getParent())?_815:this.tree._createTreeNode({item:item,tree:tree,isExpandable:_811.mayHaveChildren(item),label:tree.getLabel(item)});
this.addChild(node);
tree._itemNodeMap[id]=node;
if(this.tree.persist){
if(tree._openedItemIds[id]){
tree._expandNode(node);
}
}
},this);
dojo.forEach(this.getChildren(),function(_817,idx){
_817._updateLayout();
});
}else{
this.isExpandable=false;
}
if(this._setExpando){
this._setExpando(false);
}
if(this==tree.rootNode){
var fc=this.tree.showRoot?this:this.getChildren()[0],_81a=fc?fc.labelNode:this.domNode;
_81a.setAttribute("tabIndex","0");
tree.lastFocused=fc;
}
},removeChild:function(node){
this.inherited(arguments);
var _81c=this.getChildren();
if(_81c.length==0){
this.isExpandable=false;
this.collapse();
}
dojo.forEach(_81c,function(_81d){
_81d._updateLayout();
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
dojo.declare("dijit.Tree",[dijit._Widget,dijit._Templated],{store:null,model:null,query:null,label:"",showRoot:true,childrenAttr:["children"],openOnClick:false,templateString:"<div class=\"dijitTreeContainer\" waiRole=\"tree\"\r\n\tdojoAttachEvent=\"onclick:_onClick,onkeypress:_onKeyPress\">\r\n</div>\r\n",isExpandable:true,isTree:true,persist:true,dndController:null,dndParams:["onDndDrop","itemCreator","onDndCancel","checkAcceptance","checkItemAcceptance","dragThreshold"],onDndDrop:null,itemCreator:null,onDndCancel:null,checkAcceptance:null,checkItemAcceptance:null,dragThreshold:0,_publish:function(_822,_823){
dojo.publish(this.id,[dojo.mixin({tree:this,event:_822},_823||{})]);
},postMixInProperties:function(){
this.tree=this;
this._itemNodeMap={};
if(!this.cookieName){
this.cookieName=this.id+"SaveStateCookie";
}
},postCreate:function(){
if(this.persist){
var _824=dojo.cookie(this.cookieName);
this._openedItemIds={};
if(_824){
dojo.forEach(_824.split(","),function(item){
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
var _826={};
for(var i=0;i<this.dndParams.length;i++){
if(this[this.dndParams[i]]){
_826[this.dndParams[i]]=this[this.dndParams[i]];
}
}
this.dndController=new this.dndController(this,_826);
}
},_store2model:function(){
this._v10Compat=true;
dojo.deprecated("Tree: from version 2.0, should specify a model object rather than a store/query");
var _828={id:this.id+"_ForestStoreModel",store:this.store,query:this.query,childrenAttrs:this.childrenAttr};
if(this.params.mayHaveChildren){
_828.mayHaveChildren=dojo.hitch(this,"mayHaveChildren");
}
if(this.params.getItemChildren){
_828.getChildren=dojo.hitch(this,function(item,_82a,_82b){
this.getItemChildren((this._v10Compat&&item===this.model.root)?null:item,_82a,_82b);
});
}
this.model=new dijit.tree.ForestStoreModel(_828);
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
},getItemChildren:function(_830,_831){
},getLabel:function(item){
return this.model.getLabel(item);
},getIconClass:function(item,_834){
return (!item||this.model.mayHaveChildren(item))?(_834?"dijitFolderOpened":"dijitFolderClosed"):"dijitLeaf";
},getLabelClass:function(item,_836){
},_onKeyPress:function(e){
if(e.altKey){
return;
}
var dk=dojo.keys;
var _839=dijit.getEnclosingWidget(e.target);
if(!_839){
return;
}
var key=e.charOrCode;
if(typeof key=="string"){
if(!e.altKey&&!e.ctrlKey&&!e.shiftKey&&!e.metaKey){
this._onLetterKeyNav({node:_839,key:key.toLowerCase()});
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
this[this._keyHandlerMap[key]]({node:_839,item:_839.item});
dojo.stopEvent(e);
}
}
},_onEnterKey:function(_83c){
this._publish("execute",{item:_83c.item,node:_83c.node});
this.onClick(_83c.item,_83c.node);
},_onDownArrow:function(_83d){
var node=this._getNextNode(_83d.node);
if(node&&node.isTreeNode){
this.focusNode(node);
}
},_onUpArrow:function(_83f){
var node=_83f.node;
var _841=node.getPreviousSibling();
if(_841){
node=_841;
while(node.isExpandable&&node.isExpanded&&node.hasChildren()){
var _842=node.getChildren();
node=_842[_842.length-1];
}
}else{
var _843=node.getParent();
if(!(!this.showRoot&&_843===this.rootNode)){
node=_843;
}
}
if(node&&node.isTreeNode){
this.focusNode(node);
}
},_onRightArrow:function(_844){
var node=_844.node;
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
},_onLeftArrow:function(_846){
var node=_846.node;
if(node.isExpandable&&node.isExpanded){
this._collapseNode(node);
}else{
var _848=node.getParent();
if(_848&&_848.isTreeNode&&!(!this.showRoot&&_848===this.rootNode)){
this.focusNode(_848);
}
}
},_onHomeKey:function(){
var node=this._getRootOrFirstNode();
if(node){
this.focusNode(node);
}
},_onEndKey:function(_84a){
var node=this;
while(node.isExpanded){
var c=node.getChildren();
node=c[c.length-1];
}
if(node&&node.isTreeNode){
this.focusNode(node);
}
},_onLetterKeyNav:function(_84d){
var node=_84d.node,_84f=node,key=_84d.key;
do{
node=this._getNextNode(node);
if(!node){
node=this._getRootOrFirstNode();
}
}while(node!==_84f&&(node.label.charAt(0).toLowerCase()!=key));
if(node&&node.isTreeNode){
if(node!==_84f){
this.focusNode(node);
}
}
},_onClick:function(e){
var _852=e.target;
var _853=dijit.getEnclosingWidget(_852);
if(!_853||!_853.isTreeNode){
return;
}
if((this.openOnClick&&_853.isExpandable)||(_852==_853.expandoNode||_852==_853.expandoNodeText)){
if(_853.isExpandable){
this._onExpandoClick({node:_853});
}
}else{
this._publish("execute",{item:_853.item,node:_853});
this.onClick(_853.item,_853);
this.focusNode(_853);
}
dojo.stopEvent(e);
},_onExpandoClick:function(_854){
var node=_854.node;
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
var _85d=node.getNextSibling();
if(_85d){
return _85d;
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
var _860=this.model,item=node.item;
switch(node.state){
case "LOADING":
return;
case "UNCHECKED":
node.markProcessing();
var _862=this;
_860.getChildren(item,function(_863){
node.unmarkProcessing();
node.setChildItems(_863);
_862._expandNode(node);
},function(err){
console.error(_862,": error loading root children: ",err);
});
break;
default:
node.expand();
this.onOpen(node.item,node);
if(this.persist&&item){
this._openedItemIds[_860.getIdentity(item)]=true;
this._saveState();
}
}
},blurNode:function(){
var node=this.lastFocused;
if(!node){
return;
}
var _866=node.labelNode;
dojo.removeClass(_866,"dijitTreeLabelFocused");
_866.setAttribute("tabIndex","-1");
dijit.setWaiState(_866,"selected",false);
this.lastFocused=null;
},focusNode:function(node){
node.labelNode.focus();
},_onBlur:function(){
this.inherited(arguments);
if(this.lastFocused){
var _868=this.lastFocused.labelNode;
dojo.removeClass(_868,"dijitTreeLabelFocused");
}
},_onTreeFocus:function(node){
if(node){
if(node!=this.lastFocused){
this.blurNode();
}
var _86a=node.labelNode;
_86a.setAttribute("tabIndex","0");
dijit.setWaiState(_86a,"selected",true);
dojo.addClass(_86a,"dijitTreeLabelFocused");
this.lastFocused=node;
}
},_onItemDelete:function(item){
var _86c=this.model.getIdentity(item);
var node=this._itemNodeMap[_86c];
if(node){
var _86e=node.getParent();
if(_86e){
_86e.removeChild(node);
}
delete this._itemNodeMap[_86c];
node.destroyRecursive();
}
},_onItemChange:function(item){
var _870=this.model,_871=_870.getIdentity(item),node=this._itemNodeMap[_871];
if(node){
node.setLabelNode(this.getLabel(item));
node._updateItemClasses(item);
}
},_onItemChildrenChange:function(_873,_874){
var _875=this.model,_876=_875.getIdentity(_873),_877=this._itemNodeMap[_876];
if(_877){
_877.setChildItems(_874);
}
},_onItemDelete:function(item){
var _879=this.model,_87a=_879.getIdentity(item),node=this._itemNodeMap[_87a];
if(node){
node.destroyRecursive();
delete this._itemNodeMap[_87a];
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
var _880=this.store;
if(!_880.getFeatures()["dojo.data.api.Identity"]){
throw new Error("dijit.Tree: store must support dojo.data.Identity");
}
if(_880.getFeatures()["dojo.data.api.Notification"]){
this.connects=this.connects.concat([dojo.connect(_880,"onNew",this,"_onNewItem"),dojo.connect(_880,"onDelete",this,"_onDeleteItem"),dojo.connect(_880,"onSet",this,"_onSetItem")]);
}
},destroy:function(){
dojo.forEach(this.connects,dojo.disconnect);
},getRoot:function(_881,_882){
if(this.root){
_881(this.root);
}else{
this.store.fetch({query:this.query,onComplete:dojo.hitch(this,function(_883){
if(_883.length!=1){
throw new Error(this.declaredClass+": query "+dojo.toJson(this.query)+" returned "+_883.length+" items, but must return exactly one item");
}
this.root=_883[0];
_881(this.root);
}),onError:_882});
}
},mayHaveChildren:function(item){
return dojo.some(this.childrenAttrs,function(attr){
return this.store.hasAttribute(item,attr);
},this);
},getChildren:function(_886,_887,_888){
var _889=this.store;
var _88a=[];
for(var i=0;i<this.childrenAttrs.length;i++){
var vals=_889.getValues(_886,this.childrenAttrs[i]);
_88a=_88a.concat(vals);
}
var _88d=0;
dojo.forEach(_88a,function(item){
if(!_889.isItemLoaded(item)){
_88d++;
}
});
if(_88d==0){
_887(_88a);
}else{
var _88f=function _88f(item){
if(--_88d==0){
_887(_88a);
}
};
dojo.forEach(_88a,function(item){
if(!_889.isItemLoaded(item)){
_889.loadItem({item:item,onItem:_88f,onError:_888});
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
},newItem:function(args,_895){
var _896={parent:_895,attribute:this.childrenAttrs[0]};
return this.store.newItem(args,_896);
},pasteItem:function(_897,_898,_899,_89a){
var _89b=this.store,_89c=this.childrenAttrs[0];
if(_898){
dojo.forEach(this.childrenAttrs,function(attr){
if(_89b.containsValue(_898,attr,_897)){
if(!_89a){
var _89e=dojo.filter(_89b.getValues(_898,attr),function(x){
return x!=_897;
});
_89b.setValues(_898,attr,_89e);
}
_89c=attr;
}
});
}
if(_899){
_89b.setValues(_899,_89c,_89b.getValues(_899,_89c).concat(_897));
}
},onChange:function(item){
},onChildrenChange:function(_8a1,_8a2){
},onDelete:function(_8a3,_8a4){
},_onNewItem:function(item,_8a6){
if(!_8a6){
return;
}
this.getChildren(_8a6.item,dojo.hitch(this,function(_8a7){
this.onChildrenChange(_8a6.item,_8a7);
}));
},_onDeleteItem:function(item){
this.onDelete(item);
},_onSetItem:function(item,_8aa,_8ab,_8ac){
if(dojo.indexOf(this.childrenAttrs,_8aa)!=-1){
this.getChildren(item,dojo.hitch(this,function(_8ad){
this.onChildrenChange(item,_8ad);
}));
}else{
this.onChange(item);
}
}});
dojo.declare("dijit.tree.ForestStoreModel",dijit.tree.TreeStoreModel,{rootId:"$root$",rootLabel:"ROOT",query:null,constructor:function(_8ae){
this.root={store:this,root:true,id:_8ae.rootId,label:_8ae.rootLabel,children:_8ae.rootChildren};
},mayHaveChildren:function(item){
return item===this.root||this.inherited(arguments);
},getChildren:function(_8b0,_8b1,_8b2){
if(_8b0===this.root){
if(this.root.children){
_8b1(this.root.children);
}else{
this.store.fetch({query:this.query,onComplete:dojo.hitch(this,function(_8b3){
this.root.children=_8b3;
_8b1(_8b3);
}),onError:_8b2});
}
}else{
this.inherited(arguments);
}
},getIdentity:function(item){
return (item===this.root)?this.root.id:this.inherited(arguments);
},getLabel:function(item){
return (item===this.root)?this.root.label:this.inherited(arguments);
},newItem:function(args,_8b7){
if(_8b7===this.root){
this.onNewRootItem(args);
return this.store.newItem(args);
}else{
return this.inherited(arguments);
}
},onNewRootItem:function(args){
},pasteItem:function(_8b9,_8ba,_8bb,_8bc){
if(_8ba===this.root){
if(!_8bc){
this.onLeaveRoot(_8b9);
}
}
dijit.tree.TreeStoreModel.prototype.pasteItem.call(this,_8b9,_8ba===this.root?null:_8ba,_8bb===this.root?null:_8bb);
if(_8bb===this.root){
this.onAddToRoot(_8b9);
}
},onAddToRoot:function(item){
console.log(this,": item ",item," added to root");
},onLeaveRoot:function(item){
console.log(this,": item ",item," removed from root");
},_requeryTop:function(){
var _8bf=this.root.children||[];
this.store.fetch({query:this.query,onComplete:dojo.hitch(this,function(_8c0){
this.root.children=_8c0;
if(_8bf.length!=_8c0.length||dojo.some(_8bf,function(item,idx){
return _8c0[idx]!=item;
})){
this.onChildrenChange(this.root,_8c0);
}
})});
},_onNewItem:function(item,_8c4){
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
dojox.data.dom.createDocument=function(str,_8c7){
var _8c8=dojo.doc;
if(!_8c7){
_8c7="text/xml";
}
if(str&&dojo.trim(str)!==""&&(typeof dojo.global["DOMParser"])!=="undefined"){
var _8c9=new DOMParser();
return _8c9.parseFromString(str,_8c7);
}else{
if((typeof dojo.global["ActiveXObject"])!=="undefined"){
var _8ca=["MSXML2","Microsoft","MSXML","MSXML3"];
for(var i=0;i<_8ca.length;i++){
try{
var doc=new ActiveXObject(_8ca[i]+".XMLDOM");
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
if((_8c8.implementation)&&(_8c8.implementation.createDocument)){
if(str&&dojo.trim(str)!==""){
if(_8c8.createElement){
var tmp=_8c8.createElement("xml");
tmp.innerHTML=str;
var _8ce=_8c8.implementation.createDocument("foo","",null);
for(var i=0;i<tmp.childNodes.length;i++){
_8ce.importNode(tmp.childNodes.item(i),true);
}
return _8ce;
}
}else{
return _8c8.implementation.createDocument("","",null);
}
}
}
}
return null;
};
dojox.data.dom.textContent=function(node,text){
if(arguments.length>1){
var _8d1=node.ownerDocument||dojo.doc;
dojox.data.dom.replaceChildren(node,_8d1.createTextNode(text));
return text;
}else{
if(node.textContent!==undefined){
return node.textContent;
}
var _8d2="";
if(node==null){
return _8d2;
}
for(var i=0;i<node.childNodes.length;i++){
switch(node.childNodes[i].nodeType){
case 1:
case 5:
_8d2+=dojox.data.dom.textContent(node.childNodes[i]);
break;
case 3:
case 2:
case 4:
_8d2+=node.childNodes[i].nodeValue;
break;
default:
break;
}
}
return _8d2;
}
};
dojox.data.dom.replaceChildren=function(node,_8d5){
var _8d6=[];
if(dojo.isIE){
for(var i=0;i<node.childNodes.length;i++){
_8d6.push(node.childNodes[i]);
}
}
dojox.data.dom.removeChildren(node);
for(var i=0;i<_8d6.length;i++){
dojo._destroyElement(_8d6[i]);
}
if(!dojo.isArray(_8d5)){
node.appendChild(_8d5);
}else{
for(var i=0;i<_8d5.length;i++){
node.appendChild(_8d5[i]);
}
}
};
dojox.data.dom.removeChildren=function(node){
var _8d9=node.childNodes.length;
while(node.hasChildNodes()){
node.removeChild(node.firstChild);
}
return _8d9;
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
},url:"",rootItem:"",keyAttribute:"",label:"",sendQuery:false,getValue:function(item,_8dd,_8de){
var _8df=item.element;
if(_8dd==="tagName"){
return _8df.nodeName;
}else{
if(_8dd==="childNodes"){
for(var i=0;i<_8df.childNodes.length;i++){
var node=_8df.childNodes[i];
if(node.nodeType===1){
return this._getItem(node);
}
}
return _8de;
}else{
if(_8dd==="text()"){
for(var i=0;i<_8df.childNodes.length;i++){
var node=_8df.childNodes[i];
if(node.nodeType===3||node.nodeType===4){
return node.nodeValue;
}
}
return _8de;
}else{
_8dd=this._getAttribute(_8df.nodeName,_8dd);
if(_8dd.charAt(0)==="@"){
var name=_8dd.substring(1);
var _8e3=_8df.getAttribute(name);
return (_8e3!==undefined)?_8e3:_8de;
}else{
for(var i=0;i<_8df.childNodes.length;i++){
var node=_8df.childNodes[i];
if(node.nodeType===1&&node.nodeName===_8dd){
return this._getItem(node);
}
}
return _8de;
}
}
}
}
},getValues:function(item,_8e5){
var _8e6=item.element;
if(_8e5==="tagName"){
return [_8e6.nodeName];
}else{
if(_8e5==="childNodes"){
var _8e7=[];
for(var i=0;i<_8e6.childNodes.length;i++){
var node=_8e6.childNodes[i];
if(node.nodeType===1){
_8e7.push(this._getItem(node));
}
}
return _8e7;
}else{
if(_8e5==="text()"){
var _8e7=[],ec=_8e6.childNodes;
for(var i=0;i<ec.length;i++){
var node=ec[i];
if(node.nodeType===3||node.nodeType===4){
_8e7.push(node.nodeValue);
}
}
return _8e7;
}else{
_8e5=this._getAttribute(_8e6.nodeName,_8e5);
if(_8e5.charAt(0)==="@"){
var name=_8e5.substring(1);
var _8ec=_8e6.getAttribute(name);
return (_8ec!==undefined)?[_8ec]:[];
}else{
var _8e7=[];
for(var i=0;i<_8e6.childNodes.length;i++){
var node=_8e6.childNodes[i];
if(node.nodeType===1&&node.nodeName===_8e5){
_8e7.push(this._getItem(node));
}
}
return _8e7;
}
}
}
}
},getAttributes:function(item){
var _8ee=item.element;
var _8ef=[];
_8ef.push("tagName");
if(_8ee.childNodes.length>0){
var _8f0={};
var _8f1=true;
var text=false;
for(var i=0;i<_8ee.childNodes.length;i++){
var node=_8ee.childNodes[i];
if(node.nodeType===1){
var name=node.nodeName;
if(!_8f0[name]){
_8ef.push(name);
_8f0[name]=name;
}
_8f1=true;
}else{
if(node.nodeType===3){
text=true;
}
}
}
if(_8f1){
_8ef.push("childNodes");
}
if(text){
_8ef.push("text()");
}
}
for(var i=0;i<_8ee.attributes.length;i++){
_8ef.push("@"+_8ee.attributes[i].nodeName);
}
if(this._attributeMap){
for(var key in this._attributeMap){
var i=key.indexOf(".");
if(i>0){
var _8f7=key.substring(0,i);
if(_8f7===_8ee.nodeName){
_8ef.push(key.substring(i+1));
}
}else{
_8ef.push(key);
}
}
}
return _8ef;
},hasAttribute:function(item,_8f9){
return (this.getValue(item,_8f9)!==undefined);
},containsValue:function(item,_8fb,_8fc){
var _8fd=this.getValues(item,_8fb);
for(var i=0;i<_8fd.length;i++){
if((typeof _8fc==="string")){
if(_8fd[i].toString&&_8fd[i].toString()===_8fc){
return true;
}
}else{
if(_8fd[i]===_8fc){
return true;
}
}
}
return false;
},isItem:function(_8ff){
if(_8ff&&_8ff.element&&_8ff.store&&_8ff.store===this){
return true;
}
return false;
},isItemLoaded:function(_900){
return this.isItem(_900);
},loadItem:function(_901){
},getFeatures:function(){
var _902={"dojo.data.api.Read":true,"dojo.data.api.Write":true};
return _902;
},getLabel:function(item){
if((this.label!=="")&&this.isItem(item)){
var _904=this.getValue(item,this.label);
if(_904){
return _904.toString();
}
}
return undefined;
},getLabelAttributes:function(item){
if(this.label!==""){
return [this.label];
}
return null;
},_fetchItems:function(_906,_907,_908){
var url=this._getFetchUrl(_906);
console.log("XmlStore._fetchItems(): url="+url);
if(!url){
_908(new Error("No URL specified."));
return;
}
var _90a=(!this.sendQuery?_906:null);
var self=this;
var _90c={url:url,handleAs:"xml",preventCache:true};
var _90d=dojo.xhrGet(_90c);
_90d.addCallback(function(data){
var _90f=self._getItems(data,_90a);
console.log("XmlStore._fetchItems(): length="+(_90f?_90f.length:0));
if(_90f&&_90f.length>0){
_907(_90f,_906);
}else{
_907([],_906);
}
});
_90d.addErrback(function(data){
_908(data,_906);
});
},_getFetchUrl:function(_911){
if(!this.sendQuery){
return this.url;
}
var _912=_911.query;
if(!_912){
return this.url;
}
if(dojo.isString(_912)){
return this.url+_912;
}
var _913="";
for(var name in _912){
var _915=_912[name];
if(_915){
if(_913){
_913+="&";
}
_913+=(name+"="+_915);
}
}
if(!_913){
return this.url;
}
var _916=this.url;
if(_916.indexOf("?")<0){
_916+="?";
}else{
_916+="&";
}
return _916+_913;
},_getItems:function(_917,_918){
var _919=null;
if(_918){
_919=_918.query;
}
var _91a=[];
var _91b=null;
console.log("Looking up root item: "+this.rootItem);
if(this.rootItem!==""){
_91b=_917.getElementsByTagName(this.rootItem);
}else{
_91b=_917.documentElement.childNodes;
}
for(var i=0;i<_91b.length;i++){
var node=_91b[i];
if(node.nodeType!=1){
continue;
}
var item=this._getItem(node);
if(_919){
var _91f=true;
var _920=_918.queryOptions?_918.queryOptions.ignoreCase:false;
var _921={};
for(var key in _919){
var _923=_919[key];
if(typeof _923==="string"){
_921[key]=dojo.data.util.filter.patternToRegExp(_923,_920);
}
}
for(var _924 in _919){
var _923=this.getValue(item,_924);
if(_923){
var _925=_919[_924];
if((typeof _923)==="string"&&(_921[_924])){
if((_923.match(_921[_924]))!==null){
continue;
}
}else{
if((typeof _923)==="object"){
if(_923.toString&&(_921[_924])){
var _926=_923.toString();
if((_926.match(_921[_924]))!==null){
continue;
}
}else{
if(_925==="*"||_925===_923){
continue;
}
}
}
}
}
_91f=false;
break;
}
if(!_91f){
continue;
}
}
_91a.push(item);
}
dojo.forEach(_91a,function(item){
item.element.parentNode.removeChild(item.element);
},this);
return _91a;
},close:function(_928){
},newItem:function(_929){
console.log("XmlStore.newItem()");
_929=(_929||{});
var _92a=_929.tagName;
if(!_92a){
_92a=this.rootItem;
if(_92a===""){
return null;
}
}
var _92b=this._getDocument();
var _92c=_92b.createElement(_92a);
for(var _92d in _929){
if(_92d==="tagName"){
continue;
}else{
if(_92d==="text()"){
var text=_92b.createTextNode(_929[_92d]);
_92c.appendChild(text);
}else{
_92d=this._getAttribute(_92a,_92d);
if(_92d.charAt(0)==="@"){
var name=_92d.substring(1);
_92c.setAttribute(name,_929[_92d]);
}else{
var _930=_92b.createElement(_92d);
var text=_92b.createTextNode(_929[_92d]);
_930.appendChild(text);
_92c.appendChild(_930);
}
}
}
}
var item=this._getItem(_92c);
this._newItems.push(item);
return item;
},deleteItem:function(item){
console.log("XmlStore.deleteItem()");
var _933=item.element;
if(_933.parentNode){
this._backupItem(item);
_933.parentNode.removeChild(_933);
return true;
}
this._forgetItem(item);
this._deletedItems.push(item);
return true;
},setValue:function(item,_935,_936){
if(_935==="tagName"){
return false;
}
this._backupItem(item);
var _937=item.element;
if(_935==="childNodes"){
var _938=_936.element;
_937.appendChild(_938);
}else{
if(_935==="text()"){
while(_937.firstChild){
_937.removeChild(_937.firstChild);
}
var text=this._getDocument(_937).createTextNode(_936);
_937.appendChild(text);
}else{
_935=this._getAttribute(_937.nodeName,_935);
if(_935.charAt(0)==="@"){
var name=_935.substring(1);
_937.setAttribute(name,_936);
}else{
var _938=null;
for(var i=0;i<_937.childNodes.length;i++){
var node=_937.childNodes[i];
if(node.nodeType===1&&node.nodeName===_935){
_938=node;
break;
}
}
var _93d=this._getDocument(_937);
if(_938){
while(_938.firstChild){
_938.removeChild(_938.firstChild);
}
}else{
_938=_93d.createElement(_935);
_937.appendChild(_938);
}
var text=_93d.createTextNode(_936);
_938.appendChild(text);
}
}
}
return true;
},setValues:function(item,_93f,_940){
if(_93f==="tagName"){
return false;
}
this._backupItem(item);
var _941=item.element;
if(_93f==="childNodes"){
while(_941.firstChild){
_941.removeChild(_941.firstChild);
}
for(var i=0;i<_940.length;i++){
var _943=_940[i].element;
_941.appendChild(_943);
}
}else{
if(_93f==="text()"){
while(_941.firstChild){
_941.removeChild(_941.firstChild);
}
var _944="";
for(var i=0;i<_940.length;i++){
_944+=_940[i];
}
var text=this._getDocument(_941).createTextNode(_944);
_941.appendChild(text);
}else{
_93f=this._getAttribute(_941.nodeName,_93f);
if(_93f.charAt(0)==="@"){
var name=_93f.substring(1);
_941.setAttribute(name,_940[0]);
}else{
for(var i=_941.childNodes.length-1;i>=0;i--){
var node=_941.childNodes[i];
if(node.nodeType===1&&node.nodeName===_93f){
_941.removeChild(node);
}
}
var _948=this._getDocument(_941);
for(var i=0;i<_940.length;i++){
var _943=_948.createElement(_93f);
var text=_948.createTextNode(_940[i]);
_943.appendChild(text);
_941.appendChild(_943);
}
}
}
}
return true;
},unsetAttribute:function(item,_94a){
if(_94a==="tagName"){
return false;
}
this._backupItem(item);
var _94b=item.element;
if(_94a==="childNodes"||_94a==="text()"){
while(_94b.firstChild){
_94b.removeChild(_94b.firstChild);
}
}else{
_94a=this._getAttribute(_94b.nodeName,_94a);
if(_94a.charAt(0)==="@"){
var name=_94a.substring(1);
_94b.removeAttribute(name);
}else{
for(var i=_94b.childNodes.length-1;i>=0;i--){
var node=_94b.childNodes[i];
if(node.nodeType===1&&node.nodeName===_94a){
_94b.removeChild(node);
}
}
}
}
return true;
},save:function(_94f){
if(!_94f){
_94f={};
}
for(var i=0;i<this._modifiedItems.length;i++){
this._saveItem(this._modifiedItems[i],_94f,"PUT");
}
for(var i=0;i<this._newItems.length;i++){
var item=this._newItems[i];
if(item.element.parentNode){
this._newItems.splice(i,1);
i--;
continue;
}
this._saveItem(this._newItems[i],_94f,"POST");
}
for(var i=0;i<this._deletedItems.length;i++){
this._saveItem(this._deletedItems[i],_94f,"DELETE");
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
var _953=this._getRootElement(item.element);
return (this._getItemIndex(this._newItems,_953)>=0||this._getItemIndex(this._deletedItems,_953)>=0||this._getItemIndex(this._modifiedItems,_953)>=0);
}else{
return (this._newItems.length>0||this._deletedItems.length>0||this._modifiedItems.length>0);
}
},_saveItem:function(item,_955,_956){
var url;
if(_956==="PUT"){
url=this._getPutUrl(item);
}else{
if(_956==="DELETE"){
url=this._getDeleteUrl(item);
}else{
url=this._getPostUrl(item);
}
}
if(!url){
if(_955.onError){
_955.onError.call(_958,new Error("No URL for saving content: "+this._getPostContent(item)));
}
return;
}
var _959={url:url,method:(_956||"POST"),contentType:"text/xml",handleAs:"xml"};
var _95a;
if(_956==="PUT"){
_959.putData=this._getPutContent(item);
_95a=dojo.rawXhrPut(_959);
}else{
if(_956==="DELETE"){
_95a=dojo.xhrDelete(_959);
}else{
_959.postData=this._getPostContent(item);
_95a=dojo.rawXhrPost(_959);
}
}
var _958=(_955.scope||dojo.global);
var self=this;
_95a.addCallback(function(data){
self._forgetItem(item);
if(_955.onComplete){
_955.onComplete.call(_958);
}
});
_95a.addErrback(function(_95d){
if(_955.onError){
_955.onError.call(_958,_95d);
}
});
},_getPostUrl:function(item){
return this.url;
},_getPutUrl:function(item){
return this.url;
},_getDeleteUrl:function(item){
var url=this.url;
if(item&&this.keyAttribute!==""){
var _962=this.getValue(item,this.keyAttribute);
if(_962){
var key=this.keyAttribute.charAt(0)==="@"?this.keyAttribute.substring(1):this.keyAttribute;
url+=url.indexOf("?")<0?"?":"&";
url+=key+"="+_962;
}
}
return url;
},_getPostContent:function(item){
var _965=item.element;
var _966="<?xml version=\"1.0\"?>";
return _966+dojox.data.dom.innerXML(_965);
},_getPutContent:function(item){
var _968=item.element;
var _969="<?xml version=\"1.0\"?>";
return _969+dojox.data.dom.innerXML(_968);
},_getAttribute:function(_96a,_96b){
if(this._attributeMap){
var key=_96a+"."+_96b;
var _96d=this._attributeMap[key];
if(_96d){
_96b=_96d;
}else{
_96d=this._attributeMap[_96b];
if(_96d){
_96b=_96d;
}
}
}
return _96b;
},_getItem:function(_96e){
return new dojox.data.XmlItem(_96e,this);
},_getItemIndex:function(_96f,_970){
for(var i=0;i<_96f.length;i++){
if(_96f[i].element===_970){
return i;
}
}
return -1;
},_backupItem:function(item){
var _973=this._getRootElement(item.element);
if(this._getItemIndex(this._newItems,_973)>=0||this._getItemIndex(this._modifiedItems,_973)>=0){
return;
}
if(_973!=item.element){
item=this._getItem(_973);
}
item._backup=_973.cloneNode(true);
this._modifiedItems.push(item);
},_restoreItems:function(_974){
dojo.forEach(_974,function(item){
if(item._backup){
item.element=item._backup;
item._backup=null;
}
},this);
},_forgetItem:function(item){
var _977=item.element;
var _978=this._getItemIndex(this._newItems,_977);
if(_978>=0){
this._newItems.splice(_978,1);
}
_978=this._getItemIndex(this._deletedItems,_977);
if(_978>=0){
this._deletedItems.splice(_978,1);
}
_978=this._getItemIndex(this._modifiedItems,_977);
if(_978>=0){
this._modifiedItems.splice(_978,1);
}
},_getDocument:function(_979){
if(_979){
return _979.ownerDocument;
}else{
if(!this._document){
return dojox.data.dom.createDocument();
}
}
},_getRootElement:function(_97a){
while(_97a.parentNode){
_97a=_97a.parentNode;
}
return _97a;
}});
dojo.declare("dojox.data.XmlItem",null,{constructor:function(_97b,_97c){
this.element=_97b;
this.store=_97c;
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
if(!dojo._hasResource["dojox.gfx.matrix"]){
dojo._hasResource["dojox.gfx.matrix"]=true;
dojo.provide("dojox.gfx.matrix");
(function(){
var m=dojox.gfx.matrix;
m._degToRad=function(_981){
return Math.PI*_981/180;
};
m._radToDeg=function(_982){
return _982/Math.PI*180;
};
m.Matrix2D=function(arg){
if(arg){
if(typeof arg=="number"){
this.xx=this.yy=arg;
}else{
if(arg instanceof Array){
if(arg.length>0){
var _984=m.normalize(arg[0]);
for(var i=1;i<arg.length;++i){
var l=_984,r=dojox.gfx.matrix.normalize(arg[i]);
_984=new m.Matrix2D();
_984.xx=l.xx*r.xx+l.xy*r.yx;
_984.xy=l.xx*r.xy+l.xy*r.yy;
_984.yx=l.yx*r.xx+l.yy*r.yx;
_984.yy=l.yx*r.xy+l.yy*r.yy;
_984.dx=l.xx*r.dx+l.xy*r.dy+l.dx;
_984.dy=l.yx*r.dx+l.yy*r.dy+l.dy;
}
dojo.mixin(this,_984);
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
},rotate:function(_98c){
var c=Math.cos(_98c);
var s=Math.sin(_98c);
return new m.Matrix2D({xx:c,xy:-s,yx:s,yy:c});
},rotateg:function(_98f){
return m.rotate(m._degToRad(_98f));
},skewX:function(_990){
return new m.Matrix2D({xy:Math.tan(_990)});
},skewXg:function(_991){
return m.skewX(m._degToRad(_991));
},skewY:function(_992){
return new m.Matrix2D({yx:Math.tan(_992)});
},skewYg:function(_993){
return m.skewY(m._degToRad(_993));
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
},normalize:function(_9a0){
return (_9a0 instanceof m.Matrix2D)?_9a0:new m.Matrix2D(_9a0);
},clone:function(_9a1){
var obj=new m.Matrix2D();
for(var i in _9a1){
if(typeof (_9a1[i])=="number"&&typeof (obj[i])=="number"&&obj[i]!=_9a1[i]){
obj[i]=_9a1[i];
}
}
return obj;
},invert:function(_9a4){
var M=m.normalize(_9a4),D=M.xx*M.yy-M.xy*M.yx,M=new m.Matrix2D({xx:M.yy/D,xy:-M.xy/D,yx:-M.yx/D,yy:M.xx/D,dx:(M.xy*M.dy-M.yy*M.dx)/D,dy:(M.yx*M.dx-M.xx*M.dy)/D});
return M;
},_multiplyPoint:function(_9a7,x,y){
return {x:_9a7.xx*x+_9a7.xy*y+_9a7.dx,y:_9a7.yx*x+_9a7.yy*y+_9a7.dy};
},multiplyPoint:function(_9aa,a,b){
var M=m.normalize(_9aa);
if(typeof a=="number"&&typeof b=="number"){
return m._multiplyPoint(M,a,b);
}
return m._multiplyPoint(M,a.x,a.y);
},multiply:function(_9ae){
var M=m.normalize(_9ae);
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
},_sandwich:function(_9b3,x,y){
return m.multiply(m.translate(x,y),_9b3,m.translate(-x,-y));
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
},rotateAt:function(_9ba,a,b){
if(arguments.length>2){
return m._sandwich(m.rotate(_9ba),a,b);
}
return m._sandwich(m.rotate(_9ba),a.x,a.y);
},rotategAt:function(_9bd,a,b){
if(arguments.length>2){
return m._sandwich(m.rotateg(_9bd),a,b);
}
return m._sandwich(m.rotateg(_9bd),a.x,a.y);
},skewXAt:function(_9c0,a,b){
if(arguments.length>2){
return m._sandwich(m.skewX(_9c0),a,b);
}
return m._sandwich(m.skewX(_9c0),a.x,a.y);
},skewXgAt:function(_9c3,a,b){
if(arguments.length>2){
return m._sandwich(m.skewXg(_9c3),a,b);
}
return m._sandwich(m.skewXg(_9c3),a.x,a.y);
},skewYAt:function(_9c6,a,b){
if(arguments.length>2){
return m._sandwich(m.skewY(_9c6),a,b);
}
return m._sandwich(m.skewY(_9c6),a.x,a.y);
},skewYgAt:function(_9c9,a,b){
if(arguments.length>2){
return m._sandwich(m.skewYg(_9c9),a,b);
}
return m._sandwich(m.skewYg(_9c9),a.x,a.y);
}});
})();
dojox.gfx.Matrix2D=dojox.gfx.matrix.Matrix2D;
}
if(!dojo._hasResource["dojox.gfx._base"]){
dojo._hasResource["dojox.gfx._base"]=true;
dojo.provide("dojox.gfx._base");
(function(){
var g=dojox.gfx,b=g._base;
g._hasClass=function(node,_9cf){
return ((" "+node.getAttribute("className")+" ").indexOf(" "+_9cf+" ")>=0);
};
g._addClass=function(node,_9d1){
var cls=node.getAttribute("className");
if((" "+cls+" ").indexOf(" "+_9d1+" ")<0){
node.setAttribute("className",cls+(cls?" ":"")+_9d1);
}
};
g._removeClass=function(node,_9d4){
node.setAttribute("className",node.getAttribute("className").replace(new RegExp("(^|\\s+)"+_9d4+"(\\s+|$)"),"$1$2"));
};
b._getFontMeasurements=function(){
var _9d5={"1em":0,"1ex":0,"100%":0,"12pt":0,"16px":0,"xx-small":0,"x-small":0,"small":0,"medium":0,"large":0,"x-large":0,"xx-large":0};
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
for(var p in _9d5){
div.style.fontSize=p;
_9d5[p]=Math.round(div.offsetHeight*12/16)*16/12/1000;
}
dojo.body().removeChild(div);
div=null;
return _9d5;
};
var _9d8=null;
b._getCachedFontMeasurements=function(_9d9){
if(_9d9||!_9d8){
_9d8=b._getFontMeasurements();
}
return _9d8;
};
var _9da=null,_9db={};
b._getTextBox=function(text,_9dd,_9de){
var m;
if(!_9da){
m=_9da=dojo.doc.createElement("div");
m.style.position="absolute";
m.style.left="-10000px";
m.style.top="0";
dojo.body().appendChild(m);
}else{
m=_9da;
}
m.className="";
m.style.border="0";
m.style.margin="0";
m.style.padding="0";
m.style.outline="0";
if(arguments.length>1&&_9dd){
for(var i in _9dd){
if(i in _9db){
continue;
}
m.style[i]=_9dd[i];
}
}
if(arguments.length>2&&_9de){
m.className=_9de;
}
m.innerHTML=text;
return dojo.marginBox(m);
};
var _9e1=0;
b._getUniqueId=function(){
var id;
do{
id=dojo._scopeName+"Unique"+(++_9e1);
}while(dojo.byId(id));
return id;
};
})();
dojo.mixin(dojox.gfx,{defaultPath:{type:"path",path:""},defaultPolyline:{type:"polyline",points:[]},defaultRect:{type:"rect",x:0,y:0,width:100,height:100,r:0},defaultEllipse:{type:"ellipse",cx:0,cy:0,rx:200,ry:100},defaultCircle:{type:"circle",cx:0,cy:0,r:100},defaultLine:{type:"line",x1:0,y1:0,x2:100,y2:100},defaultImage:{type:"image",x:0,y:0,width:0,height:0,src:""},defaultText:{type:"text",x:0,y:0,text:"",align:"start",decoration:"none",rotated:false,kerning:true},defaultTextPath:{type:"textpath",text:"",align:"start",decoration:"none",rotated:false,kerning:true},defaultStroke:{type:"stroke",color:"black",style:"solid",width:1,cap:"butt",join:4},defaultLinearGradient:{type:"linear",x1:0,y1:0,x2:100,y2:100,colors:[{offset:0,color:"black"},{offset:1,color:"white"}]},defaultRadialGradient:{type:"radial",cx:0,cy:0,r:100,colors:[{offset:0,color:"black"},{offset:1,color:"white"}]},defaultPattern:{type:"pattern",x:0,y:0,width:0,height:0,src:""},defaultFont:{type:"font",style:"normal",variant:"normal",weight:"normal",size:"10pt",family:"serif"},normalizeColor:function(_9e3){
return (_9e3 instanceof dojo.Color)?_9e3:new dojo.Color(_9e3);
},normalizeParameters:function(_9e4,_9e5){
if(_9e5){
var _9e6={};
for(var x in _9e4){
if(x in _9e5&&!(x in _9e6)){
_9e4[x]=_9e5[x];
}
}
}
return _9e4;
},makeParameters:function(_9e8,_9e9){
if(!_9e9){
return dojo.clone(_9e8);
}
var _9ea={};
for(var i in _9e8){
if(!(i in _9ea)){
_9ea[i]=dojo.clone((i in _9e9)?_9e9[i]:_9e8[i]);
}
}
return _9ea;
},formatNumber:function(x,_9ed){
var val=x.toString();
if(val.indexOf("e")>=0){
val=x.toFixed(4);
}else{
var _9ef=val.indexOf(".");
if(_9ef>=0&&val.length-_9ef>5){
val=x.toFixed(4);
}
}
if(x<0){
return val;
}
return _9ed?" "+val:val;
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
var _9f9=dojox.gfx.px_in_pt();
var val=parseFloat(len);
switch(len.slice(-2)){
case "px":
return val;
case "pt":
return val*_9f9;
case "in":
return val*72*_9f9;
case "pc":
return val*12*_9f9;
case "mm":
return val*dojox.gfx.mm_in_pt*_9f9;
case "cm":
return val*dojox.gfx.cm_in_pt*_9f9;
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
var gfx=dojo.getObject("dojox.gfx",true),sl,flag,_a00;
if(!gfx.renderer){
var _a01=(typeof dojo.config.gfxRenderer=="string"?dojo.config.gfxRenderer:"svg,vml,silverlight,canvas").split(",");
var ua=navigator.userAgent,_a03=0,_a04=0;
if(dojo.isSafari>=3){
if(ua.indexOf("iPhone")>=0||ua.indexOf("iPod")>=0){
_a00=ua.match(/Version\/(\d(\.\d)?(\.\d)?)\sMobile\/([^\s]*)\s?/);
if(_a00){
_a03=parseInt(_a00[4].substr(0,3),16);
}
}
if(!_a03){
_a00=ua.match(/Android\s+(\d+\.\d+)/);
if(_a00){
_a04=parseFloat(_a00[1]);
}
}
}
for(var i=0;i<_a01.length;++i){
switch(_a01[i]){
case "svg":
if(!dojo.isIE&&(!_a03||_a03>=1521)&&!_a04){
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
var _a07={"1em":0,"1ex":0,"100%":0,"12pt":0,"16px":0,"xx-small":0,"x-small":0,"small":0,"medium":0,"large":0,"x-large":0,"xx-large":0};
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
for(var p in _a07){
ds.fontSize=p;
_a07[p]=Math.round(div.offsetHeight*12/16)*16/12/1000;
}
dojo.body().removeChild(div);
div=null;
return _a07;
};
var _a0b=null;
dhm.getCachedFontMeasurements=function(_a0c){
if(_a0c||!_a0b){
_a0b=dhm.getFontMeasurements();
}
return _a0b;
};
var _a0d=null,_a0e={};
dhm.getTextBox=function(text,_a10,_a11){
var m;
if(!_a0d){
m=_a0d=dojo.doc.createElement("div");
m.style.position="absolute";
m.style.left="-10000px";
m.style.top="0";
dojo.body().appendChild(m);
}else{
m=_a0d;
}
m.className="";
m.style.border="0";
m.style.margin="0";
m.style.padding="0";
m.style.outline="0";
if(arguments.length>1&&_a10){
for(var i in _a10){
if(i in _a0e){
continue;
}
m.style[i]=_a10[i];
}
}
if(arguments.length>2&&_a11){
m.className=_a11;
}
m.innerHTML=text;
return dojo.marginBox(m);
};
var _a14={w:16,h:16};
dhm.getScrollbar=function(){
return {w:_a14.w,h:_a14.h};
};
dhm._fontResizeNode=null;
dhm.initOnFontResize=function(_a15){
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
_a14.w=n.offsetWidth-n.clientWidth;
_a14.h=n.offsetHeight-n.clientHeight;
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
dgu.setStyleHeightPx=function(_a1e,_a1f){
if(_a1f>=0){
var s=_a1e.style;
var v=_a1f+"px";
if(_a1e&&s["height"]!=v){
s["height"]=v;
}
}
};
dgu.mouseEvents=["mouseover","mouseout","mousedown","mouseup","click","dblclick","contextmenu"];
dgu.keyEvents=["keyup","keydown","keypress"];
dgu.funnelEvents=function(_a22,_a23,_a24,_a25){
var evts=(_a25?_a25:dgu.mouseEvents.concat(dgu.keyEvents));
for(var i=0,l=evts.length;i<l;i++){
_a23.connect(_a22,"on"+evts[i],_a24);
}
},dgu.removeNode=function(_a29){
_a29=dojo.byId(_a29);
_a29&&_a29.parentNode&&_a29.parentNode.removeChild(_a29);
return _a29;
};
dgu.arrayCompare=function(inA,inB){
for(var i=0,l=inA.length;i<l;i++){
if(inA[i]!=inB[i]){
return false;
}
}
return (inA.length==inB.length);
};
dgu.arrayInsert=function(_a2e,_a2f,_a30){
if(_a2e.length<=_a2f){
_a2e[_a2f]=_a30;
}else{
_a2e.splice(_a2f,0,_a30);
}
};
dgu.arrayRemove=function(_a31,_a32){
_a31.splice(_a32,1);
};
dgu.arraySwap=function(_a33,inI,inJ){
var _a36=_a33[inI];
_a33[inI]=_a33[inJ];
_a33[inJ]=_a36;
};
})();
}
if(!dojo._hasResource["dojox.grid._Scroller"]){
dojo._hasResource["dojox.grid._Scroller"]=true;
dojo.provide("dojox.grid._Scroller");
(function(){
var _a37=function(_a38){
var i=0,n,p=_a38.parentNode;
while((n=p.childNodes[i++])){
if(n==_a38){
return i-1;
}
}
return -1;
};
var _a3c=function(_a3d){
if(!_a3d){
return;
}
var _a3e=function(inW){
return inW.domNode&&dojo.isDescendant(inW.domNode,_a3d,true);
};
var ws=dijit.registry.filter(_a3e);
for(var i=0,w;(w=ws[i]);i++){
w.destroy();
}
delete ws;
};
var _a43=function(_a44){
var node=dojo.byId(_a44);
return (node&&node.tagName?node.tagName.toLowerCase():"");
};
var _a46=function(_a47,_a48){
var _a49=[];
var i=0,n;
while((n=_a47.childNodes[i++])){
if(_a43(n)==_a48){
_a49.push(n);
}
}
return _a49;
};
var _a4c=function(_a4d){
return _a46(_a4d,"div");
};
dojo.declare("dojox.grid._Scroller",null,{constructor:function(_a4e){
this.setContentNodes(_a4e);
this.pageHeights=[];
this.pageNodes=[];
this.stack=[];
},rowCount:0,defaultRowHeight:32,keepRows:100,contentNode:null,scrollboxNode:null,defaultPageHeight:0,keepPages:10,pageCount:0,windowHeight:0,firstVisibleRow:0,lastVisibleRow:0,averageRowHeight:0,page:0,pageTop:0,init:function(_a4f,_a50,_a51){
switch(arguments.length){
case 3:
this.rowsPerPage=_a51;
case 2:
this.keepRows=_a50;
case 1:
this.rowCount=_a4f;
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
},_getPageCount:function(_a52,_a53){
return _a52?(Math.ceil(_a52/_a53)||1):0;
},destroy:function(){
this.invalidateNodes();
delete this.contentNodes;
delete this.contentNode;
delete this.scrollboxNode;
},setKeepInfo:function(_a54){
this.keepRows=_a54;
this.keepPages=!this.keepRows?this.keepRows:Math.max(Math.ceil(this.keepRows/this.rowsPerPage),2);
},setContentNodes:function(_a55){
this.contentNodes=_a55;
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
},updateRowCount:function(_a57){
this.invalidateNodes();
this.rowCount=_a57;
var _a58=this.pageCount;
this.pageCount=this._getPageCount(this.rowCount,this.rowsPerPage);
if(this.pageCount<_a58){
for(var i=_a58-1;i>=this.pageCount;i--){
this.height-=this.getPageHeight(i);
delete this.pageHeights[i];
}
}else{
if(this.pageCount>_a58){
this.height+=this.defaultPageHeight*(this.pageCount-_a58-1)+this.calcLastPageHeight();
}
}
this.resize();
},pageExists:function(_a5a){
return Boolean(this.getDefaultPageNode(_a5a));
},measurePage:function(_a5b){
var n=this.getDefaultPageNode(_a5b);
return (n&&n.innerHTML)?n.offsetHeight:0;
},positionPage:function(_a5d,_a5e){
for(var i=0;i<this.colCount;i++){
this.pageNodes[i][_a5d].style.top=_a5e+"px";
}
},repositionPages:function(_a60){
var _a61=this.getDefaultNodes();
var last=0;
for(var i=0;i<this.stack.length;i++){
last=Math.max(this.stack[i],last);
}
var n=_a61[_a60];
var y=(n?this.getPageNodePosition(n)+this.getPageHeight(_a60):0);
for(var p=_a60+1;p<=last;p++){
n=_a61[p];
if(n){
if(this.getPageNodePosition(n)==y){
return;
}
this.positionPage(p,y);
}
y+=this.getPageHeight(p);
}
},installPage:function(_a67){
for(var i=0;i<this.colCount;i++){
this.contentNodes[i].appendChild(this.pageNodes[i][_a67]);
}
},preparePage:function(_a69,_a6a,_a6b){
var p=(_a6b?this.popPage():null);
for(var i=0;i<this.colCount;i++){
var _a6e=this.pageNodes[i];
var _a6f=(p===null?this.createPageNode():this.invalidatePageNode(p,_a6e));
_a6f.pageIndex=_a69;
_a6f.id=(this._pageIdPrefix||"")+"page-"+_a69;
_a6e[_a69]=_a6f;
}
},renderPage:function(_a70){
var _a71=[];
for(var i=0;i<this.colCount;i++){
_a71[i]=this.pageNodes[i][_a70];
}
for(var i=0,j=_a70*this.rowsPerPage;(i<this.rowsPerPage)&&(j<this.rowCount);i++,j++){
this.renderRow(j,_a71);
}
},removePage:function(_a74){
for(var i=0,j=_a74*this.rowsPerPage;i<this.rowsPerPage;i++,j++){
this.removeRow(j);
}
},destroyPage:function(_a77){
for(var i=0;i<this.colCount;i++){
var n=this.invalidatePageNode(_a77,this.pageNodes[i]);
if(n){
dojo._destroyElement(n);
}
}
},pacify:function(_a7a){
},pacifying:false,pacifyTicks:200,setPacifying:function(_a7b){
if(this.pacifying!=_a7b){
this.pacifying=_a7b;
this.pacify(this.pacifying);
}
},startPacify:function(){
this.startPacifyTicks=new Date().getTime();
},doPacify:function(){
var _a7c=(new Date().getTime()-this.startPacifyTicks)>this.pacifyTicks;
this.setPacifying(true);
this.startPacify();
return _a7c;
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
var _a7e=(this.page<this.pageCount-1)?this.rowsPerPage:(this.rowCount%this.rowsPerPage);
var _a7f=this.getPageHeight(this.page);
this.averageRowHeight=(_a7f>0&&_a7e>0)?(_a7f/_a7e):0;
},calcLastPageHeight:function(){
if(!this.pageCount){
return 0;
}
var _a80=this.pageCount-1;
var _a81=((this.rowCount%this.rowsPerPage)||(this.rowsPerPage))*this.defaultRowHeight;
this.pageHeights[_a80]=_a81;
return _a81;
},updateContentHeight:function(inDh){
this.height+=inDh;
this.resize();
},updatePageHeight:function(_a83){
if(this.pageExists(_a83)){
var oh=this.getPageHeight(_a83);
var h=(this.measurePage(_a83))||(oh);
this.pageHeights[_a83]=h;
if((h)&&(oh!=h)){
this.updateContentHeight(h-oh);
this.repositionPages(_a83);
}
}
},rowHeightChanged:function(_a86){
this.updatePageHeight(Math.floor(_a86/this.rowsPerPage));
},invalidateNodes:function(){
while(this.stack.length){
this.destroyPage(this.popPage());
}
},createPageNode:function(){
var p=document.createElement("div");
p.style.position="absolute";
p.style[dojo._isBodyLtr()?"left":"right"]="0";
return p;
},getPageHeight:function(_a88){
var ph=this.pageHeights[_a88];
return (ph!==undefined?ph:this.defaultPageHeight);
},pushPage:function(_a8a){
return this.stack.push(_a8a);
},popPage:function(){
return this.stack.shift();
},findPage:function(_a8b){
var i=0,h=0;
for(var ph=0;i<this.pageCount;i++,h+=ph){
ph=this.getPageHeight(i);
if(h+ph>=_a8b){
break;
}
}
this.page=i;
this.pageTop=h;
},buildPage:function(_a8f,_a90,_a91){
this.preparePage(_a8f,_a90);
this.positionPage(_a8f,_a91);
this.installPage(_a8f);
this.renderPage(_a8f);
this.pushPage(_a8f);
},needPage:function(_a92,_a93){
var h=this.getPageHeight(_a92),oh=h;
if(!this.pageExists(_a92)){
this.buildPage(_a92,this.keepPages&&(this.stack.length>=this.keepPages),_a93);
h=this.measurePage(_a92)||h;
this.pageHeights[_a92]=h;
if(h&&(oh!=h)){
this.updateContentHeight(h-oh);
}
}else{
this.positionPage(_a92,_a93);
}
return h;
},onscroll:function(){
this.scroll(this.scrollboxNode.scrollTop);
},scroll:function(_a96){
this.grid.scrollTop=_a96;
if(this.colCount){
this.startPacify();
this.findPage(_a96);
var h=this.height;
var b=this.getScrollBottom(_a96);
for(var p=this.page,y=this.pageTop;(p<this.pageCount)&&((b<0)||(y<b));p++){
y+=this.needPage(p,y);
}
this.firstVisibleRow=this.getFirstVisibleRow(this.page,this.pageTop,_a96);
this.lastVisibleRow=this.getLastVisibleRow(p-1,y,b);
if(h!=this.height){
this.repositionPages(p-1);
}
this.endPacify();
}
},getScrollBottom:function(_a9b){
return (this.windowHeight>=0?_a9b+this.windowHeight:-1);
},processNodeEvent:function(e,_a9d){
var t=e.target;
while(t&&(t!=_a9d)&&t.parentNode&&(t.parentNode.parentNode!=_a9d)){
t=t.parentNode;
}
if(!t||!t.parentNode||(t.parentNode.parentNode!=_a9d)){
return false;
}
var page=t.parentNode;
e.topRowIndex=page.pageIndex*this.rowsPerPage;
e.rowIndex=e.topRowIndex+_a37(t);
e.rowTarget=t;
return true;
},processEvent:function(e){
return this.processNodeEvent(e,this.contentNode);
},renderRow:function(_aa1,_aa2){
},removeRow:function(_aa3){
},getDefaultPageNode:function(_aa4){
return this.getDefaultNodes()[_aa4];
},positionPageNode:function(_aa5,_aa6){
},getPageNodePosition:function(_aa7){
return _aa7.offsetTop;
},invalidatePageNode:function(_aa8,_aa9){
var p=_aa9[_aa8];
if(p){
delete _aa9[_aa8];
this.removePage(_aa8,p);
_a3c(p);
p.innerHTML="";
}
return p;
},getPageRow:function(_aab){
return _aab*this.rowsPerPage;
},getLastPageRow:function(_aac){
return Math.min(this.rowCount,this.getPageRow(_aac+1))-1;
},getFirstVisibleRow:function(_aad,_aae,_aaf){
if(!this.pageExists(_aad)){
return 0;
}
var row=this.getPageRow(_aad);
var _ab1=this.getDefaultNodes();
var rows=_a4c(_ab1[_aad]);
for(var i=0,l=rows.length;i<l&&_aae<_aaf;i++,row++){
_aae+=rows[i].offsetHeight;
}
return (row?row-1:row);
},getLastVisibleRow:function(_ab5,_ab6,_ab7){
if(!this.pageExists(_ab5)){
return 0;
}
var _ab8=this.getDefaultNodes();
var row=this.getLastPageRow(_ab5);
var rows=_a4c(_ab8[_ab5]);
for(var i=rows.length-1;i>=0&&_ab6>_ab7;i--,row--){
_ab6-=rows[i].offsetHeight;
}
return row+1;
},findTopRow:function(_abc){
var _abd=this.getDefaultNodes();
var rows=_a4c(_abd[this.page]);
for(var i=0,l=rows.length,t=this.pageTop,h;i<l;i++){
h=rows[i].offsetHeight;
t+=h;
if(t>=_abc){
this.offset=h-(t-_abc);
return i+this.page*this.rowsPerPage;
}
}
return -1;
},findScrollTop:function(_ac3){
var _ac4=Math.floor(_ac3/this.rowsPerPage);
var t=0;
for(var i=0;i<_ac4;i++){
t+=this.getPageHeight(i);
}
this.pageTop=t;
this.needPage(_ac4,this.pageTop);
var _ac7=this.getDefaultNodes();
var rows=_a4c(_ac7[_ac4]);
var r=_ac3-this.rowsPerPage*_ac4;
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
var _acb=function(_acc){
try{
dojox.grid.util.fire(_acc,"focus");
dojox.grid.util.fire(_acc,"select");
}
catch(e){
}
};
var _acd=function(){
setTimeout(dojo.hitch.apply(dojo,arguments),0);
};
var dgc=dojox.grid.cells;
dojo.declare("dojox.grid.cells._Base",null,{styles:"",classes:"",editable:false,alwaysEditing:false,formatter:null,defaultValue:"...",value:null,hidden:false,_valueProp:"value",_formatPending:false,constructor:function(_acf){
this._props=_acf||{};
dojo.mixin(this,_acf);
},format:function(_ad0,_ad1){
var f,i=this.grid.edit.info,d=this.get?this.get(_ad0,_ad1):(this.value||this.defaultValue);
if(this.editable&&(this.alwaysEditing||(i.rowIndex==_ad0&&i.cell==this))){
return this.formatEditing(d,_ad0);
}else{
var v=(d!=this.defaultValue&&(f=this.formatter))?f.call(this,d,_ad0):d;
return (typeof v=="undefined"?this.defaultValue:v);
}
},formatEditing:function(_ad6,_ad7){
},getNode:function(_ad8){
return this.view.getCellNode(_ad8,this.index);
},getHeaderNode:function(){
return this.view.getHeaderCellNode(this.index);
},getEditNode:function(_ad9){
return (this.getNode(_ad9)||0).firstChild||0;
},canResize:function(){
var uw=this.unitWidth;
return uw&&(uw=="auto");
},isFlex:function(){
var uw=this.unitWidth;
return uw&&(uw=="auto"||uw.slice(-1)=="%");
},applyEdit:function(_adc,_add){
this.grid.edit.applyCellEdit(_adc,this,_add);
},cancelEdit:function(_ade){
this.grid.doCancelEdit(_ade);
},_onEditBlur:function(_adf){
if(this.grid.edit.isEditCell(_adf,this.index)){
this.grid.edit.apply();
}
},registerOnBlur:function(_ae0,_ae1){
if(this.commitOnBlur){
dojo.connect(_ae0,"onblur",function(e){
setTimeout(dojo.hitch(this,"_onEditBlur",_ae1),250);
});
}
},needFormatNode:function(_ae3,_ae4){
this._formatPending=true;
_acd(this,"_formatNode",_ae3,_ae4);
},cancelFormatNode:function(){
this._formatPending=false;
},_formatNode:function(_ae5,_ae6){
if(this._formatPending){
this._formatPending=false;
dojo.setSelectable(this.grid.domNode,true);
this.formatNode(this.getEditNode(_ae6),_ae5,_ae6);
}
},formatNode:function(_ae7,_ae8,_ae9){
if(dojo.isIE){
_acd(this,"focus",_ae9,_ae7);
}else{
this.focus(_ae9,_ae7);
}
},dispatchEvent:function(m,e){
if(m in this){
return this[m](e);
}
},getValue:function(_aec){
return this.getEditNode(_aec)[this._valueProp];
},setValue:function(_aed,_aee){
var n=this.getEditNode(_aed);
if(n){
n[this._valueProp]=_aee;
}
},focus:function(_af0,_af1){
_acb(_af1||this.getEditNode(_af0));
},save:function(_af2){
this.value=this.value||this.getValue(_af2);
},restore:function(_af3){
this.setValue(_af3,this.value);
},_finish:function(_af4){
dojo.setSelectable(this.grid.domNode,false);
this.cancelFormatNode();
},apply:function(_af5){
this.applyEdit(this.getValue(_af5),_af5);
this._finish(_af5);
},cancel:function(_af6){
this.cancelEdit(_af6);
this._finish(_af6);
}});
dgc._Base.markupFactory=function(node,_af8){
var d=dojo;
var _afa=d.trim(d.attr(node,"formatter")||"");
if(_afa){
_af8.formatter=dojo.getObject(_afa);
}
var get=d.trim(d.attr(node,"get")||"");
if(get){
_af8.get=dojo.getObject(get);
}
var _afc=d.trim(d.attr(node,"sortDesc")||"");
if(_afc){
_af8.sortDesc=!(_afc.toLowerCase()=="false");
}
var _afd=d.trim(d.attr(node,"loadingText")||d.attr(node,"defaultValue")||"");
if(_afd){
_af8.defaultValue=_afd;
}
var _afe=d.trim(d.attr(node,"editable")||"");
if(_afe){
_af8.editable=!(_afe.toLowerCase()=="false");
}
var _aff=d.trim(d.attr(node,"alwaysEditing")||"");
if(_aff){
_af8.alwaysEditing=!(_aff.toLowerCase()=="false");
}
var _b00=d.trim(d.attr(node,"styles")||"");
if(_b00){
_af8.styles=_b00;
}
var _b01=d.trim(d.attr(node,"classes")||"");
if(_b01){
_af8.classes=_b01;
}
};
dojo.declare("dojox.grid.cells.Cell",dgc._Base,{constructor:function(){
this.keyFilter=this.keyFilter;
},keyFilter:null,formatEditing:function(_b02,_b03){
this.needFormatNode(_b02,_b03);
return "<input class=\"dojoxGridInput\" type=\"text\" value=\""+_b02+"\">";
},formatNode:function(_b04,_b05,_b06){
this.inherited(arguments);
this.registerOnBlur(_b04,_b06);
},doKey:function(e){
if(this.keyFilter){
var key=String.fromCharCode(e.charCode);
if(key.search(this.keyFilter)==-1){
dojo.stopEvent(e);
}
}
},_finish:function(_b09){
this.inherited(arguments);
var n=this.getEditNode(_b09);
try{
dojox.grid.util.fire(n,"blur");
}
catch(e){
}
}});
dgc.Cell.markupFactory=function(node,_b0c){
dgc._Base.markupFactory(node,_b0c);
var d=dojo;
var _b0e=d.trim(d.attr(node,"keyFilter")||"");
if(_b0e){
_b0c.keyFilter=new RegExp(_b0e);
}
};
dojo.declare("dojox.grid.cells.RowIndex",dgc.Cell,{name:"Row",postscript:function(){
this.editable=false;
},get:function(_b0f){
return _b0f+1;
}});
dgc.RowIndex.markupFactory=function(node,_b11){
dgc.Cell.markupFactory(node,_b11);
};
dojo.declare("dojox.grid.cells.Select",dgc.Cell,{options:null,values:null,returnIndex:-1,constructor:function(_b12){
this.values=this.values||this.options;
},formatEditing:function(_b13,_b14){
this.needFormatNode(_b13,_b14);
var h=["<select class=\"dojoxGridSelect\">"];
for(var i=0,o,v;((o=this.options[i])!==undefined)&&((v=this.values[i])!==undefined);i++){
h.push("<option",(_b13==v?" selected":"")," value=\""+v+"\"",">",o,"</option>");
}
h.push("</select>");
return h.join("");
},getValue:function(_b19){
var n=this.getEditNode(_b19);
if(n){
var i=n.selectedIndex,o=n.options[i];
return this.returnIndex>-1?i:o.value||o.innerHTML;
}
}});
dgc.Select.markupFactory=function(node,cell){
dgc.Cell.markupFactory(node,cell);
var d=dojo;
var _b20=d.trim(d.attr(node,"options")||"");
if(_b20){
var o=_b20.split(",");
if(o[0]!=_b20){
cell.options=o;
}
}
var _b22=d.trim(d.attr(node,"values")||"");
if(_b22){
var v=_b22.split(",");
if(v[0]!=_b22){
cell.values=v;
}
}
};
dojo.declare("dojox.grid.cells.AlwaysEdit",dgc.Cell,{alwaysEditing:true,_formatNode:function(_b24,_b25){
this.formatNode(this.getEditNode(_b25),_b24,_b25);
},applyStaticValue:function(_b26){
var e=this.grid.edit;
e.applyCellEdit(this.getValue(_b26),this,_b26);
e.start(this,_b26,true);
}});
dgc.AlwaysEdit.markupFactory=function(node,cell){
dgc.Cell.markupFactory(node,cell);
};
dojo.declare("dojox.grid.cells.Bool",dgc.AlwaysEdit,{_valueProp:"checked",formatEditing:function(_b2a,_b2b){
return "<input class=\"dojoxGridInput\" type=\"checkbox\""+(_b2a?" checked=\"checked\"":"")+" style=\"width: auto\" />";
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
var _b2f="gridRowIndex";
var _b30="gridView";
var _b31=function(td){
return td.cellIndex>=0?td.cellIndex:dojo.indexOf(td.parentNode.cells,td);
};
var _b33=function(tr){
return tr.rowIndex>=0?tr.rowIndex:dojo.indexOf(tr.parentNode.childNodes,tr);
};
var _b35=function(_b36,_b37){
return _b36&&((_b36.rows||0)[_b37]||_b36.childNodes[_b37]);
};
var _b38=function(node){
for(var n=node;n&&n.tagName!="TABLE";n=n.parentNode){
}
return n;
};
var _b3b=function(_b3c,_b3d){
for(var n=_b3c;n&&_b3d(n);n=n.parentNode){
}
return n;
};
var _b3f=function(_b40){
var name=_b40.toUpperCase();
return function(node){
return node.tagName!=name;
};
};
var _b43=function(_b44,_b45){
return _b44.style.cssText==undefined?_b44.getAttribute("style"):_b44.style.cssText;
};
var _b46=function(view){
if(view){
this.view=view;
this.grid=view.grid;
}
};
dojo.extend(_b46,{view:null,_table:"<table class=\"dojoxGridRowTable\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"wairole:presentation\"",getTableArray:function(){
var html=[this._table];
if(this.view.viewWidth){
html.push([" style=\"width:",this.view.viewWidth,";\""].join(""));
}
html.push(">");
return html;
},generateCellMarkup:function(_b49,_b4a,_b4b,_b4c){
var _b4d=[],html;
if(_b4c){
html=["<th tabIndex=\"-1\" role=\"wairole:columnheader\""];
}else{
html=["<td tabIndex=\"-1\" role=\"wairole:gridcell\""];
}
_b49.colSpan&&html.push(" colspan=\"",_b49.colSpan,"\"");
_b49.rowSpan&&html.push(" rowspan=\"",_b49.rowSpan,"\"");
html.push(" class=\"dojoxGridCell ");
_b49.classes&&html.push(_b49.classes," ");
_b4b&&html.push(_b4b," ");
_b4d.push(html.join(""));
_b4d.push("");
html=["\" idx=\"",_b49.index,"\" style=\""];
if(_b4a&&_b4a[_b4a.length-1]!=";"){
_b4a+=";";
}
html.push(_b49.styles,_b4a||"",_b49.hidden?"display:none;":"");
_b49.unitWidth&&html.push("width:",_b49.unitWidth,";");
_b4d.push(html.join(""));
_b4d.push("");
html=["\""];
_b49.attrs&&html.push(" ",_b49.attrs);
html.push(">");
_b4d.push(html.join(""));
_b4d.push("");
_b4d.push("</td>");
return _b4d;
},isCellNode:function(_b4f){
return Boolean(_b4f&&_b4f!=dojo.doc&&dojo.attr(_b4f,"idx"));
},getCellNodeIndex:function(_b50){
return _b50?Number(dojo.attr(_b50,"idx")):-1;
},getCellNode:function(_b51,_b52){
for(var i=0,row;row=_b35(_b51.firstChild,i);i++){
for(var j=0,cell;cell=row.cells[j];j++){
if(this.getCellNodeIndex(cell)==_b52){
return cell;
}
}
}
},findCellTarget:function(_b57,_b58){
var n=_b57;
while(n&&(!this.isCellNode(n)||(n.offsetParent&&_b30 in n.offsetParent.parentNode&&n.offsetParent.parentNode[_b30]!=this.view.id))&&(n!=_b58)){
n=n.parentNode;
}
return n!=_b58?n:null;
},baseDecorateEvent:function(e){
e.dispatch="do"+e.type;
e.grid=this.grid;
e.sourceView=this.view;
e.cellNode=this.findCellTarget(e.target,e.rowNode);
e.cellIndex=this.getCellNodeIndex(e.cellNode);
e.cell=(e.cellIndex>=0?this.grid.getCell(e.cellIndex):null);
},findTarget:function(_b5b,_b5c){
var n=_b5b;
while(n&&(n!=this.domNode)&&(!(_b5c in n)||(_b30 in n&&n[_b30]!=this.view.id))){
n=n.parentNode;
}
return (n!=this.domNode)?n:null;
},findRowTarget:function(_b5e){
return this.findTarget(_b5e,_b2f);
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
var _b66=function(view){
_b46.call(this,view);
};
_b66.prototype=new _b46();
dojo.extend(_b66,{update:function(){
this.prepareHtml();
},prepareHtml:function(){
var _b68=this.grid.get,_b69=this.view.structure.cells;
for(var j=0,row;(row=_b69[j]);j++){
for(var i=0,cell;(cell=row[i]);i++){
cell.get=cell.get||(cell.value==undefined)&&_b68;
cell.markup=this.generateCellMarkup(cell,cell.cellStyles,cell.cellClasses,false);
}
}
},generateHtml:function(_b6e,_b6f){
var html=this.getTableArray(),v=this.view,_b72=v.structure.cells,item=this.grid.getItem(_b6f);
dojox.grid.util.fire(this.view,"onBeforeRow",[_b6f,_b72]);
for(var j=0,row;(row=_b72[j]);j++){
if(row.hidden||row.header){
continue;
}
html.push(!row.invisible?"<tr>":"<tr class=\"dojoxGridInvisible\">");
for(var i=0,cell,m,cc,cs;(cell=row[i]);i++){
m=cell.markup,cc=cell.customClasses=[],cs=cell.customStyles=[];
m[5]=cell.format(_b6f,item);
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
e.rowIndex=e.rowNode[_b2f];
this.baseDecorateEvent(e);
e.cell=this.grid.getCell(e.cellIndex);
return true;
}});
var _b7c=null;
var _b7d=function(view){
_b46.call(this,view);
};
_b7d.prototype=new _b46();
dojo.extend(_b7d,{_skipBogusClicks:false,overResizeWidth:4,minColWidth:1,update:function(){
this.tableMap=new _b7f(this.view.structure.cells);
},generateHtml:function(_b80,_b81){
var html=this.getTableArray(),_b83=this.view.structure.cells;
dojox.grid.util.fire(this.view,"onBeforeRow",[-1,_b83]);
for(var j=0,row;(row=_b83[j]);j++){
if(row.hidden){
continue;
}
html.push(!row.invisible?"<tr>":"<tr class=\"dojoxGridInvisible\">");
for(var i=0,cell,_b88;(cell=row[i]);i++){
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
_b88=this.generateCellMarkup(cell,cell.headerStyles,cell.headerClasses,true);
_b88[5]=(_b81!=undefined?_b81:_b80(cell));
_b88[3]=cell.customStyles.join(";");
_b88[1]=cell.customClasses.join(" ");
html.push(_b88.join(""));
}
html.push("</tr>");
}
html.push("</table>");
return html.join("");
},getCellX:function(e){
var x=e.layerX;
if(dojo.isMoz){
var n=_b3b(e.target,_b3f("th"));
x-=(n&&n.offsetLeft)||0;
var t=e.sourceView.getScrollbarWidth();
if(!dojo._isBodyLtr()&&e.sourceView.headerNode.scrollLeft<t){
x-=t;
}
}
var n=_b3b(e.target,function(){
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
var i=_b31(e.cellNode);
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
if(!_b7c){
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
if(!_b7c){
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
var m=_b7c=new dojo.dnd.Moveable(this.moverDiv);
var _b9d=[],_b9e=this.tableMap.findOverlappingNodes(e.cellNode);
for(var i=0,cell;(cell=_b9e[i]);i++){
_b9d.push({node:cell,index:this.getCellNodeIndex(cell),width:cell.offsetWidth});
}
var view=e.sourceView;
var adj=dojo._isBodyLtr()?1:-1;
var _ba3=e.grid.views.views;
var _ba4=[];
for(var i=view.idx+adj,_ba5;(_ba5=_ba3[i]);i=i+adj){
_ba4.push({node:_ba5.headerNode,left:window.parseInt(_ba5.headerNode.style.left)});
}
var _ba6=view.headerContentNode.firstChild;
var drag={scrollLeft:e.sourceView.headerNode.scrollLeft,view:view,node:e.cellNode,index:e.cellIndex,w:dojo.contentBox(e.cellNode).w,vw:dojo.contentBox(view.headerNode).w,table:_ba6,tw:dojo.contentBox(_ba6).w,spanners:_b9d,followers:_ba4};
m.onMove=dojo.hitch(this,"doResizeColumn",drag);
dojo.connect(m,"onMoveStop",dojo.hitch(this,function(){
this.endResizeColumn(drag);
if(drag.node.releaseCapture){
drag.node.releaseCapture();
}
_b7c.destroy();
delete _b7c;
_b7c=null;
}));
view.convertColPctToFixed();
if(e.cellNode.setCapture){
e.cellNode.setCapture();
}
m.onMouseDown(e);
},doResizeColumn:function(_ba8,_ba9,_baa){
var _bab=dojo._isBodyLtr();
var _bac=_bab?_baa.l:-_baa.l;
var w=_ba8.w+_bac;
var vw=_ba8.vw+_bac;
var tw=_ba8.tw+_bac;
if(w>=this.minColWidth){
for(var i=0,s,sw;(s=_ba8.spanners[i]);i++){
sw=s.width+_bac;
s.node.style.width=sw+"px";
_ba8.view.setColWidth(s.index,sw);
}
for(var i=0,f,fl;(f=_ba8.followers[i]);i++){
fl=f.left+_bac;
f.node.style.left=fl+"px";
}
_ba8.node.style.width=w+"px";
_ba8.view.setColWidth(_ba8.index,w);
_ba8.view.headerNode.style.width=vw+"px";
_ba8.view.setColumnsWidth(tw);
if(!_bab){
_ba8.view.headerNode.scrollLeft=_ba8.scrollLeft+_bac;
}
}
if(_ba8.view.flexCells&&!_ba8.view.testFlexCells()){
var t=_b38(_ba8.node);
t&&(t.style.width="");
}
},endResizeColumn:function(_bb6){
dojo._destroyElement(this.moverDiv);
delete this.moverDiv;
this._skipBogusClicks=true;
var conn=dojo.connect(_bb6.view,"update",this,function(){
dojo.disconnect(conn);
this._skipBogusClicks=false;
});
setTimeout(dojo.hitch(_bb6.view,"update"),50);
}});
var _b7f=function(rows){
this.mapRows(rows);
};
dojo.extend(_b7f,{map:null,mapRows:function(_bb9){
var _bba=_bb9.length;
if(!_bba){
return;
}
this.map=[];
for(var j=0,row;(row=_bb9[j]);j++){
this.map[j]=[];
}
for(var j=0,row;(row=_bb9[j]);j++){
for(var i=0,x=0,cell,_bc0,_bc1;(cell=row[i]);i++){
while(this.map[j][x]){
x++;
}
this.map[j][x]={c:i,r:j};
_bc1=cell.rowSpan||1;
_bc0=cell.colSpan||1;
for(var y=0;y<_bc1;y++){
for(var s=0;s<_bc0;s++){
this.map[j+y][x+s]=this.map[j][x];
}
}
x+=_bc0;
}
}
},dumpMap:function(){
for(var j=0,row,h="";(row=this.map[j]);j++,h=""){
for(var i=0,cell;(cell=row[i]);i++){
h+=cell.r+","+cell.c+"   ";
}
}
},getMapCoords:function(_bc9,_bca){
for(var j=0,row;(row=this.map[j]);j++){
for(var i=0,cell;(cell=row[i]);i++){
if(cell.c==_bca&&cell.r==_bc9){
return {j:j,i:i};
}
}
}
return {j:-1,i:-1};
},getNode:function(_bcf,_bd0,_bd1){
var row=_bcf&&_bcf.rows[_bd0];
return row&&row.cells[_bd1];
},_findOverlappingNodes:function(_bd3,_bd4,_bd5){
var _bd6=[];
var m=this.getMapCoords(_bd4,_bd5);
var row=this.map[m.j];
for(var j=0,row;(row=this.map[j]);j++){
if(j==m.j){
continue;
}
var rw=row[m.i];
var n=(rw?this.getNode(_bd3,rw.r,rw.c):null);
if(n){
_bd6.push(n);
}
}
return _bd6;
},findOverlappingNodes:function(_bdc){
return this._findOverlappingNodes(_b38(_bdc),_b33(_bdc.parentNode),_b31(_bdc));
}});
dojo.declare("dojox.grid._View",[dijit._Widget,dijit._Templated],{defaultWidth:"18em",viewWidth:"",templateString:"<div class=\"dojoxGridView\">\r\n\t<div class=\"dojoxGridHeader\" dojoAttachPoint=\"headerNode\">\r\n\t\t<div dojoAttachPoint=\"headerNodeContainer\" style=\"width:9000em\">\r\n\t\t\t<div dojoAttachPoint=\"headerContentNode\"></div>\r\n\t\t</div>\r\n\t</div>\r\n\t<input type=\"checkbox\" class=\"dojoxGridHiddenFocus\" dojoAttachPoint=\"hiddenFocusNode\" />\r\n\t<input type=\"checkbox\" class=\"dojoxGridHiddenFocus\" />\r\n\t<div class=\"dojoxGridScrollbox\" dojoAttachPoint=\"scrollboxNode\">\r\n\t\t<div class=\"dojoxGridContent\" dojoAttachPoint=\"contentNode\" hidefocus=\"hidefocus\"></div>\r\n\t</div>\r\n</div>\r\n",themeable:false,classTag:"dojoxGrid",marginBottom:0,rowPad:2,_togglingColumn:-1,postMixInProperties:function(){
this.rowNodes=[];
},postCreate:function(){
this.connect(this.scrollboxNode,"onscroll","doscroll");
dojox.grid.util.funnelEvents(this.contentNode,this,"doContentEvent",["mouseover","mouseout","click","dblclick","contextmenu","mousedown"]);
dojox.grid.util.funnelEvents(this.headerNode,this,"doHeaderEvent",["dblclick","mouseover","mouseout","mousemove","mousedown","click","contextmenu"]);
this.content=new _b66(this);
this.header=new _b7d(this);
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
//this.scrollboxNode.focus();
}
},setStructure:function(_bdd){
var vs=this.structure=_bdd;
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
var _be3=this.hasVScrollbar();
var _be4=dojo.style(this.scrollboxNode,"overflow");
if(this.noscroll||!_be4||_be4=="hidden"){
_be3=false;
}else{
if(_be4=="scroll"){
_be3=true;
}
}
return (_be3?dojox.html.metrics.getScrollbar().w:0);
},getColumnsWidth:function(){
return this.headerContentNode.firstChild.offsetWidth;
},setColumnsWidth:function(_be5){
this.headerContentNode.firstChild.style.width=_be5+"px";
if(this.viewWidth){
this.viewWidth=_be5+"px";
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
var _be6=this.grid.layout.cells;
var _be7=dojo.hitch(this,function(node,_be9){
var inc=_be9?-1:1;
var idx=this.header.getCellNodeIndex(node)+inc;
var cell=_be6[idx];
while(cell&&cell.getHeaderNode()&&cell.getHeaderNode().style.display=="none"){
idx+=inc;
cell=_be6[idx];
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
if((this.header.overRightResizeArea(e)||this.header.overLeftResizeArea(e))&&this.header.canResize(e)&&!_b7c){
this.header.beginColumnResize(e);
}else{
if(this.grid.headerMenu){
this.grid.headerMenu.onCancel(true);
}
if(e.button===(dojo.isIE?1:0)){
dojo.dnd.Source.prototype.onMouseDown.call(this.source,e);
}
}
}),_markTargetAnchor:dojo.hitch(this,function(_bee){
var src=this.source;
if(src.current==src.targetAnchor&&src.before==_bee){
return;
}
if(src.targetAnchor&&_be7(src.targetAnchor,src.before)){
src._removeItemClass(_be7(src.targetAnchor,src.before),src.before?"After":"Before");
}
dojo.dnd.Source.prototype._markTargetAnchor.call(src,_bee);
if(src.targetAnchor&&_be7(src.targetAnchor,src.before)){
src._addItemClass(_be7(src.targetAnchor,src.before),src.before?"After":"Before");
}
}),_unmarkTargetAnchor:dojo.hitch(this,function(){
var src=this.source;
if(!src.targetAnchor){
return;
}
if(src.targetAnchor&&_be7(src.targetAnchor,src.before)){
src._removeItemClass(_be7(src.targetAnchor,src.before),src.before?"After":"Before");
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
},_onDndDropBefore:function(_bf1,_bf2,copy){
if(dojo.dnd.manager().target!==this.source){
return;
}
this.source._targetNode=this.source.targetAnchor;
this.source._beforeTarget=this.source.before;
var _bf4=this.grid.views.views;
var _bf5=_bf4[_bf1.viewIndex];
var _bf6=_bf4[this.index];
if(_bf6!=_bf5){
var s=_bf5.convertColPctToFixed();
var t=_bf6.convertColPctToFixed();
if(s||t){
setTimeout(function(){
_bf5.update();
_bf6.update();
},50);
}
}
},_onDndDrop:function(_bf9,_bfa,copy){
if(dojo.dnd.manager().target!==this.source){
if(dojo.dnd.manager().source===this.source){
this._removingColumn=true;
}
return;
}
var _bfc=function(n){
return n?dojo.attr(n,"idx"):null;
};
var w=dojo.marginBox(_bfa[0]).w;
if(_bf9.viewIndex!==this.index){
var _bff=this.grid.views.views;
var _c00=_bff[_bf9.viewIndex];
var _c01=_bff[this.index];
if(_c00.viewWidth&&_c00.viewWidth!="auto"){
_c00.setColumnsWidth(_c00.getColumnsWidth()-w);
}
if(_c01.viewWidth&&_c01.viewWidth!="auto"){
_c01.setColumnsWidth(_c01.getColumnsWidth());
}
}
var stn=this.source._targetNode;
var stb=this.source._beforeTarget;
var _c04=this.grid.layout;
var idx=this.index;
delete this.source._targetNode;
delete this.source._beforeTarget;
window.setTimeout(function(){
_c04.moveColumn(_bf9.viewIndex,idx,_bfc(_bfa[0]),_bfc(stn),stb);
},1);
},renderHeader:function(){
this.headerContentNode.innerHTML=this.header.generateHtml(this._getHeaderContent);
if(this.flexCells){
this.contentWidth=this.getContentWidth();
this.headerContentNode.firstChild.style.width=this.contentWidth;
}
},_getHeaderContent:function(_c06){
var n=_c06.name||_c06.grid.getCellName(_c06);
var ret=["<div class=\"dojoxGridSortNode"];
if(_c06.index!=_c06.grid.getSortIndex()){
ret.push("\">");
}else{
ret=ret.concat([" ",_c06.grid.sortInfo>0?"dojoxGridSortUp":"dojoxGridSortDown","\"><div class=\"dojoxGridArrowButtonChar\">",_c06.grid.sortInfo>0?"&#9650;":"&#9660;","</div><div class=\"dojoxGridArrowButtonNode\"></div>"]);
}
ret=ret.concat([n,"</div>"]);
return ret.join("");
},resize:function(){
this.adaptHeight();
this.adaptWidth();
},hasHScrollbar:function(_c09){
if(this._hasHScroll==undefined||_c09){
if(this.noscroll){
this._hasHScroll=false;
}else{
var _c0a=dojo.style(this.scrollboxNode,"overflow");
if(_c0a=="hidden"){
this._hasHScroll=false;
}else{
if(_c0a=="scroll"){
this._hasHScroll=true;
}else{
this._hasHScroll=(this.scrollboxNode.offsetWidth<this.contentNode.offsetWidth);
}
}
}
}
return this._hasHScroll;
},hasVScrollbar:function(_c0b){
if(this._hasVScroll==undefined||_c0b){
if(this.noscroll){
this._hasVScroll=false;
}else{
var _c0c=dojo.style(this.scrollboxNode,"overflow");
if(_c0c=="hidden"){
this._hasVScroll=false;
}else{
if(_c0c=="scroll"){
this._hasVScroll=true;
}else{
this._hasVScroll=(this.scrollboxNode.offsetHeight<this.contentNode.offsetHeight);
}
}
}
}
return this._hasVScroll;
},convertColPctToFixed:function(){
var _c0d=false;
var _c0e=dojo.query("th",this.headerContentNode);
var _c0f=dojo.map(_c0e,function(c){
var w=c.style.width;
if(w&&w.slice(-1)=="%"){
_c0d=true;
return dojo.contentBox(c).w;
}else{
if(w&&w.slice(-2)=="px"){
return window.parseInt(w,10);
}
}
return -1;
});
if(_c0d){
dojo.forEach(this.grid.layout.cells,function(cell,idx){
if(cell.view==this){
var vIdx=cell.layoutIndex;
this.setColWidth(idx,_c0f[vIdx]);
_c0e[vIdx].style.width=cell.unitWidth;
}
},this);
return true;
}
return false;
},adaptHeight:function(_c15){
if(!this.grid._autoHeight){
var h=this.domNode.clientHeight;
if(_c15){
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
},renderRow:function(_c1d){
var _c1e=this.createRowNode(_c1d);
this.buildRow(_c1d,_c1e);
this.grid.edit.restore(this,_c1d);
if(this._pendingUpdate){
window.clearTimeout(this._pendingUpdate);
}
this._pendingUpdate=window.setTimeout(dojo.hitch(this,function(){
window.clearTimeout(this._pendingUpdate);
delete this._pendingUpdate;
this.grid._resize();
}),50);
return _c1e;
},createRowNode:function(_c1f){
var node=document.createElement("div");
node.className=this.classTag+"Row";
node[_b30]=this.id;
node[_b2f]=_c1f;
this.rowNodes[_c1f]=node;
return node;
},buildRow:function(_c21,_c22){
this.buildRowContent(_c21,_c22);
this.styleRow(_c21,_c22);
},buildRowContent:function(_c23,_c24){
_c24.innerHTML=this.content.generateHtml(_c23,_c23);
if(this.flexCells&&this.contentWidth){
_c24.firstChild.style.width=this.contentWidth;
}
},rowRemoved:function(_c25){
this.grid.edit.save(this,_c25);
delete this.rowNodes[_c25];
},getRowNode:function(_c26){
return this.rowNodes[_c26];
},getCellNode:function(_c27,_c28){
var row=this.getRowNode(_c27);
if(row){
return this.content.getCellNode(row,_c28);
}
},getHeaderCellNode:function(_c2a){
if(this.headerContentNode){
return this.header.getCellNode(this.headerContentNode,_c2a);
}
},styleRow:function(_c2b,_c2c){
_c2c._style=_b43(_c2c);
this.styleRowNode(_c2b,_c2c);
},styleRowNode:function(_c2d,_c2e){
if(_c2e){
this.doStyleRowNode(_c2d,_c2e);
}
},doStyleRowNode:function(_c2f,_c30){
this.grid.styleRowNode(_c2f,_c30);
},updateRow:function(_c31){
var _c32=this.getRowNode(_c31);
if(_c32){
_c32.style.height="";
this.buildRow(_c31,_c32);
}
return _c32;
},updateRowStyles:function(_c33){
this.styleRowNode(_c33,this.getRowNode(_c33));
},lastTop:0,firstScroll:0,doscroll:function(_c34){
var _c35=dojo._isBodyLtr();
if(this.firstScroll<2){
if((!_c35&&this.firstScroll==1)||(_c35&&this.firstScroll==0)){
var s=dojo.marginBox(this.headerNodeContainer);
if(dojo.isIE){
this.headerNodeContainer.style.width=s.w+this.getScrollbarWidth()+"px";
}else{
if(dojo.isMoz){
this.headerNodeContainer.style.width=s.w-this.getScrollbarWidth()+"px";
this.scrollboxNode.scrollLeft=_c35?this.scrollboxNode.clientWidth-this.scrollboxNode.scrollWidth:this.scrollboxNode.scrollWidth-this.scrollboxNode.clientWidth;
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
},setScrollTop:function(_c38){
this.lastTop=_c38;
this.scrollboxNode.scrollTop=_c38;
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
},setColWidth:function(_c3d,_c3e){
this.grid.setCellWidth(_c3d,_c3e+"px");
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
var _c46=this.manager.source,node;
if(_c46.creator){
node=_c46._normailzedCreator(_c46.getItem(this.manager.nodes[0].id).data,"avatar").node;
}else{
node=this.manager.nodes[0].cloneNode(true);
if(node.tagName.toLowerCase()=="tr"){
var _c48=dd.createElement("table"),_c49=dd.createElement("tbody");
_c49.appendChild(node);
_c48.appendChild(_c49);
node=_c48;
}else{
if(node.tagName.toLowerCase()=="th"){
var _c48=dd.createElement("table"),_c49=dd.createElement("tbody"),r=dd.createElement("tr");
_c48.cellPadding=_c48.cellSpacing="0";
r.appendChild(node);
_c49.appendChild(r);
_c48.appendChild(_c49);
node=_c48;
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
var _c4c=dojo.dnd.manager().makeAvatar;
dojo.dnd.manager().makeAvatar=function(){
var src=this.source;
if(src.viewIndex!==undefined){
return new dojox.grid._GridAvatar(this);
}
return _c4c.call(dojo.dnd.manager());
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
},buildRowContent:function(_c4e,_c4f){
var w=this.contentNode.offsetWidth-this.padBorderWidth;
_c4f.innerHTML="<table class=\"dojoxGridRowbarTable\" style=\"width:"+w+"px;\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"wairole:presentation\"><tr><td class=\"dojoxGridRowbarInner\">&nbsp;</td></tr></table>";
},renderHeader:function(){
},resize:function(){
this.adaptHeight();
},adaptWidth:function(){
},doStyleRowNode:function(_c51,_c52){
var n=["dojoxGridRowbar"];
if(this.grid.rows.isOver(_c51)){
n.push("dojoxGridRowbarOver");
}
if(this.grid.selection.isSelected(_c51)){
n.push("dojoxGridRowbarSelected");
}
_c52.className=n.join(" ");
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
dojo.declare("dojox.grid._Layout",null,{constructor:function(_c56){
this.grid=_c56;
},cells:[],structure:null,defaultWidth:"6em",moveColumn:function(_c57,_c58,_c59,_c5a,_c5b){
var _c5c=this.structure[_c57].cells[0];
var _c5d=this.structure[_c58].cells[0];
var cell=null;
var _c5f=0;
var _c60=0;
for(var i=0,c;c=_c5c[i];i++){
if(c.index==_c59){
_c5f=i;
break;
}
}
cell=_c5c.splice(_c5f,1)[0];
cell.view=this.grid.views.views[_c58];
for(i=0,c=null;c=_c5d[i];i++){
if(c.index==_c5a){
_c60=i;
break;
}
}
if(!_c5b){
_c60+=1;
}
_c5d.splice(_c60,0,cell);
var _c63=this.grid.getCell(this.grid.getSortIndex());
if(_c63){
_c63._currentlySorted=this.grid.getSortAsc();
}
this.cells=[];
var _c59=0;
for(var i=0,v;v=this.structure[i];i++){
for(var j=0,cs;cs=v.cells[j];j++){
for(var k=0,c;c=cs[k];k++){
c.index=_c59;
this.cells.push(c);
if("_currentlySorted" in c){
var si=_c59+1;
si*=c._currentlySorted?1:-1;
this.grid.sortInfo=si;
delete c._currentlySorted;
}
_c59++;
}
}
}
this.grid.setupHeaderMenu();
},setColumnVisibility:function(_c69,_c6a){
var cell=this.cells[_c69];
if(cell.hidden==_c6a){
cell.hidden=!_c6a;
var v=cell.view,w=v.viewWidth;
if(w&&w!="auto"){
v._togglingColumn=dojo.marginBox(cell.getHeaderNode()).w||0;
}
v.update();
return true;
}else{
return false;
}
},addCellDef:function(_c6e,_c6f,_c70){
var self=this;
var _c72=function(_c73){
var w=0;
if(_c73.colSpan>1){
w=0;
}else{
if(!isNaN(_c73.width)){
w=_c73.width+"em";
}else{
w=_c73.width||self.defaultWidth;
}
}
return w;
};
var _c75={grid:this.grid,subrow:_c6e,layoutIndex:_c6f,index:this.cells.length};
if(_c70&&_c70 instanceof dojox.grid.cells._Base){
var _c76=dojo.clone(_c70);
_c75.unitWidth=_c72(_c76._props);
_c76=dojo.mixin(_c76,this._defaultCellProps,_c70._props,_c75);
return _c76;
}
var _c77=_c70.type||this._defaultCellProps.type||dojox.grid.cells.Cell;
_c75.unitWidth=_c72(_c70);
return new _c77(dojo.mixin({},this._defaultCellProps,_c70,_c75));
},addRowDef:function(_c78,_c79){
var _c7a=[];
var _c7b=0,_c7c=0,_c7d=true;
for(var i=0,def,cell;(def=_c79[i]);i++){
cell=this.addCellDef(_c78,i,def);
_c7a.push(cell);
this.cells.push(cell);
if(_c7d&&cell.relWidth){
_c7b+=cell.relWidth;
}else{
if(cell.width){
var w=cell.width;
if(typeof w=="string"&&w.slice(-1)=="%"){
_c7c+=window.parseInt(w,10);
}else{
if(w=="auto"){
_c7d=false;
}
}
}
}
}
if(_c7b&&_c7d){
dojo.forEach(_c7a,function(cell){
if(cell.relWidth){
cell.width=cell.unitWidth=((cell.relWidth/_c7b)*(100-_c7c))+"%";
}
});
}
return _c7a;
},addRowsDef:function(_c83){
var _c84=[];
if(dojo.isArray(_c83)){
if(dojo.isArray(_c83[0])){
for(var i=0,row;_c83&&(row=_c83[i]);i++){
_c84.push(this.addRowDef(i,row));
}
}else{
_c84.push(this.addRowDef(0,_c83));
}
}
return _c84;
},addViewDef:function(_c87){
this._defaultCellProps=_c87.defaultCell||{};
return dojo.mixin({},_c87,{cells:this.addRowsDef(_c87.rows||_c87.cells)});
},setStructure:function(_c88){
this.fieldIndex=0;
this.cells=[];
var s=this.structure=[];
if(this.grid.rowSelector){
var sel={type:dojox._scopeName+".grid._RowSelector"};
if(dojo.isString(this.grid.rowSelector)){
var _c8b=this.grid.rowSelector;
if(_c8b=="false"){
sel=null;
}else{
if(_c8b!="true"){
sel["width"]=_c8b;
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
var _c8c=function(def){
return ("name" in def||"field" in def||"get" in def);
};
var _c8e=function(def){
if(dojo.isArray(def)){
if(dojo.isArray(def[0])||_c8c(def[0])){
return true;
}
}
return false;
};
var _c90=function(def){
return (def!=null&&dojo.isObject(def)&&("cells" in def||"rows" in def||("type" in def&&!_c8c(def))));
};
if(dojo.isArray(_c88)){
var _c92=false;
for(var i=0,st;(st=_c88[i]);i++){
if(_c90(st)){
_c92=true;
break;
}
}
if(!_c92){
s.push(this.addViewDef({cells:_c88}));
}else{
for(var i=0,st;(st=_c88[i]);i++){
if(_c8e(st)){
s.push(this.addViewDef({cells:st}));
}else{
if(_c90(st)){
s.push(this.addViewDef(st));
}
}
}
}
}else{
if(_c90(_c88)){
s.push(this.addViewDef(_c88));
}
}
this.cellCount=this.cells.length;
this.grid.setupHeaderMenu();
}});
}
if(!dojo._hasResource["dojox.grid._ViewManager"]){
dojo._hasResource["dojox.grid._ViewManager"]=true;
dojo.provide("dojox.grid._ViewManager");
dojo.declare("dojox.grid._ViewManager",null,{constructor:function(_c95){
this.grid=_c95;
},defaultWidth:200,views:[],resize:function(){
this.onEach("resize");
},render:function(){
this.onEach("render");
},addView:function(_c96){
_c96.idx=this.views.length;
this.views.push(_c96);
},destroyViews:function(){
for(var i=0,v;v=this.views[i];i++){
v.destroy();
}
this.views=[];
},getContentNodes:function(){
var _c99=[];
for(var i=0,v;v=this.views[i];i++){
_c99.push(v.contentNode);
}
return _c99;
},forEach:function(_c9c){
for(var i=0,v;v=this.views[i];i++){
_c9c(v,i);
}
},onEach:function(_c9f,_ca0){
_ca0=_ca0||[];
for(var i=0,v;v=this.views[i];i++){
if(_c9f in v){
v[_c9f].apply(v,_ca0);
}
}
},normalizeHeaderNodeHeight:function(){
var _ca3=[];
for(var i=0,v;(v=this.views[i]);i++){
if(v.headerContentNode.firstChild){
_ca3.push(v.headerContentNode);
}
}
this.normalizeRowNodeHeights(_ca3);
},normalizeRowNodeHeights:function(_ca6){
var h=0;
for(var i=0,n,o;(n=_ca6[i]);i++){
h=Math.max(h,dojo.marginBox(n.firstChild).h);
}
h=(h>=0?h:0);
for(var i=0,n;(n=_ca6[i]);i++){
dojo.marginBox(n.firstChild,{h:h});
}
if(_ca6&&_ca6[0]&&_ca6[0].parentNode){
_ca6[0].parentNode.offsetHeight;
}
},resetHeaderNodeHeight:function(){
for(var i=0,v,n;(v=this.views[i]);i++){
n=v.headerContentNode.firstChild;
if(n){
n.style.height="";
}
}
},renormalizeRow:function(_cae){
var _caf=[];
for(var i=0,v,n;(v=this.views[i])&&(n=v.getRowNode(_cae));i++){
n.firstChild.style.height="";
_caf.push(n);
}
this.normalizeRowNodeHeights(_caf);
},getViewWidth:function(_cb3){
return this.views[_cb3].getWidth()||this.defaultWidth;
},measureHeader:function(){
this.resetHeaderNodeHeight();
this.forEach(function(_cb4){
_cb4.headerContentNode.style.height="";
});
var h=0;
this.forEach(function(_cb6){
h=Math.max(_cb6.headerNode.offsetHeight,h);
});
return h;
},measureContent:function(){
var h=0;
this.forEach(function(_cb8){
h=Math.max(_cb8.domNode.offsetHeight,h);
});
return h;
},findClient:function(_cb9){
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
var _cc4=function(v,l){
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
_cc4(v,l);
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
_cc4(v,r);
}
if(c<len){
v=this.views[c];
vw=Math.max(1,r-l);
v.setSize(vw+"px",0);
_cc4(v,l);
}
return l;
},renderRow:function(_ccb,_ccc){
var _ccd=[];
for(var i=0,v,n,_cd1;(v=this.views[i])&&(n=_ccc[i]);i++){
_cd1=v.renderRow(_ccb);
n.appendChild(_cd1);
_ccd.push(_cd1);
}
this.normalizeRowNodeHeights(_ccd);
},rowRemoved:function(_cd2){
this.onEach("rowRemoved",[_cd2]);
},updateRow:function(_cd3){
for(var i=0,v;v=this.views[i];i++){
v.updateRow(_cd3);
}
this.renormalizeRow(_cd3);
},updateRowStyles:function(_cd6){
this.onEach("updateRowStyles",[_cd6]);
},setScrollTop:function(_cd7){
var top=_cd7;
for(var i=0,v;v=this.views[i];i++){
top=v.setScrollTop(_cd7);
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
var _cdd=function(_cde,_cdf){
if(_cde.style.cssText==undefined){
_cde.setAttribute("style",_cdf);
}else{
_cde.style.cssText=_cdf;
}
};
dojo.declare("dojox.grid._RowManager",null,{constructor:function(_ce0){
this.grid=_ce0;
},linesToEms:2,overRow:-2,prepareStylingRow:function(_ce1,_ce2){
return {index:_ce1,node:_ce2,odd:Boolean(_ce1&1),selected:this.grid.selection.isSelected(_ce1),over:this.isOver(_ce1),customStyles:"",customClasses:"dojoxGridRow"};
},styleRowNode:function(_ce3,_ce4){
var row=this.prepareStylingRow(_ce3,_ce4);
this.grid.onStyleRow(row);
this.applyStyles(row);
},applyStyles:function(_ce6){
var i=_ce6;
i.node.className=i.customClasses;
var h=i.node.style.height;
_cdd(i.node,i.customStyles+";"+(i.node._style||""));
i.node.style.height=h;
},updateStyles:function(_ce9){
this.grid.updateRowStyles(_ce9);
},setOverRow:function(_cea){
var last=this.overRow;
this.overRow=_cea;
if((last!=this.overRow)&&(last>=0)){
this.updateStyles(last);
}
this.updateStyles(this.overRow);
},isOver:function(_cec){
return (this.overRow==_cec);
}});
})();
}
if(!dojo._hasResource["dojox.grid._FocusManager"]){
dojo._hasResource["dojox.grid._FocusManager"]=true;
dojo.provide("dojox.grid._FocusManager");
dojo.declare("dojox.grid._FocusManager",null,{constructor:function(_ced){
this.grid=_ced;
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
},isFocusCell:function(_cee,_cef){
return (this.cell==_cee)&&(this.rowIndex==_cef);
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
},_focusifyCellNode:function(_cf0){
var n=this.cell&&this.cell.getNode(this.rowIndex);
if(n){
dojo.toggleClass(n,this.focusClass,_cf0);
if(_cf0){
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
var _cf3=this._findHeaderCells();
for(var i=0;i<_cf3.length;i++){
this._connects.push(dojo.connect(_cf3[i],"onfocus",this,"doColHeaderFocus"));
this._connects.push(dojo.connect(_cf3[i],"onblur",this,"doColHeaderBlur"));
}
},_findHeaderCells:function(){
var _cf5=dojo.query("th",this.grid.viewsHeaderNode);
var _cf6=[];
for(var i=0;i<_cf5.length;i++){
var _cf8=_cf5[i];
var _cf9=dojo.hasAttr(_cf8,"tabindex");
var _cfa=dojo.attr(_cf8,"tabindex");
if(_cf9&&_cfa<0){
_cf6.push(_cf8);
}
}
return _cf6;
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
},_scrollInfo:function(cell,_cfe){
if(cell){
var cl=cell,sbn=cl.view.scrollboxNode,sbnr={w:sbn.clientWidth,l:sbn.scrollLeft,t:sbn.scrollTop,h:sbn.clientHeight},rn=cl.view.getRowNode(this.rowIndex);
return {c:cl,s:sbn,sr:sbnr,n:(_cfe?_cfe:cell.getNode(this.rowIndex)),r:rn};
}
return null;
},_scrollHeader:function(_d03){
var info=null;
if(this._colHeadNode){
info=this._scrollInfo(this.grid.getCell(_d03),this._colHeadNode);
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
},styleRow:function(_d05){
return;
},setFocusIndex:function(_d06,_d07){
this.setFocusCell(this.grid.getCell(_d07),_d06);
},setFocusCell:function(_d08,_d09){
if(_d08&&!this.isFocusCell(_d08,_d09)){
this.tabbingOut=false;
this._colHeadNode=null;
this.focusGridView();
this._focusifyCellNode(false);
this.cell=_d08;
this.rowIndex=_d09;
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
},move:function(_d10,_d11){
if(this.isNavHeader()){
var _d12=this._findHeaderCells();
var _d13=dojo.indexOf(_d12,this._colHeadNode);
_d13+=_d11;
if((_d13>=0)&&(_d13<_d12.length)){
this._colHeadNode=_d12[_d13];
this._colHeadNode.focus();
this._scrollHeader(_d13);
}
}else{
var rc=this.grid.rowCount-1,cc=this.grid.layout.cellCount-1,r=this.rowIndex,i=this.cell.index,row=Math.min(rc,Math.max(0,r+_d10)),col=Math.min(cc,Math.max(0,i+_d11));
this.setFocusIndex(row,col);
if(_d10){
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
},tabOut:function(_d1c){
this.tabbingOut=true;
_d1c.focus();
},focusGridView:function(){
dojox.grid.util.fire(this.focusView,"focus");
},focusGrid:function(_d1d){
this.focusGridView();
this._focusifyCellNode(true);
},focusHeader:function(){
var _d1e=this._findHeaderCells();
if(this.isNoFocusCell()){
this._colHeadNode=_d1e[0];
}else{
this._colHeadNode=_d1e[this.cell.index];
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
dojo.declare("dojox.grid._EditManager",null,{constructor:function(_d26){
this.grid=_d26;
this.connections=[];
if(dojo.isIE){
this.connections.push(dojo.connect(document.body,"onfocus",dojo.hitch(this,"_boomerangFocus")));
}
},info:{},destroy:function(){
dojo.forEach(this.connections,dojo.disconnect);
},cellFocus:function(_d27,_d28){
if(this.grid.singleClickEdit||this.isEditRow(_d28)){
this.setEditCell(_d27,_d28);
}else{
this.apply();
}
if(this.isEditing()||(_d27&&_d27.editable&&_d27.alwaysEditing)){
this._focusEditor(_d27,_d28);
}
},rowClick:function(e){
if(this.isEditing()&&!this.isEditRow(e.rowIndex)){
this.apply();
}
},styleRow:function(_d2a){
if(_d2a.index==this.info.rowIndex){
_d2a.customClasses+=" dojoxGridRowEditing";
}
},dispatchEvent:function(e){
var c=e.cell,ed=(c&&c["editable"])?c:0;
return ed&&ed.dispatchEvent(e.dispatch,e);
},isEditing:function(){
return this.info.rowIndex!==undefined;
},isEditCell:function(_d2e,_d2f){
return (this.info.rowIndex===_d2e)&&(this.info.cell.index==_d2f);
},isEditRow:function(_d30){
return this.info.rowIndex===_d30;
},setEditCell:function(_d31,_d32){
if(!this.isEditCell(_d32,_d31.index)&&this.grid.canEdit&&this.grid.canEdit(_d31,_d32)){
this.start(_d31,_d32,this.isEditRow(_d32)||_d31.editable);
}
},_focusEditor:function(_d33,_d34){
dojox.grid.util.fire(_d33,"focus",[_d34]);
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
},start:function(_d35,_d36,_d37){
this.grid.beginUpdate();
this.editorApply();
if(this.isEditing()&&!this.isEditRow(_d36)){
this.applyRowEdit();
this.grid.updateRow(_d36);
}
if(_d37){
this.info={cell:_d35,rowIndex:_d36};
this.grid.doStartEdit(_d35,_d36);
this.grid.updateRow(_d36);
}else{
this.info={};
}
this.grid.endUpdate();
this.grid.focus.focusGrid();
this._focusEditor(_d35,_d36);
this._doCatchBoomerang();
},_editorDo:function(_d38){
var c=this.info.cell;
c&&c.editable&&c[_d38](this.info.rowIndex);
},editorApply:function(){
this._editorDo("apply");
},editorCancel:function(){
this._editorDo("cancel");
},applyCellEdit:function(_d3a,_d3b,_d3c){
if(this.grid.canEdit(_d3b,_d3c)){
this.grid.doApplyCellEdit(_d3a,_d3c,_d3b.field);
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
},save:function(_d3d,_d3e){
var c=this.info.cell;
if(this.isEditRow(_d3d)&&(!_d3e||c.view==_d3e)&&c.editable){
c.save(c,this.info.rowIndex);
}
},restore:function(_d40,_d41){
var c=this.info.cell;
if(this.isEditRow(_d41)&&c.view==_d40&&c.editable){
c.restore(c,this.info.rowIndex);
}
}});
}
if(!dojo._hasResource["dojox.grid.Selection"]){
dojo._hasResource["dojox.grid.Selection"]=true;
dojo.provide("dojox.grid.Selection");
dojo.declare("dojox.grid.Selection",null,{constructor:function(_d43){
this.grid=_d43;
this.selected=[];
this.setMode(_d43.selectionMode);
},mode:"extended",selected:null,updating:0,selectedIndex:-1,setMode:function(mode){
if(this.selected.length){
this.deselectAll();
}
if(mode!="extended"&&mode!="multiple"&&mode!="single"&&mode!="none"){
this.mode="extended";
}else{
this.mode=mode;
}
},onCanSelect:function(_d45){
return this.grid.onCanSelect(_d45);
},onCanDeselect:function(_d46){
return this.grid.onCanDeselect(_d46);
},onSelected:function(_d47){
},onDeselected:function(_d48){
},onChanging:function(){
},onChanged:function(){
},isSelected:function(_d49){
if(this.mode=="none"){
return false;
}
return this.selected[_d49];
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
},getNextSelected:function(_d4c){
if(this.mode=="none"){
return -1;
}
for(var i=_d4c+1,l=this.selected.length;i<l;i++){
if(this.selected[i]){
return i;
}
}
return -1;
},getSelected:function(){
var _d4f=[];
for(var i=0,l=this.selected.length;i<l;i++){
if(this.selected[i]){
_d4f.push(i);
}
}
return _d4f;
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
},select:function(_d54){
if(this.mode=="none"){
return;
}
if(this.mode!="multiple"){
this.deselectAll(_d54);
this.addToSelection(_d54);
}else{
this.toggleSelect(_d54);
}
},addToSelection:function(_d55){
if(this.mode=="none"){
return;
}
_d55=Number(_d55);
if(this.selected[_d55]){
this.selectedIndex=_d55;
}else{
if(this.onCanSelect(_d55)!==false){
this.selectedIndex=_d55;
this._beginUpdate();
this.selected[_d55]=true;
this.onSelected(_d55);
this._endUpdate();
}
}
},deselect:function(_d56){
if(this.mode=="none"){
return;
}
_d56=Number(_d56);
if(this.selectedIndex==_d56){
this.selectedIndex=-1;
}
if(this.selected[_d56]){
if(this.onCanDeselect(_d56)===false){
return;
}
this._beginUpdate();
delete this.selected[_d56];
this.onDeselected(_d56);
this._endUpdate();
}
},setSelected:function(_d57,_d58){
this[(_d58?"addToSelection":"deselect")](_d57);
},toggleSelect:function(_d59){
this.setSelected(_d59,!this.selected[_d59]);
},_range:function(_d5a,inTo,func){
var s=(_d5a>=0?_d5a:inTo),e=inTo;
if(s>e){
e=s;
s=inTo;
}
for(var i=s;i<=e;i++){
func(i);
}
},selectRange:function(_d60,inTo){
this._range(_d60,inTo,dojo.hitch(this,"addToSelection"));
},deselectRange:function(_d62,inTo){
this._range(_d62,inTo,dojo.hitch(this,"deselect"));
},insert:function(_d64){
this.selected.splice(_d64,0,false);
if(this.selectedIndex>=_d64){
this.selectedIndex++;
}
},remove:function(_d65){
this.selected.splice(_d65,1);
if(this.selectedIndex>=_d65){
this.selectedIndex--;
}
},deselectAll:function(_d66){
for(var i in this.selected){
if((i!=_d66)&&(this.selected[i]===true)){
this.deselect(i);
}
}
},clickSelect:function(_d68,_d69,_d6a){
if(this.mode=="none"){
return;
}
this._beginUpdate();
if(this.mode!="extended"){
this.select(_d68);
}else{
var _d6b=this.selectedIndex;
if(!_d69){
this.deselectAll(_d68);
}
if(_d6a){
this.selectRange(_d6b,_d68);
}else{
if(_d69){
this.toggleSelect(_d68);
}else{
this.addToSelection(_d68);
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
},onStyleRow:function(_d70){
var i=_d70;
i.customClasses+=(i.odd?" dojoxGridRowOdd":"")+(i.selected?" dojoxGridRowSelected":"")+(i.over?" dojoxGridRowOver":"");
this.focus.styleRow(_d70);
this.edit.styleRow(_d70);
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
var _d74=this.edit.isEditing();
this.edit.apply();
if(!_d74){
this.edit.setEditCell(this.focus.cell,this.focus.rowIndex);
}
}
break;
case dk.SPACE:
if(!this.edit.isEditing()){
var _d75=this.focus.getHeaderIndex();
if(_d75>=0){
this.setSortIndex(_d75);
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
var _d76=(e.keyCode==dk.LEFT_ARROW)?1:-1;
if(dojo._isBodyLtr()){
_d76*=-1;
}
this.focus.move(0,_d76);
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
},onCellFocus:function(_d83,_d84){
this.edit.cellFocus(_d83,_d84);
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
},onStartEdit:function(_d96,_d97){
},onApplyCellEdit:function(_d98,_d99,_d9a){
},onCancelEdit:function(_d9b){
},onApplyEdit:function(_d9c){
},onCanSelect:function(_d9d){
return true;
},onCanDeselect:function(_d9e){
return true;
},onSelected:function(_d9f){
this.updateRowStyles(_d9f);
},onDeselected:function(_da0){
this.updateRowStyles(_da0);
},onSelectionChanged:function(){
}});
}
if(!dojo._hasResource["dojox.grid._Grid"]){
dojo._hasResource["dojox.grid._Grid"]=true;
dojo.provide("dojox.grid._Grid");
(function(){
var jobs={cancel:function(_da2){
if(_da2){
clearTimeout(_da2);
}
},jobs:[],job:function(_da3,_da4,_da5){
jobs.cancelJob(_da3);
var job=function(){
delete jobs.jobs[_da3];
_da5();
};
jobs.jobs[_da3]=setTimeout(job,_da4);
},cancelJob:function(_da7){
jobs.cancel(jobs.jobs[_da7]);
}};
dojo.declare("dojox.grid._Grid",[dijit._Widget,dijit._Templated,dojox.grid._Events],{templateString:"<div class=\"dojoxGrid\" hidefocus=\"hidefocus\" role=\"wairole:grid\" dojoAttachEvent=\"onmouseout:_mouseOut\">\r\n\t<div class=\"dojoxGridMasterHeader\" dojoAttachPoint=\"viewsHeaderNode\" tabindex=\"-1\"></div>\r\n\t<div class=\"dojoxGridMasterView\" dojoAttachPoint=\"viewsNode\"></div>\r\n\t<div class=\"dojoxGridMasterMessages\" style=\"display: none;\" dojoAttachPoint=\"messagesNode\"></div>\r\n\t<span dojoAttachPoint=\"lastFocusNode\" tabindex=\"0\"></span>\r\n</div>\r\n",classTag:"dojoxGrid",get:function(_da8){
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
var _da9=dojo.i18n.getLocalization("dijit","loading",this.lang);
this.loadingMessage=dojo.string.substitute(this.loadingMessage,_da9);
this.errorMessage=dojo.string.substitute(this.errorMessage,_da9);
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
},_setAutoHeightAttr:function(ah,_dac){
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
if(this._started&&!_dac){
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
},createView:function(_dae,idx){
var c=dojo.getObject(_dae);
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
},setStructure:function(_db4){
var s=_db4;
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
var item=new dijit.CheckedMenuItem({label:cell.name,checked:!cell.hidden,_gridCell:cell,onChange:function(_db9){
if(self.layout.setColumnVisibility(this._gridCell.index,_db9)){
var _dba=this._gridCell.menuItems;
if(_dba.length>1){
dojo.forEach(_dba,function(item){
if(item!==this){
item.setAttribute("checked",_db9);
}
},this);
}
var _db9=dojo.filter(self.layout.cells,function(c){
if(c.menuItems.length>1){
dojo.forEach(c.menuItems,"item.attr('disabled', false);");
}else{
c.menuItems[0].attr("disabled",false);
}
return !c.hidden;
});
if(_db9.length==1){
dojo.forEach(_db9[0].menuItems,"item.attr('disabled', true);");
}
}
},destroy:function(){
var _dbd=dojo.indexOf(this._gridCell.menuItems,this);
this._gridCell.menuItems.splice(_dbd,1);
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
},_fetch:function(_dc1){
this.setScrollTop(0);
},getItem:function(_dc2){
return null;
},showMessage:function(_dc3){
if(_dc3){
this.messagesNode.innerHTML=_dc3;
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
},resize:function(_dc4,_dc5){
var _dc6={};
dojo.mixin(_dc6,_dc5||{});
dojo.mixin(_dc6,_dc4||{});
this._sizeBox=_dc6;
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
var _dca=this._getPadBorder();
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
if(this.domNode.clientHeight<=_dca.h){
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
var _dd0=0,_dd1=0;
var _dd2=dojo.filter(this.views.views,function(v){
var has=v.hasHScrollbar();
if(has){
_dd0++;
}else{
_dd1++;
}
return (!has);
});
if(_dd0>0&&_dd1>0){
dojo.forEach(_dd2,function(v){
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
},renderRow:function(_dd7,_dd8){
this.views.renderRow(_dd7,_dd8);
},rowRemoved:function(_dd9){
this.views.rowRemoved(_dd9);
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
var _ddc=this.scrollTop;
this.prerender();
this.scroller.invalidateNodes();
this.setScrollTop(_ddc);
this.postrender();
},update:function(){
this.render();
},updateRow:function(_ddd){
_ddd=Number(_ddd);
if(this.updating){
this.invalidated[_ddd]=true;
}else{
this.views.updateRow(_ddd);
this.scroller.rowHeightChanged(_ddd);
}
},updateRows:function(_dde,_ddf){
_dde=Number(_dde);
_ddf=Number(_ddf);
if(this.updating){
for(var i=0;i<_ddf;i++){
this.invalidated[i+_dde]=true;
}
}else{
for(var i=0;i<_ddf;i++){
this.views.updateRow(i+_dde);
}
this.scroller.rowHeightChanged(_dde);
}
},updateRowCount:function(_de1){
if(this.updating){
this.invalidated.rowCount=_de1;
}else{
this.rowCount=_de1;
this._setAutoHeightAttr(this.autoHeight,true);
if(this.layout.cells.length){
this.scroller.updateRowCount(_de1);
}
this._resize();
if(this.layout.cells.length){
this.setScrollTop(this.scrollTop);
}
}
},updateRowStyles:function(_de2){
this.views.updateRowStyles(_de2);
},rowHeightChanged:function(_de3){
this.views.renormalizeRow(_de3);
this.scroller.rowHeightChanged(_de3);
},fastScroll:true,delayScroll:false,scrollRedrawThreshold:(dojo.isIE?100:50),scrollTo:function(_de4){
if(!this.fastScroll){
this.setScrollTop(_de4);
return;
}
var _de5=Math.abs(this.lastScrollTop-_de4);
this.lastScrollTop=_de4;
if(_de5>this.scrollRedrawThreshold||this.delayScroll){
this.delayScroll=true;
this.scrollTop=_de4;
this.views.setScrollTop(_de4);
jobs.job("dojoxGridScroll",200,dojo.hitch(this,"finishScrollJob"));
}else{
this.setScrollTop(_de4);
}
},finishScrollJob:function(){
this.delayScroll=false;
this.setScrollTop(this.scrollTop);
},setScrollTop:function(_de6){
this.scroller.scroll(this.views.setScrollTop(_de6));
},scrollToRow:function(_de7){
this.setScrollTop(this.scroller.findScrollTop(_de7)+1);
},styleRowNode:function(_de8,_de9){
if(_de9){
this.rows.styleRowNode(_de8,_de9);
}
},_mouseOut:function(e){
this.rows.setOverRow(-2);
},getCell:function(_deb){
return this.layout.cells[_deb];
},setCellWidth:function(_dec,_ded){
this.getCell(_dec).unitWidth=_ded;
},getCellName:function(_dee){
return "Cell "+_dee.index;
},canSort:function(_def){
},sort:function(){
},getSortAsc:function(_df0){
_df0=_df0==undefined?this.sortInfo:_df0;
return Boolean(_df0>0);
},getSortIndex:function(_df1){
_df1=_df1==undefined?this.sortInfo:_df1;
return Math.abs(_df1)-1;
},setSortIndex:function(_df2,_df3){
var si=_df2+1;
if(_df3!=undefined){
si*=(_df3?1:-1);
}else{
if(this.getSortIndex()==_df2){
si=-this.sortInfo;
}
}
this.setSortInfo(si);
},setSortInfo:function(_df5){
if(this.canSort(_df5)){
this.sortInfo=_df5;
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
},doStartEdit:function(_e03,_e04){
this.onStartEdit(_e03,_e04);
},doApplyCellEdit:function(_e05,_e06,_e07){
this.onApplyCellEdit(_e05,_e06,_e07);
},doCancelEdit:function(_e08){
this.onCancelEdit(_e08);
},doApplyEdit:function(_e09){
this.onApplyEdit(_e09);
},addRow:function(){
this.updateRowCount(this.rowCount+1);
},removeSelectedRows:function(){
this.updateRowCount(Math.max(0,this.rowCount-this.selection.getSelected().length));
this.selection.clear();
}});
dojox.grid._Grid.markupFactory=function(_e0a,node,ctor,_e0d){
var d=dojo;
var _e0f=function(n){
var w=d.attr(n,"width")||"auto";
if((w!="auto")&&(w.slice(-2)!="em")&&(w.slice(-1)!="%")){
w=parseInt(w)+"px";
}
return w;
};
if(!_e0a.structure&&node.nodeName.toLowerCase()=="table"){
_e0a.structure=d.query("> colgroup",node).map(function(cg){
var sv=d.attr(cg,"span");
var v={noscroll:(d.attr(cg,"noscroll")=="true")?true:false,__span:(!!sv?parseInt(sv):1),cells:[]};
if(d.hasAttr(cg,"width")){
v.width=_e0f(cg);
}
return v;
});
if(!_e0a.structure.length){
_e0a.structure.push({__span:Infinity,cells:[]});
}
d.query("thead > tr",node).forEach(function(tr,_e16){
var _e17=0;
var _e18=0;
var _e19;
var _e1a=null;
d.query("> th",tr).map(function(th){
if(!_e1a){
_e19=0;
_e1a=_e0a.structure[0];
}else{
if(_e17>=(_e19+_e1a.__span)){
_e18++;
_e19+=_e1a.__span;
lastView=_e1a;
_e1a=_e0a.structure[_e18];
}
}
var cell={name:d.trim(d.attr(th,"name")||th.innerHTML),colSpan:parseInt(d.attr(th,"colspan")||1,10),type:d.trim(d.attr(th,"cellType")||"")};
_e17+=cell.colSpan;
var _e1d=d.attr(th,"rowspan");
if(_e1d){
cell.rowSpan=_e1d;
}
if(d.hasAttr(th,"width")){
cell.width=_e0f(th);
}
if(d.hasAttr(th,"relWidth")){
cell.relWidth=window.parseInt(dojo.attr(th,"relWidth"),10);
}
if(d.hasAttr(th,"hidden")){
cell.hidden=d.attr(th,"hidden")=="true";
}
if(_e0d){
_e0d(th,cell);
}
cell.type=cell.type?dojo.getObject(cell.type):dojox.grid.cells.Cell;
if(cell.type&&cell.type.markupFactory){
cell.type.markupFactory(th,cell);
}
if(!_e1a.cells[_e16]){
_e1a.cells[_e16]=[];
}
_e1a.cells[_e16].push(cell);
});
});
}
return new ctor(_e0a,node);
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
},getNextSelected:function(_e1f){
var _e20=this.grid.getItemIndex(_e1f);
var idx=dojox.grid.Selection.prototype.getNextSelected.call(this,_e20);
if(idx==-1){
return null;
}
return this.grid.getItem(idx);
},getSelected:function(){
var _e22=[];
for(var i=0,l=this.selected.length;i<l;i++){
if(this.selected[i]){
_e22.push(this.grid.getItem(i));
}
}
return _e22;
},addToSelection:function(_e25){
if(this.mode=="none"){
return;
}
var idx=null;
if(typeof _e25=="number"||typeof _e25=="string"){
idx=_e25;
}else{
idx=this.grid.getItemIndex(_e25);
}
dojox.grid.Selection.prototype.addToSelection.call(this,idx);
},deselect:function(_e27){
if(this.mode=="none"){
return;
}
var idx=null;
if(typeof _e27=="number"||typeof _e27=="string"){
idx=_e27;
}else{
idx=this.grid.getItemIndex(_e27);
}
dojox.grid.Selection.prototype.deselect.call(this,idx);
},deselectAll:function(_e29){
var idx=null;
if(_e29||typeof _e29=="number"){
if(typeof _e29=="number"||typeof _e29=="string"){
idx=_e29;
}else{
idx=this.grid.getItemIndex(_e29);
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
},get:function(_e2b,_e2c){
return (!_e2c?this.defaultValue:(!this.field?this.value:this.grid.store.getValue(_e2c,this.field)));
},_onSet:function(item,_e2e,_e2f,_e30){
var idx=this.getItemIndex(item);
if(idx>-1){
this.updateRow(idx);
}
},_addItem:function(item,_e33,_e34){
var idty=this._hasIdentity?this.store.getIdentity(item):dojo.toJson(this.query)+":idx:"+_e33+":sort:"+dojo.toJson(this.getSortProps());
var o={idty:idty,item:item};
this._by_idty[idty]=this._by_idx[_e33]=o;
if(!_e34){
this.updateRow(_e33);
}
},_onNew:function(item,_e38){
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
},setStore:function(_e3c,_e3d,_e3e){
this._setQuery(_e3d,_e3e);
this._setStore(_e3c);
this._refresh(true);
},setQuery:function(_e3f,_e40){
this._setQuery(_e3f,_e40);
this._refresh(true);
},setItems:function(_e41){
this.items=_e41;
this._setStore(this.store);
this._refresh(true);
},_setQuery:function(_e42,_e43){
this.query=_e42||this.query;
this.queryOptions=_e43||this.queryOptions;
},_setStore:function(_e44){
if(this.store&&this._store_connects){
dojo.forEach(this._store_connects,function(arr){
dojo.forEach(arr,dojo.disconnect);
});
}
this.store=_e44;
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
},_onFetchComplete:function(_e4a,req){
if(_e4a&&_e4a.length>0){
dojo.forEach(_e4a,function(item,idx){
this._addItem(item,req.start+idx,true);
},this);
this.updateRows(req.start,_e4a.length);
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
if(!_e4a||!_e4a.length){
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
},_fetch:function(_e52,_e53){
var _e52=_e52||0;
if(this.store&&!this._pending_requests[_e52]){
if(!this._isLoaded&&!this._isLoading){
this._isLoading=true;
this.showMessage(this.loadingMessage);
}
this._pending_requests[_e52]=true;
try{
if(this.items){
var _e54=this.items;
var _e55=this.store;
this.rowsPerPage=_e54.length;
var req={start:_e52,count:this.rowsPerPage,isRender:_e53};
this._onFetchBegin(_e54.length,req);
var _e57=0;
dojo.forEach(_e54,function(i){
if(!_e55.isItemLoaded(i)){
_e57++;
}
});
if(_e57===0){
this._onFetchComplete(_e54,req);
}else{
var _e59=function(item){
_e57--;
if(_e57===0){
this._onFetchComplete(_e54,req);
}
};
dojo.forEach(_e54,function(i){
if(!_e55.isItemLoaded(i)){
_e55.loadItem({item:i,onItem:_e59,scope:this});
}
},this);
}
}else{
this.store.fetch({start:_e52,count:this.rowsPerPage,query:this.query,sort:this.getSortProps(),queryOptions:this.queryOptions,isRender:_e53,onBegin:dojo.hitch(this,"_onFetchBegin"),onComplete:dojo.hitch(this,"_onFetchComplete"),onError:dojo.hitch(this,"_onFetchError")});
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
},_getItemIndex:function(item,_e60){
if(!_e60&&!this.store.isItem(item)){
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
},filter:function(_e65,_e66){
this.query=_e65;
if(_e66){
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
},_requestsPending:function(_e6a){
return this._pending_requests[_e6a];
},_rowToPage:function(_e6b){
return (this.rowsPerPage?Math.floor(_e6b/this.rowsPerPage):_e6b);
},_pageToRow:function(_e6c){
return (this.rowsPerPage?this.rowsPerPage*_e6c:_e6c);
},_preparePage:function(_e6d){
if(_e6d<this._bop||_e6d>=this._eop){
var _e6e=this._rowToPage(_e6d);
this._needPage(_e6e);
this._bop=_e6e*this.rowsPerPage;
this._eop=this._bop+(this.rowsPerPage||this.rowCount);
}
},_needPage:function(_e6f){
if(!this._pages[_e6f]){
this._pages[_e6f]=true;
this._requestPage(_e6f);
}
},_requestPage:function(_e70){
var row=this._pageToRow(_e70);
var _e72=Math.min(this.rowsPerPage,this.rowCount-row);
if(_e72>0){
this._requests++;
if(!this._requestsPending(row)){
setTimeout(dojo.hitch(this,"_fetch",row,false),1);
}
}
},getCellName:function(_e73){
return _e73.field;
},_refresh:function(_e74){
this._clearData();
this._fetch(0,_e74);
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
},styleRowState:function(_e78){
if(this.store&&this.store.getState){
var _e79=this.store.getState(_e78.index),c="";
for(var i=0,ss=["inflight","error","inserting"],s;s=ss[i];i++){
if(_e79[s]){
c=" dojoxGridRow-"+s;
break;
}
}
_e78.customClasses+=c;
}
},onStyleRow:function(_e7e){
this.styleRowState(_e7e);
this.inherited(arguments);
},canEdit:function(_e7f,_e80){
return this._canEdit;
},_copyAttr:function(idx,attr){
var row={};
var _e84={};
var src=this.getItem(idx);
return this.store.getValue(src,attr);
},doStartEdit:function(_e86,_e87){
if(!this._cache[_e87]){
this._cache[_e87]=this._copyAttr(_e87,_e86.field);
}
this.onStartEdit(_e86,_e87);
},doApplyCellEdit:function(_e88,_e89,_e8a){
this.store.fetchItemByIdentity({identity:this._by_idx[_e89].idty,onItem:dojo.hitch(this,function(item){
this.store.setValue(item,_e8a,_e88);
this.onApplyCellEdit(_e88,_e89,_e8a);
})});
},doCancelEdit:function(_e8c){
var _e8d=this._cache[_e8c];
if(_e8d){
this.updateRow(_e8c);
delete this._cache[_e8c];
}
this.onCancelEdit.apply(this,arguments);
},doApplyEdit:function(_e8e,_e8f){
var _e90=this._cache[_e8e];
this.onApplyEdit(_e8e);
},removeSelectedRows:function(){
if(this._canEdit){
this.edit.apply();
var _e91=this.selection.getSelected();
if(_e91.length){
dojo.forEach(_e91,this.store.deleteItem,this.store);
this.selection.clear();
}
}
}});
dojox.grid.DataGrid.markupFactory=function(_e92,node,ctor,_e95){
return dojox.grid._Grid.markupFactory(_e92,node,ctor,function(node,_e97){
var _e98=dojo.trim(dojo.attr(node,"field")||"");
if(_e98){
_e97.field=_e98;
}
_e97.field=_e97.field||_e97.name;
if(_e95){
_e95(node,_e97);
}
});
};
}
if(!dojo._hasResource["dojo.cldr.supplemental"]){
dojo._hasResource["dojo.cldr.supplemental"]=true;
dojo.provide("dojo.cldr.supplemental");
dojo.cldr.supplemental.getFirstDayOfWeek=function(_e99){
var _e9a={mv:5,ae:6,af:6,bh:6,dj:6,dz:6,eg:6,er:6,et:6,iq:6,ir:6,jo:6,ke:6,kw:6,lb:6,ly:6,ma:6,om:6,qa:6,sa:6,sd:6,so:6,tn:6,ye:6,as:0,au:0,az:0,bw:0,ca:0,cn:0,fo:0,ge:0,gl:0,gu:0,hk:0,ie:0,il:0,is:0,jm:0,jp:0,kg:0,kr:0,la:0,mh:0,mo:0,mp:0,mt:0,nz:0,ph:0,pk:0,sg:0,th:0,tt:0,tw:0,um:0,us:0,uz:0,vi:0,za:0,zw:0,et:0,mw:0,ng:0,tj:0,sy:4};
var _e9b=dojo.cldr.supplemental._region(_e99);
var dow=_e9a[_e9b];
return (dow===undefined)?1:dow;
};
dojo.cldr.supplemental._region=function(_e9d){
_e9d=dojo.i18n.normalizeLocale(_e9d);
var tags=_e9d.split("-");
var _e9f=tags[1];
if(!_e9f){
_e9f={de:"de",en:"us",es:"es",fi:"fi",fr:"fr",he:"il",hu:"hu",it:"it",ja:"jp",ko:"kr",nl:"nl",pt:"br",sv:"se",zh:"cn"}[tags[0]];
}else{
if(_e9f.length==4){
_e9f=tags[2];
}
}
return _e9f;
};
dojo.cldr.supplemental.getWeekend=function(_ea0){
var _ea1={eg:5,il:5,sy:5,"in":0,ae:4,bh:4,dz:4,iq:4,jo:4,kw:4,lb:4,ly:4,ma:4,om:4,qa:4,sa:4,sd:4,tn:4,ye:4};
var _ea2={ae:5,bh:5,dz:5,iq:5,jo:5,kw:5,lb:5,ly:5,ma:5,om:5,qa:5,sa:5,sd:5,tn:5,ye:5,af:5,ir:5,eg:6,il:6,sy:6};
var _ea3=dojo.cldr.supplemental._region(_ea0);
var _ea4=_ea1[_ea3];
var end=_ea2[_ea3];
if(_ea4===undefined){
_ea4=6;
}
if(end===undefined){
end=0;
}
return {start:_ea4,end:end};
};
}
if(!dojo._hasResource["dojo.date"]){
dojo._hasResource["dojo.date"]=true;
dojo.provide("dojo.date");
dojo.date.getDaysInMonth=function(_ea6){
var _ea7=_ea6.getMonth();
var days=[31,28,31,30,31,30,31,31,30,31,30,31];
if(_ea7==1&&dojo.date.isLeapYear(_ea6)){
return 29;
}
return days[_ea7];
};
dojo.date.isLeapYear=function(_ea9){
var year=_ea9.getFullYear();
return !(year%400)||(!(year%4)&&!!(year%100));
};
dojo.date.getTimezoneName=function(_eab){
var str=_eab.toString();
var tz="";
var _eae;
var pos=str.indexOf("(");
if(pos>-1){
tz=str.substring(++pos,str.indexOf(")"));
}else{
var pat=/([A-Z\/]+) \d{4}$/;
if((_eae=str.match(pat))){
tz=_eae[1];
}else{
str=_eab.toLocaleString();
pat=/ ([A-Z\/]+)$/;
if((_eae=str.match(pat))){
tz=_eae[1];
}
}
}
return (tz=="AM"||tz=="PM")?"":tz;
};
dojo.date.compare=function(_eb1,_eb2,_eb3){
_eb1=new Date(Number(_eb1));
_eb2=new Date(Number(_eb2||new Date()));
if(_eb3!=="undefined"){
if(_eb3=="date"){
_eb1.setHours(0,0,0,0);
_eb2.setHours(0,0,0,0);
}else{
if(_eb3=="time"){
_eb1.setFullYear(0,0,0);
_eb2.setFullYear(0,0,0);
}
}
}
if(_eb1>_eb2){
return 1;
}
if(_eb1<_eb2){
return -1;
}
return 0;
};
dojo.date.add=function(date,_eb5,_eb6){
var sum=new Date(Number(date));
var _eb8=false;
var _eb9="Date";
switch(_eb5){
case "day":
break;
case "weekday":
var days,_ebb;
var mod=_eb6%5;
if(!mod){
days=(_eb6>0)?5:-5;
_ebb=(_eb6>0)?((_eb6-5)/5):((_eb6+5)/5);
}else{
days=mod;
_ebb=parseInt(_eb6/5);
}
var strt=date.getDay();
var adj=0;
if(strt==6&&_eb6>0){
adj=1;
}else{
if(strt==0&&_eb6<0){
adj=-1;
}
}
var trgt=strt+days;
if(trgt==0||trgt==6){
adj=(_eb6>0)?2:-2;
}
_eb6=(7*_ebb)+days+adj;
break;
case "year":
_eb9="FullYear";
_eb8=true;
break;
case "week":
_eb6*=7;
break;
case "quarter":
_eb6*=3;
case "month":
_eb8=true;
_eb9="Month";
break;
case "hour":
case "minute":
case "second":
case "millisecond":
_eb9="UTC"+_eb5.charAt(0).toUpperCase()+_eb5.substring(1)+"s";
}
if(_eb9){
sum["set"+_eb9](sum["get"+_eb9]()+_eb6);
}
if(_eb8&&(sum.getDate()<date.getDate())){
sum.setDate(0);
}
return sum;
};
dojo.date.difference=function(_ec0,_ec1,_ec2){
_ec1=_ec1||new Date();
_ec2=_ec2||"day";
var _ec3=_ec1.getFullYear()-_ec0.getFullYear();
var _ec4=1;
switch(_ec2){
case "quarter":
var m1=_ec0.getMonth();
var m2=_ec1.getMonth();
var q1=Math.floor(m1/3)+1;
var q2=Math.floor(m2/3)+1;
q2+=(_ec3*4);
_ec4=q2-q1;
break;
case "weekday":
var days=Math.round(dojo.date.difference(_ec0,_ec1,"day"));
var _eca=parseInt(dojo.date.difference(_ec0,_ec1,"week"));
var mod=days%7;
if(mod==0){
days=_eca*5;
}else{
var adj=0;
var aDay=_ec0.getDay();
var bDay=_ec1.getDay();
_eca=parseInt(days/7);
mod=days%7;
var _ecf=new Date(_ec0);
_ecf.setDate(_ecf.getDate()+(_eca*7));
var _ed0=_ecf.getDay();
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
case (_ed0+mod)>5:
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
case (_ed0+mod)<0:
adj=2;
}
}
}
days+=adj;
days-=(_eca*2);
}
_ec4=days;
break;
case "year":
_ec4=_ec3;
break;
case "month":
_ec4=(_ec1.getMonth()-_ec0.getMonth())+(_ec3*12);
break;
case "week":
_ec4=parseInt(dojo.date.difference(_ec0,_ec1,"day")/7);
break;
case "day":
_ec4/=24;
case "hour":
_ec4/=60;
case "minute":
_ec4/=60;
case "second":
_ec4/=1000;
case "millisecond":
_ec4*=_ec1.getTime()-_ec0.getTime();
}
return Math.round(_ec4);
};
}
if(!dojo._hasResource["dojo.date.locale"]){
dojo._hasResource["dojo.date.locale"]=true;
dojo.provide("dojo.date.locale");
(function(){
function formatPattern(_ed1,_ed2,_ed3,_ed4){
return _ed4.replace(/([a-z])\1*/ig,function(_ed5){
var s,pad;
var c=_ed5.charAt(0);
var l=_ed5.length;
var _eda=["abbr","wide","narrow"];
switch(c){
case "G":
s=_ed2[(l<4)?"eraAbbr":"eraNames"][_ed1.getFullYear()<0?0:1];
break;
case "y":
s=_ed1.getFullYear();
switch(l){
case 1:
break;
case 2:
if(!_ed3){
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
s=Math.ceil((_ed1.getMonth()+1)/3);
pad=true;
break;
case "M":
var m=_ed1.getMonth();
if(l<3){
s=m+1;
pad=true;
}else{
var _edc=["months","format",_eda[l-3]].join("-");
s=_ed2[_edc][m];
}
break;
case "w":
var _edd=0;
s=dojo.date.locale._getWeekOfYear(_ed1,_edd);
pad=true;
break;
case "d":
s=_ed1.getDate();
pad=true;
break;
case "D":
s=dojo.date.locale._getDayOfYear(_ed1);
pad=true;
break;
case "E":
var d=_ed1.getDay();
if(l<3){
s=d+1;
pad=true;
}else{
var _edf=["days","format",_eda[l-3]].join("-");
s=_ed2[_edf][d];
}
break;
case "a":
var _ee0=(_ed1.getHours()<12)?"am":"pm";
s=_ed2[_ee0];
break;
case "h":
case "H":
case "K":
case "k":
var h=_ed1.getHours();
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
s=_ed1.getMinutes();
pad=true;
break;
case "s":
s=_ed1.getSeconds();
pad=true;
break;
case "S":
s=Math.round(_ed1.getMilliseconds()*Math.pow(10,l-3));
pad=true;
break;
case "v":
case "z":
s=dojo.date.getTimezoneName(_ed1);
if(s){
break;
}
l=4;
case "Z":
var _ee2=_ed1.getTimezoneOffset();
var tz=[(_ee2<=0?"+":"-"),dojo.string.pad(Math.floor(Math.abs(_ee2)/60),2),dojo.string.pad(Math.abs(_ee2)%60,2)];
if(l==4){
tz.splice(0,0,"GMT");
tz.splice(3,0,":");
}
s=tz.join("");
break;
default:
throw new Error("dojo.date.locale.format: invalid pattern char: "+_ed4);
}
if(pad){
s=dojo.string.pad(s,l);
}
return s;
});
};
dojo.date.locale.format=function(_ee4,_ee5){
_ee5=_ee5||{};
var _ee6=dojo.i18n.normalizeLocale(_ee5.locale);
var _ee7=_ee5.formatLength||"short";
var _ee8=dojo.date.locale._getGregorianBundle(_ee6);
var str=[];
var _eea=dojo.hitch(this,formatPattern,_ee4,_ee8,_ee5.fullYear);
if(_ee5.selector=="year"){
var year=_ee4.getFullYear();
if(_ee6.match(/^zh|^ja/)){
year+="年";
}
return year;
}
if(_ee5.selector!="time"){
var _eec=_ee5.datePattern||_ee8["dateFormat-"+_ee7];
if(_eec){
str.push(_processPattern(_eec,_eea));
}
}
if(_ee5.selector!="date"){
var _eed=_ee5.timePattern||_ee8["timeFormat-"+_ee7];
if(_eed){
str.push(_processPattern(_eed,_eea));
}
}
var _eee=str.join(" ");
return _eee;
};
dojo.date.locale.regexp=function(_eef){
return dojo.date.locale._parseInfo(_eef).regexp;
};
dojo.date.locale._parseInfo=function(_ef0){
_ef0=_ef0||{};
var _ef1=dojo.i18n.normalizeLocale(_ef0.locale);
var _ef2=dojo.date.locale._getGregorianBundle(_ef1);
var _ef3=_ef0.formatLength||"short";
var _ef4=_ef0.datePattern||_ef2["dateFormat-"+_ef3];
var _ef5=_ef0.timePattern||_ef2["timeFormat-"+_ef3];
var _ef6;
if(_ef0.selector=="date"){
_ef6=_ef4;
}else{
if(_ef0.selector=="time"){
_ef6=_ef5;
}else{
_ef6=_ef4+" "+_ef5;
}
}
var _ef7=[];
var re=_processPattern(_ef6,dojo.hitch(this,_buildDateTimeRE,_ef7,_ef2,_ef0));
return {regexp:re,tokens:_ef7,bundle:_ef2};
};
dojo.date.locale.parse=function(_ef9,_efa){
var info=dojo.date.locale._parseInfo(_efa);
var _efc=info.tokens,_efd=info.bundle;
var re=new RegExp("^"+info.regexp+"$",info.strict?"":"i");
var _eff=re.exec(_ef9);
if(!_eff){
return null;
}
var _f00=["abbr","wide","narrow"];
var _f01=[1970,0,1,0,0,0,0];
var amPm="";
var _f03=dojo.every(_eff,function(v,i){
if(!i){
return true;
}
var _f06=_efc[i-1];
var l=_f06.length;
switch(_f06.charAt(0)){
case "y":
if(l!=2&&_efa.strict){
_f01[0]=v;
}else{
if(v<100){
v=Number(v);
var year=""+new Date().getFullYear();
var _f09=year.substring(0,2)*100;
var _f0a=Math.min(Number(year.substring(2,4))+20,99);
var num=(v<_f0a)?_f09+v:_f09-100+v;
_f01[0]=num;
}else{
if(_efa.strict){
return false;
}
_f01[0]=v;
}
}
break;
case "M":
if(l>2){
var _f0c=_efd["months-format-"+_f00[l-3]].concat();
if(!_efa.strict){
v=v.replace(".","").toLowerCase();
_f0c=dojo.map(_f0c,function(s){
return s.replace(".","").toLowerCase();
});
}
v=dojo.indexOf(_f0c,v);
if(v==-1){
return false;
}
}else{
v--;
}
_f01[1]=v;
break;
case "E":
case "e":
var days=_efd["days-format-"+_f00[l-3]].concat();
if(!_efa.strict){
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
_f01[1]=0;
case "d":
_f01[2]=v;
break;
case "a":
var am=_efa.am||_efd.am;
var pm=_efa.pm||_efd.pm;
if(!_efa.strict){
var _f12=/\./g;
v=v.replace(_f12,"").toLowerCase();
am=am.replace(_f12,"").toLowerCase();
pm=pm.replace(_f12,"").toLowerCase();
}
if(_efa.strict&&v!=am&&v!=pm){
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
_f01[3]=v;
break;
case "m":
_f01[4]=v;
break;
case "s":
_f01[5]=v;
break;
case "S":
_f01[6]=v;
}
return true;
});
var _f13=+_f01[3];
if(amPm==="p"&&_f13<12){
_f01[3]=_f13+12;
}else{
if(amPm==="a"&&_f13==12){
_f01[3]=0;
}
}
var _f14=new Date(_f01[0],_f01[1],_f01[2],_f01[3],_f01[4],_f01[5],_f01[6]);
if(_efa.strict){
_f14.setFullYear(_f01[0]);
}
var _f15=_efc.join("");
if(!_f03||(_f15.indexOf("M")!=-1&&_f14.getMonth()!=_f01[1])||(_f15.indexOf("d")!=-1&&_f14.getDate()!=_f01[2])){
return null;
}
return _f14;
};
function _processPattern(_f16,_f17,_f18,_f19){
var _f1a=function(x){
return x;
};
_f17=_f17||_f1a;
_f18=_f18||_f1a;
_f19=_f19||_f1a;
var _f1c=_f16.match(/(''|[^'])+/g);
var _f1d=_f16.charAt(0)=="'";
dojo.forEach(_f1c,function(_f1e,i){
if(!_f1e){
_f1c[i]="";
}else{
_f1c[i]=(_f1d?_f18:_f17)(_f1e);
_f1d=!_f1d;
}
});
return _f19(_f1c.join(""));
};
function _buildDateTimeRE(_f20,_f21,_f22,_f23){
_f23=dojo.regexp.escapeString(_f23);
if(!_f22.strict){
_f23=_f23.replace(" a"," ?a");
}
return _f23.replace(/([a-z])\1*/ig,function(_f24){
var s;
var c=_f24.charAt(0);
var l=_f24.length;
var p2="",p3="";
if(_f22.strict){
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
var am=_f22.am||_f21.am||"AM";
var pm=_f22.pm||_f21.pm||"PM";
if(_f22.strict){
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
if(_f20){
_f20.push(_f24);
}
return "("+s+")";
}).replace(/[\xa0 ]/g,"[\\s\\xa0]");
};
})();
(function(){
var _f2c=[];
dojo.date.locale.addCustomFormats=function(_f2d,_f2e){
_f2c.push({pkg:_f2d,name:_f2e});
};
dojo.date.locale._getGregorianBundle=function(_f2f){
var _f30={};
dojo.forEach(_f2c,function(desc){
var _f32=dojo.i18n.getLocalization(desc.pkg,desc.name,_f2f);
_f30=dojo.mixin(_f30,_f32);
},this);
return _f30;
};
})();
dojo.date.locale.addCustomFormats("dojo.cldr","gregorian");
dojo.date.locale.getNames=function(item,type,use,_f36){
var _f37;
var _f38=dojo.date.locale._getGregorianBundle(_f36);
var _f39=[item,use,type];
if(use=="standAlone"){
var key=_f39.join("-");
_f37=_f38[key];
if(_f37[0]==1){
_f37=undefined;
}
}
_f39[1]="format";
return (_f37||_f38[_f39.join("-")]).concat();
};
dojo.date.locale.isWeekend=function(_f3b,_f3c){
var _f3d=dojo.cldr.supplemental.getWeekend(_f3c);
var day=(_f3b||new Date()).getDay();
if(_f3d.end<_f3d.start){
_f3d.end+=7;
if(day<_f3d.start){
day+=7;
}
}
return day>=_f3d.start&&day<=_f3d.end;
};
dojo.date.locale._getDayOfYear=function(_f3f){
return dojo.date.difference(new Date(_f3f.getFullYear(),0,1,_f3f.getHours()),_f3f)+1;
};
dojo.date.locale._getWeekOfYear=function(_f40,_f41){
if(arguments.length==1){
_f41=0;
}
var _f42=new Date(_f40.getFullYear(),0,1).getDay();
var adj=(_f42-_f41+7)%7;
var week=Math.floor((dojo.date.locale._getDayOfYear(_f40)+adj-1)/7);
if(_f42==_f41){
week++;
}
return week;
};
}
if(!dojo._hasResource["dijit._Calendar"]){
dojo._hasResource["dijit._Calendar"]=true;
dojo.provide("dijit._Calendar");
dojo.declare("dijit._Calendar",[dijit._Widget,dijit._Templated],{templateString:"<table cellspacing=\"0\" cellpadding=\"0\" class=\"dijitCalendarContainer\">\r\n\t<thead>\r\n\t\t<tr class=\"dijitReset dijitCalendarMonthContainer\" valign=\"top\">\r\n\t\t\t<th class='dijitReset' dojoAttachPoint=\"decrementMonth\">\r\n\t\t\t\t<div class=\"dijitInline dijitCalendarIncrementControl dijitCalendarDecrease\"><span dojoAttachPoint=\"decreaseArrowNode\" class=\"dijitA11ySideArrow dijitCalendarIncrementControl dijitCalendarDecreaseInner\">-</span></div>\r\n\t\t\t</th>\r\n\t\t\t<th class='dijitReset' colspan=\"5\">\r\n\t\t\t\t<div dojoAttachPoint=\"monthLabelSpacer\" class=\"dijitCalendarMonthLabelSpacer\"></div>\r\n\t\t\t\t<div dojoAttachPoint=\"monthLabelNode\" class=\"dijitCalendarMonthLabel\"></div>\r\n\t\t\t</th>\r\n\t\t\t<th class='dijitReset' dojoAttachPoint=\"incrementMonth\">\r\n\t\t\t\t<div class=\"dijitInline dijitCalendarIncrementControl dijitCalendarIncrease\"><span dojoAttachPoint=\"increaseArrowNode\" class=\"dijitA11ySideArrow dijitCalendarIncrementControl dijitCalendarIncreaseInner\">+</span></div>\r\n\t\t\t</th>\r\n\t\t</tr>\r\n\t\t<tr>\r\n\t\t\t<th class=\"dijitReset dijitCalendarDayLabelTemplate\"><span class=\"dijitCalendarDayLabel\"></span></th>\r\n\t\t</tr>\r\n\t</thead>\r\n\t<tbody dojoAttachEvent=\"onclick: _onDayClick, onmouseover: _onDayMouseOver, onmouseout: _onDayMouseOut\" class=\"dijitReset dijitCalendarBodyContainer\">\r\n\t\t<tr class=\"dijitReset dijitCalendarWeekTemplate\">\r\n\t\t\t<td class=\"dijitReset dijitCalendarDateTemplate\"><span class=\"dijitCalendarDateLabel\"></span></td>\r\n\t\t</tr>\r\n\t</tbody>\r\n\t<tfoot class=\"dijitReset dijitCalendarYearContainer\">\r\n\t\t<tr>\r\n\t\t\t<td class='dijitReset' valign=\"top\" colspan=\"7\">\r\n\t\t\t\t<h3 class=\"dijitCalendarYearLabel\">\r\n\t\t\t\t\t<span dojoAttachPoint=\"previousYearLabelNode\" class=\"dijitInline dijitCalendarPreviousYear\"></span>\r\n\t\t\t\t\t<span dojoAttachPoint=\"currentYearLabelNode\" class=\"dijitInline dijitCalendarSelectedYear\"></span>\r\n\t\t\t\t\t<span dojoAttachPoint=\"nextYearLabelNode\" class=\"dijitInline dijitCalendarNextYear\"></span>\r\n\t\t\t\t</h3>\r\n\t\t\t</td>\r\n\t\t</tr>\r\n\t</tfoot>\r\n</table>\t\r\n",value:new Date(),dayWidth:"narrow",setValue:function(_f45){
dojo.deprecated("dijit.Calendar:setValue() is deprecated.  Use attr('value', ...) instead.","","2.0");
this.attr("value",_f45);
},_setValueAttr:function(_f46){
if(!this.value||dojo.date.compare(_f46,this.value)){
_f46=new Date(_f46);
this.displayMonth=new Date(_f46);
if(!this.isDisabledDate(_f46,this.lang)){
this.value=_f46;
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
var _f49=this.displayMonth;
_f49.setDate(1);
var _f4a=_f49.getDay();
var _f4b=dojo.date.getDaysInMonth(_f49);
var _f4c=dojo.date.getDaysInMonth(dojo.date.add(_f49,"month",-1));
var _f4d=new Date();
var _f4e=this.value;
var _f4f=dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
if(_f4f>_f4a){
_f4f-=7;
}
dojo.query(".dijitCalendarDateTemplate",this.domNode).forEach(function(_f50,i){
i+=_f4f;
var date=new Date(_f49);
var _f53,_f54="dijitCalendar",adj=0;
if(i<_f4a){
_f53=_f4c-_f4a+i+1;
adj=-1;
_f54+="Previous";
}else{
if(i>=(_f4a+_f4b)){
_f53=i-_f4a-_f4b+1;
adj=1;
_f54+="Next";
}else{
_f53=i-_f4a+1;
_f54+="Current";
}
}
if(adj){
date=dojo.date.add(date,"month",adj);
}
date.setDate(_f53);
if(!dojo.date.compare(date,_f4d,"date")){
_f54="dijitCalendarCurrentDate "+_f54;
}
if(!dojo.date.compare(date,_f4e,"date")){
_f54="dijitCalendarSelectedDate "+_f54;
}
if(this.isDisabledDate(date,this.lang)){
_f54="dijitCalendarDisabledDate "+_f54;
}
var _f56=this.getClassForDate(date,this.lang);
if(_f56){
_f54=_f56+" "+_f54;
}
_f50.className=_f54+"Month dijitCalendarDateTemplate";
_f50.dijitDateValue=date.valueOf();
var _f57=dojo.query(".dijitCalendarDateLabel",_f50)[0];
this._setText(_f57,date.getDate());
},this);
var _f58=dojo.date.locale.getNames("months","wide","standAlone",this.lang);
this._setText(this.monthLabelNode,_f58[_f49.getMonth()]);
var y=_f49.getFullYear()-1;
var d=new Date();
dojo.forEach(["previous","current","next"],function(name){
d.setFullYear(y++);
this._setText(this[name+"YearLabelNode"],dojo.date.locale.format(d,{selector:"year",locale:this.lang}));
},this);
var _f5c=this;
var _f5d=function(_f5e,_f5f,adj){
_f5c._connects.push(dijit.typematic.addMouseListener(_f5c[_f5e],_f5c,function(_f61){
if(_f61>=0){
_f5c._adjustDisplay(_f5f,adj);
}
},0.8,500));
};
_f5d("incrementMonth","month",1);
_f5d("decrementMonth","month",-1);
_f5d("nextYearLabelNode","year",1);
_f5d("previousYearLabelNode","year",-1);
},goToToday:function(){
this.attr("value",new Date());
},postCreate:function(){
this.inherited(arguments);
var _f62=dojo.hitch(this,function(_f63,n){
var _f65=dojo.query(_f63,this.domNode)[0];
for(var i=0;i<n;i++){
_f65.parentNode.appendChild(_f65.cloneNode(true));
}
});
_f62(".dijitCalendarDayLabelTemplate",6);
_f62(".dijitCalendarDateTemplate",6);
_f62(".dijitCalendarWeekTemplate",5);
var _f67=dojo.date.locale.getNames("days",this.dayWidth,"standAlone",this.lang);
var _f68=dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
dojo.query(".dijitCalendarDayLabel",this.domNode).forEach(function(_f69,i){
this._setText(_f69,_f67[(i+_f68)%7]);
},this);
var _f6b=dojo.date.locale.getNames("months","wide","standAlone",this.lang);
dojo.forEach(_f6b,function(name){
var _f6d=dojo.doc.createElement("div");
this._setText(_f6d,name);
this.monthLabelSpacer.appendChild(_f6d);
},this);
this.value=null;
this.attr("value",new Date());
},_adjustDisplay:function(part,_f6f){
this.displayMonth=dojo.date.add(this.displayMonth,part,_f6f);
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
},isDisabledDate:function(_f78,_f79){
},getClassForDate:function(_f7a,_f7b){
}});
}
if(!dojo._hasResource["dijit.form._DateTimeTextBox"]){
dojo._hasResource["dijit.form._DateTimeTextBox"]=true;
dojo.provide("dijit.form._DateTimeTextBox");
dojo.declare("dijit.form._DateTimeTextBox",dijit.form.RangeBoundTextBox,{regExpGen:dojo.date.locale.regexp,compare:dojo.date.compare,format:function(_f7c,_f7d){
if(!_f7c){
return "";
}
return dojo.date.locale.format(_f7c,_f7d);
},parse:function(_f7e,_f7f){
return dojo.date.locale.parse(_f7e,_f7f)||(this._isEmpty(_f7e)?null:undefined);
},serialize:dojo.date.stamp.toISOString,value:new Date(""),popupClass:"",_selector:"",postMixInProperties:function(){
this.inherited(arguments);
if(!this.value||this.value.toString()==dijit.form._DateTimeTextBox.prototype.value.toString()){
this.value=null;
}
var _f80=this.constraints;
_f80.selector=this._selector;
_f80.fullYear=true;
var _f81=dojo.date.stamp.fromISOString;
if(typeof _f80.min=="string"){
_f80.min=_f81(_f80.min);
}
if(typeof _f80.max=="string"){
_f80.max=_f81(_f80.max);
}
},_onFocus:function(evt){
this._open();
},_setValueAttr:function(_f83,_f84,_f85){
this.inherited(arguments);
if(this._picker){
if(!_f83){
_f83=new Date();
}
this._picker.attr("value",_f83);
}
},_open:function(){
if(this.disabled||this.readOnly||!this.popupClass){
return;
}
var _f86=this;
if(!this._picker){
var _f87=dojo.getObject(this.popupClass,false);
this._picker=new _f87({onValueSelected:function(_f88){
if(_f86._tabbingAway){
delete _f86._tabbingAway;
}else{
_f86.focus();
}
setTimeout(dojo.hitch(_f86,"_close"),1);
dijit.form._DateTimeTextBox.superclass._setValueAttr.call(_f86,_f88,true);
},lang:_f86.lang,constraints:_f86.constraints,isDisabledDate:function(date){
var _f8a=dojo.date.compare;
var _f8b=_f86.constraints;
return _f8b&&(_f8b.min&&(_f8a(_f8b.min,date,"date")>0)||(_f8b.max&&_f8a(_f8b.max,date,"date")<0));
}});
this._picker.attr("value",this.attr("value")||new Date());
}
if(!this._opened){
dijit.popup.open({parent:this,popup:this._picker,around:this.domNode,onCancel:dojo.hitch(this,this._close),onClose:function(){
_f86._opened=false;
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
},_setDisplayedValueAttr:function(_f8c,_f8d){
this._setValueAttr(this.parse(_f8c,this.constraints),_f8d,_f8c);
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
dojo.declare("dijit._TimePicker",[dijit._Widget,dijit._Templated],{templateString:"<div id=\"widget_${id}\" class=\"dijitMenu ${baseClass}\"\r\n    ><div dojoAttachPoint=\"upArrow\" class=\"dijitButtonNode dijitUpArrowButton\" dojoAttachEvent=\"onmouseenter:_buttonMouse,onmouseleave:_buttonMouse\"\r\n\t\t><div class=\"dijitReset dijitInline dijitArrowButtonInner\" wairole=\"presentation\" role=\"presentation\">&nbsp;</div\r\n\t\t><div class=\"dijitArrowButtonChar\">&#9650;</div></div\r\n    ><div dojoAttachPoint=\"timeMenu,focusNode\" dojoAttachEvent=\"onclick:_onOptionSelected,onmouseover,onmouseout\"></div\r\n    ><div dojoAttachPoint=\"downArrow\" class=\"dijitButtonNode dijitDownArrowButton\" dojoAttachEvent=\"onmouseenter:_buttonMouse,onmouseleave:_buttonMouse\"\r\n\t\t><div class=\"dijitReset dijitInline dijitArrowButtonInner\" wairole=\"presentation\" role=\"presentation\">&nbsp;</div\r\n\t\t><div class=\"dijitArrowButtonChar\">&#9660;</div></div\r\n></div>\r\n",baseClass:"dijitTimePicker",clickableIncrement:"T00:15:00",visibleIncrement:"T01:00:00",visibleRange:"T05:00:00",value:new Date(),_visibleIncrement:2,_clickableIncrement:1,_totalIncrements:10,constraints:{},serialize:dojo.date.stamp.toISOString,_filterString:"",setValue:function(_f91){
dojo.deprecated("dijit._TimePicker:setValue() is deprecated.  Use attr('value') instead.","","2.0");
this.attr("value",_f91);
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
},isDisabledDate:function(_f96,_f97){
return false;
},_getFilteredNodes:function(_f98,_f99,_f9a){
var _f9b=[],n,i=_f98,max=this._maxIncrement+Math.abs(i),chk=_f9a?-1:1,dec=_f9a?1:0,inc=_f9a?0:1;
do{
i=i-dec;
n=this._createOption(i);
if(n){
_f9b.push(n);
}
i=i+inc;
}while(_f9b.length<_f99&&(i*chk)<max);
if(_f9a){
_f9b.reverse();
}
return _f9b;
},_showText:function(){
this.timeMenu.innerHTML="";
var _fa2=dojo.date.stamp.fromISOString;
this._clickableIncrementDate=_fa2(this.clickableIncrement);
this._visibleIncrementDate=_fa2(this.visibleIncrement);
this._visibleRangeDate=_fa2(this.visibleRange);
var _fa3=function(date){
return date.getHours()*60*60+date.getMinutes()*60+date.getSeconds();
};
var _fa5=_fa3(this._clickableIncrementDate);
var _fa6=_fa3(this._visibleIncrementDate);
var _fa7=_fa3(this._visibleRangeDate);
var time=this.value.getTime();
this._refDate=new Date(time-time%(_fa6*1000));
this._refDate.setFullYear(1970,0,1);
this._clickableIncrement=1;
this._totalIncrements=_fa7/_fa5;
this._visibleIncrement=_fa6/_fa5;
this._maxIncrement=(60*60*24)/_fa5;
var _fa9=this._getFilteredNodes(0,this._totalIncrements>>1,true);
var _faa=this._getFilteredNodes(0,this._totalIncrements>>1,false);
if(_fa9.length<this._totalIncrements>>1){
_fa9=_fa9.slice(_fa9.length/2);
_faa=_faa.slice(0,_faa.length/2);
}
dojo.forEach(_fa9.concat(_faa),function(n){
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
var _fac=this;
var _fad=function(){
_fac._connects.push(dijit.typematic.addMouseListener.apply(null,arguments));
};
_fad(this.upArrow,this,this._onArrowUp,0.8,500);
_fad(this.downArrow,this,this._onArrowDown,0.8,500);
var _fae=function(cb){
return function(cnt){
if(cnt>0){
cb.call(this,arguments);
}
};
};
var _fb1=function(node,cb){
return function(e){
dojo.stopEvent(e);
dijit.typematic.trigger(e,this,node,_fae(cb),node,0.85,250);
};
};
this.connect(this.upArrow,"onmouseover",_fb1(this.upArrow,this._onArrowUp));
this.connect(this.downArrow,"onmouseover",_fb1(this.downArrow,this._onArrowDown));
this.inherited(arguments);
},_buttonMouse:function(e){
dojo.toggleClass(e.currentTarget,"dijitButtonNodeHover",e.type=="mouseover");
},_createOption:function(_fb6){
var date=new Date(this._refDate);
var _fb8=this._clickableIncrementDate;
date.setHours(date.getHours()+_fb8.getHours()*_fb6,date.getMinutes()+_fb8.getMinutes()*_fb6,date.getSeconds()+_fb8.getSeconds()*_fb6);
var _fb9=dojo.date.locale.format(date,this.constraints);
if(this._filterString&&_fb9.toLowerCase().indexOf(this._filterString)!==0){
return null;
}
var div=dojo.doc.createElement("div");
div.date=date;
div.index=_fb6;
var _fbb=dojo.doc.createElement("div");
dojo.addClass(div,this.baseClass+"Item");
dojo.addClass(_fbb,this.baseClass+"ItemInner");
_fbb.innerHTML=_fb9;
div.appendChild(_fbb);
if(_fb6%this._visibleIncrement<1&&_fb6%this._visibleIncrement>-1){
dojo.addClass(div,this.baseClass+"Marker");
}else{
if(!(_fb6%this._clickableIncrement)){
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
var _fbd=tgt.target.date||tgt.target.parentNode.date;
if(!_fbd||this.isDisabledDate(_fbd)){
return;
}
this._highlighted_option=null;
this.attr("value",_fbd);
this.onValueSelected(_fbd);
},onValueSelected:function(_fbe){
},_highlightOption:function(node,_fc0){
if(!node){
return;
}
if(_fc0){
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
dojo.toggleClass(node,this.baseClass+"ItemHover",_fc0);
if(dojo.hasClass(node,this.baseClass+"Marker")){
dojo.toggleClass(node,this.baseClass+"MarkerHover",_fc0);
}else{
dojo.toggleClass(node,this.baseClass+"TickHover",_fc0);
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
var _fc6=(dojo.isIE?e.wheelDelta:-e.detail);
this[(_fc6>0?"_onArrowUp":"_onArrowDown")]();
},_onArrowUp:function(){
var _fc7=this.timeMenu.childNodes[0].index;
var divs=this._getFilteredNodes(_fc7,1,true);
if(divs.length){
this.timeMenu.removeChild(this.timeMenu.childNodes[this.timeMenu.childNodes.length-1]);
this.timeMenu.insertBefore(divs[0],this.timeMenu.childNodes[0]);
}
},_onArrowDown:function(){
var _fc9=this.timeMenu.childNodes[this.timeMenu.childNodes.length-1].index+1;
var divs=this._getFilteredNodes(_fc9,1,false);
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
var _fcd=this.timeMenu,tgt=this._highlighted_option||dojo.query("."+this.baseClass+"ItemSelected",_fcd)[0];
if(!tgt){
tgt=_fcd.childNodes[0];
}else{
if(_fcd.childNodes.length){
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
dojo.declare("dijit.form._Spinner",dijit.form.RangeBoundTextBox,{defaultTimeout:500,timeoutChangeRate:0.9,smallDelta:1,largeDelta:10,templateString:"<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\r\n\tid=\"widget_${id}\"\r\n\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\" waiRole=\"presentation\"\r\n\t><div class=\"dijitInputLayoutContainer\"\r\n\t\t><div class=\"dijitReset dijitSpinnerButtonContainer\"\r\n\t\t\t>&nbsp;<div class=\"dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitUpArrowButton\"\r\n\t\t\t\tdojoAttachPoint=\"upArrowNode\"\r\n\t\t\t\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse\"\r\n\t\t\t\tstateModifier=\"UpArrow\"\r\n\t\t\t\t><div class=\"dijitArrowButtonInner\">&thinsp;</div\r\n\t\t\t\t><div class=\"dijitArrowButtonChar\">&#9650;</div\r\n\t\t\t></div\r\n\t\t\t><div class=\"dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitDownArrowButton\"\r\n\t\t\t\tdojoAttachPoint=\"downArrowNode\"\r\n\t\t\t\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse\"\r\n\t\t\t\tstateModifier=\"DownArrow\"\r\n\t\t\t\t><div class=\"dijitArrowButtonInner\">&thinsp;</div\r\n\t\t\t\t><div class=\"dijitArrowButtonChar\">&#9660;</div\r\n\t\t\t></div\r\n\t\t></div\r\n\t\t><div class=\"dijitReset dijitValidationIcon\"><br></div\r\n\t\t><div class=\"dijitReset dijitValidationIconText\">&Chi;</div\r\n\t\t><div class=\"dijitReset dijitInputField\"\r\n\t\t\t><input class='dijitReset' dojoAttachPoint=\"textbox,focusNode\" type=\"${type}\" dojoAttachEvent=\"onfocus:_update,onkeyup:_update,onkeypress:_onKeyPress\"\r\n\t\t\t\twaiRole=\"spinbutton\" autocomplete=\"off\" name=\"${name}\"\r\n\t\t/></div\r\n\t></div\r\n></div>\r\n",baseClass:"dijitSpinner",adjust:function(val,_fd0){
return val;
},_arrowState:function(node,_fd2){
this._active=_fd2;
this.stateModifier=node.getAttribute("stateModifier")||"";
this._setStateClass();
},_arrowPressed:function(_fd3,_fd4,_fd5){
if(this.disabled||this.readOnly){
return;
}
this._arrowState(_fd3,true);
this._setValueAttr(this.adjust(this.attr("value"),_fd4*_fd5),false);
dijit.selectInputText(this.textbox,this.textbox.value.length);
},_arrowReleased:function(node){
this._wheelTimer=null;
if(this.disabled||this.readOnly){
return;
}
this._arrowState(node,false);
},_typematicCallback:function(_fd7,node,evt){
var inc=this.smallDelta;
if(node==this.textbox){
k=dojo.keys;
var key=evt.charOrCode;
inc=(key==k.PAGE_UP||key==k.PAGE_DOWN)?this.largeDelta:this.smallDelta;
node=(key==k.UP_ARROW||key==k.PAGE_UP)?this.upArrowNode:this.downArrowNode;
}
if(_fd7==-1){
this._arrowReleased(node);
}else{
this._arrowPressed(node,(node==this.upArrowNode)?1:-1,inc);
}
},_wheelTimer:null,_mouseWheeled:function(evt){
dojo.stopEvent(evt);
var _fdd=evt.detail?(evt.detail*-1):(evt.wheelDelta/120);
if(_fdd!==0){
var node=this[(_fdd>0?"upArrowNode":"downArrowNode")];
this._arrowPressed(node,_fdd,this.smallDelta);
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
var _fdf=this;
this.connect(this.domNode,"onresize",function(){
setTimeout(dojo.hitch(_fdf,function(){
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
dojo.number.format=function(_fe1,_fe2){
_fe2=dojo.mixin({},_fe2||{});
var _fe3=dojo.i18n.normalizeLocale(_fe2.locale);
var _fe4=dojo.i18n.getLocalization("dojo.cldr","number",_fe3);
_fe2.customs=_fe4;
var _fe5=_fe2.pattern||_fe4[(_fe2.type||"decimal")+"Format"];
if(isNaN(_fe1)){
return null;
}
return dojo.number._applyPattern(_fe1,_fe5,_fe2);
};
dojo.number._numberPatternRE=/[#0,]*[#0](?:\.0*#*)?/;
dojo.number._applyPattern=function(_fe6,_fe7,_fe8){
_fe8=_fe8||{};
var _fe9=_fe8.customs.group;
var _fea=_fe8.customs.decimal;
var _feb=_fe7.split(";");
var _fec=_feb[0];
_fe7=_feb[(_fe6<0)?1:0]||("-"+_fec);
if(_fe7.indexOf("%")!=-1){
_fe6*=100;
}else{
if(_fe7.indexOf("‰")!=-1){
_fe6*=1000;
}else{
if(_fe7.indexOf("¤")!=-1){
_fe9=_fe8.customs.currencyGroup||_fe9;
_fea=_fe8.customs.currencyDecimal||_fea;
_fe7=_fe7.replace(/\u00a4{1,3}/,function(_fed){
var prop=["symbol","currency","displayName"][_fed.length-1];
return _fe8[prop]||_fe8.currency||"";
});
}else{
if(_fe7.indexOf("E")!=-1){
throw new Error("exponential notation not supported");
}
}
}
}
var _fef=dojo.number._numberPatternRE;
var _ff0=_fec.match(_fef);
if(!_ff0){
throw new Error("unable to find a number expression in pattern: "+_fe7);
}
if(_fe8.fractional===false){
_fe8.places=0;
}
return _fe7.replace(_fef,dojo.number._formatAbsolute(_fe6,_ff0[0],{decimal:_fea,group:_fe9,places:_fe8.places,round:_fe8.round}));
};
dojo.number.round=function(_ff1,_ff2,_ff3){
var _ff4=String(_ff1).split(".");
var _ff5=(_ff4[1]&&_ff4[1].length)||0;
if(_ff5>_ff2){
var _ff6=Math.pow(10,_ff2);
if(_ff3>0){
_ff6*=10/_ff3;
_ff2++;
}
_ff1=Math.round(_ff1*_ff6)/_ff6;
_ff4=String(_ff1).split(".");
_ff5=(_ff4[1]&&_ff4[1].length)||0;
if(_ff5>_ff2){
_ff4[1]=_ff4[1].substr(0,_ff2);
_ff1=Number(_ff4.join("."));
}
}
return _ff1;
};
dojo.number._formatAbsolute=function(_ff7,_ff8,_ff9){
_ff9=_ff9||{};
if(_ff9.places===true){
_ff9.places=0;
}
if(_ff9.places===Infinity){
_ff9.places=6;
}
var _ffa=_ff8.split(".");
var _ffb=(_ff9.places>=0)?_ff9.places:(_ffa[1]&&_ffa[1].length)||0;
if(!(_ff9.round<0)){
_ff7=dojo.number.round(_ff7,_ffb,_ff9.round);
}
var _ffc=String(Math.abs(_ff7)).split(".");
var _ffd=_ffc[1]||"";
if(_ff9.places){
var _ffe=dojo.isString(_ff9.places)&&_ff9.places.indexOf(",");
if(_ffe){
_ff9.places=_ff9.places.substring(_ffe+1);
}
_ffc[1]=dojo.string.pad(_ffd.substr(0,_ff9.places),_ff9.places,"0",true);
}else{
if(_ffa[1]&&_ff9.places!==0){
var pad=_ffa[1].lastIndexOf("0")+1;
if(pad>_ffd.length){
_ffc[1]=dojo.string.pad(_ffd,pad,"0",true);
}
var _1000=_ffa[1].length;
if(_1000<_ffd.length){
_ffc[1]=_ffd.substr(0,_1000);
}
}else{
if(_ffc[1]){
_ffc.pop();
}
}
}
var _1001=_ffa[0].replace(",","");
pad=_1001.indexOf("0");
if(pad!=-1){
pad=_1001.length-pad;
if(pad>_ffc[0].length){
_ffc[0]=dojo.string.pad(_ffc[0],pad);
}
if(_1001.indexOf("#")==-1){
_ffc[0]=_ffc[0].substr(_ffc[0].length-pad);
}
}
var index=_ffa[0].lastIndexOf(",");
var _1003,_1004;
if(index!=-1){
_1003=_ffa[0].length-index-1;
var _1005=_ffa[0].substr(0,index);
index=_1005.lastIndexOf(",");
if(index!=-1){
_1004=_1005.length-index-1;
}
}
var _1006=[];
for(var whole=_ffc[0];whole;){
var off=whole.length-_1003;
_1006.push((off>0)?whole.substr(off):whole);
whole=(off>0)?whole.slice(0,off):"";
if(_1004){
_1003=_1004;
delete _1004;
}
}
_ffc[0]=_1006.reverse().join(_ff9.group||",");
return _ffc.join(_ff9.decimal||".");
};
dojo.number.regexp=function(_1009){
return dojo.number._parseInfo(_1009).regexp;
};
dojo.number._parseInfo=function(_100a){
_100a=_100a||{};
var _100b=dojo.i18n.normalizeLocale(_100a.locale);
var _100c=dojo.i18n.getLocalization("dojo.cldr","number",_100b);
var _100d=_100a.pattern||_100c[(_100a.type||"decimal")+"Format"];
var group=_100c.group;
var _100f=_100c.decimal;
var _1010=1;
if(_100d.indexOf("%")!=-1){
_1010/=100;
}else{
if(_100d.indexOf("‰")!=-1){
_1010/=1000;
}else{
var _1011=_100d.indexOf("¤")!=-1;
if(_1011){
group=_100c.currencyGroup||group;
_100f=_100c.currencyDecimal||_100f;
}
}
}
var _1012=_100d.split(";");
if(_1012.length==1){
_1012.push("-"+_1012[0]);
}
var re=dojo.regexp.buildGroupRE(_1012,function(_1014){
_1014="(?:"+dojo.regexp.escapeString(_1014,".")+")";
return _1014.replace(dojo.number._numberPatternRE,function(_1015){
var flags={signed:false,separator:_100a.strict?group:[group,""],fractional:_100a.fractional,decimal:_100f,exponent:false};
var parts=_1015.split(".");
var _1018=_100a.places;
if(parts.length==1||_1018===0){
flags.fractional=false;
}else{
if(_1018===undefined){
_1018=_100a.pattern?parts[1].lastIndexOf("0")+1:Infinity;
}
if(_1018&&_100a.fractional==undefined){
flags.fractional=true;
}
if(!_100a.places&&(_1018<parts[1].length)){
_1018+=","+parts[1].length;
}
flags.places=_1018;
}
var _1019=parts[0].split(",");
if(_1019.length>1){
flags.groupSize=_1019.pop().length;
if(_1019.length>1){
flags.groupSize2=_1019.pop().length;
}
}
return "("+dojo.number._realNumberRegexp(flags)+")";
});
},true);
if(_1011){
re=re.replace(/([\s\xa0]*)(\u00a4{1,3})([\s\xa0]*)/g,function(match,_101b,_101c,after){
var prop=["symbol","currency","displayName"][_101c.length-1];
var _101f=dojo.regexp.escapeString(_100a[prop]||_100a.currency||"");
_101b=_101b?"[\\s\\xa0]":"";
after=after?"[\\s\\xa0]":"";
if(!_100a.strict){
if(_101b){
_101b+="*";
}
if(after){
after+="*";
}
return "(?:"+_101b+_101f+after+")?";
}
return _101b+_101f+after;
});
}
return {regexp:re.replace(/[\xa0 ]/g,"[\\s\\xa0]"),group:group,decimal:_100f,factor:_1010};
};
dojo.number.parse=function(_1020,_1021){
var info=dojo.number._parseInfo(_1021);
var _1023=(new RegExp("^"+info.regexp+"$")).exec(_1020);
if(!_1023){
return NaN;
}
var _1024=_1023[1];
if(!_1023[1]){
if(!_1023[2]){
return NaN;
}
_1024=_1023[2];
info.factor*=-1;
}
_1024=_1024.replace(new RegExp("["+info.group+"\\s\\xa0"+"]","g"),"").replace(info.decimal,".");
return Number(_1024)*info.factor;
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
var _1026=dojo.number._integerRegexp(flags);
var _1027=dojo.regexp.buildGroupRE(flags.fractional,function(q){
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
var _102a=dojo.regexp.buildGroupRE(flags.exponent,function(q){
if(q){
return "([eE]"+dojo.number._integerRegexp({signed:flags.eSigned})+")";
}
return "";
});
var _102c=_1026+_1027;
if(_1027){
_102c="(?:(?:"+_102c+")|(?:"+_1027+"))";
}
return _102c+_102a;
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
var _102e=dojo.regexp.buildGroupRE(flags.signed,function(q){
return q?"[-+]":"";
},true);
var _1030=dojo.regexp.buildGroupRE(flags.separator,function(sep){
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
var _1034="(?:0|[1-9]\\d{0,"+(grp2-1)+"}(?:["+sep+"]\\d{"+grp2+"})*["+sep+"]\\d{"+grp+"})";
return ((grp-grp2)>0)?"(?:"+_1034+"|(?:0|[1-9]\\d{0,"+(grp-1)+"}))":_1034;
}
return "(?:0|[1-9]\\d{0,"+(grp-1)+"}(?:["+sep+"]\\d{"+grp+"})*)";
},true);
return _102e+_1030;
};
}
if(!dojo._hasResource["dijit.form.NumberTextBox"]){
dojo._hasResource["dijit.form.NumberTextBox"]=true;
dojo.provide("dijit.form.NumberTextBox");
dojo.declare("dijit.form.NumberTextBoxMixin",null,{regExpGen:dojo.number.regexp,editOptions:{pattern:"#.######"},_onFocus:function(){
this._setValueAttr(this.attr("value"),false);
this.inherited(arguments);
},_formatter:dojo.number.format,format:function(value,_1036){
if(typeof value=="string"){
return value;
}
if(isNaN(value)){
return "";
}
if(this.editOptions&&this._focused){
_1036=dojo.mixin(dojo.mixin({},this.editOptions),this.constraints);
}
return this._formatter(value,_1036);
},parse:dojo.number.parse,filter:function(value){
return (value===null||value===""||value===undefined)?NaN:this.inherited(arguments);
},serialize:function(value,_1039){
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
var _103d=(delta>0),_103e=(typeof this.constraints.max=="number"),_103f=(typeof this.constraints.min=="number");
val=_103d?(_103f?this.constraints.min:(_103e?this.constraints.max:0)):(_103e?this.constraints.max:(_103f?this.constraints.min:0));
}
var _1040=val+delta;
if(isNaN(val)||isNaN(_1040)){
return val;
}
if((typeof this.constraints.max=="number")&&(_1040>this.constraints.max)){
_1040=this.constraints.max;
}
if((typeof this.constraints.min=="number")&&(_1040<this.constraints.min)){
_1040=this.constraints.min;
}
return _1040;
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
var _1044={ADP:0,BHD:3,BIF:0,BYR:0,CLF:0,CLP:0,DJF:0,ESP:0,GNF:0,IQD:3,ITL:0,JOD:3,JPY:0,KMF:0,KRW:0,KWD:3,LUF:0,LYD:3,MGA:0,MGF:0,OMR:3,PYG:0,RWF:0,TND:3,TRL:0,VUV:0,XAF:0,XOF:0,XPF:0};
var _1045={CHF:5};
var _1046=_1044[code],round=_1045[code];
if(typeof _1046=="undefined"){
_1046=2;
}
if(typeof round=="undefined"){
round=0;
}
return {places:_1046,round:round};
};
}
if(!dojo._hasResource["dojo.currency"]){
dojo._hasResource["dojo.currency"]=true;
dojo.provide("dojo.currency");
dojo.currency._mixInDefaults=function(_1048){
_1048=_1048||{};
_1048.type="currency";
var _1049=dojo.i18n.getLocalization("dojo.cldr","currency",_1048.locale)||{};
var iso=_1048.currency;
var data=dojo.cldr.monetary.getData(iso);
dojo.forEach(["displayName","symbol","group","decimal"],function(prop){
data[prop]=_1049[iso+"_"+prop];
});
data.fractional=[true,false];
return dojo.mixin(data,_1048);
};
dojo.currency.format=function(value,_104e){
return dojo.number.format(value,dojo.currency._mixInDefaults(_104e));
};
dojo.currency.regexp=function(_104f){
return dojo.number.regexp(dojo.currency._mixInDefaults(_104f));
};
dojo.currency.parse=function(_1050,_1051){
return dojo.number.parse(_1050,dojo.currency._mixInDefaults(_1051));
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
var _1055=dojo.coords(this.sliderBarContainer,true);
var _1056=e[this._mousePixelCoord]-_1055[this._startingPixelCoord];
this._setPixelValue(this._isReversed()?(_1055[this._pixelCount]-_1056):_1056,_1055[this._pixelCount],true);
},_setPixelValue:function(_1057,_1058,_1059){
if(this.disabled||this.readOnly){
return;
}
_1057=_1057<0?0:_1058<_1057?_1058:_1057;
var count=this.discreteValues;
if(count<=1||count==Infinity){
count=_1058;
}
count--;
var _105b=_1058/count;
var _105c=Math.round(_1057/_105b);
this._setValueAttr((this.maximum-this.minimum)*_105c/count+this.minimum,_1059);
},_setValueAttr:function(value,_105e){
this.valueNode.value=this.value=value;
dijit.setWaiState(this.focusNode,"valuenow",value);
this.inherited(arguments);
var _105f=(value-this.minimum)/(this.maximum-this.minimum);
var _1060=(this._descending===false)?this.remainingBar:this.progressBar;
var _1061=(this._descending===false)?this.progressBar:this.remainingBar;
if(this._inProgressAnim&&this._inProgressAnim.status!="stopped"){
this._inProgressAnim.stop(true);
}
if(_105e&&this.slideDuration>0&&_1060.style[this._progressPixelSize]){
var _this=this;
var props={};
var start=parseFloat(_1060.style[this._progressPixelSize]);
var _1065=this.slideDuration*(_105f-start/100);
if(_1065==0){
return;
}
if(_1065<0){
_1065=0-_1065;
}
props[this._progressPixelSize]={start:start,end:_105f*100,units:"%"};
this._inProgressAnim=dojo.animateProperty({node:_1060,duration:_1065,onAnimate:function(v){
_1061.style[_this._progressPixelSize]=(100-parseFloat(v[_this._progressPixelSize]))+"%";
},onEnd:function(){
delete _this._inProgressAnim;
},properties:props});
this._inProgressAnim.play();
}else{
_1060.style[this._progressPixelSize]=(_105f*100)+"%";
_1061.style[this._progressPixelSize]=((1-_105f)*100)+"%";
}
},_bumpValue:function(_1067){
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
var value=(this.value-this.minimum)*count/(this.maximum-this.minimum)+_1067;
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
var _1070=evt[(janky?"wheelDelta":"detail")]*(janky?1:-1);
this[(_1070<0?"decrement":"increment")](evt);
},startup:function(){
dojo.forEach(this.getChildren(),function(child){
if(this[child.container]!=this.containerNode){
this[child.container].appendChild(child.domNode);
}
},this);
},_typematicCallback:function(count,_1073,e){
if(count==-1){
return;
}
this[(_1073==(this._descending?this.incrementButton:this.decrementButton))?"decrement":"increment"](e);
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
},_rtlRectify:function(_1078){
var _1079=[];
while(_1078.firstChild){
_1079.push(_1078.firstChild);
_1078.removeChild(_1078.firstChild);
}
for(var i=_1079.length-1;i>=0;i--){
if(_1079[i]){
_1078.appendChild(_1079[i]);
}
}
}});
dojo.declare("dijit.form._SliderMover",dojo.dnd.Mover,{onMouseMove:function(e){
var _107c=this.widget;
var _107d=_107c._abspos;
if(!_107d){
_107d=_107c._abspos=dojo.coords(_107c.sliderBarContainer,true);
_107c._setPixelValue_=dojo.hitch(_107c,"_setPixelValue");
_107c._isReversed_=_107c._isReversed();
}
var _107e=e[_107c._mousePixelCoord]-_107d[_107c._startingPixelCoord];
_107c._setPixelValue_(_107c._isReversed_?(_107d[_107c._pixelCount]-_107e):_107e,_107d[_107c._pixelCount],false);
},destroy:function(e){
dojo.dnd.Mover.prototype.destroy.apply(this,arguments);
var _1080=this.widget;
_1080._abspos=null;
_1080._setValueAttr(_1080.value,true);
}});
dojo.declare("dijit.form.HorizontalRule",[dijit._Widget,dijit._Templated],{templateString:"<div class=\"dijitRuleContainer dijitRuleContainerH\"></div>",count:3,container:"containerNode",ruleStyle:"",_positionPrefix:"<div class=\"dijitRuleMark dijitRuleMarkH\" style=\"left:",_positionSuffix:"%;",_suffix:"\"></div>",_genHTML:function(pos,ndx){
return this._positionPrefix+pos+this._positionSuffix+this.ruleStyle+this._suffix;
},_isHorizontal:true,postCreate:function(){
var _1083;
if(this.count==1){
_1083=this._genHTML(50,0);
}else{
var i;
var _1085=100/(this.count-1);
if(!this._isHorizontal||this.isLeftToRight()){
_1083=this._genHTML(0,0);
for(i=1;i<this.count-1;i++){
_1083+=this._genHTML(_1085*i,i);
}
_1083+=this._genHTML(100,this.count-1);
}else{
_1083=this._genHTML(100,0);
for(i=1;i<this.count-1;i++){
_1083+=this._genHTML(100-_1085*i,i);
}
_1083+=this._genHTML(0,this.count-1);
}
}
this.domNode.innerHTML=_1083;
}});
dojo.declare("dijit.form.VerticalRule",dijit.form.HorizontalRule,{templateString:"<div class=\"dijitRuleContainer dijitRuleContainerV\"></div>",_positionPrefix:"<div class=\"dijitRuleMark dijitRuleMarkV\" style=\"top:",_isHorizontal:false});
dojo.declare("dijit.form.HorizontalRuleLabels",dijit.form.HorizontalRule,{templateString:"<div class=\"dijitRuleContainer dijitRuleContainerH dijitRuleLabelsContainer dijitRuleLabelsContainerH\"></div>",labelStyle:"",labels:[],numericMargin:0,minimum:0,maximum:1,constraints:{pattern:"#%"},_positionPrefix:"<div class=\"dijitRuleLabelContainer dijitRuleLabelContainerH\" style=\"left:",_labelPrefix:"\"><span class=\"dijitRuleLabel dijitRuleLabelH\">",_suffix:"</span></div>",_calcPosition:function(pos){
return pos;
},_genHTML:function(pos,ndx){
return this._positionPrefix+this._calcPosition(pos)+this._positionSuffix+this.labelStyle+this._labelPrefix+this.labels[ndx]+this._suffix;
},getLabels:function(){
var _1089=this.labels;
if(!_1089.length){
_1089=dojo.query("> li",this.srcNodeRef).map(function(node){
return String(node.innerHTML);
});
}
this.srcNodeRef.innerHTML="";
if(!_1089.length&&this.count>1){
var start=this.minimum;
var inc=(this.maximum-start)/(this.count-1);
for(var i=0;i<this.count;i++){
_1089.push((i<this.numericMargin||i>=(this.count-this.numericMargin))?"":dojo.number.format(start,this.constraints));
start+=inc;
}
}
return _1089;
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
var _1091=oSel.getRangeAt(0);
if((_1091.startContainer==_1091.endContainer)&&((_1091.endOffset-_1091.startOffset)==1)&&(_1091.startContainer.nodeType!=3)){
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
var _1092=dojo.global.getSelection();
if(_1092){
return _1092.toString();
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
var _1093=dojo.global.getSelection();
if(_1093&&_1093.rangeCount){
var frag=_1093.getRangeAt(0).cloneContents();
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
var _1097=dojo.global.getSelection();
return _1097.anchorNode.childNodes[_1097.anchorOffset];
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
var _109a=dojo.global.getSelection();
if(_109a){
var node=_109a.anchorNode;
while(node&&(node.nodeType!=1)){
node=node.parentNode;
}
return node;
}
}
}
return null;
},hasAncestorElement:function(_109c){
return this.getAncestorElement.apply(this,arguments)!=null;
},getAncestorElement:function(_109d){
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
},collapse:function(_10a6){
if(window["getSelection"]){
var _10a7=dojo.global.getSelection();
if(_10a7.removeAllRanges){
if(_10a6){
_10a7.collapseToStart();
}else{
_10a7.collapseToEnd();
}
}else{
_10a7.collapse(_10a6);
}
}else{
if(dojo.doc.selection){
var range=dojo.doc.selection.createRange();
range.collapse(_10a6);
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
},selectElementChildren:function(_10aa,_10ab){
var _10ac=dojo.global;
var _10ad=dojo.doc;
_10aa=dojo.byId(_10aa);
if(_10ad.selection&&dojo.body().createTextRange){
var range=_10aa.ownerDocument.body.createTextRange();
range.moveToElementText(_10aa);
if(!_10ab){
try{
range.select();
}
catch(e){
}
}
}else{
if(_10ac.getSelection){
var _10af=_10ac.getSelection();
if(_10af.setBaseAndExtent){
_10af.setBaseAndExtent(_10aa,0,_10aa,_10aa.innerText.length-1);
}else{
if(_10af.selectAllChildren){
_10af.selectAllChildren(_10aa);
}
}
}
}
},selectElement:function(_10b0,_10b1){
var range,_10b3=dojo.doc;
_10b0=dojo.byId(_10b0);
if(_10b3.selection&&dojo.body().createTextRange){
try{
range=dojo.body().createControlRange();
range.addElement(_10b0);
if(!_10b1){
range.select();
}
}
catch(e){
this.selectElementChildren(_10b0,_10b1);
}
}else{
if(dojo.global.getSelection){
var _10b4=dojo.global.getSelection();
if(_10b4.removeAllRanges){
range=_10b3.createRange();
range.selectNode(_10b0);
_10b4.removeAllRanges();
_10b4.addRange(range);
}
}
}
}});
}
if(!dojo._hasResource["dijit._editor.range"]){
dojo._hasResource["dijit._editor.range"]=true;
dojo.provide("dijit._editor.range");
dijit.range={};
dijit.range.getIndex=function(node,_10b6){
var ret=[],retR=[];
var stop=_10b6;
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
dijit.range.getNode=function(index,_10bf){
if(!dojo.isArray(index)||index.length==0){
return _10bf;
}
var node=_10bf;
dojo.every(index,function(i){
if(i>=0&&i<node.childNodes.length){
node=node.childNodes[i];
}else{
node=null;
console.debug("Error: can not find node with index",index,"under parent node",_10bf);
return false;
}
return true;
});
return node;
};
dijit.range.getCommonAncestor=function(n1,n2){
var _10c4=function(n){
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
var n1as=_10c4(n1);
var n2as=_10c4(n2);
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
var block=null,_10d4;
while(node&&node!==root){
var name=node.nodeName.toUpperCase();
if(!block&&regex.test(name)){
block=node;
}
if(!_10d4&&(/^(?:BODY|TD|TH|CAPTION)$/).test(name)){
_10d4=node;
}
node=node.parentNode;
}
return {blockNode:block,blockContainer:_10d4||node.ownerDocument.body};
};
dijit.range.atBeginningOfContainer=function(_10d6,node,_10d8){
var _10d9=false;
var _10da=(_10d8==0);
if(!_10da&&node.nodeType==3){
if(dojo.trim(node.nodeValue.substr(0,_10d8))==0){
_10da=true;
}
}
if(_10da){
var cnode=node;
_10d9=true;
while(cnode&&cnode!==_10d6){
if(cnode.previousSibling){
_10d9=false;
break;
}
cnode=cnode.parentNode;
}
}
return _10d9;
};
dijit.range.atEndOfContainer=function(_10dc,node,_10de){
var atEnd=false;
var _10e0=(_10de==(node.length||node.childNodes.length));
if(!_10e0&&node.nodeType==3){
if(dojo.trim(node.nodeValue.substr(_10de))==0){
_10e0=true;
}
}
if(_10e0){
var cnode=node;
atEnd=true;
while(cnode&&cnode!==_10dc){
if(cnode.nextSibling){
atEnd=false;
break;
}
cnode=cnode.parentNode;
}
}
return atEnd;
};
dijit.range.adjacentNoneTextNode=function(_10e2,next){
var node=_10e2;
var len=(0-_10e2.length)||0;
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
dijit.range.getSelection=function(win,_10e8){
if(dijit.range._w3c){
return win.getSelection();
}else{
var s=new dijit.range.ie.selection(win);
if(!_10e8){
s._getCurrentSelection();
}
return s;
}
};
if(!dijit.range._w3c){
dijit.range.ie={cachedSelection:{},selection:function(win){
this._ranges=[];
this.addRange=function(r,_10ec){
this._ranges.push(r);
if(!_10ec){
r._select();
}
this.rangeCount=this._ranges.length;
};
this.removeAllRanges=function(){
this._ranges=[];
this.rangeCount=0;
};
var _10ed=function(){
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
var r=_10ed();
if(r){
this.addRange(r,true);
}
};
},decomposeControlRange:function(range){
var _10f3=range.item(0),_10f4=range.item(range.length-1);
var _10f5=_10f3.parentNode,_10f6=_10f4.parentNode;
var _10f7=dijit.range.getIndex(_10f3,_10f5).o;
var _10f8=dijit.range.getIndex(_10f4,_10f6).o+1;
return [[_10f5,_10f7],[_10f6,_10f8]];
},getEndPoint:function(range,end){
var _10fb=range.duplicate();
_10fb.collapse(!end);
var _10fc="EndTo"+(end?"End":"Start");
var _10fd=_10fb.parentElement();
var _10fe,_10ff,_1100;
if(_10fd.childNodes.length>0){
dojo.every(_10fd.childNodes,function(node,i){
var _1103;
if(node.nodeType!=3){
_10fb.moveToElementText(node);
if(_10fb.compareEndPoints(_10fc,range)>0){
_10fe=node.previousSibling;
if(_1100&&_1100.nodeType==3){
_10fe=_1100;
_1103=true;
}else{
_10fe=_10fd;
_10ff=i;
return false;
}
}else{
if(i==_10fd.childNodes.length-1){
_10fe=_10fd;
_10ff=_10fd.childNodes.length;
return false;
}
}
}else{
if(i==_10fd.childNodes.length-1){
_10fe=node;
_1103=true;
}
}
if(_1103&&_10fe){
var _1104=dijit.range.adjacentNoneTextNode(_10fe)[0];
if(_1104){
_10fe=_1104.nextSibling;
}else{
_10fe=_10fd.firstChild;
}
var _1105=dijit.range.adjacentNoneTextNode(_10fe);
_1104=_1105[0];
var _1106=_1105[1];
if(_1104){
_10fb.moveToElementText(_1104);
_10fb.collapse(false);
}else{
_10fb.moveToElementText(_10fd);
}
_10fb.setEndPoint(_10fc,range);
_10ff=_10fb.text.length-_1106;
return false;
}
_1100=node;
return true;
});
}else{
_10fe=_10fd;
_10ff=0;
}
if(!end&&_10fe.nodeType!=3&&_10ff==_10fe.childNodes.length){
if(_10fe.nextSibling&&_10fe.nextSibling.nodeType==3){
_10fe=_10fe.nextSibling;
_10ff=0;
}
}
return [_10fe,_10ff];
},setEndPoint:function(range,_1108,_1109){
var _110a=range.duplicate(),node,len;
if(_1108.nodeType!=3){
_110a.moveToElementText(_1108);
_110a.collapse(true);
if(_1109==_1108.childNodes.length){
if(_1109>0){
node=_1108.lastChild;
len=0;
while(node&&node.nodeType==3){
len+=node.length;
_1108=node;
node=node.previousSibling;
}
if(node){
_110a.moveToElementText(node);
}
_110a.collapse(false);
_1109=len;
}else{
_110a.moveToElementText(_1108);
_110a.collapse(true);
}
}else{
if(_1109>0){
node=_1108.childNodes[_1109-1];
if(node.nodeType==3){
_1108=node;
_1109=node.length;
}else{
_110a.moveToElementText(node);
_110a.collapse(false);
}
}
}
}
if(_1108.nodeType==3){
var _110d=dijit.range.adjacentNoneTextNode(_1108);
var _110e=_110d[0];
len=_110d[1];
if(_110e){
_110a.moveToElementText(_110e);
_110a.collapse(false);
if(_110e.contentEditable!="inherit"){
len++;
}
}else{
_110a.moveToElementText(_1108.parentNode);
_110a.collapse(true);
}
_1109+=len;
if(_1109>0){
if(_110a.move("character",_1109)!=_1109){
console.error("Error when moving!");
}
}
}
return _110a;
},decomposeTextRange:function(range){
var _1110=dijit.range.ie.getEndPoint(range);
var _1111=_1110[0],_1112=_1110[1];
var _1113=_1110[0],_1114=_1110[1];
if(range.htmlText.length){
if(range.htmlText==range.text){
_1114=_1112+range.text.length;
}else{
_1110=dijit.range.ie.getEndPoint(range,true);
_1113=_1110[0],_1114=_1110[1];
}
}
return [[_1111,_1112],[_1113,_1114]];
},setRange:function(range,_1116,_1117,_1118,_1119,_111a){
var _111b=dijit.range.ie.setEndPoint(range,_1116,_1117);
range.setEndPoint("StartToStart",_111b);
var _111c=_111b;
if(!_111a){
_111c=dijit.range.ie.setEndPoint(range,_1118,_1119);
}
range.setEndPoint("EndToEnd",_111c);
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
},setStart:function(node,_1122){
_1122=parseInt(_1122);
if(this.startContainer===node&&this.startOffset==_1122){
return;
}
delete this._cachedBookmark;
this.startContainer=node;
this.startOffset=_1122;
if(!this.endContainer){
this.setEnd(node,_1122);
}else{
this._updateInternal();
}
},setEnd:function(node,_1124){
_1124=parseInt(_1124);
if(this.endContainer===node&&this.endOffset==_1124){
return;
}
delete this._cachedBookmark;
this.endContainer=node;
this.endOffset=_1124;
if(!this.startContainer){
this.setStart(node,_1124);
}else{
this._updateInternal();
}
},setStartAfter:function(node,_1126){
this._setPoint("setStart",node,_1126,1);
},setStartBefore:function(node,_1128){
this._setPoint("setStart",node,_1128,0);
},setEndAfter:function(node,_112a){
this._setPoint("setEnd",node,_112a,1);
},setEndBefore:function(node,_112c){
this._setPoint("setEnd",node,_112c,0);
},_setPoint:function(what,node,_112f,ext){
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
dijit._editor.escapeXml=function(str,_1138){
str=str.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;");
if(!_1138){
str=str.replace(/'/gm,"&#39;");
}
return str;
};
dijit._editor.getNodeHtml=function(node){
var _113a;
switch(node.nodeType){
case 1:
_113a="<"+node.nodeName.toLowerCase();
var _113b=[];
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
_113b.push([key,node.getAttribute("_djrealurl")]);
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
_113b.push([key,val.toString()]);
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
_113b.push([n,v]);
}
}
}
_113b.sort(function(a,b){
return a[0]<b[0]?-1:(a[0]==b[0]?0:1);
});
var j=0;
while((attr=_113b[j++])){
_113a+=" "+attr[0]+"=\""+(dojo.isString(attr[1])?dijit._editor.escapeXml(attr[1],true):attr[1])+"\"";
}
if(node.childNodes.length){
_113a+=">"+dijit._editor.getChildrenHtml(node)+"</"+node.nodeName.toLowerCase()+">";
}else{
_113a+=" />";
}
break;
case 3:
_113a=dijit._editor.escapeXml(node.nodeValue,true);
break;
case 8:
_113a="<!--"+dijit._editor.escapeXml(node.nodeValue,true)+"-->";
break;
default:
_113a="<!-- Element not recognized - Type: "+node.nodeType+" Name: "+node.nodeName+"-->";
}
return _113a;
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
var _114d=dojo.doc.createElement("textarea");
_114d.id=dijit._scopeName+"._editor.RichText.savedContent";
var s=_114d.style;
s.display="none";
s.position="absolute";
s.top="-100px";
s.left="-100px";
s.height="3px";
s.width="3px";
dojo.body().appendChild(_114d);
})();
}else{
try{
dojo.doc.write("<textarea id=\""+dijit._scopeName+"._editor.RichText.savedContent\" "+"style=\"display:none;position:absolute;top:-100px;left:-100px;height:3px;width:3px;overflow:hidden;\"></textarea>");
}
catch(e){
}
}
}
dojo.declare("dijit._editor.RichText",dijit._Widget,{constructor:function(_114f){
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
var _1153={b:exec("bold"),i:exec("italic"),u:exec("underline"),a:exec("selectall"),s:function(){
this.save(true);
},m:function(){
this.isTabIndent=!this.isTabIndent;
},"1":exec("formatblock","h1"),"2":exec("formatblock","h2"),"3":exec("formatblock","h3"),"4":exec("formatblock","h4"),"\\":exec("insertunorderedlist")};
if(!dojo.isIE){
_1153.Z=exec("redo");
}
for(var key in _1153){
this.addKeyHandler(key,true,false,_1153[key]);
}
},events:["onKeyPress","onKeyDown","onKeyUp","onClick"],captureEvents:[],_editorCommandsLocalized:false,_localizeEditorCommands:function(){
if(this._editorCommandsLocalized){
return;
}
this._editorCommandsLocalized=true;
var _1155=["div","p","pre","h1","h2","h3","h4","h5","h6","ol","ul","address"];
var _1156="",_1157,i=0;
while((_1157=_1155[i++])){
if(_1157.charAt(1)!="l"){
_1156+="<"+_1157+"><span>content</span></"+_1157+"><br/>";
}else{
_1156+="<"+_1157+"><li>content</li></"+_1157+"><br/>";
}
}
var div=dojo.doc.createElement("div");
dojo.style(div,{position:"absolute",left:"-2000px",top:"-2000px"});
dojo.doc.body.appendChild(div);
div.innerHTML=_1156;
var node=div.firstChild;
while(node){
dijit._editor.selection.selectElement(node.firstChild);
dojo.withGlobal(this.window,"selectElement",dijit._editor.selection,[node.firstChild]);
var _115b=node.tagName.toLowerCase();
this._local2NativeFormatNames[_115b]=document.queryCommandValue("formatblock");
this._native2LocalFormatNames[this._local2NativeFormatNames[_115b]]=_115b;
node=node.nextSibling.nextSibling;
}
dojo.body().removeChild(div);
},open:function(_115c){
if((!this.onLoadDeferred)||(this.onLoadDeferred.fired>=0)){
this.onLoadDeferred=new dojo.Deferred();
}
if(!this.isClosed){
this.close();
}
dojo.publish(dijit._scopeName+"._editor.RichText::open",[this]);
this._content="";
if((arguments.length==1)&&(_115c["nodeName"])){
this.domNode=_115c;
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
var _1160=dojo.hitch(this,function(){
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
setTimeout(_1160,10);
}else{
_1160();
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
var _1161=dojo.contentBox(dn);
this._oldHeight=_1161.h;
this._oldWidth=_1161.w;
this.savedContent=html;
if((dn["nodeName"])&&(dn.nodeName=="LI")){
dn.innerHTML=" <br>";
}
this.editingArea=dn.ownerDocument.createElement("div");
dn.appendChild(this.editingArea);
if(this.name!=""&&(!dojo.config["useXDomain"]||dojo.config["allowXdRichTextSave"])){
var _1162=dojo.byId(dijit._scopeName+"._editor.RichText.savedContent");
if(_1162.value!=""){
var datas=_1162.value.split(this._SEPARATOR),i=0,dat;
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
var _116a=dojo.hitch(this,function(){
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
_116a();
}
},100);
}else{
h=dojo.connect(((dojo.isIE)?ifr.contentWindow:ifr),"onload",_116a);
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
var _1170=_cs.lineHeight;
if(_1170.indexOf("px")>=0){
_1170=parseFloat(_1170)/parseFloat(_cs.fontSize);
}else{
if(_1170.indexOf("em")>=0){
_1170=parseFloat(_1170);
}else{
_1170="1.0";
}
}
var _1171="";
this.style.replace(/(^|;)(line-|font-?)[^;]+/g,function(match){
_1171+=match.replace(/^;/g,"")+";";
});
return [this.isLeftToRight()?"<html><head>":"<html dir='rtl'><head>",(dojo.isMoz?"<title>"+this._localizedIframeTitles.iframeEditTitle+"</title>":""),"<style>","body,html {","\tbackground:transparent;","\tpadding: 1em 0 0 0;","\tmargin: -1em 0 0 0;","\theight: 100%;","}","body{","\ttop:0px; left:0px; right:0px;","\tfont:",font,";",((this.height||dojo.isOpera)?"":"position: fixed;"),"\tmin-height:",this.minHeight,";","\tline-height:",_1170,"}","p{ margin: 1em 0 !important; }",(this.height?"":"body,html{height:auto;overflow-y:hidden;/*for IE*/} body > div {overflow-x:auto;/*for FF to show vertical scrollbar*/}"),"li > ul:-moz-first-node, li > ol:-moz-first-node{ padding-top: 1.2em; } ","li{ min-height:1.2em; }","</style>",this._applyEditingAreaStyleSheets(),"</head><body style='"+_1171+"'>"+html+"</body></html>"].join("");
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
var _1177;
if(this.textarea){
_1177=this.srcNodeRef;
}else{
_1177=dojo.doc.createElement("div");
_1177.style.display="none";
_1177.innerHTML=html;
this.editingArea.appendChild(_1177);
}
this.editingArea.appendChild(this.iframe);
var _1178=dojo.hitch(this,function(){
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
setTimeout(_1178,50);
return;
}
var _1179=this.document;
_1179.open();
if(dojo.isAIR){
_1179.body.innerHTML=html;
}else{
_1179.write(this._getIframeDocTxt(html));
}
_1179.close();
dojo._destroyElement(_1177);
}
if(!this.document.body){
setTimeout(_1178,50);
return;
}
this.onLoad();
}else{
dojo._destroyElement(_1177);
this.editNode.innerHTML=html;
this.onDisplayChanged();
}
this._preDomFilterContent(this.editNode);
});
_1178();
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
var _117e=(new dojo._Url(dojo.global.location,url)).toString();
this.editingAreaStyleSheets.push(_117e);
text+="<link rel=\"stylesheet\" type=\"text/css\" href=\""+_117e+"\"/>";
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
var _1182=this.document.createElement("link");
with(_1182){
rel="stylesheet";
type="text/css";
href=url;
}
head.appendChild(_1182);
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
var _1187=dojo.isIE&&(this.isLoaded||!this.focusOnLoad);
if(_1187){
this.editNode.unselectable="on";
}
this.editNode.contentEditable=!value;
if(_1187){
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
var _118d=this.tabStop=dojo.doc.createElement("<div tabIndex=-1>");
this.editingArea.appendChild(_118d);
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
var _118e=dojo.connect(this,"onClick",this,function(){
this.attr("disabled",false);
dojo.disconnect(_118e);
});
}
this._preDomFilterContent(this.editNode);
var _118f=this.events.concat(this.captureEvents);
var ap=(this.iframe)?this.document:this.editNode;
dojo.forEach(_118f,function(item){
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
var _1194=dojo.isFF<3?this.iframe.contentDocument:this.iframe;
_1194.title=this._localizedIframeTitles.iframeFocusTitle;
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
},setDisabled:function(_1196){
dojo.deprecated("dijit.Editor::setDisabled is deprecated","use dijit.Editor::attr(\"disabled\",boolean) instead",2);
this.attr("disabled",_1196);
},_setValueAttr:function(value){
this.setValue(value);
},onKeyPress:function(e){
var c=(e.keyChar&&e.keyChar.toLowerCase())||e.keyCode;
var _119a=this._keyHandlers[c];
var args=arguments;
if(_119a){
dojo.forEach(_119a,function(h){
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
},addKeyHandler:function(key,ctrl,shift,_11a0){
if(!dojo.isArray(this._keyHandlers[key])){
this._keyHandlers[key]=[];
}
this._keyHandlers[key].push({shift:shift||false,ctrl:ctrl||false,handler:_11a0});
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
var _11a5=dojo.isFF<3?this.iframe.contentDocument:this.iframe;
_11a5.title=this._localizedIframeTitles.iframeEditTitle;
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
},onChange:function(_11a8){
},_normalizeCommand:function(cmd){
var _11aa=cmd.toLowerCase();
if(_11aa=="formatblock"){
if(dojo.isSafari){
_11aa="heading";
}
}else{
if(_11aa=="hilitecolor"&&!dojo.isMoz){
_11aa="backcolor";
}
}
return _11aa;
},_qcaCache:{},queryCommandAvailable:function(_11ab){
var ca=this._qcaCache[_11ab];
if(ca!=undefined){
return ca;
}
return this._qcaCache[_11ab]=this._queryCommandAvailable(_11ab);
},_queryCommandAvailable:function(_11ad){
var ie=1;
var _11af=1<<1;
var _11b0=1<<2;
var opera=1<<3;
var _11b2=1<<4;
var gt420=dojo.isSafari;
function isSupportedBy(_11b4){
return {ie:Boolean(_11b4&ie),mozilla:Boolean(_11b4&_11af),safari:Boolean(_11b4&_11b0),safari420:Boolean(_11b4&_11b2),opera:Boolean(_11b4&opera)};
};
var _11b5=null;
switch(_11ad.toLowerCase()){
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
_11b5=isSupportedBy(_11af|ie|_11b0|opera);
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
_11b5=isSupportedBy(_11af|ie|opera|_11b2);
break;
case "blockdirltr":
case "blockdirrtl":
case "dirltr":
case "dirrtl":
case "inlinedirltr":
case "inlinedirrtl":
_11b5=isSupportedBy(ie);
break;
case "cut":
case "copy":
case "paste":
_11b5=isSupportedBy(ie|_11af|_11b2);
break;
case "inserttable":
_11b5=isSupportedBy(_11af|ie);
break;
case "insertcell":
case "insertcol":
case "insertrow":
case "deletecells":
case "deletecols":
case "deleterows":
case "mergecells":
case "splitcell":
_11b5=isSupportedBy(ie|_11af);
break;
default:
return false;
}
return (dojo.isIE&&_11b5.ie)||(dojo.isMoz&&_11b5.mozilla)||(dojo.isSafari&&_11b5.safari)||(gt420&&_11b5.safari420)||(dojo.isOpera&&_11b5.opera);
},execCommand:function(_11b6,_11b7){
var _11b8;
this.focus();
_11b6=this._normalizeCommand(_11b6);
if(_11b7!=undefined){
if(_11b6=="heading"){
throw new Error("unimplemented");
}else{
if((_11b6=="formatblock")&&dojo.isIE){
_11b7="<"+_11b7+">";
}
}
}
if(_11b6=="inserthtml"){
_11b7=this._preFilterContent(_11b7);
_11b8=true;
if(dojo.isIE){
var _11b9=this.document.selection.createRange();
if(this.document.selection.type.toUpperCase()=="CONTROL"){
var n=_11b9.item(0);
while(_11b9.length){
_11b9.remove(_11b9.item(0));
}
n.outerHTML=_11b7;
}else{
_11b9.pasteHTML(_11b7);
}
_11b9.select();
}else{
if(dojo.isMoz&&!_11b7.length){
this._sCall("remove");
}else{
_11b8=this.document.execCommand(_11b6,false,_11b7);
}
}
}else{
if((_11b6=="unlink")&&(this.queryCommandEnabled("unlink"))&&(dojo.isMoz||dojo.isSafari)){
var a=this._sCall("getAncestorElement",["a"]);
this._sCall("selectElement",[a]);
_11b8=this.document.execCommand("unlink",false,null);
}else{
if((_11b6=="hilitecolor")&&(dojo.isMoz)){
this.document.execCommand("styleWithCSS",false,true);
_11b8=this.document.execCommand(_11b6,false,_11b7);
this.document.execCommand("styleWithCSS",false,false);
}else{
if((dojo.isIE)&&((_11b6=="backcolor")||(_11b6=="forecolor"))){
_11b7=arguments.length>1?_11b7:null;
_11b8=this.document.execCommand(_11b6,false,_11b7);
}else{
_11b7=arguments.length>1?_11b7:null;
if(_11b7||_11b6!="createlink"){
_11b8=this.document.execCommand(_11b6,false,_11b7);
}
}
}
}
}
this.onDisplayChanged();
return _11b8;
},queryCommandEnabled:function(_11bc){
if(this.disabled){
return false;
}
_11bc=this._normalizeCommand(_11bc);
if(dojo.isMoz||dojo.isSafari){
if(_11bc=="unlink"){
this._sCall("hasAncestorElement",["a"]);
}else{
if(_11bc=="inserttable"){
return true;
}
}
}
if(dojo.isSafari){
if(_11bc=="copy"){
_11bc="cut";
}else{
if(_11bc=="paste"){
return true;
}
}
}
if(_11bc=="indent"){
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
if(_11bc=="outdent"){
return this._sCall("hasAncestorElement",["li"]);
}
}
var elem=dojo.isIE?this.document.selection.createRange():this.document;
return elem.queryCommandEnabled(_11bc);
},queryCommandState:function(_11c0){
if(this.disabled){
return false;
}
_11c0=this._normalizeCommand(_11c0);
return this.document.queryCommandState(_11c0);
},queryCommandValue:function(_11c1){
if(this.disabled){
return false;
}
var r;
_11c1=this._normalizeCommand(_11c1);
if(dojo.isIE&&_11c1=="formatblock"){
r=this._native2LocalFormatNames[this.document.queryCommandValue(_11c1)];
}else{
r=this.document.queryCommandValue(_11c1);
}
return r;
},_sCall:function(name,args){
return dojo.withGlobal(this.window,name,dijit._editor.selection,args);
},placeCursorAtStart:function(){
this.focus();
var _11c5=false;
if(dojo.isMoz){
var first=this.editNode.firstChild;
while(first){
if(first.nodeType==3){
if(first.nodeValue.replace(/^\s+|\s+$/g,"").length>0){
_11c5=true;
this._sCall("selectElement",[first]);
break;
}
}else{
if(first.nodeType==1){
_11c5=true;
this._sCall("selectElementChildren",[first]);
break;
}
}
first=first.nextSibling;
}
}else{
_11c5=true;
this._sCall("selectElementChildren",[this.editNode]);
}
if(_11c5){
this._sCall("collapse",[true]);
}
},placeCursorAtEnd:function(){
this.focus();
var _11c7=false;
if(dojo.isMoz){
var last=this.editNode.lastChild;
while(last){
if(last.nodeType==3){
if(last.nodeValue.replace(/^\s+|\s+$/g,"").length>0){
_11c7=true;
this._sCall("selectElement",[last]);
break;
}
}else{
if(last.nodeType==1){
_11c7=true;
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
_11c7=true;
this._sCall("selectElementChildren",[this.editNode]);
}
if(_11c7){
this._sCall("collapse",[false]);
}
},getValue:function(_11c9){
if(this.textarea){
if(this.isClosed||!this.isLoaded){
return this.textarea.value;
}
}
return this._postFilterContent(null,_11c9);
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
},_postFilterContent:function(dom,_11d3){
var ec;
if(!dojo.isString(dom)){
dom=dom||this.editNode;
if(this.contentDomPostFilters.length){
if(_11d3){
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
var _11d8=dojo.byId(dijit._scopeName+"._editor.RichText.savedContent");
_11d8.value+=this._SEPARATOR+this.name+":"+this.getValue();
},escapeXml:function(str,_11da){
str=str.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;");
if(!_11da){
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
var _11df=(this.savedContent!=this._content);
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
return _11df;
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
var _11e9=this.iconClassPrefix+" "+this.iconClassPrefix+this.command.charAt(0).toUpperCase()+this.command.substr(1);
if(!this.button){
props=dojo.mixin({label:label,showLabel:false,iconClass:_11e9,dropDown:this.dropDown,tabIndex:"-1"},props||{});
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
var _11f0=_e.queryCommandEnabled(_c);
if(this.enabled!==_11f0){
this.enabled=_11f0;
this.button.attr("disabled",!_11f0);
}
if(typeof this.button.checked=="boolean"){
var _11f1=_e.queryCommandState(_c);
if(this.checked!==_11f1){
this.checked=_11f1;
this.button.attr("checked",_e.queryCommandState(_c));
}
}
}
catch(e){
console.debug(e);
}
}
},setEditor:function(_11f2){
this.editor=_11f2;
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
},setToolbar:function(_11f3){
if(this.button){
_11f3.addChild(this.button);
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
},setEditor:function(_11f5){
this.editor=_11f5;
if(this.blockNodeForEnter=="BR"){
if(dojo.isIE){
_11f5.contentDomPreFilters.push(dojo.hitch(this,"regularPsToSingleLinePs"));
_11f5.contentDomPostFilters.push(dojo.hitch(this,"singleLinePsToRegularPs"));
_11f5.onLoadDeferred.addCallback(dojo.hitch(this,"_fixNewLineBehaviorForIE"));
}else{
_11f5.onLoadDeferred.addCallback(dojo.hitch(this,function(d){
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
_11f5.addKeyHandler(13,0,0,h);
_11f5.addKeyHandler(13,0,1,h);
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
var _11fc=dojo.withGlobal(this.editor.window,"getAncestorElement",dijit._editor.selection,["LI"]);
if(!_11fc){
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
if(_11fc.parentNode.parentNode.nodeName=="LI"){
_11fc=_11fc.parentNode.parentNode;
}
}
var fc=_11fc.firstChild;
if(fc&&fc.nodeType==1&&(fc.nodeName=="UL"||fc.nodeName=="OL")){
_11fc.insertBefore(fc.ownerDocument.createTextNode(" "),fc);
var _1200=dijit.range.create();
_1200.setStart(_11fc.firstChild,0);
var _1201=dijit.range.getSelection(this.editor.window,true);
_1201.removeAllRanges();
_1201.addRange(_1200);
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
var _1203,range,_1205,doc=this.editor.document,br;
if(e.shiftKey||this.blockNodeForEnter=="BR"){
var _1208=dojo.withGlobal(this.editor.window,"getParentElement",dijit._editor.selection);
var _1209=dijit.range.getAncestor(_1208,this.blockNodes);
if(_1209){
if(!e.shiftKey&&_1209.tagName=="LI"){
return true;
}
_1203=dijit.range.getSelection(this.editor.window);
range=_1203.getRangeAt(0);
if(!range.collapsed){
range.deleteContents();
}
if(dijit.range.atBeginningOfContainer(_1209,range.startContainer,range.startOffset)){
if(e.shiftKey){
br=doc.createElement("br");
_1205=dijit.range.create();
_1209.insertBefore(br,_1209.firstChild);
_1205.setStartBefore(br.nextSibling);
_1203.removeAllRanges();
_1203.addRange(_1205);
}else{
dojo.place(br,_1209,"before");
}
}else{
if(dijit.range.atEndOfContainer(_1209,range.startContainer,range.startOffset)){
_1205=dijit.range.create();
br=doc.createElement("br");
if(e.shiftKey){
_1209.appendChild(br);
_1209.appendChild(doc.createTextNode(" "));
_1205.setStart(_1209.lastChild,0);
}else{
dojo.place(br,_1209,"after");
_1205.setStartAfter(_1209);
}
_1203.removeAllRanges();
_1203.addRange(_1205);
}else{
return true;
}
}
}else{
dijit._editor.RichText.prototype.execCommand.call(this.editor,"inserthtml","<br>");
}
return false;
}
var _120a=true;
_1203=dijit.range.getSelection(this.editor.window);
range=_1203.getRangeAt(0);
if(!range.collapsed){
range.deleteContents();
}
var block=dijit.range.getBlockAncestor(range.endContainer,null,this.editor.editNode);
var _120c=block.blockNode;
if((this._checkListLater=(_120c&&(_120c.nodeName=="LI"||_120c.parentNode.nodeName=="LI")))){
if(dojo.isMoz){
this._pressedEnterInBlock=_120c;
}
if(/^(?:\s|&nbsp;)$/.test(_120c.innerHTML)){
_120c.innerHTML="";
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
_1203=dijit.range.getSelection(this.editor.window);
range=_1203.getRangeAt(0);
}
var _120d=doc.createElement(this.blockNodeForEnter);
_120d.innerHTML=this.bogusHtmlContent;
this.removeTrailingBr(block.blockNode);
if(dijit.range.atEndOfContainer(block.blockNode,range.endContainer,range.endOffset)){
if(block.blockNode===block.blockContainer){
block.blockNode.appendChild(_120d);
}else{
dojo.place(_120d,block.blockNode,"after");
}
_120a=false;
_1205=dijit.range.create();
_1205.setStart(_120d,0);
_1203.removeAllRanges();
_1203.addRange(_1205);
if(this.editor.height){
_120d.scrollIntoView(false);
}
}else{
if(dijit.range.atBeginningOfContainer(block.blockNode,range.startContainer,range.startOffset)){
dojo.place(_120d,block.blockNode,block.blockNode===block.blockContainer?"first":"before");
if(_120d.nextSibling&&this.editor.height){
_120d.nextSibling.scrollIntoView(false);
}
_120a=false;
}else{
if(dojo.isMoz){
this._pressedEnterInBlock=block.blockNode;
}
}
}
return _120a;
},removeTrailingBr:function(_120e){
var para=/P|DIV|LI/i.test(_120e.tagName)?_120e:dijit._editor.selection.getParentOfType(_120e,["P","DIV","LI"]);
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
var _1211="p{margin:0 !important;}";
var _1212=function(_1213,doc,URI){
if(!_1213){
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
var _1218=function(){
try{
style.styleSheet.cssText=_1213;
}
catch(e){
console.debug(e);
}
};
if(style.styleSheet.disabled){
setTimeout(_1218,10);
}else{
_1218();
}
}else{
var _1219=doc.createTextNode(_1213);
style.appendChild(_1219);
}
return style;
};
_1212(_1211,this.editor.document);
this.editor.document.__INSERTED_EDITIOR_NEWLINE_CSS=true;
return d;
}
return null;
},regularPsToSingleLinePs:function(_121a,_121b){
function wrapLinesInPs(el){
function wrapNodes(nodes){
var newP=nodes[0].ownerDocument.createElement("p");
nodes[0].parentNode.insertBefore(newP,nodes[0]);
dojo.forEach(nodes,function(node){
newP.appendChild(node);
});
};
var _1220=0;
var _1221=[];
var _1222;
while(_1220<el.childNodes.length){
_1222=el.childNodes[_1220];
if(_1222.nodeType==3||(_1222.nodeType==1&&_1222.nodeName!="BR"&&dojo.style(_1222,"display")!="block")){
_1221.push(_1222);
}else{
var _1223=_1222.nextSibling;
if(_1221.length){
wrapNodes(_1221);
_1220=(_1220+1)-_1221.length;
if(_1222.nodeName=="BR"){
dojo._destroyElement(_1222);
}
}
_1221=[];
}
_1220++;
}
if(_1221.length){
wrapNodes(_1221);
}
};
function splitP(el){
var _1225=null;
var _1226=[];
var _1227=el.childNodes.length-1;
for(var i=_1227;i>=0;i--){
_1225=el.childNodes[i];
if(_1225.nodeName=="BR"){
var newP=_1225.ownerDocument.createElement("p");
dojo.place(newP,el,"after");
if(_1226.length==0&&i!=_1227){
newP.innerHTML="&nbsp;";
}
dojo.forEach(_1226,function(node){
newP.appendChild(node);
});
dojo._destroyElement(_1225);
_1226=[];
}else{
_1226.unshift(_1225);
}
}
};
var pList=[];
var ps=_121a.getElementsByTagName("p");
dojo.forEach(ps,function(p){
pList.push(p);
});
dojo.forEach(pList,function(p){
if((p.previousSibling)&&(p.previousSibling.nodeName=="P"||dojo.style(p.previousSibling,"display")!="block")){
var newP=p.parentNode.insertBefore(this.document.createElement("p"),p);
newP.innerHTML=_121b?"":"&nbsp;";
}
splitP(p);
},this.editor);
wrapLinesInPs(_121a);
return _121a;
},singleLinePsToRegularPs:function(_1230){
function getParagraphParents(node){
var ps=node.getElementsByTagName("p");
var _1233=[];
for(var i=0;i<ps.length;i++){
var p=ps[i];
var _1236=false;
for(var k=0;k<_1233.length;k++){
if(_1233[k]===p.parentNode){
_1236=true;
break;
}
}
if(!_1236){
_1233.push(p.parentNode);
}
}
return _1233;
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
var _1239=getParagraphParents(_1230);
for(var i=0;i<_1239.length;i++){
var _123b=_1239[i];
var _123c=null;
var node=_123b.firstChild;
var _123e=null;
while(node){
if(node.nodeType!="1"||node.tagName!="P"){
_123c=null;
}else{
if(isParagraphDelimiter(node)){
_123e=node;
_123c=null;
}else{
if(_123c==null){
_123c=node;
}else{
if((!_123c.lastChild||_123c.lastChild.nodeName!="BR")&&(node.firstChild)&&(node.firstChild.nodeName!="BR")){
_123c.appendChild(this.editor.document.createElement("br"));
}
while(node.firstChild){
_123c.appendChild(node.firstChild);
}
_123e=node;
}
}
}
node=node.nextSibling;
if(_123e){
dojo._destroyElement(_123e);
_123e=null;
}
}
}
return _1230;
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
},addPlugin:function(_1240,index){
var args=dojo.isString(_1240)?{name:_1240}:_1240;
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
console.warn("Cannot find plugin",_1240);
return;
}
_1240=o.plugin;
}
if(arguments.length>1){
this._plugins[index]=_1240;
}else{
this._plugins.push(_1240);
}
_1240.setEditor(this);
if(dojo.isFunction(_1240.setToolbar)){
_1240.setToolbar(this.toolbar);
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
var _124f=0;
if(this._savedSelection&&dojo.isIE){
_124f=dijit._curFocus!=this.editNode;
}
this.inherited(arguments);
if(_124f){
this._restoreSelection();
}
},_moveToBookmark:function(b){
var _1251=b;
if(dojo.isIE){
if(dojo.isArray(b)){
_1251=[];
dojo.forEach(b,function(n){
_1251.push(dijit.range.getNode(n,this.editNode));
},this);
}
}else{
var r=dijit.range.create();
r.setStart(dijit.range.getNode(b.startContainer,this.editNode),b.startOffset);
r.setEnd(dijit.range.getNode(b.endContainer,this.editNode),b.endOffset);
_1251=r;
}
dojo.withGlobal(this.window,"moveToBookmark",dijit,[_1251]);
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
},endEditing:function(_1259){
if(this._editTimer){
clearTimeout(this._editTimer);
}
if(this._inEditing){
this._endEditing(_1259);
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
},_endEditing:function(_125e){
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
dojo.declare("dojox.grid.cells._Widget",dgc._Base,{widgetClass:"dijit.form.TextBox",constructor:function(_1269){
this.widget=null;
if(typeof this.widgetClass=="string"){
this.widgetClass=dojo.getObject(this.widgetClass);
}
},formatEditing:function(_126a,_126b){
this.needFormatNode(_126a,_126b);
return "<div></div>";
},getValue:function(_126c){
return this.widget.attr("value");
},setValue:function(_126d,_126e){
if(this.widget&&this.widget.setValue){
this.widget.setValue(_126e);
}else{
this.inherited(arguments);
}
},getWidgetProps:function(_126f){
return dojo.mixin({},this.widgetProps||{},{constraints:dojo.mixin({},this.constraint)||{},value:_126f});
},createWidget:function(_1270,_1271,_1272){
return new this.widgetClass(this.getWidgetProps(_1271),_1270);
},attachWidget:function(_1273,_1274,_1275){
_1273.appendChild(this.widget.domNode);
this.setValue(_1275,_1274);
},formatNode:function(_1276,_1277,_1278){
if(!this.widgetClass){
return _1277;
}
if(!this.widget){
this.widget=this.createWidget.apply(this,arguments);
}else{
this.attachWidget.apply(this,arguments);
}
this.sizeWidget.apply(this,arguments);
this.grid.rowHeightChanged(_1278);
this.focus();
},sizeWidget:function(_1279,_127a,_127b){
var p=this.getNode(_127b),box=dojo.contentBox(p);
dojo.marginBox(this.widget.domNode,{w:box.w});
},focus:function(_127e,_127f){
if(this.widget){
setTimeout(dojo.hitch(this.widget,function(){
dojox.grid.util.fire(this,"focus");
}),0);
}
},_finish:function(_1280){
this.inherited(arguments);
dojox.grid.util.removeNode(this.widget.domNode);
}});
dgc._Widget.markupFactory=function(node,cell){
dgc._Base.markupFactory(node,cell);
var d=dojo;
var _1284=d.trim(d.attr(node,"widgetProps")||"");
var _1285=d.trim(d.attr(node,"constraint")||"");
var _1286=d.trim(d.attr(node,"widgetClass")||"");
if(_1284){
cell.widgetProps=d.fromJson(_1284);
}
if(_1285){
cell.constraint=d.fromJson(_1285);
}
if(_1286){
cell.widgetClass=d.getObject(_1286);
}
};
dojo.declare("dojox.grid.cells.ComboBox",dgc._Widget,{widgetClass:"dijit.form.ComboBox",getWidgetProps:function(_1287){
var items=[];
dojo.forEach(this.options,function(o){
items.push({name:o,value:o});
});
var store=new dojo.data.ItemFileReadStore({data:{identifier:"name",items:items}});
return dojo.mixin({},this.widgetProps||{},{value:_1287,store:store});
},getValue:function(){
var e=this.widget;
e.attr("displayedValue",e.attr("displayedValue"));
return e.attr("value");
}});
dgc.ComboBox.markupFactory=function(node,cell){
dgc._Widget.markupFactory(node,cell);
var d=dojo;
var _128f=d.trim(d.attr(node,"options")||"");
if(_128f){
var o=_128f.split(",");
if(o[0]!=_128f){
cell.options=o;
}
}
};
dojo.declare("dojox.grid.cells.DateTextBox",dgc._Widget,{widgetClass:"dijit.form.DateTextBox",setValue:function(_1291,_1292){
if(this.widget){
this.widget.setValue(new Date(_1292));
}else{
this.inherited(arguments);
}
},getWidgetProps:function(_1293){
return dojo.mixin(this.inherited(arguments),{value:new Date(_1293)});
}});
dgc.DateTextBox.markupFactory=function(node,cell){
dgc._Widget.markupFactory(node,cell);
};
dojo.declare("dojox.grid.cells.CheckBox",dgc._Widget,{widgetClass:"dijit.form.CheckBox",getValue:function(){
return this.widget.checked;
},setValue:function(_1296,_1297){
if(this.widget&&this.widget.setAttribute){
this.widget.setAttribute("checked",_1297);
}else{
this.inherited(arguments);
}
},sizeWidget:function(_1298,_1299,_129a){
return;
}});
dgc.CheckBox.markupFactory=function(node,cell){
dgc._Widget.markupFactory(node,cell);
};
dojo.declare("dojox.grid.cells.Editor",dgc._Widget,{widgetClass:"dijit.Editor",getWidgetProps:function(_129d){
return dojo.mixin({},this.widgetProps||{},{height:this.widgetHeight||"100px"});
},createWidget:function(_129e,_129f,_12a0){
var _12a1=new this.widgetClass(this.getWidgetProps(_129f),_129e);
dojo.connect(_12a1,"onLoad",dojo.hitch(this,"populateEditor"));
return _12a1;
},formatNode:function(_12a2,_12a3,_12a4){
this.content=_12a3;
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
if(!dojo._hasResource["dojox.xml.DomParser"]){
dojo._hasResource["dojox.xml.DomParser"]=true;
dojo.provide("dojox.xml.DomParser");
dojox.xml.DomParser=new (function(){
var _12aa={ELEMENT:1,ATTRIBUTE:2,TEXT:3,CDATA_SECTION:4,PROCESSING_INSTRUCTION:7,COMMENT:8,DOCUMENT:9};
var _12ab=/<([^>\/\s+]*)([^>]*)>([^<]*)/g;
var _12ac=/([^=]*)=(("([^"]*)")|('([^']*)'))/g;
var _12ad=/<!ENTITY\s+([^"]*)\s+"([^"]*)">/g;
var _12ae=/<!\[CDATA\[([\u0001-\uFFFF]*?)\]\]>/g;
var _12af=/<!--([\u0001-\uFFFF]*?)-->/g;
var trim=/^\s+|\s+$/g;
var _12b1=/\s+/g;
var egt=/\&gt;/g;
var elt=/\&lt;/g;
var equot=/\&quot;/g;
var eapos=/\&apos;/g;
var eamp=/\&amp;/g;
var dNs="_def_";
function _doc(){
return new (function(){
var all={};
this.nodeType=_12aa.DOCUMENT;
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
if(c.nodeType==_12aa.ELEMENT){
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
if(c.nodeType==_12aa.ELEMENT){
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
if(c.nodeType==_12aa.ELEMENT){
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
return {nodeType:_12aa.TEXT,nodeName:"#text",nodeValue:v.replace(_12b1," ").replace(egt,">").replace(elt,"<").replace(eapos,"'").replace(equot,"\"").replace(eamp,"&")};
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
var _12e1,eRe=[];
if(_12ad.test(str)){
_12ad.lastIndex=0;
while((_12e1=_12ad.exec(str))!=null){
eRe.push({entity:"&"+_12e1[1].replace(trim,"")+";",expression:_12e1[2]});
}
for(var i=0;i<eRe.length;i++){
str=str.replace(new RegExp(eRe[i].entity,"g"),eRe[i].expression);
}
}
}
var _12e4=[],cdata;
while((cdata=_12ae.exec(str))!=null){
_12e4.push(cdata[1]);
}
for(var i=0;i<_12e4.length;i++){
str=str.replace(_12e4[i],i);
}
var _12e6=[],_12e7;
while((_12e7=_12af.exec(str))!=null){
_12e6.push(_12e7[1]);
}
for(i=0;i<_12e6.length;i++){
str=str.replace(_12e6[i],i);
}
var res,obj=root;
while((res=_12ab.exec(str))!=null){
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
var _12ec=res[2].substr(0,res[2].length-2);
obj.childNodes.push({nodeType:_12aa.PROCESSING_INSTRUCTION,nodeName:name,nodeValue:_12ec});
}else{
if(res[1].charAt(0)=="!"){
if(res[1].indexOf("![CDATA[")==0){
var val=parseInt(res[1].replace("![CDATA[","").replace("]]",""));
obj.childNodes.push({nodeType:_12aa.CDATA_SECTION,nodeName:"#cdata-section",nodeValue:_12e4[val]});
}else{
if(res[1].substr(0,3)=="!--"){
var val=parseInt(res[1].replace("!--","").replace("--",""));
obj.childNodes.push({nodeType:_12aa.COMMENT,nodeName:"#comment",nodeValue:_12e6[val]});
}
}
}else{
var name=res[1].replace(trim,"");
var o={nodeType:_12aa.ELEMENT,nodeName:name,localName:name,namespace:dNs,ownerDocument:root,attributes:[],parentNode:null,childNodes:[]};
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
while((attr=_12ac.exec(res[2]))!=null){
if(attr.length>0){
var name=attr[1].replace(trim,"");
var val=(attr[4]||attr[6]||"").replace(_12b1," ").replace(egt,">").replace(elt,"<").replace(eapos,"'").replace(equot,"\"").replace(eamp,"&");
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
o.attributes.push({nodeType:_12aa.ATTRIBUTE,nodeName:name,localName:ln,namespace:ns,nodeValue:val});
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
if(e.nodeType==_12aa.ELEMENT){
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
this.appendArray=function(_12fb){
return this.append.apply(this,_12fb);
};
this.clear=function(){
b="";
this.length=0;
return this;
};
this.replace=function(_12fc,_12fd){
b=b.replace(_12fc,_12fd);
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
dojox.string.tokenize=function(str,re,_1304,_1305){
var _1306=[];
var match,_1308,_1309=0;
while(match=re.exec(str)){
_1308=str.slice(_1309,re.lastIndex-match[0].length);
if(_1308.length){
_1306.push(_1308);
}
if(_1304){
if(dojo.isOpera){
var copy=match.slice(0);
while(copy.length<match.length){
copy.push(null);
}
match=copy;
}
var _130b=_1304.apply(_1305,match.slice(1).concat(_1306.length));
if(typeof _130b!="undefined"){
_1306.push(_130b);
}
}
_1309=re.lastIndex;
}
_1308=str.slice(_1309);
if(_1308.length){
_1306.push(_1308);
}
return _1306;
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
var _130f=dojo.delegate(this);
_130f.pop=function(){
return last;
};
return _130f;
},pop:function(){
throw new Error("pop() called on empty Context");
},get:function(key,_1311){
if(typeof this[key]!="undefined"){
return this._normalize(this[key]);
}
for(var i=0,dict;dict=this._dicts[i];i++){
if(typeof dict[key]!="undefined"){
return this._normalize(dict[key]);
}
}
return _1311;
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
var _1316=this.push();
if(dict){
dojo._mixin(this,dict);
}
return _1316;
}});
var _1317=/("(?:[^"\\]*(?:\\.[^"\\]*)*)"|'(?:[^'\\]*(?:\\.[^'\\]*)*)'|[^\s]+)/g;
var _1318=/\s+/g;
var split=function(_131a,limit){
_131a=_131a||_1318;
if(!(_131a instanceof RegExp)){
_131a=new RegExp(_131a,"g");
}
if(!_131a.global){
throw new Error("You must use a globally flagged RegExp with split "+_131a);
}
_131a.exec("");
var part,parts=[],_131e=0,i=0;
while(part=_131a.exec(this)){
parts.push(this.slice(_131e,_131a.lastIndex-part[0].length));
_131e=_131a.lastIndex;
if(limit&&(++i>limit-1)){
break;
}
}
parts.push(this.slice(_131e));
return parts;
};
dd.Token=function(_1320,_1321){
this.token_type=_1320;
this.contents=new String(dojo.trim(_1321));
this.contents.split=split;
this.split=function(){
return String.prototype.split.apply(this.contents,arguments);
};
};
dd.Token.prototype.split_contents=function(limit){
var bit,bits=[],i=0;
limit=limit||999;
while(i++<limit&&(bit=_1317.exec(this.contents))){
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
var ddt=dd.text={_get:function(_1327,name,_1329){
var _132a=dd.register.get(_1327,name.toLowerCase(),_1329);
if(!_132a){
if(!_1329){
throw new Error("No tag found for "+name);
}
return null;
}
var fn=_132a[1];
var _132c=_132a[2];
var parts;
if(fn.indexOf(":")!=-1){
parts=fn.split(":");
fn=parts.pop();
}
dojo["require"](_132c);
var _132e=dojo.getObject(_132c);
return _132e[fn||name]||_132e[name+"_"];
},getTag:function(name,_1330){
return ddt._get("tag",name,_1330);
},getFilter:function(name,_1332){
return ddt._get("filter",name,_1332);
},getTemplate:function(file){
return new dd.Template(ddt.getTemplateString(file));
},getTemplateString:function(file){
return dojo._getText(file.toString())||"";
},_resolveLazy:function(_1335,sync,json){
if(sync){
if(json){
return dojo.fromJson(dojo._getText(_1335))||{};
}else{
return dd.text.getTemplateString(_1335);
}
}else{
return dojo.xhrGet({handleAs:(json)?"json":"text",url:_1335});
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
dd.Template=dojo.extend(function(_1346,_1347){
var str=_1347?_1346:ddt._resolveTemplateArg(_1346,true)||"";
var _1349=ddt.tokenize(str);
var _134a=new dd._Parser(_1349);
this.nodelist=_134a.parse();
},{update:function(node,_134c){
return ddt._resolveContextArg(_134c).addCallback(this,function(_134d){
var _134e=this.render(new dd._Context(_134d));
if(node.forEach){
node.forEach(function(item){
item.innerHTML=_134e;
});
}else{
dojo.byId(node).innerHTML=_134e;
}
return this;
});
},render:function(_1350,_1351){
_1351=_1351||this.getBuffer();
_1350=_1350||new dd._Context({});
return this.nodelist.render(_1350,_1351)+"";
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
dd._QuickNodeList=dojo.extend(function(_1355){
this.contents=_1355;
},{render:function(_1356,_1357){
for(var i=0,l=this.contents.length;i<l;i++){
if(this.contents[i].resolve){
_1357=_1357.concat(this.contents[i].resolve(_1356));
}else{
_1357=_1357.concat(this.contents[i]);
}
}
return _1357;
},dummyRender:function(_135a){
return this.render(_135a,dd.Template.prototype.getBuffer()).toString();
},clone:function(_135b){
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
},resolve:function(_1364){
var str=this.resolvePath(this.key,_1364);
for(var i=0,_1367;_1367=this.filters[i];i++){
if(_1367[1]){
if(_1367[1][0]){
str=_1367[0](str,this.resolvePath(_1367[1][1],_1364));
}else{
str=_1367[0](str,_1367[1][1]);
}
}else{
str=_1367[0](str);
}
}
return str;
},resolvePath:function(path,_1369){
var _136a,parts;
var first=path.charAt(0);
var last=path.slice(-1);
if(!isNaN(parseInt(first))){
_136a=(path.indexOf(".")==-1)?parseInt(path):parseFloat(path);
}else{
if(first=="\""&&first==last){
_136a=path.slice(1,-1);
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
_136a=_1369.get(parts[0]);
for(var i=1;i<parts.length;i++){
var part=parts[i];
if(_136a){
var base=_136a;
if(dojo.isObject(_136a)&&part=="items"&&typeof _136a[part]=="undefined"){
var items=[];
for(var key in _136a){
items.push([key,_136a[key]]);
}
_136a=items;
continue;
}
if(_136a.get&&dojo.isFunction(_136a.get)){
_136a=_136a.get(part);
}else{
if(typeof _136a[part]=="undefined"){
_136a=_136a[part];
break;
}else{
_136a=_136a[part];
}
}
if(dojo.isFunction(_136a)){
if(_136a.alters_data){
_136a="";
}else{
_136a=_136a.call(base);
}
}else{
if(_136a instanceof Date){
_136a=dd._Context.prototype._normalize(_136a);
}
}
}else{
return "";
}
}
}
}
return _136a;
}});
dd._TextNode=dd._Node=dojo.extend(function(obj){
this.contents=obj;
},{set:function(data){
this.contents=data;
return this;
},render:function(_1375,_1376){
return _1376.concat(this.contents);
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
},render:function(_137a,_137b){
for(var i=0;i<this.contents.length;i++){
_137b=this.contents[i].render(_137a,_137b);
if(!_137b){
throw new Error("Template must return buffer");
}
}
return _137b;
},dummyRender:function(_137d){
return this.render(_137d,dd.Template.prototype.getBuffer()).toString();
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
},{render:function(_137f,_1380){
var str=this.contents.resolve(_137f);
if(!str.safe){
str=dd._base.escape(""+str);
}
return _1380.concat(str);
}});
dd._noOpNode=new function(){
this.render=this.unrender=function(){
return arguments[1];
};
this.clone=function(){
return this;
};
};
dd._Parser=dojo.extend(function(_1382){
this.contents=_1382;
},{i:0,parse:function(_1383){
var _1384={};
_1383=_1383||[];
for(var i=0;i<_1383.length;i++){
_1384[_1383[i]]=true;
}
var _1386=new dd._NodeList();
while(this.i<this.contents.length){
token=this.contents[this.i++];
if(typeof token=="string"){
_1386.push(new dd._TextNode(token));
}else{
var type=token[0];
var text=token[1];
if(type==dd.TOKEN_VAR){
_1386.push(new dd._VarNode(text));
}else{
if(type==dd.TOKEN_BLOCK){
if(_1384[text]){
--this.i;
return _1386;
}
var cmd=text.split(/\s+/g);
if(cmd.length){
cmd=cmd[0];
var fn=ddt.getTag(cmd);
if(fn){
_1386.push(fn(this,new dd.Token(type,text)));
}
}
}
}
}
}
if(_1383.length){
throw new Error("Could not find closing tag(s): "+_1383.toString());
}
this.contents.length=0;
return _1386;
},next_token:function(){
var token=this.contents[this.i++];
return new dd.Token(token[0],token[1]);
},delete_first_token:function(){
this.i++;
},skip_past:function(_138c){
while(this.i<this.contents.length){
var token=this.contents[this.i++];
if(token[0]==dd.TOKEN_BLOCK&&token[1]==_138c){
return;
}
}
throw new Error("Unclosed tag found when looking for "+_138c);
},create_variable_node:function(expr){
return new dd._VarNode(expr);
},create_text_node:function(expr){
return new dd._TextNode(expr||"");
},getTemplate:function(file){
return new dd.Template(file);
}});
dd.register={_registry:{attributes:[],tags:[],filters:[]},get:function(_1391,name){
var _1393=dd.register._registry[_1391+"s"];
for(var i=0,entry;entry=_1393[i];i++){
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
var _1397=dd.register._registry.attributes;
for(var i=0,entry;entry=_1397[i];i++){
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
},_any:function(type,base,_139d){
for(var path in _139d){
for(var i=0,fn;fn=_139d[path][i];i++){
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
},tags:function(base,_13a4){
dd.register._any("tags",base,_13a4);
},filters:function(base,_13a6){
dd.register._any("filters",base,_13a6);
}};
var _13a7=/&/g;
var _13a8=/</g;
var _13a9=/>/g;
var _13aa=/'/g;
var _13ab=/"/g;
dd._base.escape=function(value){
return dd.mark_safe(value.replace(_13a7,"&amp;").replace(_13a8,"&lt;").replace(_13a9,"&gt;").replace(_13ab,"&quot;").replace(_13aa,"&#39;"));
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
var _13af=[];
var dh=dojox.dtl.filter.htmlstrings;
value=value.replace(dh._linebreaksrn,"\n");
var parts=value.split(dh._linebreaksn);
for(var i=0;i<parts.length;i++){
var part=parts[i].replace(dh._linebreakss,"").replace(dh._linebreaksbr,"<br />");
_13af.push("<p>"+part+"</p>");
}
return _13af.join("\n\n");
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
dojox.string.sprintf=function(_13bc,_13bd){
for(var args=[],i=1;i<arguments.length;i++){
args.push(arguments[i]);
}
var _13c0=new dojox.string.sprintf.Formatter(_13bc);
return _13c0.format.apply(_13c0,args);
};
dojox.string.sprintf.Formatter=function(_13c1){
var _13c2=[];
this._mapped=false;
this._format=_13c1;
this._tokens=dojox.string.tokenize(_13c1,this._re,this._parseDelim,this);
};
dojo.extend(dojox.string.sprintf.Formatter,{_re:/\%(?:\(([\w_]+)\)|([1-9]\d*)\$)?([0 +\-\#]*)(\*|\d+)?(\.)?(\*|\d+)?[hlL]?([\%scdeEfFgGiouxX])/g,_parseDelim:function(_13c3,_13c4,flags,_13c6,_13c7,_13c8,_13c9){
if(_13c3){
this._mapped=true;
}
return {mapping:_13c3,intmapping:_13c4,flags:flags,_minWidth:_13c6,period:_13c7,_precision:_13c8,specifier:_13c9};
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
}},e:{isDouble:true,doubleNotation:"e"},E:{extend:["e"],toUpper:true},f:{isDouble:true,doubleNotation:"f"},F:{extend:["f"]},g:{isDouble:true,doubleNotation:"g"},G:{extend:["g"],toUpper:true}},format:function(_13cd){
if(this._mapped&&typeof _13cd!="object"){
throw new Error("format requires a mapping");
}
var str="";
var _13cf=0;
for(var i=0,token;i<this._tokens.length;i++){
token=this._tokens[i];
if(typeof token=="string"){
str+=token;
}else{
if(this._mapped){
if(typeof _13cd[token.mapping]=="undefined"){
throw new Error("missing key "+token.mapping);
}
token.arg=_13cd[token.mapping];
}else{
if(token.intmapping){
var _13cf=parseInt(token.intmapping)-1;
}
if(_13cf>=arguments.length){
throw new Error("got "+arguments.length+" printf arguments, insufficient for '"+this._format+"'");
}
token.arg=arguments[_13cf++];
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
var _13d5=this._specifiers[token.specifier];
if(typeof _13d5=="undefined"){
throw new Error("unexpected specifier '"+token.specifier+"'");
}
if(_13d5.extend){
dojo.mixin(_13d5,this._specifiers[_13d5.extend]);
delete _13d5.extend;
}
dojo.mixin(token,_13d5);
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
token.minWidth=parseInt(arguments[_13cf++]);
if(isNaN(token.minWidth)){
throw new Error("the argument for * width at position "+_13cf+" is not a number in "+this._format);
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
token.precision=parseInt(arguments[_13cf++]);
if(isNaN(token.precision)){
throw Error("the argument for * precision at position "+_13cf+" is not a number in "+this._format);
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
},zeroPad:function(token,_13db){
_13db=(arguments.length==2)?_13db:token.precision;
if(typeof token.arg!="string"){
token.arg=""+token.arg;
}
var _13dc=_13db-10;
while(token.arg.length<_13dc){
token.arg=(token.rightJustify)?token.arg+this._zeros10:this._zeros10+token.arg;
}
var pad=_13db-token.arg.length;
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
},spacePad:function(token,_13e0){
_13e0=(arguments.length==2)?_13e0:token.minWidth;
if(typeof token.arg!="string"){
token.arg=""+token.arg;
}
var _13e1=_13e0-10;
while(token.arg.length<_13e1){
token.arg=(token.rightJustify)?token.arg+this._spaces10:this._spaces10+token.arg;
}
var pad=_13e0-token.arg.length;
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
var _13f6=[];
var width=(lines.length+"").length;
for(var i=0,line;i<lines.length;i++){
line=lines[i];
_13f6.push(df.strings.ljust(i+1,width)+". "+dojox.dtl._base.escape(line));
}
return _13f6.join("\n");
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
var _13fe=[];
if(typeof value=="number"){
value=value+"";
}
if(value.charAt){
for(var i=0;i<value.length;i++){
_13fe.push(value.charAt(i));
}
return _13fe;
}
if(typeof value=="object"){
for(var key in value){
_13fe.push(value[key]);
}
return _13fe;
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
var _1406=dojox.dtl.filter.strings._strings;
if(!_1406[arg]){
_1406[arg]=new dojox.string.sprintf.Formatter("%"+arg);
}
return _1406[arg].format(value);
},title:function(value){
var last,title="";
for(var i=0,_140b;i<value.length;i++){
_140b=value.charAt(i);
if(last==" "||last=="\n"||last=="\t"||!last){
title+=_140b.toUpperCase();
}else{
title+=_140b.toLowerCase();
}
last=_140b;
}
return title;
},_truncatewords:/[ \n\r\t]/,truncatewords:function(value,arg){
arg=parseInt(arg);
if(!arg){
return value;
}
for(var i=0,j=value.length,count=0,_1411,last;i<value.length;i++){
_1411=value.charAt(i);
if(dojox.dtl.filter.strings._truncatewords.test(last)){
if(!dojox.dtl.filter.strings._truncatewords.test(_1411)){
++count;
if(count==arg){
return value.substring(0,j+1);
}
}
}else{
if(!dojox.dtl.filter.strings._truncatewords.test(_1411)){
j=i;
}
}
last=_1411;
}
return value;
},_truncate_words:/(&.*?;|<.*?>|(\w[\w\-]*))/g,_truncate_tag:/<(\/)?([^ ]+?)(?: (\/)| .*?)?>/,_truncate_singlets:{br:true,col:true,link:true,base:true,img:true,param:true,area:true,hr:true,input:true},truncatewords_html:function(value,arg){
arg=parseInt(arg);
if(arg<=0){
return "";
}
var _1415=dojox.dtl.filter.strings;
var words=0;
var open=[];
var _1418=dojox.string.tokenize(value,_1415._truncate_words,function(all,word){
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
var tag=all.match(_1415._truncate_tag);
if(!tag||words>=arg){
return;
}
var _141c=tag[1];
var _141d=tag[2].toLowerCase();
var _141e=tag[3];
if(_141c||_1415._truncate_singlets[_141d]){
}else{
if(_141c){
var i=dojo.indexOf(open,_141d);
if(i!=-1){
open=open.slice(i+1);
}
}else{
open.unshift(_141d);
}
}
return all;
}).join("");
_1418=_1418.replace(/\s+$/g,"");
for(var i=0,tag;tag=open[i];i++){
_1418+="</"+tag+">";
}
return _1418;
},upper:function(value){
return value.toUpperCase();
},urlencode:function(value){
return dojox.dtl.filter.strings._urlquote(value);
},_urlize:/^((?:[(>]|&lt;)*)(.*?)((?:[.,)>\n]|&gt;)*)$/,_urlize2:/^\S+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+$/,urlize:function(value){
return dojox.dtl.filter.strings.urlizetrunc(value);
},urlizetrunc:function(value,arg){
arg=parseInt(arg);
return dojox.string.tokenize(value,/(\S+)/g,function(word){
var _1428=dojox.dtl.filter.strings._urlize.exec(word);
if(!_1428){
return word;
}
var lead=_1428[1];
var _142a=_1428[2];
var trail=_1428[3];
var _142c=_142a.indexOf("www.")==0;
var hasAt=_142a.indexOf("@")!=-1;
var _142e=_142a.indexOf(":")!=-1;
var _142f=_142a.indexOf("http://")==0;
var _1430=_142a.indexOf("https://")==0;
var _1431=/[a-zA-Z0-9]/.test(_142a.charAt(0));
var last4=_142a.substring(_142a.length-4);
var _1433=_142a;
if(arg>3){
_1433=_1433.substring(0,arg-3)+"...";
}
if(_142c||(!hasAt&&!_142f&&_142a.length&&_1431&&(last4==".org"||last4==".net"||last4==".com"))){
return "<a href=\"http://"+_142a+"\" rel=\"nofollow\">"+_1433+"</a>";
}else{
if(_142f||_1430){
return "<a href=\""+_142a+"\" rel=\"nofollow\">"+_1433+"</a>";
}else{
if(hasAt&&!_142c&&!_142e&&dojox.dtl.filter.strings._urlize2.test(_142a)){
return "<a href=\"mailto:"+_142a+"\">"+_142a+"</a>";
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
var _1437=[];
var parts=value.split(/\s+/g);
if(parts.length){
var word=parts.shift();
_1437.push(word);
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
_1437.push("\n");
pos=lines[lines.length-1].length;
}else{
_1437.push(" ");
if(lines.length>1){
pos=lines[lines.length-1].length;
}
}
_1437.push(word);
}
}
return _1437.join("");
}});
}
if(!dojo._hasResource["pion.login"]){
dojo._hasResource["pion.login"]=true;
dojo.provide("pion.login");
pion.login.logout=function(){
dojo.cookie("logged_in","",{expires:-1});
dojo.xhrGet({url:"/logout",preventCache:true,handleAs:"xml",timeout:5000,load:function(_143d,_143e){
console.debug("logout response: ",_143d);
return _143d;
},error:function(_143f,_1440){
console.error("logout error: HTTP status code = ",_1440.xhr.status);
return _143f;
}});
};
pion.login.expire=function(){
dojo.xhrGet({url:"/logout",preventCache:true,handleAs:"xml",timeout:5000,load:function(_1441,_1442){
console.debug("logout response: ",_1441);
return _1441;
},error:function(_1443,_1444){
console.error("logout error: HTTP status code = ",_1444.xhr.status);
return _1443;
}});
};
dojo.declare("pion.login.LoginDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog database_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Session Expired</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t>Your session has timed out.  Please login again.<table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Username:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" type=\"text\" name=\"Username\" tabindex=\"3\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Password:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" type=\"password\" name=\"Password\" tabindex=\"1\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t</div>\r\n\t<div>\r\n\t\t<button dojoType=dijit.form.Button class=\"content_button\" type=\"submit\" tabindex=\"2\">Submit</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
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
pion.login.doLoginDialog=function(_1445){
pion.login.login_pending=true;
var _1446=dijit.byId("ops_toggle_button");
if(!_1446.checked){
_1446.attr("checked",true);
pion.login.ops_temporarily_suppressed=true;
}
var _1447=new pion.login.LoginDialog({});
_1447.attr("value",{Username:pion.login.latestUsername});
dojo.connect(_1447.domNode,"onkeypress",function(event){
if(event.keyCode==dojo.keys.ENTER){
_1447.execute(_1447.attr("value"));
_1447.destroyRecursive();
}
});
_1447.show();
_1447.execute=function(_1449){
console.debug("dialogFields = ",_1449);
pion.login.latestUsername=_1449.Username;
dojo.xhrGet({url:"/login?user="+_1449.Username+"&pass="+_1449.Password,preventCache:true,handleAs:"xml",load:function(_144a,_144b){
pion.login.login_pending=false;
pion.login.onLoginSuccess();
console.debug("login response: ioArgs.xhr = ",_144b.xhr);
if(pion.login.ops_temporarily_suppressed){
_1446.attr("checked",false);
pion.login.ops_temporarily_suppressed=false;
}
if(_1445.suppress_default_key_status_check){
if(_1445.success_callback){
_1445.success_callback();
}
}else{
pion.about.checkKeyStatus({always_callback:_1445.success_callback});
}
return _144a;
},error:function(_144c,_144d){
pion.login.login_pending=false;
if(_144d.xhr.status==401){
pion.login.doLoginDialog(_1445);
return;
}
console.error("login error: HTTP status code = ",_144d.xhr.status);
console.error("ioArgs = ",_144d);
return _144c;
}});
};
};
}
if(!dojo._hasResource["pion.plugins"]){
dojo._hasResource["pion.plugins"]=true;
dojo.provide("pion.plugins");
pion.plugins.initLoadedPluginList=function(){
var d=new dojo.Deferred();
if(pion.plugins.loaded_plugins){
d.callback();
}else{
dojo.xhrGet({url:"/config/plugins",handleAs:"xml",timeout:5000,load:function(_144f,_1450){
pion.plugins.loaded_plugins=[];
var _1451=_144f.getElementsByTagName("Plugin");
dojo.forEach(_1451,function(n){
pion.plugins.loaded_plugins.push(dojo.isIE?n.childNodes[0].nodeValue:n.textContent);
});
d.callback();
return _144f;
},error:pion.handleXhrGetError});
}
return d;
};
pion.plugins.getPluginPrototype=function(_1453,_1454,_1455){
var _1456=_1453+"."+_1454;
var _1457=dojo.getObject(_1456);
if(!_1457){
var path=_1455+"/"+_1454+"/"+_1454;
dojo.registerModulePath(_1456,path);
dojo.requireIf(true,_1456);
_1457=dojo.getObject(_1456);
}
return _1457;
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
var _1459=new dojo.dnd.Target(this.domNode,{accept:["connector"]});
dojo.connect(_1459,"onDndDrop",pion.reactors.handleDropOnReactor);
this.name_div=document.createElement("div");
this.name_div.innerHTML=pion.escapeXml(this.config.Name);
dojo.addClass(this.name_div,"name");
this.domNode.appendChild(this.name_div);
var _this=this;
this.run_button=new dijit.form.ToggleButton();
var _145b=this.run_button.domNode;
dojo.connect(_145b,"click",function(){
dojo.xhrPut({url:"/config/reactors/"+_this.config["@id"]+(_this.run_button.checked?"/start":"/stop"),error:pion.getXhrErrorHandler(dojo.xhrPut)});
});
this.domNode.appendChild(_145b);
this.ops_per_sec=document.createElement("span");
dojo.addClass(this.ops_per_sec,"ops_per_sec");
this.ops_per_sec.innerHTML="0";
this.domNode.appendChild(this.ops_per_sec);
this.domNode.setAttribute("reactor_type",this.config.Plugin);
var _145c=pion.reactors.categories[this.config.Plugin];
dojo.addClass(this.domNode,_145c);
if(_145c!="collection"){
this.run_button.attr("checked",true);
}
dojo.addClass(this.domNode,"moveable");
dojo.addClass(this.domNode,"reactor");
dojo.addClass(this.domNode,this.config.Plugin);
var m5=new dojo.dnd.move.parentConstrainedMoveable(this.domNode,{area:"padding",within:true});
var c=m5.constraints();
c.r=c.l+c.w-this.offsetWidth;
c.b=c.t+c.h-this.offsetHeight;
var _145f={l:this.config.X,t:this.config.Y};
console.debug("mouseLeftTop: ",_145f);
var _1460=pion.reactors.getNearbyGridPointInBox(c,_145f);
this.domNode.style.top=_1460.t+"px";
this.domNode.style.left=_1460.l+"px";
this.domNode.style.position="absolute";
this.domNode.style.background="url(../plugins/reactors/"+_145c+"/"+this.config.Plugin+"/bg-moveable.png) repeat-x";
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
dojo.connect(this.domNode,"dblclick",function(event){
event.stopPropagation();
if(event.shiftKey){
_this.showQueryResult();
}else{
pion.reactors.showReactorConfigDialog(_this);
}
});
m5.onMove=function(mover,_1464){
var _1465=pion.reactors.getNearbyGridPointInBox(this.constraintBox,_1464);
dojo.marginBox(mover.node,_1465);
for(var i=0;i<_this.reactor_inputs.length;++i){
pion.reactors.updateConnectionLine(_this.reactor_inputs[i].line,_this.reactor_inputs[i].source.domNode,_this.domNode);
}
for(var i=0;i<_this.reactor_outputs.length;++i){
pion.reactors.updateConnectionLine(_this.reactor_outputs[i].line,_this.domNode,_this.reactor_outputs[i].sink.domNode);
}
};
dojo.connect(m5,"onMoveStop",this,this.handleMoveStop);
},_initOptions:function(_1467,_1468){
var store=pion.reactors.config_store;
var _this=this;
store.fetch({query:{"@id":_1467["@id"]},onItem:function(item){
_1467.options=[];
for(var _146c in _1468){
_1467[_146c]=_1468[_146c];
if(store.hasAttribute(item,_146c)){
_1467[_146c]=(store.getValue(item,_146c).toString()=="true");
}
if(_1467[_146c]){
_1467.options.push(_146c);
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
console.debug("this.config[",tag,"] = ",this.config[tag]);
this.put_data+=pion.makeXmlLeafElement(tag,this.config[tag]);
}
}
if(this._insertCustomData){
this._insertCustomData();
}
this.put_data+="</Reactor></PionConfig>";
console.debug("put_data: ",this.put_data);
dojo.rawXhrPut({url:"/config/reactors/"+this.config["@id"]+"/move",contentType:"text/xml",handleAs:"xml",putData:this.put_data,load:function(_146f){
console.debug("response: ",_146f);
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:this.put_data})});
},changeWorkspace:function(_1470){
if(this.config.Workspace==_1470){
return;
}
this.config.Workspace=_1470;
this.put_data="<PionConfig><Reactor>";
for(var tag in this.config){
if(dojo.indexOf(this.special_config_elements,tag)==-1){
console.debug("this.config[",tag,"] = ",this.config[tag]);
this.put_data+=pion.makeXmlLeafElement(tag,this.config[tag]);
}
}
if(this._insertCustomData){
this._insertCustomData();
}
this.put_data+="</Reactor></PionConfig>";
console.debug("put_data: ",this.put_data);
dojo.rawXhrPut({url:"/config/reactors/"+this.config["@id"]+"/move",contentType:"text/xml",handleAs:"xml",putData:this.put_data,load:function(_1472){
console.debug("response: ",_1472);
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:this.put_data})});
},getOptionalBool:function(store,item,_1475){
var temp=store.getValue(item,_1475);
if(temp!==undefined&&temp!==null){
return store.getValue(item,_1475).toString()=="true";
}else{
return plugins.reactors[this.config.Plugin].grid_option_defaults[_1475];
}
}});
dojo.declare("plugins.reactors.ReactorIcon",[],{});
dojo.declare("plugins.reactors.ReactorInitDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">${title}</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<table>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Name:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Comments:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td>\r\n\t\t\t</tr>\r\n\t\t</table>\r\n\t</div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick: tryConfig\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t</div>\r\n\t<span dojoAttachPoint=\"tabEnd\" tabindex=\"0\"></span>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,tryConfig:function(){
var _1477=this.attr("value");
console.debug(_1477);
console.debug("this.plugin = ",this.plugin);
var _1478=pion.reactors.workspace_box;
var dc=dojo.coords(_1478.node);
var X=Math.floor(pion.reactors.last_x-dc.x);
var Y=Math.floor(pion.reactors.last_y-dc.y);
this.post_data="<PionConfig><Reactor>"+pion.makeXmlLeafElement("Plugin",this.plugin)+pion.makeXmlLeafElement("Workspace",_1478.my_content_pane.title)+"<X>"+X+"</X><Y>"+Y+"</Y>";
for(var tag in _1477){
if(tag!="options"){
console.debug("dialogFields[",tag,"] = ",_1477[tag]);
this.post_data+=pion.makeXmlLeafElement(tag,_1477[tag]);
}
}
if("options" in _1477&&plugins.reactors[this.plugin].option_defaults){
for(var _147d in plugins.reactors[this.plugin].option_defaults){
this.post_data+="<"+_147d+">";
this.post_data+=(dojo.indexOf(_1477.options,_147d)!=-1);
this.post_data+="</"+_147d+">";
}
}
if(this._insertCustomData){
this._insertCustomData(_1477);
}
var _147e=plugins.reactors[this.plugin].other_defaults;
if(_147e){
for(var key in _147e){
this.post_data+="<"+key+">"+_147e[key]+"</"+key+">";
}
}
this.post_data+="</Reactor></PionConfig>";
console.debug("post_data: ",this.post_data);
var _this=this;
dojo.rawXhrPost({url:"/config/reactors",contentType:"text/xml",handleAs:"xml",postData:this.post_data,load:function(_1481){
var node=_1481.getElementsByTagName("Reactor")[0];
var _1483={"@id":node.getAttribute("id")};
var _1484=node.childNodes;
for(var i=0;i<_1484.length;++i){
if(_1484[i].firstChild){
_1483[_1484[i].tagName]=_1484[i].firstChild.nodeValue;
}
}
var _1486=document.createElement("div");
_1478.node.replaceChild(_1486,_1478.node.lastChild);
var _1487=pion.reactors.createReactor(_1483,_1486);
pion.reactors.reactors_by_id[_1483["@id"]]=_1487;
_1487.workspace=_1478;
_1478.reactors.push(_1487);
_this.hide();
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:this.post_data})});
}});
dojo.declare("plugins.reactors.ReactorDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">${title}</span>\r\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\">\r\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" class=\"id_text_box\" disabled=\"true\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t</div>\r\n\t<h3>Input Connections</h3>\r\n\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"reactor_inputs_grid_node\" style=\"width: 618px\"></div>\r\n\t<h3>Output Connections</h3>\r\n\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"reactor_outputs_grid_node\" style=\"width: 618px\"></div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"delete\">Delete Reactor</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
var _this=this;
},reactor:"",execute:function(_1489){
dojo.mixin(this.reactor.config,_1489);
this.reactor.name_div.innerHTML=pion.escapeXml(_1489.Name);
this.put_data="<PionConfig><Reactor>"+pion.makeXmlLeafElement("Plugin",this.reactor.config.Plugin)+pion.makeXmlLeafElement("Workspace",this.reactor.config.Workspace)+"<X>"+this.reactor.config.X+"</X><Y>"+this.reactor.config.Y+"</Y>";
for(var tag in _1489){
if(dojo.indexOf(this.reactor.special_config_elements,tag)==-1){
console.debug("dialogFields[",tag,"] = ",_1489[tag]);
this.put_data+=pion.makeXmlLeafElement(tag,_1489[tag]);
}
}
if("options" in _1489&&plugins.reactors[this.reactor.config.Plugin].option_defaults){
for(var _148b in plugins.reactors[this.reactor.config.Plugin].option_defaults){
var _148c=(dojo.indexOf(_1489.options,_148b)!=-1);
this.put_data+="<"+_148b+">"+_148c+"</"+_148b+">";
this.reactor.config[_148b]=_148c;
}
}
if(this._insertCustomData){
this._insertCustomData(_1489);
}
this.put_data+="</Reactor></PionConfig>";
console.debug("put_data: ",this.put_data);
var _this=this;
dojo.rawXhrPut({url:"/config/reactors/"+this.reactor.config["@id"],contentType:"text/xml",handleAs:"xml",putData:this.put_data,load:function(_148e){
console.debug("response: ",_148e);
if(_this.reactor._updateCustomData){
_this.reactor._updateCustomData();
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:this.put_data})});
}});
}
if(!dojo._hasResource["pion.widgets.SimpleSelect"]){
dojo._hasResource["pion.widgets.SimpleSelect"]=true;
dojo.provide("pion.widgets.SimpleSelect");
dojo.declare("pion.widgets.SimpleSelect",dijit.form._FormWidget,{templateString:"<select name='${name}' dojoAttachPoint='containerNode,focusNode' dojoAttachEvent='onchange: _onChange'></select>",store:null,query:{},keyAttr:"",searchAttr:"",doneAddingOptions:false,attributeMap:dojo.mixin(dojo.clone(dijit.form._FormWidget.prototype.attributeMap),{size:"focusNode"}),reset:function(){
this._hasBeenBlurred=false;
this._setValueAttr(this._resetValue,true);
},_getValueAttr:function(){
return this.containerNode.value;
},_setValueAttr:function(value){
if(this.doneAddingOptions){
if(value===null){
this.containerNode.selectedIndex=-1;
}else{
this.containerNode.value=value;
}
this._handleOnChange(value,true);
}else{
var h=this.connect(this,"_onDoneAddingOptions",function(){
this.disconnect(h);
if(value===null){
this.containerNode.selectedIndex=-1;
}else{
this.containerNode.value=value;
}
this._handleOnChange(value,true);
});
}
},_onChange:function(e){
this._handleOnChange(this.attr("value"),true);
},resize:function(size){
if(size){
dojo.marginBox(this.domNode,size);
}
},setQuery:function(query){
this.query=query;
this.makeOptionList();
},makeOptionList:function(){
this.doneAddingOptions=false;
this.containerNode.options.length=0;
var _this=this;
this.store.fetch({query:_this.query,onItem:function(item){
var key=_this.keyAttr?_this.store.getValue(item,_this.keyAttr):_this.store.getIdentity(item);
var label=_this.searchAttr?_this.store.getValue(item,_this.searchAttr):key;
if(dojo.isIE){
_this.containerNode.add(new Option(label,key));
}else{
_this.containerNode.add(new Option(label,key),null);
}
},onComplete:function(){
_this._onDoneAddingOptions();
},onError:pion.handleFetchError});
},postCreate:function(){
if(this.store){
this.makeOptionList();
}else{
this.doneAddingOptions=true;
this._onChange();
}
},_onDoneAddingOptions:function(){
this.doneAddingOptions=true;
this._onChange();
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
dojo.declare("plugins.reactors.LogInputReactorInitDialog",[plugins.reactors.ReactorInitDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\" tabindex=\"-1\" waiRole=\"dialog\" waiState=\"labelledby-${id}_title\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Log File Input Reactor Initialization</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<table>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Name:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Comments:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Codec:</label></td>\r\n\t\t\t\t<td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"Codec\" store=\"pion.codecs.config_store\" searchAttr=\"Name\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Directory:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Directory\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Filename Regex:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Filename\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Frequency (in seconds):</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.ValidationTextBox\" type=\"text\" name=\"Frequency\" regExp=\"[1-9][0-9]*\"></td>\r\n\t\t\t</tr>\r\n\t\t</table>\r\n\t\t<table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Just One</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"JustOne\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Tail</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"TailF\"/></td\r\n\t\t\t></tr\r\n\t\t></table>\r\n\t</div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick: tryConfig\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.plugin="LogInputReactor";
console.debug("plugins.reactors.LogInputReactorInitDialog.postCreate");
this.inherited("postCreate",arguments);
}});
dojo.declare("plugins.reactors.LogInputReactorDialog",[plugins.reactors.ReactorDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\" tabindex=\"-1\" waiRole=\"dialog\" waiState=\"labelledby-${id}_title\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Log Input Reactor Configuration</span>\r\n\t\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\">\r\n\t\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<!--start div to set padding for top half of dialog-->\r\n\t\t<div class=\"reactor_dialog_top\">\r\n\r\n\t\t\t<!--start reactor header info-->\r\n\t\t\t<div class=\"reactor_name\">\r\n\t\t\t\t<img src=\"/plugins/reactors/collection/LogInputReactor/dialog-icon.png\" width=\"17\" height=\"17\" border=\"0\" />\r\n\t\t\t\t&nbsp; Log Input Reactor\r\n\t\t\t</div>\r\n\t\t\t<div class=\"reactor_cat\">\r\n\t\t\t\t<strong>Name:</strong> LogInputReactor\r\n\t\t\t\t&nbsp;&nbsp;&nbsp;\r\n\t\t\t\t<strong>Category:</strong> Collection\r\n\t\t\t</div>\r\n\r\n\t\t\t<div style=\"clear:both;\"></div>\r\n\r\n\t\t\t<p>Read structured log files from disk.</p>\r\n\t\t\t<!--end reactor header info-->\r\n\r\n\t\t\t <!--start reactor settings-->\r\n\t\t\t<div style=\"float:left; margin-right: 25px;\">\r\n\t\t\t\t<table\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" class=\"id_text_box\" disabled=\"true\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table>\r\n\t\t\t</div>\r\n\t\t\t<div style=\"float:left;\">\r\n\t\t\t\t<table\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Codec:</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"Codec\" store=\"pion.codecs.config_store\" searchAttr=\"Name\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Directory:</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Directory\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Filename Regex:</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Filename\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Frequency (in seconds):</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.ValidationTextBox\" type=\"text\" name=\"Frequency\" regExp=\"[1-9][0-9]*\"></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Just One</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"JustOne\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Tail</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"TailF\"/></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table>\r\n\t\t\t</div>\r\n\t\t\t<div style=\"clear:both;\"></div>\r\n\t\t\t<!--end reactor settings-->\r\n\r\n\t\t</div>\r\n\t\t<!--end div to set padding for top half of dialog-->\r\n\r\n\t\t<!--start div to set padding for bottom half of dialog-->\r\n\t\t<div class=\"reactor_dialog_bottom\">\r\n\r\n\t\t\t<!--start connections-->\r\n\t\t\t<div class=\"c_reactor_grid_blocks\">\r\n\t\t\t\t<h2>Connections</h2>\r\n\t\t\t\t<h3>Input Connections</h3>\r\n\t\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"reactor_inputs_grid_node\" style=\"width: 618px\"></div>\r\n\t\t\t\t<h3>Output Connections</h3>\r\n\t\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"reactor_outputs_grid_node\" style=\"width: 618px\"></div>\r\n\t\t\t</div>\r\n\t\t\t<!--end connections-->\r\n\r\n\t\t\t<!--start buttons--> \r\n\t\t\t<div class=\"save_cancel_delete\">\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"delete\">Delete Reactor</button>\r\n\t\t\t</div>\r\n\t\t\t<!--end buttons--> \r\n\r\n\t\t</div>\r\n\t\t<!--end div to set padding for bottom half of dialog-->\r\n\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
}});
plugins.reactors.LogInputReactor.option_defaults={JustOne:false,TailF:false};
}
if(!dojo._hasResource["pion.widgets.TermSelector"]){
dojo._hasResource["pion.widgets.TermSelector"]=true;
dojo.provide("pion.widgets.TermSelector");
dojo.declare("pion.widgets.TermSelector",[dijit._Widget,dijit._Templated],{templateString:"<table cellspacing=\"0\" cellpadding=\"0\" class=\"termSelectorContainer\">\r\n\t<thead>\r\n\t\t<tr class=\"dijitReset termSelectorHead\" valign=\"top\">\r\n\t\t\t<th>\r\n\t\t\t\tVocabulary\r\n\t\t\t</th>\r\n\t\t\t<th>\r\n\t\t\t\tTerm\r\n\t\t\t</th>\r\n\t\t</tr>\r\n\t</thead>\r\n\t<tbody class=\"dijitReset termSelectorBody\">\r\n\t\t<tr>\r\n\t\t\t<td>\r\n\t\t\t\t<select dojoAttachPoint=\"vocab_select\" size=9 style=\"width: 100%\">\r\n\t\t\t\t</select>\r\n\t\t\t</td><td>\r\n\t\t\t\t<select dojoAttachPoint=\"term_select\" dojoAttachEvent=\"ondblclick: _handleDoubleClick\" size=9 style=\"width: 100%\">\r\n\t\t\t\t</select>\r\n\t\t\t</td>\r\n\t\t</tr>\r\n\t\t<tr>\r\n\t\t\t<td>\r\n\t\t\t\t<div style=\"width: 230px; height: 1px\" />\r\n\t\t\t</td><td>\r\n\t\t\t\t<div style=\"width: 230px; height: 1px\" />\r\n\t\t\t</td>\r\n\t\t</tr>\r\n\t</tbody>\r\n\t<tfoot class=\"dijitReset\">\r\n\t\t<tr>\r\n\t\t\t<td colspan=\"2\">\r\n\t\t\t\t<input dojoAttachPoint=\"term_comment\" disabled=\"true\" style=\"width: 99%; margin-top:5px; margin-bottom:5px;\" />\r\n\t\t\t</td>\r\n\t\t</tr>\r\n\t\t<tr>\r\n\t\t\t<td class='dijitReset' valign=\"top\" colspan=\"2\">\r\n\t\t\t\t<button class=\"add_new\" dojoAttachEvent=\"onclick: _handleAddNewVocabulary\" style=\"width: 180px\">Add new vocabulary</button>\r\n\t\t\t\t<button class=\"add_new disabled\" dojoAttachEvent=\"onclick: _handleAddNewTerm\"\r\n\t\t\t\t\t\tdojoAttachPoint=\"add_new_term_button\" disabled=true style=\"width: 140px\">Add new term</button>\r\n\t\t\t\t<button class=\"save disabled\" dojoAttachEvent=\"onclick: _handleSelectTerm\"\r\n\t\t\t\t\t\tdojoAttachPoint=\"select_term_button\" disabled=true style=\"width: 125px\">Select term</button>\r\n\t\t\t</td>\r\n\t\t</tr>\r\n\t</tfoot>\r\n</table>\r\n",_handleAddNewVocabulary:function(e){
pion.vocabularies.addNewVocabulary();
},_handleAddNewTerm:function(e){
var _149a=new plugins.vocabularies.TermInitDialog({vocabulary:this.vocabulary});
var _this=this;
_149a.onNewTermSaved=function(_149c){
_this.value=_149c;
_this.onValueSelected(_149c);
};
setTimeout(function(){
dojo.query("input",_149a.domNode)[0].select();
},500);
_149a.show();
},_handleSelectTerm:function(e){
this.value=this.term_select.value;
this.onValueSelected(this.value);
},_handleDoubleClick:function(e){
this.value=this.term_select.value;
this.onValueSelected(this.value);
},_setText:function(node,text){
while(node.firstChild){
node.removeChild(node.firstChild);
}
node.appendChild(dojo.doc.createTextNode(text));
},postCreate:function(){
this.inherited(arguments);
var _this=this;
var _14a2=this.initial_term?this.initial_term.toString().split("#")[0]:"";
pion.vocabularies.vocabularies_by_id={};
var index=0;
var _14a4=0;
pion.vocabularies.config_store.fetch({sort:[{attribute:"@id"}],onItem:function(item){
var id=pion.vocabularies.config_store.getValue(item,"@id");
if(id==_14a2){
_14a4=index;
}
var _14a7=id.split(":")[2];
if(dojo.isIE){
_this.vocab_select.add(new Option(_14a7,id));
}else{
_this.vocab_select.add(new Option(_14a7,id),null);
}
pion.vocabularies.vocabularies_by_id[id]=new plugins.vocabularies.Vocabulary({"@id":id});
++index;
},onComplete:function(){
_this.vocab_select.focus();
_this.vocab_select.selectedIndex=_14a4;
_this.vocab_select.onchange();
},onError:pion.handleFetchError});
this.vocab_select.onchange=function(){
var id=_this.vocab_select.value;
_this.vocabulary=pion.vocabularies.vocabularies_by_id[id];
var h=dojo.connect(_this.vocabulary,"onDoneLoadingTerms",function(){
dojo.disconnect(h);
_this.add_new_term_button.disabled=_this.vocabulary.config.Locked;
if(_this.vocabulary.config.Locked){
dojo.addClass(_this.add_new_term_button,"disabled");
}else{
dojo.removeClass(_this.add_new_term_button,"disabled");
}
var _14aa=id.split(":")[2];
var label=_this.vocabulary.config.Locked?_14aa+" (L)":_14aa;
_this.vocab_select.options[_this.vocab_select.selectedIndex].text=label;
_this.term_select.options.length=0;
_this.term_comments_by_id={};
var index=0;
var _14ad=0;
_this.vocabulary.vocab_term_store.fetch({sort:[{attribute:"ID"}],onItem:function(item){
var _14af=_this.vocabulary.vocab_term_store.getValue(item,"full_id");
var _14b0=true;
if(_this.query&&_this.query.category){
_14b0=(pion.terms.categories_by_id[_14af]==_this.query.category);
}else{
if(_this.query&&_this.query.type){
var type=_this.vocabulary.vocab_term_store.getValue(item,"Type");
_14b0=(type==_this.query.type);
}
}
if(_14b0){
if(_this.initial_term&&_this.initial_term.toString()==_14af){
_14ad=index;
}
_this.term_comments_by_id[_14af]=_this.vocabulary.vocab_term_store.getValue(item,"Comment");
var id=_this.vocabulary.vocab_term_store.getValue(item,"ID");
if(dojo.isIE){
_this.term_select.add(new Option(id,_14af));
}else{
_this.term_select.add(new Option(id,_14af),null);
}
++index;
}
},onComplete:function(){
_this.term_select.selectedIndex=_14ad;
_this.term_select.onchange();
},onError:pion.handleFetchError});
});
_this.vocabulary.populateFromServerVocabStore();
_this.select_term_button.disabled=true;
dojo.addClass(_this.select_term_button,"disabled");
};
this.term_select.onchange=function(){
_this.select_term_button.disabled=false;
dojo.removeClass(_this.select_term_button,"disabled");
_this.term_comment.value=_this.term_comments_by_id[_this.term_select.value];
};
this.connect(this.vocab_select,"keyup",function(e){
if(e.keyCode==dojo.keys.ENTER){
this.term_select.focus();
}
});
this.connect(this.term_select,"keyup",function(e){
if(e.keyCode==dojo.keys.ENTER){
this.value=this.term_select.value;
this.onValueSelected(this.value);
}
});
},onChange:function(value){
}});
}
if(!dojo._hasResource["pion.widgets.TermTextBox"]){
dojo._hasResource["pion.widgets.TermTextBox"]=true;
dojo.provide("pion.widgets.TermTextBox");
dojo.declare("pion.widgets._TermTextBox",dijit.form.TextBox,{popupClass:"",postMixInProperties:function(){
this.inherited(arguments);
if(!this.value||this.value.toString()==""){
this.value=null;
}
},_onFocus:function(evt){
this._open();
},_setValueAttr:function(value,_14b8,_14b9){
this.inherited(arguments);
if(this._picker){
if(!value){
value="";
}
this._picker.attr("value",value);
}
},_open:function(){
if(this.disabled||this.readOnly||!this.popupClass){
return;
}
var _14ba=this;
if(!this._picker){
var _14bb=dojo.getObject(this.popupClass,false);
this._picker=new _14bb({onValueSelected:function(value){
if(_14ba._tabbingAway){
delete _14ba._tabbingAway;
}else{
_14ba.focus();
}
setTimeout(dojo.hitch(_14ba,"_close"),1);
pion.widgets._TermTextBox.superclass._setValueAttr.call(_14ba,value,true);
},initial_term:_14ba.value,query:_14ba.query,lang:_14ba.lang,constraints:_14ba.constraints});
}
if(!this._opened){
dijit.popup.open({parent:this,popup:this._picker,around:this.domNode,onCancel:dojo.hitch(this,this._close),onClose:function(){
_14ba._opened=false;
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
},_setDisplayedValueAttr:function(value,_14be){
this._setValueAttr(this.parse(value,this.constraints),_14be,value);
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
if(pion.widgets._TermTextBox.superclass._onKeyPress.apply(this,arguments)){
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
dojo.declare("pion.widgets.TermTextBox",pion.widgets._TermTextBox,{query:{},baseClass:"dijitTextBox",popupClass:"pion.widgets.TermSelector"});
dojo.declare("pion.widgets.TermTextCell",dojox.grid.cells._Widget,{widgetClass:"pion.widgets.TermTextBox",getWidgetProps:function(_14c2){
return dojo.mixin(this.inherited(arguments),{value:_14c2});
}});
}
if(!dojo._hasResource["plugins.codecs.Codec"]){
dojo._hasResource["plugins.codecs.Codec"]=true;
dojo.provide("plugins.codecs.Codec");
dojo.declare("plugins.codecs.CodecInitDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog codec_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Codec Initialization</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Plugin&nbsp;Type</label></td\r\n\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"Plugin\" \r\n\t\t\t\t\t\tstore=\"pion.codecs.plugin_data_store\" searchAttr=\"label\" \r\n\t\t\t\t\t\tstyle=\"width: 100%;\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Event&nbsp;Type</label></td\r\n\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"EventType\" query=\"{Type: 'object'}\" \r\n\t\t\t\t\t\tstore=\"pion.terms.store\" searchAttr=\"id\" /></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t></div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: hide\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true});
dojo.declare("plugins.codecs.CodecPane",[dijit.layout.AccordionPane],{templateString:"<div class='dijitAccordionPane codec_pane'\r\n\t><div dojoAttachPoint='titleNode,focusNode' dojoAttachEvent='ondijitclick:_onTitleClick,onkeypress:_onTitleKeyPress,onfocus:_handleFocus,onblur:_handleFocus'\r\n\t\tclass='dijitAccordionTitle' wairole=\"tab\"\r\n\t\t><div class='dijitAccordionArrow'></div\r\n\t\t><div class='arrowTextUp' waiRole=\"presentation\">&#9650;</div\r\n\t\t><div class='arrowTextDown' waiRole=\"presentation\">&#9660;</div\r\n\t\t><div dojoAttachPoint='titleTextNode' class='dijitAccordionText'>${title}</div></div\r\n\t><div\r\n\t\t><div dojoAttachPoint='containerNode' style='overflow: hidden; height: 1px; display: none'\r\n\t\t\tclass='dijitAccordionBody' wairole=\"tabpanel\"\r\n\t\t\t><form dojoAttachPoint=\"form\" dojoType=\"dijit.form.Form\"\r\n\t\t\t\t><br/\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"100%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Name</label></td\r\n\t\t\t\t\t\t><td><input dojoAttachPoint=\"name\" dojoType=\"dijit.form.TextBox\" name=\"Name\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td rowspan=\"4\" valign=\"top\" width=\"20\">&nbsp;</td\r\n\t\t\t\t\t\t><td rowspan=\"1\"><label>Comments</label></td\r\n\t\t\t\t\t\t><td rowspan=\"4\" valign=\"top\"><textarea rows=\"4\" style=\"width: 95%\" name=\"Comment\" class=\"comment\"></textarea></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>ID</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td rowspan=\"3\">&nbsp;</td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Plugin&nbsp;Type</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Plugin\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Event&nbsp;Type</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"EventType\"\r\n\t\t\t\t\t\t\t\tstore=\"pion.terms.store\" searchAttr=\"id\" query=\"{Type: 'object'}\" /></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><br/\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" style=\"border: 1px solid #999999;\" width=\"99%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td class=\"matrixMainHeader\">Map Field Names to Terms</td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td style=\"background-color: #f1f1f1;\"\r\n\t\t\t\t\t\t\t><div class=\"codec_grid plugin_pane_grid\" dojoAttachPoint=\"field_mapping_grid_node\"></div\r\n\t\t\t\t\t\t\t><button dojoType=dijit.form.Button class=\"add_new_row\" dojoAttachEvent=\"onClick:_handleAddNewField\">ADD NEW ROW</button\r\n\t\t\t\t\t\t></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><hr noshade=\"noshade\" size=\"1\" color=\"#999999\"\r\n\t\t\t\t><div class=\"save_cancel_delete\"\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick:save\">Save Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick:cancel\">Cancel Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"delete\" dojoAttachEvent=\"onClick:delete2\">Delete Codec</button\r\n\t\t\t\t></div\r\n\t\t\t></form\r\n\t\t></div\r\n\t></div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
this.special_config_elements=["Field","tagName","childNodes"];
var _this=this;
this.field_mapping_store=new dojo.data.ItemFileWriteStore({data:{identifier:"ID",items:[]}});
this.field_mapping_store.next_id=0;
this._initFieldMappingGridLayout();
this.field_mapping_grid=new dojox.grid.DataGrid({store:this.field_mapping_store,structure:this.field_mapping_grid_layout,singleClickEdit:true},document.createElement("div"));
this.field_mapping_grid_node.appendChild(this.field_mapping_grid.domNode);
this.field_mapping_grid.startup();
this.field_mapping_grid.connect(this.field_mapping_grid,"onCellClick",function(e){
if(e.cell.name=="Delete"){
this.store.deleteItem(this.getItem(e.rowIndex));
_this.markAsChanged();
}
});
this.connect(this.field_mapping_grid,"onApplyCellEdit",_this._handleCellEdit);
dojo.query("input",this.domNode).forEach(function(n){
dojo.connect(n,"change",_this,_this.markAsChanged);
});
dojo.query("textarea",this.domNode).forEach(function(n){
dojo.connect(n,"change",_this,_this.markAsChanged);
});
dojo.query("select",this.domNode).forEach(function(n){
dojo.connect(n,"change",_this,_this.markAsChanged);
});
this.populateWithDefaults();
},populateWithDefaults:function(){
},_initFieldMappingGridLayout:function(){
this.field_mapping_grid_layout=[{defaultCell:{editable:true,type:dojox.grid.cells._Widget,styles:"text-align: left;"},rows:[{field:"FieldName",name:"Field Name",width:15,formatter:pion.xmlCellFormatter},{field:"Term",name:"Term",width:"auto",type:pion.widgets.TermTextCell},{name:"Delete",styles:"align: center;",width:3,editable:false,formatter:pion.makeDeleteButton}]}];
},getHeight:function(){
return 475;
},populateFromConfigItem:function(item){
this.populateWithDefaults();
var store=pion.codecs.config_store;
var _14ca={};
var _14cb=store.getAttributes(item);
for(var i=0;i<_14cb.length;++i){
if(dojo.indexOf(this.special_config_elements,_14cb[i])==-1){
_14ca[_14cb[i]]=store.getValue(item,_14cb[i]).toString();
}
}
if(this._addCustomConfigValues){
this._addCustomConfigValues(_14ca,item);
}
this.form.attr("value",_14ca);
var _14cd=dojo.query("textarea.comment",this.form.domNode)[0];
_14cd.value=_14ca.Comment;
this.title=_14ca.Name;
var _14ce=dojo.query(".dijitAccordionTitle .dijitAccordionText",this.domNode)[0];
_14ce.firstChild.nodeValue=this.title;
this._reloadFieldMappingStore(item);
var node=this.domNode;
setTimeout(function(){
dojo.removeClass(node,"unsaved_changes");
},500);
},_reloadFieldMappingStore:function(_14d0){
var _this=this;
this.field_mapping_store.fetch({onItem:function(_14d2){
_this.field_mapping_store.deleteItem(_14d2);
},onComplete:function(){
_this._repopulateFieldMappingStore(_14d0);
},onError:pion.handleFetchError});
},_repopulateFieldMappingStore:function(_14d3){
var _this=this;
var store=pion.codecs.config_store;
dojo.forEach(store.getValues(_14d3,"Field"),function(_14d6){
var _14d7={ID:_this.field_mapping_store.next_id++,FieldName:store.getValue(_14d6,"text()"),Term:store.getValue(_14d6,"@term")};
_this.field_mapping_store.newItem(_14d7);
});
},_handleCellEdit:function(_14d8,_14d9,_14da){
console.debug("CodecPane._handleCellEdit inValue = ",_14d8,", inRowIndex = ",_14d9,", inFieldIndex = ",_14da);
dojo.addClass(this.domNode,"unsaved_changes");
},_handleAddNewField:function(){
this.markAsChanged();
this.field_mapping_store.newItem({ID:this.field_mapping_store.next_id++});
},onFieldMappingPutDataReady:function(){
},save:function(){
var _this=this;
this.field_mapping_store.fetch({onComplete:function(items){
dojo.removeClass(_this.domNode,"unsaved_changes");
_this.field_mapping_put_data=_this._makeFieldElements(items);
_this.doPutRequest();
},onError:pion.handleFetchError});
},_makeFieldElements:function(items){
var _14de="";
var store=this.field_mapping_store;
dojo.forEach(items,function(item){
_14de+="<Field term=\""+store.getValue(item,"Term")+"\">";
_14de+=pion.escapeXml(store.getValue(item,"FieldName"))+"</Field>";
});
return _14de;
},doPutRequest:function(){
var _14e1=this.form.attr("value");
var _14e2=dojo.query("textarea.comment",this.form.domNode)[0];
_14e1.Comment=_14e2.value;
var _14e3="<PionConfig><Codec>";
for(var tag in _14e1){
if(tag.charAt(0)!="@"&&tag!="options"){
console.debug("config[",tag,"] = ",_14e1[tag]);
_14e3+=pion.makeXmlLeafElement(tag,_14e1[tag]);
}
}
if(this._makeCustomElements){
_14e3+=this._makeCustomElements(_14e1);
}
_14e3+=this.field_mapping_put_data;
_14e3+="</Codec></PionConfig>";
console.debug("put_data: ",_14e3);
_this=this;
dojo.rawXhrPut({url:"/config/codecs/"+this.uuid,contentType:"text/xml",handleAs:"xml",putData:_14e3,load:function(_14e5){
console.debug("response: ",_14e5);
pion.codecs.config_store.fetch({query:{"@id":_this.uuid},onItem:function(item){
_this.config_item=item;
_this.populateFromConfigItem(item);
},onError:pion.handleFetchError});
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_14e3})});
},cancel:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
this.populateFromConfigItem(this.config_item);
},delete2:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
console.debug("delete2: selected codec is ",this.title);
_this=this;
dojo.xhrDelete({url:"/config/codecs/"+this.uuid,handleAs:"xml",timeout:5000,load:function(_14e7,_14e8){
console.debug("xhrDelete for url = /config/codecs/"+this.uuid,"; HTTP status code: ",_14e8.xhr.status);
dijit.byId("codec_config_accordion").forward();
dijit.byId("codec_config_accordion").removeChild(_this);
pion.codecs._adjustAccordionSize();
return _14e7;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
},markAsChanged:function(e){
console.debug("markAsChanged: e = ",e);
dojo.addClass(this.domNode,"unsaved_changes");
},codec:""});
}
if(!dojo._hasResource["plugins.codecs.LogCodec"]){
dojo._hasResource["plugins.codecs.LogCodec"]=true;
dojo.provide("plugins.codecs.LogCodec");
plugins.codecs.LogCodec={custom_post_data:"<Flush>false</Flush><Headers>false</Headers>"+"<Events split=\"\\r\\n\" join=\"\\n\" comment=\"#\"/>"+"<Fields split=\" \\t\" join=\"\\_\" consume=\"true\"/>"};
dojo.declare("plugins.codecs.LogCodecPane",[plugins.codecs.CodecPane],{templateString:"<div class='dijitAccordionPane codec_pane'\r\n\t><div dojoAttachPoint='titleNode,focusNode' dojoAttachEvent='ondijitclick:_onTitleClick,onkeypress:_onTitleKeyPress,onfocus:_handleFocus,onblur:_handleFocus'\r\n\t\tclass='dijitAccordionTitle' wairole=\"tab\"\r\n\t\t><div class='dijitAccordionArrow'></div\r\n\t\t><div class='arrowTextUp' waiRole=\"presentation\">&#9650;</div\r\n\t\t><div class='arrowTextDown' waiRole=\"presentation\">&#9660;</div\r\n\t\t><div dojoAttachPoint='titleTextNode' class='dijitAccordionText'>${title}</div></div\r\n\t><div\r\n\t\t><div dojoAttachPoint='containerNode' style='overflow: hidden; height: 1px; display: none'\r\n\t\t\tclass='dijitAccordionBody' wairole=\"tabpanel\"\r\n\t\t\t><form dojoAttachPoint=\"form\" dojoType=\"dijit.form.Form\"\r\n\t\t\t\t><br/\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"100%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Name</label></td\r\n\t\t\t\t\t\t><td><input dojoAttachPoint=\"name\" dojoType=\"dijit.form.TextBox\" name=\"Name\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td rowspan=\"4\" valign=\"top\" width=\"20\">&nbsp;</td\r\n\t\t\t\t\t\t><td rowspan=\"1\"><label>Comments</label></td\r\n\t\t\t\t\t\t><td rowspan=\"3\" valign=\"top\"><textarea rows=\"4\" style=\"width: 95%\" name=\"Comment\" class=\"comment\"></textarea></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>ID</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Plugin&nbsp;Type</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Plugin\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Event&nbsp;Type</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"EventType\"\r\n\t\t\t\t\t\t\t\tstore=\"pion.terms.store\" searchAttr=\"id\" query=\"{Type: 'object'}\" /></td\r\n\t\t\t\t\t\t><td><label>Time&nbsp;Offset&nbsp;(minutes)</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"TimeOffset\" style=\"width: 50px;\"/></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"Flush\"/\r\n\t\t\t\t><label>Flush output stream after each write</label\r\n\t\t\t\t><br/\r\n\t\t\t\t><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"Headers\" dojoAttachEvent=\"onClick: updateDisabling\"/\r\n\t\t\t\t><label>Extended Log Format</label\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"100%\" dojoAttachPoint=\"separators\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><th width=\"120px\"></th\r\n\t\t\t\t\t\t><th>Record Separators</th\r\n\t\t\t\t\t\t><th rowspan=\"4\" valign=\"top\" width=\"20\">&nbsp;</th\r\n\t\t\t\t\t\t><th width=\"120px\"></th\r\n\t\t\t\t\t\t><th>Field Separators</th\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Split&nbsp;Set</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@event_split_set\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td><label class=\"disable_for_ELF\">Split&nbsp;Set</label></td\r\n\t\t\t\t\t\t><td><input class=\"disable_for_ELF\" dojoType=\"dijit.form.TextBox\" name=\"@field_split_set\" style=\"width: 95%;\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Join&nbsp;String</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@event_join_string\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td><label class=\"disable_for_ELF\">Join&nbsp;String</label></td\r\n\t\t\t\t\t\t><td><input class=\"disable_for_ELF\" dojoType=\"dijit.form.TextBox\" name=\"@field_join_string\" style=\"width: 95%;\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Comment&nbsp;Char</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.ValidationTextBox\" regExp=\".?\" name=\"@comment_prefix\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td><label class=\"disable_for_ELF\">Consecutive&nbsp;Delimiters</label></td\r\n\t\t\t\t\t\t><td\r\n\t\t\t\t\t\t\t ><select dojoType=\"pion.widgets.SimpleSelect\" style=\"width: 95%;\" name=\"@consec_field_delims\"\r\n\t\t\t\t\t\t\t\t><option value=\"true\">equivalent to single delimiter</option\r\n\t\t\t\t\t\t\t\t><option value=\"false\">indicate empty fields</option\r\n\t\t\t\t\t\t\t></select\r\n\t\t\t\t\t\t></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" style=\"border: 1px solid #999999;\" width=\"99%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td class=\"matrixMainHeader\">Map Field Names to Terms</td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td style=\"background-color: #f1f1f1;\"\r\n\t\t\t\t\t\t\t><div class=\"codec_grid plugin_pane_grid\" dojoAttachPoint=\"field_mapping_grid_node\"></div\r\n\t\t\t\t\t\t\t><button dojoType=dijit.form.Button class=\"add_new_row\" dojoAttachEvent=\"onClick:_handleAddNewField\">ADD NEW ROW</button\r\n\t\t\t\t\t\t></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><hr noshade=\"noshade\" size=\"1\" color=\"#999999\"\r\n\t\t\t\t><div class=\"save_cancel_delete\"\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick:save\">Save Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick:cancel\">Cancel Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"delete\" dojoAttachEvent=\"onClick:delete2\">Delete Codec</button\r\n\t\t\t\t></div\r\n\t\t\t></form\r\n\t\t></div\r\n\t></div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
this.special_config_elements.push("Events");
this.special_config_elements.push("Fields");
this.populateWithDefaults();
},populateWithDefaults:function(){
this.inherited("populateWithDefaults",arguments);
this.form.attr("value",{TimeOffset:0});
this.form.attr("value",{"@event_split_set":"","@event_join_string":"","@comment_prefix":"","@field_split_set":"","@field_join_string":"","@consec_field_delims":"true"});
},_initFieldMappingGridLayout:function(){
this.field_mapping_grid_layout=[{defaultCell:{editable:true,type:dojox.grid.cells._Widget,styles:"text-align: left;"},rows:[{field:"FieldName",name:"Field Name",width:15,formatter:pion.xmlCellFormatter},{field:"Term",name:"Term",width:15,type:pion.widgets.TermTextCell},{field:"StartChar",name:"Start Char",styles:"text-align: center",width:3},{field:"EndChar",name:"End Char",styles:"text-align: center",width:3},{field:"StartEndOptional",name:"Start/End Optional",width:4,type:dojox.grid.cells.Bool},{field:"URLEncode",name:"URL Encode",width:4,type:dojox.grid.cells.Bool},{field:"EscapeChar",name:"Escape Char",styles:"text-align: center",width:3},{field:"EmptyString",name:"Empty String",width:3,formatter:pion.xmlCellFormatter},{field:"Order",name:"Order",width:"auto",widgetClass:"dijit.form.NumberSpinner"},{name:"Delete",styles:"align: center;",width:3,editable:false,formatter:pion.makeDeleteButton}]}];
},getHeight:function(){
return 610;
},_addCustomConfigValues:function(_14ea,item){
var store=pion.codecs.config_store;
_14ea.options=[];
if(store.hasAttribute(item,"Flush")){
if(store.getValue(item,"Flush").toString()=="true"){
_14ea.options.push("Flush");
}
}
var _14ed=false;
if(store.hasAttribute(item,"Headers")){
if(store.getValue(item,"Headers").toString()=="true"){
_14ea.options.push("Headers");
this.disableAndClearFieldSeparatorFields();
_14ed=true;
}
}
var _14ee=store.getValue(item,"Events");
if(_14ee){
_14ea["@event_split_set"]=store.getValue(_14ee,"@split");
_14ea["@event_join_string"]=store.getValue(_14ee,"@join");
_14ea["@comment_prefix"]=store.getValue(_14ee,"@comment");
}
if(!_14ed){
var _14ef=store.getValue(item,"Fields");
if(_14ef){
_14ea["@field_split_set"]=store.getValue(_14ef,"@split");
_14ea["@field_join_string"]=store.getValue(_14ef,"@join");
_14ea["@consec_field_delims"]=store.getValue(_14ef,"@consume");
}
}
},_makeCustomElements:function(_14f0){
var _14f1="<Flush>";
_14f1+=(dojo.indexOf(_14f0.options,"Flush")!=-1);
_14f1+="</Flush><Headers>";
_14f1+=(dojo.indexOf(_14f0.options,"Headers")!=-1);
_14f1+="</Headers><Events";
if(_14f0["@event_split_set"]){
_14f1+=" split=\""+pion.escapeXml(_14f0["@event_split_set"])+"\"";
}
if(_14f0["@event_join_string"]){
_14f1+=" join=\""+pion.escapeXml(_14f0["@event_join_string"])+"\"";
}
if(_14f0["@comment_prefix"]){
_14f1+=" comment=\""+pion.escapeXml(_14f0["@comment_prefix"])+"\"";
}
_14f1+="/><Fields";
if(_14f0["@field_split_set"]){
_14f1+=" split=\""+pion.escapeXml(_14f0["@field_split_set"])+"\"";
}
if(_14f0["@field_join_string"]){
_14f1+=" join=\""+pion.escapeXml(_14f0["@field_join_string"])+"\"";
}
if(_14f0["@consec_field_delims"]){
_14f1+=" consume=\""+pion.escapeXml(_14f0["@consec_field_delims"])+"\"";
}
_14f1+="/>";
return _14f1;
},_repopulateFieldMappingStore:function(_14f2){
var _this=this;
var store=pion.codecs.config_store;
_this.order_map=[];
var order=1;
dojo.forEach(store.getValues(_14f2,"Field"),function(_14f6){
var _14f7={ID:_this.field_mapping_store.next_id++,FieldName:store.getValue(_14f6,"text()"),Term:store.getValue(_14f6,"@term"),StartChar:store.getValue(_14f6,"@start"),EndChar:store.getValue(_14f6,"@end"),StartEndOptional:store.getValue(_14f6,"@optional"),URLEncode:store.getValue(_14f6,"@urlencode"),EscapeChar:store.getValue(_14f6,"@escape"),EmptyString:store.getValue(_14f6,"@empty"),Order:order};
_this.field_mapping_store.newItem(_14f7);
_this.order_map.push(order++);
});
},_handleCellEdit:function(_14f8,_14f9,_14fa){
console.debug("LogCodecPane._handleCellEdit inValue = ",_14f8,", inRowIndex = ",_14f9,", attr_name = ",_14fa);
dojo.addClass(this.domNode,"unsaved_changes");
if(_14fa=="Order"){
var _14fb=this.order_map[_14f9];
var _14fc=this.order_map;
console.debug("1: order_map = ",_14fc);
_14fc[_14f9]=_14f8;
if(_14f8>_14fb){
for(var i=0;i<_14fc.length;++i){
if(_14fc[i]>_14fb&&_14fc[i]<=_14f8&&i!=_14f9){
_14fc[i]--;
}
}
}else{
for(var i=0;i<_14fc.length;++i){
if(_14fc[i]>=_14f8&&_14fc[i]<_14fb&&i!=_14f9){
_14fc[i]++;
}
}
}
console.debug("2: order_map = ",_14fc);
for(var i=0;i<_14fc.length;++i){
var item=this.field_mapping_grid.getItem(i);
this.field_mapping_store.setValue(item,"Order",_14fc[i]);
}
}
},_makeFieldElements:function(items){
var _1500=items.length;
var _1501=[];
for(var i=0;i<_1500;++i){
if(this.order_map.length==_1500){
_1501[this.order_map[i]-1]=i;
}else{
_1501[i]=i;
}
}
console.debug("this.order_map = ",this.order_map);
console.debug("inverse_order_map = ",_1501);
var _1503="";
var store=this.field_mapping_store;
for(var i=0;i<_1500;++i){
var item=items[_1501[i]];
_1503+="<Field term=\""+store.getValue(item,"Term")+"\"";
if(store.getValue(item,"StartChar")){
_1503+=" start=\""+pion.escapeXml(store.getValue(item,"StartChar"))+"\"";
}
if(store.getValue(item,"EndChar")){
_1503+=" end=\""+pion.escapeXml(store.getValue(item,"EndChar"))+"\"";
}
if(store.getValue(item,"StartEndOptional")){
_1503+=" optional=\"true\"";
}
if(store.getValue(item,"URLEncode")){
_1503+=" urlencode=\"true\"";
}
if(store.getValue(item,"EscapeChar")){
_1503+=" escape=\""+pion.escapeXml(store.getValue(item,"EscapeChar"))+"\"";
}
if(store.getValue(item,"EmptyString")){
_1503+=" empty=\""+pion.escapeXml(store.getValue(item,"EmptyString"))+"\"";
}
_1503+=">"+pion.escapeXml(store.getValue(item,"FieldName"))+"</Field>";
}
return _1503;
},disableAndClearFieldSeparatorFields:function(){
dojo.query("input.disable_for_ELF",this.separators).forEach(function(n){
n.setAttribute("disabled",true);
});
dojo.query("select",this.separators).forEach(function(n){
dijit.byNode(n).attr("disabled",true);
dijit.byNode(n).attr("value",null);
});
dojo.query("label.disable_for_ELF",this.separators).forEach(function(n){
dojo.addClass(n,"disabled");
});
var _1509=this.form.attr("value");
_1509["@field_split_set"]="";
_1509["@field_join_string"]="";
this.form.attr("value",_1509);
},updateDisabling:function(e){
if(e.target.checked){
this.disableAndClearFieldSeparatorFields();
}else{
dojo.query("input.disable_for_ELF",this.separators).forEach(function(n){
n.removeAttribute("disabled");
});
dojo.query("select",this.separators).forEach(function(n){
dijit.byNode(n).attr("disabled",false);
});
dojo.query("label.disable_for_ELF",this.separators).forEach(function(n){
dojo.removeClass(n,"disabled");
});
}
}});
}
if(!dojo._hasResource["plugins.codecs.XMLCodec"]){
dojo._hasResource["plugins.codecs.XMLCodec"]=true;
dojo.provide("plugins.codecs.XMLCodec");
dojo.declare("plugins.codecs.XMLCodecPane",[plugins.codecs.CodecPane],{templateString:"<div class='dijitAccordionPane codec_pane'\r\n\t><div dojoAttachPoint='titleNode,focusNode' dojoAttachEvent='ondijitclick:_onTitleClick,onkeypress:_onTitleKeyPress,onfocus:_handleFocus,onblur:_handleFocus'\r\n\t\tclass='dijitAccordionTitle' wairole=\"tab\"\r\n\t\t><div class='dijitAccordionArrow'></div\r\n\t\t><div class='arrowTextUp' waiRole=\"presentation\">&#9650;</div\r\n\t\t><div class='arrowTextDown' waiRole=\"presentation\">&#9660;</div\r\n\t\t><div dojoAttachPoint='titleTextNode' class='dijitAccordionText'>${title}</div></div\r\n\t><div\r\n\t\t><div dojoAttachPoint='containerNode' style='overflow: hidden; height: 1px; display: none'\r\n\t\t\tclass='dijitAccordionBody' wairole=\"tabpanel\"\r\n\t\t\t><form dojoAttachPoint=\"form\" dojoType=\"dijit.form.Form\"\r\n\t\t\t\t><br/\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"100%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Name</label></td\r\n\t\t\t\t\t\t><td><input dojoAttachPoint=\"name\" dojoType=\"dijit.form.TextBox\" name=\"Name\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td rowspan=\"4\" valign=\"top\" width=\"20\">&nbsp;</td\r\n\t\t\t\t\t\t><td rowspan=\"1\"><label>Comments</label></td\r\n\t\t\t\t\t\t><td rowspan=\"4\" valign=\"top\"><textarea rows=\"4\" style=\"width: 95%\" name=\"Comment\" class=\"comment\"></textarea></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>ID</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td rowspan=\"3\">&nbsp;</td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Plugin&nbsp;Type</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Plugin\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Event&nbsp;Type</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"EventType\"\r\n\t\t\t\t\t\t\t\tstore=\"pion.terms.store\" searchAttr=\"id\" query=\"{Type: 'object'}\" /></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Event&nbsp;Tag</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"EventTag\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Event&nbsp;Container&nbsp;Tag</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"EventContainerTag\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><br/\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" style=\"border: 1px solid #999999;\" width=\"99%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td class=\"matrixMainHeader\">Map Field Names to Terms</td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td style=\"background-color: #f1f1f1;\"\r\n\t\t\t\t\t\t\t><div class=\"codec_grid plugin_pane_grid\" dojoAttachPoint=\"field_mapping_grid_node\"></div\r\n\t\t\t\t\t\t\t><button dojoType=dijit.form.Button class=\"add_new_row\" dojoAttachEvent=\"onClick:_handleAddNewField\">ADD NEW ROW</button\r\n\t\t\t\t\t\t></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><hr noshade=\"noshade\" size=\"1\" color=\"#999999\"\r\n\t\t\t\t><div class=\"save_cancel_delete\"\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick:save\">Save Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick:cancel\">Cancel Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"delete\" dojoAttachEvent=\"onClick:delete2\">Delete Codec</button\r\n\t\t\t\t></div\r\n\t\t\t></form\r\n\t\t></div\r\n\t></div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
this.populateWithDefaults();
},populateWithDefaults:function(){
this.inherited("populateWithDefaults",arguments);
this.form.attr("value",{EventTag:"Event",EventContainerTag:"Events"});
},getHeight:function(){
return 540;
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
pion.codecs.config_store.fetchItemByIdentity=function(_150e){
pion.codecs.config_store.fetch({query:{"@id":_150e.identity},onItem:_150e.onItem,onError:pion.handleFetchError});
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
var title=pion.escapeXml(pion.codecs.config_store.getValue(item,"Name"));
var _1513=new dijit.layout.AccordionPane({title:title});
_1513.config_item=item;
_1513.uuid=pion.codecs.config_store.getValue(item,"@id");
dijit.byId("codec_config_accordion").addChild(_1513);
return _1513;
};
pion.codecs.createNewPaneFromStore=function(id,_1515){
pion.codecs.config_store.fetch({query:{"@id":id},onItem:function(item){
var _1517=pion.codecs.createNewPaneFromItem(item);
if(_1515){
pion.codecs._adjustAccordionSize();
dijit.byId("codec_config_accordion").selectChild(_1517);
}
},onError:pion.handleFetchError});
};
function onComplete(items,_1519){
var _151a=dijit.byId("codec_config_accordion");
for(var i=0;i<items.length;++i){
pion.codecs.createNewPaneFromItem(items[i]);
}
var _151c=_151a.getChildren()[0];
_151a.selectChild(_151c);
};
if(file_protocol){
dijit.byId("codec_config_accordion").removeChild(selected_codec_pane);
}else{
codec_config_store.fetch({onComplete:onComplete,onError:pion.handleFetchError});
}
dojo.connect(dojo.byId("add_new_codec_button"),"click",addNewCodec);
};
function addNewCodec(){
var _151d=new plugins.codecs.CodecInitDialog({title:"Add New Codec"});
setTimeout(function(){
dojo.query("input",_151d.domNode)[0].select();
},500);
_151d.show();
_151d.execute=function(_151e){
console.debug(_151e);
var _151f="<PionConfig><Codec>";
for(var tag in _151e){
console.debug("dialogFields[",tag,"] = ",_151e[tag]);
_151f+=pion.makeXmlLeafElement(tag,_151e[tag]);
}
if(plugins.codecs[_151e.Plugin]&&plugins.codecs[_151e.Plugin].custom_post_data){
_151f+=plugins.codecs[_151e.Plugin].custom_post_data;
}
_151f+="</Codec></PionConfig>";
console.debug("post_data: ",_151f);
dojo.rawXhrPost({url:"/config/codecs",contentType:"text/xml",handleAs:"xml",postData:_151f,load:function(_1521){
var node=_1521.getElementsByTagName("Codec")[0];
var id=node.getAttribute("id");
console.debug("id (from server): ",id);
pion.codecs.createNewPaneFromStore(id,true);
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_151f})});
};
};
pion.codecs._adjustAccordionSize=function(){
var _1524=dijit.byId("codec_config_accordion");
var _1525=_1524.getChildren().length;
console.debug("num_codecs = "+_1525);
var _1526=selected_codec_pane.getHeight();
var _1527=0;
if(_1525>0){
var _1528=_1524.getChildren()[0];
_1527=_1528.getTitleHeight();
}
var _1529=_1526+_1525*_1527;
_1524.resize({h:_1529});
pion.codecs.height=_1529+160;
dijit.byId("main_stack_container").resize({h:pion.codecs.height});
};
function replaceCodecAccordionPane(_152a){
var _152b=pion.codecs.config_store.getValue(_152a.config_item,"Plugin");
var _152c="plugins.codecs."+_152b+"Pane";
var _152d=dojo.getObject(_152c);
if(_152d){
console.debug("found class ",_152c);
var _152e=new _152d({"class":"codec_pane",title:_152a.title});
}else{
console.debug("class ",_152c," not found; using plugins.codecs.CodecPane instead.");
var _152e=new plugins.codecs.CodecPane({"class":"codec_pane",title:_152a.title});
}
_152e.uuid=_152a.uuid;
_152e.config_item=_152a.config_item;
_152e.initialized=true;
var _152f=dijit.byId("codec_config_accordion");
var idx=_152f.getIndexOfChild(_152a);
_152f.addChild(_152e,idx);
_152f.selectChild(_152e);
_152f.removeChild(_152a);
};
function updateCodecPane(pane){
console.debug("Fetching item ",pane.uuid);
var store=pion.codecs.config_store;
store.fetch({query:{"@id":pane.uuid},onItem:function(item){
console.debug("item: ",item);
pane.populateFromConfigItem(item);
},onError:pion.handleFetchError});
};
function codecPaneSelected(pane){
console.debug("Selected "+pane.title);
if(pane==selected_codec_pane){
return;
}
if(selected_codec_pane&&dojo.hasClass(selected_codec_pane.domNode,"unsaved_changes")){
var _1535=new dijit.Dialog({title:"Warning: unsaved changes"});
_1535.attr("content","Please save or cancel unsaved changes before selecting another Codec.");
_1535.show();
setTimeout("dijit.byId('codec_config_accordion').selectChild(selected_codec_pane)",500);
return;
}
if(!pane.initialized){
replaceCodecAccordionPane(pane);
}else{
selected_codec_pane=pane;
updateCodecPane(pane);
var _1536=dijit.byId("codec_config_accordion").duration;
setTimeout(function(){
dojo.style(pane.containerNode,"overflow","hidden");
pion.codecs._adjustAccordionSize();
},_1536+50);
}
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
dojo.declare("plugins.reactors.LogOutputReactorInitDialog",[plugins.reactors.ReactorInitDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Log File Output Reactor Initialization</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<table>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Name:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Comments:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Codec:</label></td>\r\n\t\t\t\t<td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"Codec\" store=\"pion.codecs.config_store\" searchAttr=\"Name\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Filename:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Filename\"/></td>\r\n\t\t\t</tr>\r\n\t\t</table>\r\n\t</div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick: tryConfig\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.plugin="LogOutputReactor";
this.inherited("postCreate",arguments);
}});
dojo.declare("plugins.reactors.LogOutputReactorDialog",[plugins.reactors.ReactorDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Log Output Reactor Configuration</span>\r\n\t\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\">\r\n\t\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<!--start div to set padding for top half of dialog-->\r\n\t\t<div class=\"reactor_dialog_top\">\r\n\r\n\t\t\t<!--start reactor header info-->\r\n\t\t\t<div class=\"reactor_name\">\r\n\t\t\t\t<img src=\"/plugins/reactors/storage/LogOutputReactor/dialog-icon.png\" width=\"17\" height=\"17\" border=\"0\" />\r\n\t\t\t\t&nbsp; Log Output Reactor\r\n\t\t\t</div>\r\n\t\t\t<div class=\"reactor_cat\">\r\n\t\t\t\t<strong>Name:</strong> LogOutputReactor\r\n\t\t\t\t&nbsp;&nbsp;&nbsp;\r\n\t\t\t\t<strong>Category:</strong> Storage\r\n\t\t\t</div>\r\n\r\n\t\t\t<div style=\"clear:both;\"></div>\r\n\r\n\t\t\t<p>Write real-time data out to a structured file.</p>\r\n\t\t\t<!--end reactor header info-->\r\n\r\n\t\t\t<!--start reactor settings-->\r\n\t\t\t<table\r\n\t\t\t\t><tr\r\n\t\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" class=\"id_text_box\" disabled=\"true\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Codec:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"Codec\" store=\"pion.codecs.config_store\" searchAttr=\"Name\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Filename:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Filename\"/></td\r\n\t\t\t\t></tr\r\n\t\t\t></table>\r\n\t\t\t<!--end reactor settings-->\r\n\r\n\t\t</div>\r\n\t\t<!--end div to set padding for top half of dialog-->\r\n\r\n\t\t<!--start div to set padding for bottom half of dialog-->\r\n\t\t<div class=\"reactor_dialog_bottom\">\r\n\r\n\t\t\t<!--start connections-->\r\n\t\t\t<div class=\"s_reactor_grid_blocks\">\r\n\t\t\t\t<h2>Connections</h2>\r\n\t\t\t\t<h3>Input Connections</h3>\r\n\t\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"reactor_inputs_grid_node\" style=\"width: 618px\"></div>\r\n\t\t\t\t<h3>Output Connections</h3>\r\n\t\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"reactor_outputs_grid_node\" style=\"width: 618px\"></div>\r\n\t\t\t</div>\r\n\t\t\t<!--end connections-->\r\n\r\n\t\t\t<!--start buttons-->\r\n\t\t\t<div class=\"save_cancel_delete\">\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"delete\">Delete Reactor</button>\r\n\t\t\t</div>\r\n\t\t\t<!--end buttons--> \r\n\r\n\t\t</div>\r\n\t\t<!--end div to set padding for bottom half of dialog-->\r\n\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true});
}
if(!dojo._hasResource["pion.terms"]){
dojo._hasResource["pion.terms"]=true;
dojo.provide("pion.terms");
pion.terms.store=new dojox.data.XmlStore({url:"/config/terms",rootItem:"Term",attributeMap:{"Term.id":"@id"}});
pion.terms.store.fetchItemByIdentity=function(_1537){
pion.terms.store.fetch({query:{"@id":_1537.identity},onItem:_1537.onItem,onError:pion.handleFetchError});
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
store.fetch({onItem:function(item,_153b){
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
if(!dojo._hasResource["plugins.reactors.FilterReactor"]){
dojo._hasResource["plugins.reactors.FilterReactor"]=true;
dojo.provide("plugins.reactors.FilterReactor");
dojo.declare("plugins.reactors.FilterReactor",[plugins.reactors.Reactor],{postCreate:function(){
this.config.Plugin="FilterReactor";
this.inherited("postCreate",arguments);
this._initOptions(this.config,plugins.reactors.FilterReactor.option_defaults);
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
var _1544=store.getValues(item,"Comparison");
for(var i=0;i<_1544.length;++i){
var _1546={ID:_this.comparison_store.next_id++,Term:store.getValue(_1544[i],"Term"),Type:store.getValue(_1544[i],"Type"),MatchAllValues:plugins.reactors.FilterReactor.getBool(store,_1544[i],"MatchAllValues")};
if(store.hasAttribute(_1544[i],"Value")){
_1546.Value=store.getValue(_1544[i],"Value");
}
_this.comparison_store.newItem(_1546);
}
},onComplete:function(){
_this.updateNamedCustomPutData("custom_put_data_from_config");
_this.onDonePopulatingComparisonStore();
},onError:pion.handleFetchError});
},_updateCustomData:function(){
this.custom_put_data_from_config=this.custom_put_data_from_comparison_store;
},_insertCustomData:function(){
this.put_data+=this.custom_put_data_from_config;
},updateNamedCustomPutData:function(_1547){
var _1548="";
var _this=this;
var store=this.comparison_store;
store.fetch({onItem:function(item){
_1548+="<Comparison>";
_1548+="<Term>"+store.getValue(item,"Term")+"</Term>";
_1548+="<Type>"+store.getValue(item,"Type")+"</Type>";
if(store.hasAttribute(item,"Value")){
_1548+=pion.makeXmlLeafElement("Value",store.getValue(item,"Value"));
}
_1548+="<MatchAllValues>"+store.getValue(item,"MatchAllValues")+"</MatchAllValues>";
_1548+="</Comparison>";
},onComplete:function(){
_this[_1547]=_1548;
},onError:pion.handleFetchError});
}});
plugins.reactors.FilterReactor.label="Filter Reactor";
dojo.declare("plugins.reactors.FilterReactorDialog",[plugins.reactors.ReactorDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Filter Reactor Configuration</span>\r\n\t\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\">\r\n\t\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<!--start div to set padding for top half of dialog-->\r\n\t\t<div class=\"reactor_dialog_top\">\r\n\r\n\t\t\t<!--start reactor header info-->\r\n\t\t\t<div class=\"reactor_name\">\r\n\t\t\t\t<img src=\"/plugins/reactors/processing/FilterReactor/dialog-icon.png\" width=\"17\" height=\"17\" border=\"0\" />\r\n\t\t\t\t&nbsp; Filter Reactor\r\n\t\t\t</div>\r\n\t\t\t<div class=\"reactor_cat\">\r\n\t\t\t\t<strong>Name:</strong> FilterReactor\r\n\t\t\t\t&nbsp;&nbsp;&nbsp;\r\n\t\t\t\t<strong>Category:</strong> Processing\r\n\t\t\t</div>\r\n\r\n\t\t\t<div style=\"clear:both;\"></div>\r\n\r\n\t\t\t<p>Include or exclude events based on user-defined criteria.</p>\r\n\t\t\t<!--end reactor header info-->\r\n\r\n\t\t\t<!--start reactor settings-->\r\n\t\t\t<table cellpadding=\"0\" cellspacing=\"5\" border=\"0\"\r\n\t\t\t\t><tr\r\n\t\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" class=\"id_text_box\" disabled=\"true\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t\t></tr\r\n\t\t\t></table>\r\n\t\t\t<!--end reactor settings-->\r\n\r\n\t\t</div>\r\n\t\t<!--end div to set padding for top half of dialog-->\r\n\r\n\t\t<!--start div to set padding for bottom half of dialog-->\r\n\t\t<div class=\"reactor_dialog_bottom\">\r\n\r\n\t\t\t<!--start comparisons-->\r\n\t\t\t<div class=\"p_reactor_grid_blocks\">\r\n\t\t\t\t<h2>Comparisons</h2>\r\n\t\t\t\t<input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"MatchAllComparisons\"/>\r\n\t\t\t\t<label>Match All Comparisons</label>\r\n\t\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"comparison_grid_node\" style=\"width: 618px\"></div>\r\n\t\t\t\t<button dojoAttachPoint=\"add_new_comparison_button\" dojoType=dijit.form.Button dojoAttachEvent=\"onClick:_handleAddNewComparison\" class=\"add_new_row\">ADD NEW COMPARISON</button>\r\n\t\t\t</div>\r\n\t\t\t<!--end comparisons-->\r\n\r\n\t\t\t<br />\r\n\r\n\t\t\t<!--start connections-->\r\n\t\t\t<div class=\"p_reactor_grid_blocks\">\r\n\t\t\t\t<h2>Connections</h2>\r\n\t\t\t\t<h3>Input Connections</h3>\r\n\t\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"reactor_inputs_grid_node\" style=\"width: 618px\"></div>\r\n\t\t\t\t<h3>Output Connections</h3>\r\n\t\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"reactor_outputs_grid_node\" style=\"width: 618px\"></div>\r\n\t\t\t</div>\r\n\t\t\t<!--end connections-->\r\n\r\n\t\t\t<!--start buttons-->\r\n\t\t\t<div class=\"save_cancel_delete\">\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"delete\">Delete Reactor</button>\r\n\t\t\t</div>\r\n\t\t\t<!--end buttons-->\r\n\r\n\t\t</div>\r\n\t\t<!--end div to set padding for bottom half of dialog-->\r\n\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
var _this=this;
var h=dojo.connect(this.reactor,"onDonePopulatingComparisonStore",function(){
_this._updateCustomPutDataFromComparisonStore();
_this.connect(_this.reactor.comparison_store,"onSet","_updateCustomPutDataFromComparisonStore");
_this.connect(_this.reactor.comparison_store,"onDelete","_updateCustomPutDataFromComparisonStore");
dojo.disconnect(h);
});
this.reactor.reloadComparisonStore();
this.comparison_grid_layout=[{defaultCell:{width:8,editable:true,type:dojox.grid.cells._Widget,styles:"text-align: right;"},rows:[{field:"Term",name:"Term",width:20,type:pion.widgets.TermTextCell},{field:"Type",name:"Comparison",width:15,widgetClass:"pion.widgets.SimpleSelect",widgetProps:{store:pion.reactors.comparison_type_store,query:{category:"generic"}}},{field:"Value",name:"Value",width:"auto",formatter:pion.xmlCellFormatter},{field:"MatchAllValues",name:"Match All",width:3,type:dojox.grid.cells.Bool},{name:"Delete",styles:"align: center;",width:3,editable:false,formatter:pion.makeDeleteButton}]}];
this.comparison_grid=new dojox.grid.DataGrid({store:this.reactor.comparison_store,structure:this.comparison_grid_layout,singleClickEdit:true,autoHeight:true},document.createElement("div"));
this.comparison_grid._prev_term_type_category=this.comparison_grid.structure[0].rows[1].widgetProps.query.category;
this.comparison_grid_node.appendChild(this.comparison_grid.domNode);
this.comparison_grid.startup();
this.comparison_grid.connect(this.comparison_grid,"onCellClick",_this._handleCellClick);
this.connect(this,"onCancel",function(){
this.destroyRecursive(false);
});
this.connect(this,"execute",function(){
this.destroyRecursive(false);
});
},uninitialize:function(){
this.inherited("uninitialize",arguments);
if(this.comparison_grid.domNode){
this.comparison_grid.destroy();
}
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
if(pion.terms.categories_by_id[term]!=this._prev_term_type_category){
this._prev_term_type_category=pion.terms.categories_by_id[term];
if(e.cell.widget){
e.cell.widget.setQuery({category:pion.terms.categories_by_id[term]});
}else{
this.structure[0].rows[1].widgetProps.query.category=pion.terms.categories_by_id[term];
}
}
}else{
if(e.cellIndex==4){
console.debug("Removing row ",e.rowIndex);
this.store.deleteItem(this.getItem(e.rowIndex));
}
}
},_handleAddNewComparison:function(){
this.reactor.comparison_store.newItem({ID:this.reactor.comparison_store.next_id++,MatchAllValues:false});
}});
plugins.reactors.FilterReactor.option_defaults={MatchAllComparisons:false};
plugins.reactors.FilterReactor.grid_option_defaults={MatchAllValues:false};
plugins.reactors.FilterReactor.getBool=function(store,item,_1553){
if(store.hasAttribute(item,_1553)){
return store.getValue(item,_1553).toString()=="true";
}else{
return plugins.reactors.FilterReactor.grid_option_defaults[_1553];
}
};
}
if(!dojo._hasResource["plugins.reactors.TransformReactor"]){
dojo._hasResource["plugins.reactors.TransformReactor"]=true;
dojo.provide("plugins.reactors.TransformReactor");
dojo.declare("plugins.reactors.TransformReactor",[plugins.reactors.Reactor],{postCreate:function(){
this.config.Plugin="TransformReactor";
this.inherited("postCreate",arguments);
this._initOptions(this.config,plugins.reactors.TransformReactor.option_defaults);
this.special_config_elements.push("Transformation");
this.transformation_store=new dojo.data.ItemFileWriteStore({data:{identifier:"ID",items:[]}});
this.transformation_store.next_id=0;
this.prepareToHandleLoadNotification();
this._populateTransformationStore();
},prepareToHandleLoadNotification:function(){
this.transformation_store_is_ready=false;
var h=this.connect(this,"onDonePopulatingTransformationStore",function(){
this.disconnect(h);
this._updatePutDataIfGridStoresReady();
});
},_updatePutDataIfGridStoresReady:function(){
if(this.transformation_store_is_ready){
this.updateNamedCustomPutData("custom_put_data_from_config");
this.transformation_store_is_ready=false;
this.onDonePopulatingGridStores();
}
},onDonePopulatingGridStores:function(){
},reloadGridStores:function(){
var _this=this;
this.transformation_store.fetch({onItem:function(item){
_this.transformation_store.deleteItem(item);
},onComplete:function(){
_this._populateTransformationStore();
},onError:pion.handleFetchError});
this.prepareToHandleLoadNotification();
},_populateTransformationStore:function(){
var _this=this;
var store=pion.reactors.config_store;
store.fetch({query:{"@id":this.config["@id"]},onItem:function(item){
dojo.forEach(store.getValues(item,"Transformation"),function(_155a){
var _155b={ID:_this.transformation_store.next_id++,Term:store.getValue(_155a,"Term"),Type:store.getValue(_155a,"Type")};
if(_155b.Type=="Lookup"){
_155b.Value="<button dojoType=dijit.form.Button class=\"edit\">edit Lookup</button>";
_155b.LookupTerm=store.getValue(_155a,"LookupTerm");
pion.initOptionalValue(store,_155a,_155b,"Match");
pion.initOptionalValue(store,_155a,_155b,"Format");
pion.initOptionalValue(store,_155a,_155b,"DefaultAction","leave-undefined");
pion.initOptionalValue(store,_155a,_155b,"DefaultValue");
_155b.Lookup=dojo.map(store.getValues(_155a,"Lookup"),function(_155c){
var _155d={Key:store.getValue(_155c,"@key").toString(),Value:store.getValue(_155c,"text()").toString()};
return _155d;
});
}else{
if(_155b.Type=="Rules"){
_155b.Value="<button dojoType=dijit.form.Button class=\"edit\">edit Rules</button>";
_155b.StopOnFirstMatch=plugins.reactors.TransformReactor.getBool(store,_155a,"StopOnFirstMatch");
_155b.Rule=dojo.map(store.getValues(_155a,"Rule"),function(rule){
var _155f={Term:store.getValue(rule,"Term").toString(),Type:store.getValue(rule,"Type").toString(),SetValue:store.getValue(rule,"SetValue").toString()};
if(store.hasAttribute(rule,"Value")){
_155f.Value=store.getValue(rule,"Value").toString();
}
return _155f;
});
}else{
if(_155b.Type=="Regex"){
_155b.Value="<button dojoType=dijit.form.Button class=\"edit\">edit Regex</button>";
_155b.SourceTerm=store.getValue(_155a,"SourceTerm");
_155b.Regex=dojo.map(store.getValues(_155a,"Regex"),function(regex){
var _1561={Format:store.getValue(regex,"text()").toString(),Exp:store.getValue(regex,"@exp").toString()};
return _1561;
});
}else{
_155b.Value=store.getValue(_155a,"Value");
}
}
}
_this.transformation_store.newItem(_155b);
});
},onComplete:function(){
_this.transformation_store_is_ready=true;
_this.onDonePopulatingTransformationStore();
},onError:pion.handleFetchError});
},onDonePopulatingTransformationStore:function(){
},_updateCustomData:function(){
this.custom_put_data_from_config=this.custom_put_data_from_grid_stores;
},_insertCustomData:function(){
this.put_data+=this.custom_put_data_from_config;
},updateNamedCustomPutData:function(_1562){
var _1563="";
var _this=this;
var _1565=this.transformation_store;
_1565.fetch({onItem:function(item){
_1563+="<Transformation>";
_1563+="<Term>"+_1565.getValue(item,"Term")+"</Term>";
_1563+="<Type>"+_1565.getValue(item,"Type")+"</Type>";
var type=_1565.getValue(item,"Type");
if(type=="Lookup"){
_1563+=pion.makeXmlLeafElementFromItem(_1565,item,"LookupTerm");
_1563+=pion.makeXmlLeafElementFromItem(_1565,item,"Match");
_1563+=pion.makeXmlLeafElementFromItem(_1565,item,"Format");
_1563+=pion.makeXmlLeafElementFromItem(_1565,item,"DefaultAction");
_1563+=pion.makeXmlLeafElementFromItem(_1565,item,"DefaultValue");
dojo.forEach(_1565.getValues(item,"Lookup"),function(_1568){
_1563+="<Lookup key=\""+pion.escapeXml(_1568.Key)+"\">"+pion.escapeXml(_1568.Value)+"</Lookup>";
});
}else{
if(type=="Rules"){
_1563+=pion.makeXmlLeafElement("StopOnFirstMatch",plugins.reactors.TransformReactor.getBool(_1565,item,"StopOnFirstMatch").toString());
dojo.forEach(_1565.getValues(item,"Rule"),function(rule){
_1563+="<Rule>";
_1563+=pion.makeXmlLeafElement("Term",rule.Term);
_1563+=pion.makeXmlLeafElement("Type",rule.Type);
if("Value" in rule){
_1563+=pion.makeXmlLeafElement("Value",rule.Value);
}
_1563+=pion.makeXmlLeafElement("SetValue",rule.SetValue);
_1563+="</Rule>";
});
}else{
if(type=="Regex"){
_1563+=pion.makeXmlLeafElement("SourceTerm",_1565.getValue(item,"SourceTerm"));
dojo.forEach(_1565.getValues(item,"Regex"),function(regex){
_1563+="<Regex exp=\""+pion.escapeXml(regex.Exp)+"\">"+pion.escapeXml(regex.Format)+"</Regex>";
});
}else{
_1563+=pion.makeXmlLeafElement("Value",_1565.getValue(item,"Value"));
}
}
}
_1563+="</Transformation>";
},onComplete:function(){
_this[_1562]=_1563;
},onError:pion.handleFetchError});
}});
plugins.reactors.TransformReactor.label="Transformation Reactor";
dojo.declare("plugins.reactors.TransformReactorDialog",[plugins.reactors.ReactorDialog],{templateString:"<div class=\"dijitDialog reactor_dialog transform_reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Transform Reactor Configuration</span>\r\n\t\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\">\r\n\t\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t\t</span>\r\n\t\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<!--start div to set padding for top half of dialog-->\r\n\t\t <div class=\"reactor_dialog_top\">\r\n\r\n\t\t\t<!--start reactor header info-->\r\n\t\t\t<div class=\"reactor_name\">\r\n\t\t\t\t<img src=\"/plugins/reactors/processing/TransformReactor/dialog-icon.png\" width=\"17\" height=\"17\" border=\"0\" />\r\n\t\t\t\t&nbsp; Transform Reactor\r\n\t\t\t</div>\r\n\t\t\t<div class=\"reactor_cat\">\r\n\t\t\t\t<strong>Name:</strong> TransformReactor\r\n\t\t\t\t&nbsp;&nbsp;&nbsp;\r\n\t\t\t\t<strong>Category:</strong> Processing\r\n\t\t\t</div>\r\n\r\n\t\t\t<div style=\"clear:both;\"></div>\r\n\r\n\t\t\t<p>Selectively change data content, structure, format and values based on user-defined criteria.</p>\r\n\t\t\t<!--end reactor header info-->\r\n\r\n\t\t\t<!--start reactor settings-->\r\n\t\t\t<table\r\n\t\t\t\t><tr\r\n\t\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" class=\"id_text_box\" disabled=\"true\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Outgoing&nbsp;Event&nbsp;Type:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"OutgoingEvent\" dojoAttachPoint=\"outgoing_event_select\"\r\n\t\t\t\t\t\t\tstore=\"plugins.reactors.TransformReactor.outgoing_event_type_store\" searchAttr=\"id\" /></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Copy&nbsp;From&nbsp;Original</label></td\r\n\t\t\t\t\t><td\r\n\t\t\t\t\t\t><input type=\"radio\" name=\"CopyOriginal\" value=\"if-not-defined\" dojoType=\"dijit.form.RadioButton\" /><label>terms with no transformation defined </label\r\n\t\t\t\t\t\t><input type=\"radio\" name=\"CopyOriginal\" value=\"none\" dojoType=\"dijit.form.RadioButton\" /><label>no terms</label\r\n\t\t\t\t\t></td\r\n\t\t\t\t ></tr\r\n\t\t\t></table>\r\n\t\t\t<!--end reactor settings-->\r\n\r\n\t\t</div>\r\n\t\t<!--end div to set padding for top half of dialog-->\r\n\r\n\t\t<!--start div to set padding for bottom half of dialog-->\r\n\t\t<div class=\"reactor_dialog_bottom\">\r\n\r\n\t\t\t<!--start transformations-->\r\n\t\t\t<div class=\"p_reactor_grid_blocks\">\r\n\t\t\t\t<h2>Transformations</h2>\r\n\t\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"transformation_grid_node\" style=\"width: 618px\"></div>\r\n\t\t\t\t<button dojoAttachPoint=\"add_new_transformation_button\" dojoType=dijit.form.Button dojoAttachEvent=\"onClick:_handleAddNewTransformation\" class=\"add_new_row\">ADD NEW TRANSFORMATION</button>\r\n\t\t\t</div>\r\n\t\t\t<!--end transformations-->\r\n\r\n\t\t\t<br />\r\n\r\n\t\t\t<!--start connections--> \r\n\t\t\t<div class=\"p_reactor_grid_blocks\">\r\n\t\t\t\t<h2>Connections</h2>\r\n\t\t\t\t<h3>Input Connections</h3>\r\n\t\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"reactor_inputs_grid_node\" style=\"width: 618px\"></div>\r\n\t\t\t\t<h3>Output Connections</h3>\r\n\t\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"reactor_outputs_grid_node\" style=\"width: 618px\"></div>\r\n\t\t\t</div>\r\n\t\t\t<!--end connections-->\r\n\r\n\t\t\t<!--start buttons-->\r\n\t\t\t<div class=\"save_cancel_delete\">\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"delete\">Delete Reactor</button>\r\n\t\t\t</div>\r\n\t\t\t<!--end buttons--> \r\n\r\n\t\t</div>\r\n\t\t<!--end div to set padding for bottom half of dialog-->\r\n\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
plugins.reactors.TransformReactor.outgoing_event_type_store=new dojo.data.ItemFileWriteStore({data:{identifier:"id",items:[{id:"Same as input event"}]}});
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
this.attr("value",{CopyOriginal:"if-not-defined",OutgoingEvent:"Same as input event"});
this.reactor._initOptions(this.reactor.config,plugins.reactors.TransformReactor.option_defaults);
var _this=this;
pion.terms.store.fetch({query:{Type:"object"},onItem:function(item){
plugins.reactors.TransformReactor.outgoing_event_type_store.newItem({id:pion.terms.store.getIdentity(item)});
},onComplete:function(){
_this.outgoing_event_select.makeOptionList();
if(_this.reactor.config.OutgoingEvent){
_this.attr("value",{OutgoingEvent:_this.reactor.config.OutgoingEvent});
}
}});
var h=dojo.connect(this.reactor,"onDonePopulatingGridStores",function(){
_this._updateCustomPutDataFromGridStores();
_this.connect(_this.reactor.transformation_store,"onSet","_updateCustomPutDataFromGridStores");
_this.connect(_this.reactor.transformation_store,"onDelete","_updateCustomPutDataFromGridStores");
dojo.disconnect(h);
});
this.reactor.reloadGridStores();
this.transformation_grid_layout=[{defaultCell:{width:8,editable:true,type:dojox.grid.cells._Widget,styles:"text-align: right;"},rows:[{field:"Term",name:"Term",width:18,type:pion.widgets.TermTextCell},{field:"Type",name:"Transformation Type",width:12,type:dojox.grid.cells.Select,options:["AssignValue","AssignTerm","Lookup","Rules","Regex"]},{field:"Value",name:"Value",width:"auto",formatter:pion.xmlCellFormatter2},{field:"Value",name:"Value",width:"auto",type:pion.widgets.TermTextCell},{name:"Delete",styles:"align: center;",width:3,editable:false,formatter:pion.makeDeleteButton}]}];
this.transformation_grid=new dojox.grid.DataGrid({store:this.reactor.transformation_store,structure:this.transformation_grid_layout,singleClickEdit:true,autoHeight:true},document.createElement("div"));
this.transformation_grid.term_column_index=0;
this.transformation_grid.value_text_column_index=2;
this.transformation_grid.value_term_column_index=3;
this.transformation_grid.layout.setColumnVisibility(this.transformation_grid.value_term_column_index,false);
this.transformation_grid_node.appendChild(this.transformation_grid.domNode);
this.transformation_grid.startup();
this.transformation_grid.connect(this.transformation_grid,"onCellClick",function(e){
if(e.cell.name=="Delete"){
this.store.deleteItem(this.getItem(e.rowIndex));
}else{
if(e.cell.field=="Value"){
var type=this.store.getValue(this.getItem(e.rowIndex),"Type").toString();
if(type=="Lookup"){
var _1570=new plugins.reactors.TransformReactor.LookupConfigurationDialog({reactor:_this.reactor,transformation_store:this.store,transformation_item:this.getItem(e.rowIndex)});
_1570.show();
_1570.save_button.onClick=function(){
return _1570.isValid();
};
}else{
if(type=="Rules"){
var _1570=new plugins.reactors.TransformReactor.RulesConfigurationDialog({reactor:_this.reactor,transformation_store:this.store,transformation_item:this.getItem(e.rowIndex)});
_1570.show();
_1570.save_button.onClick=function(){
return _1570.isValid();
};
}else{
if(type=="Regex"){
var _1570=new plugins.reactors.TransformReactor.RegexConfigurationDialog({reactor:_this.reactor,transformation_store:this.store,transformation_item:this.getItem(e.rowIndex)});
_1570.show();
_1570.save_button.onClick=function(){
return _1570.isValid();
};
}
}
}
}
}
});
this.transformation_grid.connect(this.transformation_grid,"onCellFocus",function(cell,_1572){
if(cell.field=="Type"){
var _this=this;
this.connect(cell.getEditNode(_1572),"change",function(){
_this.edit.apply();
});
}
});
this.transformation_grid.connect(this.transformation_grid,"onStartEdit",function(cell,_1575){
switch(cell.field){
case "Type":
this.pre_edit_type=this.store.getValue(this.getItem(_1575),"Type");
break;
default:
}
});
this.transformation_grid.connect(this.transformation_grid,"onApplyCellEdit",function(value,_1577,_1578){
switch(_1578){
case "Type":
if(value!=this.pre_edit_type){
var _1579=(value=="AssignTerm");
this.layout.setColumnVisibility(this.value_text_column_index,!_1579);
this.layout.setColumnVisibility(this.value_term_column_index,_1579);
var _157a=(value=="Lookup"||value=="Rules"||value=="Regex");
if(_157a){
this.store.setValue(this.getItem(_1577),"Value","<button dojoType=dijit.form.Button class=\"edit\">edit "+value+"</button>");
}else{
this.store.unsetAttribute(this.getItem(_1577),"Value");
}
}
break;
default:
}
});
var _grid=this.transformation_grid;
var h2=_grid.connect(_grid.layout.cells[_grid.term_column_index],"sizeWidget",function(){
this.connect(this.layout.cells[_grid.term_column_index].widget,"_close",function(value){
_grid.edit.apply();
});
this.disconnect(h2);
});
var h3=_grid.connect(_grid.layout.cells[_grid.value_term_column_index],"sizeWidget",function(){
this.connect(this.layout.cells[_grid.value_term_column_index].widget,"_close",function(value){
_grid.edit.apply();
});
this.disconnect(h3);
});
this.transformation_grid.canEdit=function(cell,_1581){
switch(cell.field){
case "Value":
var item=this.getItem(_1581);
var type=this.store.getValue(item,"Type").toString();
if(type=="AssignValue"){
if(this.layout.cells[this.value_text_column_index].hidden){
this.layout.setColumnVisibility(this.value_text_column_index,true);
this.layout.setColumnVisibility(this.value_term_column_index,false);
return false;
}else{
return true;
}
}else{
if(type=="AssignTerm"){
if(this.layout.cells[this.value_term_column_index].hidden){
this.layout.setColumnVisibility(this.value_text_column_index,false);
this.layout.setColumnVisibility(this.value_term_column_index,true);
return false;
}else{
return true;
}
}else{
return false;
}
}
default:
return true;
}
};
},_handleAddNewTransformation:function(){
this.reactor.transformation_store.newItem({ID:this.reactor.transformation_store.next_id++,MatchAllValues:false,Type:"AssignValue",InPlace:true});
},_updateCustomPutDataFromGridStores:function(){
this.reactor.updateNamedCustomPutData("custom_put_data_from_grid_stores");
},_insertCustomData:function(){
this.put_data+=this.reactor.custom_put_data_from_grid_stores;
}});
plugins.reactors.TransformReactor.option_defaults={};
plugins.reactors.TransformReactor.grid_option_defaults={StopOnFirstMatch:true,InPlace:false,MatchAllValues:false};
plugins.reactors.TransformReactor.getBool=function(store,item,_1586){
if(store.hasAttribute(item,_1586)){
return store.getValue(item,_1586).toString()=="true";
}else{
return plugins.reactors.TransformReactor.grid_option_defaults[_1586];
}
};
dojo.declare("plugins.reactors.TransformReactor.KeyValuePairImportDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog XML_import_dialog\" style=\"width: 600px\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">${title}</span>\r\n\t</div>\r\n\t<div style=\"padding: 10px\">\r\n\t\t${instructions}\r\n\t\t<pre>\r\n${example}\r\n\t\t</pre>\r\n\t</div>\r\n\t<div class=\"dijitDialogPaneContent\">\r\n\t\t<textarea dojoAttachPoint=\"XML_text_area\" style=\"width: 100%\" rows=\"8\" dojoAttachEvent=\"oninput: enableApply, onkeydown: enableApply\"></textarea>\r\n\t</div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" dojoAttachPoint=\"apply_button\" disabled=\"true\" type=\"submit\">Import</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: onCancel\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},enableApply:function(){
this.apply_button.attr("disabled",false);
},widgetsInTemplate:true});
dojo.declare("plugins.reactors.TransformReactor.LookupConfigurationDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog vocabulary_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Lookup Configuration</span>\r\n\t\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\">\r\n\t\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Lookup Term:</label></td\r\n\t\t\t\t><td><input dojoType=\"pion.widgets.TermTextBox\" name=\"LookupTerm\" style=\"width: 100%;\" /></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Regular expression:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Match\" style=\"width: 100%;\" dojoAttachEvent=\"onChange: _regexChanged\" /></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Format:</label></td\r\n\t\t\t\t><td><input dojoAttachPoint=\"format_text_box\" dojoType=\"dijit.form.TextBox\" name=\"Format\" style=\"width: 100%;\" disabled=\"true\" /></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Default</label></td\r\n\t\t\t\t><td\r\n\t\t\t\t\t><input type=\"radio\" name=\"DefaultAction\" value=\"leave-undefined\" dojoType=\"dijit.form.RadioButton\" dojoAttachEvent=\"onClick: _onDefaultActionChanged\" /><label>leave undefined </label\r\n\t\t\t\t\t><input type=\"radio\" name=\"DefaultAction\" value=\"src-term\" dojoType=\"dijit.form.RadioButton\" dojoAttachEvent=\"onClick: _onDefaultActionChanged\" /><label>use lookup term </label\r\n\t\t\t\t\t><input dojoAttachPoint=\"output_radio_button\" disabled=\"true\"\r\n\t\t\t\t\t\t\ttype=\"radio\" name=\"DefaultAction\" value=\"output\" dojoType=\"dijit.form.RadioButton\" dojoAttachEvent=\"onClick: _onDefaultActionChanged\" /><label>use regex replaced value </label\r\n\t\t\t\t\t><input type=\"radio\" name=\"DefaultAction\" value=\"fixedvalue\" dojoType=\"dijit.form.RadioButton\" dojoAttachEvent=\"onClick: _onDefaultActionChanged\" /><label>use fixed value:</label\r\n\t\t\t\t\t><input dojoAttachPoint=\"default_value\" dojoType=\"dijit.form.TextBox\" name=\"DefaultValue\" style=\"width: 200px; visibility: hidden\" disabled=\"true\" /\r\n\t\t\t\t></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t\t><div class=\"p_reactor_grid_blocks\">\r\n\t\t\t<h2>Key Value Pairs</h2>\r\n\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"lookup_grid_node\" style=\"width: 718px\"></div>\r\n\t\t\t<button dojoType=dijit.form.Button dojoAttachEvent=\"onClick: _handleAddNewLookup\" class=\"add_new_row\">ADD NEW PAIR</button>\r\n\t\t\t<button dojoType=dijit.form.Button class=\"import\" dojoAttachEvent=\"onClick: _onImportXmlKeyValuePairs\">\r\n\t\t\t\tImport XML</button>\r\n\t\t\t<button dojoType=dijit.form.Button class=\"export\" dojoAttachEvent=\"onClick: _onExportXmlKeyValuePairs\" dojoAttachPoint=\"export_xml_button\" disabled=\"true\">\r\n\t\t\t\tExport XML</button>\r\n\t\t\t<button dojoType=dijit.form.Button class=\"import\" dojoAttachEvent=\"onClick: _onImportCsvKeyValuePairs\">\r\n\t\t\t\tImport CSV</button>\r\n\t\t\t<button dojoType=dijit.form.Button class=\"export\" dojoAttachEvent=\"onClick: _onExportCsvKeyValuePairs\" dojoAttachPoint=\"export_csv_button\" disabled=\"true\">\r\n\t\t\t\tExport CSV</button>\r\n\t\t</div>\r\n\t\t<div class=\"save_cancel_delete\">\r\n\t\t\t<button dojoType=dijit.form.Button class=\"save\" dojoAttachPoint=\"save_button\" type=\"submit\">Save</button>\r\n\t\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: onCancel\">Cancel</button>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
if(!this.transformation_item.DefaultAction){
this.transformation_item.DefaultAction="leave-undefined";
}
if(this.transformation_item.DefaultAction=="fixedvalue"){
this.default_value.attr("disabled",false);
this.default_value.domNode.style.visibility="visible";
}
this.attr("value",this.transformation_item);
this.lookup_store=new dojo.data.ItemFileWriteStore({data:{identifier:"ID",items:[]}});
this.lookup_store.next_id=0;
this.connect(this.lookup_store,"onNew",function(){
this.export_xml_button.attr("disabled",false);
this.export_csv_button.attr("disabled",false);
});
this._populateLookupStore();
this.lookup_grid_layout=[{defaultCell:{width:8,editable:true,type:dojox.grid.cells._Widget,styles:"text-align: right;"},rows:[{field:"Key",name:"Key",width:14},{field:"Value",name:"Value",width:"auto",formatter:pion.xmlCellFormatter},{name:"Delete",styles:"align: center;",width:3,editable:false,formatter:pion.makeDeleteButton}]}];
this.lookup_grid=new dojox.grid.DataGrid({store:this.lookup_store,structure:this.lookup_grid_layout,singleClickEdit:true,autoHeight:true},document.createElement("div"));
this.lookup_grid_node.appendChild(this.lookup_grid.domNode);
this.lookup_grid.startup();
this.lookup_grid.connect(this.lookup_grid,"onCellClick",function(e){
if(e.cell.name=="Delete"){
this.store.deleteItem(this.getItem(e.rowIndex));
}
});
},execute:function(_1588){
var _1589=this.transformation_store;
var _158a=this.transformation_item;
var _158b=this.lookup_store;
var _158c=[];
for(var i=0;i<this.lookup_grid.rowCount;++i){
var item=this.lookup_grid.getItem(i);
var _158f={Key:_158b.getValue(item,"Key"),Value:_158b.getValue(item,"Value")};
_158c.push(_158f);
}
_1589.setValues(_158a,"Lookup",_158c);
for(var tag in _1588){
_1589.setValue(_158a,tag,_1588[tag]);
}
this.reactor.updateNamedCustomPutData("custom_put_data_from_grid_stores");
},_populateLookupStore:function(){
var _this=this;
dojo.forEach(this.transformation_store.getValues(this.transformation_item,"Lookup"),function(_1592){
_this.lookup_store.newItem(dojo.mixin(_1592,{ID:_this.lookup_store.next_id++}));
});
},_regexChanged:function(value){
if(value){
this.format_text_box.attr("disabled",false);
this.output_radio_button.attr("disabled",false);
}else{
this.format_text_box.attr("disabled",true);
this.format_text_box.attr("value","");
this.output_radio_button.attr("disabled",true);
this.attr("value",{DefaultAction:"leave-undefined"});
}
},_onDefaultActionChanged:function(e){
if(e.target.value=="fixedvalue"){
this.default_value.attr("disabled",false);
this.default_value.domNode.style.visibility="visible";
}else{
this.default_value.attr("disabled",true);
this.default_value.attr("value","");
this.default_value.domNode.style.visibility="hidden";
}
},_onImportXmlKeyValuePairs:function(e){
var _this=this;
var _1597=new plugins.reactors.TransformReactor.KeyValuePairImportDialog({title:"Key Value Pairs in XML Format to Import",instructions:"Enter key value pairs in the following format, using standard escape sequences:",example:"&lt;Lookup key=\"index-1\"&gt;NASDAQ&lt;/Lookup&gt\n...\n&lt;Lookup key=\"index-n\"&gt;S&amp;amp;P 500&lt;/Lookup&gt"});
_1597.show();
_1597.execute=function(_1598){
var _1599="<PionConfig>"+this.XML_text_area.value+"</PionConfig>";
var _159a=_1599.replace(/>\s*/g,">");
if(dojo.isIE){
var _159b=dojox.data.dom.createDocument();
_159b.loadXML(_159a);
}else{
var _159c=new DOMParser();
var _159b=_159c.parseFromString(_159a,"text/xml");
}
dojo.forEach(_159b.getElementsByTagName("Lookup"),function(_159d){
var _159e=_159d.getAttribute("key");
var _159f=dojo.isIE?_159d.childNodes[0].nodeValue:_159d.textContent;
_this.lookup_store.newItem({ID:_this.lookup_store.next_id++,Key:_159e,Value:_159f});
});
};
},_onExportXmlKeyValuePairs:function(){
var _15a0=this.lookup_store;
var _15a1="";
for(var i=0;i<this.lookup_grid.rowCount;++i){
var item=this.lookup_grid.getItem(i);
var key=_15a0.getValue(item,"Key");
var value=_15a0.getValue(item,"Value");
var _15a6="<Lookup key=\""+pion.escapeXml(key)+"\">"+pion.escapeXml(value)+"</Lookup>";
_15a1+=pion.escapeXml(_15a6)+"<br />";
}
var _15a7=new dijit.Dialog({title:"Exported Key Value Pairs in XML Format",style:"width: 600px"});
_15a7.attr("content",_15a1);
_15a7.show();
},_onImportCsvKeyValuePairs:function(e){
var _this=this;
var _15aa=new plugins.reactors.TransformReactor.KeyValuePairImportDialog({title:"Key Value Pairs in CSV Format to Import",instructions:"Enter key value pairs in CSV format.  Example:",example:"A,yes & no\nB,\"X, Y and Z\"\nC,\"the one with a \"\"D\"\" in it\"\nD,\" quoting optional here \"\n..."});
_15aa.show();
_15aa.execute=function(_15ab){
var lines=this.XML_text_area.value.split("\n");
dojo.forEach(lines,function(line){
if(results=line.match(/^"(.*)","(.*)"$/)){
var _15ae=results[1].replace(/""/g,"\"");
var _15af=results[2].replace(/""/g,"\"");
}else{
if(results=line.match(/^([^,"]*),"(.*)"$/)){
var _15ae=results[1];
var _15af=results[2].replace(/""/g,"\"");
}else{
if(results=line.match(/^"(.*)",([^,"]*)$/)){
var _15ae=results[1].replace(/""/g,"\"");
var _15af=results[2];
}else{
if(results=line.match(/^([^,"]*),([^,"]*)$/)){
var _15ae=results[1];
var _15af=results[2];
}else{
return;
}
}
}
}
_this.lookup_store.newItem({ID:_this.lookup_store.next_id++,Key:_15ae,Value:_15af});
});
};
},_onExportCsvKeyValuePairs:function(){
var _15b0=this.lookup_store;
var _15b1="";
for(var i=0;i<this.lookup_grid.rowCount;++i){
var item=this.lookup_grid.getItem(i);
var key=_15b0.getValue(item,"Key").toString();
var value=_15b0.getValue(item,"Value").toString();
var _15b6="\""+key.replace(/"/g,"\"\"")+"\",\""+value.replace(/"/g,"\"\"")+"\"";
_15b1+=pion.escapeXml(_15b6)+"<br />";
}
var _15b7=new dijit.Dialog({title:"Exported Key Value Pairs in CSV Format",style:"width: 600px"});
_15b7.attr("content",_15b1);
_15b7.show();
},_handleAddNewLookup:function(){
this.lookup_store.newItem({ID:this.lookup_store.next_id++});
}});
dojo.declare("plugins.reactors.TransformReactor.RulesConfigurationDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog vocabulary_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Rules Configuration</span>\r\n\t\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\">\r\n\t\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"StopOnFirstMatch\"/>\r\n\t\t<label>Stop after first matching rule</label>\r\n\t\t<div class=\"p_reactor_grid_blocks\">\r\n\t\t\t<h2>Rules</h2>\r\n\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"rule_grid_node\" style=\"width: 718px\"></div>\r\n\t\t\t<button dojoType=dijit.form.Button dojoAttachEvent=\"onClick: _handleAddNewRule\" class=\"add_new_row\">ADD NEW RULE</button>\r\n\t\t</div>\r\n\t\t<div class=\"save_cancel_delete\">\r\n\t\t\t<button dojoType=dijit.form.Button class=\"save\" dojoAttachPoint=\"save_button\" type=\"submit\">Save</button>\r\n\t\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: onCancel\">Cancel</button>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
if(plugins.reactors.TransformReactor.getBool(this.transformation_store,this.transformation_item,"StopOnFirstMatch")){
this.attr("value",{options:["StopOnFirstMatch"]});
}
this.rule_store=new dojo.data.ItemFileWriteStore({data:{identifier:"ID",items:[]}});
this.rule_store.next_id=0;
this._populateRuleStore();
this.rule_grid_layout=[{defaultCell:{width:8,editable:true,type:dojox.grid.cells._Widget,styles:"text-align: right;"},rows:[{field:"Term",name:"Term",width:14,type:pion.widgets.TermTextCell},{field:"Type",name:"Comparison",width:10,widgetClass:"pion.widgets.SimpleSelect",widgetProps:{store:pion.reactors.comparison_type_store,query:{category:"generic"}}},{field:"Value",name:"Value",width:"auto",formatter:pion.xmlCellFormatter},{field:"SetValue",name:"Set Value",width:"auto",formatter:pion.xmlCellFormatter},{name:"Insert Above",styles:"align: center;",width:3,editable:false,value:"<button dojoType=dijit.form.Button class=\"insert_row\"><img src=\"images/arrowUp.png\" alt=\"INSERT ABOVE\" border=\"0\" /></button>"},{name:"Delete",styles:"align: center;",width:3,editable:false,formatter:pion.makeDeleteButton}]}];
this.rule_grid=new dojox.grid.DataGrid({store:this.rule_store,structure:this.rule_grid_layout,singleClickEdit:true,autoHeight:true},document.createElement("div"));
this.rule_grid._prev_term_type_category=this.rule_grid.structure[0].rows[1].widgetProps.query.category;
this.rule_grid.term_column_index=0;
this.rule_grid_node.appendChild(this.rule_grid.domNode);
this.rule_grid.startup();
this.rule_grid.connect(this.rule_grid,"onCellClick",function(e){
if(e.cell.name=="Delete"){
this.store.deleteItem(this.getItem(e.rowIndex));
}else{
if(e.cell.name=="Insert Above"){
var _15b9=[];
var _15ba=[];
for(var i=e.rowIndex;i<this.rowCount;++i){
var item=this.getItem(i);
var _15bd={Term:this.store.getValue(item,"Term"),Type:this.store.getValue(item,"Type"),SetValue:this.store.getValue(item,"SetValue")};
if(this.store.hasAttribute(item,"Value")){
_15bd.Value=this.store.getValue(item,"Value");
}
_15b9.push(_15bd);
_15ba.push(item);
}
var _this=this;
dojo.forEach(_15ba,function(item){
_this.store.deleteItem(item);
});
this.store.newItem({ID:this.store.next_id++});
dojo.forEach(_15b9,function(item){
_this.store.newItem(dojo.mixin(item,{ID:_this.store.next_id++}));
});
}else{
if(e.cell.field=="Type"){
var item=this.getItem(e.rowIndex);
var term=this.store.getValue(item,"Term").toString();
if(pion.terms.categories_by_id[term]!=this._prev_term_type_category){
this._prev_term_type_category=pion.terms.categories_by_id[term];
if(e.cell.widget){
e.cell.widget.setQuery({category:pion.terms.categories_by_id[term]});
}else{
this.structure[0].rows[e.cell.index].widgetProps.query.category=pion.terms.categories_by_id[term];
}
}
}
}
}
});
var _grid=this.rule_grid;
var h=_grid.connect(_grid.layout.cells[_grid.term_column_index],"sizeWidget",function(){
this.connect(this.layout.cells[_grid.term_column_index].widget,"_close",function(value){
_grid.edit.apply();
});
this.disconnect(h);
});
},execute:function(_15c5){
var _15c6=this.transformation_store;
var _15c7=this.transformation_item;
var _15c8=this.rule_store;
var _15c9=[];
for(var i=0;i<this.rule_grid.rowCount;++i){
var item=this.rule_grid.getItem(i);
var _15cc={Term:_15c8.getValue(item,"Term"),Type:_15c8.getValue(item,"Type"),SetValue:_15c8.getValue(item,"SetValue")};
pion.initOptionalValue(_15c8,item,_15cc,"Value");
_15c9.push(_15cc);
}
_15c6.setValue(_15c7,"StopOnFirstMatch",dojo.indexOf(_15c5.options,"StopOnFirstMatch")!=-1);
_15c6.setValues(_15c7,"Rule",_15c9);
this.reactor.updateNamedCustomPutData("custom_put_data_from_grid_stores");
},_populateRuleStore:function(){
var _this=this;
dojo.forEach(this.transformation_store.getValues(this.transformation_item,"Rule"),function(rule){
_this.rule_store.newItem(dojo.mixin(rule,{ID:_this.rule_store.next_id++}));
});
},_handleAddNewRule:function(){
this.rule_store.newItem({ID:this.rule_store.next_id++});
}});
dojo.declare("plugins.reactors.TransformReactor.RegexConfigurationDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog vocabulary_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Composite Regular Expression Configuration</span>\r\n\t\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\">\r\n\t\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<label>Source Term:</label>\r\n\t\t<input dojoType=\"pion.widgets.TermTextBox\" name=\"SourceTerm\" style=\"width: 400px\" />\r\n\t\t<div class=\"p_reactor_grid_blocks\">\r\n\t\t\t<h2>Regular Expressions</h2>\r\n\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"regex_grid_node\" style=\"width: 718px\"></div>\r\n\t\t\t<button dojoType=dijit.form.Button dojoAttachEvent=\"onClick: _handleAddNewRegex\" class=\"add_new_row\">ADD NEW REGEX</button>\r\n\t\t</div>\r\n\t\t<div class=\"save_cancel_delete\">\r\n\t\t\t<button dojoType=dijit.form.Button class=\"save\" dojoAttachPoint=\"save_button\" type=\"submit\">Save</button>\r\n\t\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: onCancel\">Cancel</button>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
this.attr("value",{SourceTerm:this.transformation_item.SourceTerm});
this.regex_store=new dojo.data.ItemFileWriteStore({data:{identifier:"ID",items:[]}});
this.regex_store.next_id=0;
this._populateRegexStore();
this.regex_grid_layout=[{defaultCell:{width:8,editable:true,type:dojox.grid.cells._Widget,styles:"text-align: right;"},rows:[{field:"Exp",name:"Regex",width:"auto",formatter:pion.xmlCellFormatter},{field:"Format",name:"Format",width:"auto",formatter:pion.xmlCellFormatter},{name:"Insert Above",styles:"align: center;",width:3,editable:false,value:"<button dojoType=dijit.form.Button class=\"insert_row\"><img src=\"images/arrowUp.png\" alt=\"INSERT ABOVE\" border=\"0\" /></button>"},{name:"Delete",styles:"align: center;",width:3,editable:false,formatter:pion.makeDeleteButton}]}];
this.regex_grid=new dojox.grid.DataGrid({store:this.regex_store,structure:this.regex_grid_layout,singleClickEdit:true,autoHeight:true},document.createElement("div"));
this.regex_grid_node.appendChild(this.regex_grid.domNode);
this.regex_grid.startup();
this.regex_grid.connect(this.regex_grid,"onCellClick",function(e){
if(e.cell.name=="Delete"){
this.store.deleteItem(this.getItem(e.rowIndex));
}else{
if(e.cell.name=="Insert Above"){
var _15d0=[];
var _15d1=[];
for(var i=e.rowIndex;i<this.rowCount;++i){
var item=this.getItem(i);
var _15d4={Exp:this.store.getValue(item,"Exp"),Format:this.store.getValue(item,"Format")};
_15d0.push(_15d4);
_15d1.push(item);
}
var _this=this;
dojo.forEach(_15d1,function(item){
_this.store.deleteItem(item);
});
this.store.newItem({ID:this.store.next_id++});
dojo.forEach(_15d0,function(item){
_this.store.newItem(dojo.mixin(item,{ID:_this.store.next_id++}));
});
}
}
});
},execute:function(_15d8){
var _15d9=this.transformation_store;
var _15da=this.transformation_item;
var _15db=this.regex_store;
var _15dc=[];
for(var i=0;i<this.regex_grid.rowCount;++i){
var item=this.regex_grid.getItem(i);
var _15df={Exp:_15db.getValue(item,"Exp"),Format:_15db.getValue(item,"Format")};
_15dc.push(_15df);
}
_15d9.setValue(_15da,"SourceTerm",_15d8.SourceTerm);
_15d9.setValues(_15da,"Regex",_15dc);
this.reactor.updateNamedCustomPutData("custom_put_data_from_grid_stores");
},_populateRegexStore:function(){
var _this=this;
dojo.forEach(this.transformation_store.getValues(this.transformation_item,"Regex"),function(regex){
_this.regex_store.newItem(dojo.mixin(regex,{ID:_this.regex_store.next_id++}));
});
},_handleAddNewRegex:function(){
this.regex_store.newItem({ID:this.regex_store.next_id++});
}});
}
if(!dojo._hasResource["plugins.reactors.ScriptReactor"]){
dojo._hasResource["plugins.reactors.ScriptReactor"]=true;
dojo.provide("plugins.reactors.ScriptReactor");
dojo.declare("plugins.reactors.ScriptReactor",[plugins.reactors.Reactor],{postCreate:function(){
this.config.Plugin="ScriptReactor";
this.inherited("postCreate",arguments);
this._updateCustomData();
},_updateCustomData:function(){
this._initOptions(this.config,plugins.reactors.ScriptReactor.option_defaults);
}});
plugins.reactors.ScriptReactor.label="Script Reactor";
dojo.declare("plugins.reactors.ScriptReactorInitDialog",[plugins.reactors.ReactorInitDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\" tabindex=\"-1\" waiRole=\"dialog\" waiState=\"labelledby-${id}_title\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Script Reactor Initialization</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Codec to use for writing events to the script:</label></td\r\n\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"InputCodec\" store=\"pion.codecs.config_store\" searchAttr=\"Name\"/></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Codec to use for reading events from the script:</label></td\r\n\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"OutputCodec\" store=\"pion.codecs.config_store\" searchAttr=\"Name\"/></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Script or command to execute:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Command\"/></td\r\n\t\t\t></tr\r\n\t\t></table>\r\n\t</div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick: tryConfig\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.plugin="ScriptReactor";
console.debug("plugins.reactors.ScriptReactorInitDialog.postCreate");
this.inherited("postCreate",arguments);
}});
dojo.declare("plugins.reactors.ScriptReactorDialog",[plugins.reactors.ReactorDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\" tabindex=\"-1\" waiRole=\"dialog\" waiState=\"labelledby-${id}_title\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Script Reactor Configuration</span>\r\n\t\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\">\r\n\t\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<!--start div to set padding for top half of dialog-->\r\n\t\t<div class=\"reactor_dialog_top\">\r\n\r\n\t\t\t<!--start reactor header info-->\r\n\t\t\t<div class=\"reactor_name\">\r\n\t\t\t\t<img src=\"/plugins/reactors/processing/ScriptReactor/dialog-icon.png\" width=\"17\" height=\"17\" border=\"0\" />\r\n\t\t\t\t&nbsp; Script Reactor\r\n\t\t\t</div>\r\n\t\t\t<div class=\"reactor_cat\">\r\n\t\t\t\t<strong>Name:</strong> ScriptReactor\r\n\t\t\t\t&nbsp;&nbsp;&nbsp;\r\n\t\t\t\t<strong>Category:</strong> Processing\r\n\t\t\t</div>\r\n\r\n\t\t\t<div style=\"clear:both;\"></div>\r\n\r\n\t\t\t<p>Retrieve, store or process events using an external script or program.</p>\r\n\t\t\t<!--end reactor header info-->\r\n\r\n\t\t\t <!--start reactor settings-->\r\n\t\t\t<div style=\"float:left; margin-right: 25px;\">\r\n\t\t\t\t<table\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" class=\"id_text_box\" disabled=\"true\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table>\r\n\t\t\t</div>\r\n\t\t\t<div style=\"float:left;\">\r\n\t\t\t\t<table\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Codec to use for writing events to the script:</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"InputCodec\" store=\"pion.codecs.config_store\" searchAttr=\"Name\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Codec to use for reading events from the script:</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"OutputCodec\" store=\"pion.codecs.config_store\" searchAttr=\"Name\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Script or command to execute:</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Command\"/></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table>\r\n\t\t\t</div>\r\n\t\t\t<div style=\"clear:both;\"></div>\r\n\t\t\t<!--end reactor settings-->\r\n\r\n\t\t</div>\r\n\t\t<!--end div to set padding for top half of dialog-->\r\n\r\n\t\t<!--start div to set padding for bottom half of dialog-->\r\n\t\t<div class=\"reactor_dialog_bottom\">\r\n\r\n\t\t\t<!--start connections-->\r\n\t\t\t<div class=\"p_reactor_grid_blocks\">\r\n\t\t\t\t<h2>Connections</h2>\r\n\t\t\t\t<h3>Input Connections</h3>\r\n\t\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"reactor_inputs_grid_node\" style=\"width: 618px\"></div>\r\n\t\t\t\t<h3>Output Connections</h3>\r\n\t\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"reactor_outputs_grid_node\" style=\"width: 618px\"></div>\r\n\t\t\t</div>\r\n\t\t\t<!--end connections-->\r\n\r\n\t\t\t<!--start buttons--> \r\n\t\t\t<div class=\"save_cancel_delete\">\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"delete\">Delete Reactor</button>\r\n\t\t\t</div>\r\n\t\t\t<!--end buttons--> \r\n\r\n\t\t</div>\r\n\t\t<!--end div to set padding for bottom half of dialog-->\r\n\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
}});
}
if(!dojo._hasResource["plugins.databases.Database"]){
dojo._hasResource["plugins.databases.Database"]=true;
dojo.provide("plugins.databases.Database");
dojo.declare("plugins.databases.SelectPluginDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog database_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">${title}</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Plugin&nbsp;Type:</label></td\r\n\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"Plugin\" \r\n\t\t\t\t\t\tstore=\"pion.databases.plugin_data_store\" searchAttr=\"label\" \r\n\t\t\t\t\t\tstyle=\"width: 100%;\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t</div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Continue</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: onCancel\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
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
var _15e4={};
var _15e5=store.getAttributes(item);
for(var i=0;i<_15e5.length;++i){
if(_15e5[i]!="tagName"&&_15e5[i]!="childNodes"){
_15e4[_15e5[i]]=store.getValue(item,_15e5[i]).toString();
}
}
console.dir(_15e4);
this.database_form.attr("value",_15e4);
var _15e7=dojo.query("textarea.comment",this.database_form.domNode)[0];
_15e7.value=_15e4.Comment;
console.debug("config = ",_15e4);
this.title=_15e4.Name;
var _15e8=dojo.query(".dijitAccordionTitle .dijitAccordionText",this.domNode)[0];
_15e8.firstChild.nodeValue=this.title;
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
var _15ea=this.database_form.attr("value");
var _15eb=dojo.query("textarea.comment",this.database_form.domNode)[0];
_15ea.Comment=_15eb.value;
this.put_data="<PionConfig><Database>";
for(var tag in _15ea){
if(tag!="@id"){
console.debug("config[",tag,"] = ",_15ea[tag]);
this.put_data+=pion.makeXmlLeafElement(tag,_15ea[tag]);
}
}
if(this._insertCustomData){
this._insertCustomData();
}
this.put_data+="</Database></PionConfig>";
console.debug("put_data: ",this.put_data);
_this=this;
dojo.rawXhrPut({url:"/config/databases/"+this.uuid,contentType:"text/xml",handleAs:"xml",putData:this.put_data,load:function(_15ed){
console.debug("response: ",_15ed);
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
dojo.xhrDelete({url:"/config/databases/"+this.uuid,handleAs:"xml",timeout:5000,load:function(_15ef,_15f0){
console.debug("xhrDelete for url = /config/databases/"+this.uuid,"; HTTP status code: ",_15f0.xhr.status);
dijit.byId("database_config_accordion").forward();
dijit.byId("database_config_accordion").removeChild(_this);
pion.databases._adjustAccordionSize();
return _15ef;
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
pion.databases.config_store.fetchItemByIdentity=function(_15f1){
pion.databases.config_store.fetch({query:{"@id":_15f1.identity},onItem:_15f1.onItem,onError:pion.handleFetchError});
};
pion.databases.config_store.getIdentity=function(item){
return pion.databases.config_store.getValue(item,"@id");
};
pion.databases._adjustAccordionSize=function(){
var _15f3=dijit.byId("database_config_accordion");
var _15f4=_15f3.getChildren().length;
console.debug("num_databases = "+_15f4);
var _15f5=pion.databases.selected_pane.getHeight();
var _15f6=0;
if(_15f4>0){
var _15f7=_15f3.getChildren()[0];
_15f6=_15f7.getTitleHeight();
}
var _15f8=_15f5+_15f4*_15f6;
_15f3.resize({h:_15f8});
pion.databases.height=_15f8+160;
dijit.byId("main_stack_container").resize({h:pion.databases.height});
};
pion.databases.init=function(){
pion.databases.selected_pane=null;
pion.databases.getAllDatabasesInUIDirectory=function(){
var d=new dojo.Deferred();
var store=new dojox.data.XmlStore({url:"/config/databases/plugins"});
store.fetch({onComplete:function(items){
var _15fc=dojo.map(items,function(item){
return store.getValue(item,"Plugin").toString();
});
d.callback(_15fc);
}});
return d;
};
var _15fe=function(_15ff){
var d=new dojo.Deferred();
plugin_data_store_items=[];
dojo.forEach(_15ff,function(_1601){
if(dojo.indexOf(pion.plugins.loaded_plugins,_1601)!=-1){
var _1602=pion.plugins.getPluginPrototype("plugins.databases",_1601,"/plugins/databases");
plugin_data_store_items.push({plugin:_1601,label:_1602.label});
}
pion.databases.plugin_data_store=new dojo.data.ItemFileWriteStore({data:{identifier:"plugin",items:plugin_data_store_items}});
});
d.callback();
return d;
};
var _1603=function(){
if(file_protocol){
pion.databases._adjustAccordionSize();
}else{
pion.databases.config_store.fetch({onComplete:function(items,_1605){
var _1606=dijit.byId("database_config_accordion");
for(var i=0;i<items.length;++i){
pion.databases.createNewPaneFromItem(items[i]);
}
var _1608=_1606.getChildren()[0];
_1606.selectChild(_1608);
},onError:pion.handleFetchError});
}
};
pion.plugins.initLoadedPluginList().addCallback(pion.databases.getAllDatabasesInUIDirectory).addCallback(_15fe).addCallback(_1603);
function _paneSelected(pane){
console.debug("Selected "+pane.title);
var _160a=pion.databases.selected_pane;
if(pane==_160a){
return;
}
if(_160a&&dojo.hasClass(_160a.domNode,"unsaved_changes")){
var _160b=new dijit.Dialog({title:"Warning: unsaved changes"});
_160b.attr("content","Please save or cancel unsaved changes before selecting another Database.");
_160b.show();
setTimeout(function(){
dijit.byId("database_config_accordion").selectChild(_160a);
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
var _160e=dijit.byId("database_config_accordion").duration;
setTimeout(function(){
dojo.style(pane.containerNode,"overflow","hidden");
pion.databases._adjustAccordionSize();
},_160e+50);
};
dojo.subscribe("database_config_accordion-selectChild",_paneSelected);
pion.databases.createNewPaneFromItem=function(item){
var title=pion.escapeXml(pion.codecs.config_store.getValue(item,"Name"));
var _1611=pion.databases.config_store.getValue(item,"Plugin");
var _1612=document.createElement("span");
var _1613="plugins.databases."+_1611+"Pane";
var _1614=dojo.getObject(_1613);
if(_1614){
console.debug("found class ",_1613);
var _1615=new _1614({"class":"database_pane",title:title},_1612);
}else{
console.debug("class ",_1613," not found; using plugins.databases.DatabasePane instead.");
var _1615=new plugins.databases.DatabasePane({"class":"database_pane",title:title},_1612);
}
_1615.config_item=item;
_1615.uuid=pion.databases.config_store.getValue(item,"@id");
dijit.byId("database_config_accordion").addChild(_1615);
return _1615;
};
pion.databases.createNewPaneFromStore=function(id,_1617){
pion.databases.config_store.fetch({query:{"@id":id},onItem:function(item){
var _1619=pion.databases.createNewPaneFromItem(item);
if(_1617){
pion.databases._adjustAccordionSize();
dijit.byId("database_config_accordion").selectChild(_1619);
}
},onError:pion.handleFetchError});
};
function _isDuplicateDatabaseId(id){
var _161b=dijit.byId("database_config_accordion").getChildren();
for(var i=0;i<_161b.length;++i){
if(pion.databases.config_store.getValue(_161b[i].config_item,"@id")==id){
return true;
}
}
return false;
};
function _isDuplicateDatabaseName(name){
var _161e=dijit.byId("database_config_accordion").getChildren();
for(var i=0;i<_161e.length;++i){
if(_161e[i].title==name){
return true;
}
}
return false;
};
function _addNewDatabase(){
var _1620=new plugins.databases.SelectPluginDialog({title:"Select Database Plugin"});
_1620.show();
_1620.execute=function(_1621){
console.debug(_1621);
if(plugins.databases[_1621.Plugin]&&plugins.databases[_1621.Plugin].edition=="Enterprise"){
pion.about.checkKeyStatus({success_callback:function(){
_initNewDatabase(_1621.Plugin);
}});
}else{
_initNewDatabase(_1621.Plugin);
}
};
};
function _initNewDatabase(_1622){
var title="Add New "+_1622;
var _1624="plugins.databases."+_1622+"InitDialog";
var _1625=dojo.getObject(_1624);
if(_1625){
console.debug("found class ",_1624);
var _1626=new _1625({title:title});
}else{
console.debug("class ",_1624," not found; using plugins.databases.DatabaseInitDialog instead.");
var _1626=new plugins.databases.DatabaseInitDialog({title:title});
}
_1626.attr("value",{Plugin:_1622});
setTimeout(function(){
dojo.query("input",_1626.domNode)[0].select();
},500);
_1626.show();
_1626.execute=function(_1627){
console.debug(_1627);
var _1628="<PionConfig><Database>";
for(var tag in _1627){
console.debug("dialogFields[",tag,"] = ",_1627[tag]);
_1628+=pion.makeXmlLeafElement(tag,_1627[tag]);
}
if(this._insertCustomData){
this._insertCustomData();
}
_1628+="</Database></PionConfig>";
console.debug("post_data: ",_1628);
dojo.rawXhrPost({url:"/config/databases",contentType:"text/xml",handleAs:"xml",postData:_1628,load:function(_162a){
var node=_162a.getElementsByTagName("Database")[0];
var id=node.getAttribute("id");
console.debug("id (from server): ",id);
pion.databases.createNewPaneFromStore(id,true);
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1628})});
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
this._initOptions(this.config,plugins.reactors.DatabaseOutputReactor.option_defaults);
this.special_config_elements.push("Comparison","Field");
this.field_mapping_store=new dojo.data.ItemFileWriteStore({data:{identifier:"ID",items:[]}});
this.field_mapping_store.next_id=0;
this.comparison_store=new dojo.data.ItemFileWriteStore({data:{identifier:"ID",items:[]}});
this.comparison_store.next_id=0;
this.prepareToHandleLoadNotification();
this._populateComparisonStore();
this._populateFieldMappingStore();
},prepareToHandleLoadNotification:function(){
this.comparison_store_is_ready=false;
this.field_mapping_store_is_ready=false;
var h1=this.connect(this,"onDonePopulatingComparisonStore",function(){
this.disconnect(h1);
this._updatePutDataIfGridStoresReady();
});
var h2=this.connect(this,"onDonePopulatingFieldMappingStore",function(){
this.disconnect(h2);
this._updatePutDataIfGridStoresReady();
});
},_updatePutDataIfGridStoresReady:function(){
if(this.comparison_store_is_ready&&this.field_mapping_store_is_ready){
this.updateNamedCustomPutData("custom_put_data_from_config");
this.comparison_store_is_ready=false;
this.field_mapping_store_is_ready=false;
this.onDonePopulatingGridStores();
}
},onDonePopulatingGridStores:function(){
},reloadGridStores:function(){
var _this=this;
this.comparison_store.fetch({onItem:function(item){
_this.comparison_store.deleteItem(item);
},onComplete:function(){
_this._populateComparisonStore();
},onError:pion.handleFetchError});
this.field_mapping_store.fetch({onItem:function(item){
_this.field_mapping_store.deleteItem(item);
},onComplete:function(){
_this._populateFieldMappingStore();
},onError:pion.handleFetchError});
this.prepareToHandleLoadNotification();
},_populateComparisonStore:function(){
var _this=this;
var store=pion.reactors.config_store;
store.fetch({query:{"@id":this.config["@id"]},onItem:function(item){
var _1635=store.getValues(item,"Comparison");
for(var i=0;i<_1635.length;++i){
var _1637={ID:_this.comparison_store.next_id++,Term:store.getValue(_1635[i],"Term"),Type:store.getValue(_1635[i],"Type"),MatchAllValues:_this.getOptionalBool(store,_1635[i],"MatchAllValues")};
if(store.hasAttribute(_1635[i],"Value")){
_1637.Value=store.getValue(_1635[i],"Value");
}
_this.comparison_store.newItem(_1637);
}
},onComplete:function(){
_this.comparison_store_is_ready=true;
_this.onDonePopulatingComparisonStore();
},onError:pion.handleFetchError});
},onDonePopulatingComparisonStore:function(){
},_populateFieldMappingStore:function(){
var _this=this;
var store=pion.reactors.config_store;
store.fetch({query:{"@id":this.config["@id"]},onItem:function(item){
dojo.forEach(store.getValues(item,"Field"),function(_163b){
var index=store.getValue(_163b,"@index");
var _163d=(index!==undefined&&index!==null);
var _163e=store.getValue(_163b,"@sql");
var _163f=(_163e!==undefined&&_163e!==null);
var _1640={ID:_this.field_mapping_store.next_id++,Field:store.getValue(_163b,"text()"),Term:store.getValue(_163b,"@term")};
if(_163d){
if(index=="false"||index=="true"||index=="unique"){
_1640.IndexOption=index;
}else{
_1640.IndexOption="custom";
}
_1640.Index=index;
}else{
_1640.IndexOption="false";
}
if(_163f){
_1640.SqlType=_163e;
}
_this.field_mapping_store.newItem(_1640);
});
},onComplete:function(){
_this.field_mapping_store_is_ready=true;
_this.onDonePopulatingFieldMappingStore();
},onError:pion.handleFetchError});
},onDonePopulatingFieldMappingStore:function(){
},_updateCustomData:function(){
this.custom_put_data_from_config=this.custom_put_data_from_grid_stores;
},_insertCustomData:function(){
this.put_data+=this.custom_put_data_from_config;
},updateNamedCustomPutData:function(_1641){
var _1642="";
var _this=this;
var _1644=this.comparison_store;
var _1645=this.field_mapping_store;
_1644.fetch({onItem:function(item){
_1642+="<Comparison>";
_1642+="<Term>"+_1644.getValue(item,"Term")+"</Term>";
_1642+="<Type>"+_1644.getValue(item,"Type")+"</Type>";
if(_1644.hasAttribute(item,"Value")){
_1642+=pion.makeXmlLeafElement("Value",_1644.getValue(item,"Value"));
}
_1642+="<MatchAllValues>"+_1644.getValue(item,"MatchAllValues")+"</MatchAllValues>";
_1642+="</Comparison>";
},onComplete:function(){
_1645.fetch({onItem:function(item){
_1642+="<Field term=\""+_1645.getValue(item,"Term")+"\"";
var index=_1645.getValue(item,"Index");
var _1649=_1645.getValue(item,"IndexOption");
if(_1649=="custom"){
_1642+=" index=\""+index+"\"";
}else{
if(_1649=="false"){
if(index=="false"){
_1642+=" index=\"false\"";
}
}else{
_1642+=" index=\""+_1649+"\"";
}
}
if(_1645.hasAttribute(item,"SqlType")){
_1642+=" sql=\""+_1645.getValue(item,"SqlType")+"\"";
}
_1642+=">";
_1642+=pion.escapeXml(_1645.getValue(item,"Field"));
_1642+="</Field>";
},onComplete:function(){
_this[_1641]=_1642;
},onError:pion.handleFetchError});
},onError:pion.handleFetchError});
}});
plugins.reactors.DatabaseOutputReactor.label="Embedded Storage Reactor";
plugins.reactors.DatabaseOutputReactor.option_defaults={IgnoreInsert:false,MatchAllComparisons:false};
plugins.reactors.DatabaseOutputReactor.grid_option_defaults={MatchAllValues:false};
dojo.declare("plugins.reactors.DatabaseOutputReactorInitDialog",[plugins.reactors.ReactorInitDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Database Output Reactor Initialization</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Database:</label></td\r\n\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"Database\" store=\"pion.databases.config_store\" searchAttr=\"Name\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Table:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Table\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t></div>\r\n\t<h3>Field Mappings</h3>\r\n\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"field_mapping_grid_node\"></div>\r\n\t<button dojoType=dijit.form.Button dojoAttachEvent=\"onClick: _handleAddNewMapping\" class=\"add_new_row\">ADD NEW MAPPING</button>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick: tryConfig\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.plugin="DatabaseOutputReactor";
this.inherited("postCreate",arguments);
this.field_mapping_store=new dojo.data.ItemFileWriteStore({data:{identifier:"ID",items:[]}});
this.field_mapping_store.next_id=0;
this.custom_post_data_from_field_mapping_store="";
this.connect(this.field_mapping_store,"onSet","_updateCustomPostDataFromFieldMappingStore");
this.connect(this.field_mapping_store,"onDelete","_updateCustomPostDataFromFieldMappingStore");
var _164a=new dojox.grid.DataGrid({store:this.field_mapping_store,structure:plugins.reactors.DatabaseOutputReactorDialog.grid_layout,singleClickEdit:true,autoHeight:true},document.createElement("div"));
this.field_mapping_grid_node.appendChild(_164a.domNode);
_164a.startup();
_164a.connect(_164a,"onCellClick",function(e){
if(e.cell.name=="Delete"){
this.store.deleteItem(this.getItem(e.rowIndex));
}
});
},_updateCustomPostDataFromFieldMappingStore:function(){
var _164c="";
var _this=this;
var store=this.field_mapping_store;
store.fetch({onItem:function(item){
_164c+="<Field term=\""+store.getValue(item,"Term")+"\"";
var _1650=store.getValue(item,"IndexOption");
if(_1650!="false"){
_164c+=" index=\""+_1650+"\"";
}
_164c+=">";
_164c+=pion.escapeXml(store.getValue(item,"Field"));
_164c+="</Field>";
},onComplete:function(){
_this.custom_post_data_from_field_mapping_store=_164c;
},onError:pion.handleFetchError});
},_insertCustomData:function(){
this.post_data+=this.custom_post_data_from_field_mapping_store;
},_handleAddNewMapping:function(){
this.field_mapping_store.newItem({ID:this.field_mapping_store.next_id++,IndexOption:"false"});
}});
dojo.declare("plugins.reactors.DatabaseOutputReactorDialog",[plugins.reactors.ReactorDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Database Output Reactor Configuration</span>\r\n\t\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\">\r\n\t\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<!--start div to set padding for top half of dialog-->\r\n\t\t <div class=\"reactor_dialog_top\">\r\n\r\n\t\t\t<!--start reactor header info-->\r\n\t\t\t<div class=\"reactor_name\">\r\n\t\t\t\t<img src=\"/plugins/reactors/storage/DatabaseOutputReactor/dialog-icon.png\" width=\"17\" height=\"17\" border=\"0\" />\r\n\t\t\t\t&nbsp; Database Output Reactor\r\n\t\t\t</div>\r\n\t\t\t<div class=\"reactor_cat\">\r\n\t\t\t\t<strong>Name:</strong> DatabaseOutputReactor\r\n\t\t\t\t&nbsp;&nbsp;&nbsp;\r\n\t\t\t\t<strong>Category:</strong> Storage\r\n\t\t\t</div>\r\n\r\n\t\t\t<div style=\"clear:both;\"></div>\r\n\r\n\t\t\t<p>Send real-time data into a database or data warehouse.</p>\r\n\t\t\t<!--end reactor header info-->\r\n\r\n\t\t\t<!--start reactor settings-->\r\n\t\t\t <table\r\n\t\t\t\t><tr\r\n\t\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" class=\"id_text_box\" disabled=\"true\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Database:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"Database\" store=\"pion.databases.config_store\" searchAttr=\"Name\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Table:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Table\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Queue Size:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"QueueSize\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Queue Timeout:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"QueueTimeout\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Ignore Insert Errors</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"IgnoreInsert\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label dojoAttachPoint=\"key_cache_max_age_label\">Key Cache Max Age:</label></td\r\n\t\t\t\t\t><td><input dojoAttachPoint=\"key_cache_max_age\" dojoType=\"dijit.form.TextBox\" name=\"KeyCacheMaxAge\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label dojoAttachPoint=\"key_cache_age_term_label\">Key Cache Age Term:</label></td\r\n\t\t\t\t\t><td><input dojoAttachPoint=\"key_cache_age_term\" dojoType=\"pion.widgets.TermTextBox\" name=\"KeyCacheAgeTerm\" style=\"width: 100%;\" /></td\r\n\t\t\t\t></tr\r\n\t\t\t ></table>\r\n\t\t\t<!--end reactor settings-->\r\n\r\n\t\t</div>\r\n\t\t<!--end div to set padding for top half of dialog-->\r\n\r\n\t\t<!--start div to set padding for bottom half of dialog-->\r\n\t\t<div class=\"reactor_dialog_bottom\">\r\n\r\n\t\t\t<div class=\"s_reactor_grid_blocks\">\r\n\t\t\t\t<h2>Inclusion Conditions</h2>\r\n\t\t\t\t<input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"MatchAllComparisons\" dojoAttachEvent=\"onClick: _onUpdateMatchAllComparisons\" />\r\n\t\t\t\t<label>Match All Comparisons</label>\r\n\t\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"comparison_grid_node\" style=\"width: 618px\"></div>\r\n\t\t\t\t<button dojoAttachPoint=\"add_new_comparison_button\" dojoType=dijit.form.Button dojoAttachEvent=\"onClick: _handleAddNewComparison\" class=\"add_new_row\">ADD NEW COMPARISON</button>\r\n\t\t\t</div>\r\n\r\n\t\t\t<br />\r\n\r\n\t\t\t<!--start field mappings-->\r\n\t\t\t<div class=\"s_reactor_grid_blocks\">\r\n\t\t\t\t<h2>Field Mappings</h2>\r\n\t\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"field_mapping_grid_node\" style=\"width: 618px\"></div>\r\n\t\t\t\t<button dojoType=dijit.form.Button dojoAttachEvent=\"onClick: _handleAddNewMapping\" class=\"add_new_row\">ADD NEW MAPPING</button>\r\n\t\t\t</div>\r\n\t\t\t<!--end field mappings-->\r\n\r\n\t\t\t<br />\r\n\r\n\t\t\t<!--start connections-->\r\n\t\t\t<div class=\"s_reactor_grid_blocks\">\r\n\t\t\t\t<h2>Connections</h2>\r\n\t\t\t\t<h3>Input Connections</h3>\r\n\t\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"reactor_inputs_grid_node\" style=\"width: 618px\"></div>\r\n\t\t\t\t<h3>Output Connections</h3>\r\n\t\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"reactor_outputs_grid_node\" style=\"width: 618px\"></div>\r\n\t\t\t</div>\r\n\t\t\t<!--end connections-->\r\n\r\n\t\t\t<!--start buttons-->\r\n\t\t\t<div class=\"save_cancel_delete\">\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"delete\">Delete Reactor</button>\r\n\t\t\t</div>\r\n\t\t\t<!--end buttons--> \r\n\r\n\t\t</div>\r\n\t\t<!--end div to set padding for bottom half of dialog-->\r\n\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
this.reactor._initOptions(this.reactor.config,plugins.reactors.DatabaseOutputReactor.option_defaults);
var _this=this;
var h=dojo.connect(this.reactor,"onDonePopulatingGridStores",function(){
_this._updateCustomPutDataFromGridStores();
_this._checkForUniqueIndex();
_this.connect(_this.reactor.comparison_store,"onSet","_updateCustomPutDataFromGridStores");
_this.connect(_this.reactor.comparison_store,"onDelete","_updateCustomPutDataFromGridStores");
_this.connect(_this.reactor.field_mapping_store,"onSet","_updateCustomPutDataFromGridStores");
_this.connect(_this.reactor.field_mapping_store,"onDelete","_updateCustomPutDataFromGridStores");
_this.connect(_this.reactor.field_mapping_store,"onSet","_checkForUniqueIndex");
_this.connect(_this.reactor.field_mapping_store,"onDelete","_checkForUniqueIndex");
dojo.disconnect(h);
});
this.reactor.reloadGridStores();
this.comparison_grid_layout=[{defaultCell:{width:8,editable:true,type:dojox.grid.cells._Widget,styles:"text-align: right;"},rows:[{field:"Term",name:"Term",width:20,type:pion.widgets.TermTextCell},{field:"Type",name:"Comparison",width:15,widgetClass:"pion.widgets.SimpleSelect",widgetProps:{store:pion.reactors.comparison_type_store,query:{category:"generic"}}},{field:"Value",name:"Value",width:"auto",formatter:pion.xmlCellFormatter},{field:"MatchAllValues",name:"Match All",width:3,type:dojox.grid.cells.Bool},{name:"Delete",styles:"align: center;",width:3,editable:false,formatter:pion.makeDeleteButton}]}];
this.comparison_grid=new dojox.grid.DataGrid({store:this.reactor.comparison_store,structure:this.comparison_grid_layout,singleClickEdit:true,autoHeight:true},document.createElement("div"));
this.comparison_grid._prev_term_type_category=this.comparison_grid.structure[0].rows[1].widgetProps.query.category;
this.comparison_grid_node.appendChild(this.comparison_grid.domNode);
this.comparison_grid.startup();
this.comparison_grid.connect(this.comparison_grid,"onCellClick",function(e){
if(e.cell.name=="Comparison"){
var item=this.getItem(e.rowIndex);
var term=this.store.getValue(item,"Term").toString();
if(pion.terms.categories_by_id[term]!=this._prev_term_type_category){
this._prev_term_type_category=pion.terms.categories_by_id[term];
if(e.cell.widget){
e.cell.widget.setQuery({category:pion.terms.categories_by_id[term]});
}else{
this.structure[0].rows[1].widgetProps.query.category=pion.terms.categories_by_id[term];
}
}
}else{
if(e.cell.name=="Delete"){
this.store.deleteItem(this.getItem(e.rowIndex));
}
}
});
var _1656=new dojox.grid.DataGrid({store:this.reactor.field_mapping_store,structure:plugins.reactors.DatabaseOutputReactorDialog.grid_layout,singleClickEdit:true,autoHeight:true},document.createElement("div"));
this.field_mapping_grid_node.appendChild(_1656.domNode);
_1656.startup();
_1656.connect(_1656,"onCellClick",function(e){
if(e.cell.name=="Delete"){
this.store.deleteItem(this.getItem(e.rowIndex));
}
});
_1656.canEdit=function(cell,_1659){
switch(cell.name){
case "Index":
var item=this.getItem(_1659);
var _165b=this.store.getValue(item,"IndexOption").toString();
return _165b!="custom";
default:
return true;
}
};
this.connect(this,"onCancel",function(){
this.destroyRecursive(false);
});
this.connect(this,"execute",function(){
this.destroyRecursive(false);
});
},_onUpdateMatchAllComparisons:function(e){
this.reactor.comparison_store.match_all_comparisons=e.target.checked;
this.reactor.updateNamedCustomPutData("custom_put_data_from_grid_stores");
},_updateCustomPutDataFromGridStores:function(){
this.reactor.updateNamedCustomPutData("custom_put_data_from_grid_stores");
},_checkForUniqueIndex:function(){
var _this=this;
var _165e=false;
var _165f=this.reactor.field_mapping_store;
_165f.fetch({onItem:function(item){
var index=_165f.getValue(item,"Index");
var _1662=_165f.getValue(item,"IndexOption");
if(_1662=="unique"||_1662=="custom"){
_165e=true;
}
},onComplete:function(){
if(_165e){
dojo.removeClass(_this.key_cache_max_age_label,"disabled");
_this.key_cache_max_age.attr("disabled",false);
dojo.removeClass(_this.key_cache_age_term_label,"disabled");
_this.key_cache_age_term.attr("disabled",false);
}else{
dojo.addClass(_this.key_cache_max_age_label,"disabled");
_this.key_cache_max_age.attr("disabled",true);
_this.key_cache_max_age.attr("value","");
dojo.addClass(_this.key_cache_age_term_label,"disabled");
_this.key_cache_age_term.attr("disabled",true);
_this.key_cache_age_term.attr("value","");
}
},onError:pion.handleFetchError});
},_insertCustomData:function(){
this.put_data+=this.reactor.custom_put_data_from_grid_stores;
},_handleAddNewComparison:function(){
this.reactor.comparison_store.newItem({ID:this.reactor.comparison_store.next_id++,MatchAllValues:false});
},_handleAddNewMapping:function(){
this.reactor.field_mapping_store.newItem({ID:this.reactor.field_mapping_store.next_id++,IndexOption:"false"});
}});
plugins.reactors.DatabaseOutputReactorDialog.grid_layout=[{defaultCell:{editable:true,type:dojox.grid.cells._Widget},rows:[{field:"Field",name:"Database Column Name",width:20,widgetClass:"dijit.form.ValidationTextBox",widgetProps:{regExp:"[a-zA-Z][\\w]*",required:"true",invalidMessage:"Illegal database column name"}},{field:"Term",name:"Term",width:"auto",type:pion.widgets.TermTextCell},{field:"IndexOption",name:"Index",styles:"text-align: center;",width:4,type:dojox.grid.cells.Select,options:["true","false","unique"]},{name:"Delete",styles:"align: center;",width:3,editable:false,formatter:function(){
return pion.makeDeleteButton();
}}]}];
}
if(!dojo._hasResource["plugins.reactors.FissionReactor"]){
dojo._hasResource["plugins.reactors.FissionReactor"]=true;
dojo.provide("plugins.reactors.FissionReactor");
dojo.declare("plugins.reactors.FissionReactor",[plugins.reactors.Reactor],{postCreate:function(){
this.config.Plugin="FissionReactor";
this.inherited("postCreate",arguments);
this.special_config_elements.push("CopyTerm");
this.copy_term_store=new dojo.data.ItemFileWriteStore({data:{identifier:"ID",items:[]}});
this.copy_term_store.next_id=0;
this._populateCopyTermStore();
},reloadCopyTermStore:function(){
var _this=this;
this.copy_term_store.fetch({onItem:function(item){
_this.copy_term_store.deleteItem(item);
},onComplete:function(){
_this._populateCopyTermStore();
},onError:pion.handleFetchError});
},onDonePopulatingCopyTermStore:function(){
},_populateCopyTermStore:function(){
var _this=this;
var store=pion.reactors.config_store;
store.fetch({query:{"@id":this.config["@id"]},onItem:function(item){
var _1668=store.getValues(item,"CopyTerm");
for(var i=0;i<_1668.length;++i){
var _166a={ID:_this.copy_term_store.next_id++,Term:_1668[i]};
_this.copy_term_store.newItem(_166a);
}
},onComplete:function(){
_this.updateNamedCustomPutData("custom_put_data_from_config");
_this.onDonePopulatingCopyTermStore();
},onError:pion.handleFetchError});
},_updateCustomData:function(){
this.custom_put_data_from_config=this.custom_put_data_from_copy_term_store;
},_insertCustomData:function(){
this.put_data+=this.custom_put_data_from_config;
},updateNamedCustomPutData:function(_166b){
var _166c="";
var _this=this;
var store=this.copy_term_store;
store.fetch({onItem:function(item){
_166c+=pion.makeXmlLeafElement("CopyTerm",store.getValue(item,"Term"));
},onComplete:function(){
_this[_166b]=_166c;
},onError:pion.handleFetchError});
}});
plugins.reactors.FissionReactor.label="Fission Reactor";
dojo.declare("plugins.reactors.FissionReactorInitDialog",[plugins.reactors.ReactorInitDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\" tabindex=\"-1\" waiRole=\"dialog\" waiState=\"labelledby-${id}_title\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Fission Reactor Initialization</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Input&nbsp;Event&nbsp;Type:</label></td\r\n\t\t\t\t><td><input dojoType=\"pion.widgets.TermTextBox\" name=\"InputEventType\" query=\"{type: 'event type'}\" style=\"width: 100%;\" /></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Input&nbsp;Event&nbsp;Term:</label></td\r\n\t\t\t\t><td><input dojoType=\"pion.widgets.TermTextBox\" name=\"InputEventTerm\" query=\"{category: 'string'}\" style=\"width: 100%;\" /></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Codec:</label></td\r\n\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"Codec\" store=\"pion.codecs.config_store\" searchAttr=\"Name\"/></td\r\n\t\t\t></tr\r\n\t\t></table>\r\n\t</div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick: tryConfig\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.plugin="FissionReactor";
console.debug("plugins.reactors.FissionReactorInitDialog.postCreate");
this.inherited("postCreate",arguments);
}});
dojo.declare("plugins.reactors.FissionReactorDialog",[plugins.reactors.ReactorDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\" tabindex=\"-1\" waiRole=\"dialog\" waiState=\"labelledby-${id}_title\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Fission Reactor Configuration</span>\r\n\t\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\">\r\n\t\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<!--start div to set padding for top half of dialog-->\r\n\t\t<div class=\"reactor_dialog_top\">\r\n\r\n\t\t\t<!--start reactor header info-->\r\n\t\t\t<div class=\"reactor_name\">\r\n\t\t\t\t<img src=\"/plugins/reactors/processing/FissionReactor/dialog-icon.png\" width=\"17\" height=\"17\" border=\"0\" />\r\n\t\t\t\t&nbsp; Fission Reactor\r\n\t\t\t</div>\r\n\t\t\t<div class=\"reactor_cat\">\r\n\t\t\t\t<strong>Name:</strong> FissionReactor\r\n\t\t\t\t&nbsp;&nbsp;&nbsp;\r\n\t\t\t\t<strong>Category:</strong> Processing\r\n\t\t\t</div>\r\n\r\n\t\t\t<div style=\"clear:both;\"></div>\r\n\r\n\t\t\t<p>Split each input event into a collection of output events.</p>\r\n\t\t\t<!--end reactor header info-->\r\n\r\n\t\t\t <!--start reactor settings-->\r\n\t\t\t<table cellpadding=\"0\" cellspacing=\"5\" border=\"0\"\r\n\t\t\t\t><tr\r\n\t\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" class=\"id_text_box\" disabled=\"true\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Input&nbsp;Event&nbsp;Type:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"pion.widgets.TermTextBox\" name=\"InputEventType\" query=\"{type: 'event type'}\" style=\"width: 100%;\" /></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Input&nbsp;Event&nbsp;Term:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"pion.widgets.TermTextBox\" name=\"InputEventTerm\" query=\"{category: 'string'}\" style=\"width: 100%;\" /></td\r\n\t\t\t\t></tr><tr\r\n\t\t\t\t\t><td><label>Codec:</label></td\r\n\t\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"Codec\" store=\"pion.codecs.config_store\" searchAttr=\"Name\"/></td\r\n\t\t\t\t></tr\r\n\t\t\t></table>\r\n\t\t\t<div style=\"clear:both;\"></div>\r\n\t\t\t<!--end reactor settings-->\r\n\r\n\t\t</div>\r\n\t\t<!--end div to set padding for top half of dialog-->\r\n\r\n\t\t<!--start div to set padding for bottom half of dialog-->\r\n\t\t<div class=\"reactor_dialog_bottom\">\r\n\r\n\t\t\t<!--start copy terms-->\r\n\t\t\t<div class=\"p_reactor_grid_blocks\">\r\n\t\t\t\t<h2>Terms to copy (optional)</h2>\r\n\t\t\t\t<h4>For each input event, these terms will be copied to every resulting output event.</h4>\r\n\t\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"copy_term_grid_node\" style=\"width: 618px\"></div>\r\n\t\t\t\t<button dojoType=dijit.form.Button dojoAttachEvent=\"onClick: _handleAddNewCopyTerm\" class=\"add_new_row\">ADD NEW TERM TO COPY</button>\r\n\t\t\t</div>\r\n\t\t\t<!--end copy terms-->\r\n\r\n\t\t\t<br />\r\n\r\n\t\t\t<!--start connections-->\r\n\t\t\t<div class=\"p_reactor_grid_blocks\">\r\n\t\t\t\t<h2>Connections</h2>\r\n\t\t\t\t<h3>Input Connections</h3>\r\n\t\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"reactor_inputs_grid_node\" style=\"width: 618px\"></div>\r\n\t\t\t\t<h3>Output Connections</h3>\r\n\t\t\t\t<div class=\"reactor_dialog_grid\" dojoAttachPoint=\"reactor_outputs_grid_node\" style=\"width: 618px\"></div>\r\n\t\t\t</div>\r\n\t\t\t<!--end connections-->\r\n\r\n\t\t\t<!--start buttons--> \r\n\t\t\t<div class=\"save_cancel_delete\">\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t\t\t\t<button dojoType=dijit.form.Button class=\"delete\">Delete Reactor</button>\r\n\t\t\t</div>\r\n\t\t\t<!--end buttons--> \r\n\r\n\t\t</div>\r\n\t\t<!--end div to set padding for bottom half of dialog-->\r\n\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
var _this=this;
var h=dojo.connect(this.reactor,"onDonePopulatingCopyTermStore",function(){
_this._updateCustomPutDataFromCopyTermStore();
_this.connect(_this.reactor.copy_term_store,"onSet","_updateCustomPutDataFromCopyTermStore");
_this.connect(_this.reactor.copy_term_store,"onDelete","_updateCustomPutDataFromCopyTermStore");
dojo.disconnect(h);
});
this.reactor.reloadCopyTermStore();
this.copy_term_grid_layout=[{rows:[{field:"Term",name:"Term",width:"auto",editable:true,type:pion.widgets.TermTextCell},{name:"Delete",styles:"align: center;",width:3,formatter:pion.makeDeleteButton}]}];
this.copy_term_grid=new dojox.grid.DataGrid({store:this.reactor.copy_term_store,structure:this.copy_term_grid_layout,singleClickEdit:true,autoHeight:true},document.createElement("div"));
this.copy_term_grid_node.appendChild(this.copy_term_grid.domNode);
this.copy_term_grid.startup();
this.copy_term_grid.connect(this.copy_term_grid,"onCellClick",function(e){
if(e.cell.name=="Delete"){
this.store.deleteItem(this.getItem(e.rowIndex));
}
});
},_updateCustomPutDataFromCopyTermStore:function(){
this.reactor.updateNamedCustomPutData("custom_put_data_from_copy_term_store");
},_insertCustomData:function(){
this.put_data+=this.reactor.custom_put_data_from_copy_term_store;
},_handleAddNewCopyTerm:function(){
this.reactor.copy_term_store.newItem({ID:this.reactor.copy_term_store.next_id++});
}});
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
pion.reactors.config_store=null;
pion.reactors.comparison_type_store=new dojo.data.ItemFileReadStore({url:"/resources/comparisonTypes.json"});
pion.reactors.generic_comparison_types=[];
pion.reactors.categories={};
pion.reactors.getHeight=function(){
return dojo.byId("outer").clientHeight-150;
};
pion.reactors.init=function(){
dijit.byId("main_stack_container").resize({h:pion.reactors.getHeight()});
var _1673=dijit.byId("ops_toggle_button");
dojo.connect(_1673.domNode,"click",function(){
if(_1673.checked){
dojo.addClass(dojo.byId("counterBackground"),"hidden");
}else{
dojo.removeClass(dojo.byId("counterBackground"),"hidden");
}
});
var _1674=function(item,hint){
var node=dojo.doc.createElement("div");
node.id=dojo.dnd.getUniqueId();
node.className="dojoDndItem";
node.setAttribute("reactor_type",item.reactor_type);
var _1678=dojo.doc.createElement("img");
node.appendChild(_1678);
_1678.setAttribute("src",item.src);
_1678.setAttribute("width",148);
_1678.setAttribute("height",25);
_1678.setAttribute("alt",item.alt);
return {node:node,data:item,type:["reactor"]};
};
var _1679={collection:collectionReactors,processing:processingReactors,storage:storageReactors};
for(var _167a in _1679){
_1679[_167a].creator=_1674;
}
var store=pion.reactors.comparison_type_store;
store.fetch({query:{category:"generic"},onItem:function(item){
pion.reactors.generic_comparison_types.push(store.getValue(item,"name"));
}});
pion.reactors.getAllReactorsInUIDirectory=function(){
var d=new dojo.Deferred();
var store=new dojox.data.XmlStore({url:"/config/reactors/plugins"});
store.fetch({onComplete:function(items){
var _1680=dojo.map(items,function(item){
var _1682=store.getValue(item,"Plugin").toString();
var _1683=store.getValue(item,"ReactorType").toString();
return {plugin:_1682,category:_1683};
});
d.callback(_1680);
}});
return d;
};
var _1684=function(_1685){
var d=new dojo.Deferred();
dojo.forEach(_1685,function(_1687){
var _1688=_1687.plugin;
if(dojo.indexOf(pion.plugins.loaded_plugins,_1688)!=-1){
var _1689=pion.plugins.getPluginPrototype("plugins.reactors",_1688,"/plugins/reactors/"+_1687.category);
pion.reactors.categories[_1688]=_1687.category;
var icon=_1687.category+"/"+_1688+"/icon.png";
var _168b=dojo.moduleUrl("plugins.reactors",icon);
console.debug("icon_url = ",_168b);
_1679[_1687.category].insertNodes(false,[{reactor_type:_1688,src:_168b,alt:_1689["label"]}]);
}
});
d.callback();
return d;
};
pion.plugins.initLoadedPluginList().addCallback(pion.reactors.getAllReactorsInUIDirectory).addCallback(_1684).addCallback(pion.reactors._initConfiguredReactors);
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
var _168c=0;
var _168d=0;
setInterval(function(){
if(!_1673.checked&&pion.current_page=="Reactors"){
dojo.xhrGet({url:"/config/reactors/stats",preventCache:true,handleAs:"xml",timeout:1000,load:function(_168e,_168f){
var node=_168e.getElementsByTagName("TotalOps")[0];
var _1691=parseInt(dojo.isIE?node.xml.match(/.*>(\d*)<.*/)[1]:node.textContent);
var delta=_1691-_168c;
dojo.byId("global_ops").innerHTML=delta>0?delta:0;
_168c=_1691;
var _1693=0;
var _1694=_168e.getElementsByTagName("Reactor");
dojo.forEach(_1694,function(n){
var id=n.getAttribute("id");
var _1697=pion.reactors.reactors_by_id[id];
if(_1697){
if(_1697.workspace==pion.reactors.workspace_box){
var _1698=n.getElementsByTagName("EventsIn")[0];
var _1699=dojo.isIE?_1698.xml.match(/.*>(\d*)<.*/)[1]:_1698.textContent;
var _169a=parseInt(_1699);
_1697.ops_per_sec.innerHTML=_169a-_1697.prev_events_in;
_1697.prev_events_in=_169a;
_1693+=_169a;
}
var _169b=n.getElementsByTagName("Running")[0];
var _169c=dojo.isIE?_169b.xml.match(/.*>(\w*)<.*/)[1]:_169b.textContent;
var _169d=(_169c=="true");
_1697.run_button.attr("checked",_169d);
}
});
delta=_1693-_168d;
dojo.byId("workspace_ops").innerHTML=delta>0?delta:0;
_168d=_1693;
return _168e;
},error:pion.handleXhrGetError});
}
},1000);
}
};
pion.reactors._initConfiguredReactors=function(){
if(file_protocol){
addWorkspace();
pion.reactors.workspace_box=workspace_boxes[0];
surface=pion.reactors.workspace_box.my_surface;
dijit.byId("mainTabContainer").selectChild(pion.reactors.workspace_box.my_content_pane);
}else{
reactor_config_store=new dojox.data.XmlStore({url:"/config/reactors"});
pion.reactors.config_store=reactor_config_store;
reactor_config_store.fetch({query:{tagName:"Reactor"},onItem:function(item,_169f){
console.debug("fetched Reactor with id = ",reactor_config_store.getValue(item,"@id"));
var _16a0={};
var _16a1=reactor_config_store.getAttributes(item);
for(var i=0;i<_16a1.length;++i){
if(_16a1[i]!="tagName"&&_16a1[i]!="childNodes"){
_16a0[_16a1[i]]=reactor_config_store.getValue(item,_16a1[i]).toString();
}
}
pion.reactors.createReactorInConfiguredWorkspace(_16a0);
},onComplete:function(items,_16a4){
console.debug("done fetching Reactors");
reactor_config_store.fetch({query:{tagName:"Connection"},onItem:function(item,_16a6){
pion.reactors.createConnection(reactor_config_store.getValue(item,"From").toString(),reactor_config_store.getValue(item,"To").toString(),reactor_config_store.getValue(item,"@id").toString());
},onComplete:function(items,_16a8){
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
pion.reactors.connection_store=new dojox.data.XmlStore({url:"/config/connections"});
}
};
pion.reactors.createReactorInConfiguredWorkspace=function(_16a9){
pion.reactors.workspace_box=workspaces_by_name[_16a9.Workspace];
if(!pion.reactors.workspace_box){
addWorkspace(_16a9.Workspace);
}
var _16aa=pion.reactors.workspace_box;
dijit.byId("mainTabContainer").selectChild(_16aa.my_content_pane);
var _16ab=document.createElement("div");
_16aa.node.appendChild(_16ab);
var _16ac=pion.reactors.createReactor(_16a9,_16ab);
pion.reactors.reactors_by_id[_16a9["@id"]]=_16ac;
_16ac.workspace=_16aa;
_16aa.reactors.push(_16ac);
console.debug("X, Y = ",_16a9.X,", ",_16a9.Y);
};
pion.reactors.createConnection=function(_16ad,_16ae,_16af){
var _16b0=pion.reactors.reactors_by_id[_16ad];
var _16b1=pion.reactors.reactors_by_id[_16ae];
pion.reactors.workspace_box=_16b0.workspace;
var _16b2=pion.reactors.workspace_box;
surface=_16b2.my_surface;
dijit.byId("mainTabContainer").selectChild(_16b2.my_content_pane);
var line=surface.createPolyline().setStroke("black");
pion.reactors.updateConnectionLine(line,_16b0.domNode,_16b1.domNode);
_16b0.reactor_outputs.push({sink:_16b1,line:line,id:_16af});
_16b1.reactor_inputs.push({source:_16b0,line:line,id:_16af});
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
var _16b8=new dijit.layout.ContentPane({"class":"workspacePane",title:title,style:"overflow: auto"});
var _16b9=dijit.byId("mainTabContainer");
var _16ba=dojo.marginBox(_16b9.domNode);
console.debug("margin_box = dojo.marginBox(tab_container.domNode) = ",_16ba);
var shim=document.createElement("div");
if(_16ba.w<minimum_workspace_width){
shim.style.width=minimum_workspace_width+"px";
}else{
shim.style.width=(_16ba.w-4)+"px";
}
if(_16ba.h<minimum_workspace_height){
shim.style.height=minimum_workspace_height+"px";
}
_16b8.domNode.appendChild(shim);
_16b9.addChild(_16b8,i);
var _16bc=new dojo.dnd.Target(shim,{accept:["reactor"]});
dojo.addClass(_16bc.node,"workspaceTarget");
dojo.connect(_16bc,"onDndDrop",function(_16bd,nodes,copy,_16c0){
pion.reactors.handleDropOnWorkspace(_16bd,nodes,copy,_16bc);
});
dojo.connect(_16bc.node,"onmouseup",updateLatestMouseUpEvent);
_16bc.my_content_pane=_16b8;
_16bc.onEmpty=function(_16c1){
};
_16b8.my_workspace_box=_16bc;
workspaces_by_name[title]=_16bc;
workspace_boxes[i]=_16bc;
_16b9.selectChild(_16b8);
_16bc.node.style.width=_16bc.node.offsetWidth+"px";
var _16c2=dojo.marginBox(_16bc.node);
_16c2.h-=6;
console.debug("surface_box = ",_16c2);
_16bc.my_surface=dojox.gfx.createSurface(_16bc.node,_16c2.w,_16c2.h);
_16bc.reactors=[];
_16bc.isTracking=false;
var menu=new dijit.Menu({targetNodeIds:[_16b8.controlButton.domNode,_16bc.node]});
menu.addChild(new dijit.MenuItem({label:"Edit workspace configuration",onClick:function(){
showWorkspaceConfigDialog(_16b8);
}}));
menu.addChild(new dijit.MenuItem({label:"Delete workspace",onClick:function(){
deleteWorkspaceIfConfirmed(_16b8);
}}));
_16bc.node.ondblclick=function(){
showWorkspaceConfigDialog(_16b8);
};
_16b8.controlButton.domNode.ondblclick=function(){
showWorkspaceConfigDialog(_16b8);
};
};
function makeScrollHandler(_16c4){
var _pane=_16c4;
var _node=_16c4.domNode;
return function(){
if(_pane.isScrolling){
return;
}
_pane.isScrolling=true;
var _16c7=function(){
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
setTimeout(_16c7,0);
};
};
function updateLatestMouseUpEvent(e){
latest_event=e;
console.debug("e = ",e);
pion.reactors.last_x=e.clientX;
pion.reactors.last_y=e.clientY;
};
pion.reactors.getNearbyGridPointInBox=function(_16c9,_16ca){
var c=_16c9;
c.l+=STEP-1;
c.l-=c.l%STEP;
c.t+=STEP-1;
c.t-=c.t%STEP;
var _16cc={};
_16cc.l=_16ca.l<c.l?c.l:c.r<_16ca.l?c.r:_16ca.l;
_16cc.t=_16ca.t<c.t?c.t:c.b<_16ca.t?c.b:_16ca.t;
_16cc.l-=_16cc.l%STEP;
_16cc.t-=_16cc.t%STEP;
return _16cc;
};
pion.reactors.updateConnectionLine=function(poly,_16ce,_16cf){
var x1=_16ce.offsetLeft+_16ce.offsetWidth/2;
var y1=_16ce.offsetTop+_16ce.offsetHeight/2;
if(_16cf.offsetTop>y1){
var x2=_16cf.offsetLeft+_16cf.offsetWidth/2;
var y2=_16cf.offsetTop;
var a1={x:x2-5,y:y2-5};
var a2={x:x2+5,y:y2-5};
}else{
if(_16cf.offsetTop+_16cf.offsetHeight<y1){
var x2=_16cf.offsetLeft+_16cf.offsetWidth/2;
var y2=_16cf.offsetTop+_16cf.offsetHeight;
var a1={x:x2-5,y:y2+5};
var a2={x:x2+5,y:y2+5};
}else{
if(_16cf.offsetLeft>x1){
var x2=_16cf.offsetLeft;
var y2=y1;
var a1={x:x2-5,y:y2-5};
var a2={x:x2-5,y:y2+5};
}else{
var x2=_16cf.offsetLeft+_16cf.offsetWidth;
var y2=y1;
var a1={x:x2+5,y:y2-5};
var a2={x:x2+5,y:y2+5};
}
}
}
poly.setShape([{x:x1,y:y1},{x:x2,y:y1},{x:x2,y:y2},a1,{x:x2,y:y2},a2]).setStroke("black");
};
pion.reactors.createReactor=function(_16d6,node){
plugin_class_name="plugins.reactors."+_16d6.Plugin;
var _16d8=dojo.getObject(plugin_class_name);
if(_16d8){
console.debug("found class ",plugin_class_name);
var _16d9=new _16d8({config:_16d6},node);
}else{
console.debug("class ",plugin_class_name," not found; using plugins.reactors.Reactor instead.");
var _16d9=new plugins.reactors.Reactor({config:_16d6},node);
}
return _16d9;
};
pion.reactors.handleDropOnWorkspace=function(_16da,nodes,copy,_16dd){
console.debug("handleDropOnWorkspace called, target.node = ",_16dd.node,", workspace_box.node = ",pion.reactors.workspace_box.node);
dojo.query(".dojoDndItem",pion.reactors.workspace_box.node).forEach(function(n){
if(n.getAttribute("dndType")=="connector"){
console.debug("Removing ",n);
pion.reactors.workspace_box.node.removeChild(n);
}
});
if(!_16dd.checkAcceptance(_16da,nodes)){
return;
}
if(_16dd!=pion.reactors.workspace_box){
return;
}
var _16df=nodes[0].getAttribute("reactor_type");
pion.reactors.showReactorInitDialog(_16df);
};
pion.reactors.showReactorInitDialog=function(_16e0){
if(plugins.reactors[_16e0].edition=="Enterprise"){
pion.about.checkKeyStatus({success_callback:function(){
pion.reactors._showReactorInitDialog(_16e0);
}});
}else{
pion.reactors._showReactorInitDialog(_16e0);
}
};
pion.reactors._showReactorInitDialog=function(_16e1){
var _16e2="plugins.reactors."+_16e1+"InitDialog";
console.debug("dialog_class_name: ",_16e2);
var _16e3=dojo.getObject(_16e2);
if(_16e3){
var _16e4=new _16e3();
if(plugins.reactors[_16e1].option_defaults){
var _16e5=[];
for(var _16e6 in plugins.reactors[_16e1].option_defaults){
if(plugins.reactors[_16e1].option_defaults[_16e6]){
_16e5.push(_16e6);
}
}
_16e4.attr("value",{options:_16e5});
}
}else{
var _16e4=new plugins.reactors.ReactorInitDialog({title:plugins.reactors[_16e1].label+" Initialization",plugin:_16e1});
}
setTimeout(function(){
dojo.query("input",_16e4.domNode)[0].select();
},500);
dojo.query(".dijitButton.cancel",_16e4.domNode).forEach(function(n){
dojo.connect(n,"click",_16e4,"onCancel");
});
_16e4.show();
};
pion.reactors.handleDropOnReactor=function(_16e8,nodes,copy,_16eb){
var _16ec=pion.reactors.workspace_box;
console.debug("handleDropOnReactor called, target.node.getAttribute(\"reactor_type\") = ",_16eb.node.getAttribute("reactor_type"));
if(!_16eb.node.getAttribute("reactor_type")){
return;
}
dojo.query(".dojoDndItem",_16eb.node).forEach(function(n){
_16eb.node.removeChild(n);
});
if(_16ec.isTracking){
return;
}
console.debug("nodes[0].getAttribute(\"dndType\") = ",nodes[0].getAttribute("dndType"));
console.debug("nodes[0].getAttribute(\"reactor_type\") = ",nodes[0].getAttribute("reactor_type"));
if(nodes[0].getAttribute("dndType")!="connector"){
console.debug("returning because nodes[0].getAttribute(\"dndType\") != \"connector\"");
return;
}
_16ec.isTracking=true;
var x1=_16eb.node.offsetLeft+_16eb.node.offsetWidth;
var y1=_16eb.node.offsetTop+_16eb.node.offsetHeight/2;
console.debug("x1 = ",x1,", y1 = ",y1);
_16ec.trackLine=surface.createPolyline([{x:x1,y:y1},{x:x1+20,y:y1},{x:x1+15,y:y1-5},{x:x1+20,y:y1},{x:x1+15,y:y1+5}]).setStroke("black");
var _16f0=dojo.byId("reactor_config_content").offsetLeft;
var _16f1=dojo.byId("reactor_config_content").offsetTop;
_16f1+=dojo.byId("reactor_config").offsetTop;
console.debug("xOffset = ",_16f0,", yOffset = ",_16f1);
mouseConnection=dojo.connect(_16ec.node,"onmousemove",function(event){
var x2=event.clientX-_16f0;
var y2=event.clientY-_16f1;
_16ec.trackLine.setShape([{x:x1,y:y1},{x:x2,y:y1},{x:x2,y:y2}]);
});
console.debug("created mouseConnection");
wrapperWithStartpoint=function(event){
dojo.disconnect(mouseConnection);
console.debug("disconnected mouseConnection");
_16ec.trackLine.removeShape();
handleSelectionOfConnectorEndpoint(event,_16eb.node);
};
dojo.query(".moveable").filter(function(n){
return n!=_16eb.node;
}).forEach("item.onClickHandler = dojo.connect(item, 'click', wrapperWithStartpoint)");
};
function handleSelectionOfConnectorEndpoint(event,_16f8){
pion.reactors.workspace_box.isTracking=false;
console.debug("handleSelectionOfConnectorEndpoint: event = ",event);
var _16f9=dijit.byNode(_16f8);
console.debug("source_reactor = ",_16f9);
var _16fa=dijit.byNode(event.target);
if(!_16fa){
_16fa=dijit.byNode(event.target.parentNode);
}
console.debug("sink_reactor = ",_16fa);
dojo.query(".moveable").forEach("dojo.disconnect(item.onClickHandler)");
var _16fb="<PionConfig><Connection><Type>reactor</Type>"+"<From>"+_16f9.config["@id"]+"</From>"+"<To>"+_16fa.config["@id"]+"</To>"+"</Connection></PionConfig>";
dojo.rawXhrPost({url:"/config/connections",contentType:"text/xml",handleAs:"xml",postData:_16fb,load:function(_16fc){
var node=_16fc.getElementsByTagName("Connection")[0];
var id=node.getAttribute("id");
console.debug("connection id (from server): ",id);
var line=surface.createPolyline().setStroke("black");
pion.reactors.updateConnectionLine(line,_16f9.domNode,_16fa.domNode);
_16f9.reactor_outputs.push({sink:_16fa,line:line,id:id});
_16fa.reactor_inputs.push({source:_16f9,line:line,id:id});
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_16fb})});
};
pion.reactors.showReactorConfigDialog=function(_1700){
if(plugins.reactors[_1700.config.Plugin].edition=="Enterprise"){
pion.about.checkKeyStatus({success_callback:function(){
pion.reactors._showReactorConfigDialog(_1700);
}});
}else{
pion.reactors._showReactorConfigDialog(_1700);
}
};
pion.reactors._showReactorConfigDialog=function(_1701){
var _1702="plugins.reactors."+_1701.config.Plugin+"Dialog";
console.debug("dialog_class_name = ",_1702);
var _1703=dojo.getObject(_1702);
if(_1703){
var _1704=new _1703({reactor:_1701});
}else{
var _1704=new plugins.reactors.ReactorDialog({title:_1701.config.Plugin+" Configuration",reactor:_1701});
}
_1704.attr("value",_1701.config);
var _1705=new dojo.data.ItemFileWriteStore({data:{identifier:"ID",items:[]}});
dojo.forEach(_1701.reactor_inputs,function(_1706){
_1705.newItem({ID:_1706.id,Source:_1706.source.config.Name,DeleteButton:"yes"});
});
pion.reactors.connection_store.fetch({query:{"To":_1701.config["@id"],"Type":"input"},onItem:function(item){
var _1708=pion.reactors.connection_store.getValue(item,"From");
var _1709=pion.reactors.connection_store.getValue(item,"@id");
_1705.newItem({ID:_1709,Source:_1708});
},onError:pion.handleFetchError});
var _170a=function(v){
if(v=="yes"){
return "<button dojoType=dijit.form.Button class=\"delete_row\"><img src=\"images/icon-delete.png\" alt=\"DELETE\" border=\"0\" /></button>";
}else{
return "";
}
};
var _170c=[{rows:[{field:"Source",name:"From",styles:"",width:"auto"},{field:"ID",name:"Connection ID",styles:"",width:"auto"},{field:"DeleteButton",name:"Delete",styles:"align: center;",width:3,formatter:_170a}]}];
var _170d=new dojox.grid.DataGrid({store:_1705,structure:_170c,singleClickEdit:true,autoHeight:true},document.createElement("div"));
_1704.reactor_inputs_grid_node.appendChild(_170d.domNode);
_170d.startup();
_170d.connect(_170d,"onCellClick",function(e){
if(e.cell.name=="Delete"){
var item=this.getItem(e.rowIndex);
if(this.store.hasAttribute(item,"DeleteButton")){
this.store.deleteItem(item);
var _1710=_1701.reactor_inputs[e.rowIndex];
dojo.xhrDelete({url:"/config/connections/"+_1710.id,handleAs:"xml",timeout:5000,load:function(_1711,_1712){
var _1713=_1710.source;
_1710.line.removeShape();
_1701.reactor_inputs.splice(e.rowIndex,1);
for(var j=0;j<_1713.reactor_outputs.length;++j){
if(_1713.reactor_outputs[j].sink==_1701){
_1713.reactor_outputs.splice(j,1);
break;
}
}
return _1711;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
}
}
});
var _1715=new dojo.data.ItemFileWriteStore({data:{identifier:"ID",items:[]}});
dojo.forEach(_1701.reactor_outputs,function(_1716){
_1715.newItem({ID:_1716.id,Sink:_1716.sink.config.Name,DeleteButton:"yes"});
});
pion.reactors.connection_store.fetch({query:{"From":_1701.config["@id"],"Type":"output"},onItem:function(item){
var sink=pion.reactors.connection_store.getValue(item,"To");
var _1719=pion.reactors.connection_store.getValue(item,"@id");
_1715.newItem({ID:_1719,Sink:sink});
},onError:pion.handleFetchError});
var _171a=[{rows:[{field:"Sink",name:"To",styles:"",width:"auto"},{field:"ID",name:"Connection ID",styles:"",width:"auto"},{field:"DeleteButton",name:"Delete",styles:"align: center;",width:3,formatter:_170a}]}];
var _171b=new dojox.grid.DataGrid({store:_1715,structure:_171a,singleClickEdit:true,autoHeight:true},document.createElement("div"));
_1704.reactor_outputs_grid_node.appendChild(_171b.domNode);
_171b.startup();
_171b.connect(_171b,"onCellClick",function(e){
if(e.cell.name=="Delete"){
var item=this.getItem(e.rowIndex);
if(this.store.hasAttribute(item,"DeleteButton")){
this.store.deleteItem(item);
var _171e=_1701.reactor_outputs[e.rowIndex];
dojo.xhrDelete({url:"/config/connections/"+_171e.id,handleAs:"xml",timeout:5000,load:function(_171f,_1720){
var _1721=_171e.sink;
_171e.line.removeShape();
_1701.reactor_outputs.splice(e.rowIndex,1);
for(var j=0;j<_1721.reactor_inputs.length;++j){
if(_1721.reactor_inputs[j].source==_1701){
_1721.reactor_inputs.splice(j,1);
break;
}
}
return _171f;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
}
}
});
dojo.query(".dijitButton.delete",_1704.domNode).forEach(function(n){
dojo.connect(n,"click",function(){
_1704.onCancel();
pion.reactors.deleteReactorIfConfirmed(_1701);
});
});
dojo.query(".dijitButton.cancel",_1704.domNode).forEach(function(n){
dojo.connect(n,"click",_1704,"onCancel");
});
dojo.query(".dijitButton.save",_1704.domNode).forEach(function(n){
dijit.byNode(n).onClick=function(){
return _1704.isValid();
};
});
setTimeout(function(){
dojo.query("input",_1704.domNode)[0].select();
},500);
setTimeout(function(){
_1704.show();
},1000);
};
pion.reactors.showXMLDialog=function(_1726){
window.open("/config/reactors/"+_1726.config["@id"]);
};
pion.reactors.deleteReactorIfConfirmed=function(_1727){
pion.doDeleteConfirmationDialog("Are you sure you want to delete this reactor?",deleteReactor,_1727);
};
function deleteReactor(_1728){
console.debug("deleting ",_1728.config.Name);
dojo.xhrDelete({url:"/config/reactors/"+_1728.config["@id"],handleAs:"xml",timeout:5000,load:function(_1729,_172a){
console.debug("xhrDelete for url = /config/reactors/",_1728.config["@id"],"; HTTP status code: ",_172a.xhr.status);
for(var i=0;i<_1728.reactor_inputs.length;++i){
var _172c=_1728.reactor_inputs[i].source;
_1728.reactor_inputs[i].line.removeShape();
for(var j=0;j<_172c.reactor_outputs.length;++j){
if(_172c.reactor_outputs[j].sink==_1728){
_172c.reactor_outputs.splice(j,1);
}
}
}
for(var i=0;i<_1728.reactor_outputs.length;++i){
var _172e=_1728.reactor_outputs[i].sink;
_1728.reactor_outputs[i].line.removeShape();
for(var j=0;j<_172e.reactor_inputs.length;++j){
if(_172e.reactor_inputs[j].source==_1728){
_172e.reactor_inputs.splice(j,1);
}
}
}
var _172f=pion.reactors.workspace_box;
_172f.node.removeChild(_1728.domNode);
for(var j=0;j<_172f.reactors.length;++j){
if(_172f.reactors[j]==_1728){
_172f.reactors.splice(j,1);
}
}
if(_172f.reactors.length==0){
_172f.onEmpty(_172f.my_content_pane);
}
return _1729;
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
var _1731=pion.reactors.workspace_box;
var _1732=_1731.my_content_pane.domNode.offsetWidth;
var _1733=_1731.my_content_pane.domNode.offsetHeight;
_1732-=2;
_1733-=6;
var _1734=surface.getDimensions();
var _1735=parseInt(_1734.width);
var _1736=parseInt(_1734.height);
console.debug("old_width = ",_1735,", new_width = ",_1732,", old_height = ",_1736,", new_height = ",_1733);
if(_1732>_1735){
console.debug("expanding workspace width to ",_1732,"px");
_1731.node.style.width=_1732+"px";
_1734.width=_1732;
}
if(_1733>_1736){
console.debug("expanding workspace height to ",_1733,"px");
_1731.node.style.height=_1733+"px";
_1734.height=_1733;
}
if(_1732>_1735||_1733>_1736){
surface.setDimensions(parseInt(_1734.width)+"px",parseInt(_1734.height)+"px");
}
};
function handleKeyPress(e){
var _1738=pion.reactors.workspace_box;
if(e.keyCode==dojo.keys.ESCAPE){
if(_1738.isTracking){
dojo.disconnect(mouseConnection);
_1738.trackLine.removeShape();
_1738.isTracking=false;
}
}
};
function showWorkspaceConfigDialog(_1739){
var _173a=pion.reactors.workspace_dialog;
if(!_173a){
_173a=new pion.reactors.WorkspaceDialog({title:"Workspace Configuration"});
_173a.workspace_name.isValid=function(_173b){
if(!this.validator(this.textbox.value,this.constraints)){
this.invalidMessage="Invalid Workspace name";
console.debug("validationTextBox.isValid returned false");
return false;
}
if(isDuplicateWorkspaceName(_1739,this.textbox.value)){
this.invalidMessage="A Workspace with this name already exists";
console.debug("In validationTextBox.isValid, isDuplicateWorkspaceName returned true");
return false;
}
console.debug("validationTextBox.isValid returned true");
return true;
};
_173a.save_button.onClick=function(){
return _173a.isValid();
};
pion.reactors.workspace_dialog=_173a;
}
_173a.attr("value",{name:_1739.title,comment:_1739.comment});
_173a.workspace_pane=_1739;
setTimeout(function(){
dojo.query("input",_173a.domNode)[0].select();
},500);
_173a.show();
_173a.execute=function(_173c){
updateWorkspaceConfig(_173c,_1739);
};
};
function updateWorkspaceConfig(_173d,_173e){
var _173f=_173d.name;
if(_173f!=_173e.title){
_173e.title=_173f;
dojo.byId(_173e.controlButton.id).innerHTML=_173f;
dojo.forEach(_173e.my_workspace_box.reactors,function(_1740){
_1740.changeWorkspace(_173f);
});
}
_173e.comment=_173d.comment;
};
function isDuplicateWorkspaceName(_1741,name){
for(var i=0;i<workspace_boxes.length;++i){
if(workspace_boxes[i].my_content_pane!=_1741&&workspace_boxes[i].my_content_pane.title==name){
return true;
}
}
return false;
};
function deleteWorkspaceIfConfirmed(_1744){
if(_1744.my_workspace_box.reactors.length==0){
_deleteEmptyWorkspace(_1744);
return;
}
pion.doDeleteConfirmationDialog("Are you sure you want to delete workspace '"+_1744.title+"' and all the reactors it contains?",deleteWorkspace,_1744);
};
function deleteWorkspace(_1745){
var _1746=[];
for(var i=0;i<_1745.my_workspace_box.reactors.length;++i){
_1746[i]=_1745.my_workspace_box.reactors[i];
}
for(i=0;i<_1746.length;++i){
deleteReactor(_1746[i]);
}
dojo.connect(_1745.my_workspace_box,"onEmpty",_deleteEmptyWorkspace);
};
function _deleteEmptyWorkspace(_1748){
console.debug("deleting ",_1748.title);
delete workspaces_by_name[_1748.title];
for(var j=0;j<workspace_boxes.length;++j){
if(workspace_boxes[j]==_1748.my_workspace_box){
workspace_boxes.splice(j,1);
}
}
dijit.byId("mainTabContainer").removeChild(_1748);
};
dojo.declare("pion.reactors.WorkspaceDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog database_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Workspace Configuration</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.ValidationTextBox\" dojoAttachPoint=\"workspace_name\" type=\"text\" name=\"name\"\r\n\t\t\t\t\t regExp=\".+\" required=\"true\"/></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t\t><div class=\"save_cancel_delete\"\r\n\t\t\t><button dojoType=dijit.form.Button class=\"save\" dojoAttachPoint=\"save_button\" type=\"submit\">Save</button\r\n\t\t\t><button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: onCancel\">Cancel</button\r\n\t\t\t><button dojoType=dijit.form.Button class=\"delete\" dojoAttachEvent=\"onClick: _handleDelete\">Delete</button\r\n\t\t></div\r\n\t></div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,_handleDelete:function(){
this.onCancel();
deleteWorkspaceIfConfirmed(this.workspace_pane);
}});
}
if(!dojo._hasResource["plugins.vocabularies.Vocabulary"]){
dojo._hasResource["plugins.vocabularies.Vocabulary"]=true;
dojo.provide("plugins.vocabularies.Vocabulary");
dojo.declare("plugins.vocabularies.Vocabulary",[],{constructor:function(_174a,args){
this.config=_174a;
dojo.mixin(this,args);
this.url="/config/vocabularies/"+this.config["@id"];
this.server_vocab_store=new dojox.data.XmlStore({url:this.url,attributeMap:{"Vocabulary.id":"@id"}});
this.server_vocab_term_store=new dojox.data.XmlStore({url:this.url,rootItem:"Term",attributeMap:{"Term.id":"@id"}});
this.vocab_term_store=new dojo.data.ItemFileWriteStore({data:{identifier:"ID",items:[]}});
this.vocab_term_store._saveCustom=this._getSaveCustomFunction();
},saveChangedTerms:function(){
var h=dojo.connect(this,"onSaveComplete",function(){
dojo.disconnect(h);
pion.terms.buildMapOfCategoriesByTerm();
});
this.vocab_term_store.save({});
},populateFromServerVocabStore:function(){
var _this=this;
this.server_vocab_store.fetch({query:{"tagName":"Vocabulary"},onComplete:function(items,_174f){
console.debug("server_vocab_store.fetch.onComplete: items.length = ",items.length);
_this.vocab_item=items[0];
_this.populateFromServerVocabItem();
},onError:pion.handleFetchError});
},populateFromServerVocabItem:function(){
var name=this.server_vocab_store.getValue(this.vocab_item,"Name");
if(name){
this.config.Name=name.toString();
}
var _1751=this.server_vocab_store.getValue(this.vocab_item,"Comment");
if(_1751){
this.config.Comment=_1751.toString();
}
var _1752=this.server_vocab_store.getValue(this.vocab_item,"Locked");
this.config.Locked=(typeof _1752!=="undefined")&&_1752.toString()=="true";
console.dir(this.config);
var store=this.server_vocab_term_store;
var items=[];
var _this=this;
store.fetch({onItem:function(item){
var _1757={full_id:store.getValue(item,"@id"),ID:store.getValue(item,"@id").split("#")[1]};
var type=store.getValue(item,"Type");
_1757.Type=pion.terms.type_descriptions_by_name[type.toString()];
_1757.Format=store.getValue(type,"@format");
_1757.Size=store.getValue(type,"@size");
var _1759=store.getValue(item,"Comment");
if(_1759){
_1757.Comment=_1759.toString();
}
items.push(_1757);
},onComplete:function(){
_this.vocab_term_store=new dojo.data.ItemFileWriteStore({data:{identifier:"ID",items:items}});
_this.vocab_term_store._saveCustom=_this._getSaveCustomFunction();
_this.onDoneLoadingTerms();
},onError:pion.handleFetchError});
},onDoneLoadingTerms:function(){
},_getSaveCustomFunction:function(){
var _this=this;
return function(_175b,_175c){
var store=this;
var _175e=0,_175f=0;
var ID,url;
for(ID in this._pending._modifiedItems){
if(this._pending._newItems[ID]||this._pending._deletedItems[ID]){
continue;
}
url=dojox.dtl.filter.strings.urlencode("/config/terms/"+_this.config["@id"]+"#"+ID);
console.debug("_saveCustom: url = ",url);
this.fetchItemByIdentity({identity:ID,onItem:function(item){
var _1763="<PionConfig><Term><Type";
var _1764=store.getValue(item,"Format");
if(_1764&&_1764!="-"){
_1763+=" format=\""+pion.escapeXml(_1764)+"\"";
}
var size=store.getValue(item,"Size");
if(size&&size!="-"){
_1763+=" size=\""+pion.escapeXml(size)+"\"";
}
_1763+=">"+pion.terms.types_by_description[store.getValue(item,"Type")]+"</Type>";
if(store.getValue(item,"Comment")){
_1763+=pion.makeXmlLeafElement("Comment",store.getValue(item,"Comment"));
}
_1763+="</Term></PionConfig>";
console.debug("put_data = ",_1763);
_175e++;
dojo.rawXhrPut({url:url,handleAs:"xml",timeout:5000,contentType:"text/xml",putData:_1763,load:function(_1766,_1767){
console.debug("rawXhrPut for url = "+this.url,"; HTTP status code: ",_1767.xhr.status);
if(++_175f==_175e){
_this.onSaveComplete();
}
return _1766;
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_1763})});
},onError:pion.handleFetchError});
}
for(ID in this._pending._newItems){
url=dojox.dtl.filter.strings.urlencode("/config/terms/"+_this.config["@id"]+"#"+ID);
console.debug("_saveCustom: url = ",url);
var item=this._pending._newItems[ID];
var _1769="<PionConfig><Term><Type";
var _176a=store.getValue(item,"Format");
if(_176a&&_176a!="-"){
_1769+=" format=\""+pion.escapeXml(_176a)+"\"";
}
var size=store.getValue(item,"Size");
if(size&&size!="-"){
_1769+=" size=\""+pion.escapeXml(size)+"\"";
}
_1769+=">"+pion.terms.types_by_description[store.getValue(item,"Type")]+"</Type>";
if(store.getValue(item,"Comment")){
_1769+=pion.makeXmlLeafElement("Comment",store.getValue(item,"Comment"));
}
_1769+="</Term></PionConfig>";
console.debug("post_data = ",_1769);
_175e++;
dojo.rawXhrPost({url:url,handleAs:"xml",timeout:5000,contentType:"text/xml",postData:_1769,load:function(_176c,_176d){
console.debug("rawXhrPost for url = "+this.url,"; HTTP status code: ",_176d.xhr.status);
if(++_175f==_175e){
_this.onSaveComplete();
}
return _176c;
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1769})});
}
for(ID in this._pending._deletedItems){
url=dojox.dtl.filter.strings.urlencode("/config/terms/"+_this.config["@id"]+"#"+ID);
console.debug("_saveCustom: url = ",url);
_175e++;
dojo.xhrDelete({url:url,handleAs:"xml",timeout:5000,load:function(_176e,_176f){
console.debug("xhrDelete for url = "+this.url,"; HTTP status code: ",_176f.xhr.status);
if(++_175f==_175e){
_this.onSaveComplete();
}
return _176e;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
}
_175b();
};
},onSaveComplete:function(){
}});
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
dojo.declare("plugins.vocabularies.TermInitDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog vocabulary_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Term Initialization</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t><td><input dojoAttachPoint=\"id_widget\" dojoType=\"dijit.form.ValidationTextBox\" type=\"text\" name=\"@id\"\r\n\t\t\t\t\t regExp=\"[\\w-]+\" required=\"true\"></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Type:</label></td\r\n\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"Type\" dojoAttachEvent=\"onChange: _handleTypeChange\"\r\n\t\t\t\t\t\tstore=\"pion.terms.type_store\" searchAttr=\"description\" /></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Format:</label></td\r\n\t\t\t\t><td><input dojoAttachPoint=\"format_widget\" dojoType=\"dijit.form.ValidationTextBox\" type=\"text\" name=\"Format\" disabled=\"true\" \r\n\t\t\t\t\t regExp=\".*%.*\"></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Size:</label></td\r\n\t\t\t\t><td><input dojoAttachPoint=\"size_widget\" dojoType=\"dijit.form.ValidationTextBox\" type=\"text\" name=\"Size\" disabled=\"true\" \r\n\t\t\t\t\t regExp=\"[1-9][0-9]*\"></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t></div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" dojoAttachPoint=\"save_button\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: onCancel\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
this.id_widget.isValid=function(){
if(!this.validator(this.textbox.value,this.constraints)){
this.invalidMessage="Invalid Term ID";
return false;
}
return true;
};
this.format_widget.isValid=function(){
if(!this.validator(this.textbox.value,this.constraints)){
this.invalidMessage="Invalid format.";
return false;
}
return true;
};
this.size_widget.isValid=function(){
if(!this.validator(this.textbox.value,this.constraints)){
this.invalidMessage="Must be a positive integer.";
return false;
}
return true;
};
},_handleTypeChange:function(type){
console.debug("_handleTypeChange: type = ",type);
if(type=="specific date"||type=="specific time"||type=="specific time & date"){
this.format_widget.attr("disabled",false);
this.format_widget.attr("value","%Y");
this.format_widget.domNode.style.visibility="visible";
}else{
this.format_widget.attr("disabled",true);
this.format_widget.attr("value","");
this.format_widget.domNode.style.visibility="hidden";
}
if(type=="fixed-length string"){
this.size_widget.attr("disabled",false);
this.size_widget.attr("value","1");
this.size_widget.domNode.style.visibility="visible";
}else{
this.size_widget.attr("disabled",true);
this.size_widget.attr("value","");
this.size_widget.domNode.style.visibility="hidden";
}
},execute:function(_1772){
var _1773={ID:_1772["@id"],Type:_1772.Type,Comment:_1772.Comment};
_1773.Format=_1772.Format?_1772.Format:"-";
_1773.Size=_1772.Size?_1772.Size:"-";
this.vocabulary.vocab_term_store.newItem(_1773);
if(this.pane){
this.pane.markAsChanged();
}else{
this.vocabulary.saveChangedTerms();
if(this.onNewTermSaved){
this.onNewTermSaved(this.vocabulary.config["@id"]+"#"+_1773.ID);
}
}
}});
dojo.declare("plugins.vocabularies.VocabularyPane",[dijit.layout.AccordionPane],{templateString:"<div class='dijitAccordionPane vocab_pane'\r\n\t><div dojoAttachPoint='titleNode,focusNode' dojoAttachEvent='ondijitclick:_onTitleClick,onkeypress:_onTitleKeyPress,onfocus:_handleFocus,onblur:_handleFocus'\r\n\t\tclass='dijitAccordionTitle' wairole=\"tab\"\r\n\t\t><div class='dijitAccordionArrow'></div\r\n\t\t><div class='arrowTextUp' waiRole=\"presentation\">&#9650;</div\r\n\t\t><div class='arrowTextDown' waiRole=\"presentation\">&#9660;</div\r\n\t\t><div dojoAttachPoint='titleTextNode' class='dijitAccordionText'>${title}</div></div\r\n\t><div\r\n\t\t><div dojoAttachPoint='containerNode' style='overflow: hidden; height: 1px; display: none'\r\n\t\t\tclass='dijitAccordionBody' wairole=\"tabpanel\"\r\n\t\t\t><form dojoAttachPoint=\"form\" dojoType=\"dijit.form.Form\"\r\n\t\t\t\t><br/\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"100%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Name</label></td\r\n\t\t\t\t\t\t><td><input dojoAttachPoint=\"name\" dojoType=\"dijit.form.TextBox\" name=\"Name\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td rowspan=\"4\" valign=\"top\" width=\"20\">&nbsp;</td\r\n\t\t\t\t\t\t><td rowspan=\"1\"><label>Comments</label></td\r\n\t\t\t\t\t\t><td rowspan=\"4\" valign=\"top\"><textarea dojoAttachPoint=\"comment\" rows=\"4\" style=\"width: 95%\" name=\"Comment\" class=\"comment\"></textarea></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>ID</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td rowspan=\"3\">&nbsp;</td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Locked</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"checkboxes\" value=\"locked\"/></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><br/\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" style=\"border: 1px solid #999999;\" width=\"99%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td class=\"matrixMainHeader\">Terms</td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td style=\"background-color: #f1f1f1;\"\r\n\t\t\t\t\t\t\t><div class=\"vocab_grid plugin_pane_grid\" dojoAttachPoint=\"vocab_term_grid_node\"></div\r\n\t\t\t\t\t\t\t><button dojoType=dijit.form.Button class=\"add_new_row\" dojoAttachPoint=\"add_new_term_button\" dojoAttachEvent=\"onClick:_handleAddNewTerm\">ADD NEW TERM</button\r\n\t\t\t\t\t\t></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><hr noshade=\"noshade\" size=\"1\" color=\"#999999\"\r\n\t\t\t\t><div class=\"save_cancel_delete\"\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick:save\">Save Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick:cancel\">Cancel Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"delete\" dojoAttachEvent=\"onClick:delete2\">Delete Vocabulary</button\r\n\t\t\t\t></div\r\n\t\t\t></form\r\n\t\t></div\r\n\t></div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
var _this=this;
this.vocabulary=new plugins.vocabularies.Vocabulary(this.config);
this.initGrid();
dojo.query("input",this.domNode).forEach(function(n){
dojo.connect(n,"change",_this,_this.markAsChanged);
});
dojo.query("textarea",this.domNode).forEach(function(n){
dojo.connect(n,"change",_this,_this.markAsChanged);
});
},initGrid:function(){
var _this=this;
this.vocab_grid_layout=[{defaultCell:{editable:true,type:dojox.grid.cells._Widget,styles:"text-align: left;"},rows:[{field:"ID",name:"ID",width:15,editable:false},{field:"Type",name:"Type",width:15,widgetClass:"pion.widgets.SimpleSelect",widgetProps:{store:pion.terms.type_store,searchAttr:"description"}},{field:"Format",name:"Format",width:10},{field:"Size",name:"Size",width:3},{field:"Comment",name:"Comment",width:"auto",formatter:pion.xmlCellFormatter},{name:"Delete",styles:"align: center;",width:3,editable:false,formatter:pion.makeDeleteButton}]}];
this.vocab_term_grid=new dojox.grid.DataGrid({store:this.vocabulary.vocab_term_store,structure:this.vocab_grid_layout,singleClickEdit:true},document.createElement("div"));
this.vocab_term_grid_node.appendChild(this.vocab_term_grid.domNode);
this.vocab_term_grid.startup();
this.vocab_term_grid.connect(this.vocab_term_grid,"onCellClick",function(e){
if(_this.vocabulary.config.Locked){
return;
}
if(e.cell.name=="Delete"){
this.store.deleteItem(this.getItem(e.rowIndex));
dojo.addClass(_this.domNode,"unsaved_changes");
}
});
dojo.connect(this.vocab_term_grid,"onApplyCellEdit",this,_this.markAsChanged);
this.vocab_term_grid.canEdit=function(cell,_177a){
if(_this.vocabulary.config.Locked){
return false;
}else{
switch(cell.field){
case "Format":
var item=this.getItem(_177a);
var type=this.store.getValue(item,"Type").toString();
return (type=="specific date"||type=="specific time"||type=="specific time & date");
case "Size":
var item=this.getItem(_177a);
var type=this.store.getValue(item,"Type").toString();
return (type=="fixed-length string");
default:
return true;
}
}
};
},populateFromServerVocabStore:function(){
var _this=this;
var h=dojo.connect(this.vocabulary,"onDoneLoadingTerms",function(){
dojo.disconnect(h);
_this.name.attr("readOnly",_this.vocabulary.config.Locked);
_this.comment.disabled=_this.vocabulary.config.Locked;
_this.add_new_term_button.attr("disabled",_this.vocabulary.config.Locked);
var _177f=_this.vocab_term_grid.layout.cellCount-1;
_this.vocab_term_grid.layout.setColumnVisibility(_177f,!_this.vocabulary.config.Locked);
var _1780=dojo.clone(_this.vocabulary.config);
_1780.checkboxes=_this.vocabulary.config.Locked?["locked"]:[];
_this.form.attr("value",_1780);
var _1781=dojo.query("textarea.comment",_this.form.domNode)[0];
_1781.value=_this.vocabulary.config.Comment?_this.vocabulary.config.Comment:"";
_this.title=_this.vocabulary.config.Name?_this.vocabulary.config.Name:_this.vocabulary.config["@id"];
var _1782=dojo.query(".dijitAccordionTitle .dijitAccordionText",_this.domNode)[0];
_1782.firstChild.nodeValue=_this.title;
_this.vocab_term_grid.setStore(_this.vocabulary.vocab_term_store);
var node=_this.domNode;
setTimeout(function(){
dojo.removeClass(node,"unsaved_changes");
},500);
});
this.vocabulary.populateFromServerVocabStore();
},_handleAddNewTerm:function(){
console.debug("_handleAddNewTerm");
var _1784=new plugins.vocabularies.TermInitDialog({vocabulary:this.vocabulary,pane:pion.vocabularies.selected_pane});
_1784.save_button.onClick=function(){
return _1784.isValid();
};
setTimeout(function(){
dojo.query("input",_1784.domNode)[0].select();
},500);
_1784.show();
},save:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
this.saveVocabConfig();
this.vocabulary.saveChangedTerms();
},saveVocabConfig:function(){
var _this=this;
var _1786=this.form.attr("value");
this.vocabulary.config.Name=_1786.Name;
this.vocabulary.config.Locked=dojo.indexOf(_1786.checkboxes,"locked")>=0;
var _1787=dojo.query("textarea.comment",this.form.domNode)[0];
this.vocabulary.config.Comment=_1787.value;
var _1788="<PionConfig><Vocabulary>";
for(var tag in this.vocabulary.config){
if(tag!="@id"){
_1788+=pion.makeXmlLeafElement(tag,this.vocabulary.config[tag]);
}
}
_1788+="</Vocabulary></PionConfig>";
console.debug("put_data: ",_1788);
_this=this;
dojo.rawXhrPut({url:"/config/vocabularies/"+this.vocabulary.config["@id"],contentType:"text/xml",handleAs:"xml",putData:_1788,load:function(_178a){
console.debug("response: ",_178a);
_this.populateFromServerVocabStore();
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_1788})});
},cancel:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
this.vocabulary.vocab_term_store.revert();
this.populateFromServerVocabStore();
},delete2:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
console.debug("delete2: selected vocabulary is ",this.title);
_this=this;
dojo.xhrDelete({url:"/config/vocabularies/"+this.vocabulary.config["@id"],handleAs:"xml",timeout:5000,load:function(_178b,_178c){
console.debug("xhrDelete for url = "+this.url,"; HTTP status code: ",_178c.xhr.status);
dijit.byId("vocab_config_accordion").forward();
dijit.byId("vocab_config_accordion").removeChild(_this);
pion.vocabularies._adjustAccordionSize();
return _178b;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
},markAsChanged:function(){
console.debug("markAsChanged");
dojo.addClass(this.domNode,"unsaved_changes");
}});
}
if(!dojo._hasResource["pion.vocabularies"]){
dojo._hasResource["pion.vocabularies"]=true;
dojo.provide("pion.vocabularies");
pion.vocabularies.vocabularies_by_id={};
pion.vocabularies.getHeight=function(){
return pion.vocabularies.height;
};
pion.vocabularies._adjustAccordionSize=function(){
var _178d=dijit.byId("vocab_config_accordion");
var _178e=_178d.getChildren().length;
console.debug("num_vocabs = "+_178e);
var _178f=450;
var _1790=0;
if(_178e>0){
var _1791=_178d.getChildren()[0];
var _1790=_1791.getTitleHeight();
}
var _1792=_178f+_178e*_1790;
_178d.resize({h:_1792});
pion.vocabularies.height=_1792+160;
dijit.byId("main_stack_container").resize({h:pion.vocabularies.height});
};
pion.vocabularies.isDuplicateVocabularyId=function(id){
var _1794="urn:vocab:"+id;
return (_1794 in pion.vocabularies.vocabularies_by_id);
};
pion.vocabularies.isDuplicateVocabularyName=function(name){
if(dijit.byId("vocab_config_accordion")){
var _1796=dijit.byId("vocab_config_accordion").getChildren();
for(var i=0;i<_1796.length;++i){
if(_1796[i].title==name){
return true;
}
}
}
return false;
};
pion.vocabularies.addNewVocabulary=function(){
var _1798=new plugins.vocabularies.VocabularyInitDialog();
dojo.query(".dijitButton.save",_1798.domNode).forEach(function(n){
dijit.byNode(n).onClick=function(){
return _1798.isValid();
};
});
setTimeout(function(){
dojo.query("input",_1798.domNode)[0].select();
},500);
_1798.show();
_1798.execute=function(_179a){
var _179b="<PionConfig><Vocabulary>";
_179b+=pion.makeXmlLeafElement("Name",_179a.Name);
_179b+=pion.makeXmlLeafElement("Comment",_179a.Comment);
_179b+="</Vocabulary></PionConfig>";
console.debug("post_data: ",_179b);
var _179c="urn:vocab:"+_179a["@id"];
dojo.rawXhrPost({url:"/config/vocabularies/"+_179c,contentType:"text/xml",handleAs:"xml",postData:_179b,load:function(_179d){
if(vocab_config_page_initialized){
pion.vocabularies.createNewPaneFromStore(_179c,pion.current_page=="Vocabularies");
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_179b})});
};
};
pion.vocabularies.config_store=new dojox.data.XmlStore({url:"/config/vocabularies",rootItem:"VocabularyConfig",attributeMap:{"VocabularyConfig.id":"@id"}});
pion.vocabularies.init=function(){
var _179e=null;
var _179f=["@id","Type","@format","Size","Comment"];
var _17a0=_179f.length;
function _paneSelected(pane){
console.debug("Selected "+pane.title);
if(pane==_179e){
return;
}
if(_179e&&dojo.hasClass(_179e.domNode,"unsaved_changes")){
var _17a2=new dijit.Dialog({title:"Warning: unsaved changes"});
_17a2.attr("content","Please save or cancel unsaved changes before selecting another Vocabulary.");
_17a2.show();
setTimeout(function(){
dijit.byId("vocab_config_accordion").selectChild(_179e);
},500);
return;
}
_179e=pane;
pion.vocabularies.selected_pane=_179e;
pane.populateFromServerVocabStore();
};
dojo.subscribe("vocab_config_accordion-selectChild",_paneSelected);
pion.vocabularies.createNewPaneFromItem=function(item){
var id=pion.vocabularies.config_store.getValue(item,"@id");
var title=id;
var _17a6=document.createElement("span");
var _17a7=new plugins.vocabularies.VocabularyPane({"class":"vocab_pane",title:title,config:{"@id":id}},_17a6);
dijit.byId("vocab_config_accordion").addChild(_17a7);
return _17a7;
};
pion.vocabularies.createNewPaneFromStore=function(id,_17a9){
pion.vocabularies.config_store.fetch({query:{"@id":id},onItem:function(item){
var _17ab=pion.vocabularies.createNewPaneFromItem(item);
if(_17a9){
pion.vocabularies._adjustAccordionSize();
dijit.byId("vocab_config_accordion").selectChild(_17ab);
}
},onError:pion.handleFetchError});
};
pion.vocabularies.config_store.fetch({onComplete:function(items,_17ad){
var _17ae=dijit.byId("vocab_config_accordion");
pion.vocabularies.vocabularies_by_id={};
for(var i=0;i<items.length;++i){
var _17b0=pion.vocabularies.createNewPaneFromItem(items[i]);
var id=_17b0.vocabulary.config["@id"];
pion.vocabularies.vocabularies_by_id[id]=_17b0.vocabulary;
}
pion.vocabularies._adjustAccordionSize();
var _17b2=_17ae.getChildren()[0];
_17ae.selectChild(_17b2);
},onError:pion.handleFetchError});
dojo.connect(dojo.byId("add_new_vocab_button"),"click",pion.vocabularies.addNewVocabulary);
};
}
if(!dojo._hasResource["plugins.protocols.Protocol"]){
dojo._hasResource["plugins.protocols.Protocol"]=true;
dojo.provide("plugins.protocols.Protocol");
dojo.declare("plugins.protocols.ProtocolInitDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog protocol_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Protocol Initialization</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Plugin&nbsp;Type</label></td\r\n\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"Plugin\" \r\n\t\t\t\t\t\tstore=\"pion.protocols.plugin_data_store\" searchAttr=\"label\" \r\n\t\t\t\t\t\tstyle=\"width: 100%;\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Event&nbsp;Type</label></td\r\n\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"EventType\" query=\"{Type: 'object'}\" \r\n\t\t\t\t\t\tstore=\"pion.terms.store\" searchAttr=\"id\" /></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t></div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: hide\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true});
dojo.declare("plugins.protocols.ProtocolPane",[dijit.layout.AccordionPane],{templateString:"<div class='dijitAccordionPane protocol_pane'\r\n\t><div dojoAttachPoint='titleNode,focusNode' dojoAttachEvent='ondijitclick:_onTitleClick,onkeypress:_onTitleKeyPress,onfocus:_handleFocus,onblur:_handleFocus'\r\n\t\tclass='dijitAccordionTitle' wairole=\"tab\"\r\n\t\t><div class='dijitAccordionArrow'></div\r\n\t\t><div class='arrowTextUp' waiRole=\"presentation\">&#9650;</div\r\n\t\t><div class='arrowTextDown' waiRole=\"presentation\">&#9660;</div\r\n\t\t><div dojoAttachPoint='titleTextNode' class='dijitAccordionText'>${title}</div></div\r\n\t><div\r\n\t\t><div dojoAttachPoint='containerNode' style='overflow: hidden; height: 1px; display: none'\r\n\t\t\tclass='dijitAccordionBody' wairole=\"tabpanel\"\r\n\t\t\t><form dojoAttachPoint=\"form\" dojoType=\"dijit.form.Form\"\r\n\t\t\t\t><br/\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"100%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Name</label></td\r\n\t\t\t\t\t\t><td><input dojoAttachPoint=\"name\" dojoType=\"dijit.form.TextBox\" name=\"Name\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td rowspan=\"4\" valign=\"top\" width=\"20\">&nbsp;</td\r\n\t\t\t\t\t\t><td rowspan=\"1\"><label>Comments</label></td\r\n\t\t\t\t\t\t><td rowspan=\"4\" valign=\"top\"><textarea rows=\"4\" style=\"width: 95%\" name=\"Comment\" class=\"comment\"></textarea></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>ID</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td rowspan=\"3\">&nbsp;</td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Plugin&nbsp;Type</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Plugin\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Event&nbsp;Type</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"EventType\"\r\n\t\t\t\t\t\t\t\tstore=\"pion.terms.store\" searchAttr=\"id\" query=\"{Type: 'object'}\" /></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><br/\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" style=\"border: 1px solid #999999;\" width=\"99%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td class=\"matrixMainHeader\">Extraction Rules</td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td style=\"background-color: #f1f1f1;\"\r\n\t\t\t\t\t\t\t><div class=\"protocol_grid plugin_pane_grid\" dojoAttachPoint=\"extraction_rule_grid_node\"></div\r\n\t\t\t\t\t\t\t><button dojoType=dijit.form.Button class=\"add_new_row\" dojoAttachEvent=\"onClick: _handleAddNewRule\">ADD NEW RULE</button\r\n\t\t\t\t\t\t></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><hr noshade=\"noshade\" size=\"1\" color=\"#999999\"\r\n\t\t\t\t><div class=\"save_cancel_delete\"\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick:save\">Save Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick:cancel\">Cancel Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"delete\" dojoAttachEvent=\"onClick:delete2\">Delete Protocol</button\r\n\t\t\t\t></div\r\n\t\t\t></form\r\n\t\t></div\r\n\t></div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
this.special_config_elements=["Extract","tagName","childNodes"];
this.populateWithDefaults();
var _this=this;
this.has_extraction_rules="extraction_rule_grid_node" in this;
if(this.has_extraction_rules){
this.extraction_rule_store=new dojo.data.ItemFileWriteStore({data:{identifier:"ID",items:[]}});
this.extraction_rule_store.next_id=0;
this.extraction_rule_grid_layout=[{defaultCell:{editable:true,type:dojox.grid.cells._Widget,styles:"text-align: left;"},rows:[{field:"Term",name:"Term",width:16,type:pion.widgets.TermTextCell},{field:"Source",name:"Source",styles:"",width:7,type:dojox.grid.cells.Select,options:plugins.protocols.source_options},{field:"Name",name:"Name",width:7,formatter:pion.xmlCellFormatter},{field:"Match",name:"Match",width:8,formatter:pion.xmlCellFormatter},{field:"Format",name:"Format",width:8,formatter:pion.xmlCellFormatter},{field:"ContentType",name:"ContentType",width:8,formatter:pion.xmlCellFormatter},{field:"MaxSize",name:"MaxSize",width:"auto",formatter:pion.xmlCellFormatter},{name:"Delete",styles:"align: center;",width:3,editable:false,formatter:pion.makeDeleteButton}]}];
this.extraction_rule_grid=new dojox.grid.DataGrid({store:this.extraction_rule_store,structure:this.extraction_rule_grid_layout,singleClickEdit:true},document.createElement("div"));
this.extraction_rule_grid_node.appendChild(this.extraction_rule_grid.domNode);
this.extraction_rule_grid.startup();
this.extraction_rule_grid.connect(this.extraction_rule_grid,"onCellClick",function(e){
if(e.cell.name=="Delete"){
this.store.deleteItem(this.getItem(e.rowIndex));
_this.markAsChanged();
}
});
dojo.connect(this.extraction_rule_grid,"onApplyCellEdit",this,_this._handleCellEdit);
}
dojo.query("input",this.domNode).forEach(function(n){
dojo.connect(n,"change",_this,_this.markAsChanged);
});
dojo.query("textarea",this.domNode).forEach(function(n){
dojo.connect(n,"change",_this,_this.markAsChanged);
});
dojo.query("select",this.domNode).forEach(function(n){
dojo.connect(n,"change",_this,_this.markAsChanged);
});
},populateWithDefaults:function(){
},getHeight:function(){
return 530;
},populateFromConfigItem:function(item){
var store=pion.protocols.config_store;
var _17ba={};
var _17bb=store.getAttributes(item);
for(var i=0;i<_17bb.length;++i){
if(dojo.indexOf(this.special_config_elements,_17bb[i])==-1){
_17ba[_17bb[i]]=store.getValue(item,_17bb[i]).toString();
}
}
if(this._addCustomConfigValues){
this._addCustomConfigValues(_17ba,item);
}
this.form.attr("value",_17ba);
var _17bd=dojo.query("textarea.comment",this.form.domNode)[0];
_17bd.value=_17ba.Comment;
this.title=_17ba.Name;
var _17be=dojo.query(".dijitAccordionTitle .dijitAccordionText",this.domNode)[0];
_17be.firstChild.nodeValue=this.title;
if(this.has_extraction_rules){
this._reloadExtractionRuleStore(item);
}
var node=this.domNode;
setTimeout(function(){
dojo.removeClass(node,"unsaved_changes");
},500);
},_reloadExtractionRuleStore:function(item){
var _this=this;
this.extraction_rule_store.fetch({onItem:function(item){
_this.extraction_rule_store.deleteItem(item);
},onComplete:function(){
var store=pion.protocols.config_store;
dojo.forEach(store.getValues(item,"Extract"),function(_17c4){
var _17c5={ID:_this.extraction_rule_store.next_id++,Term:store.getValue(_17c4,"@term"),Source:store.getValue(_17c4,"Source"),Name:store.getValue(_17c4,"Name"),Match:store.getValue(_17c4,"Match"),Format:store.getValue(_17c4,"Format"),ContentType:store.getValue(_17c4,"ContentType"),MaxSize:store.getValue(_17c4,"MaxSize")};
_this.extraction_rule_store.newItem(_17c5);
});
},onError:pion.handleFetchError});
this.extraction_rule_grid.resize();
},_handleCellEdit:function(_17c6,_17c7,_17c8){
console.debug("ProtocolPane._handleCellEdit inValue = ",_17c6,", inRowIndex = ",_17c7,", inFieldIndex = ",_17c8);
dojo.addClass(this.domNode,"unsaved_changes");
},_handleAddNewRule:function(){
this.markAsChanged();
this.extraction_rule_store.newItem({ID:this.extraction_rule_store.next_id++});
},save:function(){
if(this.has_extraction_rules){
var _this=this;
var _17ca="";
var store=this.extraction_rule_store;
store.fetch({onItem:function(item){
_17ca+="<Extract term=\""+store.getValue(item,"Term")+"\">";
_17ca+=pion.makeXmlLeafElement("Source",store.getValue(item,"Source"));
if(store.getValue(item,"Name")){
_17ca+=pion.makeXmlLeafElement("Name",store.getValue(item,"Name"));
}
if(store.getValue(item,"Match")){
_17ca+=pion.makeXmlLeafElement("Match",store.getValue(item,"Match"));
}
if(store.getValue(item,"Format")){
_17ca+=pion.makeXmlLeafElement("Format",store.getValue(item,"Format"));
}
if(store.getValue(item,"ContentType")){
_17ca+=pion.makeXmlLeafElement("ContentType",store.getValue(item,"ContentType"));
}
if(store.getValue(item,"MaxSize")){
_17ca+=pion.makeXmlLeafElement("MaxSize",store.getValue(item,"MaxSize"));
}
_17ca+="</Extract>";
},onComplete:function(){
_this.extraction_rule_put_data=_17ca;
_this.doPutRequest();
dojo.removeClass(_this.domNode,"unsaved_changes");
},onError:pion.handleFetchError});
}else{
this.extraction_rule_put_data="";
this.doPutRequest();
}
},doPutRequest:function(){
var _17cd=this.form.attr("value");
var _17ce=dojo.query("textarea.comment",this.form.domNode)[0];
_17cd.Comment=_17ce.value;
var _17cf="<PionConfig><Protocol>";
for(var tag in _17cd){
if(tag.charAt(0)!="@"&&tag!="options"){
console.debug("config[",tag,"] = ",_17cd[tag]);
_17cf+=pion.makeXmlLeafElement(tag,_17cd[tag]);
}
}
if(this._makeCustomElements){
_17cf+=this._makeCustomElements(_17cd);
}
_17cf+=this.extraction_rule_put_data;
_17cf+="</Protocol></PionConfig>";
console.debug("put_data: ",_17cf);
_this=this;
dojo.rawXhrPut({url:"/config/protocols/"+this.uuid,contentType:"text/xml",handleAs:"xml",putData:_17cf,load:function(_17d1){
console.debug("response: ",_17d1);
pion.protocols.config_store.fetch({query:{"@id":_this.uuid},onItem:function(item){
_this.config_item=item;
_this.populateFromConfigItem(item);
},onError:pion.handleFetchError});
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_17cf})});
},cancel:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
this.populateFromConfigItem(this.config_item);
},delete2:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
console.debug("delete2: selected protocol is ",this.title);
_this=this;
dojo.xhrDelete({url:"/config/protocols/"+this.uuid,handleAs:"xml",timeout:5000,load:function(_17d3,_17d4){
console.debug("xhrDelete for url = /config/protocols/"+this.uuid,"; HTTP status code: ",_17d4.xhr.status);
dijit.byId("protocol_config_accordion").forward();
dijit.byId("protocol_config_accordion").removeChild(_this);
pion.protocols._adjustAccordionSize();
return _17d3;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
},markAsChanged:function(){
console.debug("markAsChanged");
dojo.addClass(this.domNode,"unsaved_changes");
},protocol:""});
plugins.protocols.source_options=["query","cookie","cs-header","sc-header","cs-content","sc-content","cs-raw-content","sc-raw-content"];
}
if(!dojo._hasResource["plugins.protocols.HTTPProtocol"]){
dojo._hasResource["plugins.protocols.HTTPProtocol"]=true;
dojo.provide("plugins.protocols.HTTPProtocol");
plugins.protocols.HTTPProtocol.label="HTTP Protocol";
dojo.declare("plugins.protocols.HTTPProtocolPane",[plugins.protocols.ProtocolPane],{templateString:"<div class='dijitAccordionPane protocol_pane'\r\n\t><div dojoAttachPoint='titleNode,focusNode' dojoAttachEvent='ondijitclick:_onTitleClick,onkeypress:_onTitleKeyPress,onfocus:_handleFocus,onblur:_handleFocus'\r\n\t\tclass='dijitAccordionTitle' wairole=\"tab\"\r\n\t\t><div class='dijitAccordionArrow'></div\r\n\t\t><div class='arrowTextUp' waiRole=\"presentation\">&#9650;</div\r\n\t\t><div class='arrowTextDown' waiRole=\"presentation\">&#9660;</div\r\n\t\t><div dojoAttachPoint='titleTextNode' class='dijitAccordionText'>${title}</div></div\r\n\t><div\r\n\t\t><div dojoAttachPoint='containerNode' style='overflow: hidden; height: 1px; display: none'\r\n\t\t\tclass='dijitAccordionBody' wairole=\"tabpanel\"\r\n\t\t\t><form dojoAttachPoint=\"form\" dojoType=\"dijit.form.Form\"\r\n\t\t\t\t><br/\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"100%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Name</label></td\r\n\t\t\t\t\t\t><td><input dojoAttachPoint=\"name\" dojoType=\"dijit.form.TextBox\" name=\"Name\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td rowspan=\"4\" valign=\"top\" width=\"20\">&nbsp;</td\r\n\t\t\t\t\t\t><td rowspan=\"1\"><label>Comments</label></td\r\n\t\t\t\t\t\t><td rowspan=\"4\" valign=\"top\"><textarea rows=\"4\" style=\"width: 95%\" name=\"Comment\" class=\"comment\"></textarea></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>ID</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td rowspan=\"3\">&nbsp;</td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Plugin&nbsp;Type</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Plugin\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Event&nbsp;Type</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"pion.widgets.SimpleSelect\" name=\"EventType\"\r\n\t\t\t\t\t\t\t\tstore=\"pion.terms.store\" searchAttr=\"id\" query=\"{Type: 'object'}\" /></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Max&nbsp;Request&nbsp;Content&nbsp;Length</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.ValidationTextBox\" type=\"text\" name=\"MaxRequestContentLength\" regExp=\"[1-9][0-9]*\" required=\"true\"></td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td><label>Max&nbsp;Response&nbsp;Content&nbsp;Length</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.ValidationTextBox\" type=\"text\" name=\"MaxResponseContentLength\" regExp=\"[1-9][0-9]*\" required=\"true\"></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><br/\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" style=\"border: 1px solid #999999;\" width=\"99%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td class=\"matrixMainHeader\">Extraction Rules</td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td style=\"background-color: #f1f1f1;\"\r\n\t\t\t\t\t\t\t><div class=\"protocol_grid plugin_pane_grid\" dojoAttachPoint=\"extraction_rule_grid_node\"></div\r\n\t\t\t\t\t\t\t><button dojoType=dijit.form.Button class=\"add_new_row\" dojoAttachEvent=\"onClick: _handleAddNewRule\">ADD NEW RULE</button\r\n\t\t\t\t\t\t></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><hr noshade=\"noshade\" size=\"1\" color=\"#999999\"\r\n\t\t\t\t><div class=\"save_cancel_delete\"\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick:save\">Save Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick:cancel\">Cancel Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"delete\" dojoAttachEvent=\"onClick:delete2\">Delete Protocol</button\r\n\t\t\t\t></div\r\n\t\t\t></form\r\n\t\t></div\r\n\t></div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
},populateWithDefaults:function(){
this.inherited("populateWithDefaults",arguments);
this.form.attr("value",{MaxRequestContentLength:1048576,MaxResponseContentLength:1048576});
},getHeight:function(){
return 525;
}});
}
if(!dojo._hasResource["pion.protocols"]){
dojo._hasResource["pion.protocols"]=true;
dojo.provide("pion.protocols");
var selected_protocol_pane=null;
pion.protocols.getHeight=function(){
return pion.protocols.height;
};
pion.protocols.config_store=new dojox.data.XmlStore({url:"/config/protocols"});
pion.protocols.config_store.fetchItemByIdentity=function(_17d5){
pion.protocols.config_store.fetch({query:{"@id":_17d5.identity},onItem:_17d5.onItem,onError:pion.handleFetchError});
};
pion.protocols.config_store.getIdentity=function(item){
return pion.protocols.config_store.getValue(item,"@id");
};
pion.protocols.default_id="593f044a-ac60-11dd-aba3-001cc02bd66b";
pion.protocols.init=function(){
pion.protocols.getAllProtocolsInUIDirectory=function(){
var d=new dojo.Deferred();
var store=new dojox.data.XmlStore({url:"/config/protocols/plugins"});
store.fetch({onComplete:function(items){
var _17da=dojo.map(items,function(item){
return store.getValue(item,"Plugin").toString();
});
d.callback(_17da);
}});
return d;
};
var _17dc=function(_17dd){
var d=new dojo.Deferred();
plugin_data_store_items=[];
dojo.forEach(_17dd,function(_17df){
if(dojo.indexOf(pion.plugins.loaded_plugins,_17df)!=-1){
var _17e0=pion.plugins.getPluginPrototype("plugins.protocols",_17df,"/plugins/protocols");
plugin_data_store_items.push({plugin:_17df,label:_17e0.label});
}
pion.protocols.plugin_data_store=new dojo.data.ItemFileWriteStore({data:{identifier:"plugin",items:plugin_data_store_items}});
});
d.callback();
return d;
};
var _17e1=function(){
pion.protocols.config_store.fetch({onComplete:function(items,_17e3){
var _17e4=dijit.byId("protocol_config_accordion");
for(var i=0;i<items.length;++i){
pion.protocols.createNewPaneFromItem(items[i]);
}
var _17e6=_17e4.getChildren()[0];
_17e4.selectChild(_17e6);
},onError:pion.handleFetchError});
};
pion.plugins.initLoadedPluginList().addCallback(pion.protocols.getAllProtocolsInUIDirectory).addCallback(_17dc).addCallback(_17e1);
dojo.subscribe("protocol_config_accordion-selectChild",protocolPaneSelected);
pion.protocols.createNewPaneFromItem=function(item){
var title=pion.escapeXml(pion.codecs.config_store.getValue(item,"Name"));
var _17e9=pion.protocols.config_store.getValue(item,"Plugin");
var _17ea=document.createElement("span");
var _17eb="plugins.protocols."+_17e9+"Pane";
var _17ec=dojo.getObject(_17eb);
if(_17ec){
console.debug("found class ",_17eb);
var _17ed=new _17ec({"class":"protocol_pane",title:title},_17ea);
}else{
console.debug("class ",_17eb," not found; using plugins.protocols.ProtocolPane instead.");
var _17ed=new plugins.protocols.ProtocolPane({"class":"protocol_pane",title:title},_17ea);
}
_17ed.config_item=item;
_17ed.uuid=pion.protocols.config_store.getValue(item,"@id");
dijit.byId("protocol_config_accordion").addChild(_17ed);
return _17ed;
};
pion.protocols.createNewPaneFromStore=function(id,_17ef){
pion.protocols.config_store.fetch({query:{"@id":id},onItem:function(item){
var _17f1=pion.protocols.createNewPaneFromItem(item);
if(_17ef){
pion.protocols._adjustAccordionSize();
dijit.byId("protocol_config_accordion").selectChild(_17f1);
}
},onError:pion.handleFetchError});
};
function addNewProtocol(){
var _17f2=new plugins.protocols.ProtocolInitDialog({title:"Add New Protocol"});
setTimeout(function(){
dojo.query("input",_17f2.domNode)[0].select();
},500);
_17f2.show();
_17f2.execute=function(_17f3){
console.debug(_17f3);
if(plugins.protocols[_17f3.Plugin]&&plugins.protocols[_17f3.Plugin].edition=="Enterprise"){
pion.about.checkKeyStatus({success_callback:function(){
_sendPostRequest(_17f3);
}});
}else{
_sendPostRequest(_17f3);
}
};
};
function _sendPostRequest(_17f4){
var _17f5="<PionConfig><Protocol>";
for(var tag in _17f4){
console.debug("dialogFields[",tag,"] = ",_17f4[tag]);
_17f5+=pion.makeXmlLeafElement(tag,_17f4[tag]);
}
if(plugins.protocols[_17f4.Plugin]&&plugins.protocols[_17f4.Plugin].custom_post_data){
_17f5+=plugins.protocols[_17f4.Plugin].custom_post_data;
}
_17f5+="</Protocol></PionConfig>";
console.debug("post_data: ",_17f5);
dojo.rawXhrPost({url:"/config/protocols",contentType:"text/xml",handleAs:"xml",postData:_17f5,load:function(_17f7){
var node=_17f7.getElementsByTagName("Protocol")[0];
var id=node.getAttribute("id");
console.debug("id (from server): ",id);
pion.protocols.createNewPaneFromStore(id,true);
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_17f5})});
};
dojo.connect(dojo.byId("add_new_protocol_button"),"click",addNewProtocol);
};
pion.protocols._adjustAccordionSize=function(){
var _17fa=dijit.byId("protocol_config_accordion");
var _17fb=_17fa.getChildren().length;
console.debug("num_protocols = "+_17fb);
var _17fc=selected_protocol_pane.getHeight();
var _17fd=0;
if(_17fb>0){
var _17fe=_17fa.getChildren()[0];
_17fd=_17fe.getTitleHeight();
}
var _17ff=_17fc+_17fb*_17fd;
_17fa.resize({h:_17ff});
pion.protocols.height=_17ff+160;
dijit.byId("main_stack_container").resize({h:pion.protocols.height});
};
function protocolPaneSelected(pane){
console.debug("Selected "+pane.title);
if(pane==selected_protocol_pane){
return;
}
if(selected_protocol_pane&&dojo.hasClass(selected_protocol_pane.domNode,"unsaved_changes")){
var _1801=new dijit.Dialog({title:"Warning: unsaved changes"});
_1801.attr("content","Please save or cancel unsaved changes before selecting another Protocol.");
_1801.show();
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
var _1804=dijit.byId("protocol_config_accordion").duration;
setTimeout(function(){
dojo.style(pane.containerNode,"overflow","hidden");
pion.protocols._adjustAccordionSize();
},_1804+50);
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
var _1807={};
var _1808=store.getAttributes(item);
for(var i=0;i<_1808.length;++i){
if(_1808[i]!="Field"&&_1808[i]!="tagName"&&_1808[i]!="childNodes"){
_1807[_1808[i]]=store.getValue(item,_1808[i]).toString();
}
}
console.dir(_1807);
this.form.attr("value",_1807);
console.debug("config = ",_1807);
var _180a=dojo.query(".dijitAccordionTitle .dijitAccordionText",this.domNode)[0];
_180a.firstChild.nodeValue=this.title;
var node=this.domNode;
setTimeout(function(){
dojo.removeClass(node,"unsaved_changes");
},500);
},save:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
var _180c=this.form.attr("value");
var _180d="<PionConfig><User>";
for(var tag in _180c){
if(tag!="@id"){
console.debug("config[",tag,"] = ",_180c[tag]);
_180d+=pion.makeXmlLeafElement(tag,_180c[tag]);
}
}
_180d+="</User></PionConfig>";
console.debug("put_data: ",_180d);
_this=this;
dojo.rawXhrPut({url:"/config/users/"+this.uuid,contentType:"text/xml",handleAs:"xml",putData:_180d,load:function(_180f){
console.debug("response: ",_180f);
pion.users.config_store.fetch({query:{"@id":_this.uuid},onItem:function(item){
_this.config_item=item;
_this.populateFromConfigItem(item);
},onError:pion.handleFetchError});
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_180d})});
},cancel:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
this.populateFromConfigItem(this.config_item);
},delete2:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
console.debug("delete2: selected user is ",this.title);
_this=this;
dojo.xhrDelete({url:"/config/users/"+this.uuid,handleAs:"xml",timeout:5000,load:function(_1811,_1812){
console.debug("xhrDelete for url = /config/users/"+this.uuid,"; HTTP status code: ",_1812.xhr.status);
dijit.byId("user_config_accordion").forward();
dijit.byId("user_config_accordion").removeChild(_this);
pion.users._adjustAccordionSize();
return _1811;
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
function onComplete(items,_1815){
var _1816=dijit.byId("user_config_accordion");
for(var i=0;i<items.length;++i){
var title=pion.users.config_store.getValue(items[i],"@id");
var _1819=createNewUserPane(title);
_1819.config_item=items[i];
_1819.uuid=pion.users.config_store.getValue(items[i],"@id");
_1816.addChild(_1819);
}
pion.users._adjustAccordionSize();
var _181a=_1816.getChildren()[0];
_1816.selectChild(_181a);
};
if(file_protocol){
dijit.byId("user_config_accordion").removeChild(selected_user_pane);
}else{
pion.users.config_store.fetch({onComplete:onComplete,onError:pion.handleFetchError});
}
dojo.connect(dojo.byId("add_new_user_button"),"click",addNewUser);
};
function createNewUserPane(title){
var _181c=document.createElement("span");
var _181d=new pion.widgets.UserPane({"class":"user_pane",title:title},_181c);
return _181d;
};
function addNewUser(){
var _181e=new pion.widgets.UserInitDialog();
setTimeout(function(){
dojo.query("input",_181e.domNode)[0].select();
},500);
_181e.show();
_181e.execute=function(_181f){
console.debug(_181f);
var id=_181f["@id"];
delete _181f["@id"];
var _1821="<PionConfig><User id=\""+pion.escapeXml(id)+"\">";
for(var tag in _181f){
console.debug("dialogFields[",tag,"] = ",_181f[tag]);
_1821+=pion.makeXmlLeafElement(tag,_181f[tag]);
}
_1821+="</User></PionConfig>";
console.debug("post_data: ",_1821);
dojo.rawXhrPost({url:"/config/users",contentType:"text/xml",handleAs:"xml",postData:_1821,load:function(_1823){
var _1824=dijit.byId("user_config_accordion");
var _1825=createNewUserPane(id);
_1825.uuid=id;
_1824.addChild(_1825);
pion.users._adjustAccordionSize();
_1824.selectChild(_1825);
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1821})});
};
};
pion.users._adjustAccordionSize=function(){
var _1826=dijit.byId("user_config_accordion");
var _1827=_1826.getChildren().length;
console.debug("num_users = "+_1827);
var _1828=210;
var _1829=0;
if(_1827>0){
var _182a=_1826.getChildren()[0];
_1829=_182a.getTitleHeight();
}
var _182b=_1828+_1827*_1829;
_1826.resize({h:_182b});
pion.users.height=_182b+160;
dijit.byId("main_stack_container").resize({h:pion.users.height});
};
function userPaneSelected(pane){
console.debug("Selected "+pane.title);
if(pane==selected_user_pane){
return;
}
if(selected_user_pane&&dojo.hasClass(selected_user_pane.domNode,"unsaved_changes")){
var _182d=new dijit.Dialog({title:"Warning: unsaved changes"});
_182d.attr("content","Please save or cancel unsaved changes before selecting another User.");
_182d.show();
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
var _1830=dijit.byId("user_config_accordion").duration;
setTimeout(function(){
dojo.style(pane.containerNode,"overflow","hidden");
},_1830+50);
};
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
this.apply_button.attr("disabled",false);
},applyXML:function(){
console.debug("applyXML called");
this.apply_button.attr("disabled",true);
var _1831="<PionConfig>"+this.XML_text_area.value+"</PionConfig>";
var _1832=_1831.replace(/>\s*/g,">");
if(dojo.isIE){
var _1833=dojox.data.dom.createDocument();
_1833.loadXML(_1832);
}else{
var _1834=new DOMParser();
var _1833=_1834.parseFromString(_1832,"text/xml");
}
var _1835=_1833.childNodes[0].childNodes;
this.result_text_area.value+=_1835.length+" configurations found.\n";
this.configs_by_type={Codec:[],Database:[],Reactor:[],Connection:[]};
for(var i=0;i<_1835.length;++i){
var type=_1835[i].nodeName;
if(!this.configs_by_type[type]){
this.result_text_area.value+="Error: unknown configuration type \""+type+"\".\n";
return;
}
this.configs_by_type[type].push(_1835[i]);
}
this.processCodecs();
},processCodecs:function(){
if(this.configs_by_type.Codec.length==0){
this.result_text_area.value+="No Codec configurations found.\n";
this.processDatabases();
}else{
this.result_text_area.value+=this.configs_by_type.Codec.length+" Codec configurations found.\n";
var _1838=0;
var _this=this;
dojo.forEach(this.configs_by_type.Codec,function(_183a){
var _183b=_183a.getAttribute("id");
var _183c="<PionConfig>"+dojox.data.dom.innerXML(_183a)+"</PionConfig>";
dojo.rawXhrPost({url:"/config/codecs",contentType:"text/xml",handleAs:"xml",postData:_183c,load:function(_183d){
var node=_183d.getElementsByTagName("Codec")[0];
var _183f=node.getAttribute("id");
if(_183b){
_this.uuid_replacements[_183b]=_183f;
}
if(codec_config_page_initialized){
pion.codecs.createNewPaneFromStore(_183f,false);
}
var name=node.getElementsByTagName("Name")[0].childNodes[0].nodeValue;
_this.result_text_area.value+="Codec named \""+name+"\" added with new UUID "+_183f+"\n";
if(++_1838==_this.configs_by_type.Codec.length){
_this.processDatabases();
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_183c})});
});
}
},processDatabases:function(){
if(this.configs_by_type.Database.length==0){
this.result_text_area.value+="No Database configurations found.\n";
this.processReactors();
}else{
this.result_text_area.value+=this.configs_by_type.Database.length+" Database configurations found.\n";
var _1841=0;
var _this=this;
dojo.forEach(this.configs_by_type.Database,function(_1843){
var _1844=_1843.getAttribute("id");
var _1845="<PionConfig>"+dojox.data.dom.innerXML(_1843)+"</PionConfig>";
dojo.rawXhrPost({url:"/config/databases",contentType:"text/xml",handleAs:"xml",postData:_1845,load:function(_1846){
var node=_1846.getElementsByTagName("Database")[0];
var _1848=node.getAttribute("id");
if(_1844){
_this.uuid_replacements[_1844]=_1848;
}
if(database_config_page_initialized){
pion.databases.createNewPaneFromStore(_1848,false);
}
var name=node.getElementsByTagName("Name")[0].childNodes[0].nodeValue;
_this.result_text_area.value+="Database named \""+name+"\" added with new UUID "+_1848+"\n";
if(++_1841==_this.configs_by_type.Database.length){
_this.processReactors();
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1845})});
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
var _184a=0;
var _this=this;
dojo.forEach(this.configs_by_type.Reactor,function(_184c){
var _184d=_184c.getAttribute("id");
var _184e="<PionConfig>"+dojox.data.dom.innerXML(_184c)+"</PionConfig>";
for(var _184f in _this.uuid_replacements){
_184e=_184e.replace(RegExp(_184f,"g"),_this.uuid_replacements[_184f]);
}
console.debug("post_data = ",_184e);
dojo.rawXhrPost({url:"/config/reactors",contentType:"text/xml",handleAs:"xml",postData:_184e,load:function(_1850){
var node=_1850.getElementsByTagName("Reactor")[0];
var _1852=node.getAttribute("id");
if(_184d){
_this.uuid_replacements[_184d]=_1852;
}
var _1853={"@id":_1852};
var _1854=node.childNodes;
for(var i=0;i<_1854.length;++i){
if(_1854[i].firstChild){
_1853[_1854[i].tagName]=_1854[i].firstChild.nodeValue;
}
}
pion.reactors.createReactorInConfiguredWorkspace(_1853);
_this.result_text_area.value+="Reactor named \""+_1853.Name+"\" added with new UUID "+_1852+"\n";
if(++_184a==_this.configs_by_type.Reactor.length){
dijit.byId("main_stack_container").selectChild(dijit.byId("system_config"));
console.debug("this.uuid_replacements = ",this.uuid_replacements);
_this.processConnections();
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_184e})});
});
}
},processConnections:function(){
if(this.configs_by_type.Connection.length==0){
this.result_text_area.value+="No Connection configurations found.\n";
}else{
dijit.byId("main_stack_container").selectChild(dijit.byId("reactor_config"));
this.result_text_area.value+=this.configs_by_type.Connection.length+" Connections found.\n";
var _1856=0;
var _this=this;
dojo.forEach(this.configs_by_type.Connection,function(_1858){
var _1859=_1858.getAttribute("id");
var _185a="<PionConfig>"+dojox.data.dom.innerXML(_1858)+"</PionConfig>";
for(var _185b in _this.uuid_replacements){
_185a=_185a.replace(RegExp(_185b,"g"),_this.uuid_replacements[_185b]);
}
console.debug("post_data = ",_185a);
dojo.rawXhrPost({url:"/config/connections",contentType:"text/xml",handleAs:"xml",postData:_185a,load:function(_185c){
var node=_185c.getElementsByTagName("Connection")[0];
var _185e=node.getAttribute("id");
var _185f=_185c.getElementsByTagName("From")[0].firstChild.nodeValue;
var to_id=_185c.getElementsByTagName("To")[0].firstChild.nodeValue;
pion.reactors.createConnection(_185f,to_id,_185e);
_this.result_text_area.value+="Connection from "+_185f+" to "+to_id+" added with new UUID "+_185e+"\n";
if(++_1856==_this.configs_by_type.Connection.length){
dijit.byId("main_stack_container").selectChild(dijit.byId("system_config"));
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_185a})});
});
}
}});
}
if(!dojo._hasResource["pion.system"]){
dojo._hasResource["pion.system"]=true;
dojo.provide("pion.system");
var server_store;
dojo.declare("childlessChildrenFirstStore",dojo.data.ItemFileWriteStore,{getValues:function(item,_1862){
var _1863=this.inherited("getValues",arguments);
if(_1862!="services"){
return _1863;
}
var len=_1863.length;
for(var i=0;i<len;++i){
if(_1863[0].services){
_1863.push(_1863[0]);
_1863.splice(0,1);
}
}
return _1863;
}});
pion.system.getHeight=function(){
return 800;
};
pion.system.init=function(){
dijit.byId("main_stack_container").resize({h:pion.system.getHeight()});
if(file_protocol){
return;
}
dojo.xhrGet({url:"/config",handleAs:"xml",timeout:5000,load:function(_1866,_1867){
console.debug("in load()");
if(dojo.isIE){
dojo.byId("platform_conf_file").innerHTML=_1866.getElementsByTagName("PlatformConfig")[0].xml;
dojo.byId("reactor_conf_file").innerHTML=_1866.getElementsByTagName("ReactorConfig")[0].xml;
dojo.byId("vocab_conf_file").innerHTML=_1866.getElementsByTagName("VocabularyConfig")[0].xml;
dojo.byId("codec_conf_file").innerHTML=_1866.getElementsByTagName("CodecConfig")[0].xml;
dojo.byId("database_conf_file").innerHTML=_1866.getElementsByTagName("DatabaseConfig")[0].xml;
dojo.byId("user_conf_file").innerHTML=_1866.getElementsByTagName("UserConfig")[0].xml;
dojo.byId("protocol_conf_file").innerHTML=_1866.getElementsByTagName("ProtocolConfig")[0].xml;
dojo.byId("service_conf_file").innerHTML=_1866.getElementsByTagName("ServiceConfig")[0].xml;
dojo.byId("log_conf_file").innerHTML=_1866.getElementsByTagName("LogConfig")[0].xml;
dojo.byId("vocab_path").innerHTML=_1866.getElementsByTagName("VocabularyPath")[0].xml;
}else{
dojo.byId("platform_conf_file").innerHTML=_1866.getElementsByTagName("PlatformConfig")[0].textContent;
dojo.byId("reactor_conf_file").innerHTML=_1866.getElementsByTagName("ReactorConfig")[0].textContent;
dojo.byId("vocab_conf_file").innerHTML=_1866.getElementsByTagName("VocabularyConfig")[0].textContent;
dojo.byId("codec_conf_file").innerHTML=_1866.getElementsByTagName("CodecConfig")[0].textContent;
dojo.byId("database_conf_file").innerHTML=_1866.getElementsByTagName("DatabaseConfig")[0].textContent;
dojo.byId("user_conf_file").innerHTML=_1866.getElementsByTagName("UserConfig")[0].textContent;
dojo.byId("protocol_conf_file").innerHTML=_1866.getElementsByTagName("ProtocolConfig")[0].textContent;
dojo.byId("service_conf_file").innerHTML=_1866.getElementsByTagName("ServiceConfig")[0].textContent;
dojo.byId("log_conf_file").innerHTML=_1866.getElementsByTagName("LogConfig")[0].textContent;
dojo.byId("vocab_path").innerHTML=_1866.getElementsByTagName("VocabularyPath")[0].textContent;
}
var _1868=dojo.byId("plugin_paths");
var _1869=_1868.getElementsByTagName("tr")[0];
while(_1868.firstChild){
_1868.removeChild(_1868.firstChild);
}
var _186a=_1866.getElementsByTagName("PluginPath");
var _186b=[];
for(var i=0;i<_186a.length;++i){
if(dojo.isIE){
_186b[i]=_1868.insertRow();
dojo.forEach(_1869.childNodes,function(n){
_186b[i].appendChild(dojo.clone(n));
});
}else{
_186b[i]=dojo.clone(_1869);
_1868.appendChild(_186b[i]);
}
_186b[i].getElementsByTagName("label")[0].innerHTML="Plugin Path "+(i+1);
var _186e=dojo.isIE?_186a[i].xml:_186a[i].textContent;
_186b[i].getElementsByTagName("td")[1].innerHTML=_186e;
}
return _1866;
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
var _1873=new pion.widgets.XMLImportDialog();
_1873.show();
};
}
if(!dojo._hasResource["plugins.services.Service"]){
dojo._hasResource["plugins.services.Service"]=true;
dojo.provide("plugins.services.Service");
dojo.declare("plugins.services.Service",[dijit.layout.BorderContainer,dijit._Templated],{postCreate:function(){
this.inherited("postCreate",arguments);
dijit.byId("main_stack_container").addChild(this,0);
},onSelect:function(){
dijit.byId("main_stack_container").resize({h:this.height});
if(!this.initialized){
this.initialized=true;
this.init();
}
}});
}
if(!dojo._hasResource["pion.services"]){
dojo._hasResource["pion.services"]=true;
dojo.provide("pion.services");
pion.services.config_store=new dojox.data.XmlStore({url:"/config/services"});
pion.services.init=function(){
pion.services.getAllServicesInUIDirectory=function(){
var d=new dojo.Deferred();
var store=new dojox.data.XmlStore({url:"/config/services/plugins"});
store.fetch({onComplete:function(items){
var _1877=dojo.map(items,function(item){
return store.getValue(item,"Plugin").toString();
});
d.callback(_1877);
}});
return d;
};
var _1879=function(_187a){
var d=new dojo.Deferred();
plugin_data_store_items=[];
dojo.forEach(_187a,function(_187c){
if(dojo.indexOf(pion.plugins.loaded_plugins,_187c)!=-1){
var _187d=pion.plugins.getPluginPrototype("plugins.services",_187c,"/plugins/services");
new _187d({title:_187d.label});
console.debug("UI for service \"",_187d.label,"\" has been added.");
}
});
d.callback();
return d;
};
pion.plugins.initLoadedPluginList().addCallback(pion.services.getAllServicesInUIDirectory).addCallback(_1879);
};
}
if(!dojo._hasResource["pion.about"]){
dojo._hasResource["pion.about"]=true;
dojo.provide("pion.about");
pion.about.ops_temporarily_suppressed=false;
dojo.declare("pion.about.LicenseKeyDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog about_dialog\" style=\"height: 550px; width: 600px\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">About Pion</span>\r\n\t\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: hide\">\r\n\t\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<p>\r\n\t\t\t<big><strong><span id=\"full_version\" dojoAttachPoint=\"full_version\"></span></strong></big><br/>\r\n\t\t\tCopyright &copy; 2008-2009 Atomic Labs, Inc.  All Rights Reserved.\r\n\t\t</p>\r\n\t\t<p>\r\n\t\t\tPion includes a collection of <a href=\"third_party_libraries.html\" target=\"_blank\" style=\"color:#0033CC; text-decoration:underline\">third party\r\n\t\t\tlibraries</a>, all of which may be downloaded from \r\n\t\t\t<a href=\"http://pion.org/projects/pion-platform/documentation/libraries\" target=\"_blank\" style=\"color:#0033CC; text-decoration:underline\">our\r\n\t\t\tcommunity website.</a>\r\n\t\t</p>\r\n\r\n\t\t<h2>License Information</h2>\r\n\t\t<hr>\r\n\r\n\t\t<div id=\"license_block\">\r\n\r\n\t\t\t<div id=\"community_license\" dojoAttachPoint=\"community_license\"\r\n\t\t\t\tstyle=\"display: none\">\r\n\r\n\t\t\t\t<p>\r\n\t\t\t\t\tPion Community Edition is licensed under the\r\n\t\t\t\t\t<a href=\"/licenses/gpl_affero.html\" target=\"_blank\" style=\"color:#0033CC; text-decoration:underline\">\r\n\t\t\t\t\t\tGNU Affero\r\n\t\t\t\t\t\tGeneral Public License\r\n\t\t\t\t\t</a>.\r\n\t\t\t\t</p>\r\n\r\n\t\t\t</div>\r\n\r\n\t\t\t<div id=\"enterprise_not_licensed\" dojoAttachPoint=\"enterprise_not_licensed\"\r\n\t\t\t\tstyle=\"display: none\">\r\n\t\t\t\r\n\t\t\t\t<p><span id=\"reason_needs_license\" dojoAttachPoint=\"reason_needs_license\"></span></p>\r\n\r\n\t\t\t\t<form>\r\n\t\t\t\t<p>\r\n\t\t\t\tPlease cut and paste your license key into the box below and click \"Submit Key.\"<br/>\r\n\t\t\t\tIf you don't have a license key, you can obtain one from\r\n\t\t\t\t<a href=\"http://www.atomiclabs.com/pion/download-enterprise.php\" style=\"color:#0033CC; text-decoration:underline\">atomiclabs.com</a>.\r\n\t\t\t\t</p>\r\n\t\t\t\t<textarea id=\"license_key\" dojoAttachPoint=\"license_key\" cols=\"65\" rows=\"8\"></textarea><br/>\r\n\t\t\t\t<button dojoType=\"dijit.form.Button\" class=\"content_button\" dojoAttachEvent=\"onClick: submitKey\">Submit Key</button>\r\n\t\t\t\t</form>\r\n\t\t\t\t<p><big><strong><span id=\"result_of_submitting_key\" dojoAttachPoint=\"result_of_submitting_key\"></span></strong></big></p>\r\n\t\t\t\r\n\t\t\t</div>\r\n\t\t\t\r\n\t\t\t<div id=\"enterprise_licensed\" dojoAttachPoint=\"enterprise_licensed\"\r\n\t\t\t\tstyle=\"display: none\">\r\n\t\t\t\r\n\t\t\t\t<p>Pion Enterprise Edition is licensed under the\r\n\t\t\t\t<a href=\"/licenses/atomic_enterprise.html\" target=\"_blank\" style=\"color:#0033CC; text-decoration:underline\">Atomic Labs\r\n\t\t\t\tEnterprise Software License Agreement</a>.</p>\r\n\t\t\t\t\r\n\t\t\t\t<table>\r\n\t\t\t\t<tr>\r\n\t\t\t\t\t<td><big><strong>Name:</strong></big></td>\r\n\t\t\t\t\t<td><span id=\"license_name\" dojoAttachPoint=\"license_name\"></span></td>\r\n\t\t\t\t</tr>\r\n\t\t\t\t<tr>\r\n\t\t\t\t\t<td><big><strong>Email:</strong></big></td>\r\n\t\t\t\t\t<td><span id=\"license_email\" dojoAttachPoint=\"license_email\"></span></td>\r\n\t\t\t\t</tr>\r\n\t\t\t\t<tr>\r\n\t\t\t\t\t<td><big><strong>Version:</strong></big></td>\r\n\t\t\t\t\t<td><span id=\"license_version\" dojoAttachPoint=\"license_version\"></span></td>\r\n\t\t\t\t</tr>\r\n\t\t\t\t<tr>\r\n\t\t\t\t\t<td><big><strong>Expiration:</strong></big></td>\r\n\t\t\t\t\t<td><span id=\"license_expiration\" dojoAttachPoint=\"license_expiration\"></span></td>\r\n\t\t\t\t</tr>\r\n\t\t\t\t</table>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
var _this=this;
dojo.xhrGet({url:"/config",preventCache:true,handleAs:"xml",timeout:5000,load:function(_187f,_1880){
if(dojo.isIE){
var _1881=_187f.getElementsByTagName("Version")[0].childNodes[0].nodeValue;
}else{
var _1881=_187f.getElementsByTagName("Version")[0].textContent;
}
var _1882="Unknown";
dojo.xhrGet({url:"/key/status",preventCache:true,handleAs:"xml",timeout:5000,load:function(_1883,_1884){
if(dojo.isIE){
var _1885=_1883.getElementsByTagName("Status")[0].childNodes[0].nodeValue;
}else{
var _1885=_1883.getElementsByTagName("Status")[0].textContent;
}
_1882="Enterprise";
_this.doLicenseStuff(_1881,_1882,_1885);
return _1883;
},error:function(_1886,_1887){
if(_1887.xhr.status==404){
_1882="Community";
_this.doLicenseStuff(_1881,_1882,"404");
}
return _1886;
}});
return _187f;
}});
this.connect(this,"hide",function(){
this.destroyRecursive(false);
if(_this.always_callback){
_this.always_callback();
}
if(pion.about.ops_temporarily_suppressed){
var _1888=dijit.byId("ops_toggle_button");
_1888.attr("checked",false);
pion.about.ops_temporarily_suppressed=false;
}
});
},submitKey:function(e){
var key=this.license_key.value;
console.debug("key = ",key);
var _this=this;
dojo.rawXhrPut({url:"/key",contentType:"text/plain",handleAs:"text",putData:key,load:function(_188c){
console.debug("response: ",_188c);
_this.hide();
pion.about.doDialog({always_callback:_this.success_callback});
return _188c;
},error:function(_188d,_188e){
console.debug(_188e);
_this.result_of_submitting_key.innerHTML="Error: Key not accepted.";
return _188d;
}});
},doLicenseStuff:function(_188f,_1890,_1891){
console.debug("pion_version = ",_188f,", pion_edition = ",_1890,", key_status = ",_1891);
full_edition_str="Pion "+_1890+" Edition";
full_version_str=full_edition_str+" v"+_188f;
this.full_version.innerHTML=full_version_str;
if(_1890=="Community"){
this.community_license.style.display="block";
}else{
if(_1891=="valid"){
var _this=this;
dojo.xhrGet({url:"/key",preventCache:true,handleAs:"xml",timeout:5000,load:function(_1893,_1894){
if(dojo.isIE){
var _1895=_1893.getElementsByTagName("Name")[0].xml;
var _1896=_1893.getElementsByTagName("Email")[0].xml;
var _1897=_1893.getElementsByTagName("Version");
var _1898=_1897.length>0?_1897[0].xml:"";
var _1899=_1893.getElementsByTagName("Expiration");
var _189a=_1899.length>0?_1899[0].xml:"";
}else{
var _1895=_1893.getElementsByTagName("Name")[0].textContent;
var _1896=_1893.getElementsByTagName("Email")[0].textContent;
var _1897=_1893.getElementsByTagName("Version");
var _1898=_1897.length>0?_1897[0].textContent:"";
var _1899=_1893.getElementsByTagName("Expiration");
var _189a=_1899.length>0?_1899[0].textContent:"";
}
_this.license_name.innerHTML=_1895;
_this.license_email.innerHTML=_1896;
if(_1898==""){
_this.license_version.innerHTML="All versions";
}else{
_this.license_version.innerHTML=_1898;
}
if(_189a==""){
_this.license_expiration.innerHTML="None";
}else{
_this.license_expiration.innerHTML=_189a;
}
_this.enterprise_licensed.style.display="block";
return _1893;
},error:pion.handleXhrGetError});
}else{
if(_1891=="invalid"){
this.reason_needs_license.innerHTML="Invalid license key (may have expired).";
}else{
this.reason_needs_license.innerHTML="No license key found.";
}
this.enterprise_not_licensed.style.display="block";
}
}
}});
pion.about.doDialog=function(_189b){
var _189c=dijit.byId("ops_toggle_button");
if(!_189c.checked){
_189c.attr("checked",true);
pion.about.ops_temporarily_suppressed=true;
}
var _189d=new pion.about.LicenseKeyDialog(_189b);
_189d.show();
};
pion.about.checkKeyStatus=function(_189e){
dojo.xhrGet({url:"/key/status",preventCache:true,handleAs:"xml",timeout:5000,load:function(_189f,_18a0){
if(dojo.isIE){
var _18a1=_189f.getElementsByTagName("Status")[0].childNodes[0].nodeValue;
}else{
var _18a1=_189f.getElementsByTagName("Status")[0].textContent;
}
if(_18a1=="valid"){
if(_189e.always_callback){
_189e.always_callback();
}
if(_189e.success_callback){
_189e.success_callback();
}
}else{
pion.about.doDialog(_189e);
}
return _189f;
},error:function(_18a2,_18a3){
if(_18a3.xhr.status==401){
if(!dojo.cookie("logged_in")){
location.replace("login.html");
}
pion.login.doLoginDialog({success_callback:function(){
pion.about.doDialog(_189e);
},suppress_default_key_status_check:true});
}else{
if(_18a3.xhr.status==404){
if(_189e.always_callback){
_189e.always_callback();
}
}else{
pion.about.doDialog(_189e);
}
}
return _18a2;
}});
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
pion.handleXhrError=function(_18a4,_18a5,_18a6,_18a7){
console.error("In pion.handleXhrError: response = ",_18a4,", ioArgs.args = ",_18a5.args);
if(_18a5.xhr.status==401){
if(pion.login.login_pending){
var h=dojo.connect(pion.login,"onLoginSuccess",function(){
dojo.disconnect(h);
_18a6(_18a5.args);
});
}else{
if(!dojo.cookie("logged_in")){
location.replace("login.html");
}
pion.login.doLoginDialog({success_callback:function(){
_18a6(_18a5.args);
}});
}
return;
}else{
if(_18a5.xhr.status==500){
var _18a9=new dijit.Dialog({title:"Pion Server Error"});
_18a9.attr("content",_18a4.responseText.replace(/</g,"&lt;").replace(/>/g,"&gt;"));
_18a9.show();
}
if(_18a7){
_18a7();
}
}
return _18a4;
};
pion.handleXhrGetError=function(_18aa,_18ab){
console.error("In pion.handleXhrGetError: response = ",_18aa,", ioArgs.args = ",_18ab.args);
return pion.handleXhrError(_18aa,_18ab,dojo.xhrGet);
};
pion.getXhrErrorHandler=function(_18ac,_18ad,_18ae){
return function(_18af,_18b0){
dojo.mixin(_18b0.args,_18ad);
return pion.handleXhrError(_18af,_18b0,_18ac,_18ae);
};
};
pion.doDeleteConfirmationDialog=function(_18b1,_18b2,_18b3){
var _18b4=pion.delete_confirmation_dialog;
if(!_18b4){
_18b4=new dijit.Dialog({title:"Delete Confirmation",content:"<div id=\"are_you_sure\"></div>"+"<button id=\"cancel_delete\" dojoType=\"dijit.form.Button\" class=\"cancel\">Cancel</button>"+"<button id=\"confirm_delete\" dojoType=dijit.form.Button class=\"delete\">Delete</button>"});
dojo.byId("cancel_delete").onclick=function(){
_18b4.onCancel();
};
pion.delete_confirmation_dialog=_18b4;
}
dojo.byId("are_you_sure").innerHTML=_18b1;
dojo.byId("confirm_delete").onclick=function(){
_18b4.onCancel();
_18b2(_18b3);
};
_18b4.show();
setTimeout("dijit.byId('cancel_delete').focus()",500);
};
pion.handleFetchError=function(_18b5,_18b6){
console.debug("In pion.handleFetchError: request = ",_18b6,", errorData = "+_18b5);
if(_18b5.status==401){
if(pion.login.login_pending){
var h=dojo.connect(pion.login,"onLoginSuccess",function(){
dojo.disconnect(h);
_18b6.store.fetch(_18b6);
});
}else{
if(!dojo.cookie("logged_in")){
location.replace("login.html");
}
pion.login.doLoginDialog({success_callback:function(){
_18b6.store.fetch(_18b6);
}});
}
return;
}
};
pion.escapeXml=function(value){
if(value===false){
return value.toString();
}else{
if(value){
return value.toString().replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}else{
return "";
}
}
};
pion.makeXmlLeafElement=function(_18b9,value){
return "<"+_18b9+">"+pion.escapeXml(value)+"</"+_18b9+">";
};
pion.makeXmlLeafElementFromItem=function(store,item,_18bd,_18be){
if(store.hasAttribute(item,_18bd)){
var value=store.getValue(item,_18bd);
if(value.toString()==""){
return "";
}else{
return pion.makeXmlLeafElement(_18bd,value);
}
}else{
if(_18be!==undefined){
return pion.makeXmlLeafElement(_18bd,_18be);
}else{
return "";
}
}
};
pion.xmlCellFormatter=function(d){
if(d==""){
return "";
}
if(d&&d.toString()){
return pion.escapeXml(d);
}else{
return this.defaultValue;
}
};
pion.xmlCellFormatter2=function(d){
if(d==""){
return "";
}
if(d&&d.toString()){
if(d.toString().substr(0,8)=="<button "){
return d;
}
return pion.escapeXml(d);
}else{
return this.defaultValue;
}
};
pion.datetimeCellFormatter=function(t){
return Date(t*1000).toLocaleString();
};
pion.utcDatetimeCellFormatter=function(t){
var d=new Date(t*1000);
var month=d.getUTCMonth()+1;
var date=d.getUTCDate();
var hour=d.getUTCHours();
var min=d.getUTCMinutes();
if(month<10){
month="0"+month;
}
if(date<10){
date="0"+date;
}
if(hour<10){
hour="0"+hour;
}
if(min<10){
min="0"+min;
}
return t+" ("+d.getUTCFullYear()+"-"+month+"-"+date+" "+hour+":"+min+")";
};
pion.localDatetimeCellFormatter=function(t){
var d=new Date(t*1000);
var month=d.getMonth()+1;
var date=d.getDate();
var hour=d.getHours();
var min=d.getMinutes();
if(month<10){
month="0"+month;
}
if(date<10){
date="0"+date;
}
if(hour<10){
hour="0"+hour;
}
if(min<10){
min="0"+min;
}
return t+" ("+d.getUTCFullYear()+"-"+month+"-"+date+" "+hour+":"+min+")";
};
pion.makeDeleteButton=function(){
return "<button dojoType=dijit.form.Button class=\"delete_row\"><img src=\"images/icon-delete.png\" alt=\"DELETE\" border=\"0\" /></button>";
};
pion.makeEditButton=function(){
return "<button dojoType=dijit.form.Button><img src=\"images/icon-edit.png\" alt=\"EDIT\" border=\"0\" /></button>";
};
pion.grid_cell_padding=8;
pion.scrollbar_width=20;
pion.datetime_cell_width=180;
pion.initOptionalValue=function(store,item,_18d1,_18d2,_18d3){
if(store.hasAttribute(item,_18d2)){
_18d1[_18d2]=store.getValue(item,_18d2);
}else{
if(_18d3!==undefined){
_18d1[_18d2]=_18d3;
}
}
};
pion.loadCss=function(href){
var _18d5=document.createElement("link");
_18d5.href=href;
_18d5.rel="stylesheet";
_18d5.type="text/css";
var _18d6=document.getElementsByTagName("head");
if(_18d6){
_18d6=_18d6[0];
}
if(!_18d6){
_18d6=document.getElementsByTagName("html")[0];
}
if(dojo.isIE){
window.setTimeout(function(){
_18d6.appendChild(_18d5);
},0);
}else{
_18d6.appendChild(_18d5);
}
};
var init=function(){
dojo.byId("outer").style.visibility="visible";
dojo.subscribe("main_stack_container-selectChild",configPageSelected);
file_protocol=(window.location.protocol=="file:");
firefox_on_mac=navigator.userAgent.indexOf("Mac")>=0&&navigator.userAgent.indexOf("Firefox")>=0;
var _18d7=function(){
pion.terms.init();
pion.reactors.init();
pion.services.init();
pion.current_page="Reactors";
};
dojo.xhrGet({url:"/config",preventCache:true,handleAs:"xml",timeout:5000,load:function(_18d8,_18d9){
dojo.cookie("logged_in","true",{expires:1});
pion.about.checkKeyStatus({always_callback:_18d7});
},error:function(_18da,_18db){
if(_18db.xhr.status==401){
if(!dojo.cookie("logged_in")){
location.replace("login.html");
}
pion.login.doLoginDialog({success_callback:_18d7});
}else{
console.error("HTTP status code: ",_18db.xhr.status);
}
return _18da;
}});
};
dojo.addOnLoad(init);
function configPageSelected(page){
console.debug("Selected "+page.title+" configuration page");
pion.current_page=page.title;
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
}else{
if(page.onSelect){
page.onSelect();
}
}
}
}
}
}
}
}
};
dijit.form.TextBox.prototype._setValueAttr=function(value,_18de,_18df){
var _18e0;
if(value!==undefined){
_18e0=this.filter(value);
if(_18e0!==null&&((typeof _18e0!="number")||!isNaN(_18e0))){
if(_18df===undefined||!_18df.toString){
_18df=this.format(_18e0,this.constraints);
}
}else{
_18df="";
}
}
if(_18df!=null&&_18df!=undefined){
this.textbox.value=_18df;
}
dijit.form.TextBox.superclass._setValueAttr.call(this,_18e0,_18de);
};
dijit.Dialog.prototype._size=function(){
var mb=dojo.marginBox(this.domNode);
var _18e2=dijit.getViewport();
if(mb.w>=_18e2.w||mb.h>=_18e2.h){
dojo.style(this.containerNode,{height:Math.min(mb.h,Math.floor(_18e2.h*0.9))+"px",overflow:"auto",position:"relative"});
}
};
dijit.DialogUnderlay.prototype.postCreate=function(){
dojo.body().appendChild(this.domNode);
this.bgIframe=new dijit.BackgroundIframe(this.domNode);
this._modalConnect=null;
};
dijit.DialogUnderlay.prototype.hide=function(){
this.domNode.style.display="none";
if(this.bgIframe.iframe){
this.bgIframe.iframe.style.display="none";
}
dojo.disconnect(this._modalConnect);
this._modalConnect=null;
};
dijit.DialogUnderlay.prototype._onMouseDown=function(evt){
dojo.stopEvent(evt);
window.focus();
};
dijit.Dialog.prototype.show=function(){
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
this._modalconnects.push(dojo.connect(this.domNode,"onkeypress",this,"_onKey"));
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
};
dojo.i18n._preloadLocalizations("dojo.nls.pion-dojo",["xx","ROOT","en","en-us","en-gb"]);
