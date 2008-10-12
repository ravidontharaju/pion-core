/*
	Copyright (c) 2004-2008, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/book/dojo-book-0-9/introduction/licensing
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
return _1a.split(/\s*,\s*/);
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
return new RegExp(rxp,"i");
}else{
return new RegExp(rxp);
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
for(var i=0;i<_55.length;i++){
sortAttribute=_55[i];
if(sortAttribute.attribute){
var _60=(sortAttribute.descending)?-1:1;
_57.push(createSortFunction(sortAttribute.attribute,_60));
}
}
return function(_61,_62){
var i=0;
while(i<_57.length){
var ret=_57[i++](_61,_62);
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
dojo.data.util.simpleFetch.fetch=function(_65){
_65=_65||{};
if(!_65.store){
_65.store=this;
}
var _66=this;
var _67=function(_68,_69){
if(_69.onError){
var _6a=_69.scope||dojo.global;
_69.onError.call(_6a,_68,_69);
}
};
var _6b=function(_6c,_6d){
var _6e=_6d.abort||null;
var _6f=false;
var _70=_6d.start?_6d.start:0;
var _71=_6d.count?(_70+_6d.count):_6c.length;
_6d.abort=function(){
_6f=true;
if(_6e){
_6e.call(_6d);
}
};
var _72=_6d.scope||dojo.global;
if(!_6d.store){
_6d.store=_66;
}
if(_6d.onBegin){
_6d.onBegin.call(_72,_6c.length,_6d);
}
if(_6d.sort){
_6c.sort(dojo.data.util.sorter.createSortFunction(_6d.sort,_66));
}
if(_6d.onItem){
for(var i=_70;(i<_6c.length)&&(i<_71);++i){
var _74=_6c[i];
if(!_6f){
_6d.onItem.call(_72,_74,_6d);
}
}
}
if(_6d.onComplete&&!_6f){
var _75=null;
if(!_6d.onItem){
_75=_6c.slice(_70,_71);
}
_6d.onComplete.call(_72,_75,_6d);
}
};
this._fetchItems(_65,_6b,_67);
return _65;
};
}
if(!dojo._hasResource["dojo.data.ItemFileReadStore"]){
dojo._hasResource["dojo.data.ItemFileReadStore"]=true;
dojo.provide("dojo.data.ItemFileReadStore");
dojo.declare("dojo.data.ItemFileReadStore",null,{constructor:function(_76){
this._arrayOfAllItems=[];
this._arrayOfTopLevelItems=[];
this._loadFinished=false;
this._jsonFileUrl=_76.url;
this._jsonData=_76.data;
this._datatypeMap=_76.typeMap||{};
if(!this._datatypeMap["Date"]){
this._datatypeMap["Date"]={type:Date,deserialize:function(_77){
return dojo.date.stamp.fromISOString(_77);
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
},url:"",_assertIsItem:function(_78){
if(!this.isItem(_78)){
throw new Error("dojo.data.ItemFileReadStore: Invalid item argument.");
}
},_assertIsAttribute:function(_79){
if(typeof _79!=="string"){
throw new Error("dojo.data.ItemFileReadStore: Invalid attribute argument.");
}
},getValue:function(_7a,_7b,_7c){
var _7d=this.getValues(_7a,_7b);
return (_7d.length>0)?_7d[0]:_7c;
},getValues:function(_7e,_7f){
this._assertIsItem(_7e);
this._assertIsAttribute(_7f);
return _7e[_7f]||[];
},getAttributes:function(_80){
this._assertIsItem(_80);
var _81=[];
for(var key in _80){
if((key!==this._storeRefPropName)&&(key!==this._itemNumPropName)&&(key!==this._rootItemPropName)&&(key!==this._reverseRefMap)){
_81.push(key);
}
}
return _81;
},hasAttribute:function(_83,_84){
return this.getValues(_83,_84).length>0;
},containsValue:function(_85,_86,_87){
var _88=undefined;
if(typeof _87==="string"){
_88=dojo.data.util.filter.patternToRegExp(_87,false);
}
return this._containsValue(_85,_86,_87,_88);
},_containsValue:function(_89,_8a,_8b,_8c){
return dojo.some(this.getValues(_89,_8a),function(_8d){
if(_8d!==null&&!dojo.isObject(_8d)&&_8c){
if(_8d.toString().match(_8c)){
return true;
}
}else{
if(_8b===_8d){
return true;
}
}
});
},isItem:function(_8e){
if(_8e&&_8e[this._storeRefPropName]===this){
if(this._arrayOfAllItems[_8e[this._itemNumPropName]]===_8e){
return true;
}
}
return false;
},isItemLoaded:function(_8f){
return this.isItem(_8f);
},loadItem:function(_90){
this._assertIsItem(_90.item);
},getFeatures:function(){
return this._features;
},getLabel:function(_91){
if(this._labelAttr&&this.isItem(_91)){
return this.getValue(_91,this._labelAttr);
}
return undefined;
},getLabelAttributes:function(_92){
if(this._labelAttr){
return [this._labelAttr];
}
return null;
},_fetchItems:function(_93,_94,_95){
var _96=this;
var _97=function(_98,_99){
var _9a=[];
if(_98.query){
var _9b=_98.queryOptions?_98.queryOptions.ignoreCase:false;
var _9c={};
for(var key in _98.query){
var _9e=_98.query[key];
if(typeof _9e==="string"){
_9c[key]=dojo.data.util.filter.patternToRegExp(_9e,_9b);
}
}
for(var i=0;i<_99.length;++i){
var _a0=true;
var _a1=_99[i];
if(_a1===null){
_a0=false;
}else{
for(var key in _98.query){
var _9e=_98.query[key];
if(!_96._containsValue(_a1,key,_9e,_9c[key])){
_a0=false;
}
}
}
if(_a0){
_9a.push(_a1);
}
}
_94(_9a,_98);
}else{
for(var i=0;i<_99.length;++i){
var _a2=_99[i];
if(_a2!==null){
_9a.push(_a2);
}
}
_94(_9a,_98);
}
};
if(this._loadFinished){
_97(_93,this._getItemsArray(_93.queryOptions));
}else{
if(this._jsonFileUrl){
if(this._loadInProgress){
this._queuedFetches.push({args:_93,filter:_97});
}else{
this._loadInProgress=true;
var _a3={url:_96._jsonFileUrl,handleAs:"json-comment-optional"};
var _a4=dojo.xhrGet(_a3);
_a4.addCallback(function(_a5){
try{
_96._getItemsFromLoadedData(_a5);
_96._loadFinished=true;
_96._loadInProgress=false;
_97(_93,_96._getItemsArray(_93.queryOptions));
_96._handleQueuedFetches();
}
catch(e){
_96._loadFinished=true;
_96._loadInProgress=false;
_95(e,_93);
}
});
_a4.addErrback(function(_a6){
_96._loadInProgress=false;
_95(_a6,_93);
});
}
}else{
if(this._jsonData){
try{
this._loadFinished=true;
this._getItemsFromLoadedData(this._jsonData);
this._jsonData=null;
_97(_93,this._getItemsArray(_93.queryOptions));
}
catch(e){
_95(e,_93);
}
}else{
_95(new Error("dojo.data.ItemFileReadStore: No JSON source data was provided as either URL or a nested Javascript object."),_93);
}
}
}
},_handleQueuedFetches:function(){
if(this._queuedFetches.length>0){
for(var i=0;i<this._queuedFetches.length;i++){
var _a8=this._queuedFetches[i];
var _a9=_a8.args;
var _aa=_a8.filter;
if(_aa){
_aa(_a9,this._getItemsArray(_a9.queryOptions));
}else{
this.fetchItemByIdentity(_a9);
}
}
this._queuedFetches=[];
}
},_getItemsArray:function(_ab){
if(_ab&&_ab.deep){
return this._arrayOfAllItems;
}
return this._arrayOfTopLevelItems;
},close:function(_ac){
},_getItemsFromLoadedData:function(_ad){
function valueIsAnItem(_ae){
var _af=((_ae!=null)&&(typeof _ae=="object")&&(!dojo.isArray(_ae))&&(!dojo.isFunction(_ae))&&(_ae.constructor==Object)&&(typeof _ae._reference=="undefined")&&(typeof _ae._type=="undefined")&&(typeof _ae._value=="undefined"));
return _af;
};
var _b0=this;
function addItemAndSubItemsToArrayOfAllItems(_b1){
_b0._arrayOfAllItems.push(_b1);
for(var _b2 in _b1){
var _b3=_b1[_b2];
if(_b3){
if(dojo.isArray(_b3)){
var _b4=_b3;
for(var k=0;k<_b4.length;++k){
var _b6=_b4[k];
if(valueIsAnItem(_b6)){
addItemAndSubItemsToArrayOfAllItems(_b6);
}
}
}else{
if(valueIsAnItem(_b3)){
addItemAndSubItemsToArrayOfAllItems(_b3);
}
}
}
}
};
this._labelAttr=_ad.label;
var i;
var _b8;
this._arrayOfAllItems=[];
this._arrayOfTopLevelItems=_ad.items;
for(i=0;i<this._arrayOfTopLevelItems.length;++i){
_b8=this._arrayOfTopLevelItems[i];
addItemAndSubItemsToArrayOfAllItems(_b8);
_b8[this._rootItemPropName]=true;
}
var _b9={};
var key;
for(i=0;i<this._arrayOfAllItems.length;++i){
_b8=this._arrayOfAllItems[i];
for(key in _b8){
if(key!==this._rootItemPropName){
var _bb=_b8[key];
if(_bb!==null){
if(!dojo.isArray(_bb)){
_b8[key]=[_bb];
}
}else{
_b8[key]=[null];
}
}
_b9[key]=key;
}
}
while(_b9[this._storeRefPropName]){
this._storeRefPropName+="_";
}
while(_b9[this._itemNumPropName]){
this._itemNumPropName+="_";
}
while(_b9[this._reverseRefMap]){
this._reverseRefMap+="_";
}
var _bc;
var _bd=_ad.identifier;
if(_bd){
this._itemsByIdentity={};
this._features["dojo.data.api.Identity"]=_bd;
for(i=0;i<this._arrayOfAllItems.length;++i){
_b8=this._arrayOfAllItems[i];
_bc=_b8[_bd];
var _be=_bc[0];
if(!this._itemsByIdentity[_be]){
this._itemsByIdentity[_be]=_b8;
}else{
if(this._jsonFileUrl){
throw new Error("dojo.data.ItemFileReadStore:  The json data as specified by: ["+this._jsonFileUrl+"] is malformed.  Items within the list have identifier: ["+_bd+"].  Value collided: ["+_be+"]");
}else{
if(this._jsonData){
throw new Error("dojo.data.ItemFileReadStore:  The json data provided by the creation arguments is malformed.  Items within the list have identifier: ["+_bd+"].  Value collided: ["+_be+"]");
}
}
}
}
}else{
this._features["dojo.data.api.Identity"]=Number;
}
for(i=0;i<this._arrayOfAllItems.length;++i){
_b8=this._arrayOfAllItems[i];
_b8[this._storeRefPropName]=this;
_b8[this._itemNumPropName]=i;
}
for(i=0;i<this._arrayOfAllItems.length;++i){
_b8=this._arrayOfAllItems[i];
for(key in _b8){
_bc=_b8[key];
for(var j=0;j<_bc.length;++j){
_bb=_bc[j];
if(_bb!==null&&typeof _bb=="object"){
if(_bb._type&&_bb._value){
var _c0=_bb._type;
var _c1=this._datatypeMap[_c0];
if(!_c1){
throw new Error("dojo.data.ItemFileReadStore: in the typeMap constructor arg, no object class was specified for the datatype '"+_c0+"'");
}else{
if(dojo.isFunction(_c1)){
_bc[j]=new _c1(_bb._value);
}else{
if(dojo.isFunction(_c1.deserialize)){
_bc[j]=_c1.deserialize(_bb._value);
}else{
throw new Error("dojo.data.ItemFileReadStore: Value provided in typeMap was neither a constructor, nor a an object with a deserialize function");
}
}
}
}
if(_bb._reference){
var _c2=_bb._reference;
if(!dojo.isObject(_c2)){
_bc[j]=this._itemsByIdentity[_c2];
}else{
for(var k=0;k<this._arrayOfAllItems.length;++k){
var _c4=this._arrayOfAllItems[k];
var _c5=true;
for(var _c6 in _c2){
if(_c4[_c6]!=_c2[_c6]){
_c5=false;
}
}
if(_c5){
_bc[j]=_c4;
}
}
}
if(this.referenceIntegrity){
var _c7=_bc[j];
if(this.isItem(_c7)){
this._addReferenceToMap(_c7,_b8,key);
}
}
}else{
if(this.isItem(_bb)){
if(this.referenceIntegrity){
this._addReferenceToMap(_bb,_b8,key);
}
}
}
}
}
}
}
},_addReferenceToMap:function(_c8,_c9,_ca){
},getIdentity:function(_cb){
var _cc=this._features["dojo.data.api.Identity"];
if(_cc===Number){
return _cb[this._itemNumPropName];
}else{
var _cd=_cb[_cc];
if(_cd){
return _cd[0];
}
}
return null;
},fetchItemByIdentity:function(_ce){
if(!this._loadFinished){
var _cf=this;
if(this._jsonFileUrl){
if(this._loadInProgress){
this._queuedFetches.push({args:_ce});
}else{
this._loadInProgress=true;
var _d0={url:_cf._jsonFileUrl,handleAs:"json-comment-optional"};
var _d1=dojo.xhrGet(_d0);
_d1.addCallback(function(_d2){
var _d3=_ce.scope?_ce.scope:dojo.global;
try{
_cf._getItemsFromLoadedData(_d2);
_cf._loadFinished=true;
_cf._loadInProgress=false;
var _d4=_cf._getItemByIdentity(_ce.identity);
if(_ce.onItem){
_ce.onItem.call(_d3,_d4);
}
_cf._handleQueuedFetches();
}
catch(error){
_cf._loadInProgress=false;
if(_ce.onError){
_ce.onError.call(_d3,error);
}
}
});
_d1.addErrback(function(_d5){
_cf._loadInProgress=false;
if(_ce.onError){
var _d6=_ce.scope?_ce.scope:dojo.global;
_ce.onError.call(_d6,_d5);
}
});
}
}else{
if(this._jsonData){
_cf._getItemsFromLoadedData(_cf._jsonData);
_cf._jsonData=null;
_cf._loadFinished=true;
var _d7=_cf._getItemByIdentity(_ce.identity);
if(_ce.onItem){
var _d8=_ce.scope?_ce.scope:dojo.global;
_ce.onItem.call(_d8,_d7);
}
}
}
}else{
var _d7=this._getItemByIdentity(_ce.identity);
if(_ce.onItem){
var _d8=_ce.scope?_ce.scope:dojo.global;
_ce.onItem.call(_d8,_d7);
}
}
},_getItemByIdentity:function(_d9){
var _da=null;
if(this._itemsByIdentity){
_da=this._itemsByIdentity[_d9];
}else{
_da=this._arrayOfAllItems[_d9];
}
if(_da===undefined){
_da=null;
}
return _da;
},getIdentityAttributes:function(_db){
var _dc=this._features["dojo.data.api.Identity"];
if(_dc===Number){
return null;
}else{
return [_dc];
}
},_forceLoad:function(){
var _dd=this;
if(this._jsonFileUrl){
var _de={url:_dd._jsonFileUrl,handleAs:"json-comment-optional",sync:true};
var _df=dojo.xhrGet(_de);
_df.addCallback(function(_e0){
try{
if(_dd._loadInProgress!==true&&!_dd._loadFinished){
_dd._getItemsFromLoadedData(_e0);
_dd._loadFinished=true;
}
}
catch(e){
console.log(e);
throw e;
}
});
_df.addErrback(function(_e1){
throw _e1;
});
}else{
if(this._jsonData){
_dd._getItemsFromLoadedData(_dd._jsonData);
_dd._jsonData=null;
_dd._loadFinished=true;
}
}
}});
dojo.extend(dojo.data.ItemFileReadStore,dojo.data.util.simpleFetch);
}
if(!dojo._hasResource["dojo.data.ItemFileWriteStore"]){
dojo._hasResource["dojo.data.ItemFileWriteStore"]=true;
dojo.provide("dojo.data.ItemFileWriteStore");
dojo.declare("dojo.data.ItemFileWriteStore",dojo.data.ItemFileReadStore,{constructor:function(_e2){
this._features["dojo.data.api.Write"]=true;
this._features["dojo.data.api.Notification"]=true;
this._pending={_newItems:{},_modifiedItems:{},_deletedItems:{}};
if(!this._datatypeMap["Date"].serialize){
this._datatypeMap["Date"].serialize=function(obj){
return dojo.date.stamp.toISOString(obj,{zulu:true});
};
}
if(_e2&&(_e2.referenceIntegrity===false)){
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
var _ef=_e6[key];
if(!dojo.isArray(_ef)){
_ef=[_ef];
}
_ea[key]=_ef;
if(this.referenceIntegrity){
for(var i=0;i<_ef.length;i++){
var val=_ef[i];
if(this.isItem(val)){
this._addReferenceToMap(val,_ea,key);
}
}
}
}
this.onNew(_ea,_eb);
return _ea;
},_removeArrayElement:function(_f2,_f3){
var _f4=dojo.indexOf(_f2,_f3);
if(_f4!=-1){
_f2.splice(_f4,1);
return true;
}
return false;
},deleteItem:function(_f5){
this._assert(!this._saveInProgress);
this._assertIsItem(_f5);
var _f6=_f5[this._itemNumPropName];
var _f7=this.getIdentity(_f5);
if(this.referenceIntegrity){
var _f8=this.getAttributes(_f5);
if(_f5[this._reverseRefMap]){
_f5["backup_"+this._reverseRefMap]=dojo.clone(_f5[this._reverseRefMap]);
}
dojo.forEach(_f8,function(_f9){
dojo.forEach(this.getValues(_f5,_f9),function(_fa){
if(this.isItem(_fa)){
if(!_f5["backupRefs_"+this._reverseRefMap]){
_f5["backupRefs_"+this._reverseRefMap]=[];
}
_f5["backupRefs_"+this._reverseRefMap].push({id:this.getIdentity(_fa),attr:_f9});
this._removeReferenceFromMap(_fa,_f5,_f9);
}
},this);
},this);
var _fb=_f5[this._reverseRefMap];
if(_fb){
for(var _fc in _fb){
var _fd=null;
if(this._itemsByIdentity){
_fd=this._itemsByIdentity[_fc];
}else{
_fd=this._arrayOfAllItems[_fc];
}
if(_fd){
for(var _fe in _fb[_fc]){
var _ff=this.getValues(_fd,_fe)||[];
var _100=dojo.filter(_ff,function(_101){
return !(this.isItem(_101)&&this.getIdentity(_101)==_f7);
},this);
this._removeReferenceFromMap(_f5,_fd,_fe);
if(_100.length<_ff.length){
this.setValues(_fd,_fe,_100);
}
}
}
}
}
}
this._arrayOfAllItems[_f6]=null;
_f5[this._storeRefPropName]=null;
if(this._itemsByIdentity){
delete this._itemsByIdentity[_f7];
}
this._pending._deletedItems[_f7]=_f5;
if(_f5[this._rootItemPropName]){
this._removeArrayElement(this._arrayOfTopLevelItems,_f5);
}
this.onDelete(_f5);
return true;
},setValue:function(item,_103,_104){
return this._setValueOrValues(item,_103,_104,true);
},setValues:function(item,_106,_107){
return this._setValueOrValues(item,_106,_107,true);
},unsetAttribute:function(item,_109){
return this._setValueOrValues(item,_109,[],true);
},_setValueOrValues:function(item,_10b,_10c,_10d){
this._assert(!this._saveInProgress);
this._assertIsItem(item);
this._assert(dojo.isString(_10b));
this._assert(typeof _10c!=="undefined");
var _10e=this._getIdentifierAttribute();
if(_10b==_10e){
throw new Error("ItemFileWriteStore does not have support for changing the value of an item's identifier.");
}
var _10f=this._getValueOrValues(item,_10b);
var _110=this.getIdentity(item);
if(!this._pending._modifiedItems[_110]){
var _111={};
for(var key in item){
if((key===this._storeRefPropName)||(key===this._itemNumPropName)||(key===this._rootItemPropName)){
_111[key]=item[key];
}else{
if(key===this._reverseRefMap){
_111[key]=dojo.clone(item[key]);
}else{
_111[key]=item[key].slice(0,item[key].length);
}
}
}
this._pending._modifiedItems[_110]=_111;
}
var _113=false;
if(dojo.isArray(_10c)&&_10c.length===0){
_113=delete item[_10b];
_10c=undefined;
if(this.referenceIntegrity&&_10f){
var _114=_10f;
if(!dojo.isArray(_114)){
_114=[_114];
}
for(var i=0;i<_114.length;i++){
var _116=_114[i];
if(this.isItem(_116)){
this._removeReferenceFromMap(_116,item,_10b);
}
}
}
}else{
var _117;
if(dojo.isArray(_10c)){
var _118=_10c;
_117=_10c.slice(0,_10c.length);
}else{
_117=[_10c];
}
if(this.referenceIntegrity){
if(_10f){
var _114=_10f;
if(!dojo.isArray(_114)){
_114=[_114];
}
var map={};
dojo.forEach(_114,function(_11a){
if(this.isItem(_11a)){
var id=this.getIdentity(_11a);
map[id.toString()]=true;
}
},this);
dojo.forEach(_117,function(_11c){
if(this.isItem(_11c)){
var id=this.getIdentity(_11c);
if(map[id.toString()]){
delete map[id.toString()];
}else{
this._addReferenceToMap(_11c,item,_10b);
}
}
},this);
for(var rId in map){
var _11f;
if(this._itemsByIdentity){
_11f=this._itemsByIdentity[rId];
}else{
_11f=this._arrayOfAllItems[rId];
}
this._removeReferenceFromMap(_11f,item,_10b);
}
}else{
for(var i=0;i<_117.length;i++){
var _116=_117[i];
if(this.isItem(_116)){
this._addReferenceToMap(_116,item,_10b);
}
}
}
}
item[_10b]=_117;
_113=true;
}
if(_10d){
this.onSet(item,_10b,_10f,_10c);
}
return _113;
},_addReferenceToMap:function(_120,_121,_122){
var _123=this.getIdentity(_121);
var _124=_120[this._reverseRefMap];
if(!_124){
_124=_120[this._reverseRefMap]={};
}
var _125=_124[_123];
if(!_125){
_125=_124[_123]={};
}
_125[_122]=true;
},_removeReferenceFromMap:function(_126,_127,_128){
var _129=this.getIdentity(_127);
var _12a=_126[this._reverseRefMap];
var _12b;
if(_12a){
for(_12b in _12a){
if(_12b==_129){
delete _12a[_12b][_128];
if(this._isEmpty(_12a[_12b])){
delete _12a[_12b];
}
}
}
if(this._isEmpty(_12a)){
delete _126[this._reverseRefMap];
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
},_getValueOrValues:function(item,_12f){
var _130=undefined;
if(this.hasAttribute(item,_12f)){
var _131=this.getValues(item,_12f);
if(_131.length==1){
_130=_131[0];
}else{
_130=_131;
}
}
return _130;
},_flatten:function(_132){
if(this.isItem(_132)){
var item=_132;
var _134=this.getIdentity(item);
var _135={_reference:_134};
return _135;
}else{
if(typeof _132==="object"){
for(var type in this._datatypeMap){
var _137=this._datatypeMap[type];
if(dojo.isObject(_137)&&!dojo.isFunction(_137)){
if(_132 instanceof _137.type){
if(!_137.serialize){
throw new Error("ItemFileWriteStore:  No serializer defined for type mapping: ["+type+"]");
}
return {_type:type,_value:_137.serialize(_132)};
}
}else{
if(_132 instanceof _137){
return {_type:type,_value:_132.toString()};
}
}
}
}
return _132;
}
},_getNewFileContentString:function(){
var _138={};
var _139=this._getIdentifierAttribute();
if(_139!==Number){
_138.identifier=_139;
}
if(this._labelAttr){
_138.label=this._labelAttr;
}
_138.items=[];
for(var i=0;i<this._arrayOfAllItems.length;++i){
var item=this._arrayOfAllItems[i];
if(item!==null){
var _13c={};
for(var key in item){
if(key!==this._storeRefPropName&&key!==this._itemNumPropName){
var _13e=key;
var _13f=this.getValues(item,_13e);
if(_13f.length==1){
_13c[_13e]=this._flatten(_13f[0]);
}else{
var _140=[];
for(var j=0;j<_13f.length;++j){
_140.push(this._flatten(_13f[j]));
_13c[_13e]=_140;
}
}
}
}
_138.items.push(_13c);
}
}
var _142=true;
return dojo.toJson(_138,_142);
},_isEmpty:function(_143){
var _144=true;
if(dojo.isObject(_143)){
var i;
for(i in _143){
_144=false;
break;
}
}else{
if(dojo.isArray(_143)){
if(_143.length>0){
_144=false;
}
}
}
return _144;
},save:function(_146){
this._assert(!this._saveInProgress);
this._saveInProgress=true;
var self=this;
var _148=function(){
self._pending={_newItems:{},_modifiedItems:{},_deletedItems:{}};
self._saveInProgress=false;
if(_146&&_146.onComplete){
var _149=_146.scope||dojo.global;
_146.onComplete.call(_149);
}
};
var _14a=function(){
self._saveInProgress=false;
if(_146&&_146.onError){
var _14b=_146.scope||dojo.global;
_146.onError.call(_14b);
}
};
if(this._saveEverything){
var _14c=this._getNewFileContentString();
this._saveEverything(_148,_14a,_14c);
}
if(this._saveCustom){
this._saveCustom(_148,_14a);
}
if(!this._saveEverything&&!this._saveCustom){
_148();
}
},revert:function(){
this._assert(!this._saveInProgress);
var _14d;
for(_14d in this._pending._newItems){
var _14e=this._pending._newItems[_14d];
_14e[this._storeRefPropName]=null;
this._arrayOfAllItems[_14e[this._itemNumPropName]]=null;
if(_14e[this._rootItemPropName]){
this._removeArrayElement(this._arrayOfTopLevelItems,_14e);
}
if(this._itemsByIdentity){
delete this._itemsByIdentity[_14d];
}
}
for(_14d in this._pending._modifiedItems){
var _14f=this._pending._modifiedItems[_14d];
var _150=null;
if(this._itemsByIdentity){
_150=this._itemsByIdentity[_14d];
}else{
_150=this._arrayOfAllItems[_14d];
}
_14f[this._storeRefPropName]=this;
_150[this._storeRefPropName]=null;
var _151=_150[this._itemNumPropName];
this._arrayOfAllItems[_151]=_14f;
if(_150[this._rootItemPropName]){
var i;
for(i=0;i<this._arrayOfTopLevelItems.length;i++){
var _153=this._arrayOfTopLevelItems[i];
if(this.getIdentity(_153)==_14d){
this._arrayOfTopLevelItems[i]=_14f;
break;
}
}
}
if(this._itemsByIdentity){
this._itemsByIdentity[_14d]=_14f;
}
}
var _154;
for(_14d in this._pending._deletedItems){
_154=this._pending._deletedItems[_14d];
_154[this._storeRefPropName]=this;
var _155=_154[this._itemNumPropName];
if(_154["backup_"+this._reverseRefMap]){
_154[this._reverseRefMap]=_154["backup_"+this._reverseRefMap];
delete _154["backup_"+this._reverseRefMap];
}
this._arrayOfAllItems[_155]=_154;
if(this._itemsByIdentity){
this._itemsByIdentity[_14d]=_154;
}
if(_154[this._rootItemPropName]){
this._arrayOfTopLevelItems.push(_154);
}
}
for(_14d in this._pending._deletedItems){
_154=this._pending._deletedItems[_14d];
if(_154["backupRefs_"+this._reverseRefMap]){
dojo.forEach(_154["backupRefs_"+this._reverseRefMap],function(_156){
var _157;
if(this._itemsByIdentity){
_157=this._itemsByIdentity[_156.id];
}else{
_157=this._arrayOfAllItems[_156.id];
}
this._addReferenceToMap(_157,_154,_156.attr);
},this);
delete _154["backupRefs_"+this._reverseRefMap];
}
}
this._pending={_newItems:{},_modifiedItems:{},_deletedItems:{}};
return true;
},isDirty:function(item){
if(item){
var _159=this.getIdentity(item);
return new Boolean(this._pending._newItems[_159]||this._pending._modifiedItems[_159]||this._pending._deletedItems[_159]);
}else{
if(!this._isEmpty(this._pending._newItems)||!this._isEmpty(this._pending._modifiedItems)||!this._isEmpty(this._pending._deletedItems)){
return true;
}
return false;
}
},onSet:function(item,_15b,_15c,_15d){
},onNew:function(_15e,_15f){
},onDelete:function(_160){
}});
}
if(!dojo._hasResource["dojo.dnd.common"]){
dojo._hasResource["dojo.dnd.common"]=true;
dojo.provide("dojo.dnd.common");
dojo.dnd._copyKey=navigator.appVersion.indexOf("Macintosh")<0?"ctrlKey":"metaKey";
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
b.l+=t.x+n.scrollLeft;
b.t+=t.y+n.scrollTop;
var w=Math.min(dojo.dnd.H_TRIGGER_AUTOSCROLL,b.w/2),h=Math.min(dojo.dnd.V_TRIGGER_AUTOSCROLL,b.h/2),rx=e.pageX-b.l,ry=e.pageY-b.t,dx=0,dy=0;
if(rx>0&&rx<b.w){
if(rx<w){
dx=-dojo.dnd.H_AUTOSCROLL_VALUE;
}else{
if(rx>b.w-w){
dx=dojo.dnd.H_AUTOSCROLL_VALUE;
}
}
}
if(ry>0&&ry<b.h){
if(ry<h){
dy=-dojo.dnd.V_AUTOSCROLL_VALUE;
}else{
if(ry>b.h-h){
dy=dojo.dnd.V_AUTOSCROLL_VALUE;
}
}
}
var _178=n.scrollLeft,_179=n.scrollTop;
n.scrollLeft=n.scrollLeft+dx;
n.scrollTop=n.scrollTop+dy;
if(_178!=n.scrollLeft||_179!=n.scrollTop){
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
var h=this.host=host,d=node.ownerDocument,_17f=dojo.connect(d,"onmousemove",this,"onFirstMove");
this.events=[dojo.connect(d,"onmousemove",this,"onMouseMove"),dojo.connect(d,"onmouseup",this,"onMouseUp"),dojo.connect(d,"ondragstart",dojo,"stopEvent"),dojo.connect(d,"onselectstart",dojo,"stopEvent"),_17f];
if(h&&h.onMoveStart){
h.onMoveStart(this);
}
},onMouseMove:function(e){
dojo.dnd.autoScroll(e);
var m=this.marginBox;
this.host.onMove(this,{l:m.l+e.pageX,t:m.t+e.pageY});
},onMouseUp:function(e){
if(this.mouseButton==e.button){
this.destroy();
}
},onFirstMove:function(){
var s=this.node.style,l,t;
switch(s.position){
case "relative":
case "absolute":
l=Math.round(parseFloat(s.left));
t=Math.round(parseFloat(s.top));
break;
default:
s.position="absolute";
var m=dojo.marginBox(this.node);
l=m.l;
t=m.t;
break;
}
this.marginBox.l=l-this.marginBox.l;
this.marginBox.t=t-this.marginBox.t;
this.host.onFirstMove(this);
dojo.disconnect(this.events.pop());
},destroy:function(){
dojo.forEach(this.events,dojo.disconnect);
var h=this.host;
if(h&&h.onMoveStop){
h.onMoveStop(this);
}
this.events=this.node=null;
}});
}
if(!dojo._hasResource["dojo.dnd.Moveable"]){
dojo._hasResource["dojo.dnd.Moveable"]=true;
dojo.provide("dojo.dnd.Moveable");
dojo.declare("dojo.dnd.Moveable",null,{handle:"",delay:0,skip:false,constructor:function(node,_189){
this.node=dojo.byId(node);
if(!_189){
_189={};
}
this.handle=_189.handle?dojo.byId(_189.handle):null;
if(!this.handle){
this.handle=this.node;
}
this.delay=_189.delay>0?_189.delay:0;
this.skip=_189.skip;
this.mover=_189.mover?_189.mover:dojo.dnd.Mover;
this.events=[dojo.connect(this.handle,"onmousedown",this,"onMouseDown"),dojo.connect(this.handle,"ondragstart",this,"onSelectStart"),dojo.connect(this.handle,"onselectstart",this,"onSelectStart")];
},markupFactory:function(_18a,node){
return new dojo.dnd.Moveable(node,_18a);
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
new this.mover(this.node,e,this);
}
dojo.stopEvent(e);
},onMouseMove:function(e){
if(Math.abs(e.pageX-this._lastX)>this.delay||Math.abs(e.pageY-this._lastY)>this.delay){
this.onMouseUp(e);
new this.mover(this.node,e,this);
}
dojo.stopEvent(e);
},onMouseUp:function(e){
dojo.disconnect(this.events.pop());
dojo.disconnect(this.events.pop());
},onSelectStart:function(e){
if(!this.skip||!dojo.dnd.isFormElement(e)){
dojo.stopEvent(e);
}
},onMoveStart:function(_190){
dojo.publish("/dnd/move/start",[_190]);
dojo.addClass(dojo.body(),"dojoMove");
dojo.addClass(this.node,"dojoMoveItem");
},onMoveStop:function(_191){
dojo.publish("/dnd/move/stop",[_191]);
dojo.removeClass(dojo.body(),"dojoMove");
dojo.removeClass(this.node,"dojoMoveItem");
},onFirstMove:function(_192){
},onMove:function(_193,_194){
this.onMoving(_193,_194);
var s=_193.node.style;
s.left=_194.l+"px";
s.top=_194.t+"px";
this.onMoved(_193,_194);
},onMoving:function(_196,_197){
},onMoved:function(_198,_199){
}});
}
if(!dojo._hasResource["dojo.dnd.move"]){
dojo._hasResource["dojo.dnd.move"]=true;
dojo.provide("dojo.dnd.move");
dojo.declare("dojo.dnd.move.constrainedMoveable",dojo.dnd.Moveable,{constraints:function(){
},within:false,markupFactory:function(_19a,node){
return new dojo.dnd.move.constrainedMoveable(node,_19a);
},constructor:function(node,_19d){
if(!_19d){
_19d={};
}
this.constraints=_19d.constraints;
this.within=_19d.within;
},onFirstMove:function(_19e){
var c=this.constraintBox=this.constraints.call(this,_19e);
c.r=c.l+c.w;
c.b=c.t+c.h;
if(this.within){
var mb=dojo.marginBox(_19e.node);
c.r-=mb.w;
c.b-=mb.h;
}
},onMove:function(_1a1,_1a2){
var c=this.constraintBox,s=_1a1.node.style;
s.left=(_1a2.l<c.l?c.l:c.r<_1a2.l?c.r:_1a2.l)+"px";
s.top=(_1a2.t<c.t?c.t:c.b<_1a2.t?c.b:_1a2.t)+"px";
}});
dojo.declare("dojo.dnd.move.boxConstrainedMoveable",dojo.dnd.move.constrainedMoveable,{box:{},markupFactory:function(_1a5,node){
return new dojo.dnd.move.boxConstrainedMoveable(node,_1a5);
},constructor:function(node,_1a8){
var box=_1a8&&_1a8.box;
this.constraints=function(){
return box;
};
}});
dojo.declare("dojo.dnd.move.parentConstrainedMoveable",dojo.dnd.move.constrainedMoveable,{area:"content",markupFactory:function(_1aa,node){
return new dojo.dnd.move.parentConstrainedMoveable(node,_1aa);
},constructor:function(node,_1ad){
var area=_1ad&&_1ad.area;
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
dojo.dnd.move.constrainedMover=function(fun,_1b4){
dojo.deprecated("dojo.dnd.move.constrainedMover, use dojo.dnd.move.constrainedMoveable instead");
var _1b5=function(node,e,_1b8){
dojo.dnd.Mover.call(this,node,e,_1b8);
};
dojo.extend(_1b5,dojo.dnd.Mover.prototype);
dojo.extend(_1b5,{onMouseMove:function(e){
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
if(_1b4){
var mb=dojo.marginBox(this.node);
c.r-=mb.w;
c.b-=mb.h;
}
}});
return _1b5;
};
dojo.dnd.move.boxConstrainedMover=function(box,_1c1){
dojo.deprecated("dojo.dnd.move.boxConstrainedMover, use dojo.dnd.move.boxConstrainedMoveable instead");
return dojo.dnd.move.constrainedMover(function(){
return box;
},_1c1);
};
dojo.dnd.move.parentConstrainedMover=function(area,_1c3){
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
return dojo.dnd.move.constrainedMover(fun,_1c3);
};
dojo.dnd.constrainedMover=dojo.dnd.move.constrainedMover;
dojo.dnd.boxConstrainedMover=dojo.dnd.move.boxConstrainedMover;
dojo.dnd.parentConstrainedMover=dojo.dnd.move.parentConstrainedMover;
}
if(!dojo._hasResource["dojo.dnd.Container"]){
dojo._hasResource["dojo.dnd.Container"]=true;
dojo.provide("dojo.dnd.Container");
dojo.declare("dojo.dnd.Container",null,{skipForm:false,constructor:function(node,_1ca){
this.node=dojo.byId(node);
if(!_1ca){
_1ca={};
}
this.creator=_1ca.creator||null;
this.skipForm=_1ca.skipForm;
this.defaultCreator=dojo.dnd._defaultCreator(this.node);
this.map={};
this.current=null;
this.containerState="";
dojo.addClass(this.node,"dojoDndContainer");
if(!(_1ca&&_1ca._skipStartup)){
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
for(var i in this.map){
if(i in e){
continue;
}
f.call(o,m[i],i,m);
}
},clearItems:function(){
this.map={};
},getAllNodes:function(){
return dojo.query("> .dojoDndItem",this.parent);
},insertNodes:function(data,_1d5,_1d6){
if(!this.parent.firstChild){
_1d6=null;
}else{
if(_1d5){
if(!_1d6){
_1d6=this.parent.firstChild;
}
}else{
if(_1d6){
_1d6=_1d6.nextSibling;
}
}
}
if(_1d6){
for(var i=0;i<data.length;++i){
var t=this._normalizedCreator(data[i]);
this.setItem(t.node.id,{data:t.data,type:t.type});
this.parent.insertBefore(t.node,_1d6);
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
this.node=this.parent=this.current;
},markupFactory:function(_1d9,node){
_1d9._skipStartup=true;
return new dojo.dnd.Container(node,_1d9);
},startup:function(){
this.parent=this.node;
if(this.parent.tagName.toLowerCase()=="table"){
var c=this.parent.getElementsByTagName("tbody");
if(c&&c.length){
this.parent=c[0];
}
}
this.getAllNodes().forEach(function(node){
if(!node.id){
node.id=dojo.dnd.getUniqueId();
}
var type=node.getAttribute("dndType"),data=node.getAttribute("dndData");
this.setItem(node.id,{data:data?data:node.innerHTML,type:type?type.split(/\s*,\s*/):["text"]});
},this);
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
},_changeState:function(type,_1e5){
var _1e6="dojoDnd"+type;
var _1e7=type.toLowerCase()+"State";
dojo.removeClass(this.node,_1e6+this[_1e7]);
dojo.addClass(this.node,_1e6+_1e5);
this[_1e7]=_1e5;
},_addItemClass:function(node,type){
dojo.addClass(node,"dojoDndItem"+type);
},_removeItemClass:function(node,type){
dojo.removeClass(node,"dojoDndItem"+type);
},_getChildByEvent:function(e){
var node=e.target;
if(node){
for(var _1ee=node.parentNode;_1ee;node=_1ee,_1ee=node.parentNode){
if(_1ee==this.parent&&dojo.hasClass(node,"dojoDndItem")){
return node;
}
}
}
return null;
},_normalizedCreator:function(item,hint){
var t=(this.creator?this.creator:this.defaultCreator)(item,hint);
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
var c=tag=="table"?dojo.dnd._createTrTd:dojo.dnd._createNode(dojo.dnd._defaultCreatorNodes[tag]);
return function(item,hint){
var _1ff=dojo.isObject(item)&&item;
var data=(_1ff&&item.data)?item.data:item;
var type=(_1ff&&item.type)?item.type:["text"];
var t=String(data),n=(hint=="avatar"?dojo.dnd._createSpan:c)(t);
n.id=dojo.dnd.getUniqueId();
return {node:n,data:data,type:type};
};
};
}
if(!dojo._hasResource["dojo.dnd.Selector"]){
dojo._hasResource["dojo.dnd.Selector"]=true;
dojo.provide("dojo.dnd.Selector");
dojo.declare("dojo.dnd.Selector",dojo.dnd.Container,{constructor:function(node,_205){
if(!_205){
_205={};
}
this.singular=_205.singular;
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
},insertNodes:function(_20e,data,_210,_211){
var _212=this._normalizedCreator;
this._normalizedCreator=function(item,hint){
var t=_212.call(this,item,hint);
if(_20e){
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
dojo.dnd.Selector.superclass.insertNodes.call(this,data,_210,_211);
this._normalizedCreator=_212;
return this;
},destroy:function(){
dojo.dnd.Selector.superclass.destroy.call(this);
this.selection=this.anchor=null;
},markupFactory:function(_216,node){
_216._skipStartup=true;
return new dojo.dnd.Selector(node,_216);
},onMouseDown:function(e){
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
dojo.declare("dojo.dnd.Avatar",null,{constructor:function(_221){
this.manager=_221;
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
var _227=this.manager.source;
for(var i=0;i<k;++i){
tr=dojo.doc.createElement("tr");
tr.className="dojoDndAvatarItem";
td=dojo.doc.createElement("td");
if(_227.creator){
node=_227._normalizedCreator(_227.getItem(this.manager.nodes[i].id).data,"avatar").node;
}else{
node=this.manager.nodes[i].cloneNode(true);
if(node.tagName.toLowerCase()=="tr"){
var _229=dojo.doc.createElement("table"),_22a=dojo.doc.createElement("tbody");
_22a.appendChild(node);
_229.appendChild(_22a);
node=_229;
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
dojo.query("tr.dojoDndAvatarHeader td").forEach(function(node){
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
},OFFSET_X:16,OFFSET_Y:16,overSource:function(_22c){
if(this.avatar){
this.target=(_22c&&_22c.targetState!="Disabled")?_22c:null;
this.avatar.update();
}
dojo.publish("/dnd/source/over",[_22c]);
},outSource:function(_22d){
if(this.avatar){
if(this.target==_22d){
this.target=null;
this.canDropFlag=false;
this.avatar.update();
dojo.publish("/dnd/source/over",[null]);
}
}else{
dojo.publish("/dnd/source/over",[null]);
}
},startDrag:function(_22e,_22f,copy){
this.source=_22e;
this.nodes=_22f;
this.copy=Boolean(copy);
this.avatar=this.makeAvatar();
dojo.body().appendChild(this.avatar.node);
dojo.publish("/dnd/start",[_22e,_22f,this.copy]);
this.events=[dojo.connect(dojo.doc,"onmousemove",this,"onMouseMove"),dojo.connect(dojo.doc,"onmouseup",this,"onMouseUp"),dojo.connect(dojo.doc,"onkeydown",this,"onKeyDown"),dojo.connect(dojo.doc,"onkeyup",this,"onKeyUp")];
var c="dojoDnd"+(copy?"Copy":"Move");
dojo.addClass(dojo.body(),c);
},canDrop:function(flag){
var _233=Boolean(this.target&&flag);
if(this.canDropFlag!=_233){
this.canDropFlag=_233;
this.avatar.update();
}
},stopDrag:function(){
dojo.removeClass(dojo.body(),"dojoDndCopy");
dojo.removeClass(dojo.body(),"dojoDndMove");
dojo.forEach(this.events,dojo.disconnect);
this.events=[];
this.avatar.destroy();
this.avatar=null;
this.source=null;
this.nodes=[];
},makeAvatar:function(){
return new dojo.dnd.Avatar(this);
},updateAvatar:function(){
this.avatar.update();
},onMouseMove:function(e){
var a=this.avatar;
if(a){
dojo.dnd.autoScroll(e);
var s=a.node.style;
s.left=(e.pageX+this.OFFSET_X)+"px";
s.top=(e.pageY+this.OFFSET_Y)+"px";
var copy=Boolean(this.source.copyState(dojo.dnd.getCopyKeyState(e)));
if(this.copy!=copy){
this._setCopyStatus(copy);
}
}
},onMouseUp:function(e){
if(this.avatar&&(!("mouseButton" in this.source)||this.source.mouseButton==e.button)){
if(this.target&&this.canDropFlag){
var _239=[this.source,this.nodes,Boolean(this.source.copyState(dojo.dnd.getCopyKeyState(e))),this.target];
dojo.publish("/dnd/drop/before",_239);
dojo.publish("/dnd/drop",_239);
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
dojo.declare("dojo.dnd.Source",dojo.dnd.Selector,{isSource:true,horizontal:false,copyOnly:false,skipForm:false,withHandles:false,accept:["text"],constructor:function(node,_240){
dojo.mixin(this,dojo.mixin({},_240));
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
},checkAcceptance:function(_243,_244){
if(this==_243){
return true;
}
for(var i=0;i<_244.length;++i){
var type=_243.getItem(_244[i].id).type;
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
},copyState:function(_249){
return this.copyOnly||_249;
},destroy:function(){
dojo.dnd.Source.superclass.destroy.call(this);
dojo.forEach(this.topics,dojo.unsubscribe);
this.targetAnchor=null;
},markupFactory:function(_24a,node){
_24a._skipStartup=true;
return new dojo.dnd.Source(node,_24a);
},onMouseMove:function(e){
if(this.isDragging&&this.targetState=="Disabled"){
return;
}
dojo.dnd.Source.superclass.onMouseMove.call(this,e);
var m=dojo.dnd.manager();
if(this.isDragging){
var _24e=false;
if(this.current){
if(!this.targetBox||this.targetAnchor!=this.current){
this.targetBox={xy:dojo.coords(this.current,true),w:this.current.offsetWidth,h:this.current.offsetHeight};
}
if(this.horizontal){
_24e=(e.pageX-this.targetBox.xy.x)<(this.targetBox.w/2);
}else{
_24e=(e.pageY-this.targetBox.xy.y)<(this.targetBox.h/2);
}
}
if(this.current!=this.targetAnchor||_24e!=this.before){
this._markTargetAnchor(_24e);
m.canDrop(!this.current||m.source!=this||!(this.current.id in this.selection));
}
}else{
if(this.mouseDown&&this.isSource){
var _24f=this.getSelectedNodes();
if(_24f.length){
m.startDrag(this,_24f,this.copyState(dojo.dnd.getCopyKeyState(e)));
}
}
}
},onMouseDown:function(e){
if(this._legalMouseDown(e)&&(!this.skipForm||!dojo.dnd.isFormElement(e))){
this.mouseDown=true;
this.mouseButton=e.button;
dojo.dnd.Source.superclass.onMouseDown.call(this,e);
}
},onMouseUp:function(e){
if(this.mouseDown){
this.mouseDown=false;
dojo.dnd.Source.superclass.onMouseUp.call(this,e);
}
},onDndSourceOver:function(_252){
if(this!=_252){
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
},onDndStart:function(_254,_255,copy){
if(this.isSource){
this._changeState("Source",this==_254?(copy?"Copied":"Moved"):"");
}
var _257=this.accept&&this.checkAcceptance(_254,_255);
this._changeState("Target",_257?"":"Disabled");
if(_257&&this==_254){
dojo.dnd.manager().overSource(this);
}
this.isDragging=true;
},onDndDrop:function(_258,_259,copy){
do{
if(this.containerState!="Over"){
break;
}
var _25b=this._normalizedCreator;
if(this!=_258){
if(this.creator){
this._normalizedCreator=function(node,hint){
return _25b.call(this,_258.getItem(node.id).data,hint);
};
}else{
if(copy){
this._normalizedCreator=function(node,hint){
var t=_258.getItem(node.id);
var n=node.cloneNode(true);
n.id=dojo.dnd.getUniqueId();
return {node:n,data:t.data,type:t.type};
};
}else{
this._normalizedCreator=function(node,hint){
var t=_258.getItem(node.id);
_258.delItem(node.id);
return {node:node,data:t.data,type:t.type};
};
}
}
}else{
if(this.current&&this.current.id in this.selection){
break;
}
if(this.creator){
if(copy){
this._normalizedCreator=function(node,hint){
return _25b.call(this,_258.getItem(node.id).data,hint);
};
}else{
if(!this.current){
break;
}
this._normalizedCreator=function(node,hint){
var t=_258.getItem(node.id);
return {node:node,data:t.data,type:t.type};
};
}
}else{
if(copy){
this._normalizedCreator=function(node,hint){
var t=_258.getItem(node.id);
var n=node.cloneNode(true);
n.id=dojo.dnd.getUniqueId();
return {node:n,data:t.data,type:t.type};
};
}else{
if(!this.current){
break;
}
this._normalizedCreator=function(node,hint){
var t=_258.getItem(node.id);
return {node:node,data:t.data,type:t.type};
};
}
}
}
this._removeSelection();
if(this!=_258){
this._removeAnchor();
}
if(this!=_258&&!copy&&!this.creator){
_258.selectNone();
}
this.insertNodes(true,_259,this.before,this.current);
if(this!=_258&&!copy&&this.creator){
_258.deleteSelectedNodes();
}
this._normalizedCreator=_25b;
}while(false);
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
},onOverEvent:function(){
dojo.dnd.Source.superclass.onOverEvent.call(this);
dojo.dnd.manager().overSource(this);
},onOutEvent:function(){
dojo.dnd.Source.superclass.onOutEvent.call(this);
dojo.dnd.manager().outSource(this);
},_markTargetAnchor:function(_271){
if(this.current==this.targetAnchor&&this.before==_271){
return;
}
if(this.targetAnchor){
this._removeItemClass(this.targetAnchor,this.before?"Before":"After");
}
this.targetAnchor=this.current;
this.targetBox=null;
this.before=_271;
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
dojo.declare("dojo.dnd.Target",dojo.dnd.Source,{constructor:function(node,_276){
this.isSource=false;
dojo.removeClass(this.node,"dojoDndSource");
},markupFactory:function(_277,node){
_277._skipStartup=true;
return new dojo.dnd.Target(node,_277);
}});
}
if(!dojo._hasResource["dojo.dnd.TimedMoveable"]){
dojo._hasResource["dojo.dnd.TimedMoveable"]=true;
dojo.provide("dojo.dnd.TimedMoveable");
(function(){
var _279=dojo.dnd.Moveable.prototype.onMove;
dojo.declare("dojo.dnd.TimedMoveable",dojo.dnd.Moveable,{timeout:40,constructor:function(node,_27b){
if(!_27b){
_27b={};
}
if(_27b.timeout&&typeof _27b.timeout=="number"&&_27b.timeout>=0){
this.timeout=_27b.timeout;
}
},markupFactory:function(_27c,node){
return new dojo.dnd.TimedMoveable(node,_27c);
},onMoveStop:function(_27e){
if(_27e._timer){
clearTimeout(_27e._timer);
_279.call(this,_27e,_27e._leftTop);
}
dojo.dnd.Moveable.prototype.onMoveStop.apply(this,arguments);
},onMove:function(_27f,_280){
_27f._leftTop=_280;
if(!_27f._timer){
var _t=this;
_27f._timer=setTimeout(function(){
_27f._timer=null;
_279.call(_t,_27f,_27f._leftTop);
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
var _282={_fire:function(evt,args){
if(this[evt]){
this[evt].apply(this,args||[]);
}
return this;
}};
var _285=function(_286){
this._index=-1;
this._animations=_286||[];
this._current=this._onAnimateCtx=this._onEndCtx=null;
this.duration=0;
dojo.forEach(this._animations,function(a){
this.duration+=a.duration;
if(a.delay){
this.duration+=a.delay;
}
},this);
};
dojo.extend(_285,{_onAnimate:function(){
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
},play:function(_288,_289){
if(!this._current){
this._current=this._animations[this._index=0];
}
if(!_289&&this._current.status()=="playing"){
return this;
}
var _28a=dojo.connect(this._current,"beforeBegin",this,function(){
this._fire("beforeBegin");
}),_28b=dojo.connect(this._current,"onBegin",this,function(arg){
this._fire("onBegin",arguments);
}),_28d=dojo.connect(this._current,"onPlay",this,function(arg){
this._fire("onPlay",arguments);
dojo.disconnect(_28a);
dojo.disconnect(_28b);
dojo.disconnect(_28d);
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
},gotoPercent:function(_291,_292){
this.pause();
var _293=this.duration*_291;
this._current=null;
dojo.some(this._animations,function(a){
if(a.duration<=_293){
this._current=a;
return true;
}
_293-=a.duration;
return false;
});
if(this._current){
this._current.gotoPercent(_293/_current.duration,_292);
}
return this;
},stop:function(_295){
if(this._current){
if(_295){
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
dojo.extend(_285,_282);
dojo.fx.chain=function(_298){
return new _285(_298);
};
var _299=function(_29a){
this._animations=_29a||[];
this._connects=[];
this._finished=0;
this.duration=0;
dojo.forEach(_29a,function(a){
var _29c=a.duration;
if(a.delay){
_29c+=a.delay;
}
if(this.duration<_29c){
this.duration=_29c;
}
this._connects.push(dojo.connect(a,"onEnd",this,"_onEnd"));
},this);
this._pseudoAnimation=new dojo._Animation({curve:[0,1],duration:this.duration});
dojo.forEach(["beforeBegin","onBegin","onPlay","onAnimate","onPause","onStop"],function(evt){
this._connects.push(dojo.connect(this._pseudoAnimation,evt,dojo.hitch(this,"_fire",evt)));
},this);
};
dojo.extend(_299,{_doAction:function(_29e,args){
dojo.forEach(this._animations,function(a){
a[_29e].apply(a,args);
});
return this;
},_onEnd:function(){
if(++this._finished==this._animations.length){
this._fire("onEnd");
}
},_call:function(_2a1,args){
var t=this._pseudoAnimation;
t[_2a1].apply(t,args);
},play:function(_2a4,_2a5){
this._finished=0;
this._doAction("play",arguments);
this._call("play",arguments);
return this;
},pause:function(){
this._doAction("pause",arguments);
this._call("pause",arguments);
return this;
},gotoPercent:function(_2a6,_2a7){
var ms=this.duration*_2a6;
dojo.forEach(this._animations,function(a){
a.gotoPercent(a.duration<ms?1:(ms/a.duration),_2a7);
});
this._call("gotoProcent",arguments);
return this;
},stop:function(_2aa){
this._doAction("stop",arguments);
this._call("stop",arguments);
return this;
},status:function(){
return this._pseudoAnimation.status();
},destroy:function(){
dojo.forEach(this._connects,dojo.disconnect);
}});
dojo.extend(_299,_282);
dojo.fx.combine=function(_2ab){
return new _299(_2ab);
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
},node:null,showFunc:dojo.fadeIn,hideFunc:dojo.fadeOut,showDuration:200,hideDuration:200,show:function(_2ae){
return this.showAnim.play(_2ae||0);
},hide:function(_2af){
return this.hideAnim.play(_2af||0);
}});
dojo.fx.wipeIn=function(args){
args.node=dojo.byId(args.node);
var node=args.node,s=node.style;
var anim=dojo.animateProperty(dojo.mixin({properties:{height:{start:function(){
s.overflow="hidden";
if(s.visibility=="hidden"||s.display=="none"){
s.height="1px";
s.display="";
s.visibility="";
return 1;
}else{
var _2b4=dojo.style(node,"height");
return Math.max(_2b4,1);
}
},end:function(){
return node.scrollHeight;
}}}},args));
dojo.connect(anim,"onEnd",function(){
s.height="auto";
});
return anim;
};
dojo.fx.wipeOut=function(args){
var node=args.node=dojo.byId(args.node);
var s=node.style;
var anim=dojo.animateProperty(dojo.mixin({properties:{height:{end:1}}},args));
dojo.connect(anim,"beforeBegin",function(){
s.overflow="hidden";
s.display="";
});
dojo.connect(anim,"onEnd",function(){
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
var _2c3=dojo.global;
var _2c4=dojo.doc;
if(_2c4.selection){
return !_2c4.selection.createRange().text;
}else{
var _2c5=_2c3.getSelection();
if(dojo.isString(_2c5)){
return !_2c5;
}else{
return _2c5.isCollapsed||!_2c5.toString();
}
}
},getBookmark:function(){
var _2c6,_2c7=dojo.doc.selection;
if(_2c7){
var _2c8=_2c7.createRange();
if(_2c7.type.toUpperCase()=="CONTROL"){
if(_2c8.length){
_2c6=[];
var i=0,len=_2c8.length;
while(i<len){
_2c6.push(_2c8.item(i++));
}
}else{
_2c6=null;
}
}else{
_2c6=_2c8.getBookmark();
}
}else{
if(window.getSelection){
_2c7=dojo.global.getSelection();
if(_2c7){
_2c8=_2c7.getRangeAt(0);
_2c6=_2c8.cloneRange();
}
}else{
console.warn("No idea how to store the current selection for this browser!");
}
}
return _2c6;
},moveToBookmark:function(_2cb){
var _2cc=dojo.doc;
if(_2cc.selection){
var _2cd;
if(dojo.isArray(_2cb)){
_2cd=_2cc.body.createControlRange();
dojo.forEach(_2cb,"range.addElement(item)");
}else{
_2cd=_2cc.selection.createRange();
_2cd.moveToBookmark(_2cb);
}
_2cd.select();
}else{
var _2ce=dojo.global.getSelection&&dojo.global.getSelection();
if(_2ce&&_2ce.removeAllRanges){
_2ce.removeAllRanges();
_2ce.addRange(_2cb);
}else{
console.warn("No idea how to restore selection for this browser!");
}
}
},getFocus:function(menu,_2d0){
return {node:menu&&dojo.isDescendant(dijit._curFocus,menu.domNode)?dijit._prevFocus:dijit._curFocus,bookmark:!dojo.withGlobal(_2d0||dojo.global,dijit.isCollapsed)?dojo.withGlobal(_2d0||dojo.global,dijit.getBookmark):null,openedForWindow:_2d0};
},focus:function(_2d1){
if(!_2d1){
return;
}
var node="node" in _2d1?_2d1.node:_2d1,_2d3=_2d1.bookmark,_2d4=_2d1.openedForWindow;
if(node){
var _2d5=(node.tagName.toLowerCase()=="iframe")?node.contentWindow:node;
if(_2d5&&_2d5.focus){
try{
_2d5.focus();
}
catch(e){
}
}
dijit._onFocusNode(node);
}
if(_2d3&&dojo.withGlobal(_2d4||dojo.global,dijit.isCollapsed)){
if(_2d4){
_2d4.focus();
}
try{
dojo.withGlobal(_2d4||dojo.global,dijit.moveToBookmark,null,[_2d3]);
}
catch(e){
}
}
},_activeStack:[],registerWin:function(_2d6){
if(!_2d6){
_2d6=window;
}
dojo.connect(_2d6.document,"onmousedown",function(evt){
dijit._justMouseDowned=true;
setTimeout(function(){
dijit._justMouseDowned=false;
},0);
dijit._onTouchNode(evt.target||evt.srcElement);
});
var body=_2d6.document.body||_2d6.document.getElementsByTagName("body")[0];
if(body){
if(dojo.isIE){
body.attachEvent("onactivate",function(evt){
if(evt.srcElement.tagName.toLowerCase()!="body"){
dijit._onFocusNode(evt.srcElement);
}
});
body.attachEvent("ondeactivate",function(evt){
dijit._onBlurNode(evt.srcElement);
});
}else{
body.addEventListener("focus",function(evt){
dijit._onFocusNode(evt.target);
},true);
body.addEventListener("blur",function(evt){
dijit._onBlurNode(evt.target);
},true);
}
}
body=null;
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
var _2df=[];
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
_2df.unshift(id);
}
node=node.parentNode;
}
}
}
}
catch(e){
}
dijit._setStack(_2df);
},_onFocusNode:function(node){
if(node&&node.tagName&&node.tagName.toLowerCase()=="body"){
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
},_setStack:function(_2e2){
var _2e3=dijit._activeStack;
dijit._activeStack=_2e2;
for(var _2e4=0;_2e4<Math.min(_2e3.length,_2e2.length);_2e4++){
if(_2e3[_2e4]!=_2e2[_2e4]){
break;
}
}
for(var i=_2e3.length-1;i>=_2e4;i--){
var _2e6=dijit.byId(_2e3[i]);
if(_2e6){
_2e6._focused=false;
_2e6._hasBeenBlurred=true;
if(_2e6._onBlur){
_2e6._onBlur();
}
if(_2e6._setStateClass){
_2e6._setStateClass();
}
dojo.publish("widgetBlur",[_2e6]);
}
}
for(i=_2e4;i<_2e2.length;i++){
_2e6=dijit.byId(_2e2[i]);
if(_2e6){
_2e6._focused=true;
if(_2e6._onFocus){
_2e6._onFocus();
}
if(_2e6._setStateClass){
_2e6._setStateClass();
}
dojo.publish("widgetFocus",[_2e6]);
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
},add:function(_2e7){
if(this._hash[_2e7.id]){
throw new Error("Tried to register widget with id=="+_2e7.id+" but that id is already registered");
}
this._hash[_2e7.id]=_2e7;
},remove:function(id){
delete this._hash[id];
},forEach:function(func){
for(var id in this._hash){
func(this._hash[id]);
}
},filter:function(_2eb){
var res=new dijit.WidgetSet();
this.forEach(function(_2ed){
if(_2eb(_2ed)){
res.add(_2ed);
}
});
return res;
},byId:function(id){
return this._hash[id];
},byClass:function(cls){
return this.filter(function(_2f0){
return _2f0.declaredClass==cls;
});
}});
dijit.registry=new dijit.WidgetSet();
dijit._widgetTypeCtr={};
dijit.getUniqueId=function(_2f1){
var id;
do{
id=_2f1+"_"+(_2f1 in dijit._widgetTypeCtr?++dijit._widgetTypeCtr[_2f1]:dijit._widgetTypeCtr[_2f1]=0);
}while(dijit.byId(id));
return id;
};
if(dojo.isIE){
dojo.addOnUnload(function(){
dijit.registry.forEach(function(_2f3){
_2f3.destroy();
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
var _2f8=dojo.style(elem);
return (_2f8.visibility!="hidden")&&(_2f8.visibility!="collapsed")&&(_2f8.display!="none");
};
dijit.isTabNavigable=function(elem){
if(dojo.hasAttr(elem,"disabled")){
return false;
}
var _2fa=dojo.hasAttr(elem,"tabindex");
var _2fb=dojo.attr(elem,"tabindex");
if(_2fa&&_2fb>=0){
return true;
}
var name=elem.nodeName.toLowerCase();
if(((name=="a"&&dojo.hasAttr(elem,"href"))||dijit._tabElements[name])&&(!_2fa||_2fb>=0)){
return true;
}
return false;
};
dijit._getTabNavigable=function(root){
var _2fe,last,_300,_301,_302,_303;
var _304=function(_305){
dojo.query("> *",_305).forEach(function(_306){
var _307=dijit._isElementShown(_306);
if(_307&&dijit.isTabNavigable(_306)){
var _308=dojo.attr(_306,"tabindex");
if(!dojo.hasAttr(_306,"tabindex")||_308==0){
if(!_2fe){
_2fe=_306;
}
last=_306;
}else{
if(_308>0){
if(!_300||_308<_301){
_301=_308;
_300=_306;
}
if(!_302||_308>=_303){
_303=_308;
_302=_306;
}
}
}
}
if(_307){
_304(_306);
}
});
};
if(dijit._isElementShown(root)){
_304(root);
}
return {first:_2fe,last:last,lowest:_300,highest:_302};
};
dijit.getFirstInTabbingOrder=function(root){
var _30a=dijit._getTabNavigable(dojo.byId(root));
return _30a.lowest?_30a.lowest:_30a.first;
};
dijit.getLastInTabbingOrder=function(root){
var _30c=dijit._getTabNavigable(dojo.byId(root));
return _30c.last?_30c.last:_30c.highest;
};
}
if(!dojo._hasResource["dijit._base.place"]){
dojo._hasResource["dijit._base.place"]=true;
dojo.provide("dijit._base.place");
dijit.getViewport=function(){
var _30d=dojo.global;
var _30e=dojo.doc;
var w=0,h=0;
var de=_30e.documentElement;
var dew=de.clientWidth,deh=de.clientHeight;
if(dojo.isMozilla){
var minw,minh,maxw,maxh;
var dbw=_30e.body.clientWidth;
if(dbw>dew){
minw=dew;
maxw=dbw;
}else{
maxw=dew;
minw=dbw;
}
var dbh=_30e.body.clientHeight;
if(dbh>deh){
minh=deh;
maxh=dbh;
}else{
maxh=deh;
minh=dbh;
}
w=(maxw>_30d.innerWidth)?minw:maxw;
h=(maxh>_30d.innerHeight)?minh:maxh;
}else{
if(!dojo.isOpera&&_30d.innerWidth){
w=_30d.innerWidth;
h=_30d.innerHeight;
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
var _31a=dojo._docScroll();
return {w:w,h:h,l:_31a.x,t:_31a.y};
};
dijit.placeOnScreen=function(node,pos,_31d,_31e){
var _31f=dojo.map(_31d,function(_320){
return {corner:_320,pos:pos};
});
return dijit._place(node,_31f);
};
dijit._place=function(node,_322,_323){
var view=dijit.getViewport();
if(!node.parentNode||String(node.parentNode.tagName).toLowerCase()!="body"){
dojo.body().appendChild(node);
}
var best=null;
dojo.some(_322,function(_326){
var _327=_326.corner;
var pos=_326.pos;
if(_323){
_323(node,_326.aroundCorner,_327);
}
var _329=node.style;
var _32a=_329.display;
var _32b=_329.visibility;
_329.visibility="hidden";
_329.display="";
var mb=dojo.marginBox(node);
_329.display=_32a;
_329.visibility=_32b;
var _32d=(_327.charAt(1)=="L"?pos.x:Math.max(view.l,pos.x-mb.w)),_32e=(_327.charAt(0)=="T"?pos.y:Math.max(view.t,pos.y-mb.h)),endX=(_327.charAt(1)=="L"?Math.min(view.l+view.w,_32d+mb.w):pos.x),endY=(_327.charAt(0)=="T"?Math.min(view.t+view.h,_32e+mb.h):pos.y),_331=endX-_32d,_332=endY-_32e,_333=(mb.w-_331)+(mb.h-_332);
if(best==null||_333<best.overflow){
best={corner:_327,aroundCorner:_326.aroundCorner,x:_32d,y:_32e,w:_331,h:_332,overflow:_333};
}
return !_333;
});
node.style.left=best.x+"px";
node.style.top=best.y+"px";
if(best.overflow&&_323){
_323(node,best.aroundCorner,best.corner);
}
return best;
};
dijit.placeOnScreenAroundElement=function(node,_335,_336,_337){
_335=dojo.byId(_335);
var _338=_335.style.display;
_335.style.display="";
var _339=_335.offsetWidth;
var _33a=_335.offsetHeight;
var _33b=dojo.coords(_335,true);
_335.style.display=_338;
var _33c=[];
for(var _33d in _336){
_33c.push({aroundCorner:_33d,corner:_336[_33d],pos:{x:_33b.x+(_33d.charAt(1)=="L"?0:_339),y:_33b.y+(_33d.charAt(0)=="T"?0:_33a)}});
}
return dijit._place(node,_33c,_337);
};
}
if(!dojo._hasResource["dijit._base.window"]){
dojo._hasResource["dijit._base.window"]=true;
dojo.provide("dijit._base.window");
dijit.getDocumentWindow=function(doc){
if(dojo.isSafari&&!doc._parentWindow){
var fix=function(win){
win.document._parentWindow=win;
for(var i=0;i<win.frames.length;i++){
fix(win.frames[i]);
}
};
fix(window.top);
}
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
var _343=[],_344=1000,_345=1;
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
var _349=args.popup,_34a=args.orient||{"BL":"TL","TL":"BL"},_34b=args.around,id=(args.around&&args.around.id)?(args.around.id+"_dropdown"):("popup_"+_345++);
var _34d=dojo.doc.createElement("div");
dijit.setWaiRole(_34d,"presentation");
_34d.id=id;
_34d.className="dijitPopup";
_34d.style.zIndex=_344+_343.length;
_34d.style.visibility="hidden";
if(args.parent){
_34d.dijitPopupParent=args.parent.id;
}
dojo.body().appendChild(_34d);
var s=_349.domNode.style;
s.display="";
s.visibility="";
s.position="";
_34d.appendChild(_349.domNode);
var _34f=new dijit.BackgroundIframe(_34d);
var best=_34b?dijit.placeOnScreenAroundElement(_34d,_34b,_34a,_349.orient?dojo.hitch(_349,"orient"):null):dijit.placeOnScreen(_34d,args,_34a=="R"?["TR","BR","TL","BL"]:["TL","BL","TR","BR"]);
_34d.style.visibility="visible";
var _351=[];
var _352=function(){
for(var pi=_343.length-1;pi>0&&_343[pi].parent===_343[pi-1].widget;pi--){
}
return _343[pi];
};
_351.push(dojo.connect(_34d,"onkeypress",this,function(evt){
if(evt.keyCode==dojo.keys.ESCAPE&&args.onCancel){
dojo.stopEvent(evt);
args.onCancel();
}else{
if(evt.keyCode==dojo.keys.TAB){
dojo.stopEvent(evt);
var _355=_352();
if(_355&&_355.onCancel){
_355.onCancel();
}
}
}
}));
if(_349.onCancel){
_351.push(dojo.connect(_349,"onCancel",null,args.onCancel));
}
_351.push(dojo.connect(_349,_349.onExecute?"onExecute":"onChange",null,function(){
var _356=_352();
if(_356&&_356.onExecute){
_356.onExecute();
}
}));
_343.push({wrapper:_34d,iframe:_34f,widget:_349,parent:args.parent,onExecute:args.onExecute,onCancel:args.onCancel,onClose:args.onClose,handlers:_351});
if(_349.onOpen){
_349.onOpen(best);
}
return best;
};
this.close=function(_357){
while(dojo.some(_343,function(elem){
return elem.widget==_357;
})){
var top=_343.pop(),_35a=top.wrapper,_35b=top.iframe,_35c=top.widget,_35d=top.onClose;
if(_35c.onClose){
_35c.onClose();
}
dojo.forEach(top.handlers,dojo.disconnect);
if(!_35c||!_35c.domNode){
return;
}
this.prepare(_35c.domNode);
_35b.destroy();
dojo._destroyElement(_35a);
if(_35d){
_35d();
}
}
};
}();
dijit._frames=new function(){
var _35e=[];
this.pop=function(){
var _35f;
if(_35e.length){
_35f=_35e.pop();
_35f.style.display="";
}else{
if(dojo.isIE){
var html="<iframe src='javascript:\"\"'"+" style='position: absolute; left: 0px; top: 0px;"+"z-index: -1; filter:Alpha(Opacity=\"0\");'>";
_35f=dojo.doc.createElement(html);
}else{
_35f=dojo.doc.createElement("iframe");
_35f.src="javascript:\"\"";
_35f.className="dijitBackgroundIframe";
}
_35f.tabIndex=-1;
dojo.body().appendChild(_35f);
}
return _35f;
};
this.push=function(_361){
_361.style.display="";
if(dojo.isIE){
_361.style.removeExpression("width");
_361.style.removeExpression("height");
}
_35e.push(_361);
};
}();
if(dojo.isIE&&dojo.isIE<7){
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
var _364=dijit._frames.pop();
node.appendChild(_364);
if(dojo.isIE){
_364.style.setExpression("width",dojo._scopeName+".doc.getElementById('"+node.id+"').offsetWidth");
_364.style.setExpression("height",dojo._scopeName+".doc.getElementById('"+node.id+"').offsetHeight");
}
this.iframe=_364;
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
var _366=node.parentNode;
var _367=_366.scrollTop+dojo.marginBox(_366).h;
var _368=node.offsetTop+dojo.marginBox(node).h;
if(_367<_368){
_366.scrollTop+=(_368-_367);
}else{
if(_366.scrollTop>node.offsetTop){
_366.scrollTop-=(_366.scrollTop-node.offsetTop);
}
}
};
}
if(!dojo._hasResource["dijit._base.sniff"]){
dojo._hasResource["dijit._base.sniff"]=true;
dojo.provide("dijit._base.sniff");
(function(){
var d=dojo;
var ie=d.isIE;
var _36b=d.isOpera;
var maj=Math.floor;
var ff=d.isFF;
var _36e={dj_ie:ie,dj_ie6:maj(ie)==6,dj_ie7:maj(ie)==7,dj_iequirks:ie&&d.isQuirks,dj_opera:_36b,dj_opera8:maj(_36b)==8,dj_opera9:maj(_36b)==9,dj_khtml:d.isKhtml,dj_safari:d.isSafari,dj_gecko:d.isMozilla,dj_ff2:maj(ff)==2};
for(var p in _36e){
if(_36e[p]){
var html=dojo.doc.documentElement;
if(html.className){
html.className+=" "+p;
}else{
html.className=p;
}
}
}
})();
}
if(!dojo._hasResource["dijit._base.bidi"]){
dojo._hasResource["dijit._base.bidi"]=true;
dojo.provide("dijit._base.bidi");
dojo.addOnLoad(function(){
if(!dojo._isBodyLtr()){
dojo.addClass(dojo.body(),"dijitRtl");
}
});
}
if(!dojo._hasResource["dijit._base.typematic"]){
dojo._hasResource["dijit._base.typematic"]=true;
dojo.provide("dijit._base.typematic");
dijit.typematic={_fireEventAndReload:function(){
this._timer=null;
this._callback(++this._count,this._node,this._evt);
this._currentTimeout=(this._currentTimeout<0)?this._initialDelay:((this._subsequentDelay>1)?this._subsequentDelay:Math.round(this._currentTimeout*this._subsequentDelay));
this._timer=setTimeout(dojo.hitch(this,"_fireEventAndReload"),this._currentTimeout);
},trigger:function(evt,_372,node,_374,obj,_376,_377){
if(obj!=this._obj){
this.stop();
this._initialDelay=_377||500;
this._subsequentDelay=_376||0.9;
this._obj=obj;
this._evt=evt;
this._node=node;
this._currentTimeout=-1;
this._count=-1;
this._callback=dojo.hitch(_372,_374);
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
},addKeyListener:function(node,_379,_37a,_37b,_37c,_37d){
return [dojo.connect(node,"onkeypress",this,function(evt){
if(evt.keyCode==_379.keyCode&&(!_379.charCode||_379.charCode==evt.charCode)&&(_379.ctrlKey===undefined||_379.ctrlKey==evt.ctrlKey)&&(_379.altKey===undefined||_379.altKey==evt.ctrlKey)&&(_379.shiftKey===undefined||_379.shiftKey==evt.ctrlKey)){
dojo.stopEvent(evt);
dijit.typematic.trigger(_379,_37a,node,_37b,_379,_37c,_37d);
}else{
if(dijit.typematic._obj==_379){
dijit.typematic.stop();
}
}
}),dojo.connect(node,"onkeyup",this,function(evt){
if(dijit.typematic._obj==_379){
dijit.typematic.stop();
}
})];
},addMouseListener:function(node,_381,_382,_383,_384){
var dc=dojo.connect;
return [dc(node,"mousedown",this,function(evt){
dojo.stopEvent(evt);
dijit.typematic.trigger(evt,_381,node,_382,node,_383,_384);
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
dijit.typematic.trigger(evt,_381,node,_382,node,_383,_384);
setTimeout(dojo.hitch(this,dijit.typematic.stop),50);
}
})];
},addListener:function(_38b,_38c,_38d,_38e,_38f,_390,_391){
return this.addKeyListener(_38c,_38d,_38e,_38f,_390,_391).concat(this.addMouseListener(_38b,_38e,_38f,_390,_391));
}};
}
if(!dojo._hasResource["dijit._base.wai"]){
dojo._hasResource["dijit._base.wai"]=true;
dojo.provide("dijit._base.wai");
dijit.wai={onload:function(){
var div=dojo.doc.createElement("div");
div.id="a11yTestNode";
div.style.cssText="border: 1px solid;"+"border-color:red green;"+"position: absolute;"+"height: 5px;"+"top: -999px;"+"background-image: url(\""+dojo.moduleUrl("dojo","resources/blank.gif")+"\");";
dojo.body().appendChild(div);
var cs=dojo.getComputedStyle(div);
if(cs){
var _394=cs.backgroundImage;
var _395=(cs.borderTopColor==cs.borderRightColor)||(_394!=null&&(_394=="none"||_394=="url(invalid-url:)"));
dojo[_395?"addClass":"removeClass"](dojo.body(),"dijit_a11y");
dojo.body().removeChild(div);
}
}};
if(dojo.isIE||dojo.isMoz){
dojo._loaders.unshift(dijit.wai.onload);
}
dojo.mixin(dijit,{hasWaiRole:function(elem){
return elem.hasAttribute?elem.hasAttribute("role"):!!elem.getAttribute("role");
},getWaiRole:function(elem){
var _398=elem.getAttribute("role");
if(_398){
var _399=_398.indexOf(":");
return _399==-1?_398:_398.substring(_399+1);
}else{
return "";
}
},setWaiRole:function(elem,role){
elem.setAttribute("role",(dojo.isFF&&dojo.isFF<3)?"wairole:"+role:role);
},removeWaiRole:function(elem){
elem.removeAttribute("role");
},hasWaiState:function(elem,_39e){
if(dojo.isFF&&dojo.isFF<3){
return elem.hasAttributeNS("http://www.w3.org/2005/07/aaa",_39e);
}else{
return elem.hasAttribute?elem.hasAttribute("aria-"+_39e):!!elem.getAttribute("aria-"+_39e);
}
},getWaiState:function(elem,_3a0){
if(dojo.isFF&&dojo.isFF<3){
return elem.getAttributeNS("http://www.w3.org/2005/07/aaa",_3a0);
}else{
var _3a1=elem.getAttribute("aria-"+_3a0);
return _3a1?_3a1:"";
}
},setWaiState:function(elem,_3a3,_3a4){
if(dojo.isFF&&dojo.isFF<3){
elem.setAttributeNS("http://www.w3.org/2005/07/aaa","aaa:"+_3a3,_3a4);
}else{
elem.setAttribute("aria-"+_3a3,_3a4);
}
},removeWaiState:function(elem,_3a6){
if(dojo.isFF&&dojo.isFF<3){
elem.removeAttributeNS("http://www.w3.org/2005/07/aaa",_3a6);
}else{
elem.removeAttribute("aria-"+_3a6);
}
}});
}
if(!dojo._hasResource["dijit._base"]){
dojo._hasResource["dijit._base"]=true;
dojo.provide("dijit._base");
if(dojo.isSafari){
dojo.connect(window,"load",function(){
window.resizeBy(1,0);
setTimeout(function(){
window.resizeBy(-1,0);
},10);
});
}
}
if(!dojo._hasResource["dijit._Widget"]){
dojo._hasResource["dijit._Widget"]=true;
dojo.provide("dijit._Widget");
dojo.require("dijit._base");
dojo.declare("dijit._Widget",null,{id:"",lang:"",dir:"","class":"",style:"",title:"",srcNodeRef:null,domNode:null,attributeMap:{id:"",dir:"",lang:"","class":"",style:"",title:""},postscript:function(_3a7,_3a8){
this.create(_3a7,_3a8);
},create:function(_3a9,_3aa){
this.srcNodeRef=dojo.byId(_3aa);
this._connects=[];
this._attaches=[];
if(this.srcNodeRef&&(typeof this.srcNodeRef.id=="string")){
this.id=this.srcNodeRef.id;
}
if(_3a9){
this.params=_3a9;
dojo.mixin(this,_3a9);
}
this.postMixInProperties();
if(!this.id){
this.id=dijit.getUniqueId(this.declaredClass.replace(/\./g,"_"));
}
dijit.registry.add(this);
this.buildRendering();
if(this.domNode){
for(var attr in this.attributeMap){
var _3ac=this[attr];
if(typeof _3ac!="object"&&((_3ac!==""&&_3ac!==false)||(_3a9&&_3a9[attr]))){
this.setAttribute(attr,_3ac);
}
}
}
if(this.domNode){
this.domNode.setAttribute("widgetId",this.id);
}
this.postCreate();
if(this.srcNodeRef&&!this.srcNodeRef.parentNode){
delete this.srcNodeRef;
}
},postMixInProperties:function(){
},buildRendering:function(){
this.domNode=this.srcNodeRef||dojo.doc.createElement("div");
},postCreate:function(){
},startup:function(){
this._started=true;
},destroyRecursive:function(_3ad){
this.destroyDescendants();
this.destroy();
},destroy:function(_3ae){
this.uninitialize();
dojo.forEach(this._connects,function(_3af){
dojo.forEach(_3af,dojo.disconnect);
});
dojo.forEach(this._supportingWidgets||[],function(w){
w.destroy();
});
this.destroyRendering(_3ae);
dijit.registry.remove(this.id);
},destroyRendering:function(_3b1){
if(this.bgIframe){
this.bgIframe.destroy();
delete this.bgIframe;
}
if(this.domNode){
dojo._destroyElement(this.domNode);
delete this.domNode;
}
if(this.srcNodeRef){
dojo._destroyElement(this.srcNodeRef);
delete this.srcNodeRef;
}
},destroyDescendants:function(){
dojo.forEach(this.getDescendants(),function(_3b2){
_3b2.destroy();
});
},uninitialize:function(){
return false;
},onFocus:function(){
},onBlur:function(){
},_onFocus:function(e){
this.onFocus();
},_onBlur:function(){
this.onBlur();
},setAttribute:function(attr,_3b5){
var _3b6=this[this.attributeMap[attr]||"domNode"];
this[attr]=_3b5;
switch(attr){
case "class":
dojo.addClass(_3b6,_3b5);
break;
case "style":
if(_3b6.style.cssText){
_3b6.style.cssText+="; "+_3b5;
}else{
_3b6.style.cssText=_3b5;
}
break;
default:
if(/^on[A-Z]/.test(attr)){
attr=attr.toLowerCase();
}
if(typeof _3b5=="function"){
_3b5=dojo.hitch(this,_3b5);
}
dojo.attr(_3b6,attr,_3b5);
}
},toString:function(){
return "[Widget "+this.declaredClass+", "+(this.id||"NO ID")+"]";
},getDescendants:function(){
if(this.containerNode){
var list=dojo.query("[widgetId]",this.containerNode);
return list.map(dijit.byNode);
}else{
return [];
}
},nodesWithKeyClick:["input","button"],connect:function(obj,_3b9,_3ba){
var _3bb=[];
if(_3b9=="ondijitclick"){
if(!this.nodesWithKeyClick[obj.nodeName]){
_3bb.push(dojo.connect(obj,"onkeydown",this,function(e){
if(e.keyCode==dojo.keys.ENTER){
return (dojo.isString(_3ba))?this[_3ba](e):_3ba.call(this,e);
}else{
if(e.keyCode==dojo.keys.SPACE){
dojo.stopEvent(e);
}
}
}));
_3bb.push(dojo.connect(obj,"onkeyup",this,function(e){
if(e.keyCode==dojo.keys.SPACE){
return dojo.isString(_3ba)?this[_3ba](e):_3ba.call(this,e);
}
}));
}
_3b9="onclick";
}
_3bb.push(dojo.connect(obj,_3b9,this,_3ba));
this._connects.push(_3bb);
return _3bb;
},disconnect:function(_3be){
for(var i=0;i<this._connects.length;i++){
if(this._connects[i]==_3be){
dojo.forEach(_3be,dojo.disconnect);
this._connects.splice(i,1);
return;
}
}
},isLeftToRight:function(){
if(!("_ltr" in this)){
this._ltr=dojo.getComputedStyle(this.domNode).direction!="rtl";
}
return this._ltr;
},isFocusable:function(){
return this.focus&&(dojo.style(this.domNode,"display")!="none");
}});
}
if(!dojo._hasResource["dojo.string"]){
dojo._hasResource["dojo.string"]=true;
dojo.provide("dojo.string");
dojo.string.pad=function(text,size,ch,end){
var out=String(text);
if(!ch){
ch="0";
}
while(out.length<size){
if(end){
out+=ch;
}else{
out=ch+out;
}
}
return out;
};
dojo.string.substitute=function(_3c5,map,_3c7,_3c8){
return _3c5.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g,function(_3c9,key,_3cb){
var _3cc=dojo.getObject(key,false,map);
if(_3cb){
_3cc=dojo.getObject(_3cb,false,_3c8)(_3cc);
}
if(_3c7){
_3cc=_3c7(_3cc,key);
}
return _3cc.toString();
});
};
dojo.string.trim=function(str){
str=str.replace(/^\s+/,"");
for(var i=str.length-1;i>0;i--){
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
dojo.declare("dijit._Templated",null,{templateNode:null,templateString:null,templatePath:null,widgetsInTemplate:false,containerNode:null,_skipNodeCache:false,_stringRepl:function(tmpl){
var _3d0=this.declaredClass,_3d1=this;
return dojo.string.substitute(tmpl,this,function(_3d2,key){
if(key.charAt(0)=="!"){
_3d2=_3d1[key.substr(1)];
}
if(typeof _3d2=="undefined"){
throw new Error(_3d0+" template:"+key);
}
if(!_3d2){
return "";
}
return key.charAt(0)=="!"?_3d2:_3d2.toString().replace(/"/g,"&quot;");
},this);
},buildRendering:function(){
var _3d4=dijit._Templated.getCachedTemplate(this.templatePath,this.templateString,this._skipNodeCache);
var node;
if(dojo.isString(_3d4)){
node=dijit._Templated._createNodesFromText(this._stringRepl(_3d4))[0];
}else{
node=_3d4.cloneNode(true);
}
this._attachTemplateNodes(node);
var _3d6=this.srcNodeRef;
if(_3d6&&_3d6.parentNode){
_3d6.parentNode.replaceChild(node,_3d6);
}
this.domNode=node;
if(this.widgetsInTemplate){
var cw=this._supportingWidgets=dojo.parser.parse(node);
this._attachTemplateNodes(cw,function(n,p){
return n[p];
});
}
this._fillContent(_3d6);
},_fillContent:function(_3da){
var dest=this.containerNode;
if(_3da&&dest){
while(_3da.hasChildNodes()){
dest.appendChild(_3da.firstChild);
}
}
},_attachTemplateNodes:function(_3dc,_3dd){
_3dd=_3dd||function(n,p){
return n.getAttribute(p);
};
var _3e0=dojo.isArray(_3dc)?_3dc:(_3dc.all||_3dc.getElementsByTagName("*"));
var x=dojo.isArray(_3dc)?0:-1;
for(;x<_3e0.length;x++){
var _3e2=(x==-1)?_3dc:_3e0[x];
if(this.widgetsInTemplate&&_3dd(_3e2,"dojoType")){
continue;
}
var _3e3=_3dd(_3e2,"dojoAttachPoint");
if(_3e3){
var _3e4,_3e5=_3e3.split(/\s*,\s*/);
while((_3e4=_3e5.shift())){
if(dojo.isArray(this[_3e4])){
this[_3e4].push(_3e2);
}else{
this[_3e4]=_3e2;
}
}
}
var _3e6=_3dd(_3e2,"dojoAttachEvent");
if(_3e6){
var _3e7,_3e8=_3e6.split(/\s*,\s*/);
var trim=dojo.trim;
while((_3e7=_3e8.shift())){
if(_3e7){
var _3ea=null;
if(_3e7.indexOf(":")!=-1){
var _3eb=_3e7.split(":");
_3e7=trim(_3eb[0]);
_3ea=trim(_3eb[1]);
}else{
_3e7=trim(_3e7);
}
if(!_3ea){
_3ea=_3e7;
}
this.connect(_3e2,_3e7,_3ea);
}
}
}
var role=_3dd(_3e2,"waiRole");
if(role){
dijit.setWaiRole(_3e2,role);
}
var _3ed=_3dd(_3e2,"waiState");
if(_3ed){
dojo.forEach(_3ed.split(/\s*,\s*/),function(_3ee){
if(_3ee.indexOf("-")!=-1){
var pair=_3ee.split("-");
dijit.setWaiState(_3e2,pair[0],pair[1]);
}
});
}
}
}});
dijit._Templated._templateCache={};
dijit._Templated.getCachedTemplate=function(_3f0,_3f1,_3f2){
var _3f3=dijit._Templated._templateCache;
var key=_3f1||_3f0;
var _3f5=_3f3[key];
if(_3f5){
return _3f5;
}
if(!_3f1){
_3f1=dijit._Templated._sanitizeTemplateString(dojo._getText(_3f0));
}
_3f1=dojo.string.trim(_3f1);
if(_3f2||_3f1.match(/\$\{([^\}]+)\}/g)){
return (_3f3[key]=_3f1);
}else{
return (_3f3[key]=dijit._Templated._createNodesFromText(_3f1)[0]);
}
};
dijit._Templated._sanitizeTemplateString=function(_3f6){
if(_3f6){
_3f6=_3f6.replace(/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,"");
var _3f7=_3f6.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
if(_3f7){
_3f6=_3f7[1];
}
}else{
_3f6="";
}
return _3f6;
};
if(dojo.isIE){
dojo.addOnUnload(function(){
var _3f8=dijit._Templated._templateCache;
for(var key in _3f8){
var _3fa=_3f8[key];
if(!isNaN(_3fa.nodeType)){
dojo._destroyElement(_3fa);
}
delete _3f8[key];
}
});
}
(function(){
var _3fb={cell:{re:/^<t[dh][\s\r\n>]/i,pre:"<table><tbody><tr>",post:"</tr></tbody></table>"},row:{re:/^<tr[\s\r\n>]/i,pre:"<table><tbody>",post:"</tbody></table>"},section:{re:/^<(thead|tbody|tfoot)[\s\r\n>]/i,pre:"<table>",post:"</table>"}};
var tn;
dijit._Templated._createNodesFromText=function(text){
if(!tn){
tn=dojo.doc.createElement("div");
tn.style.display="none";
dojo.body().appendChild(tn);
}
var _3fe="none";
var _3ff=text.replace(/^\s+/,"");
for(var type in _3fb){
var map=_3fb[type];
if(map.re.test(_3ff)){
_3fe=type;
text=map.pre+text+map.post;
break;
}
}
tn.innerHTML=text;
if(tn.normalize){
tn.normalize();
}
var tag={cell:"tr",row:"tbody",section:"table"}[_3fe];
var _403=(typeof tag!="undefined")?tn.getElementsByTagName(tag)[0]:tn;
var _404=[];
while(_403.firstChild){
_404.push(_403.removeChild(_403.firstChild));
}
tn.innerHTML="";
return _404;
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
var _407=dijit.byId(id);
return _407.isContainer?_407:null;
}
}
return null;
},_getSibling:function(_408){
var node=this.domNode;
do{
node=node[_408+"Sibling"];
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
}});
dojo.declare("dijit._Container",null,{isContainer:true,addChild:function(_40b,_40c){
if(_40c===undefined){
_40c="last";
}
var _40d=this.containerNode||this.domNode;
if(_40c&&typeof _40c=="number"){
var _40e=dojo.query("> [widgetid]",_40d);
if(_40e&&_40e.length>=_40c){
_40d=_40e[_40c-1];
_40c="after";
}
}
dojo.place(_40b.domNode,_40d,_40c);
if(this._started&&!_40b._started){
_40b.startup();
}
},removeChild:function(_40f){
var node=_40f.domNode;
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
return dojo.query("> [widgetId]",this.containerNode||this.domNode).map(dijit.byNode);
},hasChildren:function(){
var cn=this.containerNode||this.domNode;
return !!this._firstElement(cn);
},_getSiblingOfChild:function(_414,dir){
var node=_414.domNode;
var _417=(dir>0?"nextSibling":"previousSibling");
do{
node=node[_417];
}while(node&&(node.nodeType!=1||!dijit.byNode(node)));
return node?dijit.byNode(node):null;
}});
dojo.declare("dijit._KeyNavContainer",[dijit._Container],{_keyNavCodes:{},connectKeyNavHandlers:function(_418,_419){
var _41a=this._keyNavCodes={};
var prev=dojo.hitch(this,this.focusPrev);
var next=dojo.hitch(this,this.focusNext);
dojo.forEach(_418,function(code){
_41a[code]=prev;
});
dojo.forEach(_419,function(code){
_41a[code]=next;
});
this.connect(this.domNode,"onkeypress","_onContainerKeypress");
this.connect(this.domNode,"onfocus","_onContainerFocus");
},startupKeyNavChildren:function(){
dojo.forEach(this.getChildren(),dojo.hitch(this,"_startupChild"));
},addChild:function(_41f,_420){
dijit._KeyNavContainer.superclass.addChild.apply(this,arguments);
this._startupChild(_41f);
},focus:function(){
this.focusFirstChild();
},focusFirstChild:function(){
this.focusChild(this._getFirstFocusableChild());
},focusNext:function(){
if(this.focusedChild&&this.focusedChild.hasNextFocalNode&&this.focusedChild.hasNextFocalNode()){
this.focusedChild.focusNext();
return;
}
var _421=this._getNextFocusableChild(this.focusedChild,1);
if(_421.getFocalNodes){
this.focusChild(_421,_421.getFocalNodes()[0]);
}else{
this.focusChild(_421);
}
},focusPrev:function(){
if(this.focusedChild&&this.focusedChild.hasPrevFocalNode&&this.focusedChild.hasPrevFocalNode()){
this.focusedChild.focusPrev();
return;
}
var _422=this._getNextFocusableChild(this.focusedChild,-1);
if(_422.getFocalNodes){
var _423=_422.getFocalNodes();
this.focusChild(_422,_423[_423.length-1]);
}else{
this.focusChild(_422);
}
},focusChild:function(_424,node){
if(_424){
if(this.focusedChild&&_424!==this.focusedChild){
this._onChildBlur(this.focusedChild);
}
this.focusedChild=_424;
if(node&&_424.focusFocalNode){
_424.focusFocalNode(node);
}else{
_424.focus();
}
}
},_startupChild:function(_426){
if(_426.getFocalNodes){
dojo.forEach(_426.getFocalNodes(),function(node){
dojo.attr(node,"tabindex",-1);
this._connectNode(node);
},this);
}else{
var node=_426.focusNode||_426.domNode;
if(_426.isFocusable()){
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
var func=this._keyNavCodes[evt.keyCode];
if(func){
func();
dojo.stopEvent(evt);
}
},_onNodeFocus:function(evt){
dojo.attr(this.domNode,"tabindex",-1);
var _42e=dijit.getEnclosingWidget(evt.target);
if(_42e&&_42e.isFocusable()){
this.focusedChild=_42e;
}
dojo.stopEvent(evt);
},_onNodeBlur:function(evt){
if(this.tabIndex){
dojo.attr(this.domNode,"tabindex",this.tabIndex);
}
dojo.stopEvent(evt);
},_onChildBlur:function(_430){
},_getFirstFocusableChild:function(){
return this._getNextFocusableChild(null,1);
},_getNextFocusableChild:function(_431,dir){
if(_431){
_431=this._getSiblingOfChild(_431,dir);
}
var _433=this.getChildren();
for(var i=0;i<_433.length;i++){
if(!_431){
_431=_433[(dir>0)?0:(_433.length-1)];
}
if(_431.isFocusable()){
return _431;
}
_431=this._getSiblingOfChild(_431,dir);
}
return null;
}});
}
if(!dojo._hasResource["dijit.layout._LayoutWidget"]){
dojo._hasResource["dijit.layout._LayoutWidget"]=true;
dojo.provide("dijit.layout._LayoutWidget");
dojo.declare("dijit.layout._LayoutWidget",[dijit._Widget,dijit._Container,dijit._Contained],{isLayoutContainer:true,postCreate:function(){
dojo.addClass(this.domNode,"dijitContainer");
},startup:function(){
if(this._started){
return;
}
dojo.forEach(this.getChildren(),function(_435){
_435.startup();
});
if(!this.getParent||!this.getParent()){
this.resize();
this.connect(window,"onresize",function(){
this.resize();
});
}
this.inherited(arguments);
},resize:function(args){
var node=this.domNode;
if(args){
dojo.marginBox(node,args);
if(args.t){
node.style.top=args.t+"px";
}
if(args.l){
node.style.left=args.l+"px";
}
}
var mb=dojo.mixin(dojo.marginBox(node),args||{});
this._contentBox=dijit.layout.marginBox2contentBox(node,mb);
this.layout();
},layout:function(){
}});
dijit.layout.marginBox2contentBox=function(node,mb){
var cs=dojo.getComputedStyle(node);
var me=dojo._getMarginExtents(node,cs);
var pb=dojo._getPadBorderExtents(node,cs);
return {l:dojo._toPixelValue(node,cs.paddingLeft),t:dojo._toPixelValue(node,cs.paddingTop),w:mb.w-(me.w+pb.w),h:mb.h-(me.h+pb.h)};
};
(function(){
var _43e=function(word){
return word.substring(0,1).toUpperCase()+word.substring(1);
};
var size=function(_441,dim){
_441.resize?_441.resize(dim):dojo.marginBox(_441.domNode,dim);
dojo.mixin(_441,dojo.marginBox(_441.domNode));
dojo.mixin(_441,dim);
};
dijit.layout.layoutChildren=function(_443,dim,_445){
dim=dojo.mixin({},dim);
dojo.addClass(_443,"dijitLayoutContainer");
_445=dojo.filter(_445,function(item){
return item.layoutAlign!="client";
}).concat(dojo.filter(_445,function(item){
return item.layoutAlign=="client";
}));
dojo.forEach(_445,function(_448){
var elm=_448.domNode,pos=_448.layoutAlign;
var _44b=elm.style;
_44b.left=dim.l+"px";
_44b.top=dim.t+"px";
_44b.bottom=_44b.right="auto";
dojo.addClass(elm,"dijitAlign"+_43e(pos));
if(pos=="top"||pos=="bottom"){
size(_448,{w:dim.w});
dim.h-=_448.h;
if(pos=="top"){
dim.t+=_448.h;
}else{
_44b.top=dim.t+dim.h+"px";
}
}else{
if(pos=="left"||pos=="right"){
size(_448,{h:dim.h});
dim.w-=_448.w;
if(pos=="left"){
dim.l+=_448.w;
}else{
_44b.left=dim.l+dim.w+"px";
}
}else{
if(pos=="client"){
size(_448,dim);
}
}
}
});
};
})();
}
if(!dojo._hasResource["dojo.i18n"]){
dojo._hasResource["dojo.i18n"]=true;
dojo.provide("dojo.i18n");
dojo.i18n.getLocalization=function(_44c,_44d,_44e){
_44e=dojo.i18n.normalizeLocale(_44e);
var _44f=_44e.split("-");
var _450=[_44c,"nls",_44d].join(".");
var _451=dojo._loadedModules[_450];
if(_451){
var _452;
for(var i=_44f.length;i>0;i--){
var loc=_44f.slice(0,i).join("_");
if(_451[loc]){
_452=_451[loc];
break;
}
}
if(!_452){
_452=_451.ROOT;
}
if(_452){
var _455=function(){
};
_455.prototype=_452;
return new _455();
}
}
throw new Error("Bundle not found: "+_44d+" in "+_44c+" , locale="+_44e);
};
dojo.i18n.normalizeLocale=function(_456){
var _457=_456?_456.toLowerCase():dojo.locale;
if(_457=="root"){
_457="ROOT";
}
return _457;
};
dojo.i18n._requireLocalization=function(_458,_459,_45a,_45b){
var _45c=dojo.i18n.normalizeLocale(_45a);
var _45d=[_458,"nls",_459].join(".");
var _45e="";
if(_45b){
var _45f=_45b.split(",");
for(var i=0;i<_45f.length;i++){
if(_45c.indexOf(_45f[i])==0){
if(_45f[i].length>_45e.length){
_45e=_45f[i];
}
}
}
if(!_45e){
_45e="ROOT";
}
}
var _461=_45b?_45e:_45c;
var _462=dojo._loadedModules[_45d];
var _463=null;
if(_462){
if(dojo.config.localizationComplete&&_462._built){
return;
}
var _464=_461.replace(/-/g,"_");
var _465=_45d+"."+_464;
_463=dojo._loadedModules[_465];
}
if(!_463){
_462=dojo["provide"](_45d);
var syms=dojo._getModuleSymbols(_458);
var _467=syms.concat("nls").join("/");
var _468;
dojo.i18n._searchLocalePath(_461,_45b,function(loc){
var _46a=loc.replace(/-/g,"_");
var _46b=_45d+"."+_46a;
var _46c=false;
if(!dojo._loadedModules[_46b]){
dojo["provide"](_46b);
var _46d=[_467];
if(loc!="ROOT"){
_46d.push(loc);
}
_46d.push(_459);
var _46e=_46d.join("/")+".js";
_46c=dojo._loadPath(_46e,null,function(hash){
var _470=function(){
};
_470.prototype=_468;
_462[_46a]=new _470();
for(var j in hash){
_462[_46a][j]=hash[j];
}
});
}else{
_46c=true;
}
if(_46c&&_462[_46a]){
_468=_462[_46a];
}else{
_462[_46a]=_468;
}
if(_45b){
return true;
}
});
}
if(_45b&&_45c!=_45e){
_462[_45c.replace(/-/g,"_")]=_462[_45e.replace(/-/g,"_")];
}
};
(function(){
var _472=dojo.config.extraLocale;
if(_472){
if(!_472 instanceof Array){
_472=[_472];
}
var req=dojo.i18n._requireLocalization;
dojo.i18n._requireLocalization=function(m,b,_476,_477){
req(m,b,_476,_477);
if(_476){
return;
}
for(var i=0;i<_472.length;i++){
req(m,b,_472[i],_477);
}
};
}
})();
dojo.i18n._searchLocalePath=function(_479,down,_47b){
_479=dojo.i18n.normalizeLocale(_479);
var _47c=_479.split("-");
var _47d=[];
for(var i=_47c.length;i>0;i--){
_47d.push(_47c.slice(0,i).join("-"));
}
_47d.push(false);
if(down){
_47d.reverse();
}
for(var j=_47d.length-1;j>=0;j--){
var loc=_47d[j]||"ROOT";
var stop=_47b(loc);
if(stop){
break;
}
}
};
dojo.i18n._preloadLocalizations=function(_482,_483){
function preload(_484){
_484=dojo.i18n.normalizeLocale(_484);
dojo.i18n._searchLocalePath(_484,true,function(loc){
for(var i=0;i<_483.length;i++){
if(_483[i]==loc){
dojo["require"](_482+"_"+loc);
return true;
}
}
return false;
});
};
preload();
var _487=dojo.config.extraLocale||[];
for(var i=0;i<_487.length;i++){
preload(_487[i]);
}
};
}
if(!dojo._hasResource["dijit.layout.ContentPane"]){
dojo._hasResource["dijit.layout.ContentPane"]=true;
dojo.provide("dijit.layout.ContentPane");
dojo.declare("dijit.layout.ContentPane",dijit._Widget,{href:"",extractContent:false,parseOnLoad:true,preventCache:false,preload:false,refreshOnShow:false,loadingMessage:"<span class='dijitContentPaneLoading'>${loadingState}</span>",errorMessage:"<span class='dijitContentPaneError'>${errorState}</span>",isLoaded:false,"class":"dijitContentPane",doLayout:"auto",postCreate:function(){
this.domNode.title="";
if(!this.containerNode){
this.containerNode=this.domNode;
}
if(this.preload){
this._loadCheck();
}
var _489=dojo.i18n.getLocalization("dijit","loading",this.lang);
this.loadingMessage=dojo.string.substitute(this.loadingMessage,_489);
this.errorMessage=dojo.string.substitute(this.errorMessage,_489);
var _48a=dijit.getWaiRole(this.domNode);
if(!_48a){
dijit.setWaiRole(this.domNode,"group");
}
dojo.addClass(this.domNode,this["class"]);
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
var _48b=dojo.query(">",this.containerNode||this.domNode),_48c=_48b.filter("[widgetId]");
if(_48b.length==1&&_48c.length==1){
this.isContainer=true;
this._singleChild=dijit.byNode(_48c[0]);
}else{
delete this.isContainer;
delete this._singleChild;
}
},refresh:function(){
return this._prepareLoad(true);
},setHref:function(href){
this.href=href;
return this._prepareLoad();
},setContent:function(data){
if(!this._isDownloaded){
this.href="";
this._onUnloadHandler();
}
this._setContent(data||"");
this._isDownloaded=false;
if(this.parseOnLoad){
this._createSubWidgets();
}
if(this.doLayout!="false"&&this.doLayout!==false){
this._checkIfSingleChild();
if(this._singleChild&&this._singleChild.resize){
this._singleChild.startup();
this._singleChild.resize(this._contentBox||dojo.contentBox(this.containerNode||this.domNode));
}
}
this._onLoadHandler();
},cancel:function(){
if(this._xhrDfd&&(this._xhrDfd.fired==-1)){
this._xhrDfd.cancel();
}
delete this._xhrDfd;
},destroy:function(){
if(this._beingDestroyed){
return;
}
this._onUnloadHandler();
this._beingDestroyed=true;
this.inherited("destroy",arguments);
},resize:function(size){
dojo.marginBox(this.domNode,size);
var node=this.containerNode||this.domNode,mb=dojo.mixin(dojo.marginBox(node),size||{});
this._contentBox=dijit.layout.marginBox2contentBox(node,mb);
if(this._singleChild&&this._singleChild.resize){
this._singleChild.resize(this._contentBox);
}
},_prepareLoad:function(_492){
this.cancel();
this.isLoaded=false;
this._loadCheck(_492);
},_isShown:function(){
if("open" in this){
return this.open;
}else{
var node=this.domNode;
return (node.style.display!="none")&&(node.style.visibility!="hidden");
}
},_loadCheck:function(_494){
var _495=this._isShown();
if(this.href&&(_494||(this.preload&&!this._xhrDfd)||(this.refreshOnShow&&_495&&!this._xhrDfd)||(!this.isLoaded&&_495&&!this._xhrDfd))){
this._downloadExternalContent();
}
},_downloadExternalContent:function(){
this._onUnloadHandler();
this._setContent(this.onDownloadStart.call(this));
var self=this;
var _497={preventCache:(this.preventCache||this.refreshOnShow),url:this.href,handleAs:"text"};
if(dojo.isObject(this.ioArgs)){
dojo.mixin(_497,this.ioArgs);
}
var hand=this._xhrDfd=(this.ioMethod||dojo.xhrGet)(_497);
hand.addCallback(function(html){
try{
self.onDownloadEnd.call(self);
self._isDownloaded=true;
self.setContent.call(self,html);
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
},_setContent:function(cont){
this.destroyDescendants();
try{
var node=this.containerNode||this.domNode;
while(node.firstChild){
dojo._destroyElement(node.firstChild);
}
if(typeof cont=="string"){
if(this.extractContent){
match=cont.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
if(match){
cont=match[1];
}
}
node.innerHTML=cont;
}else{
if(cont.nodeType){
node.appendChild(cont);
}else{
dojo.forEach(cont,function(n){
node.appendChild(n.cloneNode(true));
});
}
}
}
catch(e){
var _49e=this.onContentError(e);
try{
node.innerHTML=_49e;
}
catch(e){
console.error("Fatal "+this.id+" could not change content due to "+e.message,e);
}
}
},_onError:function(type,err,_4a1){
var _4a2=this["on"+type+"Error"].call(this,err);
if(_4a1){
console.error(_4a1,err);
}else{
if(_4a2){
this._setContent.call(this,_4a2);
}
}
},_createSubWidgets:function(){
var _4a3=this.containerNode||this.domNode;
try{
dojo.parser.parse(_4a3,true);
}
catch(e){
this._onError("Content",e,"Couldn't create widgets in "+this.id+(this.href?" from "+this.href:""));
}
},onLoad:function(e){
},onUnload:function(e){
},onDownloadStart:function(){
return this.loadingMessage;
},onContentError:function(_4a6){
},onDownloadError:function(_4a7){
return this.errorMessage;
},onDownloadEnd:function(){
}});
}
if(!dojo._hasResource["dijit.form.Form"]){
dojo._hasResource["dijit.form.Form"]=true;
dojo.provide("dijit.form.Form");
dojo.declare("dijit.form._FormMixin",null,{reset:function(){
dojo.forEach(this.getDescendants(),function(_4a8){
if(_4a8.reset){
_4a8.reset();
}
});
},validate:function(){
var _4a9=false;
return dojo.every(dojo.map(this.getDescendants(),function(_4aa){
_4aa._hasBeenBlurred=true;
var _4ab=!_4aa.validate||_4aa.validate();
if(!_4ab&&!_4a9){
dijit.scrollIntoView(_4aa.containerNode||_4aa.domNode);
_4aa.focus();
_4a9=true;
}
return _4ab;
}),"return item;");
},setValues:function(obj){
var map={};
dojo.forEach(this.getDescendants(),function(_4ae){
if(!_4ae.name){
return;
}
var _4af=map[_4ae.name]||(map[_4ae.name]=[]);
_4af.push(_4ae);
});
for(var name in map){
var _4b1=map[name],_4b2=dojo.getObject(name,false,obj);
if(!dojo.isArray(_4b2)){
_4b2=[_4b2];
}
if(typeof _4b1[0].checked=="boolean"){
dojo.forEach(_4b1,function(w,i){
w.setValue(dojo.indexOf(_4b2,w.value)!=-1);
});
}else{
if(_4b1[0]._multiValue){
_4b1[0].setValue(_4b2);
}else{
dojo.forEach(_4b1,function(w,i){
w.setValue(_4b2[i]);
});
}
}
}
},getValues:function(){
var obj={};
dojo.forEach(this.getDescendants(),function(_4b8){
var name=_4b8.name;
if(!name){
return;
}
var _4ba=(_4b8.getValue&&!_4b8._getValueDeprecated)?_4b8.getValue():_4b8.value;
if(typeof _4b8.checked=="boolean"){
if(/Radio/.test(_4b8.declaredClass)){
if(_4ba!==false){
dojo.setObject(name,_4ba,obj);
}
}else{
var ary=dojo.getObject(name,false,obj);
if(!ary){
ary=[];
dojo.setObject(name,ary,obj);
}
if(_4ba!==false){
ary.push(_4ba);
}
}
}else{
dojo.setObject(name,_4ba,obj);
}
});
return obj;
},isValid:function(){
return dojo.every(this.getDescendants(),function(_4bc){
return !_4bc.isValid||_4bc.isValid();
});
}});
dojo.declare("dijit.form.Form",[dijit._Widget,dijit._Templated,dijit.form._FormMixin],{name:"",action:"",method:"",encType:"","accept-charset":"",accept:"",target:"",templateString:"<form dojoAttachPoint='containerNode' dojoAttachEvent='onreset:_onReset,onsubmit:_onSubmit' name='${name}'></form>",attributeMap:dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap),{action:"",method:"",encType:"","accept-charset":"",accept:"",target:""}),execute:function(_4bd){
},onExecute:function(){
},setAttribute:function(attr,_4bf){
this.inherited(arguments);
switch(attr){
case "encType":
if(dojo.isIE){
this.domNode.encoding=_4bf;
}
}
},postCreate:function(){
if(dojo.isIE&&this.srcNodeRef&&this.srcNodeRef.attributes){
var item=this.srcNodeRef.attributes.getNamedItem("encType");
if(item&&!item.specified&&(typeof item.value=="string")){
this.setAttribute("encType",item.value);
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
var _4c7=dijit.getViewport();
var is=this.node.style,os=this.domNode.style;
os.top=_4c7.t+"px";
os.left=_4c7.l+"px";
is.width=_4c7.w+"px";
is.height=_4c7.h+"px";
var _4ca=dijit.getViewport();
if(_4c7.w!=_4ca.w){
is.width=_4ca.w+"px";
}
if(_4c7.h!=_4ca.h){
is.height=_4ca.h+"px";
}
},show:function(){
this.domNode.style.display="block";
this.layout();
if(this.bgIframe.iframe){
this.bgIframe.iframe.style.display="block";
}
this._resizeHandler=this.connect(window,"onresize","layout");
},hide:function(){
this.domNode.style.display="none";
if(this.bgIframe.iframe){
this.bgIframe.iframe.style.display="none";
}
this.disconnect(this._resizeHandler);
},uninitialize:function(){
if(this.bgIframe){
this.bgIframe.destroy();
}
}});
dojo.declare("dijit._DialogMixin",null,{attributeMap:dijit._Widget.prototype.attributeMap,execute:function(_4cb){
},onCancel:function(){
},onExecute:function(){
},_onSubmit:function(){
this.onExecute();
this.execute(this.getValues());
},_getFocusItems:function(_4cc){
var _4cd=dijit.getFirstInTabbingOrder(_4cc);
this._firstFocusItem=_4cd?_4cd:_4cc;
_4cd=dijit.getLastInTabbingOrder(_4cc);
this._lastFocusItem=_4cd?_4cd:this._firstFocusItem;
if(dojo.isMoz&&this._firstFocusItem.tagName.toLowerCase()=="input"&&dojo.attr(this._firstFocusItem,"type").toLowerCase()=="file"){
dojo.attr(_4cc,"tabindex","0");
this._firstFocusItem=_4cc;
}
}});
dojo.declare("dijit.Dialog",[dijit.layout.ContentPane,dijit._Templated,dijit.form._FormMixin,dijit._DialogMixin],{templateString:null,templateString:"<div class=\"dijitDialog\" tabindex=\"-1\" waiRole=\"dialog\" waiState=\"labelledby-${id}_title\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\">\r\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\" id=\"${id}_title\">${title}</span>\r\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\">\r\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t</span>\r\n\t</div>\r\n\t\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"></div>\r\n</div>\r\n",open:false,duration:400,refocus:true,_firstFocusItem:null,_lastFocusItem:null,doLayout:false,attributeMap:dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap),{title:"titleBar"}),postCreate:function(){
dojo.body().appendChild(this.domNode);
this.inherited(arguments);
var _4ce=dojo.i18n.getLocalization("dijit","common");
if(this.closeButtonNode){
this.closeButtonNode.setAttribute("title",_4ce.buttonCancel);
}
if(this.closeText){
this.closeText.setAttribute("title",_4ce.buttonCancel);
}
var s=this.domNode.style;
s.visibility="hidden";
s.position="absolute";
s.display="";
s.top="-9999px";
this.connect(this,"onExecute","hide");
this.connect(this,"onCancel","hide");
this._modalconnects=[];
},onLoad:function(){
this._position();
this.inherited(arguments);
},_setup:function(){
if(this.titleBar){
this._moveable=new dojo.dnd.TimedMoveable(this.domNode,{handle:this.titleBar,timeout:0});
}
this._underlay=new dijit.DialogUnderlay({id:this.id+"_underlay","class":dojo.map(this["class"].split(/\s/),function(s){
return s+"_underlay";
}).join(" ")});
var node=this.domNode;
this._fadeIn=dojo.fx.combine([dojo.fadeIn({node:node,duration:this.duration}),dojo.fadeIn({node:this._underlay.domNode,duration:this.duration,onBegin:dojo.hitch(this._underlay,"show")})]);
this._fadeOut=dojo.fx.combine([dojo.fadeOut({node:node,duration:this.duration,onEnd:function(){
node.style.visibility="hidden";
node.style.top="-9999px";
}}),dojo.fadeOut({node:this._underlay.domNode,duration:this.duration,onEnd:dojo.hitch(this._underlay,"hide")})]);
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
},_position:function(){
if(dojo.hasClass(dojo.body(),"dojoMove")){
return;
}
var _4d2=dijit.getViewport();
var mb=dojo.marginBox(this.domNode);
var _4d4=this.domNode.style;
_4d4.left=Math.floor((_4d2.l+(_4d2.w-mb.w)/2))+"px";
_4d4.top=Math.floor((_4d2.t+(_4d2.h-mb.h)/2))+"px";
},_onKey:function(evt){
if(evt.keyCode){
var node=evt.target;
if(evt.keyCode==dojo.keys.TAB){
this._getFocusItems(this.domNode);
}
var _4d7=(this._firstFocusItem==this._lastFocusItem);
if(node==this._firstFocusItem&&evt.shiftKey&&evt.keyCode==dojo.keys.TAB){
if(!_4d7){
dijit.focus(this._lastFocusItem);
}
dojo.stopEvent(evt);
}else{
if(node==this._lastFocusItem&&evt.keyCode==dojo.keys.TAB&&!evt.shiftKey){
if(!_4d7){
dijit.focus(this._firstFocusItem);
}
dojo.stopEvent(evt);
}else{
while(node){
if(node==this.domNode){
if(evt.keyCode==dojo.keys.ESCAPE){
this.hide();
}else{
return;
}
}
node=node.parentNode;
}
if(evt.keyCode!=dojo.keys.TAB){
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
this._modalconnects.push(dojo.connect(dojo.doc.documentElement,"onkeypress",this,"_onKey"));
dojo.style(this.domNode,"opacity",0);
this.domNode.style.visibility="";
this.open=true;
this._loadCheck();
this._position();
this._fadeIn.play();
this._savedFocus=dijit.getFocus(this);
this._getFocusItems(this.domNode);
setTimeout(dojo.hitch(this,function(){
dijit.focus(this._firstFocusItem);
}),50);
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
this.open=false;
},layout:function(){
if(this.domNode.style.visibility!="hidden"){
this._underlay.layout();
this._position();
}
},destroy:function(){
dojo.forEach(this._modalconnects,dojo.disconnect);
if(this.refocus&&this.open){
var fo=this._savedFocus;
setTimeout(dojo.hitch(dijit,"focus",fo),25);
}
this.inherited(arguments);
}});
dojo.declare("dijit.TooltipDialog",[dijit.layout.ContentPane,dijit._Templated,dijit.form._FormMixin,dijit._DialogMixin],{title:"",doLayout:false,_firstFocusItem:null,_lastFocusItem:null,templateString:null,templateString:"<div class=\"dijitTooltipDialog\" waiRole=\"presentation\">\r\n\t<div class=\"dijitTooltipContainer\" waiRole=\"presentation\">\r\n\t\t<div class =\"dijitTooltipContents dijitTooltipFocusNode\" dojoAttachPoint=\"containerNode\" tabindex=\"-1\" waiRole=\"dialog\"></div>\r\n\t</div>\r\n\t<div class=\"dijitTooltipConnector\" waiRole=\"presenation\"></div>\r\n</div>\r\n",postCreate:function(){
this.inherited(arguments);
this.connect(this.containerNode,"onkeypress","_onKey");
this.containerNode.title=this.title;
},orient:function(node,_4da,_4db){
this.domNode.className="dijitTooltipDialog "+" dijitTooltipAB"+(_4db.charAt(1)=="L"?"Left":"Right")+" dijitTooltip"+(_4db.charAt(0)=="T"?"Below":"Above");
},onOpen:function(pos){
this._getFocusItems(this.containerNode);
this.orient(this.domNode,pos.aroundCorner,pos.corner);
this._loadCheck();
dijit.focus(this._firstFocusItem);
},_onKey:function(evt){
var node=evt.target;
if(evt.keyCode==dojo.keys.TAB){
this._getFocusItems(this.containerNode);
}
var _4df=(this._firstFocusItem==this._lastFocusItem);
if(evt.keyCode==dojo.keys.ESCAPE){
this.onCancel();
}else{
if(node==this._firstFocusItem&&evt.shiftKey&&evt.keyCode==dojo.keys.TAB){
if(!_4df){
dijit.focus(this._lastFocusItem);
}
dojo.stopEvent(evt);
}else{
if(node==this._lastFocusItem&&evt.keyCode==dojo.keys.TAB&&!evt.shiftKey){
if(!_4df){
dijit.focus(this._firstFocusItem);
}
dojo.stopEvent(evt);
}else{
if(evt.keyCode==dojo.keys.TAB){
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
dojo.declare("dijit.form._FormWidget",[dijit._Widget,dijit._Templated],{baseClass:"",name:"",alt:"",value:"",type:"text",tabIndex:"0",disabled:false,readOnly:false,intermediateChanges:false,attributeMap:dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap),{value:"focusNode",disabled:"focusNode",readOnly:"focusNode",id:"focusNode",tabIndex:"focusNode",alt:"focusNode"}),setAttribute:function(attr,_4e1){
this.inherited(arguments);
switch(attr){
case "disabled":
var _4e2=this[this.attributeMap["tabIndex"]||"domNode"];
if(_4e1){
this._hovering=false;
this._active=false;
_4e2.removeAttribute("tabIndex");
}else{
_4e2.setAttribute("tabIndex",this.tabIndex);
}
dijit.setWaiState(this[this.attributeMap["disabled"]||"domNode"],"disabled",_4e1);
this._setStateClass();
}
},setDisabled:function(_4e3){
dojo.deprecated("setDisabled("+_4e3+") is deprecated. Use setAttribute('disabled',"+_4e3+") instead.","","2.0");
this.setAttribute("disabled",_4e3);
},_onMouse:function(_4e4){
var _4e5=_4e4.currentTarget;
if(_4e5&&_4e5.getAttribute){
this.stateModifier=_4e5.getAttribute("stateModifier")||"";
}
if(!this.disabled){
switch(_4e4.type){
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
var _4e6=this.connect(dojo.body(),"onmouseup",function(){
this._active=false;
this._mouseDown=false;
this._setStateClass();
this.disconnect(_4e6);
});
if(this.isFocusable()){
this.focus();
}
break;
}
this._setStateClass();
}
},isFocusable:function(){
return !this.disabled&&!this.readOnly&&this.focusNode&&(dojo.style(this.domNode,"display")!="none");
},focus:function(){
setTimeout(dojo.hitch(this,dijit.focus,this.focusNode),0);
},_setStateClass:function(){
if(!("staticClass" in this)){
this.staticClass=(this.stateNode||this.domNode).className;
}
var _4e7=[this.baseClass];
function multiply(_4e8){
_4e7=_4e7.concat(dojo.map(_4e7,function(c){
return c+_4e8;
}),"dijit"+_4e8);
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
(this.stateNode||this.domNode).className=this.staticClass+" "+_4e7.join(" ");
},onChange:function(_4ea){
},_onChangeMonitor:"value",_onChangeActive:false,_handleOnChange:function(_4eb,_4ec){
this._lastValue=_4eb;
if(this._lastValueReported==undefined&&(_4ec===null||!this._onChangeActive)){
this._resetValue=this._lastValueReported=_4eb;
}
if((this.intermediateChanges||_4ec||_4ec===undefined)&&((_4eb&&_4eb.toString)?_4eb.toString():_4eb)!==((this._lastValueReported&&this._lastValueReported.toString)?this._lastValueReported.toString():this._lastValueReported)){
this._lastValueReported=_4eb;
if(this._onChangeActive){
this.onChange(_4eb);
}
}
},reset:function(){
this._hasBeenBlurred=false;
if(this.setValue&&!this._getValueDeprecated){
this.setValue(this._resetValue,true);
}else{
if(this._onChangeMonitor){
this.setAttribute(this._onChangeMonitor,(this._resetValue!==undefined&&this._resetValue!==null)?this._resetValue:"");
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
},setValue:function(_4ed){
dojo.deprecated("dijit.form._FormWidget:setValue("+_4ed+") is deprecated.  Use setAttribute('value',"+_4ed+") instead.","","2.0");
this.setAttribute("value",_4ed);
},_getValueDeprecated:true,getValue:function(){
dojo.deprecated("dijit.form._FormWidget:getValue() is deprecated.  Use widget.value instead.","","2.0");
return this.value;
},_layoutHack:function(){
if(dojo.isFF==2){
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
this.setValue(this.value,null);
},setValue:function(_4f0,_4f1){
this.value=_4f0;
this._handleOnChange(_4f0,_4f1);
},_getValueDeprecated:false,getValue:function(){
return this._lastValue;
},undo:function(){
this.setValue(this._lastValueReported,false);
},_valueChanged:function(){
var v=this.getValue();
var lv=this._lastValueReported;
return ((v!==null&&(v!==undefined)&&v.toString)?v.toString():"")!==((lv!==null&&(lv!==undefined)&&lv.toString)?lv.toString():"");
},_onKeyPress:function(e){
if(e.keyCode==dojo.keys.ESCAPE&&!e.shiftKey&&!e.ctrlKey&&!e.altKey){
if(this._valueChanged()){
this.undo();
dojo.stopEvent(e);
return false;
}
}
return true;
}});
}
if(!dojo._hasResource["dijit.form.TextBox"]){
dojo._hasResource["dijit.form.TextBox"]=true;
dojo.provide("dijit.form.TextBox");
dojo.declare("dijit.form.TextBox",dijit.form._FormValueWidget,{trim:false,uppercase:false,lowercase:false,propercase:false,maxLength:"",templateString:"<input class=\"dijit dijitReset dijitLeft\" dojoAttachPoint='textbox,focusNode' name=\"${name}\"\r\n\tdojoAttachEvent='onmouseenter:_onMouse,onmouseleave:_onMouse,onfocus:_onMouse,onblur:_onMouse,onkeypress:_onKeyPress,onkeyup'\r\n\tautocomplete=\"off\" type=\"${type}\"\r\n\t/>\r\n",baseClass:"dijitTextBox",attributeMap:dojo.mixin(dojo.clone(dijit.form._FormValueWidget.prototype.attributeMap),{maxLength:"focusNode"}),getDisplayedValue:function(){
return this.filter(this.textbox.value);
},getValue:function(){
return this.parse(this.getDisplayedValue(),this.constraints);
},setValue:function(_4f5,_4f6,_4f7){
var _4f8=this.filter(_4f5);
if((((typeof _4f8==typeof _4f5)&&(_4f5!==undefined))||(_4f5===null))&&(_4f7==null||_4f7==undefined)){
_4f7=this.format(_4f8,this.constraints);
}
if(_4f7!=null&&_4f7!=undefined){
this.textbox.value=_4f7;
}
dijit.form.TextBox.superclass.setValue.call(this,_4f8,_4f6);
},setDisplayedValue:function(_4f9,_4fa){
this.textbox.value=_4f9;
this.setValue(this.getValue(),_4fa);
},format:function(_4fb,_4fc){
return ((_4fb==null||_4fb==undefined)?"":(_4fb.toString?_4fb.toString():_4fb));
},parse:function(_4fd,_4fe){
return _4fd;
},postCreate:function(){
this.textbox.setAttribute("value",this.getDisplayedValue());
this.inherited(arguments);
this._layoutHack();
},filter:function(val){
if(val===null||val===undefined){
return "";
}else{
if(typeof val!="string"){
return val;
}
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
this.setValue(this.getValue(),(this.isValid?this.isValid():true));
},_onBlur:function(){
this._setBlurValue();
this.inherited(arguments);
},onkeyup:function(){
}});
dijit.selectInputText=function(_501,_502,stop){
var _504=dojo.global;
var _505=dojo.doc;
_501=dojo.byId(_501);
if(isNaN(_502)){
_502=0;
}
if(isNaN(stop)){
stop=_501.value?_501.value.length:0;
}
_501.focus();
if(_505["selection"]&&dojo.body()["createTextRange"]){
if(_501.createTextRange){
var _506=_501.createTextRange();
with(_506){
collapse(true);
moveStart("character",_502);
moveEnd("character",stop);
select();
}
}
}else{
if(_504["getSelection"]){
var _507=_504.getSelection();
if(_501.setSelectionRange){
_501.setSelectionRange(_502,stop);
}
}
}
};
}
if(!dojo._hasResource["dijit.Tooltip"]){
dojo._hasResource["dijit.Tooltip"]=true;
dojo.provide("dijit.Tooltip");
dojo.declare("dijit._MasterTooltip",[dijit._Widget,dijit._Templated],{duration:200,templateString:"<div class=\"dijitTooltip dijitTooltipLeft\" id=\"dojoTooltip\">\r\n\t<div class=\"dijitTooltipContainer dijitTooltipContents\" dojoAttachPoint=\"containerNode\" waiRole='alert'></div>\r\n\t<div class=\"dijitTooltipConnector\"></div>\r\n</div>\r\n",postCreate:function(){
dojo.body().appendChild(this.domNode);
this.bgIframe=new dijit.BackgroundIframe(this.domNode);
this.fadeIn=dojo.fadeIn({node:this.domNode,duration:this.duration,onEnd:dojo.hitch(this,"_onShow")});
this.fadeOut=dojo.fadeOut({node:this.domNode,duration:this.duration,onEnd:dojo.hitch(this,"_onHide")});
},show:function(_508,_509,_50a){
if(this.aroundNode&&this.aroundNode===_509){
return;
}
if(this.fadeOut.status()=="playing"){
this._onDeck=arguments;
return;
}
this.containerNode.innerHTML=_508;
this.domNode.style.top=(this.domNode.offsetTop+1)+"px";
var _50b={};
var ltr=this.isLeftToRight();
dojo.forEach((_50a&&_50a.length)?_50a:dijit.Tooltip.defaultPosition,function(pos){
switch(pos){
case "after":
_50b[ltr?"BR":"BL"]=ltr?"BL":"BR";
break;
case "before":
_50b[ltr?"BL":"BR"]=ltr?"BR":"BL";
break;
case "below":
_50b[ltr?"BL":"BR"]=ltr?"TL":"TR";
_50b[ltr?"BR":"BL"]=ltr?"TR":"TL";
break;
case "above":
default:
_50b[ltr?"TL":"TR"]=ltr?"BL":"BR";
_50b[ltr?"TR":"TL"]=ltr?"BR":"BL";
break;
}
});
var pos=dijit.placeOnScreenAroundElement(this.domNode,_509,_50b,dojo.hitch(this,"orient"));
dojo.style(this.domNode,"opacity",0);
this.fadeIn.play();
this.isShowingNow=true;
this.aroundNode=_509;
},orient:function(node,_510,_511){
node.className="dijitTooltip "+{"BL-TL":"dijitTooltipBelow dijitTooltipABLeft","TL-BL":"dijitTooltipAbove dijitTooltipABLeft","BR-TR":"dijitTooltipBelow dijitTooltipABRight","TR-BR":"dijitTooltipAbove dijitTooltipABRight","BR-BL":"dijitTooltipRight","BL-BR":"dijitTooltipLeft"}[_510+"-"+_511];
},_onShow:function(){
if(dojo.isIE){
this.domNode.style.filter="";
}
},hide:function(_512){
if(!this.aroundNode||this.aroundNode!==_512){
return;
}
if(this._onDeck){
this._onDeck=null;
return;
}
this.fadeIn.stop();
this.isShowingNow=false;
this.aroundNode=null;
this.fadeOut.play();
},_onHide:function(){
this.domNode.style.cssText="";
if(this._onDeck){
this.show.apply(this,this._onDeck);
this._onDeck=null;
}
}});
dijit.showTooltip=function(_513,_514,_515){
if(!dijit._masterTT){
dijit._masterTT=new dijit._MasterTooltip();
}
return dijit._masterTT.show(_513,_514,_515);
};
dijit.hideTooltip=function(_516){
if(!dijit._masterTT){
dijit._masterTT=new dijit._MasterTooltip();
}
return dijit._masterTT.hide(_516);
};
dojo.declare("dijit.Tooltip",dijit._Widget,{label:"",showDelay:400,connectId:[],position:[],postCreate:function(){
if(this.srcNodeRef){
this.srcNodeRef.style.display="none";
}
this._connectNodes=[];
dojo.forEach(this.connectId,function(id){
var node=dojo.byId(id);
if(node){
this._connectNodes.push(node);
dojo.forEach(["onMouseOver","onMouseOut","onFocus","onBlur","onHover","onUnHover"],function(_519){
this.connect(node,_519.toLowerCase(),"_"+_519);
},this);
if(dojo.isIE){
node.style.zoom=1;
}
}
},this);
},_onMouseOver:function(e){
this._onHover(e);
},_onMouseOut:function(e){
if(dojo.isDescendant(e.relatedTarget,e.target)){
return;
}
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
var _51f=e.target;
this._showTimer=setTimeout(dojo.hitch(this,function(){
this.open(_51f);
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
},open:function(_521){
_521=_521||this._connectNodes[0];
if(!_521){
return;
}
if(this._showTimer){
clearTimeout(this._showTimer);
delete this._showTimer;
}
dijit.showTooltip(this.label||this.domNode.innerHTML,_521,this.position);
this._connectNode=_521;
},close:function(){
dijit.hideTooltip(this._connectNode);
delete this._connectNode;
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
dojo.declare("dijit.form.ValidationTextBox",dijit.form.TextBox,{templateString:"<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\r\n\tid=\"widget_${id}\"\r\n\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\" waiRole=\"presentation\"\r\n\t><div style=\"overflow:hidden;\"\r\n\t\t><div class=\"dijitReset dijitValidationIcon\"><br></div\r\n\t\t><div class=\"dijitReset dijitValidationIconText\">&Chi;</div\r\n\t\t><div class=\"dijitReset dijitInputField\"\r\n\t\t\t><input class=\"dijitReset\" dojoAttachPoint='textbox,focusNode' dojoAttachEvent='onfocus:_update,onkeyup:_onkeyup,onblur:_onMouse,onkeypress:_onKeyPress' autocomplete=\"off\"\r\n\t\t\ttype='${type}' name='${name}'\r\n\t\t/></div\r\n\t></div\r\n></div>\r\n",baseClass:"dijitTextBox",required:false,promptMessage:"",invalidMessage:"$_unset_$",constraints:{},regExp:".*",regExpGen:function(_522){
return this.regExp;
},state:"",tooltipPosition:[],setValue:function(){
this.inherited(arguments);
this.validate(this._focused);
},validator:function(_523,_524){
return (new RegExp("^("+this.regExpGen(_524)+")"+(this.required?"":"?")+"$")).test(_523)&&(!this.required||!this._isEmpty(_523))&&(this._isEmpty(_523)||this.parse(_523,_524)!==undefined);
},isValid:function(_525){
return this.validator(this.textbox.value,this.constraints);
},_isEmpty:function(_526){
return /^\s*$/.test(_526);
},getErrorMessage:function(_527){
return this.invalidMessage;
},getPromptMessage:function(_528){
return this.promptMessage;
},validate:function(_529){
var _52a="";
var _52b=this.isValid(_529);
var _52c=this._isEmpty(this.textbox.value);
this.state=(_52b||(!this._hasBeenBlurred&&_52c))?"":"Error";
this._setStateClass();
dijit.setWaiState(this.focusNode,"invalid",_52b?"false":"true");
if(_529){
if(_52c){
_52a=this.getPromptMessage(true);
}
if(!_52a&&this.state=="Error"){
_52a=this.getErrorMessage(true);
}
}
this.displayMessage(_52a);
return _52b;
},_message:"",displayMessage:function(_52d){
if(this._message==_52d){
return;
}
this._message=_52d;
dijit.hideTooltip(this.domNode);
if(_52d){
dijit.showTooltip(_52d,this.domNode,this.tooltipPosition);
}
},_refreshState:function(){
this.validate(this._focused);
},_update:function(e){
this._refreshState();
this._onMouse(e);
},_onkeyup:function(e){
this._update(e);
this.onkeyup(e);
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
}});
dojo.declare("dijit.form.MappedTextBox",dijit.form.ValidationTextBox,{serialize:function(val,_532){
return val.toString?val.toString():"";
},toString:function(){
var val=this.filter(this.getValue());
return val!=null?(typeof val=="string"?val:this.serialize(val,this.constraints)):"";
},validate:function(){
this.valueNode.value=this.toString();
return this.inherited(arguments);
},setAttribute:function(attr,_535){
this.inherited(arguments);
switch(attr){
case "disabled":
if(this.valueNode){
this.valueNode.disabled=this.disabled;
}
}
},postCreate:function(){
var _536=this.textbox;
var _537=(this.valueNode=dojo.doc.createElement("input"));
_537.setAttribute("type",_536.type);
_537.setAttribute("value",this.toString());
dojo.style(_537,"display","none");
_537.name=this.textbox.name;
_537.disabled=this.textbox.disabled;
this.textbox.name=this.textbox.name+"_displayed_";
this.textbox.removeAttribute("name");
dojo.place(_537,_536,"after");
this.inherited(arguments);
}});
dojo.declare("dijit.form.RangeBoundTextBox",dijit.form.MappedTextBox,{rangeMessage:"",compare:function(val1,val2){
return val1-val2;
},rangeCheck:function(_53a,_53b){
var _53c="min" in _53b;
var _53d="max" in _53b;
if(_53c||_53d){
return (!_53c||this.compare(_53a,_53b.min)>=0)&&(!_53d||this.compare(_53a,_53b.max)<=0);
}
return true;
},isInRange:function(_53e){
return this.rangeCheck(this.getValue(),this.constraints);
},isValid:function(_53f){
return this.inherited(arguments)&&((this._isEmpty(this.textbox.value)&&!this.required)||this.isInRange(_53f));
},getErrorMessage:function(_540){
if(dijit.form.RangeBoundTextBox.superclass.isValid.call(this,false)&&!this.isInRange(_540)){
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
},setValue:function(_541,_542){
dijit.setWaiState(this.focusNode,"valuenow",_541);
this.inherited("setValue",arguments);
}});
}
if(!dojo._hasResource["dijit.form.ComboBox"]){
dojo._hasResource["dijit.form.ComboBox"]=true;
dojo.provide("dijit.form.ComboBox");
dojo.declare("dijit.form.ComboBoxMixin",null,{item:null,pageSize:Infinity,store:null,query:{},autoComplete:true,searchDelay:100,searchAttr:"name",queryExpr:"${0}*",ignoreCase:true,hasDownArrow:true,templateString:"<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\r\n\tid=\"widget_${id}\"\r\n\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\" dojoAttachPoint=\"comboNode\" waiRole=\"combobox\" tabIndex=\"-1\"\r\n\t><div style=\"overflow:hidden;\"\r\n\t\t><div class='dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton'\r\n\t\t\tdojoAttachPoint=\"downArrowNode\" waiRole=\"presentation\"\r\n\t\t\tdojoAttachEvent=\"onmousedown:_onArrowMouseDown,onmouseup:_onMouse,onmouseenter:_onMouse,onmouseleave:_onMouse\"\r\n\t\t\t><div class=\"dijitArrowButtonInner\">&thinsp;</div\r\n\t\t\t><div class=\"dijitArrowButtonChar\">&#9660;</div\r\n\t\t></div\r\n\t\t><div class=\"dijitReset dijitValidationIcon\"><br></div\r\n\t\t><div class=\"dijitReset dijitValidationIconText\">&Chi;</div\r\n\t\t><div class=\"dijitReset dijitInputField\"\r\n\t\t\t><input type=\"text\" autocomplete=\"off\" name=\"${name}\" class='dijitReset'\r\n\t\t\tdojoAttachEvent=\"onkeypress:_onKeyPress, onfocus:_update, compositionend,onkeyup\"\r\n\t\t\tdojoAttachPoint=\"textbox,focusNode\" waiRole=\"textbox\" waiState=\"haspopup-true,autocomplete-list\"\r\n\t\t/></div\r\n\t></div\r\n></div>\r\n",baseClass:"dijitComboBox",_getCaretPos:function(_543){
var pos=0;
if(typeof (_543.selectionStart)=="number"){
pos=_543.selectionStart;
}else{
if(dojo.isIE){
var tr=dojo.doc.selection.createRange().duplicate();
var ntr=_543.createTextRange();
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
},_setCaretPos:function(_547,_548){
_548=parseInt(_548);
dijit.selectInputText(_547,_548,_548);
},_setAttribute:function(attr,_54a){
if(attr=="disabled"){
dijit.setWaiState(this.comboNode,"disabled",_54a);
}
},_onKeyPress:function(evt){
if(evt.altKey||(evt.ctrlKey&&evt.charCode!=118)){
return;
}
var _54c=false;
var pw=this._popupWidget;
var dk=dojo.keys;
if(this._isShowingNow){
pw.handleKey(evt);
}
switch(evt.keyCode){
case dk.PAGE_DOWN:
case dk.DOWN_ARROW:
if(!this._isShowingNow||this._prev_key_esc){
this._arrowPressed();
_54c=true;
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
var _54f;
if(this._isShowingNow&&(_54f=pw.getHighlightedOption())){
if(_54f==pw.nextButton){
this._nextSearch(1);
dojo.stopEvent(evt);
break;
}else{
if(_54f==pw.previousButton){
this._nextSearch(-1);
dojo.stopEvent(evt);
break;
}
}
}else{
this.setDisplayedValue(this.getDisplayedValue());
}
evt.preventDefault();
case dk.TAB:
var _550=this.getDisplayedValue();
if(pw&&(_550==pw._messages["previousMessage"]||_550==pw._messages["nextMessage"])){
break;
}
if(this._isShowingNow){
this._prev_key_backspace=false;
this._prev_key_esc=false;
if(pw.getHighlightedOption()){
pw.setValue({target:pw.getHighlightedOption()},true);
}
this._hideResultList();
}
break;
case dk.SPACE:
this._prev_key_backspace=false;
this._prev_key_esc=false;
if(this._isShowingNow&&pw.getHighlightedOption()){
dojo.stopEvent(evt);
this._selectOption();
this._hideResultList();
}else{
_54c=true;
}
break;
case dk.ESCAPE:
this._prev_key_backspace=false;
this._prev_key_esc=true;
if(this._isShowingNow){
dojo.stopEvent(evt);
this._hideResultList();
}
this.inherited(arguments);
break;
case dk.DELETE:
case dk.BACKSPACE:
this._prev_key_esc=false;
this._prev_key_backspace=true;
_54c=true;
break;
case dk.RIGHT_ARROW:
case dk.LEFT_ARROW:
this._prev_key_backspace=false;
this._prev_key_esc=false;
break;
default:
this._prev_key_backspace=false;
this._prev_key_esc=false;
if(dojo.isIE||evt.charCode!=0){
_54c=true;
}
}
if(this.searchTimer){
clearTimeout(this.searchTimer);
}
if(_54c){
setTimeout(dojo.hitch(this,"_startSearchFromInput"),1);
}
},_autoCompleteText:function(text){
var fn=this.focusNode;
dijit.selectInputText(fn,fn.value.length);
var _553=this.ignoreCase?"toLowerCase":"substr";
if(text[_553](0).indexOf(this.focusNode.value[_553](0))==0){
var cpos=this._getCaretPos(fn);
if((cpos+1)>fn.value.length){
fn.value=text;
dijit.selectInputText(fn,cpos);
}
}else{
fn.value=text;
dijit.selectInputText(fn);
}
},_openResultList:function(_555,_556){
if(this.disabled||this.readOnly||(_556.query[this.searchAttr]!=this._lastQuery)){
return;
}
this._popupWidget.clearResultList();
if(!_555.length){
this._hideResultList();
return;
}
var _557=new String(this.store.getValue(_555[0],this.searchAttr));
if(_557&&this.autoComplete&&!this._prev_key_backspace&&(_556.query[this.searchAttr]!="*")){
this._autoCompleteText(_557);
}
this._popupWidget.createOptions(_555,_556,dojo.hitch(this,"_getMenuLabelFromItem"));
this._showResultList();
if(_556.direction){
if(1==_556.direction){
this._popupWidget.highlightFirstOption();
}else{
if(-1==_556.direction){
this._popupWidget.highlightLastOption();
}
}
this._announceOption(this._popupWidget.getHighlightedOption());
}
},_showResultList:function(){
this._hideResultList();
var _558=this._popupWidget.getItems(),_559=Math.min(_558.length,this.maxListLength);
this._arrowPressed();
this.displayMessage("");
with(this._popupWidget.domNode.style){
width="";
height="";
}
var best=this.open();
var _55b=dojo.marginBox(this._popupWidget.domNode);
this._popupWidget.domNode.style.overflow=((best.h==_55b.h)&&(best.w==_55b.w))?"hidden":"auto";
var _55c=best.w;
if(best.h<this._popupWidget.domNode.scrollHeight){
_55c+=16;
}
dojo.marginBox(this._popupWidget.domNode,{h:best.h,w:Math.max(_55c,this.domNode.offsetWidth)});
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
var _55d=this.getDisplayedValue();
var pw=this._popupWidget;
if(pw&&(_55d==pw._messages["previousMessage"]||_55d==pw._messages["nextMessage"])){
this.setValue(this._lastValueReported,true);
}else{
this.setDisplayedValue(_55d);
}
},_onBlur:function(){
this._hideResultList();
this._arrowIdle();
this.inherited(arguments);
},_announceOption:function(node){
if(node==null){
return;
}
var _560;
if(node==this._popupWidget.nextButton||node==this._popupWidget.previousButton){
_560=node.innerHTML;
}else{
_560=this.store.getValue(node.item,this.searchAttr);
}
this.focusNode.value=this.focusNode.value.substring(0,this._getCaretPos(this.focusNode));
dijit.setWaiState(this.focusNode,"activedescendant",dojo.attr(node,"id"));
this._autoCompleteText(_560);
},_selectOption:function(evt){
var tgt=null;
if(!evt){
evt={target:this._popupWidget.getHighlightedOption()};
}
if(!evt.target){
this.setDisplayedValue(this.getDisplayedValue());
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
this.setValue(this.store.getValue(tgt.item,this.searchAttr),true);
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
this._startSearch(this.focusNode.value);
},_getQueryString:function(text){
return dojo.string.substitute(this.queryExpr,[text]);
},_startSearch:function(key){
if(!this._popupWidget){
var _567=this.id+"_popup";
this._popupWidget=new dijit.form._ComboBoxMenu({onChange:dojo.hitch(this,this._selectOption),id:_567});
dijit.removeWaiState(this.focusNode,"activedescendant");
dijit.setWaiState(this.textbox,"owns",_567);
}
this.item=null;
var _568=dojo.clone(this.query);
this._lastQuery=_568[this.searchAttr]=this._getQueryString(key);
this.searchTimer=setTimeout(dojo.hitch(this,function(_569,_56a){
var _56b=this.store.fetch({queryOptions:{ignoreCase:this.ignoreCase,deep:true},query:_569,onComplete:dojo.hitch(this,"_openResultList"),onError:function(_56c){
console.error("dijit.form.ComboBox: "+_56c);
dojo.hitch(_56a,"_hideResultList")();
},start:0,count:this.pageSize});
var _56d=function(_56e,_56f){
_56e.start+=_56e.count*_56f;
_56e.direction=_56f;
this.store.fetch(_56e);
};
this._nextSearch=this._popupWidget.onPage=dojo.hitch(this,_56d,_56b);
},_568,this),this.searchDelay);
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
this.onkeypress({charCode:-1});
},constructor:function(){
this.query={};
},postMixInProperties:function(){
if(!this.hasDownArrow){
this.baseClass="dijitTextBox";
}
if(!this.store){
var _571=this.srcNodeRef;
this.store=new dijit.form._ComboBoxDataStore(_571);
if(!this.value||((typeof _571.selectedIndex=="number")&&_571.selectedIndex.toString()===this.value)){
var item=this.store.fetchSelectedItem();
if(item){
this.value=this.store.getValue(item,this._getValueField());
}
}
}
},_postCreate:function(){
var _573=dojo.query("label[for=\""+this.id+"\"]");
if(_573.length){
_573[0].id=(this.id+"_label");
var cn=this.comboNode;
dijit.setWaiState(cn,"labelledby",_573[0].id);
dijit.setWaiState(cn,"disabled",this.disabled);
}
},uninitialize:function(){
if(this._popupWidget){
this._hideResultList();
this._popupWidget.destroy();
}
},_getMenuLabelFromItem:function(item){
return {html:false,label:this.store.getValue(item,this.searchAttr)};
},open:function(){
this._isShowingNow=true;
return dijit.popup.open({popup:this._popupWidget,around:this.domNode,parent:this});
},reset:function(){
this.item=null;
this.inherited(arguments);
}});
dojo.declare("dijit.form._ComboBoxMenu",[dijit._Widget,dijit._Templated],{templateString:"<ul class='dijitMenu' dojoAttachEvent='onmousedown:_onMouseDown,onmouseup:_onMouseUp,onmouseover:_onMouseOver,onmouseout:_onMouseOut' tabIndex='-1' style='overflow:\"auto\";'>"+"<li class='dijitMenuItem dijitMenuPreviousButton' dojoAttachPoint='previousButton'></li>"+"<li class='dijitMenuItem dijitMenuNextButton' dojoAttachPoint='nextButton'></li>"+"</ul>",_messages:null,postMixInProperties:function(){
this._messages=dojo.i18n.getLocalization("dijit.form","ComboBox",this.lang);
this.inherited("postMixInProperties",arguments);
},setValue:function(_576){
this.value=_576;
this.onChange(_576);
},onChange:function(_577){
},onPage:function(_578){
},postCreate:function(){
this.previousButton.innerHTML=this._messages["previousMessage"];
this.nextButton.innerHTML=this._messages["nextMessage"];
this.inherited("postCreate",arguments);
},onClose:function(){
this._blurOptionNode();
},_createOption:function(item,_57a){
var _57b=_57a(item);
var _57c=dojo.doc.createElement("li");
dijit.setWaiRole(_57c,"option");
if(_57b.html){
_57c.innerHTML=_57b.label;
}else{
_57c.appendChild(dojo.doc.createTextNode(_57b.label));
}
if(_57c.innerHTML==""){
_57c.innerHTML="&nbsp;";
}
_57c.item=item;
return _57c;
},createOptions:function(_57d,_57e,_57f){
this.previousButton.style.display=(_57e.start==0)?"none":"";
dojo.attr(this.previousButton,"id",this.id+"_prev");
dojo.forEach(_57d,function(item,i){
var _582=this._createOption(item,_57f);
_582.className="dijitMenuItem";
dojo.attr(_582,"id",this.id+i);
this.domNode.insertBefore(_582,this.nextButton);
},this);
this.nextButton.style.display=(_57e.count==_57d.length)?"":"none";
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
this.setValue({target:tgt},true);
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
var _58f=0;
var _590=this.domNode.scrollTop;
var _591=dojo.style(this.domNode,"height");
if(!this.getHighlightedOption()){
this._highlightNextOption();
}
while(_58f<_591){
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
var _592=this.domNode.scrollTop;
_58f+=(_592-_590)*(up?-1:1);
_590=_592;
}
},pageUp:function(){
this._page(true);
},pageDown:function(){
this._page(false);
},getHighlightedOption:function(){
var ho=this._highlighted_option;
return (ho&&ho.parentNode)?ho:null;
},handleKey:function(evt){
switch(evt.keyCode){
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
},setAttribute:function(attr,_596){
dijit.form.ValidationTextBox.prototype.setAttribute.apply(this,arguments);
dijit.form.ComboBoxMixin.prototype._setAttribute.apply(this,arguments);
}});
dojo.declare("dijit.form._ComboBoxDataStore",null,{constructor:function(root){
this.root=root;
},getValue:function(item,_599,_59a){
return (_599=="value")?item.value:(item.innerText||item.textContent||"");
},isItemLoaded:function(_59b){
return true;
},fetch:function(args){
var _59d="^"+args.query.name.replace(/([\\\|\(\)\[\{\^\$\+\?\.\<\>])/g,"\\$1").replace("*",".*")+"$",_59e=new RegExp(_59d,args.queryOptions.ignoreCase?"i":""),_59f=dojo.query("> option",this.root).filter(function(_5a0){
return (_5a0.innerText||_5a0.textContent||"").match(_59e);
});
var _5a1=args.start||0,end=("count" in args&&args.count!=Infinity)?(_5a1+args.count):_59f.length;
args.onComplete(_59f.slice(_5a1,end),args);
return args;
},close:function(_5a3){
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
}
if(!dojo._hasResource["dijit.form.FilteringSelect"]){
dojo._hasResource["dijit.form.FilteringSelect"]=true;
dojo.provide("dijit.form.FilteringSelect");
dojo.declare("dijit.form.FilteringSelect",[dijit.form.MappedTextBox,dijit.form.ComboBoxMixin],{labelAttr:"",labelType:"text",_isvalid:true,_lastDisplayedValue:"",isValid:function(){
return this._isvalid;
},_callbackSetLabel:function(_5aa,_5ab,_5ac){
if(_5ab&&_5ab.query[this.searchAttr]!=this._lastQuery){
return;
}
if(!_5aa.length){
if(!this._focused){
this.valueNode.value="";
}
dijit.form.TextBox.superclass.setValue.call(this,undefined,!this._focused);
this._isvalid=false;
this.validate(this._focused);
}else{
this._setValueFromItem(_5aa[0],_5ac);
}
},_openResultList:function(_5ad,_5ae){
if(_5ae.query[this.searchAttr]!=this._lastQuery){
return;
}
this._isvalid=_5ad.length!=0;
this.validate(true);
dijit.form.ComboBoxMixin.prototype._openResultList.apply(this,arguments);
},getValue:function(){
return this.valueNode.value;
},_getValueField:function(){
return "value";
},_setValue:function(_5af,_5b0,_5b1){
this.valueNode.value=_5af;
dijit.form.FilteringSelect.superclass.setValue.call(this,_5af,_5b1,_5b0);
this._lastDisplayedValue=_5b0;
},setValue:function(_5b2,_5b3){
var self=this;
var _5b5=function(item,_5b7){
if(item){
if(self.store.isItemLoaded(item)){
self._callbackSetLabel([item],undefined,_5b7);
}else{
self.store.loadItem({item:item,onItem:function(_5b8,_5b9){
self._callbackSetLabel(_5b8,_5b9,_5b7);
}});
}
}else{
self._isvalid=false;
self.validate(false);
}
};
this.store.fetchItemByIdentity({identity:_5b2,onItem:function(item){
_5b5(item,_5b3);
}});
},_setValueFromItem:function(item,_5bc){
this._isvalid=true;
this._setValue(this.store.getIdentity(item),this.labelFunc(item,this.store),_5bc);
},labelFunc:function(item,_5be){
return _5be.getValue(item,this.searchAttr);
},_doSelect:function(tgt){
this.item=tgt.item;
this._setValueFromItem(tgt.item,true);
},setDisplayedValue:function(_5c0,_5c1){
if(this.store){
var _5c2=dojo.clone(this.query);
this._lastQuery=_5c2[this.searchAttr]=_5c0;
this.textbox.value=_5c0;
this._lastDisplayedValue=_5c0;
var _5c3=this;
this.store.fetch({query:_5c2,queryOptions:{ignoreCase:this.ignoreCase,deep:true},onComplete:function(_5c4,_5c5){
dojo.hitch(_5c3,"_callbackSetLabel")(_5c4,_5c5,_5c1);
},onError:function(_5c6){
console.error("dijit.form.FilteringSelect: "+_5c6);
dojo.hitch(_5c3,"_setValue")(undefined,_5c0,false);
}});
}
},_getMenuLabelFromItem:function(item){
if(this.labelAttr){
return {html:this.labelType=="html",label:this.store.getValue(item,this.labelAttr)};
}else{
return dijit.form.ComboBoxMixin.prototype._getMenuLabelFromItem.apply(this,arguments);
}
},postMixInProperties:function(){
dijit.form.ComboBoxMixin.prototype.postMixInProperties.apply(this,arguments);
dijit.form.MappedTextBox.prototype.postMixInProperties.apply(this,arguments);
},postCreate:function(){
dijit.form.ComboBoxMixin.prototype._postCreate.apply(this,arguments);
dijit.form.MappedTextBox.prototype.postCreate.apply(this,arguments);
},setAttribute:function(attr,_5c9){
dijit.form.MappedTextBox.prototype.setAttribute.apply(this,arguments);
dijit.form.ComboBoxMixin.prototype._setAttribute.apply(this,arguments);
},undo:function(){
this.setDisplayedValue(this._lastDisplayedValue);
},_valueChanged:function(){
return this.getDisplayedValue()!=this._lastDisplayedValue;
}});
}
if(!dojo._hasResource["dijit.form.Textarea"]){
dojo._hasResource["dijit.form.Textarea"]=true;
dojo.provide("dijit.form.Textarea");
dojo.declare("dijit.form.Textarea",dijit.form._FormValueWidget,{attributeMap:dojo.mixin(dojo.clone(dijit.form._FormValueWidget.prototype.attributeMap),{style:"styleNode","class":"styleNode"}),templateString:(dojo.isIE||dojo.isSafari||dojo.isFF)?((dojo.isIE||dojo.isSafari||dojo.isFF>=3)?"<fieldset id=\"${id}\" class=\"dijitInline dijitInputField dijitTextArea\" dojoAttachPoint=\"styleNode\" waiRole=\"presentation\"><div dojoAttachPoint=\"editNode,focusNode,eventNode\" dojoAttachEvent=\"onpaste:_changing,oncut:_changing\" waiRole=\"textarea\" style=\"text-decoration:none;display:block;overflow:auto;\" contentEditable=\"true\"></div>":"<span id=\"${id}\" class=\"dijitReset\">"+"<iframe src=\"javascript:<html><head><title>${_iframeEditTitle}</title></head><body><script>var _postCreate=window.frameElement?window.frameElement.postCreate:null;if(_postCreate)_postCreate();</script></body></html>\""+" dojoAttachPoint=\"iframe,styleNode\" dojoAttachEvent=\"onblur:_onIframeBlur\" class=\"dijitInline dijitInputField dijitTextArea\"></iframe>")+"<textarea name=\"${name}\" value=\"${value}\" dojoAttachPoint=\"formValueNode\" style=\"display:none;\"></textarea>"+((dojo.isIE||dojo.isSafari||dojo.isFF>=3)?"</fieldset>":"</span>"):"<textarea id=\"${id}\" name=\"${name}\" value=\"${value}\" dojoAttachPoint=\"formValueNode,editNode,focusNode,styleNode\" class=\"dijitInputField dijitTextArea\">"+dojo.isFF+"</textarea>",setAttribute:function(attr,_5cb){
this.inherited(arguments);
switch(attr){
case "disabled":
this.formValueNode.disabled=this.disabled;
case "readOnly":
if(dojo.isIE||dojo.isSafari||dojo.isFF>=3){
this.editNode.contentEditable=(!this.disabled&&!this.readOnly);
}else{
if(dojo.isFF){
this.iframe.contentDocument.designMode=(this.disabled||this.readOnly)?"off":"on";
}
}
}
},focus:function(){
if(!this.disabled&&!this.readOnly){
this._changing();
}
dijit.focus(this.iframe||this.focusNode);
},setValue:function(_5cc,_5cd){
var _5ce=this.editNode;
if(typeof _5cc=="string"){
_5ce.innerHTML="";
if(_5cc.split){
var _5cf=this;
var _5d0=true;
dojo.forEach(_5cc.split("\n"),function(line){
if(_5d0){
_5d0=false;
}else{
_5ce.appendChild(dojo.doc.createElement("BR"));
}
if(line){
_5ce.appendChild(dojo.doc.createTextNode(line));
}
});
}else{
if(_5cc){
_5ce.appendChild(dojo.doc.createTextNode(_5cc));
}
}
if(!dojo.isIE){
_5ce.appendChild(dojo.doc.createElement("BR"));
}
}else{
_5cc=_5ce.innerHTML;
if(this.iframe){
_5cc=_5cc.replace(/<div><\/div>\r?\n?$/i,"");
}
_5cc=_5cc.replace(/\s*\r?\n|^\s+|\s+$|&nbsp;/g,"").replace(/>\s+</g,"><").replace(/<\/(p|div)>$|^<(p|div)[^>]*>/gi,"").replace(/([^>])<div>/g,"$1\n").replace(/<\/p>\s*<p[^>]*>|<br[^>]*>|<\/div>\s*<div[^>]*>/gi,"\n").replace(/<[^>]*>/g,"").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">");
if(!dojo.isIE){
_5cc=_5cc.replace(/\n$/,"");
}
}
this.value=this.formValueNode.value=_5cc;
if(this.iframe){
var _5d2=dojo.doc.createElement("div");
_5ce.appendChild(_5d2);
var _5d3=_5d2.offsetTop;
if(_5ce.scrollWidth>_5ce.clientWidth){
_5d3+=16;
}
if(this.lastHeight!=_5d3){
if(_5d3==0){
_5d3=16;
}
dojo.contentBox(this.iframe,{h:_5d3});
this.lastHeight=_5d3;
}
_5ce.removeChild(_5d2);
}
dijit.form.Textarea.superclass.setValue.call(this,this.getValue(),_5cd);
},getValue:function(){
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
var _5d4=dojo.i18n.getLocalization("dijit.form","Textarea");
this._iframeEditTitle=_5d4.iframeEditTitle;
this._iframeFocusTitle=_5d4.iframeFocusTitle;
var _5d5=dojo.query("label[for=\""+this.id+"\"]");
if(_5d5.length){
this._iframeEditTitle=_5d5[0].innerHTML+" "+this._iframeEditTitle;
}
var body=this.focusNode=this.editNode=dojo.doc.createElement("BODY");
body.style.margin="0px";
body.style.padding="0px";
body.style.border="0px";
}
},postCreate:function(){
if(dojo.isIE||dojo.isSafari||dojo.isFF>=3){
this.domNode.style.overflowY="hidden";
}else{
if(dojo.isFF){
var w=this.iframe.contentWindow;
var _5d8="";
try{
_5d8=this.iframe.contentDocument.title;
}
catch(e){
}
if(!w||!_5d8){
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
}else{
this.focusNode=this.domNode;
}
}
if(this.eventNode){
this.connect(this.eventNode,"keypress",this._onKeyPress);
this.connect(this.eventNode,"mousemove",this._changed);
this.connect(this.eventNode,"focus",this._focused);
this.connect(this.eventNode,"blur",this._blurred);
}
if(this.editNode){
this.connect(this.editNode,"change",this._changed);
}
this.inherited("postCreate",arguments);
},_focused:function(e){
dojo.addClass(this.iframe||this.domNode,"dijitInputFieldFocused");
this._changed(e);
},_blurred:function(e){
dojo.removeClass(this.iframe||this.domNode,"dijitInputFieldFocused");
this._changed(e,true);
},_onIframeBlur:function(){
this.iframe.contentDocument.title=this._iframeEditTitle;
},_onKeyPress:function(e){
if(e.keyCode==dojo.keys.TAB&&!e.shiftKey&&!e.ctrlKey&&!e.altKey&&this.iframe){
this.iframe.contentDocument.title=this._iframeFocusTitle;
this.iframe.focus();
dojo.stopEvent(e);
}else{
if(e.keyCode==dojo.keys.ENTER){
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
},_changed:function(e,_5e0){
if(this.iframe&&this.iframe.contentDocument.designMode!="on"&&!this.disabled&&!this.readOnly){
this.iframe.contentDocument.designMode="on";
}
this.setValue(null,_5e0||false);
}});
}
if(!dojo._hasResource["dijit.form.Button"]){
dojo._hasResource["dijit.form.Button"]=true;
dojo.provide("dijit.form.Button");
dojo.declare("dijit.form.Button",dijit.form._FormWidget,{label:"",showLabel:true,iconClass:"",type:"button",baseClass:"dijitButton",templateString:"<div class=\"dijit dijitReset dijitLeft dijitInline\"\r\n\tdojoAttachEvent=\"onclick:_onButtonClick,onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\"\r\n\twaiRole=\"presentation\"\r\n\t><button class=\"dijitReset dijitStretch dijitButtonNode dijitButtonContents\" dojoAttachPoint=\"focusNode,titleNode\"\r\n\t\ttype=\"${type}\" waiRole=\"button\" waiState=\"labelledby-${id}_label\"\r\n\t\t><span class=\"dijitReset dijitInline ${iconClass}\" dojoAttachPoint=\"iconNode\" \r\n \t\t\t><span class=\"dijitReset dijitToggleButtonIconChar\">&#10003;</span \r\n\t\t></span\r\n\t\t><div class=\"dijitReset dijitInline\"><center class=\"dijitReset dijitButtonText\" id=\"${id}_label\" dojoAttachPoint=\"containerNode\">${label}</center></div\r\n\t></button\r\n></div>\r\n",_onChangeMonitor:"",_onClick:function(e){
if(this.disabled||this.readOnly){
dojo.stopEvent(e);
return false;
}
this._clicked();
return this.onClick(e);
},_onButtonClick:function(e){
if(this._onClick(e)===false){
dojo.stopEvent(e);
}else{
if(this.type=="submit"&&!this.focusNode.form){
for(var node=this.domNode;node.parentNode;node=node.parentNode){
var _5e4=dijit.byNode(node);
if(_5e4&&typeof _5e4._onSubmit=="function"){
_5e4._onSubmit(e);
break;
}
}
}
}
},postCreate:function(){
if(this.showLabel==false){
var _5e5="";
this.label=this.containerNode.innerHTML;
_5e5=dojo.trim(this.containerNode.innerText||this.containerNode.textContent||"");
this.titleNode.title=_5e5;
dojo.addClass(this.containerNode,"dijitDisplayNone");
}
dojo.setSelectable(this.focusNode,false);
this.inherited(arguments);
},onClick:function(e){
return true;
},_clicked:function(e){
},setLabel:function(_5e8){
this.containerNode.innerHTML=this.label=_5e8;
this._layoutHack();
if(this.showLabel==false){
this.titleNode.title=dojo.trim(this.containerNode.innerText||this.containerNode.textContent||"");
}
}});
dojo.declare("dijit.form.DropDownButton",[dijit.form.Button,dijit._Container],{baseClass:"dijitDropDownButton",templateString:"<div class=\"dijit dijitReset dijitLeft dijitInline\"\r\n\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse,onclick:_onDropDownClick,onkeydown:_onDropDownKeydown,onblur:_onDropDownBlur,onkeypress:_onKey\"\r\n\twaiRole=\"presentation\"\r\n\t><div class='dijitReset dijitRight' waiRole=\"presentation\"\r\n\t><button class=\"dijitReset dijitStretch dijitButtonNode dijitButtonContents\" type=\"${type}\"\r\n\t\tdojoAttachPoint=\"focusNode,titleNode\" waiRole=\"button\" waiState=\"haspopup-true,labelledby-${id}_label\"\r\n\t\t><div class=\"dijitReset dijitInline ${iconClass}\" dojoAttachPoint=\"iconNode\" waiRole=\"presentation\"></div\r\n\t\t><div class=\"dijitReset dijitInline dijitButtonText\"  dojoAttachPoint=\"containerNode,popupStateNode\" waiRole=\"presentation\"\r\n\t\t\tid=\"${id}_label\">${label}</div\r\n\t\t><div class=\"dijitReset dijitInline dijitArrowButtonInner\" waiRole=\"presentation\">&thinsp;</div\r\n\t\t><div class=\"dijitReset dijitInline dijitArrowButtonChar\" waiRole=\"presentation\">&#9660;</div\r\n\t></button\r\n></div></div>\r\n",_fillContent:function(){
if(this.srcNodeRef){
var _5e9=dojo.query("*",this.srcNodeRef);
dijit.form.DropDownButton.superclass._fillContent.call(this,_5e9[0]);
this.dropDownContainer=this.srcNodeRef;
}
},startup:function(){
if(this._started){
return;
}
if(!this.dropDown){
var _5ea=dojo.query("[widgetId]",this.dropDownContainer)[0];
this.dropDown=dijit.byNode(_5ea);
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
var _5ed=dojo.isFF&&dojo.isFF<3&&navigator.appVersion.indexOf("Macintosh")!=-1;
if(!_5ed||e.detail!=0||this._seenKeydown){
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
if(e.keyCode==dojo.keys.DOWN_ARROW){
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
var _5f1=this.dropDown;
if(!_5f1){
return;
}
if(!this._opened){
if(_5f1.href&&!_5f1.isLoaded){
var self=this;
var _5f3=dojo.connect(_5f1,"onLoad",function(){
dojo.disconnect(_5f3);
self._openDropDown();
});
_5f1._loadCheck(true);
return;
}else{
this._openDropDown();
}
}else{
this._closeDropDown();
}
},_openDropDown:function(){
var _5f4=this.dropDown;
var _5f5=_5f4.domNode.style.width;
var self=this;
dijit.popup.open({parent:this,popup:_5f4,around:this.domNode,orient:this.isLeftToRight()?{"BL":"TL","BR":"TR","TL":"BL","TR":"BR"}:{"BR":"TR","BL":"TL","TR":"BR","TL":"BL"},onExecute:function(){
self._closeDropDown(true);
},onCancel:function(){
self._closeDropDown(true);
},onClose:function(){
_5f4.domNode.style.width=_5f5;
self.popupStateNode.removeAttribute("popupActive");
this._opened=false;
}});
if(this.domNode.offsetWidth>_5f4.domNode.offsetWidth){
var _5f7=null;
if(!this.isLeftToRight()){
_5f7=_5f4.domNode.parentNode;
var _5f8=_5f7.offsetLeft+_5f7.offsetWidth;
}
dojo.marginBox(_5f4.domNode,{w:this.domNode.offsetWidth});
if(_5f7){
_5f7.style.left=_5f8-this.domNode.offsetWidth+"px";
}
}
this.popupStateNode.setAttribute("popupActive","true");
this._opened=true;
if(_5f4.focus){
_5f4.focus();
}
},_closeDropDown:function(_5f9){
if(this._opened){
dijit.popup.close(this.dropDown);
if(_5f9){
this.focus();
}
this._opened=false;
}
}});
dojo.declare("dijit.form.ComboButton",dijit.form.DropDownButton,{templateString:"<table class='dijit dijitReset dijitInline dijitLeft'\r\n\tcellspacing='0' cellpadding='0' waiRole=\"presentation\"\r\n\t><tbody waiRole=\"presentation\"><tr waiRole=\"presentation\"\r\n\t\t><td\tclass=\"dijitReset dijitStretch dijitButtonContents dijitButtonNode\"\r\n\t\t\ttabIndex=\"${tabIndex}\"\r\n\t\t\tdojoAttachEvent=\"ondijitclick:_onButtonClick,onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\"  dojoAttachPoint=\"titleNode\"\r\n\t\t\twaiRole=\"button\" waiState=\"labelledby-${id}_label\"\r\n\t\t\t><div class=\"dijitReset dijitInline ${iconClass}\" dojoAttachPoint=\"iconNode\" waiRole=\"presentation\"></div\r\n\t\t\t><div class=\"dijitReset dijitInline dijitButtonText\" id=\"${id}_label\" dojoAttachPoint=\"containerNode\" waiRole=\"presentation\">${label}</div\r\n\t\t></td\r\n\t\t><td class='dijitReset dijitStretch dijitButtonNode dijitArrowButton dijitDownArrowButton'\r\n\t\t\tdojoAttachPoint=\"popupStateNode,focusNode\"\r\n\t\t\tdojoAttachEvent=\"ondijitclick:_onArrowClick, onkeypress:_onKey,onmouseenter:_onMouse,onmouseleave:_onMouse\"\r\n\t\t\tstateModifier=\"DownArrow\"\r\n\t\t\ttitle=\"${optionsTitle}\" name=\"${name}\"\r\n\t\t\twaiRole=\"button\" waiState=\"haspopup-true\"\r\n\t\t\t><div class=\"dijitReset dijitArrowButtonInner\" waiRole=\"presentation\">&thinsp;</div\r\n\t\t\t><div class=\"dijitReset dijitArrowButtonChar\" waiRole=\"presentation\">&#9660;</div\r\n\t\t></td\r\n\t></tr></tbody\r\n></table>\r\n",attributeMap:dojo.mixin(dojo.clone(dijit.form._FormWidget.prototype.attributeMap),{id:"",name:""}),optionsTitle:"",baseClass:"dijitComboButton",_focusedNode:null,postCreate:function(){
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
dojo.declare("dijit.form.ToggleButton",dijit.form.Button,{baseClass:"dijitToggleButton",checked:false,_onChangeMonitor:"checked",attributeMap:dojo.mixin(dojo.clone(dijit.form.Button.prototype.attributeMap),{checked:"focusNode"}),_clicked:function(evt){
this.setAttribute("checked",!this.checked);
},setAttribute:function(attr,_602){
this.inherited(arguments);
switch(attr){
case "checked":
dijit.setWaiState(this.focusNode||this.domNode,"pressed",this.checked);
this._setStateClass();
this._handleOnChange(this.checked,true);
}
},setChecked:function(_603){
dojo.deprecated("setChecked("+_603+") is deprecated. Use setAttribute('checked',"+_603+") instead.","","2.0");
this.setAttribute("checked",_603);
},postCreate:function(){
this.inherited(arguments);
this.setAttribute("checked",this.checked);
}});
}
if(!dojo._hasResource["dijit.form.CheckBox"]){
dojo._hasResource["dijit.form.CheckBox"]=true;
dojo.provide("dijit.form.CheckBox");
dojo.declare("dijit.form.CheckBox",dijit.form.ToggleButton,{templateString:"<div class=\"dijitReset dijitInline\" waiRole=\"presentation\"\r\n\t><input\r\n\t \ttype=\"${type}\" name=\"${name}\"\r\n\t\tclass=\"dijitReset dijitCheckBoxInput\"\r\n\t\tdojoAttachPoint=\"focusNode\"\r\n\t \tdojoAttachEvent=\"onmouseover:_onMouse,onmouseout:_onMouse,onclick:_onClick\"\r\n/></div>\r\n",baseClass:"dijitCheckBox",type:"checkbox",value:"on",setValue:function(_604){
if(typeof _604=="string"){
this.setAttribute("value",_604);
_604=true;
}
this.setAttribute("checked",_604);
},_getValueDeprecated:false,getValue:function(){
return (this.checked?this.value:false);
},reset:function(){
this.inherited(arguments);
this.setAttribute("value",this._resetValueAttr);
},postCreate:function(){
this.inherited(arguments);
this._resetValueAttr=this.value;
}});
dojo.declare("dijit.form.RadioButton",dijit.form.CheckBox,{type:"radio",baseClass:"dijitRadio",_groups:{},postCreate:function(){
(this._groups[this.name]=this._groups[this.name]||[]).push(this);
this.inherited(arguments);
},uninitialize:function(){
dojo.forEach(this._groups[this.name],function(_605,i,arr){
if(_605===this){
arr.splice(i,1);
return;
}
},this);
},setAttribute:function(attr,_609){
this.inherited(arguments);
switch(attr){
case "checked":
if(this.checked){
dojo.forEach(this._groups[this.name],function(_60a){
if(_60a!=this&&_60a.checked){
_60a.setAttribute("checked",false);
}
},this);
}
}
},_clicked:function(e){
if(!this.checked){
this.setAttribute("checked",true);
}
}});
}
if(!dojo._hasResource["dojo.regexp"]){
dojo._hasResource["dojo.regexp"]=true;
dojo.provide("dojo.regexp");
dojo.regexp.escapeString=function(str,_60d){
return str.replace(/([\.$?*!=:|{}\(\)\[\]\\\/^])/g,function(ch){
if(_60d&&_60d.indexOf(ch)!=-1){
return ch;
}
return "\\"+ch;
});
};
dojo.regexp.buildGroupRE=function(arr,re,_611){
if(!(arr instanceof Array)){
return re(arr);
}
var b=[];
for(var i=0;i<arr.length;i++){
b.push(re(arr[i]));
}
return dojo.regexp.group(b.join("|"),_611);
};
dojo.regexp.group=function(_614,_615){
return "("+(_615?"?:":"")+_614+")";
};
}
if(!dojo._hasResource["dojo.cookie"]){
dojo._hasResource["dojo.cookie"]=true;
dojo.provide("dojo.cookie");
dojo.cookie=function(name,_617,_618){
var c=document.cookie;
if(arguments.length==1){
var _61a=c.match(new RegExp("(?:^|; )"+dojo.regexp.escapeString(name)+"=([^;]*)"));
return _61a?decodeURIComponent(_61a[1]):undefined;
}else{
_618=_618||{};
var exp=_618.expires;
if(typeof exp=="number"){
var d=new Date();
d.setTime(d.getTime()+exp*24*60*60*1000);
exp=_618.expires=d;
}
if(exp&&exp.toUTCString){
_618.expires=exp.toUTCString();
}
_617=encodeURIComponent(_617);
var _61d=name+"="+_617;
for(propName in _618){
_61d+="; "+propName;
var _61e=_618[propName];
if(_61e!==true){
_61d+="="+_61e;
}
}
document.cookie=_61d;
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
dojo.declare("dijit.layout.BorderContainer",dijit.layout._LayoutWidget,{design:"headline",liveSplitters:true,persist:false,_splitterClass:"dijit.layout._Splitter",postCreate:function(){
this.inherited(arguments);
this._splitters={};
this._splitterThickness={};
dojo.addClass(this.domNode,"dijitBorderContainer");
},startup:function(){
if(this._started){
return;
}
dojo.forEach(this.getChildren(),this._setupChild,this);
this.inherited(arguments);
},_setupChild:function(_61f){
var _620=_61f.region;
if(_620){
_61f.domNode.style.position="absolute";
var ltr=this.isLeftToRight();
if(_620=="leading"){
_620=ltr?"left":"right";
}
if(_620=="trailing"){
_620=ltr?"right":"left";
}
this["_"+_620]=_61f.domNode;
this["_"+_620+"Widget"]=_61f;
if(_61f.splitter){
var _622=dojo.getObject(this._splitterClass);
var flip={left:"right",right:"left",top:"bottom",bottom:"top",leading:"trailing",trailing:"leading"};
var _624=dojo.query("[region="+flip[_61f.region]+"]",this.domNode);
var _625=new _622({container:this,child:_61f,region:_620,oppNode:_624[0],live:this.liveSplitters});
this._splitters[_620]=_625.domNode;
dojo.place(_625.domNode,_61f.domNode,"after");
this._computeSplitterThickness(_620);
}
_61f.region=_620;
}
},_computeSplitterThickness:function(_626){
var re=new RegExp("top|bottom");
this._splitterThickness[_626]=dojo.marginBox(this._splitters[_626])[(re.test(_626)?"h":"w")];
},layout:function(){
this._layoutChildren();
},addChild:function(_628,_629){
this.inherited(arguments);
this._setupChild(_628);
if(this._started){
this._layoutChildren();
}
},removeChild:function(_62a){
var _62b=_62a.region;
var _62c=this._splitters[_62b];
if(_62c){
dijit.byNode(_62c).destroy();
delete this._splitters[_62b];
delete this._splitterThickness[_62b];
}
this.inherited(arguments);
delete this["_"+_62b];
delete this["_"+_62b+"Widget"];
if(this._started){
this._layoutChildren(_62a.region);
}
},_layoutChildren:function(_62d){
var _62e=(this.design=="sidebar");
var _62f=0,_630=0,_631=0,_632=0;
var _633={},_634={},_635={},_636={},_637=(this._center&&this._center.style)||{};
var _638=/left|right/.test(_62d);
var _639=!_62d||(!_638&&!_62e);
var _63a=!_62d||(_638&&_62e);
if(this._top){
_633=_63a&&this._top.style;
_62f=dojo.marginBox(this._top).h;
}
if(this._left){
_634=_639&&this._left.style;
_631=dojo.marginBox(this._left).w;
}
if(this._right){
_635=_639&&this._right.style;
_632=dojo.marginBox(this._right).w;
}
if(this._bottom){
_636=_63a&&this._bottom.style;
_630=dojo.marginBox(this._bottom).h;
}
var _63b=this._splitters;
var _63c=_63b.top;
var _63d=_63b.bottom;
var _63e=_63b.left;
var _63f=_63b.right;
var _640=this._splitterThickness;
var _641=_640.top||0;
var _642=_640.left||0;
var _643=_640.right||0;
var _644=_640.bottom||0;
if(_642>50||_643>50){
setTimeout(dojo.hitch(this,function(){
for(var _645 in this._splitters){
this._computeSplitterThickness(_645);
}
this._layoutChildren();
}),50);
return false;
}
var _646={left:(_62e?_631+_642:"0")+"px",right:(_62e?_632+_643:"0")+"px"};
if(_63c){
dojo.mixin(_63c.style,_646);
_63c.style.top=_62f+"px";
}
if(_63d){
dojo.mixin(_63d.style,_646);
_63d.style.bottom=_630+"px";
}
_646={top:(_62e?"0":_62f+_641)+"px",bottom:(_62e?"0":_630+_644)+"px"};
if(_63e){
dojo.mixin(_63e.style,_646);
_63e.style.left=_631+"px";
}
if(_63f){
dojo.mixin(_63f.style,_646);
_63f.style.right=_632+"px";
}
dojo.mixin(_637,{top:_62f+_641+"px",left:_631+_642+"px",right:_632+_643+"px",bottom:_630+_644+"px"});
var _647={top:_62e?"0":_637.top,bottom:_62e?"0":_637.bottom};
dojo.mixin(_634,_647);
dojo.mixin(_635,_647);
_634.left=_635.right=_633.top=_636.bottom="0";
if(_62e){
_633.left=_636.left=_631+(this.isLeftToRight()?_642:0)+"px";
_633.right=_636.right=_632+(this.isLeftToRight()?0:_643)+"px";
}else{
_633.left=_633.right=_636.left=_636.right="0";
}
var _648=dojo.isIE||dojo.some(this.getChildren(),function(_649){
return _649.domNode.tagName=="TEXTAREA";
});
if(_648){
var _64a=function(n,b){
n=dojo.byId(n);
var s=dojo.getComputedStyle(n);
if(!b){
return dojo._getBorderBox(n,s);
}
var me=dojo._getMarginExtents(n,s);
dojo._setMarginBox(n,b.l,b.t,b.w+me.w,b.h+me.h,s);
return null;
};
var _64f=function(_650,dim){
if(_650){
_650.resize?_650.resize(dim):dojo.marginBox(_650.domNode,dim);
}
};
var _652=_64a(this.domNode);
var _653=_652.h;
var _654=_653;
if(this._top){
_654-=_62f;
}
if(this._bottom){
_654-=_630;
}
if(_63c){
_654-=_641;
}
if(_63d){
_654-=_644;
}
var _655={h:_654};
var _656=_62e?_653:_654;
if(_63e){
_63e.style.height=_656;
}
if(_63f){
_63f.style.height=_656;
}
_64f(this._leftWidget,{h:_656});
_64f(this._rightWidget,{h:_656});
var _657=_652.w;
var _658=_657;
if(this._left){
_658-=_631;
}
if(this._right){
_658-=_632;
}
if(_63e){
_658-=_642;
}
if(_63f){
_658-=_643;
}
_655.w=_658;
var _659=_62e?_658:_657;
if(_63c){
_63c.style.width=_659;
}
if(_63d){
_63d.style.width=_659;
}
_64f(this._topWidget,{w:_659});
_64f(this._bottomWidget,{w:_659});
_64f(this._centerWidget,_655);
}else{
var _65a={};
if(_62d){
_65a[_62d]=_65a.center=true;
if(/top|bottom/.test(_62d)&&this.design!="sidebar"){
_65a.left=_65a.right=true;
}else{
if(/left|right/.test(_62d)&&this.design=="sidebar"){
_65a.top=_65a.bottom=true;
}
}
}
dojo.forEach(this.getChildren(),function(_65b){
if(_65b.resize&&(!_62d||_65b.region in _65a)){
_65b.resize();
}
},this);
}
}});
dojo.extend(dijit._Widget,{region:"",splitter:false,minSize:0,maxSize:Infinity});
dojo.declare("dijit.layout._Splitter",[dijit._Widget,dijit._Templated],{live:true,templateString:"<div class=\"dijitSplitter\" dojoAttachEvent=\"onkeypress:_onKeyPress,onmousedown:_startDrag\" tabIndex=\"0\" waiRole=\"separator\"><div class=\"dijitSplitterThumb\"></div></div>",postCreate:function(){
this.inherited(arguments);
this.horizontal=/top|bottom/.test(this.region);
dojo.addClass(this.domNode,"dijitSplitter"+(this.horizontal?"H":"V"));
this._factor=/top|left/.test(this.region)?1:-1;
this._minSize=this.child.minSize;
this._computeMaxSize();
this.connect(this.container,"layout",dojo.hitch(this,this._computeMaxSize));
this._cookieName=this.container.id+"_"+this.region;
if(this.container.persist){
var _65c=dojo.cookie(this._cookieName);
if(_65c){
this.child.domNode.style[this.horizontal?"height":"width"]=_65c;
}
}
},_computeMaxSize:function(){
var dim=this.horizontal?"h":"w";
var _65e=dojo.contentBox(this.container.domNode)[dim]-(this.oppNode?dojo.marginBox(this.oppNode)[dim]:0);
this._maxSize=Math.min(this.child.maxSize,_65e);
},_startDrag:function(e){
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
var _660=this._factor,max=this._maxSize,min=this._minSize||10;
var axis=this.horizontal?"pageY":"pageX";
var _664=e[axis];
var _665=this.domNode.style;
var dim=this.horizontal?"h":"w";
var _667=dojo.marginBox(this.child.domNode)[dim];
var _668=parseInt(this.domNode.style[this.region]);
var _669=this._resize;
var _66a=this.region;
var mb={};
var _66c=this.child.domNode;
var _66d=dojo.hitch(this.container,this.container._layoutChildren);
var de=dojo.doc.body;
this._handlers=(this._handlers||[]).concat([dojo.connect(de,"onmousemove",this._drag=function(e,_670){
var _671=e[axis]-_664,_672=_660*_671+_667,_673=Math.max(Math.min(_672,max),min);
if(_669||_670){
mb[dim]=_673;
dojo.marginBox(_66c,mb);
_66d(_66a);
}
_665[_66a]=_660*_671+_668+(_673-_672)+"px";
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
delete this._drag;
}
if(this.container.persist){
dojo.cookie(this._cookieName,this.child.domNode.style[this.horizontal?"height":"width"]);
}
},_cleanupHandlers:function(){
dojo.forEach(this._handlers,dojo.disconnect);
delete this._handlers;
},_onKeyPress:function(e){
this._resize=true;
var _676=this.horizontal;
var tick=1;
var dk=dojo.keys;
switch(e.keyCode){
case _676?dk.UP_ARROW:dk.LEFT_ARROW:
tick*=-1;
break;
case _676?dk.DOWN_ARROW:dk.RIGHT_ARROW:
break;
default:
return;
}
var _679=dojo.marginBox(this.child.domNode)[_676?"h":"w"]+this._factor*tick;
var mb={};
mb[this.horizontal?"h":"w"]=Math.max(Math.min(_679,this._maxSize),this._minSize);
dojo.marginBox(this.child.domNode,mb);
this.container._layoutChildren(this.region);
dojo.stopEvent(e);
},destroy:function(){
this._cleanupHandlers();
delete this.child;
delete this.container;
delete this.fake;
this.inherited(arguments);
}});
}
if(!dojo._hasResource["dijit.layout.LayoutContainer"]){
dojo._hasResource["dijit.layout.LayoutContainer"]=true;
dojo.provide("dijit.layout.LayoutContainer");
dojo.declare("dijit.layout.LayoutContainer",dijit.layout._LayoutWidget,{constructor:function(){
dojo.deprecated("dijit.layout.LayoutContainer is deprecated","use BorderContainer instead",2);
},layout:function(){
dijit.layout.layoutChildren(this.domNode,this._contentBox,this.getChildren());
},addChild:function(_67b,_67c){
dijit._Container.prototype.addChild.apply(this,arguments);
if(this._started){
dijit.layout.layoutChildren(this.domNode,this._contentBox,this.getChildren());
}
},removeChild:function(_67d){
dijit._Container.prototype.removeChild.apply(this,arguments);
if(this._started){
dijit.layout.layoutChildren(this.domNode,this._contentBox,this.getChildren());
}
}});
dojo.extend(dijit._Widget,{layoutAlign:"none"});
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
dojo.forEach(this.getChildren(),function(_67e){
_67e.startup();
});
this.startupKeyNavChildren();
this.inherited(arguments);
},onExecute:function(){
},onCancel:function(_67f){
},_moveToPopup:function(evt){
if(this.focusedChild&&this.focusedChild.popup&&!this.focusedChild.disabled){
this.focusedChild._onClick(evt);
}
},_onKeyPress:function(evt){
if(evt.ctrlKey||evt.altKey){
return;
}
switch(evt.keyCode){
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
},_iframeContentWindow:function(_688){
var win=dijit.getDocumentWindow(dijit.Menu._iframeContentDocument(_688))||dijit.Menu._iframeContentDocument(_688)["__parent__"]||(_688.name&&dojo.doc.frames[_688.name])||null;
return win;
},_iframeContentDocument:function(_68a){
var doc=_68a.contentDocument||(_68a.contentWindow&&_68a.contentWindow.document)||(_68a.name&&dojo.doc.frames[_68a.name]&&dojo.doc.frames[_68a.name].document)||null;
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
},unBindDomNode:function(_68f){
var node=dojo.byId(_68f);
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
var _699=dojo.coords(e.target,true);
x=_699.x+10;
y=_699.y+10;
}
var self=this;
var _69b=dijit.getFocus(this);
function closeAndRestoreFocus(){
dijit.focus(_69b);
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
var _69d=this.focusedChild;
var _69e=_69d.popup;
if(_69e.isShowingNow){
return;
}
_69e.parentMenu=this;
var self=this;
dijit.popup.open({parent:this,popup:_69e,around:_69d.arrowCell,orient:this.isLeftToRight()?{"TR":"TL","TL":"TR"}:{"TL":"TR","TR":"TL"},onCancel:function(){
dijit.popup.close(_69e);
_69d.focus();
self.currentPopup=null;
}});
this.currentPopup=_69e;
if(_69e.focus){
_69e.focus();
}
},uninitialize:function(){
dojo.forEach(this.targetNodeIds,this.unBindDomNode,this);
this.inherited(arguments);
}});
dojo.declare("dijit.MenuItem",[dijit._Widget,dijit._Templated,dijit._Contained],{templateString:"<tr class=\"dijitReset dijitMenuItem\" "+"dojoAttachEvent=\"onmouseenter:_onHover,onmouseleave:_onUnhover,ondijitclick:_onClick\">"+"<td class=\"dijitReset\"><div class=\"dijitMenuItemIcon ${iconClass}\" dojoAttachPoint=\"iconNode\"></div></td>"+"<td tabIndex=\"-1\" class=\"dijitReset dijitMenuItemLabel\" dojoAttachPoint=\"containerNode,focusNode\" waiRole=\"menuitem\"></td>"+"<td class=\"dijitReset\" dojoAttachPoint=\"arrowCell\">"+"<div class=\"dijitMenuExpand\" dojoAttachPoint=\"expand\" style=\"display:none\">"+"<span class=\"dijitInline dijitArrowNode dijitMenuExpandInner\">+</span>"+"</div>"+"</td>"+"</tr>",label:"",iconClass:"",disabled:false,postCreate:function(){
dojo.setSelectable(this.domNode,false);
this.setDisabled(this.disabled);
if(this.label){
this.setLabel(this.label);
}
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
dijit.focus(this.containerNode);
}
catch(e){
}
},_blur:function(){
dojo.removeClass(this.domNode,"dijitMenuItemHover");
},setLabel:function(_6a2){
this.containerNode.innerHTML=this.label=_6a2;
},setDisabled:function(_6a3){
this.disabled=_6a3;
dojo[_6a3?"addClass":"removeClass"](this.domNode,"dijitMenuItemDisabled");
dijit.setWaiState(this.containerNode,"disabled",_6a3?"true":"false");
}});
dojo.declare("dijit.PopupMenuItem",dijit.MenuItem,{_fillContent:function(){
if(this.srcNodeRef){
var _6a4=dojo.query("*",this.srcNodeRef);
dijit.PopupMenuItem.superclass._fillContent.call(this,_6a4[0]);
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
dojo.addClass(this.expand,"dijitMenuExpandEnabled");
dojo.style(this.expand,"display","");
dijit.setWaiState(this.containerNode,"haspopup","true");
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
}
if(!dojo._hasResource["dijit.layout.StackContainer"]){
dojo._hasResource["dijit.layout.StackContainer"]=true;
dojo.provide("dijit.layout.StackContainer");
dojo.declare("dijit.layout.StackContainer",dijit.layout._LayoutWidget,{doLayout:true,_started:false,postCreate:function(){
dijit.setWaiRole((this.containerNode||this.domNode),"tabpanel");
this.connect(this.domNode,"onkeypress",this._onKeyPress);
},startup:function(){
if(this._started){
return;
}
var _6a6=this.getChildren();
dojo.forEach(_6a6,this._setupChild,this);
dojo.some(_6a6,function(_6a7){
if(_6a7.selected){
this.selectedChildWidget=_6a7;
}
return _6a7.selected;
},this);
var _6a8=this.selectedChildWidget;
if(!_6a8&&_6a6[0]){
_6a8=this.selectedChildWidget=_6a6[0];
_6a8.selected=true;
}
if(_6a8){
this._showChild(_6a8);
}
dojo.publish(this.id+"-startup",[{children:_6a6,selected:_6a8}]);
this.inherited(arguments);
},_setupChild:function(page){
page.domNode.style.display="none";
page.domNode.style.position="relative";
return page;
},addChild:function(_6aa,_6ab){
dijit._Container.prototype.addChild.apply(this,arguments);
_6aa=this._setupChild(_6aa);
if(this._started){
this.layout();
dojo.publish(this.id+"-addChild",[_6aa,_6ab]);
if(!this.selectedChildWidget){
this.selectChild(_6aa);
}
}
},removeChild:function(page){
dijit._Container.prototype.removeChild.apply(this,arguments);
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
var _6ad=this.getChildren();
if(_6ad.length){
this.selectChild(_6ad[0]);
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
},_transition:function(_6af,_6b0){
if(_6b0){
this._hideChild(_6b0);
}
this._showChild(_6af);
if(this.doLayout&&_6af.resize){
_6af.resize(this._containerContentBox||this._contentBox);
}
},_adjacent:function(_6b1){
var _6b2=this.getChildren();
var _6b3=dojo.indexOf(_6b2,this.selectedChildWidget);
_6b3+=_6b1?1:_6b2.length-1;
return _6b2[_6b3%_6b2.length];
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
var _6b6=this.getChildren();
page.isFirstChild=(page==_6b6[0]);
page.isLastChild=(page==_6b6[_6b6.length-1]);
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
var _6b9=page.onClose(this,page);
if(_6b9){
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
},onAddChild:function(page,_6bd){
var _6be=dojo.doc.createElement("span");
this.domNode.appendChild(_6be);
var cls=dojo.getObject(this.buttonWidget);
var _6c0=new cls({label:page.title,closeButton:page.closable},_6be);
this.addChild(_6c0,_6bd);
this.pane2button[page]=_6c0;
page.controlButton=_6c0;
dojo.connect(_6c0,"onClick",dojo.hitch(this,"onButtonClick",page));
if(page.closable){
dojo.connect(_6c0,"onClickCloseButton",dojo.hitch(this,"onCloseButtonClick",page));
var _6c1=dojo.i18n.getLocalization("dijit","common");
var _6c2=new dijit.Menu({targetNodeIds:[_6c0.id],id:_6c0.id+"_Menu"});
var _6c3=new dijit.MenuItem({label:_6c1.itemClose});
dojo.connect(_6c3,"onClick",dojo.hitch(this,"onCloseButtonClick",page));
_6c2.addChild(_6c3);
this.pane2menu[page]=_6c2;
}
if(!this._currentChild){
_6c0.focusNode.setAttribute("tabIndex","0");
this._currentChild=page;
}
if(!this.isLeftToRight()&&dojo.isIE&&this._rectifyRtlTabList){
this._rectifyRtlTabList();
}
},onRemoveChild:function(page){
if(this._currentChild===page){
this._currentChild=null;
}
var _6c5=this.pane2button[page];
var menu=this.pane2menu[page];
if(menu){
menu.destroy();
}
if(_6c5){
_6c5.destroy();
}
this.pane2button[page]=null;
},onSelectChild:function(page){
if(!page){
return;
}
if(this._currentChild){
var _6c8=this.pane2button[this._currentChild];
_6c8.setAttribute("checked",false);
_6c8.focusNode.setAttribute("tabIndex","-1");
}
var _6c9=this.pane2button[page];
_6c9.setAttribute("checked",true);
this._currentChild=page;
_6c9.focusNode.setAttribute("tabIndex","0");
var _6ca=dijit.byId(this.containerId);
dijit.setWaiState(_6ca.containerNode||_6ca.domNode,"labelledby",_6c9.id);
},onButtonClick:function(page){
var _6cc=dijit.byId(this.containerId);
_6cc.selectChild(page);
},onCloseButtonClick:function(page){
var _6ce=dijit.byId(this.containerId);
_6ce.closeChild(page);
var b=this.pane2button[this._currentChild];
if(b){
dijit.focus(b.focusNode||b.domNode);
}
},adjacent:function(_6d0){
if(!this.isLeftToRight()&&(!this.tabPosition||/top|bottom/.test(this.tabPosition))){
_6d0=!_6d0;
}
var _6d1=this.getChildren();
var _6d2=dojo.indexOf(_6d1,this.pane2button[this._currentChild]);
var _6d3=_6d0?1:_6d1.length-1;
return _6d1[(_6d2+_6d3)%_6d1.length];
},onkeypress:function(e){
if(this.disabled||e.altKey){
return;
}
var _6d5=null;
if(e.ctrlKey||!e._djpage){
var k=dojo.keys;
switch(e.keyCode){
case k.LEFT_ARROW:
case k.UP_ARROW:
if(!e._djpage){
_6d5=false;
}
break;
case k.PAGE_UP:
if(e.ctrlKey){
_6d5=false;
}
break;
case k.RIGHT_ARROW:
case k.DOWN_ARROW:
if(!e._djpage){
_6d5=true;
}
break;
case k.PAGE_DOWN:
if(e.ctrlKey){
_6d5=true;
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
if(e.keyCode==k.TAB){
this.adjacent(!e.shiftKey).onClick();
dojo.stopEvent(e);
}else{
if(e.keyChar=="w"){
if(this._currentChild.closable){
this.onCloseButtonClick(this._currentChild);
}
dojo.stopEvent(e);
}
}
}
}
if(_6d5!==null){
this.adjacent(_6d5).onClick();
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
dojo.declare("dijit.layout.AccordionContainer",dijit.layout.StackContainer,{duration:250,_verticalSpace:0,postCreate:function(){
this.domNode.style.overflow="hidden";
this.inherited("postCreate",arguments);
dijit.setWaiRole(this.domNode,"tablist");
dojo.addClass(this.domNode,"dijitAccordionContainer");
},startup:function(){
if(this._started){
return;
}
this.inherited("startup",arguments);
if(this.selectedChildWidget){
var _6db=this.selectedChildWidget.containerNode.style;
_6db.display="";
_6db.overflow="auto";
this.selectedChildWidget._setSelectedState(true);
}
},layout:function(){
var _6dc=0;
var _6dd=this.selectedChildWidget;
dojo.forEach(this.getChildren(),function(_6de){
_6dc+=_6de.getTitleHeight();
});
var _6df=this._contentBox;
this._verticalSpace=(_6df.h-_6dc);
if(_6dd){
_6dd.containerNode.style.height=this._verticalSpace+"px";
}
},_setupChild:function(page){
return page;
},_transition:function(_6e1,_6e2){
if(this._inTransition){
return;
}
this._inTransition=true;
var _6e3=[];
var _6e4=this._verticalSpace;
if(_6e1){
_6e1.setSelected(true);
var _6e5=_6e1.containerNode;
_6e5.style.display="";
_6e3.push(dojo.animateProperty({node:_6e5,duration:this.duration,properties:{height:{start:"1",end:_6e4}},onEnd:function(){
_6e5.style.overflow="auto";
}}));
}
if(_6e2){
_6e2.setSelected(false);
var _6e6=_6e2.containerNode;
_6e6.style.overflow="hidden";
_6e3.push(dojo.animateProperty({node:_6e6,duration:this.duration,properties:{height:{start:_6e4,end:"1"}},onEnd:function(){
_6e6.style.display="none";
}}));
}
this._inTransition=false;
dojo.fx.combine(_6e3).play();
},_onKeyPress:function(e){
if(this.disabled||e.altKey||!(e._dijitWidget||e.ctrlKey)){
return;
}
var k=dojo.keys;
var _6e9=e._dijitWidget;
switch(e.keyCode){
case k.LEFT_ARROW:
case k.UP_ARROW:
if(_6e9){
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
if(_6e9){
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
if(e.ctrlKey&&e.keyCode==k.TAB){
this._adjacent(e._dijitWidget,!e.shiftKey)._onTitleClick();
dojo.stopEvent(e);
}
}
}});
dojo.declare("dijit.layout.AccordionPane",[dijit.layout.ContentPane,dijit._Templated,dijit._Contained],{templateString:"<div class='dijitAccordionPane'\r\n\t><div dojoAttachPoint='titleNode,focusNode' dojoAttachEvent='ondijitclick:_onTitleClick,onkeypress:_onTitleKeyPress,onfocus:_handleFocus,onblur:_handleFocus'\r\n\t\tclass='dijitAccordionTitle' wairole=\"tab\"\r\n\t\t><div class='dijitAccordionArrow' waiRole=\"presentation\"></div\r\n\t\t><div class='arrowTextUp' waiRole=\"presentation\">&#9650;</div\r\n\t\t><div class='arrowTextDown' waiRole=\"presentation\">&#9660;</div\r\n\t\t><div waiRole=\"presentation\" dojoAttachPoint='titleTextNode' class='dijitAccordionText'>${title}</div></div\r\n\t><div><div dojoAttachPoint='containerNode' style='overflow: hidden; height: 1px; display: none'\r\n\t\tclass='dijitAccordionBody' wairole=\"tabpanel\"\r\n\t></div></div>\r\n</div>\r\n",postCreate:function(){
this.inherited("postCreate",arguments);
dojo.setSelectable(this.titleNode,false);
this.setSelected(this.selected);
},getTitleHeight:function(){
return dojo.marginBox(this.titleNode).h;
},_onTitleClick:function(){
var _6ea=this.getParent();
if(!_6ea._inTransition){
_6ea.selectChild(this);
dijit.focus(this.focusNode);
}
},_onTitleKeyPress:function(evt){
evt._dijitWidget=this;
return this.getParent()._onKeyPress(evt);
},_setSelectedState:function(_6ec){
this.selected=_6ec;
dojo[(_6ec?"addClass":"removeClass")](this.titleNode,"dijitAccordionTitle-selected");
this.focusNode.setAttribute("tabIndex",_6ec?"0":"-1");
},_handleFocus:function(e){
dojo[(e.type=="focus"?"addClass":"removeClass")](this.focusNode,"dijitAccordionFocused");
},setSelected:function(_6ee){
this._setSelectedState(_6ee);
if(_6ee){
this.onSelected();
this._loadCheck(true);
}
},onSelected:function(){
}});
}
if(!dojo._hasResource["dijit.layout.SplitContainer"]){
dojo._hasResource["dijit.layout.SplitContainer"]=true;
dojo.provide("dijit.layout.SplitContainer");
dojo.declare("dijit.layout.SplitContainer",dijit.layout._LayoutWidget,{constructor:function(){
dojo.deprecated("dijit.layout.SplitContainer is deprecated","use BorderContainer with splitter instead",2);
},activeSizing:false,sizerWidth:7,orientation:"horizontal",persist:true,postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
this.isHorizontal=(this.orientation=="horizontal");
},postCreate:function(){
this.inherited("postCreate",arguments);
this.sizers=[];
dojo.addClass(this.domNode,"dijitSplitContainer");
if(dojo.isMozilla){
this.domNode.style.overflow="-moz-scrollbars-none";
}
if(typeof this.sizerWidth=="object"){
try{
this.sizerWidth=parseInt(this.sizerWidth.toString());
}
catch(e){
this.sizerWidth=7;
}
}
var _6ef=this.virtualSizer=dojo.doc.createElement("div");
_6ef.style.position="relative";
_6ef.style.zIndex=10;
_6ef.className=this.isHorizontal?"dijitSplitContainerVirtualSizerH":"dijitSplitContainerVirtualSizerV";
this.domNode.appendChild(_6ef);
dojo.setSelectable(_6ef,false);
},destroy:function(){
delete this.virtualSizer;
dojo.forEach(this._ownconnects,dojo.disconnect);
this.inherited(arguments);
},startup:function(){
if(this._started){
return;
}
dojo.forEach(this.getChildren(),function(_6f0,i,_6f2){
this._injectChild(_6f0);
if(i<_6f2.length-1){
this._addSizer();
}
},this);
if(this.persist){
this._restoreState();
}
this.inherited(arguments);
},_injectChild:function(_6f3){
_6f3.domNode.style.position="absolute";
dojo.addClass(_6f3.domNode,"dijitSplitPane");
},_addSizer:function(){
var i=this.sizers.length;
var _6f5=this.sizers[i]=dojo.doc.createElement("div");
this.domNode.appendChild(_6f5);
_6f5.className=this.isHorizontal?"dijitSplitContainerSizerH":"dijitSplitContainerSizerV";
var _6f6=dojo.doc.createElement("div");
_6f6.className="thumb";
_6f5.appendChild(_6f6);
var self=this;
var _6f8=(function(){
var _6f9=i;
return function(e){
self.beginSizing(e,_6f9);
};
})();
this.connect(_6f5,"onmousedown",_6f8);
dojo.setSelectable(_6f5,false);
},removeChild:function(_6fb){
if(this.sizers.length){
var i=dojo.indexOf(this.getChildren(),_6fb);
if(i!=-1){
if(i==this.sizers.length){
i--;
}
dojo._destroyElement(this.sizers[i]);
this.sizers.splice(i,1);
}
}
this.inherited(arguments);
if(this._started){
this.layout();
}
},addChild:function(_6fd,_6fe){
this.inherited("addChild",arguments);
if(this._started){
this._injectChild(_6fd);
var _6ff=this.getChildren();
if(_6ff.length>1){
this._addSizer();
}
this.layout();
}
},layout:function(){
this.paneWidth=this._contentBox.w;
this.paneHeight=this._contentBox.h;
var _700=this.getChildren();
if(!_700.length){
return;
}
var _701=this.isHorizontal?this.paneWidth:this.paneHeight;
if(_700.length>1){
_701-=this.sizerWidth*(_700.length-1);
}
var _702=0;
dojo.forEach(_700,function(_703){
_702+=_703.sizeShare;
});
var _704=_701/_702;
var _705=0;
dojo.forEach(_700.slice(0,_700.length-1),function(_706){
var size=Math.round(_704*_706.sizeShare);
_706.sizeActual=size;
_705+=size;
});
_700[_700.length-1].sizeActual=_701-_705;
this._checkSizes();
var pos=0;
var size=_700[0].sizeActual;
this._movePanel(_700[0],pos,size);
_700[0].position=pos;
pos+=size;
if(!this.sizers){
return;
}
dojo.some(_700.slice(1),function(_70a,i){
if(!this.sizers[i]){
return true;
}
this._moveSlider(this.sizers[i],pos,this.sizerWidth);
this.sizers[i].position=pos;
pos+=this.sizerWidth;
size=_70a.sizeActual;
this._movePanel(_70a,pos,size);
_70a.position=pos;
pos+=size;
},this);
},_movePanel:function(_70c,pos,size){
if(this.isHorizontal){
_70c.domNode.style.left=pos+"px";
_70c.domNode.style.top=0;
var box={w:size,h:this.paneHeight};
if(_70c.resize){
_70c.resize(box);
}else{
dojo.marginBox(_70c.domNode,box);
}
}else{
_70c.domNode.style.left=0;
_70c.domNode.style.top=pos+"px";
var box={w:this.paneWidth,h:size};
if(_70c.resize){
_70c.resize(box);
}else{
dojo.marginBox(_70c.domNode,box);
}
}
},_moveSlider:function(_710,pos,size){
if(this.isHorizontal){
_710.style.left=pos+"px";
_710.style.top=0;
dojo.marginBox(_710,{w:size,h:this.paneHeight});
}else{
_710.style.left=0;
_710.style.top=pos+"px";
dojo.marginBox(_710,{w:this.paneWidth,h:size});
}
},_growPane:function(_713,pane){
if(_713>0){
if(pane.sizeActual>pane.sizeMin){
if((pane.sizeActual-pane.sizeMin)>_713){
pane.sizeActual=pane.sizeActual-_713;
_713=0;
}else{
_713-=pane.sizeActual-pane.sizeMin;
pane.sizeActual=pane.sizeMin;
}
}
}
return _713;
},_checkSizes:function(){
var _715=0;
var _716=0;
var _717=this.getChildren();
dojo.forEach(_717,function(_718){
_716+=_718.sizeActual;
_715+=_718.sizeMin;
});
if(_715<=_716){
var _719=0;
dojo.forEach(_717,function(_71a){
if(_71a.sizeActual<_71a.sizeMin){
_719+=_71a.sizeMin-_71a.sizeActual;
_71a.sizeActual=_71a.sizeMin;
}
});
if(_719>0){
var list=this.isDraggingLeft?_717.reverse():_717;
dojo.forEach(list,function(_71c){
_719=this._growPane(_719,_71c);
},this);
}
}else{
dojo.forEach(_717,function(_71d){
_71d.sizeActual=Math.round(_716*(_71d.sizeMin/_715));
});
}
},beginSizing:function(e,i){
var _720=this.getChildren();
this.paneBefore=_720[i];
this.paneAfter=_720[i+1];
this.isSizing=true;
this.sizingSplitter=this.sizers[i];
if(!this.cover){
this.cover=dojo.doc.createElement("div");
this.domNode.appendChild(this.cover);
var s=this.cover.style;
s.position="absolute";
s.zIndex=1;
s.top=0;
s.left=0;
s.width="100%";
s.height="100%";
}else{
this.cover.style.zIndex=1;
}
this.sizingSplitter.style.zIndex=2;
this.originPos=dojo.coords(_720[0].domNode,true);
if(this.isHorizontal){
var _722=(e.layerX?e.layerX:e.offsetX);
var _723=e.pageX;
this.originPos=this.originPos.x;
}else{
var _722=(e.layerY?e.layerY:e.offsetY);
var _723=e.pageY;
this.originPos=this.originPos.y;
}
this.startPoint=this.lastPoint=_723;
this.screenToClientOffset=_723-_722;
this.dragOffset=this.lastPoint-this.paneBefore.sizeActual-this.originPos-this.paneBefore.position;
if(!this.activeSizing){
this._showSizingLine();
}
this._ownconnects=[];
this._ownconnects.push(dojo.connect(dojo.doc.documentElement,"onmousemove",this,"changeSizing"));
this._ownconnects.push(dojo.connect(dojo.doc.documentElement,"onmouseup",this,"endSizing"));
dojo.stopEvent(e);
},changeSizing:function(e){
if(!this.isSizing){
return;
}
this.lastPoint=this.isHorizontal?e.pageX:e.pageY;
this.movePoint();
if(this.activeSizing){
this._updateSize();
}else{
this._moveSizingLine();
}
dojo.stopEvent(e);
},endSizing:function(e){
if(!this.isSizing){
return;
}
if(this.cover){
this.cover.style.zIndex=-1;
}
if(!this.activeSizing){
this._hideSizingLine();
}
this._updateSize();
this.isSizing=false;
if(this.persist){
this._saveState(this);
}
dojo.forEach(this._ownconnects,dojo.disconnect);
},movePoint:function(){
var p=this.lastPoint-this.screenToClientOffset;
var a=p-this.dragOffset;
a=this.legaliseSplitPoint(a);
p=a+this.dragOffset;
this.lastPoint=p+this.screenToClientOffset;
},legaliseSplitPoint:function(a){
a+=this.sizingSplitter.position;
this.isDraggingLeft=!!(a>0);
if(!this.activeSizing){
var min=this.paneBefore.position+this.paneBefore.sizeMin;
if(a<min){
a=min;
}
var max=this.paneAfter.position+(this.paneAfter.sizeActual-(this.sizerWidth+this.paneAfter.sizeMin));
if(a>max){
a=max;
}
}
a-=this.sizingSplitter.position;
this._checkSizes();
return a;
},_updateSize:function(){
var pos=this.lastPoint-this.dragOffset-this.originPos;
var _72c=this.paneBefore.position;
var _72d=this.paneAfter.position+this.paneAfter.sizeActual;
this.paneBefore.sizeActual=pos-_72c;
this.paneAfter.position=pos+this.sizerWidth;
this.paneAfter.sizeActual=_72d-this.paneAfter.position;
dojo.forEach(this.getChildren(),function(_72e){
_72e.sizeShare=_72e.sizeActual;
});
if(this._started){
this.layout();
}
},_showSizingLine:function(){
this._moveSizingLine();
dojo.marginBox(this.virtualSizer,this.isHorizontal?{w:this.sizerWidth,h:this.paneHeight}:{w:this.paneWidth,h:this.sizerWidth});
this.virtualSizer.style.display="block";
},_hideSizingLine:function(){
this.virtualSizer.style.display="none";
},_moveSizingLine:function(){
var pos=(this.lastPoint-this.startPoint)+this.sizingSplitter.position;
dojo.style(this.virtualSizer,(this.isHorizontal?"left":"top"),pos+"px");
},_getCookieName:function(i){
return this.id+"_"+i;
},_restoreState:function(){
dojo.forEach(this.getChildren(),function(_731,i){
var _733=this._getCookieName(i);
var _734=dojo.cookie(_733);
if(_734){
var pos=parseInt(_734);
if(typeof pos=="number"){
_731.sizeShare=pos;
}
}
},this);
},_saveState:function(){
dojo.forEach(this.getChildren(),function(_736,i){
dojo.cookie(this._getCookieName(i),_736.sizeShare);
},this);
}});
dojo.extend(dijit._Widget,{sizeMin:10,sizeShare:10});
}
if(!dojo._hasResource["dijit.layout.TabContainer"]){
dojo._hasResource["dijit.layout.TabContainer"]=true;
dojo.provide("dijit.layout.TabContainer");
dojo.declare("dijit.layout.TabContainer",[dijit.layout.StackContainer,dijit._Templated],{tabPosition:"top",templateString:null,templateString:"<div class=\"dijitTabContainer\">\r\n\t<div dojoAttachPoint=\"tablistNode\"></div>\r\n\t<div class=\"dijitTabPaneWrapper\" dojoAttachPoint=\"containerNode\"></div>\r\n</div>\r\n",_controllerWidget:"dijit.layout.TabController",postCreate:function(){
this.inherited(arguments);
var _738=dojo.getObject(this._controllerWidget);
this.tablist=new _738({id:this.id+"_tablist",tabPosition:this.tabPosition,doLayout:this.doLayout,containerId:this.id},this.tablistNode);
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
if(dojo.isSafari){
setTimeout(dojo.hitch(this,"layout"),0);
}
if(dojo.isIE&&!this.isLeftToRight()&&this.tabPosition=="right-h"&&this.tablist&&this.tablist.pane2button){
for(var pane in this.tablist.pane2button){
var _73b=this.tablist.pane2button[pane];
if(!_73b.closeButton){
continue;
}
tabButtonStyle=_73b.closeButtonNode.style;
tabButtonStyle.position="absolute";
if(dojo.isIE<7){
tabButtonStyle.left=_73b.domNode.offsetWidth+"px";
}else{
tabButtonStyle.padding="0px";
}
}
}
},layout:function(){
if(!this.doLayout){
return;
}
var _73c=this.tabPosition.replace(/-h/,"");
var _73d=[{domNode:this.tablist.domNode,layoutAlign:_73c},{domNode:this.containerNode,layoutAlign:"client"}];
dijit.layout.layoutChildren(this.domNode,this._contentBox,_73d);
this._containerContentBox=dijit.layout.marginBox2contentBox(this.containerNode,_73d[1]);
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
dojo.declare("dijit.layout.TabController",dijit.layout.StackController,{templateString:"<div wairole='tablist' dojoAttachEvent='onkeypress:onkeypress'></div>",tabPosition:"top",doLayout:true,buttonWidget:"dijit.layout._TabButton",postMixInProperties:function(){
this["class"]="dijitTabLabels-"+this.tabPosition+(this.doLayout?"":" dijitTabNoLayout");
this.inherited(arguments);
},_rectifyRtlTabList:function(){
if(0>=this.tabPosition.indexOf("-h")){
return;
}
if(!this.pane2button){
return;
}
var _73e=0;
for(var pane in this.pane2button){
_73e=Math.max(_73e,dojo.marginBox(this.pane2button[pane].innerDiv).w);
}
for(pane in this.pane2button){
this.pane2button[pane].innerDiv.style.width=_73e+"px";
}
}});
dojo.declare("dijit.layout._TabButton",dijit.layout._StackButton,{baseClass:"dijitTab",templateString:"<div waiRole=\"presentation\" dojoAttachEvent='onclick:onClick,onmouseenter:_onMouse,onmouseleave:_onMouse'>\r\n    <div waiRole=\"presentation\" class='dijitTabInnerDiv' dojoAttachPoint='innerDiv'>\r\n        <div waiRole=\"presentation\" class='dijitTabContent' dojoAttachPoint='tabContent'>\r\n\t        <span dojoAttachPoint='containerNode,focusNode' class='tabLabel'>${!label}</span>\r\n\t        <span dojoAttachPoint='closeButtonNode' class='closeImage' dojoAttachEvent='onmouseenter:_onMouse, onmouseleave:_onMouse, onclick:onClickCloseButton' stateModifier='CloseButton'>\r\n\t            <span dojoAttachPoint='closeText' class='closeText'>x</span>\r\n\t        </span>\r\n        </div>\r\n    </div>\r\n</div>\r\n",postCreate:function(){
if(this.closeButton){
dojo.addClass(this.innerDiv,"dijitClosable");
}else{
this.closeButtonNode.style.display="none";
}
this.inherited(arguments);
dojo.setSelectable(this.containerNode,false);
}});
}
if(!dojo._hasResource["dijit.Tree"]){
dojo._hasResource["dijit.Tree"]=true;
dojo.provide("dijit.Tree");
dojo.declare("dijit._TreeNode",[dijit._Widget,dijit._Templated,dijit._Container,dijit._Contained],{item:null,isTreeNode:true,label:"",isExpandable:null,isExpanded:false,state:"UNCHECKED",templateString:"<div class=\"dijitTreeNode\" waiRole=\"presentation\"\r\n\t><div dojoAttachPoint=\"rowNode\" waiRole=\"presentation\"\r\n\t\t><span dojoAttachPoint=\"expandoNode\" class=\"dijitTreeExpando\" waiRole=\"presentation\"\r\n\t\t></span\r\n\t\t><span dojoAttachPoint=\"expandoNodeText\" class=\"dijitExpandoText\" waiRole=\"presentation\"\r\n\t\t></span\r\n\t\t><div dojoAttachPoint=\"contentNode\" class=\"dijitTreeContent\" waiRole=\"presentation\">\r\n\t\t\t<div dojoAttachPoint=\"iconNode\" class=\"dijitInline dijitTreeIcon\" waiRole=\"presentation\"></div>\r\n\t\t\t<span dojoAttachPoint=\"labelNode\" class=\"dijitTreeLabel\" wairole=\"treeitem\" tabindex=\"-1\" waiState=\"selected-false\" dojoAttachEvent=\"onfocus:_onNodeFocus\"></span>\r\n\t\t</div\r\n\t></div>\r\n</div>\r\n",postCreate:function(){
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
var tree=this.tree,_742=tree.model;
if(tree._v10Compat&&item===_742.root){
item=null;
}
this.iconNode.className="dijitInline dijitTreeIcon "+tree.getIconClass(item,this.isExpanded);
this.labelNode.className="dijitTreeLabel "+tree.getLabelClass(item,this.isExpanded);
},_updateLayout:function(){
var _743=this.getParent();
if(!_743||_743.rowNode.style.display=="none"){
dojo.addClass(this.domNode,"dijitTreeIsRoot");
}else{
dojo.toggleClass(this.domNode,"dijitTreeIsLast",!this.getNextSibling());
}
},_setExpando:function(_744){
var _745=["dijitTreeExpandoLoading","dijitTreeExpandoOpened","dijitTreeExpandoClosed","dijitTreeExpandoLeaf"];
var idx=_744?0:(this.isExpandable?(this.isExpanded?1:2):3);
dojo.forEach(_745,function(s){
dojo.removeClass(this.expandoNode,s);
},this);
dojo.addClass(this.expandoNode,_745[idx]);
this.expandoNodeText.innerHTML=_744?"*":(this.isExpandable?(this.isExpanded?"-":"+"):"*");
},expand:function(){
if(this.isExpanded){
return;
}
if(this._wipeOut.status()=="playing"){
this._wipeOut.stop();
}
this.isExpanded=true;
dijit.setWaiState(this.labelNode,"expanded","true");
dijit.setWaiRole(this.containerNode,"group");
this.contentNode.className="dijitTreeContent dijitTreeContentExpanded";
this._setExpando();
this._updateItemClasses(this.item);
this._wipeIn.play();
},collapse:function(){
if(!this.isExpanded){
return;
}
if(this._wipeIn.status()=="playing"){
this._wipeIn.stop();
}
this.isExpanded=false;
dijit.setWaiState(this.labelNode,"expanded","false");
this.contentNode.className="dijitTreeContent";
this._setExpando();
this._updateItemClasses(this.item);
this._wipeOut.play();
},setLabelNode:function(_748){
this.labelNode.innerHTML="";
this.labelNode.appendChild(dojo.doc.createTextNode(_748));
},setChildItems:function(_749){
var tree=this.tree,_74b=tree.model;
this.getChildren().forEach(function(_74c){
dijit._Container.prototype.removeChild.call(this,_74c);
},this);
this.state="LOADED";
if(_749&&_749.length>0){
this.isExpandable=true;
if(!this.containerNode){
this.containerNode=this.tree.containerNodeTemplate.cloneNode(true);
this.domNode.appendChild(this.containerNode);
}
dojo.forEach(_749,function(item){
var id=_74b.getIdentity(item),_74f=tree._itemNodeMap[id],node=(_74f&&!_74f.getParent())?_74f:new dijit._TreeNode({item:item,tree:tree,isExpandable:_74b.mayHaveChildren(item),label:tree.getLabel(item)});
this.addChild(node);
tree._itemNodeMap[id]=node;
if(this.tree.persist){
if(tree._openedItemIds[id]){
tree._expandNode(node);
}
}
},this);
dojo.forEach(this.getChildren(),function(_751,idx){
_751._updateLayout();
});
}else{
this.isExpandable=false;
}
if(this._setExpando){
this._setExpando(false);
}
if(!this.parent){
var fc=this.tree.showRoot?this:this.getChildren()[0],_754=fc?fc.labelNode:this.domNode;
_754.setAttribute("tabIndex","0");
}
if(this.containerNode&&!this._wipeIn){
this._wipeIn=dojo.fx.wipeIn({node:this.containerNode,duration:150});
this._wipeOut=dojo.fx.wipeOut({node:this.containerNode,duration:150});
}
},removeChild:function(node){
this.inherited(arguments);
var _756=this.getChildren();
if(_756.length==0){
this.isExpandable=false;
this.collapse();
}
dojo.forEach(_756,function(_757){
_757._updateLayout();
});
},makeExpandable:function(){
this.isExpandable=true;
this._setExpando(false);
},_onNodeFocus:function(evt){
var node=dijit.getEnclosingWidget(evt.target);
this.tree._onTreeFocus(node);
}});
dojo.declare("dijit.Tree",[dijit._Widget,dijit._Templated],{store:null,model:null,query:null,label:"",showRoot:true,childrenAttr:["children"],openOnClick:false,templateString:"<div class=\"dijitTreeContainer\" waiRole=\"tree\"\r\n\tdojoAttachEvent=\"onclick:_onClick,onkeypress:_onKeyPress\">\r\n</div>\r\n",isExpandable:true,isTree:true,persist:true,dndController:null,dndParams:["onDndDrop","itemCreator","onDndCancel","checkAcceptance","checkItemAcceptance"],onDndDrop:null,itemCreator:null,onDndCancel:null,checkAcceptance:null,checkItemAcceptance:null,_publish:function(_75a,_75b){
dojo.publish(this.id,[dojo.mixin({tree:this,event:_75a},_75b||{})]);
},postMixInProperties:function(){
this.tree=this;
this._itemNodeMap={};
if(!this.cookieName){
this.cookieName=this.id+"SaveStateCookie";
}
},postCreate:function(){
if(this.persist){
var _75c=dojo.cookie(this.cookieName);
this._openedItemIds={};
if(_75c){
dojo.forEach(_75c.split(","),function(item){
this._openedItemIds[item]=true;
},this);
}
}
var div=dojo.doc.createElement("div");
div.style.display="none";
div.className="dijitTreeContainer";
dijit.setWaiRole(div,"presentation");
this.containerNodeTemplate=div;
if(!this.model){
this._store2model();
}
this.connect(this.model,"onChange","_onItemChange");
this.connect(this.model,"onChildrenChange","_onItemChildrenChange");
this._load();
this.inherited("postCreate",arguments);
if(this.dndController){
if(dojo.isString(this.dndController)){
this.dndController=dojo.getObject(this.dndController);
}
var _75f={};
for(var i=0;i<this.dndParams.length;i++){
if(this[this.dndParams[i]]){
_75f[this.dndParams[i]]=this[this.dndParams[i]];
}
}
this.dndController=new this.dndController(this,_75f);
}
},_store2model:function(){
this._v10Compat=true;
dojo.deprecated("Tree: from version 2.0, should specify a model object rather than a store/query");
var _761={id:this.id+"_ForestStoreModel",store:this.store,query:this.query,childrenAttrs:this.childrenAttr};
if(this.params.mayHaveChildren){
_761.mayHaveChildren=dojo.hitch(this,"mayHaveChildren");
}
if(this.params.getItemChildren){
_761.getChildren=dojo.hitch(this,function(item,_763,_764){
this.getItemChildren((this._v10Compat&&item===this.model.root)?null:item,_763,_764);
});
}
this.model=new dijit.tree.ForestStoreModel(_761);
this.showRoot=Boolean(this.label);
},_load:function(){
this.model.getRoot(dojo.hitch(this,function(item){
var rn=this.rootNode=new dijit._TreeNode({item:item,tree:this,isExpandable:true,label:this.label||this.getLabel(item)});
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
},getItemChildren:function(_769,_76a){
},getLabel:function(item){
return this.model.getLabel(item);
},getIconClass:function(item,_76d){
return (!item||this.model.mayHaveChildren(item))?(_76d?"dijitFolderOpened":"dijitFolderClosed"):"dijitLeaf";
},getLabelClass:function(item,_76f){
},_onKeyPress:function(e){
if(e.altKey){
return;
}
var _771=dijit.getEnclosingWidget(e.target);
if(!_771){
return;
}
if(e.charCode){
var _772=e.charCode;
if(!e.altKey&&!e.ctrlKey&&!e.shiftKey&&!e.metaKey){
_772=(String.fromCharCode(_772)).toLowerCase();
this._onLetterKeyNav({node:_771,key:_772});
dojo.stopEvent(e);
}
}else{
var map=this._keyHandlerMap;
if(!map){
map={};
map[dojo.keys.ENTER]="_onEnterKey";
map[this.isLeftToRight()?dojo.keys.LEFT_ARROW:dojo.keys.RIGHT_ARROW]="_onLeftArrow";
map[this.isLeftToRight()?dojo.keys.RIGHT_ARROW:dojo.keys.LEFT_ARROW]="_onRightArrow";
map[dojo.keys.UP_ARROW]="_onUpArrow";
map[dojo.keys.DOWN_ARROW]="_onDownArrow";
map[dojo.keys.HOME]="_onHomeKey";
map[dojo.keys.END]="_onEndKey";
this._keyHandlerMap=map;
}
if(this._keyHandlerMap[e.keyCode]){
this[this._keyHandlerMap[e.keyCode]]({node:_771,item:_771.item});
dojo.stopEvent(e);
}
}
},_onEnterKey:function(_774){
this._publish("execute",{item:_774.item,node:_774.node});
this.onClick(_774.item,_774.node);
},_onDownArrow:function(_775){
var node=this._getNextNode(_775.node);
if(node&&node.isTreeNode){
this.focusNode(node);
}
},_onUpArrow:function(_777){
var node=_777.node;
var _779=node.getPreviousSibling();
if(_779){
node=_779;
while(node.isExpandable&&node.isExpanded&&node.hasChildren()){
var _77a=node.getChildren();
node=_77a[_77a.length-1];
}
}else{
var _77b=node.getParent();
if(!(!this.showRoot&&_77b===this.rootNode)){
node=_77b;
}
}
if(node&&node.isTreeNode){
this.focusNode(node);
}
},_onRightArrow:function(_77c){
var node=_77c.node;
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
},_onLeftArrow:function(_77e){
var node=_77e.node;
if(node.isExpandable&&node.isExpanded){
this._collapseNode(node);
}else{
node=node.getParent();
if(node&&node.isTreeNode){
this.focusNode(node);
}
}
},_onHomeKey:function(){
var node=this._getRootOrFirstNode();
if(node){
this.focusNode(node);
}
},_onEndKey:function(_781){
var node=this;
while(node.isExpanded){
var c=node.getChildren();
node=c[c.length-1];
}
if(node&&node.isTreeNode){
this.focusNode(node);
}
},_onLetterKeyNav:function(_784){
var node=startNode=_784.node,key=_784.key;
do{
node=this._getNextNode(node);
if(!node){
node=this._getRootOrFirstNode();
}
}while(node!==startNode&&(node.label.charAt(0).toLowerCase()!=key));
if(node&&node.isTreeNode){
if(node!==startNode){
this.focusNode(node);
}
}
},_onClick:function(e){
var _788=e.target;
var _789=dijit.getEnclosingWidget(_788);
if(!_789||!_789.isTreeNode){
return;
}
if((this.openOnClick&&_789.isExpandable)||(_788==_789.expandoNode||_788==_789.expandoNodeText)){
if(_789.isExpandable){
this._onExpandoClick({node:_789});
}
}else{
this._publish("execute",{item:_789.item,node:_789});
this.onClick(_789.item,_789);
this.focusNode(_789);
}
dojo.stopEvent(e);
},_onExpandoClick:function(_78a){
var node=_78a.node;
this.focusNode(node);
if(node.isExpanded){
this._collapseNode(node);
}else{
this._expandNode(node);
}
},onClick:function(item,node){
},_getNextNode:function(node){
if(node.isExpandable&&node.isExpanded&&node.hasChildren()){
return node.getChildren()[0];
}else{
while(node&&node.isTreeNode){
var _78f=node.getNextSibling();
if(_78f){
return _78f;
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
if(this.persist&&node.item){
delete this._openedItemIds[this.model.getIdentity(node.item)];
this._saveState();
}
}
},_expandNode:function(node){
if(!node.isExpandable){
return;
}
var _792=this.model,item=node.item;
switch(node.state){
case "LOADING":
return;
case "UNCHECKED":
node.markProcessing();
var _794=this;
_792.getChildren(item,function(_795){
node.unmarkProcessing();
node.setChildItems(_795);
_794._expandNode(node);
},function(err){
console.error(_794,": error loading root children: ",err);
});
break;
default:
node.expand();
if(this.persist&&item){
this._openedItemIds[_792.getIdentity(item)]=true;
this._saveState();
}
}
},blurNode:function(){
var node=this.lastFocused;
if(!node){
return;
}
var _798=node.labelNode;
dojo.removeClass(_798,"dijitTreeLabelFocused");
_798.setAttribute("tabIndex","-1");
dijit.setWaiState(_798,"selected",false);
this.lastFocused=null;
},focusNode:function(node){
node.labelNode.focus();
},_onBlur:function(){
this.inherited(arguments);
if(this.lastFocused){
var _79a=this.lastFocused.labelNode;
dojo.removeClass(_79a,"dijitTreeLabelFocused");
}
},_onTreeFocus:function(node){
if(node){
if(node!=this.lastFocused){
this.blurNode();
}
var _79c=node.labelNode;
_79c.setAttribute("tabIndex","0");
dijit.setWaiState(_79c,"selected",true);
dojo.addClass(_79c,"dijitTreeLabelFocused");
this.lastFocused=node;
}
},_onItemDelete:function(item){
var _79e=this.model.getIdentity(item);
var node=this._itemNodeMap[_79e];
if(node){
var _7a0=node.getParent();
if(_7a0){
_7a0.removeChild(node);
}
delete this._itemNodeMap[_79e];
node.destroyRecursive();
}
},_onItemChange:function(item){
var _7a2=this.model,_7a3=_7a2.getIdentity(item),node=this._itemNodeMap[_7a3];
if(node){
node.setLabelNode(this.getLabel(item));
node._updateItemClasses(item);
}
},_onItemChildrenChange:function(_7a5,_7a6){
var _7a7=this.model,_7a8=_7a7.getIdentity(_7a5),_7a9=this._itemNodeMap[_7a8];
if(_7a9){
_7a9.setChildItems(_7a6);
}
},_saveState:function(){
if(!this.persist){
return;
}
var ary=[];
for(var id in this._openedItemIds){
ary.push(id);
}
dojo.cookie(this.cookieName,ary.join(","));
},destroy:function(){
if(this.rootNode){
this.rootNode.destroyRecursive();
}
this.rootNode=null;
this.inherited(arguments);
},destroyRecursive:function(){
this.destroy();
}});
dojo.declare("dijit.tree.TreeStoreModel",null,{store:null,childrenAttrs:["children"],root:null,query:null,constructor:function(args){
dojo.mixin(this,args);
this.connects=[];
var _7ad=this.store;
if(!_7ad.getFeatures()["dojo.data.api.Identity"]){
throw new Error("dijit.Tree: store must support dojo.data.Identity");
}
if(_7ad.getFeatures()["dojo.data.api.Notification"]){
this.connects=this.connects.concat([dojo.connect(_7ad,"onNew",this,"_onNewItem"),dojo.connect(_7ad,"onDelete",this,"_onDeleteItem"),dojo.connect(_7ad,"onSet",this,"_onSetItem")]);
}
},destroy:function(){
dojo.forEach(this.connects,dojo.disconnect);
},getRoot:function(_7ae,_7af){
if(this.root){
_7ae(this.root);
}else{
this.store.fetch({query:this.query,onComplete:dojo.hitch(this,function(_7b0){
if(_7b0.length!=1){
throw new Error(this.declaredClass+": query "+query+" returned "+_7b0.length+" items, but must return exactly one item");
}
this.root=_7b0[0];
_7ae(this.root);
}),onError:_7af});
}
},mayHaveChildren:function(item){
return dojo.some(this.childrenAttrs,function(attr){
return this.store.hasAttribute(item,attr);
},this);
},getChildren:function(_7b3,_7b4,_7b5){
var _7b6=this.store;
var _7b7=[];
for(var i=0;i<this.childrenAttrs.length;i++){
var vals=_7b6.getValues(_7b3,this.childrenAttrs[i]);
_7b7=_7b7.concat(vals);
}
var _7ba=0;
dojo.forEach(_7b7,function(item){
if(!_7b6.isItemLoaded(item)){
_7ba++;
}
});
if(_7ba==0){
_7b4(_7b7);
}else{
var _7bc=function _7bc(item){
if(--_7ba==0){
_7b4(_7b7);
}
};
dojo.forEach(_7b7,function(item){
if(!_7b6.isItemLoaded(item)){
_7b6.loadItem({item:item,onItem:_7bc,onError:_7b5});
}
});
}
},getIdentity:function(item){
return this.store.getIdentity(item);
},getLabel:function(item){
return this.store.getLabel(item);
},newItem:function(args,_7c2){
var _7c3={parent:_7c2,attribute:this.childrenAttrs[0]};
return this.store.newItem(args,_7c3);
},pasteItem:function(_7c4,_7c5,_7c6,_7c7){
var _7c8=this.store,_7c9=this.childrenAttrs[0];
if(_7c5){
dojo.forEach(this.childrenAttrs,function(attr){
if(_7c8.containsValue(_7c5,attr,_7c4)){
if(!_7c7){
var _7cb=dojo.filter(_7c8.getValues(_7c5,attr),function(x){
return x!=_7c4;
});
_7c8.setValues(_7c5,attr,_7cb);
}
_7c9=attr;
}
});
}
if(_7c6){
_7c8.setValues(_7c6,_7c9,_7c8.getValues(_7c6,_7c9).concat(_7c4));
}
},onChange:function(item){
},onChildrenChange:function(_7ce,_7cf){
},_onNewItem:function(item,_7d1){
if(!_7d1){
return;
}
this.getChildren(_7d1.item,dojo.hitch(this,function(_7d2){
this.onChildrenChange(_7d1.item,_7d2);
}));
},_onDeleteItem:function(item){
},_onSetItem:function(item,_7d5,_7d6,_7d7){
if(dojo.indexOf(this.childrenAttrs,_7d5)!=-1){
this.getChildren(item,dojo.hitch(this,function(_7d8){
this.onChildrenChange(item,_7d8);
}));
}else{
this.onChange(item);
}
}});
dojo.declare("dijit.tree.ForestStoreModel",dijit.tree.TreeStoreModel,{rootId:"$root$",rootLabel:"ROOT",query:null,constructor:function(_7d9){
this.root={store:this,root:true,id:_7d9.rootId,label:_7d9.rootLabel,children:_7d9.rootChildren};
},mayHaveChildren:function(item){
return item===this.root||this.inherited(arguments);
},getChildren:function(_7db,_7dc,_7dd){
if(_7db===this.root){
if(this.root.children){
_7dc(this.root.children);
}else{
this.store.fetch({query:this.query,onComplete:dojo.hitch(this,function(_7de){
this.root.children=_7de;
_7dc(_7de);
}),onError:_7dd});
}
}else{
this.inherited(arguments);
}
},getIdentity:function(item){
return (item===this.root)?this.root.id:this.inherited(arguments);
},getLabel:function(item){
return (item===this.root)?this.root.label:this.inherited(arguments);
},newItem:function(args,_7e2){
if(_7e2===this.root){
this.onNewRootItem(args);
return this.store.newItem(args);
}else{
return this.inherited(arguments);
}
},onNewRootItem:function(args){
},pasteItem:function(_7e4,_7e5,_7e6,_7e7){
if(_7e5===this.root){
if(!_7e7){
this.onLeaveRoot(_7e4);
}
}
dijit.tree.TreeStoreModel.prototype.pasteItem.call(this,_7e4,_7e5===this.root?null:_7e5,_7e6===this.root?null:_7e6);
if(_7e6===this.root){
this.onAddToRoot(_7e4);
}
},onAddToRoot:function(item){
console.log(this,": item ",item," added to root");
},onLeaveRoot:function(item){
console.log(this,": item ",item," removed from root");
},_requeryTop:function(){
var _7ea=this,_7eb=this.root.children;
this.store.fetch({query:this.query,onComplete:function(_7ec){
_7ea.root.children=_7ec;
if(_7eb.length!=_7ec.length||dojo.some(_7eb,function(item,idx){
return _7ec[idx]!=item;
})){
_7ea.onChildrenChange(_7ea.root,_7ec);
}
}});
},_onNewItem:function(item,_7f0){
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
dojox.data.dom.createDocument=function(str,_7f3){
var _7f4=dojo.doc;
if(!_7f3){
_7f3="text/xml";
}
if(str&&(typeof dojo.global["DOMParser"])!=="undefined"){
var _7f5=new DOMParser();
return _7f5.parseFromString(str,_7f3);
}else{
if((typeof dojo.global["ActiveXObject"])!=="undefined"){
var _7f6=["MSXML2","Microsoft","MSXML","MSXML3"];
for(var i=0;i<_7f6.length;i++){
try{
var doc=new ActiveXObject(_7f6[i]+".XMLDOM");
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
if((_7f4.implementation)&&(_7f4.implementation.createDocument)){
if(str){
if(_7f4.createElement){
var tmp=_7f4.createElement("xml");
tmp.innerHTML=str;
var _7fa=_7f4.implementation.createDocument("foo","",null);
for(var i=0;i<tmp.childNodes.length;i++){
_7fa.importNode(tmp.childNodes.item(i),true);
}
return _7fa;
}
}else{
return _7f4.implementation.createDocument("","",null);
}
}
}
}
return null;
};
dojox.data.dom.textContent=function(node,text){
if(arguments.length>1){
var _7fd=node.ownerDocument||dojo.doc;
dojox.data.dom.replaceChildren(node,_7fd.createTextNode(text));
return text;
}else{
if(node.textContent!==undefined){
return node.textContent;
}
var _7fe="";
if(node==null){
return _7fe;
}
for(var i=0;i<node.childNodes.length;i++){
switch(node.childNodes[i].nodeType){
case 1:
case 5:
_7fe+=dojox.data.dom.textContent(node.childNodes[i]);
break;
case 3:
case 2:
case 4:
_7fe+=node.childNodes[i].nodeValue;
break;
default:
break;
}
}
return _7fe;
}
};
dojox.data.dom.replaceChildren=function(node,_801){
var _802=[];
if(dojo.isIE){
for(var i=0;i<node.childNodes.length;i++){
_802.push(node.childNodes[i]);
}
}
dojox.data.dom.removeChildren(node);
for(var i=0;i<_802.length;i++){
dojo._destroyElement(_802[i]);
}
if(!dojo.isArray(_801)){
node.appendChild(_801);
}else{
for(var i=0;i<_801.length;i++){
node.appendChild(_801[i]);
}
}
};
dojox.data.dom.removeChildren=function(node){
var _805=node.childNodes.length;
while(node.hasChildNodes()){
node.removeChild(node.firstChild);
}
return _805;
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
},url:"",rootItem:"",keyAttribute:"",label:"",sendQuery:false,getValue:function(item,_809,_80a){
var _80b=item.element;
if(_809==="tagName"){
return _80b.nodeName;
}else{
if(_809==="childNodes"){
for(var i=0;i<_80b.childNodes.length;i++){
var node=_80b.childNodes[i];
if(node.nodeType===1){
return this._getItem(node);
}
}
return _80a;
}else{
if(_809==="text()"){
for(var i=0;i<_80b.childNodes.length;i++){
var node=_80b.childNodes[i];
if(node.nodeType===3||node.nodeType===4){
return node.nodeValue;
}
}
return _80a;
}else{
_809=this._getAttribute(_80b.nodeName,_809);
if(_809.charAt(0)==="@"){
var name=_809.substring(1);
var _80f=_80b.getAttribute(name);
return (_80f!==undefined)?_80f:_80a;
}else{
for(var i=0;i<_80b.childNodes.length;i++){
var node=_80b.childNodes[i];
if(node.nodeType===1&&node.nodeName===_809){
return this._getItem(node);
}
}
return _80a;
}
}
}
}
},getValues:function(item,_811){
var _812=item.element;
if(_811==="tagName"){
return [_812.nodeName];
}else{
if(_811==="childNodes"){
var _813=[];
for(var i=0;i<_812.childNodes.length;i++){
var node=_812.childNodes[i];
if(node.nodeType===1){
_813.push(this._getItem(node));
}
}
return _813;
}else{
if(_811==="text()"){
var _813=[];
for(var i=0;i<_812.childNodes.length;i++){
var node=childNodes[i];
if(node.nodeType===3){
_813.push(node.nodeValue);
}
}
return _813;
}else{
_811=this._getAttribute(_812.nodeName,_811);
if(_811.charAt(0)==="@"){
var name=_811.substring(1);
var _817=_812.getAttribute(name);
return (_817!==undefined)?[_817]:[];
}else{
var _813=[];
for(var i=0;i<_812.childNodes.length;i++){
var node=_812.childNodes[i];
if(node.nodeType===1&&node.nodeName===_811){
_813.push(this._getItem(node));
}
}
return _813;
}
}
}
}
},getAttributes:function(item){
var _819=item.element;
var _81a=[];
_81a.push("tagName");
if(_819.childNodes.length>0){
var _81b={};
var _81c=true;
var text=false;
for(var i=0;i<_819.childNodes.length;i++){
var node=_819.childNodes[i];
if(node.nodeType===1){
var name=node.nodeName;
if(!_81b[name]){
_81a.push(name);
_81b[name]=name;
}
_81c=true;
}else{
if(node.nodeType===3){
text=true;
}
}
}
if(_81c){
_81a.push("childNodes");
}
if(text){
_81a.push("text()");
}
}
for(var i=0;i<_819.attributes.length;i++){
_81a.push("@"+_819.attributes[i].nodeName);
}
if(this._attributeMap){
for(var key in this._attributeMap){
var i=key.indexOf(".");
if(i>0){
var _822=key.substring(0,i);
if(_822===_819.nodeName){
_81a.push(key.substring(i+1));
}
}else{
_81a.push(key);
}
}
}
return _81a;
},hasAttribute:function(item,_824){
return (this.getValue(item,_824)!==undefined);
},containsValue:function(item,_826,_827){
var _828=this.getValues(item,_826);
for(var i=0;i<_828.length;i++){
if((typeof _827==="string")){
if(_828[i].toString&&_828[i].toString()===_827){
return true;
}
}else{
if(_828[i]===_827){
return true;
}
}
}
return false;
},isItem:function(_82a){
if(_82a&&_82a.element&&_82a.store&&_82a.store===this){
return true;
}
return false;
},isItemLoaded:function(_82b){
return this.isItem(_82b);
},loadItem:function(_82c){
},getFeatures:function(){
var _82d={"dojo.data.api.Read":true,"dojo.data.api.Write":true};
return _82d;
},getLabel:function(item){
if((this.label!=="")&&this.isItem(item)){
var _82f=this.getValue(item,this.label);
if(_82f){
return _82f.toString();
}
}
return undefined;
},getLabelAttributes:function(item){
if(this.label!==""){
return [this.label];
}
return null;
},_fetchItems:function(_831,_832,_833){
var url=this._getFetchUrl(_831);
console.log("XmlStore._fetchItems(): url="+url);
if(!url){
_833(new Error("No URL specified."));
return;
}
var _835=(!this.sendQuery?_831:null);
var self=this;
var _837={url:url,handleAs:"xml",preventCache:true};
var _838=dojo.xhrGet(_837);
_838.addCallback(function(data){
var _83a=self._getItems(data,_835);
console.log("XmlStore._fetchItems(): length="+(_83a?_83a.length:0));
if(_83a&&_83a.length>0){
_832(_83a,_831);
}else{
_832([],_831);
}
});
_838.addErrback(function(data){
_833(data,_831);
});
},_getFetchUrl:function(_83c){
if(!this.sendQuery){
return this.url;
}
var _83d=_83c.query;
if(!_83d){
return this.url;
}
if(dojo.isString(_83d)){
return this.url+_83d;
}
var _83e="";
for(var name in _83d){
var _840=_83d[name];
if(_840){
if(_83e){
_83e+="&";
}
_83e+=(name+"="+_840);
}
}
if(!_83e){
return this.url;
}
var _841=this.url;
if(_841.indexOf("?")<0){
_841+="?";
}else{
_841+="&";
}
return _841+_83e;
},_getItems:function(_842,_843){
var _844=null;
if(_843){
_844=_843.query;
}
var _845=[];
var _846=null;
console.log("Looking up root item: "+this.rootItem);
if(this.rootItem!==""){
_846=_842.getElementsByTagName(this.rootItem);
}else{
_846=_842.documentElement.childNodes;
}
for(var i=0;i<_846.length;i++){
var node=_846[i];
if(node.nodeType!=1){
continue;
}
var item=this._getItem(node);
if(_844){
var _84a=true;
var _84b=_843.queryOptions?_843.queryOptions.ignoreCase:false;
var _84c={};
for(var key in _844){
var _84e=_844[key];
if(typeof _84e==="string"){
_84c[key]=dojo.data.util.filter.patternToRegExp(_84e,_84b);
}
}
for(var _84f in _844){
var _84e=this.getValue(item,_84f);
if(_84e){
var _850=_844[_84f];
if((typeof _84e)==="string"&&(_84c[_84f])){
if((_84e.match(_84c[_84f]))!==null){
continue;
}
}else{
if((typeof _84e)==="object"){
if(_84e.toString&&(_84c[_84f])){
var _851=_84e.toString();
if((_851.match(_84c[_84f]))!==null){
continue;
}
}else{
if(_850==="*"||_850===_84e){
continue;
}
}
}
}
}
_84a=false;
break;
}
if(!_84a){
continue;
}
}
_845.push(item);
}
dojo.forEach(_845,function(item){
item.element.parentNode.removeChild(item.element);
},this);
return _845;
},close:function(_853){
},newItem:function(_854){
console.log("XmlStore.newItem()");
_854=(_854||{});
var _855=_854.tagName;
if(!_855){
_855=this.rootItem;
if(_855===""){
return null;
}
}
var _856=this._getDocument();
var _857=_856.createElement(_855);
for(var _858 in _854){
if(_858==="tagName"){
continue;
}else{
if(_858==="text()"){
var text=_856.createTextNode(_854[_858]);
_857.appendChild(text);
}else{
_858=this._getAttribute(_855,_858);
if(_858.charAt(0)==="@"){
var name=_858.substring(1);
_857.setAttribute(name,_854[_858]);
}else{
var _85b=_856.createElement(_858);
var text=_856.createTextNode(_854[_858]);
_85b.appendChild(text);
_857.appendChild(_85b);
}
}
}
}
var item=this._getItem(_857);
this._newItems.push(item);
return item;
},deleteItem:function(item){
console.log("XmlStore.deleteItem()");
var _85e=item.element;
if(_85e.parentNode){
this._backupItem(item);
_85e.parentNode.removeChild(_85e);
return true;
}
this._forgetItem(item);
this._deletedItems.push(item);
return true;
},setValue:function(item,_860,_861){
if(_860==="tagName"){
return false;
}
this._backupItem(item);
var _862=item.element;
if(_860==="childNodes"){
var _863=_861.element;
_862.appendChild(_863);
}else{
if(_860==="text()"){
while(_862.firstChild){
_862.removeChild(_862.firstChild);
}
var text=this._getDocument(_862).createTextNode(_861);
_862.appendChild(text);
}else{
_860=this._getAttribute(_862.nodeName,_860);
if(_860.charAt(0)==="@"){
var name=_860.substring(1);
_862.setAttribute(name,_861);
}else{
var _863=null;
for(var i=0;i<_862.childNodes.length;i++){
var node=_862.childNodes[i];
if(node.nodeType===1&&node.nodeName===_860){
_863=node;
break;
}
}
var _868=this._getDocument(_862);
if(_863){
while(_863.firstChild){
_863.removeChild(_863.firstChild);
}
}else{
_863=_868.createElement(_860);
_862.appendChild(_863);
}
var text=_868.createTextNode(_861);
_863.appendChild(text);
}
}
}
return true;
},setValues:function(item,_86a,_86b){
if(_86a==="tagName"){
return false;
}
this._backupItem(item);
var _86c=item.element;
if(_86a==="childNodes"){
while(_86c.firstChild){
_86c.removeChild(_86c.firstChild);
}
for(var i=0;i<_86b.length;i++){
var _86e=_86b[i].element;
_86c.appendChild(_86e);
}
}else{
if(_86a==="text()"){
while(_86c.firstChild){
_86c.removeChild(_86c.firstChild);
}
var _86f="";
for(var i=0;i<_86b.length;i++){
_86f+=_86b[i];
}
var text=this._getDocument(_86c).createTextNode(_86f);
_86c.appendChild(text);
}else{
_86a=this._getAttribute(_86c.nodeName,_86a);
if(_86a.charAt(0)==="@"){
var name=_86a.substring(1);
_86c.setAttribute(name,_86b[0]);
}else{
for(var i=_86c.childNodes.length-1;i>=0;i--){
var node=_86c.childNodes[i];
if(node.nodeType===1&&node.nodeName===_86a){
_86c.removeChild(node);
}
}
var _873=this._getDocument(_86c);
for(var i=0;i<_86b.length;i++){
var _86e=_873.createElement(_86a);
var text=_873.createTextNode(_86b[i]);
_86e.appendChild(text);
_86c.appendChild(_86e);
}
}
}
}
return true;
},unsetAttribute:function(item,_875){
if(_875==="tagName"){
return false;
}
this._backupItem(item);
var _876=item.element;
if(_875==="childNodes"||_875==="text()"){
while(_876.firstChild){
_876.removeChild(_876.firstChild);
}
}else{
_875=this._getAttribute(_876.nodeName,_875);
if(_875.charAt(0)==="@"){
var name=_875.substring(1);
_876.removeAttribute(name);
}else{
for(var i=_876.childNodes.length-1;i>=0;i--){
var node=_876.childNodes[i];
if(node.nodeType===1&&node.nodeName===_875){
_876.removeChild(node);
}
}
}
}
return true;
},save:function(_87a){
if(!_87a){
_87a={};
}
for(var i=0;i<this._modifiedItems.length;i++){
this._saveItem(this._modifiedItems[i],_87a,"PUT");
}
for(var i=0;i<this._newItems.length;i++){
var item=this._newItems[i];
if(item.element.parentNode){
this._newItems.splice(i,1);
i--;
continue;
}
this._saveItem(this._newItems[i],_87a,"POST");
}
for(var i=0;i<this._deletedItems.length;i++){
this._saveItem(this._deletedItems[i],_87a,"DELETE");
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
var _87e=this._getRootElement(item.element);
return (this._getItemIndex(this._newItems,_87e)>=0||this._getItemIndex(this._deletedItems,_87e)>=0||this._getItemIndex(this._modifiedItems,_87e)>=0);
}else{
return (this._newItems.length>0||this._deletedItems.length>0||this._modifiedItems.length>0);
}
},_saveItem:function(item,_880,_881){
if(_881==="PUT"){
url=this._getPutUrl(item);
}else{
if(_881==="DELETE"){
url=this._getDeleteUrl(item);
}else{
url=this._getPostUrl(item);
}
}
if(!url){
if(_880.onError){
_880.onError.call(_882,new Error("No URL for saving content: "+postContent));
}
return;
}
var _883={url:url,method:(_881||"POST"),contentType:"text/xml",handleAs:"xml"};
var _884;
if(_881==="PUT"){
_883.putData=this._getPutContent(item);
saveHandler=dojo.rawXhrPut(_883);
}else{
if(_881==="DELETE"){
saveHandler=dojo.xhrDelete(_883);
}else{
_883.postData=this._getPostContent(item);
saveHandler=dojo.rawXhrPost(_883);
}
}
var _882=(_880.scope||dojo.global);
var self=this;
saveHandler.addCallback(function(data){
self._forgetItem(item);
if(_880.onComplete){
_880.onComplete.call(_882);
}
});
saveHandler.addErrback(function(_887){
if(_880.onError){
_880.onError.call(_882,_887);
}
});
},_getPostUrl:function(item){
return this.url;
},_getPutUrl:function(item){
return this.url;
},_getDeleteUrl:function(item){
var url=this.url;
if(item&&this.keyAttribute!==""){
var _88c=this.getValue(item,this.keyAttribute);
if(_88c){
var key=this.keyAttribute.charAt(0)==="@"?this.keyAttribute.substring(1):this.keyAttribute;
url+=url.indexOf("?")<0?"?":"&";
url+=key+"="+_88c;
}
}
return url;
},_getPostContent:function(item){
var _88f=item.element;
var _890="<?xml version=\"1.0\"?>";
return _890+dojox.data.dom.innerXML(_88f);
},_getPutContent:function(item){
var _892=item.element;
var _893="<?xml version=\"1.0\"?>";
return _893+dojox.data.dom.innerXML(_892);
},_getAttribute:function(_894,_895){
if(this._attributeMap){
var key=_894+"."+_895;
var _897=this._attributeMap[key];
if(_897){
_895=_897;
}else{
_897=this._attributeMap[_895];
if(_897){
_895=_897;
}
}
}
return _895;
},_getItem:function(_898){
return new dojox.data.XmlItem(_898,this);
},_getItemIndex:function(_899,_89a){
for(var i=0;i<_899.length;i++){
if(_899[i].element===_89a){
return i;
}
}
return -1;
},_backupItem:function(item){
var _89d=this._getRootElement(item.element);
if(this._getItemIndex(this._newItems,_89d)>=0||this._getItemIndex(this._modifiedItems,_89d)>=0){
return;
}
if(_89d!=item.element){
item=this._getItem(_89d);
}
item._backup=_89d.cloneNode(true);
this._modifiedItems.push(item);
},_restoreItems:function(_89e){
dojo.forEach(_89e,function(item){
if(item._backup){
item.element=item._backup;
item._backup=null;
}
},this);
},_forgetItem:function(item){
var _8a1=item.element;
var _8a2=this._getItemIndex(this._newItems,_8a1);
if(_8a2>=0){
this._newItems.splice(_8a2,1);
}
_8a2=this._getItemIndex(this._deletedItems,_8a1);
if(_8a2>=0){
this._deletedItems.splice(_8a2,1);
}
_8a2=this._getItemIndex(this._modifiedItems,_8a1);
if(_8a2>=0){
this._modifiedItems.splice(_8a2,1);
}
},_getDocument:function(_8a3){
if(_8a3){
return _8a3.ownerDocument;
}else{
if(!this._document){
return dojox.data.dom.createDocument();
}
}
},_getRootElement:function(_8a4){
while(_8a4.parentNode){
_8a4=_8a4.parentNode;
}
return _8a4;
}});
dojo.declare("dojox.data.XmlItem",null,{constructor:function(_8a5,_8a6){
this.element=_8a5;
this.store=_8a6;
},toString:function(){
var str="";
if(this.element){
for(var i=0;i<this.element.childNodes.length;i++){
var node=this.element.childNodes[i];
if(node.nodeType===3){
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
m._degToRad=function(_8ab){
return Math.PI*_8ab/180;
};
m._radToDeg=function(_8ac){
return _8ac/Math.PI*180;
};
m.Matrix2D=function(arg){
if(arg){
if(typeof arg=="number"){
this.xx=this.yy=arg;
}else{
if(arg instanceof Array){
if(arg.length>0){
var _8ae=m.normalize(arg[0]);
for(var i=1;i<arg.length;++i){
var l=_8ae,r=dojox.gfx.matrix.normalize(arg[i]);
_8ae=new m.Matrix2D();
_8ae.xx=l.xx*r.xx+l.xy*r.yx;
_8ae.xy=l.xx*r.xy+l.xy*r.yy;
_8ae.yx=l.yx*r.xx+l.yy*r.yx;
_8ae.yy=l.yx*r.xy+l.yy*r.yy;
_8ae.dx=l.xx*r.dx+l.xy*r.dy+l.dx;
_8ae.dy=l.yx*r.dx+l.yy*r.dy+l.dy;
}
dojo.mixin(this,_8ae);
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
},rotate:function(_8b6){
var c=Math.cos(_8b6);
var s=Math.sin(_8b6);
return new m.Matrix2D({xx:c,xy:-s,yx:s,yy:c});
},rotateg:function(_8b9){
return m.rotate(m._degToRad(_8b9));
},skewX:function(_8ba){
return new m.Matrix2D({xy:-Math.tan(_8ba)});
},skewXg:function(_8bb){
return m.skewX(m._degToRad(_8bb));
},skewY:function(_8bc){
return new m.Matrix2D({yx:Math.tan(_8bc)});
},skewYg:function(_8bd){
return m.skewY(m._degToRad(_8bd));
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
},normalize:function(_8ca){
return (_8ca instanceof m.Matrix2D)?_8ca:new m.Matrix2D(_8ca);
},clone:function(_8cb){
var obj=new m.Matrix2D();
for(var i in _8cb){
if(typeof (_8cb[i])=="number"&&typeof (obj[i])=="number"&&obj[i]!=_8cb[i]){
obj[i]=_8cb[i];
}
}
return obj;
},invert:function(_8ce){
var M=m.normalize(_8ce),D=M.xx*M.yy-M.xy*M.yx,M=new m.Matrix2D({xx:M.yy/D,xy:-M.xy/D,yx:-M.yx/D,yy:M.xx/D,dx:(M.xy*M.dy-M.yy*M.dx)/D,dy:(M.yx*M.dx-M.xx*M.dy)/D});
return M;
},_multiplyPoint:function(_8d1,x,y){
return {x:_8d1.xx*x+_8d1.xy*y+_8d1.dx,y:_8d1.yx*x+_8d1.yy*y+_8d1.dy};
},multiplyPoint:function(_8d4,a,b){
var M=m.normalize(_8d4);
if(typeof a=="number"&&typeof b=="number"){
return m._multiplyPoint(M,a,b);
}
return m._multiplyPoint(M,a.x,a.y);
},multiply:function(_8d8){
var M=m.normalize(_8d8);
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
},_sandwich:function(_8dd,x,y){
return m.multiply(m.translate(x,y),_8dd,m.translate(-x,-y));
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
},rotateAt:function(_8e4,a,b){
if(arguments.length>2){
return m._sandwich(m.rotate(_8e4),a,b);
}
return m._sandwich(m.rotate(_8e4),a.x,a.y);
},rotategAt:function(_8e7,a,b){
if(arguments.length>2){
return m._sandwich(m.rotateg(_8e7),a,b);
}
return m._sandwich(m.rotateg(_8e7),a.x,a.y);
},skewXAt:function(_8ea,a,b){
if(arguments.length>2){
return m._sandwich(m.skewX(_8ea),a,b);
}
return m._sandwich(m.skewX(_8ea),a.x,a.y);
},skewXgAt:function(_8ed,a,b){
if(arguments.length>2){
return m._sandwich(m.skewXg(_8ed),a,b);
}
return m._sandwich(m.skewXg(_8ed),a.x,a.y);
},skewYAt:function(_8f0,a,b){
if(arguments.length>2){
return m._sandwich(m.skewY(_8f0),a,b);
}
return m._sandwich(m.skewY(_8f0),a.x,a.y);
},skewYgAt:function(_8f3,a,b){
if(arguments.length>2){
return m._sandwich(m.skewYg(_8f3),a,b);
}
return m._sandwich(m.skewYg(_8f3),a.x,a.y);
}});
})();
dojox.gfx.Matrix2D=dojox.gfx.matrix.Matrix2D;
}
if(!dojo._hasResource["dojox.gfx._base"]){
dojo._hasResource["dojox.gfx._base"]=true;
dojo.provide("dojox.gfx._base");
(function(){
var g=dojox.gfx,b=g._base;
g._hasClass=function(node,_8f9){
return ((" "+node.getAttribute("className")+" ").indexOf(" "+_8f9+" ")>=0);
};
g._addClass=function(node,_8fb){
var cls=node.getAttribute("className");
if((" "+cls+" ").indexOf(" "+_8fb+" ")<0){
node.setAttribute("className",cls+(cls?" ":"")+_8fb);
}
};
g._removeClass=function(node,_8fe){
node.setAttribute("className",node.getAttribute("className").replace(new RegExp("(^|\\s+)"+_8fe+"(\\s+|$)"),"$1$2"));
};
b._getFontMeasurements=function(){
var _8ff={"1em":0,"1ex":0,"100%":0,"12pt":0,"16px":0,"xx-small":0,"x-small":0,"small":0,"medium":0,"large":0,"x-large":0,"xx-large":0};
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
for(var p in _8ff){
div.style.fontSize=p;
_8ff[p]=Math.round(div.offsetHeight*12/16)*16/12/1000;
}
dojo.body().removeChild(div);
div=null;
return _8ff;
};
var _902=null;
b._getCachedFontMeasurements=function(_903){
if(_903||!_902){
_902=b._getFontMeasurements();
}
return _902;
};
var _904=null,_905={};
b._getTextBox=function(text,_907,_908){
var m;
if(!_904){
m=_904=dojo.doc.createElement("div");
m.style.position="absolute";
m.style.left="-10000px";
m.style.top="0";
dojo.body().appendChild(m);
}else{
m=_904;
}
m.className="";
m.style.border="0";
m.style.margin="0";
m.style.padding="0";
m.style.outline="0";
if(arguments.length>1&&_907){
for(var i in _907){
if(i in _905){
continue;
}
m.style[i]=_907[i];
}
}
if(arguments.length>2&&_908){
m.className=_908;
}
m.innerHTML=text;
return dojo.marginBox(m);
};
var _90b=0;
b._getUniqueId=function(){
var id;
do{
id=dojo._scopeName+"Unique"+(++_90b);
}while(dojo.byId(id));
return id;
};
})();
dojo.mixin(dojox.gfx,{defaultPath:{type:"path",path:""},defaultPolyline:{type:"polyline",points:[]},defaultRect:{type:"rect",x:0,y:0,width:100,height:100,r:0},defaultEllipse:{type:"ellipse",cx:0,cy:0,rx:200,ry:100},defaultCircle:{type:"circle",cx:0,cy:0,r:100},defaultLine:{type:"line",x1:0,y1:0,x2:100,y2:100},defaultImage:{type:"image",x:0,y:0,width:0,height:0,src:""},defaultText:{type:"text",x:0,y:0,text:"",align:"start",decoration:"none",rotated:false,kerning:true},defaultTextPath:{type:"textpath",text:"",align:"start",decoration:"none",rotated:false,kerning:true},defaultStroke:{type:"stroke",color:"black",style:"solid",width:1,cap:"butt",join:4},defaultLinearGradient:{type:"linear",x1:0,y1:0,x2:100,y2:100,colors:[{offset:0,color:"black"},{offset:1,color:"white"}]},defaultRadialGradient:{type:"radial",cx:0,cy:0,r:100,colors:[{offset:0,color:"black"},{offset:1,color:"white"}]},defaultPattern:{type:"pattern",x:0,y:0,width:0,height:0,src:""},defaultFont:{type:"font",style:"normal",variant:"normal",weight:"normal",size:"10pt",family:"serif"},normalizeColor:function(_90d){
return (_90d instanceof dojo.Color)?_90d:new dojo.Color(_90d);
},normalizeParameters:function(_90e,_90f){
if(_90f){
var _910={};
for(var x in _90e){
if(x in _90f&&!(x in _910)){
_90e[x]=_90f[x];
}
}
}
return _90e;
},makeParameters:function(_912,_913){
if(!_913){
return dojo.clone(_912);
}
var _914={};
for(var i in _912){
if(!(i in _914)){
_914[i]=dojo.clone((i in _913)?_913[i]:_912[i]);
}
}
return _914;
},formatNumber:function(x,_917){
var val=x.toString();
if(val.indexOf("e")>=0){
val=x.toFixed(4);
}else{
var _919=val.indexOf(".");
if(_919>=0&&val.length-_919>5){
val=x.toFixed(4);
}
}
if(x<0){
return val;
}
return _917?" "+val:val;
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
var _923=dojox.gfx.px_in_pt();
var val=parseFloat(len);
switch(len.slice(-2)){
case "px":
return val;
case "pt":
return val*_923;
case "in":
return val*72*_923;
case "pc":
return val*12*_923;
case "mm":
return val/dojox.gfx.mm_in_pt*_923;
case "cm":
return val/dojox.gfx.cm_in_pt*_923;
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
(function(){
var _927=(typeof dojo.config["gfxRenderer"]=="string"?dojo.config["gfxRenderer"]:"svg,vml,silverlight,canvas").split(",");
for(var i=0;i<_927.length;++i){
switch(_927[i]){
case "svg":
if(!dojo.isIE&&(navigator.userAgent.indexOf("iPhone")<0)&&(navigator.userAgent.indexOf("iPod")<0)){
dojox.gfx.renderer="svg";
}
break;
case "vml":
if(dojo.isIE!=0){
dojox.gfx.renderer="vml";
}
break;
case "silverlight":
if(window.Silverlight){
dojox.gfx.renderer="silverlight";
}
break;
case "canvas":
if(dojo.isIE==0){
dojox.gfx.renderer="canvas";
}
break;
}
if(dojox.gfx.renderer){
break;
}
}
console.log("gfx renderer = "+dojox.gfx.renderer);
})();
dojo.requireIf(dojox.gfx.renderer=="svg","dojox.gfx.svg");
dojo.requireIf(dojox.gfx.renderer=="vml","dojox.gfx.vml");
dojo.requireIf(dojox.gfx.renderer=="silverlight","dojox.gfx.silverlight");
dojo.requireIf(dojox.gfx.renderer=="canvas","dojox.gfx.canvas");
}
if(!dojo._hasResource["dojox.grid._grid.lib"]){
dojo._hasResource["dojox.grid._grid.lib"]=true;
dojo.provide("dojox.grid._grid.lib");
dojo.mixin(dojox.grid,{na:"...",nop:function(){
},getTdIndex:function(td){
return td.cellIndex>=0?td.cellIndex:dojo.indexOf(td.parentNode.cells,td);
},getTrIndex:function(tr){
return tr.rowIndex>=0?tr.rowIndex:dojo.indexOf(tr.parentNode.childNodes,tr);
},getTr:function(_92b,_92c){
return _92b&&((_92b.rows||0)[_92c]||_92b.childNodes[_92c]);
},getTd:function(_92d,_92e,_92f){
return (dojox.grid.getTr(inTable,_92e)||0)[_92f];
},findTable:function(node){
for(var n=node;n&&n.tagName!="TABLE";n=n.parentNode){
}
return n;
},ascendDom:function(_932,_933){
for(var n=_932;n&&_933(n);n=n.parentNode){
}
return n;
},makeNotTagName:function(_935){
var name=_935.toUpperCase();
return function(node){
return node.tagName!=name;
};
},fire:function(ob,ev,args){
var fn=ob&&ev&&ob[ev];
return fn&&(args?fn.apply(ob,args):ob[ev]());
},setStyleText:function(_93c,_93d){
if(_93c.style.cssText==undefined){
_93c.setAttribute("style",_93d);
}else{
_93c.style.cssText=_93d;
}
},getStyleText:function(_93e,_93f){
return (_93e.style.cssText==undefined?_93e.getAttribute("style"):_93e.style.cssText);
},setStyle:function(_940,_941,_942){
if(_940&&_940.style[_941]!=_942){
_940.style[_941]=_942;
}
},setStyleHeightPx:function(_943,_944){
if(_944>=0){
dojox.grid.setStyle(_943,"height",_944+"px");
}
},mouseEvents:["mouseover","mouseout","mousedown","mouseup","click","dblclick","contextmenu"],keyEvents:["keyup","keydown","keypress"],funnelEvents:function(_945,_946,_947,_948){
var evts=(_948?_948:dojox.grid.mouseEvents.concat(dojox.grid.keyEvents));
for(var i=0,l=evts.length;i<l;i++){
dojo.connect(_945,"on"+evts[i],_946,_947);
}
},removeNode:function(_94c){
_94c=dojo.byId(_94c);
_94c&&_94c.parentNode&&_94c.parentNode.removeChild(_94c);
return _94c;
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
},getRef:function(name,_94f,_950){
var obj=_950||dojo.global,_952=name.split("."),prop=_952.pop();
for(var i=0,p;obj&&(p=_952[i]);i++){
obj=(p in obj?obj[p]:(_94f?obj[p]={}:undefined));
}
return {obj:obj,prop:prop};
},getProp:function(name,_957,_958){
with(dojox.grid.getRef(name,_957,_958)){
return (obj)&&(prop)&&(prop in obj?obj[prop]:(_957?obj[prop]={}:undefined));
}
},indexInParent:function(_959){
var i=0,n,p=_959.parentNode;
while((n=p.childNodes[i++])){
if(n==_959){
return i-1;
}
}
return -1;
},cleanNode:function(_95d){
if(!_95d){
return;
}
var _95e=function(inW){
return inW.domNode&&dojo.isDescendant(inW.domNode,_95d,true);
};
var ws=dijit.registry.filter(_95e);
for(var i=0,w;(w=ws[i]);i++){
w.destroy();
}
delete ws;
},getTagName:function(_963){
var node=dojo.byId(_963);
return (node&&node.tagName?node.tagName.toLowerCase():"");
},nodeKids:function(_965,_966){
var _967=[];
var i=0,n;
while((n=_965.childNodes[i++])){
if(dojox.grid.getTagName(n)==_966){
_967.push(n);
}
}
return _967;
},divkids:function(_96a){
return dojox.grid.nodeKids(_96a,"div");
},focusSelectNode:function(_96b){
try{
dojox.grid.fire(_96b,"focus");
dojox.grid.fire(_96b,"select");
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
},arrayInsert:function(_970,_971,_972){
if(_970.length<=_971){
_970[_971]=_972;
}else{
_970.splice(_971,0,_972);
}
},arrayRemove:function(_973,_974){
_973.splice(_974,1);
},arraySwap:function(_975,inI,inJ){
var _978=_975[inI];
_975[inI]=_975[inJ];
_975[inJ]=_978;
},initTextSizePoll:function(_979){
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
window.setInterval(job,_979||200);
dojox.grid.initTextSizePoll=dojox.grid.nop;
},textSizeChanged:function(){
}});
dojox.grid.jobs={cancel:function(_97d){
if(_97d){
window.clearTimeout(_97d);
}
},jobs:[],job:function(_97e,_97f,_980){
dojox.grid.jobs.cancelJob(_97e);
var job=function(){
delete dojox.grid.jobs.jobs[_97e];
_980();
};
dojox.grid.jobs.jobs[_97e]=setTimeout(job,_97f);
},cancelJob:function(_982){
dojox.grid.jobs.cancel(dojox.grid.jobs.jobs[_982]);
}};
}
if(!dojo._hasResource["dojox.grid._grid.scroller"]){
dojo._hasResource["dojox.grid._grid.scroller"]=true;
dojo.provide("dojox.grid._grid.scroller");
dojo.declare("dojox.grid.scroller.base",null,{constructor:function(){
this.pageHeights=[];
this.stack=[];
},rowCount:0,defaultRowHeight:10,keepRows:100,contentNode:null,scrollboxNode:null,defaultPageHeight:0,keepPages:10,pageCount:0,windowHeight:0,firstVisibleRow:0,lastVisibleRow:0,page:0,pageTop:0,init:function(_983,_984,_985){
switch(arguments.length){
case 3:
this.rowsPerPage=_985;
case 2:
this.keepRows=_984;
case 1:
this.rowCount=_983;
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
},setKeepInfo:function(_986){
this.keepRows=_986;
this.keepPages=!this.keepRows?this.keepRows:Math.max(Math.ceil(this.keepRows/this.rowsPerPage),2);
},invalidate:function(){
this.invalidateNodes();
this.pageHeights=[];
this.height=(this.pageCount?(this.pageCount-1)*this.defaultPageHeight+this.calcLastPageHeight():0);
this.resize();
},updateRowCount:function(_987){
this.invalidateNodes();
this.rowCount=_987;
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
},pageExists:function(_989){
},measurePage:function(_98a){
},positionPage:function(_98b,_98c){
},repositionPages:function(_98d){
},installPage:function(_98e){
},preparePage:function(_98f,_990,_991){
},renderPage:function(_992){
},removePage:function(_993){
},pacify:function(_994){
},pacifying:false,pacifyTicks:200,setPacifying:function(_995){
if(this.pacifying!=_995){
this.pacifying=_995;
this.pacify(this.pacifying);
}
},startPacify:function(){
this.startPacifyTicks=new Date().getTime();
},doPacify:function(){
var _996=(new Date().getTime()-this.startPacifyTicks)>this.pacifyTicks;
this.setPacifying(true);
this.startPacify();
return _996;
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
var _997=this.pageCount-1;
var _998=((this.rowCount%this.rowsPerPage)||(this.rowsPerPage))*this.defaultRowHeight;
this.pageHeights[_997]=_998;
return _998;
},updateContentHeight:function(inDh){
this.height+=inDh;
this.resize();
},updatePageHeight:function(_99a){
if(this.pageExists(_99a)){
var oh=this.getPageHeight(_99a);
var h=(this.measurePage(_99a))||(oh);
this.pageHeights[_99a]=h;
if((h)&&(oh!=h)){
this.updateContentHeight(h-oh);
this.repositionPages(_99a);
}
}
},rowHeightChanged:function(_99d){
this.updatePageHeight(Math.floor(_99d/this.rowsPerPage));
},invalidateNodes:function(){
while(this.stack.length){
this.destroyPage(this.popPage());
}
},createPageNode:function(){
var p=document.createElement("div");
p.style.position="absolute";
p.style[dojo._isBodyLtr()?"left":"right"]="0";
return p;
},getPageHeight:function(_99f){
var ph=this.pageHeights[_99f];
return (ph!==undefined?ph:this.defaultPageHeight);
},pushPage:function(_9a1){
return this.stack.push(_9a1);
},popPage:function(){
return this.stack.shift();
},findPage:function(_9a2){
var i=0,h=0;
for(var ph=0;i<this.pageCount;i++,h+=ph){
ph=this.getPageHeight(i);
if(h+ph>=_9a2){
break;
}
}
this.page=i;
this.pageTop=h;
},buildPage:function(_9a6,_9a7,_9a8){
this.preparePage(_9a6,_9a7);
this.positionPage(_9a6,_9a8);
this.installPage(_9a6);
this.renderPage(_9a6);
this.pushPage(_9a6);
},needPage:function(_9a9,_9aa){
var h=this.getPageHeight(_9a9),oh=h;
if(!this.pageExists(_9a9)){
this.buildPage(_9a9,this.keepPages&&(this.stack.length>=this.keepPages),_9aa);
h=this.measurePage(_9a9)||h;
this.pageHeights[_9a9]=h;
if(h&&(oh!=h)){
this.updateContentHeight(h-oh);
}
}else{
this.positionPage(_9a9,_9aa);
}
return h;
},onscroll:function(){
this.scroll(this.scrollboxNode.scrollTop);
},scroll:function(_9ad){
this.startPacify();
this.findPage(_9ad);
var h=this.height;
var b=this.getScrollBottom(_9ad);
for(var p=this.page,y=this.pageTop;(p<this.pageCount)&&((b<0)||(y<b));p++){
y+=this.needPage(p,y);
}
this.firstVisibleRow=this.getFirstVisibleRow(this.page,this.pageTop,_9ad);
this.lastVisibleRow=this.getLastVisibleRow(p-1,y,b);
if(h!=this.height){
this.repositionPages(p-1);
}
this.endPacify();
},getScrollBottom:function(_9b2){
return (this.windowHeight>=0?_9b2+this.windowHeight:-1);
},processNodeEvent:function(e,_9b4){
var t=e.target;
while(t&&(t!=_9b4)&&t.parentNode&&(t.parentNode.parentNode!=_9b4)){
t=t.parentNode;
}
if(!t||!t.parentNode||(t.parentNode.parentNode!=_9b4)){
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
},renderRow:function(_9b8,_9b9){
},removeRow:function(_9ba){
},getDefaultNodes:function(){
return this.pageNodes;
},getDefaultPageNode:function(_9bb){
return this.getDefaultNodes()[_9bb];
},positionPageNode:function(_9bc,_9bd){
_9bc.style.top=_9bd+"px";
},getPageNodePosition:function(_9be){
return _9be.offsetTop;
},repositionPageNodes:function(_9bf,_9c0){
var last=0;
for(var i=0;i<this.stack.length;i++){
last=Math.max(this.stack[i],last);
}
var n=_9c0[_9bf];
var y=(n?this.getPageNodePosition(n)+this.getPageHeight(_9bf):0);
for(var p=_9bf+1;p<=last;p++){
n=_9c0[p];
if(n){
if(this.getPageNodePosition(n)==y){
return;
}
this.positionPage(p,y);
}
y+=this.getPageHeight(p);
}
},invalidatePageNode:function(_9c6,_9c7){
var p=_9c7[_9c6];
if(p){
delete _9c7[_9c6];
this.removePage(_9c6,p);
dojox.grid.cleanNode(p);
p.innerHTML="";
}
return p;
},preparePageNode:function(_9c9,_9ca,_9cb){
var p=(_9ca===null?this.createPageNode():this.invalidatePageNode(_9ca,_9cb));
p.pageIndex=_9c9;
p.id=(this._pageIdPrefix||"")+"page-"+_9c9;
_9cb[_9c9]=p;
},pageExists:function(_9cd){
return Boolean(this.getDefaultPageNode(_9cd));
},measurePage:function(_9ce){
return this.getDefaultPageNode(_9ce).offsetHeight;
},positionPage:function(_9cf,_9d0){
this.positionPageNode(this.getDefaultPageNode(_9cf),_9d0);
},repositionPages:function(_9d1){
this.repositionPageNodes(_9d1,this.getDefaultNodes());
},preparePage:function(_9d2,_9d3){
this.preparePageNode(_9d2,(_9d3?this.popPage():null),this.getDefaultNodes());
},installPage:function(_9d4){
this.contentNode.appendChild(this.getDefaultPageNode(_9d4));
},destroyPage:function(_9d5){
var p=this.invalidatePageNode(_9d5,this.getDefaultNodes());
dojox.grid.removeNode(p);
},renderPage:function(_9d7){
var node=this.pageNodes[_9d7];
for(var i=0,j=_9d7*this.rowsPerPage;(i<this.rowsPerPage)&&(j<this.rowCount);i++,j++){
this.renderRow(j,node);
}
},removePage:function(_9db){
for(var i=0,j=_9db*this.rowsPerPage;i<this.rowsPerPage;i++,j++){
this.removeRow(j);
}
},getPageRow:function(_9de){
return _9de*this.rowsPerPage;
},getLastPageRow:function(_9df){
return Math.min(this.rowCount,this.getPageRow(_9df+1))-1;
},getFirstVisibleRowNodes:function(_9e0,_9e1,_9e2,_9e3){
var row=this.getPageRow(_9e0);
var rows=dojox.grid.divkids(_9e3[_9e0]);
for(var i=0,l=rows.length;i<l&&_9e1<_9e2;i++,row++){
_9e1+=rows[i].offsetHeight;
}
return (row?row-1:row);
},getFirstVisibleRow:function(_9e8,_9e9,_9ea){
if(!this.pageExists(_9e8)){
return 0;
}
return this.getFirstVisibleRowNodes(_9e8,_9e9,_9ea,this.getDefaultNodes());
},getLastVisibleRowNodes:function(_9eb,_9ec,_9ed,_9ee){
var row=this.getLastPageRow(_9eb);
var rows=dojox.grid.divkids(_9ee[_9eb]);
for(var i=rows.length-1;i>=0&&_9ec>_9ed;i--,row--){
_9ec-=rows[i].offsetHeight;
}
return row+1;
},getLastVisibleRow:function(_9f2,_9f3,_9f4){
if(!this.pageExists(_9f2)){
return 0;
}
return this.getLastVisibleRowNodes(_9f2,_9f3,_9f4,this.getDefaultNodes());
},findTopRowForNodes:function(_9f5,_9f6){
var rows=dojox.grid.divkids(_9f6[this.page]);
for(var i=0,l=rows.length,t=this.pageTop,h;i<l;i++){
h=rows[i].offsetHeight;
t+=h;
if(t>=_9f5){
this.offset=h-(t-_9f5);
return i+this.page*this.rowsPerPage;
}
}
return -1;
},findScrollTopForNodes:function(_9fc,_9fd){
var _9fe=Math.floor(_9fc/this.rowsPerPage);
var t=0;
for(var i=0;i<_9fe;i++){
t+=this.getPageHeight(i);
}
this.pageTop=t;
this.needPage(_9fe,this.pageTop);
var rows=dojox.grid.divkids(_9fd[_9fe]);
var r=_9fc-this.rowsPerPage*_9fe;
for(var i=0,l=rows.length;i<l&&i<r;i++){
t+=rows[i].offsetHeight;
}
return t;
},findTopRow:function(_a04){
return this.findTopRowForNodes(_a04,this.getDefaultNodes());
},findScrollTop:function(_a05){
return this.findScrollTopForNodes(_a05,this.getDefaultNodes());
},dummy:0});
dojo.declare("dojox.grid.scroller.columns",dojox.grid.scroller,{constructor:function(_a06){
this.setContentNodes(_a06);
},setContentNodes:function(_a07){
this.contentNodes=_a07;
this.colCount=(this.contentNodes?this.contentNodes.length:0);
this.pageNodes=[];
for(var i=0;i<this.colCount;i++){
this.pageNodes[i]=[];
}
},getDefaultNodes:function(){
return this.pageNodes[0]||[];
},scroll:function(_a09){
if(this.colCount){
dojox.grid.scroller.prototype.scroll.call(this,_a09);
}
},resize:function(){
if(this.scrollboxNode){
this.windowHeight=this.scrollboxNode.clientHeight;
}
for(var i=0;i<this.colCount;i++){
dojox.grid.setStyleHeightPx(this.contentNodes[i],this.height);
}
},positionPage:function(_a0b,_a0c){
for(var i=0;i<this.colCount;i++){
this.positionPageNode(this.pageNodes[i][_a0b],_a0c);
}
},preparePage:function(_a0e,_a0f){
var p=(_a0f?this.popPage():null);
for(var i=0;i<this.colCount;i++){
this.preparePageNode(_a0e,p,this.pageNodes[i]);
}
},installPage:function(_a12){
for(var i=0;i<this.colCount;i++){
this.contentNodes[i].appendChild(this.pageNodes[i][_a12]);
}
},destroyPage:function(_a14){
for(var i=0;i<this.colCount;i++){
dojox.grid.removeNode(this.invalidatePageNode(_a14,this.pageNodes[i]));
}
},renderPage:function(_a16){
var _a17=[];
for(var i=0;i<this.colCount;i++){
_a17[i]=this.pageNodes[i][_a16];
}
for(var i=0,j=_a16*this.rowsPerPage;(i<this.rowsPerPage)&&(j<this.rowCount);i++,j++){
this.renderRow(j,_a17);
}
}});
}
if(!dojo._hasResource["dojox.grid._grid.drag"]){
dojo._hasResource["dojox.grid._grid.drag"]=true;
dojo.provide("dojox.grid._grid.drag");
(function(){
var _a1a=dojox.grid.drag={};
_a1a.dragging=false;
_a1a.hysteresis=2;
_a1a.capture=function(_a1b){
if(_a1b.setCapture){
_a1b.setCapture();
}else{
document.addEventListener("mousemove",_a1b.onmousemove,true);
document.addEventListener("mouseup",_a1b.onmouseup,true);
document.addEventListener("click",_a1b.onclick,true);
}
};
_a1a.release=function(_a1c){
if(_a1c.releaseCapture){
_a1c.releaseCapture();
}else{
document.removeEventListener("click",_a1c.onclick,true);
document.removeEventListener("mouseup",_a1c.onmouseup,true);
document.removeEventListener("mousemove",_a1c.onmousemove,true);
}
};
_a1a.start=function(_a1d,_a1e,_a1f,_a20,_a21){
if(!_a1d||_a1a.dragging){
console.debug("failed to start drag: bad input node or already dragging");
return;
}
_a1a.dragging=true;
_a1a.elt=_a1d;
_a1a.events={drag:_a1e||dojox.grid.nop,end:_a1f||dojox.grid.nop,start:_a21||dojox.grid.nop,oldmove:_a1d.onmousemove,oldup:_a1d.onmouseup,oldclick:_a1d.onclick};
_a1a.positionX=(_a20&&("screenX" in _a20)?_a20.screenX:false);
_a1a.positionY=(_a20&&("screenY" in _a20)?_a20.screenY:false);
_a1a.started=(_a1a.position===false);
_a1d.onmousemove=_a1a.mousemove;
_a1d.onmouseup=_a1a.mouseup;
_a1d.onclick=_a1a.click;
_a1a.capture(_a1a.elt);
};
_a1a.end=function(){
_a1a.release(_a1a.elt);
_a1a.elt.onmousemove=_a1a.events.oldmove;
_a1a.elt.onmouseup=_a1a.events.oldup;
_a1a.elt.onclick=_a1a.events.oldclick;
_a1a.elt=null;
try{
if(_a1a.started){
_a1a.events.end();
}
}
finally{
_a1a.dragging=false;
}
};
_a1a.calcDelta=function(_a22){
_a22.deltaX=_a22.screenX-_a1a.positionX;
_a22.deltaY=_a22.screenY-_a1a.positionY;
};
_a1a.hasMoved=function(_a23){
return Math.abs(_a23.deltaX)+Math.abs(_a23.deltaY)>_a1a.hysteresis;
};
_a1a.mousemove=function(_a24){
_a24=dojo.fixEvent(_a24);
dojo.stopEvent(_a24);
_a1a.calcDelta(_a24);
if((!_a1a.started)&&(_a1a.hasMoved(_a24))){
_a1a.events.start(_a24);
_a1a.started=true;
}
if(_a1a.started){
_a1a.events.drag(_a24);
}
};
_a1a.mouseup=function(_a25){
dojo.stopEvent(dojo.fixEvent(_a25));
_a1a.end();
};
_a1a.click=function(_a26){
dojo.stopEvent(dojo.fixEvent(_a26));
};
})();
}
if(!dojo._hasResource["dojox.grid._grid.builder"]){
dojo._hasResource["dojox.grid._grid.builder"]=true;
dojo.provide("dojox.grid._grid.builder");
dojo.declare("dojox.grid.Builder",null,{constructor:function(_a27){
this.view=_a27;
this.grid=_a27.grid;
},view:null,_table:"<table class=\"dojoxGrid-row-table\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"wairole:presentation\">",generateCellMarkup:function(_a28,_a29,_a2a,_a2b){
var _a2c=[],html;
if(_a2b){
html=["<th tabIndex=\"-1\" role=\"wairole:columnheader\""];
}else{
html=["<td tabIndex=\"-1\" role=\"wairole:gridcell\""];
}
_a28.colSpan&&html.push(" colspan=\"",_a28.colSpan,"\"");
_a28.rowSpan&&html.push(" rowspan=\"",_a28.rowSpan,"\"");
html.push(" class=\"dojoxGrid-cell ");
_a28.classes&&html.push(_a28.classes," ");
_a2a&&html.push(_a2a," ");
_a2c.push(html.join(""));
_a2c.push("");
html=["\" idx=\"",_a28.index,"\" style=\""];
html.push(_a28.styles,_a29||"");
_a28.unitWidth&&html.push("width:",_a28.unitWidth,";");
_a2c.push(html.join(""));
_a2c.push("");
html=["\""];
_a28.attrs&&html.push(" ",_a28.attrs);
html.push(">");
_a2c.push(html.join(""));
_a2c.push("");
_a2c.push("</td>");
return _a2c;
},isCellNode:function(_a2e){
return Boolean(_a2e&&_a2e.getAttribute&&_a2e.getAttribute("idx"));
},getCellNodeIndex:function(_a2f){
return _a2f?Number(_a2f.getAttribute("idx")):-1;
},getCellNode:function(_a30,_a31){
for(var i=0,row;row=dojox.grid.getTr(_a30.firstChild,i);i++){
for(var j=0,cell;cell=row.cells[j];j++){
if(this.getCellNodeIndex(cell)==_a31){
return cell;
}
}
}
},findCellTarget:function(_a36,_a37){
var n=_a36;
while(n&&(!this.isCellNode(n)||(dojox.grid.gridViewTag in n.offsetParent.parentNode&&n.offsetParent.parentNode[dojox.grid.gridViewTag]!=this.view.id))&&(n!=_a37)){
n=n.parentNode;
}
return n!=_a37?n:null;
},baseDecorateEvent:function(e){
e.dispatch="do"+e.type;
e.grid=this.grid;
e.sourceView=this.view;
e.cellNode=this.findCellTarget(e.target,e.rowNode);
e.cellIndex=this.getCellNodeIndex(e.cellNode);
e.cell=(e.cellIndex>=0?this.grid.getCell(e.cellIndex):null);
},findTarget:function(_a3a,_a3b){
var n=_a3a;
while(n&&(n!=this.domNode)&&(!(_a3b in n)||(dojox.grid.gridViewTag in n&&n[dojox.grid.gridViewTag]!=this.view.id))){
n=n.parentNode;
}
return (n!=this.domNode)?n:null;
},findRowTarget:function(_a3d){
return this.findTarget(_a3d,dojox.grid.rowIndexTag);
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
var _a45=this.grid.get,rows=this.view.structure.rows;
for(var j=0,row;(row=rows[j]);j++){
for(var i=0,cell;(cell=row[i]);i++){
cell.get=cell.get||(cell.value==undefined)&&_a45;
cell.markup=this.generateCellMarkup(cell,cell.cellStyles,cell.cellClasses,false);
}
}
},generateHtml:function(_a4b,_a4c){
var html=[this._table],v=this.view,obr=v.onBeforeRow,rows=v.structure.rows;
obr&&obr(_a4c,rows);
for(var j=0,row;(row=rows[j]);j++){
if(row.hidden||row.header){
continue;
}
html.push(!row.invisible?"<tr>":"<tr class=\"dojoxGrid-invisible\">");
for(var i=0,cell,m,cc,cs;(cell=row[i]);i++){
m=cell.markup,cc=cell.customClasses=[],cs=cell.customStyles=[];
m[5]=cell.format(_a4b);
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
},generateHtml:function(_a59,_a5a){
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
for(var i=0,cell,_a61;(cell=row[i]);i++){
cell.customClasses=[];
cell.customStyles=[];
_a61=this.generateCellMarkup(cell,cell.headerStyles,cell.headerClasses,true);
_a61[5]=(_a5a!=undefined?_a5a:_a59(cell));
_a61[3]=cell.customStyles.join(";");
_a61[1]=cell.customClasses.join(" ");
html.push(_a61.join(""));
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
var _a73=[],_a74=this.tableMap.findOverlappingNodes(e.cellNode);
for(var i=0,cell;(cell=_a74[i]);i++){
_a73.push({node:cell,index:this.getCellNodeIndex(cell),width:cell.offsetWidth});
}
var drag={scrollLeft:e.sourceView.headerNode.scrollLeft,view:e.sourceView,node:e.cellNode,index:e.cellIndex,w:e.cellNode.clientWidth,spanners:_a73};
dojox.grid.drag.start(e.cellNode,dojo.hitch(this,"doResizeColumn",drag),dojo.hitch(this,"endResizeColumn",drag),e);
},doResizeColumn:function(_a78,_a79){
var _a7a=dojo._isBodyLtr();
if(_a7a){
var w=_a78.w+_a79.deltaX;
}else{
var w=_a78.w-_a79.deltaX;
}
if(w>=this.minColWidth){
for(var i=0,s,sw;(s=_a78.spanners[i]);i++){
if(_a7a){
sw=s.width+_a79.deltaX;
}else{
sw=s.width-_a79.deltaX;
}
s.node.style.width=sw+"px";
_a78.view.setColWidth(s.index,sw);
}
_a78.node.style.width=w+"px";
_a78.view.setColWidth(_a78.index,w);
if(!_a7a){
_a78.view.headerNode.scrollLeft=(_a78.scrollLeft-_a79.deltaX);
}
}
if(_a78.view.flexCells&&!_a78.view.testFlexCells()){
var t=dojox.grid.findTable(_a78.node);
t&&(t.style.width="");
}
},endResizeColumn:function(_a80){
this.bogusClickTime=new Date().getTime()+30;
setTimeout(dojo.hitch(_a80.view,"update"),50);
}});
dojo.declare("dojox.grid.tableMap",null,{constructor:function(_a81){
this.mapRows(_a81);
},map:null,mapRows:function(_a82){
var _a83=_a82.length;
if(!_a83){
return;
}
this.map=[];
for(var j=0,row;(row=_a82[j]);j++){
this.map[j]=[];
}
for(var j=0,row;(row=_a82[j]);j++){
for(var i=0,x=0,cell,_a89,_a8a;(cell=row[i]);i++){
while(this.map[j][x]){
x++;
}
this.map[j][x]={c:i,r:j};
_a8a=cell.rowSpan||1;
_a89=cell.colSpan||1;
for(var y=0;y<_a8a;y++){
for(var s=0;s<_a89;s++){
this.map[j+y][x+s]=this.map[j][x];
}
}
x+=_a89;
}
}
},dumpMap:function(){
for(var j=0,row,h="";(row=this.map[j]);j++,h=""){
for(var i=0,cell;(cell=row[i]);i++){
h+=cell.r+","+cell.c+"   ";
}
console.log(h);
}
},getMapCoords:function(_a92,_a93){
for(var j=0,row;(row=this.map[j]);j++){
for(var i=0,cell;(cell=row[i]);i++){
if(cell.c==_a93&&cell.r==_a92){
return {j:j,i:i};
}
}
}
return {j:-1,i:-1};
},getNode:function(_a98,_a99,_a9a){
var row=_a98&&_a98.rows[_a99];
return row&&row.cells[_a9a];
},_findOverlappingNodes:function(_a9c,_a9d,_a9e){
var _a9f=[];
var m=this.getMapCoords(_a9d,_a9e);
var row=this.map[m.j];
for(var j=0,row;(row=this.map[j]);j++){
if(j==m.j){
continue;
}
with(row[m.i]){
var n=this.getNode(_a9c,r,c);
if(n){
_a9f.push(n);
}
}
}
return _a9f;
},findOverlappingNodes:function(_aa4){
return this._findOverlappingNodes(dojox.grid.findTable(_aa4),dojox.grid.getTrIndex(_aa4.parentNode),dojox.grid.getTdIndex(_aa4));
}});
dojox.grid.rowIndexTag="gridRowIndex";
dojox.grid.gridViewTag="gridView";
}
if(!dojo._hasResource["dojox.grid._grid.view"]){
dojo._hasResource["dojox.grid._grid.view"]=true;
dojo.provide("dojox.grid._grid.view");
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
},setStructure:function(_aa5){
var vs=this.structure=_aa5;
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
},_getHeaderContent:function(_aab){
var n=_aab.name||_aab.grid.getCellName(_aab);
if(_aab.index!=_aab.grid.getSortIndex()){
return n;
}
return ["<div class=\"",_aab.grid.sortInfo>0?"dojoxGrid-sort-down":"dojoxGrid-sort-up","\"><div class=\"gridArrowButtonChar\">",_aab.grid.sortInfo>0?"&#9660;":"&#9650;","</div>",n,"</div>"].join("");
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
},renderRow:function(_ab1,_ab2){
var _ab3=this.createRowNode(_ab1);
this.buildRow(_ab1,_ab3,_ab2);
this.grid.edit.restore(this,_ab1);
return _ab3;
},createRowNode:function(_ab4){
var node=document.createElement("div");
node.className=this.classTag+"-row";
node[dojox.grid.gridViewTag]=this.id;
node[dojox.grid.rowIndexTag]=_ab4;
this.rowNodes[_ab4]=node;
return node;
},buildRow:function(_ab6,_ab7){
this.buildRowContent(_ab6,_ab7);
this.styleRow(_ab6,_ab7);
},buildRowContent:function(_ab8,_ab9){
_ab9.innerHTML=this.content.generateHtml(_ab8,_ab8);
if(this.flexCells){
_ab9.firstChild.style.width=this.contentWidth;
}
},rowRemoved:function(_aba){
this.grid.edit.save(this,_aba);
delete this.rowNodes[_aba];
},getRowNode:function(_abb){
return this.rowNodes[_abb];
},getCellNode:function(_abc,_abd){
var row=this.getRowNode(_abc);
if(row){
return this.content.getCellNode(row,_abd);
}
},styleRow:function(_abf,_ac0){
_ac0._style=dojox.grid.getStyleText(_ac0);
this.styleRowNode(_abf,_ac0);
},styleRowNode:function(_ac1,_ac2){
if(_ac2){
this.doStyleRowNode(_ac1,_ac2);
}
},doStyleRowNode:function(_ac3,_ac4){
this.grid.styleRowNode(_ac3,_ac4);
},updateRow:function(_ac5,_ac6,_ac7){
var _ac8=this.getRowNode(_ac5);
if(_ac8){
_ac8.style.height="";
this.buildRow(_ac5,_ac8);
}
return _ac8;
},updateRowStyles:function(_ac9){
this.styleRowNode(_ac9,this.getRowNode(_ac9));
},lastTop:0,firstScroll:0,doscroll:function(_aca){
var _acb=dojo._isBodyLtr();
if(this.firstScroll<2){
if((!_acb&&this.firstScroll==1)||(_acb&&this.firstScroll==0)){
var s=dojo.marginBox(this.headerNodeContainer);
if(dojo.isIE){
this.headerNodeContainer.style.width=s.w+this.getScrollbarWidth()+"px";
}else{
if(dojo.isMoz){
this.headerNodeContainer.style.width=s.w-this.getScrollbarWidth()+"px";
if(_acb){
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
},setScrollTop:function(_ace){
this.lastTop=_ace;
this.scrollboxNode.scrollTop=_ace;
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
},setColWidth:function(_ad3,_ad4){
this.grid.setCellWidth(_ad3,_ad4+"px");
},update:function(){
var left=this.scrollboxNode.scrollLeft;
this.content.update();
this.grid.update();
this.scrollboxNode.scrollLeft=left;
this.headerNode.scrollLeft=left;
}});
}
if(!dojo._hasResource["dojox.grid._grid.views"]){
dojo._hasResource["dojox.grid._grid.views"]=true;
dojo.provide("dojox.grid._grid.views");
dojo.declare("dojox.grid.views",null,{constructor:function(_ad6){
this.grid=_ad6;
},defaultWidth:200,views:[],resize:function(){
this.onEach("resize");
},render:function(){
this.onEach("render");
},addView:function(_ad7){
_ad7.idx=this.views.length;
this.views.push(_ad7);
},destroyViews:function(){
for(var i=0,v;v=this.views[i];i++){
v.destroy();
}
this.views=[];
},getContentNodes:function(){
var _ada=[];
for(var i=0,v;v=this.views[i];i++){
_ada.push(v.contentNode);
}
return _ada;
},forEach:function(_add){
for(var i=0,v;v=this.views[i];i++){
_add(v,i);
}
},onEach:function(_ae0,_ae1){
_ae1=_ae1||[];
for(var i=0,v;v=this.views[i];i++){
if(_ae0 in v){
v[_ae0].apply(v,_ae1);
}
}
},normalizeHeaderNodeHeight:function(){
var _ae4=[];
for(var i=0,v;(v=this.views[i]);i++){
if(v.headerContentNode.firstChild){
_ae4.push(v.headerContentNode);
}
}
this.normalizeRowNodeHeights(_ae4);
},normalizeRowNodeHeights:function(_ae7){
var h=0;
for(var i=0,n,o;(n=_ae7[i]);i++){
h=Math.max(h,(n.firstChild.clientHeight)||(n.firstChild.offsetHeight));
}
h=(h>=0?h:0);
var hpx=h+"px";
for(var i=0,n;(n=_ae7[i]);i++){
if(n.firstChild.clientHeight!=h){
n.firstChild.style.height=hpx;
}
}
if(_ae7&&_ae7[0]){
_ae7[0].parentNode.offsetHeight;
}
},resetHeaderNodeHeight:function(){
for(var i=0,v,n;(v=this.views[i]);i++){
n=v.headerContentNode.firstChild;
if(n){
n.style.height="";
}
}
},renormalizeRow:function(_af0){
var _af1=[];
for(var i=0,v,n;(v=this.views[i])&&(n=v.getRowNode(_af0));i++){
n.firstChild.style.height="";
_af1.push(n);
}
this.normalizeRowNodeHeights(_af1);
},getViewWidth:function(_af5){
return this.views[_af5].getWidth()||this.defaultWidth;
},measureHeader:function(){
this.resetHeaderNodeHeight();
this.forEach(function(_af6){
_af6.headerContentNode.style.height="";
});
var h=0;
this.forEach(function(_af8){
h=Math.max(_af8.headerNode.offsetHeight,h);
});
return h;
},measureContent:function(){
var h=0;
this.forEach(function(_afa){
h=Math.max(_afa.domNode.offsetHeight,h);
});
return h;
},findClient:function(_afb){
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
var _b06=function(v,l){
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
_b06(v,l);
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
_b06(v,r);
}
if(c<len){
v=this.views[c];
vw=Math.max(1,r-l);
v.setSize(vw+"px",0);
_b06(v,l);
}
return l;
},renderRow:function(_b0b,_b0c){
var _b0d=[];
for(var i=0,v,n,_b11;(v=this.views[i])&&(n=_b0c[i]);i++){
_b11=v.renderRow(_b0b);
n.appendChild(_b11);
_b0d.push(_b11);
}
this.normalizeRowNodeHeights(_b0d);
},rowRemoved:function(_b12){
this.onEach("rowRemoved",[_b12]);
},updateRow:function(_b13,_b14){
for(var i=0,v;v=this.views[i];i++){
v.updateRow(_b13,_b14);
}
this.renormalizeRow(_b13);
},updateRowStyles:function(_b17){
this.onEach("updateRowStyles",[_b17]);
},setScrollTop:function(_b18){
var top=_b18;
for(var i=0,v;v=this.views[i];i++){
top=v.setScrollTop(_b18);
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
if(!dojo._hasResource["dojox.grid._grid.cell"]){
dojo._hasResource["dojox.grid._grid.cell"]=true;
dojo.provide("dojox.grid._grid.cell");
dojo.declare("dojox.grid.cell",null,{styles:"",constructor:function(_b1e){
dojo.mixin(this,_b1e);
if(this.editor){
this.editor=new this.editor(this);
}
},format:function(_b1f){
var f,i=this.grid.edit.info,d=this.get?this.get(_b1f):this.value;
if(this.editor&&(this.editor.alwaysOn||(i.rowIndex==_b1f&&i.cell==this))){
return this.editor.format(d,_b1f);
}else{
return (f=this.formatter)?f.call(this,d,_b1f):d;
}
},getNode:function(_b23){
return this.view.getCellNode(_b23,this.index);
},isFlex:function(){
var uw=this.unitWidth;
return uw&&(uw=="auto"||uw.slice(-1)=="%");
},applyEdit:function(_b25,_b26){
this.grid.edit.applyCellEdit(_b25,this,_b26);
},cancelEdit:function(_b27){
this.grid.doCancelEdit(_b27);
},_onEditBlur:function(_b28){
if(this.grid.edit.isEditCell(_b28,this.index)){
this.grid.edit.apply();
}
},registerOnBlur:function(_b29,_b2a){
if(this.commitOnBlur){
dojo.connect(_b29,"onblur",function(e){
setTimeout(dojo.hitch(this,"_onEditBlur",_b2a),250);
});
}
}});
}
if(!dojo._hasResource["dojox.grid._grid.layout"]){
dojo._hasResource["dojox.grid._grid.layout"]=true;
dojo.provide("dojox.grid._grid.layout");
dojo.declare("dojox.grid.layout",null,{constructor:function(_b2c){
this.grid=_b2c;
},cells:[],structure:null,defaultWidth:"6em",setStructure:function(_b2d){
this.fieldIndex=0;
this.cells=[];
var s=this.structure=[];
for(var i=0,_b30,rows;(_b30=_b2d[i]);i++){
s.push(this.addViewDef(_b30));
}
this.cellCount=this.cells.length;
},addViewDef:function(_b32){
this._defaultCellProps=_b32.defaultCell||{};
return dojo.mixin({},_b32,{rows:this.addRowsDef(_b32.rows||_b32.cells)});
},addRowsDef:function(_b33){
var _b34=[];
for(var i=0,row;_b33&&(row=_b33[i]);i++){
_b34.push(this.addRowDef(i,row));
}
return _b34;
},addRowDef:function(_b37,_b38){
var _b39=[];
for(var i=0,def,cell;(def=_b38[i]);i++){
cell=this.addCellDef(_b37,i,def);
_b39.push(cell);
this.cells.push(cell);
}
return _b39;
},addCellDef:function(_b3d,_b3e,_b3f){
var w=0;
if(_b3f.colSpan>1){
w=0;
}else{
if(!isNaN(_b3f.width)){
w=_b3f.width+"em";
}else{
w=_b3f.width||this.defaultWidth;
}
}
var _b41=_b3f.field!=undefined?_b3f.field:(_b3f.get?-1:this.fieldIndex);
if((_b3f.field!=undefined)||!_b3f.get){
this.fieldIndex=(_b3f.field>-1?_b3f.field:this.fieldIndex)+1;
}
return new dojox.grid.cell(dojo.mixin({},this._defaultCellProps,_b3f,{grid:this.grid,subrow:_b3d,layoutIndex:_b3e,index:this.cells.length,fieldIndex:_b41,unitWidth:w}));
}});
}
if(!dojo._hasResource["dojox.grid._grid.rows"]){
dojo._hasResource["dojox.grid._grid.rows"]=true;
dojo.provide("dojox.grid._grid.rows");
dojo.declare("dojox.grid.rows",null,{constructor:function(_b42){
this.grid=_b42;
},linesToEms:2,defaultRowHeight:1,overRow:-2,getHeight:function(_b43){
return "";
},getDefaultHeightPx:function(){
return 32;
},prepareStylingRow:function(_b44,_b45){
return {index:_b44,node:_b45,odd:Boolean(_b44&1),selected:this.grid.selection.isSelected(_b44),over:this.isOver(_b44),customStyles:"",customClasses:"dojoxGrid-row"};
},styleRowNode:function(_b46,_b47){
var row=this.prepareStylingRow(_b46,_b47);
this.grid.onStyleRow(row);
this.applyStyles(row);
},applyStyles:function(_b49){
with(_b49){
node.className=customClasses;
var h=node.style.height;
dojox.grid.setStyleText(node,customStyles+";"+(node._style||""));
node.style.height=h;
}
},updateStyles:function(_b4b){
this.grid.updateRowStyles(_b4b);
},setOverRow:function(_b4c){
var last=this.overRow;
this.overRow=_b4c;
if((last!=this.overRow)&&(last>=0)){
this.updateStyles(last);
}
this.updateStyles(this.overRow);
},isOver:function(_b4e){
return (this.overRow==_b4e);
}});
}
if(!dojo._hasResource["dojox.grid._grid.focus"]){
dojo._hasResource["dojox.grid._grid.focus"]=true;
dojo.provide("dojox.grid._grid.focus");
dojo.declare("dojox.grid.focus",null,{constructor:function(_b4f){
this.grid=_b4f;
this.cell=null;
this.rowIndex=-1;
dojo.connect(this.grid.domNode,"onfocus",this,"doFocus");
},tabbingOut:false,focusClass:"dojoxGrid-cell-focus",focusView:null,initFocusView:function(){
this.focusView=this.grid.views.getFirstScrollingView();
},isFocusCell:function(_b50,_b51){
return (this.cell==_b50)&&(this.rowIndex==_b51);
},isLastFocusCell:function(){
return (this.rowIndex==this.grid.rowCount-1)&&(this.cell.index==this.grid.layout.cellCount-1);
},isFirstFocusCell:function(){
return (this.rowIndex==0)&&(this.cell.index==0);
},isNoFocusCell:function(){
return (this.rowIndex<0)||!this.cell;
},_focusifyCellNode:function(_b52){
var n=this.cell&&this.cell.getNode(this.rowIndex);
if(n){
dojo.toggleClass(n,this.focusClass,_b52);
if(_b52){
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
},styleRow:function(_b5a){
return;
},setFocusIndex:function(_b5b,_b5c){
this.setFocusCell(this.grid.getCell(_b5c),_b5b);
},setFocusCell:function(_b5d,_b5e){
if(_b5d&&!this.isFocusCell(_b5d,_b5e)){
this.tabbingOut=false;
this.focusGridView();
this._focusifyCellNode(false);
this.cell=_b5d;
this.rowIndex=_b5e;
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
},move:function(_b65,_b66){
var rc=this.grid.rowCount-1,cc=this.grid.layout.cellCount-1,r=this.rowIndex,i=this.cell.index,row=Math.min(rc,Math.max(0,r+_b65)),col=Math.min(cc,Math.max(0,i+_b66));
this.setFocusIndex(row,col);
if(_b65){
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
},tabOut:function(_b6f){
this.tabbingOut=true;
_b6f.focus();
},focusGridView:function(){
dojox.grid.fire(this.focusView,"focus");
},focusGrid:function(_b70){
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
if(!dojo._hasResource["dojox.grid._grid.selection"]){
dojo._hasResource["dojox.grid._grid.selection"]=true;
dojo.provide("dojox.grid._grid.selection");
dojo.declare("dojox.grid.selection",null,{constructor:function(_b72){
this.grid=_b72;
this.selected=[];
},multiSelect:true,selected:null,updating:0,selectedIndex:-1,onCanSelect:function(_b73){
return this.grid.onCanSelect(_b73);
},onCanDeselect:function(_b74){
return this.grid.onCanDeselect(_b74);
},onSelected:function(_b75){
return this.grid.onSelected(_b75);
},onDeselected:function(_b76){
return this.grid.onDeselected(_b76);
},onChanging:function(){
},onChanged:function(){
return this.grid.onSelectionChanged();
},isSelected:function(_b77){
return this.selected[_b77];
},getFirstSelected:function(){
for(var i=0,l=this.selected.length;i<l;i++){
if(this.selected[i]){
return i;
}
}
return -1;
},getNextSelected:function(_b7a){
for(var i=_b7a+1,l=this.selected.length;i<l;i++){
if(this.selected[i]){
return i;
}
}
return -1;
},getSelected:function(){
var _b7d=[];
for(var i=0,l=this.selected.length;i<l;i++){
if(this.selected[i]){
_b7d.push(i);
}
}
return _b7d;
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
},select:function(_b82){
this.unselectAll(_b82);
this.addToSelection(_b82);
},addToSelection:function(_b83){
_b83=Number(_b83);
if(this.selected[_b83]){
this.selectedIndex=_b83;
}else{
if(this.onCanSelect(_b83)!==false){
this.selectedIndex=_b83;
this.beginUpdate();
this.selected[_b83]=true;
this.grid.onSelected(_b83);
this.endUpdate();
}
}
},deselect:function(_b84){
_b84=Number(_b84);
if(this.selectedIndex==_b84){
this.selectedIndex=-1;
}
if(this.selected[_b84]){
if(this.onCanDeselect(_b84)===false){
return;
}
this.beginUpdate();
delete this.selected[_b84];
this.grid.onDeselected(_b84);
this.endUpdate();
}
},setSelected:function(_b85,_b86){
this[(_b86?"addToSelection":"deselect")](_b85);
},toggleSelect:function(_b87){
this.setSelected(_b87,!this.selected[_b87]);
},insert:function(_b88){
this.selected.splice(_b88,0,false);
if(this.selectedIndex>=_b88){
this.selectedIndex++;
}
},remove:function(_b89){
this.selected.splice(_b89,1);
if(this.selectedIndex>=_b89){
this.selectedIndex--;
}
},unselectAll:function(_b8a){
for(var i in this.selected){
if((i!=_b8a)&&(this.selected[i]===true)){
this.deselect(i);
}
}
},shiftSelect:function(_b8c,inTo){
var s=(_b8c>=0?_b8c:inTo),e=inTo;
if(s>e){
e=s;
s=inTo;
}
for(var i=s;i<=e;i++){
this.addToSelection(i);
}
},clickSelect:function(_b91,_b92,_b93){
this.beginUpdate();
if(!this.multiSelect){
this.select(_b91);
}else{
var _b94=this.selectedIndex;
if(!_b92){
this.unselectAll(_b91);
}
if(_b93){
this.shiftSelect(_b94,_b91);
}else{
if(_b92){
this.toggleSelect(_b91);
}else{
this.addToSelection(_b91);
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
if(!dojo._hasResource["dojox.grid._grid.edit"]){
dojo._hasResource["dojox.grid._grid.edit"]=true;
dojo.provide("dojox.grid._grid.edit");
dojo.declare("dojox.grid.edit",null,{constructor:function(_b96){
this.grid=_b96;
this.connections=[];
if(dojo.isIE){
this.connections.push(dojo.connect(document.body,"onfocus",dojo.hitch(this,"_boomerangFocus")));
}
},info:{},destroy:function(){
dojo.forEach(this.connections,dojo.disconnect);
},cellFocus:function(_b97,_b98){
if(this.grid.singleClickEdit||this.isEditRow(_b98)){
this.setEditCell(_b97,_b98);
}else{
this.apply();
}
if(this.isEditing()||(_b97&&(_b97.editor||0).alwaysOn)){
this._focusEditor(_b97,_b98);
}
},rowClick:function(e){
if(this.isEditing()&&!this.isEditRow(e.rowIndex)){
this.apply();
}
},styleRow:function(_b9a){
if(_b9a.index==this.info.rowIndex){
_b9a.customClasses+=" dojoxGrid-row-editing";
}
},dispatchEvent:function(e){
var c=e.cell,ed=c&&c.editor;
return ed&&ed.dispatchEvent(e.dispatch,e);
},isEditing:function(){
return this.info.rowIndex!==undefined;
},isEditCell:function(_b9e,_b9f){
return (this.info.rowIndex===_b9e)&&(this.info.cell.index==_b9f);
},isEditRow:function(_ba0){
return this.info.rowIndex===_ba0;
},setEditCell:function(_ba1,_ba2){
if(!this.isEditCell(_ba2,_ba1.index)&&this.grid.canEdit(_ba1,_ba2)){
this.start(_ba1,_ba2,this.isEditRow(_ba2)||_ba1.editor);
}
},_focusEditor:function(_ba3,_ba4){
dojox.grid.fire(_ba3.editor,"focus",[_ba4]);
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
},start:function(_ba5,_ba6,_ba7){
this.grid.beginUpdate();
this.editorApply();
if(this.isEditing()&&!this.isEditRow(_ba6)){
this.applyRowEdit();
this.grid.updateRow(_ba6);
}
if(_ba7){
this.info={cell:_ba5,rowIndex:_ba6};
this.grid.doStartEdit(_ba5,_ba6);
this.grid.updateRow(_ba6);
}else{
this.info={};
}
this.grid.endUpdate();
this.grid.focus.focusGrid();
this._focusEditor(_ba5,_ba6);
this._doCatchBoomerang();
},_editorDo:function(_ba8){
var c=this.info.cell;
c&&c.editor&&c.editor[_ba8](this.info.rowIndex);
},editorApply:function(){
this._editorDo("apply");
},editorCancel:function(){
this._editorDo("cancel");
},applyCellEdit:function(_baa,_bab,_bac){
if(this.grid.canEdit(_bab,_bac)){
this.grid.doApplyCellEdit(_baa,_bac,_bab.fieldIndex);
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
},save:function(_bad,_bae){
var c=this.info.cell;
if(this.isEditRow(_bad)&&(!_bae||c.view==_bae)&&c.editor){
c.editor.save(c,this.info.rowIndex);
}
},restore:function(_bb0,_bb1){
var c=this.info.cell;
if(this.isEditRow(_bb1)&&c.view==_bb0&&c.editor){
c.editor.restore(c,this.info.rowIndex);
}
}});
}
if(!dojo._hasResource["dojox.grid._grid.rowbar"]){
dojo._hasResource["dojox.grid._grid.rowbar"]=true;
dojo.provide("dojox.grid._grid.rowbar");
dojo.declare("dojox.GridRowView",dojox.GridView,{defaultWidth:"3em",noscroll:true,padBorderWidth:2,buildRendering:function(){
this.inherited("buildRendering",arguments);
this.scrollboxNode.style.overflow="hidden";
this.headerNode.style.visibility="hidden";
},getWidth:function(){
return this.viewWidth||this.defaultWidth;
},buildRowContent:function(_bb3,_bb4){
var w=this.contentNode.offsetWidth-this.padBorderWidth;
_bb4.innerHTML="<table style=\"width:"+w+"px;\" role=\"wairole:presentation\"><tr><td class=\"dojoxGrid-rowbar-inner\"></td></tr></table>";
},renderHeader:function(){
},resize:function(){
this.adaptHeight();
},adaptWidth:function(){
},doStyleRowNode:function(_bb6,_bb7){
var n=["dojoxGrid-rowbar"];
if(this.grid.rows.isOver(_bb6)){
n.push("dojoxGrid-rowbar-over");
}
if(this.grid.selection.isSelected(_bb6)){
n.push("dojoxGrid-rowbar-selected");
}
_bb7.className=n.join(" ");
},domouseover:function(e){
this.grid.onMouseOverRow(e);
},domouseout:function(e){
if(!this.isIntraRowEvent(e)){
this.grid.onMouseOutRow(e);
}
}});
}
if(!dojo._hasResource["dojox.grid._grid.publicEvents"]){
dojo._hasResource["dojox.grid._grid.publicEvents"]=true;
dojo.provide("dojox.grid._grid.publicEvents");
dojox.grid.publicEvents={cellOverClass:"dojoxGrid-cell-over",onKeyEvent:function(e){
this.dispatchKeyEvent(e);
},onContentEvent:function(e){
this.dispatchContentEvent(e);
},onHeaderEvent:function(e){
this.dispatchHeaderEvent(e);
},onStyleRow:function(_bbe){
with(_bbe){
customClasses+=(odd?" dojoxGrid-row-odd":"")+(selected?" dojoxGrid-row-selected":"")+(over?" dojoxGrid-row-over":"");
}
this.focus.styleRow(_bbe);
this.edit.styleRow(_bbe);
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
var _bc1=this.edit.isEditing();
this.edit.apply();
if(!_bc1){
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
var _bc2=(e.keyCode==dk.LEFT_ARROW)?1:-1;
if(dojo._isBodyLtr()){
_bc2*=-1;
}
this.focus.move(0,_bc2);
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
},onCellFocus:function(_bcf,_bd0){
this.edit.cellFocus(_bcf,_bd0);
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
},onStartEdit:function(_be2,_be3){
},onApplyCellEdit:function(_be4,_be5,_be6){
},onCancelEdit:function(_be7){
},onApplyEdit:function(_be8){
},onCanSelect:function(_be9){
return true;
},onCanDeselect:function(_bea){
return true;
},onSelected:function(_beb){
this.updateRowStyles(_beb);
},onDeselected:function(_bec){
this.updateRowStyles(_bec);
},onSelectionChanged:function(){
}};
}
if(!dojo._hasResource["dojox.grid.VirtualGrid"]){
dojo._hasResource["dojox.grid.VirtualGrid"]=true;
dojo.provide("dojox.grid.VirtualGrid");
dojo.declare("dojox.VirtualGrid",[dijit._Widget,dijit._Templated],{templateString:"<div class=\"dojoxGrid\" hidefocus=\"hidefocus\" role=\"wairole:grid\">\r\n\t<div class=\"dojoxGrid-master-header\" dojoAttachPoint=\"viewsHeaderNode\"></div>\r\n\t<div class=\"dojoxGrid-master-view\" dojoAttachPoint=\"viewsNode\"></div>\r\n\t<span dojoAttachPoint=\"lastFocusNode\" tabindex=\"0\"></span>\r\n</div>\r\n",classTag:"dojoxGrid",get:function(_bed){
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
},createView:function(_bef){
if(dojo.isAIR){
var obj=window;
var _bf1=_bef.split(".");
for(var i=0;i<_bf1.length;i++){
if(typeof obj[_bf1[i]]=="undefined"){
var _bf3=_bf1[0];
for(var j=1;j<=i;j++){
_bf3+="."+_bf1[j];
}
throw new Error(_bf3+" is undefined");
}
obj=obj[_bf1[i]];
}
var c=obj;
}else{
var c=eval(_bef);
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
},setStructure:function(_bf9){
this.views.destroyViews();
this.structure=_bf9;
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
},resize:function(_bfa){
this._sizeBox=_bfa;
this._resize();
this.sizeChange();
},_getPadBorder:function(){
this._padBorder=this._padBorder||dojo._getPadBorderExtents(this.domNode);
return this._padBorder;
},_resize:function(){
if(!this.domNode.parentNode||this.domNode.parentNode.nodeType!=1||!this.hasLayout()){
return;
}
var _bfb=this._getPadBorder();
if(this.autoHeight){
this.domNode.style.height="auto";
this.viewsNode.style.height="";
}else{
if(this.flex>0){
}else{
if(this.domNode.clientHeight<=_bfb.h){
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
},renderRow:function(_c01,_c02){
this.views.renderRow(_c01,_c02);
},rowRemoved:function(_c03){
this.views.rowRemoved(_c03);
},invalidated:null,updating:false,beginUpdate:function(){
this.invalidated=[];
this.updating=true;
},endUpdate:function(){
this.updating=false;
var i=this.invalidated;
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
this.prerender();
this.scroller.invalidateNodes();
this.setScrollTop(this.scrollTop);
this.postrender();
},update:function(){
this.render();
},updateRow:function(_c05){
_c05=Number(_c05);
if(this.updating){
this.invalidated[_c05]=true;
}else{
this.views.updateRow(_c05,this.rows.getHeight(_c05));
this.scroller.rowHeightChanged(_c05);
}
},updateRowCount:function(_c06){
if(this.updating){
this.invalidated.rowCount=_c06;
}else{
this.rowCount=_c06;
if(this.layout.cells.length){
this.scroller.updateRowCount(_c06);
this.setScrollTop(this.scrollTop);
}
this._resize();
}
},updateRowStyles:function(_c07){
this.views.updateRowStyles(_c07);
},rowHeightChanged:function(_c08){
this.views.renormalizeRow(_c08);
this.scroller.rowHeightChanged(_c08);
},fastScroll:true,delayScroll:false,scrollRedrawThreshold:(dojo.isIE?100:50),scrollTo:function(_c09){
if(!this.fastScroll){
this.setScrollTop(_c09);
return;
}
var _c0a=Math.abs(this.lastScrollTop-_c09);
this.lastScrollTop=_c09;
if(_c0a>this.scrollRedrawThreshold||this.delayScroll){
this.delayScroll=true;
this.scrollTop=_c09;
this.views.setScrollTop(_c09);
dojox.grid.jobs.job("dojoxGrid-scroll",200,dojo.hitch(this,"finishScrollJob"));
}else{
this.setScrollTop(_c09);
}
},finishScrollJob:function(){
this.delayScroll=false;
this.setScrollTop(this.scrollTop);
},setScrollTop:function(_c0b){
this.scrollTop=this.views.setScrollTop(_c0b);
this.scroller.scroll(this.scrollTop);
},scrollToRow:function(_c0c){
this.setScrollTop(this.scroller.findScrollTop(_c0c)+1);
},styleRowNode:function(_c0d,_c0e){
if(_c0e){
this.rows.styleRowNode(_c0d,_c0e);
}
},getCell:function(_c0f){
return this.layout.cells[_c0f];
},setCellWidth:function(_c10,_c11){
this.getCell(_c10).unitWidth=_c11;
},getCellName:function(_c12){
return "Cell "+_c12.index;
},canSort:function(_c13){
},sort:function(){
},getSortAsc:function(_c14){
_c14=_c14==undefined?this.sortInfo:_c14;
return Boolean(_c14>0);
},getSortIndex:function(_c15){
_c15=_c15==undefined?this.sortInfo:_c15;
return Math.abs(_c15)-1;
},setSortIndex:function(_c16,_c17){
var si=_c16+1;
if(_c17!=undefined){
si*=(_c17?1:-1);
}else{
if(this.getSortIndex()==_c16){
si=-this.sortInfo;
}
}
this.setSortInfo(si);
},setSortInfo:function(_c19){
if(this.canSort(_c19)){
this.sortInfo=_c19;
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
},doStartEdit:function(_c27,_c28){
this.onStartEdit(_c27,_c28);
},doApplyCellEdit:function(_c29,_c2a,_c2b){
this.onApplyCellEdit(_c29,_c2a,_c2b);
},doCancelEdit:function(_c2c){
this.onCancelEdit(_c2c);
},doApplyEdit:function(_c2d){
this.onApplyEdit(_c2d);
},addRow:function(){
this.updateRowCount(this.rowCount+1);
},removeSelectedRows:function(){
this.updateRowCount(Math.max(0,this.rowCount-this.selection.getSelected().length));
this.selection.clear();
}});
dojo.mixin(dojox.VirtualGrid.prototype,dojox.grid.publicEvents);
}
if(!dojo._hasResource["dojox.grid._data.fields"]){
dojo._hasResource["dojox.grid._data.fields"]=true;
dojo.provide("dojox.grid._data.fields");
dojo.declare("dojox.grid.data.Mixer",null,{constructor:function(){
this.defaultValue={};
this.values=[];
},count:function(){
return this.values.length;
},clear:function(){
this.values=[];
},build:function(_c2e){
var _c2f=dojo.mixin({owner:this},this.defaultValue);
_c2f.key=_c2e;
this.values[_c2e]=_c2f;
return _c2f;
},getDefault:function(){
return this.defaultValue;
},setDefault:function(_c30){
for(var i=0,a;(a=arguments[i]);i++){
dojo.mixin(this.defaultValue,a);
}
},get:function(_c33){
return this.values[_c33]||this.build(_c33);
},_set:function(_c34,_c35){
var v=this.get(_c34);
for(var i=1;i<arguments.length;i++){
dojo.mixin(v,arguments[i]);
}
this.values[_c34]=v;
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
},insert:function(_c3b,_c3c){
if(_c3b>=this.values.length){
this.values[_c3b]=_c3c;
}else{
this.values.splice(_c3b,0,_c3c);
}
},remove:function(_c3d){
this.values.splice(_c3d,1);
},swap:function(_c3e,_c3f){
dojox.grid.arraySwap(this.values,_c3e,_c3f);
},move:function(_c40,_c41){
dojox.grid.arrayMove(this.values,_c40,_c41);
}});
dojox.grid.data.compare=function(a,b){
return (a>b?1:(a==b?0:-1));
};
dojo.declare("dojox.grid.data.Field",null,{constructor:function(_c44){
this.name=_c44;
this.compare=dojox.grid.data.compare;
},na:dojox.grid.na});
dojo.declare("dojox.grid.data.Fields",dojox.grid.data.Mixer,{constructor:function(_c45){
var _c46=_c45?_c45:dojox.grid.data.Field;
this.defaultValue=new _c46();
},indexOf:function(_c47){
for(var i=0;i<this.values.length;i++){
var v=this.values[i];
if(v&&v.key==_c47){
return i;
}
}
return -1;
}});
}
if(!dojo._hasResource["dojox.grid._data.model"]){
dojo._hasResource["dojox.grid._data.model"]=true;
dojo.provide("dojox.grid._data.model");
dojo.declare("dojox.grid.data.Model",null,{constructor:function(_c4a,_c4b){
this.observers=[];
this.fields=new dojox.grid.data.Fields();
if(_c4a){
this.fields.set(_c4a);
}
this.setData(_c4b);
},count:0,updating:0,observer:function(_c4c,_c4d){
this.observers.push({o:_c4c,p:_c4d||"model"});
},notObserver:function(_c4e){
for(var i=0,m,o;(o=this.observers[i]);i++){
if(o.o==_c4e){
this.observers.splice(i,1);
return;
}
}
},notify:function(_c52,_c53){
if(!this.isUpdating()){
var a=_c53||[];
for(var i=0,m,o;(o=this.observers[i]);i++){
m=o.p+_c52;
o=o.o;
(m in o)&&(o[m].apply(o,a));
}
}
},clear:function(){
this.fields.clear();
this.clearData();
},beginUpdate:function(){
this.updating++;
},endUpdate:function(){
if(this.updating){
this.updating--;
}
},isUpdating:function(){
return Boolean(this.updating);
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
},insert:function(_c58){
if(!this._insert.apply(this,arguments)){
return false;
}
this.insertion.apply(this,dojo._toArray(arguments,1));
return true;
},remove:function(_c59){
if(!this._remove.apply(this,arguments)){
return false;
}
this.removal.apply(this,arguments);
return true;
},canSort:function(){
return this.sort!=null;
},generateComparator:function(_c5a,_c5b,_c5c,_c5d){
return function(a,b){
var ineq=_c5a(a[_c5b],b[_c5b]);
return ineq?(_c5c?ineq:-ineq):_c5d&&_c5d(a,b);
};
},makeComparator:function(_c61){
var idx,col,_c64,_c65=null;
for(var i=_c61.length-1;i>=0;i--){
idx=_c61[i];
col=Math.abs(idx)-1;
if(col>=0){
_c64=this.fields.get(col);
_c65=this.generateComparator(_c64.compare,_c64.key,idx>0,_c65);
}
}
return _c65;
},sort:null,dummy:0});
dojo.declare("dojox.grid.data.Rows",dojox.grid.data.Model,{allChange:function(){
this.notify("AllChange",arguments);
this.notify("Change",arguments);
},rowChange:function(){
this.notify("RowChange",arguments);
},datumChange:function(){
this.notify("DatumChange",arguments);
},beginModifyRow:function(_c67){
if(!this.cache[_c67]){
this.cache[_c67]=this.copyRow(_c67);
}
},endModifyRow:function(_c68){
var _c69=this.cache[_c68];
if(_c69){
var data=this.getRow(_c68);
if(!dojox.grid.arrayCompare(_c69,data)){
this.update(_c69,data,_c68);
}
delete this.cache[_c68];
}
},cancelModifyRow:function(_c6b){
var _c6c=this.cache[_c6b];
if(_c6c){
this.setRow(_c6c,_c6b);
delete this.cache[_c6b];
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
},badIndex:function(_c6d,_c6e){
console.debug("dojox.grid.data.Table: badIndex");
},isGoodIndex:function(_c6f,_c70){
return (_c6f>=0&&_c6f<this.count&&(arguments.length<2||(_c70>=0&&_c70<this.colCount)));
},getRow:function(_c71){
return this.data[_c71];
},copyRow:function(_c72){
return this.getRow(_c72).slice(0);
},getDatum:function(_c73,_c74){
return this.data[_c73][_c74];
},get:function(){
throw ("Plain \"get\" no longer supported. Use \"getRow\" or \"getDatum\".");
},setData:function(_c75){
this.data=(_c75||[]);
this.allChange();
},setRow:function(_c76,_c77){
this.data[_c77]=_c76;
this.rowChange(_c76,_c77);
this.change();
},setDatum:function(_c78,_c79,_c7a){
this.data[_c79][_c7a]=_c78;
this.datumChange(_c78,_c79,_c7a);
},set:function(){
throw ("Plain \"set\" no longer supported. Use \"setData\", \"setRow\", or \"setDatum\".");
},setRows:function(_c7b,_c7c){
for(var i=0,l=_c7b.length,r=_c7c;i<l;i++,r++){
this.setRow(_c7b[i],r);
}
},update:function(_c80,_c81,_c82){
return true;
},_insert:function(_c83,_c84){
dojox.grid.arrayInsert(this.data,_c84,_c83);
this.count++;
return true;
},_remove:function(_c85){
for(var i=_c85.length-1;i>=0;i--){
dojox.grid.arrayRemove(this.data,_c85[i]);
}
this.count-=_c85.length;
return true;
},sort:function(){
this.data.sort(this.makeComparator(arguments));
},swap:function(_c87,_c88){
dojox.grid.arraySwap(this.data,_c87,_c88);
this.rowChange(this.getRow(_c87),_c87);
this.rowChange(this.getRow(_c88),_c88);
this.change();
},dummy:0});
dojo.declare("dojox.grid.data.Objects",dojox.grid.data.Table,{constructor:function(_c89,_c8a,_c8b){
if(!_c89){
this.autoAssignFields();
}
},allChange:function(){
this.notify("FieldsChange");
this.inherited(arguments);
},autoAssignFields:function(){
var d=this.data[0],i=0,_c8e;
for(var f in d){
_c8e=this.fields.get(i++);
if(!dojo.isString(_c8e.key)){
_c8e.key=f;
}
}
},setData:function(_c90){
this.data=(_c90||[]);
this.autoAssignFields();
this.allChange();
},getDatum:function(_c91,_c92){
return this.data[_c91][this.fields.get(_c92).key];
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
},setRowCount:function(_c93){
this.count=_c93;
this.change();
},requestsPending:function(_c94){
},rowToPage:function(_c95){
return (this.rowsPerPage?Math.floor(_c95/this.rowsPerPage):_c95);
},pageToRow:function(_c96){
return (this.rowsPerPage?this.rowsPerPage*_c96:_c96);
},requestRows:function(_c97,_c98){
},rowsProvided:function(_c99,_c9a){
this.requests--;
if(this.requests==0){
this.requestsPending(false);
}
},requestPage:function(_c9b){
var row=this.pageToRow(_c9b);
var _c9d=Math.min(this.rowsPerPage,this.count-row);
if(_c9d>0){
this.requests++;
this.requestsPending(true);
setTimeout(dojo.hitch(this,"requestRows",row,_c9d),1);
}
},needPage:function(_c9e){
if(!this.pages[_c9e]){
this.pages[_c9e]=true;
this.requestPage(_c9e);
}
},preparePage:function(_c9f,_ca0){
if(_c9f<this.bop||_c9f>=this.eop){
var _ca1=this.rowToPage(_c9f);
this.needPage(_ca1);
this.bop=_ca1*this.rowsPerPage;
this.eop=this.bop+(this.rowsPerPage||this.count);
}
},isRowLoaded:function(_ca2){
return Boolean(this.data[_ca2]);
},removePages:function(_ca3){
for(var i=0,r;((r=_ca3[i])!=undefined);i++){
this.pages[this.rowToPage(r)]=false;
}
this.bop=this.eop=-1;
},remove:function(_ca6){
this.removePages(_ca6);
dojox.grid.data.Table.prototype.remove.apply(this,arguments);
},getRow:function(_ca7){
var row=this.data[_ca7];
if(!row){
this.preparePage(_ca7);
}
return row;
},getDatum:function(_ca9,_caa){
var row=this.getRow(_ca9);
return (row?row[_caa]:this.fields.get(_caa).na);
},setDatum:function(_cac,_cad,_cae){
var row=this.getRow(_cad);
if(row){
row[_cae]=_cac;
this.datumChange(_cac,_cad,_cae);
}else{
console.debug("["+this.declaredClass+"] dojox.grid.data.dynamic.set: cannot set data on an non-loaded row");
}
},canSort:function(){
return false;
}});
dojox.grid.data.table=dojox.grid.data.Table;
dojox.grid.data.dynamic=dojox.grid.data.Dynamic;
dojo.declare("dojox.grid.data.DojoData",dojox.grid.data.Dynamic,{constructor:function(_cb0,_cb1,args){
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
},query:{name:"*"},store:null,_currentlyProcessing:null,_canNotify:false,_canWrite:false,_canIdentify:false,_rowIdentities:{},clientSort:false,sortFields:null,queryOptions:null,setData:function(_cb6){
this.store=_cb6;
this.data=[];
this.allChange();
},setRowCount:function(_cb7){
this.count=_cb7;
this.allChange();
},beginReturn:function(_cb8){
if(this.count!=_cb8){
this.setRowCount(_cb8);
}
},_setupFields:function(_cb9){
if(this.fields._nameMaps){
return;
}
var m={};
var _cbb=dojo.map(this.store.getAttributes(_cb9),function(item,idx){
m[item]=idx;
m[idx+".idx"]=item;
return {name:item,key:item};
},this);
this.fields._nameMaps=m;
this.fields.set(_cbb);
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
},processRows:function(_cc2,_cc3){
if(!_cc2||_cc2.length==0){
return;
}
this._setupFields(_cc2[0]);
dojo.forEach(_cc2,function(item,idx){
var row=this._createRow(item);
this._setRowId(item,_cc3.start,idx);
this.setRow(row,_cc3.start+idx);
},this);
},requestRows:function(_cc7,_cc8){
var row=_cc7||0;
var _cca={start:row,count:this.rowsPerPage,query:this.query,sort:this.sortFields,queryOptions:this.queryOptions,onBegin:dojo.hitch(this,"beginReturn"),onComplete:dojo.hitch(this,"processRows"),onError:dojo.hitch(this,"processError")};
this.store.fetch(_cca);
},getDatum:function(_ccb,_ccc){
var row=this.getRow(_ccb);
var _cce=this.fields.values[_ccc];
return row&&_cce?row[_cce.name]:_cce?_cce.na:"?";
},setDatum:function(_ccf,_cd0,_cd1){
var n=this.fields._nameMaps[_cd1+".idx"];
if(n){
this.data[_cd0][n]=_ccf;
this.datumChange(_ccf,_cd0,_cd1);
}
},copyRow:function(_cd3){
var row={};
var _cd5={};
var src=this.getRow(_cd3);
for(var x in src){
if(src[x]!=_cd5[x]){
row[x]=src[x];
}
}
return row;
},_attrCompare:function(_cd8,data){
dojo.forEach(this.fields.values,function(a){
if(_cd8[a.name]!=data[a.name]){
return false;
}
},this);
return true;
},endModifyRow:function(_cdb){
var _cdc=this.cache[_cdb];
if(_cdc){
var data=this.getRow(_cdb);
if(!this._attrCompare(_cdc,data)){
this.update(_cdc,data,_cdb);
}
delete this.cache[_cdb];
}
},cancelModifyRow:function(_cde){
var _cdf=this.cache[_cde];
if(_cdf){
this.setRow(_cdf,_cde);
delete this.cache[_cde];
}
},_setRowId:function(item,_ce1,idx){
if(this._canIdentify){
this._rowIdentities[this.store.getIdentity(item)]={rowId:_ce1+idx,item:item};
}else{
var _ce3=dojo.toJson(this.query)+":start:"+_ce1+":idx:"+idx+":sort:"+dojo.toJson(this.sortFields);
this._rowIdentities[_ce3]={rowId:_ce1+idx,item:item};
}
},_getRowId:function(item,_ce5){
var _ce6=null;
if(this._canIdentify&&!_ce5){
_ce6=this._rowIdentities[this.store.getIdentity(item)].rowId;
}else{
var id;
for(id in this._rowIdentities){
if(this._rowIdentities[id].item===item){
_ce6=this._rowIdentities[id].rowId;
break;
}
}
}
return _ce6;
},_storeDatumChange:function(item,attr,_cea,_ceb){
var _cec=this._getRowId(item);
var row=this.getRow(_cec);
if(row){
row[attr]=_ceb;
var _cee=this.fields._nameMaps[attr];
this.notify("DatumChange",[_ceb,_cec,_cee]);
}
},_storeDatumDelete:function(item){
if(dojo.indexOf(this._currentlyProcessing,item)!=-1){
return;
}
var _cf0=this._getRowId(item,true);
if(_cf0!=null){
this._removeItems([_cf0]);
}
},_storeDatumNew:function(item){
if(this._disableNew){
return;
}
this._insertItem(item,this.data.length);
},insert:function(item,_cf3){
this._disableNew=true;
var i=this.store.newItem(item);
this._disableNew=false;
this._insertItem(i,_cf3);
},_insertItem:function(_cf5,_cf6){
if(!this.fields._nameMaps){
this._setupFields(_cf5);
}
var row=this._createRow(_cf5);
for(var i in this._rowIdentities){
var _cf9=this._rowIdentities[i];
if(_cf9.rowId>=_cf6){
_cf9.rowId++;
}
}
this._setRowId(_cf5,0,_cf6);
dojox.grid.data.Dynamic.prototype.insert.apply(this,[row,_cf6]);
},datumChange:function(_cfa,_cfb,_cfc){
if(this._canWrite){
var row=this.getRow(_cfb);
var _cfe=this.fields._nameMaps[_cfc+".idx"];
this.store.setValue(row.__dojo_data_item,_cfe,_cfa);
}else{
this.notify("DatumChange",arguments);
}
},insertion:function(){
console.debug("Insertion",arguments);
this.notify("Insertion",arguments);
this.notify("Change",arguments);
},removal:function(){
console.debug("Removal",arguments);
this.notify("Removal",arguments);
this.notify("Change",arguments);
},remove:function(_cff){
for(var i=_cff.length-1;i>=0;i--){
var item=this.data[_cff[i]].__dojo_data_item;
this._currentlyProcessing.push(item);
this.store.deleteItem(item);
}
this._removeItems(_cff);
this._currentlyProcessing=[];
},_removeItems:function(_d02){
dojox.grid.data.Dynamic.prototype.remove.apply(this,arguments);
this._rowIdentities={};
for(var i=0;i<this.data.length;i++){
this._setRowId(this.data[i].__dojo_data_item,0,i);
}
},canSort:function(){
return true;
},sort:function(_d04){
var col=Math.abs(_d04)-1;
this.sortFields=[{"attribute":this.fields.values[col].name,"descending":(_d04>0)}];
this.refresh();
},refresh:function(){
this.clearData(true);
this.requestRows();
},clearData:function(_d06){
this._rowIdentities={};
this.pages=[];
this.bop=this.eop=-1;
this.count=0;
this.setData((_d06?this.store:[]));
},processError:function(_d07,_d08){
console.log(_d07);
}});
}
if(!dojo._hasResource["dojox.grid._data.editors"]){
dojo._hasResource["dojox.grid._data.editors"]=true;
dojo.provide("dojox.grid._data.editors");
dojo.provide("dojox.grid.editors");
dojo.declare("dojox.grid.editors.Base",null,{constructor:function(_d09){
this.cell=_d09;
},_valueProp:"value",_formatPending:false,format:function(_d0a,_d0b){
},needFormatNode:function(_d0c,_d0d){
this._formatPending=true;
dojox.grid.whenIdle(this,"_formatNode",_d0c,_d0d);
},cancelFormatNode:function(){
this._formatPending=false;
},_formatNode:function(_d0e,_d0f){
if(this._formatPending){
this._formatPending=false;
dojo.setSelectable(this.cell.grid.domNode,true);
this.formatNode(this.getNode(_d0f),_d0e,_d0f);
}
},getNode:function(_d10){
return (this.cell.getNode(_d10)||0).firstChild||0;
},formatNode:function(_d11,_d12,_d13){
if(dojo.isIE){
dojox.grid.whenIdle(this,"focus",_d13,_d11);
}else{
this.focus(_d13,_d11);
}
},dispatchEvent:function(m,e){
if(m in this){
return this[m](e);
}
},getValue:function(_d16){
return this.getNode(_d16)[this._valueProp];
},setValue:function(_d17,_d18){
var n=this.getNode(_d17);
if(n){
n[this._valueProp]=_d18;
}
},focus:function(_d1a,_d1b){
dojox.grid.focusSelectNode(_d1b||this.getNode(_d1a));
},save:function(_d1c){
this.value=this.value||this.getValue(_d1c);
},restore:function(_d1d){
this.setValue(_d1d,this.value);
},_finish:function(_d1e){
dojo.setSelectable(this.cell.grid.domNode,false);
this.cancelFormatNode(this.cell);
},apply:function(_d1f){
this.cell.applyEdit(this.getValue(_d1f),_d1f);
this._finish(_d1f);
},cancel:function(_d20){
this.cell.cancelEdit(_d20);
this._finish(_d20);
}});
dojox.grid.editors.base=dojox.grid.editors.Base;
dojo.declare("dojox.grid.editors.Input",dojox.grid.editors.Base,{constructor:function(_d21){
this.keyFilter=this.keyFilter||this.cell.keyFilter;
},keyFilter:null,format:function(_d22,_d23){
this.needFormatNode(_d22,_d23);
return "<input class=\"dojoxGrid-input\" type=\"text\" value=\""+_d22+"\">";
},formatNode:function(_d24,_d25,_d26){
this.inherited(arguments);
this.cell.registerOnBlur(_d24,_d26);
},doKey:function(e){
if(this.keyFilter){
var key=String.fromCharCode(e.charCode);
if(key.search(this.keyFilter)==-1){
dojo.stopEvent(e);
}
}
},_finish:function(_d29){
this.inherited(arguments);
var n=this.getNode(_d29);
try{
dojox.grid.fire(n,"blur");
}
catch(e){
}
}});
dojox.grid.editors.input=dojox.grid.editors.Input;
dojo.declare("dojox.grid.editors.Select",dojox.grid.editors.Input,{constructor:function(_d2b){
this.options=this.options||this.cell.options;
this.values=this.values||this.cell.values||this.options;
},format:function(_d2c,_d2d){
this.needFormatNode(_d2c,_d2d);
var h=["<select class=\"dojoxGrid-select\">"];
for(var i=0,o,v;((o=this.options[i])!==undefined)&&((v=this.values[i])!==undefined);i++){
h.push("<option",(_d2c==v?" selected":"")," value=\""+v+"\"",">",o,"</option>");
}
h.push("</select>");
return h.join("");
},getValue:function(_d32){
var n=this.getNode(_d32);
if(n){
var i=n.selectedIndex,o=n.options[i];
return this.cell.returnIndex?i:o.value||o.innerHTML;
}
}});
dojox.grid.editors.select=dojox.grid.editors.Select;
dojo.declare("dojox.grid.editors.AlwaysOn",dojox.grid.editors.Input,{alwaysOn:true,_formatNode:function(_d36,_d37){
this.formatNode(this.getNode(_d37),_d36,_d37);
},applyStaticValue:function(_d38){
var e=this.cell.grid.edit;
e.applyCellEdit(this.getValue(_d38),this.cell,_d38);
e.start(this.cell,_d38,true);
}});
dojox.grid.editors.alwaysOn=dojox.grid.editors.AlwaysOn;
dojo.declare("dojox.grid.editors.Bool",dojox.grid.editors.AlwaysOn,{_valueProp:"checked",format:function(_d3a,_d3b){
return "<input class=\"dojoxGrid-input\" type=\"checkbox\""+(_d3a?" checked=\"checked\"":"")+" style=\"width: auto\" />";
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
dojo.cldr.supplemental.getFirstDayOfWeek=function(_d3d){
var _d3e={mv:5,ae:6,af:6,bh:6,dj:6,dz:6,eg:6,er:6,et:6,iq:6,ir:6,jo:6,ke:6,kw:6,lb:6,ly:6,ma:6,om:6,qa:6,sa:6,sd:6,so:6,tn:6,ye:6,as:0,au:0,az:0,bw:0,ca:0,cn:0,fo:0,ge:0,gl:0,gu:0,hk:0,ie:0,il:0,is:0,jm:0,jp:0,kg:0,kr:0,la:0,mh:0,mo:0,mp:0,mt:0,nz:0,ph:0,pk:0,sg:0,th:0,tt:0,tw:0,um:0,us:0,uz:0,vi:0,za:0,zw:0,et:0,mw:0,ng:0,tj:0,sy:4};
var _d3f=dojo.cldr.supplemental._region(_d3d);
var dow=_d3e[_d3f];
return (dow===undefined)?1:dow;
};
dojo.cldr.supplemental._region=function(_d41){
_d41=dojo.i18n.normalizeLocale(_d41);
var tags=_d41.split("-");
var _d43=tags[1];
if(!_d43){
_d43={de:"de",en:"us",es:"es",fi:"fi",fr:"fr",hu:"hu",it:"it",ja:"jp",ko:"kr",nl:"nl",pt:"br",sv:"se",zh:"cn"}[tags[0]];
}else{
if(_d43.length==4){
_d43=tags[2];
}
}
return _d43;
};
dojo.cldr.supplemental.getWeekend=function(_d44){
var _d45={eg:5,il:5,sy:5,"in":0,ae:4,bh:4,dz:4,iq:4,jo:4,kw:4,lb:4,ly:4,ma:4,om:4,qa:4,sa:4,sd:4,tn:4,ye:4};
var _d46={ae:5,bh:5,dz:5,iq:5,jo:5,kw:5,lb:5,ly:5,ma:5,om:5,qa:5,sa:5,sd:5,tn:5,ye:5,af:5,ir:5,eg:6,il:6,sy:6};
var _d47=dojo.cldr.supplemental._region(_d44);
var _d48=_d45[_d47];
var end=_d46[_d47];
if(_d48===undefined){
_d48=6;
}
if(end===undefined){
end=0;
}
return {start:_d48,end:end};
};
}
if(!dojo._hasResource["dojo.date"]){
dojo._hasResource["dojo.date"]=true;
dojo.provide("dojo.date");
dojo.date.getDaysInMonth=function(_d4a){
var _d4b=_d4a.getMonth();
var days=[31,28,31,30,31,30,31,31,30,31,30,31];
if(_d4b==1&&dojo.date.isLeapYear(_d4a)){
return 29;
}
return days[_d4b];
};
dojo.date.isLeapYear=function(_d4d){
var year=_d4d.getFullYear();
return !(year%400)||(!(year%4)&&!!(year%100));
};
dojo.date.getTimezoneName=function(_d4f){
var str=_d4f.toString();
var tz="";
var _d52;
var pos=str.indexOf("(");
if(pos>-1){
tz=str.substring(++pos,str.indexOf(")"));
}else{
var pat=/([A-Z\/]+) \d{4}$/;
if((_d52=str.match(pat))){
tz=_d52[1];
}else{
str=_d4f.toLocaleString();
pat=/ ([A-Z\/]+)$/;
if((_d52=str.match(pat))){
tz=_d52[1];
}
}
}
return (tz=="AM"||tz=="PM")?"":tz;
};
dojo.date.compare=function(_d55,_d56,_d57){
_d55=new Date(Number(_d55));
_d56=new Date(Number(_d56||new Date()));
if(_d57!=="undefined"){
if(_d57=="date"){
_d55.setHours(0,0,0,0);
_d56.setHours(0,0,0,0);
}else{
if(_d57=="time"){
_d55.setFullYear(0,0,0);
_d56.setFullYear(0,0,0);
}
}
}
if(_d55>_d56){
return 1;
}
if(_d55<_d56){
return -1;
}
return 0;
};
dojo.date.add=function(date,_d59,_d5a){
var sum=new Date(Number(date));
var _d5c=false;
var _d5d="Date";
switch(_d59){
case "day":
break;
case "weekday":
var days,_d5f;
var mod=_d5a%5;
if(!mod){
days=(_d5a>0)?5:-5;
_d5f=(_d5a>0)?((_d5a-5)/5):((_d5a+5)/5);
}else{
days=mod;
_d5f=parseInt(_d5a/5);
}
var strt=date.getDay();
var adj=0;
if(strt==6&&_d5a>0){
adj=1;
}else{
if(strt==0&&_d5a<0){
adj=-1;
}
}
var trgt=strt+days;
if(trgt==0||trgt==6){
adj=(_d5a>0)?2:-2;
}
_d5a=(7*_d5f)+days+adj;
break;
case "year":
_d5d="FullYear";
_d5c=true;
break;
case "week":
_d5a*=7;
break;
case "quarter":
_d5a*=3;
case "month":
_d5c=true;
_d5d="Month";
break;
case "hour":
case "minute":
case "second":
case "millisecond":
_d5d="UTC"+_d59.charAt(0).toUpperCase()+_d59.substring(1)+"s";
}
if(_d5d){
sum["set"+_d5d](sum["get"+_d5d]()+_d5a);
}
if(_d5c&&(sum.getDate()<date.getDate())){
sum.setDate(0);
}
return sum;
};
dojo.date.difference=function(_d64,_d65,_d66){
_d65=_d65||new Date();
_d66=_d66||"day";
var _d67=_d65.getFullYear()-_d64.getFullYear();
var _d68=1;
switch(_d66){
case "quarter":
var m1=_d64.getMonth();
var m2=_d65.getMonth();
var q1=Math.floor(m1/3)+1;
var q2=Math.floor(m2/3)+1;
q2+=(_d67*4);
_d68=q2-q1;
break;
case "weekday":
var days=Math.round(dojo.date.difference(_d64,_d65,"day"));
var _d6e=parseInt(dojo.date.difference(_d64,_d65,"week"));
var mod=days%7;
if(mod==0){
days=_d6e*5;
}else{
var adj=0;
var aDay=_d64.getDay();
var bDay=_d65.getDay();
_d6e=parseInt(days/7);
mod=days%7;
var _d73=new Date(_d64);
_d73.setDate(_d73.getDate()+(_d6e*7));
var _d74=_d73.getDay();
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
case (_d74+mod)>5:
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
case (_d74+mod)<0:
adj=2;
}
}
}
days+=adj;
days-=(_d6e*2);
}
_d68=days;
break;
case "year":
_d68=_d67;
break;
case "month":
_d68=(_d65.getMonth()-_d64.getMonth())+(_d67*12);
break;
case "week":
_d68=parseInt(dojo.date.difference(_d64,_d65,"day")/7);
break;
case "day":
_d68/=24;
case "hour":
_d68/=60;
case "minute":
_d68/=60;
case "second":
_d68/=1000;
case "millisecond":
_d68*=_d65.getTime()-_d64.getTime();
}
return Math.round(_d68);
};
}
if(!dojo._hasResource["dojo.date.locale"]){
dojo._hasResource["dojo.date.locale"]=true;
dojo.provide("dojo.date.locale");
(function(){
function formatPattern(_d75,_d76,_d77,_d78){
return _d78.replace(/([a-z])\1*/ig,function(_d79){
var s,pad;
var c=_d79.charAt(0);
var l=_d79.length;
var _d7e=["abbr","wide","narrow"];
switch(c){
case "G":
s=_d76[(l<4)?"eraAbbr":"eraNames"][_d75.getFullYear()<0?0:1];
break;
case "y":
s=_d75.getFullYear();
switch(l){
case 1:
break;
case 2:
if(!_d77){
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
s=Math.ceil((_d75.getMonth()+1)/3);
pad=true;
break;
case "M":
case "L":
var m=_d75.getMonth();
var _d80;
switch(l){
case 1:
case 2:
s=m+1;
pad=true;
break;
case 3:
case 4:
case 5:
_d80=_d7e[l-3];
break;
}
if(_d80){
var _d81=(c=="L")?"standalone":"format";
var _d82=["months",_d81,_d80].join("-");
s=_d76[_d82][m];
}
break;
case "w":
var _d83=0;
s=dojo.date.locale._getWeekOfYear(_d75,_d83);
pad=true;
break;
case "d":
s=_d75.getDate();
pad=true;
break;
case "D":
s=dojo.date.locale._getDayOfYear(_d75);
pad=true;
break;
case "E":
case "e":
case "c":
var d=_d75.getDay();
var _d85;
switch(l){
case 1:
case 2:
if(c=="e"){
var _d86=dojo.cldr.supplemental.getFirstDayOfWeek(options.locale);
d=(d-_d86+7)%7;
}
if(c!="c"){
s=d+1;
pad=true;
break;
}
case 3:
case 4:
case 5:
_d85=_d7e[l-3];
break;
}
if(_d85){
var _d87=(c=="c")?"standalone":"format";
var _d88=["days",_d87,_d85].join("-");
s=_d76[_d88][d];
}
break;
case "a":
var _d89=(_d75.getHours()<12)?"am":"pm";
s=_d76[_d89];
break;
case "h":
case "H":
case "K":
case "k":
var h=_d75.getHours();
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
s=_d75.getMinutes();
pad=true;
break;
case "s":
s=_d75.getSeconds();
pad=true;
break;
case "S":
s=Math.round(_d75.getMilliseconds()*Math.pow(10,l-3));
pad=true;
break;
case "v":
case "z":
s=dojo.date.getTimezoneName(_d75);
if(s){
break;
}
l=4;
case "Z":
var _d8b=_d75.getTimezoneOffset();
var tz=[(_d8b<=0?"+":"-"),dojo.string.pad(Math.floor(Math.abs(_d8b)/60),2),dojo.string.pad(Math.abs(_d8b)%60,2)];
if(l==4){
tz.splice(0,0,"GMT");
tz.splice(3,0,":");
}
s=tz.join("");
break;
default:
throw new Error("dojo.date.locale.format: invalid pattern char: "+_d78);
}
if(pad){
s=dojo.string.pad(s,l);
}
return s;
});
};
dojo.date.locale.format=function(_d8d,_d8e){
_d8e=_d8e||{};
var _d8f=dojo.i18n.normalizeLocale(_d8e.locale);
var _d90=_d8e.formatLength||"short";
var _d91=dojo.date.locale._getGregorianBundle(_d8f);
var str=[];
var _d93=dojo.hitch(this,formatPattern,_d8d,_d91,_d8e.fullYear);
if(_d8e.selector=="year"){
var year=_d8d.getFullYear();
if(_d8f.match(/^zh|^ja/)){
year+="年";
}
return year;
}
if(_d8e.selector!="time"){
var _d95=_d8e.datePattern||_d91["dateFormat-"+_d90];
if(_d95){
str.push(_processPattern(_d95,_d93));
}
}
if(_d8e.selector!="date"){
var _d96=_d8e.timePattern||_d91["timeFormat-"+_d90];
if(_d96){
str.push(_processPattern(_d96,_d93));
}
}
var _d97=str.join(" ");
return _d97;
};
dojo.date.locale.regexp=function(_d98){
return dojo.date.locale._parseInfo(_d98).regexp;
};
dojo.date.locale._parseInfo=function(_d99){
_d99=_d99||{};
var _d9a=dojo.i18n.normalizeLocale(_d99.locale);
var _d9b=dojo.date.locale._getGregorianBundle(_d9a);
var _d9c=_d99.formatLength||"short";
var _d9d=_d99.datePattern||_d9b["dateFormat-"+_d9c];
var _d9e=_d99.timePattern||_d9b["timeFormat-"+_d9c];
var _d9f;
if(_d99.selector=="date"){
_d9f=_d9d;
}else{
if(_d99.selector=="time"){
_d9f=_d9e;
}else{
_d9f=_d9d+" "+_d9e;
}
}
var _da0=[];
var re=_processPattern(_d9f,dojo.hitch(this,_buildDateTimeRE,_da0,_d9b,_d99));
return {regexp:re,tokens:_da0,bundle:_d9b};
};
dojo.date.locale.parse=function(_da2,_da3){
var info=dojo.date.locale._parseInfo(_da3);
var _da5=info.tokens,_da6=info.bundle;
var re=new RegExp("^"+info.regexp+"$");
var _da8=re.exec(_da2);
if(!_da8){
return null;
}
var _da9=["abbr","wide","narrow"];
var _daa=[1970,0,1,0,0,0,0];
var amPm="";
var _dac=dojo.every(_da8,function(v,i){
if(!i){
return true;
}
var _daf=_da5[i-1];
var l=_daf.length;
switch(_daf.charAt(0)){
case "y":
if(l!=2&&_da3.strict){
_daa[0]=v;
}else{
if(v<100){
v=Number(v);
var year=""+new Date().getFullYear();
var _db2=year.substring(0,2)*100;
var _db3=Math.min(Number(year.substring(2,4))+20,99);
var num=(v<_db3)?_db2+v:_db2-100+v;
_daa[0]=num;
}else{
if(_da3.strict){
return false;
}
_daa[0]=v;
}
}
break;
case "M":
if(l>2){
var _db5=_da6["months-format-"+_da9[l-3]].concat();
if(!_da3.strict){
v=v.replace(".","").toLowerCase();
_db5=dojo.map(_db5,function(s){
return s.replace(".","").toLowerCase();
});
}
v=dojo.indexOf(_db5,v);
if(v==-1){
return false;
}
}else{
v--;
}
_daa[1]=v;
break;
case "E":
case "e":
var days=_da6["days-format-"+_da9[l-3]].concat();
if(!_da3.strict){
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
_daa[1]=0;
case "d":
_daa[2]=v;
break;
case "a":
var am=_da3.am||_da6.am;
var pm=_da3.pm||_da6.pm;
if(!_da3.strict){
var _dbb=/\./g;
v=v.replace(_dbb,"").toLowerCase();
am=am.replace(_dbb,"").toLowerCase();
pm=pm.replace(_dbb,"").toLowerCase();
}
if(_da3.strict&&v!=am&&v!=pm){
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
_daa[3]=v;
break;
case "m":
_daa[4]=v;
break;
case "s":
_daa[5]=v;
break;
case "S":
_daa[6]=v;
}
return true;
});
var _dbc=+_daa[3];
if(amPm==="p"&&_dbc<12){
_daa[3]=_dbc+12;
}else{
if(amPm==="a"&&_dbc==12){
_daa[3]=0;
}
}
var _dbd=new Date(_daa[0],_daa[1],_daa[2],_daa[3],_daa[4],_daa[5],_daa[6]);
if(_da3.strict){
_dbd.setFullYear(_daa[0]);
}
var _dbe=_da5.join("");
if(!_dac||(_dbe.indexOf("M")!=-1&&_dbd.getMonth()!=_daa[1])||(_dbe.indexOf("d")!=-1&&_dbd.getDate()!=_daa[2])){
return null;
}
return _dbd;
};
function _processPattern(_dbf,_dc0,_dc1,_dc2){
var _dc3=function(x){
return x;
};
_dc0=_dc0||_dc3;
_dc1=_dc1||_dc3;
_dc2=_dc2||_dc3;
var _dc5=_dbf.match(/(''|[^'])+/g);
var _dc6=false;
dojo.forEach(_dc5,function(_dc7,i){
if(!_dc7){
_dc5[i]="";
}else{
_dc5[i]=(_dc6?_dc1:_dc0)(_dc7);
_dc6=!_dc6;
}
});
return _dc2(_dc5.join(""));
};
function _buildDateTimeRE(_dc9,_dca,_dcb,_dcc){
_dcc=dojo.regexp.escapeString(_dcc);
if(!_dcb.strict){
_dcc=_dcc.replace(" a"," ?a");
}
return _dcc.replace(/([a-z])\1*/ig,function(_dcd){
var s;
var c=_dcd.charAt(0);
var l=_dcd.length;
var p2="",p3="";
if(_dcb.strict){
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
s=(l>2)?"\\S+":p2+"[1-9]|1[0-2]";
break;
case "D":
s=p2+"[1-9]|"+p3+"[1-9][0-9]|[12][0-9][0-9]|3[0-5][0-9]|36[0-6]";
break;
case "d":
s=p2+"[1-9]|[12]\\d|3[01]";
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
var am=_dcb.am||_dca.am||"AM";
var pm=_dcb.pm||_dca.pm||"PM";
if(_dcb.strict){
s=am+"|"+pm;
}else{
s=am+"|"+pm;
if(am!=am.toLowerCase()){
s+="|"+am.toLowerCase();
}
if(pm!=pm.toLowerCase()){
s+="|"+pm.toLowerCase();
}
}
break;
default:
s=".*";
}
if(_dc9){
_dc9.push(_dcd);
}
return "("+s+")";
}).replace(/[\xa0 ]/g,"[\\s\\xa0]");
};
})();
(function(){
var _dd5=[];
dojo.date.locale.addCustomFormats=function(_dd6,_dd7){
_dd5.push({pkg:_dd6,name:_dd7});
};
dojo.date.locale._getGregorianBundle=function(_dd8){
var _dd9={};
dojo.forEach(_dd5,function(desc){
var _ddb=dojo.i18n.getLocalization(desc.pkg,desc.name,_dd8);
_dd9=dojo.mixin(_dd9,_ddb);
},this);
return _dd9;
};
})();
dojo.date.locale.addCustomFormats("dojo.cldr","gregorian");
dojo.date.locale.getNames=function(item,type,use,_ddf){
var _de0;
var _de1=dojo.date.locale._getGregorianBundle(_ddf);
var _de2=[item,use,type];
if(use=="standAlone"){
_de0=_de1[_de2.join("-")];
}
_de2[1]="format";
return (_de0||_de1[_de2.join("-")]).concat();
};
dojo.date.locale.isWeekend=function(_de3,_de4){
var _de5=dojo.cldr.supplemental.getWeekend(_de4);
var day=(_de3||new Date()).getDay();
if(_de5.end<_de5.start){
_de5.end+=7;
if(day<_de5.start){
day+=7;
}
}
return day>=_de5.start&&day<=_de5.end;
};
dojo.date.locale._getDayOfYear=function(_de7){
return dojo.date.difference(new Date(_de7.getFullYear(),0,1),_de7)+1;
};
dojo.date.locale._getWeekOfYear=function(_de8,_de9){
if(arguments.length==1){
_de9=0;
}
var _dea=new Date(_de8.getFullYear(),0,1).getDay();
var adj=(_dea-_de9+7)%7;
var week=Math.floor((dojo.date.locale._getDayOfYear(_de8)+adj-1)/7);
if(_dea==_de9){
week++;
}
return week;
};
}
if(!dojo._hasResource["dijit._Calendar"]){
dojo._hasResource["dijit._Calendar"]=true;
dojo.provide("dijit._Calendar");
dojo.declare("dijit._Calendar",[dijit._Widget,dijit._Templated],{templateString:"<table cellspacing=\"0\" cellpadding=\"0\" class=\"dijitCalendarContainer\">\r\n\t<thead>\r\n\t\t<tr class=\"dijitReset dijitCalendarMonthContainer\" valign=\"top\">\r\n\t\t\t<th class='dijitReset' dojoAttachPoint=\"decrementMonth\">\r\n\t\t\t\t<div class=\"dijitInline dijitCalendarIncrementControl dijitCalendarDecrease\"><span dojoAttachPoint=\"decreaseArrowNode\" class=\"dijitA11ySideArrow dijitCalendarIncrementControl dijitCalendarDecreaseInner\">-</span></div>\r\n\t\t\t</th>\r\n\t\t\t<th class='dijitReset' colspan=\"5\">\r\n\t\t\t\t<div dojoAttachPoint=\"monthLabelSpacer\" class=\"dijitCalendarMonthLabelSpacer\"></div>\r\n\t\t\t\t<div dojoAttachPoint=\"monthLabelNode\" class=\"dijitCalendarMonthLabel\"></div>\r\n\t\t\t</th>\r\n\t\t\t<th class='dijitReset' dojoAttachPoint=\"incrementMonth\">\r\n\t\t\t\t<div class=\"dijitInline dijitCalendarIncrementControl dijitCalendarIncrease\"><span dojoAttachPoint=\"increaseArrowNode\" class=\"dijitA11ySideArrow dijitCalendarIncrementControl dijitCalendarIncreaseInner\">+</span></div>\r\n\t\t\t</th>\r\n\t\t</tr>\r\n\t\t<tr>\r\n\t\t\t<th class=\"dijitReset dijitCalendarDayLabelTemplate\"><span class=\"dijitCalendarDayLabel\"></span></th>\r\n\t\t</tr>\r\n\t</thead>\r\n\t<tbody dojoAttachEvent=\"onclick: _onDayClick\" class=\"dijitReset dijitCalendarBodyContainer\">\r\n\t\t<tr class=\"dijitReset dijitCalendarWeekTemplate\">\r\n\t\t\t<td class=\"dijitReset dijitCalendarDateTemplate\"><span class=\"dijitCalendarDateLabel\"></span></td>\r\n\t\t</tr>\r\n\t</tbody>\r\n\t<tfoot class=\"dijitReset dijitCalendarYearContainer\">\r\n\t\t<tr>\r\n\t\t\t<td class='dijitReset' valign=\"top\" colspan=\"7\">\r\n\t\t\t\t<h3 class=\"dijitCalendarYearLabel\">\r\n\t\t\t\t\t<span dojoAttachPoint=\"previousYearLabelNode\" class=\"dijitInline dijitCalendarPreviousYear\"></span>\r\n\t\t\t\t\t<span dojoAttachPoint=\"currentYearLabelNode\" class=\"dijitInline dijitCalendarSelectedYear\"></span>\r\n\t\t\t\t\t<span dojoAttachPoint=\"nextYearLabelNode\" class=\"dijitInline dijitCalendarNextYear\"></span>\r\n\t\t\t\t</h3>\r\n\t\t\t</td>\r\n\t\t</tr>\r\n\t</tfoot>\r\n</table>\t\r\n",value:new Date(),dayWidth:"narrow",setValue:function(_ded){
if(!this.value||dojo.date.compare(_ded,this.value)){
_ded=new Date(_ded);
this.displayMonth=new Date(_ded);
if(!this.isDisabledDate(_ded,this.lang)){
this.value=_ded;
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
var _df0=this.displayMonth;
_df0.setDate(1);
var _df1=_df0.getDay();
var _df2=dojo.date.getDaysInMonth(_df0);
var _df3=dojo.date.getDaysInMonth(dojo.date.add(_df0,"month",-1));
var _df4=new Date();
var _df5=this.value;
var _df6=dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
if(_df6>_df1){
_df6-=7;
}
dojo.query(".dijitCalendarDateTemplate",this.domNode).forEach(function(_df7,i){
i+=_df6;
var date=new Date(_df0);
var _dfa,_dfb="dijitCalendar",adj=0;
if(i<_df1){
_dfa=_df3-_df1+i+1;
adj=-1;
_dfb+="Previous";
}else{
if(i>=(_df1+_df2)){
_dfa=i-_df1-_df2+1;
adj=1;
_dfb+="Next";
}else{
_dfa=i-_df1+1;
_dfb+="Current";
}
}
if(adj){
date=dojo.date.add(date,"month",adj);
}
date.setDate(_dfa);
if(!dojo.date.compare(date,_df4,"date")){
_dfb="dijitCalendarCurrentDate "+_dfb;
}
if(!dojo.date.compare(date,_df5,"date")){
_dfb="dijitCalendarSelectedDate "+_dfb;
}
if(this.isDisabledDate(date,this.lang)){
_dfb="dijitCalendarDisabledDate "+_dfb;
}
var _dfd=this.getClassForDate(date,this.lang);
if(_dfd){
_dfb+=_dfd+" "+_dfb;
}
_df7.className=_dfb+"Month dijitCalendarDateTemplate";
_df7.dijitDateValue=date.valueOf();
var _dfe=dojo.query(".dijitCalendarDateLabel",_df7)[0];
this._setText(_dfe,date.getDate());
},this);
var _dff=dojo.date.locale.getNames("months","wide","standAlone",this.lang);
this._setText(this.monthLabelNode,_dff[_df0.getMonth()]);
var y=_df0.getFullYear()-1;
var d=new Date();
dojo.forEach(["previous","current","next"],function(name){
d.setFullYear(y++);
this._setText(this[name+"YearLabelNode"],dojo.date.locale.format(d,{selector:"year",locale:this.lang}));
},this);
var _e03=this;
var _e04=function(_e05,_e06,adj){
dijit.typematic.addMouseListener(_e03[_e05],_e03,function(_e08){
if(_e08>=0){
_e03._adjustDisplay(_e06,adj);
}
},0.8,500);
};
_e04("incrementMonth","month",1);
_e04("decrementMonth","month",-1);
_e04("nextYearLabelNode","year",1);
_e04("previousYearLabelNode","year",-1);
},goToToday:function(){
this.setValue(new Date());
},postCreate:function(){
this.inherited(arguments);
var _e09=dojo.hitch(this,function(_e0a,n){
var _e0c=dojo.query(_e0a,this.domNode)[0];
for(var i=0;i<n;i++){
_e0c.parentNode.appendChild(_e0c.cloneNode(true));
}
});
_e09(".dijitCalendarDayLabelTemplate",6);
_e09(".dijitCalendarDateTemplate",6);
_e09(".dijitCalendarWeekTemplate",5);
var _e0e=dojo.date.locale.getNames("days",this.dayWidth,"standAlone",this.lang);
var _e0f=dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
dojo.query(".dijitCalendarDayLabel",this.domNode).forEach(function(_e10,i){
this._setText(_e10,_e0e[(i+_e0f)%7]);
},this);
var _e12=dojo.date.locale.getNames("months","wide","standAlone",this.lang);
dojo.forEach(_e12,function(name){
var _e14=dojo.doc.createElement("div");
this._setText(_e14,name);
this.monthLabelSpacer.appendChild(_e14);
},this);
this.value=null;
this.setValue(new Date());
},_adjustDisplay:function(part,_e16){
this.displayMonth=dojo.date.add(this.displayMonth,part,_e16);
this._populateGrid();
},_onDayClick:function(evt){
var node=evt.target;
dojo.stopEvent(evt);
while(!node.dijitDateValue){
node=node.parentNode;
}
if(!dojo.hasClass(node,"dijitCalendarDisabledDate")){
this.setValue(node.dijitDateValue);
this.onValueSelected(this.value);
}
},onValueSelected:function(date){
},onChange:function(date){
},isDisabledDate:function(_e1b,_e1c){
},getClassForDate:function(_e1d,_e1e){
}});
}
if(!dojo._hasResource["dijit.form._DateTimeTextBox"]){
dojo._hasResource["dijit.form._DateTimeTextBox"]=true;
dojo.provide("dijit.form._DateTimeTextBox");
dojo.declare("dijit.form._DateTimeTextBox",dijit.form.RangeBoundTextBox,{regExpGen:dojo.date.locale.regexp,compare:dojo.date.compare,format:function(_e1f,_e20){
if(!_e1f){
return "";
}
return dojo.date.locale.format(_e1f,_e20);
},parse:function(_e21,_e22){
return dojo.date.locale.parse(_e21,_e22)||undefined;
},serialize:dojo.date.stamp.toISOString,value:new Date(""),popupClass:"",_selector:"",postMixInProperties:function(){
this.inherited(arguments);
if(!this.value||this.value.toString()==dijit.form._DateTimeTextBox.prototype.value.toString()){
this.value=undefined;
}
var _e23=this.constraints;
_e23.selector=this._selector;
_e23.fullYear=true;
var _e24=dojo.date.stamp.fromISOString;
if(typeof _e23.min=="string"){
_e23.min=_e24(_e23.min);
}
if(typeof _e23.max=="string"){
_e23.max=_e24(_e23.max);
}
},_onFocus:function(evt){
this._open();
},setValue:function(_e26,_e27,_e28){
this.inherited(arguments);
if(this._picker){
if(!_e26){
_e26=new Date();
}
this._picker.setValue(_e26);
}
},_open:function(){
if(this.disabled||this.readOnly||!this.popupClass){
return;
}
var _e29=this;
if(!this._picker){
var _e2a=dojo.getObject(this.popupClass,false);
this._picker=new _e2a({onValueSelected:function(_e2b){
_e29.focus();
setTimeout(dojo.hitch(_e29,"_close"),1);
dijit.form._DateTimeTextBox.superclass.setValue.call(_e29,_e2b,true);
},lang:_e29.lang,constraints:_e29.constraints,isDisabledDate:function(date){
var _e2d=dojo.date.compare;
var _e2e=_e29.constraints;
return _e2e&&(_e2e.min&&(_e2d(_e2e.min,date,"date")>0)||(_e2e.max&&_e2d(_e2e.max,date,"date")<0));
}});
this._picker.setValue(this.getValue()||new Date());
}
if(!this._opened){
dijit.popup.open({parent:this,popup:this._picker,around:this.domNode,onCancel:dojo.hitch(this,this._close),onClose:function(){
_e29._opened=false;
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
},getDisplayedValue:function(){
return this.textbox.value;
},setDisplayedValue:function(_e2f,_e30){
this.setValue(this.parse(_e2f,this.constraints),_e30,_e2f);
},destroy:function(){
if(this._picker){
this._picker.destroy();
delete this._picker;
}
this.inherited(arguments);
},_onKeyPress:function(e){
if(dijit.form._DateTimeTextBox.superclass._onKeyPress.apply(this,arguments)){
if(this._opened&&e.keyCode==dojo.keys.ESCAPE&&!e.shiftKey&&!e.ctrlKey&&!e.altKey){
this._close();
dojo.stopEvent(e);
}
}
}});
}
if(!dojo._hasResource["dijit.form.DateTextBox"]){
dojo._hasResource["dijit.form.DateTextBox"]=true;
dojo.provide("dijit.form.DateTextBox");
dojo.declare("dijit.form.DateTextBox",dijit.form._DateTimeTextBox,{popupClass:"dijit._Calendar",_selector:"date"});
}
if(!dojo._hasResource["dijit._TimePicker"]){
dojo._hasResource["dijit._TimePicker"]=true;
dojo.provide("dijit._TimePicker");
dojo.declare("dijit._TimePicker",[dijit._Widget,dijit._Templated],{templateString:"<div id=\"widget_${id}\" class=\"dijitMenu\"\r\n    ><div dojoAttachPoint=\"upArrow\" class=\"dijitButtonNode\"><span class=\"dijitTimePickerA11yText\">&#9650;</span></div\r\n    ><div dojoAttachPoint=\"timeMenu,focusNode\" dojoAttachEvent=\"onclick:_onOptionSelected,onmouseover,onmouseout\"></div\r\n    ><div dojoAttachPoint=\"downArrow\" class=\"dijitButtonNode\"><span class=\"dijitTimePickerA11yText\">&#9660;</span></div\r\n></div>\r\n",baseClass:"dijitTimePicker",clickableIncrement:"T00:15:00",visibleIncrement:"T01:00:00",visibleRange:"T05:00:00",value:new Date(),_visibleIncrement:2,_clickableIncrement:1,_totalIncrements:10,constraints:{},serialize:dojo.date.stamp.toISOString,setValue:function(date,_e33){
this.value=date;
this._showText();
},isDisabledDate:function(_e34,_e35){
return false;
},_showText:function(){
this.timeMenu.innerHTML="";
var _e36=dojo.date.stamp.fromISOString;
this._clickableIncrementDate=_e36(this.clickableIncrement);
this._visibleIncrementDate=_e36(this.visibleIncrement);
this._visibleRangeDate=_e36(this.visibleRange);
var _e37=function(date){
return date.getHours()*60*60+date.getMinutes()*60+date.getSeconds();
};
var _e39=_e37(this._clickableIncrementDate);
var _e3a=_e37(this._visibleIncrementDate);
var _e3b=_e37(this._visibleRangeDate);
var time=this.value.getTime();
this._refDate=new Date(time-time%(_e3a*1000));
this._refDate.setFullYear(1970,0,1);
this._clickableIncrement=1;
this._totalIncrements=_e3b/_e39;
this._visibleIncrement=_e3a/_e39;
for(var i=-(this._totalIncrements>>1);i<(this._totalIncrements>>1);i+=this._clickableIncrement){
this.timeMenu.appendChild(this._createOption(i));
}
},postCreate:function(){
if(this.constraints===dijit._TimePicker.prototype.constraints){
this.constraints={};
}
dojo.mixin(this,this.constraints);
if(!this.constraints.locale){
this.constraints.locale=this.lang;
}
this.connect(this.timeMenu,dojo.isIE?"onmousewheel":"DOMMouseScroll","_mouseWheeled");
var _e3e=dijit.typematic.addMouseListener;
_e3e(this.upArrow,this,this._onArrowUp,0.8,500);
_e3e(this.downArrow,this,this._onArrowDown,0.8,500);
this.inherited(arguments);
this.setValue(this.value);
},_createOption:function(_e3f){
var div=dojo.doc.createElement("div");
var date=(div.date=new Date(this._refDate));
div.index=_e3f;
var _e42=this._clickableIncrementDate;
date.setHours(date.getHours()+_e42.getHours()*_e3f,date.getMinutes()+_e42.getMinutes()*_e3f,date.getSeconds()+_e42.getSeconds()*_e3f);
var _e43=dojo.doc.createElement("div");
dojo.addClass(div,this.baseClass+"Item");
dojo.addClass(_e43,this.baseClass+"ItemInner");
_e43.innerHTML=dojo.date.locale.format(date,this.constraints);
div.appendChild(_e43);
if(_e3f%this._visibleIncrement<1&&_e3f%this._visibleIncrement>-1){
dojo.addClass(div,this.baseClass+"Marker");
}else{
if(!(_e3f%this._clickableIncrement)){
dojo.addClass(div,this.baseClass+"Tick");
}
}
if(this.isDisabledDate(date)){
dojo.addClass(div,this.baseClass+"ItemDisabled");
}
if(!dojo.date.compare(this.value,date,this.constraints.selector)){
div.selected=true;
dojo.addClass(div,this.baseClass+"ItemSelected");
}
return div;
},_onOptionSelected:function(tgt){
var _e45=tgt.target.date||tgt.target.parentNode.date;
if(!_e45||this.isDisabledDate(_e45)){
return;
}
this.setValue(_e45);
this.onValueSelected(_e45);
},onValueSelected:function(_e46){
},onmouseover:function(e){
var tgr=(e.target.parentNode===this.timeMenu)?e.target:e.target.parentNode;
this._highlighted_option=tgr;
dojo.addClass(tgr,this.baseClass+"ItemHover");
},onmouseout:function(e){
var tgr=(e.target.parentNode===this.timeMenu)?e.target:e.target.parentNode;
if(this._highlighted_option===tgr){
dojo.removeClass(tgr,this.baseClass+"ItemHover");
}
},_mouseWheeled:function(e){
dojo.stopEvent(e);
var _e4c=(dojo.isIE?e.wheelDelta:-e.detail);
this[(_e4c>0?"_onArrowUp":"_onArrowDown")]();
},_onArrowUp:function(){
var _e4d=this.timeMenu.childNodes[0].index-1;
var div=this._createOption(_e4d);
this.timeMenu.removeChild(this.timeMenu.childNodes[this.timeMenu.childNodes.length-1]);
this.timeMenu.insertBefore(div,this.timeMenu.childNodes[0]);
},_onArrowDown:function(){
var _e4f=this.timeMenu.childNodes[this.timeMenu.childNodes.length-1].index+1;
var div=this._createOption(_e4f);
this.timeMenu.removeChild(this.timeMenu.childNodes[0]);
this.timeMenu.appendChild(div);
}});
}
if(!dojo._hasResource["dijit.form.TimeTextBox"]){
dojo._hasResource["dijit.form.TimeTextBox"]=true;
dojo.provide("dijit.form.TimeTextBox");
dojo.declare("dijit.form.TimeTextBox",dijit.form._DateTimeTextBox,{popupClass:"dijit._TimePicker",_selector:"time"});
}
if(!dojo._hasResource["dijit.form._Spinner"]){
dojo._hasResource["dijit.form._Spinner"]=true;
dojo.provide("dijit.form._Spinner");
dojo.declare("dijit.form._Spinner",dijit.form.RangeBoundTextBox,{defaultTimeout:500,timeoutChangeRate:0.9,smallDelta:1,largeDelta:10,templateString:"<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\r\n\tid=\"widget_${id}\"\r\n\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\" waiRole=\"presentation\"\r\n\t><div class=\"dijitInputLayoutContainer\"\r\n\t\t><div class=\"dijitReset dijitSpinnerButtonContainer\"\r\n\t\t\t>&nbsp;<div class=\"dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitUpArrowButton\"\r\n\t\t\t\tdojoAttachPoint=\"upArrowNode\"\r\n\t\t\t\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse\"\r\n\t\t\t\tstateModifier=\"UpArrow\"\r\n\t\t\t\t><div class=\"dijitArrowButtonInner\">&thinsp;</div\r\n\t\t\t\t><div class=\"dijitArrowButtonChar\">&#9650;</div\r\n\t\t\t></div\r\n\t\t\t><div class=\"dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitDownArrowButton\"\r\n\t\t\t\tdojoAttachPoint=\"downArrowNode\"\r\n\t\t\t\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse\"\r\n\t\t\t\tstateModifier=\"DownArrow\"\r\n\t\t\t\t><div class=\"dijitArrowButtonInner\">&thinsp;</div\r\n\t\t\t\t><div class=\"dijitArrowButtonChar\">&#9660;</div\r\n\t\t\t></div\r\n\t\t></div\r\n\t\t><div class=\"dijitReset dijitValidationIcon\"><br></div\r\n\t\t><div class=\"dijitReset dijitValidationIconText\">&Chi;</div\r\n\t\t><div class=\"dijitReset dijitInputField\"\r\n\t\t\t><input class='dijitReset' dojoAttachPoint=\"textbox,focusNode\" type=\"${type}\" dojoAttachEvent=\"onfocus:_update,onkeyup:_onkeyup,onkeypress:_onKeyPress\"\r\n\t\t\t\twaiRole=\"spinbutton\" autocomplete=\"off\" name=\"${name}\"\r\n\t\t/></div\r\n\t></div\r\n></div>\r\n",baseClass:"dijitSpinner",adjust:function(val,_e52){
return val;
},_arrowState:function(node,_e54){
this._active=_e54;
this.stateModifier=node.getAttribute("stateModifier")||"";
this._setStateClass();
},_arrowPressed:function(_e55,_e56){
if(this.disabled||this.readOnly){
return;
}
this._arrowState(_e55,true);
this.setValue(this.adjust(this.getValue(),_e56*this.smallDelta),false);
dijit.selectInputText(this.textbox,this.textbox.value.length);
},_arrowReleased:function(node){
this._wheelTimer=null;
if(this.disabled||this.readOnly){
return;
}
this._arrowState(node,false);
},_typematicCallback:function(_e58,node,evt){
if(node==this.textbox){
node=(evt.keyCode==dojo.keys.UP_ARROW)?this.upArrowNode:this.downArrowNode;
}
if(_e58==-1){
this._arrowReleased(node);
}else{
this._arrowPressed(node,(node==this.upArrowNode)?1:-1);
}
},_wheelTimer:null,_mouseWheeled:function(evt){
dojo.stopEvent(evt);
var _e5c=0;
if(typeof evt.wheelDelta=="number"){
_e5c=evt.wheelDelta;
}else{
if(typeof evt.detail=="number"){
_e5c=-evt.detail;
}
}
var node,dir;
if(_e5c>0){
node=this.upArrowNode;
dir=+1;
}else{
if(_e5c<0){
node=this.downArrowNode;
dir=-1;
}else{
return;
}
}
this._arrowPressed(node,dir);
if(this._wheelTimer!=null){
clearTimeout(this._wheelTimer);
}
var _e5f=this;
this._wheelTimer=setTimeout(function(){
_e5f._arrowReleased(node);
},50);
},postCreate:function(){
this.inherited("postCreate",arguments);
this.connect(this.textbox,dojo.isIE?"onmousewheel":"DOMMouseScroll","_mouseWheeled");
this._connects.push(dijit.typematic.addListener(this.upArrowNode,this.textbox,{keyCode:dojo.keys.UP_ARROW,ctrlKey:false,altKey:false,shiftKey:false},this,"_typematicCallback",this.timeoutChangeRate,this.defaultTimeout));
this._connects.push(dijit.typematic.addListener(this.downArrowNode,this.textbox,{keyCode:dojo.keys.DOWN_ARROW,ctrlKey:false,altKey:false,shiftKey:false},this,"_typematicCallback",this.timeoutChangeRate,this.defaultTimeout));
if(dojo.isIE){
var _e60=this;
this.connect(this.domNode,"onresize",function(){
setTimeout(dojo.hitch(_e60,function(){
this.upArrowNode.style.behavior="";
this.downArrowNode.style.behavior="";
this._setStateClass();
}),0);
});
}
}});
}
if(!dojo._hasResource["dojo.number"]){
dojo._hasResource["dojo.number"]=true;
dojo.provide("dojo.number");
dojo.number.format=function(_e61,_e62){
_e62=dojo.mixin({},_e62||{});
var _e63=dojo.i18n.normalizeLocale(_e62.locale);
var _e64=dojo.i18n.getLocalization("dojo.cldr","number",_e63);
_e62.customs=_e64;
var _e65=_e62.pattern||_e64[(_e62.type||"decimal")+"Format"];
if(isNaN(_e61)){
return null;
}
return dojo.number._applyPattern(_e61,_e65,_e62);
};
dojo.number._numberPatternRE=/[#0,]*[#0](?:\.0*#*)?/;
dojo.number._applyPattern=function(_e66,_e67,_e68){
_e68=_e68||{};
var _e69=_e68.customs.group;
var _e6a=_e68.customs.decimal;
var _e6b=_e67.split(";");
var _e6c=_e6b[0];
_e67=_e6b[(_e66<0)?1:0]||("-"+_e6c);
if(_e67.indexOf("%")!=-1){
_e66*=100;
}else{
if(_e67.indexOf("‰")!=-1){
_e66*=1000;
}else{
if(_e67.indexOf("¤")!=-1){
_e69=_e68.customs.currencyGroup||_e69;
_e6a=_e68.customs.currencyDecimal||_e6a;
_e67=_e67.replace(/\u00a4{1,3}/,function(_e6d){
var prop=["symbol","currency","displayName"][_e6d.length-1];
return _e68[prop]||_e68.currency||"";
});
}else{
if(_e67.indexOf("E")!=-1){
throw new Error("exponential notation not supported");
}
}
}
}
var _e6f=dojo.number._numberPatternRE;
var _e70=_e6c.match(_e6f);
if(!_e70){
throw new Error("unable to find a number expression in pattern: "+_e67);
}
return _e67.replace(_e6f,dojo.number._formatAbsolute(_e66,_e70[0],{decimal:_e6a,group:_e69,places:_e68.places}));
};
dojo.number.round=function(_e71,_e72,_e73){
var _e74=String(_e71).split(".");
var _e75=(_e74[1]&&_e74[1].length)||0;
if(_e75>_e72){
var _e76=Math.pow(10,_e72);
if(_e73>0){
_e76*=10/_e73;
_e72++;
}
_e71=Math.round(_e71*_e76)/_e76;
_e74=String(_e71).split(".");
_e75=(_e74[1]&&_e74[1].length)||0;
if(_e75>_e72){
_e74[1]=_e74[1].substr(0,_e72);
_e71=Number(_e74.join("."));
}
}
return _e71;
};
dojo.number._formatAbsolute=function(_e77,_e78,_e79){
_e79=_e79||{};
if(_e79.places===true){
_e79.places=0;
}
if(_e79.places===Infinity){
_e79.places=6;
}
var _e7a=_e78.split(".");
var _e7b=(_e79.places>=0)?_e79.places:(_e7a[1]&&_e7a[1].length)||0;
if(!(_e79.round<0)){
_e77=dojo.number.round(_e77,_e7b,_e79.round);
}
var _e7c=String(Math.abs(_e77)).split(".");
var _e7d=_e7c[1]||"";
if(_e79.places){
_e7c[1]=dojo.string.pad(_e7d.substr(0,_e79.places),_e79.places,"0",true);
}else{
if(_e7a[1]&&_e79.places!==0){
var pad=_e7a[1].lastIndexOf("0")+1;
if(pad>_e7d.length){
_e7c[1]=dojo.string.pad(_e7d,pad,"0",true);
}
var _e7f=_e7a[1].length;
if(_e7f<_e7d.length){
_e7c[1]=_e7d.substr(0,_e7f);
}
}else{
if(_e7c[1]){
_e7c.pop();
}
}
}
var _e80=_e7a[0].replace(",","");
pad=_e80.indexOf("0");
if(pad!=-1){
pad=_e80.length-pad;
if(pad>_e7c[0].length){
_e7c[0]=dojo.string.pad(_e7c[0],pad);
}
if(_e80.indexOf("#")==-1){
_e7c[0]=_e7c[0].substr(_e7c[0].length-pad);
}
}
var _e81=_e7a[0].lastIndexOf(",");
var _e82,_e83;
if(_e81!=-1){
_e82=_e7a[0].length-_e81-1;
var _e84=_e7a[0].substr(0,_e81);
_e81=_e84.lastIndexOf(",");
if(_e81!=-1){
_e83=_e84.length-_e81-1;
}
}
var _e85=[];
for(var _e86=_e7c[0];_e86;){
var off=_e86.length-_e82;
_e85.push((off>0)?_e86.substr(off):_e86);
_e86=(off>0)?_e86.slice(0,off):"";
if(_e83){
_e82=_e83;
delete _e83;
}
}
_e7c[0]=_e85.reverse().join(_e79.group||",");
return _e7c.join(_e79.decimal||".");
};
dojo.number.regexp=function(_e88){
return dojo.number._parseInfo(_e88).regexp;
};
dojo.number._parseInfo=function(_e89){
_e89=_e89||{};
var _e8a=dojo.i18n.normalizeLocale(_e89.locale);
var _e8b=dojo.i18n.getLocalization("dojo.cldr","number",_e8a);
var _e8c=_e89.pattern||_e8b[(_e89.type||"decimal")+"Format"];
var _e8d=_e8b.group;
var _e8e=_e8b.decimal;
var _e8f=1;
if(_e8c.indexOf("%")!=-1){
_e8f/=100;
}else{
if(_e8c.indexOf("‰")!=-1){
_e8f/=1000;
}else{
var _e90=_e8c.indexOf("¤")!=-1;
if(_e90){
_e8d=_e8b.currencyGroup||_e8d;
_e8e=_e8b.currencyDecimal||_e8e;
}
}
}
var _e91=_e8c.split(";");
if(_e91.length==1){
_e91.push("-"+_e91[0]);
}
var re=dojo.regexp.buildGroupRE(_e91,function(_e93){
_e93="(?:"+dojo.regexp.escapeString(_e93,".")+")";
return _e93.replace(dojo.number._numberPatternRE,function(_e94){
var _e95={signed:false,separator:_e89.strict?_e8d:[_e8d,""],fractional:_e89.fractional,decimal:_e8e,exponent:false};
var _e96=_e94.split(".");
var _e97=_e89.places;
if(_e96.length==1||_e97===0){
_e95.fractional=false;
}else{
if(_e97===undefined){
_e97=_e96[1].lastIndexOf("0")+1;
}
if(_e97&&_e89.fractional==undefined){
_e95.fractional=true;
}
if(!_e89.places&&(_e97<_e96[1].length)){
_e97+=","+_e96[1].length;
}
_e95.places=_e97;
}
var _e98=_e96[0].split(",");
if(_e98.length>1){
_e95.groupSize=_e98.pop().length;
if(_e98.length>1){
_e95.groupSize2=_e98.pop().length;
}
}
return "("+dojo.number._realNumberRegexp(_e95)+")";
});
},true);
if(_e90){
re=re.replace(/(\s*)(\u00a4{1,3})(\s*)/g,function(_e99,_e9a,_e9b,_e9c){
var prop=["symbol","currency","displayName"][_e9b.length-1];
var _e9e=dojo.regexp.escapeString(_e89[prop]||_e89.currency||"");
_e9a=_e9a?"\\s":"";
_e9c=_e9c?"\\s":"";
if(!_e89.strict){
if(_e9a){
_e9a+="*";
}
if(_e9c){
_e9c+="*";
}
return "(?:"+_e9a+_e9e+_e9c+")?";
}
return _e9a+_e9e+_e9c;
});
}
return {regexp:re.replace(/[\xa0 ]/g,"[\\s\\xa0]"),group:_e8d,decimal:_e8e,factor:_e8f};
};
dojo.number.parse=function(_e9f,_ea0){
var info=dojo.number._parseInfo(_ea0);
var _ea2=(new RegExp("^"+info.regexp+"$")).exec(_e9f);
if(!_ea2){
return NaN;
}
var _ea3=_ea2[1];
if(!_ea2[1]){
if(!_ea2[2]){
return NaN;
}
_ea3=_ea2[2];
info.factor*=-1;
}
_ea3=_ea3.replace(new RegExp("["+info.group+"\\s\\xa0"+"]","g"),"").replace(info.decimal,".");
return Number(_ea3)*info.factor;
};
dojo.number._realNumberRegexp=function(_ea4){
_ea4=_ea4||{};
if(!("places" in _ea4)){
_ea4.places=Infinity;
}
if(typeof _ea4.decimal!="string"){
_ea4.decimal=".";
}
if(!("fractional" in _ea4)||/^0/.test(_ea4.places)){
_ea4.fractional=[true,false];
}
if(!("exponent" in _ea4)){
_ea4.exponent=[true,false];
}
if(!("eSigned" in _ea4)){
_ea4.eSigned=[true,false];
}
var _ea5=dojo.number._integerRegexp(_ea4);
var _ea6=dojo.regexp.buildGroupRE(_ea4.fractional,function(q){
var re="";
if(q&&(_ea4.places!==0)){
re="\\"+_ea4.decimal;
if(_ea4.places==Infinity){
re="(?:"+re+"\\d+)?";
}else{
re+="\\d{"+_ea4.places+"}";
}
}
return re;
},true);
var _ea9=dojo.regexp.buildGroupRE(_ea4.exponent,function(q){
if(q){
return "([eE]"+dojo.number._integerRegexp({signed:_ea4.eSigned})+")";
}
return "";
});
var _eab=_ea5+_ea6;
if(_ea6){
_eab="(?:(?:"+_eab+")|(?:"+_ea6+"))";
}
return _eab+_ea9;
};
dojo.number._integerRegexp=function(_eac){
_eac=_eac||{};
if(!("signed" in _eac)){
_eac.signed=[true,false];
}
if(!("separator" in _eac)){
_eac.separator="";
}else{
if(!("groupSize" in _eac)){
_eac.groupSize=3;
}
}
var _ead=dojo.regexp.buildGroupRE(_eac.signed,function(q){
return q?"[-+]":"";
},true);
var _eaf=dojo.regexp.buildGroupRE(_eac.separator,function(sep){
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
var grp=_eac.groupSize,grp2=_eac.groupSize2;
if(grp2){
var _eb3="(?:0|[1-9]\\d{0,"+(grp2-1)+"}(?:["+sep+"]\\d{"+grp2+"})*["+sep+"]\\d{"+grp+"})";
return ((grp-grp2)>0)?"(?:"+_eb3+"|(?:0|[1-9]\\d{0,"+(grp-1)+"}))":_eb3;
}
return "(?:0|[1-9]\\d{0,"+(grp-1)+"}(?:["+sep+"]\\d{"+grp+"})*)";
},true);
return _ead+_eaf;
};
}
if(!dojo._hasResource["dijit.form.NumberTextBox"]){
dojo._hasResource["dijit.form.NumberTextBox"]=true;
dojo.provide("dijit.form.NumberTextBox");
dojo.declare("dijit.form.NumberTextBoxMixin",null,{regExpGen:dojo.number.regexp,editOptions:{pattern:"#.######"},_onFocus:function(){
this.setValue(this.getValue(),false);
this.inherited(arguments);
},_formatter:dojo.number.format,format:function(_eb4,_eb5){
if(typeof _eb4=="string"){
return _eb4;
}
if(isNaN(_eb4)){
return "";
}
if(this.editOptions&&this._focused){
_eb5=dojo.mixin(dojo.mixin({},this.editOptions),this.constraints);
}
return this._formatter(_eb4,_eb5);
},parse:dojo.number.parse,filter:function(_eb6){
if(typeof _eb6=="string"){
return this.inherited("filter",arguments);
}
return isNaN(_eb6)?"":_eb6;
},value:NaN});
dojo.declare("dijit.form.NumberTextBox",[dijit.form.RangeBoundTextBox,dijit.form.NumberTextBoxMixin],{});
}
if(!dojo._hasResource["dijit.form.NumberSpinner"]){
dojo._hasResource["dijit.form.NumberSpinner"]=true;
dojo.provide("dijit.form.NumberSpinner");
dojo.declare("dijit.form.NumberSpinner",[dijit.form._Spinner,dijit.form.NumberTextBoxMixin],{required:true,adjust:function(val,_eb8){
var _eb9=val+_eb8;
if(isNaN(val)||isNaN(_eb9)){
return val;
}
if((typeof this.constraints.max=="number")&&(_eb9>this.constraints.max)){
_eb9=this.constraints.max;
}
if((typeof this.constraints.min=="number")&&(_eb9<this.constraints.min)){
_eb9=this.constraints.min;
}
return _eb9;
}});
}
if(!dojo._hasResource["dojo.cldr.monetary"]){
dojo._hasResource["dojo.cldr.monetary"]=true;
dojo.provide("dojo.cldr.monetary");
dojo.cldr.monetary.getData=function(code){
var _ebb={ADP:0,BHD:3,BIF:0,BYR:0,CLF:0,CLP:0,DJF:0,ESP:0,GNF:0,IQD:3,ITL:0,JOD:3,JPY:0,KMF:0,KRW:0,KWD:3,LUF:0,LYD:3,MGA:0,MGF:0,OMR:3,PYG:0,RWF:0,TND:3,TRL:0,VUV:0,XAF:0,XOF:0,XPF:0};
var _ebc={CHF:5};
var _ebd=_ebb[code],_ebe=_ebc[code];
if(typeof _ebd=="undefined"){
_ebd=2;
}
if(typeof _ebe=="undefined"){
_ebe=0;
}
return {places:_ebd,round:_ebe};
};
}
if(!dojo._hasResource["dojo.currency"]){
dojo._hasResource["dojo.currency"]=true;
dojo.provide("dojo.currency");
dojo.currency._mixInDefaults=function(_ebf){
_ebf=_ebf||{};
_ebf.type="currency";
var _ec0=dojo.i18n.getLocalization("dojo.cldr","currency",_ebf.locale)||{};
var iso=_ebf.currency;
var data=dojo.cldr.monetary.getData(iso);
dojo.forEach(["displayName","symbol","group","decimal"],function(prop){
data[prop]=_ec0[iso+"_"+prop];
});
data.fractional=[true,false];
return dojo.mixin(data,_ebf);
};
dojo.currency.format=function(_ec4,_ec5){
return dojo.number.format(_ec4,dojo.currency._mixInDefaults(_ec5));
};
dojo.currency.regexp=function(_ec6){
return dojo.number.regexp(dojo.currency._mixInDefaults(_ec6));
};
dojo.currency.parse=function(_ec7,_ec8){
return dojo.number.parse(_ec7,dojo.currency._mixInDefaults(_ec8));
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
dojo.declare("dijit.form.HorizontalSlider",[dijit.form._FormValueWidget,dijit._Container],{templateString:"<table class=\"dijit dijitReset dijitSlider\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" rules=\"none\"\r\n\t><tr class=\"dijitReset\"\r\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\r\n\t\t><td dojoAttachPoint=\"containerNode,topDecoration\" class=\"dijitReset\" style=\"text-align:center;width:100%;\"></td\r\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\r\n\t></tr\r\n\t><tr class=\"dijitReset\"\r\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerH\"\r\n\t\t\t><div class=\"dijitSliderDecrementIconH\" tabIndex=\"-1\" style=\"display:none\" dojoAttachPoint=\"decrementButton\" dojoAttachEvent=\"onclick: decrement\"><span class=\"dijitSliderButtonInner\">-</span></div\r\n\t\t></td\r\n\t\t><td class=\"dijitReset\"\r\n\t\t\t><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperH dijitSliderLeftBumper dijitSliderLeftBumper\" dojoAttachEvent=\"onclick:_onClkDecBumper\"></div\r\n\t\t></td\r\n\t\t><td class=\"dijitReset\"\r\n\t\t\t><input dojoAttachPoint=\"valueNode\" type=\"hidden\" name=\"${name}\"\r\n\t\t\t/><div waiRole=\"presentation\" style=\"position:relative;\" dojoAttachPoint=\"sliderBarContainer\"\r\n\t\t\t\t><div waiRole=\"presentation\" dojoAttachPoint=\"progressBar\" class=\"dijitSliderBar dijitSliderBarH dijitSliderProgressBar dijitSliderProgressBarH\" dojoAttachEvent=\"onclick:_onBarClick\"\r\n\t\t\t\t\t><div dojoAttachPoint=\"sliderHandle,focusNode\" class=\"dijitSliderMoveable dijitSliderMoveableH\" dojoAttachEvent=\"onkeypress:_onKeyPress,onmousedown:_onHandleClick\" waiRole=\"slider\" valuemin=\"${minimum}\" valuemax=\"${maximum}\"\r\n\t\t\t\t\t\t><div class=\"dijitSliderImageHandle dijitSliderImageHandleH\"></div\r\n\t\t\t\t\t></div\r\n\t\t\t\t></div\r\n\t\t\t\t><div waiRole=\"presentation\" dojoAttachPoint=\"remainingBar\" class=\"dijitSliderBar dijitSliderBarH dijitSliderRemainingBar dijitSliderRemainingBarH\" dojoAttachEvent=\"onclick:_onBarClick\"></div\r\n\t\t\t></div\r\n\t\t></td\r\n\t\t><td class=\"dijitReset\"\r\n\t\t\t><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperH dijitSliderRightBumper dijitSliderRightBumper\" dojoAttachEvent=\"onclick:_onClkIncBumper\"></div\r\n\t\t></td\r\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerH\" style=\"right:0px;\"\r\n\t\t\t><div class=\"dijitSliderIncrementIconH\" tabIndex=\"-1\" style=\"display:none\" dojoAttachPoint=\"incrementButton\" dojoAttachEvent=\"onclick: increment\"><span class=\"dijitSliderButtonInner\">+</span></div\r\n\t\t></td\r\n\t></tr\r\n\t><tr class=\"dijitReset\"\r\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\r\n\t\t><td dojoAttachPoint=\"containerNode,bottomDecoration\" class=\"dijitReset\" style=\"text-align:center;\"></td\r\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\r\n\t></tr\r\n></table>\r\n",value:0,showButtons:true,minimum:0,maximum:100,discreteValues:Infinity,pageIncrement:2,clickSelect:true,slideDuration:1000,widgetsInTemplate:true,attributeMap:dojo.mixin(dojo.clone(dijit.form._FormWidget.prototype.attributeMap),{id:"",name:"valueNode"}),baseClass:"dijitSlider",_mousePixelCoord:"pageX",_pixelCount:"w",_startingPixelCoord:"x",_startingPixelCount:"l",_handleOffsetCoord:"left",_progressPixelSize:"width",_onKeyPress:function(e){
if(this.disabled||this.readOnly||e.altKey||e.ctrlKey){
return;
}
switch(e.keyCode){
case dojo.keys.HOME:
this.setValue(this.minimum,true);
break;
case dojo.keys.END:
this.setValue(this.maximum,true);
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
var _ecc=dojo.coords(this.sliderBarContainer,true);
var _ecd=e[this._mousePixelCoord]-_ecc[this._startingPixelCoord];
this._setPixelValue(this._isReversed()?(_ecc[this._pixelCount]-_ecd):_ecd,_ecc[this._pixelCount],true);
},_setPixelValue:function(_ece,_ecf,_ed0){
if(this.disabled||this.readOnly){
return;
}
_ece=_ece<0?0:_ecf<_ece?_ecf:_ece;
var _ed1=this.discreteValues;
if(_ed1<=1||_ed1==Infinity){
_ed1=_ecf;
}
_ed1--;
var _ed2=_ecf/_ed1;
var _ed3=Math.round(_ece/_ed2);
this.setValue((this.maximum-this.minimum)*_ed3/_ed1+this.minimum,_ed0);
},setValue:function(_ed4,_ed5){
this.valueNode.value=this.value=_ed4;
dijit.setWaiState(this.focusNode,"valuenow",_ed4);
this.inherited(arguments);
var _ed6=(_ed4-this.minimum)/(this.maximum-this.minimum);
var _ed7=(this._descending===false)?this.remainingBar:this.progressBar;
var _ed8=(this._descending===false)?this.progressBar:this.remainingBar;
if(_ed5&&this.slideDuration>0&&_ed7.style[this._progressPixelSize]){
var _ed9=this;
var _eda={};
var _edb=parseFloat(_ed7.style[this._progressPixelSize]);
var _edc=this.slideDuration*(_ed6-_edb/100);
if(_edc==0){
return;
}
if(_edc<0){
_edc=0-_edc;
}
_eda[this._progressPixelSize]={start:_edb,end:_ed6*100,units:"%"};
dojo.animateProperty({node:_ed7,duration:_edc,onAnimate:function(v){
_ed8.style[_ed9._progressPixelSize]=(100-parseFloat(v[_ed9._progressPixelSize]))+"%";
},properties:_eda}).play();
}else{
_ed7.style[this._progressPixelSize]=(_ed6*100)+"%";
_ed8.style[this._progressPixelSize]=((1-_ed6)*100)+"%";
}
},_bumpValue:function(_ede){
if(this.disabled||this.readOnly){
return;
}
var s=dojo.getComputedStyle(this.sliderBarContainer);
var c=dojo._getContentBox(this.sliderBarContainer,s);
var _ee1=this.discreteValues;
if(_ee1<=1||_ee1==Infinity){
_ee1=c[this._pixelCount];
}
_ee1--;
var _ee2=(this.value-this.minimum)*_ee1/(this.maximum-this.minimum)+_ede;
if(_ee2<0){
_ee2=0;
}
if(_ee2>_ee1){
_ee2=_ee1;
}
_ee2=_ee2*(this.maximum-this.minimum)/_ee1+this.minimum;
this.setValue(_ee2,true);
},_onClkIncBumper:function(){
this.setValue(this._descending===false?this.minimum:this.maximum,true);
},_onClkDecBumper:function(){
this.setValue(this._descending===false?this.maximum:this.minimum,true);
},decrement:function(e){
this._bumpValue(e.keyCode==dojo.keys.PAGE_DOWN?-this.pageIncrement:-1);
},increment:function(e){
this._bumpValue(e.keyCode==dojo.keys.PAGE_UP?this.pageIncrement:1);
},_mouseWheeled:function(evt){
dojo.stopEvent(evt);
var _ee6=0;
if(typeof evt.wheelDelta=="number"){
_ee6=evt.wheelDelta;
}else{
if(typeof evt.detail=="number"){
_ee6=-evt.detail;
}
}
if(_ee6>0){
this.increment(evt);
}else{
if(_ee6<0){
this.decrement(evt);
}
}
},startup:function(){
dojo.forEach(this.getChildren(),function(_ee7){
if(this[_ee7.container]!=this.containerNode){
this[_ee7.container].appendChild(_ee7.domNode);
}
},this);
},postCreate:function(){
if(this.showButtons){
this.incrementButton.style.display="";
this.decrementButton.style.display="";
}
this.connect(this.domNode,dojo.isIE?"onmousewheel":"DOMMouseScroll","_mouseWheeled");
var _ee8=this;
var _ee9=function(){
dijit.form._SliderMover.apply(this,arguments);
this.widget=_ee8;
};
dojo.extend(_ee9,dijit.form._SliderMover.prototype);
this._movable=new dojo.dnd.Moveable(this.sliderHandle,{mover:_ee9});
dijit.setWaiState(this.focusNode,"valuemin",this.minimum);
dijit.setWaiState(this.focusNode,"valuemax",this.maximum);
this.inherited(arguments);
},destroy:function(){
this._movable.destroy();
this.inherited(arguments);
}});
dojo.declare("dijit.form.VerticalSlider",dijit.form.HorizontalSlider,{templateString:"<table class=\"dijitReset dijitSlider\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" rules=\"none\"\r\n><tbody class=\"dijitReset\"\r\n\t><tr class=\"dijitReset\"\r\n\t\t><td class=\"dijitReset\"></td\r\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerV\"\r\n\t\t\t><div class=\"dijitSliderIncrementIconV\" tabIndex=\"-1\" style=\"display:none\" dojoAttachPoint=\"incrementButton\" dojoAttachEvent=\"onclick:_topButtonClicked\"><span class=\"dijitSliderButtonInner\">+</span></div\r\n\t\t></td\r\n\t\t><td class=\"dijitReset\"></td\r\n\t></tr\r\n\t><tr class=\"dijitReset\"\r\n\t\t><td class=\"dijitReset\"></td\r\n\t\t><td class=\"dijitReset\"\r\n\t\t\t><center><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperV dijitSliderTopBumper dijitSliderTopBumper\" dojoAttachEvent=\"onclick:_onClkIncBumper\"></div></center\r\n\t\t></td\r\n\t\t><td class=\"dijitReset\"></td\r\n\t></tr\r\n\t><tr class=\"dijitReset\"\r\n\t\t><td dojoAttachPoint=\"leftDecoration\" class=\"dijitReset\" style=\"text-align:center;height:100%;\"></td\r\n\t\t><td class=\"dijitReset\" style=\"height:100%;\"\r\n\t\t\t><input dojoAttachPoint=\"valueNode\" type=\"hidden\" name=\"${name}\"\r\n\t\t\t/><center waiRole=\"presentation\" style=\"position:relative;height:100%;\" dojoAttachPoint=\"sliderBarContainer\"\r\n\t\t\t\t><div waiRole=\"presentation\" dojoAttachPoint=\"remainingBar\" class=\"dijitSliderBar dijitSliderBarV dijitSliderRemainingBar dijitSliderRemainingBarV\" dojoAttachEvent=\"onclick:_onBarClick\"><!--#5629--></div\r\n\t\t\t\t><div waiRole=\"presentation\" dojoAttachPoint=\"progressBar\" class=\"dijitSliderBar dijitSliderBarV dijitSliderProgressBar dijitSliderProgressBarV\" dojoAttachEvent=\"onclick:_onBarClick\"\r\n\t\t\t\t\t><div dojoAttachPoint=\"sliderHandle,focusNode\" class=\"dijitSliderMoveable\" dojoAttachEvent=\"onkeypress:_onKeyPress,onmousedown:_onHandleClick\" style=\"vertical-align:top;\" waiRole=\"slider\" valuemin=\"${minimum}\" valuemax=\"${maximum}\"\r\n\t\t\t\t\t\t><div class=\"dijitSliderImageHandle dijitSliderImageHandleV\"></div\r\n\t\t\t\t\t></div\r\n\t\t\t\t></div\r\n\t\t\t></center\r\n\t\t></td\r\n\t\t><td dojoAttachPoint=\"containerNode,rightDecoration\" class=\"dijitReset\" style=\"text-align:center;height:100%;\"></td\r\n\t></tr\r\n\t><tr class=\"dijitReset\"\r\n\t\t><td class=\"dijitReset\"></td\r\n\t\t><td class=\"dijitReset\"\r\n\t\t\t><center><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperV dijitSliderBottomBumper dijitSliderBottomBumper\" dojoAttachEvent=\"onclick:_onClkDecBumper\"></div></center\r\n\t\t></td\r\n\t\t><td class=\"dijitReset\"></td\r\n\t></tr\r\n\t><tr class=\"dijitReset\"\r\n\t\t><td class=\"dijitReset\"></td\r\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerV\"\r\n\t\t\t><div class=\"dijitSliderDecrementIconV\" tabIndex=\"-1\" style=\"display:none\" dojoAttachPoint=\"decrementButton\" dojoAttachEvent=\"onclick:_bottomButtonClicked\"><span class=\"dijitSliderButtonInner\">-</span></div\r\n\t\t></td\r\n\t\t><td class=\"dijitReset\"></td\r\n\t></tr\r\n></tbody></table>\r\n",_mousePixelCoord:"pageY",_pixelCount:"h",_startingPixelCoord:"y",_startingPixelCount:"t",_handleOffsetCoord:"top",_progressPixelSize:"height",_descending:true,startup:function(){
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
},_topButtonClicked:function(e){
if(this._descending){
this.increment(e);
}else{
this.decrement(e);
}
},_bottomButtonClicked:function(e){
if(this._descending){
this.decrement(e);
}else{
this.increment(e);
}
},_rtlRectify:function(_eec){
var _eed=[];
while(_eec.firstChild){
_eed.push(_eec.firstChild);
_eec.removeChild(_eec.firstChild);
}
for(var i=_eed.length-1;i>=0;i--){
if(_eed[i]){
_eec.appendChild(_eed[i]);
}
}
}});
dojo.declare("dijit.form._SliderMover",dojo.dnd.Mover,{onMouseMove:function(e){
var _ef0=this.widget;
var _ef1=_ef0._abspos;
if(!_ef1){
_ef1=_ef0._abspos=dojo.coords(_ef0.sliderBarContainer,true);
_ef0._setPixelValue_=dojo.hitch(_ef0,"_setPixelValue");
_ef0._isReversed_=_ef0._isReversed();
}
var _ef2=e[_ef0._mousePixelCoord]-_ef1[_ef0._startingPixelCoord];
_ef0._setPixelValue_(_ef0._isReversed_?(_ef1[_ef0._pixelCount]-_ef2):_ef2,_ef1[_ef0._pixelCount],false);
},destroy:function(e){
dojo.dnd.Mover.prototype.destroy.apply(this,arguments);
var _ef4=this.widget;
_ef4.setValue(_ef4.value,true);
}});
dojo.declare("dijit.form.HorizontalRule",[dijit._Widget,dijit._Templated],{templateString:"<div class=\"dijitRuleContainer dijitRuleContainerH\"></div>",count:3,container:"containerNode",ruleStyle:"",_positionPrefix:"<div class=\"dijitRuleMark dijitRuleMarkH\" style=\"left:",_positionSuffix:"%;",_suffix:"\"></div>",_genHTML:function(pos,ndx){
return this._positionPrefix+pos+this._positionSuffix+this.ruleStyle+this._suffix;
},_isHorizontal:true,postCreate:function(){
var _ef7;
if(this.count==1){
_ef7=this._genHTML(50,0);
}else{
var i;
var _ef9=100/(this.count-1);
if(!this._isHorizontal||this.isLeftToRight()){
_ef7=this._genHTML(0,0);
for(i=1;i<this.count-1;i++){
_ef7+=this._genHTML(_ef9*i,i);
}
_ef7+=this._genHTML(100,this.count-1);
}else{
_ef7=this._genHTML(100,0);
for(i=1;i<this.count-1;i++){
_ef7+=this._genHTML(100-_ef9*i,i);
}
_ef7+=this._genHTML(0,this.count-1);
}
}
this.domNode.innerHTML=_ef7;
}});
dojo.declare("dijit.form.VerticalRule",dijit.form.HorizontalRule,{templateString:"<div class=\"dijitRuleContainer dijitRuleContainerV\"></div>",_positionPrefix:"<div class=\"dijitRuleMark dijitRuleMarkV\" style=\"top:",_isHorizontal:false});
dojo.declare("dijit.form.HorizontalRuleLabels",dijit.form.HorizontalRule,{templateString:"<div class=\"dijitRuleContainer dijitRuleContainerH\"></div>",labelStyle:"",labels:[],numericMargin:0,minimum:0,maximum:1,constraints:{pattern:"#%"},_positionPrefix:"<div class=\"dijitRuleLabelContainer dijitRuleLabelContainerH\" style=\"left:",_labelPrefix:"\"><span class=\"dijitRuleLabel dijitRuleLabelH\">",_suffix:"</span></div>",_calcPosition:function(pos){
return pos;
},_genHTML:function(pos,ndx){
return this._positionPrefix+this._calcPosition(pos)+this._positionSuffix+this.labelStyle+this._labelPrefix+this.labels[ndx]+this._suffix;
},getLabels:function(){
var _efd=this.labels;
if(!_efd.length){
_efd=dojo.query("> li",this.srcNodeRef).map(function(node){
return String(node.innerHTML);
});
}
this.srcNodeRef.innerHTML="";
if(!_efd.length&&this.count>1){
var _eff=this.minimum;
var inc=(this.maximum-_eff)/(this.count-1);
for(var i=0;i<this.count;i++){
_efd.push((i<this.numericMargin||i>=(this.count-this.numericMargin))?"":dojo.number.format(_eff,this.constraints));
_eff+=inc;
}
}
return _efd;
},postMixInProperties:function(){
this.inherited(arguments);
this.labels=this.getLabels();
this.count=this.labels.length;
}});
dojo.declare("dijit.form.VerticalRuleLabels",dijit.form.HorizontalRuleLabels,{templateString:"<div class=\"dijitRuleContainer dijitRuleContainerV\"></div>",_positionPrefix:"<div class=\"dijitRuleLabelContainer dijitRuleLabelContainerV\" style=\"top:",_labelPrefix:"\"><span class=\"dijitRuleLabel dijitRuleLabelV\">",_calcPosition:function(pos){
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
var _f03="text";
var oSel;
try{
oSel=dojo.global.getSelection();
}
catch(e){
}
if(oSel&&oSel.rangeCount==1){
var _f05=oSel.getRangeAt(0);
if((_f05.startContainer==_f05.endContainer)&&((_f05.endOffset-_f05.startOffset)==1)&&(_f05.startContainer.nodeType!=3)){
_f03="control";
}
}
return _f03;
}
},getSelectedText:function(){
if(dojo.doc.selection){
if(dijit._editor.selection.getType()=="control"){
return null;
}
return dojo.doc.selection.createRange().text;
}else{
var _f06=dojo.global.getSelection();
if(_f06){
return _f06.toString();
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
var _f07=dojo.global.getSelection();
if(_f07&&_f07.rangeCount){
var frag=_f07.getRangeAt(0).cloneContents();
var div=dojo.doc.createElement("div");
div.appendChild(frag);
return div.innerHTML;
}
return null;
}
},getSelectedElement:function(){
if(this.getType()=="control"){
if(dojo.doc.selection){
var _f0a=dojo.doc.selection.createRange();
if(_f0a&&_f0a.item){
return dojo.doc.selection.createRange().item(0);
}
}else{
var _f0b=dojo.global.getSelection();
return _f0b.anchorNode.childNodes[_f0b.anchorOffset];
}
}
return null;
},getParentElement:function(){
if(this.getType()=="control"){
var p=this.getSelectedElement();
if(p){
return p.parentNode;
}
}else{
if(dojo.doc.selection){
return dojo.doc.selection.createRange().parentElement();
}else{
var _f0d=dojo.global.getSelection();
if(_f0d){
var node=_f0d.anchorNode;
while(node&&(node.nodeType!=1)){
node=node.parentNode;
}
return node;
}
}
}
return null;
},hasAncestorElement:function(_f0f){
return this.getAncestorElement.apply(this,arguments)!=null;
},getAncestorElement:function(_f10){
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
},collapse:function(_f19){
if(window["getSelection"]){
var _f1a=dojo.global.getSelection();
if(_f1a.removeAllRanges){
if(_f19){
_f1a.collapseToStart();
}else{
_f1a.collapseToEnd();
}
}else{
_f1a.collapse(_f19);
}
}else{
if(dojo.doc.selection){
var _f1b=dojo.doc.selection.createRange();
_f1b.collapse(_f19);
_f1b.select();
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
},selectElementChildren:function(_f1d,_f1e){
var _f1f=dojo.global;
var _f20=dojo.doc;
_f1d=dojo.byId(_f1d);
if(_f20.selection&&dojo.body().createTextRange){
var _f21=_f1d.ownerDocument.body.createTextRange();
_f21.moveToElementText(_f1d);
if(!_f1e){
try{
_f21.select();
}
catch(e){
}
}
}else{
if(_f1f.getSelection){
var _f22=_f1f.getSelection();
if(_f22.setBaseAndExtent){
_f22.setBaseAndExtent(_f1d,0,_f1d,_f1d.innerText.length-1);
}else{
if(_f22.selectAllChildren){
_f22.selectAllChildren(_f1d);
}
}
}
}
},selectElement:function(_f23,_f24){
var _f25,_f26=dojo.doc;
_f23=dojo.byId(_f23);
if(_f26.selection&&dojo.body().createTextRange){
try{
_f25=dojo.body().createControlRange();
_f25.addElement(_f23);
if(!_f24){
_f25.select();
}
}
catch(e){
this.selectElementChildren(_f23,_f24);
}
}else{
if(dojo.global.getSelection){
var _f27=dojo.global.getSelection();
if(_f27.removeAllRanges){
_f25=_f26.createRange();
_f25.selectNode(_f23);
_f27.removeAllRanges();
_f27.addRange(_f25);
}
}
}
}});
}
if(!dojo._hasResource["dijit._editor.html"]){
dojo._hasResource["dijit._editor.html"]=true;
dojo.provide("dijit._editor.html");
dijit._editor.escapeXml=function(str,_f29){
str=str.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;");
if(!_f29){
str=str.replace(/'/gm,"&#39;");
}
return str;
};
dijit._editor.getNodeHtml=function(node){
var _f2b;
switch(node.nodeType){
case 1:
_f2b="<"+node.nodeName.toLowerCase();
var _f2c=[];
if(dojo.isIE&&node.outerHTML){
var s=node.outerHTML;
s=s.substr(0,s.indexOf(">"));
s=s.replace(/(['"])[^"']*\1/g,"");
var reg=/([^\s=]+)=/g;
var m,key;
while((m=reg.exec(s))){
key=m[1];
if(key.substr(0,3)!="_dj"){
if(key=="src"||key=="href"){
if(node.getAttribute("_djrealurl")){
_f2c.push([key,node.getAttribute("_djrealurl")]);
continue;
}
}
if(key=="style"){
_f2c.push([key,node.style.cssText.toLowerCase()]);
}else{
_f2c.push([key,key=="class"?node.className:node.getAttribute(key)]);
}
}
}
}else{
var attr,i=0,_f33=node.attributes;
while((attr=_f33[i++])){
var n=attr.name;
if(n.substr(0,3)!="_dj"){
var v=attr.value;
if(n=="src"||n=="href"){
if(node.getAttribute("_djrealurl")){
v=node.getAttribute("_djrealurl");
}
}
_f2c.push([n,v]);
}
}
}
_f2c.sort(function(a,b){
return a[0]<b[0]?-1:(a[0]==b[0]?0:1);
});
i=0;
while((attr=_f2c[i++])){
_f2b+=" "+attr[0]+"=\""+(dojo.isString(attr[1])?dijit._editor.escapeXml(attr[1],true):attr[1])+"\"";
}
if(node.childNodes.length){
_f2b+=">"+dijit._editor.getChildrenHtml(node)+"</"+node.nodeName.toLowerCase()+">";
}else{
_f2b+=" />";
}
break;
case 3:
_f2b=dijit._editor.escapeXml(node.nodeValue,true);
break;
case 8:
_f2b="<!--"+dijit._editor.escapeXml(node.nodeValue,true)+"-->";
break;
default:
_f2b="Element not recognized - Type: "+node.nodeType+" Name: "+node.nodeName;
}
return _f2b;
};
dijit._editor.getChildrenHtml=function(dom){
var out="";
if(!dom){
return out;
}
var _f3a=dom["childNodes"]||dom;
var i=0;
var node;
while((node=_f3a[i++])){
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
var _f3d=dojo.doc.createElement("textarea");
_f3d.id=dijit._scopeName+"._editor.RichText.savedContent";
var s=_f3d.style;
s.display="none";
s.position="absolute";
s.top="-100px";
s.left="-100px";
s.height="3px";
s.width="3px";
dojo.body().appendChild(_f3d);
})();
}else{
try{
dojo.doc.write("<textarea id=\""+dijit._scopeName+"._editor.RichText.savedContent\" "+"style=\"display:none;position:absolute;top:-100px;left:-100px;height:3px;width:3px;overflow:hidden;\"></textarea>");
}
catch(e){
}
}
}
dojo.declare("dijit._editor.RichText",dijit._Widget,{constructor:function(){
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
}else{
if(dojo.isSafari){
this.contentPostFilters.push(this._removeSafariBogus);
}
}
this.onLoadDeferred=new dojo.Deferred();
},inheritWidth:false,focusOnLoad:false,name:"",styleSheets:"",_content:"",height:"300px",minHeight:"1em",isClosed:true,isLoaded:false,_SEPARATOR:"@@**%%__RICHTEXTBOUNDRY__%%**@@",onLoadDeferred:null,postCreate:function(){
dojo.publish(dijit._scopeName+"._editor.RichText::init",[this]);
this.open();
this.setupDefaultShortcuts();
},setupDefaultShortcuts:function(){
var exec=function(cmd,arg){
return arguments.length==1?function(){
this.execCommand(cmd);
}:function(){
this.execCommand(cmd,arg);
};
};
var _f42={b:exec("bold"),i:exec("italic"),u:exec("underline"),a:exec("selectall"),s:function(){
this.save(true);
},"1":exec("formatblock","h1"),"2":exec("formatblock","h2"),"3":exec("formatblock","h3"),"4":exec("formatblock","h4"),"\\":exec("insertunorderedlist")};
if(!dojo.isIE){
_f42.Z=exec("redo");
}
for(var key in _f42){
this.addKeyHandler(key,this.KEY_CTRL,_f42[key]);
}
},events:["onKeyPress","onKeyDown","onKeyUp","onClick"],captureEvents:[],_editorCommandsLocalized:false,_localizeEditorCommands:function(){
if(this._editorCommandsLocalized){
return;
}
this._editorCommandsLocalized=true;
var _f44=["p","pre","address","h1","h2","h3","h4","h5","h6","ol","div","ul"];
var _f45="",_f46,i=0;
while((_f46=_f44[i++])){
if(_f46.charAt(1)!="l"){
_f45+="<"+_f46+"><span>content</span></"+_f46+">";
}else{
_f45+="<"+_f46+"><li>content</li></"+_f46+">";
}
}
var div=dojo.doc.createElement("div");
div.style.position="absolute";
div.style.left="-2000px";
div.style.top="-2000px";
dojo.doc.body.appendChild(div);
div.innerHTML=_f45;
var node=div.firstChild;
while(node){
dijit._editor.selection.selectElement(node.firstChild);
dojo.withGlobal(this.window,"selectElement",dijit._editor.selection,[node.firstChild]);
var _f4a=node.tagName.toLowerCase();
this._local2NativeFormatNames[_f4a]=dojo.doc.queryCommandValue("formatblock");
this._native2LocalFormatNames[this._local2NativeFormatNames[_f4a]]=_f4a;
node=node.nextSibling;
}
dojo.doc.body.removeChild(div);
},open:function(_f4b){
if((!this.onLoadDeferred)||(this.onLoadDeferred.fired>=0)){
this.onLoadDeferred=new dojo.Deferred();
}
if(!this.isClosed){
this.close();
}
dojo.publish(dijit._scopeName+"._editor.RichText::open",[this]);
this._content="";
if((arguments.length==1)&&(_f4b["nodeName"])){
this.domNode=_f4b;
}
var html;
if((this.domNode["nodeName"])&&(this.domNode.nodeName.toLowerCase()=="textarea")){
this.textarea=this.domNode;
this.name=this.textarea.name;
html=this._preFilterContent(this.textarea.value);
this.domNode=dojo.doc.createElement("div");
this.domNode.setAttribute("widgetId",this.id);
this.textarea.removeAttribute("widgetId");
this.domNode.cssText=this.textarea.cssText;
this.domNode.className+=" "+this.textarea.className;
dojo.place(this.domNode,this.textarea,"before");
var _f4d=dojo.hitch(this,function(){
dojo.attr(this.textarea,"tabIndex","-1");
with(this.textarea.style){
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
setTimeout(_f4d,10);
}else{
_f4d();
}
}else{
html=this._preFilterContent(dijit._editor.getChildrenHtml(this.domNode));
this.domNode.innerHTML="";
}
if(html==""){
html="&nbsp;";
}
var _f4e=dojo.contentBox(this.domNode);
this._oldHeight=_f4e.h;
this._oldWidth=_f4e.w;
if((this.domNode["nodeName"])&&(this.domNode.nodeName=="LI")){
this.domNode.innerHTML=" <br>";
}
this.editingArea=dojo.doc.createElement("div");
this.domNode.appendChild(this.editingArea);
if(this.name!=""&&(!dojo.config["useXDomain"]||dojo.config["allowXdRichTextSave"])){
var _f4f=dojo.byId(dijit._scopeName+"._editor.RichText.savedContent");
if(_f4f.value!=""){
var _f50=_f4f.value.split(this._SEPARATOR),i=0,dat;
while((dat=_f50[i++])){
var data=dat.split(":");
if(data[0]==this.name){
html=data[1];
_f50.splice(i,1);
break;
}
}
}
this.connect(window,"onbeforeunload","_saveContent");
}
this.isClosed=false;
if(dojo.isIE||dojo.isSafari||dojo.isOpera){
if(dojo.config["useXDomain"]&&!dojo.config["dojoBlankHtmlUrl"]){
console.debug("dijit._editor.RichText: When using cross-domain Dojo builds,"+" please save dojo/resources/blank.html to your domain and set djConfig.dojoBlankHtmlUrl"+" to the path on your domain to blank.html");
}
var burl=dojo.config["dojoBlankHtmlUrl"]||(dojo.moduleUrl("dojo","resources/blank.html")+"");
var ifr=this.editorObject=this.iframe=dojo.doc.createElement("iframe");
ifr.id=this.id+"_iframe";
ifr.src=burl;
ifr.style.border="none";
ifr.style.width="100%";
ifr.frameBorder=0;
this.editingArea.appendChild(ifr);
var h=null;
var _f57=dojo.hitch(this,function(){
if(h){
dojo.disconnect(h);
h=null;
}
this.window=ifr.contentWindow;
var d=this.document=this.window.document;
d.open();
d.write(this._getIframeDocTxt(html));
d.close();
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
if(dojo.isIE){
this._localizeEditorCommands();
}
this.onLoad();
this.savedContent=this.getValue(true);
});
if(dojo.isIE&&dojo.isIE<7){
var t=setInterval(function(){
if(ifr.contentWindow.isLoaded){
clearInterval(t);
_f57();
}
},100);
}else{
h=dojo.connect(((dojo.isIE)?ifr.contentWindow:ifr),"onload",_f57);
}
}else{
this._drawIframe(html);
this.savedContent=this.getValue(true);
}
if(this.domNode.nodeName=="LI"){
this.domNode.lastChild.style.marginTop="-1.2em";
}
this.domNode.className+=" RichTextEditable";
},_local2NativeFormatNames:{},_native2LocalFormatNames:{},_localizedIframeTitles:null,_getIframeDocTxt:function(html){
var _cs=dojo.getComputedStyle(this.domNode);
if(dojo.isIE||(!this.height&&!dojo.isMoz)){
html="<div>"+html+"</div>";
}
var font=[_cs.fontWeight,_cs.fontSize,_cs.fontFamily].join(" ");
var _f5d=_cs.lineHeight;
if(_f5d.indexOf("px")>=0){
_f5d=parseFloat(_f5d)/parseFloat(_cs.fontSize);
}else{
if(_f5d.indexOf("em")>=0){
_f5d=parseFloat(_f5d);
}else{
_f5d="1.0";
}
}
return [this.isLeftToRight()?"<html><head>":"<html dir='rtl'><head>",(dojo.isMoz?"<title>"+this._localizedIframeTitles.iframeEditTitle+"</title>":""),"<style>","body,html {","\tbackground:transparent;","\tfont:",font,";","\tpadding: 1em 0 0 0;","\tmargin: -1em 0 0 0;","\theight: 100%;","}","body{","\ttop:0px; left:0px; right:0px;",((this.height||dojo.isOpera)?"":"position: fixed;"),"\tmin-height:",this.minHeight,";","\tline-height:",_f5d,"}","p{ margin: 1em 0 !important; }",(this.height?"":"body,html{height:auto;overflow-y:hidden;/*for IE*/} body > div {overflow-x:auto;/*for FF to show vertical scrollbar*/}"),"li > ul:-moz-first-node, li > ol:-moz-first-node{ padding-top: 1.2em; } ","li{ min-height:1.2em; }","</style>",this._applyEditingAreaStyleSheets(),"</head><body>"+html+"</body></html>"].join("");
},_drawIframe:function(html){
if(!this.iframe){
var ifr=this.iframe=dojo.doc.createElement("iframe");
ifr.id=this.id;
var ifrs=ifr.style;
ifrs.border="none";
ifrs.lineHeight="0";
ifrs.verticalAlign="bottom";
this.editorObject=this.iframe;
this._localizedIframeTitles=dojo.i18n.getLocalization("dijit.form","Textarea");
var _f61=dojo.query("label[for=\""+this.id+"\"]");
if(_f61.length){
this._localizedIframeTitles.iframeEditTitle=_f61[0].innerHTML+" "+this._localizedIframeTitles.iframeEditTitle;
}
}
this.iframe.style.width=this.inheritWidth?this._oldWidth:"100%";
if(this.height){
this.iframe.style.height=this.height;
}else{
this.iframe.height=this._oldHeight;
}
var _f62;
if(this.textarea){
_f62=this.srcNodeRef;
}else{
_f62=dojo.doc.createElement("div");
_f62.style.display="none";
_f62.innerHTML=html;
this.editingArea.appendChild(_f62);
}
this.editingArea.appendChild(this.iframe);
var _f63=false;
var _f64=this.iframe.contentDocument;
_f64.open();
if(dojo.isAIR){
_f64.body.innerHTML=html;
}else{
_f64.write(this._getIframeDocTxt(html));
}
_f64.close();
var _f65=dojo.hitch(this,function(){
if(!_f63){
_f63=true;
}else{
return;
}
if(!this.editNode){
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
if(!this.document.body){
throw "Error";
}
}
catch(e){
setTimeout(_f65,500);
_f63=false;
return;
}
dojo._destroyElement(_f62);
this.onLoad();
}else{
dojo._destroyElement(_f62);
this.editNode.innerHTML=html;
this.onDisplayChanged();
}
this._preDomFilterContent(this.editNode);
});
_f65();
},_applyEditingAreaStyleSheets:function(){
var _f66=[];
if(this.styleSheets){
_f66=this.styleSheets.split(";");
this.styleSheets="";
}
_f66=_f66.concat(this.editingAreaStyleSheets);
this.editingAreaStyleSheets=[];
var text="",i=0,url;
while((url=_f66[i++])){
var _f6a=(new dojo._Url(dojo.global.location,url)).toString();
this.editingAreaStyleSheets.push(_f6a);
text+="<link rel=\"stylesheet\" type=\"text/css\" href=\""+_f6a+"\"/>";
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
var _f6e=this.document.createElement("link");
with(_f6e){
rel="stylesheet";
type="text/css";
href=url;
}
head.appendChild(_f6e);
}
},removeStyleSheet:function(uri){
var url=uri.toString();
if(url.charAt(0)=="."||(url.charAt(0)!="/"&&!uri.host)){
url=(new dojo._Url(dojo.global.location,url)).toString();
}
var _f71=dojo.indexOf(this.editingAreaStyleSheets,url);
if(_f71==-1){
return;
}
delete this.editingAreaStyleSheets[_f71];
dojo.withGlobal(this.window,"query",dojo,["link:[href=\""+url+"\"]"]).orphan();
},disabled:true,_mozSettingProps:["styleWithCSS","insertBrOnReturn"],setDisabled:function(_f72){
if(dojo.isIE||dojo.isSafari||dojo.isOpera){
if(dojo.isIE){
this.editNode.unselectable="on";
}
this.editNode.contentEditable=!_f72;
if(dojo.isIE){
var _f73=this;
setTimeout(function(){
_f73.editNode.unselectable="off";
},0);
}
}else{
if(_f72){
this._mozSettings=[false,this.blockNodeForEnter==="BR"];
}
this.document.designMode=(_f72?"off":"on");
if(!_f72&&this._mozSettings){
dojo.forEach(this._mozSettingProps,function(s,i){
this.document.execCommand(s,false,this._mozSettings[i]);
},this);
}
}
this.disabled=_f72;
},_isResized:function(){
return false;
},onLoad:function(e){
this.isLoaded=true;
if(!this.window.__registeredWindow){
this.window.__registeredWindow=true;
dijit.registerWin(this.window);
}
if(!dojo.isIE&&(this.height||dojo.isMoz)){
this.editNode=this.document.body;
}else{
this.editNode=this.document.body.firstChild;
var _f77=this;
if(dojo.isIE){
var _f78=this.tabStop=dojo.doc.createElement("<div tabIndex=-1>");
this.editingArea.appendChild(_f78);
this.iframe.onfocus=function(){
_f77.editNode.setActive();
};
}
}
try{
this.setDisabled(false);
}
catch(e){
var _f79=dojo.connect(this,"onClick",this,function(){
this.setDisabled(false);
dojo.disconnect(_f79);
});
}
this._preDomFilterContent(this.editNode);
var _f7a=this.events.concat(this.captureEvents),i=0,et;
while((et=_f7a[i++])){
this.connect(this.document,et.toLowerCase(),et);
}
if(!dojo.isIE){
try{
this.document.execCommand("styleWithCSS",false,false);
}
catch(e2){
}
}else{
this.connect(this.document,"onmousedown","_onMouseDown");
this.editNode.style.zoom=1;
}
if(this.focusOnLoad){
setTimeout(dojo.hitch(this,"focus"),0);
}
this.onDisplayChanged(e);
if(this.onLoadDeferred){
this.onLoadDeferred.callback(true);
}
},onKeyDown:function(e){
if(dojo.isIE){
if(e.keyCode==dojo.keys.TAB&&e.shiftKey&&!e.ctrlKey&&!e.altKey){
this.iframe.focus();
}else{
if(e.keyCode==dojo.keys.TAB&&!e.shiftKey&&!e.ctrlKey&&!e.altKey){
this.tabStop.focus();
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
}else{
if(dojo.isMoz){
if(e.keyCode==dojo.keys.TAB&&!e.shiftKey&&!e.ctrlKey&&!e.altKey&&this.iframe){
this.iframe.contentDocument.title=this._localizedIframeTitles.iframeFocusTitle;
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
},onKeyUp:function(e){
return;
},KEY_CTRL:1,KEY_SHIFT:2,onKeyPress:function(e){
var _f80=(e.ctrlKey&&!e.altKey)?this.KEY_CTRL:0|e.shiftKey?this.KEY_SHIFT:0;
var key=e.keyChar||e.keyCode;
if(this._keyHandlers[key]){
var _f82=this._keyHandlers[key],i=0,h;
while((h=_f82[i++])){
if(_f80==h.modifiers){
if(!h.handler.apply(this,arguments)){
e.preventDefault();
}
break;
}
}
}
setTimeout(dojo.hitch(this,function(){
this.onKeyPressed(e);
}),1);
},addKeyHandler:function(key,_f86,_f87){
if(!dojo.isArray(this._keyHandlers[key])){
this._keyHandlers[key]=[];
}
this._keyHandlers[key].push({modifiers:_f86||0,handler:_f87});
},onKeyPressed:function(e){
this.onDisplayChanged();
},onClick:function(e){
this.onDisplayChanged(e);
},_onMouseDown:function(e){
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
this.iframe.contentDocument.title=this._localizedIframeTitles.iframeEditTitle;
}
},_initialFocus:true,_onFocus:function(e){
this.inherited(arguments);
if(dojo.isMoz&&this._initialFocus){
this._initialFocus=false;
if(this.editNode.innerHTML.replace(/^\s+|\s+$/g,"")=="&nbsp;"){
this.placeCursorAtStart();
}
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
if(!dojo.isIE){
dijit.focus(this.iframe);
}else{
if(this.editNode&&this.editNode.focus){
this.iframe.fireEvent("onfocus",document.createEventObject());
}
}
},updateInterval:200,_updateTimer:null,onDisplayChanged:function(e){
if(!this._updateTimer){
if(this._updateTimer){
clearTimeout(this._updateTimer);
}
this._updateTimer=setTimeout(dojo.hitch(this,this.onNormalizedDisplayChanged),this.updateInterval);
}
},onNormalizedDisplayChanged:function(){
this._updateTimer=null;
},onChange:function(_f8f){
},_normalizeCommand:function(cmd){
var _f91=cmd.toLowerCase();
if(_f91=="hilitecolor"&&!dojo.isMoz){
_f91="backcolor";
}
return _f91;
},queryCommandAvailable:function(_f92){
var ie=1;
var _f94=1<<1;
var _f95=1<<2;
var _f96=1<<3;
var _f97=1<<4;
var _f98=dojo.isSafari;
function isSupportedBy(_f99){
return {ie:Boolean(_f99&ie),mozilla:Boolean(_f99&_f94),safari:Boolean(_f99&_f95),safari420:Boolean(_f99&_f97),opera:Boolean(_f99&_f96)};
};
var _f9a=null;
switch(_f92.toLowerCase()){
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
_f9a=isSupportedBy(_f94|ie|_f95|_f96);
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
_f9a=isSupportedBy(_f94|ie|_f96|_f97);
break;
case "blockdirltr":
case "blockdirrtl":
case "dirltr":
case "dirrtl":
case "inlinedirltr":
case "inlinedirrtl":
_f9a=isSupportedBy(ie);
break;
case "cut":
case "copy":
case "paste":
_f9a=isSupportedBy(ie|_f94|_f97);
break;
case "inserttable":
_f9a=isSupportedBy(_f94|ie);
break;
case "insertcell":
case "insertcol":
case "insertrow":
case "deletecells":
case "deletecols":
case "deleterows":
case "mergecells":
case "splitcell":
_f9a=isSupportedBy(ie|_f94);
break;
default:
return false;
}
return (dojo.isIE&&_f9a.ie)||(dojo.isMoz&&_f9a.mozilla)||(dojo.isSafari&&_f9a.safari)||(_f98&&_f9a.safari420)||(dojo.isOpera&&_f9a.opera);
},execCommand:function(_f9b,_f9c){
var _f9d;
this.focus();
_f9b=this._normalizeCommand(_f9b);
if(_f9c!=undefined){
if(_f9b=="heading"){
throw new Error("unimplemented");
}else{
if((_f9b=="formatblock")&&dojo.isIE){
_f9c="<"+_f9c+">";
}
}
}
if(_f9b=="inserthtml"){
_f9c=this._preFilterContent(_f9c);
if(dojo.isIE){
var _f9e=this.document.selection.createRange();
if(this.document.selection.type.toUpperCase()=="CONTROL"){
var n=_f9e.item(0);
while(_f9e.length){
_f9e.remove(_f9e.item(0));
}
n.outerHTML=_f9c;
}else{
_f9e.pasteHTML(_f9c);
}
_f9e.select();
_f9d=true;
}else{
if(dojo.isMoz&&!_f9c.length){
dojo.withGlobal(this.window,"remove",dijit._editor.selection);
_f9d=true;
}else{
_f9d=this.document.execCommand(_f9b,false,_f9c);
}
}
}else{
if((_f9b=="unlink")&&(this.queryCommandEnabled("unlink"))&&(dojo.isMoz||dojo.isSafari)){
var _fa0=this.window.getSelection();
var a=dojo.withGlobal(this.window,"getAncestorElement",dijit._editor.selection,["a"]);
dojo.withGlobal(this.window,"selectElement",dijit._editor.selection,[a]);
_f9d=this.document.execCommand("unlink",false,null);
}else{
if((_f9b=="hilitecolor")&&(dojo.isMoz)){
this.document.execCommand("styleWithCSS",false,true);
_f9d=this.document.execCommand(_f9b,false,_f9c);
this.document.execCommand("styleWithCSS",false,false);
}else{
if((dojo.isIE)&&((_f9b=="backcolor")||(_f9b=="forecolor"))){
_f9c=arguments.length>1?_f9c:null;
_f9d=this.document.execCommand(_f9b,false,_f9c);
}else{
_f9c=arguments.length>1?_f9c:null;
if(_f9c||_f9b!="createlink"){
_f9d=this.document.execCommand(_f9b,false,_f9c);
}
}
}
}
}
this.onDisplayChanged();
return _f9d;
},queryCommandEnabled:function(_fa2){
if(this.disabled){
return false;
}
_fa2=this._normalizeCommand(_fa2);
if(dojo.isMoz||dojo.isSafari){
if(_fa2=="unlink"){
return dojo.withGlobal(this.window,"hasAncestorElement",dijit._editor.selection,["a"]);
}else{
if(_fa2=="inserttable"){
return true;
}
}
}
if(dojo.isSafari){
if(_fa2=="copy"){
_fa2="cut";
}else{
if(_fa2=="paste"){
return true;
}
}
}
var elem=dojo.isIE?this.document.selection.createRange():this.document;
return elem.queryCommandEnabled(_fa2);
},queryCommandState:function(_fa4){
if(this.disabled){
return false;
}
_fa4=this._normalizeCommand(_fa4);
return this.document.queryCommandState(_fa4);
},queryCommandValue:function(_fa5){
if(this.disabled){
return false;
}
_fa5=this._normalizeCommand(_fa5);
if(dojo.isIE&&_fa5=="formatblock"){
return this._local2NativeFormatNames[this.document.queryCommandValue(_fa5)];
}
return this.document.queryCommandValue(_fa5);
},placeCursorAtStart:function(){
this.focus();
var _fa6=false;
if(dojo.isMoz){
var _fa7=this.editNode.firstChild;
while(_fa7){
if(_fa7.nodeType==3){
if(_fa7.nodeValue.replace(/^\s+|\s+$/g,"").length>0){
_fa6=true;
dojo.withGlobal(this.window,"selectElement",dijit._editor.selection,[_fa7]);
break;
}
}else{
if(_fa7.nodeType==1){
_fa6=true;
dojo.withGlobal(this.window,"selectElementChildren",dijit._editor.selection,[_fa7]);
break;
}
}
_fa7=_fa7.nextSibling;
}
}else{
_fa6=true;
dojo.withGlobal(this.window,"selectElementChildren",dijit._editor.selection,[this.editNode]);
}
if(_fa6){
dojo.withGlobal(this.window,"collapse",dijit._editor.selection,[true]);
}
},placeCursorAtEnd:function(){
this.focus();
var _fa8=false;
if(dojo.isMoz){
var last=this.editNode.lastChild;
while(last){
if(last.nodeType==3){
if(last.nodeValue.replace(/^\s+|\s+$/g,"").length>0){
_fa8=true;
dojo.withGlobal(this.window,"selectElement",dijit._editor.selection,[last]);
break;
}
}else{
if(last.nodeType==1){
_fa8=true;
if(last.lastChild){
dojo.withGlobal(this.window,"selectElement",dijit._editor.selection,[last.lastChild]);
}else{
dojo.withGlobal(this.window,"selectElement",dijit._editor.selection,[last]);
}
break;
}
}
last=last.previousSibling;
}
}else{
_fa8=true;
dojo.withGlobal(this.window,"selectElementChildren",dijit._editor.selection,[this.editNode]);
}
if(_fa8){
dojo.withGlobal(this.window,"collapse",dijit._editor.selection,[false]);
}
},getValue:function(_faa){
if(this.textarea){
if(this.isClosed||!this.isLoaded){
return this.textarea.value;
}
}
return this._postFilterContent(null,_faa);
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
},_postFilterContent:function(dom,_fb4){
var ec;
if(!dojo.isString(dom)){
dom=dom||this.editNode;
if(this.contentDomPostFilters.length){
if(_fb4&&dom["cloneNode"]){
dom=dom.cloneNode(true);
}
dojo.forEach(this.contentDomPostFilters,function(ef){
dom=ef(dom);
});
}
ec=dijit._editor.getChildrenHtml(dom);
}else{
ec=dom;
}
if(!ec.replace(/^(?:\s|\xA0)+/g,"").replace(/(?:\s|\xA0)+$/g,"").length){
ec="";
}
dojo.forEach(this.contentPostFilters,function(ef){
ec=ef(ec);
});
return ec;
},_saveContent:function(e){
var _fb9=dojo.byId(dijit._scopeName+"._editor.RichText.savedContent");
_fb9.value+=this._SEPARATOR+this.name+":"+this.getValue();
},escapeXml:function(str,_fbb){
dojo.deprecated("dijit.Editor::escapeXml is deprecated","use dijit._editor.escapeXml instead",2);
return dijit._editor.escapeXml(str,_fbb);
},getNodeHtml:function(node){
dojo.deprecated("dijit.Editor::getNodeHtml is deprecated","use dijit._editor.getNodeHtml instead",2);
return dijit._editor.getNodeHtml(node);
},getNodeChildrenHtml:function(dom){
dojo.deprecated("dijit.Editor::getNodeChildrenHtml is deprecated","use dijit._editor.getChildrenHtml instead",2);
return dijit._editor.getChildrenHtml(dom);
},close:function(save,_fbf){
if(this.isClosed){
return false;
}
if(!arguments.length){
save=true;
}
this._content=this.getValue();
var _fc0=(this.savedContent!=this._content);
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
return _fc0;
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
},_srcInImgRegex:/(?:(<img(?=\s).*?\ssrc=)("|')(.*?)\2)|(?:(<img\s.*?src=)([^"'][^ >]+))/gi,_hrefInARegex:/(?:(<a(?=\s).*?\shref=)("|')(.*?)\2)|(?:(<a\s.*?href=)([^"'][^ >]+))/gi,_preFixUrlAttributes:function(html){
return html.replace(this._hrefInARegex,"$1$4$2$3$5$2 _djrealurl=$2$3$5$2").replace(this._srcInImgRegex,"$1$4$2$3$5$2 _djrealurl=$2$3$5$2");
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
},_initButton:function(_fc8){
if(this.command.length){
var _fc9=this.getLabel(this.command);
var _fca=this.iconClassPrefix+" "+this.iconClassPrefix+this.command.charAt(0).toUpperCase()+this.command.substr(1);
if(!this.button){
_fc8=dojo.mixin({label:_fc9,showLabel:false,iconClass:_fca,dropDown:this.dropDown,tabIndex:"-1"},_fc8||{});
this.button=new this.buttonClass(_fc8);
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
var _fd1=_e.queryCommandEnabled(_c);
this.button.setAttribute("disabled",!_fd1);
if(typeof this.button.checked=="boolean"){
this.button.setAttribute("checked",_e.queryCommandState(_c));
}
}
catch(e){
console.debug(e);
}
}
},setEditor:function(_fd2){
this.editor=_fd2;
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
},setToolbar:function(_fd3){
if(this.button){
_fd3.addChild(this.button);
}
}});
}
if(!dojo._hasResource["dijit.Editor"]){
dojo._hasResource["dijit.Editor"]=true;
dojo.provide("dijit.Editor");
dojo.declare("dijit.Editor",dijit._editor.RichText,{plugins:null,extraPlugins:null,constructor:function(){
if(!dojo.isArray(this.plugins)){
this.plugins=["undo","redo","|","cut","copy","paste","|","bold","italic","underline","strikethrough","|","insertOrderedList","insertUnorderedList","indent","outdent","|","justifyLeft","justifyRight","justifyCenter","justifyFull"];
}
this._plugins=[];
this._editInterval=this.editActionInterval*1000;
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
},addPlugin:function(_fd5,_fd6){
var args=dojo.isString(_fd5)?{name:_fd5}:_fd5;
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
console.warn("Cannot find plugin",_fd5);
return;
}
_fd5=o.plugin;
}
if(arguments.length>1){
this._plugins[_fd6]=_fd5;
}else{
this._plugins.push(_fd5);
}
_fd5.setEditor(this);
if(dojo.isFunction(_fd5.setToolbar)){
_fd5.setToolbar(this.toolbar);
}
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
try{
if(this.customUndo){
this.endEditing();
this._beginEditing();
}
var r=this.inherited("execCommand",arguments);
if(this.customUndo){
this._endEditing();
}
return r;
}
catch(e){
if(dojo.isMoz&&/copy|cut|paste/.test(cmd)){
var sub=dojo.string.substitute,_fde={cut:"X",copy:"C",paste:"V"},_fdf=navigator.userAgent.indexOf("Macintosh")!=-1;
alert(sub(this.commands.systemShortcutFF,[this.commands[cmd],sub(this.commands[_fdf?"appleKey":"ctrlKey"],[_fde[cmd]])]));
}
return false;
}
}
},queryCommandEnabled:function(cmd){
if(this.customUndo&&(cmd=="undo"||cmd=="redo")){
return cmd=="undo"?(this._steps.length>1):(this._undoedSteps.length>0);
}else{
return this.inherited("queryCommandEnabled",arguments);
}
},_moveToBookmark:function(b){
var _fe2=b;
if(dojo.isIE){
if(dojo.isArray(b)){
_fe2=[];
dojo.forEach(b,function(n){
_fe2.push(dijit.range.getNode(n,this.editNode));
},this);
}
}else{
var r=dijit.range.create();
r.setStart(dijit.range.getNode(b.startContainer,this.editNode),b.startOffset);
r.setEnd(dijit.range.getNode(b.endContainer,this.editNode),b.endOffset);
_fe2=r;
}
dojo.withGlobal(this.window,"moveToBookmark",dijit,[_fe2]);
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
},endEditing:function(_fea){
if(this._editTimer){
clearTimeout(this._editTimer);
}
if(this._inEditing){
this._endEditing(_fea);
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
},_endEditing:function(_fef){
var v=this.getValue(true);
this._undoedSteps=[];
this._steps.push({text:v,bookmark:this._getBookmark()});
},onKeyDown:function(e){
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
if(!dojo._hasResource["dojox.grid._data.dijitEditors"]){
dojo._hasResource["dojox.grid._data.dijitEditors"]=true;
dojo.provide("dojox.grid._data.dijitEditors");
dojo.declare("dojox.grid.editors.Dijit",dojox.grid.editors.base,{editorClass:"dijit.form.TextBox",constructor:function(_ff9){
this.editor=null;
this.editorClass=dojo.getObject(this.cell.editorClass||this.editorClass);
},format:function(_ffa,_ffb){
this.needFormatNode(_ffa,_ffb);
return "<div></div>";
},getValue:function(_ffc){
return this.editor.getValue();
},setValue:function(_ffd,_ffe){
if(this.editor&&this.editor.setValue){
this.editor.setValue(_ffe);
}else{
this.inherited(arguments);
}
},getEditorProps:function(_fff){
return dojo.mixin({},this.cell.editorProps||{},{constraints:dojo.mixin({},this.cell.constraint)||{},value:_fff});
},createEditor:function(_1000,_1001,_1002){
return new this.editorClass(this.getEditorProps(_1001),_1000);
},attachEditor:function(_1003,_1004,_1005){
_1003.appendChild(this.editor.domNode);
this.setValue(_1005,_1004);
},formatNode:function(_1006,_1007,_1008){
if(!this.editorClass){
return _1007;
}
if(!this.editor){
this.editor=this.createEditor.apply(this,arguments);
}else{
this.attachEditor.apply(this,arguments);
}
this.sizeEditor.apply(this,arguments);
this.cell.grid.rowHeightChanged(_1008);
this.focus();
},sizeEditor:function(_1009,_100a,_100b){
var p=this.cell.getNode(_100b),box=dojo.contentBox(p);
dojo.marginBox(this.editor.domNode,{w:box.w});
},focus:function(_100e,_100f){
if(this.editor){
setTimeout(dojo.hitch(this.editor,function(){
dojox.grid.fire(this,"focus");
}),0);
}
},_finish:function(_1010){
this.inherited(arguments);
dojox.grid.removeNode(this.editor.domNode);
}});
dojo.declare("dojox.grid.editors.ComboBox",dojox.grid.editors.Dijit,{editorClass:"dijit.form.ComboBox",getEditorProps:function(_1011){
var items=[];
dojo.forEach(this.cell.options,function(o){
items.push({name:o,value:o});
});
var store=new dojo.data.ItemFileReadStore({data:{identifier:"name",items:items}});
return dojo.mixin({},this.cell.editorProps||{},{value:_1011,store:store});
},getValue:function(){
var e=this.editor;
e.setDisplayedValue(e.getDisplayedValue());
return e.getValue();
}});
dojo.declare("dojox.grid.editors.DateTextBox",dojox.grid.editors.Dijit,{editorClass:"dijit.form.DateTextBox",setValue:function(_1016,_1017){
if(this.editor){
this.editor.setValue(new Date(_1017));
}else{
this.inherited(arguments);
}
},getEditorProps:function(_1018){
return dojo.mixin(this.inherited(arguments),{value:new Date(_1018)});
}});
dojo.declare("dojox.grid.editors.CheckBox",dojox.grid.editors.Dijit,{editorClass:"dijit.form.CheckBox",getValue:function(){
return this.editor.checked;
},setValue:function(_1019,_101a){
if(this.editor&&this.editor.setAttribute){
this.editor.setAttribute("checked",_101a);
}else{
this.inherited(arguments);
}
},sizeEditor:function(_101b,_101c,_101d){
return;
}});
dojo.declare("dojox.grid.editors.Editor",dojox.grid.editors.Dijit,{editorClass:"dijit.Editor",getEditorProps:function(_101e){
return dojo.mixin({},this.cell.editorProps||{},{height:this.cell.editorHeight||"100px"});
},createEditor:function(_101f,_1020,_1021){
var _1022=new this.editorClass(this.getEditorProps(_1020),_101f);
dojo.connect(_1022,"onLoad",dojo.hitch(this,"populateEditor"));
return _1022;
},formatNode:function(_1023,_1024,_1025){
this.content=_1024;
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
if(!dojo._hasResource["dojox.grid.Grid"]){
dojo._hasResource["dojox.grid.Grid"]=true;
dojo.provide("dojox.grid.Grid");
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
},_setModel:function(_1028){
this.model=_1028;
if(this.model){
this.model.observer(this);
this.model.measure();
this.indexCellFields();
}
},setModel:function(_1029){
if(this.model){
this.model.notObserver(this);
}
this._setModel(_1029);
},get:function(_102a){
return this.grid.model.getDatum(_102a,this.fieldIndex);
},modelAllChange:function(){
this.rowCount=(this.model?this.model.getRowCount():0);
this.updateRowCount(this.rowCount);
},modelRowChange:function(_102b,_102c){
this.updateRow(_102c);
},modelDatumChange:function(_102d,_102e,_102f){
this.updateRow(_102e);
},modelFieldsChange:function(){
this.indexCellFields();
this.render();
},modelInsertion:function(_1030){
this.updateRowCount(this.model.getRowCount());
},modelRemoval:function(_1031){
this.updateRowCount(this.model.getRowCount());
},getCellName:function(_1032){
var v=this.model.fields.values,i=_1032.fieldIndex;
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
},canSort:function(_1038){
var f=this.getSortField(_1038);
return f&&this.model.canSort(f);
},getSortField:function(_103a){
var c=this.getCell(this.getSortIndex(_103a));
return (c.fieldIndex+1)*(this.sortInfo>0?1:-1);
},sort:function(){
this.edit.apply();
this.model.sort(this.getSortField());
},addRow:function(_103c,_103d){
this.edit.apply();
var i=_103d||-1;
if(i<0){
i=this.selection.getFirstSelected()||0;
}
if(i<0){
i=0;
}
this.model.insert(_103c,i);
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
},canEdit:function(_1042,_1043){
return (this.model.canModify?this.model.canModify(_1043):true);
},doStartEdit:function(_1044,_1045){
this.model.beginModifyRow(_1045);
this.onStartEdit(_1044,_1045);
},doApplyCellEdit:function(_1046,_1047,_1048){
this.model.setDatum(_1046,_1047,_1048);
this.onApplyCellEdit(_1046,_1047,_1048);
},doCancelEdit:function(_1049){
this.model.cancelModifyRow(_1049);
this.onCancelEdit.apply(this,arguments);
},doApplyEdit:function(_104a){
this.model.endModifyRow(_104a);
this.onApplyEdit(_104a);
},styleRowState:function(inRow){
if(this.model.getState){
var _104c=this.model.getState(inRow.index),c="";
for(var i=0,ss=["inflight","error","inserting"],s;s=ss[i];i++){
if(_104c[s]){
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
var _1056=function(n){
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
v.width=_1056(cg);
}
return v;
});
if(!props.structure.length){
props.structure.push({__span:Infinity,cells:[]});
}
d.query("thead > tr",node).forEach(function(tr,_105e){
var _105f=0;
var _1060=0;
var _1061;
var cView=null;
d.query("> th",tr).map(function(th){
if(!cView){
_1061=0;
cView=props.structure[0];
}else{
if(_105f>=(_1061+cView.__span)){
_1060++;
_1061+=cView.__span;
lastView=cView;
cView=props.structure[_1060];
}
}
var cell={name:d.trim(d.attr(th,"name")||th.innerHTML),field:d.trim(d.attr(th,"field")||""),colSpan:parseInt(d.attr(th,"colspan")||1)};
_105f+=cell.colSpan;
cell.field=cell.field||cell.name;
cell.width=_1056(th);
if(!cView.cells[_105e]){
cView.cells[_105e]=[];
}
cView.cells[_105e].push(cell);
});
});
}
return new dojox.Grid(props,node);
};
dojox.grid.Grid=dojox.Grid;
}
if(!dojo._hasResource["dojox.xml.DomParser"]){
dojo._hasResource["dojox.xml.DomParser"]=true;
dojo.provide("dojox.xml.DomParser");
dojox.xml.DomParser=new (function(){
var _1065={ELEMENT:1,ATTRIBUTE:2,TEXT:3,CDATA_SECTION:4,PROCESSING_INSTRUCTION:7,COMMENT:8,DOCUMENT:9};
var _1066=/<([^>\/\s+]*)([^>]*)>([^<]*)/g;
var _1067=/([^=]*)="([^"]*)"/g;
var _1068=/<!ENTITY\s+([^"]*)\s+"([^"]*)">/g;
var _1069=/<!\[CDATA\[([\u0001-\uFFFF]*?)\]\]>/g;
var _106a=/<!--([\u0001-\uFFFF]*?)-->/g;
var trim=/^\s+|\s+$/g;
var _106c=/\s+/g;
var egt=/\&gt;/g;
var elt=/\&lt;/g;
var equot=/\&quot;/g;
var eapos=/\&apos;/g;
var eamp=/\&amp;/g;
var dNs="_def_";
function _doc(){
return new (function(){
var all={};
this.nodeType=_1065.DOCUMENT;
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
return keys[id];
};
this.byName=this.getElementsByTagName=byName;
this.byNameNS=this.getElementsByTagNameNS=byNameNS;
this.childrenByName=childrenByName;
})();
};
function byName(name){
function __(node,name,arr){
dojo.forEach(node.childNodes,function(c){
if(c.nodeType==_1065.ELEMENT){
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
if(c.nodeType==_1065.ELEMENT){
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
if(c.nodeType==_1065.ELEMENT){
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
return {nodeType:_1065.TEXT,nodeName:"#text",nodeValue:v.replace(_106c," ").replace(egt,">").replace(elt,"<").replace(eapos,"'").replace(equot,"\"").replace(eamp,"&")};
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
var _109c,eRe=[];
if(_1068.test(str)){
_1068.lastIndex=0;
while((_109c=_1068.exec(str))!=null){
eRe.push({entity:"&"+_109c[1].replace(trim,"")+";",expression:_109c[2]});
}
for(var i=0;i<eRe.length;i++){
str=str.replace(new RegExp(eRe[i].entity,"g"),eRe[i].expression);
}
}
}
var _109f=[],cdata;
while((cdata=_1069.exec(str))!=null){
_109f.push(cdata[1]);
}
for(var i=0;i<_109f.length;i++){
str=str.replace(_109f[i],i);
}
var _10a1=[],_10a2;
while((_10a2=_106a.exec(str))!=null){
_10a1.push(_10a2[1]);
}
for(i=0;i<_10a1.length;i++){
str=str.replace(_10a1[i],i);
}
var res,obj=root;
while((res=_1066.exec(str))!=null){
if(res[2].charAt(0)=="/"){
if(obj.parentNode){
obj=obj.parentNode;
}
var text=res[3];
if(text.length>0){
obj.appendChild(_createTextNode(text));
}
}else{
if(res[1].length>0){
if(res[1].charAt(0)=="?"){
var name=res[1].substr(1);
var _10a7=res[2].substr(0,res[2].length-2);
obj.childNodes.push({nodeType:_1065.PROCESSING_INSTRUCTION,nodeName:name,nodeValue:_10a7});
}else{
if(res[1].charAt(0)=="!"){
if(res[1].indexOf("![CDATA[")==0){
var val=parseInt(res[1].replace("![CDATA[","").replace("]]",""));
obj.childNodes.push({nodeType:_1065.CDATA_SECTION,nodeName:"#cdata-section",nodeValue:_109f[val]});
}else{
if(res[1].substr(0,3)=="!--"){
var val=parseInt(res[1].replace("!--","").replace("--",""));
obj.childNodes.push({nodeType:_1065.COMMENT,nodeName:"#comment",nodeValue:_10a1[val]});
}
}
}else{
var name=res[1].replace(trim,"");
var o={nodeType:_1065.ELEMENT,nodeName:name,localName:name,namespace:dNs,ownerDocument:root,attributes:[],parentNode:null,childNodes:[]};
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
while((attr=_1067.exec(res[2]))!=null){
if(attr.length>0){
var name=attr[1].replace(trim,"");
var val=attr[2].replace(_106c," ").replace(egt,">").replace(elt,"<").replace(eapos,"'").replace(equot,"\"").replace(eamp,"&");
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
o.attributes.push({nodeType:_1065.ATTRIBUTE,nodeName:name,localName:ln,namespace:ns,nodeValue:val});
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
if(e.nodeType==_1065.ELEMENT){
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
(function(){
dojox.string.Builder=function(str){
this.b=dojo.isIE?[]:"";
if(str){
this.append(str);
}
};
var m={append:function(s){
return this.appendArray(dojo._toArray(arguments));
},concat:function(s){
return this.append(s);
},appendArray:function(_10b3){
this.b=String.prototype.concat.apply(this.b,_10b3);
return this;
},clear:function(){
this._clear();
this.length=0;
return this;
},replace:function(_10b4,_10b5){
var s=this.toString();
s=s.replace(_10b4,_10b5);
this._reset(s);
this.length=s.length;
return this;
},remove:function(start,len){
if(len==0){
return this;
}
var s=this.toString();
this.clear();
if(start>0){
this.append(s.substring(0,start));
}
if(start+len<s.length){
this.append(s.substring(start+len));
}
return this;
},insert:function(index,str){
var s=this.toString();
this.clear();
if(index==0){
this.append(str);
this.append(s);
return this;
}else{
this.append(s.substring(0,index));
this.append(str);
this.append(s.substring(index));
}
return this;
},toString:function(){
return this.b;
},_clear:function(){
this.b="";
},_reset:function(s){
this.b=s;
}};
if(dojo.isIE){
dojo.mixin(m,{toString:function(){
return this.b.join("");
},appendArray:function(_10be){
this.b=this.b.concat(_10be);
return this;
},_clear:function(){
this.b=[];
},_reset:function(s){
this.b=[s];
}});
}
dojo.extend(dojox.string.Builder,m);
})();
}
if(!dojo._hasResource["dojox.string.tokenize"]){
dojo._hasResource["dojox.string.tokenize"]=true;
dojo.provide("dojox.string.tokenize");
dojox.string.tokenize=function(str,re,_10c2,_10c3){
var _10c4=[];
var match,_10c6,_10c7=0;
while(match=re.exec(str)){
_10c6=str.slice(_10c7,re.lastIndex-match[0].length);
if(_10c6.length){
_10c4.push(_10c6);
}
if(_10c2){
if(dojo.isOpera){
var copy=match.slice(0);
while(copy.length<match.length){
copy.push(null);
}
match=copy;
}
var _10c9=_10c2.apply(_10c3,match.slice(1).concat(_10c4.length));
if(typeof _10c9!="undefined"){
_10c4.push(_10c9);
}
}
_10c7=re.lastIndex;
}
_10c6=str.slice(_10c7);
if(_10c6.length){
_10c4.push(_10c6);
}
return _10c4;
};
}
if(!dojo._hasResource["dojox.dtl._base"]){
dojo._hasResource["dojox.dtl._base"]=true;
dojo.provide("dojox.dtl._base");
(function(){
var dd=dojox.dtl;
dd._Context=dojo.extend(function(dict){
dojo.mixin(this,dict||{});
this._dicts=[];
},{push:function(){
var dict={};
var keys=this.getKeys();
for(var i=0,key;key=keys[i];i++){
dict[key]=this[key];
delete this[key];
}
this._dicts.unshift(dict);
},pop:function(){
if(!this._dicts.length){
throw new Error("pop() called on empty Context");
}
var dict=this._dicts.shift();
dojo.mixin(this,dict);
},getKeys:function(){
var keys=[];
for(var key in this){
if(this.hasOwnProperty(key)&&key!="_dicts"&&key!="_this"){
keys.push(key);
}
}
return keys;
},get:function(key,_10d4){
if(typeof this[key]!="undefined"){
return this._normalize(this[key]);
}
for(var i=0,dict;dict=this._dicts[i];i++){
if(typeof dict[key]!="undefined"){
return this._normalize(dict[key]);
}
}
return _10d4;
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
this.push();
if(dict){
dojo.mixin(this,dict);
}
}});
var ddt=dd.text={types:{tag:-1,varr:-2,text:3},pySplit:function(str){
str=dojo.trim(str);
return (!str.length)?[]:str.split(/\s+/g);
},_get:function(_10db,name,_10dd){
var _10de=dd.register.get(_10db,name.toLowerCase(),_10dd);
if(!_10de){
if(!_10dd){
throw new Error("No tag found for "+name);
}
return null;
}
var fn=_10de[1];
var _10e0=_10de[2];
var parts;
if(fn.indexOf(":")!=-1){
parts=fn.split(":");
fn=parts.pop();
}
dojo["require"](_10e0);
var _10e2=dojo.getObject(_10e0);
return _10e2[fn||name]||_10e2[name+"_"];
},getTag:function(name,_10e4){
return ddt._get("tag",name,_10e4);
},getFilter:function(name,_10e6){
return ddt._get("filter",name,_10e6);
},getTemplate:function(file){
return new dd.Template(dd.getTemplateString(file));
},getTemplateString:function(file){
return dojo._getText(file.toString())||"";
},_resolveLazy:function(_10e9,sync,json){
if(sync){
if(json){
return dojo.fromJson(dojo._getText(_10e9))||{};
}else{
return dd.text.getTemplateString(_10e9);
}
}else{
return dojo.xhrGet({handleAs:(json)?"json":"text",url:_10e9});
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
return (typeof arg=="undefined")||(dojo.isString(arg)&&(arg.match(/^\s*[<{]/)||arg.indexOf(" ")!=-1));
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
var types=ddt.types;
if(varr){
return [types.varr,varr];
}else{
if(load){
var parts=dd.text.pySplit(tag);
for(var i=0,part;part=parts[i];i++){
dojo["require"](part);
}
}else{
return [types.tag,tag];
}
}
}};
dd.Template=dojo.extend(function(_10fb){
var str=ddt._resolveTemplateArg(_10fb,true)||"";
var _10fd=ddt.tokenize(str);
var _10fe=new dd._Parser(_10fd);
this.nodelist=_10fe.parse();
},{update:function(node,_1100){
return ddt._resolveContextArg(_1100).addCallback(this,function(_1101){
var _1102=this.render(new dd._Context(_1101));
if(node.forEach){
node.forEach(function(item){
item.innerHTML=_1102;
});
}else{
dojo.byId(node).innerHTML=_1102;
}
return this;
});
},render:function(_1104,_1105){
_1105=_1105||this.getBuffer();
_1104=_1104||new dd._Context({});
return this.nodelist.render(_1104,_1105)+"";
},getBuffer:function(){
return new dojox.string.Builder();
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
has[i]=(typeof arguments[i]!="undefined"&&dojo.isString(arguments[i])&&arguments[i]);
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
},resolve:function(_110e){
var str=this.resolvePath(this.key,_110e);
for(var i=0,_1111;_1111=this.filters[i];i++){
if(_1111[1]){
if(_1111[1][0]){
str=_1111[0](str,this.resolvePath(_1111[1][1],_110e));
}else{
str=_1111[0](str,_1111[1][1]);
}
}else{
str=_1111[0](str);
}
}
return str;
},resolvePath:function(path,_1113){
var _1114,parts;
var first=path.charAt(0);
var last=path.slice(-1);
if(!isNaN(parseInt(first))){
_1114=(path.indexOf(".")==-1)?parseInt(path):parseFloat(path);
}else{
if(first=="\""&&first==last){
_1114=path.slice(1,-1);
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
_1114=_1113.get(parts[0]);
for(var i=1;i<parts.length;i++){
var part=parts[i];
if(_1114){
if(dojo.isObject(_1114)&&part=="items"&&typeof _1114[part]=="undefined"){
var items=[];
for(var key in _1114){
items.push([key,_1114[key]]);
}
_1114=items;
continue;
}
if(_1114.get&&dojo.isFunction(_1114.get)){
_1114=_1114.get(part);
}else{
if(typeof _1114[part]=="undefined"){
_1114=_1114[part];
break;
}else{
_1114=_1114[part];
}
}
if(dojo.isFunction(_1114)){
if(_1114.alters_data){
_1114="";
}else{
_1114=_1114();
}
}
}else{
return "";
}
}
}
}
return _1114;
}});
dd._TextNode=dd._Node=dojo.extend(function(obj){
this.contents=obj;
},{set:function(data){
this.contents=data;
},render:function(_111e,_111f){
return _111f.concat(this.contents);
}});
dd._NodeList=dojo.extend(function(nodes){
this.contents=nodes||[];
this.last="";
},{push:function(node){
this.contents.push(node);
},render:function(_1122,_1123){
for(var i=0;i<this.contents.length;i++){
_1123=this.contents[i].render(_1122,_1123);
if(!_1123){
throw new Error("Template must return buffer");
}
}
return _1123;
},dummyRender:function(_1125){
return this.render(_1125,dd.Template.prototype.getBuffer()).toString();
},unrender:function(){
return arguments[1];
},clone:function(){
return this;
}});
dd._VarNode=dojo.extend(function(str){
this.contents=new dd._Filter(str);
},{render:function(_1127,_1128){
var str=this.contents.resolve(_1127);
return _1128.concat(str);
}});
dd._noOpNode=new function(){
this.render=this.unrender=function(){
return arguments[1];
};
this.clone=function(){
return this;
};
};
dd._Parser=dojo.extend(function(_112a){
this.contents=_112a;
},{i:0,parse:function(_112b){
var types=ddt.types;
var _112d={};
_112b=_112b||[];
for(var i=0;i<_112b.length;i++){
_112d[_112b[i]]=true;
}
var _112f=new dd._NodeList();
while(this.i<this.contents.length){
token=this.contents[this.i++];
if(dojo.isString(token)){
_112f.push(new dd._TextNode(token));
}else{
var type=token[0];
var text=token[1];
if(type==types.varr){
_112f.push(new dd._VarNode(text));
}else{
if(type==types.tag){
if(_112d[text]){
--this.i;
return _112f;
}
var cmd=text.split(/\s+/g);
if(cmd.length){
cmd=cmd[0];
var fn=ddt.getTag(cmd);
if(fn){
_112f.push(fn(this,text));
}
}
}
}
}
}
if(_112b.length){
throw new Error("Could not find closing tag(s): "+_112b.toString());
}
this.contents.length=0;
return _112f;
},next:function(){
var token=this.contents[this.i++];
return {type:token[0],text:token[1]};
},skipPast:function(_1135){
var types=ddt.types;
while(this.i<this.contents.length){
var token=this.contents[this.i++];
if(token[0]==types.tag&&token[1]==_1135){
return;
}
}
throw new Error("Unclosed tag found when looking for "+_1135);
},getVarNodeConstructor:function(){
return dd._VarNode;
},getTextNodeConstructor:function(){
return dd._TextNode;
},getTemplate:function(file){
return new dd.Template(file);
}});
dd.register={_registry:{attributes:[],tags:[],filters:[]},get:function(_1139,name){
var _113b=dd.register._registry[_1139+"s"];
for(var i=0,entry;entry=_113b[i];i++){
if(dojo.isString(entry[0])){
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
var _113f=dd.register._registry.attributes;
for(var i=0,entry;entry=_113f[i];i++){
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
},_any:function(type,base,_1145){
for(var path in _1145){
for(var i=0,fn;fn=_1145[path][i];i++){
var key=fn;
if(dojo.isArray(fn)){
key=fn[0];
fn=fn[1];
}
if(dojo.isString(key)){
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
},tags:function(base,_114c){
dd.register._any("tags",base,_114c);
},filters:function(base,_114e){
dd.register._any("filters",base,_114e);
}};
dd.register.tags("dojox.dtl.tag",{"date":["now"],"logic":["if","for","ifequal","ifnotequal"],"loader":["extends","block","include","load","ssi"],"misc":["comment","debug","filter","firstof","spaceless","templatetag","widthratio","with"],"loop":["cycle","ifchanged","regroup"]});
dd.register.filters("dojox.dtl.filter",{"dates":["date","time","timesince","timeuntil"],"htmlstrings":["escape","linebreaks","linebreaksbr","removetags","striptags"],"integers":["add","get_digit"],"lists":["dictsort","dictsortreversed","first","join","length","length_is","random","slice","unordered_list"],"logic":["default","default_if_none","divisibleby","yesno"],"misc":["filesizeformat","pluralize","phone2numeric","pprint"],"strings":["addslashes","capfirst","center","cut","fix_ampersands","floatformat","iriencode","linenumbers","ljust","lower","make_list","rjust","slugify","stringformat","title","truncatewords","truncatewords_html","upper","urlencode","urlize","urlizetrunc","wordcount","wordwrap"]});
})();
}
if(!dojo._hasResource["dojox.dtl.filter.htmlstrings"]){
dojo._hasResource["dojox.dtl.filter.htmlstrings"]=true;
dojo.provide("dojox.dtl.filter.htmlstrings");
dojo.mixin(dojox.dtl.filter.htmlstrings,{_escapeamp:/&/g,_escapelt:/</g,_escapegt:/>/g,_escapeqt:/'/g,_escapedblqt:/"/g,_linebreaksrn:/(\r\n|\n\r)/g,_linebreaksn:/\n{2,}/g,_linebreakss:/(^\s+|\s+$)/g,_linebreaksbr:/\n/g,_removetagsfind:/[a-z0-9]+/g,_striptags:/<[^>]*?>/g,escape:function(value){
var dh=dojox.dtl.filter.htmlstrings;
return value.replace(dh._escapeamp,"&amp;").replace(dh._escapelt,"&lt;").replace(dh._escapegt,"&gt;").replace(dh._escapedblqt,"&quot;").replace(dh._escapeqt,"&#39;");
},linebreaks:function(value){
var _1152=[];
var dh=dojox.dtl.filter.htmlstrings;
value=value.replace(dh._linebreaksrn,"\n");
var parts=value.split(dh._linebreaksn);
for(var i=0;i<parts.length;i++){
var part=parts[i].replace(dh._linebreakss,"").replace(dh._linebreaksbr,"<br />");
_1152.push("<p>"+part+"</p>");
}
return _1152.join("\n\n");
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
dojox.string.sprintf=function(_115f,_1160){
for(var args=[],i=1;i<arguments.length;i++){
args.push(arguments[i]);
}
var _1163=new dojox.string.sprintf.Formatter(_115f);
return _1163.format.apply(_1163,args);
};
dojox.string.sprintf.Formatter=function(_1164){
var _1165=[];
this._mapped=false;
this._format=_1164;
this._tokens=dojox.string.tokenize(_1164,this._re,this._parseDelim,this);
};
dojo.extend(dojox.string.sprintf.Formatter,{_re:/\%(?:\(([\w_]+)\)|([1-9]\d*)\$)?([0 +\-\#]*)(\*|\d+)?(\.)?(\*|\d+)?[hlL]?([\%scdeEfFgGiouxX])/g,_parseDelim:function(_1166,_1167,flags,_1169,_116a,_116b,_116c){
if(_1166){
this._mapped=true;
}
return {mapping:_1166,intmapping:_1167,flags:flags,_minWidth:_1169,period:_116a,_precision:_116b,specifier:_116c};
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
}},e:{isDouble:true,doubleNotation:"e"},E:{extend:["e"],toUpper:true},f:{isDouble:true,doubleNotation:"f"},F:{extend:["f"]},g:{isDouble:true,doubleNotation:"g"},G:{extend:["g"],toUpper:true}},format:function(_1170){
if(this._mapped&&typeof _1170!="object"){
throw new Error("format requires a mapping");
}
var str="";
var _1172=0;
for(var i=0,token;i<this._tokens.length;i++){
token=this._tokens[i];
if(typeof token=="string"){
str+=token;
}else{
if(this._mapped){
if(typeof _1170[token.mapping]=="undefined"){
throw new Error("missing key "+token.mapping);
}
token.arg=_1170[token.mapping];
}else{
if(token.intmapping){
var _1172=parseInt(token.intmapping)-1;
}
if(_1172>=arguments.length){
throw new Error("got "+arguments.length+" printf arguments, insufficient for '"+this._format+"'");
}
token.arg=arguments[_1172++];
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
var _1178=this._specifiers[token.specifier];
if(typeof _1178=="undefined"){
throw new Error("unexpected specifier '"+token.specifier+"'");
}
if(_1178.extend){
dojo.mixin(_1178,this._specifiers[_1178.extend]);
delete _1178.extend;
}
dojo.mixin(token,_1178);
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
token.minWidth=parseInt(arguments[_1172++]);
if(isNaN(token.minWidth)){
throw new Error("the argument for * width at position "+_1172+" is not a number in "+this._format);
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
token.precision=parseInt(arguments[_1172++]);
if(isNaN(token.precision)){
throw Error("the argument for * precision at position "+_1172+" is not a number in "+this._format);
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
toke.art=token.toUpper?token.arg.toUpperCase():token.arg.toLowerCase();
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
},zeroPad:function(token,_117e){
_117e=(arguments.length==2)?_117e:token.precision;
if(typeof token.arg!="string"){
token.arg=""+token.arg;
}
var _117f=_117e-10;
while(token.arg.length<_117f){
token.arg=(token.rightJustify)?token.arg+this._zeros10:this._zeros10+token.arg;
}
var pad=_117e-token.arg.length;
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
},spacePad:function(token,_1183){
_1183=(arguments.length==2)?_1183:token.minWidth;
if(typeof token.arg!="string"){
token.arg=""+token.arg;
}
var _1184=_1183-10;
while(token.arg.length<_1184){
token.arg=(token.rightJustify)?token.arg+this._spaces10:this._spaces10+token.arg;
}
var pad=_1183-token.arg.length;
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
var _1199=[];
var width=(lines.length+"").length;
for(var i=0,line;i<lines.length;i++){
line=lines[i];
_1199.push(df.strings.ljust(i+1,width)+". "+df.htmlstrings.escape(line));
}
return _1199.join("\n");
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
var _11a1=[];
if(typeof value=="number"){
value=value+"";
}
if(value.charAt){
for(var i=0;i<value.length;i++){
_11a1.push(value.charAt(i));
}
return _11a1;
}
if(typeof value=="object"){
for(var key in value){
_11a1.push(value[key]);
}
return _11a1;
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
var _11a9=dojox.dtl.filter.strings._strings;
if(!_11a9[arg]){
_11a9[arg]=new dojox.string.sprintf.Formatter("%"+arg);
}
return _11a9[arg].format(value);
},title:function(value){
var last,title="";
for(var i=0,_11ae;i<value.length;i++){
_11ae=value.charAt(i);
if(last==" "||last=="\n"||last=="\t"||!last){
title+=_11ae.toUpperCase();
}else{
title+=_11ae.toLowerCase();
}
last=_11ae;
}
return title;
},_truncatewords:/[ \n\r\t]/,truncatewords:function(value,arg){
arg=parseInt(arg);
if(!arg){
return value;
}
for(var i=0,j=value.length,count=0,_11b4,last;i<value.length;i++){
_11b4=value.charAt(i);
if(dojox.dtl.filter.strings._truncatewords.test(last)){
if(!dojox.dtl.filter.strings._truncatewords.test(_11b4)){
++count;
if(count==arg){
return value.substring(0,j+1);
}
}
}else{
if(!dojox.dtl.filter.strings._truncatewords.test(_11b4)){
j=i;
}
}
last=_11b4;
}
return value;
},_truncate_words:/(&.*?;|<.*?>|(\w[\w\-]*))/g,_truncate_tag:/<(\/)?([^ ]+?)(?: (\/)| .*?)?>/,_truncate_singlets:{br:true,col:true,link:true,base:true,img:true,param:true,area:true,hr:true,input:true},truncatewords_html:function(value,arg){
arg=parseInt(arg);
if(arg<=0){
return "";
}
var _11b8=dojox.dtl.filter.strings;
var words=0;
var open=[];
var _11bb=dojox.string.tokenize(value,_11b8._truncate_words,function(all,word){
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
var tag=all.match(_11b8._truncate_tag);
if(!tag||words>=arg){
return;
}
var _11bf=tag[1];
var _11c0=tag[2].toLowerCase();
var _11c1=tag[3];
if(_11bf||_11b8._truncate_singlets[_11c0]){
}else{
if(_11bf){
var i=dojo.indexOf(open,_11c0);
if(i!=-1){
open=open.slice(i+1);
}
}else{
open.unshift(_11c0);
}
}
return all;
}).join("");
_11bb=_11bb.replace(/\s+$/g,"");
for(var i=0,tag;tag=open[i];i++){
_11bb+="</"+tag+">";
}
return _11bb;
},upper:function(value){
return value.toUpperCase();
},urlencode:function(value){
return dojox.dtl.filter.strings._urlquote(value);
},_urlize:/^((?:[(>]|&lt;)*)(.*?)((?:[.,)>\n]|&gt;)*)$/,_urlize2:/^\S+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+$/,urlize:function(value){
return dojox.dtl.filter.strings.urlizetrunc(value);
},urlizetrunc:function(value,arg){
arg=parseInt(arg);
return dojox.string.tokenize(value,/(\S+)/g,function(word){
var _11cb=dojox.dtl.filter.strings._urlize.exec(word);
if(!_11cb){
return word;
}
var lead=_11cb[1];
var _11cd=_11cb[2];
var trail=_11cb[3];
var _11cf=_11cd.indexOf("www.")==0;
var hasAt=_11cd.indexOf("@")!=-1;
var _11d1=_11cd.indexOf(":")!=-1;
var _11d2=_11cd.indexOf("http://")==0;
var _11d3=_11cd.indexOf("https://")==0;
var _11d4=/[a-zA-Z0-9]/.test(_11cd.charAt(0));
var last4=_11cd.substring(_11cd.length-4);
var _11d6=_11cd;
if(arg>3){
_11d6=_11d6.substring(0,arg-3)+"...";
}
if(_11cf||(!hasAt&&!_11d2&&_11cd.length&&_11d4&&(last4==".org"||last4==".net"||last4==".com"))){
return "<a href=\"http://"+_11cd+"\" rel=\"nofollow\">"+_11d6+"</a>";
}else{
if(_11d2||_11d3){
return "<a href=\""+_11cd+"\" rel=\"nofollow\">"+_11d6+"</a>";
}else{
if(hasAt&&!_11cf&&!_11d1&&dojox.dtl.filter.strings._urlize2.test(_11cd)){
return "<a href=\"mailto:"+_11cd+"\">"+_11cd+"</a>";
}
}
}
return word;
}).join("");
},wordcount:function(value){
return dojox.dtl.text.pySplit(value).length;
},wordwrap:function(value,arg){
arg=parseInt(arg);
var _11da=[];
var parts=value.split(/ /g);
if(parts.length){
var word=parts.shift();
_11da.push(word);
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
_11da.push("\n");
pos=lines[lines.length-1].length;
}else{
_11da.push(" ");
if(lines.length>1){
pos=lines[lines.length-1].length;
}
}
_11da.push(word);
}
}
return _11da.join("");
}});
}
if(!dojo._hasResource["pion.login"]){
dojo._hasResource["pion.login"]=true;
dojo.provide("pion.login");
pion.login.logout=function(){
dojo.cookie("logged_in","",{expires:-1});
dojo.xhrGet({url:"/logout",preventCache:true,handleAs:"xml",timeout:5000,load:function(_11e0,_11e1){
console.debug("logout response: ",_11e0);
return _11e0;
},error:function(_11e2,_11e3){
console.error("logout error: HTTP status code = ",_11e3.xhr.status);
return _11e2;
}});
};
pion.login.expire=function(){
dojo.xhrGet({url:"/logout",preventCache:true,handleAs:"xml",timeout:5000,load:function(_11e4,_11e5){
console.debug("logout response: ",_11e4);
return _11e4;
},error:function(_11e6,_11e7){
console.error("logout error: HTTP status code = ",_11e7.xhr.status);
return _11e6;
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
pion.login.doLoginDialog=function(_11e8){
pion.login.login_pending=true;
var _11e9=dijit.byId("ops_toggle_button");
if(!_11e9.checked){
_11e9.setAttribute("checked",true);
pion.login.ops_temporarily_suppressed=true;
}
var _11ea=new pion.login.LoginDialog({});
_11ea.setValues({Username:pion.login.latestUsername});
dojo.connect(_11ea.domNode,"onkeypress",function(event){
if(event.keyCode==dojo.keys.ENTER){
_11ea.execute(_11ea.getValues());
_11ea.destroyRecursive();
}
});
_11ea.show();
_11ea.execute=function(_11ec){
console.debug("dialogFields = ",_11ec);
pion.login.latestUsername=_11ec.Username;
dojo.xhrGet({url:"/login?user="+_11ec.Username+"&pass="+_11ec.Password,preventCache:true,handleAs:"xml",load:function(_11ed,_11ee){
pion.login.login_pending=false;
pion.login.onLoginSuccess();
console.debug("login response: ioArgs.xhr = ",_11ee.xhr);
if(pion.login.ops_temporarily_suppressed){
_11e9.setAttribute("checked",false);
pion.login.ops_temporarily_suppressed=false;
}
if(_11e8){
_11e8();
}
return _11ed;
},error:function(_11ef,_11f0){
pion.login.login_pending=false;
if(_11f0.xhr.status==401){
pion.login.doLoginDialog(_11e8);
return;
}
console.error("login error: HTTP status code = ",_11f0.xhr.status);
console.error("ioArgs = ",_11f0);
return _11ef;
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
var _11f1=new dojo.dnd.Target(this.domNode,{accept:["connector"]});
dojo.connect(_11f1,"onDndDrop",pion.reactors.handleDropOnReactor);
this.name_div=document.createElement("div");
this.name_div.innerHTML=this.config.Name;
dojo.addClass(this.name_div,"name");
this.domNode.appendChild(this.name_div);
var _this=this;
this.run_button=new dijit.form.ToggleButton();
var _11f3=this.run_button.domNode;
dojo.connect(_11f3,"click",function(){
dojo.xhrPut({url:"/config/reactors/"+_this.config["@id"]+(_this.run_button.checked?"/start":"/stop"),error:pion.getXhrErrorHandler(dojo.xhrPut)});
});
this.domNode.appendChild(_11f3);
this.ops_per_sec=document.createElement("span");
dojo.addClass(this.ops_per_sec,"ops_per_sec");
this.ops_per_sec.innerHTML="0";
this.domNode.appendChild(this.ops_per_sec);
this.domNode.setAttribute("reactor_type",this.config.Plugin);
var _11f4=pion.reactors.categories[this.config.Plugin];
dojo.addClass(this.domNode,_11f4);
if(_11f4!="collection"){
this.run_button.setAttribute("checked",true);
}
dojo.addClass(this.domNode,"moveable");
dojo.addClass(this.domNode,"reactor");
dojo.addClass(this.domNode,this.config.Plugin);
var m5=new dojo.dnd.move.parentConstrainedMoveable(this.domNode,{area:"padding",within:true});
var c=m5.constraints();
c.r=c.l+c.w-this.offsetWidth;
c.b=c.t+c.h-this.offsetHeight;
var _11f7={l:this.config.X,t:this.config.Y};
console.debug("mouseLeftTop: ",_11f7);
var _11f8=pion.reactors.getNearbyGridPointInBox(c,_11f7);
this.domNode.style.top=_11f8.t+"px";
this.domNode.style.left=_11f8.l+"px";
this.domNode.style.position="absolute";
this.domNode.style.background="url(../plugins/reactors/"+_11f4+"/"+this.config.Plugin+"/bg-moveable.png) repeat-x";
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
m5.onMove=function(mover,_11fc){
var _11fd=pion.reactors.getNearbyGridPointInBox(this.constraintBox,_11fc);
dojo.marginBox(mover.node,_11fd);
for(var i=0;i<_this.reactor_inputs.length;++i){
pion.reactors.updateConnectionLine(_this.reactor_inputs[i].line,_this.reactor_inputs[i].source.domNode,_this.domNode);
}
for(var i=0;i<_this.reactor_outputs.length;++i){
pion.reactors.updateConnectionLine(_this.reactor_outputs[i].line,_this.domNode,_this.reactor_outputs[i].sink.domNode);
}
};
dojo.connect(m5,"onMoveStop",this,this.handleMoveStop);
},_initOptions:function(_11ff,_1200){
var store=pion.reactors.config_store;
var _this=this;
store.fetch({query:{"@id":_11ff["@id"]},onItem:function(item){
_11ff.options=[];
for(var _1204 in _1200){
_11ff[_1204]=_1200[_1204];
if(store.hasAttribute(item,_1204)){
_11ff[_1204]=(store.getValue(item,_1204).toString()=="true");
}
if(_11ff[_1204]){
_11ff.options.push(_1204);
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
dojo.rawXhrPut({url:"/config/reactors/"+this.config["@id"],contentType:"text/xml",handleAs:"xml",putData:this.put_data,load:function(_1207){
console.debug("response: ",_1207);
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:this.put_data})});
}});
dojo.declare("plugins.reactors.ReactorIcon",[],{});
dojo.declare("plugins.reactors.ReactorInitDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">${title}</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<table>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Name:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Comments:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td>\r\n\t\t\t</tr>\r\n\t\t</table>\r\n\t</div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick: tryConfig\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onclick: hide\">Cancel</button>\r\n\t</div>\r\n\t<span dojoAttachPoint=\"tabEnd\" tabindex=\"0\"></span>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,tryConfig:function(){
var _1208=this.getValues();
console.debug(_1208);
console.debug("this.plugin = ",this.plugin);
var _1209=pion.reactors.workspace_box;
var dc=dojo.coords(_1209.node);
var X=Math.floor(pion.reactors.last_x-dc.x);
var Y=Math.floor(pion.reactors.last_y-dc.y);
this.post_data="<PionConfig><Reactor><Plugin>"+this.plugin+"</Plugin><Workspace>"+_1209.my_content_pane.title+"</Workspace><X>"+X+"</X><Y>"+Y+"</Y>";
for(var tag in _1208){
if(tag!="options"){
console.debug("dialogFields[",tag,"] = ",_1208[tag]);
this.post_data+="<"+tag+">"+_1208[tag]+"</"+tag+">";
}
}
if(_1208.options&&plugins.reactors[this.plugin].option_defaults){
for(var _120e in plugins.reactors[this.plugin].option_defaults){
this.post_data+="<"+_120e+">";
this.post_data+=(dojo.indexOf(_1208.options,_120e)!=-1);
this.post_data+="</"+_120e+">";
}
}
if(this._insertCustomData){
this._insertCustomData(_1208);
}
this.post_data+="</Reactor></PionConfig>";
console.debug("post_data: ",this.post_data);
var _this=this;
dojo.rawXhrPost({url:"/config/reactors",contentType:"text/xml",handleAs:"xml",postData:this.post_data,load:function(_1210){
var node=_1210.getElementsByTagName("Reactor")[0];
var _1212={"@id":node.getAttribute("id")};
var _1213=node.childNodes;
for(var i=0;i<_1213.length;++i){
if(_1213[i].firstChild){
_1212[_1213[i].tagName]=_1213[i].firstChild.nodeValue;
}
}
var _1215=document.createElement("div");
_1209.node.replaceChild(_1215,_1209.node.lastChild);
var _1216=pion.reactors.createReactor(_1212,_1215);
pion.reactors.reactors_by_id[_1212["@id"]]=_1216;
_1216.workspace=_1209;
_1209.reactors.push(_1216);
_this.hide();
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:this.post_data})});
}});
dojo.declare("plugins.reactors.ReactorDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">${title}</span>\r\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: hide\">\r\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" class=\"id_text_box\" disabled=\"true\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t</div>\r\n\t<h3>Input Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_inputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_inputs_grid_model\"\r\n\t\t structure=\"reactor_inputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<h3>Output Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_outputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_outputs_grid_model\"\r\n\t\t structure=\"reactor_outputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"delete\">Delete Reactor</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
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
var _1218=dijit.getViewport();
var mb=dojo.marginBox(this.domNode);
var style=this.domNode.style;
style.left=Math.floor((_1218.l+(_1218.w-mb.w)/2))+"px";
var top=Math.floor((_1218.t+(_1218.h-mb.h)/2));
var _121c=Math.floor(_1218.h/30);
if(top-_121c<_1218.t){
top=_1218.t+_121c;
}
if(mb.h+_121c*2>=_1218.h){
style.overflow="auto";
style.bottom=(_121c-_1218.t)+"px";
}
style.top=top+"px";
_1218=dijit.getViewport();
mb=dojo.marginBox(this.domNode);
},execute:function(_121d){
dojo.mixin(this.reactor.config,_121d);
this.reactor.name_div.innerHTML=_121d.Name;
this.put_data="<PionConfig><Reactor><Plugin>"+this.reactor.config.Plugin+"</Plugin><Workspace>"+this.reactor.config.Workspace+"</Workspace><X>"+this.reactor.config.X+"</X><Y>"+this.reactor.config.Y+"</Y>";
for(var tag in _121d){
if(dojo.indexOf(this.reactor.special_config_elements,tag)==-1){
console.debug("dialogFields[",tag,"] = ",_121d[tag]);
this.put_data+="<"+tag+">"+_121d[tag]+"</"+tag+">";
}
}
if(_121d.options&&plugins.reactors[this.reactor.config.Plugin].option_defaults){
for(var _121f in plugins.reactors[this.reactor.config.Plugin].option_defaults){
this.put_data+="<"+_121f+">";
this.put_data+=(dojo.indexOf(_121d.options,_121f)!=-1);
this.put_data+="</"+_121f+">";
}
}
if(this._insertCustomData){
this._insertCustomData(_121d);
}
this.put_data+="</Reactor></PionConfig>";
console.debug("put_data: ",this.put_data);
var _this=this;
dojo.rawXhrPut({url:"/config/reactors/"+this.reactor.config["@id"],contentType:"text/xml",handleAs:"xml",putData:this.put_data,load:function(_1221){
console.debug("response: ",_1221);
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
dojo.declare("plugins.reactors.LogInputReactorInitDialog",[plugins.reactors.ReactorInitDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\" tabindex=\"-1\" waiRole=\"dialog\" waiState=\"labelledby-${id}_title\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Log File Input Reactor Initialization</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<table>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Name:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Comments:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Codec:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.FilteringSelect\" name=\"Codec\" store=\"pion.codecs.config_store\" searchAttr=\"Name\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Directory:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Directory\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Filename Regex:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Filename\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Frequency (in seconds):</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.ValidationTextBox\" type=\"text\" name=\"Frequency\" regExp=\"[1-9][0-9]*\"></td>\r\n\t\t\t</tr>\r\n\t\t</table>\r\n\t\t<table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Just One</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"JustOne\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Tail</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"TailF\"/></td\r\n\t\t\t></tr\r\n\t\t></table>\r\n\t</div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick: tryConfig\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onclick: hide\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
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
pion.terms.store.fetchItemByIdentity=function(_1222){
pion.terms.store.fetch({query:{"@id":_1222.identity},onItem:_1222.onItem,onError:pion.handleFetchError});
};
pion.terms.store.getIdentity=function(item){
return pion.terms.store.getValue(item,"@id");
};
pion.terms.type_store=new dojo.data.ItemFileReadStore({url:"/resources/termTypes.json"});
pion.terms.init=function(){
pion.terms.initTermTypeLookups();
pion.terms.buildMapOfCategoriesByTerm();
};
pion.terms.initTermTypeLookups=function(){
pion.terms.types_by_description={};
pion.terms.type_descriptions_by_name={};
pion.terms.categories_by_type={};
var store=pion.terms.type_store;
store.fetch({onItem:function(item,_1226){
pion.terms.types_by_description[store.getValue(item,"description")]=store.getValue(item,"name");
pion.terms.type_descriptions_by_name[store.getValue(item,"name")]=store.getValue(item,"description");
pion.terms.categories_by_type[store.getValue(item,"name")]=store.getValue(item,"category");
},onError:pion.handleFetchError});
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
dojo.declare("plugins.codecs.CodecInitDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog codec_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Codec Initialization</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Plugin&nbsp;Type</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.FilteringSelect\" name=\"Plugin\" \r\n\t\t\t\t\t\tstore=\"pion.codecs.plugin_data_store\" searchAttr=\"label\" \r\n\t\t\t\t\t\tautocomplete=\"true\" value=\"1\" style=\"width: 100%;\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Event&nbsp;Type</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.FilteringSelect\" name=\"EventType\" query=\"{Type:'object'}\" \r\n\t\t\t\t\t\tstore=\"pion.terms.store\" searchAttr=\"id\" autocomplete=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t></div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onclick: hide\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
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
},populateFromConfigItem:function(item){
var store=pion.codecs.config_store;
var _122f={};
var _1230=store.getAttributes(item);
for(var i=0;i<_1230.length;++i){
if(_1230[i]!="Field"&&_1230[i]!="tagName"&&_1230[i]!="childNodes"){
_122f[_1230[i]]=store.getValue(item,_1230[i]).toString();
}
}
console.dir(_122f);
this.form.setValues(_122f);
var _1232=dojo.query("textarea.comment",this.form.domNode)[0];
_1232.value=_122f.Comment;
console.debug("config = ",_122f);
this.title=_122f.Name;
var _1233=dojo.query(".dijitAccordionTitle .dijitAccordionText",this.domNode)[0];
_1233.firstChild.nodeValue=this.title;
var _1234=this._makeFieldTable(item);
plugins.codecs.CodecPane.grid_model.setData(_1234);
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
var _1239=store.getValues(item,"Field");
var _123a=[];
for(var i=0;i<_1239.length;++i){
var _123c=[];
for(var j=0;j<this.attributes_by_column.length;++j){
_123c[j]=store.getValue(_1239[i],this.attributes_by_column[j]);
}
_123a.push(_123c);
}
return _123a;
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
},_handleCellEdit:function(_1240,_1241,_1242){
console.debug("CodecPane._handleCellEdit inValue = ",_1240,", inRowIndex = ",_1241,", inFieldIndex = ",_1242);
dojo.addClass(this.domNode,"unsaved_changes");
},_handleAddNewField:function(){
console.debug("_handleAddNewField");
this.markAsChanged();
this.codec_grid.addRow([]);
},save:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
var _1243=this.form.getValues();
var _1244=dojo.query("textarea.comment",this.form.domNode)[0];
_1243.Comment=_1244.value;
var _1245="<PionConfig><Codec>";
for(var tag in _1243){
if(tag!="@id"){
console.debug("config[",tag,"] = ",_1243[tag]);
_1245+="<"+tag+">"+_1243[tag]+"</"+tag+">";
}
}
_1245+=this._makeFieldElements();
_1245+="</Codec></PionConfig>";
console.debug("put_data: ",_1245);
_this=this;
dojo.rawXhrPut({url:"/config/codecs/"+this.uuid,contentType:"text/xml",handleAs:"xml",putData:_1245,load:function(_1247){
console.debug("response: ",_1247);
pion.codecs.config_store.fetch({query:{"@id":_this.uuid},onItem:function(item){
_this.config_item=item;
_this.populateFromConfigItem(item);
},onError:pion.handleFetchError});
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_1245})});
},_makeFieldElements:function(){
var _1249=plugins.codecs.CodecPane.grid_model.getRowCount();
var _124a="";
for(var i=0;i<_1249;++i){
var row=plugins.codecs.CodecPane.grid_model.getRow(i);
_124a+="<Field term=\""+row[1]+"\"";
_124a+=">"+row[0]+"</Field>";
}
return _124a;
},cancel:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
this.populateFromConfigItem(this.config_item);
},delete2:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
console.debug("delete2: selected codec is ",this.title);
_this=this;
dojo.xhrDelete({url:"/config/codecs/"+this.uuid,handleAs:"xml",timeout:5000,load:function(_124d,_124e){
console.debug("xhrDelete for url = /config/codecs/"+this.uuid,"; HTTP status code: ",_124e.xhr.status);
dijit.byId("codec_config_accordion").forward();
dijit.byId("codec_config_accordion").removeChild(_this);
pion.codecs._adjustAccordionSize();
return _124d;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
},markAsChanged:function(){
console.debug("markAsChanged");
dojo.addClass(this.domNode,"unsaved_changes");
},codec:""});
plugins.codecs.CodecPane.grid_model=new dojox.grid.data.Table(null,[]);
plugins.codecs.initGridLayouts=function(){
plugins.codecs.CodecPane.log_codec_grid_layout=[{rows:[[{name:"Field Name",styles:"",width:"auto",editor:dojox.grid.editors.Input},{name:"Term",styles:"",editor:dojox.grid.editors.Dijit,editorClass:"dijit.form.FilteringSelect",editorProps:{store:pion.terms.store,searchAttr:"id",keyAttr:"id"},width:"auto"},{name:"Start Char",width:3,styles:"text-align: center;",editor:dojox.grid.editors.Input},{name:"End Char",width:3,styles:"text-align: center;",editor:dojox.grid.editors.Input},{name:"order",editor:dojox.grid.editors.Dijit,editorClass:"dijit.form.NumberSpinner",width:5},{name:"Delete",styles:"align: center;",width:3,value:"<button dojoType=dijit.form.Button class=\"delete_row\"><img src=\"images/icon-delete.png\" alt=\"DELETE\" border=\"0\" /></button>"},]]}];
plugins.codecs.CodecPane.default_grid_layout=[{rows:[[{name:"Field Name",styles:"",width:"auto",editor:dojox.grid.editors.Input},{name:"Term",styles:"",editor:dojox.grid.editors.Dijit,editorClass:"dijit.form.FilteringSelect",editorProps:{store:pion.terms.store,searchAttr:"id",keyAttr:"id"},width:"auto"},{name:"Delete",styles:"align: center;",width:3,value:"<button dojoType=dijit.form.Button class=\"delete_row\"><img src=\"images/icon-delete.png\" alt=\"DELETE\" border=\"0\" /></button>"},]]}];
};
}
if(!dojo._hasResource["plugins.codecs.LogCodec"]){
dojo._hasResource["plugins.codecs.LogCodec"]=true;
dojo.provide("plugins.codecs.LogCodec");
dojo.declare("plugins.codecs.LogCodecPane",[plugins.codecs.CodecPane],{templateString:"<div class='dijitAccordionPane codec_pane'\r\n\t><div dojoAttachPoint='titleNode,focusNode' dojoAttachEvent='ondijitclick:_onTitleClick,onkeypress:_onTitleKeyPress,onfocus:_handleFocus,onblur:_handleFocus'\r\n\t\tclass='dijitAccordionTitle' wairole=\"tab\"\r\n\t\t><div class='dijitAccordionArrow'></div\r\n\t\t><div class='arrowTextUp' waiRole=\"presentation\">&#9650;</div\r\n\t\t><div class='arrowTextDown' waiRole=\"presentation\">&#9660;</div\r\n\t\t><div dojoAttachPoint='titleTextNode' class='dijitAccordionText'>${title}</div></div\r\n\t><div\r\n\t\t><div dojoAttachPoint='containerNode' style='overflow: hidden; height: 1px; display: none'\r\n\t\t\tclass='dijitAccordionBody' wairole=\"tabpanel\"\r\n\t\t\t><form dojoAttachPoint=\"form\" dojoType=\"dijit.form.Form\"\r\n\t\t\t\t><br/\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" width=\"100%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Name</label></td\r\n\t\t\t\t\t\t><td><input dojoAttachPoint=\"name\" dojoType=\"dijit.form.TextBox\" name=\"Name\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td rowspan=\"4\" valign=\"top\" width=\"20\">&nbsp;</td\r\n\t\t\t\t\t\t><td rowspan=\"1\"><label>Comments</label></td\r\n\t\t\t\t\t\t><td rowspan=\"4\" valign=\"top\"><textarea rows=\"4\" style=\"width: 95%\" name=\"Comment\" class=\"comment\"></textarea></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>ID</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t\t><td rowspan=\"3\">&nbsp;</td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Plugin&nbsp;Type</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Plugin\" disabled=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td><label>Event&nbsp;Type</label></td\r\n\t\t\t\t\t\t><td><input dojoType=\"dijit.form.FilteringSelect\" name=\"EventType\" dojoAttachEvent='onChange:markAsChanged'\r\n\t\t\t\t\t\t\t\tstore=\"pion.terms.store\" searchAttr=\"id\" query=\"{Type:'object'}\" autocomplete=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><br/\r\n\t\t\t\t><table cellpadding=\"5\" cellspacing=\"0\" border=\"0\" style=\"border: 1px solid #999999;\" width=\"99%\"\r\n\t\t\t\t\t><tr\r\n\t\t\t\t\t\t><td class=\"matrixMainHeader\">Map Field Names to Terms</td\r\n\t\t\t\t\t></tr><tr\r\n\t\t\t\t\t\t><td style=\"background-color: #f1f1f1;\"\r\n\t\t\t\t\t\t\t><div class=\"codec_grid\"\r\n\t\t\t\t\t\t\t\t><div dojoAttachPoint=\"codec_grid\" dojoType=\"dojox.Grid\" model=\"plugins.codecs.CodecPane.grid_model\"\r\n\t\t\t\t\t\t\t\t\t singleClickEdit=\"true\"></div\r\n\t\t\t\t\t\t\t></div\r\n\t\t\t\t\t\t\t><button dojoType=dijit.form.Button class=\"add_new_row\" dojoAttachEvent=\"onClick:_handleAddNewField\">ADD NEW ROW</button\r\n\t\t\t\t\t\t></td\r\n\t\t\t\t\t></tr\r\n\t\t\t\t></table\r\n\t\t\t\t><hr noshade=\"noshade\" size=\"1\" color=\"#999999\"\r\n\t\t\t\t><div class=\"save_cancel_delete\"\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick:save\">Save Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick:cancel\">Cancel Changes</button\r\n\t\t\t\t\t><button dojoType=dijit.form.Button class=\"delete\" dojoAttachEvent=\"onClick:delete2\">Delete Codec</button\r\n\t\t\t\t></div\r\n\t\t\t></form\r\n\t\t></div\r\n\t></div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
this.attributes_by_column=["text()","@term","@start","@end"];
this.order_col_index=4;
this.delete_col_index=5;
},_makeFieldTable:function(item){
var store=pion.codecs.config_store;
var _1251=store.getValues(item,"Field");
var _1252=[];
this.order_map=[];
for(var i=0;i<_1251.length;++i){
var _1254=[];
for(var j=0;j<this.attributes_by_column.length;++j){
_1254[j]=store.getValue(_1251[i],this.attributes_by_column[j]);
}
_1254[this.order_col_index]=i+1;
_1252.push(_1254);
this.order_map[i]=i+1;
}
return _1252;
},_setGridStructure:function(grid){
if(!plugins.codecs.CodecPane.log_codec_grid_layout){
plugins.codecs.initGridLayouts();
}
grid.setStructure(plugins.codecs.CodecPane.log_codec_grid_layout);
},_handleCellEdit:function(_1257,_1258,_1259){
console.debug("LogCodecPane._handleCellEdit inValue = ",_1257,", inRowIndex = ",_1258,", inFieldIndex = ",_1259);
dojo.addClass(this.domNode,"unsaved_changes");
if(_1259==this.order_col_index){
var _125a=this.order_map[_1258];
var _125b=this.order_map;
console.debug("1: order_map = ",_125b);
_125b[_1258]=_1257;
if(_1257>_125a){
for(var i=0;i<_125b.length;++i){
if(_125b[i]>_125a&&_125b[i]<=_1257&&i!=_1258){
_125b[i]--;
}
}
}else{
for(var i=0;i<_125b.length;++i){
if(_125b[i]>=_1257&&_125b[i]<_125a&&i!=_1258){
_125b[i]++;
}
}
}
console.debug("2: order_map = ",_125b);
var _125d=[];
for(var i=0;i<_125b.length;++i){
var row=plugins.codecs.CodecPane.grid_model.getRow(i);
row[this.order_col_index]=_125b[i];
_125d.push(row);
}
plugins.codecs.CodecPane.grid_model.setData(_125d);
}
},_makeFieldElements:function(){
var _125f=plugins.codecs.CodecPane.grid_model.getRowCount();
var _1260=[];
for(var i=0;i<_125f;++i){
if(this.order_map.length==_125f){
_1260[this.order_map[i]-1]=i;
}else{
_1260[i]=i;
}
}
console.debug("this.order_map = ",this.order_map);
console.debug("inverse_order_map = ",_1260);
var _1262="";
for(var i=0;i<_125f;++i){
var row=plugins.codecs.CodecPane.grid_model.getRow(_1260[i]);
_1262+="<Field term=\""+row[1]+"\"";
if(row[2]){
_1262+=" start=\""+dojox.dtl.filter.htmlstrings.escape(row[2])+"\"";
}
if(row[3]){
_1262+=" end=\""+dojox.dtl.filter.htmlstrings.escape(row[3])+"\"";
}
_1262+=">"+row[0]+"</Field>";
}
return _1262;
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
pion.codecs.config_store.fetchItemByIdentity=function(_1264){
pion.codecs.config_store.fetch({query:{"@id":_1264.identity},onItem:_1264.onItem,onError:pion.handleFetchError});
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
var _1269=pion.codecs.config_store.getValue(item,"Plugin");
var _126a=document.createElement("span");
var _126b="plugins.codecs."+_1269+"Pane";
var _126c=dojo.getObject(_126b);
if(_126c){
console.debug("found class ",_126b);
var _126d=new _126c({"class":"codec_pane",title:title},_126a);
}else{
console.debug("class ",_126b," not found; using plugins.codecs.CodecPane instead.");
var _126d=new plugins.codecs.CodecPane({"class":"codec_pane",title:title},_126a);
}
_126d.config_item=item;
_126d.uuid=pion.codecs.config_store.getValue(item,"@id");
dijit.byId("codec_config_accordion").addChild(_126d);
return _126d;
};
pion.codecs.createNewPaneFromStore=function(id,_126f){
pion.codecs.config_store.fetch({query:{"@id":id},onItem:function(item){
var _1271=pion.codecs.createNewPaneFromItem(item);
if(_126f){
pion.codecs._adjustAccordionSize();
dijit.byId("codec_config_accordion").selectChild(_1271);
}
},onError:pion.handleFetchError});
};
function onComplete(items,_1273){
var _1274=dijit.byId("codec_config_accordion");
for(var i=0;i<items.length;++i){
pion.codecs.createNewPaneFromItem(items[i]);
}
pion.codecs._adjustAccordionSize();
var _1276=_1274.getChildren()[0];
_1274.selectChild(_1276);
};
if(file_protocol){
dijit.byId("codec_config_accordion").removeChild(selected_codec_pane);
}else{
codec_config_store.fetch({onComplete:onComplete,onError:pion.handleFetchError});
}
dojo.connect(dojo.byId("add_new_codec_button"),"click",addNewCodec);
};
function addNewCodec(){
var _1277=new plugins.codecs.CodecInitDialog({title:"Add New Codec"});
setTimeout(function(){
dojo.query("input",_1277.domNode)[0].select();
},500);
dojo.query(".dijitButton.cancel",_1277.domNode).forEach(function(n){
dojo.connect(n,"click",_1277,"onCancel");
});
_1277.show();
_1277.execute=function(_1279){
console.debug(_1279);
var _127a="<PionConfig><Codec>";
for(var tag in _1279){
console.debug("dialogFields[",tag,"] = ",_1279[tag]);
_127a+="<"+tag+">"+_1279[tag]+"</"+tag+">";
}
_127a+="</Codec></PionConfig>";
console.debug("post_data: ",_127a);
dojo.rawXhrPost({url:"/config/codecs",contentType:"text/xml",handleAs:"xml",postData:_127a,load:function(_127c){
var node=_127c.getElementsByTagName("Codec")[0];
var id=node.getAttribute("id");
console.debug("id (from server): ",id);
pion.codecs.createNewPaneFromStore(id,true);
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_127a})});
};
};
pion.codecs._adjustAccordionSize=function(){
var _127f=dijit.byId("codec_config_accordion");
var _1280=_127f.getChildren().length;
console.debug("num_codecs = "+_1280);
var _1281=475;
var _1282=0;
if(_1280>0){
var _1283=_127f.getChildren()[0];
_1282=_1283.getTitleHeight();
}
var _1284=_1281+_1280*_1282;
_127f.resize({h:_1284});
pion.codecs.height=_1284+160;
dijit.byId("main_stack_container").resize({h:pion.codecs.height});
};
function codecPaneSelected(pane){
console.debug("Selected "+pane.title);
if(pane==selected_codec_pane){
return;
}
if(selected_codec_pane&&dojo.hasClass(selected_codec_pane.domNode,"unsaved_changes")){
var _1286=new dijit.Dialog({title:"Warning: unsaved changes"});
_1286.setContent("Please save or cancel unsaved changes before selecting another Codec.");
_1286.show();
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
var _1289=dijit.byId("codec_config_accordion").duration;
setTimeout(function(){
dojo.style(pane.containerNode,"overflow","hidden");
},_1289+50);
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
dojo.declare("plugins.reactors.LogOutputReactorInitDialog",[plugins.reactors.ReactorInitDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Log File Output Reactor Initialization</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\r\n\t\t<table>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Name:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Comments:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Codec:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.FilteringSelect\" name=\"Codec\" store=\"pion.codecs.config_store\" searchAttr=\"Name\"/></td>\r\n\t\t\t</tr>\r\n\t\t\t<tr>\r\n\t\t\t\t<td><label>Filename:</label></td>\r\n\t\t\t\t<td><input dojoType=\"dijit.form.TextBox\" name=\"Filename\"/></td>\r\n\t\t\t</tr>\r\n\t\t</table>\r\n\t</div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick: tryConfig\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onclick: hide\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.plugin="LogOutputReactor";
this.inherited("postCreate",arguments);
}});
dojo.declare("plugins.reactors.LogOutputReactorDialog",[plugins.reactors.ReactorDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Log Output Reactor Configuration</span>\r\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: hide\">\r\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" class=\"id_text_box\" disabled=\"true\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Codec:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.FilteringSelect\" name=\"Codec\" store=\"pion.codecs.config_store\" searchAttr=\"Name\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Filename:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Filename\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t</div>\r\n\t<h3>Input Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_inputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_inputs_grid_model\"\r\n\t\t structure=\"reactor_inputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<h3>Output Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_outputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_outputs_grid_model\"\r\n\t\t structure=\"reactor_outputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"delete\">Delete Reactor</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
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
var _128d=store.getValues(item,"Comparison");
for(var i=0;i<_128d.length;++i){
var _128f=[];
_128f[0]=store.getValue(_128d[i],"Term");
_128f[1]=store.getValue(_128d[i],"Type");
_128f[2]=store.getValue(_128d[i],"Value");
_this.comparison_table.push(_128f);
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
dojo.declare("plugins.reactors.FilterReactorDialog",[plugins.reactors.ReactorDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Filter Reactor Configuration</span>\r\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: hide\">\r\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" class=\"id_text_box\" disabled=\"true\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t</div>\r\n\t<div dojoAttachPoint=\"filter_reactor_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.filter_reactor_grid_model\"\r\n\t\t singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<button dojoAttachPoint=\"add_new_comparison_button\" dojoType=dijit.form.Button dojoAttachEvent=\"onClick:_handleAddNewComparison\" class=\"add_new_row\">ADD NEW COMPARISON</button>\r\n\t<h3>Input Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_inputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_inputs_grid_model\"\r\n\t\t structure=\"reactor_inputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<h3>Output Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_outputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_outputs_grid_model\"\r\n\t\t structure=\"reactor_outputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"delete\">Delete Reactor</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
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
var _1295=store.getValues(item,"Comparison");
for(var i=0;i<_1295.length;++i){
var _1297=[];
_1297[0]=store.getValue(_1295[i],"Term");
_1297[1]=store.getValue(_1295[i],"Type");
_1297[2]=store.getValue(_1295[i],"Value");
_this.reactor.comparison_table.push(_1297);
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
var _129b=pion.reactors.filter_reactor_grid_model.getRowCount();
for(var i=0;i<_129b;++i){
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
var _12a1=store.getValues(item,"Comparison");
for(var i=0;i<_12a1.length;++i){
var _12a3={};
_12a3.term=store.getValue(_12a1[i],"Term");
_12a3.type=store.getValue(_12a1[i],"Type");
_12a3.value=store.getValue(_12a1[i],"Value");
_this.comparisons.push(_12a3);
}
var _12a4=store.getValues(item,"Transformation");
var _12a5=plugins.reactors.TransformReactor.getBool;
for(var i=0;i<_12a4.length;++i){
var _12a6={};
_12a6.term=store.getValue(_12a4[i],"Term");
_12a6.type=store.getValue(_12a4[i],"Type");
_12a6.value=store.getValue(_12a4[i],"Value");
_12a6.match_all=_12a5(store,_12a4[i],"MatchAllValues");
_12a6.set_value=store.getValue(_12a4[i],"SetValue");
_12a6.in_place=_12a5(store,_12a4[i],"InPlace");
_12a6.set_term=store.getValue(_12a4[i],"SetTerm");
_this.transformations.push(_12a6);
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
dojo.declare("plugins.reactors.TransformReactorDialog",[plugins.reactors.ReactorDialog],{templateString:"<div class=\"dijitDialog reactor_dialog transform_reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Transform Reactor Configuration</span>\r\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: hide\">\r\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" class=\"id_text_box\" disabled=\"true\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>All Conditions</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"AllConditions\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Deliver Original</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.CheckBox\" type=\"checkBox\" name=\"options\" value=\"DeliverOriginal\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t></div>\r\n\t<h3>Comparisons</h3>\r\n\t<div dojoAttachPoint=\"comparison_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.transform_reactor_comparison_grid_model\"\r\n\t\t singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<button dojoAttachPoint=\"add_new_comparison_button\" dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:_handleAddNewComparison\" class=\"add_new_row\">ADD NEW COMPARISON</button>\r\n\t<h3>Transformations</h3>\r\n\t<div dojoAttachPoint=\"transformation_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.transform_reactor_transformation_grid_model\"\r\n\t\t singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<button dojoAttachPoint=\"add_new_transformation_button\" dojoType=dijit.form.Button dojoAttachEvent=\"onClick:_handleAddNewTransformation\" class=\"add_new_row\">ADD NEW TRANSFORMATION</button>\r\n\t<h3>Input Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_inputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_inputs_grid_model\"\r\n\t\t structure=\"reactor_inputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<h3>Output Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_outputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_outputs_grid_model\"\r\n\t\t structure=\"reactor_outputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"delete\">Delete Reactor</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true,postCreate:function(){
this.inherited("postCreate",arguments);
this.initGridLayouts();
var _this=this;
this.comparison_grid.setStructure(this.comparison_grid_layout);
var _12ab=pion.reactors.transform_reactor_comparison_grid_model;
this.comparison_grid.canEdit=function(cell,_12ad){
switch(cell.index){
case this.value_column_index:
var type=_12ab.getDatum(_12ad,this.type_column_index);
return dojo.indexOf(pion.reactors.generic_comparison_types,type)==-1;
default:
return true;
}
};
this.transformation_grid.setStructure(this.transformation_grid_layout);
var _12af=pion.reactors.transform_reactor_transformation_grid_model;
this.transformation_grid.canEdit=function(cell,_12b1){
switch(cell.index){
case this.value_column_index:
var type=_12af.getDatum(_12b1,this.type_column_index);
return dojo.indexOf(pion.reactors.generic_comparison_types,type)==-1;
case this.set_term_column_index:
var _12b3=_12af.getDatum(_12b1,this.in_place_column_index);
console.debug("in_place = ",_12b3);
if(_12b3){
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
var _12b6=store.getValues(item,"Comparison");
var cg=_this.comparison_grid;
for(var i=0;i<_12b6.length;++i){
var _12b9=[];
_12b9[cg.term_column_index]=store.getValue(_12b6[i],"Term");
_12b9[cg.type_column_index]=store.getValue(_12b6[i],"Type");
_12b9[cg.value_column_index]=store.getValue(_12b6[i],"Value");
_this.comparison_table.push(_12b9);
}
_12ab.setData(_this.comparison_table);
var _12ba=store.getValues(item,"Transformation");
var tg=_this.transformation_grid;
var _12bc=plugins.reactors.TransformReactor.getBool;
for(var i=0;i<_12ba.length;++i){
var _12b9=[];
_12b9[tg.term_column_index]=store.getValue(_12ba[i],"Term");
_12b9[tg.type_column_index]=store.getValue(_12ba[i],"Type");
_12b9[tg.value_column_index]=store.getValue(_12ba[i],"Value");
_12b9[tg.match_all_column_index]=_12bc(store,_12ba[i],"MatchAllValues");
_12b9[tg.set_value_column_index]=store.getValue(_12ba[i],"SetValue");
_12b9[tg.in_place_column_index]=_12bc(store,_12ba[i],"InPlace");
_12b9[tg.set_term_column_index]=store.getValue(_12ba[i],"SetTerm");
_this.transformation_table.push(_12b9);
}
_12af.setData(_this.transformation_table);
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
},_handleComparisonGridCellEdit:function(value,_12c6,_12c7){
console.debug("value = ",value);
var grid=this.comparison_grid;
var model=pion.reactors.transform_reactor_comparison_grid_model;
switch(_12c7){
case grid.type_column_index:
var store=pion.reactors.comparison_type_store;
store.fetchItemByIdentity({identity:value,onItem:function(item){
if(store.containsValue(item,"category","generic")){
model.setDatum("",_12c6,grid.value_column_index);
}
}});
break;
default:
}
},_handleTransformationGridCellEdit:function(value,_12cd,_12ce){
console.debug("value = ",value);
var grid=this.transformation_grid;
var model=pion.reactors.transform_reactor_transformation_grid_model;
switch(_12ce){
case grid.type_column_index:
var store=pion.reactors.comparison_type_store;
store.fetchItemByIdentity({identity:value,onItem:function(item){
if(store.containsValue(item,"category","generic")){
model.setDatum("",_12cd,grid.value_column_index);
}
}});
break;
case grid.in_place_column_index:
if(value){
model.setDatum("",_12cd,grid.set_term_column_index);
}else{
if(model.getDatum(_12cd,grid.set_term_column_index)===undefined){
var _12d3=model.getDatum(_12cd,grid.term_column_index);
model.setDatum(_12d3,_12cd,grid.set_term_column_index);
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
var _12d4=pion.reactors.transform_reactor_comparison_grid_model.getRowCount();
var cg=this.comparison_grid;
for(var i=0;i<_12d4;++i){
var row=pion.reactors.transform_reactor_comparison_grid_model.getRow(i);
this.put_data+="<Comparison>";
this.put_data+="<Term>"+row[cg.term_column_index]+"</Term>";
this.put_data+="<Type>"+row[cg.type_column_index]+"</Type>";
if(row[cg.value_column_index]){
this.put_data+="<Value>"+row[cg.value_column_index]+"</Value>";
}
this.put_data+="</Comparison>";
}
var _12d8=pion.reactors.transform_reactor_transformation_grid_model.getRowCount();
var tg=this.transformation_grid;
for(var i=0;i<_12d8;++i){
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
plugins.reactors.TransformReactor.getBool=function(store,item,_12dc){
if(store.hasAttribute(item,_12dc)){
return store.getValue(item,_12dc).toString()=="true";
}else{
return plugins.reactors.TransformReactor.grid_option_defaults[_12dc];
}
};
}
if(!dojo._hasResource["plugins.databases.Database"]){
dojo._hasResource["plugins.databases.Database"]=true;
dojo.provide("plugins.databases.Database");
dojo.declare("plugins.databases.SelectPluginDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog database_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">${title}</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Plugin&nbsp;Type:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.FilteringSelect\" name=\"Plugin\" \r\n\t\t\t\t\t\tstore=\"pion.databases.plugin_data_store\" searchAttr=\"label\" \r\n\t\t\t\t\t\tautocomplete=\"true\" style=\"width: 100%;\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t</div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Continue</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: hide\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
this.inherited("postMixInProperties",arguments);
if(this.templatePath){
this.templateString="";
}
},widgetsInTemplate:true});
dojo.declare("plugins.databases.DatabaseInitDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog database_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">${title}</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Plugin&nbsp;Type:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Plugin\" style=\"width: 100%;\"\r\n\t\t\t\t\t\tdisabled=\"true\"/></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr><tr\r\n\t\t\t\t><td><label>Filename:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Filename\" style=\"width: 100%;\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t</div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onClick: hide\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
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
var _12df={};
var _12e0=store.getAttributes(item);
for(var i=0;i<_12e0.length;++i){
if(_12e0[i]!="tagName"&&_12e0[i]!="childNodes"){
_12df[_12e0[i]]=store.getValue(item,_12e0[i]).toString();
}
}
console.dir(_12df);
this.database_form.setValues(_12df);
var _12e2=dojo.query("textarea.comment",this.database_form.domNode)[0];
_12e2.value=_12df.Comment;
console.debug("config = ",_12df);
this.title=_12df.Name;
var _12e3=dojo.query(".dijitAccordionTitle .dijitAccordionText",this.domNode)[0];
_12e3.firstChild.nodeValue=this.title;
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
var _12e5=this.database_form.getValues();
var _12e6=dojo.query("textarea.comment",this.database_form.domNode)[0];
_12e5.Comment=_12e6.value;
this.put_data="<PionConfig><Database>";
for(var tag in _12e5){
if(tag!="@id"){
console.debug("config[",tag,"] = ",_12e5[tag]);
this.put_data+="<"+tag+">"+_12e5[tag]+"</"+tag+">";
}
}
if(this._insertCustomData){
this._insertCustomData();
}
this.put_data+="</Database></PionConfig>";
console.debug("put_data: ",this.put_data);
_this=this;
dojo.rawXhrPut({url:"/config/databases/"+this.uuid,contentType:"text/xml",handleAs:"xml",putData:this.put_data,load:function(_12e8){
console.debug("response: ",_12e8);
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
dojo.xhrDelete({url:"/config/databases/"+this.uuid,handleAs:"xml",timeout:5000,load:function(_12ea,_12eb){
console.debug("xhrDelete for url = /config/databases/"+this.uuid,"; HTTP status code: ",_12eb.xhr.status);
dijit.byId("database_config_accordion").forward();
dijit.byId("database_config_accordion").removeChild(_this);
pion.databases._adjustAccordionSize();
return _12ea;
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
return 190;
}});
}
if(!dojo._hasResource["pion.databases"]){
dojo._hasResource["pion.databases"]=true;
dojo.provide("pion.databases");
pion.databases.getHeight=function(){
return pion.databases.height;
};
pion.databases.config_store=new dojox.data.XmlStore({url:"/config/databases"});
pion.databases.config_store.fetchItemByIdentity=function(_12ec){
pion.databases.config_store.fetch({query:{"@id":_12ec.identity},onItem:_12ec.onItem,onError:pion.handleFetchError});
};
pion.databases.config_store.getIdentity=function(item){
return pion.databases.config_store.getValue(item,"@id");
};
pion.databases._adjustAccordionSize=function(){
var _12ee=dijit.byId("database_config_accordion");
var _12ef=_12ee.getChildren().length;
console.debug("num_databases = "+_12ef);
var _12f0=pion.databases.selected_pane.getHeight();
var _12f1=0;
if(_12ef>0){
var _12f2=_12ee.getChildren()[0];
_12f1=_12f2.getTitleHeight();
}
var _12f3=_12f0+_12ef*_12f1;
_12ee.resize({h:_12f3});
pion.databases.height=_12f3+160;
dijit.byId("main_stack_container").resize({h:pion.databases.height});
};
pion.databases.init=function(){
pion.databases.selected_pane=null;
var _12f4=new dojox.data.XmlStore({url:"/config/databases/plugins"});
dojo.xhrGet({url:"/config/plugins",handleAs:"xml",timeout:5000,load:function(_12f5,_12f6){
pion.available_plugins=[];
var _12f7=_12f5.getElementsByTagName("Plugin");
dojo.forEach(_12f7,function(n){
pion.available_plugins.push(dojo.isIE?n.childNodes[0].nodeValue:n.textContent);
});
var items=[];
_12f4.fetch({onItem:function(item){
var _12fb=_12f4.getValue(item,"Plugin").toString();
if(dojo.indexOf(pion.available_plugins,_12fb)!=-1){
var _12fc="plugins.databases."+_12fb;
var _12fd=dojo.getObject(_12fc);
if(!_12fd){
var path="/plugins/databases/"+_12fb+"/"+_12fb;
dojo.registerModulePath(_12fc,path);
dojo.requireIf(true,_12fc);
_12fd=dojo.getObject(_12fc);
}
console.debug("label = ",_12fd["label"]);
items.push({plugin:_12fb,label:_12fd["label"]});
}
},onComplete:function(){
pion.databases.plugin_data_store=new dojo.data.ItemFileWriteStore({data:{identifier:"plugin",items:items}});
if(file_protocol){
pion.databases._adjustAccordionSize();
}else{
pion.databases.config_store.fetch({onComplete:function(items,_1300){
var _1301=dijit.byId("database_config_accordion");
for(var i=0;i<items.length;++i){
pion.databases.createNewPaneFromItem(items[i]);
}
var _1303=_1301.getChildren()[0];
_1301.selectChild(_1303);
},onError:pion.handleFetchError});
}
}});
return _12f5;
},error:pion.handleXhrGetError});
function _paneSelected(pane){
console.debug("Selected "+pane.title);
var _1305=pion.databases.selected_pane;
if(pane==_1305){
return;
}
if(_1305&&dojo.hasClass(_1305.domNode,"unsaved_changes")){
var _1306=new dijit.Dialog({title:"Warning: unsaved changes"});
_1306.setContent("Please save or cancel unsaved changes before selecting another Database.");
_1306.show();
setTimeout(function(){
dijit.byId("database_config_accordion").selectChild(_1305);
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
var _1309=dijit.byId("database_config_accordion").duration;
setTimeout(function(){
dojo.style(pane.containerNode,"overflow","hidden");
pion.databases._adjustAccordionSize();
},_1309+50);
};
dojo.subscribe("database_config_accordion-selectChild",_paneSelected);
pion.databases.createNewPaneFromItem=function(item){
var title=pion.databases.config_store.getValue(item,"Name");
var _130c=pion.databases.config_store.getValue(item,"Plugin");
var _130d=document.createElement("span");
var _130e="plugins.databases."+_130c+"Pane";
var _130f=dojo.getObject(_130e);
if(_130f){
console.debug("found class ",_130e);
var _1310=new _130f({"class":"database_pane",title:title},_130d);
}else{
console.debug("class ",_130e," not found; using plugins.databases.DatabasePane instead.");
var _1310=new plugins.databases.DatabasePane({"class":"database_pane",title:title},_130d);
}
_1310.config_item=item;
_1310.uuid=pion.databases.config_store.getValue(item,"@id");
dijit.byId("database_config_accordion").addChild(_1310);
return _1310;
};
pion.databases.createNewPaneFromStore=function(id,_1312){
pion.databases.config_store.fetch({query:{"@id":id},onItem:function(item){
var _1314=pion.databases.createNewPaneFromItem(item);
if(_1312){
pion.databases._adjustAccordionSize();
dijit.byId("database_config_accordion").selectChild(_1314);
}
},onError:pion.handleFetchError});
};
function _isDuplicateDatabaseId(id){
var _1316=dijit.byId("database_config_accordion").getChildren();
for(var i=0;i<_1316.length;++i){
if(pion.databases.config_store.getValue(_1316[i].config_item,"@id")==id){
return true;
}
}
return false;
};
function _isDuplicateDatabaseName(name){
var _1319=dijit.byId("database_config_accordion").getChildren();
for(var i=0;i<_1319.length;++i){
if(_1319[i].title==name){
return true;
}
}
return false;
};
function _addNewDatabase(){
var _131b=new plugins.databases.SelectPluginDialog({title:"Select Database Plugin"});
_131b.show();
_131b.execute=function(_131c){
console.debug(_131c);
_initNewDatabase(_131c["Plugin"]);
};
};
function _initNewDatabase(_131d){
var title="Add New "+_131d;
var _131f="plugins.databases."+_131d+"InitDialog";
var _1320=dojo.getObject(_131f);
if(_1320){
console.debug("found class ",_131f);
var _1321=new _1320({title:title});
}else{
console.debug("class ",_131f," not found; using plugins.databases.DatabaseInitDialog instead.");
var _1321=new plugins.databases.DatabaseInitDialog({title:title});
}
_1321.setValues({Plugin:_131d});
setTimeout(function(){
dojo.query("input",_1321.domNode)[0].select();
},500);
_1321.show();
_1321.execute=function(_1322){
console.debug(_1322);
var _1323="<PionConfig><Database>";
for(var tag in _1322){
console.debug("dialogFields[",tag,"] = ",_1322[tag]);
_1323+="<"+tag+">"+_1322[tag]+"</"+tag+">";
}
if(this._insertCustomData){
this._insertCustomData();
}
_1323+="</Database></PionConfig>";
console.debug("post_data: ",_1323);
dojo.rawXhrPost({url:"/config/databases",contentType:"text/xml",handleAs:"xml",postData:_1323,load:function(_1325){
var node=_1325.getElementsByTagName("Database")[0];
var id=node.getAttribute("id");
console.debug("id (from server): ",id);
pion.databases.createNewPaneFromStore(id,true);
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1323})});
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
var _132b=store.getValues(item,"Field");
for(var i=0;i<_132b.length;++i){
var row=[];
row[0]=store.getValue(_132b[i],"text()");
row[1]=store.getValue(_132b[i],"@term");
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
dojo.declare("plugins.reactors.DatabaseOutputReactorInitDialog",[plugins.reactors.ReactorInitDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Database Output Reactor Initialization</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Database:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.FilteringSelect\" name=\"Database\" store=\"pion.databases.config_store\" searchAttr=\"Name\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Table:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Table\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t></div>\r\n\t<div dojoAttachPoint=\"grid\" dojoType=\"dojox.Grid\" model=\"plugins.reactors.DatabaseOutputReactorDialog.grid_model\"\r\n\t\t structure=\"plugins.reactors.DatabaseOutputReactorDialog.grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<button dojoAttachPoint=\"add_new_term_button\" dojoType=dijit.form.Button dojoAttachEvent=\"onclick:_handleAddNewTerm\" class=\"add_new_row\">ADD NEW TERM</button>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" dojoAttachEvent=\"onClick: tryConfig\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onclick: hide\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
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
dojo.connect(this.add_new_term_button.domNode,"click",grid,this._handleAddNewTerm);
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
this.addRow([]);
},_insertCustomData:function(){
var _1332=plugins.reactors.DatabaseOutputReactorDialog.grid_model.getRowCount();
for(var i=0;i<_1332;++i){
var row=plugins.reactors.DatabaseOutputReactorDialog.grid_model.getRow(i);
console.debug("frag: <Field term=\""+row[1]+"\">"+row[0]+"</Field>");
this.post_data+="<Field term=\""+row[1]+"\">"+row[0]+"</Field>";
}
}});
dojo.declare("plugins.reactors.DatabaseOutputReactorDialog",[plugins.reactors.ReactorDialog],{templateString:"<div class=\"dijitDialog reactor_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Database Output Reactor Configuration</span>\r\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: hide\">\r\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\r\n\t</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"@id\" class=\"id_text_box\" disabled=\"true\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Database:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.FilteringSelect\" name=\"Database\" store=\"pion.databases.config_store\" searchAttr=\"Name\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Table:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Table\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Queue Size:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"QueueSize\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Queue Timeout:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"QueueTimeout\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t></div>\r\n\t<div dojoAttachPoint=\"grid\" dojoType=\"dojox.Grid\" model=\"plugins.reactors.DatabaseOutputReactorDialog.grid_model\"\r\n\t\t structure=\"plugins.reactors.DatabaseOutputReactorDialog.grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<button dojoAttachPoint=\"add_new_term_button\" dojoType=dijit.form.Button dojoAttachEvent=\"onclick:_handleAddNewTerm\" class=\"add_new_row\">ADD NEW TERM</button>\r\n\t<h3>Input Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_inputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_inputs_grid_model\"\r\n\t\t structure=\"reactor_inputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<h3>Output Connections</h3>\r\n\t<div dojoAttachPoint=\"reactor_outputs_grid\" dojoType=\"dojox.Grid\" model=\"pion.reactors.reactor_outputs_grid_model\"\r\n\t\t structure=\"reactor_outputs_grid_layout\" singleClickEdit=\"true\" autoHeight=\"true\"></div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\">Cancel</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"delete\">Delete Reactor</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
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
var _1338=store.getValues(item,"Field");
for(var i=0;i<_1338.length;++i){
var row=[];
row[0]=store.getValue(_1338[i],"text()");
row[1]=store.getValue(_1338[i],"@term");
console.debug("row = ",row);
_this.reactor.field_mapping_table.push(row);
}
plugins.reactors.DatabaseOutputReactorDialog.grid_model.setData(_this.reactor.field_mapping_table);
var grid=_this.grid;
dojo.connect(grid,"onCellClick",grid,_this._handleCellClick);
dojo.connect(_this.add_new_term_button.domNode,"click",grid,_this._handleAddNewTerm);
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
this.addRow([]);
},_insertCustomData:function(){
var _133d=plugins.reactors.DatabaseOutputReactorDialog.grid_model.getRowCount();
for(var i=0;i<_133d;++i){
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
var _1340=dijit.byId("ops_toggle_button");
dojo.connect(_1340.domNode,"click",function(){
if(_1340.checked){
dojo.addClass(dojo.byId("counterBackground"),"hidden");
}else{
dojo.removeClass(dojo.byId("counterBackground"),"hidden");
}
});
var _1341=function(item,hint){
var node=dojo.doc.createElement("div");
node.id=dojo.dnd.getUniqueId();
node.className="dojoDndItem";
node.setAttribute("reactor_type",item.reactor_type);
var _1345=dojo.doc.createElement("img");
node.appendChild(_1345);
_1345.setAttribute("src",item.src);
_1345.setAttribute("width",148);
_1345.setAttribute("height",25);
_1345.setAttribute("alt",item.alt);
return {node:node,data:item,type:["reactor"]};
};
var _1346={collection:collectionReactors,processing:processingReactors,storage:storageReactors};
for(var _1347 in _1346){
_1346[_1347].creator=_1341;
}
var store=pion.reactors.comparison_type_store;
store.fetch({query:{category:"generic"},onItem:function(item){
pion.reactors.generic_comparison_types.push(store.getValue(item,"name"));
}});
var _134a=new dojox.data.XmlStore({url:"/config/reactors/plugins"});
dojo.xhrGet({url:"/config/plugins",handleAs:"xml",timeout:5000,load:function(_134b,_134c){
pion.available_plugins=[];
var _134d=_134b.getElementsByTagName("Plugin");
dojo.forEach(_134d,function(n){
pion.available_plugins.push(dojo.isIE?n.childNodes[0].nodeValue:n.textContent);
});
_134a.fetch({onItem:function(item){
var _1350=_134a.getValue(item,"Plugin").toString();
if(dojo.indexOf(pion.available_plugins,_1350)!=-1){
var _1351=_134a.getValue(item,"ReactorType").toString();
var _1352="plugins.reactors."+_1350;
var _1353=dojo.getObject(_1352);
if(!_1353){
var path="/plugins/reactors/"+_1351+"/"+_1350+"/"+_1350;
dojo.registerModulePath(_1352,path);
dojo.requireIf(true,_1352);
_1353=dojo.getObject(_1352);
}
pion.reactors.categories[_1350]=_1351;
var icon=_1351+"/"+_1350+"/icon.png";
var _1356=dojo.moduleUrl("plugins.reactors",icon);
console.debug("icon_url = ",_1356);
_1346[_1351].insertNodes(false,[{reactor_type:_1350,src:_1356,alt:_1353["label"]}]);
}
},onComplete:function(){
pion.reactors.initConfiguredReactors();
}});
return _134b;
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
var _1357=0;
var _1358=0;
setInterval(function(){
if(!_1340.checked){
dojo.xhrGet({url:"/config/reactors/stats",preventCache:true,handleAs:"xml",timeout:1000,load:function(_1359,_135a){
var node=_1359.getElementsByTagName("TotalOps")[0];
var _135c=parseInt(dojo.isIE?node.xml.match(/.*>(\d*)<.*/)[1]:node.textContent);
var delta=_135c-_1357;
dojo.byId("global_ops").innerHTML=delta>0?delta:0;
_1357=_135c;
var _135e=0;
var _135f=_1359.getElementsByTagName("Reactor");
dojo.forEach(_135f,function(n){
var id=n.getAttribute("id");
var _1362=pion.reactors.reactors_by_id[id];
if(_1362){
if(_1362.workspace==pion.reactors.workspace_box){
var _1363=n.getElementsByTagName("EventsIn")[0];
var _1364=dojo.isIE?_1363.xml.match(/.*>(\d*)<.*/)[1]:_1363.textContent;
var _1365=parseInt(_1364);
_1362.ops_per_sec.innerHTML=_1365-_1362.prev_events_in;
_1362.prev_events_in=_1365;
_135e+=_1365;
}
var _1366=n.getElementsByTagName("Running")[0];
var _1367=dojo.isIE?_1366.xml.match(/.*>(\w*)<.*/)[1]:_1366.textContent;
var _1368=(_1367=="true");
_1362.run_button.setAttribute("checked",_1368);
}
});
delta=_135e-_1358;
dojo.byId("workspace_ops").innerHTML=delta>0?delta:0;
_1358=_135e;
return _1359;
},error:pion.handleXhrGetError});
}
},1000);
}
};
pion.reactors.initProtocols=function(){
pion.protocols_config_store=new dojox.data.XmlStore({url:"/config/protocols"});
pion.protocols_config_store.fetchItemByIdentity=function(_1369){
pion.protocols_config_store.fetch({query:{"@id":_1369.identity},onItem:_1369.onItem,onError:pion.handleFetchError});
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
reactor_config_store.fetch({query:{tagName:"Reactor"},onItem:function(item,_136d){
console.debug("fetched Reactor with id = ",reactor_config_store.getValue(item,"@id"));
var _136e={};
var _136f=reactor_config_store.getAttributes(item);
for(var i=0;i<_136f.length;++i){
if(_136f[i]!="tagName"&&_136f[i]!="childNodes"){
_136e[_136f[i]]=reactor_config_store.getValue(item,_136f[i]).toString();
}
}
pion.reactors.createReactorInConfiguredWorkspace(_136e);
},onComplete:function(items,_1372){
console.debug("done fetching Reactors");
reactor_config_store.fetch({query:{tagName:"Connection"},onItem:function(item,_1374){
pion.reactors.createConnection(reactor_config_store.getValue(item,"From").toString(),reactor_config_store.getValue(item,"To").toString(),reactor_config_store.getValue(item,"@id").toString());
},onComplete:function(items,_1376){
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
pion.reactors.createReactorInConfiguredWorkspace=function(_1377){
pion.reactors.workspace_box=workspaces_by_name[_1377.Workspace];
if(!pion.reactors.workspace_box){
addWorkspace(_1377.Workspace);
}
var _1378=pion.reactors.workspace_box;
dijit.byId("mainTabContainer").selectChild(_1378.my_content_pane);
var _1379=document.createElement("div");
_1378.node.appendChild(_1379);
var _137a=pion.reactors.createReactor(_1377,_1379);
pion.reactors.reactors_by_id[_1377["@id"]]=_137a;
_137a.workspace=_1378;
_1378.reactors.push(_137a);
console.debug("X, Y = ",_1377.X,", ",_1377.Y);
};
pion.reactors.createConnection=function(_137b,_137c,_137d){
var _137e=pion.reactors.reactors_by_id[_137b];
var _137f=pion.reactors.reactors_by_id[_137c];
pion.reactors.workspace_box=_137e.workspace;
var _1380=pion.reactors.workspace_box;
surface=_1380.my_surface;
dijit.byId("mainTabContainer").selectChild(_1380.my_content_pane);
var line=surface.createPolyline().setStroke("black");
pion.reactors.updateConnectionLine(line,_137e.domNode,_137f.domNode);
_137e.reactor_outputs.push({sink:_137f,line:line,id:_137d});
_137f.reactor_inputs.push({source:_137e,line:line,id:_137d});
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
var _1386=new dijit.layout.ContentPane({"class":"workspacePane",title:title,style:"overflow: auto"});
var _1387=dijit.byId("mainTabContainer");
var _1388=dojo.marginBox(_1387.domNode);
console.debug("margin_box = dojo.marginBox(tab_container.domNode) = ",_1388);
var shim=document.createElement("div");
if(_1388.w<minimum_workspace_width){
shim.style.width=minimum_workspace_width+"px";
}else{
shim.style.width=(_1388.w-4)+"px";
}
if(_1388.h<minimum_workspace_height){
shim.style.height=minimum_workspace_height+"px";
}
_1386.domNode.appendChild(shim);
_1387.addChild(_1386,i);
var _138a=new dojo.dnd.Target(shim,{accept:["reactor"]});
dojo.addClass(_138a.node,"workspaceTarget");
dojo.connect(_138a,"onDndDrop",function(_138b,nodes,copy,_138e){
pion.reactors.handleDropOnWorkspace(_138b,nodes,copy,_138a);
});
dojo.connect(_138a.node,"onmouseup",updateLatestMouseUpEvent);
_138a.my_content_pane=_1386;
_138a.onEmpty=function(_138f){
};
_1386.my_workspace_box=_138a;
workspaces_by_name[title]=_138a;
workspace_boxes[i]=_138a;
_1387.selectChild(_1386);
_138a.node.style.width=_138a.node.offsetWidth+"px";
var _1390=dojo.marginBox(_138a.node);
_1390.h-=6;
console.debug("surface_box = ",_1390);
_138a.my_surface=dojox.gfx.createSurface(_138a.node,_1390.w,_1390.h);
_138a.reactors=[];
_138a.isTracking=false;
if(!firefox_on_mac){
var menu=new dijit.Menu({targetNodeIds:[_1386.controlButton.domNode,_138a.node]});
menu.addChild(new dijit.MenuItem({label:"Edit workspace configuration",onClick:function(){
showWorkspaceConfigDialog(_1386);
}}));
menu.addChild(new dijit.MenuItem({label:"Delete workspace",onClick:function(){
deleteWorkspaceIfConfirmed(_1386);
}}));
}
_138a.node.ondblclick=function(){
showWorkspaceConfigDialog(_1386);
};
_1386.controlButton.domNode.ondblclick=function(){
showWorkspaceConfigDialog(_1386);
};
};
function makeScrollHandler(_1392){
var _pane=_1392;
var _node=_1392.domNode;
return function(){
if(_pane.isScrolling){
return;
}
_pane.isScrolling=true;
var _1395=function(){
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
setTimeout(_1395,0);
};
};
function updateLatestMouseUpEvent(e){
latest_event=e;
console.debug("e = ",e);
pion.reactors.last_x=e.clientX;
pion.reactors.last_y=e.clientY;
};
pion.reactors.getNearbyGridPointInBox=function(_1397,_1398){
var c=_1397;
c.l+=STEP-1;
c.l-=c.l%STEP;
c.t+=STEP-1;
c.t-=c.t%STEP;
var _139a={};
_139a.l=_1398.l<c.l?c.l:c.r<_1398.l?c.r:_1398.l;
_139a.t=_1398.t<c.t?c.t:c.b<_1398.t?c.b:_1398.t;
_139a.l-=_139a.l%STEP;
_139a.t-=_139a.t%STEP;
return _139a;
};
pion.reactors.updateConnectionLine=function(poly,_139c,_139d){
var x1=_139c.offsetLeft+_139c.offsetWidth/2;
var y1=_139c.offsetTop+_139c.offsetHeight/2;
if(_139d.offsetTop>y1){
var x2=_139d.offsetLeft+_139d.offsetWidth/2;
var y2=_139d.offsetTop;
var a1={x:x2-5,y:y2-5};
var a2={x:x2+5,y:y2-5};
}else{
if(_139d.offsetTop+_139d.offsetHeight<y1){
var x2=_139d.offsetLeft+_139d.offsetWidth/2;
var y2=_139d.offsetTop+_139d.offsetHeight;
var a1={x:x2-5,y:y2+5};
var a2={x:x2+5,y:y2+5};
}else{
if(_139d.offsetLeft>x1){
var x2=_139d.offsetLeft;
var y2=y1;
var a1={x:x2-5,y:y2-5};
var a2={x:x2-5,y:y2+5};
}else{
var x2=_139d.offsetLeft+_139d.offsetWidth;
var y2=y1;
var a1={x:x2+5,y:y2-5};
var a2={x:x2+5,y:y2+5};
}
}
}
poly.setShape([{x:x1,y:y1},{x:x2,y:y1},{x:x2,y:y2},a1,{x:x2,y:y2},a2]).setStroke("black");
};
pion.reactors.createReactor=function(_13a4,node){
plugin_class_name="plugins.reactors."+_13a4.Plugin;
var _13a6=dojo.getObject(plugin_class_name);
if(_13a6){
console.debug("found class ",plugin_class_name);
var _13a7=new _13a6({config:_13a4},node);
}else{
console.debug("class ",plugin_class_name," not found; using plugins.reactors.Reactor instead.");
var _13a7=new plugins.reactors.Reactor({config:_13a4},node);
}
return _13a7;
};
pion.reactors.handleDropOnWorkspace=function(_13a8,nodes,copy,_13ab){
console.debug("handleDropOnWorkspace called, target.node = ",_13ab.node,", workspace_box.node = ",pion.reactors.workspace_box.node);
dojo.query(".dojoDndItem",pion.reactors.workspace_box.node).forEach(function(n){
if(n.getAttribute("dndType")=="connector"){
console.debug("Removing ",n);
pion.reactors.workspace_box.node.removeChild(n);
}
});
if(!_13ab.checkAcceptance(_13a8,nodes)){
return;
}
if(_13ab!=pion.reactors.workspace_box){
return;
}
var _13ad=nodes[0].getAttribute("reactor_type");
var _13ae="plugins.reactors."+_13ad+"InitDialog";
console.debug("dialog_class_name: ",_13ae);
var _13af=dojo.getObject(_13ae);
if(_13af){
var _13b0=new _13af();
}else{
var _13b0=new plugins.reactors.ReactorInitDialog({title:_13ad+" Initialization",plugin:_13ad});
}
setTimeout(function(){
dojo.query("input",_13b0.domNode)[0].select();
},500);
dojo.query(".dijitButton.cancel",_13b0.domNode).forEach(function(n){
dojo.connect(n,"click",_13b0,"onCancel");
});
_13b0.show();
};
pion.reactors.handleDropOnReactor=function(_13b2,nodes,copy,_13b5){
var _13b6=pion.reactors.workspace_box;
console.debug("handleDropOnReactor called, target.node.getAttribute(\"reactor_type\") = ",_13b5.node.getAttribute("reactor_type"));
if(!_13b5.node.getAttribute("reactor_type")){
return;
}
dojo.query(".dojoDndItem",_13b5.node).forEach(function(n){
_13b5.node.removeChild(n);
});
if(_13b6.isTracking){
return;
}
console.debug("nodes[0].getAttribute(\"dndType\") = ",nodes[0].getAttribute("dndType"));
console.debug("nodes[0].getAttribute(\"reactor_type\") = ",nodes[0].getAttribute("reactor_type"));
if(nodes[0].getAttribute("dndType")!="connector"){
console.debug("returning because nodes[0].getAttribute(\"dndType\") != \"connector\"");
return;
}
_13b6.isTracking=true;
var x1=_13b5.node.offsetLeft+_13b5.node.offsetWidth;
var y1=_13b5.node.offsetTop+_13b5.node.offsetHeight/2;
console.debug("x1 = ",x1,", y1 = ",y1);
_13b6.trackLine=surface.createPolyline([{x:x1,y:y1},{x:x1+20,y:y1},{x:x1+15,y:y1-5},{x:x1+20,y:y1},{x:x1+15,y:y1+5}]).setStroke("black");
var _13ba=dojo.byId("reactor_config_content").offsetLeft;
var _13bb=dojo.byId("reactor_config_content").offsetTop;
_13bb+=dojo.byId("reactor_config").offsetTop;
console.debug("xOffset = ",_13ba,", yOffset = ",_13bb);
mouseConnection=dojo.connect(_13b6.node,"onmousemove",function(event){
var x2=event.clientX-_13ba;
var y2=event.clientY-_13bb;
_13b6.trackLine.setShape([{x:x1,y:y1},{x:x2,y:y1},{x:x2,y:y2}]);
});
console.debug("created mouseConnection");
wrapperWithStartpoint=function(event){
dojo.disconnect(mouseConnection);
console.debug("disconnected mouseConnection");
_13b6.trackLine.removeShape();
handleSelectionOfConnectorEndpoint(event,_13b5.node);
};
dojo.query(".moveable").filter(function(n){
return n!=_13b5.node;
}).forEach("item.onClickHandler = dojo.connect(item, 'click', wrapperWithStartpoint)");
};
function handleSelectionOfConnectorEndpoint(event,_13c2){
pion.reactors.workspace_box.isTracking=false;
console.debug("handleSelectionOfConnectorEndpoint: event = ",event);
var _13c3=dijit.byNode(_13c2);
console.debug("source_reactor = ",_13c3);
var _13c4=dijit.byNode(event.target);
if(!_13c4){
_13c4=dijit.byNode(event.target.parentNode);
}
console.debug("sink_reactor = ",_13c4);
dojo.query(".moveable").forEach("dojo.disconnect(item.onClickHandler)");
var _13c5="<PionConfig><Connection><Type>reactor</Type>"+"<From>"+_13c3.config["@id"]+"</From>"+"<To>"+_13c4.config["@id"]+"</To>"+"</Connection></PionConfig>";
dojo.rawXhrPost({url:"/config/connections",contentType:"text/xml",handleAs:"xml",postData:_13c5,load:function(_13c6){
var node=_13c6.getElementsByTagName("Connection")[0];
var id=node.getAttribute("id");
console.debug("connection id (from server): ",id);
var line=surface.createPolyline().setStroke("black");
pion.reactors.updateConnectionLine(line,_13c3.domNode,_13c4.domNode);
_13c3.reactor_outputs.push({sink:_13c4,line:line,id:id});
_13c4.reactor_inputs.push({source:_13c3,line:line,id:id});
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_13c5})});
};
pion.reactors.showReactorConfigDialog=function(_13ca){
var _13cb="plugins.reactors."+_13ca.config.Plugin+"Dialog";
console.debug("dialog_class_name = ",_13cb);
var _13cc=dojo.getObject(_13cb);
if(_13cc){
var _13cd=new _13cc({reactor:_13ca});
}else{
var _13cd=new plugins.reactors.ReactorDialog({title:_13ca.config.Plugin+" Configuration",reactor:_13ca});
}
_13cd.setValues(_13ca.config);
var _13ce=[];
for(var i=0;i<_13ca.reactor_inputs.length;++i){
var _13d0=[];
_13d0[0]=_13ca.reactor_inputs[i].source.config.Name;
_13d0[1]=_13ca.reactor_inputs[i].id;
_13ce.push(_13d0);
}
pion.reactors.reactor_inputs_grid_model.setData(_13ce);
var _13d1=_13cd.reactor_inputs_grid;
setTimeout(function(){
_13d1.update();
_13d1.resize();
},200);
dojo.connect(_13d1,"onCellClick",function(e){
console.debug("e.rowIndex = ",e.rowIndex,", e.cellIndex = ",e.cellIndex);
if(e.cellIndex==2){
console.debug("Removing connection in row ",e.rowIndex);
var _13d3=_13ca.reactor_inputs[e.rowIndex];
dojo.xhrDelete({url:"/config/connections/"+_13d3.id,handleAs:"xml",timeout:5000,load:function(_13d4,_13d5){
console.debug("xhrDelete for url = /config/connections/",_13d3.id,"; HTTP status code: ",_13d5.xhr.status);
_13d1.removeSelectedRows();
var _13d6=_13d3.source;
_13d3.line.removeShape();
_13ca.reactor_inputs.splice(e.rowIndex,1);
for(var j=0;j<_13d6.reactor_outputs.length;++j){
if(_13d6.reactor_outputs[j].sink==_13ca){
_13d6.reactor_outputs.splice(j,1);
break;
}
}
return _13d4;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
}
});
var _13d8=[];
for(var i=0;i<_13ca.reactor_outputs.length;++i){
var _13d9=[];
_13d9[0]=_13ca.reactor_outputs[i].sink.config.Name;
_13d9[1]=_13ca.reactor_outputs[i].id;
_13d8.push(_13d9);
}
pion.reactors.reactor_outputs_grid_model.setData(_13d8);
var _13da=_13cd.reactor_outputs_grid;
setTimeout(function(){
_13da.update();
_13da.resize();
},200);
dojo.connect(_13da,"onCellClick",function(e){
console.debug("e.rowIndex = ",e.rowIndex,", e.cellIndex = ",e.cellIndex);
if(e.cellIndex==2){
console.debug("Removing connection in row ",e.rowIndex);
var _13dc=_13ca.reactor_outputs[e.rowIndex];
dojo.xhrDelete({url:"/config/connections/"+_13dc.id,handleAs:"xml",timeout:5000,load:function(_13dd,_13de){
console.debug("xhrDelete for url = /config/connections/",_13dc.id,"; HTTP status code: ",_13de.xhr.status);
_13da.removeSelectedRows();
var _13df=_13dc.sink;
_13dc.line.removeShape();
_13ca.reactor_outputs.splice(e.rowIndex,1);
for(var j=0;j<_13df.reactor_inputs.length;++j){
if(_13df.reactor_inputs[j].source==_13ca){
_13df.reactor_inputs.splice(j,1);
break;
}
}
return _13dd;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
}
});
dojo.query(".dijitComboBox[name='event_type']",_13cd.domNode).forEach(function(n){
dijit.byNode(n).setValue(_13ca.event_type||1);
});
dojo.query(".dijitButton.delete",_13cd.domNode).forEach(function(n){
dojo.connect(n,"click",function(){
_13cd.onCancel();
pion.reactors.deleteReactorIfConfirmed(_13ca);
});
});
dojo.query(".dijitButton.cancel",_13cd.domNode).forEach(function(n){
dojo.connect(n,"click",_13cd,"onCancel");
});
dojo.query(".dijitButton.save",_13cd.domNode).forEach(function(n){
dijit.byNode(n).onClick=function(){
return _13cd.isValid();
};
});
setTimeout(function(){
dojo.query("input",_13cd.domNode)[0].select();
},500);
_13cd.show();
};
pion.reactors.showXMLDialog=function(_13e5){
window.open("/config/reactors/"+_13e5.config["@id"]);
};
pion.reactors.deleteReactorIfConfirmed=function(_13e6){
var _13e7=dijit.byId("delete_confirmation_dialog");
dojo.byId("are_you_sure").innerHTML="Are you sure you want to delete this reactor?";
dojo.byId("confirm_delete").onclick=function(){
_13e7.onCancel();
deleteReactor(_13e6);
};
dojo.byId("cancel_delete").onclick=function(){
_13e7.onCancel();
};
_13e7.show();
setTimeout("dijit.byId('cancel_delete').focus()",500);
};
function deleteReactor(_13e8){
console.debug("deleting ",_13e8.config.Name);
dojo.xhrDelete({url:"/config/reactors/"+_13e8.config["@id"],handleAs:"xml",timeout:5000,load:function(_13e9,_13ea){
console.debug("xhrDelete for url = /config/reactors/",_13e8.config["@id"],"; HTTP status code: ",_13ea.xhr.status);
for(var i=0;i<_13e8.reactor_inputs.length;++i){
var _13ec=_13e8.reactor_inputs[i].source;
_13e8.reactor_inputs[i].line.removeShape();
for(var j=0;j<_13ec.reactor_outputs.length;++j){
if(_13ec.reactor_outputs[j].sink==_13e8){
_13ec.reactor_outputs.splice(j,1);
}
}
}
for(var i=0;i<_13e8.reactor_outputs.length;++i){
var _13ee=_13e8.reactor_outputs[i].sink;
_13e8.reactor_outputs[i].line.removeShape();
for(var j=0;j<_13ee.reactor_inputs.length;++j){
if(_13ee.reactor_inputs[j].source==_13e8){
_13ee.reactor_inputs.splice(j,1);
}
}
}
var _13ef=pion.reactors.workspace_box;
_13ef.node.removeChild(_13e8.domNode);
for(var j=0;j<_13ef.reactors.length;++j){
if(_13ef.reactors[j]==_13e8){
_13ef.reactors.splice(j,1);
}
}
if(_13ef.reactors.length==0){
_13ef.onEmpty(_13ef.my_content_pane);
}
return _13e9;
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
var _13f1=pion.reactors.workspace_box;
var _13f2=_13f1.my_content_pane.domNode.offsetWidth;
var _13f3=_13f1.my_content_pane.domNode.offsetHeight;
_13f2-=2;
_13f3-=6;
var _13f4=surface.getDimensions();
var _13f5=parseInt(_13f4.width);
var _13f6=parseInt(_13f4.height);
console.debug("old_width = ",_13f5,", new_width = ",_13f2,", old_height = ",_13f6,", new_height = ",_13f3);
if(_13f2>_13f5){
console.debug("expanding workspace width to ",_13f2,"px");
_13f1.node.style.width=_13f2+"px";
_13f4.width=_13f2;
}
if(_13f3>_13f6){
console.debug("expanding workspace height to ",_13f3,"px");
_13f1.node.style.height=_13f3+"px";
_13f4.height=_13f3;
}
if(_13f2>_13f5||_13f3>_13f6){
surface.setDimensions(parseInt(_13f4.width)+"px",parseInt(_13f4.height)+"px");
}
};
function handleKeyPress(e){
var _13f8=pion.reactors.workspace_box;
if(e.keyCode==dojo.keys.ESCAPE){
if(_13f8.isTracking){
dojo.disconnect(mouseConnection);
_13f8.trackLine.removeShape();
_13f8.isTracking=false;
}
}
};
function showWorkspaceConfigDialog(_13f9){
console.debug("showWorkspaceConfigDialog: workspace_pane = ",_13f9);
console.debug("workspace_pane.title = ",_13f9.title);
var _13fa=dijit.byId("workspace_name");
_13fa.isValid=function(_13fb){
if(!this.validator(this.textbox.value,this.constraints)){
this.invalidMessage="Invalid Workspace name";
console.debug("validationTextBox.isValid returned false");
return false;
}
if(isDuplicateWorkspaceName(_13f9,this.textbox.value)){
this.invalidMessage="A Workspace with this name already exists";
console.debug("In validationTextBox.isValid, isDuplicateWorkspaceName returned true");
return false;
}
console.debug("validationTextBox.isValid returned true");
return true;
};
_13fa.setDisplayedValue(_13f9.title);
var _13fc=dijit.byId("workspace_dialog");
dojo.query(".dijitButton.delete",_13fc.domNode).forEach(function(n){
dojo.connect(n,"click",function(){
_13fc.onCancel();
deleteWorkspaceIfConfirmed(_13f9);
});
});
dojo.query(".dijitButton.cancel",_13fc.domNode).forEach(function(n){
dojo.connect(n,"click",_13fc,"onCancel");
});
dojo.query(".dijitButton.save",_13fc.domNode).forEach(function(n){
dijit.byNode(n).onClick=function(){
return _13fc.isValid();
};
});
setTimeout(function(){
dojo.query("input",_13fc.domNode)[0].select();
},500);
_13fc.show();
_13fc.execute=function(_1400){
updateWorkspaceConfig(_1400,_13f9);
};
};
function updateWorkspaceConfig(_1401,node){
node.title=_1401.name;
dojo.byId(node.controlButton.id).innerHTML=_1401.name;
};
function isDuplicateWorkspaceName(_1403,name){
for(var i=0;i<workspace_boxes.length;++i){
if(workspace_boxes[i].my_content_pane!=_1403&&workspace_boxes[i].my_content_pane.title==name){
return true;
}
}
return false;
};
function deleteWorkspaceIfConfirmed(_1406){
if(_1406.my_workspace_box.reactors.length==0){
_deleteEmptyWorkspace(_1406);
return;
}
var _1407=dijit.byId("delete_confirmation_dialog");
dojo.byId("are_you_sure").innerHTML="Are you sure you want to delete workspace '"+_1406.title+"' and all the reactors it contains?";
dojo.byId("confirm_delete").onclick=function(){
_1407.onCancel();
deleteWorkspace(_1406);
};
dojo.byId("cancel_delete").onclick=function(){
_1407.onCancel();
};
_1407.show();
setTimeout("dijit.byId('cancel_delete').focus()",500);
};
function deleteWorkspace(_1408){
var _1409=[];
for(var i=0;i<_1408.my_workspace_box.reactors.length;++i){
_1409[i]=_1408.my_workspace_box.reactors[i];
}
for(i=0;i<_1409.length;++i){
deleteReactor(_1409[i]);
}
dojo.connect(_1408.my_workspace_box,"onEmpty",_deleteEmptyWorkspace);
};
function _deleteEmptyWorkspace(_140b){
console.debug("deleting ",_140b.title);
delete workspaces_by_name[_140b.title];
for(var j=0;j<workspace_boxes.length;++j){
if(workspace_boxes[j]==_140b.my_workspace_box){
workspace_boxes.splice(j,1);
}
}
dijit.byId("mainTabContainer").removeChild(_140b);
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
dojo.declare("plugins.vocabularies.VocabularyInitDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog vocabulary_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Vocabulary Initialization</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>ID:</label></td\r\n\t\t\t\t><td><input dojoAttachPoint=\"id_widget\" dojoType=\"dijit.form.ValidationTextBox\" type=\"text\" name=\"@id\"\r\n\t\t\t\t\t regExp=\"\\w+\" required=\"true\"></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Name:</label></td\r\n\t\t\t\t><td><input dojoAttachPoint=\"name_widget\" dojoType=\"dijit.form.ValidationTextBox\" name=\"Name\" class=\"name_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Comments:</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Comment\" class=\"comment_text_box\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t></div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onclick: hide\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
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
this.format_widget.setAttribute("disabled",false);
this.format_widget.setValue("%Y");
this.format_widget.domNode.style.visibility="visible";
}else{
this.format_widget.setAttribute("disabled",true);
this.format_widget.setValue("");
this.format_widget.domNode.style.visibility="hidden";
}
if(type=="fixed-length string"){
this.size_widget.setAttribute("disabled",false);
this.size_widget.setValue("1");
this.size_widget.domNode.style.visibility="visible";
}else{
this.size_widget.setAttribute("disabled",true);
this.size_widget.setValue("");
this.size_widget.domNode.style.visibility="hidden";
}
},execute:function(_1414){
var pane=pion.vocabularies.selected_pane;
var _1416={ID:_1414["@id"],Type:_1414.Type,Comment:_1414.Comment};
_1416.Format=_1414.Format?_1414.Format:"-";
_1416.Size=_1414.Size?_1414.Size:"-";
pane.working_store.newItem(_1416);
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
dojo.connect(this.vocab_grid,"onStartEdit",function(_141a,_141b){
console.debug("***** onStartEdit: inCell = ",_141a,", inRowIndex = ",_141b);
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
var _141e={};
_141e.ID=_this.vocab_term_store.getValue(item,"@id").split("#")[1];
var type=_this.vocab_term_store.getValue(item,"Type");
_141e.Type=pion.terms.type_descriptions_by_name[type.toString()];
_141e.Format=_this.vocab_term_store.getValue(type,"@format");
_141e.Size=_this.vocab_term_store.getValue(type,"@size");
var _1420=_this.vocab_term_store.getValue(item,"Comment");
if(_1420){
_141e.Comment=_1420.toString();
}
_this.items.push(_141e);
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
this.vocab_store.fetch({query:{"tagName":"Vocabulary"},onComplete:function(items,_1425){
console.debug("vocab_store.fetch.onComplete: items.length = ",items.length);
_this.vocab_item=items[0];
_this.populateFromVocabItem();
},onError:pion.handleFetchError});
},populateFromVocabItem:function(){
this.config.Name=this.vocab_store.getValue(this.vocab_item,"Name").toString();
var _1426=this.vocab_store.getValue(this.vocab_item,"Comment");
if(_1426){
this.config.Comment=_1426.toString();
}
var _1427=this.vocab_store.getValue(this.vocab_item,"Locked");
this.config.Locked=(typeof _1427!=="undefined")&&_1427.toString()=="true";
console.dir(this.config);
this.name.setAttribute("disabled",this.config.Locked);
this.comment.disabled=this.config.Locked;
this.add_new_term_button.setAttribute("disabled",this.config.Locked);
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
var _1428=dojo.clone(this.config);
_1428.checkboxes=this.config.Locked?["locked"]:[];
this.form.setValues(_1428);
var _1429=dojo.query("textarea.comment",this.form.domNode)[0];
_1429.value=this.config.Comment?this.config.Comment:"";
this.title=this.config.Name;
var _142a=dojo.query(".dijitAccordionTitle .dijitAccordionText",this.domNode)[0];
_142a.firstChild.nodeValue=this.title;
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
var _142f="-";
if(e.cellIndex==2){
if(type=="specific date"||type=="specific time"||type=="specific time & date"){
_142f=".*%.*";
}
}
if(e.cellIndex==3){
if(type=="fixed-length string"){
_142f="[1-9][0-9]*";
}
}
if(e.cell.editor.editor){
console.debug("e.cell.editor.editor.regExp set to ",_142f);
e.cell.editor.editor.regExp=_142f;
}else{
console.debug("e.cell.editorProps.regExp set to ",_142f);
e.cell.editorProps.regExp=_142f;
}
}
},_handleAddNewTerm:function(){
console.debug("_handleAddNewTerm");
var _1430=new plugins.vocabularies.TermInitDialog();
setTimeout(function(){
dojo.query("input",_1430.domNode)[0].select();
},500);
_1430.show();
},_handleLockingChange:function(){
console.debug("_handleLockingChange");
},save:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
this.saveVocabConfig();
this.saveChangedTerms();
},saveVocabConfig:function(){
var _this=this;
var _1432=this.form.getValues();
this.config.Name=_1432.Name;
this.config.Locked=dojo.indexOf(_1432.checkboxes,"locked")>=0;
var _1433=dojo.query("textarea.comment",this.form.domNode)[0];
this.config.Comment=_1433.value;
var _1434="<PionConfig><Vocabulary>";
for(var tag in this.config){
if(tag!="@id"){
_1434+="<"+tag+">"+this.config[tag]+"</"+tag+">";
}
}
_1434+="</Vocabulary></PionConfig>";
console.debug("put_data: ",_1434);
_this=this;
dojo.rawXhrPut({url:"/config/vocabularies/"+this.config["@id"],contentType:"text/xml",handleAs:"xml",putData:_1434,load:function(_1436){
console.debug("response: ",_1436);
_this.populateFromVocabStore();
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_1434})});
},saveChangedTerms:function(){
var store=this.working_store;
var _this=this;
var ID,url;
store._saveCustom=function(_143b,_143c){
for(ID in this._pending._modifiedItems){
url=dojox.dtl.filter.strings.urlencode("/config/terms/"+_this.config["@id"]+"#"+ID);
console.debug("_saveCustom: url = ",url);
this.fetchItemByIdentity({identity:ID,onItem:function(item){
var _143e="<PionConfig><Term><Type";
var _143f=store.getValue(item,"Format");
if(_143f&&_143f!="-"){
_143e+=" format=\""+_143f+"\"";
}
var size=store.getValue(item,"Size");
if(size&&size!="-"){
_143e+=" size=\""+size+"\"";
}
_143e+=">"+pion.terms.types_by_description[store.getValue(item,"Type")]+"</Type>";
if(store.getValue(item,"Comment")){
_143e+="<Comment>"+store.getValue(item,"Comment")+"</Comment>";
}
_143e+="</Term></PionConfig>";
console.debug("put_data = ",_143e);
dojo.rawXhrPut({url:url,handleAs:"xml",timeout:1000,contentType:"text/xml",putData:_143e,load:function(_1441,_1442){
console.debug("rawXhrPut for url = "+this.url,"; HTTP status code: ",_1442.xhr.status);
return _1441;
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_143e})});
},onError:pion.handleFetchError});
}
for(ID in this._pending._newItems){
url=dojox.dtl.filter.strings.urlencode("/config/terms/"+_this.config["@id"]+"#"+ID);
console.debug("_saveCustom: url = ",url);
var item=this._pending._newItems[ID];
var _1444="<PionConfig><Term><Type";
var _1445=store.getValue(item,"Format");
if(_1445&&_1445!="-"){
_1444+=" format=\""+_1445+"\"";
}
var size=store.getValue(item,"Size");
if(size&&size!="-"){
_1444+=" size=\""+size+"\"";
}
_1444+=">"+pion.terms.types_by_description[store.getValue(item,"Type")]+"</Type>";
if(store.getValue(item,"Comment")){
_1444+="<Comment>"+store.getValue(item,"Comment")+"</Comment>";
}
_1444+="</Term></PionConfig>";
console.debug("post_data = ",_1444);
dojo.rawXhrPost({url:url,handleAs:"xml",timeout:1000,contentType:"text/xml",postData:_1444,load:function(_1447,_1448){
console.debug("rawXhrPost for url = "+this.url,"; HTTP status code: ",_1448.xhr.status);
return _1447;
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1444})});
}
for(ID in this._pending._deletedItems){
url=dojox.dtl.filter.strings.urlencode("/config/terms/"+_this.config["@id"]+"#"+ID);
console.debug("_saveCustom: url = ",url);
dojo.xhrDelete({url:url,handleAs:"xml",timeout:1000,load:function(_1449,_144a){
console.debug("xhrDelete for url = "+this.url,"; HTTP status code: ",_144a.xhr.status);
return _1449;
},error:pion.getXhrErrorHandler(dojo.xhrDelete)});
}
_143b();
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
dojo.xhrDelete({url:"/config/vocabularies/"+this.config["@id"],handleAs:"xml",timeout:5000,load:function(_144b,_144c){
console.debug("xhrDelete for url = "+this.url,"; HTTP status code: ",_144c.xhr.status);
dijit.byId("vocab_config_accordion").forward();
dijit.byId("vocab_config_accordion").removeChild(_this);
pion.vocabularies._adjustAccordionSize();
return _144b;
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
var _144d=dijit.byId("vocab_config_accordion");
var _144e=_144d.getChildren().length;
console.debug("num_vocabs = "+_144e);
var _144f=450;
var _1450=0;
if(_144e>0){
var _1451=_144d.getChildren()[0];
var _1450=_1451.getTitleHeight();
}
var _1452=_144f+_144e*_1450;
_144d.resize({h:_1452});
pion.vocabularies.height=_1452+160;
dijit.byId("main_stack_container").resize({h:pion.vocabularies.height});
};
pion.vocabularies.isDuplicateVocabularyId=function(id){
var _1454=dijit.byId("vocab_config_accordion").getChildren();
var _1455="urn:vocab:"+id;
for(var i=0;i<_1454.length;++i){
if(_1454[i].config["@id"]==_1455){
return true;
}
}
return false;
};
pion.vocabularies.isDuplicateVocabularyName=function(name){
var _1458=dijit.byId("vocab_config_accordion").getChildren();
for(var i=0;i<_1458.length;++i){
if(_1458[i].title==name){
return true;
}
}
return false;
};
pion.vocabularies.config_store=new dojox.data.XmlStore({url:"/config/vocabularies",rootItem:"VocabularyConfig",attributeMap:{"VocabularyConfig.id":"@id"}});
pion.vocabularies.init=function(){
var _145a=null;
var _145b=["@id","Type","@format","Size","Comment"];
var _145c=_145b.length;
function _paneSelected(pane){
console.debug("Selected "+pane.title);
if(pane==_145a){
return;
}
if(_145a&&dojo.hasClass(_145a.domNode,"unsaved_changes")){
var _145e=new dijit.Dialog({title:"Warning: unsaved changes"});
_145e.setContent("Please save or cancel unsaved changes before selecting another Vocabulary.");
_145e.show();
setTimeout(function(){
dijit.byId("vocab_config_accordion").selectChild(_145a);
},500);
return;
}
_145a=pane;
pion.vocabularies.selected_pane=_145a;
pane.populateFromVocabStore();
var _145f=dijit.byId("vocab_config_accordion").duration;
setTimeout(function(){
dojo.style(pane.containerNode,"overflow","hidden");
},_145f+50);
};
dojo.subscribe("vocab_config_accordion-selectChild",_paneSelected);
function _createNewPane(_1460){
var _1461=document.createElement("span");
var _1462=new plugins.vocabularies.VocabularyPane(_1460,_1461);
return _1462;
};
pion.vocabularies.config_store.fetch({onComplete:function(items,_1464){
var _1465=dijit.byId("vocab_config_accordion");
for(var i=0;i<items.length;++i){
var id=pion.vocabularies.config_store.getValue(items[i],"@id");
var _1468=_createNewPane({config:{"@id":id},title:id});
_1465.addChild(_1468);
}
pion.vocabularies._adjustAccordionSize();
var _1469=_1465.getChildren()[0];
_1465.selectChild(_1469);
},onError:pion.handleFetchError});
function _addNewVocabulary(){
var _146a=new plugins.vocabularies.VocabularyInitDialog();
dojo.query(".dijitButton.cancel",_146a.domNode).forEach(function(n){
dojo.connect(n,"click",_146a,"onCancel");
});
dojo.query(".dijitButton.save",_146a.domNode).forEach(function(n){
dijit.byNode(n).onClick=function(){
return _146a.isValid();
};
});
setTimeout(function(){
dojo.query("input",_146a.domNode)[0].select();
},500);
_146a.show();
_146a.execute=function(_146d){
var _146e="<PionConfig><Vocabulary>";
_146e+="<Name>"+_146d.Name+"</Name>";
_146e+="<Comment>"+_146d.Comment+"</Comment>";
_146e+="</Vocabulary></PionConfig>";
console.debug("post_data: ",_146e);
var _146f="urn:vocab:"+_146d["@id"];
dojo.rawXhrPost({url:"/config/vocabularies/"+_146f,contentType:"text/xml",handleAs:"xml",postData:_146e,load:function(_1470){
var node=_1470.getElementsByTagName("Vocabulary")[0];
var _1472=dijit.byId("vocab_config_accordion");
var _1473=_createNewPane({config:{"@id":_146f,Name:_146d.Name},title:_146d.Name});
_1472.addChild(_1473);
pion.vocabularies._adjustAccordionSize();
_1472.selectChild(_1473);
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_146e})});
};
};
dojo.connect(dojo.byId("add_new_vocab_button"),"click",_addNewVocabulary);
};
}
if(!dojo._hasResource["pion.widgets.User"]){
dojo._hasResource["pion.widgets.User"]=true;
dojo.provide("pion.widgets.User");
dojo.declare("pion.widgets.UserInitDialog",[dijit.Dialog],{templateString:"<div class=\"dijitDialog user_dialog\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\">\r\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">Add New User</span>\r\n\t</div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"\r\n\t\t><table\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Username</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.ValidationTextBox\" regExp=\"[\\w-]+\" name=\"@id\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Last name</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"LastName\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>First name</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"FirstName\"/></td\r\n\t\t\t></tr\r\n\t\t\t><tr\r\n\t\t\t\t><td><label>Password</label></td\r\n\t\t\t\t><td><input dojoType=\"dijit.form.TextBox\" name=\"Password\" type=\"password\"/></td\r\n\t\t\t></tr\r\n\t\t></table\r\n\t</div>\r\n\t<div class=\"save_cancel_delete\">\r\n\t\t<button dojoType=dijit.form.Button class=\"save\" type=\"submit\">Save</button>\r\n\t\t<button dojoType=dijit.form.Button class=\"cancel\" dojoAttachEvent=\"onclick: hide\">Cancel</button>\r\n\t</div>\r\n</div>\r\n",postMixInProperties:function(){
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
var _1476={};
var _1477=store.getAttributes(item);
for(var i=0;i<_1477.length;++i){
if(_1477[i]!="Field"&&_1477[i]!="tagName"&&_1477[i]!="childNodes"){
_1476[_1477[i]]=store.getValue(item,_1477[i]).toString();
}
}
console.dir(_1476);
this.form.setValues(_1476);
console.debug("config = ",_1476);
var _1479=dojo.query(".dijitAccordionTitle .dijitAccordionText",this.domNode)[0];
_1479.firstChild.nodeValue=this.title;
var node=this.domNode;
setTimeout(function(){
dojo.removeClass(node,"unsaved_changes");
},500);
},save:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
var _147b=this.form.getValues();
var _147c="<PionConfig><User>";
for(var tag in _147b){
if(tag!="@id"){
console.debug("config[",tag,"] = ",_147b[tag]);
_147c+="<"+tag+">"+_147b[tag]+"</"+tag+">";
}
}
_147c+="</User></PionConfig>";
console.debug("put_data: ",_147c);
_this=this;
dojo.rawXhrPut({url:"/config/users/"+this.uuid,contentType:"text/xml",handleAs:"xml",putData:_147c,load:function(_147e){
console.debug("response: ",_147e);
pion.users.config_store.fetch({query:{"@id":_this.uuid},onItem:function(item){
_this.config_item=item;
_this.populateFromConfigItem(item);
},onError:pion.handleFetchError});
},error:pion.getXhrErrorHandler(dojo.rawXhrPut,{putData:_147c})});
},cancel:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
this.populateFromConfigItem(this.config_item);
},delete2:function(){
dojo.removeClass(this.domNode,"unsaved_changes");
console.debug("delete2: selected user is ",this.title);
_this=this;
dojo.xhrDelete({url:"/config/users/"+this.uuid,handleAs:"xml",timeout:5000,load:function(_1480,_1481){
console.debug("xhrDelete for url = /config/users/"+this.uuid,"; HTTP status code: ",_1481.xhr.status);
dijit.byId("user_config_accordion").forward();
dijit.byId("user_config_accordion").removeChild(_this);
pion.users._adjustAccordionSize();
return _1480;
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
function onComplete(items,_1484){
var _1485=dijit.byId("user_config_accordion");
for(var i=0;i<items.length;++i){
var title=pion.users.config_store.getValue(items[i],"@id");
var _1488=createNewUserPane(title);
_1488.config_item=items[i];
_1488.uuid=pion.users.config_store.getValue(items[i],"@id");
_1485.addChild(_1488);
}
pion.users._adjustAccordionSize();
var _1489=_1485.getChildren()[0];
_1485.selectChild(_1489);
};
if(file_protocol){
dijit.byId("user_config_accordion").removeChild(selected_user_pane);
}else{
pion.users.config_store.fetch({onComplete:onComplete,onError:pion.handleFetchError});
}
dojo.connect(dojo.byId("add_new_user_button"),"click",addNewUser);
};
function createNewUserPane(title){
var _148b=document.createElement("span");
var _148c=new pion.widgets.UserPane({"class":"user_pane",title:title},_148b);
return _148c;
};
function addNewUser(){
var _148d=new pion.widgets.UserInitDialog();
setTimeout(function(){
dojo.query("input",_148d.domNode)[0].select();
},500);
dojo.query(".dijitButton.cancel",_148d.domNode).forEach(function(n){
dojo.connect(n,"click",_148d,"onCancel");
});
_148d.show();
_148d.execute=function(_148f){
console.debug(_148f);
var id=_148f["@id"];
delete _148f["@id"];
var _1491="<PionConfig><User id=\""+id+"\">";
for(var tag in _148f){
console.debug("dialogFields[",tag,"] = ",_148f[tag]);
_1491+="<"+tag+">"+_148f[tag]+"</"+tag+">";
}
_1491+="</User></PionConfig>";
console.debug("post_data: ",_1491);
dojo.rawXhrPost({url:"/config/users",contentType:"text/xml",handleAs:"xml",postData:_1491,load:function(_1493){
var _1494=dijit.byId("user_config_accordion");
var _1495=createNewUserPane(id);
_1495.uuid=id;
_1494.addChild(_1495);
pion.users._adjustAccordionSize();
_1494.selectChild(_1495);
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_1491})});
};
};
pion.users._adjustAccordionSize=function(){
var _1496=dijit.byId("user_config_accordion");
var _1497=_1496.getChildren().length;
console.debug("num_users = "+_1497);
var _1498=210;
var _1499=0;
if(_1497>0){
var _149a=_1496.getChildren()[0];
_1499=_149a.getTitleHeight();
}
var _149b=_1498+_1497*_1499;
_1496.resize({h:_149b});
pion.users.height=_149b+160;
dijit.byId("main_stack_container").resize({h:pion.users.height});
};
function userPaneSelected(pane){
console.debug("Selected "+pane.title);
if(pane==selected_user_pane){
return;
}
if(selected_user_pane&&dojo.hasClass(selected_user_pane.domNode,"unsaved_changes")){
var _149d=new dijit.Dialog({title:"Warning: unsaved changes"});
_149d.setContent("Please save or cancel unsaved changes before selecting another User.");
_149d.show();
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
var _14a0=dijit.byId("user_config_accordion").duration;
setTimeout(function(){
dojo.style(pane.containerNode,"overflow","hidden");
},_14a0+50);
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
var _14a1="<PionConfig>"+this.XML_text_area.value+"</PionConfig>";
var _14a2=_14a1.replace(/>\s*/g,">");
if(dojo.isIE){
var _14a3=dojox.data.dom.createDocument();
_14a3.loadXML(_14a2);
}else{
var _14a4=new DOMParser();
var _14a3=_14a4.parseFromString(_14a2,"text/xml");
}
var _14a5=_14a3.childNodes[0].childNodes;
this.result_text_area.value+=_14a5.length+" configurations found.\n";
this.configs_by_type={Codec:[],Database:[],Reactor:[],Connection:[]};
for(var i=0;i<_14a5.length;++i){
var type=_14a5[i].nodeName;
if(!this.configs_by_type[type]){
this.result_text_area.value+="Error: unknown configuration type \""+type+"\".\n";
return;
}
this.configs_by_type[type].push(_14a5[i]);
}
this.processCodecs();
},processCodecs:function(){
if(this.configs_by_type.Codec.length==0){
this.result_text_area.value+="No Codec configurations found.\n";
this.processDatabases();
}else{
this.result_text_area.value+=this.configs_by_type.Codec.length+" Codec configurations found.\n";
var _14a8=0;
var _this=this;
dojo.forEach(this.configs_by_type.Codec,function(_14aa){
var _14ab=_14aa.getAttribute("id");
var _14ac="<PionConfig>"+dojox.data.dom.innerXML(_14aa)+"</PionConfig>";
dojo.rawXhrPost({url:"/config/codecs",contentType:"text/xml",handleAs:"xml",postData:_14ac,load:function(_14ad){
var node=_14ad.getElementsByTagName("Codec")[0];
var _14af=node.getAttribute("id");
if(_14ab){
_this.uuid_replacements[_14ab]=_14af;
}
if(codec_config_page_initialized){
pion.codecs.createNewPaneFromStore(_14af,false);
}
var name=node.getElementsByTagName("Name")[0].childNodes[0].nodeValue;
_this.result_text_area.value+="Codec named \""+name+"\" added with new UUID "+_14af+"\n";
if(++_14a8==_this.configs_by_type.Codec.length){
_this.processDatabases();
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_14ac})});
});
}
},processDatabases:function(){
if(this.configs_by_type.Database.length==0){
this.result_text_area.value+="No Database configurations found.\n";
this.processReactors();
}else{
this.result_text_area.value+=this.configs_by_type.Database.length+" Database configurations found.\n";
var _14b1=0;
var _this=this;
dojo.forEach(this.configs_by_type.Database,function(_14b3){
var _14b4=_14b3.getAttribute("id");
var _14b5="<PionConfig>"+dojox.data.dom.innerXML(_14b3)+"</PionConfig>";
dojo.rawXhrPost({url:"/config/databases",contentType:"text/xml",handleAs:"xml",postData:_14b5,load:function(_14b6){
var node=_14b6.getElementsByTagName("Database")[0];
var _14b8=node.getAttribute("id");
if(_14b4){
_this.uuid_replacements[_14b4]=_14b8;
}
if(database_config_page_initialized){
pion.databases.createNewPaneFromStore(_14b8,false);
}
var name=node.getElementsByTagName("Name")[0].childNodes[0].nodeValue;
_this.result_text_area.value+="Database named \""+name+"\" added with new UUID "+_14b8+"\n";
if(++_14b1==_this.configs_by_type.Database.length){
_this.processReactors();
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_14b5})});
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
var _14ba=0;
var _this=this;
dojo.forEach(this.configs_by_type.Reactor,function(_14bc){
var _14bd=_14bc.getAttribute("id");
var _14be="<PionConfig>"+dojox.data.dom.innerXML(_14bc)+"</PionConfig>";
for(var _14bf in _this.uuid_replacements){
_14be=_14be.replace(RegExp(_14bf,"g"),_this.uuid_replacements[_14bf]);
}
console.debug("post_data = ",_14be);
dojo.rawXhrPost({url:"/config/reactors",contentType:"text/xml",handleAs:"xml",postData:_14be,load:function(_14c0){
var node=_14c0.getElementsByTagName("Reactor")[0];
var _14c2=node.getAttribute("id");
if(_14bd){
_this.uuid_replacements[_14bd]=_14c2;
}
var _14c3={"@id":_14c2};
var _14c4=node.childNodes;
for(var i=0;i<_14c4.length;++i){
if(_14c4[i].firstChild){
_14c3[_14c4[i].tagName]=_14c4[i].firstChild.nodeValue;
}
}
pion.reactors.createReactorInConfiguredWorkspace(_14c3);
_this.result_text_area.value+="Reactor named \""+_14c3.Name+"\" added with new UUID "+_14c2+"\n";
if(++_14ba==_this.configs_by_type.Reactor.length){
dijit.byId("main_stack_container").selectChild(dijit.byId("system_config"));
console.debug("this.uuid_replacements = ",this.uuid_replacements);
_this.processConnections();
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_14be})});
});
}
},processConnections:function(){
if(this.configs_by_type.Connection.length==0){
this.result_text_area.value+="No Connection configurations found.\n";
}else{
dijit.byId("main_stack_container").selectChild(dijit.byId("reactor_config"));
this.result_text_area.value+=this.configs_by_type.Connection.length+" Connections found.\n";
var _14c6=0;
var _this=this;
dojo.forEach(this.configs_by_type.Connection,function(_14c8){
var _14c9=_14c8.getAttribute("id");
var _14ca="<PionConfig>"+dojox.data.dom.innerXML(_14c8)+"</PionConfig>";
for(var _14cb in _this.uuid_replacements){
_14ca=_14ca.replace(RegExp(_14cb,"g"),_this.uuid_replacements[_14cb]);
}
console.debug("post_data = ",_14ca);
dojo.rawXhrPost({url:"/config/connections",contentType:"text/xml",handleAs:"xml",postData:_14ca,load:function(_14cc){
var node=_14cc.getElementsByTagName("Connection")[0];
var _14ce=node.getAttribute("id");
var _14cf=_14cc.getElementsByTagName("From")[0].firstChild.nodeValue;
var to_id=_14cc.getElementsByTagName("To")[0].firstChild.nodeValue;
pion.reactors.createConnection(_14cf,to_id,_14ce);
_this.result_text_area.value+="Connection from "+_14cf+" to "+to_id+" added with new UUID "+_14ce+"\n";
if(++_14c6==_this.configs_by_type.Connection.length){
dijit.byId("main_stack_container").selectChild(dijit.byId("system_config"));
}
},error:pion.getXhrErrorHandler(dojo.rawXhrPost,{postData:_14ca})});
});
}
}});
}
if(!dojo._hasResource["pion.system"]){
dojo._hasResource["pion.system"]=true;
dojo.provide("pion.system");
var server_store;
dojo.declare("childlessChildrenFirstStore",dojo.data.ItemFileWriteStore,{getValues:function(item,_14d2){
var _14d3=this.inherited("getValues",arguments);
if(_14d2!="services"){
return _14d3;
}
var len=_14d3.length;
for(var i=0;i<len;++i){
if(_14d3[0].services){
_14d3.push(_14d3[0]);
_14d3.splice(0,1);
}
}
return _14d3;
}});
pion.system.getHeight=function(){
return 800;
};
pion.system.init=function(){
dijit.byId("main_stack_container").resize({h:pion.system.getHeight()});
if(file_protocol){
return;
}
dojo.xhrGet({url:"/config",handleAs:"xml",timeout:5000,load:function(_14d6,_14d7){
console.debug("in load()");
if(dojo.isIE){
dojo.byId("platform_conf_file").innerHTML=_14d6.getElementsByTagName("PlatformConfig")[0].xml;
dojo.byId("reactor_conf_file").innerHTML=_14d6.getElementsByTagName("ReactorConfig")[0].xml;
dojo.byId("vocab_conf_file").innerHTML=_14d6.getElementsByTagName("VocabularyConfig")[0].xml;
dojo.byId("codec_conf_file").innerHTML=_14d6.getElementsByTagName("CodecConfig")[0].xml;
dojo.byId("database_conf_file").innerHTML=_14d6.getElementsByTagName("DatabaseConfig")[0].xml;
dojo.byId("user_conf_file").innerHTML=_14d6.getElementsByTagName("UserConfig")[0].xml;
dojo.byId("protocol_conf_file").innerHTML=_14d6.getElementsByTagName("ProtocolConfig")[0].xml;
dojo.byId("service_conf_file").innerHTML=_14d6.getElementsByTagName("ServiceConfig")[0].xml;
dojo.byId("log_conf_file").innerHTML=_14d6.getElementsByTagName("LogConfig")[0].xml;
dojo.byId("vocab_path").innerHTML=_14d6.getElementsByTagName("VocabularyPath")[0].xml;
}else{
dojo.byId("platform_conf_file").innerHTML=_14d6.getElementsByTagName("PlatformConfig")[0].textContent;
dojo.byId("reactor_conf_file").innerHTML=_14d6.getElementsByTagName("ReactorConfig")[0].textContent;
dojo.byId("vocab_conf_file").innerHTML=_14d6.getElementsByTagName("VocabularyConfig")[0].textContent;
dojo.byId("codec_conf_file").innerHTML=_14d6.getElementsByTagName("CodecConfig")[0].textContent;
dojo.byId("database_conf_file").innerHTML=_14d6.getElementsByTagName("DatabaseConfig")[0].textContent;
dojo.byId("user_conf_file").innerHTML=_14d6.getElementsByTagName("UserConfig")[0].textContent;
dojo.byId("protocol_conf_file").innerHTML=_14d6.getElementsByTagName("ProtocolConfig")[0].textContent;
dojo.byId("service_conf_file").innerHTML=_14d6.getElementsByTagName("ServiceConfig")[0].textContent;
dojo.byId("log_conf_file").innerHTML=_14d6.getElementsByTagName("LogConfig")[0].textContent;
dojo.byId("vocab_path").innerHTML=_14d6.getElementsByTagName("VocabularyPath")[0].textContent;
}
var _14d8=dojo.byId("plugin_paths");
var _14d9=_14d8.getElementsByTagName("tr")[0];
while(_14d8.firstChild){
_14d8.removeChild(_14d8.firstChild);
}
var _14da=_14d6.getElementsByTagName("PluginPath");
var _14db=[];
for(var i=0;i<_14da.length;++i){
if(dojo.isIE){
_14db[i]=_14d8.insertRow();
dojo.forEach(_14d9.childNodes,function(n){
_14db[i].appendChild(dojo.clone(n));
});
}else{
_14db[i]=dojo.clone(_14d9);
_14d8.appendChild(_14db[i]);
}
_14db[i].getElementsByTagName("label")[0].innerHTML="Plugin Path "+(i+1);
var _14de=dojo.isIE?_14da[i].xml:_14da[i].textContent;
_14db[i].getElementsByTagName("td")[1].innerHTML=_14de;
}
return _14d6;
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
var _14e3=new pion.widgets.XMLImportDialog();
_14e3.show();
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
dojo.xhrGet({url:"/config",preventCache:true,handleAs:"xml",timeout:5000,load:function(_14e5,_14e6){
if(dojo.isIE){
var _14e7=_14e5.getElementsByTagName("Version")[0].childNodes[0].nodeValue;
}else{
var _14e7=_14e5.getElementsByTagName("Version")[0].textContent;
}
var _14e8="Unknown";
dojo.xhrGet({url:"/key/status",preventCache:true,handleAs:"xml",timeout:5000,load:function(_14e9,_14ea){
if(dojo.isIE){
var _14eb=_14e9.getElementsByTagName("Status")[0].childNodes[0].nodeValue;
}else{
var _14eb=_14e9.getElementsByTagName("Status")[0].textContent;
}
_14e8="Enterprise";
_this.doLicenseStuff(_14e7,_14e8,_14eb);
return _14e9;
},error:function(_14ec,_14ed){
if(_14ed.xhr.status==404){
_14e8="Community";
_this.doLicenseStuff(_14e7,_14e8,"404");
}
return _14ec;
}});
return _14e5;
}});
dojo.connect(this,"hide",this,"destroyRecursive");
},submitKey:function(e){
var key=this.license_key.value;
console.debug("key = ",key);
var _this=this;
dojo.rawXhrPut({url:"/key",contentType:"text/plain",handleAs:"text",putData:key,load:function(_14f1){
console.debug("response: ",_14f1);
_this.hide();
pion.about.doDialog();
return _14f1;
},error:function(_14f2,_14f3){
console.debug(_14f3);
_this.result_of_submitting_key.innerHTML="Error: Key not accepted.";
return _14f2;
}});
},doLicenseStuff:function(_14f4,_14f5,_14f6){
console.debug("pion_version = ",_14f4,", pion_edition = ",_14f5,", key_status = ",_14f6);
full_edition_str="Pion "+_14f5+" Edition";
full_version_str=full_edition_str+" v"+_14f4;
this.full_version.innerHTML=full_version_str;
if(_14f5=="Community"){
this.community_license.style.display="block";
}else{
if(_14f6=="valid"){
var _this=this;
dojo.xhrGet({url:"/key",preventCache:true,handleAs:"xml",timeout:5000,load:function(_14f8,_14f9){
if(dojo.isIE){
var _14fa=_14f8.getElementsByTagName("Name")[0].xml;
var _14fb=_14f8.getElementsByTagName("Email")[0].xml;
var _14fc=_14f8.getElementsByTagName("Version");
var _14fd=_14fc.length>0?_14fc[0].xml:"";
var _14fe=_14f8.getElementsByTagName("Expiration");
var _14ff=_14fe.length>0?_14fe[0].xml:"";
}else{
var _14fa=_14f8.getElementsByTagName("Name")[0].textContent;
var _14fb=_14f8.getElementsByTagName("Email")[0].textContent;
var _14fc=_14f8.getElementsByTagName("Version");
var _14fd=_14fc.length>0?_14fc[0].textContent:"";
var _14fe=_14f8.getElementsByTagName("Expiration");
var _14ff=_14fe.length>0?_14fe[0].textContent:"";
}
_this.license_name.innerHTML=_14fa;
_this.license_email.innerHTML=_14fb;
if(_14fd==""){
_this.license_version.innerHTML="All versions";
}else{
_this.license_version.innerHTML=_14fd;
}
if(_14ff==""){
_this.license_expiration.innerHTML="None";
}else{
_this.license_expiration.innerHTML=_14ff;
}
_this.enterprise_licensed.style.display="block";
return _14f8;
},error:function(){
console.debug("error from xhrGet");
}});
}else{
if(_14f6=="invalid"){
this.reason_needs_license.innerHTML="Invalid license key (may have expired).";
}else{
this.reason_needs_license.innerHTML="No license key found.";
}
this.enterprise_not_licensed.style.display="block";
}
}
}});
pion.about.doDialog=function(){
var _1500=new pion.about.LicenseKeyDialog();
_1500.show();
};
}
dojo.registerModulePath("pion","/scripts");
dojo.registerModulePath("plugins","/plugins");
var vocab_config_page_initialized=false;
var codec_config_page_initialized=false;
var database_config_page_initialized=false;
var user_config_page_initialized=false;
var system_config_page_initialized=false;
var file_protocol=false;
var firefox_on_mac;
pion.handleXhrError=function(_1501,_1502,_1503,_1504){
console.debug("In pion.handleXhrError: ioArgs.args = ",_1502.args);
if(_1502.xhr.status==401){
if(pion.login.login_pending){
var h=dojo.connect(pion.login,"onLoginSuccess",function(){
dojo.disconnect(h);
_1503(_1502.args);
});
}else{
if(!dojo.cookie("logged_in")){
location.replace("login.html");
}
pion.login.doLoginDialog(function(){
_1503(_1502.args);
});
}
return;
}else{
if(_1502.xhr.status==500){
var _1506=new dijit.Dialog({title:"Pion Server Error"});
_1506.setContent(_1501.responseText);
_1506.show();
}
if(_1504){
_1504();
}
}
return _1501;
};
pion.handleXhrGetError=function(_1507,_1508){
console.debug("In pion.handleXhrGetError: ioArgs.args = ",_1508.args);
return pion.handleXhrError(_1507,_1508,dojo.xhrGet);
};
pion.getXhrErrorHandler=function(_1509,_150a,_150b){
return function(_150c,_150d){
dojo.mixin(_150d.args,_150a);
return pion.handleXhrError(_150c,_150d,_1509,_150b);
};
};
pion.handleFetchError=function(_150e,_150f){
console.debug("In pion.handleFetchError: request = ",_150f,", errorData = "+_150e);
if(_150e.status==401){
if(pion.login.login_pending){
var h=dojo.connect(pion.login,"onLoginSuccess",function(){
dojo.disconnect(h);
_150f.store.fetch(_150f);
});
}else{
if(!dojo.cookie("logged_in")){
location.replace("login.html");
}
pion.login.doLoginDialog(function(){
_150f.store.fetch(_150f);
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
dojo.xhrGet({url:"/config",preventCache:true,handleAs:"xml",timeout:5000,load:function(_1511,_1512){
dojo.cookie("logged_in","true",{expires:1});
pion.terms.init();
pion.reactors.init();
},error:function(_1513,_1514){
if(_1514.xhr.status==401){
if(!dojo.cookie("logged_in")){
location.replace("login.html");
}
pion.login.doLoginDialog(function(){
pion.terms.init();
pion.reactors.init();
});
}else{
console.error("HTTP status code: ",_1514.xhr.status);
}
return _1513;
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
};
dojo.i18n._preloadLocalizations("dojo.nls.pion-dojo",["he","nl","tr","no","ko","el","en","en-gb","ROOT","zh-cn","hu","es","fi-fi","pt-br","fi","he-il","xx","ru","it","fr","cs","de-de","fr-fr","it-it","es-es","ja","da","pl","de","sv","pt","zh-tw","pt-pt","nl-nl","ko-kr","ar","en-us","zh","ja-jp"]);
