/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
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
var _19=0,_1a={};
var _1b=function(_1c,_1d){
var nso=_1d||_1a;
if(dojo.isIE){
var cn=_1c["__dojoNameCache"];
if(cn&&nso[cn]===_1c){
return cn;
}
}
var _20;
do{
_20="__"+_19++;
}while(_20 in nso);
nso[_20]=_1c;
return _20;
};
function _21(_22){
if(d.isString(_22)){
return "string";
}
if(typeof _22=="number"){
return "number";
}
if(typeof _22=="boolean"){
return "boolean";
}
if(d.isFunction(_22)){
return "function";
}
if(d.isArray(_22)){
return "array";
}
if(_22 instanceof Date){
return "date";
}
if(_22 instanceof d._Url){
return "url";
}
return "object";
};
function _23(_24,_25){
switch(_25){
case "string":
return _24;
case "number":
return _24.length?Number(_24):NaN;
case "boolean":
return typeof _24=="boolean"?_24:!(_24.toLowerCase()=="false");
case "function":
if(d.isFunction(_24)){
_24=_24.toString();
_24=d.trim(_24.substring(_24.indexOf("{")+1,_24.length-1));
}
try{
if(_24.search(/[^\w\.]+/i)!=-1){
_24=_1b(new Function(_24),this);
}
return d.getObject(_24,false);
}
catch(e){
return new Function();
}
case "array":
return _24?_24.split(/\s*,\s*/):[];
case "date":
switch(_24){
case "":
return new Date("");
case "now":
return new Date();
default:
return d.date.stamp.fromISOString(_24);
}
case "url":
return d.baseUrl+_24;
default:
return d.fromJson(_24);
}
};
var _26={};
function _27(_28){
if(!_26[_28]){
var cls=d.getObject(_28);
if(!d.isFunction(cls)){
throw new Error("Could not load class '"+_28+"'. Did you spell the name correctly and use a full path, like 'dijit.form.Button'?");
}
var _2a=cls.prototype;
var _2b={},_2c={};
for(var _2d in _2a){
if(_2d.charAt(0)=="_"){
continue;
}
if(_2d in _2c){
continue;
}
var _2e=_2a[_2d];
_2b[_2d]=_21(_2e);
}
_26[_28]={cls:cls,params:_2b};
}
return _26[_28];
};
this._functionFromScript=function(_2f){
var _30="";
var _31="";
var _32=_2f.getAttribute("args");
if(_32){
d.forEach(_32.split(/\s*,\s*/),function(_33,idx){
_30+="var "+_33+" = arguments["+idx+"]; ";
});
}
var _35=_2f.getAttribute("with");
if(_35&&_35.length){
d.forEach(_35.split(/\s*,\s*/),function(_36){
_30+="with("+_36+"){";
_31+="}";
});
}
return new Function(_30+_2f.innerHTML+_31);
};
this.instantiate=function(_37,_38){
var _39=[];
_38=_38||{};
d.forEach(_37,function(_3a){
if(!_3a){
return;
}
var _3b=_17 in _38?_38[_17]:_3a.getAttribute(_17);
if(!_3b||!_3b.length){
return;
}
var _3c=_27(_3b),_3d=_3c.cls,ps=_3d._noScript||_3d.prototype._noScript;
var _3f={},_40=_3a.attributes;
for(var _41 in _3c.params){
var _42=_41 in _38?{value:_38[_41],specified:true}:_40.getNamedItem(_41);
if(!_42||(!_42.specified&&(!dojo.isIE||_41.toLowerCase()!="value"))){
continue;
}
var _43=_42.value;
switch(_41){
case "class":
_43="className" in _38?_38.className:_3a.className;
break;
case "style":
_43="style" in _38?_38.style:(_3a.style&&_3a.style.cssText);
}
var _44=_3c.params[_41];
if(typeof _43=="string"){
_3f[_41]=_23(_43,_44);
}else{
_3f[_41]=_43;
}
}
if(!ps){
var _45=[],_46=[];
d.query("> script[type^='dojo/']",_3a).orphan().forEach(function(_47){
var _48=_47.getAttribute("event"),_3b=_47.getAttribute("type"),nf=d.parser._functionFromScript(_47);
if(_48){
if(_3b=="dojo/connect"){
_45.push({event:_48,func:nf});
}else{
_3f[_48]=nf;
}
}else{
_46.push(nf);
}
});
}
var _4a=_3d["markupFactory"];
if(!_4a&&_3d["prototype"]){
_4a=_3d.prototype["markupFactory"];
}
var _4b=_4a?_4a(_3f,_3a,_3d):new _3d(_3f,_3a);
_39.push(_4b);
var _4c=_3a.getAttribute("jsId");
if(_4c){
d.setObject(_4c,_4b);
}
if(!ps){
d.forEach(_45,function(_4d){
d.connect(_4b,_4d.event,null,_4d.func);
});
d.forEach(_46,function(_4e){
_4e.call(_4b);
});
}
});
d.forEach(_39,function(_4f){
if(_4f&&_4f.startup&&!_4f._started&&(!_4f.getParent||!_4f.getParent())){
_4f.startup();
}
});
return _39;
};
this.parse=function(_50){
var _51=d.query(qry,_50);
var _52=this.instantiate(_51);
return _52;
};
}();
(function(){
var _53=function(){
if(dojo.config["parseOnLoad"]==true){
dojo.parser.parse();
}
};
if(dojo.exists("dijit.wai.onload")&&(dijit.wai.onload===dojo._loaders[0])){
dojo._loaders.splice(1,0,_53);
}else{
dojo._loaders.unshift(_53);
}
})();
}
if(!dojo._hasResource["dojo.data.util.filter"]){
dojo._hasResource["dojo.data.util.filter"]=true;
dojo.provide("dojo.data.util.filter");
dojo.data.util.filter.patternToRegExp=function(_54,_55){
var rxp="^";
var c=null;
for(var i=0;i<_54.length;i++){
c=_54.charAt(i);
switch(c){
case "\\":
rxp+=c;
i++;
rxp+=_54.charAt(i);
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
if(_55){
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
dojo.data.util.sorter.createSortFunction=function(_5c,_5d){
var _5e=[];
function _5f(_60,dir){
return function(_62,_63){
var a=_5d.getValue(_62,_60);
var b=_5d.getValue(_63,_60);
var _66=null;
if(_5d.comparatorMap){
if(typeof _60!=="string"){
_60=_5d.getIdentity(_60);
}
_66=_5d.comparatorMap[_60]||dojo.data.util.sorter.basicComparator;
}
_66=_66||dojo.data.util.sorter.basicComparator;
return dir*_66(a,b);
};
};
var _67;
for(var i=0;i<_5c.length;i++){
_67=_5c[i];
if(_67.attribute){
var _69=(_67.descending)?-1:1;
_5e.push(_5f(_67.attribute,_69));
}
}
return function(_6a,_6b){
var i=0;
while(i<_5e.length){
var ret=_5e[i++](_6a,_6b);
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
dojo.data.util.simpleFetch.fetch=function(_6e){
_6e=_6e||{};
if(!_6e.store){
_6e.store=this;
}
var _6f=this;
var _70=function(_71,_72){
if(_72.onError){
var _73=_72.scope||dojo.global;
_72.onError.call(_73,_71,_72);
}
};
var _74=function(_75,_76){
var _77=_76.abort||null;
var _78=false;
var _79=_76.start?_76.start:0;
var _7a=(_76.count&&(_76.count!==Infinity))?(_79+_76.count):_75.length;
_76.abort=function(){
_78=true;
if(_77){
_77.call(_76);
}
};
var _7b=_76.scope||dojo.global;
if(!_76.store){
_76.store=_6f;
}
if(_76.onBegin){
_76.onBegin.call(_7b,_75.length,_76);
}
if(_76.sort){
_75.sort(dojo.data.util.sorter.createSortFunction(_76.sort,_6f));
}
if(_76.onItem){
for(var i=_79;(i<_75.length)&&(i<_7a);++i){
var _7d=_75[i];
if(!_78){
_76.onItem.call(_7b,_7d,_76);
}
}
}
if(_76.onComplete&&!_78){
var _7e=null;
if(!_76.onItem){
_7e=_75.slice(_79,_7a);
}
_76.onComplete.call(_7b,_7e,_76);
}
};
this._fetchItems(_6e,_74,_70);
return _6e;
};
}
if(!dojo._hasResource["dojo.data.ItemFileReadStore"]){
dojo._hasResource["dojo.data.ItemFileReadStore"]=true;
dojo.provide("dojo.data.ItemFileReadStore");
dojo.declare("dojo.data.ItemFileReadStore",null,{constructor:function(_7f){
this._arrayOfAllItems=[];
this._arrayOfTopLevelItems=[];
this._loadFinished=false;
this._jsonFileUrl=_7f.url;
this._jsonData=_7f.data;
this._datatypeMap=_7f.typeMap||{};
if(!this._datatypeMap["Date"]){
this._datatypeMap["Date"]={type:Date,deserialize:function(_80){
return dojo.date.stamp.fromISOString(_80);
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
if(_7f.urlPreventCache!==undefined){
this.urlPreventCache=_7f.urlPreventCache?true:false;
}
if(_7f.clearOnClose){
this.clearOnClose=true;
}
},url:"",data:null,typeMap:null,clearOnClose:false,urlPreventCache:false,_assertIsItem:function(_81){
if(!this.isItem(_81)){
throw new Error("dojo.data.ItemFileReadStore: Invalid item argument.");
}
},_assertIsAttribute:function(_82){
if(typeof _82!=="string"){
throw new Error("dojo.data.ItemFileReadStore: Invalid attribute argument.");
}
},getValue:function(_83,_84,_85){
var _86=this.getValues(_83,_84);
return (_86.length>0)?_86[0]:_85;
},getValues:function(_87,_88){
this._assertIsItem(_87);
this._assertIsAttribute(_88);
return _87[_88]||[];
},getAttributes:function(_89){
this._assertIsItem(_89);
var _8a=[];
for(var key in _89){
if((key!==this._storeRefPropName)&&(key!==this._itemNumPropName)&&(key!==this._rootItemPropName)&&(key!==this._reverseRefMap)){
_8a.push(key);
}
}
return _8a;
},hasAttribute:function(_8c,_8d){
return this.getValues(_8c,_8d).length>0;
},containsValue:function(_8e,_8f,_90){
var _91=undefined;
if(typeof _90==="string"){
_91=dojo.data.util.filter.patternToRegExp(_90,false);
}
return this._containsValue(_8e,_8f,_90,_91);
},_containsValue:function(_92,_93,_94,_95){
return dojo.some(this.getValues(_92,_93),function(_96){
if(_96!==null&&!dojo.isObject(_96)&&_95){
if(_96.toString().match(_95)){
return true;
}
}else{
if(_94===_96){
return true;
}
}
});
},isItem:function(_97){
if(_97&&_97[this._storeRefPropName]===this){
if(this._arrayOfAllItems[_97[this._itemNumPropName]]===_97){
return true;
}
}
return false;
},isItemLoaded:function(_98){
return this.isItem(_98);
},loadItem:function(_99){
this._assertIsItem(_99.item);
},getFeatures:function(){
return this._features;
},getLabel:function(_9a){
if(this._labelAttr&&this.isItem(_9a)){
return this.getValue(_9a,this._labelAttr);
}
return undefined;
},getLabelAttributes:function(_9b){
if(this._labelAttr){
return [this._labelAttr];
}
return null;
},_fetchItems:function(_9c,_9d,_9e){
var _9f=this;
var _a0=function(_a1,_a2){
var _a3=[];
var i,key;
if(_a1.query){
var _a6;
var _a7=_a1.queryOptions?_a1.queryOptions.ignoreCase:false;
var _a8={};
for(key in _a1.query){
_a6=_a1.query[key];
if(typeof _a6==="string"){
_a8[key]=dojo.data.util.filter.patternToRegExp(_a6,_a7);
}
}
for(i=0;i<_a2.length;++i){
var _a9=true;
var _aa=_a2[i];
if(_aa===null){
_a9=false;
}else{
for(key in _a1.query){
_a6=_a1.query[key];
if(!_9f._containsValue(_aa,key,_a6,_a8[key])){
_a9=false;
}
}
}
if(_a9){
_a3.push(_aa);
}
}
_9d(_a3,_a1);
}else{
for(i=0;i<_a2.length;++i){
var _ab=_a2[i];
if(_ab!==null){
_a3.push(_ab);
}
}
_9d(_a3,_a1);
}
};
if(this._loadFinished){
_a0(_9c,this._getItemsArray(_9c.queryOptions));
}else{
if(this._jsonFileUrl){
if(this._loadInProgress){
this._queuedFetches.push({args:_9c,filter:_a0});
}else{
this._loadInProgress=true;
var _ac={url:_9f._jsonFileUrl,handleAs:"json-comment-optional",preventCache:this.urlPreventCache};
var _ad=dojo.xhrGet(_ac);
_ad.addCallback(function(_ae){
try{
_9f._getItemsFromLoadedData(_ae);
_9f._loadFinished=true;
_9f._loadInProgress=false;
_a0(_9c,_9f._getItemsArray(_9c.queryOptions));
_9f._handleQueuedFetches();
}
catch(e){
_9f._loadFinished=true;
_9f._loadInProgress=false;
_9e(e,_9c);
}
});
_ad.addErrback(function(_af){
_9f._loadInProgress=false;
_9e(_af,_9c);
});
var _b0=null;
if(_9c.abort){
_b0=_9c.abort;
}
_9c.abort=function(){
var df=_ad;
if(df&&df.fired===-1){
df.cancel();
df=null;
}
if(_b0){
_b0.call(_9c);
}
};
}
}else{
if(this._jsonData){
try{
this._loadFinished=true;
this._getItemsFromLoadedData(this._jsonData);
this._jsonData=null;
_a0(_9c,this._getItemsArray(_9c.queryOptions));
}
catch(e){
_9e(e,_9c);
}
}else{
_9e(new Error("dojo.data.ItemFileReadStore: No JSON source data was provided as either URL or a nested Javascript object."),_9c);
}
}
}
},_handleQueuedFetches:function(){
if(this._queuedFetches.length>0){
for(var i=0;i<this._queuedFetches.length;i++){
var _b3=this._queuedFetches[i];
var _b4=_b3.args;
var _b5=_b3.filter;
if(_b5){
_b5(_b4,this._getItemsArray(_b4.queryOptions));
}else{
this.fetchItemByIdentity(_b4);
}
}
this._queuedFetches=[];
}
},_getItemsArray:function(_b6){
if(_b6&&_b6.deep){
return this._arrayOfAllItems;
}
return this._arrayOfTopLevelItems;
},close:function(_b7){
if(this.clearOnClose&&(this._jsonFileUrl!=="")){
this._arrayOfAllItems=[];
this._arrayOfTopLevelItems=[];
this._loadFinished=false;
this._itemsByIdentity=null;
this._loadInProgress=false;
this._queuedFetches=[];
}
},_getItemsFromLoadedData:function(_b8){
var _b9=false;
function _ba(_bb){
var _bc=((_bb!==null)&&(typeof _bb==="object")&&(!dojo.isArray(_bb)||_b9)&&(!dojo.isFunction(_bb))&&(_bb.constructor==Object||dojo.isArray(_bb))&&(typeof _bb._reference==="undefined")&&(typeof _bb._type==="undefined")&&(typeof _bb._value==="undefined"));
return _bc;
};
var _bd=this;
function _be(_bf){
_bd._arrayOfAllItems.push(_bf);
for(var _c0 in _bf){
var _c1=_bf[_c0];
if(_c1){
if(dojo.isArray(_c1)){
var _c2=_c1;
for(var k=0;k<_c2.length;++k){
var _c4=_c2[k];
if(_ba(_c4)){
_be(_c4);
}
}
}else{
if(_ba(_c1)){
_be(_c1);
}
}
}
}
};
this._labelAttr=_b8.label;
var i;
var _c6;
this._arrayOfAllItems=[];
this._arrayOfTopLevelItems=_b8.items;
for(i=0;i<this._arrayOfTopLevelItems.length;++i){
_c6=this._arrayOfTopLevelItems[i];
if(dojo.isArray(_c6)){
_b9=true;
}
_be(_c6);
_c6[this._rootItemPropName]=true;
}
var _c7={};
var key;
for(i=0;i<this._arrayOfAllItems.length;++i){
_c6=this._arrayOfAllItems[i];
for(key in _c6){
if(key!==this._rootItemPropName){
var _c9=_c6[key];
if(_c9!==null){
if(!dojo.isArray(_c9)){
_c6[key]=[_c9];
}
}else{
_c6[key]=[null];
}
}
_c7[key]=key;
}
}
while(_c7[this._storeRefPropName]){
this._storeRefPropName+="_";
}
while(_c7[this._itemNumPropName]){
this._itemNumPropName+="_";
}
while(_c7[this._reverseRefMap]){
this._reverseRefMap+="_";
}
var _ca;
var _cb=_b8.identifier;
if(_cb){
this._itemsByIdentity={};
this._features["dojo.data.api.Identity"]=_cb;
for(i=0;i<this._arrayOfAllItems.length;++i){
_c6=this._arrayOfAllItems[i];
_ca=_c6[_cb];
var _cc=_ca[0];
if(!this._itemsByIdentity[_cc]){
this._itemsByIdentity[_cc]=_c6;
}else{
if(this._jsonFileUrl){
throw new Error("dojo.data.ItemFileReadStore:  The json data as specified by: ["+this._jsonFileUrl+"] is malformed.  Items within the list have identifier: ["+_cb+"].  Value collided: ["+_cc+"]");
}else{
if(this._jsonData){
throw new Error("dojo.data.ItemFileReadStore:  The json data provided by the creation arguments is malformed.  Items within the list have identifier: ["+_cb+"].  Value collided: ["+_cc+"]");
}
}
}
}
}else{
this._features["dojo.data.api.Identity"]=Number;
}
for(i=0;i<this._arrayOfAllItems.length;++i){
_c6=this._arrayOfAllItems[i];
_c6[this._storeRefPropName]=this;
_c6[this._itemNumPropName]=i;
}
for(i=0;i<this._arrayOfAllItems.length;++i){
_c6=this._arrayOfAllItems[i];
for(key in _c6){
_ca=_c6[key];
for(var j=0;j<_ca.length;++j){
_c9=_ca[j];
if(_c9!==null&&typeof _c9=="object"){
if(_c9._type&&_c9._value){
var _ce=_c9._type;
var _cf=this._datatypeMap[_ce];
if(!_cf){
throw new Error("dojo.data.ItemFileReadStore: in the typeMap constructor arg, no object class was specified for the datatype '"+_ce+"'");
}else{
if(dojo.isFunction(_cf)){
_ca[j]=new _cf(_c9._value);
}else{
if(dojo.isFunction(_cf.deserialize)){
_ca[j]=_cf.deserialize(_c9._value);
}else{
throw new Error("dojo.data.ItemFileReadStore: Value provided in typeMap was neither a constructor, nor a an object with a deserialize function");
}
}
}
}
if(_c9._reference){
var _d0=_c9._reference;
if(!dojo.isObject(_d0)){
_ca[j]=this._itemsByIdentity[_d0];
}else{
for(var k=0;k<this._arrayOfAllItems.length;++k){
var _d2=this._arrayOfAllItems[k];
var _d3=true;
for(var _d4 in _d0){
if(_d2[_d4]!=_d0[_d4]){
_d3=false;
}
}
if(_d3){
_ca[j]=_d2;
}
}
}
if(this.referenceIntegrity){
var _d5=_ca[j];
if(this.isItem(_d5)){
this._addReferenceToMap(_d5,_c6,key);
}
}
}else{
if(this.isItem(_c9)){
if(this.referenceIntegrity){
this._addReferenceToMap(_c9,_c6,key);
}
}
}
}
}
}
}
},_addReferenceToMap:function(_d6,_d7,_d8){
},getIdentity:function(_d9){
var _da=this._features["dojo.data.api.Identity"];
if(_da===Number){
return _d9[this._itemNumPropName];
}else{
var _db=_d9[_da];
if(_db){
return _db[0];
}
}
return null;
},fetchItemByIdentity:function(_dc){
var _dd;
var _de;
if(!this._loadFinished){
var _df=this;
if(this._jsonFileUrl){
if(this._loadInProgress){
this._queuedFetches.push({args:_dc});
}else{
this._loadInProgress=true;
var _e0={url:_df._jsonFileUrl,handleAs:"json-comment-optional",preventCache:this.urlPreventCache};
var _e1=dojo.xhrGet(_e0);
_e1.addCallback(function(_e2){
var _e3=_dc.scope?_dc.scope:dojo.global;
try{
_df._getItemsFromLoadedData(_e2);
_df._loadFinished=true;
_df._loadInProgress=false;
_dd=_df._getItemByIdentity(_dc.identity);
if(_dc.onItem){
_dc.onItem.call(_e3,_dd);
}
_df._handleQueuedFetches();
}
catch(error){
_df._loadInProgress=false;
if(_dc.onError){
_dc.onError.call(_e3,error);
}
}
});
_e1.addErrback(function(_e4){
_df._loadInProgress=false;
if(_dc.onError){
var _e5=_dc.scope?_dc.scope:dojo.global;
_dc.onError.call(_e5,_e4);
}
});
}
}else{
if(this._jsonData){
_df._getItemsFromLoadedData(_df._jsonData);
_df._jsonData=null;
_df._loadFinished=true;
_dd=_df._getItemByIdentity(_dc.identity);
if(_dc.onItem){
_de=_dc.scope?_dc.scope:dojo.global;
_dc.onItem.call(_de,_dd);
}
}
}
}else{
_dd=this._getItemByIdentity(_dc.identity);
if(_dc.onItem){
_de=_dc.scope?_dc.scope:dojo.global;
_dc.onItem.call(_de,_dd);
}
}
},_getItemByIdentity:function(_e6){
var _e7=null;
if(this._itemsByIdentity){
_e7=this._itemsByIdentity[_e6];
}else{
_e7=this._arrayOfAllItems[_e6];
}
if(_e7===undefined){
_e7=null;
}
return _e7;
},getIdentityAttributes:function(_e8){
var _e9=this._features["dojo.data.api.Identity"];
if(_e9===Number){
return null;
}else{
return [_e9];
}
},_forceLoad:function(){
var _ea=this;
if(this._jsonFileUrl){
var _eb={url:_ea._jsonFileUrl,handleAs:"json-comment-optional",preventCache:this.urlPreventCache,sync:true};
var _ec=dojo.xhrGet(_eb);
_ec.addCallback(function(_ed){
try{
if(_ea._loadInProgress!==true&&!_ea._loadFinished){
_ea._getItemsFromLoadedData(_ed);
_ea._loadFinished=true;
}else{
if(_ea._loadInProgress){
throw new Error("dojo.data.ItemFileReadStore:  Unable to perform a synchronous load, an async load is in progress.");
}
}
}
catch(e){
console.log(e);
throw e;
}
});
_ec.addErrback(function(_ee){
throw _ee;
});
}else{
if(this._jsonData){
_ea._getItemsFromLoadedData(_ea._jsonData);
_ea._jsonData=null;
_ea._loadFinished=true;
}
}
}});
dojo.extend(dojo.data.ItemFileReadStore,dojo.data.util.simpleFetch);
}
if(!dojo._hasResource["dojo.data.ItemFileWriteStore"]){
dojo._hasResource["dojo.data.ItemFileWriteStore"]=true;
dojo.provide("dojo.data.ItemFileWriteStore");
dojo.declare("dojo.data.ItemFileWriteStore",dojo.data.ItemFileReadStore,{constructor:function(_ef){
this._features["dojo.data.api.Write"]=true;
this._features["dojo.data.api.Notification"]=true;
this._pending={_newItems:{},_modifiedItems:{},_deletedItems:{}};
if(!this._datatypeMap["Date"].serialize){
this._datatypeMap["Date"].serialize=function(obj){
return dojo.date.stamp.toISOString(obj,{zulu:true});
};
}
if(_ef&&(_ef.referenceIntegrity===false)){
this.referenceIntegrity=false;
}
this._saveInProgress=false;
},referenceIntegrity:true,_assert:function(_f1){
if(!_f1){
throw new Error("assertion failed in ItemFileWriteStore");
}
},_getIdentifierAttribute:function(){
var _f2=this.getFeatures()["dojo.data.api.Identity"];
return _f2;
},newItem:function(_f3,_f4){
this._assert(!this._saveInProgress);
if(!this._loadFinished){
this._forceLoad();
}
if(typeof _f3!="object"&&typeof _f3!="undefined"){
throw new Error("newItem() was passed something other than an object");
}
var _f5=null;
var _f6=this._getIdentifierAttribute();
if(_f6===Number){
_f5=this._arrayOfAllItems.length;
}else{
_f5=_f3[_f6];
if(typeof _f5==="undefined"){
throw new Error("newItem() was not passed an identity for the new item");
}
if(dojo.isArray(_f5)){
throw new Error("newItem() was not passed an single-valued identity");
}
}
if(this._itemsByIdentity){
this._assert(typeof this._itemsByIdentity[_f5]==="undefined");
}
this._assert(typeof this._pending._newItems[_f5]==="undefined");
this._assert(typeof this._pending._deletedItems[_f5]==="undefined");
var _f7={};
_f7[this._storeRefPropName]=this;
_f7[this._itemNumPropName]=this._arrayOfAllItems.length;
if(this._itemsByIdentity){
this._itemsByIdentity[_f5]=_f7;
_f7[_f6]=[_f5];
}
this._arrayOfAllItems.push(_f7);
var _f8=null;
if(_f4&&_f4.parent&&_f4.attribute){
_f8={item:_f4.parent,attribute:_f4.attribute,oldValue:undefined};
var _f9=this.getValues(_f4.parent,_f4.attribute);
if(_f9&&_f9.length>0){
var _fa=_f9.slice(0,_f9.length);
if(_f9.length===1){
_f8.oldValue=_f9[0];
}else{
_f8.oldValue=_f9.slice(0,_f9.length);
}
_fa.push(_f7);
this._setValueOrValues(_f4.parent,_f4.attribute,_fa,false);
_f8.newValue=this.getValues(_f4.parent,_f4.attribute);
}else{
this._setValueOrValues(_f4.parent,_f4.attribute,_f7,false);
_f8.newValue=_f7;
}
}else{
_f7[this._rootItemPropName]=true;
this._arrayOfTopLevelItems.push(_f7);
}
this._pending._newItems[_f5]=_f7;
for(var key in _f3){
if(key===this._storeRefPropName||key===this._itemNumPropName){
throw new Error("encountered bug in ItemFileWriteStore.newItem");
}
var _fc=_f3[key];
if(!dojo.isArray(_fc)){
_fc=[_fc];
}
_f7[key]=_fc;
if(this.referenceIntegrity){
for(var i=0;i<_fc.length;i++){
var val=_fc[i];
if(this.isItem(val)){
this._addReferenceToMap(val,_f7,key);
}
}
}
}
this.onNew(_f7,_f8);
return _f7;
},_removeArrayElement:function(_ff,_100){
var _101=dojo.indexOf(_ff,_100);
if(_101!=-1){
_ff.splice(_101,1);
return true;
}
return false;
},deleteItem:function(item){
this._assert(!this._saveInProgress);
this._assertIsItem(item);
var _103=item[this._itemNumPropName];
var _104=this.getIdentity(item);
if(this.referenceIntegrity){
var _105=this.getAttributes(item);
if(item[this._reverseRefMap]){
item["backup_"+this._reverseRefMap]=dojo.clone(item[this._reverseRefMap]);
}
dojo.forEach(_105,function(_106){
dojo.forEach(this.getValues(item,_106),function(_107){
if(this.isItem(_107)){
if(!item["backupRefs_"+this._reverseRefMap]){
item["backupRefs_"+this._reverseRefMap]=[];
}
item["backupRefs_"+this._reverseRefMap].push({id:this.getIdentity(_107),attr:_106});
this._removeReferenceFromMap(_107,item,_106);
}
},this);
},this);
var _108=item[this._reverseRefMap];
if(_108){
for(var _109 in _108){
var _10a=null;
if(this._itemsByIdentity){
_10a=this._itemsByIdentity[_109];
}else{
_10a=this._arrayOfAllItems[_109];
}
if(_10a){
for(var _10b in _108[_109]){
var _10c=this.getValues(_10a,_10b)||[];
var _10d=dojo.filter(_10c,function(_10e){
return !(this.isItem(_10e)&&this.getIdentity(_10e)==_104);
},this);
this._removeReferenceFromMap(item,_10a,_10b);
if(_10d.length<_10c.length){
this._setValueOrValues(_10a,_10b,_10d,true);
}
}
}
}
}
}
this._arrayOfAllItems[_103]=null;
item[this._storeRefPropName]=null;
if(this._itemsByIdentity){
delete this._itemsByIdentity[_104];
}
this._pending._deletedItems[_104]=item;
if(item[this._rootItemPropName]){
this._removeArrayElement(this._arrayOfTopLevelItems,item);
}
this.onDelete(item);
return true;
},setValue:function(item,_110,_111){
return this._setValueOrValues(item,_110,_111,true);
},setValues:function(item,_113,_114){
return this._setValueOrValues(item,_113,_114,true);
},unsetAttribute:function(item,_116){
return this._setValueOrValues(item,_116,[],true);
},_setValueOrValues:function(item,_118,_119,_11a){
this._assert(!this._saveInProgress);
this._assertIsItem(item);
this._assert(dojo.isString(_118));
this._assert(typeof _119!=="undefined");
var _11b=this._getIdentifierAttribute();
if(_118==_11b){
throw new Error("ItemFileWriteStore does not have support for changing the value of an item's identifier.");
}
var _11c=this._getValueOrValues(item,_118);
var _11d=this.getIdentity(item);
if(!this._pending._modifiedItems[_11d]){
var _11e={};
for(var key in item){
if((key===this._storeRefPropName)||(key===this._itemNumPropName)||(key===this._rootItemPropName)){
_11e[key]=item[key];
}else{
if(key===this._reverseRefMap){
_11e[key]=dojo.clone(item[key]);
}else{
_11e[key]=item[key].slice(0,item[key].length);
}
}
}
this._pending._modifiedItems[_11d]=_11e;
}
var _120=false;
if(dojo.isArray(_119)&&_119.length===0){
_120=delete item[_118];
_119=undefined;
if(this.referenceIntegrity&&_11c){
var _121=_11c;
if(!dojo.isArray(_121)){
_121=[_121];
}
for(var i=0;i<_121.length;i++){
var _123=_121[i];
if(this.isItem(_123)){
this._removeReferenceFromMap(_123,item,_118);
}
}
}
}else{
var _124;
if(dojo.isArray(_119)){
var _125=_119;
_124=_119.slice(0,_119.length);
}else{
_124=[_119];
}
if(this.referenceIntegrity){
if(_11c){
var _121=_11c;
if(!dojo.isArray(_121)){
_121=[_121];
}
var map={};
dojo.forEach(_121,function(_127){
if(this.isItem(_127)){
var id=this.getIdentity(_127);
map[id.toString()]=true;
}
},this);
dojo.forEach(_124,function(_129){
if(this.isItem(_129)){
var id=this.getIdentity(_129);
if(map[id.toString()]){
delete map[id.toString()];
}else{
this._addReferenceToMap(_129,item,_118);
}
}
},this);
for(var rId in map){
var _12c;
if(this._itemsByIdentity){
_12c=this._itemsByIdentity[rId];
}else{
_12c=this._arrayOfAllItems[rId];
}
this._removeReferenceFromMap(_12c,item,_118);
}
}else{
for(var i=0;i<_124.length;i++){
var _123=_124[i];
if(this.isItem(_123)){
this._addReferenceToMap(_123,item,_118);
}
}
}
}
item[_118]=_124;
_120=true;
}
if(_11a){
this.onSet(item,_118,_11c,_119);
}
return _120;
},_addReferenceToMap:function(_12d,_12e,_12f){
var _130=this.getIdentity(_12e);
var _131=_12d[this._reverseRefMap];
if(!_131){
_131=_12d[this._reverseRefMap]={};
}
var _132=_131[_130];
if(!_132){
_132=_131[_130]={};
}
_132[_12f]=true;
},_removeReferenceFromMap:function(_133,_134,_135){
var _136=this.getIdentity(_134);
var _137=_133[this._reverseRefMap];
var _138;
if(_137){
for(_138 in _137){
if(_138==_136){
delete _137[_138][_135];
if(this._isEmpty(_137[_138])){
delete _137[_138];
}
}
}
if(this._isEmpty(_137)){
delete _133[this._reverseRefMap];
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
},_getValueOrValues:function(item,_13c){
var _13d=undefined;
if(this.hasAttribute(item,_13c)){
var _13e=this.getValues(item,_13c);
if(_13e.length==1){
_13d=_13e[0];
}else{
_13d=_13e;
}
}
return _13d;
},_flatten:function(_13f){
if(this.isItem(_13f)){
var item=_13f;
var _141=this.getIdentity(item);
var _142={_reference:_141};
return _142;
}else{
if(typeof _13f==="object"){
for(var type in this._datatypeMap){
var _144=this._datatypeMap[type];
if(dojo.isObject(_144)&&!dojo.isFunction(_144)){
if(_13f instanceof _144.type){
if(!_144.serialize){
throw new Error("ItemFileWriteStore:  No serializer defined for type mapping: ["+type+"]");
}
return {_type:type,_value:_144.serialize(_13f)};
}
}else{
if(_13f instanceof _144){
return {_type:type,_value:_13f.toString()};
}
}
}
}
return _13f;
}
},_getNewFileContentString:function(){
var _145={};
var _146=this._getIdentifierAttribute();
if(_146!==Number){
_145.identifier=_146;
}
if(this._labelAttr){
_145.label=this._labelAttr;
}
_145.items=[];
for(var i=0;i<this._arrayOfAllItems.length;++i){
var item=this._arrayOfAllItems[i];
if(item!==null){
var _149={};
for(var key in item){
if(key!==this._storeRefPropName&&key!==this._itemNumPropName&&key!==this._reverseRefMap&&key!==this._rootItemPropName){
var _14b=key;
var _14c=this.getValues(item,_14b);
if(_14c.length==1){
_149[_14b]=this._flatten(_14c[0]);
}else{
var _14d=[];
for(var j=0;j<_14c.length;++j){
_14d.push(this._flatten(_14c[j]));
_149[_14b]=_14d;
}
}
}
}
_145.items.push(_149);
}
}
var _14f=true;
return dojo.toJson(_145,_14f);
},_isEmpty:function(_150){
var _151=true;
if(dojo.isObject(_150)){
var i;
for(i in _150){
_151=false;
break;
}
}else{
if(dojo.isArray(_150)){
if(_150.length>0){
_151=false;
}
}
}
return _151;
},save:function(_153){
this._assert(!this._saveInProgress);
this._saveInProgress=true;
var self=this;
var _155=function(){
self._pending={_newItems:{},_modifiedItems:{},_deletedItems:{}};
self._saveInProgress=false;
if(_153&&_153.onComplete){
var _156=_153.scope||dojo.global;
_153.onComplete.call(_156);
}
};
var _157=function(err){
self._saveInProgress=false;
if(_153&&_153.onError){
var _159=_153.scope||dojo.global;
_153.onError.call(_159,err);
}
};
if(this._saveEverything){
var _15a=this._getNewFileContentString();
this._saveEverything(_155,_157,_15a);
}
if(this._saveCustom){
this._saveCustom(_155,_157);
}
if(!this._saveEverything&&!this._saveCustom){
_155();
}
},revert:function(){
this._assert(!this._saveInProgress);
var _15b;
for(_15b in this._pending._modifiedItems){
var _15c=this._pending._modifiedItems[_15b];
var _15d=null;
if(this._itemsByIdentity){
_15d=this._itemsByIdentity[_15b];
}else{
_15d=this._arrayOfAllItems[_15b];
}
_15c[this._storeRefPropName]=this;
_15d[this._storeRefPropName]=null;
var _15e=_15d[this._itemNumPropName];
this._arrayOfAllItems[_15e]=_15c;
if(_15d[this._rootItemPropName]){
var i;
for(i=0;i<this._arrayOfTopLevelItems.length;i++){
var _160=this._arrayOfTopLevelItems[i];
if(this.getIdentity(_160)==_15b){
this._arrayOfTopLevelItems[i]=_15c;
break;
}
}
}
if(this._itemsByIdentity){
this._itemsByIdentity[_15b]=_15c;
}
}
var _161;
for(_15b in this._pending._deletedItems){
_161=this._pending._deletedItems[_15b];
_161[this._storeRefPropName]=this;
var _162=_161[this._itemNumPropName];
if(_161["backup_"+this._reverseRefMap]){
_161[this._reverseRefMap]=_161["backup_"+this._reverseRefMap];
delete _161["backup_"+this._reverseRefMap];
}
this._arrayOfAllItems[_162]=_161;
if(this._itemsByIdentity){
this._itemsByIdentity[_15b]=_161;
}
if(_161[this._rootItemPropName]){
this._arrayOfTopLevelItems.push(_161);
}
}
for(_15b in this._pending._deletedItems){
_161=this._pending._deletedItems[_15b];
if(_161["backupRefs_"+this._reverseRefMap]){
dojo.forEach(_161["backupRefs_"+this._reverseRefMap],function(_163){
var _164;
if(this._itemsByIdentity){
_164=this._itemsByIdentity[_163.id];
}else{
_164=this._arrayOfAllItems[_163.id];
}
this._addReferenceToMap(_164,_161,_163.attr);
},this);
delete _161["backupRefs_"+this._reverseRefMap];
}
}
for(_15b in this._pending._newItems){
var _165=this._pending._newItems[_15b];
_165[this._storeRefPropName]=null;
this._arrayOfAllItems[_165[this._itemNumPropName]]=null;
if(_165[this._rootItemPropName]){
this._removeArrayElement(this._arrayOfTopLevelItems,_165);
}
if(this._itemsByIdentity){
delete this._itemsByIdentity[_15b];
}
}
this._pending={_newItems:{},_modifiedItems:{},_deletedItems:{}};
return true;
},isDirty:function(item){
if(item){
var _167=this.getIdentity(item);
return new Boolean(this._pending._newItems[_167]||this._pending._modifiedItems[_167]||this._pending._deletedItems[_167]).valueOf();
}else{
if(!this._isEmpty(this._pending._newItems)||!this._isEmpty(this._pending._modifiedItems)||!this._isEmpty(this._pending._deletedItems)){
return true;
}
return false;
}
},onSet:function(item,_169,_16a,_16b){
},onNew:function(_16c,_16d){
},onDelete:function(_16e){
},close:function(_16f){
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
dojo.dnd._lmb=dojo.isIE?1:0;
dojo.dnd._isLmbPressed=dojo.isIE?function(e){
return e.button&1;
}:function(e){
return e.button===0;
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
if(dojo.isWebKit||dojo.isOpera){
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
var _189=n.scrollLeft,_18a=n.scrollTop;
n.scrollLeft=n.scrollLeft+dx;
n.scrollTop=n.scrollTop+dy;
if(_189!=n.scrollLeft||_18a!=n.scrollTop){
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
var h=this.host=host,d=node.ownerDocument,_190=dojo.connect(d,"onmousemove",this,"onFirstMove");
this.events=[dojo.connect(d,"onmousemove",this,"onMouseMove"),dojo.connect(d,"onmouseup",this,"onMouseUp"),dojo.connect(d,"ondragstart",dojo.stopEvent),dojo.connect(d.body,"onselectstart",dojo.stopEvent),_190];
if(h&&h.onMoveStart){
h.onMoveStart(this);
}
},onMouseMove:function(e){
dojo.dnd.autoScroll(e);
var m=this.marginBox;
this.host.onMove(this,{l:m.l+e.pageX,t:m.t+e.pageY});
dojo.stopEvent(e);
},onMouseUp:function(e){
if(dojo.isWebKit&&dojo.dnd._isMac&&this.mouseButton==2?e.button==0:this.mouseButton==e.button){
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
dojo.declare("dojo.dnd.Moveable",null,{handle:"",delay:0,skip:false,constructor:function(node,_19f){
this.node=dojo.byId(node);
if(!_19f){
_19f={};
}
this.handle=_19f.handle?dojo.byId(_19f.handle):null;
if(!this.handle){
this.handle=this.node;
}
this.delay=_19f.delay>0?_19f.delay:0;
this.skip=_19f.skip;
this.mover=_19f.mover?_19f.mover:dojo.dnd.Mover;
this.events=[dojo.connect(this.handle,"onmousedown",this,"onMouseDown"),dojo.connect(this.handle,"ondragstart",this,"onSelectStart"),dojo.connect(this.handle,"onselectstart",this,"onSelectStart")];
},markupFactory:function(_1a0,node){
return new dojo.dnd.Moveable(node,_1a0);
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
},onMoveStart:function(_1a8){
dojo.publish("/dnd/move/start",[_1a8]);
dojo.addClass(dojo.body(),"dojoMove");
dojo.addClass(this.node,"dojoMoveItem");
},onMoveStop:function(_1a9){
dojo.publish("/dnd/move/stop",[_1a9]);
dojo.removeClass(dojo.body(),"dojoMove");
dojo.removeClass(this.node,"dojoMoveItem");
},onFirstMove:function(_1aa){
},onMove:function(_1ab,_1ac){
this.onMoving(_1ab,_1ac);
var s=_1ab.node.style;
s.left=_1ac.l+"px";
s.top=_1ac.t+"px";
this.onMoved(_1ab,_1ac);
},onMoving:function(_1ae,_1af){
},onMoved:function(_1b0,_1b1){
}});
}
if(!dojo._hasResource["dojo.dnd.move"]){
dojo._hasResource["dojo.dnd.move"]=true;
dojo.provide("dojo.dnd.move");
dojo.declare("dojo.dnd.move.constrainedMoveable",dojo.dnd.Moveable,{constraints:function(){
},within:false,markupFactory:function(_1b2,node){
return new dojo.dnd.move.constrainedMoveable(node,_1b2);
},constructor:function(node,_1b5){
if(!_1b5){
_1b5={};
}
this.constraints=_1b5.constraints;
this.within=_1b5.within;
},onFirstMove:function(_1b6){
var c=this.constraintBox=this.constraints.call(this,_1b6);
c.r=c.l+c.w;
c.b=c.t+c.h;
if(this.within){
var mb=dojo.marginBox(_1b6.node);
c.r-=mb.w;
c.b-=mb.h;
}
},onMove:function(_1b9,_1ba){
var c=this.constraintBox,s=_1b9.node.style;
s.left=(_1ba.l<c.l?c.l:c.r<_1ba.l?c.r:_1ba.l)+"px";
s.top=(_1ba.t<c.t?c.t:c.b<_1ba.t?c.b:_1ba.t)+"px";
}});
dojo.declare("dojo.dnd.move.boxConstrainedMoveable",dojo.dnd.move.constrainedMoveable,{box:{},markupFactory:function(_1bd,node){
return new dojo.dnd.move.boxConstrainedMoveable(node,_1bd);
},constructor:function(node,_1c0){
var box=_1c0&&_1c0.box;
this.constraints=function(){
return box;
};
}});
dojo.declare("dojo.dnd.move.parentConstrainedMoveable",dojo.dnd.move.constrainedMoveable,{area:"content",markupFactory:function(_1c2,node){
return new dojo.dnd.move.parentConstrainedMoveable(node,_1c2);
},constructor:function(node,_1c5){
var area=_1c5&&_1c5.area;
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
dojo.dnd.move.constrainedMover=function(fun,_1cc){
dojo.deprecated("dojo.dnd.move.constrainedMover, use dojo.dnd.move.constrainedMoveable instead");
var _1cd=function(node,e,_1d0){
dojo.dnd.Mover.call(this,node,e,_1d0);
};
dojo.extend(_1cd,dojo.dnd.Mover.prototype);
dojo.extend(_1cd,{onMouseMove:function(e){
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
if(_1cc){
var mb=dojo.marginBox(this.node);
c.r-=mb.w;
c.b-=mb.h;
}
}});
return _1cd;
};
dojo.dnd.move.boxConstrainedMover=function(box,_1d9){
dojo.deprecated("dojo.dnd.move.boxConstrainedMover, use dojo.dnd.move.boxConstrainedMoveable instead");
return dojo.dnd.move.constrainedMover(function(){
return box;
},_1d9);
};
dojo.dnd.move.parentConstrainedMover=function(area,_1db){
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
return dojo.dnd.move.constrainedMover(fun,_1db);
};
dojo.dnd.constrainedMover=dojo.dnd.move.constrainedMover;
dojo.dnd.boxConstrainedMover=dojo.dnd.move.boxConstrainedMover;
dojo.dnd.parentConstrainedMover=dojo.dnd.move.parentConstrainedMover;
}
if(!dojo._hasResource["dojo.dnd.Container"]){
dojo._hasResource["dojo.dnd.Container"]=true;
dojo.provide("dojo.dnd.Container");
dojo.declare("dojo.dnd.Container",null,{skipForm:false,constructor:function(node,_1e2){
this.node=dojo.byId(node);
if(!_1e2){
_1e2={};
}
this.creator=_1e2.creator||null;
this.skipForm=_1e2.skipForm;
this.parent=_1e2.dropParent&&dojo.byId(_1e2.dropParent);
this.map={};
this.current=null;
this.containerState="";
dojo.addClass(this.node,"dojoDndContainer");
if(!(_1e2&&_1e2._skipStartup)){
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
},insertNodes:function(data,_1f2,_1f3){
if(!this.parent.firstChild){
_1f3=null;
}else{
if(_1f2){
if(!_1f3){
_1f3=this.parent.firstChild;
}
}else{
if(_1f3){
_1f3=_1f3.nextSibling;
}
}
}
if(_1f3){
for(var i=0;i<data.length;++i){
var t=this._normalizedCreator(data[i]);
this.setItem(t.node.id,{data:t.data,type:t.type});
this.parent.insertBefore(t.node,_1f3);
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
},markupFactory:function(_1f6,node){
_1f6._skipStartup=true;
return new dojo.dnd.Container(node,_1f6);
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
},_changeState:function(type,_1ff){
var _200="dojoDnd"+type;
var _201=type.toLowerCase()+"State";
dojo.removeClass(this.node,_200+this[_201]);
dojo.addClass(this.node,_200+_1ff);
this[_201]=_1ff;
},_addItemClass:function(node,type){
dojo.addClass(node,"dojoDndItem"+type);
},_removeItemClass:function(node,type){
dojo.removeClass(node,"dojoDndItem"+type);
},_getChildByEvent:function(e){
var node=e.target;
if(node){
for(var _208=node.parentNode;_208;node=_208,_208=node.parentNode){
if(_208==this.parent&&dojo.hasClass(node,"dojoDndItem")){
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
var _216=item&&dojo.isObject(item),data,type,n;
if(_216&&item.tagName&&item.nodeType&&item.getAttribute){
data=item.getAttribute("dndData")||item.innerHTML;
type=item.getAttribute("dndType");
type=type?type.split(/\s*,\s*/):["text"];
n=item;
}else{
data=(_216&&item.data)?item.data:item;
type=(_216&&item.type)?item.type:["text"];
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
dojo.declare("dojo.dnd.Selector",dojo.dnd.Container,{constructor:function(node,_21b){
if(!_21b){
_21b={};
}
this.singular=_21b.singular;
this.autoSync=_21b.autoSync;
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
},insertNodes:function(_22d,data,_22f,_230){
var _231=this._normalizedCreator;
this._normalizedCreator=function(item,hint){
var t=_231.call(this,item,hint);
if(_22d){
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
dojo.dnd.Selector.superclass.insertNodes.call(this,data,_22f,_230);
this._normalizedCreator=_231;
return this;
},destroy:function(){
dojo.dnd.Selector.superclass.destroy.call(this);
this.selection=this.anchor=null;
},markupFactory:function(_235,node){
_235._skipStartup=true;
return new dojo.dnd.Selector(node,_235);
},onMouseDown:function(e){
if(this.autoSync){
this.sync();
}
if(!this.current){
return;
}
if(!this.singular&&!dojo.dnd.getCopyKeyState(e)&&!e.shiftKey&&(this.current.id in this.selection)){
this.simpleSelection=true;
if(e.button===dojo.dnd._lmb){
dojo.stopEvent(e);
}
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
dojo.declare("dojo.dnd.Avatar",null,{constructor:function(_240){
this.manager=_240;
this.construct();
},construct:function(){
var a=dojo.create("table",{"class":"dojoDndAvatar",style:{position:"absolute",zIndex:"1999",margin:"0px"}}),b=dojo.create("tbody",null,a),tr=dojo.create("tr",null,b),td=dojo.create("td",{innerHTML:this._generateText()},tr),k=Math.min(5,this.manager.nodes.length),i=0,_247=this.manager.source,node;
dojo.attr(tr,{"class":"dojoDndAvatarHeader",style:{opacity:0.9}});
for(;i<k;++i){
if(_247.creator){
node=_247._normalizedCreator(_247.getItem(this.manager.nodes[i].id).data,"avatar").node;
}else{
node=this.manager.nodes[i].cloneNode(true);
if(node.tagName.toLowerCase()=="tr"){
var _249=dojo.create("table"),_24a=dojo.create("tbody",null,_249);
_24a.appendChild(node);
node=_249;
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
},OFFSET_X:16,OFFSET_Y:16,overSource:function(_24c){
if(this.avatar){
this.target=(_24c&&_24c.targetState!="Disabled")?_24c:null;
this.canDropFlag=Boolean(this.target);
this.avatar.update();
}
dojo.publish("/dnd/source/over",[_24c]);
},outSource:function(_24d){
if(this.avatar){
if(this.target==_24d){
this.target=null;
this.canDropFlag=false;
this.avatar.update();
dojo.publish("/dnd/source/over",[null]);
}
}else{
dojo.publish("/dnd/source/over",[null]);
}
},startDrag:function(_24e,_24f,copy){
this.source=_24e;
this.nodes=_24f;
this.copy=Boolean(copy);
this.avatar=this.makeAvatar();
dojo.body().appendChild(this.avatar.node);
dojo.publish("/dnd/start",[_24e,_24f,this.copy]);
this.events=[dojo.connect(dojo.doc,"onmousemove",this,"onMouseMove"),dojo.connect(dojo.doc,"onmouseup",this,"onMouseUp"),dojo.connect(dojo.doc,"onkeydown",this,"onKeyDown"),dojo.connect(dojo.doc,"onkeyup",this,"onKeyUp"),dojo.connect(dojo.doc,"ondragstart",dojo.stopEvent),dojo.connect(dojo.body(),"onselectstart",dojo.stopEvent)];
var c="dojoDnd"+(copy?"Copy":"Move");
dojo.addClass(dojo.body(),c);
},canDrop:function(flag){
var _253=Boolean(this.target&&flag);
if(this.canDropFlag!=_253){
this.canDropFlag=_253;
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
if(this.avatar){
if(this.target&&this.canDropFlag){
var copy=Boolean(this.source.copyState(dojo.dnd.getCopyKeyState(e))),_25a=[this.source,this.nodes,copy,this.target];
dojo.publish("/dnd/drop/before",_25a);
dojo.publish("/dnd/drop",_25a);
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
dojo.declare("dojo.dnd.Source",dojo.dnd.Selector,{isSource:true,horizontal:false,copyOnly:false,selfCopy:false,selfAccept:true,skipForm:false,withHandles:false,autoSync:false,delay:0,accept:["text"],constructor:function(node,_261){
dojo.mixin(this,dojo.mixin({},_261));
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
},checkAcceptance:function(_264,_265){
if(this==_264){
return !this.copyOnly||this.selfAccept;
}
for(var i=0;i<_265.length;++i){
var type=_264.getItem(_265[i].id).type;
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
},copyState:function(_26a,self){
if(_26a){
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
},markupFactory:function(_26c,node){
_26c._skipStartup=true;
return new dojo.dnd.Source(node,_26c);
},onMouseMove:function(e){
if(this.isDragging&&this.targetState=="Disabled"){
return;
}
dojo.dnd.Source.superclass.onMouseMove.call(this,e);
var m=dojo.dnd.manager();
if(this.isDragging){
var _270=false;
if(this.current){
if(!this.targetBox||this.targetAnchor!=this.current){
this.targetBox={xy:dojo.coords(this.current,true),w:this.current.offsetWidth,h:this.current.offsetHeight};
}
if(this.horizontal){
_270=(e.pageX-this.targetBox.xy.x)<(this.targetBox.w/2);
}else{
_270=(e.pageY-this.targetBox.xy.y)<(this.targetBox.h/2);
}
}
if(this.current!=this.targetAnchor||_270!=this.before){
this._markTargetAnchor(_270);
m.canDrop(!this.current||m.source!=this||!(this.current.id in this.selection));
}
}else{
if(this.mouseDown&&this.isSource&&(Math.abs(e.pageX-this._lastX)>this.delay||Math.abs(e.pageY-this._lastY)>this.delay)){
var _271=this.getSelectedNodes();
if(_271.length){
m.startDrag(this,_271,this.copyState(dojo.dnd.getCopyKeyState(e),true));
}
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
},onDndSourceOver:function(_274){
if(this!=_274){
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
},onDndStart:function(_276,_277,copy){
if(this.autoSync){
this.sync();
}
if(this.isSource){
this._changeState("Source",this==_276?(copy?"Copied":"Moved"):"");
}
var _279=this.accept&&this.checkAcceptance(_276,_277);
this._changeState("Target",_279?"":"Disabled");
if(this==_276){
dojo.dnd.manager().overSource(this);
}
this.isDragging=true;
},onDndDrop:function(_27a,_27b,copy,_27d){
if(this==_27d){
this.onDrop(_27a,_27b,copy);
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
},onDrop:function(_27e,_27f,copy){
if(this!=_27e){
this.onDropExternal(_27e,_27f,copy);
}else{
this.onDropInternal(_27f,copy);
}
},onDropExternal:function(_281,_282,copy){
var _284=this._normalizedCreator;
if(this.creator){
this._normalizedCreator=function(node,hint){
return _284.call(this,_281.getItem(node.id).data,hint);
};
}else{
if(copy){
this._normalizedCreator=function(node,hint){
var t=_281.getItem(node.id);
var n=node.cloneNode(true);
n.id=dojo.dnd.getUniqueId();
return {node:n,data:t.data,type:t.type};
};
}else{
this._normalizedCreator=function(node,hint){
var t=_281.getItem(node.id);
_281.delItem(node.id);
return {node:node,data:t.data,type:t.type};
};
}
}
this.selectNone();
if(!copy&&!this.creator){
_281.selectNone();
}
this.insertNodes(true,_282,this.before,this.current);
if(!copy&&this.creator){
_281.deleteSelectedNodes();
}
this._normalizedCreator=_284;
},onDropInternal:function(_28e,copy){
var _290=this._normalizedCreator;
if(this.current&&this.current.id in this.selection){
return;
}
if(copy){
if(this.creator){
this._normalizedCreator=function(node,hint){
return _290.call(this,this.getItem(node.id).data,hint);
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
this.insertNodes(true,_28e,this.before,this.current);
this._normalizedCreator=_290;
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
},_markTargetAnchor:function(_29a){
if(this.current==this.targetAnchor&&this.before==_29a){
return;
}
if(this.targetAnchor){
this._removeItemClass(this.targetAnchor,this.before?"Before":"After");
}
this.targetAnchor=this.current;
this.targetBox=null;
this.before=_29a;
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
if(!dojo.dnd._isLmbPressed(e)){
return false;
}
if(!this.withHandles){
return true;
}
for(var node=e.target;node&&node!==this.node;node=node.parentNode){
if(dojo.hasClass(node,"dojoDndHandle")){
return true;
}
if(dojo.hasClass(node,"dojoDndItem")){
break;
}
}
return false;
}});
dojo.declare("dojo.dnd.Target",dojo.dnd.Source,{constructor:function(node,_29f){
this.isSource=false;
dojo.removeClass(this.node,"dojoDndSource");
},markupFactory:function(_2a0,node){
_2a0._skipStartup=true;
return new dojo.dnd.Target(node,_2a0);
}});
dojo.declare("dojo.dnd.AutoSource",dojo.dnd.Source,{constructor:function(node,_2a3){
this.autoSync=true;
},markupFactory:function(_2a4,node){
_2a4._skipStartup=true;
return new dojo.dnd.AutoSource(node,_2a4);
}});
}
if(!dojo._hasResource["dojo.dnd.TimedMoveable"]){
dojo._hasResource["dojo.dnd.TimedMoveable"]=true;
dojo.provide("dojo.dnd.TimedMoveable");
(function(){
var _2a6=dojo.dnd.Moveable.prototype.onMove;
dojo.declare("dojo.dnd.TimedMoveable",dojo.dnd.Moveable,{timeout:40,constructor:function(node,_2a8){
if(!_2a8){
_2a8={};
}
if(_2a8.timeout&&typeof _2a8.timeout=="number"&&_2a8.timeout>=0){
this.timeout=_2a8.timeout;
}
},markupFactory:function(_2a9,node){
return new dojo.dnd.TimedMoveable(node,_2a9);
},onMoveStop:function(_2ab){
if(_2ab._timer){
clearTimeout(_2ab._timer);
_2a6.call(this,_2ab,_2ab._leftTop);
}
dojo.dnd.Moveable.prototype.onMoveStop.apply(this,arguments);
},onMove:function(_2ac,_2ad){
_2ac._leftTop=_2ad;
if(!_2ac._timer){
var _t=this;
_2ac._timer=setTimeout(function(){
_2ac._timer=null;
_2a6.call(_t,_2ac,_2ac._leftTop);
},this.timeout);
}
}});
})();
}
if(!dojo._hasResource["dojo.fx.Toggler"]){
dojo._hasResource["dojo.fx.Toggler"]=true;
dojo.provide("dojo.fx.Toggler");
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
},node:null,showFunc:dojo.fadeIn,hideFunc:dojo.fadeOut,showDuration:200,hideDuration:200,show:function(_2b1){
return this.showAnim.play(_2b1||0);
},hide:function(_2b2){
return this.hideAnim.play(_2b2||0);
}});
}
if(!dojo._hasResource["dojo.fx"]){
dojo._hasResource["dojo.fx"]=true;
dojo.provide("dojo.fx");
(function(){
var d=dojo,_2b4={_fire:function(evt,args){
if(this[evt]){
this[evt].apply(this,args||[]);
}
return this;
}};
var _2b7=function(_2b8){
this._index=-1;
this._animations=_2b8||[];
this._current=this._onAnimateCtx=this._onEndCtx=null;
this.duration=0;
d.forEach(this._animations,function(a){
this.duration+=a.duration;
if(a.delay){
this.duration+=a.delay;
}
},this);
};
d.extend(_2b7,{_onAnimate:function(){
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
},play:function(_2ba,_2bb){
if(!this._current){
this._current=this._animations[this._index=0];
}
if(!_2bb&&this._current.status()=="playing"){
return this;
}
var _2bc=d.connect(this._current,"beforeBegin",this,function(){
this._fire("beforeBegin");
}),_2bd=d.connect(this._current,"onBegin",this,function(arg){
this._fire("onBegin",arguments);
}),_2bf=d.connect(this._current,"onPlay",this,function(arg){
this._fire("onPlay",arguments);
d.disconnect(_2bc);
d.disconnect(_2bd);
d.disconnect(_2bf);
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
},gotoPercent:function(_2c3,_2c4){
this.pause();
var _2c5=this.duration*_2c3;
this._current=null;
d.some(this._animations,function(a){
if(a.duration<=_2c5){
this._current=a;
return true;
}
_2c5-=a.duration;
return false;
});
if(this._current){
this._current.gotoPercent(_2c5/this._current.duration,_2c4);
}
return this;
},stop:function(_2c7){
if(this._current){
if(_2c7){
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
d.extend(_2b7,_2b4);
dojo.fx.chain=function(_2ca){
return new _2b7(_2ca);
};
var _2cb=function(_2cc){
this._animations=_2cc||[];
this._connects=[];
this._finished=0;
this.duration=0;
d.forEach(_2cc,function(a){
var _2ce=a.duration;
if(a.delay){
_2ce+=a.delay;
}
if(this.duration<_2ce){
this.duration=_2ce;
}
this._connects.push(d.connect(a,"onEnd",this,"_onEnd"));
},this);
this._pseudoAnimation=new d._Animation({curve:[0,1],duration:this.duration});
var self=this;
d.forEach(["beforeBegin","onBegin","onPlay","onAnimate","onPause","onStop"],function(evt){
self._connects.push(d.connect(self._pseudoAnimation,evt,function(){
self._fire(evt,arguments);
}));
});
};
d.extend(_2cb,{_doAction:function(_2d1,args){
d.forEach(this._animations,function(a){
a[_2d1].apply(a,args);
});
return this;
},_onEnd:function(){
if(++this._finished==this._animations.length){
this._fire("onEnd");
}
},_call:function(_2d4,args){
var t=this._pseudoAnimation;
t[_2d4].apply(t,args);
},play:function(_2d7,_2d8){
this._finished=0;
this._doAction("play",arguments);
this._call("play",arguments);
return this;
},pause:function(){
this._doAction("pause",arguments);
this._call("pause",arguments);
return this;
},gotoPercent:function(_2d9,_2da){
var ms=this.duration*_2d9;
d.forEach(this._animations,function(a){
a.gotoPercent(a.duration<ms?1:(ms/a.duration),_2da);
});
this._call("gotoPercent",arguments);
return this;
},stop:function(_2dd){
this._doAction("stop",arguments);
this._call("stop",arguments);
return this;
},status:function(){
return this._pseudoAnimation.status();
},destroy:function(){
d.forEach(this._connects,dojo.disconnect);
}});
d.extend(_2cb,_2b4);
dojo.fx.combine=function(_2de){
return new _2cb(_2de);
};
dojo.fx.wipeIn=function(args){
args.node=d.byId(args.node);
var node=args.node,s=node.style,o;
var anim=d.animateProperty(d.mixin({properties:{height:{start:function(){
o=s.overflow;
s.overflow="hidden";
if(s.visibility=="hidden"||s.display=="none"){
s.height="1px";
s.display="";
s.visibility="";
return 1;
}else{
var _2e4=d.style(node,"height");
return Math.max(_2e4,1);
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
var ret=d.coords(n,true);
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
if(!dojo._hasResource["dijit._base.focus"]){
dojo._hasResource["dijit._base.focus"]=true;
dojo.provide("dijit._base.focus");
dojo.mixin(dijit,{_curFocus:null,_prevFocus:null,isCollapsed:function(){
var _2f4=dojo.doc;
if(_2f4.selection){
var s=_2f4.selection;
if(s.type=="Text"){
return !s.createRange().htmlText.length;
}else{
return !s.createRange().length;
}
}else{
var _2f6=dojo.global;
var _2f7=_2f6.getSelection();
if(dojo.isString(_2f7)){
return !_2f7;
}else{
return !_2f7||_2f7.isCollapsed||!_2f7.toString();
}
}
},getBookmark:function(){
var _2f8,_2f9=dojo.doc.selection;
if(_2f9){
var _2fa=_2f9.createRange();
if(_2f9.type.toUpperCase()=="CONTROL"){
if(_2fa.length){
_2f8=[];
var i=0,len=_2fa.length;
while(i<len){
_2f8.push(_2fa.item(i++));
}
}else{
_2f8=null;
}
}else{
_2f8=_2fa.getBookmark();
}
}else{
if(window.getSelection){
_2f9=dojo.global.getSelection();
if(_2f9){
_2fa=_2f9.getRangeAt(0);
_2f8=_2fa.cloneRange();
}
}else{
console.warn("No idea how to store the current selection for this browser!");
}
}
return _2f8;
},moveToBookmark:function(_2fd){
var _2fe=dojo.doc;
if(_2fe.selection){
var _2ff;
if(dojo.isArray(_2fd)){
_2ff=_2fe.body.createControlRange();
dojo.forEach(_2fd,function(n){
_2ff.addElement(n);
});
}else{
_2ff=_2fe.selection.createRange();
_2ff.moveToBookmark(_2fd);
}
_2ff.select();
}else{
var _301=dojo.global.getSelection&&dojo.global.getSelection();
if(_301&&_301.removeAllRanges){
_301.removeAllRanges();
_301.addRange(_2fd);
}else{
console.warn("No idea how to restore selection for this browser!");
}
}
},getFocus:function(menu,_303){
return {node:menu&&dojo.isDescendant(dijit._curFocus,menu.domNode)?dijit._prevFocus:dijit._curFocus,bookmark:!dojo.withGlobal(_303||dojo.global,dijit.isCollapsed)?dojo.withGlobal(_303||dojo.global,dijit.getBookmark):null,openedForWindow:_303};
},focus:function(_304){
if(!_304){
return;
}
var node="node" in _304?_304.node:_304,_306=_304.bookmark,_307=_304.openedForWindow;
if(node){
var _308=(node.tagName.toLowerCase()=="iframe")?node.contentWindow:node;
if(_308&&_308.focus){
try{
_308.focus();
}
catch(e){
}
}
dijit._onFocusNode(node);
}
if(_306&&dojo.withGlobal(_307||dojo.global,dijit.isCollapsed)){
if(_307){
_307.focus();
}
try{
dojo.withGlobal(_307||dojo.global,dijit.moveToBookmark,null,[_306]);
}
catch(e){
}
}
},_activeStack:[],registerIframe:function(_309){
dijit.registerWin(_309.contentWindow,_309);
},registerWin:function(_30a,_30b){
dojo.connect(_30a.document,"onmousedown",function(evt){
dijit._justMouseDowned=true;
setTimeout(function(){
dijit._justMouseDowned=false;
},0);
dijit._onTouchNode(_30b||evt.target||evt.srcElement);
});
var doc=_30a.document;
if(doc){
if(dojo.isIE){
doc.attachEvent("onactivate",function(evt){
if(evt.srcElement.tagName.toLowerCase()!="#document"){
dijit._onFocusNode(_30b||evt.srcElement);
}
});
doc.attachEvent("ondeactivate",function(evt){
dijit._onBlurNode(_30b||evt.srcElement);
});
}else{
doc.addEventListener("focus",function(evt){
dijit._onFocusNode(_30b||evt.target);
},true);
doc.addEventListener("blur",function(evt){
dijit._onBlurNode(_30b||evt.target);
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
var _314=[];
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
_314.unshift(id);
}
node=node.parentNode;
}
}
}
}
catch(e){
}
dijit._setStack(_314);
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
},_setStack:function(_317){
var _318=dijit._activeStack;
dijit._activeStack=_317;
for(var _319=0;_319<Math.min(_318.length,_317.length);_319++){
if(_318[_319]!=_317[_319]){
break;
}
}
for(var i=_318.length-1;i>=_319;i--){
var _31b=dijit.byId(_318[i]);
if(_31b){
_31b._focused=false;
_31b._hasBeenBlurred=true;
if(_31b._onBlur){
_31b._onBlur();
}
if(_31b._setStateClass){
_31b._setStateClass();
}
dojo.publish("widgetBlur",[_31b]);
}
}
for(i=_319;i<_317.length;i++){
_31b=dijit.byId(_317[i]);
if(_31b){
_31b._focused=true;
if(_31b._onFocus){
_31b._onFocus();
}
if(_31b._setStateClass){
_31b._setStateClass();
}
dojo.publish("widgetFocus",[_31b]);
}
}
}});
dojo.addOnLoad(function(){
dijit.registerWin(window);
});
}
if(!dojo._hasResource["dijit._base.manager"]){
dojo._hasResource["dijit._base.manager"]=true;
dojo.provide("dijit._base.manager");
dojo.declare("dijit.WidgetSet",null,{constructor:function(){
this._hash={};
},add:function(_31c){
if(this._hash[_31c.id]){
throw new Error("Tried to register widget with id=="+_31c.id+" but that id is already registered");
}
this._hash[_31c.id]=_31c;
},remove:function(id){
delete this._hash[id];
},forEach:function(func){
for(var id in this._hash){
func(this._hash[id]);
}
},filter:function(_320){
var res=new dijit.WidgetSet();
this.forEach(function(_322){
if(_320(_322)){
res.add(_322);
}
});
return res;
},byId:function(id){
return this._hash[id];
},byClass:function(cls){
return this.filter(function(_325){
return _325.declaredClass==cls;
});
}});
dijit.registry=new dijit.WidgetSet();
dijit._widgetTypeCtr={};
dijit.getUniqueId=function(_326){
var id;
do{
id=_326+"_"+(_326 in dijit._widgetTypeCtr?++dijit._widgetTypeCtr[_326]:dijit._widgetTypeCtr[_326]=0);
}while(dijit.byId(id));
return id;
};
dijit.findWidgets=function(root){
var _329=[];
function _32a(root){
var list=dojo.isIE?root.children:root.childNodes,i=0,node;
while(node=list[i++]){
if(node.nodeType!=1){
continue;
}
var _32f=node.getAttribute("widgetId");
if(_32f){
var _330=dijit.byId(_32f);
_329.push(_330);
}else{
_32a(node);
}
}
};
_32a(root);
return _329;
};
if(dojo.isIE){
dojo.addOnWindowUnload(function(){
dojo.forEach(dijit.findWidgets(dojo.body()),function(_331){
if(_331.destroyRecursive){
_331.destroyRecursive();
}else{
if(_331.destroy){
_331.destroy();
}
}
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
var _336=dojo.style(elem);
return (_336.visibility!="hidden")&&(_336.visibility!="collapsed")&&(_336.display!="none")&&(dojo.attr(elem,"type")!="hidden");
};
dijit.isTabNavigable=function(elem){
if(dojo.hasAttr(elem,"disabled")){
return false;
}
var _338=dojo.hasAttr(elem,"tabindex");
var _339=dojo.attr(elem,"tabindex");
if(_338&&_339>=0){
return true;
}
var name=elem.nodeName.toLowerCase();
if(((name=="a"&&dojo.hasAttr(elem,"href"))||dijit._tabElements[name])&&(!_338||_339>=0)){
return true;
}
return false;
};
dijit._getTabNavigable=function(root){
var _33c,last,_33e,_33f,_340,_341;
var _342=function(_343){
dojo.query("> *",_343).forEach(function(_344){
var _345=dijit._isElementShown(_344);
if(_345&&dijit.isTabNavigable(_344)){
var _346=dojo.attr(_344,"tabindex");
if(!dojo.hasAttr(_344,"tabindex")||_346==0){
if(!_33c){
_33c=_344;
}
last=_344;
}else{
if(_346>0){
if(!_33e||_346<_33f){
_33f=_346;
_33e=_344;
}
if(!_340||_346>=_341){
_341=_346;
_340=_344;
}
}
}
}
if(_345&&_344.nodeName.toUpperCase()!="SELECT"){
_342(_344);
}
});
};
if(dijit._isElementShown(root)){
_342(root);
}
return {first:_33c,last:last,lowest:_33e,highest:_340};
};
dijit.getFirstInTabbingOrder=function(root){
var _348=dijit._getTabNavigable(dojo.byId(root));
return _348.lowest?_348.lowest:_348.first;
};
dijit.getLastInTabbingOrder=function(root){
var _34a=dijit._getTabNavigable(dojo.byId(root));
return _34a.last?_34a.last:_34a.highest;
};
dijit.defaultDuration=dojo.config["defaultDuration"]||200;
}
if(!dojo._hasResource["dojo.AdapterRegistry"]){
dojo._hasResource["dojo.AdapterRegistry"]=true;
dojo.provide("dojo.AdapterRegistry");
dojo.AdapterRegistry=function(_34b){
this.pairs=[];
this.returnWrappers=_34b||false;
};
dojo.extend(dojo.AdapterRegistry,{register:function(name,_34d,wrap,_34f,_350){
this.pairs[((_350)?"unshift":"push")]([name,_34d,wrap,_34f]);
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
var _356=(dojo.doc.compatMode=="BackCompat")?dojo.body():dojo.doc.documentElement;
var _357=dojo._docScroll();
return {w:_356.clientWidth,h:_356.clientHeight,l:_357.x,t:_357.y};
};
dijit.placeOnScreen=function(node,pos,_35a,_35b){
var _35c=dojo.map(_35a,function(_35d){
var c={corner:_35d,pos:{x:pos.x,y:pos.y}};
if(_35b){
c.pos.x+=_35d.charAt(1)=="L"?_35b.x:-_35b.x;
c.pos.y+=_35d.charAt(0)=="T"?_35b.y:-_35b.y;
}
return c;
});
return dijit._place(node,_35c);
};
dijit._place=function(node,_360,_361){
var view=dijit.getViewport();
if(!node.parentNode||String(node.parentNode.tagName).toLowerCase()!="body"){
dojo.body().appendChild(node);
}
var best=null;
dojo.some(_360,function(_364){
var _365=_364.corner;
var pos=_364.pos;
if(_361){
_361(node,_364.aroundCorner,_365);
}
var _367=node.style;
var _368=_367.display;
var _369=_367.visibility;
_367.visibility="hidden";
_367.display="";
var mb=dojo.marginBox(node);
_367.display=_368;
_367.visibility=_369;
var _36b=(_365.charAt(1)=="L"?pos.x:Math.max(view.l,pos.x-mb.w)),_36c=(_365.charAt(0)=="T"?pos.y:Math.max(view.t,pos.y-mb.h)),endX=(_365.charAt(1)=="L"?Math.min(view.l+view.w,_36b+mb.w):pos.x),endY=(_365.charAt(0)=="T"?Math.min(view.t+view.h,_36c+mb.h):pos.y),_36f=endX-_36b,_370=endY-_36c,_371=(mb.w-_36f)+(mb.h-_370);
if(best==null||_371<best.overflow){
best={corner:_365,aroundCorner:_364.aroundCorner,x:_36b,y:_36c,w:_36f,h:_370,overflow:_371};
}
return !_371;
});
node.style.left=best.x+"px";
node.style.top=best.y+"px";
if(best.overflow&&_361){
_361(node,best.aroundCorner,best.corner);
}
return best;
};
dijit.placeOnScreenAroundNode=function(node,_373,_374,_375){
_373=dojo.byId(_373);
var _376=_373.style.display;
_373.style.display="";
var _377=_373.offsetWidth;
var _378=_373.offsetHeight;
var _379=dojo.coords(_373,true);
_373.style.display=_376;
return dijit._placeOnScreenAroundRect(node,_379.x,_379.y,_377,_378,_374,_375);
};
dijit.placeOnScreenAroundRectangle=function(node,_37b,_37c,_37d){
return dijit._placeOnScreenAroundRect(node,_37b.x,_37b.y,_37b.width,_37b.height,_37c,_37d);
};
dijit._placeOnScreenAroundRect=function(node,x,y,_381,_382,_383,_384){
var _385=[];
for(var _386 in _383){
_385.push({aroundCorner:_386,corner:_383[_386],pos:{x:x+(_386.charAt(1)=="L"?0:_381),y:y+(_386.charAt(0)=="T"?0:_382)}});
}
return dijit._place(node,_385,_384);
};
dijit.placementRegistry=new dojo.AdapterRegistry();
dijit.placementRegistry.register("node",function(n,x){
return typeof x=="object"&&typeof x.offsetWidth!="undefined"&&typeof x.offsetHeight!="undefined";
},dijit.placeOnScreenAroundNode);
dijit.placementRegistry.register("rect",function(n,x){
return typeof x=="object"&&"x" in x&&"y" in x&&"width" in x&&"height" in x;
},dijit.placeOnScreenAroundRectangle);
dijit.placeOnScreenAroundElement=function(node,_38c,_38d,_38e){
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
var _391=[],_392=1000,_393=1;
this.prepare=function(node){
var s=node.style;
s.visibility="hidden";
s.position="absolute";
s.top="-9999px";
if(s.display=="none"){
s.display="";
}
dojo.body().appendChild(node);
};
this.open=function(args){
var _397=args.popup,_398=args.orient||{"BL":"TL","TL":"BL"},_399=args.around,id=(args.around&&args.around.id)?(args.around.id+"_dropdown"):("popup_"+_393++);
var _39b=dojo.create("div",{id:id,"class":"dijitPopup",style:{zIndex:_392+_391.length,visibility:"hidden"}},dojo.body());
dijit.setWaiRole(_39b,"presentation");
_39b.style.left=_39b.style.top="0px";
if(args.parent){
_39b.dijitPopupParent=args.parent.id;
}
var s=_397.domNode.style;
s.display="";
s.visibility="";
s.position="";
s.top="0px";
_39b.appendChild(_397.domNode);
var _39d=new dijit.BackgroundIframe(_39b);
var best=_399?dijit.placeOnScreenAroundElement(_39b,_399,_398,_397.orient?dojo.hitch(_397,"orient"):null):dijit.placeOnScreen(_39b,args,_398=="R"?["TR","BR","TL","BL"]:["TL","BL","TR","BR"],args.padding);
_39b.style.visibility="visible";
var _39f=[];
var _3a0=function(){
for(var pi=_391.length-1;pi>0&&_391[pi].parent===_391[pi-1].widget;pi--){
}
return _391[pi];
};
_39f.push(dojo.connect(_39b,"onkeypress",this,function(evt){
if(evt.charOrCode==dojo.keys.ESCAPE&&args.onCancel){
dojo.stopEvent(evt);
args.onCancel();
}else{
if(evt.charOrCode===dojo.keys.TAB){
dojo.stopEvent(evt);
var _3a3=_3a0();
if(_3a3&&_3a3.onCancel){
_3a3.onCancel();
}
}
}
}));
if(_397.onCancel){
_39f.push(dojo.connect(_397,"onCancel",null,args.onCancel));
}
_39f.push(dojo.connect(_397,_397.onExecute?"onExecute":"onChange",null,function(){
var _3a4=_3a0();
if(_3a4&&_3a4.onExecute){
_3a4.onExecute();
}
}));
_391.push({wrapper:_39b,iframe:_39d,widget:_397,parent:args.parent,onExecute:args.onExecute,onCancel:args.onCancel,onClose:args.onClose,handlers:_39f});
if(_397.onOpen){
_397.onOpen(best);
}
return best;
};
this.close=function(_3a5){
while(dojo.some(_391,function(elem){
return elem.widget==_3a5;
})){
var top=_391.pop(),_3a8=top.wrapper,_3a9=top.iframe,_3aa=top.widget,_3ab=top.onClose;
if(_3aa.onClose){
_3aa.onClose();
}
dojo.forEach(top.handlers,dojo.disconnect);
if(!_3aa||!_3aa.domNode){
return;
}
this.prepare(_3aa.domNode);
_3a9.destroy();
dojo.destroy(_3a8);
if(_3ab){
_3ab();
}
}
};
}();
dijit._frames=new function(){
var _3ac=[];
this.pop=function(){
var _3ad;
if(_3ac.length){
_3ad=_3ac.pop();
_3ad.style.display="";
}else{
if(dojo.isIE){
var burl=dojo.config["dojoBlankHtmlUrl"]||(dojo.moduleUrl("dojo","resources/blank.html")+"")||"javascript:\"\"";
var html="<iframe src='"+burl+"'"+" style='position: absolute; left: 0px; top: 0px;"+"z-index: -1; filter:Alpha(Opacity=\"0\");'>";
_3ad=dojo.doc.createElement(html);
}else{
_3ad=dojo.create("iframe");
_3ad.src="javascript:\"\"";
_3ad.className="dijitBackgroundIframe";
}
_3ad.tabIndex=-1;
dojo.body().appendChild(_3ad);
}
return _3ad;
};
this.push=function(_3b0){
_3b0.style.display="none";
if(dojo.isIE){
_3b0.style.removeExpression("width");
_3b0.style.removeExpression("height");
}
_3ac.push(_3b0);
};
}();
dijit.BackgroundIframe=function(node){
if(!node.id){
throw new Error("no id");
}
if(dojo.isIE<7||(dojo.isFF<3&&dojo.hasClass(dojo.body(),"dijit_a11y"))){
var _3b2=dijit._frames.pop();
node.appendChild(_3b2);
if(dojo.isIE){
_3b2.style.setExpression("width",dojo._scopeName+".doc.getElementById('"+node.id+"').offsetWidth");
_3b2.style.setExpression("height",dojo._scopeName+".doc.getElementById('"+node.id+"').offsetHeight");
}
this.iframe=_3b2;
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
try{
node=dojo.byId(node);
var doc=dojo.doc;
var body=dojo.body();
var html=body.parentNode;
if((!(dojo.isFF>=3||dojo.isIE||dojo.isWebKit)||node==body||node==html)&&(typeof node.scrollIntoView=="function")){
node.scrollIntoView(false);
return;
}
var ltr=dojo._isBodyLtr();
var _3b8=dojo.isIE>=8&&!_3b9;
var rtl=!ltr&&!_3b8;
var _3bb=body;
var _3b9=doc.compatMode=="BackCompat";
if(_3b9){
html._offsetWidth=html._clientWidth=body._offsetWidth=body.clientWidth;
html._offsetHeight=html._clientHeight=body._offsetHeight=body.clientHeight;
}else{
if(dojo.isWebKit){
body._offsetWidth=body._clientWidth=html.clientWidth;
body._offsetHeight=body._clientHeight=html.clientHeight;
}else{
_3bb=html;
}
html._offsetHeight=html.clientHeight;
html._offsetWidth=html.clientWidth;
}
function _3bc(_3bd){
var ie=dojo.isIE;
return ((ie<=6||(ie>=7&&_3b9))?false:(dojo.style(_3bd,"position").toLowerCase()=="fixed"));
};
function _3bf(_3c0){
var _3c1=_3c0.parentNode;
var _3c2=_3c0.offsetParent;
if(_3c2==null||_3bc(_3c0)){
_3c2=html;
_3c1=(_3c0==body)?html:null;
}
_3c0._offsetParent=_3c2;
_3c0._parent=_3c1;
var bp=dojo._getBorderExtents(_3c0);
_3c0._borderStart={H:(_3b8&&!ltr)?(bp.w-bp.l):bp.l,V:bp.t};
_3c0._borderSize={H:bp.w,V:bp.h};
_3c0._scrolledAmount={H:_3c0.scrollLeft,V:_3c0.scrollTop};
_3c0._offsetSize={H:_3c0._offsetWidth||_3c0.offsetWidth,V:_3c0._offsetHeight||_3c0.offsetHeight};
_3c0._offsetStart={H:(_3b8&&!ltr)?_3c2.clientWidth-_3c0.offsetLeft-_3c0._offsetSize.H:_3c0.offsetLeft,V:_3c0.offsetTop};
_3c0._clientSize={H:_3c0._clientWidth||_3c0.clientWidth,V:_3c0._clientHeight||_3c0.clientHeight};
if(_3c0!=body&&_3c0!=html&&_3c0!=node){
for(var dir in _3c0._offsetSize){
var _3c5=_3c0._offsetSize[dir]-_3c0._clientSize[dir]-_3c0._borderSize[dir];
var _3c6=_3c0._clientSize[dir]>0&&_3c5>0;
if(_3c6){
_3c0._offsetSize[dir]-=_3c5;
if(dojo.isIE&&rtl&&dir=="H"){
_3c0._offsetStart[dir]+=_3c5;
}
}
}
}
};
var _3c7=node;
while(_3c7!=null){
if(_3bc(_3c7)){
node.scrollIntoView(false);
return;
}
_3bf(_3c7);
_3c7=_3c7._parent;
}
if(dojo.isIE&&node._parent){
var _3c8=node._offsetParent;
node._offsetStart.H+=_3c8._borderStart.H;
node._offsetStart.V+=_3c8._borderStart.V;
}
if(dojo.isIE>=7&&_3bb==html&&rtl&&body._offsetStart&&body._offsetStart.H==0){
var _3c9=html.scrollWidth-html._offsetSize.H;
if(_3c9>0){
body._offsetStart.H=-_3c9;
}
}
if(dojo.isIE<=6&&!_3b9){
html._offsetSize.H+=html._borderSize.H;
html._offsetSize.V+=html._borderSize.V;
}
if(rtl&&body._offsetStart&&_3bb==html&&html._scrolledAmount){
var ofs=body._offsetStart.H;
if(ofs<0){
html._scrolledAmount.H+=ofs;
body._offsetStart.H=0;
}
}
_3c7=node;
while(_3c7){
var _3cb=_3c7._parent;
if(!_3cb){
break;
}
if(_3cb.tagName=="TD"){
var _3cc=_3cb._parent._parent._parent;
if(_3cb!=_3c7._offsetParent&&_3cb._offsetParent!=_3c7._offsetParent){
_3cb=_3cc;
}
}
var _3cd=_3c7._offsetParent==_3cb;
for(var dir in _3c7._offsetStart){
var _3cf=dir=="H"?"V":"H";
if(rtl&&dir=="H"&&(_3cb!=html)&&(_3cb!=body)&&(dojo.isIE||dojo.isWebKit)&&_3cb._clientSize.H>0&&_3cb.scrollWidth>_3cb._clientSize.H){
var _3d0=_3cb.scrollWidth-_3cb._clientSize.H;
if(_3d0>0){
_3cb._scrolledAmount.H-=_3d0;
}
}
if(_3cb._offsetParent.tagName=="TABLE"){
if(dojo.isIE){
_3cb._offsetStart[dir]-=_3cb._offsetParent._borderStart[dir];
_3cb._borderStart[dir]=_3cb._borderSize[dir]=0;
}else{
_3cb._offsetStart[dir]+=_3cb._offsetParent._borderStart[dir];
}
}
if(dojo.isIE){
_3cb._offsetStart[dir]+=_3cb._offsetParent._borderStart[dir];
}
var _3d1=_3c7._offsetStart[dir]-_3cb._scrolledAmount[dir]-(_3cd?0:_3cb._offsetStart[dir])-_3cb._borderStart[dir];
var _3d2=_3d1+_3c7._offsetSize[dir]-_3cb._offsetSize[dir]+_3cb._borderSize[dir];
var _3d3=(dir=="H")?"scrollLeft":"scrollTop";
var _3d4=dir=="H"&&rtl;
var _3d5=_3d4?-_3d2:_3d1;
var _3d6=_3d4?-_3d1:_3d2;
var _3d7=(_3d5*_3d6<=0)?0:Math[(_3d5<0)?"max":"min"](_3d5,_3d6);
if(_3d7!=0){
var _3d8=_3cb[_3d3];
_3cb[_3d3]+=(_3d4)?-_3d7:_3d7;
var _3d9=_3cb[_3d3]-_3d8;
}
if(_3cd){
_3c7._offsetStart[dir]+=_3cb._offsetStart[dir];
}
_3c7._offsetStart[dir]-=_3cb[_3d3];
}
_3c7._parent=_3cb._parent;
_3c7._offsetParent=_3cb._offsetParent;
}
_3cb=node;
var next;
while(_3cb&&_3cb.removeAttribute){
next=_3cb.parentNode;
_3cb.removeAttribute("_offsetParent");
_3cb.removeAttribute("_parent");
_3cb=next;
}
}
catch(error){
console.error("scrollIntoView: "+error);
node.scrollIntoView(false);
}
};
}
if(!dojo._hasResource["dijit._base.sniff"]){
dojo._hasResource["dijit._base.sniff"]=true;
dojo.provide("dijit._base.sniff");
(function(){
var d=dojo,html=d.doc.documentElement,ie=d.isIE,_3de=d.isOpera,maj=Math.floor,ff=d.isFF,_3e1=d.boxModel.replace(/-/,""),_3e2={dj_ie:ie,dj_ie6:maj(ie)==6,dj_ie7:maj(ie)==7,dj_iequirks:ie&&d.isQuirks,dj_opera:_3de,dj_opera8:maj(_3de)==8,dj_opera9:maj(_3de)==9,dj_khtml:d.isKhtml,dj_webkit:d.isWebKit,dj_safari:d.isSafari,dj_gecko:d.isMozilla,dj_ff2:maj(ff)==2,dj_ff3:maj(ff)==3};
_3e2["dj_"+_3e1]=true;
for(var p in _3e2){
if(_3e2[p]){
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
for(var p in _3e2){
if(_3e2[p]){
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
},trigger:function(evt,_3e6,node,_3e8,obj,_3ea,_3eb){
if(obj!=this._obj){
this.stop();
this._initialDelay=_3eb||500;
this._subsequentDelay=_3ea||0.9;
this._obj=obj;
this._evt=evt;
this._node=node;
this._currentTimeout=-1;
this._count=-1;
this._callback=dojo.hitch(_3e6,_3e8);
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
},addKeyListener:function(node,_3ed,_3ee,_3ef,_3f0,_3f1){
if(_3ed.keyCode){
_3ed.charOrCode=_3ed.keyCode;
dojo.deprecated("keyCode attribute parameter for dijit.typematic.addKeyListener is deprecated. Use charOrCode instead.","","2.0");
}else{
if(_3ed.charCode){
_3ed.charOrCode=String.fromCharCode(_3ed.charCode);
dojo.deprecated("charCode attribute parameter for dijit.typematic.addKeyListener is deprecated. Use charOrCode instead.","","2.0");
}
}
return [dojo.connect(node,"onkeypress",this,function(evt){
if(evt.charOrCode==_3ed.charOrCode&&(_3ed.ctrlKey===undefined||_3ed.ctrlKey==evt.ctrlKey)&&(_3ed.altKey===undefined||_3ed.altKey==evt.ctrlKey)&&(_3ed.shiftKey===undefined||_3ed.shiftKey==evt.ctrlKey)){
dojo.stopEvent(evt);
dijit.typematic.trigger(_3ed,_3ee,node,_3ef,_3ed,_3f0,_3f1);
}else{
if(dijit.typematic._obj==_3ed){
dijit.typematic.stop();
}
}
}),dojo.connect(node,"onkeyup",this,function(evt){
if(dijit.typematic._obj==_3ed){
dijit.typematic.stop();
}
})];
},addMouseListener:function(node,_3f5,_3f6,_3f7,_3f8){
var dc=dojo.connect;
return [dc(node,"mousedown",this,function(evt){
dojo.stopEvent(evt);
dijit.typematic.trigger(evt,_3f5,node,_3f6,node,_3f7,_3f8);
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
dijit.typematic.trigger(evt,_3f5,node,_3f6,node,_3f7,_3f8);
setTimeout(dojo.hitch(this,dijit.typematic.stop),50);
}
})];
},addListener:function(_3ff,_400,_401,_402,_403,_404,_405){
return this.addKeyListener(_400,_401,_402,_403,_404,_405).concat(this.addMouseListener(_3ff,_402,_403,_404,_405));
}};
}
if(!dojo._hasResource["dijit._base.wai"]){
dojo._hasResource["dijit._base.wai"]=true;
dojo.provide("dijit._base.wai");
dijit.wai={onload:function(){
var div=dojo.create("div",{id:"a11yTestNode",style:{cssText:"border: 1px solid;"+"border-color:red green;"+"position: absolute;"+"height: 5px;"+"top: -999px;"+"background-image: url(\""+(dojo.config.blankGif||dojo.moduleUrl("dojo","resources/blank.gif"))+"\");"}},dojo.body());
var cs=dojo.getComputedStyle(div);
if(cs){
var _408=cs.backgroundImage;
var _409=(cs.borderTopColor==cs.borderRightColor)||(_408!=null&&(_408=="none"||_408=="url(invalid-url:)"));
dojo[_409?"addClass":"removeClass"](dojo.body(),"dijit_a11y");
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
var _40c=this.getWaiRole(elem);
return role?(_40c.indexOf(role)>-1):(_40c.length>0);
},getWaiRole:function(elem){
return dojo.trim((dojo.attr(elem,"role")||"").replace(this._XhtmlRoles,"").replace("wairole:",""));
},setWaiRole:function(elem,role){
var _410=dojo.attr(elem,"role")||"";
if(dojo.isFF<3||!this._XhtmlRoles.test(_410)){
dojo.attr(elem,"role",dojo.isFF<3?"wairole:"+role:role);
}else{
if((" "+_410+" ").indexOf(" "+role+" ")<0){
var _411=dojo.trim(_410.replace(this._XhtmlRoles,""));
var _412=dojo.trim(_410.replace(_411,""));
dojo.attr(elem,"role",_412+(_412?" ":"")+role);
}
}
},removeWaiRole:function(elem,role){
var _415=dojo.attr(elem,"role");
if(!_415){
return;
}
if(role){
var _416=dojo.isFF<3?"wairole:"+role:role;
var t=dojo.trim((" "+_415+" ").replace(" "+_416+" "," "));
dojo.attr(elem,"role",t);
}else{
elem.removeAttribute("role");
}
},hasWaiState:function(elem,_419){
if(dojo.isFF<3){
return elem.hasAttributeNS("http://www.w3.org/2005/07/aaa",_419);
}
return elem.hasAttribute?elem.hasAttribute("aria-"+_419):!!elem.getAttribute("aria-"+_419);
},getWaiState:function(elem,_41b){
if(dojo.isFF<3){
return elem.getAttributeNS("http://www.w3.org/2005/07/aaa",_41b);
}
return elem.getAttribute("aria-"+_41b)||"";
},setWaiState:function(elem,_41d,_41e){
if(dojo.isFF<3){
elem.setAttributeNS("http://www.w3.org/2005/07/aaa","aaa:"+_41d,_41e);
}else{
elem.setAttribute("aria-"+_41d,_41e);
}
},removeWaiState:function(elem,_420){
if(dojo.isFF<3){
elem.removeAttributeNS("http://www.w3.org/2005/07/aaa",_420);
}else{
elem.removeAttribute("aria-"+_420);
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
dojo.connect(dojo,"connect",function(_421,_422){
if(_421&&dojo.isFunction(_421._onConnect)){
_421._onConnect(_422);
}
});
dijit._connectOnUseEventHandler=function(_423){
};
(function(){
var _424={};
var _425=function(dc){
if(!_424[dc]){
var r=[];
var _428;
var _429=dojo.getObject(dc).prototype;
for(var _42a in _429){
if(dojo.isFunction(_429[_42a])&&(_428=_42a.match(/^_set([a-zA-Z]*)Attr$/))&&_428[1]){
r.push(_428[1].charAt(0).toLowerCase()+_428[1].substr(1));
}
}
_424[dc]=r;
}
return _424[dc]||[];
};
dojo.declare("dijit._Widget",null,{id:"",lang:"",dir:"","class":"",style:"",title:"",srcNodeRef:null,domNode:null,containerNode:null,attributeMap:{id:"",dir:"",lang:"","class":"",style:"",title:""},_deferredConnects:{onClick:"",onDblClick:"",onKeyDown:"",onKeyPress:"",onKeyUp:"",onMouseMove:"",onMouseDown:"",onMouseOut:"",onMouseOver:"",onMouseLeave:"",onMouseEnter:"",onMouseUp:""},onClick:dijit._connectOnUseEventHandler,onDblClick:dijit._connectOnUseEventHandler,onKeyDown:dijit._connectOnUseEventHandler,onKeyPress:dijit._connectOnUseEventHandler,onKeyUp:dijit._connectOnUseEventHandler,onMouseDown:dijit._connectOnUseEventHandler,onMouseMove:dijit._connectOnUseEventHandler,onMouseOut:dijit._connectOnUseEventHandler,onMouseOver:dijit._connectOnUseEventHandler,onMouseLeave:dijit._connectOnUseEventHandler,onMouseEnter:dijit._connectOnUseEventHandler,onMouseUp:dijit._connectOnUseEventHandler,_blankGif:(dojo.config.blankGif||dojo.moduleUrl("dojo","resources/blank.gif")),postscript:function(_42b,_42c){
this.create(_42b,_42c);
},create:function(_42d,_42e){
this.srcNodeRef=dojo.byId(_42e);
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
if(_42d){
this.params=_42d;
dojo.mixin(this,_42d);
}
this.postMixInProperties();
if(!this.id){
this.id=dijit.getUniqueId(this.declaredClass.replace(/\./g,"_"));
}
dijit.registry.add(this);
this.buildRendering();
if(this.domNode){
this._applyAttributes();
var _430=this.srcNodeRef;
if(_430&&_430.parentNode){
_430.parentNode.replaceChild(this.domNode,_430);
}
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
var _431=function(attr,_433){
if((_433.params&&attr in _433.params)||_433[attr]){
_433.attr(attr,_433[attr]);
}
};
for(var attr in this.attributeMap){
_431(attr,this);
}
dojo.forEach(_425(this.declaredClass),function(a){
if(!(a in this.attributeMap)){
_431(a,this);
}
},this);
},postMixInProperties:function(){
},buildRendering:function(){
this.domNode=this.srcNodeRef||dojo.create("div");
},postCreate:function(){
},startup:function(){
this._started=true;
},destroyRecursive:function(_436){
this.destroyDescendants(_436);
this.destroy(_436);
},destroy:function(_437){
this.uninitialize();
dojo.forEach(this._connects,function(_438){
dojo.forEach(_438,dojo.disconnect);
});
dojo.forEach(this._supportingWidgets||[],function(w){
if(w.destroy){
w.destroy();
}
});
this.destroyRendering(_437);
dijit.registry.remove(this.id);
},destroyRendering:function(_43a){
if(this.bgIframe){
this.bgIframe.destroy(_43a);
delete this.bgIframe;
}
if(this.domNode){
if(_43a){
dojo.removeAttr(this.domNode,"widgetId");
}else{
dojo.destroy(this.domNode);
}
delete this.domNode;
}
if(this.srcNodeRef){
if(!_43a){
dojo.destroy(this.srcNodeRef);
}
delete this.srcNodeRef;
}
},destroyDescendants:function(_43b){
dojo.forEach(this.getChildren(),function(_43c){
if(_43c.destroyRecursive){
_43c.destroyRecursive(_43b);
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
},_onConnect:function(_43e){
if(_43e in this._deferredConnects){
var _43f=this[this._deferredConnects[_43e]||"domNode"];
this.connect(_43f,_43e.toLowerCase(),_43e);
delete this._deferredConnects[_43e];
}
},_setClassAttr:function(_440){
var _441=this[this.attributeMap["class"]||"domNode"];
dojo.removeClass(_441,this["class"]);
this["class"]=_440;
dojo.addClass(_441,_440);
},_setStyleAttr:function(_442){
var _443=this[this.attributeMap["style"]||"domNode"];
if(dojo.isObject(_442)){
dojo.style(_443,_442);
}else{
if(_443.style.cssText){
_443.style.cssText+="; "+_442;
}else{
_443.style.cssText=_442;
}
}
this["style"]=_442;
},setAttribute:function(attr,_445){
dojo.deprecated(this.declaredClass+"::setAttribute() is deprecated. Use attr() instead.","","2.0");
this.attr(attr,_445);
},_attrToDom:function(attr,_447){
var _448=this.attributeMap[attr];
dojo.forEach(dojo.isArray(_448)?_448:[_448],function(_449){
var _44a=this[_449.node||_449||"domNode"];
var type=_449.type||"attribute";
switch(type){
case "attribute":
if(dojo.isFunction(_447)){
_447=dojo.hitch(this,_447);
}
if(/^on[A-Z][a-zA-Z]*$/.test(attr)){
attr=attr.toLowerCase();
}
dojo.attr(_44a,attr,_447);
break;
case "innerHTML":
_44a.innerHTML=_447;
break;
case "class":
dojo.removeClass(_44a,this[attr]);
dojo.addClass(_44a,_447);
break;
}
},this);
this[attr]=_447;
},attr:function(name,_44d){
var args=arguments.length;
if(args==1&&!dojo.isString(name)){
for(var x in name){
this.attr(x,name[x]);
}
return this;
}
var _450=this._getAttrNames(name);
if(args==2){
if(this[_450.s]){
return this[_450.s](_44d)||this;
}else{
if(name in this.attributeMap){
this._attrToDom(name,_44d);
}
this[name]=_44d;
}
return this;
}else{
if(this[_450.g]){
return this[_450.g]();
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
},getChildren:function(){
if(this.containerNode){
return dijit.findWidgets(this.containerNode);
}else{
return [];
}
},nodesWithKeyClick:["input","button"],connect:function(obj,_456,_457){
var d=dojo;
var dc=dojo.connect;
var _45a=[];
if(_456=="ondijitclick"){
if(!this.nodesWithKeyClick[obj.nodeName]){
var m=d.hitch(this,_457);
_45a.push(dc(obj,"onkeydown",this,function(e){
if(!d.isFF&&e.keyCode==d.keys.ENTER&&!e.ctrlKey&&!e.shiftKey&&!e.altKey&&!e.metaKey){
return m(e);
}else{
if(e.keyCode==d.keys.SPACE){
d.stopEvent(e);
}
}
}),dc(obj,"onkeyup",this,function(e){
if(e.keyCode==d.keys.SPACE&&!e.ctrlKey&&!e.shiftKey&&!e.altKey&&!e.metaKey){
return m(e);
}
}));
if(d.isFF){
_45a.push(dc(obj,"onkeypress",this,function(e){
if(e.keyCode==d.keys.ENTER&&!e.ctrlKey&&!e.shiftKey&&!e.altKey&&!e.metaKey){
return m(e);
}
}));
}
}
_456="onclick";
}
_45a.push(dc(obj,_456,this,_457));
this._connects.push(_45a);
return _45a;
},disconnect:function(_45f){
for(var i=0;i<this._connects.length;i++){
if(this._connects[i]==_45f){
dojo.forEach(_45f,dojo.disconnect);
this._connects.splice(i,1);
return;
}
}
},isLeftToRight:function(){
return dojo._isBodyLtr();
},isFocusable:function(){
return this.focus&&(dojo.style(this.domNode,"display")!="none");
},placeAt:function(_461,_462){
if(_461["declaredClass"]&&_461["addChild"]){
_461.addChild(this,_462);
}else{
dojo.place(this.domNode,_461,_462);
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
dojo.string.substitute=function(_46c,map,_46e,_46f){
_46f=_46f||dojo.global;
_46e=(!_46e)?function(v){
return v;
}:dojo.hitch(_46f,_46e);
return _46c.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g,function(_471,key,_473){
var _474=dojo.getObject(key,false,map);
if(_473){
_474=dojo.getObject(_473,false,_46f).call(_46f,_474,key);
}
return _46e(_474,key).toString();
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
if(!dojo._hasResource["dijit._Templated"]){
dojo._hasResource["dijit._Templated"]=true;
dojo.provide("dijit._Templated");
dojo.declare("dijit._Templated",null,{templateString:null,templatePath:null,widgetsInTemplate:false,_skipNodeCache:false,_stringRepl:function(tmpl){
var _478=this.declaredClass,_479=this;
return dojo.string.substitute(tmpl,this,function(_47a,key){
if(key.charAt(0)=="!"){
_47a=dojo.getObject(key.substr(1),false,_479);
}
if(typeof _47a=="undefined"){
throw new Error(_478+" template:"+key);
}
if(_47a==null){
return "";
}
return key.charAt(0)=="!"?_47a:_47a.toString().replace(/"/g,"&quot;");
},this);
},buildRendering:function(){
var _47c=dijit._Templated.getCachedTemplate(this.templatePath,this.templateString,this._skipNodeCache);
var node;
if(dojo.isString(_47c)){
node=dojo._toDom(this._stringRepl(_47c));
}else{
node=_47c.cloneNode(true);
}
this.domNode=node;
this._attachTemplateNodes(node);
if(this.widgetsInTemplate){
var cw=(this._supportingWidgets=dojo.parser.parse(node));
this._attachTemplateNodes(cw,function(n,p){
return n[p];
});
}
this._fillContent(this.srcNodeRef);
},_fillContent:function(_481){
var dest=this.containerNode;
if(_481&&dest){
while(_481.hasChildNodes()){
dest.appendChild(_481.firstChild);
}
}
},_attachTemplateNodes:function(_483,_484){
_484=_484||function(n,p){
return n.getAttribute(p);
};
var _487=dojo.isArray(_483)?_483:(_483.all||_483.getElementsByTagName("*"));
var x=dojo.isArray(_483)?0:-1;
for(;x<_487.length;x++){
var _489=(x==-1)?_483:_487[x];
if(this.widgetsInTemplate&&_484(_489,"dojoType")){
continue;
}
var _48a=_484(_489,"dojoAttachPoint");
if(_48a){
var _48b,_48c=_48a.split(/\s*,\s*/);
while((_48b=_48c.shift())){
if(dojo.isArray(this[_48b])){
this[_48b].push(_489);
}else{
this[_48b]=_489;
}
}
}
var _48d=_484(_489,"dojoAttachEvent");
if(_48d){
var _48e,_48f=_48d.split(/\s*,\s*/);
var trim=dojo.trim;
while((_48e=_48f.shift())){
if(_48e){
var _491=null;
if(_48e.indexOf(":")!=-1){
var _492=_48e.split(":");
_48e=trim(_492[0]);
_491=trim(_492[1]);
}else{
_48e=trim(_48e);
}
if(!_491){
_491=_48e;
}
this.connect(_489,_48e,_491);
}
}
}
var role=_484(_489,"waiRole");
if(role){
dijit.setWaiRole(_489,role);
}
var _494=_484(_489,"waiState");
if(_494){
dojo.forEach(_494.split(/\s*,\s*/),function(_495){
if(_495.indexOf("-")!=-1){
var pair=_495.split("-");
dijit.setWaiState(_489,pair[0],pair[1]);
}
});
}
}
}});
dijit._Templated._templateCache={};
dijit._Templated.getCachedTemplate=function(_497,_498,_499){
var _49a=dijit._Templated._templateCache;
var key=_498||_497;
var _49c=_49a[key];
if(_49c){
if(!_49c.ownerDocument||_49c.ownerDocument==dojo.doc){
return _49c;
}
dojo.destroy(_49c);
}
if(!_498){
_498=dijit._Templated._sanitizeTemplateString(dojo.trim(dojo._getText(_497)));
}
_498=dojo.string.trim(_498);
if(_499||_498.match(/\$\{([^\}]+)\}/g)){
return (_49a[key]=_498);
}else{
return (_49a[key]=dojo._toDom(_498));
}
};
dijit._Templated._sanitizeTemplateString=function(_49d){
if(_49d){
_49d=_49d.replace(/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,"");
var _49e=_49d.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
if(_49e){
_49d=_49e[1];
}
}else{
_49d="";
}
return _49d;
};
if(dojo.isIE){
dojo.addOnWindowUnload(function(){
var _49f=dijit._Templated._templateCache;
for(var key in _49f){
var _4a1=_49f[key];
if(!isNaN(_4a1.nodeType)){
dojo.destroy(_4a1);
}
delete _49f[key];
}
});
}
dojo.extend(dijit._Widget,{dojoAttachEvent:"",dojoAttachPoint:"",waiRole:"",waiState:""});
}
if(!dojo._hasResource["dijit.form._FormMixin"]){
dojo._hasResource["dijit.form._FormMixin"]=true;
dojo.provide("dijit.form._FormMixin");
dojo.declare("dijit.form._FormMixin",null,{reset:function(){
dojo.forEach(this.getDescendants(),function(_4a2){
if(_4a2.reset){
_4a2.reset();
}
});
},validate:function(){
var _4a3=false;
return dojo.every(dojo.map(this.getDescendants(),function(_4a4){
_4a4._hasBeenBlurred=true;
var _4a5=_4a4.disabled||!_4a4.validate||_4a4.validate();
if(!_4a5&&!_4a3){
dijit.scrollIntoView(_4a4.containerNode||_4a4.domNode);
_4a4.focus();
_4a3=true;
}
return _4a5;
}),function(item){
return item;
});
},setValues:function(val){
dojo.deprecated(this.declaredClass+"::setValues() is deprecated. Use attr('value', val) instead.","","2.0");
return this.attr("value",val);
},_setValueAttr:function(obj){
var map={};
dojo.forEach(this.getDescendants(),function(_4aa){
if(!_4aa.name){
return;
}
var _4ab=map[_4aa.name]||(map[_4aa.name]=[]);
_4ab.push(_4aa);
});
for(var name in map){
if(!map.hasOwnProperty(name)){
continue;
}
var _4ad=map[name],_4ae=dojo.getObject(name,false,obj);
if(_4ae===undefined){
continue;
}
if(!dojo.isArray(_4ae)){
_4ae=[_4ae];
}
if(typeof _4ad[0].checked=="boolean"){
dojo.forEach(_4ad,function(w,i){
w.attr("value",dojo.indexOf(_4ae,w.value)!=-1);
});
}else{
if(_4ad[0]._multiValue){
_4ad[0].attr("value",_4ae);
}else{
dojo.forEach(_4ad,function(w,i){
w.attr("value",_4ae[i]);
});
}
}
}
},getValues:function(){
dojo.deprecated(this.declaredClass+"::getValues() is deprecated. Use attr('value') instead.","","2.0");
return this.attr("value");
},_getValueAttr:function(){
var obj={};
dojo.forEach(this.getDescendants(),function(_4b4){
var name=_4b4.name;
if(!name||_4b4.disabled){
return;
}
var _4b6=_4b4.attr("value");
if(typeof _4b4.checked=="boolean"){
if(/Radio/.test(_4b4.declaredClass)){
if(_4b6!==false){
dojo.setObject(name,_4b6,obj);
}else{
_4b6=dojo.getObject(name,false,obj);
if(_4b6===undefined){
dojo.setObject(name,null,obj);
}
}
}else{
var ary=dojo.getObject(name,false,obj);
if(!ary){
ary=[];
dojo.setObject(name,ary,obj);
}
if(_4b6!==false){
ary.push(_4b6);
}
}
}else{
dojo.setObject(name,_4b6,obj);
}
});
return obj;
},isValid:function(){
this._invalidWidgets=dojo.filter(this.getDescendants(),function(_4b8){
return !_4b8.disabled&&_4b8.isValid&&!_4b8.isValid();
});
return !this._invalidWidgets.length;
},onValidStateChange:function(_4b9){
},_widgetChange:function(_4ba){
var _4bb=this._lastValidState;
if(!_4ba||this._lastValidState===undefined){
_4bb=this.isValid();
if(this._lastValidState===undefined){
this._lastValidState=_4bb;
}
}else{
if(_4ba.isValid){
this._invalidWidgets=dojo.filter(this._invalidWidgets||[],function(w){
return (w!=_4ba);
},this);
if(!_4ba.isValid()&&!_4ba.attr("disabled")){
this._invalidWidgets.push(_4ba);
}
_4bb=(this._invalidWidgets.length===0);
}
}
if(_4bb!==this._lastValidState){
this._lastValidState=_4bb;
this.onValidStateChange(_4bb);
}
},connectChildren:function(){
dojo.forEach(this._changeConnections,dojo.hitch(this,"disconnect"));
var _4bd=this;
var _4be=this._changeConnections=[];
dojo.forEach(dojo.filter(this.getDescendants(),function(item){
return item.validate;
}),function(_4c0){
_4be.push(_4bd.connect(_4c0,"validate",dojo.hitch(_4bd,"_widgetChange",_4c0)));
_4be.push(_4bd.connect(_4c0,"_setDisabledAttr",dojo.hitch(_4bd,"_widgetChange",_4c0)));
});
this._widgetChange(null);
},startup:function(){
this.inherited(arguments);
this._changeConnections=[];
this.connectChildren();
}});
}
if(!dojo._hasResource["dijit._DialogMixin"]){
dojo._hasResource["dijit._DialogMixin"]=true;
dojo.provide("dijit._DialogMixin");
dojo.declare("dijit._DialogMixin",null,{attributeMap:dijit._Widget.prototype.attributeMap,execute:function(_4c1){
},onCancel:function(){
},onExecute:function(){
},_onSubmit:function(){
this.onExecute();
this.execute(this.attr("value"));
},_getFocusItems:function(_4c2){
var _4c3=dijit._getTabNavigable(dojo.byId(_4c2));
this._firstFocusItem=_4c3.lowest||_4c3.first||_4c2;
this._lastFocusItem=_4c3.last||_4c3.highest||this._firstFocusItem;
if(dojo.isMoz&&this._firstFocusItem.tagName.toLowerCase()=="input"&&dojo.attr(this._firstFocusItem,"type").toLowerCase()=="file"){
dojo.attr(_4c2,"tabindex","0");
this._firstFocusItem=_4c2;
}
}});
}
if(!dojo._hasResource["dijit.DialogUnderlay"]){
dojo._hasResource["dijit.DialogUnderlay"]=true;
dojo.provide("dijit.DialogUnderlay");
dojo.declare("dijit.DialogUnderlay",[dijit._Widget,dijit._Templated],{templateString:"<div class='dijitDialogUnderlayWrapper'><div class='dijitDialogUnderlay' dojoAttachPoint='node'></div></div>",dialogId:"","class":"",attributeMap:{id:"domNode"},_setDialogIdAttr:function(id){
dojo.attr(this.node,"id",id+"_underlay");
},_setClassAttr:function(_4c5){
this.node.className="dijitDialogUnderlay "+_4c5;
},postCreate:function(){
dojo.body().appendChild(this.domNode);
this.bgIframe=new dijit.BackgroundIframe(this.domNode);
},layout:function(){
var is=this.node.style,os=this.domNode.style;
os.display="none";
var _4c8=dijit.getViewport();
os.top=_4c8.t+"px";
os.left=_4c8.l+"px";
is.width=_4c8.w+"px";
is.height=_4c8.h+"px";
os.display="block";
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
}
if(!dojo._hasResource["dijit._Contained"]){
dojo._hasResource["dijit._Contained"]=true;
dojo.provide("dijit._Contained");
dojo.declare("dijit._Contained",null,{getParent:function(){
for(var p=this.domNode.parentNode;p;p=p.parentNode){
var id=p.getAttribute&&p.getAttribute("widgetId");
if(id){
var _4cb=dijit.byId(id);
return _4cb.isContainer?_4cb:null;
}
}
return null;
},_getSibling:function(_4cc){
var node=this.domNode;
do{
node=node[_4cc+"Sibling"];
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
}
if(!dojo._hasResource["dijit._Container"]){
dojo._hasResource["dijit._Container"]=true;
dojo.provide("dijit._Container");
dojo.declare("dijit._Container",null,{isContainer:true,buildRendering:function(){
this.inherited(arguments);
if(!this.containerNode){
this.containerNode=this.domNode;
}
},addChild:function(_4d0,_4d1){
var _4d2=this.containerNode;
if(_4d1&&typeof _4d1=="number"){
var _4d3=this.getChildren();
if(_4d3&&_4d3.length>=_4d1){
_4d2=_4d3[_4d1-1].domNode;
_4d1="after";
}
}
dojo.place(_4d0.domNode,_4d2,_4d1);
if(this._started&&!_4d0._started){
_4d0.startup();
}
},removeChild:function(_4d4){
if(typeof _4d4=="number"&&_4d4>0){
_4d4=this.getChildren()[_4d4];
}
if(!_4d4||!_4d4.domNode){
return;
}
var node=_4d4.domNode;
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
},destroyDescendants:function(_4d8){
dojo.forEach(this.getChildren(),function(_4d9){
_4d9.destroyRecursive(_4d8);
});
},_getSiblingOfChild:function(_4da,dir){
var node=_4da.domNode;
var _4dd=(dir>0?"nextSibling":"previousSibling");
do{
node=node[_4dd];
}while(node&&(node.nodeType!=1||!dijit.byNode(node)));
return node?dijit.byNode(node):null;
},getIndexOfChild:function(_4de){
var _4df=this.getChildren();
for(var i=0,c;c=_4df[i];i++){
if(c==_4de){
return i;
}
}
return -1;
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
dojo.forEach(this.getChildren(),function(_4e2){
_4e2.startup();
});
if(!this.getParent||!this.getParent()){
this.resize();
this._viewport=dijit.getViewport();
this.connect(dojo.global,"onresize",function(){
var _4e3=dijit.getViewport();
if(_4e3.w!=this._viewport.w||_4e3.h!=this._viewport.h){
this._viewport=_4e3;
this.resize();
}
});
}
this.inherited(arguments);
},resize:function(_4e4,_4e5){
var node=this.domNode;
if(_4e4){
dojo.marginBox(node,_4e4);
if(_4e4.t){
node.style.top=_4e4.t+"px";
}
if(_4e4.l){
node.style.left=_4e4.l+"px";
}
}
var mb=_4e5||{};
dojo.mixin(mb,_4e4||{});
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
},_setupChild:function(_4ed){
dojo.addClass(_4ed.domNode,this.baseClass+"-child");
if(_4ed.baseClass){
dojo.addClass(_4ed.domNode,this.baseClass+"-"+_4ed.baseClass);
}
},addChild:function(_4ee,_4ef){
this.inherited(arguments);
if(this._started){
this._setupChild(_4ee);
}
},removeChild:function(_4f0){
dojo.removeClass(_4f0.domNode,this.baseClass+"-child");
if(_4f0.baseClass){
dojo.removeClass(_4f0.domNode,this.baseClass+"-"+_4f0.baseClass);
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
var _4f6=function(word){
return word.substring(0,1).toUpperCase()+word.substring(1);
};
var size=function(_4f9,dim){
_4f9.resize?_4f9.resize(dim):dojo.marginBox(_4f9.domNode,dim);
dojo.mixin(_4f9,dojo.marginBox(_4f9.domNode));
dojo.mixin(_4f9,dim);
};
dijit.layout.layoutChildren=function(_4fb,dim,_4fd){
dim=dojo.mixin({},dim);
dojo.addClass(_4fb,"dijitLayoutContainer");
_4fd=dojo.filter(_4fd,function(item){
return item.layoutAlign!="client";
}).concat(dojo.filter(_4fd,function(item){
return item.layoutAlign=="client";
}));
dojo.forEach(_4fd,function(_500){
var elm=_500.domNode,pos=_500.layoutAlign;
var _503=elm.style;
_503.left=dim.l+"px";
_503.top=dim.t+"px";
_503.bottom=_503.right="auto";
dojo.addClass(elm,"dijitAlign"+_4f6(pos));
if(pos=="top"||pos=="bottom"){
size(_500,{w:dim.w});
dim.h-=_500.h;
if(pos=="top"){
dim.t+=_500.h;
}else{
_503.top=dim.t+dim.h+"px";
}
}else{
if(pos=="left"||pos=="right"){
size(_500,{h:dim.h});
dim.w-=_500.w;
if(pos=="left"){
dim.l+=_500.w;
}else{
_503.left=dim.l+dim.w+"px";
}
}else{
if(pos=="client"){
size(_500,dim);
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
var _504=0;
dojo.html._secureForInnerHtml=function(cont){
return cont.replace(/(?:\s*<!DOCTYPE\s[^>]+>|<title[^>]*>[\s\S]*?<\/title>)/ig,"");
};
dojo.html._emptyNode=dojo.empty;
dojo.html._setNodeContent=function(node,cont,_508){
if(_508){
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
dojo.declare("dojo.html._ContentSetter",null,{node:"",content:"",id:"",cleanContent:false,extractContent:false,parseContent:false,constructor:function(_510,node){
dojo.mixin(this,_510||{});
node=this.node=dojo.byId(this.node||node);
if(!this.id){
this.id=["Setter",(node)?node.id||node.tagName:"",_504++].join("_");
}
if(!(this.node||node)){
new Error(this.declaredClass+": no node provided to "+this.id);
}
},set:function(cont,_513){
if(undefined!==cont){
this.content=cont;
}
if(_513){
this._mixin(_513);
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
var _515=this.onContentError(e);
try{
node.innerHTML=_515;
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
var _518=cont.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
if(_518){
cont=_518[1];
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
},_mixin:function(_51a){
var _51b={},key;
for(key in _51a){
if(key in _51b){
continue;
}
this[key]=_51a[key];
}
},_parse:function(){
var _51d=this.node;
try{
this.parseResults=dojo.parser.parse(_51d,true);
}
catch(e){
this._onError("Content",e,"Error parsing in _ContentSetter#"+this.id);
}
},_onError:function(type,err,_520){
var _521=this["on"+type+"Error"].call(this,err);
if(_520){
console.error(_520,err);
}else{
if(_521){
dojo.html._setNodeContent(this.node,_521,true);
}
}
}});
dojo.html.set=function(node,cont,_524){
if(undefined==cont){
console.warn("dojo.html.set: no cont argument provided, using empty string");
cont="";
}
if(!_524){
return dojo.html._setNodeContent(node,cont,true);
}else{
var op=new dojo.html._ContentSetter(dojo.mixin(_524,{content:cont,node:node}));
return op.set();
}
};
})();
}
if(!dojo._hasResource["dojo.i18n"]){
dojo._hasResource["dojo.i18n"]=true;
dojo.provide("dojo.i18n");
dojo.i18n.getLocalization=function(_526,_527,_528){
_528=dojo.i18n.normalizeLocale(_528);
var _529=_528.split("-");
var _52a=[_526,"nls",_527].join(".");
var _52b=dojo._loadedModules[_52a];
if(_52b){
var _52c;
for(var i=_529.length;i>0;i--){
var loc=_529.slice(0,i).join("_");
if(_52b[loc]){
_52c=_52b[loc];
break;
}
}
if(!_52c){
_52c=_52b.ROOT;
}
if(_52c){
var _52f=function(){
};
_52f.prototype=_52c;
return new _52f();
}
}
throw new Error("Bundle not found: "+_527+" in "+_526+" , locale="+_528);
};
dojo.i18n.normalizeLocale=function(_530){
var _531=_530?_530.toLowerCase():dojo.locale;
if(_531=="root"){
_531="ROOT";
}
return _531;
};
dojo.i18n._requireLocalization=function(_532,_533,_534,_535){
var _536=dojo.i18n.normalizeLocale(_534);
var _537=[_532,"nls",_533].join(".");
var _538="";
if(_535){
var _539=_535.split(",");
for(var i=0;i<_539.length;i++){
if(_536["indexOf"](_539[i])==0){
if(_539[i].length>_538.length){
_538=_539[i];
}
}
}
if(!_538){
_538="ROOT";
}
}
var _53b=_535?_538:_536;
var _53c=dojo._loadedModules[_537];
var _53d=null;
if(_53c){
if(dojo.config.localizationComplete&&_53c._built){
return;
}
var _53e=_53b.replace(/-/g,"_");
var _53f=_537+"."+_53e;
_53d=dojo._loadedModules[_53f];
}
if(!_53d){
_53c=dojo["provide"](_537);
var syms=dojo._getModuleSymbols(_532);
var _541=syms.concat("nls").join("/");
var _542;
dojo.i18n._searchLocalePath(_53b,_535,function(loc){
var _544=loc.replace(/-/g,"_");
var _545=_537+"."+_544;
var _546=false;
if(!dojo._loadedModules[_545]){
dojo["provide"](_545);
var _547=[_541];
if(loc!="ROOT"){
_547.push(loc);
}
_547.push(_533);
var _548=_547.join("/")+".js";
_546=dojo._loadPath(_548,null,function(hash){
var _54a=function(){
};
_54a.prototype=_542;
_53c[_544]=new _54a();
for(var j in hash){
_53c[_544][j]=hash[j];
}
});
}else{
_546=true;
}
if(_546&&_53c[_544]){
_542=_53c[_544];
}else{
_53c[_544]=_542;
}
if(_535){
return true;
}
});
}
if(_535&&_536!=_538){
_53c[_536.replace(/-/g,"_")]=_53c[_538.replace(/-/g,"_")];
}
};
(function(){
var _54c=dojo.config.extraLocale;
if(_54c){
if(!_54c instanceof Array){
_54c=[_54c];
}
var req=dojo.i18n._requireLocalization;
dojo.i18n._requireLocalization=function(m,b,_550,_551){
req(m,b,_550,_551);
if(_550){
return;
}
for(var i=0;i<_54c.length;i++){
req(m,b,_54c[i],_551);
}
};
}
})();
dojo.i18n._searchLocalePath=function(_553,down,_555){
_553=dojo.i18n.normalizeLocale(_553);
var _556=_553.split("-");
var _557=[];
for(var i=_556.length;i>0;i--){
_557.push(_556.slice(0,i).join("-"));
}
_557.push(false);
if(down){
_557.reverse();
}
for(var j=_557.length-1;j>=0;j--){
var loc=_557[j]||"ROOT";
var stop=_555(loc);
if(stop){
break;
}
}
};
dojo.i18n._preloadLocalizations=function(_55c,_55d){
function _55e(_55f){
_55f=dojo.i18n.normalizeLocale(_55f);
dojo.i18n._searchLocalePath(_55f,true,function(loc){
for(var i=0;i<_55d.length;i++){
if(_55d[i]==loc){
dojo["require"](_55c+"_"+loc);
return true;
}
}
return false;
});
};
_55e();
var _562=dojo.config.extraLocale||[];
for(var i=0;i<_562.length;i++){
_55e(_562[i]);
}
};
}
if(!dojo._hasResource["dijit.layout.ContentPane"]){
dojo._hasResource["dijit.layout.ContentPane"]=true;
dojo.provide("dijit.layout.ContentPane");
dojo.declare("dijit.layout.ContentPane",dijit._Widget,{href:"",extractContent:false,parseOnLoad:true,preventCache:false,preload:false,refreshOnShow:false,loadingMessage:"<span class='dijitContentPaneLoading'>${loadingState}</span>",errorMessage:"<span class='dijitContentPaneError'>${errorState}</span>",isLoaded:false,baseClass:"dijitContentPane",doLayout:true,ioArgs:{},isContainer:true,postMixInProperties:function(){
this.inherited(arguments);
var _564=dojo.i18n.getLocalization("dijit","loading",this.lang);
this.loadingMessage=dojo.string.substitute(this.loadingMessage,_564);
this.errorMessage=dojo.string.substitute(this.errorMessage,_564);
if(!this.href&&this.srcNodeRef&&this.srcNodeRef.innerHTML){
this.isLoaded=true;
}
},buildRendering:function(){
this.inherited(arguments);
if(!this.containerNode){
this.containerNode=this.domNode;
}
},postCreate:function(){
this.domNode.title="";
if(!dojo.attr(this.domNode,"role")){
dijit.setWaiRole(this.domNode,"group");
}
dojo.addClass(this.domNode,this.baseClass);
},startup:function(){
if(this._started){
return;
}
if(this.isLoaded){
dojo.forEach(this.getChildren(),function(_565){
_565.startup();
});
if(this.doLayout){
this._checkIfSingleChild();
}
if(!this._singleChild||!dijit._Contained.prototype.getParent.call(this)){
this._scheduleLayout();
}
}
this._loadCheck();
this.inherited(arguments);
},_checkIfSingleChild:function(){
var _566=dojo.query(">",this.containerNode),_567=_566.filter(function(node){
return dojo.hasAttr(node,"dojoType")||dojo.hasAttr(node,"widgetId");
}),_569=dojo.filter(_567.map(dijit.byNode),function(_56a){
return _56a&&_56a.domNode&&_56a.resize;
});
if(_566.length==_567.length&&_569.length==1){
this._singleChild=_569[0];
}else{
delete this._singleChild;
}
},setHref:function(href){
dojo.deprecated("dijit.layout.ContentPane.setHref() is deprecated. Use attr('href', ...) instead.","","2.0");
return this.attr("href",href);
},_setHrefAttr:function(href){
this.cancel();
this.href=href;
if(this._created&&(this.preload||this._isShown())){
return this.refresh();
}else{
this._hrefChanged=true;
}
},setContent:function(data){
dojo.deprecated("dijit.layout.ContentPane.setContent() is deprecated.  Use attr('content', ...) instead.","","2.0");
this.attr("content",data);
},_setContentAttr:function(data){
this.href="";
this.cancel();
this._setContent(data||"");
this._isDownloaded=false;
},_getContentAttr:function(){
return this.containerNode.innerHTML;
},cancel:function(){
if(this._xhrDfd&&(this._xhrDfd.fired==-1)){
this._xhrDfd.cancel();
}
delete this._xhrDfd;
},uninitialize:function(){
if(this._beingDestroyed){
this.cancel();
}
},destroyRecursive:function(_56f){
if(this._beingDestroyed){
return;
}
this._beingDestroyed=true;
this.inherited(arguments);
},resize:function(size){
dojo.marginBox(this.domNode,size);
var node=this.containerNode,mb=dojo.mixin(dojo.marginBox(node),size||{});
var cb=(this._contentBox=dijit.layout.marginBox2contentBox(node,mb));
if(this._singleChild&&this._singleChild.resize){
this._singleChild.resize({w:cb.w,h:cb.h});
}
},_isShown:function(){
if("open" in this){
return this.open;
}else{
var node=this.domNode;
return (node.style.display!="none")&&(node.style.visibility!="hidden")&&!dojo.hasClass(node,"dijitHidden");
}
},_onShow:function(){
if(this._needLayout){
this._layoutChildren();
}
this._loadCheck();
if(this.onShow){
this.onShow();
}
},_loadCheck:function(){
if((this.href&&!this._xhrDfd)&&(!this.isLoaded||this._hrefChanged||this.refreshOnShow)&&(this.preload||this._isShown())){
delete this._hrefChanged;
this.refresh();
}
},refresh:function(){
this.cancel();
this._setContent(this.onDownloadStart(),true);
var self=this;
var _576={preventCache:(this.preventCache||this.refreshOnShow),url:this.href,handleAs:"text"};
if(dojo.isObject(this.ioArgs)){
dojo.mixin(_576,this.ioArgs);
}
var hand=(this._xhrDfd=(this.ioMethod||dojo.xhrGet)(_576));
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
},_onLoadHandler:function(data){
this.isLoaded=true;
try{
this.onLoad(data);
}
catch(e){
console.error("Error "+this.widgetId+" running custom onLoad code: "+e.message);
}
},_onUnloadHandler:function(){
this.isLoaded=false;
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
var _57b=this._contentSetter;
dojo.forEach(this.getChildren(),function(_57c){
if(_57c.destroyRecursive){
_57c.destroyRecursive();
}
});
if(_57b){
dojo.forEach(_57b.parseResults,function(_57d){
if(_57d.destroyRecursive&&_57d.domNode&&_57d.domNode.parentNode==dojo.body()){
_57d.destroyRecursive();
}
});
delete _57b.parseResults;
}
dojo.html._emptyNode(this.containerNode);
},_setContent:function(cont,_57f){
this.destroyDescendants();
delete this._singleChild;
var _580=this._contentSetter;
if(!(_580&&_580 instanceof dojo.html._ContentSetter)){
_580=this._contentSetter=new dojo.html._ContentSetter({node:this.containerNode,_onError:dojo.hitch(this,this._onError),onContentError:dojo.hitch(this,function(e){
var _582=this.onContentError(e);
try{
this.containerNode.innerHTML=_582;
}
catch(e){
console.error("Fatal "+this.id+" could not change content due to "+e.message,e);
}
})});
}
var _583=dojo.mixin({cleanContent:this.cleanContent,extractContent:this.extractContent,parseContent:this.parseOnLoad},this._contentSetterParams||{});
dojo.mixin(_580,_583);
_580.set((dojo.isObject(cont)&&cont.domNode)?cont.domNode:cont);
delete this._contentSetterParams;
if(!_57f){
dojo.forEach(this.getChildren(),function(_584){
_584.startup();
});
if(this.doLayout){
this._checkIfSingleChild();
}
this._scheduleLayout();
this._onLoadHandler(cont);
}
},_onError:function(type,err,_587){
var _588=this["on"+type+"Error"].call(this,err);
if(_587){
console.error(_587,err);
}else{
if(_588){
this._setContent(_588,true);
}
}
},_scheduleLayout:function(){
if(this._isShown()){
this._layoutChildren();
}else{
this._needLayout=true;
}
},_layoutChildren:function(){
if(this._singleChild&&this._singleChild.resize){
var cb=this._contentBox||dojo.contentBox(this.containerNode);
this._singleChild.resize({w:cb.w,h:cb.h});
}else{
dojo.forEach(this.getChildren(),function(_58a){
if(_58a.resize){
_58a.resize();
}
});
}
delete this._needLayout;
},onLoad:function(data){
},onUnload:function(){
},onDownloadStart:function(){
return this.loadingMessage;
},onContentError:function(_58c){
},onDownloadError:function(_58d){
return this.errorMessage;
},onDownloadEnd:function(){
}});
}
if(!dojo._hasResource["dijit.TooltipDialog"]){
dojo._hasResource["dijit.TooltipDialog"]=true;
dojo.provide("dijit.TooltipDialog");
dojo.declare("dijit.TooltipDialog",[dijit.layout.ContentPane,dijit._Templated,dijit.form._FormMixin,dijit._DialogMixin],{title:"",doLayout:false,autofocus:true,baseClass:"dijitTooltipDialog",_firstFocusItem:null,_lastFocusItem:null,templateString:null,templateString:"<div waiRole=\"presentation\">\r\n\t<div class=\"dijitTooltipContainer\" waiRole=\"presentation\">\r\n\t\t<div class =\"dijitTooltipContents dijitTooltipFocusNode\" dojoAttachPoint=\"containerNode\" tabindex=\"-1\" waiRole=\"dialog\"></div>\r\n\t</div>\r\n\t<div class=\"dijitTooltipConnector\" waiRole=\"presentation\"></div>\r\n</div>\r\n",postCreate:function(){
this.inherited(arguments);
this.connect(this.containerNode,"onkeypress","_onKey");
this.containerNode.title=this.title;
},orient:function(node,_58f,_590){
var c=this._currentOrientClass;
if(c){
dojo.removeClass(this.domNode,c);
}
c="dijitTooltipAB"+(_590.charAt(1)=="L"?"Left":"Right")+" dijitTooltip"+(_590.charAt(0)=="T"?"Below":"Above");
dojo.addClass(this.domNode,c);
this._currentOrientClass=c;
},onOpen:function(pos){
this.orient(this.domNode,pos.aroundCorner,pos.corner);
this._onShow();
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
var _596=(this._firstFocusItem==this._lastFocusItem);
if(evt.charOrCode==dk.ESCAPE){
this.onCancel();
dojo.stopEvent(evt);
}else{
if(node==this._firstFocusItem&&evt.shiftKey&&evt.charOrCode===dk.TAB){
if(!_596){
dijit.focus(this._lastFocusItem);
}
dojo.stopEvent(evt);
}else{
if(node==this._lastFocusItem&&evt.charOrCode===dk.TAB&&!evt.shiftKey){
if(!_596){
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
dojo.declare("dijit.Dialog",[dijit.layout.ContentPane,dijit._Templated,dijit.form._FormMixin,dijit._DialogMixin],{templateString:null,templateString:"<div class=\"dijitDialog\" tabindex=\"-1\" waiRole=\"dialog\" waiState=\"labelledby-${id}_title\">\r\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\">\r\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\" id=\"${id}_title\"></span>\r\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel, onmouseenter: _onCloseEnter, onmouseleave: _onCloseLeave\" title=\"${buttonCancel}\">\r\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\" title=\"${buttonCancel}\">x</span>\r\n\t</span>\r\n\t</div>\r\n\t\t<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\"></div>\r\n</div>\r\n",attributeMap:dojo.delegate(dijit._Widget.prototype.attributeMap,{title:[{node:"titleNode",type:"innerHTML"},{node:"titleBar",type:"attribute"}]}),open:false,duration:dijit.defaultDuration,refocus:true,autofocus:true,_firstFocusItem:null,_lastFocusItem:null,doLayout:false,draggable:true,_fixSizes:true,postMixInProperties:function(){
var _597=dojo.i18n.getLocalization("dijit","common");
dojo.mixin(this,_597);
this.inherited(arguments);
},postCreate:function(){
dojo.style(this.domNode,{visibility:"hidden",position:"absolute",display:"",top:"-9999px"});
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
var _59c={dialogId:this.id,"class":dojo.map(this["class"].split(/\s/),function(s){
return s+"_underlay";
}).join(" ")};
var _59e=dijit._underlay;
if(!_59e){
_59e=dijit._underlay=new dijit.DialogUnderlay(_59c);
}
this._fadeIn=dojo.fadeIn({node:node,duration:this.duration,beforeBegin:function(){
_59e.attr(_59c);
_59e.show();
},onEnd:dojo.hitch(this,function(){
if(this.autofocus){
this._getFocusItems(this.domNode);
dijit.focus(this._firstFocusItem);
}
})});
this._fadeOut=dojo.fadeOut({node:node,duration:this.duration,onEnd:function(){
node.style.visibility="hidden";
node.style.top="-9999px";
dijit._underlay.hide();
}});
},uninitialize:function(){
var _59f=false;
if(this._fadeIn&&this._fadeIn.status()=="playing"){
_59f=true;
this._fadeIn.stop();
}
if(this._fadeOut&&this._fadeOut.status()=="playing"){
_59f=true;
this._fadeOut.stop();
}
if(this.open||_59f){
dijit._underlay.hide();
}
if(this._moveable){
this._moveable.destroy();
}
},_size:function(){
var mb=dojo.marginBox(this.domNode);
var _5a1=dijit.getViewport();
if(mb.w>=_5a1.w||mb.h>=_5a1.h){
dojo.style(this.containerNode,{width:Math.min(mb.w,Math.floor(_5a1.w*0.75))+"px",height:Math.min(mb.h,Math.floor(_5a1.h*0.75))+"px",overflow:"auto",position:"relative"});
}
},_position:function(){
if(!dojo.hasClass(dojo.body(),"dojoMove")){
var node=this.domNode;
var _5a3=dijit.getViewport();
var p=this._relativePosition;
var mb=p?null:dojo.marginBox(node);
dojo.style(node,{left:Math.floor(_5a3.l+(p?p.l:(_5a3.w-mb.w)/2))+"px",top:Math.floor(_5a3.t+(p?p.t:(_5a3.h-mb.h)/2))+"px"});
}
},_onKey:function(evt){
if(evt.charOrCode){
var dk=dojo.keys;
var node=evt.target;
if(evt.charOrCode===dk.TAB){
this._getFocusItems(this.domNode);
}
var _5a9=(this._firstFocusItem==this._lastFocusItem);
if(node==this._firstFocusItem&&evt.shiftKey&&evt.charOrCode===dk.TAB){
if(!_5a9){
dijit.focus(this._lastFocusItem);
}
dojo.stopEvent(evt);
}else{
if(node==this._lastFocusItem&&evt.charOrCode===dk.TAB&&!evt.shiftKey){
if(!_5a9){
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
this._modalconnects.push(dojo.connect(window,"onresize",this,function(){
var _5aa=dijit.getViewport();
if(!this._oldViewport||_5aa.h!=this._oldViewport.h||_5aa.w!=this._oldViewport.w){
this.layout();
this._oldViewport=_5aa;
}
}));
this._modalconnects.push(dojo.connect(dojo.doc.documentElement,"onkeypress",this,"_onKey"));
dojo.style(this.domNode,{opacity:0,visibility:""});
if(this._fixSizes){
dojo.style(this.containerNode,{width:"auto",height:"auto"});
}
this.open=true;
this._onShow();
this._size();
this._position();
this._fadeIn.play();
this._savedFocus=dijit.getFocus(this);
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
dijit._underlay.layout();
this._position();
}
},destroy:function(){
dojo.forEach(this._modalconnects,dojo.disconnect);
if(this.refocus&&this.open){
setTimeout(dojo.hitch(dijit,"focus",this._savedFocus),25);
}
this.inherited(arguments);
},_onCloseEnter:function(){
dojo.addClass(this.closeButtonNode,"dijitDialogCloseIcon-hover");
},_onCloseLeave:function(){
dojo.removeClass(this.closeButtonNode,"dijitDialogCloseIcon-hover");
}});
}
if(!dojo._hasResource["dijit.form._FormWidget"]){
dojo._hasResource["dijit.form._FormWidget"]=true;
dojo.provide("dijit.form._FormWidget");
dojo.declare("dijit.form._FormWidget",[dijit._Widget,dijit._Templated],{baseClass:"",name:"",alt:"",value:"",type:"text",tabIndex:"0",disabled:false,readOnly:false,intermediateChanges:false,scrollOnFocus:true,attributeMap:dojo.delegate(dijit._Widget.prototype.attributeMap,{value:"focusNode",disabled:"focusNode",readOnly:"focusNode",id:"focusNode",tabIndex:"focusNode",alt:"focusNode"}),postMixInProperties:function(){
this.nameAttrSetting=this.name?("name='"+this.name+"'"):"";
this.inherited(arguments);
},_setDisabledAttr:function(_5ab){
this.disabled=_5ab;
dojo.attr(this.focusNode,"disabled",_5ab);
dijit.setWaiState(this.focusNode,"disabled",_5ab);
if(_5ab){
this._hovering=false;
this._active=false;
this.focusNode.removeAttribute("tabIndex");
}else{
this.focusNode.setAttribute("tabIndex",this.tabIndex);
}
this._setStateClass();
},setDisabled:function(_5ac){
dojo.deprecated("setDisabled("+_5ac+") is deprecated. Use attr('disabled',"+_5ac+") instead.","","2.0");
this.attr("disabled",_5ac);
},_onFocus:function(e){
if(this.scrollOnFocus){
dijit.scrollIntoView(this.domNode);
}
this.inherited(arguments);
},_onMouse:function(_5ae){
var _5af=_5ae.currentTarget;
if(_5af&&_5af.getAttribute){
this.stateModifier=_5af.getAttribute("stateModifier")||"";
}
if(!this.disabled){
switch(_5ae.type){
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
var _5b0=this.connect(dojo.body(),"onmouseup",function(){
if(this._mouseDown&&this.isFocusable()){
this.focus();
}
this._active=false;
this._mouseDown=false;
this._setStateClass();
this.disconnect(_5b0);
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
var _5b1=this.baseClass.split(" ");
function _5b2(_5b3){
_5b1=_5b1.concat(dojo.map(_5b1,function(c){
return c+_5b3;
}),"dijit"+_5b3);
};
if(this.checked){
_5b2("Checked");
}
if(this.state){
_5b2(this.state);
}
if(this.selected){
_5b2("Selected");
}
if(this.disabled){
_5b2("Disabled");
}else{
if(this.readOnly){
_5b2("ReadOnly");
}else{
if(this._active){
_5b2(this.stateModifier+"Active");
}else{
if(this._focused){
_5b2("Focused");
}
if(this._hovering){
_5b2(this.stateModifier+"Hover");
}
}
}
}
var tn=this.stateNode||this.domNode,_5b6={};
dojo.forEach(tn.className.split(" "),function(c){
_5b6[c]=true;
});
if("_stateClasses" in this){
dojo.forEach(this._stateClasses,function(c){
delete _5b6[c];
});
}
dojo.forEach(_5b1,function(c){
_5b6[c]=true;
});
var _5ba=[];
for(var c in _5b6){
_5ba.push(c);
}
tn.className=_5ba.join(" ");
this._stateClasses=_5b1;
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
},onChange:function(_5be){
},_onChangeActive:false,_handleOnChange:function(_5bf,_5c0){
this._lastValue=_5bf;
if(this._lastValueReported==undefined&&(_5c0===null||!this._onChangeActive)){
this._resetValue=this._lastValueReported=_5bf;
}
if((this.intermediateChanges||_5c0||_5c0===undefined)&&((typeof _5bf!=typeof this._lastValueReported)||this.compare(_5bf,this._lastValueReported)!=0)){
this._lastValueReported=_5bf;
if(this._onChangeActive){
this.onChange(_5bf);
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
},setValue:function(_5c1){
dojo.deprecated("dijit.form._FormWidget:setValue("+_5c1+") is deprecated.  Use attr('value',"+_5c1+") instead.","","2.0");
this.attr("value",_5c1);
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
dojo.declare("dijit.form._FormValueWidget",dijit.form._FormWidget,{attributeMap:dojo.delegate(dijit.form._FormWidget.prototype.attributeMap,{value:""}),postCreate:function(){
if(dojo.isIE||dojo.isWebKit){
this.connect(this.focusNode||this.domNode,"onkeydown",this._onKeyDown);
}
if(this._resetValue===undefined){
this._resetValue=this.value;
}
},_setValueAttr:function(_5c4,_5c5){
this.value=_5c4;
this._handleOnChange(_5c4,_5c5);
},_getValueAttr:function(_5c6){
return this._lastValue;
},undo:function(){
this._setValueAttr(this._lastValueReported,false);
},reset:function(){
this._hasBeenBlurred=false;
this._setValueAttr(this._resetValue,true);
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
if(dojo.isWebKit){
te=document.createEvent("Events");
te.initEvent("keypress",true,true);
te.keyCode=dojo.keys.ESCAPE;
te.shiftKey=e.shiftKey;
e.target.dispatchEvent(te);
}
}
}
}});
}
if(!dojo._hasResource["dijit.form.TextBox"]){
dojo._hasResource["dijit.form.TextBox"]=true;
dojo.provide("dijit.form.TextBox");
dojo.declare("dijit.form.TextBox",dijit.form._FormValueWidget,{trim:false,uppercase:false,lowercase:false,propercase:false,maxLength:"",templateString:"<input class=\"dijit dijitReset dijitLeft\" dojoAttachPoint='textbox,focusNode'\r\n\tdojoAttachEvent='onmouseenter:_onMouse,onmouseleave:_onMouse'\r\n\tautocomplete=\"off\" type=\"${type}\" ${nameAttrSetting}\r\n\t/>\r\n",baseClass:"dijitTextBox",attributeMap:dojo.delegate(dijit.form._FormValueWidget.prototype.attributeMap,{maxLength:"focusNode"}),_getValueAttr:function(){
return this.parse(this.attr("displayedValue"),this.constraints);
},_setValueAttr:function(_5c9,_5ca,_5cb){
var _5cc;
if(_5c9!==undefined){
_5cc=this.filter(_5c9);
if(typeof _5cb!="string"){
if(_5cc!==null&&((typeof _5cc!="number")||!isNaN(_5cc))){
_5cb=this.filter(this.format(_5cc,this.constraints));
}else{
_5cb="";
}
}
}
if(_5cb!=null&&_5cb!=undefined&&((typeof _5cb)!="number"||!isNaN(_5cb))&&this.textbox.value!=_5cb){
this.textbox.value=_5cb;
}
this.inherited(arguments,[_5cc,_5ca]);
},displayedValue:"",getDisplayedValue:function(){
dojo.deprecated(this.declaredClass+"::getDisplayedValue() is deprecated. Use attr('displayedValue') instead.","","2.0");
return this.attr("displayedValue");
},_getDisplayedValueAttr:function(){
return this.filter(this.textbox.value);
},setDisplayedValue:function(_5cd){
dojo.deprecated(this.declaredClass+"::setDisplayedValue() is deprecated. Use attr('displayedValue', ...) instead.","","2.0");
this.attr("displayedValue",_5cd);
},_setDisplayedValueAttr:function(_5ce){
if(_5ce===null||_5ce===undefined){
_5ce="";
}else{
if(typeof _5ce!="string"){
_5ce=String(_5ce);
}
}
this.textbox.value=_5ce;
this._setValueAttr(this.attr("value"),undefined,_5ce);
},format:function(_5cf,_5d0){
return ((_5cf==null||_5cf==undefined)?"":(_5cf.toString?_5cf.toString():_5cf));
},parse:function(_5d1,_5d2){
return _5d1;
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
var _5d4=this;
setTimeout(function(){
_5d4._handleOnChange(_5d4.attr("value"),false);
},0);
}
this._refreshState();
},postCreate:function(){
this.textbox.setAttribute("value",this.textbox.value);
this.inherited(arguments);
if(dojo.isMoz||dojo.isOpera){
this.connect(this.textbox,"oninput",this._onInput);
}else{
this.connect(this.textbox,"onkeydown",this._onInput);
this.connect(this.textbox,"onkeyup",this._onInput);
this.connect(this.textbox,"onpaste",this._onInput);
this.connect(this.textbox,"oncut",this._onInput);
}
this._layoutHack();
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
this._setValueAttr(this.attr("value"),true);
},_onBlur:function(e){
if(this.disabled){
return;
}
this._setBlurValue();
this.inherited(arguments);
},_onFocus:function(e){
if(this.disabled){
return;
}
this._refreshState();
this.inherited(arguments);
},reset:function(){
this.textbox.value="";
this.inherited(arguments);
}});
dijit.selectInputText=function(_5d9,_5da,stop){
var _5dc=dojo.global;
var _5dd=dojo.doc;
_5d9=dojo.byId(_5d9);
if(isNaN(_5da)){
_5da=0;
}
if(isNaN(stop)){
stop=_5d9.value?_5d9.value.length:0;
}
_5d9.focus();
if(_5dd["selection"]&&dojo.body()["createTextRange"]){
if(_5d9.createTextRange){
var _5de=_5d9.createTextRange();
with(_5de){
collapse(true);
moveStart("character",_5da);
moveEnd("character",stop);
select();
}
}
}else{
if(_5dc["getSelection"]){
var _5df=_5dc.getSelection();
if(_5d9.setSelectionRange){
_5d9.setSelectionRange(_5da,stop);
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
},show:function(_5e0,_5e1,_5e2){
if(this.aroundNode&&this.aroundNode===_5e1){
return;
}
if(this.fadeOut.status()=="playing"){
this._onDeck=arguments;
return;
}
this.containerNode.innerHTML=_5e0;
this.domNode.style.top=(this.domNode.offsetTop+1)+"px";
var _5e3={};
var ltr=this.isLeftToRight();
dojo.forEach((_5e2&&_5e2.length)?_5e2:dijit.Tooltip.defaultPosition,function(pos){
switch(pos){
case "after":
_5e3[ltr?"BR":"BL"]=ltr?"BL":"BR";
break;
case "before":
_5e3[ltr?"BL":"BR"]=ltr?"BR":"BL";
break;
case "below":
_5e3[ltr?"BL":"BR"]=ltr?"TL":"TR";
_5e3[ltr?"BR":"BL"]=ltr?"TR":"TL";
break;
case "above":
default:
_5e3[ltr?"TL":"TR"]=ltr?"BL":"BR";
_5e3[ltr?"TR":"TL"]=ltr?"BR":"BL";
break;
}
});
var pos=dijit.placeOnScreenAroundElement(this.domNode,_5e1,_5e3,dojo.hitch(this,"orient"));
dojo.style(this.domNode,"opacity",0);
this.fadeIn.play();
this.isShowingNow=true;
this.aroundNode=_5e1;
},orient:function(node,_5e8,_5e9){
node.className="dijitTooltip "+{"BL-TL":"dijitTooltipBelow dijitTooltipABLeft","TL-BL":"dijitTooltipAbove dijitTooltipABLeft","BR-TR":"dijitTooltipBelow dijitTooltipABRight","TR-BR":"dijitTooltipAbove dijitTooltipABRight","BR-BL":"dijitTooltipRight","BL-BR":"dijitTooltipLeft"}[_5e8+"-"+_5e9];
},_onShow:function(){
if(dojo.isIE){
this.domNode.style.filter="";
}
},hide:function(_5ea){
if(this._onDeck&&this._onDeck[1]==_5ea){
this._onDeck=null;
}else{
if(this.aroundNode===_5ea){
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
dijit.showTooltip=function(_5eb,_5ec,_5ed){
if(!dijit._masterTT){
dijit._masterTT=new dijit._MasterTooltip();
}
return dijit._masterTT.show(_5eb,_5ec,_5ed);
};
dijit.hideTooltip=function(_5ee){
if(!dijit._masterTT){
dijit._masterTT=new dijit._MasterTooltip();
}
return dijit._masterTT.hide(_5ee);
};
dojo.declare("dijit.Tooltip",dijit._Widget,{label:"",showDelay:400,connectId:[],position:[],_setConnectIdAttr:function(ids){
this._connectNodes=[];
this.connectId=dojo.isArrayLike(ids)?ids:[ids];
dojo.forEach(this.connectId,function(id){
var node=dojo.byId(id);
if(node){
this._connectNodes.push(node);
dojo.forEach(["onMouseEnter","onMouseLeave","onFocus","onBlur"],function(_5f2){
this.connect(node,_5f2.toLowerCase(),"_"+_5f2);
},this);
if(dojo.isIE){
node.style.zoom=1;
}
}
},this);
},postCreate:function(){
dojo.addClass(this.domNode,"dijitTooltipData");
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
var _5f8=e.target;
this._showTimer=setTimeout(dojo.hitch(this,function(){
this.open(_5f8);
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
},open:function(_5fa){
_5fa=_5fa||this._connectNodes[0];
if(!_5fa){
return;
}
if(this._showTimer){
clearTimeout(this._showTimer);
delete this._showTimer;
}
dijit.showTooltip(this.label||this.domNode.innerHTML,_5fa,this.position);
this._connectNode=_5fa;
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
dojo.declare("dijit.form.ValidationTextBox",dijit.form.TextBox,{templateString:"<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\r\n\tid=\"widget_${id}\"\r\n\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\" waiRole=\"presentation\"\r\n\t><div style=\"overflow:hidden;\"\r\n\t\t><div class=\"dijitReset dijitValidationIcon\"><br></div\r\n\t\t><div class=\"dijitReset dijitValidationIconText\">&Chi;</div\r\n\t\t><div class=\"dijitReset dijitInputField\"\r\n\t\t\t><input class=\"dijitReset\" dojoAttachPoint='textbox,focusNode' autocomplete=\"off\"\r\n\t\t\t${nameAttrSetting} type='${type}'\r\n\t\t/></div\r\n\t></div\r\n></div>\r\n",baseClass:"dijitTextBox",required:false,promptMessage:"",invalidMessage:"$_unset_$",constraints:{},regExp:".*",regExpGen:function(_5fb){
return this.regExp;
},state:"",tooltipPosition:[],_setValueAttr:function(){
this.inherited(arguments);
this.validate(this._focused);
},validator:function(_5fc,_5fd){
return (new RegExp("^(?:"+this.regExpGen(_5fd)+")"+(this.required?"":"?")+"$")).test(_5fc)&&(!this.required||!this._isEmpty(_5fc))&&(this._isEmpty(_5fc)||this.parse(_5fc,_5fd)!==undefined);
},_isValidSubset:function(){
return this.textbox.value.search(this._partialre)==0;
},isValid:function(_5fe){
return this.validator(this.textbox.value,this.constraints);
},_isEmpty:function(_5ff){
return /^\s*$/.test(_5ff);
},getErrorMessage:function(_600){
return this.invalidMessage;
},getPromptMessage:function(_601){
return this.promptMessage;
},_maskValidSubsetError:true,validate:function(_602){
var _603="";
var _604=this.disabled||this.isValid(_602);
if(_604){
this._maskValidSubsetError=true;
}
var _605=!_604&&_602&&this._isValidSubset();
var _606=this._isEmpty(this.textbox.value);
this.state=(_604||(!this._hasBeenBlurred&&_606)||_605)?"":"Error";
if(this.state=="Error"){
this._maskValidSubsetError=false;
}
this._setStateClass();
dijit.setWaiState(this.focusNode,"invalid",_604?"false":"true");
if(_602){
if(_606){
_603=this.getPromptMessage(true);
}
if(!_603&&(this.state=="Error"||(_605&&!this._maskValidSubsetError))){
_603=this.getErrorMessage(true);
}
}
this.displayMessage(_603);
return _604;
},_message:"",displayMessage:function(_607){
if(this._message==_607){
return;
}
this._message=_607;
dijit.hideTooltip(this.domNode);
if(_607){
dijit.showTooltip(_607,this.domNode,this.tooltipPosition);
}
},_refreshState:function(){
this.validate(this._focused);
this.inherited(arguments);
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
var _609="";
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
_609+=re;
break;
case ")":
_609+="|$)";
break;
default:
_609+="(?:"+re+"|$)";
break;
}
});
}
try{
"".search(_609);
}
catch(e){
_609=this.regExp;
console.warn("RegExp error in "+this.declaredClass+": "+this.regExp);
}
this._partialre="^(?:"+_609+")$";
},_setDisabledAttr:function(_60b){
this.inherited(arguments);
if(this.valueNode){
this.valueNode.disabled=_60b;
}
this._refreshState();
},_setRequiredAttr:function(_60c){
this.required=_60c;
dijit.setWaiState(this.focusNode,"required",_60c);
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
},reset:function(){
this._maskValidSubsetError=true;
this.inherited(arguments);
}});
dojo.declare("dijit.form.MappedTextBox",dijit.form.ValidationTextBox,{postMixInProperties:function(){
this.inherited(arguments);
this.nameAttrSetting="";
},serialize:function(val,_610){
return val.toString?val.toString():"";
},toString:function(){
var val=this.filter(this.attr("value"));
return val!=null?(typeof val=="string"?val:this.serialize(val,this.constraints)):"";
},validate:function(){
this.valueNode.value=this.toString();
return this.inherited(arguments);
},buildRendering:function(){
this.inherited(arguments);
this.valueNode=dojo.create("input",{style:{display:"none"},type:this.type,name:this.name},this.textbox,"after");
},_setDisabledAttr:function(_612){
this.inherited(arguments);
dojo.attr(this.valueNode,"disabled",_612);
},reset:function(){
this.valueNode.value="";
this.inherited(arguments);
}});
dojo.declare("dijit.form.RangeBoundTextBox",dijit.form.MappedTextBox,{rangeMessage:"",rangeCheck:function(_613,_614){
var _615="min" in _614;
var _616="max" in _614;
if(_615||_616){
return (!_615||this.compare(_613,_614.min)>=0)&&(!_616||this.compare(_613,_614.max)<=0);
}
return true;
},isInRange:function(_617){
return this.rangeCheck(this.attr("value"),this.constraints);
},_isDefinitelyOutOfRange:function(){
var val=this.attr("value");
var _619=false;
var _61a=false;
if("min" in this.constraints){
var min=this.constraints.min;
val=this.compare(val,((typeof min=="number")&&min>=0&&val!=0)?0:min);
_619=(typeof val=="number")&&val<0;
}
if("max" in this.constraints){
var max=this.constraints.max;
val=this.compare(val,((typeof max!="number")||max>0)?max:0);
_61a=(typeof val=="number")&&val>0;
}
return _619||_61a;
},_isValidSubset:function(){
return this.inherited(arguments)&&!this._isDefinitelyOutOfRange();
},isValid:function(_61d){
return this.inherited(arguments)&&((this._isEmpty(this.textbox.value)&&!this.required)||this.isInRange(_61d));
},getErrorMessage:function(_61e){
if(dijit.form.RangeBoundTextBox.superclass.isValid.call(this,false)&&!this.isInRange(_61e)){
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
},_setValueAttr:function(_61f,_620){
dijit.setWaiState(this.focusNode,"valuenow",_61f);
this.inherited(arguments);
}});
}
if(!dojo._hasResource["dojo.regexp"]){
dojo._hasResource["dojo.regexp"]=true;
dojo.provide("dojo.regexp");
dojo.regexp.escapeString=function(str,_622){
return str.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g,function(ch){
if(_622&&_622.indexOf(ch)!=-1){
return ch;
}
return "\\"+ch;
});
};
dojo.regexp.buildGroupRE=function(arr,re,_626){
if(!(arr instanceof Array)){
return re(arr);
}
var b=[];
for(var i=0;i<arr.length;i++){
b.push(re(arr[i]));
}
return dojo.regexp.group(b.join("|"),_626);
};
dojo.regexp.group=function(_629,_62a){
return "("+(_62a?"?:":"")+_629+")";
};
}
if(!dojo._hasResource["dijit.form.ComboBox"]){
dojo._hasResource["dijit.form.ComboBox"]=true;
dojo.provide("dijit.form.ComboBox");
dojo.declare("dijit.form.ComboBoxMixin",null,{item:null,pageSize:Infinity,store:null,fetchProperties:{},query:{},autoComplete:true,highlightMatch:"first",searchDelay:100,searchAttr:"name",labelAttr:"",labelType:"text",queryExpr:"${0}*",ignoreCase:true,hasDownArrow:true,templateString:"<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\r\n\tid=\"widget_${id}\"\r\n\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\" dojoAttachPoint=\"comboNode\" waiRole=\"combobox\" tabIndex=\"-1\"\r\n\t><div style=\"overflow:hidden;\"\r\n\t\t><div class='dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton'\r\n\t\t\tdojoAttachPoint=\"downArrowNode\" waiRole=\"presentation\"\r\n\t\t\tdojoAttachEvent=\"onmousedown:_onArrowMouseDown,onmouseup:_onMouse,onmouseenter:_onMouse,onmouseleave:_onMouse\"\r\n\t\t\t><div class=\"dijitArrowButtonInner\">&thinsp;</div\r\n\t\t\t><div class=\"dijitArrowButtonChar\">&#9660;</div\r\n\t\t></div\r\n\t\t><div class=\"dijitReset dijitValidationIcon\"><br></div\r\n\t\t><div class=\"dijitReset dijitValidationIconText\">&Chi;</div\r\n\t\t><div class=\"dijitReset dijitInputField\"\r\n\t\t\t><input ${nameAttrSetting} type=\"text\" autocomplete=\"off\" class='dijitReset'\r\n\t\t\tdojoAttachEvent=\"onkeypress:_onKeyPress,compositionend\"\r\n\t\t\tdojoAttachPoint=\"textbox,focusNode\" waiRole=\"textbox\" waiState=\"haspopup-true,autocomplete-list\"\r\n\t\t/></div\r\n\t></div\r\n></div>\r\n",baseClass:"dijitComboBox",_getCaretPos:function(_62b){
var pos=0;
if(typeof (_62b.selectionStart)=="number"){
pos=_62b.selectionStart;
}else{
if(dojo.isIE){
var tr=dojo.doc.selection.createRange().duplicate();
var ntr=_62b.createTextRange();
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
},_setCaretPos:function(_62f,_630){
_630=parseInt(_630);
dijit.selectInputText(_62f,_630,_630);
},_setDisabledAttr:function(_631){
this.inherited(arguments);
dijit.setWaiState(this.comboNode,"disabled",_631);
},_onKeyPress:function(evt){
var key=evt.charOrCode;
if(evt.altKey||(evt.ctrlKey&&(key!="x"&&key!="v"))||evt.key==dojo.keys.SHIFT){
return;
}
var _634=false;
var pw=this._popupWidget;
var dk=dojo.keys;
var _637=null;
if(this._isShowingNow){
pw.handleKey(key);
_637=pw.getHighlightedOption();
}
switch(key){
case dk.PAGE_DOWN:
case dk.DOWN_ARROW:
if(!this._isShowingNow||this._prev_key_esc){
this._arrowPressed();
_634=true;
}else{
if(_637){
this._announceOption(_637);
}
}
dojo.stopEvent(evt);
this._prev_key_backspace=false;
this._prev_key_esc=false;
break;
case dk.PAGE_UP:
case dk.UP_ARROW:
if(this._isShowingNow){
this._announceOption(_637);
}
dojo.stopEvent(evt);
this._prev_key_backspace=false;
this._prev_key_esc=false;
break;
case dk.ENTER:
if(_637){
if(_637==pw.nextButton){
this._nextSearch(1);
dojo.stopEvent(evt);
break;
}else{
if(_637==pw.previousButton){
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
var _638=this.attr("displayedValue");
if(pw&&(_638==pw._messages["previousMessage"]||_638==pw._messages["nextMessage"])){
break;
}
if(this._isShowingNow){
this._prev_key_backspace=false;
this._prev_key_esc=false;
if(_637){
pw.attr("value",{target:_637});
}
this._lastQuery=null;
this._hideResultList();
}
break;
case " ":
this._prev_key_backspace=false;
this._prev_key_esc=false;
if(_637){
dojo.stopEvent(evt);
this._selectOption();
this._hideResultList();
}else{
_634=true;
}
break;
case dk.ESCAPE:
this._prev_key_backspace=false;
this._prev_key_esc=true;
if(this._isShowingNow){
dojo.stopEvent(evt);
this._hideResultList();
}
break;
case dk.DELETE:
case dk.BACKSPACE:
this._prev_key_esc=false;
this._prev_key_backspace=true;
_634=true;
break;
case dk.RIGHT_ARROW:
case dk.LEFT_ARROW:
this._prev_key_backspace=false;
this._prev_key_esc=false;
break;
default:
this._prev_key_backspace=false;
this._prev_key_esc=false;
_634=typeof key=="string";
}
if(this.searchTimer){
clearTimeout(this.searchTimer);
}
if(_634){
setTimeout(dojo.hitch(this,"_startSearchFromInput"),1);
}
},_autoCompleteText:function(text){
var fn=this.focusNode;
dijit.selectInputText(fn,fn.value.length);
var _63b=this.ignoreCase?"toLowerCase":"substr";
if(text[_63b](0).indexOf(this.focusNode.value[_63b](0))==0){
var cpos=this._getCaretPos(fn);
if((cpos+1)>fn.value.length){
fn.value=text;
dijit.selectInputText(fn,cpos);
}
}else{
fn.value=text;
dijit.selectInputText(fn);
}
},_openResultList:function(_63d,_63e){
if(this.disabled||this.readOnly||(_63e.query[this.searchAttr]!=this._lastQuery)){
return;
}
this._popupWidget.clearResultList();
if(!_63d.length){
this._hideResultList();
return;
}
this.item=null;
var _63f=new String(this.store.getValue(_63d[0],this.searchAttr));
if(_63f&&this.autoComplete&&!this._prev_key_backspace&&(_63e.query[this.searchAttr]!="*")){
this.item=_63d[0];
this._autoCompleteText(_63f);
}
_63e._maxOptions=this._maxOptions;
this._popupWidget.createOptions(_63d,_63e,dojo.hitch(this,"_getMenuLabelFromItem"));
this._showResultList();
if(_63e.direction){
if(1==_63e.direction){
this._popupWidget.highlightFirstOption();
}else{
if(-1==_63e.direction){
this._popupWidget.highlightLastOption();
}
}
this._announceOption(this._popupWidget.getHighlightedOption());
}
},_showResultList:function(){
this._hideResultList();
var _640=this._popupWidget.getItems(),_641=Math.min(_640.length,this.maxListLength);
this._arrowPressed();
this.displayMessage("");
dojo.style(this._popupWidget.domNode,{width:"",height:""});
var best=this.open();
var _643=dojo.marginBox(this._popupWidget.domNode);
this._popupWidget.domNode.style.overflow=((best.h==_643.h)&&(best.w==_643.w))?"hidden":"auto";
var _644=best.w;
if(best.h<this._popupWidget.domNode.scrollHeight){
_644+=16;
}
dojo.marginBox(this._popupWidget.domNode,{h:best.h,w:Math.max(_644,this.domNode.offsetWidth)});
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
var _645=this.attr("displayedValue");
var pw=this._popupWidget;
if(pw&&(_645==pw._messages["previousMessage"]||_645==pw._messages["nextMessage"])){
this._setValueAttr(this._lastValueReported,true);
}else{
this.attr("displayedValue",_645);
}
},_onBlur:function(){
this._hideResultList();
this._arrowIdle();
this.inherited(arguments);
},_announceOption:function(node){
if(node==null){
return;
}
var _648;
if(node==this._popupWidget.nextButton||node==this._popupWidget.previousButton){
_648=node.innerHTML;
}else{
_648=this.store.getValue(node.item,this.searchAttr);
}
this.focusNode.value=this.focusNode.value.substring(0,this._getCaretPos(this.focusNode));
dijit.setWaiState(this.focusNode,"activedescendant",dojo.attr(node,"id"));
this._autoCompleteText(_648);
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
var _64f=this.id+"_popup";
this._popupWidget=new dijit.form._ComboBoxMenu({onChange:dojo.hitch(this,this._selectOption),id:_64f});
dijit.removeWaiState(this.focusNode,"activedescendant");
dijit.setWaiState(this.textbox,"owns",_64f);
}
this.item=null;
var _650=dojo.clone(this.query);
this._lastInput=key;
this._lastQuery=_650[this.searchAttr]=this._getQueryString(key);
this.searchTimer=setTimeout(dojo.hitch(this,function(_651,_652){
var _653={queryOptions:{ignoreCase:this.ignoreCase,deep:true},query:_651,onBegin:dojo.hitch(this,"_setMaxOptions"),onComplete:dojo.hitch(this,"_openResultList"),onError:function(_654){
console.error("dijit.form.ComboBox: "+_654);
dojo.hitch(_652,"_hideResultList")();
},start:0,count:this.pageSize};
dojo.mixin(_653,_652.fetchProperties);
var _655=_652.store.fetch(_653);
var _656=function(_657,_658){
_657.start+=_657.count*_658;
_657.direction=_658;
this.store.fetch(_657);
};
this._nextSearch=this._popupWidget.onPage=dojo.hitch(this,_656,_655);
},_650,this),this.searchDelay);
},_setMaxOptions:function(size,_65a){
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
var _65c=this.srcNodeRef;
this.store=new dijit.form._ComboBoxDataStore(_65c);
if(!this.value||((typeof _65c.selectedIndex=="number")&&_65c.selectedIndex.toString()===this.value)){
var item=this.store.fetchSelectedItem();
if(item){
this.value=this.store.getValue(item,this._getValueField());
}
}
}
this.inherited(arguments);
},postCreate:function(){
var _65e=dojo.query("label[for=\""+this.id+"\"]");
if(_65e.length){
_65e[0].id=(this.id+"_label");
var cn=this.comboNode;
dijit.setWaiState(cn,"labelledby",_65e[0].id);
}
this.inherited(arguments);
},uninitialize:function(){
if(this._popupWidget){
this._hideResultList();
this._popupWidget.destroy();
}
},_getMenuLabelFromItem:function(item){
var _661=this.store.getValue(item,this.labelAttr||this.searchAttr);
var _662=this.labelType;
if(this.highlightMatch!="none"&&this.labelType=="text"&&this._lastInput){
_661=this.doHighlight(_661,this._escapeHtml(this._lastInput));
_662="html";
}
return {html:_662=="html",label:_661};
},doHighlight:function(_663,find){
var _665="i"+(this.highlightMatch=="all"?"g":"");
var _666=this._escapeHtml(_663);
find=dojo.regexp.escapeString(find);
var ret=_666.replace(new RegExp("(^|\\s)("+find+")",_665),"$1<span class=\"dijitComboBoxHighlightMatch\">$2</span>");
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
dojo.declare("dijit.form._ComboBoxMenu",[dijit._Widget,dijit._Templated],{templateString:"<ul class='dijitReset dijitMenu' dojoAttachEvent='onmousedown:_onMouseDown,onmouseup:_onMouseUp,onmouseover:_onMouseOver,onmouseout:_onMouseOut' tabIndex='-1' style='overflow: \"auto\"; overflow-x: \"hidden\";'>"+"<li class='dijitMenuItem dijitMenuPreviousButton' dojoAttachPoint='previousButton' waiRole='option'></li>"+"<li class='dijitMenuItem dijitMenuNextButton' dojoAttachPoint='nextButton' waiRole='option'></li>"+"</ul>",_messages:null,postMixInProperties:function(){
this._messages=dojo.i18n.getLocalization("dijit.form","ComboBox",this.lang);
this.inherited(arguments);
},_setValueAttr:function(_669){
this.value=_669;
this.onChange(_669);
},onChange:function(_66a){
},onPage:function(_66b){
},postCreate:function(){
this.previousButton.innerHTML=this._messages["previousMessage"];
this.nextButton.innerHTML=this._messages["nextMessage"];
this.inherited(arguments);
},onClose:function(){
this._blurOptionNode();
},_createOption:function(item,_66d){
var _66e=_66d(item);
var _66f=dojo.doc.createElement("li");
dijit.setWaiRole(_66f,"option");
if(_66e.html){
_66f.innerHTML=_66e.label;
}else{
_66f.appendChild(dojo.doc.createTextNode(_66e.label));
}
if(_66f.innerHTML==""){
_66f.innerHTML="&nbsp;";
}
_66f.item=item;
return _66f;
},createOptions:function(_670,_671,_672){
this.previousButton.style.display=(_671.start==0)?"none":"";
dojo.attr(this.previousButton,"id",this.id+"_prev");
dojo.forEach(_670,function(item,i){
var _675=this._createOption(item,_672);
_675.className="dijitReset dijitMenuItem";
dojo.attr(_675,"id",this.id+i);
this.domNode.insertBefore(_675,this.nextButton);
},this);
var _676=false;
if(_671._maxOptions&&_671._maxOptions!=-1){
if((_671.start+_671.count)<_671._maxOptions){
_676=true;
}else{
if((_671.start+_671.count)>(_671._maxOptions-1)){
if(_671.count==_670.length){
_676=true;
}
}
}
}else{
if(_671.count==_670.length){
_676=true;
}
}
this.nextButton.style.display=_676?"":"none";
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
dojo.addClass(this._highlighted_option,"dijitMenuItemSelected");
}
},_blurOptionNode:function(){
if(this._highlighted_option){
dojo.removeClass(this._highlighted_option,"dijitMenuItemSelected");
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
var _683=0;
var _684=this.domNode.scrollTop;
var _685=dojo.style(this.domNode,"height");
if(!this.getHighlightedOption()){
this._highlightNextOption();
}
while(_683<_685){
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
var _686=this.domNode.scrollTop;
_683+=(_686-_684)*(up?-1:1);
_684=_686;
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
dojo.declare("dijit.form.ComboBox",[dijit.form.ValidationTextBox,dijit.form.ComboBoxMixin],{_setValueAttr:function(_689,_68a){
if(!_689){
_689="";
}
dijit.form.ValidationTextBox.prototype._setValueAttr.call(this,_689,_68a);
}});
dojo.declare("dijit.form._ComboBoxDataStore",null,{constructor:function(root){
this.root=root;
dojo.query("> option",root).forEach(function(node){
node.innerHTML=dojo.trim(node.innerHTML);
});
},getValue:function(item,_68e,_68f){
return (_68e=="value")?item.value:(item.innerText||item.textContent||"");
},isItemLoaded:function(_690){
return true;
},getFeatures:function(){
return {"dojo.data.api.Read":true,"dojo.data.api.Identity":true};
},_fetchItems:function(args,_692,_693){
if(!args.query){
args.query={};
}
if(!args.query.name){
args.query.name="";
}
if(!args.queryOptions){
args.queryOptions={};
}
var _694=dojo.data.util.filter.patternToRegExp(args.query.name,args.queryOptions.ignoreCase),_695=dojo.query("> option",this.root).filter(function(_696){
return (_696.innerText||_696.textContent||"").match(_694);
});
if(args.sort){
_695.sort(dojo.data.util.sorter.createSortFunction(args.sort,this));
}
_692(_695,args);
},close:function(_697){
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
},_callbackSetLabel:function(_69e,_69f,_6a0){
if((_69f&&_69f.query[this.searchAttr]!=this._lastQuery)||(!_69f&&_69e.length&&this.store.getIdentity(_69e[0])!=this._lastQuery)){
return;
}
if(!_69e.length){
this.valueNode.value="";
dijit.form.TextBox.superclass._setValueAttr.call(this,"",_6a0||(_6a0===undefined&&!this._focused));
this._isvalid=false;
this.validate(this._focused);
this.item=null;
}else{
this._setValueFromItem(_69e[0],_6a0);
}
},_openResultList:function(_6a1,_6a2){
if(_6a2.query[this.searchAttr]!=this._lastQuery){
return;
}
this._isvalid=_6a1.length!=0;
this.validate(true);
dijit.form.ComboBoxMixin.prototype._openResultList.apply(this,arguments);
},_getValueAttr:function(){
return this.valueNode.value;
},_getValueField:function(){
return "value";
},_setValue:function(_6a3,_6a4,_6a5){
this.valueNode.value=_6a3;
dijit.form.FilteringSelect.superclass._setValueAttr.call(this,_6a3,_6a5,_6a4);
this._lastDisplayedValue=_6a4;
},_setValueAttr:function(_6a6,_6a7){
if(!this._onChangeActive){
_6a7=null;
}
this._lastQuery=_6a6;
if(_6a6===null||_6a6===""){
this._setDisplayedValueAttr("",_6a7);
return;
}
var self=this;
var _6a9=function(item,_6ab){
if(item){
if(self.store.isItemLoaded(item)){
self._callbackSetLabel([item],undefined,_6ab);
}else{
self.store.loadItem({item:item,onItem:function(_6ac,_6ad){
self._callbackSetLabel(_6ac,_6ad,_6ab);
}});
}
}else{
self._isvalid=false;
self.validate(false);
}
};
this.store.fetchItemByIdentity({identity:_6a6,onItem:function(item){
_6a9(item,_6a7);
}});
},_setValueFromItem:function(item,_6b0){
this._isvalid=true;
this.item=item;
this._setValue(this.store.getIdentity(item),this.labelFunc(item,this.store),_6b0);
},labelFunc:function(item,_6b2){
return _6b2.getValue(item,this.searchAttr);
},_doSelect:function(tgt){
this._setValueFromItem(tgt.item,true);
},_setDisplayedValueAttr:function(_6b4,_6b5){
if(!this._created){
_6b5=false;
}
if(this.store){
var _6b6=dojo.clone(this.query);
this._lastQuery=_6b6[this.searchAttr]=_6b4.replace(/([\\\*\?])/g,"\\$1");
this.textbox.value=_6b4;
this._lastDisplayedValue=_6b4;
var _6b7=this;
var _6b8={query:_6b6,queryOptions:{ignoreCase:this.ignoreCase,deep:true},onComplete:function(_6b9,_6ba){
dojo.hitch(_6b7,"_callbackSetLabel")(_6b9,_6ba,_6b5);
},onError:function(_6bb){
console.error("dijit.form.FilteringSelect: "+_6bb);
dojo.hitch(_6b7,"_setValue")("",_6b4,false);
}};
dojo.mixin(_6b8,this.fetchProperties);
this.store.fetch(_6b8);
}
},postMixInProperties:function(){
this.inherited(arguments);
this._isvalid=!this.required;
},undo:function(){
this.attr("displayedValue",this._lastDisplayedValue);
}});
}
if(!dojo._hasResource["dijit.form.Form"]){
dojo._hasResource["dijit.form.Form"]=true;
dojo.provide("dijit.form.Form");
dojo.declare("dijit.form.Form",[dijit._Widget,dijit._Templated,dijit.form._FormMixin],{name:"",action:"",method:"",encType:"","accept-charset":"",accept:"",target:"",templateString:"<form dojoAttachPoint='containerNode' dojoAttachEvent='onreset:_onReset,onsubmit:_onSubmit' ${nameAttrSetting}></form>",attributeMap:dojo.delegate(dijit._Widget.prototype.attributeMap,{action:"",method:"",encType:"","accept-charset":"",accept:"",target:""}),postMixInProperties:function(){
this.nameAttrSetting=this.name?("name='"+this.name+"'"):"";
this.inherited(arguments);
},execute:function(_6bc){
},onExecute:function(){
},_setEncTypeAttr:function(_6bd){
this.encType=_6bd;
dojo.attr(this.domNode,"encType",_6bd);
if(dojo.isIE){
this.domNode.encoding=_6bd;
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
if(!dojo._hasResource["dijit.form.SimpleTextarea"]){
dojo._hasResource["dijit.form.SimpleTextarea"]=true;
dojo.provide("dijit.form.SimpleTextarea");
dojo.declare("dijit.form.SimpleTextarea",dijit.form.TextBox,{baseClass:"dijitTextArea",attributeMap:dojo.delegate(dijit.form._FormValueWidget.prototype.attributeMap,{rows:"textbox",cols:"textbox"}),rows:"3",cols:"20",templatePath:null,templateString:"<textarea ${nameAttrSetting} dojoAttachPoint='focusNode,containerNode,textbox' autocomplete='off'></textarea>",postMixInProperties:function(){
if(!this.value&&this.srcNodeRef){
this.value=this.srcNodeRef.value;
}
this.inherited(arguments);
},filter:function(_6c5){
if(_6c5){
_6c5=_6c5.replace(/\r/g,"");
}
return this.inherited(arguments);
},postCreate:function(){
this.inherited(arguments);
if(dojo.isIE&&this.cols){
dojo.addClass(this.domNode,"dijitTextAreaCols");
}
},_previousValue:"",_onInput:function(e){
if(this.maxLength){
var _6c7=parseInt(this.maxLength);
var _6c8=this.textbox.value.replace(/\r/g,"");
var _6c9=_6c8.length-_6c7;
if(_6c9>0){
dojo.stopEvent(e);
var _6ca=this.textbox;
if(_6ca.selectionStart){
var pos=_6ca.selectionStart;
var cr=0;
if(dojo.isOpera){
cr=(this.textbox.value.substring(0,pos).match(/\r/g)||[]).length;
}
this.textbox.value=_6c8.substring(0,pos-_6c9-cr)+_6c8.substring(pos-cr);
_6ca.setSelectionRange(pos-_6c9,pos-_6c9);
}else{
if(dojo.doc.selection){
_6ca.focus();
var _6cd=dojo.doc.selection.createRange();
_6cd.moveStart("character",-_6c9);
_6cd.text="";
_6cd.select();
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
dojo.declare("dijit.form.Textarea",dijit.form.SimpleTextarea,{cols:"",_previousNewlines:0,_strictMode:(dojo.doc.compatMode!="BackCompat"),_getHeight:function(_6ce){
var newH=_6ce.scrollHeight;
if(dojo.isIE){
newH+=_6ce.offsetHeight-_6ce.clientHeight-((dojo.isIE<8&&this._strictMode)?dojo._getPadBorderExtents(_6ce).h:0);
}else{
if(dojo.isMoz){
newH+=_6ce.offsetHeight-_6ce.clientHeight;
}else{
if(dojo.isWebKit&&!(dojo.isSafari<4)){
newH+=dojo._getBorderExtents(_6ce).h;
}else{
newH+=dojo._getPadBorderExtents(_6ce).h;
}
}
}
return newH;
},_estimateHeight:function(_6d0){
_6d0.style.maxHeight="";
_6d0.style.height="auto";
_6d0.rows=(_6d0.value.match(/\n/g)||[]).length+1;
},_needsHelpShrinking:dojo.isMoz||dojo.isWebKit,_onInput:function(){
this.inherited(arguments);
if(this._busyResizing){
return;
}
this._busyResizing=true;
var _6d1=this.textbox;
if(_6d1.scrollHeight){
var newH=this._getHeight(_6d1)+"px";
if(_6d1.style.height!=newH){
_6d1.style.maxHeight=_6d1.style.height=newH;
}
if(this._needsHelpShrinking){
if(this._setTimeoutHandle){
clearTimeout(this._setTimeoutHandle);
}
this._setTimeoutHandle=setTimeout(dojo.hitch(this,"_shrink"),0);
}
}else{
this._estimateHeight(_6d1);
}
this._busyResizing=false;
},_busyResizing:false,_shrink:function(){
this._setTimeoutHandle=null;
if(this._needsHelpShrinking&&!this._busyResizing){
this._busyResizing=true;
var _6d3=this.textbox;
var _6d4=false;
if(_6d3.value==""){
_6d3.value=" ";
_6d4=true;
}
var _6d5=_6d3.scrollHeight;
if(!_6d5){
this._estimateHeight(_6d3);
}else{
var _6d6=_6d3.style.paddingBottom;
var _6d7=dojo._getPadExtents(_6d3);
_6d7=_6d7.h-_6d7.t;
_6d3.style.paddingBottom=_6d7+1+"px";
var newH=this._getHeight(_6d3)-1+"px";
if(_6d3.style.maxHeight!=newH){
_6d3.style.paddingBottom=_6d7+_6d5+"px";
_6d3.scrollTop=0;
_6d3.style.maxHeight=this._getHeight(_6d3)-_6d5+"px";
}
_6d3.style.paddingBottom=_6d6;
}
if(_6d4){
_6d3.value="";
}
this._busyResizing=false;
}
},resize:function(){
this._onInput();
},_setValueAttr:function(){
this.inherited(arguments);
this.resize();
},postCreate:function(){
this.inherited(arguments);
dojo.style(this.textbox,{overflowY:"hidden",overflowX:"auto",boxSizing:"border-box",MsBoxSizing:"border-box",WebkitBoxSizing:"border-box",MozBoxSizing:"border-box"});
this.connect(this.textbox,"onscroll",this._onInput);
this.connect(this.textbox,"onresize",this._onInput);
this.connect(this.textbox,"onfocus",this._onInput);
setTimeout(dojo.hitch(this,"resize"),0);
}});
}
if(!dojo._hasResource["dijit.form.Button"]){
dojo._hasResource["dijit.form.Button"]=true;
dojo.provide("dijit.form.Button");
dojo.declare("dijit.form.Button",dijit.form._FormWidget,{label:"",showLabel:true,iconClass:"",type:"button",baseClass:"dijitButton",templateString:"<span class=\"dijit dijitReset dijitLeft dijitInline\"\r\n\tdojoAttachEvent=\"ondijitclick:_onButtonClick,onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\"\r\n\t><span class=\"dijitReset dijitRight dijitInline\"\r\n\t\t><span class=\"dijitReset dijitInline dijitButtonNode\"\r\n\t\t\t><button class=\"dijitReset dijitStretch dijitButtonContents\"\r\n\t\t\t\tdojoAttachPoint=\"titleNode,focusNode\" \r\n\t\t\t\t${nameAttrSetting} type=\"${type}\" value=\"${value}\" waiRole=\"button\" waiState=\"labelledby-${id}_label\"\r\n\t\t\t\t><span class=\"dijitReset dijitInline\" dojoAttachPoint=\"iconNode\" \r\n\t\t\t\t\t><span class=\"dijitReset dijitToggleButtonIconChar\">&#10003;</span \r\n\t\t\t\t></span \r\n\t\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\" \r\n\t\t\t\t\tid=\"${id}_label\"  \r\n\t\t\t\t\tdojoAttachPoint=\"containerNode\"\r\n\t\t\t\t></span\r\n\t\t\t></button\r\n\t\t></span\r\n\t></span\r\n></span>\r\n",attributeMap:dojo.delegate(dijit.form._FormWidget.prototype.attributeMap,{label:{node:"containerNode",type:"innerHTML"},iconClass:{node:"iconNode",type:"class"}}),_onClick:function(e){
if(this.disabled||this.readOnly){
return false;
}
this._clicked();
return this.onClick(e);
},_onButtonClick:function(e){
if(e.type!="click"&&!(this.type=="submit"||this.type=="reset")){
dojo.stopEvent(e);
}
if(this._onClick(e)===false){
e.preventDefault();
}else{
if(this.type=="submit"&&!this.focusNode.form){
for(var node=this.domNode;node.parentNode;node=node.parentNode){
var _6dc=dijit.byNode(node);
if(_6dc&&typeof _6dc._onSubmit=="function"){
_6dc._onSubmit(e);
break;
}
}
}
}
},_setValueAttr:function(_6dd){
var attr=this.attributeMap.value||"";
if(this[attr.node||attr||"domNode"].tagName=="BUTTON"){
if(_6dd!=this.value){
console.debug("Cannot change the value attribute on a Button widget.");
}
}
},_fillContent:function(_6df){
if(_6df&&!("label" in this.params)){
this.attr("label",_6df.innerHTML);
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
},setLabel:function(_6e2){
dojo.deprecated("dijit.form.Button.setLabel() is deprecated.  Use attr('label', ...) instead.","","2.0");
this.attr("label",_6e2);
},_setLabelAttr:function(_6e3){
this.containerNode.innerHTML=this.label=_6e3;
this._layoutHack();
if(this.showLabel==false&&!this.params.title){
this.titleNode.title=dojo.trim(this.containerNode.innerText||this.containerNode.textContent||"");
}
}});
dojo.declare("dijit.form.DropDownButton",[dijit.form.Button,dijit._Container],{baseClass:"dijitDropDownButton",templateString:"<span class=\"dijit dijitReset dijitLeft dijitInline\"\r\n\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse,onclick:_onDropDownClick,onkeydown:_onDropDownKeydown,onblur:_onDropDownBlur,onkeypress:_onKey\"\r\n\t><span class='dijitReset dijitRight dijitInline'\r\n\t\t><span class='dijitReset dijitInline dijitButtonNode'\r\n\t\t\t><button class=\"dijitReset dijitStretch dijitButtonContents\" \r\n\t\t\t\t${nameAttrSetting} type=\"${type}\" value=\"${value}\"\r\n\t\t\t\tdojoAttachPoint=\"focusNode,titleNode\" \r\n\t\t\t\twaiRole=\"button\" waiState=\"haspopup-true,labelledby-${id}_label\"\r\n\t\t\t\t><span class=\"dijitReset dijitInline\" \r\n\t\t\t\t\tdojoAttachPoint=\"iconNode\"\r\n\t\t\t\t></span\r\n\t\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\"  \r\n\t\t\t\t\tdojoAttachPoint=\"containerNode,popupStateNode\" \r\n\t\t\t\t\tid=\"${id}_label\"\r\n\t\t\t\t></span\r\n\t\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonInner\">&thinsp;</span\r\n\t\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonChar\">&#9660;</span\r\n\t\t\t></button\r\n\t\t></span\r\n\t></span\r\n></span>\r\n",_fillContent:function(){
if(this.srcNodeRef){
var _6e4=dojo.query("*",this.srcNodeRef);
dijit.form.DropDownButton.superclass._fillContent.call(this,_6e4[0]);
this.dropDownContainer=this.srcNodeRef;
}
},startup:function(){
if(this._started){
return;
}
if(!this.dropDown){
var _6e5=dojo.query("[widgetId]",this.dropDownContainer)[0];
this.dropDown=dijit.byNode(_6e5);
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
var _6e8=dojo.isFF&&dojo.isFF<3&&navigator.appVersion.indexOf("Macintosh")!=-1;
if(!_6e8||e.detail!=0||this._seenKeydown){
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
var _6ec=this.dropDown;
if(!_6ec){
return;
}
if(!this._opened){
if(_6ec.href&&!_6ec.isLoaded){
var self=this;
var _6ee=dojo.connect(_6ec,"onLoad",function(){
dojo.disconnect(_6ee);
self._openDropDown();
});
_6ec.refresh();
return;
}else{
this._openDropDown();
}
}else{
this._closeDropDown();
}
},_openDropDown:function(){
var _6ef=this.dropDown;
var _6f0=_6ef.domNode.style.width;
var self=this;
dijit.popup.open({parent:this,popup:_6ef,around:this.domNode,orient:this.isLeftToRight()?{"BL":"TL","BR":"TR","TL":"BL","TR":"BR"}:{"BR":"TR","BL":"TL","TR":"BR","TL":"BL"},onExecute:function(){
self._closeDropDown(true);
},onCancel:function(){
self._closeDropDown(true);
},onClose:function(){
_6ef.domNode.style.width=_6f0;
self.popupStateNode.removeAttribute("popupActive");
self._opened=false;
}});
if(this.domNode.offsetWidth>_6ef.domNode.offsetWidth){
var _6f2=null;
if(!this.isLeftToRight()){
_6f2=_6ef.domNode.parentNode;
var _6f3=_6f2.offsetLeft+_6f2.offsetWidth;
}
dojo.marginBox(_6ef.domNode,{w:this.domNode.offsetWidth});
if(_6f2){
_6f2.style.left=_6f3-this.domNode.offsetWidth+"px";
}
}
this.popupStateNode.setAttribute("popupActive","true");
this._opened=true;
if(_6ef.focus){
_6ef.focus();
}
},_closeDropDown:function(_6f4){
if(this._opened){
dijit.popup.close(this.dropDown);
if(_6f4){
this.focus();
}
this._opened=false;
}
}});
dojo.declare("dijit.form.ComboButton",dijit.form.DropDownButton,{templateString:"<table class='dijit dijitReset dijitInline dijitLeft'\r\n\tcellspacing='0' cellpadding='0' waiRole=\"presentation\"\r\n\t><tbody waiRole=\"presentation\"><tr waiRole=\"presentation\"\r\n\t\t><td class=\"dijitReset dijitStretch dijitButtonContents dijitButtonNode\"\r\n\t\t\tdojoAttachEvent=\"ondijitclick:_onButtonClick,onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\"  dojoAttachPoint=\"titleNode\"\r\n\t\t\twaiRole=\"button\" waiState=\"labelledby-${id}_label\"\r\n\t\t\t><div class=\"dijitReset dijitInline\" dojoAttachPoint=\"iconNode\" waiRole=\"presentation\"></div\r\n\t\t\t><div class=\"dijitReset dijitInline dijitButtonText\" id=\"${id}_label\" dojoAttachPoint=\"containerNode\" waiRole=\"presentation\"></div\r\n\t\t></td\r\n\t\t><td class='dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton'\r\n\t\t\tdojoAttachPoint=\"popupStateNode,focusNode\"\r\n\t\t\tdojoAttachEvent=\"ondijitclick:_onArrowClick, onkeypress:_onKey,onmouseenter:_onMouse,onmouseleave:_onMouse\"\r\n\t\t\tstateModifier=\"DownArrow\"\r\n\t\t\ttitle=\"${optionsTitle}\" ${nameAttrSetting}\r\n\t\t\twaiRole=\"button\" waiState=\"haspopup-true\"\r\n\t\t\t><div class=\"dijitReset dijitArrowButtonInner\" waiRole=\"presentation\">&thinsp;</div\r\n\t\t\t><div class=\"dijitReset dijitArrowButtonChar\" waiRole=\"presentation\">&#9660;</div\r\n\t\t></td\r\n\t></tr></tbody\r\n></table>\r\n",attributeMap:dojo.mixin(dojo.clone(dijit.form.Button.prototype.attributeMap),{id:"",tabIndex:["focusNode","titleNode"]}),optionsTitle:"",baseClass:"dijitComboButton",_focusedNode:null,postCreate:function(){
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
},_setCheckedAttr:function(_6fc){
this.checked=_6fc;
dojo.attr(this.focusNode||this.domNode,"checked",_6fc);
dijit.setWaiState(this.focusNode||this.domNode,"pressed",_6fc);
this._setStateClass();
this._handleOnChange(_6fc,true);
},setChecked:function(_6fd){
dojo.deprecated("setChecked("+_6fd+") is deprecated. Use attr('checked',"+_6fd+") instead.","","2.0");
this.attr("checked",_6fd);
},reset:function(){
this._hasBeenBlurred=false;
this.attr("checked",this.params.checked||false);
}});
}
if(!dojo._hasResource["dijit.form.CheckBox"]){
dojo._hasResource["dijit.form.CheckBox"]=true;
dojo.provide("dijit.form.CheckBox");
dojo.declare("dijit.form.CheckBox",dijit.form.ToggleButton,{templateString:"<div class=\"dijitReset dijitInline\" waiRole=\"presentation\"\r\n\t><input\r\n\t \t${nameAttrSetting} type=\"${type}\" ${checkedAttrSetting}\r\n\t\tclass=\"dijitReset dijitCheckBoxInput\"\r\n\t\tdojoAttachPoint=\"focusNode\"\r\n\t \tdojoAttachEvent=\"onmouseover:_onMouse,onmouseout:_onMouse,onclick:_onClick\"\r\n/></div>\r\n",baseClass:"dijitCheckBox",type:"checkbox",value:"on",_setValueAttr:function(_6fe){
if(typeof _6fe=="string"){
this.value=_6fe;
dojo.attr(this.focusNode,"value",_6fe);
_6fe=true;
}
if(this._created){
this.attr("checked",_6fe);
}
},_getValueAttr:function(){
return (this.checked?this.value:false);
},postMixInProperties:function(){
if(this.value==""){
this.value="on";
}
this.checkedAttrSetting=this.checked?"checked":"";
this.inherited(arguments);
},_fillContent:function(_6ff){
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
dojo.declare("dijit.form.RadioButton",dijit.form.CheckBox,{type:"radio",baseClass:"dijitRadio",_setCheckedAttr:function(_700){
this.inherited(arguments);
if(!this._created){
return;
}
if(_700){
var _701=this;
dojo.query("INPUT[type=radio]",this.focusNode.form||dojo.doc).forEach(function(_702){
if(_702.name==_701.name&&_702!=_701.focusNode&&_702.form==_701.focusNode.form){
var _703=dijit.getEnclosingWidget(_702);
if(_703&&_703.checked){
_703.attr("checked",false);
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
if(!dojo._hasResource["dojo.cookie"]){
dojo._hasResource["dojo.cookie"]=true;
dojo.provide("dojo.cookie");
dojo.cookie=function(name,_706,_707){
var c=document.cookie;
if(arguments.length==1){
var _709=c.match(new RegExp("(?:^|; )"+dojo.regexp.escapeString(name)+"=([^;]*)"));
return _709?decodeURIComponent(_709[1]):undefined;
}else{
_707=_707||{};
var exp=_707.expires;
if(typeof exp=="number"){
var d=new Date();
d.setTime(d.getTime()+exp*24*60*60*1000);
exp=_707.expires=d;
}
if(exp&&exp.toUTCString){
_707.expires=exp.toUTCString();
}
_706=encodeURIComponent(_706);
var _70c=name+"="+_706,_70d;
for(_70d in _707){
_70c+="; "+_70d;
var _70e=_707[_70d];
if(_70e!==true){
_70c+="="+_70e;
}
}
document.cookie=_70c;
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
},_setupChild:function(_70f){
var _710=_70f.region;
if(_710){
this.inherited(arguments);
dojo.addClass(_70f.domNode,this.baseClass+"Pane");
var ltr=this.isLeftToRight();
if(_710=="leading"){
_710=ltr?"left":"right";
}
if(_710=="trailing"){
_710=ltr?"right":"left";
}
this["_"+_710]=_70f.domNode;
this["_"+_710+"Widget"]=_70f;
if((_70f.splitter||this.gutters)&&!this._splitters[_710]){
var _712=dojo.getObject(_70f.splitter?this._splitterClass:"dijit.layout._Gutter");
var flip={left:"right",right:"left",top:"bottom",bottom:"top",leading:"trailing",trailing:"leading"};
var _714=new _712({container:this,child:_70f,region:_710,oppNode:this["_"+flip[_70f.region]],live:this.liveSplitters});
_714.isSplitter=true;
this._splitters[_710]=_714.domNode;
dojo.place(this._splitters[_710],_70f.domNode,"after");
_714.startup();
}
_70f.region=_710;
}
},_computeSplitterThickness:function(_715){
this._splitterThickness[_715]=this._splitterThickness[_715]||dojo.marginBox(this._splitters[_715])[(/top|bottom/.test(_715)?"h":"w")];
},layout:function(){
for(var _716 in this._splitters){
this._computeSplitterThickness(_716);
}
this._layoutChildren();
},addChild:function(_717,_718){
this.inherited(arguments);
if(this._started){
this._layoutChildren();
}
},removeChild:function(_719){
var _71a=_719.region;
var _71b=this._splitters[_71a];
if(_71b){
dijit.byNode(_71b).destroy();
delete this._splitters[_71a];
delete this._splitterThickness[_71a];
}
this.inherited(arguments);
delete this["_"+_71a];
delete this["_"+_71a+"Widget"];
if(this._started){
this._layoutChildren(_719.region);
}
dojo.removeClass(_719.domNode,this.baseClass+"Pane");
},getChildren:function(){
return dojo.filter(this.inherited(arguments),function(_71c){
return !_71c.isSplitter;
});
},getSplitter:function(_71d){
var _71e=this._splitters[_71d];
return _71e?dijit.byNode(_71e):null;
},resize:function(_71f,_720){
if(!this.cs||!this.pe){
var node=this.domNode;
this.cs=dojo.getComputedStyle(node);
this.pe=dojo._getPadExtents(node,this.cs);
this.pe.r=dojo._toPixelValue(node,this.cs.paddingRight);
this.pe.b=dojo._toPixelValue(node,this.cs.paddingBottom);
dojo.style(node,"padding","0px");
}
this.inherited(arguments);
},_layoutChildren:function(_722){
if(!this._borderBox||!this._borderBox.h){
return;
}
var _723=(this.design=="sidebar");
var _724=0,_725=0,_726=0,_727=0;
var _728={},_729={},_72a={},_72b={},_72c=(this._center&&this._center.style)||{};
var _72d=/left|right/.test(_722);
var _72e=!_722||(!_72d&&!_723);
var _72f=!_722||(_72d&&_723);
if(this._top){
_728=_72f&&this._top.style;
_724=dojo.marginBox(this._top).h;
}
if(this._left){
_729=_72e&&this._left.style;
_726=dojo.marginBox(this._left).w;
}
if(this._right){
_72a=_72e&&this._right.style;
_727=dojo.marginBox(this._right).w;
}
if(this._bottom){
_72b=_72f&&this._bottom.style;
_725=dojo.marginBox(this._bottom).h;
}
var _730=this._splitters;
var _731=_730.top,_732=_730.bottom,_733=_730.left,_734=_730.right;
var _735=this._splitterThickness;
var _736=_735.top||0,_737=_735.left||0,_738=_735.right||0,_739=_735.bottom||0;
if(_737>50||_738>50){
setTimeout(dojo.hitch(this,function(){
this._splitterThickness={};
for(var _73a in this._splitters){
this._computeSplitterThickness(_73a);
}
this._layoutChildren();
}),50);
return false;
}
var pe=this.pe;
var _73c={left:(_723?_726+_737:0)+pe.l+"px",right:(_723?_727+_738:0)+pe.r+"px"};
if(_731){
dojo.mixin(_731.style,_73c);
_731.style.top=_724+pe.t+"px";
}
if(_732){
dojo.mixin(_732.style,_73c);
_732.style.bottom=_725+pe.b+"px";
}
_73c={top:(_723?0:_724+_736)+pe.t+"px",bottom:(_723?0:_725+_739)+pe.b+"px"};
if(_733){
dojo.mixin(_733.style,_73c);
_733.style.left=_726+pe.l+"px";
}
if(_734){
dojo.mixin(_734.style,_73c);
_734.style.right=_727+pe.r+"px";
}
dojo.mixin(_72c,{top:pe.t+_724+_736+"px",left:pe.l+_726+_737+"px",right:pe.r+_727+_738+"px",bottom:pe.b+_725+_739+"px"});
var _73d={top:_723?pe.t+"px":_72c.top,bottom:_723?pe.b+"px":_72c.bottom};
dojo.mixin(_729,_73d);
dojo.mixin(_72a,_73d);
_729.left=pe.l+"px";
_72a.right=pe.r+"px";
_728.top=pe.t+"px";
_72b.bottom=pe.b+"px";
if(_723){
_728.left=_72b.left=_726+_737+pe.l+"px";
_728.right=_72b.right=_727+_738+pe.r+"px";
}else{
_728.left=_72b.left=pe.l+"px";
_728.right=_72b.right=pe.r+"px";
}
var _73e=this._borderBox.h-pe.t-pe.b,_73f=_73e-(_724+_736+_725+_739),_740=_723?_73e:_73f;
var _741=this._borderBox.w-pe.l-pe.r,_742=_741-(_726+_737+_727+_738),_743=_723?_742:_741;
var dim={top:{w:_743,h:_724},bottom:{w:_743,h:_725},left:{w:_726,h:_740},right:{w:_727,h:_740},center:{h:_73f,w:_742}};
var _745=dojo.isIE<8||(dojo.isIE&&dojo.isQuirks)||dojo.some(this.getChildren(),function(_746){
return _746.domNode.tagName=="TEXTAREA"||_746.domNode.tagName=="INPUT";
});
if(_745){
var _747=function(_748,_749,_74a){
if(_748){
(_748.resize?_748.resize(_749,_74a):dojo.marginBox(_748.domNode,_749));
}
};
if(_733){
_733.style.height=_740;
}
if(_734){
_734.style.height=_740;
}
_747(this._leftWidget,{h:_740},dim.left);
_747(this._rightWidget,{h:_740},dim.right);
if(_731){
_731.style.width=_743;
}
if(_732){
_732.style.width=_743;
}
_747(this._topWidget,{w:_743},dim.top);
_747(this._bottomWidget,{w:_743},dim.bottom);
_747(this._centerWidget,dim.center);
}else{
var _74b={};
if(_722){
_74b[_722]=_74b.center=true;
if(/top|bottom/.test(_722)&&this.design!="sidebar"){
_74b.left=_74b.right=true;
}else{
if(/left|right/.test(_722)&&this.design=="sidebar"){
_74b.top=_74b.bottom=true;
}
}
}
dojo.forEach(this.getChildren(),function(_74c){
if(_74c.resize&&(!_722||_74c.region in _74b)){
_74c.resize(null,dim[_74c.region]);
}
},this);
}
},destroy:function(){
for(var _74d in this._splitters){
var _74e=this._splitters[_74d];
dijit.byNode(_74e).destroy();
dojo.destroy(_74e);
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
var _74f=dojo.cookie(this._cookieName);
if(_74f){
this.child.domNode.style[this.horizontal?"height":"width"]=_74f;
}
}
},_computeMaxSize:function(){
var dim=this.horizontal?"h":"w",_751=this.container._splitterThickness[this.region];
var _752=dojo.contentBox(this.container.domNode)[dim]-(this.oppNode?dojo.marginBox(this.oppNode)[dim]:0)-20-_751*2;
this._maxSize=Math.min(this.child.maxSize,_752);
},_startDrag:function(e){
if(this.child.domNode._recalc){
this._computeMaxSize();
this.child.domNode._recalc=false;
}
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
dojo.addClass(this.domNode,"dijitSplitterActive");
var _754=this._factor,max=this._maxSize,min=this._minSize||20,_757=this.horizontal,axis=_757?"pageY":"pageX",_759=e[axis],_75a=this.domNode.style,dim=_757?"h":"w",_75c=dojo.marginBox(this.child.domNode)[dim],_75d=this.region,_75e=parseInt(this.domNode.style[_75d],10),_75f=this._resize,mb={},_761=this.child.domNode,_762=dojo.hitch(this.container,this.container._layoutChildren),de=dojo.doc.body;
this._handlers=(this._handlers||[]).concat([dojo.connect(de,"onmousemove",this._drag=function(e,_765){
var _766=e[axis]-_759,_767=_754*_766+_75c,_768=Math.max(Math.min(_767,max),min);
if(_75f||_765){
mb[dim]=_768;
dojo.marginBox(_761,mb);
_762(_75d);
}
_75a[_75d]=_754*_766+_75e+(_768-_767)+"px";
}),dojo.connect(dojo.doc,"ondragstart",dojo.stopEvent),dojo.connect(dojo.body(),"onselectstart",dojo.stopEvent),dojo.connect(de,"onmouseup",this,"_stopDrag")]);
dojo.stopEvent(e);
},_stopDrag:function(e){
try{
if(this.cover){
dojo.removeClass(this.cover,"dijitSplitterCoverActive");
}
if(this.fake){
dojo.destroy(this.fake);
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
var _76b=this.horizontal;
var tick=1;
var dk=dojo.keys;
switch(e.charOrCode){
case _76b?dk.UP_ARROW:dk.LEFT_ARROW:
tick*=-1;
case _76b?dk.DOWN_ARROW:dk.RIGHT_ARROW:
break;
default:
return;
}
var _76e=dojo.marginBox(this.child.domNode)[_76b?"h":"w"]+this._factor*tick;
var mb={};
mb[this.horizontal?"h":"w"]=Math.max(Math.min(_76e,this._maxSize),this._minSize);
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
delete this.cover;
delete this.fake;
this.inherited(arguments);
}});
dojo.declare("dijit.layout._Gutter",[dijit._Widget,dijit._Templated],{templateString:"<div class=\"dijitGutter\" waiRole=\"presentation\"></div>",postCreate:function(){
this.horizontal=/top|bottom/.test(this.region);
dojo.addClass(this.domNode,"dijitGutter"+(this.horizontal?"H":"V"));
}});
}
if(!dojo._hasResource["dijit.form.ToggleButton"]){
dojo._hasResource["dijit.form.ToggleButton"]=true;
dojo.provide("dijit.form.ToggleButton");
}
if(!dojo._hasResource["dijit._KeyNavContainer"]){
dojo._hasResource["dijit._KeyNavContainer"]=true;
dojo.provide("dijit._KeyNavContainer");
dojo.declare("dijit._KeyNavContainer",[dijit._Container],{tabIndex:"0",_keyNavCodes:{},connectKeyNavHandlers:function(_770,_771){
var _772=this._keyNavCodes={};
var prev=dojo.hitch(this,this.focusPrev);
var next=dojo.hitch(this,this.focusNext);
dojo.forEach(_770,function(code){
_772[code]=prev;
});
dojo.forEach(_771,function(code){
_772[code]=next;
});
this.connect(this.domNode,"onkeypress","_onContainerKeypress");
this.connect(this.domNode,"onfocus","_onContainerFocus");
},startupKeyNavChildren:function(){
dojo.forEach(this.getChildren(),dojo.hitch(this,"_startupChild"));
},addChild:function(_777,_778){
dijit._KeyNavContainer.superclass.addChild.apply(this,arguments);
this._startupChild(_777);
},focus:function(){
this.focusFirstChild();
},focusFirstChild:function(){
this.focusChild(this._getFirstFocusableChild());
},focusNext:function(){
if(this.focusedChild&&this.focusedChild.hasNextFocalNode&&this.focusedChild.hasNextFocalNode()){
this.focusedChild.focusNext();
return;
}
var _779=this._getNextFocusableChild(this.focusedChild,1);
if(_779.getFocalNodes){
this.focusChild(_779,_779.getFocalNodes()[0]);
}else{
this.focusChild(_779);
}
},focusPrev:function(){
if(this.focusedChild&&this.focusedChild.hasPrevFocalNode&&this.focusedChild.hasPrevFocalNode()){
this.focusedChild.focusPrev();
return;
}
var _77a=this._getNextFocusableChild(this.focusedChild,-1);
if(_77a.getFocalNodes){
var _77b=_77a.getFocalNodes();
this.focusChild(_77a,_77b[_77b.length-1]);
}else{
this.focusChild(_77a);
}
},focusChild:function(_77c,node){
if(_77c){
if(this.focusedChild&&_77c!==this.focusedChild){
this._onChildBlur(this.focusedChild);
}
this.focusedChild=_77c;
if(node&&_77c.focusFocalNode){
_77c.focusFocalNode(node);
}else{
_77c.focus();
}
}
},_startupChild:function(_77e){
if(_77e.getFocalNodes){
dojo.forEach(_77e.getFocalNodes(),function(node){
dojo.attr(node,"tabindex",-1);
this._connectNode(node);
},this);
}else{
var node=_77e.focusNode||_77e.domNode;
if(_77e.isFocusable()){
dojo.attr(node,"tabindex",-1);
}
this._connectNode(node);
}
},_connectNode:function(node){
this.connect(node,"onfocus","_onNodeFocus");
this.connect(node,"onblur","_onNodeBlur");
},_onContainerFocus:function(evt){
if(evt.target!==this.domNode){
return;
}
this.focusFirstChild();
dojo.removeAttr(this.domNode,"tabIndex");
},_onBlur:function(evt){
if(this.tabIndex){
dojo.attr(this.domNode,"tabindex",this.tabIndex);
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
var _787=dijit.getEnclosingWidget(evt.target);
if(_787&&_787.isFocusable()){
this.focusedChild=_787;
}
dojo.stopEvent(evt);
},_onNodeBlur:function(evt){
dojo.stopEvent(evt);
},_onChildBlur:function(_789){
},_getFirstFocusableChild:function(){
return this._getNextFocusableChild(null,1);
},_getNextFocusableChild:function(_78a,dir){
if(_78a){
_78a=this._getSiblingOfChild(_78a,dir);
}
var _78c=this.getChildren();
for(var i=0;i<_78c.length;i++){
if(!_78a){
_78a=_78c[(dir>0)?0:(_78c.length-1)];
}
if(_78a.isFocusable()){
return _78a;
}
_78a=this._getSiblingOfChild(_78a,dir);
}
return null;
}});
}
if(!dojo._hasResource["dijit.MenuItem"]){
dojo._hasResource["dijit.MenuItem"]=true;
dojo.provide("dijit.MenuItem");
dojo.declare("dijit.MenuItem",[dijit._Widget,dijit._Templated,dijit._Contained],{templateString:"<tr class=\"dijitReset dijitMenuItem\" dojoAttachPoint=\"focusNode\" waiRole=\"menuitem\" tabIndex=\"-1\"\r\n\t\tdojoAttachEvent=\"onmouseenter:_onHover,onmouseleave:_onUnhover,ondijitclick:_onClick\">\r\n\t<td class=\"dijitReset\" waiRole=\"presentation\">\r\n\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitMenuItemIcon\" dojoAttachPoint=\"iconNode\">\r\n\t</td>\r\n\t<td class=\"dijitReset dijitMenuItemLabel\" colspan=\"2\" dojoAttachPoint=\"containerNode\"></td>\r\n\t<td class=\"dijitReset dijitMenuItemAccelKey\" style=\"display: none\" dojoAttachPoint=\"accelKeyNode\"></td>\r\n\t<td class=\"dijitReset dijitMenuArrowCell\" waiRole=\"presentation\">\r\n\t\t<div dojoAttachPoint=\"arrowWrapper\" style=\"visibility: hidden\">\r\n\t\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitMenuExpand\">\r\n\t\t\t<span class=\"dijitMenuExpandA11y\">+</span>\r\n\t\t</div>\r\n\t</td>\r\n</tr>\r\n",attributeMap:dojo.delegate(dijit._Widget.prototype.attributeMap,{label:{node:"containerNode",type:"innerHTML"},iconClass:{node:"iconNode",type:"class"}}),label:"",iconClass:"",accelKey:"",disabled:false,_fillContent:function(_78e){
if(_78e&&!("label" in this.params)){
this.attr("label",_78e.innerHTML);
}
},postCreate:function(){
dojo.setSelectable(this.domNode,false);
dojo.attr(this.containerNode,"id",this.id+"_text");
dijit.setWaiState(this.domNode,"labelledby",this.id+"_text");
},_onHover:function(){
dojo.addClass(this.domNode,"dijitMenuItemHover");
this.getParent().onItemHover(this);
},_onUnhover:function(){
dojo.removeClass(this.domNode,"dijitMenuItemHover");
this.getParent().onItemUnhover(this);
},_onClick:function(evt){
this.getParent().onItemClick(this,evt);
dojo.stopEvent(evt);
},onClick:function(evt){
},focus:function(){
try{
dijit.focus(this.focusNode);
}
catch(e){
}
},_onFocus:function(){
this._setSelected(true);
},_setSelected:function(_791){
dojo.toggleClass(this.domNode,"dijitMenuItemSelected",_791);
},setLabel:function(_792){
dojo.deprecated("dijit.MenuItem.setLabel() is deprecated.  Use attr('label', ...) instead.","","2.0");
this.attr("label",_792);
},setDisabled:function(_793){
dojo.deprecated("dijit.Menu.setDisabled() is deprecated.  Use attr('disabled', bool) instead.","","2.0");
this.attr("disabled",_793);
},_setDisabledAttr:function(_794){
this.disabled=_794;
dojo[_794?"addClass":"removeClass"](this.domNode,"dijitMenuItemDisabled");
dijit.setWaiState(this.focusNode,"disabled",_794?"true":"false");
},_setAccelKeyAttr:function(_795){
this.accelKey=_795;
this.accelKeyNode.style.display=_795?"":"none";
this.accelKeyNode.innerHTML=_795;
dojo.attr(this.containerNode,"colSpan",_795?"1":"2");
}});
}
if(!dojo._hasResource["dijit.PopupMenuItem"]){
dojo._hasResource["dijit.PopupMenuItem"]=true;
dojo.provide("dijit.PopupMenuItem");
dojo.declare("dijit.PopupMenuItem",dijit.MenuItem,{_fillContent:function(){
if(this.srcNodeRef){
var _796=dojo.query("*",this.srcNodeRef);
dijit.PopupMenuItem.superclass._fillContent.call(this,_796[0]);
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
if(this.arrowWrapper){
dojo.style(this.arrowWrapper,"visibility","");
}
dijit.setWaiState(this.focusNode,"haspopup","true");
},destroyDescendants:function(){
if(this.popup){
this.popup.destroyRecursive();
delete this.popup;
}
this.inherited(arguments);
}});
}
if(!dojo._hasResource["dijit.CheckedMenuItem"]){
dojo._hasResource["dijit.CheckedMenuItem"]=true;
dojo.provide("dijit.CheckedMenuItem");
dojo.declare("dijit.CheckedMenuItem",dijit.MenuItem,{templateString:"<tr class=\"dijitReset dijitMenuItem\" dojoAttachPoint=\"focusNode\" waiRole=\"menuitemcheckbox\" tabIndex=\"-1\"\r\n\t\tdojoAttachEvent=\"onmouseenter:_onHover,onmouseleave:_onUnhover,ondijitclick:_onClick\">\r\n\t<td class=\"dijitReset\" waiRole=\"presentation\">\r\n\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitMenuItemIcon dijitCheckedMenuItemIcon\" dojoAttachPoint=\"iconNode\">\r\n\t\t<span class=\"dijitCheckedMenuItemIconChar\">&#10003;</span>\r\n\t</td>\r\n\t<td class=\"dijitReset dijitMenuItemLabel\" colspan=\"2\" dojoAttachPoint=\"containerNode,labelNode\"></td>\r\n\t<td class=\"dijitReset dijitMenuItemAccelKey\" style=\"display: none\" dojoAttachPoint=\"accelKeyNode\"></td>\r\n\t<td class=\"dijitReset dijitMenuArrowCell\" waiRole=\"presentation\">\r\n\t</td>\r\n</tr>\r\n",checked:false,_setCheckedAttr:function(_798){
dojo.toggleClass(this.domNode,"dijitCheckedMenuItemChecked",_798);
dijit.setWaiState(this.domNode,"checked",_798);
this.checked=_798;
},onChange:function(_799){
},_onClick:function(e){
if(!this.disabled){
this.attr("checked",!this.checked);
this.onChange(this.checked);
}
this.inherited(arguments);
}});
}
if(!dojo._hasResource["dijit.MenuSeparator"]){
dojo._hasResource["dijit.MenuSeparator"]=true;
dojo.provide("dijit.MenuSeparator");
dojo.declare("dijit.MenuSeparator",[dijit._Widget,dijit._Templated,dijit._Contained],{templateString:"<tr class=\"dijitMenuSeparator\">\r\n\t<td colspan=\"4\">\r\n\t\t<div class=\"dijitMenuSeparatorTop\"></div>\r\n\t\t<div class=\"dijitMenuSeparatorBottom\"></div>\r\n\t</td>\r\n</tr>\r\n",postCreate:function(){
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
dojo.forEach(this.getChildren(),function(_79b){
_79b.startup();
});
this.startupKeyNavChildren();
this.inherited(arguments);
},onExecute:function(){
},onCancel:function(_79c){
},_moveToPopup:function(evt){
if(this.focusedChild&&this.focusedChild.popup&&!this.focusedChild.disabled){
this.focusedChild._onClick(evt);
}else{
var _79e=this._getTopMenu();
if(_79e&&_79e._isMenuBar){
_79e.focusNext();
}
}
},onItemHover:function(item){
if(this.isActive){
this.focusChild(item);
if(this.focusedChild.popup&&!this.focusedChild.disabled&&!this.hover_timer){
this.hover_timer=setTimeout(dojo.hitch(this,"_openPopup"),this.popupDelay);
}
}
},_onChildBlur:function(item){
item._setSelected(false);
dijit.popup.close(item.popup);
this._stopPopupTimer();
},onItemUnhover:function(item){
if(this.isActive){
this._stopPopupTimer();
}
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
this.focusChild(item);
if(item.popup){
if(!this.is_open){
this._openPopup();
}
}else{
this.onExecute();
item.onClick(evt);
}
},_openPopup:function(){
this._stopPopupTimer();
var _7a5=this.focusedChild;
var _7a6=_7a5.popup;
if(_7a6.isShowingNow){
return;
}
_7a6.parentMenu=this;
var self=this;
dijit.popup.open({parent:this,popup:_7a6,around:_7a5.domNode,orient:this._orient||(this.isLeftToRight()?{"TR":"TL","TL":"TR"}:{"TL":"TR","TR":"TL"}),onCancel:function(){
dijit.popup.close(_7a6);
_7a5.focus();
self.currentPopup=null;
},onExecute:dojo.hitch(this,"_onDescendantExecute")});
this.currentPopup=_7a6;
if(_7a6.focus){
setTimeout(dojo.hitch(_7a6,"focus"),0);
}
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
},_onFocus:function(){
this.isActive=true;
dojo.addClass(this.domNode,"dijitMenuActive");
dojo.removeClass(this.domNode,"dijitMenuPassive");
this.inherited(arguments);
},_onBlur:function(){
this.isActive=false;
dojo.removeClass(this.domNode,"dijitMenuActive");
dojo.addClass(this.domNode,"dijitMenuPassive");
this.onClose();
this.inherited(arguments);
},_onDescendantExecute:function(){
this.onClose();
}});
dojo.declare("dijit.Menu",dijit._MenuBase,{constructor:function(){
this._bindings=[];
},templateString:"<table class=\"dijit dijitMenu dijitMenuPassive dijitReset dijitMenuTable\" waiRole=\"menu\" tabIndex=\"${tabIndex}\" dojoAttachEvent=\"onkeypress:_onKeyPress\">\r\n\t<tbody class=\"dijitReset\" dojoAttachPoint=\"containerNode\"></tbody>\r\n</table>\r\n",targetNodeIds:[],contextMenuForWindow:false,leftClickToOpen:false,_contextMenuWithMouse:false,postCreate:function(){
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
},_iframeContentWindow:function(_7ac){
var win=dijit.getDocumentWindow(dijit.Menu._iframeContentDocument(_7ac))||dijit.Menu._iframeContentDocument(_7ac)["__parent__"]||(_7ac.name&&dojo.doc.frames[_7ac.name])||null;
return win;
},_iframeContentDocument:function(_7ae){
var doc=_7ae.contentDocument||(_7ae.contentWindow&&_7ae.contentWindow.document)||(_7ae.name&&dojo.doc.frames[_7ae.name]&&dojo.doc.frames[_7ae.name].document)||null;
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
},unBindDomNode:function(_7b3){
var node=dojo.byId(_7b3);
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
var _7bd=dojo.coords(e.target,true);
x=_7bd.x+10;
y=_7bd.y+10;
}
var self=this;
var _7bf=dijit.getFocus(this);
function _7c0(){
dijit.focus(_7bf);
dijit.popup.close(self);
};
dijit.popup.open({popup:this,x:x,y:y,onExecute:_7c0,onCancel:_7c0,orient:this.isLeftToRight()?"L":"R"});
this.focus();
this._onBlur=function(){
this.inherited("_onBlur",arguments);
dijit.popup.close(this);
};
},uninitialize:function(){
dojo.forEach(this.targetNodeIds,this.unBindDomNode,this);
this.inherited(arguments);
}});
}
if(!dojo._hasResource["dijit.layout.StackController"]){
dojo._hasResource["dijit.layout.StackController"]=true;
dojo.provide("dijit.layout.StackController");
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
},onAddChild:function(page,_7c4){
var _7c5=dojo.doc.createElement("span");
this.domNode.appendChild(_7c5);
var cls=dojo.getObject(this.buttonWidget);
var _7c7=new cls({label:page.title,closeButton:page.closable},_7c5);
this.addChild(_7c7,_7c4);
this.pane2button[page]=_7c7;
page.controlButton=_7c7;
var _7c8=[];
_7c8.push(dojo.connect(_7c7,"onClick",dojo.hitch(this,"onButtonClick",page)));
if(page.closable){
_7c8.push(dojo.connect(_7c7,"onClickCloseButton",dojo.hitch(this,"onCloseButtonClick",page)));
var _7c9=dojo.i18n.getLocalization("dijit","common");
var _7ca=new dijit.Menu({targetNodeIds:[_7c7.id],id:_7c7.id+"_Menu"});
var _7cb=new dijit.MenuItem({label:_7c9.itemClose});
_7c8.push(dojo.connect(_7cb,"onClick",dojo.hitch(this,"onCloseButtonClick",page)));
_7ca.addChild(_7cb);
this.pane2menu[page]=_7ca;
}
this.pane2handles[page]=_7c8;
if(!this._currentChild){
_7c7.focusNode.setAttribute("tabIndex","0");
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
var _7ce=this.pane2button[page];
if(_7ce){
_7ce.destroy();
delete this.pane2button[page];
}
},onSelectChild:function(page){
if(!page){
return;
}
if(this._currentChild){
var _7d0=this.pane2button[this._currentChild];
_7d0.attr("checked",false);
_7d0.focusNode.setAttribute("tabIndex","-1");
}
var _7d1=this.pane2button[page];
_7d1.attr("checked",true);
this._currentChild=page;
_7d1.focusNode.setAttribute("tabIndex","0");
var _7d2=dijit.byId(this.containerId);
dijit.setWaiState(_7d2.containerNode,"labelledby",_7d1.id);
},onButtonClick:function(page){
var _7d4=dijit.byId(this.containerId);
_7d4.selectChild(page);
},onCloseButtonClick:function(page){
var _7d6=dijit.byId(this.containerId);
_7d6.closeChild(page);
var b=this.pane2button[this._currentChild];
if(b){
dijit.focus(b.focusNode||b.domNode);
}
},adjacent:function(_7d8){
if(!this.isLeftToRight()&&(!this.tabPosition||/top|bottom/.test(this.tabPosition))){
_7d8=!_7d8;
}
var _7d9=this.getChildren();
var _7da=dojo.indexOf(_7d9,this.pane2button[this._currentChild]);
var _7db=_7d8?1:_7d9.length-1;
return _7d9[(_7da+_7db)%_7d9.length];
},onkeypress:function(e){
if(this.disabled||e.altKey){
return;
}
var _7dd=null;
if(e.ctrlKey||!e._djpage){
var k=dojo.keys;
switch(e.charOrCode){
case k.LEFT_ARROW:
case k.UP_ARROW:
if(!e._djpage){
_7dd=false;
}
break;
case k.PAGE_UP:
if(e.ctrlKey){
_7dd=false;
}
break;
case k.RIGHT_ARROW:
case k.DOWN_ARROW:
if(!e._djpage){
_7dd=true;
}
break;
case k.PAGE_DOWN:
if(e.ctrlKey){
_7dd=true;
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
if(_7dd!==null){
this.adjacent(_7dd).onClick();
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
}
if(!dojo._hasResource["dijit.layout.StackContainer"]){
dojo._hasResource["dijit.layout.StackContainer"]=true;
dojo.provide("dijit.layout.StackContainer");
dojo.declare("dijit.layout.StackContainer",dijit.layout._LayoutWidget,{doLayout:true,persist:false,baseClass:"dijitStackContainer",_started:false,postCreate:function(){
this.inherited(arguments);
dojo.addClass(this.domNode,"dijitLayoutContainer");
dijit.setWaiRole(this.containerNode,"tabpanel");
this.connect(this.domNode,"onkeypress",this._onKeyPress);
},startup:function(){
if(this._started){
return;
}
var _7e3=this.getChildren();
dojo.forEach(_7e3,this._setupChild,this);
if(this.persist){
this.selectedChildWidget=dijit.byId(dojo.cookie(this.id+"_selectedChild"));
}else{
dojo.some(_7e3,function(_7e4){
if(_7e4.selected){
this.selectedChildWidget=_7e4;
}
return _7e4.selected;
},this);
}
var _7e5=this.selectedChildWidget;
if(!_7e5&&_7e3[0]){
_7e5=this.selectedChildWidget=_7e3[0];
_7e5.selected=true;
}
dojo.publish(this.id+"-startup",[{children:_7e3,selected:_7e5}]);
if(_7e5){
this._showChild(_7e5);
}
this.inherited(arguments);
},_setupChild:function(_7e6){
this.inherited(arguments);
dojo.removeClass(_7e6.domNode,"dijitVisible");
dojo.addClass(_7e6.domNode,"dijitHidden");
_7e6.domNode.title="";
return _7e6;
},addChild:function(_7e7,_7e8){
this.inherited(arguments);
if(this._started){
dojo.publish(this.id+"-addChild",[_7e7,_7e8]);
this.layout();
if(!this.selectedChildWidget){
this.selectChild(_7e7);
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
var _7ea=this.getChildren();
if(_7ea.length){
this.selectChild(_7ea[0]);
}
}
}
},selectChild:function(page){
page=dijit.byId(page);
if(this.selectedChildWidget!=page){
this._transition(page,this.selectedChildWidget);
this.selectedChildWidget=page;
dojo.publish(this.id+"-selectChild",[page]);
if(this.persist){
dojo.cookie(this.id+"_selectedChild",this.selectedChildWidget.id);
}
}
},_transition:function(_7ec,_7ed){
if(_7ed){
this._hideChild(_7ed);
}
this._showChild(_7ec);
if(this.doLayout&&_7ec.resize){
_7ec.resize(this._containerContentBox||this._contentBox);
}
},_adjacent:function(_7ee){
var _7ef=this.getChildren();
var _7f0=dojo.indexOf(_7ef,this.selectedChildWidget);
_7f0+=_7ee?1:_7ef.length-1;
return _7ef[_7f0%_7ef.length];
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
var _7f3=this.getChildren();
page.isFirstChild=(page==_7f3[0]);
page.isLastChild=(page==_7f3[_7f3.length-1]);
page.selected=true;
dojo.removeClass(page.domNode,"dijitHidden");
dojo.addClass(page.domNode,"dijitVisible");
if(page._onShow){
page._onShow();
}else{
if(page.onShow){
page.onShow();
}
}
},_hideChild:function(page){
page.selected=false;
dojo.removeClass(page.domNode,"dijitVisible");
dojo.addClass(page.domNode,"dijitHidden");
if(page.onHide){
page.onHide();
}
},closeChild:function(page){
var _7f6=page.onClose(this,page);
if(_7f6){
this.removeChild(page);
page.destroyRecursive();
}
},destroy:function(){
this._beingDestroyed=true;
this.inherited(arguments);
}});
dojo.extend(dijit._Widget,{title:"",selected:false,closable:false,onClose:function(){
return true;
}});
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
var _7f7=this.selectedChildWidget.containerNode.style;
_7f7.display="";
_7f7.overflow="auto";
this.selectedChildWidget._buttonWidget._setSelectedState(true);
}
},_getTargetHeight:function(node){
var cs=dojo.getComputedStyle(node);
return Math.max(this._verticalSpace-dojo._getPadBorderExtents(node,cs).h,0);
},layout:function(){
var _7fa=this.selectedChildWidget;
var _7fb=0;
dojo.forEach(this.getChildren(),function(_7fc){
_7fb+=_7fc._buttonWidget.getTitleHeight();
});
var _7fd=this._contentBox;
this._verticalSpace=_7fd.h-_7fb;
this._containerContentBox={h:this._verticalSpace,w:_7fd.w};
if(_7fa){
_7fa.resize(this._containerContentBox);
}
},_setupChild:function(_7fe){
_7fe._buttonWidget=new dijit.layout._AccordionButton({contentWidget:_7fe,title:_7fe.title,id:_7fe.id+"_button",parent:this});
dojo.place(_7fe._buttonWidget.domNode,_7fe.domNode,"before");
this.inherited(arguments);
},removeChild:function(_7ff){
_7ff._buttonWidget.destroy();
this.inherited(arguments);
},getChildren:function(){
return dojo.filter(this.inherited(arguments),function(_800){
return _800.declaredClass!="dijit.layout._AccordionButton";
});
},destroy:function(){
dojo.forEach(this.getChildren(),function(_801){
_801._buttonWidget.destroy();
});
this.inherited(arguments);
},_transition:function(_802,_803){
if(this._inTransition){
return;
}
this._inTransition=true;
var _804=[];
var _805=this._verticalSpace;
if(_802){
_802._buttonWidget.setSelected(true);
this._showChild(_802);
if(this.doLayout&&_802.resize){
_802.resize(this._containerContentBox);
}
var _806=_802.domNode;
dojo.addClass(_806,"dijitVisible");
dojo.removeClass(_806,"dijitHidden");
var _807=_806.style.overflow;
_806.style.overflow="hidden";
_804.push(dojo.animateProperty({node:_806,duration:this.duration,properties:{height:{start:1,end:this._getTargetHeight(_806)}},onEnd:dojo.hitch(this,function(){
_806.style.overflow=_807;
delete this._inTransition;
})}));
}
if(_803){
_803._buttonWidget.setSelected(false);
var _808=_803.domNode,_809=_808.style.overflow;
_808.style.overflow="hidden";
_804.push(dojo.animateProperty({node:_808,duration:this.duration,properties:{height:{start:this._getTargetHeight(_808),end:1}},onEnd:function(){
dojo.addClass(_808,"dijitHidden");
dojo.removeClass(_808,"dijitVisible");
_808.style.overflow=_809;
if(_803.onHide){
_803.onHide();
}
}}));
}
dojo.fx.combine(_804).play();
},_onKeyPress:function(e,_80b){
if(this._inTransition||this.disabled||e.altKey||!(_80b||e.ctrlKey)){
if(this._inTransition){
dojo.stopEvent(e);
}
return;
}
var k=dojo.keys,c=e.charOrCode;
if((_80b&&(c==k.LEFT_ARROW||c==k.UP_ARROW))||(e.ctrlKey&&c==k.PAGE_UP)){
this._adjacent(false)._buttonWidget._onTitleClick();
dojo.stopEvent(e);
}else{
if((_80b&&(c==k.RIGHT_ARROW||c==k.DOWN_ARROW))||(e.ctrlKey&&(c==k.PAGE_DOWN||c==k.TAB))){
this._adjacent(true)._buttonWidget._onTitleClick();
dojo.stopEvent(e);
}
}
}});
dojo.declare("dijit.layout._AccordionButton",[dijit._Widget,dijit._Templated],{templateString:"<div dojoAttachPoint='titleNode,focusNode' dojoAttachEvent='ondijitclick:_onTitleClick,onkeypress:_onTitleKeyPress,onfocus:_handleFocus,onblur:_handleFocus,onmouseenter:_onTitleEnter,onmouseleave:_onTitleLeave'\r\n\t\tclass='dijitAccordionTitle' wairole=\"tab\" waiState=\"expanded-false\"\r\n\t\t><span class='dijitInline dijitAccordionArrow' waiRole=\"presentation\"></span\r\n\t\t><span class='arrowTextUp' waiRole=\"presentation\">+</span\r\n\t\t><span class='arrowTextDown' waiRole=\"presentation\">-</span\r\n\t\t><span waiRole=\"presentation\" dojoAttachPoint='titleTextNode' class='dijitAccordionText'></span>\r\n</div>\r\n",attributeMap:dojo.mixin(dojo.clone(dijit.layout.ContentPane.prototype.attributeMap),{title:{node:"titleTextNode",type:"innerHTML"}}),baseClass:"dijitAccordionTitle",getParent:function(){
return this.parent;
},postCreate:function(){
this.inherited(arguments);
dojo.setSelectable(this.domNode,false);
this.setSelected(this.selected);
var _80e=dojo.attr(this.domNode,"id").replace(" ","_");
dojo.attr(this.titleTextNode,"id",_80e+"_title");
dijit.setWaiState(this.focusNode,"labelledby",dojo.attr(this.titleTextNode,"id"));
},getTitleHeight:function(){
return dojo.marginBox(this.titleNode).h;
},_onTitleClick:function(){
var _80f=this.getParent();
if(!_80f._inTransition){
_80f.selectChild(this.contentWidget);
dijit.focus(this.focusNode);
}
},_onTitleEnter:function(){
dojo.addClass(this.focusNode,"dijitAccordionTitle-hover");
},_onTitleLeave:function(){
dojo.removeClass(this.focusNode,"dijitAccordionTitle-hover");
},_onTitleKeyPress:function(evt){
return this.getParent()._onKeyPress(evt,this.contentWidget);
},_setSelectedState:function(_811){
this.selected=_811;
dojo[(_811?"addClass":"removeClass")](this.titleNode,"dijitAccordionTitle-selected");
dijit.setWaiState(this.focusNode,"expanded",_811);
dijit.setWaiState(this.focusNode,"selected",_811);
this.focusNode.setAttribute("tabIndex",_811?"0":"-1");
},_handleFocus:function(e){
dojo[(e.type=="focus"?"addClass":"removeClass")](this.focusNode,"dijitAccordionFocused");
},setSelected:function(_813){
this._setSelectedState(_813);
if(_813){
var cw=this.contentWidget;
if(cw.onSelected){
cw.onSelected();
}
}
}});
}
if(!dojo._hasResource["dijit.layout.TabController"]){
dojo._hasResource["dijit.layout.TabController"]=true;
dojo.provide("dijit.layout.TabController");
dojo.declare("dijit.layout.TabController",dijit.layout.StackController,{templateString:"<div wairole='tablist' dojoAttachEvent='onkeypress:onkeypress'></div>",tabPosition:"top",doLayout:true,buttonWidget:"dijit.layout._TabButton",_rectifyRtlTabList:function(){
if(0>=this.tabPosition.indexOf("-h")){
return;
}
if(!this.pane2button){
return;
}
var _815=0;
for(var pane in this.pane2button){
var ow=this.pane2button[pane].innerDiv.scrollWidth;
_815=Math.max(_815,ow);
}
for(pane in this.pane2button){
this.pane2button[pane].innerDiv.style.width=_815+"px";
}
}});
dojo.declare("dijit.layout._TabButton",dijit.layout._StackButton,{baseClass:"dijitTab",templateString:"<div waiRole=\"presentation\" dojoAttachEvent='onclick:onClick,onmouseenter:_onMouse,onmouseleave:_onMouse'>\r\n    <div waiRole=\"presentation\" class='dijitTabInnerDiv' dojoAttachPoint='innerDiv'>\r\n        <div waiRole=\"presentation\" class='dijitTabContent' dojoAttachPoint='tabContent'>\r\n\t        <span dojoAttachPoint='containerNode,focusNode' class='tabLabel'>${!label}</span><img class =\"dijitTabButtonSpacer\" src=\"${_blankGif}\" />\r\n\t        <span class=\"closeButton\" dojoAttachPoint='closeNode'\r\n\t        \t\tdojoAttachEvent='onclick: onClickCloseButton, onmouseenter: _onCloseButtonEnter, onmouseleave: _onCloseButtonLeave'>\r\n\t        \t<img src=\"${_blankGif}\" alt=\"\" dojoAttachPoint='closeIcon' class='closeImage' waiRole=\"presentation\"/>\r\n\t            <span dojoAttachPoint='closeText' class='closeText'>x</span>\r\n\t        </span>\r\n        </div>\r\n    </div>\r\n</div>\r\n",scrollOnFocus:false,postCreate:function(){
if(this.closeButton){
dojo.addClass(this.innerDiv,"dijitClosable");
var _818=dojo.i18n.getLocalization("dijit","common");
if(this.closeNode){
dojo.attr(this.closeNode,"title",_818.itemClose);
dojo.attr(this.closeIcon,"title",_818.itemClose);
}
}else{
this.closeNode.style.display="none";
}
this.inherited(arguments);
dojo.setSelectable(this.containerNode,false);
},_onCloseButtonEnter:function(){
dojo.addClass(this.closeNode,"closeButton-hover");
},_onCloseButtonLeave:function(){
dojo.removeClass(this.closeNode,"closeButton-hover");
}});
}
if(!dojo._hasResource["dijit.layout.TabContainer"]){
dojo._hasResource["dijit.layout.TabContainer"]=true;
dojo.provide("dijit.layout.TabContainer");
dojo.declare("dijit.layout.TabContainer",[dijit.layout.StackContainer,dijit._Templated],{tabPosition:"top",baseClass:"dijitTabContainer",tabStrip:false,nested:false,templateString:null,templateString:"<div class=\"dijitTabContainer\">\r\n\t<div dojoAttachPoint=\"tablistNode\"></div>\r\n\t<div dojoAttachPoint=\"tablistSpacer\" class=\"dijitTabSpacer ${baseClass}-spacer\"></div>\r\n\t<div class=\"dijitTabPaneWrapper ${baseClass}-container\" dojoAttachPoint=\"containerNode\"></div>\r\n</div>\r\n",_controllerWidget:"dijit.layout.TabController",postMixInProperties:function(){
this.baseClass+=this.tabPosition.charAt(0).toUpperCase()+this.tabPosition.substr(1).replace(/-.*/,"");
this.inherited(arguments);
},postCreate:function(){
this.inherited(arguments);
var _819=dojo.getObject(this._controllerWidget);
this.tablist=new _819({id:this.id+"_tablist",tabPosition:this.tabPosition,doLayout:this.doLayout,containerId:this.id,"class":this.baseClass+"-tabs"+(this.doLayout?"":" dijitTabNoLayout")},this.tablistNode);
if(this.tabStrip){
dojo.addClass(this.tablist.domNode,this.baseClass+"Strip");
}
if(!this.doLayout){
dojo.addClass(this.domNode,"dijitTabContainerNoLayout");
}
if(this.nested){
dojo.addClass(this.domNode,"dijitTabContainerNested");
dojo.addClass(this.tablist.domNode,"dijitTabContainerTabListNested");
dojo.addClass(this.tablistSpacer,"dijitTabContainerSpacerNested");
dojo.addClass(this.containerNode,"dijitTabPaneWrapperNested");
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
var _81b=this.tabPosition.replace(/-h/,"");
var _81c=[{domNode:this.tablist.domNode,layoutAlign:_81b},{domNode:this.tablistSpacer,layoutAlign:_81b},{domNode:this.containerNode,layoutAlign:"client"}];
dijit.layout.layoutChildren(this.domNode,this._contentBox,_81c);
this._containerContentBox=dijit.layout.marginBox2contentBox(this.containerNode,_81c[2]);
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
}
if(!dojo._hasResource["dijit.tree.TreeStoreModel"]){
dojo._hasResource["dijit.tree.TreeStoreModel"]=true;
dojo.provide("dijit.tree.TreeStoreModel");
dojo.declare("dijit.tree.TreeStoreModel",null,{store:null,childrenAttrs:["children"],labelAttr:"",root:null,query:null,constructor:function(args){
dojo.mixin(this,args);
this.connects=[];
var _81e=this.store;
if(!_81e.getFeatures()["dojo.data.api.Identity"]){
throw new Error("dijit.Tree: store must support dojo.data.Identity");
}
if(_81e.getFeatures()["dojo.data.api.Notification"]){
this.connects=this.connects.concat([dojo.connect(_81e,"onNew",this,"_onNewItem"),dojo.connect(_81e,"onDelete",this,"_onDeleteItem"),dojo.connect(_81e,"onSet",this,"_onSetItem")]);
}
},destroy:function(){
dojo.forEach(this.connects,dojo.disconnect);
},getRoot:function(_81f,_820){
if(this.root){
_81f(this.root);
}else{
this.store.fetch({query:this.query,onComplete:dojo.hitch(this,function(_821){
if(_821.length!=1){
throw new Error(this.declaredClass+": query "+dojo.toJson(this.query)+" returned "+_821.length+" items, but must return exactly one item");
}
this.root=_821[0];
_81f(this.root);
}),onError:_820});
}
},mayHaveChildren:function(item){
return dojo.some(this.childrenAttrs,function(attr){
return this.store.hasAttribute(item,attr);
},this);
},getChildren:function(_824,_825,_826){
var _827=this.store;
var _828=[];
for(var i=0;i<this.childrenAttrs.length;i++){
var vals=_827.getValues(_824,this.childrenAttrs[i]);
_828=_828.concat(vals);
}
var _82b=0;
dojo.forEach(_828,function(item){
if(!_827.isItemLoaded(item)){
_82b++;
}
});
if(_82b==0){
_825(_828);
}else{
var _82d=function _82d(item){
if(--_82b==0){
_825(_828);
}
};
dojo.forEach(_828,function(item){
if(!_827.isItemLoaded(item)){
_827.loadItem({item:item,onItem:_82d,onError:_826});
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
},newItem:function(args,_833){
var _834={parent:_833,attribute:this.childrenAttrs[0]};
return this.store.newItem(args,_834);
},pasteItem:function(_835,_836,_837,_838,_839){
var _83a=this.store,_83b=this.childrenAttrs[0];
if(_836){
dojo.forEach(this.childrenAttrs,function(attr){
if(_83a.containsValue(_836,attr,_835)){
if(!_838){
var _83d=dojo.filter(_83a.getValues(_836,attr),function(x){
return x!=_835;
});
_83a.setValues(_836,attr,_83d);
}
_83b=attr;
}
});
}
if(_837){
if(typeof _839=="number"){
var _83f=_83a.getValues(_837,_83b);
_83f.splice(_839,0,_835);
_83a.setValues(_837,_83b,_83f);
}else{
_83a.setValues(_837,_83b,_83a.getValues(_837,_83b).concat(_835));
}
}
},onChange:function(item){
},onChildrenChange:function(_841,_842){
},onDelete:function(_843,_844){
},_onNewItem:function(item,_846){
if(!_846){
return;
}
this.getChildren(_846.item,dojo.hitch(this,function(_847){
this.onChildrenChange(_846.item,_847);
}));
},_onDeleteItem:function(item){
this.onDelete(item);
},_onSetItem:function(item,_84a,_84b,_84c){
if(dojo.indexOf(this.childrenAttrs,_84a)!=-1){
this.getChildren(item,dojo.hitch(this,function(_84d){
this.onChildrenChange(item,_84d);
}));
}else{
this.onChange(item);
}
}});
}
if(!dojo._hasResource["dijit.tree.ForestStoreModel"]){
dojo._hasResource["dijit.tree.ForestStoreModel"]=true;
dojo.provide("dijit.tree.ForestStoreModel");
dojo.declare("dijit.tree.ForestStoreModel",dijit.tree.TreeStoreModel,{rootId:"$root$",rootLabel:"ROOT",query:null,constructor:function(_84e){
this.root={store:this,root:true,id:_84e.rootId,label:_84e.rootLabel,children:_84e.rootChildren};
},mayHaveChildren:function(item){
return item===this.root||this.inherited(arguments);
},getChildren:function(_850,_851,_852){
if(_850===this.root){
if(this.root.children){
_851(this.root.children);
}else{
this.store.fetch({query:this.query,onComplete:dojo.hitch(this,function(_853){
this.root.children=_853;
_851(_853);
}),onError:_852});
}
}else{
this.inherited(arguments);
}
},getIdentity:function(item){
return (item===this.root)?this.root.id:this.inherited(arguments);
},getLabel:function(item){
return (item===this.root)?this.root.label:this.inherited(arguments);
},newItem:function(args,_857){
if(_857===this.root){
this.onNewRootItem(args);
return this.store.newItem(args);
}else{
return this.inherited(arguments);
}
},onNewRootItem:function(args){
},pasteItem:function(_859,_85a,_85b,_85c,_85d){
if(_85a===this.root){
if(!_85c){
this.onLeaveRoot(_859);
}
}
dijit.tree.TreeStoreModel.prototype.pasteItem.call(this,_859,_85a===this.root?null:_85a,_85b===this.root?null:_85b,_85c,_85d);
if(_85b===this.root){
this.onAddToRoot(_859);
}
},onAddToRoot:function(item){
console.log(this,": item ",item," added to root");
},onLeaveRoot:function(item){
console.log(this,": item ",item," removed from root");
},_requeryTop:function(){
var _860=this.root.children||[];
this.store.fetch({query:this.query,onComplete:dojo.hitch(this,function(_861){
this.root.children=_861;
if(_860.length!=_861.length||dojo.some(_860,function(item,idx){
return _861[idx]!=item;
})){
this.onChildrenChange(this.root,_861);
}
})});
},_onNewItem:function(item,_865){
this._requeryTop();
this.inherited(arguments);
},_onDeleteItem:function(item){
if(dojo.indexOf(this.root.children,item)!=-1){
this._requeryTop();
}
this.inherited(arguments);
}});
}
if(!dojo._hasResource["dijit.Tree"]){
dojo._hasResource["dijit.Tree"]=true;
dojo.provide("dijit.Tree");
dojo.declare("dijit._TreeNode",[dijit._Widget,dijit._Templated,dijit._Container,dijit._Contained],{item:null,isTreeNode:true,label:"",isExpandable:null,isExpanded:false,state:"UNCHECKED",templateString:"<div class=\"dijitTreeNode\" waiRole=\"presentation\"\r\n\t><div dojoAttachPoint=\"rowNode\" class=\"dijitTreeRow\" waiRole=\"presentation\" dojoAttachEvent=\"onmouseenter:_onMouseEnter, onmouseleave:_onMouseLeave\"\r\n\t\t><img src=\"${_blankGif}\" alt=\"\" dojoAttachPoint=\"expandoNode\" class=\"dijitTreeExpando\" waiRole=\"presentation\"\r\n\t\t><span dojoAttachPoint=\"expandoNodeText\" class=\"dijitExpandoText\" waiRole=\"presentation\"\r\n\t\t></span\r\n\t\t><span dojoAttachPoint=\"contentNode\"\r\n\t\t\tclass=\"dijitTreeContent\" waiRole=\"presentation\">\r\n\t\t\t<img src=\"${_blankGif}\" alt=\"\" dojoAttachPoint=\"iconNode\" class=\"dijitTreeIcon\" waiRole=\"presentation\"\r\n\t\t\t><span dojoAttachPoint=\"labelNode\" class=\"dijitTreeLabel\" wairole=\"treeitem\" tabindex=\"-1\" waiState=\"selected-false\" dojoAttachEvent=\"onfocus:_onLabelFocus, onblur:_onLabelBlur\"></span>\r\n\t\t</span\r\n\t></div>\r\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitTreeContainer\" waiRole=\"presentation\" style=\"display: none;\"></div>\r\n</div>\r\n",postCreate:function(){
this.setLabelNode(this.label);
this._setExpando();
this._updateItemClasses(this.item);
if(this.isExpandable){
dijit.setWaiState(this.labelNode,"expanded",this.isExpanded);
if(this==this.tree.rootNode){
dijit.setWaitState(this.tree.domNode,"expanded",this.isExpanded);
}
}
},_setIndentAttr:function(_867){
this.indent=_867;
var _868=(Math.max(_867,0)*19)+"px";
dojo.style(this.domNode,"backgroundPosition",_868+" 0px");
dojo.style(this.rowNode,dojo._isBodyLtr()?"paddingLeft":"paddingRight",_868);
dojo.forEach(this.getChildren(),function(_869){
_869.attr("indent",_867+1);
});
},markProcessing:function(){
this.state="LOADING";
this._setExpando(true);
},unmarkProcessing:function(){
this._setExpando(false);
},_updateItemClasses:function(item){
var tree=this.tree,_86c=tree.model;
if(tree._v10Compat&&item===_86c.root){
item=null;
}
if(this._iconClass){
dojo.removeClass(this.iconNode,this._iconClass);
}
this._iconClass=tree.getIconClass(item,this.isExpanded);
if(this._iconClass){
dojo.addClass(this.iconNode,this._iconClass);
}
dojo.style(this.iconNode,tree.getIconStyle(item,this.isExpanded)||{});
if(this._labelClass){
dojo.removeClass(this.labelNode,this._labelClass);
}
this._labelClass=tree.getLabelClass(item,this.isExpanded);
if(this._labelClass){
dojo.addClass(this.labelNode,this._labelClass);
}
dojo.style(this.labelNode,tree.getLabelStyle(item,this.isExpanded)||{});
},_updateLayout:function(){
var _86d=this.getParent();
if(!_86d||_86d.rowNode.style.display=="none"){
dojo.addClass(this.domNode,"dijitTreeIsRoot");
}else{
dojo.toggleClass(this.domNode,"dijitTreeIsLast",!this.getNextSibling());
}
},_setExpando:function(_86e){
var _86f=["dijitTreeExpandoLoading","dijitTreeExpandoOpened","dijitTreeExpandoClosed","dijitTreeExpandoLeaf"];
var _870=["*","-","+","*"];
var idx=_86e?0:(this.isExpandable?(this.isExpanded?1:2):3);
dojo.forEach(_86f,function(s){
dojo.removeClass(this.expandoNode,s);
},this);
dojo.addClass(this.expandoNode,_86f[idx]);
this.expandoNodeText.innerHTML=_870[idx];
},expand:function(){
if(this.isExpanded){
return;
}
this._wipeOut&&this._wipeOut.stop();
this.isExpanded=true;
dijit.setWaiState(this.labelNode,"expanded","true");
dijit.setWaiRole(this.containerNode,"group");
dojo.addClass(this.contentNode,"dijitTreeContentExpanded");
this._setExpando();
this._updateItemClasses(this.item);
if(this==this.tree.rootNode){
dijit.setWaiState(this.tree.domNode,"expanded","true");
}
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
},setLabelNode:function(_873){
this.labelNode.innerHTML="";
this.labelNode.appendChild(dojo.doc.createTextNode(_873));
},indent:0,setChildItems:function(_874){
var tree=this.tree,_876=tree.model;
this.getChildren().forEach(function(_877){
dijit._Container.prototype.removeChild.call(this,_877);
},this);
this.state="LOADED";
if(_874&&_874.length>0){
this.isExpandable=true;
dojo.forEach(_874,function(item){
var id=_876.getIdentity(item),_87a=tree._itemNodeMap[id],node=(_87a&&!_87a.getParent())?_87a:this.tree._createTreeNode({item:item,tree:tree,isExpandable:_876.mayHaveChildren(item),label:tree.getLabel(item),indent:this.indent+1});
if(_87a){
_87a.attr("indent",this.indent+1);
}
this.addChild(node);
tree._itemNodeMap[id]=node;
if(this.tree._state(item)){
tree._expandNode(node);
}
},this);
dojo.forEach(this.getChildren(),function(_87c,idx){
_87c._updateLayout();
});
}else{
this.isExpandable=false;
}
if(this._setExpando){
this._setExpando(false);
}
if(this==tree.rootNode){
var fc=this.tree.showRoot?this:this.getChildren()[0];
if(fc){
fc.setSelected(true);
tree.lastFocused=fc;
}else{
tree.domNode.setAttribute("tabIndex","0");
}
}
},removeChild:function(node){
this.inherited(arguments);
var _880=this.getChildren();
if(_880.length==0){
this.isExpandable=false;
this.collapse();
}
dojo.forEach(_880,function(_881){
_881._updateLayout();
});
},makeExpandable:function(){
this.isExpandable=true;
this._setExpando(false);
},_onLabelFocus:function(evt){
dojo.addClass(this.labelNode,"dijitTreeLabelFocused");
this.tree._onNodeFocus(this);
},_onLabelBlur:function(evt){
dojo.removeClass(this.labelNode,"dijitTreeLabelFocused");
},setSelected:function(_884){
var _885=this.labelNode;
_885.setAttribute("tabIndex",_884?"0":"-1");
dijit.setWaiState(_885,"selected",_884);
dojo.toggleClass(this.rowNode,"dijitTreeNodeSelected",_884);
},_onMouseEnter:function(evt){
dojo.addClass(this.rowNode,"dijitTreeNodeHover");
this.tree._onNodeMouseEnter(this,evt);
},_onMouseLeave:function(evt){
dojo.removeClass(this.rowNode,"dijitTreeNodeHover");
this.tree._onNodeMouseLeave(this,evt);
}});
dojo.declare("dijit.Tree",[dijit._Widget,dijit._Templated],{store:null,model:null,query:null,label:"",showRoot:true,childrenAttr:["children"],openOnClick:false,openOnDblClick:false,templateString:"<div class=\"dijitTreeContainer\" waiRole=\"tree\"\r\n\tdojoAttachEvent=\"onclick:_onClick,onkeypress:_onKeyPress,ondblclick:_onDblClick\">\r\n</div>\r\n",isExpandable:true,isTree:true,persist:true,dndController:null,dndParams:["onDndDrop","itemCreator","onDndCancel","checkAcceptance","checkItemAcceptance","dragThreshold","betweenThreshold"],onDndDrop:null,itemCreator:null,onDndCancel:null,checkAcceptance:null,checkItemAcceptance:null,dragThreshold:0,betweenThreshold:0,_publish:function(_888,_889){
dojo.publish(this.id,[dojo.mixin({tree:this,event:_888},_889||{})]);
},postMixInProperties:function(){
this.tree=this;
this._itemNodeMap={};
if(!this.cookieName){
this.cookieName=this.id+"SaveStateCookie";
}
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
var _88a={};
for(var i=0;i<this.dndParams.length;i++){
if(this[this.dndParams[i]]){
_88a[this.dndParams[i]]=this[this.dndParams[i]];
}
}
this.dndController=new this.dndController(this,_88a);
}
},_store2model:function(){
this._v10Compat=true;
dojo.deprecated("Tree: from version 2.0, should specify a model object rather than a store/query");
var _88c={id:this.id+"_ForestStoreModel",store:this.store,query:this.query,childrenAttrs:this.childrenAttr};
if(this.params.mayHaveChildren){
_88c.mayHaveChildren=dojo.hitch(this,"mayHaveChildren");
}
if(this.params.getItemChildren){
_88c.getChildren=dojo.hitch(this,function(item,_88e,_88f){
this.getItemChildren((this._v10Compat&&item===this.model.root)?null:item,_88e,_88f);
});
}
this.model=new dijit.tree.ForestStoreModel(_88c);
this.showRoot=Boolean(this.label);
},_load:function(){
this.model.getRoot(dojo.hitch(this,function(item){
var rn=this.rootNode=this.tree._createTreeNode({item:item,tree:this,isExpandable:true,label:this.label||this.getLabel(item),indent:this.showRoot?0:-1});
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
},getItemChildren:function(_894,_895){
},getLabel:function(item){
return this.model.getLabel(item);
},getIconClass:function(item,_898){
return (!item||this.model.mayHaveChildren(item))?(_898?"dijitFolderOpened":"dijitFolderClosed"):"dijitLeaf";
},getLabelClass:function(item,_89a){
},getIconStyle:function(item,_89c){
},getLabelStyle:function(item,_89e){
},_onKeyPress:function(e){
if(e.altKey){
return;
}
var dk=dojo.keys;
var _8a1=dijit.getEnclosingWidget(e.target);
if(!_8a1){
return;
}
var key=e.charOrCode;
if(typeof key=="string"){
if(!e.altKey&&!e.ctrlKey&&!e.shiftKey&&!e.metaKey){
this._onLetterKeyNav({node:_8a1,key:key.toLowerCase()});
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
this[this._keyHandlerMap[key]]({node:_8a1,item:_8a1.item});
dojo.stopEvent(e);
}
}
},_onEnterKey:function(_8a4){
this._publish("execute",{item:_8a4.item,node:_8a4.node});
this.onClick(_8a4.item,_8a4.node);
},_onDownArrow:function(_8a5){
var node=this._getNextNode(_8a5.node);
if(node&&node.isTreeNode){
this.focusNode(node);
}
},_onUpArrow:function(_8a7){
var node=_8a7.node;
var _8a9=node.getPreviousSibling();
if(_8a9){
node=_8a9;
while(node.isExpandable&&node.isExpanded&&node.hasChildren()){
var _8aa=node.getChildren();
node=_8aa[_8aa.length-1];
}
}else{
var _8ab=node.getParent();
if(!(!this.showRoot&&_8ab===this.rootNode)){
node=_8ab;
}
}
if(node&&node.isTreeNode){
this.focusNode(node);
}
},_onRightArrow:function(_8ac){
var node=_8ac.node;
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
},_onLeftArrow:function(_8ae){
var node=_8ae.node;
if(node.isExpandable&&node.isExpanded){
this._collapseNode(node);
}else{
var _8b0=node.getParent();
if(_8b0&&_8b0.isTreeNode&&!(!this.showRoot&&_8b0===this.rootNode)){
this.focusNode(_8b0);
}
}
},_onHomeKey:function(){
var node=this._getRootOrFirstNode();
if(node){
this.focusNode(node);
}
},_onEndKey:function(_8b2){
var node=this.rootNode;
while(node.isExpanded){
var c=node.getChildren();
node=c[c.length-1];
}
if(node&&node.isTreeNode){
this.focusNode(node);
}
},_onLetterKeyNav:function(_8b5){
var node=_8b5.node,_8b7=node,key=_8b5.key;
do{
node=this._getNextNode(node);
if(!node){
node=this._getRootOrFirstNode();
}
}while(node!==_8b7&&(node.label.charAt(0).toLowerCase()!=key));
if(node&&node.isTreeNode){
if(node!==_8b7){
this.focusNode(node);
}
}
},_onClick:function(e){
var _8ba=e.target;
var _8bb=dijit.getEnclosingWidget(_8ba);
if(!_8bb||!_8bb.isTreeNode){
return;
}
if((this.openOnClick&&_8bb.isExpandable)||(_8ba==_8bb.expandoNode||_8ba==_8bb.expandoNodeText)){
if(_8bb.isExpandable){
this._onExpandoClick({node:_8bb});
}
}else{
this._publish("execute",{item:_8bb.item,node:_8bb});
this.onClick(_8bb.item,_8bb);
this.focusNode(_8bb);
}
dojo.stopEvent(e);
},_onDblClick:function(e){
var _8bd=e.target;
var _8be=dijit.getEnclosingWidget(_8bd);
if(!_8be||!_8be.isTreeNode){
return;
}
if((this.openOnDblClick&&_8be.isExpandable)||(_8bd==_8be.expandoNode||_8bd==_8be.expandoNodeText)){
if(_8be.isExpandable){
this._onExpandoClick({node:_8be});
}
}else{
this._publish("execute",{item:_8be.item,node:_8be});
this.onDblClick(_8be.item,_8be);
this.focusNode(_8be);
}
dojo.stopEvent(e);
},_onExpandoClick:function(_8bf){
var node=_8bf.node;
this.focusNode(node);
if(node.isExpanded){
this._collapseNode(node);
}else{
this._expandNode(node);
}
},onClick:function(item,node){
},onDblClick:function(item,node){
},onOpen:function(item,node){
},onClose:function(item,node){
},_getNextNode:function(node){
if(node.isExpandable&&node.isExpanded&&node.hasChildren()){
return node.getChildren()[0];
}else{
while(node&&node.isTreeNode){
var _8ca=node.getNextSibling();
if(_8ca){
return _8ca;
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
if(node.item){
this._state(node.item,false);
this._saveState();
}
}
},_expandNode:function(node){
if(!node.isExpandable){
return;
}
var _8cd=this.model,item=node.item;
switch(node.state){
case "LOADING":
return;
case "UNCHECKED":
node.markProcessing();
var _8cf=this;
_8cd.getChildren(item,function(_8d0){
node.unmarkProcessing();
node.setChildItems(_8d0);
_8cf._expandNode(node);
},function(err){
console.error(_8cf,": error loading root children: ",err);
});
break;
default:
node.expand();
this.onOpen(node.item,node);
if(item){
this._state(item,true);
this._saveState();
}
}
},focusNode:function(node){
node.labelNode.focus();
},_onNodeFocus:function(node){
if(node){
if(node!=this.lastFocused){
this.lastFocused.setSelected(false);
}
node.setSelected(true);
this.lastFocused=node;
}
},_onNodeMouseEnter:function(node){
},_onNodeMouseLeave:function(node){
},_onItemChange:function(item){
var _8d7=this.model,_8d8=_8d7.getIdentity(item),node=this._itemNodeMap[_8d8];
if(node){
node.setLabelNode(this.getLabel(item));
node._updateItemClasses(item);
}
},_onItemChildrenChange:function(_8da,_8db){
var _8dc=this.model,_8dd=_8dc.getIdentity(_8da),_8de=this._itemNodeMap[_8dd];
if(_8de){
_8de.setChildItems(_8db);
}
},_onItemDelete:function(item){
var _8e0=this.model,_8e1=_8e0.getIdentity(item),node=this._itemNodeMap[_8e1];
if(node){
var _8e3=node.getParent();
if(_8e3){
_8e3.removeChild(node);
}
node.destroyRecursive();
delete this._itemNodeMap[_8e1];
}
},_initState:function(){
if(this.persist){
var _8e4=dojo.cookie(this.cookieName);
this._openedItemIds={};
if(_8e4){
dojo.forEach(_8e4.split(","),function(item){
this._openedItemIds[item]=true;
},this);
}
}
},_state:function(item,_8e7){
if(!this.persist){
return false;
}
var id=this.model.getIdentity(item);
if(arguments.length===1){
return this._openedItemIds[id];
}
if(_8e7){
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
}
if(!dojo._hasResource["dojox.xml.parser"]){
dojo._hasResource["dojox.xml.parser"]=true;
dojo.provide("dojox.xml.parser");
dojox.xml.parser.parse=function(str,_8ed){
var _8ee=dojo.doc;
var doc;
_8ed=_8ed||"text/xml";
if(str&&dojo.trim(str)&&"DOMParser" in dojo.global){
var _8f0=new DOMParser();
doc=_8f0.parseFromString(str,_8ed);
var de=doc.documentElement;
var _8f2="http://www.mozilla.org/newlayout/xml/parsererror.xml";
if(de.nodeName=="parsererror"&&de.namespaceURI==_8f2){
var _8f3=de.getElementsByTagNameNS(_8f2,"sourcetext")[0];
if(!_8f3){
_8f3=_8f3.firstChild.data;
}
throw new Error("Error parsing text "+nativeDoc.documentElement.firstChild.data+" \n"+_8f3);
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
if(_8ee.implementation&&_8ee.implementation.createDocument){
if(str&&dojo.trim(str)&&_8ee.createElement){
var tmp=_8ee.createElement("xml");
tmp.innerHTML=str;
var _8fa=_8ee.implementation.createDocument("foo","",null);
dojo.forEach(tmp.childNodes,function(_8fb){
_8fa.importNode(_8fb,true);
});
return _8fa;
}else{
return _8ee.implementation.createDocument("","",null);
}
}
}
}
return null;
};
dojox.xml.parser.textContent=function(node,text){
if(arguments.length>1){
var _8fe=node.ownerDocument||dojo.doc;
dojox.xml.parser.replaceChildren(node,_8fe.createTextNode(text));
return text;
}else{
if(node.textContent!==undefined){
return node.textContent;
}
var _8ff="";
if(node){
dojo.forEach(node.childNodes,function(_900){
switch(_900.nodeType){
case 1:
case 5:
_8ff+=dojox.xml.parser.textContent(_900);
break;
case 3:
case 2:
case 4:
_8ff+=_900.nodeValue;
}
});
}
return _8ff;
}
};
dojox.xml.parser.replaceChildren=function(node,_902){
var _903=[];
if(dojo.isIE){
dojo.forEach(node.childNodes,function(_904){
_903.push(_904);
});
}
dojox.xml.parser.removeChildren(node);
dojo.forEach(_903,dojo.destroy);
if(!dojo.isArray(_902)){
node.appendChild(_902);
}else{
dojo.forEach(_902,function(_905){
node.appendChild(_905);
});
}
};
dojox.xml.parser.removeChildren=function(node){
var _907=node.childNodes.length;
while(node.hasChildNodes()){
node.removeChild(node.firstChild);
}
return _907;
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
dojox.data.dom.createDocument=function(str,_90a){
dojo.deprecated("dojox.data.dom.createDocument()","Use dojox.xml.parser.parse() instead.","2.0");
try{
return dojox.xml.parser.parse(str,_90a);
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
dojox.data.dom.replaceChildren=function(node,_90e){
dojo.deprecated("dojox.data.dom.replaceChildren()","Use dojox.xml.parser.replaceChildren() instead.","2.0");
dojox.xml.parser.replaceChildren(node,_90e);
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
}
this._newItems=[];
this._deletedItems=[];
this._modifiedItems=[];
},url:"",rootItem:"",keyAttribute:"",label:"",sendQuery:false,attributeMap:null,getValue:function(item,_913,_914){
var _915=item.element;
var i;
var node;
if(_913==="tagName"){
return _915.nodeName;
}else{
if(_913==="childNodes"){
for(i=0;i<_915.childNodes.length;i++){
node=_915.childNodes[i];
if(node.nodeType===1){
return this._getItem(node);
}
}
return _914;
}else{
if(_913==="text()"){
for(i=0;i<_915.childNodes.length;i++){
node=_915.childNodes[i];
if(node.nodeType===3||node.nodeType===4){
return node.nodeValue;
}
}
return _914;
}else{
_913=this._getAttribute(_915.nodeName,_913);
if(_913.charAt(0)==="@"){
var name=_913.substring(1);
var _919=_915.getAttribute(name);
return (_919!==undefined)?_919:_914;
}else{
for(i=0;i<_915.childNodes.length;i++){
node=_915.childNodes[i];
if(node.nodeType===1&&node.nodeName===_913){
return this._getItem(node);
}
}
return _914;
}
}
}
}
},getValues:function(item,_91b){
var _91c=item.element;
var _91d=[];
var i;
var node;
if(_91b==="tagName"){
return [_91c.nodeName];
}else{
if(_91b==="childNodes"){
for(i=0;i<_91c.childNodes.length;i++){
node=_91c.childNodes[i];
if(node.nodeType===1){
_91d.push(this._getItem(node));
}
}
return _91d;
}else{
if(_91b==="text()"){
var ec=_91c.childNodes;
for(i=0;i<ec.length;i++){
node=ec[i];
if(node.nodeType===3||node.nodeType===4){
_91d.push(node.nodeValue);
}
}
return _91d;
}else{
_91b=this._getAttribute(_91c.nodeName,_91b);
if(_91b.charAt(0)==="@"){
var name=_91b.substring(1);
var _922=_91c.getAttribute(name);
return (_922!==undefined)?[_922]:[];
}else{
for(i=0;i<_91c.childNodes.length;i++){
node=_91c.childNodes[i];
if(node.nodeType===1&&node.nodeName===_91b){
_91d.push(this._getItem(node));
}
}
return _91d;
}
}
}
}
},getAttributes:function(item){
var _924=item.element;
var _925=[];
var i;
_925.push("tagName");
if(_924.childNodes.length>0){
var _927={};
var _928=true;
var text=false;
for(i=0;i<_924.childNodes.length;i++){
var node=_924.childNodes[i];
if(node.nodeType===1){
var name=node.nodeName;
if(!_927[name]){
_925.push(name);
_927[name]=name;
}
_928=true;
}else{
if(node.nodeType===3){
text=true;
}
}
}
if(_928){
_925.push("childNodes");
}
if(text){
_925.push("text()");
}
}
for(i=0;i<_924.attributes.length;i++){
_925.push("@"+_924.attributes[i].nodeName);
}
if(this._attributeMap){
for(var key in this._attributeMap){
i=key.indexOf(".");
if(i>0){
var _92d=key.substring(0,i);
if(_92d===_924.nodeName){
_925.push(key.substring(i+1));
}
}else{
_925.push(key);
}
}
}
return _925;
},hasAttribute:function(item,_92f){
return (this.getValue(item,_92f)!==undefined);
},containsValue:function(item,_931,_932){
var _933=this.getValues(item,_931);
for(var i=0;i<_933.length;i++){
if((typeof _932==="string")){
if(_933[i].toString&&_933[i].toString()===_932){
return true;
}
}else{
if(_933[i]===_932){
return true;
}
}
}
return false;
},isItem:function(_935){
if(_935&&_935.element&&_935.store&&_935.store===this){
return true;
}
return false;
},isItemLoaded:function(_936){
return this.isItem(_936);
},loadItem:function(_937){
},getFeatures:function(){
var _938={"dojo.data.api.Read":true,"dojo.data.api.Write":true};
if(!this.sendQuery||this.keyAttribute!==""){
_938["dojo.data.api.Identity"]=true;
}
return _938;
},getLabel:function(item){
if((this.label!=="")&&this.isItem(item)){
var _93a=this.getValue(item,this.label);
if(_93a){
return _93a.toString();
}
}
return undefined;
},getLabelAttributes:function(item){
if(this.label!==""){
return [this.label];
}
return null;
},_fetchItems:function(_93c,_93d,_93e){
var url=this._getFetchUrl(_93c);
console.log("XmlStore._fetchItems(): url="+url);
if(!url){
_93e(new Error("No URL specified."));
return;
}
var _940=(!this.sendQuery?_93c:{});
var self=this;
var _942={url:url,handleAs:"xml",preventCache:true};
var _943=dojo.xhrGet(_942);
_943.addCallback(function(data){
var _945=self._getItems(data,_940);
console.log("XmlStore._fetchItems(): length="+(_945?_945.length:0));
if(_945&&_945.length>0){
_93d(_945,_93c);
}else{
_93d([],_93c);
}
});
_943.addErrback(function(data){
_93e(data,_93c);
});
},_getFetchUrl:function(_947){
if(!this.sendQuery){
return this.url;
}
var _948=_947.query;
if(!_948){
return this.url;
}
if(dojo.isString(_948)){
return this.url+_948;
}
var _949="";
for(var name in _948){
var _94b=_948[name];
if(_94b){
if(_949){
_949+="&";
}
_949+=(name+"="+_94b);
}
}
if(!_949){
return this.url;
}
var _94c=this.url;
if(_94c.indexOf("?")<0){
_94c+="?";
}else{
_94c+="&";
}
return _94c+_949;
},_getItems:function(_94d,_94e){
var _94f=null;
if(_94e){
_94f=_94e.query;
}
var _950=[];
var _951=null;
if(this.rootItem!==""){
_951=dojo.query(this.rootItem,_94d);
}else{
_951=_94d.documentElement.childNodes;
}
var deep=_94e.queryOptions?_94e.queryOptions.deep:false;
if(deep){
_951=this._flattenNodes(_951);
}
for(var i=0;i<_951.length;i++){
var node=_951[i];
if(node.nodeType!=1){
continue;
}
var item=this._getItem(node);
if(_94f){
var _956=true;
var _957=_94e.queryOptions?_94e.queryOptions.ignoreCase:false;
var _958;
var _959={};
for(var key in _94f){
_958=_94f[key];
if(typeof _958==="string"){
_959[key]=dojo.data.util.filter.patternToRegExp(_958,_957);
}
}
for(var _95b in _94f){
_958=this.getValue(item,_95b);
if(_958){
var _95c=_94f[_95b];
if((typeof _958)==="string"&&(_959[_95b])){
if((_958.match(_959[_95b]))!==null){
continue;
}
}else{
if((typeof _958)==="object"){
if(_958.toString&&(_959[_95b])){
var _95d=_958.toString();
if((_95d.match(_959[_95b]))!==null){
continue;
}
}else{
if(_95c==="*"||_95c===_958){
continue;
}
}
}
}
}
_956=false;
break;
}
if(!_956){
continue;
}
}
_950.push(item);
}
dojo.forEach(_950,function(item){
item.element.parentNode.removeChild(item.element);
},this);
return _950;
},_flattenNodes:function(_95f){
var _960=[];
if(_95f){
var i;
for(i=0;i<_95f.length;i++){
var node=_95f[i];
_960.push(node);
if(node.childNodes&&node.childNodes.length>0){
_960=_960.concat(this._flattenNodes(node.childNodes));
}
}
}
return _960;
},close:function(_963){
},newItem:function(_964,_965){
console.log("XmlStore.newItem()");
_964=(_964||{});
var _966=_964.tagName;
if(!_966){
_966=this.rootItem;
if(_966===""){
return null;
}
}
var _967=this._getDocument();
var _968=_967.createElement(_966);
for(var _969 in _964){
var text;
if(_969==="tagName"){
continue;
}else{
if(_969==="text()"){
text=_967.createTextNode(_964[_969]);
_968.appendChild(text);
}else{
_969=this._getAttribute(_966,_969);
if(_969.charAt(0)==="@"){
var name=_969.substring(1);
_968.setAttribute(name,_964[_969]);
}else{
var _96c=_967.createElement(_969);
text=_967.createTextNode(_964[_969]);
_96c.appendChild(text);
_968.appendChild(_96c);
}
}
}
}
var item=this._getItem(_968);
this._newItems.push(item);
var _96e=null;
if(_965&&_965.parent&&_965.attribute){
_96e={item:_965.parent,attribute:_965.attribute,oldValue:undefined};
var _96f=this.getValues(_965.parent,_965.attribute);
if(_96f&&_96f.length>0){
var _970=_96f.slice(0,_96f.length);
if(_96f.length===1){
_96e.oldValue=_96f[0];
}else{
_96e.oldValue=_96f.slice(0,_96f.length);
}
_970.push(item);
this.setValues(_965.parent,_965.attribute,_970);
_96e.newValue=this.getValues(_965.parent,_965.attribute);
}else{
this.setValues(_965.parent,_965.attribute,item);
_96e.newValue=item;
}
}
return item;
},deleteItem:function(item){
console.log("XmlStore.deleteItem()");
var _972=item.element;
if(_972.parentNode){
this._backupItem(item);
_972.parentNode.removeChild(_972);
return true;
}
this._forgetItem(item);
this._deletedItems.push(item);
return true;
},setValue:function(item,_974,_975){
if(_974==="tagName"){
return false;
}
this._backupItem(item);
var _976=item.element;
var _977;
var text;
if(_974==="childNodes"){
_977=_975.element;
_976.appendChild(_977);
}else{
if(_974==="text()"){
while(_976.firstChild){
_976.removeChild(_976.firstChild);
}
text=this._getDocument(_976).createTextNode(_975);
_976.appendChild(text);
}else{
_974=this._getAttribute(_976.nodeName,_974);
if(_974.charAt(0)==="@"){
var name=_974.substring(1);
_976.setAttribute(name,_975);
}else{
for(var i=0;i<_976.childNodes.length;i++){
var node=_976.childNodes[i];
if(node.nodeType===1&&node.nodeName===_974){
_977=node;
break;
}
}
var _97c=this._getDocument(_976);
if(_977){
while(_977.firstChild){
_977.removeChild(_977.firstChild);
}
}else{
_977=_97c.createElement(_974);
_976.appendChild(_977);
}
text=_97c.createTextNode(_975);
_977.appendChild(text);
}
}
}
return true;
},setValues:function(item,_97e,_97f){
if(_97e==="tagName"){
return false;
}
this._backupItem(item);
var _980=item.element;
var i;
var _982;
var text;
if(_97e==="childNodes"){
while(_980.firstChild){
_980.removeChild(_980.firstChild);
}
for(i=0;i<_97f.length;i++){
_982=_97f[i].element;
_980.appendChild(_982);
}
}else{
if(_97e==="text()"){
while(_980.firstChild){
_980.removeChild(_980.firstChild);
}
var _984="";
for(i=0;i<_97f.length;i++){
_984+=_97f[i];
}
text=this._getDocument(_980).createTextNode(_984);
_980.appendChild(text);
}else{
_97e=this._getAttribute(_980.nodeName,_97e);
if(_97e.charAt(0)==="@"){
var name=_97e.substring(1);
_980.setAttribute(name,_97f[0]);
}else{
for(i=_980.childNodes.length-1;i>=0;i--){
var node=_980.childNodes[i];
if(node.nodeType===1&&node.nodeName===_97e){
_980.removeChild(node);
}
}
var _987=this._getDocument(_980);
for(i=0;i<_97f.length;i++){
_982=_987.createElement(_97e);
text=_987.createTextNode(_97f[i]);
_982.appendChild(text);
_980.appendChild(_982);
}
}
}
}
return true;
},unsetAttribute:function(item,_989){
if(_989==="tagName"){
return false;
}
this._backupItem(item);
var _98a=item.element;
if(_989==="childNodes"||_989==="text()"){
while(_98a.firstChild){
_98a.removeChild(_98a.firstChild);
}
}else{
_989=this._getAttribute(_98a.nodeName,_989);
if(_989.charAt(0)==="@"){
var name=_989.substring(1);
_98a.removeAttribute(name);
}else{
for(var i=_98a.childNodes.length-1;i>=0;i--){
var node=_98a.childNodes[i];
if(node.nodeType===1&&node.nodeName===_989){
_98a.removeChild(node);
}
}
}
}
return true;
},save:function(_98e){
if(!_98e){
_98e={};
}
var i;
for(i=0;i<this._modifiedItems.length;i++){
this._saveItem(this._modifiedItems[i],_98e,"PUT");
}
for(i=0;i<this._newItems.length;i++){
var item=this._newItems[i];
if(item.element.parentNode){
this._newItems.splice(i,1);
i--;
continue;
}
this._saveItem(this._newItems[i],_98e,"POST");
}
for(i=0;i<this._deletedItems.length;i++){
this._saveItem(this._deletedItems[i],_98e,"DELETE");
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
var _992=this._getRootElement(item.element);
return (this._getItemIndex(this._newItems,_992)>=0||this._getItemIndex(this._deletedItems,_992)>=0||this._getItemIndex(this._modifiedItems,_992)>=0);
}else{
return (this._newItems.length>0||this._deletedItems.length>0||this._modifiedItems.length>0);
}
},_saveItem:function(item,_994,_995){
var url;
var _997;
if(_995==="PUT"){
url=this._getPutUrl(item);
}else{
if(_995==="DELETE"){
url=this._getDeleteUrl(item);
}else{
url=this._getPostUrl(item);
}
}
if(!url){
if(_994.onError){
_997=_994.scope||dojo.global;
_994.onError.call(_997,new Error("No URL for saving content: "+this._getPostContent(item)));
}
return;
}
var _998={url:url,method:(_995||"POST"),contentType:"text/xml",handleAs:"xml"};
var _999;
if(_995==="PUT"){
_998.putData=this._getPutContent(item);
_999=dojo.rawXhrPut(_998);
}else{
if(_995==="DELETE"){
_999=dojo.xhrDelete(_998);
}else{
_998.postData=this._getPostContent(item);
_999=dojo.rawXhrPost(_998);
}
}
_997=(_994.scope||dojo.global);
var self=this;
_999.addCallback(function(data){
self._forgetItem(item);
if(_994.onComplete){
_994.onComplete.call(_997);
}
});
_999.addErrback(function(_99c){
if(_994.onError){
_994.onError.call(_997,_99c);
}
});
},_getPostUrl:function(item){
return this.url;
},_getPutUrl:function(item){
return this.url;
},_getDeleteUrl:function(item){
var url=this.url;
if(item&&this.keyAttribute!==""){
var _9a1=this.getValue(item,this.keyAttribute);
if(_9a1){
var key=this.keyAttribute.charAt(0)==="@"?this.keyAttribute.substring(1):this.keyAttribute;
url+=url.indexOf("?")<0?"?":"&";
url+=key+"="+_9a1;
}
}
return url;
},_getPostContent:function(item){
var _9a4=item.element;
var _9a5="<?xml version=\"1.0\"?>";
return _9a5+dojox.xml.parser.innerXML(_9a4);
},_getPutContent:function(item){
var _9a7=item.element;
var _9a8="<?xml version=\"1.0\"?>";
return _9a8+dojox.xml.parser.innerXML(_9a7);
},_getAttribute:function(_9a9,_9aa){
if(this._attributeMap){
var key=_9a9+"."+_9aa;
var _9ac=this._attributeMap[key];
if(_9ac){
_9aa=_9ac;
}else{
_9ac=this._attributeMap[_9aa];
if(_9ac){
_9aa=_9ac;
}
}
}
return _9aa;
},_getItem:function(_9ad){
try{
var q=null;
if(this.keyAttribute===""){
q=this._getXPath(_9ad);
}
return new dojox.data.XmlItem(_9ad,this,q);
}
catch(e){
console.log(e);
}
return null;
},_getItemIndex:function(_9af,_9b0){
for(var i=0;i<_9af.length;i++){
if(_9af[i].element===_9b0){
return i;
}
}
return -1;
},_backupItem:function(item){
var _9b3=this._getRootElement(item.element);
if(this._getItemIndex(this._newItems,_9b3)>=0||this._getItemIndex(this._modifiedItems,_9b3)>=0){
return;
}
if(_9b3!=item.element){
item=this._getItem(_9b3);
}
item._backup=_9b3.cloneNode(true);
this._modifiedItems.push(item);
},_restoreItems:function(_9b4){
dojo.forEach(_9b4,function(item){
if(item._backup){
item.element=item._backup;
item._backup=null;
}
},this);
},_forgetItem:function(item){
var _9b7=item.element;
var _9b8=this._getItemIndex(this._newItems,_9b7);
if(_9b8>=0){
this._newItems.splice(_9b8,1);
}
_9b8=this._getItemIndex(this._deletedItems,_9b7);
if(_9b8>=0){
this._deletedItems.splice(_9b8,1);
}
_9b8=this._getItemIndex(this._modifiedItems,_9b7);
if(_9b8>=0){
this._modifiedItems.splice(_9b8,1);
}
},_getDocument:function(_9b9){
if(_9b9){
return _9b9.ownerDocument;
}else{
if(!this._document){
return dojox.xml.parser.parse();
}
}
return null;
},_getRootElement:function(_9ba){
while(_9ba.parentNode){
_9ba=_9ba.parentNode;
}
return _9ba;
},_getXPath:function(_9bb){
var _9bc=null;
if(!this.sendQuery){
var node=_9bb;
_9bc="";
while(node&&node!=_9bb.ownerDocument){
var pos=0;
var _9bf=node;
var name=node.nodeName;
while(_9bf){
_9bf=_9bf.previousSibling;
if(_9bf&&_9bf.nodeName===name){
pos++;
}
}
var temp="/"+name+"["+pos+"]";
if(_9bc){
_9bc=temp+_9bc;
}else{
_9bc=temp;
}
node=node.parentNode;
}
}
return _9bc;
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
},fetchItemByIdentity:function(_9c5){
var _9c6=null;
var _9c7=null;
var self=this;
var url=null;
var _9ca=null;
var _9cb=null;
if(!self.sendQuery){
_9c6=function(data){
if(data){
if(self.keyAttribute!==""){
var _9cd={};
_9cd.query={};
_9cd.query[self.keyAttribute]=_9c5.identity;
var _9ce=self._getItems(data,_9cd);
_9c7=_9c5.scope||dojo.global;
if(_9ce.length===1){
if(_9c5.onItem){
_9c5.onItem.call(_9c7,_9ce[0]);
}
}else{
if(_9ce.length===0){
if(_9c5.onItem){
_9c5.onItem.call(_9c7,null);
}
}else{
if(_9c5.onError){
_9c5.onError.call(_9c7,new Error("Items array size for identity lookup greater than 1, invalid keyAttribute."));
}
}
}
}else{
var _9cf=_9c5.identity.split("/");
var i;
var node=data;
for(i=0;i<_9cf.length;i++){
if(_9cf[i]&&_9cf[i]!==""){
var _9d2=_9cf[i];
_9d2=_9d2.substring(0,_9d2.length-1);
var vals=_9d2.split("[");
var tag=vals[0];
var _9d5=parseInt(vals[1],10);
var pos=0;
if(node){
var _9d7=node.childNodes;
if(_9d7){
var j;
var _9d9=null;
for(j=0;j<_9d7.length;j++){
var _9da=_9d7[j];
if(_9da.nodeName===tag){
if(pos<_9d5){
pos++;
}else{
_9d9=_9da;
break;
}
}
}
if(_9d9){
node=_9d9;
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
item.element.parentNode.removeChild(item.element);
}
if(_9c5.onItem){
_9c7=_9c5.scope||dojo.global;
_9c5.onItem.call(_9c7,item);
}
}
}
};
url=this._getFetchUrl(null);
_9ca={url:url,handleAs:"xml",preventCache:true};
_9cb=dojo.xhrGet(_9ca);
_9cb.addCallback(_9c6);
if(_9c5.onError){
_9cb.addErrback(function(_9dc){
var s=_9c5.scope||dojo.global;
_9c5.onError.call(s,_9dc);
});
}
}else{
if(self.keyAttribute!==""){
var _9de={query:{}};
_9de.query[self.keyAttribute]=_9c5.identity;
url=this._getFetchUrl(_9de);
_9c6=function(data){
var item=null;
if(data){
var _9e1=self._getItems(_9e1,{});
if(_9e1.length===1){
item=_9e1[0];
}else{
if(_9c5.onError){
var _9e2=_9c5.scope||dojo.global;
_9c5.onError.call(_9e2,new Error("More than one item was returned from the server for the denoted identity"));
}
}
}
if(_9c5.onItem){
_9e2=_9c5.scope||dojo.global;
_9c5.onItem.call(_9e2,item);
}
};
_9ca={url:url,handleAs:"xml",preventCache:true};
_9cb=dojo.xhrGet(_9ca);
_9cb.addCallback(_9c6);
if(_9c5.onError){
_9cb.addErrback(function(_9e3){
var s=_9c5.scope||dojo.global;
_9c5.onError.call(s,_9e3);
});
}
}else{
if(_9c5.onError){
var s=_9c5.scope||dojo.global;
_9c5.onError.call(s,new Error("XmlStore is not told that the server to provides identity support.  No keyAttribute specified."));
}
}
}
}});
dojo.declare("dojox.data.XmlItem",null,{constructor:function(_9e6,_9e7,_9e8){
this.element=_9e6;
this.store=_9e7;
this.q=_9e8;
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
var _9ed={};
m._degToRad=function(_9ee){
return _9ed[_9ee]||(_9ed[_9ee]=(Math.PI*_9ee/180));
};
m._radToDeg=function(_9ef){
return _9ef/Math.PI*180;
};
m.Matrix2D=function(arg){
if(arg){
if(typeof arg=="number"){
this.xx=this.yy=arg;
}else{
if(arg instanceof Array){
if(arg.length>0){
var _9f1=m.normalize(arg[0]);
for(var i=1;i<arg.length;++i){
var l=_9f1,r=dojox.gfx.matrix.normalize(arg[i]);
_9f1=new m.Matrix2D();
_9f1.xx=l.xx*r.xx+l.xy*r.yx;
_9f1.xy=l.xx*r.xy+l.xy*r.yy;
_9f1.yx=l.yx*r.xx+l.yy*r.yx;
_9f1.yy=l.yx*r.xy+l.yy*r.yy;
_9f1.dx=l.xx*r.dx+l.xy*r.dy+l.dx;
_9f1.dy=l.yx*r.dx+l.yy*r.dy+l.dy;
}
dojo.mixin(this,_9f1);
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
},rotate:function(_9f9){
var c=Math.cos(_9f9);
var s=Math.sin(_9f9);
return new m.Matrix2D({xx:c,xy:-s,yx:s,yy:c});
},rotateg:function(_9fc){
return m.rotate(m._degToRad(_9fc));
},skewX:function(_9fd){
return new m.Matrix2D({xy:Math.tan(_9fd)});
},skewXg:function(_9fe){
return m.skewX(m._degToRad(_9fe));
},skewY:function(_9ff){
return new m.Matrix2D({yx:Math.tan(_9ff)});
},skewYg:function(_a00){
return m.skewY(m._degToRad(_a00));
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
},normalize:function(_a0d){
return (_a0d instanceof m.Matrix2D)?_a0d:new m.Matrix2D(_a0d);
},clone:function(_a0e){
var obj=new m.Matrix2D();
for(var i in _a0e){
if(typeof (_a0e[i])=="number"&&typeof (obj[i])=="number"&&obj[i]!=_a0e[i]){
obj[i]=_a0e[i];
}
}
return obj;
},invert:function(_a11){
var M=m.normalize(_a11),D=M.xx*M.yy-M.xy*M.yx,M=new m.Matrix2D({xx:M.yy/D,xy:-M.xy/D,yx:-M.yx/D,yy:M.xx/D,dx:(M.xy*M.dy-M.yy*M.dx)/D,dy:(M.yx*M.dx-M.xx*M.dy)/D});
return M;
},_multiplyPoint:function(_a14,x,y){
return {x:_a14.xx*x+_a14.xy*y+_a14.dx,y:_a14.yx*x+_a14.yy*y+_a14.dy};
},multiplyPoint:function(_a17,a,b){
var M=m.normalize(_a17);
if(typeof a=="number"&&typeof b=="number"){
return m._multiplyPoint(M,a,b);
}
return m._multiplyPoint(M,a.x,a.y);
},multiply:function(_a1b){
var M=m.normalize(_a1b);
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
},_sandwich:function(_a20,x,y){
return m.multiply(m.translate(x,y),_a20,m.translate(-x,-y));
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
},rotateAt:function(_a27,a,b){
if(arguments.length>2){
return m._sandwich(m.rotate(_a27),a,b);
}
return m._sandwich(m.rotate(_a27),a.x,a.y);
},rotategAt:function(_a2a,a,b){
if(arguments.length>2){
return m._sandwich(m.rotateg(_a2a),a,b);
}
return m._sandwich(m.rotateg(_a2a),a.x,a.y);
},skewXAt:function(_a2d,a,b){
if(arguments.length>2){
return m._sandwich(m.skewX(_a2d),a,b);
}
return m._sandwich(m.skewX(_a2d),a.x,a.y);
},skewXgAt:function(_a30,a,b){
if(arguments.length>2){
return m._sandwich(m.skewXg(_a30),a,b);
}
return m._sandwich(m.skewXg(_a30),a.x,a.y);
},skewYAt:function(_a33,a,b){
if(arguments.length>2){
return m._sandwich(m.skewY(_a33),a,b);
}
return m._sandwich(m.skewY(_a33),a.x,a.y);
},skewYgAt:function(_a36,a,b){
if(arguments.length>2){
return m._sandwich(m.skewYg(_a36),a,b);
}
return m._sandwich(m.skewYg(_a36),a.x,a.y);
}});
})();
dojox.gfx.Matrix2D=dojox.gfx.matrix.Matrix2D;
}
if(!dojo._hasResource["dojox.gfx._base"]){
dojo._hasResource["dojox.gfx._base"]=true;
dojo.provide("dojox.gfx._base");
(function(){
var g=dojox.gfx,b=g._base;
g._hasClass=function(node,_a3c){
var cls=node.getAttribute("className");
return cls&&(" "+cls+" ").indexOf(" "+_a3c+" ")>=0;
};
g._addClass=function(node,_a3f){
var cls=node.getAttribute("className")||"";
if(!cls||(" "+cls+" ").indexOf(" "+_a3f+" ")<0){
node.setAttribute("className",cls+(cls?" ":"")+_a3f);
}
};
g._removeClass=function(node,_a42){
var cls=node.getAttribute("className");
if(cls){
node.setAttribute("className",cls.replace(new RegExp("(^|\\s+)"+_a42+"(\\s+|$)"),"$1$2"));
}
};
b._getFontMeasurements=function(){
var _a44={"1em":0,"1ex":0,"100%":0,"12pt":0,"16px":0,"xx-small":0,"x-small":0,"small":0,"medium":0,"large":0,"x-large":0,"xx-large":0};
if(dojo.isIE){
dojo.doc.documentElement.style.fontSize="100%";
}
var div=dojo.doc.createElement("div");
var s=div.style;
s.position="absolute";
s.left="-100px";
s.top="0px";
s.width="30px";
s.height="1000em";
s.border="0px";
s.margin="0px";
s.padding="0px";
s.outline="none";
s.lineHeight="1";
s.overflow="hidden";
dojo.body().appendChild(div);
for(var p in _a44){
div.style.fontSize=p;
_a44[p]=Math.round(div.offsetHeight*12/16)*16/12/1000;
}
dojo.body().removeChild(div);
div=null;
return _a44;
};
var _a48=null;
b._getCachedFontMeasurements=function(_a49){
if(_a49||!_a48){
_a48=b._getFontMeasurements();
}
return _a48;
};
var _a4a=null,_a4b={};
b._getTextBox=function(text,_a4d,_a4e){
var m,s;
if(!_a4a){
m=_a4a=dojo.doc.createElement("div");
s=m.style;
s.position="absolute";
s.left="-10000px";
s.top="0";
dojo.body().appendChild(m);
}else{
m=_a4a;
s=m.style;
}
m.className="";
s.border="0";
s.margin="0";
s.padding="0";
s.outline="0";
if(arguments.length>1&&_a4d){
for(var i in _a4d){
if(i in _a4b){
continue;
}
s[i]=_a4d[i];
}
}
if(arguments.length>2&&_a4e){
m.className=_a4e;
}
m.innerHTML=text;
return dojo.marginBox(m);
};
var _a52=0;
b._getUniqueId=function(){
var id;
do{
id=dojo._scopeName+"Unique"+(++_a52);
}while(dojo.byId(id));
return id;
};
})();
dojo.mixin(dojox.gfx,{defaultPath:{type:"path",path:""},defaultPolyline:{type:"polyline",points:[]},defaultRect:{type:"rect",x:0,y:0,width:100,height:100,r:0},defaultEllipse:{type:"ellipse",cx:0,cy:0,rx:200,ry:100},defaultCircle:{type:"circle",cx:0,cy:0,r:100},defaultLine:{type:"line",x1:0,y1:0,x2:100,y2:100},defaultImage:{type:"image",x:0,y:0,width:0,height:0,src:""},defaultText:{type:"text",x:0,y:0,text:"",align:"start",decoration:"none",rotated:false,kerning:true},defaultTextPath:{type:"textpath",text:"",align:"start",decoration:"none",rotated:false,kerning:true},defaultStroke:{type:"stroke",color:"black",style:"solid",width:1,cap:"butt",join:4},defaultLinearGradient:{type:"linear",x1:0,y1:0,x2:100,y2:100,colors:[{offset:0,color:"black"},{offset:1,color:"white"}]},defaultRadialGradient:{type:"radial",cx:0,cy:0,r:100,colors:[{offset:0,color:"black"},{offset:1,color:"white"}]},defaultPattern:{type:"pattern",x:0,y:0,width:0,height:0,src:""},defaultFont:{type:"font",style:"normal",variant:"normal",weight:"normal",size:"10pt",family:"serif"},getDefault:(function(){
var _a54={};
return function(type){
var t=_a54[type];
if(t){
return new t();
}
t=_a54[type]=function(){
};
t.prototype=dojox.gfx["default"+type];
return new t();
};
})(),normalizeColor:function(_a57){
return (_a57 instanceof dojo.Color)?_a57:new dojo.Color(_a57);
},normalizeParameters:function(_a58,_a59){
if(_a59){
var _a5a={};
for(var x in _a58){
if(x in _a59&&!(x in _a5a)){
_a58[x]=_a59[x];
}
}
}
return _a58;
},makeParameters:function(_a5c,_a5d){
if(!_a5d){
return dojo.delegate(_a5c);
}
var _a5e={};
for(var i in _a5c){
if(!(i in _a5e)){
_a5e[i]=dojo.clone((i in _a5d)?_a5d[i]:_a5c[i]);
}
}
return _a5e;
},formatNumber:function(x,_a61){
var val=x.toString();
if(val.indexOf("e")>=0){
val=x.toFixed(4);
}else{
var _a63=val.indexOf(".");
if(_a63>=0&&val.length-_a63>5){
val=x.toFixed(4);
}
}
if(x<0){
return val;
}
return _a61?" "+val:val;
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
var _a6d=dojox.gfx.px_in_pt();
var val=parseFloat(len);
switch(len.slice(-2)){
case "px":
return val;
case "pt":
return val*_a6d;
case "in":
return val*72*_a6d;
case "pc":
return val*12*_a6d;
case "mm":
return val*dojox.gfx.mm_in_pt*_a6d;
case "cm":
return val*dojox.gfx.cm_in_pt*_a6d;
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
var gfx=dojo.getObject("dojox.gfx",true),sl,flag,_a74;
if(!gfx.renderer){
var _a75=(typeof dojo.config.gfxRenderer=="string"?dojo.config.gfxRenderer:"svg,vml,silverlight,canvas").split(",");
var ua=navigator.userAgent,_a77=0,_a78=0;
if(dojo.isSafari>=3){
if(ua.indexOf("iPhone")>=0||ua.indexOf("iPod")>=0){
_a74=ua.match(/Version\/(\d(\.\d)?(\.\d)?)\sMobile\/([^\s]*)\s?/);
if(_a74){
_a77=parseInt(_a74[4].substr(0,3),16);
}
}
}
if(dojo.isWebKit){
if(!_a77){
_a74=ua.match(/Android\s+(\d+\.\d+)/);
if(_a74){
_a78=parseFloat(_a74[1]);
}
}
}
for(var i=0;i<_a75.length;++i){
switch(_a75[i]){
case "svg":
if(!dojo.isIE&&(!_a77||_a77>=1521)&&!_a78&&!dojo.isAIR){
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
var _a7b={"1em":0,"1ex":0,"100%":0,"12pt":0,"16px":0,"xx-small":0,"x-small":0,"small":0,"medium":0,"large":0,"x-large":0,"xx-large":0};
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
for(var p in _a7b){
ds.fontSize=p;
_a7b[p]=Math.round(div.offsetHeight*12/16)*16/12/1000;
}
dojo.body().removeChild(div);
div=null;
return _a7b;
};
var _a7f=null;
dhm.getCachedFontMeasurements=function(_a80){
if(_a80||!_a7f){
_a7f=dhm.getFontMeasurements();
}
return _a7f;
};
var _a81=null,_a82={};
dhm.getTextBox=function(text,_a84,_a85){
var m;
if(!_a81){
m=_a81=dojo.doc.createElement("div");
m.style.position="absolute";
m.style.left="-10000px";
m.style.top="0";
dojo.body().appendChild(m);
}else{
m=_a81;
}
m.className="";
m.style.border="0";
m.style.margin="0";
m.style.padding="0";
m.style.outline="0";
if(arguments.length>1&&_a84){
for(var i in _a84){
if(i in _a82){
continue;
}
m.style[i]=_a84[i];
}
}
if(arguments.length>2&&_a85){
m.className=_a85;
}
m.innerHTML=text;
return dojo.marginBox(m);
};
var _a88={w:16,h:16};
dhm.getScrollbar=function(){
return {w:_a88.w,h:_a88.h};
};
dhm._fontResizeNode=null;
dhm.initOnFontResize=function(_a89){
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
_a88.w=n.offsetWidth-n.clientWidth;
_a88.h=n.offsetHeight-n.clientHeight;
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
dgu.setStyleHeightPx=function(_a93,_a94){
if(_a94>=0){
var s=_a93.style;
var v=_a94+"px";
if(_a93&&s["height"]!=v){
s["height"]=v;
}
}
};
dgu.mouseEvents=["mouseover","mouseout","mousedown","mouseup","click","dblclick","contextmenu"];
dgu.keyEvents=["keyup","keydown","keypress"];
dgu.funnelEvents=function(_a97,_a98,_a99,_a9a){
var evts=(_a9a?_a9a:dgu.mouseEvents.concat(dgu.keyEvents));
for(var i=0,l=evts.length;i<l;i++){
_a98.connect(_a97,"on"+evts[i],_a99);
}
},dgu.removeNode=function(_a9e){
_a9e=dojo.byId(_a9e);
_a9e&&_a9e.parentNode&&_a9e.parentNode.removeChild(_a9e);
return _a9e;
};
dgu.arrayCompare=function(inA,inB){
for(var i=0,l=inA.length;i<l;i++){
if(inA[i]!=inB[i]){
return false;
}
}
return (inA.length==inB.length);
};
dgu.arrayInsert=function(_aa3,_aa4,_aa5){
if(_aa3.length<=_aa4){
_aa3[_aa4]=_aa5;
}else{
_aa3.splice(_aa4,0,_aa5);
}
};
dgu.arrayRemove=function(_aa6,_aa7){
_aa6.splice(_aa7,1);
};
dgu.arraySwap=function(_aa8,inI,inJ){
var _aab=_aa8[inI];
_aa8[inI]=_aa8[inJ];
_aa8[inJ]=_aab;
};
})();
}
if(!dojo._hasResource["dojox.grid._Scroller"]){
dojo._hasResource["dojox.grid._Scroller"]=true;
dojo.provide("dojox.grid._Scroller");
(function(){
var _aac=function(_aad){
var i=0,n,p=_aad.parentNode;
while((n=p.childNodes[i++])){
if(n==_aad){
return i-1;
}
}
return -1;
};
var _ab1=function(_ab2){
if(!_ab2){
return;
}
var _ab3=function(inW){
return inW.domNode&&dojo.isDescendant(inW.domNode,_ab2,true);
};
var ws=dijit.registry.filter(_ab3);
for(var i=0,w;(w=ws[i]);i++){
w.destroy();
}
delete ws;
};
var _ab8=function(_ab9){
var node=dojo.byId(_ab9);
return (node&&node.tagName?node.tagName.toLowerCase():"");
};
var _abb=function(_abc,_abd){
var _abe=[];
var i=0,n;
while((n=_abc.childNodes[i++])){
if(_ab8(n)==_abd){
_abe.push(n);
}
}
return _abe;
};
var _ac1=function(_ac2){
return _abb(_ac2,"div");
};
dojo.declare("dojox.grid._Scroller",null,{constructor:function(_ac3){
this.setContentNodes(_ac3);
this.pageHeights=[];
this.pageNodes=[];
this.stack=[];
},rowCount:0,defaultRowHeight:32,keepRows:100,contentNode:null,scrollboxNode:null,defaultPageHeight:0,keepPages:10,pageCount:0,windowHeight:0,firstVisibleRow:0,lastVisibleRow:0,averageRowHeight:0,page:0,pageTop:0,init:function(_ac4,_ac5,_ac6){
switch(arguments.length){
case 3:
this.rowsPerPage=_ac6;
case 2:
this.keepRows=_ac5;
case 1:
this.rowCount=_ac4;
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
},_getPageCount:function(_ac7,_ac8){
return _ac7?(Math.ceil(_ac7/_ac8)||1):0;
},destroy:function(){
this.invalidateNodes();
delete this.contentNodes;
delete this.contentNode;
delete this.scrollboxNode;
},setKeepInfo:function(_ac9){
this.keepRows=_ac9;
this.keepPages=!this.keepRows?this.keepRows:Math.max(Math.ceil(this.keepRows/this.rowsPerPage),2);
},setContentNodes:function(_aca){
this.contentNodes=_aca;
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
},updateRowCount:function(_acc){
this.invalidateNodes();
this.rowCount=_acc;
var _acd=this.pageCount;
if(_acd===0){
this.height=1;
}
this.pageCount=this._getPageCount(this.rowCount,this.rowsPerPage);
if(this.pageCount<_acd){
for(var i=_acd-1;i>=this.pageCount;i--){
this.height-=this.getPageHeight(i);
delete this.pageHeights[i];
}
}else{
if(this.pageCount>_acd){
this.height+=this.defaultPageHeight*(this.pageCount-_acd-1)+this.calcLastPageHeight();
}
}
this.resize();
},pageExists:function(_acf){
return Boolean(this.getDefaultPageNode(_acf));
},measurePage:function(_ad0){
var n=this.getDefaultPageNode(_ad0);
return (n&&n.innerHTML)?n.offsetHeight:0;
},positionPage:function(_ad2,_ad3){
for(var i=0;i<this.colCount;i++){
this.pageNodes[i][_ad2].style.top=_ad3+"px";
}
},repositionPages:function(_ad5){
var _ad6=this.getDefaultNodes();
var last=0;
for(var i=0;i<this.stack.length;i++){
last=Math.max(this.stack[i],last);
}
var n=_ad6[_ad5];
var y=(n?this.getPageNodePosition(n)+this.getPageHeight(_ad5):0);
for(var p=_ad5+1;p<=last;p++){
n=_ad6[p];
if(n){
if(this.getPageNodePosition(n)==y){
return;
}
this.positionPage(p,y);
}
y+=this.getPageHeight(p);
}
},installPage:function(_adc){
for(var i=0;i<this.colCount;i++){
this.contentNodes[i].appendChild(this.pageNodes[i][_adc]);
}
},preparePage:function(_ade,_adf){
var p=(_adf?this.popPage():null);
for(var i=0;i<this.colCount;i++){
var _ae2=this.pageNodes[i];
var _ae3=(p===null?this.createPageNode():this.invalidatePageNode(p,_ae2));
_ae3.pageIndex=_ade;
_ae3.id=(this._pageIdPrefix||"")+"page-"+_ade;
_ae2[_ade]=_ae3;
}
},renderPage:function(_ae4){
var _ae5=[];
for(var i=0;i<this.colCount;i++){
_ae5[i]=this.pageNodes[i][_ae4];
}
for(var i=0,j=_ae4*this.rowsPerPage;(i<this.rowsPerPage)&&(j<this.rowCount);i++,j++){
this.renderRow(j,_ae5);
}
},removePage:function(_ae8){
for(var i=0,j=_ae8*this.rowsPerPage;i<this.rowsPerPage;i++,j++){
this.removeRow(j);
}
},destroyPage:function(_aeb){
for(var i=0;i<this.colCount;i++){
var n=this.invalidatePageNode(_aeb,this.pageNodes[i]);
if(n){
dojo.destroy(n);
}
}
},pacify:function(_aee){
},pacifying:false,pacifyTicks:200,setPacifying:function(_aef){
if(this.pacifying!=_aef){
this.pacifying=_aef;
this.pacify(this.pacifying);
}
},startPacify:function(){
this.startPacifyTicks=new Date().getTime();
},doPacify:function(){
var _af0=(new Date().getTime()-this.startPacifyTicks)>this.pacifyTicks;
this.setPacifying(true);
this.startPacify();
return _af0;
},endPacify:function(){
this.setPacifying(false);
},resize:function(){
if(this.scrollboxNode){
this.windowHeight=this.scrollboxNode.clientHeight;
}
for(var i=0;i<this.colCount;i++){
dojox.grid.util.setStyleHeightPx(this.contentNodes[i],Math.max(1,this.height));
}
this.needPage(this.page,this.pageTop);
var _af2=(this.page<this.pageCount-1)?this.rowsPerPage:((this.rowCount%this.rowsPerPage)||this.rowsPerPage);
var _af3=this.getPageHeight(this.page);
this.averageRowHeight=(_af3>0&&_af2>0)?(_af3/_af2):0;
},calcLastPageHeight:function(){
if(!this.pageCount){
return 0;
}
var _af4=this.pageCount-1;
var _af5=((this.rowCount%this.rowsPerPage)||(this.rowsPerPage))*this.defaultRowHeight;
this.pageHeights[_af4]=_af5;
return _af5;
},updateContentHeight:function(inDh){
this.height+=inDh;
this.resize();
},updatePageHeight:function(_af7){
if(this.pageExists(_af7)){
var oh=this.getPageHeight(_af7);
var h=(this.measurePage(_af7))||(oh);
this.pageHeights[_af7]=h;
if((h)&&(oh!=h)){
this.updateContentHeight(h-oh);
this.repositionPages(_af7);
}
}
},rowHeightChanged:function(_afa){
this.updatePageHeight(Math.floor(_afa/this.rowsPerPage));
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
},getPageHeight:function(_afc){
var ph=this.pageHeights[_afc];
return (ph!==undefined?ph:this.defaultPageHeight);
},pushPage:function(_afe){
return this.stack.push(_afe);
},popPage:function(){
return this.stack.shift();
},findPage:function(_aff){
var i=0,h=0;
for(var ph=0;i<this.pageCount;i++,h+=ph){
ph=this.getPageHeight(i);
if(h+ph>=_aff){
break;
}
}
this.page=i;
this.pageTop=h;
},buildPage:function(_b03,_b04,_b05){
this.preparePage(_b03,_b04);
this.positionPage(_b03,_b05);
this.installPage(_b03);
this.renderPage(_b03);
this.pushPage(_b03);
},needPage:function(_b06,_b07){
var h=this.getPageHeight(_b06),oh=h;
if(!this.pageExists(_b06)){
this.buildPage(_b06,this.keepPages&&(this.stack.length>=this.keepPages),_b07);
h=this.measurePage(_b06)||h;
this.pageHeights[_b06]=h;
if(h&&(oh!=h)){
this.updateContentHeight(h-oh);
}
}else{
this.positionPage(_b06,_b07);
}
return h;
},onscroll:function(){
this.scroll(this.scrollboxNode.scrollTop);
},scroll:function(_b0a){
this.grid.scrollTop=_b0a;
if(this.colCount){
this.startPacify();
this.findPage(_b0a);
var h=this.height;
var b=this.getScrollBottom(_b0a);
for(var p=this.page,y=this.pageTop;(p<this.pageCount)&&((b<0)||(y<b));p++){
y+=this.needPage(p,y);
}
this.firstVisibleRow=this.getFirstVisibleRow(this.page,this.pageTop,_b0a);
this.lastVisibleRow=this.getLastVisibleRow(p-1,y,b);
if(h!=this.height){
this.repositionPages(p-1);
}
this.endPacify();
}
},getScrollBottom:function(_b0f){
return (this.windowHeight>=0?_b0f+this.windowHeight:-1);
},processNodeEvent:function(e,_b11){
var t=e.target;
while(t&&(t!=_b11)&&t.parentNode&&(t.parentNode.parentNode!=_b11)){
t=t.parentNode;
}
if(!t||!t.parentNode||(t.parentNode.parentNode!=_b11)){
return false;
}
var page=t.parentNode;
e.topRowIndex=page.pageIndex*this.rowsPerPage;
e.rowIndex=e.topRowIndex+_aac(t);
e.rowTarget=t;
return true;
},processEvent:function(e){
return this.processNodeEvent(e,this.contentNode);
},renderRow:function(_b15,_b16){
},removeRow:function(_b17){
},getDefaultPageNode:function(_b18){
return this.getDefaultNodes()[_b18];
},positionPageNode:function(_b19,_b1a){
},getPageNodePosition:function(_b1b){
return _b1b.offsetTop;
},invalidatePageNode:function(_b1c,_b1d){
var p=_b1d[_b1c];
if(p){
delete _b1d[_b1c];
this.removePage(_b1c,p);
_ab1(p);
p.innerHTML="";
}
return p;
},getPageRow:function(_b1f){
return _b1f*this.rowsPerPage;
},getLastPageRow:function(_b20){
return Math.min(this.rowCount,this.getPageRow(_b20+1))-1;
},getFirstVisibleRow:function(_b21,_b22,_b23){
if(!this.pageExists(_b21)){
return 0;
}
var row=this.getPageRow(_b21);
var _b25=this.getDefaultNodes();
var rows=_ac1(_b25[_b21]);
for(var i=0,l=rows.length;i<l&&_b22<_b23;i++,row++){
_b22+=rows[i].offsetHeight;
}
return (row?row-1:row);
},getLastVisibleRow:function(_b29,_b2a,_b2b){
if(!this.pageExists(_b29)){
return 0;
}
var _b2c=this.getDefaultNodes();
var row=this.getLastPageRow(_b29);
var rows=_ac1(_b2c[_b29]);
for(var i=rows.length-1;i>=0&&_b2a>_b2b;i--,row--){
_b2a-=rows[i].offsetHeight;
}
return row+1;
},findTopRow:function(_b30){
var _b31=this.getDefaultNodes();
var rows=_ac1(_b31[this.page]);
for(var i=0,l=rows.length,t=this.pageTop,h;i<l;i++){
h=rows[i].offsetHeight;
t+=h;
if(t>=_b30){
this.offset=h-(t-_b30);
return i+this.page*this.rowsPerPage;
}
}
return -1;
},findScrollTop:function(_b37){
var _b38=Math.floor(_b37/this.rowsPerPage);
var t=0;
for(var i=0;i<_b38;i++){
t+=this.getPageHeight(i);
}
this.pageTop=t;
this.needPage(_b38,this.pageTop);
var _b3b=this.getDefaultNodes();
var rows=_ac1(_b3b[_b38]);
var r=_b37-this.rowsPerPage*_b38;
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
var _b3f=function(_b40){
try{
dojox.grid.util.fire(_b40,"focus");
dojox.grid.util.fire(_b40,"select");
}
catch(e){
}
};
var _b41=function(){
setTimeout(dojo.hitch.apply(dojo,arguments),0);
};
var dgc=dojox.grid.cells;
dojo.declare("dojox.grid.cells._Base",null,{styles:"",classes:"",editable:false,alwaysEditing:false,formatter:null,defaultValue:"...",value:null,hidden:false,noresize:false,_valueProp:"value",_formatPending:false,constructor:function(_b43){
this._props=_b43||{};
dojo.mixin(this,_b43);
},format:function(_b44,_b45){
var f,i=this.grid.edit.info,d=this.get?this.get(_b44,_b45):(this.value||this.defaultValue);
d=(d&&d.replace)?d.replace(/</g,"&lt;"):d;
if(this.editable&&(this.alwaysEditing||(i.rowIndex==_b44&&i.cell==this))){
return this.formatEditing(d,_b44);
}else{
var v=(d!=this.defaultValue&&(f=this.formatter))?f.call(this,d,_b44):d;
return (typeof v=="undefined"?this.defaultValue:v);
}
},formatEditing:function(_b4a,_b4b){
},getNode:function(_b4c){
return this.view.getCellNode(_b4c,this.index);
},getHeaderNode:function(){
return this.view.getHeaderCellNode(this.index);
},getEditNode:function(_b4d){
return (this.getNode(_b4d)||0).firstChild||0;
},canResize:function(){
var uw=this.unitWidth;
return uw&&(uw!=="auto");
},isFlex:function(){
var uw=this.unitWidth;
return uw&&dojo.isString(uw)&&(uw=="auto"||uw.slice(-1)=="%");
},applyEdit:function(_b50,_b51){
this.grid.edit.applyCellEdit(_b50,this,_b51);
},cancelEdit:function(_b52){
this.grid.doCancelEdit(_b52);
},_onEditBlur:function(_b53){
if(this.grid.edit.isEditCell(_b53,this.index)){
this.grid.edit.apply();
}
},registerOnBlur:function(_b54,_b55){
if(this.commitOnBlur){
dojo.connect(_b54,"onblur",function(e){
setTimeout(dojo.hitch(this,"_onEditBlur",_b55),250);
});
}
},needFormatNode:function(_b57,_b58){
this._formatPending=true;
_b41(this,"_formatNode",_b57,_b58);
},cancelFormatNode:function(){
this._formatPending=false;
},_formatNode:function(_b59,_b5a){
if(this._formatPending){
this._formatPending=false;
dojo.setSelectable(this.grid.domNode,true);
this.formatNode(this.getEditNode(_b5a),_b59,_b5a);
}
},formatNode:function(_b5b,_b5c,_b5d){
if(dojo.isIE){
_b41(this,"focus",_b5d,_b5b);
}else{
this.focus(_b5d,_b5b);
}
},dispatchEvent:function(m,e){
if(m in this){
return this[m](e);
}
},getValue:function(_b60){
return this.getEditNode(_b60)[this._valueProp];
},setValue:function(_b61,_b62){
var n=this.getEditNode(_b61);
if(n){
n[this._valueProp]=_b62;
}
},focus:function(_b64,_b65){
_b3f(_b65||this.getEditNode(_b64));
},save:function(_b66){
this.value=this.value||this.getValue(_b66);
},restore:function(_b67){
this.setValue(_b67,this.value);
},_finish:function(_b68){
dojo.setSelectable(this.grid.domNode,false);
this.cancelFormatNode();
},apply:function(_b69){
this.applyEdit(this.getValue(_b69),_b69);
this._finish(_b69);
},cancel:function(_b6a){
this.cancelEdit(_b6a);
this._finish(_b6a);
}});
dgc._Base.markupFactory=function(node,_b6c){
var d=dojo;
var _b6e=d.trim(d.attr(node,"formatter")||"");
if(_b6e){
_b6c.formatter=dojo.getObject(_b6e);
}
var get=d.trim(d.attr(node,"get")||"");
if(get){
_b6c.get=dojo.getObject(get);
}
var _b70=function(attr){
var _b72=d.trim(d.attr(node,attr)||"");
return _b72?!(_b72.toLowerCase()=="false"):undefined;
};
_b6c.sortDesc=_b70("sortDesc");
_b6c.editable=_b70("editable");
_b6c.alwaysEditing=_b70("alwaysEditing");
_b6c.noresize=_b70("noresize");
var _b73=d.trim(d.attr(node,"loadingText")||d.attr(node,"defaultValue")||"");
if(_b73){
_b6c.defaultValue=_b73;
}
var _b74=function(attr){
return d.trim(d.attr(node,attr)||"")||undefined;
};
_b6c.styles=_b74("styles");
_b6c.headerStyles=_b74("headerStyles");
_b6c.cellStyles=_b74("cellStyles");
_b6c.classes=_b74("classes");
_b6c.headerClasses=_b74("headerClasses");
_b6c.cellClasses=_b74("cellClasses");
};
dojo.declare("dojox.grid.cells.Cell",dgc._Base,{constructor:function(){
this.keyFilter=this.keyFilter;
},keyFilter:null,formatEditing:function(_b76,_b77){
this.needFormatNode(_b76,_b77);
return "<input class=\"dojoxGridInput\" type=\"text\" value=\""+_b76+"\">";
},formatNode:function(_b78,_b79,_b7a){
this.inherited(arguments);
this.registerOnBlur(_b78,_b7a);
},doKey:function(e){
if(this.keyFilter){
var key=String.fromCharCode(e.charCode);
if(key.search(this.keyFilter)==-1){
dojo.stopEvent(e);
}
}
},_finish:function(_b7d){
this.inherited(arguments);
var n=this.getEditNode(_b7d);
try{
dojox.grid.util.fire(n,"blur");
}
catch(e){
}
}});
dgc.Cell.markupFactory=function(node,_b80){
dgc._Base.markupFactory(node,_b80);
var d=dojo;
var _b82=d.trim(d.attr(node,"keyFilter")||"");
if(_b82){
_b80.keyFilter=new RegExp(_b82);
}
};
dojo.declare("dojox.grid.cells.RowIndex",dgc.Cell,{name:"Row",postscript:function(){
this.editable=false;
},get:function(_b83){
return _b83+1;
}});
dgc.RowIndex.markupFactory=function(node,_b85){
dgc.Cell.markupFactory(node,_b85);
};
dojo.declare("dojox.grid.cells.Select",dgc.Cell,{options:null,values:null,returnIndex:-1,constructor:function(_b86){
this.values=this.values||this.options;
},formatEditing:function(_b87,_b88){
this.needFormatNode(_b87,_b88);
var h=["<select class=\"dojoxGridSelect\">"];
for(var i=0,o,v;((o=this.options[i])!==undefined)&&((v=this.values[i])!==undefined);i++){
h.push("<option",(_b87==v?" selected":"")," value=\""+v+"\"",">",o,"</option>");
}
h.push("</select>");
return h.join("");
},getValue:function(_b8d){
var n=this.getEditNode(_b8d);
if(n){
var i=n.selectedIndex,o=n.options[i];
return this.returnIndex>-1?i:o.value||o.innerHTML;
}
}});
dgc.Select.markupFactory=function(node,cell){
dgc.Cell.markupFactory(node,cell);
var d=dojo;
var _b94=d.trim(d.attr(node,"options")||"");
if(_b94){
var o=_b94.split(",");
if(o[0]!=_b94){
cell.options=o;
}
}
var _b96=d.trim(d.attr(node,"values")||"");
if(_b96){
var v=_b96.split(",");
if(v[0]!=_b96){
cell.values=v;
}
}
};
dojo.declare("dojox.grid.cells.AlwaysEdit",dgc.Cell,{alwaysEditing:true,_formatNode:function(_b98,_b99){
this.formatNode(this.getEditNode(_b99),_b98,_b99);
},applyStaticValue:function(_b9a){
var e=this.grid.edit;
e.applyCellEdit(this.getValue(_b9a),this,_b9a);
e.start(this,_b9a,true);
}});
dgc.AlwaysEdit.markupFactory=function(node,cell){
dgc.Cell.markupFactory(node,cell);
};
dojo.declare("dojox.grid.cells.Bool",dgc.AlwaysEdit,{_valueProp:"checked",formatEditing:function(_b9e,_b9f){
return "<input class=\"dojoxGridInput\" type=\"checkbox\""+(_b9e?" checked=\"checked\"":"")+" style=\"width: auto\" />";
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
var _ba4=function(td){
return td.cellIndex>=0?td.cellIndex:dojo.indexOf(td.parentNode.cells,td);
};
var _ba6=function(tr){
return tr.rowIndex>=0?tr.rowIndex:dojo.indexOf(tr.parentNode.childNodes,tr);
};
var _ba8=function(_ba9,_baa){
return _ba9&&((_ba9.rows||0)[_baa]||_ba9.childNodes[_baa]);
};
var _bab=function(node){
for(var n=node;n&&n.tagName!="TABLE";n=n.parentNode){
}
return n;
};
var _bae=function(_baf,_bb0){
for(var n=_baf;n&&_bb0(n);n=n.parentNode){
}
return n;
};
var _bb2=function(_bb3){
var name=_bb3.toUpperCase();
return function(node){
return node.tagName!=name;
};
};
var _bb6=dojox.grid.util.rowIndexTag;
var _bb7=dojox.grid.util.gridViewTag;
dg._Builder=dojo.extend(function(view){
if(view){
this.view=view;
this.grid=view.grid;
}
},{view:null,_table:"<table class=\"dojoxGridRowTable\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\""+(dojo.isFF<3?"wairole:":"")+"presentation\"",getTableArray:function(){
var html=[this._table];
if(this.view.viewWidth){
html.push([" style=\"width:",this.view.viewWidth,";\""].join(""));
}
html.push(">");
return html;
},generateCellMarkup:function(_bba,_bbb,_bbc,_bbd){
var _bbe=[],html;
var _bc0=dojo.isFF<3?"wairole:":"";
if(_bbd){
var _bc1=_bba.index!=_bba.grid.getSortIndex()?"":_bba.grid.sortInfo>0?"aria-sort=\"ascending\"":"aria-sort=\"descending\"";
html=["<th tabIndex=\"-1\" role=\"",_bc0,"columnheader\"",_bc1];
}else{
html=["<td tabIndex=\"-1\" role=\"",_bc0,"gridcell\""];
}
_bba.colSpan&&html.push(" colspan=\"",_bba.colSpan,"\"");
_bba.rowSpan&&html.push(" rowspan=\"",_bba.rowSpan,"\"");
html.push(" class=\"dojoxGridCell ");
_bba.classes&&html.push(_bba.classes," ");
_bbc&&html.push(_bbc," ");
_bbe.push(html.join(""));
_bbe.push("");
html=["\" idx=\"",_bba.index,"\" style=\""];
if(_bbb&&_bbb[_bbb.length-1]!=";"){
_bbb+=";";
}
html.push(_bba.styles,_bbb||"",_bba.hidden?"display:none;":"");
_bba.unitWidth&&html.push("width:",_bba.unitWidth,";");
_bbe.push(html.join(""));
_bbe.push("");
html=["\""];
_bba.attrs&&html.push(" ",_bba.attrs);
html.push(">");
_bbe.push(html.join(""));
_bbe.push("");
_bbe.push(_bbd?"</th>":"</td>");
return _bbe;
},isCellNode:function(_bc2){
return Boolean(_bc2&&_bc2!=dojo.doc&&dojo.attr(_bc2,"idx"));
},getCellNodeIndex:function(_bc3){
return _bc3?Number(dojo.attr(_bc3,"idx")):-1;
},getCellNode:function(_bc4,_bc5){
for(var i=0,row;row=_ba8(_bc4.firstChild,i);i++){
for(var j=0,cell;cell=row.cells[j];j++){
if(this.getCellNodeIndex(cell)==_bc5){
return cell;
}
}
}
},findCellTarget:function(_bca,_bcb){
var n=_bca;
while(n&&(!this.isCellNode(n)||(n.offsetParent&&_bb7 in n.offsetParent.parentNode&&n.offsetParent.parentNode[_bb7]!=this.view.id))&&(n!=_bcb)){
n=n.parentNode;
}
return n!=_bcb?n:null;
},baseDecorateEvent:function(e){
e.dispatch="do"+e.type;
e.grid=this.grid;
e.sourceView=this.view;
e.cellNode=this.findCellTarget(e.target,e.rowNode);
e.cellIndex=this.getCellNodeIndex(e.cellNode);
e.cell=(e.cellIndex>=0?this.grid.getCell(e.cellIndex):null);
},findTarget:function(_bce,_bcf){
var n=_bce;
while(n&&(n!=this.domNode)&&(!(_bcf in n)||(_bb7 in n&&n[_bb7]!=this.view.id))){
n=n.parentNode;
}
return (n!=this.domNode)?n:null;
},findRowTarget:function(_bd1){
return this.findTarget(_bd1,_bb6);
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
dg._ContentBuilder=dojo.extend(function(view){
dg._Builder.call(this,view);
},dg._Builder.prototype,{update:function(){
this.prepareHtml();
},prepareHtml:function(){
var _bda=this.grid.get,_bdb=this.view.structure.cells;
for(var j=0,row;(row=_bdb[j]);j++){
for(var i=0,cell;(cell=row[i]);i++){
cell.get=cell.get||(cell.value==undefined)&&_bda;
cell.markup=this.generateCellMarkup(cell,cell.cellStyles,cell.cellClasses,false);
}
}
},generateHtml:function(_be0,_be1){
var html=this.getTableArray(),v=this.view,_be4=v.structure.cells,item=this.grid.getItem(_be1);
dojox.grid.util.fire(this.view,"onBeforeRow",[_be1,_be4]);
for(var j=0,row;(row=_be4[j]);j++){
if(row.hidden||row.header){
continue;
}
html.push(!row.invisible?"<tr>":"<tr class=\"dojoxGridInvisible\">");
for(var i=0,cell,m,cc,cs;(cell=row[i]);i++){
m=cell.markup,cc=cell.customClasses=[],cs=cell.customStyles=[];
m[5]=cell.format(_be1,item);
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
e.rowIndex=e.rowNode[_bb6];
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
},generateHtml:function(_bef,_bf0){
var html=this.getTableArray(),_bf2=this.view.structure.cells;
dojox.grid.util.fire(this.view,"onBeforeRow",[-1,_bf2]);
for(var j=0,row;(row=_bf2[j]);j++){
if(row.hidden){
continue;
}
html.push(!row.invisible?"<tr>":"<tr class=\"dojoxGridInvisible\">");
for(var i=0,cell,_bf7;(cell=row[i]);i++){
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
if(cell.attrs.indexOf("dndType='gridColumn_")==-1){
cell.attrs+=" dndType='gridColumn_"+this.grid.id+"'";
}
}else{
cell.attrs="dndType='gridColumn_"+this.grid.id+"'";
}
}
_bf7=this.generateCellMarkup(cell,cell.headerStyles,cell.headerClasses,true);
_bf7[5]=(_bf0!=undefined?_bf0:_bef(cell));
_bf7[3]=cell.customStyles.join(";");
_bf7[1]=cell.customClasses.join(" ");
html.push(_bf7.join(""));
}
html.push("</tr>");
}
html.push("</table>");
return html.join("");
},getCellX:function(e){
var x=e.layerX;
if(dojo.isMoz){
var n=_bae(e.target,_bb2("th"));
x-=(n&&n.offsetLeft)||0;
var t=e.sourceView.getScrollbarWidth();
if(!dojo._isBodyLtr()&&e.sourceView.headerNode.scrollLeft<t){
x-=t;
}
}
var n=_bae(e.target,function(){
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
var i=_ba4(e.cellNode);
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
if(dojo.isIE){
var tN=e.target;
if(dojo.hasClass(tN,"dojoxGridArrowButtonNode")||dojo.hasClass(tN,"dojoxGridArrowButtonChar")){
return false;
}
}
if(dojo._isBodyLtr()){
return (e.cellIndex>0)&&(e.cellX<this.overResizeWidth)&&this.prepareResize(e,-1);
}
var t=e.cellNode&&(e.cellX<this.overResizeWidth);
return t;
},overRightResizeArea:function(e){
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
},beginColumnResize:function(e){
this.moverDiv=document.createElement("div");
dojo.style(this.moverDiv,{position:"absolute",left:0});
dojo.body().appendChild(this.moverDiv);
var m=this.moveable=new dojo.dnd.Moveable(this.moverDiv);
var _c0e=[],_c0f=this.tableMap.findOverlappingNodes(e.cellNode);
for(var i=0,cell;(cell=_c0f[i]);i++){
_c0e.push({node:cell,index:this.getCellNodeIndex(cell),width:cell.offsetWidth});
}
var view=e.sourceView;
var adj=dojo._isBodyLtr()?1:-1;
var _c14=e.grid.views.views;
var _c15=[];
for(var i=view.idx+adj,_c16;(_c16=_c14[i]);i=i+adj){
_c15.push({node:_c16.headerNode,left:window.parseInt(_c16.headerNode.style.left)});
}
var _c17=view.headerContentNode.firstChild;
var drag={scrollLeft:e.sourceView.headerNode.scrollLeft,view:view,node:e.cellNode,index:e.cellIndex,w:dojo.contentBox(e.cellNode).w,vw:dojo.contentBox(view.headerNode).w,table:_c17,tw:dojo.contentBox(_c17).w,spanners:_c0e,followers:_c15};
m.onMove=dojo.hitch(this,"doResizeColumn",drag);
dojo.connect(m,"onMoveStop",dojo.hitch(this,function(){
this.endResizeColumn(drag);
if(drag.node.releaseCapture){
drag.node.releaseCapture();
}
this.moveable.destroy();
delete this.moveable;
this.moveable=null;
}));
view.convertColPctToFixed();
if(e.cellNode.setCapture){
e.cellNode.setCapture();
}
m.onMouseDown(e);
},doResizeColumn:function(_c19,_c1a,_c1b){
var _c1c=dojo._isBodyLtr();
var _c1d=_c1c?_c1b.l:-_c1b.l;
var w=_c19.w+_c1d;
var vw=_c19.vw+_c1d;
var tw=_c19.tw+_c1d;
if(w>=this.minColWidth){
for(var i=0,s,sw;(s=_c19.spanners[i]);i++){
sw=s.width+_c1d;
s.node.style.width=sw+"px";
_c19.view.setColWidth(s.index,sw);
}
for(var i=0,f,fl;(f=_c19.followers[i]);i++){
fl=f.left+_c1d;
f.node.style.left=fl+"px";
}
_c19.node.style.width=w+"px";
_c19.view.setColWidth(_c19.index,w);
_c19.view.headerNode.style.width=vw+"px";
_c19.view.setColumnsWidth(tw);
if(!_c1c){
_c19.view.headerNode.scrollLeft=_c19.scrollLeft+_c1d;
}
}
if(_c19.view.flexCells&&!_c19.view.testFlexCells()){
var t=_bab(_c19.node);
t&&(t.style.width="");
}
},endResizeColumn:function(_c27){
dojo.destroy(this.moverDiv);
delete this.moverDiv;
this._skipBogusClicks=true;
var conn=dojo.connect(_c27.view,"update",this,function(){
dojo.disconnect(conn);
this._skipBogusClicks=false;
});
setTimeout(dojo.hitch(_c27.view,"update"),50);
}});
dg._TableMap=dojo.extend(function(rows){
this.mapRows(rows);
},{map:null,mapRows:function(_c2a){
var _c2b=_c2a.length;
if(!_c2b){
return;
}
this.map=[];
for(var j=0,row;(row=_c2a[j]);j++){
this.map[j]=[];
}
for(var j=0,row;(row=_c2a[j]);j++){
for(var i=0,x=0,cell,_c31,_c32;(cell=row[i]);i++){
while(this.map[j][x]){
x++;
}
this.map[j][x]={c:i,r:j};
_c32=cell.rowSpan||1;
_c31=cell.colSpan||1;
for(var y=0;y<_c32;y++){
for(var s=0;s<_c31;s++){
this.map[j+y][x+s]=this.map[j][x];
}
}
x+=_c31;
}
}
},dumpMap:function(){
for(var j=0,row,h="";(row=this.map[j]);j++,h=""){
for(var i=0,cell;(cell=row[i]);i++){
h+=cell.r+","+cell.c+"   ";
}
}
},getMapCoords:function(_c3a,_c3b){
for(var j=0,row;(row=this.map[j]);j++){
for(var i=0,cell;(cell=row[i]);i++){
if(cell.c==_c3b&&cell.r==_c3a){
return {j:j,i:i};
}
}
}
return {j:-1,i:-1};
},getNode:function(_c40,_c41,_c42){
var row=_c40&&_c40.rows[_c41];
return row&&row.cells[_c42];
},_findOverlappingNodes:function(_c44,_c45,_c46){
var _c47=[];
var m=this.getMapCoords(_c45,_c46);
var row=this.map[m.j];
for(var j=0,row;(row=this.map[j]);j++){
if(j==m.j){
continue;
}
var rw=row[m.i];
var n=(rw?this.getNode(_c44,rw.r,rw.c):null);
if(n){
_c47.push(n);
}
}
return _c47;
},findOverlappingNodes:function(_c4d){
return this._findOverlappingNodes(_bab(_c4d),_ba6(_c4d.parentNode),_ba4(_c4d));
}});
})();
}
if(!dojo._hasResource["dojox.grid._View"]){
dojo._hasResource["dojox.grid._View"]=true;
dojo.provide("dojox.grid._View");
(function(){
var _c4e=function(_c4f,_c50){
return _c4f.style.cssText==undefined?_c4f.getAttribute("style"):_c4f.style.cssText;
};
dojo.declare("dojox.grid._View",[dijit._Widget,dijit._Templated],{defaultWidth:"18em",viewWidth:"",templateString:"<div class=\"dojoxGridView\" wairole=\"presentation\">\r\n\t<div class=\"dojoxGridHeader\" dojoAttachPoint=\"headerNode\" wairole=\"presentation\">\r\n\t\t<div dojoAttachPoint=\"headerNodeContainer\" style=\"width:9000em\" wairole=\"presentation\">\r\n\t\t\t<div dojoAttachPoint=\"headerContentNode\" wairole=\"row\"></div>\r\n\t\t</div>\r\n\t</div>\r\n\t<input type=\"checkbox\" class=\"dojoxGridHiddenFocus\" dojoAttachPoint=\"hiddenFocusNode\" wairole=\"presentation\" />\r\n\t<input type=\"checkbox\" class=\"dojoxGridHiddenFocus\" wairole=\"presentation\" />\r\n\t<div class=\"dojoxGridScrollbox\" dojoAttachPoint=\"scrollboxNode\" wairole=\"presentation\">\r\n\t\t<div class=\"dojoxGridContent\" dojoAttachPoint=\"contentNode\" hidefocus=\"hidefocus\" wairole=\"presentation\"></div>\r\n\t</div>\r\n</div>\r\n",themeable:false,classTag:"dojoxGrid",marginBottom:0,rowPad:2,_togglingColumn:-1,postMixInProperties:function(){
this.rowNodes=[];
},postCreate:function(){
this.connect(this.scrollboxNode,"onscroll","doscroll");
dojox.grid.util.funnelEvents(this.contentNode,this,"doContentEvent",["mouseover","mouseout","click","dblclick","contextmenu","mousedown"]);
dojox.grid.util.funnelEvents(this.headerNode,this,"doHeaderEvent",["dblclick","mouseover","mouseout","mousemove","mousedown","click","contextmenu"]);
this.content=new dojox.grid._ContentBuilder(this);
this.header=new dojox.grid._HeaderBuilder(this);
if(!dojo._isBodyLtr()){
this.headerNodeContainer.style.width="";
}
},destroy:function(){
dojo.destroy(this.headerNode);
delete this.headerNode;
dojo.forEach(this.rowNodes,dojo.destroy);
this.rowNodes=[];
if(this.source){
this.source.destroy();
}
this.inherited(arguments);
},focus:function(){
if(dojo.isWebKit||dojo.isOpera){
this.hiddenFocusNode.focus();
}else{
this.scrollboxNode.focus();
}
},setStructure:function(_c51){
var vs=(this.structure=_c51);
if(vs.width&&!isNaN(vs.width)){
this.viewWidth=vs.width+"em";
}else{
this.viewWidth=vs.width||(vs.noscroll?"auto":this.viewWidth);
}
this.onBeforeRow=vs.onBeforeRow;
this.onAfterRow=vs.onAfterRow;
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
var _c57=this.hasVScrollbar();
var _c58=dojo.style(this.scrollboxNode,"overflow");
if(this.noscroll||!_c58||_c58=="hidden"){
_c57=false;
}else{
if(_c58=="scroll"){
_c57=true;
}
}
return (_c57?dojox.html.metrics.getScrollbar().w:0);
},getColumnsWidth:function(){
return this.headerContentNode.firstChild.offsetWidth;
},setColumnsWidth:function(_c59){
this.headerContentNode.firstChild.style.width=_c59+"px";
if(this.viewWidth){
this.viewWidth=_c59+"px";
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
var _c5a=this.grid.layout.cells;
var _c5b=dojo.hitch(this,function(node,_c5d){
var inc=_c5d?-1:1;
var idx=this.header.getCellNodeIndex(node)+inc;
var cell=_c5a[idx];
while(cell&&cell.getHeaderNode()&&cell.getHeaderNode().style.display=="none"){
idx+=inc;
cell=_c5a[idx];
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
}),_markTargetAnchor:dojo.hitch(this,function(_c62){
var src=this.source;
if(src.current==src.targetAnchor&&src.before==_c62){
return;
}
if(src.targetAnchor&&_c5b(src.targetAnchor,src.before)){
src._removeItemClass(_c5b(src.targetAnchor,src.before),src.before?"After":"Before");
}
dojo.dnd.Source.prototype._markTargetAnchor.call(src,_c62);
if(src.targetAnchor&&_c5b(src.targetAnchor,src.before)){
src._addItemClass(_c5b(src.targetAnchor,src.before),src.before?"After":"Before");
}
}),_unmarkTargetAnchor:dojo.hitch(this,function(){
var src=this.source;
if(!src.targetAnchor){
return;
}
if(src.targetAnchor&&_c5b(src.targetAnchor,src.before)){
src._removeItemClass(_c5b(src.targetAnchor,src.before),src.before?"After":"Before");
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
},_onDndDropBefore:function(_c65,_c66,copy){
if(dojo.dnd.manager().target!==this.source){
return;
}
this.source._targetNode=this.source.targetAnchor;
this.source._beforeTarget=this.source.before;
var _c68=this.grid.views.views;
var _c69=_c68[_c65.viewIndex];
var _c6a=_c68[this.index];
if(_c6a!=_c69){
var s=_c69.convertColPctToFixed();
var t=_c6a.convertColPctToFixed();
if(s||t){
setTimeout(function(){
_c69.update();
_c6a.update();
},50);
}
}
},_onDndDrop:function(_c6d,_c6e,copy){
if(dojo.dnd.manager().target!==this.source){
if(dojo.dnd.manager().source===this.source){
this._removingColumn=true;
}
return;
}
var _c70=function(n){
return n?dojo.attr(n,"idx"):null;
};
var w=dojo.marginBox(_c6e[0]).w;
if(_c6d.viewIndex!==this.index){
var _c73=this.grid.views.views;
var _c74=_c73[_c6d.viewIndex];
var _c75=_c73[this.index];
if(_c74.viewWidth&&_c74.viewWidth!="auto"){
_c74.setColumnsWidth(_c74.getColumnsWidth()-w);
}
if(_c75.viewWidth&&_c75.viewWidth!="auto"){
_c75.setColumnsWidth(_c75.getColumnsWidth());
}
}
var stn=this.source._targetNode;
var stb=this.source._beforeTarget;
var _c78=this.grid.layout;
var idx=this.index;
delete this.source._targetNode;
delete this.source._beforeTarget;
window.setTimeout(function(){
_c78.moveColumn(_c6d.viewIndex,idx,_c70(_c6e[0]),_c70(stn),stb);
},1);
},renderHeader:function(){
this.headerContentNode.innerHTML=this.header.generateHtml(this._getHeaderContent);
if(this.flexCells){
this.contentWidth=this.getContentWidth();
this.headerContentNode.firstChild.style.width=this.contentWidth;
}
dojox.grid.util.fire(this,"onAfterRow",[-1,this.structure.cells,this.headerContentNode]);
},_getHeaderContent:function(_c7a){
var n=_c7a.name||_c7a.grid.getCellName(_c7a);
var ret=["<div class=\"dojoxGridSortNode"];
if(_c7a.index!=_c7a.grid.getSortIndex()){
ret.push("\">");
}else{
ret=ret.concat([" ",_c7a.grid.sortInfo>0?"dojoxGridSortUp":"dojoxGridSortDown","\"><div class=\"dojoxGridArrowButtonChar\">",_c7a.grid.sortInfo>0?"&#9650;":"&#9660;","</div><div class=\"dojoxGridArrowButtonNode\" role=\""+(dojo.isFF<3?"wairole:":"")+"presentation\"></div>"]);
}
ret=ret.concat([n,"</div>"]);
return ret.join("");
},resize:function(){
this.adaptHeight();
this.adaptWidth();
},hasHScrollbar:function(_c7d){
if(this._hasHScroll==undefined||_c7d){
if(this.noscroll){
this._hasHScroll=false;
}else{
var _c7e=dojo.style(this.scrollboxNode,"overflow");
if(_c7e=="hidden"){
this._hasHScroll=false;
}else{
if(_c7e=="scroll"){
this._hasHScroll=true;
}else{
this._hasHScroll=(this.scrollboxNode.offsetWidth<this.contentNode.offsetWidth);
}
}
}
}
return this._hasHScroll;
},hasVScrollbar:function(_c7f){
if(this._hasVScroll==undefined||_c7f){
if(this.noscroll){
this._hasVScroll=false;
}else{
var _c80=dojo.style(this.scrollboxNode,"overflow");
if(_c80=="hidden"){
this._hasVScroll=false;
}else{
if(_c80=="scroll"){
this._hasVScroll=true;
}else{
this._hasVScroll=(this.scrollboxNode.offsetHeight<this.contentNode.offsetHeight);
}
}
}
}
return this._hasVScroll;
},convertColPctToFixed:function(){
var _c81=false;
var _c82=dojo.query("th",this.headerContentNode);
var _c83=dojo.map(_c82,function(c,vIdx){
var w=c.style.width;
dojo.attr(c,"vIdx",vIdx);
if(w&&w.slice(-1)=="%"){
_c81=true;
}else{
if(w&&w.slice(-2)=="px"){
return window.parseInt(w,10);
}
}
return dojo.contentBox(c).w;
});
if(_c81){
dojo.forEach(this.grid.layout.cells,function(cell,idx){
if(cell.view==this){
var _c89=cell.view.getHeaderCellNode(cell.index);
if(_c89&&dojo.hasAttr(_c89,"vIdx")){
var vIdx=window.parseInt(dojo.attr(_c89,"vIdx"));
this.setColWidth(idx,_c83[vIdx]);
_c82[vIdx].style.width=cell.unitWidth;
dojo.removeAttr(_c89,"vIdx");
}
}
},this);
return true;
}
return false;
},adaptHeight:function(_c8b){
if(!this.grid._autoHeight){
var h=this.domNode.clientHeight;
if(_c8b){
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
},renderRow:function(_c93){
var _c94=this.createRowNode(_c93);
this.buildRow(_c93,_c94);
this.grid.edit.restore(this,_c93);
if(this._pendingUpdate){
window.clearTimeout(this._pendingUpdate);
}
this._pendingUpdate=window.setTimeout(dojo.hitch(this,function(){
window.clearTimeout(this._pendingUpdate);
delete this._pendingUpdate;
this.grid._resize();
}),50);
return _c94;
},createRowNode:function(_c95){
var node=document.createElement("div");
node.className=this.classTag+"Row";
dojo.attr(node,"role","row");
node[dojox.grid.util.gridViewTag]=this.id;
node[dojox.grid.util.rowIndexTag]=_c95;
this.rowNodes[_c95]=node;
return node;
},buildRow:function(_c97,_c98){
this.buildRowContent(_c97,_c98);
this.styleRow(_c97,_c98);
},buildRowContent:function(_c99,_c9a){
_c9a.innerHTML=this.content.generateHtml(_c99,_c99);
if(this.flexCells&&this.contentWidth){
_c9a.firstChild.style.width=this.contentWidth;
}
dojox.grid.util.fire(this,"onAfterRow",[_c99,this.structure.cells,_c9a]);
},rowRemoved:function(_c9b){
this.grid.edit.save(this,_c9b);
delete this.rowNodes[_c9b];
},getRowNode:function(_c9c){
return this.rowNodes[_c9c];
},getCellNode:function(_c9d,_c9e){
var row=this.getRowNode(_c9d);
if(row){
return this.content.getCellNode(row,_c9e);
}
},getHeaderCellNode:function(_ca0){
if(this.headerContentNode){
return this.header.getCellNode(this.headerContentNode,_ca0);
}
},styleRow:function(_ca1,_ca2){
_ca2._style=_c4e(_ca2);
this.styleRowNode(_ca1,_ca2);
},styleRowNode:function(_ca3,_ca4){
if(_ca4){
this.doStyleRowNode(_ca3,_ca4);
}
},doStyleRowNode:function(_ca5,_ca6){
this.grid.styleRowNode(_ca5,_ca6);
},updateRow:function(_ca7){
var _ca8=this.getRowNode(_ca7);
if(_ca8){
_ca8.style.height="";
this.buildRow(_ca7,_ca8);
}
return _ca8;
},updateRowStyles:function(_ca9){
this.styleRowNode(_ca9,this.getRowNode(_ca9));
},lastTop:0,firstScroll:0,doscroll:function(_caa){
var _cab=dojo._isBodyLtr();
if(this.firstScroll<2){
if((!_cab&&this.firstScroll==1)||(_cab&&this.firstScroll==0)){
var s=dojo.marginBox(this.headerNodeContainer);
if(dojo.isIE){
this.headerNodeContainer.style.width=s.w+this.getScrollbarWidth()+"px";
}else{
if(dojo.isMoz){
this.headerNodeContainer.style.width=s.w-this.getScrollbarWidth()+"px";
this.scrollboxNode.scrollLeft=_cab?this.scrollboxNode.clientWidth-this.scrollboxNode.scrollWidth:this.scrollboxNode.scrollWidth-this.scrollboxNode.clientWidth;
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
},setScrollTop:function(_cae){
this.lastTop=_cae;
this.scrollboxNode.scrollTop=_cae;
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
},setColWidth:function(_cb3,_cb4){
this.grid.setCellWidth(_cb3,_cb4+"px");
},update:function(){
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
var _cbc=this.manager.source,node;
if(_cbc.creator){
node=_cbc._normailzedCreator(_cbc.getItem(this.manager.nodes[0].id).data,"avatar").node;
}else{
node=this.manager.nodes[0].cloneNode(true);
if(node.tagName.toLowerCase()=="tr"){
var _cbe=dd.createElement("table"),_cbf=dd.createElement("tbody");
_cbf.appendChild(node);
_cbe.appendChild(_cbf);
node=_cbe;
}else{
if(node.tagName.toLowerCase()=="th"){
var _cbe=dd.createElement("table"),_cbf=dd.createElement("tbody"),r=dd.createElement("tr");
_cbe.cellPadding=_cbe.cellSpacing="0";
r.appendChild(node);
_cbf.appendChild(r);
_cbe.appendChild(_cbf);
node=_cbe;
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
var _cc2=dojo.dnd.manager().makeAvatar;
dojo.dnd.manager().makeAvatar=function(){
var src=this.source;
if(src.viewIndex!==undefined){
return new dojox.grid._GridAvatar(this);
}
return _cc2.call(dojo.dnd.manager());
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
},buildRowContent:function(_cc4,_cc5){
var w=this.contentNode.offsetWidth-this.padBorderWidth;
_cc5.innerHTML="<table class=\"dojoxGridRowbarTable\" style=\"width:"+w+"px;\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\""+(dojo.isFF<3?"wairole:":"")+"presentation\"><tr><td class=\"dojoxGridRowbarInner\">&nbsp;</td></tr></table>";
},renderHeader:function(){
},resize:function(){
this.adaptHeight();
},adaptWidth:function(){
},doStyleRowNode:function(_cc7,_cc8){
var n=["dojoxGridRowbar"];
if(this.grid.rows.isOver(_cc7)){
n.push("dojoxGridRowbarOver");
}
if(this.grid.selection.isSelected(_cc7)){
n.push("dojoxGridRowbarSelected");
}
_cc8.className=n.join(" ");
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
dojo.declare("dojox.grid._Layout",null,{constructor:function(_ccc){
this.grid=_ccc;
},cells:[],structure:null,defaultWidth:"6em",moveColumn:function(_ccd,_cce,_ccf,_cd0,_cd1){
var _cd2=this.structure[_ccd].cells[0];
var _cd3=this.structure[_cce].cells[0];
var cell=null;
var _cd5=0;
var _cd6=0;
for(var i=0,c;c=_cd2[i];i++){
if(c.index==_ccf){
_cd5=i;
break;
}
}
cell=_cd2.splice(_cd5,1)[0];
cell.view=this.grid.views.views[_cce];
for(i=0,c=null;c=_cd3[i];i++){
if(c.index==_cd0){
_cd6=i;
break;
}
}
if(!_cd1){
_cd6+=1;
}
_cd3.splice(_cd6,0,cell);
var _cd9=this.grid.getCell(this.grid.getSortIndex());
if(_cd9){
_cd9._currentlySorted=this.grid.getSortAsc();
}
this.cells=[];
var _ccf=0;
for(var i=0,v;v=this.structure[i];i++){
for(var j=0,cs;cs=v.cells[j];j++){
for(var k=0,c;c=cs[k];k++){
c.index=_ccf;
this.cells.push(c);
if("_currentlySorted" in c){
var si=_ccf+1;
si*=c._currentlySorted?1:-1;
this.grid.sortInfo=si;
delete c._currentlySorted;
}
_ccf++;
}
}
}
this.grid.setupHeaderMenu();
},setColumnVisibility:function(_cdf,_ce0){
var cell=this.cells[_cdf];
if(cell.hidden==_ce0){
cell.hidden=!_ce0;
var v=cell.view,w=v.viewWidth;
if(w&&w!="auto"){
v._togglingColumn=dojo.marginBox(cell.getHeaderNode()).w||0;
}
v.update();
return true;
}else{
return false;
}
},addCellDef:function(_ce4,_ce5,_ce6){
var self=this;
var _ce8=function(_ce9){
var w=0;
if(_ce9.colSpan>1){
w=0;
}else{
w=_ce9.width||self._defaultCellProps.width||self.defaultWidth;
if(!isNaN(w)){
w=w+"em";
}
}
return w;
};
var _ceb={grid:this.grid,subrow:_ce4,layoutIndex:_ce5,index:this.cells.length};
if(_ce6&&_ce6 instanceof dojox.grid.cells._Base){
var _cec=dojo.clone(_ce6);
_ceb.unitWidth=_ce8(_cec._props);
_cec=dojo.mixin(_cec,this._defaultCellProps,_ce6._props,_ceb);
return _cec;
}
var _ced=_ce6.type||this._defaultCellProps.type||dojox.grid.cells.Cell;
_ceb.unitWidth=_ce8(_ce6);
return new _ced(dojo.mixin({},this._defaultCellProps,_ce6,_ceb));
},addRowDef:function(_cee,_cef){
var _cf0=[];
var _cf1=0,_cf2=0,_cf3=true;
for(var i=0,def,cell;(def=_cef[i]);i++){
cell=this.addCellDef(_cee,i,def);
_cf0.push(cell);
this.cells.push(cell);
if(_cf3&&cell.relWidth){
_cf1+=cell.relWidth;
}else{
if(cell.width){
var w=cell.width;
if(typeof w=="string"&&w.slice(-1)=="%"){
_cf2+=window.parseInt(w,10);
}else{
if(w=="auto"){
_cf3=false;
}
}
}
}
}
if(_cf1&&_cf3){
dojo.forEach(_cf0,function(cell){
if(cell.relWidth){
cell.width=cell.unitWidth=((cell.relWidth/_cf1)*(100-_cf2))+"%";
}
});
}
return _cf0;
},addRowsDef:function(_cf9){
var _cfa=[];
if(dojo.isArray(_cf9)){
if(dojo.isArray(_cf9[0])){
for(var i=0,row;_cf9&&(row=_cf9[i]);i++){
_cfa.push(this.addRowDef(i,row));
}
}else{
_cfa.push(this.addRowDef(0,_cf9));
}
}
return _cfa;
},addViewDef:function(_cfd){
this._defaultCellProps=_cfd.defaultCell||{};
if(_cfd.width&&_cfd.width=="auto"){
delete _cfd.width;
}
return dojo.mixin({},_cfd,{cells:this.addRowsDef(_cfd.rows||_cfd.cells)});
},setStructure:function(_cfe){
this.fieldIndex=0;
this.cells=[];
var s=this.structure=[];
if(this.grid.rowSelector){
var sel={type:dojox._scopeName+".grid._RowSelector"};
if(dojo.isString(this.grid.rowSelector)){
var _d01=this.grid.rowSelector;
if(_d01=="false"){
sel=null;
}else{
if(_d01!="true"){
sel["width"]=_d01;
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
var _d02=function(def){
return ("name" in def||"field" in def||"get" in def);
};
var _d04=function(def){
if(dojo.isArray(def)){
if(dojo.isArray(def[0])||_d02(def[0])){
return true;
}
}
return false;
};
var _d06=function(def){
return (def!=null&&dojo.isObject(def)&&("cells" in def||"rows" in def||("type" in def&&!_d02(def))));
};
if(dojo.isArray(_cfe)){
var _d08=false;
for(var i=0,st;(st=_cfe[i]);i++){
if(_d06(st)){
_d08=true;
break;
}
}
if(!_d08){
s.push(this.addViewDef({cells:_cfe}));
}else{
for(var i=0,st;(st=_cfe[i]);i++){
if(_d04(st)){
s.push(this.addViewDef({cells:st}));
}else{
if(_d06(st)){
s.push(this.addViewDef(st));
}
}
}
}
}else{
if(_d06(_cfe)){
s.push(this.addViewDef(_cfe));
}
}
this.cellCount=this.cells.length;
this.grid.setupHeaderMenu();
}});
}
if(!dojo._hasResource["dojox.grid._ViewManager"]){
dojo._hasResource["dojox.grid._ViewManager"]=true;
dojo.provide("dojox.grid._ViewManager");
dojo.declare("dojox.grid._ViewManager",null,{constructor:function(_d0b){
this.grid=_d0b;
},defaultWidth:200,views:[],resize:function(){
this.onEach("resize");
},render:function(){
this.onEach("render");
},addView:function(_d0c){
_d0c.idx=this.views.length;
this.views.push(_d0c);
},destroyViews:function(){
for(var i=0,v;v=this.views[i];i++){
v.destroy();
}
this.views=[];
},getContentNodes:function(){
var _d0f=[];
for(var i=0,v;v=this.views[i];i++){
_d0f.push(v.contentNode);
}
return _d0f;
},forEach:function(_d12){
for(var i=0,v;v=this.views[i];i++){
_d12(v,i);
}
},onEach:function(_d15,_d16){
_d16=_d16||[];
for(var i=0,v;v=this.views[i];i++){
if(_d15 in v){
v[_d15].apply(v,_d16);
}
}
},normalizeHeaderNodeHeight:function(){
var _d19=[];
for(var i=0,v;(v=this.views[i]);i++){
if(v.headerContentNode.firstChild){
_d19.push(v.headerContentNode);
}
}
this.normalizeRowNodeHeights(_d19);
},normalizeRowNodeHeights:function(_d1c){
var h=0;
for(var i=0,n,o;(n=_d1c[i]);i++){
h=Math.max(h,dojo.marginBox(n.firstChild).h);
}
h=(h>=0?h:0);
for(var i=0,n;(n=_d1c[i]);i++){
dojo.marginBox(n.firstChild,{h:h});
}
if(_d1c&&_d1c[0]&&_d1c[0].parentNode){
_d1c[0].parentNode.offsetHeight;
}
},resetHeaderNodeHeight:function(){
for(var i=0,v,n;(v=this.views[i]);i++){
n=v.headerContentNode.firstChild;
if(n){
n.style.height="";
}
}
},renormalizeRow:function(_d24){
var _d25=[];
for(var i=0,v,n;(v=this.views[i])&&(n=v.getRowNode(_d24));i++){
n.firstChild.style.height="";
_d25.push(n);
}
this.normalizeRowNodeHeights(_d25);
},getViewWidth:function(_d29){
return this.views[_d29].getWidth()||this.defaultWidth;
},measureHeader:function(){
this.resetHeaderNodeHeight();
this.forEach(function(_d2a){
_d2a.headerContentNode.style.height="";
});
var h=0;
this.forEach(function(_d2c){
h=Math.max(_d2c.headerNode.offsetHeight,h);
});
return h;
},measureContent:function(){
var h=0;
this.forEach(function(_d2e){
h=Math.max(_d2e.domNode.offsetHeight,h);
});
return h;
},findClient:function(_d2f){
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
var _d3a=function(v,l){
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
_d3a(v,l);
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
_d3a(v,r);
}
if(c<len){
v=this.views[c];
vw=Math.max(1,r-l);
v.setSize(vw+"px",0);
_d3a(v,l);
}
return l;
},renderRow:function(_d41,_d42){
var _d43=[];
for(var i=0,v,n,_d47;(v=this.views[i])&&(n=_d42[i]);i++){
_d47=v.renderRow(_d41);
n.appendChild(_d47);
_d43.push(_d47);
}
this.normalizeRowNodeHeights(_d43);
},rowRemoved:function(_d48){
this.onEach("rowRemoved",[_d48]);
},updateRow:function(_d49){
for(var i=0,v;v=this.views[i];i++){
v.updateRow(_d49);
}
this.renormalizeRow(_d49);
},updateRowStyles:function(_d4c){
this.onEach("updateRowStyles",[_d4c]);
},setScrollTop:function(_d4d){
var top=_d4d;
for(var i=0,v;v=this.views[i];i++){
top=v.setScrollTop(_d4d);
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
}});
}
if(!dojo._hasResource["dojox.grid._RowManager"]){
dojo._hasResource["dojox.grid._RowManager"]=true;
dojo.provide("dojox.grid._RowManager");
(function(){
var _d53=function(_d54,_d55){
if(_d54.style.cssText==undefined){
_d54.setAttribute("style",_d55);
}else{
_d54.style.cssText=_d55;
}
};
dojo.declare("dojox.grid._RowManager",null,{constructor:function(_d56){
this.grid=_d56;
},linesToEms:2,overRow:-2,prepareStylingRow:function(_d57,_d58){
return {index:_d57,node:_d58,odd:Boolean(_d57&1),selected:this.grid.selection.isSelected(_d57),over:this.isOver(_d57),customStyles:"",customClasses:"dojoxGridRow"};
},styleRowNode:function(_d59,_d5a){
var row=this.prepareStylingRow(_d59,_d5a);
this.grid.onStyleRow(row);
this.applyStyles(row);
},applyStyles:function(_d5c){
var i=_d5c;
i.node.className=i.customClasses;
var h=i.node.style.height;
_d53(i.node,i.customStyles+";"+(i.node._style||""));
i.node.style.height=h;
},updateStyles:function(_d5f){
this.grid.updateRowStyles(_d5f);
},setOverRow:function(_d60){
var last=this.overRow;
this.overRow=_d60;
if((last!=this.overRow)&&(last>=0)){
this.updateStyles(last);
}
this.updateStyles(this.overRow);
},isOver:function(_d62){
return (this.overRow==_d62);
}});
})();
}
if(!dojo._hasResource["dojox.grid._FocusManager"]){
dojo._hasResource["dojox.grid._FocusManager"]=true;
dojo.provide("dojox.grid._FocusManager");
dojo.declare("dojox.grid._FocusManager",null,{constructor:function(_d63){
this.grid=_d63;
this.cell=null;
this.rowIndex=-1;
this._connects=[];
this._connects.push(dojo.connect(this.grid.domNode,"onfocus",this,"doFocus"));
this._connects.push(dojo.connect(this.grid.domNode,"onblur",this,"doBlur"));
this._connects.push(dojo.connect(this.grid.lastFocusNode,"onfocus",this,"doLastNodeFocus"));
this._connects.push(dojo.connect(this.grid.lastFocusNode,"onblur",this,"doLastNodeBlur"));
this._connects.push(dojo.connect(this.grid,"_onFetchComplete",this,"_delayedCellFocus"));
this._connects.push(dojo.connect(this.grid,"postrender",this,"_delayedHeaderFocus"));
},destroy:function(){
dojo.forEach(this._connects,dojo.disconnect);
delete this.grid;
delete this.cell;
},_colHeadNode:null,_colHeadFocusIdx:null,tabbingOut:false,focusClass:"dojoxGridCellFocus",focusView:null,initFocusView:function(){
this.focusView=this.grid.views.getFirstScrollingView()||this.focusView;
this._initColumnHeaders();
},isFocusCell:function(_d64,_d65){
return (this.cell==_d64)&&(this.rowIndex==_d65);
},isLastFocusCell:function(){
if(this.cell){
return (this.rowIndex==this.grid.rowCount-1)&&(this.cell.index==this.grid.layout.cellCount-1);
}
return false;
},isFirstFocusCell:function(){
if(this.cell){
return (this.rowIndex==0)&&(this.cell.index==0);
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
},_focusifyCellNode:function(_d66){
var n=this.cell&&this.cell.getNode(this.rowIndex);
if(n){
dojo.toggleClass(n,this.focusClass,_d66);
if(_d66){
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
if(this.isNavHeader()){
return;
}
var n=this.cell&&this.cell.getNode(this.rowIndex);
if(n){
try{
if(!this.grid.edit.isEditing()){
dojo.toggleClass(n,this.focusClass,true);
dojox.grid.util.fire(n,"focus");
}
}
catch(e){
}
}
},_delayedHeaderFocus:function(){
if(this.isNavHeader()){
this.focusHeader();
}
},_initColumnHeaders:function(){
this._connects.push(dojo.connect(this.grid.viewsHeaderNode,"onblur",this,"doBlurHeader"));
var _d6a=this._findHeaderCells();
for(var i=0;i<_d6a.length;i++){
this._connects.push(dojo.connect(_d6a[i],"onfocus",this,"doColHeaderFocus"));
this._connects.push(dojo.connect(_d6a[i],"onblur",this,"doColHeaderBlur"));
}
},_findHeaderCells:function(){
var _d6c=dojo.query("th",this.grid.viewsHeaderNode);
var _d6d=[];
for(var i=0;i<_d6c.length;i++){
var _d6f=_d6c[i];
var _d70=dojo.hasAttr(_d6f,"tabindex");
var _d71=dojo.attr(_d6f,"tabindex");
if(_d70&&_d71<0){
_d6d.push(_d6f);
}
}
return _d6d;
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
},_scrollInfo:function(cell,_d75){
if(cell){
var cl=cell,sbn=cl.view.scrollboxNode,sbnr={w:sbn.clientWidth,l:sbn.scrollLeft,t:sbn.scrollTop,h:sbn.clientHeight},rn=cl.view.getRowNode(this.rowIndex);
return {c:cl,s:sbn,sr:sbnr,n:(_d75?_d75:cell.getNode(this.rowIndex)),r:rn};
}
return null;
},_scrollHeader:function(_d7a){
var info=null;
if(this._colHeadNode){
var cell=this.grid.getCell(_d7a);
info=this._scrollInfo(cell,cell.getNode(0));
}
if(info&&info.s&&info.sr&&info.n){
var _d7d=info.sr.l+info.sr.w;
if(info.n.offsetLeft+info.n.offsetWidth>_d7d){
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
},styleRow:function(_d7e){
return;
},setFocusIndex:function(_d7f,_d80){
this.setFocusCell(this.grid.getCell(_d80),_d7f);
},setFocusCell:function(_d81,_d82){
if(_d81&&!this.isFocusCell(_d81,_d82)){
this.tabbingOut=false;
this._colHeadNode=this._colHeadFocusIdx=null;
this.focusGridView();
this._focusifyCellNode(false);
this.cell=_d81;
this.rowIndex=_d82;
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
var _d87=this.grid.getCell(col);
if(!this.isLastFocusCell()&&!_d87.editable){
this.cell=_d87;
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
var _d8a=this.grid.getCell(col);
if(!this.isFirstFocusCell()&&!_d8a.editable){
this.cell=_d8a;
this.rowIndex=row;
this.previous();
return;
}
}
this.setFocusIndex(row,col);
}
},move:function(_d8b,_d8c){
if(this.isNavHeader()){
var _d8d=this._findHeaderCells();
var _d8e=dojo.indexOf(_d8d,this._colHeadNode);
_d8e+=_d8c;
if((_d8e>=0)&&(_d8e<_d8d.length)){
this._colHeadNode=_d8d[_d8e];
this._colHeadFocusIdx=_d8e;
this._scrollHeader(_d8e);
this._colHeadNode.focus();
}
}else{
if(this.cell){
var sc=this.grid.scroller,r=this.rowIndex,rc=this.grid.rowCount-1,row=Math.min(rc,Math.max(0,r+_d8b));
if(_d8b){
if(_d8b>0){
if(row>sc.getLastPageRow(sc.page)){
this.grid.setScrollTop(this.grid.scrollTop+sc.findScrollTop(row)-sc.findScrollTop(r));
}
}else{
if(_d8b<0){
if(row<=sc.getPageRow(sc.page)){
this.grid.setScrollTop(this.grid.scrollTop-sc.findScrollTop(r)-sc.findScrollTop(row));
}
}
}
}
var cc=this.grid.layout.cellCount-1,i=this.cell.index,col=Math.min(cc,Math.max(0,i+_d8c));
this.setFocusIndex(row,col);
if(_d8b){
this.grid.updateRow(r);
}
}
}
},previousKey:function(e){
if(this.grid.edit.isEditing()){
dojo.stopEvent(e);
this.previous();
}else{
if(!this.isNavHeader()){
this.focusHeader();
dojo.stopEvent(e);
}else{
this.tabOut(this.grid.domNode);
}
}
},nextKey:function(e){
var _d98=this.grid.rowCount==0;
if(e.target===this.grid.domNode){
this.focusHeader();
dojo.stopEvent(e);
}else{
if(this.isNavHeader()){
this._colHeadNode=this._colHeadFocusIdx=null;
if(this.isNoFocusCell()&&!_d98){
this.setFocusIndex(0,0);
}else{
if(this.cell&&!_d98){
if(this.focusView&&!this.focusView.rowNodes[this.rowIndex]){
this.grid.scrollToRow(this.rowIndex);
}
this.focusGrid();
}else{
this.tabOut(this.grid.lastFocusNode);
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
},tabOut:function(_d99){
this.tabbingOut=true;
_d99.focus();
},focusGridView:function(){
dojox.grid.util.fire(this.focusView,"focus");
},focusGrid:function(_d9a){
this.focusGridView();
this._focusifyCellNode(true);
},focusHeader:function(){
var _d9b=this._findHeaderCells();
if(!this._colHeadFocusIdx){
if(this.isNoFocusCell()){
this._colHeadFocusIdx=0;
}else{
this._colHeadFocusIdx=this.cell.index;
}
}
this._colHeadNode=_d9b[this._colHeadFocusIdx];
if(this._colHeadNode){
dojox.grid.util.fire(this._colHeadNode,"focus");
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
dojo.toggleClass(e.target,this.focusClass,true);
this._scrollHeader(this.getHeaderIndex());
},doColHeaderBlur:function(e){
dojo.toggleClass(e.target,this.focusClass,false);
}});
}
if(!dojo._hasResource["dojox.grid._EditManager"]){
dojo._hasResource["dojox.grid._EditManager"]=true;
dojo.provide("dojox.grid._EditManager");
dojo.declare("dojox.grid._EditManager",null,{constructor:function(_da3){
this.grid=_da3;
this.connections=[];
if(dojo.isIE){
this.connections.push(dojo.connect(document.body,"onfocus",dojo.hitch(this,"_boomerangFocus")));
}
},info:{},destroy:function(){
dojo.forEach(this.connections,dojo.disconnect);
},cellFocus:function(_da4,_da5){
if(this.grid.singleClickEdit||this.isEditRow(_da5)){
this.setEditCell(_da4,_da5);
}else{
this.apply();
}
if(this.isEditing()||(_da4&&_da4.editable&&_da4.alwaysEditing)){
this._focusEditor(_da4,_da5);
}
},rowClick:function(e){
if(this.isEditing()&&!this.isEditRow(e.rowIndex)){
this.apply();
}
},styleRow:function(_da7){
if(_da7.index==this.info.rowIndex){
_da7.customClasses+=" dojoxGridRowEditing";
}
},dispatchEvent:function(e){
var c=e.cell,ed=(c&&c["editable"])?c:0;
return ed&&ed.dispatchEvent(e.dispatch,e);
},isEditing:function(){
return this.info.rowIndex!==undefined;
},isEditCell:function(_dab,_dac){
return (this.info.rowIndex===_dab)&&(this.info.cell.index==_dac);
},isEditRow:function(_dad){
return this.info.rowIndex===_dad;
},setEditCell:function(_dae,_daf){
if(!this.isEditCell(_daf,_dae.index)&&this.grid.canEdit&&this.grid.canEdit(_dae,_daf)){
this.start(_dae,_daf,this.isEditRow(_daf)||_dae.editable);
}
},_focusEditor:function(_db0,_db1){
dojox.grid.util.fire(_db0,"focus",[_db1]);
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
},start:function(_db2,_db3,_db4){
this.grid.beginUpdate();
this.editorApply();
if(this.isEditing()&&!this.isEditRow(_db3)){
this.applyRowEdit();
this.grid.updateRow(_db3);
}
if(_db4){
this.info={cell:_db2,rowIndex:_db3};
this.grid.doStartEdit(_db2,_db3);
this.grid.updateRow(_db3);
}else{
this.info={};
}
this.grid.endUpdate();
this.grid.focus.focusGrid();
this._focusEditor(_db2,_db3);
this._doCatchBoomerang();
},_editorDo:function(_db5){
var c=this.info.cell;
c&&c.editable&&c[_db5](this.info.rowIndex);
},editorApply:function(){
this._editorDo("apply");
},editorCancel:function(){
this._editorDo("cancel");
},applyCellEdit:function(_db7,_db8,_db9){
if(this.grid.canEdit(_db8,_db9)){
this.grid.doApplyCellEdit(_db7,_db9,_db8.field);
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
},save:function(_dba,_dbb){
var c=this.info.cell;
if(this.isEditRow(_dba)&&(!_dbb||c.view==_dbb)&&c.editable){
c.save(c,this.info.rowIndex);
}
},restore:function(_dbd,_dbe){
var c=this.info.cell;
if(this.isEditRow(_dbe)&&c.view==_dbd&&c.editable){
c.restore(c,this.info.rowIndex);
}
}});
}
if(!dojo._hasResource["dojox.grid.Selection"]){
dojo._hasResource["dojox.grid.Selection"]=true;
dojo.provide("dojox.grid.Selection");
dojo.declare("dojox.grid.Selection",null,{constructor:function(_dc0){
this.grid=_dc0;
this.selected=[];
this.setMode(_dc0.selectionMode);
},mode:"extended",selected:null,updating:0,selectedIndex:-1,setMode:function(mode){
if(this.selected.length){
this.deselectAll();
}
if(mode!="extended"&&mode!="multiple"&&mode!="single"&&mode!="none"){
this.mode="extended";
}else{
this.mode=mode;
}
},onCanSelect:function(_dc2){
return this.grid.onCanSelect(_dc2);
},onCanDeselect:function(_dc3){
return this.grid.onCanDeselect(_dc3);
},onSelected:function(_dc4){
},onDeselected:function(_dc5){
},onChanging:function(){
},onChanged:function(){
},isSelected:function(_dc6){
if(this.mode=="none"){
return false;
}
return this.selected[_dc6];
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
},getNextSelected:function(_dc9){
if(this.mode=="none"){
return -1;
}
for(var i=_dc9+1,l=this.selected.length;i<l;i++){
if(this.selected[i]){
return i;
}
}
return -1;
},getSelected:function(){
var _dcc=[];
for(var i=0,l=this.selected.length;i<l;i++){
if(this.selected[i]){
_dcc.push(i);
}
}
return _dcc;
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
},select:function(_dd1){
if(this.mode=="none"){
return;
}
if(this.mode!="multiple"){
this.deselectAll(_dd1);
this.addToSelection(_dd1);
}else{
this.toggleSelect(_dd1);
}
},addToSelection:function(_dd2){
if(this.mode=="none"){
return;
}
_dd2=Number(_dd2);
if(this.selected[_dd2]){
this.selectedIndex=_dd2;
}else{
if(this.onCanSelect(_dd2)!==false){
this.selectedIndex=_dd2;
this._beginUpdate();
this.selected[_dd2]=true;
this.onSelected(_dd2);
this._endUpdate();
}
}
},deselect:function(_dd3){
if(this.mode=="none"){
return;
}
_dd3=Number(_dd3);
if(this.selectedIndex==_dd3){
this.selectedIndex=-1;
}
if(this.selected[_dd3]){
if(this.onCanDeselect(_dd3)===false){
return;
}
this._beginUpdate();
delete this.selected[_dd3];
this.onDeselected(_dd3);
this._endUpdate();
}
},setSelected:function(_dd4,_dd5){
this[(_dd5?"addToSelection":"deselect")](_dd4);
},toggleSelect:function(_dd6){
this.setSelected(_dd6,!this.selected[_dd6]);
},_range:function(_dd7,inTo,func){
var s=(_dd7>=0?_dd7:inTo),e=inTo;
if(s>e){
e=s;
s=inTo;
}
for(var i=s;i<=e;i++){
func(i);
}
},selectRange:function(_ddd,inTo){
this._range(_ddd,inTo,dojo.hitch(this,"addToSelection"));
},deselectRange:function(_ddf,inTo){
this._range(_ddf,inTo,dojo.hitch(this,"deselect"));
},insert:function(_de1){
this.selected.splice(_de1,0,false);
if(this.selectedIndex>=_de1){
this.selectedIndex++;
}
},remove:function(_de2){
this.selected.splice(_de2,1);
if(this.selectedIndex>=_de2){
this.selectedIndex--;
}
},deselectAll:function(_de3){
for(var i in this.selected){
if((i!=_de3)&&(this.selected[i]===true)){
this.deselect(i);
}
}
},clickSelect:function(_de5,_de6,_de7){
if(this.mode=="none"){
return;
}
this._beginUpdate();
if(this.mode!="extended"){
this.select(_de5);
}else{
var _de8=this.selectedIndex;
if(!_de6){
this.deselectAll(_de5);
}
if(_de7){
this.selectRange(_de8,_de5);
}else{
if(_de6){
this.toggleSelect(_de5);
}else{
this.addToSelection(_de5);
}
}
}
this._endUpdate();
},clickSelectEvent:function(e){
this.clickSelect(e.rowIndex,dojo.dnd.getCopyKeyState(e),e.shiftKey);
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
},onStyleRow:function(_ded){
var i=_ded;
i.customClasses+=(i.odd?" dojoxGridRowOdd":"")+(i.selected?" dojoxGridRowSelected":"")+(i.over?" dojoxGridRowOver":"");
this.focus.styleRow(_ded);
this.edit.styleRow(_ded);
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
if(!this.edit.isEditing()){
var _df1=this.focus.getHeaderIndex();
if(_df1>=0){
this.setSortIndex(_df1);
break;
}else{
this.selection.clickSelect(this.focus.rowIndex,dojo.dnd.getCopyKeyState(e),e.shiftKey);
}
dojo.stopEvent(e);
}
if(!e.shiftKey){
var _df2=this.edit.isEditing();
this.edit.apply();
if(!_df2){
this.edit.setEditCell(this.focus.cell,this.focus.rowIndex);
}
}
if(!this.edit.isEditing()){
var _df3=this.focus.focusView||this.views.views[0];
_df3.content.decorateEvent(e);
this.onRowClick(e);
}
break;
case dk.SPACE:
if(!this.edit.isEditing()){
var _df1=this.focus.getHeaderIndex();
if(_df1>=0){
this.setSortIndex(_df1);
break;
}else{
this.selection.clickSelect(this.focus.rowIndex,dojo.dnd.getCopyKeyState(e),e.shiftKey);
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
var _df4=(e.keyCode==dk.LEFT_ARROW)?1:-1;
if(dojo._isBodyLtr()){
_df4*=-1;
}
this.focus.move(0,_df4);
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
},onCellFocus:function(_e01,_e02){
this.edit.cellFocus(_e01,_e02);
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
},onStartEdit:function(_e14,_e15){
},onApplyCellEdit:function(_e16,_e17,_e18){
},onCancelEdit:function(_e19){
},onApplyEdit:function(_e1a){
},onCanSelect:function(_e1b){
return true;
},onCanDeselect:function(_e1c){
return true;
},onSelected:function(_e1d){
this.updateRowStyles(_e1d);
},onDeselected:function(_e1e){
this.updateRowStyles(_e1e);
},onSelectionChanged:function(){
}});
}
if(!dojo._hasResource["dojox.grid._Grid"]){
dojo._hasResource["dojox.grid._Grid"]=true;
dojo.provide("dojox.grid._Grid");
(function(){
var jobs={cancel:function(_e20){
if(_e20){
clearTimeout(_e20);
}
},jobs:[],job:function(_e21,_e22,_e23){
jobs.cancelJob(_e21);
var job=function(){
delete jobs.jobs[_e21];
_e23();
};
jobs.jobs[_e21]=setTimeout(job,_e22);
},cancelJob:function(_e25){
jobs.cancel(jobs.jobs[_e25]);
}};
dojo.declare("dojox.grid._Grid",[dijit._Widget,dijit._Templated,dojox.grid._Events],{templateString:"<div class=\"dojoxGrid\" hidefocus=\"hidefocus\" wairole=\"grid\" dojoAttachEvent=\"onmouseout:_mouseOut\">\r\n\t<div class=\"dojoxGridMasterHeader\" dojoAttachPoint=\"viewsHeaderNode\" tabindex=\"-1\" wairole=\"presentation\"></div>\r\n\t<div class=\"dojoxGridMasterView\" dojoAttachPoint=\"viewsNode\" wairole=\"presentation\"></div>\r\n\t<div class=\"dojoxGridMasterMessages\" style=\"display: none;\" dojoAttachPoint=\"messagesNode\"></div>\r\n\t<span dojoAttachPoint=\"lastFocusNode\" tabindex=\"0\"></span>\r\n</div>\r\n",classTag:"dojoxGrid",get:function(_e26){
},rowCount:5,keepRows:75,rowsPerPage:25,autoWidth:false,autoHeight:"",autoRender:true,defaultHeight:"15em",height:"",structure:null,elasticView:-1,singleClickEdit:false,selectionMode:"extended",rowSelector:"",columnReordering:false,headerMenu:null,placeholderLabel:"GridColumns",selectable:false,_click:null,loadingMessage:"<span class='dojoxGridLoading'>${loadingState}</span>",errorMessage:"<span class='dojoxGridError'>${errorState}</span>",noDataMessage:"",sortInfo:0,themeable:true,_placeholders:null,buildRendering:function(){
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
var _e27=dojo.i18n.getLocalization("dijit","loading",this.lang);
this.loadingMessage=dojo.string.substitute(this.loadingMessage,_e27);
this.errorMessage=dojo.string.substitute(this.errorMessage,_e27);
if(this.srcNodeRef&&this.srcNodeRef.style.height){
this.height=this.srcNodeRef.style.height;
}
this._setAutoHeightAttr(this.autoHeight,true);
},postCreate:function(){
this.styleChanged=this._styleChanged;
this._placeholders=[];
this._setHeaderMenuAttr(this.headerMenu);
this._setStructureAttr(this.structure);
this._click=[];
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
},_setAutoHeightAttr:function(ah,_e2a){
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
this._autoHeight=(ah>=this.attr("rowCount"));
}else{
this._autoHeight=false;
}
}
if(this._started&&!_e2a){
this.render();
}
},_getRowCountAttr:function(){
return this.updating&&this.invalidated&&this.invalidated.rowCount!=undefined?this.invalidated.rowCount:this.rowCount;
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
},createView:function(_e2c,idx){
var c=dojo.getObject(_e2c);
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
},_setStructureAttr:function(_e32){
var s=_e32;
if(s&&dojo.isString(s)){
dojo.deprecated("dojox.grid._Grid.attr('structure', 'objVar')","use dojox.grid._Grid.attr('structure', objVar) instead","2.0");
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
},setStructure:function(_e34){
dojo.deprecated("dojox.grid._Grid.setStructure(obj)","use dojox.grid._Grid.attr('structure', obj) instead.","2.0");
this._setStructureAttr(_e34);
},getColumnTogglingItems:function(){
return dojo.map(this.layout.cells,function(cell){
if(!cell.menuItems){
cell.menuItems=[];
}
var self=this;
var item=new dijit.CheckedMenuItem({label:cell.name,checked:!cell.hidden,_gridCell:cell,onChange:function(_e38){
if(self.layout.setColumnVisibility(this._gridCell.index,_e38)){
var _e39=this._gridCell.menuItems;
if(_e39.length>1){
dojo.forEach(_e39,function(item){
if(item!==this){
item.setAttribute("checked",_e38);
}
},this);
}
var _e38=dojo.filter(self.layout.cells,function(c){
if(c.menuItems.length>1){
dojo.forEach(c.menuItems,"item.attr('disabled', false);");
}else{
c.menuItems[0].attr("disabled",false);
}
return !c.hidden;
});
if(_e38.length==1){
dojo.forEach(_e38[0].menuItems,"item.attr('disabled', true);");
}
}
},destroy:function(){
var _e3c=dojo.indexOf(this._gridCell.menuItems,this);
this._gridCell.menuItems.splice(_e3c,1);
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
dojo.deprecated("dojox.grid._Grid.setHeaderMenu(obj)","use dojox.grid._Grid.attr('headerMenu', obj) instead.","2.0");
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
},_fetch:function(_e41){
this.setScrollTop(0);
},getItem:function(_e42){
return null;
},showMessage:function(_e43){
if(_e43){
this.messagesNode.innerHTML=_e43;
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
},resize:function(_e44,_e45){
this._resize(_e44,_e45);
this.sizeChange();
},_getPadBorder:function(){
this._padBorder=this._padBorder||dojo._getPadBorderExtents(this.domNode);
return this._padBorder;
},_getHeaderHeight:function(){
var vns=this.viewsHeaderNode.style,t=vns.display=="none"?0:this.views.measureHeader();
vns.height=t+"px";
this.views.normalizeHeaderNodeHeight();
return t;
},_resize:function(_e48,_e49){
var pn=this.domNode.parentNode;
if(!pn||pn.nodeType!=1||!this.hasLayout()||pn.style.visibility=="hidden"||pn.style.display=="none"){
return;
}
var _e4b=this._getPadBorder();
var hh=0;
if(this._autoHeight){
this.domNode.style.height="auto";
this.viewsNode.style.height="";
}else{
if(typeof this.autoHeight=="number"){
var h=hh=this._getHeaderHeight();
h+=(this.scroller.averageRowHeight*this.autoHeight);
this.domNode.style.height=h+"px";
}else{
if(this.flex>0){
}else{
if(this.domNode.clientHeight<=_e4b.h){
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
if(_e49){
_e48=_e49;
}
if(_e48){
dojo.marginBox(this.domNode,_e48);
this.height=this.domNode.style.height;
delete this.fitTo;
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
hh=this._getHeaderHeight();
}
this.adaptWidth();
this.adaptHeight(hh);
this.postresize();
},adaptWidth:function(){
var w=this.autoWidth?0:this.domNode.clientWidth||(this.domNode.offsetWidth-this._getPadBorder().w),vw=this.views.arrange(1,w);
this.views.onEach("adaptWidth");
if(this.autoWidth){
this.domNode.style.width=vw+"px";
}
},adaptHeight:function(_e50){
var t=_e50||this._getHeaderHeight();
var h=(this._autoHeight?-1:Math.max(this.domNode.clientHeight-t,0)||0);
this.views.onEach("setSize",[0,h]);
this.views.onEach("adaptHeight");
if(!this._autoHeight){
var _e53=0,_e54=0;
var _e55=dojo.filter(this.views.views,function(v){
var has=v.hasHScrollbar();
if(has){
_e53++;
}else{
_e54++;
}
return (!has);
});
if(_e53>0&&_e54>0){
dojo.forEach(_e55,function(v){
v.adaptHeight(true);
});
}
}
if(this.autoHeight===true||h!=-1||(typeof this.autoHeight=="number"&&this.autoHeight>=this.attr("rowCount"))){
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
this.scroller.init(this.attr("rowCount"),this.keepRows,this.rowsPerPage);
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
},renderRow:function(_e5a,_e5b){
this.views.renderRow(_e5a,_e5b);
},rowRemoved:function(_e5c){
this.views.rowRemoved(_e5c);
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
var _e5f=this.scrollTop;
this.prerender();
this.scroller.invalidateNodes();
this.setScrollTop(_e5f);
this.postrender();
},update:function(){
this.render();
},updateRow:function(_e60){
_e60=Number(_e60);
if(this.updating){
this.invalidated[_e60]=true;
}else{
this.views.updateRow(_e60);
this.scroller.rowHeightChanged(_e60);
}
},updateRows:function(_e61,_e62){
_e61=Number(_e61);
_e62=Number(_e62);
if(this.updating){
for(var i=0;i<_e62;i++){
this.invalidated[i+_e61]=true;
}
}else{
for(var i=0;i<_e62;i++){
this.views.updateRow(i+_e61);
}
this.scroller.rowHeightChanged(_e61);
}
},updateRowCount:function(_e64){
if(this.updating){
this.invalidated.rowCount=_e64;
}else{
this.rowCount=_e64;
this._setAutoHeightAttr(this.autoHeight,true);
if(this.layout.cells.length){
this.scroller.updateRowCount(_e64);
}
this._resize();
if(this.layout.cells.length){
this.setScrollTop(this.scrollTop);
}
}
},updateRowStyles:function(_e65){
this.views.updateRowStyles(_e65);
},rowHeightChanged:function(_e66){
this.views.renormalizeRow(_e66);
this.scroller.rowHeightChanged(_e66);
},fastScroll:true,delayScroll:false,scrollRedrawThreshold:(dojo.isIE?100:50),scrollTo:function(_e67){
if(!this.fastScroll){
this.setScrollTop(_e67);
return;
}
var _e68=Math.abs(this.lastScrollTop-_e67);
this.lastScrollTop=_e67;
if(_e68>this.scrollRedrawThreshold||this.delayScroll){
this.delayScroll=true;
this.scrollTop=_e67;
this.views.setScrollTop(_e67);
jobs.job("dojoxGridScroll",200,dojo.hitch(this,"finishScrollJob"));
}else{
this.setScrollTop(_e67);
}
},finishScrollJob:function(){
this.delayScroll=false;
this.setScrollTop(this.scrollTop);
},setScrollTop:function(_e69){
this.scroller.scroll(this.views.setScrollTop(_e69));
},scrollToRow:function(_e6a){
this.setScrollTop(this.scroller.findScrollTop(_e6a)+1);
},styleRowNode:function(_e6b,_e6c){
if(_e6c){
this.rows.styleRowNode(_e6b,_e6c);
}
},_mouseOut:function(e){
this.rows.setOverRow(-2);
},getCell:function(_e6e){
return this.layout.cells[_e6e];
},setCellWidth:function(_e6f,_e70){
this.getCell(_e6f).unitWidth=_e70;
},getCellName:function(_e71){
return "Cell "+_e71.index;
},canSort:function(_e72){
},sort:function(){
},getSortAsc:function(_e73){
_e73=_e73==undefined?this.sortInfo:_e73;
return Boolean(_e73>0);
},getSortIndex:function(_e74){
_e74=_e74==undefined?this.sortInfo:_e74;
return Math.abs(_e74)-1;
},setSortIndex:function(_e75,_e76){
var si=_e75+1;
if(_e76!=undefined){
si*=(_e76?1:-1);
}else{
if(this.getSortIndex()==_e75){
si=-this.sortInfo;
}
}
this.setSortInfo(si);
},setSortInfo:function(_e78){
if(this.canSort(_e78)){
this.sortInfo=_e78;
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
},doStartEdit:function(_e86,_e87){
this.onStartEdit(_e86,_e87);
},doApplyCellEdit:function(_e88,_e89,_e8a){
this.onApplyCellEdit(_e88,_e89,_e8a);
},doCancelEdit:function(_e8b){
this.onCancelEdit(_e8b);
},doApplyEdit:function(_e8c){
this.onApplyEdit(_e8c);
},addRow:function(){
this.updateRowCount(this.attr("rowCount")+1);
},removeSelectedRows:function(){
this.updateRowCount(Math.max(0,this.attr("rowCount")-this.selection.getSelected().length));
this.selection.clear();
}});
dojox.grid._Grid.markupFactory=function(_e8d,node,ctor,_e90){
var d=dojo;
var _e92=function(n){
var w=d.attr(n,"width")||"auto";
if((w!="auto")&&(w.slice(-2)!="em")&&(w.slice(-1)!="%")){
w=parseInt(w)+"px";
}
return w;
};
if(!_e8d.structure&&node.nodeName.toLowerCase()=="table"){
_e8d.structure=d.query("> colgroup",node).map(function(cg){
var sv=d.attr(cg,"span");
var v={noscroll:(d.attr(cg,"noscroll")=="true")?true:false,__span:(!!sv?parseInt(sv):1),cells:[]};
if(d.hasAttr(cg,"width")){
v.width=_e92(cg);
}
return v;
});
if(!_e8d.structure.length){
_e8d.structure.push({__span:Infinity,cells:[]});
}
d.query("thead > tr",node).forEach(function(tr,_e99){
var _e9a=0;
var _e9b=0;
var _e9c;
var _e9d=null;
d.query("> th",tr).map(function(th){
if(!_e9d){
_e9c=0;
_e9d=_e8d.structure[0];
}else{
if(_e9a>=(_e9c+_e9d.__span)){
_e9b++;
_e9c+=_e9d.__span;
var _e9f=_e9d;
_e9d=_e8d.structure[_e9b];
}
}
var cell={name:d.trim(d.attr(th,"name")||th.innerHTML),colSpan:parseInt(d.attr(th,"colspan")||1,10),type:d.trim(d.attr(th,"cellType")||"")};
_e9a+=cell.colSpan;
var _ea1=d.attr(th,"rowspan");
if(_ea1){
cell.rowSpan=_ea1;
}
if(d.hasAttr(th,"width")){
cell.width=_e92(th);
}
if(d.hasAttr(th,"relWidth")){
cell.relWidth=window.parseInt(dojo.attr(th,"relWidth"),10);
}
if(d.hasAttr(th,"hidden")){
cell.hidden=d.attr(th,"hidden")=="true";
}
if(_e90){
_e90(th,cell);
}
cell.type=cell.type?dojo.getObject(cell.type):dojox.grid.cells.Cell;
if(cell.type&&cell.type.markupFactory){
cell.type.markupFactory(th,cell);
}
if(!_e9d.cells[_e99]){
_e9d.cells[_e99]=[];
}
_e9d.cells[_e99].push(cell);
});
});
}
return new ctor(_e8d,node);
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
},getNextSelected:function(_ea3){
var _ea4=this.grid.getItemIndex(_ea3);
var idx=dojox.grid.Selection.prototype.getNextSelected.call(this,_ea4);
if(idx==-1){
return null;
}
return this.grid.getItem(idx);
},getSelected:function(){
var _ea6=[];
for(var i=0,l=this.selected.length;i<l;i++){
if(this.selected[i]){
_ea6.push(this.grid.getItem(i));
}
}
return _ea6;
},addToSelection:function(_ea9){
if(this.mode=="none"){
return;
}
var idx=null;
if(typeof _ea9=="number"||typeof _ea9=="string"){
idx=_ea9;
}else{
idx=this.grid.getItemIndex(_ea9);
}
dojox.grid.Selection.prototype.addToSelection.call(this,idx);
},deselect:function(_eab){
if(this.mode=="none"){
return;
}
var idx=null;
if(typeof _eab=="number"||typeof _eab=="string"){
idx=_eab;
}else{
idx=this.grid.getItemIndex(_eab);
}
dojox.grid.Selection.prototype.deselect.call(this,idx);
},deselectAll:function(_ead){
var idx=null;
if(_ead||typeof _ead=="number"){
if(typeof _ead=="number"||typeof _ead=="string"){
idx=_ead;
}else{
idx=this.grid.getItemIndex(_ead);
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
},get:function(_eaf,_eb0){
return (!_eb0?this.defaultValue:(!this.field?this.value:this.grid.store.getValue(_eb0,this.field)));
},_onSet:function(item,_eb2,_eb3,_eb4){
var idx=this.getItemIndex(item);
if(idx>-1){
this.updateRow(idx);
}
},_addItem:function(item,_eb7,_eb8){
var idty=this._hasIdentity?this.store.getIdentity(item):dojo.toJson(this.query)+":idx:"+_eb7+":sort:"+dojo.toJson(this.getSortProps());
var o={idty:idty,item:item};
this._by_idty[idty]=this._by_idx[_eb7]=o;
if(!_eb8){
this.updateRow(_eb7);
}
},_onNew:function(item,_ebc){
var _ebd=this.attr("rowCount");
this._addingItem=true;
this.updateRowCount(_ebd+1);
this._addingItem=false;
this._addItem(item,_ebd);
this.showMessage();
},_onDelete:function(item){
var idx=this._getItemIndex(item,true);
if(idx>=0){
var o=this._by_idx[idx];
this._by_idx.splice(idx,1);
delete this._by_idty[o.idty];
this.updateRowCount(this.attr("rowCount")-1);
if(this.attr("rowCount")===0){
this.showMessage(this.noDataMessage);
}
}
},_onRevert:function(){
this._refresh();
},setStore:function(_ec1,_ec2,_ec3){
this._setQuery(_ec2,_ec3);
this._setStore(_ec1);
this._refresh(true);
},setQuery:function(_ec4,_ec5){
this._setQuery(_ec4,_ec5);
this._refresh(true);
},setItems:function(_ec6){
this.items=_ec6;
this._setStore(this.store);
this._refresh(true);
},_setQuery:function(_ec7,_ec8){
this.query=_ec7;
this.queryOptions=_ec8||this.queryOptions;
},_setStore:function(_ec9){
if(this.store&&this._store_connects){
dojo.forEach(this._store_connects,function(arr){
dojo.forEach(arr,dojo.disconnect);
});
}
this.store=_ec9;
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
this.rowCount=size;
this._setAutoHeightAttr(this.autoHeight,true);
this.prerender();
}else{
this.updateRowCount(size);
}
}
},_onFetchComplete:function(_ecf,req){
if(_ecf&&_ecf.length>0){
dojo.forEach(_ecf,function(item,idx){
this._addItem(item,req.start+idx,true);
},this);
this.updateRows(req.start,_ecf.length);
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
if(!_ecf||!_ecf.length){
this.showMessage(this.noDataMessage);
this.focus.initFocusView();
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
},_fetch:function(_ed7,_ed8){
var _ed7=_ed7||0;
if(this.store&&!this._pending_requests[_ed7]){
if(!this._isLoaded&&!this._isLoading){
this._isLoading=true;
this.showMessage(this.loadingMessage);
}
this._pending_requests[_ed7]=true;
try{
if(this.items){
var _ed9=this.items;
var _eda=this.store;
this.rowsPerPage=_ed9.length;
var req={start:_ed7,count:this.rowsPerPage,isRender:_ed8};
this._onFetchBegin(_ed9.length,req);
var _edc=0;
dojo.forEach(_ed9,function(i){
if(!_eda.isItemLoaded(i)){
_edc++;
}
});
if(_edc===0){
this._onFetchComplete(_ed9,req);
}else{
var _ede=function(item){
_edc--;
if(_edc===0){
this._onFetchComplete(_ed9,req);
}
};
dojo.forEach(_ed9,function(i){
if(!_eda.isItemLoaded(i)){
_eda.loadItem({item:i,onItem:_ede,scope:this});
}
},this);
}
}else{
this.store.fetch({start:_ed7,count:this.rowsPerPage,query:this.query,sort:this.getSortProps(),queryOptions:this.queryOptions,isRender:_ed8,onBegin:dojo.hitch(this,"_onFetchBegin"),onComplete:dojo.hitch(this,"_onFetchComplete"),onError:dojo.hitch(this,"_onFetchError")});
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
},_getItemIndex:function(item,_ee5){
if(!_ee5&&!this.store.isItem(item)){
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
},filter:function(_eea,_eeb){
this.query=_eea;
if(_eeb){
this._clearData();
}
this._fetch();
},_getItemAttr:function(idx,attr){
var item=this.getItem(idx);
return (!item?this.fetchText:this.store.getValue(item,attr));
},_render:function(){
if(this.domNode.parentNode){
this.scroller.init(this.attr("rowCount"),this.keepRows,this.rowsPerPage);
this.prerender();
this._fetch(0,true);
}
},_requestsPending:function(_eef){
return this._pending_requests[_eef];
},_rowToPage:function(_ef0){
return (this.rowsPerPage?Math.floor(_ef0/this.rowsPerPage):_ef0);
},_pageToRow:function(_ef1){
return (this.rowsPerPage?this.rowsPerPage*_ef1:_ef1);
},_preparePage:function(_ef2){
if((_ef2<this._bop||_ef2>=this._eop)&&!this._addingItem){
var _ef3=this._rowToPage(_ef2);
this._needPage(_ef3);
this._bop=_ef3*this.rowsPerPage;
this._eop=this._bop+(this.rowsPerPage||this.attr("rowCount"));
}
},_needPage:function(_ef4){
if(!this._pages[_ef4]){
this._pages[_ef4]=true;
this._requestPage(_ef4);
}
},_requestPage:function(_ef5){
var row=this._pageToRow(_ef5);
var _ef7=Math.min(this.rowsPerPage,this.attr("rowCount")-row);
if(_ef7>0){
this._requests++;
if(!this._requestsPending(row)){
setTimeout(dojo.hitch(this,"_fetch",row,false),1);
}
}
},getCellName:function(_ef8){
return _ef8.field;
},_refresh:function(_ef9){
this._clearData();
this._fetch(0,_ef9);
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
},styleRowState:function(_efd){
if(this.store&&this.store.getState){
var _efe=this.store.getState(_efd.index),c="";
for(var i=0,ss=["inflight","error","inserting"],s;s=ss[i];i++){
if(_efe[s]){
c=" dojoxGridRow-"+s;
break;
}
}
_efd.customClasses+=c;
}
},onStyleRow:function(_f03){
this.styleRowState(_f03);
this.inherited(arguments);
},canEdit:function(_f04,_f05){
return this._canEdit;
},_copyAttr:function(idx,attr){
var row={};
var _f09={};
var src=this.getItem(idx);
return this.store.getValue(src,attr);
},doStartEdit:function(_f0b,_f0c){
if(!this._cache[_f0c]){
this._cache[_f0c]=this._copyAttr(_f0c,_f0b.field);
}
this.onStartEdit(_f0b,_f0c);
},doApplyCellEdit:function(_f0d,_f0e,_f0f){
this.store.fetchItemByIdentity({identity:this._by_idx[_f0e].idty,onItem:dojo.hitch(this,function(item){
var _f11=this.store.getValue(item,_f0f);
if(typeof _f11=="number"){
_f0d=isNaN(_f0d)?_f0d:parseFloat(_f0d);
}else{
if(typeof _f11=="boolean"){
_f0d=_f0d=="true"?true:_f0d=="false"?false:_f0d;
}else{
if(_f11 instanceof Date){
var _f12=new Date(_f0d);
_f0d=isNaN(_f12.getTime())?_f0d:_f12;
}
}
}
this.store.setValue(item,_f0f,_f0d);
this.onApplyCellEdit(_f0d,_f0e,_f0f);
})});
},doCancelEdit:function(_f13){
var _f14=this._cache[_f13];
if(_f14){
this.updateRow(_f13);
delete this._cache[_f13];
}
this.onCancelEdit.apply(this,arguments);
},doApplyEdit:function(_f15,_f16){
var _f17=this._cache[_f15];
this.onApplyEdit(_f15);
},removeSelectedRows:function(){
if(this._canEdit){
this.edit.apply();
var _f18=this.selection.getSelected();
if(_f18.length){
dojo.forEach(_f18,this.store.deleteItem,this.store);
this.selection.clear();
}
}
}});
dojox.grid.DataGrid.markupFactory=function(_f19,node,ctor,_f1c){
return dojox.grid._Grid.markupFactory(_f19,node,ctor,function(node,_f1e){
var _f1f=dojo.trim(dojo.attr(node,"field")||"");
if(_f1f){
_f1e.field=_f1f;
}
_f1e.field=_f1e.field||_f1e.name;
if(_f1c){
_f1c(node,_f1e);
}
});
};
}
if(!dojo._hasResource["dojo.cldr.supplemental"]){
dojo._hasResource["dojo.cldr.supplemental"]=true;
dojo.provide("dojo.cldr.supplemental");
dojo.cldr.supplemental.getFirstDayOfWeek=function(_f20){
var _f21={mv:5,ae:6,af:6,bh:6,dj:6,dz:6,eg:6,er:6,et:6,iq:6,ir:6,jo:6,ke:6,kw:6,lb:6,ly:6,ma:6,om:6,qa:6,sa:6,sd:6,so:6,tn:6,ye:6,as:0,au:0,az:0,bw:0,ca:0,cn:0,fo:0,ge:0,gl:0,gu:0,hk:0,ie:0,il:0,is:0,jm:0,jp:0,kg:0,kr:0,la:0,mh:0,mo:0,mp:0,mt:0,nz:0,ph:0,pk:0,sg:0,th:0,tt:0,tw:0,um:0,us:0,uz:0,vi:0,za:0,zw:0,et:0,mw:0,ng:0,tj:0,sy:4};
var _f22=dojo.cldr.supplemental._region(_f20);
var dow=_f21[_f22];
return (dow===undefined)?1:dow;
};
dojo.cldr.supplemental._region=function(_f24){
_f24=dojo.i18n.normalizeLocale(_f24);
var tags=_f24.split("-");
var _f26=tags[1];
if(!_f26){
_f26={de:"de",en:"us",es:"es",fi:"fi",fr:"fr",he:"il",hu:"hu",it:"it",ja:"jp",ko:"kr",nl:"nl",pt:"br",sv:"se",zh:"cn"}[tags[0]];
}else{
if(_f26.length==4){
_f26=tags[2];
}
}
return _f26;
};
dojo.cldr.supplemental.getWeekend=function(_f27){
var _f28={eg:5,il:5,sy:5,"in":0,ae:4,bh:4,dz:4,iq:4,jo:4,kw:4,lb:4,ly:4,ma:4,om:4,qa:4,sa:4,sd:4,tn:4,ye:4};
var _f29={ae:5,bh:5,dz:5,iq:5,jo:5,kw:5,lb:5,ly:5,ma:5,om:5,qa:5,sa:5,sd:5,tn:5,ye:5,af:5,ir:5,eg:6,il:6,sy:6};
var _f2a=dojo.cldr.supplemental._region(_f27);
var _f2b=_f28[_f2a];
var end=_f29[_f2a];
if(_f2b===undefined){
_f2b=6;
}
if(end===undefined){
end=0;
}
return {start:_f2b,end:end};
};
}
if(!dojo._hasResource["dojo.date"]){
dojo._hasResource["dojo.date"]=true;
dojo.provide("dojo.date");
dojo.date.getDaysInMonth=function(_f2d){
var _f2e=_f2d.getMonth();
var days=[31,28,31,30,31,30,31,31,30,31,30,31];
if(_f2e==1&&dojo.date.isLeapYear(_f2d)){
return 29;
}
return days[_f2e];
};
dojo.date.isLeapYear=function(_f30){
var year=_f30.getFullYear();
return !(year%400)||(!(year%4)&&!!(year%100));
};
dojo.date.getTimezoneName=function(_f32){
var str=_f32.toString();
var tz="";
var _f35;
var pos=str.indexOf("(");
if(pos>-1){
tz=str.substring(++pos,str.indexOf(")"));
}else{
var pat=/([A-Z\/]+) \d{4}$/;
if((_f35=str.match(pat))){
tz=_f35[1];
}else{
str=_f32.toLocaleString();
pat=/ ([A-Z\/]+)$/;
if((_f35=str.match(pat))){
tz=_f35[1];
}
}
}
return (tz=="AM"||tz=="PM")?"":tz;
};
dojo.date.compare=function(_f38,_f39,_f3a){
_f38=new Date(Number(_f38));
_f39=new Date(Number(_f39||new Date()));
if(_f3a!=="undefined"){
if(_f3a=="date"){
_f38.setHours(0,0,0,0);
_f39.setHours(0,0,0,0);
}else{
if(_f3a=="time"){
_f38.setFullYear(0,0,0);
_f39.setFullYear(0,0,0);
}
}
}
if(_f38>_f39){
return 1;
}
if(_f38<_f39){
return -1;
}
return 0;
};
dojo.date.add=function(date,_f3c,_f3d){
var sum=new Date(Number(date));
var _f3f=false;
var _f40="Date";
switch(_f3c){
case "day":
break;
case "weekday":
var days,_f42;
var mod=_f3d%5;
if(!mod){
days=(_f3d>0)?5:-5;
_f42=(_f3d>0)?((_f3d-5)/5):((_f3d+5)/5);
}else{
days=mod;
_f42=parseInt(_f3d/5);
}
var strt=date.getDay();
var adj=0;
if(strt==6&&_f3d>0){
adj=1;
}else{
if(strt==0&&_f3d<0){
adj=-1;
}
}
var trgt=strt+days;
if(trgt==0||trgt==6){
adj=(_f3d>0)?2:-2;
}
_f3d=(7*_f42)+days+adj;
break;
case "year":
_f40="FullYear";
_f3f=true;
break;
case "week":
_f3d*=7;
break;
case "quarter":
_f3d*=3;
case "month":
_f3f=true;
_f40="Month";
break;
case "hour":
case "minute":
case "second":
case "millisecond":
_f40="UTC"+_f3c.charAt(0).toUpperCase()+_f3c.substring(1)+"s";
}
if(_f40){
sum["set"+_f40](sum["get"+_f40]()+_f3d);
}
if(_f3f&&(sum.getDate()<date.getDate())){
sum.setDate(0);
}
return sum;
};
dojo.date.difference=function(_f47,_f48,_f49){
_f48=_f48||new Date();
_f49=_f49||"day";
var _f4a=_f48.getFullYear()-_f47.getFullYear();
var _f4b=1;
switch(_f49){
case "quarter":
var m1=_f47.getMonth();
var m2=_f48.getMonth();
var q1=Math.floor(m1/3)+1;
var q2=Math.floor(m2/3)+1;
q2+=(_f4a*4);
_f4b=q2-q1;
break;
case "weekday":
var days=Math.round(dojo.date.difference(_f47,_f48,"day"));
var _f51=parseInt(dojo.date.difference(_f47,_f48,"week"));
var mod=days%7;
if(mod==0){
days=_f51*5;
}else{
var adj=0;
var aDay=_f47.getDay();
var bDay=_f48.getDay();
_f51=parseInt(days/7);
mod=days%7;
var _f56=new Date(_f47);
_f56.setDate(_f56.getDate()+(_f51*7));
var _f57=_f56.getDay();
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
case (_f57+mod)>5:
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
case (_f57+mod)<0:
adj=2;
}
}
}
days+=adj;
days-=(_f51*2);
}
_f4b=days;
break;
case "year":
_f4b=_f4a;
break;
case "month":
_f4b=(_f48.getMonth()-_f47.getMonth())+(_f4a*12);
break;
case "week":
_f4b=parseInt(dojo.date.difference(_f47,_f48,"day")/7);
break;
case "day":
_f4b/=24;
case "hour":
_f4b/=60;
case "minute":
_f4b/=60;
case "second":
_f4b/=1000;
case "millisecond":
_f4b*=_f48.getTime()-_f47.getTime();
}
return Math.round(_f4b);
};
}
if(!dojo._hasResource["dojo.date.locale"]){
dojo._hasResource["dojo.date.locale"]=true;
dojo.provide("dojo.date.locale");
(function(){
function _f58(_f59,_f5a,_f5b,_f5c){
return _f5c.replace(/([a-z])\1*/ig,function(_f5d){
var s,pad;
var c=_f5d.charAt(0);
var l=_f5d.length;
var _f62=["abbr","wide","narrow"];
switch(c){
case "G":
s=_f5a[(l<4)?"eraAbbr":"eraNames"][_f59.getFullYear()<0?0:1];
break;
case "y":
s=_f59.getFullYear();
switch(l){
case 1:
break;
case 2:
if(!_f5b){
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
s=Math.ceil((_f59.getMonth()+1)/3);
pad=true;
break;
case "M":
var m=_f59.getMonth();
if(l<3){
s=m+1;
pad=true;
}else{
var _f64=["months","format",_f62[l-3]].join("-");
s=_f5a[_f64][m];
}
break;
case "w":
var _f65=0;
s=dojo.date.locale._getWeekOfYear(_f59,_f65);
pad=true;
break;
case "d":
s=_f59.getDate();
pad=true;
break;
case "D":
s=dojo.date.locale._getDayOfYear(_f59);
pad=true;
break;
case "E":
var d=_f59.getDay();
if(l<3){
s=d+1;
pad=true;
}else{
var _f67=["days","format",_f62[l-3]].join("-");
s=_f5a[_f67][d];
}
break;
case "a":
var _f68=(_f59.getHours()<12)?"am":"pm";
s=_f5a[_f68];
break;
case "h":
case "H":
case "K":
case "k":
var h=_f59.getHours();
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
s=_f59.getMinutes();
pad=true;
break;
case "s":
s=_f59.getSeconds();
pad=true;
break;
case "S":
s=Math.round(_f59.getMilliseconds()*Math.pow(10,l-3));
pad=true;
break;
case "v":
case "z":
s=dojo.date.getTimezoneName(_f59);
if(s){
break;
}
l=4;
case "Z":
var _f6a=_f59.getTimezoneOffset();
var tz=[(_f6a<=0?"+":"-"),dojo.string.pad(Math.floor(Math.abs(_f6a)/60),2),dojo.string.pad(Math.abs(_f6a)%60,2)];
if(l==4){
tz.splice(0,0,"GMT");
tz.splice(3,0,":");
}
s=tz.join("");
break;
default:
throw new Error("dojo.date.locale.format: invalid pattern char: "+_f5c);
}
if(pad){
s=dojo.string.pad(s,l);
}
return s;
});
};
dojo.date.locale.format=function(_f6c,_f6d){
_f6d=_f6d||{};
var _f6e=dojo.i18n.normalizeLocale(_f6d.locale);
var _f6f=_f6d.formatLength||"short";
var _f70=dojo.date.locale._getGregorianBundle(_f6e);
var str=[];
var _f72=dojo.hitch(this,_f58,_f6c,_f70,_f6d.fullYear);
if(_f6d.selector=="year"){
var year=_f6c.getFullYear();
if(_f6e.match(/^zh|^ja/)){
year+="年";
}
return year;
}
if(_f6d.selector!="time"){
var _f74=_f6d.datePattern||_f70["dateFormat-"+_f6f];
if(_f74){
str.push(_f75(_f74,_f72));
}
}
if(_f6d.selector!="date"){
var _f76=_f6d.timePattern||_f70["timeFormat-"+_f6f];
if(_f76){
str.push(_f75(_f76,_f72));
}
}
var _f77=str.join(" ");
return _f77;
};
dojo.date.locale.regexp=function(_f78){
return dojo.date.locale._parseInfo(_f78).regexp;
};
dojo.date.locale._parseInfo=function(_f79){
_f79=_f79||{};
var _f7a=dojo.i18n.normalizeLocale(_f79.locale);
var _f7b=dojo.date.locale._getGregorianBundle(_f7a);
var _f7c=_f79.formatLength||"short";
var _f7d=_f79.datePattern||_f7b["dateFormat-"+_f7c];
var _f7e=_f79.timePattern||_f7b["timeFormat-"+_f7c];
var _f7f;
if(_f79.selector=="date"){
_f7f=_f7d;
}else{
if(_f79.selector=="time"){
_f7f=_f7e;
}else{
_f7f=_f7d+" "+_f7e;
}
}
var _f80=[];
var re=_f75(_f7f,dojo.hitch(this,_f82,_f80,_f7b,_f79));
return {regexp:re,tokens:_f80,bundle:_f7b};
};
dojo.date.locale.parse=function(_f83,_f84){
var info=dojo.date.locale._parseInfo(_f84);
var _f86=info.tokens,_f87=info.bundle;
var re=new RegExp("^"+info.regexp+"$",info.strict?"":"i");
var _f89=re.exec(_f83);
if(!_f89){
return null;
}
var _f8a=["abbr","wide","narrow"];
var _f8b=[1970,0,1,0,0,0,0];
var amPm="";
var _f8d=dojo.every(_f89,function(v,i){
if(!i){
return true;
}
var _f90=_f86[i-1];
var l=_f90.length;
switch(_f90.charAt(0)){
case "y":
if(l!=2&&_f84.strict){
_f8b[0]=v;
}else{
if(v<100){
v=Number(v);
var year=""+new Date().getFullYear();
var _f93=year.substring(0,2)*100;
var _f94=Math.min(Number(year.substring(2,4))+20,99);
var num=(v<_f94)?_f93+v:_f93-100+v;
_f8b[0]=num;
}else{
if(_f84.strict){
return false;
}
_f8b[0]=v;
}
}
break;
case "M":
if(l>2){
var _f96=_f87["months-format-"+_f8a[l-3]].concat();
if(!_f84.strict){
v=v.replace(".","").toLowerCase();
_f96=dojo.map(_f96,function(s){
return s.replace(".","").toLowerCase();
});
}
v=dojo.indexOf(_f96,v);
if(v==-1){
return false;
}
}else{
v--;
}
_f8b[1]=v;
break;
case "E":
case "e":
var days=_f87["days-format-"+_f8a[l-3]].concat();
if(!_f84.strict){
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
_f8b[1]=0;
case "d":
_f8b[2]=v;
break;
case "a":
var am=_f84.am||_f87.am;
var pm=_f84.pm||_f87.pm;
if(!_f84.strict){
var _f9c=/\./g;
v=v.replace(_f9c,"").toLowerCase();
am=am.replace(_f9c,"").toLowerCase();
pm=pm.replace(_f9c,"").toLowerCase();
}
if(_f84.strict&&v!=am&&v!=pm){
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
_f8b[3]=v;
break;
case "m":
_f8b[4]=v;
break;
case "s":
_f8b[5]=v;
break;
case "S":
_f8b[6]=v;
}
return true;
});
var _f9d=+_f8b[3];
if(amPm==="p"&&_f9d<12){
_f8b[3]=_f9d+12;
}else{
if(amPm==="a"&&_f9d==12){
_f8b[3]=0;
}
}
var _f9e=new Date(_f8b[0],_f8b[1],_f8b[2],_f8b[3],_f8b[4],_f8b[5],_f8b[6]);
if(_f84.strict){
_f9e.setFullYear(_f8b[0]);
}
var _f9f=_f86.join(""),_fa0=_f9f.indexOf("d")!=-1,_fa1=_f9f.indexOf("M")!=-1;
if(!_f8d||(_fa1&&_f9e.getMonth()>_f8b[1])||(_fa0&&_f9e.getDate()>_f8b[2])){
return null;
}
if((_fa1&&_f9e.getMonth()<_f8b[1])||(_fa0&&_f9e.getDate()<_f8b[2])){
_f9e=dojo.date.add(_f9e,"hour",1);
}
return _f9e;
};
function _f75(_fa2,_fa3,_fa4,_fa5){
var _fa6=function(x){
return x;
};
_fa3=_fa3||_fa6;
_fa4=_fa4||_fa6;
_fa5=_fa5||_fa6;
var _fa8=_fa2.match(/(''|[^'])+/g);
var _fa9=_fa2.charAt(0)=="'";
dojo.forEach(_fa8,function(_faa,i){
if(!_faa){
_fa8[i]="";
}else{
_fa8[i]=(_fa9?_fa4:_fa3)(_faa);
_fa9=!_fa9;
}
});
return _fa5(_fa8.join(""));
};
function _f82(_fac,_fad,_fae,_faf){
_faf=dojo.regexp.escapeString(_faf);
if(!_fae.strict){
_faf=_faf.replace(" a"," ?a");
}
return _faf.replace(/([a-z])\1*/ig,function(_fb0){
var s;
var c=_fb0.charAt(0);
var l=_fb0.length;
var p2="",p3="";
if(_fae.strict){
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
var am=_fae.am||_fad.am||"AM";
var pm=_fae.pm||_fad.pm||"PM";
if(_fae.strict){
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
if(_fac){
_fac.push(_fb0);
}
return "("+s+")";
}).replace(/[\xa0 ]/g,"[\\s\\xa0]");
};
})();
(function(){
var _fb8=[];
dojo.date.locale.addCustomFormats=function(_fb9,_fba){
_fb8.push({pkg:_fb9,name:_fba});
};
dojo.date.locale._getGregorianBundle=function(_fbb){
var _fbc={};
dojo.forEach(_fb8,function(desc){
var _fbe=dojo.i18n.getLocalization(desc.pkg,desc.name,_fbb);
_fbc=dojo.mixin(_fbc,_fbe);
},this);
return _fbc;
};
})();
dojo.date.locale.addCustomFormats("dojo.cldr","gregorian");
dojo.date.locale.getNames=function(item,type,_fc1,_fc2){
var _fc3;
var _fc4=dojo.date.locale._getGregorianBundle(_fc2);
var _fc5=[item,_fc1,type];
if(_fc1=="standAlone"){
var key=_fc5.join("-");
_fc3=_fc4[key];
if(_fc3[0]==1){
_fc3=undefined;
}
}
_fc5[1]="format";
return (_fc3||_fc4[_fc5.join("-")]).concat();
};
dojo.date.locale.isWeekend=function(_fc7,_fc8){
var _fc9=dojo.cldr.supplemental.getWeekend(_fc8);
var day=(_fc7||new Date()).getDay();
if(_fc9.end<_fc9.start){
_fc9.end+=7;
if(day<_fc9.start){
day+=7;
}
}
return day>=_fc9.start&&day<=_fc9.end;
};
dojo.date.locale._getDayOfYear=function(_fcb){
return dojo.date.difference(new Date(_fcb.getFullYear(),0,1,_fcb.getHours()),_fcb)+1;
};
dojo.date.locale._getWeekOfYear=function(_fcc,_fcd){
if(arguments.length==1){
_fcd=0;
}
var _fce=new Date(_fcc.getFullYear(),0,1).getDay();
var adj=(_fce-_fcd+7)%7;
var week=Math.floor((dojo.date.locale._getDayOfYear(_fcc)+adj-1)/7);
if(_fce==_fcd){
week++;
}
return week;
};
}
if(!dojo._hasResource["dijit._Calendar"]){
dojo._hasResource["dijit._Calendar"]=true;
dojo.provide("dijit._Calendar");
dojo.declare("dijit._Calendar",[dijit._Widget,dijit._Templated],{templateString:"<table cellspacing=\"0\" cellpadding=\"0\" class=\"dijitCalendarContainer\">\r\n\t<thead>\r\n\t\t<tr class=\"dijitReset dijitCalendarMonthContainer\" valign=\"top\">\r\n\t\t\t<th class='dijitReset' dojoAttachPoint=\"decrementMonth\">\r\n\t\t\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitCalendarIncrementControl dijitCalendarDecrease\" waiRole=\"presentation\">\r\n\t\t\t\t<span dojoAttachPoint=\"decreaseArrowNode\" class=\"dijitA11ySideArrow\">-</span>\r\n\t\t\t</th>\r\n\t\t\t<th class='dijitReset' colspan=\"5\">\r\n\t\t\t\t<div dojoAttachPoint=\"monthLabelSpacer\" class=\"dijitCalendarMonthLabelSpacer\"></div>\r\n\t\t\t\t<div dojoAttachPoint=\"monthLabelNode\" class=\"dijitCalendarMonthLabel\"></div>\r\n\t\t\t</th>\r\n\t\t\t<th class='dijitReset' dojoAttachPoint=\"incrementMonth\">\r\n\t\t\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitCalendarIncrementControl dijitCalendarIncrease\" waiRole=\"presentation\">\r\n\t\t\t\t<span dojoAttachPoint=\"increaseArrowNode\" class=\"dijitA11ySideArrow\">+</span>\r\n\t\t\t</th>\r\n\t\t</tr>\r\n\t\t<tr>\r\n\t\t\t<th class=\"dijitReset dijitCalendarDayLabelTemplate\"><span class=\"dijitCalendarDayLabel\"></span></th>\r\n\t\t</tr>\r\n\t</thead>\r\n\t<tbody dojoAttachEvent=\"onclick: _onDayClick, onmouseover: _onDayMouseOver, onmouseout: _onDayMouseOut\" class=\"dijitReset dijitCalendarBodyContainer\">\r\n\t\t<tr class=\"dijitReset dijitCalendarWeekTemplate\">\r\n\t\t\t<td class=\"dijitReset dijitCalendarDateTemplate\"><span class=\"dijitCalendarDateLabel\"></span></td>\r\n\t\t</tr>\r\n\t</tbody>\r\n\t<tfoot class=\"dijitReset dijitCalendarYearContainer\">\r\n\t\t<tr>\r\n\t\t\t<td class='dijitReset' valign=\"top\" colspan=\"7\">\r\n\t\t\t\t<h3 class=\"dijitCalendarYearLabel\">\r\n\t\t\t\t\t<span dojoAttachPoint=\"previousYearLabelNode\" class=\"dijitInline dijitCalendarPreviousYear\"></span>\r\n\t\t\t\t\t<span dojoAttachPoint=\"currentYearLabelNode\" class=\"dijitInline dijitCalendarSelectedYear\"></span>\r\n\t\t\t\t\t<span dojoAttachPoint=\"nextYearLabelNode\" class=\"dijitInline dijitCalendarNextYear\"></span>\r\n\t\t\t\t</h3>\r\n\t\t\t</td>\r\n\t\t</tr>\r\n\t</tfoot>\r\n</table>\t\r\n",value:new Date(),dayWidth:"narrow",setValue:function(_fd1){
dojo.deprecated("dijit.Calendar:setValue() is deprecated.  Use attr('value', ...) instead.","","2.0");
this.attr("value",_fd1);
},_getValueAttr:function(_fd2){
var _fd2=new Date(this.value);
_fd2.setHours(0,0,0,0);
if(_fd2.getDate()<this.value.getDate()){
_fd2=dojo.date.add(_fd2,"hour",1);
}
return _fd2;
},_setValueAttr:function(_fd3){
if(!this.value||dojo.date.compare(_fd3,this.value)){
_fd3=new Date(_fd3);
_fd3.setHours(1);
this.displayMonth=new Date(_fd3);
if(!this.isDisabledDate(_fd3,this.lang)){
this.value=_fd3;
this.onChange(this.attr("value"));
}
this._populateGrid();
}
},_setText:function(node,text){
while(node.firstChild){
node.removeChild(node.firstChild);
}
node.appendChild(dojo.doc.createTextNode(text));
},_populateGrid:function(){
var _fd6=this.displayMonth;
_fd6.setDate(1);
var _fd7=_fd6.getDay();
var _fd8=dojo.date.getDaysInMonth(_fd6);
var _fd9=dojo.date.getDaysInMonth(dojo.date.add(_fd6,"month",-1));
var _fda=new Date();
var _fdb=this.value;
var _fdc=dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
if(_fdc>_fd7){
_fdc-=7;
}
dojo.query(".dijitCalendarDateTemplate",this.domNode).forEach(function(_fdd,i){
i+=_fdc;
var date=new Date(_fd6);
var _fe0,_fe1="dijitCalendar",adj=0;
if(i<_fd7){
_fe0=_fd9-_fd7+i+1;
adj=-1;
_fe1+="Previous";
}else{
if(i>=(_fd7+_fd8)){
_fe0=i-_fd7-_fd8+1;
adj=1;
_fe1+="Next";
}else{
_fe0=i-_fd7+1;
_fe1+="Current";
}
}
if(adj){
date=dojo.date.add(date,"month",adj);
}
date.setDate(_fe0);
if(!dojo.date.compare(date,_fda,"date")){
_fe1="dijitCalendarCurrentDate "+_fe1;
}
if(!dojo.date.compare(date,_fdb,"date")){
_fe1="dijitCalendarSelectedDate "+_fe1;
}
if(this.isDisabledDate(date,this.lang)){
_fe1="dijitCalendarDisabledDate "+_fe1;
}
var _fe3=this.getClassForDate(date,this.lang);
if(_fe3){
_fe1=_fe3+" "+_fe1;
}
_fdd.className=_fe1+"Month dijitCalendarDateTemplate";
_fdd.dijitDateValue=date.valueOf();
var _fe4=dojo.query(".dijitCalendarDateLabel",_fdd)[0];
this._setText(_fe4,date.getDate());
},this);
var _fe5=dojo.date.locale.getNames("months","wide","standAlone",this.lang);
this._setText(this.monthLabelNode,_fe5[_fd6.getMonth()]);
var y=_fd6.getFullYear()-1;
var d=new Date();
dojo.forEach(["previous","current","next"],function(name){
d.setFullYear(y++);
this._setText(this[name+"YearLabelNode"],dojo.date.locale.format(d,{selector:"year",locale:this.lang}));
},this);
var _fe9=this;
var _fea=function(_feb,_fec,adj){
_fe9._connects.push(dijit.typematic.addMouseListener(_fe9[_feb],_fe9,function(_fee){
if(_fee>=0){
_fe9._adjustDisplay(_fec,adj);
}
},0.8,500));
};
_fea("incrementMonth","month",1);
_fea("decrementMonth","month",-1);
_fea("nextYearLabelNode","year",1);
_fea("previousYearLabelNode","year",-1);
},goToToday:function(){
this.attr("value",new Date());
},postCreate:function(){
this.inherited(arguments);
dojo.setSelectable(this.domNode,false);
var _fef=dojo.hitch(this,function(_ff0,n){
var _ff2=dojo.query(_ff0,this.domNode)[0];
for(var i=0;i<n;i++){
_ff2.parentNode.appendChild(_ff2.cloneNode(true));
}
});
_fef(".dijitCalendarDayLabelTemplate",6);
_fef(".dijitCalendarDateTemplate",6);
_fef(".dijitCalendarWeekTemplate",5);
var _ff4=dojo.date.locale.getNames("days",this.dayWidth,"standAlone",this.lang);
var _ff5=dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
dojo.query(".dijitCalendarDayLabel",this.domNode).forEach(function(_ff6,i){
this._setText(_ff6,_ff4[(i+_ff5)%7]);
},this);
var _ff8=dojo.date.locale.getNames("months","wide","standAlone",this.lang);
dojo.forEach(_ff8,function(name){
var _ffa=dojo.create("div",null,this.monthLabelSpacer);
this._setText(_ffa,name);
},this);
this.value=null;
this.attr("value",new Date());
},_adjustDisplay:function(part,_ffc){
this.displayMonth=dojo.date.add(this.displayMonth,part,_ffc);
this._populateGrid();
},_onDayClick:function(evt){
dojo.stopEvent(evt);
for(var node=evt.target;node&&!node.dijitDateValue;node=node.parentNode){
}
if(node&&!dojo.hasClass(node,"dijitCalendarDisabledDate")){
this.attr("value",node.dijitDateValue);
this.onValueSelected(this.attr("value"));
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
},isDisabledDate:function(_1005,_1006){
},getClassForDate:function(_1007,_1008){
}});
}
if(!dojo._hasResource["dijit.form._DateTimeTextBox"]){
dojo._hasResource["dijit.form._DateTimeTextBox"]=true;
dojo.provide("dijit.form._DateTimeTextBox");
dojo.declare("dijit.form._DateTimeTextBox",dijit.form.RangeBoundTextBox,{regExpGen:dojo.date.locale.regexp,compare:dojo.date.compare,format:function(value,_100a){
if(!value){
return "";
}
return dojo.date.locale.format(value,_100a);
},parse:function(value,_100c){
return dojo.date.locale.parse(value,_100c)||(this._isEmpty(value)?null:undefined);
},serialize:dojo.date.stamp.toISOString,value:new Date(""),_blankValue:null,popupClass:"",_selector:"",postMixInProperties:function(){
this.inherited(arguments);
if(!this.value||this.value.toString()==dijit.form._DateTimeTextBox.prototype.value.toString()){
this.value=null;
}
var _100d=this.constraints;
_100d.selector=this._selector;
_100d.fullYear=true;
var _100e=dojo.date.stamp.fromISOString;
if(typeof _100d.min=="string"){
_100d.min=_100e(_100d.min);
}
if(typeof _100d.max=="string"){
_100d.max=_100e(_100d.max);
}
},_onFocus:function(evt){
this._open();
},_setValueAttr:function(value,_1011,_1012){
this.inherited(arguments);
if(this._picker){
if(!value){
value=new Date();
}
this._picker.attr("value",value);
}
},_open:function(){
if(this.disabled||this.readOnly||!this.popupClass){
return;
}
var _1013=this;
if(!this._picker){
var _1014=dojo.getObject(this.popupClass,false);
this._picker=new _1014({onValueSelected:function(value){
if(_1013._tabbingAway){
delete _1013._tabbingAway;
}else{
_1013.focus();
}
setTimeout(dojo.hitch(_1013,"_close"),1);
dijit.form._DateTimeTextBox.superclass._setValueAttr.call(_1013,value,true);
},lang:_1013.lang,constraints:_1013.constraints,isDisabledDate:function(date){
var _1017=dojo.date.compare;
var _1018=_1013.constraints;
return _1018&&(_1018.min&&(_1017(_1018.min,date,"date")>0)||(_1018.max&&_1017(_1018.max,date,"date")<0));
}});
this._picker.attr("value",this.attr("value")||new Date());
}
if(!this._opened){
dijit.popup.open({parent:this,popup:this._picker,around:this.domNode,onCancel:dojo.hitch(this,this._close),onClose:function(){
_1013._opened=false;
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
},_setDisplayedValueAttr:function(value,_101a){
this._setValueAttr(this.parse(value,this.constraints),_101a,value);
},destroy:function(){
if(this._picker){
this._picker.destroy();
delete this._picker;
}
this.inherited(arguments);
},postCreate:function(){
this.inherited(arguments);
this.connect(this.focusNode,"onkeypress",this._onKeyPress);
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
}});
}
if(!dojo._hasResource["dijit.form.DateTextBox"]){
dojo._hasResource["dijit.form.DateTextBox"]=true;
dojo.provide("dijit.form.DateTextBox");
dojo.declare("dijit.form.DateTextBox",dijit.form._DateTimeTextBox,{baseClass:"dijitTextBox dijitDateTextBox",popupClass:"dijit._Calendar",_selector:"date",value:new Date("")});
}
if(!dojo._hasResource["dijit._TimePicker"]){
dojo._hasResource["dijit._TimePicker"]=true;
dojo.provide("dijit._TimePicker");
dojo.declare("dijit._TimePicker",[dijit._Widget,dijit._Templated],{templateString:"<div id=\"widget_${id}\" class=\"dijitMenu ${baseClass}\"\r\n    ><div dojoAttachPoint=\"upArrow\" class=\"dijitButtonNode dijitUpArrowButton\" dojoAttachEvent=\"onmouseenter:_buttonMouse,onmouseleave:_buttonMouse\"\r\n\t\t><div class=\"dijitReset dijitInline dijitArrowButtonInner\" wairole=\"presentation\" role=\"presentation\">&nbsp;</div\r\n\t\t><div class=\"dijitArrowButtonChar\">&#9650;</div></div\r\n    ><div dojoAttachPoint=\"timeMenu,focusNode\" dojoAttachEvent=\"onclick:_onOptionSelected,onmouseover,onmouseout\"></div\r\n    ><div dojoAttachPoint=\"downArrow\" class=\"dijitButtonNode dijitDownArrowButton\" dojoAttachEvent=\"onmouseenter:_buttonMouse,onmouseleave:_buttonMouse\"\r\n\t\t><div class=\"dijitReset dijitInline dijitArrowButtonInner\" wairole=\"presentation\" role=\"presentation\">&nbsp;</div\r\n\t\t><div class=\"dijitArrowButtonChar\">&#9660;</div></div\r\n></div>\r\n",baseClass:"dijitTimePicker",clickableIncrement:"T00:15:00",visibleIncrement:"T01:00:00",visibleRange:"T05:00:00",value:new Date(),_visibleIncrement:2,_clickableIncrement:1,_totalIncrements:10,constraints:{},serialize:dojo.date.stamp.toISOString,_filterString:"",setValue:function(value){
dojo.deprecated("dijit._TimePicker:setValue() is deprecated.  Use attr('value') instead.","","2.0");
this.attr("value",value);
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
},isDisabledDate:function(_1023,_1024){
return false;
},_getFilteredNodes:function(start,_1026,_1027){
var nodes=[],n,i=start,max=this._maxIncrement+Math.abs(i),chk=_1027?-1:1,dec=_1027?1:0,inc=_1027?0:1;
do{
i=i-dec;
n=this._createOption(i);
if(n){
nodes.push(n);
}
i=i+inc;
}while(nodes.length<_1026&&(i*chk)<max);
if(_1027){
nodes.reverse();
}
return nodes;
},_showText:function(){
this.timeMenu.innerHTML="";
var _102f=dojo.date.stamp.fromISOString;
this._clickableIncrementDate=_102f(this.clickableIncrement);
this._visibleIncrementDate=_102f(this.visibleIncrement);
this._visibleRangeDate=_102f(this.visibleRange);
var _1030=function(date){
return date.getHours()*60*60+date.getMinutes()*60+date.getSeconds();
};
var _1032=_1030(this._clickableIncrementDate);
var _1033=_1030(this._visibleIncrementDate);
var _1034=_1030(this._visibleRangeDate);
var time=this.value.getTime();
this._refDate=new Date(time-time%(_1033*1000));
this._refDate.setFullYear(1970,0,1);
this._clickableIncrement=1;
this._totalIncrements=_1034/_1032;
this._visibleIncrement=_1033/_1032;
this._maxIncrement=(60*60*24)/_1032;
var _1036=this._getFilteredNodes(0,this._totalIncrements>>1,true);
var after=this._getFilteredNodes(0,this._totalIncrements>>1,false);
if(_1036.length<this._totalIncrements>>1){
_1036=_1036.slice(_1036.length/2);
after=after.slice(0,after.length/2);
}
dojo.forEach(_1036.concat(after),function(n){
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
var _this=this;
var _103a=function(){
_this._connects.push(dijit.typematic.addMouseListener.apply(null,arguments));
};
_103a(this.upArrow,this,this._onArrowUp,1,50);
_103a(this.downArrow,this,this._onArrowDown,1,50);
var _103b=function(cb){
return function(cnt){
if(cnt>0){
cb.call(this,arguments);
}
};
};
var _103e=function(node,cb){
return function(e){
dojo.stopEvent(e);
dijit.typematic.trigger(e,this,node,_103b(cb),node,1,50);
};
};
this.connect(this.upArrow,"onmouseover",_103e(this.upArrow,this._onArrowUp));
this.connect(this.downArrow,"onmouseover",_103e(this.downArrow,this._onArrowDown));
this.inherited(arguments);
},_buttonMouse:function(e){
dojo.toggleClass(e.currentTarget,"dijitButtonNodeHover",e.type=="mouseover");
},_createOption:function(index){
var date=new Date(this._refDate);
var _1045=this._clickableIncrementDate;
date.setHours(date.getHours()+_1045.getHours()*index,date.getMinutes()+_1045.getMinutes()*index,date.getSeconds()+_1045.getSeconds()*index);
var _1046=dojo.date.locale.format(date,this.constraints);
if(this._filterString&&_1046.toLowerCase().indexOf(this._filterString)!==0){
return null;
}
var div=dojo.create("div",{"class":this.baseClass+"Item"});
div.date=date;
div.index=index;
dojo.create("div",{"class":this.baseClass+"ItemInner",innerHTML:_1046},div);
if(index%this._visibleIncrement<1&&index%this._visibleIncrement>-1){
dojo.addClass(div,this.baseClass+"Marker");
}else{
if(!(index%this._clickableIncrement)){
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
var tdate=tgt.target.date||tgt.target.parentNode.date;
if(!tdate||this.isDisabledDate(tdate)){
return;
}
this._highlighted_option=null;
this.attr("value",tdate);
this.onValueSelected(tdate);
},onValueSelected:function(time){
},_highlightOption:function(node,_104c){
if(!node){
return;
}
if(_104c){
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
dojo.toggleClass(node,this.baseClass+"ItemHover",_104c);
if(dojo.hasClass(node,this.baseClass+"Marker")){
dojo.toggleClass(node,this.baseClass+"MarkerHover",_104c);
}else{
dojo.toggleClass(node,this.baseClass+"TickHover",_104c);
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
var _1052=(dojo.isIE?e.wheelDelta:-e.detail);
this[(_1052>0?"_onArrowUp":"_onArrowDown")]();
},_onArrowUp:function(count){
if(typeof count=="number"&&count==-1){
return;
}
if(!this.timeMenu.childNodes.length){
return;
}
var index=this.timeMenu.childNodes[0].index;
var divs=this._getFilteredNodes(index,1,true);
if(divs.length){
this.timeMenu.removeChild(this.timeMenu.childNodes[this.timeMenu.childNodes.length-1]);
this.timeMenu.insertBefore(divs[0],this.timeMenu.childNodes[0]);
}
},_onArrowDown:function(count){
if(typeof count=="number"&&count==-1){
return;
}
if(!this.timeMenu.childNodes.length){
return;
}
var index=this.timeMenu.childNodes[this.timeMenu.childNodes.length-1].index+1;
var divs=this._getFilteredNodes(index,1,false);
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
var _105b=this.timeMenu,tgt=this._highlighted_option||dojo.query("."+this.baseClass+"ItemSelected",_105b)[0];
if(!tgt){
tgt=_105b.childNodes[0];
}else{
if(_105b.childNodes.length){
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
dojo.declare("dijit.form.TimeTextBox",dijit.form._DateTimeTextBox,{baseClass:"dijitTextBox dijitTimeTextBox",popupClass:"dijit._TimePicker",_selector:"time",value:new Date("")});
}
if(!dojo._hasResource["dijit.form._Spinner"]){
dojo._hasResource["dijit.form._Spinner"]=true;
dojo.provide("dijit.form._Spinner");
dojo.declare("dijit.form._Spinner",dijit.form.RangeBoundTextBox,{defaultTimeout:500,timeoutChangeRate:0.9,smallDelta:1,largeDelta:10,templateString:"<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\r\n\tid=\"widget_${id}\"\r\n\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\" waiRole=\"presentation\"\r\n\t><div class=\"dijitInputLayoutContainer\"\r\n\t\t><div class=\"dijitReset dijitSpinnerButtonContainer\"\r\n\t\t\t>&nbsp;<div class=\"dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitUpArrowButton\"\r\n\t\t\t\tdojoAttachPoint=\"upArrowNode\"\r\n\t\t\t\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse\"\r\n\t\t\t\tstateModifier=\"UpArrow\"\r\n\t\t\t\t><div class=\"dijitArrowButtonInner\">&thinsp;</div\r\n\t\t\t\t><div class=\"dijitArrowButtonChar\">&#9650;</div\r\n\t\t\t></div\r\n\t\t\t><div class=\"dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitDownArrowButton\"\r\n\t\t\t\tdojoAttachPoint=\"downArrowNode\"\r\n\t\t\t\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse\"\r\n\t\t\t\tstateModifier=\"DownArrow\"\r\n\t\t\t\t><div class=\"dijitArrowButtonInner\">&thinsp;</div\r\n\t\t\t\t><div class=\"dijitArrowButtonChar\">&#9660;</div\r\n\t\t\t></div\r\n\t\t></div\r\n\t\t><div class=\"dijitReset dijitValidationIcon\"><br></div\r\n\t\t><div class=\"dijitReset dijitValidationIconText\">&Chi;</div\r\n\t\t><div class=\"dijitReset dijitInputField\"\r\n\t\t\t><input class='dijitReset' dojoAttachPoint=\"textbox,focusNode\" type=\"${type}\" dojoAttachEvent=\"onkeypress:_onKeyPress\"\r\n\t\t\t\twaiRole=\"spinbutton\" autocomplete=\"off\" ${nameAttrSetting}\r\n\t\t/></div\r\n\t></div\r\n></div>\r\n",baseClass:"dijitSpinner",adjust:function(val,delta){
return val;
},_arrowState:function(node,_1060){
this._active=_1060;
this.stateModifier=node.getAttribute("stateModifier")||"";
this._setStateClass();
},_arrowPressed:function(_1061,_1062,_1063){
if(this.disabled||this.readOnly){
return;
}
this._arrowState(_1061,true);
this._setValueAttr(this.adjust(this.attr("value"),_1062*_1063),false);
dijit.selectInputText(this.textbox,this.textbox.value.length);
},_arrowReleased:function(node){
this._wheelTimer=null;
if(this.disabled||this.readOnly){
return;
}
this._arrowState(node,false);
},_typematicCallback:function(count,node,evt){
var inc=this.smallDelta;
if(node==this.textbox){
var k=dojo.keys;
var key=evt.charOrCode;
inc=(key==k.PAGE_UP||key==k.PAGE_DOWN)?this.largeDelta:this.smallDelta;
node=(key==k.UP_ARROW||key==k.PAGE_UP)?this.upArrowNode:this.downArrowNode;
}
if(count==-1){
this._arrowReleased(node);
}else{
this._arrowPressed(node,(node==this.upArrowNode)?1:-1,inc);
}
},_wheelTimer:null,_mouseWheeled:function(evt){
dojo.stopEvent(evt);
var _106c=evt.detail?(evt.detail*-1):(evt.wheelDelta/120);
if(_106c!==0){
var node=this[(_106c>0?"upArrowNode":"downArrowNode")];
this._arrowPressed(node,_106c,this.smallDelta);
if(!this._wheelTimer){
clearTimeout(this._wheelTimer);
}
this._wheelTimer=setTimeout(dojo.hitch(this,"_arrowReleased",node),50);
}
},postCreate:function(){
this.inherited(arguments);
this.connect(this.domNode,!dojo.isMozilla?"onmousewheel":"DOMMouseScroll","_mouseWheeled");
this._connects.push(dijit.typematic.addListener(this.upArrowNode,this.textbox,{charOrCode:dojo.keys.UP_ARROW,ctrlKey:false,altKey:false,shiftKey:false},this,"_typematicCallback",this.timeoutChangeRate,this.defaultTimeout));
this._connects.push(dijit.typematic.addListener(this.downArrowNode,this.textbox,{charOrCode:dojo.keys.DOWN_ARROW,ctrlKey:false,altKey:false,shiftKey:false},this,"_typematicCallback",this.timeoutChangeRate,this.defaultTimeout));
this._connects.push(dijit.typematic.addListener(this.upArrowNode,this.textbox,{charOrCode:dojo.keys.PAGE_UP,ctrlKey:false,altKey:false,shiftKey:false},this,"_typematicCallback",this.timeoutChangeRate,this.defaultTimeout));
this._connects.push(dijit.typematic.addListener(this.downArrowNode,this.textbox,{charOrCode:dojo.keys.PAGE_DOWN,ctrlKey:false,altKey:false,shiftKey:false},this,"_typematicCallback",this.timeoutChangeRate,this.defaultTimeout));
if(dojo.isIE){
var _this=this;
this.connect(this.domNode,"onresize",function(){
setTimeout(dojo.hitch(_this,function(){
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
dojo.number.format=function(value,_1071){
_1071=dojo.mixin({},_1071||{});
var _1072=dojo.i18n.normalizeLocale(_1071.locale);
var _1073=dojo.i18n.getLocalization("dojo.cldr","number",_1072);
_1071.customs=_1073;
var _1074=_1071.pattern||_1073[(_1071.type||"decimal")+"Format"];
if(isNaN(value)||Math.abs(value)==Infinity){
return null;
}
return dojo.number._applyPattern(value,_1074,_1071);
};
dojo.number._numberPatternRE=/[#0,]*[#0](?:\.0*#*)?/;
dojo.number._applyPattern=function(value,_1076,_1077){
_1077=_1077||{};
var group=_1077.customs.group;
var _1079=_1077.customs.decimal;
var _107a=_1076.split(";");
var _107b=_107a[0];
_1076=_107a[(value<0)?1:0]||("-"+_107b);
if(_1076.indexOf("%")!=-1){
value*=100;
}else{
if(_1076.indexOf("‰")!=-1){
value*=1000;
}else{
if(_1076.indexOf("¤")!=-1){
group=_1077.customs.currencyGroup||group;
_1079=_1077.customs.currencyDecimal||_1079;
_1076=_1076.replace(/\u00a4{1,3}/,function(match){
var prop=["symbol","currency","displayName"][match.length-1];
return _1077[prop]||_1077.currency||"";
});
}else{
if(_1076.indexOf("E")!=-1){
throw new Error("exponential notation not supported");
}
}
}
}
var _107e=dojo.number._numberPatternRE;
var _107f=_107b.match(_107e);
if(!_107f){
throw new Error("unable to find a number expression in pattern: "+_1076);
}
if(_1077.fractional===false){
_1077.places=0;
}
return _1076.replace(_107e,dojo.number._formatAbsolute(value,_107f[0],{decimal:_1079,group:group,places:_1077.places,round:_1077.round}));
};
dojo.number.round=function(value,_1081,_1082){
var _1083=10/(_1082||10);
return (_1083*+value).toFixed(_1081)/_1083;
};
if((0.9).toFixed()==0){
(function(){
var round=dojo.number.round;
dojo.number.round=function(v,p,m){
var d=Math.pow(10,-p||0),a=Math.abs(v);
if(!v||a>=d||a*Math.pow(10,p+1)<5){
d=0;
}
return round(v,p,m)+(v>0?d:-d);
};
})();
}
dojo.number._formatAbsolute=function(value,_108b,_108c){
_108c=_108c||{};
if(_108c.places===true){
_108c.places=0;
}
if(_108c.places===Infinity){
_108c.places=6;
}
var _108d=_108b.split(".");
var _108e=(_108c.places>=0)?_108c.places:(_108d[1]&&_108d[1].length)||0;
if(!(_108c.round<0)){
value=dojo.number.round(value,_108e,_108c.round);
}
var _108f=String(Math.abs(value)).split(".");
var _1090=_108f[1]||"";
if(_108c.places){
var comma=dojo.isString(_108c.places)&&_108c.places.indexOf(",");
if(comma){
_108c.places=_108c.places.substring(comma+1);
}
_108f[1]=dojo.string.pad(_1090.substr(0,_108c.places),_108c.places,"0",true);
}else{
if(_108d[1]&&_108c.places!==0){
var pad=_108d[1].lastIndexOf("0")+1;
if(pad>_1090.length){
_108f[1]=dojo.string.pad(_1090,pad,"0",true);
}
var _1093=_108d[1].length;
if(_1093<_1090.length){
_108f[1]=_1090.substr(0,_1093);
}
}else{
if(_108f[1]){
_108f.pop();
}
}
}
var _1094=_108d[0].replace(",","");
pad=_1094.indexOf("0");
if(pad!=-1){
pad=_1094.length-pad;
if(pad>_108f[0].length){
_108f[0]=dojo.string.pad(_108f[0],pad);
}
if(_1094.indexOf("#")==-1){
_108f[0]=_108f[0].substr(_108f[0].length-pad);
}
}
var index=_108d[0].lastIndexOf(",");
var _1096,_1097;
if(index!=-1){
_1096=_108d[0].length-index-1;
var _1098=_108d[0].substr(0,index);
index=_1098.lastIndexOf(",");
if(index!=-1){
_1097=_1098.length-index-1;
}
}
var _1099=[];
for(var whole=_108f[0];whole;){
var off=whole.length-_1096;
_1099.push((off>0)?whole.substr(off):whole);
whole=(off>0)?whole.slice(0,off):"";
if(_1097){
_1096=_1097;
delete _1097;
}
}
_108f[0]=_1099.reverse().join(_108c.group||",");
return _108f.join(_108c.decimal||".");
};
dojo.number.regexp=function(_109c){
return dojo.number._parseInfo(_109c).regexp;
};
dojo.number._parseInfo=function(_109d){
_109d=_109d||{};
var _109e=dojo.i18n.normalizeLocale(_109d.locale);
var _109f=dojo.i18n.getLocalization("dojo.cldr","number",_109e);
var _10a0=_109d.pattern||_109f[(_109d.type||"decimal")+"Format"];
var group=_109f.group;
var _10a2=_109f.decimal;
var _10a3=1;
if(_10a0.indexOf("%")!=-1){
_10a3/=100;
}else{
if(_10a0.indexOf("‰")!=-1){
_10a3/=1000;
}else{
var _10a4=_10a0.indexOf("¤")!=-1;
if(_10a4){
group=_109f.currencyGroup||group;
_10a2=_109f.currencyDecimal||_10a2;
}
}
}
var _10a5=_10a0.split(";");
if(_10a5.length==1){
_10a5.push("-"+_10a5[0]);
}
var re=dojo.regexp.buildGroupRE(_10a5,function(_10a7){
_10a7="(?:"+dojo.regexp.escapeString(_10a7,".")+")";
return _10a7.replace(dojo.number._numberPatternRE,function(_10a8){
var flags={signed:false,separator:_109d.strict?group:[group,""],fractional:_109d.fractional,decimal:_10a2,exponent:false};
var parts=_10a8.split(".");
var _10ab=_109d.places;
if(parts.length==1||_10ab===0){
flags.fractional=false;
}else{
if(_10ab===undefined){
_10ab=_109d.pattern?parts[1].lastIndexOf("0")+1:Infinity;
}
if(_10ab&&_109d.fractional==undefined){
flags.fractional=true;
}
if(!_109d.places&&(_10ab<parts[1].length)){
_10ab+=","+parts[1].length;
}
flags.places=_10ab;
}
var _10ac=parts[0].split(",");
if(_10ac.length>1){
flags.groupSize=_10ac.pop().length;
if(_10ac.length>1){
flags.groupSize2=_10ac.pop().length;
}
}
return "("+dojo.number._realNumberRegexp(flags)+")";
});
},true);
if(_10a4){
re=re.replace(/([\s\xa0]*)(\u00a4{1,3})([\s\xa0]*)/g,function(match,_10ae,_10af,after){
var prop=["symbol","currency","displayName"][_10af.length-1];
var _10b2=dojo.regexp.escapeString(_109d[prop]||_109d.currency||"");
_10ae=_10ae?"[\\s\\xa0]":"";
after=after?"[\\s\\xa0]":"";
if(!_109d.strict){
if(_10ae){
_10ae+="*";
}
if(after){
after+="*";
}
return "(?:"+_10ae+_10b2+after+")?";
}
return _10ae+_10b2+after;
});
}
return {regexp:re.replace(/[\xa0 ]/g,"[\\s\\xa0]"),group:group,decimal:_10a2,factor:_10a3};
};
dojo.number.parse=function(_10b3,_10b4){
var info=dojo.number._parseInfo(_10b4);
var _10b6=(new RegExp("^"+info.regexp+"$")).exec(_10b3);
if(!_10b6){
return NaN;
}
var _10b7=_10b6[1];
if(!_10b6[1]){
if(!_10b6[2]){
return NaN;
}
_10b7=_10b6[2];
info.factor*=-1;
}
_10b7=_10b7.replace(new RegExp("["+info.group+"\\s\\xa0"+"]","g"),"").replace(info.decimal,".");
return _10b7*info.factor;
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
var _10b9=dojo.number._integerRegexp(flags);
var _10ba=dojo.regexp.buildGroupRE(flags.fractional,function(q){
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
var _10bd=dojo.regexp.buildGroupRE(flags.exponent,function(q){
if(q){
return "([eE]"+dojo.number._integerRegexp({signed:flags.eSigned})+")";
}
return "";
});
var _10bf=_10b9+_10ba;
if(_10ba){
_10bf="(?:(?:"+_10bf+")|(?:"+_10ba+"))";
}
return _10bf+_10bd;
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
var _10c1=dojo.regexp.buildGroupRE(flags.signed,function(q){
return q?"[-+]":"";
},true);
var _10c3=dojo.regexp.buildGroupRE(flags.separator,function(sep){
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
var grp=flags.groupSize,grp2=flags.groupSize2;
if(grp2){
var _10c7="(?:0|[1-9]\\d{0,"+(grp2-1)+"}(?:["+sep+"]\\d{"+grp2+"})*["+sep+"]\\d{"+grp+"})";
return ((grp-grp2)>0)?"(?:"+_10c7+"|(?:0|[1-9]\\d{0,"+(grp-1)+"}))":_10c7;
}
return "(?:0|[1-9]\\d{0,"+(grp-1)+"}(?:["+sep+"]\\d{"+grp+"})*)";
},true);
return _10c1+_10c3;
};
}
if(!dojo._hasResource["dijit.form.NumberTextBox"]){
dojo._hasResource["dijit.form.NumberTextBox"]=true;
dojo.provide("dijit.form.NumberTextBox");
dojo.declare("dijit.form.NumberTextBoxMixin",null,{regExpGen:dojo.number.regexp,value:NaN,editOptions:{pattern:"#.######"},_formatter:dojo.number.format,postMixInProperties:function(){
if(typeof this.constraints.max!="number"){
this.constraints.max=9000000000000000;
}
this.inherited(arguments);
},_onFocus:function(){
if(this.disabled){
return;
}
var val=this.attr("value");
if(typeof val=="number"&&!isNaN(val)){
var _10c9=this.format(val,this.constraints);
if(_10c9!==undefined){
this.textbox.value=_10c9;
}
}
this.inherited(arguments);
},format:function(value,_10cb){
if(typeof value!="number"){
return String(value);
}
if(isNaN(value)){
return "";
}
if(("rangeCheck" in this)&&!this.rangeCheck(value,_10cb)){
return String(value);
}
if(this.editOptions&&this._focused){
_10cb=dojo.mixin(dojo.mixin({},this.editOptions),_10cb);
}
return this._formatter(value,_10cb);
},parse:dojo.number.parse,_getDisplayedValueAttr:function(){
var v=this.inherited(arguments);
return isNaN(v)?this.textbox.value:v;
},filter:function(value){
return (value===null||value===""||value===undefined)?NaN:this.inherited(arguments);
},serialize:function(value,_10cf){
return (typeof value!="number"||isNaN(value))?"":this.inherited(arguments);
},_setValueAttr:function(value,_10d1,_10d2){
if(value!==undefined&&_10d2===undefined){
if(typeof value=="number"){
if(isNaN(value)){
_10d2="";
}else{
if(("rangeCheck" in this)&&!this.rangeCheck(value,this.constraints)){
_10d2=String(value);
}
}
}else{
if(!value){
_10d2="";
value=NaN;
}else{
_10d2=String(value);
value=undefined;
}
}
}
this.inherited(arguments,[value,_10d1,_10d2]);
},_getValueAttr:function(){
var v=this.inherited(arguments);
if(isNaN(v)&&this.textbox.value!==""){
var n=Number(this.textbox.value);
return (String(n)===this.textbox.value)?n:undefined;
}else{
return v;
}
}});
dojo.declare("dijit.form.NumberTextBox",[dijit.form.RangeBoundTextBox,dijit.form.NumberTextBoxMixin],{});
}
if(!dojo._hasResource["dijit.form.NumberSpinner"]){
dojo._hasResource["dijit.form.NumberSpinner"]=true;
dojo.provide("dijit.form.NumberSpinner");
dojo.declare("dijit.form.NumberSpinner",[dijit.form._Spinner,dijit.form.NumberTextBoxMixin],{required:true,adjust:function(val,delta){
var tc=this.constraints,v=isNaN(val),_10d9=!isNaN(tc.max),_10da=!isNaN(tc.min);
if(v&&delta!=0){
val=(delta>0)?_10da?tc.min:_10d9?tc.max:0:_10d9?this.constraints.max:_10da?tc.min:0;
}
var _10db=val+delta;
if(v||isNaN(_10db)){
return val;
}
if(_10d9&&(_10db>tc.max)){
_10db=tc.max;
}
if(_10da&&(_10db<tc.min)){
_10db=tc.min;
}
return _10db;
},_onKeyPress:function(e){
if((e.charOrCode==dojo.keys.HOME||e.charOrCode==dojo.keys.END)&&!e.ctrlKey&&!e.altKey){
var value=this.constraints[(e.charOrCode==dojo.keys.HOME?"min":"max")];
if(value){
this._setValueAttr(value,true);
}
dojo.stopEvent(e);
}
}});
}
if(!dojo._hasResource["dojo.cldr.monetary"]){
dojo._hasResource["dojo.cldr.monetary"]=true;
dojo.provide("dojo.cldr.monetary");
dojo.cldr.monetary.getData=function(code){
var _10df={ADP:0,BHD:3,BIF:0,BYR:0,CLF:0,CLP:0,DJF:0,ESP:0,GNF:0,IQD:3,ITL:0,JOD:3,JPY:0,KMF:0,KRW:0,KWD:3,LUF:0,LYD:3,MGA:0,MGF:0,OMR:3,PYG:0,RWF:0,TND:3,TRL:0,VUV:0,XAF:0,XOF:0,XPF:0};
var _10e0={CHF:5};
var _10e1=_10df[code],round=_10e0[code];
if(typeof _10e1=="undefined"){
_10e1=2;
}
if(typeof round=="undefined"){
round=0;
}
return {places:_10e1,round:round};
};
}
if(!dojo._hasResource["dojo.currency"]){
dojo._hasResource["dojo.currency"]=true;
dojo.provide("dojo.currency");
dojo.currency._mixInDefaults=function(_10e3){
_10e3=_10e3||{};
_10e3.type="currency";
var _10e4=dojo.i18n.getLocalization("dojo.cldr","currency",_10e3.locale)||{};
var iso=_10e3.currency;
var data=dojo.cldr.monetary.getData(iso);
dojo.forEach(["displayName","symbol","group","decimal"],function(prop){
data[prop]=_10e4[iso+"_"+prop];
});
data.fractional=[true,false];
return dojo.mixin(data,_10e3);
};
dojo.currency.format=function(value,_10e9){
return dojo.number.format(value,dojo.currency._mixInDefaults(_10e9));
};
dojo.currency.regexp=function(_10ea){
return dojo.number.regexp(dojo.currency._mixInDefaults(_10ea));
};
dojo.currency.parse=function(_10eb,_10ec){
return dojo.number.parse(_10eb,dojo.currency._mixInDefaults(_10ec));
};
}
if(!dojo._hasResource["dijit.form.CurrencyTextBox"]){
dojo._hasResource["dijit.form.CurrencyTextBox"]=true;
dojo.provide("dijit.form.CurrencyTextBox");
dojo.declare("dijit.form.CurrencyTextBox",dijit.form.NumberTextBox,{currency:"",regExpGen:dojo.currency.regexp,_formatter:dojo.currency.format,parse:dojo.currency.parse,postMixInProperties:function(){
this.constraints.currency=this.currency;
this.inherited(arguments);
}});
}
if(!dojo._hasResource["dijit.form.HorizontalSlider"]){
dojo._hasResource["dijit.form.HorizontalSlider"]=true;
dojo.provide("dijit.form.HorizontalSlider");
dojo.declare("dijit.form.HorizontalSlider",[dijit.form._FormValueWidget,dijit._Container],{templateString:"<table class=\"dijit dijitReset dijitSlider\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" rules=\"none\" dojoAttachEvent=\"onkeypress:_onKeyPress\"\r\n\t><tr class=\"dijitReset\"\r\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\r\n\t\t><td dojoAttachPoint=\"containerNode,topDecoration\" class=\"dijitReset\" style=\"text-align:center;width:100%;\"></td\r\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\r\n\t></tr\r\n\t><tr class=\"dijitReset\"\r\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerH\"\r\n\t\t\t><div class=\"dijitSliderDecrementIconH\" tabIndex=\"-1\" style=\"display:none\" dojoAttachPoint=\"decrementButton\"><span class=\"dijitSliderButtonInner\">-</span></div\r\n\t\t></td\r\n\t\t><td class=\"dijitReset\"\r\n\t\t\t><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperH dijitSliderLeftBumper dijitSliderLeftBumper\" dojoAttachEvent=\"onmousedown:_onClkDecBumper\"></div\r\n\t\t></td\r\n\t\t><td class=\"dijitReset\"\r\n\t\t\t><input dojoAttachPoint=\"valueNode\" type=\"hidden\" ${nameAttrSetting}\r\n\t\t\t/><div class=\"dijitReset dijitSliderBarContainerH\" waiRole=\"presentation\" dojoAttachPoint=\"sliderBarContainer\"\r\n\t\t\t\t><div waiRole=\"presentation\" dojoAttachPoint=\"progressBar\" class=\"dijitSliderBar dijitSliderBarH dijitSliderProgressBar dijitSliderProgressBarH\" dojoAttachEvent=\"onmousedown:_onBarClick\"\r\n\t\t\t\t\t><div class=\"dijitSliderMoveable dijitSliderMoveableH\" \r\n\t\t\t\t\t\t><div dojoAttachPoint=\"sliderHandle,focusNode\" class=\"dijitSliderImageHandle dijitSliderImageHandleH\" dojoAttachEvent=\"onmousedown:_onHandleClick\" waiRole=\"slider\" valuemin=\"${minimum}\" valuemax=\"${maximum}\"></div\r\n\t\t\t\t\t></div\r\n\t\t\t\t></div\r\n\t\t\t\t><div waiRole=\"presentation\" dojoAttachPoint=\"remainingBar\" class=\"dijitSliderBar dijitSliderBarH dijitSliderRemainingBar dijitSliderRemainingBarH\" dojoAttachEvent=\"onmousedown:_onBarClick\"></div\r\n\t\t\t></div\r\n\t\t></td\r\n\t\t><td class=\"dijitReset\"\r\n\t\t\t><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperH dijitSliderRightBumper dijitSliderRightBumper\" dojoAttachEvent=\"onmousedown:_onClkIncBumper\"></div\r\n\t\t></td\r\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerH\" style=\"right:0px;\"\r\n\t\t\t><div class=\"dijitSliderIncrementIconH\" tabIndex=\"-1\" style=\"display:none\" dojoAttachPoint=\"incrementButton\"><span class=\"dijitSliderButtonInner\">+</span></div\r\n\t\t></td\r\n\t></tr\r\n\t><tr class=\"dijitReset\"\r\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\r\n\t\t><td dojoAttachPoint=\"containerNode,bottomDecoration\" class=\"dijitReset\" style=\"text-align:center;\"></td\r\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\r\n\t></tr\r\n></table>\r\n",value:0,showButtons:true,minimum:0,maximum:100,discreteValues:Infinity,pageIncrement:2,clickSelect:true,slideDuration:dijit.defaultDuration,widgetsInTemplate:true,attributeMap:dojo.delegate(dijit.form._FormWidget.prototype.attributeMap,{id:""}),baseClass:"dijitSlider",_mousePixelCoord:"pageX",_pixelCount:"w",_startingPixelCoord:"x",_startingPixelCount:"l",_handleOffsetCoord:"left",_progressPixelSize:"width",_onKeyPress:function(e){
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
var _10f0=dojo.coords(this.sliderBarContainer,true);
var _10f1=e[this._mousePixelCoord]-_10f0[this._startingPixelCoord];
this._setPixelValue(this._isReversed()?(_10f0[this._pixelCount]-_10f1):_10f1,_10f0[this._pixelCount],true);
this._movable.onMouseDown(e);
},_setPixelValue:function(_10f2,_10f3,_10f4){
if(this.disabled||this.readOnly){
return;
}
_10f2=_10f2<0?0:_10f3<_10f2?_10f3:_10f2;
var count=this.discreteValues;
if(count<=1||count==Infinity){
count=_10f3;
}
count--;
var _10f6=_10f3/count;
var _10f7=Math.round(_10f2/_10f6);
this._setValueAttr((this.maximum-this.minimum)*_10f7/count+this.minimum,_10f4);
},_setValueAttr:function(value,_10f9){
this.valueNode.value=this.value=value;
dijit.setWaiState(this.focusNode,"valuenow",value);
this.inherited(arguments);
var _10fa=(value-this.minimum)/(this.maximum-this.minimum);
var _10fb=(this._descending===false)?this.remainingBar:this.progressBar;
var _10fc=(this._descending===false)?this.progressBar:this.remainingBar;
if(this._inProgressAnim&&this._inProgressAnim.status!="stopped"){
this._inProgressAnim.stop(true);
}
if(_10f9&&this.slideDuration>0&&_10fb.style[this._progressPixelSize]){
var _this=this;
var props={};
var start=parseFloat(_10fb.style[this._progressPixelSize]);
var _1100=this.slideDuration*(_10fa-start/100);
if(_1100==0){
return;
}
if(_1100<0){
_1100=0-_1100;
}
props[this._progressPixelSize]={start:start,end:_10fa*100,units:"%"};
this._inProgressAnim=dojo.animateProperty({node:_10fb,duration:_1100,onAnimate:function(v){
_10fc.style[_this._progressPixelSize]=(100-parseFloat(v[_this._progressPixelSize]))+"%";
},onEnd:function(){
delete _this._inProgressAnim;
},properties:props});
this._inProgressAnim.play();
}else{
_10fb.style[this._progressPixelSize]=(_10fa*100)+"%";
_10fc.style[this._progressPixelSize]=((1-_10fa)*100)+"%";
}
},_bumpValue:function(_1102){
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
var value=(this.value-this.minimum)*count/(this.maximum-this.minimum)+_1102;
if(value<0){
value=0;
}
if(value>count){
value=count;
}
value=value*(this.maximum-this.minimum)/count+this.minimum;
this._setValueAttr(value,true);
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
var janky=!dojo.isMozilla;
var _110c=evt[(janky?"wheelDelta":"detail")]*(janky?1:-1);
this[(_110c<0?"decrement":"increment")](evt);
},startup:function(){
dojo.forEach(this.getChildren(),function(child){
if(this[child.container]!=this.containerNode){
this[child.container].appendChild(child.domNode);
}
},this);
},_typematicCallback:function(count,_110f,e){
if(count==-1){
return;
}
this[(_110f==(this._descending?this.incrementButton:this.decrementButton))?"decrement":"increment"](e);
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
dojo.declare("dijit.form._SliderMover",dojo.dnd.Mover,{onMouseMove:function(e){
var _1115=this.widget;
var _1116=_1115._abspos;
if(!_1116){
_1116=_1115._abspos=dojo.coords(_1115.sliderBarContainer,true);
_1115._setPixelValue_=dojo.hitch(_1115,"_setPixelValue");
_1115._isReversed_=_1115._isReversed();
}
var _1117=e[_1115._mousePixelCoord]-_1116[_1115._startingPixelCoord];
_1115._setPixelValue_(_1115._isReversed_?(_1116[_1115._pixelCount]-_1117):_1117,_1116[_1115._pixelCount],false);
},destroy:function(e){
dojo.dnd.Mover.prototype.destroy.apply(this,arguments);
var _1119=this.widget;
_1119._abspos=null;
_1119._setValueAttr(_1119.value,true);
}});
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
var _111c=oSel.getRangeAt(0);
if((_111c.startContainer==_111c.endContainer)&&((_111c.endOffset-_111c.startOffset)==1)&&(_111c.startContainer.nodeType!=3)){
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
var _111d=dojo.global.getSelection();
if(_111d){
return _111d.toString();
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
var _111e=dojo.global.getSelection();
if(_111e&&_111e.rangeCount){
var frag=_111e.getRangeAt(0).cloneContents();
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
var _1122=dojo.global.getSelection();
return _1122.anchorNode.childNodes[_1122.anchorOffset];
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
var _1125=dojo.global.getSelection();
if(_1125){
var node=_1125.anchorNode;
while(node&&(node.nodeType!=1)){
node=node.parentNode;
}
return node;
}
}
}
return null;
},hasAncestorElement:function(_1127){
return this.getAncestorElement.apply(this,arguments)!=null;
},getAncestorElement:function(_1128){
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
},collapse:function(_1131){
if(window["getSelection"]){
var _1132=dojo.global.getSelection();
if(_1132.removeAllRanges){
if(_1131){
_1132.collapseToStart();
}else{
_1132.collapseToEnd();
}
}else{
_1132.collapse(_1131);
}
}else{
if(dojo.doc.selection){
var range=dojo.doc.selection.createRange();
range.collapse(_1131);
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
},selectElementChildren:function(_1135,_1136){
var _1137=dojo.global;
var _1138=dojo.doc;
_1135=dojo.byId(_1135);
if(_1138.selection&&dojo.body().createTextRange){
var range=_1135.ownerDocument.body.createTextRange();
range.moveToElementText(_1135);
if(!_1136){
try{
range.select();
}
catch(e){
}
}
}else{
if(_1137.getSelection){
var _113a=_1137.getSelection();
if(_113a.setBaseAndExtent){
_113a.setBaseAndExtent(_1135,0,_1135,_1135.innerText.length-1);
}else{
if(_113a.selectAllChildren){
_113a.selectAllChildren(_1135);
}
}
}
}
},selectElement:function(_113b,_113c){
var range,_113e=dojo.doc;
_113b=dojo.byId(_113b);
if(_113e.selection&&dojo.body().createTextRange){
try{
range=dojo.body().createControlRange();
range.addElement(_113b);
if(!_113c){
range.select();
}
}
catch(e){
this.selectElementChildren(_113b,_113c);
}
}else{
if(dojo.global.getSelection){
var _113f=dojo.global.getSelection();
if(_113f.removeAllRanges){
range=_113e.createRange();
range.selectNode(_113b);
_113f.removeAllRanges();
_113f.addRange(range);
}
}
}
}});
}
if(!dojo._hasResource["dijit._editor.range"]){
dojo._hasResource["dijit._editor.range"]=true;
dojo.provide("dijit._editor.range");
dijit.range={};
dijit.range.getIndex=function(node,_1141){
var ret=[],retR=[];
var stop=_1141;
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
dijit.range.getNode=function(index,_114a){
if(!dojo.isArray(index)||index.length==0){
return _114a;
}
var node=_114a;
dojo.every(index,function(i){
if(i>=0&&i<node.childNodes.length){
node=node.childNodes[i];
}else{
node=null;
console.debug("Error: can not find node with index",index,"under parent node",_114a);
return false;
}
return true;
});
return node;
};
dijit.range.getCommonAncestor=function(n1,n2){
var _114f=function(n){
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
var n1as=_114f(n1);
var n2as=_114f(n2);
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
var block=null,_115f;
while(node&&node!==root){
var name=node.nodeName.toUpperCase();
if(!block&&regex.test(name)){
block=node;
}
if(!_115f&&(/^(?:BODY|TD|TH|CAPTION)$/).test(name)){
_115f=node;
}
node=node.parentNode;
}
return {blockNode:block,blockContainer:_115f||node.ownerDocument.body};
};
dijit.range.atBeginningOfContainer=function(_1161,node,_1163){
var _1164=false;
var _1165=(_1163==0);
if(!_1165&&node.nodeType==3){
if(dojo.trim(node.nodeValue.substr(0,_1163))==0){
_1165=true;
}
}
if(_1165){
var cnode=node;
_1164=true;
while(cnode&&cnode!==_1161){
if(cnode.previousSibling){
_1164=false;
break;
}
cnode=cnode.parentNode;
}
}
return _1164;
};
dijit.range.atEndOfContainer=function(_1167,node,_1169){
var atEnd=false;
var _116b=(_1169==(node.length||node.childNodes.length));
if(!_116b&&node.nodeType==3){
if(dojo.trim(node.nodeValue.substr(_1169))==0){
_116b=true;
}
}
if(_116b){
var cnode=node;
atEnd=true;
while(cnode&&cnode!==_1167){
if(cnode.nextSibling){
atEnd=false;
break;
}
cnode=cnode.parentNode;
}
}
return atEnd;
};
dijit.range.adjacentNoneTextNode=function(_116d,next){
var node=_116d;
var len=(0-_116d.length)||0;
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
dijit.range.getSelection=function(win,_1173){
if(dijit.range._w3c){
return win.getSelection();
}else{
var s=new dijit.range.ie.selection(win);
if(!_1173){
s._getCurrentSelection();
}
return s;
}
};
if(!dijit.range._w3c){
dijit.range.ie={cachedSelection:{},selection:function(win){
this._ranges=[];
this.addRange=function(r,_1177){
this._ranges.push(r);
if(!_1177){
r._select();
}
this.rangeCount=this._ranges.length;
};
this.removeAllRanges=function(){
this._ranges=[];
this.rangeCount=0;
};
var _1178=function(){
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
var r=_1178();
if(r){
this.addRange(r,true);
}
};
},decomposeControlRange:function(range){
var _117e=range.item(0),_117f=range.item(range.length-1);
var _1180=_117e.parentNode,_1181=_117f.parentNode;
var _1182=dijit.range.getIndex(_117e,_1180).o;
var _1183=dijit.range.getIndex(_117f,_1181).o+1;
return [_1180,_1182,_1181,_1183];
},getEndPoint:function(range,end){
var _1186=range.duplicate();
_1186.collapse(!end);
var _1187="EndTo"+(end?"End":"Start");
var _1188=_1186.parentElement();
var _1189,_118a,_118b;
if(_1188.childNodes.length>0){
dojo.every(_1188.childNodes,function(node,i){
var _118e;
if(node.nodeType!=3){
_1186.moveToElementText(node);
if(_1186.compareEndPoints(_1187,range)>0){
_1189=node.previousSibling;
if(_118b&&_118b.nodeType==3){
_1189=_118b;
_118e=true;
}else{
_1189=_1188;
_118a=i;
return false;
}
}else{
if(i==_1188.childNodes.length-1){
_1189=_1188;
_118a=_1188.childNodes.length;
return false;
}
}
}else{
if(i==_1188.childNodes.length-1){
_1189=node;
_118e=true;
}
}
if(_118e&&_1189){
var _118f=dijit.range.adjacentNoneTextNode(_1189)[0];
if(_118f){
_1189=_118f.nextSibling;
}else{
_1189=_1188.firstChild;
}
var _1190=dijit.range.adjacentNoneTextNode(_1189);
_118f=_1190[0];
var _1191=_1190[1];
if(_118f){
_1186.moveToElementText(_118f);
_1186.collapse(false);
}else{
_1186.moveToElementText(_1188);
}
_1186.setEndPoint(_1187,range);
_118a=_1186.text.length-_1191;
return false;
}
_118b=node;
return true;
});
}else{
_1189=_1188;
_118a=0;
}
if(!end&&_1189.nodeType!=3&&_118a==_1189.childNodes.length){
if(_1189.nextSibling&&_1189.nextSibling.nodeType==3){
_1189=_1189.nextSibling;
_118a=0;
}
}
return [_1189,_118a];
},setEndPoint:function(range,_1193,_1194){
var _1195=range.duplicate(),node,len;
if(_1193.nodeType!=3){
if(_1194>0){
node=_1193.childNodes[_1194-1];
if(node.nodeType==3){
_1193=node;
_1194=node.length;
}else{
if(node.nextSibling&&node.nextSibling.nodeType==3){
_1193=node.nextSibling;
_1194=0;
}else{
_1195.moveToElementText(node.nextSibling?node:_1193);
var _1198=node.parentNode.insertBefore(document.createTextNode(" "),node.nextSibling);
_1195.collapse(false);
_1198.parentNode.removeChild(_1198);
}
}
}else{
_1195.moveToElementText(_1193);
_1195.collapse(true);
}
}
if(_1193.nodeType==3){
var _1199=dijit.range.adjacentNoneTextNode(_1193);
var _119a=_1199[0];
len=_1199[1];
if(_119a){
_1195.moveToElementText(_119a);
_1195.collapse(false);
if(_119a.contentEditable!="inherit"){
len++;
}
}else{
_1195.moveToElementText(_1193.parentNode);
_1195.collapse(true);
}
_1194+=len;
if(_1194>0){
if(_1195.move("character",_1194)!=_1194){
console.error("Error when moving!");
}
}
}
return _1195;
},decomposeTextRange:function(range){
var _119c=dijit.range.ie.getEndPoint(range);
var _119d=_119c[0],_119e=_119c[1];
var _119f=_119c[0],_11a0=_119c[1];
if(range.htmlText.length){
if(range.htmlText==range.text){
_11a0=_119e+range.text.length;
}else{
_119c=dijit.range.ie.getEndPoint(range,true);
_119f=_119c[0],_11a0=_119c[1];
}
}
return [_119d,_119e,_119f,_11a0];
},setRange:function(range,_11a2,_11a3,_11a4,_11a5,_11a6){
var start=dijit.range.ie.setEndPoint(range,_11a2,_11a3);
range.setEndPoint("StartToStart",start);
if(!_11a6){
var end=dijit.range.ie.setEndPoint(range,_11a4,_11a5);
}
range.setEndPoint("EndToEnd",end||start);
return range;
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
},setStart:function(node,_11aa){
_11aa=parseInt(_11aa);
if(this.startContainer===node&&this.startOffset==_11aa){
return;
}
delete this._cachedBookmark;
this.startContainer=node;
this.startOffset=_11aa;
if(!this.endContainer){
this.setEnd(node,_11aa);
}else{
this._updateInternal();
}
},setEnd:function(node,_11ac){
_11ac=parseInt(_11ac);
if(this.endContainer===node&&this.endOffset==_11ac){
return;
}
delete this._cachedBookmark;
this.endContainer=node;
this.endOffset=_11ac;
if(!this.startContainer){
this.setStart(node,_11ac);
}else{
this._updateInternal();
}
},setStartAfter:function(node,_11ae){
this._setPoint("setStart",node,_11ae,1);
},setStartBefore:function(node,_11b0){
this._setPoint("setStart",node,_11b0,0);
},setEndAfter:function(node,_11b2){
this._setPoint("setEnd",node,_11b2,1);
},setEndBefore:function(node,_11b4){
this._setPoint("setEnd",node,_11b4,0);
},_setPoint:function(what,node,_11b7,ext){
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
dijit._editor.escapeXml=function(str,_11c0){
str=str.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;");
if(!_11c0){
str=str.replace(/'/gm,"&#39;");
}
return str;
};
dijit._editor.getNodeHtml=function(node){
var _11c2;
switch(node.nodeType){
case 1:
_11c2="<"+node.nodeName.toLowerCase();
var _11c3=[];
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
_11c3.push([key,node.getAttribute("_djrealurl")]);
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
_11c3.push([key,val.toString()]);
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
_11c3.push([n,v]);
}
}
}
_11c3.sort(function(a,b){
return a[0]<b[0]?-1:(a[0]==b[0]?0:1);
});
var j=0;
while((attr=_11c3[j++])){
_11c2+=" "+attr[0]+"=\""+(dojo.isString(attr[1])?dijit._editor.escapeXml(attr[1],true):attr[1])+"\"";
}
if(node.childNodes.length){
_11c2+=">"+dijit._editor.getChildrenHtml(node)+"</"+node.nodeName.toLowerCase()+">";
}else{
_11c2+=" />";
}
break;
case 3:
_11c2=dijit._editor.escapeXml(node.nodeValue,true);
break;
case 8:
_11c2="<!--"+dijit._editor.escapeXml(node.nodeValue,true)+"-->";
break;
default:
_11c2="<!-- Element not recognized - Type: "+node.nodeType+" Name: "+node.nodeName+"-->";
}
return _11c2;
};
dijit._editor.getChildrenHtml=function(dom){
var out="";
if(!dom){
return out;
}
var nodes=dom["childNodes"]||dom;
var _11d3=!dojo.isIE||nodes!==dom;
var node,i=0;
while((node=nodes[i++])){
if(!_11d3||node.parentNode==dom){
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
var _11d6=dojo.doc.createElement("textarea");
_11d6.id=dijit._scopeName+"._editor.RichText.savedContent";
dojo.style(_11d6,{display:"none",position:"absolute",top:"-100px",height:"3px",width:"3px"});
dojo.body().appendChild(_11d6);
})();
}else{
try{
dojo.doc.write("<textarea id=\""+dijit._scopeName+"._editor.RichText.savedContent\" "+"style=\"display:none;position:absolute;top:-100px;left:-100px;height:3px;width:3px;overflow:hidden;\"></textarea>");
}
catch(e){
}
}
}
dojo.declare("dijit._editor.RichText",dijit._Widget,{constructor:function(_11d7){
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
},inheritWidth:false,focusOnLoad:false,name:"",styleSheets:"",_content:"",height:"300px",minHeight:"1em",isClosed:true,isLoaded:false,_SEPARATOR:"@@**%%__RICHTEXTBOUNDRY__%%**@@",onLoadDeferred:null,isTabIndent:false,disableSpellCheck:false,postCreate:function(){
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
var _11db={b:exec("bold"),i:exec("italic"),u:exec("underline"),a:exec("selectall"),s:function(){
this.save(true);
},m:function(){
this.isTabIndent=!this.isTabIndent;
},"1":exec("formatblock","h1"),"2":exec("formatblock","h2"),"3":exec("formatblock","h3"),"4":exec("formatblock","h4"),"\\":exec("insertunorderedlist")};
if(!dojo.isIE){
_11db.Z=exec("redo");
}
for(var key in _11db){
this.addKeyHandler(key,true,false,_11db[key]);
}
},events:["onKeyPress","onKeyDown","onKeyUp","onClick"],captureEvents:[],_editorCommandsLocalized:false,_localizeEditorCommands:function(){
if(this._editorCommandsLocalized){
return;
}
this._editorCommandsLocalized=true;
var _11dd=["div","p","pre","h1","h2","h3","h4","h5","h6","ol","ul","address"];
var _11de="",_11df,i=0;
while((_11df=_11dd[i++])){
if(_11df.charAt(1)!="l"){
_11de+="<"+_11df+"><span>content</span></"+_11df+"><br/>";
}else{
_11de+="<"+_11df+"><li>content</li></"+_11df+"><br/>";
}
}
var div=dojo.doc.createElement("div");
dojo.style(div,{position:"absolute",top:"-2000px"});
dojo.doc.body.appendChild(div);
div.innerHTML=_11de;
var node=div.firstChild;
while(node){
dijit._editor.selection.selectElement(node.firstChild);
dojo.withGlobal(this.window,"selectElement",dijit._editor.selection,[node.firstChild]);
var _11e3=node.tagName.toLowerCase();
this._local2NativeFormatNames[_11e3]=document.queryCommandValue("formatblock");
this._native2LocalFormatNames[this._local2NativeFormatNames[_11e3]]=_11e3;
node=node.nextSibling.nextSibling;
}
dojo.body().removeChild(div);
},open:function(_11e4){
if(!this.onLoadDeferred||this.onLoadDeferred.fired>=0){
this.onLoadDeferred=new dojo.Deferred();
}
if(!this.isClosed){
this.close();
}
dojo.publish(dijit._scopeName+"._editor.RichText::open",[this]);
this._content="";
if(arguments.length==1&&_11e4.nodeName){
this.domNode=_11e4;
}
var dn=this.domNode;
var html;
if(dn.nodeName&&dn.nodeName.toLowerCase()=="textarea"){
var ta=(this.textarea=dn);
this.name=ta.name;
html=this._preFilterContent(ta.value);
dn=this.domNode=dojo.doc.createElement("div");
dn.setAttribute("widgetId",this.id);
ta.removeAttribute("widgetId");
dn.cssText=ta.cssText;
dn.className+=" "+ta.className;
dojo.place(dn,ta,"before");
var _11e8=dojo.hitch(this,function(){
dojo.style(ta,{display:"block",position:"absolute",top:"-1000px"});
if(dojo.isIE){
var s=ta.style;
this.__overflow=s.overflow;
s.overflow="hidden";
}
});
if(dojo.isIE){
setTimeout(_11e8,10);
}else{
_11e8();
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
var _11ea=dojo.contentBox(dn);
this._oldHeight=_11ea.h;
this._oldWidth=_11ea.w;
this.savedContent=html;
if(dn.nodeName&&dn.nodeName=="LI"){
dn.innerHTML=" <br>";
}
this.editingArea=dn.ownerDocument.createElement("div");
dn.appendChild(this.editingArea);
if(this.name!=""&&(!dojo.config["useXDomain"]||dojo.config["allowXdRichTextSave"])){
var _11eb=dojo.byId(dijit._scopeName+"._editor.RichText.savedContent");
if(_11eb.value!=""){
var datas=_11eb.value.split(this._SEPARATOR),i=0,dat;
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
if(dojo.isIE||dojo.isWebKit||dojo.isOpera){
var ifr=(this.editorObject=this.iframe=dojo.doc.createElement("iframe"));
ifr.id=this.id+"_iframe";
this._iframeSrc=this._getIframeDocTxt(html);
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
this.onLoad();
this.savedContent=this.getValue(true);
});
var s="javascript:parent."+dijit._scopeName+".byId(\""+this.id+"\")._iframeSrc";
ifr.setAttribute("src",s);
this.editingArea.appendChild(ifr);
if(dojo.isWebKit){
setTimeout(function(){
ifr.setAttribute("src",s);
},0);
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
var _11f6=_cs.lineHeight;
if(_11f6.indexOf("px")>=0){
_11f6=parseFloat(_11f6)/parseFloat(_cs.fontSize);
}else{
if(_11f6.indexOf("em")>=0){
_11f6=parseFloat(_11f6);
}else{
_11f6="1.0";
}
}
var _11f7="";
this.style.replace(/(^|;)(line-|font-?)[^;]+/g,function(match){
_11f7+=match.replace(/^;/g,"")+";";
});
var d=dojo.doc;
var _11fa=d.charset||d.characterSet||d.defaultCharset||"UTF-8";
return [this.isLeftToRight()?"<html><head>":"<html dir='rtl'><head>",(dojo.isMoz?"<title>"+this._localizedIframeTitles.iframeEditTitle+"</title>":""),"<meta http-equiv='Content-Type' content='text/html; charset="+_11fa+"'>","<style>","body,html {","\tbackground:transparent;","\tpadding: 1em 0 0 0;","\tmargin: -1em 0 0 0;","}","body{","\ttop:0px; left:0px; right:0px;","\tfont:",font,";",((this.height||dojo.isOpera)?"":"position: fixed;"),"\tmin-height:",this.minHeight,";","\tline-height:",_11f6,"}","p{ margin: 1em 0 !important; }",(this.height?"":"body,html{overflow-y:hidden;/*for IE*/} body > div {overflow-x:auto;/*FF:horizontal scrollbar*/ overflow-y:hidden;/*safari*/ min-height:"+this.minHeight+";/*safari*/}"),"li > ul:-moz-first-node, li > ol:-moz-first-node{ padding-top: 1.2em; } ","li{ min-height:1.2em; }","</style>",this._applyEditingAreaStyleSheets(),"</head><body onload='frameElement._loadFunc(window,document)' style='"+_11f7+"'>"+html+"</body></html>"].join("");
},_drawIframe:function(html){
if(!this.iframe){
var ifr=(this.iframe=dojo.doc.createElement("iframe"));
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
ifr._loadFunc=function(win){
};
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
var _1200;
if(this.textarea){
_1200=this.srcNodeRef;
}else{
_1200=dojo.doc.createElement("div");
_1200.style.display="none";
_1200.innerHTML=html;
this.editingArea.appendChild(_1200);
}
this.editingArea.appendChild(this.iframe);
var _1201=dojo.hitch(this,function(){
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
setTimeout(_1201,50);
return;
}
var _1202=this.document;
_1202.open();
if(dojo.isAIR){
_1202.body.innerHTML=html;
}else{
_1202.write(this._getIframeDocTxt(html));
}
_1202.close();
dojo.destroy(_1200);
}
if(!this.document.body){
setTimeout(_1201,50);
return;
}
this.onLoad();
}else{
dojo.destroy(_1200);
this.editNode.innerHTML=html;
this.onDisplayChanged();
}
this._preDomFilterContent(this.editNode);
});
_1201();
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
var _1207=(new dojo._Url(dojo.global.location,url)).toString();
this.editingAreaStyleSheets.push(_1207);
text+="<link rel=\"stylesheet\" type=\"text/css\" href=\""+_1207+"\"/>";
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
var _120b=this.document.createElement("link");
_120b.rel="stylesheet";
_120b.type="text/css";
_120b.href=url;
head.appendChild(_120b);
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
},disabled:false,_mozSettingProps:{"styleWithCSS":false},_setDisabledAttr:function(value){
this.disabled=value;
if(!this.isLoaded){
return;
}
value=!!value;
if(dojo.isIE||dojo.isWebKit||dojo.isOpera){
var _1210=dojo.isIE&&(this.isLoaded||!this.focusOnLoad);
if(_1210){
this.editNode.unselectable="on";
}
this.editNode.contentEditable=!value;
if(_1210){
var _this=this;
setTimeout(function(){
_this.editNode.unselectable="off";
},0);
}
}else{
try{
this.document.designMode=(value?"off":"on");
}
catch(e){
return;
}
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
this._disabledOK=true;
},_isResized:function(){
return false;
},onLoad:function(e){
if(!this.window.__registeredWindow){
this.window.__registeredWindow=true;
dijit.registerIframe(this.iframe);
}
if(!dojo.isIE&&(this.height||dojo.isMoz)){
this.editNode=this.document.body;
}else{
this.editNode=this.document.body.firstChild;
var _this=this;
if(dojo.isIE){
var _1216=(this.tabStop=dojo.doc.createElement("<div tabIndex=-1>"));
this.editingArea.appendChild(_1216);
this.iframe.onfocus=function(){
_this.editNode.setActive();
};
}
}
this.focusNode=this.editNode;
this._preDomFilterContent(this.editNode);
var _1217=this.events.concat(this.captureEvents);
var ap=this.iframe?this.document:this.editNode;
dojo.forEach(_1217,function(item){
this.connect(ap,item.toLowerCase(),item);
},this);
if(dojo.isIE){
this.connect(this.document,"onmousedown","_onIEMouseDown");
this.editNode.style.zoom=1;
}
if(dojo.isWebKit){
this._webkitListener=this.connect(this.document,"onmouseup","onDisplayChanged");
}
this.isLoaded=true;
this.attr("disabled",this.disabled);
if(this.onLoadDeferred){
this.onLoadDeferred.callback(true);
}
this.onDisplayChanged(e);
if(this.focusOnLoad){
dojo.addOnLoad(dojo.hitch(this,function(){
setTimeout(dojo.hitch(this,"focus"),this.updateInterval);
}));
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
var _121b=dojo.isFF<3?this.iframe.contentDocument:this.iframe;
_121b.title=this._localizedIframeTitles.iframeFocusTitle;
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
},setDisabled:function(_121d){
dojo.deprecated("dijit.Editor::setDisabled is deprecated","use dijit.Editor::attr(\"disabled\",boolean) instead",2);
this.attr("disabled",_121d);
},_setValueAttr:function(value){
this.setValue(value);
},_getDisableSpellCheckAttr:function(){
return !dojo.attr(this.document.body,"spellcheck");
},_setDisableSpellCheckAttr:function(_121f){
if(this.document){
dojo.attr(this.document.body,"spellcheck",!_121f);
}else{
this.onLoadDeferred.addCallback(dojo.hitch(this,function(){
dojo.attr(this.document.body,"spellcheck",!_121f);
}));
}
},onKeyPress:function(e){
var c=(e.keyChar&&e.keyChar.toLowerCase())||e.keyCode;
var _1222=this._keyHandlers[c];
var args=arguments;
if(_1222&&!e.altKey){
dojo.forEach(_1222,function(h){
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
},addKeyHandler:function(key,ctrl,shift,_1228){
if(!dojo.isArray(this._keyHandlers[key])){
this._keyHandlers[key]=[];
}
this._keyHandlers[key].push({shift:shift||false,ctrl:ctrl||false,handler:_1228});
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
var _122d=dojo.isFF<3?this.iframe.contentDocument:this.iframe;
_122d.title=this._localizedIframeTitles.iframeEditTitle;
}
},_onFocus:function(e){
if(!this.disabled){
if(!this._disabledOK){
this.attr("disabled",false);
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
},onChange:function(_1230){
},_normalizeCommand:function(cmd){
var _1232=cmd.toLowerCase();
if(_1232=="formatblock"){
if(dojo.isSafari){
_1232="heading";
}
}else{
if(_1232=="hilitecolor"&&!dojo.isMoz){
_1232="backcolor";
}
}
return _1232;
},_qcaCache:{},queryCommandAvailable:function(_1233){
var ca=this._qcaCache[_1233];
if(ca!=undefined){
return ca;
}
return (this._qcaCache[_1233]=this._queryCommandAvailable(_1233));
},_queryCommandAvailable:function(_1235){
var ie=1;
var _1237=1<<1;
var _1238=1<<2;
var opera=1<<3;
var _123a=1<<4;
var gt420=dojo.isWebKit;
function _123c(_123d){
return {ie:Boolean(_123d&ie),mozilla:Boolean(_123d&_1237),webkit:Boolean(_123d&_1238),webkit420:Boolean(_123d&_123a),opera:Boolean(_123d&opera)};
};
var _123e=null;
switch(_1235.toLowerCase()){
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
_123e=_123c(_1237|ie|_1238|opera);
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
_123e=_123c(_1237|ie|opera|_123a);
break;
case "blockdirltr":
case "blockdirrtl":
case "dirltr":
case "dirrtl":
case "inlinedirltr":
case "inlinedirrtl":
_123e=_123c(ie);
break;
case "cut":
case "copy":
case "paste":
_123e=_123c(ie|_1237|_123a);
break;
case "inserttable":
_123e=_123c(_1237|ie);
break;
case "insertcell":
case "insertcol":
case "insertrow":
case "deletecells":
case "deletecols":
case "deleterows":
case "mergecells":
case "splitcell":
_123e=_123c(ie|_1237);
break;
default:
return false;
}
return (dojo.isIE&&_123e.ie)||(dojo.isMoz&&_123e.mozilla)||(dojo.isWebKit&&_123e.webkit)||(dojo.isWebKit>420&&_123e.webkit420)||(dojo.isOpera&&_123e.opera);
},execCommand:function(_123f,_1240){
var _1241;
this.focus();
_123f=this._normalizeCommand(_123f);
if(_1240!=undefined){
if(_123f=="heading"){
throw new Error("unimplemented");
}else{
if((_123f=="formatblock")&&dojo.isIE){
_1240="<"+_1240+">";
}
}
}
if(_123f=="inserthtml"){
_1240=this._preFilterContent(_1240);
_1241=true;
if(dojo.isIE){
var _1242=this.document.selection.createRange();
if(this.document.selection.type.toUpperCase()=="CONTROL"){
var n=_1242.item(0);
while(_1242.length){
_1242.remove(_1242.item(0));
}
n.outerHTML=_1240;
}else{
_1242.pasteHTML(_1240);
}
_1242.select();
}else{
if(dojo.isMoz&&!_1240.length){
this._sCall("remove");
}else{
_1241=this.document.execCommand(_123f,false,_1240);
}
}
}else{
if((_123f=="unlink")&&(this.queryCommandEnabled("unlink"))&&(dojo.isMoz||dojo.isWebKit)){
var a=this._sCall("getAncestorElement",["a"]);
this._sCall("selectElement",[a]);
_1241=this.document.execCommand("unlink",false,null);
}else{
if((_123f=="hilitecolor")&&(dojo.isMoz)){
this.document.execCommand("styleWithCSS",false,true);
_1241=this.document.execCommand(_123f,false,_1240);
this.document.execCommand("styleWithCSS",false,false);
}else{
if((dojo.isIE)&&((_123f=="backcolor")||(_123f=="forecolor"))){
_1240=arguments.length>1?_1240:null;
_1241=this.document.execCommand(_123f,false,_1240);
}else{
_1240=arguments.length>1?_1240:null;
if(_1240||_123f!="createlink"){
_1241=this.document.execCommand(_123f,false,_1240);
}
}
}
}
}
this.onDisplayChanged();
return _1241;
},queryCommandEnabled:function(_1245){
if(this.disabled||!this._disabledOK){
return false;
}
_1245=this._normalizeCommand(_1245);
if(dojo.isMoz||dojo.isWebKit){
if(_1245=="unlink"){
this._sCall("hasAncestorElement",["a"]);
}else{
if(_1245=="inserttable"){
return true;
}
}
}
if(dojo.isWebKit){
if(_1245=="copy"){
_1245="cut";
}else{
if(_1245=="paste"){
return true;
}
}
}
var elem=dojo.isIE?this.document.selection.createRange():this.document;
return elem.queryCommandEnabled(_1245);
},queryCommandState:function(_1247){
if(this.disabled||!this._disabledOK){
return false;
}
_1247=this._normalizeCommand(_1247);
return this.document.queryCommandState(_1247);
},queryCommandValue:function(_1248){
if(this.disabled||!this._disabledOK){
return false;
}
var r;
_1248=this._normalizeCommand(_1248);
if(dojo.isIE&&_1248=="formatblock"){
r=this._native2LocalFormatNames[this.document.queryCommandValue(_1248)];
}else{
r=this.document.queryCommandValue(_1248);
}
return r;
},_sCall:function(name,args){
return dojo.withGlobal(this.window,name,dijit._editor.selection,args);
},placeCursorAtStart:function(){
this.focus();
var _124c=false;
if(dojo.isMoz){
var first=this.editNode.firstChild;
while(first){
if(first.nodeType==3){
if(first.nodeValue.replace(/^\s+|\s+$/g,"").length>0){
_124c=true;
this._sCall("selectElement",[first]);
break;
}
}else{
if(first.nodeType==1){
_124c=true;
this._sCall("selectElementChildren",[first]);
break;
}
}
first=first.nextSibling;
}
}else{
_124c=true;
this._sCall("selectElementChildren",[this.editNode]);
}
if(_124c){
this._sCall("collapse",[true]);
}
},placeCursorAtEnd:function(){
this.focus();
var _124e=false;
if(dojo.isMoz){
var last=this.editNode.lastChild;
while(last){
if(last.nodeType==3){
if(last.nodeValue.replace(/^\s+|\s+$/g,"").length>0){
_124e=true;
this._sCall("selectElement",[last]);
break;
}
}else{
if(last.nodeType==1){
_124e=true;
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
_124e=true;
this._sCall("selectElementChildren",[this.editNode]);
}
if(_124e){
this._sCall("collapse",[false]);
}
},getValue:function(_1250){
if(this.textarea){
if(this.isClosed||!this.isLoaded){
return this.textarea.value;
}
}
return this._postFilterContent(null,_1250);
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
},_postFilterContent:function(dom,_125a){
var ec;
if(!dojo.isString(dom)){
dom=dom||this.editNode;
if(this.contentDomPostFilters.length){
if(_125a){
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
var _125f=dojo.byId(dijit._scopeName+"._editor.RichText.savedContent");
_125f.value+=this._SEPARATOR+this.name+":"+this.getValue();
},escapeXml:function(str,_1261){
str=str.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;");
if(!_1261){
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
var _1266=(this.savedContent!=this._content);
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
if(this.textarea){
var s=this.textarea.style;
s.position="";
s.left=s.top="";
if(dojo.isIE){
s.overflow=this.__overflow;
this.__overflow=null;
}
this.textarea.value=save?this._content:this.savedContent;
dojo.destroy(this.domNode);
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
return _1266;
},destroyRendering:function(){
},destroy:function(){
this.destroyRendering();
if(!this.isClosed){
this.close(false);
}
this.inherited(arguments);
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
if(!dojo._hasResource["dijit.ToolbarSeparator"]){
dojo._hasResource["dijit.ToolbarSeparator"]=true;
dojo.provide("dijit.ToolbarSeparator");
dojo.declare("dijit.ToolbarSeparator",[dijit._Widget,dijit._Templated],{templateString:"<div class=\"dijitToolbarSeparator dijitInline\"></div>",postCreate:function(){
dojo.setSelectable(this.domNode,false);
},isFocusable:function(){
return false;
}});
}
if(!dojo._hasResource["dijit.Toolbar"]){
dojo._hasResource["dijit.Toolbar"]=true;
dojo.provide("dijit.Toolbar");
dojo.declare("dijit.Toolbar",[dijit._Widget,dijit._Templated,dijit._KeyNavContainer],{templateString:"<div class=\"dijit dijitToolbar\" waiRole=\"toolbar\" tabIndex=\"${tabIndex}\" dojoAttachPoint=\"containerNode\">"+"</div>",postCreate:function(){
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
if(args){
dojo.mixin(this,args);
}
this._connects=[];
},editor:null,iconClassPrefix:"dijitEditorIcon",button:null,queryCommand:null,command:"",commandArg:null,useDefaultCommand:true,buttonClass:dijit.form.Button,getLabel:function(key){
return this.editor.commands[key];
},_initButton:function(props){
if(this.command.length){
var label=this.getLabel(this.command);
var _1271=this.iconClassPrefix+" "+this.iconClassPrefix+this.command.charAt(0).toUpperCase()+this.command.substr(1);
if(!this.button){
props=dojo.mixin({label:label,showLabel:false,iconClass:_1271,dropDown:this.dropDown,tabIndex:"-1"},props||{});
this.button=new this.buttonClass(props);
}
}
},destroy:function(f){
dojo.forEach(this._connects,dojo.disconnect);
if(this.dropDown){
this.dropDown.destroyRecursive();
}
},connect:function(o,f,tf){
this._connects.push(dojo.connect(o,f,this,tf));
},updateState:function(){
var e=this.editor,c=this.command,_1278,_1279;
if(!e||!e.isLoaded||!c.length){
return;
}
if(this.button){
try{
_1279=e.queryCommandEnabled(c);
if(this.enabled!==_1279){
this.enabled=_1279;
this.button.attr("disabled",!_1279);
}
if(typeof this.button.checked=="boolean"){
_1278=e.queryCommandState(c);
if(this.checked!==_1278){
this.checked=_1278;
this.button.attr("checked",e.queryCommandState(c));
}
}
}
catch(e){
console.log(e);
}
}
},setEditor:function(_127a){
this.editor=_127a;
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
},setToolbar:function(_127b){
if(this.button){
_127b.addChild(this.button);
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
},setEditor:function(_127d){
this.editor=_127d;
if(this.blockNodeForEnter=="BR"){
if(dojo.isIE){
_127d.contentDomPreFilters.push(dojo.hitch(this,"regularPsToSingleLinePs"));
_127d.contentDomPostFilters.push(dojo.hitch(this,"singleLinePsToRegularPs"));
_127d.onLoadDeferred.addCallback(dojo.hitch(this,"_fixNewLineBehaviorForIE"));
}else{
_127d.onLoadDeferred.addCallback(dojo.hitch(this,function(d){
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
_127d.addKeyHandler(13,0,0,h);
_127d.addKeyHandler(13,0,1,h);
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
var _1284=dojo.withGlobal(this.editor.window,"getAncestorElement",dijit._editor.selection,["LI"]);
if(!_1284){
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
if(_1284.parentNode.parentNode.nodeName=="LI"){
_1284=_1284.parentNode.parentNode;
}
}
var fc=_1284.firstChild;
if(fc&&fc.nodeType==1&&(fc.nodeName=="UL"||fc.nodeName=="OL")){
_1284.insertBefore(fc.ownerDocument.createTextNode(" "),fc);
var _1288=dijit.range.create();
_1288.setStart(_1284.firstChild,0);
var _1289=dijit.range.getSelection(this.editor.window,true);
_1289.removeAllRanges();
_1289.addRange(_1288);
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
var _128b,range,_128d,doc=this.editor.document,br;
if(e.shiftKey||this.blockNodeForEnter=="BR"){
var _1290=dojo.withGlobal(this.editor.window,"getParentElement",dijit._editor.selection);
var _1291=dijit.range.getAncestor(_1290,this.blockNodes);
if(_1291){
if(!e.shiftKey&&_1291.tagName=="LI"){
return true;
}
_128b=dijit.range.getSelection(this.editor.window);
range=_128b.getRangeAt(0);
if(!range.collapsed){
range.deleteContents();
}
if(dijit.range.atBeginningOfContainer(_1291,range.startContainer,range.startOffset)){
if(e.shiftKey){
br=doc.createElement("br");
_128d=dijit.range.create();
_1291.insertBefore(br,_1291.firstChild);
_128d.setStartBefore(br.nextSibling);
_128b.removeAllRanges();
_128b.addRange(_128d);
}else{
dojo.place(br,_1291,"before");
}
}else{
if(dijit.range.atEndOfContainer(_1291,range.startContainer,range.startOffset)){
_128d=dijit.range.create();
br=doc.createElement("br");
if(e.shiftKey){
_1291.appendChild(br);
_1291.appendChild(doc.createTextNode(" "));
_128d.setStart(_1291.lastChild,0);
}else{
dojo.place(br,_1291,"after");
_128d.setStartAfter(_1291);
}
_128b.removeAllRanges();
_128b.addRange(_128d);
}else{
return true;
}
}
}else{
dijit._editor.RichText.prototype.execCommand.call(this.editor,"inserthtml","<br>");
}
return false;
}
var _1292=true;
_128b=dijit.range.getSelection(this.editor.window);
range=_128b.getRangeAt(0);
if(!range.collapsed){
range.deleteContents();
}
var block=dijit.range.getBlockAncestor(range.endContainer,null,this.editor.editNode);
var _1294=block.blockNode;
if((this._checkListLater=(_1294&&(_1294.nodeName=="LI"||_1294.parentNode.nodeName=="LI")))){
if(dojo.isMoz){
this._pressedEnterInBlock=_1294;
}
if(/^(?:\s|&nbsp;)$/.test(_1294.innerHTML)){
_1294.innerHTML="";
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
_128b=dijit.range.getSelection(this.editor.window);
range=_128b.getRangeAt(0);
}
var _1295=doc.createElement(this.blockNodeForEnter);
_1295.innerHTML=this.bogusHtmlContent;
this.removeTrailingBr(block.blockNode);
if(dijit.range.atEndOfContainer(block.blockNode,range.endContainer,range.endOffset)){
if(block.blockNode===block.blockContainer){
block.blockNode.appendChild(_1295);
}else{
dojo.place(_1295,block.blockNode,"after");
}
_1292=false;
_128d=dijit.range.create();
_128d.setStart(_1295,0);
_128b.removeAllRanges();
_128b.addRange(_128d);
if(this.editor.height){
_1295.scrollIntoView(false);
}
}else{
if(dijit.range.atBeginningOfContainer(block.blockNode,range.startContainer,range.startOffset)){
dojo.place(_1295,block.blockNode,block.blockNode===block.blockContainer?"first":"before");
if(_1295.nextSibling&&this.editor.height){
_1295.nextSibling.scrollIntoView(false);
}
_1292=false;
}else{
if(dojo.isMoz){
this._pressedEnterInBlock=block.blockNode;
}
}
}
return _1292;
},removeTrailingBr:function(_1296){
var para=/P|DIV|LI/i.test(_1296.tagName)?_1296:dijit._editor.selection.getParentOfType(_1296,["P","DIV","LI"]);
if(!para){
return;
}
if(para.lastChild){
if((para.childNodes.length>1&&para.lastChild.nodeType==3&&/^[\s\xAD]*$/.test(para.lastChild.nodeValue))||(para.lastChild&&para.lastChild.tagName=="BR")){
dojo.destroy(para.lastChild);
}
}
if(!para.childNodes.length){
para.innerHTML=this.bogusHtmlContent;
}
},_fixNewLineBehaviorForIE:function(d){
if(this.editor.document.__INSERTED_EDITIOR_NEWLINE_CSS===undefined){
var _1299="p{margin:0 !important;}";
var _129a=function(_129b,doc,URI){
if(!_129b){
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
var _12a0=function(){
try{
style.styleSheet.cssText=_129b;
}
catch(e){
console.debug(e);
}
};
if(style.styleSheet.disabled){
setTimeout(_12a0,10);
}else{
_12a0();
}
}else{
var _12a1=doc.createTextNode(_129b);
style.appendChild(_12a1);
}
return style;
};
_129a(_1299,this.editor.document);
this.editor.document.__INSERTED_EDITIOR_NEWLINE_CSS=true;
return d;
}
return null;
},regularPsToSingleLinePs:function(_12a2,_12a3){
function _12a4(el){
function _12a6(nodes){
var newP=nodes[0].ownerDocument.createElement("p");
nodes[0].parentNode.insertBefore(newP,nodes[0]);
dojo.forEach(nodes,function(node){
newP.appendChild(node);
});
};
var _12aa=0;
var _12ab=[];
var _12ac;
while(_12aa<el.childNodes.length){
_12ac=el.childNodes[_12aa];
if(_12ac.nodeType==3||(_12ac.nodeType==1&&_12ac.nodeName!="BR"&&dojo.style(_12ac,"display")!="block")){
_12ab.push(_12ac);
}else{
var _12ad=_12ac.nextSibling;
if(_12ab.length){
_12a6(_12ab);
_12aa=(_12aa+1)-_12ab.length;
if(_12ac.nodeName=="BR"){
dojo.destroy(_12ac);
}
}
_12ab=[];
}
_12aa++;
}
if(_12ab.length){
_12a6(_12ab);
}
};
function _12ae(el){
var _12b0=null;
var _12b1=[];
var _12b2=el.childNodes.length-1;
for(var i=_12b2;i>=0;i--){
_12b0=el.childNodes[i];
if(_12b0.nodeName=="BR"){
var newP=_12b0.ownerDocument.createElement("p");
dojo.place(newP,el,"after");
if(_12b1.length==0&&i!=_12b2){
newP.innerHTML="&nbsp;";
}
dojo.forEach(_12b1,function(node){
newP.appendChild(node);
});
dojo.destroy(_12b0);
_12b1=[];
}else{
_12b1.unshift(_12b0);
}
}
};
var pList=[];
var ps=_12a2.getElementsByTagName("p");
dojo.forEach(ps,function(p){
pList.push(p);
});
dojo.forEach(pList,function(p){
if((p.previousSibling)&&(p.previousSibling.nodeName=="P"||dojo.style(p.previousSibling,"display")!="block")){
var newP=p.parentNode.insertBefore(this.document.createElement("p"),p);
newP.innerHTML=_12a3?"":"&nbsp;";
}
_12ae(p);
},this.editor);
_12a4(_12a2);
return _12a2;
},singleLinePsToRegularPs:function(_12bb){
function _12bc(node){
var ps=node.getElementsByTagName("p");
var _12bf=[];
for(var i=0;i<ps.length;i++){
var p=ps[i];
var _12c2=false;
for(var k=0;k<_12bf.length;k++){
if(_12bf[k]===p.parentNode){
_12c2=true;
break;
}
}
if(!_12c2){
_12bf.push(p.parentNode);
}
}
return _12bf;
};
function _12c4(node){
if(node.nodeType!=1||node.tagName!="P"){
return dojo.style(node,"display")=="block";
}else{
if(!node.childNodes.length||node.innerHTML=="&nbsp;"){
return true;
}
}
return false;
};
var _12c6=_12bc(_12bb);
for(var i=0;i<_12c6.length;i++){
var _12c8=_12c6[i];
var _12c9=null;
var node=_12c8.firstChild;
var _12cb=null;
while(node){
if(node.nodeType!="1"||node.tagName!="P"){
_12c9=null;
}else{
if(_12c4(node)){
_12cb=node;
_12c9=null;
}else{
if(_12c9==null){
_12c9=node;
}else{
if((!_12c9.lastChild||_12c9.lastChild.nodeName!="BR")&&(node.firstChild)&&(node.firstChild.nodeName!="BR")){
_12c9.appendChild(this.editor.document.createElement("br"));
}
while(node.firstChild){
_12c9.appendChild(node.firstChild);
}
_12cb=node;
}
}
}
node=node.nextSibling;
if(_12cb){
dojo.destroy(_12cb);
_12cb=null;
}
}
}
return _12bb;
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
this.toolbar.destroyRecursive();
delete this.toolbar;
this.inherited(arguments);
},addPlugin:function(_12cd,index){
var args=dojo.isString(_12cd)?{name:_12cd}:_12cd;
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
console.warn("Cannot find plugin",_12cd);
return;
}
_12cd=o.plugin;
}
if(arguments.length>1){
this._plugins[index]=_12cd;
}else{
this._plugins.push(_12cd);
}
_12cd.setEditor(this);
if(dojo.isFunction(_12cd.setToolbar)){
_12cd.setToolbar(this.toolbar);
}
},startup:function(){
},resize:function(size){
dijit.layout._LayoutWidget.prototype.resize.apply(this,arguments);
},layout:function(){
this.editingArea.style.height=(this._contentBox.h-dojo.marginBox(this.toolbar.domNode).h)+"px";
if(this.iframe){
this.iframe.style.height="100%";
}
this._layoutMode=true;
},_onIEMouseDown:function(e){
delete this._savedSelection;
if(e.target.tagName=="BODY"){
setTimeout(dojo.hitch(this,"placeCursorAtEnd"),0);
}
this.inherited(arguments);
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
if(dojo.isWebKit&&cmd=="paste"&&!r){
throw {code:1011};
}
}
catch(e){
if(e.code==1011&&/copy|cut|paste/.test(cmd)){
var sub=dojo.string.substitute,accel={cut:"X",copy:"C",paste:"V"},isMac=navigator.userAgent.indexOf("Macintosh")!=-1;
alert(sub(this.commands.systemShortcut,[this.commands[cmd],sub(this.commands[isMac?"appleKey":"ctrlKey"],[accel[cmd]])]));
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
var _12dc=0;
if(this._savedSelection&&dojo.isIE){
_12dc=dijit._curFocus!=this.editNode;
}
this.inherited(arguments);
if(_12dc){
this._restoreSelection();
}
},_moveToBookmark:function(b){
var _12de=b;
if(dojo.isIE){
if(dojo.isArray(b)){
_12de=[];
dojo.forEach(b,function(n){
_12de.push(dijit.range.getNode(n,this.editNode));
},this);
}
}else{
var r=dijit.range.create();
r.setStart(dijit.range.getNode(b.startContainer,this.editNode),b.startOffset);
r.setEnd(dijit.range.getNode(b.endContainer,this.editNode),b.endOffset);
_12de=r;
}
dojo.withGlobal(this.window,"moveToBookmark",dijit,[_12de]);
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
},endEditing:function(_12e6){
if(this._editTimer){
clearTimeout(this._editTimer);
}
if(this._inEditing){
this._endEditing(_12e6);
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
},_endEditing:function(_12eb){
var v=this.getValue(true);
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
this.inherited("_onBlur",arguments);
this.endEditing(true);
},_saveSelection:function(){
this._savedSelection=this._getBookmark();
},_restoreSelection:function(){
if(this._savedSelection){
if(dojo.withGlobal(this.window,"isCollapsed",dijit)){
this._moveToBookmark(this._savedSelection);
}
delete this._savedSelection;
}
},_onFocus:function(){
setTimeout(dojo.hitch(this,"_restoreSelection"),0);
this.inherited(arguments);
},onClick:function(){
this.endEditing(true);
this.inherited(arguments);
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
dojo.declare("dojox.grid.cells._Widget",dgc._Base,{widgetClass:dijit.form.TextBox,constructor:function(_12f6){
this.widget=null;
if(typeof this.widgetClass=="string"){
dojo.deprecated("Passing a string to widgetClass is deprecated","pass the widget class object instead","2.0");
this.widgetClass=dojo.getObject(this.widgetClass);
}
},formatEditing:function(_12f7,_12f8){
this.needFormatNode(_12f7,_12f8);
return "<div></div>";
},getValue:function(_12f9){
return this.widget.attr("value");
},setValue:function(_12fa,_12fb){
if(this.widget&&this.widget.attr){
if(this.widget.onLoadDeferred){
var self=this;
this.widget.onLoadDeferred.addCallback(function(){
self.widget.attr("value",_12fb==null?"":_12fb);
});
}else{
this.widget.attr("value",_12fb);
}
}else{
this.inherited(arguments);
}
},getWidgetProps:function(_12fd){
return dojo.mixin({},this.widgetProps||{},{constraints:dojo.mixin({},this.constraint)||{},value:_12fd});
},createWidget:function(_12fe,_12ff,_1300){
return new this.widgetClass(this.getWidgetProps(_12ff),_12fe);
},attachWidget:function(_1301,_1302,_1303){
_1301.appendChild(this.widget.domNode);
this.setValue(_1303,_1302);
},formatNode:function(_1304,_1305,_1306){
if(!this.widgetClass){
return _1305;
}
if(!this.widget){
this.widget=this.createWidget.apply(this,arguments);
}else{
this.attachWidget.apply(this,arguments);
}
this.sizeWidget.apply(this,arguments);
this.grid.rowHeightChanged(_1306);
this.focus();
},sizeWidget:function(_1307,_1308,_1309){
var p=this.getNode(_1309),box=dojo.contentBox(p);
dojo.marginBox(this.widget.domNode,{w:box.w});
},focus:function(_130c,_130d){
if(this.widget){
setTimeout(dojo.hitch(this.widget,function(){
dojox.grid.util.fire(this,"focus");
}),0);
}
},_finish:function(_130e){
this.inherited(arguments);
dojox.grid.util.removeNode(this.widget.domNode);
}});
dgc._Widget.markupFactory=function(node,cell){
dgc._Base.markupFactory(node,cell);
var d=dojo;
var _1312=d.trim(d.attr(node,"widgetProps")||"");
var _1313=d.trim(d.attr(node,"constraint")||"");
var _1314=d.trim(d.attr(node,"widgetClass")||"");
if(_1312){
cell.widgetProps=d.fromJson(_1312);
}
if(_1313){
cell.constraint=d.fromJson(_1313);
}
if(_1314){
cell.widgetClass=d.getObject(_1314);
}
};
dojo.declare("dojox.grid.cells.ComboBox",dgc._Widget,{widgetClass:dijit.form.ComboBox,getWidgetProps:function(_1315){
var items=[];
dojo.forEach(this.options,function(o){
items.push({name:o,value:o});
});
var store=new dojo.data.ItemFileReadStore({data:{identifier:"name",items:items}});
return dojo.mixin({},this.widgetProps||{},{value:_1315,store:store});
},getValue:function(){
var e=this.widget;
e.attr("displayedValue",e.attr("displayedValue"));
return e.attr("value");
}});
dgc.ComboBox.markupFactory=function(node,cell){
dgc._Widget.markupFactory(node,cell);
var d=dojo;
var _131d=d.trim(d.attr(node,"options")||"");
if(_131d){
var o=_131d.split(",");
if(o[0]!=_131d){
cell.options=o;
}
}
};
dojo.declare("dojox.grid.cells.DateTextBox",dgc._Widget,{widgetClass:dijit.form.DateTextBox,setValue:function(_131f,_1320){
if(this.widget){
this.widget.attr("value",new Date(_1320));
}else{
this.inherited(arguments);
}
},getWidgetProps:function(_1321){
return dojo.mixin(this.inherited(arguments),{value:new Date(_1321)});
}});
dgc.DateTextBox.markupFactory=function(node,cell){
dgc._Widget.markupFactory(node,cell);
};
dojo.declare("dojox.grid.cells.CheckBox",dgc._Widget,{widgetClass:dijit.form.CheckBox,getValue:function(){
return this.widget.checked;
},setValue:function(_1324,_1325){
if(this.widget&&this.widget.attributeMap.checked){
this.widget.attr("checked",_1325);
}else{
this.inherited(arguments);
}
},sizeWidget:function(_1326,_1327,_1328){
return;
}});
dgc.CheckBox.markupFactory=function(node,cell){
dgc._Widget.markupFactory(node,cell);
};
dojo.declare("dojox.grid.cells.Editor",dgc._Widget,{widgetClass:dijit.Editor,getWidgetProps:function(_132b){
return dojo.mixin({},this.widgetProps||{},{height:this.widgetHeight||"100px"});
},createWidget:function(_132c,_132d,_132e){
var _132f=new this.widgetClass(this.getWidgetProps(_132d),_132c);
dojo.connect(_132f,"onLoad",dojo.hitch(this,"populateEditor"));
return _132f;
},formatNode:function(_1330,_1331,_1332){
this.content=_1331;
this.inherited(arguments);
if(dojo.isMoz){
var e=this.widget;
e.open();
if(this.widgetToolbar){
dojo.place(e.toolbar.domNode,e.editingArea,"before");
}
}
},populateEditor:function(){
this.widget.attr("value",this.content);
this.widget.placeCursorAtEnd();
}});
dgc.Editor.markupFactory=function(node,cell){
dgc._Widget.markupFactory(node,cell);
var d=dojo;
var h=dojo.trim(dojo.attr(node,"widgetHeight")||"");
if(h){
if((h!="auto")&&(h.substr(-2)!="em")){
h=parseInt(h)+"px";
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
var _1338={ELEMENT:1,ATTRIBUTE:2,TEXT:3,CDATA_SECTION:4,PROCESSING_INSTRUCTION:7,COMMENT:8,DOCUMENT:9};
var _1339=/<([^>\/\s+]*)([^>]*)>([^<]*)/g;
var _133a=/([^=]*)=(("([^"]*)")|('([^']*)'))/g;
var _133b=/<!ENTITY\s+([^"]*)\s+"([^"]*)">/g;
var _133c=/<!\[CDATA\[([\u0001-\uFFFF]*?)\]\]>/g;
var _133d=/<!--([\u0001-\uFFFF]*?)-->/g;
var trim=/^\s+|\s+$/g;
var _133f=/\s+/g;
var egt=/\&gt;/g;
var elt=/\&lt;/g;
var equot=/\&quot;/g;
var eapos=/\&apos;/g;
var eamp=/\&amp;/g;
var dNs="_def_";
function _doc(){
return new (function(){
var all={};
this.nodeType=_1338.DOCUMENT;
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
this.byName=this.getElementsByTagName=_134b;
this.byNameNS=this.getElementsByTagNameNS=_134c;
this.childrenByName=_134d;
this.childrenByNameNS=_134e;
})();
};
function _134b(name){
function __(node,name,arr){
dojo.forEach(node.childNodes,function(c){
if(c.nodeType==_1338.ELEMENT){
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
function _134c(name,ns){
function __(node,name,ns,arr){
dojo.forEach(node.childNodes,function(c){
if(c.nodeType==_1338.ELEMENT){
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
function _134d(name){
var a=[];
dojo.forEach(this.childNodes,function(c){
if(c.nodeType==_1338.ELEMENT){
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
function _134e(name,ns){
var a=[];
dojo.forEach(this.childNodes,function(c){
if(c.nodeType==_1338.ELEMENT){
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
function _1366(v){
return {nodeType:_1338.TEXT,nodeName:"#text",nodeValue:v.replace(_133f," ").replace(egt,">").replace(elt,"<").replace(eapos,"'").replace(equot,"\"").replace(eamp,"&")};
};
function _1368(name){
for(var i=0;i<this.attributes.length;i++){
if(this.attributes[i].nodeName==name){
return this.attributes[i].nodeValue;
}
}
return null;
};
function _136b(name,ns){
for(var i=0;i<this.attributes.length;i++){
if(this.ownerDocument._nsPaths[ns]==this.attributes[i].namespace&&this.attributes[i].localName==name){
return this.attributes[i].nodeValue;
}
}
return null;
};
function _136f(name,val){
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
function _1374(name,val,ns){
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
var _1381,eRe=[];
if(_133b.test(str)){
_133b.lastIndex=0;
while((_1381=_133b.exec(str))!=null){
eRe.push({entity:"&"+_1381[1].replace(trim,"")+";",expression:_1381[2]});
}
for(var i=0;i<eRe.length;i++){
str=str.replace(new RegExp(eRe[i].entity,"g"),eRe[i].expression);
}
}
}
var _1384=[],cdata;
while((cdata=_133c.exec(str))!=null){
_1384.push(cdata[1]);
}
for(var i=0;i<_1384.length;i++){
str=str.replace(_1384[i],i);
}
var _1386=[],_1387;
while((_1387=_133d.exec(str))!=null){
_1386.push(_1387[1]);
}
for(i=0;i<_1386.length;i++){
str=str.replace(_1386[i],i);
}
var res,obj=root;
while((res=_1339.exec(str))!=null){
if(res[2].charAt(0)=="/"&&res[2].replace(trim,"").length>1){
if(obj.parentNode){
obj=obj.parentNode;
}
var text=(res[3]||"").replace(trim,"");
if(text.length>0){
obj.childNodes.push(_1366(text));
}
}else{
if(res[1].length>0){
if(res[1].charAt(0)=="?"){
var name=res[1].substr(1);
var _138c=res[2].substr(0,res[2].length-2);
obj.childNodes.push({nodeType:_1338.PROCESSING_INSTRUCTION,nodeName:name,nodeValue:_138c});
}else{
if(res[1].charAt(0)=="!"){
if(res[1].indexOf("![CDATA[")==0){
var val=parseInt(res[1].replace("![CDATA[","").replace("]]",""));
obj.childNodes.push({nodeType:_1338.CDATA_SECTION,nodeName:"#cdata-section",nodeValue:_1384[val]});
}else{
if(res[1].substr(0,3)=="!--"){
var val=parseInt(res[1].replace("!--","").replace("--",""));
obj.childNodes.push({nodeType:_1338.COMMENT,nodeName:"#comment",nodeValue:_1386[val]});
}
}
}else{
var name=res[1].replace(trim,"");
var o={nodeType:_1338.ELEMENT,nodeName:name,localName:name,namespace:dNs,ownerDocument:root,attributes:[],parentNode:null,childNodes:[]};
if(name.indexOf(":")>-1){
var t=name.split(":");
o.namespace=t[0];
o.localName=t[1];
}
o.byName=o.getElementsByTagName=_134b;
o.byNameNS=o.getElementsByTagNameNS=_134c;
o.childrenByName=_134d;
o.childrenByNameNS=_134e;
o.getAttribute=_1368;
o.getAttributeNS=_136b;
o.setAttribute=_136f;
o.setAttributeNS=_1374;
o.previous=o.previousSibling=prev;
o.next=o.nextSibling=next;
var attr;
while((attr=_133a.exec(res[2]))!=null){
if(attr.length>0){
var name=attr[1].replace(trim,"");
var val=(attr[4]||attr[6]||"").replace(_133f," ").replace(egt,">").replace(elt,"<").replace(eapos,"'").replace(equot,"\"").replace(eamp,"&");
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
o.attributes.push({nodeType:_1338.ATTRIBUTE,nodeName:name,localName:ln,namespace:ns,nodeValue:val});
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
obj.childNodes.push(_1366(text));
}
}
}
}
}
}
for(var i=0;i<root.childNodes.length;i++){
var e=root.childNodes[i];
if(e.nodeType==_1338.ELEMENT){
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
this.appendArray=function(_139b){
return this.append.apply(this,_139b);
};
this.clear=function(){
b="";
this.length=0;
return this;
};
this.replace=function(_139c,_139d){
b=b.replace(_139c,_139d);
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
dojox.string.tokenize=function(str,re,_13a4,_13a5){
var _13a6=[];
var match,_13a8,_13a9=0;
while(match=re.exec(str)){
_13a8=str.slice(_13a9,re.lastIndex-match[0].length);
if(_13a8.length){
_13a6.push(_13a8);
}
if(_13a4){
if(dojo.isOpera){
var copy=match.slice(0);
while(copy.length<match.length){
copy.push(null);
}
match=copy;
}
var _13ab=_13a4.apply(_13a5,match.slice(1).concat(_13a6.length));
if(typeof _13ab!="undefined"){
_13a6.push(_13ab);
}
}
_13a9=re.lastIndex;
}
_13a8=str.slice(_13a9);
if(_13a8.length){
_13a6.push(_13a8);
}
return _13a6;
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
dojo._mixin(this,dict||{});
this._dicts=[];
},{push:function(){
var last=this;
var _13af=dojo.delegate(this);
_13af.pop=function(){
return last;
};
return _13af;
},pop:function(){
throw new Error("pop() called on empty Context");
},get:function(key,_13b1){
if(typeof this[key]!="undefined"){
return this._normalize(this[key]);
}
for(var i=0,dict;dict=this._dicts[i];i++){
if(typeof dict[key]!="undefined"){
return this._normalize(dict[key]);
}
}
return _13b1;
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
var _13b6=this.push();
if(dict){
dojo._mixin(this,dict);
}
return _13b6;
}});
var _13b7=/("(?:[^"\\]*(?:\\.[^"\\]*)*)"|'(?:[^'\\]*(?:\\.[^'\\]*)*)'|[^\s]+)/g;
var _13b8=/\s+/g;
var split=function(_13ba,limit){
_13ba=_13ba||_13b8;
if(!(_13ba instanceof RegExp)){
_13ba=new RegExp(_13ba,"g");
}
if(!_13ba.global){
throw new Error("You must use a globally flagged RegExp with split "+_13ba);
}
_13ba.exec("");
var part,parts=[],_13be=0,i=0;
while(part=_13ba.exec(this)){
parts.push(this.slice(_13be,_13ba.lastIndex-part[0].length));
_13be=_13ba.lastIndex;
if(limit&&(++i>limit-1)){
break;
}
}
parts.push(this.slice(_13be));
return parts;
};
dd.Token=function(_13c0,_13c1){
this.token_type=_13c0;
this.contents=new String(dojo.trim(_13c1));
this.contents.split=split;
this.split=function(){
return String.prototype.split.apply(this.contents,arguments);
};
};
dd.Token.prototype.split_contents=function(limit){
var bit,bits=[],i=0;
limit=limit||999;
while(i++<limit&&(bit=_13b7.exec(this.contents))){
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
var ddt=dd.text={_get:function(_13c7,name,_13c9){
var _13ca=dd.register.get(_13c7,name.toLowerCase(),_13c9);
if(!_13ca){
if(!_13c9){
throw new Error("No tag found for "+name);
}
return null;
}
var fn=_13ca[1];
var _13cc=_13ca[2];
var parts;
if(fn.indexOf(":")!=-1){
parts=fn.split(":");
fn=parts.pop();
}
dojo["require"](_13cc);
var _13ce=dojo.getObject(_13cc);
return _13ce[fn||name]||_13ce[name+"_"]||_13ce[fn+"_"];
},getTag:function(name,_13d0){
return ddt._get("tag",name,_13d0);
},getFilter:function(name,_13d2){
return ddt._get("filter",name,_13d2);
},getTemplate:function(file){
return new dd.Template(ddt.getTemplateString(file));
},getTemplateString:function(file){
return dojo._getText(file.toString())||"";
},_resolveLazy:function(_13d5,sync,json){
if(sync){
if(json){
return dojo.fromJson(dojo._getText(_13d5))||{};
}else{
return dd.text.getTemplateString(_13d5);
}
}else{
return dojo.xhrGet({handleAs:(json)?"json":"text",url:_13d5});
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
dd.Template=dojo.extend(function(_13e6,_13e7){
var str=_13e7?_13e6:ddt._resolveTemplateArg(_13e6,true)||"";
var _13e9=ddt.tokenize(str);
var _13ea=new dd._Parser(_13e9);
this.nodelist=_13ea.parse();
},{update:function(node,_13ec){
return ddt._resolveContextArg(_13ec).addCallback(this,function(_13ed){
var _13ee=this.render(new dd._Context(_13ed));
if(node.forEach){
node.forEach(function(item){
item.innerHTML=_13ee;
});
}else{
dojo.byId(node).innerHTML=_13ee;
}
return this;
});
},render:function(_13f0,_13f1){
_13f1=_13f1||this.getBuffer();
_13f0=_13f0||new dd._Context({});
return this.nodelist.render(_13f0,_13f1)+"";
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
dd._QuickNodeList=dojo.extend(function(_13f5){
this.contents=_13f5;
},{render:function(_13f6,_13f7){
for(var i=0,l=this.contents.length;i<l;i++){
if(this.contents[i].resolve){
_13f7=_13f7.concat(this.contents[i].resolve(_13f6));
}else{
_13f7=_13f7.concat(this.contents[i]);
}
}
return _13f7;
},dummyRender:function(_13fa){
return this.render(_13fa,dd.Template.prototype.getBuffer()).toString();
},clone:function(_13fb){
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
},resolve:function(_1404){
if(typeof this.key=="undefined"){
return "";
}
var str=this.resolvePath(this.key,_1404);
for(var i=0,_1407;_1407=this.filters[i];i++){
if(_1407[1]){
if(_1407[1][0]){
str=_1407[0](str,this.resolvePath(_1407[1][1],_1404));
}else{
str=_1407[0](str,_1407[1][1]);
}
}else{
str=_1407[0](str);
}
}
return str;
},resolvePath:function(path,_1409){
var _140a,parts;
var first=path.charAt(0);
var last=path.slice(-1);
if(!isNaN(parseInt(first))){
_140a=(path.indexOf(".")==-1)?parseInt(path):parseFloat(path);
}else{
if(first=="\""&&first==last){
_140a=path.slice(1,-1);
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
_140a=_1409.get(parts[0]);
if(dojo.isFunction(_140a)){
var self=_1409.getThis&&_1409.getThis();
if(_140a.alters_data){
_140a="";
}else{
if(self){
_140a=_140a.call(self);
}else{
_140a="";
}
}
}
for(var i=1;i<parts.length;i++){
var part=parts[i];
if(_140a){
var base=_140a;
if(dojo.isObject(_140a)&&part=="items"&&typeof _140a[part]=="undefined"){
var items=[];
for(var key in _140a){
items.push([key,_140a[key]]);
}
_140a=items;
continue;
}
if(_140a.get&&dojo.isFunction(_140a.get)&&_140a.get.safe){
_140a=_140a.get(part);
}else{
if(typeof _140a[part]=="undefined"){
_140a=_140a[part];
break;
}else{
_140a=_140a[part];
}
}
if(dojo.isFunction(_140a)){
if(_140a.alters_data){
_140a="";
}else{
_140a=_140a.call(base);
}
}else{
if(_140a instanceof Date){
_140a=dd._Context.prototype._normalize(_140a);
}
}
}else{
return "";
}
}
}
}
return _140a;
}});
dd._TextNode=dd._Node=dojo.extend(function(obj){
this.contents=obj;
},{set:function(data){
this.contents=data;
return this;
},render:function(_1416,_1417){
return _1417.concat(this.contents);
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
},render:function(_141b,_141c){
for(var i=0;i<this.contents.length;i++){
_141c=this.contents[i].render(_141b,_141c);
if(!_141c){
throw new Error("Template must return buffer");
}
}
return _141c;
},dummyRender:function(_141e){
return this.render(_141e,dd.Template.prototype.getBuffer()).toString();
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
},{render:function(_1420,_1421){
var str=this.contents.resolve(_1420);
if(!str.safe){
str=dd._base.escape(""+str);
}
return _1421.concat(str);
}});
dd._noOpNode=new function(){
this.render=this.unrender=function(){
return arguments[1];
};
this.clone=function(){
return this;
};
};
dd._Parser=dojo.extend(function(_1423){
this.contents=_1423;
},{i:0,parse:function(_1424){
var _1425={};
_1424=_1424||[];
for(var i=0;i<_1424.length;i++){
_1425[_1424[i]]=true;
}
var _1427=new dd._NodeList();
while(this.i<this.contents.length){
token=this.contents[this.i++];
if(typeof token=="string"){
_1427.push(new dd._TextNode(token));
}else{
var type=token[0];
var text=token[1];
if(type==dd.TOKEN_VAR){
_1427.push(new dd._VarNode(text));
}else{
if(type==dd.TOKEN_BLOCK){
if(_1425[text]){
--this.i;
return _1427;
}
var cmd=text.split(/\s+/g);
if(cmd.length){
cmd=cmd[0];
var fn=ddt.getTag(cmd);
if(fn){
_1427.push(fn(this,new dd.Token(type,text)));
}
}
}
}
}
}
if(_1424.length){
throw new Error("Could not find closing tag(s): "+_1424.toString());
}
this.contents.length=0;
return _1427;
},next_token:function(){
var token=this.contents[this.i++];
return new dd.Token(token[0],token[1]);
},delete_first_token:function(){
this.i++;
},skip_past:function(_142d){
while(this.i<this.contents.length){
var token=this.contents[this.i++];
if(token[0]==dd.TOKEN_BLOCK&&token[1]==_142d){
return;
}
}
throw new Error("Unclosed tag found when looking for "+_142d);
},create_variable_node:function(expr){
return new dd._VarNode(expr);
},create_text_node:function(expr){
return new dd._TextNode(expr||"");
},getTemplate:function(file){
return new dd.Template(file);
}});
dd.register={_registry:{attributes:[],tags:[],filters:[]},get:function(_1432,name){
var _1434=dd.register._registry[_1432+"s"];
for(var i=0,entry;entry=_1434[i];i++){
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
var _1438=dd.register._registry.attributes;
for(var i=0,entry;entry=_1438[i];i++){
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
},_any:function(type,base,_143e){
for(var path in _143e){
for(var i=0,fn;fn=_143e[path][i];i++){
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
},tags:function(base,_1445){
dd.register._any("tags",base,_1445);
},filters:function(base,_1447){
dd.register._any("filters",base,_1447);
}};
var _1448=/&/g;
var _1449=/</g;
var _144a=/>/g;
var _144b=/'/g;
var _144c=/"/g;
dd._base.escape=function(value){
return dd.mark_safe(value.replace(_1448,"&amp;").replace(_1449,"&lt;").replace(_144a,"&gt;").replace(_144c,"&quot;").replace(_144b,"&#39;"));
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
var _1450=[];
var dh=dojox.dtl.filter.htmlstrings;
value=value.replace(dh._linebreaksrn,"\n");
var parts=value.split(dh._linebreaksn);
for(var i=0;i<parts.length;i++){
var part=parts[i].replace(dh._linebreakss,"").replace(dh._linebreaksbr,"<br />");
_1450.push("<p>"+part+"</p>");
}
return _1450.join("\n\n");
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
dojox.string.sprintf=function(_145d,_145e){
for(var args=[],i=1;i<arguments.length;i++){
args.push(arguments[i]);
}
var _1461=new dojox.string.sprintf.Formatter(_145d);
return _1461.format.apply(_1461,args);
};
dojox.string.sprintf.Formatter=function(_1462){
var _1463=[];
this._mapped=false;
this._format=_1462;
this._tokens=dojox.string.tokenize(_1462,this._re,this._parseDelim,this);
};
dojo.extend(dojox.string.sprintf.Formatter,{_re:/\%(?:\(([\w_]+)\)|([1-9]\d*)\$)?([0 +\-\#]*)(\*|\d+)?(\.)?(\*|\d+)?[hlL]?([\%scdeEfFgGiouxX])/g,_parseDelim:function(_1464,_1465,flags,_1467,_1468,_1469,_146a){
if(_1464){
this._mapped=true;
}
return {mapping:_1464,intmapping:_1465,flags:flags,_minWidth:_1467,period:_1468,_precision:_1469,specifier:_146a};
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
}},e:{isDouble:true,doubleNotation:"e"},E:{extend:["e"],toUpper:true},f:{isDouble:true,doubleNotation:"f"},F:{extend:["f"]},g:{isDouble:true,doubleNotation:"g"},G:{extend:["g"],toUpper:true}},format:function(_146e){
if(this._mapped&&typeof _146e!="object"){
throw new Error("format requires a mapping");
}
var str="";
var _1470=0;
for(var i=0,token;i<this._tokens.length;i++){
token=this._tokens[i];
if(typeof token=="string"){
str+=token;
}else{
if(this._mapped){
if(typeof _146e[token.mapping]=="undefined"){
throw new Error("missing key "+token.mapping);
}
token.arg=_146e[token.mapping];
}else{
if(token.intmapping){
var _1470=parseInt(token.intmapping)-1;
}
if(_1470>=arguments.length){
throw new Error("got "+arguments.length+" printf arguments, insufficient for '"+this._format+"'");
}
token.arg=arguments[_1470++];
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
var _1476=this._specifiers[token.specifier];
if(typeof _1476=="undefined"){
throw new Error("unexpected specifier '"+token.specifier+"'");
}
if(_1476.extend){
dojo.mixin(_1476,this._specifiers[_1476.extend]);
delete _1476.extend;
}
dojo.mixin(token,_1476);
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
token.minWidth=parseInt(arguments[_1470++]);
if(isNaN(token.minWidth)){
throw new Error("the argument for * width at position "+_1470+" is not a number in "+this._format);
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
token.precision=parseInt(arguments[_1470++]);
if(isNaN(token.precision)){
throw Error("the argument for * precision at position "+_1470+" is not a number in "+this._format);
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
},zeroPad:function(token,_147c){
_147c=(arguments.length==2)?_147c:token.precision;
if(typeof token.arg!="string"){
token.arg=""+token.arg;
}
var _147d=_147c-10;
while(token.arg.length<_147d){
token.arg=(token.rightJustify)?token.arg+this._zeros10:this._zeros10+token.arg;
}
var pad=_147c-token.arg.length;
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
},spacePad:function(token,_1481){
_1481=(arguments.length==2)?_1481:token.minWidth;
if(typeof token.arg!="string"){
token.arg=""+token.arg;
}
var _1482=_1481-10;
while(token.arg.length<_1482){
token.arg=(token.rightJustify)?token.arg+this._spaces10:this._spaces10+token.arg;
}
var pad=_1481-token.arg.length;
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
arg=parseInt(arg||-1,10);
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
var _1497=[];
var width=(lines.length+"").length;
for(var i=0,line;i<lines.length;i++){
line=lines[i];
_1497.push(df.strings.ljust(i+1,width)+". "+dojox.dtl._base.escape(line));
}
return _1497.join("\n");
},ljust:function(value,arg){
value=value+"";
arg=parseInt(arg,10);
while(value.length<arg){
value=value+" ";
}
return value;
},lower:function(value){
return (value+"").toLowerCase();
},make_list:function(value){
var _149f=[];
if(typeof value=="number"){
value=value+"";
}
if(value.charAt){
for(var i=0;i<value.length;i++){
_149f.push(value.charAt(i));
}
return _149f;
}
if(typeof value=="object"){
for(var key in value){
_149f.push(value[key]);
}
return _149f;
}
return [];
},rjust:function(value,arg){
value=value+"";
arg=parseInt(arg,10);
while(value.length<arg){
value=" "+value;
}
return value;
},slugify:function(value){
value=value.replace(/[^\w\s-]/g,"").toLowerCase();
return value.replace(/[\-\s]+/g,"-");
},_strings:{},stringformat:function(value,arg){
arg=""+arg;
var _14a7=dojox.dtl.filter.strings._strings;
if(!_14a7[arg]){
_14a7[arg]=new dojox.string.sprintf.Formatter("%"+arg);
}
return _14a7[arg].format(value);
},title:function(value){
var last,title="";
for(var i=0,_14ac;i<value.length;i++){
_14ac=value.charAt(i);
if(last==" "||last=="\n"||last=="\t"||!last){
title+=_14ac.toUpperCase();
}else{
title+=_14ac.toLowerCase();
}
last=_14ac;
}
return title;
},_truncatewords:/[ \n\r\t]/,truncatewords:function(value,arg){
arg=parseInt(arg,10);
if(!arg){
return value;
}
for(var i=0,j=value.length,count=0,_14b2,last;i<value.length;i++){
_14b2=value.charAt(i);
if(dojox.dtl.filter.strings._truncatewords.test(last)){
if(!dojox.dtl.filter.strings._truncatewords.test(_14b2)){
++count;
if(count==arg){
return value.substring(0,j+1);
}
}
}else{
if(!dojox.dtl.filter.strings._truncatewords.test(_14b2)){
j=i;
}
}
last=_14b2;
}
return value;
},_truncate_words:/(&.*?;|<.*?>|(\w[\w\-]*))/g,_truncate_tag:/<(\/)?([^ ]+?)(?: (\/)| .*?)?>/,_truncate_singlets:{br:true,col:true,link:true,base:true,img:true,param:true,area:true,hr:true,input:true},truncatewords_html:function(value,arg){
arg=parseInt(arg,10);
if(arg<=0){
return "";
}
var _14b6=dojox.dtl.filter.strings;
var words=0;
var open=[];
var _14b9=dojox.string.tokenize(value,_14b6._truncate_words,function(all,word){
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
var tag=all.match(_14b6._truncate_tag);
if(!tag||words>=arg){
return;
}
var _14bd=tag[1];
var _14be=tag[2].toLowerCase();
var _14bf=tag[3];
if(_14bd||_14b6._truncate_singlets[_14be]){
}else{
if(_14bd){
var i=dojo.indexOf(open,_14be);
if(i!=-1){
open=open.slice(i+1);
}
}else{
open.unshift(_14be);
}
}
return all;
}).join("");
_14b9=_14b9.replace(/\s+$/g,"");
for(var i=0,tag;tag=open[i];i++){
_14b9+="</"+tag+">";
}
return _14b9;
},upper:function(value){
return value.toUpperCase();
},urlencode:function(value){
return dojox.dtl.filter.strings._urlquote(value);
},_urlize:/^((?:[(>]|&lt;)*)(.*?)((?:[.,)>\n]|&gt;)*)$/,_urlize2:/^\S+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+$/,urlize:function(value){
return dojox.dtl.filter.strings.urlizetrunc(value);
},urlizetrunc:function(value,arg){
arg=parseInt(arg);
return dojox.string.tokenize(value,/(\S+)/g,function(word){
var _14c9=dojox.dtl.filter.strings._urlize.exec(word);
if(!_14c9){
return word;
}
var lead=_14c9[1];
var _14cb=_14c9[2];
var trail=_14c9[3];
var _14cd=_14cb.indexOf("www.")==0;
var hasAt=_14cb.indexOf("@")!=-1;
var _14cf=_14cb.indexOf(":")!=-1;
var _14d0=_14cb.indexOf("http://")==0;
var _14d1=_14cb.indexOf("https://")==0;
var _14d2=/[a-zA-Z0-9]/.test(_14cb.charAt(0));
var last4=_14cb.substring(_14cb.length-4);
var _14d4=_14cb;
if(arg>3){
_14d4=_14d4.substring(0,arg-3)+"...";
}
if(_14cd||(!hasAt&&!_14d0&&_14cb.length&&_14d2&&(last4==".org"||last4==".net"||last4==".com"))){
return "<a href=\"http://"+_14cb+"\" rel=\"nofollow\">"+_14d4+"</a>";
}else{
if(_14d0||_14d1){
return "<a href=\""+_14cb+"\" rel=\"nofollow\">"+_14d4+"</a>";
}else{
if(hasAt&&!_14cd&&!_14cf&&dojox.dtl.filter.strings._urlize2.test(_14cb)){
return "<a href=\"mailto:"+_14cb+"\">"+_14cb+"</a>";
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
var _14d8=[];
var parts=value.split(/\s+/g);
if(parts.length){
var word=parts.shift();
_14d8.push(word);
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
_14d8.push("\n");
pos=lines[lines.length-1].length;
}else{
_14d8.push(" ");
if(lines.length>1){
pos=lines[lines.length-1].length;
}
}
_14d8.push(word);
}
}
return _14d8.join("");
}});
}
dojo.i18n._preloadLocalizations("dojo.nls.dojo-for-pion",["ROOT","en","en-gb","en-us","xx"]);
